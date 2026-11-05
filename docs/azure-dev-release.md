# Manual dev YAML release

This separate manual release pipeline targets **https://dev.hazzat.com/**. Its first
controlled deployment succeeded in pipeline 16, run 3614. The current candidate replaces typed build parameters with Azure’s manual resource
version picker. The revised picker deployment succeeded in run 3617; disabling classic is still pending;
no automatic triggers are enabled. The classic release remains in place; the PPE scaffold remains blocked, and production is unchanged.

## Successful controlled validation (2026-11-05)

[Run 3614](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3614&view=results)
ran manually in definition 16 and succeeded at `2026-11-05T22:29:55Z` using:

- Pipeline code branch `issue-274-manual-release`, commit
  `3a0aac7df575e3f2c4657b70b7fa971c7a6930d9`, before the file rename.
- Artifact build 3354 from definition 12, branch `refs/heads/codex/public-skin-cleanup`,
  commit `4a98e8d2451d23de23102bd47fb2df87f4775ec0`, artifact `HazzatWebBuildDev`.
- Both manual opt-ins enabled, with owner-confirmed token/target binding and an
  exclusive deployment window. The owner entered the existing token securely;
  no secret value was read or included in this repository.

Provenance, exact-build download and layout checks passed. The published
`dev-artifact-inspection` manifest matched all 81 files in the retained artifact.
[Deployment task log 10](https://dev.azure.com/CopticDevs/hazzat-api/_apis/build/builds/3614/logs/10?api-version=7.1)
reported Deployment Complete for `yellow-forest-07103e310.1.azurestaticapps.net`,
with Oryx skipped and no API directory. The pipeline's live comparison passed.
Independent HTTP 200 responses from dev matched the retained artifact:

| File | SHA-256 |
| --- | --- |
| `index.html` | `d7d81472b68f75cfa28c9d40a8c62e4163f493429e5050014d360d89cc7b57b0` |
| `static/js/main.81f14208.js` | `2be44c2a5e68a1e87530deea498661016304a87e25eab4ee0687472d12493662` |
| `static/css/main.665fda95.css` | `e56aab9fc171f2e7997b7dde01f7c3e9f8587912e9bec300d822078465759f98` |

This records actual deployment-task execution, not only unchanged content. It does
not establish full interactive application coverage, PPE validation, or cutover.

## Successful manual-picker validation (2026-11-05)

[Run 3617](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3617&view=results)
succeeded at `2026-11-05T23:13:44Z` in definition 16 with code commit
`3d8afe1dc1cb5b0fe3c9b0ff49117e8b8ceff63c`. In **Run → Pipeline artifacts →
devBuild**, the default was build 3599 (successful, develop); explicitly selecting
3354 updated the summary correctly. The browser queued exactly one controlled run
with 3354 after the owner confirmed the test window.

Provenance and download logs confirm build 3354, source branch
`refs/heads/codex/public-skin-cleanup` and commit
`4a98e8d2451d23de23102bd47fb2df87f4775ec0`. The published manifest matched all
81 retained artifact files. The AzureStaticWebApp task completed deployment to the
verified dev hostname, without Oryx or API build. Pipeline live comparison and
independent homepage/main JS/main CSS HTTP 200 hashes matched the table above.

Compiled YAML retained `lockBehavior: sequential` and the stage succeeded. The
authenticated browser showed the Exclusive lock check Passed with "Lock acquired".
The public timeline/log inspection did not expose that acquisition record.
One run does not demonstrate concurrent-run serialization; no second run was queued
to manufacture contention. This validation does not itself merge the PR, switch the
code default branch or disable classic.

## Verified dev contract

- [Classic definition 9](https://vsrm.dev.azure.com/CopticDevs/hazzat-api/_apis/release/definitions/9?api-version=7.1):
  `hazzat-web-dev`, revision 4, environment 9 `DEV`, no release triggers. Its secret
  `deployment_token` is local to that environment, not inherited by YAML; no variable
  groups are linked. Effective ACLs remain to be checked by the owner.
- [Current build definition 12](https://dev.azure.com/CopticDevs/hazzat-api/_apis/build/definitions/12?api-version=7.1):
  `CopticDevs.hazzat-web-dev`, revision 2, YAML `.pipelines/azure-pipelines.dev.yml`,
  GitHub `CopticDevs/hazzat-web`, default branch `refs/heads/develop`.
  Historical release metadata calls this build `CopticDevs.hazzat-web`; use its ID.
  Checked-in dev YAML disables CI/PR triggers. The REST definition also contains
  CI/PR trigger metadata; verify effective UI settings without modifying them.
- Dev builds publish `build` as Container artifact `HazzatWebBuildDev`.
  The release path is `_CopticDevs.hazzat-web-dev/HazzatWebBuildDev`.
- [Release 960](https://vsrm.dev.azure.com/CopticDevs/hazzat-api/_apis/release/releases/960?api-version=7.1)
  deployed successful manual [build 3354](https://dev.azure.com/CopticDevs/hazzat-api/_apis/build/builds/3354?api-version=7.1),
  branch `refs/heads/codex/public-skin-cleanup`, commit
  `4a98e8d2451d23de23102bd47fb2df87f4775ec0`. Dev is not restricted to PPE's develop
  branch assumption: the selected resource supplies its branch and commit automatically.
- The successful dev log names `yellow-forest-07103e310.1.azurestaticapps.net`.
  That host redirects to `dev.hazzat.com`; both homepage responses exactly matched
  build 3354's retained artifact during the read-only readiness check.

## Existing Azure pipeline

Definition **16**, `CopticDevs.hazzat-web-dev-release`, is in `\hazzat-web` and
uses `.pipelines/azure-pipelines.release-dev.yml` from
`refs/heads/issue-274-manual-release`. The rename/move preserved its secret binding,
permissions and run history. Keep this pipeline identity; do not recreate it.
Only the deployment task receives the existing secret `deployment_token`.
Never put its value in parameters, logs, artifacts, documentation or commands.
The owner confirmed its SWA default hostname is
`yellow-forest-07103e310.1.azurestaticapps.net`, with custom domain `dev.hazzat.com`.
The task's `default_hostname` is not an independent security boundary.

## Manual selection and remaining parity checks

Classic definition 9 is enabled, but its artifact CD trigger and PR trigger are
disabled and it has no schedule. Create release defaults to **Latest** from build
12 without a branch filter, permits explicit versions, and starts DEV after release
creation without approvals/gates. Its execution policy permits one deployment at a time.
The replacement likewise has no CI, PR, schedule or pipeline-completion trigger.
Starting a manual run deploys its selected artifact, without extra opt-in boxes or
branch/commit typing.

The `devBuild` pipeline resource names the verified build-12 folder/name. Omitting
`version`, `branch` and `tags` uses Azure's default selection across branches.
The selected resource version is pinned for the entire run. Provenance checks compare
its ID, source branch and commit with build metadata; the download uses that same ID,
never a later lookup of Latest. No rebuilding occurs.

**Accepted safety distinction:** the owner explicitly accepted rejecting failed and PR builds after the picker revision was published. Eligibility is not claimed identical to classic. Microsoft documents YAML's
default as the latest successful pipeline run. The manual picker can display failed
and in-progress versions as well. The existing validator intentionally permits only
completed successful builds with reason `manual`, `individualCI` or `batchedCI`,
with a `refs/heads/...` source branch and the expected Container artifact. PR,
partially successful, failed, canceled and other build reasons remain rejected before
deployment. Classic's saved Latest setting does not establish its result/reason
eligibility. Preserve this accepted restriction; do not silently broaden it or claim exact
eligibility equivalence.

The latest observed successful definition-12 build was **3599**, on develop, commit
`66e85d4070738eea89d3d39658a0a9b4afc8b12e`. The browser verified the YAML picker default was 3599 and allowed selection of
3354 across branches; defaults may advance. Microsoft's resource
guide describes default resolution in terms of successful CI runs; run 3617
independently establishes selection of existing manual build 3354. For a no-content-change
validation, explicitly select retained build **3354** after rechecking the live baseline.

`DeployDev` has `lockBehavior: sequential`. Azure documents an automatically created
stage-level lock for a named stage with this setting. It serializes this pipeline's
runs; it does not lock classic or other writers. Run 3617 validated Azure compilation, picker selection and this stage arrangement.
Concurrent-run contention remains untested; compilation alone does not demonstrate it.

## Queue and verify a controlled manual deployment

1. Inspect all queued, approval-pending, retrying and running deployments to this
   dev resource, across classic definition 9 and any other pipeline/manual client.
   Agree an exclusive window with other operators. Keep classic triggers unchanged.
   If automation or another writer can race the deployment, do not queue it; report the
   coordination requirement. This inspection is a snapshot, not a cross-pipeline lock.
2. Record the currently deployed build and known-good rollback ID/ref/commit and
   retain its artifact. Recheck that build 3354 is still the live baseline before
   treating it as rollback. Record existing trigger/settings snapshots for comparison.
3. Open **Run pipeline** on definition 16 using the reviewed pipeline-code ref.
   Under **Pipeline artifacts**, open **devBuild** and inspect the default version, or select
   an explicit existing definition-12 version across branches. Record its run ID.
   Branch and commit come from the resource metadata; there is nothing to type.
   If Azure requests resource permission, authorize only pipeline 16 to build 12
   through the existing owner workflow; do not grant all pipelines access.
4. Review that version and click Run once. This now starts deployment directly.
   The stage additionally requires `Build.Reason == Manual`; automatic triggers
   remain disabled. Provenance failures stop before the deployment task.
5. The single job checks provenance, downloads that exact build, rejects missing
   output or symlinks, publishes a file-hash manifest, then deploys without building.
   Only the Azure deployment task receives `$(deployment_token)`. The final read-only
   check compares the dev homepage to the downloaded index with bounded retries.
6. Record run URL, build ID/ref/commit, manifest, task result, target URL and live
   check result. Exercise homepage, help, hymn search, Hazzat rendering, static assets,
   deep links and content retrieval manually. A matching homepage alone cannot prove
   the deployment task ran or that all application behavior works, especially when
   redeploying the currently live build. Keep task logs/results as execution evidence.

If the deployment task or live check fails, inspect the actual target state before
retrying. Failure after deployment does not undo the write. Keep exclusive ownership;
if rollback is needed, manually redeploy the retained known-good exact dev build
through the verified classic definition or this pipeline, then repeat validation.
Do not rebuild, change triggers, or deploy to PPE/production as rollback. Finish by
confirming classic triggers and PPE/production settings remain unchanged.

## Retire classic only after replacement verification

After the manual picker/default and controlled deployment have been verified, drain
all queued, pending and running classic DEV releases and pipeline-16 deployments.
The authenticated owner uses classic definition **9 → More actions → Disable**.
Preserve history, artifacts and existing trigger settings; do not delete the definition
or change PPE/production. Verify its disabled state and that stale releases cannot
resume. Pipeline 16 then owns manual dev releases. No automatic CI/CD is introduced.

If the replacement needs to be withdrawn, stop new YAML runs and drain/cancel them,
inspect actual target state, then re-enable classic 9 as the sole owner. Never leave
both available to deploy concurrently. Choose the retained known-good build explicitly;
Latest may have changed. Record ownership transitions and deployed artifact IDs.

## Local validation and limits

`PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s .pipelines/tests -v`
tests metadata selection, rejection paths, downloaded layout and mocked live checks.
These tests do not establish Azure YAML compilation, manual picker defaults or locking.
Run 3614 established actual execution of the earlier dev YAML. Run 3617 additionally validated the resource-picker revision and actual deployment.
Classic retirement and switching the default code branch remain separate actions;
keep the candidate code ref until the reviewed YAML exists in develop after an
explicitly authorized merge.
PPE execution and full interactive smoke testing remain separate unfinished work.

References:
- [Pipeline resource defaults and metadata](https://learn.microsoft.com/en-us/azure/devops/pipelines/yaml-schema/resources-pipelines-pipeline?view=azure-pipelines).
- [Manual resource version picker](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/resources?view=azure-devops).
- [Classic artifact selection](https://learn.microsoft.com/en-us/azure/devops/pipelines/release/artifacts?view=azure-devops).
- [Stage-level exclusive lock](https://learn.microsoft.com/en-us/azure/devops/pipelines/yaml-schema/stages-stage?view=azure-pipelines#exclusive-lock-at-stage-level).
- [Secret scope](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/set-secret-variables?view=azure-devops).
- [AzureStaticWebApp task schema](https://github.com/microsoft/azure-pipelines-tasks/blob/master/Tasks/AzureStaticWebAppV0/task.json).
