# Goal Bingo — design description

**Status:** draft · **Trace-chain link:** 2 (framing) · **Last changed:** 2026-09-19

This document says what Goal Bingo is and why, in prose a person can argue with. It is
**not** the obligation — requirements are mined from it at link 3 and cite its section
numbers as their source.

**Section numbers are append-only.** A requirement says "this came from §4.2". Renumber a
section and every pointer to it breaks silently. Add new sections at the end of their
parent; never renumber to tidy up.

Decisions cited as `D-…` are recorded in [`DECISIONS.md`](../DECISIONS.md).

## 1 Purpose

<!-- requirements: none - states what the document is for; the obligations live in the sections it introduces -->

Goal Bingo makes personal goal-tracking into a continuous game of bingo. The player's real
goals — take medication, drink water, study, volunteer, finish a course — occupy the cells
of a grid. Completing a goal in life marks its cell. Completing a full line clears it,
scores it, and refills those cells with new goals.

The problem it addresses is that habit trackers reward *streaks*, which are fragile and
punish a single bad day, and to-do lists reward *emptying*, which never happens. Bingo
rewards **arrangement** — which goal you choose next is a positional decision, not just a
chore, and a missed day costs you tempo rather than a streak.

## 2 The core loop

The loop is continuous. There is no end state, no level to finish, and no session boundary.

1. The grid holds one goal per cell, drawn from the player's goal pool.
2. The player completes a goal in life and marks its cell.
3. The mark persists — it does not decay or reset (`D-2026-09-19-2`).
4. When every cell in a line is marked, the line **clears**: those cells empty and refill
   from the pool.
5. Clearing scores points, based on what was in the line.
6. Points are spent on personal rewards and on power-ups.
7. Power-ups change the board itself — a larger grid, a swap, a re-draw.

### 2.1 Why bingo rather than a checklist

<!-- requirements: none - rationale for the choice of form; states no obligation on the system -->

A checklist has no geometry, so every item is worth the same and the only decision is
which to do first. A grid gives each goal a *position*, which means a goal's value depends
on what surrounds it. Doing the hard goal that completes a line beats doing two easy goals
that complete nothing. That positional pressure is the game.

## 3 The grid

<!-- requirements: none - container heading; its obligations are stated in its subsections -->

### 3.1 Size and shape

The grid is square and its size is variable. It starts small and is expanded by spending
points (§6.2). Expansion is the main long-arc progression: a larger grid holds more goals,
offers more lines, and makes higher-scoring combinations possible.

Starting size and the sizes expansion steps through are open (§11).

### 3.2 Cells and tiles

A cell holds one tile. A tile carries the goal drawn into it, its category, and whether it
is marked. Ordinary tiles need one completion. Advanced tiles (§7) need more.

An empty cell is a transient state between a line clearing and the refill landing; the
board is never left with holes the player can see for long.

### 3.3 Marking

Marking is **self-reported**. The player taps the cell when they have done the thing. There
is no verification, no sensor, no integration that confirms it.

This is a deliberate position, not a shortcut. The player is the only audience, so cheating
is self-defeating, and the alternative — gating a mark behind a health API or a photo —
turns a game into an invigilator and adds a whole class of failure the game gains nothing
from.

### 3.4 Lines and clearing

A line is a complete row or column. Whether diagonals also count is open (§11).

When a line's every cell is marked, the line clears at once: score is awarded (§5), the
cells empty, and the refill draws new goals into them (§4.4).

Two resolution questions fall out of this and are open (§11): what happens when completing
one cell finishes a row and a column simultaneously, and what happens to a cell that sits
in the intersection of two clearing lines.

## 4 Goals

<!-- requirements: none - container heading; its obligations are stated in its subsections -->

### 4.1 The goal pool

The pool is the set of goals the player has defined and is willing to be given. It is not a
queue — a goal stays in the pool after it is drawn, and can be drawn again.

The pool is the player's own; the game ships with a starting set they can edit rather than
an empty box, because an empty pool is a blank page at the exact moment the player is least
invested.

### 4.2 Categories

Every goal carries a category. Categories drive scoring combinations (§5.2), statistics
(§8.1) and challenge modes (§8.2).

The first cut ships a small fixed set with sensible progression rather than open
user-defined categories — health, study, hobby, volunteering and similar. Player-defined
categories are a later addition, once the scoring consequences of a category are understood
well enough that adding one cannot quietly break the economy.

