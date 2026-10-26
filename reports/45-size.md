# Round 45 sizing: feelings meet their object

_26 October 2026, `round/45`. Throwaway worlds only (9001–9024, claimed in `docs/seeds.md`), each run three ways and paired by world: **on** (this round); **meeting off** (`OFF=meeting`: round 44's feelings without the meeting, the research's baseline); **main** (`OFF=feelings`). Twenty present years for demography, the first ten for everything else. No fresh world was run, nothing was read, and nothing is pre-registered. Tools: `src/tools/diag/meet.ts` (the counter and the five fail-ifs) and `src/tools/diag/feel.ts` (round 44's checks). Output: `reports/45-size-meet.txt`, `45-size-feel.txt` (on against main), `45-size-feel-meeting.txt` (on against meeting off), one line a world and arm in `45-size-worlds.jsonl`, and v1 as run in `45-size-v1-*.txt`. Each figure is a mean per world with its 95% interval between worlds._

**Verdict: the round sizes to pass.** The primary counter is **5.1% ±1.3**, against 1.0% ±0.4 with the meeting off (paired +4.1 ±1.2). That reproduces the research's 0.9% as the baseline and lands near its centre of 5%. Shrunk by a quarter it expects 3.8%, above the 2.5% stop. All five fail-ifs pass. Gratitude carries most of it: resentment alone sits at 2.5% ±1.0, on the stop line (see "For the review").

## What was built

Behind `OFF=feelings`, now **on by default** (`feelings.ts`, `situations/meeting.ts`; hooks in `grammar.ts`, `effects.ts`, `situations/index.ts`). With `OFF=feelings` every hook returns before any draw. CI's identity script, run locally on this branch merged into `main`, passes on seeds 11–13 (`reports/45-ident.txt`).

- **The meeting** is a matcher (`meeting`, after `reckon`). It considers a resentment, guilt or gratitude at 0.3 or more whose cause stands, held by someone 16 or older, whose object is in town and shares a place with the holder: a job, a circle, a band, a friendship, a partner or kin.
  - **Its chance each month** is 0.25 × intensity × approach × seeking. **Approach** is 1 + 0.15 × social boldness, plus a lean by kind: −0.25 × forgiveness for resentment, +0.25 × sincerity for guilt, +0.25 × sentimentality for gratitude. It is clamped to 0.3–1.7, and facets are read toward the object, so "never forgave" counts. **Seeking** is 1 until the holder keeps away.
  - If several feelings come up in the same month, the strongest goes.
  - There is no timer, count, cooldown or quota. The grandfathered one-a-month scheduler is unchanged.
- **Its weight** is 0.6 + 0.6 × intensity.
- **Its answers** are the kind's own, using existing named expressions:

  | Kind       | Answers                                                                                    |
  | ---------- | ------------------------------------------------------------------------------------------ |
  | Resentment | have it out (`rake`), let it go (`letgo`), keep away (`avoid`)                             |
  | Guilt      | make amends (`apologise`), keep away (`avoid`)                                             |
  | Gratitude  | come round (`visit`), repay (`give`, "something back for the rescue"), keep away (`avoid`) |

  Keeping away from a benefactor is indebtedness, not gratitude (Watkins et al. 2006; Tsang 2006). The feeling weighs as `feel:<kind>` through `withFeelings`, worded with its kind and object, and the situation's own facet and bond considerations come first.

- **Every answer changes the feeling.**
  - Had out: it halves, and so does the ceiling a later meeting renews it to (`v0`).
  - Let go: it no longer stands.
  - Kept away: seeking halves.
  - Amends and thanks: it is paid.
- **The object answers through the queue.**
  - A have-out is a wrong, so it raises the provocation the object answers (existing code).
  - An apology is answered next month (`meeting-answer`): forgiven (`letgo`), the resentment ends; refused (`sulk`), it stands as it did before the apology.
  - Letting go, keeping away and thanks ask nothing of the object, and get no answer.
- **The mute rule narrows** to the immediate answer (`provocation`, `row-answer`, `aftermath`).
- **`OFF=meeting`** turns off the meeting and restores round 44's wide mute. It exists to measure the part. `feelings` stays the round's one switch.

## Versions

|     | What changed                                                                                               | Kind                                                                            | The state it reads                                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| v1  | as built from the note; the raising constant (0.25) and the approach weights were set before the first run | design                                                                          | 0.25 is the top of the note's range (0.1–0.25). At 0.1 the research shows strong resentments raised within a year in 8.6%, under fail-if 5's 15% |
| v2  | a refused apology restores the resentment's standing as it was before the apology, not "stands"            | fix (fail-if 2: 2 meetings recurred with the feeling as it was at the last one) | v1 set it standing even where the holder had let it go the month before (world 9012: let go, apology, refused, met again)                        |

No weight was changed between versions. v2 left the counter at 5.1% (155/2,895 pooled before, 153/2,877 after). The off arms do not run this code and were not re-run.

## The counter and the five fail-ifs (v2)

|       | Check                                                                                                      | Number                                                                                                                                                                                                                                                                                                                                                             | Line                                       |                            |
| ----- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | -------------------------- |
| **1** | **Primary counter:** of held feelings at 0.3+, the share changing an act toward their object within a year | **5.1% ±1.3** (153/2,877). Meeting off 1.0% ±0.4, paired **+4.1 ±1.2**. By kind: resentment 2.5 ±1.0, guilt 6.3 ±2.7, gratitude 7.9 ±3.3                                                                                                                                                                                                                           | stop under 2.5                             | ✓                          |
|       | Round 44's counter, beside it (flips among decisions weighing the four kinds)                              | 6.3% ±1.2 (227/3,473), weighed in 7.6% of decisions; meeting off 4.9% ±1.2, in 4.7%. With the debt: 6.8 ±1.0                                                                                                                                                                                                                                                       | —                                          |                            |
| **2** | The meeting recurs where nothing changed                                                                   | Of 1,030 meetings that met again, **0** with the feeling as at the last meeting. Something followed within a year: **84.7% ±2.5** (resentment 65.6%, guilt 79.2%, gratitude 96.6%)                                                                                                                                                                                 | 0; stop under 50                           | ✓                          |
| **3** | It crowds out the rest of a life                                                                           | Decisions displaced by a meeting: **0.11% ±0.05**. Demography below: everything inside its interval                                                                                                                                                                                                                                                                | ≤ 2%; inside, or named                     | ✓                          |
| **4** | Revenge turns into feuds                                                                                   | Per thousand adult-years against main: wrongs +6.6 ±16.0, answers in kind +0.8 ±9.8, rows +7.6 ±22.5, dislikes +1.4 ±6.3, friendships ended +0.2 ±6.2. Against meeting off, wrongs +15.6 ±20.3: a have-out is a wrong by definition (about 7.5 a world-decade)                                                                                                     | inside, or said                            | ✓                          |
| **5** | A script: every wrong, the same visit                                                                      | Strong resentments raising a meeting within a year: **19.0% ±1.7**. Forgiveness: bottom third 25.2%, top 12.3%, **2.05×**. Keeping away by social boldness: bottom 38.0%, top 25.3%, **1.50×**. Meeting lines in any world's top 25: **0** of 1,505. Copy share, every adult: +0.58 ±0.60 against main, +0.60 ±0.74 against meeting off. Top-25 share: +0.18 ±0.78 | 15–60%; ≥ 1.3×; no template; must not rise | ✓, the copy share narrowly |

**Meetings** run at 60.4 ±7.7 a world-decade: resentment 16.0, guilt 9.8, gratitude 34.6.

| Kind       | Answers                                  |
| ---------- | ---------------------------------------- |
| Resentment | had out 47%, kept away 31%, let go 22%   |
| Guilt      | amends 59%, kept away 41%                |
| Gratitude  | repaid 61%, came round 30%, kept away 9% |

Of 278 apologies answered, 146 were forgiven. Raised within a year: guilt 36.3% ±4.9, gratitude 64.5% ±5.6.

**Round 44's own checks, on against main.**

- **Carrying:** resentment 12.0% of adult-months, grief's busiest month 21.9%; grief ratio 0.96.
- **Named:** 366 of 366 lines a feeling decided name kind and object, on the page.
- **Exit 8:** 13.5% of adults have a lasting change, against 11.1% (+2.4 ±2.8).

## Demography, paired over twenty years (per world-decade)

|           | on        | main      | on − main | on − meeting off |
| --------- | --------- | --------- | --------- | ---------------- |
| births    | 7.2 ±0.9  | 7.2 ±1.1  | −0.0 ±0.9 | −0.3 ±0.9        |
| deaths    | 9.3 ±0.9  | 9.2 ±1.0  | +0.1 ±0.7 | −0.1 ±0.9        |
| marriages | 4.6 ±0.6  | 4.6 ±0.5  | −0.0 ±0.6 | +0.0 ±0.7        |
| splits    | 4.1 ±0.6  | 4.5 ±0.6  | −0.4 ±0.6 | +0.4 ±0.7        |
| hires     | 21.3 ±1.8 | 20.6 ±1.6 | +0.6 ±2.3 | +1.4 ±2.4        |

Births over deaths: 0.77 on, 0.78 main. **`npm test` with feelings on** passes on this branch with `main` merged in (#98's 24-world demography check: "demography ok"). Before that merge it failed only at the old six-world check (births/deaths 0.59, seeds 1–6), the fragility the research named.

## Power

**The counter at 24 fresh worlds** (sd per world 2.96):

| True share                | Point ≥ 2.5 | One-sided 95% bound > 2.5 |
| ------------------------- | ----------- | ------------------------- |
| 5.1 (as sized)            | 100%        | 99%                       |
| 3.8 (shrunk by a quarter) | 99%         | 69%                       |
| 3.0                       | 80%         | 19%                       |
| 2.5                       | 50%         | 4%                        |

24 worlds tell 4% from 2.5% on the point estimate nearly always (99%), and by a bound in 78% of runs. At 48 worlds the bound reaches 96%.

**The reading** (48 pairs, a random pack and the busiest pack) cannot see this.

- **Pages touched:** a feeling decides a line on 31.9% ±11.4 of the busiest pages (0.42 lines a page) and 13.9% ±9.2 of random pages (0.19 lines a page). Round 44 had 0.29 and 0.15.
- **Kinds of line a page:** +0.47 ±2.44 busiest and +1.31 ±3.42 random, about +0.02 to +0.07 raw against the ±0.25 a reading resolves.
- **What the reading is for:** it guards "reads no worse" only. A harmless round passes 77% of the time at round 40's spread. An aimed pack (a wrong or a death in both arms) would put more meetings on a page, but still could not resolve an effect on how lives read.

## For the review

1. **Gratitude carries the counter.** 88 of its 153 flips are gratitude's. Resentment alone is 2.5% ±1.0, on the stop line: its meetings are decided mostly by forgiveness and like, the same reason the old wound flipped 0 of 46. The note's counter pools the kinds; pre-registering it pooled, with each kind beside it, is my recommendation. Name in advance that if resentment stays under 2.5%, the outcome says gratitude and guilt carried the round.
2. **The copy share for every adult rises by +0.58 ±0.60,** inside its interval only just. Meeting lines join no top-25 template. The rise is spread across lines (+3.3 lines a busiest page).
3. **Known edges.**
   - `avoid` is worded in the present tense ("goes out of his way to avoid"), as main's grudge uses it.
   - Answers reuse existing expressions. Adding new ones to a family would change main's fallback pool (`pickExpression`), and so its draws.
   - The scheduler gained a tool-only log (`globalThis.SCHED`), which changes nothing.
   - Whether an apology may be refused is read when the meeting is matched, not when it runs.
4. **The guard (plan, section 2).** No new reader reads a count, rate or measure. `away` is a state of the feeling that scales a chance and never gates one.
5. **The battery.** `meet.ts run A B on|meeting|feelings 10` gives the counter on fresh worlds. `feel.ts` takes the arms `on` and `meeting`.
