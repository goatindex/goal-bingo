# GENERATED COPY - DO NOT EDIT
#
# Master: goatindex/claude-workflow
#         skills/incose-requirements/scripts/lint_requirements.py
# Commit: 86ae18a
# Copied: 2026-09-21
#
# Edit the master and re-run scripts/refresh_copies.py. A change made here is
# lost at the next refresh, and drift is reported by --check.
# --- end generated header ---
#!/usr/bin/env python3
"""INCOSE GtWR requirement-set linter.

Checks a requirement set written in the record format described in
references/record-format.md against the mechanically-checkable subset of the
GtWR v4 rules (R1-R42), plus structural and traceability integrity, plus
optional verification coverage from tagged tests.

Standard library only. Python 3.8+. No network, no installs.

Usage:
    python lint_requirements.py requirements/
    python lint_requirements.py requirements/ --tests tests/
    python lint_requirements.py requirements/ --matrix > TRACE.md
    python lint_requirements.py requirements/ --json --fail-on warn

What it cannot check: necessity, appropriateness, feasibility, completeness,
correctness of transformation, and grammar. Those are the judgement pass in
references/characteristics.md. A clean run means well-formed, not right.
"""

import argparse
import difflib
import json
import os
import re
import sys

SEVERITIES = ["info", "warn", "error"]

# ---------------------------------------------------------------- rule data

# (rule, severity, description, [phrases])  - phrases are matched whole-word,
# case-insensitively, allowing internal whitespace runs.
PHRASE_RULES = [
    ("R7", "warn", "vague term", [
        "some", "several", "many", "a lot of", "a few", "almost all",
        "very nearly", "nearly", "about", "close to", "almost", "approximate",
        "approximately", "allowable", "ancillary", "relevant", "routine",
        "common", "generic", "significant", "flexible", "expandable",
        "typical", "sufficient", "adequate", "appropriate", "efficient",
        "effective", "proficient", "reasonable", "customary", "user friendly",
        "user-friendly", "robust", "fast", "quick", "easy", "simple",
        "seamless", "intuitive", "state of the art", "modern", "scalable",
    ]),
    ("R8", "error", "escape clause", [
        "as far as possible", "as little as possible", "where possible",
        "wherever possible", "as much as possible", "if it should prove necessary",
        "if necessary", "to the extent necessary", "as appropriate",
        "as required", "as needed", "to the extent practical", "if practicable",
        "where practicable", "where applicable", "best effort", "best endeavours",
        "if feasible", "subject to availability",
    ]),
    ("R9", "error", "open-ended clause", [
        "including but not limited to", "but not limited to", "and so on",
        "and so forth", "among others", "or similar", "such as",
    ]),
    ("R10", "warn", "superfluous infinitive", [
        "shall be designed to", "shall be able to", "shall be capable of",
        "shall have the ability to", "shall have the capability",
        "shall provide the ability to", "shall enable", "shall allow",
        "shall support", "shall permit", "shall facilitate",
    ]),
    ("R20", "warn", "purpose phrase (belongs in rationale)", [
        "in order to", "so that", "for the purpose of", "with the intent of",
        "so as to", "with the aim of", "the intent is",
    ]),
    ("R26", "warn", "unachievable absolute", [
        "100%", "100 %", "100 per cent", "100 percent", "always", "never",
        "none", "zero downtime", "fully", "completely", "totally", "entirely",
        "at all times", "under all conditions", "maximum possible",
        "minimum possible", "no circumstances",
    ]),
    ("R32", "warn", "universal quantifier (prefer \"each\")", [
        "all", "any", "both", "every",
    ]),
    ("R35", "warn", "indefinite temporal term", [
        "eventually", "in a timely manner", "as soon as possible", "asap",
        "periodically", "regularly", "frequently", "instantaneously",
        "instantaneous", "simultaneously", "simultaneous", "at last",
        "earliest", "latest", "promptly", "immediately", "until", "once",
        "before", "after",
    ]),
    ("R38", "warn", "abbreviation", [
        "e.g.", "i.e.", "etc.", "etc", "approx.", "approx", "max.", "min.",
        "temp.", "config", "spec", "vs.", "w/", "info", "admin",
    ]),
    ("R19", "warn", "combinator", [
        "unless", "as well as", "but also", "however", "whether", "meanwhile",
        "whereas", "on the other hand", "otherwise", "in addition to",
    ]),
]

PRONOUNS_STRONG = ["it", "its", "they", "them", "their", "he", "she", "his", "her", "theirs"]
PRONOUNS_WEAK = ["this", "that", "these", "those"]

TEMPORAL_SOFTENABLE = {"until", "once", "before", "after", "immediately", "promptly"}

