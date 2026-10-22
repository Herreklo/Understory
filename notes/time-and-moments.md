# Time and moments: a concept

How the engine could tell a week or an evening, not only a month. Ideas only: nothing here is built, and nothing here changes the engine until a round takes it on. Written 22 October 2026 from a conversation with Øystein about Overstory's "moments in focus" note (#60, request 17) and its Inquest idea.

## The question

The engine runs in months: one tick, one situation per person, and every random stream reseeded each month. Nothing in `docs/` argues for the month. It was inherited from the first design, because the engine was built to simulate lives, and a life reads well month by month.

A game story can last a week or an evening. Today a falling-out, a friendship's spark or a death happens "in March", with nobody else present and no place. A week-long story would see four quiet weeks and one month-sized change.

## Two resolutions, kept apart

- **Memory resolution** is how finely a person remembers. Recent things are kept in detail, old ones fade to the few that mattered: the day after an evening, much; a week later, some; a year later, the big things. This is cheap, changes no decision, and belongs with the accounts arc (#20), where people already keep their own version of events.
- **Simulation resolution** is how finely the world runs. Finer time only for a window, a **focus period**, run day by day, with the rest of the world on months. The city's two speeds (a few thousand monthly, the rest yearly, fitted to match) are the precedent: two clocks are fine if the coarse one is checked against the fine one.

Rules for a focus period:

1. Lives in a focus period match monthly lives on average (same rates of bonds, rows, moves and deaths), checked as the city's background is.
2. The focus is chosen by pressure in the world (a deadline, a row about to break, danger), never by who is watching. Outcomes never depend on being watched.
3. The finer clock is derived from the month deterministically, so the same seed gives the same evening.

Talk of the Town did this (fine simulation near the player, coarse elsewhere) and its lesson holds: the levels must agree, or the town changes when you look at it.

## The arc, in order

| Step | What                                                                                                                          | Measured by                                  | Size                                 |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------ |
| 0    | Measure today's engine: of weighty events, the share with weighty consequences, and how many lives each reaches               | a diagnostic, no change                      | a neutral job                        |
| 1    | **Scenes**: an event has a place and who is present, and those present are witnesses, still monthly                           | the same share and reach, up                 | research + one round                 |
| 2    | **The focus period**: a window run day by day, chosen by pressure                                                             | rule 1 holds; a week's story reads as a week | about two rounds, plus city plumbing |
| 3    | **Deaths with a moment** (Overstory request 14): an accident or a choice, with who was present and what could have changed it | deaths that point to a day; their aftermath  | one round                            |
| 4    | **Killings**, last: a path to them, rare, with aftermath and memory. Rule 8 allows it: controversy in acts, never identity    | rarity and aftermath, read blind             | one round                            |

About four to six rounds in all. Each step stands alone if the arc stops there. Scenes come first because every later step needs "where, and who was there".

## What it would give Overstory

Inquest (Overstory's ghost game) needs deaths with a moment (14), things in events (16), records as accounts (11) and **branching from a checkpoint** (15): run one world twice from a month with one decision changed, and return what differs. Branching also serves our own method: a "but-for" test of any cause, and a cleaner with-and-without than two separate runs.

## When

Not before Øystein orders it in SUMMARY's "Next". Natural points: after the accounts arc is unpaused (memory resolution rides on it), or when Overstory's front door part two (#22) needs places and who is present. Step 0 can run any time as a neutral job.
