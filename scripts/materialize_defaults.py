#!/usr/bin/env python3
"""Write explicit per-record field values that a now-deprecated `_meta.md` default
used to supply implicitly (D-2026-09-20-1, project-tracking/DECISIONS.md).

Every record missing the given field gets it inserted immediately before its
`priority:` line (record-format.md's documented field order places verification-status
and owner there), with the exact value the deprecated default declared. A record that
already carries the field explicitly is left untouched - this is additive only, never a
rewrite of an existing value.

    python materialize_defaults.py <paths...> --set owner=k --set verification-status=not-verified
    python materialize_defaults.py <paths...> --set owner=k --apply

Exit codes: 0 nothing to add (or applied cleanly), 1 records need the field(s) (check
mode), 2 the tool could not run - a record with no `priority:` line to anchor on, since
guessing where to insert would not be additive-only any more.
"""
import argparse
import io
import re
import sys

RECORD_RE = re.compile(r"^### .+$", re.M)
FIELD_RE = re.compile(r"^([a-z][a-z-]*):", re.M)
PRIORITY_RE = re.compile(r"^priority:.*$", re.M)


def split_records(text):
    """[(start, end, block_text)] for every '### ...' record in the file."""
    starts = [m.start() for m in RECORD_RE.finditer(text)]
    out = []
    for i, start in enumerate(starts):
        end = starts[i + 1] if i + 1 < len(starts) else len(text)
        out.append((start, end, text[start:end]))
    return out


def record_id(block):
    return block.splitlines()[0][4:].split(" ", 1)[0].strip()


def fields_present(block):
    return set(FIELD_RE.findall(block))


def apply_to_text(text, field, value, report, path):
    out = []
    pos = 0
    for start, end, block in split_records(text):
        out.append(text[pos:start])
        present = fields_present(block)
        if field in present:
            out.append(block)
        else:
            m = PRIORITY_RE.search(block)
            if not m:
                report.append((path, record_id(block),
                               "no 'priority:' line to anchor the insertion on"))
                out.append(block)
            else:
                insert_at = m.start()
                new_line = "%s: %s\n" % (field, value)
                block = block[:insert_at] + new_line + block[insert_at:]
                out.append(block)
                report.append((path, record_id(block), "added"))
        pos = end
    out.append(text[pos:])
    return "".join(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("paths", nargs="+")
    ap.add_argument("--set", action="append", required=True, metavar="FIELD=VALUE",
                    help="a field to materialize, repeatable")
    ap.add_argument("--apply", action="store_true", help="write changes (default: check only)")
    args = ap.parse_args()

    pairs = []
    for spec in args.set:
        if "=" not in spec:
            print("--set must be FIELD=VALUE, got: %s" % spec, file=sys.stderr)
            return 2
        field, value = spec.split("=", 1)
        pairs.append((field, value))

    total_added = 0
    total_errors = 0
    for path in args.paths:
        text = io.open(path, encoding="utf-8").read()
        original = text
        for field, value in pairs:
            report = []
            text = apply_to_text(text, field, value, report, path)
            added = [r for r in report if r[2] == "added"]
            errors = [r for r in report if r[2] != "added"]
            total_added += len(added)
            total_errors += len(errors)
            for p, rid, why in errors:
                print("ERROR %s:%s %s" % (p, rid, why), file=sys.stderr)
            if added:
                print("%s: +%s on %d record(s)" % (path, field, len(added)))
        if args.apply and text != original:
            with io.open(path, "w", encoding="utf-8", newline="") as handle:
                handle.write(text)

    if total_errors:
        return 2
    if total_added and not args.apply:
        print("\n%d field(s) to add across the given paths -- check only, nothing written"
              % total_added)
        return 1
    if total_added:
        print("\n%d field(s) added" % total_added)
    else:
        print("nothing to add")
    return 0


if __name__ == "__main__":
    sys.exit(main())
