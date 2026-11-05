# Manual dev YAML migration test

This separate executable candidate targets **https://dev.hazzat.com/**. It does not
unlock or repoint the PPE scaffold. No Azure pipeline or secret has been configured
by this local change, and no deployment test has run.

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

## Owner setup in Azure DevOps

1. Review this candidate and select its published repository ref for the test.
   Branch publication and a draft PR have been authorized; merging has not.
   Azure must read the YAML and validator from that reviewed ref. Do not use the
   wizard's Save and run action against an absent/unreviewed file.
2. In project `hazzat-api`, create one YAML pipeline for
   `.pipelines/azure-pipelines.release-dev-test.yml` using the existing GitHub
   connection. Suggested new name: `hazzat-web-dev-yaml-test` (not an existing ID).
   Keep all CI, PR, scheduled and completion/UI override triggers disabled.
3. In that new pipeline's Variables UI, the owner securely enters the **existing
   verified dev resource's token** under `deployment_token`, marks it secret, and
   does not allow queue-time override. No value goes in YAML, parameters, chat,
   logs, artifacts or command arguments. Do not retrieve the masked classic value
   through a job. No new token, token rotation, PAT or broad variable group is
   authorized. If the owner has no approved existing source, stop for that blocker.
4. This new secret is pipeline-scoped. Restrict edit/queue/manage rights on this
   new test pipeline to the intended owner/operators, reviewing inherited rights;
   pipeline editors can change code that uses secrets. Do not change classic, PPE,
   production, repository-wide or project-wide permissions. Do not grant all-pipeline
   access to any resource. Use existing agent-pool and build-artifact read access;
   if unavailable, report the exact missing permission instead of expanding it.
5. The owner verifies that this token belongs to the SWA resource with default host
   `yellow-forest-07103e310.1.azurestaticapps.net` and custom domain `dev.hazzat.com`.
   `default_hostname` is supplied to the task but is not claimed as an independent
   security boundary. Token ownership must be checked before queueing. Blank
   deployment environment means the default slot of this **dev resource**.

Approval exists for the specific test pipeline's persistent dev secret binding.
It does not authorize minting credentials, broadening shared-resource access,
merging the draft PR, or changing PPE/production. Parent coordinates
the authenticated UI and secure owner entry; this executor does not handle tokens.

## Queue and verify one controlled test

1. Inspect all queued, approval-pending, retrying and running deployments to this
   dev resource, across classic definition 9 and any other pipeline/manual client.
   Agree an exclusive window with other operators. Keep classic triggers unchanged.
   If automation or another writer can race the test, do not queue it; report the
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
Actual Azure schema validation, permission checks and end-to-end execution remain
pending authenticated setup against the reviewed published ref.

References: [Secret scope](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/set-secret-variables?view=azure-devops),
[AzureStaticWebApp task schema](https://github.com/microsoft/azure-pipelines-tasks/blob/master/Tasks/AzureStaticWebAppV0/task.json).
