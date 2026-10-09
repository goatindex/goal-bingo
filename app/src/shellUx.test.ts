/** @vitest-environment happy-dom */
import { describe, expect, it } from 'vitest'
import { renderShell, type ShellHandlers, type ShellView } from './shell'
import { MemoryStorage } from './test-support'
import { loadState } from './storage'

function noopHandlers(view: ShellView = 'home'): ShellHandlers {
  const noop = () => {}
  return {
    softReset: false,
    view,
    emptyPoolPrompt: false,
    moment: null,
    prefs: { mode: 'light', advancedTiles: 'open' },
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
  }
}

describe('UX shell (WP-15–16, WP-19)', () => {
  it('renders category legend and balance hint on home', () => {
    const { state } = loadState(new MemoryStorage())
    const root = document.createElement('div')
    renderShell(root, state, noopHandlers('home'))
    expect(root.innerHTML).toContain('data-testid="category-legend"')
    expect(root.innerHTML).toContain('data-testid="balance-hint"')
    expect(root.innerHTML).toContain('home-layout')
  })

  it('shows cancel when a board target is armed', () => {
    const { state } = loadState(new MemoryStorage())
    const root = document.createElement('div')
    const h = noopHandlers('home')
    h.boardTarget = { kind: 'recycle' }
    renderShell(root, state, h)
    expect(root.innerHTML).toContain('data-testid="cancel-board-target"')
  })

  it('uses sidebar nav markup and ui forms on pool view', () => {
    const { state } = loadState(new MemoryStorage())
    const root = document.createElement('div')
    renderShell(root, state, noopHandlers('pool'))
    expect(root.innerHTML).toContain('shell__aside-nav')
    expect(root.innerHTML).toContain('data-testid="add-goal-form"')
    expect(root.innerHTML).toContain('ui-form')
  })
})
