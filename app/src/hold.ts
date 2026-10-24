/** Press-and-hold marking (GB-FUN-009, D-2026-09-26-4). A press held for HOLD_MS
 *  completes once; a press released, cancelled or dragged off before then does
 *  nothing but report itself as early. The fill is CSS driven by the `is-holding`
 *  class, so a hold needs no repaint until it completes. */

/** Provisional (Q25): the hold duration is open; this is the one constant to tune. */
export const HOLD_MS = 600

/** A release before this counts as a quick tap (peek), not an early hold release. */
export const TAP_MS = 250

export const HOLDING_CLASS = 'is-holding'

type Listener = (event: HoldEvent) => void
export type HoldEvent = { key?: string; repeat?: boolean; button?: number; preventDefault(): void }
export type HoldTarget = {
  addEventListener(type: string, listener: Listener): void
  classList: { add(name: string): void; remove(name: string): void }
}

export type HoldOptions = {
  onComplete: () => void
  onEarly?: () => void
  /** Fired when the press ends before the hold completes within TAP_MS. */
  onQuickTap?: () => void
  ms?: number
}

function isHoldKey(event: HoldEvent): boolean {
  return event.key === ' ' || event.key === 'Enter'
}

export function attachHold(target: HoldTarget, options: HoldOptions): void {
  const ms = options.ms ?? HOLD_MS
  let timer: ReturnType<typeof setTimeout> | null = null
  let pressedAt = 0

  const start = () => {
    if (timer !== null) return
    pressedAt = Date.now()
    target.classList.add(HOLDING_CLASS)
    timer = setTimeout(() => {
      timer = null
      target.classList.remove(HOLDING_CLASS)
      options.onComplete()
    }, ms)
  }
  const stop = () => {
    if (timer === null) return
    const elapsed = Date.now() - pressedAt
    clearTimeout(timer)
    timer = null
    target.classList.remove(HOLDING_CLASS)
    if (options.onQuickTap && elapsed <= TAP_MS) options.onQuickTap()
    else options.onEarly?.()
  }

  target.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return
    start()
  })
  target.addEventListener('pointerup', stop)
  target.addEventListener('pointerleave', stop)
  target.addEventListener('pointercancel', stop)
  target.addEventListener('keydown', (event) => {
    if (!isHoldKey(event)) return
    event.preventDefault()
    if (!event.repeat) start()
  })
  target.addEventListener('keyup', (event) => {
    if (!isHoldKey(event)) return
    event.preventDefault()
    stop()
  })
  // A long press would otherwise open the browser's context menu mid-hold.
  target.addEventListener('contextmenu', (event) => event.preventDefault())
}
