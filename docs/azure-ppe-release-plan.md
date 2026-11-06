# PPE migration preparation — local candidate

**Current branch:** a [controlled manual test candidate](azure-ppe-controlled-test.md)
replaces the literal block with default-off manual guards locally. The inventory and
blocked-scaffold descriptions below record the merged preparation baseline; consult
the test plan for current branch behavior. No PPE YAML deployment has run.

Snapshot: 2026-11-05, develop `fd9250a77541fb8413204ad428929871dbccc16e`.
Dev cutover is complete and manual-only. This PPE candidate is local, unpublished,
not registered in Azure, and cannot deploy: `DeployPpe` retains its literal false
condition. No new token binding, Azure configuration or production change occurred.

## Fresh evidence and drift

Classic [definition 10](https://vsrm.dev.azure.com/CopticDevs/hazzat-api/_apis/release/definitions/10?api-version=7.1)
remains enabled at revision 5. No configuration drift from the original inventory
was observed. Build [definition 14](https://dev.azure.com/CopticDevs/hazzat-api/_apis/build/definitions/14?api-version=7.1)
is revision 2, `CopticDevs.hazzat-web-ppe`, folder `\hazzat-web`, default develop.
Its YAML builds on develop changes, disables PR triggers, and publishes
`HazzatWebBuildPpe` as a Container artifact. Build-time content URL is
`https://d1zhmhuei1bwco.cloudfront.net`; release must not rebuild or rewrite it.

Classic automatically creates releases from that artifact on develop, without tags.
PPE starts after release creation. Pre/post approvals are automated, gates and
schedules empty, PR deployments off. Concurrency is 1, queue depth 0. The job uses
queue 9 / ubuntu-26.04, no demands or parallelism, timeout 0, cancellation timeout
1 minute, no OAuth token. One AzureStaticWebApp@0 task uses
`_CopticDevs.hazzat-web-ppe/HazzatWebBuildPpe`, skips Oryx, has no API path and leaves
production branch/deployment environment blank. Its only deployment credential
reference is environment-scoped secret `deployment_token`; no variable group or
service connection is configured in the task. Failure-only owner/creator emails,
deployment-status publishing and retention (30 days/minimum 3/retain build) require
separate parity checks in YAML/Azure settings.

Latest [release 1038](https://vsrm.dev.azure.com/CopticDevs/hazzat-api/_apis/release/releases/1038?api-version=7.1)
(Release-196) automatically deployed successful [build 3620](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3620),
commit `fd9250a77541fb8413204ad428929871dbccc16e`. The build is retained by release.
[Release logs](https://vsrm.dev.azure.com/CopticDevs/hazzat-api/_apis/release/releases/1038/logs?api-version=7.1)
report Deployment Complete at 23:42:21Z, Oryx skipped, no API, and target
`brave-field-055faf010.1.azurestaticapps.net`. That hostname redirects to
`https://ppe.hazzat.com/`. Both homepages and the public site's main JS/CSS match
build 3620's 83-file `HazzatWebBuildPpe` artifact:

| File | SHA-256 |
| --- | --- |
| index.html | `1d345ad7f9f53f5d862a0d40b756793954ef57aa631c2d9831bf31da189e9054` |
| static/js/main.a684c21b.js | `17cd89dbe931bfa4474b39528a232b0a74b83084d16cb876fc9c65fad08e5aed` |
| static/css/main.136bb85d.css | `068c62d4eefd0c540372057f8e3b7ce0b0ef555c12776cb6adc5c6a60e854676` |

The latest five releases (1038,1037,1036,1035,1033) succeeded; no project builds were
active at inspection. Recheck all pending/running releases before any write: this
snapshot is not a lock. Logs and matching public content identify the observed
site, not the Azure subscription/resource ownership or token scope.

## Candidate and eventual parity

The local YAML uses `ppeBuild` from `\hazzat-web\CopticDevs.hazzat-web-ppe`.
Manual resource selection needs no typed ID/branch/commit. The run's selected
resource ID is used for both metadata checks and specific artifact downloads.
Branch/commit metadata must match the selected build. For automatic runs, the
trigger alias must be ppeBuild and pipeline code ref/commit must match the artifact
source ref/commit. This prevents a later Latest lookup or unrelated triggering build.

The source build's reason (CI/manual) is distinct from the release run's reason
(Manual/ResourceTrigger). PR/failed/partial builds remain rejected. The resource
picker has no branch filter, matching classic's saved Latest default. Saved classic
artifact defaults have empty branch/tags/specific-version fields; the PPE environment
has only ReleaseStarted, with no artifact branch condition. The develop filter exists
only on the artifact-source automatic trigger. Accordingly manual runs accept a
verified successful non-PR build14 from any refs/heads branch, while automatic runs
require develop. This follows the saved configuration; the authenticated PPE manual
picker UI has not yet been exercised. Failed/partial/PR artifacts remain rejected.

Root CI and PR triggers stay none. After manual validation and exclusive cutover,
the intended completion trigger is:

```yaml
resources:
  pipelines:
  - pipeline: ppeBuild
    source: '\hazzat-web\CopticDevs.hazzat-web-ppe'
    trigger:
      branches:
        include:
        - refs/heads/develop
```

This snippet is a future reviewed change, not enabled in the candidate. Completion
selects the triggering run; it must never resolve an arbitrary latest build.
Same-repository completion executes release YAML at the triggering commit, so the
final reviewed YAML must exist in develop before automation is enabled. Set the
registered pipeline's default ref to refs/heads/develop only once that code exists.
Successful manual builds on develop can also complete the source pipeline; decide
whether any classic eligibility difference matters before claiming full parity.

DeployPpe uses a sequential stage lock. This serializes that YAML pipeline, not
classic/external writers. No manual approval or Azure environment name is invented:
classic has no manual gates. If an environment or other protected resource is
needed for the agreed security boundary, configure it explicitly and bind the job
before unblocking. Stage-level locking alone does not restrict who can change YAML,
queue other refs or use the secret. No concurrency behavior has been tested for PPE.

## Required decisions and authorized sequence

1. Owner verifies the exact SWA resource/subscription, default hostname and custom
   domain, and confirms the intended PPE token belongs to it. Do not retrieve the
   classic secret or transmit it in chat. Review classic and replacement ACLs,
   inherited permissions, artifact/pool access, allowed YAML refs and queue/edit
   permissions. Public definitions do not establish these or external org policies.
2. Obtain specific approval for a PPE pipeline's persistent secret access, create
   the pipeline and bind the existing secret through secure owner entry. Restrict
   access to that pipeline; no all-pipeline variable-group authorization. Publication,
   Azure setup and deployment are separate from this local preparation.
3. Review the retained successful/non-PR guard, notification/retention/timeout parity and any chosen
   extra checks. Preserve existing automatic approvals unless an intentional change
   is accepted. Keep completion triggers off during controlled testing.
4. In an agreed PPE window, freeze classic automatic release creation and manual
   writers; enumerate and drain/cancel pending/running work with owner approval.
   Record the last successful deployed build and retain it. Build 3620 is a current
   reference, not a permanent default. A stage lock cannot prevent a classic race.
5. Authorize removal of the literal deployment block for one manual test. Inspect
   the selected artifact first, then deploy the exact same retained build without
   rebuilding. Verify target/task result, manifest, live content, application smoke,
   lock acquisition and any agreed access/check enforcement. Failure after upload
   requires inspecting target state before any retry.
6. Once accepted, disable classic10 (preserve history), reconcile all in-flight and
   completed-but-not-deployed builds during the freeze, then enable only the reviewed
   develop completion trigger. Prevent duplicate processing of the last deployed
   build when reconciling this gap. Observe the first automatic exact-build release.
7. Rollback: turn off YAML completion, stop/drain its runs, establish one owner,
   re-enable classic with recorded settings, explicitly deploy the retained good
   artifact if needed, then restore automatic behavior. Never enable both writers.

Production definition11 and dev pipeline16/classic9 remain untouched throughout.

References: [completion triggers and same-repo commits](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/pipeline-triggers?view=azure-devops),
[resource versions and metadata](https://learn.microsoft.com/en-us/azure/devops/pipelines/yaml-schema/resources-pipelines-pipeline?view=azure-pipelines).
