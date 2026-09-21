/** Mini-grid tiles: a self-contained internal board nested in one main-board cell
 *  (GB-FUN-047, GB-FUN-048). */

import type { AdvancedTile, Cell } from './board'
import { drawWeighted } from './draw'
import {
  linesThroughIndex,
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
 * GB-FUN-048: populate a fresh mini-grid by drawing from the main pool, the same
 * cadence-weighted draw the main board's own refills use. No placement rules apply
 * (GB-FUN-023/024 exist for the main board's jam-avoidance concerns, which a 3x3
 * internal grid does not share) - see the parent issue's own scope note.
 */
export function createMiniGrid(pool: Goal[], rng: () => number = Math.random): MiniGridResult {
  const total = MINI_GRID_SIZE * MINI_GRID_SIZE
  const cells: Cell[] = []
  for (let i = 0; i < total; i++) {
    const drawn = drawWeighted(pool, rng)
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
