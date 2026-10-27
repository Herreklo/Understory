# N1b baseline: do lives lead somewhere?

_27 October 2026, `main` at f545484 (round 45 kept). This is data on file for P2 (taking sides) and the rounds after it._

**How it was run.** `./run.sh src/tools/diag/measures.ts run 9001 9040 on`, then `report on`. That is 40 throwaway worlds, the 30-year past and 10 present years, with every system on. Each figure is a mean or a pooled share, with a 95% interval by world. Definitions are in `src/tools/diag/story.ts`. The pages are those a reading picks: the three busiest adults and three at random in each world, and also every adult.

| Measure | Busiest | Random | Every adult |
| --- | --- | --- | --- |
| Callback share: lines whose reasons name an earlier year of the page | 12.2% ±0.9 | 10.0% ±1.2 | 10.2% ±0.3 |
| Life turns per page (the subject's own job, home, partner or child) | 2.12 ±0.35 | 1.58 ±0.25 | 1.59 ±0.07 |
| … with a cause on an earlier line of the page | 15.4% ±4.6 | 11.1% ±4.5 | 10.5% ±1.1 |
| Turns per page (the engine's `TURNS`) | 17.2 ±1.1 | 7.3 ±1.0 | 7.75 ±0.27 |
| … with a cause on an earlier line | 34.0% ±2.3 | 28.4% ±3.7 | 28.8% ±1.0 |
| Counterparts in three or more weighty events, per life | 8.07 ±0.45 | 2.91 ±0.48 | 3.17 ±0.13 |
| … lives with at least one | 100% | 87.5% ±5.1 | 90.2% ±1.1 |
| Reversals per life | 2.73 ±0.45 | 0.88 ±0.23 | 1.07 ±0.07 |
| … lives with none | 12.5% ±6.9 | 53.3% ±9.9 | 51.5% ±2.0 |
| … 90th percentile, per world | | | 3.1 ±0.2 |

| Of the world (weighty events of the first seven present years, followed for three) | |
| --- | --- |
| Cited by a later weighty event | **25.1% ±0.5** |
| Exit point 2: with a weighty consequence, directly or through a chain | 26.0% ±0.5 |
| Exit point 2: leading to a turn | 10.6% ±0.4 |
| Exit point 2: reaching someone outside the event's own people | 6.6% ±0.3 |
| Knowable turns per 100 people a month (beside exit point 2, never a target) | 2.57 ±0.21 known, 3.58 ±0.13 could know |
| Blows per world-decade (the intrigue audit's kinds) | 21.3 ±1.6 |
| … followed by a rise for the same person within three years | 57.2% ±4.2 |
| … by a rise that descends from the blow | 1.5% ±0.9 |
| Wants opened by a blow, per world-decade | 2.05 ±0.49 |
| … met within three years | 52.4% ±13.0 |
| … where the meeting descends from the blow | **88.4% ±10.6** |

**Definitions in brief.**

- A cause on an earlier line means the turn descends, through cited causes, from an event shown higher on the same page. That event can be a line or an event shown under one. In 442 of the 449 such life turns, the turn's own reasons cite that ancestor directly.
- A reversal is a thread of a life changing sign: a tie with one person made and then broken, or broken and then mended; work gained and then lost; a want gone after and then given up. It counts present years only, as a page shows them.
- Callbacks follow the readings' rule (`features.py`). On round 40's busiest pack the tool gives 308 of 3,429 lines (9.0%), the same as the Python.

**Does a want lose the blow that caused it? No.** The record keeps the chain. When a blow opens a want (`occasions.ts`) and the want is met, the act that met it descends from the blow in 38 of 43 cases (88%). In twelve worlds of examples (9101–9112), a bought trip cites the death behind it directly. The audit's "3% of rises descend from a blow" has two other causes:

- Few blows open a want. About 2 a world-decade do, against 21 blows of the audit's kinds.
- Deaths open most of those wants, and the audit's list of blows leaves death out.

So no engine change follows from this item. A round that wants blows to lead somewhere needs more blows to open something, not a mended record.

**What P2 should read from this.**

- **Its counter.** P2's counter is "≥15% of side-takings end or start a tie, or are cited by a weighty event, within 3 years". For comparison, 25.1% of all weighty events are cited by a later weighty event.
- **Fail-if 1** of `intriguing-lives.md`: does the cited share rise beyond the off arm's interval? It holds at ±0.5 on 40 worlds (about ±0.7 on 20). Leave out the new acts' citations of their own triggers.
- **Fail-if 3:** "70% of new turns have a cause on an earlier line". The page today reaches 29% for all turns and 10.5% for life turns, so the bar is far above today's lives. A new turn that meets it stands out.
- **Fail-if 5:** reversals at the 90th percentile are 3.1, against a stop at 4. Half of all lives have none, and the busiest average 2.7. Taking sides adds reversals by its nature (friends, then rivals), so watch this one.
- **Knowable turns.** These are 2.57 known and 3.58 could-know per 100 people a month. Density's 22 October figures (2.86 and 3.61) were measured over 8 years, not 10, and before round 45.

**Limits.**

- Life turns are found by event type, and a house is found by the word "house". The page rule of the readings matched lines by text, so the two counts are close but not identical.
- Blows opened 82 wants in 40 worlds and 43 were met, so the ±11 is wide. Even at its low end, 78%, the record does not lose the chain.
