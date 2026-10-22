# Round 42 sizing: reasons that bear on the act

_22 October 2026, tree `62986f5` on `round/42`. Throwaway worlds only (9001–9024); no fresh world was run. Full output: `reports/42-size.txt`; one line a world: `reports/42-size-worlds.jsonl`._

**Verdict: check 2 hits its stop line, so the round stops before a reading.** Bear changes 140 of the 434 line-readings M38's readers faulted for an unfit reason on a line with a trait reason (32%, against a line of 40%). Most of what readers fault is in the wording, not in whether the trait bears. Check 4 also says the reading could not see the effect, so the round could only ever have been judged on its counter.

## What was built

Behind `OFF=bear` (on by default):

- **Traits.** A trait reason is shown only where the chosen expression prefers or shows the facet, or where `motives.ts` has wording of its own for that facet and family.
- **Told accounts.** An account is shown only where it decided the choice. That means setting it aside would halve the odds of the answer chosen (the honest-why test, on the scores, with no draw), or it turned a choice of counterpart that month.
- **The record.** `grammar.ts` marks the remaining reasons in the decision record (`idle`), and `shownCauses` in `page.ts` leaves them out. Reasons a situation gives as its own (`reasonsFor`) are shown as written.

Nothing a person does changes:

- With `OFF=bear`, the world is identical to main (`scripts/identity-ci.sh` run locally on a merge with main: seeds 11–13 identical; words check identical).
- With bear on, the words check (`sig.ts`) is identical to off.
- On all 24 sizing worlds, every event's words and reasons, every bond and the random stream are the same on and off. Only the decision records' `idle` differs (about 2,000 decisions a world are marked).

## The counter

A world, over ten present years, counting decision lines on someone's page. Each figure is the mean with its 95% interval between worlds.

| | off (main's page) | on |
| --- | --- | --- |
| decision lines on pages | 856 ±27 | same |
| trait reasons shown | 814 ±28 | |
| trait reasons shown that do not bear | **166 ±7** (20.4%) | **0** |
| accounts shown as reasons | 42.5 ±3.8 | 6.7 ±0.9 |
| accounts shown that decided nothing | **36.0 ±3.7** | **0** |
| decision lines whose reasons change | | 22.1% ±0.6 |
| events shown under a line (every adult's page) | 457 ±30 | 457 ±30 |

The note estimated about 700 non-bearing trait reasons a world. That figure counted every decision in the present without the motive clause. On the page and with the clause, the number is 166. Without the clause, the expression test alone would drop 321 a world, and the clause keeps 48% of those.

## The five checks

| | Check | Number | Stop line | |
| --- | --- | --- | --- | --- |
| 1 | It drops reasons readers accept | Of the reasons the expression test alone drops, `motives.ts` words 48% for the family. The clause is the widening, so with it in, 0% of the dropped reasons are family-worded. Readers' view: 62% of the dropped instances are phrases M38 faulted at or below the base rate (3.1 per hundred). Dropped phrases overall are faulted 4.0 per hundred; kept ones 3.2. | over a quarter | literal line passed by the built-in widening; see below |
| 2 | It misses what readers fault | **140 of 434 (32%)** faulted trait-reason line-readings change. By pack: null 32%, r40 24%, shuffled 57%, planted 38%. Accounts: 33 of 40 (82%). | under 40% | **fires: stop** |
| 3 | Lines left bare | 1.41% ±0.19 of decision lines that had a reason (worst world 2.49%) | above 5% | passes |
| 4 | The reading can see it | Unfit reasons on the changed lines: 7.1 per hundred off. Power over 24 pairs and two roles: 82% to see the whole drop (to 3.0), **30% to see half**. The score: 6% to see +0.01; 80% power needs about +0.27. | under 80% for half | **fires: judge on the counter alone** |
| 5 | Accounts vanish from the page | Busiest pages (72): 89% show an account off, 36% on; 41% of the pages that had one keep one | under one page in three | passes, narrowly |

**Check 2, how it was measured.** Every true page M38's readers read was rebuilt with bear (288 page-readings):

- null from this tree;
- r40 from round 40's tree (`9a03b53`), with this commit cherry-picked;
- the true halves of shuffled and planted, which are round 41's busiest on arm, from round 41's tree (`eba5885`), with this commit cherry-picked.

All 10,977 rebuilt lines match the lines that were read, word for word, and all 683 unfit reasons are recovered. The note counted 398 motive line-readings; this count finds 434 lines with any trait reason, and every one of them is worded as a motive.

**Why it misses.** Of the faulted trait lines bear leaves alone:

- 236 had no event to check the reason against ("none").
- The reasons on them bear on the act by the test. Some are worded for the family: "thought it needed saying", "said what would work", "had her own life to get on with" (the note's 18 per hundred). Others are read by the expression: "likes things done properly and on time" where the act is a duty.

The pairing is wrong in the words, not in the facet. Accounts are the exception: bear changes 82% of the faulted account lines, but there are 40 of them in 288 page-readings.

**Check 1, read with care.** The note's line ("if `motives.ts` words over a quarter of the dropped reasons for the chosen family, widen the test to the family") is met by the design itself, because the motive clause is that widening. The readers' measure is more worrying:

- Most of what bear drops is phrases readers faulted no more than anything else: "it mattered too much to let go" (2.2 per hundred), "would not give ground" (0.6), "does not panic" (1.4).
- A few dropped phrases are the worst ones: "could wait it out" (11.1), "wanted to keep the peace" (8.3), "has never been one to look back" (8.7).

The phrase rates are pooled over every line where a phrase appeared, not only lines where it did not bear.

## What the round could be judged on

- **Not the score.** The note expects +0.01. 24 pairs and two roles have 6% power to see that, and would need about +0.27.
- **Not the change in unfit reasons on the changed lines** at half the expected drop (30% power).
- **Only the counter**, which is 0 on by construction, plus "reads no worse". By check 2, the counter does not reach most of what readers fault.

## Reproduce

    ARMS=1 ./run.sh src/tools/diag/bear.ts 9001 9024 > out-r42/size.jsonl
    PACK=null ./run.sh src/tools/diag/bear.ts 3601 3608 3 > out-r42/pack-null.json
    # on 9a03b53 with 62986f5 cherry-picked (keep only the bear line in world.ts; pageLines takes `all`):
    PACK=together ./run.sh src/tools/diag/bear.ts 3529 3536 3 > out-r42/pack-r40.json
    # on eba5885 with 62986f5 cherry-picked (pageLines takes `all`):
    PACK=fit ./run.sh src/tools/diag/bear.ts 3585 3592 3 > out-r42/pack-r41.json
    python3 reports/42-size.py out-r42/size.jsonl out-r42/pack-null.json out-r42/pack-r40.json out-r42/pack-r41.json

The power simulation uses a fixed seed (42), 4,000 runs a figure.
