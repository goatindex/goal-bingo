import './style.css'
import { loadState, saveState } from './storage'
import { renderShell, type BoardTarget, type ShellView } from './shell'
import { markCellAndResolve } from './lines'
import { addGoal, removeGoal, updateGoal, type Goal } from './pool'
import { addReward, purchaseReward, removeReward } from './rewards'
import {
  tryUnlockCustomCategory,
} from './categories'
import { addCategoryChallenge, progressChallenges, BOARD_BALANCE_PER_MARK, CHALLENGE_TARGET } from './challenges'
import { recordClear, totalClears } from './stats'
import { evaluateAchievements } from './achievements'
import {
  ADVANCED_TILE_TRACKS,
  applyGlobalAdvancedTileProgress,
  newlyUnlockedCategories,
  newlyUnlockedTracks,
  purchaseAdvancedTileUnlock,
  purchaseGlobalAdvancedTileUnlock,
  recordAdvancedTileProgress,
  type AdvancedTileTrack,
} from './advancedUnlock'
import { applyPassivePlacement, placeAdvancedTile, placeOnUnlock } from './advancedPlacement'
import { applyPassivePlacementToExposed, purchaseGridExpansion } from './expansion'
import { purchaseAllowanceUpgrade, recycleCell } from './recycle'
import { swapCells } from './swap'
import { markMiniGridCellOnBoard } from './miniGrid'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('#app root missing')
}

const loaded = loadState()
const state = loaded.state
let softReset = loaded.softReset
let view: ShellView = 'home'
let emptyPoolPrompt = false
let lastIntersectionCells: number[] = []
let boardTarget: BoardTarget = { kind: 'mark' }
let actionNotice: string | null = null

function placeTrack(track: AdvancedTileTrack, category: string): void {
  const placed = placeOnUnlock(state.board, track, category, state.advancedTileAccess, state.pool)
  state.board = placed.board
  state.advancedTileAccess = placed.access
}

function refuseAction(message: string): void {
  actionNotice = message
  boardTarget = { kind: 'mark' }
  paint()
}

function handleTargetTap(index: number): void {
  const cell = state.board.cells[index]
  if (!cell) return
  if (boardTarget.kind === 'recycle') {
    const result = recycleCell(
      state.board,
      state.pool,
      index,
      state.recycle,
      state.score.boardBalance,
    )
    if (!result.ok) {
      if (result.reason === 'empty-pool') {
        emptyPoolPrompt = true
        view = 'pool'
        boardTarget = { kind: 'mark' }
        paint()
        return
      }
      refuseAction(
        result.reason === 'marked'
          ? 'Marked cells cannot be recycled.'
          : 'Not enough board balance.',
      )
      return
    }
    state.board = result.board
    state.recycle = result.recycle
    state.score.boardBalance = result.boardBalance
    boardTarget = { kind: 'mark' }
    actionNotice = null
    saveState(state)
    paint()
    return
  }
  if (boardTarget.kind === 'swap') {
    if (boardTarget.first === null) {
      boardTarget = { kind: 'swap', first: index }
      paint()
      return
    }
    const first = boardTarget.first
    if (first === index) {
      boardTarget = { kind: 'swap', first: null }
      paint()
      return
    }
    const result = swapCells(state.board, first, index, state.score.boardBalance)
    if (!result.ok) {
      refuseAction(
        result.reason === 'not-adjacent'
          ? 'Those cells are not next to each other.'
          : 'Not enough board balance.',
      )
      return
    }
    state.board = result.board
    state.score.boardBalance = result.boardBalance
    boardTarget = { kind: 'mark' }
    actionNotice = null
    saveState(state)
    paint()
    return
  }
  if (boardTarget.kind === 'place') {
    const result = placeAdvancedTile(
      state.board,
      index,
      boardTarget.track,
      state.advancedTileAccess,
      state.score.boardBalance,
      state.pool,
    )
    if (!result.ok) {
      const message =
        result.reason === 'marked'
          ? 'Marked cells cannot become an advanced tile.'
          : result.reason === 'already-advanced'
            ? 'That cell is already an advanced tile.'
            : result.reason === 'not-unlocked'
              ? 'That category is not unlocked for this tile type.'
              : result.reason === 'empty-pool'
                ? 'The pool is empty — add a goal before drawing.'
                : 'Not enough board balance.'
      if (result.reason === 'empty-pool') {
        emptyPoolPrompt = true
        view = 'pool'
        boardTarget = { kind: 'mark' }
        paint()
        return
      }
      refuseAction(message)
      return
    }
    state.board = result.board
    state.score.boardBalance = result.boardBalance
    boardTarget = { kind: 'mark' }
    actionNotice = null
    saveState(state)
    paint()
  }
}

