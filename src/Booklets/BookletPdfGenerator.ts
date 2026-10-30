import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFImage, PDFPage, rgb, RGB, StandardFonts, degrees } from "pdf-lib";
import hazzatArabicFontUrl from "../fonts/HazzatA.ttf";
import hazzatVerticalFontUrl from "../fonts/HazzatV.ttf";
import hazzatVerticalArabicFontUrl from "../fonts/HazzatVA.ttf";
import copticFontUrl from "../fonts/cs_avva_shenouda.ttf";
import copticFallbackFontUrl from "../fonts/cs_new_athanasius.ttf";
import hazzatFontUrl from "../fonts/hazzat1_10a.ttf";
import arabicFontUrl from "../fonts/NotoNaskhArabic-Regular.ttf";
import trajanFontUrl from "../fonts/TrajanPro-Regular.ttf";
import bookletLogoUrl from "../images/logo.svg";
import bookletFrontCoverBackgroundUrl from "../images/bookletFrontCoverBackground.jpg";
import bookletBackCoverBackgroundUrl from "../images/bookletBackCoverBackground.jpg";
import { IFormatInfo } from "../Providers/HymnsDataProvider/Models/IFormatInfo";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { ContentLanguage, ContentType, IHazzatContent, IHymnContent, IMusicalNotesContent, ITextContent, IVariationInfo, IVerticalHazzatContent, normalizeContentLanguage } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import { BookletScorePage, renderBookletMusic } from "./BookletMusicRenderer";
import bookletServiceDividerUrl from "../images/bookletServiceDivider.svg";
import bookletVariationDividerUrl from "../images/crossline.svg";
import { BookletAppearance, bookletColors, defaultBookletAppearance, normalizeBookletColor } from "./BookletAppearance";

export type BookletFormatKind = "text" | "regular" | "vertical" | "musical";
export type BookletLayoutKind = "display" | "print";
export type BookletGroupingKind = "hymn" | "format";
export const bookletFormatKinds: BookletFormatKind[] = ["text", "regular", "vertical", "musical"];
type BookletContent = ITextContent | IHazzatContent | IVerticalHazzatContent | IMusicalNotesContent;
type BookletContentVariation = IVariationInfo<BookletContent> & { order?: number };
type PdfFontkit = Parameters<PDFDocument["registerFontkit"]>[0];
type PdfEmbedFontOptions = NonNullable<Parameters<PDFDocument["embedFont"]>[1]>;
type PdfFontFeatures = NonNullable<PdfEmbedFontOptions["features"]>;

export interface GenerateBookletPdfOptions {
    season: ISeasonInfo;
    localeName?: string;
    services: IServiceInfo[];
    /** Legacy single-format callers remain supported. */
    formatKind?: BookletFormatKind;
    formatKinds?: BookletFormatKind[];
    groupingKind?: BookletGroupingKind;
    layoutKind: BookletLayoutKind;
    fontSources?: BookletFontSources;
    imageSources?: BookletImageSources;
    generatedAt?: Date;
    appearance?: Partial<BookletAppearance>;
}

export type FontKey =
    "title" |
    "english" |
    "arabic" |
    "coptic" |
    "copticFallback" |
    "hazzat" |
    "hazzatVertical" |
    "hazzatArabic" |
    "hazzatVerticalArabic";

export interface TextRun {
    text: string;
    fontKey: FontKey;
    isComment?: boolean;
}

export interface SizedTextRun extends TextRun {
    size: number;
}

interface TocEntry {
    title: string;
    pageNumber: number;
    level: "service" | "hymn";
}

interface PageMeta {
    kind: "cover" | "insideCover" | "toc" | "content" | "padding" | "backCover";
}

export interface LanguageHtmlBlock {
    html: string;
    defaultFontKey: FontKey;
    languageName: string;
}

export type EmbeddedFonts = Record<FontKey, PDFFont>;
export type BookletFontSource = string | ArrayBuffer | Uint8Array;
export type BookletFontSources = Partial<Record<Exclude<FontKey, "english">, BookletFontSource>>;
export type BookletImageSource = string | ArrayBuffer | Uint8Array;

export interface BookletImageSources {
    frontCoverBackground?: BookletImageSource;
    frontCoverLogo?: BookletImageSource;
    backCoverBackground?: BookletImageSource;
    backCoverLogo?: BookletImageSource;
    serviceDivider?: BookletImageSource;
    variationDivider?: BookletImageSource;
}

interface FrontCoverImages {
    background?: PDFImage;
    logo?: BookletLogo;
}

interface BackCoverImages {
    background?: PDFImage;
    logo?: BookletLogo;
}

interface VectorBookletLogo { width: number; height: number; paths: string[]; }
type BookletLogo = PDFImage | VectorBookletLogo;

const LOGICAL_PAGE_WIDTH = 396;
const LOGICAL_PAGE_HEIGHT = 612;
const PRINT_PAGE_WIDTH = 792;
const PRINT_PAGE_HEIGHT = 612;
const PAGE_MARGIN_X = 36;
const PAGE_TOP = 48;
const PAGE_BOTTOM = 42;
const CONTENT_WIDTH = LOGICAL_PAGE_WIDTH - (PAGE_MARGIN_X * 2);
const BODY_FONT_SIZE = 10.5;
const HAZZAT_FONT_SIZE = 10.5;
const ARABIC_FONT_SIZE = 12;
const TOC_LINE_HEIGHT = 13;
const COVER_TITLE_RULE_Y = 190;
const COVER_TITLE_MAX_WIDTH = 300;
const COVER_TITLE_BASE_SIZE = 37;
const COVER_TITLE_MIN_SIZE = 22;

const black = rgb(0, 0, 0);
const gray = rgb(0.35, 0.35, 0.35);
const lightGray = rgb(0.78, 0.78, 0.78);
const coverTextGray = rgb(0.27, 0.27, 0.27);

