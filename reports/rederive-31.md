# Round 31: independent re-derivation of the headline numbers

Method: own Python (scipy t quantiles) over the raw files; summary.md used only to know which claims to check. Scripts in
`$S/audit31/` (board.py, cons.py, story.py, tellagg.py, tellcmp.py, blind.py); S = the scratchpad. Interval method for all world-level numbers:
mean over worlds, 95% half-width = t(0.975, n-1) x sd / sqrt(n); the 90% interval uses t(0.95, n-1).

1. Scoreboard (20 worlds 3075-3094, calibrated witness `cal`, on minus off paired by world): AGREES.
   all decisions -0.88 +-1.30 (90%: -1.95 to 0.19; decisions 35195 on / 35489 off); not a couple's (rows, row-answers, 'stay' left out)
   -1.00 +-1.11 (90%: -1.92 to -0.08; 25909 on / 25961 off); key slice (novel, contested, known) -1.28 +-1.75 (90%: -2.72 to 0.16);
   page-annotation reader (`text`), not a couple's, -1.26 +-1.24. Within the on arm, key slice, calibrated minus notebook (`noteOrBase`)
   4.59 +-1.00; off arm 4.62 +-1.01 (also: calibrated on key 58.5 on / 59.8 off; calibrated minus tendency on key 4.84 / 4.29; calibrated all decisions 60.7 on / 61.6 off).
2. Consequence map (seeds 3121-3140, 17379 sources on / 17142 off; off = the `telling-*.json` files, on = the digit-named files, as in round 30): AGREES.
   reach on 0.0580 vs off 0.0555 (pooled 0.0578 / 0.0554); any weighty descendant on 0.2353 vs off 0.2296 (pooled 0.2352 / 0.2296).
   Paired on-off: reach +0.0025 +-0.0064, weighty descendant +0.0057 +-0.0087, with a turn +0.0012 +-0.0069 (all intervals include zero).
3. Story (adults 25+, 20 worlds 3121-3140; on 1054 adults, off 1037): AGREES. dead lives (fewer than 5 weighty events) on 0.043 +-0.012 vs off 0.040 +-0.017
   (pooled 0.0427 / 0.0405); weighty events per life, median of per-world medians (upper median) 17.15 vs 17.15 (true medians 17.08 +-0.65 vs 16.93 +-0.79;
   pooled median 17 / 17); arcs per adult on 0.436 +-0.119 vs off 0.392 +-0.072 (pooled 0.428 / 0.396).
4. Own count from telling-on.txt (TELLING line, 20 worlds, 3121-3140): AGREES.
   flips 153 of 3078 counterpart choices = 4.97%; flips cited 78 (51% of flips); account as honest top reason 50 of 23,099 decisions with another person = 0.216% (0.22%);
   told accounts per adult median 1.54 (upper of the two middle values; true median 1.53); misattributed share 1.73% (0.01731, told-weighted over 3235 told accounts);
   bent share 25.2% (0.2522, told-weighted). Also: told accounts as top reason 3 (0.013%); any account among the reasons 8.57%.
5. Determinism rerun (seeds 3121-3125 only, `ON=telling npx tsx src/tools/diag/telling.ts <seed> <seed>`, one process per seed, after the switch was made off by default): AGREES.
   Per-world arrays told, perAdult, wrongShare, bentShare, secondShare are identical to the first five entries of telling-on.txt
   (told 175/131/193/160/181; perAdult 1.54/1.13/1.86/1.52/1.59). Five-world totals from the rerun: decisions 8446, withOther 5490, accountTop 11,
   choices 756, flips 28, flipsCited 14 (not comparable with the 20-world totals, only the arrays are).
