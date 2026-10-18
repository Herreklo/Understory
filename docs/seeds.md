# Seeds

Every seed range in use. A seed used for a test or a scoreboard is never used for another. Claim a range in your pre-registration commit, by appending a row. `node scripts/check-seeds.mjs` (run by CI) fails if two ranges overlap, except `smoke` and `diag` ranges, which are throwaway by design.

Uses: `train`, `eval` (scoreboard), `test` (fresh worlds for a round), `quiz`, `diag` (diagnosis), `smoke` (does it run).

| From | To | Lane | Use | Round |
| ---: | ---: | --- | --- | --- |
| 1501 | 1520 | lab | train | all |
| 1601 | 1630 | lab | quiz | quiz worlds |
| 1631 | 1670 | lab | eval | up to rH25 |
| 1671 | 1680 | lab | eval | 25d |
| 1681 | 1690 | lab | eval | M26 |
| 1871 | 1880 | lab | diag | |
| 1901 | 1930 | lab | quiz | quiz worlds |
| 1971 | 1973 | lab | diag | |
| 2001 | 2030 | lab | quiz | quiz worlds |
| 2801 | 2832 | lab | test | up to rH25 |
| 2833 | 2852 | lab | test | 25d |
| 2853 | 2872 | lab | test | H26 |
| 2873 | 2876 | lab | test | M26 |
| 1 | 10 | scale | test | S0–S4 on r19c (identity checks reuse 1–10 by design) |
| 11 | 12 | scale | smoke | S7 |
| 21 | 25 | scale | smoke | S7–S8 |
| 31 | 31 | scale | smoke | S8 |
| 41 | 45 | scale | test | S7 |
| 51 | 55 | scale | test | S8 |
| 56 | 58 | scale | test | S8b |
| 61 | 65 | scale | test | S10 (61 also drew the report's example neighbourhood) |
| 71 | 72 | scale | diag | marks by source |
| 81 | 81 | scale | smoke | S10 |
| 82 | 84 | scale | test | S10 |
| 91 | 91 | scale | smoke | S11 |
| 92 | 95 | scale | test | S11, S11b |
| 1001 | 1030 | scale | train | background odds fit (r19c) |
| 9001 | 9999 | all | smoke | |

Next free: eval **1691**, test **2877**. Scale: test **101**.

The rows "up to rH25" stand for ranges whose exact start the lab will enter on migration. The scale rows were all run on round 19c with the scale branch.
