# Reasons that bear on the act

_Research for round 42 (exit point 3), 22 October 2026. How to show a trait as a reason only when it bears on the act chosen, and a told account only for the act it decided._

## How the engine composes a reason

A decision picks a family of answer (duty or lapse), then an expression within it. The reasons are the considerations that gained most over the runner-up family (`reasons`, `decide.ts`), then the expression's own strongest facet (`grammar.ts`); the page keeps three (`shownCauses`, `page.ts`). So a trait that won the family is printed beside an expression it never chose: organisation wins duty over lapse, sentimentality picks "dropped everything", and the page says "[Stuart was ill; likes things done properly and on time]". The expression's own facet, which would fit, comes fourth and is cut. A told account is weighed beside every bond it bears on (`withAccounts`, `telling.ts`) and printed whenever it ranks in the top three, whether or not it changed anything.

On throwaway worlds 9001–9004, 44% of the trait reasons shown on decision lines (2,817 of 6,356) name a facet the chosen expression neither prefers nor shows; dropping them would change 42% of decision lines. About 10 of 244 accounts shown as reasons decided the choice.

## What the data on file says

M38 read true pages without a cap (null, r40, and the true halves of shuffled and planted: 288 page-readings). Readers marked 683 unfit reasons, 2.4 a page-reading: 595 awkward and 88 false. In 56 the event shown under the line did not support the reason, and in 546 there was no event to check. Lines with a trait motive carry 58% of them, but a motive alone is not the fault. Those lines are faulted 3.3 times per hundred readings, against 2.9 without one.

The fault is in the pairing of motive and act: "could not stand to see X go without" is faulted 0.9 times per hundred, "had her own life to get on with" 18, and "could wait it out" 11, 35 of its 44 faults on playing a bandmate's song as one's own. Above the base rate, motive phrases account for about 220 of the 683. Lines that cite a told account are rare (72 line-readings) but faulted 24 times per hundred, seven times the base. Round 41's capped reading agrees: 128 of the 246 unfit reasons quoted fall on lines with a motive.

## What others did, and where it went wrong

- **Talk of the Town / Bad News** (Ryan et al. 2015; Ryan 2018): acts and knowledge come from personality and salience, and no reason is surfaced. Bad News needed a live actor and a hidden wizard to supply the motives.
- **Crusader Kings III:** in events the tie is made by construction. Each option is marked with the trait it expresses, and acting against one's nature costs stress (Dev Diary #31). It goes wrong in the AI's acceptance and opinion tooltips, which list every modifier in the sum, relevant or not.
- **Dwarf Fortress:** thoughts tie a feeling to a named event, but the acts that matter, such as tantrums, come from hidden accumulated stress. The reason is a sum of small things, none of which bears on the act.
- **The Sims:** every act carries the need it serves (objects advertise, needs weigh the offers), so the reason always fits. Personality only scales the weights and rarely shows.
- **Versu** (Evans and Short 2014): social practices offer the actions, so a desire is weighed only where it is relevant. That relevance was authored by hand, at a cost that helped end the project.
- **PsychSim** (Pynadath and Marsella 2005): an act is explained by the goals that made it better than the alternatives. That is contrastive, as ours is, and it explains the decision as modelled, not the act as told.

The games whose reasons fit tie the reason to the act that is shown. Ours ties it to the family that won.

## The literature

A trait predicts a single act at about r = .30 (Mischel 1968). Situations do no better (.36–.42, Funder and Ozer 1983), and a typical effect in social psychology is r ≈ .21 (Richard, Bond and Stokes-Zoota 2003). A person varies about as much within as between people (Fleeson 2001). A trait shows only where the situation offers cues that call on it (trait activation, Tett and Guterman 2000), and less in strong situations (Meyer, Dalal and Hermida 2010).

People explain intentional acts by desires and beliefs, seldom by traits (Malle 1999, 2004). They pick one or two causes that answer the contrast asked about (Hilton 1990; Miller 2019) and prefer fewer causes (Lombrozo 2007). They believe a story by its coherence (Thagard 1989). In Pennington and Hastie (1988), mock jurors convicted 78% of the time when the prosecution told its evidence in story order and the defence in witness order, and 31% the other way round. A reason that explains nothing about the act costs coherence.

## Proposal and estimate

Behind `OFF=bear`, applied to the page only:

- **Trait reasons:** a trait is shown only if the chosen expression prefers or shows that facet, or `motives.ts` words it for that family. Otherwise the next reason moves up, often the expression's own facet.
- **Told accounts:** an account is shown only if it turned a choice of counterpart (`citeFlip`), or if removing it at decision time would halve the odds of the choice (the honest-why test, run without a draw).

The decision record keeps every reason, and no event or scoreboard number changes. The reading pack can be built as M38's planted pack was: the same lives, with the switch on and off.

- **Counter:** off, about 700 trait reasons a world that do not bear on the act, and 60 accounts that decided nothing. On, none, by construction.
- **Reading:** about 0.5 fewer unfit reasons a page-reading, shrunk to **0.3 (−12%)**, with a range of 0 to 0.8. Within pairs, each unfit reason costs about 0.026 of a point (±0.029, M38 null and r40, with lines as a term). **The effect with order as a term is expected at +0.01 (0 to +0.05)**, against r40's +0.25 on the post-M38 scale.
- **What the score can show:** nothing. The two versions differ only in brackets, so ties will pass half, as in planted (47 of 48). The round is judged on its counter, on "reads no worse", and on unfit reasons cited on the changed lines, on against off.

## This fails if …

1. … the test drops reasons readers accept, such as "has a soft spot for anyone in trouble" on a visit. Check on 9001–9020: if `motives.ts` words over a quarter of the dropped reasons for the chosen family, widen the test to the family.
2. … it misses what readers fault. Check: rebuild M38's null and r40 pages with it on. If fewer than 40% of the 398 faulted motive line-readings change, the fault is in the wording, not in whether it bears, and the round stops before a reading.
3. … lines are left bare, and readers quote "out of nowhere" in their place, as they turned to the next fault in round 41. Check: decision lines that lose every reason beyond their event, sized at 2.5%. Stop above 5%.
4. … the reading cannot see it. On the null pack, nothing changed and the paired fault count still moved +1.41 ±1.19. Check: simulate the comparison line by line from M38's rates (about 5.5 against 3 per hundred on changed lines, 24 pairs, two roles). If the power to see half the drop is under 80%, judge the round on its counter alone.
5. … told accounts vanish from the page. 96% of the accounts cited decided nothing, and telling was kept in round 40 because readers read it as story. Check: accounts shown per busiest page, on against off. If fewer than one page in three keeps one, an account that decided nothing is said once as its own line instead.
