import { describe, expect, it } from 'vitest'
import {
  ADVANCED_TILE_MARK_THRESHOLD,
  ADVANCED_TILE_UNLOCK_COST,
  freshAdvancedTileAccess,
  isAdvancedTileUnlocked,
  purchaseAdvancedTileUnlock,
  recordAdvancedTileProgress,
  type AdvancedTileAccess,
} from './advancedUnlock'

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
