# Building the engine: the plan

_Written 22 October 2026 from the outline Øystein agreed that day. Engine claims are checked against `main` at `db36ffd`; costs come from `docs/BOARD.md` and `scripts/usage_scan.py`. The plan orders work. "Next" in `SUMMARY.md` changes only when Øystein says so._

## 1. What "built properly" means

The engine is built properly when four tests pass:

- **A new game needs a pack, a domain module and a front end, and no change to an engine rule.**
- **A second pack, very unlike the town, runs in CI.** It has no school, marriages that cannot end, work from twelve, and an elder who decides what the town's council decides. Its worlds pass determinism, the invariants and the demography check.
- **Every mechanism moves an exit point**, or it is cut.
- **The city runs on the same people** (exit point 7).

## 2. Four layers, and the test for each

| Layer                 | What it holds                                                                                                                                      | Its test                                                                                                                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **The engine**        | People, decisions, ties, beliefs, accounts, time, the city, and general mechanisms: obligation, shared hardship, inheritance, feuds, organisations | The same in any world. No rule names a place, an institution or an era                                                                                                                                                               |
| **The world pack**    | Institutions (can a marriage end, who learns where, how property passes, what is a crime), convictions, era tables                                 | The answer depends on the world. Data, in a format the engine versions. An institution applies to everyone alike, and a conviction is about an act, so no field can say what a person may be or do by sex, origin or belief (Rule 8) |
| **The domain module** | A match, a song, evidence                                                                                                                          | Only one kind of game needs it. Deterministic, reads people through the front door, gives outcomes back as events, never decides an act                                                                                              |
| **The content**       | Places, names, words, era tables                                                                                                                   | Data. Another language needs no code                                                                                                                                                                                                 |

Football is both: contracts, transfers, a squad, a captain and a club's character are the engine's; the match, the league and form are the module's.

## 3. How the repositories are arranged

