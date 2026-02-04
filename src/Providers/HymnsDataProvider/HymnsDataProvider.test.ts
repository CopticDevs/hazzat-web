import { HymnsDataProvider } from './HymnsDataProvider';
import { ISeasonInfo } from './Models/ISeasonInfo';
import axios from 'axios';

// Mock axios module
jest.mock('axios', () => ({
  create: jest.fn()
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HymnsDataProvider - Seasons List Loading', () => {
  let provider: HymnsDataProvider;
  const mockCloudFrontClient = {
    get: jest.fn(),
  };
  const mockHttpClient = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create = jest.fn()
      .mockReturnValueOnce(mockHttpClient as any)
      .mockReturnValueOnce(mockCloudFrontClient as any);
    
    provider = new HymnsDataProvider('en', 'https://api.hazzat.com', 'https://d1zhmhuei1bwco.cloudfront.net');
  });

  it('should fetch seasons from S3 via CloudFront', async () => {
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

    mockCloudFrontClient.get.mockResolvedValue({ data: mockSeasons });

    const result = await provider.getSeasonList();

    expect(mockCloudFrontClient.get).toHaveBeenCalledWith('/v2/metadata/seasons.json');
    expect(result).toHaveLength(2);
    expect(result[0].displayName).toBe('Nativity');
    expect(result[0].displayVerse).toBe('Glory to God in the highest');
  });

  it('should display all season data correctly', async () => {
    const mockSeason: ISeasonInfo = {
      id: 'nativity',
      name: 'Nativity',
      displayName: 'Nativity',
      verse: 'Glory to God in the highest',
      displayVerse: 'Glory to God in the highest',
      order: 1,
      isDateSpecific: false
    };

    mockCloudFrontClient.get.mockResolvedValue({ data: [mockSeason] });

    const result = await provider.getSeasonList();

    expect(result[0]).toHaveProperty('id', 'nativity');
    expect(result[0]).toHaveProperty('displayName', 'Nativity');
    expect(result[0]).toHaveProperty('displayVerse', 'Glory to God in the highest');
  });

  it('should handle seasons with date ranges', async () => {
    const mockSeasonWithDates: ISeasonInfo = {
      id: 'great-lent',
      name: 'Great Lent',
      displayName: 'Great Lent',
      verse: 'Repent and believe',
      displayVerse: 'Repent and believe',
      order: 3,
      isDateSpecific: true,
      dateRanges: [
        {
          year: 2024,
          dateStart: '2024-02-19',
          dateEnd: '2024-04-06'
        }
      ]
    };

    mockCloudFrontClient.get.mockResolvedValue({ data: [mockSeasonWithDates] });

    const result = await provider.getSeasonList();

    expect(result[0].isDateSpecific).toBe(true);
    expect(result[0].dateRanges).toBeDefined();
    expect(result[0].dateRanges).toHaveLength(1);
    expect(result[0].dateRanges![0]).toHaveProperty('dateStart');
    expect(result[0].dateRanges![0]).toHaveProperty('dateEnd');
  });

  it('should return empty array on error', async () => {
    mockCloudFrontClient.get.mockRejectedValue(new Error('Network error'));

    const result = await provider.getSeasonList();

    expect(result).toEqual([]);
  });
});
