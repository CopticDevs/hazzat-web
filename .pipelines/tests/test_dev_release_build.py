"""Offline tests for dev provenance, layout, and post-deployment verification."""
import copy
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("dev_guard", ROOT / "scripts/verify-dev-release-build.py")
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)


class DevGuardTests(unittest.TestCase):
    def setUp(self):
        self.selected = (3354, "refs/heads/codex/public-skin-cleanup", "a" * 40)
        self.build = dict(id=3354, status="completed", result="succeeded", reason="manual",
                          sourceBranch=self.selected[1], sourceVersion=self.selected[2],
                          definition={"id": 12}, project={"id": guard.PROJECT},
                          repository={"id": "CopticDevs/hazzat-web", "type": "GitHub"})
        self.artifacts = {"value": [{"name": guard.ARTIFACT, "resource": {"type": "Container"}}]}

    def test_manual_feature_branch_is_valid(self):
        self.assertEqual(guard.selection("3354", self.selected[1], self.selected[2]), self.selected)
        guard.validate_metadata(self.selected, self.build, self.artifacts)

    def test_reject_invalid_selection(self):
        for selected in [("0", self.selected[1], self.selected[2]),
                         ("3354", "refs/pull/1/merge", self.selected[2]),
                         ("3354", self.selected[1], "UNSET")]:
            with self.subTest(selected=selected), self.assertRaises(ValueError):
                guard.selection(*selected)

    def test_reject_wrong_or_missing_provenance(self):
        bad = dict(id=3598, status="inProgress", result="failed", reason="pullRequest",
                   sourceBranch="refs/heads/develop", sourceVersion="b" * 40,
                   definition={"id": 14}, project={"id": "other"}, repository={"id": "other"})
        for key, value in bad.items():
            with self.subTest(key=key), self.assertRaises(ValueError):
                guard.validate_metadata(self.selected, {**self.build, key: value}, self.artifacts)
            missing = {k: v for k, v in self.build.items() if k != key}
            with self.subTest(missing=key), self.assertRaises(ValueError):
                guard.validate_metadata(self.selected, missing, self.artifacts)

    def test_reject_other_artifact_contract(self):
        wrong = copy.deepcopy(self.artifacts)
        wrong["value"][0]["name"] = "HazzatWebBuildPpe"
        for artifacts in [{}, wrong, {"value": self.artifacts["value"] * 2}]:
            with self.subTest(artifacts=artifacts), self.assertRaises(ValueError):
                guard.validate_metadata(self.selected, self.build, artifacts)

    def test_layout_hashes_and_rejects_missing_or_linked_content(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            with self.assertRaises(ValueError):
                guard.inspect_layout(root)
            (root / "index.html").write_text("dev index")
            (root / "static").mkdir()
            with self.assertRaises(ValueError):
                guard.inspect_layout(root)
            (root / "static/app.js").write_text("app")
            manifest = guard.inspect_layout(root)
            self.assertEqual(set(manifest), {"index.html", "static/app.js"})
            self.assertEqual(manifest["index.html"], guard.hashlib.sha256(b"dev index").hexdigest())
            (root / "linked").symlink_to(root / "index.html")
            with self.assertRaises(ValueError):
                guard.inspect_layout(root)

    @patch.object(guard.time, "sleep")
    @patch.object(guard.urllib.request, "urlopen")
    def test_live_match_and_mismatch(self, urlopen, sleep):
        response = urlopen.return_value.__enter__.return_value
        response.url = guard.SITE
        response.read.return_value = b"dev index"
        manifest = {"index.html": guard.hashlib.sha256(b"dev index").hexdigest()}
        guard.verify_live(manifest)
        response.read.return_value = b"other build"
        with self.assertRaises(ValueError):
            guard.verify_live(manifest)


if __name__ == "__main__":
    unittest.main()
