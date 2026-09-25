import { describe, expect, it } from 'vitest'
import { emptyPoolPromptHtml } from './shell'

describe('empty pool prompt (GB-FUN-065)', () => {
  it('shows the edit-pool prompt when a draw was refused', () => {
    const html = emptyPoolPromptHtml(true)
    expect(html).toContain('data-testid="empty-pool-prompt"')
    expect(html).toContain('add a goal before drawing')
  })

  it('shows nothing when the pool can still draw', () => {
    expect(emptyPoolPromptHtml(false)).toBe('')
  })
})
