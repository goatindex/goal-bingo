import { describe, expect, it } from 'vitest'
import { everyCellHasOneTile } from './board'
import { DEFAULT_CATEGORIES } from './categories'
import { initialChallenges } from './challenges'
import { GRID_EXPANSION_COST, purchaseGridExpansion } from './expansion'
import { markCellAndResolve } from './lines'
import { RECYCLE_ALLOWANCE_UPGRADE_COST, purchaseAllowanceUpgrade } from './recycle'
import {
  FRESH_RECYCLE_STATE,
  STORAGE_KEY,
  corruptStorage,
  freshState,
  loadState,
  saveState,
} from './storage'
import { MemoryStorage } from './test-support'

describe('loadState / saveState (GB-DAT-001, GB-FUN-066)', () => {
  it('creates a non-empty starter pool on first launch', () => {
    const storage = new MemoryStorage()
    const { state, softReset } = loadState(storage)
    expect(softReset).toBe(false)
    expect(state.pool.length).toBeGreaterThan(0)
    expect(storage.getItem(STORAGE_KEY)).toBeTruthy()
  })

  it('round-trips pool, categories, board, score, and rewards locally', () => {
    const storage = new MemoryStorage()
    const state = freshState()
    state.score.lifetime = 12
    state.score.boardBalance = 3
    state.score.rewardBalance = 5
    state.board.cells[0]!.marked = true
    state.rewards = [{ id: 'rw-1', name: 'Takeaway', price: 20 }]
    state.categories = [...state.categories, 'pets']
    saveState(state, storage)
    const loaded = loadState(storage)
    expect(loaded.softReset).toBe(false)
    expect(loaded.state.score).toEqual(state.score)
    expect(loaded.state.board).toEqual(state.board)
    expect(loaded.state.board.cells[0]!.marked).toBe(true)
    expect(loaded.state.rewards).toEqual([{ id: 'rw-1', name: 'Takeaway', price: 20 }])
    expect(loaded.state.pool.length).toBe(state.pool.length)
    expect(loaded.state.categories).toEqual(state.categories)
    expect(loaded.state.challenges).toEqual(state.challenges)
    expect(loaded.state.recycle).toEqual(state.recycle)
    expect(loaded.state.stats).toEqual(state.stats)
    expect(loaded.state.achievements).toEqual(state.achievements)
    expect(loaded.state.advancedTileAccess).toEqual(state.advancedTileAccess)
  })

  it('soft-resets to a playable starter pool when storage is corrupt', () => {
    const storage = new MemoryStorage()
    corruptStorage(storage)
    const { state, softReset } = loadState(storage)
    expect(softReset).toBe(true)
    expect(state.pool.length).toBeGreaterThan(0)
    expect(everyCellHasOneTile(state.board)).toBe(true)
  })

  it('keeps a mark across a reload until its line clears (GB-FUN-002)', () => {
    const storage = new MemoryStorage()
    const state = freshState()
    state.board.cells[0]!.marked = true
    saveState(state, storage)
    const loaded = loadState(storage)
    expect(loaded.state.board.cells[0]!.marked).toBe(true)
    const board = loaded.state.board
    for (let i = 1; i < board.size - 1; i++) board.cells[i]!.marked = true
    const cleared = markCellAndResolve(board, board.size - 1, loaded.state.pool, () => 0)
    expect(cleared.ok).toBe(true)
    if (!cleared.ok) return
    expect(cleared.outcome.clearedLineCount).toBeGreaterThan(0)
    expect(cleared.outcome.board.cells[0]!.marked).toBe(false)
  })

  it('keeps a purchased 7x7 board across a reload (GB-FUN-006)', () => {
    const storage = new MemoryStorage()
    const state = freshState()
    const expanded = purchaseGridExpansion(
      state.board,
      state.pool,
      GRID_EXPANSION_COST,
      () => 0,
    )
    expect(expanded.ok).toBe(true)
    if (!expanded.ok) return
    state.board = expanded.board
    state.score.boardBalance = expanded.boardBalance
    saveState(state, storage)
    const loaded = loadState(storage)
    expect(loaded.state.board.size).toBe(7)
    expect(loaded.state.board.cells.length).toBe(49)
  })

  it('keeps a purchased recycle allowance across a reload (GB-FUN-037)', () => {
    const storage = new MemoryStorage()
    const state = freshState()
    const upgraded = purchaseAllowanceUpgrade(state.recycle, RECYCLE_ALLOWANCE_UPGRADE_COST)
    expect(upgraded.ok).toBe(true)
    if (!upgraded.ok) return
    state.recycle = upgraded.recycle
    state.score.boardBalance = upgraded.boardBalance
    saveState(state, storage)
    const loaded = loadState(storage)
    expect(loaded.state.recycle.allowanceLevel).toBe(FRESH_RECYCLE_STATE.allowanceLevel + 1)
  })

  it('treats an empty pool as valid saved state, not corruption', () => {
    const storage = new MemoryStorage()
    const state = freshState()
    state.pool = []
    saveState(state, storage)
    const loaded = loadState(storage)
    expect(loaded.softReset).toBe(false)
    expect(loaded.state.pool).toEqual([])
  })

  it('migrates a WP-01 save that lacks categories without soft-reset', () => {
    const storage = new MemoryStorage()
    const legacy = {
      version: 1 as const,
      pool: [{ id: 'g1', title: 'Drink water', category: 'health', cadence: 'hourly' }],
      board: null,
      score: { lifetime: 4, rewardBalance: 0, boardBalance: 1 },
      rewards: [],
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(legacy))
    const loaded = loadState(storage)
    expect(loaded.softReset).toBe(false)
    expect(loaded.state.pool).toEqual(legacy.pool)
    expect(loaded.state.categories.length).toBe(7)
    expect(loaded.state.score.lifetime).toBe(4)
    // Pre-WP-03 saves carried board: null - migration must build a real board rather
    // than carry that forward (GB-FUN-007: every cell always holds exactly one tile).
    expect(loaded.state.board.size).toBe(5)
    expect(loaded.state.board.cells.length).toBe(25)
    expect(loaded.state.board.cells.every((c) => c.goal != null)).toBe(true)
    // Pre-#93 saves never wrote challenges - migration must rebuild the always-active
    // set rather than carry forward nothing.
    expect(loaded.state.challenges).toEqual(initialChallenges(DEFAULT_CATEGORIES))
    // Pre-#99 saves never wrote a recycle allowance - migration must start a fresh one.
    expect(loaded.state.recycle).toEqual(FRESH_RECYCLE_STATE)
    // Pre-#108 saves never wrote stats - migration must start a fresh, empty record.
    expect(loaded.state.stats.clearsByCategory).toEqual({})
    expect(loaded.state.stats.clearsByDate).toEqual({})
    expect(typeof loaded.state.stats.firstPlayedAt).toBe('number')
    // Pre-#109 saves never wrote achievements - migration must start a fresh, empty list.
    expect(loaded.state.achievements).toEqual([])
    // Pre-#117 saves never wrote advanced-tile progress - migration must start fresh.
    expect(loaded.state.advancedTileAccess).toEqual({
      unlockedCategories: { 'multi-completion': [], 'mini-grid': [] },
      marksByCategory: {},
      pendingPlacements: [],
    })
  })

  it('migrates a pre-#133 save whose advancedTileAccess predates the two-track split, preserving everything else', () => {
    const storage = new MemoryStorage()
    const state = freshState()
    state.score.lifetime = 12
    state.rewards = [{ id: 'rw-1', name: 'Takeaway', price: 20 }]
    const legacy = {
      ...state,
      advancedTileAccess: {
        unlockedCategories: ['health'],
        marksByCategory: { health: 50, study: 3 },
      },
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(legacy))
    const loaded = loadState(storage)
    expect(loaded.softReset).toBe(false)
    // A category already unlocked under the old flat shape earned advanced tiles
    // generally - it migrates to both new tracks unlocked, not silently downgraded.
    expect(loaded.state.advancedTileAccess).toEqual({
      unlockedCategories: { 'multi-completion': ['health'], 'mini-grid': ['health'] },
      marksByCategory: { health: 50, study: 3 },
      pendingPlacements: [],
    })
    // Everything else on the save must be preserved, not reset by the broader
    // legacy-migration path this targeted check runs ahead of.
    expect(loaded.state.score.lifetime).toBe(12)
    expect(loaded.state.rewards).toEqual([{ id: 'rw-1', name: 'Takeaway', price: 20 }])
    expect(loaded.state.challenges).toEqual(state.challenges)
    expect(loaded.state.recycle).toEqual(state.recycle)
  })

  it('migrates a legacy save with malformed rewards to an empty reward list', () => {
    const storage = new MemoryStorage()
    const legacy = {
      version: 1 as const,
      pool: [{ id: 'g1', title: 'Drink water', category: 'health', cadence: 'hourly' }],
      board: null,
      score: { lifetime: 0, rewardBalance: 0, boardBalance: 0 },
      rewards: [{ name: 'Takeaway' }], // pre-WP-05 shape, no id/price
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(legacy))
    const loaded = loadState(storage)
    expect(loaded.softReset).toBe(false)
    expect(loaded.state.rewards).toEqual([])
  })

  it('soft-resets a legacy-shaped payload with invalid goals', () => {
    const storage = new MemoryStorage()
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        pool: [{ id: 'g1' }],
        board: null,
        score: { lifetime: 0, rewardBalance: 0, boardBalance: 0 },
        rewards: [],
      }),
    )
    const loaded = loadState(storage)
    expect(loaded.softReset).toBe(true)
    expect(loaded.state.pool.length).toBeGreaterThan(0)
  })
})
