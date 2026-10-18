# How the lab is built

A one-page map for changing the engine: what lives where, the order of a month, where state is kept, and how to add an act, a situation or a system. STATUS.md says what the model does and why; this file says where to find it.

## What is where

**The engine (`src/`)**: everything a world needs, and nothing that only measures it.

| File | What it holds |
| --- | --- |
| `world.ts` | World and person state, bonds, beliefs, the event log, observation, `OFF` switches, random streams per system |
| `rng.ts` | Seeded randomness |
| `core.ts`, `features.ts` | Facets, values, dimensions; situation features and which facets they wake |
| `setting.ts` | The setting pack: places, names, trades, quirk material. Content only, no rules |
| `generate.ts`, `inclination.ts` | Making people; how strongly someone is drawn to a skill |
| `decide.ts` | Considerations, response curves, scoring and choosing, reasons |
| `families.ts` | Every act (expression) a person can do, grouped in families, with its own flags |
| `grammar.ts` | Situations (`TYPES`), `run` (one decision from situation to event and effects), the monthly situation pass |
| `life.ts` | The month (`tick`), body, work, contact and friendship, romance, family, stress, money, migration |
| `time.ts`, `threads.ts` | Wants and pursuits, habits, attachment to home; the same pressure answered the same way, again and again |
| `steer.ts` | How a pursuit is gone after (its ways, each through a part of the town), obstacles as decisions, and wants that come back only changed |
| `motives.ts` | The words a trait reason is said in, as a motive (words only) |
| `group.ts`, `drama.ts`, `projects.ts` | Groups and shows; ambition, succession and rivalry; plans that need other people |
| `persona.ts`, `love.ts` | A way of being (humour, voice, quirks, marks); ways of loving and fighting |
| `regard.ts`, `witness.ts` | How one person regards another; the witness and what an observer can know |
| `build.ts`, `app.ts` | Building a world and its thirty-year past; the lab page |

**Tools (`src/tools/`)**: tests and measures. `board.ts` with `predict.ts` and `measure.ts` (the scoreboard); `story.ts`, `personas.ts`, `friends.ts`, `lovetest.ts`, `consequences.ts`, `audit.ts` (what lives are like, with and without a switch); `invariants.ts`, `replay.ts`, `twoworlds.ts`, `demography.ts`, `grouptest.ts`, `test.ts` (`npm test`); `read.ts` (five lives, printed). `src/tools/diag/` holds one-off diagnostics and the two checks for changes that should not alter behaviour: `ident.ts` and `sig.ts`.

**Running**: `./run.sh <script> <args>` runs any script from a pre-built bundle (about a quarter faster than `tsx`, same code). Outputs go to `reports/` and `out-*/`.

## A month

`tick` in `life.ts` runs the systems in this order. Each one draws from its own random stream (`use(w, system)`), so switching one off reshuffles no other system's dice. Every stream is drawn afresh at the start of each month (from the world or run seed, the month and the system), and the draw that decides a choice comes from the chooser's own stream (`chanceOf` in `grammar.ts`), so whatever shifts a stream shifts it only until the month ends, and one person's choices never move another's. The order matters: a system sees what earlier systems did this month.

