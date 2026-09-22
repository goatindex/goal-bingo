# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/record-contract/scripts/citation_check.py
# Commit: 9d60817
# Copied: 2026-09-22
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Every `#N` a prose file cites resolves, and the state it claims is the state it has.

RECORD-CONTRACT.md check 5 says a citation that claims to resolve must; provenance_check.py
proves it for record ids and file paths inside records. This is the same rule for the
prose around them - NEXT.md, DECISIONS.md, README.md, STATE.md - where issues and pull
requests are cited by number and described by state. In `goal-bingo`, 2026-09-19 to -21,
roughly half of the adversarial reviewer's blocking findings were of exactly this shape:
"#102 ... merged" for an open pull request, "closed WP-06 (#23)" beside an open issue,
the same file claiming two states for one number a few lines apart, a precedent cited to
issues that had not landed. Each was found by an agent reading prose at real turn cost,
and each is a lookup.

Three failures:

  MISSING        the number is not an issue or pull request in this repository
  STATE          the sentence claims merged / open / closed and the record is not that
  CONTRADICTION  one file claims incompatible states for the same number

A claim is read only from the sentence or bullet the citation sits in. A sentence that
says both ("merged or awaiting final merge") is reported as a notice and not judged.
"Merged" said of an issue means its work merged and it closed, so a closed issue holds.

State is judged only where prose speaks in the present. A `## Done (...)` session entry
or a `## D-YYYY-MM-DD-n` decision is a log: "awaiting merge" written on the day was true
on the day, and a log entry is never rewritten once merged (RECORD-CONTRACT.md). In those
sections a citation must still exist - a wrong number is wrong whenever it was typed - but
its state claim is not checked. --history-sections names the headings that are logs.

Cross-repository citations (`owner/repo#N`) are resolved when the token can see them.
When it cannot - GITHUB_TOKEN sees only its own repository - they are reported as
NOAUTH under --auth-errors-are-skips: named in the log, counted as unverified, and not
failed, the same honest green `project-tracking`'s audit uses. Without the flag an auth
refusal is an error.

    python citation_check.py                          # defaults, repo from gh
    python citation_check.py --files NEXT.md STATE.md --repo owner/name
    python citation_check.py --auth-errors-are-skips  # in CI with GITHUB_TOKEN

