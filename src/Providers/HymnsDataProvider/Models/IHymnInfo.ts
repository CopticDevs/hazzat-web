import { IFormatInfo } from "./IFormatInfo";

/*
 * Hymn Info
 */
export interface IHymnInfo {
    id: string;
    name: string;
    nameAr?: string; // Arabic name (optional)
    displayName: string; // Computed display name based on current language
    order: number;
    formats?: IFormatInfo[]; // NEW: Embedded formats from S3 backend (optional for backward compatibility)
}

/*
 * Hymn Info with Service details
 */
export interface IHymnInfoWithServiceDetails extends IHymnInfo {
    serviceId: number;
    serviceName: string;
    serviceOrder: number;
}
