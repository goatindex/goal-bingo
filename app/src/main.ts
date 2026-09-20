import './style.css'
import { loadState, saveState } from './storage'
import { renderShell, type ShellView } from './shell'
import { addGoal, drawGoal, removeGoal, updateGoal, type DrawResult } from './pool'
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
let lastDraw: DrawResult | null = null

function paint(): void {
  renderShell(app!, state, {
    softReset,
    view,
    emptyPoolPrompt,
    lastDraw,
    onMarkPlaceholder: () => {
      // Mark / line-clear scoring lands in WP-03 / WP-05 — do not invent lifetime here.
      softReset = false
      paint()
    },
    onDrawPlaceholder: () => {
      const onBoardIds = new Set<string>() // board placement lands in WP-03
      const result = drawGoal(state.pool, Math.random, onBoardIds)
      lastDraw = result
      if (!result.ok) {
        emptyPoolPrompt = true
        view = 'pool'
      } else {
        emptyPoolPrompt = false
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

// Package B deep smoke: tiny comment to force deep-tier review.
