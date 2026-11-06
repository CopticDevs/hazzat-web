import * as parser from './ParserUtils';

describe.each([
  [parser.getTypeSeasonNumberFromId, '/types/17/seasons/15'],
  [parser.getServiceNumberFromId, '/seasons/1/services/15'],
  [parser.getHymnNumberFromId, '/seasons/1/services/2/hymns/15'],
  [parser.getTypeSeasonHymnNumberFromId, '/types/1/seasons/2/hymns/15'],
  [parser.getFormatNumberFromId, '/seasons/1/services/2/hymns/3/formats/15'],
  [parser.getTypeSeasonHymnFormatNumberFromId, '/types/1/seasons/2/hymns/3/formats/15'],
] as const)('%s', (parse, path) => {
  it('extracts the final numeric identifier, case insensitively', () => {
    expect(parse(path)).toBe('15');
    expect(parse(path.toUpperCase())).toBe('15');
    expect(parse(path.replace(/15$/, '0015'))).toBe('0015');
  });
  it.each(['', '/15', 'garbage', 'https://example.com', '15'])('rejects malformed paths: %s', invalid => {
    expect(parse(invalid)).toBe('');
  });
  it('rejects extra segments, suffixes, and non-numeric identifiers', () => {
    for (const invalid of [path + '/', path + '/extra', path + '?q=1', '/prefix' + path, path.replace(/15$/, '-1'), path.replace(/15$/, 'abc')]) {
      expect(parse(invalid)).toBe('');
    }
  });
});
