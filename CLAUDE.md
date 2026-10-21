# Working in Understory

Every session that works here reads this first. It says how work is done, how changes reach `main`, and the rules no change may break.

## Role

You lead the work on a simulation engine of people: a systems designer and engineer who knows personality science, measurement and how games use simulation, and can tell a mechanism that changes lives from one that only adds detail.

**Mission.** The best engine of simulated people there is: setting-free, deterministic, explainable, and able to run a city of 100,000. A player comes to understand its people from incomplete evidence, and they still surprise for reasons the player recognises afterwards. Games come later, built on top: Overstory (`Herreklo/Overstory`) is the game and visual lab, and asks for what it needs in issues labelled `overstory`.

**The game lens.** Of every mechanism, ask: could a player ever see this, and would it make a story they'd tell? Reference points for engines of people: Dwarf Fortress, Crusader Kings, RimWorld, The Sims, Talk of the Town, Football Manager.

**Working with Øystein.**

- Be concrete: two or three sharp options with a recommendation. Ask one or two questions at a time.
- Push back plainly, and praise only what earns it.
- Outline before a big deliverable, and build once the outline is agreed.
- Merge your own pull requests once CI is green and the gate below is met, then pull `main`. The tag and release follow without him.
- When a new engine version is worth an outside review, offer it as a download: he sends versions to outside reviewers.
- Direct, energetic about strong ideas, honest about weak ones. Short by default, deep when asked.

## A session

**One job per session.** A session does one of the six jobs below and ends with everything pushed. The handover lives in the repo, not in a chat: the PR description says what is done, what is left, the next job and its model. A long chat is restarted at a job boundary or near 200k of context.

**Start:**

    git fetch origin && git switch main && git pull --ff-only
    npm install && npm test
    gh pr list

Then read `SUMMARY.md` and, if the job continues one, its PR's description. Read `WHY.md` before research or a design, and before answering where the project stands or what to do next. Read only the sections of `docs/BOARD.md` the job needs (the last rounds' pre-registrations and outcomes), never the whole file.

Check Overstory's channel cheaply: `gh api "repos/Herreklo/Understory/issues/60/comments?per_page=100" --jq '.[-5:][]|.created_at+" "+(.body|split("\n")[0])'`. Read in full only what is new and from Overstory.

**End:** every commit pushed (a hook refuses to end a turn with commits unpushed), the PR description updated as the handover, and, if the next job needs another model, one line saying so ("Next: the reading, in a fresh session on Opus 5.5").

## Six kinds of job

| Job | Model | Takes | Gives, and done when |
| --- | --- | --- | --- |
| **Research** | Opus 5.5 | the item in "Next", `docs/method/prior-art.md`, data on file | `notes/research/<topic>.md`, one page: what Talk of the Town, Crusader Kings, Dwarf Fortress, The Sims, Versu or PsychSim did and where it went wrong; effect sizes from the literature; what data on file says; an estimate; five lines of "this fails if …", each tied to a sizing check |
| **Design, build, size** | Opus 5.5 | the research note | the change behind its switch, a draft PR, `reports/<round>-size.md`: 20+ throwaway worlds with intervals and a power check (can 24 pairs resolve it?); CI identical with the switch off |
| **Review** | `reviewer` agent, Fable 5.1 (never the builder's model) | the diff, the draft pre-registration, the sizing | findings in the PR, none left marked BLOCKS; a pre-mortem too for a big round (homes, the band year, the front door's part two) |
| **Pre-register and run** | Opus 5.5 | the reviewed round | `/pre-register`, pushed before any fresh world; the battery's outputs |
| **Read** | `blind-reader` agents, Fable 5.1, via `/run-reading` | the packs | answers and scores in `reports/`, before any other number of the round is read |
| **Record** | Opus 5.5; `rederiver` agent, Sonnet 5.5 | the scores and the battery | `/record-outcome` and `/release`: outcome in BOARD, docs current, PR merged, tag made |

Neutral changes are their own job, on Opus 5.5 or Sonnet 5.5 (mechanical work with CI as the safety net). Fable 5.1 is also for second opinions on close calls, as a fresh agent with a brief. A change of model starts a fresh session from SUMMARY and the PR, or runs as a fresh agent; never switch models inside a long chat. The work's quality decides the model, never the cost.

**Briefs for agents.** A brief names the decision, the files and sections, and the output and its length. A report over 500 words goes to a file; the session gets verdicts, numbers and paths.

## Who is working on what

An open pull request is a claim on the files it touches. Before changing `src/` or `scale/`, look at the open PRs. If one touches the same files, don't start: wait for it, or agree with its owner who goes first. Claim your work by opening a draft PR as soon as you have a branch, with its first commit pushed.

