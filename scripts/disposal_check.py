# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/record-contract/scripts/disposal_check.py
# Commit: 80cf437
# Copied: 2026-09-20
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""RECORD-CONTRACT.md section 6, check 1: no record ID present in the base may be absent
from the head. Disposal is a change of standing, never a deletion - so a record that
vanishes is the contract's most important failure, and the one nothing caught before.

A record is counted where it is *defined*, not where it is mentioned:

    ### WOW-FUN-001 - ...            requirement, any requirements/*.md
    ## D-2026-09-07-4 - ...          decision, any DECISIONS.md
    | **TB-11** | ...                to-be item      }
    | **F-35** | ...                 finding         }  ARCHITECTURE.md tables
    | **AS-53** | ...                audit claim     }

Moving a definition to another file is reported, not failed: the ID still resolves.
Renaming is a deletion - TB-31 becoming TB-31b loses TB-31 - and is failed, which is
exactly the case D-2026-09-07-2 forbids.

    python tools/disposal_check.py --base origin/main            # head = HEAD
    python tools/disposal_check.py --base HEAD~5 --head WORKTREE # uncommitted work too

Exit 0 clean, 1 when any ID vanished, 2 when the check itself cannot run (bad ref, or a
base that defines no records at all, which means the wrong ref was passed). Fail closed.
"""
import argparse
import io
import os
import re
import subprocess
import sys

PATTERNS = [
    ("requirement", re.compile(r"^### ([A-Z]{2,6}-[A-Z]{3}-\d{3})\b"), re.compile(r"(^|/)requirements/[^/]+\.md$")),
    ("decision", re.compile(r"^## (D-\d{4}-\d{2}-\d{2}-\d+)\b"), re.compile(r"(^|/)DECISIONS\.md$")),
    ("to-be item", re.compile(r"^\| \*\*(TB-\d+[a-z]?)\*\* \|"), re.compile(r"(^|/)ARCHITECTURE\.md$")),
    ("finding", re.compile(r"^\| \*\*(F-\d+)\*\* \|"), re.compile(r"(^|/)ARCHITECTURE\.md$")),
    ("audit claim", re.compile(r"^\| \*\*(AS-\d+)\*\* \|"), re.compile(r"(^|/)ARCHITECTURE\.md$")),
]


def git(repo, args):
    r = subprocess.run(["git", "-C", repo] + args, capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.decode("utf-8", "replace").strip())
    return r.stdout


def md_paths(repo, ref):
    # ls-tree does not glob a pathspec; filter here or it silently lists nothing
    if ref == "WORKTREE":
        out = git(repo, ["ls-files"]).decode("utf-8")
    else:
        out = git(repo, ["ls-tree", "-r", "--name-only", ref]).decode("utf-8")
    return [p for p in out.replace("\r", "").split("\n") if p.strip().endswith(".md")]


def read(repo, ref, path):
    if ref == "WORKTREE":
        full = os.path.join(repo, path)
        if not os.path.isfile(full):
            return ""
        return io.open(full, encoding="utf-8", errors="replace").read()
    return git(repo, ["show", "%s:%s" % (ref, path)]).decode("utf-8", "replace")


def definitions(repo, ref):
    """{id: (kind, path)} for every record defined at ref."""
    found = {}
    for path in md_paths(repo, ref):
        kinds = [(k, rx) for k, rx, where in PATTERNS if where.search(path)]
        if not kinds:
            continue
        text = read(repo, ref, path).replace("\r\n", "\n")
        for line in text.split("\n"):
            for kind, rx in kinds:
                m = rx.match(line)
                if m:
                    found.setdefault(m.group(1), (kind, path))
    return found


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--repo", default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    ap.add_argument("--base", required=True, help="ref the change is measured from")
    ap.add_argument("--head", default="HEAD", help="ref to check, or WORKTREE")
    args = ap.parse_args()

    try:
        base = definitions(args.repo, args.base)
        head = definitions(args.repo, args.head)
    except RuntimeError as e:
        print("ERROR: cannot read a ref: %s" % e)
        sys.exit(2)

    if not base:
        print("ERROR: base %s defines no records at all - wrong ref? Refusing to pass." % args.base)
        sys.exit(2)

    vanished = sorted(i for i in base if i not in head)
    moved = sorted(i for i in base if i in head and base[i][1] != head[i][1])
    added = sorted(i for i in head if i not in base)

    print("disposal check: base %s (%d records) -> head %s (%d records)" % (
        args.base, len(base), args.head, len(head)))
    if added:
        print("  added   %d: %s" % (len(added), ", ".join(added[:12]) + (" ..." if len(added) > 12 else "")))
    for i in moved:
        print("  moved   %s  %s -> %s" % (i, base[i][1], head[i][1]))
    for i in vanished:
        kind, path = base[i]
        print("  VANISHED %s  (%s, was in %s)" % (i, kind, path))

    if vanished:
        print("\n%d record(s) defined in the base are not defined in the head. A record is "
              "never removed: change its standing (superseded / withdrawn / deleted) and "
              "keep the row. RECORD-CONTRACT.md section 5." % len(vanished))
        sys.exit(1)
    print("  no record vanished")
    sys.exit(0)


if __name__ == "__main__":
    main()
