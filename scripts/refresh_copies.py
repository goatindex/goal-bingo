# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/master-and-copy/scripts/refresh_copies.py
# Commit: 407115d
# Copied: 2026-09-19
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
#!/usr/bin/env python3
"""Regenerate the copies this repo carries from their masters, and detect drift.

Some tooling is mastered elsewhere. This repo carries a generated copy so CI can
run it without reaching outside the checkout - CI runners cannot see a developer's
home directory, and fetching a private repo per run would mean a credential and a
network dependency for a file that costs nothing.

The rule is master-and-copy: the master is authoritative, the copy is generated,
and a copy is never hand-edited. This script is what makes that true rather than
aspirational. Without it, re-copying is a manual step, and a manual step with no
nudge is eventually skipped.

    python scripts/refresh_copies.py            regenerate every copy
    python scripts/refresh_copies.py --check    report drift, non-zero if any

The manifest is `copies.txt` at the root of the consuming repository, one copy per
line, master path first:

    # comments and blank lines are ignored
    skills/record-contract/scripts/standing_check.py   tools/standing_check.py

It lives outside this script on purpose. The script was once identical in two
repositories apart from that list, which is drift by the rule this script exists to
enforce. One master, one small data file per consumer.

This script normally lists itself in `copies.txt`, so it keeps itself current. The
first install into a new repository is a manual copy: a copier cannot copy itself
into a repository that has no copier.

The master defaults to a local checkout of goatindex/claude-workflow. Point
elsewhere with --master or the WAYS_OF_WORKING_MASTER environment variable.

--check needs the master, so it runs locally, not in CI. When the master is not
reachable it says so and exits non-zero rather than reporting "no drift", because
a check that cannot run has not passed.
"""

import argparse
import io
import os
import subprocess
import sys
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

DEFAULT_MASTER = os.environ.get("WAYS_OF_WORKING_MASTER", r"D:\claude-workflow")
MASTER_REPO = "goatindex/claude-workflow"

MANIFEST = os.environ.get("WAYS_OF_WORKING_MANIFEST",
                          os.path.join(REPO, "copies.txt"))


def load_manifest(path):
    """[(master path, local path)] from copies.txt.

    A missing or empty manifest is an error, not an empty run: a repository that
    carries this script is a repository that consumes something, and silently
    copying nothing is the failure this whole mechanism exists to prevent.
    """
    if not os.path.isfile(path):
        sys.stderr.write("no manifest at %s\n" % path)
        return None
    pairs = []
    for n, line in enumerate(io.open(path, encoding="utf-8"), 1):
        line = line.split("#")[0].strip()
        if not line:
            continue
        parts = line.split()
        if len(parts) != 2:
            sys.stderr.write("%s:%d: expected 'master-path local-path', got: %s\n"
                             % (path, n, line))
            return None
        pairs.append((parts[0], parts[1]))
    if not pairs:
        sys.stderr.write("manifest %s lists no copies\n" % path)
        return None
    return pairs


MARKER = "# --- end generated header ---"

HEADER = """# GENERATED COPY - DO NOT EDIT
#
# Master: {repo}
#         {path}
# Commit: {commit}
# Copied: {when}
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
{marker}
"""


