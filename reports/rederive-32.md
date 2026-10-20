# Round 32: independent re-derivation of the headline numbers

Method: own Python (scipy t quantiles) over the raw files; summary.md used only to know which claims to check. Scripts in
`$S/audit32/` (board.py, cons.py, story.py, friends.py, blind.py, rerun/ for the carry.ts outputs); S = the scratchpad. Interval method for all
world-level numbers: mean over worlds, 95% half-width = t(0.975, n-1) x sd / sqrt(n); the 90% interval uses t(0.95, n-1).
Arm labels in the raw files: board-on / board-off; out-cons digit-named files = on, `carry-*` = off; out-story and out-friends `on-*` = on, `carry-*` = off (OFF=carry).

1. Scoreboard (20 worlds 3145-3164, calibrated witness `cal`, on minus off paired by world): AGREES.
   all decisions -0.67 +-1.12 (90%: -1.59 to 0.26; decisions 34530 on / 35175 off); not a couple's (rows, row-answers, 'stay' left out)
   -0.05 +-1.24 (90%: -1.07 to 0.97; 25116 / 25539); key slice (novel, contested, known) -0.88 +-1.62 (90%: -2.22 to 0.46; 17290 / 17249);
   page-annotation reader (`text`), not a couple's, +0.14 +-1.41 (all decisions +0.25 +-1.34). Within the on arm, key slice, calibrated minus notebook
   (`noteOrBase`) 4.73 +-1.23; off arm 5.65 +-0.97 (5.6498 unrounded, so it prints 5.6). Also: calibrated on key 59.9 on / 60.8 off; all decisions 62.0 / 62.7;
   calibrated minus tendency on key 4.43 / 5.19; all decisions cal minus notebook 2.62 / 3.16.
2. Consequence map (seeds 3165-3184, 17388 sources on / 17208 off): AGREES.
   reach on 0.05178 vs off 0.05230 (pooled 0.05193 / 0.05230); any weighty descendant on 0.22833 vs off 0.22897 (pooled 0.22843 / 0.22920);
   with a turn on 0.09863 vs off 0.09490 (pooled 0.09880 / 0.09496).
   Paired on-off: reach -0.00053 +-0.00413, weighty descendant -0.00064 +-0.00729, with a turn +0.00373 +-0.00489 (all intervals include zero).
3. Story (adults 25+, 20 worlds 3165-3184; on 1050 adults, off 1066): AGREES. dead lives (fewer than 5 weighty events) on 0.038 +-0.010 vs off 0.032 +-0.010
   (pooled 0.0371 / 0.0319); weighty events per life, median of per-world medians (upper median) 17.00 vs 17.15 (true medians 16.88 +-0.59 vs 17.13 +-0.64;
   pooled median 17 / 17); arcs per adult on 0.432 +-0.083 vs off 0.440 +-0.084 (pooled 0.427 / 0.435).
   Paired on-off: arcs -0.007 +-0.083, dead +0.006 +-0.014, median weighty events -0.15 (upper) / -0.25 (true) +-0.8.
4. Friends (20 worlds 3165-3184; on 1344 adults, off 1371): AGREES. close friends per adult median 3 vs 3 (true median 3 in both; means 4.30 vs 4.56; none 14.1% vs 13.0%);
   ended per adult a year (2 x ended / adultYears, as the tool does) on 0.308 +-0.040 vs off 0.267 +-0.033 (pooled 0.3083 / 0.2673); made per adult a year 0.293 vs 0.278;
   aged 18-29 with no friend in town: on 38 of 146 = 26.0%, off 26 of 143 = 18.2%. The "on" block is carry on (files `on-*`), the second is OFF=carry (files `carry-*`), as the summary labels them.
5. Carry count, shares from the totals (extra/carry-on.txt, carry-off.txt): AGREES.
   lastingOneSided 651 of 4489 = 14.50%; endingsCarry 31 of 698 = 4.44%; top 38 of 4259 = 0.892% (cited 191 of 4259 = 4.49%, bearing = 4259 decisions between friends where the record may bear);
   endingsDated 112 of 698 = 16.05% on vs 105 of 696 = 15.09% off; endings per adult-year 698/18220 = 0.03831 on vs 696/18120 = 0.03841 off. Off arm: all carry counts 0 as designed.
   (Lasting friendships: 4489 on, 4485 off.)
6. Determinism rerun: AGREES. `npx tsx src/tools/diag/carry.ts` with no ON/OFF set (src/carry.ts has `carryOn = () => !OFF.has('carry')`, on by default, so no ON=carry was needed), tree at S/wt-set (src unchanged between 7478c46 and HEAD 7c16f14; the working tree has uncommitted doc edits only).
   I ran 3165-3168 as one range and as four single-seed runs: the four sum exactly to the range run (lasting 909, lastingOneSided 135, lines 77, endings 141, endingsCarry 5, endingsDated 17, bearing 857, bearingAll 1228, cited 35, top 9, adultYears 3550).
   I also ran the whole of 3165-3184 (ranges 3165-3168, 3169-3176, 3177-3184): totals identical to extra/carry-on.txt on every field (4489, 651, 348, 698, 31, 112, 4259, 6165, 191, 38, 18220).
   The reference has no per-world split, so the per-world check is my own four single-seed runs against my own range run, not against the reference; the full-range totals are what is compared to the reference.
