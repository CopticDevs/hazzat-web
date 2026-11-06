# PPE YAML release operations — cutover complete

Pipeline [17, CopticDevs.hazzat-web-ppe-release](https://dev.azure.com/CopticDevs/hazzat-api/_build?definitionId=17)
is the PPE release owner, folder `\hazzat-web`, default `refs/heads/develop`, YAML
`.pipelines/azure-pipelines.release-ppe.yml`. Classic definition 10 is retained
**disabled**, revision 6. [PR 288](https://github.com/CopticDevs/hazzat-web/pull/288)
merged `2050932f765f50587017977f0b75f0b76b046b88` after classic disable/drain.

## Verified rollout

Manual [3627](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3627)
consumed build 3626 with the temporary test opt-ins; actual upload and 83-file
manifest/live checks passed. First automatic [3630](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3630)
consumed exact build 3629. Later automatic [3652](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3652)
succeeded from build 3651, source `09641a56f48b20dbd489455ea66163465fa9aeb6`.
Owner-confirmed target is `brave-field-055faf010.1.azurestaticapps.net` →
`https://ppe.hazzat.com/`. These IDs are evidence, not a permanent rollback default.

## Current behavior

Root CI/PR are none. `ppeBuild` references build definition 14,
`\hazzat-web\CopticDevs.hazzat-web-ppe`; successful completion on
`refs/heads/develop` triggers release. Automatic alias, resource branch/commit and
pipeline code branch/commit must match. Exact `HazzatWebBuildPpe` is downloaded
by selected runID without rebuilding. Manual Run > Pipeline artifacts > ppeBuild
allows successful non-PR artifacts across branches and deploys without the former
manual test opt-ins. Failed/partial/PR/unsupported build reasons are rejected.

Both paths validate project/repository/build/artifact, layout/symlinks and hashes,
then require classic 10's id and strict boolean isDisabled=true before upload.
Missing/inaccessible metadata fails closed. Static output is uploaded without
Oryx rebuild to the confirmed target; live homepage comparison follows. Stage
sequential locking does not protect against classic or external writers.

## Rollback and changes

Coordinate a window and refresh the actual live artifact and downloadable rollback
manifest. For content rollback, select that exact retained build in the manual
picker while classic stays disabled. Inspect task/log/target outcomes before any
retry; failure after upload may already have changed the site.

For ownership rollback, first stop new YAML completion/manual entry as authorized,
then inspect/drain YAML runs and upstream build14 activity. Only then re-enable
classic with its recorded develop artifact trigger. Do not create two automatic
owners. A YAML revert awaiting merge has not stopped current triggers. Preserve
history; never infer disabling canceled already-created releases.

Future code changes go through develop review/gates. See
[rollout status and access limits](azure-release-migration.md) for approval history,
secret handling, permission differences and optional untested areas. Historical
[manual test](azure-ppe-controlled-test.md) and [inventory](azure-ppe-release-plan.md)
are evidence, not outstanding activation instructions.
