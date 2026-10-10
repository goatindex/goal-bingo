/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { markCell, type Board } from './board'
import { attachHold, HOLD_MS, type HoldEvent, type HoldTarget } from './hold'
import { clearMoment } from './moment'
import { markMiniGridCellOnBoard } from './miniGrid'
import { renderShell, type BoardTarget, type ShellHandlers, type ShellView } from './shell'
import { freshState, loadState } from './storage'
import { MemoryStorage } from './test-support'
import type { Prefs } from './prefs'

function fakeHoldTarget() {
  const listeners = new Map<string, ((event: HoldEvent) => void)[]>()
  const target: HoldTarget = {
    addEventListener: (type, listener) => {
      listeners.set(type, [...(listeners.get(type) ?? []), listener])
    },
    classList: { add: () => {}, remove: () => {} },
  }
  const fire = (type: string, init: Partial<HoldEvent> = {}) => {
    const event: HoldEvent = { ...init, preventDefault: () => {} }
    for (const listener of listeners.get(type) ?? []) listener(event)
  }
  return { target, fire }
}

function completeHold(el: HTMLElement): void {
  el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }))
  vi.advanceTimersByTime(HOLD_MS)
}

function liveHandlers(
  refs: {
    view: ShellView
    boardTarget: BoardTarget
    openTile: number | null
    prefs: ShellHandlers['prefs']
    handlers: ShellHandlers
  },
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
    ...extra,
  }
}

function shellRefs(overrides: Partial<ShellHandlers> = {}) {
  const noop = () => {}
  const refs = {
    view: 'home' as ShellView,
    boardTarget: { kind: 'mark' } as BoardTarget,
    openTile: null as number | null,
    prefs: { mode: 'light', advancedTiles: 'open' } as Prefs,
    handlers: {} as ShellHandlers,
  }
  refs.handlers = {
    softReset: false,
    get view() {
      return refs.view
    },
    emptyPoolPrompt: false,
    moment: overrides.moment ?? null,
    prefs: refs.prefs,
    openTile: refs.openTile,
    boardTarget: refs.boardTarget,
    actionNotice: null,
    completionNotice: null,
    onMarkCell: overrides.onMarkCell ?? noop,
    onMarkMiniCell: overrides.onMarkMiniCell ?? noop,
    onOpenTile: noop,
    onCloseTile: noop,
    onSetAdvancedView: noop,
    onSetMode: noop,
    onNavigate: noop,
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
    onCancelBoardTarget: noop,
    ...overrides,
  }
  return refs
}

describe('GB-FUN-009 — marking requires only player input', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('completes a mark only after the full hold duration on the board', () => {
    const { state } = loadState(new MemoryStorage())
    const onMarkCell = vi.fn()
    const refs = shellRefs({ onMarkCell })
    const root = document.createElement('div')
    renderShell(root, state, liveHandlers(refs, { onMarkCell }))
    completeHold(root.querySelector<HTMLElement>('[data-hold="cell"][data-index="0"]')!)
    expect(onMarkCell).toHaveBeenCalledTimes(1)
    expect(onMarkCell).toHaveBeenCalledWith(0)
  })

  it('leaves the cell unmarked when the press ends before the hold duration', () => {
    const { state } = loadState(new MemoryStorage())
    const onMarkCell = vi.fn()
    const refs = shellRefs({ onMarkCell })
    const root = document.createElement('div')
    renderShell(root, state, liveHandlers(refs, { onMarkCell }))
    const cell = root.querySelector<HTMLElement>('[data-hold="cell"][data-index="1"]')!
    cell.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }))
    vi.advanceTimersByTime(HOLD_MS - 1)
    cell.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    vi.advanceTimersByTime(HOLD_MS)
    expect(onMarkCell).not.toHaveBeenCalled()
  })

  it('marks a mini-grid inner cell through the same hold path under "In the cell"', () => {
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
    const refs = shellRefs({ onMarkMiniCell })
    refs.prefs = { mode: 'light', advancedTiles: 'cell' as const }
    const root = document.createElement('div')
    renderShell(root, state, liveHandlers(refs, { onMarkMiniCell, prefs: refs.prefs }))
    completeHold(root.querySelector<HTMLElement>('[data-hold="mini"]')!)
    expect(onMarkMiniCell).toHaveBeenCalledWith(0, 0)
  })

})

