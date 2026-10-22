# The blind paired reading

How a round asks whether a change makes lives worth more to a reader, and how the answer is judged.

## What readers see

`src/tools/diag/pairarm.ts` builds the same worlds with the change on and off and picks the three adults of each world who are most eventful over both arms together, so neither arm is favoured by the choice. Each person is shown twice, as the app shows them: ten present years, each line with its reasons. Which arm is version A is dealt out half and half and then shuffled, so readers who favour the version they read second favour both arms equally. The key goes to nobody who reads.

A pack has **24 pairs** (eight fresh worlds, three people each). A reader reads at most twelve pairs at a sitting, so the pack is also written in two parts (`pairs-1.txt`, `pairs-2.txt`). Two readers on a model other than the one that built the change, each in a role (below), read both parts at separate sittings. They are told only that the two versions are two versions of the same person's life. Each line of a page is numbered. For every version they give a score from 1 to 5, every fault they find with a kind, a severity and its line, and up to two lines whose reason made an act make sense; for every pair, the version they would rather read on. The brief is `brief.md`. (Rounds before M38 had three readers, a social worker the third, and up to three faults each, quoted.)

**The roles** are fixed, and never changed inside a round: **a novelist** and **a player of simulation games**, worded so in every sitting's instructions ("You are a novelist." / "You are a player of simulation games."). Fixed in M38, before its sittings.

The pack, the brief and the key are committed before the reading, and the reading is scored before any other number of the round is read.

## How it is scored

`scripts/pairscore.py` scores the answers against the key:

- **Warnings, first.** A cap (more than half the versions given the most faults any version got), a ceiling or floor (more than half the scores at 5, or at 1), or ties (more than half the pairs scored the same in both versions by a reader) means the reading cannot show what it was meant to, and is said before any number. A null reading ties by nature: 30 of 48 in M38's.

- **The effect.** For each pair, the on version's score minus the off version's, averaged over the readers. Readers score the version they read second about half a point higher (rounds 29, 31 and 32), so the effect is estimated with the order as a second term: difference = effect + lean × (+1 if the on arm was B, −1 if A). With the order dealt half and half the point estimate equals the plain mean, and the interval is narrower, because the lean is taken out of the noise. Reported with its 95% interval and its one-sided 90% lower bound.
- **The majority** in each pair, for a plain count.
- **Agreement among the readers** (Krippendorff's alpha, `scripts/alpha.py`). It describes the panel, not the change: readers can agree a life got better while disagreeing on the scale. It is reported, not used to keep or drop a change.
- **Faults by kind** in each arm, per ten lines, and paired (the on version's count minus the off version's, with the order and the difference in lines as terms), with each fault's severity. Faults are cited by line, so the scorer finds their text in the pack (it refuses line citations without `--pack`) and lists those matching the round's own wording. The paired count is reported, not judged: on M38's null it was +1.41 ±1.19, its interval clear of zero where nothing changed.
- **How much happened.** Readers choose the version where more happens: over rounds 29–34, when the two versions were five or more lines apart, the longer was chosen 70% of the time, and each ten lines more in the on version moved the difference by about +0.16. The two arms of an engine change are different worlds, so the same person's two pages differ by 16–28 lines (sd) in every round. The scorer reads the pack and reports the lines in each arm, how often the longer version was chosen, and the effect with the difference in lines as a third term. The round is judged on the effect with the order as a term: a change that makes more happen is meant to read better for it. The third term says how much of the effect is that, and how much is the same amount of life reading better.
- **Kinds of thing.** What readers score is how many different kinds of thing happen in a life, more than its length: over the lives of rounds 29–34 rebuilt line for line, a kind of line more (an event type on the page) goes with about +0.05, across lives and within pairs, and length adds nothing once kinds are counted (round 36). `pairarm.ts` writes each version's lines and kinds into the key, and the scorer reports the kinds in each arm and the effect with the order and the difference in kinds as terms, beside the effect the round is judged on.

## How a round uses it

A pre-registration states one of two claims, before any fresh world is run:

- **Reads better:** the effect's one-sided 90% lower bound is above 0.
- **Reads no worse** (for a change whose claim lies elsewhere, such as a fix to the record): the lower bound is above −0.3.

Alongside, the round's own wording is quoted as a good reason at least as often as it is quoted as an unfit one, and the round names its bar for each.

Why 24 pairs: with two readers, the per-pair difference has a standard deviation of about 0.55 where nothing changed (M38's null) and about 0.85 on a real round (round 40's busiest, re-read in M38). At 24 pairs the 95% interval is about ±0.2 on a null and ±0.35 on a round, and a true effect of +0.4 shows above zero about four times in five.

## What it can and cannot see (M38)

Checked on packs whose answer was known before reading:

- **Nothing changed** (the same worlds' present on another run seed, 24 pairs): effect −0.04 ±0.21, no false effect. Readers chose the second version 36 times in 48, so the order term is needed. On a null with a per-pair sd of 0.55, "reads no worse" fails about one time in eleven, and "reads better" fires one time in ten, as its bar is set.
- **Reasons that do not fit:** with every reason shuffled between the lines of its year, readers chose the true page 48 times in 48; with one line given another line's reason, also 48 in 48, and every reading cited that line (the same line in the true page: once). Both packs differ from the true page only where the fault is, so a reader finds the difference by comparing the versions: this shows they judge a misplaced reason as unfit when it is what differs, not that they find one small fault inside a life that differs throughout.
- **Calibration:** round 40's busiest re-read under this brief: +0.25 ±0.36, inside its first reading's interval (+0.51 ±0.44). Scores run lower under the every-fault brief (on 2.85 against 3.38, off 2.60 against 2.86), so effects since M38 are not on the same scale as rounds 29–41. A novelist on Opus 5.5 read +0.38, inside Fable's interval.
- **Roles late in a sitting:** over rounds 39–41 and M38, the roles' fault kinds were no closer in the second half of a sitting than the first (0.13 against 0.12 apart); they chose alike a little more often (92% against 85%).
