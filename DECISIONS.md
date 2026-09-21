# Decisions — Goal Bingo

ADR-lite records. Newest first. IDs are permanent (`D-YYYY-MM-DD-n`) and are cited as the
source of requirements, so the reverse walk from a failing test ends here.

## D-2026-09-21-19 — Mini-grid full-board bonus is +100% of the clear's value

- **Status:** open
- **Context:** GB-FUN-050 requires a full-board bonus when a mini-grid tile's internal
  clear is also the last cell to clear on the entire main board, with the amount
  explicitly flagged as TBD, blocked on Q7. Q7 (base point values) is now resolved
  (`D-2026-09-21-3/4/5`), so a bonus can be set relative to an already-established
  clear value the way `MULTI_CLEAR_BONUS_RATIO` already is.
- **Options considered:** +50%, reusing `MULTI_CLEAR_BONUS_RATIO`'s exact magnitude —
  rejected, a full-board clear (the single rarest event the game can produce — every
  other cell on the entire board already cleared) is qualitatively rarer than a
  same-mark multi-line clear and should not share its bonus size · +200% (triple) —
  rejected as a first cut, risks the bonus dominating the score of whatever line it
  rode in on, making the underlying clear's own value feel irrelevant · **+100% of
  the clear's value (chosen)** — doubles the mini-grid clear's value, distinctly
  larger than the multi-clear bonus without swamping it.
- **Why:** confirmed with the user directly — no simulation or existing requirement
  resolves this magnitude; achievements and advanced tiles sit entirely outside
  `sim/jam_sim.py`'s scope.
- **Expected outcome:** When a mini-grid tile's internal line completes and that cell
  was the only remaining unmarked cell on the main board, the score award includes an
  additional 100% of that clear's own value on top of the normal award.
- **Revisit:** After first playtest, alongside the other placeholder-grade scoring
  constants from `D-2026-09-21-3/4/5`.

## D-2026-09-21-18 — Multi-completion tiles default to 3 completions required

- **Status:** open
- **Context:** GB-FUN-045 requires a configured number of completions per
  multi-completion tile, "set at tile creation" per its own notes — a link-4
  decision. No simulation or existing requirement sets a default.
- **Options considered:** 2, the minimum the requirement's own wording ("two or
  more") allows — rejected as a default, barely distinguishable from an ordinary
  tile and undersells the "visible, structured commitment" framing (§7.1) · 5 —
  rejected as a first cut, a much larger step that risks feeling closer to a second
  long-term blocker than a moving, structured goal · **3 (chosen)** — a small but
  real multi-step commitment, matching WP-09's sustained-run achievement threshold
  (`D-2026-09-21-13`, also 3) for what this project treats as "visibly more than
  once."
- **Why:** confirmed with the user directly — no evidence exists to ground this
  number; picked for consistency with the one other "how many repeats counts as
  meaningful" number already set this session.
- **Expected outcome:** A multi-completion tile created without an explicit override
  requires 3 taps before it counts as marked. The mechanism itself stays fully
  parametric (any N is a valid input to the marking function) — this decision sets
  only the default a future creation/draw pathway should use.
- **Revisit:** After first playtest, or if a future advanced-tile type needs a
  different default (this decision covers the one type shipping now).

## D-2026-09-21-17 — Advanced-tile acquisition: 50 marks per category, 150 board balance secondary unlock

- **Status:** open
- **Context:** GB-FUN-043 needs a per-category lifetime mark threshold (progression
  unlock path) and GB-FUN-044 needs a board-balance price (economy secondary unlock
  path) for advanced-tile eligibility. Neither has simulation evidence — advanced
  tiles sit entirely outside `sim/jam_sim.py`'s scope. This requires a new counter
  (lifetime marks per category) that nothing currently tracks: WP-09's
  `stats.clearsByCategory` counts cleared cells, not raw marks, and WP-06's
  category challenges reset their counter every 10 marks (`D-2026-09-21-7`) rather
  than accumulating a lifetime total.
- **Options considered:** 25 marks / 100 board balance — rejected as a first cut,
  makes advanced tiles a near-term unlock reachable inside a single play session,
  undercutting the "bought into after some play" framing (§7) · 100 marks / 250
  board balance, matching grid expansion's own price — rejected as a first cut, a
  per-category advanced-tile unlock is a narrower, more repeatable reward than the
  single main long-arc progression item and shouldn't cost the same · **50 marks /
  150 board balance (chosen)** — roughly 5 challenge-cycles of focused play in one
  category (the universal/category/cadence challenge target is 10 marks per cycle,
  `D-2026-09-21-7`), and a price between the recycle-allowance upgrade (100,
  `D-2026-09-21-11`) and grid expansion (250, `D-2026-09-21-9`).
- **Why:** confirmed with the user directly — no evidence exists to ground either
  number; chosen to sit at a meaningful-but-reachable point relative to every other
  pacing number already set this session, rather than in isolation.
- **Expected outcome:** A category becomes advanced-tile-eligible the moment either
  path is satisfied: 50 lifetime marks recorded in that category, or a 150-board-
  balance purchase. Reaching the threshold after already purchasing (or vice versa)
  does not create two independent unlocks — eligibility is a single flag per
  category.
- **Revisit:** After first playtest, alongside the other WP-07/WP-08 pricing
  decisions.

## D-2026-09-21-16 — Advanced-tile draw/placement mechanism is out of scope for WP-08

- **Status:** open
- **Context:** None of WP-08's 8 requirements (GB-FUN-043–050) specify how an
  advanced tile actually appears in a board cell once a category is eligible —
  GB-FUN-043/044 only grant "availability"/"access," and GB-FUN-045–050 describe tile
  *behaviour* (completion counting, mini-grid clearing and scoring) assuming a tile
  instance already exists somewhere to behave. `work-packages/cut.md`'s partition is
  enforced exact (`scripts/partition_check.py`), and the WP-08 tracking issue itself
  says "do not silently absorb neighbouring requirements — raise a re-cut if the
  boundary is wrong."
- **Options considered:** invent a draw-integration mechanism now (e.g. a flat
  per-mark chance for an eligible category to draw an advanced variant) so the
  feature is playable end-to-end — rejected, no requirement asks for this and no
  evidence grounds a probability; inventing one risks committing to unrequested,
  unfounded policy the same way a silently-absorbed requirement would · **build the
  eligibility gate and tile mechanics only; leave draw/placement as an explicitly
  flagged gap (chosen)** — every GB-FUN-043–050 acceptance criterion is satisfiable
  by directly constructing a tile instance in a test, without deciding how the game
  would place one during ordinary play.
- **Why:** confirmed with the user directly. This mirrors WP-06's calendar-period
  scope note and WP-07's swap-price gap — a genuine gap in the baselined requirement
  set, flagged rather than silently resolved one way.
- **Expected outcome:** WP-08 ships advanced-tile eligibility (per-category flag,
  two unlock paths) and fully working multi-completion/mini-grid tile mechanics,
  each independently constructible and testable. No code path in this WP causes an
  advanced tile to appear on a board through ordinary play — that mechanism is
  undesigned and unscoped, flagged in `NEXT.md` for a future decision.
- **Revisit:** When a future work item designs how eligible categories actually
  produce advanced tiles during play — this decision's "out of scope" framing should
  be revisited at that point, not before.

## D-2026-09-21-15 — "Large grid" achievement threshold is size 7

- **Status:** open
- **Context:** GB-FUN-064's minimum achievement set names "reaching a large grid size" as
  one of four required milestones, with the threshold flagged as TBD.
- **Options considered:** a fixed cell count independent of `board.ts`'s
  `SUPPORTED_SIZES` — rejected, invents a second notion of "large" that could drift out
  of sync with what the game actually allows · **the largest currently supported size,
  7 (chosen)** — `SUPPORTED_SIZES` is `[5, 7]`; 7 is the only size larger than the 5x5
  start, so "large grid" has exactly one possible meaning today.
- **Why:** no genuine ambiguity exists while only two sizes are supported — this is not
  a tuning judgement call the way the other three GB-FUN-064 thresholds are, just a
  direct reading of an existing constant.
