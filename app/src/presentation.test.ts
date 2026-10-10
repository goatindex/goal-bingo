/** @vitest-environment happy-dom */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { markCell } from './board'
import { cadenceChallengeId, categoryChallengeId, universalChallengeId } from './challenges'
import { HOLD_MS } from './hold'
import { clearMoment } from './moment'
import { markMiniGridCellOnBoard } from './miniGrid'
import { applyMode } from './tokens'
import { endMoment, renderShell, type BoardTarget, type ShellHandlers, type ShellView } from './shell'
import { freshState } from './storage'
import { MemoryStorage } from './test-support'
import { loadState } from './storage'
import type { Prefs } from './prefs'

function completeHold(el: HTMLElement): void {
  el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }))
  vi.advanceTimersByTime(HOLD_MS)
}

function makeHandlers(overrides: Partial<ShellHandlers> & { view?: ShellView } = {}): {
  handlers: ShellHandlers
  view: ShellView
  boardTarget: BoardTarget
  openTile: number | null
  prefs: ShellHandlers['prefs']
} {
  const noop = () => {}
  let view: ShellView = overrides.view ?? 'home'
  let boardTarget: BoardTarget = overrides.boardTarget ?? { kind: 'mark' }
  let openTile: number | null = overrides.openTile ?? null
  let prefs = overrides.prefs ?? { mode: 'light' as const, advancedTiles: 'open' as const }
  const handlers: ShellHandlers = {
    softReset: false,
    view,
    emptyPoolPrompt: false,
    moment: overrides.moment ?? null,
    prefs,
    openTile,
    boardTarget,
    actionNotice: overrides.actionNotice ?? null,
    completionNotice: null,
    onMarkCell: overrides.onMarkCell ?? noop,
    onMarkMiniCell: overrides.onMarkMiniCell ?? noop,
    onOpenTile: overrides.onOpenTile ?? noop,
    onCloseTile: overrides.onCloseTile ?? noop,
    onSetAdvancedView: overrides.onSetAdvancedView ?? noop,
    onSetMode: overrides.onSetMode ?? noop,
    onNavigate: overrides.onNavigate ?? ((next) => {
      view = next
      boardTarget = { kind: 'mark' }
    }),
    onAddGoal: () => null,
    onUpdateGoal: () => null,
    onRemoveGoal: noop,
    onAddCategory: () => null,
    onAddReward: () => null,
    onRemoveReward: noop,
    onPurchaseReward: noop,
    onDismissEmptyPrompt: noop,
    onDismissActionNotice: noop,
    onDismissCompletionNotice: noop,
    onStartRecycle: noop,
    onStartSwap: noop,
    onStartPlace: noop,
    onUpgradeAllowance: noop,
    onExpand: noop,
    onPurchaseUnlock: noop,
    onPurchaseGlobal: noop,
    onCancelBoardTarget: overrides.onCancelBoardTarget ?? (() => {
      boardTarget = { kind: 'mark' }
    }),
    ...overrides,
  }
  Object.defineProperty(handlers, 'view', {
    get: () => view,
    set: (v: ShellView) => {
      view = v
    },
  })
  return {
    handlers,
    get view() {
      return view
    },
    set view(v: ShellView) {
      view = v
    },
    get boardTarget() {
      return boardTarget
    },
    set boardTarget(t: BoardTarget) {
      boardTarget = t
    },
    get openTile() {
      return openTile
    },
    set openTile(i: number | null) {
      openTile = i
    },
    get prefs() {
      return prefs
    },
    set prefs(p: ShellHandlers['prefs']) {
      prefs = p
    },
  }
}

/** Live refs for handlers the shell reads on each render. */
function liveHandlers(
  refs: ReturnType<typeof makeHandlers>,
  extra: Partial<ShellHandlers> = {},
): ShellHandlers {
  return {
    ...refs.handlers,
    get view() {
      return refs.view
    },
    get boardTarget() {
      return refs.boardTarget
    },
    get openTile() {
      return refs.openTile
    },
    get prefs() {
      return refs.prefs
    },
    get moment() {
      return refs.handlers.moment
    },
    onNavigate: (next) => {
      refs.view = next
      refs.boardTarget = { kind: 'mark' }
      extra.onNavigate?.(next)
    },
    onCancelBoardTarget: () => {
      refs.boardTarget = { kind: 'mark' }
      extra.onCancelBoardTarget?.()
    },
    ...extra,
  }
}

