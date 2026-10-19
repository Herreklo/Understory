# Reading the town: the human study

The protocol for the human quiz's third sitting (round Q3). Real side: everything here is true and binding for the sitting. The page is `study/`; the analysis is `scripts/study.py`; the items come from `src/tools/quiz.ts`.

## The question
Does reading a person's page help a stranger predict what that person does next, beyond what the situation alone tells them?

This is exit point 5. It is the one result the project cannot get from its own readers.

## What a tester does (about 20 minutes)
1. **The setup.** A short introduction: a town, a witness who knows some people, and what "predict" means. No other explanation.
2. **24 items,** drawn at random for each tester from a pool of about 96. Each item is a real decision from the engine, on the key slice: a person the witness knows, a kind of situation the witness has never seen that person in, and circumstances that leave it open. No kind of situation gives more than a quarter of any tester's items.
3. **Half the items come with the person's page, half without,** in random order. Across testers, every item appears in both conditions equally often.
   - **Without the page:** the situation, the other person in it, and how people in the town usually go in that spot (the base rate, in words and odds).
   - **With the page:** the same, plus the person's page: each impression with how many acts it rests on ("seemed to put others first: seen 4 times, once the opposite"), then the acts themselves, as the witness saw them at that moment.
   - The tester picks an answer and says how sure they are: guessing, fairly sure, or sure.
4. **The reveal after every item.** What the person did, and the reasons the engine logged, in plain words.
5. **At the end.** The tester's score next to the machine readers' on the same items; "Did the people feel like people?" (1 to 5); one line of free text; and an offer of a second set of 24. Whether they accept is recorded.

## Design choices, and why
- **Each item is answered once, with or without the page.** Answering twice would anchor the second answer on the first. Showing each item in both conditions across testers gives the same comparison without the anchor.
- **Conditions are interleaved at random,** so whatever a tester learns from the reveals affects both conditions equally.
- **The base rate is shown in both conditions.** Without it, a tester who always picks the town's usual answer looks skilled (round 13).
- **Evidence counts are shown, not only impressions.** The one sitting so far showed a reader generalising from one vivid act. Counts are the remedy the person-perception research (halo and dilution effects) points to.
- **A pool of about 96 items,** because power is limited by the number of items as much as by the number of testers. A result on 24 fixed items would be a result about those 24.
- **Items come from fresh worlds on the merged engine,** never from worlds used for anything else, and the evidence shown is frozen at the moment of the decision.

## Success criterion (fixed before anyone takes it)
- **Primary:** accuracy with the page minus accuracy without. The estimate is the mean over items of each item's difference (its accuracy with the page minus without, over the testers who saw it each way), so an item seen by more testers counts no more than one seen by fewer; the 95% interval comes from a bootstrap that resamples testers and items together (2,000 draws), which stands in for a mixed model with both as random effects without needing one fitted.
  - **Helps:** the interval lies above 0, and the estimate is at least **5 points** (the smallest effect worth having).
  - **Helps, but too little to matter:** the interval lies above 0 and the estimate is under 5 points.
  - **Misleads:** the interval lies below 0.
  - Otherwise: not shown either way.
- **Secondary:**
  - Calibration: testers are right more often when "sure" than when "guessing".
  - Human accuracy beside the base rate, the calibrated witness and the mind-reader on the same items.
  - The "felt like people" score, and the share who accept a second set.
- **What a negative result means:** it indicts this page design, not the model. The next design is named now: the raw ledger of acts only, with no impressions. It would be run on the same protocol.

## How many people
- **How many people:** the pool is 174 items; a sitting is 24. The estimator's bootstrap interval is about ±12 points at 40 testers on synthetic data (round Q3, part one), so forty testers give a direction, not a powered answer; the pilot shows the real spread, and the number for a powered sitting is set from it, not from a formula.
- **Exclusion, decided in advance:** a tester whose median time per item is under 5 seconds, or who gives the same answer position on more than 80% of items, is left out and the count says so.
- **The analysis script is written and committed before the first tester answers.**

## Who
- Adults who have not seen the model, the project or its docs.
- No knowledge of psychology needed.
- Not the designer, and not anyone the designer has briefed on the model.

## What the page stores
Per tester, anonymous: each answer and how sure they were, which condition the item was in, the time taken per item, the end questions, and whether they took a second set. Nothing else. Each tester writes only their own answers.

## The pilot first
Three readers who have not seen the model, one sitting each, on the engine after round F27. The pilot tests the page (do they finish, where do they stall, what do they ask) and the script (does it run end to end on real files). Its estimate is reported as a pilot's and claims nothing. The real sitting comes after round 27, on that engine, with whoever is willing; a few readers give a direction, not a powered answer, and the write-up says which it is.

## How answers come back
The page sends nothing anywhere. At the end it shows the tester's answers as one block of text to copy and send, and offers the same as a file to save. The analysis script reads those files.
