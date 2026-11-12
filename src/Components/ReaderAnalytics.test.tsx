import React, { useContext } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { HymnsDataProvider } from '../Providers/HymnsDataProvider/HymnsDataProvider';
import { ISeasonInfo } from '../Providers/HymnsDataProvider/Models/ISeasonInfo';
import { IServiceInfo } from '../Providers/HymnsDataProvider/Models/IServiceInfo';
import { ContentLanguage, ContentType } from '../Providers/HymnsDataProvider/Models/IVariationInfo';
import { UserSettingProvider, UserSettingsContext } from '../Contexts/UserSettingsContext';
import { ContentViewProvider } from '../Contexts/ContentViewContext';
import { LanguageContext } from '../LanguageContext';
import { AppSettings } from '../AppSettings';
import { entityViewEvents, formatViewEvents, languageViewEvents, readerFormats } from '../analytics';
import SeasonRouter from './SeasonRouter';
import ReaderContents from './ReaderContents';
import Content from './Content';

jest.mock('axios', () => ({ create: jest.fn() }));
let mockScoreFailure = false;
let mockScoreLoad = () => Promise.resolve();
jest.mock('opensheetmusicdisplay', () => ({ OpenSheetMusicDisplay: class {
    Sheet = { TitleString: '', SubtitleString: '' };
    load = () => mockScoreLoad();
    render = () => { if (mockScoreFailure) throw new Error('Score cannot render'); };
    clear = () => {};
} }));
const originalGtag = window.gtag;
const analytics = jest.fn();
let navigate: ReturnType<typeof useNavigate>;
let settings: React.ContextType<typeof UserSettingsContext>;
function Controls() {
    navigate = useNavigate();
    settings = useContext(UserSettingsContext);
    return null;
}
const season: ISeasonInfo = { id: 'annual', name: 'Annual', displayName: 'Annual', order: 1, isDateSpecific: false, serviceIds: ['vespers', 'matins'] };
const content: any[] = [
    { contentType: ContentType.TextContent, paragraphs: [{ columns: [{ language: ContentLanguage.English, content: 'Private hymn text' }] }] },
    { contentType: ContentType.HazzatContent, englishHazzat: 'Notation', arabicHazzat: '', copticHazzat: '' },
    { contentType: ContentType.VerticalHazzatContent, englishVerticalHazzat: 'Vertical notation', arabicVerticalHazzat: '', copticVerticalHazzat: '' },
    { contentType: ContentType.MusicalNotesContent, musicXml: '<score-partwise />' },
    { contentType: ContentType.AudioContent, audioFilePath: 'https://soundcloud.com/coptichazzat/meghalo' },
    { contentType: ContentType.VideoContent, englishVideo: 'video-id', arabicVideo: '', copticVideo: '' },
    { contentType: ContentType.InformationContent, englishInformation: 'Private information', arabicInformation: '' }
];
const variation = (value: any, id = 'v') => ({ id, name: 'Variation name', displayName: 'Variation name', content: value });
const formats = content.map((value, index) => ({ id: `${index + 1}`, name: 'Format', order: index, variationCount: 1, variations: [variation(value)] }));
const service: IServiceInfo = { id: 'vespers', name: 'Vespers', displayName: 'Vespers', seasonId: 'annual', order: 1, verse: '', isDateSpecific: false,
    hymns: ['first', 'second'].map((id, order) => ({ id, order, name: `Hymn ${id}`, displayName: `Hymn ${id}`, formats })) };
const base = '/seasons/annual/services/vespers';
const events = (names: string[]) => analytics.mock.calls.filter(call => names.includes(call[1]));
const entityCalls = () => events(Object.values(entityViewEvents));
const formatCalls = () => events(Object.values(formatViewEvents));
const languageCalls = () => events(Object.values(languageViewEvents));
const views = () => entityCalls().map(call => call[2]);
const flush = async () => { await act(async () => { await new Promise(resolve => setTimeout(resolve, 10)); }); };
const router = (path: string, language = AppSettings.defaultLanguage) => <React.StrictMode><MemoryRouter initialEntries={[path]}>
    <LanguageContext.Provider value={{ languageProperties: language }}><UserSettingProvider><Controls />
        <Routes><Route path="/seasons/:seasonId/*" element={<SeasonRouter />} /><Route path="*" element={<div>Elsewhere</div>} /></Routes>
    </UserSettingProvider></LanguageContext.Provider>
