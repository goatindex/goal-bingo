import './style.css'
import { loadState, saveState } from './storage'
import { renderShell, type ShellView } from './shell'
import { markCellAndResolve } from './lines'
import { addGoal, removeGoal, updateGoal } from './pool'
import {
  tryUnlockCustomCategory,
} from './categories'

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
      state.score.lifetime += result.outcome.scoreDelta
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
      state.categories = result.categories
      saveState(state)
      paint()
      return null
    },
    onDismissEmptyPrompt: () => {
      emptyPoolPrompt = false
      paint()
    },
  })
}

paint()

// Never request notification permission — shell must work without it (GB-CON-003).