KNOWN_UNITS = {
    "ns", "us", "ms", "s", "sec", "secs", "second", "seconds", "minute",
    "minutes", "min", "mins", "hour", "hours", "h", "hr", "hrs", "day", "days",
    "d", "week", "weeks", "month", "months", "year", "years",
    "b", "byte", "bytes", "bit", "bits", "kb", "mb", "gb", "tb", "pb",
    "kib", "mib", "gib", "tib", "kbps", "mbps", "gbps",
    "hz", "khz", "mhz", "ghz", "rpm", "rps", "qps", "tps",
    "mm", "cm", "m", "km", "in", "ft", "mg", "g", "kg", "t", "n", "pa", "kpa",
    "v", "a", "ma", "w", "kw", "kwh", "j", "c", "f", "k",
    "px", "dpi", "pt", "em", "rem",
    "percent", "per", "cent", "characters", "chars", "items", "records",
    "events", "requests", "messages", "rows", "files", "users", "sessions",
    "attempts", "retries", "times", "instances", "replicas", "connections",
    "digits", "levels", "degrees", "entries", "tokens", "days'",
}

TOLERANCE_MARKERS = [
    "within", "at most", "at least", "no more than", "no fewer than",
    "no less than", "not exceed", "up to", "minimum", "maximum", "range",
    "between", "percentile", "or less", "or greater", "or fewer", "+/-",
    "plus or minus", "tolerance", "nominal", "peak", "sustained", "median",
    "average", "mean",
]

BUILTIN_ACRONYMS = {
    "API", "HTTP", "HTTPS", "JSON", "XML", "CSV", "YAML", "SQL", "URL", "URI",
    "UTC", "ID", "UI", "UX", "OS", "CPU", "RAM", "TLS", "SSL", "SSH", "DNS",
    "TCP", "UDP", "IP", "REST", "CRUD", "MFA", "SSO", "RBAC", "PII", "SLA",
    "SLO", "RPO", "RTO", "CI", "CD", "SI", "TBD", "NA", "AND", "OR", "XOR",
    "NOT", "IF", "GB", "MB", "KB", "TB", "MS", "HTML", "CSS", "PDF", "SDK",
}

VERIFICATION_METHODS = {"test", "demonstration", "inspection", "analysis"}
VERIFICATION_STATUSES = {"not-verified", "in-progress", "verified", "waived", "failed"}
VALIDATION_STATUSES = {"not-validated", "validated", "n-a", "na"}

PROFILE_FIELDS = {
    "full": [
        "type", "rationale", "allocation", "verification-criteria",
        "verification-strategy", "verification-method", "verification-owner",
        "author", "owner", "verification-status", "validation-status",
        "priority", "criticality", "risk",
    ],
    "agent": [
        "type", "rationale", "verification-method", "verification-criteria",
        "verification-status", "owner", "priority",
    ],
}

ID_RE = re.compile(r"^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$")
# The ID is captured greedily as a whole token; the optional name follows after
# whitespace and an optional separator (hyphen, colon, en dash, em dash). Do not
# let the separator class eat into the ID - that silently truncates REQ-FUN-001
# to REQ-FUN and breaks every trace link.
# The separator class is "one non-word, non-space character" so it covers the
# hyphen, colon, en dash, and em dash without embedding non-ASCII in this file.
HEADING_RE = re.compile(
    r"^(#{2,4})\s+([A-Za-z0-9][A-Za-z0-9\-]*)(?:\s+[^\w\s]?\s*(.*?))?\s*$")
IDLIKE_RE = re.compile(r"^[A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+$")
FIELD_RE = re.compile(r"^([a-z][a-z0-9-]*):\s*(.*)$")
CONT_RE = re.compile(r"^\s{2,}(\S.*)$")
NUMBER_RE = re.compile(r"(?<![\w.])(\d+(?:[.,]\d+)?)(?!\w*\d)")
ORDINAL_RE = re.compile(r"\d+(st|nd|rd|th)\b", re.I)
ACRONYM_RE = re.compile(r"\b([A-Z]{2,}[0-9]*)s?\b")
CAP_TERM_RE = re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b")


class Finding(object):
    def __init__(self, severity, rule, message, rec_id="", path="", line=0):
        self.severity = severity
        self.rule = rule
        self.message = message
        self.rec_id = rec_id
        self.path = path
        self.line = line

    def as_dict(self):
        return {
            "severity": self.severity, "rule": self.rule,
            "message": self.message, "id": self.rec_id,
            "file": self.path, "line": self.line,
        }


class Record(object):
    def __init__(self, rec_id, name, path, line):
        self.id = rec_id
        self.name = name
        self.path = path
        self.line = line
        self.fields = {}
        self.field_lines = {}
        self.waivers = set()

    def get(self, key, default=""):
        return self.fields.get(key, default)

    def is_need(self):
        return self.id.startswith("NEED") or self.get("type") == "need"


# ---------------------------------------------------------------- parsing

def read_text(path):
    with open(path, "r", encoding="utf-8", errors="replace") as handle:
        return handle.read()


