# Re-derivation of round M38

Verdict: every number checked AGREES with the scorer. No DIFFERS.

Method: pure Python (no numpy), own parse of answers, keys and packs; pairscore.py not run. Effect = per-pair mean over readers of on minus off, regressed on intercept and side (+1 if on is B), t at 22 df. Script: /private/tmp/claude-501/-Users-oystein-Documents-GitHub-Understory/c8448ccf-b8bc-4520-b969-ec8ae2380ccc/scratchpad/rd.py

| # | Number | Scorer | Mine | |
|---|---|---|---|---|
| 1 | shuffled, on chosen of 48 | 48 | 48 | AGREES |
| 1 | planted, on chosen of 48 | 48 | 48 | AGREES |
| 2 | planted line cited, altered / true / difference | 48 / 1 / +47 | 48 / 1 / +47 | AGREES |
| 2 | within one line, altered against true | 48 against 16 | 48 against 16 | AGREES |
| 3 | null intercept, half-width, lower bound, lean | -0.04, 0.21, -0.18, +0.25 | -0.04, 0.21, -0.18, +0.25 | AGREES |
| 3 | r40 intercept, half-width, lower bound | +0.25, 0.36, +0.02 | +0.25, 0.36, +0.02 | AGREES |
| 3 | r40opus intercept, half-width, lower bound | +0.38, 0.33, +0.16 | +0.38, 0.33, +0.16 | AGREES |
| 3 | per-pair sd (null, r40, r40opus) | 0.55, 0.86, 0.77 (implied by hw95; not printed) | 0.55, 0.86, 0.77 | AGREES |
| 4 | null ties | 30 of 48 | 30 of 48 (0.63) | AGREES |
| 4 | r40 ties | none printed (no warning) | 19 of 48 (0.40) | AGREES |
| 4 | versions with exactly three faults, null / r40 | 2 / 0 of 96 | 2 / 0 | AGREES |
| 4 | versions at the most faults any got, null / r40 | not printed | 1 of 96 (max 24) / 1 of 96 (max 22) | not comparable |
| 5 | citations on a line the version lacks: null, shuffled, planted, r40, r40opus | 0 of 888, 3771, 1124, 864, 645 | 0 of each | AGREES |
| 6 | roles file states both halves | yes | kinds, same choice, score for first and second half; 264 choices each | confirmed |

Notes:
- Item 4: the scorer's cap measure is versions with exactly three faults, not the most-faults share. The share I computed is far below half either way.
- Item 5: my first parse missed three-digit line numbers and reported false misses. After I fixed my regex, all five packs show zero.
- Item 6: not re-derived. The numbers in the file are kinds 0.119 then 0.130, same choice 0.85 then 0.92 (+7 points), score 0.28 then 0.24.
