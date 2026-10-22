# What our blind readings say makes a life worth reading on

Research source for the intrigue question, 22 Oct 2026. It reads only what is on file: 14 blind readings, 276 pairs, 552 pages (rounds 29–34, 37, 39–41 busiest and random, M38's null), plus round 40's busiest re-read twice in M38 as a replication. Scripts and full outputs: `notes/research/sources/intrigue-scripts/` (`data.py`, `features.py`, `analysis.py` → `analysis-out.txt`, `themes.py` → `themes-out.txt`, `top.py` → `top-out.txt`). Shared with sibling researchers there: `analyse.py` and `dump.ts` are not part of this note.

## How the numbers are made

- **One scale across M38.** Each reader's scores are z-scored within its own reading (its sittings joined), then averaged over the readers of a version. Rounds 29–41 (old brief) and M38 (every-fault brief) are compared only by position within their own reading, never by raw score. The order lean (B read second) is taken out within each reading. One raw point is about 1.4 z under the old brief (a reader's sd within a reading 0.70) and about 2.4 z under M38's (sd 0.42).
- **Controls.** Lines, and kinds of line. Kinds are the key's for rounds 37–41 and the M38 null (8 readings, 192 pairs, 384 pages: the primary set); for rounds 29–34 a text proxy (distinct three-word templates of the normalised line, r = 0.96 with the key's kinds where both exist). Both sets are reported.
- **Three contrasts.** Across lives (each page's score on the feature, lines and kinds, both versions of a person clustered); within pairs (the A−B score difference on the A−B feature difference, Δlines and Δkinds, the lean as intercept); and matched pairs (versions within 8 lines and 5 kinds of each other, one read ≥0.5 z better). Intervals are 95%, bootstrap over pairs, 1000 draws.
- **Reliability.** The same 48 pages scored in round 40 and again in M38 correlate r = 0.80 (pair differences 0.87). Two readers of one reading correlate 0.71 on average (0.40–0.93, 40 reader pairs). A page's score is a usable measure. It is still one model in three roles.

## The features, as rules on the page

Each rule is in `features.py`. "Named" means a run of one or two names from the setting's lists. The protagonist is the header's name or its first word.

| Feature            | Rule                                                                                                                                                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cast               | a named other in lines that also name the protagonist, in 3+ different years (`cast_any`, `cast2`; `cast_core`: 5+ years)                                                                                                                                                                               |
| conflict / feud    | an opposing act (a lexicon of ~40 templates: dragged up, had a go at, took the credit, froze … out …) between the protagonist and a named other; feud: the same person in 2+ years (`feud3`: 3+)                                                                                                        |
| want with setback  | a want of the protagonist (started trying, means to, got there, gave up on) spanning 2+ years, and a setback of the protagonist (passed over, turned down, said no, froze, gave up)                                                                                                                     |
| turn               | a line naming the protagonist with a job change (became … at, started work at, retired, resigned, will step down), a home change (bought a house, moved), a partner change (started seeing each other, got married, split up, divorced) or a birth (was born to). "Passed over" and wants are not turns |
| reversal           | a tie with one named person made then broken, or broken then mended; or a job gained then left                                                                                                                                                                                                          |
| open end           | a want started and not ended, a rupture or conflict in the last two or three years, or a secret not out by the end                                                                                                                                                                                      |
| secret             | hidden things (nobody knew, kept it to herself, let people think, took a little from, found out …); `secret_arc`: hidden, then out later                                                                                                                                                                |
| death / aftermath  | a line with "died"; aftermath: 2+ later lines whose reasons cite a death                                                                                                                                                                                                                                |
| callbacks          | lines whose reason cites an earlier year of the page                                                                                                                                                                                                                                                    |
| choice with a cost | the protagonist acts and the reason says "though" or "despite"                                                                                                                                                                                                                                          |

## 1. High against low

Most of what separates high pages from low ones is how much happens, and above all how many kinds of thing happen. Lines alone explain R² 0.25 of a page's score; lines and kinds 0.44. Per ten kinds, +0.80 z; per ten lines with kinds held, −0.12 z (192 pairs, key kinds; all 14 readings: +0.77 and −0.17). All 18 candidate features together add 0.03 to the adjusted R² (0.434 → 0.466).

**Raw high against raw low** (rounds 29–41: mean score 4+ over readers, 75 pages; 2 or less, 61 pages). The high pages have almost every feature more often. They are also twice as long (74 lines against 40) with twice the kinds (51 against 26 by proxy), and 48 of 75 were read second (27 of 61 low ones). A turn: 88% against 41%. A cast of 2+: 97% against 57%. A feud: 96% against 54%. A want with a setback: 64% against 20%. A secret that comes out: 45% against 15%. A death: 31% against 16%. Taken alone, these prevalences say only that more happens on the high pages.

**After lines and kinds**, one feature stands clear in every contrast:

| Feature                 | Pages with it | Across lives, +lines +kinds | Within pairs, +lines +kinds (pairs differing) | Matched pairs: winner only / loser only |
| ----------------------- | ------------- | --------------------------- | --------------------------------------------- | --------------------------------------- |
| **turn**                | 73%           | **+0.30 z [+0.16, +0.44]**  | **+0.59 z [+0.31, +0.86] (49)**               | **8 / 1**                               |
| want with setback       | 47%           | +0.10 [−0.05, +0.24]        | +0.15 [−0.12, +0.41] (77)                     | 10 / 7                                  |
| death                   | 22%           | −0.00 [−0.15, +0.16]        | +0.23 [−0.07, +0.53] (48)                     | 5 / 5                                   |
| secret                  | 70%           | −0.11 [−0.27, +0.05]        | −0.22 [−0.47, +0.03] (67)                     | 4 / 6                                   |
| open end                | 81%           | −0.02 [−0.23, +0.18]        | −0.10 [−0.42, +0.21] (47)                     | 6 / 3                                   |
| reversal                | 66%           | +0.05 [−0.10, +0.20]        | −0.09 [−0.34, +0.17] (73)                     | 6 / 8                                   |
| feud (2+ years)         | 80%           | +0.06 [−0.12, +0.24]        | +0.04 [−0.18, +0.26] (54)                     | 5 / 3                                   |
| cast_core (5+ years)    | 79%           | +0.05 [−0.12, +0.23]        | +0.15 [−0.12, +0.40] (57)                     | 3 / 5                                   |
| callbacks (per sd, 4.6) | —             | −0.01 [−0.10, +0.07]        | −0.02 [−0.16, +0.13] (177)                    | winner +0.4 callbacks                   |
| choice with a cost      | 61%           | +0.04 [−0.10, +0.17]        | +0.08 [−0.15, +0.32] (74)                     | 6 / 5                                   |

The first two columns are the primary set (384 pages, 192 pairs, key kinds). Matched pairs come from all 14 readings: 42 pairs, kinds by key where it has them. The all-readings versions agree: turn +0.29 [+0.18, +0.43] across lives and +0.56 [+0.32, +0.81] within 77 pairs. With the round's arm as a term, the within-pair turn effect is +0.60 [+0.31, +0.87] (192 pairs) and +0.57 [+0.34, +0.81] (276 pairs). It also holds on pages of 20+ lines only: +0.26 [+0.12, +0.40] and +0.27 [+0.14, +0.39].

- **The turn is worth three to seven kinds** (one kind is +0.08 z), about +0.4 of a raw point under the old brief. By kind of turn, within pairs: a job +0.29 [+0.02, +0.51] (64 pairs), a partner +0.23 [−0.03, +0.47] (63), a birth +0.43 [+0.09, +0.78] (46). A home change is too rare to tell (17 pairs). The all-readings estimates are similar (job +0.31, partner +0.28, birth +0.33, all with intervals above 0).
- **A cast and conflict cannot be tested here.** Of pages of 20+ lines, 99% have a cast and 98% conflict. The busiest-adult selection fills every page with both. Their raw advantage (cast +0.68 z, conflict +0.35 across lives) comes from the dozen nearly empty pages (under 20 lines, 13 of 552) and is gone without them. Only 10–12 pairs differ on them. The count of recurring people (`cast3`) is +0.23 z per sd within pairs with proxy kinds but +0.04 with key kinds: not robust.
- **A want with a setback is the second candidate**, small and borderline: +0.10 to +0.22 z across specifications, intervals touching 0. A long want alone is nothing (−0.07 to +0.07).
- **Secrets read slightly worse**, if anything: −0.22 within pairs (key kinds), −0.58 [−1.13, −0.01] across lives in the M38 re-read (48 pages). Secret lines are among the most formulaic on the page (below).
- **Open ends, reversals, callbacks, choices against the grain: nothing** at this n (intervals about ±0.25 z across lives, ±0.3 within pairs).

Confounds: the rules were written after reading the packs' commonest templates, not their scores. The turn rule was tightened once after the first run (a promotion lost to another person was taken out); that raised the within-pair estimate from +0.47 [+0.14, +0.79] to +0.59. About 25 features were tested in several models, so expect one or two false positives at 95%. Only the turn holds in every model, in both kinds sets, with the arm as a term and in matched pairs. The busiest selection makes most features near-universal, so this is a test of what separates eventful lives, not of what makes a quiet life worth reading.

## 2. "Rather read on"

It is the score with a tiebreak. In all 578 untied reader-choices (276 pairs, 804 choices), readers chose the version they scored higher. In the 226 ties (28%), they chose B 59% of the time and the longer page 53% (118 of 222). Beyond lines and kinds, the share of readers choosing a version rises with:

- **a turn: +0.18 [+0.09, +0.27]** (192 pairs; +0.18 [+0.10, +0.26] over 276, also with the arm as a term);
- **a death: +0.11 [+0.01, +0.21]** (+0.09 [+0.00, +0.17] over 276): a death moves the choice more than the score;
- recurring people, +0.07 per sd [+0.02, +0.12], and a smaller share of repeated lines, −0.08 per sd [−0.14, −0.02]: both with proxy kinds only (276 pairs), not with key kinds.

## 3. What readers praise and fault, in their own words

The answers have no free text. Before M38 every fault and good reason is an exact quote: 2 of 4472 fault quotes are not verbatim, and neither is commentary. A reader's own words are therefore its fault kinds and the lines it picks. Below, citations per 100 line-readings by kind of line, matched to the line (reasons matched on reasons). The old brief covers 504 pages, 3 readers, ~32,000 line-readings; M38 covers the null and the r40 re-read, 96 pages, 2 readers.

| Kind of line (share of lines, old)      | Good reason, old / M38 | Repeat         | Out of nowhere | Unfit reason   |
| --------------------------------------- | ---------------------- | -------------- | -------------- | -------------- |
| all lines                               | 3.0 / 2.5              | 1.0 / 4.0      | 0.6 / 1.3      | 1.3 / 3.4      |
| lost out: passed over, turned down (3%) | **7.1** / 3.3          | 0.8 / 5.0      | 0.8 / 2.9      | 2.6 / 4.8      |
| job turn (1%)                           | **6.3** / 2.8          | 0.0 / 0.0      | 1.0 / 3.3      | 1.5 / 2.2      |
| let down when it mattered (2%)          | **5.6** / 1.0          | 0.1 / 1.9      | 0.3 / 0.0      | **5.9 / 15.8** |
| partner turn (1%)                       | **5.4** / 4.9          | 1.0 / 0.7      | 1.5 / 2.1      | **5.7** / 4.9  |
| other one-off acts (24%)                | 4.8 / 5.4              | 1.2 / 3.8      | 1.0 / 1.4      | 1.5 / 2.9      |
| conflict (13%)                          | 3.6 / 3.3              | 1.2 / 3.0      | 0.4 / 0.7      | 1.2 / 3.3      |
| small kindness (12%)                    | 1.9 / 1.3              | 0.3 / 1.3      | 0.1 / 0.1      | 0.6 / 1.6      |
| band routine (8%)                       | **0.4** / 0.2          | 1.1 / 2.4      | 0.0 / 0.2      | 0.7 / 3.3      |
| town calendar (6%)                      | 1.4 / 1.0              | **2.7 / 11.6** | 0.4 / 0.7      | 0.9 / 4.3      |
| a want started or ended (3%)            | 0.9 / 0.2              | 1.4 / **13.1** | 0.7 / 2.3      | 1.5 / 2.5      |
| a friendship ended (3%)                 | 3.0 / 4.0              | 0.8 / 2.5      | 1.4 / **6.5**  | 2.8 / **20.3** |
| death (0.4%, 143 lines)                 | 3.0 / 0.0              | 0.0 / 0.0      | **3.3** / 3.4  | 0.0 / 0.0      |

**Praise** goes to rare acts with consequences: losing out to someone, a new job, a marriage or a parting, a friend not being there. The good reasons quoted most often are "started drinking more than was good for her" (39), "decided to stay with X and give it another go" (38), "went in after X without a second's thought" (37) and "told X it was over" (36). In conflict lines it is "made a joke at X's expense, and nobody laughed" (49) and "froze X out for weeks" (23). The routine draws almost none: a band's nights, the festival, new friendships, a hat going round.

**Faults that are about dullness, not error.** The brief has no fault for "dull" or "goes nowhere". Two kinds carry it:

- **repeat (samey):** concentrated on the town calendar ("The summer festival that X put on was the best night the town had had in years", 74 quotes; "told X to count her in", 57), the band's routine, and, in M38, wants restated ("got there", "no longer talks about wanting", 13.1 per 100);
- **out of nowhere (going nowhere, or arriving from nowhere):** endings with nothing leading to them ("stopped seeing each other, and that was that", 17; "lost touch", 10), deaths, wants that resolve unseen, and turns of mood ("took it badly, and let everyone see it", 28).

Unfit reasons, false lines and wording are errors: unfit reasons are concentrated on being let down and on partings (20.3 per 100 friendship endings in M38).

**Which faults cost score.** Within a reader and a page, with lines, kinds and order held: each repeat costs −0.25 z under the old brief (1008 reader-pages, rounds 37–41) and −0.11 under M38's (192, uncapped). Each out-of-nowhere costs −0.17 and −0.05. Unfit reasons (+0.02 and −0.03), false lines (−0.07 and −0.02) and wording (+0.11 and 0.00) barely move the score. Each good reason given goes with +1.06 and +1.03 z. Readers mark errors but score sameness and things arriving from nowhere; what they reward is reasons that make an act make sense.

## 4. The most intriguing lives on file

These are pages every reader scored 4 or more (74 old-brief pages; only two scores of 5 in 1512 old-brief scores). They are ranked by the lean-adjusted score, and the three below are the clearest.

- **Oliver Sayer, round 40 busiest, P12 B (on arm), 107 lines, 48 kinds: 4, 5, 4.** It is the only life on top in both round 40's reading and M38's re-read (4, 4, at +2.03 z; Opus's novelist gave 3). He marries Audrey, and four children follow. He wants head of the clinic and gets it in 2029 over his friend Jonah Fielding, Lily and his own wife. He freezes at the first staff meeting; Audrey confronts him in front of everyone, and he sulks for months. Years of rows about the house follow, then the hatchet is buried with Lily and later with Audrey. His father dies in 2032 and he starts drinking; Audrey goes at him about it. Near the end he tells people what Lily told him in confidence. His other version (40 lines, 2, 2, 2) has no turns.
- **Arthur, round 31, P07 A (off arm), 79 lines: 4, 4, 4**, the highest lean-adjusted score on file (+2.19 z). He carries a debt nobody knows about (2026, 2029, "badly in debt" 2034), and in 2034 he has to sell the house. His marriage to Beth wears down through rows about money; first she, then he, begins to wonder whether to stay. Beth has a heart attack, and Arthur stops drinking. In 2035 she decides to stay; he then tells her it is over. They divorce, he starts seeing Grace, and in 2036 Grace is back in hospital and tells him everything. His other version is the same size (74 lines, 50 kinds) and scored 3, 3, 3: no marriage arc, few rows (3 conflict lines against 11).
- **Greta, round 41 random, P21 A (on arm), only 50 lines and 33 kinds: 4, 4, 5.** For ten years she and Sylvia are both after the skipper's job. Sylvia works first-in-last-out (2028, 2031, 2034); Greta runs her down to Ben and picks holes in her work. Meanwhile Greta works gently at a marriage with Ellie ("could have a row and be laughing about it by dinner"). In 2036 she becomes skipper "after 18 years of wanting it", freezes at the first meeting, and Sylvia confronts her in front of everyone. Her other version is the same size (46 lines, 28 kinds) and scored 3, 2, 3: a want for foreman is voiced and dropped, and friendships end "and that was that".

What the three share: one named rival, a want that lands as a turn late on and costs something at once, and a marriage under strain, all with the same few names over the decade. The statistics can isolate only the turn; the rest is saturated in busy pages or too rare to tell.

## Caveats

- One model (Fable) in three roles; "intrigue" here is "worth reading" on a 1–5 scale that is coarse (the old brief almost never gave 5; M38's null gave 3 to 76 of 96 versions).
- Pages are the three most eventful adults of a world (or, in random packs, three random adults). That fills pages with cast and conflict, so their part cannot be measured here.
- Features add kinds. "Beyond kinds" means "worth more than any other new kind of line", not "independent of variety".
- Both versions of a person come from different worlds (two arms or two run seeds), so a turn is not assigned at random: a turn may come with other differences in the life that no rule here sees.
