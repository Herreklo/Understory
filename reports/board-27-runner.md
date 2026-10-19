# Round 27: test battery

Tree fe8d77e; base 957536a. Switches: `states`. Scoreboard: base rates 1501–1520, evaluation 1761–1780, 10 years. Lives 2921–2940. 41 minutes on 3 parallel jobs.

**1 job(s) did not finish:** npm test (failed, exit 1). Numbers resting on them are marked missing.

## Gate: the calibrated witness, on minus off, paired by world

| Slice | on − off (95%) | 90% interval | Verdict | Decisions on / off |
| --- | --- | --- | --- | --- |
| all decisions | -2.3 ±1.3 | -3.4 to -1.2 | REGRESSION | 33944 / 34512 |
| not a couple's (row, row-answer, stay left out) | -2.5 ±1.4 | -3.7 to -1.4 | REGRESSION | 24959 / 25457 |
| novel · contested · known (key) | -2.5 ±2.1 | -4.3 to -0.8 | REGRESSION | 17493 / 17844 |

The page-annotation reader, on minus off, on decisions that are not a couple's: -1.7 ±1.0 (REGRESSION).

## Within each arm (mean over worlds, 95%)

| Arm | Slice | Calibrated | − notebook | − tendency learner | Lift as a share of base rate → mind-reader |
| --- | --- | --- | --- | --- | --- |
| on | all decisions | 60.2 ±1.0 | 2.3 ±1.1 | 3.1 ±1.0 | 19% |
| on | novel · contested · known (key) | 58.0 ±1.4 | 3.3 ±1.4 | 3.8 ±1.4 | 15% |
| off | all decisions | 62.5 ±0.9 | 3.5 ±0.7 | 4.0 ±1.1 | 26% |
| off | novel · contested · known (key) | 60.6 ±1.3 | 5.0 ±1.4 | 4.8 ±1.3 | 24% |

## Lives: story (on / off)

```
20 worlds · adults (25+) present through ten years · on / states
  dead lives (fewer than 5 weighty events in 10 years)            0.04 ±0.01        0.04 ±0.01
  weighty events per life, median                                  17.4 ±0.7         17.3 ±1.0
  callbacks: share of weighty events tied to own past             0.28 ±0.01        0.27 ±0.01
  repeats: share of weighty events of a type already had          0.23 ±0.01        0.24 ±0.01
  distinct kinds of weighty event per life                         14.1 ±0.5         13.7 ±0.4
  adults with a named rival                                       0.21 ±0.04        0.20 ±0.03
  arcs per adult (obstacle and outcome in the window)             0.45 ±0.10        0.44 ±0.11
  adults with at least one arc                                    0.23 ±0.03        0.23 ±0.04
  from round 19d: a life is what the person did and what was done to them; an arc needs the pursuit's own obstacle
    dead lives (did or done to)                                   0.01 ±0.01        0.01 ±0.01
    repeats (did or done to)                                      0.32 ±0.01        0.33 ±0.01
    arcs per adult (own obstacle)                                 0.30 ±0.07        0.30 ±0.08
    adults with at least one arc (own obstacle)                   0.19 ±0.03        0.19 ±0.04
  kinds of weighty event in the town                                  146 ±3            145 ±2
  acts giving a sore spot or fear as a reason, per world           13.9 ±3.9         13.4 ±2.9
  acts giving a rule to live by as a reason, per world             22.1 ±5.8         29.5 ±5.9
  moments of humour, per world                                     29.5 ±2.6         28.3 ±3.2
  on: 156 kinds of decision, entropy 4.66 bits; top: row 16% · row-answer 10% · obligation 8% · collection 7% · support 6% · provocation 5%
  states: 141 kinds of decision, entropy 4.64 bits; top: row 16% · row-answer 10% · obligation 8% · support 7% · collection 7% · provocation 5%
```

## Lives: friends

