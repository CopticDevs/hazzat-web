import {
    concatTransformationMatrix, drawObject, PDFName, PDFPage,
    popGraphicsState, pushGraphicsState
} from "pdf-lib";
import artworkUrl from "../images/bookletCoverCorner.bin";
import asset from "./BookletCornerAsset.json";
import { createBookletArtworkImage } from "./BookletArtworkImage";

const artwork = createBookletArtworkImage(artworkUrl, asset);
export const loadCoverCornerArtwork = artwork.loadArtwork;
export const coverCornerPlacement = { x: 30, top: 32, width: 152 };

export function drawCoverCorners(page: PDFPage) {
    const name = PDFName.of("HazzatEucharisticCorner");
    page.node.setXObject(name, artwork.getImage(page.doc));
    const scale = coverCornerPlacement.width / asset.width;
    const y = 612 - coverCornerPlacement.top - asset.height * scale;
    for (const mirrored of [false, true]) {
        const operators = [pushGraphicsState()];
        if (mirrored) operators.push(concatTransformationMatrix(-1, 0, 0, 1, 396, 0));
        operators.push(
            concatTransformationMatrix(coverCornerPlacement.width, 0, 0, asset.height * scale, coverCornerPlacement.x, y),
            drawObject(name), popGraphicsState()
        );
        page.pushOperators(...operators);
    }
}
