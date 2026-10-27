# Re-derivation of round 45 (feelings meet their object)

**Verdict: all nine items AGREE. No DIFFERS.** Nothing was run on the engine; every number comes from the raw JSON in `out-round-45/`, with my own code.

Notation: mean over worlds with a 95% t interval; "lb" is the one-sided 95% lower bound, "ub" the upper.

1. AGREES. The counter, pooled, first ten years. On 4.5 ±1.3 (115/2653). Meeting off 0.9 ±0.4 (25/2580). Paired +3.6 ±1.3. **Paired lb +2.50** (above 0, and 2.50 is also the fail-if line of 2.5, exactly on it to two decimals).
2. AGREES. By kind:
   - Resentment: on 2.5 ±1.1 (32/1344), paired +1.5 ±1.1, **lb +0.64** (above 0).
   - Guilt: on 4.9 ±2.2, paired +3.2 ±2.8, lb +0.81.
   - Gratitude: on 8.2 ±5.0, paired +8.1 ±5.1, lb +3.85.
3. AGREES. Meetings met again: 793. With the feeling as at the last meeting: 0. Something followed within a year: 82.8 ±2.3% (meetings with a full year left). Beside it, "still" is 126.
4. AGREES. Displaced is 0.10 ±0.03% of decisions. Demography, on − main per world-decade over 20 years:
   - births +0.25 (reported +0.3; Python rounds 0.25 to 0.2) ±0.9
   - deaths −0.1 ±0.8
   - marriages −0.5 ±0.7
   - splits −0.5 ±1.0
   - hires +0.4 ±2.1
   - No 99% interval excludes zero. The widest-reaching is marriages, −1.43 to +0.51. The same holds against meeting off.
5. AGREES. feel.ts, on − main, per thousand adult-years. The 99% intervals are:
   - in kind −5.2 ±6.9 (−14.5 to +4.1)
   - rows −3.3 ±31.4 (−45.9 to +39.4)
   - dislikes −1.7 ±4.6 (−8.0 to +4.5)
   - friendships ended +4.6 ±8.4 (−6.7 to +16.0)
   - wrongs +11.6 ±13.1 (−6.2 to +29.3)
   - None lies wholly above zero.
6. AGREES.
   - Strong resentments raising a meeting within a year: 20.6 ±2.1% (guilt 32.0, gratitude 62.9).
   - Forgiveness ratio 29.4 / 11.8 = 2.49.
   - Keeping-away ratio by boldness 37.4 / 22.6 = 1.66.
   - Copy share, every adult, on − main: −0.78 ±0.74. **ub −0.17**, well below +0.6, so the stop does not fire.
   - Copy share, three busiest: −2.79 ±2.51 (ub −0.71).
7. AGREES. Scoreboard, calibrated witness, on − off over 20 worlds (3673–3692), each with its 90% interval:
   - All decisions: −0.8 ±1.0; 90% −1.69 to +0.04.
   - Not a couple's: −1.1 ±1.3; 90% −2.19 to −0.04.
   - Key slice: 0.0 ±1.2; 90% −0.93 to +1.02.
   - **Reported, not judged:** the records carry the decision kind (`trigger`). The meeting's own kinds are `meeting` and `meeting-answer`; the on arm has 1,124 and 123 of them, the off arm none. With both left out of both arms, the not-a-couple's number is **−0.4 ±1.2**, 90% −1.40 to +0.59, on 26,874 / off 26,677 decisions. These sizes now match, where before they differed by 1,444.
8. AGREES. The reading, per pair: the mean over the two readers of on minus off, regressed on the order (+1 if on was B, −1 if A).
   - Random: +0.04 ±0.35, lb −0.25 (−0.247); lean +0.21; ties 19 of 48.
   - Busiest: +0.10 ±0.33 (0.325), lb −0.17 (−0.165); ties 23 of 48.
   - Pooled, 48 pairs, order and pack as terms: +0.07 ±0.23, lb −0.12 (−0.120), 45 df.
9. AGREES. Round 44's counter, first ten years: on 5.5 ±1.0, meeting off 3.6 ±1.1.

## Method

- Counter: per world, the share of episodes with `v0 ≥ 0.3` and `flipped` (the episode list covers the first ten years only). Pooled counts are summed over worlds. Paired is on − meeting off by seed (`out-meet/on-*` against `meeting-*`; the `feelings-*` files are main). The lb is mean − t(0.95, 23) × se.
- Followed-within-a-year: meetings with `t + 12 ≤ years × 12`.
- Demography: counts × 10 / 20 per world-decade, 99% by t(0.995, 23).
- Fail-if 5 and the copy share come from `out-feel/` (on against `feelings` = main). The feuds are per thousand `adultYears`. The copy share is `copies / lines`.
- Forgiveness and boldness thirds are pooled over episodes (resentment, v0 ≥ 0.3) and meetings, cut at the sorted index n/3 and 2n/3.
- Scoreboard: `cal == chosen` accuracy per world on the slice. Couple's kinds are `row`, `row-answer` and `stay`; the key slice is novel and contested and known. Paired by seed, with t at 0.975 and 0.95 (90% two-sided).
- Reading: the answers, matched to the key's `onIs`, with the plain ordinary least squares fit coded by hand. The pooled pack term is coded ±0.5, so the intercept is the average over the two packs. Ties are counted per reader per pair (score on = score off).
- t quantiles come from my own numeric integration of the t density; there is no scipy.
- Scripts: `reports/rederive-45/` holds `stats.py`, `meet.py` (items 1–4, 6, 9), `feel.py` (5, 6), `board.py` (7) and `read.py` (8). Each names its output directory at its top; run it as `python3 -I <file>`.
- Not checked: the sizing files, the identity check, `npm test`, and anything outside the nine items.