</MemoryRouter></React.StrictMode>;

beforeEach(() => {
    localStorage.clear(); analytics.mockClear(); window.gtag = analytics; mockScoreFailure = false; mockScoreLoad = () => Promise.resolve();
    jest.spyOn(HymnsDataProvider.prototype, 'getSeasonList').mockResolvedValue([season]);
    jest.spyOn(HymnsDataProvider.prototype, 'getServiceSummaryList').mockResolvedValue([service]);
    jest.spyOn(HymnsDataProvider.prototype, 'getService').mockImplementation(async (_season, id) => ({ ...service, id }));
    jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(600);
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => window.setTimeout(() => callback(0), 0));
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => window.clearTimeout(id));
});
afterEach(() => { jest.restoreAllMocks(); localStorage.clear(); window.gtag = originalGtag; });

it.each([
    ['/seasons/annual', { view_type: 'season', season_id: 'annual' }],
    [base, { view_type: 'service', season_id: 'annual', service_id: 'vespers' }]
])('counts only the validated landing at %s, not nested hymn links', async (path, expected) => {
    render(router(path));
    await screen.findByRole('link', { name: 'Hymn first' });
    await flush();
    expect(views()).toEqual([{ event_category: 'Engagement', ...expected }]);
    expect(entityCalls()[0][1]).toBe(entityViewEvents[expected.view_type as keyof typeof entityViewEvents]);
    expect(formatCalls()).toHaveLength(0); expect(languageCalls()).toHaveLength(0);
});

it.each(Object.entries(readerFormats))('direct hymn format %s reports canonical %s once with default languages', async (id, expected) => {
    render(router(`${base}/hymns/first/formats/${id}`));
    await waitFor(() => expect(views()).toHaveLength(1));
    await flush();
    expect(views()).toEqual([{ event_category: 'Engagement', view_type: 'hymn', season_id: 'annual', service_id: 'vespers', hymn_id: 'first',
        content_format: expected, content_languages: 'en+cop+ar', content_state: 'available' }]);
    expect(analytics.mock.calls.map(call => call[1])).toEqual(['hymn_view', formatViewEvents[expected!], 'content_languages_en_cop_ar_view']);
    expect(analytics.mock.calls.every(call => JSON.stringify(call[2]) === JSON.stringify(views()[0]))).toBe(true);
    expect(JSON.stringify(analytics.mock.calls)).not.toMatch(/Private|Variation name|video-id|soundcloud|musicXml/);
});

it('a service-wide view with several hymns and alternatives emits only one service event', async () => {
    render(router(`${base}/formats/1`));
    await waitFor(() => expect(screen.getAllByText('Private hymn text')).toHaveLength(2));
    await flush();
    expect(views()).toEqual([{ event_category: 'Engagement', view_type: 'service', season_id: 'annual', service_id: 'vespers',
        content_format: 'text', content_languages: 'en+cop+ar', content_state: 'available' }]);
    expect(analytics.mock.calls.map(call => call[1])).toEqual(['service_view', 'text_view', 'content_languages_en_cop_ar_view']);
});

it('expanded hymn direct links report the default format only when it becomes available', async () => {
    render(router(`${base}/hymns/first`));
    await screen.findByText('Private hymn text');
    await flush();
    expect(views()).toHaveLength(1);
    expect(views()[0]).toMatchObject({ view_type: 'hymn', hymn_id: 'first', content_format: 'text' });
});

