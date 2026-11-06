# Production release migration (#274)

## Status and scope

Local manual-test candidate based on develop `8650de34435e2bb1f2d3d50536e542f066d2ed26`.
All changes land in develop first and reach master through a separate promotion
PR; never introduce production migration changes only on master.
Root CI, PR and resource triggers remain disabled. This candidate replaces the
literal deployment block with a Manual-only condition and two boolean parameters,
`deployProd` and `exclusiveProdWindowConfirmed`, both default false. A runtime
check independently requires both confirmations before deployment work proceeds.
These confirmations record an authorized window; they do not create a lock or
permission. The ownership guard still requires classic 11 disabled before upload.

The deployed scaffold on master `08ef9bb3c891b7ae02ea47d92a2e698d59d4ebb4`
remains literally blocked until this candidate is separately reviewed/promoted.
Pipeline 18 is registered as `CopticDevs.hazzat-web-prod-release` in `\hazzat-web`,
using the production YAML and default `refs/heads/master`. Inspection run
[3640](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3640)
succeeded without a token, selected build 3639, published an exact 83-file hash
manifest and skipped deployment. The owner subsequently saved pipeline-scoped
`deployment_token`; revision 4 metadata reports `isSecret: true`. The API omits
`allowOverride`, so the browser must verify queue-time override is off. Secret
values were not inspected. No production YAML deployment has been tested and
classic remains enabled. Dev/PPE permissions do not constitute production approval.

A future authorized manual inspection can select an existing build through
**Run pipeline > Pipeline artifacts > prodBuild**. With no version or branch
filter the resource defaults to the latest successful run across branches;
select an explicit version for reproducible inspection or rollback. The selected
resource run ID is pinned for the entire run. Both jobs download that exact
Container artifact; neither rebuilds nor republishes application output.
Publishing the hash manifest is evidence only.

## Verified inventory (2026-11-06)

