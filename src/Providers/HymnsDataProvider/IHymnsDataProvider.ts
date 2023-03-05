import { IHymnInfo } from "./Models/IHymnInfo";
import { ISeasonInfo } from "./Models/ISeasonInfo";
import { IServiceInfo } from "./Models/IServiceInfo";

export interface IHymnsDataProvider {
    getSeasonList(): Promise<ISeasonInfo[]>;
    getSeason(seasonId: string): Promise<ISeasonInfo>;
    getServiceList(seasonId: string): Promise<IServiceInfo[]>;
    getService(seasonId: string, serviceId: string): Promise<IServiceInfo>;
    getServiceHymnList(seasonId: string, serviceId: string): Promise<IHymnInfo[]>;
}
