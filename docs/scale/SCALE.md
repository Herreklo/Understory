# City scale track: log

Base: round 19c archive (17 Oct 2026). Machine: 2 cores, 7 GB. Node with tsx.

## S0 — what grows faster than the town (pre-registered 17 Oct 2026, 19:40 Oslo)

**Question.** How does the time per simulated month grow with population, system by system, and which loops make it grow faster than linearly?

**Method.** `bench/run-s0.sh`. Worlds of 46, 184, 613 and 1,840 founding adults (about 75, 300, 1,000 and 3,000 people), with the setting's workplaces copied in proportion (k = adults ÷ 46 copies of each place). Each world has a five-year past at every size, so the curve compares like with like. Then twelve present months are timed. A system's time runs from the moment `tick()` switches to its random stream to the next switch, so the engine is not edited. Three seeds at the two small sizes, two at the large ones. Runs go one at a time. A thirty-year past at the two small sizes checks whether past length changes the curve. A CPU profile at about 1,000 people gives the cost by function.

**Expected** (from a first, contended run on round 15, and from reading the code):
1. Total time per month grows with an exponent between 1.3 and 1.8 in population.
2. The social tick is more than half the time at every size, and grows fastest.
3. The loops responsible:
   - company sought from every adult in town;
   - the family scan over every pair;
   - school pairs over every child (new in round 19);
   - workplace and public lookups that scan the town once per place;
   - public news heard by everyone;
   - gossip re-reading the whole event history.
4. Beliefs held (memory) grow faster than population.

**What would change our minds.** An exponent near 1, or most of the time outside the social tick, would mean the problem lies elsewhere, and S2 would target that instead.

