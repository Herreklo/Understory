# External review, 18 October 2026: "The Lab — independent technical review" (round 19c and scale S11b)

From an outside reviewer, given the archives of round 19c and the city-scale track at S11b, supplied by the owner. Kept as received. The standing rule applies: external reviews are read and checked against the code, never acted on reactively. The lab's reading, checked against the repository the same day, is at the end.

---


**Reviewed:** 18 October 2026  
**Source material:** `person-model-lab-src-r19(1).tgz` (Person Model Lab, round 19c) and `city-scale-r19-s11(1).tgz` (city-scale track, with S11b results).  
**Scope:** Read-only examination of source files, experiment design, stored experiment results, documentation, test harnesses and selected independent execution. No modification of the supplied archives or source repository.  
**Important qualification:** These are earlier snapshots supplied by the owner, **not verified against current GitHub HEAD**. Findings may already have been fixed.

## Executive verdict

This is a real and nontrivial experimental simulation engine, with more technical substance and considerably more empirical self-criticism than most early-stage hobby/research prototypes. The simulation contains a general choice grammar, multi-faceted personality, traits versus observed beliefs, life-history memory, relationship bonds, structured explanations, projects, drama, social contact, households, family, mortality and long simulated histories. The scale track adds locality-aware indexes and a yearly coarse mode designed to keep a 100,000-person city affordable while simulating only people near the player's attention in full monthly detail.

Its most admirable property is **methodological honesty**: negative experiments are retained, thresholds are written down in advance, tests compare paired seed worlds, and the S11 twin experiment was explicitly reclassified from “pass” to **uninformative** when the acceptance metric was shown to be inadequate. Its hardest unanswered question is **external validity**: the engine demonstrates that its own observer can predict choices from its own generated evidence. This is not yet proof of realistic psychology or stories that improve a human reader's understanding.

**Assessment:** strong research prototype; meaningful scaling proof of concept; incomplete simulation of social depth and human interpretability; not a production-ready 100,000-person social world. “100,000 people exist in state” is supported; “100,000 richly simulated lives exist continuously” is not what this architecture implements.

**Subjective scores, conditional on these snapshots:** conceptual ambition 9/10; technical originality 8/10; experimental discipline 8/10; code correctness/reproducibility 6/10; maintainability 5/10; demonstrated human realism 3/10; scale architecture 7/10; production readiness 3/10. These are review judgments, not measured benchmarks, and should not be averaged into a single figure.

## What I actually verified

- Inspected two archives: 208 members in the lab source archive and 258 members in the city-scale archive. No unsafe tar symlinks, absolute paths or traversal entries appeared in the archive inventories.
- Compared the `src/` trees: 51 TypeScript modules in the base, 54 in the branch. The scale branch adds `coarse.ts`, `coarse-odds.ts` and `scale.ts` and modifies approximately twelve existing modules, with most business logic shared.
- Compiled **both** sets of TypeScript source successfully using an available system TypeScript compiler, emitting CommonJS JavaScript to temporary paths *outside* the source trees. This is not exactly the project's declared bundler build or the `npm test` workflow.
- Independently executed base `src/replay.ts`: **4,898 event signatures identical** across two repeated runs with identical world and run seeds. Test passed in this environment.
- Independently executed base `src/twoworlds.ts`: independent-world determinism check passed.
- Independently compared **one** 30-year town simulation (seed 1, no extra years after the 30-year founding history) in the base and scale branch, hashing every person, event, bond, belief and remaining world state using the branch's canonicalization strategy. All five hashes matched, and both had 125 total people and 4,498 events. This is strong evidence of backwards compatibility on that seed, **not** a blanket proof across all seeds or city sizes.
- Independently executed one **small** promotion-invariance check: 68 people were promoted from a background neighborhood. Health, illness, stress and savings deltas were all exactly zero. Promotion also changed status, friend sets, habits, circle, events, emotions, learned outcomes and last-habit timing, as designed. In the check's printed schema, some of these expected texture fields appear under `other`, even though the S10 documentation correctly treats them as allowable texture changes.
- Independently aggregated the four archived S11b twin-result JSON files (92–95, 100 twins). The pooled headline figures reproduce those in `SCALE.md` to rounding.
- Inspected the saved 100k run JSON records rather than relying on a README headline. These are **recorded previous runs**; I did not rebuild the 100k world myself.
- One attempted longer group escalation run did not produce a completed result within its allotted execution and was **not** counted as a pass or fail. A smaller city independence run had zero eligible background neighborhoods to compare, so it is **inconclusive**; the production S10 experiments used more neighborhoods.
- Did **not** run the exact repository `npm test` command, install project packages, run Playwright in a browser, independently verify 100k timing, conduct a real penetration test, or review current repository HEAD.

