# Understory: where we are

_Updated 20 October 2026. One page, plain words, rewritten at every merge to main._

## Where we are going

A world of people you come to understand from incomplete evidence, who surprise you for reasons you recognise afterwards, whose lives are changed by what happens to them, and whose actions reach other people. A player should feel three things again and again:

- **Discovery:** "I think I understand this person."
- **Agency:** "My decision changed what happened."
- **Recognition:** "I remember when that started."

Success sounds like "I knew that guitarist was trouble" or "I shouldn't have made that promise". Every plan is checked against this, and the exit criterion (`docs/STATUS.md`) measures how close the engine is.

## In one sentence

The people decide like people and can be read, but their lives are thin and repetitive; the city now runs on the same engine as the town.

## What works

- **Decisions feel human.** Two human readers both rated the people's logic 4 of 5 ("logic felt like people").
- **People can be known.** Watching someone helps you guess what they will do, a little, and the help comes from knowing that person, not from the situation.
- **Pages tell the truth.** Twelve kinds of false or broken lines are at zero and stay guarded by the tests.
- **The city runs on today's engine.** A month at about 2,600 people runs 8.6 times faster than the town's way of running, and a town on its own is exactly as before.
- **The engine has a front door.** A game creates, advances and reads a world through one module (`src/boundary.ts`), in plain data, under written rules for staying portable to another language or game engine.

## What doesn't work yet

- **Lives are repetitive.** Both readers found the same few dilemmas again and again, and neither wanted a second round.
- **Events lead nowhere.** One weighty event in five leads to anything later; one in seventeen reaches anyone outside the people involved.
- **Few people want anything.** 62% of adults pursue nothing in ten years.
- **Life barely changes people.** Thirty years move how someone chooses about 3% of the way toward being someone else, once growing older is set aside.
- **The page doesn't help a stranger yet.** The human test so far shows no gain from reading it.
- **The city's background ages.** The cheap simulation of everyone off-screen has about a quarter too few children, and people brought into focus from it carry about half the marks of a lived life.

## Next, in order

This is the one priority list. Only Øystein changes its order, and a chat starts an experiment only from the top of it or when he names one. Øystein asked on 20 Oct for a plan to be made and followed; this is it, revised the same evening when round 35 was withdrawn before its test.

