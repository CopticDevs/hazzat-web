"""Offline negative cases for the release artifact provenance guard."""

import copy
import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("guard", ROOT / "scripts/verify-ppe-release-build.py")
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)


class BuildGuardTests(unittest.TestCase):
    def setUp(self):
        self.build = {
            "id": 3598, "status": "completed", "result": "succeeded", "reason": "individualCI",
            "sourceBranch": "refs/heads/develop", "sourceVersion": "a" * 40,
            "definition": {"id": 14}, "project": {"id": guard.PROJECT_ID},
            "repository": {"id": "CopticDevs/hazzat-web", "type": "GitHub"},
        }
        self.artifacts = {"value": [{"name": guard.ARTIFACT, "resource": {"type": "Container"}}]}

    def test_accepts_verified_build(self):
        guard.validate_metadata(3598, self.build, self.artifacts)
        self.assertEqual(guard.validate_build_id("3598"), 3598)

    def test_rejects_invalid_ids(self):
        for value in ["", "0", "-1", "1.0", "latest", "3598/../1", "$(id)", " 3598", "01"]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                guard.validate_build_id(value)

    def test_build_reason_must_be_ci_or_manual_even_on_develop(self):
        for reason in ["individualCI", "batchedCI", "manual"]:
            with self.subTest(reason=reason):
                guard.validate_metadata(3598, {**self.build, "reason": reason}, self.artifacts)
        for reason in ["pullRequest", "schedule", "buildCompletion", "resourceTrigger", "unknown", None]:
            with self.subTest(reason=reason), self.assertRaises(ValueError):
                guard.validate_metadata(3598, {**self.build, "reason": reason}, self.artifacts)
        missing_reason = {k: v for k, v in self.build.items() if k != "reason"}
        with self.assertRaises(ValueError):
            guard.validate_metadata(3598, missing_reason, self.artifacts)

    def test_rejects_wrong_or_incomplete_build(self):
        changes = {
            "id": 3599, "status": "inProgress", "result": "partiallySucceeded",
            "sourceBranch": "refs/heads/master", "sourceVersion": "",
            "definition": {"id": 15}, "project": {"id": "other"},
            "repository": {"id": "CopticDevs/hazzat-api", "type": "GitHub"},
        }
        for key, value in changes.items():
            with self.subTest(key=key), self.assertRaises(ValueError):
                guard.validate_metadata(3598, {**self.build, key: value}, self.artifacts)
            missing = {k: v for k, v in self.build.items() if k != key}
            with self.subTest(missing=key), self.assertRaises(ValueError):
                guard.validate_metadata(3598, missing, self.artifacts)

    def test_rejects_wrong_missing_or_duplicate_artifact(self):
        wrong_type = copy.deepcopy(self.artifacts)
        wrong_type["value"][0]["resource"]["type"] = "PipelineArtifact"
        wrong_name = copy.deepcopy(self.artifacts)
        wrong_name["value"][0]["name"] = "HazzatWebBuildProd"
        duplicate = {"value": self.artifacts["value"] * 2}
        for artifacts in [{}, {"value": []}, wrong_type, wrong_name, duplicate]:
            with self.subTest(artifacts=artifacts), self.assertRaises(ValueError):
                guard.validate_metadata(3598, self.build, artifacts)


if __name__ == "__main__":
    unittest.main()
