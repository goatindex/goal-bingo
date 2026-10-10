/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TAP_MS } from './hold'
import { PEEK_CLASS } from './tilePeek'
import { renderShell, type ShellHandlers } from './shell'
import { freshState } from './storage'
import type { Prefs } from './prefs'

function shellHandlers(overrides: Partial<ShellHandlers> = {}): ShellHandlers {
  const noop = () => {}
  return {
    softReset: false,
    view: 'home',
    emptyPoolPrompt: false,
    moment: null,
    prefs: { mode: 'light', advancedTiles: 'cell' } satisfies Prefs,
    openTile: null,
    boardTarget: { kind: 'mark' },
    actionNotice: null,
    completionNotice: null,
    onMarkCell: noop,
    onMarkMiniCell: noop,
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
}

describe('board cell quick tap peek', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('enlarges on quick tap and clears after a hold completes', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const onMarkCell = vi.fn()
    renderShell(root, freshState(), shellHandlers({ onMarkCell }))

    const cell = root.querySelector<HTMLElement>('[data-hold="cell"][data-index="0"]')!
    cell.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }))
    vi.advanceTimersByTime(TAP_MS)
    cell.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(cell.classList.contains(PEEK_CLASS)).toBe(true)

    cell.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }))
    vi.advanceTimersByTime(600)
    expect(onMarkCell).toHaveBeenCalledWith(0)
    expect(cell.classList.contains(PEEK_CLASS)).toBe(false)
    root.remove()
  })
})
