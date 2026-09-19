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
6. Clearing pays **reward balance**, which buys personal rewards. Marking toward a
   challenge pays **board balance**, which buys power-ups (§5.3).
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
board balance (§5.3, §6.2). Expansion is the main long-arc progression: a larger grid holds
more goals, offers more lines, and makes higher-scoring combinations possible.

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

A line is a complete row, column, or diagonal (`D-2026-09-19-13`).

When a line's every cell is marked, the line clears at once: score is awarded (§5), the
cells empty, and the refill draws new goals into them (§4.4).

**Simultaneous completion.** When one mark completes more than one line at once, every line
resolves — each clears, scores, and refills — and bonus points are awarded for the
multi-clear (`D-2026-09-19-13`). The cell at the intersection of two clearing lines receives
distinct visual treatment and is the anchor for the multi-clear bonus calculation
(`D-2026-09-19-14`).

**Perpendicular progress.** Clearing a row or diagonal empties cells that were also marked
contributions toward their columns (or other perpendicular lines). A player one cell short
of completing a column can have that progress reset by a row clear they intended. Those
marks are lost — the perpendicular count drops (`D-2026-09-19-15`). This is the base rule.
Power-up and upgrade mechanics that preserve, carry forward, or compensate perpendicular
progress are a designated upgrade area; none ship with the base game.

## 4 Goals

<!-- requirements: none - container heading; its obligations are stated in its subsections -->

### 4.1 The goal pool

The pool is the set of goals the player has defined and is willing to be given. It is not a
queue — a goal stays in the pool after it is drawn, and can be drawn again.

The pool is the player's own; the game ships with a starting set they can edit rather than
an empty box, because an empty pool is a blank page at the exact moment the player is least
invested.

### 4.2 Categories

Every goal carries a category — its *theme*: health, study, hobby, volunteering. Categories
drive scoring combinations (§5.2), statistics (§8.1) and challenge modes (§8.2).

Category is one of two independent axes a goal sits on. The other is cadence (§4.3), which
governs draw rate and blocking and has nothing to do with theme (`D-2026-09-19-11`). A
health goal can be hourly (drink water) or long-term (complete a rehabilitation programme).

The first cut ships a small fixed set with sensible progression rather than open
user-defined categories — health, study, hobby, volunteering and similar. Player-defined
categories are a later addition, once the scoring consequences of a category are understood
well enough that adding one cannot quietly break the economy.

The exact starting category list is open (§11).

### 4.3 Cadence — short-term and long-term goals

Every goal has a cadence, independent of its category (§4.2). There are four
(`D-2026-09-19-11`):

| Cadence | Ticked off | Examples | Blocks its lines |
|---|---|---|---|
| **Hourly** | several times a day | drink water, stand up, stretch | briefly |
| **Daily** | about once a day | take medication, a walk, read | up to a day |
| **Weekly** | about once a week | a long run, a volunteering shift, a lesson | up to a week |
| **Long-term** | once, after weeks or months | finish the course, complete the build | for as long as it takes |

The first three are **recurring** and are what this document means by *short-term*: once
marked the goal is banked for its line, and when the cell refills the same goal can come
back. The fourth is a one-off. Cadence sets a goal's own draw rate (§4.4) — hourly goals
should surface often and long-term goals rarely — and its expected time to first
completion, which is what decides how long it blocks.

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

The second is three separate obligations. They become separate requirements, and they are
**not equally binding** — the difference matters, because §10.3's recovery argument rests on
the first being absolute rather than advisory:

1. **Binding.** The draw must not place a long-term goal into a row **or column** that
   already holds one. This constrains the *goal chosen*, not the cell, so it is always
   satisfiable while the pool holds any short-term goal.
2. **Binding.** The draw must not let one category dominate the board. The threshold is
   open (Q21).
3. **Preference.** Where more than one legal placement exists, the draw prefers one leaving
   at least one line completable.

Rule 3 is bounded by what a refill can reach. Refill touches only the cells a clear has just
emptied, so it can influence the board but cannot guarantee a whole-board property — and it
does not run at all on a board that is already jammed, because nothing is clearing. It is a
preventive measure, not a cure. §10.3 sets out what that leaves uncovered.

**Rules 1 and 2 also govern a recycle draw** (§6.2, `D-2026-09-19-9`). This matters because
the recycle path is the only draw that runs on a jammed board: it does not wait for a clear.

