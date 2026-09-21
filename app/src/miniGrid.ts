/** Mini-grid tiles: a self-contained internal board nested in one main-board cell
 *  (GB-FUN-047, GB-FUN-048, GB-FUN-049, GB-FUN-050). */

import type { AdvancedTile, Board, Cell } from './board'
import { drawWeighted } from './draw'
import {
  linesThroughIndex,
  resolveLineClears,
  CADENCE_BASE_VALUE,
  COMBO_BONUS_RATIO,
  MULTI_CLEAR_BONUS_RATIO,
} from './lines'
import type { Goal } from './pool'

/** Internal grid size (D-2026-09-21-20) - distinct from the main board's SUPPORTED_SIZES. */
export const MINI_GRID_SIZE = 3

type MiniGridTile = Extract<AdvancedTile, { kind: 'mini-grid' }>

export type MiniGridResult =
  | { ok: true; advanced: MiniGridTile }
  | { ok: false; reason: 'empty-pool' }

/**
 * GB-FUN-048: populate a fresh mini-grid by drawing only from goals in the parent
 * tile's own category (D-2026-09-21-23, superseding this decision's original
 * whole-pool default for this specific behaviour) - the same cadence-weighted draw
 * the main board's own refills use, filtered to `category` first. Duplicates are
 * allowed when that category has fewer than 9 distinct goals; the mini-grid never
 * falls back to other categories to fill remaining cells. No placement rules apply
 * (GB-FUN-023/024 exist for the main board's jam-avoidance concerns, which a 3x3
 * internal grid does not share) - see the parent issue's own scope note.
 */
export function createMiniGrid(
  pool: Goal[],
  category: string,
  rng: () => number = Math.random,
): MiniGridResult {
  const categoryPool = pool.filter((g) => g.category === category)
  const total = MINI_GRID_SIZE * MINI_GRID_SIZE
  const cells: Cell[] = []
  for (let i = 0; i < total; i++) {
    const drawn = drawWeighted(categoryPool, rng)
    if (!drawn.ok) return { ok: false, reason: 'empty-pool' }
    cells.push({ goal: drawn.goal, marked: false })
  }
  return { ok: true, advanced: { kind: 'mini-grid', cells } }
}

function isLineComplete(cells: Cell[], line: number[]): boolean {
  return line.every((i) => cells[i]!.marked)
}

/** Same formula as a main-board line (GB-FUN-049), minus the adjacency term - a
 *  mini-grid has no board-level neighbours for GB-FUN-031's rule to apply to. */
function lineValue(cells: Cell[], line: number[]): number {
  const base = line.reduce((sum, i) => sum + CADENCE_BASE_VALUE[cells[i]!.goal.cadence], 0)
  const categories = line.map((i) => cells[i]!.goal.category)
  const distinct = new Set(categories).size
  const combo = distinct === 1 || distinct === categories.length ? 1 + COMBO_BONUS_RATIO : 1
  return Math.round(base * combo)
}

export type MiniGridTapResult =
  | {
      ok: true
      cells: Cell[]
      scoreDelta: number
      /** Whether an internal line completed - the parent main-board cell should be
       *  marked through the normal pipeline when this is true (GB-FUN-047). */
      parentShouldMark: boolean
    }
  | { ok: false; reason: 'invalid-cell' | 'empty-pool' }

/**
 * Tap a cell inside the mini-grid's own internal grid. An already-marked internal
 * cell is a no-op, the same shape `markCell` already has for the main board.
 * Completing an internal line refills every cell in it from the pool (GB-FUN-008's
 * never-empty guarantee, mirrored internally) and reports the clear's own score plus
 * whether the parent cell should now be marked.
 */
