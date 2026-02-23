import { HymnsDataProvider } from './HymnsDataProvider';
import { IBookletInfo } from './Models/IBookletInfo';
import axios from 'axios';

// Mock axios module
jest.mock('axios', () => ({
  create: jest.fn()
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HymnsDataProvider - Booklets Functionality', () => {
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

  it('should fetch booklets from Azure API (not S3)', async () => {
    const mockBooklets: IBookletInfo[] = [
      {
        id: 'booklet-1',
        name: 'Holy Week Booklet',
        summary: '',
        order: 1,
        sourcePath: '',
        displayPath: '',
        printPath: '',
        thumbnailPath: '',
        fullPicturePath: '',
        releaseDate: ''
      },
      {
        id: 'booklet-2',
        name: 'Nativity Booklet',
        summary: '',
        order: 2,
        sourcePath: '',
        displayPath: '',
        printPath: '',
        thumbnailPath: '',
        fullPicturePath: '',
        releaseDate: ''
      }
    ];

    mockHttpClient.get.mockResolvedValue({ data: mockBooklets });

    const result = await provider.getBookletList();

    // Should use Azure API client (httpClient), not CloudFront client
    expect(mockHttpClient.get).toHaveBeenCalledWith('/booklets');
    expect(mockCloudFrontClient.get).not.toHaveBeenCalled();
    expect(result).toEqual(mockBooklets);
    expect(result).toHaveLength(2);
  });

  it('should fetch individual booklet from Azure API', async () => {
    const mockBooklet: IBookletInfo = {
      id: 'booklet-1',
      name: 'Holy Week Booklet',
      order: 1,
      summary: 'Complete Holy Week services',
      sourcePath: '',
      displayPath: '',
      printPath: '',
      thumbnailPath: '',
      fullPicturePath: '',
      releaseDate: ''
    };

    mockHttpClient.get.mockResolvedValue({ data: mockBooklet });

    const result = await provider.getBooklet('booklet-1');

    expect(mockHttpClient.get).toHaveBeenCalledWith('/booklets/booklet-1');
    expect(mockCloudFrontClient.get).not.toHaveBeenCalled();
    expect(result).toEqual(mockBooklet);
  });

  it('should ensure no regressions in booklets functionality', async () => {
    const mockBooklets: IBookletInfo[] = [
      {
        id: 'booklet-1',
        name: 'Holy Week Booklet',
        order: 1,
        summary: '',
        sourcePath: '',
        displayPath: '',
        printPath: '',
        thumbnailPath: '',
        fullPicturePath: '',
        releaseDate: ''
      }
    ];

    mockHttpClient.get.mockResolvedValue({ data: mockBooklets });

    const result = await provider.getBookletList();

    // Verify all expected properties are present
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('order');
    
    // Verify structure matches expected interface
    expect(typeof result[0].id).toBe('string');
    expect(typeof result[0].name).toBe('string');
    expect(typeof result[0].order).toBe('number');
  });

  it('should return empty array on booklets error', async () => {
    mockHttpClient.get.mockRejectedValue(new Error('Network error'));

    const result = await provider.getBookletList();

    expect(result).toEqual([]);
  });

  it('should throw error on individual booklet not found', async () => {
    mockHttpClient.get.mockRejectedValue(new Error('404 Not Found'));

    await expect(provider.getBooklet('invalid-id')).rejects.toThrow();
  });
});