/** Side effects shared by a main-board mark and an unmarked mini-grid inner tap
 *  (D-2026-09-23-1). One genuine mark pays 1 board balance, progresses challenges,
 *  and counts toward advanced-tile unlocks. A repeat tap must not call this. */
function noteGenuineMark(goal: Goal, hadVarietyCombo: boolean): void {
  const progressed = progressChallenges(state.challenges, goal)
  state.challenges = progressed.challenges
  state.score.boardBalance +=
    BOARD_BALANCE_PER_MARK + progressed.completedCount * CHALLENGE_TARGET
  const accessBefore = state.advancedTileAccess
  state.advancedTileAccess = recordAdvancedTileProgress(
    state.advancedTileAccess,
    goal.category,
  )
  for (const track of newlyUnlockedTracks(accessBefore, state.advancedTileAccess, goal.category)) {
    const placed = placeOnUnlock(
      state.board,
      track,
      goal.category,
      state.advancedTileAccess,
      state.pool,
    )
    state.board = placed.board
    state.advancedTileAccess = placed.access
  }
  const accessBeforeGlobal = state.advancedTileAccess
  state.advancedTileAccess = applyGlobalAdvancedTileProgress(
    state.advancedTileAccess,
    state.categories,
  )
  for (const track of ADVANCED_TILE_TRACKS) {
    for (const category of newlyUnlockedCategories(
      accessBeforeGlobal,
      state.advancedTileAccess,
      track,
    )) {
      const placed = placeOnUnlock(
        state.board,
        track,
        category,
        state.advancedTileAccess,
        state.pool,
      )
      state.board = placed.board
      state.advancedTileAccess = placed.access
    }
  }
  const newAchievements = evaluateAchievements(state.achievements, {
    totalClears: totalClears(state.stats),
    boardSize: state.board.size,
    hadVarietyCombo,
    clearsByDate: state.stats.clearsByDate,
  })
  if (newAchievements.length > 0) {
    state.achievements = [...state.achievements, ...newAchievements]
  }
}

