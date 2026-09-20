import './style.css'
import { loadState, saveState } from './storage'
import { renderShell } from './shell'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('#app root missing')
}

const { state, softReset } = loadState()

function paint(resetFlag: boolean): void {
  renderShell(app!, state, {
    softReset: resetFlag,
    onMarkPlaceholder: () => {
      // Local-only mark stub — no network, no permissions (GB-CON-004).
      saveState(state)
      const cell = app!.querySelector('[data-testid="mark-cell"]')
      if (cell) cell.textContent = 'Marked (placeholder)'
    },
  })
}

paint(softReset)

// Never request notification permission — shell must work without it (GB-CON-003).
