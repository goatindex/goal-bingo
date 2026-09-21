import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES, CADENCES } from './categories'
import {
  CHALLENGE_TARGET,
  addCategoryChallenge,
  cadenceChallengeId,
  categoryChallengeId,
  initialChallenges,
  progressChallenges,
  universalChallengeId,
} from './challenges'

describe('initialChallenges', () => {
  it('includes exactly one universal challenge', () => {
    const challenges = initialChallenges(DEFAULT_CATEGORIES)
    const universal = challenges.filter((c) => c.kind === 'universal')
    expect(universal).toHaveLength(1)
    expect(universal[0]!.id).toBe(universalChallengeId())
  })

  it('includes one cadence challenge per cadence tier', () => {
    const challenges = initialChallenges(DEFAULT_CATEGORIES)
    for (const cadence of CADENCES) {
      const matches = challenges.filter((c) => c.id === cadenceChallengeId(cadence))
      expect(matches).toHaveLength(1)
      expect(matches[0]!.kind).toBe('cadence')
    }
  })

  it('includes exactly one category challenge per unlocked category', () => {
    const challenges = initialChallenges(DEFAULT_CATEGORIES)
    for (const category of DEFAULT_CATEGORIES) {
      const matches = challenges.filter((c) => c.id === categoryChallengeId(category))
      expect(matches).toHaveLength(1)
      expect(matches[0]!.kind).toBe('category')
    }
    const categoryChallenges = challenges.filter((c) => c.kind === 'category')
    expect(categoryChallenges).toHaveLength(DEFAULT_CATEGORIES.length)
  })
})

describe('progressChallenges', () => {
  it('increments the universal, matching category, and matching cadence challenges from one mark', () => {
    const before = initialChallenges(DEFAULT_CATEGORIES)
    const { challenges: after } = progressChallenges(before, {
      category: 'health',
      cadence: 'daily',
    })
    const byId = (id: string) => after.find((c) => c.id === id)!
    expect(byId(universalChallengeId()).progress).toBe(1)
    expect(byId(categoryChallengeId('health')).progress).toBe(1)
    expect(byId(cadenceChallengeId('daily')).progress).toBe(1)
    // Non-matching category and cadence challenges are untouched.
    expect(byId(categoryChallengeId('study')).progress).toBe(0)
    expect(byId(cadenceChallengeId('weekly')).progress).toBe(0)
  })

  it('resets a challenge to 0 and reports a completion when it reaches target', () => {
    let challenges = initialChallenges(DEFAULT_CATEGORIES)
    for (let i = 0; i < CHALLENGE_TARGET - 1; i++) {
      challenges = progressChallenges(challenges, { category: 'health', cadence: 'daily' })
        .challenges
    }
    const result = progressChallenges(challenges, { category: 'health', cadence: 'daily' })
    const universal = result.challenges.find((c) => c.id === universalChallengeId())!
    expect(universal.progress).toBe(0)
    expect(result.completedCount).toBeGreaterThanOrEqual(1)
  })

  it('pays a completion for each challenge that reaches target on the same mark', () => {
    const base = initialChallenges(DEFAULT_CATEGORIES).map((c) =>
      c.kind === 'universal' || c.id === cadenceChallengeId('daily')
        ? { ...c, progress: CHALLENGE_TARGET - 1 }
        : c,
    )
    const result = progressChallenges(base, { category: 'health', cadence: 'daily' })
    expect(result.completedCount).toBe(2)
    expect(result.challenges.find((c) => c.id === universalChallengeId())!.progress).toBe(0)
    expect(
      result.challenges.find((c) => c.id === cadenceChallengeId('daily'))!.progress,
    ).toBe(0)
    // The health category challenge only reached 1/target, so it did not complete.
    expect(
      result.challenges.find((c) => c.id === categoryChallengeId('health'))!.progress,
    ).toBe(1)
  })
})

describe('addCategoryChallenge', () => {
  it('creates a challenge for a newly unlocked category', () => {
    const before = initialChallenges(DEFAULT_CATEGORIES)
    const after = addCategoryChallenge(before, 'pets')
    const match = after.filter((c) => c.id === categoryChallengeId('pets'))
    expect(match).toHaveLength(1)
    expect(match[0]!.kind).toBe('category')
    expect(match[0]!.qualifier).toBe('pets')
  })

  it('does not create a second challenge for a category that already has one', () => {
    const before = initialChallenges(DEFAULT_CATEGORIES)
    const after = addCategoryChallenge(before, 'health')
    const matches = after.filter((c) => c.id === categoryChallengeId('health'))
    expect(matches).toHaveLength(1)
    expect(after).toHaveLength(before.length)
  })
})
