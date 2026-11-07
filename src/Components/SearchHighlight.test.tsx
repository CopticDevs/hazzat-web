import { render, screen } from '@testing-library/react';
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
        render(<span data-testid="highlighted-text"><SearchHighlight text={text} query={query} /></span>);
        expect(screen.getByTestId('highlighted-text').textContent).toBe(text);
        const highlights = screen.queryAllByTestId('search-match');
        expect(highlights.map(node => node.textContent)).toEqual(matches);
        highlights.forEach(node => expect(node.tagName).toBe('MARK'));
    });
    it('renders markup as plain text instead of executing or inserting it', () => {
        const text = '<img src=x onerror=alert(1)> Lord & God';
        render(<span data-testid="highlighted-text"><SearchHighlight text={text} query="lord" /></span>);
        expect(screen.queryByRole('img', { hidden: true })).toBeNull();
        expect(screen.getByTestId('highlighted-text').textContent).toBe(text);
        expect(screen.getByTestId('search-match')).toHaveTextContent('Lord');
        expect(screen.getByTestId('search-match').tagName).toBe('MARK');
    });
    it('merges overlapping terms and rejects excessively long queries', () => {
        expect(searchHighlightRanges('Doxology', 'dox doxology')).toEqual([[0, 8]]);
        expect(searchHighlightRanges('Doxology', 'a'.repeat(201))).toEqual([]);
    });
});

it.each(["P[oic Vnou]", "Acpazec;e", "Pi,rictoc", "nen'u,y", "`nte nijom"])("highlights original legacy Coptic letters: %s", query => {
    const text = `Allylouia@ ${query}.`;
    render(<span data-testid="highlighted-text"><SearchHighlight text={text} query={query.toLowerCase()} coptic /></span>);
    expect(screen.getByTestId('highlighted-text').textContent).toBe(text);
    expect(screen.getByTestId('search-match').textContent).toBe(query);
    expect(screen.getByTestId('search-match').tagName).toBe('MARK');
});
it('does not highlight erased Coptic punctuation or approximate English tokens in a Coptic snippet', () => {
    expect(searchHighlightRanges("Aspasmos Watos (O Lord)", "P[oic Vnou]")).toEqual([]);
    expect(searchHighlightRanges("Pi,rictoc", "pi rictoc", true)).toEqual([]);
    expect(searchHighlightRanges("Acpazec;e", "acpazec e", true)).toEqual([]);
});