Exit 0 every citation holds, 1 any failure, 2 the check cannot run (no gh, an explicit
file missing, none of the default files present, an unexplained gh error). A file that
exists and cites nothing is clean; a root with nothing to read is not. ASCII only.
"""
import argparse
import io
import json
import os
import re
import subprocess
import sys

# Resolved rather than hard-coded so the logic can be tested against a stand-in.
GH_BIN = os.environ.get("GH_BIN", "gh")

DEFAULT_FILES = ["NEXT.md", "DECISIONS.md", "README.md", "STATE.md"]

# `#12`, `owner/repo#12`; not `&#123;`, not a path segment, not `#1c1917`.
REF = re.compile(r"(?<![\w&/])(?:([\w.-]+/[\w.-]+))?#(\d+)\b")
RANGE = re.compile(r"(?<![\w&/])#(\d+)\s*[-–]\s*#?(\d+)\b")
RANGE_MAX = 20

MERGED = re.compile(r"\bmerged\b", re.I)
NEGATED_MERGE = re.compile(r"\b(?:not|never|awaiting|pending|to be)\s+(?:yet\s+)?$", re.I)
OPEN = re.compile(r"\bstill open\b|\bremains open\b|\bopen\b|\bunmerged\b|"
                  r"\bnot (?:yet )?merged\b|\bawaiting (?:final )?merge\b", re.I)
CLOSED = re.compile(r"\bclosed\b", re.I)

AUTH_MARKS = re.compile(
    r"gh auth login|Bad credentials|HTTP 401|HTTP 403|Resource not accessible|"
    r"Could not resolve to a Repository", re.I)
NOT_FOUND = re.compile(r"HTTP 404|Not Found", re.I)

SENTENCE_END = re.compile(r"\.\s|;|\n|\|")
WINDOW = 160

HISTORY_DEFAULT = r"^## (?:Done \(|D-\d{4}-\d{2}-\d{2}-)"
HEADING = re.compile(r"^## .*$", re.M)


def history_spans(text, history_re):
    """[(start, end)] of every `## ` section whose heading matches history_re."""
    heads = list(HEADING.finditer(text))
    spans = []
    for i, h in enumerate(heads):
        if history_re.search(h.group(0)):
            end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
            spans.append((h.start(), end))
    return spans


def read(path):
    return io.open(path, encoding="utf-8", errors="replace").read().replace("\r\n", "\n")


def sentence_around(text, start, end):
    """The sentence or bullet containing text[start:end], capped to WINDOW chars each side."""
    lo = max(0, start - WINDOW)
    before = text[lo:start]
    cut = max((m.end() for m in SENTENCE_END.finditer(before)), default=0)
    hi = min(len(text), end + WINDOW)
    after = text[end:hi]
    m = SENTENCE_END.search(after)
    stop = end + (m.start() if m else len(after))
    return text[lo + cut:stop]


def claim_in(sentence):
    """'merged' | 'open' | 'closed' | None, or 'ambiguous' when the sentence says two."""
    found = set()
    for m in MERGED.finditer(sentence):
        if not NEGATED_MERGE.search(sentence[max(0, m.start() - 20):m.start()]):
            found.add("merged")
    if OPEN.search(sentence):
        found.add("open")
    if CLOSED.search(sentence):
        found.add("closed")
    if "open" in found and (found & {"merged", "closed"}):
        return "ambiguous"
    if "merged" in found:
        return "merged"
    if "closed" in found:
        return "closed"
    if "open" in found:
        return "open"
    return None


def citations(text, history_re=None):
    """[(repo or None, number, line, claim)] for every citation in the text.

    A citation inside a history section keeps its line and number and loses its claim.
    """
    history = history_spans(text, history_re) if history_re else []

    def claim_at(start, end):
        if any(s <= start < e for s, e in history):
            return None
        return claim_in(sentence_around(text, start, end))

    out = []
    spans = []
    for m in RANGE.finditer(text):
        a, b = int(m.group(1)), int(m.group(2))
        if a < b <= a + RANGE_MAX:
            line = text.count("\n", 0, m.start()) + 1
            claim = claim_at(m.start(), m.end())
            for n in range(a, b + 1):
                out.append((None, n, line, claim))
            spans.append((m.start(), m.end()))
    for m in REF.finditer(text):
        if any(s <= m.start() < e for s, e in spans):
            continue
        line = text.count("\n", 0, m.start()) + 1
        out.append((m.group(1), int(m.group(2)), line, claim_at(m.start(), m.end())))
    return out


def gh(args, cwd):
    """(returncode, stdout, stderr); returncode -1 when gh cannot be run at all."""
    try:
        r = subprocess.run([GH_BIN] + args, cwd=cwd, capture_output=True, timeout=60)
    except (OSError, subprocess.TimeoutExpired) as e:
        return -1, "", str(e)
    return (r.returncode, r.stdout.decode("utf-8", "replace"),
            r.stderr.decode("utf-8", "replace"))


def own_repo(explicit, cwd):
    if explicit:
        return explicit
    env = os.environ.get("GITHUB_REPOSITORY")
    if env:
        return env
    rc, out, _ = gh(["repo", "view", "--json", "nameWithOwner"], cwd)
    if rc == 0:
        try:
            return json.loads(out).get("nameWithOwner")
        except ValueError:
            return None
    return None


def lookup(repo, number, cwd):
    """('ok', record) | ('missing', msg) | ('noauth', msg) | ('error', msg)."""
    rc, out, err = gh(["api", "repos/%s/issues/%d" % (repo, number)], cwd)
    if rc == -1:
        return "error", err
    if rc == 0:
        try:
            d = json.loads(out)
        except ValueError:
            return "error", "gh returned non-JSON for #%d" % number
        pr = d.get("pull_request")
        return "ok", {
            "kind": "pr" if pr else "issue",
            "state": d.get("state"),
            "merged": bool(pr and pr.get("merged_at")),
        }
    if AUTH_MARKS.search(err):
        return "noauth", err.strip().split("\n")[0]
    if NOT_FOUND.search(err):
        return "missing", err.strip().split("\n")[0]
    return "error", err.strip().split("\n")[0] or "gh exit %d" % rc


def state_holds(claim, rec):
    if claim == "merged":
        if rec["kind"] == "pr":
            return rec["merged"]
        return rec["state"] == "closed"     # an issue "merged" is an issue whose work landed
    if claim == "open":
        return rec["state"] == "open"
    if claim == "closed":
        return rec["state"] == "closed"
    return True


def describe(rec):
    if rec["kind"] == "pr":
        if rec["merged"]:
            return "a merged pull request"
        return "an open pull request" if rec["state"] == "open" else "a closed, unmerged pull request"
    return "an open issue" if rec["state"] == "open" else "a closed issue"


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--files", nargs="+", help="prose files to scan (default: %s)"
                    % " ".join(DEFAULT_FILES))
    ap.add_argument("--root", default=".")
    ap.add_argument("--repo", help="owner/name that bare #N refers to (default: gh repo view)")
    ap.add_argument("--auth-errors-are-skips", action="store_true",
                    help="report an auth refusal as NOAUTH and stay green, rather than error")
    ap.add_argument("--history-sections", default=HISTORY_DEFAULT, metavar="REGEX",
                    help="'## ' headings that are logs: existence checked, state not judged")
    args = ap.parse_args(argv)
    root = os.path.abspath(args.root)
    try:
        history_re = re.compile(args.history_sections) if args.history_sections else None
    except re.error as e:
        print("ERROR: --history-sections is not a regex: %s" % e)
        return 2

    explicit = bool(args.files)
    files = args.files or DEFAULT_FILES
    found = {}
    for f in files:
        full = os.path.join(root, f)
        if not os.path.isfile(full):
            if explicit:
                print("ERROR: no such file: %s" % f)
                return 2
            continue
        found[f] = citations(read(full), history_re)
    if not found:
        print("ERROR: none of %s exist under %s. A check that cannot see its subject has "
              "not passed - pass --files, or point --root at the repository."
              % (", ".join(files), root))
        return 2
    total = sum(len(v) for v in found.values())
    if total == 0:
        print("citation check: no #N citations in %s - nothing to resolve" % ", ".join(found))
        return 0

    repo = own_repo(args.repo, root)
    if not repo:
        rc, _, err = gh(["--version"], root)
        if rc == -1:
            print("ERROR: cannot run %s (%s). The check needs gh." % (GH_BIN, err))
        else:
            print("ERROR: cannot determine this repository - pass --repo owner/name")
        return 2

    cache = {}
    failures, noauth, notices, errors = [], [], [], []
    claims_by_file = {}
    for f, refs in found.items():
        for ref_repo, n, line, claim in refs:
            target = ref_repo or repo
            key = (target, n)
            if key not in cache:
                cache[key] = lookup(target, n, root)
            status, payload = cache[key]
            label = ("%s#%d" % (ref_repo, n)) if ref_repo else "#%d" % n
            if status == "error":
                errors.append("%s:%d %s - %s" % (f, line, label, payload))
                continue
            if status == "noauth" or (status == "missing" and ref_repo):
                if args.auth_errors_are_skips:
                    noauth.append("%s:%d %s - %s" % (f, line, label, payload))
                else:
                    errors.append("%s:%d %s - %s (pass --auth-errors-are-skips to report "
                                  "this as NOAUTH)" % (f, line, label, payload))
                continue
            if status == "missing":
                failures.append("MISSING       %s:%d %s" % (f, line, label))
                continue
            if claim == "ambiguous":
                notices.append("%s:%d %s sentence claims both merged/closed and open; not judged"
                               % (f, line, label))
                continue
            if claim and not state_holds(claim, payload):
                failures.append("STATE         %s:%d %s claimed %s, is %s"
                                % (f, line, label, claim, describe(payload)))
            if claim:
                claims_by_file.setdefault((f, label), []).append((claim, line))

    for (f, label), seen in sorted(claims_by_file.items()):
        kinds = dict()
        for claim, line in seen:
            kinds.setdefault(claim, line)
        if "open" in kinds and (set(kinds) & {"merged", "closed"}):
            other = "merged" if "merged" in kinds else "closed"
            failures.append("CONTRADICTION %s %s: %s (line %d) vs open (line %d)"
                            % (f, label, other, kinds[other], kinds["open"]))

    unique = len(cache)
    print("citation check: %d citation(s) in %d file(s), %d unique, repo %s"
          % (total, len(found), unique, repo))
    for n in notices:
        print("  notice        " + n)
    for n in noauth:
        print("  NOAUTH        " + n)
    for e in errors:
        print("  ERROR         " + e)
    for fl in failures:
        print("  " + fl)
    if noauth:
        print("  %d citation(s) could not be verified (NOAUTH) - unverified, not verified"
              % len(noauth))
    if errors:
        print("\n%d citation(s) could not be checked. Refusing to pass on an unexplained error."
              % len(errors))
        return 2
    if failures:
        print("\n%d citation(s) do not hold. A number cited in prose must exist, and the state "
              "the sentence gives it must be the state it has." % len(failures))
        return 1
    print("  every citation resolves and every state claim holds")
    return 0


if __name__ == "__main__":
    sys.exit(main())
