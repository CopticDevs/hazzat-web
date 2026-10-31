"""Build faithful SVG/PDF corner ornaments from the approved illuminated source.

Authoring only: Pillow, numpy and vtracer==0.6.15. No runtime tracing or raster
fallback. Smooth source contours retain the full acanthus silhouettes and joints;
vector bevels, leaf folds and radial grapes supply clean, scalable carved detail.
Intermediates stay under the ignored .audit directory for visual inspection.
"""

from pathlib import Path
import json, re, xml.etree.ElementTree as ET
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
from collections import deque
import vtracer

root = Path(__file__).resolve().parents[1]
out = root / ".audit/booklet-corner-artwork"
out.mkdir(parents=True, exist_ok=True)
im = (
    Image.open(root / "src/images/bookletIlluminatedBackground.png")
    .convert("RGB")
    .resize((1009, 1559), Image.Resampling.LANCZOS)
    .crop((88, 84, 480, 595))
    .filter(ImageFilter.MedianFilter(3))
)
a = np.array(im).astype(float)
r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
mx = a.max(2)
mn = a.min(2)
mask = (mx - mn) / np.maximum(mx, 1) > 0.14
# Remove sub-pixel pigment wobble before fitting the structural contours.
# The low cutoff preserves the broad scroll weight while rounding tiny nicks.
mask = (
    np.array(
        Image.fromarray(mask.astype("uint8") * 255).filter(
            ImageFilter.GaussianBlur(1.1)
        )
    )
    >= 110
)
paths = []
gradients = {}


def trace(
    m,
    fill,
    name,
    blur=0.8,
    threshold=116,
    stroke=None,
    width=0.6,
    paint=None,
    speckle=9,
):
    field = (
        Image.fromarray((m * 255).astype("uint8"))
        .filter(ImageFilter.GaussianBlur(blur))
        .resize((1568, 2044), Image.Resampling.BICUBIC)
        .point(lambda v: 0 if v >= threshold else 255)
    )
    field.save(out / f"{name}.png")
    vtracer.convert_image_to_svg_py(
        str(out / f"{name}.png"),
        str(out / f"{name}.svg"),
        colormode="binary",
        mode="spline",
        filter_speckle=speckle,
        corner_threshold=180,
        length_threshold=12,
        max_iterations=25,
        splice_threshold=180,
        path_precision=2,
    )
    for node in ET.parse(out / f"{name}.svg").getroot().iter():
        if not node.tag.endswith("path"):
            continue
        dx, dy = map(
            float, re.findall(r"-?[\d.]+", node.get("transform", "translate(0,0)"))
        )
        d = re.sub(
            r"(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)",
            lambda m: f"{88+(float(m[1])+dx)/4:.2f} {84+(float(m[2])+dy)/4:.2f}",
            node.attrib["d"],
        )
        p = {"d": d}
        if fill:
            p["fill"] = fill
        if paint:
            p["paint"] = paint
        if stroke:
            p.update(stroke=stroke, strokeWidth=width)
        paths.append(p)


def path(d, fill=None, stroke=None, width=1, paint=None):
    p = {"d": d}
    if fill:
        p["fill"] = fill
    if stroke:
        p.update(stroke=stroke, strokeWidth=width)
    if paint:
        p["paint"] = paint
    paths.append(p)


def circle(cx, cy, rx, ry, paint):
    k = 0.5522847498
    path(
        f"M{cx+rx} {cy} C{cx+rx} {cy+ry*k} {cx+rx*k} {cy+ry} {cx} {cy+ry} C{cx-rx*k} {cy+ry} {cx-rx} {cy+ry*k} {cx-rx} {cy} C{cx-rx} {cy-ry*k} {cx-rx*k} {cy-ry} {cx} {cy-ry} C{cx+rx*k} {cy-ry} {cx+rx} {cy-ry*k} {cx+rx} {cy} Z",
        stroke="#580017",
        width=0.65,
        paint=paint,
    )


