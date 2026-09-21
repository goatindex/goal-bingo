# NEXT — Goal Bingo

_Convention: update at end of each working session. The weekly portfolio review reads it._

## Current focus

**Link 5 — build WP-08 (advanced tiles).** WP-01 → WP-07, WP-09 (#18–#26 except
WP-08) are all closed. WP-08 is [#25](https://github.com/goatindex/goal-bingo/issues/25):
per-category advanced-tile eligibility, multi-completion tiles, and mini-grid tiles
— GB-FUN-043–050. Six TBDs resolved: `D-2026-09-21-16` (draw/placement mechanism —
how an eligible category's advanced tiles actually reach a board cell — is out of
scope; no GB-FUN-043–050 requirement specifies it, and inventing one would be the
same silently-absorbed-scope mistake the WP-08 issue itself warns against),
`D-2026-09-21-17` (acquisition: 50 lifetime marks per category or 150 board balance,
either path sets the same eligibility flag), `D-2026-09-21-18` (multi-completion
tiles default to 3 completions, matching WP-09's sustained-run precedent),
`D-2026-09-21-19` (mini-grid full-board bonus is +100% of the clear's value, now
unblocked since Q7's base point values are resolved), `D-2026-09-21-20` (mini-grid
internal size is 3x3, found while scoping the mini-grid issue — distinct from the
main board's `SUPPORTED_SIZES`, which stays reserved for GB-CON-014's sim-validated
expansion). None of these had simulation evidence — advanced tiles sit entirely
outside `sim/jam_sim.py`'s scope. This WP ships eligibility + tile mechanics as
fully-tested, directly-constructible domain logic; no code path causes an advanced
tile to appear on a board through ordinary play yet (flagged, not silently
resolved). WP-10 (floor constraints) is also
unblocked but not started.

## Next up

- **Build #119** (mini-grid model, blocked by #118, now merged) and **#120**
  (mini-grid integration, blocked by #119) — the rest of WP-08's four sub-issues.
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

- **#118 (multi-completion tiles) built** (this PR), second of WP-08's four
  sub-issues: `board.ts`'s `Cell` gains an optional `advanced` field (a new
  `AdvancedTile` union, `{kind: 'multi-completion', completionsRequired,
  completionsSoFar}` so far) and `markCell` dispatches on it — a multi-completion
  cell increments progress instead of marking immediately, only reaching `marked:
  true` on the tap that meets its required count; every ordinary cell (no `advanced`
  field) keeps its exact existing one-tap behaviour. New `app/src/multiCompletion.ts`
  — `createMultiCompletionTile(completionsRequired?)` defaults to 3
  (`D-2026-09-21-18`) but stays fully parametric. `shell.ts`'s board-cell button now
  shows "k/N" progress text for a multi-completion cell (GB-FUN-046). No creation/
  draw pathway — out of scope (`D-2026-09-21-16`); tests and live verification
  construct a multi-completion cell directly via `localStorage`. 9 new tests (5
  `board.test.ts`, 2 `multiCompletion.test.ts`), 132/132 passing. Verified live:
  injected a 3-required multi-completion tile at cell 0, tapped it three times,
  watched the display progress 0/3 → 1/3 → 2/3 → 3/3 with the cell visually marking
  only on the third tap, confirmed board balance increased by 1 on each of the three
  genuine taps (each one a real interaction, matching GB-FUN-004's "when the player
  marks a cell") but not on a fourth, now-no-op tap; no console errors.
- **#117 (advanced-tile eligibility) built** (PR #121), first of WP-08's four
  sub-issues: new `app/src/advancedUnlock.ts` — `recordAdvancedTileProgress(access,
  category)` tracks a lifetime per-category mark count (independent of WP-09's
  `stats.clearsByCategory`, which counts cleared cells, and WP-06's category
  challenges, which reset every 10 marks) and auto-unlocks eligibility at 50 marks
  (`D-2026-09-21-17`); `purchaseAdvancedTileUnlock` is the board-balance secondary
  path (150), refusing with no state change if already unlocked or balance is
  insufficient. `main.ts`'s `onMarkCell` records progress only on a genuine new mark,
  the same `isNewMark` guard `challenges.ts` already established. `storage.ts`'s
  `GameState.advancedTileAccess` follows the established precedent. No UI — neither
  GB-FUN-043 nor GB-FUN-044 requires display, following #93/#94/#99's precedent; how
  an eligible category's advanced tiles reach a board cell stays explicitly out of
  scope (`D-2026-09-21-16`). 9 new tests, 133/133 passing. Verified live: set a
  category to 49 marks via `localStorage`, marked one real cell of that category
  through the UI, confirmed eligibility unlocked at exactly 50; confirmed re-tapping
  an already-marked cell left the count unchanged; no console errors.
- **Resolved a fifth WP-08 gap found while scoping** (PR #116): `D-2026-09-21-20` —
  mini-grid internal size is 3x3, distinct from the main board's `SUPPORTED_SIZES`
  (reserved for GB-CON-014's sim-validated expansion). Confirmed with the user; no
  requirement or simulation sets this.
- **Resolved WP-08's four TBDs, plus a scope gap** (PR #115): `D-2026-09-21-16` — no
  GB-FUN-043–050 requirement specifies how an eligible category's advanced tiles
  actually reach a board cell during ordinary play; confirmed with the user to leave
  this unscoped rather than invent an ungrounded draw-integration policy, matching
  the WP-08 issue's own "do not silently absorb neighbouring requirements" warning.
  `D-2026-09-21-17` — advanced-tile eligibility: 50 lifetime marks in a category, or
  150 board balance, either path sets the same per-category flag (a new lifetime
  per-category mark counter is needed — neither WP-09's `stats.clearsByCategory`,
  which counts cleared cells, nor WP-06's category challenges, which reset every 10
  marks, already track this). `D-2026-09-21-18` — multi-completion tiles default to
  3 completions, matching WP-09's sustained-run precedent. `D-2026-09-21-19` —
  mini-grid full-board bonus is +100% of the clear's own value, unblocked now that
  Q7's base point values are resolved. None had simulation evidence; achievements
  and advanced tiles sit entirely outside `sim/jam_sim.py`'s scope.
- **#110 (statistics and achievements display view) built** (PR #113), closing
  WP-09's last sub-issue: `shell.ts` gains a 6th nav tab, "Stats" (`ShellView` union
  extended to `'stats'`), and `renderStats(state)` shows the lifetime score (already
  tracked since WP-05), the average-clears-per-day figure, a category breakdown
  sorted by count, a clear-history list sorted most-recent-first, and all four
  minimum-set achievements — unlocked ones bold, locked ones dimmed and labelled
  "(locked)". Consolidated `AchievementId`'s canonical order into a single exported
  `ACHIEVEMENT_IDS` in `achievements.ts` (`storage.ts`'s own copy for validation was
  a second definition of the same list, now imported instead of duplicated). No new
  unit tests — this codebase has no DOM test harness, consistent with every prior UI
  issue's precedent (#73, #84, #85). Verified live: fresh state shows all four
  achievements locked and empty stats; cleared a row, confirmed the Stats view
  updated to lifetime 9, average 1.00, the correct category counts, today's clear
  history entry, and "First Clear" now shown unlocked; no console errors.
- **#109 (achievement model and evaluation) built** (PR #112), second of WP-09's
  three sub-issues: `lines.ts` gains `isVarietyCombo`/`isMatchingCombo` (splitting
  `comboMultiplier`'s combined check into two named predicates) and `ClearOutcome`
  gains `hadVarietyCombo`, reusing the exact same category-distinctness check as the
  WP-05 variety-combo bonus rather than a second rarity definition
  (`D-2026-09-21-14`). New `app/src/achievements.ts` — `evaluateAchievements(unlocked,
  context, now)` checks all four minimum-set conditions in one pass and returns only
  newly-unlocked entries, deduplicated both against the existing list and within the
  same call; `first-clear` fires at 1 total clear, `large-grid` at board size 7
  (`D-2026-09-21-15`), `sustained-run` at 3 consecutive local-calendar days with a
  clear each (`D-2026-09-21-13`, a day with zero clears resets the streak),
  `rare-combination` on any variety-combo clear. `storage.ts`'s
  `GameState.achievements` follows the established precedent; `main.ts`'s
  `onMarkCell` evaluates achievements only on a genuine new mark (same `isNewMark`
  guard `challenges.ts` already established), after stats/challenges update. 8 new
  tests (`achievements.test.ts`) plus 3 new `lines.test.ts` assertions for
  `hadVarietyCombo`, 127/127 passing. Verified live: cleared a row, confirmed
  `first-clear` unlocked with exactly one entry; cleared a second row, confirmed no
  duplicate was added; no console errors.
- **#108 (clear-statistics tracking) built** (PR #111), first of WP-09's three
  sub-issues: `lines.ts`'s `ClearOutcome` gains `clearedCategories` — the category of
  every distinct cell that cleared, one entry per cell (GB-FUN-052, D-2026-09-21-12),
  read from the pre-refill board the same way scoring already does; an intersection
  cell shared by 2+ simultaneously-completing lines contributes once, matching how it
  is refilled once. New `app/src/stats.ts` — `recordClear(stats, clearedCategories,
  clearedLineCount, now)` tallies per-category counts and per-local-calendar-day line
  counts (GB-FUN-053), a no-op when `clearedLineCount` is 0 (a mark that cleared
  nothing); `averageClearsPerDay` divides total clears by days since first play,
  counting the current day as day 1 so a brand-new game never divides by zero
  (GB-FUN-054). `now` is an injected parameter throughout, matching the `rng`/
  `recycle.ts` convention. `storage.ts`'s `GameState.stats` follows the `Reward`/
  `Challenge`/`RecycleState` precedent: `isGameState` validates it, legacy saves
  migrate to a fresh (empty) record — accepting the same understated-history
  trade-off already made for categories/challenges/recycle on migration. 13 new
  tests (8 in `stats.test.ts`, 3 new `lines.test.ts` assertions including an
  intersection-cell double-counting check, 2 `storage.test.ts` assertions),
  116/116 passing. Verified live: marked a full row (5 cells, 4 distinct categories,
  one appearing twice), confirmed `clearsByCategory` summed to exactly 5 across the
  right categories and today's date showed 1 line clear; no console errors.
- **Resolved WP-09's four TBDs** (PR #107): `D-2026-09-21-12` — clears-by-category
  counts per cleared cell, not per line, confirmed with the user since GB-FUN-052's
  own rationale ("which life areas the player is engaging") is about individual
  goals, not lines as a unit — a 5-cell matching line adds 5 to one category, a mixed
  line adds 1 to each category it contains. `D-2026-09-21-13` — the sustained-run
  achievement is 3 consecutive calendar days (the shortest of three proposed
  options), local-date-based rather than a rolling 24h window, consistent with
  GB-FUN-054's own calendar-day framing. `D-2026-09-21-14` — the rare-combination
  achievement reuses WP-05's existing variety-combo detection (all 5 cells distinct
  categories) directly rather than inventing a second rarity concept.
  `D-2026-09-21-15` — the large-grid achievement is board size 7, the only size above
  the 5x5 start per `board.ts`'s `SUPPORTED_SIZES`, a direct reading rather than a
  genuine judgement call. None of these four had simulation evidence to ground them —
  achievements and statistics sit entirely outside `sim/jam_sim.py`'s scope.
- **WP-07 (economy actions, #24) closed.** All four sub-issues merged: #99, #100,
  #101, #102. Grid expansion, the recycle-allowance upgrade, swap, and recycle all
  spend board balance now — the release valve (recycle) and the main long-arc
  progression (grid expansion) both exist for the first time.
- **#100 (recycle-allowance upgrade) built** (this PR), closing out the recycle
  cluster of WP-07's four sub-issues: `recycle.ts` gains
  `purchaseAllowanceUpgrade(recycleState, boardBalance)` — a thin, cap-gated purchase
  identical in shape to `rewards.ts`'s `purchaseReward` (refuse-with-no-mutation on
  insufficient balance), raising `allowanceLevel` by one step for 100 board balance
  (`RECYCLE_ALLOWANCE_UPGRADE_COST`) up to a cap of 3
  (`RECYCLE_ALLOWANCE_MAX_LEVEL`, `D-2026-09-21-11`); refuses at the cap with no
  purchase possible. Deliberately does not touch the current window's `remaining`
  count — an upgrade changes what restores at the *next* window reset, not a
  retroactive credit mid-window. No UI wiring, following #93/#94/#99/#101's
  precedent. 5 new tests, 94/94 passing; `tsc --noEmit` clean; no console errors.
- **#102 (grid expansion power-up) built** (PR #105), one of WP-07's four sub-issues,
  independent of the recycle/allowance cluster and swap: new `app/src/expansion.ts` —
  `purchaseGridExpansion(board, pool, boardBalance, rng)` is a thin purchase gate
  around `board.ts`'s already-tested `resizeBoard`, deducting 250 board balance
  (`GRID_EXPANSION_COST`, `D-2026-09-21-9`) and growing to the next entry in
  `SUPPORTED_SIZES` rather than a hard-coded 7, so a future third size needs no edit
  here. Refuses with no state change on insufficient balance or when already at the
  largest size. No UI wiring, following #93/#94/#99/#101's precedent. 4 new tests, all
  passing; `tsc --noEmit` clean; no console errors.
- **#101 (swap power-up) built** (PR #104), one of WP-07's four sub-issues,
  independent of the recycle/allowance cluster: new `app/src/swap.ts` —
  `swapCells(board, indexA, indexB, boardBalance)` exchanges the full `Cell` (goal and
  marked state together — a mark travels with its tile, not the position it leaves)
  of two orthogonally-adjacent cells for a flat 10 board balance (`SWAP_COST`,
  `D-2026-09-21-10`); refuses on non-adjacent indices (including a cell swapped with
  itself) or insufficient balance, with no state change either way. Exported
  `lines.ts`'s existing private `adjacentIndices` helper (already used for the WP-05
  adjacency bonus) rather than writing a second implementation of the same geometry.
  No UI wiring, following #93/#94/#99's precedent. 6 new tests, all passing; `tsc
  --noEmit` clean; no console errors.
- **#99 (recycle power-up) built** (PR #103), first of WP-07's four sub-issues: new
  `app/src/recycle.ts` — `recycleCell(board, pool, index, recycleState, boardBalance,
  rng, now)` draws a replacement goal via the same `drawForCell` placement-rule-aware
  draw the refill path already uses (`ignore = new Set([index])` so the tile's own
  about-to-be-discarded goal is never consulted for legality), refuses on a marked
  tile (GB-CON-008) before touching anything, and pays from the free allowance before
  board balance (GB-FUN-042, `RECYCLE_COST` 5, `D-2026-09-21-8`). The free allowance's
  rolling 24-hour window (GB-FUN-041) is computed by `effectiveRemaining(state, now)` —
  `now` is an injected parameter (matching this codebase's existing `rng` convention)
  so the window logic is deterministically testable rather than depending on real
  time. `storage.ts`'s `GameState.recycle` follows the `Reward`/`Challenge` precedent
  (#85/#93): `isGameState` validates it, legacy saves migrate to a fresh allowance.
  No UI wiring yet — pure domain logic only, following #93/#94's precedent; the
  existing "Recycle" nav tab stays an unwired placeholder until a later issue. 8 new
  tests (including a 20-seed stress test proving a recycled tile never violates the
  long-term/domination placement rules), 89/89 passing. Verified live via
  `localStorage`: a fresh game state has the correct default allowance (level 1,
  1 remaining, no active window); no console errors.
- **Filed WP-07's four sub-issues** ([#99](https://github.com/goatindex/goal-bingo/issues/99)
  recycle + allowance, [#100](https://github.com/goatindex/goal-bingo/issues/100)
  allowance upgrade (blocked by #99), [#101](https://github.com/goatindex/goal-bingo/issues/101)
  swap, [#102](https://github.com/goatindex/goal-bingo/issues/102) grid expansion — the
  last two independent of the recycle cluster) via `ba-issue`, DoR-checked and clean.
- **Resolved WP-07's four TBDs** (PR #98): `D-2026-09-21-8` — recycle cost is 5 board
  balance, ported directly from `sim/jam_sim.py`'s own `recycle_cost` default; its own
  A5 sensitivity sweep varies this across `[2, 10]` and shows the recovery floor's
  time-to-unjam is statistically identical at both extremes (paid recycles average
  0.00 in every scenario — the free allowance alone resolves jams first), so there's
  no evidence-based reason to deviate from the value the rest of `sim/results.md`
  already assumes. The other three had no simulation evidence at all (`jam_sim.py`'s
  header explicitly lists swap, grid expansion, and the allowance upgrade as NOT
  MODELLED), so concrete numbers were proposed and confirmed with the user rather than
  invented silently: `D-2026-09-21-9` (grid expansion, the single 5x5→7x7 step per
  `board.ts`'s `SUPPORTED_SIZES`, costs 250 board balance), `D-2026-09-21-10` (swap
  costs 10 board balance — its price had never even been flagged as a TBD, a genuine
  gap in the original requirements-authoring pass, not evidence it's free),
  `D-2026-09-21-11` (recycle-allowance upgrade caps at 3, two steps at 100 board
  balance each). Q10 and Q17 both fully resolved.
- **WP-06 (challenges & board income, #23) closed.** Both sub-issues merged: #93
  challenge model (PR #95), #94 mark integration + payment (this PR). Board balance
  has a real income source for the first time since WP-01 — the economy WP-07/WP-08
  build on top of now exists.
- **#94 (progress challenges, pay board balance) built** (this PR), closing WP-06:
  `challenges.ts` gains `progressChallenges(challenges, goal)` — increments every
  active challenge the goal qualifies for (universal always, plus matching category
  and cadence, GB-FUN-056/060), resets a challenge to 0 and reports a completion when
  it reaches target rather than carrying progress past it (GB-FUN-062). `main.ts`'s
  `onMarkCell` now reads the tapped cell's goal *before* calling `markCellAndResolve` —
  necessary because that call refills the tapped cell itself when the mark completes a
  line through it, so the result's board no longer holds the goal that was actually
  marked. Pays a flat `BOARD_BALANCE_PER_MARK` (1) plus `CHALLENGE_TARGET` (10) per
  completion, but only on a genuine unmarked-to-marked transition — re-tapping an
  already-marked cell (`board.ts`'s existing no-op) does not progress challenges or
  pay again, since GB-FUN-004 only fires "when the player marks a cell". 3 new tests,
  81/81 passing. Verified live via `localStorage`: built a maximal jam (long-term
  goals on the board's main diagonal block all 12 lines at once), marked several
  non-blocker cells and confirmed board balance climbed 1 per mark with zero clears
  and zero lifetime-score change (GB-CON-012); drove the universal challenge to its
  target across 10 marks and confirmed a 10-board-balance completion bonus landed on
  top of the per-mark payments (board balance 20 after 10 marks, universal reset to
  0); confirmed re-tapping an already-marked cell left both board balance and
  progress unchanged. No console errors.
- **#93 (challenge model) built** (PR #95), first of WP-06's two sub-issues: new
  `app/src/challenges.ts` — `Challenge` type (`id`/`kind`/`qualifier`/`progress`/
  `target`), `initialChallenges(unlockedCategories)` builds the always-active set (one
  universal, one per cadence tier, one per unlocked category), `addCategoryChallenge`
  creates a category's challenge on unlock (GB-FUN-058), keyed by a stable id
  (`category-<name>`, `cadence-<tier>`, `universal`) so "does this already exist" is a
  lookup rather than a scan. `storage.ts`'s `GameState.challenges` follows the
  `Reward`/`isReward` precedent (#85): `isGameState` validates it, and the legacy
  migration path rebuilds `initialChallenges(DEFAULT_CATEGORIES)` for saves that never
  wrote it. `main.ts`'s `onAddCategory` now also calls `addCategoryChallenge`. No UI
  yet (not requested by GB-FUN-055/057/058/059; this issue is data modelling only —
  #94 is what makes challenges progress and pay anything). 7 new tests, 85/85 passing.
  Verified live via `localStorage`: a fresh game state has all 12 challenges at
  progress 0; unlocking a custom category ("pets") immediately created
  `category-pets`; no console errors.
- **Filed WP-06's two sub-issues** ([#93](https://github.com/goatindex/goal-bingo/issues/93)
  challenge model, [#94](https://github.com/goatindex/goal-bingo/issues/94) mark
  integration + payment, #94 blocked by #93) via `ba-issue`, DoR-checked and clean.
- **Resolved WP-06's two blocking TBDs** (PR #92): `D-2026-09-21-6` — board balance
  pays +1 per qualifying mark, flat regardless of how many challenges (universal,
  category, cadence) it also progresses — ported directly from `sim/jam_sim.py`'s own
  `self.balance += 1` per-mark assumption (its header notes completion bonuses are
  ignored in that model, so the already-validated recovery floor holds on this rate
  alone). `D-2026-09-21-7` — no simulation models challenges at all, so target (10
  marks) and completion bonus (10 board balance) were proposed and confirmed rather
  than invented silently; a completed challenge's counter resets and the same
  challenge continues, since no requirement in GB-FUN-055–062 mentions a calendar
  period despite the design doc's "this week" framing. Q18's rates fully resolved.
- **WP-05 (scoring & ledgers, #22) closed — first shippable slice complete.** All
  four sub-issues merged: #83 clear scoring (PR #87), #84 counter display (PR #88),
  #85 rewards CRUD (PR #89), #86 reward purchase (PR #90). WP-01 → WP-05 is now a
  real, playable bingo loop with scoring, combos, adjacency, and a rewards economy —
  no board-balance economy yet (WP-06/07).
- **#86 (reward purchase) built** (PR #90): `rewards.ts`'s `purchaseReward(rewards,
  id, rewardBalance)` deducts a reward's price from reward balance only — its
  signature has no access to lifetime score or board balance, so GB-CON-007 (lifetime
  never decreases) holds by construction, not just by convention. Refuses on an
  unknown reward id or insufficient balance without mutating anything. A reward is
  not consumed by purchase — it stays in the list and can be bought again.
  `shell.ts`'s rewards view now shows the reward balance counter (GB-CON-005: the only
  payment source visible there) and a Buy button per reward, disabled client-side when
  unaffordable but re-checked server-side in `main.ts` regardless. GB-CON-006 (the
  board-balance purchase flow must exclude reward balance) has no flow to build
  against yet — WP-07 — so it stays unimplemented, flagged rather than silently
  dropped. 4 new tests, 73/73 passing. Verified live in the browser: bought a reward,
  confirmed via `localStorage` that reward balance dropped by exactly the price while
  lifetime and board balance were untouched, and that the Buy button disables once the
  remaining balance can't afford the same reward again.
- **#85 (rewards CRUD) built** (PR #89): `app/src/rewards.ts` — `Reward` type
  (`id`/`name`/`price`), `validateReward` (blank name and non-positive/non-integer
  price both rejected), `addReward`, `removeReward`, mirroring `pool.ts`'s CRUD
  pattern. `storage.ts`'s `GameState.rewards` goes from the WP-01-era `unknown[]`
  placeholder to a real, validated `Reward[]` — `isGameState` now actually checks
  reward shape (previously unvalidated), and the legacy-migration path falls back to
  an empty list rather than trusting unvalidated pre-WP-05 data. `shell.ts` gains a
  new "Rewards" view (5th nav slot) with an add form and a delete button per reward,
  mirroring the pool view. 6 new tests, 69/69 passing. Verified live in the browser:
  created a reward, deleted it, confirmed persistence via `localStorage`, no console
  errors.
- **#84 (counter display) built** (PR #88): `shell.ts`'s `renderHome()` now shows
  reward balance and board balance alongside lifetime score, each a distinct labelled
  value (`data-testid="reward-balance"`/`"board-balance"`, matching the existing
  `"lifetime"` pattern). No DOM test harness exists in this codebase, so verified live
  in the browser (consistent with #73's precedent): all three counters render
  distinctly on a fresh board, no console errors.
- **#83 (clear scoring) built** (PR #87): `lines.ts`'s `resolveLineClears` now scores
  each completing line as its cadence-summed base (`CADENCE_BASE_VALUE`) times a
  matching/variety combo multiplier (`COMBO_BONUS_RATIO`) plus an adjacency bonus read
  from the pre-refill board (`ADJACENCY_CONFIG`) — the multi-clear bonus applies to
  this new summed value, not the old flat constant. `main.ts`'s `onMarkCell` now adds
  the clear value to reward balance as well as lifetime score (GB-FUN-003/GB-FUN-033),
  leaving board balance untouched. Removed `BASE_SCORE_PER_LINE`; the WP-03/04-era
  tests that asserted a flat per-line score were rewritten against explicit,
  hand-built boards with known cadence/category composition so the expected value is
  computed, not guessed. 5 new tests, 62/62 passing. Verified live in the browser via
  `localStorage`: a cleared row moved lifetime and reward balance by the identical
  amount, board balance stayed 0, no console errors.
- **Resolved WP-05's three blocking TBDs** (PR #82): unlike the grid-size and
  cadence-split questions, none had simulation evidence to ground them —
  `docs/design-description.md` says outright that point values are "a tuning problem
  that needs a playable board." Proposed concrete numbers and confirmed with the user
  rather than inventing silently: `D-2026-09-21-3` (base value 1/2/3/5 points by
  cadence hourly/daily/weekly/long-term, summed across a line), `D-2026-09-21-4`
  (+50% for both matching and variety combos, reusing the multi-clear bonus's existing
  magnitude), `D-2026-09-21-5` (one adjacency seed rule — a cleared cell adjacent to a
  still-marked cell scores +1 per neighbour — since GB-FUN-031 needs a genuinely
  board-state-sensitive rule to be testable at all, not just a configurable mechanism
  that always returns zero). Q7 fully resolved (all three explicitly placeholder-grade).
- **WP-04 (draw engine, #21) closed.** Both sub-issues merged: #77 cadence-weighted
  draw (PR #79), #78 binding placement rules (PR #80). Link 5 moves on to WP-05 (#22,
  scoring & ledgers) — the last package in the first shippable slice.
- **#78 (binding placement rules) built** (PR #80), closing WP-04: `draw.ts`'s
  `drawForCell` layers both binding rules on top of `drawWeighted` — no long-term goal
  in a row/column that already has one (GB-FUN-023), no category over 40% of board
  cells (`CATEGORY_DOMINATION_THRESHOLD`, `D-2026-09-21-2`, GB-FUN-024) — falling
  through three progressively looser candidate sets (weighted-and-legal, any-cadence-
  and-legal, unconstrained) so GB-FUN-008's never-empty guarantee always wins in a
  genuine deadlock. `board.ts`'s `createBoard`/`resizeBoard` and `lines.ts`'s
  `resolveLineClears` now call it for every fill; a multi-cell batch refill (e.g. a
  whole line clearing) treats not-yet-redrawn cells in the same batch as excluded from
  both rules' checks (their old content is about to vanish) via a `ignore` set, while
  already-redrawn batch cells still count — verified across 20 seeded boards and a
  20-seed batch-refill integration test with no violations. `drawForCell` takes only a
  board and an index, so a future recycle action can reuse it unchanged (GB-FUN-026).
  9 new tests, 57/57 passing. Verified live in the browser: fresh board creation and a
  full-row clear/refill both worked with no console errors.
- **#77 (cadence-weighted draw) built** (PR #79): `app/src/draw.ts`'s `drawWeighted`
  picks a cadence first (~5% long-term per `LONG_TERM_DRAW_SHARE`, else 40/40/20
  hourly/daily/weekly per `SHORT_CADENCE_MIX`), then a uniform goal within that cadence;
  falls back to `pool.ts`'s plain `drawGoal` when the pool has no goal of the selected
  cadence, and refuses an empty pool the same way. Not yet wired into `board.ts`/
  `lines.ts`'s refill calls — that's #78, once binding-rule awareness exists to combine
  with it. Verified with a 20,000-draw sample against a seeded PRNG (reproducible, not
  flaky): long-term share lands inside the 0-10% band, short-term split matches
  `SHORT_CADENCE_MIX` within tolerance. 4 new tests, 51/51 passing.
- **Resolved WP-04's two blocking TBDs** (PR #76): `D-2026-09-21-1` — short-term cadence
  split is 40% hourly / 40% daily / 20% weekly, ported directly from `sim/jam_sim.py`'s
  `SHORT_MIX` rather than invented, since a different split would have silently
  invalidated the recovery-floor results `D-2026-09-20-8`'s grid sizing already relies
  on. `D-2026-09-21-2` — category domination threshold is 40% of board cells (no
  simulation precedent existed for this one; chosen to keep a full single-category line
  achievable while still capping crowding-out). Q6, Q21, Q22 all resolved.
- **WP-03 (board loop, #20) closed.** All five sub-issues merged: #63 board model
  (PR #67), #64 marking (PR #69), #65 single-line clear (PR #71), #66 multi-line clear
  (PR #72), #73 board UI (PR #74). Link 5 moves on to WP-04 (#21, draw engine).
- **#73 (board UI) built** (PR #74), the last of WP-03's five sub-issues: `shell.ts`'s
  `renderHome()` now
  renders the real board (`state.board.cells`, one tappable button per cell, distinct
  styling for marked cells and for `intersectionCells` on a multi-clear) in place of the
  WP-01/WP-02-era placeholder mark/draw buttons. `main.ts`'s `onMarkCell` wires a tap to
  `markCellAndResolve`, applies the score delta and updated board, persists via
  `saveState`, and surfaces the existing empty-pool prompt on an `empty-pool` refusal.
  Removed the now-redundant manual "draw a goal" test button and its `lastDraw`/
  `onDrawPlaceholder` plumbing — the real board already shows drawn goals directly.
  No DOM test harness exists in this codebase (no jsdom/happy-dom configured), so
  verified manually via the dev server: marked a cell (visual change), completed a row
  (score incremented, cells refilled with fresh goals, marks cleared), reloaded (state
  persisted correctly) — no console errors at any step.
- **#66 (multi-line clear) built** (this PR), completing WP-03's business logic:
  `resolveLineClears` (`app/src/lines.ts`) already cleared every simultaneously-
  completing line correctly (checked all lines through the marked cell); this issue adds
  the multi-clear bonus (50% of summed base score, `D-2026-09-20-9`, only when more than
  one line clears), `intersectionCells` reporting which cell(s) are shared by 2+
  completing lines for the UI to render distinctly (GB-FUN-014), and a `countMarked`
  helper making a line's progress observable — confirming that refilling a clearing
  line's cells already discards perpendicular progress by construction (GB-FUN-015; no
  new mechanism needed, just a test proving it). 7 new tests, 47/47 passing.
  **Found while wrapping up: WP-03's UI was never scoped** — see Next up.
- **#65 (single-line clear) built** (this PR): `app/src/lines.ts` — `allLines`/
  `linesThroughIndex` enumerate rows, columns, and both main diagonals (GB-FUN-010; a
  5x5 grid has 12 lines, matching the count already cited in
  `docs/design-description.md`'s Q2 discussion). `resolveLineClears` checks every line
  through a marked cell, clears each completing one (score, empty, refill inline so a
  cell is never observably empty), and composes with `markCell` via
  `markCellAndResolve`. Uses a placeholder `BASE_SCORE_PER_LINE` (1) until Q7 sets real
  base point values. The algorithm already clears simultaneous multi-line completions
  correctly (checks every line through the cell, not just one) but does not yet award
  the multi-clear bonus, mark the intersection cell, or remove perpendicular progress —
  those are #66. 11 new tests, 40/40 passing.
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
