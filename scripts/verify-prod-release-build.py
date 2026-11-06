"""Fail closed before downloading a selected existing Production build. No Azure writes."""

import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time
import urllib.request

PROJECT_ID = "c3ad63de-5431-426e-8009-fe5331eea17a"
BUILD_API = f"https://dev.azure.com/CopticDevs/{PROJECT_ID}/_apis/build/builds"
ARTIFACT = "HazzatWebBuildProd"


def validate_build_id(value):
    if not re.fullmatch(r"[1-9][0-9]*", value):
        raise ValueError("Select a positive numeric existing Production build ID.")
    return int(value)


def validate_metadata(build_id, build, artifacts, required_branch="refs/heads/master"):
    expected = {
        "id": build_id,
        "status": "completed",
        "result": "succeeded",
    }
    if any(build.get(key) != value for key, value in expected.items()):
        raise ValueError("Build must match the selected ID and have succeeded.")
    branch = build.get("sourceBranch", "")
    if not re.fullmatch(r"refs/heads/[^\s]+", branch):
        raise ValueError("Build must use a branch ref, not a PR or missing ref.")
    if required_branch is not None and branch != required_branch:
        raise ValueError("Automatic Production releases require master.")
    # Branch metadata alone must not authorize a PR validation build. Only the
    # current CI build contract and explicitly selected manual builds are accepted.
    if build.get("reason") not in {"individualCI", "batchedCI", "manual"}:
        raise ValueError("Select a CI or manual build, not a PR or other build reason.")
    if build.get("definition", {}).get("id") != 15:
        raise ValueError("Build is not from the verified Production definition 15.")
    if build.get("project", {}).get("id") != PROJECT_ID:
        raise ValueError("Build belongs to an unexpected Azure project.")
    repository = build.get("repository", {})
    if (repository.get("id", "").lower() != "copticdevs/hazzat-web"
            or repository.get("type") != "GitHub"):
        raise ValueError("Build belongs to an unexpected repository.")
    matches = [a for a in artifacts.get("value", []) if a.get("name") == ARTIFACT]
    if len(matches) != 1 or matches[0].get("resource", {}).get("type") != "Container":
        raise ValueError("The expected Container build artifact is missing or ambiguous.")
    if not re.fullmatch(r"[0-9a-f]{40}", build.get("sourceVersion", "")):
        raise ValueError("Build source commit is missing or invalid.")


def read_json(url):
    # This project exposes build metadata publicly. Never add a deployment token
    # to this request. If access changes, stop and review read permissions.
    with urllib.request.urlopen(url, timeout=30) as response:
        if "application/json" not in response.headers.get("Content-Type", ""):
            raise ValueError("Azure returned no JSON metadata; verify read access.")
        return json.load(response)


SITE = "https://www.hazzat.com/"


def validate_resource_context(build, branch, commit, reason, alias, code_branch, code_commit):
    """Pin resource metadata; automatic execution must use that same repo commit."""
    if branch != build.get("sourceBranch") or commit != build.get("sourceVersion"):
        raise ValueError("Pipeline resource branch/commit does not match the selected build.")
    if reason == "Manual":
        return
    if (reason != "ResourceTrigger" or alias != "prodBuild"
            or code_branch != branch or code_commit != commit):
        raise ValueError("Unexpected trigger or automatic pipeline code/artifact mismatch.")


def validate_manual_test(reason, deploy_confirmed, window_confirmed):
    # Azure boolean parameters may render as True/False; no other truthy values.
    if (reason != "Manual" or deploy_confirmed.lower() != "true"
            or window_confirmed.lower() != "true"):
        raise ValueError("An approved manual deployment and exclusive window are required.")


def validate_release_intent(reason, code_branch, source_branch, alias,
                            deploy_confirmed, window_confirmed):
    # Develop-first publication must not make develop YAML deploy production.
    if code_branch != "refs/heads/master":
        raise ValueError("Production deployment code must come from master.")
    if reason == "Manual":
        validate_manual_test(reason, deploy_confirmed, window_confirmed)
    elif (reason != "ResourceTrigger" or alias != "prodBuild"
          or source_branch != "refs/heads/master"):
        raise ValueError("Automatic production deployment requires the master prodBuild resource.")
    # Metadata validation separately pins successful build15, resource and code commit.


def validate_classic_retired(definition):
    # Strict boolean check: missing/inaccessible metadata must fail closed.
    if definition.get("id") != 11 or definition.get("isDisabled") is not True:
        raise ValueError("Classic Production definition 11 must be disabled before YAML upload.")