it('restored choices describe preference even when a hymn lacks those translations', async () => {
    localStorage.setItem('hazzat.reader-settings', JSON.stringify({ contentLanguages: [ContentLanguage.Arabic, ContentLanguage.English] }));
    render(router(`${base}/formats/1`));
    await waitFor(() => expect(views()).toHaveLength(1));
    expect(views()[0]).toMatchObject({ content_languages: 'en+ar', content_state: 'available' });
    expect(analytics.mock.calls.map(call => call[1])).toEqual(['service_view', 'text_view', 'content_languages_en_ar_view']);
});

it.each([[[]], [[ContentLanguage.Arabic]]])('records filtered-empty preference %j without claiming rendered multilingual content', async selection => {
    localStorage.setItem('hazzat.reader-settings', JSON.stringify({ contentLanguages: selection }));
    render(router(`${base}/formats/1`));
    await waitFor(() => expect(languageCalls()).toHaveLength(1));
    expect(views()).toHaveLength(0); expect(formatCalls()).toHaveLength(0);
    expect(languageCalls()[0][1]).toBe(selection.length ? 'content_languages_ar_view' : 'content_languages_none_view');
    expect(languageCalls()[0][2]).toMatchObject({ content_languages: selection.length ? 'ar' : 'none', content_state: 'no_selected_language_content' });
    expect(screen.queryByText('Private hymn text')).not.toBeInTheDocument();
});

it.each([
    [[], 'none'], [[ContentLanguage.English], 'en'], [[ContentLanguage.Coptic], 'cop'], [[ContentLanguage.Arabic], 'ar'],
    [[ContentLanguage.English, ContentLanguage.Coptic], 'en+cop'], [[ContentLanguage.English, ContentLanguage.Arabic], 'en+ar'],
    [[ContentLanguage.Coptic, ContentLanguage.Arabic], 'cop+ar'], [[ContentLanguage.English, ContentLanguage.Coptic, ContentLanguage.Arabic], 'en+cop+ar']
])('reader usage records selection %j as %s', async (selection, combination) => {
    localStorage.setItem('hazzat.reader-settings', JSON.stringify({ contentLanguages: selection }));
    const multilingual = { ...content[0], paragraphs: [{ columns: Object.values(ContentLanguage).map(language => ({ language, content: 'Translated text' })) }] };
    jest.spyOn(HymnsDataProvider.prototype, 'getService').mockResolvedValue({ ...service, hymns: [{
        ...service.hymns![0], formats: [{ ...formats[0], variations: [variation(multilingual)] }]
    }] });
    render(router(`${base}/hymns/first/formats/1`));
    await waitFor(() => expect(languageCalls()).toHaveLength(1));
    expect(languageCalls()[0][1]).toBe(languageViewEvents[combination as keyof typeof languageViewEvents]);
    expect(languageCalls()[0][2]).toMatchObject({ content_languages: combination, content_state: combination === 'none' ? 'no_selected_language_content' : 'available' });
    expect(views()).toHaveLength(combination === 'none' ? 0 : 1);
    expect(formatCalls()).toHaveLength(combination === 'none' ? 0 : 1);
    expect(views().map(value => [value.content_languages, value.content_format, value.content_state])).toEqual(combination === 'none' ? [] : [[combination, 'text', 'available']]);
});

it('a missing translation in one service hymn does not classify available content in another as empty', async () => {
    localStorage.setItem('hazzat.reader-settings', JSON.stringify({ contentLanguages: [ContentLanguage.Arabic] }));
    const arabic = { ...content[0], paragraphs: [{ columns: [{ language: ContentLanguage.Arabic, content: 'Arabic text' }] }] };
    jest.spyOn(HymnsDataProvider.prototype, 'getService').mockResolvedValue({ ...service, hymns: [service.hymns![0], {
        ...service.hymns![1], formats: [{ ...formats[0], variations: [variation(arabic)] }]
    }] });
    render(router(`${base}/formats/1`));
    await waitFor(() => expect(views()).toHaveLength(1));
    expect(views()[0]).toMatchObject({ content_languages: 'ar', content_state: 'available' });
});

