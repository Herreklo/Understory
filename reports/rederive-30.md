# Round 30: independent re-derivation of the headline numbers

Method: own Python (scipy t quantiles) over the raw files; summary files not used for numbers. Scripts in
`$S/audit30/` (board.py, cons.py, story.py, tellagg.py); S = the scratchpad. Interval method for all world-level numbers: mean over
worlds, 95% half-width = t(0.975, n-1) x sd / sqrt(n) (the same method round.mjs and the lives tools use; the 90% interval uses t(0.95, n-1)).

1. Scoreboard (20 worlds 2963-2982, calibrated witness `cal`, on minus off paired by world): AGREES.
   all decisions -1.31 +-1.27 (90%: -2.36 to -0.26; decisions 32334 / 33415); not a couple's -1.28 +-1.41 (24871 off, 23464 on);
   key slice -1.84 +-2.23 (90%: -3.68 to 0.01); page-annotation reader, not a couple's, -0.51 +-1.67. Within the on arm, key slice,
   calibrated minus notebook (`noteOrBase`) 4.15 +-1.09 (also: off 4.44 +-1.24; on all 2.01 +-0.78; off all 2.27 +-0.66; calibrated on key 58.9 / off 60.7).
2. Consequence map (seeds 3051-3070, 17910 sources on / 16976 off): AGREES. reaching someone outside the source on 0.0717 vs off 0.0517;
   any weighty descendant on 0.2469 vs off 0.2289 (pooled over sources: 0.0718/0.0517 and 0.2474/0.2289). Paired on-off: reach +0.020 +-0.005,
   weighty descendant +0.018 +-0.008 (both clear of zero). With a turn: 0.105 vs 0.098.
3. Blind reading: AGREES. Using the key (`onIs`) and the three answer files: on arm preferred by majority in 9 of 12 (P01, P07, P08 not);
   mean score difference on minus off +0.639 over 36 reader-pairs (novelist +0.50, socialworker +0.83, player +0.58);
   ordinal alpha 0.567 (bootstrap 95% 0.283 to 0.764, 2000 resamples, seed 1, scripts/alpha.py on my own 24 units x 3 readers),
   interval alpha 0.570 (0.259 to 0.764). Individual readers preferred on in 9 / 9 / 10 of 12 (novelist / socialworker / player).
4. Own count (re-ran telling.ts on 3051-3070, in four chunks of five seeds): AGREES, and the rerun is identical to telling-on.txt in every
   per-world array and every total (deterministic). told accounts per adult, median over worlds 1.59 (that is the upper of the two middle
   values; the true median of the 20 is 1.575); misattributed share 0.02158 (0.0216, told-weighted); bent share 0.26498 (0.265);
   account as top reason (honest) 94 of 22,990 decisions with another person = 0.409%; told accounts 31 = 0.135% (reported as 0.13%; rounds to 0.13).
   Total told accounts 3521.
5. Story (adults 25+, 20 worlds; on 1042 adults, off 1047): AGREES. arcs per adult on 0.494 +-0.104 vs off 0.369 +-0.084 (pooled over
   adults 0.498 / 0.368); weighty events per life, median of per-world medians (upper median) 17.2 +-0.8 vs 16.55 (+-0.64; the report prints 16.6; true medians 17.1 / 16.5).

Notes, not disagreements
- Claim 1's "REGRESSION" is razor thin: the paired upper bound of the 95% interval on all decisions is -0.04 points (paired t-test p = 0.044);
  11 of 20 worlds are negative, 9 are not (range -5.7 to +2.4). On the not-a-couple and key slices the interval includes zero.
  Decision counts differ by 3% overall (on has fewer), 6% on not-a-couple (on fewer), 1% on the key slice (on more), so the slices are close to like for like.
- Claim 5's story gains are not distinguishable from noise paired by world: arcs per adult on-off +0.12 +-0.13; median weighty events +0.65 +-0.96.
  The "own obstacle" arc measure is 0.317 vs 0.247. The headline contrast 0.49 vs 0.37 is a point estimate with overlapping intervals.
- Claim 4: re-running telling.ts checks reproducibility and the aggregation, not the tool's own definitions (what counts as a misattribution,
  a bent account, or "honest"); I read telling.ts (the event-side counts) but not the engine code that fills tellStats (told, wrong, bent), and did not re-derive any of it from event logs.
- The key (`onIs`) and the A/B text pairs were taken as given (pairs.txt in read30 and lab-run are byte-identical); the reading's arm
  assignment was not regenerated.
- Claim 3 is a small sample (12 pairs, 3 readers); the alpha interval is wide.
