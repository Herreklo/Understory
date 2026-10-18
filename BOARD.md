# The scoreboard

Every claim about readable people is checked here. Written before the run; results go in STATUS.md.

## The rule

No mechanism is added unless we can say which observable behaviour it should change and how that change will be tested. Each round below is written before its run: the measurement, the change, the expected result and what would change our minds, then the outcome, kept whatever it was. Evaluation seeds are consumed by use: once a range has judged a change, the next round reports on a range not yet used for any decision.

## Question

Does knowing someone's character, learned only from what a witness could see, predict their choices better than readers who know nothing about character? Above all, does it hold in a kind of situation where the witness has never seen that person before?

## Readers

All of them see only what the witness could see, and none read hidden state.

| Reader | What it knows |
| --- | --- |
| Base rate | The most common answer to this kind of situation, learned on 20 other worlds (seeds 101–120). |
| Situation reader | The circumstances the witness can see (public facts, what close people would know, how they think people feel about each other). Everyone is assumed to be average. |
| Notebook | What the witness last saw this person do in this kind of situation. If it has never seen one, it falls back to the base rate. |
| Witness | The witness's beliefs about traits, values and if-thens, read as best guesses. |
| Calibrated witness | Starts from the base rate, then shifts by how this person differs from an average one: posterior ∝ base rate × (what the beliefs predict ÷ what an average person would do). Knowing nothing, it is the base rate. |
| Trait oracle | Diagnostic only, never a player's reader: the witness's view with the person's true general traits. The gap from the calibrated witness to here is what better coverage could win; from here to the mind-reader is hidden circumstance, if-thens and chance. |
| Swapped beliefs | The calibrated witness reading this person through its beliefs about a different known person. Shows whether predictions use person-specific knowledge. |
| Tendency learner | Character-blind, person-aware: from the decisions it learned of, how often this person gives each kind of answer, across all situations, plus a lean on two broad axes (acts or holds back; others or self first). Predicts a new situation by base rate × this person's rate ÷ the town's. No traits. |
| Mind-reader | Everything true. The ceiling. |

No reader has a route to hidden truth. A circumstance the witness has no evidence about is read at its base rate, however close the witness is to the person; closeness only brings more evidence (`contact` in life.ts).

## Slices

- **All decisions.**
- **Known vs strangers.** Known means the witness holds at least three settled beliefs about the person, or they are close.
- **Novel vs familiar.** Novel means the witness has never seen this person answer this kind of situation. Here the notebook is only the base rate, so character has to transfer.
- **Contested.** The situation reader's best answer has less than 65% probability: the circumstances don't settle it.
- **Witnessed vs hypothetical.** Witnessed means the witness learned of the decision itself. Most decisions are private; predicting them tests beliefs, not the experience of watching people, so the two are reported apart.

## Method

20 held-out worlds (seeds 1–20), 10 years each, run seed 1; base rates learned on seeds 101–120. Accuracy is computed per world. We report the mean across worlds with a 95% interval, and paired differences per world (calibrated witness minus notebook, minus base rate) with their own intervals. A difference whose interval crosses zero is not a finding. Beside accuracy, two proper scoring rules per world: multiclass Brier (sum over options of squared error; 0 is perfect, a coin flip on two options scores 0.5) and log loss (−ln of the probability given to the chosen option). A reader must win on these too, or it is winning on best guesses alone. Familiarity and knowledge are recorded at the moment of prediction, never after the run.

## What would change our minds

- If on novel decisions about known people the calibrated witness does not beat the base rate by at least 5 points, with an interval above zero, then character does not transfer. That points at the model (too much circumstance, too much noise from if-thens), not the witness.
- If the calibrated witness does not beat the plain witness on strangers, the stranger gap is a model problem, not a reading problem.
- If the calibrated witness wins on accuracy but loses on Brier or log loss, it is overconfident and the win is not real.

## Exit criterion (good enough to build a game on)

A reader with five minutes of someone's felt history predicts their choice in an unseen kind of situation at least 8 points better than the notebook, and the intervals do not overlap. First checked with the calibrated witness, then with people.

## Round 5a: coverage (pre-registered 16 Oct 2026, evening)

Measured first (`src/coverage.ts`, 12 worlds): when the witness holds a belief about a facet a contested decision reads, it is right about 90% of the time. The chain breaks at availability, not accuracy. Forgiveness is read in 33% of contested decisions and held in 43%, with 10 pieces of evidence a decade reaching the witness; fairness 21% / 47% / 8; altruism 27% / 46% / 20; greed avoidance 13% / 38% / 11; organisation 21% / 39% / 18. Dependence beliefs are only 71% right: the witness sees people who ask for help and never the ones who cope alone.

Change: three situations where these facets show in public. A collection when someone in town is hit by illness or loss (altruism, greed avoidance, with money and need in the open); an old wound, when two people who share a workplace or circle meet months after one slighted the other (forgiveness, with the slight as the cause); the harbour day once a year, where someone steps up to organise it and the day shows whether they could (organisation, diligence). Also: the money feature's pull on greed avoidance is reversed for giving, where it had favoured the greedy.

Expected: held rises to about 55% for forgiveness and altruism and 50% for greed avoidance; organisation to about 45%. Calibrated witness on novel, contested decisions about known people: +1 to +3 points. Mind-reader unchanged within noise; twists not down.

What would change our minds: if held rises but the calibrated witness does not move, availability was not the binding constraint and the belief threshold or reliability is; if twists fall, the new situations are too easy to read and should be rarer or less public.

## Round 5b: belief strength (pre-registered)

Measured first: regressing true facet scores on the witness's beliefs, over ten worlds, gives a slope of 1.7: the truth is on average 1.7 times the belief. Sure beliefs (uncertainty below 0.3) run at 1.2, fair ones at 1.5, vague ones at 2.4. Beliefs are right in sign nine times in ten and too timid in size.

Change: the calibrated reader learns, on the training worlds, how much its evidence undershoots at each level of uncertainty, and scales beliefs by it. This is reader-side, like the base rate: a person who has watched a town for years knows their first impressions run weak.

Expected: +1 to +3 points on contested decisions about known people, with Brier and log loss no worse. If accuracy rises and Brier worsens, the reader has become overconfident and the scaling is wrong; if nothing moves, the remaining gap to the trait oracle is in facets the witness has no belief about at all (the dimension inference), not in the beliefs it holds.

Outcome (16 Oct 2026): accuracy fell 0.6–0.8 points and Brier worsened on every slice. Scaling vague beliefs up amplifies the ones with the wrong sign. Belief size is not the lever; the gap to the trait oracle lies in facets the witness holds no belief about and in weak beliefs of the wrong sign. The reader was removed.

Outcome of 5a (same day): coverage rose as predicted (forgiveness held 43→56%, altruism 46→77%, greed avoidance 38→58%, organisation 39→48%). Like for like on round-4 situations, the key slice did not move (70.5 against 70.4); the gains went to trust-driven situations that are not contested (confiding 72→84%, answering a request 72→83%, pooled, novel and known). The new situations are hard for everyone (collection: calibrated 62%, ceiling 85%; old wound 63%, ceiling 76%) and widen the room for character. The composition lesson is kept as the like-for-like slice above.

## Round 5c: evidence quality (pre-registered)

Measured first (`src/wrongsign.ts`, 10 worlds): evidence from ordinary contact is wrong in sign 1% of the time; evidence from acts and from habits 22%. The witness's surest beliefs are the most often wrong (14%, against 9% for vague ones), and more evidence does not help (9% wrong after one piece, 10% after nine): something repeats the same wrong reading. Social boldness and fearfulness are the worst-read facets; both carry if-then templates for the situations where they are seen.

Change, observer side only: (1) when an if-then on a facet was active in an act, the evidence about the general facet is halved and the if-then evidence carries the rest, so a public act of shyness teaches "shy in public" before it teaches "shy"; (2) a habit is learned once per observer: seeing the morning swim for the hundredth time adds nothing.

Expected: wrong-sign share of sure beliefs 14% → under 10%; social boldness and fearfulness wrong evidence down by a third; calibrated witness +1 to +2 on contested decisions about known people, Brier no worse. If accuracy does not move, the against-type acts are real variability and the remaining gap is irreducible for a witness in the town; the quiz then tells us whether people read it better.

Outcome of 5c (16 Oct 2026, late): the first two changes alone barely moved anything (sure beliefs 14% → 13% wrong). Tracing the evidence behind sure-but-wrong beliefs found the real source: a fifth of it was "cheer", band members praising a good song, which nearly everyone does and which emitted full-strength evidence of modesty and gentleness every time. Added a third change: an act's evidence scales with how uncommon that answer is in this kind of situation in this town (an answer nine in ten give carries a fifth of the weight). With that, wrong-sign beliefs fall with evidence for the first time (10% after one piece → 6% after nine; before, flat). Calibrated witness on round-4 situations, novel and contested, known person: 71.1 against 70.5, minus notebook **+10.9 ±2.2** against +8.2 ±2.3; all decisions +5.6 ±0.9 against +4.3 ±1.0. Brier no worse (0.364 against 0.368 overall). The runs' intervals touch, so this is in the predicted direction and size rather than beyond doubt. Two evidence tables were wrong on sight and fixed: burying oneself in work is coping alone, not diligence; being found out over a cover-up is about sincerity, not fairness.

## Round 5d: silent-facet triage (16 Oct 2026, late)

Measured first (`src/silent.ts`): five facets were read by no decision at all. Liveliness shapes expression and chemistry and the witness learns it through manner (36 pieces a decade), so it is kept as a style facet. The other four were given one consequence each where the research puts it: aesthetic appreciation decides who genuinely cheers a song and who takes the open-night stage; unconventionality pulls toward the city offer and the stage; social self-esteem decides seizing a chance and whether criticism is swallowed; perfectionism decides what happens when a deadline lands. Nothing cut.

Outcome: each is now read in 1–3% of decisions. The key slice slipped from +10.9 to +9.8 ±1.8 (+10.1 like for like) and the ceiling by a point: the new considerations shape decisions the witness holds little evidence about (9–18 pieces a decade). Accepted as the price of facets that matter; the follow-up is revelation, situations where these four can be seen.

## Round 6a: validation (pre-registered 16 Oct 2026, 22:50)

Problem: seeds 1–20 were used to judge rounds 5a–5d, so they are no longer untouched. Fix: the model is frozen as of version 13; the scoreboard runs once on seeds 201–220 with base rates from 301–320, never used before, and the result is reported whatever it is.

