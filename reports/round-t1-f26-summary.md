# Round F26: test battery

Tree 0bd9a6b; base c256fd0. Switches: `countfair`, `eventfix`, `identfix`, `honestev`. Scoreboard: base rates 1501–1520, evaluation 1721–1740, 10 years. Lives 3001–3020. 47 minutes on 4 parallel jobs.

Every job finished and left its outputs.

## Gate: the calibrated witness, on minus off, paired by world

| Slice | on − off (95%) | 90% interval | Verdict | Decisions on / off |
| --- | --- | --- | --- | --- |
| all decisions | -0.9 ±1.2 | -1.9 to 0.2 | equivalent within ±2 | 34108 / 34199 |
| not a couple's (row, row-answer, stay left out) | -1.4 ±1.4 | -2.6 to -0.2 | not shown either way | 25241 / 25104 |
| novel · contested · known (key) | 5.3 ±2.3 | 3.4 to 7.2 | not shown either way | 17979 / 11001 **(not like for like: sizes differ by more than a tenth)** |

The page-annotation reader, on minus off, on decisions that are not a couple's: -2.8 ±1.4 (REGRESSION).

## Within each arm (mean over worlds, 95%)

| Arm | Slice | Calibrated | − notebook | − tendency learner | Lift as a share of base rate → mind-reader |
| --- | --- | --- | --- | --- | --- |
| on | all decisions | 63.3 ±1.0 | 3.1 ±0.7 | 4.5 ±0.9 | 29% |
| on | novel · contested · known (key) | 62.4 ±1.4 | 5.5 ±1.2 | 5.5 ±1.3 | 26% |
| off | all decisions | 64.2 ±1.2 | 2.3 ±0.9 | 3.4 ±0.9 | 22% |
| off | novel · contested · known (key) | 57.1 ±2.0 | 6.3 ±1.5 | 5.8 ±1.5 | 29% |

## Leave one out: on minus (all on except this one), the calibrated witness

| Switch off alone | All decisions | Not a couple's | Page-annotation, not a couple's |
| --- | --- | --- | --- |
| `countfair` | -0.8 ±1.3 | -1.3 ±1.1 | -2.8 ±1.2 |
| `eventfix` | 0.0 ±0.0 | 0.0 ±0.0 | 0.0 ±0.0 |
| `identfix` | 0.0 ±0.2 | 0.2 ±0.2 | -0.1 ±0.2 |
| `honestev` | 0.6 ±1.1 | 0.5 ±1.4 | -0.4 ±1.3 |

## Lives: story (on / off)

```
20 worlds · adults (25+) present through ten years · on / countfair+eventfix+identfix+honestev
  dead lives (fewer than 5 weighty events in 10 years)            0.04 ±0.01        0.05 ±0.01
  weighty events per life, median                                  17.4 ±0.6         16.0 ±0.8
  callbacks: share of weighty events tied to own past             0.28 ±0.01        0.26 ±0.01
  repeats: share of weighty events of a type already had          0.24 ±0.01        0.25 ±0.01
  distinct kinds of weighty event per life                         13.5 ±0.3         12.7 ±0.4
  adults with a named rival                                       0.22 ±0.03        0.16 ±0.02
  arcs per adult (obstacle and outcome in the window)             0.46 ±0.07        0.31 ±0.06
  adults with at least one arc                                    0.23 ±0.03        0.17 ±0.02
  from round 19d: a life is what the person did and what was done to them; an arc needs the pursuit's own obstacle
    dead lives (did or done to)                                   0.01 ±0.01        0.01 ±0.01
    repeats (did or done to)                                      0.33 ±0.01        0.34 ±0.01
    arcs per adult (own obstacle)                                 0.32 ±0.05        0.24 ±0.04
    adults with at least one arc (own obstacle)                   0.20 ±0.03        0.15 ±0.02
  kinds of weighty event in the town                                  145 ±2            143 ±2
  acts giving a sore spot or fear as a reason, per world           11.8 ±2.4          9.8 ±2.7
  acts giving a rule to live by as a reason, per world             24.1 ±5.3         19.9 ±5.2
  moments of humour, per world                                     29.6 ±2.8         29.7 ±2.7
  on: 141 kinds of decision, entropy 4.62 bits; top: row 17% · row-answer 10% · obligation 8% · support 7% · collection 6% · provocation 5%
  countfair+eventfix+identfix+honestev: 126 kinds of decision, entropy 4.58 bits; top: row 16% · row-answer 10% · obligation 8% · support 7% · collection 7% · request 4%
```

