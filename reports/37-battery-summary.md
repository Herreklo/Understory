# Round 37: test battery

Tree 21523b0; base fbcdd76. Switches: `aftermath`. Scoreboard: base rates 1501–1520, evaluation 3337–3356, 10 years. Lives 3357–3376. 24 minutes on 2 parallel jobs.

Every job finished and left its outputs.

## Gate: the calibrated witness, on minus off, paired by world

| Slice | on − off (95%) | 90% interval | Verdict | Decisions on / off |
| --- | --- | --- | --- | --- |
| all decisions | -0.2 ±1.5 | -1.5 to 1.0 | equivalent within ±2 | 35089 / 33194 |
| not a couple's (row, row-answer, stay left out) | -0.8 ±1.8 | -2.3 to 0.7 | not shown either way | 26153 / 24387 |
| novel · contested · known (key) | -0.1 ±1.7 | -1.6 to 1.3 | equivalent within ±2 | 18267 / 16831 |

The page-annotation reader, on minus off, on decisions that are not a couple's: -0.8 ±1.8 (not shown either way).

## Within each arm (mean over worlds, 95%)

| Arm | Slice | Calibrated | − notebook | − tendency learner | Lift as a share of base rate → mind-reader |
| --- | --- | --- | --- | --- | --- |
| on | all decisions | 62.2 ±1.0 | 3.3 ±0.9 | 3.9 ±1.1 | 26% |
| on | novel · contested · known (key) | 60.5 ±1.1 | 5.5 ±1.0 | 5.2 ±1.4 | 26% |
| off | all decisions | 62.4 ±1.2 | 2.9 ±0.8 | 4.7 ±0.7 | 27% |
| off | novel · contested · known (key) | 60.6 ±1.3 | 5.3 ±1.2 | 6.0 ±1.2 | 25% |

## Lives: story (on / off)

```
20 worlds · adults (25+) present through ten years · on / aftermath
  dead lives (fewer than 5 weighty events in 10 years)            0.03 ±0.01        0.03 ±0.01
  weighty events per life, median                                  18.4 ±0.9         17.0 ±1.0
  callbacks: share of weighty events tied to own past             0.29 ±0.01        0.27 ±0.01
  repeats: share of weighty events of a type already had          0.25 ±0.01        0.24 ±0.01
  distinct kinds of weighty event per life                         14.5 ±0.5         13.7 ±0.4
  adults with a named rival                                       0.19 ±0.04        0.20 ±0.03
  arcs per adult (obstacle and outcome in the window)             0.41 ±0.10        0.46 ±0.07
  adults with at least one arc                                    0.21 ±0.03        0.24 ±0.03
  from round 19d: a life is what the person did and what was done to them; an arc needs the pursuit's own obstacle
    dead lives (did or done to)                                   0.01 ±0.00        0.01 ±0.00
    repeats (did or done to)                                      0.34 ±0.01        0.34 ±0.01
    arcs per adult (own obstacle)                                 0.25 ±0.07        0.31 ±0.06
    adults with at least one arc (own obstacle)                   0.17 ±0.03        0.20 ±0.03
  kinds of weighty event in the town                                  148 ±4            143 ±3
  acts giving a sore spot or fear as a reason, per world           12.6 ±3.0         12.9 ±3.2
  acts giving a rule to live by as a reason, per world             20.8 ±5.5         28.6 ±7.9
  moments of humour, per world                                     30.1 ±3.4         28.1 ±2.9
  on: 141 kinds of decision, entropy 4.68 bits; top: row 15% · row-answer 10% · obligation 8% · support 6% · collection 6% · provocation 5%
  aftermath: 142 kinds of decision, entropy 4.61 bits; top: row 16% · row-answer 11% · obligation 8% · support 7% · collection 6% · provocation 5%
```

## Lives: friends

```
20 worlds · adults at the end of ten present years · on / nobudget (OFF=budget)
  on: close friends in town per adult: median 4, top tenth 11, most 26, none 14%
      made per adult a year 0.32 ±0.02 · ended per adult a year 0.28 ±0.03 · of year-0 friendships with both in town at 10, ended 18% of 2221
      friendship lines 2105; reasons: has energy for everything 26% · they work together at … 24% · does not like to judge 22% · they want the same things from life 18% · they run in the same crowd 12% · they kept seeking each other out 11%
      familiar pairs where one dislikes the other: 6.0%
      aged 18–29 with no friend in town: 23% of 145
      share of contact to the top five (last year, adults to 70): median 56%
      strain, least-contacted tenth 0.08 ±0.03 · births ÷ deaths 1.72 ±0.98 · population 81.6 ±3.9
  aftermath: close friends in town per adult: median 3, top tenth 10, most 24, none 13%
      made per adult a year 0.29 ±0.02 · ended per adult a year 0.26 ±0.03 · of year-0 friendships with both in town at 10, ended 16% of 2034
      friendship lines 1843; reasons: has energy for everything 27% · they work together at … 26% · does not like to judge 21% · they want the same things from life 19% · they run in the same crowd 14% · they kept seeking each other out 10%
      familiar pairs where one dislikes the other: 5.4%
      aged 18–29 with no friend in town: 22% of 152
      share of contact to the top five (last year, adults to 70): median 56%
      strain, least-contacted tenth 0.09 ±0.04 · births ÷ deaths 1.04 ±0.21 · population 80.7 ±4.0
  paired, on − off: strain of the least-contacted tenth -0.01 ±0.05
```

## Lives: consequences (on)

```
20 worlds · weighty events in the first seven present years, followed for three years · 17568 sources
  with any weighty descendant   0.23 ±0.01
  with a turn                   0.09 ±0.01
  chain depth (weighty): median 0, 90th 1, max 7 · reaching someone outside the source: 0.05 ±0.00
```

## Lives: consequences (off)

```
OFF=aftermath · 20 worlds · weighty events in the first seven present years, followed for three years · 16887 sources
  with any weighty descendant   0.23 ±0.01
  with a turn                   0.10 ±0.01
  chain depth (weighty): median 0, 90th 1, max 6 · reaching someone outside the source: 0.05 ±0.00
```

## Cold read

not run. Give the pack to a reader before anyone reads the numbers above.
