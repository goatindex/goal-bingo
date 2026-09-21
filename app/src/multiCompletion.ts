/** Multi-completion tiles: require N taps before marking (GB-FUN-045, GB-FUN-046). */

import type { AdvancedTile } from './board'

/** Default completions required when a tile is created without an explicit override (D-2026-09-21-18). */
export const DEFAULT_COMPLETIONS_REQUIRED = 3

export function createMultiCompletionTile(
  completionsRequired: number = DEFAULT_COMPLETIONS_REQUIRED,
): AdvancedTile {
  return { kind: 'multi-completion', completionsRequired, completionsSoFar: 0 }
}
