# NEXT — Goal Bingo

_Convention: update at end of each working session. The weekly portfolio review reads it._

## Current focus

Design stage. The framing document (`docs/design-description.md`) is written and covers the
full vision; the founding decisions are recorded. Nothing is built.

Links 0–2 are complete and merged (PR #1, PR #2). Ten decisions, twenty-one questions
registered in §11 with two struck through as resolved. Three adversarial review passes have
run; all findings are fixed.

**The recommended next move is the Q20 simulation, not link 3.** Q20 measures expected
time-to-unjam and needs no UI — just the board, the weighted draw and the recycle rules. It
validates the recovery floor *before* link 3 mints permanent requirement IDs against §10.3
and §6.2, which are the sections all three reviews landed on. If the tail is long, the
tightening is already written down and nothing downstream needs unpicking.

**Q13 is closed, and nothing else blocks a prototype.** The economic trap is answered from
both ends: board balance is fed by mark-based challenges, which keep paying during a jam,
and personal rewards spend from a separate budget so cashing out cannot strand the player
(`D-2026-09-19-6`); and a free recycle allowance of one per 24 hours, upgradeable,
guarantees an action exists at zero balance (`D-2026-09-19-7`).

**The floor is sound in structure but unbounded in time, and that is the one open risk.**
Reviews two and three found the guarantee assumed things it had not established: that
challenges pay during a jam (fixed — they pay per mark, `D-2026-09-19-8`), that a recycle
produces something markable (it does not always — `D-2026-09-19-9` accepts a probabilistic
floor to preserve §4.3's friction), and that board balance is earned at all (fixed — §8.2
now requires a matching challenge to always be active). Expected time-to-unjam should be
finite and small and the worst case is unbounded, but **neither number is established.**

## Next up

- **Answer the cheap questions that gate mining.** Q2, Q3 and Q4 (line rules) and Q14
  (perpendicular progress destroyed by a clear) block §3.4. The tuning questions (Q1, Q6,
  Q7, Q8, Q10, Q17) do not need answers before a prototype exists and should not be guessed.
- **Q18 before any economy tuning.** Which mark-based challenges ship, and what each pays
  per mark and on completion. This is now load-bearing for the jam guarantee rather than a
  progression nicety — board balance cannot be tuned until it exists.
- **Q20 is the prototype's headline measurement.** Expected time-to-unjam from a maximal jam
  at zero balance. It is simulable without any UI, so it can be answered before a playable
  build exists — and it is the one number that says whether the recovery floor works.
- **Q19 rides with it.** Whether one free recycle per 24 hours outpaces re-jamming. The rate
  was chosen on daily rhythm, not on evidence.
- **Write the missing decision records.** §9.2 commits to local-first with no account, and
  §4.2 to fixed categories before user-defined ones. Both state rejected alternatives in
  prose but have no `D-` record, so the reverse walk has no root for them.
- **Link 3 — requirements.** Fix the entity, boundary and glossary first; the entity is the
  app, and terms like *tile*, *cell*, *line*, *clear*, *pool*, *mark* and *balance* need
  pinning down before any `shall` is written. Requirements cite `design-description.md <n>`
  as their source.
- **Wire the back-map gate** once a requirement set exists — `backmap_check.py --source
  docs/design-description.md --requirements requirements/`. The design description is
  already written to the format it parses (36 numbered headings, verified against the
  gate's own section reader, with `requirements: none` declarations on the 12 that state no
  obligation).
- **Link 4 — decomposition.** Cut the set into work packages and prove the partition. This
  is where the build order for the full vision gets decided (`D-2026-09-19-4`).
- **Build the deadlock test first.** §10.3 names the design's central risk. Whatever
  prototype gets built should be built to test that, not to look finished.

## Done means

Design stage is done when the requirement set is baselined, the back-map runs clean in both
directions, and link 4 has cut it into work packages with a shippable first package.

## Parked

- Repo hygiene the other projects have and this one does not yet: docs lint gate, issue
  labels and forms. Worth adding before the first build work, not before the requirements
  exist. (Branch protection is unavailable on a private repo under the current plan — F-36;
  the session hook is what enforces branch-and-PR here.)
- ~~The adversarial reviewer needs its secret~~ — **done 2026-09-19.** The workflow is
  adopted as a generated copy, `CLAUDE_CODE_OAUTH_TOKEN` is set, and PR #4 merged. Its own
  check failed by design: `claude-code-action` refuses to run when a pull request adds or
  modifies its own workflow file, so that merge took the last recorded
  `GUARD_ALLOW_UNREVIEWED=1`. From here the reviewer runs on every non-draft pull request
  and the exception should not be needed again.
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
- **Both PRs merged**, each carrying its review record as a comment, each using the
  documented `GUARD_ALLOW_UNREVIEWED=1` exception because this repo has no reviewer workflow
  yet. Porting WeeWoo's `claude-review.yml` would remove the need for that.
