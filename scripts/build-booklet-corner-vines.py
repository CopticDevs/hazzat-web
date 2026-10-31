"""Author the booklet corner SVG and matching PDF paths. Standard Python only.

The approved illuminated artwork informs the arrangement. These are deliberately
redrawn curves, leaves, berries and rings, rather than a noisy bitmap trace.
"""
from pathlib import Path
import json
import math
import re

ROOT = Path(__file__).resolve().parents[1]
paths = []
INK, GOLD, LIGHT, CREAM = '#88612e', '#b18a48', '#d5b778', '#e3cc98'
RED, RED_LIGHT, RED_DARK = '#800018', '#ad3350', '#530015'


def path(d, fill=None, stroke=None, width=None, x=0, y=0, scale=1, angle=0):
    a = math.radians(angle)
    def point(m):
        px, py = float(m[1]) * scale, float(m[2]) * scale
        return f'{x + px * math.cos(a) - py * math.sin(a):.3f} {y + px * math.sin(a) + py * math.cos(a):.3f}'
    item = {'d': re.sub(r'(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)', point, d)}
    if fill: item['fill'] = fill
    if stroke: item.update(stroke=stroke, strokeWidth=width * scale)
    paths.append(item)


def circle(x, y, r, fill=None, stroke=None, width=1):
    k = .5522847498
    path(f'M1 0 C1 {k} {k} 1 0 1 C{-k} 1 -1 {k} -1 0 C-1 {-k} {-k} -1 0 -1 C{k} -1 1 {-k} 1 0 Z',
         fill, stroke, width / r, x, y, r)


def stem(d, width=6):
    path(d, stroke=INK, width=width)
    path(d, stroke=GOLD, width=width - 2)
    path(d, stroke=LIGHT, width=max(1, width * .24))


def leaf(x, y, scale=1, angle=0):
    def p(d, fill=None, stroke=None, width=1):
        path(d, fill, stroke, width, x, y, scale, angle)
    p('M0 0 C-7 14 -20 14 -31 16 C-22 28 -26 37 -36 42 C-24 45 -18 55 -29 65 C-15 66 -10 76 -19 86 C-7 87 -6 105 0 128 C7 111 18 105 17 91 C25 99 34 95 39 95 C28 83 40 70 27 59 C38 61 44 55 48 53 C33 50 35 34 22 26 C34 25 42 18 45 14 C23 19 15 13 0 0 Z', GOLD, INK, 1.2)
    p('M0 5 C-6 19 -16 21 -24 20 C-12 34 -12 43 -25 44 C-10 52 -9 61 -20 66 C-6 75 -3 91 0 119 C5 88 5 47 0 5 Z', LIGHT)
    p('M5 15 C14 25 23 29 29 29 C22 32 14 30 7 24 Z M6 39 C16 48 27 52 36 53 C25 55 16 52 7 48 Z M5 64 C16 78 25 87 30 91 C20 88 13 82 5 76 Z', INK)
    p('M0 6 C4 40 3 82 0 120 M1 35 C-6 29 -12 26 -20 24 M2 61 C-3 55 -10 52 -18 50 M2 85 C-2 79 -6 75 -11 73', stroke=INK, width=1.35)
    p('M3 16 C7 46 7 76 3 106', stroke=CREAM, width=1)


def sprig(x, y, scale=1, angle=0):
    # Three pointed vine leaves; no flower-shaped marks.
    for dx, rotation in [(-6, 44), (0, 0), (6, -44)]:
        path('M0 0 C-12 -6 -15 -17 -12 -30 C-3 -27 5 -17 0 0 Z', GOLD, INK, 1,
             x + dx * scale, y, scale, angle + rotation)
        path('M0 -2 C-3 -10 -7 -19 -11 -27', stroke=LIGHT, width=1.4,
             x=x + dx * scale, y=y, scale=scale, angle=angle + rotation)


def berry(x, y, r):
    circle(x, y, r, RED, RED_DARK, .8)
    path('M-4 2 C-6 -3 -2 -7 2 -5 C-1 -5 -3 -1 -4 2 Z', RED_LIGHT,
         x=x, y=y, scale=r / 8)


