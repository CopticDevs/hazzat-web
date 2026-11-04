import { render } from '@testing-library/react';
import SearchHighlight, { searchHighlightRanges } from './SearchHighlight';

describe('search highlighting', () => {
    it.each([
        ['Lord have mercy; LORD have mercy', 'lord have mercy', ['Lord have mercy', 'LORD have mercy']],
        ['Éléison', 'eleison', ['Éléison']],
        ['E\u0301leison', 'eleison', ['E\u0301leison']],
        ['إِلَـى آدَم ١٥٠', 'الي ادم 150', ['إِلَـى آدَم ١٥٠']],
        ['ⲬⲈⲢⲈ ⲙⲁⲣⲓⲁ', 'ⲭⲉⲣⲉ', ['ⲬⲈⲢⲈ']],
        ['Psalm—150', 'psalm 150', ['Psalm—150']],
        ['Doxology', 'doxolgy', ['Doxology']],
        ['Rejoice O Mary', 'mary rejoice', ['Rejoice', 'Mary']],
        ['God is good', 'god', ['God']],
        ['Psalm 150', '151', []],
        ['Unrelated text', 'xyzxyz', []],
        ['Literal text', '!!!', []]
    ])('highlights original characters in %s', (text, query, matches) => {
        const { container } = render(<SearchHighlight text={text} query={query} />);
        expect(container.textContent).toBe(text);
        expect(Array.from(container.querySelectorAll('mark'), node => node.textContent)).toEqual(matches);
    });
    it('renders markup as plain text instead of executing or inserting it', () => {
        const text = '<img src=x onerror=alert(1)> Lord & God';
        const { container } = render(<SearchHighlight text={text} query="lord" />);
        expect(container.querySelector('img')).toBeNull();
        expect(container.textContent).toBe(text);
        expect(container.querySelector('mark')).toHaveTextContent('Lord');
    });
    it('merges overlapping terms and rejects excessively long queries', () => {
        expect(searchHighlightRanges('Doxology', 'dox doxology')).toEqual([[0, 8]]);
        expect(searchHighlightRanges('Doxology', 'a'.repeat(201))).toEqual([]);
    });
});
