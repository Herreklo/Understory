# Person Model Lab: status (round 19c, 17 Oct 2026, night)

## What the lab is

A small town, Skarvik (about 80 people), simulated for thirty years before a witness arrives and ten after. Nothing is scripted. Every person is read from two sides: FELT, what one witness in town could know, and TRUTH, everything. The player will only ever get the felt side. Skarvik is a placeholder setting: places, trades, kinds of plan, quirk material and small loves are setting content; the engine is general.

The lab answers two questions:
1. **Can people be read?** Knowing someone's character, learned only from what a witness could see, should predict their choices better than readers who know nothing about character. The scoreboard (`npm run board`, BOARD.md) answers it on held-out worlds with intervals.
2. **Are they worth reading?** Lives should have arcs, rivals, plans, a way of being and a shape left by what happened to them; everyone should be a little different and resemble others. `src/story.ts`, `src/personas.ts` and `src/friends.ts` measure it.

## Where it stands

### Readability (last full board: 20 untouched worlds × 10 years, seeds 1201–1220, mean ± 95% interval)

| Slice | Share | Base rate | Notebook | Page-evidence reader | Calibrated witness | Trait oracle | Mind-reader |
| --- | --- | --- | --- | --- | --- | --- | --- |
| All decisions | 100% | 64.2 | 68.4 | 68.0 | 71.4 ±1.4 | 81.7 | 85.3 |
| Novel, contested, known | 19% | 59.0 | 59.0 | 63.6 ±1.4 | **67.5 ±1.5** | 80.5 | 83.0 |

Readers: base rate (what most people do in this kind of situation, learned on twenty other worlds); notebook (what the witness last saw this person do here, else the base rate); calibrated witness (base rate shifted by how this person differs from an average one, from the witness's beliefs); page-evidence reader (the same, rebuilt only from what the player's page shows as acts); trait oracle (diagnostic: true traits); mind-reader (everything; the ceiling). Key slice: novel (never seen in this kind of situation), contested (under 65% certain from circumstance), known (three settled beliefs or closeness).

Across fresh ranges the calibrated witness beats the notebook by about +6.4 on the key slice; the page-evidence reader by about +4.6. Every change since round 16 has been gated on the paired scoreboard (overall within ±2, the key slice reported); none has moved it out of that band. Drama makes people somewhat harder to read where the witness cannot see (round 16: key slice −3.4 ±5.6), which is what hidden drama does to an observer and is kept on purpose.

### Lives (twenty fresh worlds each, with and without the change)