def inspect_layout(root):
    if not root.is_dir() or root.is_symlink():
        raise ValueError("Artifact root is missing or is a symlink.")
    paths = list(root.rglob("*"))
    if any(p.is_symlink() for p in paths):
        raise ValueError("Artifact contains symlinks.")
    index = root / "index.html"
    if not index.is_file() or index.stat().st_size == 0:
        raise ValueError("Missing or empty index.html.")
    if not (root / "static").is_dir() or not any(p.is_file() for p in (root / "static").rglob("*")):
        raise ValueError("Missing static assets.")
    return {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(paths) if p.is_file()}


def verify_live(manifest):
    expected = manifest["index.html"]
    for attempt in range(6):
        try:
            request = urllib.request.Request(SITE, headers={"Cache-Control": "no-cache"})
            with urllib.request.urlopen(request, timeout=20) as response:
                if response.url.rstrip("/") != SITE.rstrip("/"):
                    raise ValueError("Unexpected Production site redirect.")
                if hashlib.sha256(response.read()).hexdigest() == expected:
                    print("www.hazzat.com index matches the selected artifact.")
                    return
        except Exception:
            pass
        if attempt < 5:
            time.sleep(10)
    raise ValueError("Production homepage did not match; review deployment before any retry.")


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "metadata"
    if mode == "metadata":
        build_id = validate_build_id(os.environ.get("PROD_BUILD_ID", ""))
        build = read_json(f"{BUILD_API}/{build_id}?api-version=7.1")
        artifacts = read_json(f"{BUILD_API}/{build_id}/artifacts?api-version=7.1")
        reason = os.environ.get("PROD_RUN_REASON", "")
        validate_metadata(build_id, build, artifacts,
                          required_branch=None if reason == "Manual" else "refs/heads/master")
        validate_resource_context(build, os.environ.get("PROD_SOURCE_BRANCH", ""),
                                  os.environ.get("PROD_SOURCE_COMMIT", ""),
                                  os.environ.get("PROD_RUN_REASON", ""),
                                  os.environ.get("PROD_TRIGGER_ALIAS", ""),
                                  os.environ.get("PROD_CODE_BRANCH", ""),
                                  os.environ.get("PROD_CODE_COMMIT", ""))
        print(f"Verified Production build {build_id}; commit {build['sourceVersion']}; artifact {ARTIFACT}.")
    elif mode == "manual-test":
        validate_manual_test(os.environ.get("PROD_RUN_REASON", ""),
                             os.environ.get("PROD_DEPLOY_CONFIRMED", ""),
                             os.environ.get("PROD_WINDOW_CONFIRMED", ""))
        print("Explicit manual test confirmations verified; ownership check still required.")
    elif mode == "release-intent":
        validate_release_intent(os.environ.get("PROD_RUN_REASON", ""),
                                os.environ.get("PROD_CODE_BRANCH", ""),
                                os.environ.get("PROD_SOURCE_BRANCH", ""),
                                os.environ.get("PROD_TRIGGER_ALIAS", ""),
                                os.environ.get("PROD_DEPLOY_CONFIRMED", ""),
                                os.environ.get("PROD_WINDOW_CONFIRMED", ""))
        print("Production release intent verified; provenance and ownership checks still required.")
    elif mode == "ownership":
        definition = read_json(
            "https://vsrm.dev.azure.com/CopticDevs/hazzat-api/_apis/release/definitions/11?api-version=7.1")
        validate_classic_retired(definition)
        print("Classic Production definition 11 is disabled; operational drain remains required.")
    elif mode == "layout":
        manifest = inspect_layout(Path(os.environ["PROD_ARTIFACT_ROOT"]))
        Path(os.environ["PROD_MANIFEST"]).write_text(json.dumps(manifest, indent=2) + "\n")
        print(f"Verified and hashed {len(manifest)} files without modifying output.")
    elif mode == "live":
        verify_live(json.loads(Path(os.environ["PROD_MANIFEST"]).read_text()))
    else:
        raise ValueError("Unknown check mode.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        # Do not echo server response bodies or credentials on access failures.
        print(f"Production artifact verification failed ({type(error).__name__}). "
              "Check selection/access or layout. A post-deploy failure does not roll back "
              "or justify blind redeployment.", file=sys.stderr)
        sys.exit(1)
