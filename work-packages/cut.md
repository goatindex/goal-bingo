# Work-package cut — Goal Bingo (link 4)

**Status:** draft cut · **Baselined requirements:** v1.0 (2026-09-20)
**Rule:** every live requirement appears in exactly one package. Deleted IDs are excluded.
**Authoritative home:** GitHub issues (C4-1). This file is the partition source the check
reads; issue bodies mirror it. Package IDs are disposable.

| Package | Issue |
|---------|------:|
| WP-01 | #18 |
| WP-02 | #19 |
| WP-03 | #20 |
| WP-04 | #21 |
| WP-05 | #22 |
| WP-06 | #23 |
| WP-07 | #24 |
| WP-08 | #25 |
| WP-09 | #26 |
| WP-10 | #27 |
| WP-11 | #158 |

Build-order dependencies are native issue blocked-by links (C4-2).

## Build order

| Order | Package | Blocks | Demonstrable outcome |
|------:|---------|--------|----------------------|
| 1 | WP-01 Platform shell | — | Installable PWA; offline; local data; soft-reset |
| 2 | WP-02 Goal pool | WP-01 | Edit pool; seven categories; cadences; empty-pool prompt |
| 3 | WP-03 Board loop | WP-02 | Mark, clear rows/cols/diags, refill cells |
| 4 | WP-04 Draw engine | WP-03 | Weighted refill; binding placement rules; ~5% long-term |
| 5 | WP-05 Scoring & ledgers | WP-03 | Three counters; combos; adjacency config hook |
| 6 | WP-06 Challenges & board income | WP-05 | Mark pays board balance; jam-surviving income |
| 7 | WP-07 Economy actions | WP-06 | Rewards spend; recycle/swap/expand; free allowance |
| 8 | WP-08 Advanced tiles | WP-07 | Multi-completion + mini-grid |
| 9 | WP-09 Record & discovery | WP-05 | Stats + achievements |
| 10 | WP-10 Floor constraints | WP-07 | Soft floor / expansion principle verified by sim |
| 11 | WP-11 Presentation pass | WP-08 | Hold to mark, clear moment, category cue, advanced-tile setting, light and dark |

First shippable slice: **WP-01 → WP-05** (playable bingo with scoring, no economy).
Recovery-critical slice adds **WP-06 → WP-07**.

## Packages

### WP-01 — Platform shell
GB-CON-001, GB-CON-002, GB-CON-003, GB-CON-004, GB-CON-009, GB-CON-010, GB-CON-011,
GB-DAT-001, GB-DAT-002, GB-DAT-003, GB-FUN-066

### WP-02 — Goal pool
GB-FUN-016, GB-FUN-017, GB-FUN-018, GB-FUN-019, GB-FUN-020, GB-FUN-021, GB-FUN-065,
GB-FUN-067

### WP-03 — Board loop
GB-FUN-001, GB-FUN-002, GB-FUN-005, GB-FUN-006, GB-FUN-007, GB-FUN-008, GB-FUN-009,
GB-FUN-010, GB-FUN-011, GB-FUN-012, GB-FUN-013, GB-FUN-014, GB-FUN-015

### WP-04 — Draw engine
GB-FUN-022, GB-FUN-023, GB-FUN-024, GB-FUN-026, GB-FUN-027

### WP-05 — Scoring & ledgers
GB-FUN-003, GB-FUN-028, GB-FUN-029, GB-FUN-030, GB-FUN-031, GB-FUN-032, GB-FUN-033,
GB-FUN-034, GB-FUN-034b, GB-FUN-035, GB-FUN-068, GB-CON-005, GB-CON-006, GB-CON-007

### WP-06 — Challenges & board income
GB-FUN-004, GB-FUN-055, GB-FUN-056, GB-FUN-057, GB-FUN-058, GB-FUN-059, GB-FUN-060,
GB-FUN-061, GB-FUN-062, GB-CON-012

### WP-07 — Economy actions
GB-FUN-036, GB-FUN-037, GB-FUN-038, GB-FUN-039, GB-FUN-041, GB-FUN-042, GB-CON-008

### WP-08 — Advanced tiles
GB-FUN-043, GB-FUN-044, GB-FUN-045, GB-FUN-046, GB-FUN-047, GB-FUN-048, GB-FUN-049,
GB-FUN-050

### WP-09 — Record & discovery
GB-FUN-051, GB-FUN-052, GB-FUN-053, GB-FUN-054, GB-FUN-063, GB-FUN-064

### WP-10 — Floor constraints
GB-CON-013, GB-CON-014

### WP-11 — Presentation pass
GB-FUN-069, GB-FUN-070, GB-FUN-071, GB-FUN-072, GB-FUN-073, GB-FUN-074, GB-FUN-075,
GB-FUN-076, GB-FUN-077, GB-FUN-078, GB-FUN-079, GB-FUN-080, GB-FUN-081, GB-FUN-082,
GB-FUN-083, GB-FUN-084, GB-FUN-085, GB-FUN-086

## Excluded (deleted)

GB-FUN-025, GB-FUN-040

## Check

```bash
python scripts/partition_check.py --requirements requirements/ --cut work-packages/cut.md
```
