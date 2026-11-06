# Issue 285: remaining test dependencies

Validated locally on November 6, 2026, from develop
`b4e74f82487ab5aee364d1a69e31f57e1189d191`, on branch
`fix/issue-285-test-dependencies`. No publication or alert dismissal is part of
this phase. Application source, Vite configuration, test assertions and lint
rules are unchanged.

## Changes and compatibility

1. Upgrade jest-junit 13.1.0 to 17.0.0, resolving uuid 8.3.2 to 14.0.3.
   Use the supported Jest reporter API instead of the deprecated results
   processor. Version 17's asynchronous processor is not awaited by Jest 27:
   the initial investigation produced passing tests and valid XML but exit 1.
   The reporter interface fixes that incompatibility and retains junit.xml.
   This separately reviewable change is commit `12d49cf`.
2. Upgrade Jest, babel-jest and jest-environment-jsdom 27.5.1 to 29.7.0 and
   @types/jest to 29.5.14. jsdom moves from 16.7.0 to 20.0.3, bringing the
   supported http-proxy-agent 5.0.0 / @tootallnate/once 2.0.1 chain.
   TypeScript remains 4.9.5, with existing lint configuration and parser.

Jest 29 is an older compatible intermediate step, not a release with a verified
ongoing upstream security-support commitment. Its [upgrade guide](https://jestjs.io/docs/29.7/upgrading-to-jest29)
requires TypeScript 4.5 for jsdom 20, which the current compiler satisfies.
The [jest-junit documentation](https://raw.githubusercontent.com/jest-community/jest-junit/v17.0.0/README.md)
recommends reporters. Its Node >=20 requirement fits the existing supported
Node engine range and Node 24 pipelines. The excluded Jest 30 / TypeScript 5
candidate is not included. glob 7.2.0 and minimatch 3.1.5 remain; the new
advisories encountered with that candidate were not introduced here.

## Security reconciliation

The accompanying `issue-285-test-reconciliation.json` checks every installed
copy against all 47 original exported alert ranges: 44 were already unaffected
at this base, two are addressed in this local branch, and one still matches
scanner metadata. This does not establish GitHub alert closure or reachability.

| Alert | Introducing path and change | Result |
| --- | --- | --- |
| #134, low, [GHSA-vpq2-c234-7xj6](https://github.com/advisories/GHSA-vpq2-c234-7xj6) | jest-environment-jsdom → jsdom → http-proxy-agent → `node_modules/@tootallnate/once`: 1.1.2 → 2.0.1 | Patched supported v2 line; affected range <2.0.1 (separate v3 range >=3.0.0 <3.0.1). Test DOM/network tooling, not shipped browser code. |
| #135, moderate, [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | jest-junit → `node_modules/uuid`: 8.3.2 → 14.0.3 | Outside affected <11.1.1, >=12.0.0 <12.0.1 and >=13.0.0 <13.0.1 ranges. Test-report tooling. The described issue concerns v3/v5/v6 with external output buffers; the version fix does not depend on proving those calls reachable. |
| #246, low, [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) | jest-config → `node_modules/deepmerge`: 4.2.2 → 4.3.1 | Still matches GitHub/npm range >=4.2.0 <=4.3.1; authoritative CVE record rejects the vulnerability, as detailed below. |

Same-current-audit comparison is in `issue-285-test-audit-comparison.json`:

| Graph | Distinct underlying advisories | npm dependency entries |
| --- | --- | --- |
| develop baseline | 3: once, uuid, deepmerge | 12: 10 low, 2 moderate |
| Reporter-only phase | 2: once, deepmerge | 10 low |
| Final Jest 29 phase | 1: deepmerge | 6 low |

No new advisory was found in the final graph. npm's six entries include affected
parents and are not six distinct vulnerabilities or GitHub alerts.

### Deepmerge: conflicting advisory data

The authoritative [CVEProject record](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/93xxx/CVE-2026-93753.json)
marks CVE-2026-93753 REJECTED on November 2, 2026: “This CVE ID has been rejected
because it does not describe a security vulnerability.” GitHub's advisory,
last updated October 27, and the current npm audit still flag deepmerge.
Published latest 4.3.1 has no patch listed in that scanner metadata. This is a
data conflict, not evidence of an established unpatched CVE. No suppression or
dismissal was made, and a risky test-framework migration is not justified solely
by this rejected CVE.

The only installed immediate parent is jest-config 29.7.0 (^4.2.2), reached
through Jest's configuration/CLI packages. In its normalize.js, deepmerge is
called by mergeGlobalsWithPreset only when both preset and options globals
exist. This repository defines neither a preset nor globals. A read-only module
load trace of `jest --showConfig` recorded zero deepmerge loads. That establishes
this configuration path's behavior, not universal non-reachability under future
configuration changes. No deepmerge browser bundle path was found.

## Validation

- `npm ci --strict-peer-deps`: passed; `npm ls --all`: exit 0.
- `CI=true npm run test-unit -- --runInBand --coverage --coverageReporters=cobertura --coverageReporters=lcov --coverageReporters=text`:
  616 passed, 53 suites passed; optional one suite/two tests skipped.
- JUnit: 618 total, zero failures/errors. Cobertura and lcov produced;
  96.19% line and 90.81% branch coverage.
- Temporary expected-failure reporter probe: exit 1 and exactly one JUnit
  failure, verifying CI failure propagation. Probe is outside the repository.
- Reporter-only focused validation on Jest 27: 11 tests passed, exit 0 and valid XML.
- `npm run test-tooling`: all five passed, including actual generated SVG
  title/ref/URL behavior and declaration checks.
- `npm run build`: typecheck and production Vite build passed. Existing large
  chunk and mixed static/dynamic OSMD import warnings remain.
- Release guard unit tests: all 31 passed, with offline fixtures; these results
  do not claim a new live deployment or live endpoint validation.
- Lint: unchanged baseline 120 errors and nine warnings; normalized output
  matches the Vite baseline. No lint rules were weakened.
- Production comparison: all 62 emitted files have identical names; JS, CSS,
  HTML and assets are byte-identical to the validated Vite build. The only byte
  difference is source-map sourcesContent containing internal Rolldown asset
  placeholder IDs. No live/browser regression pass was run for this test-only
  phase, and prior live results are not counted as new validation.

Detailed logs, full fresh audits, report outputs, trace and build comparison
are preserved outside the repository at
`/workspace/issue285-test-dependencies-evidence/`. The tracked reconciliation
can be reproduced with `scripts/reconcile-dependabot.cjs`, the original
user-provided export and the base SHA above.
