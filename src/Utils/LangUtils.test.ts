import { convertNumberToString } from './LangUtils';
import { strings } from '../l8n';

afterEach(() => strings.setLanguage('en'));

it('formats each decimal digit using the active Arabic translations', () => {
  strings.setLanguage('ar');
  expect(convertNumberToString(1023456789, 'ar')).toBe('١٠٢٣٤٥٦٧٨٩');
  expect(convertNumberToString(-2.5, 'AR')).toBe('-٢.٥');
  expect(convertNumberToString(0, 'ar')).toBe('٠');
});
it('preserves ordinary numeric strings for non-Arabic languages', () => {
  expect(convertNumberToString(-110.25, 'en')).toBe('-110.25');
  expect(convertNumberToString(42, 'fr')).toBe('42');
});

it('localizes every repeated digit, including negative decimal values', () => {
  strings.setLanguage('ar');
  expect(convertNumberToString(11, 'ar')).toBe('١١');
  expect(convertNumberToString(-110.25, 'ar')).toBe('-١١٠.٢٥');
  expect(convertNumberToString(22.22, 'AR')).toBe('٢٢.٢٢');
});
