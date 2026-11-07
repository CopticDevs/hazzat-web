# SoundCloud audio reader

The website renders validated public SoundCloud track links from the existing `content.audioFilePath` string. The Azure/legacy external-link renderer and its `Instrumental.png` artwork have been removed. Published recording URLs, shared-content schemas, Azure storage objects and deployments are not changed by this reader cleanup.

## Reader behavior

- A validated public HTTPS SoundCloud artist/track link renders the official embedded player automatically. Audio autoplay is disabled.
- SoundCloud's supported `color` parameter uses Hazzat's charcoal ink (`#302c26`). The accent remains the same in light/dark site themes because the standard widget keeps its own light canvas and branding. A theme toggle does not change the iframe URL or restart playback. This is an accent adjustment, not a dark SoundCloud player.
- Azure MP3s, other unsupported URLs and empty audio values render no player, external link, artwork or variation heading. Only supported recordings count toward alternative headings; the hymn title is retained even when no recordings can be displayed.
- Recognition uses exact host checks for `soundcloud.com`, `www.soundcloud.com` and `m.soundcloud.com`, canonicalizing to `soundcloud.com`. Lookalike domains, credentials, nonstandard ports, private tokens, playlists and profile URLs are not embedded.
- Short share links such as `https://on.soundcloud.com/...` are not displayed. Resolve them to the full canonical artist/track URL before saving a record. Do not put a player iframe URL or HTML into `audioFilePath`.
- Tracking parameters and fragments are stripped from recognized track URLs. The site never treats a matching word elsewhere in a URL as a SoundCloud host.
- The player includes a localized, labeled responsive iframe without the inline connection/cookie notice. Loading feedback is screen-reader-only. After the frame loads, no instructions, status text, link or Reload button appear underneath. A timeout or iframe error shows a localized SoundCloud fallback with an accessible new-tab announcement and a theme-colored icon. A frame load event does not prove playable audio; the site does not inspect cross-origin widget content or detect every playback failure.
- Replacing a recording under the same content ID removes the old iframe and resets loading state. Changing to an unsupported URL or leaving the audio view removes the iframe and cleans up its timer. Unsupported URLs do not restore a legacy link.

`SoundCloudUrl.ts` provides shared validation. `ContentAudio.tsx` filters unsupported records before rendering `SoundCloudPlayer.tsx`. The development review page uses that same player component.

## Publishing and compatibility

Keep `schemaVersion: 5`, the content UUID, service placement references, order and labels unchanged when updating the same recording. No provider field or schema version bump is required. The v5 validator and loader continue to preserve the URL string; URL support is a display concern, so old or malformed audio URLs do not prevent a whole service from loading.

- Verify the exact SoundCloud performance, language, public availability, embedding permission and recording rights before publishing a full HTTPS artist/track URL.
- Test the recording in context, including signed-out playback, unavailable-track fallback, switching/navigation and real mobile browsers.
- An Azure URL is no longer a web playback rollback. Restoring such a URL hides that recording in this reader. Use a supported SoundCloud URL, or separately review reverting the reader if legacy playback is necessary.
- Content JSON is served separately from audio storage; changing audio hosting does not require moving the JSON feed.

### Other readers and older feeds