it('rerenders, settings changes, query/hash edits and navigation-language reloads do not duplicate a view', async () => {
    const view = render(router(`${base}/formats/1`));
    await waitFor(() => expect(views()).toHaveLength(1));
    act(() => { settings.setContentLanguages([ContentLanguage.English]); settings.setContentFontSize(24); });
    act(() => { document.documentElement.dataset.theme = 'dark'; });
    await act(async () => navigate(`${base}/formats/1?lang=ar#hymn`));
    view.rerender(router(`${base}/formats/1`, { ...AppSettings.defaultLanguage, localeName: 'ar' }));
    await screen.findAllByText('Private hymn text');
    await flush();
    expect(views()).toHaveLength(1);
    expect(analytics.mock.calls.filter(call => call[1] === 'change_content_languages')).toHaveLength(1);
    expect(formatCalls()).toHaveLength(1); expect(languageCalls()).toHaveLength(1);
});

it('hymn totals drill down by format and languages on the primary event without joining facets', async () => {
    render(router(`${base}/hymns/first/formats/1`));
    await waitFor(() => expect(views()).toHaveLength(1));
    act(() => settings.setContentLanguages([ContentLanguage.English]));
    await act(async () => navigate(`${base}/hymns/first/formats/2`));
    await waitFor(() => expect(views()).toHaveLength(2));
    await act(async () => navigate(`${base}/hymns/second/formats/1`));
    await waitFor(() => expect(views()).toHaveLength(3));
    expect(entityCalls().map(call => call[1])).toEqual(['hymn_view', 'hymn_view', 'hymn_view']);
    expect(views().map(view => [view.hymn_id, view.content_format, view.content_languages])).toEqual([
        ['first', 'text', 'en+cop+ar'], ['first', 'hazzat', 'en'], ['second', 'text', 'en']
    ]);
    expect(views().filter(view => view.content_format === 'text')).toHaveLength(2);
    expect(views().filter(view => view.content_format === 'hazzat')).toHaveLength(1);
    expect(views().every(view => view.season_id === 'annual' && view.service_id === 'vespers' && view.content_state === 'available')).toBe(true);
    expect(formatCalls()).toHaveLength(3); expect(languageCalls()).toHaveLength(3);
    expect(analytics.mock.calls.filter(call => call[1] === 'change_content_languages')).toHaveLength(1);
});

it('an initially filtered-empty reader waits to count its entity and format until content is available', async () => {
    localStorage.setItem('hazzat.reader-settings', JSON.stringify({ contentLanguages: [] }));
    render(router(`${base}/hymns/first/formats/1`));
    await waitFor(() => expect(languageCalls()).toHaveLength(1));
    expect(views()).toHaveLength(0); expect(formatCalls()).toHaveLength(0);
    expect(languageCalls()[0][1]).toBe('content_languages_none_view');
    act(() => settings.setContentLanguages([ContentLanguage.English]));
    await waitFor(() => expect(views()).toHaveLength(1));
    expect(entityCalls()[0][1]).toBe('hymn_view');
    expect(views()[0]).toMatchObject({ hymn_id: 'first', content_format: 'text', content_languages: 'en', content_state: 'available' });
    expect(formatCalls().map(call => call[1])).toEqual(['text_view']);
    act(() => settings.setContentLanguages([]));
    act(() => settings.setContentLanguages([ContentLanguage.English]));
    await flush();
    expect(views()).toHaveLength(1); expect(formatCalls()).toHaveLength(1); expect(languageCalls()).toHaveLength(1);
});

it('format changes, Back/Forward, leaving/returning and reloads each count another valid visit', async () => {
    const initial = `${base}/hymns/first/formats/1`;
    const view = render(router(initial));
    await waitFor(() => expect(views()).toHaveLength(1));
    await act(async () => navigate(`${base}/hymns/first/formats/2`));
    await waitFor(() => expect(views()).toHaveLength(2));
    await act(async () => navigate(-1));
    await waitFor(() => expect(views()).toHaveLength(3));
    await act(async () => navigate(1));
    await waitFor(() => expect(views()).toHaveLength(4));
    await act(async () => navigate('/elsewhere'));
    await act(async () => navigate(initial));
    await waitFor(() => expect(views()).toHaveLength(5));
    view.unmount(); render(router(initial));
    await waitFor(() => expect(views()).toHaveLength(6));
    expect(views().map(value => value.content_format)).toEqual(['text', 'hazzat', 'text', 'hazzat', 'text', 'text']);
    expect(formatCalls()).toHaveLength(6); expect(languageCalls()).toHaveLength(6);
    expect(analytics.mock.calls.some(call => ['page_view', 'content_view'].includes(call[1]))).toBe(false);
});

