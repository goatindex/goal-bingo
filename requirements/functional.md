# Functional requirements — Goal Bingo

Mined from `docs/design-description.md`. Every statement cites the source section(s).
Shortcut path: requirements trace to design-description.md section numbers; needs are not
captured separately. The set is verifiable but not independently validatable.

---

## 2 — The core loop

### GB-FUN-001 — No end state
statement: Goal Bingo shall run continuously without an end state, a level boundary, or a
  session boundary.
type: functional
rationale: The game is a continuous bingo loop. An end state would terminate the habit
  tracker.
trace-to-source: design-description.md 2
verification-method: test
verification-criteria: After any number of line clears the game remains playable; no
  "game over" or "level complete" screen is presented.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-002 — Mark persists until line clears
statement: When the player marks a cell, Goal Bingo shall preserve that mark until the
  cell's line clears.
type: functional
rationale: Persistent marks are the mechanism that makes the game a bingo game rather than
  a daily checklist. D-2026-09-19-2.
trace-to-source: design-description.md 2 design-description.md 3.4
verification-method: test
verification-criteria: A marked cell remains visually marked across app restarts and
  session boundaries until its line clears.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-003 — Clearing awards reward balance
statement: When a line clears, Goal Bingo shall increase the player's reward balance by the
  value of the clear.
type: functional
rationale: Reward balance funds personal rewards. D-2026-09-19-6.
trace-to-source: design-description.md 2 design-description.md 5.3
verification-method: test
verification-criteria: After a line clears, the reward balance counter is greater by a
  positive amount equal to the computed clear value.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-004 — Marking toward a challenge awards board balance
statement: When the player marks a cell and that mark qualifies toward at least one active
  challenge, Goal Bingo shall increase the player's board balance at the moment the mark is
  made.
type: functional
rationale: Board balance is fed by marks, not clears. This is what keeps income flowing on
  a jammed board. D-2026-09-19-6, D-2026-09-19-8.
trace-to-source: design-description.md 2 design-description.md 5.3 design-description.md 8.2
verification-method: test
verification-criteria: Board balance increases immediately after a qualifying mark, without
  waiting for a line to clear.
verification-status: not-verified
owner: k
priority: must

---

## 3.1 — Size and shape

### GB-FUN-005 — Grid is square and variable-size
statement: Goal Bingo shall maintain a square grid whose size can be increased by spending
  board balance.
type: functional
rationale: Grid expansion is the main long-arc progression. A square grid is the bingo
  convention. D-2026-09-19-4.
trace-to-source: design-description.md 3.1
verification-method: test
verification-criteria: Starting from the smallest grid size, the player can spend board
  balance to reach each successive grid size, and the board dimensions are equal on both
  axes at every size.
verification-status: not-verified
owner: k
priority: must
notes: Starting size is 5x5; expansion verified through 7x7 (`D-2026-09-20-8`). A further
  step to 9x9 or beyond is future work, gated on running `sim/jam_sim.py` at that size
  first (GB-CON-014). Q1 resolved.

### GB-FUN-006 — Grid expansion is permanent
statement: When the player purchases a grid expansion, Goal Bingo shall increase the grid
  size permanently.
type: functional
rationale: Expansion is a progression reward, not a temporary boost.
trace-to-source: design-description.md 3.1
verification-method: test
verification-criteria: After purchasing an expansion, the grid size is retained across app
  restarts.
verification-status: not-verified
owner: k
priority: must

---

## 3.2 — Cells and tiles

### GB-FUN-007 — One tile per cell
statement: Goal Bingo shall hold exactly one tile in each cell at all times during active
  play.
type: functional
rationale: Cells that hold zero or two tiles are undefined game states.
trace-to-source: design-description.md 3.2
verification-method: test
verification-criteria: At no point during active play does any cell render without a tile
  or with more than one tile.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-008 — Board is never presented with empty cells
statement: When a line clears and cells empty, Goal Bingo shall complete the refill before
  presenting the board to the player as playable.
type: functional
rationale: An empty cell is a transient state; the player should never see a partially
  filled board.
trace-to-source: design-description.md 3.2
verification-method: test
verification-criteria: Between the moment a line clears and the moment the board is next
  interactive, all cells that emptied are filled.
verification-status: not-verified
owner: k
priority: must

---

## 3.3 — Marking

### GB-FUN-009 — Marking requires only player input
statement: Goal Bingo shall accept a mark on a cell when the player taps it, requiring no
  external verification.
type: functional
rationale: Marking is self-reported. No health API, sensor, or integration is required.
  D-2026-09-19-5 (restart from design, not prototype), 3.3 position.