A live audit on 2026-11-07 found 17 Audio records in the [v5 content catalog](https://d1zhmhuei1bwco.cloudfront.net/v5/metadata/content-catalog.json); all 17 records use canonical HTTPS SoundCloud track links. The public reader requests only v5. The frozen [v4 Meghalo record](https://d1zhmhuei1bwco.cloudfront.net/v4/content/81a874a9-5ab3-41a8-9265-fb657b238c05.json) and [v3 Meghalo service](https://d1zhmhuei1bwco.cloudfront.net/v3/seasons/great-lent-saturdays-sundays/services/liturgy-25.json) still reference Azure MP3s. This cleanup does not change those feeds or delete any hosted recording.

The previous web reader opens any nonempty `audioFilePath` externally, so a migrated URL remains a link there rather than becoming an embed. Responsive/mobile web uses this renderer, but iOS Safari and Android Chrome behavior still need real-device checks.

Native-app compatibility and the current publisher/editor's URL restrictions are **not verified**. A native client expecting a downloadable MP3 may not accept a SoundCloud webpage URL. Check clients that consume the same feed before migrating their records. Leave frozen v3/v4 content unchanged.

Removing website legacy handling and deleting Azure files are separate decisions. Older feeds, native apps, cached content and direct links may still need those files even after v5 migration. Do not retire storage based only on the v5 count.

## Local review page

With the repository's supported Node version (Node 24 preferred):

```sh
npm ci --strict-peer-deps
npm start
```

Open `http://localhost:3000/Preview/SoundCloud`. The default recording loads automatically with audio autoplay off. Valid URL edits replace it after a 500 ms pause in typing. Clearing or invalidating the input removes it. Close stays dismissed until the URL changes or the sample is restored. Labels do not reload the frame. No input is saved.

The default recording is [**Meghalo by Hazzat**](https://soundcloud.com/coptichazzat/meghalo), supplied for **Great Lent Saturdays & Sundays → Liturgy → Meghalo**. Its public title and description match the supplied context and the current [v5 recording](https://d1zhmhuei1bwco.cloudfront.net/v5/content/81a874a9-5ab3-41a8-9265-fb657b238c05.json) and [service placement](https://d1zhmhuei1bwco.cloudfront.net/v5/seasons/great-lent-saturdays-sundays/services/liturgy-25.json).

The prototype association is content UUID `81a874a9-5ab3-41a8-9265-fb657b238c05`, hymn `meghalo`, season `great-lent-saturdays-sundays`, service `liturgy-25`. It is not proof that the Azure and SoundCloud files contain the identical performance. The review page does not edit the published Meghalo record.

The review route has no navigation link and remains development-only. A normal production build **includes the shared SoundCloud renderer/player**, but excludes `/Preview/SoundCloud`, its form/CSS and the hard-coded Meghalo sample. `npm run preview` serves a production build and does not expose the review route.

## Verification and remaining checks

The regression suites cover supported/unsupported mixtures, empty headings, URL validation, unchanged provider/schema handling, frame replacement, removal of legacy links/artwork, timer cleanup and Arabic labels. Existing player tests cover errors/timeouts, language/theme changes, and the development prototype covers debounce/cancellation and close/reopen. Full-suite totals, type/lint/tooling/build checks and remote CI status are recorded in the cleanup PR.

The following browser notes are historical observations from the original migration; they do not claim fresh end-to-end playback verification for this cleanup.

The standalone official SoundCloud widget was checked in a browser: **Meghalo** by **Hazzat**, artwork, waveform, **9:56** duration, Play/Pause and elapsed time advancing to **0:16**. It was paused afterward, when SoundCloud showed its own promotional overlay. No login or unavailable-track error appeared. Audible output and full-track listening were not independently checked.

![Standalone official SoundCloud widget for Meghalo at 0:16, not integrated Hazzat UI](screenshots/meghalo-soundcloud-widget.jpg)

This is an unchanged screenshot of the **standalone official SoundCloud widget, not the integrated Hazzat UI**. Integrated-page playback and real-device behavior still require separate verification; responsive CSS is not proof of those results.

Before release, check:

- Supported and unsupported records in the actual hymn view, desktop and narrow layouts, Arabic and light/dark appearance. Unsupported records should not expose links or empty variation headings.
- Automatic frame loading without automatic audio, Play/Pause/seek and the timeout/error fallback.
- A missing/private/unavailable track, same-ID URL replacement, navigation Back/Forward and replacement with an unsupported URL, with no lingering playback.
- Keyboard/focus behavior, assistive technology and real iOS Safari/Android Chrome.
- Recording rights, privacy and applicable SoundCloud permission. The [player/widget terms](https://soundcloud.com/terms-of-use) include consent requirements for genre-focused sites; clarify the permission applicable to Hazzat before public rollout.
