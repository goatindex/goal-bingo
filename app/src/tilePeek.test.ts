/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOLD_MS, TAP_MS, attachHold, type HoldEvent, type HoldTarget } from './hold'
import { PEEK_CLASS, clearTilePeek, getTilePeek, setTilePeek, toggleTilePeek } from './tilePeek'

describe('tile peek', () => {
  let root: HTMLElement

  beforeEach(() => {
    root = document.createElement('div')
    root.innerHTML =
      '<button type="button" class="board-cell" data-testid="board-cell-0" data-index="0">A</button>' +
      '<button type="button" class="board-cell" data-testid="board-cell-1" data-index="1">B</button>'
    document.body.appendChild(root)
  })

  afterEach(() => {
    clearTilePeek(root)
    root.remove()
  })

  it('adds peek class on set and clears on toggle off', () => {
    setTilePeek(root, 0)
    expect(getTilePeek()?.index).toBe(0)
    expect(root.querySelector('[data-testid="board-cell-0"]')!.classList.contains(PEEK_CLASS)).toBe(true)
    toggleTilePeek(root, 0)
    expect(getTilePeek()).toBeNull()
    expect(root.querySelector('[data-testid="board-cell-0"]')!.classList.contains(PEEK_CLASS)).toBe(false)
  })

  it('dismisses when a quick tap lands outside the peeked cell', () => {
    setTilePeek(root, 0)
    root.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    root.querySelector('[data-testid="board-cell-1"]')!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(getTilePeek()).toBeNull()
  })
})

describe('hold quick tap vs early release', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  function fakeTarget() {
    const listeners = new Map<string, ((event: HoldEvent) => void)[]>()
    const classes = new Set<string>()
    const target: HoldTarget = {
      addEventListener: (type, listener) => {
        listeners.set(type, [...(listeners.get(type) ?? []), listener])
      },
      classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) },
    }
    const fire = (type: string, init: Partial<HoldEvent> = {}) => {
      const event: HoldEvent = { ...init, preventDefault: () => {} }
      for (const listener of listeners.get(type) ?? []) listener(event)
    }
    return { target, fire }
  }

  it('calls onQuickTap instead of onEarly for a short press', () => {
    const { target, fire } = fakeTarget()
    const onQuickTap = vi.fn()
    const onEarly = vi.fn()
    attachHold(target, { onComplete: vi.fn(), onEarly, onQuickTap })
    fire('pointerdown', { button: 0 })
    vi.advanceTimersByTime(TAP_MS)
    fire('pointerup')
    expect(onQuickTap).toHaveBeenCalledTimes(1)
    expect(onEarly).not.toHaveBeenCalled()
  })

  it('calls onEarly when the press ends after TAP_MS but before HOLD_MS', () => {
    const { target, fire } = fakeTarget()
    const onQuickTap = vi.fn()
    const onEarly = vi.fn()
    attachHold(target, { onComplete: vi.fn(), onEarly, onQuickTap })
    fire('pointerdown', { button: 0 })
    vi.advanceTimersByTime(TAP_MS + 1)
    fire('pointerup')
    expect(onQuickTap).not.toHaveBeenCalled()
    expect(onEarly).toHaveBeenCalledTimes(1)
  })
})
