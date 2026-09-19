# Goal Bingo — working conventions

A continuous bingo game played with the player's own real-life goals. **Design stage:
nothing is built.** The repository holds a design document, decision records and a session
log, and that is all it should hold until link 3 produces a requirement set.

## The chain

This project follows the nine-link trace chain
([CHAIN.md](https://github.com/goatindex/project-tracking/blob/main/CHAIN.md)). Links 0–2
are complete. The next link is 3, requirements, mined from the design document.

## The design document is the source, not the obligation

`docs/design-description.md` is prose that requirements are mined from at link 3. Two rules
follow from that, and both are load-bearing:

- **Section numbers are append-only.** A requirement cites `design-description.md 4.2`.
  Renumbering a section silently breaks every pointer to it. Add new sections at the end of
  their parent; never renumber to tidy up.
- **The file must keep parsing with the back-map gate.** Headings are `## N Title` /
  `### N.M Title`. A section stating no obligation carries
  `<!-- requirements: none - reason -->`. Verify with `backmap_check.py` from the
  `incose-requirements` skill after editing.

## Do not invent specifics

No point values, prices, grid sizes, rates or thresholds are settled. A guessed number reads
as fact once it is a requirement and gets built against. **Register it as a question in §11
instead.** This is not caution for its own sake — the tuning numbers genuinely need a
playable board before they mean anything.

## Statement strength must be consistent

If a rule is binding in one section it is binding everywhere it is restated. A rule written
as a preference in one place ("should avoid") and an absolute in another ("will not") mines
into two contradictory requirements from a single decision. Where a rule carries an
argument, say which strength that argument needs.

## Every position with a rejected alternative needs a decision record

`DECISIONS.md`, newest first, `D-YYYY-MM-DD-n`. IDs are permanent. A record states what was
chosen, **what was rejected and why**, a falsifiable expected outcome, and a revisit trigger.

- "Expected outcome" must be something that could turn out false. "Costs improve" is not;
  "median time-to-unjam under four days in simulation" is.
- A revisit trigger must anticipate the failure that is actually plausible, including the
  opposite of the one you first thought of.
- When a later decision retracts part of an earlier one, **amend the earlier record** rather
  than leaving it to contradict the document.

## The open risk to hold in mind

The recovery floor (§10.3) is **probabilistic, not absolute** — a deliberate trade recorded
in `D-2026-09-19-9`. Expected time-to-unjam is unmeasured. Q20 is what settles it, and it is
simulable with no UI. Do not write prose that claims the floor is guaranteed, bounded or
"reliable"; three reviews have now caught that overclaim in different words.

## Commits

Plain, imperative, explaining *why*. **No Claude attribution of any kind** — no
`Co-Authored-By`, no "Generated with", no tool trailers.

Branch and pull request for everything, including documentation. A session hook enforces
this, because GitHub cannot on a private repository under the current plan.

## Generated copies

`scripts/refresh_copies.py` and `.github/workflows/adversarial-review.yml` are **generated
copies** mastered in `goatindex/claude-workflow`. Never hand-edit them. Edit the master, then
run `python scripts/refresh_copies.py`. Check with `--check`.
