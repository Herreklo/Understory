# Round 41: test battery

Tree eba5885; base 968d2df. Switches: `fit`. Scoreboard: base rates 1501–1520, evaluation 3545–3564, 10 years. Lives 3565–3584. 26 minutes on 2 parallel jobs.

Every job finished and left its outputs.

## Gate: the calibrated witness, on minus off, paired by world

| Slice | on − off (95%) | 90% interval | Verdict | Decisions on / off |
| --- | --- | --- | --- | --- |
| all decisions | -0.0 ±1.3 | -1.1 to 1.0 | equivalent within ±2 | 34435 / 34768 |
| not a couple's (row, row-answer, stay left out) | 0.5 ±1.0 | -0.3 to 1.4 | equivalent within ±2 | 26034 / 26308 |
| novel · contested · known (key) | -1.0 ±1.5 | -2.2 to 0.3 | not shown either way | 17448 / 17308 |

The page-annotation reader, on minus off, on decisions that are not a couple's: 0.2 ±1.0 (equivalent within ±2).

## Within each arm (mean over worlds, 95%)

| Arm | Slice | Calibrated | − notebook | − tendency learner | Lift as a share of base rate → mind-reader |
| --- | --- | --- | --- | --- | --- |
| on | all decisions | 62.2 ±1.0 | 3.3 ±0.9 | 4.1 ±0.9 | 26% |
| on | novel · contested · known (key) | 58.9 ±1.2 | 4.9 ±1.2 | 5.3 ±1.3 | 24% |
| off | all decisions | 62.2 ±1.4 | 3.4 ±1.2 | 4.1 ±1.4 | 27% |
| off | novel · contested · known (key) | 59.9 ±1.6 | 5.2 ±1.8 | 5.2 ±1.7 | 25% |

## Lives: story (on / off)

```
20 worlds · adults (25+) present through ten years · on / fit
  dead lives (fewer than 5 weighty events in 10 years)            0.03 ±0.01        0.03 ±0.01
  weighty events per life, median                                  18.8 ±1.1         17.9 ±0.7
  callbacks: share of weighty events tied to own past             0.31 ±0.01        0.30 ±0.01
  repeats: share of weighty events of a type already had          0.25 ±0.01        0.24 ±0.01
  distinct kinds of weighty event per life                         14.8 ±0.6         14.4 ±0.5
  adults with a named rival                                       0.25 ±0.04        0.25 ±0.04
  arcs per adult (obstacle and outcome in the window)             0.53 ±0.09        0.54 ±0.10
  adults with at least one arc                                    0.27 ±0.04        0.26 ±0.03
  from round 19d: a life is what the person did and what was done to them; an arc needs the pursuit's own obstacle
    dead lives (did or done to)                                   0.01 ±0.01        0.01 ±0.01
    repeats (did or done to)                                      0.34 ±0.01        0.34 ±0.01
    arcs per adult (own obstacle)                                 0.36 ±0.07        0.37 ±0.08
    adults with at least one arc (own obstacle)                   0.23 ±0.04        0.23 ±0.04
  kinds of weighty event in the town                                  150 ±3            148 ±2
  acts giving a sore spot or fear as a reason, per world           10.1 ±2.4         10.6 ±2.2
  acts giving a rule to live by as a reason, per world             21.3 ±4.7         22.5 ±4.4
  moments of humour, per world                                     29.6 ±3.7         30.1 ±3.5
  on: 147 kinds of decision, entropy 4.68 bits; top: row 16% · row-answer 10% · obligation 8% · support 6% · collection 6% · aftermath 4%
  fit: 149 kinds of decision, entropy 4.69 bits; top: row 16% · row-answer 10% · obligation 8% · support 6% · collection 6% · aftermath 5%
```

## Lives: friends

```
20 worlds · adults at the end of ten present years · on / nobudget (OFF=budget)
  on: close friends in town per adult: median 4, top tenth 11, most 27, none 14%
      made per adult a year 0.32 ±0.03 · ended per adult a year 0.27 ±0.03 · of year-0 friendships with both in town at 10, ended 20% of 2241
      friendship lines 2138; reasons: has energy for everything 27% · they work together at … 25% · does not like to judge 21% · they want the same things from life 18% · they run in the same crowd 13% · they worked together for years 10%
      familiar pairs where one dislikes the other: 6.1%
      aged 18–29 with no friend in town: 19% of 160
      share of contact to the top five (last year, adults to 70): median 56%
      strain, least-contacted tenth 0.11 ±0.04 · births ÷ deaths 1.32 ±0.34 · population 84.9 ±4.1
  fit: close friends in town per adult: median 4, top tenth 11, most 26, none 14%
      made per adult a year 0.31 ±0.02 · ended per adult a year 0.28 ±0.03 · of year-0 friendships with both in town at 10, ended 20% of 2256
      friendship lines 2078; reasons: has energy for everything 28% · they work together at … 25% · they want the same things from life 19% · does not like to judge 18% · they run in the same crowd 14% · they worked together for years 10%
      familiar pairs where one dislikes the other: 5.9%
      aged 18–29 with no friend in town: 21% of 162
      share of contact to the top five (last year, adults to 70): median 55%
      strain, least-contacted tenth 0.07 ±0.03 · births ÷ deaths 1.29 ±0.32 · population 83.3 ±4.2
  paired, on − off: strain of the least-contacted tenth 0.04 ±0.05
```

## Lives: consequences (on)

```
20 worlds · weighty events in the first seven present years, followed for three years · 18234 sources
  with any weighty descendant   0.26 ±0.01
  with a turn                   0.11 ±0.01
  chain depth (weighty): median 0, 90th 1, max 7 · reaching someone outside the source: 0.07 ±0.00
```

## Lives: consequences (off)

```
OFF=fit · 20 worlds · weighty events in the first seven present years, followed for three years · 17937 sources
  with any weighty descendant   0.25 ±0.01
  with a turn                   0.10 ±0.01
  chain depth (weighty): median 0, 90th 1, max 7 · reaching someone outside the source: 0.06 ±0.00
```

## Cold read

not run. Give the pack to a reader before anyone reads the numbers above.
