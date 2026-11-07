# Local SoundCloud embedding prototype

Prototype for [#283](https://github.com/CopticDevs/hazzat-web/issues/283), based on `develop`. No public rollout, upload, account/API setup, sing-along, or published content change. SoundCloud is the intended replacement for Azure-hosted audio. This development-only prototype does not migrate the existing recordings or complete the broader work in that issue.

## Run and review

Use the repository's supported Node version (Node 24 preferred):

```sh
npm ci --strict-peer-deps
npm start
```

Open `http://localhost:3000/Preview/SoundCloud`. The sample player loads automatically, with audio autoplay disabled. Paste an appropriate public full track URL to replace it automatically after a 500 ms pause in typing. The route intentionally has no main-navigation link.

The default recording is [**Meghalo by Hazzat**](https://soundcloud.com/coptichazzat/meghalo), supplied for **Great Lent Saturdays & Sundays → Liturgy → Meghalo**. The supplied short link resolves to this canonical public track; tracking parameters are omitted from the player URL. No recording is uploaded or copied.

The pilot association is with content UUID `81a874a9-5ab3-41a8-9265-fb657b238c05`, hymn `meghalo`, season `great-lent-saturdays-sundays`, service `liturgy-25`. The current [v5 recording](https://d1zhmhuei1bwco.cloudfront.net/v5/content/81a874a9-5ab3-41a8-9265-fb657b238c05.json) and [service placement](https://d1zhmhuei1bwco.cloudfront.net/v5/seasons/great-lent-saturdays-sundays/services/liturgy-25.json) match the supplied hymn and context. SoundCloud's public title and description agree. This is a prototype association, not proof that the SoundCloud and Azure files contain the identical performance. Live payloads and schema remain unchanged.

Use the existing website preferences for Arabic and light/dark appearance. Only public HTTPS `soundcloud.com`, `www.soundcloud.com`, or `m.soundcloud.com` artist/track-shaped links are accepted; short/profile/playlist/private-token URLs are rejected. Tracking parameters are removed. Syntax validation does not prove the track exists or is playable.

## What it does

- Uses the existing Hazzat page shell and reader styling on a separate development-only route.
- Loads one official standard SoundCloud iframe on page opening. Valid URL edits load automatically after a 500 ms debounce; superseded edits are canceled. Clearing or invalidating the URL removes the frame.
- Clearly discloses automatic third-party connections and possible SoundCloud cookies. This is automatic frame loading, not automatic audio playback.
- Does not request autoplay. Keeps SoundCloud's controls and branding, a visible recording label, an external fallback, Reload and Close.
- Replacing/reloading removes the prior iframe. Closing restores input focus and keeps the frame dismissed until the URL changes or the Meghalo recording is restored. Label edits do not reload or reopen it. Unmounting the route removes the iframe rather than leaving background playback.
- Includes English/Arabic copy, responsive layout and descriptive frame labeling.
- Does not save the URL/label. Existing Azure audio rendering, payloads and mappings are untouched.

The frame's `load` event does not prove that audio is playable, and cross-origin frame errors are not reliably observable. The UI therefore never claims successful playback. A loading timeout and the always-visible external fallback cover uncertainty; no Widget API or OAuth dependency is introduced.

## Production boundary

`App.tsx` only dynamically imports the prototype when `process.env.NODE_ENV === 'development'`. Normal `npm run build` removes the route, implementation and CSS from executable production assets. `npm run preview` serves a production build and will therefore not show this route. Do not change the gate or production environment configuration merely to expose the review page.

A wider deployment remains a separate decision, including SoundCloud's [embed terms](https://soundcloud.com/terms-of-use), recording rights, track mappings, privacy and device checks. In particular, the player/widget terms include consent requirements for genre-focused sites; Hazzat should clarify the applicable permission before a public rollout.

## Verification

Passed locally:

- TypeScript `npm run typecheck`.
- All 34 prototype tests: URL normalization/rejection, automatic initial loading with autoplay off, debounced replacement/cancellation, sample labeling, safe fallback, invalid/cleared URLs, close/focus/dismissal, reload, timeout cleanup, late detached-frame events, previous timers and Arabic labels.
- Full Jest: **54 suites passed; 650 tests passed; 2 dataset-dependent tests skipped**.
- All **5 build-tooling tests**.
- Production build, with the existing large-chunk and mixed OpenSheetMusicDisplay import warnings.
- Production JS/CSS scan: no `/Preview/SoundCloud`, `w.soundcloud.com/player/`, or prototype CSS selectors.
- ESLint on changed/new TypeScript files: **0 errors, 0 warnings**.
- `git diff --check`.

Full repository lint does not pass: **120 errors and 9 warnings in unchanged files**. These include pre-existing test-rule violations; no unrelated cleanup is included.

The standalone official SoundCloud widget was checked in a browser for this recording: it displayed **Meghalo** by **Hazzat**, artwork, a waveform and a **9:56** duration. Play changed to Pause and the elapsed time advanced to **0:16**; it was paused afterward. SoundCloud then showed its own promotional overlay. No login or unavailable-track error appeared. Audible output was not independently checked.

![Standalone official SoundCloud widget for Meghalo at 0:16, not integrated Hazzat UI](screenshots/meghalo-soundcloud-widget.jpg)

This is an unchanged screenshot of the **standalone official SoundCloud widget, not the integrated Hazzat UI**. Integrated-page browser verification and screenshots remain blocked because the available browser cannot reach the local development server.

Full-track listening, real iOS Safari/Android Chrome and assistive-technology checks remain unverified. Responsive CSS is not equivalent to verified mobile behavior.

## Browser review checklist

- Capture the initial page and the loaded sample player at desktop and narrow viewport widths.
- Confirm the sample frame loads automatically on opening, audio does not autoplay, and valid URL edits replace it without a Load click. Confirm invalid/private URLs do not reach the player.
- Check Play/Pause, seek and the external fallback with an available public recording.
- Replace and reload the recording, then close it and navigate Back/Forward. Confirm there is never more than one frame or lingering playback.
- Try an invalid link and an unavailable track, and check the fallback/loading feedback.
- Check Arabic direction, light/dark appearance, keyboard focus and a real mobile browser.
- Verify the page is absent from a normal production build.
