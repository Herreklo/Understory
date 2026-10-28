# Round 46 sizing: taking sides

Two passes, each on 40 throwaway worlds, 10 present years, paired by world (`on` against `OFF=sides`), means per world ±95%. Tool:
`src/tools/diag/sides.ts` (`run A B on|sides 10`, then `report`; `SIDES_OUT` names the folder).

**Stopped at its sizing, 28 Oct 2026** (Øystein). A final pass (a decider answers a pair once per rivalry) was approved with its stop rule, then withdrawn before any run once the trace showed repeated asking carries 4 of 49 side-takings in 9058: the misses come from big casts. It was never run.

**Latest verdict, after the review's fixes (next section):** fail-if 2 misses on agreeableness (1.13×), and fail-if 5 misses on both clauses: side-taking lines take five top-25 places, in two worlds, and the copy share's bound is +0.80. These are not the misses accepted on 28 Oct, so round 46 stops before pre-registration for the lead and Øystein.

**Verdict after the second pass: two fail-ifs still miss, so round 46 stops here for the lead and Øystein to decide.**

- The counter clears both times: **33.1% ±5.3** on the second pass, beside the first pass's 27.2% ±4.8. The note's estimate was ~19% and its stop is under 15%.
- Fail-ifs 3 and 4 hold.
- **Fail-if 2 misses narrowly.** "Neither" differs **1.28×** by fairness and **1.23×** by agreeableness, against a bar of 1.3×, though both now point the right way.
- **Fail-if 5 misses by the letter.** One world of 40 has one side-taking line in its 25 commonest templates: the cut, "X stopped speaking to X after X took X's side.", 16 times against the 25th template's 15. The copy share no longer rises.

## After the review: the same worlds again (9041–9080), 28 Oct 2026

The review (`reports/46-review.md`) found three engine faults, fixed before any pre-registration. Nothing else changed:

- **Told, not seen** (item 4). A side-taking is decided in private and told about town. Its parties know it, and those closest to them (partners, co-workers) hear it at reliability 0.8. The other side no longer sees it as a watcher first. Before the fix, the side taken netted +0.006 liking, so it in effect did not remember being backed. No outsider keeps a seen account of the act. (`broadcast(w, e, told)` in `world.ts`; `grammar.ts` skips its watcher step for told acts.)
- **A side gone in between** (item 5). A queued choice whose side died or left in the month between is dropped (`situations/index.ts`).
- **The cut offers making up** (item 6). After the cut, the decider who still cares may want to restore the friendship, as after any falling-out (`wantRestore`).

The off arm is the second pass's, unchanged: with `OFF=sides` none of these paths is reachable. The on arm was re-run on the same 40 seeds. A world diverges from the first changed act, so this is a fresh draw of the same worlds, not a small edit of the second pass.

| | After review | Second pass | Bar | |
| --- | --- | --- | --- | --- |
| **1. Counter** | **35.2 ±6.9** (183/568) | 33.1 ±5.3 | stop under 15 | ✓ |
| … ties; the cut at once; only through a meeting | 15.6; 14.5; 4.3 | 18.8; 15.9; 3.8 | | ✓ |
| Would-be deciders, paired | +13.0 ±5.9 | +14.1 ±6.2 | | |
| **2.** Not the side liked more | 40.1% of 424 | 31.8% | ≥ 25 | ✓ |
| "Neither", fairness | 29.3% vs 18.4%, **1.59×** | 1.28× | ≥ 1.3 | ✓ |
| "Neither", agreeableness | 23.7% vs 21.1%, **1.13×** | 1.23× | ≥ 1.3 | ✗ |
| Fairness flips: the act's / both | 4.4% / 12.5% | 4.2% / 13.1% | ≥ 5 | ✓ on both together |
| **3.** Friendships per adult | 0.00 ±0.21 | −0.21 ±0.24 | within 10% | ✓ |
| Reversals, p90 | 3.45 | 3.10 | ≤ 4 | ✓ |
| Wrongs / dislikes / ended | −0.1 / −0.8 / +3.9 | −4.2 / −0.1 / +2.9 | within | ✓ |
| Rows | **+25.2 ±18.5** | +24.7 ±21.4 | within, or named | not traced to the mechanism (review) |
| Deaths | −0.9 ±0.8 | −0.4 ±0.9 | watch | ✓ |
| **4.** The witness knows | 71.8% | 74.5% | ≥ 30 | ✓ |
| **5.** Answers | 37.8 / 37.6 / 24.6% | 35.4 / 38.1 / 26.4 | each ≥ 15 | ✓ |
| Side-taking lines in a world's top 25 | **5**, in 2 worlds (9058: 4; 9078: 1) | 1, in 1 world | any | ✗ |
| Copy share, every adult | **+0.30 ±0.60**, one-sided bound **+0.80** | −0.05 ±0.52, bound +0.39 | bound above +0.6 fails | ✗ |
| Copy share, random / busiest | +0.33 ±2.64 / −0.81 ±2.57 | +0.25 / −0.42 | | |

