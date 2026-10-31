import { concatTransformationMatrix, PDFDocument, PDFPage } from "pdf-lib";
import fs from "fs";
import path from "path";
import { drawCoverFrame } from "./BookletCoverArtwork";
import { coverArchPaths } from "./BookletCoverFrame";
import cornerPaths from "./BookletCoverCorners.json";

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
    const corners = draw.mock.calls.slice(0, cornerPaths.length * 2);
    expect(corners.map(([d]) => d)).toEqual([...cornerPaths, ...cornerPaths].map(p => p.d));
    expect(corners.every(([, options]) => options?.color || options?.borderColor)).toBe(true);
    expect(operators.mock.calls.flat().map(op => op.toString())).toContain(concatTransformationMatrix(-1, 0, 0, 1, 396, 0).toString());
    expect(Buffer.from(await doc.save()).toString("latin1")).not.toContain("/Subtype /Image");
});

it("keeps the reusable SVG and the PDF artwork in sync without embedded raster images", () => {
    const svg = fs.readFileSync(path.join(process.cwd(), "src/images/bookletCoverCorners.svg"), "utf8");
    expect(svg).not.toMatch(/<image\b|data:image|<filter\b/);
    expect(svg).toContain('viewBox="0 0 1009 1559"');
    expect(svg).toContain('transform="translate(1009 0) scale(-1 1)"');
    expect(svg.match(/<path\b/g)?.length).toBe(cornerPaths.length * 2);
    for (const p of cornerPaths) {
        expect(svg).toContain(`d="${p.d}"`);
        if (p.fill) expect(svg).toContain(`fill="${p.fill}"`);
        if (p.stroke) expect(svg).toContain(`stroke="${p.stroke}"`);
    }
});
