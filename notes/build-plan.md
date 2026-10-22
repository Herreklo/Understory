# Building the engine: the plan

_Outline agreed with Øystein on 22 October 2026. A planning session writes the full plan into this file from the outline, the findings and the questions below, and replaces them with the plan. Until then this is a brief, not a plan._

## The outline (agreed)

1. **What "built properly" means.** The tests a finished engine passes:
   - a new game needs a pack, a domain module and a front end, and no change to an engine rule;
   - a second pack, very unlike the town, runs in CI;
   - every mechanism moves an exit point;
   - the city runs on the same people.
2. **Four layers, and the test for each.**
   - **The engine:** people, decisions, ties, beliefs, accounts, time, the city, and general mechanisms (obligation, shared hardship, inheritance, feuds, organisations). It is the same in any world.
   - **The world pack:** institutions (can a marriage end, who learns where, how property passes, what is a crime) and convictions. The answer depends on the world. It is data, in a format the engine versions, and that format leaves no field that could break Rule 8.
   - **The domain module:** a match, a song, evidence. Only one kind of game needs it. It is deterministic, reads people through the front door, and gives back outcomes as events.
   - **The content:** places, names, words, era tables. Data.

   Worked example: football is both. Contracts, transfers, a squad, a captain and a club's character are the engine's; the match, the league and form are the module's.
3. **How the repositories are arranged** (the "repo structure for add-ons" decision in SUMMARY):
   - Understory holds the engine, the town pack and a small test pack;
   - domain modules sit beside the engine, with the engine's music as the default;
   - each game holds its own pack and domain;
   - a world is its seed, its pack version and its engine tag.
4. **Where the engine stands against the layers:**
   - what fits;
   - what modern life is written into rules (school about 32 times and divorce about 28 times outside the setting);
   - what content is still code (portability rule 7);
   - which general mechanisms are missing.
5. **The order of work, in phases.** Each with its rounds, the exit point each moves, its neutral jobs and its cost in rounds and readings.
   - **A. What people are made of:**
     - consequences that reach (shared hardship, obligation);
     - close ties;
     - organisations (exit point 9);
     - wants for the quiet majority.
   - **B. The structure:**
     - content as data;
     - the world pack format and the test pack;
     - the front door's part two (commands, scenes, outcomes given back);
     - focus that follows an organisation.
   - **C. The first game:** chosen, with its domain module and pack.
   - **D. As games ask:**
     - accounts;
     - time and moments;
     - crime and killings;
     - inheritance with homes;
     - fame.
6. **Throughput:** which work can be neutral, where readings can be shared, what not to build.
7. **Decisions for Øystein**, each with a recommendation.

The first game stays open: the plan orders work by what all games share, and says which game each phase brings closer.

## What is already settled

`notes/game-shapes.md` (20 October) settles the contract between engine and games:
- the player acts, and people decide;
- people live in the engine, and domains beside it;
- two clocks, one truth;
- select, never script;
- one kind of organisation from two people to hundreds, and focus that follows people and organisations;
- the setting as data before a second pack.

The plan builds on it and does not reopen it without saying why. Also on file:
- `notes/game-demand-map.md`, the capabilities and which ideas need them;
- `notes/organisations-concept.md`;
- `notes/time-and-moments.md`;
- the exit criterion in `docs/STATUS.md`;
- the portability and scaling contracts in `docs/scale/`.

## What Overstory is doing (22 October)

- **The visual lab.** LT1 (the harbour street in 1989) has its building system done; its Unity part is next. Then the people deep dive, LT2 (two people talking in a venue at night) and LT3 (the street through the years). LT1 and LT2 run on authored fixtures. The engine link is sixth in its order of bets (`docs/research/reality-check.md` in `Herreklo/Overstory`).
- **Paper playtests of six game concepts on world 9989**, scored "ready today" and "with the missing pieces". A must-improve register will come to #60 as one bundle. The early signals are from the design panel only:
  - the newspaper and a mystery lead, because accounts with tellers, the council, festivals and the till skims are rich;
  - sport waits on a club, and mystery on non-natural death;
  - the export lacks places, witnesses, records and habits as timetables;
  - the town makes about one notable, knowable event a week.
