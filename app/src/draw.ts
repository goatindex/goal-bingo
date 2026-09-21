/** Cadence-weighted drawing, plus the binding placement rules (GB-FUN-022, 023, 024,
 *  026, 027). */

import type { Board } from './board'
import type { Cadence } from './categories'
import type { DrawResult, Goal } from './pool'
import { drawGoal } from './pool'

/** ~5% of draws are long-term (`D-2026-09-19-12`). */
export const LONG_TERM_DRAW_SHARE = 0.05

/** The remaining weight, split across short-term cadences (`D-2026-09-21-1`, ported
 *  from `sim/jam_sim.py`'s `SHORT_MIX` rather than invented - a different split would
 *  silently invalidate the recovery-floor results `D-2026-09-20-8`'s grid sizing
 *  already relies on). */
export const SHORT_CADENCE_MIX: { hourly: number; daily: number; weekly: number } = {
  hourly: 0.4,
  daily: 0.4,
  weekly: 0.2,
}

function pickCadence(rng: () => number): Cadence {
  if (rng() < LONG_TERM_DRAW_SHARE) return 'long-term'
  const x = rng()
  let acc = 0
  for (const cadence of ['hourly', 'daily', 'weekly'] as const) {
    acc += SHORT_CADENCE_MIX[cadence]
    if (x < acc) return cadence
  }
  return 'weekly'
}

/**
 * Draw a goal weighted by cadence (GB-FUN-022, GB-FUN-027): ~5% long-term, the rest
 * split 40/40/20 hourly/daily/weekly. Falls back to a uniform draw over the whole pool
 * when it has no goal of the cadence selected - an empty pool is still refused the same
 * way `drawGoal` already refuses it (GB-FUN-065); a cadence gap is not that.
 */
export function drawWeighted(pool: Goal[], rng: () => number = Math.random): DrawResult {
  const cadence = pickCadence(rng)
  const candidates = pool.filter((g) => g.cadence === cadence)
  if (candidates.length === 0) return drawGoal(pool, rng)
  const index = Math.floor(rng() * candidates.length)
  return { ok: true, goal: candidates[index]! }
}

/** Rule 2 (`D-2026-09-21-2`): no single category may occupy more than this share of
 *  board cells. */
export const CATEGORY_DOMINATION_THRESHOLD = 0.4

/**
 * Rule 1 (GB-FUN-023): does this cell's row or column already hold a long-term goal?
 * `ignore` excludes cells mid-refill in the same batch whose old content is about to be
 * replaced and so must not count as "already there" (see `drawForCell`).
 */
function hasLongTermInLine(board: Board, index: number, ignore: ReadonlySet<number>): boolean {
  const row = Math.floor(index / board.size)
  const col = index % board.size
  for (let i = 0; i < board.cells.length; i++) {
    if (i === index || ignore.has(i)) continue
    const r = Math.floor(i / board.size)
    const c = i % board.size
    if ((r === row || c === col) && board.cells[i]!.goal.cadence === 'long-term') return true
  }
  return false
}

/** Rule 2 (GB-FUN-024): would placing `category` at this cell push it over the
 *  domination threshold? Same `ignore` treatment as `hasLongTermInLine`. */
function violatesDomination(
  board: Board,
  index: number,
  category: string,
  ignore: ReadonlySet<number>,
): boolean {
  let count = 1 // the candidate being placed
  for (let i = 0; i < board.cells.length; i++) {
    if (i === index || ignore.has(i)) continue
    if (board.cells[i]!.goal.category === category) count++
  }
  return count / board.cells.length > CATEGORY_DOMINATION_THRESHOLD
}

function isLegalPlacement(
  board: Board,
  index: number,
  goal: Goal,
  ignore: ReadonlySet<number>,
): boolean {
  if (goal.cadence === 'long-term' && hasLongTermInLine(board, index, ignore)) return false
  return !violatesDomination(board, index, goal.category, ignore)
}

/**
 * Draw a goal for a specific board cell, applying both binding placement rules
 * (GB-FUN-023, GB-FUN-024) on top of the cadence weighting (`drawWeighted`). Reusable
 * for a recycle draw as much as a refill (GB-FUN-026) - both just name a cell index.
 *
 * `ignore` should list every cell in the current batch that has not yet received its
 * new goal (e.g. the rest of a multi-line clear's union of cells): their old content is
 * about to be replaced and must not count toward "already contains" for rule 1 or the
 * category count for rule 2. Cells already redrawn earlier in the same batch are not
 * ignored - two long-term goals landing in the same row from the same clear still
 * violates rule 1.
 *
 * Falls through three progressively looser candidate sets so a legal placement is used
 * whenever one exists, and a cell is never left unfilled even when none does
 * (GB-FUN-008 outranks the binding rules in a genuine deadlock): weighted-cadence and
 * legal, then any cadence but still legal, then `drawWeighted` unconstrained.
 */
export function drawForCell(
  pool: Goal[],
  board: Board,
  index: number,
  rng: () => number = Math.random,
  ignore: ReadonlySet<number> = new Set(),
): DrawResult {
  if (pool.length === 0) return { ok: false, reason: 'empty-pool' }

  const cadence = pickCadence(rng)
  const cadenceLegal = pool.filter(
    (g) => g.cadence === cadence && isLegalPlacement(board, index, g, ignore),
  )
  if (cadenceLegal.length > 0) {
    return { ok: true, goal: cadenceLegal[Math.floor(rng() * cadenceLegal.length)]! }
  }

  const anyLegal = pool.filter((g) => isLegalPlacement(board, index, g, ignore))
  if (anyLegal.length > 0) {
    return { ok: true, goal: anyLegal[Math.floor(rng() * anyLegal.length)]! }
  }

  return drawWeighted(pool, rng)
}
