import { describe, expect, it } from 'vitest'
import { LONG_TERM_DRAW_SHARE, SHORT_CADENCE_MIX, drawWeighted } from './draw'
import type { Goal } from './pool'

/** Deterministic PRNG (mulberry32) so the distribution tests are reproducible, not
 *  flaky - a real Math.random() would make a statistical assertion non-repeatable. */
function seededRng(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const MIXED_POOL: Goal[] = [
  { id: 'h1', title: 'Hourly one', category: 'health', cadence: 'hourly' },
  { id: 'h2', title: 'Hourly two', category: 'health', cadence: 'hourly' },
  { id: 'd1', title: 'Daily one', category: 'study', cadence: 'daily' },
  { id: 'd2', title: 'Daily two', category: 'study', cadence: 'daily' },
  { id: 'w1', title: 'Weekly one', category: 'home', cadence: 'weekly' },
  { id: 'w2', title: 'Weekly two', category: 'home', cadence: 'weekly' },
  { id: 'l1', title: 'Long one', category: 'work', cadence: 'long-term' },
  { id: 'l2', title: 'Long two', category: 'work', cadence: 'long-term' },
]

const SAMPLE_SIZE = 20000

function sampleCadenceCounts(pool: Goal[], seed: number, n: number): Record<string, number> {
  const rng = seededRng(seed)
  const counts: Record<string, number> = { hourly: 0, daily: 0, weekly: 0, 'long-term': 0 }
  for (let i = 0; i < n; i++) {
    const result = drawWeighted(pool, rng)
    expect(result.ok).toBe(true)
    if (result.ok) counts[result.goal.cadence] = (counts[result.goal.cadence] ?? 0) + 1
  }
  return counts
}

describe('cadence-weighted draw (GB-FUN-022, GB-FUN-027)', () => {
  it('draws long-term goals within the 0-10% tolerance band (D-2026-09-20-5, target 5%)', () => {
    const counts = sampleCadenceCounts(MIXED_POOL, 1, SAMPLE_SIZE)
    const share = counts['long-term']! / SAMPLE_SIZE
    expect(share).toBeGreaterThan(0)
    expect(share).toBeLessThan(0.1)
    expect(LONG_TERM_DRAW_SHARE).toBe(0.05)
  })

  it('splits the short-term draws roughly 40% hourly / 40% daily / 20% weekly (D-2026-09-21-1)', () => {
    const counts = sampleCadenceCounts(MIXED_POOL, 2, SAMPLE_SIZE)
    const shortTotal = counts.hourly! + counts.daily! + counts.weekly!
    const hourlyShare = counts.hourly! / shortTotal
    const dailyShare = counts.daily! / shortTotal
    const weeklyShare = counts.weekly! / shortTotal
    // Generous tolerance (+/- 3pp): this is a sanity check on the wiring, not a
    // statistics exam - SHORT_CADENCE_MIX is the source of truth for the exact ratio.
    expect(hourlyShare).toBeGreaterThan(SHORT_CADENCE_MIX.hourly - 0.03)
    expect(hourlyShare).toBeLessThan(SHORT_CADENCE_MIX.hourly + 0.03)
    expect(dailyShare).toBeGreaterThan(SHORT_CADENCE_MIX.daily - 0.03)
    expect(dailyShare).toBeLessThan(SHORT_CADENCE_MIX.daily + 0.03)
    expect(weeklyShare).toBeGreaterThan(SHORT_CADENCE_MIX.weekly - 0.03)
    expect(weeklyShare).toBeLessThan(SHORT_CADENCE_MIX.weekly + 0.03)
  })

  it('falls back to a uniform draw when the pool has no goal of the selected cadence', () => {
    const onlyHourly: Goal[] = [
      { id: 'h1', title: 'Hourly one', category: 'health', cadence: 'hourly' },
    ]
    // Force the long-term branch every time; the pool has no long-term goal, so the
    // fallback must still return the hourly goal rather than refusing.
    const result = drawWeighted(onlyHourly, () => 0)
    expect(result).toEqual({ ok: true, goal: onlyHourly[0] })
  })

  it('refuses an empty pool the same way drawGoal already refuses it', () => {
    const result = drawWeighted([], () => 0)
    expect(result).toEqual({ ok: false, reason: 'empty-pool' })
  })
})