export function markMiniGridCell(
  cells: Cell[],
  index: number,
  pool: Goal[],
  rng: () => number = Math.random,
): MiniGridTapResult {
  const cell = cells[index]
  if (!cell) return { ok: false, reason: 'invalid-cell' }
  if (cell.marked) {
    return { ok: true, cells, scoreDelta: 0, parentShouldMark: false }
  }
  const marked = cells.slice()
  marked[index] = { ...cell, marked: true }

  const completing = linesThroughIndex(MINI_GRID_SIZE, index).filter((line) =>
    isLineComplete(marked, line),
  )
  if (completing.length === 0) {
    return { ok: true, cells: marked, scoreDelta: 0, parentShouldMark: false }
  }

  const summed = completing.reduce((sum, line) => sum + lineValue(marked, line), 0)
  const multiClearBonus =
    completing.length > 1 ? Math.round(summed * MULTI_CLEAR_BONUS_RATIO) : 0
  const scoreDelta = summed + multiClearBonus

  const occurrences = new Set<number>()
  for (const line of completing) for (const i of line) occurrences.add(i)
  const refilled = marked.slice()
  for (const i of occurrences) {
    const drawn = drawWeighted(pool, rng)
    if (!drawn.ok) return { ok: false, reason: 'empty-pool' }
    refilled[i] = { goal: drawn.goal, marked: false }
  }

  return { ok: true, cells: refilled, scoreDelta, parentShouldMark: true }
}

/** +100% of the mini-grid clear's own value when it is the last cell to clear on the
 *  whole main board (GB-FUN-050, D-2026-09-21-19). */
export const FULL_BOARD_BONUS_RATIO = 1.0

export type MiniGridBoardResult =
  | { ok: true; board: Board; scoreDelta: number }
  | { ok: false; reason: 'invalid-cell' | 'not-mini-grid' | 'empty-pool' }

/**
 * Tap a cell inside the mini-grid tile at `parentIndex` on the main board. Always
 * updates the parent cell's internal grid state. If the tap completes an internal
 * line, the parent cell is marked directly (bypassing `markCell`'s own refusal of a
 * *direct external* tap on a mini-grid cell - that guard exists for a raw tap on the
 * parent index, not for this, the one legitimate path that marks it) and
 * `resolveLineClears` runs from there so any main-board line through the parent
 * index cascades through the normal pipeline (GB-FUN-049). If the parent cell was
 * the only remaining unmarked cell on the main board *before* it was marked, an
 * additional full-board bonus is added on top of every other component
 * (GB-FUN-050).
 */
export function markMiniGridCellOnBoard(
  board: Board,
  parentIndex: number,
  internalIndex: number,
  pool: Goal[],
  rng: () => number = Math.random,
): MiniGridBoardResult {
  const parentCell = board.cells[parentIndex]
  if (!parentCell) return { ok: false, reason: 'invalid-cell' }
  if (parentCell.advanced?.kind !== 'mini-grid') return { ok: false, reason: 'not-mini-grid' }

  const tapped = markMiniGridCell(parentCell.advanced.cells, internalIndex, pool, rng)
  if (!tapped.ok) return { ok: false, reason: tapped.reason }

  const cellsWithUpdatedGrid = board.cells.slice()
  cellsWithUpdatedGrid[parentIndex] = {
    ...parentCell,
    advanced: { kind: 'mini-grid', cells: tapped.cells },
  }
  const boardWithUpdatedGrid: Board = { ...board, cells: cellsWithUpdatedGrid }

  if (!tapped.parentShouldMark) {
    return { ok: true, board: boardWithUpdatedGrid, scoreDelta: tapped.scoreDelta }
  }

  // Checked before marking: the parent cell itself counts as the one still-unmarked
  // cell, so this can only be true on the mark that would leave zero cells unmarked.
  const wasLastUnmarked = boardWithUpdatedGrid.cells.every(
    (c, i) => i === parentIndex || c.marked,
  )

  const markedCells = boardWithUpdatedGrid.cells.slice()
  markedCells[parentIndex] = { ...boardWithUpdatedGrid.cells[parentIndex]!, marked: true }
  const markedBoard: Board = { ...boardWithUpdatedGrid, cells: markedCells }

  const resolved = resolveLineClears(markedBoard, parentIndex, pool, rng)
  if (!resolved.ok) return { ok: false, reason: resolved.reason }

  const fullBoardBonus = wasLastUnmarked ? Math.round(tapped.scoreDelta * FULL_BOARD_BONUS_RATIO) : 0
  const scoreDelta = tapped.scoreDelta + resolved.outcome.scoreDelta + fullBoardBonus

  return { ok: true, board: resolved.outcome.board, scoreDelta }
}
