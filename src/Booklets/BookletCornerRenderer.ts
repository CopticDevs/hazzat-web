import {
    concatTransformationMatrix, drawObject, PDFDocument, PDFName, PDFPage, PDFRef,
    popGraphicsState, pushGraphicsState
} from "pdf-lib";
import artworkUrl from "../images/bookletCoverCorner.bin";
import asset from "./BookletCornerAsset.json";

// Source SVG cells are packed without resampling or recoloring. One lossless
// PDF image and its alpha mask are reused across the front and back covers.
let loadedArtwork: Uint8Array | undefined;
let pendingArtwork: Promise<Uint8Array> | undefined;
const images = new WeakMap<PDFDocument, PDFRef>();
export const coverCornerPlacement = { x: 30, top: 32, width: 152 };

function validateArtwork(bytes: Uint8Array): Uint8Array {
    if (bytes.length !== asset.compressedBytes) throw new Error("Incomplete booklet cover artwork");
    return bytes;
}

async function fetchArtwork(): Promise<Uint8Array> {
    const response = await fetch(artworkUrl);
    if (!response.ok) throw new Error("Unable to load booklet cover artwork");
    return validateArtwork(new Uint8Array(await response.arrayBuffer()));
}

export async function loadCoverCornerArtwork(source?: ArrayBuffer): Promise<void> {
    if (loadedArtwork) return;
    if (!pendingArtwork) pendingArtwork = source
        ? Promise.resolve().then(() => validateArtwork(new Uint8Array(source)))
        : fetchArtwork();
    try { loadedArtwork = await pendingArtwork; }
    catch (error) { pendingArtwork = undefined; throw error; }
}

function getCornerImage(doc: PDFDocument): PDFRef {
    const cached = images.get(doc);
    if (cached) return cached;
    if (!loadedArtwork) throw new Error("Load the booklet cover artwork before drawing it");
    const common = {
        Type: "XObject", Subtype: "Image", Width: asset.width, Height: asset.height,
        BitsPerComponent: 8, Filter: "FlateDecode"
    };
    const alpha = doc.context.register(doc.context.stream(loadedArtwork.subarray(asset.colorBytes), {
        ...common, ColorSpace: "DeviceGray"
    }));
    const image = doc.context.register(doc.context.stream(loadedArtwork.subarray(0, asset.colorBytes), {
        ...common, ColorSpace: "DeviceRGB", SMask: alpha
    }));
    images.set(doc, image);
    return image;
}

export function drawCoverCorners(page: PDFPage) {
    const name = PDFName.of("HazzatEucharisticCorner");
    page.node.setXObject(name, getCornerImage(page.doc));
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
