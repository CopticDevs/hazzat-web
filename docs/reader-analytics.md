# Reader and language analytics

Implements the application events in [#325](https://github.com/CopticDevs/hazzat-web/issues/325)
and [#327](https://github.com/CopticDevs/hazzat-web/issues/327), alongside the separate
[booklet generation event](booklet-analytics.md). Search Console access and Google search
queries are separate work in [#326](https://github.com/CopticDevs/hazzat-web/issues/326).

## Event contract

All events reuse the existing `window.gtag` and configured GA4 property. They are best effort:
missing, non-callable, blocked, or throwing analytics never prevents rendering or saving settings.
The helper does not load another tag, send directly to a collection endpoint, retry failed events,
override consent, or change the site's existing consent configuration.

### `content_view`

One event describes one logical, validated content visit. `event_category` is `Engagement`.

| Parameter | Values / meaning |
| --- | --- |
| `view_type` | `season`, `service`, or `hymn` |
| `season_id` | Stable public catalog ID for every view |
| `service_id` | Stable public catalog ID for service and hymn views |
| `hymn_id` | Stable public catalog ID for an individual hymn view only |
| `content_format` | Reader only: `text`, `hazzat`, `vertical_hazzat`, `musical_notes`, `audio`, `video`, `information` |
| `content_languages` | Reader only: active normalized language preference; see below |
| `content_state` | Reader only: `available` or `no_selected_language_content` |

Season/service landing events omit reader parameters. Their absence distinguishes landing counts
from deeper reader activity without a redundant landing dimension. The IDs remain on deeper
views, allowing all activity within a season or service to be reported separately from landings.
No titles, hymn text, search terms, URLs, raw errors, user IDs, or personal identifiers are added
by these custom events. IDs originate in validated public catalog records, not arbitrary URL values.

Format IDs map exactly as follows:

| Route/catalog format ID | Canonical analytics format |
| --- | --- |
| `1` | `text` |
| `2` | `hazzat` |
| `3` | `vertical_hazzat` |
| `4` | `musical_notes` |
| `5` | `audio` |
| `6` | `video` |
| `7` | `information` |

There is no eighth reader format. **All Formats** is a booklet preset. A list of available
format links does not count as views of those formats.

### What counts as one view

- A visit starts when the content pathname changes, or when the page is freshly mounted after
  reload/leaving the reader. Back/Forward visits count again. Path case/trailing slashes are
  normalized; changing only query parameters or fragments does not start another view.
- A season landing counts after its current season and service catalog validate and load.
  Nested service hymn lists do not generate additional service/hymn events.
- A service landing counts after its current service catalog and hymn list load successfully.
  Hymn links alone are not individual hymn views.
- A hymn or service-format reader counts when actual content becomes available in the selected
  format, including the automatically chosen default on an expanded hymn route. A service reader
  emits one service event, regardless of the number of hymns or variations. It does not emit hymn
  events for every child. If a service is partially available, its first available content section
  is sufficient; the event is not a claim that every section was loaded or read.
- Text, notation and information count after the loaded section is committed. Musical notes wait
  until engraving succeeds at a visible width. Audio/video count when the valid embedded player
  surface is displayed. These are format views, not playback, completion, or proof that an external
  media provider successfully streamed media. Cross-origin playback failures are not observable
  by this view event.
- When real source content exists but none matches the selected languages, the reader's filtered
  empty state counts once with `content_state=no_selected_language_content`. This measures the
  selected combination without pretending multilingual content was rendered. For a service,
  this state waits for all sections so a missing translation in one hymn cannot hide content in another.
  Completely empty format records, invalid routes, failed content requests, failed musical engraving,
  and discarded/unmounted results do not count as successful content views.
- A visit shares one counter across nested components. StrictMode effect replay, rerenders, retries
  after a success, UI-language reloads, content-language changes, theme/font changes and repeated
  child callbacks do not increment it. A later pathname/format visit counts again. This deliberately
  measures navigation/format usage rather than time spent, scroll depth, or each preference toggle.
- A language change after the view was recorded is measured by the settings event below; the next
  reader visit records its new combination. The prior view is not rewritten or counted a second time.

### `change_content_languages`

Emitted once when the visitor deliberately changes the normalized reader-language setting.
Parameters are `event_category=Customization`, `previous_content_languages`, and `content_languages`
(the new combination). There are not eight separate dynamically named events.

The initial default, loading saved preferences, cross-tab synchronization, duplicate checkbox
callbacks, reordered/duplicate equivalent selections and unchanged values emit no manual-change
event. A real change to or from the empty selection does. Existing `change_nav_lang` tracks the
English/Arabic interface separately and is not duplicated by these events.

### Language combinations

Every combination is deterministic in English, Coptic, Arabic order:
`en`, `cop`, `ar`, `en+cop`, `en+ar`, `cop+ar`, `en+cop+ar`, `none`.

The default is `en+cop+ar`; saved selections use the same encoding. These parameters represent
visitor preference, not content translation availability. A hymn missing an Arabic translation
does not change a preference of `en+ar` to `en`. Language-neutral audio/score content can remain
available with `none`; this still makes no claim of multilingual text being present.

## GA4 setup and reports

Use the existing property. Before registering dimensions, inspect its current definitions and
available quotas. Register event-scoped custom dimensions for `view_type`, `content_format`,
`content_languages`, `previous_content_languages`, and `content_state` only when not already present.
Definitions are not retroactive; allow normal processing time before interpreting reports.

Review cardinality before registering `season_id`, `service_id` or `hymn_id`. Hymn identifiers may
produce high-cardinality reporting and `(other)` rows. Prefer an authorized GA4 BigQuery export
and joins to the public catalog where suitable. Do not add compound season/service/hymn/title
strings, duplicate translated name dimensions, or personal identifiers to work around cardinality.
Public IDs and their relationship can be resolved to names from the catalog. If hymn IDs are reused
across services, group by season/service/hymn in the report or export rather than inventing a
concatenated event parameter.

Suggested **Explore → Free form** reports (create in the owner-authorized property):

1. **Reader language usage:** filter `Event name = content_view` and `content_format` set.
   Rows: `content_languages`. Columns optionally: `content_state` or `content_format`.
   Values: Event count, Total users, Sessions. Use `content_state=available` to rank actual rendered
   usage; inspect filtered-empty visits separately. Include defaults and saved preferences.
2. **Deliberate language changes:** filter `Event name = change_content_languages`.
   Rows: `previous_content_languages`, then `content_languages`. Values: Event count and Total users.
   This reports transitions and customization, not overall combination popularity.
3. **Format popularity:** filter `Event name = content_view`, `content_state=available`.
   Rows: `content_format`. Values: Event count, Total users, Sessions.
4. **Season/service/hymn popularity:** filter `Event name = content_view`; group by the applicable
   catalog ID(s). For direct season/service landings filter their `view_type` and unset
   `content_format`; for individual hymn reads filter `view_type=hymn` and `content_state=available`.
   To examine broader season/service activity, include all applicable view types with that ID.
   Do not label service-wide events as individual hymn reads.

Event count is the number of logical views, including revisits; it is not unique people.
Total users and Sessions show reach alongside repeat use. Do not sum users across rows to infer
unique users of the whole site. The reports above are a recipe, not a claim that property-side
custom definitions or saved explorations have already been created.

## Verification and release checklist

Application unit/integration tests use a mock tag and send no GA traffic. They cover all seven
formats, default and saved combinations, manual changes, empty-language states, landing/deep routes,
reload/Back/Forward, nested-view deduplication, failures/retry, stale data, and unavailable analytics.

The existing `index.html` Google tag remains unchanged. There are no application-generated
`page_view` events and no added manual SPA page-view mechanism. Property-side Enhanced Measurement
history settings cannot be inferred from the source and must be checked before release:

1. In the existing GA4 web stream, inspect **Enhanced measurement → Page views → Advanced settings**
   and confirm whether browser-history changes are enabled. Observe actual `page_view` events on
   direct load and client navigation, including Back/Forward. Record the setting and event counts.
2. Keep exactly one page-view mechanism. Do not enable a second tag/history listener or add manual
   `page_view` calls on top of Enhanced Measurement. If automatic history measurement is disabled,
   resolve and verify that property setting separately instead of silently adding another mechanism.
3. Use an approved test deployment/property or controlled internal/developer traffic filters, ensuring
   test traffic is excluded from ordinary production reporting. For an isolated local test copy,
   replace both measurement-ID occurrences in `index.html` with the approved test property ID;
   do not commit that temporary change or send uncontrolled test traffic to the production tag.
4. Enable Tag Assistant debug traffic for that test session and open GA4 **Admin → DebugView**.
   Exercise a season landing, service landing, expanded/default hymn, every explicit format,
   service-wide reader, language changes, Back/Forward, and reload. Compare exact event names,
   parameter values and counts against the contract above. Reopen/re-render settings and verify
   there are no extra content views. For media, verify the player appears without claiming playback.
5. Confirm denied consent or blocking does not get bypassed and the reader/settings remain usable.
   Test missing analytics, failures/retry and navigation while data is loading.
6. Record test environment, time, commit, page-view mechanism, consent state, and representative
   DebugView results in an appropriate private release record. Keep dashboard/account data out of
   public repository docs. Verify the saved explorations/custom definitions separately.

**Outstanding external verification:** actual GA receipt, property custom dimensions/explorations,
consent-policy configuration and Enhanced Measurement settings require an authorized property and
controlled test traffic. Local tests and an unchanged tag do not prove those acceptance criteria.
