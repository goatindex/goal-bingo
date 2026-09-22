/** Per-category advanced-tile eligibility: two independent tracks, each with two
 *  unlock paths (GB-FUN-043, GB-FUN-044, D-2026-09-21-23), plus a per-track global
 *  layer on top (D-2026-09-21-22, D-2026-09-22-1). */

/** Lifetime marks per category needed to unlock either track (D-2026-09-21-17). */
export const ADVANCED_TILE_MARK_THRESHOLD = 50

/** Board-balance price for either track's secondary unlock path (D-2026-09-21-17). */
export const ADVANCED_TILE_UNLOCK_COST = 150

/** Bulk / total-marks global path prices at this fraction of buying every still-locked
 *  category for that track individually (D-2026-09-21-22). */
export const GLOBAL_UNLOCK_DISCOUNT = 0.7

/** Multi-completion and mini-grid are different things to unlock, not interchangeable
 *  flavors of one flag (D-2026-09-21-23) - each category tracks both independently. */
export type AdvancedTileTrack = 'multi-completion' | 'mini-grid'

export const ADVANCED_TILE_TRACKS: readonly AdvancedTileTrack[] = ['multi-completion', 'mini-grid']

export type PendingAdvancedTilePlacement = { track: AdvancedTileTrack; category: string }

export type AdvancedTileAccess = {
  /** Categories with each track's eligibility unlocked. */
  unlockedCategories: Record<AdvancedTileTrack, string[]>
  /** Lifetime marks per category - the single counter both tracks read (D-2026-09-21-23:
   *  reusing one counter rather than tracking two, since both tracks share the same
   *  threshold). Also the source for the global progression path's total. */
  marksByCategory: Record<string, number>
  /** A track that unlocked with no unmarked cell of its category on the board to
   *  convert immediately - consumed by that category's next refill, guaranteeing the
   *  placement rather than leaving it to the passive chance alone (D-2026-09-21-23). */
  pendingPlacements: PendingAdvancedTilePlacement[]
}

export function freshAdvancedTileAccess(): AdvancedTileAccess {
  return {
    unlockedCategories: { 'multi-completion': [], 'mini-grid': [] },
    marksByCategory: {},
    pendingPlacements: [],
  }
}

export function isAdvancedTileUnlocked(
  access: AdvancedTileAccess,
  track: AdvancedTileTrack,
  category: string,
): boolean {
  return access.unlockedCategories[track].includes(category)
}

/**
 * Record a mark toward a category's progression threshold (GB-FUN-043). Both tracks
 * read the same counter and share the same threshold, so reaching it unlocks whichever
 * track(s) are not already unlocked (independently - a track already unlocked via
 * purchase is left alone, not duplicated). A no-op on a category with both tracks
 * already unlocked beyond incrementing its (now unused) counter.
 */
export function recordAdvancedTileProgress(
  access: AdvancedTileAccess,
  category: string,
): AdvancedTileAccess {
  const marks = (access.marksByCategory[category] ?? 0) + 1
  const marksByCategory = { ...access.marksByCategory, [category]: marks }
  let unlockedCategories = access.unlockedCategories
  if (marks >= ADVANCED_TILE_MARK_THRESHOLD) {
    for (const track of ADVANCED_TILE_TRACKS) {
      if (!unlockedCategories[track].includes(category)) {
        unlockedCategories = {
          ...unlockedCategories,
          [track]: [...unlockedCategories[track], category],
        }
      }
    }
  }
  return { ...access, marksByCategory, unlockedCategories }
}

/** Tracks unlocked in `after` but not `before`, for one category - what a caller
 *  checks right after `recordAdvancedTileProgress`/`purchaseAdvancedTileUnlock` to
 *  decide whether to place a tile immediately (D-2026-09-21-23's "automatic on
 *  unlock"). */
export function newlyUnlockedTracks(
  before: AdvancedTileAccess,
  after: AdvancedTileAccess,
  category: string,
): AdvancedTileTrack[] {
  return ADVANCED_TILE_TRACKS.filter(
    (track) => !isAdvancedTileUnlocked(before, track, category) && isAdvancedTileUnlocked(after, track, category),
  )
}

/** Categories newly unlocked for one track between two access snapshots - used after
 *  a global unlock so each newly-eligible category gets its automatic placement. */
export function newlyUnlockedCategories(
  before: AdvancedTileAccess,
  after: AdvancedTileAccess,
  track: AdvancedTileTrack,
): string[] {
  return after.unlockedCategories[track].filter(
    (category) => !isAdvancedTileUnlocked(before, track, category),
  )
}