describe('GB-FUN-014 — intersection focal point of a clear moment', () => {
  it('renders the shared cell with board-cell--intersection on a double clear', () => {
    const { state } = loadState(new MemoryStorage())
    const intersection = 12
    const refilled = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17, 22, 27]
    const moment = clearMoment(1, {
      scoreDelta: 27,
      clearedLineCount: 2,
      refilledCells: refilled,
      intersectionCells: [intersection],
    })
    expect(moment?.intersection).toEqual([intersection])
    const refs = shellRefs({ moment })
    const root = document.createElement('div')
    renderShell(root, state, liveHandlers(refs, { moment }))
    const shared = root.querySelector(`[data-testid="board-cell-${intersection}"]`)!
    expect(shared.classList.contains('board-cell--intersection')).toBe(true)
    expect(shared.classList.contains('board-cell--fresh')).toBe(true)
    const other = refilled.find((i) => i !== intersection)!
    const plain = root.querySelector(`[data-testid="board-cell-${other}"]`)!
    expect(plain.classList.contains('board-cell--fresh')).toBe(true)
    expect(plain.classList.contains('board-cell--intersection')).toBe(false)
    expect(root.querySelector('[data-testid="clear-moment"]')?.textContent).toContain('Double clear')
  })
})

describe('GB-FUN-045 — multi-completion requires press-and-holds', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  function boardWithMulti(n: number): Board {
    const state = freshState()
    const cells = state.board.cells.slice()
    cells[0] = {
      ...cells[0]!,
      advanced: { kind: 'multi-completion', completionsRequired: n, completionsSoFar: 0 },
    }
    return { ...state.board, cells }
  }

  it('records no completion when the press ends before the hold duration', () => {
    let board = boardWithMulti(3)
    const { target, fire } = fakeHoldTarget()
    attachHold(target, {
      onComplete: () => {
        const result = markCell(board, 0)
        if (result.ok) board = result.board
      },
    })
    fire('pointerdown', { button: 0 })
    vi.advanceTimersByTime(HOLD_MS - 1)
    fire('pointerup')
    vi.advanceTimersByTime(HOLD_MS)
    expect(board.cells[0]!.marked).toBe(false)
    expect(board.cells[0]!.advanced).toMatchObject({ completionsSoFar: 0 })
  })

  it('marks only after N full holds', () => {
    let board = boardWithMulti(3)
    for (let i = 0; i < 2; i++) {
      const result = markCell(board, 0)
      expect(result.ok).toBe(true)
      if (!result.ok) return
      board = result.board
      expect(board.cells[0]!.marked).toBe(false)
    }
    const last = markCell(board, 0)
    expect(last.ok).toBe(true)
    if (!last.ok) return
    expect(last.board.cells[0]!.marked).toBe(true)
  })

  it('does not call onMarkCell for an early release on the sheet hold control', () => {
    const state = freshState()
    const goal = state.board.cells[0]!.goal
    state.board.cells[0] = {
      goal,
      marked: false,
      advanced: { kind: 'multi-completion', completionsRequired: 3, completionsSoFar: 0 },
    }
    const onMarkCell = vi.fn()
    const refs = shellRefs({ onMarkCell, openTile: 0 })
    refs.openTile = 0
    const root = document.createElement('div')
    renderShell(root, state, liveHandlers(refs, { onMarkCell, openTile: 0 }))
    const hold = root.querySelector<HTMLElement>('[data-testid="sheet-hold"]')!
    hold.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }))
    vi.advanceTimersByTime(HOLD_MS - 1)
    hold.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(onMarkCell).not.toHaveBeenCalled()
  })
})

describe('GB-FUN-009 — mini-grid inner mark (domain)', () => {
  it('marks an inner cell when the hold completes', () => {
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
    const advanced = result.board.cells[0]!.advanced
    expect(advanced?.kind === 'mini-grid' && advanced.cells[0]!.marked).toBe(true)
  })
})
