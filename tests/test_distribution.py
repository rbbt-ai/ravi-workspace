import copy
import gzip
import importlib.util
import io
import json
from pathlib import Path
import shutil
import tarfile
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("distribution", ROOT / "scripts/distribution.py")
dist = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dist)

class DistributionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="workspace-distribution-test-")
        self.root = Path(self.temp.name) / "source"
        shutil.copytree(ROOT, self.root, ignore=shutil.ignore_patterns(".git", "__pycache__"))

    def tearDown(self):
        self.temp.cleanup()

    def source(self):
        s = dist.audit(self.root, require_git=False)
        s["sourceCommit"], s["sourceTree"] = "0" * 40, "1" * 40
        return s

    def repack(self, data, change):
        output = io.BytesIO()
        with tarfile.open(fileobj=io.BytesIO(gzip.decompress(data)), mode="r:") as original:
            with tarfile.open(fileobj=output, mode="w", format=tarfile.PAX_FORMAT) as tar:
                for index, member in enumerate(original):
                    body = original.extractfile(member).read()
                    member, body = change(copy.copy(member), body, index)
                    tar.addfile(member, io.BytesIO(body) if member.isfile() else None)
        return gzip.compress(output.getvalue(), mtime=0)

    def test_manifest_lists_exact_source_and_licenses(self):
        s = self.source()
        self.assertIn("THIRD-PARTY-NOTICES.md", s["files"])
        self.assertIn("src/apps/workspace-hub/ui/workspace/fonts/geistmono-OFL.txt", s["files"])
        self.assertNotIn("snapshot.json", s["files"])

    def test_archive_repeats_bit_for_bit(self):
        s = self.source()
        one, manifest = dist.assemble(s)
        two, _ = dist.assemble(s)
        self.assertEqual(one, two)
        self.assertEqual(dist.verify(one, dist.digest(one)), manifest)

    def test_extra_file_including_ignored_env_is_rejected(self):
        for name in ["snapshot.json", ".env", "unreviewed.mjs"]:
            file = self.root / name
            file.write_text("fixture only")
            with self.assertRaisesRegex(dist.PackageError, "REPOSITORY_CONTENT_MISMATCH"):
                self.source()
            file.unlink()

    def test_allowlisting_a_snapshot_does_not_authorize_it(self):
        p = self.root / dist.POLICY
        policy = json.loads(p.read_text())
        policy["files"] = sorted(policy["files"] + ["snapshot.json"])
        p.write_text(json.dumps(policy))
        (self.root / "snapshot.json").write_text("{}")
        with self.assertRaisesRegex(dist.PackageError, "PRIVATE_PATH_NOT_ALLOWED"):
            self.source()

    def test_symlink_file_or_directory_is_rejected(self):
        target = self.root / "README.md"
        target.unlink()
        target.symlink_to(ROOT / "README.md")
        with self.assertRaisesRegex(dist.PackageError, "SYMLINK_NOT_ALLOWED"):
            self.source()
        target.unlink()
        shutil.copyfile(ROOT / "README.md", target)
        (self.root / "linked").symlink_to(ROOT / "docs", target_is_directory=True)
        with self.assertRaisesRegex(dist.PackageError, "SYMLINK_NOT_ALLOWED"):
            self.source()

    def test_sensitive_value_in_approved_source_is_rejected(self):
        readme = self.root / "README.md"
        readme.write_text("ghp_" + "a" * 36)
        with self.assertRaisesRegex(dist.PackageError, "SENSITIVE_CONTENT"):
            self.source()

    def test_version_mismatch_is_rejected(self):
        p = self.root / "package.json"
        pkg = json.loads(p.read_text())
        pkg["version"] = "99.0.0"
        p.write_text(json.dumps(pkg))
        with self.assertRaisesRegex(dist.PackageError, "VERSION_MISMATCH"):
            self.source()

    def test_missing_runtime_file_is_rejected(self):
        (self.root / "src/apps/workspace-hub/cli.mjs").unlink()
        with self.assertRaisesRegex(dist.PackageError, "REPOSITORY_CONTENT_MISMATCH"):
            self.source()

    def test_external_archive_checksum_is_required(self):
        data, _ = dist.assemble(self.source())
        with self.assertRaisesRegex(dist.PackageError, "CHECKSUM_REQUIRED"):
            dist.verify(data, None)
        with self.assertRaisesRegex(dist.PackageError, "ARCHIVE_CHECKSUM_MISMATCH"):
            dist.verify(data + b"tampered", dist.digest(data))

    def test_internal_file_hashes_are_verified(self):
        data, _ = dist.assemble(self.source())
        def change(m, body, index):
            if m.name.endswith("/README.md"):
                body = b"changed" + body
                m.size = len(body)
            return m, body
        altered = self.repack(data, change)
        with self.assertRaisesRegex(dist.PackageError, "FILE_CHECKSUM_MISMATCH"):
            dist.verify(altered, dist.digest(altered))

    def test_traversal_and_symlink_entries_are_rejected_without_extraction(self):
        data, _ = dist.assemble(self.source())
        def traversal(m, b, i):
            if i == 0:
                m.name = "../../outside"
            return m, b
        def symlink(m, b, i):
            if i == 0:
                m.type, m.linkname, m.size = tarfile.SYMTYPE, "/outside", 0
            return m, b
        for change in [traversal, symlink]:
            altered = self.repack(data, change)
            with self.assertRaisesRegex(dist.PackageError, "UNSAFE_ARCHIVE_ENTRY"):
                dist.verify(altered, dist.digest(altered))

    def test_modified_archive_metadata_is_rejected(self):
        data, _ = dist.assemble(self.source())
        def change(m, b, i):
            m.mtime = 123
            return m, b
        altered = self.repack(data, change)
        with self.assertRaisesRegex(dist.PackageError, "NONDETERMINISTIC_METADATA"):
            dist.verify(altered, dist.digest(altered))

    def test_build_requires_a_git_checkout_and_external_output(self):
        with self.assertRaisesRegex(dist.PackageError, "GIT_UNAVAILABLE"):
            dist.build(self.root, Path(self.temp.name) / "package.tgz")
        with self.assertRaisesRegex(dist.PackageError, "OUTPUT_MUST_BE_OUTSIDE_CHECKOUT"):
            dist.build(self.root, self.root / "package.tgz")

if __name__ == "__main__":
    unittest.main()