## 1. The system architecture — strengths

### 1.1 A choice grammar rather than disconnected random incidents

The choices are expressed as situations, response families and response expressions with weighted considerations. This is architecturally superior to hard-coded personality dialogue if the goal is a large generative population. `lab/src/grammar.ts`, `families.ts` and `decide.ts` create a consistent interface between what people are like, what circumstances apply and which response they select. Event records preserve considerations/causes. This structure allows a witness, the true actor and a hypothetical oracle to all evaluate the same decision without requiring unrelated mechanisms for each event type.

This is a meaningful design asset. The central grammar is also a coupling point: as the number of systems grows, it risks becoming a giant routing mechanism that is hard to extend safely. `grammar.ts` exceeds 70 KB; `life.ts` exceeds 72 KB in the lab and 82 KB in the scale branch.

### 1.2 Truth versus what someone could know

The world records objective state, while an observer holds beliefs derived from encounters, visible acts, testimony and imperfect manner judgments. `lab/src/world.ts` owns event and belief maps; `src/witness.ts`, `src/predict.ts` and `src/decide.ts` implement the epistemic layer. This separation is more interesting than simply giving NPCs hidden random personality values. It creates room for misinformation, surprises, justified prediction and explanation of mistakes.

The distinction is not merely cosmetic: the scoreboard has reader baselines, calibrated witness, page-evidence model, oracle and mind-reader, plus multiclass Brier/log-loss and confidence calibration. That is an unusually rigorous internal instrumentation set for a prototype.

### 1.3 History-dependent state, not just traits

There is genuine machinery for habits, activities, occupational skills, emotions, marks, stress, self-story, learned conditional reactions, bonds, rivals, families and long-term commitments. Not all of it is rich enough yet, but it means the author is attacking the correct conceptual problem: behavior requires state and experience, not just profile descriptors.

### 1.4 Seed stability and backwards compatibility

Separate RNG streams by subsystem (`lab/src/world.ts:173–175`) and hashed per-person/year randomness in coarse mode (`city-scale/branch/src/coarse.ts:38`) make experiments possible and reduce unintended re-randomization. The verified full-state small-town fingerprint match is particularly encouraging: scaling changes did not visibly scramble the legacy engine in the one independent comparison performed.

## 2. Scientific validity and what the prediction numbers do — and do not — say

### 2.1 The internal prediction effect is real in the stored logs

`lab/reports/board-r19c-on.txt` reports **10 synthetic worlds and 12,439 decisions**, with per-world confidence intervals. Across all choices, the base-rate model gets 65.9%, the last-observed-choice notebook 69.8%, the calibrated witness 72.3%, and the page-evidence reader 69.2%. In the preregistered “novel, contested, known” slice (22% of choices), the notebook gets 63.3%, the calibrated witness 68.3%, and page evidence 66.1%. The paired calibrated–notebook difference is **+4.9 ± 3.1 percentage points**, page–notebook **+2.8 ± 2.2**, across these worlds.

This supports a narrower claim: *inside the engine*, information about the modeled person improves prediction of choices the engine generated. It does **not** establish human plausibility, external psychology, or narrative memorability.

### 2.2 The chosen “reader” partly shares the generative theory

In `lab/src/predict.ts:121–151`, the prediction function receives the candidate `options` produced by the decision-generating system, then re-scores them with witness or truth views. The witness cannot simply read all of the actor's true traits, which is good. But it still lives within the same constructed ontology, categories, available options, scoring form and assumed links between considerations and choice. Held-out seed worlds are **new random examples drawn from the same generating theory**; they are not independent real human behavior.

