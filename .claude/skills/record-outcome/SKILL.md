---
name: record-outcome
description: Records a round's outcome once its battery and readings are done - re-derivation by a separate agent, the outcome in BOARD by the rule set beforehand, and the docs brought up to date. Use after the readings are scored.
argument-hint: <round>
---

# Record the outcome of round $ARGUMENTS

The outcome is read by the keep rule in the pre-registration, whatever it says. Never tune after a result, and never move a bar.

## 1. Re-derivation

Start the `rederiver` agent with the round, its pre-registration's heading in `docs/BOARD.md`, the battery's output directory and the reading's answers and keys in `reports/`. It writes `reports/rederive-<round>.md`. Any DIFFERS is resolved before the outcome is written: find which number is wrong, and say so in the outcome.

## 2. The outcome, in `docs/BOARD.md` under the pre-registration

At most 300 words plus a table:

- `Outcome of round <n> (<date>, <time> Oslo).` The tree and base it ran on, where the outputs are, and that the re-derivation agrees;
- each keep-rule item with its number and ✓ or ✗;
- **Kept**, **not kept** or **withdrawn**, by the rules set beforehand;
- what was reported and not judged, briefly;
- which pre-registered branch now fires, and so what the next job is. Øystein can override it in one dated line in SUMMARY.

Do not edit the pre-registration. A correction to it is a dated note below the outcome.

## 3. The docs describe the project as it now is

- `SUMMARY.md` (at most 600 words): where we are, the next three jobs with their branches, the decisions waiting for Øystein. Replace, do not append: what changed is in BOARD and git.
- `docs/STATUS.md`: the exit criterion's current state only.
- `docs/ARCHITECTURE.md`: the mechanism and its switch, if kept (the switch's kind in the list).
- A kept change to how people behave is followed by refitting the city background's odds (`docs/scale/README.md`); add it to "Next" if not done here.

## 4. The PR

Fill the template's checklist, mark the PR ready, and merge with a merge commit once CI is green (`gh pr merge <n> --merge`), with BOARD's one-line outcome as the message. Never squash or rebase. Then `git switch main && git pull --ff-only`, and `/release <round>`.
