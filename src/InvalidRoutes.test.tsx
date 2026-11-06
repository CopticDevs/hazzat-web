import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import App from './App';
import { HymnsDataProvider } from './Providers/HymnsDataProvider/HymnsDataProvider';
import { ISeasonInfo } from './Providers/HymnsDataProvider/Models/ISeasonInfo';
import { IServiceInfo } from './Providers/HymnsDataProvider/Models/IServiceInfo';
import { ContentLanguage, ContentType } from './Providers/HymnsDataProvider/Models/IVariationInfo';
import { strings, ArabicLanguageProperties } from './l8n';
import { LanguageContext } from './LanguageContext';

jest.mock('axios', () => ({ create: jest.fn() }));
jest.mock('./Components/Header', () => () => null);
jest.mock('./Components/Footer', () => () => null);
jest.mock('./Components/RouteScroll', () => () => null);

const season: ISeasonInfo = { id: 'annual', name: 'Annual', displayName: 'Annual', order: 1, isDateSpecific: false, serviceIds: ['basil', 'empty'] };
const service: IServiceInfo = { id: 'basil', name: 'Basil', displayName: 'Basil', seasonId: 'annual', order: 1, verse: '', isDateSpecific: false,
    hymns: [{ id: 'first', name: 'First hymn', displayName: 'First hymn', order: 1, formats: [{ id: '1', name: 'Text', order: 1, variationCount: 1,
        variations: [{ id: 'standard', name: 'Standard', displayName: 'Standard', content: { contentType: ContentType.TextContent,
            paragraphs: [{ columns: [{ language: ContentLanguage.English, content: 'Route fixture words' }] }] } }] }] }] };
let navigate: ReturnType<typeof useNavigate>;
function Navigation() { navigate = useNavigate(); const location = useLocation(); return <output data-testid="location">{location.pathname}{location.search}{location.hash}</output>; }
function open(path: string) { return render(<MemoryRouter initialEntries={[path]}><Navigation /><App /></MemoryRouter>); }

beforeEach(() => {
    strings.setLanguage('en');
    jest.spyOn(HymnsDataProvider.prototype, 'getSeasonList').mockResolvedValue([season]);
    jest.spyOn(HymnsDataProvider.prototype, 'getSeason').mockImplementation(async id => id === 'annual' ? season : undefined);
    jest.spyOn(HymnsDataProvider.prototype, 'getServiceSummaryList').mockResolvedValue([service, { ...service, id: 'empty', hymns: [] }]);
    jest.spyOn(HymnsDataProvider.prototype, 'getServiceList').mockResolvedValue([service]);
    jest.spyOn(HymnsDataProvider.prototype, 'getService').mockImplementation(async (_season, id) => id === 'basil' ? service : id === 'empty' ? { ...service, id, hymns: [] } : undefined);
});
afterEach(() => { jest.restoreAllMocks(); strings.setLanguage('en'); });

it('preserves nested hymn links, query settings and Back/Forward across repeated navigation', async () => {
    open('/Seasons/annual/services/basil?lang=en&env=ppe');
    const goBack = async () => { await act(async () => navigate(-1)); };
    const goForward = async () => { await act(async () => navigate(1)); };
    for (let visit = 0; visit < 2; visit++) {
        const hymn = await screen.findByRole('link', { name: 'First hymn' });
        expect(hymn).toHaveAttribute('href', '/seasons/annual/services/basil/hymns/first/formats/1?lang=en&env=ppe');
        fireEvent.click(hymn);
        await screen.findByText('Route fixture words');
        expect(screen.getByTestId('location')).toHaveTextContent('/seasons/annual/services/basil/hymns/first/formats/1?lang=en&env=ppe');
        await goBack();
        await screen.findByRole('link', { name: 'First hymn' });
        await goForward();
        await screen.findByText('Route fixture words');
        await goBack();
    }
});

it('replaces deprecated routes in history instead of creating a redirect loop', async () => {
    open('/Fonts');
    await act(async () => navigate('/Types/legacy'));
    await screen.findByRole('link', { name: /Annual/ });
    expect(screen.getByTestId('location')).toHaveTextContent('/Seasons');
    await act(async () => navigate(-1));
    expect(screen.getByText('Coptic Fonts')).toBeInTheDocument();
    await act(async () => navigate(1));
    expect(screen.getByTestId('location')).toHaveTextContent('/Seasons');
});

