# Illuminated booklet covers

The booklet uses the selected second (Eucharistic vine) direction from the public cover studies:
https://hazzat-coptic-cover-gallery.ampleheron11.chatgpt.site/arch-refined.html#eucharistic-vine

The upper ornaments have been redrawn as clean Bézier curves in `bookletCoverCorners.svg`: flowing gold branches, acanthus leaves with defined veins, individual maroon grapes and symmetric Coptic cross medallions. Both sides share identical mirrored geometry. This is actual SVG artwork, with no embedded bitmap, blur filter or image tracing at runtime. The original study informs the arrangement; no third-party icon image is included.

`scripts/build-booklet-corner-vines.py` uses only standard Python to regenerate the editable SVG and `BookletCoverCorners.json` from the same authored geometry. Run it after changing the ornament. The PDF draws the JSON paths directly, including their ink colors and stroke weights; it does not rasterize the SVG. Geometry synchronization and image-free PDF regression tests guard this.

Only the intentional limestone paper texture (`bookletLimestonePaper.png`) remains a raster background. The old `bookletIlluminatedBackground.png` is retained as a design reference and is no longer loaded by the generator. Rectangular borders, corner ornaments, PDF text, the official black Hazzat logo, both arch outlines, and the two-tone lower vine are drawn independently. English and Arabic seasonal titles remain selectable text. The matching back uses the same vector ornaments and frame, a small centered vine, and a discreet Hazzat.com signature.

Both covers use the same arch paths in `BookletCoverFrame.ts`, copied from the approved study. The gold curve is a 16-pixel normal inset of the maroon curve in the 1009-unit artwork coordinate system, with corresponding vertical and base insets. Geometry tests verify the spacing along the curved shoulder. The page size, content layout, footer numbering, padding and print imposition are unchanged.
