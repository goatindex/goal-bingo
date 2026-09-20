import { describe, expect, it } from 'vitest'
import {
  STORAGE_KEY,
  corruptStorage,
  freshState,
  loadState,
  saveState,
} from './storage'

class MemoryStorage implements Storage {
  private data = new Map<string, string>()
  get length() {
    return this.data.size
  }
  clear() {
    this.data.clear()
  }
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.data.delete(key)
  }
  setItem(key: string, value: string) {
    this.data.set(key, value)
  }
}

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
    state.board = { size: 3 }
    state.rewards = [{ name: 'Takeaway' }]
    state.categories = [...state.categories, 'pets']
    saveState(state, storage)
    const loaded = loadState(storage)
    expect(loaded.softReset).toBe(false)
    expect(loaded.state.score).toEqual(state.score)
    expect(loaded.state.board).toEqual({ size: 3 })
    expect(loaded.state.rewards).toEqual([{ name: 'Takeaway' }])
    expect(loaded.state.pool.length).toBe(state.pool.length)
    expect(loaded.state.categories).toEqual(state.categories)
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
  })
})
