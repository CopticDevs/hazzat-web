"""Read-only dev provenance, layout, and post-deployment checks; never reads tokens."""

import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time
import urllib.request

PROJECT = "c3ad63de-5431-426e-8009-fe5331eea17a"
API = f"https://dev.azure.com/CopticDevs/{PROJECT}/_apis/build/builds"
ARTIFACT = "HazzatWebBuildDev"
SITE = "https://dev.hazzat.com/"


def selection(build_id, branch, commit):
    if not re.fullmatch(r"[1-9][0-9]*", build_id):
        raise ValueError("Select an existing positive numeric dev build ID.")
    if not re.fullmatch(r"refs/heads/[^\s]+", branch):
        raise ValueError("Select an explicit source branch ref, not a PR ref.")
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("Select the exact source commit.")
    return int(build_id), branch, commit


def validate_metadata(selected, build, artifacts):
    build_id, branch, commit = selected
    expected = dict(id=build_id, status="completed", result="succeeded",
                    sourceBranch=branch, sourceVersion=commit)
    if any(build.get(k) != v for k, v in expected.items()):
        raise ValueError("Dev build identity, result, branch or commit mismatch.")
    if build.get("reason") not in {"manual", "individualCI", "batchedCI"}:
        raise ValueError("PR, missing and other build reasons are not accepted.")
    if build.get("definition", {}).get("id") != 12:
        raise ValueError("Only dev build definition 12 is accepted.")
    if build.get("project", {}).get("id") != PROJECT:
        raise ValueError("Unexpected Azure project.")
    repo = build.get("repository", {})
    if repo.get("id", "").lower() != "copticdevs/hazzat-web" or repo.get("type") != "GitHub":
        raise ValueError("Unexpected repository.")
    matches = [a for a in artifacts.get("value", []) if a.get("name") == ARTIFACT]
    if len(matches) != 1 or matches[0].get("resource", {}).get("type") != "Container":
        raise ValueError("Expected exactly one dev Container artifact.")


def read_json(url):
    with urllib.request.urlopen(url, timeout=30) as response:
        if "application/json" not in response.headers.get("Content-Type", ""):
            raise ValueError("No JSON metadata; verify read access.")
        return json.load(response)


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
                    raise ValueError("Unexpected dev site redirect.")
                if hashlib.sha256(response.read()).hexdigest() == expected:
                    print("dev.hazzat.com index matches the selected artifact.")
                    return
        except Exception:
            pass
        if attempt < 5:
            time.sleep(10)
    raise ValueError("Dev homepage did not match; review deployment before any retry.")


def main():
    mode = sys.argv[1]
    if mode == "metadata":
        selected = selection(os.environ.get("DEV_BUILD_ID", ""),
                             os.environ.get("DEV_SOURCE_BRANCH", ""),
                             os.environ.get("DEV_SOURCE_COMMIT", ""))
        build_id, branch, commit = selected
        build = read_json(f"{API}/{build_id}?api-version=7.1")
        artifacts = read_json(f"{API}/{build_id}/artifacts?api-version=7.1")
        validate_metadata(selected, build, artifacts)
        print(f"Verified dev build {build_id}; branch {branch}; commit {commit}; {ARTIFACT}.")
    elif mode == "layout":
        manifest = inspect_layout(Path(os.environ["DEV_ARTIFACT_ROOT"]))
        Path(os.environ["DEV_MANIFEST"]).write_text(json.dumps(manifest, indent=2) + "\n")
        print(f"Verified and hashed {len(manifest)} files without modifying output.")
    elif mode == "live":
        verify_live(json.loads(Path(os.environ["DEV_MANIFEST"]).read_text()))
    else:
        raise ValueError("Unknown check mode.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Dev validation failed ({type(error).__name__}); inspect selection/access or layout. "
              "A post-deploy failure does not roll back or justify blind redeployment.", file=sys.stderr)
        sys.exit(1)
