import { describe, expect, it } from 'vitest'
import { createBoard, everyCellHasOneTile, isSupportedSize, resizeBoard } from './board'
import { STARTER_POOL } from './storage'

describe('board sizing (GB-FUN-001, GB-FUN-005, GB-FUN-006)', () => {
  it('starts at 5x5 (D-2026-09-20-8)', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const result = createBoard(5, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.board.size).toBe(5)
    expect(result.board.cells.length).toBe(25)
  })

  it('recognises only 5 and 7 as supported sizes', () => {
    expect(isSupportedSize(5)).toBe(true)
    expect(isSupportedSize(7)).toBe(true)
    expect(isSupportedSize(3)).toBe(false)
    expect(isSupportedSize(9)).toBe(false)
  })

  it('resizes to 7x7 and the new dimensions round-trip through a fresh read', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const start = createBoard(5, pool, () => 0)
    expect(start.ok).toBe(true)
    if (!start.ok) return
    const resized = resizeBoard(start.board, 7, pool, () => 0)
    expect(resized.ok).toBe(true)
    if (!resized.ok) return
    expect(resized.board.size).toBe(7)
    expect(resized.board.cells.length).toBe(49)
    // Round-trip through JSON, the same shape persistence uses.
    const restored = JSON.parse(JSON.stringify(resized.board))
    expect(restored.size).toBe(7)
  })

  it('keeps existing cells (and their marks) in place on resize', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const start = createBoard(5, pool, () => 0)
    expect(start.ok).toBe(true)
    if (!start.ok) return
    start.board.cells[0]!.marked = true
    const original = start.board.cells[0]!.goal.id
    const resized = resizeBoard(start.board, 7, pool, () => 0)
    expect(resized.ok).toBe(true)
    if (!resized.ok) return
    expect(resized.board.cells[0]!.marked).toBe(true)
    expect(resized.board.cells[0]!.goal.id).toBe(original)
  })

  it('rejects an unsupported resize target without mutating the board', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const start = createBoard(5, pool, () => 0)
    expect(start.ok).toBe(true)
    if (!start.ok) return
    const result = resizeBoard(start.board, 6, pool, () => 0)
    expect(result).toEqual({ ok: false, reason: 'unsupported-size' })
    expect(start.board.size).toBe(5)
    expect(start.board.cells.length).toBe(25)
  })
})

describe('cell integrity (GB-FUN-007, GB-FUN-008)', () => {
  it('every cell holds exactly one tile on a fresh board', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const result = createBoard(5, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(everyCellHasOneTile(result.board)).toBe(true)
  })

  it('refuses to create a board when the pool is empty', () => {
    const result = createBoard(5, [], () => 0)
    expect(result).toEqual({ ok: false, reason: 'empty-pool' })
  })

  it('every newly exposed cell on growth is filled before the board is returned', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const start = createBoard(5, pool, () => 0)
    expect(start.ok).toBe(true)
    if (!start.ok) return
    const resized = resizeBoard(start.board, 7, pool, () => 0)
    expect(resized.ok).toBe(true)
    if (!resized.ok) return
    expect(everyCellHasOneTile(resized.board)).toBe(true)
  })
})

describe('no end state (GB-FUN-001)', () => {
  it('the board type carries no terminal or game-over state', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const result = createBoard(5, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(Object.keys(result.board)).toEqual(['size', 'cells'])
  })
})
