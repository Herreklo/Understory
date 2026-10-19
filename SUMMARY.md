# Understory: where we are

*Updated 19 October 2026. One page, plain words, rewritten at every merge to main.*

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

This is the one priority list. Only Øystein changes its order, and a chat starts an experiment only from the top of it or when he names one.

1. Housekeeping: settled switches removed, the two giant files split, the town's content moved out of the engine. Each step proven to change nothing.
2. Proposed: the accounts arc (#20). People remember their version of what happened, pass it on, and learn from it.
3. For the game (Overstory): the front door's part two (#22), reads of what the player could know, player commands and versions; and the start year from the setting pack (#23), so a world can begin in another era.
4. The city's background: partnering and children fixed, so it stops ageing.
5. Later: a human test built on stories rather than predictions (exit point 5).

In progress, not yet placed in this order: H29 (CI spends fewer minutes) and round 28 (the engine's own arithmetic, portability rule 3), opened by another chat.

## Waiting for you

- Place round 28 (the engine's own arithmetic) in the order, or pause it: before the accounts arc, after it, or later.
- Decide on the repo structure for add-ons.

## Latest merges

- **Round 28 (19 Oct):** the engine does its own maths, so a seed makes the same world on any computer or in a port. No event changed in forty test worlds.
- **The goal written down (19 Oct):** where we are going, one priority list that only Øystein orders, and an exit criterion that measures whether the world is alive (events that travel, lives that change people, readers who want more), not only whether it is readable.
- **H28 (19 Oct):** the portability rules and the engine's front door. Nothing the engine does changed.
- **The workflow (19 Oct):** two kinds of change (changes that alter nothing merge the day CI proves it; experiments keep the full protocol), CI that checks every pull request against main, this page, and the name Understory.
- **S12 (19 Oct):** the city machinery moved onto today's engine. The town is untouched; the background needs its children fixed.
- **Round 27 (19 Oct):** month-to-month moods for every person. Not kept: it didn't make people read as more human.