gradients["gold"] = {
    "kind": "linear",
    "coords": [100, 95, 370, 530],
    "stops": [
        [0, "#af8b4c"],
        [0.2, "#d7bd83"],
        [0.38, "#b08a49"],
        [0.56, "#d9bd81"],
        [0.8, "#b68c49"],
        [1, "#d3b578"],
    ],
}
trace(
    mask,
    None,
    "body",
    blur=0.95,
    threshold=110,
    stroke="#78532c",
    width=0.9,
    paint="gold",
)
body_paths = [p["d"] for p in paths]


# Nested contours form a continuous raised gold bevel along the full silhouette.
def inset(radius):
    high = Image.fromarray(mask.astype("uint8") * 255).resize(
        (1568, 2044), Image.Resampling.BICUBIC
    )
    high = high.filter(ImageFilter.MinFilter(int(radius * 4) * 2 + 1))
    return np.array(high.resize(im.size, Image.Resampling.LANCZOS)) >= 128


for radius, color, paint in [
    (0.5, "#cba96b", None),
    (1.1, "#ebd49a", None),
    (1.9, "#ac8344", None),
    (2.7, None, "gold"),
]:
    trace(
        inset(radius),
        color,
        "bevel" + str(radius),
        blur=0.45,
        threshold=116,
        paint=paint,
        speckle=9,
    )
interior = inset(2.3)
# Independent, smooth metallic folds follow each original leaf silhouette.
leaf_regions = [
    (
        "top",
        [
            (285, 89),
            (404, 89),
            (407, 174),
            (379, 175),
            (377, 220),
            (304, 236),
            (296, 201),
            (291, 180),
            (283, 174),
            (286, 138),
            (302, 143),
            (313, 137),
            (317, 125),
            (309, 107),
        ],
        [307, 131, 382, 163],
    ),
    (
        "middle",
        [
            (192, 231),
            (225, 224),
            (244, 245),
            (248, 301),
            (219, 346),
            (194, 352),
            (191, 324),
            (184, 305),
            (179, 288),
            (185, 275),
            (178, 258),
        ],
        [181, 271, 239, 283],
    ),
    (
        "lower",
        [(111, 320), (144, 321), (181, 333), (190, 382), (155, 387), (131, 364)],
        [139, 330, 158, 373],
    ),
    (
        "tail",
        [(116, 463), (144, 462), (158, 495), (144, 524), (119, 506)],
        [119, 477, 143, 491],
    ),
    ("terminal", [(435, 88), (480, 88), (480, 143), (441, 141)], [439, 100, 471, 123]),
    ("sprigA", [(90, 90), (137, 90), (143, 138), (91, 144)], [96, 102, 133, 127]),
    ("sprigB", [(90, 183), (132, 182), (143, 234), (90, 234)], [96, 198, 129, 222]),
    ("sprigC", [(90, 360), (134, 359), (143, 404), (90, 405)], [96, 371, 135, 391]),
]
for name, points, coords in leaf_regions:
    region = Image.new("L", im.size)
    ImageDraw.Draw(region).polygon([(x - 88, y - 84) for x, y in points], fill=255)
    gradients[name] = {
        "kind": "linear",
        "coords": coords,
        "stops": [
            [0, "#936b34"],
            [0.18, "#c9a262"],
            [0.39, "#e4ca92"],
            [0.51, "#a57a3e"],
            [0.7, "#d8b97d"],
            [0.88, "#b18a48"],
            [1, "#d6b77b"],
        ],
    }
    trace(
        interior & (np.array(region) > 0),
        None,
        "leaf-" + name,
        blur=0.95,
        threshold=110,
        paint=name,
        speckle=12,
    )
# Keep the substantial source folds and bevel glints, remove isolated pigment specks.
shadow = interior & (r < 151) & (g < 120) & (r > g * 1.22) & (b < g * 1.12)
trace(shadow, "#925a2c", "shadow", blur=0.9, threshold=128, speckle=29)
for p in paths:
    if p.get("fill") == "#925a2c":
        p["opacity"] = 0.6
