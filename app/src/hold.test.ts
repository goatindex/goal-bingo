import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOLDING_CLASS, HOLD_MS, attachHold, type HoldEvent, type HoldTarget } from './hold'

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
    let prevented = false
    const event: HoldEvent = { ...init, preventDefault: () => (prevented = true) }
    for (const listener of listeners.get(type) ?? []) listener(event)
    return prevented
  }
  return { target, fire, classes }
}

describe('press-and-hold marking (GB-FUN-009, D-2026-09-26-4)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('completes once when the press is held through the hold duration', () => {
    const { target, fire, classes } = fakeTarget()
    const onComplete = vi.fn()
    attachHold(target, { onComplete })
    fire('pointerdown', { button: 0 })
    expect(classes.has(HOLDING_CLASS)).toBe(true)
    vi.advanceTimersByTime(HOLD_MS)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(classes.has(HOLDING_CLASS)).toBe(false)
    fire('pointerup')
    vi.advanceTimersByTime(HOLD_MS)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('does nothing but report early when the press ends before the hold duration', () => {
    for (const end of ['pointerup', 'pointerleave', 'pointercancel']) {
      const { target, fire, classes } = fakeTarget()
      const onComplete = vi.fn()
      const onEarly = vi.fn()
      attachHold(target, { onComplete, onEarly })
      fire('pointerdown', { button: 0 })
      vi.advanceTimersByTime(HOLD_MS - 1)
      fire(end)
      vi.advanceTimersByTime(HOLD_MS)
      expect(onComplete).not.toHaveBeenCalled()
      expect(onEarly).toHaveBeenCalledTimes(1)
      expect(classes.has(HOLDING_CLASS)).toBe(false)
    }
  })

  it('ignores a second button and a pointer that was never pressed', () => {
    const { target, fire } = fakeTarget()
    const onComplete = vi.fn()
    const onEarly = vi.fn()
    attachHold(target, { onComplete, onEarly })
    fire('pointerdown', { button: 2 })
    fire('pointerup')
    vi.advanceTimersByTime(HOLD_MS)
    expect(onComplete).not.toHaveBeenCalled()
    expect(onEarly).not.toHaveBeenCalled()
  })

  it('holds from the keyboard with Space or Enter, ignoring key repeat', () => {
    const { target, fire } = fakeTarget()
    const onComplete = vi.fn()
    attachHold(target, { onComplete })
    expect(fire('keydown', { key: ' ', repeat: false })).toBe(true)
    vi.advanceTimersByTime(HOLD_MS / 2)
    fire('keydown', { key: ' ', repeat: true })
    vi.advanceTimersByTime(HOLD_MS / 2)
    expect(onComplete).toHaveBeenCalledTimes(1)
    fire('keydown', { key: 'a' })
    vi.advanceTimersByTime(HOLD_MS)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('suppresses the long-press context menu', () => {
    const { target, fire } = fakeTarget()
    attachHold(target, { onComplete: () => {} })
    expect(fire('contextmenu')).toBe(true)
  })
})
