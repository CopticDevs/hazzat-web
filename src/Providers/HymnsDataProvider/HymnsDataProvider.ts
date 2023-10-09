import axios, { AxiosInstance } from "axios";
import { IHymnsDataProvider } from "./IHymnsDataProvider";
import { IBookletInfo } from "./Models/IBookletInfo";
import { IFormatInfo } from "./Models/IFormatInfo";
import { IHymnInfo, IHymnInfoWithServiceDetails } from "./Models/IHymnInfo";
import { ISeasonInfo } from "./Models/ISeasonInfo";
import { IServiceInfo } from "./Models/IServiceInfo";
import { ITuneInfo } from "./Models/ITuneInfo";
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

    public async getSeason(seasonId: string): Promise<ISeasonInfo | undefined> {
        try {
            const response = await this.httpClient.get<ISeasonInfo>(`/seasons/${seasonId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return undefined;
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

    public async getService(seasonId: string, serviceId: string): Promise<IServiceInfo | undefined> {
        try {
            const response = await this.httpClient.get<IServiceInfo>(`/seasons/${seasonId}/services/${serviceId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return undefined;
        }
    }

    public async getServiceHymnList(seasonId: string, serviceId: string): Promise<IHymnInfo[]> {
        try {
            const response = await this.httpClient.get<IHymnInfo[]>(`/seasons/${seasonId}/services/${serviceId}/hymns`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
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
            return [];
        }
    }

    public async getServiceHymnFormat(seasonId: string, serviceId: string, hymnId: string, formatId: string): Promise<IFormatInfo | undefined> {
        try {
            const response = await this.httpClient.get<IFormatInfo>(`/seasons/${seasonId}/services/${serviceId}/hymns/${hymnId}/formats/${formatId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return undefined;
        }
    }

    public async getServiceHymnsFormatVariationList<T extends IHymnContent>(seasonId: string, serviceId: string, hymnId: string, formatId: string): Promise<IVariationInfo<T>[]> {
        try {
            const response = await this.httpClient.get<IVariationInfo<T>[]>(`/seasons/${seasonId}/services/${serviceId}/hymns/${hymnId}/formats/${formatId}/variations`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
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

    public async getType(typeId: string): Promise<ITypeInfo> {
        try {
            const response = await this.httpClient.get<ITypeInfo>(`/types/${typeId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getTypeSeasonList(typeId: string): Promise<ISeasonInfo[]> {
        try {
            const response = await this.httpClient.get<ISeasonInfo[]>(`/types/${typeId}/seasons`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getTypeSeason(typeId: string, seasonId: string): Promise<ISeasonInfo> {
        try {
            const response = await this.httpClient.get<ISeasonInfo>(`/types/${typeId}/seasons/${seasonId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getTypeSeasonServiceHymnList(typeId: string, seasonId: string): Promise<IHymnInfoWithServiceDetails[]> {
        try {
            const response = await this.httpClient.get<IHymnInfoWithServiceDetails[]>(`/types/${typeId}/seasons/${seasonId}/hymns`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getTypeSeasonServiceHymn(typeId: string, seasonId: string, hymnId: string): Promise<IHymnInfoWithServiceDetails> {
        try {
            const response = await this.httpClient.get<IHymnInfoWithServiceDetails>(`/types/${typeId}/seasons/${seasonId}/hymns/${hymnId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getTypeSeasonServiceHymnFormatList(typeId: string, seasonId: string, hymnId: string): Promise<IFormatInfo[]> {
        try {
            const response = await this.httpClient.get<IFormatInfo[]>(`/types/${typeId}/seasons/${seasonId}/hymns/${hymnId}/formats`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getTypeSeasonServiceHymnFormat(typeId: string, seasonId: string, hymnId: string, formatId: string): Promise<IFormatInfo> {
        try {
            const response = await this.httpClient.get<IFormatInfo>(`/types/${typeId}/seasons/${seasonId}/hymns/${hymnId}/formats/${formatId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getTypeSeasonServiceHymnFormatVariationList<T extends IHymnContent>(typeId: string, seasonId: string, hymnId: string, formatId: string): Promise<IVariationInfo<T>[]> {
        try {
            const response = await this.httpClient.get<IVariationInfo<T>[]>(`/types/${typeId}/seasons/${seasonId}/hymns/${hymnId}/formats/${formatId}/variations`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getTuneList(): Promise<ITuneInfo[]> {
        try {
            const response = await this.httpClient.get<ITuneInfo[]>("/tunes");
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getTune(tuneId: string): Promise<ITuneInfo> {
        try {
            const response = await this.httpClient.get<ITuneInfo>(`/tunes/${tuneId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getTuneSeasonList(tuneId: string): Promise<ISeasonInfo[]> {
        try {
            const response = await this.httpClient.get<ISeasonInfo[]>(`/tunes/${tuneId}/seasons`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getTuneSeason(tuneId: string, seasonId: string): Promise<ISeasonInfo> {
        try {
            const response = await this.httpClient.get<ISeasonInfo>(`/tunes/${tuneId}/seasons/${seasonId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getTuneSeasonServiceHymnList(tuneId: string, seasonId: string): Promise<IHymnInfoWithServiceDetails[]> {
        try {
            const response = await this.httpClient.get<IHymnInfoWithServiceDetails[]>(`/tunes/${tuneId}/seasons/${seasonId}/hymns`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getTuneSeasonServiceHymn(tuneId: string, seasonId: string, hymnId: string): Promise<IHymnInfoWithServiceDetails> {
        try {
            const response = await this.httpClient.get<IHymnInfoWithServiceDetails>(`/tunes/${tuneId}/seasons/${seasonId}/hymns/${hymnId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getTuneSeasonServiceHymnFormatList(tuneId: string, seasonId: string, hymnId: string): Promise<IFormatInfo[]> {
        try {
            const response = await this.httpClient.get<IFormatInfo[]>(`/tunes/${tuneId}/seasons/${seasonId}/hymns/${hymnId}/formats`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getTuneSeasonServiceHymnFormat(tuneId: string, seasonId: string, hymnId: string, formatId: string): Promise<IFormatInfo> {
        try {
            const response = await this.httpClient.get<IFormatInfo>(`/tunes/${tuneId}/seasons/${seasonId}/hymns/${hymnId}/formats/${formatId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getTuneSeasonServiceHymnFormatVariationList<T extends IHymnContent>(tuneId: string, seasonId: string, hymnId: string, formatId: string): Promise<IVariationInfo<T>[]> {
        try {
            const response = await this.httpClient.get<IVariationInfo<T>[]>(`/tunes/${tuneId}/seasons/${seasonId}/hymns/${hymnId}/formats/${formatId}/variations`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getBookletList(): Promise<IBookletInfo[]> {
        try {
            const response = await this.httpClient.get<IBookletInfo[]>("/booklets");
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getBooklet(bookletId: string): Promise<IBookletInfo> {
        try {
            const response = await this.httpClient.get<IBookletInfo>(`/booklets/${bookletId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }
}
