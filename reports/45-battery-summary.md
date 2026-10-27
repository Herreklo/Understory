# Round 45: test battery

Tree e7a302b; base 7411bad. Switches: `feelings`. Scoreboard: base rates 1501–1520, evaluation 3673–3692, 10 years. Lives 3693–3716. 30 minutes on 10 parallel jobs.

**1 job(s) did not finish:** npm test (failed, exit 1). Numbers resting on them are marked missing.

## Gate: the calibrated witness, on minus off, paired by world

| Slice | on − off (95%) | 90% interval | Verdict | Decisions on / off |
| --- | --- | --- | --- | --- |
| all decisions | -0.8 ±1.0 | -1.7 to 0.0 | equivalent within ±2 | 37279 / 35670 |
| not a couple's (row, row-answer, stay left out) | -1.1 ±1.3 | -2.2 to -0.0 | not shown either way | 28121 / 26677 |
| novel · contested · known (key) | 0.0 ±1.2 | -0.9 to 1.0 | equivalent within ±2 | 19242 / 18461 |

The page-annotation reader, on minus off, on decisions that are not a couple's: -0.6 ±1.4 (equivalent within ±2).

## Within each arm (mean over worlds, 95%)

| Arm | Slice | Calibrated | − notebook | − tendency learner | Lift as a share of base rate → mind-reader |
| --- | --- | --- | --- | --- | --- |
| on | all decisions | 60.4 ±0.7 | 2.1 ±0.9 | 3.0 ±0.9 | 21% |
| on | novel · contested · known (key) | 58.5 ±0.9 | 4.2 ±1.4 | 4.7 ±1.4 | 22% |
| off | all decisions | 61.2 ±0.9 | 2.7 ±0.7 | 4.5 ±0.8 | 24% |
| off | novel · contested · known (key) | 58.4 ±1.0 | 4.2 ±1.1 | 5.4 ±1.1 | 21% |

## Lives: story (on / off)

```
24 worlds · adults (25+) present through ten years · on / feelings
  dead lives (fewer than 5 weighty events in 10 years)            0.02 ±0.01        0.03 ±0.01
  weighty events per life, median                                  18.8 ±0.8         18.6 ±0.8
  callbacks: share of weighty events tied to own past             0.30 ±0.01        0.31 ±0.01
  repeats: share of weighty events of a type already had          0.23 ±0.01        0.24 ±0.01
  distinct kinds of weighty event per life                         15.0 ±0.5         14.8 ±0.5
  adults with a named rival                                       0.24 ±0.03        0.26 ±0.04
  arcs per adult (obstacle and outcome in the window)             0.54 ±0.09        0.54 ±0.09
  adults with at least one arc                                    0.27 ±0.03        0.27 ±0.04
  from round 19d: a life is what the person did and what was done to them; an arc needs the pursuit's own obstacle
    dead lives (did or done to)                                   0.00 ±0.00        0.01 ±0.00
    repeats (did or done to)                                      0.33 ±0.01        0.34 ±0.01
    arcs per adult (own obstacle)                                 0.36 ±0.06        0.39 ±0.06
    adults with at least one arc (own obstacle)                   0.22 ±0.03        0.24 ±0.04
  kinds of weighty event in the town                                  151 ±2            151 ±2
  acts giving a sore spot or fear as a reason, per world            8.6 ±2.5         10.4 ±3.1
  acts giving a rule to live by as a reason, per world             26.9 ±5.6         28.5 ±7.6
  moments of humour, per world                                     28.4 ±2.3         29.6 ±2.4
  on: 158 kinds of decision, entropy 4.75 bits; top: row 15% · row-answer 10% · obligation 7% · support 6% · collection 6% · aftermath 5%
  feelings: 152 kinds of decision, entropy 4.70 bits; top: row 16% · row-answer 10% · obligation 8% · support 7% · collection 6% · aftermath 5%
```

## Lives: friends

```
24 worlds · adults at the end of ten present years · on / nobudget (OFF=budget)
  on: close friends in town per adult: median 3, top tenth 11, most 24, none 15%
      made per adult a year 0.30 ±0.02 · ended per adult a year 0.31 ±0.03 · of year-0 friendships with both in town at 10, ended 20% of 2523
      friendship lines 2300; reasons: they work together at … 27% · has energy for everything 24% · they want the same things from life 19% · they worked together for years 11% · they kept seeking each other out 11% · takes people as he finds them 11%
      familiar pairs where one dislikes the other: 6.6%
      aged 18–29 with no friend in town: 26% of 160
      share of contact to the top five (last year, adults to 70): median 56%
      strain, least-contacted tenth 0.07 ±0.03 · births ÷ deaths 1.05 ±0.17 · population 78.5 ±2.8
  feelings: close friends in town per adult: median 3, top tenth 11, most 22, none 14%
      made per adult a year 0.30 ±0.02 · ended per adult a year 0.27 ±0.02 · of year-0 friendships with both in town at 10, ended 18% of 2577
      friendship lines 2277; reasons: they work together at … 28% · has energy for everything 25% · they want the same things from life 19% · they kept seeking each other out 12% · takes people as he finds them 12% · takes people as she finds them 10%
      familiar pairs where one dislikes the other: 6.5%
      aged 18–29 with no friend in town: 28% of 162
      share of contact to the top five (last year, adults to 70): median 57%
      strain, least-contacted tenth 0.08 ±0.04 · births ÷ deaths 1.05 ±0.25 · population 77.8 ±3.3
  paired, on − off: strain of the least-contacted tenth -0.01 ±0.04
```

