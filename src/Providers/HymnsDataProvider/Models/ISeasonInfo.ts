/*
 * Season Info
 */

export interface IDateRange {
    year: number;
    dateStart: string;
    dateEnd: string;
}

export interface ISeasonInfo {
    id: string;
    name: string;
    nameAr?: string; // Arabic name (optional)
    displayName: string; // Computed display name based on current language
    verse: string;
    verseAr?: string; // Arabic verse (optional)
    displayVerse: string; // Computed display verse based on current language
    order: number;
    isDateSpecific: boolean;
    dateRanges?: IDateRange[]; // Optional date ranges for date-specific seasons
    serviceCount?: number; // Number of services in this season
    serviceIds?: string[]; // Service IDs from metadata
}
