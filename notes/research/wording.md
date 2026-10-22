# Reasons worded for the act

_Research for the second and last round on reasons (exit point 3), 22 October 2026. Round 42 (`OFF=bear`, PR #77) stopped at sizing: it reaches 32% of the trait-reason lines M38's readers faulted. How should a reason be worded to fit its act, and when should it carry an event? Reviewed the same day (`reviewer`, Fable 5.1, PR #78): the estimate is now taken on held-out pages._

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

M38's true pages: 288 page-readings, 683 unfit reasons (3.11 per hundred line-readings). 434 faulted line-readings carry a trait reason, 399 of them worded as a motive.

- **Wording.** None of the 399 is worded for its act: 267 general only, 72 family only, 60 both. Lines whose motives are all general are faulted 3.4 per hundred readings, all family 2.5, lines with no motive 2.9 (confounded: family wording appears only where the family fits).
- **The fault is the pairing.** A phrase is faulted on one act, not another:
  - "could wait it out": 35 of 76 on "played X's song as if it were X's own", 2 of 50 on an apology;
  - "thought it needed saying": 28 of 48 on friends losing touch;
  - "had her own life to get on with": 25 of 118 on staying away from a friend in trouble.
- **Concentrated.** 20 of 6,756 phrase–act pairs hold 49% of all faults.
- **Sometimes it is the act's words.** `backsong` is humility, but "played X's song as if it were X's own" reads as theft. Its humble reasons draw 55 faults.
- **Events.** 80% of motive faults had no event under the line, yet motive lines with one are faulted more (4.6 per hundred against 3.3). More events is not the lever.
- **History reasons** (a bond whose reason points at a remembered event) are faulted at the base rate: 2.8 per hundred on null and r40, 3.8 on round 41's pages.

## Proposal and estimate

Words only, behind one switch.

- **The unit is a cell:** the act, the facet, its pole and the reason's form (for the act, or against it). The act is the expression chosen, or the event's type where there is no expression, so non-decision events are worded too.
- **Which cells:** those with three or more unfit faults on the null and r40 pages, worst first: 45 cells (36 expressions, 9 event types; 44 for, 1 against). Round 41's pages are held out and consulted once, after the rule is fixed. A cell keeps its pole's sense and falls back to the family, then the general wording.
- **`backsong`** reworded to read as backing the song.
- **History reasons wait for G3** (particulars and callbacks). They are faulted at the base rate, so naming their event cannot move this round's counter, only dilute it, and a reason that recalls an event is a callback, G3's claim.
- **Authoring:** about 50 strings, each read by the reviewer against its facet's pole, so a word cannot drift from what the trait is.

Bear has not been read, so it cannot be bundled with this.

**Reach.** The 45 cells change 73% of the 338 faulted trait line-readings in-sample and 58% of the 96 held out (70% of all 434). Bear: 32%. Keyed by phrase and act text instead, the 22 worst pairs picked the same way reach only 28% held out (the review): the act and facet generalise, the phrase does not.

**Effect.** The cells' lines are faulted 12.3 per hundred in-sample but 6.1 held out, and the held-out rate is the estimate. If reworded lines fall to the pages' base rate (3.1), the whole drop is 3.0 per hundred changed line-readings, about 0.3 a page-reading (10 changed lines a page). **Shrunk by half: 1.5 per hundred, about 0.15 a page-reading (45 fewer in 288), range 0 to 90.**

**Visibility.** The score cannot see it (+0.01; 24 pairs need about +0.27). The counter can, because a same-lives pack cancels what is shared: on M38's planted pack, readers faulted an unchanged line in both versions or in neither, 109 of 109. Only the changed words' own faults are noise. Power for half the drop, with new words faulted on their own at 0.5 to 1.5 per hundred:

| | 24 pairs | 48 pairs |
| --- | --- | --- |
| the whole drop | 85–96% | 99–100% |
| half of it | 45–67% | 71–91% (81% at 1.0) |

Round 42's model, which takes the two versions as independent, gives 27% and 45% for half the drop.

## This fails if …

1. **… it misses what readers fault.** Rebuild M38's true pages with the change. Stop if under 50% of the 434 faulted lines change words.
2. **… the worst cells are noise.** The cells are fixed by the rule above on null and r40; round 41's pages are consulted once. Stop if reach there is under half the in-sample reach. The reading is on fresh worlds, so no life used to pick the cells is read.
3. **… the words claim what was not weighed.** On a decision, every act-worded reason must trace to a consideration that favoured the chosen family (argued against it, for an against form) or to a facet the expression prefers. On another event, it must be the event's own cause, given by the code that wrote it. The coherence counter stays at 0. Stop above 0.5% untraced.
4. **… the new words draw other faults.** The sizing lists every cell with its old and new words for the reviewer. The reading counts faults of every kind on the changed lines, and the round is not kept if other kinds rise by more than unfit reasons fall.
5. **… the reading cannot see it.** Simulate the counter on the held-out rate, paired as above, with new words faulted on their own at 1 per hundred. The reading uses the fewest pairs, 24 or 48, that reach 80% power for half the drop. If 48 do not, the round stops at its sizing: no other counter can judge it.
