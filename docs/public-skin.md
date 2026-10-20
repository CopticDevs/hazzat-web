# Public website layout and reader controls

The skin retains the parchment artwork, logo and Coptic/Hazzat font mappings. Layout no longer depends on the artwork's pixel dimensions.

## Styling boundaries

- App.css owns shared colors/spacing, the centered page shell, navigation, heading styles and keyboard focus. The footer participates in normal document flow.
- MainPaper.css owns the bordered content panel. Home.css uses a one-column grid, becoming main content plus sidebar at 62rem. Home/sidebar panels share gutters and do not use Bootstrap row negative margins.
- Bootstrap continues to own its component grids, modal and dropdown behavior. Site navigation uses site-specific classes instead of overriding Bootstrap's generic .nav selector.
- 62rem switches the site navigation/home layout; 37.5rem switches reading columns and phone format controls. Other Bootstrap components retain Bootstrap's grid breakpoints. There are no special 999/1000/1001px corrections.
- Content.css owns bounded notation scrolling, information columns, score containers and video aspect ratio. The existing text renderer retains its language-column layout and phone stacking.
- UserSettingsChanger.css owns the sticky reader-tools row and the settings form. It does not position controls over either edge of a hymn.
- print.css is imported last, removes site controls/decoration, and gives printable content the available page width. A small monochrome logo and hazzat.com attribution appear once at the start of each printed document. Reduced-motion preferences are handled centrally. Settings open/close without a fade transition.

## Reader behavior

- All format controls derive the same canonical ID order. All screen sizes retain visible icons and labels; phones use a compact wrapping grid of links. Dropdown triggers and site menus are native buttons with keyboard support.
- Notation is never arbitrarily word-broken. A direction-aware, keyboard-focusable local scroll region keeps long encoded note/lyric runs reachable, including Arabic at the maximum reader size. Coptic/Hazzat font files and encoded content are unchanged.
- Information languages stack on phones and use equal flexible columns when wider. Font size and text color follow the reader settings, including embedded content classes.
- Size/color preferences are validated and stored under hazzat.reader-settings. Blocked or malformed storage falls back to defaults without preventing reading. Language switches stay within the application and retain preferences.
- The active document language and direction update centrally. Logical spacing mirrors booklet nesting and help indentation. Internal links preserve query parameters, explicit language overrides, route-relative destinations and hashes.
- New routes start at the top. Browser Back/Forward restores remembered positions, retrying while asynchronously loaded content grows. User interaction stops restoration. Footer menus never scroll the document on mount; opening one reveals its links by scrolling the expanded menu into view.
- Duplicate MusicXML/hymn titles are suppressed only when identical; distinct score titles and subtitles remain visible.
- The disabled Contact Us navigation entry remains disabled. Direct visits show an unavailable notice instead of a form that claims to send messages while only logging them.

## Validation and PPE checklist

Run the existing website regression suite and production build. Interaction tests cover keyboard menu/format selection, language/query preservation, preference persistence and malformed storage, information typography, notation markup preservation, scroll restoration and contact-page behavior. Score tests cover title deduplication and the existing engraving/resize behavior. Migrated-content tests continue to compare all 84 retained services against the v4 backup when fixture paths are supplied.

For visual validation, inspect home, a long season title, a multilingual hymn, maximum-size Arabic vertical notation, a score, information, video, booklet selection, font illustrations and help tables. Check English and Arabic at 320, 390, 600, 768, 991/992, 1024, 1280/1281 and 1440px. Document scroll width should not exceed client width; oversized notation may scroll only within its own region. Verify settings close/focus restoration, radio keyboard navigation, footer expansion, browser Back and icon format selection.

Local visual checks use Chromium viewport emulation. Real iOS Safari/Android Chrome, Firefox/WebKit, 200%/400% browser zoom, mobile software keyboards and device safe areas still need PPE/device validation. Do not treat viewport emulation as proof of those browser/device combinations.

This PR targets develop for PPE. Promote to master separately after PPE validation. It does not modify AWS content, schemas, backend services or native applications.
