# Re-derivation of round 42 sizing (reports/42-size.md)

**Verdict: all numbers AGREE. No DIFFERS.** The stop at check 2 stands on these numbers.

Scripts: /private/tmp/claude-501/-Users-oystein-Documents-GitHub-Understory--claude-worktrees-frosty-kare-c68359/b6fcff57-ff8d-4f35-9a39-277f8d7023d3/scratchpad/chk.py (own code, not 42-size.py; no engine run).

## 1. Counter (24 worlds 9001-9024, mean ±95% t interval, df 23, from out-r42/size.jsonl)

| Number | Mine | Report | |
| --- | --- | --- | --- |
| decision lines on pages | 856 ±26.5 | 856 ±27 | AGREES |
| trait reasons shown (off) | 814 ±28.0 | 814 ±28 | AGREES |
| traitIdle off / on | 166.0 ±7.1 / 0 | 166 ±7 / 0 | AGREES |
| traitIdle share of shown | 20.4% | 20.4% | AGREES |
| accShown off | 42.5 ±3.8 | 42.5 ±3.8 | AGREES |
| accIdle off / on | 36.0 ±3.7 / 0 | 36.0 ±3.7 / 0 | AGREES |
| accShownOn | 6.67 ±0.90 | 6.7 ±0.9 | AGREES |
| decision lines changed | 22.1% ±0.64 (of all lines) | 22.1% ±0.6 | AGREES |
| bare / withReason | 1.41% ±0.19, worst 2.49% | 1.41% ±0.19, worst 2.49% | AGREES |
| arms check, all 24 worlds | eventsDiffer 0, bondsDiffer 0, rng true | no difference | AGREES |

## 2. Check 2

Rebuilt lines: strip the number from every pack line and the trailing "  (...)" again-note, compare with `text` of the arm (on for the true version; null and r40 also off). 10,977 lines, 0 mismatches, 288 page-readings. (Without stripping the pack side, 75 lines differ, all again-notes.) AGREES.

| Number | Mine | Report | |
| --- | --- | --- | --- |
| unfit-reason faults, all | 683 (null 263, r40 240, shuffled 71, planted 109) | 683 | AGREES |
| on lines with trait true | 434 | 434 | AGREES |
| of those, bear != text | 140 (32.3%) | 140 (32%) | AGREES |
| by pack | null 60/185 = 32%, r40 37/153 = 24%, shuffled 20/35 = 57%, planted 23/61 = 38% | 32/24/57/38% | AGREES |
| unfit on account lines | 40 | 40 | AGREES |
| of those, changed | 33 (82.5%) | 33 (82%) | AGREES |

## 3. Check 5 (busiest pages, 72)

| Number | Mine | Report | |
| --- | --- | --- | --- |
| account shown off | 64 (89%) | 64 (89%) | AGREES |
| account shown on | 26 (36%) | 26 (36%) | AGREES |
| both | 26 (41% of those with one off) | 26 (41%) | AGREES |

Not checked: check 1 phrase rates, check 4 power simulation (not in the brief); the "none" count of 236 and the claim that rebuilds used other trees (the rebuilds themselves are not re-run, only read from the pack files).
