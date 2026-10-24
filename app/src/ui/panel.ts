import { escapeHtml } from './escape'

export function renderPanel(input: { title?: string; headingLevel?: 'h2' | 'h3'; body: string; className?: string }): string {
  const tag = input.headingLevel ?? 'h3'
  const title = input.title
    ? `<${tag} class="ui-panel__title">${escapeHtml(input.title)}</${tag}>`
    : ''
  return `<div class="ui-panel${input.className ? ` ${escapeHtml(input.className)}` : ''}">${title}${input.body}</div>`
}

export function renderPageSection(input: {
  ariaLabel: string
  testId: string
  heading: string
  body: string
}): string {
  return `<section class="ui-page" aria-label="${escapeHtml(input.ariaLabel)}" data-testid="${escapeHtml(input.testId)}">
    <h2 class="ui-page__heading">${escapeHtml(input.heading)}</h2>
    ${input.body}
  </section>`
}
