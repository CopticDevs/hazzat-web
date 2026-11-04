/** Normalize for matching only; displayed titles and text remain untouched. */
export function normalizeSearch(value: string): string {
    return value.normalize("NFKD").toLowerCase()
        .replace(new RegExp("\\p{M}", "gu"), "")
        .replace(/[ـ\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, "")
        .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي")
        .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x660))
        .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x6f0))
        .replace(new RegExp("[^\\p{L}\\p{N}]+", "gu"), " ").trim().replace(/\s+/g, " ");
}

// Bounded optimal-string-alignment distance also recognizes swapped adjacent letters.
function similarWord(a: string, b: string): boolean {
    const limit = a.length >= 8 ? 2 : a.length >= 4 ? 1 : 0;
    if (!limit || Math.abs(a.length - b.length) > limit || /\d/.test(a + b)) return a === b;
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    let beforePrevious = previous;
    for (let i = 1; i <= a.length; i++) {
        const row = [i];
        for (let j = 1; j <= b.length; j++) {
            row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) row[j] = Math.min(row[j], beforePrevious[j - 2] + 1);
        }
        if (Math.min(...row) > limit) return false;
        beforePrevious = previous;
        previous = row;
    }
    return previous[b.length] <= limit;
}

/** Exact/partial matches outrank word matches, which outrank spelling suggestions. */
export function titleMatchScore(query: string, value?: string): number {
    if (!value || !query) return 0;
    const title = normalizeSearch(value);
    if (title === query) return 400;
    if (title.startsWith(query)) return 350;
    if (title.includes(query)) return 300;
    const words = title.split(" "), terms = query.split(" ");
    if (terms.every(term => words.includes(term))) return 250;
    if (query.length > 100 || terms.length > 12) return 0;
    return terms.every(term => words.some(word => similarWord(term, word))) ? 100 : 0;
}

export interface SearchTextDocument {
    hymnId: string;
    seasonId: string;
    serviceId: string;
    passages: string[];
}

/** Parse in an inert document; never insert published HTML into the results UI. */
export function searchPlainText(html: string): string {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("script,style,template").forEach(node => node.remove());
    doc.querySelectorAll("br,p,div,li").forEach(node => node.appendChild(doc.createTextNode(" ")));
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}
