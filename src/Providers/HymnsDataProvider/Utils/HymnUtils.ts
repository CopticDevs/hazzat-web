import { IHymnInfo } from "../Models/IHymnInfo";
import { ISeasonInfo } from "../Models/ISeasonInfo";
import { IServiceInfo } from "../Models/IServiceInfo";

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
     * Comparer method for hymns to sort by hymnb order ascendingly.
     * @param hymnA first hymn
     * @param hymnB second hymn
     * @returns 1 if A > B, -1 if A < B, 0 if equal
     */
    public static hymnInfoComparer(hymnA: IHymnInfo, hymnB: IHymnInfo): number {
        return hymnA.order - hymnB.order;
    }
}
