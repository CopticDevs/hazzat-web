import { ISeasonInfo } from "./Models/ISeasonInfo";
import { IServiceInfo } from "./Models/IServiceInfo";

export interface IHymnsDataProvider {
    getSeasonList(): Promise<ISeasonInfo[]>;
    getSeason(seasonId: string): Promise<ISeasonInfo>;
    getServiceList(seasonId: string): Promise<IServiceInfo[]>;
    getService(seasonId: string, serviceId: string): Promise<IServiceInfo>;
}
