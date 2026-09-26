import { describe, expect, it } from 'vitest'
import { clearMoment } from './moment'

describe('clear moment (GB-FUN-073, GB-FUN-014)', () => {
  it('names the refilled cells and the score of a single-line clear', () => {
    const m = clearMoment(1, {
      scoreDelta: 12,
      clearedLineCount: 1,
      refilledCells: [0, 1, 2, 3, 4],
      intersectionCells: [],
    })
    expect(m).toMatchObject({ cells: [0, 1, 2, 3, 4], points: 12, intersection: [], title: 'Line cleared' })
  })

  it('makes the shared cell the focal point of a double clear', () => {
    const m = clearMoment(2, {
      scoreDelta: 27,
      clearedLineCount: 2,
      refilledCells: [5, 6, 7, 8, 9, 0, 10, 15, 20],
      intersectionCells: [5],
    })
    expect(m?.intersection).toEqual([5])
    expect(m?.title).toBe('Double clear')
    expect(m?.points).toBe(27)
  })

  it('shows a scoring mini-grid line on its parent cell when no main line clears', () => {
    const m = clearMoment(3, { scoreDelta: 6, clearedLineCount: 0, refilledCells: [], intersectionCells: [] }, 12)
    expect(m).toMatchObject({ cells: [12], points: 6, intersection: [] })
  })

  it('is null when nothing cleared', () => {
    expect(clearMoment(4, { scoreDelta: 0, clearedLineCount: 0, refilledCells: [], intersectionCells: [] }, 12)).toBeNull()
    expect(clearMoment(5, { scoreDelta: 0, clearedLineCount: 0, refilledCells: [], intersectionCells: [] })).toBeNull()
  })
})