That is fine if the objective is engine-internal consistency. It is insufficient if the project is claiming psychological realism. I would expressly label this “internal predictive validity.” A stronger test would use readers and situations not architecturally privileged to know the generator's option set and rules.

### 2.3 The “page” underperforms the best internal model

On all choices, the page-evidence reader (69.2%) is slightly **below** the notebook (69.8%); the paired difference −0.5 ± 1.3 is not a reliable improvement. For the report's “eventually witnessed” category, page 55.8% versus notebook 60.8% is a **−5.0 ± 2.1 point** paired difference. This classification means witnessed by the *end* of the run (`lab/src/board.ts:49–51`); it should not automatically be read as “directly witnessed at the time of the decision.” Still, it shows page evidence has meaningful failure modes.

The highest-confidence bins also show overconfidence: the calibrated model says 96% and is correct 91% in the 90–100% bucket; the page says 95% and is correct 88%. These are real calibration shortcomings, even if the broad ranking is useful.

### 2.4 The decisive missing validation is with people

`lab/STATUS.md` documents one skilled reader's Quiz II: 17/20 choices correct before reading the story page and 13/20 afterward. **One 20-question sitting cannot show that the page systematically harms understanding**, but it is a serious warning that the most visible product interface may create misleading stereotypes (“one vivid incident becomes someone's general character”). The team recognized this and paused further quizzes. That recognition is a strength; human interpretability remains the largest unproven claim.

### 2.5 Multiple rounds can overfit the laboratory itself

The project uses fresh ranges and paired intervals; that is good. However, when dozens of rounds repeatedly optimize synthetic metrics from one family of generators, a result can become highly adapted to the model's own testing culture. Preserve a genuinely locked final holdout protocol and, more importantly, an independent human-evaluation track. Synthetic worlds are plentiful but they are not independent scientific observations of humans.

## 3. Personality and narrative realism — incomplete

The most consequential qualitative limitation is the relative dominance of built-in traits. `city-scale/SCALE.md:480–500` reports an average change in choices of about **0.029** over 30 years of one person's lived history versus roughly **0.443** distance between different people on the twin-test battery. The document expressly observes that inborn traits determine almost all of a person's answers in this particular battery. The battery may miss life-specific choices; nevertheless, it is a strong sign that large amounts of simulated biography have a surprisingly small measured behavioral effect.

There is a circular narrative risk: the prose can contain many incidents, yet those incidents may not change the next choices enough to make a reader feel this person has learned, changed, broken, become kinder, or become guarded. The engine can build a *chronology* more easily than a *character arc*.

`lab/STATUS.md` also acknowledges that couples never fight in this version, divorce is low, 40% of adults older than 25 are single, `src/love.ts` is written but not wired, plans have weak downstream effects, the most social person has 22 friends in an 80-person town, and reputation, moral positions, family background and class are missing. These are not peripheral elements if the intended product is an emotionally convincing human simulation. Some can be staged for future work; together they limit claims of depth.

The especially important missing loop is **experience → changed relationship/self-understanding → subsequent consequential decision → consequences affecting another person**. The project implements pieces of this loop, but the reported self-criticisms show it is not yet robust across family, reputation, money, work and political/social conflict.

## 4. Scaling: real engineering achievement, but narrower than a living metropolis

### 4.1 What the architecture does

`city-scale/branch/src/scale.ts` creates neighborhood-local indices, staff lookups, resident scopes and short-history event access. `coarse.ts` keeps full-shaped `Person` objects in a separate background array and updates them annually using deterministic random draws and odds fitted on the detailed lab (`bench/fit.py`). A promotion brings a whole neighborhood into the detailed monthly simulation, then backfills routines, friend ties and interpersonal texture.

This is a sensible form of **level of detail (LOD) simulation**. It changes the relevant computational problem from “run every social interaction for every resident” to “run full interactions for a bounded focus set and only the coarse spine elsewhere.” The one-seed small-town hash match supports careful retro-compatibility. The internal 100k recorded runs substantiate a workable prototype on the author's benchmark host.

### 4.2 Recorded 100k metrics

