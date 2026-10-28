# Re-derivation of round 48, the band year (tree d7d7096)

**Verdict: every number checked AGREES. No DIFFERS, no CANNOT CHECK.** The counter's one-sided 95% lower bound is +0.04 (above 0), and the pooled reading's lower bound is -0.29 (above -0.3, narrowly).

Raw files: `/Users/oystein/Documents/GitHub/lab-run-48/out-round-48/` (`norms/`, `board-on/`, `board-off/`) and `reports/48-reading-*-{key,answers}.json` in this worktree. Round scripts and summaries were not used for any figure.

## 1. The counter (primary)
- AGREES. Members who joined after the last founder went, five years on: on r 0.275 (n 415), tellless r 0.092 (n 178). Fisher-z difference 0.191, half-width 0.177, one-sided 95% lower bound +0.042. Claimed 0.28/0.09, 0.19 ±0.18, 0.04.
- AGREES. All members at five years: on r 0.529 (n 526), tellless 0.455 (n 214). (The z difference is 0.097 ±0.160, lower -0.037. This is reported only, not a gate.)
- AGREES. One-year counter: on r 0.768 (n 769); tellless 0.735 (n 301). The claim was 0.77, n 769.

## 2. Gate, fail-if 1
- AGREES. The answers the norm flips: 2,766 of 27,095 = 10.21%.

## 3. Fail-if 3
- AGREES. Held norm against make-up: r 0.223 (n 769 a year on); r 0.222 over all 4,684 bands alive at the end.
- AGREES. Matched bands on opposite sides: 2,778 of 4,808 = 57.78%. (2,400 of them are 0.5 or more apart.)

## 4. Fail-if 4 (200 pages-on against pages-off worlds, paired by seed)
- AGREES. Copy share on minus off: -0.020 ±0.187, one-sided bound +0.137. Claimed -0.02 ±0.19, 0.14.
- AGREES. Norm lines in a top 25: 0 (off: 0).
- AGREES. "Did not come to much": 22.715 on against 21.485 off, difference 1.23 ±1.87.

## 5. Fail-if 5
- AGREES. Pages-on: the witness knows 114 of 153 present-years acts a norm decided = 74.51%.
- AGREES. Found-on, 40 years: 739 of 2,766 = 26.72%.

## 6. Scoreboard (evaluation 3749-3768, 20 worlds, calibrated witness, on minus off, paired by world)
- AGREES. Not a couple's (row, row-answer, stay left out): +0.07 ±1.03 (t 2.093, df 19), 90% interval -0.78 to +0.92. Decisions 26,376 on / 26,654 off. Claimed 0.1 ±1.0, 90% -0.8 to 0.9.
- AGREES. All decisions: +0.06 ±1.15, 90% -0.89 to +1.01. Decisions 34,815 / 35,154. Claimed 0.1 ±1.1.

## 7. The readings
Per pair: the mean over the two readers (pooled across both sittings) of the on score minus the off score. The "on" version is read from the key's `onIs`. I regressed it on the order (+1 if on was B, -1 if A). The 95% half-width uses t at 0.975 and the lower bound uses t at 0.95, both on n-2 degrees of freedom.

| Pack | Effect | Half-width | Lower 95 | Order term | Ties (reader-pairs) | Claimed |
| --- | --- | --- | --- | --- | --- | --- |
| random | -0.312 | 0.280 | -0.545 | +0.104 | 24 of 48 | -0.31 ±0.28, -0.54: AGREES |
| busiest | +0.104 | 0.230 | -0.086 | -0.021 | 33 of 48 | +0.10 ±0.23, -0.09, ties 33: AGREES |
| random2 | +0.021 | 0.221 | -0.162 | +0.229 | 29 of 48 | +0.02 ±0.22, -0.16, ties 29: AGREES |

- AGREES. Pooled random + random2 (the order and the pack as terms; the packs weigh alike, 24 pairs each, df 45): -0.146 ±0.172, lower 95 -0.290. Claimed -0.15 ±0.17, -0.29. This is the deciding number: -0.290 is above the -0.3 bar by 0.010.
- AGREES. Pooled random + busiest: -0.104 ±0.175, lower 95 -0.250. Claimed -0.10 ±0.17, -0.25. (The half-width is 0.175 and rounds to either 0.17 or 0.18. Immaterial.)

## Notes for the reader of this report
- The deciding reading bound is close to the bar (-0.290 against -0.3). The margin comes from the t quantile and the model, not from the arithmetic. I used an exact t quantile (df 45: 1.679 one-sided, 2.014 two-sided), and the round's figure matches to the third decimal.
- The counter's bound (+0.042) is also close to 0. It rests on the 178 tellless bands.
- Limits on the check. The `found-*` files hold each band's already-reduced fields (`F`, `M`, `M5`, `M5new`, `M0`, `gone`, ...). The founders' monthly norm window is cleared in the file. So I recomputed the correlations, differences, gate counts and flips from those fields, but could not recompute `F` or `M5new` from the engine's month-by-month state. Those two definitions I took from `src/tools/diag/norms.ts`. I applied the selection (`F`, `M5` and `M0` all non-null; `M5new` non-null for the fresh-member counter) as that file's `fiveYear()` does.
- Not rechecked, because not on your list: the fail-if 4 tellers-per-newcomer count, `OFF=norms` identity with main (kept-if 1), `npm test`.

## Method and scripts
- Mean over worlds with t intervals for the scoreboard (accuracy of the `cal` guess equal to `chosen`, per world, 20 worlds, a slice needs 8 decisions per world; all met). Pearson r with Fisher z for the counters (one-sided 1.645). Paired t over the 200 seeds for the pages. OLS by normal equations, with t quantiles by numerical integration. No numpy and no scipy.
- Scripts, in the scratchpad `/private/tmp/claude-501/-Users-oystein-Documents-GitHub-Understory--claude-worktrees-wizardly-shirley-bb3638/cf6cfc5b-2f2d-4f1c-8008-d21960ab1fca/scratchpad/`: `a.py` (items 1-5), `b.py` (item 6), `c.py` (item 7), `np_shim.py` (a small mean and correlation helper).
- The engine was not run. Nothing in the repo changed except this file.
