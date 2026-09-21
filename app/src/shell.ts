import { ACHIEVEMENT_IDS, type AchievementId } from './achievements'
import type { Board } from './board'
import type { GameState } from './storage'
import { averageClearsPerDay } from './stats'
import {
  CADENCES,
  CUSTOM_CATEGORY_SCORE_GATE,
  canUnlockCustomCategory,
  listCustomCategories,
} from './categories'

export type ShellView = 'home' | 'pool' | 'rewards' | 'stats'

const PRIMARY_ACTIONS = [
  { id: 'mark', label: 'Mark' },
  { id: 'board', label: 'Board' },
  { id: 'pool', label: 'Pool' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'stats', label: 'Stats' },
  { id: 'recycle', label: 'Recycle' },
] as const

const ACHIEVEMENT_LABELS: Record<AchievementId, string> = {
  'first-clear': 'First Clear',
  'large-grid': 'Large Grid',
  'sustained-run': 'Sustained Run',
  'rare-combination': 'Rare Combination',
}

export type ShellHandlers = {
  softReset: boolean
  view: ShellView
  emptyPoolPrompt: boolean
  /** Cells reported as the intersection of the lines cleared by the most recent mark
   *  (GB-FUN-014) - empty when the last mark cleared zero or one line. */
  lastIntersectionCells: number[]
  onMarkCell: (index: number) => void
  onNavigate: (view: ShellView) => void
  onAddGoal: (input: { title: string; category: string; cadence: string }) => string | null
  onUpdateGoal: (
    id: string,
    input: { title: string; category: string; cadence: string },
  ) => string | null
  onRemoveGoal: (id: string) => void
  onAddCategory: (name: string) => string | null
  onAddReward: (input: { name: string; price: string }) => string | null
  onRemoveReward: (id: string) => void
  onPurchaseReward: (id: string) => void
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
  const customCategories = listCustomCategories(state.categories)

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
            ? renderHome(state, h.lastIntersectionCells)
            : h.view === 'pool'
              ? renderPool(state, unlockReady, customCategories)
              : h.view === 'rewards'
                ? renderRewards(state)
                : renderStats(state)
        }
      </main>

      <nav class="shell__thumb" aria-label="Primary actions">
        ${PRIMARY_ACTIONS.map((a) => {
          const active =
            (a.id === 'pool' && h.view === 'pool') ||
            (a.id === 'rewards' && h.view === 'rewards') ||
            (a.id === 'stats' && h.view === 'stats') ||
            (a.id === 'board' && h.view === 'home')
          return `<button type="button" class="thumb-btn${active ? ' thumb-btn--active' : ''}" data-action="${a.id}" data-testid="action-${a.id}">${a.label}</button>`
        }).join('')}
      </nav>
    </div>
  `

  bindHome(root, h)
  bindPool(root, h)
  bindRewards(root, h)
  bindNav(root, h)
}

function renderHome(state: GameState, lastIntersectionCells: number[]): string {
  return `
    <section class="shell__status" aria-label="Local status">
      <p>Pool: <strong data-testid="pool-count">${state.pool.length}</strong> goals</p>
      <p>Lifetime: <strong data-testid="lifetime">${state.score.lifetime}</strong></p>
      <p>Reward balance: <strong data-testid="reward-balance">${state.score.rewardBalance}</strong></p>
      <p>Board balance: <strong data-testid="board-balance">${state.score.boardBalance}</strong></p>
      <p class="shell__hint">No account. Works offline. Data stays on this device.</p>
    </section>
    ${renderBoard(state.board, lastIntersectionCells)}
  `
}

function renderBoard(board: Board, lastIntersectionCells: number[]): string {
  const intersection = new Set(lastIntersectionCells)
  const cells = board.cells
    .map((cell, i) => {
      const classes = ['board-cell']
      if (cell.marked) classes.push('board-cell--marked')
      if (intersection.has(i)) classes.push('board-cell--intersection')
      return `<button
        type="button"
        class="${classes.join(' ')}"
        data-testid="board-cell-${i}"
        data-index="${i}"
        aria-pressed="${cell.marked}"
      >${escapeHtml(cell.goal.title)}</button>`
    })
    .join('')

  return `
    <section class="board" aria-label="Board" data-testid="board">
      <div class="board__grid" style="grid-template-columns: repeat(${board.size}, 1fr)">
        ${cells}
      </div>
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

