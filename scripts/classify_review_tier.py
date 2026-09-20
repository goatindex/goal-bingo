# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/adversarial-review/scripts/classify_review_tier.py
# Commit: f3020be
# Copied: 2026-09-20
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
# -*- coding: utf-8 -*-
"""Classify a pull request into an adversarial-review intensity tier.

Package B: mechanical / lite / standard / deep from changed paths only (TB-20:
no repository names). Pure heuristics so one master serves every consumer.

Package B smoke stamp: docstring-only sync exercises the mechanical tier.

ASCII only (PS 5.1 decodes non-ASCII as ANSI).
"""
from __future__ import print_function

import argparse
import json
import os
import re
import subprocess
import sys

# Generated workflow copies that may ride with mechanical syncs (copies.txt
# destinations). Other .github/workflows/* force deep.
KNOWN_GENERATED_WORKFLOWS = frozenset([
    ".github/workflows/adversarial-review.yml",
    ".github/workflows/issue-corruption-check.yml",
])

LITE_BASENAMES = frozenset(["NEXT.md", "README.md", "CHANGELOG.md"])

DEEP_CODE_EXT = frozenset([
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".go", ".rs", ".java", ".kt", ".swift",
])

MAX_TURNS = {
    "mechanical": 0,
    "lite": 30,
    "standard": 75,
    "deep": 75,
}


def norm(path):
    # Do not use str.lstrip("./") - that strips any leading '.' or '/' char,
    # turning ".github/workflows/x.yml" into "github/workflows/x.yml".
    path = path.replace("\\", "/")
    while path.startswith("./"):
        path = path[2:]
    return path


def load_copy_destinations(copies_path):
    """Second column of copies.txt lines (local destination paths)."""
    out = set()
    if not copies_path or not os.path.isfile(copies_path):
        return out
    with open(copies_path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split()
            if len(parts) >= 2:
                out.add(norm(parts[1]))
    return out


def is_lite_path(path):
    path = norm(path)
    base = os.path.basename(path)
    if base in LITE_BASENAMES:
        return True
    return False


def is_deep_path(path, copy_dests):
    path = norm(path)
    if path.startswith("app/") or "/src/" in ("/" + path):
        return True
    if path.startswith("src/"):
        return True
    lower = path.lower()
    if "/test/" in ("/" + lower) or "/tests/" in ("/" + lower):
        return True
    if re.search(r"(^|/)test[^/]*$", lower) or lower.endswith("_test.py"):
        return True
    if any(path.endswith(ext) for ext in DEEP_CODE_EXT):
        return True
    if path.startswith(".github/workflows/"):
        if path in KNOWN_GENERATED_WORKFLOWS:
            return False
        if path in copy_dests:
            return False
        return True
    return False


def is_mechanical_path(path, copy_dests):
    path = norm(path)
    if path == ".github/workflows/adversarial-review.yml":
        return True
    if path in copy_dests:
        return True
    return False


def classify_paths(paths, copy_dests=None):
    """Return (tier, reasons) for a list of changed paths."""
    copy_dests = copy_dests or set()
    paths = [norm(p) for p in paths if p and p.strip()]
    reasons = []

    if not paths:
        reasons.append("no changed paths; default standard")
        return "standard", reasons

    if all(is_mechanical_path(p, copy_dests) for p in paths):
        reasons.append("all paths are adversarial-review.yml or copies.txt destinations")
        return "mechanical", reasons

    if all(is_lite_path(p) for p in paths):
        reasons.append("all paths are session/status docs (NEXT/README/CHANGELOG)")
        return "lite", reasons

    deep_hits = [p for p in paths if is_deep_path(p, copy_dests)]
    if deep_hits:
        reasons.append("deep paths: " + ", ".join(deep_hits[:8]))
        return "deep", reasons

    reasons.append("mixed or design/requirements paths; standard")
    return "standard", reasons


def list_changed_files(repo, base, head):
    r = subprocess.run(
        ["git", "-C", repo, "diff", "--name-only", "%s...%s" % (base, head)],
        capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit("git diff failed: %s" % (r.stderr or r.stdout or r.returncode))
    return [ln.strip() for ln in r.stdout.splitlines() if ln.strip()]


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--base", help="git base ref/sha")
    p.add_argument("--head", help="git head ref/sha")
    p.add_argument("--repo", default=".", help="repository root")
    p.add_argument("--copies", default="copies.txt",
                   help="copies.txt path relative to --repo (optional)")
    p.add_argument("--paths-file", help="read changed paths from a file (one per line); "
                   "skips git when set")
    p.add_argument("--github-output", action="store_true",
                   help="also print tier=/max_turns= lines for $GITHUB_OUTPUT")
    p.add_argument("--json", action="store_true", dest="as_json",
                   help="print JSON result to stdout (default)")
    args = p.parse_args(argv)

    repo = os.path.abspath(args.repo)
    copies_path = os.path.join(repo, args.copies) if args.copies else None
    copy_dests = load_copy_destinations(copies_path)

    if args.paths_file:
        with open(args.paths_file, "r", encoding="utf-8") as fh:
            paths = [ln.strip() for ln in fh if ln.strip()]
    else:
        if not args.base or not args.head:
            raise SystemExit("--base and --head are required unless --paths-file is set")
        paths = list_changed_files(repo, args.base, args.head)

    tier, reasons = classify_paths(paths, copy_dests)
    result = {
        "tier": tier,
        "max_turns": MAX_TURNS[tier],
        "reasons": reasons,
        "paths": paths,
    }

    # Always emit JSON on stdout for agents/CI consumers.
    print(json.dumps(result, indent=2, sort_keys=True))

    if args.github_output:
        out_path = os.environ.get("GITHUB_OUTPUT")
        lines = "tier=%s\nmax_turns=%s\n" % (tier, MAX_TURNS[tier])
        if out_path:
            with open(out_path, "a", encoding="utf-8") as fh:
                fh.write(lines)
        else:
            # Local dry-run: still show what would be written.
            sys.stderr.write(lines)

    return 0


if __name__ == "__main__":
    sys.exit(main())