1. **body**: health, illness; then deaths.
2. **work**: hiring, dismissal, promotion, retirement.
3. **social**: contact through every channel, liking and familiarity, friendships made and lost, gossip.
4. **situations**: answers queued last month first, then the harbour day, then every situation type matched; one situation per person, the weightiest first. Then the spotlight.
5. **threads**, **time** (pursuits, habits, everyday life, attachment), **groups**, **drama**, **projects**, **persona**, **love** (couples' tension, rows, care, doubts, leaving), **romance** (dating, marrying, dating couples parting), **family** (births).
6. **stress**, **money** (with skills and wants), **migration** (leaving and coming home), **yearly** (every twelfth month), then the witness's scores.

A world is built by `buildWorld` (founders, families, jobs at year zero) and then thirty years of the same `tick`; the witness arrives at the present, and the present runs on the same rules.

## Where state lives

- **World** (`world.ts`): `people` and `byId`; `bonds` (one per ordered pair, key `a × 100000 + b`: familiarity, liking, trust, respect, memories); `beliefs` (per holder, key `subject|key`, a Gaussian estimate per facet, state, skill or bond); `events` (the record, always in time order, each with its reasons, evidence and who knows it); `queue` (situations for next month); `groups`, `places`, `streams`.
- **Person**: facets (with pseudo-facets: `love:*` for ways of loving, `attach:home`), values, aptitudes, skills, wants, habits, marks, the self-story, if-then signatures, exceptions toward one person, emotions and stress.
- **Couple state** (`love.ts`, `coupleOf`): one object per couple, kept on the partner with the lower id.
- **The `tried` store** (`p.tried[key] = { t, ok, n }`): when something was last tried and how it went. It is also used as a general flag store, with keys made of text (`misread:12`, `stay:40`, `noticed:7:sincerity`). Known debt, below.

## How to add things

**An act**: one `E({...})` in `families.ts`: its family, intensity, the facets that favour it, its words, what it reveals (evidence) and what it does to the bond. Its flags say where it can appear: `named` (only where a situation lists it in `only`), `needsTarget` (needs someone to be done to), `solo`, `quiet`, `secret`, `onlyIf` (only for some people). If it has effects beyond the bond, they go in `run`'s effects in `grammar.ts`. Give it a label in `tools/consequences.ts` (`system`) so the consequence map files it.

**A situation**: an entry in `TYPES` in `grammar.ts` with `match(w)` returning instances: who acts, toward whom, the features, the families and acts allowed, the reason it arose (`cause`, an event, wherever there is one), and its own considerations (`familyExtra` per family). A circumstance that should push one way belongs in the family it pushes toward. A situation that rests on recent history reads it with `recentEvents(w, since)`, never by filtering the whole record.

**A system**: a tick function called from `tick` at the right point, a name in `SYSTEMS` (its own random stream), an `OFF` switch so its contribution can be measured by switching it off, and a measure in `src/tools/`.

## Switches

`OFF.has(name)` switches a mechanism off for an ablation. Every new mechanism gets one, named in STATUS.md. When a round settles a fix or a rewording, the old path is removed: the tag of each round keeps the old behaviour reproducible.

## Checks

- `npm test`: types, the page bundle, determinism, two worlds at once, groups, invariants (with the consistency audit), demography, a short batch.
- `src/tools/whatif.ts`: what one choice changes in the chooser's life three years on. It copies the world at the start of the decision's month (`src/tools/clone.ts`; `check` proves a copy runs exactly as the original) and runs it with the likeliest other answer and with the same answer, both after the same smallest nudge to chance. The model reads none of it (`globalThis.WHATIF`, in `choose`).
- `src/tools/diag/ident.ts`: for a change that should not alter behaviour. It hashes every event with its words and reasons, every person, bond, memory and belief, every group and every random stream, on seeds 11–13 and every switch on seed 11, against a saved baseline (`reports/ident-baseline.json`). `save` writes a baseline; `check` compares.
- `src/tools/diag/sig.ts`: for a change to words only. It hashes behaviour without text, for comparing two trees.

## Known debt

- **The `tried` store** carries flags and state under text keys, and about 140 places reach past the types (`as any`) for fields the person type does not declare (`lastIll`, `interestFrom`, couple state). A typo fails silently. It moves to named, typed fields when a round touches it.
- **Circumstances in `extra`**: some situations give every option the same circumstance (short of money, already stretched), so it cannot push one way. Whether that changes behaviour is a question for a round, not a cleanup.
- **Bond keys** break past 100,000 people (scale contract, rule 8).
- **The lab page** lists source files by path; the published page needs its files republished when the layout changes.