- **Rivals:** 13% of adults have a named rival (bound 8–35%). Successions are a season: contenders declare, campaign (work to be seen, a word to the one who decides, picking at the other's work in public, stepping aside), and the loser's answer can turn into a grudge carried in small acts until peace, leaving, death or cooling.
- **Plans:** 16.6 of 79 people per world own, back, help, or oppose a plan; a festival is held in 14 of 20 worlds; half of plans fail. A café opens in only 2 of 20 (too hard).
- **A way of being:** humour styles track traits at published sizes (warm–sociability 0.52, cutting–gentleness −0.50, self-mocking–anxiety 0.41, coping–anxiety −0.37). Within a town, 0.12% share a quirk sentence; full surface identical 0.04%; nearest neighbours in traits share a surface feature about 1.5 times as often as random pairs. 48% of adults over 40 carry a mark from their own history. About 10 acts per world give a sore spot or fear as their reason, 17 a rule to live by.
- **Friends:** median 3 close friends in town, top tenth 10, 15% of adults with none (25% at 18–29); 16% of friendships end over ten years when people stop meeting. 6.6% of familiar pairs include one who dislikes the other.
- **Dead lives** (fewer than five weighty events in ten years) 13%; repeats 19–21%.

## How it works (current design)

### People
- Facets drawn around six correlated HEXACO dimensions; two or three signature facets pushed to about 1.2–1.9 standard scores (6% of facet scores beyond ±2). One to three if-then signatures each (shifts 0.5–1.4; 70% sharpen or soften the trait, 30% run against it).
- Values, aptitudes, inclinations set at birth and partly inherited with regression to the mean. Plasticity falls with age (about 1.7 at 18, 1.0 at 40, 0.3 at 65) and scales every life-driven change of a trait.
- Every skill works the same way: an inclination from traits, interest called out by people and experience (a parent, a friend, work, school, a great night), mostly before the early twenties. People look for work in what they love; children follow a parent's trade about 1.4 times as often as not.
- Mortality on a Gompertz curve fitted to Norwegian rates; births, deaths and arrivals keep the town level (under-20s about 18%). Households leave together or someone is left.

### Decisions
- Every decision runs through one grammar (`run`): a situation, families of answer (anger, humility, withdrawal, pride, care, …) and expressions within them, each weighed from traits, if-thens, values, the self-story, bonds, circumstance and the person's acquired sore spots and rules. Every decision is logged with its reasons. Causes print as reasons with direction ('despite …').
- Hostile expressions become situations for their target. Pressure answered the same way three times in six years becomes a phase, said once; the same act toward the same person years apart says so.

### Social fabric
- Contact comes through channels: habits, work, home, circles, hobbies, groups, school (ages 6–18, within two years of age) and seeking someone out. In a shared setting of more than four, time is a budget: about three others' worth, mostly those already liked.
- Familiarity grows with contact and fades; a bond's recent contact decays monthly, and friends who stop meeting lose touch.
- Liking moves toward chemistry (values in common, the other's warmth and liveliness) scaled by familiarity, plus 0.2 × familiarity where chemistry is not clearly bad (repeated pleasant contact raises liking).
- Friendship from twelve, when two like each other enough both ways (0.45) and know each other well (0.5); ended by a quarrel or by losing touch. Friendship lines say what brought two people together.
- Regard: from the bond (liking, trust, respect) and beliefs about the other's admirable traits, shrunk toward neutral when evidence is thin. Every choice of a counterpart uses it.

### Drama (`src/drama.ts`)
- Succession seasons with contenders, campaigns, a decider who weighs record, regard and campaign; rivalries (post, grudge, trade) with heat that rises with acts and cools monthly; found-out schemers barred from scheming for two years; peace offers. Every act cites where the rivalry started.

### Plans (`src/projects.ts`)
- Ventures (a café: money, the council, threatens the Anchor) and causes (a summer festival: helpers, the council, recurs if it went well). The owner asks people they regard most, two a month; each answer is the other's decision. Whoever is threatened may fight it, which makes a rivalry. The council's chief officer decides. A venture that opens is a new place with jobs; a festival is one night where each helper does their part or doesn't.

### A way of being (`src/persona.ts`)
- Surface, fixed for life from traits and the person's own seed: humour (warm, coping, cutting, self-mocking, wit), voice (talk, bluntness, dryness, warmth, formality), quirks from about 130 patterns each filled from the person's own life (their trade's things, their people, their years, their rooms, their grudges), given out at 16, 30 and 50 so that within a town each sentence is one person's; two or three small loves.
- Depth, from history: sore spots, fears, pride and rules to live by, acquired with a probability that rises with anxiety, unforgivingness, the weight and publicity of the event, and fades with years. Sore spots and fears become acquired if-thens; rules join the self-story. Humour makes its own moments. Quirks appear in everyday lines.

### The witness
- Learns from acts (evidence scaled by how uncommon the answer is in town; an if-then-driven act teaches the if-then first; a habit is learned once), from manner at research accuracy (a read correlates 0.18–0.45 with the truth; a third point the wrong way), and from closeness as evidence, never truth. Strong reads become lines the player sees ('Noticed: …'), wrong ones included. The page carries a ledger of every seen act.

## Known weaknesses
1. **The friendship tail:** the most-befriended adult has 22 friends in a town of 80. The budget caps conversation, not friendship.
2. **Plans don't ripple:** a backer who lost money, a café that takes the Anchor's trade, a festival that let people down change too little afterward. The café is too hard to open (money and the council stop nine in ten).
3. **Couples have no inner life:** divorce runs at 0.69% a year (too low), 40% of adults over 25 are single, and partners never fight. `src/love.ts` is written but not wired.
4. **No opinions or moral lines:** plans and rivalries have no sides beyond interest.
5. **No reputation:** what the town says about someone does not exist as a thing that changes what happens to them.
6. **Generation is per-person:** no family background, class or upbringing that a city would need.
7. **Quirk pattern dominance:** the most-used pattern is held by 3.7% of adults (bound 3%).
8. **The human test:** Quiz II's single sitting showed the page making a skilled reader worse (17/20 before reading the page, 13/20 after: a vivid act read as general character). The quizzes are paused at the designer's request; the lesson is for the page's design.

## Next
1. **Round 20: ways of loving and fighting.** Attachment (anxiety and avoidance), responsiveness, how someone shows care (not a language a partner must match), and how they fight (criticism, contempt, defensiveness, stonewalling against repair). `src/love.ts` holds the model; it needs its expressions in `families.ts`, registration in `grammar.ts`, a 'love' random stream, the tick call and care as an event type. Pre-register: about 55–65% secure; divorce 0.7–1.5% a year; contempt at least doubles divorce; rows per couple-year in a plausible band; scoreboard gate.
2. **Round 20b: courtship.** Asking out, being turned down, triangles, jealousy.
3. A cap on friendships a person can keep up (Dunbar's inner layers, about 5 and 15), pre-registered on its own.
4. Opinions and moral lines, feeding sides into plans and rivalries.
5. Roles and reputation: what the town says about you, and what that changes.
6. Generation and background, for a city.
Separate track: city scale (full detail only near the action; social loops bounded).

## Seeds used (never reuse for a test)
Train 1501–1520. Board eval ranges used up to 1531–1540 (next: 1541+). Test worlds used up to 2401–2420 (next: 2421+). Quiz worlds 1601–1630, 1901–1930, 2001–2030. Used worlds for diagnosis only: 1871–1880, 1971–1973.

## Running it
`npm test` (type-check, build, browser check, replay, two worlds, groups, demography, short batch) · `npm run board` or `TRAIN=… EVAL=… BOARD_OUT=… OFF=… ./board.sh` · `npx tsx scripts/pair.ts outA outB` (paired differences) · `npx tsx src/story.ts`, `src/personas.ts`, `src/friends.ts` (lives, people, friends; with and without via `OFF=`). Every switch: `OFF=drama,projects,persona,townquirks,marks,budget,recent,exposure,love,…`.
