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
import { SUPPORTED_SIZES, type Cell } from './board'
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
import { attachHold } from './hold'
import {
  clearTilePeek,
  getTilePeek,
  restoreTilePeek,
  toggleTilePeek,
} from './tilePeek'
import type { ClearMoment } from './moment'
import { ADVANCED_VIEWS, ADVANCED_VIEW_LABELS, type AdvancedView, type Prefs } from './prefs'
import { MODES, categorySlot, type Mode } from './tokens'
import { renderBanner } from './ui/banner'
import { renderCostRow } from './ui/costRow'
import { escapeHtml } from './ui/escape'
import { renderPanel, renderPageSection } from './ui/panel'
import { renderProgressBar } from './ui/progressBar'
import { renderSegmented } from './ui/segmented'
import { renderStatTile } from './ui/statTile'
import { renderForm, renderFormError, renderLabelledControl, renderSelect, renderTextInput } from './ui/formField'
import { renderList, renderListRow } from './ui/listRow'
import { renderSheetChrome } from './ui/sheetChrome'
import { renderButton } from './ui/button'

export type ShellView =
  | 'home'
  | 'pool'
  | 'rewards'
  | 'stats'
  | 'actions'
  | 'challenges'
  | 'settings'

/** Cell-targeting mode. Not persisted. 'mark' is ordinary play. */
export type BoardTarget =
  | { kind: 'mark' }
  | { kind: 'recycle' }
  | { kind: 'swap'; first: number | null }
  | { kind: 'place'; track: AdvancedTileTrack }

const PRIMARY_ACTIONS = [
  { id: 'board', label: 'Board', aria: 'Board' },
  { id: 'pool', label: 'Pool', aria: 'Goal pool' },
  { id: 'rewards', label: 'Rewards', aria: 'Personal rewards' },
  { id: 'stats', label: 'Stats', aria: 'Statistics' },
  { id: 'actions', label: 'Acts', aria: 'Board actions' },
  { id: 'challenges', label: 'Chal', aria: 'Challenges' },
] as const

let lastShellView: ShellView | null = null

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
  /** The clear moment shown on the refilled board (GB-FUN-073, GB-FUN-014), or null.
   *  It holds nothing: every cell stays markable while it is up (GB-FUN-074). */
  moment: ClearMoment | null
  prefs: Prefs
  /** The advanced tile open in the sheet under "Open larger" (GB-FUN-077), or null. */
  openTile: number | null
  boardTarget: BoardTarget
  /** Shown when a board-balance action is refused. */
  actionNotice: string | null
  /** Shown when a mark finishes one or more challenges. */
  completionNotice: string | null
  /** A completed hold on a cell, or a tap on a cell while a board action is armed. */
  onMarkCell: (index: number) => void
  /** A completed hold on one cell inside a mini-grid tile. The parent is not a mark. */
  onMarkMiniCell: (parentIndex: number, innerIndex: number) => void
  onOpenTile: (index: number) => void
  onCloseTile: () => void
  onSetAdvancedView: (view: AdvancedView) => void
  onSetMode: (mode: Mode) => void
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
  onCancelBoardTarget: () => void
}

/** Shown when a draw is refused because the pool has nothing to draw (GB-FUN-065). */
export function emptyPoolPromptHtml(show: boolean): string {
  if (!show) return ''
  return renderBanner({
    message: 'The pool is empty — add a goal before drawing.',
    variant: 'warn',
    testId: 'empty-pool-prompt',
    dismissTestId: 'dismiss-empty-prompt',
  })
}

function renderSideNav(view: ShellView): string {
  return `<nav class="shell__aside-nav" aria-label="Primary actions (sidebar)">
    ${PRIMARY_ACTIONS.map((a) => {
      const active =
        (a.id === 'pool' && view === 'pool') ||
        (a.id === 'rewards' && view === 'rewards') ||
        (a.id === 'stats' && view === 'stats') ||
        (a.id === 'actions' && view === 'actions') ||
        (a.id === 'challenges' && view === 'challenges') ||
        (a.id === 'board' && view === 'home')
      return `<button type="button" class="shell__aside-btn${active ? ' shell__aside-btn--active' : ''}" data-action="${a.id}" data-testid="aside-action-${a.id}" aria-label="${escapeHtml(a.aria)}">${a.label}</button>`
    }).join('')}
  </nav>`
}