def parse_records(path, findings):
    """Parse one markdown file into Record objects."""
    records = []
    current = None
    last_key = None
    for lineno, raw in enumerate(read_text(path).splitlines(), 1):
        line = raw.rstrip()
        heading = HEADING_RE.match(line)
        if heading and ID_RE.match(heading.group(2)):
            current = Record(heading.group(2), (heading.group(3) or "").strip(),
                             path, lineno)
            records.append(current)
            last_key = None
            continue
        if line.startswith("#"):
            if heading and IDLIKE_RE.match(heading.group(2)):
                findings.append(Finding(
                    "warn", "A15",
                    "heading '%s' looks like a record id but is not well-formed "
                    "(expected uppercase segments, e.g. REQ-FUN-001)" % heading.group(2),
                    "", path, lineno))
            current = None
            last_key = None
            continue
        if current is None:
            continue
        if not line.strip():
            last_key = None
            continue
        cont = CONT_RE.match(raw)
        if cont and last_key:
            current.fields[last_key] = (current.fields[last_key] + " "
                                        + cont.group(1).strip()).strip()
            continue
        field = FIELD_RE.match(line)
        if field:
            key, value = field.group(1), field.group(2).strip()
            if key in current.fields:
                findings.append(Finding("warn", "R42",
                                        "duplicate field '%s'" % key,
                                        current.id, path, lineno))
            current.fields[key] = value
            current.field_lines[key] = lineno
            last_key = key
            continue
        findings.append(Finding("info", "R42",
                                "unparsed line (put commentary in a notes: field)",
                                current.id, path, lineno))
        last_key = None
    return records


def parse_meta(directory, findings):
    meta = {"profile": "agent", "defaults": {}, "taxonomy": [],
            "id-prefixes": ["REQ", "NEED"], "entity": "", "path": "",
            "known-acronyms": [], "version": "", "units": ""}
    path = os.path.join(directory, "_meta.md")
    if not os.path.isfile(path):
        findings.append(Finding("warn", "R42",
                                "_meta.md not found; using profile 'agent' and no taxonomy",
                                "", directory, 0))
        return meta
    in_defaults = False
    for lineno, raw in enumerate(read_text(path).splitlines(), 1):
        line = raw.rstrip()
        if line.startswith("#"):
            # Match the heading itself ("## defaults", any level, trailing
            # whitespace), not any comment line that happens to mention the
            # word - review caught this: a prose comment explaining the
            # deprecation ("no '## defaults' section...") would otherwise
            # itself toggle in_defaults, silently swallowing any real field
            # written after it into the now-unread defaults dict.
            in_defaults = bool(re.match(r"^#+\s*defaults\s*$", line.strip(), re.I))
            continue
        field = FIELD_RE.match(line)
        if not field:
            continue
        key, value = field.group(1), field.group(2).strip()
        if in_defaults:
            meta["defaults"][key] = value
        elif key in ("taxonomy", "id-prefixes", "known-acronyms"):
            meta[key] = [v.strip() for v in value.split(",") if v.strip()]
        else:
            meta[key] = value
    if meta["profile"] not in PROFILE_FIELDS:
        findings.append(Finding("error", "R42",
                                "unknown profile '%s' (expected full or agent)"
                                % meta["profile"], "", path, 0))
        meta["profile"] = "agent"
    if meta["defaults"]:
        findings.append(Finding("warn", "R42",
                                "'## defaults' in _meta.md is deprecated and no longer "
                                "read - every field must be written explicitly on every "
                                "record (D-2026-09-20-1, project-tracking/DECISIONS.md). "
                                "Copy these values onto each record, then delete this "
                                "section.", "", path, 0))
    return meta


def parse_glossary(directory):
    terms, acronyms, units = set(), set(), set()
    path = os.path.join(directory, "glossary.md")
    if not os.path.isfile(path):
        return terms, acronyms, units
    for line in read_text(path).splitlines():
        match = re.match(r"^\s*[-*]?\s*\*\*(.+?)\*\*", line)
        if not match:
            continue
        term = match.group(1).strip()
        terms.add(term.lower())
        if term.isupper():
            acronyms.add(term)
        if "unit" in line.lower():
            units.add(term.lower())
    return terms, acronyms, units


# ---------------------------------------------------------------- helpers

def phrase_pattern(phrase):
    escaped = r"\s+".join(re.escape(word) for word in phrase.split())
    lead = r"(?<![\w-])" if phrase[0].isalnum() else ""
    trail = r"(?![\w-])" if phrase[-1].isalnum() else ""
    return re.compile(lead + escaped + trail, re.I)


PHRASE_PATTERNS = [
    (rule, severity, label, [(p, phrase_pattern(p)) for p in phrases])
    for rule, severity, label, phrases in PHRASE_RULES
]
PRONOUN_STRONG_PATTERNS = [(w, phrase_pattern(w)) for w in PRONOUNS_STRONG]
PRONOUN_WEAK_PATTERNS = [(w, phrase_pattern(w)) for w in PRONOUNS_WEAK]