```
20 worlds · adults at the end of ten present years · on / nobudget (OFF=budget)
  on: close friends in town per adult: median 3, top tenth 9, most 25, none 14%
      made per adult a year 0.26 ±0.02 · ended per adult a year 0.25 ±0.03 · of year-0 friendships with both in town at 10, ended 18% of 1989
      friendship lines 1735; reasons: they work together at … 27% · has energy for everything 24% · does not like to judge 22% · they want the same things from life 20% · they run in the same crowd 13% · they worked together for years 9%
      familiar pairs where one dislikes the other: 6.0%
      aged 18–29 with no friend in town: 20% of 129
      share of contact to the top five (last year, adults to 70): median 57%
      strain, least-contacted tenth 0.08 ±0.03 · births ÷ deaths 1.03 ±0.26 · population 81.7 ±2.9
  states: close friends in town per adult: median 3, top tenth 10, most 25, none 15%
      made per adult a year 0.27 ±0.02 · ended per adult a year 0.24 ±0.03 · of year-0 friendships with both in town at 10, ended 17% of 1918
      friendship lines 1742; reasons: they work together at … 26% · has energy for everything 25% · does not like to judge 23% · they want the same things from life 18% · they run in the same crowd 13% · they kept seeking each other out 9%
      familiar pairs where one dislikes the other: 6.2%
      aged 18–29 with no friend in town: 22% of 122
      share of contact to the top five (last year, adults to 70): median 57%
      strain, least-contacted tenth 0.10 ±0.03 · births ÷ deaths 0.90 ±0.26 · population 79.3 ±3.0
  paired, on − off: strain of the least-contacted tenth -0.03 ±0.04
```

## Lives: consequences (on)

```
20 worlds · weighty events in the first seven present years, followed for three years · 17454 sources
  with any weighty descendant   0.24 ±0.01
  with a turn                   0.10 ±0.01
  chain depth (weighty): median 0, 90th 1, max 6 · reaching someone outside the source: 0.06 ±0.00
```

## Lives: consequences (off)

```
OFF=states · 20 worlds · weighty events in the first seven present years, followed for three years · 16509 sources
  with any weighty descendant   0.23 ±0.01
  with a turn                   0.09 ±0.01
  chain depth (weighty): median 0, 90th 1, max 10 · reaching someone outside the source: 0.06 ±0.00
```

## Faults (on)

```
Coherence faults · seeds 2921–2924 · ten present years · 63s
no. count  fault
1   0      a remembered event held twice in one bond
2   0      "nothing had changed since" earlier than "together since"
3   0      a group's event holds the group's live member list
4   0      a dead person in a later event
5   4      a stock reason that does not fit the act
           e.g. seed 2922: Peter Shaw: "Kate told Peter Shaw no." [would not take what was not hers] (refusal)
           e.g. seed 2922: Kate Waller: "Kate told Peter Shaw no." [would not take what was not hers] (refusal)
6   0      a reason citing an event that is not on the page
7   0      one want dated two ways
8   0      an act at a workplace the person has left
9   0      a broken phrase
10  0      a repeat a writer would cut
11  0      near-identical names among the living
12  0      a friendship that ends and restarts with nothing between
COHERENCE {"seeds":[2921,2924],"counts":{"1":0,"2":0,"3":0,"4":0,"5":4,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0}}
```

## Faults (off)

```
Coherence faults · seeds 2921–2924 · ten present years · 64s
no. count  fault
1   0      a remembered event held twice in one bond
2   0      "nothing had changed since" earlier than "together since"
3   0      a group's event holds the group's live member list
4   0      a dead person in a later event
5   0      a stock reason that does not fit the act
6   0      a reason citing an event that is not on the page
7   0      one want dated two ways
8   0      an act at a workplace the person has left
9   0      a broken phrase
10  0      a repeat a writer would cut
11  0      near-identical names among the living
12  0      a friendship that ends and restarts with nothing between
COHERENCE {"seeds":[2921,2924],"counts":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0}}
```

## Identity with the switches off, against the base

```
all identical
```

## npm test

**Fails** (exit 1); see `logs/npm-test.log`.

## Cold read

24 lives in `/tmp/claude-0/-home-user/7c2f1e06-1290-5495-ab16-1f618628b192/scratchpad/r27/out-round-27/cold/lives.txt` (key in `cold-key.json`, outside the folder a reader is given). Give the pack to a reader before anyone reads the numbers above.
