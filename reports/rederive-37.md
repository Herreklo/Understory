# Round 37: independent re-derivation of the headline numbers

Method: own Python (scipy t quantiles; numpy least squares) over the raw files; summary.md and score.txt used only to know which claims to check. Scripts in
`$S/audit37/` (board.py, lift.py, cons.py, story.py, story2.py, friends.py, aftermath.py, extra.py, blind.py, lines.py, quotes.py, packcheck.py, visible.py, aftdec.py,
pop_check.py, lines_check.py; `out-*.txt` are their printed results; `rerun/` holds the engine reruns; `tree/` is a private copy of wt-r37's src with two temporary
diagnostics, `_a37pop.ts` and `_a37lines.ts`; nothing outside audit37/ was touched); S = the scratchpad.
Interval method for world-level numbers: mean over worlds, 95% half-width = t(0.975, n-1) x sd / sqrt(n); 90% interval uses t(0.95, n-1).
Arm labels in the raw files: board-on / board-off; out-cons digit-named files = on, `aftermath-*` = off (OFF=aftermath); out-story and out-friends `on-*` = on, `aftermath-*` = off.
Labels checked against content, not names:
- board-on holds 1450 `aftermath` decisions, board-off none (the only other on-only trigger is one "@ is leaving").
- out-story holds 1488 `aftermath` decisions in `on-*`, none in `aftermath-*`.
- out-cons has 513 `situation:aftermath` source rows (276 takeup, 136 keepaway, 101 startover) in the digit files and none in `aftermath-*`.
- out-friends has nothing self-labelling, so I rebuilt the worlds: for seeds 3357-3376, my rerun without a switch and my rerun with OFF=aftermath each match the
  town size, births, deaths and adult count of `on-*` and `aftermath-*` respectively in 20 of 20 worlds (crossed, 0 of 20 match). `out-pop-check.txt`.
