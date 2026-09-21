/** Board state: grid sizing, cells, marking, permanent expansion
 *  (GB-FUN-001, 002, 005, 006, 007, 008, 009). */

import { drawForCell } from './draw'
import type { Goal } from './pool'

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
  if (pool.length === 0) return { ok: false, reason: 'empty-pool' }
  const total = size * size
  // Placeholder cells so `board` is a full-length view drawForCell can scan; every
  // index but the one currently being decided starts "ignored" (see drawForCell) so
  // the placeholder's own content is never actually consulted.
  const cells: Cell[] = new Array(total).fill({ goal: pool[0]!, marked: false })
  const board: Board = { size, cells }
  const ignore = new Set<number>()
  for (let i = 1; i < total; i++) ignore.add(i)
  for (let i = 0; i < total; i++) {
    const drawn = drawForCell(pool, board, i, rng, ignore)
    if (!drawn.ok) return { ok: false, reason: 'empty-pool' }
    cells[i] = { goal: drawn.goal, marked: false }
    ignore.delete(i)
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
  if (pool.length === 0) return { ok: false, reason: 'empty-pool' }
  const total = newSize * newSize
  const cells: Cell[] = new Array(total).fill({ goal: pool[0]!, marked: false })
  const newBoard: Board = { size: newSize, cells }
  const toDraw: number[] = []
  for (let row = 0; row < newSize; row++) {
    for (let col = 0; col < newSize; col++) {
      const newIdx = row * newSize + col
      if (row < board.size && col < board.size) {
        cells[newIdx] = board.cells[row * board.size + col]!
      } else {
        toDraw.push(newIdx)
      }
    }
  }
  // Copied cells are real and count immediately; only the newly-exposed cells need
  // "ignoring" (see drawForCell) until each gets its own fresh draw.
  const ignore = new Set(toDraw)
  for (const idx of toDraw) {
    const drawn = drawForCell(pool, newBoard, idx, rng, ignore)
    if (!drawn.ok) return { ok: false, reason: 'empty-pool' }
    cells[idx] = { goal: drawn.goal, marked: false }
    ignore.delete(idx)
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

export type MarkResult = { ok: true; board: Board } | { ok: false; reason: 'invalid-cell' }

/**
 * Mark a cell by its flat index (GB-FUN-002, GB-FUN-009). Pure and synchronous: no
 * network call, no permission check, nothing beyond the index identifying which cell
 * was tapped. Marking an already-marked cell is a no-op — the same board reference is
 * returned rather than a new object, so callers can skip a re-render on no-op taps.
 */
export function markCell(board: Board, index: number): MarkResult {
  const cell = board.cells[index]
  if (!cell) return { ok: false, reason: 'invalid-cell' }
  if (cell.marked) return { ok: true, board }
  const cells = board.cells.slice()
  cells[index] = { ...cell, marked: true }
  return { ok: true, board: { ...board, cells } }
}
