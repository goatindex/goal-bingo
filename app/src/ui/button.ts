import { escapeHtml } from './escape'
import { classes } from './classes'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'default' | 'compact'

export function renderButton(input: {
  label: string
  testId?: string
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  pressed?: boolean
  attrs?: Record<string, string>
}): string {
  const variant = input.variant ?? 'primary'
  const size = input.size ?? 'default'
  const extra = input.attrs ?? {}
  const attrStr = Object.entries(extra)
    .map(([k, v]) => ` ${k}="${escapeHtml(v)}"`)
    .join('')
  return `<button type="button" class="${classes([
    'ui-btn',
    variant === 'secondary' && 'ui-btn--secondary',
    variant === 'ghost' && 'ui-btn--ghost',
    size === 'compact' && 'ui-btn--compact',
  ])}"${input.testId ? ` data-testid="${escapeHtml(input.testId)}"` : ''}${input.disabled ? ' disabled' : ''}${input.pressed !== undefined ? ` aria-pressed="${input.pressed}"` : ''}${attrStr}>${escapeHtml(input.label)}</button>`
}
