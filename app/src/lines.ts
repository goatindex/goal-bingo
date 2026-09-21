/** Line detection and clear resolution, single and simultaneous multi-line, plus clear
 *  scoring (GB-FUN-003, 010-015, 028-031, 033, 068). */

import type { Board, BoardSize } from './board'
import { markCell } from './board'
import type { Cadence } from './categories'
import { drawForCell } from './draw'
import type { Goal } from './pool'

/** Base value per tile by cadence, summed across a cleared line (`D-2026-09-21-3`).
 *  Placeholder-grade per that decision — a shape that keeps combos and adjacency
 *  meaningful relative to it, not a tuned magnitude. */
export const CADENCE_BASE_VALUE: Record<Cadence, number> = {
  hourly: 1,
  daily: 2,
  weekly: 3,
  'long-term': 5,
}

/** +50% for a matching (all one category) or variety (all distinct categories) combo
 *  (`D-2026-09-21-4`). The two never both apply to one line: a line longer than 1 cell
 *  cannot be both all-the-same and all-different at once. */
export const COMBO_BONUS_RATIO = 0.5

/** Adjacency bonus configuration (GB-FUN-068) — a data table kept separate from the
 *  function that reads it, so changing a value here needs no other code change.
 *  Currently one seed combination (`D-2026-09-21-5`). */
export const ADJACENCY_CONFIG: { name: string; value: number }[] = [
  { name: 'adjacent-marked', value: 1 },
]

/** 50% of the summed value of the clearing lines, on top of that value
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

/** GB-FUN-028: sum of each tile's cadence value. */
function lineBaseValue(board: Board, line: number[]): number {
  return line.reduce((sum, i) => sum + CADENCE_BASE_VALUE[board.cells[i]!.goal.cadence], 0)
}

/** All 5 cells of the line have distinct categories (GB-FUN-030) - the "rare
 *  combination" achievement reuses this exact check (D-2026-09-21-14) rather than a
 *  second definition of rarity. */
function isVarietyCombo(board: Board, line: number[]): boolean {
  const categories = line.map((i) => board.cells[i]!.goal.category)
  return new Set(categories).size === categories.length
}

function isMatchingCombo(board: Board, line: number[]): boolean {
  const categories = line.map((i) => board.cells[i]!.goal.category)
  return new Set(categories).size === 1
}

/** GB-FUN-029/030: 1 + COMBO_BONUS_RATIO for a matching or variety line, else 1. */
function comboMultiplier(board: Board, line: number[]): number {
  if (isMatchingCombo(board, line) || isVarietyCombo(board, line)) return 1 + COMBO_BONUS_RATIO
  return 1
}

export function adjacentIndices(size: BoardSize, index: number): number[] {
  const row = Math.floor(index / size)
  const col = index % size
  const out: number[] = []
  if (row > 0) out.push(index - size)
  if (row < size - 1) out.push(index + size)
  if (col > 0) out.push(index - 1)
  if (col < size - 1) out.push(index + 1)
  return out
}

/** GB-FUN-031: a cleared cell orthogonally adjacent to a still-marked cell (one that is
 *  not itself part of this clear) scores the "adjacent-marked" value per such neighbour.
 *  Reads the pre-refill board, since the point is what already sat next to the line. */
function adjacencyBonus(board: Board, line: number[], clearing: ReadonlySet<number>): number {
  const value = ADJACENCY_CONFIG.find((c) => c.name === 'adjacent-marked')?.value ?? 0
  let bonus = 0
  for (const i of line) {
    for (const n of adjacentIndices(board.size, i)) {
      if (board.cells[n]!.marked && !clearing.has(n)) bonus += value
    }
  }
  return bonus
}

/** A single line's total value: base × combo multiplier, plus adjacency (additive, per
 *  GB-FUN-031's own "bonus" framing versus GB-FUN-029/030's "multiplier" framing). */
function lineValue(board: Board, line: number[], clearing: ReadonlySet<number>): number {
  return Math.round(lineBaseValue(board, line) * comboMultiplier(board, line)) +
    adjacencyBonus(board, line, clearing)
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
  /** The category of every distinct cell that cleared, one entry per cell, read from
   *  the pre-refill board (GB-FUN-052, D-2026-09-21-12) — a cell shared by 2+
   *  completing lines contributes once, matching how it is refilled once, not once
   *  per line it belongs to. Empty on a no-op. */
  clearedCategories: string[]
  /** Whether any of the completing lines was a variety combo (all 5 cells distinct
   *  categories) — the "rare combination" achievement's trigger condition
   *  (GB-FUN-064, D-2026-09-21-14). False on a no-op. */
  hadVarietyCombo: boolean
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
 * Each line's value is its cadence-summed base (GB-FUN-028) times a matching/variety
 * combo multiplier (GB-FUN-029, GB-FUN-030) plus an adjacency bonus read from the
 * pre-refill board (GB-FUN-031, GB-FUN-068's configuration). `scoreDelta` is the total
 * across every completing line, plus the multi-clear bonus on top when more than one
 * clears — this is the same value GB-FUN-003 awards to reward balance and GB-FUN-033
 * adds to lifetime score; the caller applies it to both counters identically.
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
      outcome: {
        board,
        scoreDelta: 0,
        clearedLineCount: 0,
        intersectionCells: [],
        clearedCategories: [],
        hadVarietyCombo: false,
      },
    }
  }

  const occurrences = new Map<number, number>()
  for (const line of completing) {
    for (const i of line) occurrences.set(i, (occurrences.get(i) ?? 0) + 1)
  }
  const intersectionCells = [...occurrences.entries()]
    .filter(([, count]) => count >= 2)
    .map(([i]) => i)
  // Read against the pre-refill board, same as scoring - each distinct clearing cell
  // contributes its category once (D-2026-09-21-12), not once per line it belongs to.
  const clearedCategories = [...occurrences.keys()].map((i) => board.cells[i]!.goal.category)
  const hadVarietyCombo = completing.some((line) => isVarietyCombo(board, line))

  // Value each line against the pre-refill board - adjacency asks what already sat
  // next to the line, not what replaces it.
  const clearingSet = new Set(occurrences.keys())
  const summedLineValue = completing.reduce(
    (sum, line) => sum + lineValue(board, line, clearingSet),
    0,
  )
  const multiClearBonus =
    completing.length > 1 ? Math.round(summedLineValue * MULTI_CLEAR_BONUS_RATIO) : 0
  const scoreDelta = summedLineValue + multiClearBonus

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

  return {
    ok: true,
    outcome: {
      board: { ...board, cells },
      scoreDelta,
      clearedLineCount: completing.length,
      intersectionCells,
      clearedCategories,
      hadVarietyCombo,
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
