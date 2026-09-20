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

export function isCadence(value: string): value is Cadence {
  return (CADENCES as readonly string[]).includes(value)
}

export function isAllowedCategory(
  category: string,
  unlockedCategories: readonly string[],
): boolean {
  return unlockedCategories.includes(category) && category.trim().length > 0
}