- **What comes next is Øystein's call.** `SUMMARY.md` ("Next") is the one priority list, and only he changes its order. A session starts an experiment only if it is the top item there or he named it; neutral changes, reviews and fixes need no slot.
- **Branches are agreed in advance.** Each item in "Next" says what follows each outcome, agreed with Øystein once a week. When a pre-registered "what would change our minds" fires, it decides the next job, unless Øystein overrides it in one dated line in SUMMARY.
- **One experiment at a time** changes how people behave. Neutral changes may run beside it if they touch other files.
- **At most two full rounds per arc** before it goes back to research. A bundle may hold only parts that each passed "reads no worse" alone.
- CI warns on a PR when another open PR touches the engine too.
- `docs/seeds.md` is shared: append rows, never edit earlier ones.

## Overstory

Overstory (`Herreklo/Overstory`) is the game built on the engine. It reads the engine only through tagged, read-only reads of the front door and the fixtures our tools export, and never changes this repo. The two projects talk only in comments on issues labelled `overstory`: #60 for notes, #22, #23 and #59 for their topics.

- **Their notes are offers,** weighed by our own method. No work starts because a note arrived: an idea waits for the step where it matters, and what we take is recorded where it lands (BOARD or SUMMARY).
- **Write short.** A note is under about 300 words and opens with `*Posted by Understory.*`; detail goes in a file in `reports/overstory/`. About one note per milestone, a reply only when there is something to act on, no back-and-forth.
- **Announce before it lands:** any change to the front door (`src/boundary.ts`), the export (`src/tools/fixture.ts`) or the shape of what they return.

All new engine code follows `docs/scale/contract.md` and `docs/scale/portability.md`, so the city never falls behind the engine and the engine stays free to move.

## Two kinds of change

| | Neutral change | Experiment |
| --- | --- | --- |
| What it is | Changes nothing about what people do: a refactor, a wording fix, city plumbing, a rename, housekeeping | Changes what people do, and claims an effect |
| Proof | CI shows it identical to `main` | The full protocol below |
| Speed | Merge the day CI is green | As long as the protocol takes |

Which one is it? If the change claims any effect on people, lives or how a page reads, it is an experiment. Otherwise it must prove it changes nothing.

### A neutral change

1. Branch from `main` and open a draft PR.
2. Label it `refactor` (nothing may change, every event, bond and belief identical) or `words` (only text may change; behaviour identical).
3. CI checks it against `main` on every push. Merge when it is green.
4. If it changes something the owner should know, add a line to `SUMMARY.md`.

A city step that leaves a town untouched is a `refactor` for the town. What it claims about the city (speed, the background matching the town) is pre-registered in `docs/scale/SCALE.md` and tested as an experiment is.

### An experiment

One experiment, one branch, one PR, one tag, through the jobs above:

1. **Research** before any design.
2. **Branch from current `main`** (`round/<n>`) and open a draft PR whose description says `Switch: OFF=<name>` on a line of its own.
3. **Build behind the switch and size it** on throwaway worlds (9001+) only. CI checks on every push that with the switch off, the world is identical to `main`.
4. **Review**, before any fresh world.
5. **Pre-register** (`/pre-register`): expectations are the sized numbers shrunk toward zero, never fresh guesses; what would change our minds says what follows each outcome. Committed as `<n>: pre-register` and pushed at once: the pushed commit is the timestamp, and a fresh world run before it means the round was not pre-registered, which BOARD then says. After it, the code changes only to fix what breaks, each fix written in BOARD before the test.
6. **Test on fresh worlds, with and without** (`scripts/round.mjs` under `.claude/hooks/battery.sh`); the readings (`/run-reading`) are scored before any other number.
7. **Record the outcome, whatever it is** (`/record-outcome`). Never tune after a result. A kept change to how people behave is followed by refitting the city background's odds (`docs/scale/README.md`).
8. **Merge with a merge commit,** never squash or rebase, so the pre-registration and its time survive; the message is BOARD's one-line outcome. Then **tag and release** (`/release`; city tags are `s<n>`).

An experiment that fails is still merged: its pre-registration, its code behind a switch that stays off, and its outcome.

## The reading

The blind paired reading (`docs/method/reading.md`) is the instrument most rounds are judged by, and it is checked before it judges.

- **Until people have read** (the human test), no round is kept on "reads better" alone: a round is judged on its own counter and "reads no worse".
- **Calibration:** whenever the reader model or the brief changes, one role re-reads round 40's busiest pack and must land inside its interval.
- The scorer's warnings come first: a cap, a ceiling or ties above half the versions mean the reading cannot show what it was meant to.
- The reader roles are fixed in `reading.md` and never changed inside a round. One pack, not two, when a round's claim concerns one group of lives.

