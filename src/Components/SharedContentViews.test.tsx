import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { ContentType } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import BookletDetails, { BookletSelectionState, getSelectableVariations, getSelectedBookletServices, variationKey } from "./BookletDetails";
import ContentText from "./ContentText";
import HymnContentFromService from "./HymnContentFromService";
import ServiceContents from "./ServiceContents";
import YouTube from "./YoutubeVideo";

jest.mock("axios", () => ({ create: jest.fn() }));

const season: ISeasonInfo = { id: "annual", name: "Annual", displayName: "Annual", order: 1, isDateSpecific: false };
const hazzat = (id: string, text: string) => ({ id, name: "Standard", displayName: "Standard", content: { contentType: ContentType.HazzatContent, englishHazzat: text, copticHazzat: "", arabicHazzat: "" } });
const service: IServiceInfo = { id: "basil", name: "Basil", displayName: "Basil", seasonId: "annual", order: 1, verse: "", isDateSpecific: false,
    hymns: [
        { id: "later", name: "Contextual later title", displayName: "Contextual later title", order: 2, formats: [
            { id: "2", name: "Hazzat", order: 2, variationCount: 2, variations: [hazzat("shared-b", "later first"), hazzat("shared-a", "later second")] },
            { id: "3", name: "Vertical Hazzat", order: 3, variationCount: 1, variations: [{ id: "vertical", name: "Standard", displayName: "Standard", content: { contentType: ContentType.VerticalHazzatContent, englishVerticalHazzat: "vertical", copticVerticalHazzat: "", arabicVerticalHazzat: "" } }] }
        ] },
        { id: "earlier", name: "Earlier", displayName: "Earlier", order: 1, formats: [
            { id: "2", name: "Hazzat", order: 2, variationCount: 1, variations: [hazzat("shared-a", "earlier content")] }
        ] }
    ] };