## Lives: friends

```
0 worlds · adults at the end of ten present years · on / nobudget (OFF=budget)
  on: close friends in town per adult: median undefined, top tenth undefined, most -Infinity, none NaN%
      made per adult a year 0.00 ±NaN · ended per adult a year 0.00 ±NaN · of year-0 friendships with both in town at 10, ended 0% of 0
      friendship lines 0; reasons: 
      familiar pairs where one dislikes the other: NaN%
      strain, least-contacted tenth 0.00 ±NaN · births ÷ deaths 0.00 ±NaN · population 0.0 ±NaN
  nobudget: close friends in town per adult: median undefined, top tenth undefined, most -Infinity, none NaN%
      made per adult a year 0.00 ±NaN · ended per adult a year 0.00 ±NaN · of year-0 friendships with both in town at 10, ended 0% of 0
      friendship lines 0; reasons: 
      familiar pairs where one dislikes the other: NaN%
      strain, least-contacted tenth 0.00 ±NaN · births ÷ deaths 0.00 ±NaN · population 0.0 ±NaN
  paired, on − off: strain of the least-contacted tenth 0.00 ±NaN
```

## Lives: consequences (on)

```
20 worlds · weighty events in the first seven present years, followed for three years · 16791 sources
  with any weighty descendant   0.23 ±0.01
  with a turn                   0.10 ±0.01
  chain depth (weighty): median 0, 90th 1, max 6 · reaching someone outside the source: 0.06 ±0.00
```

## Lives: consequences (off)

```
OFF=countfair+eventfix+identfix+honestev · 20 worlds · weighty events in the first seven present years, followed for three years · 16322 sources
  with any weighty descendant   0.23 ±0.01
  with a turn                   0.09 ±0.01
  chain depth (weighty): median 0, 90th 1, max 9 · reaching someone outside the source: 0.06 ±0.00
```

## Faults (on)

```
F26 faults, worlds 3021–3024, 10 present years, OFF=
  removals of unkept acts where the last entry was another event: 71 of 6344 (1.12%)
  removals that found nothing to take (fix on): 0
  thread events missing from their own people's lists: 0
  unkept acts still on someone's list: 0
  self-story readings where the old and new rules disagree: 6 of 14845 (0.04%)
  decisions whose likeliest answer differs between the old and the new scoring rule: 404 of 6875 (5.88%)
```

## Faults (off)

```
F26 faults, worlds 3021–3024, 10 present years, OFF=countfair,eventfix,identfix,honestev
  removals of unkept acts where the last entry was another event: 52 of 6471 (0.80%)
  removals that found nothing to take (fix on): 0
  thread events missing from their own people's lists: 207
  unkept acts still on someone's list: 52
  self-story readings where the old and new rules disagree: 3 of 14387 (0.02%)
  decisions whose likeliest answer differs between the old and the new scoring rule: 0 of 0 (0.00%)
```

## Identity with the switches off, against the base

```
budget/11: DIFFERENT in events, people, bonds, beliefs, rest, n (events 8458 → 8555)
1 differ
```

## npm test

Passes.

## Cold read

12 lives in `<out>/cold/lives.txt` (key in `cold-key.json`, outside the folder a reader is given). Give the pack to a reader before anyone reads the numbers above.
