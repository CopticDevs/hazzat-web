export function safeContentId(id: string): string {
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error("Invalid Hazzat content ID");
    return id;
}

export function createContentPaths() {
    const contentPath = (path: string) => `/v5/${path}`;
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

export const ContentPaths = createContentPaths();
