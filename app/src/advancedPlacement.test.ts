import { describe, expect, it } from 'vitest'
import { ADVANCED_TILE_PASSIVE_CHANCE, applyPassivePlacement, placeOnUnlock } from './advancedPlacement'
import { freshAdvancedTileAccess, type AdvancedTileAccess } from './advancedUnlock'
import type { Board, Cell } from './board'
import type { Goal } from './pool'

function goal(id: string, category: string, cadence: Goal['cadence'] = 'daily'): Goal {
  return { id, title: id, category, cadence }
}

function cell(g: Goal, marked = false): Cell {
  return { goal: g, marked }
}

function boardOf(cells: Cell[]): Board {
  return { size: 5, cells }
}

function withUnlocked(access: AdvancedTileAccess, track: 'multi-completion' | 'mini-grid', category: string): AdvancedTileAccess {
  return {
    ...access,
    unlockedCategories: {
      ...access.unlockedCategories,
      [track]: [...access.unlockedCategories[track], category],
    },
  }
}

describe('placeOnUnlock (D-2026-09-21-23)', () => {
  it('converts an existing unmarked cell of the category immediately', () => {
    const board = boardOf([cell(goal('g1', 'health')), cell(goal('g2', 'study'))])
    const access = freshAdvancedTileAccess()
    const result = placeOnUnlock(board, 'multi-completion', 'health', access, [goal('g1', 'health')])
    expect(result.board.cells[0]!.advanced?.kind).toBe('multi-completion')
    expect(result.board.cells[0]!.goal.id).toBe('g1')
    expect(result.board.cells[1]!.advanced).toBeUndefined()
    expect(result.access.pendingPlacements).toEqual([])
  })

  it('never touches an already-marked cell of the category', () => {
    const board = boardOf([cell(goal('g1', 'health'), true)])
    const access = freshAdvancedTileAccess()
    const result = placeOnUnlock(board, 'multi-completion', 'health', access, [goal('g1', 'health')])
    expect(result.board.cells[0]!.advanced).toBeUndefined()
    expect(result.access.pendingPlacements).toEqual([{ track: 'multi-completion', category: 'health' }])
  })

  it('never touches a cell that is already an advanced tile', () => {
    const advancedCell: Cell = {
      goal: goal('g1', 'health'),
      marked: false,
      advanced: { kind: 'multi-completion', completionsRequired: 3, completionsSoFar: 0 },
    }
    const board = boardOf([advancedCell])
    const access = freshAdvancedTileAccess()
    const result = placeOnUnlock(board, 'mini-grid', 'health', access, [goal('g1', 'health')])
    expect(result.board.cells[0]).toBe(advancedCell)
    expect(result.access.pendingPlacements).toEqual([{ track: 'mini-grid', category: 'health' }])
  })

  it('queues a pending placement when no eligible cell exists on the board', () => {
    const board = boardOf([cell(goal('g1', 'study'))])
    const access = freshAdvancedTileAccess()
    const result = placeOnUnlock(board, 'mini-grid', 'health', access, [goal('g1', 'study')])
    expect(result.board).toBe(board)
    expect(result.access.pendingPlacements).toEqual([{ track: 'mini-grid', category: 'health' }])
  })
})

describe('applyPassivePlacement (D-2026-09-21-23)', () => {
  it('consumes a matching pending placement instead of rolling the passive chance', () => {
    const board = boardOf([cell(goal('g1', 'health'))])
    const access: AdvancedTileAccess = {
      ...freshAdvancedTileAccess(),
      pendingPlacements: [{ track: 'mini-grid', category: 'health' }],
    }
    // rng always returns 1 (never rolls the passive chance) - proves the pending path
    // fired independently of the roll.
    const result = applyPassivePlacement(board, [0], access, [goal('g1', 'health')], () => 1)
    expect(result.board.cells[0]!.advanced?.kind).toBe('mini-grid')
    expect(result.access.pendingPlacements).toEqual([])
  })

  it('rolls the passive chance for a category with an unlocked track', () => {
    const board = boardOf([cell(goal('g1', 'health'))])
    let access = freshAdvancedTileAccess()
    access = withUnlocked(access, 'multi-completion', 'health')
    const belowThreshold = () => ADVANCED_TILE_PASSIVE_CHANCE - 0.01
    const result = applyPassivePlacement(board, [0], access, [goal('g1', 'health')], belowThreshold)
    expect(result.board.cells[0]!.advanced?.kind).toBe('multi-completion')
  })

  it('leaves a plain goal alone when the roll misses the passive chance', () => {
    const board = boardOf([cell(goal('g1', 'health'))])
    let access = freshAdvancedTileAccess()
    access = withUnlocked(access, 'multi-completion', 'health')
    const aboveThreshold = () => ADVANCED_TILE_PASSIVE_CHANCE + 0.01
    const result = applyPassivePlacement(board, [0], access, [goal('g1', 'health')], aboveThreshold)
    expect(result.board.cells[0]!.advanced).toBeUndefined()
  })

  it('never rolls for a category with neither track unlocked', () => {
    const board = boardOf([cell(goal('g1', 'health'))])
    const access = freshAdvancedTileAccess()
    // rng always returns 0 (would always roll true if a track were unlocked).
    const result = applyPassivePlacement(board, [0], access, [goal('g1', 'health')], () => 0)
    expect(result.board.cells[0]!.advanced).toBeUndefined()
  })
})
