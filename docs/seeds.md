# Seeds

Every seed range in use. A seed used for a test or a scoreboard is never used for another. Claim a range in your pre-registration commit, by appending a row. `node scripts/check-seeds.mjs` (run by CI) fails if two ranges overlap, except `smoke` and `diag` ranges, which are throwaway by design.

Uses: `train`, `eval` (scoreboard), `test` (fresh worlds for a round), `quiz`, `diag` (diagnosis), `smoke` (does it run).

| From |   To | Lane  | Use   | Round                                                                              |
| ---: | ---: | ----- | ----- | ---------------------------------------------------------------------------------- |
| 1501 | 1520 | lab   | train | all                                                                                |
| 1521 | 1530 | lab   | eval  | 19b                                                                                |
| 1531 | 1540 | lab   | eval  | 19c                                                                                |
| 1541 | 1550 | lab   | eval  | 19d                                                                                |
| 1551 | 1560 | lab   | eval  | 20                                                                                 |
| 1561 | 1570 | lab   | eval  | 21                                                                                 |
| 1571 | 1580 | lab   | eval  | 20b                                                                                |
| 1581 | 1590 | lab   | eval  | 20c                                                                                |
| 1591 | 1600 | lab   | eval  | 23b                                                                                |
| 1601 | 1630 | lab   | quiz  | quiz worlds                                                                        |
| 1631 | 1640 | lab   | eval  | 24b                                                                                |
| 1641 | 1650 | lab   | eval  | 25b                                                                                |
| 1651 | 1660 | lab   | eval  | 25c                                                                                |
| 1661 | 1670 | lab   | eval  | H25                                                                                |
| 1671 | 1680 | lab   | eval  | 25d                                                                                |
| 1681 | 1690 | lab   | eval  | M26                                                                                |
| 1701 | 1720 | lab   | test  | 10a                                                                                |
| 1801 | 1810 | lab   | diag  | 10b calibration                                                                    |
| 1811 | 1830 | lab   | test  | 10b                                                                                |
| 1831 | 1850 | lab   | test  | 10b rerun                                                                          |
| 1851 | 1870 | lab   | test  | 11                                                                                 |
| 1871 | 1890 | lab   | test  | 12; later used for diagnosis only                                                  |
| 1901 | 1930 | lab   | quiz  | quiz worlds                                                                        |
| 1931 | 1950 | lab   | test  | 14                                                                                 |
| 1951 | 1970 | lab   | test  | 14c                                                                                |
| 1971 | 1990 | lab   | test  | 15; later used for diagnosis only                                                  |
| 2001 | 2030 | lab   | quiz  | quiz worlds                                                                        |
| 2031 | 2050 | lab   | test  | 16                                                                                 |
| 2051 | 2070 | lab   | test  | 17                                                                                 |
| 2101 | 2180 | lab   | test  | 18                                                                                 |
| 2181 | 2200 | lab   | test  | 18                                                                                 |
| 2201 | 2280 | lab   | test  | 18b                                                                                |
| 2281 | 2360 | lab   | test  | 18c                                                                                |
| 2361 | 2380 | lab   | test  | 19                                                                                 |
| 2381 | 2400 | lab   | test  | 19b                                                                                |
| 2401 | 2420 | lab   | test  | 19c                                                                                |
| 2421 | 2440 | lab   | test  | 19d                                                                                |
| 2441 | 2480 | lab   | test  | 20                                                                                 |
| 2481 | 2500 | lab   | test  | 20                                                                                 |
| 2501 | 2520 | lab   | test  | 21                                                                                 |
| 2521 | 2540 | lab   | test  | 22                                                                                 |
| 2541 | 2580 | lab   | test  | 20b                                                                                |
| 2581 | 2600 | lab   | test  | 20b                                                                                |
| 2601 | 2620 | lab   | test  | 20b                                                                                |
| 2621 | 2660 | lab   | test  | 20c                                                                                |
| 2661 | 2680 | lab   | test  | 20c                                                                                |
| 2681 | 2700 | lab   | test  | 23a                                                                                |
| 2701 | 2720 | lab   | test  | 23b                                                                                |
| 2721 | 2724 | lab   | test  | 24a                                                                                |
| 2725 | 2744 | lab   | test  | 24b                                                                                |
| 2745 | 2748 | lab   | test  | 24c                                                                                |
| 2749 | 2768 | lab   | test  | 25a                                                                                |
| 2769 | 2788 | lab   | test  | 25b                                                                                |
| 2789 | 2808 | lab   | test  | 25c                                                                                |
| 2809 | 2812 | lab   | test  | H25 fault counts                                                                   |
| 2813 | 2832 | lab   | test  | H25                                                                                |
| 2833 | 2852 | lab   | test  | 25d                                                                                |
| 2853 | 2872 | lab   | test  | H26                                                                                |
| 2873 | 2876 | lab   | test  | M26                                                                                |
|    1 |   10 | scale | test  | S0–S4 on r19c (identity checks reuse 1–10 by design)                               |
|   11 |   12 | scale | smoke | S7                                                                                 |
|   21 |   25 | scale | smoke | S7–S8                                                                              |
|   31 |   31 | scale | smoke | S8                                                                                 |
|   41 |   45 | scale | test  | S7                                                                                 |
|   51 |   55 | scale | test  | S8                                                                                 |
|   56 |   58 | scale | test  | S8b                                                                                |
|   61 |   65 | scale | test  | S10 (61 also drew the report's example neighbourhood)                              |
|   71 |   72 | scale | diag  | marks by source                                                                    |
|   81 |   81 | scale | smoke | S10                                                                                |
|   82 |   84 | scale | test  | S10                                                                                |
|   91 |   91 | scale | smoke | S11                                                                                |
|   92 |   95 | scale | test  | S11, S11b                                                                          |
| 1001 | 1030 | scale | train | background odds fit (r19c)                                                         |
| 1721 | 1740 | lab   | eval  | F26                                                                                |
| 3001 | 3026 | lab   | test  | F26                                                                                |
| 3101 | 3120 | lab   | test  | T2                                                                                 |
| 1741 | 1760 | lab   | eval  | F27 (1691–1710 was claimed first and overlapped round 10a's test seeds; see BOARD) |
| 2901 | 2920 | lab   | test  | Q3 (study items)                                                                   |
| 1761 | 1780 | lab   | eval  | 27                                                                                 |
| 2921 | 2940 | lab   | test  | 27                                                                                 |
| 2877 | 2900 | lab   | test  | F27                                                                                |
|  401 |  410 | scale | test  | S12                                                                                |
| 1031 | 1060 | scale | train | background odds fit, S12                                                           |
| 1781 | 1800 | lab   | eval  | 28                                                                                 |
| 2941 | 2962 | lab   | test  | 28 (2961–2962 cold reads)                                                          |
| 2071 | 2090 | lab   | eval  | 29                                                                                 |
| 3027 | 3050 | lab   | test  | 29 (3047–3050 cold reads)                                                          |
| 2963 | 2982 | lab   | eval  | 30                                                                                 |
| 3051 | 3074 | lab   | test  | 30 (3071–3074 cold reads)                                                          |
| 3075 | 3094 | lab   | eval  | 31                                                                                 |
| 3121 | 3144 | lab   | test  | 31 (3141–3144 cold reads)                                                          |
| 3145 | 3164 | lab   | eval  | 32                                                                                 |
| 3165 | 3188 | lab   | test  | 32 (3185–3188 cold reads)                                                          |
| 3189 | 3208 | lab   | eval  | 33                                                                                 |
| 3209 | 3232 | lab   | test  | 33 (3229–3232 cold reads)                                                          |
| 3233 | 3252 | lab   | eval  | 34                                                                                 |
| 3253 | 3280 | lab   | test  | 34 (3273–3280 cold reads)                                                          |
| 3281 | 3288 | lab   | test  | 35 (cold reads)                                                                    |
| 3289 | 3308 | lab   | eval  | 36                                                                                 |
| 3309 | 3336 | lab   | test  | 36 (3329–3336 cold reads)                                                          |
| 3337 | 3356 | lab   | eval  | 37                                                                                 |
| 3357 | 3384 | lab   | test  | 37 (3377–3384 cold reads)                                                          |
| 3385 | 3404 | lab   | eval  | 38                                                                                 |
| 3405 | 3432 | lab   | test  | 38 (3425–3432 cold reads)                                                          |
| 3433 | 3452 | lab   | eval  | 39                                                                                 |
| 3453 | 3488 | lab   | test  | 39 (3473–3480 busiest read, 3481–3488 random adults read)                          |
| 3489 | 3508 | lab   | eval  | 40                                                                                 |
| 3509 | 3544 | lab   | test  | 40 (3529–3536 busiest read, 3537–3544 random adults read)                          |
| 3545 | 3564 | lab   | eval  | 41                                                                                 |
| 3565 | 3600 | lab   | test  | 41 (3585–3592 busiest read, 3593–3600 random adults read)                          |
| 3601 | 3608 | lab   | test  | M38 (the null pack: `NULL=2`, busiest)                                             |
| 9001 | 9999 | all   | smoke |                                                                                    |
| 9001 | 9020 | lab   | diag  | event density and reach (`src/tools/diag/density.ts`, 22 Oct)                      |

Next free: eval **3609**, test **3609** (the check in CI is the truth; this line was wrong once). Scale: test **411**, train **1061**.

The lab's ranges are as recorded in each round's pre-registration and outcome in `docs/BOARD.md`. Below 1501, the lab's earliest rounds used scoreboard defaults (1–20, 101–120, 201–220, 301–320) and its identity checks use seeds 11–13 by design; the lab takes no new range below 1501. The scale rows were all run on round 19c with the scale branch.