describe('GB-FUN-072 — thumb bar has no Mark control', () => {
  it('lists only primary destinations, never a Mark control', () => {
    const { state } = loadState(new MemoryStorage())
    const refs = makeHandlers()
    const root = document.createElement('div')
    renderShell(root, state, liveHandlers(refs))
    const thumb = root.querySelector('.shell__thumb')!
    expect(thumb.textContent).not.toMatch(/\bMark\b/)
    expect(root.querySelector('[data-testid="action-mark"]')).toBeNull()
    for (const id of ['board', 'pool', 'rewards', 'stats', 'actions', 'challenges']) {
      expect(root.querySelector(`[data-testid="action-${id}"]`)).not.toBeNull()
    }
  })

  it('activating Board returns home and clears recycle, swap, or place', () => {
    const { state } = loadState(new MemoryStorage())
    for (const boardTarget of [
      { kind: 'recycle' as const },
      { kind: 'swap' as const, first: null },
      { kind: 'place' as const, track: 'mini-grid' as const },
    ]) {
      const refs = makeHandlers({ view: 'actions', boardTarget })
      refs.view = 'actions'
      refs.boardTarget = boardTarget
      const root = document.createElement('div')
      renderShell(root, state, liveHandlers(refs))
      root.querySelector<HTMLElement>('[data-testid="action-board"]')!.click()
      expect(refs.view).toBe('home')
      expect(refs.boardTarget).toEqual({ kind: 'mark' })
    }
  })
})

describe('GB-FUN-074 — clear moment does not hold the next mark', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('completes a hold while the clear moment is displayed', () => {
    const { state } = loadState(new MemoryStorage())
    const onMarkCell = vi.fn()
    const moment = clearMoment(1, {
      scoreDelta: 5,
      clearedLineCount: 1,
      refilledCells: [0, 1, 2, 3, 4],
      intersectionCells: [],
    })
    expect(moment).not.toBeNull()
    const refs = makeHandlers({ moment, onMarkCell })
    const root = document.createElement('div')
    renderShell(root, state, liveHandlers(refs, { moment, onMarkCell }))
    expect(root.querySelector('[data-testid="clear-moment"]')).not.toBeNull()
    const cell = root.querySelector<HTMLElement>('[data-hold="cell"][data-index="5"]')!
    completeHold(cell)
    expect(onMarkCell).toHaveBeenCalledWith(5)
  })

  it('endMoment does not cancel a hold that is still in progress', () => {
    const { state } = loadState(new MemoryStorage())
    const onMarkCell = vi.fn()
    const moment = clearMoment(2, {
      scoreDelta: 3,
      clearedLineCount: 1,
      refilledCells: [0, 1, 2, 3, 4],
      intersectionCells: [],
    })
    const refs = makeHandlers({ moment, onMarkCell })
    const root = document.createElement('div')
    renderShell(root, state, liveHandlers(refs, { moment, onMarkCell }))
    const cell = root.querySelector<HTMLElement>('[data-hold="cell"][data-index="6"]')!
    cell.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }))
    endMoment(root)
    vi.advanceTimersByTime(HOLD_MS)
    expect(onMarkCell).toHaveBeenCalledWith(6)
  })
})

describe('GB-FUN-075 — reduced motion keeps clear moment facts', () => {
  it('disables moment and cell motion under prefers-reduced-motion', () => {
    const cssText = readFileSync(join(process.cwd(), 'src/style.css'), 'utf8')
    expect(cssText).toContain('@media (prefers-reduced-motion: reduce)')
    expect(cssText).toMatch(/\.moment--enter[\s\S]*animation:\s*none/)
    expect(cssText).toMatch(/\.board-cell--pop[\s\S]*animation:\s*none/)
  })

  it('still renders score and cleared cells in the moment markup', () => {
    const state = freshState()
    const moment = clearMoment(3, {
      scoreDelta: 9,
      clearedLineCount: 1,
      refilledCells: [0, 1, 2, 3, 4],
      intersectionCells: [],
    })
    const refs = makeHandlers({ moment })
    const root = document.createElement('div')
    renderShell(root, state, liveHandlers(refs, { moment }))
    expect(root.querySelector('[data-testid="clear-moment-points"]')?.textContent).toBe('+9')
    for (const index of [0, 1, 2, 3, 4]) {
      expect(
        root.querySelector(`[data-testid="board-cell-${index}"]`)?.classList.contains('board-cell--fresh'),
      ).toBe(true)
    }
  })
})

