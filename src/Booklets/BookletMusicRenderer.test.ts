import { renderBookletMusic } from "./BookletMusicRenderer";

const mockLoad = jest.fn();
const mockClear = jest.fn();
jest.mock("opensheetmusicdisplay", () => ({ OpenSheetMusicDisplay: class {
    Zoom = 1;
    setCustomPageFormat() {}
    load(xml: string) { return mockLoad(xml); }
    clear() { mockClear(); }
} }));

it("rejects malformed XML and URLs before attempting score loading", async () => {
    await expect(renderBookletMusic("https://example.com/score.xml")).rejects.toThrow("Invalid booklet MusicXML");
    await expect(renderBookletMusic("<score-partwise>")).rejects.toThrow("Invalid booklet MusicXML");
    expect(mockLoad).not.toHaveBeenCalled();
});

it("cleans up its engraving surface when score loading fails", async () => {
    mockLoad.mockRejectedValueOnce(new Error("Unsupported score"));
    const count = document.body.children.length;
    await expect(renderBookletMusic("<score-partwise />")).rejects.toThrow("Unsupported score");
    expect(document.body.children.length).toBe(count);
    expect(mockClear).toHaveBeenCalledTimes(1);
});
