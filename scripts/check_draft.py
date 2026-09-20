# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/ba-issue/references/check_draft.py
# Commit: 6b70a0b
# Copied: 2026-09-20
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
#!/usr/bin/env python3
"""Scan a drafted markdown body for the backslash-escape corruption class of bug.

Any step that reinterprets backslash escapes (echo -e, printf with the body embedded in
the format string, a non-raw Python/YAML string) silently eats \\a \\b \\f \\n \\r \\t \\v
and the letter after them, and treats a trailing backslash-newline as a line-continuation
that merges lines. There is no error and no warning from the tool that did it -- it only
surfaces when someone reads the rendered text later. Run this on any draft before it is
filed (`gh issue create/edit --body-file`) or committed anywhere else.

Usage: check-draft.py <file> [--allow-backslash]
Exit codes:
  0 - clean
  1 - corrupted: non-printing control byte(s) found (definite sign of eaten escapes)
  2 - suspect: raw backslash byte(s) found (house convention is forward slashes in
      backtick code spans; a literal backslash is either a leftover escape survivor or a
      path written the wrong way -- pass --allow-backslash if it is genuinely intentional,
      e.g. a Windows command shown inside a fenced code block)
"""
import sys

SUSPECT_CONTROL_BYTES = {
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x0B, 0x0C,
    *range(0x0E, 0x20),
}


def scan(data: bytes):
    control_hits = []
    backslash_hits = []
    for i, b in enumerate(data):
        if b in SUSPECT_CONTROL_BYTES:
            control_hits.append((i, b))
        elif b == 0x0D and (i + 1 >= len(data) or data[i + 1] != 0x0A):
            control_hits.append((i, b))  # lone CR, not part of a CRLF line ending
        elif b == 0x5C:
            backslash_hits.append(i)
    return control_hits, backslash_hits


def context(data: bytes, i: int, span: int = 20) -> bytes:
    return data[max(0, i - span):i + span]


def main() -> int:
    args = sys.argv[1:]
    allow_backslash = "--allow-backslash" in args
    args = [a for a in args if not a.startswith("--")]
    if not args:
        print("usage: check-draft.py <file> [--allow-backslash]", file=sys.stderr)
        return 2

    path = args[0]
    data = open(path, "rb").read()
    control_hits, backslash_hits = scan(data)

    if control_hits:
        print(f"CORRUPTED: {len(control_hits)} non-printing control byte(s) in {path}")
        for i, b in control_hits[:10]:
            print(f"  byte 0x{b:02x} at offset {i}: {context(data, i)!r}")
        print("Do not file this draft. Rewrite it byte-for-byte (Write tool or a bash "
              "heredoc with a quoted delimiter) instead of patching the corrupted bytes.")
        return 1

    if backslash_hits and not allow_backslash:
        print(f"SUSPECT: {len(backslash_hits)} raw backslash byte(s) in {path}")
        for i in backslash_hits[:10]:
            print(f"  at offset {i}: {context(data, i)!r}")
        print("House convention: forward slashes in backtick code spans, never bare "
              "backslash delimiters. Re-run with --allow-backslash if this one is genuinely "
              "intentional (e.g. a Windows command inside a fenced code block).")
        return 2

    print(f"clean: {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
