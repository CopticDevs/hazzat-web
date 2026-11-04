import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import { IHymnsDataProvider } from '../Providers/HymnsDataProvider/IHymnsDataProvider';
import { ISeasonInfo } from '../Providers/HymnsDataProvider/Models/ISeasonInfo';
import { IReferenceIndex } from '../Providers/HymnsDataProvider/Models/IReferenceIndex';
import { IServiceInfo } from '../Providers/HymnsDataProvider/Models/IServiceInfo';
import { LanguageContext } from '../LanguageContext';

const mockLanguageContext = {
  languageProperties: {
    localeName: 'en',
    friendlyName: 'English',
    isRtl: false,
    getString: (key: string) => {
      const strings: { [key: string]: string } = {
        'search': 'Search',
        'seasons': 'Seasons',
        'hymns': 'Hymns',
        'foundIn': 'Found in',
        'noSearchResults': 'No results found'
      };
      return strings[key] || key;
    }
  },
  setLanguageProperties: jest.fn()
};

describe('GlobalSearch - Search Functionality', () => {
  const mockSeasons: ISeasonInfo[] = [
    {
      id: 'nativity',
      name: 'Nativity',
      displayName: 'Nativity',
      order: 1,
      isDateSpecific: false
    },
    {
      id: 'resurrection',
      name: 'Resurrection',
      displayName: 'Resurrection',
      order: 2,
      isDateSpecific: false
    }
  ];

  const mockReferenceIndex: IReferenceIndex = {
    'psalm-150': {
      name: 'Psalm 150',
      nameAr: 'مزمور ١٥٠',
      services: ['nativity/vespers', 'resurrection/matins'],
      formats: {}
    },
    'doxology': {
      name: 'Doxology',
      nameAr: 'الذكصولوجية',
      services: ['nativity/vespers'],
      formats: {}
    },
    'gospel-response': {
      name: 'Gospel Response',
      // No Arabic name - test fallback
      services: ['nativity/vespers'],
      formats: {}
    }
  };

  const mockService1: IServiceInfo = {
    id: 'vespers',
    name: 'Vespers',
    displayName: 'Vespers',
    verse: '',
    order: 1,
    isDateSpecific: false,
    seasonId: 'nativity',
    hymns: []
  };

  const mockService2: IServiceInfo = {
    id: 'matins',
    name: 'Matins',
    displayName: 'Matins',
    verse: '',
    order: 2,
    isDateSpecific: false,
    seasonId: 'resurrection',
    hymns: []
  };

  let mockDataProvider: jest.Mocked<IHymnsDataProvider>;

  beforeEach(() => {
    mockDataProvider = {
      getSeasonList: jest.fn().mockResolvedValue(mockSeasons),
      getReferenceIndex: jest.fn().mockResolvedValue(mockReferenceIndex),
      getService: jest.fn((seasonId: string, serviceId: string) => {
        if (seasonId === 'nativity' && serviceId === 'vespers') {
          return Promise.resolve(mockService1);
        }
        if (seasonId === 'resurrection' && serviceId === 'matins') {
          return Promise.resolve(mockService2);
        }
        return Promise.resolve(undefined);
      }),
    } as any;
  });

  it('changes only the input font while a legacy Coptic word search is pending', async () => {
    let finish!: (value: any[]) => void;
    mockDataProvider.getSearchTextIndex = jest.fn(() => new Promise(resolve => { finish = resolve; }));
    render(<BrowserRouter><LanguageContext.Provider value={mockLanguageContext}><GlobalSearch dataProvider={mockDataProvider} /></LanguageContext.Provider></BrowserRouter>);
    const input = screen.getByRole('searchbox');
    expect(screen.getByRole('radio', { name: 'Normal' })).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(input, { target: { value: 'P[oic Vnou]' } });
    await screen.findByText(/0 title matches/);
    fireEvent.click(screen.getByRole('radio', { name: 'Coptic' }));
    expect(input).toHaveClass('CopticFont');
    expect(input).toHaveAttribute('dir', 'ltr');
    expect(input).toHaveValue('P[oic Vnou]');
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(mockDataProvider.getSearchTextIndex).toHaveBeenCalledTimes(1);
    await act(async () => finish([{ hymnId: 'doxology', seasonId: 'nativity', serviceId: 'vespers', passages: [{ text: 'P[oic Vnou] `nte nijom@', language: 'Coptic' }] }]));
    const snippet = document.querySelector('.search-snippet')!;
    expect(snippet).toHaveClass('CopticFont');
    expect(snippet).toHaveAttribute('lang', 'cop');
    expect(snippet.querySelector('mark')).toHaveTextContent('P[oic Vnou]');
    fireEvent.click(screen.getByRole('radio', { name: 'Normal' }));
    expect(input).not.toHaveClass('CopticFont');
    expect(input).toHaveValue('P[oic Vnou]');
    expect(snippet).toHaveClass('CopticFont');
    expect(mockDataProvider.getReferenceIndex).toHaveBeenCalledTimes(1);
    expect(mockDataProvider.getSearchTextIndex).toHaveBeenCalledTimes(1);
  });

  it('should search seasons by name', async () => {
    render(
      <BrowserRouter>
        <LanguageContext.Provider value={mockLanguageContext}>
          <GlobalSearch dataProvider={mockDataProvider} />
        </LanguageContext.Provider>
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'nativity' } });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 5, name: 'Nativity' })).toBeInTheDocument();
    }, { timeout: 500 });

    expect(mockDataProvider.getSeasonList).toHaveBeenCalled();
  });

  it('paginates title matches, keeps the page as words arrive, and resets for a new query', async () => {
    const index: IReferenceIndex = { ...mockReferenceIndex };
    for (let i = 0; i < 22; i++) index[`extra-${i}`] = { name: `Doxology ${String(i).padStart(2, '0')}`, services: ['nativity/vespers'], formats: {} };
    mockDataProvider.getReferenceIndex.mockResolvedValue(index);
    let finish!: (value: any[]) => void;
    mockDataProvider.getSearchTextIndex = jest.fn(() => new Promise(resolve => { finish = resolve; }));
    render(<BrowserRouter><LanguageContext.Provider value={mockLanguageContext}><GlobalSearch dataProvider={mockDataProvider} /></LanguageContext.Provider></BrowserRouter>);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'doxology' } });
    await screen.findByText('Showing 1–10 of 23 results');
    expect(screen.getAllByRole('heading', { level: 5 })).toHaveLength(10);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(document.querySelector('.search-spinner')).toHaveAttribute('aria-hidden', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Showing 11–20 of 23 results')).toHaveFocus();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    const first = screen.getAllByRole('heading', { level: 5 })[0].textContent;
    await act(async () => { finish([{ hymnId: 'psalm-150', seasonId: 'nativity', serviceId: 'vespers', passages: ['Sing doxology'] }]); });
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 5 })[0]).toHaveTextContent(first!);
    expect(document.querySelector('.search-spinner')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Showing 21–24 of 24 results')).toHaveFocus();
    expect(screen.getAllByRole('heading', { level: 5 })).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox'));
    await screen.findByText('Showing 1–10 of 23 results');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'psalm' } });
    await screen.findByText('Showing 1–1 of 1 results');
    expect(screen.queryByRole('navigation', { name: 'Search result pages' })).not.toBeInTheDocument();
  });

  it('resets pagination and localizes controls when the navigation language changes', async () => {
    const index: IReferenceIndex = {};
    for (let i = 0; i < 11; i++) index[`extra-${i}`] = { name: `Doxology ${i}`, services: ['nativity/vespers'], formats: {} };
    mockDataProvider.getReferenceIndex.mockResolvedValue(index);
    const view = (localeName: string) => <BrowserRouter><LanguageContext.Provider value={{ ...mockLanguageContext,
      languageProperties: { ...mockLanguageContext.languageProperties, localeName } }}><GlobalSearch dataProvider={mockDataProvider} /></LanguageContext.Provider></BrowserRouter>;
    const rendered = render(view('en'));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'doxology' } });
    await screen.findByText('Page 1 of 2');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    rendered.rerender(view('ar'));
    await screen.findByText('الصفحة 1 من 2');
    expect(screen.getByRole('button', { name: 'السابق' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'التالي' })).toBeEnabled();
  });

  it('offers opt-in phrase search with plain text snippets and an accessible result count', async () => {
    const textIndex = jest.fn().mockResolvedValue([{ hymnId: 'doxology', seasonId: 'nativity', serviceId: 'vespers', passages: ['Glory to God in the highest'] }]);
    mockDataProvider.getSearchTextIndex = textIndex;
    render(<BrowserRouter><LanguageContext.Provider value={mockLanguageContext}><GlobalSearch dataProvider={mockDataProvider} /></LanguageContext.Provider></BrowserRouter>);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'glory to god' } });
    await screen.findByText(/No results found/i);
    expect(textIndex).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox', { name: /Search hymn words/i }));
    await screen.findByText((_, element) => element?.tagName === 'P' && element.textContent === 'Glory to God in the highest');
    expect(screen.getByRole('status')).toHaveTextContent('1 result');
    expect(screen.getByRole('link', { name: /Vespers/ })).toHaveAttribute('href', '/Seasons/nativity/services/vespers/hymns/doxology');
    fireEvent.click(screen.getByRole('checkbox'));
    await screen.findByText(/No results found/i);
  });

  it('ignores an old search response after the query changes', async () => {
    let finish: (value: IReferenceIndex) => void = () => {};
    mockDataProvider.getReferenceIndex.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    render(<BrowserRouter><LanguageContext.Provider value={mockLanguageContext}><GlobalSearch dataProvider={mockDataProvider} /></LanguageContext.Provider></BrowserRouter>);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'psalm' } });
    await waitFor(() => expect(mockDataProvider.getReferenceIndex).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'doxology' } });
    await screen.findByRole('heading', { level: 5, name: 'Doxology' });
    await act(async () => { finish(mockReferenceIndex); });
    expect(screen.queryByRole('heading', { level: 5, name: 'Psalm 150' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 5, name: 'Doxology' })).toBeInTheDocument();
  });

  it('shows an explicit failure for text loading and supports retry', async () => {
    const textIndex = jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([
      { hymnId: 'doxology', seasonId: 'nativity', serviceId: 'vespers', passages: ['Glory to God'] }
    ]);
    mockDataProvider.getSearchTextIndex = textIndex;
    render(<BrowserRouter><LanguageContext.Provider value={mockLanguageContext}><GlobalSearch dataProvider={mockDataProvider} /></LanguageContext.Provider></BrowserRouter>);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'glory to god' } });
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be completed');
    expect(screen.queryByText(/No results found/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByText((_, element) => element?.tagName === 'P' && element.textContent === 'Glory to God');
    expect(textIndex).toHaveBeenCalledTimes(2);
  });

  it('clears results for punctuation-only input without fetching', async () => {
    render(<BrowserRouter><LanguageContext.Provider value={mockLanguageContext}><GlobalSearch dataProvider={mockDataProvider} /></LanguageContext.Provider></BrowserRouter>);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '!!!' } });
    expect(mockDataProvider.getReferenceIndex).not.toHaveBeenCalled();
    expect(screen.getByRole('searchbox')).toHaveAttribute('maxLength', '200');
  });

  it('shows title matches while words load, then merges ranked results without duplicates', async () => {
    let finish!: (value: any[]) => void;
    mockDataProvider.getSearchTextIndex = jest.fn(() => new Promise(resolve => { finish = resolve; }));
    render(<BrowserRouter><LanguageContext.Provider value={mockLanguageContext}><GlobalSearch dataProvider={mockDataProvider} /></LanguageContext.Provider></BrowserRouter>);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'doxology' } });
    await screen.findByRole('heading', { level: 5, name: 'Doxology' });
    expect(screen.getByRole('status')).toHaveTextContent('1 title match. Still searching hymn words');
    expect(screen.queryByText(/No results found/i)).not.toBeInTheDocument();
    await act(async () => { finish([
      { hymnId: 'psalm-150', seasonId: 'nativity', serviceId: 'vespers', passages: ['Sing the doxology'] },
      { hymnId: 'doxology', seasonId: 'nativity', serviceId: 'vespers', passages: ['Doxology words'] }
    ]); });
    await screen.findByRole('heading', { level: 5, name: 'Psalm 150' });
    expect(screen.getAllByRole('heading', { level: 5, name: 'Doxology' })).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('2 results');
    expect(screen.getAllByRole('heading', { level: 5 }).map(node => node.textContent)).toEqual(['Doxology', 'Psalm 150']);
  });

  it('waits for word completion before reporting no results when titles are empty', async () => {
    let finish!: (value: any[]) => void;
    mockDataProvider.getSearchTextIndex = jest.fn(() => new Promise(resolve => { finish = resolve; }));
    render(<BrowserRouter><LanguageContext.Provider value={mockLanguageContext}><GlobalSearch dataProvider={mockDataProvider} /></LanguageContext.Provider></BrowserRouter>);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'unknown phrase' } });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('0 title matches. Still searching hymn words'));
    expect(screen.queryByText(/No results found/i)).not.toBeInTheDocument();
    await act(async () => { finish([]); });
    await screen.findByText(/No results found/i);
  });

  it('keeps title results visible if word loading fails', async () => {
    let fail!: (error: Error) => void;
    mockDataProvider.getSearchTextIndex = jest.fn(() => new Promise((_, reject) => { fail = reject; }));
    render(<BrowserRouter><LanguageContext.Provider value={mockLanguageContext}><GlobalSearch dataProvider={mockDataProvider} /></LanguageContext.Provider></BrowserRouter>);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'doxology' } });
    await screen.findByRole('heading', { level: 5, name: 'Doxology' });
    await act(async () => { fail(new Error('offline')); });
    expect(await screen.findByRole('alert')).toHaveTextContent('Only title matches are available');
    expect(screen.getByRole('heading', { level: 5, name: 'Doxology' })).toBeInTheDocument();
    expect(screen.queryByText(/No results found/i)).not.toBeInTheDocument();
  });

  it('ignores stale word completion after changing the query or turning word search off', async () => {
    const finishes: Array<(value: any[]) => void> = [];
    mockDataProvider.getSearchTextIndex = jest.fn(() => new Promise(resolve => { finishes.push(resolve); }));
    render(<BrowserRouter><LanguageContext.Provider value={mockLanguageContext}><GlobalSearch dataProvider={mockDataProvider} /></LanguageContext.Provider></BrowserRouter>);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'psalm' } });
    await screen.findByRole('heading', { level: 5, name: 'Psalm 150' });
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'doxology' } });
    await screen.findByRole('heading', { level: 5, name: 'Doxology' });
    await act(async () => { finishes[0]([]); });
    expect(screen.queryByRole('heading', { level: 5, name: 'Psalm 150' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Still searching hymn words');
    fireEvent.click(screen.getByRole('checkbox'));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('1 result'));
    await act(async () => { finishes[1]([{ hymnId: 'psalm-150', seasonId: 'nativity', serviceId: 'vespers', passages: ['doxology'] }]); });
    expect(screen.queryByRole('heading', { level: 5, name: 'Psalm 150' })).not.toBeInTheDocument();
  });

  it('ignores old-language results and shows the current localized loading state', async () => {
    const finishes: Array<(value: any[]) => void> = [];
    mockDataProvider.getSearchTextIndex = jest.fn(() => new Promise(resolve => { finishes.push(resolve); }));
    const view = (localeName: string) => <BrowserRouter><LanguageContext.Provider value={{ ...mockLanguageContext,
      languageProperties: { ...mockLanguageContext.languageProperties, localeName } }}><GlobalSearch dataProvider={mockDataProvider} /></LanguageContext.Provider></BrowserRouter>;
    const rendered = render(view('en'));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'doxology' } });
    await screen.findByRole('heading', { level: 5, name: 'Doxology' });
    rendered.rerender(view('ar'));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('جارٍ البحث في كلمات الألحان'));
    await act(async () => { finishes[0]([]); });
    expect(screen.queryByRole('heading', { level: 5, name: 'Doxology' })).not.toBeInTheDocument();
    await act(async () => { finishes[1]([]); });
    expect(screen.getByRole('status')).toHaveTextContent('عدد النتائج: 1');
  });

  it('should search hymns using reference index', async () => {
    render(
      <BrowserRouter>
        <LanguageContext.Provider value={mockLanguageContext}>
          <GlobalSearch dataProvider={mockDataProvider} />
        </LanguageContext.Provider>
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'psalm' } });

    await waitFor(() => {
      expect(mockDataProvider.getReferenceIndex).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('should display empty state when no results found', async () => {
    render(
      <BrowserRouter>
        <LanguageContext.Provider value={mockLanguageContext}>
          <GlobalSearch dataProvider={mockDataProvider} />
        </LanguageContext.Provider>
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText(/No results found/i)).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('should debounce search input (300ms)', async () => {
    jest.useFakeTimers();

    render(
      <BrowserRouter>
        <LanguageContext.Provider value={mockLanguageContext}>
          <GlobalSearch dataProvider={mockDataProvider} />
        </LanguageContext.Provider>
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    
    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 'n' } });
    fireEvent.change(searchInput, { target: { value: 'na' } });
    fireEvent.change(searchInput, { target: { value: 'nat' } });

    // Should not have called API yet
    expect(mockDataProvider.getSeasonList).not.toHaveBeenCalled();

    // Fast-forward time by 300ms
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockDataProvider.getSeasonList).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  });

  it('should show all service references for a hymn', async () => {
    render(
      <BrowserRouter>
        <LanguageContext.Provider value={mockLanguageContext}>
          <GlobalSearch dataProvider={mockDataProvider} />
        </LanguageContext.Provider>
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'psalm-150' } });

    await waitFor(() => {
      expect(screen.getByText(/Nativity/)).toBeInTheDocument();
      expect(screen.getByText(/Vespers/)).toBeInTheDocument();
    }, { timeout: 1000 });

    // Should show both references for psalm-150
    expect(mockDataProvider.getService).toHaveBeenCalledWith('nativity', 'vespers');
    expect(mockDataProvider.getService).toHaveBeenCalledWith('resurrection', 'matins');
  });

  it('should not search with less than 2 characters', () => {
    render(
      <BrowserRouter>
        <LanguageContext.Provider value={mockLanguageContext}>
          <GlobalSearch dataProvider={mockDataProvider} />
        </LanguageContext.Provider>
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'n' } });

    // Should not trigger search
    expect(mockDataProvider.getSeasonList).not.toHaveBeenCalled();
  });

  it('should search hymns by English name', async () => {
    render(
      <BrowserRouter>
        <LanguageContext.Provider value={mockLanguageContext}>
          <GlobalSearch dataProvider={mockDataProvider} />
        </LanguageContext.Provider>
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'Psalm' } });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 5, name: 'Psalm 150' })).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('should search hymns by Arabic name when language is Arabic', async () => {
    const arabicLanguageContext = {
      languageProperties: {
        localeName: 'ar',
        friendlyName: 'العربية',
        isRtl: true,
        getString: (key: string) => key
      },
      setLanguageProperties: jest.fn()
    };

    render(
      <BrowserRouter>
        <LanguageContext.Provider value={arabicLanguageContext}>
          <GlobalSearch dataProvider={mockDataProvider} />
        </LanguageContext.Provider>
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'مزمور' } });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 5, name: 'مزمور ١٥٠' })).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('should display Arabic hymn name when language is Arabic', async () => {
    const arabicLanguageContext = {
      languageProperties: {
        localeName: 'ar',
        friendlyName: 'العربية',
        isRtl: true,
        getString: (key: string) => key
      },
      setLanguageProperties: jest.fn()
    };

    render(
      <BrowserRouter>
        <LanguageContext.Provider value={arabicLanguageContext}>
          <GlobalSearch dataProvider={mockDataProvider} />
        </LanguageContext.Provider>
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'doxology' } });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 5, name: 'الذكصولوجية' })).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('should fallback to English name when Arabic name is missing', async () => {
    const arabicLanguageContext = {
      languageProperties: {
        localeName: 'ar',
        friendlyName: 'العربية',
        isRtl: true,
        getString: (key: string) => key
      },
      setLanguageProperties: jest.fn()
    };

    render(
      <BrowserRouter>
        <LanguageContext.Provider value={arabicLanguageContext}>
          <GlobalSearch dataProvider={mockDataProvider} />
        </LanguageContext.Provider>
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'gospel' } });

    await waitFor(() => {
      // Should display English name since Arabic is not available
      expect(screen.getByRole('heading', { level: 5, name: 'Gospel Response' })).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('should search both English and Arabic names in Arabic mode', async () => {
    const arabicLanguageContext = {
      languageProperties: {
        localeName: 'ar',
        friendlyName: 'العربية',
        isRtl: true,
        getString: (key: string) => key
      },
      setLanguageProperties: jest.fn()
    };

    render(
      <BrowserRouter>
        <LanguageContext.Provider value={arabicLanguageContext}>
          <GlobalSearch dataProvider={mockDataProvider} />
        </LanguageContext.Provider>
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    // Search using English term even in Arabic mode
    fireEvent.change(searchInput, { target: { value: 'Psalm' } });

    await waitFor(() => {
      // Should still find it and display Arabic name
      expect(screen.getByRole('heading', { level: 5, name: 'مزمور ١٥٠' })).toBeInTheDocument();
    }, { timeout: 500 });
  });
});
