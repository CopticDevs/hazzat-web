import { PDFDocument, PDFPage } from "pdf-lib";
import { drawCoverFrame } from "./BookletCoverArtwork";
import { coverArchPaths } from "./BookletCoverFrame";

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
        expect(draws.mock.calls.map(([path]) => path)).toEqual([...coverArchPaths, ...coverArchPaths]);
        expect(draws.mock.calls.map(([, options]) => options?.scale)).toEqual(Array(4).fill(396 / 1009));
    } finally { draws.mockRestore(); }
});
