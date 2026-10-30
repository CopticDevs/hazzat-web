import { PDFArray, PDFDocument, PDFRawStream, decodePDFRawStream } from "pdf-lib";
import fs from "fs";
import path from "path";
import {
    BookletFontSources,
    BookletImageSources,
    EmbeddedFonts,
    TextRun,
    calculateTocPageCount,
    generateSeasonBookletPdf,
    getBookletSections,
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
    shouldDrawLanguageMarker,
    wrapRuns
} from "./BookletPdfGenerator";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { ContentLanguage, ContentType, ITextContent } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import { renderBookletMusic } from "./BookletMusicRenderer";

jest.mock("./BookletMusicRenderer", () => ({ renderBookletMusic: jest.fn() }));

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
        backCoverLogo: readImage("logo.png")
    };
}

function createSeason(id = "nativity", displayName = "Nativity"): ISeasonInfo {
    return {
        id,
        name: displayName,
        displayName,
        verse: "",
        displayVerse: "",
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
    it("lays out aligned text columns in English, Coptic, Arabic order without language heading rows", () => {
        const table = layoutBookletTextTable({ contentType: ContentType.TextContent, paragraphs: [
            { columns: [{ language: ContentLanguage.Arabic, content: "ارحمنا" }, { language: ContentLanguage.English, content: "Mercy" }, { language: ContentLanguage.Coptic, content: "Nai" }] },
            { columns: [{ language: ContentLanguage.English, content: "Next paragraph" }] },
            { columns: [] }
        ] }, createFakeFonts());
        expect(table.languages).toEqual([ContentLanguage.English, ContentLanguage.Coptic, ContentLanguage.Arabic]);
        expect(table.rows).toHaveLength(2);
        const words = (column: TextRun[][]) => column.flat().map(run => run.text).join("");
        expect(table.rows[0].map(words)).toEqual(["Mercy", "Nai", "ارحمنا"]);
        expect(table.rows[1].map(words)).toEqual(["Next paragraph", "", ""]);
        expect(table.rows.flat(3).map(run => run.text)).not.toEqual(expect.arrayContaining(["ENGLISH", "COPTIC", "ARABIC"]));
    });

    it("wraps long translated paragraphs independently within fixed column widths", () => {
        const table = layoutBookletTextTable({ contentType: ContentType.TextContent, paragraphs: [{ columns: [
            { language: ContentLanguage.English, content: "Very long paragraph ".repeat(150) },
            { language: ContentLanguage.Arabic, content: "ارحمنا" }
        ] }] }, createFakeFonts());
        expect(table.rows[0][0].length).toBeGreaterThan(50);
        expect(table.rows[0][1]).toHaveLength(1);
        table.rows[0].flat().forEach(line => expect(line.reduce((sum, run) => sum + run.text.length * run.size * .5, 0)).toBeLessThanOrEqual(table.columnWidth));
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
        expect(getCoverDisplayTitle(createSeason("passion-pascha-week-good-friday", "Passion (Pascha) Week - Good Friday"))).toBe("Good Friday");
        expect(getCoverDisplayTitle(createSeason("passion-week-general-hours", "Passion Week General Hours"))).toBe("General Hours");
        expect(getCoverDisplayTitle(createSeason("the-lords-entry-into-jerusalem-palm-sunday", "The Lord's Entry into Jerusalem (Palm Sunday)"))).toBe("Palm Sunday");
        expect(getCoverDisplayTitle(createSeason("annual", "Annual"))).toBe("Annual");
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

    it("draws language markers only when multiple languages are present", () => {
        const copticOnlyBlocks = [
            { html: "content", defaultFontKey: "coptic" as const, languageName: "Coptic" }
        ];
        const englishOnlyBlocks = [
            { html: "content", defaultFontKey: "english" as const, languageName: "English" }
        ];
        const arabicOnlyBlocks = [
            { html: "content", defaultFontKey: "arabic" as const, languageName: "Arabic" }
        ];
        const mixedBlocks = [
            { html: "content", defaultFontKey: "coptic" as const, languageName: "Coptic" },
            { html: "content", defaultFontKey: "english" as const, languageName: "English" }
        ];

        expect(shouldDrawLanguageMarker(copticOnlyBlocks)).toBe(false);
        expect(shouldDrawLanguageMarker(englishOnlyBlocks)).toBe(false);
        expect(shouldDrawLanguageMarker(arabicOnlyBlocks)).toBe(false);
        expect(shouldDrawLanguageMarker(mixedBlocks)).toBe(true);
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

    it("keeps the supplied SVG logo as vector curves on both booklet covers", async () => {
        const logo = fs.readFileSync(path.join(process.cwd(), "src", "images", "logo.svg"));
        expect(logo.toString()).not.toMatch(/<image\b|data:image/);
        const bytes = await generateSeasonBookletPdf({
            season: createSeason(), services: [], formatKind: "regular", layoutKind: "display",
            fontSources: createFontSources(),
            imageSources: { frontCoverBackground: undefined, backCoverBackground: undefined,
                frontCoverLogo: new Uint8Array(logo), backCoverLogo: new Uint8Array(logo) }
        });
        const pdf = await PDFDocument.load(bytes);
        expect(Buffer.from(bytes).toString("latin1")).not.toContain("/Subtype /Image");
        for (const index of [0, pdf.getPageCount() - 1]) {
            const streams = pdf.getPage(index).node.Contents() as PDFArray;
            const operators = Array.from({ length: streams.size() }, (_, i) => {
                const stream = pdf.context.lookup(streams.get(i));
                if (!(stream instanceof PDFRawStream)) throw new Error("Expected a PDF content stream");
                return Buffer.from(decodePDFRawStream(stream).decode()).toString("latin1");
            }).join("\n");
            expect((operators.match(/ c\n/g) || []).length).toBeGreaterThan(50);
        }
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
        expect((pdfText.match(/\/Subtype \/Image/g) || []).length).toBeGreaterThanOrEqual(4);
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
