/** Per-category advanced-tile eligibility: two independent tracks, each with two
 *  unlock paths (GB-FUN-043, GB-FUN-044, D-2026-09-21-23). */

/** Lifetime marks per category needed to unlock either track (D-2026-09-21-17). */
export const ADVANCED_TILE_MARK_THRESHOLD = 50

/** Board-balance price for either track's secondary unlock path (D-2026-09-21-17). */
export const ADVANCED_TILE_UNLOCK_COST = 150

/** Multi-completion and mini-grid are different things to unlock, not interchangeable
 *  flavors of one flag (D-2026-09-21-23) - each category tracks both independently. */
export type AdvancedTileTrack = 'multi-completion' | 'mini-grid'

export const ADVANCED_TILE_TRACKS: readonly AdvancedTileTrack[] = ['multi-completion', 'mini-grid']

export type AdvancedTileAccess = {
  /** Categories with each track's eligibility unlocked. */
  unlockedCategories: Record<AdvancedTileTrack, string[]>
  /** Lifetime marks per category - the single counter both tracks read (D-2026-09-21-23:
   *  reusing one counter rather than tracking two, since both tracks share the same
   *  threshold). */
  marksByCategory: Record<string, number>
}

export function freshAdvancedTileAccess(): AdvancedTileAccess {
  return {
    unlockedCategories: { 'multi-completion': [], 'mini-grid': [] },
    marksByCategory: {},
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

export type AdvancedTileUnlockResult =
  | { ok: true; access: AdvancedTileAccess; boardBalance: number }
  | { ok: false; reason: 'already-unlocked' | 'insufficient-balance' }

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