def master_commit(master):
    """Short commit of the master checkout, or 'unknown' if it is not a repo."""
    try:
        out = subprocess.run(["git", "-C", master, "rev-parse", "--short", "HEAD"],
                             stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        if out.returncode == 0:
            return out.stdout.decode().strip()
    except OSError:
        pass
    return "unknown"


def read(path):
    with open(path, "r", encoding="utf-8") as handle:
        return handle.read()


def strip_header(text):
    """Return a copy's content without its generated header."""
    if MARKER in text:
        return text.split(MARKER, 1)[1].lstrip("\n")
    return text


def resolve_master(master):
    if not os.path.isdir(master):
        sys.stderr.write(
            "master not found at %s\n"
            "set --master or WAYS_OF_WORKING_MASTER to a checkout of %s\n"
            % (master, MASTER_REPO))
        return None
    return master


def header_of(text):
    """The generated header, or None when there is not one."""
    if MARKER not in text:
        return None
    return text.split(MARKER, 1)[0]


def header_claims(text, rel_master):
    """Does the header name this repository's master and this file's path?

    F-56: the drift check compared only what followed the marker, so a header rewritten
    to name a different master reported clean. The header is what a reader follows to
    find the master; nothing checked it after generation.
    """
    head = header_of(text)
    if head is None:
        return "carries no generated header"
    if MASTER_REPO not in head:
        return "header does not name %s" % MASTER_REPO
    if rel_master.replace("\\", "/") not in head.replace("\\", "/"):
        return "header does not name the master path %s" % rel_master
    return None


def check(master, copies):
    """Report drift between each copy and its master. Returns an exit code."""
    if resolve_master(master) is None:
        sys.stderr.write("cannot check for drift without the master; not reporting clean\n")
        return 2

    drifted = []
    for rel_master, rel_local in copies:
        src = os.path.join(master, rel_master)
        dst = os.path.join(REPO, rel_local)
        if not os.path.isfile(src):
            sys.stderr.write("master file missing: %s\n" % src)
            return 2
        if not os.path.isfile(dst):
            drifted.append((rel_local, "copy does not exist"))
            continue
        text = read(dst)
        if strip_header(text) != read(src):
            drifted.append((rel_local, "differs from master"))
            continue
        wrong = header_claims(text, rel_master)
        if wrong:
            drifted.append((rel_local, wrong))

    for rel_local, why in drifted:
        sys.stderr.write("drift: %s - %s\n" % (rel_local, why))
    if drifted:
        sys.stderr.write("run scripts/refresh_copies.py to regenerate\n")
        return 1

    print("%d cop%s up to date with %s"
          % (len(copies), "y" if len(copies) == 1 else "ies", MASTER_REPO))
    return 0


def committed_in_head(master_root, rel_path):
    """Does the master's HEAD commit actually contain this file?

    The header names HEAD, so a file only in the master's working tree gets a header
    pointing at a commit that does not contain it. Found 2026-09-08 by copying an
    uncommitted partition_check.py.
    """
    r = subprocess.run(["git", "-C", master_root, "cat-file", "-e",
                        "HEAD:" + rel_path.replace("\\", "/")],
                       capture_output=True)
    return r.returncode == 0


def refresh(master, copies, allow_uncommitted=False):
    """Regenerate every copy from the master. Returns an exit code."""
    if resolve_master(master) is None:
        return 2

    commit = master_commit(master)
    when = date.today().isoformat()

    for rel_master, rel_local in copies:
        src = os.path.join(master, rel_master)
        dst = os.path.join(REPO, rel_local)
        if not os.path.isfile(src):
            sys.stderr.write("master file missing: %s\n" % src)
            return 2
        if not allow_uncommitted and not committed_in_head(master, rel_master):
            sys.stderr.write(
                "master file is not in %s HEAD (%s): %s\n"
                "The header would name a commit that does not contain it. Commit "
                "the master first, or pass --allow-uncommitted-master.\n"
                % (MASTER_REPO, commit, rel_master))
            return 2
        # A copy that already matches is left untouched. Rewriting it with the
        # platform newline only agrees with git when core.autocrlf happens to match
        # the platform; not writing agrees with git always.
        if os.path.isfile(dst) and strip_header(read(dst)) == read(src):
            print("unchanged %s (already matches %s)" % (rel_local, MASTER_REPO))
            continue

        header = HEADER.format(repo=MASTER_REPO, path=rel_master,
                               commit=commit, when=when, marker=MARKER)
        # Platform default newline on purpose. Forcing LF here made every
        # refresh show as a modification under core.autocrlf=true - a pure
        # line-ending diff, indistinguishable from real drift.
        parent = os.path.dirname(dst)
        if parent and not os.path.isdir(parent):
            os.makedirs(parent)
        with open(dst, "w", encoding="utf-8") as handle:
            handle.write(header + read(src))
        print("wrote %s (from %s@%s)" % (rel_local, MASTER_REPO, commit))
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--master", default=DEFAULT_MASTER,
                        help="checkout of %s (default: %s)"
                             % (MASTER_REPO, DEFAULT_MASTER))
    parser.add_argument(
        "--allow-uncommitted-master", action="store_true",
        help="copy even when the master file is absent from the master "
             "repo's HEAD; the header will then name a commit that does "
             "not contain it")
    parser.add_argument("--manifest", default=MANIFEST,
                        help="the copies.txt to read (default: repo root)")
    parser.add_argument("--check", action="store_true",
                        help="report drift instead of regenerating; "
                             "non-zero exit if any copy differs")
    args = parser.parse_args(argv)
    copies = load_manifest(args.manifest)
    if copies is None:
        return 2
    return (check(args.master, copies) if args.check
            else refresh(args.master, copies, args.allow_uncommitted_master))


if __name__ == "__main__":
    sys.exit(main())
