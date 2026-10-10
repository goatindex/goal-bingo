/** Quick-tap enlargement on board cells for reading small goal text. */

import { TAP_MS } from './hold'

export const PEEK_SCALE = 1.5
export const PEEK_CLASS = 'board-cell--peek'

export type PeekTarget = { index: number }

let peek: PeekTarget | null = null
let dismissDownAt = 0
let dismissRoot: HTMLElement | null = null

function peekElement(root: HTMLElement): HTMLElement | null {
  if (peek === null) return null
  return root.querySelector<HTMLElement>(`[data-testid="board-cell-${peek.index}"]`)
}

function removeDismissListeners(): void {
  if (!dismissRoot) return
  dismissRoot.removeEventListener('pointerdown', onDismissPointerDown, true)
  dismissRoot.removeEventListener('pointerup', onDismissPointerUp, true)
  dismissRoot = null
}

function onDismissPointerDown(): void {
  dismissDownAt = Date.now()
}

function onDismissPointerUp(event: PointerEvent): void {
  if (peek === null || !dismissRoot) return
  const el = peekElement(dismissRoot)
  if (el?.contains(event.target as Node)) return
  if (Date.now() - dismissDownAt > TAP_MS) return
  clearTilePeek(dismissRoot)
}

function installDismissListeners(root: HTMLElement): void {
  if (dismissRoot === root) return
  removeDismissListeners()
  dismissRoot = root
  root.addEventListener('pointerdown', onDismissPointerDown, true)
  root.addEventListener('pointerup', onDismissPointerUp, true)
}

export function getTilePeek(): PeekTarget | null {
  return peek
}

export function clearTilePeek(root: HTMLElement): void {
  peekElement(root)?.classList.remove(PEEK_CLASS)
  peek = null
  removeDismissListeners()
}

export function setTilePeek(root: HTMLElement, index: number): void {
  clearTilePeek(root)
  peek = { index }
  peekElement(root)?.classList.add(PEEK_CLASS)
  installDismissListeners(root)
}

/** Quick tap on a holdable board cell: peek it, or dismiss if it is already peeked. */
export function toggleTilePeek(root: HTMLElement, index: number): void {
  if (peek?.index === index) clearTilePeek(root)
  else setTilePeek(root, index)
}

export function restoreTilePeek(root: HTMLElement, index: number | null): void {
  if (index === null) {
    clearTilePeek(root)
    return
  }
  peek = { index }
  peekElement(root)?.classList.add(PEEK_CLASS)
  installDismissListeners(root)
}