- **Engine requests 1 to 17** (`docs/engine-requests.md` there):
  - the front door's part two (#22);
  - the start year and one timeline for the economy and the buildings (#23);
  - places that close;
  - records as accounts (11–13);
  - deaths with a moment (14);
  - branching from a checkpoint (15);
  - things in events (16);
  - moments in focus (17).

## Findings the plan must answer

1. **My time note conflicts with game-shapes.** `notes/time-and-moments.md` proposes a focus period run day by day in the engine. game-shapes rule 3 keeps the engine's clock at a month, with scenes as the game's clock, and lists "an engine clock shorter than a month" as flexibility to resist. My lean: scenes on the month come first, and a finer clock only if scenes cannot carry a week. The plan decides, and corrects whichever note is wrong.
2. **The rounds have gone into the page, not the substance.** Of the rounds since 24, most worked on how a life reads (the reasons, the wording, the reading itself). Many substance rounds were not kept: accounts (29, 31), carrying a friendship (32, 33), everyone wants something (25d), wants that answer (36, withdrawn). Effects of a single mechanism are small next to what a reading resolves (about ±0.35 at 24 pairs). The four together (39, 40) is the one bundle that read better. WHY.md warns about confusing complexity with progress. The plan says how substance gets built so that it shows: bundles, a round's own counter, or a different measure.
3. **Overstory's leading concepts lean on paused work.** The newspaper and the mystery need accounts (#20, paused), and the mystery needs non-natural death. The plan weighs unpausing accounts against its place in phase D.
4. **Branching may already exist.** Overstory asks for branching from a checkpoint (15). The engine has `src/tools/whatif.ts` and `clone.ts`, and the demand map marks clean counterfactuals as built. The plan checks what is missing, if anything, for a game to use it, and whether it is a cheap neutral win.
5. **Event density is a game requirement.** "One notable, knowable event a week" is Overstory's arithmetic, and game-shapes calls quiet worlds the largest risk to the games. The plan asks whether that rate should be a measure of its own beside the consequence share (exit point 2).
6. **Content as data collides with experiments.** It touches `families.ts`, `motives.ts` and `setting.ts`, which most experiments also touch, and an open PR claims its files. The plan schedules it: one sweep between rounds, or piece by piece as each system is touched.
7. **The pace is fast, the hit rate low.** About five to eight rounds a day since 18 October. So a phase of ten rounds takes days, not months. The constraints are credits (readings), Øystein's attention and the human test, not calendar time. The plan costs phases in readings and decisions, not weeks.
8. **The instrument is a model reading.** No person outside the project has read a life since Q3. A plan that runs fifteen rounds judged by blind model readers risks optimising for them. The plan places the human test.
9. **The current "Next"** (the wording research, PR #78, and the second and last round on reasons) is Øystein's order. The plan says plainly whether phase A should come before it. It weighs that round's cost against leaving the reasons arc unfinished.
10. **Overstory's register is coming.** The plan leaves a defined place for it: how a request maps to a phase. It does not guess the register's contents.

## How the plan is written and checked

- Every claim about the engine is checked against the code, with file and line, never taken from this brief.
- Costs come from the record: `docs/BOARD.md`'s rounds and outcomes, and `scripts/usage_scan.py` for what readings cost.
- A pre-mortem by the `reviewer` agent on Fable 5.1, with "pre-mortem" in its brief: assume the plan was followed for a month and failed, and say why. The plan answers each point or changes.
- No battery, no reading, no fresh world: this is a document.
- The result is this file, at most about 2,500 words, plus a short entry in SUMMARY's "Waiting for you". The PR stays a draft for Øystein to read. "Next" changes only when he says so.
