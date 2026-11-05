/** Run explicitly with Jest and HAZZAT_CONTENT_AUDIT_DATASET pointing to a downloaded v5 snapshot. */
import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ContentLanguage, ITextContent } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import { resolveSharedService, validateIdentity, validateLibraryRecord, validateService } from "../Providers/HymnsDataProvider/SharedContent";
import { EmbeddedFonts, getBookletSections, hasBookletVariationContent, layoutBookletTextTable, parseHazzatHtmlToLines } from "../Booklets/BookletPdfGenerator";
import ContentText from "../Components/ContentText";
import ContentHazzat from "../Components/ContentHazzat";
import ContentVerticalHazzat from "../Components/ContentVerticalHazzat";
import ContentAudio from "../Components/ContentAudio";
import ContentVideo from "../Components/ContentVideo";
import ContentInformation from "../Components/ContentInformation";

const root = process.env.HAZZAT_CONTENT_AUDIT_DATASET!;
const output = process.env.HAZZAT_CONTENT_AUDIT_OUTPUT!;
const read = (key: string) => JSON.parse(fs.readFileSync(path.join(root, key), "utf8"));
const compact = (value: string) => value.replace(/\s+/g, "");
const font = { widthOfTextAtSize: (text: string, size: number) => text.length * size * .5 };
const fonts = Object.fromEntries(["title", "english", "arabic", "coptic", "copticFallback", "hazzat", "hazzatVertical", "hazzatArabic", "hazzatVerticalArabic"].map(key => [key, font])) as unknown as EmbeddedFonts;
const kinds = { Text: "text", Hazzat: "regular", VerticalHazzat: "vertical", MusicalNotes: "musical" } as const;
const canonical = (value: any): string => Array.isArray(value) ? `[${value.map(canonical).join(",")}]` :
    value && typeof value === "object" ? `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}` : JSON.stringify(value);

