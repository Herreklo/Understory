---
name: pre-register
description: Pre-registers a round once it is built and sized - the review of its design and diff, the pre-registration in BOARD, the seeds claimed, and the commit pushed as the timestamp. Use only after the research note and the sizing report exist.
argument-hint: <round>
disable-model-invocation: true
---

# Pre-register round $ARGUMENTS

Nothing here runs a fresh world. A fresh world run before the push in step 5 means the round was not pre-registered, and BOARD says so.

## 0. What must already exist

Stop and say what is missing if any of these is not there:

- the round's branch, from current `main`, with a draft PR whose description has `Switch: OFF=<name>` (or `ON=<name>`) on a line of its own;
- its research note, `notes/research/<topic>.md`: prior art (games and models), effect sizes from the literature, what data on file already says, a back-of-envelope estimate, and five lines of "this fails if …", each tied to a sizing check;
- its sizing report, `reports/<round>-size.md`: at least 20 throwaway worlds (9001 and up), with and without, the round's own count and kinds of line a life with intervals, and a power check: can 24 pairs resolve the effect it predicts (about ±0.3 at 24 pairs, `docs/method/reading.md`)? If not, the claim can only be "reads no worse";
- CI green on the branch: with the switch off, identical to `main`.

## 1. The review

Start the `reviewer` agent with the round, its branch, the draft of the pre-registration (step 2, written first as a draft) and the sizing report. For a big round (homes, the band year, the front door's part two) start a second `reviewer` with "pre-mortem" in its instructions. Put the findings in the PR description under **Review**. Fix every BLOCKS before going on, and write each fix in the draft.

## 2. The pre-registration, in `docs/BOARD.md` (city: `docs/scale/SCALE.md`)

A section `## Round <n> — <what it does> (pre-registered <date>, <time> Oslo, before any test world; sized first)`, at most 400 words plus the sizing table:

- why now: the item in SUMMARY's "Next" and the exit-criterion point it moves; the research note, in one line;
- the change and its switch, in plain words;
- the sizing table, from the report;
- the test: fresh worlds and seeds for the scoreboard, the counts and each reading pack;
- **expected**: the sized numbers shrunk toward zero, never fresh guesses;
- **keep rule**: the floor that says the mechanism works, the gates (`CLAUDE.md`), and the reading's bar. Until the human test has run, no round is kept on "reads better" alone: the claim is the round's own counter and "reads no worse" (lower bound above −0.3);
- reported, not judged;
- **what would change our minds**, and what follows each outcome: kept, not kept, withdrawn. Each branch names the next job;
- the warning in `WHY.md` it risks, and what would show it did not;
- the game lens, in one line: what a player would see.

## 3. Seeds

Claim fresh ranges in `docs/seeds.md`: add rows in order above the smoke row and move the "Next free" line; never edit an earlier row. `node scripts/check-seeds.mjs` must pass.

## 4. Check

`npm test` passes. The pre-registration's numbers match the sizing report. No fresh seed appears in any output on disk.

## 5. Commit and push at once

`git commit -m "<n>: pre-register"`, then `git push`. The pushed commit is the timestamp: write the push's time (Oslo) into the heading in the next commit if it differs. From here the code changes only to fix what breaks, each fix written in BOARD before the test.

Then the next job is the test: `scripts/round.mjs` under `.claude/hooks/battery.sh`, and `/run-reading` for each pack, read before any other number.
