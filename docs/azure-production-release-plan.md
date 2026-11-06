# Production release inventory and migration record

Production migration is complete. See [current operations and rollback](azure-production-cutover.md)
and [all-environment rollout status](azure-release-migration.md). Production was a
separate classic definition (11), not part of PPE definition10; its migration and
owner-authorized tests/cutover followed successful PPE validation.

Pipeline18 uses `.pipelines/azure-pipelines.release-prod.yml` on refs/heads/master.
Automatic master completion is active; root CI/PR remain off. Manual deployment
retains two default-false opt-ins. Classic11 is retained disabled. Run3640 proved
artifact-only inspection, run3648 proved manual upload, and run3656 proved actual
automatic upload from exact build3655. No literal deployment block remains in the
current production YAML. All changes were reviewed in develop before promotion.

## Verified inventory (2026-11-06)

| Item | Observed configuration |
| --- | --- |
| Upstream build | [15, CopticDevs.hazzat-web](https://dev.azure.com/CopticDevs/hazzat-api/_build?definitionId=15), folder `\hazzat-web`, revision 1 |
| Build YAML | `.pipelines/azure-pipelines.prod.yml`; CI and PR branch `master`; saved definition default branch is `develop` (not changed here) |
| Build contract | Ubuntu 26.04, Node 24, production endpoint `https://d1zhmhuei1bwco.cloudfront.net`, build/tests/coverage, Container artifact `HazzatWebBuildProd` from `build` |
| Classic release | [11, hazzat-web - CD](https://dev.azure.com/CopticDevs/hazzat-api/_release?definitionId=11), revision 4 at inventory; now disabled revision 7 |
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


## Secret and access review

The original environment-scoped `deployment_token` reference was preserved as an
owner-entered pipeline18 secret. No secret value, extraction or shared variable
group is part of the migration. Browser reviewed effective UI matrices; public
metadata alone cannot establish membership or every effective permission. The
production inherited service/Contributor differences and limitations are recorded
in [rollout status](azure-release-migration.md). Do not treat UI/API omission of
allowOverride as proof of its value or claim exact classic/YAML ACL equivalence.

## Evidence and historical baselines

Promotion PR289 first brought the updated build contract to master; PR290/291 added
production inspection preparation, PR292/293 added guarded manual testing, and
PR294/295 activated automatic deployment after classic disable/drain. Exact final
merge/run links and observed desktop smoke are in the operations runbook.
Historical classic releases1041/1042/1043 used builds3633/3639/3647 respectively.
The first automatic YAML release3656 used build3655. Recheck current live identity
and retained artifact availability before rollback; none of these IDs means latest.

Original approval/gate settings were inventoried, and production access, target,
manual test window, temporary classic disable/restoration and final retirement
were handled as separate owner-authorized actions. The migration did not invent
manual approval gates that classic did not have. Notification and retention policy
equivalence is not established by successful deployment; follow the current chosen
policies and preserve rollback artifacts explicitly when authorized.
