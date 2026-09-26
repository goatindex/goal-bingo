# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/adversarial-review/scripts/classify_review_tier.py
# Commit: 1e5f559
# Copied: 2026-09-26
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
# -*- coding: utf-8 -*-
"""Classify a pull request into an adversarial-review intensity tier.

Package B: mechanical / lite / standard / deep from changed paths only (TB-20:
no repository names). Pure heuristics so one master serves every consumer.

Package B smoke stamp: docstring-only sync exercises the mechanical tier.

Also reports `test_gate`: present when some workflow in .github/workflows/ runs a test
suite or typecheck on pull_request, absent otherwise. The reviewer workflow fails a
deep-tier review on absent - a review that reads "all tests pass" with no gate behind
it can only repeat the claim (goal-bingo, 97 PRs, no CI ran vitest or tsc).

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


def is_tooling_path(path):
    """Session/process tooling — not product. Never forces deep by itself.

    hooks/, skills/, and top-level scripts/ are the estate's own gates and masters.
    A change there still needs review (standard), but not a 75-turn product deep pass
    the way app/src does (Package D hook PRs were paying deep for test_*.py alone).
    """
    path = norm(path)
    if path.startswith("hooks/"):
        return True
    if path.startswith("skills/"):
        return True
    if path.startswith("scripts/"):
        return True
    return False


def is_product_path(path):
    path = norm(path)
    if path.startswith("app/") or path.startswith("src/"):
        return True
    # Monorepo-style packages/foo/src/...
    if "/src/" in ("/" + path):
        return True
    return False


def is_deep_path(path, copy_dests):
    path = norm(path)
    # Tooling first: hooks/skills/scripts stay standard even when named test_*.py.
    if is_tooling_path(path):
        return False
    if is_product_path(path):
        return True
    lower = path.lower()
    # Product test trees (not under hooks/skills/scripts — already excluded).
    if path.startswith("tests/") or path.startswith("test/"):
        return True
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


# A test gate is a workflow that runs the suite or a typecheck on pull_request. It is
# read from `run:` scalars only, so a step *named* "tests", a comment, or the string
# `github.event.pull_request` in an expression never counts as one.
TEST_RUNNER_RES = [re.compile(p) for p in (
    r"\bvitest\b", r"\bjest\b", r"\bpytest\b", r"python3?\s+-m\s+unittest\b",
    r"\b(?:npm|pnpm|yarn)\s+(?:run\s+)?test\b", r"\bgo\s+test\b", r"\bcargo\s+test\b",
    r"\btsc\b", r"\bmake\s+test\b",
)]
PR_TRIGGER_RE = re.compile(
    r"^\s*pull_request(?:_target)?\s*:|^\s*on\s*:\s*\[[^\]]*\bpull_request\b|"
    r"^\s*on\s*:\s*pull_request\b", re.M)
RUN_KEY = re.compile(r"^(\s*)(?:-\s+)?run\s*:\s*(.*)$")


def strip_comments(text):
    return "\n".join(ln for ln in text.split("\n") if not ln.lstrip().startswith("#"))


def run_blocks(text):
    """The text of every `run:` scalar, inline or block, comments removed."""
    lines = strip_comments(text).split("\n")
    out, i = [], 0
    while i < len(lines):
        m = RUN_KEY.match(lines[i])
        if m is None:
            i += 1
            continue
        indent, value = len(m.group(1)), m.group(2).strip()
        i += 1
        if value and not value.startswith(("|", ">")):
            out.append(value)
            continue
        block = []
        while i < len(lines):
            ln = lines[i]
            if ln.strip() and (len(ln) - len(ln.lstrip())) <= indent:
                break
            block.append(ln.strip())
            i += 1
        out.append("\n".join(block))
    return out


def workflow_has_test_gate(text):
    """(True, 'runner') when the workflow runs on pull_request and a run: step invokes one."""
    if not PR_TRIGGER_RE.search(strip_comments(text)):
        return False, None
    for block in run_blocks(text):
        for rx in TEST_RUNNER_RES:
            m = rx.search(block)
            if m:
                return True, m.group(0)
    return False, None


def detect_test_gate(repo_root):
    """('present'|'absent', [evidence strings]) from .github/workflows/*.yml|*.yaml."""
    wf_dir = os.path.join(repo_root, ".github", "workflows")
    evidence = []
    if os.path.isdir(wf_dir):
        for name in sorted(os.listdir(wf_dir)):
            if not name.endswith((".yml", ".yaml")):
                continue
            with open(os.path.join(wf_dir, name), "r", encoding="utf-8", errors="replace") as fh:
                ok, runner = workflow_has_test_gate(fh.read())
            if ok:
                evidence.append("%s runs %s on pull_request" % (name, runner))
    return ("present" if evidence else "absent"), evidence


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
                   help="also print tier=/max_turns=/test_gate= lines for $GITHUB_OUTPUT")
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
    test_gate, evidence = detect_test_gate(repo)
    result = {
        "tier": tier,
        "max_turns": MAX_TURNS[tier],
        "reasons": reasons,
        "paths": paths,
        "test_gate": test_gate,
        "test_gate_evidence": evidence,
    }

    # Always emit JSON on stdout for agents/CI consumers.
    print(json.dumps(result, indent=2, sort_keys=True))

    if args.github_output:
        out_path = os.environ.get("GITHUB_OUTPUT")
        lines = "tier=%s\nmax_turns=%s\ntest_gate=%s\n" % (tier, MAX_TURNS[tier], test_gate)
        if out_path:
            with open(out_path, "a", encoding="utf-8") as fh:
                fh.write(lines)
        else:
            # Local dry-run: still show what would be written.
            sys.stderr.write(lines)

    return 0


if __name__ == "__main__":
    sys.exit(main())
