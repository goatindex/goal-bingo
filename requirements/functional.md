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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/lines.test.ts` (a clear returns a board that is still playable) and an inspection of `app/src/shell.ts`: no game-over or level-complete view.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/storage.test.ts`: a marked cell survives a MemoryStorage reload, then the mark is gone after its line clears.

### GB-FUN-003 — Clearing awards reward balance
statement: When a line clears, Goal Bingo shall increase the player's reward balance by the
  value of the clear.
type: functional
rationale: Reward balance funds personal rewards. D-2026-09-19-6.
trace-to-source: design-description.md 2 design-description.md 5.3
verification-method: test
verification-criteria: After a line clears, the reward balance counter is greater by a
  positive amount equal to the computed clear value.
verification-status: verified
owner: k
priority: must
notes: Verified by `applyClearScore` in `app/src/lines.test.ts`: a clear increases reward balance by scoreDelta and leaves board balance unchanged.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `markBoardIncome` in `app/src/challenges.test.ts`: a qualifying mark with no completion pays the per-mark board-balance amount.

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
verification-status: verified
owner: k
priority: must
notes: Starting size is 5x5; expansion verified through 7x7 (`D-2026-09-20-8`). A further
  step to 9x9 or beyond is future work, gated on running `sim/jam_sim.py` at that size
  first (GB-CON-014). Q1 resolved.
  Verified by `app/src/expansion.test.ts`: the paid 5 to 7 step has equal axes. That is the only successive size.

### GB-FUN-006 — Grid expansion is permanent
statement: When the player purchases a grid expansion, Goal Bingo shall increase the grid
  size permanently.
type: functional
rationale: Expansion is a progression reward, not a temporary boost.
trace-to-source: design-description.md 3.1
verification-method: test
verification-criteria: After purchasing an expansion, the grid size is retained across app
  restarts.
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/storage.test.ts`: a purchased 7x7 board survives reload.

---

## 3.2 — Cells and tiles

### GB-FUN-007 — One tile per cell
statement: Goal Bingo shall hold exactly one tile in each cell at all times during active
  play.
type: functional
rationale: Cells that hold zero or two tiles are undefined game states.
trace-to-source: design-description.md 3.2
verification-method: test
verification-criteria: After create, mark, clear, and refill, every cell holds exactly one goal.
verification-status: verified
owner: k
priority: must
notes: Verified by `everyCellHasOneTile` in `app/src/board.test.ts` and `app/src/lines.test.ts` after create, mark, clear, and refill.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/lines.test.ts`: a clear refills every emptied cell before the board is returned.

### GB-FUN-069 — Cell shows its category cue
statement: Goal Bingo shall display each board cell's category cue on that cell together with the cell's goal title.
type: functional
rationale: Arrangement is the first targeted aesthetic, and matching and variety combos are scored from category. D-2026-09-26-2.
trace-to-source: design-description.md 3.2
verification-method: inspection
verification-criteria: On a board holding goals from two categories, a player can point to the cells that share a category without opening the pool, and every cell still shows its goal title.
verification-status: not-verified
owner: k
priority: must
notes: The form of the cue (band, corner, dot) is not set. If the cue makes titles unreadable on a 5–7 inch screen, keep it to a corner or a band (`D-2026-09-26-2` revisit).

### GB-FUN-070 — Category cue color is indexed by list position
statement: Goal Bingo shall select each category cue's color by the category's position in the player's category list.
type: functional
rationale: Categories are player-defined, so the color cannot come from a style named after the category. D-2026-09-26-2.
trace-to-source: design-description.md 3.2
verification-method: test
verification-criteria: A custom category unlocked after the seven defaults receives a cue color from the palette, and no style rule in the application names a category.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-071 — Cell content excludes cadence
statement: Goal Bingo shall limit a board cell's content to the goal title, the category cue, the mark state, and an advanced tile's progress.
type: functional
rationale: A cell at 5×5 has no room for a second cue beside the title and the category cue. D-2026-09-26-8.
trace-to-source: design-description.md 3.2
verification-method: inspection
verification-criteria: A board cell holding a long-term goal renders no cadence indicator, and the pool screen still shows that goal's cadence.
verification-status: not-verified
owner: k
priority: must
notes: Revisit at the first phone playtest: add a long-term-only marker if players cannot say which tiles block their lines (`D-2026-09-26-8`).

---

## 3.3 — Marking

### GB-FUN-009 — Marking requires only player input
statement: Goal Bingo shall mark a cell only when the player holds a press on that cell
  for the full hold duration, with no external verification.
