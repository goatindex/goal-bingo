# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/wrap-up/scripts/next_on_merge.py
# Commit: 26f9ba0
# Copied: 2026-10-10
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Write one merged pull request into NEXT.md and keep five Done lines.

A successful merge is the event. This does not wait for a session, and it does
not write a daily log. It prepends one pointer for the pull request, keeps the
five newest Done lines, moves Intake lines out of Done, drops a Next up line
that cites the same pull request, and sets Last updated.

An old `## Done (YYYY-MM-DD session)` heading is folded into one `## Done`
section. A bullet whose first line starts with **Intake:** is an intake record,
not a completion, and moves to `## Intake`.

A repository with no NEXT.md is unchanged: the convention is opt-in.

    python next_on_merge.py --file NEXT.md

The pull request number, title, and merge time come from PR_NUMBER, PR_TITLE,
and MERGED_AT, or from --pr, --title, and --date. MERGED_AT may be a date or
an ISO timestamp; the first ten characters are the date.

Exit 0 when the file changes, 3 when nothing changes, 2 when the arguments or
the file cannot be used. When GITHUB_OUTPUT is set, the script appends
changed=true or changed=false. ASCII only.
"""
import argparse
import io
import os
import re
import sys

DONE_LIMIT = 5
HEADING = re.compile(r"^## (.+)$")
INTAKE = re.compile(r"^- \*\*Intake:\*\*")
DATE = re.compile(r"^(\d{4}-\d{2}-\d{2})")


def cite_pattern(number):
    return re.compile(r"(?<![\w&/])#%d\b" % number)


def read_text(path):
    with io.open(path, "r", encoding="utf-8") as handle:
        return handle.read().replace("\r\n", "\n")


def write_text(path, text):
    with io.open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)


def split_sections(text):
    """Return (preamble, [(heading_line, body), ...]). Body has no trailing split."""
    lines = text.split("\n")
    preamble = []
    sections = []
    current_head = None
    current = []
    started = False
    for line in lines:
        match = HEADING.match(line)
        if match:
            if not started:
                preamble = current
                started = True
            else:
                sections.append((current_head, current))
            current_head = line
            current = []
        else:
            current.append(line)
    if not started:
        return current, []
    sections.append((current_head, current))
    return preamble, sections


def join_sections(preamble, sections):
    parts = []
    if preamble:
        parts.append("\n".join(preamble).rstrip("\n"))
    for head, body in sections:
        block = head
        body_text = "\n".join(body).strip("\n")
        if body_text:
            block += "\n\n" + body_text
        parts.append(block)
    text = "\n\n".join(parts).rstrip("\n") + "\n"
    return text


def bullets(body_lines):
    """Return (bullet texts, non-bullet lines kept in order)."""
    items = []
    other = []
    current = None
    for line in body_lines:
        if line.startswith("- "):
            if current is not None:
                items.append("\n".join(current).rstrip())
            current = [line]
        elif current is not None and (line.startswith(" ") or line.startswith("\t")):
            current.append(line)
        else:
            if current is not None:
                items.append("\n".join(current).rstrip())
                current = None
            if line.strip():
                other.append(line)
    if current is not None:
        items.append("\n".join(current).rstrip())
    return items, other


def is_done(title):
    return title == "Done" or title.startswith("Done (")


def heading_title(head):
    return head[3:]


def render_bullets(items):
    if not items:
        return []
    lines = []
    for item in items:
        if lines:
            lines.append("")
        lines.extend(item.split("\n"))
    return lines


def clean_title(title):
    text = " ".join((title or "").split())
    text = text.rstrip(" .")
    if not text:
        return "Pull request"
    return text[:200]


def merge_date(raw):
    text = (raw or "").strip()
    match = DATE.match(text)
    if not match:
        raise ValueError("date must start with YYYY-MM-DD")
    return match.group(1)


def update(text, number, title, day):
    """Return the new file text, or None when nothing about the merge changes."""
    preamble, sections = split_sections(text)
    cite = cite_pattern(number)
    done_items = []
    intake_items = []
    intake_from_done = False
    done_sections = 0
    folded = False
    next_removed = False
    first_done = None
    intake_at = None
    updated_at = None
    kept = []

    for index, (head, body) in enumerate(sections):
        title_text = heading_title(head)
        if is_done(title_text):
            done_sections += 1
            if title_text != "Done":
                folded = True
            found, _rest = bullets(body)
            for item in found:
                first = item.split("\n", 1)[0]
                if INTAKE.match(first):
                    intake_items.append(item)
                    intake_from_done = True
                else:
                    done_items.append(item)
            if first_done is None:
                first_done = len(kept)
            continue
        if title_text == "Intake":
            found, _rest = bullets(body)
            intake_items.extend(found)
            intake_at = len(kept)
            continue
        if title_text == "Next up":
            found, _rest = bullets(body)
            remaining = [item for item in found if not cite.search(item)]
            if len(remaining) != len(found):
                next_removed = True
            kept.append(("## Next up", render_bullets(remaining)))
            continue
        if title_text == "Last updated":
            updated_at = len(kept)
            kept.append((head, body))
            continue
        kept.append((head, body))

    pointer = "- %s - %s (#%d)." % (day, clean_title(title), number)
    already = any(cite.search(item) for item in done_items)
    structural = (not already) or folded or intake_from_done or next_removed or done_sections > 1
    if not structural:
        return None
    if not already:
        done_items = [pointer] + done_items
    done_items = done_items[:DONE_LIMIT]

    # Intake keeps every record. Exact duplicates collapse, first occurrence wins.
    seen = set()
    intake_unique = []
    for item in intake_items:
        if item in seen:
            continue
        seen.add(item)
        intake_unique.append(item)

    done_body = render_bullets(done_items)
    if first_done is None:
        insert_at = len(kept)
        for index, (head, _body) in enumerate(kept):
            name = heading_title(head)
            if name in ("Parked", "Last updated"):
                insert_at = index
                break
        kept.insert(insert_at, ("## Done", done_body))
        if updated_at is not None and updated_at >= insert_at:
            updated_at += 1
        if intake_at is not None and intake_at >= insert_at:
            intake_at += 1
    else:
        kept.insert(first_done, ("## Done", done_body))
        if updated_at is not None and updated_at >= first_done:
            updated_at += 1
        if intake_at is not None and intake_at >= first_done:
            intake_at += 1

    if intake_unique:
        intake_body = render_bullets(intake_unique)
        if intake_at is None:
            # Place Intake after Done.
            done_index = 0
            for index, (head, _body) in enumerate(kept):
                if heading_title(head) == "Done" or heading_title(head).startswith("Done ("):
                    done_index = index + 1
            kept.insert(done_index, ("## Intake", intake_body))
            if updated_at is not None and updated_at >= done_index:
                updated_at += 1
        else:
            kept[intake_at] = ("## Intake", intake_body)

    if updated_at is None:
        kept.append(("## Last updated", [day]))
    else:
        body = list(kept[updated_at][1])
        replaced = False
        new_body = []
        for line in body:
            if not replaced and line.strip():
                new_body.append(day)
                replaced = True
            elif replaced and line.strip() and DATE.match(line.strip()):
                continue
            else:
                new_body.append(line)
        if not replaced:
            new_body = [day]
        kept[updated_at] = ("## Last updated", new_body)

    new_text = join_sections(preamble, kept)
    if new_text.replace("\n", "") == text.replace("\r\n", "\n").replace("\n", ""):
        return None
    if new_text == text.replace("\r\n", "\n"):
        return None
    return new_text


def emit_output(changed):
    path = os.environ.get("GITHUB_OUTPUT")
    if not path:
        return
    with io.open(path, "a", encoding="utf-8", newline="\n") as handle:
        handle.write("changed=%s\n" % ("true" if changed else "false"))


def main(argv):
    parser = argparse.ArgumentParser(description="Record a merged pull request in NEXT.md")
    parser.add_argument("--file", required=True)
    parser.add_argument("--pr", default=os.environ.get("PR_NUMBER", ""))
    parser.add_argument("--title", default=os.environ.get("PR_TITLE", ""))
    parser.add_argument("--date", default=os.environ.get("MERGED_AT", ""))
    args = parser.parse_args(argv)
    if not os.path.isfile(args.file):
        sys.stderr.write("no NEXT.md at %s\n" % args.file)
        emit_output(False)
        return 3
    try:
        number = int(str(args.pr).strip())
        if number < 1:
            raise ValueError("pull request number must be positive")
        day = merge_date(args.date)
    except ValueError as exc:
        sys.stderr.write("%s\n" % exc)
        return 2
    original = read_text(args.file)
    try:
        updated = update(original, number, args.title, day)
    except ValueError as exc:
        sys.stderr.write("%s\n" % exc)
        return 2
    if updated is None:
        emit_output(False)
        return 3
    write_text(args.file, updated)
    emit_output(True)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
