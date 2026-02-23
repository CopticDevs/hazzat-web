import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { IHymnReference } from "../Providers/HymnsDataProvider/Models/IReferenceIndex";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";

/**
 * Get the display name for a season based on the current language
 * Falls back to English if Arabic name is not available
 */
export function getSeasonDisplayName(season: ISeasonInfo, language: string): string {
    if (language === 'ar' && season.nameAr) {
        return season.nameAr;
    }
    return season.name;
}

/**
 * Get the display verse for a season based on the current language
 * Falls back to English if Arabic verse is not available
 */
export function getSeasonDisplayVerse(season: ISeasonInfo, language: string): string {
    if (language === 'ar' && season.verseAr) {
        return season.verseAr;
    }
    return season.verse;
}

/**
 * Get the display name for a service based on the current language
 * Falls back to English if Arabic name is not available
 */
export function getServiceDisplayName(service: IServiceInfo, language: string): string {
    if (language === 'ar' && service.nameAr) {
        return service.nameAr;
    }
    return service.name;
}

/**
 * Get the display name for a hymn reference based on the current language
 * Falls back to English if Arabic name is not available
 */
export function getHymnDisplayName(hymnRef: IHymnReference, language: string): string {
    if (language === 'ar' && hymnRef.nameAr) {
        return hymnRef.nameAr;
    }
    return hymnRef.name;
}

/**
 * Get the display name for a hymn info based on the current language
 * Falls back to English if Arabic name is not available
 */
export function getHymnInfoDisplayName(hymn: IHymnInfo, language: string): string {
    if (language === 'ar' && hymn.nameAr) {
        return hymn.nameAr;
    }
    return hymn.name;
}