- test-on.txt lists "startover" among the lottery types, test-off.txt does not.
- The pack text: all 24 lines carrying the aftermath reasons ("it hit hard", "it had shaken her/him", "it happened at work", "is there too") sit in the version the key calls on, none in the version it calls off.
- coherence-on / coherence-off cannot be told apart by content (identical but for the timing line, 99s / 100s).
Battery tree: summary says 21523b0. wt-r37 is at abe2f35; `git diff 21523b0 HEAD -- src scripts` touches only scripts/pairscore.py and src/tools/diag/pairarm.ts, so the engine is the same (and the reruns below reproduce the round's files byte for byte).

1. Scoreboard (20 worlds 3337-3356, calibrated witness `cal`, on minus off paired by world): AGREES.
   all decisions -0.206 +-1.510 (90%: -1.45 to +1.04; decisions 35089 on / 33194 off); not a couple's (row, row-answer, stay left out) -0.790 +-1.821 (90%: -2.30 to +0.71; 26153 / 24387);
   key slice (novel, contested, known) -0.124 +-1.740 (90%: -1.56 to +1.31; 18267 / 16831). Page-annotation reader (`text`), not a couple's, -0.765 +-1.792 (summary -0.8 +-1.8); all decisions -0.230 +-1.617.
   Verdicts follow from the 90% intervals: all and key lie inside +-2; the not-a-couple's interval reaches -2.30, so "not shown either way" is right (its 95% interval is -2.61 to +1.03).
   Paired-t p 0.78 / 0.38 / 0.88; negative worlds 10 / 11 / 9 of 20.
2. Within the arms (mean over worlds, 95%): AGREES, every cell.
   on, all: calibrated 62.15 +-1.00, minus notebook 3.28 +-0.86, minus tendency 3.90 +-1.13; on, key: 60.47 +-1.11, 5.49 +-1.01, 5.17 +-1.41.
   off, all: 62.36 +-1.18, 2.93 +-0.81, 4.72 +-0.75; off, key: 60.59 +-1.27, 5.30 +-1.21, 6.05 +-1.24.
   Lift as a share of the base-rate-to-mind-reader gap, (cal - base) / (mind - base): on all 0.263, on key 0.256, off all 0.271, off key 0.254 (summary 26 / 26 / 27 / 25%; mean of per-world ratios 0.260 / 0.254 / 0.270 / 0.246 gives the same roundings).
   Calibrated minus notebook, key, on minus off paired: +0.20 +-1.49 (90%: -1.03 to +1.43); the gap is above zero in both arms.
3. Story (adults 25+, worlds 3357-3376; 1005 adults on, 1006 off): AGREES, every printed line.
   dead lives 0.0305 +-0.0092 vs 0.0286 +-0.0101 (31 vs 29 lives; recount from weighty < 5 equal); weighty events per life, the tool's median (upper median per world) 18.40 +-0.86 vs 17.00 +-0.97 (true medians 18.35 vs 16.90);
   callbacks 0.292 +-0.010 vs 0.274 +-0.007; repeats 0.250 +-0.010 vs 0.241 +-0.010; distinct kinds per life 14.53 +-0.49 vs 13.69 +-0.39; adults with a named rival 0.193 +-0.036 vs 0.204 +-0.031;
   arcs per adult 0.411 +-0.097 vs 0.460 +-0.072; adults with an arc 0.209 +-0.033 vs 0.237 +-0.027; round 19d block: dead 0.008 +-0.005 vs 0.006 +-0.004, repeats 0.344 +-0.010 vs 0.336 +-0.011,
   arcs (own obstacle) 0.248 +-0.066 vs 0.313 +-0.059, adults with an arc (own obstacle) 0.167 +-0.029 vs 0.198 +-0.032; kinds in the town 147.9 +-3.8 vs 142.6 +-2.9;
   sore spot or fear as a reason per world 12.55 +-3.00 vs 12.95 +-3.19; rule to live by 20.75 +-5.54 vs 28.65 +-7.87; humour 30.10 +-3.37 vs 28.05 +-2.92.
   Decision kinds: 141 vs 142 (raw trigger names), entropy 4.682 vs 4.609 bits; top six on row 15, row-answer 10, obligation 8, support 6, collection 6, provocation 5; off 16, 11, 8, 7, 6, 5 (all as printed).
   Paired on-off: median weighty events +1.40 +-1.09 (p 0.014); arcs per adult -0.049 +-0.099 (p 0.31); dead -0.002 +-0.013 (p 0.76); rule-to-live-by acts -7.9 +-7.4 (p 0.037); sore spot -0.4 +-4.9; humour +2.1 +-2.9.
4. Friends (worlds 3357-3376; on 1298 adults, off 1290): AGREES, every printed line.
   close friends per adult median 4 vs 3 (true medians equal), top tenth 11 vs 10, most 26 vs 24, none 14.0% vs 13.0% (means 4.83 vs 4.45); made per adult a year 0.324 +-0.024 vs 0.287 +-0.016; ended 0.281 +-0.032 vs 0.262 +-0.033;
   year-0 friendships ended 407 of 2221 = 18.3% vs 335 of 2034 = 16.5%; friendship lines 2105 vs 1843; reasons on 26 / 24 / 22 / 18 / 12 / 11%, off 27 / 26 / 21 / 19 / 14 / 10%; familiar pairs where one dislikes the other 5.99% vs 5.45% (printed 6.0 / 5.4);
   aged 18-29 with no friend in town 33 of 145 = 22.8% vs 34 of 152 = 22.4% (printed 23% / 22%); contact to the top five, median 55.9% vs 56.1%; strain of the least-contacted tenth 0.083 +-0.035 vs 0.089 +-0.040 (printed 0.08 +-0.03 / 0.09 +-0.04),
   paired -0.006 +-0.053 (printed -0.01 +-0.05); births / deaths 1.717 +-0.985 vs 1.035 +-0.213 (printed 1.72 +-0.98 / 1.04 +-0.21: the tool's t table uses 2.09 for 19 df); population 81.6 +-3.9 vs 80.7 +-4.0.
   Which block is which arm: the first block ("on:") is the `on-*` files; the second, labelled "aftermath:", is `aftermath-*` = OFF=aftermath. The header line above both blocks ("on / nobudget (OFF=budget)") is fixed text in src/tools/friends.ts and does not describe these data (as in rounds 33-34).
   Paired on-off: made per adult a year +0.037 +-0.021 (p 0.001); ended +0.019 +-0.039 (p 0.32); mean close friends per adult +0.37 +-0.30 (p 0.018); population +0.9 +-3.5; births / deaths +0.68 +-0.92 (p 0.14).
5. Consequences (worlds 3357-3376; 17568 sources on, 16887 off): AGREES.
   any weighty descendant 0.2329 +-0.0058 vs 0.2282 +-0.0065 (summary 0.23 / 0.23, +-0.01 / +-0.01); with a turn 0.0926 +-0.0056 vs 0.0969 +-0.0062 (0.09 / 0.10); reaching someone outside the source 0.0522 +-0.0041 vs 0.0548 +-0.0046 (0.05 +-0.00 / 0.05 +-0.00);
   chain depth, by the tool's rule on the pooled depths: median 0, 90th 1, max 7 on; median 0, 90th 1, max 6 off (as printed).
   Paired on-off: weighty descendant +0.0047 +-0.0088 (p 0.28); turn -0.0043 +-0.0057 (90%: -0.0090 to +0.0004; p 0.13); reach -0.0027 +-0.0042 (p 0.20).
6. The round's own count (extra/aftermath-on.txt, aftermath-off.txt; worlds 3357-3376): AGREES.
   Lives changed within three years of a blow: 913 of 1278 = 71.44% on; 681 of 1321 = 51.55% off (printed `changedShare` equal to four places; `byBlow` sums equal blows and changed in both files).
   Paired by world from the perWorld arrays: +19.09 +-6.62 points (95%; 90% +-5.47), 18 of 20 worlds up, paired t p 8e-06, sign test p 4e-04; pooled difference +19.89 points. The two worlds that go down are 3366 (-9.8) and 3373 (-1.0); the largest is +45.8.
   Aftermath decisions 1488 = 74.4 a world-decade (the out-story `aftermath` trigger count is also 1488); takeup 440, carryon 672, keepaway 226, startover 150; changes 816 of 1488 = 54.84%. The off arm has 0 decisions.
   Aftermath lines 748, trait or self-story reasons 0: AGREES, and re-derived without the tool's own test. `aftermath.ts 3357 3376` rerun with and without OFF=aftermath is byte-identical to aftermath-on.txt and aftermath-off.txt (including the printed sample lines).
   My own script (`_a37lines.ts`, counts every startover / takeup / keepaway event in the present years and lists the cause kinds and labels of those on someone's page): 816 acts, of which 748 are listed on a page (startover 144, takeup 396, keepaway 208; the 816 split 150 / 440 / 226 = byKind).
   Every cause of those 748 is an `event` (the blow, 748) or a `state` (883 = "it hit hard" 383, "it had shaken her" 208, "it had shaken him" 157, "it happened at work" 118, "is there too" 17); no cause of kind trait, none keyed identity, none of any other kind. 613 lines carry 2 reasons, 135 carry 3.
   Not checkable from the files alone: how the blows and "changed" are defined (aftermath.ts `blowsOf`, `mark`); the 68 acts (816 - 748) that are not listed on any page.
7. Blind reading (key `onIs`, 24 pairs P01-P24 from worlds 3377-3384, 3 per world; answers read37/{novelist,socialworker,player}-{1,2}.json, two sittings joined; 3 readers): AGREES, every figure.
   On arm was version B in 12 of 24; readers chose B in 35 of 72. Majority on in 12 of 24 (P02, P03, P06, P08, P09, P16, P17, P18, P19, P20, P21, P24; 39 of 72 votes).
   Mean paired difference on minus off +0.0417 +-0.4846 (95%, 24 pair means; summary +0.04 +-0.48); novelist -0.125, player +0.042, socialworker +0.208 (printed -0.12 / +0.04 / +0.21).
   Own least squares on the 24 pair means, difference = effect + lean x side (+1 when on is B, -1 when A), 22 df, Student t: effect +0.0417 +-0.4881 (95%), one-sided 90% lower bound -0.2693, lean (B minus A) -0.2083 +-0.4881 (p of the effect 0.86).
   (Equal to the two-group means: on is A +0.250 over 12 pairs, on is B -0.167 over 12 pairs; majority on in 6 of each.)
   Lines a page: 72.71 on / 74.04 off, on minus off -1.33 a pair (sd 26.98); kinds a page 40.17 / 39.75, +0.417 a pair (sd 12.85); both from key.json, and both equal the pack's top-level line counts (0 mismatches in 48 versions).
   With the order and the kinds difference as terms (21 df): effect +0.0196 +-0.4055; a kind more +0.0530 +-0.0331. With the lines difference: effect +0.0635 +-0.4654; ten lines more +0.164 +-0.185. Where versions are 5+ lines apart the longer was chosen 38, the shorter 25 (9 nearer).
   Faults, by reader quotes: on 216 (unfit reason 57, false line 52, repeat 50, out of nowhere 31, wording 26); off 215 (false line 67, repeat 45, unfit reason 42, wording 34, out of nowhere 27).
   Quotes matching the round's reason wording ("it hit hard", "it had shaken her/him", "it happened at work", "is there too", "to start again somewhere else"): on arm good 17 (novelist 5, socialworker 9, player 3), faults 1 (P13 novelist, unfit reason: "Audrey now plays cards at the Anchor ..."); off arm 0 and 0. Matches score.txt for the on arm.
   score.txt also says "off arm: good 1, faults 6"; that needs a broader pattern than the reason wording (it also catches the act wording "is no longer", "now practises", "walked out of"): with those added I get on 17 / 1 and off 1 / 6 exactly. The pattern used is not recorded in the files (see notes).
   Ordinal alpha 0.671 [0.516, 0.774], interval alpha 0.674 [0.541, 0.773] (own implementation, 48 texts x 3 readers, 2000 bootstrap resamples, seed 1). `scripts/pairscore.py` run on the same files reproduces every field of score.json except the `quotes` field's regex.
8. Test battery, coherence, props (printed values read; nothing recomputed): AGREES with each claim.
   Coherence: 0 on all twelve lines in both arms (seeds 3377-3384, eight worlds, ten present years; the sum of the twelve counts is 0 in both JSON lines).
   Props: props-on.txt reads "50 worlds (seeds 9201-9250, 3 present years), every property holds"; on arm only.
   test-on / test-off (20 worlds x 10 years, per world-decade; seeds not printed): pop 82 / 81 (adults 65 / 65); births 8.4 / 8.5, deaths 7.2 / 8.8, marriages 4.2 / 4.3, splits 4.5 / 4.9; hires 21.9 / 12.8 (+71%), fires 1.5 / 0.8, quits 1.9 / 1.3, left 7.9 / 6.5, home 4.3 / 4.8;
   twists 31.6 / 23.7 (+33%), reveals 3.4 / 2.5, lottery 16.1 / 17.1; witness right 59% / 60% on all decisions; honest whys 74% of 34988 / 75% of 34450.

Notes, not disagreements

- Claim 1: the gate row the BOARD names (decisions that are not a couple's) is the one not shown equivalent: point estimate -0.79 inside +-2, 90% interval -2.30 to +0.71. The on arm has 5.7% more decisions (35089 vs 33194), the difference being the aftermath's own: 1450 `aftermath` decisions only on (4.1% of on; 949 in the key slice = 5.2%),
  on which the calibrated witness is right 51.9% (base 49.7, notebook 45.9, page reader 51.9, mind-reader 74.5) against 62.5% on the on arm's other decisions. Leaving the triggers that exist only on out (aftermath and one "@ is leaving"):
  all decisions +0.235 +-1.507 (90%: -1.01 to +1.48; 33638 / 33194), not a couple's +0.125 +-1.843 (90%: -1.40 to +1.65; 24702 / 24387), key +0.275 +-1.759 (90%: -1.18 to +1.73; 17317 / 16831). So the negative point estimates come from the new decisions being harder to predict, not from a change in the older ones.
  Other triggers that move most (on / off): support 2178 / 1995, row 5433 / 5281, collection 2035 / 1892, oldwound 983 / 1110, reachout 1079 / 952, grudge 589 / 499, request 1138 / 1220.
- Claim 5: 513 of the 17568 on-arm sources (2.9%) are the aftermath's own `situation:aftermath` rows; none has a weighty descendant, a turn or a reach (0 of 513), so they sit in the denominator with nothing following them. Without them:
  weighty descendant 0.2399 vs 0.2282 (+0.0117 +-0.0091, p 0.015), turn 0.0953 vs 0.0969 (-0.0015 +-0.0058, p 0.59), reach 0.0537 vs 0.0548 (-0.0011 +-0.0043, p 0.60). The on arm has 4.0% more sources (17568 vs 16887).
- Claim 6: the +19 points is a measure that counts the aftermath's own acts as change (a routine formed or broken, a job left): `byWhat` on vs off: habits 719 vs 473 (+246), job 286 vs 163 (+123), partner 175 vs 172, group 64 vs 48, being in town 57 vs 81, music 6 vs 15; the extra habits and jobs are what the 816 acts would produce.
  Not every blow type is higher on: dressdown 6/7 = 85.7% on vs 17/19 = 89.5% off; passed 12/12 vs 3/3 equal; the other eight are higher on (e.g. death 77.4% vs 48.2%, caught 85.5% vs 47.9%, want:failed 81.4% vs 60.9%, rake 74.6% vs 54.5%, cooled 59.8% vs 43.0%); the small types are 7, 12, 3, 11, 20 blows. Blows faced differ (1278 vs 1321) because the worlds diverge.
  The `followed` field is 0 in both files; it is not the blows-followed count (that is `blows`). The 748 vs 816 gap: 68 acts are not listed on any page.
- Expectation 3 (pre-registration): "No aftermath line gives a trait or the self-story ... (counted on the reading's worlds)". The count in aftermath-on.txt is on worlds 3357-3376 (the lives worlds), not the reading's worlds 3377-3384, and extra/aftermath-reading-on.txt is an empty file (0 bytes). On the reading's pack the same holds by direct inspection: of the 24 aftermath-marked lines in the on versions (17 of 24 pairs), the only reasons after the blow are "it hit hard" / "it had shaken her" (9 / 15), once "it happened at work", once "<name> is there too".
  The second half of expectation 3, kinds of line a life on minus off "+1.5 to +4", is +0.42 on the reading's people (sd 12.85, 12 pairs up, 12 down), outside the band.
- Claim 7: the one-sided 90% lower bound is -0.27, so expectation 5 ("above 0") is not met on my figures either. Unfit quotes at most 3 (1) and good at least as often (17) are met. Only 17 of 24 on versions show an aftermath-marked line (not P01, P09, P11, P21, P22, P23, P24); mean on-off is +0.255 in those 17 pairs (majority on in 9 of 17) and -0.476 in the other 7 (majority on in 3 of 7).
  Reader-pairs: on higher 26, off higher 25, tied 21 (sign test 1.0); the `prefer` field never contradicts the scores (0 of 72) and decides the 21 ties (13 for on, 8 for off), so the 12 of 24 is helped by the ties; exact two-sided p for 12 of 24 is 1.0. Treating the 72 reader-pairs as independent gives +-0.29 (70 df), too narrow; clustering by pair gives +-0.48 (23 df) as the pair-mean fit does.
  The act wording ("is no longer ...", "now practises ...") also occurs in the off arm (the engine's ordinary habit lapses: P14, P17, P24 off), so only the reasons identify the aftermath's acts.
- Claim 4: the births / deaths ratio is carried by two worlds in the on arm: 3373 (10 births, 1 death = 10.0) and 3374 (17, 5); the paired difference is +0.68 +-0.92 (p 0.14), not distinguishable. Pooled births / deaths 166 / 144 on, 168 / 176 off.
- Claim 8: the three test files are single runs with no interval; none of the differences can be tested here. Hires +9.1 a world-decade is consistent with the 150 startovers in 20 worlds (7.5 a world-decade); the twists rise (+33%) and the splits fall (-8%) are not explained by the raw files.
  The coherence run is eight worlds (3377-3384, 99s / 100s), the reading's worlds; round 34's was four.
- The re-derivation checks reproducibility and aggregation of the tools' counts and re-runs the engine for the round's own count and the arm labels; it does not re-derive the calibrated predictions (`cal`) from the engine (recorded values in the eval files), the story / friends / consequence tools' definitions, or the cold reading's independence (that the readers were not told the arm is not derivable from the files).
