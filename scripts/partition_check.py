# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/incose-requirements/scripts/partition_check.py
# Commit: 9d60817
# Copied: 2026-09-22
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prove the cut: every live requirement sits in exactly one work package.

This is trace-chain link 4's obligation. Link 4 says "cut requirements into work packages,
AND PROVE THE CUT", and until 2026-09-08 nothing proved anything - the first measurement
of `live-action-intel` found 114 of its 156 requirements in no package at all. The cut was
clean where it existed (nothing double-covered, nothing dangling) and covered 27% of the
set. Decomposition without a partition gate is a plan for the part someone remembered.

Four failures it reports:

  uncovered    a requirement in no package - work nobody has been given
  double       a requirement in two packages - two owners, so neither is the owner
  dangling     a package citing an id that is not a live requirement - a pointer to nothing
  tbd          a claimed requirement still carrying a TBD - a package cut around a hole

The TBD gate exists because of `goal-bingo`, 2026-09-19 to -21: eight of ten work
packages opened with a pull request titled "Resolve WP-0X's N blocking TBDs". The TBDs
were baselined at link 3, cut into packages at link 4, and discovered one package at a
time at link 5 - each its own PR, review and batch of decision records. A package may be
cut only around requirements that are decided. The marker it looks for is the house
shape `... is TBD (owner: k, blocks: Q7)`, not the bare word, so prose *about* a resolved
TBD does not trip it.

Two package layouts are read:

  --packages DIR   one file per package (default `PKG-*.md`), claims under `## Requirements`
  --cut FILE       one file, packages as `### WP-NN` headings under `## Packages`, with an
                   optional `## Excluded` section naming deleted ids

A requirement with `status: deleted` is not live and is not counted.

**The baseline is a ratchet, not an amnesty.** A set adopting this check will already
have uncovered requirements, and a check that is red from the first run is one nobody
reads (F-40). `--baseline` names a file listing the ids uncovered when the check was
adopted: those are reported and not failed, anything NEW is failed, and the file only ever
shrinks. Write it with --write-baseline, and never by hand. The baseline covers
*uncovered* only; a TBD in a claimed requirement is never baselined.

    python partition_check.py --requirements requirements --packages packages
    python partition_check.py --requirements requirements --cut work-packages/cut.md
    python partition_check.py ... --baseline packages/UNPACKAGED.txt
    python partition_check.py ... --write-baseline packages/UNPACKAGED.txt

