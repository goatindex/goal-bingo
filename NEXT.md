# NEXT — Goal Bingo

_Convention: update at end of each working session. The weekly portfolio review reads it._

## Current focus

**Link 5 — build WP-03 (board loop).** WP-01 (platform shell, #18) and WP-02 (goal pool,
#19) are both closed. WP-03 is [#20](https://github.com/goatindex/goal-bingo/issues/20),
broken into four sub-issues: [#63](https://github.com/goatindex/goal-bingo/issues/63) board
model (closed, PR #67), [#64](https://github.com/goatindex/goal-bingo/issues/64) marking
(closed, PR #69), [#65](https://github.com/goatindex/goal-bingo/issues/65) single-line
clear (next), [#66](https://github.com/goatindex/goal-bingo/issues/66) multi-line clear.

## Next up

- **Pick up #65 (single-line clear)** — `markCell` (`app/src/board.ts`) and `drawGoal`
  (`app/src/pool.ts`) both already exist; this issue detects a completed row/column/
  diagonal and calls the pool's existing draw to refill, surfacing the empty-pool prompt
  path (`app/src/shell.ts`'s `emptyPoolPrompt`) rather than leaving a cell unfilled.
- **First shippable slice:** WP-01 → WP-05 (#18–#22); two of five packages closed.
- **Flip `standing_check` to blocking** in `.github/workflows/record-checks.yml` — its
  owner/verification-status gap is closed (verified: `record_index.py`/`standing_check.py`
  both report 0 problems). `decision_lint` is also clean now (34/34 entries conform,
  fixed 2026-09-20/21) — both checks are ready to flip; nothing is blocking it anymore.
- **Settle link-4 decisions when blocked:** category-unlock gate (`D-2026-09-19-16`),
  advanced-tile thresholds (`D-2026-09-19-23`).
- **Scope the `record-contract` `standing` default fix (chain-wide, not goal-bingo-only).**
  `RECORD-CONTRACT.md`'s `standing` field still defaults to `active` when absent — the same
  "absence read as default" shape the owner/verification-status migration above just closed
  for requirements. Confirmed in scope ("this is a rule for our ways of working and chain,
  always"), not yet scoped: ~220+ records across every repo carrying decisions/requirements/
  to-be items (this repo, `project-tracking`, `weewoo`, `live-action-intel`). Larger blast
  radius than the requirements fix; needs its own pass, not a rushed one.

## Done means

WP-03 is done when its acceptance criteria pass and the board loop is on `main`. Link 5
continues with WP-04.

## Done (2026-09-21 session)

- **#64 (marking) built and merged** (PR #69): `markCell(board, index)` in
  `app/src/board.ts` — pure, synchronous, takes only the flat index a tap identifies, so
  nothing is possible to gate behind a network call or permission check; marking an
  already-marked cell returns the same board reference (no-op). Extracted `MemoryStorage`
  from `storage.test.ts` into a shared `app/src/test-support.ts` for the second test file
  that needed the same in-memory `Storage` fake. 5 new tests, 29/29 passing.
- **Resolved WP-03's two blocking TBDs** (PR #62): `GB-FUN-005` starting grid 5x5,
  expansion verified through 7x7 (`D-2026-09-20-8`, grounded in `sim/jam_sim.py`'s own A4
  sensitivity run rather than an invented number); `GB-FUN-013` multi-clear bonus is 50% of
  the summed base score of the clearing lines (`D-2026-09-20-9`), decoupled from Q7's
  still-open base point values.
- **Fixed 5 pre-existing `decision_lint` gaps** (`D-2026-09-19-13/16/17/19/22`), found while
  landing the above rather than reached past with the preflight-skip override. 3 were pure
  field-name mismatches against the linter's accepted-variant regex (`Options considered
  for Q2` → `Options considered (Q2)`, `Why — purpose` → `Why (purpose)`, etc., no content
  change); 2 genuinely had no `Why` field and got one synthesized from reasoning already
  present elsewhere in the same entry. `decision_lint`: 34/34 entries conform.
- **Filed WP-03's four sub-issues** (#63–#66) via `ba-issue`, DoR-checked and clean: board
  model, marking, single-line clear, multi-line clear (bonus/visual/perpendicular-loss
  split out separately since it only applies once multi-clear exists).
- **#63 built and merged** (PR #67): `app/src/board.ts` — `Board`/`Cell` types (row-major
  flat array), `createBoard` (fills every cell from the pool, refuses on empty pool),
  `resizeBoard` (keeps existing cells and marks in the top-left of the new grid on growth;
  rejects an unsupported size at runtime, not just via the type system). Wired
  `GameState.board` in `app/src/storage.ts` from `unknown | null` to a real, non-nullable
  `Board` — `freshState()` now builds a live board, `isGameState` actually validates it
  (previously unvalidated), and the WP-01/WP-02 legacy-migration path builds a fresh board
  instead of carrying forward a value that could never satisfy GB-FUN-007. 10 new tests,
  24/24 passing, clean typecheck. Flagged for review, not decided silently: on grid growth,
  existing tiles stay in the top-left sub-grid rather than being centered — not specified
  by any requirement, a reasonable default.

## Done (2026-09-20 session)

- **Package A smoke finished** (PR #50, credits restored): concurrency/this-run verification/HEAD merge-gate all exercised. First review green with trailer; second push denied by gate while IN_PROGRESS then green after delta re-review. Known follow-up: first-round `Reviewed-Commit` sometimes names a SHA that is not HEAD (second round fell back correctly).

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
  were wired into CI. Wired in as `.github/workflows/requirement-checks.yml` (PR #37,
  merged) — runs all four on every PR touching `requirements/`,
  `docs/design-description.md`, `work-packages/`, or `app/src/`.
- **`ba-issue` hardened to v0.6** (`goatindex/claude-workflow` PR #25): `check_draft.py`
  and `dor_check.py` both gained a `--json` flag matching `lint_requirements.py`'s
  `{file, findings, counts}` convention, so a CI workflow or another agent can consume
  results precisely instead of scraping prose.
- **Fixed the fragile single-backtick-wrapped requirement-ID list** in all 10 WP issues
  (#18–#27) — `` `\nGB-CON-001, ...\n` `` (a multi-line code span, not a real fence) became
  a proper ```` ```text ```` fenced block. Harder to corrupt, directly machine-parseable.
  Repo-wide corruption rescan clean afterward.
- **`decision-log` and `record-contract` CI wiring merged (PR #39).** `disposal_check`,
  `provenance_check`, `record_index` pass clean and are blocking; `decision_lint` and
  `standing_check` found real pre-existing gaps (5 decisions missing a required field, and
  — see above — every requirement lacking `verification-status`) so they run non-blocking
  until that data is fixed.
- **Repaired 108 mojibake em-dash/en-dash sequences** in `requirements/constraints.md` and
  `functional.md` (PR #40, merged): double-encoded (UTF-8 written, read as cp1252,
  re-encoded) so the files literally held three characters where one dash belonged. Broke
  `record_index.py`'s heading match, which enumerated 12 of 85 requirements —
  `standing_check` was silently checking 14% of the set. Repaired deterministically (exact
  inverse re-encode, verified byte-for-byte); both checkers now agree on 85. Checked in
  `scripts/fix_mojibake.py` as both the repair tool and a reusable detector.
  - Took four review rounds to land — a genuine case study in the estate's own "verify,
    don't trust" doctrine, in both directions. Rounds 1–3 each caught something real
    (missing `NEXT.md` entry, an "em-dash" claim that ignored 3 en-dashes, and — the
    sharpest one — `fix_mojibake.py` itself silently reporting a nonexistent path as
    "clean," the exact absence-reads-as-success shape it exists to catch elsewhere; fixed
    to exit 2 distinctly). Round 4 raised a *fourth*, plausible-sounding blocking finding
    (the detection regex supposedly missing the corruption's own leading character) that
    did not survive a byte-level check: the regex was correct, the reviewer had misread an
    invisible C1 control character in its own source as a literal hyphen. Verified with a
    byte dump and a live run against real corruption bytes before disputing it in place and
    merging without the fix — the reviewer is advisory, this is what that's for.
- **Found and fixed two real bugs in the reviewer's own workflow**, surfaced by that same
  PR #40 saga:
  - **The summary tool was structurally broken** (`goatindex/claude-workflow#28`):
    `use_sticky_comment: true` was a silent no-op because this workflow always runs in
    "agent mode" (an explicit `prompt:` triggers it), and agent mode has no tracking
    comment by design — the summary tool could never succeed, not intermittently, on every
    run. Cost four failed review attempts and ~$3.50 on PR #40 before being root-caused by
    isolating the PR's own content in a throwaway duplicate. Its own fix PR then caught
    itself carrying drift in `claude-workflow`'s own live copy of the same workflow, and a
    non-blocking gap in the heredoc delimiter — both fixed in the same PR.
  - **The turn ceiling was too low for a PR under active review** (`TB-45`,
    `goatindex/claude-workflow#29`): `--max-turns 50` was calibrated as headroom over a
    broken 2026-09-08 baseline, but cost compounds with review-*round* count, not diff
    size — every round re-verifies its claims from scratch. PR #40's third round hit 63
    turns and failed outright, losing a real finding rather than just wasting a run.
    Raised to 75.
  - Both fixes synced into every consumer repo (`goal-bingo`, `project-tracking`); all
    three repos verified drift-clean afterward. Resolves the "sticky summary" item
    previously parked below.

## Parked

- Repo hygiene the other projects have and this one does not yet: docs lint gate, issue
  labels and forms. Worth adding before the first build work, not before the requirements
  exist. (Branch protection is unavailable on a private repo under the current plan — F-36;
  the session hook is what enforces branch-and-PR here.)
- **Mine the prototype before building.** `v1-phaser-prototype` has working Phaser scene
  management, a layout manager, a UI container and an audio system. Its *game* is not this
  game (`D-2026-09-19-5`), but that scaffolding is real and reading it is cheaper than
  rediscovering it.
- Local clutter left behind by the old build: `godot-mcp/` (a separate 32M third-party
  tool, untracked and left alone), plus ignored `node_modules/`, `test-results/`,
  `playwright-report/` and `tests/`. Clear them whenever; nothing depends on them.
- Whether this project gets a `project-tracking` hub entry alongside the other projects.

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

- **Package A synced** (claude-workflow#31 / goal-bingo#47): adversarial review cancels superseded runs, re-reviews incrementally via `Reviewed-Commit:`, requires a this-run comment, and the merge gate keys off HEAD check SUCCESS. Smoke stamp: 2026-09-20 19:57.

- Second smoke push (Package A concurrency): should cancel the in-flight review of the prior commit.

- Third smoke push after jq verification fix (claude-workflow#32): expect green check and a delta re-review citing the prior Reviewed-Commit trailer.

- **Reviewed-Commit SHA injection smoke** (21:02): first push — trailer must equal this commit's SHA.

- **Reviewed-Commit SHA injection smoke (pass 2):** delta re-review; trailer must equal this second commit's SHA.

- **Package B lite smoke:** NEXT.md-only should classify lite (max-turns 30).

- **Package B landed** (claude-workflow#34 + #36; goal-bingo sync via direct main push then #56): path tiers mechanical/lite/standard/deep. Smokes: lite #54 green; mechanical #56 green in ~13s without Claude / without GUARD_ALLOW_UNREVIEWED; deep #57 green (closed without merging the app comment).

- **The owner/verification-status data migration was lost and redone.** The in-progress work reported earlier today (adding explicit `verification-status`/`owner` to every requirement) was never committed — traced via `git reflog`: the branch it lived on (`requirements/materialize-verification-status`) sits at the same commit as `main` right after #39, with zero commits of its own. It existed only as uncommitted working-tree text and was lost when the shared tree moved to a different branch without a commit or stash. Confirmed unrecoverable: searched all 10,109 dangling git objects for any trace, none found — it was never even `git add`ed. Redone mechanically with a checked-in tool (`scripts/materialize_defaults.py`, additive-only, verified against the pre-change files byte-for-byte): 172 fields added across 86 records (`GB-FUN-034b`'s malformed ID meant `lint_requirements.py`'s own count read 85, not 86 — flagged separately below). `lint_requirements.py`, `record_index.py`, and `standing_check.py` now all agree: 0 errors, the original 85-problem discrepancy this thread started from is closed for real. Also removed `requirements/_meta.md`'s now-dead `## defaults` block (`author`/`verification-owner` were in it too — both optional under the `agent` profile, so dropping them creates no compliance gap; not materialized onto every record, since that would be metadata nobody's asked to track rather than closing an actual gap).
- **Found in passing: `GB-FUN-034b`'s ID is malformed.** The linter already reports this (`warn A15`) — record IDs must be uppercase segments only (`GB-FUN-NNN`), and the trailing lowercase `b` fails that, which is also why the linter's own record count silently read 85 instead of 86. Not fixed here — renaming an ID that other records may already cite needs a moment's check first, not a mechanical pass.

- **Closed the authoring-side gap, not just the checker.** The lost-and-redone migration above traced back one step further: the `incose-requirements` skill's Phase 3 (write the statements) never told an authoring agent to write every mandatory field per record before moving on — that was left to Phase 4's linter pass over the whole finished set, which is exactly how a systemic gap got drafted across 86 records before anything caught it. `claude-workflow#38` adds an explicit per-record "fill every remaining mandatory field now" step and recommends running the linter against the file in progress every few records instead of only once at the end, so the same failure mode is a one-line fix on record 1 next time, not a migration on record 86.
