# Building the engine: the plan

_Written 22 October 2026 from the outline Øystein agreed that day. Engine claims are checked against `main` at `db36ffd`; costs come from `docs/BOARD.md` and `scripts/usage_scan.py`. The plan orders work. "Next" in `SUMMARY.md` changes only when Øystein says so._

## 1. What "built properly" means

The engine is built properly when four tests pass:

- **A new game needs a pack, a domain module and a front end, and no change to an engine rule.**
- **A second pack, very unlike the town, runs in CI.** It has no school, marriages that cannot end, work from twelve, and an elder who decides what the town's council decides. Its worlds pass determinism, the invariants and the demography check.
- **Every mechanism moves an exit point** (`docs/STATUS.md`), or it is cut.
- **The city runs on the same people** (exit point 7).

## 2. Four layers, and the test for each

| Layer | What it holds | Its test |
| --- | --- | --- |
| **The engine** | People, decisions, ties, beliefs, accounts, time, the city, and general mechanisms: obligation, shared hardship, inheritance, feuds, organisations | The same in any world. No rule names a place, an institution or an era |
| **The world pack** | Institutions (can a marriage end, who learns where, how property passes, what is a crime), convictions, era tables | The answer depends on the world. Data, in a format the engine versions. An institution applies to everyone alike, and a conviction is about an act, so no field can say what a person may be or do by sex, origin or belief (Rule 8) |
| **The domain module** | A match, a song, evidence | Only one kind of game needs it. Deterministic, reads people through the front door, gives outcomes back as events, never decides an act |
| **The content** | Places, names, words, era tables | Data. Another language needs no code |

Football is both. Contracts, transfers, a squad, a captain and a club's character are the engine's: organisations, obligation and rivalry. The match, the league and form are the module's.

## 3. How the repositories are arranged