7. Blind reading (key `onIs`, answers in read32/\*.json, 12 pairs x 3 readers): AGREES.
   On arm preferred by majority in 8 of 12 (7 pairs with 3 of 3 votes for on: P02, P07, P08, P09, P10, P11, P12; P04 2 of 3; not preferred: P01, P03, P05, P06, each 0 of 3);
   mean paired score difference on-off +0.139 over 36 reader-pairs (novelist +0.083, socialworker +0.167, player +0.167);
   ordinal alpha 0.656, bootstrap 95% [0.351, 0.838] (2000 resamples, seed 1, scripts/alpha.py on units 2i-1, 2i = pair i's A, B; interval alpha 0.663 [0.357, 0.832]);
   readers chose B in 25 of 36 choices (novelist 9, socialworker 8, player 8) and 8 of 12 by majority; the on arm was B in 6 of 12.
   The `prefer` field is never in conflict with the A/B scores (0 of 36), but it decides every score tie (see notes). My score file is identical to read32/scores.json.
   Carry wording ("was always the one who", "had always been the one who", "stopped going round", "stopped helping out", "stopped being the one") in faults or good: 0 for each reader.
   In S/read32/pairs.txt the wording appears on 18 lines: 17 "was always the one who" as a town line (event text, ending "[since YYYY]") and 1 "had always been the one who" inside a bracketed reason (P10 B, "Eric kept turning up..."); the three "stopped ..." phrases occur 0 times in pairs.txt.
8. Test battery (extra/test-on.txt, test-off.txt; printed values read, nothing recomputed): AGREES.
   births / deaths on 8.6 / 7.4 vs off 8.8 / 7.5 (ratio of the printed values 1.162 vs 1.173; the one-decimal values allow 1.148-1.177 on, 1.157-1.190 off); twists 20.3 vs 21.9; honest whys 75% (of 35354) vs 74% (of 35436).

Notes, not disagreements

- Claim 1: nothing is distinguishable from zero at 95%. Negative worlds: 13 of 20 on all decisions (range -3.8 to +3.8), 8 of 20 not a couple's (-4.8 to +5.4), 10 of 20 key (-7.5 to +4.6); paired t p = 0.226 / 0.938 / 0.270.
  The not-a-couple interval fits in +-2 at 90%. The key slice 90% interval (-2.22 to 0.46) reaches past -2, consistent with the summary's "not shown either way". Decision counts are within 2% between arms on the all and not-a-couple slices.
  Calibrated minus notebook on the key slice is lower with the switch on (4.7 vs 5.6); the difference of the two is not tested here.
- Claim 2: the rounded "0.05 vs 0.05" and "0.23 vs 0.23" hide -0.0005 and -0.0006; nothing here differs from zero. The with-a-turn share is the largest difference (+0.0037 +-0.0049), also within noise.
- Claim 3: no difference by world on any story measure. "17.0 vs 17.1" holds for the upper median per world (17.00 vs 17.15, prints 17.1); with true medians it is 16.9 vs 17.1.
- Claim 4: ended per adult a year is the one friends number that moves: paired on-off +0.041 +-0.031 (excludes zero at 95%), 0.31 vs 0.27 unrounded 0.308 vs 0.267. The tool's "ended" is a net count (made + start - end), not a count of cooling events, and the tool's per-adult figure is 2 x pairs / adult-years.
  Made per adult a year is not clearly different (0.293 vs 0.278). Young adults with no friend in town: 26.0% of 146 vs 18.2% of 143 (pooled difference +7.9 points; Fisher exact p = 0.12; bootstrap over worlds 95% [-0.4, +15.9]); per-world mean share 27.3% vs 19.6% (+-8 each); so a point estimate, not a shown rise.
- Claim 5: endingsDated moves 15.1% to 16.0% on 698 / 696 endings (a difference of 7 endings), well inside what 700 endings can do by chance; endings per adult-year are the same to the fourth decimal.
  Endings carrying the wording are 31 (4.4%); one-sided lasting friendships 14.5% is an on-arm-only measure (the off arm has none by construction).
- Claim 6: the rerun reproduces the totals of the tool; it checks reproducibility and aggregation, not what the tool counts as one-sided, a carry ending, a dated ending or "top reason" (not re-derived from event logs).
- Claim 7: the order was dealt six and six, so the order effect (version B scored 0.53 higher than A on average, B chosen in 25 of 36 = 69%) cancels in the aggregate mean by design, but it is large inside each half:
  split by order, on-minus-off is +0.67 where on was B (6 pairs, on preferred by majority in 5) and -0.39 where on was A (6 pairs, majority in 3). The pair-level mean (+0.139) has a 95% half-width of 0.55 over 12 pairs.
  12 of the 36 reader choices are score ties (3 vs 3 or similar); the `prefer` field resolved them 9 to on and 3 to off. On scores alone: on higher in 14, off higher in 10, tied 12. Pair P12 is tied for all three readers on score and preferred on by all three; the "8 of 12" depends on that.
  The mean paired difference by reader ranges from +0.08 to +0.17, so every reader's mean difference is small. Carry wording was never quoted by a reader, but it occurs only in on-arm texts (18 of 18 lines), so a reader could in principle have told the arm; the readers' reasons do not show that they did.
  The key and the A/B texts were taken as given; the assignment was not regenerated.
- Claim 8: the bar "births / deaths within +-0.15" compares on with off: on - off is about -0.01 by the printed values (range -0.04 to +0.02), well inside; either arm alone is 1.16-1.17, not 1.0.
  Population 84 vs 86, marriages 5.2 vs 4.8, hires 15.1 vs 14.1, left 8.8 vs 7.0 differ; these are single runs of 20 worlds each with no interval printed.

Note added 20 Oct 2026, after the round: this rerun was made before the switch was set off by default. With the merged code, `carryOn()` is `ON.has('carry')`, and the rerun's command needs `ON=carry` in the environment to reproduce `carry-on.txt`.
