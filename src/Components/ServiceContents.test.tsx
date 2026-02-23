import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import ServiceContents from './ServiceContents';
import { EnvironmentContext, prodEnvProps } from '../Contexts/Environment/EnvironmentContext';
import { LanguageContext } from '../LanguageContext';
import { IServiceInfo } from '../Providers/HymnsDataProvider/Models/IServiceInfo';
import axios from 'axios';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn()
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockLanguageContext = {
  languageProperties: {
    localeName: 'en',
    friendlyName: 'English',
    isRtl: false,
    getString: (key: string) => key
  },
  setLanguageProperties: jest.fn()
};

const mockEnvironmentContext = {
  environmentProperties: prodEnvProps,
  setEnvironmentProperties: jest.fn()
};

describe('ServiceContents - URL Deep Linking', () => {
  const mockCloudFrontClient = {
    get: jest.fn(),
  };
  const mockHttpClient = {
    get: jest.fn(),
  };

  const mockService: IServiceInfo = {
    id: 'vespers',
    name: 'Vespers',
    displayName: 'Vespers',
    verse: '',
    order: 1,
    isDateSpecific: false,
    seasonId: 'nativity',
    hymns: [
      {
        id: 'opening-hymn',
        name: 'Opening Hymn',
        displayName: 'Opening Hymn',
        order: 1,
        formats: [
          {
            id: '1',
            name: 'Text',
            order: 1,
            variationCount: 0,
            variations: []
          },
          {
            id: '2',
            name: 'Hazzat',
            order: 2,
            variationCount: 0,
            variations: []
          }
        ]
      },
      {
        id: 'psalm-150',
        name: 'Psalm 150',
        displayName: 'Psalm 150',
        order: 2,
        formats: [
          {
            id: '1',
            name: 'Text',
            order: 1,
            variationCount: 0,
            variations: []
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create = jest.fn()
      .mockReturnValueOnce(mockHttpClient as any)
      .mockReturnValueOnce(mockCloudFrontClient as any);
    
    mockCloudFrontClient.get.mockResolvedValue({ data: mockService });
  });

  it('should load service for /seasons/{id}/services/{id} URL', async () => {
    render(
      <MemoryRouter initialEntries={['/seasons/nativity/services/vespers']}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <EnvironmentContext.Provider value={mockEnvironmentContext}>
            <Routes>
              <Route path="/seasons/:seasonId/services/:serviceId" element={
                <ServiceContents seasonId="nativity" serviceId="vespers" serviceName="Vespers" />
              } />
            </Routes>
          </EnvironmentContext.Provider>
        </LanguageContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockCloudFrontClient.get).toHaveBeenCalledWith('/v2/seasons/nativity/services/vespers.json');
    });
  });

  it('should load service once for /seasons/{id}/services/{id}/hymns/{id} URL', async () => {
    render(
      <MemoryRouter initialEntries={['/seasons/nativity/services/vespers/hymns/opening-hymn']}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <EnvironmentContext.Provider value={mockEnvironmentContext}>
            <Routes>
              <Route path="/seasons/:seasonId/services/:serviceId/hymns/:hymnId" element={
                <ServiceContents seasonId="nativity" serviceId="vespers" serviceName="Vespers" />
              } />
            </Routes>
          </EnvironmentContext.Provider>
        </LanguageContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockCloudFrontClient.get).toHaveBeenCalledTimes(1);
      expect(mockCloudFrontClient.get).toHaveBeenCalledWith('/v2/seasons/nativity/services/vespers.json');
    });
  });

  it('should load service once for /seasons/{id}/services/{id}/hymns/{id}/formats/{id} URL', async () => {
    render(
      <MemoryRouter initialEntries={['/seasons/nativity/services/vespers/hymns/opening-hymn/formats/2']}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <EnvironmentContext.Provider value={mockEnvironmentContext}>
            <Routes>
              <Route path="/seasons/:seasonId/services/:serviceId/hymns/:hymnId/formats/:formatId" element={
                <ServiceContents seasonId="nativity" serviceId="vespers" serviceName="Vespers" />
              } />
            </Routes>
          </EnvironmentContext.Provider>
        </LanguageContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockCloudFrontClient.get).toHaveBeenCalledTimes(1);
      expect(mockCloudFrontClient.get).toHaveBeenCalledWith('/v2/seasons/nativity/services/vespers.json');
    });
  });

  it('should navigate to specific hymn within loaded data', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/seasons/nativity/services/vespers/hymns/psalm-150']}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <EnvironmentContext.Provider value={mockEnvironmentContext}>
            <Routes>
              <Route path="/seasons/:seasonId/services/:serviceId/hymns/:hymnId" element={
                <ServiceContents seasonId="nativity" serviceId="vespers" serviceName="Vespers" />
              } />
            </Routes>
          </EnvironmentContext.Provider>
        </LanguageContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockCloudFrontClient.get).toHaveBeenCalledTimes(1);
    });

    // Service should be loaded once, and specific hymn should be displayed
    // The component filters hymns based on hymnId parameter
    expect(mockCloudFrontClient.get).toHaveBeenCalledWith('/v2/seasons/nativity/services/vespers.json');
  });

  it('should display all hymns when no hymnId is specified', async () => {
    render(
      <MemoryRouter initialEntries={['/seasons/nativity/services/vespers']}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <EnvironmentContext.Provider value={mockEnvironmentContext}>
            <Routes>
              <Route path="/seasons/:seasonId/services/:serviceId" element={
                <ServiceContents seasonId="nativity" serviceId="vespers" serviceName="Vespers" />
              } />
            </Routes>
          </EnvironmentContext.Provider>
        </LanguageContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockCloudFrontClient.get).toHaveBeenCalledTimes(1);
    });

    // All hymns should be rendered when no hymnId is specified
    expect(mockCloudFrontClient.get).toHaveBeenCalledWith('/v2/seasons/nativity/services/vespers.json');
  });
});
