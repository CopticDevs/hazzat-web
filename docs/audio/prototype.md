# Local SoundCloud embedding prototype

Prototype for [#283](https://github.com/CopticDevs/hazzat-web/issues/283), based on `develop`. No public rollout, upload, account/API setup, sing-along, or published content change. This prototype does not complete the broader provider evaluation in that issue.

## Run and review

Use the repository's supported Node version (Node 24 preferred):

```sh
npm ci --strict-peer-deps
npm start
```

Open `http://localhost:3000/Preview/SoundCloud`. Use **Use SoundCloud demo link**, then **Load SoundCloud player**, or paste an appropriate public full track URL. The route intentionally has no main-navigation link.

The optional sample is **Flickermood by Forss**, an official [SoundCloud developer-documentation example](https://developers.soundcloud.com/docs/oembed), not a Hazzat hymn or a verified mapping to one. A Hazzat track can be entered when its actual public URL is supplied. No sample music is uploaded or copied.

Use the existing website preferences for Arabic and light/dark appearance. Only public HTTPS `soundcloud.com`, `www.soundcloud.com`, or `m.soundcloud.com` artist/track-shaped links are accepted; short/profile/playlist/private-token URLs are rejected. Tracking parameters are removed. Syntax validation does not prove the track exists or is playable.

## What it does

- Uses the existing Hazzat page shell and reader styling on a separate development-only route.
- Loads one official standard SoundCloud iframe after an explicit form submission. Filling the sample or typing does not load the player.
- Does not request autoplay. Keeps SoundCloud's controls and branding, a visible recording label, an external fallback, Reload and Close.
- Replacing/reloading removes the prior iframe. Closing restores input focus. Unmounting the route removes the iframe rather than leaving background playback.
- Includes English/Arabic copy, responsive layout and descriptive frame labeling.
- Does not save the URL/label. Existing Azure audio rendering, payloads and mappings are untouched.

The frame's `load` event does not prove that audio is playable, and cross-origin frame errors are not reliably observable. The UI therefore never claims successful playback. A loading timeout and the always-visible external fallback cover uncertainty; no Widget API or OAuth dependency is introduced.

## Production boundary

`App.tsx` only dynamically imports the prototype when `process.env.NODE_ENV === 'development'`. Normal `npm run build` removes the route, implementation and CSS from executable production assets. `npm run preview` serves a production build and will therefore not show this route. Do not change the gate or production environment configuration merely to expose the review page.

A wider deployment remains a separate decision, including SoundCloud's [embed terms](https://soundcloud.com/terms-of-use), recording rights, track mappings, privacy and device checks. In particular, the player/widget terms include consent requirements for genre-focused sites; Hazzat should clarify the applicable permission before a public rollout.

## Verification

Passed locally:

- TypeScript `npm run typecheck`.
- All 30 prototype tests: URL normalization/rejection, explicit loading, no iframe before consent, sample labeling, frame replacement, safe fallback, close/focus, reload, timeout cleanup, late detached-frame events, previous timers and Arabic labels.
- Full Jest: **54 suites passed; 646 tests passed; 2 dataset-dependent tests skipped**.
- All **5 build-tooling tests**.
- Production build, with the existing large-chunk and mixed OpenSheetMusicDisplay import warnings.
- Production JS/CSS scan: no `/Preview/SoundCloud`, `w.soundcloud.com/player/`, or prototype CSS selectors.
- ESLint on changed/new TypeScript files: **0 errors, 0 warnings**.
- `git diff --check`.

Full repository lint does not pass: **120 errors and 9 warnings in unchanged files**. These include pre-existing test-rule violations; no unrelated cleanup is included.

Browser verification and screenshots are pending because the available browser could not reach the local development server. No screenshots are included, and this is not evidence of a working or broken SoundCloud recording.

No audible/full-track playback, real iOS Safari/Android Chrome, or assistive-technology checks have been claimed from unit tests. Responsive CSS is not equivalent to verified mobile behavior.

## Browser review checklist

- Capture the initial page and the loaded sample player at desktop and narrow viewport widths.
- Confirm there is no SoundCloud frame request until **Load SoundCloud player** is pressed.
- Check Play/Pause, seek and the external fallback with an available public recording.
- Replace and reload the recording, then close it and navigate Back/Forward. Confirm there is never more than one frame or lingering playback.
- Try an invalid link and an unavailable track, and check the fallback/loading feedback.
- Check Arabic direction, light/dark appearance, keyboard focus and a real mobile browser.
- Verify the page is absent from a normal production build.
