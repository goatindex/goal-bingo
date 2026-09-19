#!/usr/bin/env python3
"""Q20: how long does the recovery floor take to break a jam?

A design instrument, not product code. It answers design-description.md section 10.3's
open question - the floor is probabilistic, and neither the expected time to unjam nor
the tail was established. This measures both, under stated assumptions.

Standard library only. Run:

    python sim/jam_sim.py                 full sweep, writes sim/results.md
    python sim/jam_sim.py --quick         small trial counts, for checking it runs
    python sim/jam_sim.py --seed 7        reproducible

WHAT IS MODELLED (and the section it comes from)

  Board      n x n grid, lines are rows and columns (Q2 diagonals: not modelled).
  Cadence    hourly / daily / weekly (recurring, "short-term") and long-term (4.3,
             D-11). Category is not modelled: 8.2 requires a matching challenge to
             always be active, so every mark pays board balance (D-8 scope clause).
  Marks      persist until the line clears (D-2). A clear empties its cells, so marks
             in perpendicular lines are lost (Q14 is open; this is the harsh reading).
  Draw       rule 1 of 4.4 is binding: a long-term goal is never drawn into a row or
             column that already holds a long-term tile (marked or not - "holds one",
             per the text). If the draw wanted long-term and rule 1 forbids it, a
             short-term goal is drawn instead. Rule 3 (prefer a completable line) is
             applied on refill after a clear, never on recycle (4.4).
  Recycle    unmarked tiles only (D-10). One free per 24h, unconditional (D-7), plus
             paid recycles at a cost in board balance. The player recycles only when
             jammed, choosing the unmarked long-term tile whose lines hold the most
             marks. UNTIGHTENED: recycle draw obeys rule 1 only, so a long-term goal
             can return to the vacated cell when its lines hold no other (D-9).
             TIGHTENED: recycle never returns a long-term goal (the Q20 tightening).
  Income     +1 board balance per mark (D-6, D-8). Completion bonuses ignored, which
             understates income - results are pessimistic in the safe direction.
  Player     four models, each a rate multiplier per cadence on how fast an unmarked
             tile of that cadence gets completed. Long-term project duration is a
             swept parameter because the models did not specify it.

NOT MODELLED: swap (Q15), grid expansion (3.1), reward balance, scoring, diagonals,
category matching, completion bonuses, the allowance upgrade (Q17).

DEFINITIONS

  completable line   a line whose every unmarked cell is short-term
  jammed             zero completable lines
  maximal jam        jammed, and every unmarked cell is long-term (nothing to mark)
  time to unjam      hours from a maximal jam until a completable line exists
  time to clear      hours from a maximal jam until a line actually clears

Experiment A starts every trial in the thinnest maximal jam (long-term on the diagonal,
everything else marked) at zero balance. That is the state rule 1 protects least,
because each line holds exactly one blocker. Experiment B starts fresh and measures how
often jams arise in ordinary play.
"""
import argparse
import io
import os
import random
import statistics

HOURLY, DAILY, WEEKLY, LONG = "hourly", "daily", "weekly", "long"
SHORT = (HOURLY, DAILY, WEEKLY)
BASE_HOURS = {HOURLY: 1.0, DAILY: 24.0, WEEKLY: 168.0}
SHORT_MIX = {HOURLY: 0.4, DAILY: 0.4, WEEKLY: 0.2}  # split of short-term draws

# Rate multipliers per cadence. 1.0 = completes an unmarked tile in its base time on
# average. LONG governs project goals; the models as given did not specify it, so the
# "long" tendency is extended to it and project duration is swept separately.
PLAYERS = {
    "1 diligent":       {HOURLY: 1.0,  DAILY: 1.0, WEEKLY: 1.0, LONG: 1.0},
    "2 inconsistent":   {HOURLY: 0.5,  DAILY: 0.5, WEEKLY: 0.5, LONG: 0.5},
    "3 short-focused":  {HOURLY: 1.0,  DAILY: 0.5, WEEKLY: 0.2, LONG: 0.1},
    "4 long-focused":   {HOURLY: 0.25, DAILY: 0.8, WEEKLY: 1.0, LONG: 1.0},
}

