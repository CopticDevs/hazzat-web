import { PDFDocument, PDFRef } from "pdf-lib";

interface ArtworkAsset { width: number; height: number; compressedBytes: number; colorBytes: number; }

// Each source loads once across exports; each PDF embeds its color/alpha pair once.
export function createBookletArtworkImage(artworkUrl: string, asset: ArtworkAsset) {
    // Source SVG cells are packed without resampling or recoloring. One lossless
    // PDF image and its alpha mask are reused across the front and back covers.
    let loadedArtwork: Uint8Array | undefined;
    let pendingArtwork: Promise<Uint8Array> | undefined;
    const images = new WeakMap<PDFDocument, PDFRef>();

    function validateArtwork(bytes: Uint8Array): Uint8Array {
        if (bytes.length !== asset.compressedBytes) throw new Error("Incomplete booklet cover artwork");
        return bytes;
    }

    async function fetchArtwork(): Promise<Uint8Array> {
        const response = await fetch(artworkUrl);
        if (!response.ok) throw new Error("Unable to load booklet cover artwork");
        return validateArtwork(new Uint8Array(await response.arrayBuffer()));
    }

    async function loadArtwork(source?: ArrayBuffer): Promise<void> {
        if (loadedArtwork) return;
        if (!pendingArtwork) pendingArtwork = source
            ? Promise.resolve().then(() => validateArtwork(new Uint8Array(source)))
            : fetchArtwork();
        try { loadedArtwork = await pendingArtwork; }
        catch (error) { pendingArtwork = undefined; throw error; }
    }

    function getImage(doc: PDFDocument): PDFRef {
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


    return { loadArtwork, getImage };
}