const defaultBookletFontSources: Omit<Record<FontKey, BookletFontSource>, "english"> = {
    title: trajanFontUrl,
    arabic: arabicFontUrl,
    coptic: copticFontUrl,
    copticFallback: copticFallbackFontUrl,
    hazzat: hazzatFontUrl,
    hazzatVertical: hazzatVerticalFontUrl,
    hazzatArabic: hazzatArabicFontUrl,
    hazzatVerticalArabic: hazzatVerticalArabicFontUrl
};
const defaultBookletImageSources: BookletImageSources = {
    frontCoverBackground: bookletFrontCoverBackgroundUrl,
    frontCoverLogo: bookletLogoUrl,
    backCoverBackground: bookletBackCoverBackgroundUrl,
    backCoverLogo: bookletLogoUrl,
    serviceDivider: bookletServiceDividerUrl,
    variationDivider: bookletVariationDividerUrl
};
const arabicTextFontFeatures: PdfFontFeatures = {
    mark: false
};
const arabicTextFallbackCharacters = new Set(Array.from("\"#$%&'()*+-/;<=>?@[\\]^_`{|}~"));
const arabicUnicodePattern = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/;
const arabicTransparentCharacterPattern = /[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/;
const zeroWidthJoiner = "\u200d";
const dualJoiningArabicCharacters = new Set(Array.from(
    "\u0626\u0628\u062a\u062b\u062c\u062d\u062e\u0633\u0634\u0635\u0636\u0637\u0638\u0639\u063a\u0640\u0641\u0642\u0643\u0644\u0645\u0646\u0647\u064a\u067e\u0686\u06a9\u06af\u06cc"
));
const rightJoiningArabicCharacters = new Set(Array.from(
    "\u0622\u0623\u0624\u0625\u0627\u0629\u062f\u0630\u0631\u0632\u0648\u0649\u0698"
));

export function getBookletFileName(season: ISeasonInfo, formatKind: BookletFormatKind | BookletFormatKind[], layoutKind: BookletLayoutKind): string {
    const kinds = Array.isArray(formatKind) ? formatKind : [formatKind];
    const formatPart = bookletFormatKinds.filter(kind => kinds.includes(kind))
        .map(kind => kind === "musical" ? "musical-notes" : kind === "vertical" ? "vertical-hazzat" : kind === "text" ? "text" : "hazzat").join("-");
    return `${sanitizeFileName(`${season.id}-${formatPart}-booklet-${layoutKind}`)}.pdf`;
}

export function hasBookletFormat(services: IServiceInfo[], formatKind: BookletFormatKind): boolean {
    return services.some(service => service.hymns?.some(hymn => !!getHymnBookletFormat(hymn, formatKind)));
}

export interface BookletSection {
    service: IServiceInfo;
    hymn: IHymnInfo;
    format: IFormatInfo;
    formatKind: BookletFormatKind;
}

export function getBookletSections(services: IServiceInfo[], kinds: BookletFormatKind[], grouping: BookletGroupingKind = "hymn"): BookletSection[] {
    const orderedKinds = bookletFormatKinds.filter(kind => kinds.includes(kind));
    const result: BookletSection[] = [];
    const append = (service: IServiceInfo, hymn: IHymnInfo, formatKind: BookletFormatKind) => {
        const format = getHymnBookletFormat(hymn, formatKind);
        if (format) result.push({ service, hymn, format, formatKind });
    };
    const orderedServices = [...services].sort((a, b) => a.order - b.order);
    if (grouping === "format") {
        orderedKinds.forEach(kind => orderedServices.forEach(service =>
            [...(service.hymns || [])].sort((a, b) => a.order - b.order).forEach(hymn => append(service, hymn, kind))));
    } else {
        orderedServices.forEach(service => [...(service.hymns || [])].sort((a, b) => a.order - b.order)
            .forEach(hymn => orderedKinds.forEach(kind => append(service, hymn, kind))));
    }
    return result;
}

export function hasBookletVariationContent(variation: IVariationInfo<IHymnContent>, kind: BookletFormatKind): boolean {
    const expectedType = kind === "musical" ? ContentType.MusicalNotesContent : kind === "text" ? ContentType.TextContent : kind === "regular" ? ContentType.HazzatContent : ContentType.VerticalHazzatContent;
    // Published v5 records keep their type on the validated library record, not the payload.
    if (!variation.content || (variation.content.contentType && variation.content.contentType !== expectedType)) return false;
    if (kind === "musical") return !!(variation.content as IMusicalNotesContent).musicXml?.trim();
    return getLanguageHtmlBlocks(variation as BookletContentVariation, kind)
        .some(block => parseHazzatHtmlToLines(block.html, block.defaultFontKey).some(line => line.some(run => run.text.trim())));
}

export function getBookletImpositionOrder(logicalPageCount: number): number[][] {
    const paddedCount = logicalPageCount + getPaddingPageCount(logicalPageCount);
    const spreads: number[][] = [];

    for (let sheetStart = 0; sheetStart < paddedCount / 2; sheetStart += 2) {
        const outerLeft = paddedCount - sheetStart;
        const outerRight = sheetStart + 1;
        const innerLeft = sheetStart + 2;
        const innerRight = paddedCount - sheetStart - 1;

        spreads.push([outerLeft, outerRight]);
        spreads.push([innerLeft, innerRight]);
    }

    return spreads;
}

export function getPaddingPageCount(pageCount: number): number {
    return (4 - (pageCount % 4)) % 4;
}

export function getPrintLogicalPageCount(logicalPageCount: number): number {
    return logicalPageCount + getPaddingPageCount(logicalPageCount);
}

export function formatGeneratedMonthYear(date: Date): string {
    return date.toLocaleString("en-US", {
        month: "long",
        year: "numeric"
    });
}

export function calculateTocPageCount(entryCount: number): number {
    const usableHeight = LOGICAL_PAGE_HEIGHT - PAGE_TOP - PAGE_BOTTOM - 44;
    const entriesPerPage = Math.max(1, Math.floor(usableHeight / TOC_LINE_HEIGHT));
    return Math.max(1, Math.ceil(entryCount / entriesPerPage));
}

export function normalizeFontKey(className?: string, style?: string, inheritedFontKey: FontKey = "english"): FontKey {
    const classTokens = (className || "").toLowerCase().split(/\s+/);
    const styleLower = (style || "").toLowerCase();
    const inlineFontFamily = /font-family\s*:\s*['"]?hazzat\b/.test(styleLower);

    if (classTokens.includes("hazzatvafont")) return "hazzatVerticalArabic";
    if (classTokens.includes("hazzatafont")) return "hazzatArabic";
    if (classTokens.includes("hazzatvfont")) return "hazzatVertical";
    if (classTokens.includes("hazzatfont") || inlineFontFamily) return "hazzat";
    if (classTokens.includes("copticfont") || classTokens.includes("copticcomment")) return "coptic";
    if (classTokens.includes("arabicfont") || classTokens.includes("arabiccomment")) return "arabic";
    if (classTokens.includes("englishfont") || classTokens.includes("englishcomment") || classTokens.includes("msonormal")) return "english";

    return inheritedFontKey;
}

export function parseHazzatHtmlToLines(html: string, defaultFontKey: FontKey = "english"): TextRun[][] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
    const lines: TextRun[][] = [[]];

    const pushBreak = () => {
        lines.push([]);
    };

    const pushText = (text: string, fontKey: FontKey, isComment: boolean) => {
        const normalized = text
            .replace(/\u00a0/g, " ")
            .replace(/\r/g, "")
            .replace(/\n/g, " ")
            .replace(/\t/g, " ")
            .replace(/ {2,}/g, " ");

        if (!normalized) {
            return;
        }

        splitTextForFont(normalized, fontKey).forEach(run => {
            const currentLine = lines[lines.length - 1];
            const previous = currentLine[currentLine.length - 1];
            if (previous && previous.fontKey === run.fontKey && !!previous.isComment === isComment) {
                previous.text += run.text;
            } else {
                currentLine.push(isComment ? { ...run, isComment: true } : run);
            }
        });
    };

    const visit = (node: Node, inheritedFontKey: FontKey, inheritedComment = false) => {
        if (node.nodeType === Node.TEXT_NODE) {
            pushText(node.textContent || "", inheritedFontKey, inheritedComment);
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        if (tagName === "br") {
            pushBreak();
            return;
        }

        const elementFontKey = normalizeFontKey(element.getAttribute("class") || "", element.getAttribute("style") || "", inheritedFontKey);
        const startsBlock = tagName === "p" || tagName === "div";

        if (startsBlock && lines[lines.length - 1].length > 0) {
            pushBreak();
        }

        const isComment = inheritedComment || /\b(?:EnglishComment|CopticComment|ArabicComment)\b/i.test(element.className);
        Array.from(element.childNodes).forEach(child => visit(child, elementFontKey, isComment));

        if (startsBlock && lines[lines.length - 1].length > 0) {
            pushBreak();
        }
    };

    Array.from(doc.body.childNodes).forEach(child => visit(child, defaultFontKey));

    while (lines.length > 1 && lines[lines.length - 1].length === 0) {
        lines.pop();
    }

    return lines;
}

function splitTextForFont(text: string, fontKey: FontKey): TextRun[] {
    const sanitized = sanitizeTextForFont(text, fontKey);
    if (!sanitized) {
        return [];
    }

    const runs: TextRun[] = [];
    Array.from(sanitized).forEach(char => {
        const nextFontKey = getFontKeyForCharacter(char, fontKey);
        const previous = runs[runs.length - 1];
        if (previous && previous.fontKey === nextFontKey) {
            previous.text += char;
        } else {
            runs.push({ text: char, fontKey: nextFontKey });
        }
    });

    return runs;
}

function getFontKeyForCharacter(char: string, fontKey: FontKey): FontKey {
    if (fontKey === "arabic") {
        return arabicTextFallbackCharacters.has(char) ? "english" : "arabic";
    }

    if (isArabicCharacter(char) && fontKey !== "hazzatArabic" && fontKey !== "hazzatVerticalArabic") {
        return "arabic";
    }

    return fontKey;
}

function sanitizeTextForFont(text: string, fontKey: FontKey): string {
    let result = text
        .replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, "")
        .replace(/[‐‑‒–—―]/g, "-")
        .replace(/[‘’‚‛]/g, "'")
        .replace(/[“”„‟]/g, "\"")
        .replace(/…/g, "...");

    if (!isHazzatFontKey(fontKey)) {
        result = result.replace(/[\ue000-\uf8ff]/g, " ");
    }

    return result;
}

export async function generateSeasonBookletPdf(options: GenerateBookletPdfOptions): Promise<Uint8Array> {
    const scores = new Map<string, Promise<BookletScorePage[]>>();
    let logicalResult = await renderLogicalBooklet(options, 1, scores);
    const requiredTocPageCount = calculateTocPageCount(logicalResult.tocEntries.length);

    if (requiredTocPageCount !== 1) {
        logicalResult = await renderLogicalBooklet(options, requiredTocPageCount, scores);
    }

    const backCoverImages = await embedBackCoverImages(logicalResult.doc, options.imageSources);
    padLogicalPagesBeforeBackCover(logicalResult.doc, logicalResult.pageMetas);
    addBackCover(logicalResult.doc, logicalResult.fonts, logicalResult.pageMetas, backCoverImages);

    if (options.layoutKind === "display") {
        drawPageNumbers(logicalResult.doc, logicalResult.fonts, logicalResult.pageMetas);
        return logicalResult.doc.save({ useObjectStreams: false });
    }

    drawPageNumbers(logicalResult.doc, logicalResult.fonts, logicalResult.pageMetas);
    return createPrintPdf(logicalResult.doc, logicalResult.pageMetas.length);
}

async function renderLogicalBooklet(options: GenerateBookletPdfOptions, tocPageCount: number, scores: Map<string, Promise<BookletScorePage[]>>) {
    const doc = await createPdfDocument();
    const fonts = await embedBookletFonts(doc, options.fontSources);
    const writer = new BookletWriter(doc, fonts, {
        textColor: normalizeBookletColor(options.appearance?.textColor),
        hazzatColor: normalizeBookletColor(options.appearance?.hazzatColor)
    });
    const imageSources = { ...defaultBookletImageSources, ...options.imageSources };

    const frontCoverImages = await embedFrontCoverImages(doc, options.imageSources);
    drawCover(writer, options.season, frontCoverImages);
    drawInsideFrontCover(writer, options.generatedAt || new Date());

    const tocPages: PDFPage[] = [];
    for (let i = 0; i < tocPageCount; i++) {
        tocPages.push(writer.addPage("toc"));
    }

    const tocEntries: TocEntry[] = [];
    const kinds = options.formatKinds ?? (options.formatKind ? [options.formatKind] : []);
    const sections = getBookletSections(options.services, kinds, options.groupingKind);
    if (sections.length) {
        writer.serviceDivider = await tryEmbedImage(doc, imageSources.serviceDivider);
        writer.variationDivider = await tryEmbedLogo(doc, imageSources.variationDivider);
        writer.addPage("content");
        let previousService: IServiceInfo | undefined;
        let previousHymn: IHymnInfo | undefined;
        let previousKind: BookletFormatKind | undefined;
        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
            const { service, hymn, format, formatKind } = sections[sectionIndex];
            const next = sections[sectionIndex + 1];
            const endsService = !next || next.service !== service || (options.groupingKind === "format" && next.formatKind !== formatKind);
            if (formatKind === "musical") writer.ensureSpace(LOGICAL_PAGE_HEIGHT - PAGE_TOP - PAGE_BOTTOM);
            const newGroup = options.groupingKind === "format" && previousKind !== formatKind;
            if (newGroup) {
                writer.drawHeading(getPdfFormatName(formatKind), 16, 12, false);
            }
            if (service !== previousService || newGroup) {
                writer.ensureSpace(100);
                tocEntries.push({ title: service.displayName || service.name, pageNumber: writer.pageNumber, level: "service" });
                writer.drawHeading(service.displayName || service.name, 15, 12, false);
            }
            if (hymn !== previousHymn || service !== previousService || newGroup) {
                writer.ensureSpace(90);
                const suffix = options.groupingKind === "format" ? ` - ${getPdfFormatName(formatKind)}` : "";
                tocEntries.push({ title: (hymn.displayName || hymn.name) + suffix, pageNumber: writer.pageNumber, level: "hymn" });
                writer.drawHeading(hymn.displayName || hymn.name, 11.5, 10);
            } else if (formatKind === "musical") {
                writer.drawHeading(hymn.displayName || hymn.name, 11.5, 10);
            }
            if (kinds.length > 1 && options.groupingKind !== "format") writer.drawLanguageMarker(getPdfFormatName(formatKind), false);
            await addFormatContent(writer, format, formatKind, scores, endsService);
            if (endsService) writer.drawServiceDivider();
            writer.cursorY -= 8;
            previousService = service;
            previousHymn = hymn;
            previousKind = formatKind;
        }
    }
    drawToc(tocPages, fonts, tocEntries, options.layoutKind === "display", options.localeName ? options.localeName === "ar" : arabicUnicodePattern.test(options.season.displayName || options.season.name), writer.serviceDivider);

    return {
        doc,
        fonts,
        tocEntries,
        pageMetas: writer.pageMetas
    };
}

