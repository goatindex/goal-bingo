/** Line detection and single-line clear resolution (GB-FUN-010, GB-FUN-011). */

import type { Board, BoardSize } from './board'
import { markCell } from './board'
import type { Goal } from './pool'
import { drawGoal } from './pool'

/** Placeholder per-line score until Q7 (design-description.md §11) sets real base point
 *  values. The increment mechanism — that a clear raises lifetime score, once per
 *  completing line — is this module's obligation; the magnitude is Q7's. */
export const BASE_SCORE_PER_LINE = 1

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

export type ClearOutcome = {
  board: Board
  scoreDelta: number
  clearedLineCount: number
}

export type ClearResult = { ok: true; outcome: ClearOutcome } | { ok: false; reason: 'empty-pool' }

/**
 * Resolve every completed line through the given cell index — typically the cell just
 * marked. Clears each one: awards BASE_SCORE_PER_LINE per line, empties its cells, and
 * refills them from the pool before returning (GB-FUN-011) — GB-FUN-008 forbids ever
 * returning a board with an empty cell, so refill happens inline, not as a later step.
 *
 * This clears every completing line, not only one, so it already satisfies GB-FUN-012
 * as a side effect of checking all lines through the cell rather than just one — but it
 * does not award the multi-clear bonus (GB-FUN-013), mark the intersection cell
 * (GB-FUN-014), or remove perpendicular progress (GB-FUN-015). Those are a separate
 * issue: they only apply once more than one line clears at once.
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
    return { ok: true, outcome: { board, scoreDelta: 0, clearedLineCount: 0 } }
  }

  const toClear = new Set<number>()
  for (const line of completing) for (const i of line) toClear.add(i)

  const cells = board.cells.slice()
  for (const i of toClear) {
    const drawn = drawGoal(pool, rng)
    if (!drawn.ok) return { ok: false, reason: 'empty-pool' }
    cells[i] = { goal: drawn.goal, marked: false }
  }

  return {
    ok: true,
    outcome: {
      board: { ...board, cells },
      scoreDelta: completing.length * BASE_SCORE_PER_LINE,
      clearedLineCount: completing.length,
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
