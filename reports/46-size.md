# Round 46 sizing: taking sides

Sized 28 Oct 2026 on round/46 at d2a316a, 40 throwaway worlds (9001–9040), 10 present years, paired by world: `on` against `OFF=sides`.
Tool `src/tools/diag/sides.ts`: `./run.sh src/tools/diag/sides.ts run 9001 9040 on 10`, the same with `sides`, then `report`. A
re-run with each side-taking's descendants by type (`led`) reproduced every number. Means per world, ±95%.

**Verdict.** The counter clears with room: **27.2% ±4.8** against the note's ~19% and its stop under 15%. Ties alone are 13.6%. Meetings
carry an eighth of it, not two thirds. **Three fail-ifs miss:**

- **2:** "neither" barely differs with fairness or agreeableness.
- **4:** the witness knows a tenth of side-takings, not 30%.
- **5:** side-taking lines enter the top 25 and raise the copy share.

Each miss has a cause in the build that the design names, below. As built, **the round is not ready to pre-register.** Fixing them is
a design change, re-sized on fresh throwaway seeds (9041–9080), not a tune on these.

## What it does, how often

| Per world-decade (on)        |                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Side-takings                 | **23.9 ±4.2**: friends of both 16.1, kin 6.6, in-laws 1.2                          |
| By rift                      | rivalry 9.0, split 4.4, falling-out 3.5, divorce 2.9, scheme found 2.4, betrayal 1.7 |
| Answers                      | sided against 33.5%, stood by 37.6%, kept out **28.8%**                            |
| Would-be deciders, off arm   | 22.5 ±4.6 (the cast reads the same both ways)                                      |

The research counted 14.9 a world-decade among friends of both. Widening the cast (kin, in-laws) adds 7.8 people who are close to both sides.
It does not change how often rifts happen.

## 1. The counter

| Of side-takings in the first 7 years, followed 3 (699 pooled)        |                                              |
| -------------------------------------------------------------------- | -------------------------------------------- |
| **Leads somewhere** (a tie, or a weighty event among its descendants) | **27.2 ±4.8** (180/699); stop under 15, estimate 19 |
| … friends of both / kin / in-laws                                     | 29.3 ±7.2 / 24.2 ±8.9 / 18.4 ±14.6           |
| … sided against / stood by / kept out                                 | 29.2 ±8.4 / 44.6 ±9.6 / 6.0 ±4.0             |
| A tie among its descendants                                           | 13.6 ±3.6; the decider's friendship cut at once 12.0 ±3.2 |
| A weighty event cites it directly                                     | 26.5 ±4.8                                    |
| A meeting among its descendants / leads somewhere only through one    | 9.3 ±3.1 / 3.5 ±2.7                          |
| Would-be deciders who lose a friendship with a side, or fall into a rift with one, in 3 years | on 24.6 ±4.9, off **13.7 ±3.6**, paired +10.4 ±6.2 |
| … the friendship ended                                                | on 22.3, off 10.0, paired +11.8 ±6.5         |

What it leads to, by type, over the 180:

- the cut (`cooled`) 86;
- the meeting's answers: letting go 39, raking it up 34;
- the aftermath of a lost friend: took something up 25, kept away 11, started over 8;
- confiding, visiting, keeping a secret, about 10 each.

None reaches the counter only through another side-taking.

The research's would-be deciders co-occurred at 20.7%. The off arm here, on the same events with the wider cast, is 13.7%. Every cast
except friends of both is less tied to either side.

**Power.** The between-world sd is 15.0, which gives ±4.8 on 40 worlds and ±6.3 on 24. Forty fresh worlds tell 27% from 15% (a gap of
12 points against ±4.8). They would tell 19% from 15% only narrowly, as the note said.

## 2. The choice belongs to the person: misses

- The side taken is not the one liked more in **34.6%** of the 468 choices with a gap of 0.1 or more (≥ 25). ✓
- "Neither", bottom third against top third: fairness **28.3% / 33.0%, 1.17×**; agreeableness **29.2% / 25.2%, 1.16×** (≥ 1.3). ✗
- The fairness consideration flips **9.3%** of the 463 choices that weigh it. That is **4.5% of all** 954 (≥ 5). ✗ by a hair.
- Given on fairness (principled): 18.6%.

Cause: "neither" is the discretion family, read through
- how torn they are, and
- social boldness,
- with the family's own trait wiring (FAMILY_FACETS).

Nothing in it reads fairness or the four agreeableness facets as the research meant: the fair take a side, and the agreeable keep the
peace. Fairness enters only when the rift was a wrong (wrong > 0) and the decider knows of it, which is about half of rifts.

The fix is a consideration on keeping out:
- fairness against it, scaled by how plain the wrong was;
- gentleness and flexibility for it.

## 3. No camps: holds, with one named rise

| Per world (paired)                                  | on            | off           | paired          |
| --------------------------------------------------- | ------------- | ------------- | --------------- |
| Friendships per adult at year 10                    | 4.98 ±0.30    | 5.08 ±0.32    | −0.09 ±0.29 (−2%; within 10%) ✓ |
| Reversals, 90th percentile                          | 3.17          | 2.88          | +0.30 ±0.29 (≤ 4) ✓ |
| Wrongs / rows / dislikes per 1000 adult-years       | 190.5 / 437.3 / 26.9 | 188.4 / 430.8 / 25.2 | +2.1 ±14.1 / +6.6 ±18.9 / +1.7 ±4.1 ✓ |
| Friendships ended per 1000 adult-years              | 68.7 ±4.7     | 60.7 ±4.3     | **+8.0 ±4.6**: the cuts, the mechanism itself |

