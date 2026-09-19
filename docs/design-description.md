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
7. Power-ups change the board itself — a larger grid, a swap, a recycle.

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

Expansion is not purely a benefit. A larger grid means longer lines, so any given line is
more likely to contain a blocking long-term goal (§4.3), and every line already in progress
is retroactively lengthened. Expansion therefore raises the risk described in §10.3 at the
same time as it raises the ceiling, and its pricing has to answer for that.

### 3.2 Cells and tiles

A cell holds one tile. A tile carries the goal drawn into it, its category, and whether it
is marked. Ordinary tiles need one completion. Advanced tiles (§7) need more.

An empty cell is a transient state between a line clearing and the refill landing. The
board is never presented to the player as playable while it holds an empty cell: the refill
completes before the player can act again.

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

Three resolution questions fall out of this and are open (§11): what happens when completing
one cell finishes a row and a column simultaneously (Q3), what happens to a cell in the
intersection of two clearing lines (Q4), and — the common case, not the exotic one — what
happens to the **perpendicular progress a clear destroys** (Q14).

That last one needs stating plainly, because it is easy to miss. Clearing a row empties
cells that were also marked contributions to their columns. A player one cell short of
completing a column can have that column reset by a row clear they wanted. Whether those
marks are lost, preserved, or compensated is a core pacing rule and is not yet decided.

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
- **What is already on the grid.** The draw reads the current board before placing anything.

The second is three separate obligations, listed separately here because they become
separate requirements: the draw should avoid placing a long-term goal into a row **or
column** that already holds one; it should avoid flooding a single category; and it should
prefer placements that leave at least one line completable.

That third obligation is bounded by what a refill can reach. Refill touches only the cells
a clear has just emptied, so it can influence the board but cannot guarantee a whole-board
property — and it does not run at all on a board that is already jammed, because nothing is
clearing. It is a preventive measure, not a cure. §10.3 sets out what that leaves uncovered.

The weighting formula is open (§11).

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

There are **three counters** (`D-2026-09-19-6`):

| Counter | Fed by | Spent on | Direction |
|---|---|---|---|
| **Lifetime score** | every clear | nothing — it is a record, not a currency | only ever rises |
| **Reward balance** | clearing lines (§5.1, §5.2) | personal rewards (§6.1) | rises and falls |
| **Board balance** | mark-based challenges (§8.2) | board actions — power-ups, recycles, grid expansion (§6.2) | rises and falls |

The split between the two balances is not bookkeeping. It is what stops the economy having
an unrecoverable state, and §10.3 explains the mechanism. The short version: **marking still
works on a jammed board; only clearing stops.** Board balance is therefore fed by something
a jam cannot switch off, and personal rewards cannot drain it.

It also means the two layers of the game fund each other. Playing the board well buys
rewards in real life; doing your goals consistently buys power on the board.

## 6 The economy

<!-- requirements: none - container heading; its obligations are stated in its subsections -->

### 6.1 Personal rewards

The player defines their own rewards and their own prices — a takeaway, an evening off, a
purchase they have been deferring. The game holds the ledger; it does not supply the
rewards or judge them.

Rewards are bought with **reward balance**, which comes from clearing lines (§5.3). They
cannot be bought with board balance, and spending here can never affect the player's ability
to act on the board.

This is what connects the grid to the player's actual life, and it is the reason points
need to feel earned rather than dispensed.

### 6.2 Power-ups

Power-ups are bought with **board balance** (§5.3) and act on the board itself:

- **Expand the grid** — permanent, the main long-arc progression (§3.1).
- **Raise the free recycle allowance** — permanently increase how many free recycles a
  24-hour period grants (`D-2026-09-19-7`). This turns the release valve into a progression
  axis rather than a static safety net.
- **Swap two adjacent tiles** — move a blocking goal into a line the player can afford to
  stall. A swap does not by itself reduce how many lines are blocked: a blocker moved one
  cell still blocks one row and one column. It helps by **consolidating** — putting two
  blockers into the same line so the rest of the board frees up. Whether that is the
  intended mechanic, and whether adjacent-only swapping is enough to achieve it, is open
  (Q15).
- **Recycle a tile** — discard a goal and draw a replacement from the pool. This is the
  primary way out of a blocked line, so it carries a **free tier**: one recycle per 24 hours
  at no cost, before any board balance is spent (`D-2026-09-19-7`). Beyond the allowance,
  further recycles cost board balance.

**These are not only progression. They are the release valve** for the blocking behaviour
in §4.3. Two things make the valve reliable, and both are needed: the recycle allowance
exists at zero balance, and board balance is fed by something a jam cannot switch off
(§5.3). §10.3 sets out the failure they jointly close.

## 7 Advanced tiles

Advanced tiles are bought into after some play (`D-2026-09-19-3`). They exist so that
long-term goals can eventually feel like they are *moving* rather than just sitting, without
that complexity being present on day one.

How they are acquired — bought with balance like a power-up, unlocked at a progression
threshold, or both — is open (Q16). They are not in the power-up list in §6.2, so the
economy does not currently carry them.

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

Self-set targets over a period — a health push, a study block. The first cut ships a few
predefined challenges with sensible progression rather than a free-form builder, for the
same reason categories are fixed first (§4.2).