`city-scale/results/s10/city100k.json` and `city100k-rerun.json` report seed 61, 30-year founding history, ~100,000 initial background residents, and ~240 people in focus for timed months. Recorded results:

| Metric | Original S10 | Rerun S10 |
|---|---:|---:|
| Build | 200.8 s | 202.9 s |
| Heap memory | 1,117 MB | 1,198 MB |
| Ordinary month | 225 ms | 316 ms |
| Coarse annual update | 6.389 s | 5.192 s |
| One neighborhood promotion | ~5.9 s | ~6.3 s |
| Recorded events | 353,505 | 353,505 |

These were **not independently re-timed in this audit**; host effects are material, as the project's own log acknowledges. The annual update, build and promotion are noticeable pauses, and a ~1.1–1.2 GB heap is not lightweight for a browser/game-client environment. There is no demonstrated UI responsiveness, storage strategy, restart recovery or long-term memory bound here.

### 4.3 “100k people” does not mean 100k equally detailed, interwoven lives

Most resident state is retained, but monthly friendship, gossip, rivalry and detailed situation-based decision processing are not run for the majority. The same generic workplaces and social scopes repeat by neighborhood. Partners and school interaction are mainly local. Citywide fame and reach are documented as **designed but not implemented** (`city-scale/docs/level-of-detail.md:~79–87`). In social terms this resembles many relatively isolated towns in a single population structure more than a fully interacting city.

That can absolutely be a legitimate choice for a game where players only observe a few people. It would become a problem if citywide effects (job markets, movements, fame, crises, shortages, protest, reputation) are central to the experience.

### 4.4 Coarse people retain measurable but incomplete life experience

I independently recomputed the 100-twin S11b pooled results from `city-scale/results/s11b/twin-92.json` through `twin-95.json`:

| Difference from initial self on a fixed synthetic battery | Full life A | Different full life A2 | Background then promoted B |
|---|---:|---:|---:|
| Choice distribution shift | 0.0292 | 0.0293 | 0.0255 |
| Act/expression shift | 0.0524 | 0.0452 | 0.0455 |

For choices, B retained around **87% of the shift** shown by the average full-life twin: a measurable **13% reduction**. For acts, 0.93 of full-life shift did **not** meet the registered <0.90 prediction; differences among full lives were also sizeable. The main state gaps in the pooled data are 2.34 learned conditional signatures per full-life person versus 1.70 per background person, and self-story 2.22 versus 1.78; background stress approximately zero and differences in marks and social texture remain.

Crucially, `city-scale/branch/scale/twin.ts:26–52` uses a 16-case *synthetic situation battery*, not the engine's real event constructors. It is intentionally insensitive to several real-world influences: bonds, money, strain and some marks. Therefore this test is **partial evidence**, not proof of full psychological fidelity. The documentation's correction of the original insensitive twin metric (`SCALE.md:494–500`) is one of the project's strongest research behaviors.

### 4.5 Focus can grow without bound

`city-scale/docs/level-of-detail.md` explicitly states **demotion is not built**. Every promoted neighborhood stays detailed. Thus, although monthly cost is local to focus, a long-lived exploratory session can continually grow focus until the cost advantage erodes. Budgeting, demotion with exact state preservation, selective persistence, or focus eviction should be established before declaring the algorithm durable for very long campaigns.

## 5. Concrete code and test concerns

### Finding F1 — Annual background health uses future months (high confidence; correctness; high priority)

`city-scale/branch/src/life.ts:30–50` increments `w.t` month by month and invokes `coarseYear(w)` only when `w.t % 12 === 0`, at the **end** of each detailed year. But `city-scale/branch/src/coarse.ts:228–265` loops through twelve body months with `const t = w.t + m`, i.e. the twelve months *after* the year-end timestamp, while updating the state immediately. Illness stores `lastIll = {t,kind}` where `t` may be up to eleven months in the future, while events are stamped by `addEvent(w,...)` at `w.t` and death uses `p.diedAt = w.t` (`coarse.ts:269–272`). This creates a mismatch between the monthly ages/risks used for the update and the event times and state to which it is applied.