it.each(['/seasons/missing', `${base}/nonsense`, '/seasons/annual/services/missing', `${base}/hymns/missing`, `${base}/hymns/missing/formats/1`, `${base}/formats/8`])('invalid route %s never counts a successful view', async path => {
    render(router(path));
    await screen.findByText(/page you are looking for is not found/i);
    await flush();
    expect(views()).toEqual([]); expect(formatCalls()).toHaveLength(0); expect(languageCalls()).toHaveLength(0);
});

it.each(['season', 'summary', 'service'])('failed %s load emits nothing until retry succeeds', async kind => {
    const load = kind === 'season' ? jest.spyOn(HymnsDataProvider.prototype, 'getSeasonList')
        : kind === 'summary' ? jest.spyOn(HymnsDataProvider.prototype, 'getServiceSummaryList') : jest.spyOn(HymnsDataProvider.prototype, 'getService');
    load.mockRejectedValue(new Error('Private failure'));
    render(router(kind === 'summary' ? '/seasons/annual' : `${base}/formats/1`));
    await screen.findByRole('alert');
    expect(views()).toEqual([]); expect(formatCalls()).toHaveLength(0); expect(languageCalls()).toHaveLength(0);
    if (kind === 'season') jest.spyOn(HymnsDataProvider.prototype, 'getSeasonList').mockResolvedValue([season]);
    else if (kind === 'summary') jest.spyOn(HymnsDataProvider.prototype, 'getServiceSummaryList').mockResolvedValue([service]);
    else jest.spyOn(HymnsDataProvider.prototype, 'getService').mockResolvedValue(service);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(views()).toHaveLength(1));
    expect(JSON.stringify(views())).not.toContain('Private failure');
});

it('metadata without actual format content is not a successful reader view', async () => {
    jest.spyOn(HymnsDataProvider.prototype, 'getService').mockResolvedValue({ ...service, hymns: [{ ...service.hymns![0], formats: [{ ...formats[0], variations: [] }] }] });
    render(router(`${base}/formats/1`));
    await screen.findByText('Hymn first'); await flush();
    expect(views()).toEqual([]); expect(formatCalls()).toHaveLength(0); expect(languageCalls()).toHaveLength(0);
});

it('a declared but unavailable format is an invalid route, not a content view', async () => {
    jest.spyOn(HymnsDataProvider.prototype, 'getService').mockResolvedValue({ ...service, hymns: [{ ...service.hymns![0], formats: [formats[0]] }] });
    render(router(`${base}/formats/2`));
    await screen.findByText(/page you are looking for is not found/i); await flush();
    expect(views()).toEqual([]); expect(formatCalls()).toHaveLength(0); expect(languageCalls()).toHaveLength(0);
});

it('late results after navigation or unmount do not count', async () => {
    let resolve!: (value: IServiceInfo) => void;
    jest.spyOn(HymnsDataProvider.prototype, 'getService').mockImplementation((_season, id) => id === 'vespers'
        ? new Promise(done => { resolve = done; }) : Promise.resolve({ ...service, id }));
    const view = render(router(`${base}/formats/1`));
    await waitFor(() => expect(resolve).toBeDefined());
    await act(async () => navigate('/seasons/annual/services/matins/formats/1'));
    await waitFor(() => expect(views()).toHaveLength(1));
    await act(async () => resolve(service)); await flush();
    expect(views()[0].service_id).toBe('matins'); expect(views()).toHaveLength(1);
    await act(async () => navigate(`${base}/formats/1`));
    await screen.findByText('Loading...');
    view.unmount(); await act(async () => resolve(service));
    expect(views()).toHaveLength(1);
});

