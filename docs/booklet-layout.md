# Booklet ornaments and published content

Booklet colors and content languages start with the user's saved website preferences. Booklet overrides remain local to the builder; the copy actions restore the current website choices. Users can choose Black, Maroon, or Navy separately for text and Hazzat. Text ink covers English, Coptic, and Arabic words, including words within notation. Hazzat ink covers regular and vertical notation in both writing directions. PDF ink uses fixed colors on white paper in either website theme; headings, ornaments, score images, and the existing comment styling retain their own appearance. Changing appearance or languages invalidates the previous PDF preview.

The website Settings panel saves English, Coptic, and Arabic choices on this device. Text tables reflow to the remaining languages, notation blocks and language-specific media are filtered, and an empty-language result explains how to change the settings. Booklet filtering happens before format availability, selection review, pagination, and contents generation. Missing language content is omitted automatically. Audio and lyrics embedded within musical scores remain as published. Original shared content is never modified.

Generated pages omit format headings and markers, including format suffixes in the contents. Hymn and variation titles remain. Before placing a service/hymn heading, the renderer measures its wrapped height together with the opening content and ending-ornament reservation. Variation titles receive the same treatment. Long opening paragraphs can flow naturally across pages. Logical page margins are 24 pt at each side, 36 pt at the top, and 30 pt at the bottom, in both device and folded-print layouts.

Presets are apply actions, with no persistent pressed state. Applying one replaces the content selection with its complete available starting selection. The status compares the actual included variation IDs with those complete presets, showing “Custom selection” for individual changes and the preset name when restored exactly. Equivalent presets retain the most recently applied name. Color and layout changes do not change the content-selection status.

Every season cover includes “Hymns” (for example, “Kiahk Hymns”), with the corresponding Arabic wording. Existing Passion Week title shortening is preserved, and titles that already include “Hymns” are not duplicated.

Arabic booklets use “جدول المحتويات” for the contents heading. Contents rows place titles on the right, with hymn indentation from the right, followed by Arabic-Indic page numbers in the left column. Arabic headings use the embedded Arabic font, with Latin text and punctuation falling back to a compatible font; parentheses are mirrored for right-to-left placement.

`src/images/bookletServiceDivider.svg` retains the grapevine paths from the current `src/images/logo.svg`, below the logo's tagline. Its viewBox crops the ornament without altering those paths. The larger intrinsic dimensions support sharp PDF rasterization.

Each variation ends with the site's thin cross rule. At the end of a service, the grapevine replaces that final cross rule. Content pagination reserves room for the ornament, followed by padding before the next section title. The table of contents gets the same grapevine only when it fits on its final page. Text tables keep their vertical column separators and paragraph spacing without horizontal cell rules.

Comment paragraphs and HTML marked with EnglishComment, CopticComment, or ArabicComment use dark red, italic text at 90% of the normal font size. Styling survives wrapping and nested markup while retaining the language's font and direction.

Text tables use the languages present in each paragraph, matching the reader's changing language groups. A single-language verse uses the full available width; later multilingual verses restore their columns in English, Coptic, Arabic order. Line height and Arabic alignment follow each row's languages. Column dividers connect across the spacing only between consecutive regular paragraphs with the same languages. Comment rows have no dividers, and dividers stop before comments or a language-group change.

Published v5 library records have a validated outer content type; their content payloads need not repeat `contentType`. Availability checks accept those payloads while continuing to reject empty content and explicitly mismatched inner types. The Annual Midnight Psalmody explanation of the Second Canticle includes both Hazzat assignments, including its Coptic-only alternative.
