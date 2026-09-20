# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/record-contract/scripts/record_index.py
# Commit: 80cf437
# Copied: 2026-09-20
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""RECORD-CONTRACT.md section 6, check 8: the set is enumerable by a command.

R-6 says a record set must be listable without reading every file, and it is the leg most
often missing - a set nothing can enumerate has no reader, and by CH-3 a convention with
no reader does not take hold. Only requirements had one (`lint_requirements.py
--export-records`). Decisions, findings, audit claims, to-be items and superseded rows had
none, so four of the seven record types in section 2 could not be listed at all.

This enumerates every record type in one pass and emits JSON, so the checks that follow -
3, 4 and 6 - are queries over an index rather than four more scanners over the same files.

    python tools/record_index.py                    # summary
    python tools/record_index.py --json index.json  # the whole index
    python tools/record_index.py --type decision    # one type

Standing is read where it is stated and left absent otherwise: D-2026-09-07-2 defaults it
to `active`, and only a disposal value is ever written.
"""
import argparse
import io
import json
import os
import re
import sys

# type, how it is defined, which files carry it
TYPES = [
    ("requirement", re.compile(r"^### ([A-Z]{2,6}-[A-Z]{3}-\d{3})\s*[-—]\s*(.*)$"),
     re.compile(r"(^|/)requirements/[^/]+\.md$")),
    ("decision", re.compile(r"^## (D-\d{4}-\d{2}-\d{2}-\d+)\s*[-—]\s*(.*)$"),
     re.compile(r"(^|/)DECISIONS\.md$")),
    ("to-be item", re.compile(r"^\| \*\*(TB-\d+[a-z]?)\*\* \|(.*)$"),
     re.compile(r"(^|/)ARCHITECTURE\.md$")),
    ("finding", re.compile(r"^\| \*\*(F-\d+)\*\* \|(.*)$"),
     re.compile(r"(^|/)ARCHITECTURE\.md$")),
    ("audit claim", re.compile(r"^\| \*\*(AS-\d+)\*\* \|(.*)$"),
     re.compile(r"(^|/)ARCHITECTURE\.md$")),
]

STANDINGS = ("active", "superseded", "withdrawn", "deleted")
STANDING_CELL = re.compile(r"\|\s*`(%s)`\s*\|" % "|".join(STANDINGS))
STANDING_FIELD = re.compile(r"^\s*[-*]?\s*\*\*Status:\*\*\s*\*{0,2}([A-Za-z-]+)", re.M)
ID_IN = re.compile(r"\b(D-\d{4}-\d{2}-\d{2}-\d+|F-\d+|AS-\d+|TB-\d+[a-z]?"
                   r"|[A-Z]{2,6}-[A-Z]{3}-\d{3})\b")
FIELD = re.compile(r"^([a-z][a-z-]+):\s*(.*)$")


def read(path):
    return io.open(path, encoding="utf-8", errors="replace").read().replace("\r\n", "\n")


def index(root):
    records = []
    for base, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "__pycache__")]
        for fname in sorted(files):
            if not fname.endswith(".md"):
                continue
            path = os.path.join(base, fname)
            rel = os.path.relpath(path, root).replace("\\", "/")
            kinds = [(t, rx) for t, rx, where in TYPES if where.search(rel)]
            if not kinds:
                continue
            lines = read(path).split("\n")
            section = ""
            for n, line in enumerate(lines, 1):
                if line.startswith("## "):
                    section = line[3:].strip()
                for kind, rx in kinds:
                    m = rx.match(line)
                    if not m:
                        continue
                    rid, rest = m.group(1), (m.group(2) or "")
                    rec = {"id": rid, "type": kind, "file": rel, "line": n,
                           "section": section, "fields": {}}

                    if kind in ("requirement", "decision"):
                        body = []
                        for follow in lines[n:]:
                            if follow.startswith(("### ", "## ")):
                                break
                            body.append(follow)
                        blob = "\n".join(body)
                        if kind == "requirement":
                            key = None
                            for b in body:
                                fm = FIELD.match(b)
                                if fm:
                                    key = fm.group(1)
                                    rec["fields"][key] = fm.group(2).strip()
                                elif key and b[:1] in (" ", "\t") and b.strip():
                                    # the record format wraps a field by indenting the
                                    # continuation; reading only the first line turns a
                                    # long statement into its opening clause
                                    rec["fields"][key] += " " + b.strip()
                                elif not b.strip():
                                    key = None
                        else:
                            sm = STANDING_FIELD.search(blob)
                            if sm:
                                rec["fields"]["status"] = sm.group(1).lower()
                        rec["title"] = rest.strip()
                    else:
                        rec["title"] = re.sub(r"\*\*|`", "", rest.split("|")[0]).strip()[:120]
                        sm = STANDING_CELL.search(line)
                        if sm:
                            rec["standing"] = sm.group(1)
                            cells = [c.strip() for c in line.split("|")]
                            rec["replaced_by"] = sorted(set(ID_IN.findall(cells[-2]))) \
                                if len(cells) >= 2 else []
                    records.append(rec)
                    break
    return records


def main():
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--root", default=here)
    ap.add_argument("--json", help="write the full index here")
    ap.add_argument("--type", help="only this record type")
    ap.add_argument("--allow-empty", action="store_true",
                    help="zero records is a result, not a failure. For a caller that "
                         "must tell 'the index could not run' from 'the index ran and "
                         "found nothing' - the default conflates them, because for a "
                         "check they are both refusals")
    args = ap.parse_args()

    if not os.path.isdir(args.root):
        print("ERROR: no such root: %s" % args.root)
        sys.exit(2)

    records = index(args.root)
    if args.type:
        records = [r for r in records if r["type"] == args.type]
    if not records and not args.allow_empty:
        print("ERROR: no records found under %s%s - wrong root? Refusing to pass."
              % (args.root, " for type %s" % args.type if args.type else ""))
        sys.exit(2)

    counts = {}
    for r in records:
        counts[r["type"]] = counts.get(r["type"], 0) + 1
    print("record index: %d records under %s" % (len(records), os.path.basename(args.root)))
    for t in sorted(counts):
        print("  %-14s %d" % (t, counts[t]))
    stood = [r for r in records if r.get("standing")]
    if stood:
        print("  with an explicit standing: %s"
              % ", ".join("%s %s" % (r["id"], r["standing"]) for r in stood))

    if args.json:
        io.open(args.json, "w", encoding="utf-8").write(
            json.dumps({"root": os.path.abspath(args.root), "count": len(records),
                        "records": records}, indent=1))
        print("  written: %s" % args.json)
    sys.exit(0)


if __name__ == "__main__":
    main()
