# Working skills

Every change to the model passes through all seven skills, in order. A change that fails one is not done.

## 1. Personality scientist
- Ground every mechanic in research; say plainly where the model departs from it.
- Working knowledge: HEXACO's 24 facets, Mischel's if-then signatures (CAPS), Fleeson's whole trait theory (a trait is a range of behaviour, not a point), situational strength, Schwartz values, McAdams' narrative identity, Funder's Realistic Accuracy Model.
- Use Funder's model for witness coverage: a trait is judged accurately only when behaviour is relevant, available, detected and used. Diagnose low coverage by finding which link breaks.
- Guards against: inventing folk psychology where the literature has a better answer.

## 2. Measurement auditor
- Before a run, write the question, the baseline, the expected result, and what would change our minds.
- Held-out worlds, fixed seeds, spread across worlds rather than averages alone.
- Ablate one thing at a time. Check the witness never sees hidden state.
- Never call a change inside the noise an improvement. Show two or three concrete examples next to every number.
- Guards against: Goodhart. Character lift is a diagnostic, never a target.

## 3. Character reader
- After every change, read five random lives cold, before the metrics.
- For each: can I say who this person is in one sentence? Did they surprise me for a reason I understand afterwards? Does any line read as generated?
- Prefer contradictions with a motive and specific detail over generic detail. Fix text bugs on sight.
- Rule 8: no homophobic, sexist or racial content; controversy lives in convictions and acts, never identity.
- Guards against: good numbers attached to forgettable people.

## 4. Simulation engineer
- Deterministic worlds, replayable from a seed.
- Every decision logged with its top causes, signed, so "why did she do that?" always has an answer.
- Setting-free core; settings arrive as content packs, never code branches. Groups are general; kinds are setting content.
- Invariant tests: births roughly equal deaths, sensible age pyramid, no orphaned threads. Performance budget for thousands of people over decades.
- Guards against: a model that cannot explain itself or leaks hidden state to the player.

## 5. Emergence designer
- Measure how character shapes exposure (which situations a person meets) separately from decisions under identical circumstances.
- Silent-facet triage: a facet with no observable consequence is fixed, kept or cut.
- Watch for convergence, runaways and dead lives.
- Benchmark against Talk of the Town, Versu, Prom Week, Dwarf Fortress, CK3 and The Sims; name what each does better.
- Guards against: depth nobody can trigger.

## 6. Revelation designer
- For every trait, define where it can be witnessed and which fragment each situation reveals.
- Reading test: readers judge people from evidence alone, with the situation-only baseline shown beside their score.
- Do not lead readers. Record what they believe happened, not what they liked.
- Guards against: a rich inner life nobody can perceive.

## 7. Steward
- Keep `SUMMARY.md` and the docs current. Docs describe the current design only.
- Track decisions, outline before big deliverables, push back plainly.
- Do not optimise for the highest character-lift score; people must stay able to surprise for understandable reasons.
- Keep the exit criterion explicit and check it every session.
- Guards against: the testing becoming the project.
