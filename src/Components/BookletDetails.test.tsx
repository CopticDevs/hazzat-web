import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { generateSeasonBookletPdf } from "../Booklets/BookletPdfGenerator";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { ContentLanguage, ContentType } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { strings } from "../l8n";
import BookletDetails, { getSelectedBookletServices } from "./BookletDetails";
import { contentLanguages } from "../ContentLanguages";
import { UserSettingsContext } from "../Contexts/UserSettingsContext";

jest.mock("axios", () => ({ create: jest.fn() }));

jest.mock("../Booklets/BookletPdfGenerator", () => ({
    ...jest.requireActual("../Booklets/BookletPdfGenerator"), generateSeasonBookletPdf: jest.fn()
}));

const service: IServiceInfo = {
    id: "vespers", seasonId: "annual", name: "Vespers", displayName: "Vespers", order: 1, verse: "", isDateSpecific: false,
    hymns: [{ id: "first", name: "First hymn", displayName: "First hymn", order: 1, formats: [
        { id: "1", name: "Text", order: 1, variationCount: 1, variations: [{ id: "standard", name: "Text words", displayName: "Text words", content: {
            contentType: ContentType.TextContent, paragraphs: [{ columns: [{ language: ContentLanguage.English, content: "Lord have mercy" }] }]
        } }] },
        { id: "2", name: "Hazzat", order: 2, variationCount: 1, variations: [{ id: "standard", name: "Notation", displayName: "Notation", content: {
            contentType: ContentType.HazzatContent, englishHazzat: "Lord", copticHazzat: "", arabicHazzat: ""
        } }] }
    ] }]
};
const generator = generateSeasonBookletPdf as jest.MockedFunction<typeof generateSeasonBookletPdf>;
const createUrl = jest.fn(() => "blob:booklet-preview");
const revokeUrl = jest.fn();

async function openBuilder(settings?: React.ContextType<typeof UserSettingsContext>) {
    const content = <MemoryRouter initialEntries={["/Booklets/annual"]}><Routes>
        <Route path="/Booklets/:bookletId" element={<BookletDetails />} />
    </Routes></MemoryRouter>;
    const result = render(settings ? <UserSettingsContext.Provider value={settings}>{content}</UserSettingsContext.Provider> : content);
    await screen.findByRole("heading", { name: "Build your booklet" });
    return result;
}

