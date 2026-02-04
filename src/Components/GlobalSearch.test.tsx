import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
      verse: 'Glory to God in the highest',
      displayVerse: 'Glory to God in the highest',
      order: 1,
      isDateSpecific: false
    },
    {
      id: 'resurrection',
      name: 'Resurrection',
      displayName: 'Resurrection',
      verse: 'Christ is risen',
      displayVerse: 'Christ is risen',
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
      expect(screen.getByText('Nativity')).toBeInTheDocument();
    }, { timeout: 500 });

    expect(mockDataProvider.getSeasonList).toHaveBeenCalled();
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
      expect(screen.getByText('Psalm 150')).toBeInTheDocument();
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
      expect(screen.getByText('مزمور ١٥٠')).toBeInTheDocument();
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
      expect(screen.getByText('الذكصولوجية')).toBeInTheDocument();
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
      expect(screen.getByText('Gospel Response')).toBeInTheDocument();
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
      expect(screen.getByText('مزمور ١٥٠')).toBeInTheDocument();
    }, { timeout: 500 });
  });
});
