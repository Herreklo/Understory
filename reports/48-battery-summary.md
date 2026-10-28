# Round 48: test battery

Tree d7d7096; base 2f8adf1. Switches: `norms`. Scoreboard: base rates 1501–1520, evaluation 3749–3768, 10 years. Lives 3769–3792. 11 minutes on 10 parallel jobs.

Every job finished and left its outputs.

## Gate: the calibrated witness, on minus off, paired by world

| Slice | on − off (95%) | 90% interval | Verdict | Decisions on / off |
| --- | --- | --- | --- | --- |
| all decisions | 0.1 ±1.1 | -0.9 to 1.0 | equivalent within ±2 | 34815 / 35154 |
| not a couple's (row, row-answer, stay left out) | 0.1 ±1.0 | -0.8 to 0.9 | equivalent within ±2 | 26376 / 26654 |
| novel · contested · known (key) | 0.4 ±1.7 | -1.0 to 1.8 | equivalent within ±2 | 17448 / 17624 |

The page-annotation reader, on minus off, on decisions that are not a couple's: 0.2 ±1.3 (equivalent within ±2).

## Within each arm (mean over worlds, 95%)

| Arm | Slice | Calibrated | − notebook | − tendency learner | Lift as a share of base rate → mind-reader |
| --- | --- | --- | --- | --- | --- |
| on | all decisions | 59.9 ±1.0 | 2.7 ±0.9 | 3.2 ±1.0 | 21% |
| on | novel · contested · known (key) | 57.9 ±1.2 | 4.8 ±1.3 | 4.9 ±1.4 | 24% |
| off | all decisions | 59.9 ±1.2 | 2.1 ±1.0 | 3.2 ±1.2 | 18% |
| off | novel · contested · known (key) | 57.5 ±1.6 | 3.3 ±1.3 | 4.5 ±1.7 | 17% |

## Lives: story (on / off)

```
24 worlds · adults (25+) present through ten years · on / norms
  dead lives (fewer than 5 weighty events in 10 years)            0.04 ±0.01        0.04 ±0.01
  weighty events per life, median                                  19.5 ±0.9         18.5 ±0.8
  callbacks: share of weighty events tied to own past             0.31 ±0.01        0.30 ±0.01
  repeats: share of weighty events of a type already had          0.24 ±0.01        0.24 ±0.01
  distinct kinds of weighty event per life                         15.2 ±0.5         14.8 ±0.5
  adults with a named rival                                       0.25 ±0.03        0.25 ±0.04
  arcs per adult (obstacle and outcome in the window)             0.54 ±0.08        0.54 ±0.12
  adults with at least one arc                                    0.28 ±0.03        0.27 ±0.04
  from round 19d: a life is what the person did and what was done to them; an arc needs the pursuit's own obstacle
    dead lives (did or done to)                                   0.01 ±0.01        0.01 ±0.01
    repeats (did or done to)                                      0.34 ±0.01        0.34 ±0.01
    arcs per adult (own obstacle)                                 0.36 ±0.06        0.37 ±0.08
    adults with at least one arc (own obstacle)                   0.23 ±0.03        0.24 ±0.04
  kinds of weighty event in the town                                  148 ±3            149 ±3
  acts giving a sore spot or fear as a reason, per world            9.9 ±2.1          9.5 ±2.5
  acts giving a rule to live by as a reason, per world             22.7 ±3.5         21.0 ±5.9
  moments of humour, per world                                     30.3 ±3.1         32.2 ±2.5
  on: 164 kinds of decision, entropy 4.78 bits; top: row 15% · row-answer 10% · obligation 7% · support 6% · collection 6% · aftermath 5%
  norms: 171 kinds of decision, entropy 4.75 bits; top: row 16% · row-answer 10% · obligation 8% · support 6% · collection 6% · aftermath 5%
```

## Lives: friends

```
24 worlds · adults at the end of ten present years · on / nobudget (OFF=budget)
  on: close friends in town per adult: median 3, top tenth 10, most 27, none 14%
      made per adult a year 0.31 ±0.02 · ended per adult a year 0.29 ±0.04 · of year-0 friendships with both in town at 10, ended 18% of 2456
      friendship lines 2398; reasons: has energy for everything 26% · they work together at … 26% · they want the same things from life 19% · they run in the same crowd 12% · they kept seeking each other out 11% · takes people as she finds them 10%
      familiar pairs where one dislikes the other: 6.6%
      aged 18–29 with no friend in town: 21% of 163
      share of contact to the top five (last year, adults to 70): median 56%
      strain, least-contacted tenth 0.08 ±0.03 · births ÷ deaths 1.22 ±0.37 · population 80.0 ±3.6
  norms: close friends in town per adult: median 4, top tenth 11, most 27, none 13%
      made per adult a year 0.32 ±0.02 · ended per adult a year 0.26 ±0.03 · of year-0 friendships with both in town at 10, ended 16% of 2732
      friendship lines 2491; reasons: has energy for everything 27% · they work together at … 26% · they want the same things from life 17% · they run in the same crowd 11% · takes people as she finds them 11% · they worked together for years 11%
      familiar pairs where one dislikes the other: 5.9%
      aged 18–29 with no friend in town: 21% of 157
      share of contact to the top five (last year, adults to 70): median 56%
      strain, least-contacted tenth 0.10 ±0.04 · births ÷ deaths 1.52 ±0.34 · population 81.8 ±3.3
  paired, on − off: strain of the least-contacted tenth -0.02 ±0.05
```

