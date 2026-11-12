# Application analytics

Implements [#325](https://github.com/CopticDevs/hazzat-web/issues/325) and
[#327](https://github.com/CopticDevs/hazzat-web/issues/327), with the owner's requested
separate entity, format and language-combination event names, plus deliberate theme changes,
privacy-safe search results/selections and actual SoundCloud audio starts. Booklet generation remains
[a separate event](booklet-analytics.md); Search Console setup is separate work in #326.

## Fixed event names

The complete application taxonomy has 29 names: the 18 entity/format/combination names below,
`change_content_languages`, four theme/search/audio names, `booklet_generated`, and five retained
names (`change_nav_lang`, `change_text_color`, `change_hazzat_color`, `change_text_size`, `button_click`).

There is **no generic `content_view` event**. A normal individual-hymn reader visit emits
three complementary events, for example `hymn_view`, `text_view`, and
`content_languages_en_cop_ar_view`. Each answers a different question about that visit.
**Never sum the three families to count visits.**

### Primary entity views

| Event | Meaning |
| --- | --- |
| `season_view` | An individual season landing has loaded its validated season/service catalog. |
| `service_view` | A service landing/hymn list is loaded, or actual content is available in a service-wide reader. |
| `hymn_view` | Actual content is available in an individual hymn's selected/default reader format. |

A season landing does not emit service/hymn views for its nested lists. A service-wide reader
emits one `service_view`, never one `hymn_view` per child. A list of hymn links is not hymn usage.

### Format views

| Route/catalog ID | `content_format` | Event |
| --- | --- | --- |
| `1` | `text` | `text_view` |
| `2` | `hazzat` | `hazzat_view` |
| `3` | `vertical_hazzat` | `vertical_hazzat_view` |
| `4` | `musical_notes` | `musical_notes_view` |
| `5` | `audio` | `audio_view` |
| `6` | `video` | `video_view` |
| `7` | `information` | `information_view` |

One format event is sent when content is actually displayed on a hymn or service reader.
The default format counts too. Format links/clicks alone do not. **All Formats** is a booklet
preset, not an eighth reader format. These events include `view_type` so service-wide format
usage can be separated from individual-hymn usage.

### Language-combination usage

| `content_languages` | Meaning | Event |
| --- | --- | --- |
| `en` | English only | `content_languages_en_view` |
| `cop` | Coptic only | `content_languages_cop_view` |
| `ar` | Arabic only | `content_languages_ar_view` |
| `en+cop` | English and Coptic | `content_languages_en_cop_view` |
| `en+ar` | English and Arabic | `content_languages_en_ar_view` |
| `cop+ar` | Coptic and Arabic | `content_languages_cop_ar_view` |
| `en+cop+ar` | All three; the default | `content_languages_en_cop_ar_view` |
| `none` | No selected languages | `content_languages_none_view` |

One combination event records the first active normalized reader preference per navigation,
including defaults and saved choices. Its value is ordered English/Coptic/Arabic regardless
of input order, duplicates or casing. Missing translations do not change the preference:
`en+ar` remains `en+ar` even if a hymn only has English. Language-neutral audio/score content
can remain available with `none`; this does not imply multilingual text is present.

The combination family includes a filtered-empty reader state when real source content exists
but no selected language matches. It sends `content_state=no_selected_language_content`, not
a successful entity/format view. Completely absent format data and failed loads count nowhere.

### Deliberate language changes

`change_content_languages` remains separate from combination usage. It sends:

- `event_category=Customization`
- `previous_content_languages`: previous normalized combination
- `content_languages`: new normalized combination

It fires once per actual deliberate change, including to/from `none`. Initial defaults,
restored settings, cross-tab synchronization, duplicate calls and equivalent/reordered values
do not count as manual changes. This is the general reader setting, not the booklet builder's
separate language controls. Existing `change_nav_lang` still measures the English/Arabic interface.

## Theme, search and actual audio starts

| Event | Meaning / trigger | Parameters |
| --- | --- | --- |
| `change_theme` | One deliberate effective light/dark transition. Initial/default/restored themes, OS changes, cross-tab synchronization and no-op selections are silent. | `event_category=Customization`, `previous_theme` and `theme` (each `light` or `dark`) |
| `search_results` | One successful completed current debounced search. Title-only interim results during a full-text search do not count separately. Empty successful searches count; failed/stale/unmounted results do not. | `event_category=Engagement`, `search_mode=titles` or `titles_and_text`, numeric `result_count`, `result_status=results` or `empty` |
| `search_result_select` | Actual activation of a season result button or a hymn's season/service reference link. A render, page change or merely seeing a result is not a selection. | `event_category=Engagement`, `result_type=season` or `hymn`, `season_id`; hymn references also send `service_id` and `hymn_id` |
| `audio_start` | The first actual SoundCloud PLAY callback for a recording in the current reader navigation. Loading/READY/error is not playback. | `event_category=Engagement`, `audio_provider=soundcloud`, `view_type`, `season_id`, `service_id` and `hymn_id` when applicable, `variation_id`, `content_format=audio`, `content_languages` at the first play |

Search queries, query lengths, titles, snippets, result text and errors are never added to these
payloads. The existing 300 ms debounce settles a search; pagination/rerenders do not send another
`search_results`. A later search, mode/interface-language change or successful retry can produce a
new completed result event. Selections count actual activations, including links in interim title
results. Result count is the complete result-list size, not the current ten-result page size.

Audio observation uses the [official SoundCloud HTML5 Widget API](https://developers.soundcloud.com/docs/api/html5-widget)
from `https://w.soundcloud.com/player/api.js`. It binds `SC.Widget.Events.PLAY` to the specific iframe,
without controlling playback or enabling autoplay. One shared, bounded SDK request serves active
recordings; blocked/missing/failed SDK observation leaves the iframe usable and emits no fabricated
start. Cleanup unbinds handlers and rejects stale callbacks. No new tracking collector is introduced.

A recording counts at most once per normalized pathname visit. Resume/duplicate PLAY callbacks,
rerenders and interface-language/feed remounts on the same path do not add starts. Back/Forward,
leaving and returning, or reload starts a new visit. Separate recordings can each count once.
Standalone/local-preview players have no catalog context and are not instrumented. Service-wide
players identify the actual played child hymn/variation with `view_type=service`, without adding a
child `hymn_view`. No URLs, titles, audio contents, duration or playback position are sent.

`audio_view` and `audio_start` answer different questions: a displayed player surface versus a
recording that actually began playing. Starts can exceed audio views when several recordings are
played in one reader visit; do not interpret their unscoped ratio as a conversion percentage.
Video playback, pause/progress/completion and PDF-download events are not part of this change.

## Parameters and direct drilldown

All entity, format and combination events send `event_category=Engagement` and these
applicable parameters. Event names are selected from explicit fixed maps, never catalog IDs
or user input.

| Parameter | Values / scope |
| --- | --- |
| `view_type` | `season`, `service`, `hymn`; also identifies the scope of format/combination events |
| `season_id` | Stable validated public catalog ID on all views |
| `service_id` | Stable validated public ID on service and hymn views |
| `hymn_id` | Stable validated public ID on individual hymn views only |
| `content_format` | One of the seven canonical values; reader events only |
| `content_languages` | One of the eight active normalized combinations; reader events only |
| `content_state` | `available` on successful entity/format reader views; combination usage can also be `no_selected_language_content` |

**Every `hymn_view` includes `hymn_id`, `service_id`, `season_id`, `content_format`,
`content_languages`, and `content_state=available` on that same event.** It is never emitted
from metadata alone before its dimensions are known. Overall hymn counts and their text/Hazzat
or language breakdowns therefore use `hymn_view` directly, with no joins to the companion events.

Season/service landings omit reader parameters. Their absence distinguishes direct landing
counts from deeper reader activity. Reader entity/format events have identical dimensions
for the same successful visit. IDs retained on deeper events also support activity within a
season/service, but summing all event families would triple count normal reader visits.

## Exactly what counts

- A navigation starts on a content-pathname change, or a fresh mount after reload/leaving the
  reader. Back/Forward and explicit format changes count again. Path case/trailing slashes
  are normalized; query/hash-only changes do not begin another view.
- Each navigation has independent once-only entity, format and combination counters shared
  by all nested components. StrictMode effect replay, rerenders, repeated callbacks,
  interface-language reloads and theme/font changes cannot duplicate a family.
- A normal loaded reader emits one primary entity event, one matching format event and one
  language-combination event. A service reader counts once regardless of hymns/variations.
  Its first available section is sufficient; this does not claim all sections were read.
- Text/notation/information count after the loaded section is committed. Musical notes wait
  for successful engraving at visible width. Audio/video count the displayed embedded player
  surface, not play/pause/progress/completion or proof of an externally playable stream.
  Cross-origin failures or invalid external-media content are not observable playback metrics.
- If the initial language selection filters out all content, only its combination event fires.
  A service waits for all section states before reporting filtered-empty, so missing translations
  in one hymn do not hide available content in another. If a later language choice makes content
  available on the same page, the entity/format events fire once then, with the current combination.
  The already-recorded initial combination is not counted again or rewritten.
- Later language changes emit `change_content_languages` but do not duplicate an already-counted
  entity, format or usage event. The next navigation records the then-active combination.
- Invalid routes, failed requests, empty format records, failed musical engraving and stale or
  unmounted results do not emit successful entity/format views. No extra failure events are added.
- Counts represent views, not unique hymns/people: visiting text, then Hazzat, then returning to text
  is three `hymn_view` events (two text, one Hazzat). Users/sessions distinguish reach from repeat use.

## GA4 setup and reporting

Inspect existing custom definitions/quotas before adding event-scoped custom dimensions for:
`view_type`, `content_format`, `content_languages`, `content_state`, and
`previous_content_languages`, `previous_theme`, `theme`, `search_mode`, `result_status`,
`result_type` and `audio_provider`. Use a custom metric (unit: Standard) for numeric `result_count`
if search-result counts need aggregation; do not register it as a categorical dimension. If category/label breakdowns are needed for retained events,
register `event_category` and `event_label` too; they are custom parameters in GA4, not automatic
Universal Analytics category/action/label reports. Do not recreate existing definitions.
Definitions are not retroactive; allow normal processing time.

Review cardinality before registering `season_id`, `service_id`, `hymn_id` or `variation_id`.
High-cardinality dimensions may produce `(other)` rows. An authorized BigQuery export joined
to public catalog metadata can be preferable. Do not invent compound ID/title parameters or
translated-name dimensions. If hymn IDs are reused, report by season/service/hymn hierarchy.

### Overall hymn views, then text versus Hazzat

In **Explore → Free form**:

1. Filter **Event name exactly equals `hymn_view`**. Optionally filter a particular season,
   service or hymn ID. This is the canonical overall hymn-view total.
2. Values: **Event count**, **Total users**, **Sessions**. Rows: hymn ID (or the scoped catalog
   hierarchy), followed by **Content format**. Add **Content languages** as another breakdown.
3. The total and breakdown come from the same events: for example, 100 hymn views can break down
   to 70 text and 30 Hazzat views. No event-name join, timestamp matching, or user-ID correlation
   is required. Default formats and default/restored language combinations are already included.
4. Keep `hymn_view` as the filter when drilling by language so the language dimensions refer to
   those same successful views. The separate combination events answer initial reader-preference
   usage, including filtered-empty states; they are not a substitute for the hymn-view denominator.

Other useful explorations:

- **Primary views:** select only `season_view`, `service_view`, `hymn_view`; do not add format/usage
  events to this total. Direct season/service landings have unset `content_format`; deeper reader
  activity has a format. Summarize by applicable IDs and resolve names from public metadata.
- **Format popularity:** select the seven format-event names; rows `content_format`, then
  `view_type`. Filter `view_type=hymn` to compare against individual-hymn views, since unfiltered
  format totals also include service-wide readers.
- **Combination usage:** select the eight `content_languages_*_view` names listed above; rows
  `content_languages`, then `content_state` and optionally `content_format`/`view_type`.
  Separate filtered-empty from available usage. This includes defaults and saved choices.
- **Deliberate changes:** filter `change_content_languages`; rows `previous_content_languages`,
  then `content_languages`; values Event count/Total users. This measures transitions rather
  than all usage. Initial/restored preferences are intentionally not manual changes.

- **Theme transitions:** filter `change_theme`; rows `previous_theme` then `theme`.
- **Search outcomes:** filter `search_results`; rows `search_mode` and `result_status`; use Event
  count for completed searches. `result_count` is the number of matches, not a search counter.
- **Search selections:** filter `search_result_select`; group by `result_type` and public IDs.
  These are activation counts, not a query-level attribution funnel; no query/join identifier is sent.
- **Audio use:** filter `audio_start`; group by season/service/hymn/variation, optionally languages
  and `view_type`. Count first starts per recording visit, not resumes, total plays or completion.

Event count measures repetition. Users and Sessions measure reach. Do not sum users across
rows to infer unique people. These are setup/report recipes, not a claim that definitions or
saved explorations have been created in the owner's property.

## Privacy, transport and verification

All custom call sites reuse `trackAnalyticsEvent` and the existing `window.gtag`, including
retained events (`button_click`, `change_nav_lang`, `change_text_color`, `change_hazzat_color`,
`change_text_size`). Missing/non-callable/throwing tracking stays non-blocking. Existing event
names, labels and triggers are preserved; the old color/size setters can still emit on repeated
valid direct calls, unlike normalized language changes.

The helper does not load another tag, send directly to a collector, retry, override consent,
or change property settings. New payloads contain no hymn/PDF contents, search text, titles,
media URLs, raw errors or personal identifiers. GA's own automatically supplied fields are
separate from these custom payloads.

Application tests mock the tag and send no GA traffic. Before release:

1. Inspect the existing stream's **Enhanced measurement → Page views → Advanced settings** and
   observe direct load/client navigation/Back/Forward. Source cannot establish its history settings.
   Keep exactly one page-view mechanism. This PR leaves `index.html` intact and adds no manual
   `page_view`, no history listener and no second analytics property.
2. Use an approved isolated test property/deployment or controlled internal/developer filtering.
   The existing measurement ID is shared by the build template: separate test traffic deliberately.
   For a local test copy, replace both measurement-ID occurrences with the approved test ID and do
   not commit that temporary edit. Do not send uncontrolled test traffic into production reports.
3. Enable Tag Assistant for that test session and inspect **Admin → DebugView**. Check one entity
   event for a landing, and the exact three-event set for a normal reader. Exercise every format,
   every combination, defaults/restored preferences, manual changes, filtered-empty→available,
   service-wide pages, Back/Forward and reload. Confirm no obsolete `content_view` events.
4. Compare every `hymn_view` payload with its primary format/language breakdown and confirm the
   once-only family counters. Test failures/stale navigation and blocked/denied tracking too.
5. Exercise manual light/dark changes and silent initialization/OS/storage updates; completed
   title/full-text searches, empty results, selection, pagination and failure/retry; and actual
   SoundCloud play versus loading/READY/resume, multiple recordings, locale changes and navigation.
   Verify the live provider callback and DebugView receipt in that controlled environment; mocked
   automated tests establish application wiring, not real provider/GA delivery.
6. Verify custom definitions and saved explorations. Record environment, commit, time, consent
   state, page-view mechanism and representative results privately, not account/dashboard data
   in the public repository.

Actual GA receipt, configured custom dimensions/explorations, applicable consent policy and
Enhanced Measurement behavior remain external verification. Automated local/CI results do
not prove them. This PR adds no video playback, pause/progress/completion or PDF-download events.