highlight = interior & (r > 194) & (g > 159) & (b < r * 0.81) & (b > r * 0.43)
trace(highlight, "#ead39e", "highlight", blur=0.8, threshold=128, speckle=29)
# Tapered leaf folds follow the original, asymmetric acanthus rather than a template.
for d in [
    "M299 98 C327 111 335 139 332 168 C331 187 322 208 312 221 C325 204 336 184 336 166 C339 135 326 109 299 98 Z",
    "M330 133 C352 145 376 136 390 115 C373 133 352 138 330 133 Z",
    "M334 143 C350 156 372 164 391 157 C370 159 352 152 334 143 Z",
    "M334 154 C348 170 356 182 360 195 C359 176 347 160 334 154 Z",
    "M203 235 C219 260 216 300 201 337 C220 303 226 262 203 235 Z",
    "M126 331 C145 343 166 355 182 370 C166 352 145 338 126 331 Z",
    "M127 468 C134 482 137 496 141 507 C139 488 133 474 127 468 Z",
]:
    path(d, "#916130")
    paths[-1]["clip"] = "body"
# Berry locations/radii come from their separate red cores in the original.
red = (r > g * 1.8) & (b > g * 1.05) & (r > 25) & mask
for box in [(255, 101, 307, 173), (115, 243, 167, 321)]:
    x1, y1, x2, y2 = box
    local = red[y1 - 84 : y2 - 84, x1 - 88 : x2 - 88]
    seen = np.zeros(local.shape, bool)
    for yy, xx in zip(*np.where(local)):
        if seen[yy, xx]:
            continue
        q = deque([(yy, xx)])
        seen[yy, xx] = True
        pts = []
        while q:
            y, x = q.popleft()
            pts.append((y, x))
            for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                ny, nx = y + dy, x + dx
                if (
                    0 <= ny < local.shape[0]
                    and 0 <= nx < local.shape[1]
                    and local[ny, nx]
                    and not seen[ny, nx]
                ):
                    seen[ny, nx] = True
                    q.append((ny, nx))
        if len(pts) < 30:
            continue
        ys, xs = zip(*pts)
        rx = (max(xs) - min(xs) + 1) / 2
        ry = (max(ys) - min(ys) + 1) / 2
        cx = x1 + (min(xs) + max(xs)) / 2
        cy = y1 + (min(ys) + max(ys)) / 2
        key = f"grape{len(gradients)}"
        gradients[key] = {
            "kind": "radial",
            "coords": [cx - rx * 0.28, cy - ry * 0.32, 0, cx, cy, max(rx, ry)],
            "stops": [
                [0, "#c6637f"],
                [0.22, "#a51e4e"],
                [0.65, "#800024"],
                [1, "#4e0016"],
            ],
        }
        circle(cx, cy, rx, ry, key)
        path(
            f"M{cx-rx*.34} {cy-ry*.26} C{cx-rx*.50} {cy-ry*.58} {cx-rx*.05} {cy-ry*.72} {cx+rx*.11} {cy-ry*.48}",
            stroke="#e1b2ba",
            width=0.55,
        )
for cx, cy, rx, ry in [
    (116, 419, 7, 7),
    (101.5, 422, 7, 7),
    (128.5, 429.5, 7.5, 8),
    (113.5, 431.5, 5, 5),
    (107, 438.5, 7.5, 8),
    (122, 444, 7.3, 7.3),
    (112, 456, 8, 8.2),
]:
    key = f"grape{len(gradients)}"
    gradients[key] = {
        "kind": "radial",
        "coords": [cx - rx * 0.28, cy - ry * 0.32, 0, cx, cy, max(rx, ry)],
        "stops": [[0, "#c6637f"], [0.22, "#a51e4e"], [0.65, "#800024"], [1, "#4e0016"]],
    }
    circle(cx, cy, rx, ry, key)