**Fail-if 5, world 9058.** Big casts, not repeated asking (traced 28 Oct, correcting a first guess that a long rivalry asked the same cast at every flare). Its 13 rifts drew 9, 9, 5, 5, 4, 3, 3, 3, 3, 2, 1, 1 and 1 deciders, each with a line of their own, and 15 cuts add two page lines each. Only 4 of its 49 side-takings were the same decider asked about the same pair again; 9078 and 9050 have none. Across every adult's page, the world's top 25 holds four side-taking templates:

- the cut, "X stopped speaking to X after X took X's side.", 29 times;
- "X, like X, backed X in the rivalry with X.", 23 times;
- "X backed X in the rivalry with X.", 21 times;
- "X took X's side against X.", 20 times.

The 25th template has 20. World 9078 has one, "X took X's side against X.", 17 times against 17.

**Verdict after the review's fixes.**
- The counter and fail-ifs 1, 3 and 4 hold.
- Fail-if 2 still misses, now on agreeableness alone (1.13×).
- Fail-if 5 misses on both of its clauses.

These are not the misses Øystein accepted on 28 Oct: those were 1.28× and 1.23×, with the cut in one world's top 25 and the copy share holding. The round stops before pre-registration for the lead and Øystein to decide. Pooled over both draws (80 worlds), "neither" is about 1.4× by fairness and 1.17× by agreeableness, and three worlds carry side-taking lines in their top 25.

## Second pass (9041–9080), 28 Oct 2026, round/46 at 77366c1

Three fixes, only those the first pass named:

1. **Keeping out reads the person.**
   - Fairness argues against keeping out, the more so the plainer the wrong (`facetC`, steepness 4 + 3 × wrong).
   - Gentleness and flexibility argue for it, read together as one consideration (`sides:peace`) so the five-slot cap does not cut the situation's own reasons.
2. **The choice is told.** It is still decided in private, but the event is told at `local` visibility. This uses a new optional `told` on the instance; grammar.ts reads it beside `public`.
3. **Words by kind of rift.**
   - Each of the six kinds has two wordings per answer: "Edward Holmes took Tilly's side once it came out that Sean had talked."
   - A later decider of the same rift who answers the same says so: "Ken, like Lisa, stuck by Oscar, whatever Oscar had let slip about Rose."
   - This uses a new optional `words` on the instance.

Nothing else in the mechanism changed.

