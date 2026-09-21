import { describe, expect, it } from 'vitest'
import type { Cell } from './board'
import { CADENCE_BASE_VALUE, COMBO_BONUS_RATIO } from './lines'
import { MINI_GRID_SIZE, createMiniGrid, markMiniGridCell } from './miniGrid'
import type { Goal } from './pool'
import { STARTER_POOL } from './storage'

function goal(id: string, category: string, cadence: Goal['cadence']): Goal {
  return { id, title: id, category, cadence }
}

describe('createMiniGrid (GB-FUN-048)', () => {
  it('populates 9 cells from the supplied pool, none marked', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const result = createMiniGrid(pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.advanced.kind).toBe('mini-grid')
    expect(result.advanced.cells).toHaveLength(MINI_GRID_SIZE * MINI_GRID_SIZE)
    expect(result.advanced.cells.every((c) => !c.marked)).toBe(true)
    expect(result.advanced.cells.every((c) => pool.some((g) => g.id === c.goal.id))).toBe(true)
  })

  it('refuses on an empty pool', () => {
    const result = createMiniGrid([], () => 0)
    expect(result).toEqual({ ok: false, reason: 'empty-pool' })
  })
})

describe('markMiniGridCell (GB-FUN-047)', () => {
  function grid(goals: Goal[]): Cell[] {
    return goals.map((g) => ({ goal: g, marked: false }))
  }

  it('marks an unmarked internal cell without completing anything', () => {
    const cells = grid(
      Array.from({ length: 9 }, (_, i) => goal(`g${i}`, 'zz', 'daily')),
    )
    const result = markMiniGridCell(cells, 0, [goal('filler', 'zz', 'daily')], () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.cells[0]!.marked).toBe(true)
    expect(result.scoreDelta).toBe(0)
    expect(result.parentShouldMark).toBe(false)
  })

  it('tapping an already-marked internal cell is a no-op', () => {
    const cells = grid(Array.from({ length: 9 }, (_, i) => goal(`g${i}`, 'zz', 'daily')))
    cells[0] = { ...cells[0]!, marked: true }
    const result = markMiniGridCell(cells, 0, [goal('filler', 'zz', 'daily')], () => 0)
    expect(result).toEqual({ ok: true, cells, scoreDelta: 0, parentShouldMark: false })
  })

  it('completing an internal line scores it and reports the parent should mark', () => {
    // Row 0 is indices 0,1,2 on a 3x3 grid. Mark 0 and 1, then complete with 2.
    const rowGoals = ['a', 'a', 'b'].map((c, i) => goal(`r${i}`, c, 'daily'))
    const cells = grid([
      rowGoals[0]!,
      rowGoals[1]!,
      rowGoals[2]!,
      ...Array.from({ length: 6 }, (_, i) => goal(`x${i}`, 'zz', 'hourly')),
    ])
    cells[0] = { ...cells[0]!, marked: true }
    cells[1] = { ...cells[1]!, marked: true }
    const result = markMiniGridCell(cells, 2, [goal('filler', 'zz', 'daily')], () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.parentShouldMark).toBe(true)
    // base = daily(2)+daily(2)+daily(2) = 6, mixed (2 distinct of 3) -> no combo bonus.
    expect(result.scoreDelta).toBe(6)
    // The completed row's cells are refilled with the filler goal, unmarked.
    expect(result.cells[0]!.marked).toBe(false)
    expect(result.cells[1]!.marked).toBe(false)
    expect(result.cells[2]!.marked).toBe(false)
    expect(result.cells[0]!.goal.id).toBe('filler')
  })

  it('scores a matching-combo line with the same +50% bonus as the main board', () => {
    const rowGoals = ['a', 'a', 'a'].map((c, i) => goal(`m${i}`, c, 'daily'))
    const cells = grid([
      rowGoals[0]!,
      rowGoals[1]!,
      rowGoals[2]!,
      ...Array.from({ length: 6 }, (_, i) => goal(`x${i}`, 'zz', 'hourly')),
    ])
    cells[0] = { ...cells[0]!, marked: true }
    cells[1] = { ...cells[1]!, marked: true }
    const result = markMiniGridCell(cells, 2, [goal('filler', 'zz', 'daily')], () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const base = 3 * CADENCE_BASE_VALUE.daily
    expect(result.scoreDelta).toBe(Math.round(base * (1 + COMBO_BONUS_RATIO)))
  })

  it('refuses on invalid-cell for an out-of-range index', () => {
    const cells = grid(Array.from({ length: 9 }, (_, i) => goal(`g${i}`, 'zz', 'daily')))
    const result = markMiniGridCell(cells, 99, [goal('filler', 'zz', 'daily')], () => 0)
    expect(result).toEqual({ ok: false, reason: 'invalid-cell' })
  })
})
