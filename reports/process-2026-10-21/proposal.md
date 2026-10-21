# How we work from 26 October: a proposal

For Øystein to agree or change before anything is rewritten. It rests on three studies in this folder: `understory-lessons.md` (our own record, rounds 19–41), `overstory-practices.md` (Overstory's practices and our usage) and `claude-code-setup.md` (what Claude Code offers). Nothing here is adopted yet.

## What the evidence says

- **Failures were catchable.** Of 25 experiments since round 19, 10 were kept, 12 not, 3 withdrawn; from 25d to 39, 13 in a row failed. Every failure had a cheaper warning first: 13 of 15 failed a number we could have measured on throwaway worlds. About 42 of 45 failed predictions **overestimated** the effect, often 2 to 10 times.
- **The instrument was debugged on live rounds.** About twelve problems with the blind reading came to light, each after it had already judged rounds. The three-fault cap was full in 94–100% of versions from round 29 on, and nobody noticed until round 41. No null reading has ever been run, and no person has calibrated it.
- **No research since round 28.** No pre-registration from 28 to 41 cites literature, and none ever names a game precedent. An outside review on 18 Oct named the right prior art and warned of four failures that then happened (27, 29, 33, 34).
- **Credits go to the readers.** Fable blind readers were about 85% of measured usage: about $45–54 a round at list prices for 12 sittings. The main chat grows about 50k tokens an hour, and most of its own cost is re-reading.
- **Words outgrow work.** About 190,000 words of Markdown against 20,418 lines of engine code. BOARD is 85,000 words; "one page" SUMMARY is 4,359; starting a session means reading about 14,000.
- **The plan churned.** The top of "Next" changed 9 times in 21 hours, and an arc stopped "to be rethought" re-entered through a bundle judged on a weaker bar.

## What stays

Switches with CI's identity check against main; pre-registration timestamped by the push and never tuned after; raw reading data committed (it paid for M34, rounds 35 and 36, and M38); sizing on throwaway worlds; re-derivation by a separate agent; outside reviews checked against the code; the seed ledger.

## The proposal, most valuable first

1. **Validate the reading before it judges another round.** M38 becomes the instrument round, mostly on packs already on file:
   - a null reading (one version against itself, or two off-arm worlds): the false-positive rate and the lean;
   - a sensitivity test: round 41's lives with reasons shuffled between lines, and with one planted small fault. Bar set before reading: readers prefer the true version in at least 18 of 24 pairs;
   - the scorer warns when any cap, ceiling or tie rate passes 50%;
   - two reader roles, fixed before the reading;
   - a calibration rule: whenever the reader model or brief changes, one role re-reads round 40's busiest pack and must land inside its interval.
   Until people have read (the human test after round 42), no round is kept on "reads better" alone: round 42 is judged on its counter and "reads no worse".
2. **A research step before any new mechanism.** One session, one page in `notes/research/<topic>.md`: what Talk of the Town, Crusader Kings, Dwarf Fortress, The Sims, Versu or PsychSim did and what went wrong for them; effect sizes from the literature; what data on file already says; a back-of-envelope estimate; five lines of "this fails if…", each tied to a sizing check. The pre-registration cites it in one line. The 18 Oct review's prior art goes into `docs/method/prior-art.md` once.
3. **Size properly before registering.** At least 20 throwaway worlds, with intervals, in `reports/<round>-size.md`, plus a power check: can 24 pairs resolve the predicted effect? No pre-registration unless it can, or the claim is "no worse". Expectations are the sized numbers shrunk toward zero, never fresh guesses.
4. **A review of the design and the diff before any fresh world,** by a separate agent on a different model from the builder, with six questions: where is the new state read; could it be cited where it does not bear; does it change events or only words (`sig.ts`); does the identity check see it; does the switch reach every runner; what happens when it fires twice. Findings go in the PR. A pre-mortem by a fresh Fable agent only for big rounds (homes, the band year, the front door's part two).
5. **Branches agreed in advance.** "Next" carries, per item, what follows each outcome, agreed with Øystein once a week. When a pre-registered "what would change our minds" fires, it decides the next job unless Øystein overrides it in one dated line. At most two full rounds per arc before it goes back to research. A bundle may hold only parts that passed "no worse" alone.
6. **One job per session, six kinds of job.** Research, design-build-size, review, pre-register-and-run, read, record. Each names its model, inputs, one output and "done when", replacing the Models section. Every session ends with everything pushed and a short handover in the PR description. Model changes start a fresh session or run as a fresh agent, never a switch in a long chat.
7. **Credits, without losing quality.**
   - Fable for the blind readers, pre-mortems on big rounds and second opinions on close calls; Opus for everything else; Sonnet for re-derivation and watching CI.
   - Two reader roles, not three: a third less reading at the same precision (M38, part one).
   - One pack, not two, when a round's claim concerns one group of lives.
   - Faults cited by line number instead of copied quotes (readers' writing is about 30% of their cost), checked in M38 like any change to the brief.
   - Check usage before starting a reading; record each round's cost by role in its release.
   - The biggest saving is a failed round not run: the readings of rounds 29 to 39 that were not kept cost about 1.9 million reader-words.
8. **Fewer words.** SUMMARY at most 600 words (where we are, the next three jobs with their branches, a decision box); latest merges move to git and BOARD. Pre-registrations at most 400 words plus the sizing table; outcomes at most 300 plus a table. STATUS holds the current state only. A session starts from SUMMARY and the open PR.
9. **Harden what checks the engine.** The identity signature hashes each person's events; demography is judged on 20 worlds in the battery, the 6-world run warns; `sig.ts` for any change described as words only; `advance` refuses part of a month.

## Not taken from Overstory

Delegating what comes next (the order stays Øystein's), digests and a decision register, research tracks per system (a one-page research note is enough here), a hand-kept usage log (the scan does it), and our own paper playtests (their lane; we read their register on #60).

## Claude Code setup

Readers as a subagent pinned to Fable with read-only access and without `CLAUDE.md`; a verifier subagent on another model; skills for `/pre-register`, `/run-reading`, `/record-outcome`, `/release`; hooks that block engine edits while a battery runs and stop a session from ending with work unpushed; narrow permissions. Long batteries run on the Mac, not in cloud sessions. Details in `claude-code-setup.md`.

## Decisions for Øystein

**Decided 21 Oct:** all three as recommended. The human test waits until Øystein picks it up again; until then no round is kept on "reads better" alone.

1. Agree the proposal, or change parts of it.
2. Round 42 judged on its counter and "reads no worse" until the human test (recommended).
3. Models: Opus for all but the blind readers; Fable for readers, big-round pre-mortems and close calls (recommended).

## The first jobs, once agreed

1. **Setup** (Opus, one session): rewrite `CLAUDE.md` to this; add the reader and verifier agents, the four skills, the hooks and settings; trim SUMMARY; move the usage scan to `scripts/`.
2. **M38 as the instrument round** (PR #66): null reading, shuffled reasons and planted faults, the every-fault brief, line-cited faults, two fixed roles.
3. **Research note for round 42.**
4. **Round 42.** Neutral fixes from item 9 fit beside any of these.
