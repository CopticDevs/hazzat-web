import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import { searchContent } from '../Providers/HymnsDataProvider/Search';
import { IHymnsDataProvider } from '../Providers/HymnsDataProvider/IHymnsDataProvider';
import { ISearchResult } from '../Providers/HymnsDataProvider/Models/ISearchResult';

jest.mock('../Providers/HymnsDataProvider/Search', () => ({ searchContent: jest.fn() }));
const search = searchContent as jest.MockedFunction<typeof searchContent>;
const provider = { getSearchTextIndex: jest.fn() } as unknown as IHymnsDataProvider;
const season: ISearchResult = { type: 'season', season: {
    id: 'nativity', name: 'Private title', displayName: 'Private title', order: 1, isDateSpecific: false
} };
const hymn: ISearchResult = { type: 'hymn', hymn: {
    id: 'hymn-1', name: 'Private hymn', snippet: 'Private snippet', references: [
        { seasonId: 'nativity', seasonName: 'Private season', serviceId: 'matins', serviceName: 'Private service' }
    ]
} };
const events = (name: string) => (window.gtag as jest.Mock).mock.calls.filter(call => call[1] === name);
function mount() { return render(<MemoryRouter><GlobalSearch dataProvider={provider} /></MemoryRouter>); }
function query(value: string) { fireEvent.change(screen.getByRole('searchbox'), { target: { value } }); }
async function debounce() { await act(async () => { jest.advanceTimersByTime(300); }); }
function deferred() {
    let resolve!: (results: ISearchResult[]) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<ISearchResult[]>((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}
beforeEach(() => { jest.useFakeTimers(); search.mockReset(); search.mockResolvedValue([]); window.gtag = jest.fn(); });
afterEach(() => { jest.useRealTimers(); });
test('reports only completed debounced searches with bounded fields and no raw content', async () => {
    search.mockResolvedValue([season, hymn]);
    const view = mount();
    query('p'); query('private'); query('private query');
    expect(window.gtag).not.toHaveBeenCalled();
    await debounce();
    expect(search).toHaveBeenCalledTimes(1);
    expect(events('search_results')).toEqual([['event', 'search_results', {
        event_category: 'Engagement', search_mode: 'titles', result_count: 2, result_status: 'results'
    }]]);
    view.rerender(<MemoryRouter><GlobalSearch dataProvider={provider} /></MemoryRouter>);
    expect(events('search_results')).toHaveLength(1);
    expect(JSON.stringify((window.gtag as jest.Mock).mock.calls)).not.toMatch(/private/i);
    query('other query'); search.mockResolvedValue([]); await debounce();
    expect(events('search_results')[1][2]).toEqual({ event_category: 'Engagement', search_mode: 'titles', result_count: 0, result_status: 'empty' });
});
test('interim title results and failed word searches do not report a successful completed search; retry does', async () => {
    const pending = deferred();
    search.mockImplementation(async (_provider, _query, _locale, _text, onTitles) => {
        onTitles?.([season]); return pending.promise;
    });
    mount();
    fireEvent.click(screen.getByRole('checkbox'));
    query('private query'); await debounce();
    expect(screen.getByRole('button', { name: 'Private title' })).toBeInTheDocument();
    expect(events('search_results')).toHaveLength(0);
    await act(async () => pending.reject(new Error('Private failure')));
    expect(events('search_results')).toHaveLength(0);
    search.mockResolvedValue([hymn]);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' })); await debounce();
    expect(events('search_results')).toEqual([['event', 'search_results', {
        event_category: 'Engagement', search_mode: 'titles_and_text', result_count: 1, result_status: 'results'
    }]]);
});
test('successful word search counts only final results and ignores stale title callbacks', async () => {
    const old = deferred(); const current = deferred();
    const callbacks: Array<((results: ISearchResult[]) => void) | undefined> = [];
    search.mockImplementation((_provider, _query, _locale, _text, onTitles) => {
        callbacks.push(onTitles);
        return callbacks.length === 1 ? old.promise : current.promise;
    });
    mount(); fireEvent.click(screen.getByRole('checkbox'));
    query('first query'); await debounce();
    act(() => callbacks[0]?.([season]));
    expect(events('search_results')).toHaveLength(0);
    query('second query'); await debounce();
    act(() => callbacks[0]?.([season]));
    expect(screen.queryByRole('button', { name: 'Private title' })).not.toBeInTheDocument();
    act(() => callbacks[1]?.([season]));
    expect(events('search_results')).toHaveLength(0);
    await act(async () => current.resolve([season, hymn]));
    await act(async () => old.resolve([]));
    expect(events('search_results')).toEqual([['event', 'search_results', {
        event_category: 'Engagement', search_mode: 'titles_and_text', result_count: 2, result_status: 'results'
    }]]);
});
test('stale responses and unmounted requests are silent', async () => {
    const old = deferred(); const current = deferred(); const unmounted = deferred();
    search.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise).mockReturnValueOnce(unmounted.promise);
    const view = mount();
    query('old query'); await debounce(); query('current query'); await debounce();
    await act(async () => old.resolve([season]));
    expect(events('search_results')).toHaveLength(0);
    await act(async () => current.resolve([]));
    expect(events('search_results')).toHaveLength(1);
    query('last query'); await debounce(); view.unmount();
    await act(async () => unmounted.resolve([hymn]));
    expect(events('search_results')).toHaveLength(1);
});
test('initial failure and canceled debounce emit nothing', async () => {
    search.mockRejectedValue(new Error('Private failure'));
    const view = mount(); query('private query'); await debounce();
    expect(events('search_results')).toHaveLength(0);
    query('cancel me'); view.unmount(); await debounce();
    expect(search).toHaveBeenCalledTimes(1);
});
test('selections report only stable entity identifiers, and pagination never reports another completion', async () => {
    search.mockResolvedValue([season, hymn, ...Array.from({ length: 10 }, (_, i) => ({
        ...season, season: { ...season.season!, id: 'season-' + i, displayName: 'Other ' + i }
    }))]);
    mount(); query('private query'); await debounce();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(events('search_results')).toHaveLength(1);
    expect(events('search_result_select')).toHaveLength(0);
    fireEvent.click(screen.getByRole('link', { name: 'Private season → Private service' }));
    fireEvent.click(screen.getByRole('button', { name: 'Private title' }));
    expect(events('search_result_select')).toEqual([
        ['event', 'search_result_select', { event_category: 'Engagement', result_type: 'hymn', season_id: 'nativity', service_id: 'matins', hymn_id: 'hymn-1' }],
        ['event', 'search_result_select', { event_category: 'Engagement', result_type: 'season', season_id: 'nativity' }]
    ]);
    expect(JSON.stringify((window.gtag as jest.Mock).mock.calls)).not.toMatch(/private/i);
});
test.each([undefined, 'blocked', () => { throw new Error('blocked'); }])('optional analytics cannot break results or selection (%s)', async tag => {
    window.gtag = tag as typeof window.gtag;
    search.mockResolvedValue([season, hymn]);
    mount(); query('private query'); await debounce();
    fireEvent.click(screen.getByRole('link', { name: 'Private season → Private service' }));
    fireEvent.click(screen.getByRole('button', { name: 'Private title' }));
    expect(screen.getByRole('button', { name: 'Private title' })).toBeInTheDocument();
});
