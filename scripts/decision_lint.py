# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/decision-log/scripts/decision_lint.py
# Commit: 80cf437
# Copied: 2026-09-20
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""TB-38: check a DECISIONS.md against the format the `decision-log` skill specifies.

The skill states six fields and a four-word status vocabulary, and nothing has ever
checked either. On 2026-09-07 four of the five entries written that day - including the
two the record contract is built on - omitted Status, Expected outcome and Revisit, and a
fifth used `done`, which is not in the vocabulary (F-38). The skill said so all along;
nothing read it.

This is the reader leg `DECISIONS.md` has never had. Under CH-3 it reached 2 of 9 projects
with a writer only.

Two variants are accepted deliberately, because both appear in real entries and neither is
a defect:
  - `**Options considered.**` written as prose with a full stop rather than a colon;
  - `**Options considered (build):**` scoped per topic, where one decision settles
    several linked questions - D-2026-09-06-5 has three such blocks.

    python tools/decision_lint.py                     # this repo's log
    python tools/decision_lint.py --file ../WeeWoo/DECISIONS.md

Exit 0 clean, 1 on any error, 2 when the check cannot run. Fail closed.
"""
import argparse
import io
import os
import re
import sys

REQUIRED = ["Status", "Context", "Options considered", "Why", "Expected outcome", "Revisit"]
STATUSES = ("open", "confirmed", "reversed", "superseded")
ID_RE = re.compile(r"^(D-\d{4}-\d{2}-\d{2}-\d+)\s+[-—]\s+(.+)$")


def field_present(body, name):
    """`**Name:**`, `**Name.**`, or `**Name (scope):**` - all three occur in real logs."""
    pattern = r"\*\*%s(?:\s*\([^)]*\))?\s*[:.]\*\*" % re.escape(name)
    return re.search(pattern, body) is not None


def status_of(body):
    m = re.search(r"\*\*Status:\*\*\s*\*{0,2}([A-Za-z-]+)", body)
    return m.group(1).lower() if m else None


def main():
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--file", default=os.path.join(here, "DECISIONS.md"))
    ap.add_argument("--warn-only", action="store_true",
                    help="report but exit 0; for adopting the check on an existing log")
    args = ap.parse_args()

    if not os.path.isfile(args.file):
        print("ERROR: no such file: %s" % args.file)
        sys.exit(2)

    text = io.open(args.file, encoding="utf-8", errors="replace").read().replace("\r\n", "\n")
    parts = re.split(r"^## (?=D-)", text, flags=re.M)[1:]
    if not parts:
        print("ERROR: no decision entries found in %s - wrong file? Refusing to pass."
              % args.file)
        sys.exit(2)

    problems = []
    seen = {}
    for body in parts:
        head = body.split("\n", 1)[0]
        m = ID_RE.match(head)
        if not m:
            problems.append(("?", "heading is not `## D-YYYY-MM-DD-n - title`: %s" % head[:60]))
            continue
        did, title = m.group(1), m.group(2)
        if did in seen:
            problems.append((did, "duplicate id"))
        seen[did] = title

        for f in REQUIRED:
            if not field_present(body, f):
                problems.append((did, "missing field: %s" % f))

        st = status_of(body)
        if st is None:
            pass  # already reported as a missing field
        elif st not in STATUSES:
            problems.append((did, "status '%s' is not one of: %s" % (st, ", ".join(STATUSES))))
        elif st == "superseded" and not re.search(r"D-\d{4}-\d{2}-\d{2}-\d+", body[body.find("Status"):body.find("Status") + 300]):
            problems.append((did, "superseded without citing the replacement id"))

    print("decision lint: %d entries in %s" % (len(seen), os.path.basename(args.file)))
    by_status = {}
    for body in parts:
        s = status_of(body) or "(none)"
        by_status[s] = by_status.get(s, 0) + 1
    print("  status: " + ", ".join("%s %d" % kv for kv in sorted(by_status.items())))
    for did, why in problems:
        print("  %-18s %s" % (did, why))

    if problems and not args.warn_only:
        print("\n%d problem(s). The format is specified in the `decision-log` skill's "
              "Entry template." % len(problems))
        sys.exit(1)
    if problems:
        print("\n%d problem(s), not failed (--warn-only)." % len(problems))
        sys.exit(0)
    print("  every entry conforms")
    sys.exit(0)


if __name__ == "__main__":
    main()
