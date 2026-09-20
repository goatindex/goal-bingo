#!/usr/bin/env python3
"""Detect and repair UTF-8-decoded-as-cp1252-and-re-encoded text (mojibake).

An em-dash written as UTF-8 (e2 80 94) that is read as cp1252 becomes the three
characters 'a-circumflex, euro, right-double-quote', and writing those back out as UTF-8
bakes the corruption into the file. The text still renders, still diffs, and still passes
every checker that does not happen to match on the affected characters -- which is how
74 of 118 record headings in goal-bingo went unseen by record_index.py while
lint_requirements.py counted them fine.

The repair is exact, not heuristic: re-encode the mojibake run as cp1252 and decode it as
UTF-8, which is the inverse of the transformation that caused it. A run that does not
round-trip cleanly is left alone and reported, never guessed at.

    python fix_mojibake.py <paths...>            # check only (default), exit 1 if found
    python fix_mojibake.py <paths...> --apply    # repair in place
    python fix_mojibake.py <paths...> --json

Exit codes: 0 nothing found (or repair applied cleanly), 1 mojibake present in check
mode, 2 the tool could not run.
"""
import argparse
import io
import json
import os
import re
import sys

# Runs of Latin-1-supplement / punctuation characters are what mojibake looks like once
# it has been re-encoded. Real prose rarely strings two or more of these together.
SUSPECT_RUN = re.compile(r"[-ÿ‐-⃿™]{2,}")


def repair_run(run):
    """Inverse of the corruption, or None when the run does not round-trip."""
    try:
        fixed = run.encode("cp1252").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return None
    return fixed if fixed != run else None


def scan_text(text):
    """[(run, repaired, start)] for every run this tool can repair exactly."""
    out = []
    for m in SUSPECT_RUN.finditer(text):
        fixed = repair_run(m.group(0))
        if fixed is not None:
            out.append((m.group(0), fixed, m.start()))
    return out


def unrepairable_runs(text):
    return [m.group(0) for m in SUSPECT_RUN.finditer(text) if repair_run(m.group(0)) is None]


def repair_text(text):
    return SUSPECT_RUN.sub(lambda m: repair_run(m.group(0)) or m.group(0), text)


def iter_files(paths):
    for p in paths:
        if os.path.isfile(p):
            yield p
        elif os.path.isdir(p):
            for root, _dirs, files in os.walk(p):
                if ".git" in root.replace("\\", "/").split("/"):
                    continue
                for f in sorted(files):
                    if f.endswith(".md"):
                        yield os.path.join(root, f)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("paths", nargs="+")
    ap.add_argument("--apply", action="store_true", help="write repairs (default: check only)")
    ap.add_argument("--json", action="store_true", dest="as_json")
    args = ap.parse_args()

    report = []
    total = 0
    for path in iter_files(args.paths):
        try:
            text = io.open(path, encoding="utf-8").read()
        except (OSError, UnicodeDecodeError) as exc:
            print(f"could not read {path}: {exc}", file=sys.stderr)
            return 2
        hits = scan_text(text)
        skipped = unrepairable_runs(text)
        if not hits and not skipped:
            continue
        total += len(hits)
        report.append({
            "file": path.replace("\\", "/"),
            "repairable": len(hits),
            "examples": sorted({f"{r!r} -> {f!r}" for r, f, _ in hits})[:4],
            "left_alone": sorted(set(skipped))[:4],
        })
        if args.apply and hits:
            # newline="" so the file's existing line endings survive the rewrite
            io.open(path, "w", encoding="utf-8", newline="").write(repair_text(text))

    if args.as_json:
        print(json.dumps({"files": report, "total_repairable": total,
                          "applied": bool(args.apply)}, indent=2, ensure_ascii=False))
    else:
        for r in report:
            print(f"{r['file']}: {r['repairable']} repairable"
                  + (f", {len(r['left_alone'])} left alone" if r["left_alone"] else ""))
            for e in r["examples"]:
                print(f"    {e}")
            for s in r["left_alone"]:
                print(f"    LEFT ALONE (does not round-trip): {s!r}")
        if not report:
            print("no mojibake found")
        else:
            print(f"\n{total} repairable sequence(s) across {len(report)} file(s)"
                  + (" -- applied" if args.apply else " -- check only, nothing written"))

    if total and not args.apply:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
