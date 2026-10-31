import { PDFArray, PDFDocument, PDFName, PDFNumber, PDFPage, PDFRawStream, decodePDFRawStream } from "pdf-lib";
import { loadCoverCenterVineArtwork } from "./BookletCenterVineRenderer";
import { loadCoverCornerArtwork } from "./BookletCornerRenderer";
import fs from "fs";
import path from "path";
import {
    BookletFontSources,
    BookletImageSources,
    EmbeddedFonts,
    TextRun,
    calculateTocPageCount,
    layoutBookletToc,
    TocEntry,
    generateSeasonBookletPdf,
    getBookletSections,
    filterBookletServicesLanguages,
    getBookletFileName,
    hasBookletVariationContent,
    layoutBookletTextTable,
    formatGeneratedMonthYear,
    getBookletImpositionOrder,
    getCoverDisplayTitle,
    getPaddingPageCount,
    getPrintLogicalPageCount,
    getDrawableRunText,
    hasBookletFormat,
    normalizeFontKey,
    parseHazzatHtmlToLines,
    wrapRuns
} from "./BookletPdfGenerator";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { ContentLanguage, ContentType, ITextContent } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import { renderBookletMusic } from "./BookletMusicRenderer";

jest.mock("./BookletMusicRenderer", () => ({ renderBookletMusic: jest.fn() }));

beforeAll(() => Promise.all([loadCoverCornerArtwork(readImage("bookletCoverCorner.bin")),
    loadCoverCenterVineArtwork(readImage("bookletCoverCenterVine.bin"))]));

function createFakeFonts(): EmbeddedFonts {
    const fakeFont = {
        widthOfTextAtSize: (text: string, size: number) => text.length * size * 0.5
    };

    return {
        title: fakeFont,
        english: fakeFont,
        arabic: fakeFont,
        coptic: fakeFont,
        copticFallback: fakeFont,
        hazzat: fakeFont,
        hazzatVertical: fakeFont,
        hazzatArabic: fakeFont,
        hazzatVerticalArabic: fakeFont
    } as unknown as EmbeddedFonts;
}