- **Understory** holds the engine, `packs/town` (today's town, identical), `packs/test` (the unlike pack, run in CI) and `domains/music`: today's songs and shows, moved out of `group.ts` as the default domain.
- **Each game** holds its own pack and domain module in its own repo. The engine loads a pack through `createWorld` and refuses a version it does not know.
- **A world** is its seed, its pack and pack version, and its engine tag. A saved game adds a snapshot and the commands since.
- Domains become packages of their own only when a second game exists.

This is the recommendation for the "repo structure for add-ons" decision in SUMMARY.

## 4. Where the engine stands

**What fits.** People, decisions with reasons, ties, beliefs and the witness, accounts told along close ties (on since round 40), wants and aftermath, rivalry, plans, groups, the city, the front door and the engine's own arithmetic.

**Modern life written into rules.** Outside `setting.ts` and the tools, "school" appears 25 times in 7 engine files and "divorce" 18 times in 7. The rules behind the words:

- **School.** Everyone from 6 to 18 who does not work meets age-mates daily (`social.ts:645–652`, 890). Friendships start at twelve (`social.ts:387`). Music lessons at school (`group.ts:345–382`); a child struggling there (`romance.ts:219, 239`).
- **Marriage.** From 18 (`romance.ts:85`). It can end in divorce (`romance.ts:126–146`, `coarse.ts:45, 385`), and aftermath and wants are keyed on that (`aftermath.ts:31, 65`, `occasions.ts:163`).
- **Work.** Hiring runs from 18 to 62 (`work.ts:205`) and retirement from 62 to 67 (`work.ts:69–70`).
- **Named institutions.** The council decides ventures (`projects.ts:269–346`). The bar holds the collection and the town's day (`situations/collection.ts:14`, `situations/yearly.ts:15–34`, `time.ts:755`). The witness prefers the bar, the paper or the clinic (`witness.ts:11`).

Each becomes a pack field holding today's value.

**Content still code** (portability rule 7). `setting.ts` has 17 functions, mostly habit fits that are only weights. `families.ts` has 115 acts with 124 inline functions, conditions and words. `motives.ts` is data but for 2 functions. The music domain sits inside `group.ts` (`chemistry` at 63, `show` at 549).

**General mechanisms missing.** Obligation owed and called in: the promise that comes due is 8% of all decisions (round 41's battery), and 9% of them have a weighty descendant, none a turn (`reports/consequences-f26.txt`, the last map by kind). Shared hardship, feuds and leverage. Organisations with norms (exit point 9). Homes, and inheritance of property: only traits pass down (`generate.ts:174`). Fame as reach (`docs/scale/contract.md`, rule 4). Time inside the month: places and presence, deaths with a moment, records, things in events.

## 5. The order of work

**The record (finding 7).** Since round 24a, rounds on the page, the record and the reading were kept 18 times in 20 (two in part); rounds that change what people do, 4 in 16. Since round 25d, one of 13 such rounds was kept: round 40, a bundle of mechanisms that had each failed or been withdrawn alone (31, 34 and 37, 36, 38). A blind sitting costs about $4 (M38's median); one pack of four sittings about $20, two packs about $45. In the one window the usage scan covers (21 October evening to 22 October noon), readings were two thirds of all spent. Phases are costed in readings and Øystein's decisions.

### Now: finish the reasons arc, and the human test

- **Neutral:** `motives.ts` as data, before the wording round is built.
- **The second and last round on reasons** (Next 2), held to a cap. It changes words only: the 22 worst phrase–act pairs and `backsong`, written as data. It is read on one pack, and it stops at its sizing if fail-if 1 or 2 fires (`notes/research/wording.md`, PR #78).
- **The human test** (Next 3): people read round 40's busiest pack. It decides whether "reads better" counts again.
- **Moves** exit points 3 and 5. **Brings closer** every game: every "why?" shows a reason.
- **Costs** one pack or none. Two decisions: the cap, and who reads.

**The current "Next" (finding 9)** is right to finish reasons first: unfit reasons are the fault readers quote most (683 on M38's true pages), faulted in rounds 29, 33 and 34, so every later reading of substance is fairer for the fix. Two things in it are wrong. The human test waits "when Øystein picks it up", though every kept change rests on it. And after this round, no page-only round should run until phase A keeps a bundle: page rounds pass and substance rounds mostly fail, so the work drifts to the page, the complexity mistaken for progress that `WHY.md` warns of.

### Phase A: what people are made of

Four arcs, each starting with research, at most two full rounds each.

1. **Consequences that reach:** obligation owed and called in, and shared hardship, where one blow binds or splits the people it hits. Moves exit points 2 (reach, 7% today, 15% needed) and 1.
2. **Close ties,** starting from the moments a tie is tested: a blow, an ask, a move. A ledger read everywhere decided under 1% of choices (round 32). Moves exit point 1.
3. **Organisations:** norms held in members' beliefs (`notes/organisations-concept.md`), first the row escalation made each group's own, tried in the band for a year. That band is the milestone Overstory proposed to share (its request 8). Moves exit points 9, 1 and 8.
4. **Wants for the quiet majority:** doors for later life (round 43). Moves exit point 2.

**How substance shows (finding 2).** Each part is kept on its own counter, fixed before the test: the share of decisions it decides, the change a what-if finds, and its reach. Each pre-registration says the smallest effect its reading can resolve. The reading checks "reads no worse", on one pack. Parts that pass are bundled, arcs 1 and 2 and then 3 and 4. A bundle is read on two packs and its "reads better" is reported, not judged: round 40, the one substance round kept, re-read at +0.25 ±0.36, which a bar of "better" would not clear. The human test decides when "better" judges again.

**A stop rule.** The record gives one kept change in thirteen tries; sizing first (M37) should stop failures before they cost a reading. If arcs 1 and 2 keep no part, phase A stops and phase C starts with the engine as it is.

- **Brings closer** the band manager, hotel, life simulation, football, union, festival and the kingpin. Of the 27 ideas, 13 need consequences, 10 close ties, 7 organisations, 5 wants.
- **Costs** six to eight rounds, a third likely stopped at sizing: about five one-pack and two two-pack readings, some 36 sittings. Five decisions: each arc's branches, and the band as a shared milestone, built end to end first, rough, with Overstory watching, so a player's view pulls the mechanisms.

Round 43 goes last: it is the third try at wants (25d, 36), and wants serve the fewest ideas.

### Phase B: the structure

All neutral, so CI proves each job identical. While an arc's round is open, phase B works only in `boundary.ts`, `src/tools/` and `scale/`. Sweeps of the engine's own files run between rounds, when no PR claims them.

1. **Content as data** (finding 6): one `refactor` PR per file: `motives.ts` in "Now", `setting.ts` beside the wording round (which does not touch it), `families.ts` after it merges.
2. **The pack format and the test pack.** Institutions and convictions, the town pack identical, the start year from the pack (#23). The test pack must pass determinism and the invariants in CI; its demography is reported, not gated. An engine edit made so it passes is an experiment.
3. **The front door's part two** (#22). First reads by viewer, `eventsAfter`, versions, and save and load. Then branching (request 15, finding 4), without save and load. Then commands, scenes that play a situation the engine raised, and domain outcomes given back as events. Each is announced on #60 before it lands.
4. **The music domain** behind the domain interface.
5. **Homes as plumbing** (#59, step 1), and **focus that follows an organisation** for the city.
6. **A measure of event density** (finding 5), added to the battery.

- **Moves** the tests in section 1, not exit points, so all of it can be neutral. **Brings closer** every game; branching serves Inquest and the observer games.
- **Costs** no readings. Three decisions: the pack format and its Rule 8 closure, the repo structure, and whether commands are judged by a counter without a reading.

### Phase C: the first game

Øystein chooses it once Overstory's register is in and exit points 1, 2 and 9 are close, or the stop rule fires. The game brings its pack and domain module in its own repo; the engine pulls forward the phase D work it needs, and story sifting is built for what it finds storyful. Its players are the outside readers exit point 5 asks for.

- **Costs** none of our readings. Three decisions: which game, its pack, and who builds its domain.

### Phase D: as games ask

| Capability                                                                                       | Needed by                             | Moves |
| ------------------------------------------------------------------------------------------------ | ------------------------------------- | ----- |
| Accounts: records with a maker and a stake (Overstory 11–13), opinions                           | Newspaper, detective, mediator, radio | 2, 6  |
| Time and moments (`notes/time-and-moments.md`), deaths with a moment (14), things in events (16) | Inquest, detective                    | 2     |
| Crime and killings                                                                               | Detective, kingpin                    | 2     |
| Inheritance with homes (#59, step 2)                                                             | Family legacy                         | 2, 8  |
| Fame as reach                                                                                    | Newspaper, radio, football            | 2     |

Each is an arc of research and at most two rounds, about three one-pack readings and one decision.

**Accounts (finding 3).** Overstory's leading concepts lean on accounts. The part they praise, accounts told with their tellers, is on since round 40; records and opinions are paused. They stay in phase D, but become phase C's first arc if the newspaper or a mystery is chosen, and the register can pull them forward sooner. Reads by viewer (phase B) give both concepts what each person could know.

### Where Overstory's register slots in (finding 10)

Each request is placed by its layer: an engine capability joins the phase A or D arc for its code in `notes/game-demand-map.md`; the front door or export joins phase B, item 3; pack or content, item 2; a domain stays in the game's repo; presentation is Overstory's. A request that moves no exit point waits, unless Øystein adds one. Requests sharing a capability are one arc, and what we take is recorded in SUMMARY. Overstory is the one game that exists, so its register can pull one phase D arc ahead of phase A's arcs 3 and 4, by Øystein's choice; if it asks for records and deaths with a moment first, that is the arc.

## 6. Throughput

**Branching is the cheapest win (finding 4).** `cloneWorld` (`src/tools/clone.ts`) copies a world exactly, and `whatif.ts check` proves the copy runs the same. A game still needs:

- `branch(h)` at the front door, since a game may use nothing else;
- an override of the decision a game saw, named by its event's id (person and trigger, `world.ts:50–59`, can repeat in a month). Today's hook is a global (`decide.ts:209`) that counts choices: a game cannot aim it, and two worlds would share it. Kept on the world, with the same draw and another answer, nothing else moves.

Both are one neutral session. Save and load as plain data is #22's own job.

**Where readings can be shared:**

- Parts are read on one pack, for "reads no worse"; two packs are spent once per bundle.
- A round sized first and stopped costs nothing (round 42).
- Overstory's paper playtests are a second instrument, scored against our truth, on their credits.

**The instrument (finding 8).** No outsider has read a life since Q3, and two fixed roles on one model share their errors. Øystein dates the human test: at least five outsiders read part of round 40's busiest pack, judged by exit point 5's bar (four in five say what happened and why, half want another). It comes before phase A's first bundle is read; people read again before phase C, which does not start without them.

**Event density (finding 5).** Round 41's map gives about eleven weighty events a month in a town of 85, and about one that leads to a turn; Overstory counts one notable, knowable event a week. The battery will report, beside exit point 2, the turns a witness could know per hundred people a month, since a player needs turns to act on. The register sets its floor. It is no exit point of its own: a rate pushed alone makes forced drama (`WHY.md`).

**What not to build:**

- An engine clock shorter than a month (finding 1). Moments live inside the month; a finer clock waits for a game that proves it needs one.
- Domain systems inside the engine, game modes, or a director.
- A hand-written motive for every act: the worst pairs, and a rule for the rest.
- A reputation score: opinions are accounts, when a game asks.
- Killings before deaths with a moment.

## 7. Decisions for Øystein

All eight are recommended.

1. **The wording round, capped** as in "Now".
2. **Date the human test,** before phase A's first bundle is read.
3. **Phase A's order:** reach, close ties, organisations through the band year, then wants (round 43 last).
4. **How substance is judged:** its own counter and "reads no worse"; "reads better" reported until the human test; the stop rule.
5. **Content as data,** one sweep per file, `motives.ts` first.
6. **The repo structure** of section 3.
7. **Branching** as a neutral job in phase B.
8. **The register may pull one phase D arc forward;** accounts lead phase C if the first game is the newspaper or a mystery.
