# Round 48 review: the band year

_Two `reviewer` agents on Fable 5.1, 28 Oct 2026, `round/48` at 61bb3d2, run in parallel: a review (the seven questions, plus four from the lead session) and a pre-mortem (a big round). Each read the note, the diff against `origin/main`, the sizing and its raw outputs. Neither ran a fresh world, and neither changed anything. This file holds their findings and what was done with each._

**Verdict.** The mechanism reads people, not counts, and with its switch off every path is main's. As sized, the round is not ready.

- The battery could not run its arms.
- The one-year counter clears by construction.
- The rows ladder is a second change that cannot be told apart from the norm.

All three are fixed, or moved into the pre-registration, below. Nothing marked BLOCKS is left in the engine. The counter's choice goes to the lead session before anything is pre-registered.

## Findings and dispositions

| # | Finding | Mark | Disposition | Where |
| --- | --- | --- | --- | --- |
| 1 | The battery has no ON arm: `scripts/round.mjs:70–101` and `measures.ts:134` pass only `OFF=`. Under `Switch: ON=norms` both arms are main's, or both are on. Both reviewers found it. | BLOCKS | Taken. The switch is flipped: on unless `OFF=norms`, and the PR says `Switch: OFF=norms`. CI's identity check now checks that arm against main. | 57b70dc, `world.ts` |
| 2 | The one-year counter clears by construction. Members a year after the last founder mostly overlapped the founders and formed the same running mean from the same acts. Telling off still gives 0.71. Both reviewers found it. | BLOCKS | Taken in part. The tool now reads the counter at five years, on members who joined after the last founder went, and as a partial r holding constant the members' norm when the last founder went. It also reads telling's part (on against `OFF=normtell`) as a Fisher-z difference. The telling-off arm grows from 200 to 600 worlds. Which number is the primary goes to the lead session; BLOCKS stays open until it is chosen. | `diag/norms.ts` `fiveYear`, `contrast` |
| 3 | The counter lives in 40-year from-founding worlds, which the battery does not run. In the present decade, 3 of 145 bands lose their last founder. | BLOCKS | Taken. The pre-registration must name the from-founding runs: seeds, arms, n. Re-sized below. | pre-registration |
| 4 | The rows ladder is a second behavioural change, the same with telling off. Askings −32%; "stayed for the others' sake" +92%, because a row let go now falls through to `groupstrain`. The "one more row" line becomes a hollow threat. The rows r is zero-inflated. | BLOCKS (review), NOTE (pre-mortem) | Taken. It is a separate part behind `ON=normrows`, off by default. With it off, nothing forms a rows norm and the teller says credit only. It is not in this round's claim. | 57b70dc, `group.ts`, `norms.ts` |
| 5 | One act counted twice: a `claimsong` takes −1, and the credit row it causes takes −1 again. Bands get meaner with the norm on (claims 6.6 → 8.2 a world). | NOTE | Taken. The credit row no longer feeds the norm. | 57b70dc, `group.ts` |
| 6 | Cited beyond what bears: after one act, m = ±0.5 passes `SAY` (0.2), so the second song a band ever has is answered "because in the Hollow a song is everyone's". | NOTE | Taken. A norm is a reason, and worth telling, only once held surely: `sure` = (1 − v)·\|m\| ≥ 0.3, which takes two acts of a kind, not one. Below that, it is not weighed at all (row 12). | 57b70dc, 748f5de, `norms.ts` |
| 7 | Bands where nothing was ever answered score as (0, 0) agreement: 79 of 799. | NOTE | Taken. The five-year counter is also read with those bands left out. | `diag/norms.ts` |
| 8 | Rows lock-in loop: each let-go teaches −0.5 to every member. | NOTE | Moot while `normrows` is off. To be watched in its own round. | — |
| 9 | Front door: `beliefsHeld` returns beliefs with negative subjects. A future reader that calls `P(w, subject)` would break. | NOTE | Taken in part. `boundary.ts` now says that a subject below 0 is a group. The note goes on #60 before merge; not posted. | 57b70dc, `boundary.ts` |
| 10 | `docs/ARCHITECTURE.md` lists no switch for the round. | NOTE | Taken: `norms.ts` row and the three switches. | 57b70dc |
| 12 | Found in the re-sizing after the review: claims still rose 18% with the norm on, the same with telling off. A loosely held norm weighed at its neutral pulls the scores of rare answers up, because a score is a geometric mean. | — | Taken. A norm is weighed only once held surely. On 200 worlds, claims are 6.89 a world against 6.58 off, where they were 7.77. | 748f5de, `norms.ts` |
| 11 | "Claimsong because people keep an eye on who gets the credit" reads as a licence to claim. | NOTE | Not taken. It is the norm working as designed: where credit is fought over, claiming is what is done. | — |

## The lead session's four questions, as answered

1. **Primary.** The review recommends the five-year horizon, with telling's part as the claim. The stop is r(5y) < 0.25. The contrast is a Fisher-z difference, on minus telling off, with a one-sided lower bound above 0. Sized at 200 telling-off worlds: z difference 0.39, SE 0.13. 80% power needs SE ≤ 0.118, so ≥ 100 telling-off bands, about 300 worlds; it recommends 400. The pre-mortem prefers members who never overlapped a founder (Jacobs and Campbell's test). BOARD must say that the counter was set after the sizing.
2. **Why 0.71 with acts alone.** Overlap, not a runaway loop. From the 1,500 worlds: |m| plateaus at 0.36–0.38 from the second decade, 5–6% of norms are ≥ 0.8 in every decade, and none reach 1.5. Bands that keep their founders go from 0.32 to 0.37, with the same sign in 66%. The pre-mortem adds that the norm is a running mean whose uncertainty shrinks to about 1/(n+1). It barely moves once set, so a band's norm is fixed by its first year. That is a design question for a later round (MacNeil and Sherif: arbitrary norms decay fastest).
3. **Rows ladder.** A separate part (see 4 above).
4. **Fail-if 5.** Pre-register the page frame: the ten present years, with the witness as the battery picks it. Report the 40-year figure beside it, as a frame artefact. The reading (48 pairs, ±0.25) cannot see the mechanism: about one norm-decided act a decade reaches the witness. So the round is judged on its counter and on "reads no worse", and the pre-registration says so.

## Pre-mortem, ranked by odds times harm

1. Kept on a one-year r that overlap alone gives, and later shown to be shared observation. Sign: acts alone match telling. Prevention: five-year or non-overlap counter, with the telling contrast (2).
2. Both battery arms identical, so the round reads "null" and a week is lost. Sign: byte-identical on and off outputs. Prevention: the flip (1).
3. Reads worse because of the hollow word line and more "stayed" lines, and the norm takes the blame. Prevention: the rows part split off (4).
4. Norms are coin flips of year one that never decay: four of five bands can be named, none for a reason of character.
5. A fixture reader does `P(w, subject)` on a negative subject (9).

**What a Crusader Kings or Dwarf Fortress designer would add:** a moment where the norm bites. A violation answered by citing it; a newcomer told one thing who then sees another; a norm carried from an old band to a new one; a norm changed on purpose. Members never disagree. **A psychometrician:** the 1-year r is the reliability of shared evidence, not transmission. Overlap is a confound left unmeasured while selection is measured. The telling-off arm is underpowered. The reading is a guard only.
