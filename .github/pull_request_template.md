<!-- Keep the section that applies and delete the other. -->

## Neutral change

<!-- Label the PR `refactor` (nothing may change) or `words` (only text may change). -->

**What it does (one line):**

- [ ] Labelled `refactor` or `words`
- [ ] CI's identity check against `main` is green
- [ ] `SUMMARY.md` has a line if the owner should know

## Experiment

<!-- e.g. 28 — the closest person decides whether to be there. City: S13 — … -->

Switch: OFF=

**Outcome (one line, as in BOARD / SCALE.md):**

- [ ] Sized on throwaway worlds only; pre-registration committed and pushed before any fresh world was run (commit: )
- [ ] Seeds claimed in `docs/seeds.md`, all fresh
- [ ] The change sits behind the switch above, and CI shows the world identical to `main` with it off
- [ ] Smoke run on throwaway seeds only
- [ ] Tested on fresh worlds, with and without (`scripts/round.mjs`)
- [ ] Cold reads done blind, before any metric was read
- [ ] Headline numbers re-derived by a separate agent from the raw files
- [ ] Gate: scoreboard paired within ±2 (decisions that are not a couple's; overall beside it)
- [ ] Outcome recorded, whatever it was; nothing tuned after a result
- [ ] `docs/STATUS.md`, `docs/ARCHITECTURE.md` (or `docs/scale/`) and `SUMMARY.md` describe the project as it now is
- [ ] Moves exit-criterion point:
- [ ] The warning in `WHY.md` it risks, and what shows it did not:

Merge with a merge commit. Then push `release/<tag>` to tag it and attach the raw outputs.