async function createPdfDocument(): Promise<PDFDocument> {
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit as unknown as PdfFontkit);
    doc.setTitle("Hazzat Booklet");
    doc.setSubject("Generated Hazzat booklet");
    doc.setCreator("hazzat.com");
    doc.setProducer("hazzat.com");
    return doc;
}

async function embedBookletFonts(doc: PDFDocument, fontSources: BookletFontSources = {}): Promise<EmbeddedFonts> {
    const sources = {
        ...defaultBookletFontSources,
        ...fontSources
    };
    const [
        title,
        english,
        arabic,
        coptic,
        copticFallback,
        hazzat,
        hazzatVertical,
        hazzatArabic,
        hazzatVerticalArabic
    ] = await Promise.all([
        embedFont(doc, sources.title),
        doc.embedFont(StandardFonts.Helvetica),
        embedFont(doc, sources.arabic, arabicTextFontFeatures),
        embedFont(doc, sources.coptic),
        embedFont(doc, sources.copticFallback),
        embedFont(doc, sources.hazzat),
        embedFont(doc, sources.hazzatVertical),
        embedFont(doc, sources.hazzatArabic),
        embedFont(doc, sources.hazzatVerticalArabic)
    ]);

    return {
        title,
        english,
        arabic,
        coptic,
        copticFallback,
        hazzat,
        hazzatVertical,
        hazzatArabic,
        hazzatVerticalArabic
    };
}

async function embedFont(doc: PDFDocument, fontSource: BookletFontSource, features?: PdfFontFeatures): Promise<PDFFont> {
    const embedOptions: PdfEmbedFontOptions = {
        subset: true,
        ...(features ? { features: { ...features } } : {})
    };

    return doc.embedFont(await loadSourceBytes(fontSource, "booklet font"), embedOptions);
}

async function embedFrontCoverImages(doc: PDFDocument, imageSources: BookletImageSources = {}): Promise<FrontCoverImages> {
    const sources = {
        ...defaultBookletImageSources,
        ...imageSources
    };
    const [background, logo] = await Promise.all([
        tryEmbedImage(doc, sources.frontCoverBackground),
        tryEmbedLogo(doc, sources.frontCoverLogo)
    ]);

    return { background, logo };
}

async function embedBackCoverImages(doc: PDFDocument, imageSources: BookletImageSources = {}): Promise<BackCoverImages> {
    const sources = {
        ...defaultBookletImageSources,
        ...imageSources
    };
    const [background, logo] = await Promise.all([
        tryEmbedImage(doc, sources.backCoverBackground),
        tryEmbedLogo(doc, sources.backCoverLogo)
    ]);

    return { background, logo };
}

