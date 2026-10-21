# Understory bffdb33 — Independent Review
**21 October 2026 · Review packet `understory-review-2026-10-21.zip` · Source `source-bffdb33.tar.gz` · Read-only**

## Executive assessment

**This is the strongest substantive default-engine update in the recent sequence of reviews, but the headline “variety causes better reading” is stronger than the evidence warrants.** Round 40 retained four interacting mechanisms (occasion-born wants, additional contests, aftermath choices, and told accounts); Round 41 retained fidelity and wording corrections. The engine is no longer unchanged after each experiment. Its archived reports and my spot checks indicate that these mechanisms really do alter the simulated histories and that the four-mechanism bundle improved AI assessments of **selected high-activity lives**. Improvement for *random people*, human believability, gameplay, physical world integration, and long-run city fidelity remain unproven.

The experimental culture is a strength: preregistration, frozen switches, held-out worlds, pairings, independent re-derivation, and rejection of attractive failures. It also risks becoming better at passing its own reading instrument than at generating convincing people. The blind panel comprises **three roles played by one AI model**, not three independent human readers, and its capped error reporting is saturated.

I independently verified basic engine reproducibility and selected diagnostic results. I also reproduced two previously known provenance/integrity gaps and one additional front-door limitation. I did **not** independently reproduce the full 20-world batteries or complete `npm test`. Findings below distinguish packet claims, independent calculations, source inspection and artificial reproductions.

## 1. What's actually new

### Rounds 34–38: attempts and learning

- **Round 34 — aftermath of a blow:** increased measured life changes by about 17 percentage points over the archived sample, but the new acts did not improve the paired reading and could look like unconvincing routines. Rejected individually.
- **Round 35–36:** some registrations were withdrawn before a full test; mechanisms and diagnostics were refined on throwaway worlds. The attention shifted from adding a single event to creating distinct types of developments in a life.
- **Round 37 — revised aftermath:** did not meet its stand-alone reading condition, despite some better examples. Not retained alone.
- **Round 38 — out-of-season contests:** withdrawn after sizing showed that its proposed doubling of contests was unrealistic; some competition shifted in time instead of being added.
- **Method M34:** introduced an order-adjusted score and 24 paired lives in place of 12. This was a real improvement: earlier evaluations showed a sizable tendency to favor the second version.

### Round 39 and the Round 40 retest

Round 39 combined four previously unsuccessful or underpowered interventions. It missed its preregistered +1.0 *kinds per life* floor at +0.99, despite a stronger reading of the busiest lives. It was rejected.

Round 40 revisited the bundle after correcting documented wording/cause problems. It was tested on **fresh worlds under a new registration**, and the project committed not to repeat the same bundled test indefinitely. The default engine now includes:

1. **Occasions:** new wants can arise from events, such as a colleague's purchase or promotion, a band encounter, a loss, a wedding, or a life stage.
2. **Contests:** more rivalry around scarce positions, including places in bands.
3. **Aftermath:** some blows provoke persistent changes in routine, work, or social participation.
4. **Telling:** some accounts of witnessed events travel through ties and influence beliefs or choices.

Archived Round 40 data: kinds of event per adult **25.30 vs 23.09**, paired difference **+2.22 ±1.08** (reported 95% interval); selected busiest lives scored **+0.514** with a one-sided 90% lower bound **+0.232**; randomly selected adults scored **+0.222**, lower bound **−0.068**. Readers thus preferred the new busiest histories but a gain across the broader population was not established. The reported percentage of adults pursuing something rose **46% → 54%**; the percentage changing their life within three years after a blow rose **52% → 70%**. These are project-reported figures from archived batteries, **not independently rerun here**.

### Round 41: historical expression and fidelity

Round 41 corrected time spans, improper references to babies and jobs, repeated-event wording, and explanations for the end of friendships. The packet's category-based diagnostic reports **5 counted faults versus 2,804** with `OFF=fit` across 20 worlds, and Round 41 was retained. I separately ran the diagnostic on **two additional seeds for five years**: **0 counted faults with `fit`, 124 without**. This independently supports improvement on those *defined patterns*, not universal factual fidelity.

The Round 41 blind panel awarded **215 vs 215** fault citations to the busiest pages, and **214 vs 201** to random adults. The reading prompt allowed only **up to three faults per page**, and 275 of 288 versions received exactly three. The fault count therefore has essentially no headroom to detect improvement. The reports acknowledge this. Human-like problems—especially explanations that do not fit an act—remain conspicuous.

## 2. Independent checks performed

