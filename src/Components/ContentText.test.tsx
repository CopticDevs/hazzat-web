import { render, screen, within } from "@testing-library/react";
import ContentText from "./ContentText";
import { filterContentLanguages } from "../ContentLanguages";
import { ContentLanguage, ContentType, ITextContent, TextColumn } from "../Providers/HymnsDataProvider/Models/IVariationInfo";

const languages = [ContentLanguage.English, ContentLanguage.Coptic, ContentLanguage.Arabic];
const combinations = Array.from({ length: 8 }, (_, mask) => languages.filter((_, index) => mask & (1 << index)));
const column = (language: ContentLanguage): TextColumn => ({ language, content: `${language} verse` });
const variation = (content: ITextContent) => ({ id: "text", name: "Text", displayName: "Text", content });

describe.each(combinations.map(available => [available.join(" + ") || "none", available] as const))("available languages: %s", (_label, available) => {
    test.each(combinations.map(selected => [selected.join(" + ") || "none", selected] as const))("selected languages: %s", (_selection, selected) => {
        const content: ITextContent = { contentType: ContentType.TextContent, paragraphs: [
            { columns: [...available].reverse().map(column) },
            { isComment: true, columns: [...available].reverse().map(column) }
        ] };
        render(<ContentText variations={[variation(filterContentLanguages(content, [...selected]))]} />);
        const visible = available.filter(language => selected.includes(language));
        const rows = screen.queryAllByRole("row");
        expect(rows).toHaveLength(visible.length ? 2 : 0);
        expect(screen.queryAllByRole("table")).toHaveLength(visible.length ? 1 : 0);
        rows.forEach((row, rowIndex) => {
            const cells = within(row).getAllByRole("cell");
            visible.forEach((language, index) => {
                expect(cells[index]).toHaveTextContent(`${language} verse`);
                expect(cells[index].classList.contains("contentRBorder")).toBe(rowIndex === 0 && index < visible.length - 1);
                expect(cells[index]).toHaveStyle({ direction: language === ContentLanguage.Arabic ? "rtl" : "ltr" });
            });
        });
    });
});

test("blank translations and changing paragraph languages do not leave trailing dividers", () => {
    render(<ContentText variations={[variation({ contentType: ContentType.TextContent, paragraphs: [
        { columns: [column(ContentLanguage.Arabic), { language: " coptic " as ContentLanguage, content: "   " }, { language: "english" as ContentLanguage, content: "English verse" }] },
        { columns: [column(ContentLanguage.Coptic)] },
        { columns: languages.map(column) },
        { isComment: true, columns: languages.map(column) }
    ] })]} />);
    const tables = screen.getAllByRole("table");
    expect(tables).toHaveLength(3);
    expect(within(tables[0]).getByText("English verse")).toHaveClass("contentRBorder");
    expect(within(tables[0]).getByText("Arabic verse")).not.toHaveClass("contentRBorder");
    expect(within(tables[1]).getByText("Coptic verse")).not.toHaveClass("contentRBorder");
    const [verse, comment] = within(tables[2]).getAllByRole("row");
    const cells = within(verse).getAllByRole("cell");
    expect(cells[0]).toHaveClass("contentRBorder");
    expect(cells[1]).toHaveClass("contentRBorder");
    expect(cells[2]).not.toHaveClass("contentRBorder");
    within(comment).getAllByRole("cell").forEach(cell => expect(cell).not.toHaveClass("contentRBorder"));
});