**Paths it has no claim on** (per world-decade, paired):

| Path                       | Paired       |
| -------------------------- | ------------ |
| left                       | −0.9 ±1.0    |
| moved home                 | −0.6 ±0.8    |
| arrived                    | +0.2         |
| dating                     | +0.9 ±1.1    |
| married                    | +0.3         |
| split                      | +0.5 ±0.7    |
| divorce                    | +0.2         |
| hired                      | −1.5 ±1.8    |
| dismissed                  | −0.2         |
| born                       | +0.3         |
| **died**                   | **+1.4 ±0.7** |

None of these is off zero at 99% except deaths. On 40 more runs of the same seeds without a witness picked (`sides-death.ts`; different
worlds), deaths came out **+0.9 ±0.9**, and neither stress over 0.7 (1.4% against 1.6% of adult-months) nor drinking (4.8% against 4.7%)
moved. Deaths under 65 were 27 against 18 across all 40 worlds.

No path was found. It is a watch item for the battery, not a claim.

## 4. Someone can see it: misses

- **The witness line**, per witness-year, never a target:
  - the witness is a side or the decider: **0.24 ±0.11** (none in ten years for 16 of 40 witnesses);
  - … or one of the three is the witness's friend, partner or kin: **1.44 ±0.37**.

  The research measured 0.21 and 0.69. The wider cast doubles the second.
- **The witness knows 10.3%** of side-takings (≥ 30). ✗

Cause: the decision is built with the feature `private`, so the event is private and only its parties know it. Who sided with whom is
the most public thing about a rift: it is what the town talks about. The fix is to drop `private`, so the event is told at `local`
visibility as other social acts are.

## 5. Not a script: misses

| Check | Result | Bar | |
| --- | --- | --- | --- |
| Each answer's share | 33.5 / 37.6 / 28.8% | ≥ 15 | ✓ |
| By rift: betrayal against rivalry | sided against 38% vs 30%; kept out 22% vs 31% | — | differs, weakly |
| Side-taking lines among a world's 25 commonest templates (every adult) | **54** across 40 worlds | any | ✗ |
| Copy share, every adult | +0.75 ±0.55, one-sided bound about **+1.2** | above +0.6 fails | ✗ |
| Copy share, three at random | +3.2 ±2.1 | — | |
| Copy share, three busiest | +1.0 ±1.8 | — | |
| Pages with a side-taking line | busiest 78%, random 26% | — | |

Cause: three answers in two wordings each, the same for every rift. One rift gives two or three deciders the same line in the same
month.

The fix is wording by rift kind. "took Ann's side over the money she said Ben owed" is a betrayal's line, not a rivalry's. A rift's
several deciders also read as one line ("Kate and Ralph both took Peter's side").

## Renewals and reopenings (the renewal-cause fix), per world-decade

| | on | off | paired |
| --- | --- | --- | --- |
| A weaker cause renewing a feeling | 4.9 ±0.9 | 3.9 ±0.7 | +0.9 ±1.0 |
| … of which reopening one let go | **0.00** | 0.03 ±0.05 | |
| Resentments renewed | 3.3 ±0.7 | 2.6 ±0.5 | |

A renewal of a feeling already let go happens about once in 300 world-years. The fix gives that renewal its new cause, and the
invariant (`invariants.ts`, item 6) checks it for wounds and debts. It changes almost nothing in these worlds: it is a correctness fix
for a path that is rare, not an effect.

## The reading: can 48 pairs resolve it?

Round 45's 48 pairs gave reads-no-worse at ±0.23. A true difference of zero would bound at about −0.19, which clears the −0.3 guard.
Side-taking reaches the pages:
- 78% of the busiest pages carry a side-taking line;
- 26% of random pages do.

So the busiest pack sees it, and the random pack guards the rest. The aimed pack (a rift in both arms) is not needed at this coverage.

## The front door: weighed, not changed

The note puts the player in the situation: a player who is a friend of both is asked. That would be
`command({kind: 'side', by, rift, choice})`, answering the queued choice in place of the engine.

This round does not change `src/boundary.ts`. The front door has no player-as-person yet (`invite` is the only command that acts for
someone), and a choice made outside the engine needs its reasons recorded as the player's.

What does change is what the front door returns. A side-taking event's decision record now carries `sided: {rift, cast}`, which
`events()` returns as it stands. That is a change to the shape of what Overstory reads. **It must be announced on #60 before the round
merges.**

## Also in this branch

`src/tools/coherence.ts` no longer reads a debt called in (`collection`) as an act at work. These worlds met one at the Anchor, a pub,
by someone with no job, and the floor counted it as fault 8. This is a fix to the floor, not the engine. The reviewer should confirm it
hides no real fault.

A cut now marks the falling-out as social.ts does (`cooled:<id>`). Without the mark, `npm test`'s floor caught a friend who "stopped
speaking" making friends again the same year.