async function tryEmbedLogo(doc: PDFDocument, source?: BookletImageSource): Promise<BookletLogo | undefined> {
    if (!source) return undefined;
    try {
        const bytes = await loadSourceBytes(source, "booklet logo");
        if (looksLikeSvgImage(bytes)) {
            const xml = Array.from(bytes, byte => String.fromCharCode(byte)).join("");
            const root = new DOMParser().parseFromString(xml, "image/svg+xml").documentElement;
            const box = (root.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
            const paths = Array.from(root.querySelectorAll("path"), node => node.getAttribute("d") || "").filter(Boolean);
            if (box.length === 4 && box[0] === 0 && box[1] === 0 && box[2] > 0 && box[3] > 0 && paths.length &&
                !root.querySelector("parsererror, image, text, use, [transform]")) {
                return { width: box[2], height: box[3], paths };
            }
        }
        return await embedImage(doc, bytes);
    } catch {
        return undefined;
    }
}

function drawBookletLogo(page: PDFPage, logo: BookletLogo, x: number, y: number, width: number, opacity = 1) {
    const height = width * logo.height / logo.width;
    if ("paths" in logo) {
        logo.paths.forEach(path => page.drawSvgPath(path, {
            x, y: y + height, scale: width / logo.width, color: rgb(48 / 255, 48 / 255, 48 / 255), opacity
        }));
    } else {
        page.drawImage(logo, { x, y, width, height, opacity });
    }
}

async function tryEmbedImage(doc: PDFDocument, imageSource?: BookletImageSource): Promise<PDFImage | undefined> {
    if (!imageSource) {
        return undefined;
    }

    try {
        return await embedImage(doc, imageSource);
    } catch {
        return undefined;
    }
}

async function embedImage(doc: PDFDocument, imageSource: BookletImageSource): Promise<PDFImage> {
    const imageBytes = await loadSourceBytes(imageSource, "booklet image");
    const sourceName = typeof imageSource === "string" ? imageSource.toLowerCase() : "";

    if (sourceName.endsWith(".svg") || looksLikeSvgImage(imageBytes)) {
        return doc.embedPng(await rasterizeSvgToPngBytes(imageBytes));
    }

    if (sourceName.endsWith(".jpg") || sourceName.endsWith(".jpeg")) {
        return doc.embedJpg(imageBytes);
    }

    if (sourceName.endsWith(".png")) {
        return doc.embedPng(imageBytes);
    }

    try {
        return await doc.embedPng(imageBytes);
    } catch {
        return doc.embedJpg(imageBytes);
    }
}

function looksLikeSvgImage(imageBytes: Uint8Array): boolean {
    const header = Array.from(imageBytes.slice(0, 256))
        .map(charCode => String.fromCharCode(charCode))
        .join("")
        .trimStart()
        .toLowerCase();

    return header.startsWith("<svg") || (header.startsWith("<?xml") && header.includes("<svg"));
}

async function rasterizeSvgToPngBytes(svgBytes: Uint8Array): Promise<Uint8Array> {
    if (typeof document === "undefined" || typeof Image === "undefined") {
        throw new Error("SVG booklet covers require a browser canvas.");
    }

    const objectUrl = URL.createObjectURL(new Blob([svgBytes], { type: "image/svg+xml;charset=utf-8" }));
    try {
        const image = await loadBrowserImage(objectUrl);
        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;

        if (!width || !height) {
            throw new Error("Unable to determine SVG booklet cover dimensions.");
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Unable to render SVG booklet cover.");
        }

        context.drawImage(image, 0, 0, width, height);
        return canvasToPngBytes(canvas);
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

function loadBrowserImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Unable to load booklet cover image."));
        image.src = source;
    });
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
    if (!canvas.toBlob) {
        return Promise.resolve(dataUrlToBytes(canvas.toDataURL("image/png")));
    }

    return new Promise((resolve, reject) => {
        canvas.toBlob(async blob => {
            if (!blob) {
                reject(new Error("Unable to export booklet cover image."));
                return;
            }

            resolve(new Uint8Array(await blob.arrayBuffer()));
        }, "image/png");
    });
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
    const base64 = dataUrl.split(",")[1] || "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    Array.from(binary).forEach((char, index) => {
        bytes[index] = char.charCodeAt(0);
    });

    return bytes;
}

async function loadSourceBytes(source: BookletFontSource | BookletImageSource, label: string): Promise<Uint8Array> {
    if (typeof source !== "string") {
        return ArrayBuffer.isView(source)
            ? new Uint8Array(source.buffer, source.byteOffset, source.byteLength)
            : new Uint8Array(source);
    }

    const response = await fetch(source);
    if (!response.ok) {
        throw new Error(`Failed to load ${label}: ${source}`);
    }
    return new Uint8Array(await response.arrayBuffer());
}

class BookletWriter {
    public reservedBottom = 0;
    public serviceDivider?: PDFImage;
    public variationDivider?: BookletLogo;
    public page!: PDFPage;
    public cursorY = LOGICAL_PAGE_HEIGHT - PAGE_TOP;
    public readonly pageMetas: PageMeta[] = [];

    constructor(public readonly doc: PDFDocument, public readonly fonts: EmbeddedFonts, public readonly appearance: BookletAppearance = defaultBookletAppearance) {
    }

    public addPage(kind: PageMeta["kind"] = "content"): PDFPage {
        this.page = this.doc.addPage([LOGICAL_PAGE_WIDTH, LOGICAL_PAGE_HEIGHT]);
        initializePageContent(this.page);
        this.pageMetas.push({ kind });
        this.cursorY = LOGICAL_PAGE_HEIGHT - PAGE_TOP;
        return this.page;
    }

    public get pageNumber(): number {
        return this.pageMetas.length;
    }

    public ensureSpace(height: number) {
        if (this.cursorY - height < PAGE_BOTTOM + this.reservedBottom) {
            this.addPage("content");
        }
    }

    public drawVariationDivider(followedByServiceDivider = false) {
        this.reservedBottom = 0;
        if (followedByServiceDivider && this.serviceDivider) return;
        if (this.variationDivider) {
            const width = CONTENT_WIDTH * .72;
            const height = width * this.variationDivider.height / this.variationDivider.width;
            drawBookletLogo(this.page, this.variationDivider, (LOGICAL_PAGE_WIDTH - width) / 2, this.cursorY - 8 - height, width, .65);
        } else {
            const y = this.cursorY - 12;
            const center = LOGICAL_PAGE_WIDTH / 2;
            this.page.drawLine({ start: { x: PAGE_MARGIN_X + 44, y }, end: { x: center - 7, y }, thickness: .4, color: gray });
            this.page.drawLine({ start: { x: center + 7, y }, end: { x: LOGICAL_PAGE_WIDTH - PAGE_MARGIN_X - 44, y }, thickness: .4, color: gray });
            this.page.drawLine({ start: { x: center - 3, y }, end: { x: center + 3, y }, thickness: .7, color: gray });
            this.page.drawLine({ start: { x: center, y: y - 4 }, end: { x: center, y: y + 4 }, thickness: .7, color: gray });
        }
        this.cursorY -= 28;
    }

    public drawServiceDivider() {
        const height = 48;
        if (!this.serviceDivider || this.cursorY - height - 40 < PAGE_BOTTOM) return;
        drawServiceOrnament(this.page, this.serviceDivider, this.cursorY - 8, height);
        this.cursorY -= height + 44;
    }

    public drawCenteredText(text: string, fontKey: FontKey, size: number, y: number, color: RGB = black) {
        const font = this.fonts[fontKey];
        const width = safeTextWidth(font, text, size);
        this.page.drawText(text, {
            x: (LOGICAL_PAGE_WIDTH - width) / 2,
            y,
            size,
            font,
            color
        });
    }

    public drawHeading(text: string, size: number, extraSpace = 18, showRule = true) {
        this.ensureSpace(size + extraSpace);
        drawWrappedPlainText(this, text, "title", size, size + 5, black, true);
        if (showRule) {
            this.drawHeadingRule(8, Math.max(12, extraSpace));
        } else {
            this.cursorY -= Math.max(4, extraSpace / 3);
        }
    }

    public drawHeadingRule(spacingBefore = 5, spacingAfter = 9) {
        this.ensureSpace(spacingBefore + 1 + spacingAfter);
        this.cursorY -= spacingBefore;
        this.page.drawLine({
            start: { x: PAGE_MARGIN_X + 44, y: this.cursorY },
            end: { x: LOGICAL_PAGE_WIDTH - PAGE_MARGIN_X - 44, y: this.cursorY },
            thickness: 0.45,
            color: lightGray
        });
        this.cursorY -= spacingAfter;
    }

    public drawLanguageMarker(label: string, rtl: boolean) {
        this.ensureSpace(30);
        this.cursorY -= 2;
        const font = this.fonts.english;
        const size = 7.5;
        const labelWidth = safeTextWidth(font, label.toUpperCase(), size);
        const labelX = rtl ? LOGICAL_PAGE_WIDTH - PAGE_MARGIN_X - labelWidth : PAGE_MARGIN_X;

        this.page.drawText(label.toUpperCase(), {
            x: labelX,
            y: this.cursorY,
            size,
            font,
            color: gray
        });
        this.cursorY -= 20;
    }

    public drawBodyLines(lines: TextRun[][]) {
        lines.forEach(line => {
            if (line.length === 0 || line.every(run => run.text.trim() === "")) {
                this.ensureSpace(HAZZAT_FONT_SIZE + 3);
                this.cursorY -= HAZZAT_FONT_SIZE + 3;
                return;
            }

            const sizedRuns = line.map(run => ({
                ...run,
                size: getRunFontSize(run.fontKey) * (run.isComment ? .9 : 1)
            }));
            drawWrappedRuns(this, sizedRuns);
        });
    }
}

