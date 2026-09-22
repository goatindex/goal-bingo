# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/wrap-up/scripts/figures_check.py
# Commit: 9d60817
# Copied: 2026-09-22
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Every figure prose repeats by hand agrees with the value a command measures.

A test count, a requirement count, a coverage percentage - typed into README.md, NEXT.md
and STATE.md, and stale the moment the real number moves. `goal-bingo` had the same
"test-count claim is wrong" finding raised as blocking on three separate pull requests
in two days, each one found by an agent reading prose at real turn cost. `live-action-intel`
had solved it a fortnight earlier, repo-locally, with a FIGURES registry in its own
check_requirements.py, and the mechanism never travelled. This is that mechanism as a
master: the engine is a generated copy, the registry is the repository's own.

The registry (`figures.txt` by convention) is line-oriented:

    [test count]
    measure: cd app && npx vitest run --reporter=json
    parse:   "numTotalTests":\\s*(\\d+)
    at: README.md   -                (\\d+) vitest unit tests
    at: NEXT.md     Current focus    \\*\\*(\\d+)\\s+tests\\*\\*

`[name]` opens a figure. `measure:` is a shell command run from --root; `parse:` is a
regex with exactly one group applied to its stdout. Each `at:` names a file, a `## ` section
heading (`-` for the whole file) and a regex with exactly one group, separated by two or
more spaces. Section scoping matters: NEXT.md restates old counts in every past session
entry by design, and only `## Current focus` states a figure as true now.

Fails closed. A figure that cannot be measured, a file or section that is not there, a
sentence that no longer matches its pattern - each is a failure, not a skip, because an
unverifiable claim is exactly as unverified as a wrong one.

    python figures_check.py --registry figures.txt --root .

Exit 0 every figure agrees, 1 any disagreement, 2 the check cannot run (registry missing,
empty or malformed). ASCII only.
"""
import argparse
import io
import os
import re
import subprocess
import sys


class Location(object):
    def __init__(self, path, heading, pattern):
        self.path = path
        self.heading = heading      # None = whole file
        self.pattern = pattern      # compiled, exactly one group


class Figure(object):
    def __init__(self, name):
        self.name = name
        self.measure = None
        self.parse = None
        self.locations = []


def read(path):
    return io.open(path, encoding="utf-8", errors="replace").read().replace("\r\n", "\n")


def compile_one_group(text, where):
    try:
        rx = re.compile(text)
    except re.error as e:
        raise ValueError("%s: bad regex %r (%s)" % (where, text, e))
    if rx.groups != 1:
        raise ValueError("%s: regex %r must have exactly one capturing group, has %d"
                         % (where, text, rx.groups))
    return rx


AT_SPLIT = re.compile(r"\s{2,}")


def load_registry(path):
    """[Figure, ...] from the registry file. Raises ValueError on a malformed file."""
    figures, current = [], None
    for n, raw in enumerate(read(path).split("\n"), 1):
        line = raw.strip()
        where = "%s:%d" % (os.path.basename(path), n)
        if not line or line.startswith("#"):
            continue
        if line.startswith("[") and line.endswith("]"):
            current = Figure(line[1:-1].strip())
            if not current.name:
                raise ValueError("%s: empty figure name" % where)
            figures.append(current)
            continue
        if current is None:
            raise ValueError("%s: %r before any [figure]" % (where, line))
        key, sep, value = line.partition(":")
        key, value = key.strip(), value.strip()
        if not sep or key not in ("measure", "parse", "at"):
            raise ValueError("%s: expected measure:, parse: or at:, got %r" % (where, line))
        if key == "measure":
            if current.measure is not None:
                raise ValueError("%s: second measure: for [%s]" % (where, current.name))
            current.measure = value
        elif key == "parse":
            if current.parse is not None:
                raise ValueError("%s: second parse: for [%s]" % (where, current.name))
            current.parse = compile_one_group(value, where)
        else:
            parts = AT_SPLIT.split(value, 2)
            if len(parts) != 3:
                raise ValueError("%s: at: needs <path>  <section|->  <regex>, "
                                 "separated by two or more spaces" % where)
            fpath, heading, rx = parts
            current.locations.append(
                Location(fpath, None if heading == "-" else heading,
                         compile_one_group(rx, where)))
    if not figures:
        raise ValueError("%s: no figures declared" % os.path.basename(path))
    for f in figures:
        if f.measure is None or f.parse is None:
            raise ValueError("[%s] needs both measure: and parse:" % f.name)
        if not f.locations:
            raise ValueError("[%s] names no at: location - nothing to check" % f.name)
    return figures


def section(text, heading):
    """The body of one '## Heading' section, up to the next '## ' or the end."""
    m = re.search(r"^##\s+%s\s*$(.*?)(?=^##\s+|\Z)" % re.escape(heading), text, re.M | re.S)
    return m.group(1) if m else ""


def measure(figure, root, timeout):
    """The true value, or None with a reason."""
    try:
        p = subprocess.run(figure.measure, shell=True, cwd=root, capture_output=True,
                           text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return None, "measuring command timed out after %ds" % timeout
    m = figure.parse.search(p.stdout or "")
    if not m:
        return None, ("measuring command produced no match for %r (exit %d)"
                      % (figure.parse.pattern, p.returncode))
    return int(m.group(1)), None


def check_figures(figures, root, timeout=600):
    """[failure strings]. Every figure and every location is checked; nothing short-circuits."""
    failures = []
    for figure in figures:
        true_value, why = measure(figure, root, timeout)
        if true_value is None:
            failures.append("%s: could not measure the true value - %s" % (figure.name, why))
            continue
        for loc in figure.locations:
            where = loc.path + (" ('## %s')" % loc.heading if loc.heading else "")
            full = os.path.join(root, loc.path)
            if not os.path.isfile(full):
                failures.append("%s: file not found, cannot check %s" % (where, figure.name))
                continue
            text = read(full)
            if loc.heading:
                text = section(text, loc.heading)
                if not text:
                    failures.append("%s: section not found, cannot check %s"
                                    % (where, figure.name))
                    continue
            m = loc.pattern.search(text)
            if not m:
                failures.append("%s: states no %s in the expected form (pattern: %r)"
                                % (where, figure.name, loc.pattern.pattern))
                continue
            stated = int(m.group(1))
            if stated != true_value:
                failures.append("%s: claims %s = %d; the true value is %d"
                                % (where, figure.name, stated, true_value))
    return failures


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--registry", default="figures.txt")
    ap.add_argument("--root", default=".", help="directory paths and commands resolve against")
    ap.add_argument("--timeout", type=int, default=600, help="seconds per measuring command")
    args = ap.parse_args(argv)

    if not os.path.isfile(args.registry):
        print("ERROR: no registry at %s. Refusing to pass on nothing." % args.registry)
        return 2
    try:
        figures = load_registry(args.registry)
    except ValueError as e:
        print("ERROR: %s" % e)
        return 2

    failures = check_figures(figures, os.path.abspath(args.root), args.timeout)
    if failures:
        print("%d figure problem(s):" % len(failures))
        for f in failures:
            print("  - " + f)
        print("\nA figure typed into prose must agree with the command that measures it. "
              "Fix the prose, or fix the measure: line if the command has changed.")
        return 1
    print("figures check: %d figure(s), %d location(s), all agree"
          % (len(figures), sum(len(f.locations) for f in figures)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
