# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/record-contract/scripts/standing_check.py
# Commit: 80cf437
# Copied: 2026-09-20
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""RECORD-CONTRACT.md section 6, checks 3, 4 and 6 - queries over the record index rather
than three more scanners over the same files.

  3  A stated standing is one of the four values.
     Absent is not an error: D-2026-09-07-2 defaults standing to `active`, and only a
     disposal value is ever written. Requiring it explicitly would fail against every
     record in the estate and be abandoned in a day.

  4  Axes match the type. Section 4 gives evidence to the requirement alone, because a
     work package's evidence is derived from the requirements it satisfies and two
     sources for one fact is drift waiting to happen. So a non-requirement carrying
     `verification-status` is a schema error, and a requirement lacking it is another.

  6  A superseded record cites a replacement, and the replacement resolves. A supersession
     with no forward pointer is a dead end; one pointing at nothing is worse, because it
     reads as a trace.

  +  Ids are unique within their set. `D-2026-09-07-1` settled that an id is only
     unique within the set that issues it, so two decision logs each holding
     `D-2026-07-27-1` is legitimate - they are different sets. What is not legitimate is a
     citation of that id from outside either one, because it resolves to both and the
     reader cannot tell which was meant. A duplicate inside one set fails; the same id in
     two sets is reported as an ambiguous citation target (F-41).

    python tools/standing_check.py

Exit 0 clean, 1 on any violation, 2 when the check cannot run. Fail closed.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import record_index  # noqa: E402

STANDINGS = ("active", "superseded", "withdrawn", "deleted")
EVIDENCE_FIELD = "verification-status"


def main():
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--root", default=here)
    ap.add_argument("--strict-ids", action="store_true",
                    help="also fail when one id names different records in two different "
                         "sets, rather than reporting it as an ambiguous citation target")
    args = ap.parse_args()

    if not os.path.isdir(args.root):
        print("ERROR: no such root: %s" % args.root)
        sys.exit(2)
    records = record_index.index(args.root)
    if not records:
        print("ERROR: no records found under %s - wrong root? Refusing to pass." % args.root)
        sys.exit(2)

    def set_of(r):
        """The set that issues an id. A decision log is its own set; a requirement set is
        its directory; the architecture tables are one set."""
        if r["type"] == "requirement":
            return os.path.dirname(r["file"]) or "."
        return r["file"]

    by_id, by_set_id = {}, {}
    for r in records:
        by_id.setdefault(r["id"], []).append(r)
        by_set_id.setdefault((set_of(r), r["id"]), []).append(r)

    problems, notes = [], []

    # --- check 3 ---
    for r in records:
        s = r.get("standing")
        if s is not None and s not in STANDINGS:
            problems.append((r["id"], "standing '%s' is not one of: %s"
                             % (s, ", ".join(STANDINGS))))

    # --- check 4 ---
    for r in records:
        has_evidence = EVIDENCE_FIELD in r.get("fields", {})
        if r["type"] == "requirement" and not has_evidence:
            problems.append((r["id"], "requirement carries no %s; evidence is the axis "
                                      "this type owes" % EVIDENCE_FIELD))
        if r["type"] != "requirement" and has_evidence:
            problems.append((r["id"], "%s carries %s; section 4 gives evidence to the "
                                      "requirement alone" % (r["type"], EVIDENCE_FIELD)))

    # --- check 6 ---
    for r in records:
        if r.get("standing") != "superseded":
            continue
        repl = r.get("replaced_by") or []
        repl = [x for x in repl if x != r["id"]]
        if not repl:
            problems.append((r["id"], "superseded and cites no replacement"))
            continue
        missing = [x for x in repl if x not in by_id]
        if missing:
            problems.append((r["id"], "superseded, replacement does not resolve: %s"
                             % ", ".join(missing)))

    # --- id uniqueness, within a set and across sets ---
    for (setname, rid), rs in sorted(by_set_id.items()):
        if len(rs) > 1:
            problems.append((rid, "defined %d times inside one set (%s): %s"
                             % (len(rs), setname,
                                ", ".join("line %d" % r["line"] for r in rs))))

    ambiguous = []
    for rid, rs in sorted(by_id.items()):
        sets = sorted({set_of(r) for r in rs})
        if len(sets) < 2:
            continue
        titles = {r.get("title", "")[:60] for r in rs}
        where = ", ".join("%s:%d" % (r["file"], r["line"]) for r in rs)
        if len(titles) > 1:
            ambiguous.append((rid, "names different records in %d sets, so a citation "
                                   "from outside resolves to both: %s" % (len(sets), where)))
        else:
            notes.append((rid, "same record in %d sets - master and copy: %s"
                          % (len(sets), where)))

    print("standing check: %d records, %d ids" % (len(records), len(by_id)))
    stood = [r for r in records if r.get("standing")]
    print("  explicit standing: %d (absent means active)" % len(stood))
    for rid, why in problems:
        print("  PROBLEM  %-18s %s" % (rid, why))
    for rid, why in ambiguous:
        print("  %s %-18s %s"
              % ("AMBIGUOUS" if args.strict_ids else "ambiguous", rid, why))
    for rid, why in notes:
        print("  note     %-18s %s" % (rid, why))

    failed = problems + (ambiguous if args.strict_ids else [])
    if failed:
        print("\n%d problem(s). RECORD-CONTRACT.md section 6, checks 3, 4 and 6."
              % len(failed))
        sys.exit(1)
    if ambiguous:
        print("\n%d id(s) name different records in different sets. Legitimate under "
              "D-2026-09-07-1 - an id is unique within its set - but a citation from "
              "outside either set is ambiguous. Reported, not failed." % len(ambiguous))
    print("  checks 3, 4 and 6 pass")
    sys.exit(0)


if __name__ == "__main__":
    main()
