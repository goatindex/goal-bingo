import { describe, expect, it } from 'vitest'
import {
  ADVANCED_TILE_MARK_THRESHOLD,
  ADVANCED_TILE_UNLOCK_COST,
  applyGlobalAdvancedTileProgress,
  freshAdvancedTileAccess,
  globalUnlockCost,
  globalUnlockMarkThreshold,
  isAdvancedTileUnlocked,
  purchaseAdvancedTileUnlock,
  purchaseGlobalAdvancedTileUnlock,
  recordAdvancedTileProgress,
  remainingCategoriesForTrack,
  totalLifetimeMarks,
  type AdvancedTileAccess,
} from './advancedUnlock'

const SEVEN = ['health', 'study', 'creative', 'volunteering', 'relationship', 'home', 'work'] as const

describe('recordAdvancedTileProgress (GB-FUN-043)', () => {
  it('increments a category mark count independent of other categories', () => {
    let access = freshAdvancedTileAccess()
    access = recordAdvancedTileProgress(access, 'health')
    access = recordAdvancedTileProgress(access, 'health')
    access = recordAdvancedTileProgress(access, 'study')
    expect(access.marksByCategory).toEqual({ health: 2, study: 1 })
  })

  it('unlocks both tracks the moment the shared threshold is reached, not before', () => {
    let access = freshAdvancedTileAccess()
    for (let i = 0; i < ADVANCED_TILE_MARK_THRESHOLD - 1; i++) {
      access = recordAdvancedTileProgress(access, 'health')
    }
    expect(isAdvancedTileUnlocked(access, 'multi-completion', 'health')).toBe(false)
    expect(isAdvancedTileUnlocked(access, 'mini-grid', 'health')).toBe(false)
    access = recordAdvancedTileProgress(access, 'health')
    expect(isAdvancedTileUnlocked(access, 'multi-completion', 'health')).toBe(true)
    expect(isAdvancedTileUnlocked(access, 'mini-grid', 'health')).toBe(true)
  })

  it('leaves an already-purchased track alone when progression reaches the threshold', () => {
    let access = freshAdvancedTileAccess()
    const purchased = purchaseAdvancedTileUnlock(access, 'multi-completion', 'health', ADVANCED_TILE_UNLOCK_COST)
    expect(purchased.ok).toBe(true)
    if (!purchased.ok) return
    access = purchased.access
    for (let i = 0; i < ADVANCED_TILE_MARK_THRESHOLD; i++) {
      access = recordAdvancedTileProgress(access, 'health')
    }
    expect(access.unlockedCategories['multi-completion']).toEqual(['health'])
    expect(isAdvancedTileUnlocked(access, 'mini-grid', 'health')).toBe(true)
  })
})

describe('purchaseAdvancedTileUnlock (GB-FUN-044)', () => {
  it('unlocks one track of a category below the mark threshold immediately for board balance, leaving the other track locked', () => {
    const access = freshAdvancedTileAccess()
    const result = purchaseAdvancedTileUnlock(access, 'multi-completion', 'health', ADVANCED_TILE_UNLOCK_COST)
    expect(result).toEqual({
      ok: true,
      access: {
        unlockedCategories: { 'multi-completion': ['health'], 'mini-grid': [] },
        marksByCategory: {},
        pendingPlacements: [],
      },
      boardBalance: 0,
    })
  })

  it('unlocking one track does not unlock the other for the same category', () => {
    const access = freshAdvancedTileAccess()
    const result = purchaseAdvancedTileUnlock(access, 'mini-grid', 'health', ADVANCED_TILE_UNLOCK_COST)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(isAdvancedTileUnlocked(result.access, 'mini-grid', 'health')).toBe(true)
    expect(isAdvancedTileUnlocked(result.access, 'multi-completion', 'health')).toBe(false)
  })

  it('refuses to purchase an already-unlocked track, with no state change', () => {
    const access: AdvancedTileAccess = {
      unlockedCategories: { 'multi-completion': ['health'], 'mini-grid': [] },
      marksByCategory: {},
      pendingPlacements: [],
    }
    const result = purchaseAdvancedTileUnlock(access, 'multi-completion', 'health', ADVANCED_TILE_UNLOCK_COST)
    expect(result).toEqual({ ok: false, reason: 'already-unlocked' })
  })

  it('refuses with insufficient board balance, with no state change', () => {
    const access = freshAdvancedTileAccess()
    const result = purchaseAdvancedTileUnlock(access, 'multi-completion', 'health', ADVANCED_TILE_UNLOCK_COST - 1)
    expect(result).toEqual({ ok: false, reason: 'insufficient-balance' })
  })

  it('does not deduct board balance twice for one track', () => {
    let access = freshAdvancedTileAccess()
    const first = purchaseAdvancedTileUnlock(access, 'multi-completion', 'health', 1000)
    expect(first.ok).toBe(true)
    if (!first.ok) return
    access = first.access
    const second = purchaseAdvancedTileUnlock(access, 'multi-completion', 'health', first.boardBalance)
    expect(second).toEqual({ ok: false, reason: 'already-unlocked' })
  })
})

