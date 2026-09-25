import { describe, expect, it } from 'vitest'
import { createBoard, type Board } from './board'
import {
  CATEGORY_DOMINATION_THRESHOLD,
  LONG_TERM_DRAW_SHARE,
  SHORT_CADENCE_MIX,
  drawForCell,
  drawWeighted,
} from './draw'
import type { Goal } from './pool'
import { seededRng } from './test-support'

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
    expect(counts['long-term']!).toBeLessThan(counts.daily!)
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

function filledBoard(goals: Goal[]): Board {
  return { size: 5, cells: goals.map((g) => ({ goal: g, marked: false })) }
}

describe('binding placement rules (GB-FUN-023, GB-FUN-024, GB-FUN-026)', () => {
  it('falls through to short-term when the cadence pick would put a second long-term goal in the row', () => {
    const pool: Goal[] = [
      { id: 'l1', title: 'Long', category: 'longcat', cadence: 'long-term' },
      { id: 'h1', title: 'Hourly', category: 'safecat', cadence: 'hourly' },
    ]
    // Row 0 is cells 0-4; cell 0 already holds the long-term goal.
    const filler: Goal = { id: 'f', title: 'Filler', category: 'a', cadence: 'hourly' }
    const goals = Array.from({ length: 25 }, () => filler)
    goals[0] = pool[0]!
    const board = filledBoard(goals)
    // rng forced into the long-term branch every call (0 < LONG_TERM_DRAW_SHARE).
    const result = drawForCell(pool, board, 3, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.goal.cadence).not.toBe('long-term')
  })

  it('rejects a category once it would exceed the 40% domination threshold', () => {
    const pool: Goal[] = [
      { id: 'x', title: 'X', category: 'x', cadence: 'hourly' },
      { id: 'y', title: 'Y', category: 'y', cadence: 'hourly' },
    ]
    // 10 of 25 cells (40%, exactly CATEGORY_DOMINATION_THRESHOLD) already category
    // 'x' - an 11th would be 44%, over the threshold, and must be rejected.
    const goals = Array.from({ length: 25 }, (_, i) =>
      i < 10 ? pool[0]! : { id: `f${i}`, title: `F${i}`, category: 'z', cadence: 'hourly' as const },
    )
    const board = filledBoard(goals)
    const result = drawForCell(pool, board, 20, () => 0.99)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.goal.category).not.toBe('x')
  })

  it('still returns a goal even when every candidate would violate a binding rule (GB-FUN-008 outranks the binding rules)', () => {
    const pool: Goal[] = [{ id: 'x', title: 'X', category: 'x', cadence: 'hourly' }]
    // The only goal in the pool is already the board's sole category, at 100% -
    // there is no legal choice, but the cell must still be filled.
    const board = filledBoard(Array.from({ length: 25 }, () => pool[0]!))
    const result = drawForCell(pool, board, 0, () => 0.5)
    expect(result.ok).toBe(true)
  })

  it('the same function applied to an arbitrary index (a stand-in for a recycled cell) enforces both rules identically (GB-FUN-026)', () => {
    const pool: Goal[] = [
      { id: 'l1', title: 'Long', category: 'longcat', cadence: 'long-term' },
      { id: 'h1', title: 'Hourly', category: 'safecat', cadence: 'hourly' },
    ]
    const filler: Goal = { id: 'f', title: 'Filler', category: 'a', cadence: 'hourly' }
    const goals = Array.from({ length: 25 }, () => filler)
    goals[24] = pool[0]! // long-term at the far corner, same column as cell 4
    const board = filledBoard(goals)
    // No refill or recycle mechanism is invoked here - the point is that the function
    // itself takes only a board and an index, so recycle can call it exactly this way.
    const result = drawForCell(pool, board, 4, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.goal.cadence).not.toBe('long-term')
  })

  it('createBoard never produces two long-term goals in a line or a category over 40%, across many seeds', () => {
    const pool: Goal[] = [
      { id: 'l1', title: 'L1', category: 'a', cadence: 'long-term' },
      { id: 'l2', title: 'L2', category: 'a', cadence: 'long-term' },
      { id: 'h1', title: 'H1', category: 'b', cadence: 'hourly' },
      { id: 'd1', title: 'D1', category: 'c', cadence: 'daily' },
      { id: 'w1', title: 'W1', category: 'd', cadence: 'weekly' },
    ]
    for (let seed = 0; seed < 20; seed++) {
      const result = createBoard(5, pool, seededRng(seed))
      expect(result.ok).toBe(true)
      if (!result.ok) continue
      const board = result.board
      for (let row = 0; row < 5; row++) {
        const longCount = [0, 1, 2, 3, 4].filter(
          (c) => board.cells[row * 5 + c]!.goal.cadence === 'long-term',
        ).length
        expect(longCount).toBeLessThanOrEqual(1)
      }
      for (let col = 0; col < 5; col++) {
        const longCount = [0, 1, 2, 3, 4].filter(
          (r) => board.cells[r * 5 + col]!.goal.cadence === 'long-term',
        ).length
        expect(longCount).toBeLessThanOrEqual(1)
      }
      const categoryCounts: Record<string, number> = {}
      for (const cell of board.cells) {
        categoryCounts[cell.goal.category] = (categoryCounts[cell.goal.category] ?? 0) + 1
      }
      for (const count of Object.values(categoryCounts)) {
        expect(count / 25).toBeLessThanOrEqual(CATEGORY_DOMINATION_THRESHOLD + 1e-9)
      }
    }
  })
})
