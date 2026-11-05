import { IHymnInfo } from "./IHymnInfo";

/*
 * Service Info
 */
export interface IServiceInfo {
    id: string;
    name: string;
    nameAr?: string; // Arabic name (optional)
    displayName: string; // Computed display name based on current language
    verse: string;
    verseAr?: string; // Arabic verse (optional)
    order: number;
    isDateSpecific: boolean;
    seasonId?: string; // NEW: Season ID for S3 backend (optional for backward compatibility)
    hymns?: IHymnInfo[]; // NEW: Embedded hymns from S3 backend (optional for backward compatibility)
}
