# Round 41: independent re-derivation of the headline numbers

Verdict: every printed figure AGREES with my re-derivation from the raw files (no engine rerun). All four pre-registered keep-rule items are met on these numbers. Points that need care are marked CARE:
1. Scoreboard: AGREES.
2. Floor: AGREES (5 on / 2804 off, 0.18%, far inside a tenth); kinds a life AGREES.
3. Blind readings: AGREES on both packs, every figure. Bar (lower bound above -0.3): busiest +0.041, random -0.003; both met. CARE: random's lower bound is -0.003, i.e. zero to three decimals, and neither pack's effect is distinguishable from 0 (p 0.139 / 0.204). CARE: fault counts are saturated by the brief's cap (below), so "faults on 215 / off 215" is largely the cap, not a finding. The pre-registered expectation "fewer faults quoted on" is NOT borne out (215/215, 214/201), which is the round's own "would change our minds" case.
4. Extras: ident, coherence, props AGREE; npm test passes (finished, exit 0).

Method: own Python (scipy t quantiles, numpy least squares) over the raw files; summary.md, score-busiest.txt, score-random.txt used only to know which claims to check. Interval method: mean over worlds, 95% half-width = t(0.975, 19) x sd / sqrt(20); 90% uses t(0.95, 19). Blind readings: 24 pair means (mean over three readers of on-score minus off-score), least squares of pair mean on [1, side] (side +1 when on is B), df 22; one-sided 90% lower bound = effect - t(0.90, 22) x se, t = 1.3212.
Scripts in `$S/audit41/` (board.py, lift.py, kinds.py, blind41.py, fcount.py, quotes.py, labels.py), S = /tmp/claude-0/-home-claude/59c97036-e2eb-5144-a7b2-5c679896d5d8/scratchpad. Nothing outside audit41/ was changed (reads only; the frozen tree wt-r41 and the running npm test were not touched).

