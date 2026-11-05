# Meaningful unit coverage

Measured against develop commit `60b5ef5649782f78d46adde941171bc6f391bd21`.

## Reproduce

```sh
CI=true npm run test-unit -- --runInBand --coverage --coverageReporters=json-summary --coverageReporters=json --coverageReporters=text --coverageReporters=cobertura
npx tsc --noEmit
CI=true npm run build
```

## Results

The same Jest source inclusion settings were used before and after. No coverage exclusions or ignore directives were added.

| Metric | Baseline | After |
| --- | ---: | ---: |
| Statements | 81.25% | 95.62% |
| Branches | 76.00% | 90.76% |
| Functions | 84.79% | 96.65% |
| Lines | 82.16% | 96.18% |

- Tests: 375 to 613 passing; the same 2 optional dataset checks remain skipped.
- Suites: 29 to 53 passing; the same optional dataset suite remains skipped.
- TypeScript and the production build pass.
- Standalone ESLint still reports the baseline 120 errors and 9 warnings. Comparing diagnostics by file, rule, message and severity found no new diagnostics. The repository does not currently define a standalone lint script.

### Application-only detail

The broad report above includes `src/testSupport/ContentAvailability.audit.tsx`, an opt-in external-dataset audit, and `sharedServiceFixture.ts`, a test fixture. The audit is not executed by ordinary unit tests. For clarity, summing the same JSON coverage counters without `src/testSupport/` gives the application-only figures below. This is a separate analytical breakdown, not a change to Jest configuration or the headline denominator.

| Metric | Baseline | After |
| --- | ---: | ---: |
| Statements | 84.18% | 99.18% |
| Branches | 78.46% | 93.79% |
| Functions | 87.13% | 99.40% |
| Lines | 84.72% | 99.30% |

## Behavior covered

- Provider validation, cache eviction, conditional responses, error recovery, search matching/ranking and accessors.
- Coptic evening date boundaries, year/month rollover, season sorting, route parsing, display-name fallbacks and number localization.
- Menu ordering, media alternatives, Arabic rendering, format selection, async stale responses, error/retry flows, scroll restoration, and search navigation.
- Booklet custom format selection, preview invalidation and service ordering.
- Real generated PDF page destinations, overflowing tables of contents, long titles, SVG/vector/raster artwork handling, score export, resource cleanup and failure fallbacks.
- Environment selection, startup provider wiring, performance reporting, corrupt preferences, size bounds, cross-tab storage filtering and legacy media-query listeners.

The repeated-digit regression exposed one production bug: Arabic conversion replaced only the first occurrence of each digit (`11` became `١1`). The new test failed before the minimal global-replacement fix and passes afterward, including negative decimal values.

## Remaining gaps

Full coverage is deliberately not forced through inaccessible implementation details. Remaining application gaps are mostly redundant guards after successful route matches, impossible missing refs during mounted effects, default/fallback context callbacks, unreachable disabled-action guards, and defensive PDF text/layout conditions. Some alternate layout/optional-field branches remain unexercised. The optional full-dataset audit is separate from unit testing and was not run.

The application has 18 uncovered executable lines in this run. Tests do not monkey-patch regex internals or React refs solely to reach impossible states. External rendering/network boundaries are mocked, while assertions verify observable outputs, state transitions, cleanup, and PDF structure.
