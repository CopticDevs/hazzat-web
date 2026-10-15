import { HymnsDataProvider } from './Providers/HymnsDataProvider/HymnsDataProvider';
import axios from 'axios';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn()
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Error Handling Tests', () => {
  let provider: HymnsDataProvider;
  const mockCloudFrontClient = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create = jest.fn()
      .mockReturnValueOnce(mockCloudFrontClient as any);
    
    provider = new HymnsDataProvider('en', 'https://api.hazzat.com', 'https://d1zhmhuei1bwco.cloudfront.net');
  });

  it('should handle network offline gracefully', async () => {
    mockCloudFrontClient.get.mockRejectedValue(new Error('Network Error'));

    const result = await provider.getSeasonList();

    // Should return empty array instead of throwing
    expect(result).toEqual([]);
  });

  it('should handle invalid season ID (404)', async () => {
    mockCloudFrontClient.get.mockRejectedValue(new Error('404 Not Found'));

    await expect(provider.getService('invalid-season', 'invalid-service')).rejects.toThrow('404 Not Found');
  });

  it('should handle malformed JSON data', async () => {
    mockCloudFrontClient.get.mockRejectedValue(new Error('JSON Parse Error'));

    const result = await provider.getSeasonList();

    // Should handle parse errors gracefully
    expect(result).toEqual([]);
  });

  it('should log errors for debugging', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    mockCloudFrontClient.get.mockRejectedValue(new Error('Test Error'));

    await provider.getSeasonList();

    // Should log error
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle timeout errors', async () => {
    mockCloudFrontClient.get.mockRejectedValue(new Error('Timeout'));

    await expect(provider.getReferenceIndex()).rejects.toThrow('Timeout');
  });
});
