import { normalizeSearch, titleMatchScore, searchPlainText } from "./SearchMatching";
import { searchContent } from "./Search";
import { IHymnsDataProvider } from "./IHymnsDataProvider";

const reference = (name: string, nameAr?: string) => ({ name, nameAr, services: ["annual/vespers"], formats: {} });
function provider() {
    return {
        getSeasonList: jest.fn().mockResolvedValue([{ id: "annual", name: "Annual", displayName: "Annual" }]),
        getReferenceIndex: jest.fn().mockResolvedValue({
            psalm: reference("Psalm 150", "مزمور ١٥٠"), doxology: reference("Doxology", "ذُوكْصُولُوجِيَّة"),
            alternate: { ...reference("Canonical hymn"), usages: [
                { seasonId: "annual", serviceId: "vespers", name: "Rejoice O Mary", nameAr: "إفرحي يا مريم" },
                { seasonId: "annual", serviceId: "matins", name: "Third Sunday" }
            ] }, exact: reference("Doxolgy"), partial: reference("Festal Doxology")
        }),
        getServiceSummary: jest.fn().mockImplementation(async (_season, id) => ({ displayName: id })),
        getSearchTextIndex: jest.fn().mockResolvedValue([
            { hymnId: "alternate", seasonId: "annual", serviceId: "matins", passages: ["Glory to God in the highest", "السلام لك يا مريم", "ⲭⲉⲣⲉ ⲙⲁⲣⲓⲁ"] }
        ])
    } as unknown as jest.Mocked<IHymnsDataProvider>;
}

describe("search matching", () => {
    it.each([
        ["  PSALM-150! ", "psalm 150"], ["Éléison", "eleison"],
        ["إِلَـى آدَم ١٥٠", "الي ادم 150"], ["إلى آدم ۱۵۰", "الي ادم 150"],
        ["ⲬⲈⲢⲈ", "ⲭⲉⲣⲉ"], ["\u200fالسلام\u200f", "السلام"]
    ])("normalizes %s", (value, expected) => expect(normalizeSearch(value)).toBe(expected));
    it.each(["doxolgy", "doxoloyg", "doxxology", "doxolagy"])("tolerates %s", query => {
        expect(titleMatchScore(query, "Doxology")).toBe(100);
    });
    it("ranks exact, prefix, substring, reordered words and typos in that order", () => {
        expect(["Psalm", "Psalm 150", "The Psalm", "150 Psalm", "Pslam"].map(title => titleMatchScore("psalm", title)))
            .toEqual([400, 350, 300, 300, 100]);
        expect(titleMatchScore("mary rejoice", "Rejoice O Mary")).toBe(250);
        expect(titleMatchScore(normalizeSearch("مرييم"), "مريم")).toBe(100);
    });
    it("does not fuzzy-match short tokens, numbers or unrelated titles", () => {
        expect(titleMatchScore("god", "Good")).toBe(0);
        expect(titleMatchScore("psalm 151", "Psalm 150")).toBe(0);
        expect(titleMatchScore("xyzxyz", "Doxology")).toBe(0);
        expect(titleMatchScore("mary unknown", "Rejoice Mary")).toBe(0);
    });
    it("extracts safe plain text and preserves boundaries and entities", () => {
        expect(searchPlainText('<p>Lord &amp; God<br>have <b>mercy</b></p><p>on us</p><script>bad</script><style>bad</style>'))
            .toBe("Lord & God have mercy on us");
    });
});

describe("ranked search", () => {
    it("keeps exact title results ahead of fuzzy matches without loading text", async () => {
        const p = provider();
        const results = await searchContent(p, "doxolgy", "en");
        expect(results[0].hymn?.id).toBe("exact");
        expect(results.map(result => result.hymn?.id)).toContain("doxology");
        expect(p.getSearchTextIndex).not.toHaveBeenCalled();
    });
    it("preserves IDs, Arabic titles, contextual names and locale display", async () => {
        const p = provider();
        expect((await searchContent(p, "psalm", "ar"))[0].hymn?.name).toBe("مزمور ١٥٠");
        expect((await searchContent(p, "مزمور 150", "en"))[0].hymn?.id).toBe("psalm");
        const result = (await searchContent(p, "افرحى يا مريم", "ar"))[0].hymn!;
        expect(result.id).toBe("alternate");
        expect(result.references.map(ref => ref.serviceId)).toEqual(["vespers"]);
        expect(result.references[0].hymnName).toBe("إفرحي يا مريم");
    });
    it.each(["glory to god", "السَّلام لك", "ⲬⲈⲢⲈ ⲙⲁⲣⲓⲁ"])("finds remembered words across languages: %s", async query => {
        const p = provider();
        expect(await searchContent(p, query, "en")).toEqual([]);
        const results = await searchContent(p, query, "en", true);
        expect(results).toHaveLength(1);
        expect(results[0].hymn?.references.map(ref => ref.serviceId)).toEqual(["matins"]);
        expect(results[0].hymn?.snippet).toBeTruthy();
    });
    it("does not match fragments or join distinct passages/languages", async () => {
        expect(await searchContent(provider(), "high", "en", true)).toEqual([]);
        expect(await searchContent(provider(), "highest السلام", "en", true)).toEqual([]);
    });
    it("deduplicates usages and includes a snippet near late matches", async () => {
        const p = provider();
        p.getReferenceIndex.mockResolvedValue({ alternate: { ...reference("Glory to God"), services: ["annual/matins", "annual/matins"] } });
        (p.getSearchTextIndex as jest.Mock).mockResolvedValue([{ hymnId: "alternate", seasonId: "annual", serviceId: "matins",
            passages: ["Introduction ".repeat(50) + "Glory to God in the highest"] }]);
        const result = (await searchContent(p, "glory to god", "en", true))[0].hymn!;
        expect(result.references).toHaveLength(1);
        expect(result.snippet).toContain("Glory to God");
        expect(p.getServiceSummary).toHaveBeenCalledTimes(1);
    });
    it.each(["", "a", "ـَ", "!!!", "x".repeat(201)])("rejects invalid or overly broad input before IO: %s", async query => {
        const p = provider();
        expect(await searchContent(p, query, "en", true)).toEqual([]);
        expect(p.getReferenceIndex).not.toHaveBeenCalled();
        expect(p.getSearchTextIndex).not.toHaveBeenCalled();
    });
    it("reports text loading failure instead of a misleading empty result", async () => {
        const p = provider();
        (p.getSearchTextIndex as jest.Mock).mockRejectedValue(new Error("Unavailable"));
        await expect(searchContent(p, "mercy", "en", true)).rejects.toThrow("Unavailable");
    });
});
