/** Minimum achievement set: first clear, large grid, sustained run, rare combination
 *  (GB-FUN-063, GB-FUN-064). */

import { localDateString } from './stats'

export type AchievementId = 'first-clear' | 'large-grid' | 'sustained-run' | 'rare-combination'

export type Achievement = {
  id: AchievementId
  unlockedAt: number
}

/** Sustained-run threshold: 3 consecutive calendar days with at least one clear each (D-2026-09-21-13). */
export const SUSTAINED_RUN_DAYS = 3

/** Large-grid threshold: the only size above the 5x5 start (D-2026-09-21-15). */
export const LARGE_GRID_SIZE = 7

const DAY_MS = 24 * 60 * 60 * 1000

function hasAchievement(unlocked: readonly Achievement[], id: AchievementId): boolean {
  return unlocked.some((a) => a.id === id)
}

/** Consecutive calendar days ending today (inclusive) with at least one recorded clear. */
function currentStreakDays(clearsByDate: Record<string, number>, now: number): number {
  let streak = 0
  let cursor = now
  while ((clearsByDate[localDateString(cursor)] ?? 0) > 0) {
    streak += 1
    cursor -= DAY_MS
  }
  return streak
}

export type AchievementContext = {
  /** Total recorded line clears (GB-FUN-053's tally), for "first clear". */
  totalClears: number
  boardSize: number
  /** Whether the mark just resolved included a variety-combo clear. */
  hadVarietyCombo: boolean
  clearsByDate: Record<string, number>
}

/**
 * Evaluate the minimum achievement set against the current context, returning only
 * the achievements newly unlocked by this call — never a duplicate of one already in
 * `unlocked`, and never more than one entry per id even within the same call.
 */
export function evaluateAchievements(
  unlocked: readonly Achievement[],
  context: AchievementContext,
  now: number = Date.now(),
): Achievement[] {
  const newly: Achievement[] = []
  const award = (id: AchievementId, condition: boolean) => {
    if (condition && !hasAchievement(unlocked, id) && !newly.some((a) => a.id === id)) {
      newly.push({ id, unlockedAt: now })
    }
  }
  award('first-clear', context.totalClears >= 1)
  award('large-grid', context.boardSize >= LARGE_GRID_SIZE)
  award('sustained-run', currentStreakDays(context.clearsByDate, now) >= SUSTAINED_RUN_DAYS)
  award('rare-combination', context.hadVarietyCombo)
  return newly
}
