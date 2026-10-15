# Shared content v4

All new web builds use v4 shared content. There is no schema version switch, v3 loader, or fallback to a v3 feed. Obsolete `REACT_APP_HAZZAT_CONTENT_VERSION` values have no effect. AWS retains the frozen v3 objects only for previously released readers; new edits and publication update v4 exclusively.

## Data and display behavior

A service contains ordered hymn assignments. Each assignment refers to a hymn identity and independent ordered arrays of content UUIDs under format IDs 1–7. The loader validates and resolves dependencies before displaying a complete service.

- The hymn format menu shows every assigned alternative in assignment order.
- The service format menu shows hymns in service order and every alternative in its assigned order within each hymn.
- Formats without assigned content are omitted. No default variation or notation/audio association is introduced.
- Optional assignment `name` and `nameAr` supply contextual hymn titles. Library record names remain the variation labels. Different services can therefore use different titles with the same content UUIDs.
- A contextual English title without an Arabic override stays visible in Arabic mode. Otherwise the identity's translated name is used normally.
- Format order uses metadata `order`, then `position`, then format ID.
- PDF choices include season/service/hymn/format/content identity, keeping repeated labels and reused records independently selectable.

Search combines the canonical reference index and thin service assignments to find contextual English and Arabic titles without loading library payloads. Existing hymn string IDs and deep links are preserved.

The resource cache deduplicates requests across providers and locales, limits requests to four concurrent operations, and retains at most 512 resources for 60 seconds. Contextual projections copy their payloads. Failed dependencies are retriable and never produce partially resolved services or incomplete booklet PDFs. A missing v4 resource displays an error; it does not fetch v3.

## Local development

```sh
npm ci
npm test -- --watchAll=false --runInBand
CI=true npm run build
npm start
```

No version flag is needed. Copy `.env.example` to ignored `.env.local` only when overriding the content origin. `REACT_APP_HAZZAT_CONTENT_BASE_URL` sets the base for all environments; `REACT_APP_HAZZAT_DEV_CONTENT_BASE_URL`, `REACT_APP_HAZZAT_PPE_CONTENT_BASE_URL`, and `REACT_APP_HAZZAT_PROD_CONTENT_BASE_URL` override their respective environments. The loader appends `/v4/...`; omit the version from the base URL. A rehearsal prefix can be included in the base. Existing language/environment query strings are preserved by navigation.

These are public browser values; never include credentials. Explicit ETag requests remain optional and disabled until deployed CORS permits `If-None-Match` and exposes `ETag`. Normal browser caching remains available.

## Azure promotion

The existing pipelines under `.pipelines/` build v4 automatically. They retain the confirmed content origin, triggers, test tasks, artifact names, and deployment credentials.

1. Merge the feature PR into `develop`. The existing Azure pipeline/release workflow publishes `ppe.hazzat.com`.
2. Validate PPE: contextual titles, all formats, English/Arabic/Coptic display, hymn/service menus, MusicXML, independent alternatives, and device/print PDF selection and download.
3. Promote `develop` into `master` after PPE validation. Azure publishes `hazzat.com`.

The web build does not migrate, edit, consolidate, or overwrite AWS content. Keep v3 frozen in AWS for older released apps until they have been replaced. Reverting a deployment to an older app displays the frozen data; it does not preserve later v4 edits. Recover v4 through its backups/version history and a reviewed reconciliation of later changes.

## Preservation regression check

Tests can compare the v4 reader to the preserved original snapshot:

```sh
HAZZAT_V4_DATASET=/path/to/migration-output \
HAZZAT_V3_DATASET=/path/to/verified-backup/objects \
CI=true npm test -- --watchAll=false --runInBand
```

The first directory contains `v4/`; the second contains the original `v3/` backup. The old data is test input only and is not shipped or read by the application. These comparisons cover all 84 retained services, contextual titles, ordered formats/alternatives, variation names and payloads, including retained service files absent from the old navigation metadata. Empty formats are omitted from both comparison views. Without the dataset paths, these optional comparisons are skipped; synthetic reader/cache/search/PDF tests still run.

Before migration, service-specific titles and distinct central/service content were preserved with stable content UUIDs. Duplicate consolidation remains a separate reviewed phase. Future contextual-title editing in the admin is separate from the existing reader support.

External audio/YouTube playback, Safari, Firefox, and optional deployed ETag conditionals still require their own checks.
