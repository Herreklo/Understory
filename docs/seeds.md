# Seeds

Every seed range in use. A seed used for a test or a scoreboard is never used for another. Claim a range in your pre-registration commit, by appending a row. `node scripts/check-seeds.mjs` (run by CI) fails if two ranges overlap, except `smoke` and `diag` ranges, which are throwaway by design.

Uses: `train`, `eval` (scoreboard), `test` (fresh worlds for a round), `quiz`, `diag` (diagnosis), `smoke` (does it run).

| From | To | Lane | Use | Round |
| ---: | ---: | --- | --- | --- |
| 1 | 1500 | lab | test | rounds 1–9 and the old scoreboard defaults; never reused |
| 1501 | 1520 | lab | train | all |
| 1521 | 1530 | lab | eval | 19b |
| 1531 | 1540 | lab | eval | 19c |
| 1541 | 1550 | lab | eval | 19d |
| 1551 | 1560 | lab | eval | 20 |
| 1561 | 1570 | lab | eval | 21 |
| 1571 | 1580 | lab | eval | 20b |
| 1581 | 1590 | lab | eval | 20c |
| 1591 | 1600 | lab | eval | 23b |
| 1601 | 1630 | lab | quiz | quiz worlds |
| 1631 | 1640 | lab | eval | 24b |
| 1641 | 1650 | lab | eval | 25b |
| 1651 | 1660 | lab | eval | 25c |
| 1661 | 1670 | lab | eval | H25 |
| 1671 | 1680 | lab | eval | 25d |
| 1681 | 1690 | lab | eval | M26 |
| 1701 | 1720 | lab | test | 10a |
| 1801 | 1810 | lab | diag | 10b calibration |
| 1811 | 1830 | lab | test | 10b |
| 1831 | 1850 | lab | test | 10b rerun |
| 1851 | 1870 | lab | test | 11 |
| 1871 | 1890 | lab | test | 12; later used for diagnosis only |
| 1901 | 1930 | lab | quiz | quiz worlds |
| 1931 | 1950 | lab | test | 14 |
| 1951 | 1970 | lab | test | 14c |
| 1971 | 1990 | lab | test | 15; later used for diagnosis only |
| 2001 | 2030 | lab | quiz | quiz worlds |
| 2031 | 2050 | lab | test | 16 |
| 2051 | 2070 | lab | test | 17 |
| 2101 | 2180 | lab | test | 18 |
| 2181 | 2200 | lab | test | 18 |
| 2201 | 2280 | lab | test | 18b |
| 2281 | 2360 | lab | test | 18c |
| 2361 | 2380 | lab | test | 19 |
| 2381 | 2400 | lab | test | 19b |
| 2401 | 2420 | lab | test | 19c |
| 2421 | 2440 | lab | test | 19d |
| 2441 | 2480 | lab | test | 20 |
| 2481 | 2500 | lab | test | 20 |
| 2501 | 2520 | lab | test | 21 |
| 2521 | 2540 | lab | test | 22 |
| 2541 | 2580 | lab | test | 20b |
| 2581 | 2600 | lab | test | 20b |
| 2601 | 2620 | lab | test | 20b |
| 2621 | 2660 | lab | test | 20c |
| 2661 | 2680 | lab | test | 20c |
| 2681 | 2700 | lab | test | 23a |
| 2701 | 2720 | lab | test | 23b |
| 2721 | 2724 | lab | test | 24a |
| 2725 | 2744 | lab | test | 24b |
| 2745 | 2748 | lab | test | 24c |
| 2749 | 2768 | lab | test | 25a |
| 2769 | 2788 | lab | test | 25b |
| 2789 | 2808 | lab | test | 25c |
| 2809 | 2812 | lab | test | H25 fault counts |
| 2813 | 2832 | lab | test | H25 |
| 2833 | 2852 | lab | test | 25d |
| 2853 | 2872 | lab | test | H26 |
| 2873 | 2876 | lab | test | M26 |
| 9001 | 9999 | all | smoke | |

Next free: eval **1691**, test **2877**.

The lab's ranges are as recorded in each round's pre-registration and outcome in `docs/BOARD.md`. The scale lane enters its own ranges on migration.
