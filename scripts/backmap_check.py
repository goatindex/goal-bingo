# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/incose-requirements/scripts/backmap_check.py
# Commit: d66bfb0
# Copied: 2026-09-20
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prove the mining: every section of the source document produced requirements, or says
why it did not.

This is trace-chain link 2's obligation, settled as C2-1: the back-map runs **both
directions**. Every section maps to requirements or to an explicit reasoned "none", and
every requirement's cited source resolves. The second direction is `provenance_check.py`;
this is the first.

Without it a design document can grow a section that nobody ever mines, and nothing
notices - the requirement set stays green because it never knew the section existed. The
first measurement of `live-action-intel` found 9 of 23 sections producing no requirement
and saying nothing about why.

**Declaring "none" is the point, not a loophole.** A section that genuinely states no
obligation - a rationale, a decision log, a glossary - is normal. What is not normal is
being unable to tell that from a section nobody got to. The declaration goes in the
document, next to the section, so the reason is where the reader is:

    ### 5.4.2 Why in Discord rather than a web interface
    <!-- requirements: none - rationale for a decision recorded in 9.1, states no obligation -->

`--baseline` is a ratchet for a document adopting this check with sections already
unmined: those are reported and not failed, anything new fails, and the file only shrinks.

    python backmap_check.py --source design-description.md --requirements requirements
    python backmap_check.py ... --baseline requirements/UNMINED.txt

Exit 0 clean, 1 on any undeclared unmined section, 2 when the check cannot run. Fail
closed - a source with no sections, or a requirement set citing nothing, means the
arguments are wrong and no coverage has been proven.
"""
import argparse
import io
import os
import re
import sys

SECTION = re.compile(r"^#{2,6}\s+([0-9]+(?:\.[0-9]+)*)\s+(.*?)\s*$", re.M)
DECLARED = re.compile(r"<!--\s*requirements:\s*none\s*-\s*(.+?)\s*-->", re.I)


def read(path):
    return io.open(path, encoding="utf-8", errors="replace").read().replace("\r\n", "\n")


def sections(path):
    """[(number, title, declaration or None)] in document order."""
    text = read(path)
    found = []
    matches = list(SECTION.finditer(text))
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[m.end():end]
        d = DECLARED.search(body)
        found.append((m.group(1), m.group(2), d.group(1) if d else None))
    return found


def cited_sections(directory, source_name):
    """Section numbers any requirement cites in its provenance."""
    rx = re.compile(re.escape(source_name) + r"\s+([0-9]+(?:\.[0-9]+)*)")
    out = set()
    for name in sorted(os.listdir(directory)):
        if name.endswith(".md"):
            out.update(rx.findall(read(os.path.join(directory, name))))
    return out


def load_baseline(path):
    if not path or not os.path.isfile(path):
        return set()
    return {l.split("#")[0].strip() for l in read(path).split("\n") if l.split("#")[0].strip()}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--source", default="design-description.md")
    ap.add_argument("--requirements", default="requirements")
    ap.add_argument("--baseline")
    ap.add_argument("--write-baseline", metavar="PATH")
    args = ap.parse_args()

    if not os.path.isfile(args.source):
        print("ERROR: no such source document: %s" % args.source)
        sys.exit(2)
    if not os.path.isdir(args.requirements):
        print("ERROR: no such requirements directory: %s" % args.requirements)
        sys.exit(2)

    secs = sections(args.source)
    if not secs:
        print("ERROR: %s has no numbered sections - C2-2 requires stable section numbers, "
              "and without them nothing can be mapped. Refusing to pass." % args.source)
        sys.exit(2)

    cited = cited_sections(args.requirements, os.path.basename(args.source))
    if not cited:
        print("ERROR: no requirement cites %s at all - wrong directory, or the set uses "
              "another provenance form. Refusing to pass." % os.path.basename(args.source))
        sys.exit(2)

    unmined = [(n, t) for n, t, d in secs if n not in cited and d is None]
    declared = [(n, t, d) for n, t, d in secs if n not in cited and d is not None]
    pointless = [(n, t, d) for n, t, d in secs if n in cited and d is not None]

    if args.write_baseline:
        with io.open(args.write_baseline, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(u"# Sections of %s that produced no requirement when the back-map\n"
                     u"# check was adopted, and did not say why. A ratchet: this file only\n"
                     u"# shrinks. Declare a section in the document instead of listing it\n"
                     u"# here whenever the reason is actually known.\n"
                     u"# Written by backmap_check.py --write-baseline. Do not hand-edit.\n"
                     % os.path.basename(args.source))
            for n, _ in unmined:
                fh.write(n + u"\n")
        print("wrote %d unmined section(s) to %s" % (len(unmined), args.write_baseline))
        sys.exit(0)

    baseline = load_baseline(args.baseline)
    new = [(n, t) for n, t in unmined if n not in baseline]
    stale = sorted(baseline - {n for n, _ in unmined})

    mined = len(secs) - len(unmined) - len(declared)
    print("back-map: %d sections, %d mined, %d declared none, %d unmined"
          % (len(secs), mined, len(declared), len(unmined)))
    if baseline:
        print("  baselined unmined: %d (reported, not failed)" % len(baseline))
    for n, t in new:
        print("  UNMINED  %-7s %s" % (n, t[:60]))
    for n, t, d in pointless:
        print("  CONTRADICTORY %-7s declares none but requirements cite it: %s" % (n, d[:50]))
    for n in stale:
        print("  note     %-7s baselined but now mined or declared - tighten the ratchet" % n)

    failures = len(new) + len(pointless)
    if failures:
        print("\n%d section(s) produced no requirement and said nothing about why. C2-1: "
              "the back-map runs both directions." % failures)
        sys.exit(1)
    if unmined:
        print("  no NEW unmined section; %d still baselined" % len(unmined))
    else:
        print("  every section is mined or declares why not")
    sys.exit(0)


if __name__ == "__main__":
    main()
