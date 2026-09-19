# Decisions — Goal Bingo

ADR-lite records. Newest first. IDs are permanent (`D-YYYY-MM-DD-n`) and are cited as the
source of requirements, so the reverse walk from a failing test ends here.

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
- **Consequence:** **the recovery floor is probabilistic, not absolute.** The expected time
  to break a jam is short but unbounded. This is a deliberate trade of a guarantee for
  friction, and the design owes a measured bound in exchange (Q20).
- **Expected outcome:** Simulation over the eventual draw weighting shows a median
  time-to-unjam of a small number of days from a maximal jam at zero balance. If the tail is
  long, the minimal tightening — never returning a long-term goal to the cell just vacated —
  closes it deterministically.
- **Revisit:** At the first prototype, against measured data. This is the headline thing a
  prototype exists to measure.

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
- **Expected outcome:** From a maximal jam at zero balance, one free recycle followed by one
  mark yields non-zero board balance. Directly simulable.
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
- **Revisit:** After the first playable prototype. If players routinely bank and never spend
  the free recycle, the rate is too generous.

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
  grid, and a fully deadlocked board (no line completable) is rare and always resolvable
  with power-ups affordable at that point in the game.
- **Revisit:** After the first playable prototype has run for two weeks of real daily use.

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
