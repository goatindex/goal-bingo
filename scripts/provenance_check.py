# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/record-contract/scripts/provenance_check.py
# Commit: 80cf437
# Copied: 2026-09-20
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""RECORD-CONTRACT.md section 6, check 5: every provenance pointer that claims to resolve
must resolve. The requirement linter checks that `trace-to-source` is *present*; nothing
has ever checked that it points at anything.

An unresolvable pointer is worse than no pointer. It asserts a trace that cannot be
followed and it passes a human skim, which is how `kallax-apothecary/NEXT.md` came to cite
"the open decisions in section 10" of a document whose section 10 is about dados.

Three kinds of provenance, and only two of them can be resolved:

  ID       D-2026-09-06-5, F-36, TB-11, WOW-FUN-001    must be defined somewhere
  FILE     ONTOLOGY.md, term "copy"                    the file must exist
           design-description.md 6                     (a section suffix is not resolved -
                                                        see the note on anchors below)
  EVENT    review 2026-08-24, soak test 2026-08-24,    cannot be resolved and is not a
           operator request 2026-08-25, PR 2            defect - counted, never failed

The third kind is why this check is written rather than assumed: `live-action-intel` has
40-odd event provenances, and a checker that failed them would be switched off in a day.

Section anchors are reported, not enforced. `design-description.md 6` names a section
number, and section numbers move - that is the very failure this check exists for - but
resolving them needs a heading parser per document convention. Recorded as a gap rather
than half-done.

    python tools/provenance_check.py                          # this repo's set
    python tools/provenance_check.py --set ../larp-intel/requirements \\
        --resolve-root ../larp-intel

Exit 0 when every resolvable pointer resolves, 1 when any does not, 2 when the check
cannot run. Fail closed.
"""
import argparse
import io
import os
import re
import sys

# how each id kind is defined, so "defined somewhere" is checked rather than assumed
DEFINITION_PATTERNS = [
    re.compile(r"^## (D-\d{4}-\d{2}-\d{2}-\d+)\b", re.M),
    re.compile(r"^\| \*\*(F-\d+|AS-\d+|TB-\d+[a-z]?)\*\* \|", re.M),
    re.compile(r"^### ([A-Z]{2,6}-[A-Z]{3}-\d{3})\b", re.M),
]

FILE_RE = re.compile(r"([A-Za-z0-9_./-]+\.(?:md|py|js|yml|yaml|json|txt|docx))")

# a pointer with none of the above, and one of these shapes, is an event
EVENT_HINTS = re.compile(
    r"^(review|soak test|operator\s+\w+|playtest|session|interview|meeting|"
    r"observation|incident|workshop|call|email|spike)\b|\bPR \d+", re.I)


def read(path):
    return io.open(path, encoding="utf-8", errors="replace").read()


def index_definitions(root):
    """Every record id defined anywhere under root."""
    defined = set()
    for base, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "__pycache__")]
        for f in files:
            if not f.endswith(".md"):
                continue
            text = read(os.path.join(base, f)).replace("\r\n", "\n")
            for rx in DEFINITION_PATTERNS:
                defined.update(rx.findall(text))
    return defined


ANY_ID = re.compile(r"\b(D-\d{4}-\d{2}-\d{2}-\d+|F-\d+|AS-\d+|TB-\d+[a-z]?"
                    r"|[A-Z]{2,6}-[A-Z]{3}-\d{3})\b")


_file_index = {}


def find_file(root, target):
    """Is a file with this basename anywhere under root? Indexed once."""
    if root not in _file_index:
        names = set()
        for base, dirs, files in os.walk(root):
            dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "__pycache__")]
            names.update(files)
        _file_index[root] = names
    return os.path.basename(target) in _file_index[root]


def classify(value):
    """Every citation in one trace-to-source value, as [(kind, target)].

    A value may cite several things at once - "operator report 2026-08-25, REQ-FUN-025"
    is an event and a requirement id, and the id half must still resolve. Checking only
    the leading token would let the rest through unread.
    """
    v = value.strip().rstrip(".")
    found = [("id", m) for m in dict.fromkeys(ANY_ID.findall(v))]
    found += [("file", m) for m in dict.fromkeys(FILE_RE.findall(v))]
    if found:
        return found
    if EVENT_HINTS.search(v):
        return [("event", v)]
    return [("unclassified", v)]


def collect(set_dir):
    """[(record_id, file, value)] for every trace-to-source in the set."""
    out = []
    for name in sorted(os.listdir(set_dir)):
        if not name.endswith(".md"):
            continue
        path = os.path.join(set_dir, name)
        rec = None
        lines = read(path).replace("\r\n", "\n").split("\n")
        for i, line in enumerate(lines):
            m = re.match(r"^### ([A-Z]{2,6}-[A-Z]{3}-\d{3})\b", line)
            if m:
                rec = m.group(1)
            m = re.match(r"^trace-to-source:\s*(.+)$", line)
            if m and rec:
                value = m.group(1).strip()
                j = i + 1
                while j < len(lines) and lines[j].startswith("  "):
                    value += " " + lines[j].strip()
                    j += 1
                out.append((rec, name, value))
    return out


def main():
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--set", default=os.path.join(here, "requirements"),
                    help="directory holding the requirement set")
    ap.add_argument("--resolve-root", default=here,
                    help="root that file paths and record ids resolve against")
    ap.add_argument("--strict-events", action="store_true",
                    help="also fail on provenance that names an event rather than a document")
    args = ap.parse_args()

    if not os.path.isdir(args.set):
        print("ERROR: no such set directory: %s" % args.set)
        sys.exit(2)
    if not os.path.isdir(args.resolve_root):
        print("ERROR: no such resolve root: %s" % args.resolve_root)
        sys.exit(2)

    records = collect(args.set)
    if not records:
        print("ERROR: no trace-to-source lines found in %s - wrong directory? "
              "Refusing to pass." % args.set)
        sys.exit(2)

    defined = index_definitions(args.resolve_root)
    counts = {"id": 0, "file": 0, "event": 0, "unclassified": 0}
    broken = []

    for rec, fname, value in records:
        for kind, target in classify(value):
            counts[kind] += 1
            if kind == "id" and target not in defined:
                broken.append((rec, value, "id %s is defined nowhere under %s"
                               % (target, os.path.basename(args.resolve_root))))
            elif kind == "file" and not find_file(args.resolve_root, target):
                broken.append((rec, value, "file %s does not exist" % target))
            elif kind in ("event", "unclassified") and args.strict_events:
                broken.append((rec, value, "names %s, not a resolvable document" % kind))

    print("provenance check: %d records in %s" % (len(records), args.set))
    print("  resolvable: %d id, %d file    not resolvable by kind: %d event, %d unclassified"
          % (counts["id"], counts["file"], counts["event"], counts["unclassified"]))
    for rec, value, why in broken:
        print("  BROKEN %-14s %s" % (rec, why))
        print("         trace-to-source: %s" % value[:100])

    if counts["unclassified"] and not args.strict_events:
        print("  note: %d value(s) matched no known shape; run --strict-events to fail on them"
              % counts["unclassified"])
    print("  note: section suffixes are not resolved (a heading parser per document "
          "convention); a moved section still passes")

    if broken:
        print("\n%d provenance pointer(s) claim to resolve and do not. RECORD-CONTRACT.md "
              "section 5." % len(broken))
        sys.exit(1)
    print("  every resolvable pointer resolves")
    sys.exit(0)


if __name__ == "__main__":
    main()
