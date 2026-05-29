import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import {
    BookletFontSources,
    BookletImageSources,
    EmbeddedFonts,
    TextRun,
    calculateTocPageCount,
    generateSeasonBookletPdf,
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
import type { ContentType } from "../Providers/HymnsDataProvider/Models/IVariationInfo";

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
