import { IBookletInfo } from "./Models/IBookletInfo";
import { IFormatInfo } from "./Models/IFormatInfo";
import { IHymnInfo, IHymnInfoWithServiceDetails } from "./Models/IHymnInfo";
import { ISeasonInfo } from "./Models/ISeasonInfo";
import { IServiceInfo } from "./Models/IServiceInfo";
import { ITuneInfo } from "./Models/ITuneInfo";
import { ITypeInfo } from "./Models/ITypeInfo";
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

    getTypeList(): Promise<ITypeInfo[]>;
    getType(typeId: string): Promise<ITypeInfo>;

    getTypeSeasonList(typeId: string): Promise<ISeasonInfo[]>;
    getTypeSeason(typeId: string, seasonId: string): Promise<ISeasonInfo>;

    getTypeSeasonServiceHymnList(typeId: string, seasonId: string): Promise<IHymnInfoWithServiceDetails[]>;
    getTypeSeasonServiceHymn(typeId: string, seasonId: string, hymnId: string): Promise<IHymnInfoWithServiceDetails>;

    getTypeSeasonServiceHymnFormatList(typeId: string, seasonId: string, hymnId: string): Promise<IFormatInfo[]>;
    getTypeSeasonServiceHymnFormat(typeId: string, seasonId: string, hymnId: string, formatId: string): Promise<IFormatInfo>;

    getTypeSeasonServiceHymnFormatVariationList<T extends IHymnContent>(typeId: string, seasonId: string, hymnId: string, formatId: string): Promise<IVariationInfo<T>[]>;

    getTuneList(): Promise<ITuneInfo[]>;
    getTune(TuneId: string): Promise<ITuneInfo>;

    getTuneSeasonList(tuneId: string): Promise<ISeasonInfo[]>;
    getTuneSeason(tuneId: string, seasonId: string): Promise<ISeasonInfo>;

    getTuneSeasonServiceHymnList(tuneId: string, seasonId: string): Promise<IHymnInfoWithServiceDetails[]>;
    getTuneSeasonServiceHymn(tuneId: string, seasonId: string, hymnId: string): Promise<IHymnInfoWithServiceDetails>;

    getTuneSeasonServiceHymnFormatList(tuneId: string, seasonId: string, hymnId: string): Promise<IFormatInfo[]>;
    getTuneSeasonServiceHymnFormat(tuneId: string, seasonId: string, hymnId: string, formatId: string): Promise<IFormatInfo>;

    getTuneSeasonServiceHymnFormatVariationList<T extends IHymnContent>(tuneId: string, seasonId: string, hymnId: string, formatId: string): Promise<IVariationInfo<T>[]>;

    getBookletList(): Promise<IBookletInfo[]>;
    getBooklet(bookletId: string): Promise<IBookletInfo>;
}
