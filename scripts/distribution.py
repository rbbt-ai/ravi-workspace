"""Build and verify a deterministic, explicitly allowlisted source distribution."""
import argparse
import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess
import tarfile
import tempfile

ROOT = Path(__file__).resolve().parents[1]
POLICY = "distribution/contents.json"
RECEIPT = "PACKAGE-MANIFEST.json"
LIMIT = 20_000_000

class PackageError(Exception):
    pass

def require(value, code):
    if not value:
        raise PackageError(code)

def digest(data):
    return hashlib.sha256(data).hexdigest()

def encode(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode()

def path_ok(name):
    return isinstance(name, str) and 0 < len(name) < 200 and not name.startswith("/") and all(p not in ("", ".", "..", ".git") for p in name.split("/")) and re.fullmatch(r"[A-Za-z0-9_.\-/]+", name) is not None

def git(root, *args):
    p = subprocess.run(["git", "-C", str(root), *args], capture_output=True)
    require(p.returncode == 0, "GIT_UNAVAILABLE")
    return p.stdout

def scan_text(name, data):
    if name.endswith(".woff2"):
        require(data[:4] == b"wOF2", "INVALID_FONT")
        return
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        raise PackageError("UNEXPECTED_BINARY")
    # Patterns match values, not references to configuration keys in code/tests.
    patterns = [
        r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
        r"gh[pousr]_[A-Za-z0-9]{30,}", r"github_pat_[A-Za-z0-9_]{30,}",
        r"rctx_[A-Za-z0-9_-]{16,}", r"sk-[A-Za-z0-9_-]{30,}",
        r"https?://[^\s/]+:[^\s/]+@", r"/Users/[A-Za-z0-9_-]+/",
        r"(?:apiKey|refreshToken|clientSecret|accessToken)\s*[\"']?\s*[:=]\s*[\"'][A-Za-z0-9_./+\-=]{16,}[\"']",
    ]
    require(not any(re.search(p, text) for p in patterns), "SENSITIVE_CONTENT")

def audit(root, require_git=True):
    root = Path(root).resolve()
    policy_file = root / POLICY
    require(not policy_file.is_symlink(), "SYMLINK_NOT_ALLOWED")
    policy = json.loads(policy_file.read_text())
    require(set(policy) == {"schema", "files"} and policy["schema"] == "workspace.distribution/v1", "INVALID_POLICY")
    names = policy["files"]
    require(isinstance(names, list) and 0 < len(names) < 200 and all(path_ok(n) for n in names) and names == sorted(set(names)), "INVALID_FILE_LIST")
    mandatory = {POLICY, "package.json", "README.md", "LICENSE", "THIRD-PARTY-NOTICES.md", "scripts/distribution.py", "src/apps/workspace-hub/cli.mjs", "src/apps/workspace-hub/ravi.app.json", "src/apps/workspace-hub/ui/workspace/template.html", "src/apps/workspace-hub/ui/workspace/fonts/montserrat-OFL.txt", "src/apps/workspace-hub/ui/workspace/fonts/geistmono-OFL.txt", "src/apps/workspace-hub/ui/workspace/vendor/ANIME-LICENSE.md"}
    require(mandatory <= set(names), "REQUIRED_FILE_MISSING")
    seen = set()
    for directory, dirs, files in os.walk(root, followlinks=False):
        if Path(directory) == root and ".git" in dirs:
            dirs.remove(".git")
        for entry in [*dirs, *files]:
            f = Path(directory) / entry
            require(not f.is_symlink(), "SYMLINK_NOT_ALLOWED")
        for name in files:
            f = Path(directory) / name
            rel = f.relative_to(root).as_posix()
            if rel == ".git":
                continue
            seen.add(rel)
    require(seen == set(names), "REPOSITORY_CONTENT_MISMATCH")
    content = {}
    for name in names:
        if name.endswith(".json"):
            require(name in {POLICY, "package.json", "src/apps/workspace-hub/ravi.app.json"}, "PRIVATE_PATH_NOT_ALLOWED")
        require(not any(p.lower() in {"reviews", "snapshots", "state", ".state", "node_modules", "dist"} for p in name.split("/")), "PRIVATE_PATH_NOT_ALLOWED")
        require(not re.search(r"(?:^|/)(?:\.env(?:\..*)?|config\.json|snapshot\.json|.*\.(?:db|sqlite|log|otf|png|jpg|webp))$", name, re.I), "PRIVATE_PATH_NOT_ALLOWED")
        f = root / name
        require(f.is_file() and f.stat().st_size <= 3_000_000, "INVALID_SOURCE_FILE")
        data = f.read_bytes()
        scan_text(name, data)
        content[name] = data
    require(sum(map(len, content.values())) <= LIMIT, "PACKAGE_TOO_LARGE")
    pkg = json.loads(content["package.json"])
    app = json.loads(content["src/apps/workspace-hub/ravi.app.json"])
    require(pkg["name"] == "ravi-workspace" and app["id"] == "workspace-hub" and app["schema"] == "ravi.app/v1", "APP_IDENTITY_MISMATCH")
    require(re.fullmatch(r"\d+\.\d+\.\d+(?:-[a-z0-9.]+)?", pkg["version"]) and app["version"] == pkg["version"], "VERSION_MISMATCH")
    revision = tree = None
    if require_git:
        require(git(root, "status", "--porcelain=v1", "--untracked-files=all") == b"", "DIRTY_CHECKOUT")
        tracked = git(root, "ls-files", "--stage", "-z").decode().strip("\0").split("\0")
        require(all(v.split(" ", 1)[0] in ("100644", "100755") for v in tracked), "UNSUPPORTED_GIT_ENTRY")
        require({v.split("\t", 1)[1] for v in tracked} == set(names), "TRACKED_CONTENT_MISMATCH")
        revision = git(root, "rev-parse", "HEAD").decode().strip()
        tree = git(root, "rev-parse", "HEAD^{tree}").decode().strip()
    return {"name": pkg["name"], "version": pkg["version"], "sourceCommit": revision, "sourceTree": tree, "files": content}

def assemble(source):
    root_name = f'{source["name"]}-{source["version"]}'
    files = source["files"]
    manifest = {"schema": "workspace.package/v1", "appId": "workspace-hub", "version": source["version"], "root": root_name, "sourceCommit": source["sourceCommit"], "sourceTree": source["sourceTree"], "files": [{"path": name, "bytes": len(data), "sha256": digest(data)} for name, data in sorted(files.items())]}
    all_files = {**files, RECEIPT: encode(manifest)}
    raw = io.BytesIO()
    with tarfile.open(fileobj=raw, mode="w", format=tarfile.PAX_FORMAT) as tar:
        for name, data in sorted(all_files.items()):
            info = tarfile.TarInfo(root_name + "/" + name)
            info.size, info.mode, info.mtime = len(data), 0o644, 0
            info.uid = info.gid = 0
            info.uname = info.gname = ""
            tar.addfile(info, io.BytesIO(data))
    output = io.BytesIO()
    with gzip.GzipFile(fileobj=output, mode="wb", filename="", mtime=0, compresslevel=9) as zipped:
        zipped.write(raw.getvalue())
    return output.getvalue(), manifest

def verify(data, expected):
    require(isinstance(expected, str) and re.fullmatch(r"[0-9a-f]{64}", expected), "CHECKSUM_REQUIRED")
    require(len(data) <= LIMIT and digest(data) == expected, "ARCHIVE_CHECKSUM_MISMATCH")
    with gzip.GzipFile(fileobj=io.BytesIO(data)) as zipped:
        raw = zipped.read(LIMIT + 1)
    require(len(raw) <= LIMIT, "PACKAGE_TOO_LARGE")
    files = {}
    with tarfile.open(fileobj=io.BytesIO(raw), mode="r:") as tar:
        for member in tar:
            require(len(files) < 200 and member.isfile() and path_ok(member.name) and member.name not in files and member.size <= 3_000_000, "UNSAFE_ARCHIVE_ENTRY")
            require(member.uid == member.gid == member.mtime == 0 and member.mode == 0o644 and member.uname == member.gname == "", "NONDETERMINISTIC_METADATA")
            files[member.name] = tar.extractfile(member).read()
    receipts = [name for name in files if name.count("/") == 1 and name.endswith("/" + RECEIPT)]
    require(len(receipts) == 1, "MANIFEST_REQUIRED")
    manifest = json.loads(files.pop(receipts[0]))
    require(set(manifest) == {"schema", "appId", "version", "root", "sourceCommit", "sourceTree", "files"} and manifest["schema"] == "workspace.package/v1" and manifest["appId"] == "workspace-hub", "INVALID_PACKAGE_MANIFEST")
    prefix = manifest["root"] + "/"
    require(prefix == receipts[0].split("/", 1)[0] + "/" and re.fullmatch(r"ravi-workspace-\d+\.\d+\.\d+(?:-[a-z0-9.]+)?/", prefix), "INVALID_PACKAGE_ROOT")
    require(manifest["root"] == "ravi-workspace-" + manifest["version"], "VERSION_MISMATCH")
    require(all(isinstance(manifest[k], str) and re.fullmatch(r"(?:[0-9a-f]{40}|[0-9a-f]{64})", manifest[k]) for k in ["sourceCommit", "sourceTree"]), "INVALID_SOURCE_REVISION")
    entries = manifest["files"]
    require(isinstance(entries, list) and len(entries) == len(files), "PACKAGE_CONTENT_MISMATCH")
    names = [e["path"] for e in entries]
    require(names == sorted(set(names)) and all(path_ok(n) for n in names), "INVALID_FILE_LIST")
    require(set(files) == {prefix + name for name in names}, "PACKAGE_CONTENT_MISMATCH")
    for entry in entries:
        require(set(entry) == {"path", "bytes", "sha256"}, "INVALID_PACKAGE_MANIFEST")
        blob = files[prefix + entry["path"]]
        require(len(blob) == entry["bytes"] and digest(blob) == entry["sha256"], "FILE_CHECKSUM_MISMATCH")
        scan_text(entry["path"], blob)
    policy = json.loads(files[prefix + POLICY])
    require(policy["schema"] == "workspace.distribution/v1" and policy["files"] == names, "POLICY_MISMATCH")
    app = json.loads(files[prefix + "src/apps/workspace-hub/ravi.app.json"])
    pkg = json.loads(files[prefix + "package.json"])
    require(app["version"] == pkg["version"] == manifest["version"] and app["id"] == manifest["appId"], "VERSION_MISMATCH")
    return manifest

def build(root, out):
    root, out = Path(root).resolve(), Path(out).resolve()
    require(not out.is_relative_to(root), "OUTPUT_MUST_BE_OUTSIDE_CHECKOUT")
    source = audit(root)
    archive, manifest = assemble(source)
    sha = digest(archive)
    verify(archive, sha)
    require(not out.exists() and not out.is_symlink(), "OUTPUT_ALREADY_EXISTS")
    out.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    fd, temp = tempfile.mkstemp(prefix=".workspace-package-", dir=out.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(archive)
            stream.flush()
            os.fsync(stream.fileno())
        os.link(temp, out)  # Atomic publication, refusing an existing artifact.
    finally:
        os.unlink(temp)
    return {"status": "built", "appId": "workspace-hub", "version": source["version"], "sourceCommit": source["sourceCommit"], "files": len(manifest["files"]), "bytes": len(archive), "sha256": sha}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    check = commands.add_parser("audit")
    check.add_argument("--root", type=Path, default=ROOT)
    make = commands.add_parser("build")
    make.add_argument("--root", type=Path, default=ROOT)
    make.add_argument("--out", type=Path, required=True)
    verify_cmd = commands.add_parser("verify")
    verify_cmd.add_argument("archive", type=Path)
    verify_cmd.add_argument("--sha256", required=True)
    args = parser.parse_args()
    try:
        if args.command == "build":
            result = build(args.root, args.out)
        elif args.command == "audit":
            source = audit(args.root)
            result = {"status": "passed", "files": len(source["files"]), "version": source["version"], "sourceCommit": source["sourceCommit"]}
        else:
            require(args.archive.stat().st_size <= LIMIT, "PACKAGE_TOO_LARGE")
            data = args.archive.read_bytes()
            manifest = verify(data, args.sha256)
            result = {"status": "verified", "appId": manifest["appId"], "version": manifest["version"], "sourceCommit": manifest["sourceCommit"], "files": len(manifest["files"]), "sha256": digest(data)}
        print(json.dumps(result))
    except Exception as error:
        # Never print malformed input, secret values or private file contents.
        code = str(error) if isinstance(error, PackageError) else "INVALID_PACKAGE_INPUT"
        print(json.dumps({"status": "failed", "error": code}))
        return 1
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