function renderRewards(state: GameState): string {
  const balance = state.score.rewardBalance
  const rows = state.rewards
    .map((r) => {
      const affordable = r.price <= balance
      return `
      <li class="pool-item" data-reward-id="${escapeHtml(r.id)}">
        <span>${escapeHtml(r.name)}</span>
        <span>${r.price}</span>
        <button type="button" data-testid="purchase-reward" data-action="purchase" ${affordable ? '' : 'disabled'}>Buy</button>
        <button type="button" data-testid="remove-reward" data-action="remove">Remove</button>
      </li>`
    })
    .join('')

  return `
    <section class="pool" aria-label="Personal rewards" data-testid="rewards-view">
      <h2 class="pool__heading">Personal rewards</h2>
      <p>Reward balance: <strong data-testid="rewards-view-balance">${balance}</strong></p>
      <p class="shell__hint">Your own rewards, priced in reward balance only.</p>
      <ul class="pool__list" data-testid="rewards-list">${rows || '<li class="shell__hint">No rewards yet.</li>'}</ul>

      <form class="pool__form" data-testid="add-reward-form">
        <h3>Add reward</h3>
        <label>Name <input name="name" required data-testid="add-reward-name" /></label>
        <label>Price <input name="price" type="number" min="1" step="1" required data-testid="add-reward-price" /></label>
        <button type="submit">Add</button>
        <p class="pool__error" data-testid="add-reward-error" hidden></p>
      </form>
    </section>
  `
}

function renderStats(state: GameState): string {
  const categoryRows = Object.entries(state.stats.clearsByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => `<li>${escapeHtml(category)}: <strong>${count}</strong></li>`)
    .join('')

  const dateRows = Object.entries(state.stats.clearsByDate)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, count]) => `<li>${escapeHtml(date)}: <strong>${count}</strong></li>`)
    .join('')

  const unlockedIds = new Set(state.achievements.map((a) => a.id))
  const achievementRows = ACHIEVEMENT_IDS.map((id) => {
    const unlocked = unlockedIds.has(id)
    return `<li class="${unlocked ? 'achievement--unlocked' : 'achievement--locked'}" data-testid="achievement-${id}">
      ${escapeHtml(ACHIEVEMENT_LABELS[id])}${unlocked ? '' : ' (locked)'}
    </li>`
  }).join('')

  return `
    <section class="pool" aria-label="Statistics" data-testid="stats-view">
      <h2 class="pool__heading">Statistics</h2>
      <p>Lifetime score: <strong data-testid="stats-lifetime">${state.score.lifetime}</strong></p>
      <p>Average clears per day: <strong data-testid="stats-average">${averageClearsPerDay(state.stats).toFixed(2)}</strong></p>

      <h3>Clears by category</h3>
      <ul class="pool__list" data-testid="stats-categories">${categoryRows || '<li class="shell__hint">No clears yet.</li>'}</ul>

      <h3>Clear history</h3>
      <ul class="pool__list" data-testid="stats-history">${dateRows || '<li class="shell__hint">No clears yet.</li>'}</ul>

      <h3>Achievements</h3>
      <ul class="pool__list" data-testid="stats-achievements">${achievementRows}</ul>
    </section>
  `
}

function bindNav(root: HTMLElement, h: ShellHandlers): void {
  root.querySelector('[data-action="board"]')?.addEventListener('click', () => h.onNavigate('home'))
  root.querySelector('[data-action="pool"]')?.addEventListener('click', () => h.onNavigate('pool'))
  root.querySelector('[data-action="rewards"]')?.addEventListener('click', () => h.onNavigate('rewards'))
  root.querySelector('[data-action="stats"]')?.addEventListener('click', () => h.onNavigate('stats'))
  root.querySelector('[data-action="mark"]')?.addEventListener('click', () => h.onNavigate('home'))
  // Recycle's UI (WP-07's power-ups have no view yet, flagged in NEXT.md) stays
  // unwired — do not overload the label with a draw stub.
}

function bindHome(root: HTMLElement, h: ShellHandlers): void {
  root.querySelectorAll<HTMLButtonElement>('.board-cell').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.index)
      h.onMarkCell(index)
    })
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

function bindRewards(root: HTMLElement, h: ShellHandlers): void {
  const addForm = root.querySelector<HTMLFormElement>('[data-testid="add-reward-form"]')
  addForm?.addEventListener('submit', (event) => {
    event.preventDefault()
    const fd = new FormData(addForm)
    const error = h.onAddReward({
      name: String(fd.get('name') ?? ''),
      price: String(fd.get('price') ?? ''),
    })
    const errEl = root.querySelector<HTMLElement>('[data-testid="add-reward-error"]')
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

  root.querySelectorAll<HTMLElement>('[data-reward-id]').forEach((item) => {
    const id = item.dataset.rewardId
    if (!id) return
    item.querySelector('[data-action="remove"]')?.addEventListener('click', () => {
      h.onRemoveReward(id)
    })
    item.querySelector('[data-action="purchase"]')?.addEventListener('click', () => {
      h.onPurchaseReward(id)
    })
  })
}