- **Understory** holds the engine, `packs/town` (today's town, identical), `packs/test` (the unlike pack, run in CI) and `domains/music`: today's songs and shows, moved out of `group.ts` as the default domain.
- **Each game** holds its own pack and domain module in its own repo. The engine loads a pack through `createWorld` and refuses a version it does not know.
- **A world** is its seed, its pack and pack version, and its engine tag. A saved game adds a snapshot and the commands since.
- Domains become packages of their own only when a second game exists.

This is the recommendation for the "repo structure for add-ons" decision in SUMMARY.

## 4. Where the engine stands

**What fits.** People (`core.ts`, `generate.ts`); decisions with reasons (`decide.ts`, `considerations.ts`, `grammar.ts`); ties and regard (`world.ts`, `regard.ts`); beliefs and the witness (`witness.ts`); accounts told along close ties (`telling.ts`, on since round 40); wants, steering and aftermath (`time.ts`, `steer.ts`, `aftermath.ts`, `occasions.ts`); rivalry and plans (`drama.ts`, `projects.ts`); groups (`group.ts`); the city (`scale.ts`, `coarse.ts`); the front door (`boundary.ts`); the engine's own arithmetic (`mathx.ts`).

**Modern life written into rules.** Outside `setting.ts` and the tools, "school" appears 25 times in 7 engine files and "divorce" 18 times in 7. The brief's 32 and 28 counted the setting or the tools. The rules behind the words:

- **School.** Everyone from 6 to 18 who does not work meets age-mates every day (`social.ts:645–652`, again at 890 for the city). Friendships start at twelve (`social.ts:387`). There are music lessons at school (`group.ts:345–382`) and a child who struggles at school (`romance.ts:219, 239`).
- **Marriage.** From 18 (`romance.ts:85`). It can end in divorce (`romance.ts:126–146`, `coarse.ts:45, 385`), and aftermath and wants are keyed on that (`aftermath.ts:31, 65`, `occasions.ts:163`).
- **Work.** Hiring runs from 18 to 62 (`work.ts:205`) and retirement from 62 to 67 (`work.ts:69–70`).
- **Named institutions.** The council decides ventures (`projects.ts:269–346`). The bar holds the collection and the town's day (`situations/collection.ts:14`, `situations/yearly.ts:15–34`, `time.ts:755`). The witness prefers the bar, the paper or the clinic (`witness.ts:11`).

Each becomes a pack field holding today's value.

**Content still code** (portability rule 7). `setting.ts` has 762 lines with 17 functions, most of them habit fits that are only weights. `families.ts` has 115 acts with 124 inline functions, which are conditions and words. `motives.ts` is data apart from 2 functions. Marks' texts sit in `core.ts` (364). The music domain sits inside `group.ts` (`chemistry` at 63, `work` at 438, `show` at 549).

**General mechanisms missing:**

- **Obligation owed and called in.** The promise that comes due is 8% of all decisions (round 41's battery) and leads nowhere: 0% weighty descendants (`reports/consequences-f26.txt`).
- **Shared hardship,** feuds between families or groups, and leverage.
- **Organisations with norms** (exit point 9).
- **Homes and inheritance of property.** Only traits are inherited (`generate.ts:174`).
- **Fame as reach** (`docs/scale/contract.md`, rule 4).
- **Time inside the month:** places and presence, deaths with a moment, records, things in events.

## 5. The order of work

**The record.** Between 18 and 22 October there were 39 rounds of every kind. Since round 24a, rounds on the page, the record and the reading were kept 18 times in 20, and rounds that change what people do 4 times in 16. Since round 25d, 13 such rounds were tried and one was kept: round 40, which bundled four mechanisms that had each failed or been withdrawn alone (rounds 31, 34 and 37, 36, 38). A blind sitting costs about $4 to $6 at list price (M38's 19 sittings, median $4). One pack (two roles, two parts, four sittings) costs about $20, two packs about $45. In the one window the usage scan covers, readings were two thirds of everything spent. So each phase below is costed in readings and in Øystein's decisions. Calendar time is not the limit.

### Now: finish the reasons arc, and the human test

- **Neutral:** `motives.ts` as data, before the wording round is built.
- **The second and last round on reasons** (Next 2), held to a cap. It changes words only: the 22 worst phrase–act pairs and `backsong`, written as data. It is read on one pack, and it stops at its sizing if fail-if 1 or 2 fires (`notes/research/wording.md`, PR #78).
- **The human test** (Next 3): people read round 40's busiest pack. It decides whether "reads better" counts again.
- **Moves** exit points 3 and 5. **Brings closer** every game, since every "why?" a player asks shows a reason.
- **Costs** one pack or none. Two decisions: the cap, and who reads.

The current order is right to finish reasons first. Unfit reasons are the fault readers quote most (683 on M38's true pages), and readers faulted them in rounds 29, 33 and 34, so every later reading of substance is fairer for the fix. Two things in it are wrong. The human test is placed "when Øystein picks it up", but every kept change from here rests on it, so it should be dated, before phase A's first bundle is read. And after this round, no round that changes only the page should run until phase A has kept a bundle. Rounds on the page pass and rounds on substance mostly fail, so the work drifts to the page; that drift is the complexity mistaken for progress `WHY.md` warns of.

### Phase A: what people are made of

Four arcs. Each starts with research and runs at most two full rounds.

1. **Consequences that reach:** obligation owed and called in, and shared hardship, where one blow binds or splits the people it hits. Moves exit points 2 (reach, 7% today, 15% needed) and 1.
2. **Close ties,** starting from the moments a tie is tested: a blow, an ask, a move. A ledger read everywhere decided under 1% of choices (round 32). Moves exit point 1.
3. **Organisations:** norms held in members' beliefs (`notes/organisations-concept.md`), first the row escalation made each group's own, tried in the band for a year. That band is the milestone Overstory proposed to share (its request 8). Moves exit points 9, 1 and 8.
4. **Wants for the quiet majority:** doors for later life (round 43). Moves exit point 2.

**How substance shows (finding 2).** Each part is judged on its own counter, fixed before the test: the share of decisions it decides, the change a what-if finds, and its reach. The reading checks only "reads no worse", on one pack. Parts that pass are bundled, arcs 1 and 2 together and then 3 and 4, and each bundle is read on two packs for "reads better", once the human test has said that verdict counts.

- **Brings closer** the band manager, hotel, life simulation, football, union representative, festival and the hidden kingpin. Close ties are needed by 10 of the 27 ideas, consequences by 13, organisations by 7, wants by 5.
- **Costs** six to eight rounds, a third of them likely stopped at sizing: about five one-pack readings and two two-pack readings, some 36 sittings. Five decisions: each arc's branches, and the band as a shared milestone.

The order puts round 43 last. It is the third try at wants (25d not kept, 36 withdrawn), and wants are needed by the fewest ideas.

### Phase B: the structure

All neutral, so CI proves each job identical, and all run beside phase A on files no open round claims.

1. **Content as data** (finding 6): one sweep per file, each a `refactor` PR merged the day CI is green. `motives.ts` goes in "Now". `setting.ts` can go while the wording round runs, since that round does not touch it. `families.ts` goes after the wording round merges and before phase A's first build.
2. **The pack format and the test pack.** Institutions and convictions, the town pack identical, the start year from the pack (#23), and the test pack in CI.
3. **The front door's part two** (#22). First reads by viewer, `eventsAfter`, versions, and save and load. Then branching (request 15, finding 4). Then commands, scenes that play a situation the engine raised, and domain outcomes given back as events. Each is announced on #60 before it lands.
4. **The music domain** behind the domain interface.
5. **Homes as plumbing** (#59, step 1), and **focus that follows an organisation** for the city.
6. **A measure of event density** (finding 5), added to the battery.

- **Moves** the tests in section 1, not the exit points, which is why all of it can be neutral. **Brings closer** every game. Branching serves Inquest and the observer games.
- **Costs** no readings. Three decisions: the pack format and its Rule 8 closure, the repo structure, and whether commands are judged by a counter without a reading.

### Phase C: the first game

Øystein chooses it when exit points 1, 2 and 9 are close and Overstory's register is in. The game brings its pack and domain module in its own repo. The engine pulls forward the phase D work that game needs, and story sifting is built here, for what that game finds storyful. Its players are the outside readers exit point 5 asks for.

- **Costs** none of our readings. Three decisions: which game, its pack, and who builds its domain.

### Phase D: as games ask

| Capability | Needed by | Moves |
| --- | --- | --- |
| Accounts: records with a maker and a stake (Overstory 11–13), opinions | Newspaper, detective, mediator, radio | 2, 6 |
| Time and moments (`notes/time-and-moments.md`), deaths with a moment (14), things in events (16) | Inquest, detective | 2 |
| Crime and killings | Detective, kingpin | 2 |
| Inheritance with homes (#59, step 2) | Family legacy | 2, 8 |
| Fame as reach | Newspaper, radio, football | 2 |

Each is an arc of research and at most two rounds, about three one-pack readings and one decision.

**Accounts (finding 3).** Overstory's two leading concepts lean on accounts. The part they praise, accounts told with their tellers, is on since round 40. What is paused is records and opinions. They stay in phase D, with one rule set now: if Øystein chooses the newspaper or a mystery as the first game, records become that game's first engine arc in phase C. Reads by viewer (phase B) give both concepts what each person could know before then.

### Where Overstory's register slots in (finding 10)

Each request is placed by its layer:

- **An engine capability** joins the phase A or D arc for its capability code in `notes/game-demand-map.md`.
- **The front door or the export** joins phase B, item 3.
- **The pack or content** joins phase B, item 2.
- **A domain** belongs in the game's repo.
- **Presentation** is Overstory's.

A request that moves no exit point waits, unless Øystein adds a point. Requests that share a capability are taken as one arc. What we take is recorded in SUMMARY. The register informs the choice of the first game; it reorders nothing by itself.

## 6. Throughput

**What can be neutral.** All of phase B. CI proves each job identical, it runs on Opus 5.5 or Sonnet 5.5, and it costs no reading.

**Branching is the cheapest win (finding 4).** `cloneWorld` (`src/tools/clone.ts`) copies a world exactly, and `whatif.ts check` proves the copy runs the same. Three things are missing for a game:

- a `branch(h)` at the front door, since a game may use nothing else;
- a way to change the decision a game saw, named by its event's decision (person, trigger and option, `world.ts:50–59`). Today's hook is a global (`decide.ts:209`) that counts choices and flips to the likeliest other answer, which a game cannot aim and two worlds at once would share. On the world, with the same draw and another answer, nothing else moves;
- save and load as plain data (#22, item 4).

It is one neutral session.

**Where readings can be shared:**

- A round that claims something about one group of lives is read on one pack (`CLAUDE.md`).
- Parts are read only for "reads no worse"; "reads better" is spent once per bundle.
- A round sized first and stopped costs nothing (round 42).
- Overstory's paper playtests are a second instrument, scored against our truth, on their credits.

**The instrument (finding 8).** No outsider has read a life since Q3. The human test comes before phase A's first bundle reading. People read once more before phase C, on the kept bundles. If the human test has not run when the first bundle is ready, the bundle is judged on its counters and "reads no worse", and phase C waits.

**Event density (finding 5).** Round 41's consequence map gives about eleven weighty events a world-month in a town of about 85 people, and about one that leads to a turn. Overstory counts about one notable, knowable event a week. The battery will report, beside exit point 2, the turns a witness could know, per hundred people a month. That number becomes a game requirement when the register sets its floor. It is not an exit point of its own, because a rate pushed alone makes forced drama (`WHY.md`).

**What not to build:**

- An engine clock shorter than a month (finding 1). Moments live inside the month; a finer clock waits for a game that proves it needs one.
- Domain systems inside the engine, game modes, or a director.
- A table of motives for every act written by hand. The worst pairs, and a rule for the rest.
- Rounds on the page alone after the wording round, until phase A keeps a bundle.
- A reputation score. Opinions are accounts, when a game asks for them.
- Killings before deaths with a moment.

## 7. Decisions for Øystein

1. **The wording round, capped:** words only, worst pairs as data, one pack, stop at sizing. Recommended.
2. **Date the human test,** before phase A's first bundle is read. Recommended.
3. **Phase A's order:** reach and close ties, then organisations through the band year, then wants for later life. This moves round 43 behind the others. Recommended.
4. **Substance judged by its own counter** and "reads no worse"; "reads better" only for bundles. Recommended.
5. **Content as data in one sweep per file,** `motives.ts` first. Recommended.
6. **The repo structure** of section 3. Recommended.
7. **Branching as a neutral job in phase B.** Recommended.
8. **Accounts stay in phase D,** and move to phase C if the first game is the newspaper or a mystery. Recommended.

## The ten findings, answered

1. **Time:** game-shapes rule 3 holds, and `notes/time-and-moments.md` is corrected (section 6).
2. **Substance that shows:** each part on its own counter, bundles read for "reads better" (phase A).
3. **Accounts:** phase D, or phase C's first arc if the newspaper or a mystery is chosen.
4. **Branching:** one neutral session (section 6).
5. **Density:** a line in the battery, its floor from the register (section 6).
6. **Content as data:** one sweep per file, between rounds (phase B).
7. **Pace:** phases costed in readings and decisions (section 5).
8. **The human test:** dated, before phase A's first bundle and before phase C (section 6).
9. **Next:** finish the wording round, capped; then no rounds on the page alone until phase A keeps a bundle ("Now").
10. **The register:** placed by layer and capability code (section 5).
