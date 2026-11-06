# Issue 285 toolchain remediation

Base: develop `8c61d27ea7fe5897073761990c0fb62e6931f4ac`. The supplied 47-alert export is a snapshot, not a current GitHub alert scan. Reconciliation checks every resolved package copy against the exported ranges; it does not prove reachability or alert closure.

## Vite checkpoint (Jest 27 retained)

CRA build/development ownership is replaced by Vite 8.3.6, React plugin 6.2.1 and SVGR plugin 5.2.0 without SVGO. Jest and lint ownership were extracted in a preceding commit. No forced overrides or application feature changes are involved.

`issue-285-vite-reconciliation.json` records all 47 alerts and exact before/after paths. Relative to the base, 19 more findings are addressed, 25 were already addressed, and three remain: #134 once, #135 uuid, #246 deepmerge. Removed paths were CRA's SVGO/nth-check, PostCSS 7, serialize-javascript, webpack development server and middleware chains.

Validation: strict-peer npm ci and npm ls; all 616 tests pass (53 suites; one optional suite/two tests skipped); typecheck/build pass; lint remains 120 errors/9 warnings; three configuration contract tests and 31 release-guard tests pass. Local production fixture smoke passes at 1280 and 390 pixels for SVG logo, reader/direct-link reload, format navigation/Back, Fonts, legacy redirect, mobile menu. Development smoke performs an actual source edit and observes the HMR update without a page reload, restores the file, then reloads successfully. No uncaught errors or failed local asset responses were observed. This is fixture coverage, not live PPE coverage.

The build reports a large main chunk and an ineffective dynamic import of opensheetmusicdisplay (also imported statically); these are performance warnings, not failed checks. Existing browser targets, explicit public content environment variables, SPA routing, assets, and build/static release layout are retained.

Reproduce the mapping with:

```
node scripts/reconcile-dependabot.cjs . /path/to/hazzat-dependabot-open.json 8c61d27ea7fe5897073761990c0fb62e6931f4ac
```
