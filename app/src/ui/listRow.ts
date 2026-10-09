import { escapeHtml } from './escape'
import { classes } from './classes'

export function renderListRow(input: {
  body: string
  className?: string
  attrs?: Record<string, string>
}): string {
  const attrStr = Object.entries(input.attrs ?? {})
    .map(([k, v]) => ` ${k}="${escapeHtml(v)}"`)
    .join('')
  return `<li class="${classes(['ui-list-row', input.className])}"${attrStr}>${input.body}</li>`
}

export function renderList(items: string, testId?: string): string {
  return `<ul class="ui-list"${testId ? ` data-testid="${escapeHtml(testId)}"` : ''}>${items}</ul>`
}
