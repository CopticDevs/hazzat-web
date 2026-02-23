import { IDateRange, ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";

export interface SeasonWithDates extends ISeasonInfo {
  dateStart?: string;
  dateEnd?: string;
}

/**
 * Get the Coptic day for a given date/time
 * In Coptic tradition, the day starts at 6 PM (18:00)
 * So 1/6/2026 at 5:59 PM is still Coptic day 1/6
 * But 1/6/2026 at 6:00 PM is Coptic day 1/7
 */
function getCopticDay(date: Date): Date {
  const hour = date.getHours();
  
  // If it's 6 PM (18:00) or later, the Coptic day is tomorrow
  if (hour >= 18) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  }
  
  return date;
}

/**
 * Check if a date falls within a date range (inclusive)
 * Uses Coptic day boundary (6 PM) for comparison
 */
function dateInRange(date: Date, startStr: string, endStr: string): boolean {
  const copticDay = getCopticDay(date);
  
  // Parse dates (format: YYYY-MM-DD)
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T23:59:59');
  
  // Compare dates without time components
  const copticDayOnly = new Date(copticDay.getFullYear(), copticDay.getMonth(), copticDay.getDate());
  const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  
  return copticDayOnly >= startOnly && copticDayOnly <= endOnly;
}

/**
 * Find the relevant date range for a season based on today's date
 * Returns the date range that contains today, or the next upcoming range
 */
function findRelevantDateRange(season: ISeasonInfo, today: Date): IDateRange | null {
  if (!season.dateRanges || season.dateRanges.length === 0) {
    return null;
  }
  
  // First, check if today falls within any range
  for (const range of season.dateRanges) {
    if (dateInRange(today, range.dateStart, range.dateEnd)) {
      return range;
    }
  }
  
  // If not current, find the next upcoming range
  const copticDay = getCopticDay(today);
  const copticDayOnly = new Date(copticDay.getFullYear(), copticDay.getMonth(), copticDay.getDate());
  
  for (const range of season.dateRanges) {
    const start = new Date(range.dateStart + 'T00:00:00');
    const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    
    if (startOnly > copticDayOnly) {
      return range;
    }
  }
  
  return null;
}

/**
 * Check if a season is current based on date ranges
 */
export function isCurrentSeason(season: ISeasonInfo, today: Date = new Date()): boolean {
  if (!season.isDateSpecific) {
    return false;
  }
  
  const range = findRelevantDateRange(season, today);
  if (!range) {
    return false;
  }
  
  return dateInRange(today, range.dateStart, range.dateEnd);
}

/**
 * Check if a season is upcoming based on date ranges
 */
export function isUpcomingSeason(season: ISeasonInfo, today: Date = new Date()): boolean {
  if (!season.isDateSpecific) {
    return false;
  }
  
  const range = findRelevantDateRange(season, today);
  if (!range) {
    return false;
  }
  
  // Season is upcoming if the relevant range starts in the future
  const copticDay = getCopticDay(today);
  const copticDayOnly = new Date(copticDay.getFullYear(), copticDay.getMonth(), copticDay.getDate());
  
  const start = new Date(range.dateStart + 'T00:00:00');
  const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  
  return startOnly > copticDayOnly;
}

/**
 * Get current seasons from a list of seasons
 */
export function getCurrentSeasons(seasons: ISeasonInfo[], today: Date = new Date()): SeasonWithDates[] {
  const currentSeasons: SeasonWithDates[] = [];
  
  for (const season of seasons) {
    if (!season.isDateSpecific) continue;
    
    const range = findRelevantDateRange(season, today);
    if (!range) continue;
    
    if (dateInRange(today, range.dateStart, range.dateEnd)) {
      currentSeasons.push({
        ...season,
        dateStart: range.dateStart,
        dateEnd: range.dateEnd
      });
    }
  }
  
  // If no current seasons found, use "Annual" as default
  if (currentSeasons.length === 0) {
    const annualSeason = seasons.find(s => s.name.toLowerCase().includes('annual'));
    if (annualSeason) {
      currentSeasons.push({
        ...annualSeason,
        dateStart: undefined,
        dateEnd: undefined
      });
    }
  }
  
  return currentSeasons;
}

/**
 * Get upcoming seasons from a list of seasons
 * Returns up to 4 upcoming seasons sorted by start date
 */
export function getUpcomingSeasons(seasons: ISeasonInfo[], today: Date = new Date(), limit: number = 4): SeasonWithDates[] {
  const upcomingSeasons: SeasonWithDates[] = [];
  
  for (const season of seasons) {
    if (!season.isDateSpecific) continue;
    
    const range = findRelevantDateRange(season, today);
    if (!range) continue;
    
    const copticDay = getCopticDay(today);
    const copticDayOnly = new Date(copticDay.getFullYear(), copticDay.getMonth(), copticDay.getDate());
    
    const start = new Date(range.dateStart + 'T00:00:00');
    const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    
    if (startOnly > copticDayOnly) {
      upcomingSeasons.push({
        ...season,
        dateStart: range.dateStart,
        dateEnd: range.dateEnd
      });
    }
  }
  
  // Sort by start date
  upcomingSeasons.sort((a, b) => {
    if (!a.dateStart || !b.dateStart) return 0;
    return a.dateStart.localeCompare(b.dateStart);
  });
  
  // Limit to specified number
  return upcomingSeasons.slice(0, limit);
}

/**
 * Format a date range for display
 * Supports Arabic numerals when language is Arabic
 */
export function formatDateRange(startStr: string, endStr: string, language: string = 'en'): string {
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const formatter = new Intl.DateTimeFormat(locale, {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
  
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}