function drawCover(writer: BookletWriter, season: ISeasonInfo, images: FrontCoverImages) {
    writer.addPage("cover");
    const hasBackground = !!images.background;

    if (hasBackground && images.background) {
        drawImageCover(writer.page, images.background, 0, 0, LOGICAL_PAGE_WIDTH, LOGICAL_PAGE_HEIGHT, 1);
    }

    if (images.logo) {
        const logoWidth = 142;
        drawBookletLogo(writer.page, images.logo, (LOGICAL_PAGE_WIDTH - logoWidth) / 2, LOGICAL_PAGE_HEIGHT - 132, logoWidth);
    } else if (!hasBackground) {
        writer.drawCenteredText("Hazzat", "title", 22, 500);
        writer.drawCenteredText("Coptic Hymnology", "english", 9, 484, gray);
    }

    if (!hasBackground) {
        writer.page.drawLine({
            start: { x: 48, y: COVER_TITLE_RULE_Y },
            end: { x: LOGICAL_PAGE_WIDTH - 48, y: COVER_TITLE_RULE_Y },
            thickness: 0.75,
            color: gray
        });
    }

    drawCoverTitle(writer, season);
}

function drawCoverTitle(writer: BookletWriter, season: ISeasonInfo) {
    const title = getCoverDisplayTitle(season);
    const font = arabicUnicodePattern.test(title) ? writer.fonts.arabic : writer.fonts.english;
    const { lines, size } = fitCoverTitle(title, font);
    const lineHeight = size * 1.08;
    let y = COVER_TITLE_RULE_Y + 18 + ((lines.length - 1) * lineHeight);

    lines.forEach(line => {
        drawPlainHeadingLine(writer.page, writer.fonts, line, "english", size, 0, LOGICAL_PAGE_WIDTH, y, coverTextGray, true);
        y -= lineHeight;
    });
    drawSpacedCenteredText(writer.page, writer.fonts.english, "HAZZAT", 10.5, COVER_TITLE_RULE_Y - 27, coverTextGray, 21);
}

function fitCoverTitle(title: string, font: PDFFont): { lines: string[]; size: number } {
    for (let size = COVER_TITLE_BASE_SIZE; size >= COVER_TITLE_MIN_SIZE; size -= 1) {
        const lines = wrapPlainText(title, font, size, COVER_TITLE_MAX_WIDTH);
        if (lines.length <= 2 && lines.every(line => safeTextWidth(font, line, size) <= COVER_TITLE_MAX_WIDTH)) {
            return { lines, size };
        }
    }

    const lines = wrapPlainText(title, font, COVER_TITLE_MIN_SIZE, COVER_TITLE_MAX_WIDTH)
        .slice(0, 2);
    const lastLine = lines[lines.length - 1];
    if (lastLine) {
        lines[lines.length - 1] = truncateToWidth(lastLine, font, COVER_TITLE_MIN_SIZE, COVER_TITLE_MAX_WIDTH);
    }

    return { lines, size: COVER_TITLE_MIN_SIZE };
}

function drawSpacedCenteredText(page: PDFPage, font: PDFFont, text: string, size: number, y: number, color: RGB, letterSpacing: number) {
    const characters = Array.from(text);
    const textWidth = characters.reduce((width, char, index) => {
        const spacing = index === characters.length - 1 ? 0 : letterSpacing;
        return width + safeTextWidth(font, char, size) + spacing;
    }, 0);
    let x = (LOGICAL_PAGE_WIDTH - textWidth) / 2;

    characters.forEach(char => {
        page.drawText(char, { x, y, size, font, color });
        x += safeTextWidth(font, char, size) + letterSpacing;
    });
}

const passionWeekSeasonIds = new Set([
    "lazarus-saturday",
    "the-lords-entry-into-jerusalem-palm-sunday",
    "passion-week-general-hours",
    "passion-pascha-week-covenant-thursday",
    "passion-pascha-week-good-friday",
    "bright-saturday"
]);

function isPassionWeekSeason(seasonId?: string): boolean {
    return !!seasonId && passionWeekSeasonIds.has(seasonId);
}

export function getCoverDisplayTitle(season: ISeasonInfo): string {
    const title = getCoverSeasonName(season);
    if (arabicUnicodePattern.test(title)) return /ألحان|الألحان/.test(title) ? title : `ألحان ${title}`;
    return /\bhymns\b/i.test(title) ? title : `${title} Hymns`;
}

function getCoverSeasonName(season: ISeasonInfo): string {
    const seasonName = season.displayName || season.name;
    if (season.id === "annual") return arabicUnicodePattern.test(seasonName) ? "الألحان السنوية" : "Annual Hymns";

    if (!isPassionWeekSeason(season.id)) {
        return seasonName;
    }

    const paschaWeekMatch = seasonName.match(/^Passion\s+\(Pascha\)\s+Week\s*-\s*(.+)$/i);
    if (paschaWeekMatch) {
        return paschaWeekMatch[1].trim();
    }

    const passionWeekMatch = seasonName.match(/^Passion\s+Week\s*-?\s*(.+)$/i);
    if (passionWeekMatch) {
        return passionWeekMatch[1].trim();
    }

    if (season.id === "the-lords-entry-into-jerusalem-palm-sunday") {
        const palmSundayMatch = seasonName.match(/\(([^)]+)\)/);
        if (palmSundayMatch) {
            return palmSundayMatch[1].trim();
        }
    }

    return seasonName;
}

function drawInsideFrontCover(writer: BookletWriter, generatedAt: Date) {
    writer.addPage("insideCover");
    writer.drawCenteredText(`Generated ${formatGeneratedMonthYear(generatedAt)}`, "english", 9, 72, gray);
}

function getPdfFormatName(kind: BookletFormatKind): string {
    return kind === "musical" ? "Musical Notes" : kind === "text" ? "Text" : kind === "regular" ? "Hazzat" : "Vertical Hazzat";
}

async function addFormatContent(writer: BookletWriter, format: IFormatInfo, formatKind: BookletFormatKind, scores: Map<string, Promise<BookletScorePage[]>>, endsService: boolean) {
    const variations = getOrderedBookletVariations(format).filter(variation => hasBookletVariationContent(variation, formatKind));

    for (let variationIndex = 0; variationIndex < variations.length; variationIndex++) {
        const variation = variations[variationIndex];
        // Reserve room for the ornament while paginating the variation's content.
        const ornamentSpace = writer.serviceDivider && endsService && variationIndex === variations.length - 1 ? 110 : 40;
        const followedByServiceDivider = endsService && variationIndex === variations.length - 1;
        writer.reservedBottom = ornamentSpace;
        if (variations.length > 1) {
            writer.ensureSpace(32);
            drawWrappedPlainText(writer, variation.displayName || variation.name, "title", 9.5, 12, gray, false);
            writer.cursorY -= 4;
        }

        if (formatKind === "musical") {
            const xml = (variation.content as IMusicalNotesContent).musicXml;
            if (!scores.has(xml)) scores.set(xml, renderBookletMusic(xml));
            const pages = await scores.get(xml)!;
            for (let index = 0; index < pages.length; index++) {
                const page = pages[index];
                if (index > 0) writer.addPage("content");
                writer.reservedBottom = index === pages.length - 1 ? ornamentSpace : 40;
                const image = await writer.doc.embedPng(page.pngBytes);
                const availableHeight = Math.min(440, writer.cursorY - PAGE_BOTTOM - writer.reservedBottom - 8);
                const scale = Math.min(CONTENT_WIDTH / page.width, availableHeight / page.height);
                const width = page.width * scale;
                const height = page.height * scale;
                writer.ensureSpace(height + 8);
                writer.page.drawImage(image, { x: PAGE_MARGIN_X + (CONTENT_WIDTH - width) / 2, y: writer.cursorY - height, width, height });
                writer.cursorY -= height + 8;
            }
            writer.drawVariationDivider(followedByServiceDivider);
            continue;
        }
        if (formatKind === "text") {
            drawTextTable(writer, variation.content as ITextContent);
            writer.drawVariationDivider(followedByServiceDivider);
            continue;
        }
        const languageBlocks = getLanguageHtmlBlocks(variation, formatKind);
        const showLanguageMarkers = shouldDrawLanguageMarker(languageBlocks);
        languageBlocks.forEach(languageBlock => {
            if (showLanguageMarkers) {
                writer.drawLanguageMarker(languageBlock.languageName, languageBlock.defaultFontKey === "arabic");
            }
            const lines = parseHazzatHtmlToLines(languageBlock.html, languageBlock.defaultFontKey);
            writer.drawBodyLines(lines);
            writer.cursorY -= 8;
        });
        writer.drawVariationDivider(followedByServiceDivider);
    }
}