def normalise(text):
    return re.sub(r"[^a-z0-9 ]", " ", " ".join(text.lower().split())).strip()


def split_at_shall(statement):
    parts = re.split(r"\bshall\b", statement, maxsplit=1, flags=re.I)
    if len(parts) == 2:
        return parts[0], parts[1]
    return statement, ""


# ---------------------------------------------------------------- checks

def check_statement(rec, meta, glossary, findings):
    statement = rec.get("statement")
    add = lambda sev, rule, msg: emit(findings, rec, sev, rule, msg)
    if not statement:
        add("error", "R42", "no statement: field")
        return

    lower = statement.lower()
    condition, action = split_at_shall(statement)
    is_need = rec.is_need()
    entity = meta.get("entity", "")

    # R1 / obligation verb
    if is_need:
        if "needs to" not in lower and "need to" not in lower:
            add("warn", "R1", "need statement does not use 'needs to'")
        if re.search(r"\bshall\b", lower):
            add("warn", "R1", "need statement uses 'shall' (that is requirement phrasing)")
    else:
        shalls = len(re.findall(r"\bshall\b", lower))
        if shalls == 0:
            add("error", "R1", "no 'shall' - not an obligation statement")
        elif shalls > 1:
            add("warn", "R18", "%d occurrences of 'shall' - likely more than one obligation"
                % shalls)
        # The subject slot normally requires a definite article ("the Ingest
        # Service") because it disambiguates one entity among several. A set
        # with exactly one entity, declared in _meta.md as a proper noun (a
        # product name like "Goal Bingo"), correctly carries no article at
        # all -- "The Goal Bingo shall" is not English. Accept the declared
        # entity's bare name as an alternative subject rather than loosening
        # the pattern for everyone; a set that has NOT declared an entity, or
        # that declares the generic "system", still requires "the" (F-61:
        # project-tracking's own WOW-DAT-* records rely on this being strict).
        subject_alt = r"the\s+.+?"
        if entity and entity.lower() != "system":
            subject_alt = r"(?:the\s+.+?|%s)" % re.escape(entity)
        pattern = re.compile(
            r"^\s*(?:(?:when|while|where|if|upon|given|during)\b[^,]{3,},\s*"
            r"(?:then\s+)?)?" + subject_alt + r"\s+shall\s+\S+", re.I)
        if not pattern.match(statement):
            add("warn", "R1",
                "does not match a declared pattern (see references/patterns.md)")

    # R2 passive voice
    if re.search(r"\bshall\s+be\s+\w+(?:ed|en)\b", lower) or \
       re.search(r"\b(?:is|are)\s+to\s+be\b", lower):
        add("warn", "R2", "passive construction - name the responsible entity as subject")

    # R5 indefinite article on the subject
    if re.match(r"^\s*(?:(?:when|while|where|if|upon|given)\b[^,]*,\s*)?(a|an)\s+",
                statement, re.I):
        add("warn", "R5", "subject uses an indefinite article - use 'the'")

    # generic subject where an entity is declared
    if entity and entity.lower() != "system" and re.search(r"\bthe system\b", lower):
        add("info", "R3", "'the system' used although the entity is '%s'" % entity)

    # phrase rules
    for rule, severity, label, patterns in PHRASE_PATTERNS:
        for phrase, pattern in patterns:
            match = pattern.search(statement)
            if not match:
                continue
            sev = severity
            if rule == "R20" and is_need:
                # Needs legitimately carry purpose; the requirement they become
                # must not (see references/patterns.md).
                continue
            if rule == "R35" and phrase in TEMPORAL_SOFTENABLE:
                window = statement[max(0, match.start() - 40):match.end() + 40]
                if re.search(r"\d", window):
                    sev = "info"
            if rule == "R19" and phrase == "otherwise" and re.match(r"^\s*if\b", lower):
                continue
            emit(findings, rec, sev, rule, "%s: \"%s\"" % (label, phrase))

    # R16 negation
    for token, label in ((r"\bnot\b", "not"), (r"\bcannot\b", "cannot"),
                         (r"n't\b", "contraction of not")):
        if re.search(token, lower):
            add("warn", "R16", "negative obligation (%s) - restate positively, "
                               "usually as an If/then unwanted-behaviour requirement" % label)
            break

    # R18/R19 combinators after the obligation verb
    if action:
        for word in ("and", "or"):
            if re.search(r"(?<![\w-])%s(?![\w-])" % word, action, re.I):
                if re.search(r"\[[^\]]*\b(AND|OR|XOR|NOT)\b[^\]]*\]", statement):
                    break
                add("warn", "R19",
                    "'%s' joins clauses after 'shall' - likely two requirements" % word)
                break

    # R21 parentheses
    for match in re.finditer(r"\(([^)]*)\)", statement):
        inner = match.group(1)
        sev = "warn" if (len(inner.split()) > 5 or re.search(r"\bshall\b", inner, re.I)) else "info"
        emit(findings, rec, sev, "R21",
             "parenthetical text \"%s\" - move to notes: or into the sentence"
             % inner[:40])

    # R24 pronouns
    for word, pattern in PRONOUN_STRONG_PATTERNS:
        if pattern.search(statement):
            add("warn", "R24", "pronoun \"%s\" - name the entity" % word)
            break
    for word, pattern in PRONOUN_WEAK_PATTERNS:
        if pattern.search(statement):
            add("info", "R24", "demonstrative \"%s\" - check it has an unambiguous referent"
                % word)
            break

    # R17 oblique
    for match in re.finditer(r"(\w+)/(\w+)", statement):
        left, right = match.group(1).lower(), match.group(2).lower()
        if left in KNOWN_UNITS or right in KNOWN_UNITS or left.isdigit():
            continue
        add("info", "R17", "oblique in \"%s\" - state 'and', 'or', or split"
            % match.group(0))

    # R6 / R33 numbers, units, tolerance
    numbers = []
    for match in NUMBER_RE.finditer(statement):
        start, end = match.span()
        prefix = statement[max(0, start - 12):start].lower()
        if ORDINAL_RE.match(statement[start:end + 3]):
            continue
        if re.search(r"(code|http|version|level|type|id|step|section|iso|rev)\s*$", prefix):
            continue
        numbers.append(match.group(1))
        tail = statement[end:end + 24].strip().lower()
        unit = re.match(r"[%]|([a-z][a-z0-9'/]*)", tail)
        token = unit.group(0).strip("/'") if unit else ""
        if not token:
            add("info", "R6", "number %s has no unit" % match.group(1))
        elif token != "%" and token not in KNOWN_UNITS and token not in glossary[2]:
            add("info", "R6", "number %s followed by \"%s\" - confirm that is a declared unit"
                % (match.group(1), token))
    if numbers and not any(marker in lower for marker in TOLERANCE_MARKERS):
        add("info", "R33", "quantity stated without a bound or tolerance")

    # R37 acronyms
    for match in ACRONYM_RE.finditer(statement):
        acronym = match.group(1)
        if acronym in BUILTIN_ACRONYMS or acronym in meta["known-acronyms"]:
            continue
        if acronym.lower() in glossary[0]:
            continue
        add("warn", "R37", "acronym \"%s\" is not defined in glossary.md" % acronym)

    # R4 capitalised terms
    for match in CAP_TERM_RE.finditer(statement[1:]):
        term = match.group(1)
        if term.lower() in glossary[0] or term.lower() == entity.lower():
            continue
        add("info", "R4", "term \"%s\" is not defined in glossary.md" % term)

    # R12/R14 minimal form checks
    if not statement.rstrip().endswith("."):
        add("info", "R14", "statement does not end with a full stop")
    if statement[:1].islower():
        add("info", "R12", "statement does not start with a capital")
    if len(statement.split()) > 50:
        add("info", "R18", "%d words - long statements usually hide a second obligation"
            % len(statement.split()))


