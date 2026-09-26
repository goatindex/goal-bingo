import { describe, expect, it } from 'vitest'
import { DEFAULT_ADVANCED_VIEW, PREFS_KEY, loadPrefs, savePrefs } from './prefs'
import { MemoryStorage } from './test-support'

describe('display preferences (GB-FUN-081, D-2026-09-26-9)', () => {
  it('keeps the chosen advanced-tile value and mode across a restart', () => {
    const storage = new MemoryStorage()
    savePrefs(storage, { mode: 'dark', advancedTiles: 'cell' })
    expect(loadPrefs(storage, false)).toEqual({ mode: 'dark', advancedTiles: 'cell' })
  })

  it('follows the device color scheme on a first run', () => {
    expect(loadPrefs(new MemoryStorage(), true).mode).toBe('dark')
    expect(loadPrefs(new MemoryStorage(), false).mode).toBe('light')
    expect(loadPrefs(new MemoryStorage(), false).advancedTiles).toBe(DEFAULT_ADVANCED_VIEW)
  })

  it('falls back per field on unreadable or unknown values', () => {
    const storage = new MemoryStorage()
    storage.setItem(PREFS_KEY, '{not-json')
    expect(loadPrefs(storage, true)).toEqual({ mode: 'dark', advancedTiles: DEFAULT_ADVANCED_VIEW })
    storage.setItem(PREFS_KEY, JSON.stringify({ mode: 'sepia', advancedTiles: 'cell' }))
    expect(loadPrefs(storage, false)).toEqual({ mode: 'light', advancedTiles: 'cell' })
  })

  it('never writes to the game state key', () => {
    const storage = new MemoryStorage()
    savePrefs(storage, { mode: 'light', advancedTiles: 'open' })
    expect(storage.length).toBe(1)
    expect(storage.key(0)).toBe(PREFS_KEY)
  })
})
