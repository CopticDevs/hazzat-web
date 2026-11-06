# Controlled manual PPE test candidate

This branch prepares a single controlled test of pipeline17. Publication and the
exclusive test window are still pending. It has not deployed anything. The existing
classic PPE release remains enabled and automatic; root CI, PR and pipeline-resource
completion triggers in this candidate are all off.

## Confirmed setup

The owner has approved persistent pipeline-specific PPE access, securely entered
`deployment_token`, and confirmed the SWA default hostname
`brave-field-055faf010.1.azurestaticapps.net` and custom domain `ppe.hazzat.com`.
The owner accepted pipeline17's inherited permissions after the browser compared
its 12-principal matrix with dev pipeline16. Do not reopen those decisions unless
configuration changes. Browser confirmed secret masking, queue override off and no
CI/PR overrides, schedules or completion triggers. Public API metadata confirms the
secret flag but does not expose effective ACLs; absent allowOverride metadata is not
independent proof of false.

Pipeline17: `CopticDevs.hazzat-web-ppe-release`, folder `\hazzat-web`, YAML
`.pipelines/azure-pipelines.release-ppe.yml`, default refs/heads/develop. It currently
has no runs. This local branch is based on develop commit
`b70a46660f80feb364ac8d1a9a81793569b0448f`; the default develop YAML remains blocked
until a separately authorized publication/merge changes it.

## What the candidate changes

The literal block is replaced only in this candidate by a Manual-reason condition
and two default-false parameters: `deployPpe` and `exclusivePpeWindowConfirmed`.
A default manual run performs artifact inspection and skips deployment. A non-manual
run cannot inspect or deploy, even if a trigger were externally added. Both opt-ins
are required to enter DeployPpe. They attest to operator checks; they do not create a
cross-pipeline lock. The sequential stage lock protects only this YAML pipeline.

The resource picker pins build14's exact HazzatWebBuildPpe artifact. Metadata checks,
specific-run download, symlink/layout checks, manifest publication, target, token
reference, Oryx/API settings and live homepage verification remain unchanged.
The deployment job repeats provenance and layout checks on its own download.
Successful non-PR manual selections can use any branch; the proposed future automatic
policy is develop-only, but no automatic execution is enabled by this candidate.

## Test procedure — requires a fresh explicit window

1. Publish this candidate only after publication approval, review its exact SHA and
   passing gate, and use that code branch in pipeline17's Run dialog. Do not switch
   the permanent default branch away from develop merely to select test code.
2. Recheck latest live PPE baseline and retain its artifact. Current reference is
   build3623 / classic release1039, commit b70a46660f80feb364ac8d1a9a81793569b0448f.
   Its index/main JS/main CSS matched live PPE after classic deployment. This is not
   a permanent default: select whichever exact verified retained build is live then.
3. Agree a named exclusive window with the owner. Classic10 automatically reacts to
   build14 completion, so block competing activity operationally: no develop merges,
   manual build14 queues, classic queues/retries or external target writes, and drain
   all existing build14/classic10 work before starting. A no-active-runs query is only
   a snapshot. If operators cannot guarantee this freeze, obtain specific approval
   for a reversible classic automation pause before testing; do not silently alter it.
4. The browser is the sole queue owner. Open pipeline17 → Run, select the reviewed
   candidate code branch, and use Pipeline artifacts → ppeBuild to explicitly select
   the verified retained build (currently3623). Set both opt-ins true only after the
   window and rollback checks. Queue once, record the run ID, and never retry blindly.
5. Confirm source code SHA, exact resource ID/ref/commit, downloaded artifact identity
   and complete manifest. Verify stage lock acquisition, actual deployment completion
   to the confirmed hostname, no rebuild/API build, live homepage/main assets and
   application smoke. A matching homepage alone does not establish task execution.
6. If any step fails after deployment starts, inspect the actual site first. Keep
   exclusive ownership; obtain a rollback decision and redeploy a retained known-good
   exact artifact through one chosen owner if needed. Do not enable both writers.
7. End the operational freeze after verification, with classic still the automatic
   owner. Permanent retirement and enabling YAML develop completion require a separate
   reviewed cutover and in-flight build reconciliation. Production and dev stay unchanged.

## Validation scope

Local Python regression tests and parsed-YAML assertions verify guard wiring, manual
conditions, default-off opt-ins, unchanged exact-resource inputs and unchanged deployment
task settings. They do not establish Azure compilation, queue-time template evaluation,
PPE deployment success, lock acquisition or contention behavior. No extra run should
be created merely to prove concurrency without a separately agreed test design.
