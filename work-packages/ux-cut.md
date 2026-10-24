# Work-package cut — UI/UX refinement (post WP-11)

**Status:** WP-12–WP-20 **closed** (delivered in #167 + completion PR). · **Baselined requirements:** v1.0 (unchanged unless a package adds new obligations)

**Deferred (optional, not blocking close):** board-only DOM patch on mark/clear (WP-20); automated lint that forbids raw px in new CSS; first-run hold coach (WP-16 optional).
**Scope:** Presentation and interaction quality only. No change to scoring, draw rules,
economy numbers, or grid sizing unless playtest decisions already recorded elsewhere
require it.
**Rule:** These packages do **not** appear in `partition_check.py` (that file maps
**requirement IDs** to link-4 build packages). This cut is a **second track** after
WP-01–WP-11. Package IDs here are **WP-12+** for continuity but live only in this file
until issues are opened.
**Authoritative home (when adopted):** GitHub issues, same as `cut.md`.

## Build order

| Order | Package | Blocks | Demonstrable outcome |
|------:|---------|--------|----------------------|
| 1 | WP-12 Design token contract | — | Spacing, type, radius, elevation, and motion exposed as CSS variables; no new raw hex/px in touched UI |
| 2 | WP-13 UI primitives | WP-12 | Shared render helpers for buttons, banners, forms, cards, progress, page headers; vitest on HTML output |
| 3 | WP-14 Shell refactor (foundation) | WP-13 | `shell.ts` uses primitives for banners, segmented controls, stat tiles, and Display/Pool forms; behavior unchanged |
| 4 | WP-15 Settings and navigation IA | WP-14 | Single Settings destination (mode + advanced tiles); thumb bar scannable on narrow phones; Display control removed from header orphan |
| 5 | WP-16 Board play affordances | WP-14 | Cancel armed recycle/swap/place; category color legend; improved large-grid readability (density/type, not new rules) |
| 6 | WP-17 Actions and currency clarity | WP-13 | Actions screen grouped sections, shared cost/affordance row; home hints tie three balances to Rewards vs Board spend |
| 7 | WP-18 Secondary view consistency | WP-13 | Challenges list uses same progress pattern as board row; stats achievements visually distinct; rewards empty state |
| 8 | WP-19 Responsive layout and PWA chrome | WP-14 | Breakpoints beyond centered 28rem column; tablet/desktop layout policy; manifest orientation and theme-color aligned with tokens |
| 9 | WP-20 Interaction quality and repaint | WP-14, WP-16 | Sheet focus trap and Escape; scroll preserved on non-board views; optional board-only DOM updates (no hold interruption) |

**First shippable slice:** **WP-12 → WP-14** (systemic consistency, invisible to most players).
**First player-visible slice:** add **WP-15** or **WP-17** after WP-14.
**Parallel after WP-13:** WP-17, WP-18, and WP-19 can proceed in parallel if WP-14 has
landed (shared primitives, no conflicting shell regions).

## Packages

### WP-12 — Design token contract

**Goal:** Extend the existing color token set (`tokens.ts`, GB-FUN-086) into a full
**visual contract** so new UI cannot drift.

**In scope**

- Semantic CSS variables for spacing, border radius, font sizes, font weights, shadows,
  and motion duration (map existing magic numbers in `style.css`).
- Document which tokens are mode-independent vs mode-specific (colors stay in `TOKENS`;
  spacing/radius may be static on `:root`).
- Align `--hold-ms` / `--moment-ms` with the contract.
- Lint or review rule: touched presentation code uses variables only (manual gate in PR
  description until automated).

**Out of scope**

- New color modes or category palette changes.
- Changing hold or moment durations (Q25 / playtest).

**Primary files:** `app/src/tokens.ts`, `app/src/style.css`, optional
`app/src/ui/tokens.css` or comment block in `style.css`.

**Verification:** Visual diff optional; `npm test` unchanged; inspect computed styles in
light/dark; no requirement back-map change unless new obligations are added.

**Revisit trigger:** Playtest asks for a third mode or new category slot count (would
touch `CATEGORY_SLOTS`, not this package alone).

---

### WP-13 — UI primitives

**Goal:** One implementation per repeated pattern; HTML string API consistent with
today's `shell.ts` approach (no framework migration).

**In scope**

- New module namespace, e.g. `app/src/ui/`:
  - `button`, `banner`, `segmented`, `formField`, `card` / `listRow`, `progressBar`,
    `pageHeader`, `sheetChrome` (structure only; game bind logic stays in shell).
- Shared helpers: `escapeHtml` (move from shell), optional `classes()`.
- Vitest: stable `data-testid` and variant classes on each primitive (mirror
  `shell.test.ts` style).

**Out of scope**

- Rewriting every screen in one PR.
- New game behavior.

**Blocks:** WP-12 (primitives reference token class names only).

**Verification:** Unit tests per primitive; zero change to GB-FUN behavior tests unless
testids move (update selectors in same PR).

---

### WP-14 — Shell refactor (foundation)

**Goal:** Reduce `shell.ts` duplication and establish the pattern for later screens.

**In scope**

- Refactor: inline banners, `statTile`, `advancedViewControl`, Display view, Pool add/edit
  forms, Rewards add form to call WP-13 primitives.
- Keep `renderShell` orchestration and all `bind*` functions; no change to handler
  signatures in `main.ts`.
- CSS: migrate duplicated button/form rules to primitive BEM blocks where it reduces
  `.pool__form` / `.shell__banner` duplication.

**Out of scope**

- Navigation IA (WP-15), Actions layout (WP-17), responsive breakpoints (WP-19).

**Verification:** Full `npm test`; existing shell tests green; manual smoke: mark, clear
moment, sheet, pool CRUD, mode switch.

---

### WP-15 — Settings and navigation IA

**Goal:** One mental model for “where preferences live” and faster thumb-bar scanning.

**In scope**

- Replace header **Display** button with **Settings** (or gear) entry reachable from thumb
  bar or consolidated menu; include light/dark and “Show advanced tiles” (remove duplicate
  from sheet **or** sheet shows read-only link to Settings — pick one in implementation).
- Thumb bar: improve narrow-phone legibility (abbreviations, two-line labels, or icons from
  `public/icons.svg` with text in `aria-label`).
- Update tests that target `action-display` / `display-view` testids (document migration in
  PR).

**Out of scope**

- Adding new prefs (density) unless WP-16 adds density and needs a home (then wire in WP-16
  follow-up).

**Depends on:** WP-14 (settings view built from primitives).

**Verification:** Shell tests updated; GB-FUN-080, GB-FUN-081, GB-FUN-084–088 behavior
unchanged (prefs still persist; mode still does not mark).

**Design note:** If header Display removal conflicts with GB-FUN-072 thumb set, add Settings
as seventh thumb item or replace least-used label — decide in issue, not by silently dropping
a requirement.

---

### WP-16 — Board play affordances

**Goal:** Lower friction on the primary screen without changing mark/clear rules.

**In scope**

- **Cancel** control while `boardTarget` is recycle, swap, or place (returns to `{ kind:
  'mark' }`, clears hint banner).
- **Category legend:** collapsible list mapping cue color to category name (uses existing
  palette slots).
- **Readability:** typography/spacing/padding adjustments for large boards and advanced
  cells (CSS + possibly `--board-density` token); must not hide cadence on cells
  (GB-FUN-071).
- Optional: first-session or first-mark copy for hold-to-mark (localStorage flag; no
  accounts).

**Out of scope**

- Hold duration changes (Q25).
- New board actions.

**Depends on:** WP-14 recommended (banners/buttons for cancel).

**Verification:** Tests for cancel + legend presence; manual hold and clear moment unchanged;
large grid sizes from `SUPPORTED_SIZES` inspected on small viewport.

---

### WP-17 — Actions and currency clarity

**Goal:** Tame the densest secondary screen and clarify the three balances.

**In scope**

- Restructure **Actions** into labeled sections (Recycle, Swap, Expand, Unlock, Place,
  Global unlock) using `pageHeader` + `card` + **cost row** primitive (price, disabled
  reason, primary action).
- Home **stat tiles** or short hint: which balance spends on Rewards vs Board actions
  (copy only, no ledger change).
- Reuse primitives from WP-13; no change to `purchase*` logic in `main.ts`.

**Out of scope**

- Changing costs, allowance levels, or unlock rules.
- Tutorial overlay with invented numbers.

**Depends on:** WP-13 (can parallel WP-14 if Actions HTML moved to `renderActions` only).

**Verification:** Existing economy tests unchanged; shell/actions manual smoke; disabled
buttons still match insufficient balance.

---

### WP-18 — Secondary view consistency

**Goal:** Same visual language as the board row across Challenges, Stats, Rewards.

**In scope**

- **Challenges:** progress bar + label pattern aligned with universal challenge row on home.
- **Stats:** locked vs unlocked achievements visually distinct (not text-only “(locked)”).
- **Rewards:** empty state and balance explanation consistent with WP-17 copy.
- **Pool:** optional list row polish (no workflow change to inline edit).

**Out of scope**

- Charts or external analytics.
- New achievement types.

**Depends on:** WP-13.

**Verification:** Shell/stats tests; GB-FUN-052–054, GB-FUN-063–064 display obligations still
met.

---

### WP-19 — Responsive layout and PWA chrome

**Goal:** Web and tablet feel intentional, not a phone column floating on desktop.

**In scope**

- Breakpoint policy documented in this file or `app/README` snippet:
  - narrow phone (default),
  - comfortable phone / small tablet (wider max-width),
  - ≥768px split or sidebar nav (board-first layout),
  - ≥1024px optional max width.
- `vite.config.ts` manifest: revisit `orientation: portrait` for web; `theme-color` /
  `background_color` aligned with light mode ground (and dark when installed).
- Load **Nunito** (or remove font-family reference) for consistent typography.
- Thumb bar vs side nav: implement at least one step above 28rem centering.

**Out of scope**

- Separate desktop app or native shell.

**Depends on:** WP-14 (shell grid regions stable).

**Verification:** Manual resize testing; Lighthouse PWA manifest check; no regression on
iPhone safe-area.

---

### WP-20 — Interaction quality and repaint

**Goal:** Fewer jarring full repaints; better keyboard and screen-reader behavior on
overlays.

**In scope**

- **Sheet:** focus trap, Escape closes, return focus to opening cell; scrim click unchanged.
- **Scroll:** preserve `shell__main` scroll position when repainting Pool/Stats/Actions (not
  when switching views — document expected behavior).
- **Board updates:** optional path to patch board/moment DOM instead of full `innerHTML`
  on mark/clear (must preserve GB-FUN-074: hold in progress not interrupted).
- Document interaction policies (when navigate home vs inline banner) in
  `app/src/ui/INTERACTION.md` or comment in `main.ts`.

**Out of scope**

- Toast stack replacing banners (could be follow-up WP if desired).
- Haptics (optional spike; not required for close).

**Depends on:** WP-14, WP-16 (sheet and board bindings well bounded).

**Verification:** New tests for focus/Escape where feasible; regression on moment timer and
hold; GB-FUN-074/077/078 manual pass.

---

## Optional follow-ups (not numbered until prioritized)

| Topic | Notes |
|-------|--------|
| Toast / notice stack | Replace multiple OK banners; offline-friendly |
| Haptic feedback | `navigator.vibrate` on hold complete / line clear where supported |
| Storybook or visual regression | If primitive count grows |
| Framework migration | Only if primitives prove insufficient; out of current cut |

## New requirements?

Packages above should **preserve** baselined GB-FUN/GB-CON behavior. Binding new UX
obligations (e.g. “shall provide a cancel control”) belongs in the design document and
requirement set before merge if they must be traced at link 3+. Cosmetic and IA changes
that restate existing display obligations do not need new IDs.

## Check

```bash
cd app && npm test
npm run build
```

No `partition_check.py` run for this file.
