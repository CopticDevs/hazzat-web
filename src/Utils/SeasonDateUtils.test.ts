import { formatDateRange, getCurrentSeasons, getUpcomingSeasons, isCurrentSeason, isUpcomingSeason } from './SeasonDateUtils';
import { ISeasonInfo } from '../Providers/HymnsDataProvider/Models/ISeasonInfo';

const season = (id: string, start?: string, end = start): ISeasonInfo => ({
  id, name: id, displayName: id, order: 1, isDateSpecific: true,
  dateRanges: start ? [{ year: Number(start.slice(0, 4)), dateStart: start, dateEnd: end! }] : undefined,
});
const annual = { ...season('Annual'), isDateSpecific: false };
const today = new Date(2026, 0, 6, 12);

describe('Coptic season dates', () => {
  it('switches days at exactly 6 PM, without mutating the supplied date', () => {
    const feast = season('Nativity', '2026-01-07');
    const before = new Date(2026, 0, 6, 17, 59, 59);
    const evening = new Date(2026, 0, 6, 18);
    expect(isCurrentSeason(feast, before)).toBe(false);
    expect(isUpcomingSeason(feast, before)).toBe(true);
    expect(isCurrentSeason(feast, evening)).toBe(true);
    expect(isUpcomingSeason(feast, evening)).toBe(false);
    expect(evening.getDate()).toBe(6);
    expect(isCurrentSeason(feast, new Date(2026, 0, 7, 17, 59))).toBe(true);
    expect(isCurrentSeason(feast, new Date(2026, 0, 7, 18))).toBe(false);
  });
  it('handles month and year rollover at the evening boundary', () => {
    expect(isCurrentSeason(season('New year', '2027-01-01'), new Date(2026, 11, 31, 18))).toBe(true);
    expect(isCurrentSeason(season('March', '2024-03-01'), new Date(2024, 1, 29, 18))).toBe(true);
  });
  it('ignores non-date-specific, missing, empty and expired ranges', () => {
    for (const item of [annual, season('Missing'), { ...season('Empty'), dateRanges: [] }, season('Expired', '2025-01-01')]) {
      expect(isCurrentSeason(item, today)).toBe(false);
      expect(isUpcomingSeason(item, today)).toBe(false);
    }
  });
  it('selects the current or next range after skipping previous years', () => {
    const repeated = { ...season('Feast'), dateRanges: [
      { year: 2025, dateStart: '2025-01-06', dateEnd: '2025-01-07' },
      { year: 2026, dateStart: '2026-01-06', dateEnd: '2026-01-07' },
      { year: 2027, dateStart: '2027-01-06', dateEnd: '2027-01-07' },
    ] };
    expect(getCurrentSeasons([repeated, annual], today)).toEqual([{ ...repeated, dateStart: '2026-01-06', dateEnd: '2026-01-07' }]);
    expect(getUpcomingSeasons([repeated], new Date(2026, 1, 1))).toEqual([{ ...repeated, dateStart: '2027-01-06', dateEnd: '2027-01-07' }]);
  });
  it('returns every overlapping current season and uses Annual only when none match', () => {
    const first = season('First', '2026-01-01', '2026-01-07');
    const second = season('Second', '2026-01-06');
    expect(getCurrentSeasons([annual, first, second, season('Missing'), season('Later', '2026-02-01')], today).map(s => s.id)).toEqual(['First', 'Second']);
    expect(getCurrentSeasons([season('Missing'), annual], today)).toEqual([{ ...annual, dateStart: undefined, dateEnd: undefined }]);
    expect(getCurrentSeasons([season('Missing')], today)).toEqual([]);
  });
  it('sorts upcoming seasons, excludes current/past/undated seasons and respects limits', () => {
    const upcoming = [10, 8, 11, 9, 7].map(day => season(`Feast ${day}`, `2026-01-${String(day).padStart(2, '0')}`));
    const items = [annual, season('Missing'), season('Past', '2025-01-01'), season('Current', '2026-01-06'), ...upcoming];
    expect(getUpcomingSeasons(items, today).map(s => s.id)).toEqual(['Feast 7', 'Feast 8', 'Feast 9', 'Feast 10']);
    expect(getUpcomingSeasons(items, today, 1)[0]).toMatchObject({ dateStart: '2026-01-07', dateEnd: '2026-01-07' });
    expect(getUpcomingSeasons(items, today, 0)).toEqual([]);
  });
  it('uses the system date when a date is not supplied', () => {
    jest.useFakeTimers().setSystemTime(today);
    try {
      const current = season('Current', '2026-01-06');
      const future = season('Future', '2026-01-07');
      expect(isCurrentSeason(current)).toBe(true);
      expect(isUpcomingSeason(future)).toBe(true);
      expect(getCurrentSeasons([current])).toHaveLength(1);
      expect(getUpcomingSeasons([future])).toHaveLength(1);
    } finally { jest.useRealTimers(); }
  });
  it('formats local calendar dates in English and Arabic', () => {
    expect(formatDateRange('2026-01-06', '2026-02-07')).toBe('01/06/2026 - 02/07/2026');
    const formatter = new Intl.DateTimeFormat('ar-EG', { month: '2-digit', day: '2-digit', year: 'numeric' });
    expect(formatDateRange('2026-01-06', '2026-02-07', 'ar')).toBe(`${formatter.format(new Date(2026, 0, 6))} - ${formatter.format(new Date(2026, 1, 7))}`);
  });
});
