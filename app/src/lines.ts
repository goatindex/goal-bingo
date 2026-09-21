/** Line detection and clear resolution, single and simultaneous multi-line
 *  (GB-FUN-010 through GB-FUN-015). */

import type { Board, BoardSize } from './board'
import { markCell } from './board'
import { drawForCell } from './draw'
import type { Goal } from './pool'

/** Placeholder per-line score until Q7 (design-description.md §11) sets real base point
 *  values. The increment mechanism — that a clear raises lifetime score, once per
 *  completing line — is this module's obligation; the magnitude is Q7's. */
export const BASE_SCORE_PER_LINE = 1

/** 50% of the summed base score of the clearing lines, on top of that base score
 *  (D-2026-09-20-9). Only applies when more than one line clears on the same mark
 *  (GB-FUN-013's own trigger condition) — a single-line clear earns no bonus. */
export const MULTI_CLEAR_BONUS_RATIO = 0.5

/** Every row, column, and main-diagonal line as an array of flat cell indices
 *  (GB-FUN-010). A square grid has exactly two main diagonals. */
export function allLines(size: BoardSize): number[][] {
  const lines: number[][] = []
  for (let row = 0; row < size; row++) {
    lines.push(Array.from({ length: size }, (_, col) => row * size + col))
  }
  for (let col = 0; col < size; col++) {
    lines.push(Array.from({ length: size }, (_, row) => row * size + col))
  }
  lines.push(Array.from({ length: size }, (_, i) => i * size + i))
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)))
  return lines
}

/** The lines that pass through a cell index: always its row and column, plus the main
 *  diagonal when row === col and the anti-diagonal when row + col === size - 1 — both
 *  only meet at the centre cell of an odd-sized grid, so a cell touches at most 4. */
export function linesThroughIndex(size: BoardSize, index: number): number[][] {
  const row = Math.floor(index / size)
  const col = index % size
  const lines: number[][] = [
    Array.from({ length: size }, (_, c) => row * size + c),
    Array.from({ length: size }, (_, r) => r * size + col),
  ]
  if (row === col) {
    lines.push(Array.from({ length: size }, (_, i) => i * size + i))
  }
  if (row + col === size - 1) {
    lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)))
  }
  return lines
}

function isLineComplete(board: Board, line: number[]): boolean {
  return line.every((i) => board.cells[i]!.marked)
}

/** How many cells of a line are currently marked — the observable form of a line's
 *  "progress" (GB-FUN-015). A completing line's count equals its length; a
 *  perpendicular line that lost a contributing cell to a clear reads one lower. */
export function countMarked(board: Board, line: number[]): number {
  return line.filter((i) => board.cells[i]!.marked).length
}

export type ClearOutcome = {
  board: Board
  scoreDelta: number
  clearedLineCount: number
  /** Cells shared by 2 or more of the completing lines — the anchor for the
   *  intersection's distinct visual treatment (GB-FUN-014). Empty on a single-line
   *  clear or a no-op. */
  intersectionCells: number[]
}

export type ClearResult = { ok: true; outcome: ClearOutcome } | { ok: false; reason: 'empty-pool' }

/**
 * Resolve every completed line through the given cell index — typically the cell just
 * marked. Clears each one: awards score, empties its cells, and refills them from the
 * pool before returning (GB-FUN-011) — GB-FUN-008 forbids ever returning a board with
 * an empty cell, so refill happens inline, not as a later step. Refill goes through
 * `drawForCell` (`draw.ts`), so the binding placement rules (GB-FUN-023, GB-FUN-024)
 * apply to every cell a clear refills, not only a fresh board's initial fill.
 *
 * Checking every line through the cell, not just one, means a simultaneous multi-line
 * completion is already handled correctly (GB-FUN-012): every completing line clears,
 * the multi-clear bonus is added once more than one clears (GB-FUN-013,
 * MULTI_CLEAR_BONUS_RATIO), and any cell shared by 2+ completing lines is reported in
 * `intersectionCells` for the caller to render distinctly (GB-FUN-014). Refilling every
 * cleared cell with a fresh, unmarked tile is also what removes perpendicular progress
 * (GB-FUN-015): a cell that was contributing to a not-yet-complete perpendicular line
 * loses that contribution the moment it is refilled as part of this clear — see
 * `countMarked` for observing a line's remaining progress after this runs.
 */
export function resolveLineClears(
  board: Board,
  markedIndex: number,
  pool: Goal[],
  rng: () => number = Math.random,
): ClearResult {
  const completing = linesThroughIndex(board.size, markedIndex).filter((line) =>
    isLineComplete(board, line),
  )
  if (completing.length === 0) {
    return {
      ok: true,
      outcome: { board, scoreDelta: 0, clearedLineCount: 0, intersectionCells: [] },
    }
  }

  const occurrences = new Map<number, number>()
  for (const line of completing) {
    for (const i of line) occurrences.set(i, (occurrences.get(i) ?? 0) + 1)
  }
  const intersectionCells = [...occurrences.entries()]
    .filter(([, count]) => count >= 2)
    .map(([i]) => i)

  const cells = board.cells.slice()
  const workingBoard: Board = { ...board, cells }
  // Every cleared cell still awaiting its new goal must not count toward the binding
  // rules for the others being drawn in the same batch (its old content is about to be
  // replaced) - see drawForCell's `ignore` parameter.
  const pending = new Set(occurrences.keys())
  for (const i of occurrences.keys()) {
    const drawn = drawForCell(pool, workingBoard, i, rng, pending)
    if (!drawn.ok) return { ok: false, reason: 'empty-pool' }
    cells[i] = { goal: drawn.goal, marked: false }
    pending.delete(i)
  }

  const base = completing.length * BASE_SCORE_PER_LINE
  const bonus = completing.length > 1 ? Math.round(base * MULTI_CLEAR_BONUS_RATIO) : 0

  return {
    ok: true,
    outcome: {
      board: { ...board, cells },
      scoreDelta: base + bonus,
      clearedLineCount: completing.length,
      intersectionCells,
    },
  }
}

export type MarkAndResolveResult =
  | { ok: true; outcome: ClearOutcome }
  | { ok: false; reason: 'invalid-cell' | 'empty-pool' }

/**
 * The player action: tap a cell, then resolve whatever that mark completes. Composes
 * `markCell` (GB-FUN-002, GB-FUN-009) with `resolveLineClears` (GB-FUN-010, GB-FUN-011)
 * so a caller has one entry point for "the player tapped cell N."
 */
export function markCellAndResolve(
  board: Board,
  index: number,
  pool: Goal[],
  rng: () => number = Math.random,
): MarkAndResolveResult {
  const marked = markCell(board, index)
  if (!marked.ok) return marked
  return resolveLineClears(marked.board, index, pool, rng)
}
