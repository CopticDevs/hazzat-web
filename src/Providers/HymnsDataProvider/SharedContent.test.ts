const ref = (contentId: string) => ({contentId, name: "Standard", nameAr: "المعتاد"});
import axios from "axios";
import { ContentResourceClient } from "./ContentResourceClient";
import { HymnsDataProvider } from "./HymnsDataProvider";
import { searchContent } from "./Search";
import { SharedLibraryRecord, SharedService, validateService } from "./SharedContent";
import { getBookletSections, hasBookletFormat } from "../../Booklets/BookletPdfGenerator";

jest.mock("axios", () => ({ create: jest.fn() }));
const TEXT = "11111111-1111-4111-8111-111111111111";
const FIRST = "22222222-2222-4222-8222-222222222222";
const SECOND = "33333333-3333-4333-8333-333333333333";
const SCORE = "44444444-4444-4444-8444-444444444444";
const AUDIO = "55555555-5555-4555-8555-555555555555";

const service = (seasonId: string, serviceId: string, title: string): SharedService => ({
    schemaVersion: 5, id: serviceId, seasonId, name: serviceId, order: 1,
    hymns: [{ hymnId: "aspasmos-adam", name: title, order: 2,
        formats: { "1": [ref(TEXT)], "2": [ref(SECOND), ref(FIRST)], "4": [ref(SCORE)], "5": [ref(AUDIO)], "7": [] },
        formatMetadata: { "1": { name: "Text", order: 2, position: 1 }, "2": { name: "Hazzat", order: 2, position: 0 } } },
        { hymnId: "opening", order: 1, formats: { "2": [ref(FIRST)] } }]
});

const record = (id: string, contentType: SharedLibraryRecord["contentType"], content: SharedLibraryRecord["content"]): SharedLibraryRecord => ({
    schemaVersion: 5, id, name: "Standard", nameAr: "المعتاد", contentType, content
});