describe("booklet builder", () => {
    it("starts with website languages and lets booklet overrides change availability without changing preferences", async () => {
        const settings = { userSettings: { contentFontColor: "NAVY", hazzatFontColor: "MAROON", englishFontSize: "18px", arabicFontSize: "22px", contentLanguages: [ContentLanguage.English] },
            setContentFontColor: jest.fn(), setHazzatFontColor: jest.fn(), setContentFontSize: jest.fn(), setContentLanguages: jest.fn() };
        await openBuilder(settings);
        const choices = within(screen.getByRole("group", { name: "Content languages", exact: true }));
        expect(choices.getByRole("checkbox", { name: "English", exact: true })).toBeChecked();
        expect(choices.getByRole("checkbox", { name: "Arabic", exact: true })).not.toBeChecked();
        fireEvent.click(screen.getByRole("button", { name: "Review booklet", exact: true }));
        await screen.findByRole("link", { name: "Download PDF" });
        expect(generator).toHaveBeenLastCalledWith(expect.objectContaining({ languages: [ContentLanguage.English], appearance: { textColor: "NAVY", hazzatColor: "MAROON" } }));
        fireEvent.click(choices.getByRole("checkbox", { name: "English", exact: true }));
        expect(screen.queryByRole("link", { name: "Download PDF" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Text Only", exact: true })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Review booklet", exact: true })).toBeDisabled();
        fireEvent.click(screen.getByRole("button", { name: "Use my website languages", exact: true }));
        expect(screen.getByRole("button", { name: "Text Only", exact: true })).toBeInTheDocument();
        expect(settings.setContentLanguages).not.toHaveBeenCalled();
        expect(settings.userSettings.contentLanguages).toEqual([ContentLanguage.English]);
    });
    beforeEach(() => {
        createUrl.mockReturnValue("blob:booklet-preview");
        strings.setLanguage("en");
        jest.spyOn(HymnsDataProvider.prototype, "getSeason").mockResolvedValue({ id: "annual", name: "Annual", displayName: "Annual", order: 1, isDateSpecific: false });
        jest.spyOn(HymnsDataProvider.prototype, "getServiceList").mockResolvedValue([service]);
        Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createUrl });
        Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeUrl });
        generator.mockResolvedValue(new Uint8Array([37, 80, 68, 70]));
    });
    afterEach(() => { jest.restoreAllMocks(); jest.clearAllMocks(); strings.setLanguage("en"); });

    it("defaults to text plus Hazzat, generates one reviewed PDF, and invalidates stale downloads", async () => {
        const { unmount } = await openBuilder();
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        const download = await screen.findByRole("link", { name: "Download PDF" });
        expect(generator).toHaveBeenCalledWith(expect.objectContaining({ formatKinds: ["text", "regular"], groupingKind: "hymn", layoutKind: "display" }));
        expect(download).toHaveAttribute("download", "annual-text-hazzat-booklet-display.pdf");
        expect(download).toHaveAttribute("href", "blob:booklet-preview");
        fireEvent.change(screen.getByLabelText("PDF layout"), { target: { value: "print" } });
        expect(screen.queryByRole("link", { name: "Download PDF" })).not.toBeInTheDocument();
        expect(revokeUrl).toHaveBeenCalledWith("blob:booklet-preview");
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        await screen.findByRole("link", { name: "Download PDF" });
        expect(generator).toHaveBeenLastCalledWith(expect.objectContaining({ layoutKind: "print" }));
        unmount();
        expect(revokeUrl).toHaveBeenCalledTimes(2);
    });

    it("automatically omits unavailable formats and still disables empty booklets", async () => {
        const partial = { ...service, hymns: [...service.hymns!, { ...service.hymns![0], id: "second", name: "Second hymn", displayName: "Second hymn", formats: [service.hymns![0].formats![1]] }] };
        jest.spyOn(HymnsDataProvider.prototype, "getServiceList").mockResolvedValue([partial]);
        await openBuilder();
        fireEvent.click(screen.getByRole("button", { name: "Text + Hazzat" }));
        expect(screen.getByRole("button", { name: "Review booklet" })).toBeEnabled();
        expect(screen.queryByLabelText(/Include available content/)).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        await screen.findByRole("link", { name: "Download PDF" });
        expect(generator.mock.calls[0][0].services[0].hymns!.map(hymn => hymn.formats!.map(format => format.id))).toEqual([["1", "2"], ["2"]]);
        fireEvent.click(screen.getByRole("button", { name: "Hazzat", exact: true }));
        expect(screen.queryByText(/Some selected formats/)).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("checkbox", { name: "Vespers" }));
        expect(screen.getByRole("button", { name: "Review booklet" })).toBeDisabled();
    });

    it("supports per-hymn overrides, format grouping, and resets overrides when applying a preset", async () => {
        const { container } = await openBuilder();
        const hymn = container.querySelector('.bookletHymnSelector') as HTMLElement;
        expect(hymn.querySelector('.bookletFormatChoices')).not.toBeInTheDocument();
        expect(within(hymn).getByRole("checkbox", { name: "Text words (Text)", exact: true })).toBeChecked();
        fireEvent.click(within(hymn).getByRole("checkbox", { name: "Notation (Hazzat)", exact: true }));
        fireEvent.change(screen.getByLabelText("Group content"), { target: { value: "format" } });
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        await screen.findByRole("link", { name: "Download PDF" });
        expect(generator).toHaveBeenLastCalledWith(expect.objectContaining({ formatKinds: ["text"], groupingKind: "format" }));
        fireEvent.click(screen.getByRole("button", { name: "Text + Hazzat" }));
        expect(within(hymn).getByRole("checkbox", { name: "Notation (Hazzat)", exact: true })).toBeChecked();
    });

    it("shows generation errors and permits retry", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        generator.mockRejectedValueOnce(new Error("Font load failed"));
        await openBuilder();
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        expect(await screen.findByText("The booklet could not be generated. Please try again.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Review booklet" })).toBeEnabled();
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        await screen.findByRole("link", { name: "Download PDF" });
    });

    it("lets a variation outside the preset add its format without selecting its sibling alternatives", async () => {
        const alternatives = JSON.parse(JSON.stringify(service)) as IServiceInfo;
        const notation = alternatives.hymns![0].formats![1];
        notation.variations!.push({ ...notation.variations![0], id: "second", name: "Long tune", displayName: "Long tune" });
        notation.variationCount = 2;
        jest.spyOn(HymnsDataProvider.prototype, "getServiceList").mockResolvedValue([alternatives]);
        const { container } = await openBuilder();
        fireEvent.click(screen.getByRole("button", { name: "Text Only" }));
        const hymn = container.querySelector('.bookletHymnSelector') as HTMLElement;
        const first = within(hymn).getByRole("checkbox", { name: "Notation (Hazzat)", exact: true });
        const second = within(hymn).getByRole("checkbox", { name: "Long tune (Hazzat)", exact: true });
        expect(first).not.toBeChecked();
        expect(second).not.toBeChecked();
        fireEvent.click(second);
        expect(first).not.toBeChecked();
        expect(second).toBeChecked();
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        await screen.findByRole("link", { name: "Download PDF" });
        const options = generator.mock.calls[0][0];
        expect(options.formatKinds).toEqual(["text", "regular"]);
        expect(options.services[0].hymns![0].formats![1].variations!.map(v => v.id)).toEqual(["second"]);
        fireEvent.click(second);
        expect(screen.queryByText(/Some selected formats/)).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Review booklet" })).toBeEnabled();
        fireEvent.click(within(hymn).getByRole("checkbox", { name: "Text words (Text)" }));
        expect(screen.getByRole("button", { name: "Review booklet" })).toBeDisabled();
        fireEvent.click(within(hymn).getByRole("checkbox", { name: "First hymn", exact: true }));
        expect(within(hymn).getByRole("checkbox", { name: "Text words (Text)" })).toBeChecked();
        expect(first).not.toBeChecked();
        expect(second).not.toBeChecked();
        fireEvent.click(screen.getByRole("button", { name: "All Formats" }));
        expect(first).toBeChecked();
        expect(second).toBeChecked();
        fireEvent.click(screen.getByRole("checkbox", { name: "Vespers", exact: true }));
        fireEvent.click(second);
        expect(second).toBeChecked();
        expect(first).not.toBeChecked();
        expect(within(hymn).getByRole("checkbox", { name: "Text words (Text)" })).not.toBeChecked();
    });

    it("locks selection during generation and releases an unfinished preview on unmount", async () => {
        let finish!: (bytes: Uint8Array) => void;
        generator.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
        const { unmount } = await openBuilder();
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        expect(screen.getByRole("button", { name: "Text Only" })).toBeDisabled();
        unmount();
        await act(async () => finish(new Uint8Array([1])));
        expect(revokeUrl).toHaveBeenCalledWith("blob:booklet-preview");
    });

    it("keeps formats and variation choices separate across services", () => {
        const other = { ...service, id: "matins", displayName: "Matins" };
        const selection = { services: {}, hymns: {}, variations: {}, formats: { "annual/vespers/first": ["text" as const] } };
        const selected = getSelectedBookletServices([service, other], selection, ["regular"]);
        expect(selected.map(s => s.hymns![0].formats!.map(f => f.id))).toEqual([["1"], ["2"]]);
        expect(getSelectedBookletServices([service], { ...selection, formats: { "annual/vespers/first": [] } }, ["regular"])).toEqual([]);
    });

    it("allows a musical-notes-only booklet from its preset", async () => {
        const withMusic = JSON.parse(JSON.stringify(service)) as IServiceInfo;
        withMusic.hymns![0].formats!.push({ id: "4", name: "Musical Notes", order: 4, variationCount: 1, variations: [{
            id: "score", name: "Score", displayName: "Score", content: { contentType: ContentType.MusicalNotesContent, musicXml: "<score-partwise />" }
        }] });
        jest.spyOn(HymnsDataProvider.prototype, "getServiceList").mockResolvedValue([withMusic]);
        const { container } = await openBuilder();
        fireEvent.click(screen.getByRole("button", { name: "Musical Notes", exact: true }));
        const global = container.querySelector('fieldset > .bookletFormatChoices') as HTMLElement;
        expect(within(global).getByRole("checkbox", { name: "Musical Notes", exact: true })).toBeChecked();
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        const link = await screen.findByRole("link", { name: "Download PDF" });
        expect(generator).toHaveBeenLastCalledWith(expect.objectContaining({ formatKinds: ["musical"] }));
        expect(link).toHaveAttribute("download", "annual-musical-notes-booklet-display.pdf");
    });

    it("hides season formats and presets that have no content, including individual hymn options", async () => {
        const { container } = await openBuilder();
        expect(screen.queryByRole("button", { name: "Vertical Hazzat", exact: true })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Text + Vertical Hazzat", exact: true })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Musical Notes", exact: true })).not.toBeInTheDocument();
        expect(screen.queryByRole("checkbox", { name: "Vertical Hazzat", exact: true })).not.toBeInTheDocument();
        expect(screen.queryByRole("checkbox", { name: "Musical Notes", exact: true })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Text Only" })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Text Only" }));
        fireEvent.click(screen.getByRole("button", { name: "All Formats" }));
        const global = container.querySelector('fieldset > .bookletFormatChoices') as HTMLElement;
        expect(within(global).getAllByRole("checkbox")).toHaveLength(2);
        within(global).getAllByRole("checkbox").forEach(input => expect(input).toBeChecked());
    });

    it("offers the six requested presets plus All Formats when every format is available", async () => {
        const all = JSON.parse(JSON.stringify(service)) as IServiceInfo;
        all.hymns![0].formats!.push(
            { id: "3", name: "Vertical Hazzat", order: 3, variationCount: 1, variations: [{ id: "vertical", name: "Standard", displayName: "Standard", content: { contentType: ContentType.VerticalHazzatContent, englishVerticalHazzat: "Lord", copticVerticalHazzat: "", arabicVerticalHazzat: "" } }] },
            { id: "4", name: "Musical Notes", order: 4, variationCount: 1, variations: [{ id: "score", name: "Score", displayName: "Score", content: { contentType: ContentType.MusicalNotesContent, musicXml: "<score-partwise />" } }] }
        );
        jest.spyOn(HymnsDataProvider.prototype, "getServiceList").mockResolvedValue([all]);
        const { container } = await openBuilder();
        const labels = ["Text Only", "Hazzat", "Vertical Hazzat", "Musical Notes", "Text + Hazzat", "Text + Vertical Hazzat", "All Formats"];
        const choices = [["Text"], ["Hazzat"], ["Vertical Hazzat"], ["Musical Notes"], ["Text", "Hazzat"], ["Text", "Vertical Hazzat"], ["Text", "Hazzat", "Vertical Hazzat", "Musical Notes"]];
        expect(Array.from(container.querySelectorAll('.bookletPresetRow > .bookletChoice')).map(button => button.textContent)).toEqual(labels);
        const global = container.querySelector('fieldset > .bookletFormatChoices') as HTMLElement;
        labels.forEach((label, i) => {
            fireEvent.click(screen.getByRole("button", { name: label, exact: true }));
            expect(within(global).getAllByRole("checkbox").filter(input => (input as HTMLInputElement).checked).map(input => input.parentElement!.textContent)).toEqual(choices[i]);
        });
    });

    it("starts with an available preset when the season only has musical notes", async () => {
        const onlyMusic = { ...service, hymns: [{ ...service.hymns![0], formats: [{ id: "4", name: "Musical Notes", order: 4, variationCount: 1, variations: [{ id: "score", name: "Score", displayName: "Score", content: { contentType: ContentType.MusicalNotesContent, musicXml: "<score-partwise />" } }] }] }] };
        jest.spyOn(HymnsDataProvider.prototype, "getServiceList").mockResolvedValue([onlyMusic]);
        await openBuilder();
        expect(screen.getByRole("button", { name: "Musical Notes", exact: true })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("status")).toHaveTextContent("Selection: Musical Notes");
        expect(screen.queryByRole("button", { name: "Text Only" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Review booklet" })).toBeEnabled();
    });

    it("highlights the matching preset and follows manual changes, empty selections and equivalent presets", async () => {
        const multiple = JSON.parse(JSON.stringify(service)) as IServiceInfo;
        multiple.hymns![0].formats![1].variations!.push({ ...multiple.hymns![0].formats![1].variations![0], id: "alternate", displayName: "Alternative" });
        jest.spyOn(HymnsDataProvider.prototype, "getServiceList").mockResolvedValue([multiple]);
        await openBuilder();
        expect(screen.getByRole("status")).toHaveTextContent("Selection: Text + Hazzat");
        expect(screen.getByRole("button", { name: "Text + Hazzat", exact: true })).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(screen.getByRole("checkbox", { name: "Notation (Hazzat)" }));
        expect(screen.getByRole("status")).toHaveTextContent("Custom selection");
        expect(screen.getByRole("status")).toHaveTextContent("Started with Text + Hazzat");
        expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
        fireEvent.click(screen.getByRole("checkbox", { name: "Alternative (Hazzat)" }));
        expect(screen.getByRole("button", { name: "Text Only", exact: true })).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(screen.getByRole("checkbox", { name: "Alternative (Hazzat)" }));
        expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
        fireEvent.click(screen.getByRole("checkbox", { name: "Notation (Hazzat)" }));
        expect(screen.getByRole("status")).toHaveTextContent("Selection: Text + Hazzat");
        expect(screen.getByRole("button", { name: "Text + Hazzat", exact: true })).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(screen.getByRole("checkbox", { name: "First hymn", exact: true }));
        expect(screen.getAllByRole("status")[0]).toHaveTextContent("Custom selection");
        expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
        fireEvent.click(screen.getByRole("button", { name: "Text + Hazzat", exact: true }));
        expect(screen.getByRole("checkbox", { name: "First hymn", exact: true })).toBeChecked();
        expect(screen.getByRole("status")).toHaveTextContent("Selection: Text + Hazzat");
        fireEvent.click(screen.getByRole("button", { name: "All Formats", exact: true }));
        expect(screen.getByRole("status")).toHaveTextContent("Selection: All Formats");
        expect(screen.getAllByRole("button", { pressed: true })).toEqual([screen.getByRole("button", { name: "All Formats", exact: true })]);
        fireEvent.click(screen.getByRole("checkbox", { name: "Notation (Hazzat)" }));
        expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
        fireEvent.click(screen.getByRole("checkbox", { name: "Notation (Hazzat)" }));
        expect(screen.getByRole("button", { name: "All Formats", exact: true })).toHaveAttribute("aria-pressed", "true");
    });

    it("keeps booklet colors independent, copies reader preferences explicitly and invalidates stale PDFs", async () => {
        const settings = { userSettings: { contentFontColor: "NAVY", hazzatFontColor: "MAROON", englishFontSize: "18px", arabicFontSize: "22px", contentLanguages: [...contentLanguages] },
            setContentFontColor: jest.fn(), setHazzatFontColor: jest.fn(), setContentFontSize: jest.fn(), setContentLanguages: jest.fn() };
        await openBuilder(settings);
        const advanced = screen.getByText("Advanced options · Appearance").closest("details")!;
        expect(advanced).not.toHaveAttribute("open");
        fireEvent.click(screen.getByText("Advanced options · Appearance"));
        const text = within(screen.getByRole("group", { name: "Text color", exact: true }));
        const notes = within(screen.getByRole("group", { name: "Hazzat color", exact: true }));
        expect(text.getByRole("radio", { name: "Navy" })).toBeChecked();
        fireEvent.click(text.getByRole("radio", { name: "Black" }));
        expect(notes.getByRole("radio", { name: "Maroon" })).toBeChecked();
        fireEvent.click(screen.getByRole("button", { name: "Use my website colors" }));
        expect(text.getByRole("radio", { name: "Navy" })).toBeChecked();
        expect(notes.getByRole("radio", { name: "Maroon" })).toBeChecked();
        expect(screen.getByRole("status")).toHaveTextContent("Selection: Text + Hazzat");
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        await screen.findByRole("link", { name: "Download PDF" });
        expect(generator).toHaveBeenLastCalledWith(expect.objectContaining({ appearance: { textColor: "NAVY", hazzatColor: "MAROON" } }));
        fireEvent.click(text.getByRole("radio", { name: "Black" }));
        expect(screen.queryByRole("link", { name: "Download PDF" })).not.toBeInTheDocument();
        expect(revokeUrl).toHaveBeenCalledWith("blob:booklet-preview");
        expect(notes.getByRole("radio", { name: "Maroon" })).toBeChecked();
        expect(settings.setContentFontColor).not.toHaveBeenCalled();
        expect(settings.setHazzatFontColor).not.toHaveBeenCalled();
        expect(settings.userSettings.contentFontColor).toBe("NAVY");
    });
});