Exit 0 clean, 1 on any unbaselined failure, 2 when the check cannot run. Fail closed.
"""
import argparse
import io
import os
import re
import sys

REQ_ID = r"[A-Z]{2,6}-[A-Z]{3}-\d{3}[a-z]?"
REQ_DEF = re.compile(r"^### (%s)\b" % REQ_ID, re.M)
REQ_REF = re.compile(r"\b(%s)\b" % REQ_ID)
FIELD = re.compile(r"^([a-z][a-z0-9-]*):\s*(.*)$")
DELETED = re.compile(r"^deleted\b")
TBD_MARKER_DEFAULT = r"\bis TBD\b|\bTBD\s*\(owner:"


def read(path):
    return io.open(path, encoding="utf-8", errors="replace").read().replace("\r\n", "\n")


def parse_records(directory):
    """{id: (filename, {field: value})} for every `### <id>` block in the directory.

    A record runs from its heading to the next heading of any level. Fields are
    `key: value` lines; a line indented by two or more spaces continues the previous
    field. Self-contained on purpose: this script is copied into repositories that
    do not carry lint_requirements.py beside it.
    """
    records = {}
    for name in sorted(os.listdir(directory)):
        if not name.endswith(".md"):
            continue
        lines = read(os.path.join(directory, name)).split("\n")
        i = 0
        while i < len(lines):
            m = REQ_DEF.match(lines[i])
            if m is None:
                i += 1
                continue
            rid = m.group(1)
            fields, last = {}, None
            i += 1
            while i < len(lines) and not lines[i].startswith("#"):
                line = lines[i]
                fm = FIELD.match(line)
                if fm:
                    last = fm.group(1)
                    fields[last] = fm.group(2).strip()
                elif last and line.startswith("  ") and line.strip():
                    fields[last] = (fields[last] + " " + line.strip()).strip()
                i += 1
            records.setdefault(rid, (name, fields))
    return records


def live_ids(records):
    """{id: filename} for records not marked `status: deleted`."""
    return dict((rid, name) for rid, (name, fields) in records.items()
                if not DELETED.match(fields.get("status", "")))


CLAIM_SECTION = re.compile(r"^##+\s+Requirements\s*$(.*?)(?=^##+\s|\Z)", re.M | re.S)


def package_coverage(directory, pattern, section=True):
    """{package: {requirement ids it claims}}

    A package claims a requirement in its `## Requirements` section and nowhere else.
    Reading the whole file makes a package that explains why it does *not* own something
    into a package that claims it - the same definition-versus-mention distinction the
    disposal check makes.
    """
    out, no_section = {}, []
    rx = re.compile(pattern)
    for name in sorted(os.listdir(directory)):
        if not name.endswith(".md") or not rx.match(name):
            continue
        text = read(os.path.join(directory, name))
        if section:
            m = CLAIM_SECTION.search(text)
            if m is None:
                no_section.append(name)
                out[name] = set()
                continue
            text = m.group(1)
        out[name] = set(REQ_REF.findall(text))
    return out, no_section


PACKAGES_SECTION = re.compile(r"^## Packages[^\n]*\n(.*?)(?=^## |\Z)", re.M | re.S)
EXCLUDED_SECTION = re.compile(r"^## Excluded[^\n]*\n(.*?)(?=^## |\Z)", re.M | re.S)
PKG_HEAD = re.compile(r"^### (\S+)", re.M)


def cut_coverage(path):
    """({package: {ids}}, {excluded ids}) from a single cut file, or (None, None).

    Packages are the `### <id>` headings under `## Packages`; a package claims every
    requirement id written anywhere in its block. `## Excluded` names ids the cut
    deliberately leaves out, which must all be deleted requirements.
    """
    text = read(path)
    m = PACKAGES_SECTION.search(text)
    if m is None:
        return None, None
    body = m.group(1)
    out = {}
    heads = list(PKG_HEAD.finditer(body))
    for i, h in enumerate(heads):
        end = heads[i + 1].start() if i + 1 < len(heads) else len(body)
        out[h.group(1)] = set(REQ_REF.findall(body[h.end():end]))
    ex = EXCLUDED_SECTION.search(text)
    excluded = set(REQ_REF.findall(ex.group(1))) if ex else set()
    return out, excluded


def load_baseline(path):
    if not path or not os.path.isfile(path):
        return set(), False
    ids = set()
    for line in read(path).split("\n"):
        line = line.split("#")[0].strip()
        if line:
            ids.add(line)
    return ids, True


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--requirements", default="requirements")
    layout = ap.add_mutually_exclusive_group()
    layout.add_argument("--packages", default=None,
                        help="directory of one-file-per-package (default: packages)")
    layout.add_argument("--cut", metavar="FILE",
                        help="single cut file with `### WP-NN` headings under `## Packages`")
    ap.add_argument("--package-pattern", default=r"^PKG-",
                    help="which files in the packages directory are packages")
    ap.add_argument("--baseline", help="ids already uncovered when this check was adopted")
    ap.add_argument("--write-baseline", metavar="PATH",
                    help="write the current uncovered set and exit; the ratchet's starting notch")
    ap.add_argument("--tbd-marker", default=TBD_MARKER_DEFAULT,
                    help="regex naming an unresolved TBD in a requirement field")
    ap.add_argument("--no-tbd-gate", action="store_true",
                    help="report TBDs in claimed requirements without failing on them")
    args = ap.parse_args(argv)

    try:
        marker = re.compile(args.tbd_marker)
    except re.error as e:
        print("ERROR: --tbd-marker is not a regex: %s" % e)
        return 2
    if not os.path.isdir(args.requirements):
        print("ERROR: no such directory: %s" % args.requirements)
        return 2
    if args.cut:
        if not os.path.isfile(args.cut):
            print("ERROR: no such file: %s" % args.cut)
            return 2
    else:
        packages_dir = args.packages or "packages"
        if not os.path.isdir(packages_dir):
            print("ERROR: no such directory: %s" % packages_dir)
            return 2

    records = parse_records(args.requirements)
    reqs = live_ids(records)
    if not reqs:
        print("ERROR: no live requirements found in %s - wrong directory? Refusing to pass."
              % args.requirements)
        return 2

    excluded = set()
    if args.cut:
        packages, excluded = cut_coverage(args.cut)
        no_section = []
        if packages is None:
            print("ERROR: %s has no '## Packages' section. Refusing to pass." % args.cut)
            return 2
        if not packages:
            print("ERROR: no '### <package>' headings under '## Packages' in %s. "
                  "Refusing to pass." % args.cut)
            return 2
    else:
        packages, no_section = package_coverage(packages_dir, args.package_pattern)
        if not packages:
            print("ERROR: no package files matching %s in %s - wrong directory or pattern? "
                  "Refusing to pass." % (args.package_pattern, packages_dir))
            return 2

    for name in no_section:
        print("  NO CLAIM SECTION %s - a package declares what it owns under "
              "'## Requirements'" % name)

    owners = {}
    for pkg, ids in packages.items():
        for rid in sorted(ids):
            owners.setdefault(rid, []).append(pkg)

    uncovered = sorted(r for r in reqs if r not in owners)
    double = sorted((r, owners[r]) for r in owners if r in reqs and len(owners[r]) > 1)
    dangling = sorted((r, owners[r]) for r in owners if r not in reqs)
    excluded_live = sorted(r for r in excluded if r in reqs)

    tbd = []
    for rid in sorted(owners):
        if rid not in reqs:
            continue
        for field, value in sorted(records[rid][1].items()):
            if marker.search(value):
                tbd.append((rid, field, owners[rid]))

    if args.write_baseline:
        with io.open(args.write_baseline, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(u"# Requirements in no work package when the partition check was\n"
                     u"# adopted. A ratchet, not an amnesty: this file only ever shrinks,\n"
                     u"# and anything new that lands uncovered fails the check.\n"
                     u"# Written by partition_check.py --write-baseline. Do not hand-edit.\n")
            for r in uncovered:
                fh.write(r + u"\n")
        print("wrote %d uncovered id(s) to %s" % (len(uncovered), args.write_baseline))
        return 0

    baseline, had_baseline = load_baseline(args.baseline)
    new_uncovered = [r for r in uncovered if r not in baseline]
    stale_baseline = sorted(baseline - set(uncovered))

    pct = 100.0 * (len(reqs) - len(uncovered)) / len(reqs)
    print("partition check: %d live requirements, %d packages, %.0f%% covered"
          % (len(reqs), len(packages), pct))
    if baseline:
        print("  baselined uncovered: %d (reported, not failed)" % len(baseline))
    for r in new_uncovered:
        print("  UNCOVERED %-16s in no package (%s)" % (r, reqs[r]))
    for r, pkgs in double:
        print("  DOUBLE    %-16s claimed by %s" % (r, ", ".join(pkgs)))
    for r, pkgs in dangling:
        print("  DANGLING  %-16s cited by %s but is not a live requirement"
              % (r, ", ".join(pkgs)))
    for r in excluded_live:
        print("  EXCLUDED  %-16s listed under '## Excluded' but is a live requirement" % r)
    for r, field, pkgs in tbd:
        print("  TBD IN PACKAGE %s: %s (%s)" % (", ".join(pkgs), r, field))
    for r in stale_baseline:
        print("  note      %-16s is baselined but no longer uncovered (covered or deleted) "
              "- tighten the ratchet with --write-baseline" % r)

    failures = (len(new_uncovered) + len(double) + len(dangling) + len(no_section)
                + len(excluded_live))
    if tbd:
        if args.no_tbd_gate:
            print("  %d TBD(s) in claimed requirements reported, not failed (--no-tbd-gate)"
                  % len(tbd))
        else:
            failures += len(tbd)
            print("\n%d claimed requirement(s) still carry a TBD. A package is cut around "
                  "decided requirements; resolve the TBD at link 3 before cutting."
                  % len(tbd))
    if failures:
        print("\n%d requirement(s) are not cut into exactly one decided package. Trace-chain "
              "link 4 requires the cut to be proven, not asserted." % failures)
        return 1
    if uncovered:
        print("  no NEW uncovered requirement; %d still baselined" % len(uncovered))
    else:
        print("  every live requirement sits in exactly one package")
    return 0


if __name__ == "__main__":
    sys.exit(main())