## Lives: consequences (on)

```
24 worlds · weighty events in the first seven present years, followed for three years · 21700 sources
  with any weighty descendant   0.26 ±0.00
  with a turn                   0.11 ±0.01
  chain depth (weighty): median 0, 90th 1, max 7 · reaching someone outside the source: 0.07 ±0.00
```

## Lives: consequences (off)

```
OFF=norms · 24 worlds · weighty events in the first seven present years, followed for three years · 21701 sources
  with any weighty descendant   0.26 ±0.01
  with a turn                   0.11 ±0.01
  chain depth (weighty): median 0, 90th 1, max 6 · reaching someone outside the source: 0.07 ±0.00
```

## Counters: the page, lasting change (on / off)

```
24 worlds (3769–3792) · on / norms · mean per world ±95%
measure                                                     on           norms            on − norms
copy share, the three busiest (%)                    23.3 ±1.4       21.9 ±1.6              1.5 ±1.8
  the fifteen templates' lines per page            10.38 ±1.62      8.00 ±1.47            2.37 ±1.92
  kinds of line per page                           46.44 ±2.06     46.11 ±2.17            0.33 ±2.68
  lines per page                                     85.7 ±4.1       83.0 ±4.2              2.7 ±4.8
copy share, three at random (%)                      14.1 ±2.0       14.7 ±2.0             -0.6 ±2.3
  the fifteen templates' lines per page             2.96 ±1.03      2.92 ±0.95            0.04 ±0.86
  kinds of line per page                           25.57 ±2.64     26.71 ±2.98           -1.14 ±3.13
  lines per page                                     40.3 ±5.0       42.0 ±5.1             -1.7 ±5.9
copy share, every adult (%)                          15.2 ±0.5       14.8 ±0.6              0.4 ±0.6
  the fifteen templates' lines per page             2.82 ±0.33      2.61 ±0.26            0.21 ±0.19
  kinds of line per page                           25.87 ±0.87     25.49 ±0.82            0.38 ±0.61
  lines per page                                     41.0 ±1.7       40.2 ±1.4              0.7 ±1.0
adults with a lasting change from the present (%)       13.3 ±1.8       15.2 ±1.9             -1.9 ±1.9
  forgiveness (adults per world)                    1.08 ±0.39      0.88 ±0.36            0.21 ±0.54
  froze (adults per world)                          0.63 ±0.45      0.79 ±0.39           -0.17 ±0.58
  grief (adults per world)                          1.17 ±0.39      0.88 ±0.40            0.29 ±0.38
  parent (adults per world)                         5.83 ±1.22      7.54 ±1.20           -1.71 ±0.95
  sea (adults per world)                            0.17 ±0.16      0.13 ±0.19            0.04 ±0.15

N1b: lives that lead somewhere (story.ts; shares pooled over worlds)
the three busiest
  callback share (%)                                 11.3 ±1.2       12.5 ±1.7             -1.3 ±1.5
  life turns per page                               2.93 ±0.56      2.82 ±0.33            0.11 ±0.77
    with a cause on an earlier line (%)              13.7 ±5.5       13.8 ±5.8             -0.0 ±7.1
    … which its reasons cite (%)                     12.8 ±4.8       12.8 ±5.6             -0.0 ±6.3
  turns (TURNS) per page                           17.90 ±1.26     17.69 ±1.58            0.21 ±1.95
    with a cause on an earlier line (%)              36.1 ±4.5       35.9 ±4.9              0.1 ±4.9
  counterparts in 3+ weighty events, per life       8.51 ±0.69      7.88 ±0.73            0.64 ±0.85
    lives with one or more (%)                      100.0 ±0.0      100.0 ±0.0              0.0 ±0.0
  reversals per life                                2.81 ±0.67      2.67 ±0.59            0.14 ±0.72
    lives with none (%)                              22.2 ±9.9      22.2 ±10.7             0.0 ±11.7
three at random
  callback share (%)                                  9.2 ±1.7       10.6 ±1.5             -1.4 ±1.5
  life turns per page                               1.69 ±0.50      1.74 ±0.44           -0.04 ±0.39
    with a cause on an earlier line (%)              14.8 ±6.1       11.2 ±5.6              3.6 ±4.9
    … which its reasons cite (%)                     14.8 ±6.1       11.2 ±5.6              3.6 ±4.9
  turns (TURNS) per page                            7.51 ±1.44      7.85 ±1.39           -0.33 ±1.60
    with a cause on an earlier line (%)              33.1 ±5.0       30.8 ±4.1              2.3 ±5.4
  counterparts in 3+ weighty events, per life       3.26 ±0.68      3.31 ±0.62           -0.04 ±0.71
    lives with one or more (%)                       86.1 ±7.1       86.1 ±8.2              0.0 ±5.9
  reversals per life                                0.99 ±0.43      1.13 ±0.37           -0.14 ±0.40
    lives with none (%)                             54.2 ±12.3      51.4 ±11.7             2.8 ±14.3
every adult
  callback share (%)                                 10.3 ±0.4       10.4 ±0.4             -0.1 ±0.5
  life turns per page                               1.70 ±0.13      1.75 ±0.13           -0.04 ±0.10
    with a cause on an earlier line (%)              11.4 ±1.3       11.8 ±1.7             -0.5 ±1.9
    … which its reasons cite (%)                     11.2 ±1.3       11.6 ±1.6             -0.4 ±1.6
  turns (TURNS) per page                            7.82 ±0.51      7.87 ±0.42           -0.05 ±0.24
    with a cause on an earlier line (%)              29.7 ±1.4       29.8 ±1.2             -0.1 ±1.4
  counterparts in 3+ weighty events, per life       3.19 ±0.22      3.07 ±0.20            0.12 ±0.16
    lives with one or more (%)                       88.0 ±1.6       90.4 ±1.5             -2.3 ±1.7
  reversals per life                                1.12 ±0.11      1.18 ±0.12           -0.06 ±0.10
    lives with none (%)                              52.9 ±2.8       51.1 ±3.7              1.8 ±2.8
    90th percentile, per world                        3.4 ±0.4        3.5 ±0.4             -0.1 ±0.4
the world (weighty events of the first seven present years, followed three years)
  cited by a later weighty event (%)                 25.6 ±0.5       25.1 ±0.6              0.5 ±0.6
  exit 2: a weighty consequence (%)                  26.5 ±0.5       25.9 ±0.6              0.5 ±0.6
  exit 2: lead to a turn (%)                         10.6 ±0.6       10.5 ±0.5              0.1 ±0.5
  exit 2: reach someone outside (%)                   6.9 ±0.4        6.4 ±0.4              0.5 ±0.6
  knowable turns /100 people/month, known           2.66 ±0.34      2.60 ±0.32            0.06 ±0.24
    … could know (never a target)                   3.61 ±0.20      3.61 ±0.18           -0.00 ±0.10
  blows per world                                    22.0 ±2.6       20.8 ±2.5              1.2 ±2.8
    followed by a rise within 3 years (%)            59.3 ±5.1       58.6 ±5.3              0.7 ±5.6
    … by a rise descending from the blow (%)          2.3 ±1.4        2.0 ±1.4              0.3 ±1.6
  wants opened by a blow, per world                 2.33 ±0.78      2.58 ±0.98           -0.25 ±0.83
    met within three years (%)                      64.3 ±16.5      66.1 ±15.5            -1.8 ±15.5
    met, and the meeting cites the blow (% met)      88.9 ±12.0       92.7 ±8.2            -3.8 ±15.1

the fifteen templates, lines over every adult's page, summed over worlds (on / norms)
   645   610  X told X to count her in for the summer festival.
   249   164  The summer festival that X put on was the best night the town had had in years.
   354   389  X had stopped talking about anything that mattered; they were polite with each other, and that was all.
   153   134  X brought a song to BAND, "T", and everyone knew at once it was the best thing they had.
   591   503  X brought a song to BAND, "T", and it did not come to much.
   506   536  X gave X the money without being asked twice.
    89    82  X tells the story of the day she froze better than anyone, and always against herself.
    99    85  The council said yes to X's summer festival.
   301   295  X finally told X what had been kept back.
   531   559  X stopped seeing each other, and that was that.
   335   343  X took the credit for a year that X had carried.
    27    25  Nothing had changed since Y: X had stopped bringing things up with X.
    65    43  BAND played the Anchor; X froze and the rest fell apart around her.
   322   252  X brought a song to BAND, "T", and it was good.
    58    53  X said, not quite joking, that she could play the open night if she wanted to.
```

## Identity with the switches off, against the base

```
all identical
```

## npm test

Passes.

## Cold read

not run. Give the pack to a reader before anyone reads the numbers above.
