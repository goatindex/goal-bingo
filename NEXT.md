# NEXT — Goal Bingo

_Convention: update at end of each working session. The weekly portfolio review reads it._

## Current focus

Design stage. The framing document (`docs/design-description.md`) is written and covers the
full vision; the founding decisions are recorded. Nothing is built.

Links 0–2 are complete and merged (PR #1, PR #2). Twelve decisions, twenty-four questions
registered in §11 with three struck through as resolved. Three adversarial review passes
have run on the design; all findings are fixed. The reviewer is adopted and proven (PR #4,
PR #5).

**Q20 is answered, by simulation, and the recovery floor holds.** `sim/jam_sim.py` measured
time-to-unjam from a maximal jam at zero balance: median same-day, p99 one to three days,
zero trials still jammed after 180 days, across every setting tested. The reserved
tightening is not needed — see `sim/results.md` and §10.3.

**The simulation surfaced a bigger, unasked question: chronic partial blocking.** Full jams
are almost never reached in ordinary play, but the long-term draw share governs how much of
the board is *chronically* constrained — 28% of lines at a 2% share, up to 75% at 30%, and
this barely depends on player behaviour. `D-2026-09-19-3`'s prose describes occasional
friction; the mechanics at a careless default would have produced constant friction. The
draw share is set to ~5% (`D-2026-09-19-12`), targeting ~45–50% ambient blocking — see §10.4.

**Q13 is closed.** Board balance is fed by mark-based challenges, which keep paying during a
jam, and personal rewards spend from a separate budget so cashing out cannot strand the
player (`D-2026-09-19-6`); a free recycle allowance of one per 24 hours, upgradeable,
guarantees an action exists at zero balance (`D-2026-09-19-7`).

## Next up

- **Answer the cheap questions that gate mining.** Q2, Q3 and Q4 (line rules) and Q14
  (perpendicular progress destroyed by a clear) block §3.4. The tuning questions (Q1, Q7,
  Q8, Q10, Q17, Q21, Q22) do not need answers before a prototype exists and should not be
  guessed.
- **Q18 before any economy tuning.** Which mark-based challenges ship, and what each pays
  per mark and on completion. Load-bearing for the jam guarantee, not a progression nicety.
- **Q23 and Q24 are the simulation's own aftertaste.** Q23 asks whether ambient blocking
  should target a fixed share or vary with grid size — the sim held it roughly constant
  across grids 3/5/7 at a fixed draw share, but did not test whether 50% of 6 lines *feels*
  like 50% of 14. Q24 asks whether the sim's harsher assumptions (Q14 read as marks lost,
  swap not modelled, challenge income idealised) should be re-run once those settle, to
  confirm the floor still holds under friendlier ones. Neither blocks a prototype.
- **Write the missing decision records.** §9.2 commits to local-first with no account, and
  §4.2 to fixed categories before user-defined ones. Both state rejected alternatives in
  prose but have no `D-` record, so the reverse walk has no root for them.
- **Link 3 — requirements.** Fix the entity, boundary and glossary first; the entity is the
  app, and terms like *tile*, *cell*, *line*, *clear*, *pool*, *mark* and *balance* need
  pinning down before any `shall` is written. Requirements cite `design-description.md <n>`
  as their source.
- **Wire the back-map gate** once a requirement set exists — `backmap_check.py --source
  docs/design-description.md --requirements requirements/`. The design description is
  already written to the format it parses (37 numbered headings, verified against the
  gate's own section reader, with `requirements: none` declarations on the 12 that state no
  obligation).
- **Link 4 — decomposition.** Cut the set into work packages and prove the partition. This
  is where the build order for the full vision gets decided (`D-2026-09-19-4`).
- **Playtest against §10.4's felt-friction judgement**, not against jam frequency — jam
  frequency is now measured and closed. Whatever prototype gets built should be built to
  test whether ~5% draw share actually feels like "regular presence", not to look finished.

## Done means

Design stage is done when the requirement set is baselined, the back-map runs clean in both
directions, and link 4 has cut it into work packages with a shippable first package.

## Parked

- Repo hygiene the other projects have and this one does not yet: docs lint gate, issue
  labels and forms. Worth adding before the first build work, not before the requirements
  exist. (Branch protection is unavailable on a private repo under the current plan — F-36;
  the session hook is what enforces branch-and-PR here.)
- Whether the reviewer's **sticky summary** is worth chasing. Its prompt says to always post
  one; on the first real run it posted an inline finding and left the review body empty. The
  workflow's verification step passes on the *existence* of a review, not its content, so a
  summary-less review reads as green. Fixing it means changing the master in
  `goatindex/claude-workflow`, which affects every consumer — not a goal-bingo decision.
- **Mine the prototype before building.** `v1-phaser-prototype` has working Phaser scene
  management, a layout manager, a UI container and an audio system. Its *game* is not this
  game (`D-2026-09-19-5`), but that scaffolding is real and reading it is cheaper than
  rediscovering it.
- Local clutter left behind by the old build: `godot-mcp/` (a separate 32M third-party
  tool, untracked and left alone), plus ignored `node_modules/`, `test-results/`,
  `playwright-report/` and `tests/`. Clear them whenever; nothing depends on them.
- Whether this project gets a `project-tracking` hub entry alongside the other projects.

## Done (2026-09-19 session)

- **Intake:** new work, entering at link 1 and taking the full chain. Impact: requirements
  none, work packages none — an earlier Phaser prototype existed in this repo but had
  entered no chain link, so there was no requirement or work package to affect. Recorded as
  new work superseding unchained code, not as a change (`D-2026-09-19-5`).
- Cleared `goatindex/goal-bingo` to design stage. The prototype is preserved at tag
  `v1-phaser-prototype` and in history; nothing was force-pushed or rewritten.
- **Link 1 — decisions.** Five records in `DECISIONS.md`: mobile-first PWA
  (`D-2026-09-19-1`), marks persist until the line clears (`D-2026-09-19-2`), long-term
  goals block by design with advanced tiles as the later release valve (`D-2026-09-19-3`),
  the design description covering the full vision with the cut deferred to link 4
  (`D-2026-09-19-4`), and restarting rather than evolving the prototype
  (`D-2026-09-19-5`).
- **Link 2 — framing.** Wrote `docs/design-description.md`: 36 numbered sections, 12
  carrying explicit `requirements: none` declarations, 16 open questions registered rather
  than guessed at.
- **Link 6 — review.** An adversarial review of the design found eight substantive defects,
  all fixed on the branch before merge. The important one: §10.3's risk analysis was wrong.
  It named board jam as the central risk and claimed three guards, but two of the three do
  not hold — the grid-aware draw is preventive only and cannot run on an already-jammed
  board, and advanced tiles are not present at first release by decision. The real worst
  case is an **economic trap**: balance is earned only by clearing, so a jammed board earns
  nothing and cannot pay for the power-ups that would unjam it.
- **Q13 answered, same session.** Two decisions close it (`D-2026-09-19-6`,
  `D-2026-09-19-7`). The key observation is that **marking still works on a jammed board;
  only clearing stops** — so board balance is fed by mark-based challenges and cannot be
  switched off by a jam, while personal rewards spend from a separate budget. Beneath that
  sits a free recycle: one per 24 hours, upgradeable, so an action exists even at zero. Side
  effects: the tile power-up is renamed *recycle*, challenges are now constrained to be
  mark-based rather than clear-based, and the game gains its first timer (an allowance
  refreshing, not a mark decaying — `D-2026-09-19-2` stands).
- **Two further review passes on the fix**, both finding real defects. Pass 2: challenges
  might never pay during a jam, and a recycle might hand back another blocker — closed by
  `D-2026-09-19-8`, `D-2026-09-19-9` and `D-2026-09-19-10`. Pass 3: §4.4 stated the
  load-bearing placement rule as a *preference* while §6.2 and §10.3 restated it as an
  *absolute*, and board balance was not actually guaranteed because it pays only on a mark
  counting toward a challenge. Both closed. Findings narrowed across the three passes from a
  wrong risk model, to unstated assumptions, to statement-strength precision.
- **Both design PRs merged**, each carrying its review record as a comment, each using the
  documented `GUARD_ALLOW_UNREVIEWED=1` exception because this repo had no reviewer workflow
  at the time.
- **Link 6 — the reviewer is adopted** (PR #4). The house `adversarial-review` workflow
  rather than WeeWoo's `claude-review.yml`, which is tuned to WeeWoo's own issue contract;
  the house one holds no repository-specific convention and reads this repo's `CLAUDE.md`
  instead. Taken as a generated copy through master-and-copy — `copies.txt`,
  `scripts/refresh_copies.py`, `--check` clean. `CLAUDE_CODE_OAUTH_TOKEN` is set. PR #4's own
  check failed by design, because `claude-code-action` refuses to run on a pull request that
  adds its own workflow file, so that merge took the last recorded
  `GUARD_ALLOW_UNREVIEWED=1`.
- **Added `CLAUDE.md`**, which the reviewer reads for conventions — recording what the three
  review passes actually caught rather than generic advice.
- **Smoke-tested on PR #5** and the reviewer posted a real inline finding, which was acted
  on. The exception should not be needed again.
- **Cadence taxonomy.** Goals now sit on two independent axes: category (theme — health,
  study, ...) and cadence (rhythm — hourly, daily, weekly, long-term). The three recurring
  tiers are what the document calls "short-term"; long-term stays the one-off blocker
  (`D-2026-09-19-11`).
- **Built `sim/jam_sim.py`** to answer Q20 without a UI: a headless model of the board,
  weighted draw, recycle rules, and four player behaviours, standard library only. Results
  in `sim/results.md`. **Q20 closed**: the recovery floor breaks a maximal jam same-day at
  median, p99 one to three days, zero unresolved trials across every setting tested — the
  reserved tightening turned out not to be needed.
- **The simulation found a risk nobody had asked about.** Full jams are rare, as `D-3`
  predicted, but the long-term draw share governs *chronic partial blocking* — the share of
  lines constrained by an unmarked long-term goal at any moment — almost independent of
  player behaviour, ranging 28% to 75% across the values tested. This makes the draw share
  the single most load-bearing number for how the game feels. Set to ~5%
  (`D-2026-09-19-12`), targeting ~45–50% ambient blocking, after being put to a decision
  rather than left at the simulation's arbitrary starting default. §10.4 records the finding
  and the choice; four new questions (Q21–Q24) came out of building the instrument.
