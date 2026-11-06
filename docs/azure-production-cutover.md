# Production YAML release operations — cutover complete

Pipeline [18, CopticDevs.hazzat-web-prod-release](https://dev.azure.com/CopticDevs/hazzat-api/_build?definitionId=18)
is the production release owner, folder `\hazzat-web`, default `refs/heads/master`,
YAML `.pipelines/azure-pipelines.release-prod.yml`. Classic definition 11 is retained
**disabled**, revision 7, with history for coordinated rollback.

## Verified sequence and results

- Token-free inspection [3640](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3640)
  validated build 3639 and published a matching 83-file manifest; upload was skipped.
- Controlled manual [3648](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3648)
  deployed build 3647 on master `431b1b8f0d8eec1e6d6fc82a18851a42cb621023` with both
  explicit confirmations. Classic was temporarily disabled/drained, then restored.
- Automatic implementation first merged to develop through
  [PR 294](https://github.com/CopticDevs/hazzat-web/pull/294), source
  `09641a56f48b20dbd489455ea66163465fa9aeb6`. Separate
  [promotion PR 295](https://github.com/CopticDevs/hazzat-web/pull/295) was held until
  the owner approved cutover and classic 11 was independently verified disabled
  and drained. Required gate 3654 passed before normal rebase merge.
- Master merge `f1e467c1c8b91b4f2544b18cce15240e1474539c` automatically produced
  [build 3655](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3655),
  `20261106.12`, then exactly one
  [pipeline18 run 3656](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3656).
  Run 3656 succeeded at 2026-11-06T08:13:49Z with PipelineCompletion alias prodBuild,
  exact build3655 and matching code/artifact commit. Both manual parameters were false.
- Ownership/provenance checks and actual upload passed; target was
  `proud-glacier-0cea24010.1.azurestaticapps.net` → `https://www.hazzat.com/`.
  All 83 published manifest hashes matched build3655. Independent homepage/main JS/
  main CSS HTTP200 hashes matched. At 08:14 UTC no duplicate YAML deployment,
  active project build or nonterminal classic release existed; classic latest
  remained 1043. Classic stayed disabled after permanent cutover.
- Post3656 browser desktop smoke passed home, Agios search (9 results), multilingual
  Trisagion, notation glyphs and deep-link reload. Audio/mobile were not tested.

## Automatic and manual behavior

Root release CI/PR remain off. Resource prodBuild references build15,
`\hazzat-web\CopticDevs.hazzat-web`, with completion filter `refs/heads/master`.
A successful build completion pins its exact `HazzatWebBuildProd` Container artifact.
Validators require expected project/repository/definition, completed success and a
non-PR CI/manual reason. Resource source branch/commit must match build metadata;
automatic code branch/commit must match the same source. No rebuild or arbitrary
latest resolution occurs after resource selection.

Production deployment code must come from master. Manual Run > Pipeline artifacts >
prodBuild retains successful non-PR artifact selection across branches. Manual
inspection is the default: deployment requires both `deployProd=true` and
`exclusiveProdWindowConfirmed=true`, within an approved operational window.
Automatic runs use their validated trigger path without falsely asserting manual
confirmations. These are deliberate safeguards; classic failed/PR selection
eligibility was not established as equivalent.

Both paths require classic11 id and strict isDisabled=true immediately before upload.
Sequential stage locking serializes this pipeline's own stage, not classic/external
writers. The ownership read is a snapshot, not a mutex. Missing/inaccessible
metadata fails closed. Default master and YAML conditions do not constrain a user
who is authorized to run edited YAML with the pipeline secret; see the documented
[access boundary](azure-release-migration.md).

## Future changes and single-owner rollback

All code/documentation changes go through develop first, then separate master
promotion. Review the full promotion diff and gates. A master promotion invokes
existing build15→pipeline18 automation, even for documentation-only changes;
account for that operational effect. Do not manually queue a second deployment if
trigger delivery appears slow; inspect upstream and resource-trigger runs first.

Before rollback, refresh the actual live build, source SHA, complete manifest and
retained downloadable known-good artifact. Build3655 is a dated verified baseline,
not a permanent default; classic does not automatically retain new YAML builds.
Apply the chosen retention policy or preserve evidence through an authorized action.

Content rollback: keep classic disabled, select the exact retained known-good build15
artifact via the master manual path, and use both confirmations in an approved
window. Verify provenance, task execution, target, hashes and smoke. Never rebuild.
A failed post-deploy check does not prove no upload occurred; inspect before retrying.

Ownership rollback: obtain coordination to stop YAML completion/manual entry,
verify persisted state, and drain YAML and upstream production work before restoring
classic's original master artifact trigger. An unmerged revert does not disable
current master triggering. Any emergency Azure pause needs scoped authorization.
Never restore classic while YAML can upload. Preserve histories; token rotation
or expanded permissions are not part of rollback.

Concurrent lock contention and exhaustive effective-user permission equivalence
remain untested; these are optional follow-ups, not unperformed cutover steps.
The [production inventory](azure-production-release-plan.md) records the underlying
contract. Issue274 closeout tracks documentation integration and final evidence.
