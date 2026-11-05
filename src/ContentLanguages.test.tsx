import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ContentLanguage, ContentType, IHazzatContent, ITextContent, IVerticalHazzatContent } from "./Providers/HymnsDataProvider/Models/IVariationInfo";
import { contentLanguages, filterContentLanguages, normalizeContentLanguages } from "./ContentLanguages";
import { UserSettingProvider } from "./Contexts/UserSettingsContext";
import Content from "./Components/Content";
import UserSettingsChanger from "./Components/UserSettingsChanger";
import { strings } from "./l8n";

afterEach(() => { cleanup(); localStorage.clear(); });
beforeEach(() => strings.setLanguage("en"));

it("filters paragraph translations without changing source data and preserves row comments", () => {
    const content: ITextContent = { contentType: ContentType.TextContent, paragraphs: [
        { isComment: true, columns: [{ language: ContentLanguage.English, content: "English instructions" }, { language: "arabic" as ContentLanguage, content: "تعليق" }] },
        { columns: [{ language: ContentLanguage.Coptic, content: "Nai" }] }
    ] };
    const original = JSON.stringify(content);
    expect(filterContentLanguages(content, [ContentLanguage.Arabic]).paragraphs).toEqual([
        { isComment: true, columns: [{ language: "arabic", content: "تعليق" }] }
    ]);
    expect(filterContentLanguages(content, []).paragraphs).toEqual([]);
    expect(JSON.stringify(content)).toBe(original);
});

it("normalizes saved preferences while keeping a deliberately empty selection", () => {
    expect(normalizeContentLanguages(undefined)).toEqual(contentLanguages);
    expect(normalizeContentLanguages(["invalid"])).toEqual(contentLanguages);
    expect(normalizeContentLanguages(["arabic", "Arabic", "invalid"])).toEqual([ContentLanguage.Arabic]);
    expect(normalizeContentLanguages([])).toEqual([]);
});

it("updates reader columns immediately, persists choices, and restores them on reload", async () => {
    const content: ITextContent = { contentType: ContentType.TextContent, paragraphs: [{ columns: [
        { language: ContentLanguage.English, content: "English verse" }, { language: ContentLanguage.Coptic, content: "Nai" }, { language: ContentLanguage.Arabic, content: "ارحمنا" }
    ] }] };
    const load = jest.fn(async () => [{ id: "text", name: "Standard", displayName: "Standard", content }]);
    const reader = () => <UserSettingProvider><UserSettingsChanger /><Content formatId="1" hymnTitle="Hymn" variationsCallback={load} /></UserSettingProvider>;
    const view = render(reader());
    await screen.findByText("ارحمنا");
    fireEvent.click(screen.getByRole("button", { name: strings.settings }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Coptic", exact: true }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Arabic", exact: true }));
    expect(screen.queryByText("ارحمنا")).not.toBeInTheDocument();
    expect(document.querySelectorAll("colgroup col:not(.separator-text-content)")).toHaveLength(1);
    expect(screen.getByText("English verse")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(JSON.parse(localStorage.getItem("hazzat.reader-settings")!).contentLanguages).toEqual(["English"]));
    view.unmount();render(reader());
    await screen.findByText("English verse");
    expect(screen.queryByText("ارحمنا")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: strings.settings }));
    expect(screen.getByRole("checkbox", { name: "Arabic", exact: true })).not.toBeChecked();
    fireEvent.click(screen.getByRole("checkbox", { name: "English", exact: true }));
    expect(screen.getByRole("status")).toHaveTextContent(strings.noSelectedLanguageContent);
    fireEvent.click(screen.getByRole("checkbox", { name: "Arabic", exact: true }));
    expect(screen.getByText("ارحمنا")).toBeInTheDocument();
});

it.each(["2", "3"])("applies saved languages to notation blocks in reader format %s", async formatId => {
    localStorage.setItem("hazzat.reader-settings", JSON.stringify({ contentLanguages: ["Arabic"] }));
    const content: IHazzatContent | IVerticalHazzatContent = formatId === "2"
        ? { contentType: ContentType.HazzatContent, englishHazzat: "English notes", copticHazzat: "Coptic notes", arabicHazzat: "ارحمنا" }
        : { contentType: ContentType.VerticalHazzatContent, englishVerticalHazzat: "English notes", copticVerticalHazzat: "Coptic notes", arabicVerticalHazzat: "ارحمنا" };
    render(<UserSettingProvider><Content formatId={formatId} variationsCallback={async () => [{ id: "notes", name: "Notes", displayName: "Notes", content }]} /></UserSettingProvider>);
    await screen.findByText("ارحمنا");
    expect(screen.queryByText("English notes")).not.toBeInTheDocument();
    expect(screen.queryByText("Coptic notes")).not.toBeInTheDocument();
});
