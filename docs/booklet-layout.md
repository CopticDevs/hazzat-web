# Booklet ornaments and published content

Booklet appearance controls are independent of reader preferences. Both ink choices default to black. Users can choose Black, Maroon, or Navy separately for text and Hazzat, or explicitly copy their website color choices. Text ink covers English, Coptic, and Arabic words, including words within notation. Hazzat ink covers regular and vertical notation in both writing directions. PDF ink uses fixed colors on white paper in either website theme; headings, ornaments, score images, and the existing comment styling retain their own appearance. Changing appearance invalidates the previous PDF preview.

Presets are apply actions, with no persistent pressed state. Applying one replaces the content selection with its complete available starting selection. The status compares the actual included variation IDs with those complete presets, showing “Custom selection” for individual changes and the preset name when restored exactly. Equivalent presets retain the most recently applied name. Color and layout changes do not change the content-selection status.

Every season cover includes “Hymns” (for example, “Kiahk Hymns”), with the corresponding Arabic wording. Existing Passion Week title shortening is preserved, and titles that already include “Hymns” are not duplicated.

Arabic booklets use “جدول المحتويات” for the contents heading. Contents rows place titles on the right, with hymn indentation from the right, followed by Arabic-Indic page numbers in the left column. Arabic headings use the embedded Arabic font, with Latin text and punctuation falling back to a compatible font; parentheses are mirrored for right-to-left placement.

`src/images/bookletServiceDivider.svg` retains the grapevine paths from the current `src/images/logo.svg`, below the logo's tagline. Its viewBox crops the ornament without altering those paths. The larger intrinsic dimensions support sharp PDF rasterization.

Each variation ends with the site's thin cross rule. At the end of a service, the grapevine replaces that final cross rule. Content pagination reserves room for the ornament, followed by padding before the next section title. The table of contents gets the same grapevine only when it fits on its final page. Text tables keep their vertical column separators and paragraph spacing without horizontal cell rules.

Comment paragraphs and HTML marked with EnglishComment, CopticComment, or ArabicComment use dark red, italic text at 90% of the normal font size. Styling survives wrapping and nested markup while retaining the language's font and direction.

Column dividers connect across the spacing between consecutive regular paragraphs. Comment rows have no dividers, and adjacent regular rows do not extend their dividers through comments.

Published v5 library records have a validated outer content type; their content payloads need not repeat `contentType`. Availability checks accept those payloads while continuing to reject empty content and explicitly mismatched inner types. The Annual Midnight Psalmody explanation of the Second Canticle includes both Hazzat assignments, including its Coptic-only alternative.