I inspected `REVIEW-BRIEF.md`, `SUMMARY.md`, the methods and round board, selected reports, the actual TypeScript source, and the archived paired score tables. I extracted the source and **transpiled it to JavaScript using a local TypeScript compiler**. This permitted execution without a complete dependency install, but is **not** TypeScript validation.

| Check | Independent result | Scope |
|---|---|---|
| Deterministic replay | **Pass** — 8,205 matching events | `src/tools/replay.ts`; same seed/run |
| Boundary vs direct simulation | **Pass** — 2,488 events | `src/tools/boundarytest.ts`; 24 months after a 10-year past |
| Interleaved world isolation | **Pass** | `src/tools/twoworlds.ts` |
| Signature self-test | **Pass** | `src/tools/sigtest.ts`, subject to exclusions described below |
| Group constructed and generated cases | **Pass** | `src/tools/grouptest.ts` |
| Math approximation tests | **Pass** | `src/tools/mathtest.ts` |
| Invariant test | **Pass** | `src/tools/invariants.ts` |
| Coherence audit | **Pass** — zero in all 12 tested categories | Two sampled worlds |
| Demographic diagnostic | **Pass** | Three worlds, eight years; limited coverage |
| Round 41 wording faults | **0 vs 124** | Two new seeds, five years, `fit` on/off |
| Round 39–41 paired-score regressions | **Matched** | Recomputed from each report's 24-pair table |
| `props.ts` / full `npm test` / compiler type check | **Not independently completed** | `fast-check` and Node types unavailable in runnable dependency install |
| 20-world batteries, city-scale fidelity, human play sessions | **Not rerun / not supplied** | Use archived project claims, not independent verification |

### Recalculated reading statistics

Recomputed from the printed 24-pair tables using the mean of three scores in each pair and a regression of `(score_on - score_off) ~ 1 + side`, where `side` codes which version was read second. Confidence bounds use the report's t-distribution rule.

| Round | Selection | Order-adjusted score difference | One-sided 90% lower bound |
|---|---|---:|---:|
| 39 | Busiest | +0.375 | +0.186 |
| 39 | Random | +0.333 | +0.020 |
| 40 | Busiest | **+0.514** | **+0.232** |
| 40 | Random | +0.222 | −0.068 |
| 41 | Busiest | +0.292 | +0.041 |
| 41 | Random | +0.319 | −0.003 |

These agree with the reports to rounding. **Round 41's “better” classification for busiest lives uses the less conservative, predeclared one-sided 90% criterion**; its ordinary two-sided 95% interval overlaps zero. Its direct score gain is weak evidence, not a robust human preference.

## 3. Substantive criticism of the inference

### A. “Variety causes better reading” is not isolated

The bundle **causally changes the population of histories** and likely improves the assessed quality of the busiest ones. That much is defensible. But four changes simultaneously affect the number of lines, kinds of lines, personal stakes, conflict, memory, callbacks and opportunities. The reports show longer histories are often preferred. Their regressions that add `kinds` or `lines` as covariates make the residual difference smaller—but **conditioning on a post-treatment variable is not a randomized test of the variable's independent causal effect**.

A careful statement is: *The bundle increases measured variety and, in these AI readings, improves selected busy-life pages. The explanatory contribution of variety versus length, stakes, or selection is unresolved.*

A useful future study could compare **length-matched presentations of the same history**, and separately compare **event-kind diversity while holding the amount of text approximately fixed**. This can be done as a presentation experiment without immediately changing the simulation.

### B. The panel is one language model in three roles

The novelist, social worker and player roles may provide varied viewpoints, but the judgments are correlated and share the same model's knowledge and biases. Krippendorff's alpha measures agreement across these outputs, **not independent replication**. Higher alpha is not external validation. The high frequency of three capped fault quotes per version suggests the instrument's behavior is strongly affected by the prompt.

The next human experiment is not a ceremonial milestone; it is a **measurement calibration**. It should check whether real players/readers share the model's preferences, interpret reasons similarly, recall who people are, and care about future choices. Random and selected lives should both be included without redefining the simulation's random-life target.

### C. The R39 → R40 retest is defensible but adaptive

Round 39 formally failed a +1.0 floor at **+0.99**. Round 40 corrected fault patterns and committed to fresh preregistration, new seeds, and no third identical attempt. Those safeguards matter. This is **not evidence of misconduct**, and the +2.22 observed in Round 40 exceeds the earlier floor as well.

But the decision to try a revised bundle arose **after seeing favorable Round 39 reading results**. The research path is adaptive. The strongest claims should recognize that selection, rather than treating Round 39 and Round 40 as two entirely independent confirmations of a pre-specified hypothesis. A new model, a human panel, or a truly external held-out challenge would be more convincing.

