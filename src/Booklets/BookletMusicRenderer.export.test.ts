import { renderBookletMusic } from "./BookletMusicRenderer";

const mockLoad = jest.fn();
const mockClear = jest.fn();
const mockFormat = jest.fn();
const mockRender = jest.fn();
const mockConstruct = jest.fn();
let mockPages: Array<[number, number]>;
jest.mock("opensheetmusicdisplay", () => ({ OpenSheetMusicDisplay: class {
    Zoom = 0;
    container: HTMLElement;
    constructor(container: HTMLElement, options: unknown) { this.container = container; mockConstruct(options); }
    setCustomPageFormat(...args: number[]) { mockFormat(...args); }
    load(xml: string) { return mockLoad(xml); }
    render() {
        mockRender();
        mockPages.forEach(([width, height]) => {
            const svg = global.document.createElementNS("http://www.w3.org/2000/svg", "svg");
            Object.defineProperties(svg, { width: { value: { baseVal: { value: width } } }, height: { value: { baseVal: { value: height } } } });
            this.container.appendChild(svg);
        });
    }
    clear() { mockClear(); }
} }));

const originalImage = window.Image;
const originalCreate = URL.createObjectURL;
const originalRevoke = URL.revokeObjectURL;
let imageFails: boolean;
let context: { fillStyle: string; fillRect: jest.Mock; drawImage: jest.Mock };
let serialized: string[];

beforeEach(() => {
    jest.clearAllMocks();
    mockPages = [[100.25, 200.25], [80, 120]];
    imageFails = false;
    context = { fillStyle: "", fillRect: jest.fn(), drawImage: jest.fn() };
    serialized = [];
    const serialize = XMLSerializer.prototype.serializeToString;
    jest.spyOn(XMLSerializer.prototype, "serializeToString").mockImplementation(function (this: XMLSerializer, node) {
        const result = serialize.call(this, node); serialized.push(result); return result;
    });
    URL.createObjectURL = jest.fn().mockReturnValue("blob:score-page");
    URL.revokeObjectURL = jest.fn();
    window.Image = class {
        onload?: () => void;
        onerror?: () => void;
        set src(value: string) { Promise.resolve().then(() => imageFails ? this.onerror?.() : this.onload?.()); }
    } as unknown as typeof Image;
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
    jest.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(callback => callback({ arrayBuffer: async () => new Uint8Array([137, 80, 78, 71]).buffer } as Blob));
});
afterEach(() => {
    jest.restoreAllMocks();
    window.Image = originalImage;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
});

it("exports every complete score page at double resolution with black ink and a white background", async () => {
    const childCount = document.body.children.length;
    // This renderer returns score-page data, not a Testing Library render result.
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const pages = await renderBookletMusic("<score-timewise />");
    expect(pages).toEqual(mockPages.map(([width, height]) => ({ width, height, pngBytes: new Uint8Array([137, 80, 78, 71]) })));
    expect(mockLoad).toHaveBeenCalledWith("<score-timewise />");
    expect(mockFormat).toHaveBeenCalledWith(324, 440);
    expect(mockConstruct).toHaveBeenCalledWith(expect.objectContaining({ autoResize: false, backend: "svg", pageBackgroundColor: "#FFFFFF" }));
    expect(serialized[0]).toContain('viewBox="0 0 100.25 200.25"');
    expect(serialized[0]).toContain('width="200.5"');
    expect(serialized[0]).toContain('height="400.5"');
    expect(serialized[0]).toContain('color: rgb(0, 0, 0)');
    expect(context.fillStyle).toBe("#FFFFFF");
    expect(context.fillRect.mock.calls).toEqual([[0, 0, 201, 401], [0, 0, 160, 240]]);
    expect(context.drawImage.mock.calls.map(call => call.slice(1))).toEqual([[0, 0, 201, 401], [0, 0, 160, 240]]);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    expect(mockClear).toHaveBeenCalledTimes(1);
    expect(document.body.children.length).toBe(childCount);
});

it.each([
    ["no pages", "Musical notes rendered no pages."],
    ["zero width", "Musical notes rendered an empty page."],
    ["zero height", "Musical notes rendered an empty page."],
    ["image", "Unable to export musical notes."],
    ["canvas", "Musical notes require a browser canvas."],
    ["blob", "Unable to export score page."],
    ["render", "Engraving failed"],
    ["constructor", "Engraver unavailable"],
])("cleans up after %s failure", async (failure, message) => {
    if (failure === "no pages") mockPages = [];
    if (failure === "zero width") mockPages = [[0, 100]];
    if (failure === "zero height") mockPages = [[100, 0]];
    if (failure === "image") imageFails = true;
    if (failure === "canvas") (HTMLCanvasElement.prototype.getContext as jest.Mock).mockReturnValue(null);
    if (failure === "blob") (HTMLCanvasElement.prototype.toBlob as jest.Mock).mockImplementation(callback => callback(null));
    if (failure === "constructor") mockConstruct.mockImplementationOnce(() => { throw new Error(message); });
    if (failure === "render") mockRender.mockImplementationOnce(() => { throw new Error(message); });
    const childCount = document.body.children.length;
    await expect(renderBookletMusic("<score-partwise />")).rejects.toThrow(message);
    expect(document.body.children.length).toBe(childCount);
    expect(mockClear).toHaveBeenCalledTimes(failure === "constructor" ? 0 : 1);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(["image", "canvas", "blob"].includes(failure) ? 1 : 0);
});
