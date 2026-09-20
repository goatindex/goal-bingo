import './style.css'
import { loadState, saveState } from './storage'
import { renderShell, type ShellView } from './shell'
import { addGoal, drawGoal, removeGoal, updateGoal, type DrawResult } from './pool'
import {
  CUSTOM_CATEGORY_SCORE_GATE,
  DEFAULT_CATEGORIES,
  canUnlockCustomCategory,
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
let lastDraw: DrawResult | null = null

function paint(): void {
  renderShell(app!, state, {
    softReset,
    view,
    emptyPoolPrompt,
    lastDraw,
    onMarkPlaceholder: () => {
      // Local-only mark stub — advances lifetime for category unlock testing.
      state.score.lifetime += 1
      saveState(state)
      softReset = false
      paint()
    },
    onDrawPlaceholder: () => {
      const result = drawGoal(state.pool)
      lastDraw = result
      if (!result.ok) {
        emptyPoolPrompt = true
        view = 'pool'
      }
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
      const trimmed = name.trim().toLowerCase()
      if (!canUnlockCustomCategory(state.score.lifetime)) {
        return `Custom categories unlock at lifetime score ${CUSTOM_CATEGORY_SCORE_GATE}.`
      }
      const defaults = new Set<string>(DEFAULT_CATEGORIES)
      const customCount = state.categories.filter((c) => !defaults.has(c)).length
      if (customCount >= 1) return 'Custom category slot already used.'
      if (!trimmed) return 'Name is required.'
      if (state.categories.includes(trimmed)) return 'Category already exists.'
      state.categories = [...state.categories, trimmed]
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
