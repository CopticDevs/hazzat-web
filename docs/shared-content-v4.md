# Shared content v4

The web app supports both the embedded v3 feed and the shared v4 feed. v3 remains the default. Switching versions is a build-time setting, not a content migration or publishing operation.

## Data and display behavior

A v4 service has ordered hymn assignments. Each assignment refers to a hymn identity and independent ordered arrays of content UUIDs under format IDs 1–7. The loader validates and resolves all dependencies before returning the existing reader view model. No default variation or notation/audio association is introduced.

- The hymn dropdown displays every assigned alternative of the selected format in assignment order.
- The service dropdown displays hymns in service order and all alternatives of the selected format in assignment order within each hymn.
- Formats without assigned content are omitted from the available format choices.
- Optional assignment `name` and `nameAr` supply service-specific hymn titles. Shared record names remain variation labels. Annual/Basil and Kiahk/Liturgy can therefore use different titles while referencing the same content UUIDs.
- A contextual English title without its own Arabic translation remains visible in Arabic mode; the canonical Arabic title does not replace that distinct contextual title. Without an override, the identity's translated name is used normally.
- Format order uses metadata `order`, then `position`, then format ID, preserving legacy ties.
- PDF choices use season/service/hymn/format/content identity, so two records with the same label and one record reused in several places remain independently selectable.

Search reads the canonical reference index and thin service assignments to find contextual titles. It uses service summaries for results and does not load library payloads. This supports the current v4 publisher without requiring a new search index shape. The existing string IDs and deep links are retained.

The resource cache is shared across provider instances and locales for the same base URL. It deduplicates in-flight requests, limits requests to four concurrent operations, and stores at most 512 raw resources for 60 seconds. Reader payloads are copied into contextual projections so consumers cannot mutate shared cache records. Failed dependencies are retriable and never produce a partially resolved service. Booklet loading fails explicitly if any requested service fails; it does not silently omit a service from a PDF.

This is a browser memory cache, not a new offline-download feature. ETag conditionals are optional and disabled until the browser CORS policy supports them.

## Local configuration

```sh
npm ci
npm test -- --watchAll=false --runInBand
npm run build
```

Copy `.env.example` to ignored `.env.local` for local overrides. To test v4, set:

```dotenv
REACT_APP_HAZZAT_CONTENT_VERSION=v4
REACT_APP_HAZZAT_PPE_CONTENT_BASE_URL=https://your-isolated-content-origin.example/rehearsal
```

Start with `npm start` and select `?env=PPE`. Existing language and environment query strings remain preserved by navigation. Restart the development server after changing environment variables; rebuild for deployment.

`REACT_APP_HAZZAT_CONTENT_BASE_URL` overrides the content base for all environments. `REACT_APP_HAZZAT_DEV_CONTENT_BASE_URL`, `REACT_APP_HAZZAT_PPE_CONTENT_BASE_URL`, and `REACT_APP_HAZZAT_PROD_CONTENT_BASE_URL` take precedence for their respective environments. The loader appends `/v3/...` or `/v4/...`; do not include the version in the base URL. Absent overrides, all environments retain the existing CloudFront URL, so changing only `?env=PPE` does not isolate content.

Do not place credentials in `REACT_APP_*` values; these are public browser configuration.

## Dataset regression check

The optional dataset test accepts two local directories:

```sh
HAZZAT_V4_DATASET=/path/to/migration-output \
HAZZAT_V3_DATASET=/path/to/verified-backup/objects \
CI=true npm test -- --watchAll=false --runInBand
```

The first directory must contain `v4/`; the second must contain the original `v3/`. The checks compare all 84 services' effective English hymn titles, ordered formats/alternatives, variation names, and payloads. They include the two retained legacy service files absent from the existing season navigation metadata and verify their search reference paths without loading payloads. The reader comparison excludes empty formats from both comparison views because empty v4 assignments are unavailable format choices. Without those directories these optional tests are skipped; the synthetic v4 service, cache, reader, search, and PDF selection tests still run.

## Safe rollout

1. Keep production on v3 while exercising an isolated v4 rehearsal feed in PPE. Both builds must compile and existing v3 regressions must pass.
2. Validate the preserved dataset, independent alternatives, contextual titles, English/Arabic/Coptic display, score rendering, external audio links, multiple video embeds, service/hymn dropdowns, and device/print PDF output.
3. Existing service-specific titles are backfilled during migration. The web reader supports these fields already; the admin editor for future title changes can be completed separately and does not block publishing the preserved dataset. The web does not author records or modify the bucket.
4. If enabling `REACT_APP_HAZZAT_CONTENT_ETAGS=true`, first configure the applicable CloudFront response policy to expose `ETag` and allow `If-None-Match`, then verify browser preflight/304 behavior. Confirm versioned content invalidation is active.
5. Freeze v3 writes, verify the final backup/restore, and retain a durable copy outside the cloud workspace before live content rollout. The approved cutover updates only v4. The publisher maintains four v4 indexes and invalidates only `/v4/*`; retained v3 objects stay frozen. Older clients show that snapshot until they upgrade.
6. Deploy the verified web build with the v4 flag after the live feed passes validation. Reverting to the v3 build shows the frozen older dataset. Preserve later v4 edits through v4 backups/version history; do not restore the whole pre-cutover bucket snapshot blindly.
7. Combining existing duplicate records remains a separate final review phase.

No AWS writes, content conversion, record consolidation, or deployment is performed by this web implementation.

## Azure pipeline promotion

The existing `.pipelines/azure-pipelines.ppe.yml` builds `develop` for deployment to `ppe.hazzat.com`. After PPE validation, merging `develop` into `master` runs `.pipelines/azure-pipelines.prod.yml` for deployment to `hazzat.com`. Deployment continues through the existing Azure release setup using the published build artifacts.

The build task in each pipeline explicitly sets `REACT_APP_HAZZAT_CONTENT_VERSION=v4` and `REACT_APP_HAZZAT_CONTENT_BASE_URL=https://d1zhmhuei1bwco.cloudfront.net`. The gated PPE validation and manual development build use the same settings. These are public configuration values. Keep them on promotion so each rebuilt artifact reads the live v4 dataset; the application's unconfigured local default remains v3. Existing triggers, test tasks, artifact names, and deployment credentials are preserved.

Merge the feature PR into `develop` first. Validate the deployed PPE site, including both format menus, contextual hymn titles, language changes, MusicXML, and PDF selection/download, before approving promotion to `master`. This web promotion does not migrate or overwrite AWS content.

## Implementation validation

Verified on October 14, 2026 with Node 24:

- 87 tests passed across 14 suites, including both dataset checks against all 84 retained service files and their contextual search references.
- TypeScript checking and ESLint passed. Both v3 and v4 production builds passed with `CI=true`.
- The development server compiled and served its HTML and JavaScript successfully.
- Headless Chromium exercised both dropdowns, hymn/variation order, the Annual/Kiahk title example with unchanged variation labels, contextual-title search, Arabic, a phone-sized viewport, and all seven formats. A real migrated MusicXML record rendered as SVG.
- Device and print PDFs downloaded successfully. The device PDF included the contextual title and excluded the deselected alternative. Device pages measured 396 × 612 points; print pages measured 792 × 612 points.
- Missing content and incomplete booklet loads displayed errors, blocked partial PDF downloads, and recovered through Retry. The browser reported no JavaScript errors.

Live external audio/YouTube playback, Safari, and Firefox were not tested. Explicit ETag/CORS behavior is covered at the client unit level but still requires deployed browser verification before the optional ETag flag is enabled.
