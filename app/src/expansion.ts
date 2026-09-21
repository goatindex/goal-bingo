/** Grid expansion power-up: the main long-arc progression (GB-FUN-036). */

import type { Board } from './board'
import { SUPPORTED_SIZES, resizeBoard } from './board'
import type { Goal } from './pool'

/** 5x5-to-7x7 price, the only expansion step SUPPORTED_SIZES has today (D-2026-09-21-9). */
export const GRID_EXPANSION_COST = 250

function nextSupportedSize(size: number): number | null {
  const sizes = SUPPORTED_SIZES as readonly number[]
  const i = sizes.indexOf(size)
  if (i === -1 || i === sizes.length - 1) return null
  return sizes[i + 1]!
}

export type ExpansionResult =
  | { ok: true; board: Board; boardBalance: number }
  | { ok: false; reason: 'insufficient-balance' | 'max-size' | 'empty-pool' }

/**
 * Permanently grow the board to the next supported size, deducting board balance.
 * Refuses with no state change if the board is already at the largest supported size
 * or board balance is insufficient.
 */
export function purchaseGridExpansion(
  board: Board,
  pool: Goal[],
  boardBalance: number,
  rng: () => number = Math.random,
): ExpansionResult {
  const next = nextSupportedSize(board.size)
  if (next === null) return { ok: false, reason: 'max-size' }
  if (boardBalance < GRID_EXPANSION_COST) return { ok: false, reason: 'insufficient-balance' }
  const resized = resizeBoard(board, next, pool, rng)
  // 'unsupported-size' cannot happen: nextSupportedSize only ever returns a member of
  // SUPPORTED_SIZES, which resizeBoard accepts by construction.
  if (!resized.ok) return { ok: false, reason: 'empty-pool' }
  return { ok: true, board: resized.board, boardBalance: boardBalance - GRID_EXPANSION_COST }
}
