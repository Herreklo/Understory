# The blind paired reading

How a round asks whether a change makes lives worth more to a reader, and how the answer is judged.

## What readers see

`src/tools/diag/pairarm.ts` builds the same worlds with the change on and off and picks the three adults of each world who are most eventful over both arms together, so neither arm is favoured by the choice. Each person is shown twice, as the app shows them: ten present years, each line with its reasons. Which arm is version A is dealt out half and half and then shuffled, so readers who favour the version they read second favour both arms equally. The key goes to nobody who reads.

A pack has **24 pairs** (eight fresh worlds, three people each). A reader reads at most twelve pairs at a sitting, so the pack is also written in two parts (`pairs-1.txt`, `pairs-2.txt`). Three readers on a model other than the one that built the change, each in a role (a novelist, a social worker, a player of simulation games), read both parts at separate sittings. They are told only that the two versions are two versions of the same person's life. For every version they give a score from 1 to 5, up to three faults with a kind and an exact quote, and up to two quotes of a reason that made an act make sense; for every pair, the version they would rather read on.

The pack, the brief and the key are committed before the reading, and the reading is scored before any other number of the round is read.

## How it is scored

`scripts/pairscore.py` scores the answers against the key:

- **The effect.** For each pair, the on version's score minus the off version's, averaged over the readers. Readers score the version they read second about half a point higher (rounds 29, 31 and 32), so the effect is estimated with the order as a second term: difference = effect + lean × (+1 if the on arm was B, −1 if A). With the order dealt half and half the point estimate equals the plain mean, and the interval is narrower, because the lean is taken out of the noise. Reported with its 95% interval and its one-sided 90% lower bound.
- **The majority** in each pair, for a plain count.
- **Agreement among the readers** (Krippendorff's alpha, `scripts/alpha.py`). It describes the panel, not the change: readers can agree a life got better while disagreeing on the scale. It is reported, not used to keep or drop a change.
- **Faults by kind** in each arm, and every quote matching the round's own wording, good or faulted.
- **How much happened.** Readers choose the version where more happens: over rounds 29–34, when the two versions were five or more lines apart, the longer was chosen 70% of the time, and each ten lines more in the on version moved the difference by about +0.16. The two arms of an engine change are different worlds, so the same person's two pages differ by 16–28 lines (sd) in every round. The scorer reads the pack and reports the lines in each arm, how often the longer version was chosen, and the effect with the difference in lines as a third term. The round is judged on the effect with the order as a term: a change that makes more happen is meant to read better for it. The third term says how much of the effect is that, and how much is the same amount of life reading better.

## How a round uses it

A pre-registration states one of two claims, before the code:

- **Reads better:** the effect's one-sided 90% lower bound is above 0.
- **Reads no worse** (for a change whose claim lies elsewhere, such as a fix to the record): the lower bound is above −0.3.

Alongside, the round's own wording is quoted as a good reason at least as often as it is quoted as an unfit one, and the round names its bar for each.

Why 24 pairs: the per-pair difference, with the order taken out, has a standard deviation of about 0.7 (rounds 29–33). At 24 pairs the 95% interval is about ±0.3, and a true effect of +0.4 shows above zero nine times in ten. At 12 pairs it is ±0.45, and a true +0.4 shows about three times in four.