# A broad, fully concentric medallion restores the original carved weight.
def circle_d(cx, cy, r, reverse=False):
    k = 0.5522847498 * r
    v = -1 if reverse else 1
    return f"M{cx+r} {cy} C{cx+r} {cy+k*v} {cx+k} {cy+r*v} {cx} {cy+r*v} C{cx-k} {cy+r*v} {cx-r} {cy+k*v} {cx-r} {cy} C{cx-r} {cy-k*v} {cx-k} {cy-r*v} {cx} {cy-r*v} C{cx+k} {cy-r*v} {cx+r} {cy-k*v} {cx+r} {cy} Z"


gradients["medallion"] = {
    "kind": "linear",
    "coords": [145, 132, 238, 217],
    "stops": [
        [0, "#b79555"],
        [0.2, "#eedba6"],
        [0.38, "#bb9655"],
        [0.55, "#8b632e"],
        [0.72, "#e0c78b"],
        [1, "#aa7f3c"],
    ],
}
path(
    circle_d(190.8, 174.2, 61.2) + circle_d(190.8, 174.2, 50.8, True),
    stroke="#89602e",
    width=0.7,
    paint="medallion",
)
path(circle_d(190.8, 174.2, 60.1), stroke="#ead7a5", width=0.75)
path(circle_d(190.8, 174.2, 52), stroke="#dfc38a", width=0.6)
# The original cross outline, including its rounded, lobed arm terminals.
y, x = np.indices(mask.shape)
cross = red & ((x + 88 - 191) ** 2 + (y + 84 - 175) ** 2 < 48**2)
gradients["cross"] = {
    "kind": "linear",
    "coords": [150, 132, 228, 216],
    "stops": [
        [0, "#ab2750"],
        [0.3, "#76001e"],
        [0.53, "#b12443"],
        [0.8, "#71001d"],
        [1, "#a52843"],
    ],
}
trace(
    cross,
    None,
    "cross",
    blur=0.65,
    threshold=118,
    stroke="#620020",
    width=0.6,
    paint="cross",
)
defs = [
    '<clipPath id="body">'
    + "".join(f'<path d="{d}"/>' for d in body_paths)
    + "</clipPath>"
]
for key, v in gradients.items():
    c = v["coords"]
    stops = "".join(
        f'<stop offset="{o}" stop-color="{color}"/>' for o, color in v["stops"]
    )
    if v["kind"] == "linear":
        defs.append(
            f'<linearGradient id="{key}" gradientUnits="userSpaceOnUse" x1="{c[0]}" y1="{c[1]}" x2="{c[2]}" y2="{c[3]}">{stops}</linearGradient>'
        )
    else:
        defs.append(
            f'<radialGradient id="{key}" gradientUnits="userSpaceOnUse" fx="{c[0]}" fy="{c[1]}" cx="{c[3]}" cy="{c[4]}" r="{c[5]}">{stops}</radialGradient>'
        )
markup = "\n".join(
    f'<path d="{p["d"]}" fill="'
    + ("url(#" + p["paint"] + ")" if p.get("paint") else p.get("fill", "none"))
    + f'" stroke="{p.get("stroke","none")}" stroke-width="{p.get("strokeWidth",0)}" stroke-linecap="round" stroke-linejoin="round" opacity="{p.get("opacity",1)}"'
    + (' clip-path="url(#body)"' if p.get("clip") else "")
    + "/>"
    for p in paths
)
svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1009 1559"><title>Hazzat illuminated corner vines</title><desc>Full original acanthus silhouettes, continuous gold bevels and shaded maroon grapes; all paths and shading are vector.</desc><defs>'
    + "".join(defs)
    + '</defs><g id="corner">'
    + markup
    + '</g><use href="#corner" transform="translate(1009 0) scale(-1 1)"/></svg>'
)
(root / "src/images/bookletCoverCorners.svg").write_text(svg, encoding="utf-8")
(root / "src/Booklets/BookletCoverCorners.json").write_text(
    json.dumps(
        {"paths": paths, "gradients": gradients, "clips": {"body": body_paths}},
        indent=2,
    )
    + "\n",
    encoding="utf-8",
)
print(
    len(paths),
    "paths",
    len(gradients),
    "native gradients; source silhouettes and connected bevels preserved",
)
