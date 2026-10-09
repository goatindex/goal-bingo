import { escapeHtml } from './escape'

export type SegmentedOption = { value: string; label: string; testId?: string }

export function renderSegmented(input: {
  name: string
  options: SegmentedOption[]
  selected: string
  dataAttr: string
}): string {
  return `<div class="ui-segmented" role="group" aria-label="${escapeHtml(input.name)}">
    ${input.options
      .map(
        (opt) =>
          `<button type="button" class="ui-segmented__btn" ${input.dataAttr}="${escapeHtml(opt.value)}"${opt.testId ? ` data-testid="${escapeHtml(opt.testId)}"` : ''} aria-pressed="${opt.value === input.selected}">${escapeHtml(opt.label)}</button>`,
      )
      .join('')}
  </div>`
}
