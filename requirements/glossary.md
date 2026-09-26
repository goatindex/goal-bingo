# Glossary — Goal Bingo

Terms used in the requirement set. Every capitalised domain term must appear here; the
linter checks R4 (defined terms) and R37 (acronyms) against this file.

---

- **Goal Bingo** — the mobile-first progressive web application that is the system of interest.
- **player** — the person who installs and plays Goal Bingo; the sole human actor in the system.
- **tile** — a goal that occupies one cell on the grid; has a category and a cadence; displays one goal drawn from the pool.
- **cell** — a position on the grid, identified by its row and column (or diagonal membership); contains exactly one tile at any time.
- **grid** — the square array of cells on which the game is played; size is one of the supported options (§3.1).
- **line** — a complete row, column, or diagonal of the grid; clears when every cell in it is marked.
- **clear** — the event when every cell in a line becomes marked: reward balance is awarded, the cells empty, and each refills from the pool.
- **pool** — the player's full set of defined goals; a goal remains in the pool after being drawn and may be drawn again.
- **mark** — the act of recording that the goal in a cell was completed; persists until the cell's line clears.
- **hold duration** — how long a press on a cell must last before it counts as a mark or a completion (`D-2026-09-26-4`); its value is open (§11 Q25).
- **clear moment** — the short display after a clear of which cells cleared and what that clear scored, on the refilled board; it does not hold the next mark (§3.4, `D-2026-09-26-1`).
- **category cue** — the mark on a board cell that shows the goal's category, colored by the category's position in the player's category list (§3.2, `D-2026-09-26-2`).
- **thumb bar** — the row of navigation controls at the bottom of the screen, within reach of one thumb (§9.1).
- **sheet** — a panel that opens over the board to show one advanced tile larger (§7.3, `D-2026-09-26-6`).
- **mode** — a named set of style tokens (light or dark) applied to the same screens (§9.3, `D-2026-09-26-5`).
- **board balance** — the spendable currency earned from mark-based challenges (§8.2); spent on board actions (power-ups, recycles, grid expansion); cannot be spent on personal rewards.
- **reward balance** — the spendable currency earned from clearing lines (§5.1, §5.2); spent on personal rewards (§6.1); cannot be spent on board actions.
- **lifetime score** — the cumulative record of all clear value earned; never decreases; not spendable.
- **recycle** — the board action that replaces one unmarked tile with a newly drawn tile from the pool.
- **swap** — the board action that exchanges the positions of two tiles on the board.
- **power-up** — a board action purchased with board balance that modifies the board or its mechanics.
- **category** — a player-defined label grouping goals by life area (e.g. health, study, work); every tile belongs to exactly one category.
- **cadence** — the intended repetition frequency of a goal: hourly, daily, or weekly; every tile has exactly one cadence; long-term goals are a special case with no cadence.
- **long-term goal** — a goal with no cadence; drawn at a low fixed share of the draw weight; persists on the board longer than cadenced goals.
- **challenge** — a board objective that awards board balance on each qualifying mark and on completion; three types: universal, category, and cadence (§8.2).
- **multi-completion tile** — an advanced tile that requires two or more completions before it counts as marked (§7.1).
- **mini-grid tile** — an advanced tile containing an internal smaller grid; cleared on the main board when a line completes inside it (§7.2).
- **ambient blocking** — the proportion of lines on the board that carry at least one unmarked long-term goal at any moment (§10.4).
- **recovery floor** — the probabilistic guarantee that a jammed board will unjam within a bounded expected time through the combination of free recycles, challenge income, and draw rules (§10.3).
- **jam** — the state in which every line on the board contains at least one unmarked long-term goal, blocking all clears; board balance income continues because marking still works.
- **PWA** — progressive web application; a web app that can be installed on a device and used offline.