| Fail-if | Second pass | First pass | Bar |  |
| --- | --- | --- | --- | --- |
| **1. Counter** (descent, 3 years) | **33.1 ±5.3** (163/496) | 27.2 ±4.8 | stop under 15 | ✓ |
| … ties alone; the cut at once | 18.8 ±4.9; 15.9 ±4.9 | 13.6; 12.0 | ties ≥ 5 | ✓ |
| … only through a meeting | 3.8 ±1.8 | 3.5 | under ⅔ of the counter | ✓ |
| … friends of both / kin / in-laws | 46.8 ±8.5 / 19.6 ±7.9 / 19.1 ±20.1 | 29.3 / 24.2 / 18.4 | | |
| … sided against / stood by / kept out | 36.8 / 44.1 / 3.9 | 29.2 / 44.6 / 6.0 | | |
| Would-be deciders who lose the tie or fall into a rift, on / off | 24.6 / **10.5**, paired +14.1 ±6.2 | 24.6 / 13.7 | | |
| **2.** Side taken not the one liked more (gap ≥ 0.1) | 31.8% of 403 | 34.6% | ≥ 25 | ✓ |
| "Neither", fairness: bottom vs top third | 32.5% vs 25.3%, **1.28×** | 28.3% vs 33.0%, 1.17× (wrong way) | ≥ 1.3 | ✗ |
| "Neither", agreeableness: top vs bottom third | 27.4% vs 22.4%, **1.23×** | 25.2% vs 29.2%, 1.16× (wrong way) | ≥ 1.3 | ✗ |
| Fairness flips: the act's (`sides:fair`) / the trait / both | 4.2% / 9.8% / **13.1%** of all 711 | 4.5% (the act's only) | ≥ 5 | ✓ on both together |
| **3.** Friendships per adult at year 10 | 4.66 against 4.87, −0.21 ±0.24 (−4%) | −2% | within 10% | ✓ |
| Reversals, 90th percentile | 3.10 against 2.98 | 3.17 | ≤ 4 | ✓ |
| Wrongs / dislikes / friendships ended, paired per 1000 adult-years | −4.2 ±14.2 / −0.1 ±3.6 / +2.9 ±5.3 | | within off's interval | ✓ |
| Rows, paired per 1000 adult-years | **+24.7 ±21.4** (425 against 401 ±21) | +6.6 ±18.9 | within, or named | named, below |
| Leaving, moves, partnerships, hires (paired per world-decade) | left −0.1, home +0.6, dating +1.3 ±1.0, married +0.9, split −0.3, divorce +0.4, hired −0.8 | | no claim | none off zero at 95% except dating, at the edge |
| **4.** The witness knows | **74.5%** | 10.3% | ≥ 30 | ✓ |
| Witness line: a side or the decider / with friend, partner or kin | 0.17 ±0.10 / 0.89 ±0.30 a year (none for 25 of 40) | 0.24 / 1.44 | reported, not a target | |
| **5.** Answers | 35.4 / 38.1 / 26.4% | 33.5 / 37.6 / 28.8 | each ≥ 15 | ✓ |
| By rift | sided against: scheme found 53%, betrayal 42%, rivalry 28% | 38 / 38 / 30 | differs | ✓ |
| Side-taking lines in a world's top 25 | **1** (the cut, world 9050) | 54 | any | ✗ |
| Copy share, every adult | −0.05 ±0.52, one-sided bound +0.39 | +0.75, bound +1.2 | bound above +0.6 fails | ✓ |
| Copy share, three at random / busiest | +0.25 ±1.97 / −0.42 ±2.12 | +3.2 / +1.0 | | |
| Pages with a side-taking line, busiest / random | 73% / 31% | 78% / 26% | | |

**Rows.** Couples' rows rose by 24.7 ±21.4 per thousand adult-years. The lower bound is just above zero, and this was not traced. The
likely path is a partner who decides in a rift between their own partner and someone else (the cast `kin` includes partners), whose
side-taking then gives a resentment inside the couple. It is named here; it was not found.

**Deaths, the watch item, cleared.**
- In the sizing worlds: −0.4 ±0.9 per world-decade.
- In the tracer (`sides-death.ts`, `DEATH_OUT=out-sides-death2`): +0.2 ±1.0, with stress (2.0% of adult-months) and drinking (5.0%) unchanged, and deaths under 65 at 16 against 14.

**Renewals and reopenings** per world-decade: renewed 4.7 against 4.4; reopened 0.00 in both arms.

**How often.**
- 17.8 ±3.0 side-takings a world-decade (first pass 23.9), with 20.7 would-be deciders in the off arm (first pass 22.5). The seeds differ.
- The counter's between-world sd is 16.7: ±5.3 on 40 worlds, ±7.0 on 24.

**Two misses, and what each would take.**
- **Fail-if 2** misses 1.3× by 0.02 and 0.07. Both traits now push "neither" the right way, but a third of rifts decide on closeness alone. Moving them past the bar means weighing the two new considerations harder. That would be a tune on a seen result, so it is not done here.
- **Fail-if 5's** line is the cut's single wording. Only one world repeats it often enough to enter the top 25. Varying it was not among the three fixes.

