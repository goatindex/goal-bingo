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

  it('unlocks eligibility the moment the threshold is reached, not before', () => {
    let access = freshAdvancedTileAccess()
    for (let i = 0; i < ADVANCED_TILE_MARK_THRESHOLD - 1; i++) {
      access = recordAdvancedTileProgress(access, 'health')
    }
    expect(isAdvancedTileUnlocked(access, 'health')).toBe(false)
    access = recordAdvancedTileProgress(access, 'health')
    expect(isAdvancedTileUnlocked(access, 'health')).toBe(true)
  })
})

describe('purchaseAdvancedTileUnlock (GB-FUN-044)', () => {
  it('unlocks a category below the mark threshold immediately for board balance', () => {
    const access = freshAdvancedTileAccess()
    const result = purchaseAdvancedTileUnlock(access, 'health', ADVANCED_TILE_UNLOCK_COST)
    expect(result).toEqual({
      ok: true,
      access: { unlockedCategories: ['health'], marksByCategory: {} },
      boardBalance: 0,
    })
  })

  it('refuses to purchase an already-unlocked category, with no state change', () => {
    const access: AdvancedTileAccess = {
      unlockedCategories: ['health'],
      marksByCategory: {},
    }
    const result = purchaseAdvancedTileUnlock(access, 'health', ADVANCED_TILE_UNLOCK_COST)
    expect(result).toEqual({ ok: false, reason: 'already-unlocked' })
  })

  it('refuses with insufficient board balance, with no state change', () => {
    const access = freshAdvancedTileAccess()
    const result = purchaseAdvancedTileUnlock(access, 'health', ADVANCED_TILE_UNLOCK_COST - 1)
    expect(result).toEqual({ ok: false, reason: 'insufficient-balance' })
  })

  it('does not deduct board balance twice for one category', () => {
    let access = freshAdvancedTileAccess()
    const first = purchaseAdvancedTileUnlock(access, 'health', 1000)
    expect(first.ok).toBe(true)
    if (!first.ok) return
    access = first.access
    const second = purchaseAdvancedTileUnlock(access, 'health', first.boardBalance)
    expect(second).toEqual({ ok: false, reason: 'already-unlocked' })
  })
})
