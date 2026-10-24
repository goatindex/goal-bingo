import { escapeHtml } from './escape'
import { renderButton } from './button'

/** Economy action row: label, cost text, optional hint, primary control. */
export function renderCostRow(input: {
  label: string
  costLabel: string
  hint?: string
  buttonLabel: string
  testId: string
  disabled?: boolean
  buttonAttrs?: Record<string, string>
}): string {
  const hint = input.hint ? `<p class="ui-hint">${escapeHtml(input.hint)}</p>` : ''
  return `<div class="ui-cost-row">
    <div class="ui-cost-row__meta">
      <span class="ui-cost-row__label">${escapeHtml(input.label)}</span>
      <span class="ui-cost-row__cost">${escapeHtml(input.costLabel)}</span>
    </div>
    ${hint}
    ${renderButton({
      label: input.buttonLabel,
      testId: input.testId,
      disabled: input.disabled,
      attrs: input.buttonAttrs,
    })}
  </div>`
}
