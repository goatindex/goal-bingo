# Constraints — Goal Bingo

Platform, data, economy, and scope constraints mined from `docs/design-description.md`.

---

## 9.1 — Form factor

### GB-CON-001 — Progressive web app, installable
statement: Goal Bingo shall run as a progressive web app that the player can install to
  the device home screen.
type: constraint
rationale: Mobile-first PWA is the platform choice. D-2026-09-19-1.
trace-to-source: design-description.md 9.1
verification-method: inspection
verification-criteria: The app passes the installability criteria for the target browsers
  and can be added to the home screen on iOS and Android.
verification-status: not-verified
owner: k
priority: must

### GB-CON-002 — One-handed phone usability
statement: Goal Bingo shall make each primary game action reachable with the thumb of one
  hand on a smartphone screen of 5 to 7 inches diagonal.
type: constraint
rationale: That is where a habit gets marked. 9.1. Primary actions are: mark, view board,
  view balance, recycle.
trace-to-source: design-description.md 9.1
verification-method: inspection
verification-criteria: Each of mark, board view, balance view, and recycle is accessible
  without repositioning the hand on a 5–7 inch phone.
verification-status: not-verified
owner: k
priority: must

### GB-CON-003 — All mechanics function without notification permission
statement: When the operating system denies notification permission, Goal Bingo shall
  continue to provide each game mechanic without degradation.
type: constraint
rationale: Notification reliability cannot be guaranteed for a PWA. 9.1.
trace-to-source: design-description.md 9.1
verification-method: test
verification-criteria: With notification permission denied, each game mechanic — marking,
  clearing, power-ups, challenges, statistics — is fully accessible.
verification-status: not-verified
owner: k
priority: must

---

## 9.2 — Data

### GB-DAT-001 — Local-first data storage
statement: Goal Bingo shall store each of the player's pool, board state, score, balances,
  and rewards on the local device by default.
type: data
rationale: The player's data is personal. Default is local-first with no account.
  D-2026-09-19-18.
trace-to-source: design-description.md 9.2
verification-method: test
verification-criteria: Each data item is readable and writable with the network interface
  fully disabled.
verification-status: not-verified
owner: k
priority: must

### GB-DAT-002 — No account required
statement: Goal Bingo shall provide access to each game feature without requiring the
  player to create an account or provide personal identification.
type: data
rationale: D-2026-09-19-18.
trace-to-source: design-description.md 9.2
verification-method: test
verification-criteria: A fresh install can be played through the full game loop without a
  sign-up prompt, account creation, or credential entry.
verification-status: not-verified
owner: k
priority: must

### GB-DAT-003 — Offline operation
statement: Goal Bingo shall complete each game action without error when the device has no
  active network connection.
type: data
rationale: Local-first; no network dependency. D-2026-09-19-18.
trace-to-source: design-description.md 9.2
verification-method: test
verification-criteria: With the device in aeroplane mode, each game action completes
  without error or degraded state.
verification-status: not-verified
owner: k
priority: must

---

## 3.3 — No external verification

### GB-CON-004 — Mark requires only touch input
statement: Goal Bingo shall accept a mark on a cell using only the player's touch input,
  without requiring network access or device permissions beyond touch.
type: constraint
rationale: Marking is self-reported. Gating a mark behind external verification adds a
  class of failure the game gains nothing from. 3.3.
trace-to-source: design-description.md 3.3
verification-method: test
verification-criteria: Marking a cell succeeds with the network disabled and with no
  permissions other than touch enabled.
verification-status: not-verified
owner: k
priority: must

---

## 5.3 — Balance separation

### GB-CON-005 — Board balance purchase flow excludes personal rewards
statement: If the player initiates a personal reward purchase, Goal Bingo shall present
  reward balance as the sole payment source.
type: constraint
rationale: The two balances are separate budgets. D-2026-09-19-6.
trace-to-source: design-description.md 5.3
verification-method: test
verification-criteria: The personal reward purchase flow shows only the reward balance
  counter; board balance is not visible as a payment option.
verification-status: not-verified
owner: k
priority: must

### GB-CON-006 — Reward balance purchase flow excludes board actions
statement: If the player initiates a board action purchase, Goal Bingo shall present board
  balance as the sole payment source.
type: constraint
rationale: D-2026-09-19-6.
trace-to-source: design-description.md 5.3
verification-method: test
verification-criteria: The board action purchase flow (power-ups, recycles, grid expansion)
  shows only the board balance counter; reward balance is not visible as a payment option.
verification-status: not-verified
owner: k
priority: must
notes: Board actions covered: power-ups, recycles, grid expansion.

### GB-CON-007 — Lifetime score has no spend path
statement: If the player performs each available action in Goal Bingo, Goal Bingo shall
  leave the lifetime score unchanged.
type: constraint
rationale: Lifetime score is a record, not a currency. D-2026-09-19-6.
trace-to-source: design-description.md 5.3
verification-method: test
verification-criteria: No user action decreases the lifetime score.
verification-status: not-verified
owner: k
priority: must

---

## 6.2 — Recycle constraints

