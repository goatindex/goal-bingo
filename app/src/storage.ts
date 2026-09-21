/** Local-first persistence envelope (GB-DAT-001, GB-FUN-066). */

import type { Board } from './board'
import { createBoard, isSupportedSize } from './board'
import { DEFAULT_CATEGORIES } from './categories'
import type { Challenge, ChallengeKind } from './challenges'
import { initialChallenges } from './challenges'
import type { Goal } from './pool'
import type { Reward } from './rewards'

export const STORAGE_KEY = 'goal-bingo:v1'

export type GameState = {
  version: 1
  pool: Goal[]
  /** Unlocked category names, including the seven defaults. */
  categories: string[]
  /** Never null once a game is playable — GB-FUN-001 has no end state to fall back to. */
  board: Board
  score: { lifetime: number; rewardBalance: number; boardBalance: number }
  rewards: Reward[]
  challenges: Challenge[]
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
  const pool = STARTER_POOL.map((g) => ({ ...g }))
  const board = createBoard(5, pool)
  if (!board.ok) throw new Error('unreachable: STARTER_POOL is never empty')
  return {
    version: 1,
    pool,
    categories: [...DEFAULT_CATEGORIES],
    board: board.board,
    score: { lifetime: 0, rewardBalance: 0, boardBalance: 0 },
    rewards: [],
    challenges: initialChallenges(DEFAULT_CATEGORIES),
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

function isCell(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const c = value as Record<string, unknown>
  return isGoal(c.goal) && typeof c.marked === 'boolean'
}

function isBoard(value: unknown): value is Board {
  if (!value || typeof value !== 'object') return false
  const b = value as Record<string, unknown>
  return (
    typeof b.size === 'number' &&
    isSupportedSize(b.size) &&
    Array.isArray(b.cells) &&
    b.cells.length === b.size * b.size &&
    b.cells.every(isCell)
  )
}

function isReward(value: unknown): value is Reward {
  if (!value || typeof value !== 'object') return false
  const r = value as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.name === 'string' &&
    typeof r.price === 'number' &&
    Number.isInteger(r.price) &&
    r.price > 0
  )
}

const CHALLENGE_KINDS: readonly ChallengeKind[] = ['universal', 'category', 'cadence']

function isChallenge(value: unknown): value is Challenge {
  if (!value || typeof value !== 'object') return false
  const c = value as Record<string, unknown>
  return (
    typeof c.id === 'string' &&
    typeof c.kind === 'string' &&
    (CHALLENGE_KINDS as readonly string[]).includes(c.kind) &&
    (c.qualifier === undefined || typeof c.qualifier === 'string') &&
    typeof c.progress === 'number' &&
    typeof c.target === 'number'
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
    isBoard(v.board) &&
    v.score !== null &&
    typeof v.score === 'object' &&
    Array.isArray(v.rewards) &&
    v.rewards.every(isReward) &&
    Array.isArray(v.challenges) &&
    v.challenges.every(isChallenge)
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
        Array.isArray((parsed as { pool?: unknown }).pool) &&
        (parsed as { pool: unknown[] }).pool.every(isGoal) &&
        (parsed as { score?: unknown }).score !== null &&
        typeof (parsed as { score?: unknown }).score === 'object' &&
        Array.isArray((parsed as { rewards?: unknown }).rewards ?? [])
      ) {
        const legacy = parsed as {
          pool: Goal[]
          board: unknown
          score: GameState['score']
          rewards?: unknown[]
        }
        // Pre-WP-05 saves never wrote a typed reward - fall back to empty rather than
        // trust unvalidated data (same reasoning as the board fallback below).
        const rewards = (legacy.rewards ?? []).every(isReward)
          ? (legacy.rewards as Reward[])
          : []
        // Pre-WP-03 saves never wrote a real board (the field was unknown | null and
        // nothing populated it) - build one from the restored pool rather than carry
        // forward a value that could never satisfy GB-FUN-007.
        let board: Board
        if (isBoard(legacy.board)) {
          board = legacy.board
        } else {
          const built = createBoard(5, legacy.pool)
          if (!built.ok) {
            const state = freshState()
            saveState(state, storage)
            return { state, softReset: true }
          }
          board = built.board
        }
        const state: GameState = {
          version: 1,
          pool: legacy.pool,
          categories: [...DEFAULT_CATEGORIES],
          board,
          score: legacy.score,
          rewards,
          // Pre-#93 saves never wrote challenges - rebuild the always-active set from
          // the restored (default) categories rather than trust unvalidated data.
          challenges: initialChallenges(DEFAULT_CATEGORIES),
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
