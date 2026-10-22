# Time and moments: a concept

How the engine could tell a week or an evening, not only a month. Ideas only: nothing here is built, and nothing here changes the engine until a round takes it on. Written 22 October 2026 from a conversation with Øystein about Overstory's "moments in focus" note (#60, request 17) and its Inquest idea. Corrected the same day by the build plan (`notes/build-plan.md`, finding 1): the engine's clock stays the month, as `notes/game-shapes.md` rule 3 says, and an evening is a moment inside it.

## The question

The engine runs in months: one tick, one situation per person, and every random stream reseeded each month. `notes/game-shapes.md` (rule 3, "two clocks, one truth") keeps it so: the month is the clock of lives and belongs to the engine; the scene is the clock of play and belongs to the game.

A game story can last a week or an evening. Today a falling-out, a friendship's spark or a death happens "in March", with nobody else present and no place. A week-long story would see four quiet weeks and one month-sized change.

## Two resolutions, kept apart

- **Memory resolution** is how finely a person remembers. Recent things are kept in detail, old ones fade to the few that mattered: the day after an evening, much; a week later, some; a year later, the big things. This is cheap, changes no decision, and belongs with the accounts arc (#20), where people already keep their own version of events.
- **Time inside the month** is when, where and with whom an event happens. The month still runs once. A **moment** is a gathering the month finds where pressure meets a situation (strained people at the same dinner, funeral or gig, as Overstory's request 17 puts it): it has a day, a span of hours, a place and the people present, and the engine resolves it as events with their causes inside the month's tick. A game's scene plays a moment the engine raised; it never makes one up.

Rules for moments:

1. Lives with moments match lives without them on average (same rates of bonds, rows, moves and deaths), checked as the city's background is.
2. A moment is chosen by pressure in the world (a deadline, a row about to break, danger), never by who is watching. Outcomes never depend on being watched.
3. A moment's day and hours are derived from the month deterministically, so the same seed gives the same evening.

Talk of the Town ran fine simulation near the player and coarse elsewhere, and its lesson holds: the levels must agree, or the town changes when you look at it.

Rain World (2017) shows it can feel like one living world. Creatures near the player run in full; the rest move between rooms and dens as a cheaper sketch, and become full when the player arrives. Players describe the whole ecosystem as simulated live, because the seam does not show: what they walk into always looks like it had a past. That is the game argument for this arc. Today an event is a point in a month, so nothing is ever in progress; a player who arrives on a Tuesday cannot walk into a row half-way through. Places, presence and moments give events a place, people present and a span of hours a player can arrive in the middle of.

**A finer clock** (a window of the world run day by day) is not on the arc. It waits for a game that shows moments on the month cannot carry a story people live over days, among themselves; the detective game is the likeliest (`notes/game-shapes.md`, "What can wait"). If it comes, rules 1 to 3 above hold for it too.

## The arc, in order

| Step | What                                                                                                                          | Measured by                                  | Size                 |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------- |
| 0    | Measure today's engine: of weighty events, the share with weighty consequences, and how many lives each reaches               | a diagnostic, no change                      | a neutral job        |
| 1    | **Places and presence**: an event has a place and who is present, and those present are witnesses                             | the same share and reach, up                 | research + one round |
| 2    | **Moments**: gatherings found by pressure, resolved inside the month with a day and a span of hours                           | rule 1 holds; an evening reads as an evening | about two rounds     |
| 3    | **Deaths with a moment** (Overstory request 14): an accident or a choice, with who was present and what could have changed it | deaths that point to a day; their aftermath  | one round            |
| 4    | **Killings**, last: a path to them, rare, with aftermath and memory. Rule 8 allows it: controversy in acts, never identity    | rarity and aftermath, read blind             | one round            |

About four to six rounds in all. Each step stands alone if the arc stops there. Places and presence come first because every later step needs "where, and who was there". Step 1 is named so to keep "scene" for the game's clock of play.

## What it would give Overstory

Inquest (Overstory's ghost game) needs deaths with a moment (14), things in events (16), records as accounts (11) and **branching from a checkpoint** (15): run one world twice from a month with one decision changed, and return what differs. Branching also serves our own method: a "but-for" test of any cause, and a cleaner with-and-without than two separate runs. The build plan puts branching in its structure phase as a neutral job, since `src/tools/clone.ts` and the what-if hook already do most of it.

## When

Not before Øystein orders it in SUMMARY's "Next". Natural points: after the accounts arc is unpaused (memory resolution rides on it), or when Overstory's front door part two (#22) needs places and who is present. Step 0 can run any time as a neutral job.
