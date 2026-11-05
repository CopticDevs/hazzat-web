# Eucharistic vine booklet covers

`src/images/bookletCoverCorners.svg` is the approved detailed matte redraw of design 2, The Eucharistic Vine. It is the exact selected SVG: 1122 x 1402 source cells, 141,924 colored paths and 450,966 horizontal runs. Its foliage, dark vein lines, crosses, gold, maroon grapes and original transparency are retained. The source contains no embedded image.

This SVG preserves a pixel grid; it is not a smooth-curve reconstruction and adds no resolution. At its 152-point cover width, it provides approximately 531 source pixels per printed inch. Both front and back use the same artwork, mirrored at the opposite corner. Placement leaves the foliage outside the two aligned arches and inside the rectangular border. Logos, seasonal titles, lower grapevines and Hazzat.com page-number footers remain separate.

## Lossless PDF representation

Painting hundreds of thousands of tiny paths independently creates antialiasing seams in PDF viewers and changes the apparent colors. The compiler instead extracts the SVG's existing RGB and alpha cell values directly into compressed PDF image/soft-mask data. There is no tracing, resizing, recoloring, browser SVG rendering or palette reduction. The SVG remains the canonical authoring source; the PDF uses a lossless RGB image with an eight-bit alpha mask. Native vector outlines still draw the borders, arches and black logo.

Run `python scripts/compile-booklet-cover-svg.py` after changing the SVG. Only Python's standard library is needed. Commit `bookletCoverCorner.bin` and `BookletCornerAsset.json` alongside the SVG. `--check` verifies the generated files without writing them. The manifest records source, compiled-data and reconstructed-RGBA SHA-256 hashes.

The 1.4 MB compiled asset downloads on the first PDF generation, is shared by concurrent requests, and is reused for later booklets. Failed or truncated downloads can be retried. Each PDF document embeds one color image and one soft mask, reused for all four corner placements. Folded-print generation imports all logical pages in one batch so the shared artwork and fonts are retained once across sheets.

Regression checks cover asset hashes, exact source RGBA recovery, unchanged PDF color/alpha bytes, mirrored placement, separation from the arch, resource reuse, lazy loading and retry behavior. Browser QA covers English, Arabic and folded-print booklets. In the PDF proof, the SVG-derived image matched the approved PNG reference on more than 99.96 percent of pixels; remaining differences were one RGB level from transparency rounding.


## Matching center vine

The approved less-leafy center ornament is `src/images/bookletCoverCenterVine.svg` (2138 x 736 cells). It uses two smaller muted antique-gold leaves and a central maroon grape cluster, matching the arches’ dark ink contours and botanical veins. Both covers reuse this ornament at 138 points wide, approximately 1115 source pixels per printed inch. The original black-and-white logo and interior dividers are unchanged.

Like the corner master, this is a pixel-preserving SVG with no embedded bitmap. It retains the approved drawing exactly; it is not a smooth-curve tracing and does not add resolution. Its 1.1 MB packed color/alpha data loads only for PDF generation, once across exports, with one image shared between both covers and print sheets.

The approved PNG preview is `docs/pr/booklet-eucharistic-svg/center-vine.png`. To recreate the SVG, run `python scripts/convert-booklet-vine-to-svg.py docs/pr/booklet-eucharistic-svg/center-vine.png` (requires Pillow). Then run `python scripts/compile-booklet-cover-svg.py`, which compiles and verifies both ornaments. Commit both SVGs, binary streams and manifests. `--check` checks both without writing.
