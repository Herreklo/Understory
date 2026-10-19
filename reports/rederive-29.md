# Round 29: independent re-derivation

Own code (Python, kept in `$S/audit29/`: `board.py`, `cons.py`, `story.py`, `read.py`), computed from the raw files. No summary numbers used. All five claims agree.

| # | Claim | My number | Verdict |
| --- | --- | --- | --- |
| 1a | Scoreboard on − off, calibrated, all decisions | 0.646 ±1.548 (90%: −0.63 to 1.92); 34229 / 33266 decisions | agrees (0.6 ±1.5) |
| 1b | not a couple's (row, row-answer, stay left out) | 0.118 ±1.355 (90%: −1.00 to 1.24); 25789 / 24575 | agrees (0.1 ±1.4) |
| 1c | key slice (novel · contested · known) | 1.131 ±1.669 (90%: −0.25 to 2.51); 17422 / 16897 | agrees (1.1 ±1.7) |
| 1d | on arm, key slice, calibrated − notebook | 4.33 ±1.24 (calibrated 61.16 ±1.13) | agrees (4.3 ±1.2) |
| 2 | Consequence map, reach outside source, on / off | 0.0664 / 0.0529 (pooled 0.0664 / 0.0528) | agrees (0.07 / 0.05) |
| 2 | Any weighty descendant, on / off | 0.2374 / 0.2301 (pooled 0.2378 / 0.2300) | agrees (0.24 / 0.23) |
| 3 | Reading: majority prefers on | 3 of 12 pairs (P01, P02, P07); reader-level votes for on: novelist 4, socialworker 3, player 4 of 12 | agrees |
| 3 | Mean paired score diff on − off | −0.278 over 36 reader-pairs; novelist −0.167, socialworker −0.333, player −0.333 | agrees |
| 3 | Ordinal alpha | 0.710 (95% bootstrap 0.466 to 0.857); interval 0.726; my own independent ordinal implementation also gives 0.710 | agrees |
| 4 | Seen account as top reason / any seen account | 65 / 22290 = 0.29%; 535 / 22290 = 2.40% | agrees (see note) |
| 5 | Story: weighty events per life, median (mean of per-world medians), on / off | 17.05 / 16.75 (±0.75 / ±0.80) | agrees (17.1 / 16.8) |
| 5 | Story: dead lives, on / off | 0.056 / 0.048 (±0.015 each) | agrees (0.06 / 0.05) |

## How I computed things, and notes

- Scoreboard: from `board-{on,off}/eval-*.json`, per world accuracy = share of decisions where the witness's guess (`cal`) equals `chosen`, within the slice. The on − off difference is taken per world (20 worlds, 2071–2090, paired by seed). The interval is Student's t, 19 df: t = 2.093 for 95%, 1.729 for 90%, standard error from the sample standard deviation of the 20 paired differences. Same as `round.mjs`. Within-arm figures use "notebook" = the `noteOrBase` field. Points are accuracy x 100; 0.6456 rounds to 0.6.
- Consequence map: `out-cons/<seed>-<seed>.json` is the on arm, `accounts-<seed>-<seed>.json` the off arm (20 worlds each; 17163 / 17093 weighty sources). Shares are per-world means, as the tool reports them; pooling over all sources gives the same to two decimals. The reach difference (0.066 vs 0.053) is a real shift in the raw rows, but the summary's two-decimal rounding makes it look like 0.07 vs 0.05 when the gap is about 0.013.
- Reading: `onIs` from `key.json` maps each pair's on version; scores and preferences from the three reader files, which all cover all 12 pairs. Alpha computed with `scripts/alpha.py` on integer unit ids 1–24 (P01A, P01B, P02A, ...), seed 1 as in the script, 2000 bootstraps over units. Caveat, not a disagreement: the 24 "lives" are 12 pairs of versions of the same person, so the units are not independent and the alpha interval is probably a little narrow. The reading ran on worlds 3047–3050 (a different tree, 0e6c6fc, per the reading file), not on the battery's 3027–3046 lives.
- Count (claim 4): the raw per-event data is not saved in the output files, so the only file-level check is the arithmetic on the last line of `extra/accounts-on.txt` (65/22290 = 0.00292, 535/22290 = 0.02400). I also re-ran `src/tools/diag/accounts.ts` with `ON=accounts` on seeds 3027–3046 (four parallel jobs) and reproduced the totals exactly: decisions 33469, with another person 22290, any seen 535, seen top 65, and the same per-world `held` list. Note the working tree in `wt-sw` is now at 7f533cf with uncommitted edits to `src/accounts.ts` and `src/tools/diag/accounts.ts`, not the battery's tree 8d9b5d7, so this re-run is evidence the count is reproducible from the code as it stands, not from the exact tested tree. Also, "top reason" requires `decision.honest === true` (the counterfactual check), which the claim's wording does not mention.
- Story: from `out-story/{on,accounts}-*.json`, per world the median is the sorted `weighty` list at index floor(n/2) (the tool's definition; the true median is about 0.1 lower, 16.95 / 16.70), then mean over 20 worlds with the same t interval. Dead lives = share of adults with fewer than 5 weighty events; I recomputed it from the per-person list and it matches the stored `dead` count. Pooled over all ~1065 adults per arm the median is 17 in both arms.
- Interpretation note (not a disagreement): the key-slice gain (1.1 ±1.7), the all-decisions gain and the story differences are all inside their own intervals; I did not test the reach-outside-source difference or the readers' −0.28 for significance.
