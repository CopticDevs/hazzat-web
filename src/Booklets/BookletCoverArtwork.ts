import { PDFImage, PDFPage, rgb } from "pdf-lib";
import { coverArchPaths, coverFrameWidth } from "./BookletCoverFrame";
import { drawCoverCorners } from "./BookletCornerRenderer";

export { drawCoverVine } from "./BookletCenterVineRenderer";

const maroon = rgb(128 / 255, 0, 0);
const gold = rgb(146 / 255, 115 / 255, 68 / 255);

export function drawCoverFrame(page: PDFPage, paper?: PDFImage) {
    if (paper) {
        // Keep the paper separate from the approved SVG-backed corner artwork.
        page.drawImage(paper, { x: 0, y: 0, width: 396, height: 612 });
    } else {
        page.drawRectangle({ x: 18, y: 18, width: 360, height: 576, color: rgb(225 / 255, 222 / 255, 212 / 255) });
    }
    for (const [inset, thickness] of [[25, .9], [32, .45]]) {
        page.drawRectangle({ x: inset, y: inset, width: 396 - 2 * inset, height: 612 - 2 * inset, borderWidth: thickness, borderColor: gold });
    }
    drawCoverCorners(page);
    coverArchPaths.forEach((path, index) => page.drawSvgPath(path, {
        x: 0, y: 612, scale: 396 / coverFrameWidth,
        borderColor: index === 0 ? maroon : gold, borderWidth: index === 0 ? 2 : 1.5
    }));
}