function renderCategoryLegend(categories: readonly string[]): string {
  const rows = categories
    .map((category) => {
      const slot = categorySlot(categories, category)
      const style = slot >= 0 ? ` style="--legend-cue: var(--cue-${slot})"` : ''
      return `<li class="category-legend__item"${style}><span class="category-legend__swatch" aria-hidden="true"></span>${escapeHtml(category)}</li>`
    })
    .join('')
  return `<details class="category-legend" data-testid="category-legend">
    <summary>Category colors</summary>
    <ul class="category-legend__list">${rows}</ul>
  </details>`
}

export function renderShell(root: HTMLElement, state: GameState, h: ShellHandlers): void {
  const unlockReady = canUnlockCustomCategory(state.score.lifetime)
  const customCategories = listCustomCategories(state.categories)
  const preserveScroll = lastShellView === h.view && h.view !== 'home'
  const scrollTop = preserveScroll ? (root.querySelector('.shell__main')?.scrollTop ?? 0) : 0
  lastShellView = h.view

  root.innerHTML = `
    <div class="shell shell--with-side">
      <header class="shell__header">
        <p class="shell__brand">Goal Bingo</p>
        <button type="button" class="ui-btn ui-btn--secondary ui-btn--header${h.view === 'settings' ? ' is-active' : ''}" data-action="settings" data-testid="action-display" aria-pressed="${h.view === 'settings'}">Settings</button>
      </header>

      <main class="shell__main">
        ${
          h.softReset
            ? renderBanner({
                message: 'Saved data could not be read. Starting fresh with a starter pool.',
              })
            : ''
        }
        ${emptyPoolPromptHtml(h.emptyPoolPrompt)}
        ${
          h.actionNotice
            ? renderBanner({
                message: h.actionNotice,
                variant: 'warn',
                testId: 'action-notice',
                dismissTestId: 'dismiss-action-notice',
              })
            : ''
        }
        ${
          h.completionNotice
            ? renderBanner({
                message: h.completionNotice,
                testId: 'completion-notice',
                dismissTestId: 'dismiss-completion-notice',
              })
            : ''
        }
        ${
          h.view === 'home'
            ? renderHome(state, h)
            : h.view === 'settings'
              ? renderSettings(h.prefs)
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

      <aside class="shell__aside">${renderSideNav(h.view)}</aside>

      <nav class="shell__thumb" aria-label="Primary actions">
        ${PRIMARY_ACTIONS.map((a) => {
          const active =
            (a.id === 'pool' && h.view === 'pool') ||
            (a.id === 'rewards' && h.view === 'rewards') ||
            (a.id === 'stats' && h.view === 'stats') ||
            (a.id === 'actions' && h.view === 'actions') ||
            (a.id === 'challenges' && h.view === 'challenges') ||
            (a.id === 'board' && h.view === 'home')
          return `<button type="button" class="thumb-btn${active ? ' thumb-btn--active' : ''}" data-action="${a.id}" data-testid="action-${a.id}" aria-label="${escapeHtml(a.aria)}">${a.label}</button>`
        }).join('')}
      </nav>
      ${h.view === 'home' ? renderSheet(state, h) : ''}
    </div>
  `
  const mainEl = root.querySelector('.shell__main')
  if (mainEl && preserveScroll) mainEl.scrollTop = scrollTop
  if (h.moment) lastAnimatedMomentId = h.moment.id

  let peekIndex: number | null = null
  if (h.view === 'home' && h.boardTarget.kind === 'mark') {
    peekIndex = getTilePeek()?.index ?? null
    if (peekIndex !== null) {
      const cell = state.board.cells[peekIndex]
      if (!cell || cell.marked) {
        clearTilePeek(root)
        peekIndex = null
      }
    }
  } else {
    clearTilePeek(root)
  }
  bindHome(root, h)
  if (peekIndex !== null) restoreTilePeek(root, peekIndex)
  bindSheetA11y(root, h)
  bindAdvancedView(root, h)
  bindDisplay(root, h)
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

/** The clear moment animates on the paint that first shows it, not on every repaint
 *  while it is up (a mark made during the moment repaints the board). */
let lastAnimatedMomentId = -1

const HOLD_HINT = 'Press and hold a goal when you have done it.'


function holdHintHtml(): string {
  return `<p class="hold-hint" role="status" data-testid="hold-status">${HOLD_HINT}</p>`
}

function renderMoment(m: ClearMoment | null): string {
  if (!m) return holdHintHtml()
  const multi = m.intersection.length > 0
  return `<div class="moment${multi ? ' moment--multi' : ''}${m.id !== lastAnimatedMomentId ? ' moment--enter' : ''}" role="status" data-testid="clear-moment">
      <span class="moment__pts" data-testid="clear-moment-points">+${m.points}</span>
      <span class="moment__text"><strong>${escapeHtml(m.title)}</strong><span>${escapeHtml(m.detail)}</span></span>
    </div>`
}

function renderHome(state: GameState, h: ShellHandlers): string {
  const hint = targetHint(h.boardTarget)
  const universal = state.challenges.find((c) => c.kind === 'universal')
  const pct = universal ? Math.min(100, Math.round((universal.progress / universal.target) * 100)) : 0
  const status = `
    <section class="stat-tiles" aria-label="Local status">
      ${renderStatTile('Lifetime', state.score.lifetime, 'lifetime')}
      ${renderStatTile('Rewards', state.score.rewardBalance, 'reward-balance')}
      ${renderStatTile('Board', state.score.boardBalance, 'board-balance')}
    </section>
    <p class="ui-hint ui-hint--balances" data-testid="balance-hint">Lifetime is your record. <strong>Rewards</strong> buys personal treats. <strong>Board</strong> pays for recycle, swap, expand, and tiles.</p>
    ${renderCategoryLegend(state.categories)}
  `
  const play = `
    ${
      hint
        ? `<div class="target-hint" data-testid="target-hint">
            ${renderBanner({ message: hint })}
            ${renderButton({ label: 'Cancel', testId: 'cancel-board-target', variant: 'secondary', size: 'compact' })}
          </div>`
        : ''
    }
    <div class="moment-slot" data-testid="moment-slot">${renderMoment(h.moment)}</div>
    ${renderBoard(state, h)}
    ${
      universal
        ? `<button type="button" class="challenge-row" data-testid="challenge-row" aria-label="Challenges: mark any ${universal.target} goals, ${universal.progress} of ${universal.target}. Open challenges.">
            <span class="challenge-row__label">Mark any ${universal.target} goals</span>
            ${renderProgressBar(pct)}
            <span class="challenge-row__count">${universal.progress}/${universal.target}</span>
          </button>`
        : ''
    }
    <p class="shell__hint">Pool: <strong data-testid="pool-count">${state.pool.length}</strong> goals. No account. Works offline. Data stays on this device.</p>
  `
  return `<div class="home-layout"><div class="home-layout__status">${status}</div><div class="home-layout__play">${play}</div></div>`
}

/** What a press on a board cell does. In ordinary play a cell is held to mark
 *  (GB-FUN-009); under "Open larger" an unmarked advanced tile opens the sheet instead
 *  (GB-FUN-077); under "In the cell" an unmarked mini-grid takes holds on its inner
 *  cells (GB-FUN-079). A marked cell does nothing. While recycle, swap or place is armed
 *  every cell takes a tap, because those choose a cell rather than mark it. */
export type CellBehaviour = 'hold' | 'open' | 'inner-holds' | 'tap' | 'none'

export function cellBehaviour(cell: Cell, target: BoardTarget, advancedTiles: AdvancedView): CellBehaviour {
  if (target.kind !== 'mark') return 'tap'
  if (cell.marked) return 'none'
  if (cell.advanced && advancedTiles === 'open') return 'open'
  if (cell.advanced?.kind === 'mini-grid') return 'inner-holds'
  return 'hold'
}

export function cueStyle(categories: readonly string[], category: string): string {
  const slot = categorySlot(categories, category)
  return slot < 0 ? '' : ` style="--cell-cat: var(--cat-${slot}); --cell-cue: var(--cue-${slot})"`
}

function cellInner(cell: Cell, i: number, star: boolean): string {
  const progress =
    cell.advanced?.kind === 'multi-completion' && !cell.marked
      ? `<span class="board-cell__progress" data-testid="board-cell-${i}-progress">${cell.advanced.completionsSoFar}/${cell.advanced.completionsRequired}</span>`
      : ''
  const dots =
    cell.advanced?.kind === 'mini-grid' && !cell.marked
      ? `<span class="mini-dots" aria-hidden="true">${cell.advanced.cells
          .map((c) => `<span class="${c.marked ? 'is-on' : ''}"></span>`)
          .join('')}</span>`
      : ''
  const title = dots ? '' : `<span class="board-cell__title">${escapeHtml(cell.goal.title)}</span>`
  return `<span class="board-cell__fill" aria-hidden="true"></span><span class="board-cell__band" aria-hidden="true"></span>${title}${progress}${dots}${
    cell.marked ? '<span class="board-cell__check" aria-hidden="true"></span>' : ''
  }${star ? '<span class="cell-star" aria-hidden="true"></span>' : ''}`
}

export function cellLabel(cell: Cell, category: string): string {
  let label = `${cell.goal.title}, ${category}`
  if (cell.marked) return `${label}, marked`
  if (cell.advanced?.kind === 'multi-completion') {
    label += `, ${cell.advanced.completionsSoFar} of ${cell.advanced.completionsRequired} done`
  }
  if (cell.advanced?.kind === 'mini-grid') {
    label += `, mini-grid, ${cell.advanced.cells.filter((c) => c.marked).length} of ${cell.advanced.cells.length} done`
  }
  return label
}

function renderBoard(state: GameState, h: ShellHandlers): string {
  const board = state.board
  const m = h.moment
  const fresh = new Set(m?.cells ?? [])
  const stars = new Set(m?.intersection ?? [])
  const pop = m !== null && m.id !== lastAnimatedMomentId
  const swapFirst = h.boardTarget.kind === 'swap' ? h.boardTarget.first : null
  const cells = board.cells
    .map((cell, i) => {
      const classes = ['board-cell']
      if (cell.marked) classes.push('board-cell--marked')
      if (fresh.has(i)) classes.push('board-cell--fresh')
      if (fresh.has(i) && pop) classes.push('board-cell--pop')
      if (stars.has(i)) classes.push('board-cell--intersection')
      if (swapFirst === i) classes.push('board-cell--selected')
      if (cell.advanced && !cell.marked) classes.push('board-cell--advanced')
      const style = cueStyle(state.categories, cell.goal.category)
      const label = escapeHtml(cellLabel(cell, cell.goal.category))
      const behaviour = cellBehaviour(cell, h.boardTarget, h.prefs.advancedTiles)
      if (behaviour === 'inner-holds' && cell.advanced?.kind === 'mini-grid') {
        const inner = cell.advanced.cells
          .map((innerCell, j) => {
            const title = escapeHtml(innerCell.goal.title)
            return `<button type="button" class="mini-cell${innerCell.marked ? ' mini-cell--marked' : ''}"
              data-testid="mini-cell-${i}-${j}" data-parent-index="${i}" data-inner-index="${j}"
              ${innerCell.marked ? '' : 'data-hold="mini"'} aria-pressed="${innerCell.marked}"
              aria-label="${title}${innerCell.marked ? ', marked' : ''}"><span class="board-cell__fill" aria-hidden="true"></span></button>`
          })
          .join('')
        return `<div class="${classes.join(' ')} board-cell--mini"${style} data-testid="board-cell-${i}" role="group" aria-label="${label}">
          <span class="board-cell__band" aria-hidden="true"></span><div class="mini-grid">${inner}</div>${
            stars.has(i) ? '<span class="cell-star" aria-hidden="true"></span>' : ''
          }</div>`
      }
      const attr = behaviour === 'open' ? 'data-open="1"' : behaviour === 'hold' ? 'data-hold="cell"' : ''
      return `<button type="button" class="${classes.join(' ')}"${style}
        data-testid="board-cell-${i}" data-index="${i}" ${attr}
        aria-pressed="${cell.marked}" aria-label="${label}">${cellInner(cell, i, stars.has(i))}</button>`
    })
    .join('')

  return `
    <section class="board" aria-label="Board" data-testid="board">
      <div class="board__grid" style="grid-template-columns: repeat(${board.size}, minmax(0, 1fr))">
        ${cells}
      </div>
    </section>
  `
}

function advancedViewControl(prefs: Prefs): string {
  return renderSegmented({
    name: 'Show advanced tiles',
    dataAttr: 'data-advanced-view',
    selected: prefs.advancedTiles,
    options: ADVANCED_VIEWS.map((v) => ({
      value: v,
      label: ADVANCED_VIEW_LABELS[v],
      testId: `advanced-view-${v}`,
    })),
  })
}

function renderSheet(state: GameState, h: ShellHandlers): string {
  if (h.openTile === null || h.boardTarget.kind !== 'mark') return ''
  const cell = state.board.cells[h.openTile]
  if (!cell || cell.marked || !cell.advanced) return ''
  const i = h.openTile
  const style = cueStyle(state.categories, cell.goal.category)
  let body = ''
  let lead = ''
  if (cell.advanced.kind === 'mini-grid') {
    lead = 'Complete any line inside to mark this tile.'
    body = `<div class="sheet__grid">${cell.advanced.cells
      .map((innerCell, j) => {
        const title = escapeHtml(innerCell.goal.title)
        return `<button type="button" class="sheet-cell${innerCell.marked ? ' sheet-cell--marked' : ''}"
          data-testid="sheet-cell-${j}" data-parent-index="${i}" data-inner-index="${j}"
          ${innerCell.marked ? '' : 'data-hold="mini"'} aria-pressed="${innerCell.marked}"
          aria-label="${title}${innerCell.marked ? ', marked' : ''}"><span class="board-cell__fill" aria-hidden="true"></span><span class="board-cell__band" aria-hidden="true"></span><span class="sheet-cell__title">${title}</span></button>`
      })
      .join('')}</div>`
  } else {
    const { completionsSoFar: done, completionsRequired: req } = cell.advanced
    lead = `${done} of ${req} done. Each hold records one completion.`
    body = `<div class="sheet__multi">
      <span class="sheet__pips" aria-hidden="true">${Array.from({ length: req }, (_, k) => `<span class="${k < done ? 'is-on' : ''}"></span>`).join('')}</span>
      <button type="button" class="sheet-hold" data-testid="sheet-hold" data-index="${i}" data-hold="cell"
        aria-label="${escapeHtml(cell.goal.title)}, ${done} of ${req} done. Press and hold to record one."><span class="board-cell__fill" aria-hidden="true"></span><span class="sheet-hold__text">Hold to record one</span></button>
    </div>`
  }
  return `${renderSheetChrome({
    title: cell.goal.title,
    category: cell.goal.category,
    kindLabel: cell.advanced.kind === 'mini-grid' ? 'Mini-grid' : 'Multi-completion',
    hint: lead,
    styleAttr: style,
    body: `${body}${holdHintHtml()}`,
  })}`
}

function renderSettings(prefs: Prefs): string {
  const modeControl = renderSegmented({
    name: 'Mode',
    dataAttr: 'data-mode',
    selected: prefs.mode,
    options: MODES.map((mode) => ({
      value: mode,
      label: mode === 'light' ? 'Light' : 'Dark',
      testId: `mode-${mode}`,
    })),
  })
  return renderPageSection({
    ariaLabel: 'Settings',
    testId: 'display-view',
    heading: 'Settings',
    body: `
      ${renderPanel({
        title: 'Mode',
        body: modeControl,
      })}
      ${renderPanel({
        title: 'Show advanced tiles',
        body: `${advancedViewControl(prefs)}<p class="ui-hint">How a mini-grid or multi-completion tile is shown. Changing it marks nothing.</p>`,
      })}
    `,
  })
}

/** Ends the clear moment without a repaint, so a hold in progress survives it. */
export function endMoment(root: HTMLElement): void {
  root
    .querySelectorAll('.board-cell--fresh, .board-cell--pop, .board-cell--intersection')
    .forEach((el) => el.classList.remove('board-cell--fresh', 'board-cell--pop', 'board-cell--intersection'))
  root.querySelectorAll('.cell-star').forEach((el) => el.remove())
  const slot = root.querySelector('[data-testid="moment-slot"]')
  if (slot) slot.innerHTML = holdHintHtml()
}

function showEarlyRelease(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('[data-testid="hold-status"]').forEach((el) => {
    el.textContent = 'Released early. Not marked.'
    el.classList.add('hold-hint--early')
  })
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
      return renderListRow({
        body: renderCostRow({
          label: `${trackLabel(track)} · ${category}`,
          costLabel: `${ADVANCED_TILE_UNLOCK_COST} board`,
          buttonLabel: 'Unlock',
          testId: 'purchase-unlock',
          disabled: !affordable,
          buttonAttrs: { 'data-track': track, 'data-category': category },
        }),
      })
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

  const recycleBody = `
    <p>Free recycles left: <strong data-testid="free-recycles">${freeRecycles}</strong></p>
    ${renderCostRow({
      label: 'Recycle',
      costLabel: freeRecycles > 0 ? 'Free' : `${RECYCLE_COST} board`,
      hint: `Free while any remain, then ${RECYCLE_COST} board balance.`,
      buttonLabel: 'Recycle a cell',
      testId: 'start-recycle',
      disabled: !(freeRecycles > 0 || canPay(RECYCLE_COST)),
    })}
    ${renderCostRow({
      label: 'Allowance upgrade',
      costLabel: atAllowanceCap ? 'Maxed' : `${RECYCLE_ALLOWANCE_UPGRADE_COST} board`,
      buttonLabel: atAllowanceCap ? 'Free recycles at maximum' : 'More free recycles',
      testId: 'upgrade-allowance',
      disabled: atAllowanceCap || !canPay(RECYCLE_ALLOWANCE_UPGRADE_COST),
    })}
  `

  return renderPageSection({
    ariaLabel: 'Board actions',
    testId: 'actions-view',
    heading: 'Board actions',
    body: `
      <p>Board balance: <strong data-testid="actions-balance">${balance}</strong></p>
      <p class="ui-hint">Spent from board balance only — not reward balance.</p>
      ${renderPanel({ title: 'Recycle', body: recycleBody })}
      ${renderPanel({
        title: 'Swap',
        body: renderCostRow({
          label: 'Adjacent swap',
          costLabel: `${SWAP_COST} board`,
          buttonLabel: 'Swap adjacent cells',
          testId: 'start-swap',
          disabled: !canPay(SWAP_COST),
        }),
      })}
      ${renderPanel({
        title: 'Expand',
        body: renderCostRow({
          label: 'Grid size',
          costLabel: atMaxSize ? 'Maximum' : `${GRID_EXPANSION_COST} board`,
          buttonLabel: atMaxSize ? 'Board is full size' : 'Expand the grid',
          testId: 'expand-grid',
          disabled: atMaxSize || !canPay(GRID_EXPANSION_COST),
        }),
      })}
      <h3 class="ui-page__subheading">Unlock a tile type</h3>
      ${renderList(unlockRows.join('') || '<li class="ui-hint">Every category already has both tile types.</li>', 'unlock-list')}
      ${renderPanel({ title: 'Place a tile', body: placeButtons })}
      ${renderPanel({ title: 'Unlock for every category', body: globalButtons })}
    `,
  })
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
    .map((g) => {
      const categoryOptions = state.categories
        .map(
          (c) =>
            `<option value="${escapeHtml(c)}"${c === g.category ? ' selected' : ''}>${escapeHtml(c)}</option>`,
        )
        .join('')
      const cadenceOpts = CADENCES.map(
        (c) => `<option value="${c}"${c === g.cadence ? ' selected' : ''}>${c}</option>`,
      ).join('')
      return renderListRow({
        attrs: { 'data-goal-id': g.id },
        body: `
          ${renderLabelledControl('Title', `<input class="ui-field__control" data-field="title" value="${escapeHtml(g.title)}" aria-label="Title" />`)}
          ${renderLabelledControl('Category', `<select class="ui-field__control" data-field="category" aria-label="Category">${categoryOptions}</select>`)}
          ${renderLabelledControl('Cadence', `<select class="ui-field__control" data-field="cadence" aria-label="Cadence">${cadenceOpts}</select>`)}
          ${renderButton({ label: 'Save', testId: 'save-goal', attrs: { 'data-action': 'save' } })}
          ${renderButton({ label: 'Remove', testId: 'remove-goal', variant: 'secondary', attrs: { 'data-action': 'remove' } })}
        `,
      })
    })
    .join('')

  const addGoalForm = renderForm(
    'Add goal',
    'add-goal-form',
    `
      ${renderLabelledControl('Title', renderTextInput('title', { required: 'true', 'data-testid': 'add-title' }))}
      ${renderLabelledControl('Category', renderSelect('category', options, { 'data-testid': 'add-category' }))}
      ${renderLabelledControl('Cadence', renderSelect('cadence', cadenceOptions, { 'data-testid': 'add-cadence' }))}
      ${renderButton({ label: 'Add', attrs: { type: 'submit' } })}
      ${renderFormError('add-error')}
    `,
  )

  const catHint =
    unlockReady
      ? customCategories.length >= 1
        ? 'Custom slot already used.'
        : 'Unlocked — name a new category.'
      : `Unlocks at lifetime score ${CUSTOM_CATEGORY_SCORE_GATE} (currently ${state.score.lifetime}).`

  const addCategoryForm = renderForm(
    'Custom category',
    'add-category-form',
    `
      <p class="ui-hint">${escapeHtml(catHint)}</p>
      ${renderLabelledControl('Name', renderTextInput('name', { 'data-testid': 'category-name', ...(unlockReady && customCategories.length < 1 ? {} : { disabled: 'disabled' }) }))}
      ${renderButton({
        label: 'Unlock category',
        testId: 'unlock-category-button',
        disabled: !(unlockReady && customCategories.length < 1),
        attrs: { type: 'submit' },
      })}
      ${renderFormError('category-error')}
    `,
  )

  return renderPageSection({
    ariaLabel: 'Goal pool',
    testId: 'pool-view',
    heading: 'Goal pool',
    body: `
      <p class="ui-hint">Goals stay in the pool after they are drawn.</p>
      ${renderList(rows || '<li class="ui-hint">No goals yet.</li>', 'pool-list')}
      ${renderPanel({ body: addGoalForm })}
      ${renderPanel({ body: addCategoryForm })}
    `,
  })
}

function renderRewards(state: GameState): string {
  const balance = state.score.rewardBalance
  const listRows = state.rewards
    .map((r) => {
      const affordable = r.price <= balance
      return renderListRow({
        attrs: { 'data-reward-id': r.id },
        body: `
          <span>${escapeHtml(r.name)}</span>
          <span>${r.price}</span>
          ${renderButton({ label: 'Buy', testId: 'purchase-reward', disabled: !affordable, attrs: { 'data-action': 'purchase' } })}
          ${renderButton({ label: 'Remove', testId: 'remove-reward', variant: 'secondary', attrs: { 'data-action': 'remove' } })}
        `,
      })
    })
    .join('')

  const addRewardForm = renderForm(
    'Add reward',
    'add-reward-form',
    `
      ${renderLabelledControl('Name', renderTextInput('name', { required: 'true', 'data-testid': 'add-reward-name' }))}
      ${renderLabelledControl('Price', renderTextInput('price', { type: 'number', min: '1', step: '1', required: 'true', 'data-testid': 'add-reward-price' }))}
      ${renderButton({ label: 'Add', attrs: { type: 'submit' } })}
      ${renderFormError('add-reward-error')}
    `,
  )

  return renderPageSection({
    ariaLabel: 'Personal rewards',
    testId: 'rewards-view',
    heading: 'Personal rewards',
    body: `
      <p>Reward balance: <strong data-testid="rewards-view-balance">${balance}</strong></p>
      <p class="ui-hint">Earn reward balance from line clears. Spend it here — not board balance.</p>
      ${renderList(listRows || '<li class="ui-empty" data-testid="rewards-empty">No rewards yet — add one below.</li>', 'rewards-list')}
      ${renderPanel({ body: addRewardForm })}
    `,
  })
}

function challengeName(challenge: Challenge): string {
  if (challenge.kind === 'universal') return 'Universal'
  const qualifier = challenge.qualifier ?? ''
  if (challenge.kind === 'cadence') return qualifier.charAt(0).toUpperCase() + qualifier.slice(1)
  return qualifier
}

function renderChallenges(state: GameState): string {
  const rows = state.challenges
    .map((challenge) => {
      const pct = Math.min(100, Math.round((challenge.progress / challenge.target) * 100))
      return `<li class="ui-challenge-row pool-item" data-testid="challenge-${escapeHtml(challenge.id)}">
        <span class="ui-challenge-row__label">${escapeHtml(challengeName(challenge))}</span>
        ${renderProgressBar(pct, `challenge-${escapeHtml(challenge.id)}-bar`)}
        <strong class="ui-challenge-row__count" data-testid="challenge-${escapeHtml(challenge.id)}-progress">${challenge.progress} / ${challenge.target}</strong>
      </li>`
    })
    .join('')

  return renderPageSection({
    ariaLabel: 'Challenges',
    testId: 'challenges-view',
    heading: 'Challenges',
    body: `
      <p class="ui-hint">A mark counts toward every challenge it qualifies for.</p>
      ${renderList(rows, 'challenge-list')}
    `,
  })
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

  return renderPageSection({
    ariaLabel: 'Statistics',
    testId: 'stats-view',
    heading: 'Statistics',
    body: `
      ${renderPanel({
        title: 'Overview',
        body: `<p>Lifetime score: <strong data-testid="stats-lifetime">${state.score.lifetime}</strong></p>
          <p>Average clears per day: <strong data-testid="stats-average">${averageClearsPerDay(state.stats).toFixed(2)}</strong></p>`,
      })}
      ${renderPanel({
        title: 'Clears by category',
        body: renderList(categoryRows || '<li class="ui-hint">No clears yet.</li>', 'stats-categories'),
      })}
      ${renderPanel({
        title: 'Clear history',
        body: renderList(dateRows || '<li class="ui-hint">No clears yet.</li>', 'stats-history'),
      })}
      ${renderPanel({
        title: 'Achievements',
        body: renderList(achievementRows, 'stats-achievements'),
      })}
    `,
  })
}

function bindNav(root: HTMLElement, h: ShellHandlers): void {
  const go = (action: string, view: ShellView) => {
    root.querySelectorAll(`[data-action="${action}"]`).forEach((el) => {
      el.addEventListener('click', () => h.onNavigate(view))
    })
  }
  go('board', 'home')
  go('pool', 'pool')
  go('rewards', 'rewards')
  go('stats', 'stats')
  go('settings', 'settings')
  go('actions', 'actions')
  go('challenges', 'challenges')
}

function bindHome(root: HTMLElement, h: ShellHandlers): void {
  const onEarly = () => showEarlyRelease(root)
  const markMode = h.boardTarget.kind === 'mark'
  root.querySelectorAll<HTMLElement>('[data-hold="cell"]').forEach((el) => {
    const index = Number(el.dataset.index)
    attachHold(el, {
      onComplete: () => {
        clearTilePeek(root)
        h.onMarkCell(index)
      },
      onEarly,
      onQuickTap: markMode
        ? () => toggleTilePeek(root, index)
        : undefined,
    })
  })
  root.querySelectorAll<HTMLElement>('[data-hold="mini"]').forEach((el) => {
    attachHold(el, {
      onComplete: () => h.onMarkMiniCell(Number(el.dataset.parentIndex), Number(el.dataset.innerIndex)),
      onEarly,
    })
  })
  root.querySelectorAll<HTMLElement>('[data-open]').forEach((el) => {
    el.addEventListener('click', () => h.onOpenTile(Number(el.dataset.index)))
  })
  // Recycle, swap and place still take a tap: they choose a cell, they do not mark it.
  if (h.boardTarget.kind !== 'mark') {
    root.querySelectorAll<HTMLButtonElement>('button.board-cell').forEach((btn) => {
      btn.addEventListener('click', () => h.onMarkCell(Number(btn.dataset.index)))
    })
  }
  root.querySelector('[data-testid="close-sheet"]')?.addEventListener('click', () => h.onCloseTile())
  root.querySelector('[data-testid="sheet-scrim"]')?.addEventListener('click', () => h.onCloseTile())
  root.querySelector('[data-testid="challenge-row"]')?.addEventListener('click', () => h.onNavigate('challenges'))
  root.querySelector('[data-testid="cancel-board-target"]')?.addEventListener('click', () => {
    h.onCancelBoardTarget()
  })
  root.querySelector('[data-testid="dismiss-empty-prompt"]')?.addEventListener('click', () => {
    h.onDismissEmptyPrompt()
  })
}

let sheetEscapeHandler: ((event: KeyboardEvent) => void) | null = null

function bindSheetA11y(root: HTMLElement, h: ShellHandlers): void {
  if (sheetEscapeHandler) {
    document.removeEventListener('keydown', sheetEscapeHandler)
    sheetEscapeHandler = null
  }
  const sheet = root.querySelector<HTMLElement>('[data-testid="tile-sheet"]')
  if (!sheet) return
  const focusables = () =>
    [...sheet.querySelectorAll<HTMLElement>('button, [href], input, select, textarea')].filter(
      (el) => !el.hasAttribute('disabled'),
    )
  sheetEscapeHandler = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      h.onCloseTile()
      return
    }
    if (event.key !== 'Tab') return
    const items = focusables()
    if (items.length === 0) return
    const first = items[0]!
    const last = items[items.length - 1]!
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
  document.addEventListener('keydown', sheetEscapeHandler)
}

function bindAdvancedView(root: HTMLElement, h: ShellHandlers): void {
  root.querySelectorAll<HTMLButtonElement>('[data-advanced-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.advancedView
      if (value === 'cell' || value === 'open') h.onSetAdvancedView(value)
    })
  })
}

function bindDisplay(root: HTMLElement, h: ShellHandlers): void {
  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.mode
      if (value === 'light' || value === 'dark') h.onSetMode(value)
    })
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

  root.querySelectorAll<HTMLElement>('[data-goal-id]').forEach((item) => {
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
