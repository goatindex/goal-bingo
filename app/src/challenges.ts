/** Challenges: always-active board-balance income sources (GB-FUN-055, 057, 058, 059). */

import type { Cadence } from './categories'
import { CADENCES } from './categories'

export type ChallengeKind = 'universal' | 'category' | 'cadence'

export type Challenge = {
  id: string
  kind: ChallengeKind
  /** Category name for kind 'category', Cadence for kind 'cadence'; absent for 'universal'. */
  qualifier?: string
  progress: number
  target: number
}

/** Completion target, reused as the reset value (D-2026-09-21-7). */
export const CHALLENGE_TARGET = 10

export function universalChallengeId(): string {
  return 'universal'
}

export function categoryChallengeId(category: string): string {
  return `category-${category}`
}

export function cadenceChallengeId(cadence: Cadence): string {
  return `cadence-${cadence}`
}

function makeChallenge(id: string, kind: ChallengeKind, qualifier?: string): Challenge {
  return { id, kind, qualifier, progress: 0, target: CHALLENGE_TARGET }
}

/**
 * The full set of always-active challenges for the given unlocked categories: one
 * universal, one per cadence tier, and one per unlocked category (GB-FUN-055, 057, 059).
 */
export function initialChallenges(unlockedCategories: readonly string[]): Challenge[] {
  const universal = makeChallenge(universalChallengeId(), 'universal')
  const cadenceChallenges = CADENCES.map((cadence) =>
    makeChallenge(cadenceChallengeId(cadence), 'cadence', cadence),
  )
  const categoryChallenges = unlockedCategories.map((category) =>
    makeChallenge(categoryChallengeId(category), 'category', category),
  )
  return [universal, ...cadenceChallenges, ...categoryChallenges]
}

/**
 * Add a challenge for a newly-unlocked category, unless one already exists
 * (GB-FUN-058 — unlocking a category immediately creates its challenge).
 */
export function addCategoryChallenge(
  challenges: readonly Challenge[],
  category: string,
): Challenge[] {
  const id = categoryChallengeId(category)
  if (challenges.some((c) => c.id === id)) return [...challenges]
  return [...challenges, makeChallenge(id, 'category', category)]
}

/** Flat board-balance payment per qualifying mark, regardless of challenge count (D-2026-09-21-6). */
export const BOARD_BALANCE_PER_MARK = 1

/** Board balance a genuine mark pays: the per-mark amount, plus one completion bonus
 *  for each challenge that reached its target on this mark (GB-FUN-004, 061, 062). */
export function markBoardIncome(completedCount: number): number {
  return BOARD_BALANCE_PER_MARK + completedCount * CHALLENGE_TARGET
}

export type ProgressResult = {
  challenges: Challenge[]
  /** Number of challenges that reached target on this mark (each pays its own completion bonus). */
  completedCount: number
}

/**
 * Increment every active challenge the marked goal qualifies for — universal always,
 * plus the matching category and cadence challenges (GB-FUN-056, 060). A challenge that
 * reaches its target resets to 0 and continues, rather than carrying progress past it
 * (GB-FUN-062, D-2026-09-21-7).
 */
export function progressChallenges(
  challenges: readonly Challenge[],
  goal: { category: string; cadence: Cadence },
): ProgressResult {
  let completedCount = 0
  const updated = challenges.map((c) => {
    const qualifies =
      c.kind === 'universal' ||
      (c.kind === 'category' && c.qualifier === goal.category) ||
      (c.kind === 'cadence' && c.qualifier === goal.cadence)
    if (!qualifies) return c
    const progress = c.progress + 1
    if (progress >= c.target) {
      completedCount += 1
      return { ...c, progress: 0 }
    }
    return { ...c, progress }
  })
  return { challenges: updated, completedCount }
}
