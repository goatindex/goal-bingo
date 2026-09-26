import { ACHIEVEMENT_IDS, type AchievementId } from './achievements'
import { ADVANCED_TILE_PLACEMENT_COST } from './advancedPlacement'
import {
  ADVANCED_TILE_TRACKS,
  ADVANCED_TILE_UNLOCK_COST,
  globalUnlockCost,
  isAdvancedTileUnlocked,
  remainingCategoriesForTrack,
  type AdvancedTileTrack,
} from './advancedUnlock'
import { SUPPORTED_SIZES, type Board, type Cell } from './board'
import { GRID_EXPANSION_COST } from './expansion'
import {
  RECYCLE_ALLOWANCE_MAX_LEVEL,
  RECYCLE_ALLOWANCE_UPGRADE_COST,
  RECYCLE_COST,
  effectiveRemaining,
} from './recycle'
import type { GameState } from './storage'
import { SWAP_COST } from './swap'
import type { Challenge } from './challenges'
import { averageClearsPerDay } from './stats'
import {
  CADENCES,
  CUSTOM_CATEGORY_SCORE_GATE,
  canUnlockCustomCategory,
  listCustomCategories,
} from './categories'

export type ShellView = 'home' | 'pool' | 'rewards' | 'stats' | 'actions' | 'challenges'

/** Cell-targeting mode. Not persisted. 'mark' is ordinary play. */
export type BoardTarget =
  | { kind: 'mark' }
  | { kind: 'recycle' }
  | { kind: 'swap'; first: number | null }
  | { kind: 'place'; track: AdvancedTileTrack }

const PRIMARY_ACTIONS = [
  { id: 'mark', label: 'Mark' },
  { id: 'board', label: 'Board' },
  { id: 'pool', label: 'Pool' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'stats', label: 'Stats' },
  { id: 'actions', label: 'Actions' },
  { id: 'challenges', label: 'Challenges' },
] as const

function trackLabel(track: AdvancedTileTrack): string {
  return track === 'multi-completion' ? 'Multi-completion' : 'Mini-grid'
}