export interface BookletTextRow {
    languages: ContentLanguage[];
    columnWidth: number;
    columns: SizedTextRun[][][];
}

export interface BookletTextTable {
    rows: BookletTextRow[];
}

/** Like the reader, use only the languages present in each paragraph. */
export function layoutBookletTextTable(content: ITextContent, fonts: EmbeddedFonts, width = CONTENT_WIDTH): BookletTextTable {
    const order = [ContentLanguage.English, ContentLanguage.Coptic, ContentLanguage.Arabic];
    const rows = content.paragraphs.map(paragraph => {
        const languages = order.filter(language => paragraph.columns.some(column => normalizeContentLanguage(column.language) === language && column.content?.trim()));
        const columnWidth = languages.length ? (width - (languages.length - 1) * 12) / languages.length : width;
        const columns = languages.map(language => {
            const key: FontKey = language === ContentLanguage.Arabic ? "arabic" : language === ContentLanguage.Coptic ? "coptic" : "english";
            const columns = paragraph.columns.filter(column => normalizeContentLanguage(column.language) === language);
            return columns.flatMap(column => parseHazzatHtmlToLines(column.content || "", key).flatMap(line =>
                wrapRuns(line.map(run => {
                    const isComment = paragraph.isComment || run.isComment;
                    return { ...run, ...(isComment ? { isComment: true } : {}), size: getRunFontSize(run.fontKey) * (isComment ? .9 : 1) };
                }), fonts, columnWidth)));
        });
        return { languages, columnWidth, columns };
    }).filter(row => row.columns.some(column => column.some(line => line.some(run => run.text.trim()))));
    return { rows };
}

function drawTextTable(writer: BookletWriter, content: ITextContent) {
    const table = layoutBookletTextTable(content, writer.fonts);
    for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
        const row = table.rows[rowIndex];
        const lineHeight = row.languages.includes(ContentLanguage.Arabic) ? ARABIC_FONT_SIZE * 1.45 : BODY_FONT_SIZE * 1.45;
        const isComment = row.columns.flat(2).some(run => run.isComment);
        const nextRow = table.rows[rowIndex + 1];
        const connectsToNextRow = nextRow && row.languages.join() === nextRow.languages.join() && !nextRow.columns.flat(2).some(run => run.isComment);
        const lineCount = Math.max(...row.columns.map(column => column.length));
        const rowHeight = lineCount * lineHeight + 12;
        if (rowIndex > 0 && rowHeight <= LOGICAL_PAGE_HEIGHT - PAGE_TOP - PAGE_BOTTOM) writer.ensureSpace(rowHeight);
        for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
            writer.ensureSpace(lineHeight + 6);
            row.columns.forEach((column, columnIndex) => {
                const x = PAGE_MARGIN_X + columnIndex * (row.columnWidth + 12);
                drawSizedLine(writer, column[lineIndex] || [], x, row.columnWidth, row.languages[columnIndex] === ContentLanguage.Arabic);
                if (columnIndex > 0 && !isComment) writer.page.drawLine({
                    start: { x: x - 6, y: writer.cursorY + lineHeight - 3 },
                    end: { x: x - 6, y: writer.cursorY - 3 - (lineIndex === lineCount - 1 && connectsToNextRow ? 12 : 0) }, thickness: 0.35, color: lightGray
                });
            });
            writer.cursorY -= lineHeight;
        }
        writer.cursorY -= 12;
    }
}

function getOrderedBookletVariations(format: IFormatInfo): BookletContentVariation[] {
    return [...((format.variations || []) as BookletContentVariation[])]
        .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function shouldDrawLanguageMarker(languageBlocks: LanguageHtmlBlock[]): boolean {
    const languageCount = new Set(languageBlocks.map(block => block.languageName.toLowerCase())).size;
    return languageCount > 1;
}

function getLanguageHtmlBlocks(variation: BookletContentVariation, formatKind: BookletFormatKind): LanguageHtmlBlock[] {
    if (formatKind === "text") {
        const content = variation.content as ITextContent;
        // Keep paragraphs and their translations together, in source order.
        return (content.paragraphs || []).flatMap(paragraph => (paragraph.columns || []).filter(column => normalizeContentLanguage(column.language)).map(column => ({
            html: column.content,
            defaultFontKey: (normalizeContentLanguage(column.language) === ContentLanguage.Arabic ? "arabic" : normalizeContentLanguage(column.language) === ContentLanguage.Coptic ? "coptic" : "english") as FontKey,
            languageName: normalizeContentLanguage(column.language)!
        }))).filter(hasLanguageHtml);
    }
    if (formatKind === "vertical") {
        const content = variation.content as IVerticalHazzatContent;
        const blocks: LanguageHtmlBlock[] = [
            { html: content.copticVerticalHazzat, defaultFontKey: "coptic", languageName: "Coptic" },
            { html: content.englishVerticalHazzat, defaultFontKey: "english", languageName: "English" },
            { html: content.arabicVerticalHazzat, defaultFontKey: "arabic", languageName: "Arabic" }
        ];
        return blocks.filter(hasLanguageHtml);
    }

    const content = variation.content as IHazzatContent;
    const blocks: LanguageHtmlBlock[] = [
        { html: content.copticHazzat, defaultFontKey: "coptic", languageName: "Coptic" },
        { html: content.englishHazzat, defaultFontKey: "english", languageName: "English" },
        { html: content.arabicHazzat, defaultFontKey: "arabic", languageName: "Arabic" }
    ];
    return blocks.filter(hasLanguageHtml);
}

function hasLanguageHtml(block: LanguageHtmlBlock): boolean {
    return !!block.html && block.html.trim().length > 0;
}

function getHymnBookletFormat(hymn: IHymnInfo, formatKind: BookletFormatKind): IFormatInfo | undefined {
    const formatId = getFormatId(formatKind);
    return hymn.formats?.find(format => format.id === formatId && format.variations?.some(variation => hasBookletVariationContent(variation, formatKind)));
}

function getFormatId(formatKind: BookletFormatKind): string {
    return formatKind === "musical" ? "4" : formatKind === "text" ? "1" : formatKind === "vertical" ? "3" : "2";
}

function drawServiceOrnament(page: PDFPage, image: PDFImage, top: number, maxHeight: number) {
    const width = Math.min(CONTENT_WIDTH * .55, maxHeight * image.width / image.height);
    const height = width * image.height / image.width;
    page.drawImage(image, { x: (LOGICAL_PAGE_WIDTH - width) / 2, y: top - height, width, height, opacity: .8 });
}

function drawToc(tocPages: PDFPage[], fonts: EmbeddedFonts, entries: TocEntry[], linkTargets: boolean, arabic: boolean, serviceDivider?: PDFImage) {
    let pageIndex = 0;
    let cursorY = LOGICAL_PAGE_HEIGHT - PAGE_TOP;
    const currentPage = () => tocPages[Math.min(pageIndex, tocPages.length - 1)];

    drawPlainHeadingLine(currentPage(), fonts, arabic ? "جدول المحتويات" : "Table of Contents", "title", 16,
        PAGE_MARGIN_X, LOGICAL_PAGE_WIDTH - PAGE_MARGIN_X, cursorY, black, false);
    cursorY -= 30;

    entries.forEach(entry => {
        if (cursorY < PAGE_BOTTOM + TOC_LINE_HEIGHT) {
            pageIndex += 1;
            cursorY = LOGICAL_PAGE_HEIGHT - PAGE_TOP;
        }

        const page = currentPage();
        const size = entry.level === "service" ? 9.5 : 8.5;
        const rtl = arabicUnicodePattern.test(entry.title);
        const font = rtl ? fonts.arabic : entry.level === "service" ? fonts.title : fonts.english;
        const indent = entry.level === "service" ? 0 : 12;
        const title = truncateToWidth(entry.title, font, size, CONTENT_WIDTH - 52 - indent);
        const pageNumber = arabic ? `${entry.pageNumber}`.replace(/[0-9]/g, digit => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]) : `${entry.pageNumber}`;
        const numberFont = arabic ? fonts.arabic : fonts.english;
        const pageNumberWidth = safeTextWidth(numberFont, pageNumber, 8.5);

        drawPlainHeadingLine(page, fonts, title, entry.level === "service" ? "title" : "english", size,
            PAGE_MARGIN_X + (arabic ? 52 : indent), LOGICAL_PAGE_WIDTH - PAGE_MARGIN_X - (arabic ? indent : 52), cursorY, black, false);
        let numberX = arabic ? PAGE_MARGIN_X : LOGICAL_PAGE_WIDTH - PAGE_MARGIN_X - pageNumberWidth;
        // The Arabic font shapes digit strings right-to-left; place digits individually to preserve ١٣ rather than ٣١.
        (arabic ? Array.from(pageNumber) : [pageNumber]).forEach(part => {
            page.drawText(part, { x: numberX, y: cursorY, size: 8.5, font: numberFont, color: black });
            numberX += safeTextWidth(numberFont, part, 8.5);
        });
        if (linkTargets) {
            addPageLinkAnnotation(page, entry.pageNumber, PAGE_MARGIN_X + (arabic ? 0 : indent), cursorY - 2, CONTENT_WIDTH - indent, TOC_LINE_HEIGHT);
        }
        cursorY -= TOC_LINE_HEIGHT;
    });
    if (serviceDivider && cursorY - 64 >= PAGE_BOTTOM) drawServiceOrnament(currentPage(), serviceDivider, cursorY - 10, 48);
}