The exact starting category list is open (§11).

### 4.3 Short-term and long-term goals

A goal is short-term (achievable in a day or so — take medication, drink water, a walk) or
long-term (weeks or months — finish a course, complete a project).

**A long-term goal blocks its row and its column for as long as it takes.** That is the
design, not a defect (`D-2026-09-19-3`). It is the strategic problem the player plans
around: a long-term tile makes two lines expensive, so the board's shape changes and the
player works elsewhere while chipping at it.

The risk this creates is real and named in §10.3.

### 4.4 Draw rates and refill

When cells empty, the refill draws from the pool. The draw is **not uniform**. It is
weighted by two things:

- **The goal's own rate.** A long-term goal should surface rarely; a daily health goal
  should surface often.
- **What is already on the grid.** The draw reads the current board so it does not stack
  long-term tiles into the same row, flood one category, or hand the player a board with no
  completable line.

The second is what keeps the board playable, and it is the first line of defence against
the deadlock described in §10.3. The weighting formula is open (§11).

## 5 Scoring

<!-- requirements: none - container heading; its obligations are stated in its subsections -->

### 5.1 What a clear is worth

Clearing a line scores. The base value comes from the contents of the line — a line of
long-term goals is worth more than a line of daily ones, because it cost more to assemble.

No point values are set here. They are a tuning problem that needs a playable board before
any number means anything (§11).

### 5.2 Combos and adjacency

On top of the base value, a clear is multiplied by how *interesting* the line was:

- **Category combos** — a line all of one category, or one deliberately spanning many.
  Both are harder than a line that happens to be mixed, and both should pay.
- **Adjacency** — what sits next to the cleared line. This is what stops the grid being
  five independent rows and makes the board a single object the player is arranging.
- **Advanced tiles** — a line containing a multi-completion or mini-grid tile (§7) carries
  the weight of what it took to clear it.

Which combinations exist, and what each is worth, is open (§11).

### 5.3 Score, and the balance it is spent from

Points do two incompatible jobs: they are the record of what the player has achieved, and
they are the currency they spend. Spending must not erase achievement.

The game therefore keeps **two counters**: a **lifetime score** that only ever rises and
drives statistics, achievements and progression, and a **spendable balance** that a clear
adds to and a purchase subtracts from. Cashing in a reward costs balance and leaves the
lifetime record untouched.

## 6 The economy

<!-- requirements: none - container heading; its obligations are stated in its subsections -->

### 6.1 Personal rewards

The player defines their own rewards and their own prices — a takeaway, an evening off, a
purchase they have been deferring. The game holds the ledger; it does not supply the
rewards or judge them.

This is what connects the grid to the player's actual life, and it is the reason points
need to feel earned rather than dispensed.

### 6.2 Power-ups

Power-ups are bought with balance and act on the board itself:

- **Expand the grid** — permanent, the main long-arc progression (§3.1).
- **Swap two adjacent tiles** — move a blocking goal into a line the player can afford to
  stall.
- **Re-draw a tile** — discard a goal and draw a replacement from the pool.

**These are not only progression. They are the release valve** for the blocking behaviour
in §4.3, which is why §10.3 matters and why pricing them is a correctness question rather
than a balance preference.

## 7 Advanced tiles

Advanced tiles are bought into after some play (`D-2026-09-19-3`). They exist so that
long-term goals can eventually feel like they are *moving* rather than just sitting, without
that complexity being present on day one.

### 7.1 Multi-completion tiles

A tile that needs two or more completions before it counts as marked. It shows its progress,
so a long-term goal stops being an opaque block and becomes a visible count.

### 7.2 Mini-grid tiles

A tile containing its own small grid. Clearing a line inside the mini-grid marks the parent
tile. This makes a large goal into a structured one — the sub-tasks become a board of their
own rather than a checklist hidden behind a cell.

How a mini-grid is filled, whether it draws from the same pool, and how it scores are open
(§11).

## 8 Progression and record

<!-- requirements: none - container heading; its obligations are stated in its subsections -->

### 8.1 Statistics

The game tracks and shows, at minimum: lifetime score, clears by category, clears over
time, and average clears per day. These exist to show the player their own pattern — which
categories they neglect, whether the habit is holding — and they are the input to challenge
modes and achievements.

### 8.2 Challenge modes

