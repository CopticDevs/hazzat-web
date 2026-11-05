"""Fail closed before downloading a selected existing PPE build. No Azure writes."""

import json
import os
import re
import sys
import urllib.request

PROJECT_ID = "c3ad63de-5431-426e-8009-fe5331eea17a"
BUILD_API = f"https://dev.azure.com/CopticDevs/{PROJECT_ID}/_apis/build/builds"
ARTIFACT = "HazzatWebBuildPpe"


def validate_build_id(value):
    if not re.fullmatch(r"[1-9][0-9]*", value):
        raise ValueError("Select a positive numeric existing PPE build ID.")
    return int(value)


def validate_metadata(build_id, build, artifacts):
    expected = {
        "id": build_id,
        "status": "completed",
        "result": "succeeded",
        "sourceBranch": "refs/heads/develop",
    }
    if any(build.get(key) != value for key, value in expected.items()):
        raise ValueError("Build must match the selected ID and have succeeded on develop.")
    # Branch metadata alone must not authorize a PR validation build. Only the
    # current CI build contract and explicitly selected manual builds are accepted.
    if build.get("reason") not in {"individualCI", "batchedCI", "manual"}:
        raise ValueError("Select a CI or manual build, not a PR or other build reason.")
    if build.get("definition", {}).get("id") != 14:
        raise ValueError("Build is not from the verified PPE definition 14.")
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


def main():
    build_id = validate_build_id(os.environ.get("PPE_BUILD_ID", ""))
    build = read_json(f"{BUILD_API}/{build_id}?api-version=7.1")
    artifacts = read_json(f"{BUILD_API}/{build_id}/artifacts?api-version=7.1")
    validate_metadata(build_id, build, artifacts)
    print(f"Verified PPE build {build_id}; commit {build['sourceVersion']}; artifact {ARTIFACT}.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        # Do not echo server response bodies or credentials on access failures.
        print(f"PPE artifact verification failed ({type(error).__name__}). "
              "Check the selected build and read access; deployment remains blocked.", file=sys.stderr)
        sys.exit(1)
