import { IHymnsDataProvider } from "./IHymnsDataProvider";
import { IReferenceIndex } from "./Models/IReferenceIndex";
import { ISearchResult } from "./Models/ISearchResult";
import { ISeasonInfo } from "./Models/ISeasonInfo";
import { localizedName } from "./SharedContent";

/** Search uses titles and service summaries; it never needs shared payloads. */
export async function searchContent(provider: IHymnsDataProvider, query: string, language: string): Promise<ISearchResult[]> {
    const needle = query.trim().toLowerCase();
    const matches = (value?: string) => !!value && value.toLowerCase().includes(needle);
    const [seasons, index]: [ISeasonInfo[], IReferenceIndex] = await Promise.all([provider.getSeasonList(), provider.getReferenceIndex()]);
    const results: ISearchResult[] = seasons.filter(s => matches(s.name) || matches(s.nameAr)).map(season => ({ type: "season", season }));
    const serviceNames = new Map<string, ReturnType<IHymnsDataProvider["getService"]>>();
    for (const [id, entry] of Object.entries(index)) {
        const canonicalMatch = matches(id) || matches(entry.name) || matches(entry.nameAr);
        const uses = entry.usages ?? entry.services.map(path => {
            const [seasonId, serviceId] = path.split("/");
            return { seasonId, serviceId, name: entry.name, nameAr: entry.nameAr };
        });
        const matchingUses = canonicalMatch ? uses : uses.filter(use => matches(use.name) || matches(use.nameAr));
        if (!matchingUses.length) continue;
        const references = [];
        for (const use of matchingUses) {
            const season = seasons.find(s => s.id === use.seasonId);
            if (!season) continue;
            const path = `${use.seasonId}/${use.serviceId}`;
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
        if (references.length) results.push({ type: "hymn", hymn: { id, name: localizedName(entry, language), references } });
    }
    return results;
}
