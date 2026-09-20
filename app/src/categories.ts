/** Categories and cadences (GB-FUN-018..021). */

export const DEFAULT_CATEGORIES = [
  'health',
  'study',
  'creative',
  'volunteering',
  'relationship',
  'home',
  'work',
] as const

export type DefaultCategory = (typeof DEFAULT_CATEGORIES)[number]

export const CADENCES = ['hourly', 'daily', 'weekly', 'long-term'] as const
export type Cadence = (typeof CADENCES)[number]

/** Provisional unlock gate (D-2026-09-20-7). */
export const CUSTOM_CATEGORY_SCORE_GATE = 10

export function canUnlockCustomCategory(lifetimeScore: number): boolean {
  return lifetimeScore >= CUSTOM_CATEGORY_SCORE_GATE
}

export function customCategoryCount(unlockedCategories: readonly string[]): number {
  const defaults = new Set<string>(DEFAULT_CATEGORIES)
  return unlockedCategories.filter((c) => !defaults.has(c)).length
}

/**
 * Unlock one custom category slot when the provisional gate is met (D-2026-09-20-7).
 */
export function tryUnlockCustomCategory(
  unlockedCategories: readonly string[],
  lifetimeScore: number,
  name: string,
): { ok: true; categories: string[] } | { ok: false; error: string } {
  if (!canUnlockCustomCategory(lifetimeScore)) {
    return {
      ok: false,
      error: `Custom categories unlock at lifetime score ${CUSTOM_CATEGORY_SCORE_GATE}.`,
    }
  }
  if (customCategoryCount(unlockedCategories) >= 1) {
    return { ok: false, error: 'Custom category slot already used.' }
  }
  const trimmed = name.trim().toLowerCase()
  if (!trimmed) return { ok: false, error: 'Name is required.' }
  if (unlockedCategories.includes(trimmed)) {
    return { ok: false, error: 'Category already exists.' }
  }
  return { ok: true, categories: [...unlockedCategories, trimmed] }
}

export function isCadence(value: string): value is Cadence {
  return (CADENCES as readonly string[]).includes(value)
}

export function isAllowedCategory(
  category: string,
  unlockedCategories: readonly string[],
): boolean {
  return unlockedCategories.includes(category) && category.trim().length > 0
}
