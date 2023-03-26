import { IHymnInfo, IHymnInfoWithServiceDetails } from "../Models/IHymnInfo";
import { ISeasonInfo } from "../Models/ISeasonInfo";
import { IServiceInfo } from "../Models/IServiceInfo";
import { ITypeInfo } from "../Models/ITypeInfo";

export class HymnUtils {
    /**
     * Comparer method for seasons to sort by season order ascendingly.
     * @param seasonA first seasons
     * @param seasonB second season
     * @returns 1 if A > B, -1 if A < B, 0 if equal
     */
    public static seasonInfoComparer(seasonA: ISeasonInfo, seasonB: ISeasonInfo): number {
        return seasonA.order - seasonB.order;
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
}
