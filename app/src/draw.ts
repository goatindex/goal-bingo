/** Cadence-weighted drawing (GB-FUN-022, GB-FUN-027). */

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