function readFont(fileName: string): ArrayBuffer {
    const buffer = fs.readFileSync(path.join(process.cwd(), "src", "fonts", fileName));
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function createFontSources(): BookletFontSources {
    return {
        title: readFont("TrajanPro-Regular.ttf"),
        arabic: readFont("NotoNaskhArabic-Regular.ttf"),
        coptic: readFont("cs_avva_shenouda.ttf"),
        copticFallback: readFont("cs_new_athanasius.ttf"),
        hazzat: readFont("hazzat1_10a.ttf"),
        hazzatVertical: readFont("HazzatV.ttf"),
        hazzatArabic: readFont("HazzatA.ttf"),
        hazzatVerticalArabic: readFont("HazzatVA.ttf")
    };
}

function readImage(fileName: string): ArrayBuffer {
    const buffer = fs.readFileSync(path.join(process.cwd(), "src", "images", fileName));
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function createImageSources(): BookletImageSources {
    return {
        frontCoverBackground: readImage("bookletBackCoverBackground.jpg"),
        frontCoverLogo: readImage("logo.png"),
        backCoverBackground: readImage("bookletBackCoverBackground.jpg"),
        backCoverLogo: readImage("logo.png"),
        serviceDivider: undefined,
        variationDivider: undefined
    };
}

function createSeason(id = "nativity", displayName = "Nativity"): ISeasonInfo {
    return {
        id,
        name: displayName,
        displayName,
        order: 1,
        isDateSpecific: false,
        serviceIds: ["vespers"]
    };
}

function createService(): IServiceInfo {
    return {
        id: "vespers",
        name: "Vespers",
        displayName: "Vespers",
        verse: "",
        order: 1,
        isDateSpecific: false,
        seasonId: "nativity",
        hymns: [
            {
                id: "introduction",
                name: "Introduction",
                displayName: "Introduction",
                order: 1,
                formats: [
                    {
                        id: "2",
                        name: "Hazzat",
                        order: 2,
                        variationCount: 1,
                        variations: [
                            {
                                id: "standard",
                                name: "Standard",
                                displayName: "Standard",
                                content: {
                                    contentType: "HazzatContent" as ContentType,
                                    copticHazzat: "<span class=\"CopticFont\">P[oic </span><span class=\"HazzatFont\">x c </span>",
                                    englishHazzat: "<p class=\"EnglishFont\">Lord have mercy ارحمنا</p>",
                                    arabicHazzat: "<span class=\"ArabicFont\">يا رَّب ارحم</span>"
                                }
                            }
                        ]
                    },
                    {
                        id: "3",
                        name: "Vertical Hazzat",
                        order: 3,
                        variationCount: 1,
                        variations: [
                            {
                                id: "standard",
                                name: "Standard",
                                displayName: "Standard",
                                content: {
                                    contentType: "VerticalHazzatContent" as ContentType,
                                    copticVerticalHazzat: "<span class=\"CopticFont\">P[oic </span><span class=\"HazzatVFont\">x c </span>",
                                    englishVerticalHazzat: "<p class=\"EnglishFont\">Lord have mercy</p>",
                                    arabicVerticalHazzat: "<span class=\"ArabicFont\">يا رب ارحم</span>"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    };
}

describe("BookletPdfGenerator", () => {
    it.each(["display", "print"] as const)("filters booklet languages before pagination and omits format labels (%s)", async layoutKind => {
        const service = withText();
        const original = JSON.stringify(service);
        const filtered = filterBookletServicesLanguages([service], [ContentLanguage.Arabic]);
        expect(filtered[0].hymns![0].formats!.map(format => format.id)).toEqual(["1", "2", "3"]);
        const text = filtered[0].hymns![0].formats!.find(format => format.id === "1")!.variations![0].content as ITextContent;
        expect(text.paragraphs[0].columns.map(column => column.language)).toEqual([ContentLanguage.Arabic]);
        expect(filterBookletServicesLanguages([service], [])).toEqual([]);
        const draws = jest.spyOn(PDFPage.prototype, "drawText");
        try {
            await generateSeasonBookletPdf({ season: createSeason(), services: [service], formatKinds: ["text", "regular", "vertical"], layoutKind,
                languages: [ContentLanguage.Arabic], fontSources: createFontSources(), imageSources: createImageSources() });
            const words = draws.mock.calls.map(([text]) => text);
            expect(words).not.toContain("Mercy");
            expect(words).not.toContain("Lord");
            expect(words.some(word => /[\u0600-\u06ff]/.test(word))).toBe(true);
            expect(words).not.toEqual(expect.arrayContaining(["TEXT", "HAZZAT", "VERTICAL HAZZAT"]));
            expect(words.filter(word => ["TEXT", "HAZZAT", "VERTICAL HAZZAT"].includes(word))).toEqual([]);
            expect(JSON.stringify(service)).toBe(original);
        } finally { draws.mockRestore(); }
    });

    it.each(["hymn", "format"] as const)("keeps wrapped hymn headings with their opening content (%s grouping)", async groupingKind => {
        const service = withText();
        const base = service.hymns![0];
        service.hymns = Array.from({ length: 12 }, (_, index) => ({ ...base, id: `hymn-${index}`, order: index,
            displayName: `Heading${index} with a sufficiently long name to wrap across multiple lines of the page`,
            formats: [{ ...base.formats!.find(format => format.id === "1")!, variations: [{ id: "verse", name: "Verse", displayName: "Verse", content: {
                contentType: ContentType.TextContent, paragraphs: [{ columns: [{ language: ContentLanguage.English,
                    content: `Body${index} ` + "mercy upon us ".repeat(20 + index * 5) }] }]
            } }] }]
        }));
        const draws = jest.spyOn(PDFPage.prototype, "drawText");
        try {
            await generateSeasonBookletPdf({ season: createSeason(), services: [service], formatKinds: ["text"], groupingKind, layoutKind: "display",
                fontSources: createFontSources(), imageSources: { ...createImageSources(), serviceDivider: readImage("bookletBackCoverBackground.jpg") } });
            for (let index = 0; index < 12; index++) {
                const heading = draws.mock.calls.findIndex(([text, options]) => text.startsWith(`Heading${index} `) && options?.size === 11.5);
                const body = draws.mock.calls.findIndex(([text]) => text === `Body${index}`);
                expect(heading).toBeGreaterThan(-1);expect(body).toBeGreaterThan(-1);
                expect(draws.mock.instances[heading]).toBe(draws.mock.instances[body]);
                expect(draws.mock.calls[body][1]!.x).toBe(24);
            }
            expect(draws.mock.calls.filter(([text, options]) => text === "Text" && options?.size !== 11)).toHaveLength(0);
        } finally { draws.mockRestore(); }
    });
    it.each(["display", "print"] as const)("exports independent text and notation colors while keeping comments distinct (%s)", async layoutKind => {
        const service = withText();
        service.hymns![0].formats![0].variations![0].content = { contentType: ContentType.TextContent, paragraphs: [
            { columns: [{ language: ContentLanguage.English, content: "TextInk" }, { language: ContentLanguage.Coptic, content: "Nai" }, { language: ContentLanguage.Arabic, content: "ارحمنا" }] },
            { isComment: true, columns: [{ language: ContentLanguage.English, content: "CommentInk" }] }
        ] };
        service.hymns![0].formats![1].variations![0].content = { contentType: ContentType.HazzatContent,
            englishHazzat: 'WordsInk <span class="HazzatFont">x</span>', copticHazzat: '', arabicHazzat: 'كلمات <span class="HazzatAFont">x</span>' };
        service.hymns![0].formats![2].variations![0].content = { contentType: ContentType.VerticalHazzatContent,
            englishVerticalHazzat: 'VerticalWords <span class="HazzatVFont">x</span>', copticVerticalHazzat: '', arabicVerticalHazzat: 'كلمات <span class="HazzatVAFont">x</span>' };
        const draws = jest.spyOn(PDFPage.prototype, "drawText");
        try {
            const pdf = await generateSeasonBookletPdf({ season: createSeason(), services: [service], formatKinds: ["text", "regular", "vertical"], layoutKind,
                appearance: { textColor: "NAVY", hazzatColor: "MAROON" }, fontSources: createFontSources(), imageSources: createImageSources() });
            expect((await PDFDocument.load(pdf)).getPageCount()).toBeGreaterThan(0);
            for (const word of ["TextInk", "Nai", "ارحمنا", "WordsInk", "VerticalWords"]) {
                const calls = draws.mock.calls.filter(([text]) => text === word);
                expect(calls.length).toBeGreaterThan(0);
                calls.forEach(([, options]) => expect(options?.color).toEqual({ type: "RGB", red: 0, green: 0, blue: 128 / 255 }));
            }
            const notes = draws.mock.calls.filter(([text]) => text === "x");
            expect(notes.length).toBeGreaterThanOrEqual(3);
            notes.forEach(([, options]) => expect(options?.color).toEqual({ type: "RGB", red: 128 / 255, green: 0, blue: 0 }));
            expect(draws.mock.calls.find(([text]) => text === "CommentInk")![1]!.color).toEqual({ type: "RGB", red: .55, green: .16, blue: .14 });
        } finally { draws.mockRestore(); }
    });
    it("preserves multilingual comment styling across wrapping and PDF rendering", async () => {
        const columns = [
            { language: ContentLanguage.English, content: "Comment instruction" },
            { language: ContentLanguage.Coptic, content: "Nai nan" },
            { language: ContentLanguage.Arabic, content: "تعليق" }
        ];
        const content: ITextContent = { contentType: ContentType.TextContent, paragraphs: [
            { isComment: true, columns }, { columns: [{ language: ContentLanguage.English, content: "Normal hymn words" }, columns[1], columns[2]] },
            { columns: [{ language: ContentLanguage.English, content: "Next paragraph" }, columns[1], columns[2]] }
        ] };
        const table = layoutBookletTextTable(content, createFakeFonts(), 90);
        expect(table.rows[0].columns.flat(2).every(run => run.isComment)).toBe(true);
        expect(table.rows[1].columns.flat(2).some(run => run.isComment)).toBe(false);
        expect(parseHazzatHtmlToLines('<span class="EnglishComment">Note <b>nested</b></span> normal')[0])
            .toEqual([{ text: "Note nested", fontKey: "english", isComment: true }, { text: " normal", fontKey: "english" }]);
        const service = withText();
        service.hymns![0].formats![0].variations![0].content = content;
        const draws = jest.spyOn(PDFPage.prototype, "drawText");
        const rules = jest.spyOn(PDFPage.prototype, "drawLine");
        try {
            await generateSeasonBookletPdf({ season: createSeason(), services: [service], formatKinds: ["text"], layoutKind: "display", fontSources: createFontSources(), imageSources: createImageSources() });
            const comment = draws.mock.calls.find(([text]) => text === "Comment");
            const normal = draws.mock.calls.find(([text]) => text === "Normal");
            expect(comment).toBeDefined();
            expect(normal).toBeDefined();
            expect(comment![1]!.size).toBeLessThan(normal![1]!.size!);
            expect(comment![1]!.color).not.toEqual(normal![1]!.color);
            expect(comment![1]!.ySkew).toEqual({ type: "degrees", angle: 10 });
            const dividers = rules.mock.calls.map(([line]) => line).filter(line => line.thickness === .35);
            expect(dividers.length).toBeGreaterThan(0);
            expect(dividers.every(line => line.start.y < comment![1]!.y!)).toBe(true);
            expect(dividers.some(line => dividers.some(next => next !== line && next.start.x === line.end.x && Math.abs(next.start.y - line.end.y) < .001))).toBe(true);
        } finally { draws.mockRestore(); rules.mockRestore(); }
    });
    it.each(["display", "print"] as const)("generates a booklet after switching to Arabic navigation (%s)", async layoutKind => {
        const service = createService();
        service.displayName = "تسبحة نصف الليل";
        service.hymns![0].displayName = "لُبش الهوس الثاني (مارين أوأونه)";
        const format = service.hymns![0].formats![0];
        format.variations![0].displayName = "مارين أوأونه (Maren Ouonh)";
        format.variations!.push({ ...format.variations![0], id: "alternative", displayName: "على لحن خين أوشوت" });
        const draws = jest.spyOn(PDFPage.prototype, "drawText");
        try {
            const bytes = await generateSeasonBookletPdf({ season: createSeason("kiahk", "كيهك"), services: [service], formatKinds: ["regular"], layoutKind,
                fontSources: createFontSources(), imageSources: createImageSources() });
            expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(0);
            expect(draws.mock.calls.some(([text, options]) => text.includes("Maren Ouonh") && options?.font?.name === "Helvetica")).toBe(true);
            expect(draws.mock.calls.some(([text, options]) => text === "(" && options?.font?.name === "Helvetica")).toBe(true);
            expect(draws.mock.calls.map(([text]) => text).join("")).toContain("جدول المحتويات");
            expect(draws.mock.calls.some(([text]) => text === "Table of Contents")).toBe(false);
            const tocNumber = draws.mock.calls.find(([text, options]) => text === "٤" && options?.size === 8.5);
            const tocTitle = draws.mock.calls.find(([text, options]) => text === "تسبحة" && options?.size === 9.5);
            expect(tocNumber).toBeDefined();
            expect(tocTitle).toBeDefined();
            expect(tocNumber![1]!.x).toBeLessThan(tocTitle![1]!.x!);
            expect(tocNumber![1]!.font!.name).not.toBe("Helvetica");
        } finally { draws.mockRestore(); }
    });
    it("places service ornaments after each service and the contents when space permits", async () => {
        const first = createService();
        const second = { ...createService(), id: "matins", name: "Matins", displayName: "Matins", order: 2 };
        const images = jest.spyOn(PDFPage.prototype, "drawImage");
        const paths = jest.spyOn(PDFPage.prototype, "drawSvgPath");
        try {
            await generateSeasonBookletPdf({ season: createSeason(), services: [first, second], formatKinds: ["regular"], layoutKind: "display",
                fontSources: createFontSources(), imageSources: { ...createImageSources(), serviceDivider: readImage("logo.png"), variationDivider: fs.readFileSync(path.join(process.cwd(), "src", "images", "crossline.svg")) } });
            expect(images.mock.calls.filter(([, options]) => options?.opacity === .8)).toHaveLength(3);
            const crossPaths = Array.from(new DOMParser().parseFromString(fs.readFileSync(path.join(process.cwd(), "src", "images", "crossline.svg"), "utf8"), "image/svg+xml").querySelectorAll("path")).filter(path => path.getAttribute("d")?.trim()).length;
            // Two language transitions per service; no extra final cross before its grapevine.
            expect(paths.mock.calls.filter(([, options]) => options?.opacity === .65)).toHaveLength(4 * crossPaths);
        } finally { images.mockRestore(); paths.mockRestore(); }
    });

    it("uses grapevine paths from the current Hazzat logo", () => {
        const logo = new DOMParser().parseFromString(fs.readFileSync(path.join(process.cwd(), "src", "images", "logo.svg"), "utf8"), "image/svg+xml");
        const grapevine = new DOMParser().parseFromString(fs.readFileSync(path.join(process.cwd(), "src", "images", "bookletServiceDivider.svg"), "utf8"), "image/svg+xml");
        const logoPaths = new Set(Array.from(logo.querySelectorAll("path"), path => path.getAttribute("d")));
        const paths = Array.from(grapevine.querySelectorAll("path"), path => path.getAttribute("d"));
        expect(paths.length).toBeGreaterThan(10);
        expect(paths.every(path => logoPaths.has(path))).toBe(true);
    });
    it("accepts published v5 payloads without an inner contentType, including Coptic-only alternatives", () => {
        const payloads = [
            { name: "Explanation (Lobsh) of the 2nd Canticle (Maren Ouonh)", content: { englishHazzat: "Let us give thanks", copticHazzat: "Maren ouwnh" } },
            { name: "Maren Ouonh (on the tune of Khen Oushot)", content: { copticHazzat: "Maren ouwnh" } }
        ];
        const service = createService();
        service.hymns![0].formats![0].variations = payloads.map((v, i) => ({ ...v, id: String(i), displayName: v.name })) as any;
        const variations = service.hymns![0].formats![0].variations!;
        expect(variations.map(v => hasBookletVariationContent(v, "regular"))).toEqual([true, true]);
        expect(hasBookletFormat([service], "regular")).toBe(true);
        expect(getBookletSections([service], ["regular"])[0].format.variations).toHaveLength(2);
        expect(hasBookletVariationContent({ ...variations[0], content: { contentType: ContentType.HazzatContent, englishHazzat: "", copticHazzat: "", arabicHazzat: "" } }, "regular")).toBe(false);
    });

    it("keeps text columns without horizontal cell rules and separates consecutive variations", async () => {
        const service = withText();
        const text = service.hymns![0].formats![0];
        text.variations!.push({ ...text.variations![0], id: "second", name: "Second text", displayName: "Second text" });
        const lines = jest.spyOn(PDFPage.prototype, "drawLine");
        try {
            await generateSeasonBookletPdf({ season: createSeason(), services: [service], formatKinds: ["text"], layoutKind: "display", fontSources: createFontSources(), imageSources: createImageSources() });
            expect(lines.mock.calls.some(([line]) => line.start.y === line.end.y && line.start.x === 24 && line.end.x === 372 && line.thickness === .35)).toBe(false);
            expect(lines.mock.calls.filter(([line]) => line.thickness === .7).length).toBeGreaterThanOrEqual(3);
        } finally { lines.mockRestore(); }
    });
    it("lays out aligned text columns in English, Coptic, Arabic order without language heading rows", () => {
        const table = layoutBookletTextTable({ contentType: ContentType.TextContent, paragraphs: [
            { columns: [{ language: ContentLanguage.Arabic, content: "ارحمنا" }, { language: ContentLanguage.English, content: "Mercy" }, { language: ContentLanguage.Coptic, content: "Nai" }] },
            { columns: [{ language: ContentLanguage.English, content: "Next paragraph" }] },
            { columns: [] }
        ] }, createFakeFonts());
        expect(table.rows[0].languages).toEqual([ContentLanguage.English, ContentLanguage.Coptic, ContentLanguage.Arabic]);
        expect(table.rows).toHaveLength(2);
        const words = (column: TextRun[][]) => column.flat().map(run => run.text).join("");
        expect(table.rows[0].columns.map(words)).toEqual(["Mercy", "Nai", "ارحمنا"]);
        expect(table.rows[1].columns.map(words)).toEqual(["Next paragraph"]);
        expect(table.rows[1].languages).toEqual([ContentLanguage.English]);
        expect(table.rows[1].columnWidth).toBe(348);
        expect(table.rows.flatMap(row => row.columns.flat(2)).map(run => run.text)).not.toEqual(expect.arrayContaining(["ENGLISH", "COPTIC", "ARABIC"]));
    });

    it("reflows every language transition, including returning to three columns and Arabic-only verses", () => {
        const english = { language: "english" as ContentLanguage, content: "English verse" };
        const coptic = { language: ContentLanguage.Coptic, content: "Nai" };
        const arabic = { language: ContentLanguage.Arabic, content: "ارحمنا" };
        const blank = { language: ContentLanguage.Coptic, content: "  " };
        const table = layoutBookletTextTable({ contentType: ContentType.TextContent, paragraphs:
            [[arabic, english, coptic], [english, blank], [coptic, arabic], [english, coptic, arabic], [arabic], [english, coptic]]
                .map(columns => ({ columns }))
        }, createFakeFonts());
        expect(table.rows.map(row => row.languages)).toEqual([
            [ContentLanguage.English, ContentLanguage.Coptic, ContentLanguage.Arabic], [ContentLanguage.English],
            [ContentLanguage.Coptic, ContentLanguage.Arabic], [ContentLanguage.English, ContentLanguage.Coptic, ContentLanguage.Arabic],
            [ContentLanguage.Arabic], [ContentLanguage.English, ContentLanguage.Coptic]
        ]);
        expect(table.rows.map(row => row.columnWidth)).toEqual([108, 348, 168, 108, 348, 168]);
    });

    it.each([
        ["efemepsha-ghar-text.json", [...Array(5).fill(3), ...Array(31).fill(1)]],
        ["asomen-text.json", [2, 3, 2, 3, 2, 1, 2, 1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 3, 3, 2, 1, 1]]
    ] as const)("matches published paragraph language changes: %s", (file, counts) => {
        const { content } = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/Booklets/__fixtures__", file), "utf8"));
        const original = JSON.stringify(content);
        const table = layoutBookletTextTable(content, createFakeFonts());
        expect(table.rows.map(row => row.languages.length)).toEqual(counts);
        table.rows.filter(row => row.languages.length === 1).forEach(row => {
            expect(row.columnWidth).toBe(348);
            expect(row.languages).toEqual([file.startsWith("asomen") ? ContentLanguage.Coptic : ContentLanguage.English]);
        });
        expect(JSON.stringify(content)).toBe(original);
    });

    it.each(["display", "print"] as const)("draws a full-width verse between multilingual verses without extending dividers (%s)", async layoutKind => {
        const service = withText();
        const translated = [{ language: ContentLanguage.English, content: "Trilingual" },
            { language: ContentLanguage.Coptic, content: "Nai" }, { language: ContentLanguage.Arabic, content: "ارحمنا" }];
        service.hymns![0].formats![0].variations![0].content = { contentType: ContentType.TextContent, paragraphs: [
            { columns: translated },
            { columns: [{ language: ContentLanguage.English, content: "English ".repeat(7) + "WIDEEND" }] },
            { columns: translated }
        ] };
        const draws = jest.spyOn(PDFPage.prototype, "drawText"), rules = jest.spyOn(PDFPage.prototype, "drawLine");
        try {
            await generateSeasonBookletPdf({ season: createSeason(), services: [service], formatKinds: ["text"], layoutKind,
                fontSources: createFontSources(), imageSources: createImageSources() });
            const marker = draws.mock.calls.find(([text]) => text === "WIDEEND")![1]!;
            expect(marker.x).toBeGreaterThan(200);
            const first = draws.mock.calls.find(([text]) => text === "English")![1]!;
            expect(marker.y).toBe(first.y);
            const dividers = rules.mock.calls.map(([line]) => line).filter(line => line.thickness === .35);
            expect(dividers.length).toBe(4);
            expect(dividers.every(line => line.end.y > marker.y! || line.start.y < marker.y!)).toBe(true);
            expect(dividers[0].end.y).toBeGreaterThan(marker.y! + 12);
        } finally { draws.mockRestore(); rules.mockRestore(); }
    });

    it("wraps long translated paragraphs independently within fixed column widths", () => {
        const table = layoutBookletTextTable({ contentType: ContentType.TextContent, paragraphs: [{ columns: [
            { language: ContentLanguage.English, content: "Very long paragraph ".repeat(150) },
            { language: ContentLanguage.Arabic, content: "ارحمنا" }
        ] }] }, createFakeFonts());
        expect(table.rows[0].columns[0].length).toBeGreaterThan(50);
        expect(table.rows[0].columns[1]).toHaveLength(1);
        table.rows[0].columns.flat().forEach(line => expect(line.reduce((sum, run) => sum + run.text.length * run.size * .5, 0)).toBeLessThanOrEqual(table.rows[0].columnWidth));
    });
    it("includes musical notes alone or mixed and paginates every engraved score page", async () => {
        const service = createService();
        service.hymns![0].formats!.push({ id: "4", name: "Musical Notes", order: 4, variationCount: 1, variations: [{
            id: "score", name: "Score", displayName: "Score", content: { contentType: ContentType.MusicalNotesContent, musicXml: "<score-partwise />" }
        }] });
        const png = new Uint8Array(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=", "base64"));
        const renderer = renderBookletMusic as jest.MockedFunction<typeof renderBookletMusic>;
        renderer.mockResolvedValue(Array.from({ length: 3 }, () => ({ pngBytes: png, width: 648, height: 880 })));
        expect(hasBookletFormat([service], "musical")).toBe(true);
        expect(getBookletSections([service], ["musical"])).toHaveLength(1);
        for (const layoutKind of ["display", "print"] as const) {
            const bytes = await generateSeasonBookletPdf({
                season: createSeason(), services: [service], formatKinds: ["regular", "musical"], layoutKind,
                fontSources: createFontSources(), imageSources: createImageSources()
            });
            const pdf = await PDFDocument.load(bytes);
            expect(pdf.getPageCount()).toBeGreaterThan(layoutKind === "display" ? 4 : 2);
            expect(Buffer.from(bytes).toString("latin1")).toContain("/Subtype /Image");
        }
        expect(renderer).toHaveBeenCalledTimes(2);
        renderer.mockRejectedValueOnce(new Error("Invalid MusicXML"));
        await expect(generateSeasonBookletPdf({
            season: createSeason(), services: [service], formatKinds: ["musical"], layoutKind: "display",
            fontSources: createFontSources(), imageSources: createImageSources()
        })).rejects.toThrow("Invalid MusicXML");
    }, 30000);

    const withText = (): IServiceInfo => {
        const service = createService();
        service.hymns![0].formats!.unshift({ id: "1", name: "Text", order: 1, variationCount: 1, variations: [{
            id: "text", name: "Standard", displayName: "Standard", content: {
                contentType: ContentType.TextContent,
                paragraphs: [{ columns: [
                    { language: ContentLanguage.English, content: "<p>Text-only words: Lord have mercy.</p>" },
                    { language: ContentLanguage.Coptic, content: "<p>P[oic nai nan</p>" },
                    { language: ContentLanguage.Arabic, content: "<p>يا رب ارحم</p>" }
                ] }, { columns: [] }]
            }
        }] });
        return service;
    };

    it("includes text and orders mixed content by hymn or by format without mutating input", () => {
        const service = withText();
        service.hymns!.push({ ...service.hymns![0], id: "second", order: 2, name: "Second", displayName: "Second" });
        service.hymns!.reverse();
        const original = JSON.stringify(service);
        const kinds = ["vertical", "text", "regular", "text"] as const;
        expect(getBookletSections([service], [...kinds]).map(s => `${s.hymn.id}/${s.formatKind}`)).toEqual([
            "introduction/text", "introduction/regular", "introduction/vertical", "second/text", "second/regular", "second/vertical"
        ]);
        expect(getBookletSections([service], [...kinds], "format").map(s => `${s.hymn.id}/${s.formatKind}`)).toEqual([
            "introduction/text", "second/text", "introduction/regular", "second/regular", "introduction/vertical", "second/vertical"
        ]);
        expect(JSON.stringify(service)).toBe(original);
    });

    it("treats absent, blank, empty-HTML, and mismatched formats as unavailable", () => {
        const service = withText();
        const text = service.hymns![0].formats![0].variations![0];
        expect(hasBookletFormat([service], "text")).toBe(true);
        (text.content as ITextContent).paragraphs = [{ columns: [{ language: ContentLanguage.English, content: "<p> &nbsp; </p>" }] }];
        expect(hasBookletFormat([service], "text")).toBe(false);
        expect(getBookletSections([service], ["text"])).toEqual([]);
        expect(hasBookletVariationContent(text, "regular")).toBe(false);
        service.hymns![0].formats![0].variations = [];
        expect(hasBookletFormat([service], "text")).toBe(false);
    });

    it("names text and combined PDFs with the included formats", () => {
        expect(getBookletFileName(createSeason(), "text", "display")).toBe("nativity-text-booklet-display.pdf");
        expect(getBookletFileName(createSeason(), ["vertical", "text", "regular"], "print")).toBe("nativity-text-hazzat-vertical-hazzat-booklet-print.pdf");
    });

    it.each(["hymn", "format"] as const)("renders multilingual text and both notation formats grouped by %s", async groupingKind => {
        const options = {
            season: createSeason(), services: [withText()], formatKinds: ["text", "regular", "vertical"] as ("text" | "regular" | "vertical")[], groupingKind,
            fontSources: createFontSources(), imageSources: createImageSources(), generatedAt: new Date(2026, 4, 27)
        };
        const display = await PDFDocument.load(await generateSeasonBookletPdf({ ...options, layoutKind: "display" }));
        const print = await PDFDocument.load(await generateSeasonBookletPdf({ ...options, layoutKind: "print" }));
        expect(display.getPageCount()).toBeGreaterThan(4);
        expect(display.getPageCount() % 4).toBe(0);
        expect(print.getPageCount()).toBe(display.getPageCount() / 2);
        expect(print.getPages().every(page => page.getWidth() === 792 && page.getHeight() === 612)).toBe(true);
    }, 30000);

    it("generates a text-only device booklet", async () => {
        const bytes = await generateSeasonBookletPdf({
            season: createSeason(), services: [withText()], formatKinds: ["text"], layoutKind: "display",
            fontSources: createFontSources(), imageSources: createImageSources()
        });
        const pdf = await PDFDocument.load(bytes);
        expect(pdf.getPageCount()).toBeGreaterThan(4);
        expect(Buffer.from(bytes).toString("latin1")).toContain("/S /GoTo");
    });
    it("maps Hazzat HTML font classes and inline Hazzat font styles", () => {
        expect(normalizeFontKey("HazzatFont")).toBe("hazzat");
        expect(normalizeFontKey("hazzatvfont")).toBe("hazzatVertical");
        expect(normalizeFontKey("HazzatAFont")).toBe("hazzatArabic");
        expect(normalizeFontKey("HazzatVAFont")).toBe("hazzatVerticalArabic");
        expect(normalizeFontKey("CopticFont")).toBe("coptic");
        expect(normalizeFontKey("ArabicFont")).toBe("arabic");
        expect(normalizeFontKey("MsoNormal")).toBe("english");
        expect(normalizeFontKey("", "font-family:Hazzat; font-size: 12pt")).toBe("hazzat");
    });

    it("formats the generated month and year for inside front covers", () => {
        expect(formatGeneratedMonthYear(new Date(2026, 4, 27))).toBe("May 2026");
    });

    it("uses clean Passion Week cover titles without generated season artwork", () => {
        expect(getCoverDisplayTitle(createSeason("passion-pascha-week-good-friday", "Passion (Pascha) Week - Good Friday"))).toBe("Good Friday Hymns");
        expect(getCoverDisplayTitle(createSeason("passion-week-general-hours", "Passion Week General Hours"))).toBe("General Hours Hymns");
        expect(getCoverDisplayTitle(createSeason("the-lords-entry-into-jerusalem-palm-sunday", "The Lord's Entry into Jerusalem (Palm Sunday)"))).toBe("Palm Sunday Hymns");
        expect(getCoverDisplayTitle(createSeason("annual", "Annual"))).toBe("Annual Hymns");
        expect(getCoverDisplayTitle(createSeason("annual", "سنوي"))).toBe("الألحان السنوية");
    });

    it.each([["kiahk", "Kiahk", "Kiahk Hymns"], ["nativity", "Nativity", "Nativity Hymns"], ["great-lent", "Great Lent", "Great Lent Hymns"], ["kiahk", "Kiahk Hymns", "Kiahk Hymns"], ["kiahk", "كيهك", "ألحان كيهك"], ["kiahk", "ألحان كيهك", "ألحان كيهك"]])("includes Hymns in every season cover without duplicating it: %s / %s", (id, name, expected) => {
        expect(getCoverDisplayTitle(createSeason(id, name))).toBe(expected);
    });

    it("parses Hazzat HTML into text lines while preserving breaks and inherited fonts", () => {
        const lines = parseHazzatHtmlToLines(
            "<p class=\"CopticFont\">P[oic <span class=\"HazzatFont\">x c</span><br /><span class=\"ArabicFont\">يا رب</span></p>"
        );

        expect(lines).toEqual([
            [
                { text: "P[oic ", fontKey: "coptic" },
                { text: "x c", fontKey: "hazzat" }
            ],
            [
                { text: "يا رب", fontKey: "arabic" }
            ]
        ]);
    });

    it("uses standard text fallback for punctuation missing from the Arabic font", () => {
        const lines = parseHazzatHtmlToLines("<span class=\"ArabicFont\">20/21 أكتوبر</span>");

        expect(lines).toEqual([
            [
                { text: "20", fontKey: "arabic" },
                { text: "/", fontKey: "english" },
                { text: "21 أكتوبر", fontKey: "arabic" }
            ]
        ]);
    });

    it("collapses browser-style whitespace in Hazzat content", () => {
        const lines = parseHazzatHtmlToLines("<span class=\"CopticFont\">A      B</span><span class=\"HazzatFont\">   x      c</span>");

        expect(lines).toEqual([
            [
                { text: "A B", fontKey: "coptic" },
                { text: " x c", fontKey: "hazzat" }
            ]
        ]);
    });

    it("routes Arabic text to the Arabic font even when the HTML is mislabeled as English", () => {
        const lines = parseHazzatHtmlToLines("<span class=\"EnglishFont\">Lord ارحمنا</span>");

        expect(lines).toEqual([
            [
                { text: "Lord ", fontKey: "english" },
                { text: "ارحمنا", fontKey: "arabic" }
            ]
        ]);
    });

    it("wraps mixed text runs using the active embedded font metrics", () => {
        const wrapped = wrapRuns([
            { text: "alpha beta gamma", fontKey: "english", size: 10 }
        ], createFakeFonts(), 45);

        expect(wrapped).toEqual([
            [{ text: "alpha", fontKey: "english", size: 10 }],
            [{ text: "beta", fontKey: "english", size: 10 }],
            [{ text: "gamma", fontKey: "english", size: 10 }]
        ]);
    });

    it("keeps Arabic logical and splits words for RTL placement", () => {
        const wrapped = wrapRuns([
            { text: "السلام عليكم", fontKey: "arabic", size: 10 },
            { text: " مم ", fontKey: "hazzatArabic", size: 10 },
            { text: "يا مريم", fontKey: "arabic", size: 10 }
        ], createFakeFonts(), 300);

        expect(wrapped).toEqual([
            [
                { text: "السلام", fontKey: "arabic", size: 10 },
                { text: " ", fontKey: "arabic", size: 10 },
                { text: "عليكم", fontKey: "arabic", size: 10 },
                { text: " ", fontKey: "hazzatArabic", size: 10 },
                { text: "مم", fontKey: "hazzatArabic", size: 10 },
                { text: " ", fontKey: "hazzatArabic", size: 10 },
                { text: "يا", fontKey: "arabic", size: 10 },
                { text: " ", fontKey: "arabic", size: 10 },
                { text: "مريم", fontKey: "arabic", size: 10 }
            ]
        ]);
    });

    it("adds Arabic joining context across Arabic Hazzat spans", () => {
        const line: TextRun[] = [
            { text: "نَ", fontKey: "arabic" },
            { text: "مم", fontKey: "hazzatArabic" },
            { text: "مُ", fontKey: "arabic" }
        ];

        expect(getDrawableRunText(line, 0)).toBe("نَ\u200d");
        expect(getDrawableRunText(line, 1)).toBe("مم");
        expect(getDrawableRunText(line, 2)).toBe("\u200dمُ");
    });

    it("does not join Arabic across whitespace", () => {
        const line: TextRun[] = [
            { text: "نَ", fontKey: "arabic" },
            { text: " ", fontKey: "hazzatArabic" },
            { text: "مُ", fontKey: "arabic" }
        ];

        expect(getDrawableRunText(line, 0)).toBe("نَ");
        expect(getDrawableRunText(line, 2)).toBe("مُ");
    });

    it("reverses Arabic Hazzat chunks for RTL PDF drawing", () => {
        const line: TextRun[] = [
            { text: "إ", fontKey: "arabic" },
            { text: "ازن", fontKey: "hazzatArabic" }
        ];

        expect(getDrawableRunText(line, 1)).toBe("نزا");
    });

    it.each(["regular", "vertical"] as const)("renders every selected language without language labels (%s)", async formatKind => {
        const draws = jest.spyOn(PDFPage.prototype, "drawText");
        try {
            await generateSeasonBookletPdf({ season: createSeason(), services: [createService()], formatKind,
                layoutKind: "display", fontSources: createFontSources(), imageSources: createImageSources() });
            const words = draws.mock.calls.map(([text]) => text);
            expect(words.filter(word => ["COPTIC", "ENGLISH", "ARABIC", "Coptic", "English", "Arabic"].includes(word))).toEqual([]);
            expect(words.some(word => /[\u0600-\u06ff]/.test(word))).toBe(true);
            const body = draws.mock.calls.filter(([, options]) => options?.size === 10.5);
            expect(body.length).toBeGreaterThan(0);
        } finally { draws.mockRestore(); }
    });

    it.each(["regular", "vertical"] as const)("draws crosses only between selected language blocks (%s)", async formatKind => {
        const imageSources = { ...createImageSources(), serviceDivider: readImage("logo.png"), variationDivider: readImage("crossline.svg") };
        const pathCount = Array.from(new DOMParser().parseFromString(fs.readFileSync(path.join(process.cwd(), "src", "images", "crossline.svg"), "utf8"), "image/svg+xml").querySelectorAll("path")).filter(path => path.getAttribute("d")?.trim()).length;
        const paths = jest.spyOn(PDFPage.prototype, "drawSvgPath");
        try {
            for (const languages of [undefined, [ContentLanguage.English]]) {
                paths.mockClear();
                await generateSeasonBookletPdf({ season: createSeason(), services: [createService()], formatKind,
                    layoutKind: "display", languages, fontSources: createFontSources(), imageSources });
                expect(paths.mock.calls.filter(([, options]) => options?.opacity === .65)).toHaveLength(languages ? 0 : 2 * pathCount);
            }
        } finally { paths.mockRestore(); }
    });

    it.each(["en", "ar"] as const)("groups format-ordered contents under localized format headings (%s)", async localeName => {
        const draws = jest.spyOn(PDFPage.prototype, "drawText");
        try {
            for (const groupingKind of ["format", "hymn"] as const) {
                draws.mockClear();
                await generateSeasonBookletPdf({ season: createSeason(), services: [withText()],
                    formatKinds: ["text", "regular", "vertical", "musical"], groupingKind, localeName,
                    layoutKind: "display", fontSources: createFontSources(), imageSources: createImageSources() });
                const headings = draws.mock.calls.filter(([, options]) => options?.size === 11).map(([text]) => text).join("|");
                if (groupingKind === "hymn") expect(headings).toBe("");
                else for (const title of localeName === "ar" ? ["نص", "هزّات", "عمودية"] : ["Text", "Hazzat", "Vertical Hazzat"]) expect(headings).toContain(title);
                expect(headings).not.toContain("Musical Notes");
                expect(headings).not.toContain("نوتة");
            }
        } finally { draws.mockRestore(); }
    });

    it("paginates format headings with their service and first hymn", () => {
        const entries: TocEntry[] = [];
        for (let group = 0; group < 4; group++) {
            entries.push({ title: `Format ${group}`, pageNumber: group + 4, level: "format" });
            for (let service = 0; service < 16; service++) entries.push(
                { title: `Service ${service}`, pageNumber: 4, level: "service" },
                { title: `Hymn ${service}`, pageNumber: 4, level: "hymn" });
        }
        const layout = layoutBookletToc(entries);
        expect(layout.pageCount).toBeGreaterThan(1);
        expect(layout.rows).toHaveLength(entries.length);
        layout.rows.forEach((row, index) => {
            expect(row.y).toBeGreaterThan(30);
            if (row.entry.level === "format") expect(layout.rows.slice(index, index + 3).map(r => r.pageIndex)).toEqual([row.pageIndex, row.pageIndex, row.pageIndex]);
            if (row.entry.level === "service") expect(layout.rows[index + 1].pageIndex).toBe(row.pageIndex);
        });
    });

    it("calculates stable TOC pages, padding, and print imposition order", () => {
        expect(calculateTocPageCount(1)).toBe(1);
        expect(calculateTocPageCount(100)).toBeGreaterThan(1);
        expect(getPaddingPageCount(4)).toBe(0);
        expect(getPaddingPageCount(5)).toBe(3);
        expect(getPrintLogicalPageCount(4)).toBe(4);
        expect(getPrintLogicalPageCount(5)).toBe(8);
        expect(getBookletImpositionOrder(8)).toEqual([
            [8, 1],
            [2, 7],
            [6, 3],
            [4, 5]
        ]);
        expect(getBookletImpositionOrder(5)).toEqual([
            [8, 1],
            [2, 7],
            [6, 3],
            [4, 5]
        ]);
    });

    it("detects regular and vertical booklet format availability", () => {
        const services = [createService()];

        expect(hasBookletFormat(services, "regular")).toBe(true);
        expect(hasBookletFormat(services, "vertical")).toBe(true);
        expect(hasBookletFormat([{ ...createService(), hymns: [] }], "regular")).toBe(false);
    });

    it("generates display PDFs with embedded custom font resources", async () => {
        const pdfBytes = await generateSeasonBookletPdf({
            season: createSeason(),
            services: [createService()],
            formatKind: "regular",
            layoutKind: "display",
            generatedAt: new Date(2026, 4, 27),
            fontSources: createFontSources(),
            imageSources: createImageSources()
        });
        const pdf = await PDFDocument.load(pdfBytes);
        const pdfText = Buffer.from(pdfBytes).toString("latin1");

        expect(pdf.getPageCount()).toBeGreaterThan(0);
        expect(pdf.getPageCount() % 4).toBe(0);
        expect(pdfText).toContain("/FontFile2");
        expect(pdfText).toMatch(/Hazzat|Avva|Shenouda|NotoNaskh/);
        expect(pdfText).toContain("/Subtype /Link");
        expect(pdfText).toContain("/S /GoTo");
        expect(pdfText).toContain("/Subtype /Image");
    });

    it("keeps the logo and frame as vector curves alongside the SVG-backed ornaments", async () => {
        const logo = fs.readFileSync(path.join(process.cwd(), "src", "images", "logo.svg"));
        expect(logo.toString()).not.toMatch(/<image\b|data:image/);
        const bytes = await generateSeasonBookletPdf({
            season: createSeason(), services: [], formatKind: "regular", layoutKind: "display",
            fontSources: createFontSources(),
            imageSources: { frontCoverBackground: undefined, backCoverBackground: undefined,
                frontCoverLogo: new Uint8Array(logo), backCoverLogo: new Uint8Array(logo) }
        });
        const pdf = await PDFDocument.load(bytes);
        const imageObjects = pdf.context.enumerateIndirectObjects().map(([, object]) => object)
            .filter((object): object is PDFRawStream => object instanceof PDFRawStream
                && object.dict.get(PDFName.of("Subtype"))?.toString() === "/Image");
        // Corners and the approved center vine each share one color/alpha pair.
        // The official black logo and frame remain native vector curves.
        expect(imageObjects).toHaveLength(4);
        imageObjects.forEach(image => {
            expect([[1122, 1402], [2138, 736]]).toContainEqual([
                image.dict.lookup(PDFName.of("Width"), PDFNumber).asNumber(),
                image.dict.lookup(PDFName.of("Height"), PDFNumber).asNumber()]);
        });
        for (const index of [0, pdf.getPageCount() - 1]) {
            const streams = pdf.getPage(index).node.Contents() as PDFArray;
            const operators = Array.from({ length: streams.size() }, (_, i) => {
                const stream = pdf.context.lookup(streams.get(i));
                if (!(stream instanceof PDFRawStream)) throw new Error("Expected a PDF content stream");
                return Buffer.from(decodePDFRawStream(stream).decode()).toString("latin1");
            }).join("\n");
            expect((operators.match(/ c\n/g) || []).length).toBeGreaterThan(index === 0 ? 50 : 1);
            expect(operators).toContain("/HazzatEucharisticCenterVine Do");
        }
    });

    it("centers a quiet website and page-number footer only on TOC and content pages", async () => {
        const drawText = jest.spyOn(PDFPage.prototype, "drawText");
        try {
            await generateSeasonBookletPdf({ season: createSeason(), services: [createService()],
                formatKind: "regular", layoutKind: "display", fontSources: createFontSources(), imageSources: createImageSources() });
            const footers = drawText.mock.calls.filter(([text]) => text.startsWith("hazzat.com  ·  "));
            expect(footers.length).toBeGreaterThanOrEqual(2);
            footers.forEach(([text, options]) => {
                expect(text).toMatch(/^hazzat\.com  ·  \d+$/);
                expect(options?.y).toBe(14);
                expect(options?.size).toBe(8);
                const width = options!.font!.widthOfTextAtSize(text, options!.size!);
                expect(options!.x! + width / 2).toBeCloseTo(198);
            });
            expect(drawText.mock.calls.some(([text]) => text === "hazzat.com  ·  1")).toBe(false);
        } finally { drawText.mockRestore(); }
    });

    it("draws supplied front and back cover image resources", async () => {
        const pdfBytes = await generateSeasonBookletPdf({
            season: createSeason("passion-week-general-hours", "Passion Week"),
            services: [],
            formatKind: "regular",
            layoutKind: "display",
            generatedAt: new Date(2026, 4, 27),
            fontSources: createFontSources(),
            imageSources: createImageSources()
        });
        const pdf = await PDFDocument.load(pdfBytes);
        const pdfText = Buffer.from(pdfBytes).toString("latin1");

        expect(pdf.getPageCount()).toBe(4);
        expect((pdfText.match(/\/Subtype \/Image/g) || []).length).toBeGreaterThanOrEqual(3);
    });

    it("pads display PDFs to a multiple of four pages with a final back cover", async () => {
        const pdfBytes = await generateSeasonBookletPdf({
            season: createSeason(),
            services: [],
            formatKind: "regular",
            layoutKind: "display",
            generatedAt: new Date(2026, 4, 27),
            fontSources: createFontSources(),
            imageSources: createImageSources()
        });
        const pdf = await PDFDocument.load(pdfBytes);

        expect(pdf.getPageCount()).toBe(4);
        expect(pdf.getPageCount() % 4).toBe(0);
    });

    it("generates imposed print PDFs with two logical pages per spread", async () => {
        const displayBytes = await generateSeasonBookletPdf({
            season: createSeason(),
            services: [createService()],
            formatKind: "regular",
            layoutKind: "display",
            generatedAt: new Date(2026, 4, 27),
            fontSources: createFontSources(),
            imageSources: createImageSources()
        });
        const printBytes = await generateSeasonBookletPdf({
            season: createSeason(),
            services: [createService()],
            formatKind: "regular",
            layoutKind: "print",
            generatedAt: new Date(2026, 4, 27),
            fontSources: createFontSources(),
            imageSources: createImageSources()
        });
        const displayPdf = await PDFDocument.load(displayBytes);
        const printPdf = await PDFDocument.load(printBytes);

        expect(displayPdf.getPageCount() % 4).toBe(0);
        expect(printPdf.getPageCount()).toBe(getPrintLogicalPageCount(displayPdf.getPageCount()) / 2);
        expect(printPdf.getPageCount() % 2).toBe(0);
        printPdf.getPages().forEach(page => {
            expect(page.getWidth()).toBe(792);
            expect(page.getHeight()).toBe(612);
        });
    });
});


it("shares the SVG-backed cover image across all folded print sheets", async () => {
    const bytes = await generateSeasonBookletPdf({
        season: createSeason(), services: [createService()], formatKinds: ["text", "regular"],
        layoutKind: "print", fontSources: createFontSources(), imageSources: createImageSources()
    });
    const doc = await PDFDocument.load(bytes);
    const corners = doc.context.enumerateIndirectObjects().map(([, object]) => object).filter(object => {
        if (!(object instanceof PDFRawStream)) return false;
        return object.dict.get(PDFName.of("Subtype"))?.toString() === "/Image"
            && object.dict.get(PDFName.of("ColorSpace"))?.toString() === "/DeviceRGB"
            && object.dict.lookupMaybe(PDFName.of("Width"), PDFNumber)?.asNumber() === 1122
            && object.dict.lookupMaybe(PDFName.of("Height"), PDFNumber)?.asNumber() === 1402;
    });
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
    expect(corners).toHaveLength(1);
});
