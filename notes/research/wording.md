# Reasons worded for the act

_Research for the second and last round on reasons (exit point 3), 22 October 2026. Round 42 (`OFF=bear`, PR #77) stopped at sizing: it reaches 32% of the trait-reason lines M38's readers faulted. How should a reason be worded to fit its act, and when should it carry an event?_

## How the engine words a reason

`motives.ts` words each pole of 25 facets, some also for a family of answer; `saidAsMotive` (`world.ts`) takes the family's wording if there is one. No wording knows the act, and a family spans unlike acts: lapse covers a missed deadline and abandoning a friend in trouble. Events that are not decisions (drift, a festival's outcome) pass no family, so always get the general wording.

## What others did, and where it went wrong

- **Crusader Kings III:** each event option is written for its act, marked with the trait it expresses, and costs stress if against it. Authored per event, so trait options recur; AI tooltips list every modifier, relevant or not.
- **Dwarf Fortress:** thoughts are worded by event ("upset after seeing a dead body"); personality sets only their strength. But tantrums come from accumulated stress no thought explains.
- **The Sims:** a moodlet names its source, but explains a mood, never a choice between people.
- **Talk of the Town / Bad News:** no reasons surfaced; in Bad News a live actor supplied them.
- **Versu:** actions worded inside a social practice, so a desire is said only where relevant. Hand-authored; the cost helped end the project.
- **Prom Week:** shows the weightiest rules in their own words, so one phrase recurs across unlike exchanges.

Those that fit word the reason at the act or its event, and pay in authoring.

## The literature

- **Reasons over traits.** About three explanations of intentional acts in four are reasons (Malle 1999, 2004). Offered reasons were endorsed at .68, causal histories at .14. "Likes things done properly" is a causal history; a motive said for the act is a reason.
- **Generic wording** passes as description (Forer 1949: a stock sketch rated 4.3 of 5 for accuracy) but answers no contrast, and explaining an act is answering one (Hilton 1990; Miller 2019).
- **What reads well.** Everyday explanations rate higher when they cite more of the mechanism; simplicity does not help (Zemla et al. 2017). Story order took conviction from 31% to 78% (Pennington and Hastie 1988); reading slows as the causal tie between sentences weakens (Keenan et al. 1984).
- **The risk.** Irrelevant detail can flatter a bad explanation (Weisberg et al. 2008); specific words must stay true.

## What the data on file says

M38's true pages: 288 page-readings, 683 unfit reasons (3.11 per hundred line-readings).

- **Wording.** 399 faulted line-readings carry a motive phrase (bear's 434 also counts trait labels): 267 general-worded only, 72 family-worded only, 60 both, none worded for its act. General phrases are faulted 4.33 per hundred readings, family phrases 2.46 (confounded: family wording appears only where the family fits).
- **The fault is the pairing.** A phrase is faulted on one act, not another:
  - "could wait it out": 35 of 76 on "played X's song as if it were X's own", 2 of 50 on an apology;
  - "thought it needed saying": 28 of 48 on friends losing touch;
  - "had her own life to get on with": 25 of 118 on staying away from a friend in trouble.
- **Concentrated.** 20 of 6,172 phrase–act pairs hold 43% of all faults; the 22 worst motive pairs take in 185 of the 399.
- **Sometimes it is the act's words.** `backsong` is humility, but "played X's song as if it were X's own" reads as theft. Its humble reasons draw 63 faults.
- **Events.** 80% of motive faults had no event under the line, yet lines with one are faulted more (4.4 per hundred against 3.1). More events is not the lever.

## Proposal and estimate

Words only, behind one switch:

- Motives worded by expression for the facets it prefers (279 pairs in `families.ts`), falling back to family, then general. Non-decision events pass their type as the kind.
- `backsong` reworded to read as backing the song.
- Only a history reason (a grudge, a debt, a soft spot since) carries its event, named inside the reason, not as a new ↳ line.

Bear has not been read, so it cannot be bundled with this.

**Reach.** The 22 worst pairs plus `backsong` change 185 of the 434 faulted lines (43%, in-sample); a full table up to 399 (92%). Bear: 32%.

**Effect.** If rewritten lines fall to the family rate, the worst pairs lose about 200 of their 222 faults. Shrunk by half for selection: **about 100 fewer unfit reasons (15%; 0.35 a page-reading), range 40 to 190.**

**Visibility.** The score cannot see it (+0.01; 24 pairs and two roles need about +0.27). Faults on the changed lines can. Power, calibrated on round 42's simulation:

| | the whole expected drop | half of it |
| --- | --- | --- |
| targeted pairs | over 95% | about 50% |
| full table (diluted) | about 60% | about 20% |

## This fails if …

1. **… it misses what readers fault.** Rebuild M38's true pages with the change. Stop if under 50% of the 434 faulted lines change words.
2. **… the worst pairs are noise.** Pick them from the null and r40 packs only, and measure reach on round 41's pages. Stop if it is under half the in-sample reach.
3. **… the words claim what was not weighed.** Every act-worded reason must trace to a consideration favouring the chosen expression or family, and the coherence counter stays at 0. Stop above 0.5% untraced.
4. **… backing events crowd the page.** Count ↳ lines on the busiest pages, on against off, over 9001–9024. Stop above a 10% rise.
5. **… the reading cannot see it.** Simulate faults on changed lines from M38's rates, with an order term for the null's +1.41 lean. Under 80% power for half the drop: the claim is the counter, and the reading checks only "reads no worse".
