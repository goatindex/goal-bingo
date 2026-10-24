import { describe, expect, it } from 'vitest'
import { LAYOUT_CSS_VARS, applyLayoutTokens } from './layoutTokens'

describe('layout tokens (WP-12)', () => {
  it('defines spacing and radius variables', () => {
    expect(LAYOUT_CSS_VARS['--space-4']).toBe('1rem')
    expect(LAYOUT_CSS_VARS['--radius-lg']).toBe('16px')
  })

  it('applies variables to a root element', () => {
    const props: string[] = []
    applyLayoutTokens({
      style: {
        setProperty(name: string) {
          props.push(name)
        },
      },
    })
    expect(props).toContain('--content-max')
  })
})
