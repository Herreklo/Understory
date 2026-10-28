# Building the engine: the plan

_Rewritten 22 October 2026 around three research notes: `notes/research/feelings-and-traits.md`, `language.md` (PR #85) and `intriguing-lives.md` (PR #86). Also drawn on: `wording.md` (PR #78, a draft), `reasons.md` and `reports/density-22oct.md`. Øystein agreed the outline that day: two tracks, feelings first, and the bar in section 3. A pre-mortem by the `reviewer` agent (Fable 5.1) followed; its findings are answered here and listed on PR #82. Øystein then left the remaining decisions to the lead session; section 6 records them. The first version, with its file-by-file audit of the engine, is commit `cccad45`._

_Second pass, the evening of 22 October. Øystein asked for a deep analysis of the plan, and for when a human reading is really needed. Three findings changed the order, and section 6 records them under "Second pass":_

- _Round 44's sizing shows feelings rarely meet their object. A resentment is held in 12.7% of adult-months but weighed in 1.4% of all decisions, about 25 times a world-decade against about 30 wrongs. A feeling weighs only when a situation happens to bring its object (`bearing()` in `feelings.ts`), and no situation is ever raised by one: each matcher picks its counterpart without reading a feeling, while a strong resentment halves every three months._
- _Six of the nine exit points are judged by counters alone; two more end with a reader's clause, and one is people by definition._
- _The one decision the reader's taste would steer is selection._

_A review by a fresh Fable 5.1 agent followed (3 blocking findings, 12 others; summarised on PR #92). Its blocking findings are fixed here: the cause above, aimed packs picked over both arms, and the exit points counted right._

_Third pass, agreed with Øystein on 22 October and written on 26 October, when Understory resumed. Shown H1's pair page, he found a cold page of a stranger's life uninvolving, as his pilot reading and Q3's two readers had: "like reading a police log of daily life". Players care about people through a stake of their own, as in Crusader Kings, RimWorld, Football Manager and The Sims. So human evidence comes from play, H1 is retired, and exit point 5 is about players. Section 6 records this as decisions 18 to 22, with P3's counter and the review of `2d696e6` (`reports/external/2026-10-22-review-2d696e6-dispositions.md`)._

## 0. Where people must play, and where they need not

**People are needed in two places, and they play there rather than read.** A cold page of a stranger's life tests none of what a game needs: a player cares about people through a stake of their own (their person, their circle, what their acts led to).

1. **To close exit point 5,** which is people by definition: players come to care about the people around them. Overstory's playtests are the first evidence. The slice (S1) is next: the text client through the front door, played by Øystein and people who know the project, once feelings part one gives a refusal that reads a feeling. What they say they cared about, about whom and why, goes in `reports/`, with no pass mark. H2, five outsiders playing cold at phase C's gate, judges it.
2. **Before a reader's taste steers a design.** Selection (G2) decides what the page shows. In round 35, model readers chose the longer page 70% of the time, and judges built on language models are known to prefer longer answers (Zheng et al. 2023; Saito et al. 2023). What players skip and what they ask to see answers it better, so G2 waits for the slice to have been played.

**Everything else needs no person.** Exit points 1, 2, 3, 6, 7 and 8 are judged by counters: decisions flipped, reach and links, faults on the page, the scoreboard, the city's budget and lasting change. Points 4 and 9 are judged by counters too (dead lives; a group's character surviving its founders), and each ends with a reader's clause: saying who four of five people are, or what four of five groups are like, in one sentence. The model readers answer those clauses between rounds, as they did for point 4 in rounds 24a–24c, and H2's players answer them once. **The model reading guards each round against harm, and is never the reason to keep one.** CLAUDE.md forbids keeping a round on "reads better" until people have read; here that means until people have played. The work any game needs regardless is the same work: ties with an inner life, consequences that travel, groups, places and homes, the front door's second part, content as data, the city. Section 4 orders it first.

## 1. In short

Øystein's pilot reading found lives samey and feelings unspoken. The notes say why:

- **Feelings are decoration.** No act reads any of the 41 kinds written.
- **The page repeats.** 21% of lines are copies, two thirds of them from routine shown every time.
- **The reading scores kinds of line and life turns,** not story features (`intriguing-lives.md`).
- **Situations are pairs settled within the month.** Sides, debts, secrets others know and a third person are missing.

The answer is two tracks of rounds and one of plumbing:

- **People track,** one experiment at a time: feelings part one; feelings meet their object; taking sides; shared hardship; the band year; wants for later life. Secrets with accounts, a third person and feelings' further kinds wait for Overstory's register to ask for them.
- **Page track,** beside it, on page files only: the wording round; every clause carrying its IDs (N3); particulars and callbacks; then selection, once people have played the slice (S1).
- **Neutral jobs** beside both, the measures and the guard first.

Every round has one primary counter, which can fail it. The reading checks "reads no worse".

## 2. The guard: storiness must not become scripting

A hard rule for every round and every neutral change.

1. **What is forbidden.** No engine rule reads a story measure, a density rate, a count of events across the town or the page, or anything under `src/tools/`. A count of a person's own past events may scale a weight or a feeling: habituation, or a grudge renewed on meeting. It may never gate whether an event of that kind can happen. A cap, a quota or a cooldown on a kind of event is pacing, whoever holds the count.
2. **What main already does.** `src/social.ts:503` caps how many people one can come to dislike (`tried['dislikes'].n < 3`). `lastProvoked` (`src/world.ts:253`) is a timer field with no reader, and N2 cuts it. The scheduler gives each actor at most one matched situation a month, the weightiest first (`src/situations/index.ts:104`), and the spotlight waits 18 months between tries (`index.ts:56`). All four are grandfathered and listed for review. The rule binds every new reader, and no feelings round changes the scheduler: that would be its own change.
3. **How CI enforces it.** An import test fails if a module outside `src/tools/` imports from it. A lint flags new `tried[…].n` thresholds, `.events.filter(…).length` comparisons and new `last*` fields outside the tools, the page and the front door. A flagged line needs a one-line justification the reviewer accepts.
4. **What a round that raises drama must name.** Drama here means more rifts, exposures, feuds or turns. The pre-registration names the state in people that produces it. Its parameters come from that state and are never tuned toward a story or density number. The soap checks are stops, never targets.
5. **The reviewer's seventh question:** does any new reader read a count, a rate or a measure instead of a person?
6. **No director.** Lulls are accepted. The page chooses what to show; the engine never chooses what happens for the page's sake.

## 3. How rounds are judged

**The bar (agreed).** "Reads no worse" holds when the one-sided 95% lower bound of the effect, with order as a term, is above −0.3. People rounds are read on 48 pairs, one random pack and one busiest, pooled with the pack as a term. Page rounds are read on 24 pairs of the same lives, as M38's planted pack was. "Reads better" is reported and never judged until H2.

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

**Packs aimed at the change.** Some people rounds touch under a third of the busiest pages; round 44's feelings decide a line on 23.6% ±11.4 of them. For such a round, the busiest pack may give way to an aimed pack, if the pre-registration says so. The aimed pack holds lives where the round's trigger (a death or a wrong for feelings, a rift for taking sides) falls in the present years of **both** arms, ranked by the trigger's count summed over both, as `pairarm.ts` ranks eventfulness. Picking on one arm would make that arm the more eventful and lean the reading toward it. The rule is written in the pre-registration with the number of candidate lives it leaves, and the random pack stays as the guard for the quiet majority. The cost is unchanged: 24 pairs each, pooled with the pack as a term. Aimed scores are never compared across rounds. `reading.md` describes the aimed pack before any round uses one.

**Milestone readings.** No round's reading can see a small effect, and several can add up to one. Every third kept people round, and before H2, main is read against the tag from three kept rounds earlier: 48 pairs, one random pack and one busiest, on the reader roles and brief of the day, about $40. It is the only reading that says whether lives read better than they did.

- **It needs a tool first (N4):** `pairarm.ts` builds both arms from one tree with a switch; a milestone builds the same seeds from two tags and matches people across them.
- **It measures everything merged since its base,** both tracks and neutral changes alike. A milestone that reads worse, with the one-sided bound below −0.3, holds both tracks' next readings until the cause is placed, by reading the tags in between against each other.
- **A milestone that reads better** is reported, and keeps nothing on its own. Both arms are read under today's brief, so it is never set beside a past round's own effect.
- The first milestone follows the next kept people round, once N4 exists. Its base is tag `r39`, since rounds 40 and 41 have been kept since then.

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
  - _Done 27 Oct (#101): baseline in `reports/n1b-baseline.md`. The record keeps the chain: 88% of wants a blow opened and met cite it, so no engine change. The 3% is that few blows open a want._
- **N2, cleanups** (`refactor`, then `words`): cut `selfBias` and `lastProvoked`; name the secret in "carrying something nobody knew"; say who the dead person was to the subject; give the habit line its job-loss event.
- **M39, the felt question,** before feelings part one is read: about six sittings, once.
- **H1, the pair page, is retired** (decision 18). Its tool stays in `study/` unused, and goes in the next cleanup.
- **N4, the milestone tool:** builds the same seeds at two tags in two worktrees, matches adults across them by name and birth as `pairarm.ts` does across arms, and writes a pack with its key and both commits in `meta.json`.
- **The gate when GitHub refuses CI's jobs** (billing, as in rounds 37 and 39 and on 22 October, and a re-run is refused too): every CI check runs locally on the PR's merge with main, a second agent re-runs the identity check on that commit, and the output is committed to `reports/`. CLAUDE.md's gate says how.
- **N3, every clause carries its IDs:** CI fails a clause with no event behind it. Also a Rule 8 lint over a rendered world, a frame render over random states, a model-tics list and one pseudo-localised pass. It touches `grammar.ts` and `page.ts`, so it runs between page rounds.
- **S1, the first command and the slice** (the command and the client are on main, #88):
  - #22's first command, an invitation answered by the other person's own decision;
  - a text client in `src/tools/play.ts` that plays one witness through the front door, with the band, rough and end to end;
  - once feelings part one is in, a refusal can read a feeling ("still sore at you"): the first place a player acts on one;
  - **then people play it** (section 0): Øystein and people who know the project, about an hour each, no credits. Each says whom they came to care about and why, and what they skipped. It is written in `reports/`, with no pass mark.
- **S2, the front door's part two:** reads by viewer, `eventsAfter` and versions; then branching (an override named by event id, kept on the world); then save and load. Game-facing reads are scoped to a viewer by default; the truth is a separate, privileged read a game asks for by name; a command says whom the caller acts as (the review of `2d696e6`). Each is announced on #60 before it lands.
- **N5, the front door's checks** (`refactor` for the town, announced on #60): `invite.what` is checked; `advance` takes a positive whole number of months; an unknown kind is refused with its reason; worlds are held in a `WeakMap` behind an opaque handle, not a cast.
- **N6, hearsay cited where it decided** (`words`): `citeFlip` (`src/telling.ts`) cites a flipped account on any event between the two people that month. First count how often that is not the flipped decision, then key the citation to the decision. Raised by the reviews of `bffdb33` and `2d696e6`.
- **N7, the identity sees explanations** (CI only): a `refactor` is also checked with `event.explain` and each person's event index in the signature, which leaves them out so that a `words` change may alter them. Raised by the review of `9204298`.
- **S3, content as data,** one `refactor` per file between rounds. `motives.ts` is done (#83); `setting.ts` is next, then `families.ts` once the wording round has merged.

### Page track: one round at a time

Each round claims an effect on how a page reads, so each is an experiment. None changes an act.

**G1. The wording round** (Next 2; exit 3).

- **What:** reasons worded by the expression chosen, from the table of 279 expression–facet pairs in `families.ts`, worst pairs and `backsong` first, until reach on held-out pages passes 50%. A history reason carries its event inside it.
- **Amended 22 October (its design, #89):** the cells (act, facet, pole, form) are fixed by a rule on null and r40, three or more unfit faults, and round 41's pages are consulted once. Iterating to a held-out target would make those pages in-sample. 44 cells reach 64% of the 434, 60% held out (`reports/43w-size.md`). History reasons wait for G3: they are faulted at the base rate, and a reason that recalls an event is G3's callback.
- **Why not capped at 22 pairs:** they alone reach 43% of the 434 faulted lines, under the note's own stop at 50%.
- **Primary counter:** unfit reasons cited on the changed lines, on against off. The score cannot see it.
- **The last round on reasons:** if it stops or is not kept, reasons rest.

**The order:** G1, then N3, then G3, then G2. Selection is the one round whose design a model's taste for length would steer, so it waits until people have played the slice.

**G2. Selection** (exit 5), after the slice is played.

- **What:** fold the town calendar into one line with its span, and drop the want echoes. They are the most-faulted repeats (4.8 and 5.5 per hundred readings), and the festival alone draws 19% of all repeat faults on file.
- **Expected:** copies fall from 21% to about 18%.
- **Primary counter:** the 15 most-faulted templates' occurrences; stop under half removed.
- **The score may move here.** Readers score sameness, but a shorter page costs 0.16 a ten lines (round 35). The pre-registration writes the predicted change for the lines lost with that cost and without it, and what players skipped in the slice says which to expect.

**G3. Particulars and callbacks** (exits 5 and 3).

- **What:** events carry a place, and an object where the setting has one, read from where the act already happens. There is no draw, so every act stays identical. A line recalls an earlier event by what it was.
- **Primary counter:** the share of named places and objects named again later in the same life; stop under a fifth. No clause may fail N3's check, and variety without callbacks does not pass.
- **Overstory** asked for places in the export, so the change is announced on #60 first.

### People track: one experiment at a time

| Round                              | Mechanism                                                                                | Exits   | Triggers per world-decade                                                           | Primary counter                                                                                                                                    | Depends on                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **P1. Feelings, part one**         | grief, resentment, guilt, gratitude, each with an object; debts called in                | 1, 5, 8 | about 30 wrongs, 12 costly helps; deaths, splits, lost jobs                         | removing the feeling flips the family in ≥5% of decisions it is weighed in                                                                         | N1a, N2, M39                             |
| **P4. Feelings meet their object** | a held feeling or debt may raise a situation with its object: seek them out or keep away | 1, 2, 8 | P1's held feelings: resentment in 12.7% of adult-months, gratitude 9.0%, guilt 4.7% | of held feelings at 0.3 or more, the share that change an act toward their object within a year; about 4% expected, stop under 2.5% (`meeting.md`) | round 44's code, folded in (decision 23) |
| **P2. Taking sides**               | a friend of both sides chooses one, the other or neither                                 | 1, 2    | 3.9 rifts, 22.5 with friendships ending                                             | ≥15% of side-takings end or start a tie, or are cited by a weighty event, within 3 years (40 worlds)                                               | N1b                                      |
| **P3. Shared hardship**            | a blow binds or splits the people it hits                                                | 2       | loss and support, 0.58 per 100 a month                                              | help acts that lead somewhere within three years; stop under 15%, about 20% expected; reach beside it                                              | P1's grief, P2; `environment.md`         |
| **P6. The band year**              | norms held in members' beliefs; each group's own row escalation                          | 9, 1, 8 | one band, a year                                                                    | at its research                                                                                                                                    | S1                                       |
| **P5. Wants for later life**       | doors past 65; more than one pursuit at a time                                           | 2       | nearly half of adults want nothing, mostly past 65                                  | turns in random lives                                                                                                                              | N1b                                      |

**Waiting for Overstory's register to ask,** in no order: **P7. Secrets, with accounts** (any knower may expose, or hold it over the owner; 29.5 secret acts a world-decade, 3.1 told); **P8. A third person** (attraction that persists across a partnership; 12% of married partners doubting; after P7); **feelings' further kinds** (worry, shame, pride, envy, regret; keeping one's head; the illness that recurs and worsens, as worry's first pending threat). Each begins with its own research note.

**P1. Feelings, part one,** behind `OFF=feelings`, as `feelings-and-traits.md` proposes.

- **The mechanism.** A feeling has a kind, a cause, an object and an intensity, and fades unless renewed. It reweights, and may add its own family, in a situation involving its object. When it decides, it is the reason, worded with its object. Left unresolved, it becomes a lasting change.
- **Debts called in** belong here: resentment and gratitude give `owes` its job, and removing the random promise sits behind the same switch.
- **Repeats from acts** are measured here: the acts' 37% share of repeat faults.
- **What the reading should see:** the felt question, and a score-visible counter: kinds of line per busiest page, on against off. If P1 passes its counters but adds no kind of line, it has put new words in brackets on the same lives, and its outcome says so.
- **Exit 8:** adults carrying a lasting change by year 10.

**P4. Feelings meet their object,** the feelings arc's second and last round before it returns to research.

- **Why it comes second.** Resentment, guilt and gratitude weigh only in a situation whose counterpart is their object (`bearing()` in `feelings.ts`; grief weighs in any). Each matcher picks its counterpart without reading a feeling, and a strong resentment halves every three months. So a resentment held in 12.7% of adult-months is weighed in 1.4% of all decisions (round 44's sizing). The scheduler is not the cause: an adult makes about three decisions a year against a cap of twelve. The same gap faces every round after it: a side not taken, a debt, a secret and a third person are all held across time and need the two people to meet.
- **The mechanism, for its research to test.** A held feeling or debt may raise a situation with its object. The holder goes to have it out, call the debt in, make amends or say thank you, or keeps away. It may also come as an answer queued for the object. Whether it arises depends on the feeling's intensity, whether its cause still stands, and the holder's own approach or avoidance (patience, forgiveness, anxiety, social boldness). It never depends on a timer, a count or a quota (section 2). A feeling's monthly fade is its own state, not a timer. A raised situation's weight decides whether it wins the actor's month, so the weight comes from the feeling's intensity and is never tuned.
- **Its research note** (`notes/research/meeting.md`, one page) covers:
  - avoidance and revenge as motives, and how they fade (McCullough's forgiveness work);
  - how Crusader Kings' hooks and schemes, The Sims' wants and Dwarf Fortress's grudges bring two people together, and where each failed;
  - how often a raised meeting would displace the situation it competes with for the month, and whether the queue is the better door.
- **Exit points:** 1 and 8, and 2 through what the meetings change.

**P2. Taking sides.** A friend of both sides decides by liking, regard, fairness and whose account came first. With P1 kept, the side not taken carries resentment toward a named person, and with P4 kept that resentment can seek its object. The witness must know at least 30% of these acts.

**P3. Shared hardship,** the reach arc's second and last round. Death is the template: 88% of deaths reach 4.1 people, and 62% lead to a turn. P1's grief gives the people a blow hits together their reason to draw closer or apart. At least 70% of new turns must have a cause on an earlier line. Its research is `notes/research/environment.md` (22 October): blackouts, storms, hard winters and places with qualities, as shared conditions that bind or split people. Its primary counter is the link rate, not reach: the share of help and no-help acts that lead to a tie begun or ended, a move, money, a want or a turn within three years. The note expects about 20% and stops under 15%. Reach goes beside it: a condition's help stays between helper and helped, so reach would move only from 6.7% to about 6.5% in a round that works.

**P6. The band year** comes before P5. Exit point 9 has not started, and every game the notebook names needs a group with a character of its own: a band, a club, a workplace. Its counter is a group's character outliving its founders; the clause about naming groups is read as section 0 says.

**P5. Wants for later life.** Its random pack is reported first, since a turn in a quiet life is the one story feature the reading sees. It is the one people round that reaches the random pack, where exit point 2 is farthest off, and putting P6 first makes it wait one round longer.

**Branches.**

- **P1's counter is the four kinds alone** (5.0% at sizing); the debt's flips are reported beside it. Settled here, before the pre-registration, so the choice cannot follow the sizing's numbers.
- **P1:** kept → P4. Not kept with the four kinds under 5% → P4's research still runs, since round 44 names the cause (feelings rarely meet their object), and it says whether P4 builds on P1's code with feelings on or feelings go back to research. Round 44 stopped at its sizing on 26 October (4.95%), and decision 23 folds its code into P4. Not kept for any other reason → feelings go back to research, and P2 runs with liking and trust alone.
- **P4:** whatever its outcome, P2 follows, and the feelings arc returns to research.
- **P2 and P3 are one arc:** P3 runs whatever P2's outcome.
- **Stop rule:** if P1, P4 and P2 all keep nothing (section 3's meaning), the people track stops. Phase C then starts with the engine as it is, and the page track carries on. A milestone that reads worse pauses the track instead (section 3).

### Files, and when each track starts

The page track claims `grammar.ts`, `page.ts`, `motives.json` and the words in `families.ts`.

- **P1 writes its feelings' words in its own module and data,** never `grammar.ts`. Its one line in `families.ts` (`onlyIf: job` on `work`, written in BOARD) is rebased after G1.
- **P1's research is done,** so its build and sizing start once N1a lands, without waiting for G1. Only its reading waits for G1 to merge, so that its off arm carries G1's words.
- **S1 and S2** stay in `boundary.ts` and `src/tools/` while a round is open.

### Each round's reach on the exit criterion

| Exit point                                    | Moved by                                             | Today                    |
| --------------------------------------------- | ---------------------------------------------------- | ------------------------ |
| 1. Close ties with an inner life              | P1, P4, P2, P6                                       | partners and rivals only |
| 2. Weighty events change something, and reach | P1, P4, P2, P3, P5                                   | reach 6%, needed 15%     |
| 3. Nothing false on a page                    | G1, N3, G3                                           | open: unfit reasons      |
| 4. Few dead lives, and each one sayable       | held; H2 re-asks its reader's clause                 | dead 2%; 9–10 of 12 said |
| 5. Players care about the people around them  | played tests: Overstory's, the slice, H2; G2, G3, P1 | no one has played yet    |
| 8. Living changes people                      | P1, P4, P6                                           | about 3% of the distance |
| 9. A group outlives its members               | P6; its reader's clause at H2                        | not started              |

Points 6 and 7 are held: the scoreboard gate guards 6, and refitting the city's odds after each kept people round guards 7.

### Overstory's register, and phases C and D

- **The register** from Overstory's paper playtests is coming (#60, 21 October). Each request is placed by its layer: an engine capability joins its round, the front door or export joins S1 or S2, content joins S3. A domain or presentation stays Overstory's.
- **It may pull one arc forward** by Øystein's choice, never displacing an open round. P7 is likeliest: their panel leads with the paper and a mystery. What we take is recorded in SUMMARY.
- **H2, the human test, at phase C's gate:** at least five outsiders play cold, as a person in a town of the engine to be built on, through the slice or Overstory's build of the day, by exit point 5's bar. They also give points 4 and 9's sentences about the people and groups they met. Only Øystein can find the players, and they are cold only once. If none are found by phase C's gate, the game is chosen without H2, and exit point 5 stays open.
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
- **For the rounds ordered here** (P1, P4, P2, P3, P6, P5, G3, G2, and two milestones): about $360 if all are read, about $240 if a third stop at sizing, as round 42 did. G1's reading and M39 are outside that sum. Played tests cost no credits, and N3 and the neutral jobs need no reading.
- **Throughput:** two tracks about double the rate of rounds, once P1's build runs beside G1.
- **When credits are short,** as from 22 to 26 October, when Øystein put the credits on Overstory: research, sizing and neutral jobs go on, and readings wait. A round sized and reviewed can wait at its pre-registration without losing anything.

**What not to build:** a director or any pacing; a clock shorter than a month; domain systems in the engine; a live language model; a reputation score; a meter shown to the player.

## 6. Decisions, taken

On 22 October Øystein left the decisions to the lead session ("you do what you think is best. analyse before you continue"). Each was checked again and taken as below. Any of them is his to reverse in one dated line in `SUMMARY.md`.

1. **Two tracks, feelings first.** This reverses the first plan's rule of no page round until a people round is kept.
2. **The bar:** −0.3 on the one-sided 95% bound; 48 pairs for people rounds, 24 on the same lives for page rounds. A miss with a passed counter buys one more pack.
3. **"Next"** (superseded by the second pass, decisions 10, 12, 13 and 14):

   1. the wording round (G1);
   2. feelings part one (P1), built now and read after G1;
   3. the human test.

   Then selection, taking sides, shared hardship, particulars and callbacks, feelings part two, round 43, homes with the front door's part two, and the band year. Beside any: N1a first, then N2, M39 and S1.

4. **The felt question (M39)** goes in the brief, as a check, calibrated on round 40 and the planted pack.
5. **The human test by 12 November** (superseded: by Øystein the same day, after taking sides; then by the second pass, decision 12): at least five outsiders, part of round 40's busiest pack, exit point 5's bar, with the felt question. Only Øystein can find the readers.
6. **The wording round is not capped at 22 pairs,** since they reach 43% of faulted lines, under the note's own 50% stop. It words pairs worst first until reach on held-out pages (round 41's) passes the stop, up to the full table of 279. Its design job settles the number.
   _Amended 22 October by the round's design (#89):_ the cells are fixed by a rule on in-sample pages and round 41's consulted once, so held-out reach is a check, not a target: 44 cells, 60% held out. Its reading needs 48 pairs on the same lives, not decision 2's 24: 24 pairs see half the drop 71% of the time, 48 pairs 94%.
7. **The reviewer stays on Fable 5.1.** Sonnet is cheaper, but quality decides the model, and the reviewer is what stops a failed round before it costs a reading.
8. **The repo structure** of the first plan, with packs made in phase C.
9. **The register may pull one arc forward,** P7 likeliest, never displacing an open round.

**Second pass, the evening of 22 October.** Øystein asked for a deep analysis of the plan, and for when a human reading is really needed; then "do your thing". Each decision is his to reverse in one dated line in `SUMMARY.md`.

10. **Feelings meet their object (P4) comes second,** and replaces feelings part two's new kinds. Round 44 found a resentment held in 12.7% of adult-months weighed in 1.4% of all decisions, because no situation is raised by a feeling: matchers pick counterparts without reading one. Every later round is a tie held across time, so this is the missing piece. More kinds of feeling would add more of what cannot act.
11. **Readers judge less; counters judge more.** Section 0 sets where people must read. The model reading guards against harm and never keeps a round. Aimed packs, picked over both arms, may replace the busiest where a round touches under a third of its pages, and milestone readings, once N4 exists, say whether lives read better across rounds.
12. **The human test splits in two** (H1 superseded by decision 18). H1 is a pair page that Øystein and readers who are not cold can use at no credit cost, and it gates selection. H2, the cold outsiders, waits for phase C's gate, because a cold reader is spent once. Nothing in the people track waits for either.
13. **Selection (G2) moves last on the page track,** after H1 (now after the slice is played, decision 18). Its predicted cost for a shorter page rests on a preference that judges built on language models are known to have for length.
14. **The band year (P6) moves before wants for later life (P5).** Exit point 9 has not started, and every game named needs groups. The cost is that the quiet majority, where exit point 2 is farthest off, waits one round more.
15. **Secrets, a third person and feelings' further kinds wait** for Overstory's register to ask. They need P4's meetings first, and each is rare (3.1 secrets told a world-decade).
16. **The gate gets a fallback when GitHub refuses CI** (CLAUDE.md): it has refused jobs for billing in rounds 37 and 39, and again on 22 October. The fallback runs every CI check, and a second agent re-runs the identity check, so the gate keeps an independent check.
17. **Homes wait for phase D,** as games ask (#59, #22); they are not in the people track's order.

**Third pass, agreed 22 October, written 26 October** when Understory resumed. Each is his to reverse in one dated line in `SUMMARY.md`.

18. **People play; they do not read cold pages.** H1 is retired. Human evidence comes from Overstory's playtests, then the slice (S1) played by Øystein and people who know the project, then H2's outsiders playing at phase C's gate. The model reading is a guard against harm only. G2 waits for the slice to have been played.
19. **Exit point 5 becomes "players care about the people around them"** (`docs/STATUS.md`): a player can say who the people around their person are to them and why they acted, and wants to see what they do next.
20. **P3's primary counter is the link rate,** with reach beside it (`environment.md`). Reach measures spread, and a round that works would leave it near 6.5%.
21. **A game may author a cause of its own domain or setting,** recorded as an event with its reasons through the front door; people answer it through their own decisions. No game decides a person's act or its outcome (`notes/game-shapes.md`, rule 4; the review of `2d696e6`).
22. **Every external review gets a disposition table** in `reports/external/` when it is filed. The review of `bffdb33` had none, and its hearsay finding went unslotted for a week. Both reviews are now disposed: N5 and N6 come from them, and S2 takes the sharper rule on reads.

**After round 44, 26 October.** Øystein's decision, in chat: "Yes, fold round 44's code into P4 as one round."

23. **Round 44's code folds into P4: one round, one switch (`feelings`), one primary counter.** P1 is not read alone and is not started again. This replaces the branch that let P4 carry P1's code only if P1 read no worse on its own. Round 44 failed its counter and makes no claim of its own: it is P4's ground, not a part of a bundle, and P4 is the arc's first full round. A reading of P1 alone could not have seen it (0.29 lines a busiest page). The counter is the research's (`notes/research/meeting.md`): of held feelings at 0.3 or more, the share that change an act toward their object within a year, 0.9% today, about 4% expected, and a stop under 2.5%. Round 44's own counter is reported beside it. Before P4's sizing, a neutral change runs `npm test`'s demography check on 24 worlds with its bar unchanged: on six, the off arm alone fails one block in four.

**Carried unchanged from the first plan:**

- content as data, one file at a time between rounds;
- branching as a neutral job;
- the band as the slice, with the first command first in #22;
- the density count in the battery, never a target.
