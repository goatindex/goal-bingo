import type { GameState } from './storage'

const PRIMARY_ACTIONS = [
  { id: 'mark', label: 'Mark' },
  { id: 'board', label: 'Board' },
  { id: 'balance', label: 'Balance' },
  { id: 'recycle', label: 'Recycle' },
] as const

export function renderShell(
  root: HTMLElement,
  state: GameState,
  opts: { softReset: boolean; onMarkPlaceholder: () => void },
): void {
  root.innerHTML = `
    <div class="shell">
      <header class="shell__header">
        <p class="shell__brand">Goal Bingo</p>
        <p class="shell__tag">Your goals. Your board.</p>
      </header>

      <main class="shell__main">
        ${
          opts.softReset
            ? `<p class="shell__banner" role="status">Saved data could not be read. Starting fresh with a starter pool.</p>`
            : ''
        }
        <section class="shell__status" aria-label="Local status">
          <p>Pool: <strong data-testid="pool-count">${state.pool.length}</strong> goals</p>
          <p>Lifetime: <strong data-testid="lifetime">${state.score.lifetime}</strong></p>
          <p class="shell__hint">No account. Works offline. Data stays on this device.</p>
        </section>

        <section class="shell__placeholder" aria-label="Board placeholder">
          <button type="button" class="cell-placeholder" data-testid="mark-cell">
            Tap to mark (placeholder)
          </button>
        </section>
      </main>

      <nav class="shell__thumb" aria-label="Primary actions">
        ${PRIMARY_ACTIONS.map(
          (a) =>
            `<button type="button" class="thumb-btn" data-action="${a.id}" data-testid="action-${a.id}">${a.label}</button>`,
        ).join('')}
      </nav>
    </div>
  `

  root.querySelector('[data-testid="mark-cell"]')?.addEventListener('click', () => {
    opts.onMarkPlaceholder()
  })
}