trace-to-source: design-description.md 3.3
verification-method: test
verification-criteria: Tapping an unmarked cell marks it without any network request, API
  call, or additional confirmation step.
verification-status: not-verified
owner: k
priority: must

---

## 3.4 — Lines and clearing

### GB-FUN-010 — Lines include diagonals
statement: Goal Bingo shall treat each complete row, each complete column, and each main
  diagonal as a line.
type: functional
rationale: Diagonals count. D-2026-09-19-13.
trace-to-source: design-description.md 3.4
verification-method: test
verification-criteria: Marking the final cell of a diagonal triggers a clear; the same
  applies to rows and columns.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-011 — Line clears when every cell is marked
statement: When every cell in a line is marked, Goal Bingo shall clear the line: award
  score, empty the cells, and draw new goals into them from the pool.
type: functional
rationale: This is the core bingo mechanic. D-2026-09-19-13.
trace-to-source: design-description.md 3.4
verification-method: test
verification-criteria: Marking the final cell of a line triggers the clear sequence: score
  is incremented, cells empty, and are refilled before the board is playable again.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-012 — All completing lines resolve on a simultaneous mark
statement: When a single mark simultaneously completes more than one line, Goal Bingo shall
  clear every completing line.
type: functional
rationale: D-2026-09-19-13.
trace-to-source: design-description.md 3.4
verification-method: test
verification-criteria: A mark that completes two lines triggers two separate clear awards
  and refills all cells from both lines.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-013 — Multi-clear bonus for simultaneous completion
statement: When a single mark clears more than one line simultaneously, Goal Bingo shall
  award bonus points for the multi-clear in addition to each line's base score.
type: functional
rationale: D-2026-09-19-13, D-2026-09-19-14.
trace-to-source: design-description.md 3.4
verification-method: test
verification-criteria: A double-clear produces a higher total score than two sequential
  single clears of the same lines; the increment is attributable to the multi-clear bonus.
verification-status: not-verified
owner: k
priority: must
notes: Bonus is 50% of the summed base score of the clearing lines (`D-2026-09-20-9`),
  decoupled from Q7's still-open base point values. Blocker resolved.

### GB-FUN-014 — Intersection cell has distinct visual treatment
statement: When two lines clear simultaneously, Goal Bingo shall render the cell at their
  intersection with a visual treatment distinct from cells that belong to only one clearing
  line.
type: functional
rationale: The intersection is the anchor for the multi-clear bonus. D-2026-09-19-14.
trace-to-source: design-description.md 3.4
verification-method: inspection
verification-criteria: In a double-clear, the shared cell is visually distinguishable from
  the other cells in both lines during the clear animation.
verification-status: not-verified
owner: k
priority: must
notes: Exact animation is a design decision deferred to implementation.

### GB-FUN-015 — Perpendicular progress is lost on a clear
statement: When a line clears, Goal Bingo shall discard the marks of cells that were
  contributing progress toward perpendicular lines.
type: functional
rationale: Marks are not preserved when their cells empty. This is the base rule;
  compensation is a designated upgrade area. D-2026-09-19-15.
trace-to-source: design-description.md 3.4
verification-method: test
verification-criteria: After a row clears, cells that were marked and also belonged to
  in-progress columns have their marks removed; the column progress count reflects the loss.
verification-status: not-verified
owner: k
priority: must

---

## 4.1 — The goal pool

### GB-FUN-016 — Goal stays in pool after being drawn
statement: Goal Bingo shall return each goal to the pool after it is drawn into a cell,
  leaving it available for future draws.
type: functional
rationale: The pool is not a queue; goals can recur.
trace-to-source: design-description.md 4.1
verification-method: test
verification-criteria: A goal that is currently on the board can also be drawn into another
  cell on the same or a subsequent refill.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-017 — Starter goal set
statement: Goal Bingo shall provide a non-empty starting set of goals that the player can
  edit.
type: functional
rationale: An empty pool at first launch creates a blank-page barrier.
trace-to-source: design-description.md 4.1
verification-method: inspection
verification-criteria: On first launch, the pool contains at least one goal in each default
  category; the player can add, edit, and remove goals from the pool.
verification-status: not-verified
owner: k
priority: must

---

## 4.2 — Categories

### GB-FUN-018 — Every goal carries exactly one category
statement: Goal Bingo shall assign exactly one category to each goal in the pool.
type: functional
rationale: Category drives combos, statistics, and challenges. D-2026-09-19-11.
trace-to-source: design-description.md 4.2
verification-method: test
verification-criteria: Every goal record has a non-null, non-empty category value; no goal
  has more than one category.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-019 — Seven default categories ship
