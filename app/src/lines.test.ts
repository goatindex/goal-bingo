import { describe, expect, it } from 'vitest'
import { createBoard, everyCellHasOneTile } from './board'
import {
  BASE_SCORE_PER_LINE,
  MULTI_CLEAR_BONUS_RATIO,
  allLines,
  countMarked,
  linesThroughIndex,
  markCellAndResolve,
  resolveLineClears,
} from './lines'
import type { Goal } from './pool'
import { STARTER_POOL } from './storage'
import { seededRng } from './test-support'

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

describe('simultaneous multi-line clear (GB-FUN-012, GB-FUN-013, GB-FUN-014)', () => {
  function setUpDoubleClear() {
    const { board, pool } = freshBoard()
    // Row 2 is [10,11,12,13,14]; column 2 is [2,7,12,17,22]. They share only the
    // centre cell, 12. Mark every cell of both lines except the shared one, then
    // trigger by marking 12 - completing both lines on the same mark.
    for (const i of [10, 11, 13, 14, 2, 7, 17, 22]) board.cells[i]!.marked = true
    const result = markCellAndResolve(board, 12, pool, () => 0)
    if (!result.ok) throw new Error('unreachable: pool is never empty in this setup')
    return result.outcome
  }

  it('a mark completing two lines at once clears both, not just one', () => {
    const outcome = setUpDoubleClear()
    expect(outcome.clearedLineCount).toBe(2)
  })

  it('refills every cell from both lines', () => {
    const outcome = setUpDoubleClear()
    for (const i of [10, 11, 12, 13, 14, 2, 7, 17, 22]) {
      expect(outcome.board.cells[i]!.marked).toBe(false)
    }
    expect(everyCellHasOneTile(outcome.board)).toBe(true)
  })

  it('awards a 50% multi-clear bonus on top of the summed base score (D-2026-09-20-9)', () => {
    const outcome = setUpDoubleClear()
    const summedBase = 2 * BASE_SCORE_PER_LINE
    const expectedBonus = Math.round(summedBase * MULTI_CLEAR_BONUS_RATIO)
    expect(outcome.scoreDelta).toBe(summedBase + expectedBonus)
    expect(outcome.scoreDelta).toBeGreaterThan(summedBase)
  })

  it('a single-line clear earns no multi-clear bonus', () => {
    const { board, pool } = freshBoard()
    for (let i = 0; i < 4; i++) board.cells[i]!.marked = true
    const result = markCellAndResolve(board, 4, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outcome.scoreDelta).toBe(BASE_SCORE_PER_LINE)
  })

  it('reports the shared cell as the intersection of the two clearing lines', () => {
    const outcome = setUpDoubleClear()
    expect(outcome.intersectionCells).toEqual([12])
  })

  it('a single-line clear reports no intersection cells', () => {
    const { board, pool } = freshBoard()
    for (let i = 0; i < 4; i++) board.cells[i]!.marked = true
    const result = markCellAndResolve(board, 4, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outcome.intersectionCells).toEqual([])
  })
})

describe('perpendicular progress loss (GB-FUN-015)', () => {
  it('a row clear discards a contributing cell\'s mark, dropping a perpendicular column\'s progress', () => {
    const { board, pool } = freshBoard()
    // Row 0 is [0,1,2,3,4]. Column 0 is [0,5,10,15,20]. Mark row 0's first four cells
    // (0-3), plus two more column-0 cells (5, 10) that are not part of row 0 otherwise -
    // column 0 now has 3 marked cells (0, 5, 10) and is nowhere near complete.
    for (const i of [0, 1, 2, 3, 5, 10]) board.cells[i]!.marked = true
    const column0 = [0, 5, 10, 15, 20]
    expect(countMarked(board, column0)).toBe(3)

    const result = markCellAndResolve(board, 4, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    // Row 0 cleared, so cell 0 was refilled (unmarked) - column 0's progress drops to
    // just the two cells (5, 10) that were never part of the clearing row.
    expect(countMarked(result.outcome.board, column0)).toBe(2)
    expect(result.outcome.board.cells[0]!.marked).toBe(false)
    expect(result.outcome.board.cells[5]!.marked).toBe(true)
    expect(result.outcome.board.cells[10]!.marked).toBe(true)
  })
})

describe('refill respects binding placement rules across a whole batch (GB-FUN-023, GB-FUN-024)', () => {
  it('a multi-cell refill never places two long-term goals in the same line', () => {
    const pool: Goal[] = [
      { id: 'l1', title: 'L1', category: 'a', cadence: 'long-term' },
      { id: 'l2', title: 'L2', category: 'a', cadence: 'long-term' },
      { id: 'h1', title: 'H1', category: 'b', cadence: 'hourly' },
      { id: 'd1', title: 'D1', category: 'c', cadence: 'daily' },
      { id: 'w1', title: 'W1', category: 'd', cadence: 'weekly' },
    ]
    for (let seed = 0; seed < 20; seed++) {
      const rng = seededRng(seed)
      const built = createBoard(5, pool, rng)
      expect(built.ok).toBe(true)
      if (!built.ok) continue
      // Mark all of row 0 except cell 4 - the trigger - so the whole row refills at
      // once, exercising the multi-cell batch path in resolveLineClears.
      const board = built.board
      for (let i = 0; i < 4; i++) board.cells[i]!.marked = true
      const result = resolveLineClears(board, 4, pool, rng)
      expect(result.ok).toBe(true)
      if (!result.ok) continue
      const refilled = result.outcome.board
      for (let row = 0; row < 5; row++) {
        const longCount = [0, 1, 2, 3, 4].filter(
          (c) => refilled.cells[row * 5 + c]!.goal.cadence === 'long-term',
        ).length
        expect(longCount).toBeLessThanOrEqual(1)
      }
      for (let col = 0; col < 5; col++) {
        const longCount = [0, 1, 2, 3, 4].filter(
          (r) => refilled.cells[r * 5 + col]!.goal.cadence === 'long-term',
        ).length
        expect(longCount).toBeLessThanOrEqual(1)
      }
    }
  })
})