## First pass (9001–9040), 28 Oct 2026, round/46 at d2a316a

A re-run with each side-taking's descendants by type (`led`) reproduced every number.

**Verdict then.** The counter clears with room: **27.2% ±4.8**. Ties alone are 13.6%. Meetings carry an eighth of it. Three fail-ifs
missed: 2 ("neither" barely differs with fairness or agreeableness), 4 (the witness knows a tenth of side-takings, not 30%) and 5
(side-taking lines enter the top 25 and raise the copy share). Each had a cause in the build, named below.

### What it does, how often

| Per world-decade (on)        |                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Side-takings                 | **23.9 ±4.2**: friends of both 16.1, kin 6.6, in-laws 1.2                          |
| By rift                      | rivalry 9.0, split 4.4, falling-out 3.5, divorce 2.9, scheme found 2.4, betrayal 1.7 |
| Answers                      | sided against 33.5%, stood by 37.6%, kept out **28.8%**                            |
| Would-be deciders, off arm   | 22.5 ±4.6 (the cast reads the same both ways)                                      |

The research counted 14.9 a world-decade among friends of both. Widening the cast (kin, in-laws) adds 7.8 people who are close to both sides.
It does not change how often rifts happen.

### 1. The counter

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

### 2. The choice belongs to the person: misses

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

### 3. No camps: holds, with one named rise

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

### 4. Someone can see it: misses

- **The witness line**, per witness-year, never a target:
  - the witness is a side or the decider: **0.24 ±0.11** (none in ten years for 16 of 40 witnesses);
  - … or one of the three is the witness's friend, partner or kin: **1.44 ±0.37**.

  The research measured 0.21 and 0.69. The wider cast doubles the second.
- **The witness knows 10.3%** of side-takings (≥ 30). ✗

Cause: the decision is built with the feature `private`, so the event is private and only its parties know it. Who sided with whom is
the most public thing about a rift: it is what the town talks about. The fix is to drop `private`, so the event is told at `local`
visibility as other social acts are.

### 5. Not a script: misses

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

### Renewals and reopenings (the renewal-cause fix), per world-decade

| | on | off | paired |
| --- | --- | --- | --- |
| A weaker cause renewing a feeling | 4.9 ±0.9 | 3.9 ±0.7 | +0.9 ±1.0 |
| … of which reopening one let go | **0.00** | 0.03 ±0.05 | |
| Resentments renewed | 3.3 ±0.7 | 2.6 ±0.5 | |

A renewal of a feeling already let go happens about once in 300 world-years. The fix gives that renewal its new cause, and the
invariant (`invariants.ts`, item 6) checks it for wounds and debts. It changes almost nothing in these worlds: it is a correctness fix
for a path that is rare, not an effect.

### The reading: can 48 pairs resolve it?

Round 45's 48 pairs gave reads-no-worse at ±0.23. A true difference of zero would bound at about −0.19, which clears the −0.3 guard.
Side-taking reaches the pages:
- 78% of the busiest pages carry a side-taking line;
- 26% of random pages do.

So the busiest pack sees it, and the random pack guards the rest. The aimed pack (a rift in both arms) is not needed at this coverage.

### The front door: weighed, not changed

The note puts the player in the situation: a player who is a friend of both is asked. That would be
`command({kind: 'side', by, rift, choice})`, answering the queued choice in place of the engine.

This round does not change `src/boundary.ts`. The front door has no player-as-person yet (`invite` is the only command that acts for
someone), and a choice made outside the engine needs its reasons recorded as the player's.

What does change is what the front door returns. A side-taking event's decision record now carries `sided: {rift, cast}`, which
`events()` returns as it stands. That is a change to the shape of what Overstory reads. **It must be announced on #60 before the round
merges.**

### Also in this branch

`src/tools/coherence.ts` no longer reads a debt called in (`collection`) as an act at work. These worlds met one at the Anchor, a pub,
by someone with no job, and the floor counted it as fault 8. This is a fix to the floor, not the engine. The reviewer should confirm it
hides no real fault.

A cut now marks the falling-out as social.ts does (`cooled:<id>`). Without the mark, `npm test`'s floor caught a friend who "stopped
speaking" making friends again the same year.
