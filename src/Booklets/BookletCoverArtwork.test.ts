import { decodePDFRawStream, PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFPage, PDFRawStream } from "pdf-lib";
import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { inflateSync } from "zlib";
import { drawCoverFrame } from "./BookletCoverArtwork";
import { coverArchPaths } from "./BookletCoverFrame";
import asset from "./BookletCornerAsset.json";
import { coverCornerPlacement, loadCoverCornerArtwork } from "./BookletCornerRenderer";

const packed = fs.readFileSync(path.join(process.cwd(), "src/images/bookletCoverCorner.bin"));
const source = packed.buffer.slice(packed.byteOffset, packed.byteOffset + packed.byteLength);
beforeAll(() => loadCoverCornerArtwork(source));
const hash = (bytes: Buffer | Uint8Array) => createHash("sha256").update(bytes).digest("hex");

it("keeps the gold arch a constant normal inset of the maroon arch", () => {
    const points = Array.from(coverArchPaths[1].matchAll(/[ML]([0-9.]+) ([0-9.]+)/g), m => [Number(m[1]), Number(m[2])]);
    const leftCurve = points.filter(([x, y]) => x < 504.5 && y < 512);
    expect(leftCurve.length).toBeGreaterThan(100);
    const outer = Array.from({ length: 5001 }, (_, i) => {
        const t = i / 5000, q = 1 - t;
        return [q ** 3 * 171 + 3 * q * q * t * 171 + 3 * q * t * t * 325 + t ** 3 * 504.5,
            q ** 3 * 512 + 3 * q * q * t * 342 + 3 * q * t * t * 216 + t ** 3 * 156];
    });
    for (const [x, y] of leftCurve) {
        const distance = Math.min(...outer.map(([a, b]) => Math.hypot(x - a, y - b)));
        expect(Math.abs(distance - 16)).toBeLessThan(.02);
    }
    expect(coverArchPaths[1]).toMatch(/^M187 1384L187 512/);
    expect(coverArchPaths[1]).toMatch(/L822 1384Z$/);
});

it("draws the same two crisp vector arches on either cover", async () => {
    const doc = await PDFDocument.create();
    const draws = jest.spyOn(PDFPage.prototype, "drawSvgPath");
    try {
        drawCoverFrame(doc.addPage([396, 612]));
        drawCoverFrame(doc.addPage([396, 612]));
        const arches = draws.mock.calls.filter(([path]) => coverArchPaths.includes(path));
        expect(arches.map(([path]) => path)).toEqual([...coverArchPaths, ...coverArchPaths]);
        expect(arches.map(([, options]) => options?.scale)).toEqual(Array(4).fill(396 / 1009));
    } finally { draws.mockRestore(); }
});

it("keeps the selected SVG and its lossless PDF data synchronized", () => {
    const svg = fs.readFileSync(path.join(process.cwd(), "src/images/bookletCoverCorners.svg"));
    expect(hash(svg)).toBe(asset.sourceSha256);
    expect(hash(packed)).toBe(asset.streamSha256);
    expect(packed.length).toBe(asset.compressedBytes);
    const text = svg.toString("utf8");
    expect(text).not.toMatch(/<image\b|data:image|<filter\b/);
    expect(text).toContain(`viewBox="0 0 ${asset.width} ${asset.height}"`);
    expect(text.match(/<path\b/g)).toHaveLength(asset.pathCount);
    const colors = inflateSync(packed.subarray(0, asset.colorBytes));
    const alpha = inflateSync(packed.subarray(asset.colorBytes));
    expect(colors.length).toBe(asset.width * asset.height * 3);
    expect(alpha.length).toBe(asset.width * asset.height);
    const rgba = Buffer.alloc(alpha.length * 4);
    for (let i = 0; i < alpha.length; i++) {
        colors.copy(rgba, i * 4, i * 3, i * 3 + 3);
        rgba[i * 4 + 3] = alpha[i];
    }
    expect(hash(rgba)).toBe(asset.rgbaSha256);
});

