/** Per-category advanced-tile eligibility: two unlock paths (GB-FUN-043, GB-FUN-044). */

/** Lifetime marks per category needed to unlock eligibility (D-2026-09-21-17). */
export const ADVANCED_TILE_MARK_THRESHOLD = 50

/** Board-balance price for the secondary unlock path (D-2026-09-21-17). */
export const ADVANCED_TILE_UNLOCK_COST = 150

export type AdvancedTileAccess = {
  /** Categories with advanced-tile eligibility unlocked. */
  unlockedCategories: string[]
  /** Lifetime marks per category - the progression counter GB-FUN-043 reads. */
  marksByCategory: Record<string, number>
}

export function freshAdvancedTileAccess(): AdvancedTileAccess {
  return { unlockedCategories: [], marksByCategory: {} }
}

export function isAdvancedTileUnlocked(access: AdvancedTileAccess, category: string): boolean {
  return access.unlockedCategories.includes(category)
}

/**
 * Record a mark toward a category's progression threshold (GB-FUN-043). Automatically
 * unlocks eligibility the moment the threshold is reached - no separate purchase
 * needed once marks alone satisfy it. A no-op on an already-unlocked category beyond
 * incrementing its (now unused) counter.
 */
export function recordAdvancedTileProgress(
  access: AdvancedTileAccess,
  category: string,
): AdvancedTileAccess {
  const marks = (access.marksByCategory[category] ?? 0) + 1
  const marksByCategory = { ...access.marksByCategory, [category]: marks }
  const alreadyUnlocked = isAdvancedTileUnlocked(access, category)
  const unlockedCategories =
    !alreadyUnlocked && marks >= ADVANCED_TILE_MARK_THRESHOLD
      ? [...access.unlockedCategories, category]
      : access.unlockedCategories
  return { ...access, marksByCategory, unlockedCategories }
}

export type AdvancedTileUnlockResult =
  | { ok: true; access: AdvancedTileAccess; boardBalance: number }
  | { ok: false; reason: 'already-unlocked' | 'insufficient-balance' }

/**
 * GB-FUN-044: purchase eligibility for a category directly with board balance, as an
 * alternative to reaching the progression threshold. Refuses with no state change if
 * the category is already eligible or balance is insufficient.
 */
export function purchaseAdvancedTileUnlock(
  access: AdvancedTileAccess,
  category: string,
  boardBalance: number,
): AdvancedTileUnlockResult {
  if (isAdvancedTileUnlocked(access, category)) return { ok: false, reason: 'already-unlocked' }
  if (boardBalance < ADVANCED_TILE_UNLOCK_COST) {
    return { ok: false, reason: 'insufficient-balance' }
  }
  return {
    ok: true,
    access: { ...access, unlockedCategories: [...access.unlockedCategories, category] },
    boardBalance: boardBalance - ADVANCED_TILE_UNLOCK_COST,
  }
}
