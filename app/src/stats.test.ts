import { describe, expect, it } from 'vitest'
import {
  averageClearsPerDay,
  daysSinceFirstPlay,
  freshStats,
  localDateString,
  recordClear,
  totalClears,
} from './stats'

const NOW = new Date(2026, 0, 15, 10, 0, 0).getTime() // 2026-01-15 10:00 local
const DAY_MS = 24 * 60 * 60 * 1000

describe('recordClear (GB-FUN-052, GB-FUN-053)', () => {
  it('increments the category tally once per cleared cell, including duplicates', () => {
    const fresh = freshStats(NOW)
    const after = recordClear(fresh, ['a', 'a', 'b', 'b', 'c'], 1, NOW)
    expect(after.clearsByCategory).toEqual({ a: 2, b: 2, c: 1 })
  })

  it('increments the date bucket by clearedLineCount, not by category count', () => {
    const fresh = freshStats(NOW)
    // A double-clear: 2 lines, 9 distinct cells (an intersection cell shared once).
    const after = recordClear(fresh, ['a', 'a', 'b', 'b', 'c', 'd', 'd', 'e', 'e'], 2, NOW)
    expect(after.clearsByDate[localDateString(NOW)]).toBe(2)
  })

  it('accumulates across multiple clear events on the same day', () => {
    let stats = freshStats(NOW)
    stats = recordClear(stats, ['a'], 1, NOW)
    stats = recordClear(stats, ['b'], 1, NOW + 1000)
    expect(stats.clearsByDate[localDateString(NOW)]).toBe(2)
    expect(stats.clearsByCategory).toEqual({ a: 1, b: 1 })
  })

  it('is a no-op when clearedLineCount is 0 (a mark that completed no line)', () => {
    const fresh = freshStats(NOW)
    const after = recordClear(fresh, [], 0, NOW)
    expect(after).toEqual(fresh)
  })

  it('buckets clears on different calendar days separately', () => {
    let stats = freshStats(NOW)
    stats = recordClear(stats, ['a'], 1, NOW)
    stats = recordClear(stats, ['a'], 1, NOW + DAY_MS)
    expect(Object.keys(stats.clearsByDate)).toHaveLength(2)
    expect(stats.clearsByCategory).toEqual({ a: 2 })
  })
})

describe('totalClears / daysSinceFirstPlay / averageClearsPerDay (GB-FUN-054)', () => {
  it('reports a total of 0 and an average of 0 on a fresh game, never NaN', () => {
    const fresh = freshStats(NOW)
    expect(totalClears(fresh)).toBe(0)
    expect(averageClearsPerDay(fresh, NOW)).toBe(0)
    expect(Number.isNaN(averageClearsPerDay(fresh, NOW))).toBe(false)
  })

  it('counts the first calendar day as day 1, not day 0', () => {
    const fresh = freshStats(NOW)
    expect(daysSinceFirstPlay(fresh, NOW)).toBe(1)
  })

  it('computes the average as total clears divided by days since first play', () => {
    let stats = freshStats(NOW)
    stats = recordClear(stats, ['a'], 3, NOW)
    stats = recordClear(stats, ['a'], 1, NOW + 2 * DAY_MS)
    expect(totalClears(stats)).toBe(4)
    expect(daysSinceFirstPlay(stats, NOW + 2 * DAY_MS)).toBe(3)
    expect(averageClearsPerDay(stats, NOW + 2 * DAY_MS)).toBeCloseTo(4 / 3)
  })
})

describe('localDateString', () => {
  it('formats as YYYY-MM-DD using the local date', () => {
    const d = new Date(2026, 2, 5, 23, 59, 0).getTime() // 2026-03-05
    expect(localDateString(d)).toBe('2026-03-05')
  })
})
