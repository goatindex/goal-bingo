import { escapeHtml } from './escape'

/** Sheet shell markup only; bind logic stays in shell.ts (GB-FUN-077/078). */
export function renderSheetChrome(input: {
  title: string
  category: string
  kindLabel: string
  body: string
  hint: string
  styleAttr?: string
}): string {
  return `
    <div class="sheet-scrim" data-testid="sheet-scrim" aria-hidden="true"></div>
    <section class="sheet" role="dialog" aria-modal="true" aria-label="${escapeHtml(input.title)}"${input.styleAttr ?? ''} data-testid="tile-sheet">
      <div class="sheet__top">
        <span class="sheet__chip">${escapeHtml(input.category)}</span>
        <span class="sheet__kind">${escapeHtml(input.kindLabel)}</span>
        <button type="button" class="sheet__close" data-testid="close-sheet" aria-label="Close">Close</button>
      </div>
      <h2 class="sheet__title">${escapeHtml(input.title)}</h2>
      <p class="shell__hint">${escapeHtml(input.hint)}</p>
      ${input.body}
    </section>
  `
}
