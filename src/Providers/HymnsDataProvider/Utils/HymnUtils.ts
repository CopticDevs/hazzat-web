import { ISeasonInfo } from "../Models/ISeasonInfo";

export class HymnUtils {
    /**
     * Comparer method for seasons to sort by season order ascendingly.
     * @param seasonA first seasons
     * @param seasonB second season
     */
    public static seasonInfoComparer(seasonA: ISeasonInfo, seasonB: ISeasonInfo): number {
        return seasonA.order - seasonB.order;
    }
}
