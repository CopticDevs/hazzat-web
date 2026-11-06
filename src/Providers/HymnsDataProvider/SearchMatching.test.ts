import { asSearchPassage, isCopticPassage, normalizeCopticSearch, normalizeSearch, searchPlainText, titleMatchScore, validSearchQuery } from './SearchMatching';

it('normalizes Arabic variants, both numeral sets, diacritics and invisible controls', () => {
  expect(normalizeSearch('  أإآٱـى ٠١٢٣٤٥٦٧٨٩ ۰۱۲۳۴۵۶۷۸۹ Café\u200f! ')).toBe('ااااي 0123456789 0123456789 cafe');
  expect(normalizeCopticSearch(' PI,RICTOC\u200f@   ')).toBe('pi,rictoc');
});
it('ranks exact, prefix, substring, rearranged words and spelling matches', () => {
  expect(titleMatchScore('holy god', 'Holy God')).toBe(400);
  expect(titleMatchScore('holy', 'Holy God')).toBe(350);
  expect(titleMatchScore('god', 'Holy God')).toBe(300);
  expect(titleMatchScore('god holy', 'Holy God')).toBe(250);
  expect(titleMatchScore('hloy', 'Holy God')).toBe(100);
  expect(titleMatchScore('holi', 'Holy God')).toBe(100);
  expect(titleMatchScore('resurrectoin', 'Resurrection')).toBe(100);
  expect(titleMatchScore('gdo', 'God')).toBe(0);
  expect(titleMatchScore('psalm 51', 'Psalm 50')).toBe(0);
  expect(titleMatchScore('xxxxxxxx', 'Holy God')).toBe(0);
  expect(titleMatchScore('', 'Holy God')).toBe(0);
  expect(titleMatchScore('holy')).toBe(0);
});
it('bounds expensive fuzzy matching while retaining exact long titles', () => {
  const long = 'a'.repeat(101);
  expect(titleMatchScore(long, long)).toBe(400);
  expect(titleMatchScore(long, 'Unrelated')).toBe(0);
  expect(titleMatchScore(Array(13).fill('word').join(' '), 'Other')).toBe(0);
});
it('validates normalized query lengths and keeps Coptic font-key punctuation searchable', () => {
  for (const query of ['', 'a', '!   ', 'a'.repeat(201)]) expect(validSearchQuery(query)).toBe(false);
  for (const query of ['ab', 'a'.repeat(200), ',;']) expect(validSearchQuery(query)).toBe(true);
});
it('retains passage metadata and identifies Coptic case-insensitively', () => {
  const passage = { text: 'Words', language: 'English' };
  expect(asSearchPassage(passage)).toBe(passage);
  expect(asSearchPassage('Words')).toEqual({ text: 'Words' });
  expect(isCopticPassage(' COPTIC ')).toBe(true);
  expect(isCopticPassage('English')).toBe(false);
  expect(isCopticPassage()).toBe(false);
});
it('extracts inert readable text, preserving block boundaries and decoding entities', () => {
  expect(searchPlainText('<style>hidden</style><script>bad()</script><template>hidden</template><p>Lord &amp; God</p><div>Have<br>mercy</div><ul><li>on us</li></ul>')).toBe('Lord & God Have mercy on us');
  expect(searchPlainText('')).toBe('');
});
