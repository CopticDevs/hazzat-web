# Automatic PPE replacement candidate

This local candidate is based on develop c48b8ddd9399de69d969dbc75a338f8de9d1fe4b.
It has not been published, merged or activated. Classic10 remains the active PPE
owner. Dev and production are unchanged.

## Readiness evidence

Manual YAML run [3627](https://dev.azure.com/CopticDevs/hazzat-api/_build/results?buildId=3627&view=results)
succeeded on pipeline17 using develop c48b8ddd9399de69d969dbc75a338f8de9d1fe4b,
resource build3626 (display20261106.1) and both test opt-ins. Both stages verified and
downloaded3626; its 83-file manifest exactly matched the retained artifact. The
actual Static Web App task completed to brave-field-055faf010.1.azurestaticapps.net,
with Oryx skipped/no API. Pipeline and independent homepage/JS/CSS comparisons passed.
This proves the manual path, not automatic resource triggering or contention behavior.
Target/token binding and inherited permissions were already confirmed by the owner.

## Final behavior

Root CI/PR triggers remain none. Only successful completion of ppeBuild (definition14,
folder/name \hazzat-web\CopticDevs.hazzat-web-ppe) on refs/heads/develop triggers this
pipeline. No tags, schedule or upstream build changes are introduced. Resource-trigger
runs must have alias ppeBuild and match the resource source branch/commit to the code
branch/commit. Download remains specific to that resource runID, never latest/rebuild.

Manual runs use the resource picker across branches and deploy the selected successful
non-PR artifact without the temporary test opt-ins. Both run types retain exact
project/repository/definition/artifact validation, static layout/symlink checks,
manifest evidence, target settings, live comparison and sequential stage lock.
Failed/partial/PR/unsupported build reasons are rejected. Classic saved manual branch
scope is unfiltered; exact failed/PR eligibility equivalence has not been established.

Immediately before upload, both manual and automatic runs read classic definition10
and require id10 plus boolean isDisabled=true. Enabled/missing/inaccessible metadata
fails closed before the deployment task. This is a new intentional ownership interlock:
manual YAML deployments also fail while classic remains enabled. It prevents ordinary
accidental activation while classic is enabled; it is not a distributed lock or an ACL.
Re-enabling classic after the check, already-running classic work, edited YAML and
external writers are still outside its protection. Operational exclusion is required.

## Publication and activation ordering

1. Obtain approval to publish/review the candidate; keep it unmerged while classic
   remains owner. PR validation does not queue build14 or the PPE release candidate.
   Verify exact-head gates and unchanged pipeline17 default refs/heads/develop,
   YAML path, secret scope, artifact authorization and disabled UI overrides.
2. Obtain explicit approval for the cutover window, disabling classic10, merging the
   trigger-enabling change and the resulting automatic deployment. No new token,
   rotation or wider access is required. Preserve accepted permissions unless drift
   is discovered; do not ask for already-confirmed target/access again.
3. Freeze develop merges, manual build14 queues, classic releases/retries and external
   PPE writes. Drain running/pending work and record the exact currently deployed
   retained build as rollback (3626 is historical baseline, reverify at action time).
4. Disable classic10 while retaining history. Verify disabled and inspect queued,
   approval-pending, retrying and running deployments; do not assume Disable canceled
   them. Resolve any residual work before proceeding. This must happen BEFORE merge.
5. Merge the reviewed automatic candidate. Existing build14 CI builds that commit;
   resource completion then runs pipeline17 at the SAME commit because both use the
   same repository. The default branch used to evaluate filters must already be
   refs/heads/develop. Do not manually queue a second deployment for that same build.
6. Observe the first automatic run: ResourceTrigger/ppeBuild, develop, exact build14
   ID/commit, successful classic-disabled interlock, manifest, actual target/task
   result, live content and smoke checks. Reconcile builds completed during the freeze
   by explicit ID and deployed state; never blindly replay all or choose Latest.
7. If merge happened before retirement by mistake, the new ownership check should
   fail before upload while classic remains enabled. Inspect actual task/target state,
   drain classic, and coordinate ONE explicit recovery; do not blind retry or remove
   the check to bypass ownership. Do not declare cutover complete from a skipped or
   failed deployment.

Pipeline17's sequential lock serializes only its DeployPpe stage. It does not serialize
classic or other writers. Keep the exclusion window until the automatic path is verified.

## Rollback

Stop new YAML completion runs (disable pipeline17 or its completion trigger through
an authorized change), drain/cancel queued/running YAML work, and inspect target state.
Re-enable classic10 only after YAML cannot write; retain one owner. Select the retained
known-good artifact explicitly if content rollback is needed, then restore recorded
classic automatic behavior. Already queued runs are not removed merely by reverting
YAML. The new YAML ownership interlock will reject uploads while classic is enabled,
but this does not replace draining in-flight writes. Preserve all histories and credentials.

## Local checks and limits

Python tests cover provenance, manual/automatic branch policy, resource-code identity,
layout/live failures and strict retirement checking. Parsed-YAML checks verify exact
trigger/conditions, removal of test parameters, unchanged task inputs, and ownership
check placement before upload. Read-only checking against currently enabled classic10
must reject it; no Azure writes are needed. Azure automatic execution and end-to-end
retirement/rollback remain untested until the authorized cutover.
