import { IBookletInfo } from "./Models/IBookletInfo";
import { IFormatInfo } from "./Models/IFormatInfo";
import { IHymnInfo, IHymnInfoWithServiceDetails } from "./Models/IHymnInfo";
import { IReferenceIndex } from "./Models/IReferenceIndex";
import { ISeasonInfo } from "./Models/ISeasonInfo";
import { IServiceInfo } from "./Models/IServiceInfo";
import { IHymnContent, IVariationInfo } from "./Models/IVariationInfo";

export interface IHymnsDataProvider {
    getSeasonList(): Promise<ISeasonInfo[]>;
    getSeason(seasonId: string): Promise<ISeasonInfo | undefined>;

    getServiceList(seasonId: string): Promise<IServiceInfo[]>;
    getService(seasonId: string, serviceId: string): Promise<IServiceInfo | undefined>;

    getServiceHymnList(seasonId: string, serviceId: string): Promise<IHymnInfo[]>;
    getServiceHymn(seasonId: string, serviceId: string, hymnId: string): Promise<IHymnInfo>;

    getServiceHymnFormatList(seasonId: string, serviceId: string, hymnId: string): Promise<IFormatInfo[]>;
    getServiceHymnFormat(seasonId: string, serviceId: string, hymnId: string, formatId: string): Promise<IFormatInfo | undefined>;

    getServiceHymnsFormatVariationList<T extends IHymnContent>(seasonId: string, serviceId: string, hymnId: string, formatId: string): Promise<IVariationInfo<T>[]>;

    getReferenceIndex(): Promise<IReferenceIndex>;

    getBookletList(): Promise<IBookletInfo[]>;
    getBooklet(bookletId: string): Promise<IBookletInfo>;
}
