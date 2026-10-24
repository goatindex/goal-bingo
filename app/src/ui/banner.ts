import { escapeHtml } from './escape'

export type BannerVariant = 'default' | 'warn'

export function renderBanner(input: {
  message: string
  variant?: BannerVariant
  role?: 'alert' | 'status'
  testId?: string
  dismissTestId?: string
  dismissLabel?: string
}): string {
  const variant = input.variant ?? 'default'
  const role = input.role ?? (variant === 'warn' ? 'alert' : 'status')
  const dismiss = input.dismissTestId
    ? `<button type="button" class="ui-btn ui-btn--compact ui-btn--primary" data-testid="${escapeHtml(input.dismissTestId)}">${escapeHtml(input.dismissLabel ?? 'OK')}</button>`
    : ''
  return `<p class="ui-banner${variant === 'warn' ? ' ui-banner--warn' : ''}" role="${role}"${input.testId ? ` data-testid="${escapeHtml(input.testId)}"` : ''}>
    ${escapeHtml(input.message)}${dismiss}
  </p>`
}
