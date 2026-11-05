"""Encode an approved RGBA vine as SVG pixel cells without tracing or recoloring.

Usage: python scripts/convert-booklet-vine-to-svg.py path/to/approved.png
Requires Pillow only for reading the PNG. The SVG is the committed master.
"""
from pathlib import Path
from collections import defaultdict
from PIL import Image
import sys

image = Image.open(sys.argv[1]).convert("RGBA")
width, height = image.size
pixels = image.load()
paths = defaultdict(list)
for y in range(height):
    x = 0
    while x < width:
        color = pixels[x, y]
        end = x + 1
        while end < width and pixels[end, y] == color:
            end += 1
        if color[3]:
            length = end - x
            paths[color].append(f"M{x} {y}h{length}v1h-{length}z")
        x = end
output = Path(__file__).resolve().parents[1] / "src/images/bookletCoverCenterVine.svg"
with output.open("w", encoding="utf8", newline="\n") as file:
    file.write(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">\n')
    file.write('<title>Approved gold and maroon Eucharistic center vine</title>\n')
    file.write('<desc>Original colored pixel cells, retaining all visible RGB and alpha values. No embedded bitmap, palette reduction, or tracing.</desc>\n<g shape-rendering="crispEdges">\n')
    for (r, g, b, a), cells in sorted(paths.items()):
        alpha = f' fill-opacity="{a / 255:.10f}"' if a != 255 else ""
        file.write(f'<path fill="#{r:02x}{g:02x}{b:02x}"{alpha} d="{"".join(cells)}"/>\n')
    file.write('</g>\n</svg>\n')
print(f"SVG: {width} x {height}, {len(paths):,} colors with original transparency")
