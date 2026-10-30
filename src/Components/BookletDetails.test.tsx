import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { generateSeasonBookletPdf } from "../Booklets/BookletPdfGenerator";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { ContentLanguage, ContentType } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { strings } from "../l8n";
import BookletDetails, { getMissingBookletFormats, getSelectedBookletServices } from "./BookletDetails";

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

async function openBuilder() {
    const result = render(<MemoryRouter initialEntries={["/Booklets/annual"]}><Routes>
        <Route path="/Booklets/:bookletId" element={<BookletDetails />} />
    </Routes></MemoryRouter>);
    await screen.findByRole("heading", { name: "Build your booklet" });
    return result;
}

describe("booklet builder", () => {
    beforeEach(() => {
        createUrl.mockReturnValue("blob:booklet-preview");
        strings.setLanguage("en");
        jest.spyOn(HymnsDataProvider.prototype, "getSeason").mockResolvedValue({ id: "annual", name: "Annual", displayName: "Annual", verse: "", displayVerse: "", order: 1, isDateSpecific: false });
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

    it("requires an explicit choice before omitting unavailable formats and disables empty booklets", async () => {
        const partial = { ...service, hymns: [...service.hymns!, { ...service.hymns![0], id: "second", name: "Second hymn", displayName: "Second hymn", formats: [service.hymns![0].formats![1]] }] };
        jest.spyOn(HymnsDataProvider.prototype, "getServiceList").mockResolvedValue([partial]);
        await openBuilder();
        fireEvent.click(screen.getByRole("button", { name: "Text + Hazzat" }));
        expect(screen.getByRole("button", { name: "Review booklet" })).toBeDisabled();
        expect(screen.getByRole("status")).toHaveTextContent("Second hymn: Text");
        fireEvent.click(screen.getByLabelText(/Include available content/));
        expect(screen.getByRole("button", { name: "Review booklet" })).toBeEnabled();
        fireEvent.click(screen.getByRole("button", { name: "Hazzat", exact: true }));
        expect(screen.queryByText(/Some selected formats/)).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("checkbox", { name: "Vespers" }));
        expect(screen.getByRole("button", { name: "Review booklet" })).toBeDisabled();
    });

    it("supports per-hymn overrides, format grouping, and resets overrides when applying a preset", async () => {
        const { container } = await openBuilder();
        const hymn = container.querySelector('.bookletHymnSelector') as HTMLElement;
        fireEvent.click(within(hymn).getByRole("checkbox", { name: "Hazzat", exact: true }));
        fireEvent.change(screen.getByLabelText("Group content"), { target: { value: "format" } });
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        await screen.findByRole("link", { name: "Download PDF" });
        expect(generator).toHaveBeenLastCalledWith(expect.objectContaining({ formatKinds: ["text"], groupingKind: "format" }));
        fireEvent.click(screen.getByRole("button", { name: "Text + Hazzat" }));
        expect(within(hymn).getByRole("checkbox", { name: "Hazzat", exact: true })).toBeChecked();
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
        expect(getMissingBookletFormats([service, other], selection, ["regular"])).toEqual([]);
        expect(getMissingBookletFormats([service], { ...selection, formats: { "annual/vespers/first": [] } }, ["regular"])).toHaveLength(1);
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
        expect(Array.from(container.querySelectorAll('.bookletChoice')).map(button => button.textContent)).toEqual(labels);
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
        expect(screen.queryByRole("button", { name: "Text Only" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Review booklet" })).toBeEnabled();
    });
});
