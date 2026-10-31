import { concatTransformationMatrix, drawObject, PDFName, PDFPage, popGraphicsState, pushGraphicsState } from "pdf-lib";
import artworkUrl from "../images/bookletCoverCenterVine.bin";
import asset from "./BookletCenterVineAsset.json";
import { createBookletArtworkImage } from "./BookletArtworkImage";

const artwork = createBookletArtworkImage(artworkUrl, asset);
export const loadCoverCenterVineArtwork = artwork.loadArtwork;

export function drawCoverVine(page: PDFPage, x: number, top: number, width: number) {
    const name = PDFName.of("HazzatEucharisticCenterVine");
    page.node.setXObject(name, artwork.getImage(page.doc));
    const height = width * asset.height / asset.width;
    page.pushOperators(pushGraphicsState(),
        concatTransformationMatrix(width, 0, 0, height, x, 612 - top - height),
        drawObject(name), popGraphicsState());
}
