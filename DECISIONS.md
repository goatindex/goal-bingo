# Decisions — Goal Bingo

ADR-lite records. Newest first. IDs are permanent (`D-YYYY-MM-DD-n`) and are cited as the
source of requirements, so the reverse walk from a failing test ends here.

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
