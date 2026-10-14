export type ContentVersion = "v3" | "v4";

export function parseContentVersion(value: string = "v3"): ContentVersion {
    if (value !== "v3" && value !== "v4") throw new Error("Unsupported Hazzat content version");
    return value;
}

export const CONTENT_VERSION = parseContentVersion(process.env.REACT_APP_HAZZAT_CONTENT_VERSION);

export function safeContentId(id: string): string {
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error("Invalid Hazzat content ID");
    return id;
}

export function createContentPaths(version: ContentVersion) {
    const contentPath = (path: string) => `/${version}/${path}`;
    return {
        seasons: () => contentPath("metadata/seasons.json"),
        seasonsArabic: () => contentPath("metadata/seasons.ar.json"),
        hymnReferences: () => contentPath("metadata/hymn-references.json"),
        service: (seasonId: string, serviceId: string) =>
            contentPath(`seasons/${safeContentId(seasonId)}/services/${safeContentId(serviceId)}.json`),
        hymn: (hymnId: string) => contentPath(`hymns/${safeContentId(hymnId)}/hymn.json`),
        content: (contentId: string) => contentPath(`content/${safeContentId(contentId)}.json`)
    };
}

export const ContentPaths = createContentPaths(CONTENT_VERSION);
