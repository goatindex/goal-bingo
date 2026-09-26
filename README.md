# Goal Bingo

A continuous bingo game played with your own goals. Real goals fill the cells of a grid;
completing one marks its cell; completing a line clears it, scores it, and refills those
cells from your goal pool. Points buy personal rewards you set yourself, and power-ups that
change the board.

Mobile-first progressive web app. Single player. No accounts, no verification, no coaching.

## Where things are

| File | What it is |
|---|---|
| [`app/`](app/) | Product PWA (Vite + TypeScript). Start here for build work. |
| [`requirements/`](requirements/) | Baselined requirement set (v1.0). |
| [`work-packages/cut.md`](work-packages/cut.md) | Link-4 partition into packages. |
| [`docs/design-description.md`](docs/design-description.md) | The design. Prose, numbered sections, the source requirements are mined from. |
| [`DECISIONS.md`](DECISIONS.md) | Decision records. The root of the trace. |
| [`NEXT.md`](NEXT.md) | Current focus and next actions. Updated at the end of each session. |
| [`sim/jam_sim.py`](sim/jam_sim.py) | A design instrument, not product code. Answers open questions in the design by measurement — [`sim/results.md`](sim/results.md) closed Q20. |

## App

```bash
cd app
npm install
npm run dev      # local shell
npm run build    # installable PWA output in app/dist
npm test         # 197 vitest unit tests, typecheck + suite gated in CI
```

Scope-exclusion inspection from repo root:

```bash
python scripts/check_scope_exclusions.py
```

## Status

Links 0–4 complete for the current cut. Link 5's build phase is complete: WP-01
through WP-10 are closed, and the advanced-tile draw/placement gap those packages
left open is closed too. Requirements are baselined at v1.0 (2026-09-20).

An earlier Phaser 3.70 prototype of a different version of this idea lives at tag
`v1-phaser-prototype`. It was superseded rather than evolved (`D-2026-09-19-5`) and is kept
as a reference, not a baseline.

This project follows the nine-link trace chain
([CHAIN.md](https://github.com/goatindex/project-tracking/blob/main/CHAIN.md) in
`goatindex/project-tracking`).

Section numbers in the design description are **append-only** — requirements cite them by
number, and renumbering breaks those pointers silently.
