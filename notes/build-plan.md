# Building the engine: the plan

_Rewritten 22 October 2026 around three research notes: `notes/research/feelings-and-traits.md`, `language.md` (PR #85) and `intriguing-lives.md` (PR #86). Also drawn on: `wording.md` (PR #78, a draft), `reasons.md` and `reports/density-22oct.md`. Øystein agreed the outline that day: two tracks, feelings first, and the bar in section 3. A pre-mortem by the `reviewer` agent (Fable 5.1) followed; its findings are answered here and listed on PR #82. The plan proposes; "Next" in `SUMMARY.md` changes only when Øystein says so. The first version, with its file-by-file audit of the engine, is commit `cccad45`._

## 1. In short

Øystein's pilot reading found lives samey and feelings unspoken. The notes say why:

- **Feelings are decoration.** No act reads any of the 41 kinds written.
- **The page repeats.** 21% of lines are copies, two thirds of them from routine shown every time.
- **The reading scores kinds of line and life turns,** not story features (`intriguing-lives.md`).
- **Situations are pairs settled within the month.** Sides, debts, secrets others know and a third person are missing.

The answer is two tracks of rounds and one of plumbing:

- **People track,** one experiment at a time: feelings part one, taking sides, shared hardship, feelings part two, wants for later life, the band year, secrets with accounts, a third person.
- **Page track,** beside it, on page files only: the wording round, selection, particulars and callbacks.
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

- **What:** reasons worded by the expression chosen, from the table of 279 expression–facet pairs in `families.ts`, the 22 worst pairs and `backsong` written first. A history reason carries its event inside it.
- **Why the full table:** the 22 worst pairs alone reach 43% of the 434 faulted lines, under the note's own stop at 50%.
- **Primary counter:** unfit reasons cited on the changed lines, on against off. The score cannot see it.
- **The last round on reasons:** if it stops or is not kept, reasons rest.

**G2. Selection** (exit 5).

- **What:** fold the town calendar into one line with its span, and drop the want echoes. They are the most-faulted repeats (4.8 and 5.5 per hundred readings), and the festival alone draws 19% of all repeat faults on file.
- **Expected:** copies fall from 21% to about 18%.
- **Primary counter:** the 15 most-faulted templates' occurrences; stop under half removed.
- **The score may move here.** Readers score sameness, but a shorter page costs 0.16 a ten lines (round 35). The pre-registration writes the predicted change for the lines lost.

**G3. Particulars and callbacks** (exits 5 and 3).

- **What:** events carry a place, and an object where the setting has one, read from where the act already happens. There is no draw, so every act stays identical. A line recalls an earlier event by what it was.
- **Primary counter:** the share of named places and objects named again later in the same life; stop under a fifth. No clause may fail N3's check, and variety without callbacks does not pass.
- **Overstory** asked for places in the export, so the change is announced on #60 first.

### People track: one experiment at a time

| Round                                   | Mechanism                                                                              | Exits   | Triggers per world-decade                                   | Primary counter                                                                                      | Depends on       |
| --------------------------------------- | -------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------- |
| **P1. Feelings, part one**              | grief, resentment, guilt, gratitude, each with an object; debts called in              | 1, 5, 8 | about 30 wrongs, 12 costly helps; deaths, splits, lost jobs | removing the feeling flips the family in ≥5% of decisions it is weighed in                           | N1a, N2, M39     |
| **P2. Taking sides**                    | a friend of both sides chooses one, the other or neither                               | 1, 2    | 3.9 rifts, 22.5 with friendships ending                     | ≥15% of side-takings end or start a tie, or are cited by a weighty event, within 3 years (40 worlds) | N1b              |
| **P3. Shared hardship**                 | a blow binds or splits the people it hits                                              | 2       | loss and support, 0.58 per 100 a month                      | reach, 6% today, 15% needed                                                                          | P1's grief, P2   |
| **P4. Feelings, part two**              | worry, shame, pride, envy, regret; keeping one's head; illness that recurs and worsens | 1, 8    | at its research                                             | as P1                                                                                                | P1 kept          |
| **P5. Wants for later life** (round 43) | doors past 65; more than one pursuit at a time                                         | 2       | nearly half of adults want nothing, mostly past 65          | turns in random lives                                                                                | N1b              |
| **P6. The band year**                   | norms held in members' beliefs; each group's own row escalation                        | 9, 1, 8 | one band, a year                                            | at its research                                                                                      | S1               |
| **P7. Secrets, with accounts**          | any knower may expose, or hold it over the owner; records with a maker and a stake     | 2       | 29.5 secret acts; 3.1 told                                  | at its research                                                                                      | the accounts arc |
| **P8. A third person**                  | attraction that persists across a partnership, and a choice to act on it               | 1, 2    | 12% of married partners doubting                            | at its research                                                                                      | P7               |

**P1. Feelings, part one,** behind `OFF=feelings`, as `feelings-and-traits.md` proposes.

- **The mechanism.** A feeling has a kind, a cause, an object and an intensity, and fades unless renewed. It reweights, and may add its own family, in a situation involving its object. When it decides, it is the reason, worded with its object. Left unresolved, it becomes a lasting change.
- **Debts called in** belong here: resentment and gratitude give `owes` its job, and removing the random promise sits behind the same switch.
- **Repeats from acts** are measured here: the acts' 37% share of repeat faults.
- **What the reading should see:** the felt question, and a score-visible counter: kinds of line per busiest page, on against off. If P1 passes its counters but adds no kind of line, it has put new words in brackets on the same lives, and its outcome says so.
- **Exit 8:** adults carrying a lasting change by year 10.

**P2. Taking sides.** A friend of both sides decides by liking, regard, fairness and whose account came first. With P1 kept, the side not taken carries resentment toward a named person. The witness must know at least 30% of these acts.

**P3. Shared hardship,** the reach arc's second and last round. Death is the template: 88% of deaths reach 4.1 people, and 62% lead to a turn. P1's grief gives the people a blow hits together their reason to draw closer or apart. At least 70% of new turns must have a cause on an earlier line.

**P4 to P8** each begin with a one-page research note; the intrigue note is their survey, not their research. Three notes for them:

- P4 carries the illness fix as worry's first pending threat, behind its own switch.
- P5's random pack is reported first, since a turn in a quiet life is the one story feature the reading sees.
- P8 is the only round that makes a turn by the page rule (a split). It keeps the town under 10% of adults exposed or in an affair a decade, and its obstacle is a tie and an act, never an identity (Rule 8).

**Branches.**

- **P1:** kept → P2 with resentment. Not kept → P2 with liking and trust alone, and feelings go back to research.
- **P2 and P3 are one arc:** P3 runs whatever P2's outcome.
- **Stop rule:** if P1 and P2 both keep nothing (section 3's meaning), the people track stops and phase C starts with the engine as it is. The page track carries on.

### Files, and when each track starts

The page track claims `grammar.ts`, `page.ts`, `motives.json` and the words in `families.ts`.

- **P1 writes its feelings' words in its own module and data,** never `grammar.ts`. Its one line in `families.ts` (`onlyIf: job` on `work`, written in BOARD) is rebased after G1.
- **P1's research is done,** so its build and sizing start once N1a lands, without waiting for G1. Only its reading waits for G1 to merge, so that its off arm carries G1's words.
- **S1 and S2** stay in `boundary.ts` and `src/tools/` while a round is open.

### Each round's reach on the exit criterion

| Exit point                                    | Moved by                   | Today                    |
| --------------------------------------------- | -------------------------- | ------------------------ |
| 1. Close ties with an inner life              | P1, P2, P4, P6, P8         | partners and rivals only |
| 2. Weighty events change something, and reach | P1, P2, P3, P5, P7, P8     | reach 6%, needed 15%     |
| 3. Nothing false on a page                    | G1, N3, G3                 | open: unfit reasons      |
| 5. Outsiders find lives worth reading         | G2, G3, P1; the human test | no outsider since Q3     |
| 8. Living changes people                      | P1, P4, P6                 | about 3% of the distance |
| 9. A group outlives its members               | P6                         | not started              |

Points 4, 6 and 7 are held: the scoreboard gate guards 6, and refitting the city's odds after each kept people round guards 7.

### Overstory's register, and phases C and D

- **The register** from Overstory's paper playtests is coming (#60, 21 October). Each request is placed by its layer: an engine capability joins its round, the front door or export joins S1 or S2, content joins S3. A domain or presentation stays Overstory's.
- **It may pull one arc forward** by Øystein's choice, never displacing an open round. P7 is likeliest: their panel leads with the paper and a mystery. What we take is recorded in SUMMARY.
- **Phase C, the first game,** is chosen once the register is in and exit points 1, 2 and 9 are close, or once the stop rule fires. Built for it then: the pack format with its Rule 8 closure, the town as `packs/town`, an unlike test pack in CI, and the music domain behind its interface.
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
- **For the eleven rounds:** about $380 if all are read, about $260 if a third stop at sizing, as round 42 did.
- **Throughput:** two tracks about double the rate of rounds, once P1's build runs beside G1.

**What not to build:** a director or any pacing; a clock shorter than a month; domain systems in the engine; a live language model; a reputation score; a meter shown to the player.

## 6. Decisions for Øystein

1. **Two tracks, feelings first** (agreed). This reverses the first plan's rule of no page round until a people round is kept.
2. **The bar** (agreed), with section 3's rule that a miss with a passed counter buys one more pack. Recommended: yes.
3. **"Next", proposed:**

   1. the wording round (G1);
   2. feelings part one (P1), built now and read after G1;
   3. the human test.

   Then selection, taking sides, shared hardship, particulars and callbacks, feelings part two, round 43, homes with the front door's part two, and the band year. Beside any: N1a first, N2, M39, S1.

4. **The felt question (M39)** in the brief, as a check, calibrated on round 40 and the planted pack. Recommended: yes.
5. **The human test,** dated before P1 is read: at least five outsiders, part of round 40's busiest pack, exit point 5's bar, with the felt question. Recommended: within three weeks.
6. **The wording round words the full table** (279 pairs, as data), not the first plan's cap of 22. Recommended: yes.
7. **The reviewer stays on Fable 5.1.** Sonnet is cheaper, but quality decides the model, and the reviewer is what stops a failed round before it costs a reading. Recommended: yes.
8. **The repo structure** of the first plan, with packs made in phase C. Recommended: yes.
9. **The register may pull one arc forward,** P7 likeliest. Recommended: yes.

**Carried unchanged from the first plan** (recommended, no change needed):

- content as data, one file at a time between rounds;
- branching as a neutral job;
- the band as the slice, with the first command first in #22;
- the density count in the battery, never a target.
