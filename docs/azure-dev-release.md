# Manual dev YAML release

This separate manual release pipeline targets **https://dev.hazzat.com/**. Its first
controlled deployment succeeded in pipeline 16, run 3614. Permanent naming does not
transfer deployment ownership or enable automation. The classic release remains in
place; the PPE scaffold remains blocked, and production is unchanged.

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
  branch assumption: the operator must explicitly pin the selected branch AND commit.
- The successful dev log names `yellow-forest-07103e310.1.azurestaticapps.net`.
  That host redirects to `dev.hazzat.com`; both homepage responses exactly matched
  build 3354's retained artifact during the read-only readiness check.

## Existing Azure pipeline and rename sequencing

1. Keep **definition ID 16** and its token binding, permissions and run history.
   Do not recreate it. Before this rename its name was `hazzat-web-dev-yaml-test`,
   folder was root, and default ref was `refs/heads/issue-274-manual-release`.
2. Publish the reviewed file rename to that branch first. With no run in flight,
   the authenticated owner updates pipeline 16's `process.yamlFilename` to
   `.pipelines/azure-pipelines.release-dev.yml`. A display-name change alone does
   not update this binding. Save without queueing a run; leave the ref unchanged.
3. Move the existing pipeline into **`\hazzat-web`**, the verified existing folder
   containing frontend build definitions 12, 13, 14 and 15. Set display name
   **`CopticDevs.hazzat-web-dev-release`** to distinguish it from dev build 12.
   Compare effective inherited permissions before and after the move. Folder
   inheritance can differ; if the move would change access, pause for that specific
   issue rather than silently broadening or altering permissions.
4. Verify ID, repository, YAML path, default ref, secret metadata, effective access,
   disabled automatic triggers and existing run history after saving. Preserve
   the existing `deployment_token` secret; do not copy, reveal, replace or rotate it.
   No value goes in YAML, parameters, chat, logs, artifacts or command arguments.
   Retain the reviewed queue-time override and operator-access settings. Do not
   change classic, PPE, production, repository-wide or project-wide permissions.
5. For future deployments, the owner confirms that the token belongs to the SWA resource with default host
   `yellow-forest-07103e310.1.azurestaticapps.net` and custom domain `dev.hazzat.com`.
   `default_hostname` is supplied to the task but is not claimed as an independent
   security boundary. Token ownership must be checked before queueing. Blank
   deployment environment means the default slot of this **dev resource**.

Approval exists for pipeline 16's persistent dev secret binding and this rename/move.
It does not authorize minting credentials, broadening shared-resource access,
merging the draft PR, or changing PPE/production. Parent coordinates
the authenticated UI and secure owner entry; this executor does not handle tokens.

## Queue and verify a controlled manual deployment

1. Inspect all queued, approval-pending, retrying and running deployments to this
   dev resource, across classic definition 9 and any other pipeline/manual client.
   Agree an exclusive window with other operators. Keep classic triggers unchanged.
   If automation or another writer can race the deployment, do not queue it; report the
   coordination requirement. A checkbox is an operator attestation, not a mutex.
2. Record the currently deployed build and known-good rollback ID/ref/commit and
   retain its artifact. Recheck that build 3354 is still the live baseline before
   treating it as rollback. Record existing trigger/settings snapshots for comparison.
3. Choose a successful existing definition-12 build. Independently read and record
   its ID, exact `refs/heads/...` source ref, 40-character commit and Container artifact.
   PR builds are rejected even if their sourceBranch resembles an accepted branch.
4. Queue manually from the reviewed pipeline-code ref. Enter `buildId`,
   `expectedSourceBranch`, `expectedSourceCommit`; set `deployDev=true` and
   `exclusiveDevWindowConfirmed=true` only after the preceding checks. Defaults
   skip the job. No automatic trigger can satisfy its `Build.Reason == Manual` guard.
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

## Local validation and limits

`PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s .pipelines/tests -v`
tests metadata selection, rejection paths, downloaded layout and mocked live checks.
Read-only metadata/layout/live checks against retained dev build 3354 can establish
readiness, but cannot establish Azure YAML compilation or successful deployment.
Run 3614 established successful Azure execution of the pre-rename dev YAML. Local
semantic-equivalence checks cover the rename; the new Azure path binding must be
verified after the owner saves it. No new deployment is needed merely to rename.
PPE execution and full interactive smoke testing remain separate unfinished work.

References: [Secret scope](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/set-secret-variables?view=azure-devops),
[AzureStaticWebApp task schema](https://github.com/microsoft/azure-pipelines-tasks/blob/master/Tasks/AzureStaticWebAppV0/task.json).
