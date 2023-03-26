import { IBookletInfo } from "../Models/IBookletInfo";
import { IHymnInfo, IHymnInfoWithServiceDetails } from "../Models/IHymnInfo";
import { ISeasonInfo } from "../Models/ISeasonInfo";
import { IServiceInfo } from "../Models/IServiceInfo";
import { ITuneInfo } from "../Models/ITuneInfo";
import { ITypeInfo } from "../Models/ITypeInfo";

export class HymnUtils {
    /**
     * Comparer method for seasons to sort by season order ascendingly.
     * @param seasonA first seasons
     * @param seasonB second season
     * @returns 1 if A > B, -1 if A < B, 0 if equal
     */
    public static seasonInfoComparer(seasonA: ISeasonInfo, seasonB: ISeasonInfo): number {
        if (seasonA.isDateSpecific === seasonB.isDateSpecific) {
            return seasonA.order - seasonB.order;
        }

        return seasonA.isDateSpecific ? -1 : 1;
    }

    /**
     * Comparer method for services to sort by service order ascendingly.
     * @param serviceA first service
     * @param serviceB second service
     * @returns 1 if A > B, -1 if A < B, 0 if equal
     */
    public static serviceInfoComparer(serviceA: IServiceInfo, serviceB: IServiceInfo): number {
        return serviceA.order - serviceB.order;
    }

    /**
     * Comparer method for hymns to sort by hymn order ascendingly.
     * @param hymnA first hymn
     * @param hymnB second hymn
     * @returns 1 if A > B, -1 if A < B, 0 if equal
     */
    public static hymnInfoComparer(hymnA: IHymnInfo, hymnB: IHymnInfo): number {
        return hymnA.order - hymnB.order;
    }

    /**
     * Comparer method for IHymnInfoWithServiceDetails to sort by hymn order ascendingly.
     * @param hymnA first hymn
     * @param hymnB second hymn
     * @returns 1 if A > B, -1 if A < B, 0 if equal
     */
    public static hymnInfoWithServiceDetailsComparer(hymnA: IHymnInfoWithServiceDetails, hymnB: IHymnInfoWithServiceDetails): number {
        return hymnA.serviceOrder - hymnB.serviceOrder || hymnA.order - hymnB.order;
    }

    /**
     * Comparer method for types to sort by type order ascendingly.
     * @param typeA first type
     * @param typeB second type
     * @returns 1 if A > B, -1 if A < B, 0 if equal
     */
    public static typeInfoComparer(typeA: ITypeInfo, typeB: ITypeInfo): number {
        return typeA.order - typeB.order;
    }

    /**
     * Comparer method for tunes to sort by tune order ascendingly.
     * @param tuneA first type
     * @param tuneB second type
     * @returns 1 if A > B, -1 if A < B, 0 if equal
     */
    public static tuneInfoComparer(tuneA: ITuneInfo, tuneB: ITuneInfo): number {
        return tuneA.order - tuneB.order;
    }

    /**
     * Comparer method for booklets to sort by booklet order ascendingly.
     * @param bookletA first type
     * @param bookletB second type
     * @returns 1 if A > B, -1 if A < B, 0 if equal
     */
    public static bookletInfoComparer(bookletA: IBookletInfo, bookletB: IBookletInfo): number {
        return bookletA.order - bookletB.order;
    }
}
