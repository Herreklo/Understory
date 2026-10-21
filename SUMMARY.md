# Understory: where we are

_Updated 21 October 2026. One page, plain words, rewritten at every merge to main._

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

This is the one priority list. Only Øystein changes its order, and a chat starts an experiment only from the top of it or when he names one. Øystein asked on 20 Oct for a plan to be made and followed; this is it, revised as rounds 35, 36 and 38 were withdrawn before their tests and rounds 37 and 39 were read.

What readers score, found on the readings already on file (round 36): **how many different kinds of thing happen in a life**, not how long its page is or how often it repeats. A kind more goes with about +0.05 on the score, across lives and within the same person; length adds nothing once kinds are counted. Round 39 showed it is a cause, not only a correlation: with four mechanisms that add kinds of happening turned on together, both the busiest lives and random adults read better, and most of the gain is the kinds added. So the plan aims at lives with more kinds of happening, each with a reason a reader accepts.

1. **The four together** (exit points 1, 2, 3 and 5): wants that answer what happens, contests out of season and for band places, a blow that changes something, and telling what one saw (the plan's former steps 1 to 3, bundled by Øystein's choice as round 39). Both readings came out better (busiest +0.38, random adults +0.33), but the round missed its own floor for added kinds by a hundredth (+0.99 against +1.0), so it is not kept and the four stay off (`ON=together`). Readers also quoted more reasons that do not fit. What comes next here is Øystein's choice (Waiting for you).
2. **Reasons a reader can follow** (exit point 3), on the page.
3. **People outside the project** (exit point 5): the human test, random and sifted lives side by side.
4. Close ties (exit point 1) and the accounts arc (#20), both paused. Their code is kept behind switches (`ON=accounts`, `ON=telling`, `ON=carry`, `ON=reckon`).
5. For the game (Overstory): the front door's part two (#22), reads of what the player could know, player commands and versions; and the start year from the setting pack (#23).
6. The city's background: partnering and children fixed, so it stops ageing.

## Waiting for you

- What follows round 39, which only you order: the four together again with the faults readers quoted in their lines fixed, sized first and tested on fresh worlds (recommended); reasons a reader can follow, across the engine, with the four off; or something else.
- Decide on the repo structure for add-ons.
- One change to the order of "Next", which only you make: the band for a year (proposed work 8) as the round after the four together, because it tests close ties, living changing people and a group's character in one setting.

## Latest merges

- **Round 39 (21 Oct), not kept:** four mechanisms built since round 30 (wants that answer what happens, contests out of season and for a place in a band, a blow that changes something, telling what one saw) turned on together. Both blind readings found the lives better: the busiest +0.38 and random adults +0.33, the first round to read better on both, and most of it is the extra kinds of happening, which makes the finding that readers reward variety a cause, not a correlation. But the round's own floor asked for at least one more kind of happening for the average adult, and it added 0.99; readers also quoted more reasons that do not fit (a want said to have lapsed in someone who went after it, a winner "still sore" about the job she won). By the rule set beforehand it is not kept, and the four stay behind `ON=together`.
- **Size first, then register (M37, 21 Oct):** a round now builds its change and runs it on throwaway worlds before it is pre-registered, so its expectations are measured, not guessed; the pre-registration still comes before any fresh test world, and the keep rule rests on the blind reading and the gates. Agreed by Øystein. Nothing the engine does changed.
- **Round 38 (21 Oct), withdrawn before its test:** wants that collide: two colleagues who learn they want the same post become rivals out of season, and a band's new member is chosen from those who wanted the place. On trial worlds the contests read with fitting reasons, but there were barely more of them (5.0 against 4.5 a world-decade): rivals out of season simply did not form again when the season came. Kept behind `ON=collide`.
- **Round 37 (21 Oct), not kept:** round 34's aftermath again (a blow changes something that lasts), now giving the reasons readers accept for a change: the blow, how hard it hit, what ties the change to it. The reasons worked (quoted as fitting 17 times, as unfit once) and blows changed lives (71% against 52%), but the lives did not read better (+0.04). A routine taken up or dropped is texture, not a turn. It stays behind `ON=aftermath`; the way a situation gives an act's reasons stays for the rounds that use it.
- **The reading reports kinds of thing (M36, 20 Oct):** the blind reading now records how many kinds of thing happen in each version of a life, and reports how much of a round's effect that accounts for. Nothing the engine does changed.
- **Round 36 (20 Oct), withdrawn before its test:** wants that answer what happens (someone close buys something, a colleague gets the job, a round birthday, a wedding, a blow). On trial worlds it worked but fell short: ten more adults in a hundred went after something (56% against 46%), people bought things four times as often, but it barely touched the busiest lives the blind reading reads. It is kept behind a switch (`ON=occasions`). Checking why, the readings already on file showed what readers actually score: how many different kinds of thing happen in a life, not how long it is. The next round brings back round 34's aftermath, which adds kinds of happening, with reasons readers accept.
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