**Challenges are counted from marks, not from clears** (`D-2026-09-19-6`), and this is a
constraint rather than a preference. Challenges are the sole source of board balance (§5.3),
so a challenge that required clearing lines would stop paying in exactly the situation the
board balance exists to rescue. "Mark twenty health goals this week" survives a jam; "clear
ten lines this week" does not.

Challenges are therefore the game's meta-goal layer, and the thing that keeps the board
solvent.

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

### 10.3 The risks this design carries

Two failure modes fall out of the interaction between persistent marks (§2 step 3, §3.4)
and blocking long-term goals (§4.3). The second is the more dangerous.

**Board jam.** Over time the board fills with marked cells that cannot clear, because every
line contains an unfinished long-term tile. Nothing is completable and the only available
action is to wait — which is the moment a habit game loses its player.

**The economic trap, which was worse.** In this document's first draft, balance was earned
*only* by clearing lines, and §10.2 forbids buying points. A jammed board cleared nothing,
so it earned nothing — and the power-ups that would break the jam (§6.2) drew on the one
income stream the jam had stopped. A player who had also spent balance on rewards could
reach a board with no completable line, no balance, and no mechanism producing either. That
was not a difficulty spike; it was an unrecoverable save.

**It is closed by `D-2026-09-19-6` and `D-2026-09-19-7`,** which attack it from both ends:

- **Income a jam cannot stop.** Board balance is fed by mark-based challenges (§8.2), and
  marking still works when nothing is clearing. Personal rewards spend from a separate
  budget, so cashing out cannot strand the player (§5.3).
- **An action that costs nothing.** One free recycle per 24 hours, taken before any balance
  is spent, with the allowance itself upgradeable (§6.2).

The first guarantees the player can always *earn* a way out; the second guarantees they can
always *take* one at zero. Neither is sufficient alone — a new player has no challenge
income yet, and an allowance by itself would run out against a badly jammed board.

**Board jam itself remains, and is meant to.** It is the friction `D-2026-09-19-3` chose.
What has been removed is the state where a jam is permanent.

The three original guards, restated honestly:

| Guard | What it actually does | When it acts |
|---|---|---|
| Grid-aware draw (§4.4) | Refuses to stack long-term tiles into the same lines | **Preventive only.** It runs on refill, and refill happens only when a line clears — so it never runs on a board that is already jammed |
| Recycle and swap, plus the free allowance (§6.2) | Let a player move or discard a blocker | Curative, and now reliable — the allowance exists at zero balance, and board balance survives a jam |
| Advanced tiles (§7) | Turn a long block into visible progress | **Not present at first release** (`D-2026-09-19-3`). A multi-completion tile also makes its line *harder*, not easier — this guards motivation, not jams |

Grid expansion (§3.1) still aggravates jam risk rather than relieving it, and its pricing
has to answer for that.

How long a jam should be *allowed* to last before the design treats it as a defect is still
open, and Q10 bears on it directly.

This remains the first thing a prototype must be built to test.

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
| ~~Q9~~ | ~~Settle the two-counter model~~ — **resolved** by `D-2026-09-19-6`: three counters, two of them spendable | §5.3 |
| Q10 | Power-up prices — constrained by the recovery floor, not free to tune | §6.2, §10.3 |
| Q11 | How a mini-grid is populated and scored | §7.2 |
| Q12 | Whether cross-device sync is offered | §9.2 |
| ~~Q13~~ | ~~The recovery floor~~ — **resolved** by `D-2026-09-19-6` (jam-proof income) and `D-2026-09-19-7` (a free action at zero balance) | §10.3, §6.2 |
| Q14 | What happens to perpendicular progress a clear destroys — lost, preserved, or compensated | §3.4 |
| Q15 | Whether consolidation is the intended swap mechanic, and whether adjacent-only swapping achieves it | §6.2 |
| Q16 | How advanced tiles are acquired, and whether the economy carries them | §7 |
| Q17 | How far the free recycle allowance can be upgraded, what each step costs, and whether it is capped | §6.2 |
| Q18 | Which mark-based challenges ship first, and what each pays into board balance | §8.2, §5.3 |

Resolved questions are struck through rather than deleted — the register is a record, and a
question that was asked and answered is different from one nobody raised.

**Nothing now blocks a prototype.** Q13 did; it is closed. Q14 is the next most valuable
answer because it changes how the board feels to play, and Q18 is the one that must be
answered before board balance can be tuned at all.

## 12 Decision index

<!-- requirements: none - an index into DECISIONS.md, which is the record; duplicating it here would create a second copy to keep honest -->

| ID | Decision |
|---|---|
| `D-2026-09-19-1` | Mobile-first progressive web app |
| `D-2026-09-19-2` | A mark persists until its line clears |
| `D-2026-09-19-3` | Long-term goals block; advanced tiles are the later release valve |
| `D-2026-09-19-4` | This document covers the full vision; the cut happens at link 4 |
| `D-2026-09-19-5` | Restart from design rather than evolve the Phaser prototype |
| `D-2026-09-19-6` | Two spendable budgets; meta-goals fund board actions |
| `D-2026-09-19-7` | A free recycle allowance of one per 24 hours, upgradeable |
