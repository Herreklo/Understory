# Round 39: test battery

Tree 9cfe4e8; base 53af84f. Switches: `together`. Scoreboard: base rates 1501–1520, evaluation 3433–3452, 10 years. Lives 3453–3472. 24 minutes on 2 parallel jobs.

Every job finished and left its outputs.

## Gate: the calibrated witness, on minus off, paired by world

| Slice | on − off (95%) | 90% interval | Verdict | Decisions on / off |
| --- | --- | --- | --- | --- |
| all decisions | -1.3 ±1.1 | -2.2 to -0.4 | REGRESSION | 34955 / 33286 |
| not a couple's (row, row-answer, stay left out) | -0.9 ±1.2 | -1.9 to 0.0 | equivalent within ±2 | 26532 / 24550 |
| novel · contested · known (key) | -1.7 ±1.7 | -3.2 to -0.3 | REGRESSION | 18240 / 16657 |

The page-annotation reader, on minus off, on decisions that are not a couple's: -0.3 ±1.2 (equivalent within ±2).

## Within each arm (mean over worlds, 95%)

| Arm | Slice | Calibrated | − notebook | − tendency learner | Lift as a share of base rate → mind-reader |
| --- | --- | --- | --- | --- | --- |
| on | all decisions | 60.7 ±0.9 | 3.3 ±0.5 | 3.6 ±0.7 | 23% |
| on | novel · contested · known (key) | 58.0 ±1.3 | 4.9 ±1.2 | 4.7 ±1.3 | 22% |
| off | all decisions | 61.9 ±0.7 | 2.8 ±0.7 | 4.2 ±0.8 | 27% |
| off | novel · contested · known (key) | 59.8 ±1.3 | 5.3 ±1.2 | 6.0 ±1.0 | 25% |

## Lives: story (on / off)

```
20 worlds · adults (25+) present through ten years · on / together
  dead lives (fewer than 5 weighty events in 10 years)            0.03 ±0.01        0.04 ±0.01
  weighty events per life, median                                  18.6 ±0.8         17.1 ±0.9
  callbacks: share of weighty events tied to own past             0.30 ±0.01        0.28 ±0.01
  repeats: share of weighty events of a type already had          0.25 ±0.01        0.24 ±0.01
  distinct kinds of weighty event per life                         14.4 ±0.4         13.7 ±0.4
  adults with a named rival                                       0.26 ±0.04        0.21 ±0.03
  arcs per adult (obstacle and outcome in the window)             0.52 ±0.11        0.42 ±0.07
  adults with at least one arc                                    0.26 ±0.04        0.22 ±0.03
  from round 19d: a life is what the person did and what was done to them; an arc needs the pursuit's own obstacle
    dead lives (did or done to)                                   0.01 ±0.01        0.01 ±0.01
    repeats (did or done to)                                      0.34 ±0.01        0.33 ±0.01
    arcs per adult (own obstacle)                                 0.36 ±0.08        0.26 ±0.05
    adults with at least one arc (own obstacle)                   0.22 ±0.04        0.17 ±0.03
  kinds of weighty event in the town                                  148 ±4            147 ±3
  acts giving a sore spot or fear as a reason, per world            9.3 ±2.8         14.0 ±3.6
  acts giving a rule to live by as a reason, per world             23.4 ±6.9         28.1 ±6.4
  moments of humour, per world                                     26.6 ±1.8         28.0 ±2.1
  on: 157 kinds of decision, entropy 4.69 bits; top: row 15% · row-answer 9% · obligation 8% · support 7% · collection 6% · provocation 5%
  together: 153 kinds of decision, entropy 4.63 bits; top: row 16% · row-answer 10% · obligation 8% · support 7% · collection 6% · provocation 5%
```

## Lives: friends

```
20 worlds · adults at the end of ten present years · on / nobudget (OFF=budget)
  on: close friends in town per adult: median 4, top tenth 11, most 24, none 14%
      made per adult a year 0.32 ±0.02 · ended per adult a year 0.29 ±0.04 · of year-0 friendships with both in town at 10, ended 17% of 2283
      friendship lines 2072; reasons: has energy for everything 29% · they work together at … 25% · does not like to judge 21% · they want the same things from life 19% · they run in the same crowd 12% · they kept seeking each other out 12%
      familiar pairs where one dislikes the other: 5.9%
      aged 18–29 with no friend in town: 14% of 138
      share of contact to the top five (last year, adults to 70): median 56%
      strain, least-contacted tenth 0.13 ±0.05 · births ÷ deaths 1.06 ±0.23 · population 80.0 ±2.5
  together: close friends in town per adult: median 3, top tenth 10, most 26, none 15%
      made per adult a year 0.27 ±0.03 · ended per adult a year 0.27 ±0.04 · of year-0 friendships with both in town at 10, ended 18% of 2061
      friendship lines 1789; reasons: has energy for everything 27% · they work together at … 26% · does not like to judge 21% · they want the same things from life 18% · they run in the same crowd 14% · they worked together for years 9%
      familiar pairs where one dislikes the other: 6.6%
      aged 18–29 with no friend in town: 21% of 147
      share of contact to the top five (last year, adults to 70): median 57%
      strain, least-contacted tenth 0.10 ±0.04 · births ÷ deaths 1.08 ±0.24 · population 82.6 ±2.6
  paired, on − off: strain of the least-contacted tenth 0.03 ±0.06
```

## Lives: consequences (on)

```
20 worlds · weighty events in the first seven present years, followed for three years · 17478 sources
  with any weighty descendant   0.25 ±0.01
  with a turn                   0.09 ±0.01
  chain depth (weighty): median 0, 90th 1, max 9 · reaching someone outside the source: 0.06 ±0.00
```

## Lives: consequences (off)

```
OFF=together · 20 worlds · weighty events in the first seven present years, followed for three years · 16810 sources
  with any weighty descendant   0.23 ±0.01
  with a turn                   0.09 ±0.01
  chain depth (weighty): median 0, 90th 1, max 7 · reaching someone outside the source: 0.05 ±0.00
```

## Cold read

not run. Give the pack to a reader before anyone reads the numbers above.
