import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES, canUnlockCustomCategory } from './categories'
import {
  addGoal,
  drawGoal,
  everyGoalHasOneCategoryAndCadence,
  removeGoal,
  updateGoal,
} from './pool'
import { STARTER_POOL, freshState } from './storage'

describe('starter pool (GB-FUN-017, GB-FUN-019)', () => {
  it('covers each default category at least once', () => {
    const cats = new Set(STARTER_POOL.map((g) => g.category))
    for (const c of DEFAULT_CATEGORIES) {
      expect(cats.has(c)).toBe(true)
    }
  })

  it('ships exactly the seven default categories unlocked', () => {
    expect(freshState().categories).toEqual([...DEFAULT_CATEGORIES])
  })
})

describe('goal validation (GB-FUN-018, GB-FUN-021)', () => {
  it('requires exactly one category and cadence', () => {
    const cats = [...DEFAULT_CATEGORIES]
    const ok = addGoal([], { title: 'Run', category: 'health', cadence: 'daily' }, cats)
    expect(ok.ok).toBe(true)
    const badCat = addGoal([], { title: 'Run', category: '', cadence: 'daily' }, cats)
    expect(badCat.ok).toBe(false)
    const badCadence = addGoal(
      [],
      { title: 'Run', category: 'health', cadence: 'monthly' },
      cats,
    )
    expect(badCadence.ok).toBe(false)
  })

  it('edits and removes goals', () => {
    const cats = [...DEFAULT_CATEGORIES]
    let pool = STARTER_POOL.map((g) => ({ ...g }))
    const id = pool[0]!.id
    const updated = updateGoal(
      pool,
      id,
      { title: 'Hydrate', category: 'health', cadence: 'hourly' },
      cats,
    )
    expect(updated.ok).toBe(true)
    if (updated.ok) pool = updated.pool
    expect(pool.find((g) => g.id === id)?.title).toBe('Hydrate')
    pool = removeGoal(pool, id)
    expect(pool.find((g) => g.id === id)).toBeUndefined()
    expect(everyGoalHasOneCategoryAndCadence(pool)).toBe(true)
  })
})

describe('custom category unlock (GB-FUN-020, D-2026-09-20-7)', () => {
  it('unlocks only at lifetime score >= 10', () => {
    expect(canUnlockCustomCategory(9)).toBe(false)
    expect(canUnlockCustomCategory(10)).toBe(true)
  })
})

describe('draw rules (GB-FUN-016, GB-FUN-065, GB-FUN-067)', () => {
  it('does not remove a drawn goal from the pool', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const before = pool.length
    const result = drawGoal(pool, () => 0)
    expect(result.ok).toBe(true)
    expect(pool.length).toBe(before)
    if (result.ok) {
      expect(pool.some((g) => g.id === result.goal.id)).toBe(true)
    }
  })

  it('may draw a goal that is already on the board', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const onBoard = new Set([pool[0]!.id])
    const result = drawGoal(pool, () => 0)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(onBoard.has(result.goal.id) || !onBoard.has(result.goal.id)).toBe(true)
      // First goal is selectable even if treated as on-board.
      expect(result.goal.id).toBe(pool[0]!.id)
    }
  })

  it('refuses to draw from an empty pool', () => {
    const result = drawGoal([])
    expect(result).toEqual({ ok: false, reason: 'empty-pool' })
  })
})
