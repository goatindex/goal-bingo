/** Light and dark modes as token sets on the same markup (GB-FUN-084, GB-FUN-086,
 *  D-2026-09-26-5), and the category cue palette indexed by list position (GB-FUN-070,
 *  D-2026-09-26-2). A further mode is another entry in MODES, not another renderer. */

export const MODES = ['light', 'dark'] as const
export type Mode = (typeof MODES)[number]

/** Palette slots: the seven default categories plus the one custom category slot. */
export const CATEGORY_SLOTS = 8

export type ModeTokens = {
  ground: string
  surface: string
  ink: string
  muted: string
  line: string
  bar: string
  track: string
  /** Accent for the active thumb-bar item, the clear moment and the intersection. */
  sun: string
  scrim: string
  chipBg: string
  chipFg: string
  chipSub: string
  chipPts: string
  warnBg: string
  warnFg: string
  /** Ink on a marked (category-filled) cell, the same in every mode. */
  markedInk: string
  markedShadow: string
  /** Fill of a marked cell and of the hold, by palette slot. */
  cat: readonly string[]
  /** The category cue on an unmarked cell, by palette slot: 3:1 against `surface`. */
  cue: readonly string[]
}

export const TOKENS: Record<Mode, ModeTokens> = {
  light: {
    ground: '#FFF4E4',
    surface: '#FFFFFF',
    ink: '#1E1537',
    muted: '#5E5577',
    line: '#EADBC4',
    bar: '#FFFFFF',
    track: '#F3E8D6',
    sun: '#FFC933',
    scrim: 'rgba(30, 21, 55, 0.45)',
    chipBg: '#1E1537',
    chipFg: '#FFF4E4',
    chipSub: '#D9CFF0',
    chipPts: '#FFC933',
    warnBg: '#FCE3D9',
    warnFg: '#7A2412',
    markedInk: '#1E1537',
    markedShadow: 'rgba(30, 21, 55, 0.3)',
    cat: ['#FF6B6B', '#4C8DFF', '#FFB224', '#2EC990', '#FF85BD', '#9B7BFF', '#1FC0DE', '#B8D640'],
    cue: ['#D93636', '#2563D9', '#A35F00', '#12805A', '#C2307A', '#7048E0', '#0A7A93', '#5A750D'],
  },
  dark: {
    ground: '#140F29',
    surface: '#231B42',
    ink: '#F6F1FF',
    muted: '#B9AFD8',
    line: '#3A2F63',
    bar: '#1B1436',
    track: '#3A2F63',
    sun: '#FFD24D',
    scrim: 'rgba(5, 3, 15, 0.62)',
    chipBg: '#FFD24D',
    chipFg: '#1E1537',
    chipSub: '#3B2E66',
    chipPts: '#1E1537',
    warnBg: '#5C2414',
    warnFg: '#FFE4D9',
    markedInk: '#1E1537',
    markedShadow: 'rgba(0, 0, 0, 0.45)',
    cat: ['#FF7A7A', '#6A9FFF', '#FFC043', '#43D6A0', '#FF96C8', '#AC90FF', '#3ACCE6', '#C6E25A'],
    cue: ['#FF7A7A', '#6A9FFF', '#FFC043', '#43D6A0', '#FF96C8', '#AC90FF', '#3ACCE6', '#C6E25A'],
  },
}

export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value)
}

/** A category's palette slot is its position in the player's category list, so a
 *  category added later receives a color with no style rule naming it. A category
 *  missing from the list (a goal left over from a removed custom category) gets -1,
 *  which renders with neutral tokens. */
export function categorySlot(categories: readonly string[], category: string): number {
  const index = categories.indexOf(category)
  return index < 0 ? -1 : index % CATEGORY_SLOTS
}

/** Every token as a CSS custom property, for the document root. */
export function modeProperties(mode: Mode): Record<string, string> {
  const t = TOKENS[mode]
  const props: Record<string, string> = {}
  for (const [key, value] of Object.entries(t)) {
    if (typeof value === 'string') props[`--${key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}`] = value
  }
  t.cat.forEach((value, i) => (props[`--cat-${i}`] = value))
  t.cue.forEach((value, i) => (props[`--cue-${i}`] = value))
  return props
}

export function applyMode(
  root: { style: { setProperty(name: string, value: string): void }; dataset: DOMStringMap },
  mode: Mode,
): void {
  for (const [name, value] of Object.entries(modeProperties(mode))) root.style.setProperty(name, value)
  root.dataset.mode = mode
}

/** WCAG relative-luminance contrast between two `#rrggbb` colors. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const n = parseInt(hex.slice(1), 16)
    const channel = (c: number) => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  }
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}