## 1. Scoreboard (out-round-41/board-on, board-off; eval worlds 3545-3564; calibrated witness `cal`; on minus off paired by world)
AGREES, every figure and verdict:
- all decisions -0.020 +-1.292 (90%: -1.09 to +1.05); decisions 34435 / 34768; 9 of 20 worlds negative; paired-t p 0.975. Printed "-0.0 +-1.3".
- not a couple's (row, row-answer, stay left out) +0.541 +-1.017 (90%: -0.30 to +1.38); 26034 / 26308; 6 of 20 negative; p 0.279. Printed "0.5 +-1.0, -0.3 to 1.4". The 90% interval lies inside +-2: "equivalent within +-2" holds, with 0.30 on the low side and 0.62 on the high side to spare.
- key (novel, contested, known) -0.976 +-1.535 (90%: -2.24 to +0.29); 17448 / 17308; 11 of 20 negative; p 0.199. Printed "-1.0 +-1.5, -2.2 to 0.3". The 90% interval crosses -2 (low end -2.24), so "not shown either way" is the correct verdict; the gate row is the not-a-couple's slice, which holds. (Key slice, cal minus notebook, on minus off: -0.329 +-1.685, not printed.)
- page-annotation reader (`text`), not a couple's: +0.180 +-1.046 (summary 0.2 +-1.0). All decisions: -0.019 +-1.330.
- Within arms (mean over worlds, 95%): on all 62.189 +-1.036, minus notebook 3.309 +-0.854, minus tendency 4.133 +-0.856; on key 58.904 +-1.239, 4.890 +-1.244, 5.329 +-1.346; off all 62.209 +-1.369, 3.364 +-1.197, 4.120 +-1.382; off key 59.880 +-1.648, 5.219 +-1.819, 5.188 +-1.680. All match the summary table.
- Lift share (cal - base) / (mind - base), ratio of means: on all 0.264, on key 0.236, off all 0.274, off key 0.251 (summary 26 / 24 / 27 / 25%).
- On-only triggers: 'whether @ should be owner one day' 7 and 'head mechanic one day' 2 decisions, none off. Dropping them moves nothing (all -0.031, not a couple's +0.529, key -0.976).
- Arm labels checked against content: out-cons has 18234 source rows in the digit-named files (summary "on") and 17937 in `fit-*` (summary "OFF=fit"); both match the summary. Decision counts per arm match the eval logs' direction (board-on 34435, board-off 34768). The page wording in the blind packs and the faults files tells the arms apart (section 2/3), consistent with the labels. board-on/off themselves carry no self-label in the JSON; the label rests on the consequences counts, the eval logs and the pack content.

## 2. The floor (extra/faults-on.txt, faults-off.txt; adults of 3565-3584)
AGREES. Last line FAULTS: total 5 on (1358 adults, 53999 lines), 2804 off (1341 adults, 52471 lines). Per-world totals sum to 5 and 2804 (checked). 5 / 2804 = 0.18%; the floor "on at most a tenth of off" (limit 280) is met by a factor of 56.
- On: all five are "Instead," lines with no earlier way cited (insteadUncited 5, in worlds 3572, 3573, 3575, 3583, 3584); every other class 0. (Same type the pre-registration expected: three on the sizing worlds.)
- Off by class: stoppedSeeing 1368, workNoJob 581, nothingChanged 543, neededSaying 227, foldNote 202, decimalYears 168, stoppedBringing 111, houseFor 34, oneYears 33, insteadUncited 26, itSong 24, hatchetYear 17, babyNotBaby 7, worstThe 6 (sum 2804). Faults a world 140.2 off vs 0.25 on.
- Kinds a life (kinds-on.txt, kinds-off.txt, worlds 3565-3584, paired by world, 95%): every adult on 25.025, off 24.820, on minus off +0.205 +-1.024 (printed +0.21 +-1.02; 11 of 20 higher on; p 0.68). The busiest three: 45.267 / 46.383, -1.117 +-2.727 (printed -1.12 +-2.73; 8 of 20 higher on). Lines of the busiest +0.634 +-6.091. No floor on kinds is set in the pre-registration, only the sizing (-0.23 +-0.74, -0.8 +-3.1); the fresh figures sit inside the sizing intervals.

## 3. The two blind readings
Both keys cover 24 pairs P01-P24 (busiest: worlds 3585-3592, three per world; random: 3593-3600); every reader (novelist, social worker, player) has both halves of each pack (P01-P12, P13-P24); all scores integer 1-5; both versions scored; pack versions match the key by pair, header name and top-level line count (0 mismatches in both packs).
Arm labels checked against content (page wording the round introduced): "nothing brought them together any more" on 17 lines in the busiest key-on versions, 0 in key-off; "could be hard on people" 12 / 0; "a small child at home" 2 / 0. Random: 15 / 0 and 7 / 0. The old "stopped seeing each other" is 16 on vs 59 off (busiest), 13 vs 43 (random). The key's on/off is consistent with the content.

### a. Busiest: AGREES, every figure
- on was version B in 12 of 24; readers chose B in 31 of 72; majority preferred on in 14 of 24 (43 of 72 votes for on).
- Unadjusted: +0.2917 +-0.3878 (95%, df 23; printed +0.29 +-0.39). By reader: novelist +0.292, player +0.458, social worker +0.125.
- With the order as a term (df 22): effect +0.2917 +-0.3937 (95%, se 0.1898; p 0.139); one-sided 90% lower bound +0.0408 (printed +0.04); lean -0.1250 (printed -0.12).
- Bar (lower bound above -0.3): MET, margin 0.34. Above 0 ("reads better"): yes by +0.04, thin.
- Lines a page 75.21 on / 66.75 off (+8.46, sd 26.05); kinds 42.54 / 38.42 (+4.12, sd 13.65). With order and lines: +0.110 +-0.336, ten lines +0.215 +-0.125; with order and kinds: +0.090 +-0.287, a kind +0.049 +-0.021. All as printed. Longer version chosen 36, shorter 27, 9 nearer.
- Faults by kind: on 215 (unfit reason 64, false line 61, repeat 48, out of nowhere 24, wording 18); off 215 (unfit 51, false 47, repeat 43, wording 38, out of nowhere 36). As printed.
- Quotes matching the round's wording regex (read41/quote-regex.txt): on 11 faults (false line 8, out of nowhere 2, unfit reason 1) and 1 good; off 0 faults, 3 good. As printed.

### b. Random: AGREES, every figure
- on was version B in 12 of 24; readers chose B in 46 of 72; majority preferred on in 12 of 24 (36 of 72).
- Unadjusted: +0.3194 +-0.4954 (printed +0.32 +-0.50). By reader: novelist +0.375, social worker +0.375, player +0.208.
- With the order as a term (df 22): effect +0.3194 +-0.5060 (se 0.2440; p 0.204); one-sided 90% lower bound -0.0029 (printed -0.00); lean +0.0972 (printed +0.10).
- Bar (lower bound above -0.3): MET, margin 0.30. Above 0: NOT shown (lower bound -0.003, interval includes 0).
- Lines 49.83 / 45.08 (+4.75); kinds 29.08 / 26.71 (+2.38). With order and lines +0.155 +-0.408 (ten lines +0.346 +-0.187); with order and kinds +0.132 +-0.328 (a kind +0.079 +-0.028). As printed.
- Faults: on 214 (unfit 76, repeat 40, false 38, out of nowhere 35, wording 25); off 201 (unfit 55, false 51, repeat 41, out of nowhere 30, wording 24). As printed.
- Quotes matching the round's wording: on 5 faults (false line 2, unfit 2, out of nowhere 1) and 2 good; off 4 faults (wording 2, repeat 2) and 0 good. As printed.

### Faults per version (the brief allows up to three per reader)
Exactly three faults were quoted by a reader for a version in 142 of 144 reader-versions on the busiest pack (the other 2 had two, both player; by arm 71 + 71 at three, 1 + 1 at two) and 133 of 144 on random (0 faults: 1; one: 4; two: 6; by arm on 70 at three and 2 at two; off 63 at three and 9 below three). No reader exceeded three. So the count is at the cap in 99% (busiest) and 92% (random) of cases: the totals 215/215 and 214/201 are mostly 3 x 72 x 2 minus a few, and cannot show fewer faults on than off until the cap is raised or readers quote only real faults. (Check: 142 x 3 + 2 x 2 = 430 = 215 + 215; 133 x 3 + 6 x 2 + 4 = 415 = 214 + 201.)
CARE: since the quote cap binds, the kind mix is the only informative part. On random, "unfit reason" is 76 on vs 55 off (+21), which is the stock-trait-reason fault the pre-registration names as the next step; On the busiest pack "unfit reason" is also higher on (64 vs 51) and "false line" (61 vs 47); "wording" (18 vs 38) and "out of nowhere" (24 vs 36) are lower on.

## 4. Extras
- Identity (extra/ident.txt): "on/11, on/12, on/13: identical", "all identical"; baseline extra/ident-main.json (hashes for 11, 12, 13) built at main 968d2df (extra/ident-main-commit.txt: "968d2df (main after round 40)"; wt-r41 log: 968d2df is the parent merge of round 40; round tree eba5885). AGREES as far as the files go. CARE: ident.txt does not record the environment, so that fit was off in the check is inferred, not read: ident.ts keys the default arm "on/<seed>", and the check can only say "identical" with the round's change off, since fit alters words on every world (2804 faults off, 5 on). I did not rerun the engine, so I cannot re-derive the hashes myself (same as round 40's method for the main baseline, here read-only).
- Coherence (coherence-on.txt, coherence-off.txt, seeds 3585-3600, ten present years): all twelve classes 0 in both; the two files differ only in the timing line (210s / 208s), so the arm labels are by name only. AGREES. The npm test run also carries seeds 11-12: twelve zeros.
- Props (props-on.txt): "50 worlds (seeds 9201-9250, 3 present years), every property holds" (1024s). AGREES.
- npm test (npmtest-on.txt): FINISHED when I last read it (11:44 Oslo), "npm test exit 0". Passes: tsc, build, browser-check, replay (8205 events identical), twoworlds, grouptest, boundarytest, mathtest, sigtest, invariants; "demography ok" at births 6.8, deaths 10.4 a world-decade (ratio 0.65, as sized in the pre-registration); props 5 worlds 9201-9205 every property holds; coherence seeds 11-12 all zero. AGREES.
- Also read: test-on.txt / test-off.txt (the 20-world sizing readout) exist but were not part of the claims and not checked.

## Anything that looks wrong
Nothing in the numbers. Three reading cautions, all about how the round will be described, not about arithmetic: (1) the blind-reading result is "no worse" on both packs and not "better" on random (and only +0.04 on busiest); (2) the pre-registered expectation that readers quote fewer faults on is not met and the cap at three hides how far; (3) the key-slice scoreboard row is "not shown either way" (90% low end -2.24), though the gate rows hold.
