# Booklet ornaments and published content

Every season cover includes “Hymns” (for example, “Kiahk Hymns”), with the corresponding Arabic wording. Existing Passion Week title shortening is preserved, and titles that already include “Hymns” are not duplicated.

Arabic booklets use “جدول المحتويات” for the contents heading. Arabic headings use the embedded Arabic font, with Latin text and punctuation falling back to a compatible font; parentheses are mirrored for right-to-left placement.

`src/images/bookletServiceDivider.svg` retains the grapevine paths from the current `src/images/logo.svg`, below the logo's tagline. Its viewBox crops the ornament without altering those paths. The larger intrinsic dimensions support sharp PDF rasterization.

Each variation ends with the site's thin cross rule. At the end of a service, the grapevine replaces that final cross rule. Content pagination reserves room for the ornament, followed by padding before the next section title. The table of contents gets the same grapevine only when it fits on its final page. Text tables keep their vertical column separators and paragraph spacing without horizontal cell rules.

Published v5 library records have a validated outer content type; their content payloads need not repeat `contentType`. Availability checks accept those payloads while continuing to reject empty content and explicitly mismatched inner types. The Annual Midnight Psalmody explanation of the Second Canticle includes both Hazzat assignments, including its Coptic-only alternative.
