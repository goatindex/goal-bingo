/** The clear moment (GB-FUN-073, GB-FUN-014, D-2026-09-26-1): which cells cleared and
 *  what that clear scored, shown on the already-refilled board. It holds nothing: the
 *  board stays playable while it is up (GB-FUN-074). */

/** Provisional (Q25): how long the moment stays up is open; this is the one constant. */
export const MOMENT_MS = 2600

export type ClearMoment = {
  id: number
  /** Cells to mark as just cleared and refilled. */
  cells: number[]
  /** The multi-clear focal point: cells shared by two or more clearing lines. */
  intersection: number[]
  points: number
  title: string
  detail: string
}

export type ClearFacts = {
  scoreDelta: number
  clearedLineCount: number
  refilledCells: number[]
  intersectionCells: number[]
}

/** Null when nothing cleared. A mini-grid line that completes without clearing a
 *  main-board line still scores, so it gets a moment on its parent cell. */
export function clearMoment(id: number, facts: ClearFacts, parentIndex?: number): ClearMoment | null {
  const lines = facts.clearedLineCount
  if (lines === 0) {
    if (facts.scoreDelta <= 0 || parentIndex === undefined) return null
    return {
      id,
      cells: [parentIndex],
      intersection: [],
      points: facts.scoreDelta,
      title: 'Mini-grid line cleared',
      detail: 'Scored inside the tile.',
    }
  }
  return {
    id,
    cells: [...facts.refilledCells],
    intersection: lines > 1 ? [...facts.intersectionCells] : [],
    points: facts.scoreDelta,
    title: lines === 1 ? 'Line cleared' : lines === 2 ? 'Double clear' : `${lines} lines cleared`,
    detail:
      lines === 1
        ? `${facts.refilledCells.length} cells refilled.`
        : 'The starred cell finished every line. Bonus included.',
  }
}
