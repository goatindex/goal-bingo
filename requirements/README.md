# Requirements — Goal Bingo

**Version:** 1.0 (baselined 2026-09-20 — link 3 complete)
**Entity:** Goal Bingo (the PWA application)
**Path:** shortcut — requirements trace to `docs/design-description.md` section numbers.
  The set is verifiable but not independently validatable; there is one stakeholder.

## Files

| File | Contents |
|---|---|
| `_meta.md` | Set-level metadata, profile, taxonomy, defaults |
| `glossary.md` | Defined terms, acronyms, units |
| `functional.md` | Core loop, grid, goals, scoring, economy, progression, platform |
| `constraints.md` | Platform, data, and scope constraints |

## How to use

- Every `shall` statement is an obligation on **Goal Bingo** (the app) unless it names a
  sub-element explicitly (e.g. "the draw algorithm").
- IDs are permanent. A deleted requirement keeps its block with `status: deleted`.
- `trace-to-source` values are `design-description.md §N.M`.
- Verification status starts `not-verified`; build agents update it as tests pass.

## Linting

```bash
python C:\Users\Kirk\.claude\skills\incose-requirements\scripts\lint_requirements.py requirements/
```

## Baseline

**Baselined 2026-09-20** as version 1.0. Statement changes after this date bump the set
version and reset affected verification status. Attribute-only updates stay free.
