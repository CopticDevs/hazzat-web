import { getHymnDisplayName, getHymnInfoDisplayName, getSeasonDisplayName, getServiceDisplayName } from './DisplayNameUtils';

const item = { id: '1', name: 'Praise', nameAr: 'تسبيح', displayName: '', order: 1, isDateSpecific: false, verse: '', services: [], formats: {} };

describe.each([
  ['season', (nameAr: string | undefined, lang: string) => getSeasonDisplayName({ ...item, nameAr }, lang)],
  ['service', (nameAr: string | undefined, lang: string) => getServiceDisplayName({ ...item, nameAr }, lang)],
  ['hymn reference', (nameAr: string | undefined, lang: string) => getHymnDisplayName({ ...item, nameAr }, lang)],
  ['hymn info', (nameAr: string | undefined, lang: string) => getHymnInfoDisplayName({ ...item, nameAr, formats: undefined }, lang)],
] as const)('%s display name', (_, display) => {
  it('selects Arabic only when requested and present', () => {
    expect(display(item.nameAr, 'ar')).toBe(item.nameAr);
    expect(display(item.nameAr, 'en')).toBe('Praise');
    expect(display(item.nameAr, 'fr')).toBe('Praise');
  });
  it('falls back to English when the translation is missing or empty', () => {
    expect(display(undefined, 'ar')).toBe('Praise');
    expect(display('', 'ar')).toBe('Praise');
  });
});
