import fs from "fs";
import path from "path";

const bytes = fs.readFileSync(path.join(process.cwd(), "src/images/bookletCoverCorner.bin"));
const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

function freshRenderer() {
    let renderer!: typeof import("./BookletCornerRenderer");
    jest.isolateModules(() => { renderer = require("./BookletCornerRenderer"); });
    return renderer;
}

it("loads artwork on demand and shares the request across repeated exports", async () => {
    const request = jest.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => buffer });
    global.fetch = request;
    const renderer = freshRenderer();
    expect(request).not.toHaveBeenCalled();
    await Promise.all([renderer.loadCoverCornerArtwork(), renderer.loadCoverCornerArtwork()]);
    await renderer.loadCoverCornerArtwork();
    expect(request).toHaveBeenCalledTimes(1);
});

it("allows retry after a failed artwork download", async () => {
    const request = jest.fn().mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => buffer });
    global.fetch = request;
    const renderer = freshRenderer();
    await expect(renderer.loadCoverCornerArtwork()).rejects.toThrow("Unable to load");
    await expect(renderer.loadCoverCornerArtwork()).resolves.toBeUndefined();
    expect(request).toHaveBeenCalledTimes(2);
});

it("rejects truncated artwork without caching it", async () => {
    const renderer = freshRenderer();
    await expect(renderer.loadCoverCornerArtwork(new ArrayBuffer(10))).rejects.toThrow("Incomplete");
    await expect(renderer.loadCoverCornerArtwork(buffer)).resolves.toBeUndefined();
});
