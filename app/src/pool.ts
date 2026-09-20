/** Goal pool operations (GB-FUN-016, 017, 018, 021, 065, 067). */

import {
  CADENCES,
  type Cadence,
  isAllowedCategory,
  isCadence,
} from './categories'

export type Goal = {
  id: string
  title: string
  category: string
  cadence: Cadence
}

export type DrawSuccess = { ok: true; goal: Goal }
export type DrawFailure = { ok: false; reason: 'empty-pool' }
export type DrawResult = DrawSuccess | DrawFailure

export function createGoalId(): string {
  return `g-${crypto.randomUUID()}`
}

export function validateGoal(
  input: { title: string; category: string; cadence: string },
  unlockedCategories: readonly string[],
): { ok: true; goal: Omit<Goal, 'id'> } | { ok: false; error: string } {
  const title = input.title.trim()
  if (!title) return { ok: false, error: 'Title is required.' }
  if (!isAllowedCategory(input.category, unlockedCategories)) {
    return { ok: false, error: 'Category is not unlocked.' }
  }
  if (!isCadence(input.cadence)) {
    return { ok: false, error: `Cadence must be one of: ${CADENCES.join(', ')}.` }
  }
  return {
    ok: true,
    goal: { title, category: input.category, cadence: input.cadence },
  }
}

export function addGoal(
  pool: Goal[],
  input: { title: string; category: string; cadence: string },
  unlockedCategories: readonly string[],
): { ok: true; pool: Goal[] } | { ok: false; error: string } {
  const checked = validateGoal(input, unlockedCategories)
  if (!checked.ok) return checked
  return {
    ok: true,
    pool: [...pool, { id: createGoalId(), ...checked.goal }],
  }
}

export function updateGoal(
  pool: Goal[],
  id: string,
  input: { title: string; category: string; cadence: string },
  unlockedCategories: readonly string[],
): { ok: true; pool: Goal[] } | { ok: false; error: string } {
  const checked = validateGoal(input, unlockedCategories)
  if (!checked.ok) return checked
  const index = pool.findIndex((g) => g.id === id)
  if (index < 0) return { ok: false, error: 'Goal not found.' }
  const next = pool.slice()
  next[index] = { id, ...checked.goal }
  return { ok: true, pool: next }
}

export function removeGoal(pool: Goal[], id: string): Goal[] {
  return pool.filter((g) => g.id !== id)
}

/**
 * Draw a goal from the pool without removing it (GB-FUN-016).
 * Goals already on the board remain eligible (GB-FUN-067).
 * Empty pool refuses (GB-FUN-065).
 */
export function drawGoal(
  pool: Goal[],
  rng: () => number = Math.random,
): DrawResult {
  if (pool.length === 0) return { ok: false, reason: 'empty-pool' }
  const index = Math.floor(rng() * pool.length)
  return { ok: true, goal: pool[index]! }
}

export function everyGoalHasOneCategoryAndCadence(pool: Goal[]): boolean {
  return pool.every(
    (g) =>
      typeof g.category === 'string' &&
      g.category.length > 0 &&
      isCadence(g.cadence),
  )
}
