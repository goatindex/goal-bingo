#!/usr/bin/env python3
"""Inspection gate for WP-01 scope exclusions (GB-CON-009..011, related)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "app" / "src"
FORBIDDEN = [
    (r"healthkit|google fit|fitbit|strava", "GB-CON-010 goal-verification integration"),
    (r"in-app purchase|iap\.|storekit|playbilling|stripe\.checkout", "GB-CON-011 real-money purchase"),
    (r"leaderboard|multiplayer|social feed|other player", "GB-CON-009 inter-player sharing"),
    (r"Notification\.requestPermission", "GB-CON-003 must not request notifications"),
]


def main() -> None:
    if not ROOT.is_dir():
        print(f"ERROR: missing {ROOT}")
        sys.exit(2)
    text = "\n".join(p.read_text(encoding="utf-8") for p in ROOT.rglob("*.ts"))
    failures = []
    for pattern, label in FORBIDDEN:
        if re.search(pattern, text, re.I):
            failures.append(label)
    if failures:
        print("scope exclusion failures:")
        for f in failures:
            print(f"  FAIL  {f}")
        sys.exit(1)
    print("scope exclusions: clean")
    sys.exit(0)


if __name__ == "__main__":
    main()