type: functional
rationale: Marking is self-reported. No health API, sensor, or integration is required.
  The hold makes a mark deliberate and stops an accidental mis-mark. D-2026-09-19-5
  (restart from design, not prototype), 3.3 position, D-2026-09-26-4.
trace-to-source: design-description.md 3.3
verification-method: test
verification-criteria: A press held through the hold duration marks an unmarked cell
  once. A press released before the hold duration leaves the cell unmarked and pays no
  board balance. The same hold marks a mini-grid inner cell. The mark path sends no request
  and asks for no confirmation.
verification-status: not-verified
owner: k
priority: must
notes: Amended 2026-09-26 from "taps" to the press-and-hold (`D-2026-09-26-4`); id kept,
  verification reset. The hold duration is open (Q25): build against one named constant,
  not a number in this statement. The hold is the mark under every value of the
  advanced-tile presentation setting (`D-2026-09-26-3`). No `fetch` or
  `requestPermission` under `app/src` still holds from the earlier verification.

### GB-FUN-072 — Thumb bar has no Mark control
statement: Goal Bingo shall exclude a Mark control from the thumb bar.
type: functional
rationale: The playtest could not see the Mark control do anything, and the hold is the only way to mark. D-2026-09-26-4.
trace-to-source: design-description.md 3.3
verification-method: inspection
verification-criteria: The thumb bar shows no Mark control, and activating Board returns to the board and clears an armed recycle, swap, or place.
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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/lines.test.ts`: the final mark of a row, a column, and each diagonal clears that line.

### GB-FUN-011 — Line clears when every cell is marked
statement: When every cell in a line is marked, Goal Bingo shall clear the line: award
  score, empty the cells, and draw new goals into them from the pool.
type: functional
rationale: This is the core bingo mechanic. D-2026-09-19-13.
trace-to-source: design-description.md 3.4
verification-method: test
verification-criteria: Marking the final cell of a line triggers the clear sequence: score
  is incremented, cells empty, and are refilled before the board is playable again.
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/lines.test.ts`: the final mark awards score, unmarks the line, and refills it.

### GB-FUN-012 — All completing lines resolve on a simultaneous mark
statement: When a single mark simultaneously completes more than one line, Goal Bingo shall
  clear every completing line.
type: functional
rationale: D-2026-09-19-13.
trace-to-source: design-description.md 3.4
verification-method: test
verification-criteria: A mark that completes two lines triggers two separate clear awards
  and refills all cells from both lines.
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/lines.test.ts`: one mark that completes two lines clears both and scores both.

### GB-FUN-013 — Multi-clear bonus for simultaneous completion
statement: When a single mark clears more than one line simultaneously, Goal Bingo shall
  award bonus points for the multi-clear in addition to each line's base score.
type: functional
rationale: D-2026-09-19-13, D-2026-09-19-14.
trace-to-source: design-description.md 3.4
verification-method: test
verification-criteria: A double-clear produces a higher total score than two sequential
  single clears of the same lines; the increment is attributable to the multi-clear bonus.
verification-status: verified
owner: k
priority: must
notes: Bonus is 50% of the summed base score of the clearing lines (`D-2026-09-20-9`),
  decoupled from Q7's still-open base point values. Blocker resolved.
  Verified by `app/src/lines.test.ts`: the double-clear total is higher than clearing those two lines one after another.

### GB-FUN-014 — Intersection cell has distinct visual treatment
statement: When two lines clear simultaneously, Goal Bingo shall render the cell at their
  intersection as the focal point of that clear's moment, with a visual treatment distinct
  from cells that belong to only one clearing line, on the refilled board.
type: functional
rationale: The intersection is the anchor for the multi-clear bonus. D-2026-09-19-14,
  whose revisit fired at the first playtest; D-2026-09-26-1.
trace-to-source: design-description.md 3.4
verification-method: inspection
verification-criteria: After a double-clear, the refilled board shows which cells cleared,
  and the shared cell has a treatment the other cleared cells do not. A second mark is
  accepted before the moment ends. With reduced motion, the same cells and treatment show
  without motion.
verification-status: not-verified
owner: k
priority: must
notes: Amended 2026-09-26 from "distinct treatment" to the focal point of the clear moment
  (`D-2026-09-26-1`); id kept, verification reset. How long the moment stays up is open
  (Q25). The earlier evidence (`intersectionCells` in `app/src/lines.test.ts`, the
  `board-cell--intersection` class in `app/src/shell.ts`) still identifies the cell; it
  does not show a moment.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/lines.test.ts`: a row clear drops the marked count on the crossing column.