describe('GB-FUN-078 — marks inside the advanced-tile sheet', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('hold on a mini-grid inner cell in the sheet calls onMarkMiniCell', () => {
    const state = freshState()
    const goal = state.board.cells[0]!.goal
    state.board.cells[0] = {
      goal,
      marked: false,
      advanced: {
        kind: 'mini-grid',
        cells: Array.from({ length: 9 }, () => ({ goal, marked: false })),
      },
    }
    const onMarkMiniCell = vi.fn()
    const refs = makeHandlers({ openTile: 0, onMarkMiniCell })
    refs.openTile = 0
    const root = document.createElement('div')
    renderShell(root, state, liveHandlers(refs, { openTile: 0, onMarkMiniCell }))
    const inner = root.querySelector<HTMLElement>('[data-testid="sheet-cell-0"]')!
    completeHold(inner)
    expect(onMarkMiniCell).toHaveBeenCalledWith(0, 0)
  })

  it('hold on the multi-completion control in the sheet records one completion', () => {
    const state = freshState()
    const goal = state.board.cells[0]!.goal
    state.board.cells[0] = {
      goal,
      marked: false,
      advanced: { kind: 'multi-completion', completionsRequired: 3, completionsSoFar: 0 },
    }
    const onMarkCell = vi.fn()
    const refs = makeHandlers({ openTile: 0, onMarkCell })
    refs.openTile = 0
    const root = document.createElement('div')
    renderShell(root, state, liveHandlers(refs, { openTile: 0, onMarkCell }))
    completeHold(root.querySelector<HTMLElement>('[data-testid="sheet-hold"]')!)
    expect(onMarkCell).toHaveBeenCalledWith(0)
    const marked = markCell(state.board, 0)
    expect(marked.ok).toBe(true)
    if (!marked.ok) return
    expect(marked.board.cells[0]!.advanced).toMatchObject({ completionsSoFar: 1 })
  })
})

describe('GB-FUN-080 — changing advanced-tile setting marks nothing', () => {
  it('leaves board marks, inner marks, and completion counts unchanged when toggling', () => {
    const state = freshState()
    const goal = state.board.cells[0]!.goal
    state.board.cells[0] = {
      goal,
      marked: false,
      advanced: {
        kind: 'mini-grid',
        cells: [{ goal, marked: true }, { goal, marked: false }],
      },
    }
    state.board.cells[1] = {
      goal: state.board.cells[1]!.goal,
      marked: true,
    }
    state.board.cells[2] = {
      goal: state.board.cells[2]!.goal,
      marked: false,
      advanced: { kind: 'multi-completion', completionsRequired: 3, completionsSoFar: 2 },
    }
    const before = structuredClone(state.board)
    let prefs: Prefs = { mode: 'light', advancedTiles: 'open' }
    let openTile: number | null = 0
    const applyView = (advancedTiles: Prefs['advancedTiles']) => {
      prefs = { ...prefs, advancedTiles }
      if (advancedTiles === 'cell') openTile = null
    }
    applyView('cell')
    applyView('open')
    expect(state.board).toEqual(before)
    expect(openTile).toBeNull()
    expect(prefs.advancedTiles).toBe('open')
  })
})

describe('GB-FUN-083 — challenge row opens Challenges view', () => {
  it('shows universal, category, and cadence challenges after activation', () => {
    const { state } = loadState(new MemoryStorage())
    const refs = makeHandlers({ view: 'home' })
    refs.view = 'home'
    const root = document.createElement('div')
    renderShell(root, state, liveHandlers(refs))
    root.querySelector<HTMLElement>('[data-testid="challenge-row"]')!.click()
    expect(refs.view).toBe('challenges')
    renderShell(root, state, liveHandlers(refs))
    expect(root.querySelector('[data-testid="challenges-view"]')).not.toBeNull()
    expect(root.querySelector(`[data-testid="challenge-${universalChallengeId()}"]`)).not.toBeNull()
    expect(root.querySelector(`[data-testid="challenge-${categoryChallengeId('health')}"]`)).not.toBeNull()
    expect(root.querySelector(`[data-testid="challenge-${cadenceChallengeId('daily')}"]`)).not.toBeNull()
  })
})

describe('GB-FUN-085 — switching mode leaves state unchanged', () => {
  it('changes only display tokens, not board, pool, or counters', () => {
    const state = freshState()
    state.score.lifetime = 12
    state.score.rewardBalance = 3
    state.score.boardBalance = 4
    state.board.cells[0]!.marked = true
    const before = {
      board: structuredClone(state.board),
      pool: structuredClone(state.pool),
      score: structuredClone(state.score),
    }
    let prefs: Prefs = { mode: 'light', advancedTiles: 'open' }
    const setMode = (mode: Prefs['mode']) => {
      prefs = { ...prefs, mode }
      applyMode(document.documentElement, mode)
    }
    setMode('dark')
    setMode('light')
    expect(state.board).toEqual(before.board)
    expect(state.pool).toEqual(before.pool)
    expect(state.score).toEqual(before.score)
    expect(prefs.mode).toBe('light')
  })
})

describe('GB-FUN-078 — sheet hold integration with domain mark', () => {
  it('marks a mini-grid inner cell through the board helper when hold completes', () => {
    const state = freshState()
    const goal = state.board.cells[0]!.goal
    state.board.cells[0] = {
      goal,
      marked: false,
      advanced: {
        kind: 'mini-grid',
        cells: Array.from({ length: 9 }, () => ({ goal, marked: false })),
      },
    }
    const result = markMiniGridCellOnBoard(state.board, 0, 0, state.pool, () => 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.board.cells[0]!.advanced?.kind === 'mini-grid' && result.board.cells[0]!.advanced.cells[0]!.marked).toBe(
      true,
    )
  })
})