The code trace is direct and unambiguous; the **magnitude of downstream demographic bias has not been measured**. Suggested regression: seed controlled individuals near 16/65/105 age boundaries, compare risk and event timestamps across a 12-month update, and ensure `lastIll.t <= w.t` after an annual update unless deliberately representing a future scheduled diagnosis. Review whether the intended loop should span `w.t-11...w.t` or instead move coarse updating to the year-start boundary.

### Finding F2 — Background-test scripts do not reliably fail when child jobs fail (high confidence; reliability)

`lab/board.sh:10–11` runs paired `npx tsx ... & ... & wait` under `set -e`. POSIX-shell `wait` with **no operands** returns success after waiting, even if one of the background jobs failed; `set -e` does not protect it. `city-scale/bench/s10.sh` and `s11.sh` also launch parallel jobs followed by operandless `wait`, and have no `set -e` header. The scripts can emit “all done” after underlying errors or incomplete result files. This does **not** prove the published results are corrupt; it makes future failures hard to catch.

Capture both child PIDs, wait for each PID individually, aggregate nonzero statuses, validate expected file counts and abort a report on partial data. Use a real CI test entrypoint.

### Finding F3 — Diagnostic scripts often report rather than assert (high confidence; reliability)

`city-scale/branch/scale/invariance.ts:43–46` prints whether other background neighborhoods stayed identical but does not exit with a nonzero status on failure. `promoinv.ts` similarly prints changed fields and deltas rather than enforcing a whitelist and invariants. A small run with only two neighborhoods produced **zero comparators** yet still returned a normal JSON record. The published S10 tests at their intended large size *did* have eligible comparisons; this is a **harness hardening need**, not evidence their recorded result was wrong. The `promoinv` printed whitelist also omits expected `emotions`, `tried` and `lastHabit` from `TEXTURE`, so they appear under `other` even when documentation recognizes them as allowable texture.

Require `hoodsCompared > 0`, assert exact invariants in the test programs, and fail nonzero on unexpected field changes, overcapacity or identity mismatch.

### Finding F4 — Coarse time and outcome fidelity are validated mostly by marginals (high confidence; architecture)

Comparisons of under-20 proportion, retirement, partnered share, work status and drinking can pass while the identity of who suffered events, what those events mean, and how they influence future choices is badly wrong. A population of plausible-looking proportions is not necessarily a population of plausible histories. The S11b experiment helps, but its battery is narrow. Future tests should cover conditional transition curves, cross-person causal chains, relational histories, longitudinal cohort distributions and exact generated event situations.

### Finding F5 — Presentation evidence may mislead readers (high confidence as concern, medium for generalization)

In the archived human quiz, the reader's prediction became worse after seeing the page. The page-evidence model's overall and witnessed-slice performance also lagged notebook comparisons. Story visibility is therefore not merely polishing; it is part of the *science and gameplay problem*. Better content formatting should distinguish facts from hearsay, exceptions from typical traits, and recently changed behavior from personality baselines. Human studies must judge the full experience, not just mechanical page-evidence estimates.

### Finding F6 — Global mutable instrumentation and hidden configuration (medium; maintainability/test isolation)

The design mixes explicit `World` state with global switches/diagnostics (`OFF`, `obsTag`, `obsEvent`, `globalThis.SCALE_FOCUS`, `SCALE_PAST_SALT`, `SCALE_COARSE_STATS`) and a module-global population index version (`city-scale/branch/src/scale.ts:10–17`). This is convenient for experiments but increases cross-world coupling, hinders worker-thread or multi-simulation isolation, and weakens type safety. Global `POPVER` can invalidate an index belonging to another world unnecessarily. The independently passed world-interleaving test is reassuring, but it does not make global state a desirable long-term interface.

### Finding F7 — The tested snapshot is not a complete, turnkey reproducible publication (high confidence; reproducibility)

The scale README describes `bases/`, frozen `trees/`, and `out/` directories not supplied in this archive; its branch has a package manifest but no lockfile inside `branch/`. Some scripts reference these frozen trees. The submitted `results/` include many important JSON outputs, and the separately supplied lab archive contains its own lockfile, so substantial reproduction is possible with reconstruction. However, a new reviewer cannot simply run every documented command as written on this particular snapshot. Provide a frozen source commit ID, exact dependency lock, benchmark metadata, a read-only all-checks runner, and machine-readable evidence tying every claim to one output hash.