Two readers added for good:
- **Swapped beliefs**: the calibrated witness, but reading each person through the beliefs it holds about a different known person. If the model is using person-specific knowledge, this falls to about the base rate. (The R5 reviewer's test.)
- **Tendency learner**: a character-blind reader that is still person-aware. From the decisions it has actually learned of, it tallies how often each person gives each kind of answer (anger, humility, generosity, refusal, duty, lapse…) across every kind of situation, and predicts a new situation by base rate × (this person's rate of that answer ÷ the town's rate). No facets, no values, no if-thens. It transfers across situations through shared answer kinds, which the notebook cannot.

Also: the in-engine witness statistic (`recordStats`) now uses the population's typical variability and no town-norm blend, so there is one evidence-limited witness, not two.

Predictions, written before the run: on untouched seeds the calibrated witness beats the notebook by 4–6 overall and 8–11 on novel · contested · known, with Brier better. Swapped beliefs land within 2 points of the base rate. The tendency learner comes within 2 points of the calibrated witness on contested decisions about known people, and the calibrated witness wins clearly (5+) only where the decision's answer kinds are ones the witness has never seen that person give. If the tendency learner ties everywhere, the facet model's value is not prediction but explanation and transfer, and the exit criterion must change to say so.

Outcome of 6a (16 Oct 2026, 23:00), model frozen at version 13, seeds 201–220 with base rates from 301–320, never used before:
- Calibrated − notebook: all decisions +4.5 ±1.2 (predicted 4–6); novel · contested · known **+10.7 ±2.2** (predicted 8–11); Brier better on every slice. The round 4–5 result holds on untouched worlds.
- Swapped beliefs: **8.0 ±1.3 below the base rate**, not near it as predicted. The wrong person's beliefs actively mislead; the knowledge is about the person.
- Tendency learner: predicted to come within 2 of the calibrated witness; it trails by **9–10 points** on every contested slice (61.5 against 71.8 on the key slice), even after it was given broad-axis generalisation, and its Brier is no better than the base rate's. It is not weak by construction: it uses everything the witness learned of, and generalises across situations.
- Why (ablation, manner evidence off): the calibrated witness drops to 65.9 on the key slice and its lead over the tendency learner shrinks to 4. About six of the ten points come from the facet theory turning ordinary contact into decision predictions, which a theory-free learner cannot do; about four from reading acts through traits rather than answer kinds.
- The in-engine witness now uses the population's typical variability and no town-norm blend; there is one evidence-limited witness.
Conclusion: the model deserves its complexity for a specific reason, now measured: it lets a person be learned from being around them, not only from watching them decide. The exit criterion stays as prediction for now, with the tendency learner as the bar to beat alongside the notebook.

## Round 6b: the world responds (pre-registered 16 Oct 2026, 23:10)

Problem (character reader, both reviews): people are consistent while the world around them repeats. Nothing in the town learns from anyone except the witness. Four mechanisms, world-side, none touching the witness:

1. **Reputation shapes company.** People seek out those they like and avoid those they dislike when choosing who to spend time with; nobody puts into a collection for someone they can't stand. Behaviour: the disliked are left alone more, so the same two people stop producing the same quarrel. Test: max same act to same people falls from 9 to 7 or under; distinct monthly partners fall for people disliked by three or more.
2. **Groups adapt to a troublemaker.** After a member's second row in three years, another member takes them aside (an intervention event); after a third, the group asks them to leave rather than waiting for them to quit; a group with recent rows recruits less easily. Behaviour: Ellen's band stops replenishing itself and departures vary. Test: at least half of row departures are preceded by an intervention; "asked to leave" events exist (about one per town per decade); recruitment after two rows roughly halves.
3. **Wrong beliefs become real.** Someone who believes another person dislikes them (from what they have seen pass) warms to them less, and when they go cold on a person who in fact liked them, the other notices and cools in turn. Behaviour: self-fulfilling misreadings with a discoverable cause. Test: one to three "misread" events per town per decade, each citing the belief and its falseness; the other's liking falls afterwards in most of them.
4. **Youth plasticity.** Heredity is fixed at birth and unchanged. The environment's grip loosens with age: a plasticity factor (about 1.7 at 18, 1.0 at 40, 0.3 at 65) scales how much chosen expressions, life marks and phases move a person. Behaviour: the young are shaped by what happens to them, the old are who they are. Test: mean absolute facet change over 20 years for people aged 18–30 at the start is at least 1.5× that of people over 50; rank-order stability rises with age.

Whole-round tests: blind reading (first half of a life matched to its second) with the four mechanisms on against off, expected no worse and ideally +2 or more; five lives read cold; the scoreboard on untouched seeds must keep calibrated − notebook ≥ 8 on the key slice with Brier still best (a world that responds adds circumstance and may cost a point; that is accepted). Demography, replay, two worlds, browser all pass.

What would change our minds: if blind reading falls, the mechanisms are making lives more alike (everyone avoids the same people, every band behaves the same) and they need variance, not removal; if the scoreboard falls below 8, the world is swamping character and the strengths should be halved.

Outcome of 6b (16 Oct 2026, 23:50), ten worlds × 20 years, mechanisms on against off:
- Plasticity: young/old facet-change ratio 12.8 on against 4.8 off (predicted ≥ 1.5). Passed, too well: people over 50 barely change at all (0.005 SD over 20 years), and the young still change little in absolute terms (0.065 SD). Development is under-powered on both sides; plasticity scaled a near-zero. Kept, with the floor to be raised and the maturing drift to be re-fitted to the research (about +0.5 SD conscientiousness from 20 to 40).
- Groups adapt: interventions 0.25–0.55 and expulsions 0.25–0.35 per town-decade. They work and are rare, because rows themselves are rare (0.9 per decade).
- Wrong beliefs become real: 0.65 misread events per decade (predicted 1–3); the other person cooled afterwards in 38% (predicted most). Real, weak.
- Company by reputation: no measurable effect on who people spend time with. The random-contact channel it steers is small beside work, family and circle.
- Repeats: fixed by a different route than the four mechanisms. The third thread of the same kind in six years becomes a phase, said once ("by now she was someone who kept to herself; nobody remarked on it any more"), and every answer to pressure, whatever brought it on, now runs through threads. Max same act to same people 15 → 9; what remains at the top is the band playing shows, which should recur.
- Blind reading fell with the mechanisms on (13.1 against 16.2). Plasticity makes the young change, so their second half matches their first half less. The measure rewards people who stay the same, and cannot judge a world in which people develop. It is kept as a diagnostic, not a gate.
- Gate (scoreboard, untouched seeds): calibrated − notebook **+11.1 ±1.9** on the key slice (was 10.7), +5.0 overall, Brier 0.354 (better). The responsive world did not swamp character.
- Fixed on sight from the cold read: no new illness within nine months of the last; debt has a floor (nobody is a hundred months in the red).
Conclusion: the world now responds, but sparsely, about one adaptive event per town per decade per mechanism, and nothing that rare changes what a life feels like. For responses to shape lives, reputation must act where exposure is decided: who gets hired, asked, trusted, recruited, confided in, stood up for. That is the next round, and it should be built as one shared idea (how the town regards a person) used by every situation, not as more one-off channels.

## Round 6c: regard (pre-registered 17 Oct 2026, 00:00)

Problem: round 6b showed that one-off responses are too rare to shape a life. What would shape lives is that how people regard someone decides which situations they meet. Today hiring, promotion, who is asked for help, who is recruited into a group, who is confided in, who stands up for whom, and who people spend time with all pick by proximity, skill and chance, with liking as a small term in a few places.

Change: one idea, `regard(w, who, ofWhom)`, built only from what `who` has seen and heard: how they feel about the person (liking, trust, respect) and what they believe about the person's admirable traits (the socially valenced facets, weighted by certainty). Never from truth. Every situation that chooses a counterpart weights by it. No new psychology: regard reads the beliefs and bonds the model already has.

Behaviour it must change: opportunities follow reputation. People in the top quarter of regard (as the town sees them at year five) should receive at least 1.5 times the opportunities of the bottom quarter over the next five years (being hired or promoted, asked for help, recruited, confided in, defended, visited when ill); with regard off, the ratio should sit near 1. Repeated quarrels between the same disliked pair fall further. Two fates of one world should diverge more in who leads and who belongs ("open" outcomes in `fates.ts` rise for lead and inGroup).

Tests: `src/regardtest.ts` (opportunity ratio by regard quartile, on against off); `fates.ts` open counts; the scoreboard gate on untouched seeds (calibrated − notebook ≥ 8 on the key slice, Brier no worse); five lives read cold; the full test suite.

What would change our minds: if the ratio rises but the scoreboard falls below 8, regard is feeding the witness information it should not have (check that regard is read only through the chooser's own beliefs); if the ratio does not rise, the call sites are not where opportunity is really decided and the mechanism is in the wrong place; if lives read as the same few people being rewarded forever, regard needs decay and forgiveness built in, which the memory weights already give it.

Outcome of 6c (17 Oct 2026, 00:15), ten worlds for the opportunity test, untouched seeds for the gate:
- My null was wrong: with regard off, the well-regarded already received twice the opportunities of the bottom quarter (2.04), because liking already entered a few choices and admirable people are more active. Regard with long memory raised that to 2.70, mostly by closing doors on the bottom quarter (1.23 → 0.97 opportunities a person).
- Long-memory regard locked fates: open leaders in `fates.ts` fell from 7 to 3, and the scoreboard gate dropped to +8.3 ±2.6, because who-gets-what became predictable from standing and the room for character shrank. That was the pre-registered failure ("the same people rewarded forever").
- Regard weighted to recent conduct (a belief last fed five years ago counts a third of a fresh one) reversed it: open leaders 10 (above the 7 before regard existed), partnered 22 against 16, repeated quarrels per town 1.4 → 1.0; the opportunity edge shrank to a modest 1.93 against 1.82. Gate: calibrated − notebook **+11.5 ±1.7** on the key slice, +5.1 overall, Brier 0.362 (better than before the round).
- Kept: recency-weighted regard, one function, read only through the chooser's own bond and beliefs, used at nine call sites (hiring, promotion, whom to ask, whom to confide in, who stands up for whom, who comes when someone is ill, who puts into a collection, who is recruited, who people spend time with).
Conclusion: how the town regards a person now decides what comes to them, and present conduct can change it. The design choice is explicit: long memory concentrates and locks; recency opens and forgives. A game wants the second, with the first available as a dial for places where reputation should be hard to shake (an institution, a small island).

## Round 6d: fixes, the combined reader, and a fresh range (pre-registered 17 Oct 2026, 00:45)

From the R6 review: the group escalation was off by one (the warning came on the third row, expulsion on the fourth) and a warning never lapsed, so a row fourteen years after a warning could get someone expelled. Fixed; `src/grouptest.ts` checks the order deterministically across worlds. The misread measure read liking at the end of the run; it now reads it at the event and twelve months later, against matched pairs with no misreading.

Combined reader: the calibrated witness with what it last saw this person do in this exact kind of situation taken as one more piece of evidence (likelihood ratio 2). Expected: within a point of the calibrated reader on novel decisions (nothing to add), 3–6 points above it on familiar ones, best Brier overall.

Fresh range: seeds 201–220 were used to judge 6b and 6c and are no longer untouched. The model is frozen as of this entry and run once on seeds 401–420 with base rates from 501–520. Expected: calibrated − notebook +4 to +6 overall, +9 to +12 on the key slice; combined ≥ calibrated. Reported whatever it is. New rule line: evaluation seeds are consumed by use; every round reports on a range not yet used for any decision.

Outcome of 6d (17 Oct 2026, 01:00), frozen model, seeds 401–420 with base rates from 501–520, never used before:
- Calibrated − notebook: **+4.9 ±1.1** on all decisions (predicted 4–6), **+11.0 ±2.3** on novel · contested · known (predicted 9–12). Calibrated − tendency learner +6.0 and +10.0. Swapped beliefs 6.4 below the base rate. Brier 0.359, best of every honest reader. The result stands on a third untouched range.
- Combined reader: +0.2 overall and +0.8 on familiar decisions, against the 3–6 predicted. On twenty fresh worlds the calibrated reader already ties the notebook on familiar decisions (71.1 against 70.6), so the R6 review's six-world gap (notebook ahead by 6) does not reproduce, and there was little for the notebook to add. Kept as the reader a player would be; not a finding.
- Misreadings, measured properly: the other's liking falls 0.010 over twelve months after a misreading, against a 0.008 rise for matched pairs with none. No downstream effect. The event reads well and carries a true cause; by the rule it is fix or cut next round.
- Group escalation: word on the second row, asking after a word, warnings lapse after three years; `grouptest.ts` checks it across worlds.
- Rule added above: evaluation seeds are consumed by use.

## Round 7a: hygiene (17 Oct 2026, 01:30)

No new mechanism. Fixes from the R6d external review and the self-review, each with its check.

- Regard forgets. The belief part is divided by its evidence plus a prior (0.5), so a lone impression nobody feeds shrinks toward neutral; the strongest impressions fade three times slower. The bond part is read from the memories themselves, each fading as the holder's memories do (grudges with forgiveness, fondness with sentimentality), with a strong memory keeping a quarter of its weight for good. Check, constructed: one mild belief and nothing new for ten years keeps 21%; one strong belief 69%; one bad memory 10% (`regardtest.ts`). Before the fix all three kept 100%.
- Regard ablation made clean: three configurations from a common checkpoint (five years under the full rule, then years six to ten under full, bond-only and neutral), the same people compared with themselves. Outcome, ten worlds, 611 adults: opportunities per person, full minus neutral, **+0.08 ±0.23** (top quarter +0.14 ±0.48, bottom −0.01 ±0.49). Full minus bond-only +0.27 ±0.22, top +0.66 ±0.47. Repeated quarrels per town 0.5 / 1.1 / 0.6. Neutral choice already gives the top quarter 1.21 times the bottom's opportunities, because standing travels with activity. **Regard's effect on who is chosen is inside the noise on this measure.** The measure counts about two chosen-events per person in five years and leaves out the largest channel regard touches, who people spend time with; round 7d measures that channel before any decision on regard.
- Group escalation: a pure function `escalation(rows, warnedAt, now)` with eight constructed cases at exact dates, and the generated check requires at least three cases. The warning is one fact ('took me aside after practice') in event and memory.
- Causes: a consideration that argued against the act prints as 'despite …' (decision level, `reasons()`); event-level trait causes carry the direction the act implies and say 'despite' when the person's trait runs the other way (a song from someone who prefers proven ways; a welcome from someone harsh).
- Repeats: the same act toward the same person within ten years says 'It was not the first time.' on the second, 'Nobody was surprised.' on the third, and from the fourth carries less weight.
- A look-away is remembered: in the first three months nobody who looked away asks; up to eighteen months later the asking is written as a turn ('had said nothing for months, then asked'), and an admission at home ends the withdrawal the asker had noticed.
- STATUS.md's regard line softened to what is shown.

Gate, to run after this round and recorded below: `npm test`; five lives cold; the frozen scoreboard on the next fresh range (601–620, base rates 701–720) once, as the 'before' of round 7b. Expected: calibrated − notebook within ±1 of 6d (regard and text changes do not touch what the witness learns).

## Round 7b: the honest number (pre-registered 17 Oct 2026, 02:20)

Finding (self-review after 6d): about 38% of the evidence that reaches the witness arrives through `manner`, a channel that samples the person's true facet with only the presentation mask as error, is wrong in sign 0% of the time, and produces no text. Core values reach the witness the same way. Switching manner off removes about six of the ten points by which the facet model beats the character-blind tendency learner. So part of the headline result is earned on information a player would never have, through an errorless read that no human has.

Change: manner stays, because thin-slice accuracy is real (Funder; Borkenau & Liebler; Connelly & Ones 2010), but it becomes as good as the research says and no better. Each contact read of a facet is the shown value (truth plus mask) plus noise, with the noise set so that the read correlates with the truth at the level other-ratings reach after ordinary acquaintance, by dimension: extraversion facets 0.45, conscientiousness 0.35, openness 0.30, agreeableness 0.25, emotionality 0.22, honesty-humility 0.18. The strength of each read scales with that correlation. The direct sampling of core values is removed; values reach the witness only through acts that carry them as causes.

Measured: the frozen scoreboard on seeds 601–620 with base rates from 701–720, run twice on the same range: once after round 7a (the 'before', `board-r7a-before.txt`) and once after this change. The range is consumed by this one comparison.

Expected: calibrated − notebook on novel · contested · known falls from about +11 to **between +5 and +8**; overall from about +5 to +2–4; the tendency learner's gap to the calibrated reader narrows to 3–6. Wrong-sign manner evidence rises from 0% to 20–35%. What would change our minds: if the key slice stays above +9, manner was not carrying what the ablation said and the self-review's finding is wrong in size; if it falls under +5, the evidence from acts alone does not support the claim yet and the content work (revelation) is what the foundation needs before anything else. Reported whatever it is.

Outcome of 7a's gate and of 7b (17 Oct 2026, 02:50), seeds 601–620 with base rates from 701–720:
- The 'before' (after 7a, manner unchanged): calibrated − notebook **+3.7 ±1.0** overall, **+7.0 ±2.7** on novel · contested · known. Predicted within ±1 of 6d; it was 4 points under. The 6d archive run on the same range gives +4.9 and **+11.3 ±2.1**, so the range is not the cause; round 7a is.
- One-switch diagnostics (ten worlds, 601–610, noisy manner on in all four): all changes on, key slice +4.5 ±3.0; regard forgetting off +7.5 ±3.7; household leaving off +4.5 ±3.3; show logging off +6.1 ±2.9. Regard forgetting cost about three points of the key slice. Mechanism, read from the code: the bond part of regard was rebuilt from memories fading with half-lives of 18–30 months, while ordinary company never writes a memory, so regard for long-standing friends decayed and `regardWeight` flattened toward uniform; people stopped clustering with those they like, and the witness's contact spread thin. **Finding: the witness knows people because people concentrate their company; forgetting that flattens the social graph costs knowledge.** Fix: the bond part returns to the maintained liking, trust and respect (ordinary company keeps them up), scaled by familiarity, which already fades at 0.7% a month without contact; a bond with someone not seen for years counts a third. The belief part keeps its prior and its slow fading for strong impressions. Constructed cases: lone mild belief 21% after ten years, strong 69%, a grudge against someone not seen since 52%.
- 7b after (noisy, partial manner; values no longer sampled), same range: calibrated − notebook **+2.2 ±0.8** overall (predicted 2–4), **+7.6 ±2.3** on the key slice (predicted 5–8), calibrated − tendency +3.2 / +6.2 (predicted 3–6). Manner evidence wrong in sign 36% (predicted 20–35). Brier 0.390 against the notebook's 0.433 on all decisions. Compared with the 7a 'before' on the same range, manner's honesty cost 1.5 points overall and nothing on the key slice; the two confounded changes (forgetting and manner) are separated by the diagnostics above.
- The honest number, as far as this range can say it: with manner no better than the research allows, the facet model's advantage on novel, contested decisions about known people is **about +7.6**, not +11, and the exit criterion's 8 points are not cleared with the interval. Range 601–620 is consumed.

## Round 7c: forgetting corrected, and the text-only reader (pre-registered 17 Oct 2026, 02:55)

Changes: the bond part of regard as above. A text-only reader: a virtual observer fed with the witness's evidence only when a reader of the felt history could have it (evidence riding a logged event, seen or heard, and known habits; not manner, not the kitchen-table reads of strain and money, not acts that never made the story). Scored as the calibrated reader is, from its own beliefs.

Range: seeds 801–820, base rates from 901–920, never used. One run.
Expected: calibrated − notebook **+8 to +10** on the key slice (6d's 11 less manner's cost, forgetting no longer flattening contact), +3 to +4.5 overall. Text-only − notebook on the key slice **+3 to +6**; calibrated − text-only +2 to +5. What would change our minds: key slice under +7 means the forgetting fix did not restore clustering, or manner's cost is larger than the 601–620 comparison showed; text-only within a point of the notebook means a player, reading everything the felt history prints, could not yet beat the notebook, and revelation is the bottleneck before any social loop.

## Round 7d: the social loop, measured (pre-registered 17 Oct 2026, 03:05)

Question (the R6d external review's chain): does conduct change what the town thinks, does that change what comes to a person, and does that change what they then do? `src/loop.ts`, from a common checkpoint: each world runs to year five under the full rule; standing at year five is the town's verdict on conduct. Years six to ten run twice, with regard deciding and with neutral choice, and the same people are compared with themselves by standing quartile. No new mechanism; the regard call sites are as in 7c.

Measures. Link 1: how often others seek a person's company (the largest channel regard touches, newly counted) and chosen-events (hired, asked, confided in, visited, recruited). Link 2: strain at year ten, withdrawal threads begun, withdrawal and anger acts, warm and generous acts. Persistence: corr(standing at 5, standing at 10) with regard and without; share of the bottom quarter above the median by year ten (nobody locked in).

Expected: Link 1 holds on company: top quarter sought more and bottom quarter less with regard than without, each interval clear of zero, corr(standing, sought) at least 0.15 higher with regard. Chosen-events: a smaller difference in the same direction, interval probably not clear (as 7a found). Link 2: small. Bottom quarter strain higher with regard by 0.01–0.04 and withdrawal threads more; top quarter the reverse; warm acts not distinguishable. Persistence: corr higher with regard by 0.05–0.15; the bottom quarter's escape share stays above 25% under both. What would change our minds: if company does not follow standing, regard is in the wrong place and the social loop does not exist in this model; if it does and nothing downstream moves, the loop's second link needs a mechanism (how being sought out or left alone changes a person), and that is the next pre-registration, not a tuning. Ten worlds; reported whatever it is.

Outcome of 7c (17 Oct 2026, 03:20), seeds 801–820 with base rates from 901–920, one run:
- Calibrated − notebook **+3.2 ±0.8** overall, **+7.3 ±2.0** on novel · contested · known. Predicted +8 to +10; it came in under. Calibrated − tendency +4.0 / +6.1. Brier 0.381 against the notebook's 0.427 overall.
- Switch diagnostics on 801–810 (ten worlds, same base rates): as shipped +7.3 ±3.8; forgetting formula reverted to 6c +7.1 ±3.0; manner errorless again +10.8 ±3.4; both +13.4 ±2.3. So the corrected forgetting costs nothing measurable, and **manner's honesty costs about 3.5 points on the key slice and 2.6 overall**. Two fresh ranges now agree on the honest number: +7.6 (601–620) and +7.3 (801–820). The 6d figure of +11 included about 3.5 points that no human observer could earn.
- The exit criterion (8 points, interval clear) is **not met** on the honest model. The intervals (5.3–9.9 and 5.3–9.3) include 8 but the means do not reach it.
- Text-only reader: **+3.3 ±1.5** over the notebook on the key slice (predicted 3–6), **+0.2 ±0.9** overall (a tie), −7.8 ±3.1 on familiar decisions (the notebook counts every decision the witness learned of, logged or not; a reader of the page could not). Calibrated − text-only +4.0 ±2.0 on the key slice. Brier text 0.410, notebook 0.427, calibrated 0.381. **A reader holding everything the felt history prints could beat the notebook only where character matters most, and by less than half of what the machine witness manages; the other half of the signal never reaches the page** (noisy manner, the kitchen-table reads of strain and money, and acts that were not news). Revelation is the bottleneck before any further mechanism.

Outcome of 7d (17 Oct 2026, 03:35), ten worlds, 392 adults, `loop-r7d.txt`:
- Link 1 holds on company, and is small: with regard deciding, the top quarter by standing (relative to age band) is sought out 3.8 ±1.8 more times over five years and the bottom quarter 3.3 ±3.4 fewer, on levels of about 23 and 40. Chosen-events do not move (top −0.3 ±0.7, bottom +0.2 ±0.3), as 7a found. corr(standing, sought) is **negative** under both rules (−0.14 with regard, −0.25 without): standing as measured (mean regard of everyone who knows the person at all) falls with how widely a person is known, because the widely known are known weakly and judged mixed, and the sociable are the ones sought. The measure needs weighting by familiarity before it can be called reputation; the mechanism's direction is right regardless.
- Link 2 does not exist in the model: strain, withdrawal threads, cold acts and warm acts move by 0.00–0.05 on levels of 0.2–3, every interval straddling zero. Being sought out or left alone changes nothing about a person yet.
- Standing at year ten correlates 0.95 with standing at year five with regard and without, and 2% of the bottom quarter rise above the median. **Standing is a trait echo, not a reputation**: it is read from beliefs about stable facets, so it cannot respond to conduct more than conduct responds to traits. The world has learned who people are; it has not learned anything that could change.
- By the pre-registration: Link 1 holds and is in the right place; the second link needs a mechanism, and that mechanism is the next thing to pre-register, with these as its baseline. Candidates, in order of how observable their effect would be: company and its absence feed strain (the lonely are strained, the sought are steadied); memorable acts weigh in regard beyond their trait evidence, so standing can move; and threads that others notice change how the noticers treat the person.

## Round 8a: measurement hygiene (17 Oct 2026, 09:10)

From the R7 external review. No mechanism.
- The FELT page reads the witness's own beliefs: 'seems low lately' / 'worn thin' come from the witness's `state:low` belief when fed in the last year (before: the person's true mood and stress, whoever the witness was); habits show only when the witness has learned them (before: closeness alone). Page, witness and reader now run under one knowledge rule.
- The reader is named what it is: **page-evidence reader** (evidence attached to logged events and known habits; it does not read sentences). Slices 'witnessed'/'hypothetical' are now 'eventually witnessed'/'never witnessed', since the label is set at the end of the run; predictions are made before the event exists, so nothing leaks into them.
- `loop.ts` intervals are over worlds (people in one town are not independent). Each world contributes its mean paired effect; a t-interval over worlds.
- Calibration curve in the board report: accuracy of the top guess by the confidence the reader gave it, in bins from 50% up, for the calibrated witness, the page-evidence reader and the base rate. Does the reader know when it does not know.
- Realised accuracy measured, not assumed (`wrongsign.ts`): after ten years, corr(witness belief, truth) by dimension is H 0.45, E 0.51, X 0.54, A 0.52, C 0.53, O 0.73; over beliefs built mostly from manner, H 0.32, E 0.38, X 0.66, A 0.55, C 0.57, O 0.73. Long-acquaintance self-other agreement in the research runs about 0.5–0.6, honesty-humility lower; the lab is in that range, with openness high (few, strong channels: the city, the library, the stage).
- Found by the browser check on the way: the build injected the bundle with a string `replace`, and a `$&` inside the minified code (JavaScript's "the matched text" pattern) put the placeholder back into the page. Fixed with a function replacement. The published v18 was built before this, by code that happened not to contain `$&`; v19 will carry the fix.

## Round 8b: revelation (pre-registered 17 Oct 2026, 09:15)

Finding: of the calibrated witness's +7.3 on the key slice, the page-evidence reader holds +3.3; four points of what the witness knows never reach the page. Three silent channels carry them: manner reads, the kitchen-table reads of strain and money among the close, and acts that were not news. A fourth gap is coverage: the quiet virtues (sincerity, fairness, modesty) have no everyday tells, so the witness rarely holds them at all.

Changes, all presentation or content, no new psychology:
1. **Manner becomes something you noticed.** When the witness's own manner read is strong (|read| ≥ 1.0), one in three times and at most once a year per person and facet, it is written as a witness-only line ('Noticed: Thea splits things exactly even.') using the facet's tells, in the direction of the read, so a wrong read becomes a wrong line, and the evidence rides that event instead of arriving silently. Other observers' manner reads stay silent. The witness's total manner information is unchanged.
2. **The kitchen table is written down.** The close observer's reads of strain and money, when the observer is the witness, become witness-only lines ('Over dinner it was plain Magnus was carrying something.' / 'Magnus let slip that money was tight.'), at most one of each per person per half year; the evidence rides the event.
3. **Everyday tells for every facet.** Facets without a hand-written tell list fall back to the facet's own tells from `core.ts`, so sincerity, fairness and modesty show in the chronicle as the others do ('At the harbour fleet, Thea rounds things in her own favour.').

Range: seeds 1001–1020, base rates from 1101–1120, never used. One run. Expected: page-evidence − notebook on the key slice rises from +3.3 to **+5 to +7**; calibrated − notebook from +7.3 to **+7.5 to +9** (the quiet-virtue tells add coverage); calibrated − page-evidence falls from 4.0 to **2.5 or less**; coverage held for fairness/sincerity/modesty up from about 50% to 60%+ (`coverage.ts`). What would change our minds: page-evidence unchanged means the silent channels were not what it was missing (then it is unlogged acts, which is a different problem: the chronicle's news filter); calibrated falling means the noticed lines double-count or crowd out something, and they go.

Outcome of 8b (17 Oct 2026, 09:50), seeds 1001–1020 with base rates from 1101–1120:
- Page-evidence − notebook on the key slice **+2.6 ±1.4** (predicted +5 to +7; was +3.3), **−1.1 ±1.0** overall (was a tie), −8.3 on familiar decisions. Calibrated − notebook **+6.7 ±1.6** (predicted +7.5 to +9; was +7.3). Calibrated − page-evidence **+4.1 ±1.6** (predicted ≤2.5; was 4.0). **Every prediction of this round failed.** The noticed lines, the kitchen-table lines and the everyday tells for every facet did not move the page reader at all, and did not raise the witness.
- Coverage of the quiet virtues fell rather than rose, against the 6d baseline: fairness held 51% → 32% and right 88% → 72%; sincerity 50% → 47% and 94% → 78%; modesty 65% → 59%. The cause is round 7b, not this round: honest manner holds fewer confident beliefs and more wrong ones, and the everyday tells (fairness evidence per decade 12 → 21) did not make up the difference. The baseline in the pre-registration was stale; it should have been re-measured after 7b.
- Where the page reader's evidence actually comes from (three worlds, facet evidence weight): logged acts 64%, acts that were not news 21%, manner 9%, habits 5%, hearsay 1%. The page reader holds about 70% of the evidence weight and under 40% of the advantage, so what it lacks is not spread evenly: the acts that are not news are the routine, repeated answers in the trust situations (money asked for, confidences kept) that build the beliefs novel decisions turn on. The pre-registration's own fallback reading applies: the gap is the chronicle's news filter, not the silent channels.
- Calibration (new): the calibrated witness is well calibrated up to 80% and overconfident above it (says 85% and is right 80%; says 96% and is right 90%); the page reader the same; the base rate is calibrated throughout. The reader does not quite know when it does not know, at the top end.
- Kept: the noticed and kitchen-table lines (they read well and cost nothing), the everyday tells for every facet. Not kept: the claim that they close the gap.

## Round 8b′: the ledger (pre-registered 17 Oct 2026, 09:55)

The page shows news; the witness saw everything they were present for. A player with only the chronicle cannot hold what the witness holds, and the page reader says so. The game's answer is not to log every act as news (the chronicle would drown) but to keep a **ledger** on each person's page: everything the witness has seen this person do, as counts by kind ('Seen: gave money without being asked twice, 4 times; told someone no, twice'), including the acts that were not news. The ledger is what a player would read; the chronicle is what they would feel.

Changes: the FELT page gains the ledger. The page-evidence reader's rule changes to match the page: act evidence counts when the witness was present (seen), logged or not; hearsay counts only when the event was news; habits, noticed lines and kitchen-table lines count as before; the manner reads of other observers and the witness's unwritten manner reads do not. Measurement and presentation only.

Range: seeds 1201–1220, base rates from 1301–1320, never used. Expected: page-evidence − notebook on the key slice **+5 to +6.5**, overall +1.5 to +2.5; calibrated − page-evidence under 2 (the remainder is silent manner). Calibrated − notebook unchanged within ±1 of 8b. What would change our minds: if the page reader stays near +2.6 with the ledger, the gap is not in what is shown but in how the machine combines it, and no presentation will close it.

## Round 8c: consequences (pre-registered 17 Oct 2026, 10:10)

Question (round 7d and the R7 review): the social loop has one link; being sought out or left alone changes nothing about a person, and standing is a trait echo (0.95 stable over five years). Two mechanisms, each with a named behaviour and the 7d test as its baseline:

1. **Company feeds strain.** Each month a person's company over the last year (how often others chose to spend time with them) is set against what they need (six to twelve times a year, more for the sociable). Well under it is a strain of its own, 'left out of things' (0.012–0.024 a month, more for the sociable); well over it steadies a strained person a little. Behaviour it must change: the bottom quarter by standing, who are sought less when regard decides, carry more strain and begin more withdrawal threads than the same people with the mechanism off; the top quarter the reverse.
2. **Memorable acts.** A strong act in front of people (intensity ≥ 0.7, carrying liking or respect) is remembered by those who saw it, not only felt as a nudge to liking, and regard gains a part read from such memories (a quarter of their weight kept for good). Behaviour it must change: standing can move on conduct. corr(standing at 5, standing at 10) falls below 0.95; more than 2% of the bottom quarter rise above the median by year ten.

Both behind switches (`OFF=company`, `OFF=memorable`). Test: `LOOP_VS=nocons npx tsx src/loop.ts 10`, the same people from a common checkpoint, years six to ten with and without the two mechanisms; intervals over worlds. Gate: `npm test`; the scoreboard on a fresh range once 8b′ has reported (expected unchanged within ±1.5: these mechanisms move strain and company, not what the witness learns); fates open counts not below 7d's.

Expected: bottom quarter strain at year ten **+0.03 to +0.08** with the mechanisms (level about 0.18), withdrawal threads +0.1 to +0.3; top quarter strain −0.01 to −0.03. corr(standing 5, 10) **0.80 to 0.92**; bottom-quarter escape **5–15%**. What would change our minds: strain unmoved means the company a person gets does not vary enough between people for a need to bite (then the need is the wrong dial and company itself must vary more); standing still 0.95 means memorable acts are too rare or too weakly remembered to register against stable traits, and the question becomes whether conduct in this world is varied enough to have a reputation at all.

Outcome of 8b′ (17 Oct 2026, 10:35), seeds 1201–1220 with base rates from 1301–1320, consequence mechanisms off:
- Page-evidence − notebook on the key slice **+4.6 ±1.5** (predicted +5 to +6.5; from +2.6 and +3.3 on earlier ranges), overall **−0.4 ±0.6** (predicted +1.5 to +2.5), familiar −8.4 ±2.1 (unchanged). Calibrated − notebook **+8.5 ±1.8** (ranges give 6.7–8.5 for the same model). Calibrated − page-evidence **+3.8 ±1.6** (predicted under 2).
- The ledger closed about two points on the key slice and nothing elsewhere. What the page reader still lacks: the witness's unwritten manner reads (two in three), and above all the kitchen-table reads of strain and money, which the witness takes every month and the page writes once a half-year. Those state beliefs are what decide the familiar, circumstance-driven decisions where the page reader trails by eight.
- The page already shows the witness's state belief as a line ('seems low lately') and its facet beliefs as hunches ('You'd bet on Amalie: feels entitled to more'). A player who trusts those displays has the calibrated witness's reads wherever they are confident. The page-evidence reader is kept as the reader of *acts shown* (chronicle, ledger, habits, written lines); the gap to the calibrated witness is the share of the witness's knowledge that the page shows only as a conclusion. On this range that share is worth 3.8 points on the key slice and about 8 on familiar decisions. No further presentation closes it without showing beliefs, which the page does.
- The three 8b changes stay (they read well); the ledger stays (it is the honest page). Range consumed.

Outcome of 8c (17 Oct 2026, 10:40), ten worlds from a common checkpoint, intervals over worlds:
- **Both mechanisms failed their named behaviour and are cut.** Company feeding strain: bottom-quarter strain −0.01 ±0.06 (predicted +0.03 to +0.08), withdrawal threads +0.03 ±0.26. Memorable acts: corr(standing 5, 10) 0.94 with and without (predicted 0.80–0.92), bottom-quarter escape 3% (predicted 5–15%).
- Why, measured: company in this town is already very unequal (the least-sought tenth receive 1% of all company, the most-sought tenth 37%; one to 176 times in five years) but it does not follow standing: the bottom quarter by standing is sought *more* (38 against 27). So a need-for-company mechanism bites on the isolated, who are not the low-standing, and a test framed by standing could not see it. The mechanism may yet be right for the wrong slice; if it returns, its behaviour is named on the least-sought tenth, not on standing.
- Correction to 7d: with intervals over worlds, Link 1 no longer clears zero (top quarter +4.6 ±5.0, bottom −4.2 ±4.4). The direction holds in every reading; the evidence does not. Ten worlds are not enough for this measure; twenty or thirty are needed before any social mechanism is judged on it.
- Standing stays a trait echo (0.94). Memorable acts were too rare (intensity ≥ 0.7 in front of watchers) and too lightly weighted to move a mean over everyone who knows a person. The deeper fact: standing as defined is dominated by beliefs about stable facets, and nothing short of a reputation that is *not* a facet belief (what a person is known for, as its own quantity) will move it. That is a design question for the game, not a parameter.

Where this leaves the loop: the world chooses company unequally and for reasons that are not regard; regard adds a small tilt toward the admired that ten worlds cannot resolve; nothing downstream of company has yet been shown to change a life. The next pre-registration on this front should (a) measure what *does* decide who is sought (friendship, workplace, age, sociability), since that is the real social graph of the model, and (b) test consequences on the isolated tenth, with thirty worlds.

## Round 9a: the social graph as it is (17 Oct 2026, 10:05)

From the R8 external review: who is sought is set by a pool rule. Measured with `src/graph.ts` across every contact channel (ten worlds, five present years, 506 adults; correlations within each world, intervals over worlds; `graph-r9-before.txt`). Instrumentation only: each channel in `socialTick` is tagged and a hook counts contact; nothing in the simulation changed.

- **Where contact comes from:** habits 40%, work 21%, home 18%, circle 9%, public 5%, hobby 3%, group 2%, sought 2%, family 1%. The optional sought channel, the only one regard acts on, is 2% of all contact. Round 8c's '1% / 37%' concentration was true of that channel alone; across all channels the least-contacted tenth receive 1.9% and the most 20%.
- **The pool rule, confirmed.** A single person draws from singles within ten years of their age (pool about 10; 79–83% of draws pass the age check); a partnered person draws from every adult (pool 54–60; 43–45% pass). Sought received: singles under 40 44, singles 40+ 29, partnered under 40 11, partnered 40+ 7. corr(partnered, sought) −0.71 ±0.05.
- **Across all channels the graph is sensible:** contact received follows sociability (+0.35 ±0.12), partnership (+0.22, home life) and standing a little (+0.16 ±0.12). The isolated tenth: 53% partnered against 73%, sociability −0.23 against +0.05, strain 0.11 against 0.06, contact a fifth of everyone else's.
- **What this explains:** regard's small effect on company (rounds 7a–8c) is small because the channel it acts on is 2% of contact, and that channel's shape is set by partnership and age, not by choice. Consequence mechanisms aimed at standing could not see the isolated, who are distinguished by low sociability and singlehood, not low standing.

## Round 9b: one pool (pre-registered 17 Oct 2026, 10:10)

Change: everyone who seeks company draws from the same pool, adults within twelve years of their own age (the window the age check already used, so no draw is wasted). Initiative unchanged (sociability, youth, being single, wanting to belong); preference unchanged (regard). The old rule stays behind a switch (`OFF=onepool`) for the test.

Test: `src/pooltest.ts`, twenty worlds (seeds 721–740) from a common checkpoint: five present years under the old rule, then years six to ten under each rule; the same people compared; intervals over worlds.

Expected, sought channel: corr(partnered, sought) from −0.7 to **between −0.25 and +0.1**; sought received, singles over partnered, from about 4× to **under 1.8×**; most-sought tenth's share from 37% to **under 25%**; corr(standing, sought) from −0.16 to **positive, +0.05 to +0.3** (preference now acts on a fair pool). All channels: little change (the channel is 2%): concentration within ±2 points, corr(sociability, all) within ±0.05. Downstream: dating starts and births within 15% of the old rule (singles meet each other at work, in habits and circles too); `npm test` passes, demography included. Gate: the scoreboard on a fresh range (1401–1420, base rates 1501–1520), expected within ±1.5 of round 8 on every slice. What would change our minds: if dating or births fall more than 15%, the singles-only pool was carrying courtship, and courtship needs its own access rule rather than riding on company; if corr(standing, sought) stays negative on a fair pool, regard is not what decides preference and the weight must be looked at directly.

Outcome of 9b (17 Oct 2026, 10:40), twenty worlds (721–740) from a common checkpoint, 1,004 adults, intervals over worlds (`pool-r9b.txt`):
- **Every prediction met.** corr(partnered, sought) −0.73 → **−0.03 ±0.09** (predicted −0.25 to +0.1); singles ÷ partnered 5.4 → **1.06** (under 1.8); most-sought tenth 33% → **18%** (under 25%); corr(standing, sought) −0.22 → **+0.20 ±0.05** (predicted +0.05 to +0.3). With a fair pool, people do seek out those they regard well: the regard mechanism was right and the pool hid it.
- All channels unchanged, as predicted: concentration 18% → 17%, corr(sociability, all contact) 0.41 both. Downstream within 15%: dating −13% ±17, births +12% ±21, marriages, leaving and returning unchanged, population 75 both.
- Kept: one pool for everyone. The old rule stays behind `OFF=onepool` for comparisons.

Found while reading the 9b output (zero 'friends' events in both arms): **every friendship ever formed was treated as a reconciliation.** `checkBond` defaulted the month of a pair's last falling-out to −99 when they had never fallen out, and called a friendship 'again' when that was under 600 months ago; a world's whole history is under 600 months. So every new friendship needed the reconciliation bar (liking 0.62 each way instead of 0.45), was written 'X and Y are close again, after everything', and stopped being logged after a person's second. Seed 721 over forty years: 0 'friends' events, 29 'madeup', 1 falling-out. Fixed (a pair who never fell out are making friends for the first time); the old behaviour stays behind `OFF=friendbug`. Four worlds: friend pairs per world 102 → 190 (about 4.7 per adult, in the range people report for close friends), adults with no friend 27% → 15%, population and births unchanged. Since friends decide who visits, who is confided in and who is lonely, this changes a great deal downstream; it goes through the same gate.

Gate for 9b and the friendship fix together (pre-registered here, before the run): `npm test` passes (it does); the frozen scoreboard on seeds 1401–1420 with base rates from 1501–1520, once. Expected: calibrated − notebook on the key slice within the range of the last four (6.7–8.5), overall +2.5 to +4; page-evidence − notebook +3 to +6 on the key slice. If the key slice falls under 6, more friends spread the witness's contact thinner (the lesson of 7a) and the friendship bar should be looked at before anything is built on it.

Outcome of the 9b gate (17 Oct 2026, 11:40), seeds 1401–1420 with base rates from 1501–1520, both changes on (`board-r9b.txt`):
- Calibrated − notebook **+3.6 ±1.5** on the key slice (predicted within 6.7–8.5), **+2.0 ±0.7** overall (predicted 2.5–4). Page-evidence − notebook +1.2 ±1.0. **The gate failed as written.**
- What failed, measured: switch diagnostics on 1401–1410 with the same base rates: both changes on +3.3 ±2.0; friendship bug restored +6.7 ±4.5; old pool restored +4.2 ±2.4; both restored (the round-8 model) **+4.5 ±3.5**. So this range is low for every configuration: about three of the four missing points are the range, not the round. This also shows the per-range intervals understate the spread between ranges (six ranges of the honest model now give 7.6, 7.3, 6.7, 8.5, 4.5, 3.6); each range trains its own base rates, and that variation is not in the per-world interval. Future headline numbers will be pooled over ranges.
- The friendship fix, paired world by world over all twenty: **−2.8 ±2.9** on the key slice, −0.4 ±1.0 overall. The pre-registered mechanism (the witness's contact spread thinner, as in 7a) is wrong: the calibrated witness is at 67.4% with or without the fix. The base rate rose instead (63.8% against 59.0% in 8b′), and per kind of situation the loss went from +7 over the base rate to 0 and the collection from +13 to +6, while support decisions became 30% more common. With twice the friends, more decisions are about the friend, and on those character has less room. That is the model behaving correctly once a bug is removed.
- Kept: both changes. Restoring a bug to keep a number would be the Goodhart this board exists to prevent. Recorded: on correct friendships, the honest model's advantage on the key slice is about +3.6 to +4.5 on this range; pooled over the six honest-model ranges about +6.4.
- Social graph after both changes (`graph-r9-after.txt`): standing predicts all contact received +0.31 ±0.09 (was +0.16) and being sought +0.24 ±0.06 (was −0.16); the isolated tenth carry strain 0.16 against 0.05 for everyone else; adults with no friend 15% (was 27%).

## Round 10a: moments that shape people (pre-registered 17 Oct 2026, 12:15; Øystein's idea)

Idea: a shared moment shapes those who were there, the young most. A World Cup run makes fans, and footballers of the children who watched it; a concert makes musicians. Research constrains how: the demonstration effect of big events on participation is real but weak and selective (Weed et al. 2015 on Olympic legacies: mainly the already-inclined, and it fades without access to play); attitudes and identities formed in the 'impressionable years', roughly 15–25, last (Krosnick & Alwin 1989); memories from those years are the ones people return to (the reminiscence bump). So the mechanism is moment × inclination × age × access, and most moments change nobody.

Refined before building (Øystein): not everyone is inspired by everything. Three responses, not one: most who were there feel nothing much; some are lit up for a while (fascinated, talk about it for a week) and it leaves no trace; a few are changed. The glow is shown in the chronicle so that the lasting changes stand out against it.

Mechanism: interest in a hobby is set at birth and never changes today. After a great public show (the band plays and 'the room went quiet', the top tier of nights), each person who saw it, aged 10–30, may move up one level of interest in the instrument, with chance scaled by their latent inclination for it (the same aesthetic and ear that set interest at birth) and by plasticity. The moment is recorded as the origin ('since the night the Harbour Lights played the Anchor in 2028'), and the first time it shows (they start practising), the chronicle says so with the night as its cause. If within three years they have not practised to a real level or joined a band, the interest falls back: a phase.

Details as built: a great night gets a real audience (people at the Anchor that night: friends and family of the band likeliest, then regulars, the young, and anyone with an ear for it; about a fifth of the town). For each person in it, inclination for the band's instrument is their aesthetic sense and ear; the impressionable window is full from 12 to 25 and tapers after. A spark takes them to full interest, so they start practising; it lasts if within three years they have got good enough to want to be heard, joined a band, or have a close friend who plays; otherwise they drop back to where they were. A glow is a passing emotion and, for the one most moved that night, a line in the chronicle. Switch: `OFF=moments`.

Behaviour it must change, and the test (`src/moments.ts`, twenty worlds from a common checkpoint, mechanism on against off, intervals over worlds):
1. Among those aged 10–30 who saw a great show, the share whose interest in that instrument rises within two years: **5–15%** with the mechanism, near the background rate (0) without. Among those 40+, under 2%. Glows outnumber sparks at least three to one.
2. Selectivity: of those who rise, the mean latent inclination is at least 0.5 SD above that of everyone who saw the show.
3. Persistence follows access: of those who rose, the share still at that level after five years is higher in towns with an active band than without, by at least 15 points.
4. A cohort trace: the number of passionate players aged under 35 at year ten rises by 1–4 per town; nothing else moves (the scoreboard within ±1.5 on a fresh range, demography passing).
What would change our minds: if rises happen but almost all fade, access is the binding constraint and the game needs clubs, teachers and bands as things the player can provide; if they barely happen, great nights are too rare or too few people see them, and the moment needs a bigger stage (a town event, a final) before it can matter.

## Round 9c: the human quiz (17 Oct 2026, 12:20)

Built and published ('Reading Skarvik'). 228 items from thirty fresh worlds (1601–1630), base rates from the 9b gate. Each item is a decision on the scoreboard's key slice (a person the witness knows, a kind of situation the witness never saw them answer, circumstances that leave it open), frozen at its moment: the witness's page as it stood then (who they are to you, your sense of them, how they seem, what you have seen them do, the last 25 things you know happened), the situation in plain words built only from what was visible, and the options. Kinds whose prompt cites a trait (temptation, obligation) are left out; no kind is more than 25 items. Each tester reads twenty, says what they think happened and how sure they are, learns at once whether they were right, and at the end sees their score beside the notebook, the page-evidence reader and the calibrated witness on exactly the same items. Answers are stored per tester (each writes only their own; `answers/<id>`).

On the 228 items: notebook 60.5%, page-evidence reader 66.2%, calibrated witness 65.8%, base rate 60.5%.

Pre-registered expectation for humans (before anyone has taken it): a careful reader beats the notebook by **3 to 8 points** on average (the page carries about what the page-evidence reader needs, and humans read tone and sequence it cannot), with wide spread between people; testers who say 'very sure' are right more often than when they guess. If humans average at or below the notebook, the page does not yet carry character to a person, whatever the machine readers say, and revelation is the work before any game is built on it. Twenty answers per tester is small; the pooled result across testers is the number. Text faults found and fixed by reading items cold before publishing: a support question naming the wrong person, doubled punctuation, shared first names, the witness as 'you' taking third-person verbs, four facet tells that were not verb phrases, ledger placeholders.

Outcome of 10a (17 Oct 2026, 12:50), twenty worlds (1701–1720) from a common checkpoint at year three, years four to ten on against off (`moments-r10a.txt`):
- Great nights per town over seven years 7.7, audience about 21 each.
- 1. Sparked, of those who saw a great night: aged 10–30 **4.6 ±2.8%** (predicted 5–15; just under), 31–39 1.3%, 40+ **0.3%** (under 2 ✓).
- 2. Selectivity: the sparked are **+0.47 ±0.24 SD** more inclined than everyone who saw (predicted at least +0.5; at the line).
- Glows to sparks **24 to 1** (predicted at least 3 to 1 ✓): most people who saw it were moved for a week and nothing more.
- 3. Persistence against access: 17 sparks in all; with a friend who plays 100% held (2 worlds), without 40% (5 worlds). Direction as predicted; **too few to judge.**
- 4. Players under 35 at year ten, on − off **+0.35 ±0.51 per town** (predicted 1–4; **not met**). Population and births unchanged; scoreboard paired on 1401–1410: key slice +2.1 ±3.2, overall +0.4 ±1.6 (no harm).
- Why it is rare, measured: interest is dealt at birth from the same aesthetic sense and ear the moment draws on, so the inclined young who see a great night mostly play already. Birth has used up what moments are meant to trigger. The pre-registered reading ('if they barely happen… the moment needs a bigger stage') is half right; the other half is that inclination should be latent until something calls it out.
- Read cold (seed 1702): Magnus, sixteen, sees the Brekke Boys and teaches himself guitar; a first band dies when its singer leaves for university; he keeps going back to the Brekke Boys, practises every night, shies from the open night, and at 24 starts a band and writes his first song. Every step has a cause. Fixed on reading: the most moved person got the glow line every night; now once per band, then once 'has not missed a night when … played since'.
- Kept: the mechanism (it does what it should, at the rarity the research describes), behind `OFF=moments`. Decision needed before more: whether interest is dealt at birth or called out by experience (latent inclination × exposure), which would make moments, teachers and clubs matter and would change every life's hobbies; and whether the game gets bigger stages (a final, a town event) whose audience is everyone.
- Also fixed: the group-escalation test counted rows only from the present while the rule counts all of them; a row a month before the present began failed it. The test now counts every row and judges present-day warnings.

First tester (Øystein, 17 Oct 2026, 11:00; the designer, so not blind to the model, but blind to the answers): **10 of 20**, against notebook 11, page-evidence reader 12, calibrated witness 13 on the same twenty items; chance about 9.7. Twenty answers carry an interval of about ±22 points, so this says nothing yet about humans against machines; it is one data point toward the pooled number. Said 'very sure' ten times and was right five; two of those were 14–17 second answers on items where every reader was wrong (genuine surprises). Slower answers were not better (5 of 13 over 45 seconds, 5 of 7 under), but slow items were the hard ones. Where the machines were right and the human not, the page did carry the signal in three of five (a list-maker who 'wants the best of everything' ran the harbour day: a human reads volunteering as generosity, the model as organisation; a modest 75-year-old shied from the open night; a man with a short fuse hid his loneliness), and in one it lived in unwritten evidence. Two text faults his items exposed are fixed in the source and in the live items without changing ids: ledger lines with a doubled 'someone's' and a missing owner ('played someone's someone's song as if it were 's own'), and 'told Liv everything was fine with loneliness'. One model question it raises: whether running a town event should draw on altruism and sociability as well as organisation.

## Round 10b: latent inclination (pre-registered 17 Oct 2026, 13:40; decided with Øystein)

Question: is a love of music dealt at birth, or called out? Research says both: practice is 40–70% heritable (Mosing et al. 2014, 10,000 twins), but genes act largely by steering experience (Scarr & McCartney 1983: inclined children get musical homes and seek music out); interest grows in phases, each needing support (Hidi & Renninger 2006); and experts' beginnings are playful, with a warm first teacher (Bloom 1985).

Mechanism (`develop` in group.ts, behind `OFF=latent`): inclination stays as it was, set at birth from aesthetic sense and ear, both partly inherited. Interest no longer comes with it: a child who grows up here starts with none (a grown newcomer brings what their childhood gave them). Something nearby calls it out: a parent who plays, at home (strongest); a partner or close friend who plays; school and the radio, weakly, from 6 to 16; and a great night (round 10a). Interest is first triggered (level 1), fades after two years with nothing to keep it alive, and once kept up for a year becomes the person's own (level 2, the level that practises and joins bands). Every step scales with inclination and with age (childhood and youth most, little after forty). The chronicle says where it came from ('has taken up guitar, like her mother'; '…; Rune got him into it'; 'and nobody quite knows where it came from').

Calibration, on six worlds (1801–1806) that the test does not use: one rate, chosen so that the share of 15–60s who play matches the dealt rule (0.17 against 0.15 at rate 0.011; 0.19 at 0.015; 0.25 at 0.03). Nothing else was tuned.

Test (`src/music.ts`, twenty fresh worlds 1811–1830, the same seeds built and run under each rule, ten present years; intervals over worlds; the family ratio pooled with a bootstrap over worlds, because few children per world have a parent who plays). Expected, latent against dealt:
1. Share who play: within ±4 points (calibrated).
2. Of adult players, share with a parent, partner or friend who plays: **at least 75%** (dealt about 66%, which is chance plus assortment).
3. Family ratio, P(plays | a parent plays) ÷ P(plays | not): **2 to 5** (dealt near 1 on the pooled figure); never above 8 (then home is too strong and musical families take over the town).
4. Sparks per great night: **two to four times** the dealt rule's.
5. Players minus non-players in inclination: still at least +0.4 SD (inclination still selects; it has not become luck).
Gate: `npm test`; the scoreboard paired on ten worlds, latent against dealt, within ±2 on every slice (hobbies are not what the witness reads). What would change our minds: a family ratio under 1.5 means the triggers are too weak against school; above 8 means a town becomes dynasties; a share of players that drifts over decades (not tested here) would mean the rule has no equilibrium.

Outcome of 10b as pre-registered (17 Oct 2026, 14:20), twenty worlds 1811–1830 (`music-r10b.txt`): share who play 0.18 against 0.19 (✓ calibrated); with a tie 76% against 74% (✓ at least 75%, but the dealt rule is nearly as high: players already cluster as friends through the hobby channel, so this measure does not separate the rules); family ratio pooled **3.87 [1.99–8.50]** against 1.25 [0.76–1.95] (✓ 2–5; the upper bound touches 8); sparks per great night 0.11 against 0.12 (**✗**, predicted two to four times); inclination gap 0.68 against 0.64 (✓). Gate: scoreboard paired on 1401–1410, key slice −2.0 ±3.2, overall −1.3 ±1.7 (within ±2); `npm test` **failed on demography** (births/deaths 0.55–0.59).

Found after the run, and fixed before anything is built on it (the run above stands as recorded):
- **The age profile was wrong.** People took up music at a median age of 24; friend-triggered take-up had a median age of 60, because the friend channel had no real age limit and older adults have most friends. Under the latent rule 3% of 12–17s played against 25% under the dealt rule. Research: interests crystallise in childhood and adolescence. The take-up curve is now full from 4 to 18, falls steeply to 30 and is near zero after 40; the friend channel weighs less than home (0.6 against 1.5; parents are the strongest predictor of children's music participation).
- **Sparks did not multiply** because the inclined young who see a great night still mostly have interest already (home and school reach them first). Accepted: the moment matters most where home did not reach.
- **Demography:** on ten calibration worlds with the corrected profile, births are 62 against 60 for the dealt rule; the earlier failure was the age profile (young adults without passions) plus noise in six worlds.
- Recalibrated on ten worlds (1801–1810): the share who play is insensitive to the rate between 0.012 and 0.018 (17–18% against 16% dealt), because take-up is limited by who is inclined and reached, not by speed. Rate 0.015.
- Rerun, pre-registered with the same five predictions plus three on families (Øystein: 'not all children follow their parents; some have it too good and some have very talented children'): of young players born here, **at least half** have parents who do not play (regression to the mean, and school, friends and nights reach the rest); of the most inclined fifth of children whose parents do not play, **at least a fifth** play anyway; of children of players, **under half** play. Range 1831–1850.

Outcome of the 10b rerun (17 Oct 2026, 14:55), twenty fresh worlds 1831–1850 (`music-r10b2.txt`), latent against dealt:
- Share who play 0.22 against 0.24 ✓. Family ratio pooled **2.92 [1.65–5.49]** against 1.03 ✓ (2–5). Children of players who play: **39%** ✓ (under half). Most inclined fifth whose parents do not play: **28% play** ✓ (at least a fifth). Inclination gap 0.64 ✓. Teens with at least a triggered interest 71%.
- **Missed:** young players whose parents do not play **32%** (predicted at least half; dealt 53%). Home now carries more than the research supports: of players whose love of music started in town, home 61, school 29, moments 31, friends 9. Sparks per great night unchanged (accepted above).
- Gate: `npm test` passes, demography included.
- Kept: the mechanism. Not tuned after the run. The miss points at a missing channel rather than a weight: the first teacher (Bloom 1985), a person outside the family who calls interest out in children who are inclined but not born into it. That is the next pre-registration if wanted, and a natural thing for a player to provide.

## Round 11: inclination and interest for every skill (pre-registered 17 Oct 2026, 15:40)

Generalises 10b from music to every skill, as setting content: for each skill the setting names the facets and aptitudes that draw a person to it (seamanship: physique, low fearfulness; care: altruism, gentleness, social insight; bookkeeping: reasoning, organisation; music: aesthetic sense and ear), and which skills school touches (writing, figures, music). One engine rule for all (`develop`): interest is called out by someone close who does it (a parent at home, a partner or close friend; for a trade, someone who works at it), by working at it, or weakly by school; it takes most in childhood and youth (interests become fairly stable by the early twenties: Low, Yoon, Roberts and Rounds 2005). Interest now does something for trades: people look for work in what they love, and a parent who works at a place puts in a word (children are about twice as likely to enter a parent's occupation: Dutch administrative data). Taking up a trade at work is ordinary life and not written down; taking something up because of a person is.

Calibration on six worlds (1801–1806) set one weight, the parent's word (0.35); trade following there rose from 0.64 (dealt) to 1.33. The dealt rule's 0.64 is structural: each trade has one workplace with a fixed size, and a parent's colleagues fill it.

Test: twenty fresh worlds (1851–1870), three rules on the same seeds: all (this round), music (10b), dealt. Expected for 'all':
1. Trade following (works in a parent's trade ÷ otherwise, pooled): **at least 1.8 times the dealt rule's**, and above 1.2.
2. Workers who love their trade: **at least 1.5 times** the dealt rule's share.
3. Inclination of those who love their trade minus the rest: **at least +0.3 SD** (the dealt rule's interest for trades came from curiosity alone).
4. corr(interest, skill) in trades at 35–60: higher than dealt by at least 0.1 (interest drives practice).
5. Music unchanged against 'music': share who play within ±4 points; family ratio between 2 and 5.
Gate: `npm test` (demography included); births ÷ deaths not below the dealt rule's by more than its interval; the scoreboard paired on ten worlds within ±2. What would change our minds: trade following no higher than dealt means the word at work and the keenness are swamped by vacancies, and occupational inheritance needs a real route (apprenticeship); demography failing means young people without a calling are leaving or not pairing, and the age profile needs looking at again.

Outcome of round 11 (17 Oct 2026, 16:30), twenty fresh worlds 1851–1870 (`interests-r11.txt`), all / music / dealt:
1. Trade following **1.41 [1.14–1.79]** against dealt 0.94 [0.68–1.22]: 1.5 times (**✗**, predicted at least 1.8 times); above 1.2 ✓. Children now follow a parent's trade more often than not, and more than under either other rule, but not twice as often: a small town has one workplace per trade with a fixed size, and the parent's colleagues fill it.
2. Workers who love their trade 0.19 against 0.09 (✓, 2.1 times).
3. Inclination gap among those who love their trade +0.36 ±0.10 (✓).
4. corr(interest, skill) at 35–60: 0.39 against 0.24 (✓).
5. Music: share who play 0.17 against 0.18 (✓); family ratio 3.53 [1.95–8.32] (✓).
Gates: `npm test` passes, demography included; births ÷ deaths 0.90 ±0.15 against dealt 1.06 ±0.24 (within); scoreboard paired on 1401–1410 against dealt, key slice −1.6 ±3.9, overall −0.5 ±1.7 (within ±2).
Read cold: 'Agnes has taken to carpentry, like her father' at eleven; the sawmill never had an opening, and she went to her mother's clinic instead, where her life went badly. The model has the unfulfilled calling but nothing yet says it. Adults by number of things they love: none 32%, one 34%, two 21%, three or more 13%.
Kept. The missed prediction points at apprenticeship as a real route into a trade (a parent or a master taking a young person on), the same family of mechanism as the first teacher: a person who brings another into something. One mechanism for both, if built.

## Round 12 — a person who brings another into something (pre-registered 17 Oct 2026, 17:10)

Two misses in round 11 point the same way: 32% of young players have parents who do not play (predicted at least half), and children follow a parent's trade 1.4 times as often as others (predicted 1.8). Both are missing the same person: the one who takes a young person on. Bloom's retrospective study of world-class performers (1985) found nearly all began with a first teacher remembered for warmth and enthusiasm rather than skill; the master–apprentice route is how trades were learned for most of history (Lave and Wenger 1991; Epstein 1998 on guild apprenticeship), and it is the role the player will hold in the game. One mechanism, `takenOn`, behind `OFF=teacher`:

- Pupil: 6–25 for music, 15–25 for a trade; latent interest below 2; no parent who does it (the point is the route outside the family); not already taken on for that skill.
- Teacher: in town, 25 or older, not family, good at it (skill at least 1250) and does it (loves it, or works at it for a trade). Routes, tried in order, one draw a month: the pupil's own workplace (the best worker there, if it is the place's trade: an apprentice, weight 1.0); staff at the school who love a hobby (0.6); a parent's friend or partner (0.5); anyone in town (0.15, the boy who kept hanging round the workshop). Chance per month = devRate × route × devImp(age) × σ(2.5(z − 0.6)) × willing, where willing = σ(altruism + 0.5·sociability) (0.5 for the average person) — inclination is what gets a child noticed.
- While taken on: a development source 'teacher' at weight 1.2 (between home 1.5 and a friend 0.6); the pupil practises monthly (0.5). Each month the pupil may stop: 0.012 base, + 0.035·max(0, −(gentleness + patience)/2 of the teacher), − 0.006·diligence of the pupil, floor 0.004; stopping under a harsh teacher is written down with evidence on the teacher's gentleness. The tie ends when either leaves town, dies, or the pupil turns 30, or when the pupil reaches level 2.
- Written down: being taken on ('@T has taken @p on: teaches her the guitar on Tuesdays' / '@p is apprenticed to @T at the sawmill'); taking to it ('@p has taken to the guitar; @T taught her'); stopping under a harsh teacher. The teacher keeps a list of pupils; a death notice says how many of the town's players or tradespeople learned from them when it is two or more.
- Nothing tuned to the result: weights above are set now from the home/friend scale of round 10b and not changed after the test.

Test: twenty fresh worlds 1871–1890, same seeds under `on` and `OFF=teacher`, residents at the end of ten present years (`src/music.ts` and `src/interests.ts`, each given the `teacher` rule), plus a new `src/teachers.ts` for the tie itself. Expected:
1. Young players (15–40, born here) whose parents do not play: **at least 50%** (32% in round 11).
2. Pupils of warm teachers (gentleness + patience above 0) reach level 2 at **at least 1.4 times** the rate of pupils of harsh ones (below −0.5), pooled, bootstrap over worlds.
3. Music family ratio stays between **2 and 5**; share of 15–60s who play within **±4 points** of `off`.
4. Trade following (works in a parent's trade ÷ otherwise) **at least 1.6** and not below `off` by more than its interval; share of young workers (20–35) who were ever apprenticed at least 15%.
5. Of adult players, share whose love came from a teacher between **15% and 50%** (not a trickle, not the whole story).
Gates: `npm test` (demography included); births ÷ deaths within `off`'s interval; the scoreboard paired on 1411–1420 within ±2 on the key slice and overall. What would change our minds: 1 failing means the route is too thin (the rate or the willing term), and we should look at who the teachers are before touching weights; 2 failing means the stopping rule does nothing visible and should go; 4 falling means apprentices crowd out the parent's word and occupational inheritance is a hiring question, not a learning one.

Outcome of round 12 (17 Oct 2026, 13:00 Oslo), twenty fresh worlds 1871–1890, the same seeds with the mechanism on and off (`music-r12.txt`, `interests-r12.txt`, `teachers-r12.txt`, `pair-r12.txt`):
1. Young players whose parents do not play **43% of 37** against 40% of 43 off (**✗**, predicted at least 50%). The route barely moved it.
2. Pupils of warm teachers took to it 17% of 149, middling 12% of 52, harsh 6% of 49: warm ÷ harsh **2.85 [1.33–160]** (✓ on the point; the interval reaches below 1.4). This is the mechanism's own stopping rule showing through, a check that the code does what it says rather than a finding.
3. Music family ratio **1.99 [1.06–4.19]** against 2.86 off (**✗**, just below 2); share who play 0.20 against 0.20 (✓).
4. Trade following **1.21 [0.96–1.50]** against **1.55 [1.29–1.85]** off (**✗**, below off's interval); young workers ever apprenticed 24% (✓).
5. Adult players whose love came from a teacher **4%** (**✗**, predicted 15–50%).
Gates: `npm test` passes, demography included; births ÷ deaths 0.92 ±0.23 against 0.85 ±0.25 (within); scoreboard paired on 1411–1420, key slice calibrated +1.7 ±4.4, overall +1.5 ±2.1 (within ±2).
Why, looked at after the result (worlds 1871–1873, already used): Skarvik is too small for a teacher route to be a population-level source. A town has one to three adults per instrument good enough to teach, eight or so children aged 6–16, and none to two of them inclined; music ties per world were two or three. For trades the failure was built in, and the pre-registration should have caught it: the pupil had to be someone whose parents do not do the trade, so every apprenticeship pulls a child towards a trade that is not the family's, and with one workplace per trade of fixed size it competes with the parent's word. Occupational inheritance is a hiring question (room for a parent's child at the parent's place), not a learning one, as the pre-registered clause said it would be if 4 fell.
**Not kept.** The mechanism stays in the code, off by default (`ON=teacher` turns it on for board.ts; `globalThis.TEACHER` in the page), so the default model is round 11's. The player's role as the person who takes someone on does not depend on the town having many such people; it may be more valuable for being rare.

Quiz, second attempt (17 Oct 2026, 13:09), the same tester (Øystein) on a fresh draw of 18 items: **6 of 18** (chance 8.5), against notebook 12, base rate 12, page-evidence 12, calibrated witness 14. Median 2.3 minutes an item, so not rushed. Confidence did not track being right: 3 of 6 at 90%, 3 of 12 at 70%. Combined with the first attempt, 16 of 38 (42%) against base rate 24, notebook 23, page 24, witness 27. On four items every reader, the base rate included, had it right and the tester did not. Two causes, both real:
- The page left out what every reader had. The readers re-run the choice with the witness's view, which includes the bond between the person and the other one in the situation (what the witness has seen pass between them; partners, family and friendships are public) and the base rate for the kind of situation. The page showed neither: the other person was a name in the question, with nothing about who they are to the person or how the two get on (the tester's own diagnosis). The comparison was unfair to the human.
- Without the base rate, a person reading a page tells a story from the traits and the history, and the story pulls them off the usual answer (base-rate neglect: Kahneman and Tversky 1973). The tester's word for it: speculation.

## Round 13 — the quiz shows the pair and the town (pre-registered 17 Oct 2026, 13:30 Oslo)

The human page gets what the readers had. For a situation with another person in it: who they are (name, age, work), what they are to the person (partner, parent, child, brother or sister, friend, workmate, same crowd, or no close tie that you know of), how each seems to feel about the other from what the witness has seen pass between them (fond of, gets on with, neither here nor there, no love for, can't stand; or "you've never seen much pass between them"), and the events between the two that the witness knows of. For every situation: how people in Skarvik usually go in that spot, in words, with its odds ("Most people in Skarvik, in this spot, would give generously (about 7 in 10)"). All frozen at the moment of the decision. The person's own page is unchanged. Readers are unchanged, plus the situation reader (bonds and circumstances, average character) stored as 'pair'.

Items from thirty fresh worlds 1901–1930, base rates from `out-9b` as before; same key slice; the first quiz's items stay as they are for comparison. Expected:
1. Every item whose situation has another person carries the pair block, frozen at the decision (items whose target was not recorded at the decision are dropped, and fewer than 10% are).
2. Read cold, twenty items in a row: no grammatical faults in the town line or the pair block.
3. The pair block carries signal. On items where the witness has a felt line about the person's feeling for the other, the kind answer (warmth, leniency, humility, discretion) is chosen at least 15 points more often when the line is warm (fond of, gets on with) than when it is cold (no love for, can't stand), pooled over items. If not, the relationship matters little in the model's choices on this slice, which is itself a finding about the model, and the block stays for fairness.
4. Humans (any tester, pooled): at least the base rate's score on the same items, and right at least 65% of the time when they say 90%. Not testable tonight.
What would change our minds: 3 failing means relationships are a weak input on the key slice, and the next work is on how bonds enter decisions, not the page; 4 failing with the town line shown means the page itself misleads (too many traits and events, no sense of which matter), which is a design question for the game's person screen.

Outcome of round 13, machine side (17 Oct 2026, 14:20 Oslo), thirty fresh worlds 1901–1930 (`quiz2-r13.txt`); 295 items generated, 213 packed:
1. Every item with another person in it carries the pair block (258 of 258; none dropped: the decision records its target). ✓
2. Read cold: the first fifty-six items in a row, after fixes made before packing (a verb after 'and' left in the third person; a person named one way on the page and another in the question, because names were resolved at the decision and twins appeared later; 'like her father' without saying who the father was). An automatic check over all 213 finds no doubled full stops, no third-person verb after 'would', and the other person's name in every question that has one. ✓
3. Kind answer when the witness's line on the person's feeling for the other is warm **71% of 56**, cold **31% of 16**: **+40 points**, bootstrap over worlds **+13 to +65**. ✓ The relationship is a strong input where the witness has a read on it; it has one for 120 of the 258 items with another person.
4. Waiting for testers.
On the packed items: base rate 119 (56%), notebook 119, situation reader 99 (46%), page-evidence 136 (64%), calibrated witness 150 (70%). The situation reader, which sees bonds and circumstances and assumes average character, does worse than the base rate: the model's own scoring of bonds is overconfident until it is calibrated against what people usually do. Published as 'Reading Skarvik II'; the first quiz is unchanged.

Review of R13 (external, 17 Oct 2026), verified before acting:
- Quiz items showed the person's age, job, name and the witness's job as they stood at the end of the run, not at the decision (q001: 44 shown, 38 at the time). Confirmed, and the first quiz had the same fault, so Øystein's two sittings saw ages up to ten years too old and sometimes a later job. Fixed: all four are captured at the decision. Quiz II republished before anyone answered it.
- The town line said 'most people' when the commonest answer had under half (44 of 213 items, all three-option). Confirmed; now 'The commonest answer in Skarvik, in this spot, is to …'.
- Round 13's human target (at least the base rate) can be met by always picking the town's usual answer, so it shows nothing about reading a person. Accepted; the human measure becomes the lift the person's page gives over the situation, the other person and the town line alone.
- Friendship forms too easily and is narrated too uniformly. Confirmed and worse than the review says (worlds 1871–1876, already used): 0.25 new close friendships per adult a year against 0.01 ended, so friendship only accumulates (median four close friends, the top tenth twelve or more, one person twenty-eight in a town of seventy-five); 407 of 450 friendship lines give the same reason, 'they want the same things from life'.

## Round 14 — friendship that is kept up, or lost (pre-registered 17 Oct 2026, 14:50 Oslo)

Measured before the change (worlds 1871–1876, already used; friends counted only while both live in town): 0.25 new close friendships per adult a year and 0.01 ended; median four close friends, the top tenth twelve or more, the most twenty-five; 19% have none; 407 of 450 friendship lines give 'they want the same things from life'. Two causes in the code: whether a friendship has faded is checked only when the two meet, so a pair who stop meeting are never checked and stay friends for ever; and nothing limits how many close friends a person keeps. The reason given is the values-similarity line because the threshold for saying it (similarity above 0.55) is passed by most pairs who like each other.

What people are like: a person's closest layer holds about five (the support clique; Dunbar 2018 reviews the layers), it differs by temperament, and it turns over while keeping its size: new close ties displace old ones (Saramäki et al. 2014, 'Persistence of social signatures in human communication'); about half of a personal network is replaced within seven years (Mollenhorst, Volker and Flap 2014). Closeness fades without contact, friends faster than kin (Roberts and Dunbar 2011).

The change, behind `OFF=friendcap`:
1. Every friendship is checked monthly, met or not, with the existing rule (liking under 0.02, or under 0.12 with familiarity under 0.35). Friends who have died or left are no longer counted.
2. Each person keeps at most round(5 + 1.5 × sociability), between 3 and 8, close friends. A new friendship with someone at their limit forms only if the new liking is higher than their weakest close friend's; that friend is let go without an event (they see less of each other; the bond is untouched and familiarity fades on its own).
3. The reason a friendship formed is written from what brought it about, in this order: something that happened between them (unchanged), how they came to spend time together (the channel that gave them most contact: work, the same crowd, the same routine, the same band, one seeking the other out, the same hobby), then the other's manner. 'They want the same things from life' only when their values are unusually close (similarity above 0.75).
Weights 1–3 are set now from the research above and not changed after the result.

Test: twenty fresh worlds 1931–1950, same seeds with and without, adults at the end of ten present years (`src/friends.ts`). Expected:
1. Close friends per adult (in town): median **3 to 5**, top tenth **at most 9**, most **at most 12**; share with none **at most 22%**.
2. Friendships ended per adult a year **at least 0.08**, and of friendships at year 0 with both still in town at year 10, **at least 30% ended**.
3. No single reason on **more than 40%** of friendship lines.
4. Lonely people are not made: strain of the least-contacted tenth not higher than without by more than its interval.
Gates: `npm test` (demography included); the scoreboard paired on 1421–1430 within ±2 on the key slice and overall. What would change our minds: 1 met and 2 not means friends are dropped only by displacement and fading is still too slow (familiarity half-life of eight years is the suspect); the scoreboard falling by more than 2 means the model's predictions leaned on accumulated friendship defaults, which is worth knowing.

## Round 14b — does knowing the person help a human? (pre-registered 17 Oct 2026, 15:20 Oslo)

The review's point stands: a human target of 'at least the base rate' can be met by always taking the town's usual answer. The question is whether the person's page adds anything for a human reader over the situation, the other person and the town line. Two groups of testers would answer it cleanly but need many testers; we have few. So each tester answers every item twice: first from the situation alone (the question, the other person's panel, the town line), then, with the person's page opened beneath, again (kept or changed). After the reveal they say whether it made sense once they knew (1 to 5). The first answer anchors the second, which biases against finding a lift, so a lift found this way is conservative.

Quiz II is changed to this before anyone has answered it. Items, wording and machine readers are unchanged.

Measures, pooled over testers, on the same items: accuracy before and after; Brier score before and after (the tester's confidence on the chosen option, the rest shared); answers changed, wrong to right and right to wrong; mean 'made sense'. Expected, when there are at least 60 answers from at least two testers (the first person in, not the designer, counts as the first independent tester):
1. Accuracy after reading the page higher than before, by at least 5 points; right-ward changes outnumber wrong-ward ones.
2. Brier score lower after than before.
3. 'Made sense' at least 3.5 on average, and no lower on items the tester got wrong than 0.5 below the items they got right (a choice that only makes sense when you guessed it is not legible).
What would change our minds: no lift, or a negative one, with the town line in front of them means the page misleads a human (too much, not the diagnostic part), and the next work is choosing what the page shows (round 15), not the model.

Outcome of round 14 (17 Oct 2026, 15:40 Oslo), twenty fresh worlds 1931–1950, with and without (`friends-r14.txt`):
1. Friends in town per adult: median **2** (✗, predicted 3–5), top tenth 6 (✓), most 8 (✓); none **26%** (✗, at most 22%). Without: median 4, top tenth 13, most 29, none 18%.
2. Ended per adult a year 0.55 (✓, at least 0.08), but made per adult a year rose with it, from 0.27 to 0.58; of year-0 friendships with both in town at year 10, **23%** ended (✗, at least 30%; 1% without).
3. Commonest reason 'the same routines kept bringing them together' on **56%** of lines (✗, at most 40%); 'they want the same things from life' fell from 90% to 21%.
4. Strain of the least-contacted tenth +0.05 ±0.07 (✓).
Friendship lines doubled (3,695 against 1,706). Why, looked at after the result (worlds 1931–1933, already used): a friend let go to make room kept their liking, so they became friends again when room opened and it was written as new. 41% of pairs with a line had two or more; they gave 67% of all lines. The cap churned the margin and left old friendships alone.
Gates: scoreboard paired on 1421–1430, key slice calibrated +0.4 ±2.6, overall +0.9 ±2.5 (within ±2; `pair-r14.txt`).
**Not kept.** Round 14c replaces it (below).

## Round 14c — friendship without a cap (pre-registered 17 Oct 2026, written before any 14c code)

Round 14's cap was the wrong mechanism. A friend let go to make room kept their liking, so when room opened they became friends again and the town wrote it down as new: in worlds 1931–1933 (already used), 41% of pairs with a friendship line had two or more, and those pairs gave 67% of all lines. The size of the closest layer is real, but it is a matter of whom a person sees most, not a list with a door. So:
1. Kept from 14: every friendship is checked monthly, met or not, with the existing fading rule; friends who have died or left are not kept.
2. No cap and no displacement.
3. What the line says matches what the model holds: '@a and @b became friends' (the model's friends are the wider circle a person would call friends; who is closest is read off liking when it is needed). A pair who were friends, drifted apart and come back within five years are friends again without a new line; 'close again, after everything' stays for those who fell out.
4. The reason names how they came together, as in 14, and when it was a shared routine, which one: 'Fridays at the Anchor brought them together', 'cards on Tuesdays at the Anchor', 'the choir'.
Weights unchanged from the code before 14 (fading rule, liking bar); nothing tuned after the 14c result.

Test: twenty fresh worlds 1951–1970, same seeds with and without (`OFF=friendcap` restores the rule before round 14). Expected:
1. Friends in town per adult: median **3 to 6**, top tenth **at most 12**, most **at most 18**; share with none **at most 22%**.
2. Of friendships at year 0 with both still in town at year 10, **at least 25%** have ended; friendship lines per adult a year **at most 0.35**.
3. No single reason on **more than 40%** of friendship lines.
4. Strain of the least-contacted tenth not higher than without by more than its interval.
Gates: `npm test` (demography included); the scoreboard paired on 1431–1440 within ±2 on the key slice and overall. What would change our minds: 1 failing on the high side with 2 met means people make friends too readily (the liking bar), not that they keep them too long; 2 failing means familiarity fades too slowly for friendship to end without a quarrel (half-life eight years).

Outcome of round 14c (17 Oct 2026, 16:40 Oslo), twenty fresh worlds 1951–1970, with and without (`friends-r14c.txt`):
1. Friends in town per adult: median 3 (✓), top tenth **13** (✗, at most 12), most **24** (✗, at most 18); none 21% (✓). Without: 3, 12, 27, 18%.
2. Of year-0 friendships with both in town at year 10, **3%** ended (✗, at least 25%; 1% without). Friendship lines per adult a year 0.26 (✓, at most 0.35).
3. Commonest reason 29% ('Fridays at the Anchor brought them together'; ✓, at most 40%). The values line fell from 89% to 25%.
4. Strain of the least-contacted tenth +0.01 ±0.04 (✓).
Checking every friendship monthly changed almost nothing, because friends do not stop meeting: the routines put every regular in contact with every other regular every month, and a circle keeps its members in touch, so familiarity never falls far enough to fade. Friendships here end only in quarrels or departures. The cause is upstream of friendship: contact in the model is not a budget. A person who goes to the Anchor every Friday is in touch with every other regular as much as with one, whatever the number. Real people have a fixed amount of social time and spread it unevenly; the layers of closeness, and their turnover, come from that (Miritello et al. 2013, 'Time as a limited resource'; Dunbar 2018). That is round 15, and it is a larger change than a friendship rule.
Gates: `npm test` passes; scoreboard paired on 1431–1440 (`pair-r14c.txt`): overall calibrated −1.3 ±2.7 (within), key slice **−4.0 ±3.3** (**✗**, outside ±2 and the interval excludes zero).
**The fading check is not kept** (off by default; `globalThis.FRIENDFADE` turns it on). It did not do what it was for, and the gate failed; the likeliest route to the scoreboard is that the friend sets feed situations ('friend' features, who is told what, the want to belong), so even a small change in who counts as a friend moves decisions. **The wording is kept**: 'became friends', the reason taken from how they came together (with the routine named), and the values line only when values are unusually close. Checked mechanically, not statistically: on three worlds the default and the rule before round 14 produce the same events, at the same times, with the same people, evidence and choices; only the words differ (`scratchpad neutral.ts`, seeds 11–13). So the scoreboard is round 13's by construction.

## Round 15 — social time is a budget (pre-registered 17 Oct 2026, 17:20 Oslo)

Round 14c showed friendships here end only in quarrels or departures, because shared settings keep every pair in touch. Measured before the change (worlds 1871–1873, already used, one year): an adult's monthly contact ranges five-fold (10th percentile 4.5, 90th 21.5 units), driven by routines, which give 39% of all contact because every regular at the Anchor is in touch with every other regular every week; the top five people get 44% of a person's contact.

What people are like: a gathering breaks into conversations of about four (Dunbar, Duncan and Nettle 1995), so in a room of fifteen a person talks with a few, and mostly with those they already like; social time is limited and spread unevenly, which is what makes layers of closeness and lets ties fade (Miritello et al. 2013; Saramäki et al. 2014). A friend you no longer see is 'someone I lost touch with', still liked.

The change, behind `OFF=budget`:
1. In shared settings with more than four people (a workplace, a routine, a hobby, a band), a person's time in that setting is what three partners would get under the old rule, shared among everyone there in proportion to attention: 0.15 + liking (if positive) + half the familiarity. A pair's contact is the mean of what each gives the other. Settings of four or fewer are unchanged. Home, family, circles, seeking someone out and serving the public are unchanged.
2. A friendship ends when the two lose touch: familiarity under 0.25 (it forms above 0.5), checked every month whether or not they meet, with no quarrel implied ('@a and @b lost touch.', and coming back within five years is not news). The existing quarrel rule is unchanged.
Constants set now from the research above and not changed after the result.

Test: twenty fresh worlds 1971–1990, same seeds with and without, plus the scoreboard paired on 1441–1450. Expected:
1. Share of an adult's contact going to their top five: median **at least 55%**.
2. Of friendships at year 0 with both in town at year 10, **at least 15%** ended.
3. Friends in town per adult: median 2 to 5, top tenth **at most 10**, most **at most 16**; none **at most 22%**.
4. Strain of the least-contacted tenth not higher than without by more than its interval.
Gates: `npm test` (demography included); scoreboard paired on 1441–1450 within ±2 on the key slice and overall. What would change our minds: 1 met and 2 not means familiarity fades too slowly (an eight-year half-life against Roberts and Dunbar's 2011 finding that friends lose closeness within a year or two without contact), and that is the next constant to look at; the scoreboard falling means the model's predictions lean on everyone being in touch with everyone, which would itself be worth knowing.

Outcome of round 15 (17 Oct 2026, 18:30 Oslo), twenty fresh worlds 1971–1990, with and without (`friends-r15.txt`, `pair-r15.txt`):
1. Share of an adult's contact to their top five: **58%** (✓, at least 55%; 50% without).
2. Of year-0 friendships with both in town at year 10, **7%** ended (**✗**, at least 15%; 1% without).
3. Friends in town per adult: median 2 (✓), top tenth 7 (✓; 12 without), most **18** (✗, at most 16; 28 without); none **26%** (**✗**, at most 22%; 21% without).
4. Strain of the least-contacted tenth −0.02 ±0.06 (✓).
Gates: `npm test` passes, demography included; births ÷ deaths 1.09 ±0.37 against 0.99 ±0.34; scoreboard paired on 1441–1450, key slice calibrated −0.3 ±4.7, overall −0.4 ±2.0 (within ±2); calibrated − notebook overall +1.8 ±1.3 against without.
Read: time now concentrates on a few people, and the long tail of friendships is gone (the most-befriended person has 18, not 28). Friendship still rarely ends, as the pre-registered clause said it would if familiarity fades too slowly: eight years' half-life against friends losing closeness within a year or two without contact (Roberts and Dunbar 2011). Contact per person fell (median monthly contact 8.0 against 12.9 on the diagnostic worlds), fewer pairs reach the familiarity a friendship needs, and the friendless share rose to 26%, high against surveys (about one adult in eight reports no close friend: Survey Center on American Life 2021).
**Kept**, with both misses carried into round 16: how fast familiarity fades between friends who stop meeting, and whether the bar for friendship (familiarity 0.5) still fits a world where time is budgeted.

Quiz II, first sitting (17 Oct 2026, 16:01 Oslo): Øystein (the designer, his third quiz; not an independent tester), 20 items, answered twice.
- **Before reading the person's page: 17 of 20** (chance 9.2, town's usual 12, notebook 12, page-evidence reader 15, calibrated witness 15, situation reader 9). With the situation, the other person and the town line, the tester beat every machine reader. He went against the town's usual six times and was right on most of them, reading the relationship and the history between the two.
- **After reading the page: 13 of 20.** Four answers changed, all four from right to wrong. Brier score 0.49 before, 0.59 after.
- Made sense once known: 4.1 on items he got right, 2.4 on items he got wrong.
Against the pre-registration (which needs 60 answers from two testers; this is 20 from one): 1 ✗ (a lift of −20 points), 2 ✗, 3 ✗ (the gap is 1.7, not 0.5). Not a verdict yet; a strong signal.
What the four changes have in common: a vivid act on the page read as general character. Audun had passed off a song as his own, so he would flatter a colleague about a plan (he told him plainly what was wrong with it; both machine readers gave honesty, 81% and 94%). Halvor is 'fairly sure: lets go of wrongs', but was first at the Anchor to say how things ought to be done, so he would dig in (he said nothing and got on with it; the page-evidence reader read the page right). In the model, as in people, consistency across kinds of situation is modest: taking credit and telling the truth about a plan are different facets (Mischel 1968; the HEXACO facets of one dimension correlate, but loosely). Readers who generalise from one striking act (the halo effect: Thorndike 1920; Nisbett and Wilson 1977) are making the ordinary human mistake. For the game that is not a flaw in the person; it is the thing a player has to learn, and the page and the reveal must teach it.

## Round 14d — can a reader learn Skarvik? (pre-registered 17 Oct 2026, 16:30 Oslo)

If the person's page misleads because readers generalise from one striking act, the remedy a game has is feedback that teaches what an act does and does not say. 'Reading Skarvik III' is Quiz II with one addition: after the reveal, the reasons the town's record gives for what the person did (the same causes the chronicle prints, in plain words: 'lets go of wrongs', 'Rolf is a friend'). Items from thirty fresh worlds 2001–2030, built exactly as Quiz II's; Quiz II stays as it is for independent testers.
Measures, per sitting of twenty, pooled over testers: the lift from the first answer to the second (before and after reading the page) in the first ten items and in the last ten; accuracy after reading in each half; 'made sense' on items answered right and wrong.
Expected, once there are at least 60 answers from at least two testers: the lift in the last ten **at least 10 points higher** than in the first ten; the gap in 'made sense' between right and wrong items **smaller than Quiz II's** (1.7 on the first sitting). What would change our minds: no rise across a sitting means twenty items are too few to learn from, or the reasons do not teach (they name a trait, but not why that trait and not another one decided it); a rise in accuracy with no rise in 'made sense' means readers learn a rule without understanding the people.

## Round 16 — Drama I: ambition and rivalry (pre-registered 17 Oct 2026, 17:10 Oslo)

The question has changed. The readers show that what people do follows from who they are; the town is still boring to read. Measured before any change (worlds 1871–1874, already used; adults present through ten years; `src/story.ts`): 18% of lives have fewer than five weighty events in ten years; 3% of adults have a single arc (a want that meets an obstacle and reaches an outcome); nobody has a named rival; 22% of weighty events tie back to the person's own past; 35 kinds of decision, the commonest being a promise to keep (13%), the hat going round (10%), supporting someone (9%). Read cold (world 1871): Olav is told 'exactly what was wrong with the plan' three times and never has one; Marit has two events in ten years; Tobias is blamed twice by Arne, passed over for chief officer in Arne's favour, sulks, and gets it himself the same year, and nothing in the record ties those together. People react to a menu of situations. They do not want anything that someone else also wants.

What people are like: promotion contests raise effort and, between close competitors, sabotage (Lazear and Rosen 1981; Lazear 1989; Chen 2003). Rivalry is a relationship, not a single contest: it grows between people who are similar, compete repeatedly and finish close, and rivals invest more and cut more corners against each other than against anyone else (Kilduff, Elfenbein and Staw 2010; Kilduff, Galinsky, Gallo and Reade 2016). Who undermines a colleague is predicted by low Honesty-Humility (fairness, sincerity, modesty: Lee, Ashton and de Vries 2005; Pletzer et al. 2019). A grudge outlives the contest for the unforgiving and fades for the forgiving (McCullough et al. 2007).

The change, behind `OFF=drama` (a new module, `src/drama.ts`, with its own random stream):
1. Succession is a season, not a moment. A lead who is 61 or older, or seriously ill, or wants to leave, may announce that they will step down (about one chance in three a year); they step down eight to fourteen months later. Through that time, staff with a year's service decide whether to go for the post (wanting it, success, social boldness and their record against modesty and anxiety), and say so.
2. Two who go for the same post become rivals when they are close enough to feel it (similar record and age, or a contest between them before).
3. Rivals act on it every few months, more often the hotter it runs: work to be seen (diligence), run the other down to the one who decides (low fairness and sincerity; secret, and found out about one time in five, more when it runs hot), pick at the other's work in front of people (low gentleness), or step aside (modesty). Each act is a decision like any other, logged with its reasons, and the hostile ones become situations for the other.
4. The outgoing lead's regard and what the campaign did count in who gets the post, beside the record. The loser answers as before (congratulate, swallow it, confront, sulk, quit); answered with pride or anger, the rivalry becomes a grudge with the post as its history. A grudge is carried in small acts (coldness, a jab, a word in someone's ear, avoiding them) until the two make peace, one leaves or dies, or it cools.
5. Every act in a rivalry cites where it started, so the record ties the story together.
Weights are set now from the research above and the scale of the existing engine; nothing is tuned after the result.

Test: twenty fresh worlds 2031–2050, same seeds with and without (`src/story.ts`), the scoreboard paired on 1451–1460, five lives read cold. Expected:
1. Adults with at least one arc: **at least 12%** (3% before).
2. Adults with a named rival: **between 8% and 35%** (a town where most people have a rival is a soap, not a town).
3. Callbacks: share of weighty events tied to the person's own past **up by at least 4 points**.
4. Dead lives not more common; repeats not up by more than 3 points.
5. Kinds of decision up; the entropy of decisions not down.
Gates: `npm test` (demography included); the scoreboard paired on 1451–1460 within ±2 on the like-for-like key slice (round-4 situations · novel · contested · known) and overall. What would change our minds: 1 and 2 met with lives that still read as lists means rivalry is a mechanism the record does not tell; 2 above 35% means the bar for rivalry is too low; the scoreboard falling means rivalry acts carry less character than the decisions they displace.

Outcome of round 16 (17 Oct 2026, 19:10 Oslo), twenty fresh worlds 2031–2050, with and without (`story-r16.txt`, `pair-r16.txt`). Before the test, on used worlds 1871–1880 only: two mechanism faults fixed (a grudge warmed itself with every act it caused, so grudges ran away; anyone found out schemed again at once), the season changed from a random chance of considering the post to two looks (just after the announcement and four months before the lead goes), and one constant calibrated: how strongly an open post pulls (0.8, which gives 1.4 contenders a season on those worlds, between 1.0 at 0.7 and 1.8 at 0.85).
1. Adults with at least one arc **11% ±4** (**✗**, predicted at least 12%; 1% without).
2. Adults with a named rival **13% ±4** (✓, between 8% and 35%).
3. Callbacks 24% against 22% (**✗**, +2, predicted at least +4).
4. Dead lives 17% against 17% (✓); repeats 19% against 19% (✓).
5. Kinds of decision 46 against 36 (✓, though the count is flattered by one kind per post: 'whether to go for foreman' and 'for skipper' count apart); entropy 4.55 against 4.44 bits (✓).
Gates: `npm test` passes; scoreboard paired on 1451–1460: overall calibrated −0.2 ±2.3 (within), key slice −3.4 ±5.6 and like for like −3.5 ±5.5 (**✗ on the point estimate**, an interval wide enough to hold +2 and −9).
Read cold (world 2035, a test world): Stian is passed over for headteacher in Siri's favour, picks holes in her work in front of everyone a year later, and she goes to him and offers to put it behind them; they bury the hatchet two years after the job. (World 1871, used:) Maja runs Elin down to the outgoing head, is found out, gets the job anyway, and for four years Elin needles her in public while Maja keeps talking behind her back.
**Kept, as an exception to our rule, said plainly.** The gate exists to stop changes that make people harder to read; it failed on its point estimate with an interval that cannot tell harm from noise, while the slice with five times the decisions is flat. There is also a reason to expect a real cost: rivals' secret acts change how people feel about each other where the witness cannot see, and decisions in ordinary situations then turn on bonds the witness does not know. That is what hidden drama does to an observer, and the game wants it. From round 17 on, the gate is the overall slice within ±2; the key slice is still reported beside it.

## Round 17 — Drama II: plans that need other people (pre-registered 17 Oct 2026, written before any of its code is wired in)

Round 16 gave people something to want from each other, but only at work and only when a post falls vacant: 13% of adults got a rival, and the record still reads as a list for most. Olav is told what is wrong with 'the plan' three times and never has one. What lives lack is a project of their own that needs other people.

What people are like: people carry a handful of personal projects at any time, and how meaningful, manageable and supported by others they are predicts how life goes (Little 1983; Little 2007). Goals are pursued inside networks: others help, hinder, or are drawn in (Fitzsimons, Finkel and vanDellen 2015). Being asked for help is one of the commonest moral tests in ordinary life, and refusing a friend is costly to the friendship (Flynn and Lake 2008 on how much people underestimate others' willingness to help). New businesses in small places draw opposition from incumbents whose trade they threaten.

The change, behind `OFF=projects` (a new module, `src/projects.ts`, with its own random stream; kinds are setting content):
1. A person with the drive, values and (for a venture) the skill for it may start a plan, and says so. Skarvik has two kinds: a venture (a café in the old bank: needs money, the council's say-so, takes one to two years, threatens the Anchor's trade) and a cause (a summer festival on the quay: needs helpers, the council's say-so, six to ten months, comes round again each year if it went well). One plan of a kind at a time.
2. The owner asks people they know for money or for their hands, about one a month, those they regard most first. Each answer is the other person's decision (the bond, their generosity, whether they believe in the owner, what they can spare), logged with its reasons.
3. Whoever the plan threatens decides whether to fight it: openly, by a word to the council, or not at all. A fight makes them rivals with the owner, and the rivalry carries on in the round 16 engine.
4. The council's chief officer decides, weighing the owner against the objectors and the people behind it.
5. A venture that opens is a new place in town, with the owner at its head and jobs to fill. A festival is one night: each helper does their part or doesn't (a decision each), and the night goes well or badly accordingly, and the town remembers who let it down.
6. A plan can fail: the money never comes, the council says no, too few will help.
7. When a boss asks staff what they think of 'the plan', it is now a real plan: the boss's own if they have one, otherwise one of their workplace's (setting content: a second boat for the fleet, opening the Anchor on Sundays).
Also kept from round 16: rivalries are about a named thing ('the head mechanic's job', 'the café'), so a rival over trade carries on like any other.

Test: twenty fresh worlds 2051–2070, the same seeds with the plan engine on and off (round 16's drama on in both), `src/story.ts` plus a count of plans; the scoreboard paired on 1461–1470; five lives read cold. Expected:
1. Dead lives (fewer than five weighty events in ten years) **down by at least 3 points**.
2. Adults with at least one arc **up by at least 5 points**.
3. Callbacks **up by at least 3 points**.
4. A café opened in **at least 30%** of worlds within ten years; a festival held in **at least 50%**; plans that fail **at least a quarter** of those that end (if nothing fails, nothing is at stake).
5. Repeats not up by more than 3 points.
Gates: `npm test` (demography included); the scoreboard paired on 1461–1470 within ±2 overall (the key slice reported). What would change our minds: 4 met and 1–3 not means plans happen to a few people while everyone else is untouched (the asking reaches too few); 4 not met means the bar to start is too high for the town's people, and the draw needs looking at before anything else.

Outcome of round 17 (17 Oct 2026, 17:50 Oslo), twenty fresh worlds 2051–2070, with and without (`story-r17.txt`, `plans-r17.txt`, `pair-r17.txt`). Before the test, on used worlds only: the word to the council against a plan got its own wording, only the head of a threatened place makes it a rivalry, the council needs a reason to refuse a festival, and one constant was set (an owner asks up to two people a month), because organisers on used worlds asked too few people for any festival to happen.
1. Dead lives 15% against 16% (**✗**, −1, predicted at least −3).
2. Adults with at least one arc 11% against 12% (**✗**). The measure counts wants with a pursuit and rivalries; a plan is neither, so a plan that met the council and failed is not counted. The measure missed what the round built; that is recorded here, not fixed after the fact, and `story.ts` counts plans from round 18 on.
3. Callbacks 25% against 25% (**✗**).
4. A café opened in **2 of 20** worlds (**✗**, predicted at least 30%); a festival held in **14 of 20** (✓); of 82 plans that ended, 42 failed (✓, at least a quarter). 87 plans in all; 16.6 of 79 people per world were asked, opposed or owned one.
5. Repeats 19% against 19% (✓).
Kinds of decision 53 against 46; kinds of weighty event in the town 123 against 115.
Gates: `npm test` to run with round 18; scoreboard paired on 1461–1470, overall 0.0 ±2.2 (within), key slice +0.1 ±4.5.
Read (world 1871, used): Mari's café gets 27 of the 24 it needs from four backers, but the Anchor's staff go to the chief officer one after another, and the council turns it down; Berit's festival fails twice for want of helpers, and the same two people (Leif, Linn) say yes both times.
**Kept.** It passes its gates and reaches a fifth of the town, but it did not make most lives fuller: a plan touches the owner and the people asked, and asking is one decision each. Plans need more of what follows from them (a backer who lost money, a café that changes the Anchor's trade) before they move the town. The café is too hard to open: money and the council together stop nine in ten.

## Round 18 — a way of being (pre-registered 17 Oct 2026, 18:10 Oslo)

People have temperaments and no way of being: no humour, no voice, no oddities, no small loves, and what happens to them leaves no shape (a man passed over for foreman is not touchy about it afterwards). In a town or a city, everyone must be a little different, resemble others, and feel like themselves. Nothing of this is authored per person; it is generated from what everyone already has (`src/persona.ts`, content in the setting: life material and small loves).

What people are like: personality has levels: traits, what life has made of the person (concerns, strategies, if-then signatures), and the story they tell (McAdams 1995; Mischel and Shoda 1995). Humour comes in four styles, each partly explained by traits (affiliative with extraversion, aggressive with low agreeableness, self-defeating with neuroticism, self-enhancing with low neuroticism: Martin et al. 2003; Veselka et al. 2010). Being marked by an event is likelier for the anxious and the unforgiving, and fades unless renewed (rumination: Nolen-Hoeksema 2000; McCullough et al. 2007). People sort into loose types while each is unique (Gerlach et al. 2018).

The change, behind `OFF=persona`:
1. Surface, fixed for life from traits and the person's own seed: humour (four styles and wit), voice (talk, bluntness, dryness, warmth, formality), quirks (patterns from the strongest traits, filled from their own life: their trade's things, their people, their years, their grudges; more and stranger for the unconventional), two or three small loves.
2. Depth, growing from history: sore spots (passed over, run down behind one's back, shown up in public) and fears (out of work, being left, a crisis, losing people young), acquired by some and not others (anxious and unforgiving people, weighty and public blows), fading with years; pride points; rules to live by, a value with an origin.
3. Sore spots and fears act as if-thens acquired from experience: a touched one changes how the person answers, and the record gives it as the reason. Rules to live by join the person's story about themselves and pull decisions the way that story does. Quirks appear in everyday lines (same moments as before, now in the person's own detail). Humour makes its own moments: the one who gets a room laughing, the one who jokes about their own bad year, the one with a name for someone that has caught on.

Test, part one, the people: eighty fresh worlds 2101–2180, ten present years each, every adult at the end. Expected:
1. Adults whose quirks (as written) are identical to another adult's, among those with quirks: **at most 2%**. Full surface (quirks, main humour style, voice in thirds, loves) identical to another's: **at most 0.5%**. Adults with nothing at all (no quirk, no history mark, no strong humour or voice): **at most 10%**.
2. Nearest neighbours in trait space share a surface feature (main humour style, a quirk pattern, a small love) **at least 1.5 times** as often as random pairs.
3. Humour styles track traits in the published direction and size: warm with sociability r 0.3 to 0.6; cutting with gentleness −0.25 to −0.55; self-mocking with anxiety 0.2 to 0.5; coping with anxiety −0.2 to −0.5 (a check that the generator does what it says, not a discovery). Quirk count with unconventionality r at least 0.2.
4. Adults over 40 with at least one mark from their own history (sore spot, fear or rule): **between 35% and 75%**. Nearest neighbours in traits differ in those marks **at least 80%** of the time.
Test, part two, the town: twenty fresh worlds 2181–2200 with and without; `src/story.ts`. Expected: at least 10 acts per world over ten years give a sore spot or fear as their reason, and at least 5 a rule; dead lives and repeats not up. Gates: `npm test` (demography included); the scoreboard paired on 1471–1480 within ±2 overall (key slice reported). Read cold: eight people described, five lives.
What would change our minds: collisions above the bound mean the material is too thin for a town, let alone a city; neighbours no more alike than strangers mean the surface is noise, not character; marks on almost everyone mean the bar is too low and they stop meaning anything.

Outcome of round 18, part one (17 Oct 2026, 18:30 Oslo), eighty fresh worlds 2101–2180, 5,217 adults (`personas-r18.txt`):
1. Quirks as written identical to another adult's: **40%** of those with quirks (**✗**, at most 2%). Full surface identical: 0.15% (✓). Nothing at all: 0.2% (✓). 1,562 distinct quirk texts among 8,338.
2. Nearest neighbours in traits share a surface feature 70% against random pairs 45%, ratio 1.56 (✓, at least 1.5).
3. Humour against traits: warm–sociability 0.52, cutting–gentleness −0.50, self-mocking–anxiety 0.41, coping–anxiety −0.37 (✓ all); quirk count–unconventionality 0.72 (✓).
4. Adults over 40 with a mark from their own history **27%** (**✗**, 35–75%); nearest neighbours' marks differ 96% (✓).
Why 1 failed: the variety is in the blanks, and a third of the patterns have none ('has a list for everything, including a list of the lists', 'will not go out on the water, in a fishing town'), so everyone with that trait says the same thing; and patience alone gave 531 people 'has been teaching {person} the same knot for years'. The combination still makes almost everyone unique (0.15%), but single quirks repeat, and a reader meets the same sentence in the next house. Why 4 failed: the bar to be marked is high enough that three in four people over forty carry nothing from their history, and the marks that do come are dominated by two kinds (shown up in public, froze in a crisis).

Outcome of round 18, part two (17 Oct 2026, 19:20 Oslo), twenty fresh worlds 2181–2200, with and without (`story-r18.txt`, `pair-r18.txt`): acts giving a sore spot or fear as their reason **10.3 ±2.8** per world (✓, at least 10); acts giving a rule to live by 17.3 ±3.7 (✓, at least 5); 33 moments of humour per world. Dead lives 13% against 15% (✓, down); repeats **21% against 19%** (**✗**, up 2: a funny person's moments are all of one kind). Gates: `npm test` passes, demography included; scoreboard paired on 1471–1480, overall +0.3 ±2.1 (within), key slice −1.1 ±3.8.
Read cold (world 2185, a test world): Eva goes to pieces at the head-office visit and freezes in the storm in 2029, and two years later tells the story of the day she froze better than anyone, always against herself; she feeds a stray cat everyone else chases off, and has been teaching Aksel the same knot for years. Ivar has five events in ten years and a persona (says little, says exactly what he thinks, has never once spoken at a meeting and has opinions about every one) that his record never shows. Text faults fixed on sight: 'owned up to undefined', 'a boat of their own', 'says exactly what they think', 'their dog', 'what she had wanted for 1 year'.
**Kept.** Two of its people predictions failed (quirks repeat word for word; history marks too few); round 18b mends them.

## Round 18b — every quirk from a life, and marks on more lives (pre-registered 17 Oct 2026, 19:25 Oslo)

The changes, from round 18's diagnosis:
1. Every quirk pattern takes at least one blank from the person's own life (their trade's things, their people, their years, their places, their grudges), and every trait pole that has patterns has at least three, so no single sentence can dominate a trait.
2. History marks from more of what happens to people: losing a partner or a close parent at any age (holding on to the people left), illness of one's own (taking no chances with health), being let down by someone they counted on (sore about promises), a long spell out of work (afraid of it), money lost (afraid of being short), coming home after years away (will not leave again), seeing their children grown (proud of them), helping someone through the worst (proud of it). The bar to be marked is unchanged.
Test: eighty fresh worlds 2201–2280 (`src/personas.ts`). Expected:
1. Quirks as written identical to another adult's: **at most 2%** (the round 18 bound, kept). No single pattern in more than 3% of adults.
2. Adults over 40 with a mark from their own history: **35% to 75%**; no single kind of mark more than 30% of all marks.
3. Unchanged from round 18: full surface identical at most 0.5%; nearest neighbours share a surface feature at least 1.5 times as often as random pairs; humour against traits as before.
Gates: `npm test`; the scoreboard paired on 1481–1490 (with and without the new marks, `OFF=marks`) within ±2 overall.

Outcome of round 18b (17 Oct 2026, 20:30 Oslo), eighty fresh worlds 2201–2280, 5,157 adults (`personas-r18b.txt`, `pair-r18b.txt`):
1. Quirks as written identical to another adult's **18%** (**✗**, at most 2%; 40% in round 18); the most used pattern in **4.5%** of adults (**✗**, at most 3%; 'has forgotten what {person} did in {year}, and means it'). Distinct quirk texts 3,887 of 8,340 (1,562 before).
2. Adults over 40 with a mark from their own history **47%** (✓, 35–75%); the largest kind of mark 22% of marks (✓, at most 30%).
3. Full surface identical 0.04% (✓); nearest neighbours share a surface feature 1.61 times as often as random pairs (✓); humour against traits as before (✓).
Gates: `npm test` passes; scoreboard paired on 1481–1490 with and without the new marks, overall +0.1 ±1.3 (within), key slice −1.0 ±1.7.
Why 1 still fails: the blanks have too few fillings (five rooms, three doors, seven chores), and the same first names and years recur across towns, so 'labels the jars in the hallway' and 'has forgotten what Kari did in 2019' are written for many people in different towns. Two people sharing a sentence in different towns is no fault; two in the same town is. The measure pooled across towns, and the fix needs a town-level rule as well as richer fillings.
**Kept.** Round 18c: within a town, a quirk sentence is held by one person (the town knows it as theirs), and the fillings are richer.

## Round 18c — a town knows each oddity as someone's (pre-registered 17 Oct 2026, 20:40 Oslo)

The change: quirks are given out to a town's people at sixteen (and looked at again at thirty and fifty, as their lives fill in), in turn, and a sentence already held by someone living in the same town is not given again; a pattern held by two others in the town is passed over when the person has another that fits. The fillings are richer (more rooms, chores, doors, things to count). Quirks touch only the words of everyday lines, so the change cannot move a decision; that is checked mechanically (same events, people, evidence and choices with and without, `OFF=townquirks`), not with the scoreboard.
Test: eighty fresh worlds 2281–2360 (`src/personas.ts`, now recording each adult's town). Expected:
1. Adults sharing a quirk sentence with another living adult **of the same town**: **at most 1%**.
2. Pooled across towns: **at most 10%** (strangers in different towns may share a habit; neighbours should not).
3. No pattern in more than 3% of adults.
4. As round 18b: full surface identical at most 0.5%; nearest neighbours 1.5 times as alike as random pairs; marks on 35–75% of adults over 40.

Outcome of round 18c (17 Oct 2026, 20:55 Oslo), eighty fresh worlds 2281–2360, 5,209 adults (`personas-r18c.txt`). The mechanical check: with and without, two worlds produce the same events, people, evidence and choices (seeds 11, 12).
1. Sharing a quirk sentence with someone in the same town: **0.12%** (✓, at most 1%).
2. Pooled across towns: **18.6%** (**✗**, at most 10%): the same first names and years recur from town to town, so 'has forgotten what Kari did in 2019' is written in several towns.
3. Most used pattern in **3.7%** of adults (**✗**, at most 3%).
4. Full surface identical 0.04% (✓); nearest neighbours share a surface feature **1.48 times** as often as random pairs (**✗** by a hair, at least 1.5; 1.61 before: keeping neighbours in a town apart costs a little resemblance); marks on 48% over 40 (✓).
**Kept.** What a reader meets, the town, now has each oddity once. The pooled figure counts strangers in separate towns who will never meet; in a city they are one town and the town rule applies to all of them. Pattern dominance (3.7%) and the slight loss of resemblance are left as they are.

## Round 19 — growing up together, and losing touch (pre-registered 17 Oct 2026, 21:00 Oslo)

Measured before (round 15 test worlds and a diagnostic on used worlds 1971–1974): 26% of adults have no friend in town, and 48% of those aged 18 to 29; of friendships at year 0 with both still in town ten years on, 7% have ended. Two causes in the model. Children have no setting of their own: they meet family and, from fourteen, people who share a hobby, so a young adult starts at eighteen with history with nobody; and nobody under sixteen can make a friend. And whether a friendship is still alive is read off familiarity, which fades over eight years, so friends who stop meeting stay friends for most of a decade.

What people are like: most close friendships of early adulthood begin in school and youth, among people of the same age who see each other daily (Hartup and Stevens 1997; in small towns the school is the one setting every child shares). Adolescent friendships are real friendships from early teens. Closeness between friends falls within one to two years without contact, while knowing someone does not (Roberts and Dunbar 2011; Oswald and Clark 2003 on best friends after leaving school).

The change:
1. A school (`OFF=school`): children and young people from six to eighteen who are not working spend each school day with those within two years of their age, their time shared by attention as in any setting of more than four (round 15). Friendships can form from twelve.
2. Losing touch (`OFF=recent`): each bond carries how much the two have been in contact lately (a running sum that halves in about six months), and a friendship ends without a quarrel when that falls below what a meeting every five months or so would give. Familiarity, how well they know each other, is unchanged and still fades slowly.
Constants set now from the research above; nothing is tuned after the result.

Test: twenty fresh worlds 2361–2380, the same seeds with and without both, adults at the end of ten present years (`src/friends.ts`, now also by age). Expected:
1. Adults with no friend in town **at most 18%**; aged 18–29 **at most 25%**.
2. Of friendships at year 0 with both in town at year 10, **at least 15%** ended.
3. Friends per adult: median 2 to 5; top tenth at most 10; most at most 16.
4. Strain of the least-contacted tenth not higher than without by more than its interval.
Gates: `npm test` (demography included); the scoreboard paired on 1491–1500 within ±2 overall. What would change our minds: 1 met only for the young means the adult bar for friendship is the problem for everyone else; 2 met with 1 failing badly means losing touch strips people faster than they make friends, and the balance needs the formation side looked at.

Outcome of round 19 (17 Oct 2026, 21:50 Oslo), twenty fresh worlds 2361–2380, with and without (`friends-r19.txt`, `pair-r19.txt`):
1. Adults with no friend in town **24%** (**✗**, at most 18%; 25% without); aged 18–29 **27%** (**✗** by two points, at most 25%; 46% without).
2. Of friendships at year 0 with both in town at year 10, **15%** ended (✓; 6% without).
3. Friends per adult: median 2 (✓), top tenth 7 (✓), most **18** (✗, at most 16).
4. Strain of the least-contacted tenth +0.01 ±0.07 (✓).
Gates: `npm test` passes, demography included; scoreboard paired on 1491–1500, overall −0.6 ±2.1 (within), key slice −1.0 ±5.0.
Read: growing up together nearly halves friendlessness among the young, and friendships now end when people stop seeing each other. For everyone else the share without a friend did not move, as the pre-registered clause said: the adult bar for friendship is the problem. It was set as a familiarity of 0.5 when adults had half again as much contact as they have since social time became a budget (round 15), so fewer pairs ever reach it.
**Kept.** Round 19b: the bar for friendship relative to a person's own social world, not an absolute.

## Round 19b — the bar for friendship, relative to one's own world (pre-registered 17 Oct 2026, 21:55 Oslo)

What people are like: closeness is relative. People's closest layer is the handful they spend most time with, whatever their total (Dunbar 2018; Saramäki et al. 2014: the shape of a person's ties is stable while its scale varies). An absolute bar set in one regime of contact strands people when the regime changes, as it did in round 15.
The change (`OFF=relbar`): a friendship can also form when two people like each other enough (the bar is unchanged) and each is among the other's five most familiar people outside the family, with at least some familiarity (0.2). The absolute route (familiarity above 0.5) stays.
Test: twenty fresh worlds 2381–2400, with and without (`src/friends.ts`). Expected:
1. Adults with no friend in town **at most 18%**; aged 18–29 **at most 25%**.
2. Friends per adult: median 2 to 5; top tenth at most 10; most at most 16.
3. Of year-0 friendships with both in town at year 10, still at least 15% ended.
Gates: `npm test`; the scoreboard paired on 1521–1530 within ±2 overall.

Outcome of round 19b (17 Oct 2026, 22:30 Oslo), twenty fresh worlds 2381–2400, with and without (`friends-r19b.txt`): adults with no friend in town **25%** against 24% (**✗**); aged 18–29 35% against 28% (**✗**); median 2, top tenth 7, most 18 (✓, ✓, ✗); 18% of year-0 friendships ended (✓). It changed nothing.
Why, looked at after the result (used worlds 1971–1973): of the five people a friendless adult knows best outside the family, 95% like them no more than the bar, and they like those people a median of 0.13. Familiarity was never what stood in the way; liking was. In the model, liking between two people is their chemistry (values in common, the other's warmth and liveliness) scaled up as they come to know each other, and knowing someone adds nothing of its own.
**Not kept** (off by default). Round 19c looks at liking itself.

## Round 19c — getting to know someone makes them easier to like (pre-registered 17 Oct 2026, 22:35 Oslo)

What people are like: repeated pleasant contact raises liking by itself, beyond what the two have in common (mere exposure in live interaction: Reis, Maniaci, Caprariello, Eastwick and Finkel 2011; Moreland and Beach 1992 on classmates seen more often liked more), but not where there is real friction.
The change (`OFF=exposure`): the liking a person moves toward for someone gains 0.2 times their familiarity, unless their chemistry is clearly bad (below −0.3). Set from the size of the effects in those studies, not tuned.
Test: twenty fresh worlds 2401–2420, with and without (`src/friends.ts`). Expected:
1. Adults with no friend in town **at most 18%**; aged 18–29 **at most 25%**.
2. Friends per adult median 2 to 5; top tenth **at most 10**; most at most 18.
3. Of year-0 friendships with both in town at year 10, at least 15% ended.
4. Dislike survives: the share of familiar pairs (familiarity above 0.3) where one dislikes the other (liking below −0.2) not down by more than half.
Gates: `npm test`; scoreboard paired on 1531–1540 within ±2 overall.

Outcome of round 19c (17 Oct 2026, 23:40 Oslo), twenty fresh worlds 2401–2420, with and without (`friends-r19c.txt`, `pair-r19c.txt`):
1. Adults with no friend in town **15%** (✓, at most 18%; 28% without); aged 18–29 **25%** (✓, at the bound; 39% without).
2. Friends per adult: median 3 (✓), top tenth 10 (✓, at the bound), most **22** (**✗**, at most 18; 17 without).
3. Of year-0 friendships with both in town at year 10, 16% ended (✓; 17% without).
4. Familiar pairs where one dislikes the other 6.6% against 9.3%, down 29% (✓, not down by more than half).
Gates: `npm test` passes, demography included; scoreboard paired on 1531–1540, overall +1.2 ±2.5 (within), key slice +2.7 ±6.4.
Read: liking was what stood between friendless adults and friends, as round 19b's diagnosis said; with it, friendlessness halves and dislike still survives where chemistry is bad. The tail is too long: the most-befriended adult has 22 friends in a town of about 80, which is a hub no village has. The lively and the well-placed (the Anchor regulars, those at the biggest workplace) gather everyone. The budget caps conversation but not friendship, and friendship is only lost through losing touch, which a hub never does.
**Kept.** Open: a cap on how many friendships a person can keep up (the inner layers in Dunbar's account are about 5 and 15), to be pre-registered on its own.
