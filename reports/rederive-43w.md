# Re-derivation of round 43w

**Verdict: every number AGREES except one trivial DIFFERS.** The two-sided half-widths at 47 degrees of freedom are 0.005 wider with the exact t (below). No point estimate, bound, count or gate changes. Keep rules 1 to 5 all hold on my numbers.

| # | Number | Mine | Scorer / battery | |
| --- | --- | --- | --- | --- |
| 1 | Changed lines | 459 of 4136 (235 of 2029, 224 of 2107) | same | AGREES |
| 1 | Unfit reasons on changed lines, on / off | 24 / 360 (6 / 178 in busiest1, 18 / 182 in busiest2) | same | AGREES |
| 1 | Drop per pair, mean over 48 | +3.500 | +3.500 | AGREES |
| 1 | Drop, 95% half-width | ±0.953 | ±0.948 | DIFFERS, 0.005, t table (see below) |
| 1 | Drop, one-sided 95% lower bound | +2.705 | +2.705 | AGREES |
| 1 | Per hundred line-readings (918 per arm) | +36.60 (2.61 on, 39.22 off) | same | AGREES |
| 1 | Drop with order term | +3.500 ±0.962, LB +2.698 | same | AGREES |
| 1 | Drop per pack | +3.583 (LB +2.409), +3.417 (LB +2.271) | +3.583 (LB +2.409) for busiest1 | AGREES |
| 2 | Every kind, on minus off, changed lines | −3.604 ±0.953 (442 off, 96 on) | −3.604 ±0.947 | AGREES (half-width as above) |
| 2 | Other kinds, on minus off | −0.104 ±0.090 | −0.104 ±0.089 | AGREES (half-width as above) |
| 2 | Faults on unchanged lines | 930 on, 930 off (477, 453 by pack) | 930 / 930 | AGREES |
| 2 | Changed lines cited as good | 24 on, 6 off (15 / 2, 9 / 4 by pack) | 24 / 6 | AGREES |
| 3 | Score on minus off, pooled, order and pack as terms | +0.312 ±0.124, LB95 +0.209, LB90 +0.232 | +0.31 ±0.12, +0.21, +0.23 | AGREES |
| 3 | Per pack | +0.354 ±0.195 (LB +0.193); +0.271 ±0.166 (LB +0.133) | +0.35 (+0.19); +0.27 (+0.13) | AGREES |
| 3 | Ties, reader-pairs of 48 | 31 and 35 | 31 and 35 | AGREES |
| 3 | Lean toward the second version | −0.06, +0.06 per pack; 0.00 pooled | −0.06; +0.00 | AGREES |
| 4 | Arms differ only in words | 20 of 20 worlds `arms.same` true, `diff` empty | same | AGREES |
| 5 | Scoreboard, all decisions, calibrated witness | on 62.1 ±0.8, off 62.1 ±0.8, difference 0.000 (36,619 decisions) | 0.0 ±0.0 | AGREES |
| 5 | Scoreboard, not a couple's | 67.9 ±0.9 both arms, difference 0.000 (27,980) | 0.0 ±0.0 | AGREES |
| 5 | Coherence | 0 on all 12 faults, seeds 11 and 12 (rerun log) | 0 | AGREES |
| 5 | `npm test` | battery failure confirmed environmental; rerun completes | both readings | AGREES |

**The one DIFFERS.** `scripts/pairscore.py` has no two-sided t entry between 46 and 60 degrees of freedom, so 47 reads 2.000 where the exact value is 2.012. With 2.000 I get its ±0.948, ±0.947 and ±0.089 exactly. I believe the exact figures. The one-sided bounds use a table with a df 47 entry (1.678) and agree to three decimals. The score intervals (df 22, 45) have table entries and agree.

**Rule 1, fields.** Per world in `wording-test.jsonl`, `arms.same` is true and `arms.diff` empty on all 20 (seeds 3629 to 3648). The check compares every event's type, time, people, weight and decision, every reason's kind, key, weight, reference and person, and the end state of people and bonds, and lets only reason labels (17,562 relabelled across the worlds, each read back to its cell) and `backsong` texts (398) differ. `untraced` is empty and `from.untraced` is 0 in all worlds (0 of 5,381 reworded reasons). I did not rerun the engine. Three independent supports:

- All 24 raw `eval-*.json` files in `board-on` and `board-off` are byte-identical.
- In the packs, both versions number the same lines and have the same kinds in 48 of 48 pairs. The event text differs only on 29 `backsong` lines, the rest only in the bracketed reasons.
- Against the diff of `src/motives.json`, the new wording appears on 450 of the 459 changed lines in the on arm and in none of the off arm. This confirms the key's direction.

**Other checks.**

- `npm test`: `logs/npm-test.log` fails at the first `tsx` call with `listen EINVAL` on a 118-character socket path, over macOS's 104. The rerun, `out-r43w-npmtest.log`, shows every step's output through `COHERENCE` with all twelve counts at 0. That log came from the engine source of the reading commit, which has no `src` diff from the pre-registration `b43c5a7`. The merge of main since then (`1dffd3f`, five `src` files) was not tested.
- The pack and key files are unchanged since `0170017`, before the answers. Pre-registration `b43c5a7` (20:49) predates all battery files (21:05 on).

**Method.** My own parser reads the packs (numbered lines, changed where the text differs between versions; including the `↳` source lines changes nothing). The key's `onIs` gives the arm. Per pair, I average over the two readers (novelist, player). The counter is the mean of off minus on over 48 pairs with a t interval, df 47 (exact t from an incomplete-beta bisection, checked against 2.0117, 1.6779, 2.0739, 1.7171). The score effect is least squares on order (+1 if on is B), with pack coded ±1 when pooled. Scripts, written without `pairscore.py` code, are in `/private/tmp/claude-501/-Users-oystein-Documents-GitHub-Understory--claude-worktrees-funny-mclaren-b6aff7/480289ce-09d1-4a48-88a2-331e9bc9eb58/scratchpad/`: `statlib.py`, `rederive.py` (`python3 rederive.py [sub]`), `board.py`, `keydir.py`, `textdiff.py`.