| Item | Observed configuration |
| --- | --- |
| Upstream build | [15, CopticDevs.hazzat-web](https://dev.azure.com/CopticDevs/hazzat-api/_build?definitionId=15), folder `\hazzat-web`, revision 1 |
| Build YAML | `.pipelines/azure-pipelines.prod.yml`; CI and PR branch `master`; saved definition default branch is `develop` (not changed here) |
| Build contract | Ubuntu 26.04, Node 24, production endpoint `https://d1zhmhuei1bwco.cloudfront.net`, build/tests/coverage, Container artifact `HazzatWebBuildProd` from `build` |
| Classic release | [11, hazzat-web - CD](https://dev.azure.com/CopticDevs/hazzat-api/_release?definitionId=11), revision 4, enabled |
| Artifact | Build 15; alias `_CopticDevs.hazzat-web`; default Latest; saved default branch/tags/version empty |
| Automatic release | Artifact completion filtered to `master`, no tags; no scheduled release; no PR deployment |
| Stage | One `Prod` environment, definition 11, starts on ReleaseStarted; no additional artifact filter |
| Approval/gates | Saved pre/post approvals automated, no approvers, gate lists empty; no manual approval to reproduce in the visible definition |
| Agent/task | Queue 9, Ubuntu 26.04, no demands; one AzureStaticWebApp@0 task; app `_CopticDevs.hazzat-web/HazzatWebBuildProd`, skip app build true, no API path |
| Secret reference | Environment-scoped `deployment_token`, secret; no variable groups; no service connection in task inputs; value never inspected |
| Queue/retention | Concurrency 1, queueDepth 0; 30 days/minimum 3 releases, retainBuild true |

Configuration evidence: [build definition](https://dev.azure.com/CopticDevs/hazzat-api/_apis/build/definitions/15?api-version=7.1),
[classic definition](https://vsrm.dev.azure.com/CopticDevs/hazzat-api/_apis/release/definitions/11?api-version=7.1).
These saved settings do not establish effective ACLs, inherited permissions,
external checks, subscription access or token ownership. They must be verified
with the owner before any credential binding. Public master branch rules require
a PR and rebase merges and prohibit force updates/deletion; public rules do not
expose every bypass or write permission. Do not bypass current branch policies.

## Current baseline and rollback evidence

Latest verified baseline: classic release **1042** deployed retained build **3639**
(`20261106.6`, master `08ef9bb3c891b7ae02ea47d92a2e698d59d4ebb4`) successfully
at 2026-11-06T04:30:34Z. Its 83-file manifest exactly matched inspection 3640.
Homepage/main JS/CSS hashes equal the earlier baseline below. Refresh this
evidence immediately before testing; do not assume 3639 will still be live.


Classic [release 1041](https://dev.azure.com/CopticDevs/hazzat-api/_releaseProgress?_a=release-environment-logs&releaseId=1041)
successfully deployed [build 3633](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3633&view=results),
`refs/heads/master`, source `404844be12e3e88739a18fd780ef34a6aeee8a33`,
reason individualCI, retained by release. Deployment completed at
2026-11-06T03:42:22Z. The artifact contains 83 files. The deployment log identifies
`proud-glacier-0cea24010.1.azurestaticapps.net`; its public site redirects to
`https://www.hazzat.com/`. This establishes observed hosting, not token ownership.

Read-only comparison found HTTP 200 and matching artifact/live hashes:

| Path | SHA-256 |
| --- | --- |
| index.html | `1d345ad7f9f53f5d862a0d40b756793954ef57aa631c2d9831bf31da189e9054` |
| static/js/main.a684c21b.js | `17cd89dbe931bfa4474b39528a232b0a74b83084d16cb876fc9c65fad08e5aed` |
| static/css/main.136bb85d.css | `068c62d4eefd0c540372057f8e3b7ce0b0ef555c12776cb6adc5c6a60e854676` |

Recheck latest release, retained artifact download, hashes and site before any
test. These IDs are historical evidence, not an instruction to deploy stale
content. Earlier retained build 3602 is an additional rollback candidate; verify
its continued availability and desired content before selection. Retention is
not permanent. Do not rebuild a rollback artifact.

## Candidate protections and deliberate differences

`scripts/verify-prod-release-build.py` validates exact build ID, project,
definition 15, GitHub repository, completed success, commit and unique named
Container artifact. Resource branch/commit must match the build API. It rejects
PR refs and PR reasons independently. Manual selection permits branch builds
across branches, matching the classic saved unfiltered selection. Only CI/manual
build reasons are accepted; failed, partial, scheduled and other reasons fail
closed. Classic picker eligibility for those cases has not been established:
this is an intentional safeguard requiring production review, not claimed exact
parity. Dev/PPE acceptance does not imply production acceptance.

Automatic validation is prepared for `ResourceTrigger` alias `prodBuild` and
`refs/heads/master`, with code branch/commit equal to the completed build. It is
not active: resource trigger is off and inspection is Manual-only. No use of
`latest` occurs after resource resolution. Layout rejects symlinks and missing
index/static output and hashes every file without modifying it.

The opt-in deployment mirrors the classic task's static upload inputs and adds
the observed default hostname as a target check. It references `deployment_token`
without configuring one. Target checking and live hashes do not replace secure
owner confirmation of the token's application/domain binding. The live check
compares only the homepage; asset and browser smoke checks remain required.

Immediately before upload an ownership guard requires classic 11's exact ID and
boolean `isDisabled: true`; missing metadata/access fails closed. This guard
applies to any future manual or automatic execution of the deployment job.
`lockBehavior: sequential` is intended to serialize this stage's own runs.
Neither that lock nor the ownership snapshot excludes classic in-flight work,
external deployments, or subsequent re-enablement. Contention is untested.

## Controlled test procedure (not yet authorized)

1. Publish/review this candidate against develop, merge only after approval and
   gates, then promote via a separate reviewed PR to master. Keep every automatic
   release trigger off. Existing classic production may deploy that promotion;
   wait for it to finish and refresh the current live artifact.
2. Obtain explicit authorization for temporary classic disable/drain and exactly
   one same-content production test. Confirm the token target with its owner and
   approve the actual production queue/edit trust boundary. No token setup or
   prior inspection run grants deployment or disable permission.
3. Agree an exclusive window: no master promotion, build 15 queue, classic create
   release/retry or external writer. Check all pending/queued/running deployments,
   not only recent releases. Have the owner disable classic 11 and drain already
   created work. Re-read disabled state. A snapshot is not a mutex; do not bypass
   ownership or infer that disabling cancels in-flight releases.
4. Identify the latest successful classic artifact and download it; compare the
   full retained manifest and live homepage/JS/CSS. Verify a retained rollback
   artifact is downloadable. At the recorded baseline use prodBuild **3639**,
   display **20261106.6**, only if the fresh checks still agree.
5. Queue once on the exact reviewed promoted master SHA. In Run pipeline > Pipeline
   artifacts > prodBuild select that explicit build, then set `deployProd=true`
   and `exclusiveProdWindowConfirmed=true`. Default false keeps inspection-only
   behavior. Never infer a window from an old confirmation.
6. Verify runtime confirmations, provenance, exact download/layout/hash, classic
   ownership, actual Static Web App upload target and live content. Record the
   run ID before any follow-up. Do not retry blindly after a failed post-check:
   upload may already have changed the site. Browser smoke remains separate.
7. After the test, decide explicitly whether to restore classic ownership or hold
   it disabled for a separately approved automatic cutover. A passing manual test
   does not enable completion triggers or authorize automatic cutover.

## Staged migration history and future activation

1. Publish each candidate as a draft PR against **develop**, then obtain separate
   merge approval after review and gates. Promote develop to **master** through
   another reviewed PR; never make master-only changes. The original scaffold cannot
   deploy; this manual candidate requires explicit opt-ins. A develop merge may invoke existing PPE automation and a later
   master promotion may start build 15 and classic 11 automatically. Preserve
   those behaviors; no hidden production cutover on either merge.
2. After publication approval and review, register a dedicated release pipeline
   save-only, with verified repository/path/ref and no UI trigger overrides.
   Proposed name `CopticDevs.hazzat-web-prod-release`, folder `\hazzat-web`, YAML
   `.pipelines/azure-pipelines.release-prod.yml`; no definition ID is assumed.
   Verify resource authorization, project/job scope, queue/edit permissions,
   allowed YAML refs and branch writers. A default branch or manual boolean does
   not prevent another permitted ref from using a pipeline secret.
3. Run artifact-only inspection only with separate queue authorization. This
   requires no deployment token and proves no upload. Validate Azure compilation,
   picker behavior and retained artifact download/manifest; local tests alone
   do not establish those results.
4. Obtain specific approval for persistent access for this production pipeline.
   Owner securely enters the existing production token as `deployment_token`,
   secret with queue-time override off. Confirm the application/default hostname
   and `www.hazzat.com` domain and accept the actual permission boundary. No token
   extraction, rotation, shared variable group or broad authorization is implied.
5. Review this manual-only deployment candidate replacing the literal
   block with explicit opt-ins. Because the ownership guard requires retirement,
   its production test needs a reversible, separately approved classic disable
   and drain window. Do not silently bypass the guard to test alongside classic.
   Freeze master merges/build 15 queues, classic releases/retries and all external
   production writers; inspect queued, pending, in-progress and retrying work.
   Disabling classic alone does not cancel already-created work. Do not cancel
   in-flight deployments without explicit coordination.
6. In the authorized window, disable classic, drain it, verify its persisted state
   and retained rollback artifact, then run exactly one same-content manual test.
   Verify actual upload task execution, target, selected build identity, all-file
   manifest, homepage/JS/CSS and browser smoke. Overall success or unchanged
   content alone does not prove upload occurred. On uncertainty inspect run/target
   before any retry; a failed post-check may follow a completed upload.
7. Automatic parity requires a separately reviewed change: resource completion
   branch include `refs/heads/master`, automatic/manual stage conditions, exact
   resource validation, and manual rollback selection. Keep root CI/PR off on the
   release pipeline; leave upstream build validation intact. Use canonical
   `refs/heads/master` as the release pipeline default ref when reviewed code is
   present there. Same-repository completion runs use the triggering commit;
   default-ref trigger evaluation and allowed refs both need verification.
8. Land reviewed activation changes in develop first. Disable/drain classic
   **before** promoting activation code to master or otherwise enabling
   completion triggering. Coordinate a clear window so the activation merge's
   upstream build cannot also deploy through classic. Verify one successful
   build 15 causes exactly one release run, exact provenance, ownership guard,
   real target upload and live checks. Do not manually queue a duplicate if a
   trigger appears delayed. Preserve classic history and rollback capability.

## Rollback and remaining gates

For content rollback, select a retained known-good build 15 artifact explicitly
through the reviewed YAML manual path while classic remains disabled. For
ownership rollback, first disable new YAML completion triggering/queue capability
as authorized, inspect and drain its runs, and only then re-enable classic.
Restore recorded classic settings without deleting history; verify a single
owner. Neither option rebuilds, rotates credentials or changes production content
without explicit authorization. Recheck the site after every authorized change.

Outstanding: candidate publication, develop PR review/merge and separate master
promotion, Azure compilation of the changed conditions, production-specific
safeguard approval, effective ACL/resource access review, token-target owner
confirmation and production access acceptance, a production test window,
classic disable/drain and test/deployment approval, and later cutover approval.
No deployment, credential setup, or classic change is authorized by local scaffold
preparation alone.

Local checks: `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s .pipelines/tests -q`.
Production cases cover provenance/reasons, manual versus automatic branch rules,
resource identity, strict ownership, layout/symlinks and live target/hash mismatch.

References: [pipeline resources and manual selection](https://learn.microsoft.com/en-us/azure/devops/pipelines/yaml-schema/resources-pipelines-pipeline?view=azure-pipelines),
[completion trigger/default branch behavior](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/pipeline-triggers?view=azure-devops),
[stage exclusive locks](https://learn.microsoft.com/en-us/azure/devops/pipelines/yaml-schema/stages-stage?view=azure-pipelines#exclusive-lock-at-stage-level).