statement: Goal Bingo shall provide the following seven categories on first install: health,
  study, creative, volunteering, relationship, home, work.
type: functional
rationale: D-2026-09-19-16. These are defaults, not the only categories.
trace-to-source: design-description.md 4.2
verification-method: inspection
verification-criteria: On first launch, the category list contains exactly these seven
  entries and the starter goals are distributed across them.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-020 — New categories unlock through progression
statement: Goal Bingo shall allow the player to unlock additional categories beyond the
  seven defaults through in-game progression.
type: functional
rationale: Player-defined categories are earned through play. D-2026-09-19-16.
  Provisional unlock gate: D-2026-09-20-7.
trace-to-source: design-description.md 4.2
verification-method: test
verification-criteria: After satisfying the unlock condition, a new category slot is
  available for the player to name and use.
verification-status: not-verified
owner: k
priority: must
notes: Provisional unlock gate is lifetime score ≥ 10 unlocking one custom category slot
  (D-2026-09-20-7). Replaceable when progression is tuned; do not remove the gate.

---

## 4.3 — Cadence

### GB-FUN-021 — Every goal has exactly one cadence
statement: Goal Bingo shall assign exactly one cadence to each goal: hourly, daily, weekly,
  or long-term.
type: functional
rationale: Cadence determines draw rate and blocking behaviour. D-2026-09-19-11.
trace-to-source: design-description.md 4.3
verification-method: test
verification-criteria: Every goal record has a cadence field with one of the four
  permitted values; no goal has zero or multiple cadence values.
verification-status: not-verified
owner: k
priority: must

---

## 4.4 — Draw rates and refill

### GB-FUN-022 — Draw is weighted by cadence
statement: Goal Bingo shall weight each goal's draw probability according to its cadence,
  with long-term goals drawn at a lower rate than short-term goals.
type: functional
rationale: Hourly goals should surface often; long-term goals rarely. 4.4.
trace-to-source: design-description.md 4.4
verification-method: test
verification-criteria: In a large sample of draws from a mixed pool, long-term goals are
  drawn at a lower frequency than daily goals.
