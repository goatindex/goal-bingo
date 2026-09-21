/** Swap power-up: exchange two adjacent tiles for consolidation (GB-FUN-038). */

import type { Board } from './board'
import { adjacentIndices } from './lines'

/** Swap price, a judgement call confirmed with the user (D-2026-09-21-10). */
export const SWAP_COST = 10

export type SwapResult =
  | { ok: true; board: Board; boardBalance: number }
  | { ok: false; reason: 'invalid-cell' | 'not-adjacent' | 'insufficient-balance' }

/**
 * Exchange the full contents (goal and marked state together) of two orthogonally
 * adjacent cells for a flat board-balance cost. A mark travels with the tile it
 * belongs to, not the position it leaves.
 */
export function swapCells(
  board: Board,
  indexA: number,
  indexB: number,
  boardBalance: number,
): SwapResult {
  const cellA = board.cells[indexA]
  const cellB = board.cells[indexB]
  if (!cellA || !cellB) return { ok: false, reason: 'invalid-cell' }
  if (!adjacentIndices(board.size, indexA).includes(indexB)) {
    return { ok: false, reason: 'not-adjacent' }
  }
  if (boardBalance < SWAP_COST) return { ok: false, reason: 'insufficient-balance' }

  const cells = board.cells.slice()
  cells[indexA] = cellB
  cells[indexB] = cellA
  return { ok: true, board: { ...board, cells }, boardBalance: boardBalance - SWAP_COST }
}