### Finding F8 — Security and deployment are largely unmeasured, not automatically bad

The code here primarily describes a local TypeScript simulation and generated browser pages, not a deployed multi-user service with authentication or remote database. That reduces several common attack surfaces. It does **not** establish secure deployment, privacy compliance, resource exhaustion safety or supply-chain health. The presence of `innerHTML` in a local renderer is not proof of exploitable cross-site scripting; output escaping and data provenance matter, and no confirmed exploit was established in this review. A security assessment depends on the intended integration and user input surface.

## 6. Engineering maintainability

The architecture's conceptual separation is better than its implementation boundaries. Large cross-domain files (`life.ts`, `grammar.ts`, `group.ts`, `time.ts`, `persona.ts`) hold many interdependent systems. Person and World are mutable records with numerous arrays, Maps, optional fields and event references (`lab/src/world.ts:72–175`). The scale code adds several `as any` properties rather than an explicitly typed `CityWorld` extension.

This is defensible during exploration, but it will slow iterative work, make changes harder to validate and obscure causal effects. To improve it without destroying the experiment's determinism:

1. Define typed world capabilities and state transitions for age/body, work, social, witnesses, relationships, economy and LOD boundaries.
2. Give invariants executable names (`all_partners_reciprocal`, `event_time_not_in_future`, `all_workplaces_under_cap`, `every_bg_neighborhood_independent`, `no_unresolved_person_reference`).
3. Replace global experiment switches with scoped run configuration injected into `World`, preserving existing seed stream names.
4. Separate authoritative historical events from derived narrative text; make snapshots serializable and schema-versioned.
5. Set resource budgets and incremental cleanup/eviction rules for histories, beliefs, bonds and promotion.
6. Automate regressions on fixed seed worlds **and** genuinely unseen holdout ranges.

## 7. What I would do next, in order

**Priority 0 — Confirm the primary success criterion.** Decide whether the goal is (a) narratively believable people, (b) a scalable emergent town/city world, or (c) a predictive psychology model. They overlap, but they cannot be validated by the same proxy. For a narrative experience, conduct a properly blinded reader study: multiple readers, repeated but balanced fictional situations, random assignment to page/notebook/no-info, preregistered prediction and recall outcomes, genuine confidence and calibration ratings, and qualitative reports of whether people feel unique and changed. Do not promote internal accuracy into human validation.

**Priority 1 — Fix demonstrable invariants.** Correct the annual background chronology; promote timestamp/date integrity and child-process exit checks to hard CI assertions. Validate paired benchmarks only when both sides produced complete, schema-valid outputs.

**Priority 1 — Make consequences materially affect later choices.** Relationships should include conflict, repair, jealousy, attachment and dissolution. Plans should change jobs, money, reputation, social networks, and the long-term behavior of beneficiaries and those harmed. Give people believable social origins. Measure longitudinal change, not only surface diversity.

**Priority 1 — Prove lived-life fidelity with a sensitive test.** Construct actual grammar situations with money, ties, recent wounds, partner histories and projects; then compare a promoted background person against two full-life twins and against their starting self. Measure directional losses, not differences divided by the between-person distance. Include the harmed/benefited counterpart to test causal chains.

**Priority 1 — Define a persistent city-level LOD budget.** Build demotion/eviction, deterministic catch-up and bounded state persistence, and prove that reactivating a person or neighborhood later does not invent contradictory history. Profile CPU, memory and garbage collection after 100 simulated years and after thousands of neighborhood promotions.

**Priority 2 — Demonstrate a city rather than only neighborhoods.** Add a restrained but explicit cross-neighborhood interaction graph for institutions, workforce, family, reputation, crisis and movement, with propagation limited by reach or distance. Benchmark not just speed, but whether inter-neighborhood consequences are observable and coherent.

