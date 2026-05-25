export const CONTENT_VERSION = process.env.REACT_APP_HAZZAT_CONTENT_VERSION || "v3";

function contentPath(path: string): string {
    return `/${CONTENT_VERSION}/${path.replace(/^\/+/, "")}`;
}

export const ContentPaths = {
    seasons: () => contentPath("metadata/seasons.json"),
    seasonsArabic: () => contentPath("metadata/seasons.ar.json"),
    hymnReferences: () => contentPath("metadata/hymn-references.json"),
    service: (seasonId: string, serviceId: string) =>
        contentPath(`seasons/${seasonId}/services/${serviceId}.json`)
};