def check_attributes(rec, meta, findings):
    required = PROFILE_FIELDS[meta["profile"]]
    for field in required:
        if rec.get(field):
            continue
        if rec.is_need() and field.startswith("verification"):
            continue
        emit(findings, rec, "error", "A-min",
             "missing mandatory attribute '%s' (profile: %s)" % (field, meta["profile"]))

    if not rec.get("trace-to-parent") and not rec.get("trace-to-source"):
        emit(findings, rec, "error", "A2/A3",
             "no trace-to-parent and no trace-to-source")

    taxonomy = meta["taxonomy"]
    rec_type = rec.get("type")
    if taxonomy and rec_type and rec_type not in taxonomy and rec_type != "need":
        emit(findings, rec, "warn", "R29",
             "type '%s' is not in the declared taxonomy" % rec_type)

    method = rec.get("verification-method", "").lower()
    if method and method not in VERIFICATION_METHODS:
        emit(findings, rec, "warn", "A8",
             "verification-method '%s' is not one of %s"
             % (method, "/".join(sorted(VERIFICATION_METHODS))))

    status = rec.get("verification-status", "").lower()
    if status and status not in VERIFICATION_STATUSES:
        emit(findings, rec, "warn", "A28",
             "verification-status '%s' is not recognised" % status)

    validation = rec.get("validation-status", "").lower()
    if validation and validation not in VALIDATION_STATUSES:
        emit(findings, rec, "warn", "A29",
             "validation-status '%s' is not recognised" % validation)

    if rec.get("type") == "interface" and not rec.get("trace-to-interface"):
        emit(findings, rec, "warn", "A32",
             "interface requirement without trace-to-interface")

    criteria = rec.get("verification-criteria")
    if criteria and normalise(criteria) == normalise(rec.get("statement")):
        emit(findings, rec, "warn", "A6",
             "verification-criteria restates the requirement instead of stating "
             "an observation")

    for key, value in rec.fields.items():
        if re.search(r"\bTBD\b", value):
            emit(findings, rec, "warn", "TBD", "'%s' is TBD" % key)