- **Expected outcome:** The achievement fires the first time `GameState.board.size`
  reaches 7 (via grid expansion, #102). If a third size is ever added to
  `SUPPORTED_SIZES` after its own `sim/jam_sim.py` run (GB-CON-014), this decision
  should be revisited to decide whether "large" tracks the new maximum or stays
  anchored at 7.
- **Revisit:** When `SUPPORTED_SIZES` next grows.

## D-2026-09-21-14 — "Rare category combination" achievement is any variety-combo clear

- **Status:** open
- **Context:** GB-FUN-064's minimum achievement set names "a rare category combination"
  as one of four required milestones, with no definition of "rare" and no simulation
  evidence (achievements are outside `jam_sim.py`'s scope entirely).
- **Options considered:** a clear including a player-unlocked custom category —
  rejected, ties an achievement's *name* ("rare combination") to category-unlock
  progression rather than to the combination itself, and would fire identically for
  any custom-category clear regardless of what else is in the line · **any
  variety-combo clear — all 5 cells in the clearing line have distinct categories
  (chosen)** — reuses `lines.ts`'s existing variety-combo detection (`comboMultiplier`)
  directly rather than defining a second, achievement-specific notion of rarity.
- **Why:** confirmed with the user directly — no simulation or existing requirement
  resolves this, so a concrete definition was proposed and confirmed rather than
  invented silently. Reusing the already-shipped "variety" combo concept from WP-05
  keeps the game's vocabulary consistent: a player who has already seen "variety"
  combo bonuses recognizes the achievement's trigger condition.
- **Expected outcome:** The achievement fires the first time a line clears where the 5
  cleared cells have 5 distinct categories (the same condition `comboMultiplier`
  already checks for the variety bonus).
- **Revisit:** After first playtest, if a variety clear turns out to be common enough
  that the achievement fires too early to feel like a discovery.

## D-2026-09-21-13 — Sustained-run achievement threshold is 3 consecutive calendar days

- **Status:** open
- **Context:** GB-FUN-064's minimum achievement set names "a sustained run of daily
  clears" as one of four required milestones, with no length specified and no
  simulation evidence.
- **Options considered:** 7 days (a full week, matching the "weekly" framing used
  elsewhere in the design doc and challenge targets) — proposed as the recommended
  default but not chosen · 14 days — rejected, a much longer commitment before the
  first badge fires, more appropriate for a later, harder achievement than the
  minimum set's baseline "sustained run" entry · **3 consecutive calendar days
  (chosen)** — reachable within the first few days of play, functioning closer to an
  onboarding nudge than a long-term milestone.
- **Why:** confirmed with the user directly, choosing the shorter of the three
  proposed options — no simulation or existing requirement resolves this length.
- **Expected outcome:** The achievement fires the first time the player has cleared at
  least one line on each of 3 consecutive calendar days (local device date, not a
  rolling 24h window — consistent with GB-FUN-054's own calendar-day framing for
  "average clears per day"). A day with zero clears breaks the streak back to 0.
- **Revisit:** After first playtest, if 3 days fires too early to register as a
  meaningful achievement, or if calendar-day (versus rolling-window) boundaries feel
  arbitrary to players near a day boundary.

## D-2026-09-21-12 — Clears-by-category counts per cell, not per line

- **Status:** open
- **Context:** GB-FUN-052 tracks clears "broken down by the category of goals in each
  cleared line," but a line can span multiple categories (WP-05's matching/variety/
  mixed combos already exist) — the requirement does not say whether a clear
  increments one category bucket, every distinct category present, or something
  weighted by how many cells hold each category.
- **Options considered:** per distinct category in the line (each category present
  gets +1 regardless of how many cells share it) — rejected, a 5-cell all-health
  matching line would count identically to a 1-health mixed line toward the health
  bucket, discarding real information about engagement intensity · **per cleared cell
  (chosen)** — each of the 5 cleared cells' categories gets +1 independently, so a
  5-health line adds 5 to the health bucket while a 1-health mixed line adds 1.
- **Why:** confirmed with the user directly. GB-FUN-052's own rationale is "category
  breakdowns show which life areas the player is engaging" (§8.1) — engagement is a
  property of individual goals marked and cleared, not of lines as a unit, so
  per-cell counting is the reading that actually serves the stated purpose.
- **Expected outcome:** `resolveLineClears`'s per-clear category tally increments once
  per distinct cell that clears — a cell shared by 2+ simultaneously-completing lines
  (an intersection cell) still contributes only once to its category, matching how
  the existing refill logic already treats it as one cell, not one occurrence per
  line it belongs to.
- **Revisit:** After first playtest, if per-cell counting makes the category
  breakdown too dominated by whichever category the player farms hardest to be a
  useful "neglected area" signal.

## D-2026-09-21-11 — Recycle-allowance upgrade caps at 3, flat 100 board balance per step

- **Status:** open
- **Context:** GB-FUN-037 (Q17) leaves the recycle-allowance upgrade's cap and per-step
  price open. Default allowance is 1 free recycle per 24h (GB-FUN-041). No simulation
  modeled the upgrade (`jam_sim.py`'s NOT MODELLED list explicitly names it).
- **Options considered:** cap 2, single 150-board-balance step — rejected, a one-shot
  upgrade is a smaller progression axis than the design doc's framing of "turns the
  release valve into a progression axis" (§6.2) implies · cap 3, escalating 100 then
  250 — rejected as a first cut, an escalating curve is a reasonable future refinement
  but adds a second axis of unfounded numbers (the escalation ratio) without evidence
  to ground it · **cap 3, flat 100 board balance per step (chosen)** — two purchasable
  steps (1→2, 2→3), predictable pricing, cheaper per step than grid expansion since
  it's an incremental unlock rather than the main long-arc goal.
- **Why:** confirmed with the user directly, for the same reason as `D-2026-09-21-9`/
  `D-2026-09-21-10` — no simulation evidence exists for this axis at all.
- **Expected outcome:** The player can purchase up to two upgrade steps, each for 100
  board balance, raising the free recycle allowance from 1 to 2 and then 2 to 3 per
  24-hour window. No further upgrade exists once the allowance reaches 3.
- **Revisit:** Alongside the other WP-07 pricing decisions, after first playtest.

## D-2026-09-21-10 — Swap costs 10 board balance

- **Status:** open
- **Context:** GB-FUN-038's swap power-up says "purchased with board balance" but,
  unlike GB-FUN-036/037, its `notes:` field never flagged a price TBD — a gap in the
  requirements-authoring pass rather than evidence the action is free. No simulation
  modeled swap either (`jam_sim.py`'s NOT MODELLED list).
- **Options considered:** 5 board balance (matching `D-2026-09-21-8`'s recycle cost
  exactly) — rejected, undervalues that swap preserves both goals in place while
  recycle discards one entirely · 20 board balance — rejected as a first cut,
  discourages the "cluster blockers together" consolidation use case
  (`D-2026-09-19-22`) the mechanic exists for, which needs to be usable often, not
  hoarded · **10 board balance (chosen)** — double the recycle cost, reflecting
  swap's extra positional value, while cheap enough to use freely.
- **Why:** confirmed with the user directly, for the same reason as `D-2026-09-21-9`
  — no simulation evidence exists, so the number is a judgement call rather than a
  measured result.
- **Expected outcome:** Activating swap and selecting two adjacent tiles costs 10
  board balance and exchanges their positions.
- **Revisit:** Alongside `D-2026-09-21-9` and `D-2026-09-21-7` — a first-playtest
  pacing review, not a safety one.

## D-2026-09-21-9 — Grid expansion (5x5 to 7x7) costs 250 board balance

- **Status:** open
- **Context:** GB-FUN-036 needs a price for the grid expansion power-up (Q10).
  `board.ts`'s `SUPPORTED_SIZES` is `[5, 7]`, so this is a single one-time purchase,
  not a stepped formula. No simulation modeled grid expansion (`jam_sim.py`'s header
  lists it under NOT MODELLED), and the A4 sensitivity run already showed the
  recovery floor holds at 7x7 independent of price — so this is a pacing choice, not
  a safety one.
- **Options considered:** 150 board balance (light, ~35-40 marks) — rejected,
  undersells the design doc's framing of expansion as "the main long-arc progression"
  (§6.2) if it's reachable within a single short session · 500 board balance (steep,
  100+ marks) — rejected as a first cut, risks feeling unreachable before the player
  has built up several parallel challenge streams · **250 board balance (chosen)** —
  roughly 60 marks at the economy's rough long-run rate once several challenges are
  cycling in parallel, a meaningful mid-session goal without being a multi-day grind.
- **Why:** confirmed with the user directly — no simulation evidence exists to ground
  this number, and inventing one silently would misrepresent it as evidence-based
  when it is a pacing judgement call.
- **Expected outcome:** Purchasing grid expansion deducts 250 board balance and
  permanently grows the board from 5x5 to 7x7.
- **Revisit:** After first playtest, alongside `D-2026-09-21-7`'s revisit trigger —
  if the whole board-balance economy's pacing turns out to run faster or slower than
  assumed here.

## D-2026-09-21-8 — Recycle cost is 5 board balance, ported from the simulation's own default

- **Status:** open
- **Context:** GB-FUN-039/042's paid recycle (beyond the free allowance) needs a
  board-balance price. Q10 covers power-up pricing generally. `jam_sim.py`'s
  `DEFAULTS` sets `recycle_cost=5` and uses it as the baseline for every experiment
  except its own A5 sensitivity sweep, which explicitly varies `recycle_cost` across
  `[2, 10]` (labelled Q10 in the sim's own comments) specifically to test this
  question.
- **Options considered:** invent an unrelated price — rejected, ignores existing
  tested evidence · adopt one of the swept extremes (2 or 10) — rejected, A5 shows
  the recovery floor's time-to-unjam and paid-recycle usage are statistically
  identical at both extremes (paid recycles average 0.00 across every player/
  tightening combination at both 2 and 10 — the free allowance alone resolves jams
  before a paid recycle is ever needed in the simulated scenarios), so neither
  extreme is privileged by the evidence · **5 board balance (chosen)** — the value
  used throughout every other experiment in the same instrument, including the ones
  `D-2026-09-20-8`'s grid sizing and `D-2026-09-21-1`'s cadence split already rely on.
- **Why:** recycle cost is not safety-critical the way grid size or cadence split
  were — A5 shows the recovery floor holds at every tested value — so there is no
  evidence-based reason to deviate from the simulation's own established default, and
  doing so would introduce a discrepancy against every other result in
  `sim/results.md` that assumed 5.
- **Expected outcome:** A recycle costs 5 board balance once the free allowance for
  that 24-hour window is exhausted (GB-FUN-042).
- **Revisit:** If board-balance income rates change (WP-06 tuning) such that 5
  becomes trivially cheap or prohibitively expensive relative to typical income.

## D-2026-09-21-7 — Challenge target is 10 marks; completion bonus equals the target

- **Status:** open
- **Context:** GB-FUN-062 requires a completion bonus "when a challenge progress
  counter reaches the challenge target," but no requirement sets what that target is,
  and `docs/design-description.md` §8.2 explicitly defers both ("specific rates and
  completion bonuses are tuning questions waiting for a prototype"). Unlike
  `D-2026-09-21-6`'s per-mark rate, no simulation models challenges at all
  (`sim/jam_sim.py`'s header says completion bonuses are ignored entirely), so there is
  no evidence to ground either number.
- **Options considered:** different targets per challenge type (universal lower since
  it is the coverage floor, category/cadence higher since they are narrower) —
  rejected, invents a second axis of unfounded numbers with no basis for the ratio
  between them · a large target requiring sustained multi-day play — rejected,
  delays the first observable completion bonus past the point a prototype could
  usefully show it working · **10 marks, uniform across universal, category, and
  cadence challenges, completion bonus equal to the target (10) (chosen)** — round
  enough to reach within a day or two of ordinary play (the universal challenge counts
  every mark), simple to reason about, and a completed challenge roughly doubles the
  income from that batch of marks before repeating.
- **Why:** WP-06's requirements describe an ongoing, always-active challenge (GB-FUN-055,
  057, 059 all say "maintain... at each point" / "at all times"), not a one-shot; no
  requirement mentions a calendar period. The simplest reading consistent with the
  literal text is a mark-count cycle: reach the target, pay the bonus, reset the
  counter, and the same challenge continues — rather than inventing a time-based
  period ("this week") that nothing in GB-FUN-055–062 actually requires.
- **Expected outcome:** Every challenge (universal, each unlocked category, each
  cadence tier) tracks progress toward a target of 10 qualifying marks. Reaching 10
  awards a completion bonus of 10 board balance on top of the per-mark payments
  already made, then the counter resets to 0 and progress continues toward the same
  target again.
- **Revisit:** After first playtest — particularly if 10 feels too fast or too slow to
  reach, or if universal (coverage floor) and category/cadence (narrower, harder to
  fill) turn out to need different targets after all.

## D-2026-09-21-6 — Board balance pays +1 per qualifying mark

- **Status:** open
- **Context:** GB-FUN-061 needs a per-mark board-balance rate (Q18). Unlike
  GB-FUN-062's completion bonus, this one already has direct evidence:
  `sim/jam_sim.py`'s recovery-floor simulation — the same one `D-2026-09-20-8`'s grid
  sizing and `D-2026-09-21-1`'s cadence split already rely on — hard-codes
  `self.balance += 1` per qualifying mark (`# D-8: per qualifying mark`), and its own
  header states plainly that completion bonuses are ignored in that model, so the
  already-validated recovery floor holds on per-mark income alone.
- **Options considered:** invent a different flat rate — rejected, would silently
  diverge from a number the recovery-floor result already depends on · scale the rate
  by how many challenges a mark qualifies for (universal + category + cadence at once,
  GB-FUN-060) — rejected, nothing in the requirements ties the *payment* to the
  *count* of qualifying challenges, only the progress counters (GB-FUN-060 increments
  each qualifying challenge's counter, GB-FUN-004/GB-CON-012 describe a single board-
  balance increase per mark) · **+1 board balance per qualifying mark, flat, regardless
  of how many challenges it also progresses (chosen)** — matches the simulation exactly.
- **Why:** Every mark always qualifies for at least the universal challenge
  (GB-FUN-055 has no restriction), so GB-FUN-004's "mark qualifies toward at least one
  active challenge" condition is unconditionally true — the simulation's unconditional
  per-mark increment already models exactly this.
- **Expected outcome:** Every mark increases board balance by 1, independent of which
  or how many challenges (universal, category, cadence) it also progresses. This
  keeps the recovery-floor guarantee (`sim/results.md`) valid without re-running the
  simulation.
- **Revisit:** If a future re-run of `sim/jam_sim.py` models completion bonuses or a
  different per-mark rate and finds the recovery floor still holds, or after first
  playtest data on how income actually feels.

## D-2026-09-21-5 — Adjacency bonus seed rule: +1 per cleared cell adjacent to a marked cell

- **Status:** open
- **Context:** GB-FUN-031 requires an adjacency bonus mechanism that is a genuine
  function of board state (zero when nothing qualifies, non-zero and board-state-
  dependent otherwise); GB-FUN-068 requires the combination list and its values to live
  in configuration, not code. `docs/design-description.md` §5.2/§11 explicitly defers
  which combinations exist and what they are worth ("open") — unlike the grid-size and
  cadence-split questions, there is no simulation or prior decision to ground this in.
- **Options considered:** no seed rule, mechanism only (always returns 0) — satisfies
  GB-FUN-068's configurability trivially but fails GB-FUN-031's own criterion that a
  qualifying condition must produce a non-zero, board-state-sensitive bonus · a rich
  multi-combination table (lines of a shape, clusters, etc.) — more faithful to "what
  sits next to the cleared line" as a long-term vision, but invents several numbers at
  once with no basis for any of them · **one seed combination: a cleared cell adjacent
  (up/down/left/right, not diagonal) to a still-marked cell scores +1 per such neighbour
  (chosen)** — a single, genuinely board-state-dependent rule, simple enough to
  implement and test now, that rewards exactly the framing in §5.2 ("what sits next to
  the cleared line... makes the board a single object").
- **Why:** GB-FUN-031's criteria need *some* real rule to be testable at all — a
  mechanism that always returns zero cannot demonstrate "a line clear with no
  qualifying adjacency condition produces zero" as distinct from "always produces
  zero." One small, honest combination is preferred over several invented ones.
- **Expected outcome:** The adjacency configuration (GB-FUN-068) starts with exactly one
  entry: `{ name: "adjacent-marked", value: 1 }`. Adding, removing, or reweighting
  combinations later is a config change, not a code change.
- **Revisit:** After first playtest, once the base value and combo multipliers below
  have been felt in practice — the richer adjacency vision in §5.2 (clusters, shapes)
  is future work, not reopened by this decision.

## D-2026-09-21-4 — Matching and variety combo bonuses are both +50%

- **Status:** open
- **Context:** GB-FUN-029 (matching: every tile in the line shares a category) and
  GB-FUN-030 (variety: every tile is a distinct category) both need a bonus multiplier.
  `D-2026-09-19-19` already decided the two combos are symmetric — "both are harder
  than a mixed line, and both should pay a bonus" — with no stated reason to favour one
  strategy's payout over the other's.
- **Options considered:** different multipliers per combo (e.g. reward variety more
  since it is harder to arrange with binding placement rules also in play) — rejected,
  no evidence yet that one is actually harder to set up in practice, and inventing an
  asymmetry without a reason to prefer it just adds a second unfounded number ·
  **+50% for both (chosen)** — reuses the multi-clear bonus's already-established
  magnitude (`D-2026-09-20-9`) rather than inventing a new one, and keeps the two
  combos symmetric exactly as `D-2026-09-19-19` intended.
- **Why:** A magnitude this codebase has already committed to and tested is a better
  default than a freshly invented one, and symmetry matches the requirement pair's own
  stated intent.
- **Expected outcome:** A matching or variety line clear scores 150% of its base value
  (before adjacency); a line that is neither gets 100%. The two bonuses do not stack —
  a line cannot be both all-one-category and all-different-category at once.
- **Revisit:** After first playtest, particularly if one combo turns out much easier to
  arrange than the other in practice (the binding placement rules from WP-04 constrain
  category distribution, which could make variety harder than matching in ways not
  visible from the requirements alone).

## D-2026-09-21-3 — Base clear value scales with cadence: 1 / 2 / 3 / 5 points

- **Status:** open
- **Context:** GB-FUN-028 requires a cleared line's base value to scale with the
  cadences of its goals, higher cadence worth more. `docs/design-description.md` §5.1
  and §11 (Q7) explicitly say no point values are set and that they are "a tuning
  problem that needs a playable board before any number means anything" — there is no
  simulation evidence for this one, unlike the grid-size and cadence-split decisions.
- **Options considered:** a steep curve (e.g. 1/3/9/27, roughly tripling per step) —
  rejected, would make long-term-heavy lines dominate scoring so completely that the
  matching/variety combo bonuses below become irrelevant by comparison · a flat value
  regardless of cadence — rejected, directly contradicts GB-FUN-028's own statement ·
  **1 (hourly) / 2 (daily) / 3 (weekly) / 5 (long-term) points per tile, a line's base
  value is the sum of its tiles' values (chosen)** — small whole numbers, a clear and
  gently-increasing ordering, and long-term still stands out (5x hourly) without
  swamping the combo and adjacency bonuses layered on top.
- **Why:** The values themselves are explicitly placeholder-grade per §11, so the
  priority is a shape that keeps every other scoring mechanism (combos, adjacency)
  meaningful relative to it, not a "correct" magnitude that doesn't exist yet.
- **Expected outcome:** `CADENCE_BASE_VALUE = { hourly: 1, daily: 2, weekly: 3,
  'long-term': 5 }`; a cleared line's base value sums each of its cells' cadence value.
  GB-FUN-003's reward-balance award and GB-FUN-033's lifetime-score increase both use
  this base value (plus combos and adjacency) as the clear's total value.
- **Revisit:** After first playtest data exists — Q7 is closed by this decision plus
  `D-2026-09-21-4`/`D-2026-09-21-5`, but "closed" here means "a placeholder the game
  can be played and tuned against," not "final."

## D-2026-09-21-2 — Category domination threshold is 40% of board cells

- **Status:** open
- **Context:** Q21 asks what share of the board counts as one category dominating it
  (GB-FUN-024, binding placement rule 2). Unlike the grid-size and cadence-split
  questions, no existing simulation models categories at all — `sim/jam_sim.py`
  explicitly says so in its own header comment — so there is no precedent to ground this
  in, only the requirement's own purpose and the matching-combo mechanic it has to
  coexist with.
- **Options considered:** a tight cap near even distribution (~20%, close to 1/7 across
  the seven default categories) — rejected, would make the matching combo
  (`D-2026-09-19-19`, a full line of one category) very hard to legally build, fighting
  a mechanic the game wants to reward · a loose cap (~70%) — rejected, gives GB-FUN-024
  almost no teeth against the crowding-out problem it exists to prevent · **40% of board
  cells (chosen)** — on a 5x5 board (`D-2026-09-20-8`) that is 10 of 25 cells, comfortably
  above the 5-7 cells a single matching line needs; on 7x7 it is roughly 19 of 49. Either
  way, at least 60% of the board is guaranteed to serve other categories.
- **Why:** Balances the matching-combo mechanic's need for an achievable single-category
  line against GB-FUN-024's actual purpose (preventing one life area from crowding out
  the others) — a threshold has to leave both possible at once, and 40% is the point
  where a full line is easy but a monotone board is not.
- **Expected outcome:** A refill or recycle draw that would push a category's on-board
  share above 40% is rejected for that cell; the draw falls through to a different
  category rather than leaving the cell unfilled.
- **Revisit:** After first playtest — particularly if matching combos still feel too easy
  or too hard to set up, or if boards at 40% still read as visibly monotone to a player.

## D-2026-09-21-1 — Short-term cadence split is 40% hourly / 40% daily / 20% weekly

- **Status:** open
- **Context:** `D-2026-09-19-12` set the long-term draw share at ~5%; Q22 asks how the
  *remaining* 95% splits across the three short-term cadences (hourly/daily/weekly).
  This was already answered once, just not recorded as a decision: `sim/jam_sim.py`'s
  `SHORT_MIX = {hourly: 0.4, daily: 0.4, weekly: 0.2}` produced the recovery-floor
  numbers (`sim/results.md`) that `D-2026-09-20-8` relied on to pick the starting and
  verified grid sizes.
- **Options considered:** invent a different split now that the game is actually being
  built — rejected, it would silently invalidate the recovery-floor simulation results
  already cited as evidence for a *different*, already-made decision, without re-running
  anything · **adopt the split the simulation already used (chosen)** — it was already a
  reasonable one (most goals are hourly/daily rather than weekly, matching ordinary
  goal-tracking use), and it keeps every decision that traces back to `sim/results.md`
  internally consistent.
- **Why:** Consistency with a simulation result already spent on another decision matters
  more than optimizing this specific split in isolation — the two are coupled, and
  changing one without the other would make `D-2026-09-20-8`'s own justification stale.
- **Expected outcome:** GB-FUN-022's short-term-cadence weighting is `SHORT_CADENCE_MIX =
  {hourly: 0.4, daily: 0.4, weekly: 0.2}`, ported directly from the simulation rather than
  reimplemented from scratch. Q22 resolved.
- **Revisit:** If real playtest data shows a different natural frequency across
  hourly/daily/weekly goals than the simulation assumed.

## D-2026-09-20-9 — Multi-clear bonus is 50% of the summed base score of the clearing lines

- **Status:** open
- **Context:** GB-FUN-013 needs a bonus formula for a simultaneous multi-line clear. Q7
  (base point values, §5.1) is still open and out of scope for WP-03 — a formula that
  needs Q7 answered first would leave GB-FUN-013 blocked on an unrelated, larger question.
- **Options considered:** a flat fixed-point bonus regardless of base score — rejected, it
  does not scale with the base value Q7 eventually sets and decouples badly from it ·
  a per-additional-line multiplier (double = x2, triple = x3) — considered, more dramatic
  scaling for higher-order clears, but nothing so far justifies that curve over a simpler
  one · **a flat 50% of the summed base score across every line clearing on that mark
  (chosen)** — proportional, automatically scales once Q7 lands, and is simple to implement
  and test independent of the exact base value.
- **Why:** Resolves GB-FUN-013's blocker without requiring Q7 first, so WP-03 stays
  buildable. A single constant is easy to re-tune later if playtesting says otherwise.
- **Expected outcome:** GB-FUN-013's `verification-criteria` ("a double-clear produces a
  higher total score than two sequential single clears") holds under this formula for any
  positive base score. Q7 remains open for the base values themselves.
- **Revisit:** once Q7 sets real base point values and there is player data, revisit
  whether 50% is the right ratio.

## D-2026-09-20-8 — Starting grid is 5x5; expansion verified through 7x7

- **Status:** open
- **Context:** Q1 blocks GB-FUN-005 (starting grid size and expansion steps). This is not
  an unexplored question: `sim/jam_sim.py`'s A4 sensitivity run (`sim/results.md`) already
  tested grid sizes 3, 5, and 7 while investigating the recovery floor — the simulation's
  own default is grid 5, and all three sizes hold the floor (near-zero jam days at every
  setting tested).
- **Options considered:** start at 3x3, the smallest tested — rejected, too little surface
  area for the intersecting-line mechanics (GB-FUN-012, GB-FUN-014) to read clearly, and
  not the simulation's own baseline · start at 7x7, the largest tested — rejected, a larger
  starting investment before any board-balance economy exists to expand with (WP-07 is not
  built yet) · **start at 5x5, matching `sim/jam_sim.py`'s own default (chosen)**.
  For expansion: extend through 7x7 now, since both 5 and 7 are floor-verified · a further
  step to 9x9 was considered but not chosen yet — GB-CON-014 requires `sim/jam_sim.py` to
  run at a size before it ships as purchasable, and 9x9 has not been run.
- **Why:** Grounds the pick in the evidence that already exists for this exact question
  (the sim was run investigating Q1 itself) rather than inventing a number. Keeps
  GB-CON-014's obligation honest by not marking a size "supported" without having run the
  sim at it.
- **Expected outcome:** GB-FUN-005's `notes` record this decision in place of the TBD.
  Grid sizes 5 and 7 are the WP-03 build target; 9x9 and beyond are future work, gated on
  running `sim/jam_sim.py` at that size first.
- **Revisit:** when a size beyond 7x7 is needed — run `sim/jam_sim.py` at that size per
  GB-CON-014, then extend this decision rather than open a new one for the same question.

## D-2026-09-20-7 — Provisional custom-category unlock: lifetime score ≥ 10

- **Status:** open
- **Context:** GB-FUN-020 requires additional categories to unlock through progression.
  The unlock gate itself was deferred to link 4 (`D-2026-09-19-16`). WP-02 needs a
  falsifiable provisional gate to implement the requirement without inventing economy
  prices.
- **Options considered:** unlock immediately (available from start) — collapses into
  defaults and removes progression (rejected) · unlock via board-balance spend — needs
  WP-07 economy (deferred) · **lifetime score ≥ 10 unlocks one custom category slot
  (chosen, provisional)**
- **Why:** Uses an existing counter, is trivial to test, and can be replaced when
  progression thresholds are tuned without changing the requirement ID.
- **Expected outcome:** Players below score 10 cannot add a custom category; at 10+ they
  can name one additional category and assign goals to it.
- **Revisit:** At first playtest or when category-unlock progression is designed properly
  for WP-08/09. If score 10 is trivial or unreachable, replace the threshold — do not
  remove the unlock mechanic.

## D-2026-09-20-6 — Product app is Vite + TypeScript PWA under app/

- **Status:** open
- **Context:** WP-01 needs a runnable shell. No stack was settled at framing. The Phaser
  prototype is superseded (`D-2026-09-19-5`) and must not be evolved.
- **Options considered:** revive Phaser prototype — fights the restart decision (rejected) ·
  React/Next — heavier than the first package needs (deferred) · **Vite + TypeScript +
  vite-plugin-pwa in `app/` (chosen)**
- **Why:** Matches mobile-first PWA (`D-2026-09-19-1`), offline installability out of the
  box, small surface for link-5 agents, and leaves UI framework choice open for later
  packages.
- **Expected outcome:** `npm run build` in `app/` produces an installable offline shell;
  later packages land under `app/src` without a framework migration in WP-01.
- **Revisit:** Before WP-03 board UI if DOM/canvas needs prove awkward, or if a shared
  design system elsewhere in the portfolio should be adopted.

## D-2026-09-20-5 — Long-term draw-share verification tolerance is ±5 percentage points

- **Status:** open
- **Context:** `D-2026-09-19-12` sets the long-term draw share at roughly 5%. Link-3
  verification for GB-FUN-027 needs a falsifiable band. Without one, "approximately 5%"
  cannot be tested. The full draw-weighting formula remains open (Q6).
- **Options considered:** ±1 pp (4–6%) — tighter than simulation resolution and early
  tuning need (rejected) · leave TBD until Q6 — blocks verifying an already-decided
  target (rejected) · **±5 percentage points, i.e. observed share in 0–10% with target
  5% (chosen)**
- **Why:** Wide enough to absorb formula churn under Q6 without inventing the formula
  itself; narrow enough that a draw that behaves like 20% long-term fails. Matches the
  link-3 intent to make the settled dial testable.
- **Expected outcome:** Large-sample draw tests pass when long-term share is within
  0–10%; implementations outside that band fail GB-FUN-027.
- **Revisit:** When Q6 settles the formula. If the formula can hit 5% ±1 pp reliably,
  tighten the band; if ambient blocking drifts outside the intended feel at the edges
  of 0–10%, revisit the band before the formula.

## D-2026-09-20-4 — Free recycle allowance uses a rolling 24-hour window from first use

- **Status:** open
- **Context:** `D-2026-09-19-7` grants a free recycle allowance per 24 hours but does not
  define the epoch — calendar day, rolling window from last recycle, or rolling window from
  first use of the current budget. Link-3 mining needs a falsifiable clock.
- **Options considered:** calendar-day reset — simple but punishes late-evening play and
  couples the game to local midnight (rejected) · rolling window from each recycle —
  fragments the budget into per-use cooldowns and fights the "full budget restores"
  upgrade story (rejected) · **rolling window from first use of the current budget, with
  the full allowance restored at expiry (chosen)**
- **Why:** Matches player rhythm, keeps the upgradeable budget as a single pool, and stays
  independent of timezone. Default allowance is 1; upgrades raise the maximum restored.
- **Expected outcome:** Players who spend their first free recycle at time T recover the
  full current allowance at T+24h; mid-window spends draw down the remaining budget.
- **Revisit:** After first playtest. If players report the window as confusing relative to
  a calendar day, reconsider a local-midnight alternative.

## D-2026-09-20-3 — Grid expansion pricing must preserve the recovery floor

- **Status:** open
- **Context:** §3.1 and §6.2 note that expansion raises jam risk and that pricing "has to
  answer for" that. Q10 leaves prices open. Link 3 needs a binding *principle* without
  inventing a formula.
- **Options considered:** cost-relative price (price ≥ expected unjam cost) — needs settled
  challenge rates first (deferred) · progression gate alone — viable later as one way to
  satisfy the principle, not required now (deferred) · no principle — reopens the economic
  trap at larger grids (rejected) · **floor-relative: expansion pricing and unlock rules
  must leave the recovery floor holding at the expanded size (chosen)**
- **Why:** Protects the load-bearing recovery property while leaving price, progression
  gate, or both as later instruments. Verification reuses `sim/jam_sim.py`.
- **Expected outcome:** Every supported grid size meets the same floor bounds as
  `D-2026-09-20-2` / GB-CON-013 before that size ships as purchasable.
- **Revisit:** When Q10 prices are set. If the only way to hold the floor is an unlock gate
  that feels punitive, revisit the long-term draw share rather than abandon the principle.

## D-2026-09-20-2 — Recovery floor is a soft constraint; CI gate deferred to link 5

- **Status:** open
- **Context:** Q20 measured the floor (median same-day, p99 one to two days, zero trials
  jammed after 180 days). The property is distributed across draw, recycle, allowance, and
  challenge-income requirements. Link 3 needs it named without freezing process.
- **Options considered:** hard requirement that every related change re-runs the sim in CI —
  strong but premature before a build pipeline exists (deferred to link 5) · leave unstated —
  the floor silently disappears from the obligation set (rejected) · **name the property as
  a soft constraint verified by analysis; defer CI/process enforcement to link 5 (chosen)**
- **Why:** Keeps the measured guarantee visible and falsifiable. Avoids inventing CI
  machinery at requirements time.
- **Expected outcome:** GB-CON-013 cites the sim bounds; a link-5 work package owns when
  the sim is re-run after draw/recycle/allowance/income changes.
- **Revisit:** At link 5 decomposition. If the first build changes floor inputs without a
  regression check, promote to a hard gate immediately.

## D-2026-09-20-1 — Empty pool prompts; corruption soft-resets; on-board goals may redraw

- **Status:** open
- **Context:** Link-3 mining exposed three unwanted-behaviour gaps: empty/ineligible pool
  on draw, unreadable local storage, and whether goals already on the board may be redrawn.
- **Options considered:**
  - Empty pool: auto-inject starter goals — unjams the draw but invents player content
    (rejected) · leave empty cells — breaks the board invariant (rejected) · **refuse draw
    and prompt to add/edit goals (chosen)**
  - Corruption: refuse until fixed — dead app with no support path (rejected) · silent
    repair — hides data loss (rejected) · **soft reset to a playable fresh install with
    starter pool; preserve recoverable counters when cheap (chosen)**
  - Redraw: forbid duplicates — fights "pool is not a queue" (`§4.1`) (rejected) ·
    **allow redraw; prefer-not-on-board can be a later preference (chosen)**
- **Why:** Keeps the board invariant, stays local-first without an account, and leaves
  upgrade space for duplicate avoidance without changing the base draw rule.
- **Expected outcome:** Empty-pool draws never present an empty playable board; corrupted
  storage always relaunches playable; duplicate goals on the board remain legal.
- **Revisit:** After first playtest. If soft reset loses too much progress, add an export
  or optional backup path before inventing accounts.

## D-2026-09-19-25 — Ambient blocking targets a fixed share regardless of grid size

- **Status:** open
- **Context:** §10.4 describes ambient blocking — the fraction of lines on the board that
  carry at least one unmarked long-term goal. The draw-rate formula (`D-2026-09-19-12`)
  holds that share roughly constant across the three grid sizes tested in simulation
  (3×3, 5×5, 7×7). Q23 asked whether a fixed share is the right target, or whether it
  should vary with grid size — because 50% of 6 lines may feel different to a player than
  50% of 14 lines.
- **Options considered:** vary target share with grid size (e.g. lower share on large grids
  to keep absolute blocked-line count constant) — adds a free parameter with no data yet
  on player perception; can be revisited once playtesting exists (rejected for now) ·
  **fixed share regardless of grid size (chosen)**
- **Why:** The simulation held the floor safe at a fixed draw share across all grid sizes
  tested, and the perception difference is speculative — no playtest data yet justifies
  adding a second dial. A fixed share is the simpler rule. If playtesting reveals that a
  large board with 50% blocked lines feels overwhelming, this is the dial to touch.
- **Expected outcome:** Players on all grid sizes encounter roughly the same *proportion*
  of long-term blocked lines; whether absolute count matters is deferred to playtesting.
- **Revisit:** After first playtest on multiple grid sizes. If players report that large
  grids feel more oppressive or small grids feel too easy, adjust the target share by grid
  size.

## D-2026-09-19-24 — Mini-grid population defaults to the same goal pool; sub-pool and player-placed are upgrade options

- **Status:** open
- **Context:** A mini-grid tile contains a smaller internal bingo grid (`D-2026-09-19-20`).
  Q11 asks how the cells of that mini-grid are populated. Three options were on the table:
  draw from the same pool the main board uses, draw from a player-designated sub-pool, or
  let the player place goals manually.
- **Options considered:** sub-pool by default — requires the player to curate a second list
  before the mini-grid is useful; too much friction for a base feature (rejected) ·
  player-placed by default — same problem; the blank grid blocks progress until filled
  (rejected) · **same pool as default; sub-pool and player-placed available as upgrades
  (chosen)**
- **Why:** Drawing from the main pool is consistent with how every other tile is populated;
  the player has no extra setup work, and the mini-grid is immediately useful. Sub-pool and
  player-placed are genuine upgrades — they give more control at the cost of curation effort
  — and unlock later without cluttering the base game.
- **Expected outcome:** Mini-grid tiles work out of the box with no new player configuration;
  players who want finer control can unlock the sub-pool or player-placed upgrade.
- **Revisit:** If playtesting shows the default pool produces poor mini-grid goal sets (e.g.
  all same cadence, all same category), revisit whether the draw rules inside the mini-grid
  should differ from the main board's draw rules.

## D-2026-09-19-15 — Perpendicular progress is lost on a clear; compensation is an upgrade area

- **Status:** open
- **Context:** Clearing a row or diagonal empties cells that were contributing marks toward
  perpendicular lines. A player building a column can lose progress against their will when
  a row they also wanted to clear fires. Whether those marks are lost, preserved, or
  compensated is a core pacing rule (`§3.4`, Q14). The Q20 simulation assumed marks lost as
  its harsher input; the floor held under that assumption.
- **Options considered:** marks preserved across clears — reduces strategic tension, makes
  grid progress independent of clearing order, and makes any future upgrade doing the same
  thing meaningless (rejected) · automatic base-game compensation, e.g. a small balance
  credit — makes the game more forgiving but removes the differentiation space for upgrades
  and hides the pacing consequence that makes the rule interesting (rejected) · **marks
  lost; compensation mechanics are a flagged upgrade area (chosen)**
- **Why:** The loss is the rule that creates the pacing tension `D-2026-09-19-3` describes.
  Removing it at the base game level defuses that tension and eliminates the most natural
  space for upgrades that feel meaningful — a power-up that preserves or compensates
  perpendicular progress is a genuine purchase decision only if the base game does not
  already do it for free. Flagging it as an upgrade area records the intent without
  inventing mechanics that belong to a later link.
- **Expected outcome:** Players notice perpendicular loss and factor it into marking
  decisions; upgrade mechanics introduced later offer meaningful mitigation at a cost rather
  than fixing a base-game frustration.
- **Revisit:** After first playtest. If perpendicular loss is a major frustration point
  before any upgrades exist, consider adding a passive signal (count, notification) before
  adding compensation.

## D-2026-09-19-14 — The intersection cell is the visual focal point and anchor for the multi-clear bonus

- **Status:** open
- **Context:** When one mark completes two lines simultaneously, one cell is shared by both
  clearing lines (`§3.4`, Q4). What happens to that cell — visually and mechanically — was
  open.
- **Options considered:** intersection treated identically to any other cleared cell —
  wastes the most naturally dramatic moment in a round; a double-clear deserves a moment
  that acknowledges it (rejected) · flat bonus for the double-clear, unrelated to the
  intersection cell — misses the opportunity to make the cell itself feel significant; the
  goal it held is the obvious anchor (rejected) · **intersection cell receives distinct
  visual treatment and is the anchor for the multi-clear bonus calculation (chosen)**
- **Why:** The intersection is the only cell in the game that simultaneously completes two
  independent obligations. Making it the focal point of the reward is consistent with how
  the game values marks, and gives the player a clear read on what scored what. The exact
  animation and bonus formula are tuning questions; the principle that the cell is the
  anchor is the decision.
- **Expected outcome:** Double-clears are visually distinct and feel earned; players begin
  positioning for multi-line completions deliberately.
- **Revisit:** After first playable prototype. If the intersection animation makes it
  unclear which lines scored what, decouple the visual focal point from the bonus
  calculation.

## D-2026-09-19-13 — Diagonals count as lines; all completing lines resolve on a simultaneous mark

- **Status:** open
- **Context:** `§3.4` left two questions open: whether diagonals count as lines (Q2), and
  what happens when one mark completes a row and a column — or any two lines — at once (Q3).
  They are decided together because the answer to Q3 determines whether adding diagonals
  creates an exotic edge case or a natural play pattern.
- **Options considered (Q2):** diagonals excluded — reduces the strategic surface; on a
  5×5 grid drops from 12 lines to 10; the two diagonal lines are the ones most likely to
  intersect multiple rows and columns, so excluding them removes the most interesting
  multi-clear setups (rejected) · **diagonals count as lines (chosen)**
- **Options considered (Q3):** only one line resolves per mark, player chooses — punishes
  a positive outcome and introduces arbitrary choice at the moment of completion (rejected)
  · both lines resolve but only one refills — partial resolution is bookkeeping complexity
  for no gameplay benefit (rejected) · **every completing line resolves: each clears,
  scores, and refills; bonus points awarded for the multi-clear (chosen)**
- **Why:** Diagonals extend the board's strategic surface without changing its rules; they
  are lines like any other and should behave like any other. Full resolution of every
  completing line on a single mark rewards deliberate play and is the only resolution rule
  with no arbitrary component.
- **Expected outcome:** Multi-line completions — including diagonal intersections — are
  recognised as high-value plays; diagonals appear in planned lines rather than as
  incidental completions.
- **Revisit:** If diagonals make the grid too easy to complete or the diagonal placement
  constraint (`§4.4` rule 1) becomes a bottleneck in practice, consider removing diagonals
  as a later difficulty option rather than from the base game.

## D-2026-09-19-18 — Local-first, no account required; sync is a separate question

- **Status:** open
- **Context:** §9.2. The player's pool, board, score and rewards are personal data. The
  question is where that data lives by default and whether an account is required to use
  the app at all.
- **Options considered:** account required, cloud-primary (rejected — creates a barrier
  between a player and their own goals; a player who does not want to register cannot use
  the app; personal goal data in the cloud by default raises privacy expectations that go
  beyond what the core game needs) · cloud-first with optional local fallback (rejected —
  inverts the trust model; the safe default is the one that shares nothing) · **local-first,
  no account required (chosen)**
- **Why:** The player's data is theirs. The game is playable with no account, no network
  and no third-party dependency from day one. An account only makes sense when it enables
  something the player is actively choosing — sync across devices is the obvious candidate,
  and that is a separate decision (Q12). Keeping the default local-first also means the app
  works in any network condition and cannot be bricked by a service going away.
- **Scope:** this decision covers the baseline — local storage, no account gate. It does not
  settle whether sync is offered, on what terms, or what an account would unlock. Q12 is
  still open.
- **Expected outcome:** A player can install the app, define goals, and play indefinitely
  with no account created and no network call made for game data.
- **Revisit:** If the progression system (category unlocks, grid expansion) eventually
  requires a server-side record — for example, to prevent local manipulation — revisit
  whether a soft account gate for those features is acceptable. The baseline gameplay must
  remain account-free regardless.

## D-2026-09-19-17 — Challenge structure: universal, category, and cadence challenges run in parallel

- **Status:** open
- **Context:** Q18 — which mark-based challenges ship at first release and what they pay.
  Two constraints from earlier decisions bound the answer: all challenges must count from
  marks not clears (`D-2026-09-19-6`), and every mark must count toward at least one active
  challenge at all times (`D-2026-09-19-8`). The category model (`D-2026-09-19-16`) adds a
  third: category challenges must be available for every player category, including
  unlocked ones.
- **Options considered:** single challenge type, player picks one active at a time
  (rejected — a mark whose cadence or category misses the active challenge earns nothing,
  reopening the income gap `D-2026-09-19-8` closes) · category challenges only (rejected —
  same gap if a tile misses all active category challenges) · universal only (rejected —
  covers the gap but removes all incentive for focused play; a challenge layer that treats
  every mark identically is just a counter) · **three types, all running in parallel
  (chosen)**
- **The three types:**

  | Type | Shape | Coverage role |
  |---|---|---|
  | **Universal** | "Mark any N goals this [period]" | Always active; every mark qualifies; the coverage floor |
  | **Category** | "Mark N [category] goals this [period]" | One per player category; unlocks with the category (`D-2026-09-19-16`) |
  | **Cadence** | "Mark N [cadence] goals this [period]" | One per cadence tier; every goal has a cadence, so coverage is guaranteed |

- **Why:** No single-type option closes the `D-2026-09-19-8` coverage gap (every mark must
  count toward something) without also removing any reason to focus play — a universal-only
  layer treats every mark identically, and a category- or cadence-only layer reopens the gap
  for marks outside the active challenge. Running all three in parallel and additively is
  the only option that gives both properties at once.
- **Parallel means additive.** A mark counts toward every challenge it qualifies for
  simultaneously. A health-daily goal earns toward the universal, the health category
  challenge, and the daily cadence challenge at once. Focused play earns more than
  unfocused play without penalising either.
- **Coverage guarantee:** The universal challenge is always active and has no category or
  cadence restriction. No mark can ever fail to count toward something, satisfying the
  `D-2026-09-19-8` scope clause in full.
- **Category challenge lifecycle:** when a player creates or unlocks a new category, the
  matching category challenge becomes available immediately. There is no separate unlock
  step — the category and its challenge are one thing.
- **Payout structure:** per-qualifying-mark rate plus a completion bonus, as established in
  `D-2026-09-19-8`. Specific rates and bonus amounts are tuning questions waiting for a
  prototype and are not decided here.
- **Expected outcome:** Any mark always earns board balance; players who focus on a category
  or cadence earn more than players who scatter; the challenge layer creates a meta-goal
  axis that runs alongside the grid without requiring the player to manage it explicitly.
- **Revisit:** After first prototype. If parallel tracking is confusing, simplify to
  universal plus one player-selected challenge. If category challenges are so thin they
  feel pointless, raise their rate relative to the universal baseline.

## D-2026-09-19-16 — Categories are player-defined; seven defaults ship; new categories unlock through progression

- **Status:** open
- **Context:** §4.2 originally read: the first cut ships a fixed set; player-defined
  categories come later once scoring consequences are understood. Q5 (the starting category
  list) was open. Two decisions in this session settled both at once: categories are
  player-defined from the start, and the concern about scoring consequences is answered by
  the unlock gate rather than a time-based deferral.
- **Options considered:** fixed set forever, no player categories (rejected — limits
  expression; players with goals that do not fit the defaults cannot categorise them
  accurately until an unlock) · fully open from day one, no defaults (rejected — an empty
  category list on first launch is a blank page at the moment the player is least invested;
  also risks poorly-scoped categories breaking combos and stats before any feedback exists)
  · fixed first, player-defined added later after scoring is understood (original §4.2
  position, rejected — the unlock gate gives the same protection with less friction; there
  is no reason to lock player categories out entirely if they have to be earned) ·
  **defaults ship; player-defined categories unlock through progression (chosen)**
- **Default set (seven):**
  `health` · `study` · `creative` · `volunteering` · `relationship` · `home` · `work`
- **Why (these seven):** They cover the goal areas most players hold without needing a custom
  category on day one — physical and mental health, learning, creative and recreational
  work, relationships and community, domestic and administrative life, and career. *Creative*
  replaces the original *hobby* placeholder because it covers both artistic work and
  recreational making more accurately; *hobby* implies low-stakes leisure and would
  misclassify goals someone takes seriously. *Relationship*, *home*, and *work* fill gaps
  the original four left: goals in those areas would otherwise require misclassification or
  immediate unlocking.
- **Seven is also the combo surface.** §5.2's category combos require at least two
  categories in a line. Seven defaults means cross-category lines are achievable from day
  one; a smaller default set risks early boards where every line is mono-category and combos
  never fire.
- **Unlock mechanic:** the specific unlock gate — what earns a new category slot — was
  deferred to link 4. **Amended 2026-09-20:** a provisional gate ships in WP-02 via
  `D-2026-09-20-7` (lifetime score ≥ 10 unlocks one custom category slot). The principle
  here still stands: the gate exists and is earned through play, not purchased. The
  provisional threshold may be replaced when progression is tuned; do not remove the gate.
- **Expected outcome:** Most players' day-one goals fit the seven defaults without touching
  unlocks; cross-category combo play is possible from first session; the unlock system
  provides a meaningful progression axis beyond grid expansion.
- **Revisit:** After first prototype. If seven defaults feels overwhelming at first launch,
  move the least-used two to early unlocks. If players routinely create categories that
  overlap the defaults, the defaults need splitting or renaming. See also
  `D-2026-09-20-7` revisit for the provisional threshold.

## D-2026-09-19-23 — Advanced tile acquisition: per-category progression and economy; global unlocks can follow

- **Status:** open
- **Context:** §7 — how advanced tiles are acquired. The document left open whether they
  are bought with board balance like power-ups, unlocked at progression thresholds, or
  both. `D-2026-09-19-16` established that categories are player-defined with per-player
  progression, which bears on how advanced tile unlocks are structured.
- **Options considered:** global progression threshold only — one unlock level for the
  whole board, regardless of category (rejected — too coarse; a player who has worked
  heavily in one category should not wait for global progress to reflect it; also misses
  the design space of per-category tile variety) · economy purchase only, like a power-up
  (rejected — creates a recurring cost for what should be a structural board upgrade; also
  does not model the "earned through experience in a category" feel the design intends) ·
  **per-category progression as the primary gate, with economy as a secondary unlock;
  global unlocks can be added on top of a per-category foundation (chosen)**
- **Why:** Per-category trackers make the progression system legible — a player can see
  that their health tiles have advanced because they have done a lot of health goals. This
  is more motivating and more personal than a global level. Starting with per-category also
  means global upgrades can be introduced later without removing information; going global
  first and adding per-category later requires retrofitting all the tracking. The economy
  layer (board balance as a secondary unlock) keeps the progression purchasable for players
  who plateau in a category, without making it purely monetary.
- **Scope:** the specific progression metrics — what is tracked per category, what
  thresholds gate each advanced tile type, and what the economy price is — are link 4
  decisions. The principle here is: per-category primary, economy secondary, global
  additive-only.
- **Expected outcome:** A player who marks many health goals gains access to health-themed
  advanced tiles before a player who marks few; the unlock feels like an achievement in
  that category rather than a global level-up.
- **Revisit:** After first prototype. If per-category tracking produces too many separate
  progress axes to follow, consider collapsing closely related categories or adding a
  summary view before removing the per-category structure.

## D-2026-09-19-22 — The swap mechanic's purpose is consolidation; adjacent-only for base game; upgrades expand it

- **Status:** open
- **Context:** §6.2 — the swap power-up. The document described it as "consolidating"
  blockers into the same line, but left open whether consolidation was the *intended*
  mechanic and whether adjacent-only swapping was sufficient to achieve it (Q15).
- **Options considered:** swap as a general-purpose repositioning tool with no specific
  purpose (rejected — without a clear purpose the swap has no design constraint and risks
  becoming a solve-everything button) · multi-cell or free-placement swap from the start
  (rejected — too powerful as a base mechanic; removes strategic friction before the player
  has felt it) · **swap-for-consolidation as the stated purpose; adjacent-only in the base
  game; wider swap capabilities as upgrades or power-ups (chosen)**
- **Why (purpose):** Consolidation is the right framing. A swap that moves an achievable
  goal *into* a line the player is building, or that clusters two blockers into the same
  line to free the rest of the board, is strategically meaningful and consistent with the
  game's core loop. Naming the purpose sets the design constraint: a swap upgrade that
  bypasses consolidation is out of scope; one that makes consolidation easier or faster
  is in scope.
- **Why (adjacent-only):** Adjacent-only is a natural constraint that makes the swap cost
  something in planning. Moving a blocker two cells over requires two swaps or an upgrade;
  that is friction worth keeping. It is also the minimum implementation surface for a base
  mechanic.
- **Expected outcome:** Players use the swap to set up a clear or a favourable category
  combo, not as a general-purpose board editor; adjacent-only is enough of a constraint
  that swaps feel earned rather than routine.
- **Revisit:** After first prototype. If players find adjacent-only too limiting for the
  board sizes being played, introduce a non-adjacent swap upgrade before widening the base
  mechanic.

## D-2026-09-19-21 — No cross-device sync in first release; deferred as a long-term feature

- **Status:** open
- **Context:** Q12 — whether cross-device sync is offered, and on what terms. `D-2026-09-19-18`
  established local-first as the data default but explicitly left Q12 open. The answer now
  is: no sync in the first release. Local storage only.
- **Options considered:** sync via a cloud account at first release (rejected — adds
  server infrastructure and an account gate before the core game is proven; `D-2026-09-19-18`
  already explains why an account gate on the baseline is wrong) · opt-in file export and
  import as a lightweight sync substitute (deferred — useful but not the first release
  priority) · **no sync; local storage save only; defer to a later release (chosen)**
- **Why:** The first release needs to prove the game loop, not the infrastructure. Sync
  raises real questions — conflict resolution, account design, privacy model — that are
  worth solving properly rather than quickly. Deferring keeps the first release lean and
  makes sync a deliberate feature release rather than a rushed bolt-on.
- **Expected outcome:** The first release ships with no data leaving the device; a player
  switching devices starts fresh. This is acceptable for a first release of a goal-tracking
  game.
- **Revisit:** After the first release, based on player demand. If players are asking for
  sync more than any other missing feature, implement it as a deliberate feature with a
  proper account model. Export/import is the natural stepping stone.

## D-2026-09-19-20 — A mini-grid tile is cleared on the main board when a line completes inside it

- **Status:** open
- **Context:** §7.2 — mini-grid tiles. The document described the clearing mechanic
  ("clearing a line inside the mini-grid marks the parent tile") but left population,
  scoring, and the internal/external relationship open (Q11).
- **Decision:** The mini-grid is **internal** to its tile — it is a self-contained small
  board within a single cell of the main grid. Completing a line within the mini-grid is
  the sole condition for the parent tile to count as cleared on the main board. Nothing
  from the main board's draw or scoring logic reaches inside the mini-grid; the mini-grid
  is its own object.
- **Options considered:** mini-grid cleared when *all* cells inside are marked (rejected —
  too long; a 3×3 internal grid requiring nine marks makes the tile essentially
  incompletable at normal play speed) · mini-grid cleared when any cell inside is marked
  (rejected — trivialises the tile; it becomes a slower-resolving ordinary tile) ·
  **one completed internal line clears the parent tile (chosen)**
- **Why:** A single internal line is proportionate — harder than an ordinary tile, easier
  than filling the whole mini-grid, and it preserves the bingo mechanic the game is built
  on. Internal isolation means the mini-grid can be designed independently and avoids draw
  and scoring leakage between levels.
- **Still open:** how the mini-grid is populated (from the same pool, a sub-pool, or
  player-placed), and how completing the internal line scores relative to a normal clear.
  These are link 4 / tuning decisions.
- **Expected outcome:** Mini-grid tiles are noticeably harder than ordinary tiles;
  completing one feels like a meaningful achievement; the internal bingo mechanic is
  recognisable rather than alien.
- **Revisit:** After first prototype with mini-grid tiles. If one internal line is too easy
  on small grids, require two.

## D-2026-09-19-19 — Category combos: matching (all same) and variety (all different) are the two base types

- **Status:** open
- **Context:** §5.2 — combos and adjacency. The document listed category combos as one of
  three combo sources alongside adjacency and advanced tiles, but left what combinations
  exist and what they pay entirely open (Q8).
- **Decision:** Two category combo types ship in the base game:
  - **Matching** — every tile in a cleared line shares the same category. Rewards focus and
    deliberate single-category board building.
  - **Variety** — every tile in a cleared line is a different category. Rewards strategic
    spread and cross-category planning.
  Both are harder to achieve than a mixed line, and both should pay a bonus multiplier on
  the clear.
- **Options considered:** matching only (rejected — removes the strategic incentive to
  spread categories; a player who diversifies gets nothing for it) · variety only (rejected —
  punishes players who build focused category runs, which is the natural play pattern for
  a goal app) · matching and variety as named, paying bonus (chosen) · richer taxonomy
  with partial combos (e.g., 3-of-5 same category) — deferred to a later release; the
  base game needs the simplest combo surface that rewards both playstyles.
- **Why:** Matching and variety are opposite play patterns, and a goal app should reward
  both — a player who commits to one category and a player who deliberately spreads across
  several are each doing something meaningful, not one of them slacking. Shipping only one
  combo type leaves the other pattern earning nothing for a real strategic choice; shipping
  both, at the simplest all-same/all-different granularity, covers the base game without
  the added complexity of a partial-combo taxonomy that a prototype hasn't justified yet.
- **Numbers** (multipliers, thresholds) are tuning questions waiting for a prototype.
- **Expected outcome:** Players can recognise and aim for both combo types; a matching
  clear and a variety clear both feel like achievements worth building toward.
- **Revisit:** After first prototype. If variety combos are too hard to achieve on small
  grids, relax the all-different requirement to a majority; if matching combos are too easy
  to engineer, add a minimum line length before the bonus fires.

## D-2026-09-19-12 — Long-term draw share set to roughly 5%

- **Status:** open
- **Context:** `§4.4`'s draw weighting left the long-term share entirely open (Q6). Building
  the Q20 simulation needed a concrete value to run, and running it across a range (2–30%)
  showed that value is the dial that governs how much of the board is blocked by an
  unmarked long-term goal at any given moment — a chronic, ambient state distinct from a
  full jam, and one nobody had asked a question about until the numbers existed (§10.4).
- **Options considered:** light, ~2% (28% of lines blocked on average, ~130 clears per 180
  days — rejected, long-term goals become rare enough to undercut the design's central
  mechanic) · heavy, 10%+ (60%+ of lines blocked, matching what `D-2026-09-19-3`'s prose
  reads as occasional friction but the simulation shows as constant — rejected as more
  friction than the design's own language describes) · **moderate, ~5% (chosen)**
- **Why:** At 5% roughly 45–50% of lines carry a long-term tile at any moment — long-term
  goals as a regular presence rather than either an occasional event or the board's
  permanent condition. This is a felt-experience judgement the simulation could measure but
  not make; the choice itself is the point of asking.
- **Expected outcome:** Playtesting confirms the board reads as "often constrained,
  sometimes wide open" rather than "rarely constrained" or "always constrained".
- **Revisit:** After the first playable prototype. If long-term goals feel absent, raise it
  toward the 10% band; if the board feels permanently jammed, lower it toward 2%.

## D-2026-09-19-11 — Goals sit on two independent axes: category and cadence

- **Status:** open
- **Context:** Specifying the Q20 simulation needed concrete goal types. The document had
  a thematic axis (§4.2: health, study, hobby, volunteering) and a loose duration axis
  (§4.3: short-term versus long-term) without saying how they related, and "short-term"
  covered everything from drinking water to a weekly lesson.
- **Options considered:** cadence replaces the thematic categories, so a goal's category *is*
  its cadence (rejected — §5.2's category combos and §8.2's challenges lose their meaning;
  "mark twenty daily goals" is a far weaker hook for a goal app than "mark twenty health
  goals") · hourly/daily/weekly replace long-term goals, making a week the longest block
  (rejected — it defuses §10.3 and turns `D-2026-09-19-3`'s friction mild, unpicking four
  decisions) · **two independent axes, with four cadences: hourly, daily, weekly (recurring,
  collectively "short-term") and long-term (one-off, weeks to months) (chosen)**
- **Why:** Theme and rhythm are genuinely orthogonal — a health goal can be hourly or a
  months-long programme. Keeping long-term as a distinct fourth cadence preserves the
  blocking friction the design is built on, and the three recurring tiers give the draw
  weighting and the simulation concrete rates instead of a vague "short".
- **Expected outcome:** The Q20 simulation can be parameterised directly from this table
  without inventing a goal type, and §4.4's draw weighting can be stated per cadence.
- **Revisit:** If playtesting shows players do not distinguish hourly from daily goals in
  practice, collapse them.

## D-2026-09-19-10 — A recycle operates on unmarked tiles only

- **Status:** open
- **Context:** Review asked whether a marked tile can be recycled. Left undefined, it is an
  untested interaction with `D-2026-09-19-2`.
- **Options considered:** recyclable freely (rejected — it lets a mark vanish before its
  line clears, which reads against `D-2026-09-19-2`, and lets a player destroy banked
  progress by accident) · **unmarked tiles only (chosen)**
- **Why:** Blockers are unmarked by definition, so the recovery floor never needs to recycle
  a marked tile. Restricting it costs the design nothing and removes the conflict entirely.
- **Expected outcome:** No path exists by which a mark is removed other than its line
  clearing. Checkable by inspection of the eventual requirement set.
- **Revisit:** Only if a mechanic later needs to move a marked tile.

## D-2026-09-19-9 — The recycle draw obeys §4.4's placement rules; the floor is probabilistic

- **Status:** open
- **Context:** `D-2026-09-19-7`'s free recycle only rescues a jam if it produces something
  markable. A recycle draws from the pool, which contains long-term goals, so it can hand
  back another blocker.
- **Options considered:** a recycle always draws a short-term goal (rejected — it makes the
  floor deterministic, but turns recycling into a reliable way to convert any long-term tile
  into an easy one, which nibbles at `D-2026-09-19-3`) · constrain the draw only when the
  board is jammed (rejected — needs the jam detection already rejected in
  `D-2026-09-19-6`) · **extend §4.4's existing placement rules to the recycle path (chosen)**
- **Why:** It reuses a rule the design already has rather than inventing a special case, and
  it preserves the friction. The cost is accepted knowingly: where the recycled cell's row
  and column hold no other blocker, the rule permits a long-term goal back into the same
  cell, so a recycle can fail to help.
- **Consequence:** **the recovery floor is probabilistic, not absolute.** At the time this
  decision was made, whether the expected time to break a jam was actually short was
  unestablished — that gap became Q20.
- **Expected outcome:** Simulation over the eventual draw weighting shows a median
  time-to-unjam of a small number of days from a maximal jam at zero balance. If the tail is
  long, the minimal tightening — never returning a long-term goal to the cell just vacated —
  closes it deterministically.
- **Outcome (2026-09-19, same day):** **Confirmed, without needing the tightening.**
  `sim/jam_sim.py` measured median 0 days, p99 one to two days, zero trials still jammed
  after 180 days, across every grid size, project duration, draw share and recycle cost
  tested. See `sim/results.md` and `docs/design-description.md` §10.3.
- **Revisit:** Only if a later change to the draw or recycle rules could plausibly weaken
  the guarantee — grid expansion, a change to rule 1, or a much higher long-term draw share
  than `D-2026-09-19-12` sets. Not otherwise; this is measured, not assumed.

## D-2026-09-19-8 — Challenges pay board balance incrementally, per qualifying mark

- **Status:** open
- **Context:** Review found that `D-2026-09-19-6`'s jam guarantee assumed challenges pay
  during a jam, which was never established. §8.2 defines challenges as targets over a
  period; if they paid only on completion, a jammed board yielding one markable tile a day
  could never finish a weekly target and board income would be zero in exactly the state it
  exists to rescue.
- **Options considered:** pay on completion only (rejected — leaves the guarantee open and
  makes the recycle allowance carry the whole floor alone) · pay incrementally only while
  jammed (rejected — needs the jam detection already rejected in `D-2026-09-19-6`) · **pay
  incrementally per qualifying mark, with a completion bonus (chosen)**
- **Why:** It closes the hole without a mode switch: one mark produces one payment, so a
  single markable tile restarts income. It is also better feedback — a habit game that pays
  weekly teaches nothing about today.
- **Scope:** incremental payment only guarantees income if a matching challenge exists.
  §8.2 therefore carries a standing requirement that **at least one challenge is always
  active and the shipped set is broad enough that any mark counts toward something**. Without
  it, a player between challenges — or holding only challenges whose category misses the tile
  they just drew — earns nothing, and the trap reopens. This constrains Q18.
- **Expected outcome:** From a maximal jam at zero balance, one free recycle followed by one
  mark yields non-zero board balance, given the scope clause above. Directly simulable.
- **Revisit:** With Q18, when challenge payouts are set.

## D-2026-09-19-7 — A free recycle allowance of one per 24 hours, upgradeable

- **Status:** open
- **Context:** Two budgets (`D-2026-09-19-6`) keep income alive during a jam, but a new
  player with no meta-goal income yet, or one whose board jams early, still needs an action
  that costs nothing. This is the floor beneath the economy.
- **Options considered:** free and unlimited abandon of a blocking tile (rejected — lets a
  player strip out every hard goal and flatten the friction `D-2026-09-19-3` deliberately
  chose) · no free tier, rely on pricing alone (rejected — a valve the player cannot afford
  at zero balance is not a valve) · **a rate-limited free recycle, one per 24 hours, with
  the rate itself upgradeable (chosen)**
- **Why:** Rate-limiting is what stops the free action trivialising long-term goals — the
  cost is scarcity rather than currency. Making the rate upgradeable turns the release valve
  into a progression axis instead of a static safety net. This is the existing tile-recycle
  power-up (§6.2) gaining a free tier, not a new mechanic — the design description calls it
  "recycle" rather than "re-draw" from this decision onward.
- **Unconditional.** The allowance is available whether or not the board is stuck. Gating it
  on a jam was considered and rejected: it needs the jam detection `D-2026-09-19-6` already
  rejected, and an allowance a player cannot predict is hard to plan around. The known cost
  is that optimal play spends it daily regardless, which defers roughly seven blockers a
  week — deferred rather than escaped, since a recycled goal returns to the pool.
- **Relationship to `D-2026-09-19-2`:** this introduces the game's first timer. It refreshes
  an *allowance*; it does not decay a *mark*. `D-2026-09-19-2` stands unchanged, and the
  24-hour period is chosen because the game's natural rhythm is already daily.
- **Expected outcome:** No board state persists longer than 24 hours without the player
  having at least one action available, measured on a simulated jammed board at zero
  balance.
- **Revisit:** After the first playable prototype, against **two opposite failures**. If
  players routinely bank the allowance and never spend it, the rate is too generous. If they
  spend it every day regardless of need — which is what optimal play implies — it is eroding
  `D-2026-09-19-3`'s friction, and either gating it on a stuck board or cutting the rate
  should be reconsidered. Measure both: recycles used as a fraction of recycles available,
  and what share of those were spent while a completable line existed.

## D-2026-09-19-6 — Two spendable budgets; meta-goals fund board actions

- **Status:** open
- **Context:** The economic trap in §10.3. Balance was earned only by clearing lines, so a
  jammed board earned nothing and could not pay for the power-ups that would unjam it — and
  personal rewards drained the same pool, letting a player strand themselves voluntarily.
- **Options considered:** single balance with a jam-triggered grant (rejected — "jammed" is
  not reliably computable, since a long-term goal makes a board slow rather than strictly
  stuck, so any threshold either misfires or never fires) · paying income for marking as
  well as clearing (rejected — partially restores the checklist the grid exists to beat,
  §2.1) · line-clear budget buys board actions (rejected — leaves the structural trap fully
  intact) · both budgets buy both at different rates (rejected — loses the guarantee) ·
  **two budgets, with meta-goals funding board actions (chosen)**
- **Why:** Marking still works on a jammed board; only *clearing* stops. A budget fed by
  mark-based challenges therefore keeps earning straight through a jam, so the way out stays
  purchasable. Because personal rewards spend from the *other* budget, cashing out can never
  strand the player. It also makes the two layers fund each other: playing the board well
  buys real-life rewards, and doing your goals consistently buys board power.
- **Scope:** meta-goals are **mark-based challenges only** — targets counted from marking
  goals. Clear-based challenges are excluded because they are jam-blocked exactly like line
  income. Achievements (§8.3) stay non-monetary badges. Streaks are excluded for now.
- **Expected outcome:** On a simulated jammed board at zero balance, a player who keeps
  marking reaches a purchasable recycle. **Limit found in review:** in a *maximal* jam every
  unmarked cell is a blocker, so nothing is markable and this decision alone does not close
  the trap. `D-2026-09-19-7` covers that case and `D-2026-09-19-8` makes one mark sufficient
  to restart income; §10.3 states the combined guarantee and its probabilistic bound.
- **Revisit:** After the first playable prototype, and immediately if any board action is
  ever priced against the line-clear budget.

## D-2026-09-19-5 — Restart from design rather than evolve the Phaser prototype

- **Status:** open
- **Context:** `goatindex/goal-bingo` already held a working Phaser 3.70 prototype of an
  earlier version of this idea — a fixed 3x3/4x4/5x5 bingo card with goal management,
  categories, rewards and an achievement system. It never entered the trace chain: no
  design document, no decisions, no requirements.
- **Options considered:** evolve the prototype in place (rejected — it encodes a different
  game; a one-shot card that is filled and won, against a continuous board that clears,
  refills from a weighted pool, and carries an economy and advanced tiles. The loop and the
  data model both differ, so the parts that survive are incidental) · start a second repo
  and leave the old one (rejected — two repos called Goal Bingo, and the name already
  points here) · **clear this repo to design stage, preserving the prototype (chosen)**
- **Why:** There was no artefact to change — only code. Intake's usual warning against
  treating a change as new work does not bite when nothing upstream of the code exists.
  The prototype is kept as a tag, not deleted, because its Phaser scene, layout and audio
  work is a real reference even though its game is not this one.
- **Expected outcome:** Link 4's first work package is buildable without importing anything
  from the prototype. If more than roughly a third of the prototype ends up being lifted
  back in, restarting was the wrong call and evolving it would have been cheaper.
- **Revisit:** At the first build package.
- **Recovery:** tag `v1-phaser-prototype`, and the commit history before it.

## D-2026-09-19-4 — The design description covers the full vision; the cut happens at link 4

- **Status:** open
- **Context:** The founding braindump spans a core loop, an economy, statistics, challenge
  modes and achievements. Framing had to either scope down to a core-loop-only document or
  describe the whole thing.
- **Options considered:** core loop + points only (rejected — the economy and the advanced
  tiles change the loop's shape, so a document omitting them would need re-mining almost
  immediately) · core + economy (rejected — same objection, one layer up) · **full vision
  (chosen)**
- **Why:** Link 2 produces prose to mine, not a build plan. Trimming the document trims
  what requirements are allowed to exist; sequencing is decomposition's job at link 4,
  where the partition gate proves the cut. Scoping here would hide work rather than order
  it.
- **Expected outcome:** Link 4 cuts this document's requirements into three or more work
  packages with a shippable first package, and no section has to be rewritten to get there.
- **Revisit:** At the first decomposition pass.

## D-2026-09-19-3 — Long-term goals block their lines; advanced tiles are the later release valve

- **Status:** open
- **Context:** A long-term goal occupying a cell holds its row and column unclearable for
  as long as the goal takes. That is either the game's central friction or its central
  defect, and the answer shapes the whole board.
- **Options considered:** sub-milestone ticks from the start (rejected for now — it softens
  the friction before we know whether the friction is the fun) · long-term goals off-grid
  in a separate track (rejected — removes the tension the idea is built on) · **blocking by
  design, with advanced tile types as a bought-into extension (chosen)**
- **Why:** The block is the strategic problem the player is meant to plan around, and the
  power-ups already exist as the way out of it. Milestone behaviour arrives later as
  *advanced tiles* — tiles needing two or more completions, or carrying their own mini-grid
  — so the complexity is earned through play rather than present on day one.
- **Expected outcome:** Players route around a blocked line rather than abandoning the
  grid, and a fully deadlocked board (no line completable) is rare. **Amended 2026-09-19:**
  resolution is no longer claimed to come from power-ups the player can afford — the floor
  is the *free* recycle allowance (`D-2026-09-19-7`), and resolution is probabilistic rather
  than certain (`D-2026-09-19-9`).
- **Outcome (2026-09-19, same day):** "Rare" is confirmed by simulation — full jams occurred
  in under 0.05% of hours across every player model tested (`sim/results.md`). But the
  simulation also found the risk this decision anticipated is not the one that matters most:
  chronic *partial* blocking, not full jam, is the design's real ambient texture, and it is
  governed by the long-term draw share rather than by player behaviour (§10.4,
  `D-2026-09-19-12`).
- **Revisit:** After the first playable prototype has run for two weeks of real daily use —
  now specifically against §10.4's felt-friction judgement, not against jam frequency, which
  is already measured.

## D-2026-09-19-2 — A mark persists until its line clears

- **Status:** open
- **Context:** A continuous game needs a rule for when a completed cell stops counting.
  Without one the grid either saturates and stalls, or empties every night.
- **Options considered:** per-goal cadence, each goal re-arming on its own rhythm (rejected
  — most faithful to a mixed short/long-term pool, but it puts a timer on every cell and
  makes board state unreadable at a glance) · daily reset of all marks (rejected — punishes
  one bad day and makes long-term goals impossible to bank) · **marks persist until the
  line clears (chosen)**
- **Why:** It is the simplest rule that keeps the board legible — what looks marked is what
  is banked — and it puts all the pressure on completing lines, which is where the game is.
  Repetition is handled by the refill drawing a goal again, not by a cell silently
  un-marking underneath the player.
- **Expected outcome:** Board state is readable with no per-cell timers, and repeating
  health-category goals still recur often enough to drive a daily habit, measured by how
  frequently they reappear in the refill draw.
- **Revisit:** If the prototype shows the grid saturating faster than lines clear, per-goal
  cadence is the first alternative to try.

## D-2026-09-19-1 — Mobile-first progressive web app

- **Status:** open
- **Context:** A daily habit game has to be reachable at the moment the habit happens,
  which is on a phone. The platform choice constrains everything downstream.
- **Options considered:** native mobile app (rejected for now — better notifications and
  home-screen widgets, both of which matter here, but it puts an app-store gate between
  every change and the player) · desktop or web only (rejected — a habit tracker that is
  not in your pocket does not get used) · **mobile-first PWA (chosen)**
- **Why:** One codebase, installable to the home screen, and no store review between a
  change and a playtest. The capability gap that matters is notifications, and that is a
  known cost rather than a surprise.
- **Expected outcome:** A playable build reaches a phone home screen without an app store,
  and notifications are the only platform capability the design has to work around.
- **Revisit:** If reminders prove load-bearing for the habit loop rather than a nicety,
  reconsider a native shell.
