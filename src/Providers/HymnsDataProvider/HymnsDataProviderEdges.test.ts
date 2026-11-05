import axios from 'axios';
import { ContentType } from './Models/IVariationInfo';
import { ContentResourceClient } from './ContentResourceClient';
import { HymnsDataProvider } from './HymnsDataProvider';

jest.mock('axios', () => ({ create: jest.fn() }));
const season = { id: 'annual', name: 'Annual', order: 1, serviceIds: ['late', 'early'] };
const service = (id: string, order: number) => ({ schemaVersion: 5, id, seasonId: 'annual', name: id, order, hymns: [] });
let files: Record<string, unknown>;
let get: jest.Mock;
const provider = (language = 'en') => new HymnsDataProvider(language, '', 'https://provider-edges.example');
beforeEach(() => {
  ContentResourceClient.clear();
  files = { '/v5/metadata/seasons.json': [season], '/v5/seasons/annual/services/late.json': service('late', 2), '/v5/seasons/annual/services/early.json': service('early', 1) };
  get = jest.fn(async (path: string) => {
    if (!(path in files)) throw new Error(`Missing ${path}`);
    return { data: files[path] };
  });
  (axios.create as jest.Mock).mockReturnValue({ get });
});
afterEach(() => jest.restoreAllMocks());

it('sorts complete services and summaries, and handles unknown or empty seasons', async () => {
  const source = provider();
  expect((await source.getServiceList('annual')).map(s => s.id)).toEqual(['early', 'late']);
  expect((await source.getServiceSummaryList('annual')).map(s => s.id)).toEqual(['early', 'late']);
  expect(await source.getServiceList('missing')).toEqual([]);
  expect(await source.getServiceSummaryList('missing')).toEqual([]);
  files['/v5/metadata/seasons.json'] = [{ ...season, serviceIds: undefined }];
  ContentResourceClient.clear();
  expect(await provider().getServiceList('annual')).toEqual([]);
});
it('rejects malformed season metadata when callers request errors and otherwise falls back', async () => {
  files['/v5/metadata/seasons.json'] = {};
  const source = provider();
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  await expect(source.getSeasonList({ throwOnError: true })).rejects.toThrow('Invalid season metadata');
  await expect(source.getSeason('annual', { throwOnError: true })).rejects.toThrow('Invalid season metadata');
  expect(await source.getSeason('annual')).toBeUndefined();
  expect(await source.getSeasonList()).toEqual([]);
  expect(log).toHaveBeenCalledTimes(2);
  expect(log.mock.calls[0][0]).toEqual(new Error('Invalid season metadata'));
});
it('falls back to English and caches translation failure without losing services', async () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  const source = provider('ar');
  expect((await source.getSeasonList())[0].displayName).toBe('Annual');
  expect((await source.getServiceSummary('annual', 'early'))?.displayName).toBe('early');
  expect(get.mock.calls.filter(([path]) => path.endsWith('seasons.ar.json'))).toHaveLength(1);
  expect(log).toHaveBeenCalledWith('Failed to load Arabic translations:', expect.any(Error));
});
it('rejects invalid reference paths and missing hymn references instead of returning partial indexes', async () => {
  files['/v5/metadata/hymn-references.json'] = { hymn: { name: 'Hymn', services: ['invalid/path/extra'], formats: {} } };
  await expect(provider().getReferenceIndex()).rejects.toThrow('Invalid service reference');
  files['/v5/metadata/hymn-references.json'] = {};
  files['/v5/seasons/annual/services/early.json'] = { ...service('early', 1), hymns: [{ hymnId: 'missing', order: 1, formats: {} }] };
  await expect(provider().getReferenceIndex()).rejects.toThrow('Missing hymn reference: missing');
});
it('retrieves hymns, formats and variations and handles absent optional collections', async () => {
  const source = provider();
  const variation = { id: 'variation', name: 'Standard', displayName: 'Standard', order: 1, content: { contentType: ContentType.TextContent, paragraphs: [] } };
  const hymn = { id: 'hymn', name: 'Hymn', displayName: 'Hymn', order: 1, formats: [{ id: '1', name: 'Text', order: 1, variationCount: 1, variations: [variation] }] };
  jest.spyOn(source, 'getService').mockResolvedValue({ ...service('early', 1), displayName: 'early', verse: '', isDateSpecific: false, hymns: [hymn] });
  expect(await source.getServiceHymn('annual', 'early', 'hymn')).toBe(hymn);
  expect(await source.getServiceHymnFormatList('annual', 'early', 'hymn')).toBe(hymn.formats);
  expect(await source.getServiceHymnFormat('annual', 'early', 'hymn', '1')).toBe(hymn.formats[0]);
  expect(await source.getServiceHymnsFormatVariationList('annual', 'early', 'hymn', '1')).toEqual([variation]);
  expect(await source.getServiceHymnsFormatVariationList('annual', 'early', 'hymn', '2')).toEqual([]);
  await expect(source.getServiceHymn('annual', 'early', 'missing')).rejects.toThrow('Hymn not found');
  jest.spyOn(source, 'getServiceHymn').mockResolvedValue({ ...hymn, formats: undefined });
  expect(await source.getServiceHymnFormatList('annual', 'early', 'hymn')).toEqual([]);
  jest.spyOn(source, 'getService').mockResolvedValue(undefined);
  expect(await source.getServiceHymnList('annual', 'early')).toEqual([]);
});
it('fails explicitly when a service dependency yields no result', async () => {
  const source = provider();
  jest.spyOn(source, 'getService').mockResolvedValue(undefined);
  await expect(source.getServiceList('annual')).rejects.toThrow('Unable to load service: annual/late');
  jest.spyOn(source, 'getServiceSummary').mockResolvedValue(undefined);
  await expect(source.getServiceSummaryList('annual')).rejects.toThrow('Service summary not found');
});
