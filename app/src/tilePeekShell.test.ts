/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TAP_MS } from './hold'
import { PEEK_CLASS } from './tilePeek'
import { renderShell, type BoardTarget, type ShellHandlers, type ShellView } from './shell'
import { freshState } from './storage'

function liveHandlers(
  refs: { view: ShellView; boardTarget: BoardTarget },
  overrides: Partial<ShellHandlers> = {},
): ShellHandlers {
  return {
    softReset: false,
    view: refs.view,
    emptyPoolPrompt: false,
    moment: null,
    prefs: { mode: 'system', advancedTiles: 'cell' },
    openTile: null,
    boardTarget: refs.boardTarget,
    actionNotice: null,
    completionNotice: null,
    onMarkCell: vi.fn(),
    onMarkMiniCell: vi.fn(),
    onNavigate: vi.fn(),
    onOpenTile: vi.fn(),
    onCloseTile: vi.fn(),
    onCancelBoardTarget: vi.fn(),
    onSetAdvancedView: vi.fn(),
    onSetMode: vi.fn(),
    onDismissActionNotice: vi.fn(),
    onDismissCompletionNotice: vi.fn(),
    onStartRecycle: vi.fn(),
    onStartSwap: vi.fn(),
    onStartPlace: vi.fn(),
    onDismissEmptyPrompt: vi.fn(),
    ...overrides,
  }
}

describe('board cell quick tap peek', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('enlarges on quick tap and clears after a hold completes', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const refs = { view: 'home' as const, boardTarget: { kind: 'mark' } as BoardTarget }
    const onMarkCell = vi.fn()
    renderShell(root, freshState(), liveHandlers(refs, { onMarkCell }))

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
