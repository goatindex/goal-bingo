# Decisions — Goal Bingo

ADR-lite records. Newest first. IDs are permanent (`D-YYYY-MM-DD-n`) and are cited as the
source of requirements, so the reverse walk from a failing test ends here.

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