export type AdvancedTileUnlockResult =
  | { ok: true; access: AdvancedTileAccess; boardBalance: number }
  | { ok: false; reason: 'already-unlocked' | 'insufficient-balance' | 'nothing-to-unlock' }

/**
 * GB-FUN-044: purchase eligibility for one track of a category directly with board
 * balance, as an alternative to reaching the progression threshold. Refuses with no
 * state change if that track is already eligible for the category or balance is
 * insufficient - the other track for the same category is untouched either way.
 */
export function purchaseAdvancedTileUnlock(
  access: AdvancedTileAccess,
  track: AdvancedTileTrack,
  category: string,
  boardBalance: number,
): AdvancedTileUnlockResult {
  if (isAdvancedTileUnlocked(access, track, category)) return { ok: false, reason: 'already-unlocked' }
  if (boardBalance < ADVANCED_TILE_UNLOCK_COST) {
    return { ok: false, reason: 'insufficient-balance' }
  }
  return {
    ok: true,
    access: {
      ...access,
      unlockedCategories: {
        ...access.unlockedCategories,
        [track]: [...access.unlockedCategories[track], category],
      },
    },
    boardBalance: boardBalance - ADVANCED_TILE_UNLOCK_COST,
  }
}

/** Player categories that do not yet have this track unlocked (D-2026-09-21-22 /
 *  D-2026-09-22-1). The global path's remaining count - shrinks as categories unlock
 *  for the track, grows when a new custom category is added. */
export function remainingCategoriesForTrack(
  access: AdvancedTileAccess,
  track: AdvancedTileTrack,
  playerCategories: readonly string[],
): string[] {
  return playerCategories.filter((category) => !isAdvancedTileUnlocked(access, track, category))
}

export function totalLifetimeMarks(access: AdvancedTileAccess): number {
  return Object.values(access.marksByCategory).reduce((sum, n) => sum + n, 0)
}

/** Progression threshold for a track's global unlock given how many of that track's
 *  categories are still locked (D-2026-09-21-22). */
export function globalUnlockMarkThreshold(remainingCount: number): number {
  return Math.ceil(GLOBAL_UNLOCK_DISCOUNT * remainingCount * ADVANCED_TILE_MARK_THRESHOLD)
}

/** Board-balance price for a track's global bulk purchase (D-2026-09-21-22). */
export function globalUnlockCost(remainingCount: number): number {
  return Math.ceil(GLOBAL_UNLOCK_DISCOUNT * remainingCount * ADVANCED_TILE_UNLOCK_COST)
}

function unlockRemainingForTrack(
  access: AdvancedTileAccess,
  track: AdvancedTileTrack,
  remaining: readonly string[],
): AdvancedTileAccess {
  if (remaining.length === 0) return access
  return {
    ...access,
    unlockedCategories: {
      ...access.unlockedCategories,
      [track]: [...access.unlockedCategories[track], ...remaining],
    },
  }
}

/**
 * Per-track global progression (D-2026-09-21-22, D-2026-09-22-1): when total lifetime
 * marks across every category reach the discounted threshold for a track's still-
 * locked set, unlock that track for every remaining category. Each track is checked
 * independently - unlocking multi-completion globally never touches mini-grid.
 */
export function applyGlobalAdvancedTileProgress(
  access: AdvancedTileAccess,
  playerCategories: readonly string[],
): AdvancedTileAccess {
  const total = totalLifetimeMarks(access)
  let next = access
  for (const track of ADVANCED_TILE_TRACKS) {
    const remaining = remainingCategoriesForTrack(next, track, playerCategories)
    if (remaining.length === 0) continue
    if (total >= globalUnlockMarkThreshold(remaining.length)) {
      next = unlockRemainingForTrack(next, track, remaining)
    }
  }
  return next
}

/**
 * Per-track global economy path (D-2026-09-21-22, D-2026-09-22-1): one purchase unlocks
 * this track for every still-locked player category, at a 30% discount against buying
 * them individually. The other track is untouched. Refuses with no state change when
 * nothing remains for this track or balance is insufficient.
 */
export function purchaseGlobalAdvancedTileUnlock(
  access: AdvancedTileAccess,
  track: AdvancedTileTrack,
  playerCategories: readonly string[],
  boardBalance: number,
): AdvancedTileUnlockResult {
  const remaining = remainingCategoriesForTrack(access, track, playerCategories)
  if (remaining.length === 0) return { ok: false, reason: 'nothing-to-unlock' }
  const cost = globalUnlockCost(remaining.length)
  if (boardBalance < cost) return { ok: false, reason: 'insufficient-balance' }
  return {
    ok: true,
    access: unlockRemainingForTrack(access, track, remaining),
    boardBalance: boardBalance - cost,
  }
}
