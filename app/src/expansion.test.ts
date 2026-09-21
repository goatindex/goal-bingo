import { describe, expect, it } from 'vitest'
import { createBoard } from './board'
import { GRID_EXPANSION_COST, purchaseGridExpansion } from './expansion'
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
    expect(result.boardBalance).toBe(0)
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
