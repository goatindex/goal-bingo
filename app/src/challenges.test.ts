import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES, CADENCES } from './categories'
import {
  addCategoryChallenge,
  cadenceChallengeId,
  categoryChallengeId,
  initialChallenges,
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