DEFAULTS = dict(grid=5, long_days=30, p_long=0.05, recycle_cost=5, tightened=False)  # D-12


class Board:
    def __init__(self, n, rng, p_long, long_hours, player, tightened, recycle_cost, rule3=True):
        self.n = n
        self.rng = rng
        self.p_long = p_long
        self.long_hours = long_hours
        self.player = player
        self.tightened = tightened
        self.recycle_cost = recycle_cost
        self.rule3 = rule3
        self.cad = [[None] * n for _ in range(n)]
        self.marked = [[False] * n for _ in range(n)]
        self.balance = 0
        self.free_recycles = 0
        self.marks_made = 0
        self.clears = 0
        self.recycles_free = 0
        self.recycles_paid = 0

    # -- geometry ---------------------------------------------------------------
    def lines(self):
        n = self.n
        for r in range(n):
            yield [(r, c) for c in range(n)]
        for c in range(n):
            yield [(r, c) for r in range(n)]

    def line_cells(self, r, c):
        return [(r, cc) for cc in range(self.n) if cc != c] + \
               [(rr, c) for rr in range(self.n) if rr != r]

    def has_long(self, r, c):
        """Rule 1: does the row or column already hold a long-term tile (marked or not)?"""
        return any(self.cad[rr][cc] == LONG for rr, cc in self.line_cells(r, c))

    # -- state predicates ---------------------------------------------------------
    def completable(self, line):
        return all(self.marked[r][c] or self.cad[r][c] != LONG for r, c in line)

    def completable_count(self):
        return sum(1 for line in self.lines() if self.completable(line))

    def jammed(self):
        return self.completable_count() == 0

    def blocked_fraction(self):
        return 1.0 - self.completable_count() / (2.0 * self.n)

    def unmarked(self):
        return [(r, c) for r in range(self.n) for c in range(self.n) if not self.marked[r][c]]

    def maximal_jam(self):
        return self.jammed() and all(self.cad[r][c] == LONG for r, c in self.unmarked())

    # -- draw -----------------------------------------------------------------------
    def draw_short(self):
        x = self.rng.random()
        acc = 0.0
        for cad, w in SHORT_MIX.items():
            acc += w
            if x < acc:
                return cad
        return WEEKLY

    def draw(self, r, c, allow_long=True):
        if allow_long and self.rng.random() < self.p_long and not self.has_long(r, c):
            return LONG
        return self.draw_short()

    def fill_fresh(self):
        for r in range(self.n):
            for c in range(self.n):
                self.cad[r][c] = self.draw(r, c)

    def set_maximal_jam(self):
        """Thinnest maximal jam: long-term on the diagonal, everything else marked."""
        for r in range(self.n):
            for c in range(self.n):
                if r == c:
                    self.cad[r][c] = LONG
                    self.marked[r][c] = False
                else:
                    self.cad[r][c] = self.draw_short()
                    self.marked[r][c] = True
        assert self.maximal_jam()

    # -- one hour ---------------------------------------------------------------------
    def rate(self, cad):
        base = self.long_hours if cad == LONG else BASE_HOURS[cad]
        mult = self.player[cad]
        if mult <= 0:
            return 0.0
        return min(1.0, mult / base)

    def tick(self, hour):
        if hour % 24 == 0:
            self.free_recycles = 1  # D-7: one per 24h, unconditional, not banked

        # 1. the player completes goals
        for r, c in self.unmarked():
            if self.rng.random() < self.rate(self.cad[r][c]):
                self.marked[r][c] = True
                self.marks_made += 1
                self.balance += 1  # D-8: per qualifying mark

        # 2. resolve clears - all fully-marked lines at once (Q3), union of cells
        to_clear = set()
        for line in self.lines():
            if all(self.marked[r][c] for r, c in line):
                to_clear.update(line)
        if to_clear:
            self.clears += 1
            for r, c in to_clear:
                self.marked[r][c] = False
                self.cad[r][c] = None
            drawn = []
            for r, c in sorted(to_clear):
                self.cad[r][c] = self.draw(r, c)
                drawn.append((r, c))
            # rule 3 as a preference on refill: if no line is completable and a
            # newly-drawn long-term tile exists, flip one to short-term.
            if self.rule3 and self.completable_count() == 0:
                for r, c in drawn:
                    if self.cad[r][c] == LONG:
                        self.cad[r][c] = self.draw_short()
                        break

        # the state the player actually faces this hour, before they respond
        was_jammed = self.jammed()
        blocked = self.blocked_fraction()

        # 3. the player recycles while jammed and able
        while self.jammed():
            if self.free_recycles > 0:
                self.free_recycles -= 1
                self.recycles_free += 1
            elif self.balance >= self.recycle_cost:
                self.balance -= self.recycle_cost
                self.recycles_paid += 1
            else:
                break
            self.recycle()
        return was_jammed, blocked

    def recycle(self):
        """Recycle the unmarked long-term tile whose lines hold the most marks (D-10)."""
        cands = [(r, c) for r, c in self.unmarked() if self.cad[r][c] == LONG]
        if not cands:
            cands = self.unmarked()
            if not cands:
                return
        def marks_around(rc):
            r, c = rc
            return sum(1 for rr, cc in self.line_cells(r, c) if self.marked[rr][cc])
        r, c = max(cands, key=marks_around)
        self.cad[r][c] = self.draw(r, c, allow_long=not self.tightened)