def check_set(records, meta, findings):
    by_id = {}
    for rec in records:
        if rec.id in by_id:
            findings.append(Finding("error", "A15",
                                    "duplicate id (also at %s:%d)"
                                    % (by_id[rec.id].path, by_id[rec.id].line),
                                    rec.id, rec.path, rec.line))
            continue
        by_id[rec.id] = rec

    prefixes = tuple(meta["id-prefixes"])
    children = {}
    for rec in records:
        parents = [p.strip() for p in re.split(r"[,;]", rec.get("trace-to-parent"))
                   if p.strip()]
        for parent in parents:
            token = parent.split()[0]
            if not ID_RE.match(token):
                continue
            if not token.startswith(prefixes):
                continue
            if token not in by_id:
                emit(findings, rec, "error", "A2",
                     "trace-to-parent '%s' does not resolve to a record" % token)
                continue
            children.setdefault(token, []).append(rec.id)
            if token == rec.id:
                emit(findings, rec, "error", "A2", "traces to itself")

        for peer in [p.strip() for p in re.split(r"[,;]", rec.get("trace-to-peer"))
                     if p.strip()]:
            token = peer.split()[0]
            if ID_RE.match(token) and token.startswith(prefixes) and token not in by_id:
                emit(findings, rec, "warn", "A33",
                     "trace-to-peer '%s' does not resolve to a record" % token)

    # cycles
    state = {}

    def visit(node, stack):
        if state.get(node) == "done":
            return
        if state.get(node) == "open":
            findings.append(Finding("error", "A2",
                                    "trace cycle: %s" % " -> ".join(stack + [node]),
                                    node, by_id[node].path, by_id[node].line))
            return
        state[node] = "open"
        for parent in [p.strip().split()[0] for p in
                       re.split(r"[,;]", by_id[node].get("trace-to-parent")) if p.strip()]:
            if parent in by_id:
                visit(parent, stack + [node])
        state[node] = "done"

    for rec_id in by_id:
        visit(rec_id, [])

    # undischarged needs
    for rec in records:
        if rec.is_need() and not children.get(rec.id):
            emit(findings, rec, "warn", "C14",
                 "need has no child requirement - nothing discharges it")

    # R30 near-duplicates
    statements = [(rec, normalise(rec.get("statement"))) for rec in records
                  if rec.get("statement")]
    for i in range(len(statements)):
        for j in range(i + 1, len(statements)):
            rec_a, text_a = statements[i]
            rec_b, text_b = statements[j]
            if abs(len(text_a) - len(text_b)) > max(len(text_a), len(text_b)) * 0.4:
                continue
            if difflib.SequenceMatcher(None, text_a, text_b).ratio() >= 0.90:
                emit(findings, rec_b, "warn", "R30",
                     "near-duplicate of %s - express each requirement once" % rec_a.id)

    # R40 decimal format consistency
    styles = set()
    for rec in records:
        text = rec.get("statement")
        if re.search(r"(?<!\d)\.\d", text):
            styles.add("bare-point")
        if re.search(r"\d\.\d", text):
            styles.add("leading-zero")
        if re.search(r"\d,\d{1,2}(?!\d)", text):
            styles.add("comma-decimal")
    if len(styles) > 1:
        findings.append(Finding("warn", "R40",
                                "mixed decimal conventions across the set: %s"
                                % ", ".join(sorted(styles)), "", "", 0))
    return by_id


def emit(findings, rec, severity, rule, message):
    if rule.split("/")[0] in rec.waivers or rule in rec.waivers:
        return
    findings.append(Finding(severity, rule, message, rec.id, rec.path, rec.line))


# ---------------------------------------------------------------- coverage

TEST_EXTENSIONS = {
    ".py", ".js", ".ts", ".tsx", ".jsx", ".go", ".rs", ".java", ".kt", ".rb",
    ".cs", ".cpp", ".c", ".h", ".swift", ".php", ".sh", ".feature", ".md",
    ".yaml", ".yml", ".json", ".txt", ".sql", ".m", ".scala",
}


