/** Turns an already-legally-drawn plain cell into an advanced tile, automatically on
 *  unlock and passively on later refills (D-2026-09-21-23, GB-FUN-043, GB-FUN-045,
 *  GB-FUN-047). Never touches which goal `drawForCell` chose - only what happens to a
 *  cell after that choice is already legal. */

import { ADVANCED_TILE_TRACKS, isAdvancedTileUnlocked } from './advancedUnlock'
import type { AdvancedTileAccess, AdvancedTileTrack } from './advancedUnlock'
import type { AdvancedTile, Board } from './board'
import { createMiniGrid } from './miniGrid'
import { createMultiCompletionTile } from './multiCompletion'
import type { Goal } from './pool'

/** Chance an ordinary refill draw in an eligible category becomes an advanced tile
 *  instead of a plain goal (D-2026-09-21-23) - roughly triple the long-term cadence
 *  share (`LONG_TERM_DRAW_SHARE`, 5%), since this is meant to be noticeable but still
 *  occasional, not the common case. Provisional pending a playtest. */
export const ADVANCED_TILE_PASSIVE_CHANCE = 0.15

/** Board-balance price for the on-demand paid placement action, matching the existing
 *  secondary eligibility-unlock price (D-2026-09-21-23, D-2026-09-21-17). */
export const ADVANCED_TILE_PLACEMENT_COST = 150

function createTile(
  track: AdvancedTileTrack,
  category: string,
  pool: Goal[],
  rng: () => number,
): AdvancedTile | null {
  if (track === 'multi-completion') return createMultiCompletionTile()
  const result = createMiniGrid(pool, category, rng)
  return result.ok ? result.advanced : null
}

/**
 * Given cells that were just legally refilled with a plain goal, convert any whose
 * category has a pending guaranteed placement, or otherwise rolls the passive chance,
 * into an advanced tile - keeping the cell's already-drawn goal, only adding
 * `advanced`. At most one pending placement is consumed per matching cell; if both
 * tracks would otherwise roll true on the same cell, multi-completion wins (an
 * arbitrary but deterministic tie-break - simultaneous 15% rolls on one cell are rare
 * enough not to warrant a real policy).
 */
export function applyPassivePlacement(
  board: Board,
  refilledIndices: readonly number[],
  access: AdvancedTileAccess,
  pool: Goal[],
  rng: () => number = Math.random,
): { board: Board; access: AdvancedTileAccess } {
  const cells = board.cells.slice()
  let pending = access.pendingPlacements

  for (const index of refilledIndices) {
    const cell = cells[index]
    if (!cell) continue
    const category = cell.goal.category

    const pendingIndex = pending.findIndex((p) => p.category === category)
    if (pendingIndex !== -1) {
      const advanced = createTile(pending[pendingIndex]!.track, category, pool, rng)
      if (advanced) {
        cells[index] = { ...cell, advanced }
        pending = pending.filter((_, i) => i !== pendingIndex)
        continue
      }
    }

    for (const track of ADVANCED_TILE_TRACKS) {
      if (!isAdvancedTileUnlocked(access, track, category)) continue
      if (rng() < ADVANCED_TILE_PASSIVE_CHANCE) {
        const advanced = createTile(track, category, pool, rng)
        if (advanced) {
          cells[index] = { ...cell, advanced }
          break
        }
      }
    }
  }

  return { board: { ...board, cells }, access: { ...access, pendingPlacements: pending } }
}

/**
 * Called the moment a track newly unlocks for a category (D-2026-09-21-23's
 * "automatic on unlock"). Converts an existing unmarked, not-already-advanced cell of
 * that category if one exists on the board; otherwise queues a guaranteed placement
 * consumed by that category's next refill (`applyPassivePlacement`, above).
 */
export function placeOnUnlock(
  board: Board,
  track: AdvancedTileTrack,
  category: string,
  access: AdvancedTileAccess,
  pool: Goal[],
  rng: () => number = Math.random,
): { board: Board; access: AdvancedTileAccess } {
  const index = board.cells.findIndex(
    (c) => !c.marked && !c.advanced && c.goal.category === category,
  )
  if (index === -1) {
    return {
      board,
      access: { ...access, pendingPlacements: [...access.pendingPlacements, { track, category }] },
    }
  }
  const advanced = createTile(track, category, pool, rng)
  if (!advanced) return { board, access }
  const cells = board.cells.slice()
  cells[index] = { ...cells[index]!, advanced }
  return { board: { ...board, cells }, access }
}

export type PlaceAdvancedTileResult =
  | { ok: true; board: Board; boardBalance: number }
  | { ok: false; reason: 'invalid-cell' | 'marked' | 'already-advanced' | 'not-unlocked' | 'insufficient-balance' | 'empty-pool' }

/**
 * D-2026-09-21-23's paid placement action, mirroring `recycleCell`'s shape: pick any
 * unmarked cell showing a goal from a category where `track` is unlocked, pay
 * `ADVANCED_TILE_PLACEMENT_COST`, and it becomes that tile type immediately - giving
 * the player agency over board position, alongside the automatic/passive mechanism
 * above rather than instead of it. Refuses with no state change on every failure path
 * before committing anything.
 */
export function placeAdvancedTile(
  board: Board,
  index: number,
  track: AdvancedTileTrack,
  access: AdvancedTileAccess,
  boardBalance: number,
  pool: Goal[],
  rng: () => number = Math.random,
): PlaceAdvancedTileResult {
  const cell = board.cells[index]
  if (!cell) return { ok: false, reason: 'invalid-cell' }
  if (cell.marked) return { ok: false, reason: 'marked' }
  if (cell.advanced) return { ok: false, reason: 'already-advanced' }
  if (!isAdvancedTileUnlocked(access, track, cell.goal.category)) {
    return { ok: false, reason: 'not-unlocked' }
  }
  if (boardBalance < ADVANCED_TILE_PLACEMENT_COST) {
    return { ok: false, reason: 'insufficient-balance' }
  }
  const advanced = createTile(track, cell.goal.category, pool, rng)
  if (!advanced) return { ok: false, reason: 'empty-pool' }
  const cells = board.cells.slice()
  cells[index] = { ...cell, advanced }
  return {
    ok: true,
    board: { ...board, cells },
    boardBalance: boardBalance - ADVANCED_TILE_PLACEMENT_COST,
  }
}