### D. The aggregate improvements have visible costs

The Round 40 packet reports that top-reason honesty fell **75% → 70%**. It also reports that the witness guesses only about half of the newly added aftermath decisions correctly. The named witness gate remained inside the preregistered ±2-point equivalence region, but that does not establish that every decision type or explanatory mechanism remains as trustworthy as before.

This could be an acceptable trade-off—more novel decisions may be harder to predict. However, the stated ambition is *surprise for reasons recognized afterward*. That requires reliable post-hoc reasons. The increased fraction of explanations that do not seem to fit the action is a potential central weakness, not peripheral copy polish.

The six-world demographic spot check in the packet sits near its lower acceptable birth/death ratio, while larger fresh-world samples vary significantly. The old city-scale issue (too few children and sparse coarse personal histories) remains explicitly unresolved. Do not infer city readiness from town passing tests.

## 4. Independently reproduced implementation risks

These are direct reproductions on the supplied `bffdb33` source, not just speculative comments. The first two overlap earlier outside reviews; the latter two particularly affect game integration.

### Finding 1 — Hearsay explanations can attach to an unrelated event (important; unresolved)

**Source:** `src/telling.ts` (`pickCounterpart`/`citeFlip` near end), `src/world.ts` (`addEvent`).

When hearsay changes a chosen counterpart, the pending explanation is stored under a `chooser|chosen` key with a month. `addEvent` searches an event's participant pairs for that key, **without checking which action generated the decision**.

I reproduced the following in the current code by injecting a pending account flip and adding an arbitrary, unrelated `unrelated:meeting` event for the same pair in the same month. That event acquired a `belief` cause about the flipped selection. This is an **adversarial unit-level reproduction**, not a measurement of how often it occurs in ordinary worlds.

For Understory/Overstory, the consequence is an explanation that can be plausible but falsely attributed. Proposed design: carry a unique action/decision token into the exact event produced, and consume the cause only on a matching token; test collisions among multiple actions involving a pair in the same month.

### Finding 2 — The signature does not cover each person's event index (lower priority but real)

**Source:** `src/tools/diag/signature.ts`.

The signature explicitly omits `Person.events`, treating it as derived state. I appended an impossible event ID to one person's list and observed **no signature change**. The `sigtest` self-test passes because it checks an added generic world map, not this excluded field.

Since person-event lists are used for reading and causal retrieval, either regenerate them from canonical `world.events`, explicitly test their integrity, or make the signature sensitive to index corruption. This was already noted in previous review history; it is **not newly introduced here**.

### Finding 3 — The `WorldHandle` is type-opaque, not runtime-opaque (integration boundary)

**Source:** `src/boundary.ts`.

`createWorld` returns the actual mutable `World` object cast to a type-level `WorldHandle`. The exported query functions return safe plain-data copies; that part works. However, ordinary JavaScript can inspect the handle's `people` array and mutate it directly. I reproduced that changing `handle.people[...].first` immediately changed what `boundary.person(handle, id)` returned.

For trusted internal TypeScript usage this is an accepted convention; **it is not an isolation/security boundary**. If a plugin, mod, script runtime, or Overstory-side integration is expected to be unable to mutate the engine, use an actual registry-managed opaque token, closure-owned world, or process boundary. Current `command` also supports only time advancement, not validated gameplay actions.

### Finding 4 — Fractional advance commands are silently rounded upward

**Source:** `src/boundary.ts`.

`command(handle,{kind:'advance',months:0.5})` calls `tick` once, advancing **a full month**. I reproduced the jump `t=0 → t=1`. Negative or invalid values can exhibit other unintended semantics. Validate finite, non-negative integer month counts, or document/implement explicit fractional-time behavior. This was also detectable in earlier snapshots and is not evidence of a new Round 40 regression.

### Finding 5 — Round 41 “wording” changes also change history

**Source:** `src/love.ts` (`notePattern`, round-41 `fit()` guard); other `fit()` conditions in `src/group.ts`, `src/social.ts`, `src/steer.ts`.

For example, when `fit()` is enabled, `notePattern` **suppresses a `couple:pattern` event** if recent rows contradict the purported pattern of avoiding topics. That is arguably a correct world-state fix: an inaccurate event shouldn't exist. But it is not just changing a sentence. The event would have been broadcast and could have influenced later memory/behavior.

I independently compared three worlds over five present years, same seeds, `fit` on versus `OFF=fit`. **Event types, participants, and choices** diverged, not merely text:
- Seed 1001: 2,889 versus 2,803 events; first nontextual divergence in month 19.
- Seed 1002: 3,380 versus 3,374 events; first divergence in month 33.
- Seed 1003: 3,181 versus 3,153 events; first divergence in month 26.

