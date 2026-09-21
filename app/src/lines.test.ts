import { describe, expect, it } from 'vitest'
import { createBoard, everyCellHasOneTile, type Board } from './board'
import {
  CADENCE_BASE_VALUE,
  COMBO_BONUS_RATIO,
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

  it('a clear increases score and the cells are refilled', () => {
    const { board, pool } = freshBoard()
    for (let i = 0; i < 4; i++) board.cells[i]!.marked = true
    const result = markCellAndResolve(board, 4, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outcome.scoreDelta).toBeGreaterThan(0)
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

  it('awards a 50% multi-clear bonus on top of the summed line value (D-2026-09-20-9)', () => {
    const g = (id: string, category: string): Goal => ({
      id,
      title: id,
      category,
      cadence: 'hourly',
    })
    const goals: Record<number, Goal> = {
      10: g('g10', 'p'),
      11: g('g11', 'p'),
      12: g('g12', 'q'),
      13: g('g13', 'q'),
      14: g('g14', 'r'),
      2: g('g2', 's'),
      7: g('g7', 's'),
      17: g('g17', 't'),
      22: g('g22', 't'),
    }
    const filler = g('filler', 'zz')
    const cells = Array.from({ length: 25 }, (_, i) => ({
      goal: goals[i] ?? filler,
      marked: false,
    }))
    const board: Board = { size: 5, cells }
    const pool = Object.values(goals)
    for (const i of [10, 11, 13, 14, 2, 7, 17, 22]) board.cells[i]!.marked = true
    const result = markCellAndResolve(board, 12, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    // Both lines: 5 hourly tiles each, mixed categories (no combo), no adjacency
    // (nothing outside the two clearing lines is marked) - each line's value is just
    // its summed cadence base.
    const perLineValue = 5 * CADENCE_BASE_VALUE.hourly
    const summedLineValue = 2 * perLineValue
    const expectedBonus = Math.round(summedLineValue * MULTI_CLEAR_BONUS_RATIO)
    expect(result.outcome.scoreDelta).toBe(summedLineValue + expectedBonus)
    expect(result.outcome.scoreDelta).toBeGreaterThan(summedLineValue)
  })

  it('a single-line clear earns no multi-clear bonus', () => {
    // Row 0, all hourly, mixed categories (a,a,b,b,c - no combo): base value 5, no
    // multi-clear bonus since only one line completes.
    const g = (id: string, category: string): Goal => ({
      id,
      title: id,
      category,
      cadence: 'hourly',
    })
    const filler = g('filler', 'zz')
    const rowGoals = [g('g0', 'a'), g('g1', 'a'), g('g2', 'b'), g('g3', 'b'), g('g4', 'c')]
    const cells = Array.from({ length: 25 }, (_, i) => ({
      goal: i < 5 ? rowGoals[i]! : filler,
      marked: false,
    }))
    const board: Board = { size: 5, cells }
    const pool = [...rowGoals, filler]
    for (let i = 0; i < 4; i++) board.cells[i]!.marked = true
    const result = markCellAndResolve(board, 4, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outcome.scoreDelta).toBe(5 * CADENCE_BASE_VALUE.hourly)
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

function goal(id: string, category: string, cadence: Goal['cadence']): Goal {
  return { id, title: id, category, cadence }
}

function lineBoard(lineGoals: Goal[], fillerCategory = 'zz'): { board: Board; pool: Goal[] } {
  const filler = goal('filler', fillerCategory, 'hourly')
  const cells = Array.from({ length: 25 }, (_, i) => ({
    goal: lineGoals[i] ?? filler,
    marked: false,
  }))
  return { board: { size: 5, cells }, pool: [...lineGoals, filler] }
}

// Every row/column/diagonal on a 5x5 board is 5 cells - "mixed" here always means 3
// distinct categories (a,a,b,b,c), which is neither all-same (matching) nor
// all-distinct (variety), to isolate whatever effect a given test is checking.
const MIXED_CATEGORIES = ['a', 'a', 'b', 'b', 'c']

describe('clear scoring (GB-FUN-003, GB-FUN-028, GB-FUN-029, GB-FUN-030, GB-FUN-031, GB-FUN-033, GB-FUN-068)', () => {
  it('a cleared line of long-term goals scores higher than an equal-length line of daily goals', () => {
    const longLine = MIXED_CATEGORIES.map((c, i) => goal(`l${i}`, c, 'long-term'))
    const { board: longBoard, pool: longPool } = lineBoard(longLine)
    for (let i = 0; i < 4; i++) longBoard.cells[i]!.marked = true
    const longResult = markCellAndResolve(longBoard, 4, longPool, () => 0)
    expect(longResult.ok).toBe(true)

    const dailyLine = MIXED_CATEGORIES.map((c, i) => goal(`d${i}`, c, 'daily'))
    const { board: dailyBoard, pool: dailyPool } = lineBoard(dailyLine)
    for (let i = 0; i < 4; i++) dailyBoard.cells[i]!.marked = true
    const dailyResult = markCellAndResolve(dailyBoard, 4, dailyPool, () => 0)
    expect(dailyResult.ok).toBe(true)

    if (!longResult.ok || !dailyResult.ok) return
    expect(longResult.outcome.scoreDelta).toBeGreaterThan(dailyResult.outcome.scoreDelta)
    expect(longResult.outcome.scoreDelta).toBe(5 * CADENCE_BASE_VALUE['long-term'])
    expect(dailyResult.outcome.scoreDelta).toBe(5 * CADENCE_BASE_VALUE.daily)
  })

  it('a matching line (all one category) scores higher than the same cadences mixed', () => {
    const matching = [0, 1, 2, 3, 4].map((i) => goal(`m${i}`, 'same', 'daily'))
    const { board: matchBoard, pool: matchPool } = lineBoard(matching)
    for (let i = 0; i < 4; i++) matchBoard.cells[i]!.marked = true
    const matchResult = markCellAndResolve(matchBoard, 4, matchPool, () => 0)

    const mixed = MIXED_CATEGORIES.map((c, i) => goal(`x${i}`, c, 'daily'))
    const { board: mixedBoard, pool: mixedPool } = lineBoard(mixed)
    for (let i = 0; i < 4; i++) mixedBoard.cells[i]!.marked = true
    const mixedResult = markCellAndResolve(mixedBoard, 4, mixedPool, () => 0)

    expect(matchResult.ok).toBe(true)
    expect(mixedResult.ok).toBe(true)
    if (!matchResult.ok || !mixedResult.ok) return
    expect(matchResult.outcome.scoreDelta).toBeGreaterThan(mixedResult.outcome.scoreDelta)
    const base = 5 * CADENCE_BASE_VALUE.daily
    expect(matchResult.outcome.scoreDelta).toBe(Math.round(base * (1 + COMBO_BONUS_RATIO)))
    expect(mixedResult.outcome.scoreDelta).toBe(base)
  })

  it('a variety line (all distinct categories) scores higher than the same cadences mixed', () => {
    const variety = ['a', 'b', 'c', 'd', 'e'].map((c, i) => goal(`v${i}`, c, 'daily'))
    const { board: varietyBoard, pool: varietyPool } = lineBoard(variety)
    for (let i = 0; i < 4; i++) varietyBoard.cells[i]!.marked = true
    const varietyResult = markCellAndResolve(varietyBoard, 4, varietyPool, () => 0)

    const mixed = MIXED_CATEGORIES.map((c, i) => goal(`x${i}`, c, 'daily'))
    const { board: mixedBoard, pool: mixedPool } = lineBoard(mixed)
    for (let i = 0; i < 4; i++) mixedBoard.cells[i]!.marked = true
    const mixedResult = markCellAndResolve(mixedBoard, 4, mixedPool, () => 0)

    expect(varietyResult.ok).toBe(true)
    expect(mixedResult.ok).toBe(true)
    if (!varietyResult.ok || !mixedResult.ok) return
    expect(varietyResult.outcome.scoreDelta).toBeGreaterThan(mixedResult.outcome.scoreDelta)
    const base = 5 * CADENCE_BASE_VALUE.daily
    expect(varietyResult.outcome.scoreDelta).toBe(Math.round(base * (1 + COMBO_BONUS_RATIO)))
  })

  it('the same line shape scores differently depending on adjacent marked cells (GB-FUN-031)', () => {
    const rowGoals = MIXED_CATEGORIES.map((c, i) => goal(`r${i}`, c, 'hourly'))
    const { board: plainBoard, pool } = lineBoard(rowGoals)
    for (let i = 0; i < 4; i++) plainBoard.cells[i]!.marked = true
    const plainResult = markCellAndResolve(plainBoard, 4, pool, () => 0)
    expect(plainResult.ok).toBe(true)
    if (!plainResult.ok) return
    expect(plainResult.outcome.scoreDelta).toBe(5 * CADENCE_BASE_VALUE.hourly)

    // Same row, but cell 5 (directly below cell 0, adjacent to the line) is marked -
    // one qualifying neighbour, and not itself part of the clearing line.
    const { board: adjBoard, pool: adjPool } = lineBoard(rowGoals)
    for (let i = 0; i < 4; i++) adjBoard.cells[i]!.marked = true
    adjBoard.cells[5]!.marked = true
    const adjResult = markCellAndResolve(adjBoard, 4, adjPool, () => 0)
    expect(adjResult.ok).toBe(true)
    if (!adjResult.ok) return

    expect(adjResult.outcome.scoreDelta).toBeGreaterThan(plainResult.outcome.scoreDelta)
    expect(adjResult.outcome.scoreDelta - plainResult.outcome.scoreDelta).toBe(1)
  })

  it('produces zero adjacency bonus when no cell outside the line is marked', () => {
    const rowGoals = MIXED_CATEGORIES.map((c, i) => goal(`z${i}`, c, 'hourly'))
    const { board, pool } = lineBoard(rowGoals)
    for (let i = 0; i < 4; i++) board.cells[i]!.marked = true
    const result = markCellAndResolve(board, 4, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    // No adjacency bonus means the score is exactly the base value - no combo either
    // (MIXED_CATEGORIES is neither all-same nor all-distinct).
    expect(result.outcome.scoreDelta).toBe(5 * CADENCE_BASE_VALUE.hourly)
  })
})

describe('clearedCategories reporting (GB-FUN-052)', () => {
  it('reports one category per cleared cell, matching MIXED_CATEGORIES exactly', () => {
    const mixed = MIXED_CATEGORIES.map((c, i) => goal(`c${i}`, c, 'daily'))
    const { board, pool } = lineBoard(mixed)
    for (let i = 0; i < 4; i++) board.cells[i]!.marked = true
    const result = markCellAndResolve(board, 4, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outcome.clearedCategories.sort()).toEqual([...MIXED_CATEGORIES].sort())
  })

  it('reports an empty list when the mark completes no line', () => {
    const { board, pool } = freshBoard()
    const result = markCellAndResolve(board, 0, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outcome.clearedCategories).toEqual([])
  })

  it('counts an intersection cell once, not once per completing line', () => {
    // Build a board where marking the centre cell completes both its row and column
    // simultaneously - the centre cell is the sole intersection, so it must appear
    // exactly once in clearedCategories despite belonging to 2 completing lines.
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const built = createBoard(5, pool, () => 0)
    if (!built.ok) throw new Error('unreachable')
    const board = built.board
    const cells = board.cells.slice()
    const rowGoals = MIXED_CATEGORIES.map((c, i) => goal(`row${i}`, c, 'daily'))
    const colGoals = ['d', 'd', 'e', 'e', 'f'].map((c, i) => goal(`col${i}`, c, 'daily'))
    const centreGoal = goal('centre', 'centre-only', 'daily')
    for (let col = 0; col < 5; col++) {
      cells[2 * 5 + col] = { goal: rowGoals[col]!, marked: col !== 2 }
    }
    for (let row = 0; row < 5; row++) {
      if (row === 2) continue
      cells[row * 5 + 2] = { goal: colGoals[row]!, marked: true }
    }
    // Overwrite the centre last: it belongs to both the row and column arrays above,
    // but must hold a category found nowhere else on the board to isolate the count.
    cells[12] = { goal: centreGoal, marked: false }
    const testBoard: Board = { ...board, cells }
    const result = markCellAndResolve(testBoard, 12, pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outcome.clearedLineCount).toBe(2)
    expect(result.outcome.intersectionCells).toEqual([12])
    const centreCount = result.outcome.clearedCategories.filter(
      (c) => c === centreGoal.category,
    ).length
    expect(centreCount).toBe(1)
    expect(result.outcome.clearedCategories).toHaveLength(9)
  })
})
