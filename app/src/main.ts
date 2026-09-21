import './style.css'
import { loadState, saveState } from './storage'
import { renderShell, type ShellView } from './shell'
import { markCellAndResolve } from './lines'
import { addGoal, removeGoal, updateGoal } from './pool'
import { addReward, purchaseReward, removeReward } from './rewards'
import {
  tryUnlockCustomCategory,
} from './categories'
import { addCategoryChallenge } from './challenges'

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
