# Building the engine: the plan

_Rewritten 22 October 2026 around three research notes: `notes/research/feelings-and-traits.md`, `language.md` (PR #85) and `intriguing-lives.md` (PR #86). Also drawn on: `wording.md` (PR #78, a draft), `reasons.md` and `reports/density-22oct.md`. Øystein agreed the outline that day: two tracks, feelings first, and the bar in section 3. A pre-mortem by the `reviewer` agent (Fable 5.1) followed; its findings are answered here and listed on PR #82. Øystein then left the remaining decisions to the lead session; section 6 records them. The first version, with its file-by-file audit of the engine, is commit `cccad45`._

_Second pass, the evening of 22 October. Øystein asked for a deep analysis of the plan, and for when a human reading is really needed. Three findings changed the order, and section 6 records them under "Second pass":_

- _Round 44's sizing shows feelings rarely meet their object. After a wrong, a resentment is weighed in 1.4% of decisions, because each person meets one situation a month (`src/situations/index.ts:104`)._
- _Eight of the nine exit points are judged by counters, not by readers._
- _The one decision the reader's taste would steer is selection._

## 0. Where people must read, and where they need not

**People are needed in three places, and only there:**

1. **Before a reader's taste steers a design.** Selection (G2) trades length against sameness. In round 35, readers chose the longer page 70% of the time. Judges built on language models are known to prefer longer answers (Zheng et al. 2023; Saito et al. 2023), so that finding may be the model's taste rather than a reader's. Selection is read only after people have answered it. The same holds for any round kept on "reads better", which CLAUDE.md already forbids until people have read.
2. **To check the instrument that guards every round.** Do people choose as the model readers do, and do they reward kinds of line too? This needs people who are blind to which version is which, not cold to the project: Øystein can read. **H1** below.
3. **To close exit point 5,** which is people by definition. A cold reader is cold only once, so outsiders are spent on the engine that will be built on: at phase C's gate, when exit points 1, 2 and 9 are close or the stop rule fires. **H2** below.

**Everything else needs no person.** Exit points 1, 2, 3, 6, 7, 8 and 9 are judged by counters: decisions flipped, reach, links, faults on the page, the scoreboard, the city's budget, lasting change, and a group's character surviving its founders. The model reading guards each round against harm, and is never the reason to keep one. The work any game needs regardless of a reading is the same work: ties with an inner life, consequences that travel, groups, places and homes, the front door's second part, content as data, the city. Section 4 orders it first.

## 1. In short

Øystein's pilot reading found lives samey and feelings unspoken. The notes say why:

- **Feelings are decoration.** No act reads any of the 41 kinds written.
- **The page repeats.** 21% of lines are copies, two thirds of them from routine shown every time.
- **The reading scores kinds of line and life turns,** not story features (`intriguing-lives.md`).
- **Situations are pairs settled within the month.** Sides, debts, secrets others know and a third person are missing.

The answer is two tracks of rounds and one of plumbing:

- **People track,** one experiment at a time: feelings part one; feelings meet their object; taking sides; shared hardship; the band year; wants for later life. Secrets with accounts, a third person and feelings' further kinds wait for Overstory's register to ask for them.
- **Page track,** beside it, on page files only: the wording round; every clause carrying its IDs (N3); particulars and callbacks; then selection, once people have read (H1).
- **Neutral jobs** beside both, the measures and the guard first.

Every round has one primary counter, which can fail it. The reading checks "reads no worse".

## 2. The guard: storiness must not become scripting

A hard rule for every round and every neutral change.

1. **What is forbidden.** No engine rule reads a story measure, a density rate, a count of events across the town or the page, or anything under `src/tools/`. A count of a person's own past events may scale a weight or a feeling: habituation, or a grudge renewed on meeting. It may never gate whether an event of that kind can happen. A cap, a quota or a cooldown on a kind of event is pacing, whoever holds the count.
2. **What main already does.** `src/social.ts:503` caps how many people one can come to dislike (`tried['dislikes'].n < 3`). `lastProvoked` (`src/world.ts:253`) is a timer field with no reader, and N2 cuts it. Both are grandfathered and listed for review, and the rule binds every new reader.
3. **How CI enforces it.** An import test fails if a module outside `src/tools/` imports from it. A lint flags new `tried[…].n` thresholds, `.events.filter(…).length` comparisons and new `last*` fields outside the tools, the page and the front door. A flagged line needs a one-line justification the reviewer accepts.
4. **What a round that raises drama must name.** Drama here means more rifts, exposures, feuds or turns. The pre-registration names the state in people that produces it. Its parameters come from that state and are never tuned toward a story or density number. The soap checks are stops, never targets.
5. **The reviewer's seventh question:** does any new reader read a count, a rate or a measure instead of a person?
6. **No director.** Lulls are accepted. The page chooses what to show; the engine never chooses what happens for the page's sake.

## 3. How rounds are judged

**The bar (agreed).** "Reads no worse" holds when the one-sided 95% lower bound of the effect, with order as a term, is above −0.3. People rounds are read on 48 pairs, one random pack and one busiest, pooled with the pack as a term. Page rounds are read on 24 pairs of the same lives, as M38's planted pack was. "Reads better" is reported and never judged until the human test.

**The arithmetic,** from M38's files. A pair's difference varies by 0.50 on the null (the same worlds, another run seed) and by 0.86 on round 40's busiest. How often a round that changes nothing in how lives read passes:

| Rule                            | spread 0.50 | spread 0.86 | a true −0.3 passes |
| ------------------------------- | ----------- | ----------- | ------------------ |
| Today: 24 pairs, two-sided 95%  | 81%         | 36%         | 2%                 |
| Agreed: 48 pairs, one-sided 95% | 99%         | 77%         | 5%                 |
| −0.15, 48 pairs, one-sided 95%  | 66%         | 32%         | 5% (a true −0.15)  |

At −0.15, a harmless round would pass 80% of the time only at 70 to 200 pairs, so −0.3 stays. The scorer gains the one-sided 95% bound; today it reports a one-sided 90% one.

**A miss is not a verdict.** At a spread of 0.86, a harmless people round still misses the bar about one time in four. So when its primary counter passes and "reads no worse" misses, the round buys one more pack (about $40) before it is called not kept. The stop rule in section 4 counts only rounds that failed their counter or missed twice.

**Expected warnings.** On the same lives, ties above half are expected (planted: 47 of 48), and the bound is near vacuous there. The page round's fault counter is the judge, and the bound only guards against harm. If a people round's random pack ties above half, the bound is taken on the busiest pack, and a second busiest pack is read. Each pre-registration names the warnings it expects.

**What the reading can see:**

- **The score:** new kinds of line, and life turns with the life around them. It also scores sameness: a repeat fault goes with −0.25 z on the old brief and −0.11 on M38's.
- **The fault counts:** unfit reasons, repeats and "out of nowhere" on the changed lines.
- **Nothing** sees triads, debts or secrets as such, except as new kinds of line where they fire.
- **Feelings are not asked about,** so the reading cannot see them.

**The felt question (M39).** The brief gains one question: for each version, up to two lines where the reader can tell what the person felt and toward whom. It is a check that feelings are seen, never a judge, since feelings part one names kind and object by construction.

- The key is stated for both arms. With the switch off, it is every line that carries an emotion with a person in it.
- Readers' words map to engine kinds through a fixed table, committed before any answer is read.
- Agreement between readers is reported.
- Calibration re-reads round 40's busiest and M38's planted pack, which must again find its 48 of 48.

**Each pre-registration states** its primary counter with its interval, the share of a pack's pages it touches, the smallest effect its reading can resolve (about ±0.25 at 48 pairs) and what the reading cannot see.

**Packs aimed at the change.** Some people rounds touch under a third of the busiest pages; round 44's feelings decide a line on 24% of them. For such a round, the busiest pack gives way to an aimed pack. The aimed pack holds lives where the round's trigger falls in the present years of the off arm (a death or a wrong for feelings, a rift for taking sides). They are chosen by a rule written in the pre-registration and computed from the off arm alone, so the choice cannot follow the outcome. The random pack stays, as the guard for the quiet majority. The cost is unchanged: 24 pairs each, pooled with the pack as a term. Scores from aimed packs are never compared across rounds.

**Milestone readings.** No round's reading can see a small effect, and eight of them can add up to one. Every third kept people round, and before H2, main is read against the tag from three kept rounds earlier. That is 48 pairs: one random pack and one busiest, on the reader roles and brief of the day, about $40. It is the only reading that says whether lives read better than they did.

- A milestone that reads worse than its base, with the one-sided bound below −0.3, stops the people track until the cause is found.
- A milestone that reads better is reported, and keeps nothing on its own.
- The first milestone follows the next kept people round. Its base is tag `r39`, since rounds 40 and 41 have been kept since then.

## 4. The order of work

### Neutral jobs, beside anything

- **N1a, before feelings part one:**
  - the scorer's one-sided 95% bound and pooled packs;
  - the guard's import test and lint;
  - the page's copy share and its 15 most-faulted templates;
  - the flip counter, from `honestWhy` (`src/decide.ts:258`);
  - kinds of line per page;
  - adults carrying a lasting change by year 10;
  - `reading.md` and the reviewer's brief brought up to date.
- **N1b, before taking sides:**
  - life turns per page, and the share with a cause on an earlier line;
  - counterparts in three or more weighty events;
  - reversals per life;
  - the share of weighty events cited by a later one;
  - knowable turns per 100 people a month (`density.ts`), reported beside exit point 2 and never a target;
  - the callback share;
  - whether a want loses the blow that caused it. Only 3% of rises after a blow descend from it today. If the record loses the chain, recording the cause is its own small change, with every act identical.
- **N2, cleanups** (`refactor`, then `words`): cut `selfBias` and `lastProvoked`; name the secret in "carrying something nobody knew"; say who the dead person was to the subject; give the habit line its job-loss event.
- **M39, the felt question,** before feelings part one is read: about six sittings, once.
- **H1, the pair page for people** (no reading credits, a tool in `study/`, as Q3's page):
  - **What a reader does:** sees two versions of a life, blind to the arm, and picks the one they would rather read on. They may mark up to three lines that ring false or repeat, and they answer the felt question. Their answers leave the page as a block of text, and nothing is sent anywhere.
  - **What they read,** from packs on file: 12 pairs of round 40's busiest where the model readers' majority was clear, 6 of round 35's pairs that differ in length but not in kinds, and 6 of M38's null.
  - **Who reads:** Øystein and people who will not be among H2's cold readers.
  - **What it reports:** agreement with the model readers' majority, with its interval; whether length predicts the choice once kinds are counted; and the lean on the null.
  - **What it decides:** only selection's pre-registration. If people do not prefer the longer page where kinds are equal, G2 drops round 35's length cost from its prediction. If they agree with the model readers on fewer than three pairs in five where the model was clear, the reading's brief goes back to a method round before G2.
- **The gate when GitHub refuses CI's jobs** (billing, as in rounds 37 and 39 and on 22 October): the same checks run locally on the PR's merge with main, and their output is committed to `reports/`. CLAUDE.md's gate says how.
- **N3, every clause carries its IDs:** CI fails a clause with no event behind it. Also a Rule 8 lint over a rendered world, a frame render over random states, a model-tics list and one pseudo-localised pass. It touches `grammar.ts` and `page.ts`, so it runs between page rounds.
- **S1, the first command and the slice:**
  - #22's first command, an invitation answered by the other person's own decision;
  - a text client in `src/tools/` that plays one witness through the front door, with the band, rough and end to end;
  - once feelings part one is in, a refusal can read a feeling ("still sore at you"): the first place a player acts on one.
- **S2, the front door's part two:** reads by viewer, `eventsAfter` and versions; then branching (an override named by event id, kept on the world); then save and load. Each is announced on #60 before it lands.
- **S3, content as data,** one `refactor` per file between rounds. `motives.ts` is done (#83); `setting.ts` is next, then `families.ts` once the wording round has merged.

### Page track: one round at a time

Each round claims an effect on how a page reads, so each is an experiment. None changes an act.

**G1. The wording round** (Next 2; exit 3).

- **What:** reasons worded by the expression chosen, from the table of 279 expression–facet pairs in `families.ts`, worst pairs and `backsong` first, until reach on held-out pages passes 50%. A history reason carries its event inside it.
- **Why not capped at 22 pairs:** they alone reach 43% of the 434 faulted lines, under the note's own stop at 50%.
- **Primary counter:** unfit reasons cited on the changed lines, on against off. The score cannot see it.
- **The last round on reasons:** if it stops or is not kept, reasons rest.

**The order:** G1, then N3, then G3, then G2. Selection is the one round whose reading would be steered by a model's taste for length, so it is read only after H1.

**G2. Selection** (exit 5), after H1.

- **What:** fold the town calendar into one line with its span, and drop the want echoes. They are the most-faulted repeats (4.8 and 5.5 per hundred readings), and the festival alone draws 19% of all repeat faults on file.
- **Expected:** copies fall from 21% to about 18%.
- **Primary counter:** the 15 most-faulted templates' occurrences; stop under half removed.
- **The score may move here.** Readers score sameness, but a shorter page costs 0.16 a ten lines (round 35). The pre-registration writes the predicted change for the lines lost, with or without that cost as H1 decides.

**G3. Particulars and callbacks** (exits 5 and 3).

- **What:** events carry a place, and an object where the setting has one, read from where the act already happens. There is no draw, so every act stays identical. A line recalls an earlier event by what it was.
- **Primary counter:** the share of named places and objects named again later in the same life; stop under a fifth. No clause may fail N3's check, and variety without callbacks does not pass.
- **Overstory** asked for places in the export, so the change is announced on #60 first.

### People track: one experiment at a time

| Round                                   | Mechanism                                                                                | Exits   | Triggers per world-decade                                                           | Primary counter                                                                                      | Depends on                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| **P1. Feelings, part one**              | grief, resentment, guilt, gratitude, each with an object; debts called in                | 1, 5, 8 | about 30 wrongs, 12 costly helps; deaths, splits, lost jobs                         | removing the feeling flips the family in ≥5% of decisions it is weighed in                           | N1a, N2, M39                     |
| **P4. Feelings meet their object**      | a held feeling or debt may raise a situation with its object: seek them out or keep away | 1, 2, 8 | P1's held feelings: resentment in 12.7% of adult-months, gratitude 9.0%, guilt 4.7% | the share of held feelings that meet their object within a year, and the flips there                 | P1 sized; its research           |
| **P2. Taking sides**                    | a friend of both sides chooses one, the other or neither                                 | 1, 2    | 3.9 rifts, 22.5 with friendships ending                                             | ≥15% of side-takings end or start a tie, or are cited by a weighty event, within 3 years (40 worlds) | N1b                              |
| **P3. Shared hardship**                 | a blow binds or splits the people it hits                                                | 2       | loss and support, 0.58 per 100 a month                                              | reach, 6% today, 15% needed                                                                          | P1's grief, P2; `environment.md` |
| **P6. The band year**                   | norms held in members' beliefs; each group's own row escalation                          | 9, 1, 8 | one band, a year                                                                    | at its research                                                                                      | S1                               |
| **P5. Wants for later life** (round 43) | doors past 65; more than one pursuit at a time                                           | 2       | nearly half of adults want nothing, mostly past 65                                  | turns in random lives                                                                                | N1b; P6                          |

**Waiting for Overstory's register to ask,** in no order: **P7. Secrets, with accounts** (any knower may expose, or hold it over the owner; 29.5 secret acts a world-decade, 3.1 told); **P8. A third person** (attraction that persists across a partnership; 12% of married partners doubting; after P7); **feelings' further kinds** (worry, shame, pride, envy, regret; keeping one's head; the illness that recurs and worsens, as worry's first pending threat). Each begins with its own research note.

**P1. Feelings, part one,** behind `OFF=feelings`, as `feelings-and-traits.md` proposes.

- **The mechanism.** A feeling has a kind, a cause, an object and an intensity, and fades unless renewed. It reweights, and may add its own family, in a situation involving its object. When it decides, it is the reason, worded with its object. Left unresolved, it becomes a lasting change.
- **Debts called in** belong here: resentment and gratitude give `owes` its job, and removing the random promise sits behind the same switch.
- **Repeats from acts** are measured here: the acts' 37% share of repeat faults.
- **What the reading should see:** the felt question, and a score-visible counter: kinds of line per busiest page, on against off. If P1 passes its counters but adds no kind of line, it has put new words in brackets on the same lives, and its outcome says so.
- **Exit 8:** adults carrying a lasting change by year 10.

**P4. Feelings meet their object,** the feelings arc's second and last round before it returns to research.

- **Why it comes second.** Each person meets at most one matched situation a month, the weightiest first (`src/situations/index.ts:104`). A feeling acts only in a situation with its object. So after a wrong, a resentment is weighed in 1.4% of decisions (round 44's sizing). The same holds for every round after it: a side not taken, a debt, a secret and a third person are all held across time and need the two people to meet.
- **The mechanism, for its research to test.** A held feeling or debt may raise a situation with its object. The holder goes to have it out, call the debt in, make amends or say thank you, or keeps away. It may also come as an answer queued for the object. Whether it arises depends on the feeling's intensity, whether its cause still stands, and the holder's own approach or avoidance (patience, forgiveness, anxiety, social boldness). It never depends on a timer, a count or a quota (section 2).
- **Its research note** (`notes/research/meeting.md`, one page) covers:
  - avoidance and revenge as motives, and how they fade (McCullough's forgiveness work);
  - how Crusader Kings' hooks and schemes, The Sims' wants and Dwarf Fortress's grudges bring two people together, and where each failed;
  - what the one-a-month rule protects: the scoreboard, couples' decisions and pages that are not noise. It may keep the rule and route through the queue.
- **Exit points:** 1 and 8, and 2 through what the meetings change.

**P2. Taking sides.** A friend of both sides decides by liking, regard, fairness and whose account came first. With P1 kept, the side not taken carries resentment toward a named person, and with P4 kept that resentment can seek its object. The witness must know at least 30% of these acts.

**P3. Shared hardship,** the reach arc's second and last round. Death is the template: 88% of deaths reach 4.1 people, and 62% lead to a turn. P1's grief gives the people a blow hits together their reason to draw closer or apart. At least 70% of new turns must have a cause on an earlier line. Its research is `notes/research/environment.md` (22 October): blackouts, storms, hard winters and places with qualities, as shared conditions that bind or split people.

**P6. The band year** comes before P5. Exit point 9 has not started, and every game the notebook names needs a group with a character of its own: a band, a club, a workplace. It is judged by counters (a group's character outlives its founders), which no reader is needed for.

**P5. Wants for later life.** Its random pack is reported first, since a turn in a quiet life is the one story feature the reading sees. Its research reads what P6 gave the quiet majority first: a group is a door at any age.

**Branches.**

- **P1:** kept → P4. Not kept with the four kinds under 5% → P4's research still runs, since round 44 names the cause (feelings rarely meet their object), and it says whether P4 builds on P1's code with feelings on or feelings go back to research. Not kept for any other reason → feelings go back to research, and P2 runs with liking and trust alone.
- **P4:** whatever its outcome, P2 follows, and the feelings arc returns to research.
- **P2 and P3 are one arc:** P3 runs whatever P2's outcome.
- **Stop rule:** if P1, P4 and P2 all keep nothing (section 3's meaning), the people track stops. Phase C then starts with the engine as it is, and the page track carries on. A milestone that reads worse pauses the track instead (section 3).

### Files, and when each track starts

The page track claims `grammar.ts`, `page.ts`, `motives.json` and the words in `families.ts`.

- **P1 writes its feelings' words in its own module and data,** never `grammar.ts`. Its one line in `families.ts` (`onlyIf: job` on `work`, written in BOARD) is rebased after G1.
- **P1's research is done,** so its build and sizing start once N1a lands, without waiting for G1. Only its reading waits for G1 to merge, so that its off arm carries G1's words.
- **S1 and S2** stay in `boundary.ts` and `src/tools/` while a round is open.

### Each round's reach on the exit criterion

| Exit point                                    | Moved by                                           | Today                    |
| --------------------------------------------- | -------------------------------------------------- | ------------------------ |
| 1. Close ties with an inner life              | P1, P4, P2, P6                                     | partners and rivals only |
| 2. Weighty events change something, and reach | P1, P4, P2, P3, P5                                 | reach 6%, needed 15%     |
| 3. Nothing false on a page                    | G1, N3, G3                                         | open: unfit reasons      |
| 5. Outsiders find lives worth reading         | H2 judges it; H1 checks the instrument; G2, G3, P1 | no outsider since Q3     |
| 8. Living changes people                      | P1, P4, P6                                         | about 3% of the distance |
| 9. A group outlives its members               | P6                                                 | not started              |

Points 4, 6 and 7 are held: the scoreboard gate guards 6, and refitting the city's odds after each kept people round guards 7.

### Overstory's register, and phases C and D

- **The register** from Overstory's paper playtests is coming (#60, 21 October). Each request is placed by its layer: an engine capability joins its round, the front door or export joins S1 or S2, content joins S3. A domain or presentation stays Overstory's.
- **It may pull one arc forward** by Øystein's choice, never displacing an open round. P7 is likeliest: their panel leads with the paper and a mystery. What we take is recorded in SUMMARY.
- **H2, the human test, at phase C's gate:** at least five outsiders read cold, on random lives of the engine to be built on, by exit point 5's bar, with the felt question. A milestone pack is the material. Only Øystein can find the readers, and they are cold only once.
- **Phase C, the first game,** is chosen once the register is in and exit points 1, 2 and 9 are close, or once the stop rule fires, and after H2. Built for it then: the pack format with its Rule 8 closure, the town as `packs/town`, an unlike test pack in CI, and the music domain behind its interface.
- **Phase D, as games ask:** time and moments, crime, inheritance with homes (#59), fame as reach. Each is an arc of research and at most two rounds.

## 5. What "built properly" means, and costs

**Built properly.** The engine is built properly when:

- a new game needs a pack, a domain module and a front end, and no engine rule changes;
- an unlike pack runs in CI;
- every mechanism moves an exit point;
- the city runs on the same people.

Engine, world pack, domain module and content are separate layers. The repo structure is the first plan's (`cccad45`, section 3): packs and `domains/music` are made in phase C, for the chosen game.

**Costs.**

- **Per round:** a sitting costs about $4, so a page round's reading is about $20 and a people round's about $40, plus $40 for a miss's extra pack. M39 costs about $24, once.
- **For the rounds ordered here** (P1, P4, P2, P3, P6, P5, G3, G2, and two milestones): about $360 if all are read, about $260 if a third stop at sizing, as round 42 did. H1 costs no credits, and N3 and the neutral jobs need no reading.
- **Throughput:** two tracks about double the rate of rounds, once P1's build runs beside G1.
- **When credits are short,** as from 22 October while Overstory comes first: research, sizing and neutral jobs go on, and readings wait. A round sized and reviewed can wait at its pre-registration without losing anything.

**What not to build:** a director or any pacing; a clock shorter than a month; domain systems in the engine; a live language model; a reputation score; a meter shown to the player.

## 6. Decisions, taken

On 22 October Øystein left the decisions to the lead session ("you do what you think is best. analyse before you continue"). Each was checked again and taken as below. Any of them is his to reverse in one dated line in `SUMMARY.md`.

1. **Two tracks, feelings first.** This reverses the first plan's rule of no page round until a people round is kept.
2. **The bar:** −0.3 on the one-sided 95% bound; 48 pairs for people rounds, 24 on the same lives for page rounds. A miss with a passed counter buys one more pack.
3. **"Next":**

   1. the wording round (G1);
   2. feelings part one (P1), built now and read after G1;
   3. the human test.

   Then selection, taking sides, shared hardship, particulars and callbacks, feelings part two, round 43, homes with the front door's part two, and the band year. Beside any: N1a first, then N2, M39 and S1.

4. **The felt question (M39)** goes in the brief, as a check, calibrated on round 40 and the planted pack.
5. **The human test by 12 November** (superseded: by Øystein the same day, after taking sides; then by the second pass, decision 12): at least five outsiders, part of round 40's busiest pack, exit point 5's bar, with the felt question. Only Øystein can find the readers.
6. **The wording round is not capped at 22 pairs,** since they reach 43% of faulted lines, under the note's own 50% stop. It words pairs worst first until reach on held-out pages (round 41's) passes the stop, up to the full table of 279. Its design job settles the number.
7. **The reviewer stays on Fable 5.1.** Sonnet is cheaper, but quality decides the model, and the reviewer is what stops a failed round before it costs a reading.
8. **The repo structure** of the first plan, with packs made in phase C.
9. **The register may pull one arc forward,** P7 likeliest, never displacing an open round.

**Second pass, the evening of 22 October.** Øystein asked for a deep analysis of the plan, and for when a human reading is really needed; then "do your thing". Each decision is his to reverse in one dated line in `SUMMARY.md`.

10. **Feelings meet their object (P4) comes second,** and replaces feelings part two's new kinds. Round 44 found a resentment weighed in 1.4% of decisions after the wrong. The cause is in the scheduler: one matched situation a person a month (`src/situations/index.ts:104`). Every later round is a tie held across time, so this is the bottleneck. More kinds of feeling would add more of what cannot act.
11. **Readers judge less; counters judge more.** Section 0 sets where people must read. The model reading guards against harm and never keeps a round. Aimed packs replace the busiest where a round touches under a third of its pages, and milestone readings say whether lives read better across rounds.
12. **The human test splits in two.** H1 is a pair page that Øystein and readers who are not cold can use at no credit cost, and it gates selection. H2, the cold outsiders, waits for phase C's gate, because a cold reader is spent once. Nothing in the people track waits for either.
13. **Selection (G2) moves last on the page track,** after H1. Its predicted cost for a shorter page rests on a preference that judges built on language models are known to have for length.
14. **The band year (P6) moves before wants for later life (P5).** Exit point 9 has not started, every game named needs groups, a group is a door for the quiet majority, and counters judge it.
15. **Secrets, a third person and feelings' further kinds wait** for Overstory's register to ask. They need P4's meetings first, and each is rare (3.1 secrets told a world-decade).
16. **The gate gets a fallback when GitHub refuses CI** (CLAUDE.md): it has refused jobs for billing in rounds 37 and 39, and again on 22 October.

**Carried unchanged from the first plan:**

- content as data, one file at a time between rounds;
- branching as a neutral job;
- the band as the slice, with the first command first in #22;
- the density count in the battery, never a target.
