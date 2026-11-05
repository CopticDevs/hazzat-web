# Azure release migration (#274)

Status: **dev cutover complete; PPE deployment remains blocked and #274 remains open**.
Dev pipeline 16 now uses develop and classic dev definition 9 is disabled. PPE classic
10 remains enabled with automatic develop releases. The local PPE candidate and
fresh read-only inventory are described in [the PPE plan](azure-ppe-release-plan.md).
No PPE/production cutover has occurred.

## Verified inventory

Read on 2026-11-05 against default branch `develop` at
`8686323afdd841dff5c82a3244a906d1146b8750` and these public Azure REST resources:

- [PPE definition 10, revision 5](https://vsrm.dev.azure.com/CopticDevs/hazzat-api/_apis/release/definitions/10?api-version=7.1)
- [PPE release 1033, Release-192](https://vsrm.dev.azure.com/CopticDevs/hazzat-api/_apis/release/releases/1033?api-version=7.1)
- [Build 3598](https://dev.azure.com/CopticDevs/hazzat-api/_apis/build/builds/3598?api-version=7.1)
- [Build 3598 artifacts](https://dev.azure.com/CopticDevs/hazzat-api/_apis/build/builds/3598/artifacts?api-version=7.1)
- [Production definition 11, revision 4](https://vsrm.dev.azure.com/CopticDevs/hazzat-api/_apis/release/definitions/11?api-version=7.1)

The editor previously required sign-in; public REST reads subsequently exposed
the saved definition. The table distinguishes saved configuration from unresolved
resource ownership/security. Do not export raw responses containing variable values.

| Area | Verified PPE configuration |
| --- | --- |
| Release | `hazzat-web-ppe - CD`, definition 10, environment 10 `PPE`; only one environment |
| Artifact source | Build definition 14 `CopticDevs.hazzat-web-ppe`, project `hazzat-api` (`c3ad63de-5431-426e-8009-fe5331eea17a`) |
| Alias | `_CopticDevs.hazzat-web-ppe` |
| Build contract | `.pipelines/azure-pipelines.ppe.yml` publishes `build` via `PublishBuildArtifacts@1`, Container artifact `HazzatWebBuildPpe` |
| Reference release | Release 1033 used build ID 3598, number `20261105.20`, successful/completed, branch `refs/heads/develop`, commit `66e85d4070738eea89d3d39658a0a9b4afc8b12e` |
| Artifact storage | Build 3598 reports Container `#/42654130/HazzatWebBuildPpe`; this storage ID is evidence, not a reusable pipeline setting |
| Agent | Agent-based job; queue 9; `ubuntu-26.04`; no demands; no parallel execution; job timeout 0, cancel timeout 1 minute; OAuth access token disabled |
| Download | Automatic classic artifact download enabled; no explicit download filters |
| Deployment | One enabled task, `Static Web App: hazzat-web-ppe`, task ID `18aad896-e191-4720-88d6-8ced4806941a`, version `0.*` (`AzureStaticWebApp@0`); condition `succeeded()`; no continue-on-error |
| Paths | `cwd` empty (classic default working directory); `app_location` `_CopticDevs.hazzat-web-ppe/HazzatWebBuildPpe`; output, API, routes, config, and data API locations empty |
| Build behavior | `skip_app_build=true`, `skip_api_build=false`; app/API build commands empty; no API input; static export and verbose false |
| Target selection | `deployment_environment`, `production_branch`, and `default_hostname` empty. Token selects the SWA resource; blank deployment environment refers to that resource's default/production slot, even though the release is named PPE |
| Secrets/connections | Environment-scoped `deployment_token`, flagged secret; task references `$(deployment_token)`. No variable groups or release-level variables. `azure_access_token` empty; no service-connection input in this task |
| Automatic trigger | Artifact-source trigger for that alias, branch `develop`, no tags; default artifact version `Latest`; environment starts on `ReleaseStarted`; no schedules; PR deployment disabled |
| Approvals/gates | Pre/post approvals are automated; no manual approvers; pre/post gate lists empty. Saved approval options disallow creator approval and skipping based on previous environment, with identity revalidation false and timeout 0 |
| Concurrency | Classic environment concurrency 1, queue depth 0; this does not serialize another pipeline |
| Other behavior | Failure-only email to environment owner/release creator; deployment status publishing enabled; retention 30 days, minimum 3 releases, retain build true |

Production is **not in the same classic definition**: definition 11
`hazzat-web - CD` contains environment 11 `Prod`, with source build definition 15
`CopticDevs.hazzat-web`, alias `_CopticDevs.hazzat-web`. Its detailed security,
tasks, target and trigger migration are out of this first PPE change. The existing
production build publishes `HazzatWebBuildProd`; never substitute a PPE artifact
for it merely because both contain a static frontend.

## Local PPE candidate

See [the refreshed PPE plan](azure-ppe-release-plan.md) for the latest release 1038 /
build 3620 evidence, observed hostname, unchanged automatic classic behavior, and
specific remaining security/eligibility decisions.

The separate PPE YAML now selects the `ppeBuild` pipeline resource and pins its run
ID, branch and commit. Inspection accepts manual or the intended resource-trigger
context, verifies definition 14/project/repository/success provenance (develop for automatic
runs; any non-PR branch for manual selection), and
downloads the exact Container artifact without rebuilding. Automatic contexts also
must match the triggering alias and pipeline code commit. The Python layout check
rejects symlinks/missing static output and publishes a JSON hash manifest.

All automatic triggers remain disabled. DeployPpe retains the literal false condition;
no parameter unlocks it. Its sequential lock and repeated provenance/layout checks
prepare a controlled execution path, but no PPE deployment or Azure validation has
occurred. The observed hostname is supplied to the blocked task; token ownership and
effective permissions still require owner verification.

## Required before unblocking deployment

1. Re-read definition 10 and review any drift from revision 5. Verify the actual
   SWA resource/subscription and hostname bound to `deployment_token`, and confirm
   it is the intended PPE target. A task display name alone does not prove this.
2. Inventory effective classic definition/environment permissions and inherited
   ACLs, queue/pool permissions, secret readership/use, and resource ownership.
   Public definition reads do not establish these. Confirm whether organizational
   checks/policies exist outside this definition; empty gate lists do not prove
   there are none.
3. Select the intended access-control boundary and authorize only the intended
   pipeline and build-artifact readers. If a protected Azure environment is chosen,
   pre-create it with reviewed checks and bind a deployment job to it; disable its
   automatic downloads with `download: none`. Classic has automated approvals only,
   so an extra manual gate is an intentional change. Review queue/cancel timeout, failure
   notification, status publishing, retention, and lock/queue behavior separately;
   classic and YAML defaults are not assumed equivalent.
4. Provision the existing `deployment_token` secret reference securely for the
   YAML pipeline with the intended scope; confirm its target without exposing the
   value. Do not paste tokens into Git, issues, logs, or this document. Verify that
   no service connection is required beyond the token-based task configuration.
5. Test approval/check enforcement and denial behavior with the intended operator
   roles. Classic automated approvals/empty gates do not establish YAML environment
   permissions. Any chosen extra approval must be documented as a deliberate change.
6. In a reviewed change, remove the literal deployment block only after recording
   those decisions and receiving authorization for Azure setup and controlled runs.
   Keep all automatic triggers disabled through PPE testing. Neither creating this
   file nor a green inspection run is evidence that deployment is ready.

## Controlled PPE validation and ownership

These are future operator steps, not actions performed by this change.

1. Record a known successful build ID, commit, artifact name/path and file hashes;
   retain the build/artifact. Build 3598 is a reference, not a default choice.
   Confirm the build-time content endpoint is appropriate; never rebuild or edit
   the selected output to switch environments.
2. Keep the classic and YAML definitions side by side for comparison, with YAML
   automation disabled. Assign one operator and one deployment owner for the PPE
   target during a controlled window. Freeze classic PPE release/deployment triggers
   and coordinate manual queues before allowing a YAML write to that target.
3. Enumerate queued, approval-pending, retrying and running classic/YAML deployments.
   Let running work finish or cancel it deliberately and verify termination. Prevent
   stale queued/approved classic releases from resuming later. A YAML exclusive lock
   alone cannot protect against a classic release that does not share that lock.
4. Run artifact inspection first. Compare source ID/commit and the full manifest to
   the retained artifact. Then, after explicit deployment authorization and removal
   of the block, perform one manual YAML deployment to PPE using that same ID.
5. Verify the target hostname, uploaded paths/hashes and absence of Oryx/API build;
   exercise homepage, help, hymn search, Hazzat rendering, assets/deep links and
   content retrieval. Record run/deployment URLs, build ID/commit, manifest,
   target identity, approval/check results and operator sign-off. Exercise denied
   approval and concurrent queue scenarios before accepting the migration.

## Cutover and rollback

- Establish a maintenance window and record the current successful artifact and
  exact trigger/filter settings. Disable classic automatic **release creation and
  deployment** for PPE first; control manual queue rights and reconcile all in-flight
  work as above. Verify no classic writer remains before transferring ownership.
- After manual PPE validation, a separate reviewed change may enable YAML completion
  triggers matching the verified branch/filter behavior. Design how the triggering
  run ID is bound to artifact selection; the candidate verifies resource-trigger context but automation remains off until
  the reviewed cutover and same-repository code-ref policy are in place.
- Retain the classic definition disabled, with its secrets/references and known-good
  artifacts available for rollback. Record a single automatic owner per target.
- On rollback, first disable YAML automatic triggers and stop/drain its queued and
  running deployments. With exclusive ownership confirmed, manually redeploy the
  retained known-good artifact through the classic definition, verify PPE, and only
  then restore the recorded classic trigger settings. Do not enable both definitions.
  Reverting YAML in Git alone does not stop queued runs or remove Azure UI overrides.

Production remains owned by definition 11 throughout PPE work. After PPE acceptance,
inventory production independently and repeat target, secret, permission, approval,
artifact and rollback validation before proposing a separate production migration.
Do not disable production automation as part of the PPE cutover.

## Validation and completion

### Dev readiness check (2026-11-05)

The user authorized a controlled migration test on `https://dev.hazzat.com`.
This is a separate target from PPE; the PPE scaffold was not repointed or unlocked.

- [Dev release definition 9, revision 4](https://vsrm.dev.azure.com/CopticDevs/hazzat-api/_apis/release/definitions/9?api-version=7.1)
  is `hazzat-web-dev`, environment 9 `DEV`, source build definition 12
  `CopticDevs.hazzat-web`, alias `_CopticDevs.hazzat-web-dev`, artifact
  `HazzatWebBuildDev`. Its release trigger list is empty. The checked-in dev build
  YAML also has CI and PR triggers disabled. No triggers were changed.
- [Latest dev release 960](https://vsrm.dev.azure.com/CopticDevs/hazzat-api/_apis/release/releases/960?api-version=7.1)
  succeeded using [build 3354](https://dev.azure.com/CopticDevs/hazzat-api/_apis/build/builds/3354?api-version=7.1),
  commit `4a98e8d2451d23de23102bd47fb2df87f4775ec0`, branch
  `refs/heads/codex/public-skin-cleanup`. The saved task uses the environment-secret
  reference `$(deployment_token)`, skips app build, and has no API location.
- [The successful deployment log](https://vsrm.dev.azure.com/CopticDevs/c3ad63de-5431-426e-8009-fe5331eea17a/_apis/Release/releases/960/environments/960/deployPhases/960/tasks/6/logs)
  reports `https://yellow-forest-07103e310.1.azurestaticapps.net`, skipped Oryx and no
  API. An HTTPS GET to that hostname redirects to `https://dev.hazzat.com/`.
- Downloaded the existing Container artifact through the public read API into
  memory: 9,196,842 ZIP bytes, 88 entries, 68 static files. Its
  `HazzatWebBuildDev/index.html` exactly matches HTTP 200 responses from both site
  URLs after redirects. All three SHA-256 hashes are
  `d7d81472b68f75cfa28c9d40a8c62e4163f493429e5050014d360d89cc7b57b0`.

Those initial reads established readiness, not deployment execution. Subsequently,
the owner configured pipeline 16 and its dev-only secret binding and confirmed the
target and exclusive window. The browser queued exactly one manual test:
[run 3614](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3614&view=results).
It succeeded using code commit `3a0aac7df575e3f2c4657b70b7fa971c7a6930d9` and
artifact build 3354. The actual deployment task completed, skipped Oryx, and deployed
no API. Its 81-file manifest matched the retained artifact; homepage, main JS and
main CSS matched live dev responses. See the [dev release runbook](azure-dev-release.md)
for exact provenance and hashes. After permanent naming, the manual-picker revision
also succeeded in [run 3617](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3617&view=results),
using code commit `3d8afe1dc1cb5b0fe3c9b0ff49117e8b8ceff63c` and the same build
3354. Its 81-file manifest and live homepage/JS/CSS matched the retained artifact.
The owner accepted rejecting failed and PR builds. The browser verified the
**Run → Pipeline artifacts → devBuild** picker default and explicit version selection.
The compiled sequential stage succeeded; the authenticated browser verified the
Exclusive lock check Passed with "Lock acquired". Concurrent-run contention remains untested.

This is a successful dev-only migration test, not PPE cutover. Future dev deployments
still require current target/rollback verification and an exclusive window. The
classic definition stays in place and automatic triggers stay unchanged. No token
value was retrieved or committed.

### Local validation

Local tests: `python3 -m unittest discover -s .pipelines/tests -v`. Parse the YAML
with a YAML parser and review the exact-build inputs and literal deployment block.
Local parsing alone is not Azure validation. Run 3614 validates the pre-rename dev
pipeline's actual execution, and run 3617 validates the manual-picker revision;
PPE schema/runtime validation and deployment remain
unperformed. No application build is needed for the naming/documentation update.

#274 remains open until a known PPE artifact is deployed successfully through YAML,
security/target equivalence is verified, and cutover evidence is recorded.

Task references: [DownloadBuildArtifacts@1](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/download-build-artifacts-v1?view=azure-pipelines),
[AzureStaticWebApp@0](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/azure-static-web-app-v0?view=azure-pipelines).
