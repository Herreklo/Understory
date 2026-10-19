# Understory

A setting-free model of people, and the work of scaling it from a town to a city, to a world.

People here have HEXACO personalities, values, aptitudes, histories and relationships. Each decision they make is logged with its reasons. A witness learns about them only from what it could plausibly observe. The question Understory measures is whether knowing a person beats guessing from the situation, while people still surprise for reasons that make sense afterwards.

It is interpretable and internally tested. It is not validated against real people.

## Start

    npm install
    npm test
    ./run.sh src/tools/board.ts      # or any script; see docs/ARCHITECTURE.md

## Read first

| File | What it holds |
| --- | --- |
| `SUMMARY.md` | Where the project stands, in one page and plain words |
| `WHY.md` | Why the project exists and what it might become. Intent, not rules |
| `CLAUDE.md` | How work is done here: who works on what, the two kinds of change, the gate, the standing rules |
| `docs/STATUS.md` | The current design, its numbers, its weaknesses and the exit criterion |
| `docs/BOARD.md` | Every experiment's pre-registration and outcome, failures included |
| `docs/ARCHITECTURE.md` | What lives where in the code, the order of a month, and every switch |
| `docs/seeds.md` | Every seed range in use. A seed used for a test is never used again |
| `docs/scale/` | The city-scale track: design, scaling contract and log |
| `docs/method/` | The seven working skills, and what the project takes from prior art |

The open pull requests say who is working on what.

## Layout

    src/            the engine
    src/tools/      measurement tools (board, what-ifs, consequences, audit, diag/)
    scale/          the city-scale harness
    scripts/        analysis scripts (paired differences, reader agreement, seed check)
    docs/           the living documents
    reports/        small result summaries worth keeping in git

Raw outputs (`out-*/`) stay out of git. Each tagged experiment attaches them to its GitHub release.