describe('global unlock pricing (D-2026-09-21-22)', () => {
  it('prices remaining categories at a 30% discount, rounded up', () => {
    expect(globalUnlockMarkThreshold(7)).toBe(Math.ceil(0.7 * 7 * ADVANCED_TILE_MARK_THRESHOLD))
    expect(globalUnlockCost(7)).toBe(Math.ceil(0.7 * 7 * ADVANCED_TILE_UNLOCK_COST))
    expect(globalUnlockCost(1)).toBe(Math.ceil(0.7 * ADVANCED_TILE_UNLOCK_COST))
  })

  it('counts remaining per track against the player category list', () => {
    const access: AdvancedTileAccess = {
      unlockedCategories: { 'multi-completion': ['health'], 'mini-grid': [] },
      marksByCategory: {},
      pendingPlacements: [],
    }
    expect(remainingCategoriesForTrack(access, 'multi-completion', SEVEN)).toEqual([
      'study', 'creative', 'volunteering', 'relationship', 'home', 'work',
    ])
    expect(remainingCategoriesForTrack(access, 'mini-grid', SEVEN)).toEqual([...SEVEN])
  })
})

describe('applyGlobalAdvancedTileProgress (D-2026-09-21-22, D-2026-09-22-1)', () => {
  it('unlocks every still-locked category for a track once total marks hit the threshold', () => {
    const threshold = globalUnlockMarkThreshold(SEVEN.length)
    const access: AdvancedTileAccess = {
      unlockedCategories: { 'multi-completion': [], 'mini-grid': [] },
      marksByCategory: { health: threshold },
      pendingPlacements: [],
    }
    expect(totalLifetimeMarks(access)).toBe(threshold)
    const after = applyGlobalAdvancedTileProgress(access, SEVEN)
    for (const category of SEVEN) {
      expect(isAdvancedTileUnlocked(after, 'multi-completion', category)).toBe(true)
      expect(isAdvancedTileUnlocked(after, 'mini-grid', category)).toBe(true)
    }
  })

  it('does not unlock either track below the global threshold', () => {
    const threshold = globalUnlockMarkThreshold(SEVEN.length)
    const access: AdvancedTileAccess = {
      unlockedCategories: { 'multi-completion': [], 'mini-grid': [] },
      marksByCategory: { health: threshold - 1 },
      pendingPlacements: [],
    }
    const after = applyGlobalAdvancedTileProgress(access, SEVEN)
    expect(after.unlockedCategories).toEqual({ 'multi-completion': [], 'mini-grid': [] })
  })

  it('unlocks only the track whose remaining set still needs clearing', () => {
    // mini-grid already unlocked for every category; multi-completion still has 7 left.
    const threshold = globalUnlockMarkThreshold(SEVEN.length)
    const access: AdvancedTileAccess = {
      unlockedCategories: { 'multi-completion': [], 'mini-grid': [...SEVEN] },
      marksByCategory: { health: threshold },
      pendingPlacements: [],
    }
    const after = applyGlobalAdvancedTileProgress(access, SEVEN)
    expect(after.unlockedCategories['mini-grid']).toEqual([...SEVEN])
    for (const category of SEVEN) {
      expect(isAdvancedTileUnlocked(after, 'multi-completion', category)).toBe(true)
    }
  })

  it('shrinks the remaining count when some categories are already unlocked', () => {
    const already = ['health', 'study'] as const
    const remaining = SEVEN.length - already.length
    const threshold = globalUnlockMarkThreshold(remaining)
    const access: AdvancedTileAccess = {
      unlockedCategories: {
        'multi-completion': [...already],
        'mini-grid': [...already],
      },
      marksByCategory: { health: threshold },
      pendingPlacements: [],
    }
    const after = applyGlobalAdvancedTileProgress(access, SEVEN)
    for (const category of SEVEN) {
      expect(isAdvancedTileUnlocked(after, 'multi-completion', category)).toBe(true)
    }
  })

  it('grows the remaining set when a new custom category is added', () => {
    const withPets = [...SEVEN, 'pets']
    const access: AdvancedTileAccess = {
      unlockedCategories: { 'multi-completion': [], 'mini-grid': [] },
      marksByCategory: { health: globalUnlockMarkThreshold(SEVEN.length) },
      pendingPlacements: [],
    }
    // Marks that would unlock seven categories do not yet unlock eight.
    const stillShort = applyGlobalAdvancedTileProgress(access, withPets)
    expect(stillShort.unlockedCategories['multi-completion']).toEqual([])
    const enough: AdvancedTileAccess = {
      ...access,
      marksByCategory: { health: globalUnlockMarkThreshold(withPets.length) },
    }
    const after = applyGlobalAdvancedTileProgress(enough, withPets)
    expect(after.unlockedCategories['multi-completion']).toContain('pets')
    expect(after.unlockedCategories['multi-completion']).toHaveLength(withPets.length)
  })
})

