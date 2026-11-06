"""Offline negative cases for the release artifact provenance guard."""

import copy
import importlib.util
from pathlib import Path
import unittest
import tempfile
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("prod_guard", ROOT / "scripts/verify-prod-release-build.py")
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)


class ProductionBuildGuardTests(unittest.TestCase):
    def setUp(self):
        self.build = {
            "id": 3633, "status": "completed", "result": "succeeded", "reason": "individualCI",
            "sourceBranch": "refs/heads/master", "sourceVersion": "a" * 40,
            "definition": {"id": 15}, "project": {"id": guard.PROJECT_ID},
            "repository": {"id": "CopticDevs/hazzat-web", "type": "GitHub"},
        }
        self.artifacts = {"value": [{"name": guard.ARTIFACT, "resource": {"type": "Container"}}]}

    def test_accepts_verified_build(self):
        guard.validate_metadata(3633, self.build, self.artifacts)
        self.assertEqual(guard.validate_build_id("3633"), 3633)

    def test_rejects_invalid_ids(self):
        for value in ["", "0", "-1", "1.0", "latest", "3633/../1", "$(id)", " 3633", "01"]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                guard.validate_build_id(value)

    def test_build_reason_must_be_ci_or_manual_even_on_master(self):
        for reason in ["individualCI", "batchedCI", "manual"]:
            with self.subTest(reason=reason):
                guard.validate_metadata(3633, {**self.build, "reason": reason}, self.artifacts)
        for reason in ["pullRequest", "schedule", "buildCompletion", "resourceTrigger", "unknown", None]:
            with self.subTest(reason=reason), self.assertRaises(ValueError):
                guard.validate_metadata(3633, {**self.build, "reason": reason}, self.artifacts)
        missing_reason = {k: v for k, v in self.build.items() if k != "reason"}
        with self.assertRaises(ValueError):
            guard.validate_metadata(3633, missing_reason, self.artifacts)

    def test_rejects_wrong_or_incomplete_build(self):
        changes = {
            "id": 3634, "status": "inProgress", "result": "partiallySucceeded",
            "sourceBranch": "refs/heads/develop", "sourceVersion": "",
            "definition": {"id": 14}, "project": {"id": "other"},
            "repository": {"id": "CopticDevs/hazzat-api", "type": "GitHub"},
        }
        for key, value in changes.items():
            with self.subTest(key=key), self.assertRaises(ValueError):
                guard.validate_metadata(3633, {**self.build, key: value}, self.artifacts)
            missing = {k: v for k, v in self.build.items() if k != key}
            with self.subTest(missing=key), self.assertRaises(ValueError):
                guard.validate_metadata(3633, missing, self.artifacts)

    def test_manual_selection_allows_feature_branch_but_automatic_does_not(self):
        build = {**self.build, "sourceBranch": "refs/heads/feature/prod-fix", "reason": "manual"}
        guard.validate_metadata(3633, build, self.artifacts, required_branch=None)
        with self.assertRaises(ValueError):
            guard.validate_metadata(3633, build, self.artifacts)
        for branch in ["refs/pull/1/merge", "refs/tags/release", "", "refs/heads/bad ref"]:
            with self.subTest(branch=branch), self.assertRaises(ValueError):
                guard.validate_metadata(3633, {**build, "sourceBranch": branch}, self.artifacts,
                                        required_branch=None)
        with self.assertRaises(ValueError):
            guard.validate_metadata(3633, {**build, "reason": "pullRequest"}, self.artifacts,
                                    required_branch=None)

    def test_ownership_requires_explicit_classic_retirement(self):
        guard.validate_classic_retired({"id": 11, "isDisabled": True})
        for definition in [{}, {"id": 11}, {"id": 9, "isDisabled": True},
                           {"id": 11, "isDisabled": False},
                           {"id": 11, "isDisabled": "true"},
                           {"id": 11, "isDisabled": 1}]:
            with self.subTest(definition=definition), self.assertRaises(ValueError):
                guard.validate_classic_retired(definition)

    def test_resource_context_pins_identity_and_automatic_code(self):
        branch, commit = self.build["sourceBranch"], self.build["sourceVersion"]
        guard.validate_resource_context(self.build, branch, commit, "Manual", "", "candidate", "b" * 40)
        guard.validate_resource_context(self.build, branch, commit, "ResourceTrigger", "prodBuild", branch, commit)
        for args in [
            (branch, "b" * 40, "Manual", "", branch, commit),
            ("refs/heads/main", commit, "Manual", "", branch, commit),
            (branch, commit, "Schedule", "prodBuild", branch, commit),
            (branch, commit, "ResourceTrigger", "devBuild", branch, commit),
            (branch, commit, "ResourceTrigger", "prodBuild", branch, "b" * 40),
            (branch, commit, "ResourceTrigger", "prodBuild", "refs/heads/main", commit),
        ]:
            with self.subTest(args=args), self.assertRaises(ValueError):
                guard.validate_resource_context(self.build, *args)

    def test_layout_requires_real_static_output_and_rejects_symlinks(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            with self.assertRaises(ValueError):
                guard.inspect_layout(root)
            (root / "index.html").write_text("PROD")
            (root / "static").mkdir()
            (root / "static/main.js").write_text("asset")
            manifest = guard.inspect_layout(root)
            self.assertEqual(len(manifest), 2)
            self.assertEqual(manifest["index.html"], guard.hashlib.sha256(b"PROD").hexdigest())
            (root / "link").symlink_to(root / "index.html")
            with self.assertRaises(ValueError):
                guard.inspect_layout(root)

    @patch.object(guard.time, "sleep")
    @patch.object(guard.urllib.request, "urlopen")
    def test_live_match_mismatch_and_wrong_target(self, urlopen, sleep):
        response = urlopen.return_value.__enter__.return_value
        response.url, response.read.return_value = guard.SITE, b"PROD"
        manifest = {"index.html": guard.hashlib.sha256(b"PROD").hexdigest()}
        guard.verify_live(manifest)
        response.read.return_value = b"wrong"
        with self.assertRaises(ValueError):
            guard.verify_live(manifest)
        response.read.return_value, response.url = b"PROD", "https://ppe.hazzat.com/"
        with self.assertRaises(ValueError):
            guard.verify_live(manifest)

    def test_rejects_wrong_missing_or_duplicate_artifact(self):
        wrong_type = copy.deepcopy(self.artifacts)
        wrong_type["value"][0]["resource"]["type"] = "PipelineArtifact"
        wrong_name = copy.deepcopy(self.artifacts)
        wrong_name["value"][0]["name"] = "HazzatWebBuildPpe"
        duplicate = {"value": self.artifacts["value"] * 2}
        for artifacts in [{}, {"value": []}, wrong_type, wrong_name, duplicate]:
            with self.subTest(artifacts=artifacts), self.assertRaises(ValueError):
                guard.validate_metadata(3633, self.build, artifacts)


if __name__ == "__main__":
    unittest.main()