it('failed or unrendered musical notes do not count, successful visible rendering does', async () => {
    mockScoreFailure = true;
    const view = render(router(`${base}/formats/4`));
    await screen.findAllByText('Score cannot render'); await flush();
    expect(views()).toEqual([]); expect(formatCalls()).toHaveLength(0); expect(languageCalls()).toHaveLength(0); view.unmount();
    mockScoreFailure = false;
    let finish!: () => void;
    mockScoreLoad = () => new Promise(resolve => { finish = resolve; });
    render(router(`${base}/hymns/first/formats/4`));
    await waitFor(() => expect(finish).toBeDefined());
    expect(views()).toEqual([]); expect(formatCalls()).toHaveLength(0); expect(languageCalls()).toHaveLength(0);
    await act(async () => finish());
    await waitFor(() => expect(views()).toHaveLength(1));
});

it('language changes during score loading use the current selection, and stale default hymn scores stay silent', async () => {
    const finishes: (() => void)[] = [];
    mockScoreLoad = () => new Promise(resolve => finishes.push(resolve));
    jest.spyOn(HymnsDataProvider.prototype, 'getService').mockResolvedValue({ ...service, hymns: service.hymns!.map(hymn => ({ ...hymn, formats: [formats[3]] })) });
    render(router(`${base}/hymns/first`));
    await waitFor(() => expect(finishes.length).toBeGreaterThan(0));
    act(() => settings.setContentLanguages([ContentLanguage.Coptic]));
    const old = [...finishes];
    await act(async () => navigate(`${base}/hymns/second`));
    await waitFor(() => expect(finishes.length).toBeGreaterThan(old.length));
    await act(async () => old.forEach(finish => finish())); await flush();
    expect(views()).toEqual([]); expect(formatCalls()).toHaveLength(0); expect(languageCalls()).toHaveLength(0);
    await act(async () => finishes.slice(old.length).forEach(finish => finish()));
    await waitFor(() => expect(views()).toHaveLength(1));
    expect(views()[0]).toMatchObject({ hymn_id: 'second', content_format: 'musical_notes', content_languages: 'cop', content_state: 'available' });
});

it.each(['missing', 'non-callable', 'throwing'])('reader stays usable with %s analytics', async mode => {
    if (mode === 'missing') delete window.gtag;
    else if (mode === 'non-callable') window.gtag = {};
    else window.gtag = () => { throw new Error('Blocked'); };
    render(router(`${base}/hymns/first/formats/1`));
    await screen.findByText('Private hymn text'); await flush();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('replacing a pending Content load never reports old content as ready', async () => {
    const ready = jest.fn();
    let finish!: (value: any[]) => void;
    const pending = () => new Promise<any[]>(resolve => { finish = resolve; });
    const loaded = async () => [variation(content[0])];
    const view = render(<Content formatId="1" variationsCallback={loaded} onContentState={ready} />);
    await waitFor(() => expect(ready).toHaveBeenCalledWith('available', 'en+cop+ar'));
    ready.mockClear();
    view.rerender(<Content formatId="1" variationsCallback={pending} onContentState={ready} />);
    await flush(); expect(ready).not.toHaveBeenCalled();
    view.unmount(); await act(async () => finish([variation(content[0])]));
    expect(ready).not.toHaveBeenCalled();
});

it('invalid or empty audio metadata cannot masquerade as a displayed audio format', async () => {
    render(<MemoryRouter><ContentViewProvider><ReaderContents formatId="5" view={{ view_type: 'service', season_id: 'annual', service_id: 'vespers' }}
        entries={[{ id: 'a', title: 'Empty audio', variations: [variation({ ...content[4], audioFilePath: 'https://invalid.example/file.mp3' })] }]} />
    </ContentViewProvider></MemoryRouter>);
    await screen.findByText('Empty audio'); await flush(); expect(views()).toEqual([]); expect(formatCalls()).toHaveLength(0); expect(languageCalls()).toHaveLength(0);
});