function targetHint(target: BoardTarget): string | null {
  if (target.kind === 'recycle') return 'Tap an unmarked cell to recycle it.'
  if (target.kind === 'swap' && target.first === null) return 'Tap the first cell to swap.'
  if (target.kind === 'swap') return 'Tap an adjacent cell to finish the swap.'
  if (target.kind === 'place') return `Tap an unmarked cell to place a ${trackLabel(target.track)} tile.`
  return null
}

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
  boardTarget: BoardTarget
  /** Shown when a board-balance action is refused. */
  actionNotice: string | null
  /** Shown when a mark finishes one or more challenges. */
  completionNotice: string | null
  onMarkCell: (index: number) => void
  /** Tap one cell inside a mini-grid tile. The parent index is not itself a mark. */
  onMarkMiniCell: (parentIndex: number, innerIndex: number) => void
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
  onDismissActionNotice: () => void
  onDismissCompletionNotice: () => void
  onStartRecycle: () => void
  onStartSwap: () => void
  onStartPlace: (track: AdvancedTileTrack) => void
  onUpgradeAllowance: () => void
  onExpand: () => void
  onPurchaseUnlock: (track: AdvancedTileTrack, category: string) => void
  onPurchaseGlobal: (track: AdvancedTileTrack) => void
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/** Shown when a draw is refused because the pool has nothing to draw (GB-FUN-065). */
export function emptyPoolPromptHtml(show: boolean): string {
  if (!show) return ''
  return `<p class="shell__banner shell__banner--warn" role="alert" data-testid="empty-pool-prompt">
                The pool is empty — add a goal before drawing.
                <button type="button" data-testid="dismiss-empty-prompt">OK</button>
              </p>`
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
        ${emptyPoolPromptHtml(h.emptyPoolPrompt)}
        ${
          h.actionNotice
            ? `<p class="shell__banner shell__banner--warn" role="alert" data-testid="action-notice">
                ${escapeHtml(h.actionNotice)}
                <button type="button" data-testid="dismiss-action-notice">OK</button>
              </p>`
            : ''
        }
        ${
          h.completionNotice
            ? `<p class="shell__banner" role="status" data-testid="completion-notice">
                ${escapeHtml(h.completionNotice)}
                <button type="button" data-testid="dismiss-completion-notice">OK</button>
              </p>`
            : ''
        }
        ${
          h.view === 'home'
            ? renderHome(state, h.lastIntersectionCells, h.boardTarget)
            : h.view === 'pool'
              ? renderPool(state, unlockReady, customCategories)
              : h.view === 'rewards'
                ? renderRewards(state)
                : h.view === 'actions'
                  ? renderActions(state)
                  : h.view === 'challenges'
                    ? renderChallenges(state)
                    : renderStats(state)
        }
      </main>

      <nav class="shell__thumb" aria-label="Primary actions">
        ${PRIMARY_ACTIONS.map((a) => {
          const active =
            (a.id === 'pool' && h.view === 'pool') ||
            (a.id === 'rewards' && h.view === 'rewards') ||
            (a.id === 'stats' && h.view === 'stats') ||
            (a.id === 'actions' && h.view === 'actions') ||
            (a.id === 'challenges' && h.view === 'challenges') ||
            (a.id === 'board' && h.view === 'home')
          return `<button type="button" class="thumb-btn${active ? ' thumb-btn--active' : ''}" data-action="${a.id}" data-testid="action-${a.id}">${a.label}</button>`
        }).join('')}
      </nav>
    </div>
  `

  bindHome(root, h)
  bindPool(root, h)
  bindRewards(root, h)
  bindActions(root, h)
  bindNav(root, h)
  root.querySelector('[data-testid="dismiss-action-notice"]')?.addEventListener('click', () => {
    h.onDismissActionNotice()
  })
  root.querySelector('[data-testid="dismiss-completion-notice"]')?.addEventListener('click', () => {
    h.onDismissCompletionNotice()
  })
}

function renderHome(
  state: GameState,
  lastIntersectionCells: number[],
  target: BoardTarget,
): string {
  const hint = targetHint(target)
  return `
    ${hint ? `<p class="shell__banner" role="status" data-testid="target-hint">${escapeHtml(hint)}</p>` : ''}
    <section class="shell__status" aria-label="Local status">
      <p>Pool: <strong data-testid="pool-count">${state.pool.length}</strong> goals</p>
      <p>Lifetime: <strong data-testid="lifetime">${state.score.lifetime}</strong></p>
      <p>Reward balance: <strong data-testid="reward-balance">${state.score.rewardBalance}</strong></p>
      <p>Board balance: <strong data-testid="board-balance">${state.score.boardBalance}</strong></p>
      <p class="shell__hint">No account. Works offline. Data stays on this device.</p>
    </section>
    ${renderBoard(state.board, lastIntersectionCells, target)}
  `
}

function renderMiniSquares(parentIndex: number, cells: Cell[]): string {
  return cells
    .map((innerCell, innerIndex) => {
      const innerClasses = ['mini-cell']
      if (innerCell.marked) innerClasses.push('mini-cell--marked')
      const title = escapeHtml(innerCell.goal.title)
      return `<button
        type="button"
        class="${innerClasses.join(' ')}"
        data-testid="mini-cell-${parentIndex}-${innerIndex}"
        data-parent-index="${parentIndex}"
        data-inner-index="${innerIndex}"
        aria-pressed="${innerCell.marked}"
        aria-label="${title}"
        title="${title}"
      >${title}</button>`
    })
    .join('')
}

function renderBoard(board: Board, lastIntersectionCells: number[], target: BoardTarget): string {
  const intersection = new Set(lastIntersectionCells)
  const swapFirst = target.kind === 'swap' ? target.first : null
  const cells = board.cells
    .map((cell, i) => {
      const classes = ['board-cell']
      if (cell.marked) classes.push('board-cell--marked')
      if (intersection.has(i)) classes.push('board-cell--intersection')
      if (swapFirst === i) classes.push('board-cell--selected')
      // GB-FUN-046: show a multi-completion tile's progress alongside its title.
      if (cell.advanced?.kind === 'mini-grid') {
        return `<div
          class="${classes.join(' ')} board-cell--mini"
          data-testid="board-cell-${i}"
          role="group"
          aria-label="${escapeHtml(cell.goal.title)}"
        ><div class="mini-grid">${renderMiniSquares(i, cell.advanced.cells)}</div></div>`
      }
      const progress =
        cell.advanced?.kind === 'multi-completion'
          ? ` <span class="board-cell__progress" data-testid="board-cell-${i}-progress">${cell.advanced.completionsSoFar}/${cell.advanced.completionsRequired}</span>`
          : ''
      return `<button
        type="button"
        class="${classes.join(' ')}"
        data-testid="board-cell-${i}"
        data-index="${i}"
        aria-pressed="${cell.marked}"
      >${escapeHtml(cell.goal.title)}${progress}</button>`
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

function renderActions(state: GameState): string {
  const balance = state.score.boardBalance
  const freeRecycles = effectiveRemaining(state.recycle, Date.now())
  const atAllowanceCap = state.recycle.allowanceLevel >= RECYCLE_ALLOWANCE_MAX_LEVEL
  const atMaxSize = state.board.size === SUPPORTED_SIZES[SUPPORTED_SIZES.length - 1]
  const canPay = (cost: number) => balance >= cost

  const unlockRows = state.categories.flatMap((category) =>
    ADVANCED_TILE_TRACKS.filter(
      (track) => !isAdvancedTileUnlocked(state.advancedTileAccess, track, category),
    ).map((track) => {
      const affordable = canPay(ADVANCED_TILE_UNLOCK_COST)
      return `<li class="pool-item">
        <span>${escapeHtml(trackLabel(track))} · ${escapeHtml(category)}</span>
        <span>${ADVANCED_TILE_UNLOCK_COST}</span>
        <button type="button" data-testid="purchase-unlock" data-track="${track}" data-category="${escapeHtml(category)}" ${affordable ? '' : 'disabled'}>Unlock</button>
      </li>`
    }),
  )

  const placeButtons = ADVANCED_TILE_TRACKS.map((track) => {
    const unlocked = state.categories.some((category) =>
      isAdvancedTileUnlocked(state.advancedTileAccess, track, category),
    )
    const affordable = canPay(ADVANCED_TILE_PLACEMENT_COST) && unlocked
    return `<button type="button" data-testid="start-place" data-track="${track}" ${affordable ? '' : 'disabled'}>Place ${escapeHtml(trackLabel(track))} (${ADVANCED_TILE_PLACEMENT_COST})</button>`
  }).join('')

  const globalButtons = ADVANCED_TILE_TRACKS.map((track) => {
    const remaining = remainingCategoriesForTrack(
      state.advancedTileAccess,
      track,
      state.categories,
    )
    const cost = remaining.length === 0 ? 0 : globalUnlockCost(remaining.length)
    const affordable = remaining.length > 0 && canPay(cost)
    const label =
      remaining.length === 0
        ? `${trackLabel(track)} already unlocked`
        : `All ${trackLabel(track)} (${cost})`
    return `<button type="button" data-testid="purchase-global" data-track="${track}" ${affordable ? '' : 'disabled'}>${escapeHtml(label)}</button>`
  }).join('')

  return `
    <section class="pool" aria-label="Board actions" data-testid="actions-view">
      <h2 class="pool__heading">Board actions</h2>
      <p>Board balance: <strong data-testid="actions-balance">${balance}</strong></p>
      <p class="shell__hint">Spent from board balance only.</p>

      <div class="pool__form">
        <h3>Recycle</h3>
        <p>Free recycles left: <strong data-testid="free-recycles">${freeRecycles}</strong></p>
        <button type="button" data-testid="start-recycle" ${freeRecycles > 0 || canPay(RECYCLE_COST) ? '' : 'disabled'}>Recycle a cell</button>
        <p class="shell__hint">Free while any remain, then ${RECYCLE_COST} board balance.</p>
        <button type="button" data-testid="upgrade-allowance" ${!atAllowanceCap && canPay(RECYCLE_ALLOWANCE_UPGRADE_COST) ? '' : 'disabled'}>${atAllowanceCap ? 'Free recycles at maximum' : `More free recycles (${RECYCLE_ALLOWANCE_UPGRADE_COST})`}</button>
      </div>

      <div class="pool__form">
        <h3>Swap</h3>
        <button type="button" data-testid="start-swap" ${canPay(SWAP_COST) ? '' : 'disabled'}>Swap adjacent cells (${SWAP_COST})</button>
      </div>

      <div class="pool__form">
        <h3>Expand</h3>
        <button type="button" data-testid="expand-grid" ${!atMaxSize && canPay(GRID_EXPANSION_COST) ? '' : 'disabled'}>${atMaxSize ? 'Board is full size' : `Expand the grid (${GRID_EXPANSION_COST})`}</button>
      </div>

      <h3>Unlock a tile type</h3>
      <ul class="pool__list" data-testid="unlock-list">${unlockRows.join('') || '<li class="shell__hint">Every category already has both tile types.</li>'}</ul>

      <div class="pool__form">
        <h3>Place a tile</h3>
        ${placeButtons}
      </div>

      <div class="pool__form">
        <h3>Unlock a type for every category</h3>
        ${globalButtons}
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

function challengeName(challenge: Challenge): string {
  if (challenge.kind === 'universal') return 'Universal'
  const qualifier = challenge.qualifier ?? ''
  if (challenge.kind === 'cadence') return qualifier.charAt(0).toUpperCase() + qualifier.slice(1)
  return qualifier
}

function renderChallenges(state: GameState): string {
  const rows = state.challenges
    .map(
      (challenge) => `<li class="pool-item" data-testid="challenge-${escapeHtml(challenge.id)}">
        <span>${escapeHtml(challengeName(challenge))}</span>
        <strong data-testid="challenge-${escapeHtml(challenge.id)}-progress">${challenge.progress} / ${challenge.target}</strong>
      </li>`,
    )
    .join('')

  return `
    <section class="pool" aria-label="Challenges" data-testid="challenges-view">
      <h2 class="pool__heading">Challenges</h2>
      <p class="shell__hint">A mark counts toward every challenge it qualifies for.</p>
      <ul class="pool__list" data-testid="challenge-list">${rows}</ul>
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
  root.querySelector('[data-action="actions"]')?.addEventListener('click', () => h.onNavigate('actions'))
  root.querySelector('[data-action="challenges"]')?.addEventListener('click', () => h.onNavigate('challenges'))
}

function bindHome(root: HTMLElement, h: ShellHandlers): void {
  root.querySelectorAll<HTMLButtonElement>('button.board-cell').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.index)
      h.onMarkCell(index)
    })
  })
  root.querySelectorAll<HTMLButtonElement>('.mini-cell').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation()
      const parentIndex = Number(btn.dataset.parentIndex)
      const innerIndex = Number(btn.dataset.innerIndex)
      if (h.boardTarget.kind === 'mark') h.onMarkMiniCell(parentIndex, innerIndex)
      else h.onMarkCell(parentIndex)
    })
  })
  root.querySelector('[data-testid="dismiss-empty-prompt"]')?.addEventListener('click', () => {
    h.onDismissEmptyPrompt()
  })
}

function bindActions(root: HTMLElement, h: ShellHandlers): void {
  root.querySelector('[data-testid="start-recycle"]')?.addEventListener('click', () => h.onStartRecycle())
  root.querySelector('[data-testid="upgrade-allowance"]')?.addEventListener('click', () => h.onUpgradeAllowance())
  root.querySelector('[data-testid="start-swap"]')?.addEventListener('click', () => h.onStartSwap())
  root.querySelector('[data-testid="expand-grid"]')?.addEventListener('click', () => h.onExpand())
  root.querySelectorAll<HTMLButtonElement>('[data-testid="purchase-unlock"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const track = btn.dataset.track
      const category = btn.dataset.category
      if (track === 'multi-completion' || track === 'mini-grid') {
        if (category) h.onPurchaseUnlock(track, category)
      }
    })
  })
  root.querySelectorAll<HTMLButtonElement>('[data-testid="start-place"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const track = btn.dataset.track
      if (track === 'multi-completion' || track === 'mini-grid') h.onStartPlace(track)
    })
  })
  root.querySelectorAll<HTMLButtonElement>('[data-testid="purchase-global"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const track = btn.dataset.track
      if (track === 'multi-completion' || track === 'mini-grid') h.onPurchaseGlobal(track)
    })
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
