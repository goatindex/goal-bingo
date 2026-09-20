/** Local-first persistence envelope (GB-DAT-001, GB-FUN-066). */

import { DEFAULT_CATEGORIES } from './categories'
import type { Goal } from './pool'

export const STORAGE_KEY = 'goal-bingo:v1'

export type GameState = {
  version: 1
  pool: Goal[]
  /** Unlocked category names, including the seven defaults. */
  categories: string[]
  board: unknown | null
  score: { lifetime: number; rewardBalance: number; boardBalance: number }
  rewards: unknown[]
}

export const STARTER_POOL: Goal[] = [
  { id: 'g1', title: 'Drink water', category: 'health', cadence: 'hourly' },
  { id: 'g2', title: 'Take a short walk', category: 'health', cadence: 'daily' },
  { id: 'g3', title: 'Read for 20 minutes', category: 'study', cadence: 'daily' },
  { id: 'g4', title: 'Tidy one surface', category: 'home', cadence: 'daily' },
  {
    id: 'g5',
    title: 'Message someone you care about',
    category: 'relationship',
    cadence: 'weekly',
  },
  { id: 'g6', title: 'Make something small', category: 'creative', cadence: 'weekly' },
  { id: 'g7', title: 'One work deep-focus block', category: 'work', cadence: 'daily' },
  {
    id: 'g8',
    title: 'Help with a community task',
    category: 'volunteering',
    cadence: 'weekly',
  },
]

export function freshState(): GameState {
  return {
    version: 1,
    pool: STARTER_POOL.map((g) => ({ ...g })),
    categories: [...DEFAULT_CATEGORIES],
    board: null,
    score: { lifetime: 0, rewardBalance: 0, boardBalance: 0 },
    rewards: [],
  }
}

function isGoal(value: unknown): value is Goal {
  if (!value || typeof value !== 'object') return false
  const g = value as Record<string, unknown>
  return (
    typeof g.id === 'string' &&
    typeof g.title === 'string' &&
    typeof g.category === 'string' &&
    typeof g.cadence === 'string'
  )
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    v.version === 1 &&
    Array.isArray(v.pool) &&
    v.pool.every(isGoal) &&
    Array.isArray(v.categories) &&
    v.categories.every((c) => typeof c === 'string') &&
    v.score !== null &&
    typeof v.score === 'object' &&
    Array.isArray(v.rewards)
  )
}

/** Load state; soft-reset to a playable fresh install if unreadable (GB-FUN-066). */
export function loadState(storage: Storage = localStorage): {
  state: GameState
  softReset: boolean
} {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null) {
      const state = freshState()
      saveState(state, storage)
      return { state, softReset: false }
    }
    const parsed: unknown = JSON.parse(raw)
    if (!isGameState(parsed)) {
      // Migrate WP-01 saves that lack categories.
      if (
        parsed &&
        typeof parsed === 'object' &&
        (parsed as { version?: unknown }).version === 1 &&
        Array.isArray((parsed as { pool?: unknown }).pool)
      ) {
        const legacy = parsed as {
          pool: Goal[]
          board: unknown | null
          score: GameState['score']
          rewards: unknown[]
        }
        const state: GameState = {
          version: 1,
          pool: legacy.pool,
          categories: [...DEFAULT_CATEGORIES],
          board: legacy.board ?? null,
          score: legacy.score,
          rewards: legacy.rewards ?? [],
        }
        saveState(state, storage)
        return { state, softReset: false }
      }
      const state = freshState()
      saveState(state, storage)
      return { state, softReset: true }
    }
    return { state: parsed, softReset: false }
  } catch {
    const state = freshState()
    saveState(state, storage)
    return { state, softReset: true }
  }
}

export function saveState(state: GameState, storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
}

/** Test helper: write unreadable payload to force soft reset. */
export function corruptStorage(storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, '{not-json')
}