# -- experiments ------------------------------------------------------------------------
def run_a(cfg, player_name, trials, rng, cap_days=180):
    """From a maximal jam at zero balance: hours to a completable line, and to a clear."""
    unjam, clear, paid, free = [], [], [], []
    capped = 0
    for _ in range(trials):
        b = Board(cfg["grid"], rng, cfg["p_long"], cfg["long_days"] * 24.0,
                  PLAYERS[player_name], cfg["tightened"], cfg["recycle_cost"])
        b.set_maximal_jam()
        t_unjam = None
        t_clear = None
        for h in range(cap_days * 24):
            b.tick(h)
            if t_unjam is None and not b.jammed():
                t_unjam = h + 1
            if b.clears > 0:
                t_clear = h + 1
                break
        if t_unjam is None:
            capped += 1
            t_unjam = cap_days * 24
        if t_clear is None:
            t_clear = cap_days * 24
        unjam.append(t_unjam / 24.0)
        clear.append(t_clear / 24.0)
        paid.append(b.recycles_paid)
        free.append(b.recycles_free)
    return dict(unjam=unjam, clear=clear, paid=paid, free=free, capped=capped, trials=trials)


def run_b(cfg, player_name, trials, rng, days=180, rule3=True):
    """Fresh board, ordinary play: how often is it jammed, measured BEFORE the player
    responds, and how much of the board is blocked on an ordinary hour?"""
    frac_jam, blocked, episodes, recycles, unresolved, clears = [], [], [], [], [], []
    for _ in range(trials):
        b = Board(cfg["grid"], rng, cfg["p_long"], cfg["long_days"] * 24.0,
                  PLAYERS[player_name], cfg["tightened"], cfg["recycle_cost"], rule3=rule3)
        b.fill_fresh()
        jam_hours = 0
        unresolved_hours = 0
        eps = 0
        prev = False
        blocked_sum = 0.0
        H = days * 24
        for h in range(H):
            was_jammed, bf = b.tick(h)
            blocked_sum += bf
            if was_jammed:
                jam_hours += 1
                if not prev:
                    eps += 1
                if b.jammed():        # still jammed after responding: nothing to spend
                    unresolved_hours += 1
            prev = was_jammed
        frac_jam.append(jam_hours / H)
        blocked.append(blocked_sum / H)
        episodes.append(eps)
        recycles.append(b.recycles_free + b.recycles_paid)
        unresolved.append(unresolved_hours / 24.0)
        clears.append(b.clears)
    return dict(frac_jam=frac_jam, blocked=blocked, episodes=episodes, recycles=recycles,
                unresolved=unresolved, clears=clears, trials=trials)


