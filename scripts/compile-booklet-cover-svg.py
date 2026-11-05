"""Pack the approved pixel-cell SVG into reusable lossless PDF image streams.

Uses only the Python standard library. Extracts existing SVG cell values exactly;
no SVG browser rendering, tracing, resampling, recoloring, or palette reduction.
Run with --check to verify committed outputs without changing files.
"""

from pathlib import Path
import argparse
import hashlib
import json
import re
import xml.etree.ElementTree as ET
import zlib

ROOT = Path(__file__).resolve().parents[1]
SVG = ROOT / "src/images/bookletCoverCorners.svg"
STREAM = ROOT / "src/images/bookletCoverCorner.bin"
MANIFEST = ROOT / "src/Booklets/BookletCornerAsset.json"
NS = "{http://www.w3.org/2000/svg}"
CELL = re.compile(r"M(\d+) (\d+)h(\d+)v1h-(\d+)z")


def compile_artwork(svg_path=SVG):
    source = svg_path.read_bytes()
    svg = ET.fromstring(source)
    width, height = int(svg.attrib["width"]), int(svg.attrib["height"])
    if svg.get("viewBox") != f"0 0 {width} {height}":
        raise ValueError("Unsupported SVG viewport")
    allowed = {
        NS + "svg": {"width", "height", "viewBox"},
        NS + "title": set(), NS + "desc": set(),
        NS + "g": {"shape-rendering"},
        NS + "path": {"fill", "fill-opacity", "d"},
    }
    for node in svg.iter():
        if node.tag not in allowed or not set(node.attrib) <= allowed[node.tag]:
            raise ValueError("Only untransformed SVG pixel-cell paths are supported")

    coverage = bytearray(width * height)
    rgba = bytearray(width * height * 4)
    path_count = rectangle_count = 0
    for path in svg.iter(NS + "path"):
        color, data = path.attrib["fill"], path.attrib["d"]
        if not re.fullmatch(r"#[0-9a-f]{6}", color):
            raise ValueError("Unsupported SVG color")
        rgb = tuple(int(color[i:i + 2], 16) for i in (1, 3, 5))
        source_alpha = float(path.get("fill-opacity", "1")) * 255
        alpha = round(source_alpha)
        if not 1 <= alpha <= 255 or abs(source_alpha - alpha) > 0.000001:
            raise ValueError("Unsupported SVG alpha")
        matches = list(CELL.finditer(data))
        if "".join(match[0] for match in matches) != data:
            raise ValueError("Unsupported SVG path commands")
        for match in matches:
            x, y, length, reverse = map(int, match.groups())
            if length != reverse or length < 1 or x + length > width or y >= height:
                raise ValueError("Invalid SVG pixel-cell bounds")
            start = y * width + x
            if any(coverage[start:start + length]):
                raise ValueError("Overlapping SVG cells")
            coverage[start:start + length] = b"\x01" * length
            rgba[start * 4:(start + length) * 4] = bytes((*rgb, alpha)) * length
            rectangle_count += 1
        path_count += 1
    # An individual PDF rectangle for each cell causes antialiasing seams and
    # is expensive to paint. PDF RGB + soft-mask streams represent these same
    # pixel cells directly, retaining their original eight-bit values.
    rgb = bytearray(width * height * 3)
    rgb[0::3], rgb[1::3], rgb[2::3] = rgba[0::4], rgba[1::4], rgba[2::4]
    colors = zlib.compress(rgb, level=9)
    alpha = zlib.compress(rgba[3::4], level=9)
    stream = colors + alpha
    metadata = {
        "width": width, "height": height,
        "sourceSha256": hashlib.sha256(source).hexdigest(),
        "streamSha256": hashlib.sha256(stream).hexdigest(),
        "rgbaSha256": hashlib.sha256(rgba).hexdigest(),
        "pathCount": path_count, "rectangleCount": rectangle_count,
        "visiblePixels": sum(coverage),
        "colorBytes": len(colors), "alphaBytes": len(alpha),
        "compressedBytes": len(stream),
    }
    return stream, (json.dumps(metadata, indent=2) + "\n").encode()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    artworks = [
        (SVG, STREAM, MANIFEST),
        (ROOT / "src/images/bookletCoverCenterVine.svg", ROOT / "src/images/bookletCoverCenterVine.bin",
         ROOT / "src/Booklets/BookletCenterVineAsset.json"),
    ]
    for svg_path, stream_path, manifest_path in artworks:
        stream, manifest = compile_artwork(svg_path)
        for target, expected in [(stream_path, stream), (manifest_path, manifest)]:
            if args.check:
                actual = target.read_bytes()
                if target == manifest_path:
                    actual = actual.replace(b"\r\n", b"\n")
                if actual != expected:
                    raise SystemExit(f"Stale compiled artwork: {target.relative_to(ROOT)}")
            else:
                target.write_bytes(expected)
        print(f"Verified {svg_path.name}; lossless PDF color/alpha streams: {len(stream):,} bytes")