### GB-FUN-073 — Every clear shows a clear moment
statement: When one or more lines clear, Goal Bingo shall display on the refilled board which cells cleared and the score that clear awarded.
type: functional
rationale: The playtest found a clear was not visually rewarding: it only changed a number. D-2026-09-26-1.
trace-to-source: design-description.md 3.4
verification-method: inspection
verification-criteria: After a single-line clear and after a double-clear, a player can say which cells cleared and what that clear scored, and the cells shown hold the refilled goals.
verification-status: not-verified
owner: k
priority: must
notes: How long the moment stays up is open (Q25): build against one named constant. GB-FUN-014 covers the intersection's treatment in a multi-clear.

### GB-FUN-074 — A clear moment does not hold the next mark
statement: While a clear moment is displayed, Goal Bingo shall accept a mark on each unmarked cell.
type: functional
rationale: A daily mark should not wait on an animation. D-2026-09-26-1.
trace-to-source: design-description.md 3.4
verification-method: test
verification-criteria: A hold that completes while a clear moment is displayed marks its cell, with no wait for the moment to end.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-075 — Reduced motion keeps the clear moment's facts
statement: While the device requests reduced motion, Goal Bingo shall display the clear moment's cleared cells and score without animation.
type: functional
rationale: Reduced motion keeps the same information and drops the motion. D-2026-09-26-1.
trace-to-source: design-description.md 3.4
verification-method: inspection
verification-criteria: With reduced motion set, a clear shows the same cleared cells and score as without it, and no element of the moment animates.
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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/pool.test.ts`: a goal already on the board is drawn into a different cell.

### GB-FUN-017 — Starter goal set
statement: Goal Bingo shall provide a non-empty starting set of goals that the player can
  edit.
type: functional
rationale: An empty pool at first launch creates a blank-page barrier.
trace-to-source: design-description.md 4.1
verification-method: inspection
verification-criteria: On first launch, the pool contains at least one goal in each default
  category; the player can add, edit, and remove goals from the pool.
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/pool.test.ts` and the starter pool in `app/src/storage.ts`: first launch has a goal in each default category, and add, edit, and remove are covered.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/pool.test.ts`: an empty category is rejected, and every goal has one category.

### GB-FUN-019 — Seven default categories ship
statement: Goal Bingo shall provide the following seven categories on first install: health,
  study, creative, volunteering, relationship, home, work.
type: functional
rationale: D-2026-09-19-16. These are defaults, not the only categories.
trace-to-source: design-description.md 4.2
verification-method: inspection
verification-criteria: On first launch, the category list contains exactly these seven
  entries and the starter goals are distributed across them.
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/categories.ts` and `app/src/pool.test.ts`: first launch lists the seven default categories.

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
verification-status: verified
owner: k
priority: must
notes: Provisional unlock gate is lifetime score ≥ 10 unlocking one custom category slot
  (D-2026-09-20-7). Replaceable when progression is tuned; do not remove the gate.
  Verified by `app/src/pool.test.ts`: lifetime score at the unlock line adds one custom category and refuses a second.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/pool.test.ts`: an invalid cadence is rejected, and every goal has one cadence.

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
verification-status: verified
owner: k
priority: must
notes: Long-term share ~5% (`D-2026-09-19-12`); the remaining weight splits 40% hourly /
  40% daily / 20% weekly (`D-2026-09-21-1`, ported from `sim/jam_sim.py`'s `SHORT_MIX`,
  already validated across grid sizes 3/5/7 by that simulation's own A4 sensitivity run).
  Q6 resolved.
  Verified by the cadence sample in `app/src/draw.test.ts`: long-term draws are fewer than daily draws.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/draw.test.ts` and `app/src/lines.test.ts`: after a draw, no row or column holds two long-term goals.

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
verification-status: verified
owner: k
priority: must
notes: Domination threshold is 40% of board cells (`D-2026-09-21-2`). Q21 resolved.
  Verified by the refill-batch test in `app/src/lines.test.ts`: no category share over `CATEGORY_DOMINATION_THRESHOLD`. The no-legal-goal fallback remains the GB-FUN-008 case.

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
verification-status: verified
owner: k
priority: must
notes: Verified by the seed loop in `app/src/recycle.test.ts`: long-term rows and columns, and category share, stay within the binding rules.

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
verification-status: verified
owner: k
priority: must
notes: Tolerance of ±5 pp (0–10% band) is D-2026-09-20-5. Exact formula is deferred to Q6 (owner: k).
  Verified by `app/src/draw.test.ts`: a large sample draws long-term goals inside the 0–10% band.

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
verification-status: verified
owner: k
priority: must
notes: 1 (hourly) / 2 (daily) / 3 (weekly) / 5 (long-term) points per tile, summed
  across the line (`D-2026-09-21-3`). Q7 resolved (placeholder-grade, per that
  decision's own framing).
  Verified by `app/src/lines.test.ts`: a long-term line scores higher than an equal-length daily line.

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
verification-status: verified
owner: k
priority: must
notes: +50% multiplier (`D-2026-09-21-4`). Q7 resolved.
  Verified by `app/src/lines.test.ts`: a same-category line scores higher than a mixed line of the same cadence.

### GB-FUN-030 — Variety category combo bonus
statement: When every tile in a cleared line belongs to a different category, Goal Bingo
  shall apply a variety combo bonus multiplier to the clear value.
type: functional
rationale: Variety combos reward strategic spread. D-2026-09-19-19.
trace-to-source: design-description.md 5.2
verification-method: test
verification-criteria: A cleared line where all goals have distinct categories scores higher
  than a cleared line of the same cadences with repeated categories.
verification-status: verified
owner: k
priority: must
notes: +50% multiplier (`D-2026-09-21-4`). Q7 resolved.
  Verified by `app/src/lines.test.ts`: an all-distinct line scores higher than a line that repeats a category.

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
verification-status: verified
owner: k
priority: must
notes: Seed combination `{ name: "adjacent-marked", value: 1 }` (`D-2026-09-21-5`).
  See GB-FUN-068 for the configurability obligation. Q7 resolved.
  Verified by `app/src/lines.test.ts`: the same line scores higher when a marked neighbour is adjacent.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `applyClearScore` and `markBoardIncome`, which move the three counters independently. The home header in `app/src/shell.ts` renders lifetime, reward balance, and board balance; lifetime is also on the statistics view.

### GB-FUN-033 — Lifetime score only ever increases
statement: Goal Bingo shall increase the lifetime score when each line clears.
type: functional
rationale: Lifetime score is a record of achievement, not a currency. D-2026-09-19-6.
  A separate constraint (GB-CON-007) forbids any action from decreasing it.
trace-to-source: design-description.md 5.3
verification-method: test
verification-criteria: The lifetime score value after each clear event is strictly greater
  than its value before that event.
verification-status: verified
owner: k
priority: must
notes: Verified by `applyClearScore` in `app/src/lines.test.ts`: a positive scoreDelta increases lifetime and a zero delta does not.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/rewards.test.ts`: a reward is created with a name and a price, and the list survives a reload.

### GB-FUN-034b — Player removes personal rewards
statement: Goal Bingo shall enable the player to delete each personal reward they have
  created.
type: functional
trace-to-source: design-description.md 6.1
verification-method: test
verification-criteria: Deleting a reward removes it from the reward list.
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/rewards.test.ts`: deleting a reward removes it and leaves the others.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/rewards.test.ts`: a purchase changes reward balance only; board balance and lifetime stay as passed in.

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
verification-status: verified
owner: k
priority: must
notes: Price is 250 board balance for the single 5x5-to-7x7 step
  (`D-2026-09-21-9`). Q10 resolved for this requirement.
  Verified by `app/src/expansion.test.ts`: the purchase deducts board balance and grows a 5x5 board to 7x7.

### GB-FUN-037 — Recycle-allowance upgrade power-up
statement: Goal Bingo shall provide a power-up that permanently increases the number of
  free recycles available per 24-hour period.
type: functional
rationale: Turns the release valve into a progression axis. D-2026-09-19-7.
trace-to-source: design-description.md 6.2
verification-method: test
verification-criteria: After purchasing the upgrade, the free recycle allowance per 24
  hours is higher than before the purchase, and the increase persists across restarts.
verification-status: verified
owner: k
priority: must
notes: Caps at 3 free recycles per 24h (two purchasable steps above the default of 1),
  each step 100 board balance (`D-2026-09-21-11`). Q17 resolved.
  Verified by `app/src/storage.test.ts`: a purchased allowance level survives reload.

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
verification-status: verified
owner: k
priority: must
notes: Wider-range swap is an upgrade area, not a base-game feature. Price is 10 board
  balance (`D-2026-09-21-10`) — this requirement's own price was never flagged as a
  TBD despite Q10 covering power-up pricing generally; a requirements-authoring gap,
  now resolved.
  Verified by `app/src/swap.test.ts`: adjacent cells exchange goals, and a non-adjacent pair is refused.

### GB-FUN-039 — Recycle power-up replaces unmarked tile
statement: When the player activates a recycle on an unmarked tile that is not an advanced
  tile, Goal Bingo shall remove that tile from the cell and draw a replacement goal from
  the pool into the same cell. When the selected cell holds an advanced tile, Goal Bingo
  shall reject the recycle and leave the cell, the allowance, and the board balance
  unchanged.
type: functional
rationale: The recycle is the primary way out of a blocked line. D-2026-09-19-10.
trace-to-source: design-description.md 6.2
verification-method: test
verification-criteria: After a recycle of an unmarked tile that is not advanced, the
  selected cell contains a different goal; the prior goal is no longer visible in that
  cell. A recycle of an advanced tile is rejected, and that cell, the allowance, and
  the board balance are unchanged.
verification-status: verified
owner: k
priority: must
notes: Paid recycle cost (once the free allowance is exhausted, GB-FUN-042) is 5 board
  balance, ported from `sim/jam_sim.py`'s own `recycle_cost` default (`D-2026-09-21-8`).
  An advanced tile is not a recycle target (`D-2026-09-25-1`).
  Verified by `app/src/recycle.test.ts`: recycling an unmarked cell replaces its goal, and an advanced tile is refused with the cell, allowance, and balance unchanged.

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
verification-status: verified
owner: k
priority: must
notes: Default allowance is 1. The 24 h duration is fixed; epoch resets on each first use.
  Verified by `app/src/recycle.test.ts`: two free recycles in one window, then the next spends board balance.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/recycle.test.ts`: the free allowance is consumed before board balance is deducted.

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
verification-status: verified
owner: k
priority: must
notes: Threshold is 50 lifetime marks in the category (`D-2026-09-21-17`), split into
  two independent tracks — multi-completion and mini-grid unlock separately, both
  reading this same mark count (`D-2026-09-21-23`). Draw/placement — how an unlocked
  category's advanced tiles actually reach a board cell — was flagged and left
  unresolved by `D-2026-09-21-16`; resolved by `D-2026-09-21-23` and shipped in
  `app/src/advancedPlacement.ts` (automatic placement on unlock, a passive chance on
  later refills, and a paid on-demand action).

### GB-FUN-044 — Secondary advanced tile unlock via board balance
statement: Goal Bingo shall provide a secondary path to unlock advanced tiles using board
  balance, as an alternative to per-category progression.
type: functional
rationale: Economy provides a secondary unlock path. D-2026-09-19-23.
trace-to-source: design-description.md 7
verification-method: test
verification-criteria: With sufficient board balance and without meeting the progression
  threshold, the player can purchase access to an advanced tile slot.
verification-status: verified
owner: k
priority: must
notes: Price is 150 board balance (`D-2026-09-21-17`). Either unlock path (this or
  GB-FUN-043) sets the same per-category eligibility flag, not two independent grants.

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
  marked only after the player has completed N press-and-holds on it. A press released
  before the hold duration records no completion.
verification-status: not-verified
owner: k
priority: must
notes: Default is 3 completions (`D-2026-09-21-18`); the mechanism itself stays
  parametric to whatever N a tile is created with.
  Criteria amended 2026-09-26 from taps to press-and-holds (`D-2026-09-26-4`); statement
  and id kept, verification reset. The domain count is still covered by
  `app/src/board.test.ts` (a tile set for 3 completions stays unmarked until the third
  completion); the hold gate is not yet built.

### GB-FUN-046 — Multi-completion tile displays progress
statement: Goal Bingo shall display the current completion count on a multi-completion tile.
type: functional
rationale: The tile shows its progress so a long-term goal is not an opaque block. 7.1.
trace-to-source: design-description.md 7.1
verification-method: inspection
verification-criteria: A multi-completion tile at k-of-N completions visually shows k and N.
verification-status: verified
owner: k
priority: must
notes: Verified by inspection of `app/src/shell.ts`: a multi-completion tile renders completions so far and completions required.

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
verification-status: verified
owner: k
priority: must
notes: Internal grid is 3x3 (`D-2026-09-21-20`).
  Verified by `app/src/miniGrid.test.ts`: completing an internal line marks the parent cell.

### GB-FUN-048 — Mini-grid draws only from the parent tile's own category
statement: Goal Bingo shall populate mini-grid cells by drawing only from goals in the
  parent tile's own category, repeating goals if that category has fewer than 9
  distinct ones.
type: functional
rationale: Drawing from the parent category keeps a mini-grid thematically consistent
  with its parent tile and requires no additional player setup (`D-2026-09-21-23`,
  superseding `D-2026-09-19-24`'s original whole-pool default for this specific
  behaviour — the sub-pool/player-placed upgrade options `D-2026-09-19-24` also
  describes are unaffected and still don't ship in the base game).
trace-to-source: design-description.md 7.2
verification-method: test
verification-criteria: A mini-grid tile's 9 cells are all drawn from goals matching its
  parent category; a category with fewer than 9 distinct goals still produces a full
  9-cell mini-grid with some goals repeated, never falling back to another category.
verification-status: verified
owner: k
priority: must
notes: How a mini-grid tile actually reaches a board cell during ordinary play was
  flagged and left unresolved by `D-2026-09-21-16`; resolved by `D-2026-09-21-23` and
  shipped in `app/src/advancedPlacement.ts`, same as GB-FUN-043's gap.

### GB-FUN-049 — Mini-grid clear scores as a normal clear
statement: When a line completes inside a mini-grid tile, Goal Bingo shall score the clear
  using the same formula as a line clear on the main board.
type: functional
rationale: D-2026-09-19-24.
trace-to-source: design-description.md 7.2
verification-method: test
verification-criteria: Completing a line inside a mini-grid awards score and reward balance
  equal to what the same line would award on the main board.
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/miniGrid.test.ts`: the inner-line scoreDelta equals the same line scored with the main-board formula and no adjacency.

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
verification-status: verified
owner: k
priority: must
notes: Bonus is +100% of the clear's own value (`D-2026-09-21-19`). Q7 resolved for
  this requirement.
  Verified by `app/src/miniGrid.test.ts`: when the parent is the last unmarked cell, the award adds the full-board bonus on top of the clear.

---

## 7.3 — How an advanced tile is shown

### GB-FUN-076 — Advanced-tile presentation setting has two values
statement: Goal Bingo shall provide a "Show advanced tiles" setting with the two values "In the cell" and "Open larger".
type: functional
rationale: Readability of the two tile types is one problem with two tolerable answers, and screen size and preference differ. D-2026-09-26-3, D-2026-09-26-6.
trace-to-source: design-description.md 7.3
verification-method: inspection
verification-criteria: The setting offers exactly the two values "In the cell" and "Open larger", and the player can select either on a 390 px wide screen.
verification-status: not-verified
owner: k
priority: must
notes: Which value is the default is not set (`D-2026-09-26-6`).

### GB-FUN-077 — Open larger opens a tile without marking it
statement: When the player presses an unmarked advanced tile while "Show advanced tiles" is "Open larger", Goal Bingo shall open that tile in a sheet with the tile's mark state unchanged.
type: functional
rationale: The press that opens the tile is not a mark. D-2026-09-26-6.
trace-to-source: design-description.md 7.3
verification-method: test
verification-criteria: Under "Open larger", pressing a mini-grid tile or a multi-completion tile opens the sheet, and the tile's mark state and completion count are unchanged.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-078 — Marks are made inside the sheet
statement: While an advanced tile is open in the sheet, Goal Bingo shall accept the hold on that tile's inner cells and completion control.
type: functional
rationale: Under "Open larger" the player marks inside the sheet, and the mark stays the hold. D-2026-09-26-4, D-2026-09-26-6.
trace-to-source: design-description.md 7.3
verification-method: test
verification-criteria: In the sheet, a hold through the hold duration on a mini-grid inner cell marks that inner cell, and on a multi-completion tile records one completion.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-079 — In the cell accepts holds on the board
statement: While "Show advanced tiles" is "In the cell", Goal Bingo shall accept the hold on a mini-grid tile's inner cells on the board.
type: functional
rationale: The player who can read the tile at cell size marks it without a sheet. D-2026-09-26-6.
trace-to-source: design-description.md 7.3
verification-method: test
verification-criteria: Under "In the cell", a hold through the hold duration on a mini-grid inner cell on the board marks that inner cell, and no sheet opens.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-080 — Changing the setting marks nothing
statement: When the player changes the "Show advanced tiles" value, Goal Bingo shall leave each cell's mark state and each completion count unchanged.
type: functional
rationale: The setting changes only how a tile is shown. D-2026-09-26-3.
trace-to-source: design-description.md 7.3
verification-method: test
verification-criteria: Switching the value in either direction leaves the board's mark states, mini-grid inner marks, and multi-completion counts equal to their values before the switch.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-081 — The setting survives a restart
statement: Goal Bingo shall keep the chosen "Show advanced tiles" value across app restarts.
type: functional
rationale: The setting has saved values that present the same tile differently. D-2026-09-26-3.
trace-to-source: design-description.md 7.3
verification-method: test
verification-criteria: After the player chooses a value and the app restarts, the same value is in effect.
verification-status: not-verified
owner: k
priority: must

---

## 8.1 — Statistics

### GB-FUN-051 — Lifetime score display
statement: Goal Bingo shall display the player's current lifetime score.
type: functional
rationale: Statistics show the player their own pattern. 8.1.
trace-to-source: design-description.md 8.1
verification-method: inspection
verification-criteria: The player can view the lifetime score from the statistics screen.
verification-status: verified
owner: k
priority: must
notes: Verified by inspection of `app/src/shell.ts`: the statistics view shows the lifetime score.

### GB-FUN-052 — Clears by category display
statement: Goal Bingo shall track and display the number of line clears broken down by the
  category of goals in each cleared line.
type: functional
rationale: Category breakdowns show which life areas the player is engaging. 8.1.
trace-to-source: design-description.md 8.1
verification-method: test
verification-criteria: The statistics screen shows a per-category clear count that
  increments when lines containing goals of that category are cleared.
verification-status: verified
owner: k
priority: must
notes: Counted per cleared cell, not per line (`D-2026-09-21-12`) — a 5-cell matching
  line adds 5 to one category, a mixed line adds 1 to each represented category.
  Verified by `app/src/stats.test.ts` (the per-category tally increments) and inspection of `app/src/shell.ts` (the statistics view renders that tally).

### GB-FUN-053 — Clears over time display
statement: Goal Bingo shall track and display the player's clear history over time.
type: functional
rationale: Trend data shows whether the habit is holding. 8.1.
trace-to-source: design-description.md 8.1
verification-method: inspection
verification-criteria: The statistics screen shows a time-series view of clears.
verification-status: verified
owner: k
priority: must
notes: Verified by inspection of `app/src/shell.ts`: the statistics view lists clears by date.

### GB-FUN-054 — Average clears per day display
statement: Goal Bingo shall calculate and display the player's average number of line
  clears per day.
type: functional
rationale: Average clears per day is the primary habit-strength indicator. 8.1.
trace-to-source: design-description.md 8.1
verification-method: test
verification-criteria: The displayed average matches the total clears divided by the number
  of days since first play.
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/stats.test.ts`: the average equals total clears divided by days since first play, and `app/src/shell.ts` displays that value.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/challenges.test.ts`: the initial set contains one universal challenge.

### GB-FUN-056 — Each mark qualifies for the universal challenge
statement: Goal Bingo shall increment the active universal challenge progress counter when
  the player makes each mark.
type: functional
rationale: The universal challenge has no category or cadence restriction. D-2026-09-19-17.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: After each mark, the universal challenge progress counter increments.
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/challenges.test.ts`: one mark increments the universal challenge.

### GB-FUN-057 — Category challenge, one per active category
statement: Goal Bingo shall maintain one active category challenge per unlocked category.
type: functional
rationale: D-2026-09-19-17. Category challenges unlock with the category itself.
  D-2026-09-19-16.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: For each category that is unlocked, exactly one category challenge
  is active.
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/challenges.test.ts`: each unlocked category has exactly one category challenge.

### GB-FUN-058 — Category challenge unlocks with its category
statement: When the player unlocks a new category, Goal Bingo shall create an active
  category challenge for that category.
type: functional
rationale: D-2026-09-19-16.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: Immediately after unlocking a category, a challenge counting marks
  in that category is active.
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/challenges.test.ts`: unlocking a category creates its category challenge.

### GB-FUN-059 — Cadence challenge, one per cadence tier
statement: Goal Bingo shall maintain one active cadence challenge per cadence tier.
type: functional
rationale: D-2026-09-19-17. Every goal has a cadence, so every player always qualifies.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: At all times, active challenges exist for hourly, daily, weekly, and
  long-term cadences.
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/challenges.test.ts`: one cadence challenge exists for each cadence.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/challenges.test.ts`: a daily health mark increments the universal, health, and daily counters together.

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
verification-status: verified
owner: k
priority: must
notes: +1 board balance per qualifying mark, flat regardless of how many challenges it
  also qualifies for (`D-2026-09-21-6`, matching `sim/jam_sim.py`'s own per-mark
  assumption). Q18 (rate) resolved.
  Verified by `markBoardIncome(0)` in `app/src/challenges.test.ts`, equal to the per-mark amount.

### GB-FUN-062 — Challenge pays completion bonus on reaching target
statement: When a challenge progress counter reaches the challenge target, Goal Bingo shall
  award a completion bonus in board balance.
type: functional
rationale: Completing a challenge earns a bonus on top of per-mark payments. D-2026-09-19-8.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: When the challenge progress counter reaches the target, an
  additional board balance award is made beyond the per-mark payments already issued.
verification-status: verified
owner: k
priority: must
notes: Target is 10 qualifying marks, uniform across universal, category, and cadence
  challenges; completion bonus is 10 board balance (equal to the target), then the
  counter resets and the same challenge continues (`D-2026-09-21-7`). Resolved.
  Verified by `markBoardIncome(1)` in `app/src/challenges.test.ts`: the per-mark amount plus the completion target.

### GB-FUN-082 — Board screen shows the universal challenge
statement: Goal Bingo shall display the universal challenge's progress in one row on the board screen.
type: functional
rationale: Challenges are the only source of board balance, and the universal challenge counts every mark. One row shows that marking pays and leaves the space a larger grid needs. D-2026-09-26-7.
trace-to-source: design-description.md 8.2
verification-method: inspection
verification-criteria: The row shows the universal challenge's progress and fits under a 7×7 board on a 390×844 viewport without scrolling the board.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-083 — The challenge row opens the Challenges view
statement: When the player activates the challenge row, Goal Bingo shall open the Challenges view.
type: functional
rationale: The category and cadence challenges stay on that view. D-2026-09-26-7.
trace-to-source: design-description.md 8.2
verification-method: test
verification-criteria: Activating the challenge row shows the Challenges view with the universal, category, and cadence challenges.
verification-status: not-verified
owner: k
priority: must

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/achievements.test.ts` (a milestone unlocks the achievement) and inspection of `app/src/shell.ts` (the statistics view displays it).

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
verification-status: verified
owner: k
priority: must
notes: Large grid = board size 7, the only size above the 5x5 start
  (`D-2026-09-21-15`). Sustained run = 3 consecutive calendar days with at least one
  clear each (`D-2026-09-21-13`). Rare combination = any variety-combo clear, all 5
  cells distinct categories (`D-2026-09-21-14`). All three resolved.
  Verified by inspection of `app/src/achievements.ts`: the shipped set is first clear, large grid, sustained run, and rare combination.

---

## 9.3 — Appearance

### GB-FUN-084 — Light mode and dark mode
statement: Goal Bingo shall provide a light mode and a dark mode.
type: functional
rationale: The playtest found the board not visually pleasing, and both a light and a dark interface are wanted. D-2026-09-26-5.
trace-to-source: design-description.md 9.3
verification-method: inspection
verification-criteria: The player can switch the same board between a light palette and a dark palette, and category cues meet 3:1 contrast against the cell in both.
verification-status: not-verified
owner: k
priority: must
notes: Whether the chosen mode persists, and whether the first mode follows the device setting, are not decided.

### GB-FUN-085 — Switching mode leaves state unchanged
statement: When the player switches mode, Goal Bingo shall leave the board, the pool, and each counter unchanged.
type: functional
rationale: A mode changes how the board looks, not what it holds. D-2026-09-26-5.
trace-to-source: design-description.md 9.3
verification-method: test
verification-criteria: After a switch in either direction, the board's goals and marks, the pool, and the lifetime score, reward balance, and board balance equal their values before the switch.
verification-status: not-verified
owner: k
priority: must

### GB-FUN-086 — A mode is a token set
statement: Goal Bingo shall define each mode as a set of style tokens applied to the same markup.
type: functional
rationale: A further mode is then another token set, not another renderer. D-2026-09-26-5.
trace-to-source: design-description.md 9.3
verification-method: inspection
verification-criteria: The light and dark modes differ only in token values, and the markup contains no branch on the mode.
verification-status: not-verified
owner: k
priority: must

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
verification-status: verified
owner: k
priority: must
notes: Verified by `emptyPoolPromptHtml` in `app/src/shell.test.ts`: the prompt is present when the flag is set and absent when it is not.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/storage.test.ts`: corrupt storage returns softReset and a board for which `everyCellHasOneTile` holds.

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
verification-status: verified
owner: k
priority: must
notes: Verified by `app/src/pool.test.ts`: a goal already on the board is drawn into a different cell.

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
verification-status: verified
owner: k
priority: must
notes: Initial combination list is the single seed entry from `D-2026-09-21-5`. Q7
  resolved.
  Verified by `app/src/lines.test.ts`: scoring reads `ADJACENCY_CONFIG`; a changed value changes the total, and restoring the value restores the total.