it("shares the same original colors and transparency between both mirrored covers", async () => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 2; i++) drawCoverFrame(doc.addPage([396, 612]));
    const saved = await PDFDocument.load(await doc.save());
    const refs: string[] = [];
    for (const page of saved.getPages()) {
        const objects = page.node.Resources()!.lookup(PDFName.of("XObject"), PDFDict);
        const ref = objects.get(PDFName.of("HazzatEucharisticCorner"))!;
        refs.push(ref.toString());
        const image = saved.context.lookup(ref) as PDFRawStream;
        expect(image.dict.lookup(PDFName.of("Width"), PDFNumber).asNumber()).toBe(asset.width);
        expect(image.dict.lookup(PDFName.of("Height"), PDFNumber).asNumber()).toBe(asset.height);
        expect(image.dict.get(PDFName.of("ColorSpace"))!.toString()).toBe("/DeviceRGB");
        const mask = image.dict.lookup(PDFName.of("SMask")) as PDFRawStream;
        expect(Buffer.from(decodePDFRawStream(image).decode())).toEqual(inflateSync(packed.subarray(0, asset.colorBytes)));
        expect(Buffer.from(decodePDFRawStream(mask).decode())).toEqual(inflateSync(packed.subarray(asset.colorBytes)));
        const streams = page.node.Contents() as PDFArray;
        const content = Array.from({ length: streams.size() }, (_, i) => {
            const stream = saved.context.lookup(streams.get(i)) as PDFRawStream;
            return Buffer.from(decodePDFRawStream(stream).decode()).toString("latin1");
        }).join("\n");
        expect(content.match(/\/HazzatEucharisticCorner Do/g)).toHaveLength(2);
        expect(content).toContain("-1 0 0 1 396 0 cm");
        expect(content.match(/^q$/gm)?.length).toBe(content.match(/^Q$/gm)?.length);
    }
    expect(new Set(refs).size).toBe(1);
});

it("places all visible foliage outside the arch and inside the frame", () => {
    const alpha = inflateSync(packed.subarray(asset.colorBytes));
    const scale = coverCornerPlacement.width / asset.width, frameScale = 396 / 1009;
    const arch = (t: number) => {
        const q = 1 - t;
        return [q ** 3 * 171 + 3 * q * q * t * 171 + 3 * q * t * t * 325 + t ** 3 * 504.5,
            q ** 3 * 512 + 3 * q * q * t * 342 + 3 * q * t * t * 216 + t ** 3 * 156].map(n => n * frameScale);
    };
    let minimumGap = Infinity, minimumLeft = Infinity, minimumTop = Infinity;
    for (let y = 0; y < asset.height; y++) {
        let right = -1, left = Infinity;
        for (let x = 0; x < asset.width; x++) {
            if (alpha[y * asset.width + x] > 64) {
                right = x + 1;
                left = Math.min(left, x);
            }
        }
        if (right >= 0) {
            minimumLeft = Math.min(minimumLeft, coverCornerPlacement.x + left * scale);
            minimumTop = Math.min(minimumTop, coverCornerPlacement.top + y * scale);
        }
        const bottom = coverCornerPlacement.top + (y + 1) * scale;
        if (right < 0 || bottom < 156 * frameScale) continue;
        let low = 0, high = 1;
        for (let i = 0; i < 24; i++) {
            const mid = (low + high) / 2;
            if (arch(mid)[1] > bottom) low = mid; else high = mid;
        }
        minimumGap = Math.min(minimumGap, arch((low + high) / 2)[0] - coverCornerPlacement.x - right * scale);
    }
    expect(minimumGap).toBeGreaterThan(1.5);
    expect(minimumLeft).toBeGreaterThan(32.5);
    expect(minimumTop).toBeGreaterThan(32.5);
});


it("preserves the approved center-vine SVG colors and alpha in its packed PDF image", () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/Booklets/BookletCenterVineAsset.json"), "utf8"));
    const source = fs.readFileSync(path.join(process.cwd(), "src/images/bookletCoverCenterVine.svg"));
    const bytes = fs.readFileSync(path.join(process.cwd(), "src/images/bookletCoverCenterVine.bin"));
    expect(hash(source)).toBe(manifest.sourceSha256);
    expect(hash(bytes)).toBe(manifest.streamSha256);
    expect(source.toString()).not.toMatch(/<image\b|data:image|<filter\b/);
    const colors = inflateSync(bytes.subarray(0, manifest.colorBytes));
    const alpha = inflateSync(bytes.subarray(manifest.colorBytes));
    const rgba = Buffer.alloc(alpha.length * 4);
    for (let i = 0; i < alpha.length; i++) {
        colors.copy(rgba, i * 4, i * 3, i * 3 + 3);
        rgba[i * 4 + 3] = alpha[i];
    }
    expect(hash(rgba)).toBe(manifest.rgbaSha256);
    expect([manifest.width, manifest.height]).toEqual([2138, 736]);
});
