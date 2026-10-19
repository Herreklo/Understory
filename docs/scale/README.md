# City scale

The scale track takes the person model from a town of 75 to a city of 100,000+. It changes how much detail people get, never what people are or do. The design is in `level-of-detail.md`. The rules engine code follows so it scales are in `contract.md`. Every step's pre-registration, result and correction is in `SCALE.md`.

## Where it stands

The engine on `main` runs a city. A town of one neighbourhood is identical to the engine without it: every person, event, bond, belief and random stream, with every switch.

**The monthly world.** People meet through settings (household, work, school, neighbourhood, venue), not the whole town. SPEED_README

**Institutions.** Every neighbourhood of about 80 people has its own workplaces, each with its capacity, staff and leader. Work is bounded by the jobs there are. People arrive for jobs nobody local can take.

**The background** lives a year at once.
- Rules about one person run by the engine's own formulas, month by month: growing older, the body, illness, retirement and death.
- Rules that depend on other people are drawn from odds fitted to the full engine, refitted for each engine.
- On the current engine it matches the monthly world on the over-65 share, partnership and drinking, but has about a quarter too few children: young people pair up less often than in full towns, and couples have fewer children, so the background ages and works more. Deaths at 80 and over match the engine's; at 65–79 they are about a quarter low.
- A background neighbourhood's past depends on nothing outside it.

**Promotion.** When the player's story reaches a neighbourhood, it comes into focus.
- Everything its people are stays exactly as it was. Promotion only adds texture: routines, neighbours, friends, and backstory replayed by the engine's own contact rule. A falling-out in the replayed years can leave a want to make things right.
- Promoted people match people always in focus on friends, the friendless share, people known well, routines and partnership. They carry about half to two thirds of the marks from history.

**The twin test** (last run on the round 19c engine). The same founding is lived twice: once in focus, once in the background and then promoted. In the test's sixteen situations, most of what thirty years change in how a person chooses comes from growing older, which both tiers share. Of the change that comes from lived experience, the background keeps only part: about a third for choices, on one seed. It also has about a quarter fewer learned if-then habits, a fifth less self-story and a quarter fewer marks. What the background loses is acquired individuality. The test cannot yet see bonds, money or strain in decisions.

**A city of 100,000** (last timed on the round 19c engine). It builds in 2–3.5 minutes, lives a background year in 3–7 seconds and uses about 1.1 GB. The background adds about 25% to an ordinary month of the town inside it. Timings vary by about 45% between hosts, so compare them only within one sitting.

**Not built:** demotion, the in-view tier, fame-driven reach, and institutions serving areas wider than a neighbourhood.

## The code

The scale code is part of the engine (`src/scale.ts`, `src/coarse.ts`, `src/coarse-odds.ts`, and city paths in the engine's files). `code.md` says what lives where. `contract.md` holds the rules new engine code follows so it scales.

- `scale/`: the harness. Each script is run from the repo root and imports the engine from `src/`.
- `scale/bench/`: the odds fit (`fit.py`), the pre-registered checks (`report7.py`), the profile reader (`hot.py`), and the City Scale report generator (`report.py`).

## Running

    npm install
    npx tsx scale/identity2.ts 1 10             # a town's whole-world fingerprint after 40 years; must equal the engine's
    npx tsx scale/bench.ts 1840 1 5 12          # time a month by system, at about 2,600 people
    npx tsx scale/city2.ts 920 <seed> 2 2       # a half-background city: capacity, coarse against full, promotion
    npx tsx scale/invariance.ts 300 <seed> 3    # a background neighbourhood is independent of everything outside it
    npx tsx scale/promoinv.ts 300 <seed>        # promotion changes nothing but texture
    npx tsx scale/twin.ts 300 <seed>            # the twin test
    npx tsx scale/city100k2.ts 100000 <seed> 30 184   # a city of 100,000 around a town
    npx tsx scale/sample.ts 300 <seed>          # one neighbourhood, before and after promotion
    python3 scale/bench/report7.py <cities.jsonl>     # the pre-registered checks over a set of cities

Refit the background's odds after an engine change:

    npx tsx scale/transitions.ts <from> <to> 20 > transitions.jsonl
    python3 scale/bench/fit.py transitions.jsonl --holdout <seed> --out src/coarse-odds.ts

Seeds come from the scale rows of `docs/seeds.md`, fresh for every test.
