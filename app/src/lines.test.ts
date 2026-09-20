import { describe, expect, it } from 'vitest'
import { createBoard, everyCellHasOneTile } from './board'
import {
  BASE_SCORE_PER_LINE,
  allLines,
  linesThroughIndex,
  markCellAndResolve,
  resolveLineClears,
} from './lines'
import { STARTER_POOL } from './storage'

function freshBoard() {
  const pool = STARTER_POOL.map((g) => ({ ...g }))
  const result = createBoard(5, pool, () => 0)
  if (!result.ok) throw new Error('unreachable: STARTER_POOL is never empty')
  return { board: result.board, pool }
}

describe('line inventory (GB-FUN-010)', () => {
  it('a 5x5 grid has exactly 12 lines: 5 rows, 5 columns, 2 diagonals', () => {
    expect(allLines(5).length).toBe(12)
  })

  it('a corner cell touches its row and column only', () => {
    // Index 0 is (row 0, col 0): on the main diagonal too, so 3 lines, not 2 - a corner
    // of a square grid always sits on one diagonal.
    expect(linesThroughIndex(5, 0).length).toBe(3)
  })

  it('the centre cell of an odd grid touches all 4 line kinds', () => {
    // Index 12 is (row 2, col 2) on a 5x5 grid: its own row, its own column, and both
    // diagonals meet only here.
    expect(linesThroughIndex(5, 12).length).toBe(4)
  })
})

describe('single-line clear (GB-FUN-011)', () => {
  it('marking the final cell of a row clears that row', () => {
    const { board, pool } = freshBoard()
    // Row 0 is indices 0-4. Mark 0-3, leave 4 for the triggering tap.
    for (let i = 0; i < 4; i++) board.cells[i]!.marked = true
    const result = markCellAndResolve(board, 4, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outcome.clearedLineCount).toBe(1)
    for (let i = 0; i < 5; i++) expect(result.outcome.board.cells[i]!.marked).toBe(false)
  })

  it('marking the final cell of a column clears that column', () => {
    const { board, pool } = freshBoard()
    // Column 0 is indices 0, 5, 10, 15, 20.
    for (const i of [0, 5, 10, 15]) board.cells[i]!.marked = true
    const result = markCellAndResolve(board, 20, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outcome.clearedLineCount).toBe(1)
    for (const i of [0, 5, 10, 15, 20]) expect(result.outcome.board.cells[i]!.marked).toBe(false)
  })

  it('marking the final cell of a main diagonal clears that diagonal', () => {
    const { board, pool } = freshBoard()
    // Main diagonal is indices 0, 6, 12, 18, 24.
    for (const i of [0, 6, 12, 18]) board.cells[i]!.marked = true
    const result = markCellAndResolve(board, 24, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outcome.clearedLineCount).toBe(1)
    for (const i of [0, 6, 12, 18, 24]) expect(result.outcome.board.cells[i]!.marked).toBe(false)
  })

  it('the anti-diagonal also counts as a line', () => {
    const { board, pool } = freshBoard()
    // Anti-diagonal on a 5x5 grid is indices 4, 8, 12, 16, 20.
    for (const i of [4, 8, 12, 16]) board.cells[i]!.marked = true
    const result = markCellAndResolve(board, 20, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outcome.clearedLineCount).toBe(1)
  })

  it('a mark that completes no line resolves to a zero-length no-op', () => {
    const { board, pool } = freshBoard()
    const result = markCellAndResolve(board, 0, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outcome.clearedLineCount).toBe(0)
    expect(result.outcome.scoreDelta).toBe(0)
  })

  it('a clear increases score by BASE_SCORE_PER_LINE and the cells are refilled', () => {
    const { board, pool } = freshBoard()
    for (let i = 0; i < 4; i++) board.cells[i]!.marked = true
    const result = markCellAndResolve(board, 4, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outcome.scoreDelta).toBe(BASE_SCORE_PER_LINE)
    expect(everyCellHasOneTile(result.outcome.board)).toBe(true)
  })

  it('refuses to refill from an empty pool, without leaving the board partially cleared', () => {
    const { board } = freshBoard()
    for (let i = 0; i < 5; i++) board.cells[i]!.marked = true
    const result = resolveLineClears(board, 4, [], () => 0)
    expect(result).toEqual({ ok: false, reason: 'empty-pool' })
  })

  it('the mark is retained until the line clears, and cleared cells are never left empty', () => {
    const { board, pool } = freshBoard()
    // Mark cell 0 only - no line completes yet.
    const partial = markCellAndResolve(board, 0, pool, () => 0)
    expect(partial.ok).toBe(true)
    if (!partial.ok) return
    expect(partial.outcome.board.cells[0]!.marked).toBe(true)
    expect(everyCellHasOneTile(partial.outcome.board)).toBe(true)
  })
})
