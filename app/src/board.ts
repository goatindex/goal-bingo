/** Board state: grid sizing, cells, permanent expansion (GB-FUN-001, 005, 006, 007, 008). */

import type { Goal } from './pool'
import { drawGoal } from './pool'

/** 5x5 start, verified through 7x7 (D-2026-09-20-8). Larger sizes need a
 *  sim/jam_sim.py run first (GB-CON-014) before they are added here. */
export const SUPPORTED_SIZES = [5, 7] as const
export type BoardSize = (typeof SUPPORTED_SIZES)[number]

export function isSupportedSize(size: number): size is BoardSize {
  return (SUPPORTED_SIZES as readonly number[]).includes(size)
}

export type Cell = { goal: Goal; marked: boolean }

export type Board = {
  size: BoardSize
  /** Row-major flat array, length size*size. cells[row * size + col]. */
  cells: Cell[]
}

export function cellIndex(board: Board, row: number, col: number): number {
  return row * board.size + col
}

export type BoardResult =
  | { ok: true; board: Board }
  | { ok: false; reason: 'empty-pool' | 'unsupported-size' }

/**
 * Fill every cell of a size x size board by drawing from the pool (GB-FUN-007, 008).
 * Refuses if the pool cannot supply a goal for a cell — the caller must surface the
 * empty-pool prompt (GB-FUN-008 forbids ever presenting an unfilled cell as playable).
 */
export function createBoard(size: BoardSize, pool: Goal[], rng: () => number = Math.random): BoardResult {
  const cells: Cell[] = []
  for (let i = 0; i < size * size; i++) {
    const drawn = drawGoal(pool, rng)
    if (!drawn.ok) return { ok: false, reason: 'empty-pool' }
    cells.push({ goal: drawn.goal, marked: false })
  }
  return { ok: true, board: { size, cells } }
}

/**
 * Resize the board permanently (GB-FUN-006). Existing cells (with their marks) are
 * kept at their row/column position in the top-left of the new grid; every newly
 * exposed cell — new rows and new columns, on growth — is freshly drawn. A shrink
 * (not currently reachable: no supported size is below the start size) keeps the
 * same top-left sub-square and drops the rest.
 */
export function resizeBoard(
  board: Board,
  newSize: number,
  pool: Goal[],
  rng: () => number = Math.random,
): BoardResult {
  if (!isSupportedSize(newSize)) return { ok: false, reason: 'unsupported-size' }
  if (newSize === board.size) return { ok: true, board }
  const cells: Cell[] = new Array(newSize * newSize)
  for (let row = 0; row < newSize; row++) {
    for (let col = 0; col < newSize; col++) {
      const newIdx = row * newSize + col
      if (row < board.size && col < board.size) {
        cells[newIdx] = board.cells[row * board.size + col]!
      } else {
        const drawn = drawGoal(pool, rng)
        if (!drawn.ok) return { ok: false, reason: 'empty-pool' }
        cells[newIdx] = { goal: drawn.goal, marked: false }
      }
    }
  }
  return { ok: true, board: { size: newSize, cells } }
}

/** GB-FUN-007: every cell holds exactly one tile at all times during active play. */
export function everyCellHasOneTile(board: Board): boolean {
  return (
    board.cells.length === board.size * board.size &&
    board.cells.every((c) => c != null && c.goal != null)
  )
}
