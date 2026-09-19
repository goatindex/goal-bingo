# NEXT — Goal Bingo

_Convention: update at end of each working session. The weekly portfolio review reads it._

## Current focus

Design stage. The framing document (`docs/design-description.md`) is written and covers the
full vision; the founding decisions are recorded. Nothing is built.

The next move is **link 3 — requirements**: mine the design description section by section
into a conformant requirement set, using the `incose-requirements` skill. Twelve open
questions (§11) need answers before the sections that depend on them can be mined, but most
sections do not depend on them and can be mined now.

## Next up

- **Answer the open questions that gate mining.** Q2, Q3, Q4 (line rules) and Q9 (the
  two-counter model) block §3.4 and §5.3 and are cheap to settle. The tuning questions (Q1,
  Q6, Q7, Q8, Q10) do not need answers before a prototype exists and should not be guessed.
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
  labels and forms, the agent reviewer workflow. Worth adding before the first build work,
  not before the requirements exist. (Branch protection is unavailable on a private repo
  under the current plan — F-36; the session hook is what enforces branch-and-PR here.)
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
- **Link 1 — decisions.** Four records in `DECISIONS.md`: mobile-first PWA
  (`D-2026-09-19-1`), marks persist until the line clears (`D-2026-09-19-2`), long-term
  goals block by design with advanced tiles as the later release valve (`D-2026-09-19-3`),
  and the design description covering the full vision with the cut deferred to link 4
  (`D-2026-09-19-4`).
- **Link 2 — framing.** Wrote `docs/design-description.md`: twelve numbered sections, four
  carrying explicit `requirements: none` declarations, twelve open questions registered
  rather than guessed at.
