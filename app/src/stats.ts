/** Clear statistics: category breakdown, daily history, average (GB-FUN-052, 053, 054). */

export type Stats = {
  /** Epoch ms of the game's first launch (freshState), the denominator for the average. */
  firstPlayedAt: number
  /** Cleared-cell count per category (D-2026-09-21-12: per cell, not per line). */
  clearsByCategory: Record<string, number>
  /** Line-clear count per local calendar date (YYYY-MM-DD). */
  clearsByDate: Record<string, number>
}

export function freshStats(now: number = Date.now()): Stats {
  return { firstPlayedAt: now, clearsByCategory: {}, clearsByDate: {} }
}

/** Local device calendar date as YYYY-MM-DD, matching the achievement streak's own day boundary. */
export function localDateString(epochMs: number): string {
  const d = new Date(epochMs)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Record one clear event. `clearedCategories` is the category of every cell that
 * cleared, one entry per cell (GB-FUN-052, D-2026-09-21-12) — pass the same list for
 * a multi-line clear as for a single line, since a cell shared by 2+ completing
 * lines still clears exactly once. `clearedLineCount` is how many lines cleared
 * simultaneously (GB-FUN-053/054). A no-op mark (`clearedLineCount` 0) leaves stats
 * unchanged.
 */
export function recordClear(
  stats: Stats,
  clearedCategories: readonly string[],
  clearedLineCount: number,
  now: number = Date.now(),
): Stats {
  if (clearedLineCount === 0) return stats
  const clearsByCategory = { ...stats.clearsByCategory }
  for (const category of clearedCategories) {
    clearsByCategory[category] = (clearsByCategory[category] ?? 0) + 1
  }
  const date = localDateString(now)
  const clearsByDate = {
    ...stats.clearsByDate,
    [date]: (stats.clearsByDate[date] ?? 0) + clearedLineCount,
  }
  return { ...stats, clearsByCategory, clearsByDate }
}

export function totalClears(stats: Stats): number {
  return Object.values(stats.clearsByDate).reduce((sum, n) => sum + n, 0)
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Calendar days since first play, counting the current day as day 1 (never 0). */
export function daysSinceFirstPlay(stats: Stats, now: number = Date.now()): number {
  const days = Math.floor((now - stats.firstPlayedAt) / DAY_MS) + 1
  return Math.max(1, days)
}

/** GB-FUN-054: total clears divided by days since first play. Never NaN or divide-by-zero. */
export function averageClearsPerDay(stats: Stats, now: number = Date.now()): number {
  return totalClears(stats) / daysSinceFirstPlay(stats, now)
}