**Priority 2 — Simplify maintainability and reproduction.** Split high-coupling modules around invariant-bearing state transitions, type the scale-world extensions, make test scripts produce nonzero exit codes, bundle frozen source lockfiles and clean up the snapshot's missing references. Keep the unusually strong research logs.

## Final perspective

What is here is much more than smoke and mirrors. It contains a coherent design, functioning determinism tests, a legitimate performance architecture and honest, useful failures. It also contains a danger common to simulation research: **becoming excellent at reproducing and predicting one's own constructed rules while never quite establishing whether an outside human experiences the result as a believable person.**

If the ambition is “a town where people have enough interior life for the player to understand, misunderstand and care about them,” that ambition is defensible and the engine has several promising primitives. The next milestone should not be a higher city population number or a larger collection of quirky prose. It should be a smaller, more demanding demonstration: a handful of people who remember consequential events, change over time, disagree for credible reasons and remain comprehensible to independent human readers — followed by proof the LOD system can preserve those properties when the world gets large.

**Integrity note:** All source-based findings reference the submitted snapshots; no source repository, archive or upstream branch was modified. This review is not a formal security certification, full production-readiness audit or independent rerun of every saved experiment.

---

## The lab's reading (18 October 2026)

Source: "The Lab — independent technical review", supplied by the owner, reviewing archives of round 19c and the city-scale track at S11b. Main is now at H25, about 25 rounds later. Each point below was checked against the current code where possible.

## Still true on the current code (checked)
- **F1, the background year uses future months.** `src/coarse.ts:231` on branch `scale-s11b-ref`: `const t = w.t + m` runs the twelve months after the year-end timestamp, while events are stamped at `w.t`. The S12 port has not brought `coarse.ts` to main yet, so the port will carry it unless it is fixed on the way.
- **F2, the scoreboard script cannot see a failed half.** `board.sh` lines 10–11 on main (and on `round/25d`) run two jobs with `&` and an operandless `wait` under `set -e`; a crashed half returns success and the report reads partial data.
- **F3, the scale checks print instead of failing.** `scale/invariance.ts` records `hoodsCompared` but sets no exit code; no scale check fails a run.
- **The readers share the generator (2.2).** Now measured: about a third of the witness's lead over the character-blind learner depends on readers knowing the engine's exact model; two thirds survives a bent generator.
- **The page underperforms and strong predictions are overconfident (2.3, F5).** Still known weaknesses 9 and 10 in STATUS.md.
- **No human validation (2.4) and the risk of overfitting the lab's own testing culture (2.5).** Still true: both quizzes hold one tester's answers; about 55 rounds in 38 hours.
- **The city is many copies of the town, and the focus never shrinks (4.3, 4.5).** Still true: no cross-neighbourhood institutions and no demotion.
- **Global mutable state (F6).** Still true: `OFF`, `obsEvent`, `channel`, diagnostic logs at module level.
- **Priority 0: decide the primary success criterion** (narratively believable people, a scalable world, or a predictive psychology model; each needs its own validation). The lab has a seven-point exit criterion for the model, but no decision on what the model is for. This is the review's most important point.

## Fixed or changed since 19c
- Couples fight, repair, drift and divorce (rounds 20–20c; `love.ts` is wired); divorce runs at 1.05% of marriages a year.
- Reproducibility (F7) improved: one git repository with CI, tagged releases carrying raw outputs, a seed ledger checked in CI. But the scale scripts on main import modules that do not exist on main, and CI does not type-check `scale/`.
- Still unchanged: the friendship tail (the most-befriended adult has 19–23 friends in a town of 80).

## Where the review's reading should be qualified
- **"Life barely changes choices" (section 3: 0.029 shift over 30 years against 0.443 between people).** The review treats this as a flaw. The psychology notes say traits do move little after life events (about 0.05 SD on average; Haehner et al. 2025; Bühler et al. 2024), and that events mostly change goals, ties, money and life satisfaction. So the fix is not to make traits swing more. It is to make experience change what people want, whom they see, what they can afford and how they tell their own story, and to make those things feed later decisions. That matches the lab's own criterion 2, and the 16-situation twin battery cannot see it because it leaves out bonds, money and wounds.
- The security section (F8) is not relevant while the engine is a local simulation.
