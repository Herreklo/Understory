# Round 27: independent re-derivation

Computed with fresh Python from the raw files only (code in `/tmp/claude-0/-home-user/7c2f1e06-1290-5495-ab16-1f618628b192/scratchpad/r27/rederive-code/`). No round.mjs, alpha.py or score.py logic was read or run.

## 1. Scoreboard (board-on / board-off, seeds 1761–1780, 20 worlds each arm)

Structure: one world per file, `g` = list of decisions; `chosen` is the answer, reader guesses are the fields `cal`, `noteOrBase`, `oracle`, `mind` (plus others). Flags `novel`, `contested`, `known` are per decision. Accuracy = share of decisions where the reader's guess equals `chosen`, in points. Couple triggers present: `row` (5452), `row-answer` (3425), `stay` (108) over the on arm. Decisions per world: 1443–1992 (all), 1079–1505 (not a couple's), 593–1089 (key). 33,944 decisions on, 34,512 off. Restricting to decisions with n ≥ 2 options changes nothing (every decision has n ≥ 2).

(a) Calibrated witness, on minus off, paired by world, mean over 20 worlds:

| slice | claimed | re-derived (mean, 1.96×SE) | re-derived (mean, t19×SE = 2.093×SE) | agrees |
| --- | --- | --- | --- | --- |
| all | −2.3 ±1.3 | −2.29 ±1.24 | ±1.33 | mean yes; interval yes only under t19 |
| not a couple's | −2.5 ±1.4 | −2.52 ±1.33 | ±1.42 | mean yes; interval yes only under t19 |
| key (novel ∧ contested ∧ known) | −2.5 ±2.1 | −2.53 ±1.96 | ±2.09 | mean yes; interval yes only under t19 |

All three means agree to the stated precision. The interval half-widths as claimed (1.3, 1.4, 2.1) do not come out of 1.96 × SE (which gives 1.2, 1.3, 2.0); every one of them matches 2.093 × SE, the t(19) multiplier, to the rounding. So the claim's description of the interval ("±1.96 × standard error") does not match its numbers, but the numbers are a legitimate, slightly wider interval. No conclusion changes: the key-slice interval excludes zero either way (−2.5 ±2.0 or ±2.1).

Per-world differences (key slice, on−off): 4.6, −8.5, −6.5, 4.4, 2.1, −4.0, −1.4, −5.1, −3.5, −13.4, −2.9, 0.0, −4.1, −2.0, 3.4, −4.0, 1.6, −1.4, −4.4, −5.5. SE = 0.998.

(b) Within the on arm, calibrated minus notebook (`noteOrBase`) on the key slice: claimed 3.3 ±1.4; re-derived +3.32 ±1.30 (1.96×SE) / ±1.39 (t19×SE). Mean agrees; interval again matches t19, not 1.96. Above zero either way.

(c) Trait oracle / mind-reader accuracy, mean over 20 worlds:

| | claimed | re-derived | agrees |
| --- | --- | --- | --- |
| on, all | 70.2 / 77.6 | 70.2 / 77.6 | yes |
| off, all | 74.0 / 77.7 | 74.0 / 77.7 | yes |
| on, key | 69.9 / 77.0 | 69.9 / 77.0 | yes |
| off, key | 73.2 / 76.8 | 73.2 / 76.8 | yes |

Pooled over decisions rather than averaged over worlds the numbers are the same to one decimal.

## 2. Paired reading (pair2)

Three readers × 12 pairs, each line has scores A and B (2–4) and a `pref`; key maps pair → `onIs`.

- Majority of readers preferred the on arm: claimed 4 of 12; re-derived 4 of 12 (P02, P07, P08, P10; votes for on per pair: 1,3,0,1,0,0,2,3,0,3,1,0). Agrees.
- Mean paired difference (on score − off score over all 36 reader-pairs): claimed −0.22; re-derived −0.222. Agrees.
- Krippendorff's alpha, ordinal, over 24 units (12 pairs × 2 versions) by 3 readers, no missing values, values {2,3,4}: claimed about .73; re-derived 0.728 (coincidence-matrix method, ordinal metric; interval metric gives 0.739 for reference). Agrees.

## 3. T2 patterns

From the 20 per-kind rows in each file (values printed to two decimals, so the inputs are already rounded).

| | claimed | re-derived | agrees |
| --- | --- | --- | --- |
| single, on | 0.36 | 0.355 (middle values 0.35, 0.36) | yes, within rounding of the inputs |
| single, off | 0.39 | 0.395 (middle values 0.38, 0.41) | yes, within rounding of the inputs; the file's own line also says 0.39, which comes from unrounded values I do not have |
| aggregate, on (9 kinds with a number) | 0.50 | 0.50 | yes |
| aggregate, off (7 kinds with a number) | 0.53 | 0.53 | yes |

Kinds with "–" (too few people) were excluded from the aggregate median, as claimed.

## 4. Coherence counts

faults-on.log: 4 faults, all of type 5 (a stock reason that does not fit the act), every other type 0. faults-off.log: 0 faults in all 12 types. Claim (4 on, all type 5; 0 off) agrees.

## Could not re-derive

- The unrounded per-kind correlations behind the T2 single medians (only two-decimal values are in the files). The off-arm median from the rounded rows is 0.395, which is consistent with but does not pin down the claimed 0.39.
- Nothing else. Every other number came out of the raw files.

## Summary of disagreements

One: the confidence-interval half-widths in claims (a) and (b) are stated as 1.96 × SE but are numerically t(19) × SE (2.093 × SE). With 1.96 they read ±1.2, ±1.3, ±2.0 and ±1.3 instead of ±1.3, ±1.4, ±2.1 and ±1.4. No sign or above/below-zero conclusion changes.
