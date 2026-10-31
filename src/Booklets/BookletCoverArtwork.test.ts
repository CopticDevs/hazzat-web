import { concatTransformationMatrix, decodePDFRawStream, PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFPage, PDFRawStream } from "pdf-lib";
import fs from "fs";
import path from "path";
import { drawCoverFrame } from "./BookletCoverArtwork";
import { coverArchPaths } from "./BookletCoverFrame";
import artwork from "./BookletCoverCorners.json";

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

it("draws colored, mirrored corner paths directly in the PDF, with no bitmap fallback", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([396, 612]);
    const draw = jest.spyOn(page, "drawSvgPath");
    const image = jest.spyOn(page, "drawImage");
    const operators = jest.spyOn(page, "pushOperators");
    drawCoverFrame(page);
    expect(image).not.toHaveBeenCalled();
    const corners = draw.mock.calls.filter(([d]) => !coverArchPaths.includes(d));
    expect(corners.every(([, options]) => options?.color || options?.borderColor)).toBe(true);
    expect(corners.length).toBeGreaterThan(50);
    expect(operators.mock.calls.flat().map(op => op.toString())).toContain(concatTransformationMatrix(-1, 0, 0, 1, 396, 0).toString());
    expect(Buffer.from(await doc.save()).toString("latin1")).not.toContain("/Subtype /Image");
});

it("keeps the reusable SVG and the PDF artwork in sync without embedded raster images", () => {
    const svg = fs.readFileSync(path.join(process.cwd(), "src/images/bookletCoverCorners.svg"), "utf8");
    expect(svg).not.toMatch(/<image\b|data:image|<filter\b/);
    expect(svg).toContain('viewBox="0 0 1009 1559"');
    expect(svg).toContain('transform="translate(1009 0) scale(-1 1)"');
    expect(svg).toContain('<use href="#corner"');
    expect(svg.match(/<path\b/g)?.length).toBe(artwork.paths.length + artwork.clips.body.length);
    for (const p of artwork.paths) {
        expect(svg).toContain(`d="${p.d}"`);
        if (p.fill) expect(svg).toContain(`fill="${p.fill}"`);
        if (p.stroke) expect(svg).toContain(`stroke="${p.stroke}"`);
        if (p.paint) expect(svg).toContain(`fill="url(#${p.paint})"`);
        if (p.clip) expect(svg).toContain(`clip-path="url(#${p.clip})"`);
    }
    for (const gradient of Object.values(artwork.gradients)) {
        expect(["linear", "radial"]).toContain(gradient.kind);
        expect(gradient.coords).toHaveLength(gradient.kind === "linear" ? 4 : 6);
        expect(gradient.stops[0][0]).toBe(0);
        expect(gradient.stops[gradient.stops.length - 1][0]).toBe(1);
        let previous = -1;
        for (const [offset, color] of gradient.stops) {
            expect(typeof offset).toBe("number");
            expect(offset).toBeGreaterThan(previous);
            expect(color).toMatch(/^#[\da-f]{6}$/i);
            previous = Number(offset);
        }
    }
});

it("preserves smooth gold and grape shading as native PDF resources on both covers", async () => {
    const doc = await PDFDocument.create();
    const pages = [doc.addPage([396, 612]), doc.addPage([396, 612])];
    pages.forEach(page => drawCoverFrame(page));
    const saved = await PDFDocument.load(await doc.save());
    const references: string[][] = [];
    for (const page of saved.getPages()) {
        const resources = page.node.Resources()!.lookup(PDFName.of("Shading"), PDFDict);
        expect(resources.keys()).toHaveLength(Object.keys(artwork.gradients).length);
        const kinds = resources.values().map(ref => saved.context.lookup(ref, PDFDict).lookup(PDFName.of("ShadingType"), PDFNumber).asNumber());
        expect(kinds).toContain(2); // Smooth axial gold folds.
        expect(kinds).toContain(3); // Smooth radial grape volume.
        references.push(resources.values().map(ref => ref.toString()));
        const streams = page.node.Contents() as PDFArray;
        const operators = Array.from({ length: streams.size() }, (_, i) => {
            const stream = saved.context.lookup(streams.get(i));
            if (!(stream instanceof PDFRawStream)) throw new Error("Expected a PDF content stream");
            return Buffer.from(decodePDFRawStream(stream).decode()).toString("latin1");
        }).join("\n");
        expect(operators).toMatch(/\/HazzatCorner_\w+ sh/);
        expect(operators.match(/^q$/gm)?.length).toBe(operators.match(/^Q$/gm)?.length);
        expect(operators).toContain("W\nn"); // Leaf details remain inside the connected silhouette.
    }
    expect(references[0]).toEqual(references[1]); // Share shading objects across the covers.
});

it("uses a symmetric cross and constant-width concentric medallion instead of traced edges", () => {
    const cross = artwork.paths.find(p => p.role === "cross")!;
    const ring = artwork.paths.find(p => p.role === "medallion")!;
    const curves = (d: string) => Array.from(d.matchAll(/C([^MCZ]+)/g), m => m[1].trim().split(/\s+/).map(Number));
    const quarters = curves(cross.d);
    expect(quarters).toHaveLength(36);
    for (let turn = 1; turn < 4; turn++) {
        for (let n = 0; n < 9; n++) {
            for (let point = 0; point < 6; point += 2) {
                let x = quarters[n][point] - 191, y = quarters[n][point + 1] - 175;
                for (let r = 0; r < turn; r++) [x, y] = [-y, x];
                expect(quarters[turn * 9 + n][point]).toBeCloseTo(191 + x, 3);
                expect(quarters[turn * 9 + n][point + 1]).toBeCloseTo(175 + y, 3);
            }
        }
    }
    expect(cross.paint).toBeUndefined();
    const rings = curves(ring.d);
    expect(rings).toHaveLength(8);
    for (let boundary = 0; boundary < 2; boundary++) {
        const radius = boundary === 0 ? 63 : 54.5;
        let start = [191 + radius, 175];
        for (const segment of rings.slice(boundary * 4, boundary * 4 + 4)) {
            for (let t = 0; t <= 1; t += .05) {
                const q = 1 - t;
                const x = q ** 3 * start[0] + 3 * q * q * t * segment[0] + 3 * q * t * t * segment[2] + t ** 3 * segment[4];
                const y = q ** 3 * start[1] + 3 * q * q * t * segment[1] + 3 * q * t * t * segment[3] + t ** 3 * segment[5];
                expect(Math.abs(Math.hypot(x - 191, y - 175) - radius)).toBeLessThan(.02);
            }
            start = segment.slice(4);
        }
    }
    expect(ring.paint).toBeUndefined();
});

it("uses monotonic matte tones without alternating specular bands", () => {
    for (const gradient of Object.values(artwork.gradients)) {
        const luminance = gradient.stops.map(([, hex]) => {
            const color = String(hex);
            return .2126 * parseInt(color.slice(1, 3), 16) + .7152 * parseInt(color.slice(3, 5), 16) + .0722 * parseInt(color.slice(5, 7), 16);
        });
        const differences = luminance.slice(1).map((value, i) => value - luminance[i]);
        expect(differences.every(v => v <= 0) || differences.every(v => v >= 0)).toBe(true);
    }
    const veins = artwork.paths.filter(p => p.role === "leaf-vein");
    expect(veins.length).toBeGreaterThan(30);
    expect(veins.every(p => p.clip === "body" && !p.fill && !p.paint)).toBe(true);
});
