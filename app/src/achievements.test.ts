import { describe, expect, it } from 'vitest'
import {
  LARGE_GRID_SIZE,
  SUSTAINED_RUN_DAYS,
  evaluateAchievements,
  type Achievement,
  type AchievementContext,
} from './achievements'
import { localDateString } from './stats'

const NOW = new Date(2026, 0, 15, 10, 0, 0).getTime()
const DAY_MS = 24 * 60 * 60 * 1000

const BASE_CONTEXT: AchievementContext = {
  totalClears: 0,
  boardSize: 5,
  hadVarietyCombo: false,
  clearsByDate: {},
}

describe('evaluateAchievements (GB-FUN-063, GB-FUN-064)', () => {
  it('unlocks first-clear the moment total clears reaches 1, not before', () => {
    expect(evaluateAchievements([], { ...BASE_CONTEXT, totalClears: 0 }, NOW)).toEqual([])
    const result = evaluateAchievements([], { ...BASE_CONTEXT, totalClears: 1 }, NOW)
    expect(result).toEqual([{ id: 'first-clear', unlockedAt: NOW }])
  })

  it('does not re-unlock first-clear on a later clear once already unlocked', () => {
    const unlocked: Achievement[] = [{ id: 'first-clear', unlockedAt: NOW - 1000 }]
    const result = evaluateAchievements(unlocked, { ...BASE_CONTEXT, totalClears: 5 }, NOW)
    expect(result).toEqual([])
  })

  it('unlocks large-grid when the board reaches size 7, not at size 5', () => {
    expect(evaluateAchievements([], { ...BASE_CONTEXT, boardSize: 5 }, NOW)).toEqual([])
    const result = evaluateAchievements(
      [],
      { ...BASE_CONTEXT, boardSize: LARGE_GRID_SIZE },
      NOW,
    )
    expect(result).toEqual([{ id: 'large-grid', unlockedAt: NOW }])
  })

  it('unlocks sustained-run only on the 3rd consecutive calendar day, not before', () => {
    const oneDay: Record<string, number> = { [localDateString(NOW)]: 1 }
    expect(
      evaluateAchievements([], { ...BASE_CONTEXT, clearsByDate: oneDay }, NOW),
    ).toEqual([])

    const twoDays: Record<string, number> = {
      [localDateString(NOW - DAY_MS)]: 1,
      [localDateString(NOW)]: 1,
    }
    expect(
      evaluateAchievements([], { ...BASE_CONTEXT, clearsByDate: twoDays }, NOW),
    ).toEqual([])

    const threeDays: Record<string, number> = {
      [localDateString(NOW - 2 * DAY_MS)]: 1,
      [localDateString(NOW - DAY_MS)]: 1,
      [localDateString(NOW)]: 1,
    }
    expect(SUSTAINED_RUN_DAYS).toBe(3)
    expect(evaluateAchievements([], { ...BASE_CONTEXT, clearsByDate: threeDays }, NOW)).toEqual([
      { id: 'sustained-run', unlockedAt: NOW },
    ])
  })

  it('breaks the streak on a gap day, so a later 3rd day alone does not unlock it', () => {
    const gapped: Record<string, number> = {
      [localDateString(NOW - 2 * DAY_MS)]: 1,
      // gap at NOW - DAY_MS
      [localDateString(NOW)]: 1,
    }
    expect(
      evaluateAchievements([], { ...BASE_CONTEXT, clearsByDate: gapped }, NOW),
    ).toEqual([])
  })

  it('unlocks rare-combination on a variety-combo clear, not otherwise', () => {
    expect(
      evaluateAchievements([], { ...BASE_CONTEXT, hadVarietyCombo: false }, NOW),
    ).toEqual([])
    const result = evaluateAchievements([], { ...BASE_CONTEXT, hadVarietyCombo: true }, NOW)
    expect(result).toEqual([{ id: 'rare-combination', unlockedAt: NOW }])
  })

  it('unlocks multiple achievements in one call without duplicating any', () => {
    const result = evaluateAchievements(
      [],
      { totalClears: 1, boardSize: LARGE_GRID_SIZE, hadVarietyCombo: true, clearsByDate: {} },
      NOW,
    )
    expect(result).toHaveLength(3)
    expect(result.map((a) => a.id).sort()).toEqual(
      ['first-clear', 'large-grid', 'rare-combination'].sort(),
    )
  })

  it('never re-unlocks an achievement already present in the unlocked list', () => {
    const unlocked: Achievement[] = [
      { id: 'first-clear', unlockedAt: NOW - 5000 },
      { id: 'large-grid', unlockedAt: NOW - 3000 },
      { id: 'sustained-run', unlockedAt: NOW - 2000 },
      { id: 'rare-combination', unlockedAt: NOW - 1000 },
    ]
    const result = evaluateAchievements(
      unlocked,
      {
        totalClears: 10,
        boardSize: LARGE_GRID_SIZE,
        hadVarietyCombo: true,
        clearsByDate: {
          [localDateString(NOW - 2 * DAY_MS)]: 1,
          [localDateString(NOW - DAY_MS)]: 1,
          [localDateString(NOW)]: 1,
        },
      },
      NOW,
    )
    expect(result).toEqual([])
  })
})