verification-status: not-verified
owner: k
priority: must
notes: Long-term share ~5% (`D-2026-09-19-12`); the remaining weight splits 40% hourly /
  40% daily / 20% weekly (`D-2026-09-21-1`, ported from `sim/jam_sim.py`'s `SHORT_MIX`,
  already validated across grid sizes 3/5/7 by that simulation's own A4 sensitivity run).
  Q6 resolved.

### GB-FUN-023 — No two long-term goals in the same row or column (binding)
statement: Goal Bingo shall not draw a long-term goal into a cell whose row or column
  already contains a long-term goal.
type: functional
rationale: Binding placement rule 1. Prevents lines being blocked in multiple places by
  long-term goals, which would make them impossible to unblock. 10.3 recovery argument
  rests on this being absolute. D-2026-09-19-9. Advisory placement rule 3 (former
  GB-FUN-025): where more than one legal placement exists on refill, prefer one that
  leaves at least one line completable; does not apply to recycle draws.
trace-to-source: design-description.md 4.4
verification-method: test
verification-criteria: After any draw, no row and no column contains more than one
  long-term goal.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-024 — No single category dominates the board (binding)
statement: Goal Bingo shall not draw a goal of any one category into a cell if doing so
  would cause that category to exceed the domination threshold on the board.
type: functional
rationale: Binding placement rule 2. Prevents a board where one life area crowds out
  others. 4.4. Refill preference (rule 3 / former GB-FUN-025) still applies after this
  binding rule: among legal placements, prefer one leaving a completable line.
trace-to-source: design-description.md 4.4
verification-method: test
verification-criteria: After any draw, no single category occupies more than the domination
  threshold proportion of cells on the board.
verification-status: not-verified
owner: k
priority: must
notes: Domination threshold is 40% of board cells (`D-2026-09-21-2`). Q21 resolved.

### GB-FUN-025 — Draw prefers completable-line placement (preference rule)
statement: Where more than one legally placed goal exists and at least one placement leaves
  at least one line completable, Goal Bingo shall select among placements that leave at
  least one line completable.
type: functional
status: deleted
rationale: Retired. Placement preference is advisory, not an obligation.
trace-to-source: design-description.md 4.4
verification-method: n-a
verification-criteria: n-a
verification-status: not-verified
owner: k
priority: deleted
notes: Intent preserved as rationale on GB-FUN-023 and GB-FUN-024. ID retained for
  trace honesty.

### GB-FUN-026 — Recycle draw obeys binding placement rules
statement: When the player recycles a tile, Goal Bingo shall apply placement rules 1 and 2
  from 4.4 to the replacement draw.
type: functional
rationale: The recycle path is the only draw that runs on a jammed board; the binding rules
  must hold there too. D-2026-09-19-9.
trace-to-source: design-description.md 4.4 design-description.md 6.2
verification-method: test
verification-criteria: After a recycle, no row or column contains two long-term goals, and
  no category exceeds the domination threshold.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-027 — Long-term draw share approximately 5%
statement: Goal Bingo shall configure the draw algorithm so that long-term goals receive
  approximately 5% of the total draw weight.
type: functional
rationale: At 5% draw share, ambient blocking runs at approximately 45–50% — a regular
  presence without dominating. D-2026-09-19-12. Verification band ±5 pp is
  D-2026-09-20-5; the weighting formula itself remains Q6.
trace-to-source: design-description.md 4.4 design-description.md 10.4
verification-method: test
verification-criteria: In a large sample of draws from a pool of mixed cadences, long-term
  goals are drawn in a share between 0% and 10% of cases (target 5%, tolerance ±5
  percentage points).
verification-status: not-verified
owner: k
priority: must
notes: Tolerance of ±5 pp (0–10% band) is D-2026-09-20-5. Exact formula is deferred to Q6 (owner: k).

---

## 5.1 — What a clear is worth

### GB-FUN-028 — Clear base value scales with cadence
statement: Goal Bingo shall compute the base value of a clear as a function of the cadences
  of the goals in the cleared line, with higher-cadence goals contributing more value.
type: functional
rationale: A line of long-term goals costs more to assemble than a line of daily ones. 5.1.
trace-to-source: design-description.md 5.1
verification-method: test
verification-criteria: A cleared line of long-term goals produces a higher base clear value
  than a cleared line of daily goals of equal length.
verification-status: not-verified
owner: k
priority: must
notes: 1 (hourly) / 2 (daily) / 3 (weekly) / 5 (long-term) points per tile, summed
  across the line (`D-2026-09-21-3`). Q7 resolved (placeholder-grade, per that
  decision's own framing).

---

## 5.2 — Combos and adjacency

### GB-FUN-029 — Matching category combo bonus
statement: When every tile in a cleared line belongs to the same category, Goal Bingo shall
  apply a matching combo bonus multiplier to the clear value.
type: functional
rationale: Matching combos reward focus. D-2026-09-19-19.
trace-to-source: design-description.md 5.2
verification-method: test
verification-criteria: A cleared line where all goals share one category scores higher than
  a cleared line of the same cadences with mixed categories.
verification-status: not-verified
owner: k
priority: must
notes: +50% multiplier (`D-2026-09-21-4`). Q7 resolved.

### GB-FUN-030 — Variety category combo bonus
statement: When every tile in a cleared line belongs to a different category, Goal Bingo
  shall apply a variety combo bonus multiplier to the clear value.
type: functional
rationale: Variety combos reward strategic spread. D-2026-09-19-19.
trace-to-source: design-description.md 5.2
verification-method: test
verification-criteria: A cleared line where all goals have distinct categories scores higher
  than a cleared line of the same cadences with repeated categories.
verification-status: not-verified
owner: k
priority: must
notes: +50% multiplier (`D-2026-09-21-4`). Q7 resolved.

### GB-FUN-031 — Adjacency bonus mechanism
statement: Goal Bingo shall compute an adjacency bonus for each line clear, where the
  bonus value is a function of the board state at the time of the clear.
type: functional
rationale: Adjacency scoring makes the board a single spatial object, not a set of
  independent rows. The specific formula is deferred to Q7; this requirement asserts
  the mechanism exists and is board-state-sensitive. 5.2.
trace-to-source: design-description.md 5.2
verification-method: test
verification-criteria: Clearing the same line in two different board configurations
  produces different total clear scores; the delta is attributable to the adjacency
  component. A line clear with no qualifying adjacency condition produces an adjacency
  bonus of zero.
verification-status: not-verified
owner: k
priority: must
notes: Seed combination `{ name: "adjacent-marked", value: 1 }` (`D-2026-09-21-5`).
  See GB-FUN-068 for the configurability obligation. Q7 resolved.

---

## 5.3 — Score and the balance it is spent from

### GB-FUN-032 — Three counters maintained
statement: Goal Bingo shall maintain three independent counters for each player: lifetime
  score, reward balance, and board balance.
type: functional
rationale: Two incompatible jobs (record and currency) require separate counters.
  D-2026-09-19-6.
trace-to-source: design-description.md 5.3
verification-method: test
verification-criteria: The player can view all three counter values distinctly; each
  changes independently.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-033 — Lifetime score only ever increases
statement: Goal Bingo shall increase the lifetime score when each line clears.
type: functional
rationale: Lifetime score is a record of achievement, not a currency. D-2026-09-19-6.
  A separate constraint (GB-CON-007) forbids any action from decreasing it.
trace-to-source: design-description.md 5.3
verification-method: test
verification-criteria: The lifetime score value after each clear event is strictly greater
  than its value before that event.
verification-status: not-verified
owner: k
priority: must

---

## 6.1 — Personal rewards

### GB-FUN-034 — Player creates personal rewards
statement: Goal Bingo shall enable the player to create, name, and price personal rewards
  using reward balance.
type: functional
rationale: The game holds the ledger; the player defines the rewards. 6.1.
trace-to-source: design-description.md 6.1
verification-method: test
verification-criteria: The player can create a personal reward with a name and price, and
  the reward persists across restarts.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-034b — Player removes personal rewards
statement: Goal Bingo shall enable the player to delete each personal reward they have
  created.
type: functional
trace-to-source: design-description.md 6.1
verification-method: test
verification-criteria: Deleting a reward removes it from the reward list.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-035 — Personal reward purchase deducts reward balance only
statement: When the player purchases a personal reward, Goal Bingo shall deduct the
  reward's price from the reward balance.
type: functional
rationale: Reward balance and board balance are separate budgets. D-2026-09-19-6.
  GB-CON-005 enforces that board balance is not offered as an alternative.
trace-to-source: design-description.md 6.1 design-description.md 5.3
verification-method: test
verification-criteria: After a reward purchase, the reward balance decreases by the
  reward's price; board balance and lifetime score are unchanged.
verification-status: not-verified
owner: k
priority: must

---

## 6.2 — Power-ups

### GB-FUN-036 — Grid expansion power-up
statement: Goal Bingo shall provide a grid expansion power-up that permanently increases
  the grid size when purchased with board balance.
type: functional
rationale: Grid expansion is the main long-arc progression. 3.1, 6.2.
trace-to-source: design-description.md 6.2
verification-method: test
verification-criteria: Purchasing the expansion deducts board balance and results in a
  permanently larger grid.
verification-status: not-verified
owner: k
priority: must
notes: Price is TBD (owner: k, blocks: Q10).

### GB-FUN-037 — Recycle-allowance upgrade power-up
statement: Goal Bingo shall provide a power-up that permanently increases the number of
  free recycles available per 24-hour period.
type: functional
rationale: Turns the release valve into a progression axis. D-2026-09-19-7.
trace-to-source: design-description.md 6.2
verification-method: test
verification-criteria: After purchasing the upgrade, the free recycle allowance per 24
  hours is higher than before the purchase, and the increase persists across restarts.
verification-status: not-verified
owner: k
priority: must
notes: Upper limit on upgrades and per-step prices are TBD (owner: k, blocks: Q17).

### GB-FUN-038 — Swap power-up exchanges adjacent tiles
statement: Goal Bingo shall provide a swap power-up that exchanges the positions of two
  adjacent tiles when purchased with board balance.
type: functional
rationale: The swap mechanic's purpose is consolidation — grouping blockers into fewer
  lines. Adjacent-only is the base mechanic. D-2026-09-19-22.
trace-to-source: design-description.md 6.2
verification-method: test
verification-criteria: Activating the swap and selecting two adjacent tiles moves each
  goal into the other's cell; non-adjacent tiles cannot be swapped in the base game.
verification-status: not-verified
owner: k
priority: must
notes: Wider-range swap is an upgrade area, not a base-game feature.

### GB-FUN-039 — Recycle power-up replaces unmarked tile
statement: When the player activates a recycle on an unmarked tile, Goal Bingo shall remove
  that tile from the cell and draw a replacement goal from the pool into the same cell.
type: functional
rationale: The recycle is the primary way out of a blocked line. D-2026-09-19-10.
trace-to-source: design-description.md 6.2
verification-method: test
verification-criteria: After a recycle, the selected cell contains a different goal; the
  prior goal is no longer visible in that cell.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-040 — Recycle unavailable on marked tiles
statement: If the player selects a marked tile for recycle, Goal Bingo shall reject the
  action.
type: functional
status: deleted
rationale: Retired as duplicate of GB-CON-008.
trace-to-source: design-description.md 6.2
verification-method: n-a
verification-criteria: n-a
verification-status: not-verified
owner: k
priority: deleted
notes: ID retained for trace honesty.

### GB-FUN-041 — Free recycle allowance resets on 24-hour rolling window
statement: Goal Bingo shall grant the player a free recycle allowance equal to the
  player's current recycle upgrade level, restoring the full allowance 24 h after the
  first recycle in each window is used.
type: functional
rationale: Rolling window from first use, not a fixed clock boundary. Default is 1;
  upgrades increase it (GB-FUN-037). Free tier originated in D-2026-09-19-7; epoch
  settled by D-2026-09-20-4.
trace-to-source: design-description.md 6.2
verification-method: test
verification-criteria: With current allowance N, a player who uses the first free
  recycle of a window at time T may activate up to N free recycles within that window,
  consuming the allowance counter each time; once the counter reaches zero, further free
  recycles are unavailable until 24 h after T, at which point the full current allowance
  restores.
verification-status: not-verified
owner: k
priority: must
notes: Default allowance is 1. The 24 h duration is fixed; epoch resets on each first use.

### GB-FUN-042 — Free allowance consumed before balance-spending recycles
statement: Goal Bingo shall deduct from the free recycle allowance before deducting board
  balance for each recycle within the same 24-hour window.
type: functional
rationale: The free tier must be consumed first so it is not silently skipped.
  D-2026-09-19-7; rolling-window epoch D-2026-09-20-4.
trace-to-source: design-description.md 6.2
verification-method: test
verification-criteria: Each recycle within a 24-hour window reduces the free allowance
  counter before any board balance is deducted; board balance is deducted only once the
  free allowance counter reaches zero.
verification-status: not-verified
owner: k
priority: must

---

## 7 — Advanced tiles

### GB-FUN-043 — Advanced tiles acquired through category progression
statement: Goal Bingo shall make advanced tiles for a category available when the player
  has reached the mark threshold for that category.
type: functional
rationale: Per-category progression is the primary acquisition path. D-2026-09-19-23.
trace-to-source: design-description.md 7
verification-method: test
verification-criteria: After reaching the mark threshold for a category, the player gains
  access to advanced tiles for goals in that category.
verification-status: not-verified
owner: k
priority: must
notes: Specific thresholds are a link 4 decision.

### GB-FUN-044 — Secondary advanced tile unlock via board balance
statement: Goal Bingo shall provide a secondary path to unlock advanced tiles using board
  balance, as an alternative to per-category progression.
type: functional
rationale: Economy provides a secondary unlock path. D-2026-09-19-23.
trace-to-source: design-description.md 7
verification-method: test
verification-criteria: With sufficient board balance and without meeting the progression
  threshold, the player can purchase access to an advanced tile slot.
verification-status: not-verified
owner: k
priority: must
notes: Prices are a link 4 decision.

---

## 7.1 — Multi-completion tiles

### GB-FUN-045 — Multi-completion tile requires multiple completions
statement: Goal Bingo shall count a multi-completion tile as marked only after the player
  has recorded the required number of completions for that tile.
type: functional
rationale: The multi-completion tile makes a long-term goal into a structured, visible
  commitment. 7.1.
trace-to-source: design-description.md 7.1
verification-method: test
verification-criteria: A multi-completion tile configured for N completions counts as
  marked only after the player has tapped it N times.
verification-status: not-verified
owner: k
priority: must
notes: The configured number of completions is set at tile creation (link 4 decision).

### GB-FUN-046 — Multi-completion tile displays progress
statement: Goal Bingo shall display the current completion count on a multi-completion tile.
type: functional
rationale: The tile shows its progress so a long-term goal is not an opaque block. 7.1.
trace-to-source: design-description.md 7.1
verification-method: inspection
verification-criteria: A multi-completion tile at k-of-N completions visually shows k and N.
verification-status: not-verified
owner: k
priority: must

---

## 7.2 — Mini-grid tiles

### GB-FUN-047 — Mini-grid tile cleared when internal line completes
statement: When a line completes inside a mini-grid tile's internal grid, Goal Bingo shall
  mark the parent cell on the main board as cleared.
type: functional
rationale: D-2026-09-19-20.
trace-to-source: design-description.md 7.2
verification-method: test
verification-criteria: Completing a row, column, or diagonal inside the mini-grid marks the
  parent cell on the main board as cleared.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-048 — Mini-grid draws from main pool by default
statement: By default, Goal Bingo shall populate mini-grid cells by drawing from the
  player's main goal pool.
type: functional
rationale: Using the main pool requires no additional player setup. D-2026-09-19-24.
trace-to-source: design-description.md 7.2
verification-method: test
verification-criteria: When a mini-grid tile is placed and no upgrade is active, its cells
  are filled with goals drawn from the same pool as the main board.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-049 — Mini-grid clear scores as a normal clear
statement: When a line completes inside a mini-grid tile, Goal Bingo shall score the clear
  using the same formula as a line clear on the main board.
type: functional
rationale: D-2026-09-19-24.
trace-to-source: design-description.md 7.2
verification-method: test
verification-criteria: Completing a line inside a mini-grid awards score and reward balance
  equal to what the same line would award on the main board.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-050 — Full-board bonus when mini-grid tile is last to clear
statement: When the mini-grid tile is the last tile to clear on the main board, Goal Bingo
  shall award an additional full-board bonus.
type: functional
rationale: D-2026-09-19-24.
trace-to-source: design-description.md 7.2
verification-method: test
verification-criteria: When the internal mini-grid line completes and that cell was the
  only remaining unmarked cell on the main board, the score award includes an additional
  bonus on top of the normal clear value.
verification-status: not-verified
owner: k
priority: must
notes: Bonus amount is TBD (owner: k, blocks: Q7).

---

## 8.1 — Statistics

### GB-FUN-051 — Lifetime score display
statement: Goal Bingo shall display the player's current lifetime score.
type: functional
rationale: Statistics show the player their own pattern. 8.1.
trace-to-source: design-description.md 8.1
verification-method: inspection
verification-criteria: The player can view the lifetime score from the statistics screen.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-052 — Clears by category display
statement: Goal Bingo shall track and display the number of line clears broken down by the
  category of goals in each cleared line.
type: functional
rationale: Category breakdowns show which life areas the player is engaging. 8.1.
trace-to-source: design-description.md 8.1
verification-method: test
verification-criteria: The statistics screen shows a per-category clear count that
  increments when lines containing goals of that category are cleared.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-053 — Clears over time display
statement: Goal Bingo shall track and display the player's clear history over time.
type: functional
rationale: Trend data shows whether the habit is holding. 8.1.
trace-to-source: design-description.md 8.1
verification-method: inspection
verification-criteria: The statistics screen shows a time-series view of clears.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-054 — Average clears per day display
statement: Goal Bingo shall calculate and display the player's average number of line
  clears per day.
type: functional
rationale: Average clears per day is the primary habit-strength indicator. 8.1.
trace-to-source: design-description.md 8.1
verification-method: test
verification-criteria: The displayed average matches the total clears divided by the number
  of days since first play.
verification-status: not-verified
owner: k
priority: must

---

## 8.2 — Challenge modes

### GB-FUN-055 — Universal challenge always active
statement: Goal Bingo shall maintain an active universal challenge at each point during
  a play session.
type: functional
rationale: The universal challenge is the coverage guarantee — each mark qualifies toward
  it. D-2026-09-19-17.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: Querying active challenges at any point returns at least one
  universal challenge.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-056 — Each mark qualifies for the universal challenge
statement: Goal Bingo shall increment the active universal challenge progress counter when
  the player makes each mark.
type: functional
rationale: The universal challenge has no category or cadence restriction. D-2026-09-19-17.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: After each mark, the universal challenge progress counter increments.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-057 — Category challenge, one per active category
statement: Goal Bingo shall maintain one active category challenge per unlocked category.
type: functional
rationale: D-2026-09-19-17. Category challenges unlock with the category itself.
  D-2026-09-19-16.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: For each category that is unlocked, exactly one category challenge
  is active.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-058 — Category challenge unlocks with its category
statement: When the player unlocks a new category, Goal Bingo shall create an active
  category challenge for that category.
type: functional
rationale: D-2026-09-19-16.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: Immediately after unlocking a category, a challenge counting marks
  in that category is active.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-059 — Cadence challenge, one per cadence tier
statement: Goal Bingo shall maintain one active cadence challenge per cadence tier.
type: functional
rationale: D-2026-09-19-17. Every goal has a cadence, so every player always qualifies.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: At all times, active challenges exist for hourly, daily, weekly, and
  long-term cadences.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-060 — A mark counts toward each qualifying challenge simultaneously
statement: When the player makes a mark, Goal Bingo shall increment the progress counter
  of each active challenge the mark qualifies for.
type: functional
rationale: Focused play earns more than scattered play without penalising either.
  D-2026-09-19-17.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: A mark on a daily health goal increments the universal challenge
  counter, the health category challenge counter, and the daily cadence challenge counter
  in one mark event.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-061 — Challenge pays board balance per qualifying mark
statement: Goal Bingo shall award board balance to the player at the moment each qualifying
  mark is made toward a challenge.
type: functional
rationale: Pay per mark, not per completion. This keeps income flowing on a jammed board.
  D-2026-09-19-8.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: Board balance increases immediately after a qualifying mark; the
  increment is positive and repeatable for each qualifying mark.
verification-status: not-verified
owner: k
priority: must
notes: Per-mark rate is TBD (owner: k, blocks: Q18 rates).

### GB-FUN-062 — Challenge pays completion bonus on reaching target
statement: When a challenge progress counter reaches the challenge target, Goal Bingo shall
  award a completion bonus in board balance.
type: functional
rationale: Completing a challenge earns a bonus on top of per-mark payments. D-2026-09-19-8.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: When the challenge progress counter reaches the target, an
  additional board balance award is made beyond the per-mark payments already issued.
verification-status: not-verified
owner: k
priority: must
notes: Completion bonus amount is TBD (owner: k).

---

## 8.3 — Achievements

### GB-FUN-063 — Achievements awarded for player-unset milestones
statement: Goal Bingo shall award achievements to the player when predefined milestones are
  reached.
type: functional
rationale: Achievements are discoveries the game hands back. 8.3.
trace-to-source: design-description.md 8.3
verification-method: test
verification-criteria: Reaching a defined milestone (e.g. first clear, long run) triggers
  an achievement award and displays it to the player.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-064 — Minimum achievement set
statement: Goal Bingo shall include achievements for at minimum: first clear, reaching a
  large grid size, a sustained run of daily clears, and a rare category combination.
type: functional
rationale: Named milestones ensure the achievement system covers the key game moments.
  8.3.
trace-to-source: design-description.md 8.3
verification-method: inspection
verification-criteria: The shipped achievement list contains entries for each of the four
  named milestone types.
verification-status: not-verified
owner: k
priority: must
notes: "Large grid", "sustained run", and "rare combination" thresholds are TBD.

---

## Unwanted behaviour — pool and storage

### GB-FUN-065 — Empty pool blocks draw with player prompt
statement: If the pool contains no goals eligible under the placement rules, Goal Bingo
  shall refuse the draw and prompt the player to add or edit goals.
type: functional
rationale: Never leave an empty playable cell (GB-FUN-007, GB-FUN-008). Auto-injecting
  goals would invent content the player did not choose. D-2026-09-20-1.
trace-to-source: design-description.md 4.1 design-description.md 4.4
verification-method: test
verification-criteria: With an empty pool, a clear or recycle that would refill a cell
  does not leave an empty playable cell; a prompt to edit the pool is shown.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-066 — Soft reset on unreadable local storage
statement: If Goal Bingo cannot read the player's stored pool, board, or balances, Goal
  Bingo shall reset to a playable fresh install with the starter goal set.
type: functional
rationale: Local-first with no account means there is no remote restore path. Soft reset
  beats a permanent refuse. Recoverable counters may be preserved when cheap; playability
  is mandatory. D-2026-09-20-1.
trace-to-source: design-description.md 9.2
verification-method: test
verification-criteria: With corrupted local storage, the next launch presents a playable
  board with a non-empty starter pool.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-067 — Goals already on the board remain eligible for redraw
statement: Goal Bingo shall allow a goal already present on the board to be drawn again
  into another cell.
type: functional
rationale: The pool is not a queue; goals may recur. A later preference to avoid
  duplicates can be an upgrade without changing this base rule. D-2026-09-20-1.
trace-to-source: design-description.md 4.1
verification-method: test
verification-criteria: A goal currently on the board can appear in a subsequent draw into
  a different cell.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-068 — Adjacency combinations are configurable
statement: Goal Bingo shall store the adjacency combination list and each combination's
  bonus value in configuration that can be changed without modifying application code.
type: functional
rationale: Adjacency values are tuning (Q7). A configurable table lets playtesting adjust
  without a rebuild. Supports GB-FUN-031.
trace-to-source: design-description.md 5.2
verification-method: test
verification-criteria: Changing the adjacency configuration and restarting the app causes
  a subsequent clear to score using the new values, with no application-code change.
verification-status: not-verified
owner: k
priority: must
notes: Initial combination list is the single seed entry from `D-2026-09-21-5`. Q7
  resolved.
