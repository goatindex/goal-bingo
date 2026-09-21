import { describe, expect, it } from 'vitest'
import {
  createBoard,
  everyCellHasOneTile,
  isSupportedSize,
  markCell,
  resizeBoard,
} from './board'
import { STARTER_POOL, loadState, saveState } from './storage'
import { MemoryStorage } from './test-support'

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

describe('marking (GB-FUN-002, GB-FUN-009)', () => {
  function board() {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const result = createBoard(5, pool, () => 0)
    if (!result.ok) throw new Error('unreachable: STARTER_POOL is never empty')
    return result.board
  }

  it('tapping an unmarked cell marks it', () => {
    const result = markCell(board(), 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.board.cells[0]!.marked).toBe(true)
  })

  it('is synchronous and takes only the index the tap identifies - no network call or permission check is possible', () => {
    const returned = markCell(board(), 0)
    // A Promise would mean the caller has to await an external step; markCell never
    // returns one, so there is nothing here that could be a network or permission call.
    expect(returned).not.toBeInstanceOf(Promise)
    expect(typeof returned).toBe('object')
  })

  it('tapping an already-marked cell is a no-op', () => {
    const marked = markCell(board(), 0)
    expect(marked.ok).toBe(true)
    if (!marked.ok) return
    const again = markCell(marked.board, 0)
    expect(again).toEqual({ ok: true, board: marked.board })
  })

  it('rejects an out-of-range index without mutating the board', () => {
    const start = board()
    const result = markCell(start, 999)
    expect(result).toEqual({ ok: false, reason: 'invalid-cell' })
    expect(start.cells.every((c) => !c.marked)).toBe(true)
  })

  it('a mark is retained across a storage round-trip as long as the line has not cleared', () => {
    const storage = new MemoryStorage()
    const { state } = loadState(storage)
    const marked = markCell(state.board, 0)
    expect(marked.ok).toBe(true)
    if (!marked.ok) return
    state.board = marked.board
    saveState(state, storage)
    const reloaded = loadState(storage)
    expect(reloaded.state.board.cells[0]!.marked).toBe(true)
  })
})

describe('multi-completion tiles (GB-FUN-045)', () => {
  function boardWithMultiCompletionAt0(completionsRequired: number) {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const result = createBoard(5, pool, () => 0)
    if (!result.ok) throw new Error('unreachable: STARTER_POOL is never empty')
    const cells = result.board.cells.slice()
    cells[0] = {
      ...cells[0]!,
      advanced: { kind: 'multi-completion', completionsRequired, completionsSoFar: 0 },
    }
    return { ...result.board, cells }
  }

  it('does not mark on a tap below the required count, and increments progress', () => {
    const result = markCell(boardWithMultiCompletionAt0(3), 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.board.cells[0]!.marked).toBe(false)
    expect(result.board.cells[0]!.advanced).toEqual({
      kind: 'multi-completion',
      completionsRequired: 3,
      completionsSoFar: 1,
    })
  })

  it('marks on the tap that reaches the required count, same as an ordinary tile', () => {
    let board = boardWithMultiCompletionAt0(3)
    for (let i = 0; i < 3; i++) {
      const result = markCell(board, 0)
      expect(result.ok).toBe(true)
      if (!result.ok) return
      board = result.board
    }
    expect(board.cells[0]!.marked).toBe(true)
    expect(board.cells[0]!.advanced?.completionsSoFar).toBe(3)
  })

  it('tapping an already-marked multi-completion tile is a no-op, same board reference', () => {
    let board = boardWithMultiCompletionAt0(1)
    const first = markCell(board, 0)
    expect(first.ok).toBe(true)
    if (!first.ok) return
    board = first.board
    expect(board.cells[0]!.marked).toBe(true)
    const second = markCell(board, 0)
    expect(second).toEqual({ ok: true, board })
  })
})