# Flowing branches retain the approved corner arrangement and clear arch area.
stem('M102 578 C114 553 88 539 100 513 C112 486 143 468 145 432 C148 385 111 363 105 329 C97 293 103 254 145 231')
stem('M104 535 C83 528 94 504 113 509 C133 515 118 535 110 523', 4)
stem('M143 430 C166 422 176 397 165 392 C154 387 152 402 162 402', 3)
stem('M107 344 C82 357 86 327 99 333', 4)
stem('M145 231 C176 223 193 242 192 265 C192 288 174 304 173 288 C173 279 184 279 184 285', 5)
stem('M211 229 C238 247 261 267 282 243 C300 222 275 201 255 212 C236 221 247 244 261 238 C269 235 264 225 259 229', 5)
stem('M283 242 C305 224 314 205 304 188 C299 178 289 186 296 192', 4)
stem('M131 133 C108 145 95 149 96 164 C98 183 120 181 119 169 C117 160 105 165 110 169', 4)
stem('M144 128 C143 113 159 111 157 101 C155 92 145 96 151 102', 4)
stem('M210 116 C243 104 258 89 280 94 C307 96 323 120 345 112 C368 105 382 112 392 106', 6)
stem('M345 115 C365 143 389 185 413 168 C432 155 406 135 417 113 C422 103 432 109 427 116', 5)
stem('M414 142 C421 126 416 111 407 106 C397 99 406 91 411 100', 3)
stem('M347 110 C364 105 372 97 365 92 C358 88 355 101 347 101', 3)
stem('M117 127 C121 130 125 133 131 133 M204 113 L210 116 M111 228 C120 233 132 237 145 231 M123 397 C124 401 130 407 138 405 M417 127 C433 139 451 145 458 132', 3)
stem('M278 94 C283 99 281 104 281 111 M145 231 C142 236 140 242 139 249 M145 432 C132 428 121 416 111 420', 3)

leaf(342, 111, .88, 16)
leaf(202, 232, .86, 1)
leaf(126, 328, .67, -57)
leaf(126, 466, .42, -14)
sprig(117, 127, .87, -20)
sprig(204, 113, .75, 12)
sprig(111, 228, .8, 24)
sprig(123, 397, .88, 15)
sprig(458, 132, .9, 50)

for x, y, r in [(281, 111, 8), (271, 128, 8), (290, 128, 8), (263, 145, 8), (281, 145, 8), (299, 145, 8), (272, 162, 8), (290, 162, 8), (281, 179, 8),
                (139, 249, 7), (130, 265, 8), (148, 265, 8), (121, 281, 8), (139, 281, 8), (157, 281, 8), (130, 297, 8), (148, 297, 8), (139, 313, 8),
                (111, 420, 6), (102, 434, 6), (119, 434, 6), (106, 450, 6), (123, 450, 6), (113, 466, 7)]:
    berry(x, y, r)

circle(191, 175, 58, stroke=INK, width=5)
circle(191, 175, 58, stroke=LIGHT, width=2.3)
# A symmetric flared Coptic cross, with gently curved arms and gold edging.
path('M0 -45 C2 -39 7 -36 13 -34 L8 -28 C3 -23 3 -13 4 -5 C13 -3 23 -3 28 -8 L34 -13 C36 -7 39 -2 45 0 C39 2 36 7 34 13 L28 8 C23 3 13 3 5 4 C3 13 3 23 8 28 L13 34 C7 36 2 39 0 45 C-2 39 -7 36 -13 34 L-8 28 C-3 23 -3 13 -4 5 C-13 3 -23 3 -28 8 L-34 13 C-36 7 -39 2 -45 0 C-39 -2 -36 -7 -34 -13 L-28 -8 C-23 -3 -13 -3 -5 -4 C-3 -13 -3 -23 -8 -28 L-13 -34 C-7 -36 -2 -39 0 -45 Z',
     RED, GOLD, 2.5, 191, 175, .87)

markup = '\n'.join('<path ' + ' '.join(f'{key}="{value}"' for key, value in {
    'd': p['d'], 'fill': p.get('fill', 'none'), 'stroke': p.get('stroke', 'none'),
    'stroke-width': p.get('strokeWidth', 0), 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
}.items()) + '/>' for p in paths)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1009 1559">
<title>Hazzat illuminated corner vines</title>
<desc>Redrawn gold acanthus leaves, maroon grapes and Coptic cross medallions. All artwork is vector.</desc>
<g>{markup}</g><g transform="translate(1009 0) scale(-1 1)">{markup}</g>
</svg>'''
(ROOT / 'src/images/bookletCoverCorners.svg').write_text(svg, encoding='utf-8')
(ROOT / 'src/Booklets/BookletCoverCorners.json').write_text(json.dumps(paths, indent=2) + '\n', encoding='utf-8')
print(f'Authored {len(paths)} paths per corner; no raster images or tracing dependencies.')
