# NEXT — Goal Bingo

_Convention: update at end of each working session. The weekly portfolio review reads it._

## Current focus

Design stage. The framing document (`docs/design-description.md`) is written and covers the
full vision; decisions are recorded. Nothing is built.

**The pre-link-3 checklist is complete** (pending merge of PRs #7, #8, #9). Six more open
questions are closed, two missing decision records are written, and §3.4, §4.2, §8.2, §9.2
are fully settled prose. Eighteen decisions are on record. The next step is link 3 —
requirements — starting with the glossary.

## Next up

- **Merge PRs #7, #8, #9** once adversarial reviews pass — #7 is already green.
- **Link 3 — requirements.** Pin the glossary first (*tile*, *cell*, *line*, *clear*,
  *pool*, *mark*, *balance* — one meaning each, no overlaps), then mine
  `docs/design-description.md` section by section using the `incose-requirements` skill.
  Requirements cite `design-description.md §n` as their source.
- **Wire the back-map gate** once a requirement set exists —
  `backmap_check.py --source docs/design-description.md --requirements requirements/`.
- **Link 4 — decomposition.** Cut the requirement set into work packages and prove the
  partition. Build order decided here, not before (`D-2026-09-19-4`).
- **Playtest against §10.4's felt-friction judgement** — jam frequency is measured and
  closed; the prototype exists to test whether ~5% draw share actually *feels* like
  "regular presence".

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

**Evening continuation — pre-link-3 questions and missing records (PRs #7, #8, #9):**

- **Q2/Q3/Q4/Q14 closed** — four §3.4 questions answered in one design conversation;
  three decision records written (D-13, D-14, D-15); §3.4 rewritten from open-questions
  prose to settled rules (PR #7, adversarial review passed).
  - Diagonals count as lines; simultaneous completion resolves every line with bonus points
  - Intersection cell is the visual focal point and multi-clear bonus anchor
  - Perpendicular progress is lost; compensation is a designated upgrade area (sim's Q14
    assumption confirmed — Q24 narrowed to swap and challenge-income assumptions only)
- **Q5 and Q18 closed, §4.2 missing D- record written** (PR #8, review running):
  - Categories are player-defined from day one; seven defaults ship — `health`, `study`,
    `creative`, `volunteering`, `relationship`, `home`, `work`; further categories unlock
    through progression (D-16). *Creative* replaces the original *hobby* placeholder.
  - Challenges: three types (universal, category, cadence) run in parallel; a mark counts
    toward every challenge it qualifies for simultaneously; the universal challenge is the
    coverage guarantee; rates are tuning (D-17). Category challenges unlock with their
    category — one mechanic, not two.
- **§9.2 missing D- record written** — local-first, no account required; sync deferred to
  Q12 (D-18, PR #9, review running).

**Earlier in the day — cadence taxonomy and simulation (PRs #1–6; all merged):**

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
  median, p99 one to two days, zero unresolved trials across every setting tested — the
  reserved tightening turned out not to be needed.
- **The simulation found a risk nobody had asked about.** Full jams are rare, as `D-3`
  predicted, but the long-term draw share governs *chronic partial blocking* — the share of
  lines constrained by an unmarked long-term goal at any moment — almost independent of
  player behaviour, ranging 28% to 75% across the values tested. This makes the draw share
  the single most load-bearing number for how the game feels. Set to ~5%
  (`D-2026-09-19-12`), targeting ~45–50% ambient blocking, after being put to a decision
  rather than left at the simulation's arbitrary starting default. §10.4 records the finding
  and the choice; four new questions (Q21–Q24) came out of building the instrument.

## Last updated

2026-09-19