function addPageLinkAnnotation(page: PDFPage, targetPageNumber: number, x: number, y: number, width: number, height: number) {
    const targetPage = page.doc.getPage(targetPageNumber - 1);
    if (!targetPage) {
        return;
    }

    const annotation = page.doc.context.obj({
        Type: "Annot",
        Subtype: "Link",
        Rect: [x, y, x + width, y + height],
        Border: [0, 0, 0],
        A: {
            S: "GoTo",
            D: [targetPage.ref, "Fit"]
        }
    });
    page.node.addAnnot(page.doc.context.register(annotation));
}

function drawPageNumbers(doc: PDFDocument, fonts: EmbeddedFonts, pageMetas: PageMeta[]) {
    doc.getPages().forEach((page, index) => {
        const meta = pageMetas[index];
        if (meta.kind !== "toc" && meta.kind !== "content") {
            return;
        }

        const pageNumber = `${index + 1}`;
        const width = safeTextWidth(fonts.english, pageNumber, 8);
        page.drawText(pageNumber, {
            x: (LOGICAL_PAGE_WIDTH - width) / 2,
            y: 22,
            size: 8,
            font: fonts.english,
            color: gray
        });
    });
}

function padLogicalPagesBeforeBackCover(doc: PDFDocument, pageMetas: PageMeta[]) {
    const paddingPageCount = getPaddingPageCount(pageMetas.length + 1);
    for (let i = 0; i < paddingPageCount; i++) {
        initializePageContent(doc.addPage([LOGICAL_PAGE_WIDTH, LOGICAL_PAGE_HEIGHT]));
        pageMetas.push({ kind: "padding" });
    }
}

function addBackCover(doc: PDFDocument, fonts: EmbeddedFonts, pageMetas: PageMeta[], images: BackCoverImages) {
    const page = doc.addPage([LOGICAL_PAGE_WIDTH, LOGICAL_PAGE_HEIGHT]);
    initializePageContent(page);
    pageMetas.push({ kind: "backCover" });

    if (images.background) {
        drawImageCover(page, images.background, 0, 0, LOGICAL_PAGE_WIDTH, LOGICAL_PAGE_HEIGHT, 0.42);
    }

    if (images.logo) {
        const logoWidth = 122;
        drawBookletLogo(page, images.logo, LOGICAL_PAGE_WIDTH - PAGE_MARGIN_X - logoWidth + 3, 30, logoWidth, 0.86);
    } else {
        drawCenteredPageText(page, fonts.english, "hazzat.com", 15, LOGICAL_PAGE_HEIGHT / 2, black);
    }
}

function initializePageContent(page: PDFPage) {
    page.drawRectangle({
        x: 0,
        y: 0,
        width: 0.01,
        height: 0.01,
        color: rgb(1, 1, 1)
    });
}

function drawCenteredPageText(page: PDFPage, font: PDFFont, text: string, size: number, y: number, color: RGB) {
    const width = safeTextWidth(font, text, size);
    page.drawText(text, {
        x: (LOGICAL_PAGE_WIDTH - width) / 2,
        y,
        size,
        font,
        color
    });
}

function drawImageCover(page: PDFPage, image: PDFImage, x: number, y: number, width: number, height: number, opacity: number) {
    const imageRatio = image.width / image.height;
    const targetRatio = width / height;
    const drawWidth = imageRatio > targetRatio ? height * imageRatio : width;
    const drawHeight = imageRatio > targetRatio ? height : width / imageRatio;

    page.drawImage(image, {
        x: x + ((width - drawWidth) / 2),
        y: y + ((height - drawHeight) / 2),
        width: drawWidth,
        height: drawHeight,
        opacity
    });
}

async function createPrintPdf(logicalDoc: PDFDocument, logicalPageCount: number): Promise<Uint8Array> {
    const printDoc = await PDFDocument.create();
    const impositionOrder = getBookletImpositionOrder(logicalPageCount);
    const logicalPdfBytes = await logicalDoc.save({ useObjectStreams: false });

    for (const spread of impositionOrder) {
        const [leftPageNumber, rightPageNumber] = spread;
        const sheet = printDoc.addPage([PRINT_PAGE_WIDTH, PRINT_PAGE_HEIGHT]);
        const [embeddedLeft, embeddedRight] = await printDoc.embedPdf(logicalPdfBytes, [leftPageNumber - 1, rightPageNumber - 1]);

        sheet.drawPage(embeddedLeft, {
            x: 0,
            y: 0,
            width: LOGICAL_PAGE_WIDTH,
            height: LOGICAL_PAGE_HEIGHT
        });
        sheet.drawPage(embeddedRight, {
            x: LOGICAL_PAGE_WIDTH,
            y: 0,
            width: LOGICAL_PAGE_WIDTH,
            height: LOGICAL_PAGE_HEIGHT
        });
    }

    printDoc.setTitle("Hazzat Booklet");
    printDoc.setSubject("Generated Hazzat booklet for printing");
    printDoc.setCreator("hazzat.com");
    printDoc.setProducer("hazzat.com");
    return printDoc.save({ useObjectStreams: false });
}

function drawWrappedPlainText(writer: BookletWriter, text: string, fontKey: FontKey, size: number, lineHeight: number, color: RGB, center: boolean) {
    const rtl = arabicUnicodePattern.test(text);
    const font = rtl ? writer.fonts.arabic : writer.fonts[fontKey];
    const lines = wrapPlainText(text, font, size, CONTENT_WIDTH);
    lines.forEach(line => {
        writer.ensureSpace(lineHeight);
        drawPlainHeadingLine(writer.page, writer.fonts, line, fontKey, size, PAGE_MARGIN_X, LOGICAL_PAGE_WIDTH - PAGE_MARGIN_X, writer.cursorY, color, center);
        writer.cursorY -= lineHeight;
    });
}

function drawPlainHeadingLine(page: PDFPage, fonts: EmbeddedFonts, text: string, fontKey: FontKey, size: number, left: number, right: number, y: number, color: RGB, center: boolean) {
    const rtl = arabicUnicodePattern.test(text);
    const runs: (TextRun & { ltr?: boolean })[] = rtl ? (text.match(/[\u0020-\u00ff]+|[^\u0020-\u00ff]+/g) || []).flatMap(segment => {
        if (/[A-Za-z0-9\u00c0-\u00ff]/.test(segment)) {
            // Keep Latin words and numbers together within an Arabic heading.
            const leading = segment.match(/^\s*/)![0];
            const trailing = segment.match(/\s*$/)![0];
            return [{ text: trailing + segment.trim() + leading, fontKey: "english" as FontKey, ltr: true }];
        }
        return splitTextForFont(segment, "arabic");
    }) : splitTextForFont(text, fontKey);
    const mirror: Record<string, string> = { "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<" };
    const drawable = runs.map((run, i) => {
        let value = getDrawableRunText(runs, i, rtl);
        if (rtl && run.fontKey === "english" && !run.ltr) value = Array.from(value).reverse().map(char => mirror[char] || char).join("");
        return { text: value, font: fonts[run.fontKey] };
    });
    const width = drawable.reduce((sum, run) => sum + safeTextWidth(run.font, run.text, size), 0);
    const start = center ? left + (right - left - width) / 2 : rtl ? right - width : left;
    let x = rtl ? start + width : start;
    drawable.forEach(run => {
        const runWidth = safeTextWidth(run.font, run.text, size);
        page.drawText(run.text, { x: rtl ? x - runWidth : x, y, size, font: run.font, color });
        x += rtl ? -runWidth : runWidth;
    });
}

