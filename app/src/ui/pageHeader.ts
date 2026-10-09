import { escapeHtml } from './escape'

export function renderPageHeader(title: string, subtitle?: string): string {
  const sub = subtitle ? `<p class="ui-hint">${escapeHtml(subtitle)}</p>` : ''
  return `<header class="ui-page-header"><h2 class="ui-page__heading">${escapeHtml(title)}</h2>${sub}</header>`
}
