# Round 43w sizing: reasons worded for the act

_22 October 2026, tree `5416891` on `round/43w`. Throwaway worlds only (9001–9024); no fresh world was run. Research: `notes/research/wording.md` (#78). Full output: `reports/43w-size.txt`; one line a world: `reports/43w-size-worlds.jsonl`._

**Verdict: all five checks pass. Go on to review and pre-registration, with a reading of 48 pairs.**

- The words change 64% of the line-readings M38's readers faulted (stop: under 50%).
- They change 60% on held-out pages, against 65% in-sample.
- Every reworded reason traces to what the engine weighed.
- Half the expected drop is seen with 94% power on 48 pairs, but only 71% on 24. So this page round needs 48 pairs, not the 24 that build plan decision 2 sets for page rounds.

## What was built

Behind `OFF=wording` (on by default). Words only.

- **The act's own wording.** `motives.json` gives a facet's pole its own wording for one act. The act is the expression chosen (`hiAct`, `loAct`) or, for an event that is no choice of expression, its type (`hiEvent`, `loEvent`). The two maps are kept apart because `tell`, `froze` and `credit` are both expressions and event types.
- **Order of lookup.** `motive()` reads the act's wording first, then the kind's, then the pole's. A wording that needs `{t}` is skipped where there is no other person. `saidAsMotive` passes the act only when the switch is on.
- **The cells.** 44 cells are worded, each for its own form (43 for the act, 1 against it). They are listed with main's words and the round's under check 4.
- **`backsong`.** It reads "played X's song the way it was written, and gave it everything", where it used to read "as if it were Y's own", which readers took as theft. Memories, told accounts and reasons that quote the act change with it.

Nothing a person does changes:

- With `OFF=wording` the world is identical to main (CI's identity check, on the PR).
- With the switch on:
  - The words check (`sig.ts`) is identical to off.
  - On all 24 sizing worlds, the on and off arms have the same events, decisions, reasons (kind, key, weight, reference), people and bonds.
  - Only words differ: 876 reasons a world over the whole record, and 20 texts and reasons that quote `backsong`.
- The coherence counter is 0 on 9001–9008 and on CI's 11–12.

## Departures from the brief and the note

1. **History reasons wait for G3.** The brief asked for a history reason to carry its event inside it. The research found such reasons faulted at the base rate (2.8 per hundred), so naming the event could not move this round's counter. A reason that recalls an event is also G3's callback.
2. **The cells are fixed by a rule, not grown to a target.**
   - The brief: word pairs worst first until reach on held-out pages passes 50%. Iterating on round 41's pages would make them in-sample.
   - Instead: cells with three or more unfit faults on null and r40 are worded, and round 41's pages are consulted once.
   - Build plan G1 and decision 6 are amended in this PR, with a dated line.
3. **44 cells, not the note's 45.** The note's worst cell (`cooled`, gentleness low, "thought it needed saying") is already reworded on main: round 41 (`fit`) says it as "X could be hard on people". It appears only on r40's pages, so wording it would change nothing a reader of main sees. Without it, in-sample reach is 65%, not the note's 73%.
4. **48 pairs.** Check 5 sets the reading's size by the rule written in the note. At 24 pairs, half the drop is seen 71% of the time.

## The counter

A world over ten present years (mean, 95% interval between worlds):

| | |
| --- | --- |
| trait reasons said as a motive | 2,811 ±101 |
| reworded by the round | 264 ±16 (9.4%) |
| cells seen in 24 worlds | 43 of 44 |
| lines on a page a pack would read (72 pages) | 83.3 ±3.1 |
| changed lines on it | 10.4 ±1.5 (12.5%; 2 to 32) |

**Primary counter for the reading:** unfit reasons cited on the changed lines, on against off.

## The five checks

| | Check | Number | Stop line | |
| --- | --- | --- | --- | --- |
| 1 | It misses what readers fault | **277 of 434 (64%)** faulted trait-reason line-readings change words | under 50% | passes |
| 2 | The worst cells are noise | in-sample 219/338 (65%); held out 58/96 (**60%**); ratio 0.93 | ratio under 0.5 | passes |
| 3 | The words claim what was not weighed | 0 untraced of 6,327 reworded reasons; coherence 0 | above 0.5% | passes |
| 4 | The new words draw other faults | every cell listed below for the reviewer; the reading counts every fault kind on changed lines | other kinds rise more than unfit reasons fall | for the review and the reading |
| 5 | The reading cannot see it | half the drop: **94% on 48 pairs**, 71% on 24 | under 80% on 48 | passes; 48 pairs |

**Check 1, how it was measured.** Every true page M38's readers read was rebuilt with the round's words: null from this tree with `OFF=wording`, r40 on round 40's tree (`9a03b53`) and round 41's busiest on arm on its tree (`eba5885`). In both old trees `motives.ts`, `motives.json` and the tool come from this tree. All 10,977 lines match what was read, word for word, and all 683 unfit reasons are recovered. A line counts as changed if any reason on it changes words, or it shows or quotes `backsong`.

**Check 3, where the reworded reasons come from** (24 worlds):

- 58% are a facet the chosen expression prefers at that pole;
- 30% are a consideration that favoured the chosen family (weight above 0);
- 12% are the event's own cause, written by the code that made a non-decision event;
- none trace to nothing.

The round rewords only reasons the engine already gave, so the check is structural. What the words claim is the reviewer's to read against each pole.

**Check 5, the numbers.**

- On round 41's pages, the lines the round changes draw 7.16 unfit reasons per hundred line-readings (65 of 908; binomial 95% interval 5.5–8.8, wider in truth since faults cluster on lines). The base rate across M38's true pages is 3.11.
- The whole drop is 4.05 per hundred changed line-readings; half is 2.02. The note's held-out 6.1 counted only lines with a chosen cell; the actual change also reaches `backsong`'s other lines and lines that quote it.
- The model is paired: faults in both versions cancel, as on M38's planted pack. Changed lines a page come from the 72 sizing pages. New words are faulted on their own at 1 per hundred; at 0.5 and 1.5 per hundred, 48 pairs give 99% and 89%.
- **Sensitivity:**
  - At the note's half (1.5), 48 pairs give 81%.
  - At the interval's low end (half 1.2), they give about 65%.
  - The pre-registration should shrink its expectation from 2.0 toward zero and say what a miss means.

## Check 4: the words, for the reviewer

Each line is a cell with main's words and the round's. M38 gives line-readings and unfit reasons in-sample, then held out. The last figure is reasons a world on the sizing worlds. Pronouns are from the first instance seen.

| Cell (act, facet, pole, form) | M38 in | M38 out | a world | Main's words | The round's |
| --- | --- | --- | --- | --- | --- |
| backsong, patience hi | 56 / 26 | 40 / 13 | 4.8 | could wait it out | was content to wait {her} turn |
| absent, altruism lo | 104 / 23 | 32 / 3 | 15.4 | had {her} own life to get on with | did not want {t}'s trouble to become {hers} |
| night:good, organisation hi | 164 / 23 | 84 / 0 | 2.6 | likes things done properly and on time | had seen to every last detail |
| backsong, modesty hi | 42 / 15 | 24 / 9 | 2.6 | did not think it was about {obj} | did not need the song to be {hers} |
| absent, diligence hi | 14 / 13 | 4 / 3 | 1.5 | will not leave a job half done | put {her} work first |
| absent, sentimentality lo | 54 / 11 | 12 / 1 | 6.0 | has never been one to look back | was never one for sitting with other people's troubles |
| skim, sincerity lo | 38 / 10 | 16 / 1 | 5.5 | said what would work | knew {she} could talk {her} way out of it |
| backsong, flexibility hi | 12 / 8 | 8 / 3 | 3.3 | wanted to keep the peace | would rather play it {t}'s way than argue |
| rebuffed, forgiveness lo | 52 / 8 | 24 / 0 | 2.3 | does not forget | had not forgiven {t} |
| show, organisation hi | 104 / 6 | 52 / 2 | 18.2 | likes things done properly and on time | does not keep people waiting |
| ownup, sincerity hi | 62 / 6 | 40 / 1 | 16.5 | could not bring {self} to lie | could not have lived with the pretence |
| nowallet, sincerity lo | 24 / 6 | 12 / 0 | 8.2 | said what would work | had an excuse ready |
| tell, sociability hi | 26 / 6 | 16 / 6 | 1.6 | likes having people around | could never keep a good story to {self} |
| rake, modesty lo | 144 / 5 | 32 / 0 | 13.0 | felt slighted | felt {she} was still owed an apology |
| ask, altruism hi | 10 / 5 | 16 / 7 | 7.2 | puts other people first | would have done the same for {t} |
| cheer, gentleness hi | 28 / 5 | 0 / 0 | 2.9 | has a soft spot for anyone in trouble | always finds something kind to say |
| peace, forgiveness hi | 52 / 5 | 12 / 0 | 1.4 | lets things go | was ready to put it behind {obj} |
| friends, gentleness hi | 254 / 4 | 104 / 0 | 22.3 | does not like to judge | takes people as {she} finds them |
| give, altruism hi | 68 / 4 | 52 / 0 | 20.8 | could not stand to see {t} go without | gives without keeping count |
| skim, fairness lo | 22 / 4 | 8 / 0 | 5.3 | thought nobody would notice | saw no harm in helping {self} to a little |
| hangback, greedAvoidance hi | 8 / 4 | 0 / 0 | 4.6 | money has never meant much to {obj} | would not risk {her} neck for money |
| blame, modesty lo | 68 / 4 | 20 / 0 | 4.6 | felt it was owed | thought {self} above taking the blame |
| decline, inquisitiveness lo | 16 / 4 | 8 / 0 | 4.0 | had no wish to see anywhere else | had never wondered what else was out there |
| tell, sincerity lo | 56 / 4 | 28 / 6 | 2.2 | said what would work | had never meant to keep {t}'s secret |
| quietword, gentleness hi | 6 / 4 | 0 / 0 | 0.9 | does not like to judge | would not shame {t} in front of others |
| quietword, forgiveness hi | 4 / 4 | 0 / 0 | 0.0 | lets things go | wanted it said and done with |
| sulk, modesty lo | 42 / 3 | 12 / 4 | 36.3 | felt it was owed | felt {she} deserved better |
| pitchin, altruism hi | 252 / 3 | 156 / 0 | 14.5 | could not stand to see {t} go without | will always lend a hand |
| cold, sociability lo | 12 / 3 | 12 / 0 | 4.2 | would rather be on {her} own | never minded keeping people at a distance |
| seize, aesthetic hi | 14 / 3 | 12 / 0 | 4.0 | is moved by beautiful things | wanted to make something beautiful |
| sulk, socialBoldness hi | 10 / 3 | 4 / 0 | 3.1 | would say it to anyone | never hides what {she} feels |
| confront, socialBoldness hi | 52 / 3 | 12 / 0 | 3.0 | would say it to anyone | did not care who heard |
| quietgive, socialBoldness hi | 8 / 3 | 0 / 0 | 2.9 | did not mind everyone seeing | was not one to hang back when the hat went round |
| rough, anxiety hi | 12 / 3 | 4 / 0 | 2.9 | could not stop thinking about what might go wrong | goes to pieces under pressure |
| rough, perfectionism lo | 6 / 3 | 0 / 0 | 2.9 | good enough was good enough | saw no need to fuss over the details |
| cheer, altruism hi | 22 / 3 | 8 / 0 | 2.8 | wanted to be there for {t} | wanted {t} to get the credit |
| seize, inquisitiveness hi | 10 / 3 | 16 / 1 | 2.6 | wanted to know | wanted to find out what {she} could do |
| plan, socialBoldness hi | 38 / 3 | 12 / 0 | 2.1 | is not one to hang back | was happy to say it out loud |
| dating, gentleness hi | 22 / 3 | 0 / 0 | 1.4 | does not like to judge | has a gentle way with people |
| quietword, modesty lo | 4 / 3 | 8 / 0 | 0.7 | would not be talked down to | would not be taken lightly |
| thread:cost, patience hi, against | 6 / 3 | 0 / 0 | 0.7 | though slow to anger | though {she} had given {t} more chances than most would |
| council:no, prudence hi | 10 / 3 | 4 / 0 | 0.6 | thought it through first | would not take a chance on it |
| give, fearfulness lo | 4 / 3 | 4 / 0 | 0.5 | danger has never stopped {obj} | was not one to be put off by the risk |
| congratulate, modesty hi | 6 / 3 | 4 / 3 | 0.3 | did not think it was about {obj} | was happy for {t} to have the praise |

**Where to look hardest:**

- **Two cells sit against the expression.** In `sulk` and `quietgive`, the chosen expression prefers low social boldness, but the reason is a family consideration that favoured high. The words tie the trait to what the act shows ("never hides what she feels"; giving at all), not to its manner.
- **`ask` with altruism high** is worded as reciprocity. It is the nearest altruistic reading of asking straight out for money.
- **`hangback` with greed-avoidance high** names money. The storm situation reads money (`needs the money` / `can afford to wait`).
- **`friends` and `dating`** are said of the other person (`chemWhy` cites the friend's gentleness), as before.
- **`council:no`** is the councillor's prudence, as before.

## Reproduce

    ARMS=1 ./run.sh src/tools/diag/wording.ts 9001 9024 > out-r43w/size.jsonl
    OFF=wording PACK=null ./run.sh src/tools/diag/wording.ts 3601 3608 3 > out-r43w/pack-null.json
    # on 9a03b53 with this tree's src/motives.ts, src/motives.json and src/tools/diag/wording.ts copied in:
    PACK=together ./run.sh src/tools/diag/wording.ts 3529 3536 3 > out-r43w/pack-r40.json
    # on eba5885, the same three files copied in:
    PACK=fit ./run.sh src/tools/diag/wording.ts 3585 3592 3 > out-r43w/pack-r41.json
    python3 reports/43w-size.py out-r43w/size.jsonl out-r43w/pack-null.json out-r43w/pack-r40.json out-r43w/pack-r41.json > reports/43w-size.txt

The power simulation uses a fixed seed (42), 4,000 runs a figure.