describe("v5 service resolution and contextual titles", () => {
    let files: Record<string, unknown>;
    let get: jest.Mock;
    beforeEach(() => {
        ContentResourceClient.clear();
        files = {
            "/v5/metadata/seasons.json": [
                { id: "annual", name: "Annual", order: 1, serviceIds: ["basil"] },
                { id: "kiahk", name: "Kiahk", order: 2, serviceIds: ["liturgy"] }
            ],
            "/v5/metadata/seasons.ar.json": {},
            "/v5/metadata/hymn-references.json": {
                "aspasmos-adam": { name: "Aspasmos Adam", nameAr: "أسبسمس", services: ["annual/basil", "kiahk/liturgy"], formats: {} },
                opening: { name: "Opening", services: ["annual/basil", "kiahk/liturgy"], formats: {} }
            },
            "/v5/seasons/annual/services/basil.json": service("annual", "basil", "Aspasmos Adam (Rejoice O Mary)"),
            "/v5/seasons/kiahk/services/liturgy.json": service("kiahk", "liturgy", "Aspasmos Adam (3rd Sunday)"),
            "/v5/hymns/aspasmos-adam/hymn.json": { schemaVersion: 5, id: "aspasmos-adam", name: "Aspasmos Adam", nameAr: "أسبسمس" },
            "/v5/hymns/opening/hymn.json": { schemaVersion: 5, id: "opening", name: "Opening" },
            [`/v5/content/${TEXT}.json`]: record(TEXT, "Text", { paragraphs: [{ columns: [{ language: "English", content: "Shared text" }] }] }),
            [`/v5/content/${FIRST}.json`]: record(FIRST, "Hazzat", { englishHazzat: "first", arabicHazzat: null }),
            [`/v5/content/${SECOND}.json`]: record(SECOND, "Hazzat", { englishHazzat: "second" }),
            [`/v5/content/${SCORE}.json`]: record(SCORE, "MusicalNotes", { musicXml: "<score-partwise />" }),
            [`/v5/content/${AUDIO}.json`]: record(AUDIO, "Audio", { audioFilePath: "https://example.com/audio.mp3" })
        };
        get = jest.fn(async (path: string) => {
            if (!(path in files)) throw new Error(`Missing file: ${path}`);
            return { data: files[path] };
        });
        (axios.create as jest.Mock).mockReturnValue({ get });
    });

    const provider = (language = "en", base = "https://content.example") => new HymnsDataProvider(language, "https://unused.example", base, {});

    it("does not request a legacy feed when a v4 dependency is unavailable", async () => {
        delete files[`/v5/content/${FIRST}.json`];
        await expect(provider().getService("annual", "basil")).rejects.toThrow("Missing file");
        expect(get.mock.calls.every(([path]) => path.startsWith("/v5/"))).toBe(true);
    });

    it("preserves service-specific titles, unchanged names, hymn order, variation order, and fixed format order", async () => {
        const annual = await provider().getService("annual", "basil");
        const kiahk = await provider().getService("kiahk", "liturgy");
        expect(annual?.hymns?.map(h => h.id)).toEqual(["opening", "aspasmos-adam"]);
        const hymn = annual!.hymns![1];
        expect(hymn.displayName).toBe("Aspasmos Adam (Rejoice O Mary)");
        expect(kiahk!.hymns![1].displayName).toBe("Aspasmos Adam (3rd Sunday)");
        expect(hymn.formats?.map(f => f.id)).toEqual(["1", "2", "4", "5"]);
        expect(hymn.formats![1].variations?.map(v => [v.id, v.name, v.order])).toEqual([[SECOND, "Standard", 1], [FIRST, "Standard", 2]]);
        expect(hymn.formats![1].variations![1].content).toEqual({ englishHazzat: "first", arabicHazzat: null });
        expect(hasBookletFormat([annual!], "regular")).toBe(true);
        expect(getBookletSections([annual!], ["regular"]).find(section => section.hymn === hymn)!.format.variations!.map(v => v.id)).toEqual([SECOND, FIRST]);
        expect(kiahk!.hymns![1].formats![0].variations![0].id).toBe(TEXT);
        expect(get.mock.calls.filter(([path]) => path === `/v5/content/${FIRST}.json`)).toHaveLength(1);
    });

    it("keeps contextual Arabic titles and shared variation translations independent", async () => {
        const source = files["/v5/seasons/annual/services/basil.json"] as SharedService;
        source.hymns[0].nameAr = "عنوان خاص";
        const hymn = (await provider("ar").getService("annual", "basil"))!.hymns![1];
        expect(hymn.displayName).toBe("عنوان خاص");
        expect(hymn.formats![1].variations![0].displayName).toBe("المعتاد");
        const untranslated = (await provider("ar").getService("kiahk", "liturgy"))!.hymns![1];
        expect(untranslated.displayName).toBe("Aspasmos Adam (3rd Sunday)");
    });

    it("shares dependencies across simultaneous providers and isolates feeds and returned payloads", async () => {
        const [a, b] = await Promise.all([provider().getService("annual", "basil"), provider().getService("annual", "basil")]);
        expect(get.mock.calls.filter(([path]) => path === `/v5/content/${FIRST}.json`)).toHaveLength(1);
        (a!.hymns![0].formats![0].variations![0].content as any).englishHazzat = "mutated";
        expect((b!.hymns![0].formats![0].variations![0].content as any).englishHazzat).toBe("first");
        await provider("en", "https://other.example").getService("annual", "basil");
        expect(get.mock.calls.filter(([path]) => path === `/v5/content/${FIRST}.json`)).toHaveLength(2);
    });

    it("searches contextual titles using thin summaries without loading content", async () => {
        const result = await searchContent(provider(), "3rd Sunday", "en");
        expect(result[0].hymn?.references).toEqual([{ seasonId: "kiahk", seasonName: "Kiahk", serviceId: "liturgy", serviceName: "liturgy", hymnName: "Aspasmos Adam (3rd Sunday)" }]);
        expect(get.mock.calls.some(([path]) => path.includes("/content/") || path.includes("/hymns/"))).toBe(false);
        const summaries = await provider().getServiceSummaryList("annual");
        expect(summaries[0].hymns).toBeUndefined();
    });

    it.each(["missing", "wrong-id", "wrong-type", "malformed"])("rejects %s dependencies and recovers on retry without partial services", async mode => {
        const path = `/v5/content/${FIRST}.json`;
        const original = files[path];
        if (mode === "missing") delete files[path];
        if (mode === "wrong-id") files[path] = { ...(original as object), id: SECOND };
        if (mode === "wrong-type") files[path] = record(FIRST, "Audio", { audioFilePath: "https://example.com/a" });
        if (mode === "malformed") files[path] = record(FIRST, "Hazzat", { englishHazzat: 42 });
        await expect(provider().getService("annual", "basil")).rejects.toThrow();
        files[path] = original;
        expect((await provider().getService("annual", "basil"))?.hymns).toHaveLength(2);
    });

    it("refuses incomplete booklet service lists", async () => {
        delete files["/v5/seasons/kiahk/services/liturgy.json"];
        await expect(provider().getServiceList("kiahk")).rejects.toThrow();
    });

    it("validates unsafe IDs, duplicate references, format metadata, and localized overrides", () => {
        const source = service("annual", "basil", "Title");
        source.hymns[0].formats["2"] = [ref(FIRST), ref(FIRST)];
        expect(() => validateService(source, "annual", "basil")).toThrow();
        expect(() => validateService(service("annual", "basil", "Title"), "other", "basil")).toThrow();
        const invalid = service("annual", "basil", "Title");
        (invalid.hymns[0] as any).nameAr = 1;
        expect(() => validateService(invalid, "annual", "basil")).toThrow();
    });
    it("loads services with blank optional Arabic titles saved by the admin", async () => {
        const source = files["/v5/seasons/annual/services/basil.json"] as SharedService;
        source.nameAr = "";
        source.hymns[0].nameAr = "";
        source.hymns[0].formatMetadata!["2"].nameAr = "";
        (files["/v5/hymns/aspasmos-adam/hymn.json"] as any).nameAr = "";
        (files[`/v5/content/${FIRST}.json`] as SharedLibraryRecord).nameAr = "";
        source.hymns[0].formats["2"][1].nameAr = "";
        const english = await provider().getService("annual", "basil");
        const arabic = await provider("ar").getService("annual", "basil");
        expect(english?.hymns).toHaveLength(2);
        const hymn = arabic!.hymns![1];
        expect(hymn.displayName).toBe("Aspasmos Adam (Rejoice O Mary)");
        expect(hymn.formats![1].variations![1].displayName).toBe("Standard");
        expect(source.hymns[0].nameAr).toBe("");
    });

    it("still rejects empty required titles", async () => {
        const source = service("annual", "basil", "Title");
        source.name = "";
        expect(() => validateService(source, "annual", "basil")).toThrow("Invalid shared-content name");
        (files[`/v5/content/${FIRST}.json`] as SharedLibraryRecord).name = "";
        await expect(provider().getService("annual", "basil")).rejects.toThrow("Invalid shared-content name");
    });

    it.each(["", "  \t\n"])("falls back to English for blank translated titles (%j)", async blank => {
        const source = files["/v5/seasons/annual/services/basil.json"] as SharedService;
        source.nameAr = blank;
        source.hymns[0].nameAr = blank;
        source.hymns[0].formatMetadata!["2"].nameAr = blank;
        (files["/v5/hymns/aspasmos-adam/hymn.json"] as any).nameAr = blank;
        (files[`/v5/content/${FIRST}.json`] as SharedLibraryRecord).nameAr = blank;
        source.hymns[0].formats["2"][1].nameAr = blank;
        files["/v5/metadata/seasons.ar.json"] = { annual: { name: blank, verse: "", services: { basil: blank } } };
        const ar = provider("ar");
        expect((await ar.getSeason("annual"))?.displayName).toBe("Annual");
        expect((await ar.getServiceSummary("annual", "basil"))?.displayName).toBe(source.name);
        const result = await ar.getService("annual", "basil");
        expect(result?.displayName).toBe(source.name);
        expect(result!.hymns![1].displayName).toBe("Aspasmos Adam (Rejoice O Mary)");
        expect(result!.hymns![1].formats![1].variations![1].displayName).toBe("Standard");
        expect(source.hymns[0].nameAr).toBe(blank);
    });

    it.each(["service", "assignment", "format", "identity", "content", "season"])("requires English %s titles even when Arabic is provided", async kind => {
        const source = files["/v5/seasons/annual/services/basil.json"] as SharedService;
        const target = kind === "service" ? source : kind === "assignment" ? source.hymns[0] : kind === "format" ? source.hymns[0].formatMetadata!["2"] : kind === "identity" ? files["/v5/hymns/aspasmos-adam/hymn.json"] : kind === "content" ? files[`/v5/content/${FIRST}.json`] : (files["/v5/metadata/seasons.json"] as any[])[0];
        Object.assign(target as object, { name: "  ", nameAr: "عنوان" });
        const ar = provider("ar");
        await expect(kind === "season" ? ar.getServiceSummaryList("annual") : ar.getService("annual", "basil")).rejects.toThrow("Invalid shared-content name");
    });

});

it("uses per-placement English and Arabic titles after a shared library rename", async () => {
    const payload = record(FIRST, "Hazzat", {englishHazzat: "same payload"}); payload.name = "Descriptive library label"; payload.nameAr = "اسم المكتبة";
    const make = (name: string, nameAr?: string): SharedService => ({schemaVersion: 5, id: "s", seasonId: "annual", name: "Service", order: 1, hymns: [{hymnId: "h", order: 1, formats: {"2": [{contentId: FIRST, name, nameAr}]}}]});
    const {resolveSharedService} = await import("./SharedContent");
    const readIdentity = async () => ({schemaVersion: 5 as const, id: "h", name: "Hymn"});
    const first = await resolveSharedService(make("First title", "الأول"), readIdentity, async () => payload, "ar");
    const second = await resolveSharedService(make("Second title"), readIdentity, async () => payload, "ar");
    expect(first.hymns![0].formats![0].variations![0].displayName).toBe("الأول");
    expect(second.hymns![0].formats![0].variations![0].displayName).toBe("Second title");
});
