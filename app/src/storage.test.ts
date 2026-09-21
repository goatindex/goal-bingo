import { describe, expect, it } from 'vitest'
import {
  STORAGE_KEY,
  corruptStorage,
  freshState,
  loadState,
  saveState,
} from './storage'
import { MemoryStorage } from './test-support'
import { DEFAULT_CATEGORIES } from './categories'
import { initialChallenges } from './challenges'

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
  })

  it('soft-resets to a playable starter pool when storage is corrupt', () => {
    const storage = new MemoryStorage()
    corruptStorage(storage)
    const { state, softReset } = loadState(storage)
    expect(softReset).toBe(true)
    expect(state.pool.length).toBeGreaterThan(0)
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
