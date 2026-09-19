# Decisions — Goal Bingo

ADR-lite records. Newest first. IDs are permanent (`D-YYYY-MM-DD-n`) and are cited as the
source of requirements, so the reverse walk from a failing test ends here.

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
- **Options considered for Q2:** diagonals excluded — reduces the strategic surface; on a
  5×5 grid drops from 12 lines to 10; the two diagonal lines are the ones most likely to
  intersect multiple rows and columns, so excluding them removes the most interesting
  multi-clear setups (rejected) · **diagonals count as lines (chosen)**
- **Options considered for Q3:** only one line resolves per mark, player chooses — punishes
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
- **Why these seven:** They cover the goal areas most players hold without needing a custom
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
- **Unlock mechanic:** the specific unlock gate — what earns a new category slot — is not
  decided here. It belongs to link 4 when work packages for the progression system are cut.
  The decision here is that the gate exists and that it is earned through play, not
  purchased.
- **Expected outcome:** Most players' day-one goals fit the seven defaults without touching
  unlocks; cross-category combo play is possible from first session; the unlock system
  provides a meaningful progression axis beyond grid expansion.
- **Revisit:** After first prototype. If seven defaults feels overwhelming at first launch,
  move the least-used two to early unlocks. If players routinely create categories that
  overlap the defaults, the defaults need splitting or renaming.

## D-2026-09-19-25 — Ambient blocking targets a fixed percentage at every grid size

- **Status:** open
- **Context:** Q23 — whether the ~45–50% ambient blocking target (`D-2026-09-19-12`) should
  hold at a fixed percentage as the grid grows, or whether the *absolute* number of blocked
  lines should stay roughly constant. The Q20 simulation held ambient blocking roughly
  constant as a percentage across grids 3, 5 and 7 at a fixed long-term draw share, but
  did not test whether a player perceives 50% of 6 lines the same as 50% of 14.
- **Options considered:** fixed absolute count (e.g., always 4–6 lines blocked regardless
  of grid size) — a larger grid feels progressively more open as the player expands;
  expansion becomes a way to escape friction rather than extend it (rejected — this
  undermines `D-2026-09-19-3`'s design intent; the friction should scale with the board)
  · **fixed percentage, ~45–50% of lines blocked at any grid size (chosen)**
- **Why:** A fixed percentage means the board always feels equally constrained relative to
  its size. As the player expands, the number of blocked lines grows with the board, and
  the strategic challenge of managing long-term goals scales proportionally. Expansion
  unlocks more play surface, not an easier board. This is also what the simulation already
  implements — the draw share controls percentage directly, so no additional mechanism is
  needed to hold it.
- **Expected outcome:** A player on a 7×7 board has the same *proportion* of their lines
  constrained as they did on a 5×5; expansion feels like growth, not escape.
- **Revisit:** After playtesting at multiple grid sizes. If a larger board feels
  oppressively blocked at 50%, lower the draw share slightly for expanded grids (a
  per-grid-size draw share is a small mechanical change); if it feels too open, raise it.

## D-2026-09-19-24 — Mini-grid population defaults to the same pool; scoring equals a normal clear plus a full-board bonus

- **Status:** open
- **Context:** Q11 — how a mini-grid tile is populated and how completing the internal line
  scores. `D-2026-09-19-20` settled the clearing condition (one internal line). This
  decision settles the two remaining parts.
- **Population decision:** The mini-grid draws from the player's own goal pool by default —
  the same pool the main board draws from. Two upgrade options exist but do not ship in
  the base game:
  - *Sub-pool*: the player designates specific goals for mini-grid tiles.
  - *Player-placed*: the player manually assigns goals to each mini-grid cell.
- **Options considered for population:** sub-pool or player-placed as the default (rejected
  — adds a curation step before the player has experienced the mechanic; the base game
  should introduce mini-grids with minimum friction) · **same pool as default, upgrades
  add more control (chosen)**
- **Scoring decision:** Completing a line inside a mini-grid tile and clearing it on the
  main board scores the same as clearing any other tile's line on the main board. One
  exception: if the mini-grid tile is the last tile to clear on the main board — completing
  a full board clear — it earns an additional bonus on top.
- **Options considered for scoring:** higher base score than a normal clear (rejected —
  the difficulty premium is already captured by the mechanic requiring an internal line;
  double-counting it in the score creates a runaway incentive to fill the board with
  mini-grid tiles) · lower or same with no special case (rejected — completing a full
  board is a significant milestone; the last tile deserves acknowledgement regardless of
  type, and a mini-grid as the last tile is the hardest version of that milestone) ·
  **same as normal; bonus if last tile on the main board (chosen)**
- **Expected outcome:** Mini-grid tiles feel harder because they are, not because they pay
  disproportionately; a full-board clear ending on a mini-grid tile is the highest-value
  single moment in the game.
- **Revisit:** After first prototype with mini-grid tiles in play. If players avoid
  mini-grid tiles because the difficulty premium is not reflected in the score, revisit the
  base scoring; if they seek them out specifically for the score, the balance is right.

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
