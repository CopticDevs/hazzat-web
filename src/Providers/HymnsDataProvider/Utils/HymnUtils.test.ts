import { HymnUtils } from './HymnUtils';
import { ISeasonInfo } from '../Models/ISeasonInfo';

const season = (order: number, isDateSpecific: boolean): ISeasonInfo => ({ id: `${order}`, name: '', displayName: '', order, isDateSpecific });
it('prioritizes date-specific seasons, then sorts each group by order', () => {
  const items = [season(1, false), season(3, true), season(2, false), season(1, true)];
  expect(items.sort(HymnUtils.seasonInfoComparer).map(s => [s.isDateSpecific, s.order])).toEqual([[true, 1], [true, 3], [false, 1], [false, 2]]);
  expect(HymnUtils.seasonInfoComparer(season(1, true), season(1, true))).toBe(0);
});
it('orders services and hymns numerically, preserving ties', () => {
  const first = { ...season(2, false), verse: '' }, second = { ...season(10, false), verse: '' };
  for (const compare of [HymnUtils.serviceInfoComparer, HymnUtils.hymnInfoComparer]) {
    expect(compare(first, second)).toBeLessThan(0);
    expect(compare(second, first)).toBeGreaterThan(0);
    expect(compare(first, first)).toBe(0);
  }
});
it('orders service-aware hymns by service before hymn order', () => {
  const hymn = (serviceOrder: number, order: number) => ({ ...season(order, false), serviceId: serviceOrder, serviceName: '', serviceOrder });
  const items = [hymn(2, 1), hymn(1, 3), hymn(1, 2)];
  expect(items.sort(HymnUtils.hymnInfoWithServiceDetailsComparer).map(h => [h.serviceOrder, h.order])).toEqual([[1, 2], [1, 3], [2, 1]]);
});
