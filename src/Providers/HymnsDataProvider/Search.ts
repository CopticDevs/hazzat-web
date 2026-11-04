import { IHymnsDataProvider } from "./IHymnsDataProvider";
import { ISearchResult } from "./Models/ISearchResult";
import { localizedName } from "./SharedContent";
import { normalizeSearch, SearchTextDocument, titleMatchScore } from "./SearchMatching";

const normalizedPassages = new WeakMap<SearchTextDocument, string[]>();

function excerpt(passage: string, query: string): string {
    if (passage.length <= 240) return passage;
    const words = passage.split(" ");
    const count = query.split(" ").length;
    const position = words.findIndex((_, i) => normalizeSearch(words.slice(i, i + count + 4).join(" ")).includes(query));
    const start = Math.max(0, position - 3);
    const text = words.slice(start).join(" ");
    return (start ? "…" : "") + text.slice(0, 240) + (text.length > 240 ? "…" : "");
}

/** Title search stays lightweight; full text is an explicit, cached opt-in. */
export async function searchContent(provider: IHymnsDataProvider, query: string, language: string, includeText = false): Promise<ISearchResult[]> {
    const needle = normalizeSearch(query);
    if (needle.length < 2 || needle.length > 200) return [];
    const [seasons, index, documents] = await Promise.all([provider.getSeasonList(), provider.getReferenceIndex(),
        includeText && provider.getSearchTextIndex ? provider.getSearchTextIndex() : Promise.resolve([])]);
    const score = (...values: (string | undefined)[]) => Math.max(0, ...values.map(value => titleMatchScore(needle, value)));
    const ranked: { score: number; result: ISearchResult }[] = seasons.flatMap(season => {
        const rank = score(season.id, season.name, season.nameAr);
        return rank ? [{ score: rank, result: { type: "season" as const, season } }] : [];
    });
    const textMatches = new Map<string, Map<string, string>>();
    for (const doc of documents) {
        let normalized = normalizedPassages.get(doc);
        if (!normalized) { normalized = doc.passages.map(normalizeSearch); normalizedPassages.set(doc, normalized); }
        const position = normalized.findIndex(value => (` ${value} `).includes(` ${needle} `));
        const passage = doc.passages[position];
        if (!passage) continue;
        if (!textMatches.has(doc.hymnId)) textMatches.set(doc.hymnId, new Map());
        textMatches.get(doc.hymnId)!.set(`${doc.seasonId}/${doc.serviceId}`, passage);
    }
    const candidates = Object.entries(index).flatMap(([id, entry]) => {
        const canonicalScore = score(id, entry.name, entry.nameAr);
        const uses = entry.usages ?? entry.services.map(path => {
            const [seasonId, serviceId] = path.split("/");
            return { seasonId, serviceId, name: entry.name, nameAr: entry.nameAr };
        });
        const text = textMatches.get(id);
        const matchingUses = uses.filter(use => canonicalScore || score(use.name, use.nameAr) || text?.has(`${use.seasonId}/${use.serviceId}`));
        const rank = Math.max(canonicalScore, ...matchingUses.map(use => score(use.name, use.nameAr)), text ? 80 : 0);
        return matchingUses.length ? [{ id, entry, matchingUses, rank, snippet: text?.values().next().value as string | undefined }] : [];
    }).sort((a, b) => b.rank - a.rank || a.id.localeCompare(b.id));
    const serviceNames = new Map<string, ReturnType<IHymnsDataProvider["getService"]>>();
    for (const { id, entry, matchingUses, rank, snippet } of candidates) {
        const references = [];
        const seen = new Set<string>();
        for (const use of matchingUses) {
            const season = seasons.find(s => s.id === use.seasonId);
            if (!season) continue;
            const path = `${use.seasonId}/${use.serviceId}`;
            if (seen.has(path)) continue;
            seen.add(path);
            let request = serviceNames.get(path);
            if (!request) {
                request = provider.getServiceSummary
                    ? provider.getServiceSummary(use.seasonId, use.serviceId)
                    : provider.getService(use.seasonId, use.serviceId);
                serviceNames.set(path, request);
            }
            const service = await request;
            if (!service) throw new Error("Unable to load a search result");
            references.push({ seasonId: use.seasonId, seasonName: season.displayName,
                serviceId: use.serviceId, serviceName: service.displayName, hymnName: localizedName(use, language) });
        }
        if (references.length) ranked.push({ score: rank, result: { type: "hymn", hymn: { id, name: localizedName(entry, language), references,
            ...(snippet ? { snippet: excerpt(snippet, needle) } : {}) } } });
    }
    return ranked.sort((a, b) => b.score - a.score).map(item => item.result);
}
