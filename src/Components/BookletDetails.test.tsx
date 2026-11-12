import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { StrictMode } from "react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
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
    const view = render(settings ? <UserSettingsContext.Provider value={settings}>{content}</UserSettingsContext.Provider> : content);
    await screen.findByRole("heading", { name: "Build your booklet" });
    return view;
}

describe("booklet builder", () => {
    it("starts with website languages and lets booklet overrides change availability without changing preferences", async () => {
        const settings = { userSettings: { contentFontColor: "NAVY", hazzatFontColor: "MAROON", englishFontSize: "18px", arabicFontSize: "22px", contentLanguages: [ContentLanguage.English] },
            setContentFontColor: jest.fn(), setHazzatFontColor: jest.fn(), setContentFontSize: jest.fn(), setContentLanguages: jest.fn() };
        await openBuilder(settings);
        const choices = within(screen.getByRole("group", { name: "Content languages" }));
        expect(choices.getByRole("checkbox", { name: "English" })).toBeChecked();
        expect(choices.getByRole("checkbox", { name: "Arabic" })).not.toBeChecked();
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        await screen.findByRole("link", { name: "Download PDF" });
        expect(generator).toHaveBeenLastCalledWith(expect.objectContaining({ languages: [ContentLanguage.English], appearance: { textColor: "NAVY", hazzatColor: "MAROON" } }));
        fireEvent.click(choices.getByRole("checkbox", { name: "English" }));
        expect(screen.queryByRole("link", { name: "Download PDF" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Text Only" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Review booklet" })).toBeDisabled();
        fireEvent.click(screen.getByRole("button", { name: "Reset all languages to website settings" }));
        expect(screen.getByRole("button", { name: "Text Only" })).toBeInTheDocument();
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

    describe("successful generation analytics", () => {
        const analytics = jest.fn();
        let originalGtag: typeof window.gtag;

        beforeEach(() => {
            originalGtag = window.gtag;
            window.gtag = analytics;
        });
        afterEach(() => { window.gtag = originalGtag; });

        it("counts one completed generation, not the initial or repeated clicks while pending", async () => {
            let finish!: (bytes: Uint8Array) => void;
            generator.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
            await openBuilder();
            const review = screen.getByRole("button", { name: "Review booklet" });
            // Batch native clicks so the guard is exercised before React disables the fieldset.
            act(() => {
                review.click();
                review.click();
            });
            expect(generator).toHaveBeenCalledTimes(1);
            expect(analytics).not.toHaveBeenCalled();
            const pending = screen.getByRole("button", { name: strings.generatingBooklet });
            expect(pending).toBeDisabled();
            fireEvent.click(pending);
            expect(generator).toHaveBeenCalledTimes(1);
            expect(analytics).not.toHaveBeenCalled();

            await act(async () => finish(new Uint8Array([37, 80, 68, 70])));
            expect(screen.getByRole("link", { name: "Download PDF" })).toHaveAttribute("href", "blob:booklet-preview");
            expect(analytics.mock.calls).toEqual([["event", "booklet_generated", {
                event_category: "Engagement", event_label: "Booklet Generated"
            }]]);
        });

        it("does not recount rerenders, preview opens or downloads, but counts a later regeneration", async () => {
            const content = () => <StrictMode><MemoryRouter initialEntries={["/Booklets/annual"]}><Routes>
                <Route path="/Booklets/:bookletId" element={<BookletDetails />} />
            </Routes></MemoryRouter></StrictMode>;
            const view = render(content());
            await screen.findByRole("heading", { name: "Build your booklet" });
            fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
            await screen.findByRole("link", { name: "Download PDF" });
            expect(analytics).toHaveBeenCalledTimes(1);

            view.rerender(content());
            for (const name of [strings.bookletOpenPdf, strings.bookletDownloadPdf]) {
                const link = screen.getByRole("link", { name });
                link.addEventListener("click", event => event.preventDefault(), { once: true });
                fireEvent.click(link);
            }
            expect(generator).toHaveBeenCalledTimes(1);
            expect(analytics).toHaveBeenCalledTimes(1);

            fireEvent.change(screen.getByLabelText("PDF layout"), { target: { value: "print" } });
            fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
            await screen.findByRole("link", { name: "Download PDF" });
            expect(generator).toHaveBeenCalledTimes(2);
            expect(analytics).toHaveBeenCalledTimes(2);
        });

        it("does not count failures and counts a successful retry once", async () => {
            jest.spyOn(console, "error").mockImplementation(() => {});
            generator.mockRejectedValueOnce(new Error("Font load failed"));
            await openBuilder();
            fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
            await screen.findByRole("alert");
            expect(analytics).not.toHaveBeenCalled();
            expect(screen.queryByRole("link", { name: "Download PDF" })).not.toBeInTheDocument();

            fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
            await screen.findByRole("link", { name: "Download PDF" });
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
            expect(analytics).toHaveBeenCalledTimes(1);
        });

        it("does not count a PDF that cannot be made available for preview or download", async () => {
            jest.spyOn(console, "error").mockImplementation(() => {});
            createUrl.mockImplementationOnce(() => { throw new Error("Object URL creation failed"); });
            await openBuilder();
            fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
            await screen.findByRole("alert");
            expect(analytics).not.toHaveBeenCalled();
            expect(screen.queryByRole("link", { name: "Download PDF" })).not.toBeInTheDocument();
        });

        it.each(["hymns", "languages", "formats"])("does not generate or count an empty %s selection", async emptySelection => {
            await openBuilder();
            if (emptySelection === "hymns") {
                fireEvent.click(screen.getByRole("checkbox", { name: "Vespers" }));
            } else {
                const group = screen.getByRole("group", { name: emptySelection === "languages" ? "Content languages" : strings.bookletCustomizeFormats });
                within(group).getAllByRole("checkbox", { checked: true }).forEach(input => fireEvent.click(input));
            }
            const review = screen.getByRole("button", { name: "Review booklet" });
            expect(review).toBeDisabled();
            fireEvent.click(review);
            expect(generator).not.toHaveBeenCalled();
            expect(analytics).not.toHaveBeenCalled();
        });

        it("does not count results discarded after unmount", async () => {
            let finish!: (bytes: Uint8Array) => void;
            generator.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
            const { unmount } = await openBuilder();
            fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
            unmount();
            await act(async () => finish(new Uint8Array([37, 80, 68, 70])));
            expect(revokeUrl).toHaveBeenCalledWith("blob:booklet-preview");
            expect(analytics).not.toHaveBeenCalled();
        });

        it("discards a previous route's result without counting it or unlocking the new generation", async () => {
            let finishPrevious!: (bytes: Uint8Array) => void;
            let finishCurrent!: (bytes: Uint8Array) => void;
            generator.mockImplementationOnce(() => new Promise(resolve => { finishPrevious = resolve; }))
                .mockImplementationOnce(() => new Promise(resolve => { finishCurrent = resolve; }));
            render(<MemoryRouter initialEntries={["/Booklets/annual"]}>
                <Link to="/Booklets/lent">Switch season</Link>
                <Routes><Route path="/Booklets/:bookletId" element={<BookletDetails />} /></Routes>
            </MemoryRouter>);
            await screen.findByRole("heading", { name: "Build your booklet" });
            fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
            fireEvent.click(screen.getByRole("link", { name: "Switch season" }));
            await screen.findByRole("heading", { name: "Build your booklet" });
            fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
            expect(generator).toHaveBeenCalledTimes(2);

            await act(async () => finishPrevious(new Uint8Array([37, 80, 68, 70])));
            expect(revokeUrl).toHaveBeenCalledWith("blob:booklet-preview");
            expect(analytics).not.toHaveBeenCalled();
            expect(screen.queryByRole("link", { name: "Download PDF" })).not.toBeInTheDocument();
            const pending = screen.getByRole("button", { name: strings.generatingBooklet });
            expect(pending).toBeDisabled();
            fireEvent.click(pending);
            expect(generator).toHaveBeenCalledTimes(2);

            createUrl.mockReturnValueOnce("blob:current-booklet");
            await act(async () => finishCurrent(new Uint8Array([37, 80, 68, 70])));
            expect(screen.getByRole("link", { name: "Download PDF" })).toHaveAttribute("href", "blob:current-booklet");
            expect(analytics).toHaveBeenCalledTimes(1);
        });

        it.each(["missing", "throwing", "non-callable"])("keeps generation and download working with %s analytics", async analyticsState => {
            if (analyticsState === "missing") delete window.gtag;
            else if (analyticsState === "non-callable") window.gtag = {};
            else analytics.mockImplementation(() => { throw new Error("Analytics blocked"); });
            await openBuilder();
            fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
            const download = await screen.findByRole("link", { name: "Download PDF" });
            expect(download).toHaveAttribute("href", "blob:booklet-preview");
            expect(download).toHaveAttribute("download", "annual-text-hazzat-booklet-display.pdf");
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Review booklet" })).toBeEnabled();
            download.addEventListener("click", event => event.preventDefault(), { once: true });
            fireEvent.click(download);
            expect(generator).toHaveBeenCalledTimes(1);
        });
    });

    it("provides five sections and independent languages in selection, review and PDF without changing website settings", async () => {
        const multilingual = JSON.parse(JSON.stringify(service)) as IServiceInfo;
        multilingual.hymns![0].formats![1].variations![0].content = { contentType: ContentType.HazzatContent,
            englishHazzat: "English notes", copticHazzat: "Coptic notes", arabicHazzat: "" };
        jest.spyOn(HymnsDataProvider.prototype, "getServiceList").mockResolvedValue([multilingual]);
        await openBuilder();
        expect(screen.getAllByRole("heading", { level: 3 }).map(h => h.textContent)).toEqual([
            "1. Choose formats", "2. Choose languages", "3. Choose hymns", "4. Arrange your booklet", "5. Review and download"
        ]);
        const languageSection = screen.getByRole("region", { name: "2. Choose languages" });
        expect(within(languageSection).getByRole("button", { name: "Reset all languages to website settings" })).toBeEnabled();
        const shared = within(screen.getByRole("group", { name: "Content languages" }));
        fireEvent.click(shared.getByRole("checkbox", { name: "Arabic" }));
        fireEvent.click(screen.getByLabelText("Choose Hazzat languages separately"));
        const notes = within(screen.getByRole("group", { name: "Hazzat languages" }));
        expect(notes.getByLabelText("English")).toBeChecked();
        expect(notes.getByLabelText("Coptic")).toBeChecked();
        expect(notes.getByLabelText("Arabic")).not.toBeChecked();
        fireEvent.click(notes.getByLabelText("English"));
        const review = within(screen.getByRole("region", { name: "5. Review and download" }));
        expect(review.getAllByRole("term").map(term => term.textContent)).toEqual(["Text", "Hazzat"]);
        expect(review.getAllByRole("definition").map(definition => definition.textContent)).toEqual(["English, Coptic", "Coptic"]);
        expect(screen.queryByText(/Unavailable content will be omitted/)).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        await screen.findByRole("link", { name: "Download PDF" });
        const options = generator.mock.calls[0][0];
        expect(options.languages).toEqual([ContentLanguage.English, ContentLanguage.Coptic]);
        expect(options.hazzatLanguages).toEqual([ContentLanguage.Coptic]);
        expect(options.services[0].hymns![0].formats![1].variations![0].content).toEqual(expect.objectContaining({ englishHazzat: "", copticHazzat: "Coptic notes" }));
        fireEvent.click(notes.getByLabelText("Coptic"));
        expect(screen.queryByRole("link", { name: "Download PDF" })).not.toBeInTheDocument();
        expect(screen.getByRole("checkbox", { name: "Notation (Hazzat)" })).toBeDisabled();
        expect(screen.getByRole("checkbox", { name: "Text words (Text)" })).toBeEnabled();
        fireEvent.click(notes.getByLabelText("Coptic"));
        expect(screen.getByRole("checkbox", { name: "Notation (Hazzat)" })).toBeChecked();
        const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
        fireEvent.click(screen.getByLabelText("Choose Hazzat languages separately"));
        expect(screen.getByRole("group", { name: "Hazzat languages" })).toBeInTheDocument();
        confirm.mockReturnValue(true);
        fireEvent.click(screen.getByLabelText("Choose Hazzat languages separately"));
        expect(screen.queryByRole("group", { name: "Hazzat languages" })).not.toBeInTheDocument();
    });

    it.each([false, true])("copies website languages to the booklet without changing separate mode or saved preferences (separate: %s)", async separate => {
        const settings = { userSettings: { contentFontColor: "NAVY", hazzatFontColor: "MAROON", englishFontSize: "18px", arabicFontSize: "22px", contentLanguages: [ContentLanguage.English] },
            setContentFontColor: jest.fn(), setHazzatFontColor: jest.fn(), setContentFontSize: jest.fn(), setContentLanguages: jest.fn() };
        await openBuilder(settings);
        fireEvent.click(within(screen.getByRole("group", { name: "Content languages" })).getByLabelText("Coptic"));
        if (separate) {
            fireEvent.click(screen.getByLabelText("Choose Hazzat languages separately"));
            fireEvent.click(within(screen.getByRole("group", { name: "Hazzat languages" })).getByLabelText("English"));
        }
        fireEvent.click(screen.getByRole("button", { name: "Reset all languages to website settings" }));
        const groups = separate ? ["Text languages", "Hazzat languages"] : ["Content languages"];
        groups.forEach(name => {
            const choices = within(screen.getByRole("group", { name }));
            expect(choices.getByLabelText("English")).toBeChecked();
            expect(choices.getByLabelText("Coptic")).not.toBeChecked();
            expect(choices.getByLabelText("Arabic")).not.toBeChecked();
        });
        expect((screen.getByLabelText("Choose Hazzat languages separately") as HTMLInputElement).checked).toBe(separate);
        expect(settings.setContentLanguages).not.toHaveBeenCalled();
        expect(settings.userSettings.contentLanguages).toEqual([ContentLanguage.English]);
    });

    it("warns before resetting hymn choices and preserves excluded hymns across presets", async () => {
        await openBuilder();
        fireEvent.click(screen.getByRole("checkbox", { name: "First hymn" }));
        fireEvent.click(screen.getByRole("button", { name: "Text Only" }));
        expect(screen.getByRole("checkbox", { name: "First hymn" })).not.toBeChecked();
        const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
        fireEvent.click(screen.getByRole("button", { name: strings.resetBookletSelection }));
        expect(screen.getByRole("checkbox", { name: "First hymn" })).not.toBeChecked();
        confirm.mockReturnValue(true);
        fireEvent.click(screen.getByRole("button", { name: strings.resetBookletSelection }));
        expect(screen.getByRole("checkbox", { name: "First hymn" })).toBeChecked();
    });

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
        fireEvent.click(screen.getByRole("button", { name: "Hazzat" }));
        expect(screen.queryByText(/Some selected formats/)).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("checkbox", { name: "Vespers" }));
        expect(screen.getByRole("button", { name: "Review booklet" })).toBeDisabled();
    });

    it("supports per-hymn overrides and preserves excluded variations when applying a preset", async () => {
        await openBuilder();
        const hymn = screen.getByRole("group", { name: "First hymn" });
        expect(within(hymn).queryByRole("group", { name: strings.bookletCustomizeFormats })).not.toBeInTheDocument();
        expect(within(hymn).getByRole("checkbox", { name: "Text words (Text)" })).toBeChecked();
        fireEvent.click(within(hymn).getByRole("checkbox", { name: "Notation (Hazzat)" }));
        fireEvent.change(screen.getByLabelText("Group content"), { target: { value: "format" } });
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        await screen.findByRole("link", { name: "Download PDF" });
        expect(generator).toHaveBeenLastCalledWith(expect.objectContaining({ formatKinds: ["text"], groupingKind: "format" }));
        fireEvent.click(screen.getByRole("button", { name: "Text + Hazzat" }));
        expect(within(hymn).getByRole("checkbox", { name: "Notation (Hazzat)" })).not.toBeChecked();
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
        await openBuilder();
        fireEvent.click(screen.getByRole("button", { name: "Text Only" }));
        const hymn = screen.getByRole("group", { name: "First hymn" });
        const first = within(hymn).getByRole("checkbox", { name: "Notation (Hazzat)" });
        const second = within(hymn).getByRole("checkbox", { name: "Long tune (Hazzat)" });
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
        fireEvent.click(within(hymn).getByRole("checkbox", { name: "First hymn" }));
        expect(within(hymn).getByRole("checkbox", { name: "Text words (Text)" })).toBeChecked();
        expect(first).not.toBeChecked();
        expect(second).not.toBeChecked();
        fireEvent.click(screen.getByRole("button", { name: "All Formats" }));
        expect(first).toBeChecked();
        expect(second).toBeChecked();
        fireEvent.click(screen.getByRole("checkbox", { name: "Vespers" }));
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
        await openBuilder();
        fireEvent.click(screen.getByRole("button", { name: "Musical Notes" }));
        const global = screen.getByRole("group", { name: strings.bookletCustomizeFormats });
        expect(within(global).getByRole("checkbox", { name: "Musical Notes" })).toBeChecked();
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        const link = await screen.findByRole("link", { name: "Download PDF" });
        expect(generator).toHaveBeenLastCalledWith(expect.objectContaining({ formatKinds: ["musical"] }));
        expect(link).toHaveAttribute("download", "annual-musical-notes-booklet-display.pdf");
    });

    it("hides season formats and presets that have no content, including individual hymn options", async () => {
        await openBuilder();
        expect(screen.queryByRole("button", { name: "Vertical Hazzat" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Text + Vertical Hazzat" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Musical Notes" })).not.toBeInTheDocument();
        expect(screen.queryByRole("checkbox", { name: "Vertical Hazzat" })).not.toBeInTheDocument();
        expect(screen.queryByRole("checkbox", { name: "Musical Notes" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Text Only" })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Text Only" }));
        fireEvent.click(screen.getByRole("button", { name: "All Formats" }));
        const global = screen.getByRole("group", { name: strings.bookletCustomizeFormats });
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
        await openBuilder();
        const labels = ["Text Only", "Hazzat", "Vertical Hazzat", "Musical Notes", "Text + Hazzat", "Text + Vertical Hazzat", "All Formats"];
        const choices = [["Text"], ["Hazzat"], ["Vertical Hazzat"], ["Musical Notes"], ["Text", "Hazzat"], ["Text", "Vertical Hazzat"], ["Text", "Hazzat", "Vertical Hazzat", "Musical Notes"]];
        expect(within(screen.getByRole("region", { name: "1. Choose formats" })).getAllByRole("button").map(button => button.textContent)).toEqual(labels);
        const global = screen.getByRole("group", { name: strings.bookletCustomizeFormats });
        labels.forEach((label, i) => {
            fireEvent.click(screen.getByRole("button", { name: label }));
            expect(within(global).getAllByRole("checkbox", { checked: true })).toEqual(choices[i].map(name => within(global).getByRole("checkbox", { name })));
        });
    });

    it("starts with an available preset when the season only has musical notes", async () => {
        const onlyMusic = { ...service, hymns: [{ ...service.hymns![0], formats: [{ id: "4", name: "Musical Notes", order: 4, variationCount: 1, variations: [{ id: "score", name: "Score", displayName: "Score", content: { contentType: ContentType.MusicalNotesContent, musicXml: "<score-partwise />" } }] }] }] };
        jest.spyOn(HymnsDataProvider.prototype, "getServiceList").mockResolvedValue([onlyMusic]);
        await openBuilder();
        expect(screen.getByRole("button", { name: "Musical Notes" })).toHaveAttribute("aria-pressed", "true");
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
        expect(screen.getByRole("button", { name: "Text + Hazzat" })).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(screen.getByRole("checkbox", { name: "Notation (Hazzat)" }));
        expect(screen.getByRole("status")).toHaveTextContent("Custom selection");
        expect(screen.getByRole("status")).toHaveTextContent("Started with Text + Hazzat");
        expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
        fireEvent.click(screen.getByRole("checkbox", { name: "Alternative (Hazzat)" }));
        expect(screen.getByRole("button", { name: "Text Only" })).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(screen.getByRole("checkbox", { name: "Alternative (Hazzat)" }));
        expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
        fireEvent.click(screen.getByRole("checkbox", { name: "Notation (Hazzat)" }));
        expect(screen.getByRole("status")).toHaveTextContent("Selection: Text + Hazzat");
        expect(screen.getByRole("button", { name: "Text + Hazzat" })).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(screen.getByRole("checkbox", { name: "First hymn" }));
        expect(screen.getAllByRole("status")[0]).toHaveTextContent("Custom selection");
        expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
        fireEvent.click(screen.getByRole("button", { name: "Text + Hazzat" }));
        expect(screen.getByRole("checkbox", { name: "First hymn" })).not.toBeChecked();
        fireEvent.click(screen.getByRole("checkbox", { name: "First hymn" }));
        expect(screen.getByRole("status")).toHaveTextContent("Selection: Text + Hazzat");
        fireEvent.click(screen.getByRole("button", { name: "All Formats" }));
        expect(screen.getByRole("status")).toHaveTextContent("Selection: All Formats");
        expect(screen.getAllByRole("button", { pressed: true })).toEqual([screen.getByRole("button", { name: "All Formats" })]);
        fireEvent.click(screen.getByRole("checkbox", { name: "Notation (Hazzat)" }));
        expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
        fireEvent.click(screen.getByRole("checkbox", { name: "Notation (Hazzat)" }));
        expect(screen.getByRole("button", { name: "All Formats" })).toHaveAttribute("aria-pressed", "true");
    });

    it("keeps booklet colors independent, copies reader preferences explicitly and invalidates stale PDFs", async () => {
        const settings = { userSettings: { contentFontColor: "NAVY", hazzatFontColor: "MAROON", englishFontSize: "18px", arabicFontSize: "22px", contentLanguages: [...contentLanguages] },
            setContentFontColor: jest.fn(), setHazzatFontColor: jest.fn(), setContentFontSize: jest.fn(), setContentLanguages: jest.fn() };
        await openBuilder(settings);
        const advanced = screen.getByRole("group", { name: "Advanced options · Appearance" });
        expect(advanced).not.toHaveAttribute("open");
        fireEvent.click(screen.getByText("Advanced options · Appearance"));
        const text = within(screen.getByRole("group", { name: "Text color" }));
        const notes = within(screen.getByRole("group", { name: "Hazzat color" }));
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
    it("applies custom format checkboxes to the generated PDF and invalidates earlier previews", async () => {
        await openBuilder();
        fireEvent.click(screen.getByText("Customize formats"));
        const text = screen.getByRole("checkbox", { name: "Text" });
        const hazzat = screen.getByRole("checkbox", { name: "Hazzat" });
        expect(text).toBeChecked();
        expect(hazzat).toBeChecked();
        fireEvent.click(hazzat);
        expect(hazzat).not.toBeChecked();
        expect(screen.getByRole("status")).toHaveTextContent("Selection: Text Only");
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        await screen.findByRole("link", { name: "Download PDF" });
        expect(generator).toHaveBeenLastCalledWith(expect.objectContaining({ formatKinds: ["text"] }));
        fireEvent.click(hazzat);
        expect(hazzat).toBeChecked();
        expect(screen.queryByRole("link", { name: "Download PDF" })).not.toBeInTheDocument();
        fireEvent.click(text);
        expect(text).not.toBeChecked();
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        await screen.findByRole("link", { name: "Download PDF" });
        expect(generator).toHaveBeenLastCalledWith(expect.objectContaining({ formatKinds: ["regular"] }));
    });

    it("orders service choices and generated booklet services by their metadata", async () => {
        const later = { ...service, id: "later", name: "Later service", displayName: "Later service", order: 20 };
        const earlier = { ...service, id: "earlier", name: "Earlier service", displayName: "Earlier service", order: 2 };
        const response = [later, earlier];
        jest.spyOn(HymnsDataProvider.prototype, "getServiceList").mockResolvedValue(response);
        await openBuilder();
        const choices = screen.getAllByRole("checkbox", { name: /^(Earlier|Later) service$/ });
        expect(choices).toEqual([
            screen.getByRole("checkbox", { name: "Earlier service" }),
            screen.getByRole("checkbox", { name: "Later service" })
        ]);
        fireEvent.click(screen.getByRole("button", { name: "Review booklet" }));
        await screen.findByRole("link", { name: "Download PDF" });
        expect(generator.mock.calls[0][0].services.map(item => item.id)).toEqual(["earlier", "later"]);
        expect(response.map(item => item.id)).toEqual(["later", "earlier"]);
    });

});