### GB-CON-008 — Recycle unavailable on marked tiles
statement: If the player selects a marked tile for recycle, Goal Bingo shall reject the
  action.
type: constraint
rationale: A mark is never destroyed before its line clears. D-2026-09-19-10,
  D-2026-09-19-2.
trace-to-source: design-description.md 6.2
verification-method: test
verification-criteria: Selecting a marked tile in the recycle flow produces no state change.
verification-status: not-verified
owner: k
priority: must

---

## 10.2 — Non-goals (scope exclusions)

### GB-CON-009 — No inter-player data sharing
statement: If Goal Bingo handles each player's game state, Goal Bingo shall store and
  display only that player's own data.
type: constraint
rationale: The audience is the player alone. 10.2.
trace-to-source: design-description.md 10.2
verification-method: inspection
verification-criteria: No feature transmits or displays game state belonging to another
  player.
verification-status: verified
owner: k
priority: must
notes: Verified by inspection of `app/src`: game state stays in local storage, and no path sends another player's state.

### GB-CON-010 — No goal-verification integration
statement: Goal Bingo shall accept each mark using only player input, without connecting to
  a health API, sensor, or external verification service.
type: constraint
rationale: 10.2, 3.3.
trace-to-source: design-description.md 10.2 design-description.md 3.3
verification-method: inspection
verification-criteria: No goal-verification integration exists in the codebase.
verification-status: verified
owner: k
priority: must
notes: Verified by inspection of `app/src`: a mark is a tap, with no health, sensor, or external verification call.

### GB-CON-011 — No real-money balance purchase
statement: Goal Bingo shall provide each balance exclusively through in-game play, with no
  in-app purchase flow for reward balance or board balance.
type: constraint
rationale: Both balances are earned through play only. 10.2.
trace-to-source: design-description.md 10.2
verification-method: inspection
verification-criteria: No in-app purchase flow exists for either balance.
verification-status: verified
owner: k
priority: must
notes: Verified by inspection of `app/src/rewards.ts` and the board-balance actions: purchases spend in-game balances only.

---

## 8.2 — Income floor constraint

### GB-CON-012 — Board balance income survives a jam
statement: While each line on the board contains an unmarked long-term goal, Goal Bingo
  shall award board balance when the player marks each non-long-term tile on the board.
type: constraint
rationale: The universal challenge pays per mark, not per clear. Marking still works when
  nothing is clearing. D-2026-09-19-6, D-2026-09-19-8.
trace-to-source: design-description.md 8.2 design-description.md 10.3
verification-method: test
verification-criteria: With the board in a maximal jam, making a mark on each non-long-term
  tile increases board balance.
verification-status: not-verified
owner: k
priority: must

---

## Recovery floor and expansion (soft constraints)

### GB-CON-013 — Recovery floor property
statement: As measured by sim/jam_sim.py under its documented assumptions, Goal Bingo shall
  target a median time-to-unjam of same-day and a 99th percentile of time-to-unjam at or
  below 2 days; this is a probabilistic property subject to re-verification, not an absolute
  guarantee (D-2026-09-20-2).
type: constraint
rationale: The recovery floor is probabilistic and measured. Naming the property keeps it
  visible without claiming a hard bound. Process enforcement is deferred to link 5.
  D-2026-09-20-2.
trace-to-source: design-description.md 10.3
verification-method: analysis
verification-criteria: Running sim/jam_sim.py at the shipped long-term draw share reports
  median time-to-unjam of same-day and p99 of at most 2 days, with zero trials still jammed
  after 180 simulated days.
verification-status: verified
owner: k
priority: must
notes: Verified from `sim/results.md`'s experiment A1 (grid 5, untightened — the
  shipped configuration, since the Q20 tightening was never adopted): median 0.0
  days, p99 at most 1.0 day, 0/300 capped, across every player profile
  (`D-2026-09-21-21`).

### GB-CON-014 — Expansion preserves the recovery floor
statement: Goal Bingo shall set grid-expansion pricing and unlock rules so that the
  probabilistic recovery-floor targets in GB-CON-013 still hold under sim/jam_sim.py at each
  expanded grid size; this is the same soft property, not an absolute guarantee
  (D-2026-09-20-3).
type: constraint
rationale: Expansion raises jam risk. Binding the principle now leaves the formula open
  (price, progression gate, or both). D-2026-09-20-3.
trace-to-source: design-description.md 3.1 design-description.md 6.2 design-description.md 10.3
verification-method: analysis
verification-criteria: For each supported grid size, sim/jam_sim.py run at that static
  size meets the GB-CON-013 verification criteria. The sim does not model mid-game expansion
  transitions; static-size runs are the accepted proxy until an expansion-aware model exists.
verification-status: verified
owner: k
priority: must
notes: Verified from `sim/results.md`'s experiment A4, `grid = 7` table: the same
  thresholds as GB-CON-013 are met across every player profile (`D-2026-09-21-21`).
  Grid-expansion pricing (`D-2026-09-21-9`) does not affect this — it is irrelevant
  to recovery dynamics once the expanded size is reached.