def scan_tests(test_paths, by_id, meta):
    hits = {rec_id: [] for rec_id in by_id}
    orphans = {}
    id_patterns = [(rec_id, re.compile(rec_id.replace("-", "[-_]"), re.I))
                   for rec_id in by_id]
    # An orphan is a token shaped like a real id that names no record. The shape is
    # prefix-CATEGORY-NNN. Matching a bare prefix plus one segment reported
    # "REQ-PER" as an orphan when a test asserted that string appeared in a
    # retention reason - prose, not a tag. A near-miss that is not id-shaped is text.
    generic = re.compile(r"\b(%s)[-_][A-Z]{3}[-_][0-9]{3}\b"
                         % "|".join(meta["id-prefixes"]), re.I)
    for root_path in test_paths:
        for path in walk_files(root_path):
            if os.path.splitext(path)[1].lower() not in TEST_EXTENSIONS:
                continue
            try:
                text = read_text(path)
            except OSError:
                continue
            for rec_id, pattern in id_patterns:
                if pattern.search(text):
                    hits[rec_id].append(path)
            for match in generic.finditer(text):
                token = match.group(0).upper().replace("_", "-")
                if token not in by_id:
                    orphans.setdefault(token, set()).add(path)
    return hits, orphans


def walk_files(root_path):
    if os.path.isfile(root_path):
        yield root_path
        return
    for dirpath, dirnames, filenames in os.walk(root_path):
        dirnames[:] = [d for d in dirnames
                       if d not in (".git", "node_modules", "__pycache__", ".venv",
                                    "dist", "build", ".tox", ".pytest_cache")]
        for name in filenames:
            yield os.path.join(dirpath, name)


def coverage_report(by_id, meta, hits, orphans):
    covered, uncovered, manual = [], [], []
    for rec_id, rec in sorted(by_id.items()):
        if rec.is_need():
            continue
        method = rec.get("verification-method", "").lower()
        if hits.get(rec_id):
            covered.append(rec_id)
        elif method in ("inspection", "analysis"):
            manual.append(rec_id)
        else:
            # test, demonstration, unset, or an unrecognised value: assume
            # automated coverage is expected rather than quietly excusing it.
            uncovered.append(rec_id)
    return {"covered": covered, "uncovered": uncovered, "not_automated": manual,
            "orphan_tags": sorted(orphans)}


# ---------------------------------------------------------------- output

def export_records(by_id, hits, meta, with_tests):
    """Every record as plain data, for a consumer that must not re-parse the format.

    `--json` reports on the set; this emits the set. Fields are verbatim, so a
    consumer sees exactly what the file says. `tests` is present only when --tests
    was given, and is empty rather than absent when a record has no test.

    Callers must gate on the lint threshold before calling this: duplicate ids are
    dropped from `by_id` by design, so a set with errors holds fewer records than
    the files contain.
    """
    out = []
    for rec_id in sorted(by_id):
        rec = by_id[rec_id]
        item = {
            "id": rec.id,
            "name": rec.name,
            "file": os.path.basename(rec.path),
            "line": rec.line,
            "fields": dict(rec.fields),
        }
        if rec.waivers:
            item["waivers"] = sorted(rec.waivers)
        if with_tests:
            item["tests"] = sorted(set(os.path.basename(p)
                                       for p in hits.get(rec_id, [])))
        out.append(item)
    return {
        "profile": meta["profile"],
        "entity": meta.get("entity", ""),
        "count": len(out),
        "records": out,
    }


def render_matrix(by_id, hits, meta):
    def value(rec, key):
        return rec.get(key) or "-"

    lines = ["# Trace matrix",
             "",
             "Generated by lint_requirements.py - do not hand-edit.",
             "",
             "| Requirement | Name | Parent | Source | Method | Status | Verified by |",
             "|---|---|---|---|---|---|---|"]
    for rec_id, rec in sorted(by_id.items()):
        tests = ", ".join(sorted(set(os.path.basename(p) for p in hits.get(rec_id, []))))
        lines.append("| %s | %s | %s | %s | %s | %s | %s |" % (
            rec_id, rec.name or "", value(rec, "trace-to-parent"),
            value(rec, "trace-to-source"),
            "-" if rec.is_need() else value(rec, "verification-method"),
            "-" if rec.is_need() else value(rec, "verification-status"),
            tests or "-"))
    return "\n".join(lines)


def render_text(findings, by_id, files, coverage, meta):
    out = []
    grouped = {}
    for finding in findings:
        grouped.setdefault(finding.path or "(set)", []).append(finding)
    order = {"error": 0, "warn": 1, "info": 2}
    for path in sorted(grouped):
        out.append(path)
        for finding in sorted(grouped[path],
                              key=lambda f: (order[f.severity], f.line, f.rule)):
            out.append("  %-5s %-6s %-14s %s" % (finding.severity, finding.rule,
                                                 finding.rec_id or "-", finding.message))
        out.append("")
    counts = {sev: sum(1 for f in findings if f.severity == sev) for sev in SEVERITIES}
    out.append("Set: %d records in %d files, profile '%s', path '%s'"
               % (len(by_id), files, meta["profile"], meta.get("path") or "undeclared"))
    out.append("Findings: %d error, %d warn, %d info"
               % (counts["error"], counts["warn"], counts["info"]))
    if coverage is not None:
        out.append("Coverage: %d covered, %d uncovered, %d not automated, %d orphan tags"
                   % (len(coverage["covered"]), len(coverage["uncovered"]),
                      len(coverage["not_automated"]), len(coverage["orphan_tags"])))
        if coverage["uncovered"]:
            out.append("  uncovered: " + ", ".join(coverage["uncovered"]))
        if coverage["orphan_tags"]:
            out.append("  orphan tags: " + ", ".join(coverage["orphan_tags"]))
    out.append("")
    out.append("Rule conformance only. Necessity, feasibility, and set completeness "
               "need the judgement pass (references/characteristics.md).")
    return "\n".join(out)


