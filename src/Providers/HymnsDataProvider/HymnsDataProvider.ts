import axios, { AxiosInstance } from "axios";
import { IHymnsDataProvider } from "./IHymnsDataProvider";
import { ISeasonInfo } from "./Models/ISeasonInfo";
import { IServiceInfo } from "./Models/IServiceInfo";

export class HymnsDataProvider implements IHymnsDataProvider {
    private hazzatApiBaseUrl = "https://api.hazzat.com";
    private httpClient: AxiosInstance;

    constructor(language: string) {
        this.httpClient = axios.create({
            baseURL: this.hazzatApiBaseUrl,
            headers: {
                "Accept-Language": language
            }
        });
    }

    public async getSeasonList(): Promise<ISeasonInfo[]> {
        try {
            const response = await this.httpClient.get<ISeasonInfo[]>("/seasons");
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getSeason(seasonId: string): Promise<ISeasonInfo> {
        try {
            const response = await this.httpClient.get<ISeasonInfo>(`/seasons/${seasonId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getServiceList(seasonId: string): Promise<IServiceInfo[]> {
        try {
            const response = await this.httpClient.get<IServiceInfo[]>(`/seasons/${seasonId}/services`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getService(seasonId: string, serviceId: string): Promise<IServiceInfo> {
        try {
            const response = await this.httpClient.get<IServiceInfo>(`/seasons/${seasonId}/services/${serviceId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }
}
