import { describe, expect, it } from 'vitest'
import { DEFAULT_COMPLETIONS_REQUIRED, createMultiCompletionTile } from './multiCompletion'

describe('createMultiCompletionTile (GB-FUN-045, D-2026-09-21-18)', () => {
  it('defaults to 3 completions required, starting at 0 progress', () => {
    expect(DEFAULT_COMPLETIONS_REQUIRED).toBe(3)
    expect(createMultiCompletionTile()).toEqual({
      kind: 'multi-completion',
      completionsRequired: 3,
      completionsSoFar: 0,
    })
  })

  it('stays fully parametric to an explicit override', () => {
    expect(createMultiCompletionTile(5)).toEqual({
      kind: 'multi-completion',
      completionsRequired: 5,
      completionsSoFar: 0,
    })
  })
})
