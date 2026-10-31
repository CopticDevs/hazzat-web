"""Build faithful SVG/PDF corner ornaments from the approved illuminated source.

Authoring only: Pillow, numpy and vtracer==0.6.15. No runtime tracing or raster
fallback. Smooth source contours retain the full acanthus silhouettes and joints;
flat antique-gold illustration uses botanical linework and restrained crease washes.
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
# Fill only tiny enclosed pigment gaps; keep the larger natural scroll counters.
seen = np.zeros(mask.shape, dtype=bool)
for start_y, start_x in zip(*np.where(~mask)):
    if seen[start_y, start_x]:
        continue
    queue = deque([(start_y, start_x)])
    seen[start_y, start_x] = True
    component = []
    touches_edge = False
    while queue:
        y, x = queue.popleft()
        component.append((y, x))
        touches_edge |= y in (0, mask.shape[0] - 1) or x in (0, mask.shape[1] - 1)
        for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            ny, nx = y + dy, x + dx
            if (
                0 <= ny < mask.shape[0]
                and 0 <= nx < mask.shape[1]
                and not mask[ny, nx]
                and not seen[ny, nx]
            ):
                seen[ny, nx] = True
                queue.append((ny, nx))
    if not touches_edge and len(component) <= 20:
        for y, x in component:
            mask[y, x] = True
# Remove the raster-derived medallion and cross entirely. Their replacements
# below are exact concentric circles and a cross with four identical quarters.
yy, xx = np.indices(mask.shape)
mask[((xx + 88 - 191) ** 2 + (yy + 84 - 175) ** 2) < 63**2] = False
# Small isolated paint remnants are not part of the connected branchwork.
seen = np.zeros(mask.shape, dtype=bool)
for start_y, start_x in zip(*np.where(mask)):
    if seen[start_y, start_x]:
        continue
    queue = deque([(start_y, start_x)])
    seen[start_y, start_x] = True
    component = []
    while queue:
        y, x = queue.popleft()
        component.append((y, x))
        for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            ny, nx = y + dy, x + dx
            if (
                0 <= ny < mask.shape[0]
                and 0 <= nx < mask.shape[1]
                and mask[ny, nx]
                and not seen[ny, nx]
            ):
                seen[ny, nx] = True
                queue.append((ny, nx))
    if len(component) < 36:
        for y, x in component:
            mask[y, x] = False
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


# Muted, monotonic tones model a matte illuminated surface; no bright bands.
gradients["gold"] = {
    "kind": "linear",
    "coords": [100, 95, 370, 530],
    "stops": [[0, "#98794a"], [1, "#927344"]],
}
trace(
    mask,
    None,
    "body",
    blur=0.95,
    threshold=110,
    stroke="#3b2417",
    width=0.9,
    paint="gold",
)
body_paths = [p["d"] for p in paths]


# Dark ink follows the original scroll spines and stalk junctions. These are
# structural centerlines, not offset highlight/shadow pairs or relief edges.
for d, width in [
    ("M140 117 C133 111 131 101 138 97 C144 93 151 98 147 102", 1.2),
    ("M118 129 C118 142 116 154 111 167", 1.25),
    ("M112 166 C108 154 97 146 94 151 C88 157 92 165 100 164 C104 163 103 159 100 158", 1.1),
    ("M334 163 C356 174 388 182 407 159 C422 139 414 119 414 108 C408 102 407 96 413 97 C417 99 416 103 414 104", 1.35),
    ("M416 121 C427 103 447 92 465 102", 1.15),
    ("M284 252 C299 242 308 224 304 209 C302 201 296 195 297 189 C299 185 302 189 300 192", 1.35),
    ("M243 220 C231 199 253 188 272 195 C289 201 288 220 275 225 C264 229 253 220 259 212 C263 207 270 210 269 216", 1.25),
    ("M141 232 C111 236 91 255 89 276 C88 300 100 322 125 330", 1.35),
    ("M94 272 C93 283 100 291 107 286", 1),
    ("M211 293 C203 305 180 307 172 296 C164 285 175 277 181 283 C186 286 184 292 179 292", 1.2),
    ("M125 350 C138 375 151 398 145 422 C137 449 110 466 105 487 C91 515 100 530 95 551 C92 563 89 575 89 580", 1.4),
    ("M109 470 C117 467 124 468 128 469", 1.1),
    ("M145 399 C149 408 166 412 166 401 C166 398 163 397 162 400", 1.05),
    ("M103 521 C110 536 123 540 126 528 C128 522 119 521 118 526 C117 529 122 531 123 527", 1.15),
]:
    path(d, stroke="#3b2417", width=width)
    paths[-1].update(clip="body", opacity=0.95, role="vine-contour")


# Every vein starts on its leaf's midrib and follows a lobe. The secondary
# branches taper toward the edge; there are no sampled pigment marks or glints.
vein_guides = []


def curve_samples(d):
    tokens = re.findall(r"[MC]|-?\d+(?:\.\d+)?", d)
    current = None
    result = []
    i = 0
    while i < len(tokens):
        cmd = tokens[i]
        i += 1
        if cmd == "M":
            current = np.array(list(map(float, tokens[i : i + 2])))
            i += 2
        elif cmd == "C":
            controls = np.array(list(map(float, tokens[i : i + 6]))).reshape((3, 2))
            i += 6
            for t in np.linspace(0, 1, 151):
                q = 1 - t
                result.append(
                    q**3 * current
                    + 3 * q * q * t * controls[0]
                    + 3 * q * t * t * controls[1]
                    + t**3 * controls[2]
                )
            current = controls[2]
    return result


def vein(d, width=0.72, primary=False):
    # Snap secondary origins to the nearest point on an existing parent vein.
    # This preserves the authored lobe directions without micro-gaps at joins.
    global vein_guides
    if primary:
        vein_guides = []
    start = np.array(
        list(map(float, re.match(r"M(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)", d).groups()))
    )
    if vein_guides:
        candidates = np.array(vein_guides)
        distances = np.sum((candidates - start) ** 2, axis=1)
        closest = candidates[np.argmin(distances)]
        if np.min(distances) < 3.5**2:
            d = re.sub(
                r"^M-?\d+(?:\.\d+)? -?\d+(?:\.\d+)?",
                f"M{closest[0]:.3f} {closest[1]:.3f}",
                d,
            )
    vein_guides.extend(curve_samples(d))
    path(d, stroke="#3b2417", width=width)
    paths[-1].update(clip="body", opacity=1 if primary else 0.95, role="leaf-vein")


# Asymmetric upper acanthus: petiole at upper left, long terminal lobe below.
vein("M302 102 C324 118 337 142 333 169 C330 190 322 207 312 220", 1.55, True)
for d, w in [
    ("M328 131 C344 139 368 133 386 118", 0.95),
    ("M333 147 C351 157 371 161 388 155", 0.9),
    ("M334 161 C345 171 353 183 358 192", 0.85),
    ("M331 176 C325 185 320 196 317 207", 0.65),
    ("M331 151 C323 160 315 166 305 169", 0.8),
    ("M328 184 C321 187 317 192 313 198", 0.65),
    ("M350 135 C356 127 366 121 376 117", 0.52),
    ("M364 157 C371 152 377 150 384 149", 0.5),
    ("M344 172 C348 174 352 178 356 184", 0.5),
    ("M322 160 C318 159 313 159 310 161", 0.5),
]:
    vein(d, w)

# Descending acanthus: one continuous midrib and alternating lateral veins.
vein("M201 235 C217 255 220 282 211 307 C206 321 201 333 198 340", 1.45, True)
for d, w in [
    ("M212 259 C220 261 228 258 234 252", 0.8),
    ("M216 276 C224 281 233 279 238 273", 0.8),
    ("M214 292 C222 296 227 302 228 308", 0.75),
    ("M209 312 C213 316 214 321 213 325", 0.6),
    ("M210 255 C203 258 197 256 193 251", 0.75),
    ("M216 273 C207 273 200 270 196 266", 0.7),
    ("M215 289 C205 292 198 296 193 301", 0.75),
    ("M225 280 C228 284 231 287 234 288", 0.45),
    ("M205 293 C203 291 200 289 197 288", 0.45),
]:
    vein(d, w)

# Low diagonal and tail leaves, each with its own petiole and branching axis.
vein("M125 330 C144 340 165 356 180 370", 1.15, True)
for d in [
    "M141 340 C150 338 161 337 171 338",
    "M151 348 C159 348 170 348 178 350",
    "M141 340 C137 345 134 348 132 351",
    "M156 351 C157 358 160 363 165 367",
]:
    vein(d, 0.65)
vein("M128 469 C135 481 138 495 141 508", 1.0, True)
for d in [
    "M134 481 C139 478 143 478 146 479",
    "M137 491 C142 490 146 491 148 494",
    "M134 483 C130 482 127 483 124 486",
]:
    vein(d, 0.55)

# Small palmate leaves fan out from their actual stalk junctions.
for d in [
    "M116 129 C111 119 105 108 101 99",
    "M114 125 C119 116 123 108 128 103",
    "M113 123 C106 122 101 119 98 116",
    "M204 112 C203 104 204 96 204 91",
    "M204 106 C198 101 195 98 194 95",
    "M204 104 C209 100 212 97 214 95",
    "M116 221 C111 212 109 204 109 198",
    "M112 214 C104 213 101 211 99 208",
    "M112 211 C117 208 122 205 125 201",
    "M124 394 C117 387 113 378 111 371",
    "M118 386 C111 385 105 384 102 381",
    "M115 381 C121 377 126 376 130 376",
    "M442 127 C454 122 462 112 466 102",
    "M452 120 C449 112 451 106 453 102",
    "M459 114 C465 116 470 117 473 117",
]:
    vein(d, 0.68)

# Restrained fold shadows sit beside the midrib rather than forming stripes.
for d in [
    "M303 104 C326 123 337 148 333 172 C330 192 321 209 312 220 C326 204 339 183 339 162 C338 137 325 115 303 104 Z",
    "M202 237 C218 259 219 285 211 307 C206 324 201 334 198 340 C212 325 225 296 223 276 C222 259 214 245 202 237 Z",
    "M126 331 C146 342 165 357 180 370 C165 354 147 338 126 331 Z",
]:
    path(d, fill="#6e542f")
    paths[-1].update(clip="body", opacity=0.15)

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
                [0, "#90304a"],
                [0.65, "#86233d"],
                [1, "#701a30"],
            ],
        }
        circle(cx, cy, rx, ry, key)
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
        "stops": [[0, "#90304a"], [0.65, "#86233d"], [1, "#701a30"]],
    }
    circle(cx, cy, rx, ry, key)


# A broad, fully concentric medallion restores the original carved weight.
def circle_d(cx, cy, r, reverse=False):
    k = 0.5522847498 * r
    v = -1 if reverse else 1
    return f"M{cx+r} {cy} C{cx+r} {cy+k*v} {cx+k} {cy+r*v} {cx} {cy+r*v} C{cx-k} {cy+r*v} {cx-r} {cy+k*v} {cx-r} {cy} C{cx-r} {cy-k*v} {cx-k} {cy-r*v} {cx} {cy-r*v} C{cx+k} {cy-r*v} {cx+r} {cy-k*v} {cx+r} {cy} Z"


# One matte ring of constant width: both boundaries use the exact same
# center and four cubic circle quadrants. No traced edge or bevel survives.
CX, CY = 191, 175
path(
    circle_d(CX, CY, 63) + circle_d(CX, CY, 54.5, True),
    fill="#927344",
    stroke="#3b2417",
    width=0.85,
)

paths[-1]["role"] = "medallion"

# A Coptic cross assembled from one smooth quarter, rotated exactly four
# times. Handles are tangent at each cardinal join, producing crisp symmetry.
quarter = [
    [(3, -44), (3, -38), (7, -36)],
    [(10, -34), (15, -36), (15, -33)],
    [(15, -30), (10, -29), (8, -25)],
    [(5, -20), (5, -14), (5, -9)],
    [(5, -6), (6, -5), (9, -5)],
    [(14, -5), (20, -5), (25, -8)],
    [(29, -10), (30, -15), (33, -15)],
    [(36, -15), (34, -10), (36, -7)],
    [(38, -3), (44, -3), (44, 0)],
]


def turn(x, y, n):
    for _ in range(n):
        x, y = -y, x
    return CX + x * 0.95, CY + y * 0.95


cross_d = f"M{CX} {CY-44*.95}"
for n in range(4):
    for segment in quarter:
        cross_d += " C" + " ".join(
            f"{x:.3f} {y:.3f}" for x, y in (turn(x, y, n) for x, y in segment)
        )
cross_d += " Z"
path(cross_d, fill="#800018", stroke="#927344", width=1.5)

paths[-1]["role"] = "cross"

# Keep a fine gold keyline, then add dark ink around and through the cross.
# The center strokes are flat ornament, without offset lighting or relief.
path(cross_d, fill="#800018", stroke="#3b2417", width=0.7)
paths[-1]["role"] = "cross-outline"
for d in ["M191 138 C191 161 191 189 191 212", "M154 175 C177 175 205 175 228 175"]:
    path(d, stroke="#330b16", width=0.95)
    paths[-1].update(role="cross-line", opacity=0.95)

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
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1009 1559"><title>Hazzat illuminated corner vines</title><desc>Full acanthus silhouettes with botanical veins, a symmetric Coptic cross, exact concentric medallion and flat illustrated shading; all artwork is vector.</desc><defs>'
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
    "flat illustrated paths; precise cross and concentric medallion",
)
