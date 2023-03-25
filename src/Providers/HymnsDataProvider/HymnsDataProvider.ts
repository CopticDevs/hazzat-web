import axios, { AxiosInstance } from "axios";
import { IHymnsDataProvider } from "./IHymnsDataProvider";
import { IFormatInfo } from "./Models/IFormatInfo";
import { IHymnInfo } from "./Models/IHymnInfo";
import { ISeasonInfo } from "./Models/ISeasonInfo";
import { IServiceInfo } from "./Models/IServiceInfo";
import { ITypeInfo } from "./Models/ITypeInfo";
import { IHymnContent, IVariationInfo } from "./Models/IVariationInfo";

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

    public async getServiceHymnList(seasonId: string, serviceId: string): Promise<IHymnInfo[]> {
        try {
            const response = await this.httpClient.get<IHymnInfo[]>(`/seasons/${seasonId}/services/${serviceId}/hymns`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getServiceHymn(seasonId: string, serviceId: string, hymnId: string): Promise<IHymnInfo> {
        try {
            const response = await this.httpClient.get<IHymnInfo>(`/seasons/${seasonId}/services/${serviceId}/hymns/${hymnId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getServiceHymnFormatList(seasonId: string, serviceId: string, hymnId: string): Promise<IFormatInfo[]> {
        try {
            const response = await this.httpClient.get<IFormatInfo[]>(`/seasons/${seasonId}/services/${serviceId}/hymns/${hymnId}/formats`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getServiceHymnFormat(seasonId: string, serviceId: string, hymnId: string, formatId: string): Promise<IFormatInfo> {
        try {
            const response = await this.httpClient.get<IFormatInfo>(`/seasons/${seasonId}/services/${serviceId}/hymns/${hymnId}/formats/${formatId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getServiceHymnsFormatVariationList<T extends IHymnContent>(seasonId: string, serviceId: string, hymnId: string, formatId: string): Promise<IVariationInfo<T>[]> {
        try {
            const response = await this.httpClient.get<IVariationInfo<T>[]>(`/seasons/${seasonId}/services/${serviceId}/hymns/${hymnId}/formats/${formatId}/variations`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getServiceHymnsFormatVariation<T extends IHymnContent>(seasonId: string, serviceId: string, hymnId: string, formatId: string, variationId: string): Promise<IVariationInfo<T>> {
        try {
            const response = await this.httpClient.get<IVariationInfo<T>>(`/seasons/${seasonId}/services/${serviceId}/hymns/${hymnId}/formats/${formatId}/variations/${variationId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getTypeList(): Promise<ITypeInfo[]> {
        try {
            const response = await this.httpClient.get<ITypeInfo[]>("/types");
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }
}
