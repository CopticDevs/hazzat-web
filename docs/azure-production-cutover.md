# Automatic production cutover candidate (#274)

This is a local candidate, not an activated cutover. Start from develop
`a40a7b448801c7b00fe597259a8765b22f1f672c`; current master is
`431b1b8f0d8eec1e6d6fc82a18851a42cb621023`. All changes must land in develop
first, then reach master through a separate promotion PR.

## Verified state and intended parity

Classic release 11 is enabled at revision 6. Its artifact-source trigger uses
`_CopticDevs.hazzat-web`, build 15, branch `master`, no tags, and the Prod stage
starts on ReleaseStarted. The saved manual artifact default is Latest with no
branch filter. Pipeline 18 remains revision 4, default `refs/heads/master`, YAML
`.pipelines/azure-pipelines.release-prod.yml`; no Azure setting changes are part
of this candidate.

Manual test [3648](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3648)
succeeded on master 431b1b8, uploading exact retained build 3647 / 20261106.9.
Its 83-file manifest and live homepage/JS/CSS matched; browser smoke passed.
Classic was restored afterward. This proves manual upload, not automatic trigger
behavior or contention serialization. Latest verified classic release is 1043.

The resource `prodBuild` references `\hazzat-web\CopticDevs.hazzat-web` and
completion filter `refs/heads/master`. Azure completion triggering selects a
successful run. The validator independently requires completed success, definition
15, expected project/repository, a non-PR CI/manual reason and the exact named
Container artifact. Automatic resource branch/commit must equal build metadata;
automatic pipeline code branch/commit must match that same source. There is no
latest-build lookup or rebuild after resource selection.

Root CI and PR triggers stay off. Automatic deployment requires ResourceTrigger,
alias prodBuild and master artifact/code refs. Default-false `deployProd` and
`exclusiveProdWindowConfirmed` apply only to manual deployment; automatic runs
do not pretend to confirm an exclusive test window. Manual inspection remains
possible with false defaults, including from develop. Manual deployment code must
come from master, while the resource picker still allows successful non-PR build
15 artifacts from other branches. This preserves intentional artifact choice;
the confirmations remain an intentional manual safeguard beyond classic's UX.

Both paths check classic 11's strict boolean disabled state immediately before
upload and preserve the proven download/layout/hash/hostname/live checks. The
stage sequential lock serializes this pipeline only. The disabled-state check is
a snapshot, not a mutex, and cannot stop classic in-flight work or external writers.
No YAML condition protects against someone authorized to run malicious edited YAML;
the previously reviewed production access boundary still applies.

## Safe publication and activation ordering

1. Obtain publication approval; open the candidate PR against develop. Review and
   gate it, then merge only with authorization. This can run existing PPE CI/CD.
   Production pipeline 18 still evaluates completion filters from its default
   master ref, which at this point has resource triggering off. Master-only
   deployment conditions additionally prevent this candidate's develop code from
   deploying. Do not repoint pipeline 18 to develop or queue another-ref test.
2. Open a separate develop-to-master promotion PR after approval. Verify the entire
   promotion diff and required gates. **Hold its merge**: merging is activation,
   and its build 15 can trigger the new production release.
3. Obtain an explicit cutover window and permanent classic retirement authorization.
   The previous temporary-disable/test approval does not authorize permanent cutover.
   Freeze master merges, build 15 queues, classic create/retry actions and external
   writers. Confirm default ref remains canonical refs/heads/master, pipeline path
   and permitted source refs, existing resource read authorization, target binding,
   token override policy and production queue/edit rights. Do not broaden access.
4. Refresh latest live artifact/manifest and verify retained rollback download.
   Disable classic 11, inspect its persisted state, and drain all queued, pending,
   running and retrying deployments and upstream production builds. Disabling does
   not cancel previously created releases. Resolve any competing work before merge;
   do not cancel it or bypass the guard without explicit coordination.
5. Recheck exact promotion head and gates, then merge using master policy. Do not
   enable root CI, UI overrides, schedules, or a second completion trigger. Keep
   classic disabled. Record the resulting master SHA and the one automatic build15.
6. Observe exactly one pipeline18 ResourceTrigger run after that successful build.
   Verify alias prodBuild and exact run ID, code/artifact source commit, successful
   non-PR provenance, ownership guard, manifest, actual upload/default hostname,
   live homepage/JS/CSS and browser smoke. Verify classic created no new release.
   Do not manually queue if trigger delivery is slow: investigate run/event state.
   Same-repository completion must execute the triggering commit; master default
   determines trigger evaluation. PR validation artifacts must never deploy.
7. On a failure, determine whether upload began/completed before considering retry.
   A failed live check can follow a successful deployment. Do not infer unchanged
   production from an overall failed run. Record actual terminal evidence.

## Rollback and single ownership

Content rollback: while classic stays disabled, explicitly select a retained
known-good build15 artifact through the master manual path with both confirmations
and an authorized window. Refresh its availability/content; 3647 is the recorded
baseline, not a permanent latest assumption. Never rebuild rollback content.

Ownership rollback: obtain coordination to disable new automatic triggering/queue
entry, then inspect/drain all YAML and upstream work before restoring classic's
original master artifact trigger. An unmerged revert PR does not disable the
active master trigger; any emergency Azure pause must be explicitly authorized
and its persisted state verified. Do not restore classic while new automatic
runs can upload. Preserve both histories and token handling; no rotation is implied.

## Validation and outstanding authorization

Run `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s .pipelines/tests -q`.
Tests cover automatic master intent without manual flags, rejected develop code,
wrong aliases/reasons/branches, manual branch choice and confirmations, exact
resource/code commit mismatches, failed/PR builds, strict ownership and layout/live
failures. YAML checks verify unchanged artifact/task inputs and guard ordering.

Pending: publication; develop review/merge; separate gated master promotion;
explicit cutover window and classic disable/drain authorization; first actual
automatic trigger verification. No Azure changes, queues or deployment are part
of local implementation.
