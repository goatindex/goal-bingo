import { describe, expect, it } from 'vitest'
import { createBoard } from './board'
import { freshAdvancedTileAccess } from './advancedUnlock'
import {
  GRID_EXPANSION_COST,
  applyPassivePlacementToExposed,
  exposedCellIndices,
  purchaseGridExpansion,
} from './expansion'
import { STARTER_POOL } from './storage'

describe('purchaseGridExpansion (GB-FUN-036)', () => {
  it('deducts board balance and grows the board from 5x5 to 7x7', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const result = purchaseGridExpansion(board.board, pool, GRID_EXPANSION_COST, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.board.size).toBe(7)
    expect(result.board.cells.length).toBe(49)
    expect(result.board.size * result.board.size).toBe(result.board.cells.length)
    expect(result.boardBalance).toBe(0)
    const score = { lifetime: 9, rewardBalance: 4, boardBalance: GRID_EXPANSION_COST }
    const next = { ...score, boardBalance: result.boardBalance }
    expect(next.lifetime).toBe(score.lifetime)
    expect(next.rewardBalance).toBe(score.rewardBalance)
  })

  it('keeps existing cells (and their marks) in the top-left, per resizeBoard', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const cells = board.board.cells.slice()
    cells[0] = { ...cells[0]!, marked: true }
    const marked = { ...board.board, cells }
    const goalAt0 = marked.cells[0]!.goal
    const result = purchaseGridExpansion(marked, pool, GRID_EXPANSION_COST, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.board.cells[0]!.marked).toBe(true)
    expect(result.board.cells[0]!.goal).toEqual(goalAt0)
  })

  it('refuses with insufficient board balance, with no state change', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const result = purchaseGridExpansion(board.board, pool, GRID_EXPANSION_COST - 1, () => 0)
    expect(result).toEqual({ ok: false, reason: 'insufficient-balance' })
  })

  it('refuses when the board is already at its largest size, with no state change', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(7, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const result = purchaseGridExpansion(board.board, pool, 10_000, () => 0)
    expect(result).toEqual({ ok: false, reason: 'max-size' })
  })
})

describe('exposed expansion placement (D-2026-09-21-23)', () => {
  it('lists only cells whose row or column is past the old size', () => {
    const indices = exposedCellIndices(5, 7)
    expect(indices).toHaveLength(49 - 25)
    expect(indices).toContain(6)
    expect(indices).not.toContain(0)
  })

  it('offers the passive advanced-tile chance only on cells the expansion just drew', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const built = createBoard(7, pool, () => 0)
    expect(built.ok).toBe(true)
    if (!built.ok) return
    const health = pool.find((g) => g.category === 'health')
    if (!health) throw new Error('starter pool has a health goal')
    const cells = built.board.cells.slice()
    cells[0] = { goal: health, marked: false }
    cells[6] = { goal: health, marked: false }
    const access = freshAdvancedTileAccess()
    access.unlockedCategories['multi-completion'] = ['health']
    const result = applyPassivePlacementToExposed(
      { ...built.board, cells },
      5,
      access,
      pool,
      () => 0,
    )
    expect(result.board.cells[6]!.advanced?.kind).toBe('multi-completion')
    expect(result.board.cells[0]!.advanced).toBeUndefined()
  })
})
