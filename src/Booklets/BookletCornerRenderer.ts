import {
    appendBezierCurve, clip, closePath, concatTransformationMatrix, endPath, LineCapStyle, LineJoinStyle,
    lineTo, moveTo, PDFDict, PDFDocument, PDFName, PDFOperator, PDFOperatorNames, PDFPage, PDFRef,
    popGraphicsState, pushGraphicsState, rgb, scale, setLineJoin, translate
} from "pdf-lib";
import source from "./BookletCoverCorners.json";
import { coverFrameWidth } from "./BookletCoverFrame";

interface CornerPath {
    d: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    paint?: string;
    opacity?: number;
    clip?: string;
}
interface CornerGradient {
    kind: "linear" | "radial";
    coords: number[];
    stops: [number, string][];
}
// JSON imports widen tuple/literal types; the generated asset contract is
// checked alongside SVG/PDF shading and geometry in the artwork tests.
const artwork = source as unknown as {
    paths: CornerPath[];
    gradients: Record<string, CornerGradient>;
    clips: Record<string, string[]>;
};
const artworkScale = 396 / coverFrameWidth;
const shadingCache = new WeakMap<PDFDocument, Record<string, PDFRef>>();

function channels(hex: string) {
    return [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
}
function color(hex?: string) {
    if (!hex) return undefined;
    const [r, g, b] = channels(hex);
    return rgb(r, g, b);
}

// The authored asset uses only absolute M/L/C/Z commands. Keep these curves
// native while clipping PDF shading; no SVG-to-canvas conversion is involved.
function pathOperators(d: string, pageCoordinates = false): PDFOperator[] {
    const tokens = d.match(/[A-Za-z]|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/g) || [];
    const result: PDFOperator[] = [];
    for (let i = 0; i < tokens.length;) {
        const command = tokens[i++];
        if (command === "Z") { result.push(closePath()); continue; }
        const count = command === "C" ? 6 : command === "M" || command === "L" ? 2 : 0;
        if (!count) throw new Error(`Unsupported corner path command: ${command}`);
        const values = tokens.slice(i, i + count).map(Number);
        if (values.length !== count || values.some(v => !Number.isFinite(v))) throw new Error("Invalid corner path coordinates");
        i += count;
        if (pageCoordinates) {
            for (let n = 0; n < values.length; n += 2) {
                values[n] *= artworkScale;
                values[n + 1] = 612 - values[n + 1] * artworkScale;
            }
        }
        if (command === "M") result.push(moveTo(values[0], values[1]));
        else if (command === "L") result.push(lineTo(values[0], values[1]));
        else result.push(appendBezierCurve(values[0], values[1], values[2], values[3], values[4], values[5]));
    }
    return result;
}

function registerShadings(page: PDFPage) {
    const context = page.doc.context;
    let refs = shadingCache.get(page.doc);
    if (!refs) {
        refs = {};
        for (const [key, gradient] of Object.entries(artwork.gradients)) {
            const functions = gradient.stops.slice(1).map((stop, index) => context.register(context.obj({
                FunctionType: 2, Domain: [0, 1], C0: channels(gradient.stops[index][1]), C1: channels(stop[1]), N: 1
            })));
            const fn = context.register(context.obj({
                FunctionType: 3, Domain: [0, 1], Functions: functions,
                Bounds: gradient.stops.slice(1, -1).map(stop => stop[0]), Encode: functions.flatMap(() => [0, 1])
            }));
            refs[key] = context.register(context.obj({
                ShadingType: gradient.kind === "linear" ? 2 : 3, ColorSpace: "DeviceRGB",
                Coords: gradient.coords, Function: fn, Extend: [true, true]
            }));
        }
        shadingCache.set(page.doc, refs);
    }
    const resources = page.node.normalizedEntries().Resources;
    let shadings = resources.lookupMaybe(PDFName.of("Shading"), PDFDict);
    if (!shadings) { shadings = context.obj({}); resources.set(PDFName.of("Shading"), shadings); }
    const names: Record<string, PDFName> = {};
    for (const [key, ref] of Object.entries(refs)) {
        const name = PDFName.of(`HazzatCorner_${key}`);
        shadings.set(name, ref);
        names[key] = name;
    }
    return names;
}

export function drawCoverCorners(page: PDFPage) {
    const shadings = registerShadings(page);
    for (const mirrored of [false, true]) {
        page.pushOperators(pushGraphicsState(), setLineJoin(LineJoinStyle.Round));
        if (mirrored) page.pushOperators(concatTransformationMatrix(-1, 0, 0, 1, 396, 0));
        let activeClip: string | undefined;
        for (const path of artwork.paths) {
            if (path.clip !== activeClip) {
                if (activeClip) page.pushOperators(popGraphicsState());
                activeClip = path.clip;
                if (activeClip) {
                    page.pushOperators(pushGraphicsState());
                    for (const d of artwork.clips[activeClip]) page.pushOperators(...pathOperators(d, true));
                    page.pushOperators(clip(), endPath());
                }
            }
            if (path.paint) {
                page.pushOperators(
                    pushGraphicsState(), translate(0, 612), scale(artworkScale, -artworkScale),
                    ...pathOperators(path.d), clip(), endPath(),
                    PDFOperator.of(PDFOperatorNames.ShadingFill, [shadings[path.paint]]), popGraphicsState()
                );
            }
            if (!path.paint || path.stroke) {
                page.drawSvgPath(path.d, {
                    x: 0, y: 612, scale: artworkScale,
                    color: path.paint ? undefined : color(path.fill), borderColor: color(path.stroke),
                    borderWidth: path.strokeWidth, borderLineCap: LineCapStyle.Round, opacity: path.opacity
                });
            }
        }
        if (activeClip) page.pushOperators(popGraphicsState());
        page.pushOperators(popGraphicsState());
    }
}