These differences are not *in themselves* bugs, but the research framing should distinguish corrections to event occurrence from presentation-only fixes. Where preserving engine behavior is intended, compare underlying decisions and world state independently of prose.

## 5. A cross-game / Overstory reading

The new mechanisms are relevant to the wider shared-world ambition:

- **Occasion-born goals** can support music, sport, business, journalism and open-world lives without assigning people fixed professional roles. The open question is whether those goals develop through plausible opportunity and sustained work, not simply whether more goals are opened.
- **Competition for scarce opportunities** is valuable for band places, hiring, promotion, scholarships, contracts and other domain mechanics. Each game still needs its own deep resolution system.
- **Aftermath** provides durable state changes after significant experiences. To matter in gameplay, players should be able to recognize the earlier event and its consequences without being shown omniscient explanations.
- **Telling and subjective knowledge** remain promising for management, journalism, investigation and relationships. They require *action-specific provenance* if explanations and rumors are to become evidence.
- **A clear reading of histories** is valuable even if it is implemented outside the core simulation. A selector, timeline, investigative interface or conversation system may all draw from the same truth record.

The current public boundary remains a *simulation-inspection API*: create, advance, inspect. It does not yet expose validated game commands (invite, offer, negotiate, select a team, submit evidence) or a scene-level time representation. Those are material integration questions, not reasons to collapse Understory and Overstory into one project.

There is **no new Overstory source in this packet**. These implications are architectural analysis, not a verification of a live integration.

## 6. Recommendations and open research questions

1. **Calibrate the reader instrument against people sooner rather than later.** The first human study should verify preference *and* what participants actually understand about past events, intentions and choices. One AI model in three roles is useful for development, not sufficient validation.
2. **Repair the uncapped-fault instrument before using fault totals as a success metric.** Record faults per 10 lines, severity, duplicated observations, whether a quote is factually false versus merely stylistically awkward, and whether the cited source supports the reason.
3. **Fix action-specific causal provenance** before building detective, journalism or deep band negotiations on hearsay-driven decisions.
4. **Separate behavioral outcomes from presentation outcomes** in Round 41-style experiments, because `fit` currently changes actual events.
5. **Test the varied-life finding with controlled presentation experiments.** Avoid concluding that “variety itself” is causally established from multi-mechanism bundles and post-treatment regressions.
6. **Make difficult new actions intelligible in retrospect**, not automatically predictable at the time. A staged witness assessment (before event, immediately after, after interviewing/revealing sources) would be particularly informative.
7. **Continue measuring the quiet majority and city coarse/focused fidelity.** Selected busy lives may make a compelling game experience, but random lives remain an important foundational test.
8. **Design future boundary ownership explicitly** when Understory accepts game actions: engine authority, domain authority, spatial facts, event IDs/cursors, replay/saves, allowed time resolution, and runtime isolation where required.

These are research and architectural suggestions, **not a command to change the project's current priority list**. A game-specific system may deserve its own full complexity rather than being squeezed into generic social machinery.

## 7. Overall verdict

**Clear progress, with moderate rather than conclusive evidence of better lived histories.** The default engine now includes several substantive interacting social mechanisms. The project has earned credit for controlled testing and for acknowledging its failure modes. The Round 40 result for selected busy lives is worth following.

The evidential limits remain significant: a single-model synthetic reader panel, a measurement instrument that saturates its fault cap, selected-page effects, uncertain mediation by “variety,” a lower fraction of causal explanations that pass its own honesty check, unverified city fidelity, and no broad independent human validation.

For the larger Understory + Overstory idea, the strongest contribution is **more opportunities for people to pursue goals, compete, react and share interpretations**—all useful raw materials for multiple games. The next level of proof is not another bundle that makes pages longer; it is showing that players can **understand, investigate, influence and remember** the causes of interesting developments in a world whose rules stay consistent.

### Audit limits

I used the uploaded source tarball, not a live checkout of the current repository. No source changes were made. The provided packet includes summary and reading tables but not every raw 20-world output needed to independently reproduce the archived batteries. Code execution used source transpilation, not a full successful dependency install and TypeScript check; `props.ts` could not execute due to missing `fast-check`. All claimed Round 40/41 battery-wide improvements are explicitly attributed to the project's reports; direct reproductions and direct statistics checks are identified above.

**Reviewer:** Independent ChatGPT assessment; not affiliated with the engine's own re-derivation reports.