**Rule 3 does not govern a recycle**, and the omission is deliberate. A recycle fills exactly
one cell, so there is no choice between placements for the preference to range over.
Extending rule 3's *intent* to the recycle path — requiring the draw to leave a completable
line where it can — would make the recovery floor deterministic rather than probabilistic.
That is exactly the tightening Q20 holds in reserve, and it is not taken now because it would
weaken the friction `D-2026-09-19-3` chose.

Rule 1 reduces the chance a recycle hands back another blocker without eliminating it: when
the recycled cell's row and column hold no *other* long-term goal, the rule permits a
long-term goal back into the same cell. §10.3 states what that leaves the floor guaranteeing.

The exact weighting formula is open (§11), but **the long-term draw share is set at
roughly 5%** (`D-2026-09-19-12`) — the share of the draw's own-rate weighting (the first
bullet above) given to long-term goals. Simulation showed this is the dial that governs
ambient friction far more than any player behaviour does: at 5% roughly half the board's
lines carry an unmarked long-term tile at any moment, which is what `D-2026-09-19-3`'s "the
player works elsewhere while chipping at it" was written to describe. The rest of the
formula — how short-term cadences split the remaining weight, and grid-awareness's exact
thresholds — stays open.

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
  primary way out of a blocked line. Three rules apply:
  - **Unmarked tiles only** (`D-2026-09-19-10`). A mark is never destroyed before its line
    clears, which leaves `D-2026-09-19-2` intact. Blockers are unmarked by definition, so
    the recovery floor never needs to recycle a marked tile.
  - **The draw obeys §4.4's placement rules** (`D-2026-09-19-9`) — it will not put a
    long-term goal into a row or column that already holds one.
  - **A free tier** of one recycle per 24 hours, taken before any board balance is spent and
    available **unconditionally** rather than only when the board is stuck
    (`D-2026-09-19-7`). Beyond the allowance, further recycles cost board balance.

**These are not only progression. They are the release valve** for the blocking behaviour
in §4.3. Two things hold the valve open, and both are needed: the recycle allowance exists
at zero balance, and board balance is fed by something a jam cannot switch off (§5.3).
Whether any *given* recycle helps is probabilistic — §10.3 sets out both what they close and
what they leave open.

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

**They pay incrementally** (`D-2026-09-19-8`). Every mark that counts toward a challenge
pays board balance the moment it is made, and completing the challenge pays a bonus on top.
Paying only on completion would break the recovery floor: a jammed board that yields one
markable tile a day cannot finish a weekly target, so income would stop at exactly the point
it is needed. Incremental payment also gives the player continuous feedback rather than a
weekly lump.

**At least one challenge must always be active, and the shipped set must be broad enough
that any mark counts toward something** (`D-2026-09-19-8`). A player between challenges, or
holding only challenges whose category does not match the tile a recycle just handed them,
would earn nothing — which reopens the trap §10.3 closes. This is a constraint on Q18 rather
than a free choice.

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
- **Real-money purchase of points or power-ups.** Both balances are earned in play —
  reward balance by clearing, board balance by marking toward challenges (§5.3).

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

The first lets the player *earn* a way out — provided a challenge is active that their marks
count toward, which §8.2 makes a standing requirement rather than a hope. The second
guarantees they can always *take* an action at zero.

Neither is sufficient alone, and the reason is sharper than it first looks. **Mark-based
income assumes there is something markable.** In a maximal jam every unmarked cell *is* a
blocker, so there is nothing the player can realistically complete and challenge income
stops as well. The free recycle breaks that case: it replaces a blocker, and because
challenges pay per mark rather than on completion (`D-2026-09-19-8`), one markable tile is
enough to restart income. One mark, one payment, and the loop turns again. The allowance is
load-bearing at the extreme; the budgets carry everything short of it.

**The floor is probabilistic, not absolute.** A recycle draws from the pool under §4.4's
placement rules, which forbid putting a long-term goal into a row or column that already
holds one — but where the recycled cell's lines hold no *other* blocker, those rules permit
a long-term goal straight back into the same cell. A recycle can therefore hand back another
blocker. How often that happens depends on the draw weighting, which is itself undecided
(Q6), and another allowance arrives in 24 hours regardless. So the expected time to break a
jam should be finite and small while the worst case stays unbounded — but **neither number is
established**, and asserting "short" here would claim precisely what Q20 exists to measure.

That is a deliberate trade (`D-2026-09-19-9`): the stricter rules that would make the floor
deterministic all weaken the friction `D-2026-09-19-3` chose. What the design owed in
exchange was a number, and Q20 asked for it before a prototype existed to measure it live.

