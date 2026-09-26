import { describe, expect, it } from 'vitest'
import type { Cell } from './board'
import { DEFAULT_CATEGORIES } from './categories'
import { cellBehaviour, cellLabel, cueStyle, emptyPoolPromptHtml, type BoardTarget } from './shell'

describe('empty pool prompt (GB-FUN-065)', () => {
  it('shows the edit-pool prompt when a draw was refused', () => {
    const html = emptyPoolPromptHtml(true)
    expect(html).toContain('data-testid="empty-pool-prompt"')
    expect(html).toContain('add a goal before drawing')
  })

  it('shows nothing when the pool can still draw', () => {
    expect(emptyPoolPromptHtml(false)).toBe('')
  })
})

const goal = { id: 'g', title: 'Read for 20 minutes', category: 'study', cadence: 'daily' as const }
const plain: Cell = { goal, marked: false }
const marked: Cell = { goal, marked: true }
const multi: Cell = {
  goal,
  marked: false,
  advanced: { kind: 'multi-completion', completionsRequired: 3, completionsSoFar: 1 },
}
const mini: Cell = {
  goal,
  marked: false,
  advanced: { kind: 'mini-grid', cells: Array.from({ length: 9 }, (_, k) => ({ goal, marked: k < 2 })) },
}
const mark: BoardTarget = { kind: 'mark' }

describe('what a press on a cell does (GB-FUN-009, GB-FUN-072, GB-FUN-077, GB-FUN-079)', () => {
  it('holds an unmarked ordinary cell to mark it, under either setting', () => {
    expect(cellBehaviour(plain, mark, 'open')).toBe('hold')
    expect(cellBehaviour(plain, mark, 'cell')).toBe('hold')
  })

  it('does nothing on a marked cell', () => {
    expect(cellBehaviour(marked, mark, 'open')).toBe('none')
    expect(cellBehaviour({ ...mini, marked: true }, mark, 'cell')).toBe('none')
  })

  it('opens an unmarked advanced tile under "Open larger" rather than marking it', () => {
    expect(cellBehaviour(multi, mark, 'open')).toBe('open')
    expect(cellBehaviour(mini, mark, 'open')).toBe('open')
  })

  it("under 'In the cell' holds a multi-completion tile and a mini-grid's inner cells", () => {
    expect(cellBehaviour(multi, mark, 'cell')).toBe('hold')
    expect(cellBehaviour(mini, mark, 'cell')).toBe('inner-holds')
  })

  it('takes a tap on every cell while recycle, swap or place is armed', () => {
    const targets: BoardTarget[] = [
      { kind: 'recycle' },
      { kind: 'swap', first: null },
      { kind: 'place', track: 'mini-grid' },
    ]
    for (const target of targets) {
      for (const cell of [plain, marked, multi, mini]) {
        expect(cellBehaviour(cell, target, 'open')).toBe('tap')
      }
    }
  })
})

describe('category cue on the cell (GB-FUN-069, GB-FUN-070)', () => {
  it("points at the palette slot for the category's list position", () => {
    expect(cueStyle(DEFAULT_CATEGORIES, 'study')).toContain('var(--cat-1)')
    expect(cueStyle(DEFAULT_CATEGORIES, 'study')).toContain('var(--cue-1)')
    expect(cueStyle([...DEFAULT_CATEGORIES, 'music'], 'music')).toContain('var(--cue-7)')
  })

  it('falls back to neutral tokens for a category missing from the list', () => {
    expect(cueStyle(DEFAULT_CATEGORIES, 'gone')).toBe('')
  })
})

describe('cell label for assistive technology', () => {
  it('names the goal and its category, and says when it is marked', () => {
    expect(cellLabel(plain, 'study')).toBe('Read for 20 minutes, study')
    expect(cellLabel(marked, 'study')).toBe('Read for 20 minutes, study, marked')
  })

  it("reads an advanced tile's progress", () => {
    expect(cellLabel(multi, 'study')).toBe('Read for 20 minutes, study, 1 of 3 done')
    expect(cellLabel(mini, 'study')).toBe('Read for 20 minutes, study, mini-grid, 2 of 9 done')
  })
})