6. Blind reading (key `onIs`, answers in read31/*.json, 12 pairs x 3 readers): AGREES.
   On arm preferred by majority in 7 of 12 (not preferred: P02, P03, P05, P07, P10, each with 0 of 3 votes for on; P04, P08, P09 had 2 of 3);
   mean paired score difference on-off +0.139 over 36 reader-pairs (novelist 0.000, socialworker +0.167, player +0.250);
   ordinal alpha 0.604, bootstrap 95% [0.346, 0.773] (2000 resamples, seed 1, scripts/alpha.py on units 2i-1, 2i = pair i's A, B; interval alpha 0.605 [0.369, 0.783]);
   readers preferred version B in 27 of 36 choices (novelist 8, socialworker 10, player 9) and 10 of 12 by majority; the on arm was B in 9 of 12.
   The `prefer` field agreed with the A/B scores in all 36 cases. My score file is identical to read31/scores.json.
7. Test battery (extra/test-on.txt, test-off.txt; printed values read, nothing recomputed): AGREES.
   births / deaths on 8.0 / 7.0 vs off 7.7 / 7.7; twists 23.6 vs 24.4; honest whys 70% (of 35381) vs 75% (of 35074).
   Bar "births/deaths within +-0.15": on 8.0/7.0 = 1.143 (the printed one-decimal values allow 1.128 to 1.158), off 1.000. On is inside the bar, 0.007 from the edge on the printed values.

Notes, not disagreements
- Claim 1: no slice is clearly negative at 95%; the not-a-couple interval excludes zero only at 90% (paired t p = 0.075 not-a-couple, 0.173 all, 0.141 key).
  14 of 20 worlds are negative on all decisions (range -5.3 to +4.2), 13 of 20 on not-a-couple, 11 of 20 on key (range -7.0 to +7.2). Decision counts are within 1% between arms, so the slices are like for like.
  The page-annotation reader on all decisions is -0.63 +-1.27; the not-a-couple figure is its more negative slice.
- Claim 2: unlike round 30 (reach +0.020 +-0.005), none of the on-off consequence differences is distinguishable from zero here. The rounded 0.06 vs 0.06 hides +0.0025.
- Claim 3: arcs per adult on-off paired +0.044 +-0.119, dead lives +0.003 +-0.018, median weighty events paired 0.0 (upper) / +0.15 (true) +-0.9: no difference by world. The headline contrast 0.44 vs 0.39 is a point estimate with overlapping intervals.
  "17.1 vs 17.1" holds for the upper median per world (17.15 each, prints 17.1 or 17.2 depending on rounding); with true medians it is 17.1 vs 16.9.
- Claim 4: the JSON has flipsCited 78 and citedByChoice 77 (I did not trace why they differ by one); worth knowing if both are quoted. 
  Re-running telling.ts checks reproducibility and the aggregation, not the tool's definitions (what counts as a flip, a misattribution, a bent account, or "honest"); I did not re-derive those from event logs.
  The reference telling-on.txt was made with the switch on by default; src/telling.ts in S/wt-sw has an uncommitted edit (switch now off unless ON=telling), which is why the rerun needed ON=telling.
  Account as honest top reason is 0.22% of decisions with another person, so 99.8% of them have another top reason.
- Claim 6 is a small sample (12 pairs, 3 readers); the alpha interval is wide. The reading is confounded with presentation order: readers gave version B higher scores than A by 0.47 on average and
  preferred B in 75% of choices, and the on arm was B in 9 of 12 pairs. Split by order, on-minus-off is +0.41 where on was B (9 pairs, on preferred by majority in 7) and -0.67 where on was A (3 pairs, on preferred by majority in 0).
  So the 7 of 12 majority and the +0.14 mean are both what a B-preference alone would produce; the pair-level mean difference (+0.139) has a 95% half-width of 0.52 over 12 pairs.
  The key and the A/B texts were taken as given; the assignment was not regenerated. The novelist's mean difference is exactly 0.
- Claim 7: births/deaths on the on arm moved away from 1 (deaths 7.0 vs 7.7 off) while the off arm is 1.00; the margin to the bar is thin and the bar is on a ratio of rounded means.
  Honest whys fall 5 points (75% to 70%) with the switch on; this is a tool statistic with no interval printed, the test runs are single runs of 20 worlds each.