**Q20, measured.** A simulation (`sim/jam_sim.py`, results in `sim/results.md`) modelled
the board, the weighted draw, the recycle rules and four player behaviours, and started
every trial in the *worst* reachable state — a maximal jam, long-term goals on the diagonal,
zero balance. At the shipped long-term draw share (`D-2026-09-19-12`, ~5%) and across every
grid size, project duration and recycle cost tested, and for every player model: **median
time to unjam was same-day, the 99th percentile stayed at one to two days, and zero trials
out of thousands were still jammed after 180 simulated days.** The same held at draw shares
up to 30%, well past the shipped value. The mechanical reason is simple once seen: rule 1 forbids two long-term
tiles sharing a line, so a maximal jam is always exactly one blocker per line, and any
successful recycle frees two lines at once. The reserved tightening (extending rule 3 to
the recycle path) helps, but the untightened floor was already fast. **The recovery floor
holds.**

**Board jam itself remains, and is meant to. It is also, on this evidence, rare.** Full jams
occurred in under 0.05% of simulated hours across every player model — `D-2026-09-19-3`'s
claim that "a fully deadlocked board is rare" holds up.

The three original guards, restated honestly:

| Guard | What it actually does | When it acts |
|---|---|---|
| Grid-aware draw (§4.4) | Refuses to stack long-term tiles into the same lines | **Preventive only.** It runs on refill, and refill happens only when a line clears — so it never runs on a board that is already jammed |
| Recycle and swap, plus the free allowance (§6.2) | Let a player move or discard a blocker | Curative, and now **funded and measured** — the allowance exists at zero balance, board balance survives a jam, and the simulation above confirms it resolves fast |
| Advanced tiles (§7) | Turn a long block into visible progress | **Not present at first release** (`D-2026-09-19-3`). A multi-completion tile also makes its line *harder*, not easier — this guards motivation, not jams |

Grid expansion (§3.1) still aggravates jam risk rather than relieving it in principle, though
the simulation did not find that effect large enough to threaten the floor at the grid sizes
tested (3, 5, 7). Its pricing still has to answer for the everyday effect described next.

### 10.4 Chronic partial blocking — the risk the simulation actually surfaced

Q20 was framed around jams, and the floor closes that question. **The simulation's more
important finding is a different risk nobody had asked about: most of the board is blocked
most of the time, even though it is almost never fully jammed.**

"Blocked" here means a line currently holds an unmarked long-term tile — not stuck, just
occupied. At the draw share the simulation swept, the average share of lines blocked at any
given moment ran from **28% at a 2% long-term draw share to 75% at 30%**, and — unlike time
to unjam — this number barely depended on which player model was run. It is a property of
the draw mechanic and the grid, not of player behaviour.

Clear throughput moved inversely across that same range, but **this figure does depend
heavily on player model, and the two are not directly comparable across it.** For the
diligent player it ran roughly 126 clears per 180 days at the light end down to 74 at the
heavy end; the same comparison for the short-focused player is 30 down to 15. Player model
alone spans roughly a 4x range in clears at either end of the draw-share sweep — a
short-focused player simply clears far fewer lines than a diligent one, regardless of draw
share — so the effect of the draw share and the effect of player behaviour are separate and
both real, not one number telling one story.

`D-2026-09-19-3` describes long-term goals as occasional strategic friction — "a long-term
tile makes two lines expensive... the player works elsewhere while chipping at it." At the
heavier end of the range tested, the mechanics instead produce a board that is constrained
almost everywhere almost always, which is a different game to the one that sentence
describes. **The long-term draw share is therefore the load-bearing tuning number for how
the game feels**, far more than anything decided so far, and it needed a deliberate target
rather than an arbitrary default. **Set to roughly 5%** (`D-2026-09-19-12`), which puts
ambient blocking at roughly 45–50% — a regular presence rather than either an occasional
event or a constant one. §4.4 records the number; this section records why it was chosen.

## 11 Open questions

<!-- requirements: none - a register of what is not yet decided; each entry becomes a decision or a requirement once resolved, and is mined then -->

Each of these is a real gap, not a placeholder. None should be guessed at — a number
invented here reads as fact once it is a requirement.

