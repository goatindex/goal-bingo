/** Recycle power-up: free/paid allowance, rolling window (GB-FUN-039, 041, 042, GB-CON-008). */

import type { Board } from './board'
import { drawForCell } from './draw'
import type { Goal } from './pool'

export type RecycleState = {
  /** Free recycles per 24h window; default 1, raised by the allowance-upgrade power-up. */
  allowanceLevel: number
  /** Free recycles left in the current window. */
  remaining: number
  /** Epoch ms of the first recycle that started the current window; null when no window is active. */
  windowStartedAt: number | null
}

export const RECYCLE_ALLOWANCE_WINDOW_MS = 24 * 60 * 60 * 1000

/** Paid recycle cost once the free allowance is exhausted, ported from sim/jam_sim.py's own default (D-2026-09-21-8). */
export const RECYCLE_COST = 5

/**
 * Free recycles available right now, accounting for the rolling window (GB-FUN-041). A
 * window that has fully elapsed reads as a full restore without needing to be written
 * back first - callers that only read (not consume) can call this directly.
 */
export function effectiveRemaining(state: RecycleState, now: number): number {
  if (state.windowStartedAt === null) return state.allowanceLevel
  if (now - state.windowStartedAt >= RECYCLE_ALLOWANCE_WINDOW_MS) return state.allowanceLevel
  return state.remaining
}

function consumeFreeRecycle(state: RecycleState, now: number): RecycleState {
  const expired =
    state.windowStartedAt !== null && now - state.windowStartedAt >= RECYCLE_ALLOWANCE_WINDOW_MS
  const startingFresh = state.windowStartedAt === null || expired
  const remainingBeforeThis = startingFresh ? state.allowanceLevel : state.remaining
  return {
    ...state,
    windowStartedAt: startingFresh ? now : state.windowStartedAt,
    remaining: remainingBeforeThis - 1,
  }
}

export type RecycleResult =
  | { ok: true; board: Board; recycle: RecycleState; boardBalance: number; paidWithBalance: boolean }
  | { ok: false; reason: 'invalid-cell' | 'marked' | 'empty-pool' | 'insufficient-balance' }

/**
 * Recycle an unmarked tile: draw a replacement goal (obeying the same placement rules
 * as any refill, GB-FUN-039) and pay for it from the free allowance before board
 * balance (GB-FUN-042). Refuses on a marked tile (GB-CON-008) without touching the
 * allowance or balance, and refuses on an empty pool or insufficient balance before
 * committing any state change.
 */
export function recycleCell(
  board: Board,
  pool: Goal[],
  index: number,
  recycleState: RecycleState,
  boardBalance: number,
  rng: () => number = Math.random,
  now: number = Date.now(),
): RecycleResult {
  const cell = board.cells[index]
  if (!cell) return { ok: false, reason: 'invalid-cell' }
  if (cell.marked) return { ok: false, reason: 'marked' }
  const drawn = drawForCell(pool, board, index, rng, new Set([index]))
  if (!drawn.ok) return { ok: false, reason: 'empty-pool' }

  const remaining = effectiveRemaining(recycleState, now)
  let newRecycle: RecycleState
  let newBalance = boardBalance
  let paidWithBalance = false
  if (remaining > 0) {
    newRecycle = consumeFreeRecycle(recycleState, now)
  } else {
    if (boardBalance < RECYCLE_COST) return { ok: false, reason: 'insufficient-balance' }
    newRecycle = recycleState
    newBalance = boardBalance - RECYCLE_COST
    paidWithBalance = true
  }

  const cells = board.cells.slice()
  cells[index] = { goal: drawn.goal, marked: false }
  return {
    ok: true,
    board: { ...board, cells },
    recycle: newRecycle,
    boardBalance: newBalance,
    paidWithBalance,
  }
}
