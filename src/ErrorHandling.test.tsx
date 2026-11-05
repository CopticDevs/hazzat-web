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

  let consoleSpy: jest.SpyInstance | undefined;

  const captureExpectedError = (error: Error) => {
    const originalLog = console.log;
    consoleSpy = jest.spyOn(console, 'log').mockImplementation((...args) => {
      // Only silence the exact error deliberately triggered by this test.
      if (args.length !== 1 || args[0] !== error) {
        originalLog.apply(console, args);
      }
    });
    return consoleSpy;
  };

  afterEach(() => {
    consoleSpy?.mockRestore();
    consoleSpy = undefined;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create = jest.fn()
      .mockReturnValueOnce(mockCloudFrontClient as any);
    
    provider = new HymnsDataProvider('en', 'https://api.hazzat.com', 'https://d1zhmhuei1bwco.cloudfront.net');
  });

  it('should handle network offline gracefully', async () => {
    const error = new Error('Network Error');
    const logSpy = captureExpectedError(error);
    mockCloudFrontClient.get.mockRejectedValue(error);

    const result = await provider.getSeasonList();

    // Should return empty array instead of throwing
    expect(result).toEqual([]);
    expect(logSpy.mock.calls).toEqual([[error]]);
  });

  it('should handle invalid season ID (404)', async () => {
    mockCloudFrontClient.get.mockRejectedValue(new Error('404 Not Found'));

    await expect(provider.getService('invalid-season', 'invalid-service')).rejects.toThrow('404 Not Found');
  });

  it('should handle malformed JSON data', async () => {
    const error = new Error('JSON Parse Error');
    const logSpy = captureExpectedError(error);
    mockCloudFrontClient.get.mockRejectedValue(error);

    const result = await provider.getSeasonList();

    // Should handle parse errors gracefully
    expect(result).toEqual([]);
    expect(logSpy.mock.calls).toEqual([[error]]);
  });

  it('should log errors for debugging', async () => {
    const error = new Error('Test Error');
    const logSpy = captureExpectedError(error);
    mockCloudFrontClient.get.mockRejectedValue(error);

    await provider.getSeasonList();

    // Should log error
    expect(logSpy.mock.calls).toEqual([[error]]);
  });

  it('should handle timeout errors', async () => {
    mockCloudFrontClient.get.mockRejectedValue(new Error('Timeout'));

    await expect(provider.getReferenceIndex()).rejects.toThrow('Timeout');
  });
});