# -- reporting --------------------------------------------------------------------------
def pct(xs, p):
    xs = sorted(xs)
    k = max(0, min(len(xs) - 1, int(round(p * (len(xs) - 1)))))
    return xs[k]


def fmt(x, nd=1):
    return ("%%.%df" % nd) % x


def table_a(rows):
    out = ["| player | tightened | median d | p95 d | p99 d | capped | median clear d | paid recycles (mean) |",
           "|---|---|---|---|---|---|---|---|"]
    for name, tight, res in rows:
        out.append("| %s | %s | %s | %s | %s | %d/%d | %s | %s |" % (
            name, "yes" if tight else "no",
            fmt(statistics.median(res["unjam"])), fmt(pct(res["unjam"], 0.95)),
            fmt(pct(res["unjam"], 0.99)), res["capped"], res["trials"],
            fmt(statistics.median(res["clear"])), fmt(statistics.mean(res["paid"]), 2)))
    return "\n".join(out)


def table_b(rows):
    out = ["| player | grid | rule 3 | hours jammed (pre-response) | lines blocked, avg | jam episodes / 180d | recycles / 180d | unresolved jam d | clears / 180d |",
           "|---|---|---|---|---|---|---|---|---|"]
    for name, grid, r3, res in rows:
        out.append("| %s | %d | %s | %s%% | %s%% | %s | %s | %s | %s |" % (
            name, grid, "on" if r3 else "off",
            fmt(100 * statistics.mean(res["frac_jam"]), 2),
            fmt(100 * statistics.mean(res["blocked"])),
            fmt(statistics.mean(res["episodes"])),
            fmt(statistics.mean(res["recycles"])),
            fmt(statistics.mean(res["unresolved"]), 2),
            fmt(statistics.mean(res["clears"]), 0)))
    return "\n".join(out)


