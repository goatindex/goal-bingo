import { describe, expect, it } from 'vitest'
import { addReward, removeReward, validateReward } from './rewards'
import { loadState, saveState } from './storage'
import { MemoryStorage } from './test-support'

describe('personal rewards (GB-FUN-034, GB-FUN-034b)', () => {
  it('creates a reward with a name and a price', () => {
    const result = addReward([], { name: 'Takeaway', price: 20 })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.rewards).toHaveLength(1)
    expect(result.rewards[0]!.name).toBe('Takeaway')
    expect(result.rewards[0]!.price).toBe(20)
  })

  it('rejects a blank name', () => {
    const result = addReward([], { name: '   ', price: 20 })
    expect(result).toEqual({ ok: false, error: expect.any(String) })
    if (result.ok) return
  })

  it('rejects a zero, negative, or non-numeric price', () => {
    expect(validateReward({ name: 'X', price: 0 }).ok).toBe(false)
    expect(validateReward({ name: 'X', price: -5 }).ok).toBe(false)
    expect(validateReward({ name: 'X', price: Number.NaN }).ok).toBe(false)
    expect(validateReward({ name: 'X', price: 'not-a-number' }).ok).toBe(false)
  })

  it('a rejected reward leaves the list unchanged', () => {
    const before = [{ id: 'rw-1', name: 'Existing', price: 10 }]
    const result = addReward(before, { name: '', price: 5 })
    expect(result).toEqual({ ok: false, error: expect.any(String) })
    expect(before).toHaveLength(1)
  })

  it('a created reward persists across a storage round-trip', () => {
    const storage = new MemoryStorage()
    const { state } = loadState(storage)
    const added = addReward(state.rewards, { name: 'Takeaway', price: 20 })
    expect(added.ok).toBe(true)
    if (!added.ok) return
    state.rewards = added.rewards
    saveState(state, storage)
    const reloaded = loadState(storage)
    expect(reloaded.state.rewards).toEqual(added.rewards)
  })

  it('deletes a reward without affecting others', () => {
    const first = addReward([], { name: 'Takeaway', price: 20 })
    expect(first.ok).toBe(true)
    if (!first.ok) return
    const second = addReward(first.rewards, { name: 'Evening off', price: 50 })
    expect(second.ok).toBe(true)
    if (!second.ok) return
    const idToRemove = second.rewards[0]!.id
    const remaining = removeReward(second.rewards, idToRemove)
    expect(remaining).toHaveLength(1)
    expect(remaining[0]!.name).toBe('Evening off')
  })
})