## Lives: consequences (on)

```
24 worlds · weighty events in the first seven present years, followed for three years · 21418 sources
  with any weighty descendant   0.26 ±0.01
  with a turn                   0.11 ±0.01
  chain depth (weighty): median 0, 90th 1, max 8 · reaching someone outside the source: 0.07 ±0.00
```

## Lives: consequences (off)

```
OFF=feelings · 24 worlds · weighty events in the first seven present years, followed for three years · 21064 sources
  with any weighty descendant   0.26 ±0.01
  with a turn                   0.10 ±0.01
  chain depth (weighty): median 0, 90th 1, max 6 · reaching someone outside the source: 0.07 ±0.00
```

## Counters: the page, lasting change (on / off)

```
24 worlds (3693–3716) · on / feelings · mean per world ±95%
measure                                                     on        feelings         on − feelings
copy share, the three busiest (%)                    22.2 ±2.2       25.0 ±1.8             -2.8 ±2.5
  the fifteen templates' lines per page             9.88 ±1.98     12.18 ±1.53           -2.31 ±2.11
  kinds of line per page                           46.82 ±2.11     46.38 ±2.12            0.44 ±2.65
  lines per page                                     85.0 ±4.2       86.2 ±4.5             -1.2 ±5.2
copy share, three at random (%)                      14.1 ±2.5       16.4 ±3.0             -2.3 ±3.8
  the fifteen templates' lines per page             3.04 ±1.08      3.38 ±1.01           -0.33 ±1.15
  kinds of line per page                           26.81 ±2.39     26.83 ±2.76           -0.03 ±2.27
  lines per page                                     43.3 ±5.4       43.1 ±5.0              0.3 ±4.3
copy share, every adult (%)                          14.6 ±0.7       15.4 ±0.6             -0.8 ±0.7
  the fifteen templates' lines per page             2.73 ±0.25      2.78 ±0.18           -0.05 ±0.26
  kinds of line per page                           25.71 ±0.72     25.35 ±0.67            0.36 ±0.82
  lines per page                                     40.5 ±1.3       40.1 ±1.3              0.4 ±1.4
adults with a lasting change from the present (%)       13.8 ±2.0       10.8 ±1.8              3.0 ±2.3
  forgiveness (adults per world)                    1.54 ±0.54      0.33 ±0.24            1.21 ±0.56
  froze (adults per world)                          1.04 ±0.34      0.88 ±0.53            0.17 ±0.70
  grief (adults per world)                          0.79 ±0.30      0.00 ±0.00            0.79 ±0.30
  parent (adults per world)                         5.71 ±1.27      5.63 ±0.97            0.08 ±1.38
  sea (adults per world)                            0.08 ±0.12      0.33 ±0.24           -0.25 ±0.26

the fifteen templates, lines over every adult's page, summed over worlds (on / feelings)
   639   740  X told X to count her in for the summer festival.
   196   317  The summer festival that X put on was the best night the town had had in years.
   377   377  X had stopped talking about anything that mattered; they were polite with each other, and that was all.
   227   180  X brought a song to BAND, "T", and everyone knew at once it was the best thing they had.
   437   417  X brought a song to BAND, "T", and it did not come to much.
   410   444  X gave X the money without being asked twice.
   112    99  X tells the story of the day she froze better than anyone, and always against herself.
    97   119  The council said yes to X's summer festival.
   295   273  X finally told X what had been kept back.
   582   512  X stopped seeing each other, and that was that.
   318   274  X took the credit for a year that X had carried.
     8    21  Nothing had changed since Y: X had stopped bringing things up with X.
    63    70  BAND played the Anchor; X froze and the rest fell apart around her.
   317   353  X brought a song to BAND, "T", and it was good.
    69    47  X said, not quite joking, that she could play the open night if she wanted to.
```

## Identity with the switches off, against the base

```
all identical
```

## npm test

**Fails** (exit 1); see `logs/npm-test.log`.

## Cold read

not run. Give the pack to a reader before anyone reads the numbers above.