function drawWrappedRuns(writer: BookletWriter, runs: SizedTextRun[]) {
    const wrappedLines = wrapRuns(runs, writer.fonts, CONTENT_WIDTH);

    wrappedLines.forEach(line => {
        const lineHeight = Math.max(...line.map(run => run.size)) * 1.35;
        writer.ensureSpace(lineHeight);
        drawSizedLine(writer, line, PAGE_MARGIN_X, CONTENT_WIDTH);
        writer.cursorY -= lineHeight;
    });
}

function drawSizedLine(writer: BookletWriter, line: SizedTextRun[], left: number, width: number, rtl = line.some(run => isRtlRun(run))) {
    let x = rtl ? left + width : left;
    line.forEach((run, runIndex) => {
        const text = getDrawableRunText(line, runIndex, rtl);
        const font = writer.fonts[run.fontKey];
        const runWidth = safeTextWidth(font, text, run.size);
        const drawX = rtl ? x - runWidth : x;
        const ink = bookletColors[isHazzatFontKey(run.fontKey) ? writer.appearance.hazzatColor : writer.appearance.textColor].rgb;
        if (text.trim().length > 0) {
            writer.page.drawText(text, {
                x: drawX,
                y: writer.cursorY,
                size: run.size,
                font,
                color: run.isComment ? rgb(.55, .16, .14) : rgb(ink[0], ink[1], ink[2]),
                ySkew: run.isComment ? degrees(10) : undefined
            });
        }
        x = rtl ? x - runWidth : x + runWidth;
    });

}

export function getDrawableRunText(line: TextRun[], runIndex: number, rtlLine = line.some(run => isRtlRun(run))): string {
    const run = line[runIndex];

    if (run.fontKey === "arabic") {
        return addArabicJoiningContext(line, runIndex);
    }

    if (rtlLine && isArabicHazzatFontKey(run.fontKey)) {
        return reverseText(run.text);
    }

    return run.text;
}

function addArabicJoiningContext(line: TextRun[], runIndex: number): string {
    const run = line[runIndex];
    let text = run.text;
    const firstChar = findJoiningCandidateInText(text, "forward");
    const lastChar = findJoiningCandidateInText(text, "backward");
    const previousChar = findJoiningCandidateInLine(line, runIndex, "backward");
    const nextChar = findJoiningCandidateInLine(line, runIndex, "forward");

    if (previousChar && firstChar && canJoinToNext(previousChar) && canJoinToPrevious(firstChar)) {
        text = `${zeroWidthJoiner}${text}`;
    }

    if (lastChar && nextChar && canJoinToNext(lastChar) && canJoinToPrevious(nextChar)) {
        text = `${text}${zeroWidthJoiner}`;
    }

    return text;
}

function findJoiningCandidateInLine(line: TextRun[], runIndex: number, direction: "forward" | "backward"): string | undefined {
    const step = direction === "forward" ? 1 : -1;
    for (let candidateIndex = runIndex + step; candidateIndex >= 0 && candidateIndex < line.length; candidateIndex += step) {
        const candidate = findJoiningCandidateInText(line[candidateIndex].text, direction);
        if (candidate) {
            return candidate;
        }

        if (line[candidateIndex].text.trim() === "") {
            return undefined;
        }
    }

    return undefined;
}

function findJoiningCandidateInText(text: string, direction: "forward" | "backward"): string | undefined {
    const chars = Array.from(text);
    const orderedChars = direction === "forward" ? chars : chars.reverse();

    for (const char of orderedChars) {
        if (isTransparentArabicCharacter(char)) {
            continue;
        }

        if (char.trim() === "") {
            return undefined;
        }

        return char;
    }

    return undefined;
}

function canJoinToNext(char: string): boolean {
    return dualJoiningArabicCharacters.has(char);
}

function canJoinToPrevious(char: string): boolean {
    return dualJoiningArabicCharacters.has(char) || rightJoiningArabicCharacters.has(char);
}

function isTransparentArabicCharacter(char: string): boolean {
    return arabicTransparentCharacterPattern.test(char);
}

function reverseText(text: string): string {
    return Array.from(text).reverse().join("");
}

export function wrapRuns(runs: SizedTextRun[], fonts: EmbeddedFonts, maxWidth: number): SizedTextRun[][] {
    const parts = runs.flatMap(splitRunByWhitespace);
    const lines: SizedTextRun[][] = [];
    let currentLine: SizedTextRun[] = [];
    let currentWidth = 0;

    parts.forEach(part => {
        const font = fonts[part.fontKey];
        const width = safeTextWidth(font, part.text, part.size);
        const isWhitespace = part.text.trim() === "";

        if (!isWhitespace && currentLine.length > 0 && currentWidth + width > maxWidth) {
            lines.push(trimLineEnd(currentLine));
            currentLine = [];
            currentWidth = 0;
        }

        if (!isWhitespace && width > maxWidth) {
            splitLongRun(part, font, maxWidth).forEach(piece => {
                if (currentLine.length > 0) {
                    lines.push(trimLineEnd(currentLine));
                    currentLine = [];
                    currentWidth = 0;
                }
                lines.push([piece]);
            });
            return;
        }

        if (currentLine.length === 0 && isWhitespace) {
            return;
        }

        currentLine.push(part);
        currentWidth += width;
    });

    if (currentLine.length > 0) {
        lines.push(trimLineEnd(currentLine));
    }

    return lines.length > 0 ? lines : [[]];
}

function splitRunByWhitespace(run: SizedTextRun): SizedTextRun[] {
    return run.text
        .split(/(\s+)/)
        .filter(text => text.length > 0)
        .map(text => ({ ...run, text }));
}

function splitLongRun(run: SizedTextRun, font: PDFFont, maxWidth: number): SizedTextRun[] {
    const pieces: SizedTextRun[] = [];
    let buffer = "";

    Array.from(run.text).forEach(char => {
        const next = buffer + char;
        if (buffer && safeTextWidth(font, next, run.size) > maxWidth) {
            pieces.push({ ...run, text: buffer });
            buffer = char;
        } else {
            buffer = next;
        }
    });

    if (buffer) {
        pieces.push({ ...run, text: buffer });
    }

    return pieces;
}

function trimLineEnd(line: SizedTextRun[]): SizedTextRun[] {
    const result = [...line];
    while (result.length > 0 && result[result.length - 1].text.trim() === "") {
        result.pop();
    }
    return result;
}

function safeTextWidth(font: PDFFont, text: string, size: number): number {
    if (!text) {
        return 0;
    }

    return font.widthOfTextAtSize(text, size);
}

function getRunFontSize(fontKey: FontKey): number {
    if (fontKey === "arabic" || fontKey === "hazzatArabic" || fontKey === "hazzatVerticalArabic") {
        return ARABIC_FONT_SIZE;
    }

    if (fontKey === "hazzat" || fontKey === "hazzatVertical") {
        return HAZZAT_FONT_SIZE;
    }

    return BODY_FONT_SIZE;
}

function isRtlRun(run: TextRun): boolean {
    return run.fontKey === "arabic" ||
        run.fontKey === "hazzatArabic" ||
        run.fontKey === "hazzatVerticalArabic" ||
        isArabicCharacter(run.text);
}

function isArabicCharacter(text: string): boolean {
    return arabicUnicodePattern.test(text);
}

function isHazzatFontKey(fontKey: FontKey): boolean {
    return fontKey === "hazzat" ||
        fontKey === "hazzatVertical" ||
        fontKey === "hazzatArabic" ||
        fontKey === "hazzatVerticalArabic";
}

function isArabicHazzatFontKey(fontKey: FontKey): boolean {
    return fontKey === "hazzatArabic" || fontKey === "hazzatVerticalArabic";
}

function wrapPlainText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";

    words.forEach(word => {
        const candidate = line ? `${line} ${word}` : word;
        if (line && safeTextWidth(font, candidate, size) > maxWidth) {
            lines.push(line);
            line = word;
        } else {
            line = candidate;
        }
    });

    if (line) {
        lines.push(line);
    }

    return lines.length > 0 ? lines : [text];
}

function truncateToWidth(text: string, font: PDFFont, size: number, maxWidth: number): string {
    if (safeTextWidth(font, text, size) <= maxWidth) {
        return text;
    }

    let result = text;
    while (result.length > 0 && safeTextWidth(font, `${result}...`, size) > maxWidth) {
        result = result.slice(0, -1);
    }

    return `${result}...`;
}

function sanitizeFileName(fileName: string): string {
    return fileName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