describe('purchaseGlobalAdvancedTileUnlock (D-2026-09-21-22, D-2026-09-22-1)', () => {
  it('unlocks one track for every still-locked category and leaves the other track alone', () => {
    const access = freshAdvancedTileAccess()
    const cost = globalUnlockCost(SEVEN.length)
    const result = purchaseGlobalAdvancedTileUnlock(access, 'multi-completion', SEVEN, cost)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.boardBalance).toBe(0)
    for (const category of SEVEN) {
      expect(isAdvancedTileUnlocked(result.access, 'multi-completion', category)).toBe(true)
      expect(isAdvancedTileUnlocked(result.access, 'mini-grid', category)).toBe(false)
    }
  })

  it('prices only the still-locked categories for that track', () => {
    const access: AdvancedTileAccess = {
      unlockedCategories: { 'multi-completion': ['health'], 'mini-grid': [] },
      marksByCategory: {},
      pendingPlacements: [],
    }
    const cost = globalUnlockCost(SEVEN.length - 1)
    const result = purchaseGlobalAdvancedTileUnlock(access, 'multi-completion', SEVEN, cost)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.boardBalance).toBe(0)
    expect(result.access.unlockedCategories['multi-completion']).toHaveLength(SEVEN.length)
  })

  it('refuses when every category already has the track, with no state change', () => {
    const access: AdvancedTileAccess = {
      unlockedCategories: { 'multi-completion': [...SEVEN], 'mini-grid': [] },
      marksByCategory: {},
      pendingPlacements: [],
    }
    const result = purchaseGlobalAdvancedTileUnlock(access, 'multi-completion', SEVEN, 10_000)
    expect(result).toEqual({ ok: false, reason: 'nothing-to-unlock' })
  })

  it('refuses with insufficient board balance, with no state change', () => {
    const access = freshAdvancedTileAccess()
    const cost = globalUnlockCost(SEVEN.length)
    const result = purchaseGlobalAdvancedTileUnlock(access, 'mini-grid', SEVEN, cost - 1)
    expect(result).toEqual({ ok: false, reason: 'insufficient-balance' })
  })
})
