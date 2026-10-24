/** Mode-independent layout tokens (WP-12). Colors stay in tokens.ts / GB-FUN-086.
 *  Spacing, radius, and type do not change between light and dark; category fills and
 *  surfaces are mode-specific and applied via applyMode(). */
export const LAYOUT_CSS_VARS: Record<string, string> = {
  '--space-1': '0.25rem',
  '--space-2': '0.5rem',
  '--space-3': '0.75rem',
  '--space-4': '1rem',
  '--space-5': '1.25rem',
  '--space-6': '1.75rem',
  '--radius-sm': '10px',
  '--radius-md': '12px',
  '--radius-lg': '16px',
  '--radius-xl': '28px',
  '--text-xs': '0.7rem',
  '--text-sm': '0.85rem',
  '--text-md': '0.95rem',
  '--text-lg': '1.25rem',
  '--text-xl': '1.75rem',
  '--weight-strong': '800',
  '--shadow-cell': '0 3px 0 var(--line)',
  '--shadow-sheet': '0 6px 0 var(--line)',
  '--duration-fast': '160ms',
  '--content-max': '28rem',
  '--content-comfortable': '36rem',
  '--board-density': '1',
}

export function applyLayoutTokens(root: { style: { setProperty(name: string, value: string): void } }): void {
  for (const [name, value] of Object.entries(LAYOUT_CSS_VARS)) {
    root.style.setProperty(name, value)
  }
}