# ---------------------------------------------------------------- main

def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Lint an INCOSE-style requirement set.")
    parser.add_argument("path", help="requirements directory (or a single .md file)")
    parser.add_argument("--tests", action="append", default=[],
                        help="directory or file to scan for requirement-ID test tags "
                             "(repeatable)")
    # --matrix and --export-records both print one thing and exit, so passing both
    # can only mean one was a mistake. argparse refuses rather than picking silently.
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument("--matrix", action="store_true",
                       help="print the trace matrix as markdown and exit")
    modes.add_argument("--export-records", action="store_true", dest="export_records",
                       help="print every record as JSON and exit, so a consumer reads "
                            "the set without writing a second parser. Refuses when the "
                            "set does not lint")
    parser.add_argument("--json", action="store_true", dest="as_json",
                        help="print findings as JSON. Ignored when --matrix or "
                             "--export-records is given, since those exit first")
    parser.add_argument("--fail-on", choices=SEVERITIES, default="error",
                        help="minimum severity that sets a non-zero exit code "
                             "(default: error)")
    parser.add_argument("--rule", action="append", default=[],
                        help="only report these rules (repeatable)")
    args = parser.parse_args(argv)

    if not os.path.exists(args.path):
        sys.stderr.write("no such path: %s\n" % args.path)
        return 2

    findings = []
    if os.path.isdir(args.path):
        directory = args.path
        md_files = sorted(os.path.join(directory, n) for n in os.listdir(directory)
                          if n.endswith(".md") and n not in ("_meta.md", "glossary.md",
                                                             "README.md", "TRACE.md"))
    else:
        directory = os.path.dirname(args.path) or "."
        md_files = [args.path]

    meta = parse_meta(directory, findings)
    glossary = parse_glossary(directory)

    records = []
    for path in md_files:
        records.extend(parse_records(path, findings))

    if not records:
        sys.stderr.write("no requirement records found in %s\n" % args.path)
        sys.stderr.write("expected headings like '### REQ-FUN-001 - name' "
                         "(see references/record-format.md)\n")
        return 2

    for rec in records:
        waiver = rec.get("lint-waiver")
        if waiver:
            rec.waivers = set(re.findall(r"\b([RAC]\d+|TBD)\b", waiver.upper()))

    by_id = check_set(records, meta, findings)
    for rec in records:
        check_statement(rec, meta, glossary, findings)
        check_attributes(rec, meta, findings)

    if args.rule:
        wanted = set(r.upper() for r in args.rule)
        findings = [f for f in findings if f.rule.upper() in wanted]

    coverage = None
    hits = {rec_id: [] for rec_id in by_id}
    if args.tests:
        hits, orphans = scan_tests(args.tests, by_id, meta)
        coverage = coverage_report(by_id, meta, hits, orphans)

    if args.matrix:
        print(render_matrix(by_id, hits, meta))
        return 0

    if args.export_records:
        # Fail closed. A consumer builds from this, so a set the linter rejects
        # must not export at all: duplicate ids are dropped from by_id by design,
        # so the export would be silently short a record while reporting success.
        worst = max([SEVERITIES.index(f.severity) for f in findings], default=-1)
        if worst >= SEVERITIES.index(args.fail_on):
            counts = {sev: sum(1 for f in findings if f.severity == sev)
                      for sev in SEVERITIES}
            sys.stderr.write(
                "refusing to export: %d error, %d warn, %d info "
                "(--fail-on=%s)\n"
                "the export feeds a builder, so a set that does not lint is not "
                "exported.\n"
                "run without --export-records to see the findings.\n"
                % (counts["error"], counts["warn"], counts["info"], args.fail_on))
            return 1
        print(json.dumps(export_records(by_id, hits, meta, bool(args.tests)),
                         indent=2))
        return 0

    if args.as_json:
        print(json.dumps({
            "profile": meta["profile"],
            "records": len(by_id),
            "findings": [f.as_dict() for f in findings],
            "counts": {sev: sum(1 for f in findings if f.severity == sev)
                       for sev in SEVERITIES},
            "coverage": coverage,
        }, indent=2))
    else:
        print(render_text(findings, by_id, len(md_files), coverage, meta))

    threshold = SEVERITIES.index(args.fail_on)
    worst = max([SEVERITIES.index(f.severity) for f in findings], default=-1)
    return 1 if worst >= threshold else 0


if __name__ == "__main__":
    sys.exit(main())
