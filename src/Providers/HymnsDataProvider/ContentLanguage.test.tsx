import { render, screen } from "@testing-library/react";
import { ContentLanguage, ContentType, ITextContent, normalizeContentLanguage } from "./Models/IVariationInfo";
import { validateLibraryRecord } from "./SharedContent";
import { EmbeddedFonts, hasBookletVariationContent, layoutBookletTextTable } from "../../Booklets/BookletPdfGenerator";
import ContentText from "../../Components/ContentText";

const font = { widthOfTextAtSize: (text: string, size: number) => text.length * size * .5 };
const fonts = Object.fromEntries(["title", "english", "arabic", "coptic", "copticFallback", "hazzat", "hazzatVertical", "hazzatArabic", "hazzatVerticalArabic"].map(key => [key, font])) as unknown as EmbeddedFonts;
const content = (): ITextContent => ({ contentType: ContentType.TextContent, paragraphs: [
    { columns: [{ language: ContentLanguage.English, content: "First paragraph" }] },
    { isComment: true, columns: [
        { language: "arabic" as ContentLanguage, content: "ارحمنا" },
        { language: "coptic" as ContentLanguage, content: "Nai nan" },
        { language: "english" as ContentLanguage, content: "Second paragraph" }
    ] }
] });

it.each(["English", "english", "ENGLISH", " eNgLiSh "])("recognizes supported language casing (%s)", language => {
    expect(normalizeContentLanguage(language)).toBe(ContentLanguage.English);
});

it("keeps lowercase-language paragraphs in the correct booklet columns and fonts without changing source data", () => {
    const source = content();
    const original = JSON.stringify(source);
    const table = layoutBookletTextTable(source, fonts);
    expect(table.rows[0].languages).toEqual([ContentLanguage.English]);
    expect(table.rows[1].languages).toEqual([ContentLanguage.English, ContentLanguage.Coptic, ContentLanguage.Arabic]);
    expect(table.rows).toHaveLength(2);
    expect(table.rows[1].columns.map(column => column.flat().map(run => run.text).join(""))).toEqual(["Second paragraph", "Nai nan", "ارحمنا"]);
    expect(table.rows[1].columns.map(column => column.flat().find(run => run.text.trim())!.fontKey)).toEqual(["english", "coptic", "arabic"]);
    expect(table.rows[1].columns.flat(2).every(run => run.isComment)).toBe(true);
    expect(JSON.stringify(source)).toBe(original);
});

it("shows an entirely lowercase-language variation in the booklet and reader", () => {
    const source = content();
    source.paragraphs.shift();
    const variation = { id: "lowercase", name: "Standard", displayName: "Standard", content: source };
    expect(hasBookletVariationContent(variation, "text")).toBe(true);
    expect(layoutBookletTextTable(source, fonts).rows).toHaveLength(1);
    render(<ContentText variations={[variation]} />);
    expect(screen.getByText("Second paragraph:")).toBeInTheDocument();
    expect(screen.getByText("ارحمنا:")).toBeInTheDocument();
    expect(document.querySelector(".CopticComment")).toHaveTextContent("Nai nan");
});

it("accepts legacy casing but rejects unsupported language labels before they can be silently dropped", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const record = { schemaVersion: 5, id, name: "Standard", contentType: "Text", content: content() };
    expect(validateLibraryRecord(record, id)).toBe(record);
    record.content.paragraphs[0].columns[0].language = "unknown" as ContentLanguage;
    expect(() => validateLibraryRecord(record, id)).toThrow("Invalid text column language or content");
});
