# NEXT — Goal Bingo

_Convention: update at end of each working session. The weekly portfolio review reads it._

## Current focus

**Link 5 — build WP-01.** Work items #29–#31 filed under [WP-01](https://github.com/goatindex/goal-bingo/issues/18).
Scaffolding the Vite PWA shell (`app/`) with local persistence and thumb-zone chrome.

## Next up

- **Merge the WP-01 shell PR** once review passes.
- **Close #29–#31** against that PR; then move to [WP-02 Goal pool](https://github.com/goatindex/goal-bingo/issues/19).
- **First shippable slice:** WP-01 → WP-05 (#18–#22).
- **Settle link-4 decisions when blocked:** category-unlock gate (`D-2026-09-19-16`),
  advanced-tile thresholds (`D-2026-09-19-23`).

## Done means

WP-01 is done when #29–#31 acceptance criteria pass and the installable offline shell is
on `main`. Link 5 continues with WP-02.

## Done (2026-09-20 session)

- **Link 3 complete.** Requirements mined and gap-closed: PRs #16, #17. Glossary pins board
  balance / reward balance. Soft floor + expansion + failure modes (D-2026-09-20-1…5).
- **Requirement set baselined** as v1.0 (2026-09-20) in `requirements/_meta.md`.
- **Link 4 cut complete.** `work-packages/cut.md` + `scripts/partition_check.py` — 84 live
  requirements in exactly 10 packages; issues #18–#27 with blocked-by order (PR #28).
- **Link 5 started on WP-01.** Work items #29 (PWA scaffold), #30 (local store + soft
  reset), #31 (thumb chrome + scope guards). Stack: Vite + TypeScript (`D-2026-09-20-6`).