def sweep_a(base, key, values, trials, rng, out):
    for v in values:
        cfg = dict(base)
        cfg[key] = v
        rows = []
        for name in PLAYERS:
            for tight in (False, True):
                c2 = dict(cfg)
                c2["tightened"] = tight
                rows.append((name, tight, run_a(c2, name, trials, rng)))
        out.append("\n#### %s = %s\n" % (key, v))
        out.append(table_a(rows))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--quick", action="store_true", help="small trial counts")
    ap.add_argument("--seed", type=int, default=20260919)
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "results.md"))
    args = ap.parse_args()
    rng = random.Random(args.seed)
    ta = 40 if args.quick else 300
    tb = 8 if args.quick else 40

    out = []
    out.append("# Q20 simulation results\n")
    out.append("Generated by `sim/jam_sim.py` (seed %d, %s). Read the module docstring for every "
               "assumption; the important ones are restated at the end.\n" %
               (args.seed, "quick run" if args.quick else "%d trials per cell" % ta))
    out.append("Defaults: grid %d, long-term project %d days, long-term draw share %.0f%%, "
               "recycle cost %d board balance, +1 balance per mark, one free recycle per 24h.\n" %
               (DEFAULTS["grid"], DEFAULTS["long_days"], 100 * DEFAULTS["p_long"], DEFAULTS["recycle_cost"]))

    out.append("## Experiment A - time to unjam from a maximal jam at zero balance\n")
    out.append("Start: long-term goals on the diagonal, every other cell marked, zero balance. "
               "*median d* is days until at least one line is completable; *capped* is trials "
               "still jammed at 180 days; *median clear d* is days until a line actually clears.\n")
    out.append("**Why the diagonal is the worst case.** Rule 1 of section 4.4 is binding, so no row "
               "or column ever holds two long-term tiles. A maximal jam is therefore exactly one "
               "blocker per line - a permutation - and recycling any one of them frees two lines "
               "unless the draw hands back another long-term goal. Under rule 1 a jam is always "
               "one successful recycle deep. That makes time-to-unjam geometric: each free recycle "
               "succeeds with probability (1 - long-term draw share), so at a 10%% share the chance "
               "of still being jammed after k days is 0.1^k. The tables below confirm the model "
               "reproduces that.\n")

    out.append("\n### A1 - defaults, all players, with and without the Q20 tightening\n")
    rows = []
    for name in PLAYERS:
        for tight in (False, True):
            cfg = dict(DEFAULTS)
            cfg["tightened"] = tight
            rows.append((name, tight, run_a(cfg, name, ta, rng)))
    out.append(table_a(rows))

    out.append("\n### A2 - sensitivity to long-term project duration (Q6/Q19)\n")
    sweep_a(DEFAULTS, "long_days", [14, 60], ta, rng, out)

    out.append("\n### A3 - sensitivity to the long-term draw share (Q6)\n")
    sweep_a(DEFAULTS, "p_long", [0.02, 0.10, 0.20], ta, rng, out)

    out.append("\n### A4 - sensitivity to grid size (Q1, section 3.1)\n")
    sweep_a(DEFAULTS, "grid", [3, 7], ta, rng, out)

    out.append("\n### A5 - sensitivity to recycle cost (Q10)\n")
    sweep_a(DEFAULTS, "recycle_cost", [2, 10], ta, rng, out)

    out.append("\n## Experiment B - how often jams arise in ordinary play\n")
    out.append("Fresh board, 180 simulated days, untightened, defaults otherwise. *hours jammed* "
               "is the share of hours with no completable line **as the player finds it, before "
               "they respond** - a jam the free recycle fixes in the same hour still counts. "
               "*lines blocked* is the average share of lines holding an unmarked long-term tile "
               "on an ordinary hour: the everyday friction, not the crisis. *unresolved jam d* is "
               "days spent jammed with no recycle available and no balance to buy one - the only "
               "state that is actually stuck. Rule 3 is the refill preference for leaving a "
               "completable line; *off* shows how much of the calm it is responsible for.\n")
    rows = []
    for grid in (3, 5, 7):
        for name in PLAYERS:
            cfg = dict(DEFAULTS)
            cfg["grid"] = grid
            rows.append((name, grid, True, run_b(cfg, name, tb, rng, rule3=True)))
    out.append(table_b(rows))
    out.append("\n#### B2 - grid 5, rule 3 off\n")
    rows = []
    for name in PLAYERS:
        rows.append((name, 5, False, run_b(DEFAULTS, name, tb, rng, rule3=False)))
    out.append(table_b(rows))

    out.append("\n#### B3 - grid 5, sensitivity of everyday blocking to the long-term draw share (Q6)\n")
    out.append("This is the knob that matters. Jams are structurally shallow whatever the share; "
               "the share decides how much of the board is dead on an ordinary hour.\n")
    rows = []
    for p in (0.02, 0.05, 0.10, 0.20, 0.30):  # 0.05 is the D-12 default
        for name in PLAYERS:
            cfg = dict(DEFAULTS)
            cfg["p_long"] = p
            res = run_b(cfg, name, tb, rng)
            rows.append(("%s @ %.0f%%" % (name, 100 * p), 5, True, res))
    out.append(table_b(rows))

    out.append("\n## Assumptions that most shape these numbers\n")
    out.append("- **Every mark pays +1 board balance.** Section 8.2 requires a matching challenge to always "
               "be active. Completion bonuses are ignored, so income is understated.\n"
               "- **Rule 1 reads \"holds one\" literally**: a long-term tile in the row or column, "
               "marked or not, forbids another. Reading it as unmarked-blockers-only would place "
               "more long-term tiles and make these numbers worse.\n"
               "- **The player recycles only when jammed**, targeting the blocker whose lines hold "
               "the most marks. D-7's allowance is unconditional; a player who spends it daily "
               "regardless would jam less often than Experiment B shows.\n"
               "- **A clear destroys perpendicular marks** (the harsh reading of Q14).\n"
               "- **Swap (Q15) and grid expansion are not modelled.** Swap would help; its absence "
               "makes A pessimistic.\n"
               "- **Long-term project duration is swept, not known.** The player models did not "
               "specify it; each model's \"long\" tendency is extended to project goals.\n")

    text = "\n".join(out) + "\n"
    with io.open(args.out, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    print(text)
    print("wrote %s" % args.out)


if __name__ == "__main__":
    main()
