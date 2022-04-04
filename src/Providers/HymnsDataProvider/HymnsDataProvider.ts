import axios from "axios";
import { IHymnsDataProvider } from "./IHymnsDataProvider";
import { ISeasonInfo } from "./Models/ISeasonInfo";

export class HymnsDataProvider implements IHymnsDataProvider {
    private hazzatApiBaseUrl = "https://api.hazzat.com";

    private httpClient = axios.create({
        baseURL: this.hazzatApiBaseUrl
    });

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
        throw new Error("Method not implemented.");
    }
}
