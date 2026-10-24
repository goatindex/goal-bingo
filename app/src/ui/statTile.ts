import { escapeHtml } from './escape'

export function renderStatTile(label: string, value: number, testId: string): string {
  return `<div class="ui-stat"><strong data-testid="${escapeHtml(testId)}">${value}</strong><span>${escapeHtml(label)}</span></div>`
}
