import { normalizeSearch, titleMatchScore } from "../Providers/HymnsDataProvider/SearchMatching";

/** Map normalized matches back to original characters, including combining marks. */
export function searchHighlightRanges(text: string, query: string): Array<[number, number]> {
    const needle = normalizeSearch(query);
    if (needle.length < 2 || needle.length > 200) return [];
    let normalized = "", offset = 0;
    const positions: Array<[number, number]> = [];
    for (const char of Array.from(text)) {
        const start = offset;
        offset += char.length;
        const value = normalizeSearch(char);
        if (!value && (new RegExp("\\p{M}", "u").test(char) || /[\u0640\u200b-\u200f\u202a-\u202e\u2066-\u2069]/.test(char))) {
            if (positions.length) positions[positions.length - 1][1] = offset;
            continue;
        }
        for (const unit of (value || " ").split("")) {
            if (unit === " " && normalized.endsWith(" ")) {
                positions[positions.length - 1][1] = offset;
            } else { normalized += unit; positions.push([start, offset]); }
        }
    }
    const ranges: Array<[number, number]> = [];
    const add = (start: number, length: number) => ranges.push([positions[start][0], positions[start + length - 1][1]]);
    let at = normalized.indexOf(needle);
    while (at >= 0) { add(at, needle.length); at = normalized.indexOf(needle, at + needle.length); }
    if (!ranges.length) {
        const terms = needle.split(" ");
        for (const token of Array.from(normalized.matchAll(new RegExp("[\\p{L}\\p{N}]+", "gu")))) {
            for (const term of terms) {
                const index = token[0].indexOf(term);
                if (index >= 0) add(token.index! + index, term.length);
                else if (needle.length <= 100 && terms.length <= 12 && titleMatchScore(term, token[0]) === 100) add(token.index!, token[0].length);
            }
        }
    }
    const merged: Array<[number, number]> = [];
    ranges.sort((a, b) => a[0] - b[0]).forEach(range => {
        const last = merged[merged.length - 1];
        if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
        else merged.push([...range]);
    });
    return merged;
}

export default function SearchHighlight({ text, query }: { text: string; query: string }) {
    const parts = [], ranges = searchHighlightRanges(text, query);
    let start = 0;
    ranges.forEach(([from, to]) => {
        parts.push(text.slice(start, from), <mark className="search-match" key={from}>{text.slice(from, to)}</mark>);
        start = to;
    });
    parts.push(text.slice(start));
    return <>{parts}</>;
}
