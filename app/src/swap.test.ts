import { describe, expect, it } from 'vitest'
import { createBoard } from './board'
import { STARTER_POOL } from './storage'
import { SWAP_COST, swapCells } from './swap'

describe('swapCells (GB-FUN-038)', () => {
  it('exchanges the goals of two adjacent cells', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const goalAt0 = board.board.cells[0]!.goal
    const goalAt1 = board.board.cells[1]!.goal
    const score = { lifetime: 8, rewardBalance: 2, boardBalance: SWAP_COST }
    const result = swapCells(board.board, 0, 1, score.boardBalance)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.board.cells[0]!.goal).toEqual(goalAt1)
    expect(result.board.cells[1]!.goal).toEqual(goalAt0)
    const next = { ...score, boardBalance: result.boardBalance }
    expect(next.lifetime).toBe(score.lifetime)
    expect(next.rewardBalance).toBe(score.rewardBalance)
  })

  it('exchanges marked state along with the goal - a mark travels with its tile', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const cells = board.board.cells.slice()
    cells[0] = { ...cells[0]!, marked: true }
    const marked = { ...board.board, cells }
    const goalAt0 = marked.cells[0]!.goal
    const result = swapCells(marked, 0, 1, SWAP_COST)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.board.cells[0]!.marked).toBe(false)
    expect(result.board.cells[1]!.marked).toBe(true)
    expect(result.board.cells[1]!.goal).toEqual(goalAt0)
  })

  it('refuses to swap two cells that are not orthogonally adjacent', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    // Index 6 is diagonal from index 0 on a 5-wide board.
    const result = swapCells(board.board, 0, 6, SWAP_COST)
    expect(result).toEqual({ ok: false, reason: 'not-adjacent' })
  })

  it('deducts the swap cost from board balance', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const result = swapCells(board.board, 0, 1, 25)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.boardBalance).toBe(25 - SWAP_COST)
  })

  it('refuses with insufficient board balance, with no state change', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const result = swapCells(board.board, 0, 1, SWAP_COST - 1)
    expect(result).toEqual({ ok: false, reason: 'insufficient-balance' })
  })

  it('refuses to swap a cell with itself', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const result = swapCells(board.board, 0, 0, SWAP_COST)
    expect(result).toEqual({ ok: false, reason: 'not-adjacent' })
  })
})
