# Goal Bingo — application

Vite + TypeScript PWA. Requirements trace to `../requirements/`; UX refinement packages
are listed in `../work-packages/ux-cut.md`.

## Scripts

```bash
npm install
npm run dev       # http://localhost:5173/
npm run build     # dist/ for GitHub Pages (/goal-bingo/)
npm test
```

## Responsive layout (WP-19)

| Viewport | Layout |
|----------|--------|
| Default phone | Single column; bottom thumb bar |
| ≥480px | Wider max width; slightly larger board cells (`--board-density`) |
| ≥768px | Two-column **home** (status + legend beside board); **sidebar nav** replaces thumb bar |
| ≥1024px | Same grid; thumb label typography token |

Tokens: `layoutTokens.ts` (spacing, radius, type) + `tokens.ts` (light/dark colors).

UI primitives: `src/ui/`. Interaction policies: `src/ui/INTERACTION.md`.
