# Working in The Lab

Every session that works here reads this first. It says how a round runs in git, and the rules no change may break.

## Start of every session

    git fetch origin && git switch main && git pull --ff-only
    npm install && npm test

Then read `NOW.md`. If a round is open on another branch and touches the files you were about to change, finish or merge it first.

Read `WHY.md` before pre-registering a round, and before answering a question about where the lab stands or what to do next. It says why the lab exists and names the ways a project like this goes wrong; the round's pre-registration says which of its warnings the round risks.

## One session at a time

One session changes the engine. Others may read, measure and review, but not edit `src/`, `scale/` or the docs while a round is open. The city-scale work is ordinary rounds on `main` (`scale/<step>`, numbered `S12`, `S13`), each behind a switch and each passing the identity check, so the scale code never falls behind the engine again.

Shared files, edited by the open round only: `NOW.md` (one block: what is open, on which branch, what it waits for), `docs/seeds.md` (append rows, never edit earlier ones), `CLAUDE.md`, `README.md`, `.github/`.

All new engine code follows `docs/scale/contract.md`.

## How a round runs

One round, one branch, one PR, one tag.

1. **Branch from current main.** `git switch -c round/26` (or `scale/S12`).
2. **Pre-register before any code.** Write the change, its switch (`OFF=<name>`), what is expected, and what would change our minds, in `docs/BOARD.md` (scale: `docs/scale/SCALE.md`). Claim fresh seeds in `docs/seeds.md`. Commit as `26: pre-register` and push at once. The pushed commit is the timestamp; code committed before it means the round was not pre-registered, and BOARD says so.
3. **Build behind the switch.** Smoke runs on throwaway seeds (9001+) check only that it works.
4. **Test on fresh worlds, with and without.** Cold reads go to readers not told which arm a life comes from, before any metric is read. A separate agent re-derives the headline numbers from the raw files.
5. **Record the outcome, whatever it is.** Write it in BOARD (or SCALE.md), update `docs/STATUS.md` and `docs/ARCHITECTURE.md` to describe the design as it now is. Never tune after a result.
6. **Open a PR to main.** The template is the checklist. CI must pass.
7. **Merge with a merge commit,** never squash or rebase: the pre-registration commit and its time must survive. The merge message is BOARD's one-line outcome.
8. **Tag and release.** `git tag r26 && git push origin r26`. Attach the raw outputs (`out-*`) as a tarball to the GitHub release for that tag. Scale tags are `s12`.
9. **Update your block in `NOW.md`** on main.

A round that fails is still merged: its pre-registration, code behind a switch that stays off, and outcome. A switch for a round that has settled is retired in a later housekeeping round.

## The gate

A change merges only if:
- `npm test` passes (CI runs it, with typecheck, formatting and the seed check);
- the scoreboard, paired with and without the change, stays within ±2, judged on decisions that are not a couple's, with the overall number beside it;
- a change meant not to alter behaviour hashes identical with `src/tools/diag/ident.ts`; one that only touches words, with `src/tools/diag/sig.ts`;
- a scale change leaves a town-sized world identical to main's (`ident.ts` and the scale track's whole-world check).

## Standing rules

- **Consequence rule.** Every mechanism changes what happens to people, or how they are read. One that does neither is connected or cut.
- **Exit criterion.** Seven points in `docs/STATUS.md` say when the model is good enough to build on. Every round moves one of them, or it does not run.
- **Seven skills.** Every change passes the personality scientist, measurement auditor, character reader, simulation engineer, emergence designer, revelation designer and steward (`docs/method/skills.md`).
- **The simulation decides.** A language model may only write the words for a decision the engine has made. It never changes world state.
- **No realism claims.** The scoreboard shows internal readability, never realism.
- **The town is a placeholder.** It is "the town", with English names. No target or benchmark comes from it or from any one country.
- **Unique yet alike, at city scale.** Generation works from what a person already has, never hand-written per person.
- **Don't optimise for prediction lift.** People must stay able to surprise, for understandable reasons.
- **Rule 8.** No homophobic, sexist or racial content. Controversy lives in convictions and acts, never in identity.
- **External reviews** are read and checked against the code, never acted on reactively.
- **Randomness** comes from `w.rng` inside a system's turn, or `chanceOf(w, p)` for a choice, never from a stream kept across months.

## Docs

`docs/` describes the current design only: how it works and why. History lives in BOARD, SCALE.md and git, not in the design docs. No rejected alternatives, no "instead of".

## Practical

- `./run.sh <script> <args>` runs a script from a pre-built bundle, about a quarter faster than `tsx`.
- Don't edit `src/` while a queue of runs is going: each queued run bundles the source when it starts. Use a worktree (`git worktree add ../lab-run main`) to run from a frozen tree while you keep working.
- To stop a scoreboard: `kill $(pgrep -f "lab-run/src_tools_board")`. Never `pkill -f board.sh`.
- Raw outputs go in `out-*/`, which git ignores.
- Commit messages: `<round>: <what changed>`, e.g. `26: closest person decides whether to be there`.
