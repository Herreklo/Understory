# Round 48 sizing: the band year

_Design, build and size, 28 October 2026, on `round/48` (#112), at 748f5de after the review (`reports/48-review.md`). Research: `notes/research/band-year.md`. All worlds are throwaway (9001 and up). The counter's runs start from the town's founding with no past and last 40 years, as the note's probes did. The page runs use the usual 30-year past and ten present years. Tool: `src/tools/diag/norms.ts` (`found`, `pages`, `report`, `contrast`). Nothing was pre-registered, no fresh world was run and nothing was read._

## Verdict

**It carries, through telling, and the claim should be set where it can fail.**

- **At one year it clears by construction.** A year after the last founder has gone, the founders' credit norm correlates with the members' at **r 0.80 [0.77, 0.82]**, against the 0.25 stop. Telling off, it is still 0.75: most of those members shared a room with the founders and formed the same running mean from the same acts.
- **The clean test.** Members who joined after the last founder went never met a founder. Five years on, they hold the founders' norm at **r 0.29 [0.20, 0.37]** when newcomers are told, and at **−0.08 [−0.22, 0.06]** from acts alone. That is telling's part, as a difference in Fisher z: **0.38 ±0.17, one-sided lower bound 0.23**. The note expected about 0.34 with telling and 0.1 without.
- **All members at five years** gives 0.52 [0.45, 0.57] against 0.39 [0.27, 0.49]. That difference, 0.16 ±0.15, cannot be resolved without about 1,400 telling-off worlds.
- **The gate.** The norm flips **10.6%** of the answers it is weighed in.
- **Fail-ifs 1 to 4 clear.**
- **Fail-if 5** clears in the frame where the note set its baseline, the ten present years: 75.5%. Over 40 years from the founding, with a witness picked at year 0, it falls under its line: **28.0% ±1.7 against 30%**. The review calls the 40-year figure a frame artefact. It is Øystein's call.
- **Answers and rows**, paired against the norms off on the same 200 worlds, are each within noise.

Which number is the primary goes to the lead session before anything is pre-registered. Moving it after the sizing is stricter than the one-year counter, and BOARD must say so.

## The counter, five ways (credit norm; on: 1,500 worlds, telling off: 600)

| | On | Telling off (`OFF=normtell`) | Telling's part, Fisher-z difference |
| --- | --- | --- | --- |
| One year after the last founder, all members | 0.80 [0.77, 0.82], n 861 | 0.75 [0.69, 0.79], n 332 | — |
| Five years after, all members | 0.52 [0.45, 0.57], n 589 | 0.39 [0.27, 0.49], n 225 | 0.16 ±0.15 (lower 0.03) |
| Five years after, leaving out bands where neither holds a norm | 0.51 [0.45, 0.57], n 559 | 0.39 [0.27, 0.49], n 216 | 0.16 ±0.16 (lower 0.03) |
| **Five years after, members who joined after the last founder went** | **0.29 [0.20, 0.37]**, n 449 | **−0.08 [−0.22, 0.06]**, n 184 | **0.38 ±0.17 (lower 0.23)** |
| Five years after, partial r, members' norm when the last founder went held constant | −0.01 [−0.09, 0.08] | 0.01 [−0.12, 0.14] | — |

The partial r is zero in both arms because carriage is a chain: founders, then the members at their leaving, then the members after. The founders reach year five only through those between, and that is the mechanism, not a failure of it. Selection plays no part: the founders' make-up against the members' gives r −0.02. Three years on, the all-member r is 0.63 with telling and 0.60 without.

**Power for the recommended primary.** A world gives 0.30 bands scored on new members with telling, and the telling-off arm the same. At the sized difference (0.38) the arms run here give SE 0.087, so the power is 0.99. At half of it (0.19), the power is 0.71. The note's 160 worlds in each arm would give SE ≈ 0.21: no power. A fresh run of 1,500 worlds with telling and 600 without, from the founding, takes about 45 minutes on the Mac.

## Against each fail-if

| Fail-if | Sized (on) | Line | Clears |
| --- | --- | --- | --- |
| 1. It is words | **10.56%** of 26,884 answers weighing the norm flip without it (11.2 ±0.7 a world). Authorship only, since the rows decision is a separate part | ≥ 5% | yes |
| 2. Dies with its founders | above: one year 0.80; members who never met a founder 0.29 with telling, −0.08 without | stop < 0.25 (one year) | yes at one year; the claim moves to the clean test |
| 3. Only the members' traits | held norm against make-up r 0.20 a year on, 0.19 at the end (n 4,640). Bands matched on founders' make-up: norms on opposite sides three years in, **56.5%** of 4,784 pairs | > 0.7 stops; ≥ ⅓ | yes |
| 4. Big casts or repeats | one teller per newcomer at most, from state; 22.8% of newcomers told; told lines 0.69 a world-decade; a teller tells 1.39 newcomers in 40 years (most 7). Norm lines in any world's top 25: **0** of 200. Copy share 15.17% against 15.26%: −0.09 ±0.21, bound **+0.09**. "Did not come to much" on the page: −0.69 ±2.03 a world | median ≤ 2; none; < +0.6; no rise | yes |
| 5. No one can see it | of acts a norm decided, the witness knows **75.5%** in the ten present years (108 of 143); **28.0%** over 40 years from founding (794 of 2,838, ±1.7) | ≥ 30% | yes in the note's frame; **no** over 40 years |

## What changes, paired on the same 200 worlds over 40 years (a world)

| | On | Off | Difference | Telling off − off |
| --- | --- | --- | --- | --- |
| cheer a song | 13.66 | 13.71 | −0.06 ±0.77 | +0.23 ±0.73 |
| back it | 13.39 | 13.29 | +0.11 ±0.69 | +0.14 ±0.64 |
| resent it | 8.45 | 8.75 | −0.30 ±0.52 | −0.12 ±0.50 |
| claim it | 6.89 | 6.58 | +0.31 ±0.45 | +0.56 ±0.43 |
| a word / asked to leave | 1.38 / 1.09 | 1.50 / 1.17 | −0.13 ±0.21 / −0.07 ±0.17 | +0.01 / −0.03 |
| stayed / quit after a row | 1.82 / 1.50 | 1.91 / 1.70 | −0.09 ±0.24 / −0.20 ±0.25 | +0.04 / −0.01 |

Bands, founders lost and members are as off: 3.72 bands a world, 0.72 lose every founder, 2.66 members a year on.

## Four builds

- **v1** (aec0a56 and earlier) had a loop: a speaker could have a word again with a member already warned. One pair got 15 identical lines. It was fixed; while a word stands, the choice is to ask or to let it go.
- **v2** (61bb3d2, reviewed) had the norm on unless `ON=norms`, and the rows decision in. Its numbers: one year 0.81; askings −32%; "stayed" +92%.
- **v3** (57b70dc) took the review: on unless `OFF=norms`; the rows decision as a separate part (`ON=normrows`); a claim counted once; a norm a reason only when held surely. Claims still rose 18%.
- **v4** (748f5de, this report): a loosely held norm is not weighed at all. Weighed at its neutral, it had pulled up the scores of rare answers, because a score is a geometric mean.

Raw outputs of v1–v3 are in `out-norms/v1–v3/`. Every number above is re-derived by `./run.sh src/tools/diag/norms.ts report on off`, `report tellless off` and `contrast on tellless`.

## Lines

- "Tess told Mark Sayer how it goes in the Lanterns: people keep an eye on who gets the credit." [thinks the world of Mark Sayer; sure of how things go in the Lanterns]
- "Oliver Baker was the first to say Tilly Baker's song was the best thing they had." [… thinks the world of Tilly Baker; in Saltwater, a song is everyone's once it is brought in]
- "Alex told Lisa how it goes in North of Here: a song is everyone's once it is brought in." [thinks the world of Lisa; had heard from Greta Brook that Lisa played Greta Brook's song the way it was written …]

## What was built

On unless `OFF=norms`. With it off, nothing new runs and no draw is taken, and CI checks that arm against main.

- **A norm is a belief each member holds** about their band, in the store that holds beliefs about people: `w.beliefs`, holder → `<subject>|norm:credit`, where the band's subject is −1 − its id. It has a strength `m` and an uncertainty `v`, and settles as a belief about a person does: the first acts seen move it most. Nothing is held on the band itself.
- **Credit.** Every member present takes each answer to a bandmate's song as evidence. Cheering or backing it counts toward "a song is everyone's once it is brought in". Resenting or claiming it counts toward "people keep an eye on who gets the credit". Once a member holds the norm surely (two acts of a kind), it is weighed in their own answers to a song, beside the five strongest considerations and never cut (`beside` in `grammar.ts`). When it decides, the reason names the band: "in The Hollow, a song is everyone's once it is brought in".
- **Telling a newcomer.** When someone joins, the incumbent most moved to say how things are done here is found from each one's own state: how sure they are of the norm, how bold they are, how they like the newcomer. That one decides whether to tell. The newcomer takes the teller's version (`normVersion` in `telling.ts`): bent toward the teller's own make-up, and laid on thick by one who will say anything. They take it as surely as they think well of the teller, and go on learning from what they see. One line records it: "@T told @N how it goes in The Hollow: …". Nothing counts tellings, caps them or times them. `OFF=normtell` leaves the norm to the acts seen.
- **The rows decision** is a separate part, off unless `ON=normrows`. With it on, what follows a repeated row is the speaker's decision, weighing a rows norm. It is not in this round's claim.
- **The cast** is the band's members and the one teller. Choir, cards and the Anchor are untouched.
