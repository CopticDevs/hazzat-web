/*
 * Hymn Info
 */
export interface IHymnInfo {
    id: string;
    name: string;
    order: number;
}

/*
 * Hymn Info with Service details
 */
export interface IHymnInfoWithServiceDetails extends IHymnInfo {
    serviceId: number;
    serviceName: string;
}
