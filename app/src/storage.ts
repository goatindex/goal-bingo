/** Local-first persistence envelope (GB-DAT-001, GB-FUN-066). */

export const STORAGE_KEY = 'goal-bingo:v1'

export type StarterGoal = {
  id: string
  title: string
  category: string
  cadence: 'hourly' | 'daily' | 'weekly' | 'long-term'
}

export type GameState = {
  version: 1
  pool: StarterGoal[]
  board: unknown | null
  score: { lifetime: number; rewardBalance: number; boardBalance: number }
  rewards: unknown[]
}

export const STARTER_POOL: StarterGoal[] = [
  { id: 'g1', title: 'Drink water', category: 'health', cadence: 'hourly' },
  { id: 'g2', title: 'Take a short walk', category: 'health', cadence: 'daily' },
  { id: 'g3', title: 'Read for 20 minutes', category: 'study', cadence: 'daily' },
  { id: 'g4', title: 'Tidy one surface', category: 'home', cadence: 'daily' },
  { id: 'g5', title: 'Message someone you care about', category: 'relationship', cadence: 'weekly' },
  { id: 'g6', title: 'Make something small', category: 'creative', cadence: 'weekly' },
  { id: 'g7', title: 'One work deep-focus block', category: 'work', cadence: 'daily' },
]

export function freshState(): GameState {
  return {
    version: 1,
    pool: STARTER_POOL.map((g) => ({ ...g })),
    board: null,
    score: { lifetime: 0, rewardBalance: 0, boardBalance: 0 },
    rewards: [],
  }
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    v.version === 1 &&
    Array.isArray(v.pool) &&
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
