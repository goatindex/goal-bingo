import { describe, expect, it } from 'vitest'
import { renderBanner } from './banner'
import { renderButton } from './button'
import { renderSegmented } from './segmented'
import { renderStatTile } from './statTile'
import { renderProgressBar } from './progressBar'
import { renderFormError } from './formField'
import { renderListRow } from './listRow'

describe('ui primitives', () => {
  it('renders a dismissible warn banner', () => {
    const html = renderBanner({
      message: 'Not enough balance.',
      variant: 'warn',
      testId: 'action-notice',
      dismissTestId: 'dismiss-action-notice',
    })
    expect(html).toContain('ui-banner--warn')
    expect(html).toContain('data-testid="dismiss-action-notice"')
  })

  it('renders a primary button with test id', () => {
    expect(renderButton({ label: 'Recycle', testId: 'start-recycle', disabled: true })).toContain(
      'disabled',
    )
  })

  it('renders segmented control with aria-pressed', () => {
    const html = renderSegmented({
      name: 'Mode',
      dataAttr: 'data-mode',
      selected: 'dark',
      options: [
        { value: 'light', label: 'Light', testId: 'mode-light' },
        { value: 'dark', label: 'Dark', testId: 'mode-dark' },
      ],
    })
    expect(html).toContain('aria-pressed="false"')
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('data-testid="mode-dark"')
  })

  it('renders stat tile and progress bar', () => {
    expect(renderStatTile('Board', 12, 'board-balance')).toContain('data-testid="board-balance"')
    expect(renderProgressBar(40, 'challenge-progress')).toContain('width: 40%')
  })

  it('renders form error and list row', () => {
    expect(renderFormError('add-error')).toContain('ui-form__error')
    expect(renderListRow({ body: 'x', attrs: { 'data-goal-id': 'g1' } })).toContain('ui-list-row')
  })
})
