import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES } from './categories'
import { CATEGORY_SLOTS, MODES, TOKENS, categorySlot, contrastRatio, modeProperties } from './tokens'

describe('category cue slot (GB-FUN-070)', () => {
  it('gives each default category its list position', () => {
    DEFAULT_CATEGORIES.forEach((category, i) => {
      expect(categorySlot(DEFAULT_CATEGORIES, category)).toBe(i)
    })
  })

  it('gives a custom category unlocked after the defaults the next palette slot', () => {
    const categories = [...DEFAULT_CATEGORIES, 'music']
    expect(categorySlot(categories, 'music')).toBe(7)
    expect(TOKENS.light.cat[7]).toBeDefined()
    expect(TOKENS.dark.cue[7]).toBeDefined()
  })

  it('gives a category missing from the list no slot', () => {
    expect(categorySlot(DEFAULT_CATEGORIES, 'gone')).toBe(-1)
  })
})

describe('modes are token sets (GB-FUN-084, GB-FUN-086)', () => {
  it('defines the same token names in every mode', () => {
    const names = MODES.map((mode) => Object.keys(modeProperties(mode)).sort())
    for (const set of names) expect(set).toEqual(names[0])
  })

  it('fills every category palette slot in every mode', () => {
    for (const mode of MODES) {
      expect(TOKENS[mode].cat).toHaveLength(CATEGORY_SLOTS)
      expect(TOKENS[mode].cue).toHaveLength(CATEGORY_SLOTS)
    }
  })
})

describe('contrast in both modes (GB-FUN-084)', () => {
  for (const mode of MODES) {
    const t = TOKENS[mode]
    it(`${mode}: every category cue is at least 3:1 against the cell`, () => {
      for (const cue of t.cue) expect(contrastRatio(cue, t.surface)).toBeGreaterThanOrEqual(3)
    })
    it(`${mode}: a marked cell's title is at least 4.5:1 on every category fill`, () => {
      for (const fill of t.cat) expect(contrastRatio(t.markedInk, fill)).toBeGreaterThanOrEqual(4.5)
    })
    it(`${mode}: text and muted text are at least 4.5:1 on the surface and the ground`, () => {
      for (const ground of [t.surface, t.ground]) {
        expect(contrastRatio(t.ink, ground)).toBeGreaterThanOrEqual(4.5)
        expect(contrastRatio(t.muted, ground)).toBeGreaterThanOrEqual(4.5)
      }
    })
    it(`${mode}: the clear moment's text is at least 4.5:1 on its chip`, () => {
      expect(contrastRatio(t.chipFg, t.chipBg)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(t.chipSub, t.chipBg)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(t.warnFg, t.warnBg)).toBeGreaterThanOrEqual(4.5)
    })
  }
})
