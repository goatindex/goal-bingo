#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prove the link-4 cut: every live requirement is in exactly one work package.

Reads requirements/ for live IDs (skips status: deleted) and work-packages/cut.md
for package membership. Exit 0 clean, 1 on partition failure, 2 on usage errors.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REQ_HEAD = re.compile(r"^### (GB-[A-Z]+-\d+[a-z]?)\b", re.M)
PKG_HEAD = re.compile(r"^### (WP-\d+)\b", re.M)
REQ_TOKEN = re.compile(r"\bGB-[A-Z]+-\d+[a-z]?\b")


def live_requirement_ids(requirements_dir: Path) -> set[str]:
    live: set[str] = set()
    for path in sorted(requirements_dir.glob("*.md")):
        if path.name.startswith("_") or path.name in {"README.md", "glossary.md"}:
            continue
        text = path.read_text(encoding="utf-8")
        matches = list(REQ_HEAD.finditer(text))
        for i, m in enumerate(matches):
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            block = text[m.start() : end]
            if re.search(r"^status:\s*deleted\b", block, re.M):
                continue
            live.add(m.group(1))
    return live


def package_membership(cut_path: Path) -> dict[str, set[str]]:
    text = cut_path.read_text(encoding="utf-8")
    # Only the ## Packages section
    pkg_section = text.split("## Packages", 1)
    if len(pkg_section) < 2:
        raise SystemExit("cut.md missing ## Packages section")
    body = pkg_section[1].split("## Excluded", 1)[0]
    packages: dict[str, set[str]] = {}
    matches = list(PKG_HEAD.finditer(body))
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        block = body[m.end() : end]
        packages[m.group(1)] = set(REQ_TOKEN.findall(block))
    return packages


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--requirements", default="requirements")
    ap.add_argument("--cut", default="work-packages/cut.md")
    args = ap.parse_args()

    req_dir = Path(args.requirements)
    cut_path = Path(args.cut)
    if not req_dir.is_dir():
        print(f"ERROR: no requirements dir: {req_dir}")
        sys.exit(2)
    if not cut_path.is_file():
        print(f"ERROR: no cut file: {cut_path}")
        sys.exit(2)

    live = live_requirement_ids(req_dir)
    packages = package_membership(cut_path)
    assigned: dict[str, list[str]] = {}
    for pkg, ids in packages.items():
        for rid in ids:
            assigned.setdefault(rid, []).append(pkg)

    missing = sorted(live - set(assigned))
    ghosts = sorted(set(assigned) - live)
    dupes = sorted(rid for rid, pkgs in assigned.items() if len(pkgs) > 1)

    print(
        f"partition: {len(live)} live requirements, {len(packages)} packages, "
        f"{sum(len(v) for v in packages.values())} assignments"
    )
    for rid in missing:
        print(f"  MISSING  {rid}")
    for rid in ghosts:
        print(f"  GHOST    {rid} (in cut, not a live requirement)")
    for rid in dupes:
        print(f"  DUPLICATE {rid} in {', '.join(assigned[rid])}")

    if missing or ghosts or dupes:
        print(
            f"\n{len(missing) + len(ghosts) + len(dupes)} partition failure(s). "
            "Every live requirement must appear in exactly one package."
        )
        sys.exit(1)

    print("  every live requirement is in exactly one package")
    sys.exit(0)


if __name__ == "__main__":
    main()
