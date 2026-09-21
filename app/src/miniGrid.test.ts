import { describe, expect, it } from 'vitest'
import { createBoard, type Board, type Cell } from './board'
import { CADENCE_BASE_VALUE, COMBO_BONUS_RATIO } from './lines'
import {
  MINI_GRID_SIZE,
  createMiniGrid,
  markMiniGridCell,
  markMiniGridCellOnBoard,
} from './miniGrid'
import type { Goal } from './pool'
import { STARTER_POOL } from './storage'

function goal(id: string, category: string, cadence: Goal['cadence']): Goal {
  return { id, title: id, category, cadence }
}

describe('createMiniGrid (GB-FUN-048, D-2026-09-21-23)', () => {
  it('populates 9 cells, all matching the parent category, none marked', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const result = createMiniGrid(pool, 'health', () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.advanced.kind).toBe('mini-grid')
    expect(result.advanced.cells).toHaveLength(MINI_GRID_SIZE * MINI_GRID_SIZE)
    expect(result.advanced.cells.every((c) => !c.marked)).toBe(true)
    expect(result.advanced.cells.every((c) => c.goal.category === 'health')).toBe(true)
  })

  it('repeats goals when the category has fewer than 9 distinct goals, rather than falling back to another category', () => {
    // STARTER_POOL has exactly 2 health goals - 9 cells cannot all be distinct.
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const result = createMiniGrid(pool, 'health', () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const ids = new Set(result.advanced.cells.map((c) => c.goal.id))
    expect(ids.size).toBeLessThan(MINI_GRID_SIZE * MINI_GRID_SIZE)
    expect(result.advanced.cells.every((c) => c.goal.category === 'health')).toBe(true)
  })

  it('draws from every distinct goal in a 9-goal category, not an artificially restricted subset', () => {
    const pool = Array.from({ length: 9 }, (_, i) => ({
      id: `h${i}`,
      title: `h${i}`,
      category: 'health',
      cadence: 'daily' as const,
    }))
    // Real randomness, many independent mini-grids: over 9 available distinct goals
    // and 9 cells each, seeing only 1-2 distinct ids across all of them would mean the
    // category filter (or something downstream) is wrongly narrowing the draw set,
    // not genuine bad luck.
    const seen = new Set<string>()
    for (let trial = 0; trial < 20; trial++) {
      const result = createMiniGrid(pool, 'health', Math.random)
      expect(result.ok).toBe(true)
      if (!result.ok) return
      for (const c of result.advanced.cells) seen.add(c.goal.id)
    }
    expect(seen.size).toBe(9)
  })

  it('refuses on a category with no goals, the same way an empty pool refuses', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const result = createMiniGrid(pool, 'nonexistent-category', () => 0)
    expect(result).toEqual({ ok: false, reason: 'empty-pool' })
  })

  it('refuses on an empty pool', () => {
    const result = createMiniGrid([], 'health', () => 0)
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

describe('markMiniGridCellOnBoard (GB-FUN-049, GB-FUN-050)', () => {
  // Internal row 0 is [a,a,b]: mixed (2 distinct of 3), so no internal combo bonus.
  // base = daily(2)*3 = 6. Marking internal index 2 completes it.
  const MINI_GRID_CLEAR_VALUE = 6

  function boardWithMiniGridAt0(): { board: Board; pool: Goal[] } {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const built = createBoard(5, pool, () => 0)
    if (!built.ok) throw new Error('unreachable: STARTER_POOL is never empty')
    const internalRowGoals = ['a', 'a', 'b'].map((c, i) => goal(`mg-r${i}`, c, 'daily'))
    const internalCells: Cell[] = [
      { goal: internalRowGoals[0]!, marked: true },
      { goal: internalRowGoals[1]!, marked: true },
      { goal: internalRowGoals[2]!, marked: false },
      ...Array.from({ length: 6 }, (_, i) => ({
        goal: goal(`mg-x${i}`, 'zz', 'hourly'),
        marked: false,
      })),
    ]
    const cells = built.board.cells.slice()
    cells[0] = {
      ...cells[0]!,
      marked: false,
      advanced: { kind: 'mini-grid', cells: internalCells },
    }
    return { board: { ...built.board, cells }, pool }
  }

  it('refuses when the target cell does not carry a mini-grid', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const built = createBoard(5, pool, () => 0)
    if (!built.ok) throw new Error('unreachable')
    const result = markMiniGridCellOnBoard(built.board, 0, 0, pool, () => 0)
    expect(result).toEqual({ ok: false, reason: 'not-mini-grid' })
  })

  it('refuses on invalid-cell for an out-of-range parent index', () => {
    const { board, pool } = boardWithMiniGridAt0()
    const result = markMiniGridCellOnBoard(board, 999, 0, pool, () => 0)
    expect(result).toEqual({ ok: false, reason: 'invalid-cell' })
  })

  it('updates the internal grid without marking the parent when no internal line completes', () => {
    const { board, pool } = boardWithMiniGridAt0()
    const result = markMiniGridCellOnBoard(board, 0, 8, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.board.cells[0]!.marked).toBe(false)
    expect(result.scoreDelta).toBe(0)
    const advanced = result.board.cells[0]!.advanced
    expect(advanced?.kind === 'mini-grid' && advanced.cells[8]!.marked).toBe(true)
  })

  it('marks the parent cell and awards the mini-grid clear value when nothing else completes', () => {
    const { board, pool } = boardWithMiniGridAt0()
    const result = markMiniGridCellOnBoard(board, 0, 2, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.board.cells[0]!.marked).toBe(true)
    expect(result.scoreDelta).toBe(MINI_GRID_CLEAR_VALUE)
  })

  it('adds a cascading main-board clear to the mini-grid clear when marking completes a line', () => {
    const { board, pool } = boardWithMiniGridAt0()
    // Complete row 0 on the main board: mark cells 1-4 with 3 distinct categories
    // (mixed, no combo) so the row's value is hand-computable independent of the
    // mini-grid's own scoring.
    const rowGoals = ['a', 'a', 'b', 'b', 'c']
    const cells = board.cells.slice()
    for (let col = 1; col < 5; col++) {
      cells[col] = { goal: goal(`row0-${col}`, rowGoals[col]!, 'daily'), marked: true }
    }
    cells[0] = { ...cells[0]!, goal: goal('row0-0', rowGoals[0]!, 'daily') }
    const withRow: Board = { ...board, cells }
    const result = markMiniGridCellOnBoard(withRow, 0, 2, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const rowValue = 5 * CADENCE_BASE_VALUE.daily // mixed categories, no combo bonus
    expect(result.scoreDelta).toBe(MINI_GRID_CLEAR_VALUE + rowValue)
    expect(result.board.cells[0]!.marked).toBe(false) // refilled by the row clear
  })

  it('adds the full-board bonus only when the parent cell was the last one unmarked', () => {
    const buildFullBoard = (leaveExtraUnmarked: boolean) => {
      const { board, pool } = boardWithMiniGridAt0()
      const cells = board.cells.slice()
      for (let i = 1; i < cells.length; i++) {
        // Cell 14 is not on cell 0's row, column, or diagonal, nor orthogonally
        // adjacent to any cell that is - safe to toggle without changing which
        // main-board lines complete, or their adjacency bonus, when cell 0 marks.
        if (leaveExtraUnmarked && i === 14) continue
        cells[i] = { ...cells[i]!, marked: true }
      }
      return { board: { ...board, cells }, pool }
    }

    const withExtraUnmarked = buildFullBoard(true)
    const notLast = markMiniGridCellOnBoard(
      withExtraUnmarked.board,
      0,
      2,
      withExtraUnmarked.pool,
      () => 0,
    )
    expect(notLast.ok).toBe(true)

    const fullExceptParent = buildFullBoard(false)
    const wasLast = markMiniGridCellOnBoard(
      fullExceptParent.board,
      0,
      2,
      fullExceptParent.pool,
      () => 0,
    )
    expect(wasLast.ok).toBe(true)
    if (!notLast.ok || !wasLast.ok) return

    // The two scenarios complete the exact same main-board lines through cell 0,
    // with the same adjacency bonus (cell 14 touches neither) - the only difference
    // is the full-board condition, so the score delta isolates exactly the bonus.
    expect(wasLast.scoreDelta - notLast.scoreDelta).toBe(MINI_GRID_CLEAR_VALUE)
  })
})
