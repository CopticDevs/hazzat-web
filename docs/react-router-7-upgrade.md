# React 18 and Router 7 migration

This change upgrades the React 17 application to React/React DOM 18.3.1 and React Router DOM 7.18.5, including the modern `createRoot` entry point. It is based on develop commit `8ceaf2dc050e311c77b53e78a4192bfcab2dd5af`.

## Compatibility decisions

- Router 7.18.5 declares React/React DOM >=18 and Node >=20. Use Node 24 for development and verification, matching the existing pipeline. The package now declares the Router minimum Node version.
- React 18.3.1 is the deliberate compatibility target. React's [upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) recommends 18.3 before React 19 to expose deprecated APIs. This completes the Router 7 upgrade without coupling it to a React 19 or build-system migration.
- React types move to 18.3.31/18.3.7. Providers explicitly declare children, and the reader's arrays of rendered elements use element types instead of HTML attribute types.
- Testing Library React 16.3.0 and DOM 10.4.2 support the concurrent root. Role queries already match string names exactly; obsolete `exact` options are removed without relaxing the assertions. The debounce test awaits asynchronous React updates.
- CRA moves from 5.0.0 to its 5.0.1 patch. TypeScript 4.9.5 remains within CRA's declared TypeScript 4 peer range. The lockfile also refreshes related Babel, ESLint, and React UI transitive dependencies. No force, legacy-peer-deps, or dependency overrides are required.
- CRA's Jest 27 cannot resolve Router's `react-router/dom` package export. A narrowly scoped Jest mapping targets the published CommonJS DOM entry point. The test setup supplies the browser encoding APIs missing from jsdom. Reassess the mapping when replacing CRA/Jest or upgrading Router's package layout.

The application continues to use declarative BrowserRouter and its existing nested routes. Relative season links, absolute hymn/format links, query settings, and deprecated route redirects are covered by regression checks. StrictMode stays enabled; bootstrap tests verify mount/cleanup/remount and final unmount, and a nested-reader test verifies that stale requests cannot replace current content.

## Verification

Verified locally with Node 24.22.2 and npm 11.19.1:

| Check | Result |
| --- | --- |
| `npm ci --strict-peer-deps --no-audit --no-fund` | Passed; no peer overrides |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; existing large-bundle advisory remains |
| `CI=true npm test -- --watchAll=false --runInBand` | 53 suites passed; 616 tests passed; 1 optional suite/2 tests skipped |
| Final bootstrap/navigation/search rerun | 3 suites, 79 tests passed; no React act warnings |
| `npm run lint` | 120 errors and 9 warnings, matching the previously recorded baseline; no added diagnostics |
| Headless Edge against production build | Nine scenarios passed, no uncaught page errors or mutation requests |
| Offline Python release-guard tests | 28 passed; 3 symlink checks blocked by Windows privilege error 1314, including outside the sandbox |

Browser checks used isolated v5 content, audio-link, video-frame, and external-script fixtures. They covered direct nested deep links and reload; repeated navigation and Back/Forward; search-to-hymn navigation and query preservation; Types/Tunes redirects and history replacement; relative season navigation and parameters; audio and video routes; loading, failure, retry and invalid-address recovery; and a 390 x 844 mobile reader. External requests were intercepted, and non-read methods were blocked. Actual remote media playback, live-feed integration, Safari/Firefox, and deployment were not tested.

The npm install reports existing package deprecation/install-script advisories. Optional native/headless rendering tests still require their separate environment. This change does not modify pipelines, application data, Dependabot ignores, or PR #269.

## Publication

Review the local diff and these verification limits, then publish a PR against `develop` when authorized. Keep Dependabot #269 open until the coordinated upgrade is reviewed and integrated. Do not treat this local verification as a deployment or production acceptance check.
