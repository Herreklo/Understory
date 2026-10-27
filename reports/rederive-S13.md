# Re-derivation of S13 (refit on r45)

Verdict: all claimed numbers AGREE. No DIFFERS. Two notes below.

Method: own Python (stdlib only, `-I`) reading `out-s13/test-new.jsonl`, `test-old.jsonl`, `transitions.jsonl`. Gap = mean over 10 seeds of (t3.bg - t3.focus); t interval 2.262 with 9 df. Scripts: `/private/tmp/claude-501/-Users-oystein-Documents-GitHub-Understory--claude-worktrees-r45-neutral-f75957/40debf00-ec5c-4a94-b905-7910d57cd021/scratchpad/rd.py` and `.../t4.py`. I did not run or import report7.py or fit.py.

| # | Number | Claimed | Mine | Agree |
| --- | --- | --- | --- | --- |
| 1 | Capacity over / leaderless / bgStaffLivingElsewhere, cap0 and cap1, 10 cities, both arms | all 0 | all 0 | AGREES |
| 2 | Coarse-full gaps new: under20 / over65 / partnered / working / drinks | -4.4 / +1.0 / -3.2 / +1.1 / +0.9 | -4.44 / +1.02 / -3.18 / +1.12 / +0.94 | AGREES |
| 2 | Same, old | -4.7 / +1.9 / -0.7 / +2.8 / +0.7 | -4.75 / +1.93 / -0.74 / +2.85 / +0.75 | AGREES |
| 2 | Kids per adult 40, ratio of means (new / old) | 0.72 / 0.72, fails | 0.716 / 0.722, fails (outside 0.75) | AGREES |
| 3 | Training deaths 65-79 | 167/8988 = 0.0186 | 167/8988 = 0.01858 | AGREES |
| 3 | Training deaths 80+ | 343/3536 = 0.0970 | 343/3536 = 0.09700 | AGREES |
| 3 | Background new 65-79 | 337/24359 = 0.0138, ratio 0.74 | 0.013835, ratio 0.745 | AGREES (fails 25% bar by 0.005 in ratio) |
| 3 | Background new 80+ | 527/5319 = 0.0991, 1.02 | 0.09908, 1.021 | AGREES |
| 3 | Background old 65-79 / 80+ | 0.0138 (0.74) / 0.1002 (1.03) | 346/25024 = 0.01383 (0.744) / 535/5339 = 0.10021 (1.033) | AGREES |
| 4 | Promoted vs always, new, 10 bars | all pass; t4b partnered 0.652 vs 0.713 | all 10 pass; t4b partnered always 0.652, promoted 0.713 (+6.1 pt); other worst: knownWell -17.9% / -15.7%, habits -10.6% | AGREES |
| 4 | Same, old | t4b partnered fails, 0.651 vs 0.735 | 9 pass; t4b partnered 0.651 vs 0.735 (+8.4 pt) fails | AGREES |
| 5 | Paired new - old: under20 | +0.30 +-2.67 | +0.304 +-2.676 | AGREES |
| 5 | over65 | -0.91 +-1.86 | -0.908 +-1.864 | AGREES |
| 5 | partnered | -2.44 +-4.51 | -2.443 +-4.518 | AGREES |
| 5 | working | -1.73 +-2.74 | -1.730 +-2.747 | AGREES |
| 5 | drinks | +0.20 +-0.97 | +0.195 +-0.973 | AGREES |
| 5 | kids ratio (per-seed ratio) | -0.01 +-0.10 | -0.005 +-0.100 | AGREES (rounding: -0.005) |

Notes:
- Number 3: the reference pools all four training towns, as the pre-registration says. It is sensitive to that choice: with only seeds below 1084 the rates are 0.0182 (65-79) and 0.0964 (80+), and the new 65-79 ratio is 0.760, which would pass the 25% bar. The 'fails' verdict holds only for the all-towns reference.
- Number 2: the new kids ratio is 0.716 as a ratio of means, 0.731 as a mean of per-seed ratios (old 0.722 / 0.736); both fail the 0.75 line.
- Mean of per-seed bg and focus values is unweighted by city size.
