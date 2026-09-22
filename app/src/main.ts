import './style.css'
import { loadState, saveState } from './storage'
import { renderShell, type ShellView } from './shell'
import { markCellAndResolve } from './lines'
import { addGoal, removeGoal, updateGoal } from './pool'
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
  recordAdvancedTileProgress,
} from './advancedUnlock'
import { applyPassivePlacement, placeOnUnlock } from './advancedPlacement'

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

function paint(): void {
  renderShell(app!, state, {
    softReset,
    view,
    emptyPoolPrompt,
    lastIntersectionCells,
    onMarkCell: (index) => {
      softReset = false
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
      if (isNewMark && tappedCell) {
        const progressed = progressChallenges(state.challenges, tappedCell.goal)
        state.challenges = progressed.challenges
        state.score.boardBalance +=
          BOARD_BALANCE_PER_MARK + progressed.completedCount * CHALLENGE_TARGET
        // GB-FUN-043: lifetime per-category mark count, independent of the
        // challenge counters above (which reset) and stats.clearsByCategory (which
        // counts cleared cells, not marks).
        const accessBefore = state.advancedTileAccess
        state.advancedTileAccess = recordAdvancedTileProgress(
          state.advancedTileAccess,
          tappedCell.goal.category,
        )
        // D-2026-09-21-23: the moment a track newly unlocks, place one tile of that
        // type immediately rather than waiting on the passive chance below.
        for (const track of newlyUnlockedTracks(accessBefore, state.advancedTileAccess, tappedCell.goal.category)) {
          const placed = placeOnUnlock(
            state.board,
            track,
            tappedCell.goal.category,
            state.advancedTileAccess,
            state.pool,
          )
          state.board = placed.board
          state.advancedTileAccess = placed.access
        }
        // D-2026-09-21-22 / D-2026-09-22-1: per-track global progression — total
        // lifetime marks may unlock every still-locked category for a track at once.
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
        // GB-FUN-063/064: evaluated after stats/challenges update, using the same
        // no-op guard so a re-tap can't re-check (harmless but wasteful) conditions.
        const newAchievements = evaluateAchievements(state.achievements, {
          totalClears: totalClears(state.stats),
          boardSize: state.board.size,
          hadVarietyCombo: result.outcome.hadVarietyCombo,
          clearsByDate: state.stats.clearsByDate,
        })
        if (newAchievements.length > 0) {
          state.achievements = [...state.achievements, ...newAchievements]
        }
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
    onNavigate: (next) => {
      view = next
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
