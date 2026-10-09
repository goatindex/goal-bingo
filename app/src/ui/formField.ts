import { escapeHtml } from './escape'

export function renderFormError(testId: string, hidden = true): string {
  return `<p class="ui-form__error" data-testid="${escapeHtml(testId)}"${hidden ? ' hidden' : ''}></p>`
}

export function renderLabelledControl(label: string, control: string): string {
  return `<label class="ui-field">${escapeHtml(label)} ${control}</label>`
}

export function renderTextInput(name: string, attrs: Record<string, string> = {}): string {
  const extra = Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${escapeHtml(v)}"`)
    .join('')
  return `<input class="ui-field__control" name="${escapeHtml(name)}"${extra} />`
}

export function renderSelect(name: string, optionsHtml: string, attrs: Record<string, string> = {}): string {
  const extra = Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${escapeHtml(v)}"`)
    .join('')
  return `<select class="ui-field__control" name="${escapeHtml(name)}"${extra}>${optionsHtml}</select>`
}

export function renderForm(title: string, testId: string, body: string): string {
  return `<form class="ui-form" data-testid="${escapeHtml(testId)}"><h3 class="ui-form__title">${escapeHtml(title)}</h3>${body}</form>`
}