- **Found and fixed a backslash-escape corruption bug in `ba-issue`.** 13 filed issues
  (#18–#27, #29–#31) had silently mangled bodies — a bare backslash used as a path
  delimiter (`\requirements\constraints.md\`) got eaten by whatever step wrote the draft
  (any shell/language step that reinterprets `\a \b \f \n \r \t \v`), dropping the letter
  after it with no error. Caught only because a rendered issue was read by eye. Root cause
  fixed and all 13 bodies repaired.
- **`ba-issue` hardened to v0.5** in `goatindex/claude-workflow` (PRs #23, #24, both
  merged): `references/check_draft.py` gates every draft for this corruption class before
  filing; `references/dor_check.py` mechanically checks half the Definition of Ready
  (sections present/ordered, criteria tagged, no banned words including inflected forms,
  context-pointer paths and cited decision IDs verified against the actual checkout, size
  carries the escape hatch) so the remaining judgment lines are the only ones an agent
  still reads by eye. Vendored into this repo (PR #36): `.github/workflows/
  issue-corruption-check.yml` now scans every opened/edited issue regardless of what
  filed it.
- **Audited whether the other requirement lints run anywhere, not just on demand.**
  `backmap_check.py`, `lint_requirements.py` (INCOSE GtWR, never before run against this
  requirement set — 0 errors but 160 warnings, mostly R1 pattern mismatches worth a look),
  `partition_check.py`, and `check_scope_exclusions.py` all currently pass clean but none
  were wired into CI. Wiring them in as `requirement-checks.yml` — in progress.

## Parked

- Repo hygiene the other projects have and this one does not yet: docs lint gate, issue
  labels and forms. Worth adding before the first build work, not before the requirements
  exist. (Branch protection is unavailable on a private repo under the current plan — F-36;
  the session hook is what enforces branch-and-PR here.)
- Whether the reviewer's **sticky summary** is worth chasing. Its prompt says to always post
  one; on the first real run it posted an inline finding and left the review body empty. The
  workflow's verification step passes on the *existence* of a review, not its content, so a
  summary-less review reads as green. Fixing it means changing the master in
  `goatindex/claude-workflow`, which affects every consumer — not a goal-bingo decision.
- **Mine the prototype before building.** `v1-phaser-prototype` has working Phaser scene
  management, a layout manager, a UI container and an audio system. Its *game* is not this
  game (`D-2026-09-19-5`), but that scaffolding is real and reading it is cheaper than
  rediscovering it.
- Local clutter left behind by the old build: `godot-mcp/` (a separate 32M third-party
  tool, untracked and left alone), plus ignored `node_modules/`, `test-results/`,
  `playwright-report/` and `tests/`. Clear them whenever; nothing depends on them.
- Whether this project gets a `project-tracking` hub entry alongside the other projects.
- **Adversarial reviewer efficiency** — PR #13 (78 lines of markdown) hit the 50-turn
  ceiling and had to be re-run. Root cause is in `goatindex/claude-workflow`, not here.
  The turn limit (50) was calibrated against a broken run with 11 denied tool calls before
  `allowedTools` was added; healthy runs complete in 15–25 turns and 50 is now 1 turn of
  headroom over a broken baseline. Additionally, Part 1 of the review prompt (failure modes
  1–3) only applies to code PRs — on a documentation-only PR the reviewer wastes 15–20
  turns searching for tests and CI gates that do not exist. Filed as `TB-45` in the hub.
  Fix: raise `--max-turns` to 75; add a doc-only shortcut skipping Part 1 items 1–3.

## Done (2026-09-19 session)

**Late evening — design complete: 12 more questions closed (PRs #11, #12, #13):**

- **D-18 — §9.2 local-first** finalised and §9.2 cited (PR #11).
- **Q8, Q12, Q15, Q16 closed; Q11 partially closed** (D-19 through D-23, PR #12):
  - Combos: matching (all same category) and variety (all different); multipliers tuning
  - No sync in first release; local storage only; deliberately deferred
  - Swap = consolidation; adjacent-only base game; upgrades expand range
  - Advanced tile acquisition: per-category progression primary, economy secondary; global
    unlocks additive on top
  - Mini-grid clearing mechanic confirmed: one internal line = parent tile cleared
- **Q11 fully closed; Q23 closed** (D-24, D-25, PR #13):
  - Mini-grid population: same pool default; sub-pool and player-placed as upgrade options
  - Mini-grid scoring: normal clear; full-board bonus if last tile on main board
  - Ambient blocking: fixed percentage at every grid size; expansion scales proportionally
- **25 decision records on record** (D-2026-09-19-1 through D-2026-09-19-25). All
  non-tuning questions closed. Design document is complete.

**Evening continuation — pre-link-3 questions and missing records (PRs #7, #8, #9, #10):**

- **Q2/Q3/Q4/Q14 closed** — four §3.4 questions answered in one design conversation;
  three decision records written (D-13, D-14, D-15); §3.4 rewritten from open-questions
  prose to settled rules (PR #7, adversarial review passed).
  - Diagonals count as lines; simultaneous completion resolves every line with bonus points
  - Intersection cell is the visual focal point and multi-clear bonus anchor
  - Perpendicular progress is lost; compensation is a designated upgrade area (sim's Q14
    assumption confirmed — Q24 narrowed to swap and challenge-income assumptions only)
- **Q5 and Q18 closed, §4.2 missing D- record written** (PR #8, review running):
  - Categories are player-defined from day one; seven defaults ship — `health`, `study`,
    `creative`, `volunteering`, `relationship`, `home`, `work`; further categories unlock
    through progression (D-16). *Creative* replaces the original *hobby* placeholder.
  - Challenges: three types (universal, category, cadence) run in parallel; a mark counts
    toward every challenge it qualifies for simultaneously; the universal challenge is the
    coverage guarantee; rates are tuning (D-17). Category challenges unlock with their
    category — one mechanic, not two.
- **§9.2 missing D- record written** — local-first, no account required; sync deferred to
  Q12 (D-18, PR #9, review running).

**Earlier in the day — cadence taxonomy and simulation (PRs #1–6; all merged):**

- **Intake:** new work, entering at link 1 and taking the full chain. Impact: requirements
  none, work packages none — an earlier Phaser prototype existed in this repo but had
  entered no chain link, so there was no requirement or work package to affect. Recorded as
  new work superseding unchained code, not as a change (`D-2026-09-19-5`).
- Cleared `goatindex/goal-bingo` to design stage. The prototype is preserved at tag
  `v1-phaser-prototype` and in history; nothing was force-pushed or rewritten.
- **Link 1 — decisions.** Five records in `DECISIONS.md`: mobile-first PWA
  (`D-2026-09-19-1`), marks persist until the line clears (`D-2026-09-19-2`), long-term
  goals block by design with advanced tiles as the later release valve (`D-2026-09-19-3`),
  the design description covering the full vision with the cut deferred to link 4
  (`D-2026-09-19-4`), and restarting rather than evolving the prototype
  (`D-2026-09-19-5`).
- **Link 2 — framing.** Wrote `docs/design-description.md`: 36 numbered sections, 12
  carrying explicit `requirements: none` declarations, 16 open questions registered rather
  than guessed at.
- **Link 6 — review.** An adversarial review of the design found eight substantive defects,
  all fixed on the branch before merge. The important one: §10.3's risk analysis was wrong.
  It named board jam as the central risk and claimed three guards, but two of the three do
  not hold — the grid-aware draw is preventive only and cannot run on an already-jammed
  board, and advanced tiles are not present at first release by decision. The real worst
  case is an **economic trap**: balance is earned only by clearing, so a jammed board earns
  nothing and cannot pay for the power-ups that would unjam it.
- **Q13 answered, same session.** Two decisions close it (`D-2026-09-19-6`,
  `D-2026-09-19-7`). The key observation is that **marking still works on a jammed board;
  only clearing stops** — so board balance is fed by mark-based challenges and cannot be
  switched off by a jam, while personal rewards spend from a separate budget. Beneath that
  sits a free recycle: one per 24 hours, upgradeable, so an action exists even at zero. Side
  effects: the tile power-up is renamed *recycle*, challenges are now constrained to be
  mark-based rather than clear-based, and the game gains its first timer (an allowance
  refreshing, not a mark decaying — `D-2026-09-19-2` stands).
- **Two further review passes on the fix**, both finding real defects. Pass 2: challenges
  might never pay during a jam, and a recycle might hand back another blocker — closed by
  `D-2026-09-19-8`, `D-2026-09-19-9` and `D-2026-09-19-10`. Pass 3: §4.4 stated the
  load-bearing placement rule as a *preference* while §6.2 and §10.3 restated it as an
  *absolute*, and board balance was not actually guaranteed because it pays only on a mark
  counting toward a challenge. Both closed. Findings narrowed across the three passes from a
  wrong risk model, to unstated assumptions, to statement-strength precision.
- **Both design PRs merged**, each carrying its review record as a comment, each using the
  documented `GUARD_ALLOW_UNREVIEWED=1` exception because this repo had no reviewer workflow
  at the time.
- **Link 6 — the reviewer is adopted** (PR #4). The house `adversarial-review` workflow
  rather than WeeWoo's `claude-review.yml`, which is tuned to WeeWoo's own issue contract;
  the house one holds no repository-specific convention and reads this repo's `CLAUDE.md`
  instead. Taken as a generated copy through master-and-copy — `copies.txt`,
  `scripts/refresh_copies.py`, `--check` clean. `CLAUDE_CODE_OAUTH_TOKEN` is set. PR #4's own
  check failed by design, because `claude-code-action` refuses to run on a pull request that
  adds its own workflow file, so that merge took the last recorded
  `GUARD_ALLOW_UNREVIEWED=1`.
- **Added `CLAUDE.md`**, which the reviewer reads for conventions — recording what the three
  review passes actually caught rather than generic advice.
- **Smoke-tested on PR #5** and the reviewer posted a real inline finding, which was acted
  on. The exception should not be needed again.
- **Cadence taxonomy.** Goals now sit on two independent axes: category (theme — health,
  study, ...) and cadence (rhythm — hourly, daily, weekly, long-term). The three recurring
  tiers are what the document calls "short-term"; long-term stays the one-off blocker
  (`D-2026-09-19-11`).
- **Built `sim/jam_sim.py`** to answer Q20 without a UI: a headless model of the board,
  weighted draw, recycle rules, and four player behaviours, standard library only. Results
  in `sim/results.md`. **Q20 closed**: the recovery floor breaks a maximal jam same-day at
  median, p99 one to two days, zero unresolved trials across every setting tested — the
  reserved tightening turned out not to be needed.
- **The simulation found a risk nobody had asked about.** Full jams are rare, as `D-3`
  predicted, but the long-term draw share governs *chronic partial blocking* — the share of
  lines constrained by an unmarked long-term goal at any moment — almost independent of
  player behaviour, ranging 28% to 75% across the values tested. This makes the draw share
  the single most load-bearing number for how the game feels. Set to ~5%
  (`D-2026-09-19-12`), targeting ~45–50% ambient blocking, after being put to a decision
  rather than left at the simulation's arbitrary starting default. §10.4 records the finding
  and the choice; four new questions (Q21–Q24) came out of building the instrument.

## Last updated

2026-09-20