function paint(): void {
  renderShell(app!, state, {
    softReset,
    view,
    emptyPoolPrompt,
    lastIntersectionCells,
    boardTarget,
    actionNotice,
    onMarkCell: (index) => {
      softReset = false
      if (boardTarget.kind !== 'mark') {
        handleTargetTap(index)
        return
      }
      // Read before markCellAndResolve: if this mark completes a line through this very
      // cell, the cell is refilled with a new goal as part of that same call, so the
      // result's board no longer holds the goal that was actually marked.
      const tappedCell = state.board.cells[index]
      const isNewMark = tappedCell !== undefined && !tappedCell.marked
      const result = markCellAndResolve(state.board, index, state.pool)
      if (!result.ok) {
        // 'invalid-cell' cannot happen from a tap on a rendered cell; 'empty-pool'
        // means the refill couldn't draw - surface the same prompt the pool view uses.
        if (result.reason === 'empty-pool') {
          emptyPoolPrompt = true
          view = 'pool'
        }
        paint()
        return
      }
      state.board = result.outcome.board
      // GB-FUN-003 / GB-FUN-033: a clear's value feeds both counters identically -
      // lifetime score as a permanent record, reward balance as spendable currency.
      state.score.lifetime += result.outcome.scoreDelta
      state.score.rewardBalance += result.outcome.scoreDelta
      // GB-FUN-052/053/054: recordClear is itself a no-op when clearedLineCount is 0.
      state.stats = recordClear(
        state.stats,
        result.outcome.clearedCategories,
        result.outcome.clearedLineCount,
      )
      // GB-FUN-004/056/060/061/062, GB-CON-012: re-tapping an already-marked cell is a
      // no-op (board.ts's markCell) and must not progress challenges or pay board
      // balance again - only a genuine unmarked-to-marked transition counts.
      if (isNewMark && tappedCell && tappedCell.advanced?.kind !== 'mini-grid') {
        noteGenuineMark(tappedCell.goal, result.outcome.hadVarietyCombo)
      }
      // D-2026-09-21-23: cells this clear just legally refilled with a plain goal may
      // become an advanced tile instead - a pending guarantee from the block above, or
      // the passive chance for any track unlocked in that cell's category. Applied
      // after the block above so a pending placement created by this same mark is
      // available to be consumed immediately, not just on a later refill.
      if (result.outcome.refilledCells.length > 0) {
        const placement = applyPassivePlacement(
          state.board,
          result.outcome.refilledCells,
          state.advancedTileAccess,
          state.pool,
        )
        state.board = placement.board
        state.advancedTileAccess = placement.access
      }
      lastIntersectionCells = result.outcome.intersectionCells
      emptyPoolPrompt = false
      saveState(state)
      paint()
    },
    onMarkMiniCell: (parentIndex, innerIndex) => {
      softReset = false
      const parent = state.board.cells[parentIndex]
      const inner =
        parent?.advanced?.kind === 'mini-grid' ? parent.advanced.cells[innerIndex] : undefined
      // D-2026-09-23-1: one point per unmarked inner tap. The parent itself is not a
      // mark, and a second tap of an already-marked inner cell pays nothing.
      const isNewInnerMark = inner !== undefined && !inner.marked
      const result = markMiniGridCellOnBoard(state.board, parentIndex, innerIndex, state.pool)
      if (!result.ok) {
        if (result.reason === 'empty-pool') {
          emptyPoolPrompt = true
          view = 'pool'
        }
        paint()
        return
      }
      state.board = result.board
      state.score.lifetime += result.scoreDelta
      state.score.rewardBalance += result.scoreDelta
      const mainClear = result.mainClear
      state.stats = recordClear(
        state.stats,
        mainClear?.clearedCategories ?? [],
        mainClear?.clearedLineCount ?? 0,
      )
      if (isNewInnerMark && inner) {
        noteGenuineMark(inner.goal, mainClear?.hadVarietyCombo ?? false)
      }
      if (mainClear && mainClear.refilledCells.length > 0) {
        const placement = applyPassivePlacement(
          state.board,
          mainClear.refilledCells,
          state.advancedTileAccess,
          state.pool,
        )
        state.board = placement.board
        state.advancedTileAccess = placement.access
      }
      lastIntersectionCells = mainClear?.intersectionCells ?? []
      emptyPoolPrompt = false
      saveState(state)
      paint()
    },
    onNavigate: (next) => {
      view = next
      boardTarget = { kind: 'mark' }
      paint()
    },
    onDismissActionNotice: () => {
      actionNotice = null
      paint()
    },
    onStartRecycle: () => {
      boardTarget = { kind: 'recycle' }
      view = 'home'
      actionNotice = null
      paint()
    },
    onStartSwap: () => {
      boardTarget = { kind: 'swap', first: null }
      view = 'home'
      actionNotice = null
      paint()
    },
    onStartPlace: (track) => {
      boardTarget = { kind: 'place', track }
      view = 'home'
      actionNotice = null
      paint()
    },
    onUpgradeAllowance: () => {
      const result = purchaseAllowanceUpgrade(state.recycle, state.score.boardBalance)
      if (!result.ok) {
        actionNotice =
          result.reason === 'max-level'
            ? 'Free recycles are already at the maximum.'
            : 'Not enough board balance.'
        paint()
        return
      }
      state.recycle = result.recycle
      state.score.boardBalance = result.boardBalance
      actionNotice = null
      saveState(state)
      paint()
    },
    onExpand: () => {
      const oldSize = state.board.size
      const result = purchaseGridExpansion(state.board, state.pool, state.score.boardBalance)
      if (!result.ok) {
        if (result.reason === 'empty-pool') {
          emptyPoolPrompt = true
          view = 'pool'
          paint()
          return
        }
        actionNotice =
          result.reason === 'max-size'
            ? 'The board is already as large as it can be.'
            : 'Not enough board balance.'
        paint()
        return
      }
      state.board = result.board
      state.score.boardBalance = result.boardBalance
      const placed = applyPassivePlacementToExposed(
        state.board,
        oldSize,
        state.advancedTileAccess,
        state.pool,
      )
      state.board = placed.board
      state.advancedTileAccess = placed.access
      const earned = evaluateAchievements(state.achievements, {
        totalClears: totalClears(state.stats),
        boardSize: state.board.size,
        hadVarietyCombo: false,
        clearsByDate: state.stats.clearsByDate,
      })
      if (earned.length > 0) state.achievements = [...state.achievements, ...earned]
      actionNotice = null
      saveState(state)
      paint()
    },
    onPurchaseUnlock: (track, category) => {
      const result = purchaseAdvancedTileUnlock(
        state.advancedTileAccess,
        track,
        category,
        state.score.boardBalance,
      )
      if (!result.ok) {
        actionNotice =
          result.reason === 'already-unlocked'
            ? 'That tile type is already unlocked for this category.'
            : 'Not enough board balance.'
        paint()
        return
      }
      state.advancedTileAccess = result.access
      state.score.boardBalance = result.boardBalance
      placeTrack(track, category)
      actionNotice = null
      saveState(state)
      paint()
    },
    onPurchaseGlobal: (track) => {
      const before = state.advancedTileAccess
      const result = purchaseGlobalAdvancedTileUnlock(
        before,
        track,
        state.categories,
        state.score.boardBalance,
      )
      if (!result.ok) {
        actionNotice =
          result.reason === 'nothing-to-unlock'
            ? 'Every category already has this tile type.'
            : 'Not enough board balance.'
        paint()
        return
      }
      state.advancedTileAccess = result.access
      state.score.boardBalance = result.boardBalance
      for (const category of newlyUnlockedCategories(before, result.access, track)) {
        placeTrack(track, category)
      }
      actionNotice = null
      saveState(state)
      paint()
    },
    onAddGoal: (input) => {
      const result = addGoal(state.pool, input, state.categories)
      if (!result.ok) return result.error
      state.pool = result.pool
      emptyPoolPrompt = false
      saveState(state)
      paint()
      return null
    },
    onUpdateGoal: (id, input) => {
      const result = updateGoal(state.pool, id, input, state.categories)
      if (!result.ok) return result.error
      state.pool = result.pool
      saveState(state)
      paint()
      return null
    },
    onRemoveGoal: (id) => {
      state.pool = removeGoal(state.pool, id)
      saveState(state)
      paint()
    },
    onAddCategory: (name) => {
      const result = tryUnlockCustomCategory(state.categories, state.score.lifetime, name)
      if (!result.ok) return result.error
      const addedCategory = result.categories[result.categories.length - 1]!
      state.categories = result.categories
      // GB-FUN-058: unlocking a category immediately creates its challenge.
      state.challenges = addCategoryChallenge(state.challenges, addedCategory)
      saveState(state)
      paint()
      return null
    },
    onAddReward: (input) => {
      const result = addReward(state.rewards, input)
      if (!result.ok) return result.error
      state.rewards = result.rewards
      saveState(state)
      paint()
      return null
    },
    onRemoveReward: (id) => {
      state.rewards = removeReward(state.rewards, id)
      saveState(state)
      paint()
    },
    onPurchaseReward: (id) => {
      const result = purchaseReward(state.rewards, id, state.score.rewardBalance)
      // 'not-found' cannot happen from a tap on a rendered reward; 'insufficient-
      // balance' is already prevented by the disabled Buy button, but the state
      // update stays server-side-checked regardless of the UI's own disabling.
      if (!result.ok) return
      state.score.rewardBalance = result.rewardBalance
      saveState(state)
      paint()
    },
    onDismissEmptyPrompt: () => {
      emptyPoolPrompt = false
      paint()
    },
  })
}

paint()

// Never request notification permission — shell must work without it (GB-CON-003).
