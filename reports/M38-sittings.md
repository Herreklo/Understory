# M38, part one: how many readers a round needs (21 Oct 2026)

Rounds 39, 40 and 41 were re-scored with `scripts/pairscore.py`, using every subset of the three reader roles: all three (twelve sittings a round), each two (eight) and each one (four). The answers are the ones on file (`reports/<round>-reading-<pack>-answers.json`). Nothing was read again. The numbers are the effect with the order as a term, its 95% half-width, and the one-sided 90% lower bound the keep rule uses.

| Round | Pack    | Readers                         | Effect | ±95% | Lower bound |
| ----- | ------- | ------------------------------- | ------ | ---- | ----------- |
| 39    | busiest | novelist, social worker, player | +0.38  | 0.30 | +0.19       |
| 39    | busiest | novelist, social worker         | +0.33  | 0.30 | +0.14       |
| 39    | busiest | novelist, player                | +0.44  | 0.29 | +0.25       |
| 39    | busiest | social worker, player           | +0.35  | 0.35 | +0.13       |
| 39    | busiest | novelist                        | +0.42  | 0.30 | +0.22       |
| 39    | busiest | social worker                   | +0.25  | 0.37 | +0.02       |
| 39    | busiest | player                          | +0.46  | 0.39 | +0.21       |
| 39    | random  | novelist, social worker, player | +0.33  | 0.49 | +0.02       |
| 39    | random  | novelist, social worker         | +0.27  | 0.51 | -0.05       |
| 39    | random  | novelist, player                | +0.40  | 0.48 | +0.09       |
| 39    | random  | social worker, player           | +0.33  | 0.50 | +0.01       |
| 39    | random  | novelist                        | +0.33  | 0.49 | +0.02       |
| 39    | random  | social worker                   | +0.21  | 0.55 | -0.14       |
| 39    | random  | player                          | +0.46  | 0.50 | +0.14       |
| 40    | busiest | novelist, social worker, player | +0.51  | 0.44 | +0.23       |
| 40    | busiest | novelist, social worker         | +0.44  | 0.46 | +0.14       |
| 40    | busiest | novelist, player                | +0.56  | 0.42 | +0.30       |
| 40    | busiest | social worker, player           | +0.54  | 0.48 | +0.24       |
| 40    | busiest | novelist                        | +0.46  | 0.43 | +0.18       |
| 40    | busiest | social worker                   | +0.42  | 0.53 | +0.08       |
| 40    | busiest | player                          | +0.67  | 0.48 | +0.36       |
| 40    | random  | novelist, social worker, player | +0.22  | 0.46 | -0.07       |
| 40    | random  | novelist, social worker         | +0.27  | 0.50 | -0.05       |
| 40    | random  | novelist, player                | +0.21  | 0.42 | -0.06       |
| 40    | random  | social worker, player           | +0.19  | 0.47 | -0.11       |
| 40    | random  | novelist                        | +0.29  | 0.47 | -0.01       |
| 40    | random  | social worker                   | +0.25  | 0.54 | -0.09       |
| 40    | random  | player                          | +0.12  | 0.43 | -0.15       |
| 41    | busiest | novelist, social worker, player | +0.29  | 0.39 | +0.04       |
| 41    | busiest | novelist, social worker         | +0.21  | 0.39 | -0.04       |
| 41    | busiest | novelist, player                | +0.38  | 0.45 | +0.09       |
| 41    | busiest | social worker, player           | +0.29  | 0.37 | +0.06       |
| 41    | busiest | novelist                        | +0.29  | 0.50 | -0.03       |
| 41    | busiest | social worker                   | +0.12  | 0.33 | -0.09       |
| 41    | busiest | player                          | +0.46  | 0.47 | +0.16       |
| 41    | random  | novelist, social worker, player | +0.32  | 0.51 | -0.00       |
| 41    | random  | novelist, social worker         | +0.38  | 0.50 | +0.06       |
| 41    | random  | novelist, player                | +0.29  | 0.52 | -0.04       |
| 41    | random  | social worker, player           | +0.29  | 0.53 | -0.04       |
| 41    | random  | novelist                        | +0.38  | 0.51 | +0.05       |
| 41    | random  | social worker                   | +0.38  | 0.52 | +0.04       |
| 41    | random  | player                          | +0.21  | 0.56 | -0.15       |

## What it shows

- **Two readers resolve as well as three.** The interval barely narrows with a third reader: ±0.30 with three against ±0.29–0.35 with two (round 39, busiest), ±0.44 against ±0.42–0.48 (round 40, busiest), ±0.51 against ±0.50–0.53 (round 41, random). One reader alone is about as wide, or a little wider. What limits a reading is the 24 pairs, not the readers: the three roles of one model mostly agree, so a second and third add little information. This is the outside review's point about one model in three roles, measured.
- **"Reads no worse" holds with any subset.** Every lower bound in the table is above −0.3. No keep decision on "no worse" would have changed.
- **"Reads better" moves with the choice of readers.** It sits at the margin in three of the six readings (round 39 random, round 41 busiest and random), and there the choice of roles decides it: round 41 busiest is +0.04 with all three, −0.04 without the player, +0.09 without the social worker. Among the busiest, the player gives the largest effect and the social worker the smallest in all three rounds; among random adults the order changes from round to round. So which roles are kept must be fixed in advance, never chosen after a reading.

## What it means for the method (for Øystein to decide)

- The same cost buys more with two roles and more pairs: two roles reading 36 pairs is twelve sittings, as now, with an interval about a fifth narrower (√(24/36) ≈ 0.82). Two roles reading 24 pairs is eight sittings, a third cheaper, as precise as now.
- Which two roles is a question the human test can answer: the role whose choices agree best with people's is the one to keep.
