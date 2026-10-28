# Round 48 sizing: the band year

_Design, build and size, 28 October 2026, on `round/48` (#112). Research: `notes/research/band-year.md`. Throwaway worlds only (9001 and up), run from the town's founding with no past and 40 years, as the note's probes were, and, for the page, with the usual 30-year past and ten present years. Tool: `src/tools/diag/norms.ts` (`found A B rule`, `pages A B rule`, `report rule off`). Nothing was pre-registered, no fresh world was run and nothing was read._

## Verdict

**It clears, by a wide margin on the counter, with one fail-if on its line.** After the last founder has gone, the founders' credit norm correlates with the members' a year on at **r = 0.81 [0.78, 0.83]** (one-sided lower bound 0.79, 799 bands, 1,500 worlds), against the 0.25 stop and the note's 0.34. The norm flips **8.5%** of the decisions it is weighed in (gate 5%). Fail-ifs 1 to 4 clear. Fail-if 5 clears in the frame the note set its baseline in (the ten present years: 72%), and sits on its line counted over 40 years from the founding (30.3% ±1.3).

Three things the review should weigh:

1. **Acts alone carry it too.** With telling off, r = 0.71 [0.60, 0.79]. The note expected about 0.1. A year after the last founder, most members overlapped with the founders and formed their norm from the same acts. Telling is what makes it last: five years on, r is 0.57 with telling and 0.25 without. The counter clears easily because a year is short. The five-year drift is the harder number.
2. **The rows ladder changes what happens.** Now that the speaker decides, askings-to-leave fall by a third (0.80 against 1.17 a world over 40 years). A row let go goes on to swallow-or-quit, so "stayed for the others' sake" nearly doubles (3.66 against 1.91).
3. **A loop was found and fixed during sizing.** In the first build, a speaker facing a warned member could have a word again rather than ask. In some worlds one pair had 15 identical "one more row and … would be done with him" lines. While a word stands, the options are now to ask or to let it go (aec0a56), and `grouptest` fails a second word while the first stands. All numbers here are from the fixed build. The first build's outputs are kept in `out-norms/v1/`.

## Against each fail-if

| Fail-if | Check | Sized (on) | Line | Clears |
| --- | --- | --- | --- | --- |
| 1. It is words | decisions the norm is weighed in where removing it flips the choice (`neutralised`, `flip.ts` matcher `norm:`) | **8.45%** pooled (5,399 of 63,887); 8.47 ±0.38 a world. Authorship 8.13% (59,962 weighed); rows decisions 13.4% (3,925) | ≥ 5% | yes |
| 2. Dies with its founders (the counter) | founders' mean credit norm over their last 12 months against members' a year after the last left, across bands | **r 0.81 [0.78, 0.83]**, n 799. Members holding a norm: 0.82 [0.80, 0.85]. Rows norm: 0.90 [0.88, 0.91]. Selection (founders' make-up against members'): −0.04 [−0.11, 0.03]. Telling off: **0.71 [0.60, 0.79]**, n 102 | stop < 0.25 | yes |
| | drift | 3 years after: 0.65 [0.61, 0.70]; 5 years: 0.57 [0.52, 0.63]. Telling off: 0.42 [0.23, 0.58] and 0.25 [0.02, 0.46] | — | — |
| 3. Only the members' traits | members' mean held norm against their mean modesty and sincerity | a year on r 0.19 (n 799); every band alive at the end 0.21 (n 4,615) | stop > 0.7 | yes |
| | bands matched on founders' make-up (within 0.1), founders' norms three years in | opposite sides in **57.8%** of 4,770 pairs; 0.5 or more apart in 51.5% | ≥ a third | yes |
| 4. Big casts or repeats | cast | a band's members only; one teller per newcomer at most, chosen from state (no cap). The median is 1 | median ≤ 2 | yes |
| | repeats | told lines 1.36 a world-decade; 45.7% of newcomers told; a teller tells 1.55 newcomers in 40 years (most 10). Norm lines in any world's top 25: **0** of 200 | none in top 25 | yes |
| | copy share (pages, 200 paired worlds) | 15.28% against 15.26%; difference +0.02 ±0.22, one-sided bound **+0.20** | < +0.6 | yes |
| | "did not come to much" | pages: 18.57 against 20.18 a world (−1.61 ±2.39). From founding, paired 200: 3.77 against 3.71 a world-decade (+0.07 ±0.28) | must not rise | yes (within noise, down on the page) |
| 5. No one can see it | of acts a norm decided (flipped), the share the witness knows | ten present years (pages): **72.2%** (171 of 237, ±5.7). From founding, a witness picked at year 0 over 40 years: **30.3%** (1,527 of 5,035, ±1.3) | ≥ 30% | yes in the note's frame; on the line over 40 years |

The note's baseline for fail-if 5 (the witness is in a band 2.4 of ten years, in or close to one 6.7) is of the ten present years, so the page frame is the one it set. The 40-year figure is lower because a witness picked at the founding is often a child, or dead, for much of the span.

## The cast and what changes, per world over 40 years from founding

| | on (1,500) | off (200) |
| --- | --- | --- |
| bands | 3.70 | 3.65 |
| bands that lose every founder | 0.67 | 0.65 |
| scored a year on | 0.53 | 0.52 |
| newcomers told how things go | 5.45 | — |
| a word (second row) | 0.96 ±0.07 | 1.50 ±0.26 |
| asked to leave | 0.80 ±0.06 | 1.17 ±0.20 |
| stayed for the others' sake | 3.66 ±0.22 | 1.91 ±0.30 |
| quit after a row | 2.10 ±0.11 | 1.70 ±0.26 |
| cheer / back / resent / claim a song | 12.9 / 13.4 / 9.2 / 8.2 | 13.7 / 13.3 / 8.8 / 6.6 |

No pair loops. No one gets a second word while the first stands, and `grouptest` checks that. In the two busiest worlds, the most anyone has is one word, and the most rows one person swallows is 8 in 40 years. The engine already marks those ("Nobody was surprised any more").

## Lines

- "Tess told Mark Sayer how it goes in the Lanterns: people keep an eye on who gets the credit." [thinks the world of Mark Sayer; sure of how things go in the Lanterns]
- "Oliver Baker was the first to say Tilly Baker's song was the best thing they had." [… thinks the world of Tilly Baker; in Saltwater, a song is everyone's once it is brought in]
- "Alex told Lisa how it goes in North of Here: a song is everyone's once it is brought in." [thinks the world of Lisa; had heard from Greta Brook that Lisa played Greta Brook's song the way it was written …]

## What was built

Behind `ON=norms` (off by default; with it off nothing new runs and no draw is taken).

- **A norm is a belief held by each member** about their band, in the store that holds beliefs about people (`w.beliefs`, holder → `<subject>|norm:credit`, the band's subject being −1 − its id). It has a strength `m` and an uncertainty `v`, and settles as a belief about a person does: the first acts seen move it most. Nothing is held on the band itself.
- **Credit** (the counter's norm): every member present takes each answer to a bandmate's song as evidence. Cheering or backing it counts toward "a song is everyone's once it is brought in", resenting or claiming it toward "people keep an eye on who gets the credit". A credit row found out counts too. Each member's own answer to a song weighs their held norm beside the five strongest considerations, never cut (`beside` in `grammar.ts`), and when it decides, the reason names the band: "in The Hollow, a song is everyone's once it is brought in".
- **Rows**: the ladder in `escalation()` now only says what is on the table. A second row in three years puts a word there. A third, or a row after a standing warning, also puts an asking-to-leave there. The member who would say it (chosen from state, as before) decides whether to let it go, have a word or ask them to leave. The decision weighs their forgiveness, boldness, organisation and liking, how many rows there have been, and their held norm about how rows go here. That norm is formed from what members see follow a repeated row.
- **Telling a newcomer**: when someone joins, the incumbent most moved to say how things are done here is found from each one's own state: how sure they are of a norm, how bold they are, how they like the newcomer. That one decides whether to tell. The newcomer takes the teller's version (`normVersion` in `telling.ts`): bent toward the teller's own make-up and laid on by one who will say anything. They take it as surely as they think well of the teller, and go on learning from what they see. One line: "@T told @N how it goes in The Hollow: …". Nothing counts tellings, caps them or times them.
- **The cast** is the band's members plus the one teller. Choir, cards and the Anchor are untouched.

## The power calculation

The counter is a Pearson r across bands that lose every founder and go on, so its sampling error is that of Fisher's z, with a standard error of 1/√(n − 3). To tell the note's estimate, 0.34, from the 0.25 stop: z(0.34) − z(0.25) = 0.0987.

| Aim | Scored bands | Worlds |
| --- | --- | --- |
| 80% power, one-sided α = 0.05 (2.487 / 0.0987)² + 3 | 638 | ≈ 1,200 |
| 95% interval of ±0.09 at r = 0.34 (1.96 × 0.884 / 0.09)² + 3 | 374 | ≈ 710 |
| Run: 1,500 worlds | 799 | 1,500 (power > 0.95 at 0.34; ±0.03 at the r found) |
| The note's 160 worlds | ≈ 69 | 160 (±0.21, power 0.17) |

A world gives 0.53 scored bands (799 of 1,500): 0.67 bands a world lose every founder within 40 years, and four in five are still going a year later. The first 200 worlds gave 0.49, so 1,500 were run, which the calculation asked for at the rate first seen. At the r found, 200 worlds would have settled it (0.84 [0.77, 0.89]). Every number here is re-derived from `out-norms/found-on-*.json` and `pages-*.json` by `./run.sh src/tools/diag/norms.ts report on off`.
