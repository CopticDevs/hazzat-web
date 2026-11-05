import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import { createBookletArtworkImage } from "./BookletArtworkImage";

const asset = { width: 1, height: 1, compressedBytes: 4, colorBytes: 3 };
const bytes = new Uint8Array([1, 2, 3, 4]);
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

it("requires loading before drawing and embeds a separate alpha mask only once per document", async () => {
    const artwork = createBookletArtworkImage("/art.bin", asset);
    const first = await PDFDocument.create();
    expect(() => artwork.getImage(first)).toThrow("Load the booklet cover artwork before drawing it");
    await artwork.loadArtwork(bytes.buffer);
    const ref = artwork.getImage(first);
    expect(artwork.getImage(first)).toBe(ref);
    const stream = first.context.lookup(ref) as PDFRawStream;
    expect(stream.getContents()).toEqual(bytes.subarray(0, 3));
    expect(stream.dict.get(PDFName.of("ColorSpace"))?.toString()).toBe("/DeviceRGB");
    const alpha = stream.dict.lookup(PDFName.of("SMask")) as PDFRawStream;
    expect(alpha.getContents()).toEqual(bytes.subarray(3));
    expect(alpha.dict.get(PDFName.of("ColorSpace"))?.toString()).toBe("/DeviceGray");
    const second = await PDFDocument.create();
    expect(second.context.lookup(artwork.getImage(second))).not.toBe(stream);
});

it("shares an in-flight fetch and reuses loaded bytes across later calls", async () => {
    const artwork = createBookletArtworkImage("/art.bin", asset);
    let finish!: (value: Response) => void;
    global.fetch = jest.fn(() => new Promise<Response>(resolve => { finish = resolve; }));
    const pending = [artwork.loadArtwork(), artwork.loadArtwork()];
    expect(fetch).toHaveBeenCalledTimes(1);
    finish({ ok: true, arrayBuffer: async () => bytes.buffer } as Response);
    await Promise.all(pending);
    await artwork.loadArtwork(new ArrayBuffer(0));
    expect(fetch).toHaveBeenCalledTimes(1);
});

it("permits a retry after an HTTP or incomplete-data failure", async () => {
    const artwork = createBookletArtworkImage("/art.bin", asset);
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true, arrayBuffer: async () => bytes.buffer });
    await expect(artwork.loadArtwork()).rejects.toThrow("Unable to load booklet cover artwork");
    await expect(artwork.loadArtwork(new ArrayBuffer(1))).rejects.toThrow("Incomplete booklet cover artwork");
    await expect(artwork.loadArtwork()).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(2);
});