Self-set targets for a number of clears by category over a period — a health push, a study
block. The first cut ships a few predefined challenges with sensible progression rather
than a free-form builder, for the same reason categories are fixed first (§4.2).

### 8.3 Achievements

Badges for milestones the player did not set themselves — a first clear, a large grid, a
long run, a rare combination. Where a challenge is a goal the player chooses, an achievement
is a discovery the game hands back.

## 9 Platform and data

<!-- requirements: none - container heading; its obligations are stated in its subsections -->

### 9.1 Form factor

A mobile-first progressive web app, installable to the home screen (`D-2026-09-19-1`). It
must be usable one-handed on a phone, because that is where a habit gets marked.

Notifications are the known capability gap in this choice. The design must not come to
depend on a reminder it cannot reliably send.

### 9.2 Data

The player's pool, board, score and rewards are personal. The default is local-first: the
game works with no account and no network, and data stays on the device unless the player
asks otherwise.

Whether sync across devices is offered, and on what terms, is open (§11).

## 10 Scope

<!-- requirements: none - container heading; its obligations are stated in its subsections -->

### 10.1 In scope

Everything described in §2 to §9: the loop, the grid, the pool and draw, scoring, the
economy and power-ups, advanced tiles, statistics, challenges and achievements
(`D-2026-09-19-4`). The build order for it is decided at link 4, not here.

### 10.2 Non-goals

<!-- requirements: none - names what the system will not do; the boundary is drawn by the absence of obligations, not by new ones -->

- **Multiplayer, social feeds and leaderboards.** The audience is the player.
- **Automatic verification of goals.** No health-API or sensor integration proving a goal
  was done (§3.3).
- **Supplying or judging goals.** The game does not tell the player what to want, and does
  not offer coaching, wellbeing advice or clinical content.
- **Real-money purchase of points or power-ups.** Balance is earned by clearing lines.

### 10.3 The risk this design carries

The combination of §3.3's persistent marks and §4.3's blocking long-term goals has a
failure mode: over time the board fills with marked cells that cannot clear because every
line contains an unfinished long-term tile. The player then has a board where nothing is
completable and the only available action is to wait — which is the moment a habit game
loses its player.

Three things guard against it, and all three have to hold:

1. The **grid-aware draw** (§4.4) refuses to stack long-term tiles into the same lines.
2. The **swap and re-draw power-ups** (§6.2) let a player break a jam, which means they must
   stay affordable at the point a jam is likely rather than being priced as luxuries.
3. **Advanced tiles** (§7) turn a long block into visible progress once the player has them.

This is the design's central tension and the thing a prototype must be built to test first.

## 11 Open questions

<!-- requirements: none - a register of what is not yet decided; each entry becomes a decision or a requirement once resolved, and is mined then -->

Each of these is a real gap, not a placeholder. None should be guessed at — a number
invented here reads as fact once it is a requirement.

| # | Question | Blocks |
|---|---|---|
| Q1 | Starting grid size, and the sizes expansion steps through | §3.1 |
| Q2 | Do diagonals count as lines? | §3.4 |
| Q3 | Resolution when one mark completes a row and a column at once | §3.4 |
| Q4 | What happens to a cell shared by two clearing lines | §3.4 |
| Q5 | The starting category list | §4.2 |
| Q6 | The draw-weighting formula, and its grid-awareness rules | §4.4 |
| Q7 | Base point values | §5.1 |
| Q8 | Which combos exist and what each multiplies by | §5.2 |
| Q9 | Confirm the two-counter model (lifetime score vs spendable balance) | §5.3 |
| Q10 | Power-up prices — constrained by the deadlock guard, not free to tune | §6.2, §10.3 |
| Q11 | How a mini-grid is populated and scored | §7.2 |
| Q12 | Whether cross-device sync is offered | §9.2 |

## 12 Decision index

<!-- requirements: none - an index into DECISIONS.md, which is the record; duplicating it here would create a second copy to keep honest -->

| ID | Decision |
|---|---|
| `D-2026-09-19-1` | Mobile-first progressive web app |
| `D-2026-09-19-2` | A mark persists until its line clears |
| `D-2026-09-19-3` | Long-term goals block; advanced tiles are the later release valve |
| `D-2026-09-19-4` | This document covers the full vision; the cut happens at link 4 |
| `D-2026-09-19-5` | Restart from design rather than evolve the Phaser prototype |
