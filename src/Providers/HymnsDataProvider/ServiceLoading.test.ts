import { assignedFormatFixture, sharedServiceFixture } from "../../testSupport/sharedServiceFixture";
import { HymnsDataProvider } from './HymnsDataProvider';
import { IServiceInfo } from './Models/IServiceInfo';
import { IHymnInfo } from './Models/IHymnInfo';
import type { ContentLanguage, ContentType, ITextContent, IVariationInfo } from './Models/IVariationInfo';
import axios, { AxiosInstance } from 'axios';

// Mock axios module
jest.mock('axios', () => ({
  create: jest.fn()
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HymnsDataProvider - Service Loading and Hymn Rendering', () => {
  let provider: HymnsDataProvider;
  const mockCloudFrontClient = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create = jest.fn()
      .mockReturnValueOnce(mockCloudFrontClient as unknown as AxiosInstance);

    provider = new HymnsDataProvider('en', 'https://api.hazzat.com', 'https://d1zhmhuei1bwco.cloudfront.net');
  });

  it('should fetch service with embedded hymns from S3', async () => {
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
          id: 'hymn-1',
          name: 'Opening Hymn',
          displayName: 'Opening Hymn',
          order: 1,
          formats: []
        },
        {
          id: 'hymn-2',
          name: 'Psalm',
          displayName: 'Psalm',
          order: 2,
          formats: []
        }
      ]
    };

    mockCloudFrontClient.get.mockImplementation(sharedServiceFixture(mockService));

    const result = await provider.getService('nativity', 'vespers');

    expect(mockCloudFrontClient.get).toHaveBeenCalledWith('/v4/seasons/nativity/services/vespers.json');
    expect(result).toBeDefined();
    expect(result?.hymns).toHaveLength(2);
    expect(result?.seasonId).toBe('nativity');
    expect(result?.displayName).toBe('Vespers');
  });

  it('should verify all hymns render correctly', async () => {
    const mockHymns: IHymnInfo[] = [
      {
        id: 'hymn-1',
        name: 'Opening Hymn',
        displayName: 'Opening Hymn',
        order: 1,
        formats: [
          assignedFormatFixture('1', 'Text', 1),
          assignedFormatFixture('2', 'Hazzat', 2)
        ]
      },
      {
        id: 'hymn-2',
        name: 'Psalm',
        displayName: 'Psalm',
        order: 2,
        formats: [
          assignedFormatFixture('1', 'Text', 1)
        ]
      }
    ];

    const mockService: IServiceInfo = {
      id: 'vespers',
      name: 'Vespers',
      displayName: 'Vespers',
      verse: '',
      order: 1,
      isDateSpecific: false,
      seasonId: 'nativity',
      hymns: mockHymns
    };

    mockCloudFrontClient.get.mockImplementation(sharedServiceFixture(mockService));

    const result = await provider.getService('nativity', 'vespers');

    expect(result?.hymns).toHaveLength(2);
    result?.hymns?.forEach((hymn) => {
      expect(hymn).toHaveProperty('id');
      expect(hymn).toHaveProperty('displayName');
      expect(hymn).toHaveProperty('order');
      expect(hymn).toHaveProperty('formats');
      expect(hymn.formats?.length).toBeGreaterThan(0);
    });
  });

  it('should test all format types (Text, Hazzat, VerticalHazzat, Information)', async () => {
    const mockHymn: IHymnInfo = {
      id: 'hymn-1',
      name: 'Complete Hymn',
      displayName: 'Complete Hymn',
      order: 1,
      formats: [
        assignedFormatFixture('1', 'Text', 1),
        assignedFormatFixture('2', 'Hazzat', 2),
        assignedFormatFixture('3', 'VerticalHazzat', 3),
        assignedFormatFixture('4', 'MusicalNotes', 4),
        assignedFormatFixture('5', 'Audio', 5),
        assignedFormatFixture('6', 'Video', 6),
        assignedFormatFixture('7', 'Information', 7)
      ]
    };

    const mockService: IServiceInfo = {
      id: 'vespers',
      name: 'Vespers',
      displayName: 'Vespers',
      verse: '',
      order: 1,
      isDateSpecific: false,
      seasonId: 'nativity',
      hymns: [mockHymn]
    };

    mockCloudFrontClient.get.mockImplementation(sharedServiceFixture(mockService));

    const result = await provider.getService('nativity', 'vespers');

    const hymn = result?.hymns?.[0];
    expect(hymn?.formats).toHaveLength(7);
    
    // Verify all format types are present
    const formatIds = hymn?.formats?.map(f => f.id);
    expect(formatIds).toContain('1'); // Text
    expect(formatIds).toContain('2'); // Hazzat
    expect(formatIds).toContain('3'); // VerticalHazzat
    expect(formatIds).toContain('7'); // Information
  });

  it('should test multi-language display', async () => {
    const mockVariation: IVariationInfo<ITextContent> = {
      id: '1',
      name: 'Standard',
      displayName: 'Standard',
      content: {
        contentType: 'TextContent' as ContentType,
        paragraphs: [
          {
            columns: [
              { content: 'Glory to God', language: 'English' as ContentLanguage },
              { content: 'Ⲇⲟⲝⲁ Ⲡⲁⲧⲣⲓ', language: 'Coptic' as ContentLanguage },
              { content: 'المجد للآب', language: 'Arabic' as ContentLanguage }
            ]
          }
        ]
      }
    };

    const mockHymn: IHymnInfo = {
      id: 'hymn-1',
      name: 'Doxology',
      displayName: 'Doxology',
      order: 1,
      formats: [
        {
          id: '1',
          name: 'Text',
          order: 1,
          variationCount: 1,
          variations: [mockVariation]
        }
      ]
    };

    const mockService: IServiceInfo = {
      id: 'vespers',
      name: 'Vespers',
      displayName: 'Vespers',
      verse: '',
      order: 1,
      isDateSpecific: false,
      seasonId: 'nativity',
      hymns: [mockHymn]
    };

    mockCloudFrontClient.get.mockImplementation(sharedServiceFixture(mockService));

    const result = await provider.getService('nativity', 'vespers');

    const variation = result?.hymns?.[0]?.formats?.[0]?.variations?.[0];
    const textContent = variation?.content as ITextContent | undefined;
    const paragraph = textContent?.paragraphs[0];
    
    expect(paragraph?.columns).toHaveLength(3);
    expect(paragraph?.columns[0].language).toBe('English');
    expect(paragraph?.columns[1].language).toBe('Coptic');
    expect(paragraph?.columns[2].language).toBe('Arabic');
  });

  it('rejects an unavailable v4 service without a legacy fallback', async () => {
    mockCloudFrontClient.get.mockRejectedValue(new Error('404 Not Found'));

    await expect(provider.getService('invalid', 'invalid')).rejects.toThrow('404 Not Found');
  });
});
