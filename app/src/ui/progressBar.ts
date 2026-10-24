export function renderProgressBar(percent: number, testId?: string): string {
  const pct = Math.min(100, Math.max(0, percent))
  return `<span class="ui-progress" ${testId ? `data-testid="${testId}"` : ''} aria-hidden="true"><span class="ui-progress__fill" style="width: ${pct}%"></span></span>`
}