it("audits every catalog record and retained service through the real public reader and booklet code", async () => {
    if (!root || !output) throw new Error("Set HAZZAT_CONTENT_AUDIT_DATASET and HAZZAT_CONTENT_AUDIT_OUTPUT");
    const catalog = read("v5/metadata/content-catalog.json");
    const usage = read("v5/metadata/content-usage.json");
    const issues: any[] = [];
    const records: Record<string, ReturnType<typeof validateLibraryRecord>> = {};
    const identities: Record<string, ReturnType<typeof validateIdentity>> = {};
    const summary = { contentRecords: catalog.length, identities: 0, services: 0, hymnPlacements: 0, variationPlacements: 0,
        printableRecords: 0, missingInnerType: 0, noncanonicalLanguageRecords: 0, noncanonicalLanguageColumns: 0,
        readerRenders: 0, localeServiceResolutions: 0, catalogHashesVerified: 0, types: {} as Record<string, number> };
    const noncanonical: any[] = [];
    for (const entry of read("v5/metadata/hymn-catalog.json")) {
        identities[entry.id] = validateIdentity(read(`v5/hymns/${entry.id}/hymn.json`), entry.id);
        summary.identities++;
    }
    for (const entry of catalog) {
        try {
            const record = records[entry.id] = validateLibraryRecord(read(`v5/content/${entry.id}.json`), entry.id);
            if (entry.payloadHash) {
                const hash = createHash("sha256").update(canonical({ contentType: record.contentType, content: record.content })).digest("hex");
                if (hash !== entry.payloadHash) throw new Error("Catalog payload hash differs from published content");
                summary.catalogHashesVerified++;
            }
            summary.types[record.contentType] = (summary.types[record.contentType] || 0) + 1;
            if (!record.content.contentType) summary.missingInnerType++;
            const variation = { id: record.id, name: record.name, displayName: record.name, content: record.content as any };
            if (record.contentType in kinds) {
                summary.printableRecords++;
                if (!hasBookletVariationContent(variation, kinds[record.contentType as keyof typeof kinds])) throw new Error("Printable content rejected by booklet availability");
            }
            if (record.contentType === "Text") {
                const content = record.content as unknown as ITextContent;
                const columns = content.paragraphs.flatMap(p => p.columns);
                const lower = columns.filter(c => !Object.values(ContentLanguage).includes(c.language));
                if (lower.length) {
                    summary.noncanonicalLanguageRecords++;
                    summary.noncanonicalLanguageColumns += lower.length;
                    noncanonical.push({ id: record.id, name: record.name, columns: lower.length, usages: usage[record.id] || [] });
                }
                const table = layoutBookletTextTable(content, fonts);
                for (const language of Object.values(ContentLanguage)) {
                    const key = language === ContentLanguage.Arabic ? "arabic" : language === ContentLanguage.Coptic ? "coptic" : "english";
                    const expected = columns.filter(c => c.language.trim().toLowerCase() === language.toLowerCase())
                        .flatMap(c => parseHazzatHtmlToLines(c.content, key)).flat().map(run => run.text).join("");
                    const actual = table.rows.flatMap(row => row.columns[row.languages.indexOf(language)] || []).flat().map(run => run.text).join("");
                    if (compact(actual) !== compact(expected)) throw new Error(`Booklet drops or changes ${language} text`);
                }
            }
            if (record.contentType === "MusicalNotes") {
                const xml = new DOMParser().parseFromString(String(record.content.musicXml), "application/xml");
                if (xml.querySelector("parsererror") || !["score-partwise", "score-timewise"].includes(xml.documentElement.localName)) throw new Error("Invalid MusicXML");
            } else {
                const components = { Text: ContentText, Hazzat: ContentHazzat, VerticalHazzat: ContentVerticalHazzat,
                    Audio: ContentAudio, Video: ContentVideo, Information: ContentInformation };
                const Component = components[record.contentType];
                const markup = renderToStaticMarkup(<Component variations={[variation]} hymnTitle={record.name} />);
                if (!markup) throw new Error("Reader produced no markup");
                const rendered = compact(new DOMParser().parseFromString(markup, "text/html").body.textContent || "");
                const htmlFields: Record<string, string[]> = { Hazzat: ["englishHazzat", "copticHazzat", "arabicHazzat"],
                    VerticalHazzat: ["englishVerticalHazzat", "copticVerticalHazzat", "arabicVerticalHazzat"], Information: ["englishInformation", "arabicInformation"] };
                const sourceHtml = record.contentType === "Text" ? (record.content as unknown as ITextContent).paragraphs.flatMap(p => p.columns.map(c => c.content)) :
                    (htmlFields[record.contentType] || []).map(field => String(record.content[field] || ""));
                for (const html of sourceHtml) {
                    const expected = compact(new DOMParser().parseFromString(`<body>${html}</body>`, "text/html").body.textContent || "");
                    if (expected && !rendered.includes(expected)) throw new Error("Reader drops source text");
                }
                summary.readerRenders++;
            }
        } catch (error) { issues.push({ id: entry.id, name: entry.name, type: entry.contentType, error: String(error), usages: usage[entry.id] || [] }); }
    }
    for (const seasonId of fs.readdirSync(path.join(root, "v5/seasons"))) {
        for (const file of fs.readdirSync(path.join(root, "v5/seasons", seasonId, "services"))) {
            try {
                const service = validateService(read(`v5/seasons/${seasonId}/services/${file}`), seasonId, file.replace(/\.json$/, ""));
                summary.services++;
                summary.hymnPlacements += service.hymns.length;
                summary.variationPlacements += service.hymns.flatMap(h => Object.values(h.formats)).flat().length;
                for (const locale of ["en", "ar"]) {
                    const resolved = await resolveSharedService(service, async id => identities[id], async id => records[id], locale);
                    summary.localeServiceResolutions++;
                    const sections = getBookletSections([resolved], ["text", "regular", "vertical", "musical"]);
                    const actual = sections.flatMap(section => section.format.variations || []);
                    const expected = service.hymns.flatMap(h => Object.entries(h.formats).filter(([format]) => Number(format) <= 4).flatMap(([, refs]) => refs));
                    if (actual.length !== expected.length) throw new Error("Service booklet silently omits assigned variations");
                }
            } catch (error) { issues.push({ service: `${seasonId}/${file}`, error: String(error) }); }
        }
    }
    const report = { summary, findings: issues, noncanonicalLanguageRecords: noncanonical };
    fs.writeFileSync(output, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ ...summary, findings: issues.length }));
    expect(issues).toEqual([]);
}, 120_000);
