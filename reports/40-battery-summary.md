# Round 40: test battery

Tree 9a03b53; base ac6c811. Switches: `together`. Scoreboard: base rates 1501–1520, evaluation 3489–3508, 10 years. Lives 3509–3528. 24 minutes on 2 parallel jobs.

Every job finished and left its outputs.

## Gate: the calibrated witness, on minus off, paired by world

| Slice | on − off (95%) | 90% interval | Verdict | Decisions on / off |
| --- | --- | --- | --- | --- |
| all decisions | 0.2 ±1.5 | -1.1 to 1.4 | equivalent within ±2 | 33726 / 34103 |
| not a couple's (row, row-answer, stay left out) | -0.4 ±1.6 | -1.7 to 0.9 | equivalent within ±2 | 25620 / 25183 |
| novel · contested · known (key) | -0.7 ±1.3 | -1.8 to 0.4 | equivalent within ±2 | 17256 / 16882 |

The page-annotation reader, on minus off, on decisions that are not a couple's: 0.3 ±1.4 (equivalent within ±2).

## Within each arm (mean over worlds, 95%)

| Arm | Slice | Calibrated | − notebook | − tendency learner | Lift as a share of base rate → mind-reader |
| --- | --- | --- | --- | --- | --- |
| on | all decisions | 61.4 ±1.1 | 2.5 ±0.8 | 3.4 ±0.7 | 22% |
| on | novel · contested · known (key) | 59.0 ±1.3 | 3.8 ±1.1 | 4.3 ±0.8 | 20% |
| off | all decisions | 61.3 ±1.5 | 2.4 ±0.9 | 3.1 ±0.8 | 23% |
| off | novel · contested · known (key) | 59.7 ±1.4 | 4.4 ±1.3 | 4.4 ±1.2 | 21% |

## Lives: story (on / off)

```
20 worlds · adults (25+) present through ten years · on / together
  dead lives (fewer than 5 weighty events in 10 years)            0.03 ±0.01        0.04 ±0.01
  weighty events per life, median                                  18.0 ±0.8         16.3 ±0.6
  callbacks: share of weighty events tied to own past             0.30 ±0.01        0.27 ±0.01
  repeats: share of weighty events of a type already had          0.24 ±0.01        0.24 ±0.01
  distinct kinds of weighty event per life                         14.6 ±0.6         13.2 ±0.4
  adults with a named rival                                       0.26 ±0.03        0.21 ±0.03
  arcs per adult (obstacle and outcome in the window)             0.53 ±0.08        0.45 ±0.09
  adults with at least one arc                                    0.27 ±0.03        0.24 ±0.03
  from round 19d: a life is what the person did and what was done to them; an arc needs the pursuit's own obstacle
    dead lives (did or done to)                                   0.01 ±0.01        0.01 ±0.01
    repeats (did or done to)                                      0.34 ±0.01        0.34 ±0.01
    arcs per adult (own obstacle)                                 0.37 ±0.06        0.29 ±0.06
    adults with at least one arc (own obstacle)                   0.24 ±0.03        0.19 ±0.03
  kinds of weighty event in the town                                  149 ±4            143 ±4
  acts giving a sore spot or fear as a reason, per world            8.9 ±2.5         12.2 ±2.5
  acts giving a rule to live by as a reason, per world             23.6 ±5.9         24.9 ±6.4
  moments of humour, per world                                     30.3 ±3.1         29.8 ±3.4
  on: 143 kinds of decision, entropy 4.68 bits; top: row 16% · row-answer 10% · obligation 8% · support 7% · collection 6% · aftermath 5%
  together: 152 kinds of decision, entropy 4.61 bits; top: row 17% · row-answer 10% · obligation 8% · support 6% · collection 6% · provocation 5%
```

## Lives: friends

```
20 worlds · adults at the end of ten present years · on / nobudget (OFF=budget)
  on: close friends in town per adult: median 4, top tenth 11, most 24, none 15%
      made per adult a year 0.32 ±0.03 · ended per adult a year 0.29 ±0.04 · of year-0 friendships with both in town at 10, ended 19% of 2239
      friendship lines 2124; reasons: they work together at … 27% · has energy for everything 26% · does not like to judge 21% · they want the same things from life 17% · they run in the same crowd 15% · they worked together for years 11%
      familiar pairs where one dislikes the other: 6.2%
      aged 18–29 with no friend in town: 16% of 128
      share of contact to the top five (last year, adults to 70): median 57%
      strain, least-contacted tenth 0.06 ±0.03 · births ÷ deaths 1.61 ±0.86 · population 82.0 ±4.3
  together: close friends in town per adult: median 3, top tenth 9, most 22, none 15%
      made per adult a year 0.28 ±0.03 · ended per adult a year 0.24 ±0.03 · of year-0 friendships with both in town at 10, ended 20% of 1985
      friendship lines 1923; reasons: they work together at … 29% · has energy for everything 27% · does not like to judge 22% · they want the same things from life 20% · they run in the same crowd 13% · they kept seeking each other out 8%
      familiar pairs where one dislikes the other: 6.6%
      aged 18–29 with no friend in town: 23% of 150
      share of contact to the top five (last year, adults to 70): median 57%
      strain, least-contacted tenth 0.06 ±0.03 · births ÷ deaths 1.62 ±0.57 · population 85.2 ±3.7
  paired, on − off: strain of the least-contacted tenth 0.00 ±0.03
```

## Lives: consequences (on)

```
20 worlds · weighty events in the first seven present years, followed for three years · 18068 sources
  with any weighty descendant   0.25 ±0.01
  with a turn                   0.10 ±0.01
  chain depth (weighty): median 0, 90th 1, max 9 · reaching someone outside the source: 0.06 ±0.01
```

## Lives: consequences (off)

```
OFF=together · 20 worlds · weighty events in the first seven present years, followed for three years · 16986 sources
  with any weighty descendant   0.23 ±0.01
  with a turn                   0.10 ±0.01
  chain depth (weighty): median 0, 90th 1, max 6 · reaching someone outside the source: 0.06 ±0.00
```

## Cold read

not run. Give the pack to a reader before anyone reads the numbers above.
