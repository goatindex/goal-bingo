/** Press-and-hold marking (GB-FUN-009, D-2026-09-26-4). A press held for HOLD_MS
 *  completes once; a press released, cancelled or dragged off before then does
 *  nothing but report itself as early. The fill is CSS driven by the `is-holding`
 *  class, so a hold needs no repaint until it completes. */

/** Provisional (Q25): the hold duration is open; this is the one constant to tune. */
export const HOLD_MS = 600

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
  ms?: number
}

function isHoldKey(event: HoldEvent): boolean {
  return event.key === ' ' || event.key === 'Enter'
}

export function attachHold(target: HoldTarget, options: HoldOptions): void {
  const ms = options.ms ?? HOLD_MS
  let timer: ReturnType<typeof setTimeout> | null = null

  const start = () => {
    if (timer !== null) return
    target.classList.add(HOLDING_CLASS)
    timer = setTimeout(() => {
      timer = null
      target.classList.remove(HOLDING_CLASS)
      options.onComplete()
    }, ms)
  }
  const stop = () => {
    if (timer === null) return
    clearTimeout(timer)
    timer = null
    target.classList.remove(HOLDING_CLASS)
    options.onEarly?.()
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
