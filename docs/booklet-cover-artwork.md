# Illuminated booklet covers

The booklet uses the selected second (Eucharistic vine) direction from the public cover studies:
https://hazzat-coptic-cover-gallery.ampleheron11.chatgpt.site/arch-refined.html#eucharistic-vine

The upper ornaments in `bookletCoverCorners.svg` follow the original illuminated artwork's full acanthus silhouettes, broad scrolls, leaf lobes and connections. Nested vector contours create continuous gold bevels; smooth leaf folds, rounded maroon grapes and a broad concentric cross medallion retain the original's carved detail and weight. The artwork is mirrored from one shared group. There are no embedded bitmaps, blur filters or runtime tracing. No third-party icon image is included.

`scripts/build-booklet-corner-vines.py` regenerates the editable SVG and `BookletCoverCorners.json` together from the approved source contours and authored folds. Authoring requires Pillow, numpy and vtracer 0.6.15; these are not application dependencies. Intermediates stay under ignored `.audit/booklet-corner-artwork`. Run the script after changing the ornament.

`BookletCornerRenderer.ts` draws the JSON curves, clipping, axial gold shading and radial grape shading directly into the PDF. Native PDF shading resources are shared between both covers and survive print imposition. The renderer does not rasterize the SVG. Regression tests verify SVG/JSON synchronization, native shading, mirrored placement, balanced graphics state and image-free cover rendering. Fine leaf details are clipped to the connected silhouette so no accents float outside it.

Only the intentional limestone paper texture (`bookletLimestonePaper.png`) remains a raster background. The old `bookletIlluminatedBackground.png` is retained as a design reference and is no longer loaded by the generator. Rectangular borders, corner ornaments, PDF text, the official black Hazzat logo, both arch outlines, and the two-tone lower vine are drawn independently. English and Arabic seasonal titles remain selectable text. The matching back uses the same vector ornaments and frame, a small centered vine, and a discreet Hazzat.com signature.

Both covers use the same arch paths in `BookletCoverFrame.ts`, copied from the approved study. The gold curve is a 16-pixel normal inset of the maroon curve in the 1009-unit artwork coordinate system, with corresponding vertical and base insets. Geometry tests verify the spacing along the curved shoulder. The page size, content layout, footer numbering, padding and print imposition are unchanged.
