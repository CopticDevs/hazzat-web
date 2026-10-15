import { sharedServiceFixture } from "../../testSupport/sharedServiceFixture";
import axios, { AxiosInstance } from "axios";
import { HymnsDataProvider } from "./HymnsDataProvider";
import { ISeasonInfo } from "./Models/ISeasonInfo";
import { IServiceInfo } from "./Models/IServiceInfo";

jest.mock("axios", () => ({
    create: jest.fn()
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("HymnsDataProvider - season booklet data", () => {
    let provider: HymnsDataProvider;
    const mockCloudFrontClient = {
        get: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockedAxios.create = jest.fn()
            .mockReturnValueOnce(mockCloudFrontClient as unknown as AxiosInstance);

        provider = new HymnsDataProvider("en", "https://api.hazzat.com", "https://d1zhmhuei1bwco.cloudfront.net");
    });

    it("loads booklet seasons from S3 metadata without the old Azure booklets API", async () => {
        const seasons: ISeasonInfo[] = [
            {
                id: "nativity",
                name: "Nativity",
                displayName: "Nativity",
                verse: "",
                displayVerse: "",
                order: 1,
                isDateSpecific: false,
                serviceIds: ["vespers"]
            }
        ];

        mockCloudFrontClient.get.mockResolvedValueOnce({ data: seasons });

        const result = await provider.getSeasonList();

        expect(mockCloudFrontClient.get).toHaveBeenCalledWith("/v4/metadata/seasons.json");
        expect(mockedAxios.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual(seasons);
    });

    it("loads booklet service files from S3 without calling /booklets", async () => {
        const seasons: ISeasonInfo[] = [
            {
                id: "nativity",
                name: "Nativity",
                displayName: "Nativity",
                verse: "",
                displayVerse: "",
                order: 1,
                isDateSpecific: false,
                serviceIds: ["vespers"]
            }
        ];
        const service: IServiceInfo = {
            id: "vespers",
            name: "Vespers",
            displayName: "Vespers",
            verse: "",
            order: 1,
            isDateSpecific: false,
            seasonId: "nativity",
            hymns: []
        };

        mockCloudFrontClient.get.mockImplementation(sharedServiceFixture(service, { "/v4/metadata/seasons.json": seasons }));

        const result = await provider.getServiceList("nativity");

        expect(mockCloudFrontClient.get).toHaveBeenCalledWith("/v4/metadata/seasons.json");
        expect(mockCloudFrontClient.get).toHaveBeenCalledWith("/v4/seasons/nativity/services/vespers.json");
        expect(mockedAxios.create).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(mockCloudFrontClient.get.mock.calls)).not.toContain("/booklets");
        expect(result).toEqual([{ ...service, schemaVersion: 4, nameAr: undefined }]);
    });

    it("does not expose legacy booklet endpoints on the provider", () => {
        expect("getBookletList" in provider).toBe(false);
        expect("getBooklet" in provider).toBe(false);
    });
});
