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

## Vite-only publication validation (2026-11-06)

The publication branch contains the configuration extraction and Vite checkpoint only. Jest 27.5.1, jsdom 16.7.0, jest-junit 13.1.0 and TypeScript 4.9.5 remain; the separately assessed Jest 30/TypeScript 5.9 candidate and its application changes are excluded. Freshly fetched develop remains `8c61d27ea7fe5897073761990c0fb62e6931f4ac`.

Validation was rerun on the exact Vite code in its own worktree, not borrowed from the later candidate:

- `npm ci --strict-peer-deps`: succeeds (1,089 packages); `npm ls --all`: succeeds.
- Full `test-unit` run with Azure's Cobertura/lcov/text reporters: 53 suites/616 tests pass; one optional suite/two tests skipped. JUnit XML parses with zero failures/errors; Cobertura and lcov output verified. Line coverage 96.19%, branch coverage 90.81%.
- Typecheck and production build pass. All three configuration tests and 31 release-guard tests pass.
- Lint remains a failing baseline check: **120 errors/nine warnings**. Diagnostics are identical after normalizing the worktree path; no rules were disabled.
- Resolved browser targets match the repository's production browserslist (Chrome 109, Edge 151, Firefox 121, iOS 16.6, Opera 135, Safari 18.5 at this database snapshot). SPA mode and build/static output are verified.
- A separate actual build with PUBLIC_URL=/hazzat-contract places the prefix in HTML/static references and embeds the approved pipeline content URL; unlisted REACT_APP_* and VITE_* canaries are absent from JavaScript. SVG and binary artwork files are emitted.
- Local production fixture browser checks at 1280x844 and 390x844 pass home/SVG rendering, direct reader links/reload, format switching, Back/Forward, theme persistence, Arabic RTL persistence, horizontal overflow, Fonts, legacy redirect, and repeated/interrupted mobile menu interactions. Development checks perform a real source edit, verify HMR without a full reload, restore the source, and verify manual refresh. Browser console/uncaught errors, failed local requests, and HTTP asset failures are checked. Representative screenshots were visually inspected.

The fixtures contain synthetic English/Arabic content; these checks are not live PPE regression coverage. Audio and all PDF/font rendering combinations remain outside this smoke pass. Build warnings about the large main chunk and the mixed static/dynamic opensheetmusicdisplay import remain visible.

### Current audit comparison

The same current audit was applied to exact lockfiles for all three assessed checkpoints. Counts below distinguish unique advisory URLs from dependency entries; neither is a GitHub alert-closure count.

| Checkpoint | Distinct advisories | npm affected dependency entries |
| --- | ---: | --- |
| develop 8c61d27 | 22 | 34: 10 high, 8 moderate, 16 low |
| **This Vite stage, 43349b8** | **3: once, uuid, deepmerge** | **12: 2 moderate, 10 low** |
| Deferred Jest candidate c122fe3 (excluded) | 3: glob, minimatch, deepmerge | 19: 18 moderate, 1 low |

This stage addresses **19 additional entries from the supplied 47-alert export**; 25 were already addressed by its base, and #134 once, #135 uuid, #246 deepmerge remain affected. The separate Jest candidate introduces glob/minimatch advisories and is not included in this PR. This Vite stage introduces neither of them. Exact original-export paths/ranges are recorded in `issue-285-vite-reconciliation.json`; no alert is dismissed and issue 285 remains open.

Publication-validation logs, the browser harness, screenshots, and report files are retained outside the repository in `/workspace/issue285-toolchain-evidence/vite-publication/`.

## SVG compatibility correction

CRA 5.0.1 already disabled SVGO for component imports and enabled `titleProp` and `ref`. This Vite configuration now also enables `titleProp: true` and `ref: true`, while retaining only the JSX plugin. No optimizer or dependency is added. The SVG declaration describes the actual forwarded SVG ref and optional title/titleId props.

The tooling suite now has five tests. Its new integration test uses the real Vite configuration to compile the application's named-component/default-URL imports, renders the generated component with React DOM, and checks dynamic title updates, title IDs/aria-labelledby, root SVG ref forwarding/unmount, ordinary props, and byte-identical URL artwork. A compiler test accepts SVG refs and rejects HTML div refs. Disabling either titleProp or ref independently makes the integration test fail; it does not rely on the existing Jest SVG mock.

After this correction: all 616 tests, five tooling checks, typecheck/build, 31 release guards and console-aware desktop/mobile fixture smoke pass. Lint remains identical at 120 errors/nine warnings. package.json/package-lock.json and the complete original-export reconciliation are byte-identical to the previous PR head; no SVGO or additional deepmerge path is introduced, and the existing once/uuid/deepmerge findings remain. The separate Jest candidate is untouched.
