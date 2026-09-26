/** Display preferences, kept apart from the game state so a change of look never
 *  touches the board (GB-FUN-080, GB-FUN-085) and needs no save-format migration. */

import { isMode, type Mode } from './tokens'

export const PREFS_KEY = 'goal-bingo:prefs'

/** "Show advanced tiles" (GB-FUN-076, D-2026-09-26-6): "In the cell" or "Open larger". */
export const ADVANCED_VIEWS = ['cell', 'open'] as const
export type AdvancedView = (typeof ADVANCED_VIEWS)[number]

export const ADVANCED_VIEW_LABELS: Record<AdvancedView, string> = {
  cell: 'In the cell',
  open: 'Open larger',
}

/** Provisional default (D-2026-09-26-9): the value that is readable on every screen. */
export const DEFAULT_ADVANCED_VIEW: AdvancedView = 'open'

export type Prefs = { mode: Mode; advancedTiles: AdvancedView }

function isAdvancedView(value: unknown): value is AdvancedView {
  return typeof value === 'string' && (ADVANCED_VIEWS as readonly string[]).includes(value)
}

/** A first run follows the device's color scheme (D-2026-09-26-9); after that the
 *  player's choice is kept. Unreadable or unknown values fall back per field. */
export function loadPrefs(storage: Storage | null, prefersDark: boolean): Prefs {
  const fallback: Prefs = { mode: prefersDark ? 'dark' : 'light', advancedTiles: DEFAULT_ADVANCED_VIEW }
  let raw: string | null = null
  try {
    raw = storage?.getItem(PREFS_KEY) ?? null
  } catch {
    return fallback
  }
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      mode: isMode(parsed.mode) ? parsed.mode : fallback.mode,
      advancedTiles: isAdvancedView(parsed.advancedTiles) ? parsed.advancedTiles : fallback.advancedTiles,
    }
  } catch {
    return fallback
  }
}

export function savePrefs(storage: Storage | null, prefs: Prefs): void {
  try {
    storage?.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // A full or blocked store loses only the preference, never the game.
  }
}
