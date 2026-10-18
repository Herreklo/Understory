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
| 9001 | 9999 | all | smoke | |

Next free: eval **1691**, test **2877**.

The rows "up to rH25" stand for ranges whose exact start the lab will enter on migration. The scale lane enters its own ranges on migration.
