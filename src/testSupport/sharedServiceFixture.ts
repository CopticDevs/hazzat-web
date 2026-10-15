const types = ["Text", "Hazzat", "VerticalHazzat", "MusicalNotes", "Audio", "Video", "Information"];
/** Decompose reader fixtures into independently fetched v4 records. Test-only. */
export function sharedServiceFixture(service: any, extra: Record<string, unknown> = {}) {
    const files: Record<string, unknown> = { ...extra };
    let counter = 0;
    const hymns = (service.hymns ?? []).map((hymn: any) => {
        files[`/v4/hymns/${hymn.id}/hymn.json`] = { schemaVersion: 4, id: hymn.id, name: hymn.name, ...(hymn.nameAr ? { nameAr: hymn.nameAr } : {}) };
        const formats: Record<string, string[]> = {}, formatMetadata: Record<string, unknown> = {};
        for (const [position, format] of (hymn.formats ?? []).entries()) {
            formatMetadata[format.id] = { name: format.name, order: format.order ?? position + 1, position };
            formats[format.id] = (format.variations ?? []).map((variation: any) => {
                const id = `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`;
                files[`/v4/content/${id}.json`] = { schemaVersion: 4, id, name: variation.name, ...(variation.nameAr ? { nameAr: variation.nameAr } : {}), contentType: variation.contentType ?? types[Number(format.id) - 1], content: variation.content };
                return id;
            });
        }
        return { hymnId: hymn.id, order: hymn.order, formats, formatMetadata };
    });
    files[`/v4/seasons/${service.seasonId}/services/${service.id}.json`] = { ...service, schemaVersion: 4, hymns };
    return async (path: string) => {
        if (!(path in files)) throw new Error(`Missing fixture: ${path}`);
        return { data: files[path] };
    };
}

export function assignedFormatFixture(id: string, name: string, order: number): any {
    const payloads = [{ paragraphs: [] }, { englishHazzat: "ABC" }, { englishVerticalHazzat: "ABC" }, { musicXml: "<score-partwise />" }, { audioFilePath: "https://example.com/audio.mp3" }, { englishVideo: "https://example.com/video.mp4" }, { englishInformation: "Information" }];
    return { id, name, order, variationCount: 1, variations: [{ id: "standard", name: "Standard", order: 1, contentType: types[Number(id) - 1], content: payloads[Number(id) - 1] }] };
}