it('loads the nested reader after StrictMode effect cleanup and ignores the stale request', async () => {
    let resolveStale!: (value: ISeasonInfo[]) => void;
    (HymnsDataProvider.prototype.getSeasonList as jest.Mock).mockImplementationOnce(() => new Promise(resolve => { resolveStale = resolve; }));
    render(<StrictMode><MemoryRouter initialEntries={['/Seasons/annual/services/basil/hymns/first/formats/1']}><App /></MemoryRouter></StrictMode>);
    await screen.findByText('Route fixture words');
    await act(async () => resolveStale([]));
    expect(screen.getByText('Route fixture words')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it.each([
    '/unknown', '/Search/unknown', '/ContactUs/unknown', '/Fonts/unknown', '/Fonts/HazzatFont/extra',
    '/Help/unknown', '/Help/SmallLetters/extra', '/Booklets/annual/extra', '/Booklets/unknown',
    '/Seasons/unknown', '/Seasons/annual/unknown', '/Seasons/annual/services',
    '/Seasons/annual/services/unknown', '/Seasons/annual/services/unknown/formats/1',
    '/Seasons/annual/services/unknown/hymns/first/formats/1',
    '/Seasons/annual/services/basil/extra', '/Seasons/annual/services/basil/hymns',
    '/Seasons/annual/services/basil/hymns/unknown', '/Seasons/annual/services/basil/hymns/unknown/formats/1',
    '/Seasons/annual/services/basil/formats/99', '/Seasons/annual/services/basil/formats/2',
    '/Seasons/annual/services/basil/hymns/first/formats/2', '/Seasons/annual/services/basil/formats/1/extra',
    '/Seasons/annual/services/basil/hymns/first/formats/1/extra', '/Seasons/annual/services/empty/formats/1',
    '/Seasons/annual/services/basil/hymns/%2Funknown'
])('rejects %s with the existing invalid-address message', async path => {
    open(path + '?lang=en&env=ppe');
    expect(await screen.findByText(strings.noContent)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(strings.noContent);
    expect(screen.getByRole('link', { name: strings.home })).toHaveAttribute('href', '/?lang=en&env=ppe');
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
});

it.each([
    ['/Seasons/annual/', 'First hymn'], ['/Seasons/annual/services/basil', 'First hymn'],
    ['/seasons/annual/services/basil/hymns/first/', 'First hymn'],
    ['/Seasons/annual/services/basil/formats/1', 'Route fixture words'],
    ['/Seasons/annual/services/basil/hymns/first/formats/1?lang=en#reader', 'Route fixture words'],
    ['/Booklets/annual/', 'Build your booklet'], ['/Fonts/', 'Coptic Fonts'],
    ['/Help/SmallLetters', null], ['/Seasons/annual/services/empty', 'Basil']
])('preserves valid deep link %s', async (path, content) => {
    open(path);
    if (content) expect((await screen.findAllByText(content)).length).toBeGreaterThan(0);
    else expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByText(strings.noContent)).not.toBeInTheDocument();
});

it('waits for metadata, ignores a stale season, and recovers from an invalid route', async () => {
    let resolveOld!: (value: ISeasonInfo[]) => void;
    (HymnsDataProvider.prototype.getSeasonList as jest.Mock).mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
    open('/Seasons/old/services/basil');
    expect(screen.queryByText(strings.noContent)).not.toBeInTheDocument();
    await act(async () => navigate('/Seasons/annual/services/basil'));
    await screen.findByText('First hymn');
    await act(async () => resolveOld([]));
    expect(screen.queryByText(strings.noContent)).not.toBeInTheDocument();
    await act(async () => navigate('/Seasons/annual/services/bad'));
    await screen.findByText(strings.noContent);
    await act(async () => navigate('/Seasons/annual/services/basil/hymns/first/formats/1'));
    await screen.findByText('Route fixture words');
    expect(screen.queryByText(strings.noContent)).not.toBeInTheDocument();
});

it.each(['season', 'booklet', 'service'])('reports %s load failure as retryable, not an invalid address', async kind => {
    const method = kind === 'season' ? 'getSeasonList' : kind === 'booklet' ? 'getSeason' : 'getService';
    (HymnsDataProvider.prototype[method] as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    open(kind === 'booklet' ? '/Booklets/annual' : '/Seasons/annual/services/basil/formats/1');
    await screen.findByRole('button', { name: 'Retry' });
    expect(screen.queryByText(strings.noContent)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByText(kind === 'booklet' ? 'Build your booklet' : 'Route fixture words');
});

it('localizes the error and keeps query settings in the recovery link', () => {
    strings.setLanguage('ar');
    render(<LanguageContext.Provider value={{ languageProperties: ArabicLanguageProperties }}><MemoryRouter initialEntries={['/Help/bad?lang=ar&env=ppe']}><App /></MemoryRouter></LanguageContext.Provider>);
    expect(screen.getByRole('alert')).toHaveTextContent(strings.noContent);
    expect(screen.getByRole('link', { name: strings.home })).toHaveAttribute('href', '/?lang=ar&env=ppe');
});

it.each(['/Fonts/HazzatFont', '/Help', '/Help/InstallFontWinXP', '/Help/InstallFontWin7', '/Help/UsingHazzatFont',
    '/Help/UsingVerticalHazzatFont', '/Help/CapitalLetters', '/Help/HazzatKeyboardMap', '/Search', '/ContactUs'])('preserves static route %s', path => {
    const { container } = open(path + '?lang=en&env=ppe');
    expect(screen.queryByText(strings.noContent)).not.toBeInTheDocument();
    expect(container.querySelector('main')?.innerHTML.length).toBeGreaterThan(100);
});
