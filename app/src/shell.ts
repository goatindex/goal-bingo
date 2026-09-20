import type { GameState } from './storage'
import {
  CADENCES,
  CUSTOM_CATEGORY_SCORE_GATE,
  DEFAULT_CATEGORIES,
  canUnlockCustomCategory,
} from './categories'
import type { DrawResult } from './pool'

export type ShellView = 'home' | 'pool'

const PRIMARY_ACTIONS = [
  { id: 'mark', label: 'Mark' },
  { id: 'board', label: 'Board' },
  { id: 'pool', label: 'Pool' },
  { id: 'recycle', label: 'Recycle' },
] as const

export type ShellHandlers = {
  softReset: boolean
  view: ShellView
  emptyPoolPrompt: boolean
  lastDraw: DrawResult | null
  onMarkPlaceholder: () => void
  onDrawPlaceholder: () => void
  onNavigate: (view: ShellView) => void
  onAddGoal: (input: { title: string; category: string; cadence: string }) => string | null
  onUpdateGoal: (
    id: string,
    input: { title: string; category: string; cadence: string },
  ) => string | null
  onRemoveGoal: (id: string) => void
  onAddCategory: (name: string) => string | null
  onDismissEmptyPrompt: () => void
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function renderShell(root: HTMLElement, state: GameState, h: ShellHandlers): void {
  const unlockReady = canUnlockCustomCategory(state.score.lifetime)
  const defaults = new Set<string>(DEFAULT_CATEGORIES)
  const customCategories = state.categories.filter((c) => !defaults.has(c))

  root.innerHTML = `
    <div class="shell">
      <header class="shell__header">
        <p class="shell__brand">Goal Bingo</p>
        <p class="shell__tag">Your goals. Your board.</p>
      </header>

      <main class="shell__main">
        ${
          h.softReset
            ? `<p class="shell__banner" role="status">Saved data could not be read. Starting fresh with a starter pool.</p>`
            : ''
        }
        ${
          h.emptyPoolPrompt
            ? `<p class="shell__banner shell__banner--warn" role="alert" data-testid="empty-pool-prompt">
                The pool is empty — add a goal before drawing.
                <button type="button" data-testid="dismiss-empty-prompt">OK</button>
              </p>`
            : ''
        }
        ${
          h.view === 'home'
            ? renderHome(state, h.lastDraw)
            : renderPool(state, unlockReady, customCategories)
        }
      </main>

      <nav class="shell__thumb" aria-label="Primary actions">
        ${PRIMARY_ACTIONS.map((a) => {
          const active =
            (a.id === 'pool' && h.view === 'pool') || (a.id === 'board' && h.view === 'home')
          return `<button type="button" class="thumb-btn${active ? ' thumb-btn--active' : ''}" data-action="${a.id}" data-testid="action-${a.id}">${a.label}</button>`
        }).join('')}
      </nav>
    </div>
  `

  bindHome(root, h)
  bindPool(root, h)
  bindNav(root, h)
}

function renderHome(state: GameState, lastDraw: DrawResult | null): string {
  const drawLine =
    lastDraw === null
      ? ''
      : lastDraw.ok
        ? `<p data-testid="last-draw">Drew: ${escapeHtml(lastDraw.goal.title)} (still in pool)</p>`
        : `<p data-testid="last-draw">Draw refused — empty pool</p>`

  return `
    <section class="shell__status" aria-label="Local status">
      <p>Pool: <strong data-testid="pool-count">${state.pool.length}</strong> goals</p>
      <p>Lifetime: <strong data-testid="lifetime">${state.score.lifetime}</strong></p>
      <p class="shell__hint">No account. Works offline. Data stays on this device.</p>
      ${drawLine}
    </section>
    <section class="shell__placeholder" aria-label="Board placeholder">
      <button type="button" class="cell-placeholder" data-testid="mark-cell">
        Tap to mark (placeholder)
      </button>
      <button type="button" class="cell-placeholder" data-testid="draw-cell">
        Draw a goal (placeholder)
      </button>
    </section>
  `
}

function renderPool(
  state: GameState,
  unlockReady: boolean,
  customCategories: string[],
): string {
  const options = state.categories
    .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
    .join('')
  const cadenceOptions = CADENCES.map(
    (c) => `<option value="${c}">${c}</option>`,
  ).join('')

  const rows = state.pool
    .map(
      (g) => `
      <li class="pool-item" data-goal-id="${escapeHtml(g.id)}">
        <input class="pool-item__title" data-field="title" value="${escapeHtml(g.title)}" aria-label="Title" />
        <select class="pool-item__category" data-field="category" aria-label="Category">
          ${state.categories
            .map(
              (c) =>
                `<option value="${escapeHtml(c)}"${c === g.category ? ' selected' : ''}>${escapeHtml(c)}</option>`,
            )
            .join('')}
        </select>
        <select class="pool-item__cadence" data-field="cadence" aria-label="Cadence">
          ${CADENCES.map(
            (c) =>
              `<option value="${c}"${c === g.cadence ? ' selected' : ''}>${c}</option>`,
          ).join('')}
        </select>
        <button type="button" data-testid="save-goal" data-action="save">Save</button>
        <button type="button" data-testid="remove-goal" data-action="remove">Remove</button>
      </li>`,
    )
    .join('')

  return `
    <section class="pool" aria-label="Goal pool" data-testid="pool-view">
      <h2 class="pool__heading">Goal pool</h2>
      <p class="shell__hint">Goals stay in the pool after they are drawn.</p>
      <ul class="pool__list" data-testid="pool-list">${rows || '<li class="shell__hint">No goals yet.</li>'}</ul>

      <form class="pool__form" data-testid="add-goal-form">
        <h3>Add goal</h3>
        <label>Title <input name="title" required data-testid="add-title" /></label>
        <label>Category
          <select name="category" data-testid="add-category">${options}</select>
        </label>
        <label>Cadence
          <select name="cadence" data-testid="add-cadence">${cadenceOptions}</select>
        </label>
        <button type="submit">Add</button>
        <p class="pool__error" data-testid="add-error" hidden></p>
      </form>

      <form class="pool__form" data-testid="add-category-form">
        <h3>Custom category</h3>
        <p class="shell__hint">
          ${
            unlockReady
              ? customCategories.length >= 1
                ? 'Custom slot already used.'
                : 'Unlocked — name a new category.'
              : `Unlocks at lifetime score ${CUSTOM_CATEGORY_SCORE_GATE} (currently ${state.score.lifetime}).`
          }
        </p>
        <label>Name <input name="name" data-testid="category-name" ${unlockReady && customCategories.length < 1 ? '' : 'disabled'} /></label>
        <button type="submit" data-testid="unlock-category-button" ${unlockReady && customCategories.length < 1 ? '' : 'disabled'}>Unlock category</button>
        <p class="pool__error" data-testid="category-error" hidden></p>
      </form>
    </section>
  `
}

function bindNav(root: HTMLElement, h: ShellHandlers): void {
  root.querySelector('[data-action="board"]')?.addEventListener('click', () => h.onNavigate('home'))
  root.querySelector('[data-action="pool"]')?.addEventListener('click', () => h.onNavigate('pool'))
  root.querySelector('[data-action="mark"]')?.addEventListener('click', () => {
    h.onNavigate('home')
    h.onMarkPlaceholder()
  })
  // Recycle stays unwired until WP-07 — do not overload the label with a draw stub.
}

function bindHome(root: HTMLElement, h: ShellHandlers): void {
  root.querySelector('[data-testid="mark-cell"]')?.addEventListener('click', () => {
    h.onMarkPlaceholder()
  })
  root.querySelector('[data-testid="draw-cell"]')?.addEventListener('click', () => {
    h.onDrawPlaceholder()
  })
  root.querySelector('[data-testid="dismiss-empty-prompt"]')?.addEventListener('click', () => {
    h.onDismissEmptyPrompt()
  })
}

function bindPool(root: HTMLElement, h: ShellHandlers): void {
  const addForm = root.querySelector<HTMLFormElement>('[data-testid="add-goal-form"]')
  addForm?.addEventListener('submit', (event) => {
    event.preventDefault()
    const fd = new FormData(addForm)
    const error = h.onAddGoal({
      title: String(fd.get('title') ?? ''),
      category: String(fd.get('category') ?? ''),
      cadence: String(fd.get('cadence') ?? ''),
    })
    const errEl = root.querySelector<HTMLElement>('[data-testid="add-error"]')
    if (errEl) {
      if (error) {
        errEl.hidden = false
        errEl.textContent = error
      } else {
        errEl.hidden = true
        errEl.textContent = ''
      }
    }
  })

  const catForm = root.querySelector<HTMLFormElement>('[data-testid="add-category-form"]')
  catForm?.addEventListener('submit', (event) => {
    event.preventDefault()
    const fd = new FormData(catForm)
    const error = h.onAddCategory(String(fd.get('name') ?? ''))
    const errEl = root.querySelector<HTMLElement>('[data-testid="category-error"]')
    if (errEl) {
      if (error) {
        errEl.hidden = false
        errEl.textContent = error
      } else {
        errEl.hidden = true
      }
    }
  })

  root.querySelectorAll<HTMLElement>('.pool-item').forEach((item) => {
    const id = item.dataset.goalId
    if (!id) return
    item.querySelector('[data-action="remove"]')?.addEventListener('click', () => {
      h.onRemoveGoal(id)
    })
    item.querySelector('[data-action="save"]')?.addEventListener('click', () => {
      const title = item.querySelector<HTMLInputElement>('[data-field="title"]')?.value ?? ''
      const category =
        item.querySelector<HTMLSelectElement>('[data-field="category"]')?.value ?? ''
      const cadence =
        item.querySelector<HTMLSelectElement>('[data-field="cadence"]')?.value ?? ''
      h.onUpdateGoal(id, { title, category, cadence })
    })
  })
}