describe("shared content reader views", () => {
    afterEach(() => jest.restoreAllMocks());
    const reader = (path: string) => render(<MemoryRouter initialEntries={[path]}>
        <Routes>
            <Route path="/seasons/:seasonId/services/:serviceId/formats/:formatId" element={<HymnContentFromService seasonInfo={season} />} />
            <Route path="/seasons/:seasonId/services/:serviceId/hymns/:hymnId/formats/:formatId" element={<HymnContentFromService seasonInfo={season} />} />
        </Routes>
    </MemoryRouter>);

    it("shows every service hymn and variation in their configured orders", async () => {
        jest.spyOn(HymnsDataProvider.prototype, "getService").mockResolvedValue(service);
        const { container } = reader("/seasons/annual/services/basil/formats/2");
        await screen.findByText("later second");
        const text = container.textContent!;
        expect(text.indexOf("Earlier")).toBeLessThan(text.indexOf("Contextual later title"));
        expect(text.indexOf("earlier content")).toBeLessThan(text.indexOf("later first"));
        expect(text.indexOf("later first")).toBeLessThan(text.indexOf("later second"));
    });

    it("shows all alternatives for the selected hymn and retains the hymn's contextual title", async () => {
        jest.spyOn(HymnsDataProvider.prototype, "getService").mockResolvedValue(service);
        reader("/seasons/annual/services/basil/hymns/later/formats/2");
        await screen.findByText("later first");
        expect(screen.getByText("later second")).toBeInTheDocument();
        expect(screen.queryByText("earlier content")).not.toBeInTheDocument();
        expect(document.title).toContain("Contextual later title");
    });

    it("retains the hymn and service dropdown links", async () => {
        jest.spyOn(HymnsDataProvider.prototype, "getService").mockResolvedValue(service);
        const { container } = render(<MemoryRouter><ServiceContents seasonId="annual" serviceId="basil" serviceName="Basil" /></MemoryRouter>);
        await screen.findByText("Contextual later title");
        expect(container.querySelector('a[href="/seasons/annual/services/basil/formats/2"]')).toBeInTheDocument();
        expect(container.querySelector('a[href="/seasons/annual/services/basil/hymns/later/formats/2"]')).toBeInTheDocument();
        expect(container.querySelectorAll('.contentLinksDiv svg[data-icon="chevron-down"]')).toHaveLength(3);
    });

    it("reports a missing dependency and retries instead of leaving a spinner", async () => {
        jest.spyOn(HymnsDataProvider.prototype, "getService").mockRejectedValueOnce(new Error("Missing asset")).mockResolvedValueOnce(service);
        reader("/seasons/annual/services/basil/formats/2");
        await screen.findByRole("alert");
        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        await screen.findByText("later second");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("ignores a stale service response after navigating to another service", async () => {
        let oldResponse!: (value: IServiceInfo) => void;
        jest.spyOn(HymnsDataProvider.prototype, "getService")
            .mockImplementationOnce(() => new Promise(resolve => { oldResponse = resolve; }))
            .mockResolvedValueOnce({ ...service, id: "new", name: "New service", displayName: "New service" });
        const { rerender } = render(<MemoryRouter><ServiceContents seasonId="annual" serviceId="old" serviceName="Old service" /></MemoryRouter>);
        rerender(<MemoryRouter><ServiceContents seasonId="annual" serviceId="new" serviceName="New service" /></MemoryRouter>);
        await screen.findByText("Contextual later title");
        oldResponse({ ...service, hymns: [] });
        await waitFor(() => expect(screen.getByText("Contextual later title")).toBeInTheDocument());
    });

    it("keeps Text alternatives separate and handles blank paragraphs", () => {
        const variation = (id: string, text: string): any => ({ id, name: id, displayName: id, content: { paragraphs: [
            { columns: [] }, { columns: [{ language: "English", content: "   " }] },
            { columns: [{ language: "English", content: text }] }
        ] } });
        render(<ContentText variations={[variation("a", "First only"), variation("b", "Second only")]} />);
        expect(screen.getAllByText("First only")).toHaveLength(1);
        expect(screen.getAllByText("Second only")).toHaveLength(1);
    });

    it("keeps same-named PDF choices independent across formats, hymns, and services", () => {
        const hymn = service.hymns![0];
        const variants = getSelectableVariations(hymn);
        expect(variants).toHaveLength(3);
        expect(new Set(variants.map(v => variationKey(service, hymn, v))).size).toBe(3);
        const selection: BookletSelectionState = { services: {}, hymns: {}, variations: { [variationKey(service, hymn, variants[1])]: false } };
        const selected = getSelectedBookletServices([service], selection);
        expect(selected[0].hymns![0].formats![0].variations?.map(v => v.id)).toEqual(["shared-b"]);
        expect(selected[0].hymns![0].formats![1].variations?.map(v => v.id)).toEqual(["vertical"]);
        expect(selected[0].hymns![1].formats![0].variations?.map(v => v.id)).toEqual(["shared-a"]);
        expect(variationKey({ ...service, id: "other" }, hymn, variants[1])).not.toBe(variationKey(service, hymn, variants[1]));
        expect(variationKey({ ...service, seasonId: "kiahk" }, hymn, variants[1])).not.toBe(variationKey(service, hymn, variants[1]));
    });

    it("renders multiple YouTube alternatives independently", () => {
        render(<><YouTube videoId="first" /><YouTube videoId="second" /></>);
        const frames = screen.getAllByTitle("YouTube video");
        expect(frames).toHaveLength(2);
        expect(frames[0]).toHaveAttribute("src", "https://www.youtube.com/embed/first?autoplay=0");
        expect(frames[1]).toHaveAttribute("src", "https://www.youtube.com/embed/second?autoplay=0");
        frames.forEach(frame => expect(frame).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin"));
    });

    it("blocks incomplete PDFs and lets the user retry the entire booklet load", async () => {
        jest.spyOn(HymnsDataProvider.prototype, "getSeason").mockResolvedValue(season);
        jest.spyOn(HymnsDataProvider.prototype, "getServiceList").mockRejectedValueOnce(new Error("Missing service"))
            .mockResolvedValueOnce([service]);
        render(<MemoryRouter initialEntries={["/Booklets/annual"]}><Routes>
            <Route path="/Booklets/:bookletId" element={<BookletDetails />} />
        </Routes></MemoryRouter>);
        await screen.findByRole("alert");
        expect(screen.queryByRole("button", { name: "For Devices" })).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        await screen.findByText("Booklet Content");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
});