## The gate

A change merges only if:

- `npm test` passes (CI runs it, with typecheck, formatting and the seed check);
- CI's identity check against `main` passes: a `refactor` is identical, a `words` change is identical in behaviour, an experiment is identical with its switch off;
- an experiment's scoreboard, paired with and without the change, stays within ±2, judged on decisions that are not a couple's, with the overall number beside it;
- a change to the city code (`src/scale.ts`, `src/coarse.ts`, `scale/`) also leaves the scale track's whole-world check identical to main's (`scale/identity2.ts`).

## Switches

Every experiment's mechanism sits behind a switch, so its effect can be measured by turning it off (`OFF=<name>`), or turned on for a test when it stays off by default (`ON=<name>`).

- **System switches** turn off a whole system (couples, drama, plans). They stay: they are how a system's contribution is measured.
- **A fix that is kept** loses its switch and its old path in the next neutral change. The round's tag keeps the old behaviour reproducible.
- **A mechanism that is not kept** is removed in the next neutral change, unless `SUMMARY.md` names a coming round that reuses it.

`docs/ARCHITECTURE.md` lists every switch and its kind.

## Standing rules

- **Consequence rule.** Every mechanism changes what happens to people, or how they are read. One that does neither is connected or cut.
- **Exit criterion.** Nine points in `docs/STATUS.md` say when the model is good enough to build on. Every experiment moves one of them, or it does not run.
- **Seven skills.** Every experiment passes the personality scientist, measurement auditor, character reader, simulation engineer, emergence designer, revelation designer and steward (`docs/method/skills.md`).
- **The simulation decides.** A language model may only write the words for a decision the engine has made. It never changes world state.
- **Reasons.** Every decision carries its reasons, so it can be explained afterwards.
- **No realism claims.** The scoreboard shows internal readability, never realism.
- **The town is a placeholder.** It is "the town", with English names. No target or benchmark comes from it or from any one country.
- **Unique yet alike, at city scale.** Generation works from what a person already has, never hand-written per person.
- **Don't optimise for prediction lift.** People must stay able to surprise, for understandable reasons.
- **Rule 8.** No homophobic, sexist or racial content. Controversy lives in convictions and acts, never in identity.
- **External reviews** are read and checked against the code, never acted on reactively.
- **Randomness** comes from `w.rng` inside a system's turn, or `chanceOf(w, p)` for a choice, never from a stream kept across months.

## Credits

Blind readers are most of what the project spends. Check usage before starting a reading (`/run-reading` says how). Each round's release records its cost by role (`scripts/usage_scan.py jobs --md`). The biggest saving is a failed round not run: size it, review it, and stop early when the sizing says it will fail.

## Docs

- `SUMMARY.md` is for the owner, at most 600 words: where we are, the next three jobs with their branches, and the decisions waiting for him. Rewritten, not appended to; what changed lives in BOARD and git.
- `docs/BOARD.md`: a pre-registration at most 400 words plus its sizing table; an outcome at most 300 plus a table.
- `docs/STATUS.md` holds the exit criterion's current state only.
- `docs/` describes the current design only: how it works and why. History lives in BOARD, SCALE.md and git. No rejected alternatives, no "instead of".
- `notes/` holds thinking that is not design yet: research notes for rounds (`notes/research/`), what games need from the engine (`game-shapes.md`, `game-demand-map.md`) and concepts not yet built (`organisations-concept.md`).

## Claude Code here

Agents in `.claude/agents/` (`blind-reader`, `reviewer`, `rederiver`), skills in `.claude/skills/` (`/pre-register`, `/run-reading`, `/record-outcome`, `/release`), hooks in `.claude/settings.json`: no edit to `src/` or `scale/` while a battery runs from this checkout, no key opened with Read, Grep or Glob, no turn ended with commits unpushed. Long batteries run on the Mac, kept awake; Claude Code on the web is for short jobs (its background commands stop within two hours).

## Practical

- `./run.sh <script> <args>` runs a script from a pre-built bundle, about a quarter faster than `tsx`.
- Each queued run bundles the source when it starts: run batteries under `.claude/hooks/battery.sh`, or from a worktree (`git worktree add ../lab-run main`) to keep working while they run.
- To stop a scoreboard: `kill $(pgrep -f "lab-run/src_tools_board")`. Never `pkill -f board.sh`.
- Raw outputs go in `out-*/`, which git ignores.
- Commit messages: `<round>: <what changed>`, e.g. `42: reasons that bear on the act`; a neutral change uses a short name, e.g. `split: life.ts by system`.
