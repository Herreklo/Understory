# Building the engine: the plan

_Rewritten 22 October 2026 around three research notes: feelings and traits, a page that feels lived in (`notes/research/feelings-and-traits.md`, `language.md`, PR #85) and what makes a life intriguing (`intriguing-lives.md`, PR #86). Also drawn on: the wording note (`wording.md`, PR #78, a draft), `reasons.md` and `reports/density-22oct.md`. Øystein agreed the outline that day: two tracks, feelings first, and the bar in section 3. The plan proposes; "Next" in `SUMMARY.md` changes only when Øystein says so. The first version of this plan, with its file-by-file audit, is commit `cccad45`._

## 1. What changed, and the answer in short

Øystein's pilot reading found Rose Lane's acts made sense, but her life was samey and what she felt was never said. The three notes say why:

- **Feelings are decoration.** 41 kinds are written at 50 sites, and no act, consideration or situation reads one. `p.owes` is never read. Felt states are 0.7% of reasons on the page.
- **The page repeats.** 21% of lines are extra copies of a line already on the page. Two thirds of the copies come from selection (the town calendar, band routine, a want's end said twice), not from words. Nothing is called back: 9 lines in 3,429 recall an earlier event by what it was.
- **The reading sees kinds of line and life turns, and little else.** Kinds of line explain R² 0.44 of the score. A turn in the person's own life, read as an arc with the life around it, adds +0.59 z within pairs. Eighteen story features (a feud, a secret, a reversal, a counterpart) add 0.03 together. On the busiest pages, a cast and a conflict are there 98–99% of the time.
- **The engine's situations are pairs settled within the month.** Sides, debts from real acts, a third person and secrets others know are missing or thin, though the state for each is already there.

**The answer:** two tracks of rounds and one of plumbing.

- **People track,** one experiment at a time: feelings part one first, then taking sides and shared hardship, then feelings part two, wants for later life, the band year, secrets with accounts, and a third person last.
- **Page track,** beside it, touching only page files: the wording round, then selection, then particulars and callbacks.
- **Neutral work** beside both: the measures and the guard first, then cleanups, the first command and the slice, and content as data.

People rounds are judged on their own counters and "reads no worse", read on 48 pairs. The reading gains one question, about feelings, since it cannot see them today.

## 2. The guard: storiness must not become scripting

A hard rule, for every round and every neutral change.

1. **No engine rule reads a story measure.** That includes a density rate, a count of events of a kind across the town or the page, or anything under `src/tools/`. A rule reads only what a person has, holds, knows or remembers: traits, ties, beliefs, feelings and their own past. A feeling that habituates with repetition, or a grudge renewed on meeting, is the person's own state and is allowed. A cooldown kept per kind of event, or across the town, is pacing and is not.
2. **CI enforces what it can.** An import test fails if any module outside `src/tools/` imports from it. None does today, so the test lands green with the measures (section 4, job N1).
3. **A round that raises drama names its mechanism in people.** Drama here means more rifts, exposures, feuds or turns. The pre-registration says which state in which people produces it. The mechanism's parameters come from that state and are never tuned toward a story or density number. The soap checks (affairs and exposures under 10% of adults a decade; reversals at most 4 a life at the 90th percentile; repeated kinds not rising) are stops, never targets.
4. **The reviewer checks it.** `.claude/agents/reviewer.md` gains a seventh question: does any new reader of state read a count, a rate or a measure rather than a person?
5. **No director.** Lulls are accepted. The page chooses what to show; the engine never chooses what happens for the page's sake.

## 3. How rounds are judged

**The bar (agreed).** "Reads no worse" holds when the one-sided 95% lower bound of the effect, with order as a term, is above −0.3. People rounds are read on 48 pairs, one random pack and one busiest, scored pooled with the pack as a term, and each pack's effect is reported beside. Page rounds change only words, so the two versions are the same lives; they are read on 24 pairs of one pack, built as M38's planted pack was. "Reads better" is reported and never judged until the human test.

**Why −0.3, and why not −0.15.** On M38's own files, a pair's difference varies by 0.50 where nothing changed (the null) and 0.86 on a real round (round 40's busiest). A people round that truly changes nothing in how lives read falls somewhere between. How often it passes:

| Rule                            | spread 0.50 | spread 0.86 | a true −0.3 passes |
| ------------------------------- | ----------- | ----------- | ------------------ |
| Today: 24 pairs, two-sided 95%  | 81%         | 36%         | 2%                 |
| Agreed: 48 pairs, one-sided 95% | 99%         | 77%         | 5%                 |
| −0.15, 48 pairs, one-sided 95%  | 66%         | 32%         | 5% (a true −0.15)  |

A harmless round would pass the −0.15 bar 80% of the time only at about 70 to 200 pairs, three to eight packs a round. So −0.3 stays. Its looseness since M38, with effects running about half their old size, is answered by the counters, which carry each claim. The scorer gains the one-sided 95% bound; today it reports a one-sided 90% one.

**What the reading can see.**

- **The score** sees new kinds of line (about +0.05 a kind on the old scale) and life turns with the life around them. It also sees sameness: a repeat fault goes with −0.25 z within a reader and page on the old brief, and −0.11 on M38's.
- **The fault counts** see unfit reasons, repeats and "out of nowhere" on the lines that changed.
- **Nothing** sees triads, debts or secrets as such. They show only as new kinds of line where they fire, and at their rates few of a pack's 24 pages carry one.
- **Feelings are invisible today.** The brief asks for a score, faults, good lines and a preference, never what someone felt.

So the brief gains one question (job M39 in section 4): for each version, up to two lines where the reader can say what the person felt and toward whom. Answers are scored against the engine's key. A changed brief is calibrated once: one role re-reads round 40's busiest pack and must land inside its interval.

**Random or busiest.** The busiest pages are saturated with cast and conflict, so a change to quiet lives shows only on random pages. People rounds read both, which the 48 pairs already pay for. Page rounds read the busiest, where the repeats and the reasons are.

**Every pre-registration says** the share of a pack's pages its mechanism touches and the smallest effect its reading can resolve: about ±0.25 at 48 pairs on a people round; on the same lives at 24 pairs, between the planted pack's ±0.04 and the null's ±0.2, as more lines change. Where the reading cannot see the claim, it says so, and the round stands on its counter.

## 4. The order of work

### Neutral, beside anything, no slot needed

| Job                                         | What                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Serves                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| **N1. The measures**                        | In the battery: life turns per page and the share with a cause on an earlier line; counterparts in 3+ weighty events; reversals per life; the share of weighty events cited by a later one; knowable turns per 100 a month (`density.ts`); the page's copy share, its 15 most-faulted templates and its callback share (`language.md`'s scripts as a diagnostic). The guard's import test. The scorer's one-sided 95% bound and pooled packs; `reading.md` and the reviewer's brief brought up to date. Then check whether a want loses the blow that caused it (3% of rises after a blow descend from it). If it does, recording the cause is its own small change, with every act identical. | every fail-if below       |
| **N2. Cleanups** (`refactor`, then `words`) | Cut `selfBias` and `lastProvoked`. Name the secret in "carrying something nobody knew". Say who the dead person was to the subject. Give the habit line its job-loss event.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | P1                        |
| **M39. The felt question**                  | One question added to the brief; its key from the engine; one calibration re-read (about two sittings). Before P1 is read.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | P1, P4                    |
| **N3. Every clause carries its IDs**        | CI fails any clause with no event behind it. A frame render over random states, a Rule 8 lint over a rendered world, a list of model tics kept at zero, one pseudo-localised pass. Touches `grammar.ts` and `page.ts`, so it runs between page rounds.                                                                                                                                                                                                                                                                                                                                                                                                                                         | exit 3; G3                |
| **S1. The first command and the slice**     | #22's first command (an invitation, answered by the other person's own decision), and a text client in `src/tools/` that plays one witness in the town through the front door: the band, rough, end to end. Offered on #60 once it runs.                                                                                                                                                                                                                                                                                                                                                                                                                                                       | the band year; Overstory  |
| **S2. The front door's part two**           | Reads by viewer, `eventsAfter`, versions, then branching (an override named by event id, kept on the world), then save and load. Each announced on #60 before it lands.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Overstory; observer games |
| **S3. Content as data**                     | `motives.ts` is done (#83). `setting.ts` next; `families.ts` once the wording round has merged. One `refactor` per file, between rounds.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | any second pack           |

N1 comes first: feelings part one's fail-ifs and every intrigue round's need its counters.

### Page track: one round at a time, page files only

Each is an experiment, since it claims an effect on how a page reads. Each changes no act, so it may run beside a people round that touches none of its files.

**G1. The wording round** (Next 2; exit 3). Reasons worded by the expression chosen, from a table of the 279 expression–facet pairs in `families.ts`, with the 22 worst pairs and `backsong` written first. Falls back to the family's wording, then the general one. A history reason carries its event inside it. Behind one switch. It is the last round on reasons: if it stops or is not kept, reasons rest.

- **Judged:** its counter is unfit reasons cited on the changed lines, on against off. Plus "reads no worse". The score cannot see it (+0.01 expected).
- **Pack:** 24 pairs, the same lives, busiest.
- **Note:** the 22 worst pairs alone reach 185 of the 434 faulted lines (43%), under the note's own stop at 50%. The full table reaches up to 92%, so the round words the table. Its power on the changed lines is lower diluted (about 60% for the whole drop), which is why the counter carries the claim.

**G2. Selection** (exit 5). Fold the town calendar into one line with its span, and drop the want echoes. These are the most-faulted repeats per reading (4.8 and 5.5 per hundred), and the festival alone draws 19% of all repeat faults on file. Expected: copies fall from 21% to about 18%. Folding band routine and persona notes too would reach 14–15% but cost about a fifth of the lines, and by round 35's slope (−0.16 per ten lines) that reads worse. It is sized before it is chosen.

- **Judged:** the copy share, and the 15 most-faulted templates' occurrences (stop under half removed). Repeat faults per 100 line-readings, on against off. "Reads no worse".
- **Pack:** 24 pairs, the same lives, busiest.
- **The one round the score may see:** readers score sameness. The pre-registration writes the score change predicted by the slope for the lines lost.

**G3. Particulars and callbacks** (exits 5 and 3). Events carry a place, and an object where the setting has one, from the venues and 160 materials it already holds. A line recalls an earlier event by what it was ("not since the night the band fell apart at the Anchor"). The place is read from state, where the act already happens, with no draw, so every act stays identical and the round stays in this track; if it ever needs a draw, it moves to the people track. Places in events are what Overstory asked for in the export, so the change is announced on #60 before it lands.

- **Judged:** the share of named places and objects named again later in the same life (stop under a fifth). No clause fails N3's ID check. Every recall cites a belief the person holds. The repeat share and the callback share are judged together: variety without callbacks does not pass.
- **Pack:** 24 pairs, the same lives.
- **Depends** on N1 and N3.

**Later:** a second recurring occasion (setting content); variants for marked phrases only, drafted offline by a model and curated by people.

### People track: one experiment at a time

| Round                                      | Mechanism                                                                                   | Exits      | Triggers per world-decade                                   | Depends on                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------- | -------------------------- |
| **P1. Feelings, part one**                 | grief, resentment, guilt and gratitude, each with an object; debts called in                | 1, 5; 2, 8 | about 30 wrongs, 12 costly helps; deaths, splits, lost jobs | N1, N2, M39; G1 merged     |
| **P2. Taking sides**                       | a friend of both sides chooses one, the other or neither                                    | 1, 2       | 3.9 rifts, 22.5 with friendships ending; 2+ deciders each   | N1; P1 helps               |
| **P3. Shared hardship**                    | a blow binds or splits the people it hits                                                   | 2          | loss and support: 0.58 per 100 a month                      | P1's grief; P2's machinery |
| **P4. Feelings, part two**                 | worry, shame, pride, envy, regret; keeping one's head; illness that recurs and worsens      | 1, 8       | sized at its research                                       | P1 kept                    |
| **P5. Wants for later life** (round 43)    | doors past 65; more than one pursuit at a time                                              | 2          | nearly half of adults want nothing, mostly past 65          | N1                         |
| **P6. The band year**                      | norms held in members' beliefs; each group's own row escalation                             | 9, 1, 8    | one band, a year                                            | S1; research               |
| **P7. Secrets others know, with accounts** | any knower may expose in a hostile or contested situation; records with a maker and a stake | 2, 6       | 29.5 secret acts; 3.1 told today                            | the accounts arc; research |
| **P8. A third person**                     | attraction that persists across a partnership, and a choice to act on it                    | 1, 2       | 12% of married partners doubting                            | P7                         |

**P1. Feelings, part one,** behind `OFF=feelings`, as `feelings-and-traits.md` proposes.

- **The mechanism.** A feeling has a kind, a cause, an object, an intensity and whether the cause still stands. It fades unless renewed. It reweights the families offered in a situation involving its object and may add its own family. When it decides, it is the reason, worded with its object. Left unresolved past its kind's horizon, it becomes a lasting change.
- **Debts called in are this round.** Resentment and gratitude set `owes` from costly help or an unrepaired wrong, weighed when the creditor next needs the debtor. Removing the random promise sits behind the same switch. Intrigue round 3 and phase A's obligation are folded in here.
- **Repeats from acts are this round too:** a second wrong renews resentment, a second apology ends guilt. It reports the acts' share of repeat faults (37% today) as a check.
- **The `work` act gains `onlyIf: job`,** written in BOARD.
- **Judged:** removing the feeling flips the family in at least 5% of the decisions it is weighed in. At least 15% of debts called in end or start a tie, or are cited by a weighty event, within three years. The feelings note's five fail-ifs hold. The felt question, on against off. "Reads no worse" on 48 pairs.
- **What the reading can see:** the felt question, and perhaps fewer repeat faults. The score likely nothing.

**P2. Taking sides.** After a rivalry, split or betrayal with friends of both, each such friend sides by liking, regard, fairness and whose account came first. With P1 kept, the side not taken carries resentment toward a named person; without it, it loses liking and trust.

- **Judged:** at least 15% of side-taking decisions end or start a tie, or are cited by a weighty event, within three years. This is sized on 40 worlds, since 20 give ±9 points. The witness knows at least 30% of them. Friendship's reach rises from 0%. "Reads no worse" on 48 pairs.
- **The reading:** about 30 rifts fall in a pack's eight worlds, so few pages carry one.

**P3. Shared hardship,** the reach arc's second and last round. Death is the template: 88% of deaths reach 4.1 people beyond the dead, and 62% lead to a turn. Blows people survive reach almost no one. A blow hits several people, and P1's grief ("seeking a few") gives it the inner half: those hit together draw closer or apart.

- **Judged:** exit 2's reach share (7% today, 15% needed). The share of weighty events cited by a later one rises beyond the off arm's interval, not counting the new acts' citations of their own triggers. At least 70% of new turns have a cause on an earlier line of the page. "Reads no worse".
- **Research needed:** a one-page note.

**P4. Feelings, part two,** the feelings arc's second and last full round, and only if P1 is kept.

- **The mechanism.** Worry, shame, pride, envy and regret, and keeping one's head as the handling skill. The small fix "illness that recurs gets worse and counts" joins here as worry's first pending threat, behind its own switch inside the round. Lasting changes carry exit 8.
- **Judged** as P1 is.

**P5. Wants for later life** (round 43, its third try after 25d and 36). Doors for people past 65, and more than one pursuit at a time.

- **Why here:** a want achieved is 9% of knowable turns, and a turn in a quiet life is the one story feature the reading sees.
- **Judged:** the share of adults pursuing nothing, and turns in random lives. "Reads no worse", with the random pack reported first.

**P6. The band year,** organisations' first round: norms held in members' beliefs (`notes/organisations-concept.md`), first the row escalation made each group's own. It grows out of the slice's band, and needs research and a pre-mortem.

**P7. Secrets others know, with accounts.**

- **The mechanism.** The confidant's path extends to any knower who meets the owner in a hostile or contested situation, and exposure goes through `caught`'s path. Records and opinions come from the paused accounts arc.
- **Why together:** Overstory's design panel leads with the paper and a mystery, and both need these. This is the arc the register would most likely pull forward.
- **A caution:** secret lines need new words, or the round adds formulaic ones; secrets lean negative on the readings.

**P8. A third person.**

- **The mechanism.** Attraction that persists across a partnership, and a choice to act on it. The obstacle is a tie and an act, never an identity (Rule 8).
- **Why it matters:** it is the only intrigue round that makes a turn by the page's rule (a split), so the reading may see it.
- **Risk:** soap. The town stays under 10% of adults exposed or in an affair each decade.

**Branches.**

- **P1:** kept → P2 with resentment, then P4 in its turn. Not kept → P2 with liking and trust alone; feelings go back to research.
- **P2 and P3 are one arc:** P3 runs whatever P2's outcome, as its second and last round.
- **Stop rule:** if P1 and P2 both keep nothing, the people track stops. Phase C starts with the engine as it is, and the page track carries on.

Every round from P3 on starts with a one-page research note. The intrigue note is the survey, not each round's research.

### Each round's reach

|                                           | Exit points moved          | Today                      |
| ----------------------------------------- | -------------------------- | -------------------------- |
| 1. Close ties with an inner life          | P1, P2, P4, P6, P8         | partners and rivals only   |
| 2. Weighty events change something; reach | P1, P2, P3, P5, P7, P8     | reach about 7%, needed 15% |
| 3. Nothing false on a page                | G1, N3, G3                 | open: unfit reasons        |
| 5. Outsiders find lives worth reading     | G2, G3, P1; the human test | no outsider since Q3       |
| 8. Living changes people                  | P1, P4, P6                 | about 3% of the distance   |
| 9. A group outlives its members           | P6                         | not started                |

Exit points 4, 6 and 7 are held, not moved. The scoreboard gate guards 6. Each kept people round is followed by refitting the city background's odds, which guards 7.

### Files, so the tracks don't collide

- **The page track** claims `grammar.ts`, `page.ts`, `motives.json` and the words in `families.ts`.
- **P1** writes reasons, so its wording waits for G1 to merge. G2 may run while P1 is built, if P1 leaves `page.ts` alone.
- **N3** and S3's `families.ts` sweep run between page rounds.
- **S1 and S2** stay in `boundary.ts` and `src/tools/` while a round is open.

### Where Overstory's register slots in

The must-improve register from Overstory's paper playtests is coming (#60, 21 October). When it lands, each request is placed by its layer:

- an engine capability joins the people round or later arc it belongs to;
- the front door or the export joins S1 or S2;
- pack or content joins S3;
- a domain stays in the game's repo, and presentation is Overstory's.

A request that moves no exit point waits, unless Øystein adds one. The register may pull one arc forward, P7 most likely, by Øystein's choice, never displacing a round already open. What we take is recorded in SUMMARY. Their early signal, about one notable, knowable event a week, matches our count (1.27 ±0.10). The density measure reports it, and it is never a target.

### Phases C and D, unchanged in substance

- **Phase C, the first game.** Øystein chooses it once the register is in and exit points 1, 2 and 9 are close, or once the stop rule fires. The game brings its pack and domain in its own repo. Here, built for it: the pack format with its Rule 8 closure, the town as `packs/town` (identical), an unlike test pack in CI, and the music domain behind its interface.
- **Phase D, as games ask:** time and moments (deaths with a moment, things in events), crime and killings, inheritance with homes (#59), and fame as reach. Each is an arc of research and at most two rounds. G3 brings places in events forward from here.

## 5. What "built properly" means

The engine is built properly when:

- a new game needs a pack, a domain module and a front end, and no change to an engine rule;
- a second pack, very unlike the town, runs in CI;
- every mechanism moves an exit point, or it is cut;
- the city runs on the same people (exit point 7).

Four layers hold everything, each with its test:

- **The engine:** people, decisions, ties, beliefs, feelings, accounts, time and the general mechanisms. The same in any world.
- **The world pack:** institutions, convictions and era tables. Data that applies to everyone alike (Rule 8).
- **The domain module:** a match, a song, evidence. Deterministic; it reads the front door and gives back events.
- **The content:** places, names, words. Data, so another language needs no code.

Every round above is engine work, except G2 and G3's lexicon, which is content.

**The repositories.**

- Understory holds the engine and the town.
- When the first game is chosen, the town moves to `packs/town`, the unlike pack joins as `packs/test`, and songs and shows move out of `group.ts` to `domains/music`.
- Each game holds its own pack and domain in its own repo.
- A world is its seed, its pack and version, and its engine tag.

A pack format built before a second user exists would be built from guesses. Modern life written into rules (school, marriage from 18, divorce, hiring ages, the council and the bar) becomes pack fields holding today's values then; the audit with file and line is in commit `cccad45`.

## 6. Costs and throughput

- **Readings.** A sitting costs about $4 (M38's median).
  - A page round reads 24 pairs: four sittings, about $20.
  - A people round reads 48 pairs: eight sittings, about $40.
  - M39 adds about two sittings, once.
- **For the eleven rounds above:** about $380 if every one is read, about $260 if a third stop at sizing as round 42 did.
- **Two tracks** about double the rate of rounds without breaking "one experiment at a time changes how people behave".
- **Neutral jobs** cost no readings.
- **The biggest saving is still a round stopped at its sizing.** Each round's fail-ifs are sizing checks, run on throwaway worlds before review.
- **Øystein's time:** the decisions below, the human test, one look at the slice, and each round's branches.

**What not to build:** a director or any pacing; an engine clock shorter than a month; domain systems inside the engine; a live language model; a reputation score (opinions are accounts); a meter shown to the player; killings before deaths with a moment.

## 7. Decisions for Øystein

Each has a recommendation. The first two were agreed with the outline.

1. **Two tracks, feelings first** (agreed). This reverses the first plan's rule of no page round until a people round is kept: the pilot found sameness, and sameness is what readers mark down.
2. **The bar** (agreed): −0.3 on the one-sided 95% bound; 48 pairs for people rounds; 24 on the same lives for page rounds.
3. **"Next", proposed:**

   1. the wording round (G1), once the wording note merges;
   2. feelings part one (P1);
   3. the human test.

   Then selection beside P1, taking sides, shared hardship, particulars and callbacks, feelings part two, round 43, homes with the front door's part two, and the band year. Beside any: N1 first, N2, M39, S1. Branches as in section 4.

4. **The felt question in the brief** (M39), calibrated once before P1 is read. Recommended: yes. Without it, the reading cannot see what P1 and P4 claim.
5. **Date the human test,** before P1 is read: at least five outsiders, part of round 40's busiest pack, exit point 5's bar, with the felt question added. Recommended: a date within three weeks. It decides whether "reads better" judges again.
6. **The wording round words the full table** (279 pairs, as data), not the first plan's cap of 22 pairs. The cap reaches 43% of faulted lines, under the note's own 50% stop. Recommended: the full table, worst pairs first, judged on its counter.
7. **The reviewer stays on Fable 5.1,** a different model from the builder's. Sonnet would be cheaper, but here quality decides the model, and the reviewer is what stops a failed round before it costs a reading.
8. **The repo structure** of section 5, with packs and the music domain built in phase C for the chosen game.
9. **The density count joins the battery** (N1), reported beside exit point 2, never a target.
10. **Content as data,** one file at a time between rounds: `setting.ts` next, `families.ts` after G1.
11. **Branching** as a neutral job in S2.
12. **The register may pull one arc forward,** P7 most likely, never displacing an open round.
13. **The slice:** the band, rough and in plain text, with the first command first in #22. A look for Øystein, not a gate.
14. **The stop rule:** if P1 and P2 keep nothing, the people track stops and phase C starts with the engine as it is.
