import { formatType, SHARED_TYPES, validateIdentity, validateLibraryRecord, validateService, validateUuid } from './SharedContent';

const id = '11111111-1111-4111-8111-111111111111';
const identity = { schemaVersion: 5, id, name: 'Hymn' };
const makeService = (): any => ({ schemaVersion: 5, id: 'service', seasonId: 'annual', name: 'Service', order: 1,
  hymns: [{ hymnId: 'hymn', order: 1, formats: { '1': [{ contentId: id, name: 'Standard' }] } }] });

describe('shared content input validation', () => {
  it.each([null, [], 'text', 42])('rejects non-object identities: %j', value => {
    expect(() => validateIdentity(value, id)).toThrow('Invalid shared-content object');
  });
  it.each(['not-a-uuid', '11111111-1111-1111-8111-111111111111', '11111111-1111-4111-7111-111111111111'])('rejects invalid UUIDs: %s', value => {
    expect(() => validateUuid(value)).toThrow('Invalid shared-content UUID');
  });
  it('maps only supported numeric format IDs', () => {
    expect(SHARED_TYPES.map((_, i) => formatType(String(i + 1)))).toEqual(SHARED_TYPES);
    for (const invalid of ['0', '8', '01', 'Text', '']) expect(() => formatType(invalid)).toThrow('Unknown shared-content format');
  });
  it.each([
    ['order string', (s: any) => { s.order = '1'; }, 'order'],
    ['infinite order', (s: any) => { s.order = Infinity; }, 'order'],
    ['invalid verse', (s: any) => { s.verse = 7; }, 'service verse'],
    ['invalid date flag', (s: any) => { s.isDateSpecific = 'true'; }, 'service date flag'],
    ['non-string hymn ID', (s: any) => { s.hymns[0].hymnId = 7; }, 'hymn assignment'],
    ['duplicate hymn', (s: any) => { s.hymns.push(s.hymns[0]); }, 'hymn assignment'],
    ['invalid assignment order', (s: any) => { s.hymns[0].order = NaN; }, 'order'],
    ['non-array references', (s: any) => { s.hymns[0].formats['1'] = {}; }, 'content assignment'],
    ['null reference', (s: any) => { s.hymns[0].formats['1'] = [null]; }, 'object'],
    ['non-string content ID', (s: any) => { s.hymns[0].formats['1'][0].contentId = 7; }, 'content reference'],
    ['invalid format metadata', (s: any) => { s.hymns[0].formatMetadata = []; }, 'object'],
  ] as const)('rejects %s', (_, mutate, error) => {
    const service = makeService(); mutate(service);
    expect(() => validateService(service, 'annual', 'service')).toThrow(error);
  });
  it.each([-1, 0.5, '0', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid format position %s', position => {
    const service = makeService();
    service.hymns[0].formatMetadata = { '1': { name: 'Text', order: 1, position } };
    expect(() => validateService(service, 'annual', 'service')).toThrow('Invalid format position');
  });
  it('accepts optional service fields and a zero format position without altering input', () => {
    const service = makeService();
    Object.assign(service, { verse: 'Verse', isDateSpecific: true });
    service.hymns[0].formatMetadata = { '1': { name: 'Text', nameAr: '', order: 1, position: 0 } };
    expect(validateService(service, 'annual', 'service')).toBe(service);
  });
  it.each([
    ['unknown type', 'Unknown', {}, 'Unknown content type'],
    ['missing paragraphs', 'Text', {}, 'Invalid text paragraphs'],
    ['missing columns', 'Text', { paragraphs: [{}] }, 'Invalid text columns'],
    ['invalid comment', 'Text', { paragraphs: [{ columns: [], isComment: 'yes' }] }, 'Invalid text comment'],
    ['unknown language', 'Text', { paragraphs: [{ columns: [{ language: 'Klingon', content: 'text' }] }] }, 'Invalid text column'],
    ['non-string language', 'Text', { paragraphs: [{ columns: [{ language: 42, content: 'text' }] }] }, 'Invalid text column'],
    ['missing audio', 'Audio', {}, 'Missing content payload'],
    ['null music', 'MusicalNotes', { musicXml: null }, 'Invalid content payload'],
    ['numeric video', 'Video', { englishVideo: 42 }, 'Invalid content payload'],
  ] as const)('rejects %s', (_, contentType, content, error) => {
    expect(() => validateLibraryRecord({ ...identity, contentType, content }, id)).toThrow(error);
  });
  it.each([
    ['Hazzat', { arabicHazzat: null }], ['VerticalHazzat', { copticVerticalHazzat: '<p>Notes</p>' }],
    ['MusicalNotes', { musicXml: '<score-partwise />' }], ['Audio', { audioFilePath: null }],
    ['Video', { englishVideo: null, copticVideo: 'https://example.com/watch' }], ['Information', { arabicInformation: '' }],
    ['Text', { paragraphs: [{ isComment: false, columns: [{ language: 'English', content: '' }] }] }],
  ])('accepts valid %s payloads', (contentType, content) => {
    const record = { ...identity, contentType, content };
    expect(validateLibraryRecord(record, id)).toBe(record);
  });
});