| # | Question | Blocks |
|---|---|---|
| Q1 | Starting grid size, and the sizes expansion steps through | §3.1 |
  | ~~Q2~~ | ~~Do diagonals count as lines?~~ — **resolved** by `D-2026-09-19-13`: diagonals count | §3.4 |
  | ~~Q3~~ | ~~Resolution when one mark completes a row and a column at once~~ — **resolved** by `D-2026-09-19-13`: every completing line resolves; bonus points for the multi-clear | §3.4 |
  | ~~Q4~~ | ~~What happens to a cell shared by two clearing lines~~ — **resolved** by `D-2026-09-19-14`: distinct visual treatment; anchor for the multi-clear bonus | §3.4 |
| Q5 | The starting category list | §4.2 |
| Q6 | The draw-weighting formula, and its grid-awareness rules | §4.4 |
| Q7 | Base point values | §5.1 |
| Q8 | Which combos exist and what each multiplies by | §5.2 |
| ~~Q9~~ | ~~Settle the two-counter model~~ — **resolved** by `D-2026-09-19-6`: three counters, two of them spendable | §5.3 |
| Q10 | Power-up prices — constrained by the recovery floor, not free to tune | §6.2, §10.3 |
| Q11 | How a mini-grid is populated and scored | §7.2 |
| Q12 | Whether cross-device sync is offered | §9.2 |
| ~~Q13~~ | ~~The recovery floor~~ — **resolved** by `D-2026-09-19-6` (jam-proof income) and `D-2026-09-19-7` (a free action at zero balance) | §10.3, §6.2 |
  | ~~Q14~~ | ~~What happens to perpendicular progress a clear destroys — lost, preserved, or compensated~~ — **resolved** by `D-2026-09-19-15`: marks lost; compensation is a designated upgrade area | §3.4 |
| Q15 | Whether consolidation is the intended swap mechanic, and whether adjacent-only swapping achieves it | §6.2 |
| Q16 | How advanced tiles are acquired, and whether the economy carries them | §7 |
| Q17 | How far the free recycle allowance can be upgraded, what each step costs, and whether it is capped | §6.2 |
| Q18 | Which mark-based challenges ship first, and what each pays per mark and on completion | §8.2, §5.3 |
| Q19 | Whether one free recycle per 24 hours is fast enough against how quickly a board re-jams. The rate was chosen on daily rhythm, not on any showing that it outpaces re-jamming | §6.2, §10.3 |
| ~~Q20~~ | ~~The floor's bound~~ — **resolved by measurement.** Simulated median time-to-unjam is same-day, p99 one to two days, zero trials still jammed after 180 days, at every setting tested. The reserved tightening is not needed to make the floor safe | §10.3, §4.4 |
| Q21 | What share of the board counts as one category dominating it (§4.4 rule 2) | §4.4 |
| Q22 | How the remaining draw weight splits across the three short-term cadences (hourly/daily/weekly), now that the long-term share is set | §4.4, §4.3 |
| Q23 | Whether ambient blocking (§10.4) should target a fixed share, or vary with grid size — the simulation held it roughly constant across grids 3, 5 and 7 at a fixed draw share, but did not test whether a player perceives 50% of 6 lines the same as 50% of 14 | §10.4, §3.1 |
  | Q24 | Whether `sim/jam_sim.py`'s remaining harsher assumptions (swap not modelled; challenge income idealised as always-available) should be revisited once those questions settle — the Q14 assumption (marks lost) is now the decided rule (`D-2026-09-19-15`) and is confirmed | §10.3, §10.4 |

Q22 through Q24 are new, surfaced by building the Q20 simulation rather than by review. A
simulation answers the question it was pointed at and exposes the ones nobody had framed
yet — Q23 and Q24 are exactly that, and neither was visible before the numbers existed.

Resolved questions are struck through rather than deleted — the register is a record, and a
question that was asked and answered is different from one nobody raised.

**Nothing now blocks a prototype.** Q13 did; it is closed. Q18 must be answered before
board balance can be tuned at all — it is the next most valuable open question. Q20 is
measured and closed.

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
| `D-2026-09-19-8` | Challenges pay board balance incrementally, per qualifying mark |
| `D-2026-09-19-9` | The recycle draw obeys §4.4's placement rules; the floor is probabilistic |
| `D-2026-09-19-10` | A recycle operates on unmarked tiles only |
  | `D-2026-09-19-11` | Goals sit on two independent axes: category and cadence |
  | `D-2026-09-19-12` | Long-term draw share set to roughly 5% |
  | `D-2026-09-19-13` | Diagonals count as lines; all completing lines resolve on a simultaneous mark |
  | `D-2026-09-19-14` | The intersection cell is the visual focal point and anchor for the multi-clear bonus |
  | `D-2026-09-19-15` | Perpendicular progress is lost on a clear; compensation is an upgrade area |