**Not measured.** Browser speed (the game may run there), and memory over decades. Each run measures one year of the present. Populations change during a run (the town's migration rule targets 42 adults, so large worlds shrink slowly), so time is reported against the people alive at the time.

## S2 — the social layer at scale (pre-registered 17 Oct 2026, 20:50 Oslo, after the branch was written and before its timed runs)

**Question.** If people meet through bounded settings, does the time per month grow roughly linearly while a town stays exactly the town?

**Change** (branch-r19, full list in docs/branch-changes.md).
- A city is split into neighbourhoods of about 80 people, fixed when it is built. A town under about 120 people is a single neighbourhood.
- Contact, company sought, school, hobbies, routines and public service all happen within a person's own settings.
- Workplace lookups use staff lists, not scans of the town.
- Public and local news reach the neighbourhoods of the people involved.
- Reactions to someone (a collection, an old wound, a show) come from the people around them.
- Recent history is read from the end of the record.
- No code creates a bond with a stranger just by looking at them.
- A one-neighbourhood town takes every one of these paths with exactly the engine's arithmetic and dice.

**Expected.**
1. Identity: on town-sized worlds, the branch's whole run matches the engine's. That means every event, who knew it, every bond and every belief, by hash, over a thirty-year past and ten present years, on every seed tried.
2. Time per month from about 300 to 3,000 people grows with an exponent of at most 1.15. The social tick's exponent is at most 1.1.
3. At 3,000 people the branch is at least 10 times faster per month than the engine.
4. Social life per person in a city stays the size of a town's:
   - friends per adult, the friendless share, and people known well per person all lie within 25% of the town's values;
   - contacts per person per month lie within 30% of the town's.

**What would change our minds.** An identity mismatch means a path is not equivalent and must be found before any number counts. A superlinear exponent means a loop over the town is left: the profile will name it.

## S3 — coarse pass and promotion (pre-registered 17 Oct 2026, 20:55 Oslo, before the test runs; tuned once on seed 1 of a 300-adult city, which is excluded)

**Method.**
- **The coarse pass.** Yearly odds for twelve outcomes, fitted to 30 full towns × 20 years (bench/fit.py), checked on held-out towns. The outcomes are death, leaving, partnering, separation, a child, getting, losing or changing work, promotion, retirement, illness, and starting or stopping drinking. Savings drift is a linear model.
- **The test worlds.** Cities of about 1,500 people (920 founding adults). The first half of the neighbourhoods is simulated monthly from year 0, the other half by the coarse pass. Seeds 2 to 6, thirty-year past, two present years.

**Expected.**
1. **Coarse matches full**, at the start of the present: under-20 share, over-65 share, partnered share of adults, working share of 20–64-year-olds, drinkers, and kids of 40–54-year-olds. The background half lies within 5 points (shares) or 25% (counts) of the monthly half, averaged over seeds.
2. **Promoted people are indistinguishable.** Two background neighbourhoods are promoted at the start of the present, then compared with people always in focus. Right after catch-up and two years later:
   - friends per adult within 25%;
   - friendless share within 5 points;
   - people known well within 25%;
   - routines within 15%;
   - partnered within 7 points.
3. **Expected to fail, and recorded as the cost:** marks from history. These are sore spots, fears and rules among those over 40. Most marks come from small public slights the coarse pass does not have, so promoted people will carry fewer of them.
4. **Cost:** promoting a neighbourhood takes under 15 seconds.

### S3 result (seeds 2–6, cities of 1,376–1,649 people)

1. **Coarse matches full:** 5 of 6 pass.
   - Under-20 share: 18.4% against 21.6%.
   - Over-65 share: 25.3% against 27.2%.
   - Partnered: 68.9% against 67.3%.
   - Drinkers: 4.8% against 2.5%.
   - Children of 40–54-year-olds: 1.22 against 1.40.
   - **Working share fails:** 74.0% against 85.7%. The full towns the odds came from have 87%.
   - Why, looked at after the result: the town's newcomers arrive for a job (`newcomer` gives them one), while the coarse arrivals came without one, so the background held a pool of jobless arrivals.
2. **Promoted people:**
   - Right after catch-up: friends 4.72 against 4.45, friendless 16.1% against 14.3%, routines 2.62 against 2.80, partnered 68.3% against 67.3%. All pass.
   - **People known well fails:** 19.2 against 25.7, 25.3% lower against a 25% bar.
   - Two years later all five pass, known well included (20.5 against 26.4).
   - Why known well is short, looked at after the result: catch-up ran five of the monthly tick's seven setting channels. Hobbies and public service were missing.
3. **Marks from history:** 22% of promoted over-40s carry one, against 41% always in focus. This is the expected loss.
4. **Cost fails:** 22–26 s per neighbourhood against 15 s. Seeds 3–5 shared the machine with a second run. Cause: who-is-close was refreshed over every bond in the city once per catch-up month. It is now refreshed only for the people whose bonds moved, with identical results on the tuning city.

## S3b — the two fixes (pre-registered 17 Oct 2026, 21:40 Oslo, before their runs; exploratory, since the fixes follow from S3's failures)

**Change.** Coarse arrivals of working age come with a job, as the town's newcomers do. Catch-up runs the hobby and public-service channels too.

**Expected** (fresh seeds 7–9, same cities, same bars as S3):
- working share within 5 points;
- people known well right after promotion within 25%;
- every other S3 check still passing;
- promotion under 15 s per neighbourhood, run alone on the machine.

## S4 — a city of 100,000 (pre-registered 17 Oct 2026, 21:40 Oslo, before its runs)

**Method.** A town of about 300 people simulated monthly (184 founding adults) inside a background of 100,000 people. The background is founded as households shaped like the town's own founding households. Thirty-year past. Then twelve timed months, the promotion of one background neighbourhood, and six timed months after it.

**Expected.**
1. Building the city takes under 15 minutes.
2. A coarse year for 100,000 people costs under 10 s.
3. An ordinary month costs what the 300-person town costs alone, within 50%. The background adds nothing between year ends.
4. Memory stays under 3 GB.
5. After thirty years the background's under-20 share, over-65 share and partnered share lie within 5 points of the town's.

### S2 result (clean runs, one at a time)

1. **Identity:** pass on seeds 1–3, with seeds 4–10 running. Branch at town size: 35.3 ms a month, against 35.0 for the engine.
2. **Exponent fails:** total time per month from about 270 to 2,660 people grows at 1.30 in the branch, against 1.95 in the engine. Social grows at 1.20, against 1.93.
3. **Speed fails:** at about 2,640 people a month takes 2.24 s against 17.4 s, 7.8× faster against a bar of 10.
4. Memory at that size: 344 MB against 1,414 MB. Beliefs: 0.6 million against 2.4 million. Build: 1.8 min against 11.3 min.

Where the rest of the growth comes from, from profiles of the present months at 900 and 2,670 people. Cost per person rises 1.2×.
- The membership index is rebuilt after every change of job, at a cost that grows with the town each time.
- Every lookup builds a text key.
- A vacancy scores every job seeker in the city.
- Multi-neighbourhood news sorts its listeners.
- The in-engine witness scores every decision in the city (lab instrumentation).

## S2b — the index kept up to date, and bounded applicants (pre-registered 17 Oct 2026, 22:05 Oslo, before its runs)

**Change.**
- A change of job updates the index in place: staff lists and the jobless list stay in the engine's order.
- The index check compares numbers.
- In a city of several neighbourhoods, a vacancy hears from at most 24 of the city's job seekers, drawn at random. A one-neighbourhood town still hears from all of them.

**Expected:**
- identity still holds;
- the total exponent from 270 to 2,660 people is at most 1.15;
- at least 10× faster than the engine at about 2,640 people.

**S2b, amended at 22:40 Oslo before its final runs.** A first S2b run gave 1.19 and 9.4×. That run also had a fault, found afterwards: the index kept a one-neighbourhood view after neighbourhoods were set, so in that run circles were drawn city-wide, and in the test cities nothing was put in the background. Fixed: the index now checks the neighbourhood count. Three further changes went in before the rerun:
- new people are appended to the index, not rebuilt into it;
- lists are merged in id order, which is the engine's order, instead of sorted;
- leaving town looks for followers among the people around someone, not the whole town.

The bars are unchanged. The first run's numbers do not count.

### S2b result (frozen tree branch-r19-s2b, clean runs one at a time)

- **Identity:** pass, seeds 1–5, against the engine.
- **Town size:** 30.4 ms a month, against 35.0 for the engine.
- **Exponent fails:** total, 270 to 2,640 people, grows at **1.20**, against a bar of 1.15. Social grows at 1.18.
  - Per person, the branch does the same work at every size: about 8.3 contacts, 60 bonds and 225 beliefs at 270, 900 and 2,640 people.
  - The cost per person still rises about 1.3× over that range, through lookups in larger maps. Bonds and beliefs live in one map for the whole world. Keeping them per person would give each person's data locality. That is noted for the contract and not done here.
- **Speed: pass.** About 2,640 people take 1.70 s a month against 17.4 s, **10.2×** faster.

### S3b result (seeds 7–9; exploratory)

1. **Coarse matches full: 4 of 6 pass.**
   - Under-20 share: 18.5% against 20.8%.
   - Over-65 share: 24.1% against 25.7%.
   - Partnered: 64.7% against 67.9%.
   - Drinkers: 4.2% against 3.4%.
   - **Working share still fails:** 82.0% against 90.4%, closer than S3's 12-point gap.
   - **Children of 40–54-year-olds fails:** 1.03 against 1.52. With three seeds this is noisy (S3 passed it at 1.22 against 1.40). It is noted as unresolved.
2. **Promoted people: all five pass, right after catch-up and two years later.** Right after: friends 5.28 against 4.71, friendless 14.9% against 12.9%, known well 23.8 against 27.0, routines 2.68 against 2.78, partnered 65.1% against 67.9%.
3. **Marks from history:** 21% against 43%, the expected loss.
4. **Cost: pass.** 8.1–14.5 s per neighbourhood.

## S4 result — a city of 100,000 (frozen tree branch-r19-s4)

Between S3b and S4, the background was moved out of the monthly world's list of people, so nothing that runs each month walks past it. One side effect: town names are kept unique only within the monthly world, which also changes which names and draws people get in a city.

The city: **126,000 people** in the background and 408 in the monthly town, in 1,236 neighbourhoods, after a thirty-year past.

1. **Build: pass.** 153 s.
2. **A coarse year: pass.** 4.5 s for 126,000 people.
3. **Ordinary month: fail (corrected in S8; first recorded as a pass).** 226 ms for the 313 people the timed months ran for, or 0.72 ms per person, against 0.41 for a town of 270 alone (76% more). The first figure, 0.55 ms, divided by the 408 in focus after a promotion.
4. **Memory: pass.** 1,312 MB, with 386,000 events in the record.
5. **Demography: 2 of 3 pass.**
   - Over-65 share: 23.1% against 24.3%.
   - Partnered adults: 69.3% against 66.4%.
   - **Under-20 share fails by a hair:** 21.7% against 26.8%, a 5.1-point gap against a bar of 5.

Promoting one background neighbourhood of 90 people took 7.6 s. A month afterwards takes 361 ms.

## S5 — bonds and beliefs per person (17 Oct 2026, 23:15 Oslo; exploratory, stopped)

**Change.**
- People by id and each holder's beliefs are kept in arrays indexed by id.
- Each person keeps their own bond map, and the global map stays for walking in creation order.
- Identity holds.

**Result: no measurable gain.** At 270, 870 and 2,625 people, time per month is within noise of S4: 121 against 101 ms, 417 against 449 ms, and 1,706 against 1,723 ms.

**Where the remaining growth actually is**, from self-time profiles of the present at 870 and 2,625 people. Cost per person goes from 0.53 to 0.70 ms.
- The in-engine witness scores every decision in town, and walks its whole belief map to count what it knows about each subject: +0.031 ms per person. This is lab instrumentation, not the model.
- Garbage collection on a larger heap: +0.031 ms.
- Hiring takes a fresh copy of the town once per workplace: 320 copies a month at 2,625 people.

None of this is per-person storage. The change is not kept; the shipped branch stays at S4.

## S6 — wider identity, and the record of what the review found (17 Oct 2026, 23:55 Oslo)

**Identity, whole world.** `bench/identity2.ts` fingerprints everything a world holds after ten years: every field of every person, every event (causes, evidence, who knew it), every bond with its memories, every belief, and the groups, workplaces and counters. **Engine and branch match on all ten seeds (1–10)**, on all five hashes. The branch tree was being edited for S7 during that run; the check is rerun on the frozen tree at the end of S7.

**Doc corrections** (the fixed spine of a background life against texture made on demand; demotion not built; texture dice keyed per person) are made in the rewrite of level-of-detail.md that follows S7–S9.

## S7 — institutions (17–18 Oct 2026; smoke runs on throwaway seeds 11, 12 and 21–24 only)

**What changes.**
- Every neighbourhood has its own workplaces: one of each kind the setting has, with the kind's capacity, its own staff and its own leader. A town of one neighbourhood has exactly the setting's places (identity holds). No harness copies places by hand any more.
- Background work is demand-driven. Each year, each workplace with room takes the best-suited job seeker of its neighbourhood, and a workplace without a leader makes one of its staff leader (a 'promoted' event). The fitted gotJob, changedJob and promoted odds are no longer used. Arrivals come for a job with room in their neighbourhood. A person who moves in with a partner elsewhere leaves a job in the old neighbourhood.
- Promotion brings a neighbourhood's workplaces into the monthly world with their staff and leaders.

**Found on the way, by the smoke runs (not tuned on any test seed):**
1. **The background never aged in personality.** The engine's yearly maturing step (organisation, patience and forgiveness rising, anxiety falling, aptitudes moving with age, skill ceilings following) ran only over the monthly world. Fixed: the step is now one function, `mature()`, that the coarse pass calls for everyone alive in the background. Becoming a parent steadies background people by the town's rule. Identity holds (seed 1 rechecked).
2. **Fitted odds drift when the population they are applied to drifts.** Feature means of the background had moved up to 0.7 sd from the full engine's, mainly because of (1), and death at 65–79 came out at about half the engine's rate. So the background now lives the person-local rules **by the engine's own formulas, month by month through the year, on the person's own dice**: health, illness (with the engine's kinds and their follow-ups), retirement and death. Only what depends on other people (partnering, splitting, leaving, drinking, losing a job) is still drawn from fitted odds.
3. **Arrivals were not tied to jobs.** The background drew arrivals at the town's yearly rate per resident, whatever the work, so its neighbourhoods grew to 118–130 people against about 80, and the working share fell. In the town, the only way people arrive is a job nobody local can take (life.ts `newcomer`). The background now does the same: a workplace slot still open at the year's end, with nobody in the neighbourhood looking for work, is filled from outside within the year at about 0.7. That figure comes from the engine's monthly odds (0.35 × 0.3 a month once a vacancy is six months old). The newcomer is drawn by the town's rule, and a third of those 27 and over bring a family. The fitted arrival rate is no longer used.
4. **Strain never eased in the background.** It now rises with illness and eases month by month by the engine's rule. Strain that comes from other people (grief, loneliness, trouble at home) is not lived in the background.

With 3 and 4 on two throwaway cities of 1,300 people (seeds 23, 24), background death rates by age came out at the engine's rates (65–79: 1.8% and 2.1% against 1.9%; 80+: 10.2% and 10.8% against 9.0%), and partnering by age within about a point.

## S7 test (pre-registered 18 Oct 2026, 00:00 Oslo, before its runs; frozen tree branch-r19-s7)

**Method.** The S3 cities (920 founding adults, half the neighbourhoods monthly from year 0, half on the coarse pass, a thirty-year past, two present years, two neighbourhoods promoted at the start of the present), on fresh seeds 41–45, with `bench/city2.ts` (no places copied by hand). Then the S4 city of 100,000 with `bench/city100k2.ts`, seed 41. Then the whole-world identity check on seeds 1–10.

**Expected.**
1. **Capacity.** No workplace, monthly or background, has more staff than its capacity, at the start of the present or at the end. Every staffed background workplace has a leader. No background worker lives outside the neighbourhood of their workplace. All five seeds.
2. **Coarse matches full** on S3's six measures and bars (within 5 points, or 25% for kids of 40–54-year-olds), averaged over seeds. I expect working share to pass now. The weakest are under-20 share and kids of 40–54, which were 2–4 points and up to 30% off on the smoke runs.
3. **The engine's own rules hold in the background.** Background death rates at 65–79 and at 80+, pooled over seeds, lie within 25% of the full engine's (1.86% and 9.03% a year). Under 65 is reported only, since there are too few deaths.
4. **Promoted people are indistinguishable**, on S3's five bars, right after catch-up and two years later.
5. **Marks from history:** reported; still expected to fall short (S9's work).
6. **Cost.** Promotion under 15 s per neighbourhood. At 100,000: S4's five bars. The coarse year now lives the body month by month, so the expectation is that it still runs under 10 s.
7. **Identity:** engine and branch identical on all five hashes, seeds 1–10.

### S7 result (seeds 41–45, frozen tree branch-r19-s7; city of 100,000 on seed 41)

1. **Capacity: pass.** No workplace was over capacity in any of the ten checks. No background worker lives outside their workplace's neighbourhood. One staffed workplace had no leader at the start of the present on seed 45. The harness first counted it as a fault, but it was a monthly workplace: its leader had just left, and it names a new one at its next month. Seed 45 was rerun with the count split by tier and reproduced the same world. Staffed background workplaces without a leader: 0.
2. **Coarse matches full: all six pass**, for the first time (S3 passed 5 of 6, S3b 4 of 6). Monthly half against background half, mean over seeds:

   | Measure | Monthly half | Background half | Gap |
   |---|---|---|---|
   | Under-20 share | 20.1% | 18.4% | −1.7 pt |
   | Over-65 share | 27.5% | 28.9% | +1.4 pt |
   | Partnered | 69.1% | 69.3% | +0.2 pt |
   | Working | 82.2% | 84.9% | +2.7 pt |
   | Drinkers | 3.5% | 4.6% | +1.1 pt |
   | Kids of 40–54-year-olds | 1.29 | 1.40 | ratio 1.09 |

   Per seed, working still ranges from −4 to +10 points, because a neighbourhood's jobs are fixed while its working-age count is not.
3. **The engine's rules hold in the background: pass.** Deaths per person-year, pooled:
   - 65–79: 1.62% against the engine's 1.86% (ratio 0.87);
   - 80+: 9.93% against 9.03% (ratio 1.10);
   - under 65: 0.10% against 0.10% (reported only).
4. **Promoted people: 4 of 5 bars pass, both times.**
   - **Friends per adult fails:** 5.82 against 4.48 right after catch-up (+30%), and 5.81 against 4.41 two years later.
   - Friendless share passes: 10.8% against 14.8%, then 11.0% against 14.5%.
   - Known well passes: 23.5 against 26.6, then 24.1 against 26.7.
   - Routines pass: 2.66 against 2.79, then 2.51 against 2.81.
   - Partnered passes: 70.5% against 69.1%, then 72.0% against 68.5%.

   The likely cause is the institutions themselves. A promoted neighbourhood's workplaces are staffed only by its own residents, while monthly workplaces hired from across the city. So catch-up replays home, neighbourhood and work among the same people, and dense overlapping settings make friends faster. This is S8's to test; nothing was tuned on these seeds.
5. **Marks, the expected shortfall.** Marks per person over 40: 0.24 against 0.76 right after catch-up, then 0.35 against 0.77. Share with any mark: 22% against 46%, then 28% against 46%.
6. **Cost: pass.** Promotion takes 5.1–6.5 s per neighbourhood.

   City of 100,000 (1,237 neighbourhoods, 9,896 workplaces; 232 people in focus during the timed months, and 96,011 in the background and 309 in focus at the end, after a promotion), against S4's bars:

   | Check | Result | Bar | Outcome |
   |---|---|---|---|
   | Build | 146 s | 15 min | pass |
   | Coarse year | 4.2 s (body now lived month by month) | 10 s | pass |
   | Ordinary month | 172 ms for 232 people (0.74 ms per person, S4's town-alone reference 0.41) | within 50% | **fail, +81%** (corrected; see S8) |
   | Memory | 1,140 MB | 3 GB | pass |
   | Under-20 share | 18.3% against 15.5% | 5 points | pass |
   | Over-65 share | 33.5% against 35.3% | 5 points | pass |
   | Partnered | 68.5% against 63.1% | 5 points | **fail by 0.4 points** |

   The focus here is one small town of 232 people, so its own shares are noisy. Working share is 90% in the background against 79% in the town (reported). No workplace was over capacity.
7. **Identity: pass.** Engine and branch are identical on all five hashes, seeds 1–10, on the frozen tree.

## S8 — a background independent of the rest of the world, and one hiring rule for both tiers (S9 runs with it)

**What changes.**
- **Ids and names of their own.** A background neighbourhood draws the ids of the people born or arriving in it from a range of its own (1,000,000 + 20,000 per neighbourhood, below the bond-key limit of 2^26). It gives them first names that differ from its own residents' names. Before, ids came from one city-wide counter and names were checked against the monthly town, so a birth in focus changed who was born in the background.
- **Partners from the neighbourhood only.** The city-wide fallback is gone. In the smoke runs it was used for under 3% of matches.
- **All background draws are per person or per neighbourhood and year:** body, partners, work, newcomers and returns.
- **One hiring rule for both tiers.** In a city, a monthly workplace takes on people from its own neighbourhood first, as a background one does, and only then looks across the city. A venture opens in its founder's neighbourhood. A town of one neighbourhood is unaffected.

## S9 — background events that leave marks

**What changes.**
- **Background succession produces the town's own events** (life.ts `promote`): the promotion, the new leader's first staff meeting (froze or rose, by the same anxiety and boldness rule), and 'passed over' for the ambitious who lost out. Nobody in the background is known to have wanted the job, so ambition (valuing success at 0.6 or more) stands in for the wish.
- **Background events remember how widely they were seen.** They stay private in the record, so no monthly system reads news about strangers. A field `seen` holds the visibility the town gives that kind of event: deaths and promotions public, illness and staff meetings local. A mark reads `seen` where it exists (persona.ts, one expression). An event without it reads as before, so a town is unchanged.
- Illness in the background is the town's illness, with the engine's weight, so serious illness marks as it does in the town.

## S8 + S9 test (pre-registered 18 Oct 2026, 00:22 Oslo, before its runs; smoke runs on throwaway seeds 25 and 31 only; frozen tree branch-r19-s8)

**Method.** As S7: cities on fresh seeds 51–55 (`bench/city2.ts`), the city of 100,000 on seed 51, and identity on seeds 1–10. In addition, `bench/invariance.ts` on seeds 51–53 (300-adult cities, three present years). It builds two cities from one seed whose monthly worlds run on different dice from year 0, and promotes one background neighbourhood in only one of them. It then compares every other background neighbourhood: every field of every person and every event about them, with event ids replaced by their content.

**Expected.**
1. **Invariance: every compared background neighbourhood identical**, on all three seeds. As a check that the test can see a difference, the S7 tree run on seed 31 differs on both neighbourhoods compared. Family ties that cross into focus (a parent's death in town, an inheritance) are real couplings. If any neighbourhood differs, the cause is reported.
2. **Coarse matches full:** S3's six bars, mean over seeds. I expect all six to pass again; working share is the most at risk (one smoke seed was 12 points off).
3. **Engine rules in the background:** deaths at 65–79 and 80+ within 25% of the engine's.
4. **Promoted people: all five bars pass**, both times. Friends per adult are expected back within 25% under the shared hiring rule (the smoke seed gave 5.21 against 4.88). Known well right after catch-up is at risk (the smoke seed gave 19.9 against 27.3).
5. **Marks:** promoted marks per person over 40 rise from S7's 0.24 to at least 0.30 right after catch-up, still well short of focus. Below 0.30, S9 did not do what it was for.
6. **Cost:** promotion under 15 s per neighbourhood, and S4's bars at 100,000.
7. **Identity:** seeds 1–10 identical to the engine.

### S8 + S9 result (seeds 51–55, frozen tree branch-r19-s8; city of 100,000 on seed 51)

The numbers below were re-derived from the raw output by a separate agent that had not seen them. It agreed with every one, and found an error in S4 and S7 (item 6).

1. **Invariance: pass.** All five compared background neighbourhoods are identical (1, 2 and 2 on seeds 51–53; between 92 and 101 people each). The test is weaker than registered: see S8b.
2. **Coarse matches full: all six pass again.**

   | Measure | Monthly half | Background half | Gap |
   |---|---|---|---|
   | Under-20 share | 20.8% | 18.2% | −2.6 pt |
   | Over-65 share | 27.6% | 29.2% | +1.5 pt |
   | Partnered | 70.9% | 68.9% | −1.9 pt |
   | Working | 84.0% | 85.7% | +1.7 pt |
   | Drinkers | 3.0% | 4.7% | +1.7 pt |
   | Kids of 40–54-year-olds | 1.33 | 1.34 | ratio 1.01 |

   **Within the bars, per-seed noise is large:**
   - under-20 is −6.3 points on seed 51;
   - partnered is −8.5 and −6.7 points on seeds 51 and 52;
   - kids of 40–54 range from −43% to +53%;
   - drinkers pass the 5-point bar while the background has 1.55 times the monthly rate.
3. **The engine's rules hold: pass.** Deaths at 65–79 are 1.68% against 1.86% (ratio 0.90), and at 80+ 9.81% against 9.03% (1.09). The tally puts a death in the band of the age at death, while the engine's reference uses age at the start of the year. Corrected for that, the ratios are 0.94 and 1.06.
4. **Promoted people: all ten pass**, for the first time in a pre-registered run.

   | Measure | Right after catch-up (promoted / always) | Two years later |
   |---|---|---|
   | Friends per adult | 5.32 / 5.01, +6% | +6% |
   | Friendless | 9.9% / 11.0% | −2.9 pt |
   | Known well | 23.1 / 27.1, −15% | −13% |
   | Routines | 2.65 / 2.79, −5% | −9% |
   | Partnered | 69.5% / 70.9% | +2.2 pt |

   The shared hiring rule did what S7's diagnosis predicted for friends.
5. **Marks: pass.** Promoted marks per person over 40 are 0.35 right after catch-up, against S7's 0.24 and the bar of 0.30. They reach 0.46 two years later. Focus is at 0.71 and 0.72, so the gap halves but stays.
6. **Cost.**
   - Promotion: 5.0–5.9 s per neighbourhood, pass.
   - City of 100,000: build 138 s, coarse year 3.3 s, memory 1,124 MB, all pass.
   - Demography against the focus: under-20 17.5% against 21.6%, over-65 29.1% against 27.9%, partnered 66.8% against 70.4%, all pass.
   - **Ordinary month: fail.** It is 146 ms for the 222 people in focus during the timed months, 0.66 ms per person, +60% against 0.41.
7. **Identity: pass**, 10 of 10.
8. **Capacity: one fault.**
   - No workplace was over capacity, and no background worker lives elsewhere.
   - **One staffed background workplace had no leader** at the end, on seed 53. The cause is a real bug. Succession ran before the year's hiring, so a workplace that was empty at succession and then hired stayed leaderless for a year. Fixed after the run: succession now runs once hiring is done.

**Corrections found by the independent check.**
- **The month-cost bar in S4 and S7 was computed with the wrong denominator.** The harness divided the timed months by the people in focus at the end of the run, after a promotion and six more months, not by the people the months were run for.
  - S4 is 226 ms for 313 people, 0.72 ms per person, +76%: **fail, not pass.**
  - S7 is 0.74 ms, +81%: **fail.**
  - The harness now reports `inBefore` and `msPerPersonMonth`.
- **The bar itself compared unlike towns.** The 0.41 ms reference is a town with a five-year past, while the city runs a thirty-year past, and a longer past means more bonds, beliefs and record per person. So the same 240-person town (seed 51) was timed with a background of 1 person and of 100,000, three and two runs, alternating, one at a time:
  - alone: 0.87, 0.62 and 0.59 ms per person;
  - in the city: 0.88, 0.80 and 0.71 ms per person.

  By the medians, the background adds about 25% to an ordinary month, likely garbage collection on a heap of 1.2–1.7 GB against 0.15–0.2 GB. Run-to-run noise is of the same size, so this is an estimate, not a measurement.
- **The other methodological points were taken up in S8b** (the weak invariance test, the thin capacity check) or noted:
  - The death tally's age convention is above.
  - After the runs, the frozen S7 tree's harness was overwritten with a reporting-only change (the leaderless split), so the exact harness behind seeds 41–45 is not kept. The rerun of seed 45 reproduced the same world.

## S8b — the fixes, and a stronger independence test (pre-registered 18 Oct 2026, 01:10 Oslo, before its runs; exploratory, since the changes follow from S8; frozen tree branch-r19-s8b)

**What changes.**
- Background succession runs once the year's hiring is done.
- **The bonds a background person holds are put away with them** and come back on promotion. In the background no contact happens, so nothing should fade there. Until now, the monthly fading of every bond in the world also ran over background bonds. Those bonds were faded for thirty years in the background, and again in the catch-up that replays the same years. It also made every month walk over them. This affects cities founded whole and then split (`SCALE_FOCUS`), where background people have family bonds from the founding.

**Stronger tests.**
- `bench/invariance.ts`: the second city's monthly world now lives its thirty-year past on different dice from the founding (a test hook, `SCALE_PAST_SALT`), not only its present. The test also compares every bond and belief the neighbourhood's people hold, and every field of every event. A control reports that the focus did come out different.
- `bench/city2.ts`: the capacity check also requires each background leader to be alive, in the background, on that workplace's staff, and living in its neighbourhood.

**Expected.**
1. Invariance on fresh seeds 56–58: every compared background neighbourhood identical, and the focus different. The S7 tree, run with the same harness on seed 56 as a control, differs.
2. Capacity on fresh seeds 56–57 (the S7 cities): no over-capacity, no leaderless background workplace, no bad leader, no worker living elsewhere, at both checks.
3. On the same two seeds, coarse-matches-full and the promoted checks are within S3's bars on average. This is exploratory with two seeds, so the per-seed noise from S8 applies.
4. Identity, seeds 1–10.

### S8b result (seeds 56–58, frozen tree branch-r19-s8b)

1. **Invariance: pass.** All six compared background neighbourhoods are identical: every person, event, bond, belief and workplace. In each pair the focus came out different. The S7 tree, run with the same harness on seed 56, differs on both of its neighbourhoods (86 and 135 people), so the test sees a dependence when there is one.
2. **Capacity, strict: pass** at all four checks. There are no over-capacity workplaces, no leaderless or bad leaders in the background, and no workers living elsewhere.
3. **Coarse matches full: all six within the bars** on two seeds: under-20 −3.8 points, over-65 +0.9, partnered −4.4, working +3.7, drinkers +0.5, kids of 40–54 ratio 0.89. Deaths at 65–79 have ratio 0.89, and 80+ 1.12. Promoted people: all ten checks are within the bars. Marks per over-40 are 0.29 right after catch-up (0.35 in S8), then 0.44. With two seeds this is within S8's spread. Putting background bonds away does not touch marks.
4. **Identity: pass**, 10 of 10.

This is the shipped state of the branch.

## External review of S8b (18 Oct 2026, 79/100)

Two of its findings were checked against the code and a run before anything changed.
- **Promotion overwrote health with the healthy level for one's age.** This was a leftover from S3, when the background did not track health. It is real, and the only consequential field promotion overwrote.
- **The marks gap was broken down by source** (seeds 71–72, throwaway). Over-40s in focus carry 0.71 marks per person, and promoted over-40s 0.24 and 0.35.
  - About two thirds of the gap comes from kinds of event the background already has (illness, death, splits, homecoming, the first staff meeting, being passed over). The background records them with other weights and visibility than the town, and records no divorces, only splits.
  - The rest comes from small social moments the background never lives: being shown up, being let down, someone being there when it mattered, being found out.

Taken up: promotion must change nothing it should not (S10), and the review's twin test (S11). Not taken up: validating demography against a real country, which is the engine's question and against the lab's rule.

## S10 — promotion changes nothing it should not, and background events weigh what the town's do

**What changes.**
- Promotion no longer touches health. Everything a background person is stays as it was.
- **Background events carry the town's weight for their kind**, and the visibility the town gives it (`seen`): births, marriages, divorces, splits, leaving, homecoming, arrivals, hiring, retirement, sobriety, death, illness, promotion, being passed over, the first staff meeting.
- **A married background couple that separates divorces**, as in the town (weight 2.5), instead of "splitting up" (1.2).

**A new check, `bench/promoinv.ts`.** Every field of every person in each background neighbourhood is snapshotted just before promotion and compared just after, with no time passing. The fields promotion is meant to change are its texture:
- status;
- routines (and when the last one formed);
- the circle of neighbours;
- friends;
- the person's list of events, which grows with backstory;
- feelings and learned outcomes from the replayed years (`emotions`, `tried`);
- the promotion date;
- caches.

On the smoke seed (81) nothing else changed, and health, illness, strain and savings moved by exactly 0.

## S10 test (pre-registered 18 Oct 2026, 08:38 Oslo, before its runs; smoke on throwaway seeds 71, 72, 81; frozen tree branch-r19-s10)

**Expected.**
1. **Promotion invariance** on fresh seeds 82–84 (300-adult cities, every background neighbourhood promoted): no field outside the texture changes for anyone, and health, illness, strain and savings change by 0.
2. **Marks.** Promoted marks per over-40 right after catch-up are at least 0.38, pooled over seeds 61–65. S8 had 0.35; the smoke runs moved 0.24 to 0.29 and 0.35 to 0.42. Focus stays near 0.71, so the remaining gap is the background's missing social moments (S12).
3. **No regression** on seeds 61–65:
   - coarse matches full on all six checks;
   - promoted people on all ten;
   - capacity strict;
   - deaths within 25% of the engine.
4. **Independence** on seeds 61–63: every compared background neighbourhood identical, and the focus different. **Identity:** 10 of 10.
5. **City of 100,000, seed 61,** rerun as the review asked, with the corrected denominator. S4's bars for build, coarse year, memory and demography apply. The month's cost is reported both against S4's bar (expected to fail, since that bar compares unlike towns) and per person.

## S11 — the twin test (pre-registered 18 Oct 2026, 09:07 Oslo, before its runs; smoke on throwaway seed 91; frozen tree branch-r19-s11)

**Question:** does someone who spent thirty years in the background behave like the same person who lived them in full? This is the review's proposed test.

**Method** (`bench/twin.ts`, 300-adult cities, fresh seeds 92–95). Four cities come from one founding, so they have the same people, traits and families at year 0. Neighbourhood k is:
- **A:** in focus through the thirty-year past;
- **A2:** in focus, but the monthly world lives the past and the present on other dice (a different full life);
- **B:** in the background for thirty years, then promoted;
- **Z:** the founding itself, the same people thirty years younger.

Every founder of neighbourhood k who is in town and at least 30 in A, A2 and B goes through the same battery: the engine's sixteen kinds of situation, by their features and answer families. Each person is asked toward the same stranger, and toward a relative from the founding. The options and considerations come from the engine's own rules (`wiringC`, `identityC`). They are scored by its decision engine with the person's true state.

The test reads the probability of each answer family, and the act chosen within each family. Distances are total variation on the probabilities, and disagreement on the acts:
- **d(A,B)** is the twin gap;
- **d(A,A2)** is how much a different full life moves the same person: the floor;
- **d between** is the distance between different people of the neighbourhood within ten years of age: the ceiling;
- **d(A,Z)** is how much thirty years of life move answers at all: the test's sensitivity.

The gap ratio is g = (d(A,B) − d(A,A2)) / (ceiling − d(A,A2)). At 0, living in the background changes a person no more than living a different full life does; at 1, it makes them a stranger.

**What the smoke run showed** (seed 91, 26 twins).
- Choice distance: A–B 0.011, A–A2 0.012, between people 0.43, so g ≈ 0.
- Thirty years of life move answers by only 0.03. The battery's answers are mostly set by inborn traits, so the test can only see a difference within that small range.
- Toward a relative, answers equal those toward a stranger. The battery's considerations read a target only through exceptions toward a person, which are rare. Real situations add their own considerations of the bond, money or strain, which the battery does not have.
- Learned if-then signatures: 1.65 per person in B against 2.4 in A.

**Expected.**
1. **|g| ≤ 0.10** for both choices and acts, pooled over seeds 92–95.
2. **Sensitivity is reported:** d(A,Z) against d(A,A2). If thirty years of life move answers less than three times as much as a different life does, the test is too weak to show a loss, and that is reported as its limit, not as a pass for the background.
3. **Reported:** learned if-thens, self-story, marks and strain in A, A2 and B.

Afterwards, the S10 city of 100,000 is rerun alone, because its run was much slower than S8's (coarse year 6.4 s against 3.3 s) with no change that would explain it.

### S10 result (frozen tree branch-r19-s10)

1. **Promotion invariance: pass.** Seeds 82–84 cover eight neighbourhoods and 626 people. Promotion changed only the texture fields. Health, illness, strain and savings moved by exactly 0 for everyone.
2. **Marks: pass.** Promoted marks per over-40 right after catch-up are 0.41 (bar 0.38; S8 0.35), and 0.56 two years later. Focus is at 0.78 and 0.77.
3. **No regression: pass** (seeds 61–65).
   - Capacity strict: all ten checks clean.
   - Coarse matches full, all six: under-20 −1.8 points, over-65 +1.2, partnered +0.2, working −1.1, drinkers +2.3, kids of 40–54 ratio 1.15.
   - Deaths: 65–79 ratio 0.99, 80+ 1.12.
   - Promoted people: all ten checks pass.
   - Promotion: 7.5–8.9 s per neighbourhood. This is slower than S8, because a twin-test smoke run shared the machine during these cities. Build times are inflated for the same reason.
4. **Independence: pass**, all five neighbourhoods identical with the focus different. **Identity: pass**, 10 of 10.
5. **City of 100,000** (seed 61, 240 people in focus during the timed months):
   - build 201 s, pass;
   - coarse year 6.4 s, pass;
   - memory 1,117 MB, pass;
   - demography within 5 points on all three (under-20 18.7% against 18.3%, over-65 29.4% against 30.0%, partnered 68.2% against 66.2%), pass;
   - ordinary month 225 ms, 0.94 ms per person, against S4's 0.41 bar: fail.

   All timings are well above S8's (coarse year 3.3 s, 0.66 ms per person) with no change that would explain it, so the city is rerun alone after S11.

### S11 result (seeds 92–95, 100 twins, frozen tree branch-r19-s11)

1. **Gap ratio: within the bar.** For choices, d(A,B) is 0.0096 against d(A,A2) 0.0101 and between people 0.443: g = −0.001. For acts, d(A,B) is 0.017 against 0.028 and 0.50: g = −0.02. The person who lived thirty years in the background answers the battery as closely to their full-life twin as a person who lived a different full life does, on every seed.
2. **Sensitivity: too weak to call this a pass for the background.** Thirty years of life move answers by 0.029 (choices) and 0.052 (acts). That is 2.9 and 1.9 times what a different life does, under the pre-registered 3. In this battery, inborn traits set almost all of a person's answers; lived history moves them by about 7% of the distance between two people. So the test can say the background does not change who someone is. It cannot say the background keeps everything a full life would have added. **That is the test's limit, as registered.**
3. **Where the background measurably differs:**
   - **Learned if-then signatures:** 1.6–1.85 per person in B against 2.1–2.9 in A and A2.
   - **Self-story** (what a person takes themselves to be): 1.7–1.8 against 2.0–2.4.
   - Strain: about 0 in B, small in A.
   - Marks: 0.32 per person in B against 0.42 in A and A2 (−24%; seed 95 has 0 against 0.21). Friends: +15% in B.

   The first two are formed by monthly life. They feed decisions, through if-thens and the "that is who I am" consideration, and they are where the review's psychological gap actually sits.

**What would make the test sharper:** the engine's real situations, with their own considerations (bonds, money, strain, wants). That needs the situations built through the engine's own constructors rather than a battery, which means a change to the engine's code. That belongs on the lab's side, or after the merge.

**Corrections from the independent check** (it re-derived every number above and found them right):
- **The registered bar could not fail.** Its denominator is the distance between two people (0.44), while a whole lived life moves answers only 0.03. A background twin that had lost all of its lived life would still score g ≈ 0.04 and pass. So item 1 is **uninformative, not a pass.**
- **The floor is lopsided.** A2 lived a different life, so it differs from A in every direction. B mostly *lacks* what A acquired: fewer if-thens, a shorter self-story. Missing something gives a smaller distance than living otherwise, so B can sit closer to A than A2 does even while it has lost part of its life. That is what the acts show: A–B is 40% below A–A2.
- **The battery is blind** to strain, money, bonds and marks. It builds no considerations from them, and the relative's rows repeat the stranger's, because the 'family' feature is never added.
- The two first twin runs started a few seconds before the time written for the pre-registration. The text was written in the same command, just before.

**The question S11 should have asked is directional:** how far did each copy move from who they were at the founding? If the background keeps a life, d(B,Z) ≈ d(A,Z) ≈ d(A2,Z). If it loses one, d(B,Z) is smaller. That is S11b.

**The S10 timing, explained.** The S8b and S10 trees were run back to back on the same city (seed 61), alternating, alone on the machine:
- S8b: 1.12 and 0.98 ms per person a month, coarse year 7.0 and 5.1 s;
- S10: 0.99 and 0.97 ms, coarse year 4.9 and 5.4 s;
- build about 200 s for all four.

The code did not get slower. The machine did: this session's workspace was restarted at about 08:33 on a slower host, and S8's 138 s build and 3.3 s coarse year were measured on the previous one. **Absolute timings are only comparable within one sitting.** Every timing claim in this log should be read with that in mind, and timed comparisons from now on run their reference in the same sitting.

## S11b — the directional twin measure (pre-registered 18 Oct 2026, 09:36 Oslo; a re-analysis of the S11 worlds, which are rebuilt identically from the same seeds, with one added measure; tree branch-r19-s11b)

**Measure.** For each copy X of A, A2 and B, d(X,Z) is how far its answers moved from who the same person was at the founding. The background keeps a life if d(B,Z) ≈ d(A,Z) ≈ d(A2,Z).

**Expected.** B moved less. The ratio d(B,Z) / mean(d(A,Z), d(A2,Z)) is under 0.9 for both choices and acts, pooled over seeds 92–95. B lacks about a quarter of the if-thens and a fifth of the self-story that full lives acquire, and both feed the battery's answers. A2/A gives the noise in the same ratio.

### S11b result (seeds 92–95, 100 twins)

| How far answers moved from the founding | A (full life) | A2 (another full life) | B (background, then promoted) | B / mean(A, A2) | A2 / A (noise) |
|---|---|---|---|---|---|
| Choices | 0.0292 | 0.0293 | 0.0255 | **0.87** | 1.00 |
| Acts | 0.0524 | 0.0451 | 0.0454 | 0.93 | 0.86 |

- **Choices: as expected.** B moved 13% less than a full life, while two full lives moved the same amount. B moved less than both A and A2 on every seed.
- **Acts: not as expected** (0.93 against the 0.9 bar). Noise between the two full lives is 14%, so acts cannot separate B from a full life.

**Reading.** By the only measure that can see a loss, a person who spent thirty years in the background carries about seven eighths of what thirty years of full life change in how they choose. The missing eighth fits the learned if-thens and self-story they lack. This battery is blind to strain, money, bonds and marks, so it says nothing about those. That needs the engine's real situations (see S11).

## External review of S11b (18 Oct 2026, 80/100)

Checked against the code and a run before anything changed.

- **The twin harness does not typecheck on its own.** It imports `Feature` from `families.ts`, which does not export it. This is real. It runs anyway because tsx does not check types, and the repo's typecheck covers `src/` only. Fixed in the harness: it now imports from `features.ts`.
- **Growing older explains most of what the battery sees.** The review aged the same founders thirty years with `mature()` alone and found 65–80% of a full life's change in choices. This was checked on throwaway seed 91 (26 twins) by adding a fifth copy, **C**: the founding aged by `mature()` only.

  | Distance in choices (acts) | |
  |---|---|
  | C from the founding (ageing alone) | 0.018 (0.015) |
  | A from the founding (a full life) | 0.030 (0.057) |
  | **Beyond ageing:** A from C | 0.015 (0.044) |
  | Beyond ageing: A2 from C | 0.011 (0.037) |
  | Beyond ageing: **B** from C | **0.004** (0.023) |

  Ageing alone is 60% of a full life's change in choices here, in line with the review. Measured against ageing, the background keeps about **a third of the change that lived experience makes in choices**, and about 0.6 in acts. **S11b's "seven eighths" overstated it,** because it counted the ageing both tiers share, and that claim is withdrawn from the docs and the report. These are numbers from one throwaway seed. The proper test needs an ageing arm, fresh seeds and the engine's real situations, which have bonds, money and strain in them; it comes after S12 puts the branch on the current engine.
- Also taken up: report how many founders' lives diverge between tiers (died, left), not only matched survivors.
- **For the lab, not this track:** a battery whose answers barely move with lived experience cannot show that experience changes behaviour. The review's question, whether experiences transform behaviour in the situations where they ought to matter, is the engine's.

## S12 — the scale branch carried onto main (pre-registered 18 Oct 2026; the pushed commit is the timestamp)

**Change.** Every change in `branch-changes.md` is re-applied by hand to the engine on main at `rH25`, which is formatted and reorganised and has rounds 19d–H25 in it. The changes are: settings and the membership index, neighbourhoods and their workplaces, the background and its yearly pass, promotion, the wider bond keys, and the test hooks. Nothing is copied from the r19c branch by patch; each change is written against main's code, following `contract.md`.

**Switch.** There is no `OFF` switch. In a town of one neighbourhood every scale path reduces to the engine's own, and a city exists only when a harness asks for one (`SCALE_FOCUS`, `SCALE_CITY`). The identity check is what proves the town is untouched.

**The background's odds are refitted on the new engine** from full towns on fresh train seeds 1031–1060, held out from 1054. The odds of r19c describe a different engine.

**Expected.**
1. **The town is the town.** `src/tools/diag/ident.ts check` is identical to main's baseline: seeds 11–13, and every switch on seed 11. The scale track's whole-world check (`scale/identity2.ts`) gives the same five hashes for main and the branch on seeds 1–10. `npm test` passes.
2. **Speed.** The branch runs a month at about 2,600 people at least 5× faster than main, timed in the same sitting, one run at a time. Main is not the engine S2 measured, so the factor is reported as found.
3. **The city still holds** on fresh test seeds 401–410, with the refitted odds:
   - **coarse matches full** on S3's six bars, seeds 401–405;
   - **promoted people** on S3's ten bars, seeds 401–405;
   - **capacity**, strict, seeds 401–405;
   - **deaths** within 25% of the new engine's rates, seeds 401–405;
   - **independence**: every compared background neighbourhood identical, seeds 406–408;
   - **promotion invariance**: nothing outside texture changes, seeds 409–410.
4. **What would change our minds:** a rule on main that cannot be made to scale without changing a town's behaviour. If one exists, it is named, left at town scale in a city, and the cost is reported.

The twin test with an ageing arm and the engine's real situations is S13, not this step.

**Amendment (19 Oct 2026, before any further port code).** The base is main at `r27`, not `rH25`; main was merged into `scale/S12` at r27. Everything above now refers to r27:
- **The identity check is against r27.** Main's stored `reports/ident-baseline.json` did not match main itself on 18 Oct, so a fresh baseline is saved from main at r27 and compared. Main's own reproduction of it is checked first.
- **The background's odds are refitted on r27** (train seeds 1031–1060, held out from 1054). The fit takes in what r27's full towns do, couples and pursuits included. Its person-years come from towns with love (couples' tension, rows, care, doubts and leaving) and with pursuits (`steer.ts`) running as they run on main. Any outcome those systems change, such as splitting up, leaving, a child or losing work, is fitted from them, not from r19c.
- **The switch.** Under the current CLAUDE.md, scale work is behind a switch. S12's city exists only when a harness asks for one (`SCALE_FOCUS`, `SCALE_CITY`); with neither set, every scale path is the engine's own, and that is the switch the identity check tests.
- **Ownership.** This chat owns S12. The lab lane is paused while S12 is open. Each part is reviewed independently by another chat as it lands on the branch.

### S12 result (frozen tree `fca5295`; seeds 401–410; the odds refitted on train seeds 1031–1060)

**Outcome: the port holds the town exactly, and the city still works, but on r27 the background no longer matches the monthly world: it has about a quarter too few children, so it ages.**

1. **The town is the town: pass.**
   - `ident.ts check` against the r27 baseline: identical on seeds 11–13, and identical on all 52 signatures with every one of the 49 switches on seed 11 (main's baseline saved from main at r27 in the same sitting).
   - The whole-world check (`scale/identity2.ts`): main and the branch give the same five hashes on all 63 runs, seeds 1–10 and every `OFF` and `ON` arm on seed 11. The two output files are byte-identical.
   - `npm test`: SPEED_AND_TEST
2. **Speed:** SPEED_RESULT
3. **The city on the refitted odds.**
   - **Capacity, strict: pass.** No workplace over capacity, no staffed background workplace without a leader, no background worker living outside their workplace's neighbourhood, in all ten checks. Five monthly workplaces were between leaders at the end of the present (reported, as in S7).
   - **Coarse matches full: 3 of 6 fail.** Monthly half against background half, mean over seeds 401–405:

     | Measure | Monthly half | Background half | Gap | Bar |
     |---|---|---|---|---|
     | Under-20 share | 21.0% | 15.3% | −5.8 pt | **fail** |
     | Over-65 share | 27.2% | 30.1% | +3.0 pt | pass |
     | Partnered | 64.1% | 61.9% | −2.1 pt | pass |
     | Working | 82.4% | 88.9% | +6.5 pt | **fail** |
     | Drinkers | 4.5% | 5.5% | +0.9 pt | pass |
     | Kids of 40–54-year-olds | 1.41 | 0.99 | ratio 0.70 | **fail** |

     Births are 7.8 per thousand in the background against 10.6 in the monthly half.
   - **Why, as far as the raw files show.** The odds are not wrong where they are used: the background's partnered women have the children the fitted odds predict (pooled, 344 against 344 at 25–34, 183 against 178 at 16–24, 188 against 182 at 35–49). Two things shrink and change who is at risk. First, young people pair up less often than in r27's full towns (16–24: 7.8% a year against 9.4%; 25–34: 6.8% against 9.7%), and those over 50 more often (4.1% against 3.0%). The background's matching takes the nearest single in age, and the odds of looking for a partner are halved because each couple makes two of the town's partnerings; which of these skews the ages is not yet measured. Second, the background's partnered women have fewer children than the town's at the same age (25–34: 11.5% a year against 13.8%), so the other things the odds read about them (years together, children already, work, money) differ from the town's. Fewer young couples and fewer children per couple make fewer under-20s, and a working-age population with fewer children and young people in it works more. S7–S10 passed these bars on r19c. The likely difference is r27's couples (love, leaving), which change who pairs up and when in the town, while the background's matching rule stayed as it was; that is a hypothesis, not a measurement.
   - **Deaths: 80+ passes; 65–79 is at the bar.** Pooled background deaths per person-year: 65–79 1.59%, 80+ 9.70%, under 65 0.09%. The report's reference rates (1.86% and 9.03%) are r19c's, stored in `report7.py`; against them the ratios are 0.85 and 1.07. Against r27's own full towns (the training towns, 1031–1060), 65–79 is 2.16% when deaths are banded by age at the start of the year, and about 2.06% when banded by age at death, as the background's tally bands them. The ratio is 0.74–0.77, so the 25% bar is met only under the tally's banding. 80+: 8.97–9.23%, ratio 1.05–1.08, pass.
   - **Promoted people: all ten pass** (friends per adult 4.60 against 5.26 after catch-up, 4.60 against 5.38 two years later; friendless 14.4% against 14.4%, then 13.5% against 11.3%; known well, routines and partnered all within their bars; the tightest is partnered two years later, +6.6 points against a bar of 7). Marks per over-40: 0.45 against 0.81 after catch-up, 0.58 against 0.82 two years later.
   - **Independence: pass.** Seeds 406–408: every compared background neighbourhood identical (2 of 2 on each seed), with the focus different.
   - **Promotion invariance: pass on everything a person is, with one exception named.** Seeds 409–410, 413 people in six neighbourhoods. Health, illness, strain and savings move by exactly 0. Besides the texture fields (status, routines, circle, friends, events, `promotedAt`, and the feelings, tries and last routine that come with them), promotion changed the wants of 3 people. The one examined (seed 409) gained a want to make things right with someone, from a falling-out in the replayed years: texture in kind, but `wants` is not on the list of fields promotion may change.
   - Promotion takes 3.8–5.1 s per neighbourhood; a city of 1,300 builds in 149–183 s.
4. **No rule on main had to stay at town scale.** Every whole-town scan in r27's new code (love, steering, threads, pursuits) has a city path; kin are found through parents, a companion among the people around someone.

The independent re-derivation from the raw files reproduced every number above, and found the stale death reference.

**What follows.** The background's partnering and children are the next scale step's to fix, pre-registered on fresh seeds: matching by the town's own age pattern of who pairs with whom, and the death reference taken from the engine it is checked against. Nothing was tuned on seeds 401–410.
