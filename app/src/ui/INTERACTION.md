# UI interaction policies (Goal Bingo shell)

These rules keep marking, sheets, and navigation predictable. Game logic lives in
`main.ts`; presentation and binding live in `shell.ts`.

## Navigation

- Primary destinations use the thumb bar on narrow viewports and the sidebar on
  viewports ≥768px. Settings stays in the header (`action-display` test id).
- Changing view resets armed board targets (`recycle` / `swap` / `place`) to ordinary
  mark mode and closes the advanced-tile sheet.

## Banners and notices

- **Empty pool**, **action refused**, and **challenge completion** use inline banners
  with an OK dismiss — no toast stack; works offline.
- **Armed board modes** show a target hint banner plus **Cancel** (returns to mark mode).

## Scroll

- When the same non-home view repaints (e.g. editing the pool), `shell__main` scroll
  position is preserved. Switching views scrolls from the top.

## Press-and-hold (GB-FUN-009)

- Hold completion must not be interrupted by a clear moment ending (GB-FUN-074). The
  moment ends via `endMoment()` without a full shell repaint when the timer fires.
- Full `renderShell` repaints re-bind holds on board cells.

## Quick tap to peek (read small tiles)

- In ordinary mark mode, a quick tap on a holdable board cell enlarges it 50% (centred,
  overlapping neighbours) so the goal text is easier to read. Another quick tap on that
  cell, or a quick tap anywhere else on the shell, shrinks it back.
- Press-and-hold on an enlarged cell still runs the normal mark fill; the cell returns to
  normal size when the mark completes.

## Advanced-tile sheet (GB-FUN-077/078)

- **Escape** closes the sheet; focus returns to the board cell that opened it.
- Focus is trapped inside the sheet while open (Tab cycles close + interactive cells).
- Scrim click closes; same as Close.

## Display preferences (GB-FUN-080/085)

- Mode and “Show advanced tiles” never mutate game state or mark cells.
