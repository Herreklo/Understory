# An outside review of the lab at round H25

This is an outside review of `main` at `c256fd0` (round H25, 18 Oct 2026). It changes nothing in the engine. Each finding says how it was established: **measured** (run on the code), **read** (seen in the code) or **counted** (from the repository's own files).

Every number below comes from throwaway worlds (9001–9020, the `smoke` range in `docs/seeds.md`). By the lab's own rules that makes them diagnostic. A round that acts on any of them should confirm it on a fresh evaluation range.

## How it was checked

- **A copy of the code with measurement hooks** (`patch.mjs`). The hooks draw no random numbers. With them switched off, a world trained on the copy produces a byte-identical file to the original. The one hook that scores a decision a second time was checked the same way.
- **The scoreboard in nine versions:**
  - unchanged;
  - with each of three channels of hidden truth removed, one at a time and all together;
  - with people following a bent version of the engine's psychology, at four strengths, while every reader keeps the original model.

  Base rates come from 1501–1520 (the lab's training range) and evaluation is on 9001–9020, ten years each, about 35,000 decisions per version.
- **Counters** for the scoring rule and for the removal of unkept events, over 40 worlds (about 249,000 decisions, past and present).
- **To reproduce everything:** `bash reports/review-2026-10-18/run.sh <work directory>`, from the root of a checkout. It takes about an hour on four cores. `results.txt` is its output.

## 1. People can be read, on the lab's own terms (measured)

Unchanged code, 20 worlds, mean over worlds with a 95% interval:

| Slice | Calibrated witness | minus notebook | minus tendency learner |
| --- | --- | --- | --- |
| All decisions | 63.5 ±0.8 | +2.3 ±0.7 | +3.6 ±0.9 |
| Novel, contested, known (key) | 55.3 ±1.7 | **+5.7 ±1.5** | **+5.2 ±1.7** |
| Not a couple's decision | 70.5 ±0.8 | +2.3 ±0.8 | +3.6 ±1.0 |

On the key slice the notebook is the base rate by definition. This agrees with H25's own figure (+4.1 ±1.7 on 10 worlds).

## 2. Hidden truth in the evidence: real, but it does not carry the result (read, then measured)

Three things a witness could not see shape the evidence an act gives (`src/grammar.ts:618-662`):
- **z:** its weight scales with the person's true trait size.
- **circ:** it is discounted by how much circumstance truly drove the choice, taken from the truth view.
- **ifthen:** an active if-then sends its true direction, whatever the act was, and diverts half the facet's evidence because the code knows one was at work.

Each was replaced with what an observer could have:
- z and circ by their averages over the unchanged runs, 0.933 and 0.1875;
- the if-then's direction by the act's own, with no diversion.

| Version | Key slice, minus notebook | Against unchanged, paired by world |
| --- | --- | --- |
| Unchanged | +5.7 ±1.5 | |
| z removed | +4.1 ±1.6 | −1.6 ±1.9 |
| circ removed | +4.7 ±1.1 | −1.0 ±2.1 |
| ifthen removed | +4.3 ±1.8 | −1.4 ±2.5 |
| All three removed | +4.8 ±1.9 | **−0.9 ±2.0** |

Together they cost about a point, inside the noise. They should still go, because BOARD says no reader has a route to hidden truth, and the code does not yet bear that out. Not tested: the if-then evidence still appears only for people who truly have an if-then, and the manner channel (round 7b) was left as it is.

## 3. Part of the lift comes from the readers sharing the engine's model (measured)

Every reader calls the engine's own `score()` with beliefs in place of traits. So a question remains: does the witness read people, or does it read this particular engine?

To test it, the real choices were made by a bent generator, while every reader kept the original model:
- Each consideration of each kind of answer was raised to its own fixed power, exp(σ·N(0,1)), the same in every world.
- The base rate, the notebook and the tendency learner learn from the bent worlds as usual.
- The witness's evidence tables are unchanged, so beliefs still come from acts.

How far each bend is from the readers' model:

| σ | Probability moved per decision | Likeliest answer changed |
| --- | --- | --- |
| 0.3 | 0.10 | 11% (one world) |
| 0.6 | 0.17 | 22% (one world) |
| 1.0 | 0.24 | 30% |
| 1.5 | 0.29 | 36% |

The scoreboard under each bend:

| σ | Key: minus notebook | Key: minus tendency learner | All: minus tendency learner | Key: trait oracle |
| --- | --- | --- | --- | --- |
| 0 | +5.7 ±1.5 | +5.2 ±1.7 | +3.6 ±0.9 | 68.3 |
| 0.3 | +5.8 ±1.9 | +5.5 ±1.8 | +4.4 ±0.8 | 65.5 |
| 0.6 | +2.9 ±0.9 | +5.1 ±1.4 | +3.3 ±0.8 | 62.8 |
| 1.0 | +1.7 ±1.3 | +3.5 ±1.5 | +2.3 ±0.6 | 59.5 |
| 1.5 | +0.7 ±1.1 | +3.5 ±1.3 | +1.5 ±0.5 | 55.5 |

How to read it:
- **The lift over the notebook falls as the model goes wrong.** It goes from +5.7 to +0.7 at σ = 1.5. That figure is not a clean measure here, because the bend also makes choices easier to predict from the situation alone: on the key slice the base rate rises from 49.8 to 54.0, while the calibrated witness stays near 54.5.
- **The cleaner comparison is with the tendency learner.** It is person-aware but character-blind, and it learns from the same bent worlds. There the witness keeps **+3.5 ±1.3** on the key slice even when a third of the likeliest answers differ from its model.
- **Conclusion.** About a third of the advantage on the key slice depends on knowing the generator exactly. About two thirds survive a model that is substantially wrong.

This tests one kind of wrong model only: bent weights. A missing consideration, or one that interacts with another, was not tested.

## 4. The scoring rule counts considerations, not only what they say (read, then measured)

`score()` (`src/decide.ts:161-186`) multiplies factors that are each at most 1. The compensation for the number of factors only partly undoes this, and the choice is a softmax on the raw product at a temperature of 0.035–0.1. So, other things equal, an option with fewer considerations scores higher.

Compared with the same rule, with every option padded to the same count by its own geometric mean (same temperature, same compensation):
- In **47%** of decisions the options carry different numbers of considerations.
- In those, the options with the fewest gain on average **12 percentage points** of probability.
- In **7.2%** of all decisions the likeliest answer would be a different one.

Related (read):
- "Its five strongest considerations" are in fact the first five in build order (`src/grammar.ts:506`), so situation-specific considerations are the ones dropped.
- A reason that fails its own counterfactual check (`honestWhy`) is still printed. The check only feeds statistics (`src/grammar.ts:281-290`).

## 5. Events are taken off the wrong person's list (read, then measured)

When an act is not kept, the code removes the last entry from each person's own event list (`src/grammar.ts:690`, `src/group.ts:487` and `:618`). If the thread step has just added its own event (`src/threads.ts:67-85`), that thread event is the one removed, and the unkept act stays.

Over 40 worlds:
- **1.8%** of removals took the wrong event: 3,933 in all.
- About 2,500 of them were thread events: 1,590 "settled into it", 498 patterns and 398 costs.
- The rest were confide, ask-what, brush-off and look-away.

`p.events` feeds marks, the page and consequence tracing.

## 6. Other code findings (read)

- `identityC` (`src/grammar.ts:360-372`) compares a positive weight with a `best` that can be negative, so a weak "yes" listed after a strong "no" overrides it.
- With `OFF=budget`, `friendsTick` is skipped entirely (`src/life.ts:943-944`), so the dead and departed stay close friends in that arm.
- **Shared streams:** 127 `w.rng.chance` calls against 2 `chanceOf` call sites. The choice between families is isolated per person. The choice of expression within a family (`src/grammar.ts:472`) and whether an act is logged are not.
- **Town content in engine files:** the harbour day (`src/grammar.ts:1481-1605`), `'the Anchor'` (`src/grammar.ts:983`), and `['mill','garage','harbour']` (`src/grammar.ts:1274`).
- `src/tools/test.ts` never fails on its criteria; it fails only if it crashes.
- `scale/*.ts` on `main` imports `../src/scale` and `../src/coarse`, which do not exist on `main`. `tsconfig.json` includes only `src`, so CI does not notice.
- 168 `as any` and 44 switch names. Several settled switches keep their old paths: `ownchance`, `monthly`, `skimfix`, `latent`.
- Small: `src/tools/board.ts:137` uses one degree of freedom too few, so its intervals are slightly too wide.

## 7. Method (counted)

- **Pace and verification.** BOARD records about 55 rounds between 16 Oct evening and 18 Oct 07:56. The repository's first commit is 18 Oct, so earlier pre-registration times are prose, not git. The protocol now makes the pushed commit the timestamp, which fixes this from here on.
- **Outcomes.** BOARD has 163 ✓ and 78 ✗, 24 rounds "Kept" and about 5 not kept. Round 20 failed its gate (−2.2 ±1.6) and was kept "as a judgement". Round 20b then pre-registered a new gate that leaves out couples' decisions. That was done openly, but the gate changed after a failure.
- **Power.** On 10 worlds the paired key-slice intervals run from about ±2 to ±6, so "within ±2" is read from the point estimate. It is not an equivalence test.
- **The exit bar.** In BOARD it is at least 8 points, with intervals apart; in STATUS it is now "beats the notebook".
- **People.** The only human data is one sitting by the designer, who is not blind to the model: 17 of 20 before reading the page, 13 after. The blind readers of lives are not named or archived, and agreement between readers is not measured.

## Recommended order

1. **One round for the defects in sections 4–6:**
   - the scoring rule;
   - the event list;
   - `identityC`;
   - printing only reasons that pass their check;
   - keeping the five strongest considerations by strength.

   Each goes behind a switch. Expect the scoreboard and lives to move; that is the point of the round.
2. **Remove the three channels in section 2,** in the same or the next round. They cost about a point, and the docs become true.
3. **Add the bent-generator test of section 3 to the scoreboard** as a standing reader check. A reader that only works with the exact generator is not reading people.
4. **Human testers:** 5–10 independent people, 60 or more answers each, on Quiz II and III. This is the only route to exit point 5.
5. **Gates with power:** more worlds, an equivalence test with a margin stated in advance, and a fixed exit bar and slice definition.
6. **CI:**
   - type-check `scale/`;
   - make `test.ts` fail on its criteria;
   - add a check that each person's event list matches the record.