1. **Who wants things** (exit points 2 and 5; proposed work 1). Readers choose the life where more happens (70% of their choices over rounds 29–34, +0.16 a pair for every ten lines more), and 62% of adults pursue nothing in ten years. Wants are the main lever for consequences and for arcs a reader can follow: a want from what the person values, their stage of life and their circumstances, open to anyone, pursued through the doors the town has. Round 25d's version read better to all four of its readers at a size its twelve-pair reading could not confirm; this one is judged "reads better" on 24 pairs, with the difference in lines reported beside it.
2. **Reasons a reader can follow** (exit point 3): the situation, the person's state and the bond first, a trait only where it decided, at most two. Unfit reasons are a quarter of what readers fault. Page only, so the two arms are the same world and the reading is at its most exact.
3. **Bring back what changed lives** on top: round 30's telling (the one change that read better, +0.55 with the difference in lines as a term) and round 34's aftermath (blows change lives, +17 points), one at a time, judged "reads better".
4. **People outside the project** (exit point 5): the human test, random and sifted lives side by side.
5. Close ties (exit point 1) and the accounts arc (#20), both paused: rounds 29–33 built states from many small things that added reasons faster than story. Their code is kept behind switches (`ON=accounts`, `ON=telling`, `ON=carry`, `ON=reckon`).
6. For the game (Overstory): the front door's part two (#22), reads of what the player could know, player commands and versions; and the start year from the setting pack (#23).
7. The city's background: partnering and children fixed, so it stops ageing.

## Waiting for you

- Decide on the repo structure for add-ons.
- One change to the order of "Next", which only you make: the band for a year (proposed work 8) as the round after who wants things, because it tests close ties, living changing people and a group's character in one setting. (Who wants things is now first, in the plan you asked for on 20 Oct.)

## Latest merges

- **The reading reports how much happened (M35, 20 Oct):** the blind reading's scorer now counts the lines of each version and reports how much of a round's effect is simply that more happened in one arm, beside the effect a round is judged on. And readers now see the reasons a player sees: the reading's pages had shown a "despite" note the app leaves out on about one line in eleven. Nothing the engine does changed.
- **Round 35 (20 Oct), withdrawn before its test:** it would have folded the town's routine on a person's page (the festival, "count me in", a band's songs). Before any test, two things showed it could not work: on trial worlds the fold took off only 2–13% of a page, and over the last six readings, readers chose the version where more happens 70% of the time. Repeats are what readers name when asked for faults, but what they choose is a life with more in it. The plan now starts with who wants things. Nothing the engine does changed.
- **Round 34 (20 Oct), not kept:** when a blow lands (a death close to someone, a marriage or friendship ending, being passed over, found out or shamed, a want that failed), the person decides once whether anything changes: start again at work, take up a routine, keep away from one, or carry on. It works as meant: blows now change lives in 67% of cases against 50%, in all twenty test worlds, and the scoreboard holds. But the first 24-pair blind reading could not say the lives read better (−0.12 ±0.41), and readers flagged the traits given as reasons for the changes ("wanted to know").
- **A reading that can tell (M34, 20 Oct):** 24 pairs, judged on the improvement with the reading-order bias taken out; reader agreement reported, not a gate. Rescored this way, round 30 (telling) is the one recent change that read better.
- **Round 33 (20 Oct), not kept:** a friend who minds carrying a friendship now faces it once in three years: says it straight, asks for something back, or stops going round, and the other answers. It is the first act between friends readers noticed (quoted 8 times), but they preferred the lives without it in 9 of 12 pairs: when nothing changed it came back three years later, and reasons that did not fit almost doubled. Close ties pause here.
- **Round 32 (20 Oct), not kept:** each friendship now keeps who has been putting in lately: who comes round, who listens, who turns up. One lasting friendship in seven turns out one-sided, and the town knows it ("Hal was always the one who went round to Ruth's"). Where it bears, it reads as a fitting reason: a friend who owes keeps the promise, a friend who has always carried it finds reasons to be busy. But it changed little (it was the deciding reason in under 1% of the decisions it bears on, and few friendships ended over it), and blind readers did not notice it at all. Measured with the order of the two versions balanced for the first time.
- **The exit criterion, two changes (20 Oct):** a ninth point, that a group outlives its members: a band or a workplace has a character its members act on and can name, carried in their beliefs and never in a mind of its own, which survives the departure of every founder. The band and the workplace need this or the origin game cannot be built, and without a point no round could touch it. And point 5 is judged on random lives, with lives chosen by story sifting read beside them and both reported, so thin lives can be told from a page that shows their thin parts. Nothing the engine does changed. The thinking is in the project's notes (`organisations-concept`, `game-demand-map`).
- **Round 31 (20 Oct), not kept:** accounts are now read only where the act bears (a stolen song counts when deciding whether to trust someone, not whether to stay with them), and cited only when they change whom someone turns to. Readers stopped objecting to them (no account quoted as a reason that does not fit, seven quoted as reasons that made sense), and they changed whom someone asked or hired in one choice in twenty. But an account was the top reason of only 0.22% of decisions, and blind readers could not agree the lives with it were better (7 of 12, with the order of the two versions a likely cause). By its own rule, the arc stops to be rethought.
- **Switches for every check (20 Oct):** `ON=telling npm test` now turns a mechanism on in every check the suite runs (six of them had ignored it), and the blind reading tool can compare mechanisms that are off by default and records the commit it was made from. Found by the outside review of `e22c94a`. Nothing the engine does changed.
- **Round 30 (20 Oct), not kept, but the first step that reads well:** people now tell what they saw or what was done to them, once, to the friend who knows the person, and that friend may pass it on; tellers bend it, and now and then name the wrong person. Blind readers preferred the town with it in 9 of 12 pairs, all three of them, a first for this arc. It fails its own test: an account rarely decided anything (0.41% of choices), reach rose only from 5% to 7%, and accounts were given as reasons in decisions they had nothing to do with. Round 31 fixes where accounts are read.
- **Reading tool fixed (20 Oct):** the blind paired reading now picks its people fairly from both versions. Earlier readings leaned toward the version without the change, by an amount we don't know.
- **Round 29 (20 Oct), not kept:** bystanders kept a faint version of every weighty act they saw. It barely decided anything (0.29% of choices with another person), reach rose only from 5% to 7%, and blind readers preferred the lives without it in 9 of 12 pairs: the many faint memories warmed and cooled feelings across town, and pages filled with reasons nobody could follow ("took a little from the trip money, though he thinks highly of Olive"). The idea read well where it showed; it was too faint and too widespread. Also found: the paired reading leans toward the version it picks people from, to be fixed before the next reading.
- **Words (20 Oct):** fairness says "wanted it to be fair" instead of "would not take what was not hers", which was being given for refusals.
- **Housekeeping done (19 Oct):** settled switches and failed experiments removed, the two giant files split, the town's content moved into the setting pack (H30–H34). Nothing the engine does changed.
- **H34 (19 Oct):** the engine no longer names any place of the town. Its venue, its yearly harbour day, the work that can hurt and the fleet that goes out in storms now come from the setting pack, so a 1989 harbour or a football town brings its own. Nothing the engine does changed, not even a word.
- **H33 (19 Oct):** the month's 2,300-line file is now one file per system (body, work, friendship, romance, stress, money, migration, the yearly pass), with `life.ts` only the order of a month. Nothing the engine does changed.
- **H32 (19 Oct):** the file of situations, 2,100 lines, is now one file per kind of situation plus three small ones, so a new situation, or a setting's own, is a file of its own. Nothing the engine does changed.
- **H31 (19 Oct):** the code of three experiments that were not kept is gone (a want from one's values, 25d; the work check, H26; monthly moods, 27). Each is kept at its tag. Nothing the engine does changed.
- **H30 (19 Oct):** fourteen switches that only existed to measure fixes already kept are gone, with the old code behind them. Nothing the engine does changed.
- **H29 (19 Oct):** CI no longer runs for changes to text files alone, which were about a fifth of its minutes.
- **Round 28 (19 Oct):** the engine does its own maths, so a seed makes the same world on any computer or in a port. No event changed in forty test worlds.
- **The goal written down (19 Oct):** where we are going, one priority list that only Øystein orders, and an exit criterion that measures whether the world is alive (events that travel, lives that change people, readers who want more), not only whether it is readable.
- **H28 (19 Oct):** the portability rules and the engine's front door. Nothing the engine does changed.
- **The workflow (19 Oct):** two kinds of change (changes that alter nothing merge the day CI proves it; experiments keep the full protocol), CI that checks every pull request against main, this page, and the name Understory.
- **S12 (19 Oct):** the city machinery moved onto today's engine. The town is untouched; the background needs its children fixed.
- **Round 27 (19 Oct):** month-to-month moods for every person. Not kept: it didn't make people read as more human.
