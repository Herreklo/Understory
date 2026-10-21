# Overstory's working practices, and what transfers to Understory

21 October 2026. Read from `Herreklo/Overstory` through the GitHub API only: branch `lt/1-harbour-street` at `c6328c7` (its newest work, 100+ commits ahead of `main`, whose last commit is 19 October) and `main`. Read in full: `CLAUDE.md`, `NOW.md`, the four skills, `docs/notes/2026-10-21-5-overstory-to-understory.md`, `docs/research/pre-mortem.md`, `reality-check.md`, `working-with-claude.md`, `docs/usage-log.md`, `tools/usage_scan.py`. Read in part: `docs/experiments.md` (Findings, LT1f, LT1), `docs/plan.md` (next week), `docs/foundations.md` (cold readers), `docs/research/playtesting.md` (bottom line, agents, section 11), `docs/research/building-blocks-inputs.md` and one digest, `reviews/lt1/heart/critique.md`. There is no `.claude/agents/` and no `.claude/settings*` on either branch; `.claude/` holds only the four skills. Understory read at `/home/claude/the-lab` (`CLAUDE.md`, `SUMMARY.md`, `WHY.md`, `docs/method/*.md`, `reports/M38-sittings.md`), nothing changed.

## In short

Worth taking, best first:

1. **A positive control for the blind reading: shuffled reasons.** Overstory's shuffled-facts arm checks that readers read the facts and not conventions. Our version tells us whether readers can see whether a reason fits its act at all. Round 42 depends on that, so it belongs inside M38 before round 42 runs.
2. **A frozen calibration set, re-read whenever the reader model or brief changes.** Every keep decision rests on Fable 5.1 readers. The packs and answers from rounds 29 to 41 are already on file, so this is a rule, not new work.
3. **Session hygiene: one job per session, a fresh start near 200k, and no model switching inside a long chat.** Our main session ran out of context at about 783k and is back at 440k five hours later. In the window we can see, re-reading was 62% of its cost.
4. **A pre-mortem before the big rounds only:** homes, the band year, the human test, the front door's part two.
5. **A cost line per round, and a usage check before starting a 12-sitting reading.** On 20 October three Fable sittings were cut off mid-reading.
6. **Method findings, each with what would disprove it,** in `docs/method/reading.md`.
7. **A size budget on the session-start page.** `SUMMARY.md` calls itself one page but runs to 4,359 words.

Not worth taking: research tracks per system, digests and a decision register, a hand-kept usage log, our own paper playtests, and delegating "what comes next". Each would add paperwork or take control away from Øystein without improving a decision. Overstory's own record shows what that costs: about 392,000 words in `docs/` against about 27,700 lines of code, and growing by about 80,000 words on the day its own pre-mortem warned about it.

Usage, as measured here: of what the transcripts hold, **cold readers on Fable were 85%** of weighted usage, at about $45 to $54 a round for 12 sittings. Re-reading context was only 13% of the total. That is because the reader sittings mostly pay to write their pack into the cache and to write output; it is not because we are thrifty. The main session's own history before 14:20 today is missing from the transcript, so the split between main session and subagents cannot be measured (section 4).

---

## 1. How Overstory works

### 1.1 Session start and end

- **Start:** `git fetch origin && git switch main && git pull --ff-only`, then read `NOW.md`; "If it names an open experiment's branch, switch to that branch and pull it." Read `docs/visual-direction.md` before visual work. That is about 8,800 words before any visual work, close to our `CLAUDE.md` + `SUMMARY.md` + `WHY.md` (about 8,300).
- **NOW.md is the handover.** "Every session reads this page first, so it stays near 1,500 tokens." It holds where things stand, Next, Waiting for Øystein, and "Decided (… don't reopen without Øystein)". It is 2,081 words (about 2,800 tokens), so it is over its own budget.
- **End:** record keep/drop in `docs/experiments.md`, update the design docs, update `NOW.md`. `main` takes the branch "at milestones Øystein has judged".
- **Session length** (CLAUDE.md, Using tokens well): "**One job per session.** Start fresh at a job boundary or near 200k of context, from a short handover in `NOW.md`. `/clear` is free; `/compact` is a large request. Set the model and effort at the start and never switch models mid-session: delegate instead." And: "When usage runs low, stop at a milestone boundary with everything pushed."

### 1.2 Research before building

- **Rule** (Øystein, 22 October): "Every new material, kind or system gets two research tracks first: what it is (its facts, history and look) and how the best studios build it at quality and scale for our stack … No new heavy geometry before the craft is known. When work reveals something unstudied or a wrong assumption, stop, say so, add it to the research coverage in `docs/systems.md` and study it before building on it."
- **Format:** each study opens with "In short" or "The bottom line". Claims are marked (secondary) or (unverified) when they are not from primary sources. Studies end in a table, "What we should do" (change | expected effect | effect on quality | how we check), followed by "Gaps" and "Sources". Studies live in `docs/research/`, digests in `docs/research/inputs/`, and one synthesis in `world-that-remembers.md`.
- **Size:** 53 research docs, about 297,000 words. Craft studies run 8,000 to 14,000 words each. Each processed 22 to 57 million tokens, about 1% of the weekly limit, and the fourteen together took 11 to 17% of the week.
- **Craft of research** (adopted after measuring): "Scout first, keep a shared source list, read each source once, take notes as you go, and hand to a fresh writer once context passes 200k."

### 1.3 The pre-mortem

- **Rule:** "**Hold a pre-mortem before every big build** … A fresh reviewer imagines it is six months later and the work has failed, says why, and names what a lead technical artist at a studio would say we are missing."
- **Format** (`docs/research/pre-mortem.md`, about 3,700 words):
  - an opening line: "It is April 2027 and Overstory has failed …";
  - a base rate (commits, words of docs against lines of code, the weekly limit used);
  - a ranked table (# | Story | Odds | Harm | Act by), ranked "by odds times harm";
  - for each story: How, Odds and harm, Warning, Cheapest action, and where the action lands in `plan.md`;
  - then "Not in any doc"; three outside voices (a studio's lead technical artist, a producer, a creative director); "For Øystein" with recommendations; and "Not checked".
- **Its best catches:**
  - "Nobody read it": no cold reading had run, so their biggest risk was untested.
  - "The method ate the budget".
  - "Overstory became the engine".
  - "The docs stopped being true": about forty conflicts between docs.
  - "A verdict slipped in": neglect mapped onto a group by rule, which would break Rule 8 in aggregate.

### 1.4 Decisions

- **Delegated:** "Øystein delegates the decisions. They are taken on analysis, with the reasons written down, and checked by a fresh strict reviewer. Only scope, play and permissions go to him, each with a recommendation. Everything else is recorded and shown as finished work he can overturn." Look and craft are theirs: "You have to figure these things out."
- **Recorded:** "Write decisions once, in the design docs, and don't reopen them without new evidence." In practice they are recorded in `NOW.md` ("Decided"), in the design docs, and in the register's "Decided already: do not reopen". The pre-mortem itself proposes making the register "the only home of 'Decided' (id, decision, date, source, what it supersedes)", because decisions now live in several places.
- **Reviewed:** a fresh strict reviewer, and Fable passes queued for decisions taken on Opus while Fable's limit was spent (`NOW.md`, "After the usage reset").

### 1.5 Working order: the ladder of fidelity and "write done first"

The rules come from `CLAUDE.md`, "Working in the right order", written after "the stairs took eight rounds, then had to be rebuilt":
- "**Hardest to change comes first.** Data formats, the architecture, the measuring tools and scale come before parts."
- "**Biggest risk comes first** … tested early, at the cheapest fidelity that can answer it."
- "**Climb a ladder of fidelity.** A number before a render, grey form before materials, a quick sheet before the town, clay before parts, a still before motion. Move up only when the rung below passes."
- "**Write 'done' first:** the question, the views, the budget and what would change our minds. A self-check against the core rules and the numbers comes before a strict review, so reviews find what only eyes can."
- "**Stop when a loop won't converge.**" Also: one thing end to end before many things; research just in time; test play in greybox early.

The model case is the LT1f entry. Before anything is drawn it states:
- the question;
- what is built;
- how it is judged: fixed views, readers, arms, tasks, the order, a provisional bar;
- "What would change our minds", one line per possible outcome;
- "What it does not test".

### 1.6 Digests and the decision register

To prepare one big decision (the building-blocks architecture) from 16 studies of about 150,000 words:
- Five Opus digests (4,300 to 5,400 words each) check each study "against the bar" and pull out its decisions, costs, conflicts and gaps.
- One register (`building-blocks-inputs.md`, about 15,000 words) holds 123 decisions as rows: # | Question | Evidence and lean | Cost | Settled by | Urgency. It "decides nothing". The Fable session decides from the register, "opening a study only where a decision hinges on it".
- One digest found a gap no single study saw: where generation runs, since a shipped game can't run Blender.

### 1.7 Models and subagent briefs

- **Models:** Fable for judgement, Opus for building and research, Sonnet "only for mechanical work that a check proves unchanged". "Never use a weaker model or give a job less information to save tokens. Only waste goes."
- **Briefs:** "**Fresh agents, not forks.** A brief names the decision, the files and sections, and the output and its length; a report over 500 words goes to a file. The brief says whether the agent may start others." Behind this rule: their 15 forks read 171 million tokens and wrote 16,000.
- "Keep the main context small. Images, logs, research and reviews run in fresh agents; the main session gets verdicts, numbers and paths."

### 1.8 Reviewers

- A **strict review** by a fresh agent (Fable when available) that sees "only the frames and the bar". A "master's critique" pairs a blind Fable reviewer with the maker's own review and says where they differ.
- **Numbers first:** "The harness, golden views, hashes and value spreads do the first pass, so reviewers spend their eyes on what only eyes can judge."
- **Lean packets:** one sheet at 1568 px or less plus native-resolution crops. The packet is adopted "only after a blind test shows it finds the same faults".
- **What went wrong:** the birch took 34 Fable rounds overnight, about a third of the window's usage and three quarters of Fable's week. Fresh reviewers "bring new lists" each time. The pre-mortem's proposed fixes:
  - each review starts from the last list and adds only blocking faults;
  - Fable's verdict is recorded before Øystein sees a milestone, and agreement is tracked ("below four in five, the brief changes");
  - Øystein ranks a blind taste set of 20 frames once a month.

### 1.9 Cold readers and controls

Taken from our method (roles, a model other than the maker's, pack/brief/key committed first, scored by script), plus one addition that is theirs:
- **The shuffled-facts control:** "frames rendered with each house's later history … moved to another house, scored against the true record." The bar: "With the facts shuffled, parts marked right must fall by at least thirty points, or readers are reading conventions rather than our facts." It guards against a model reader that "shares the maker's associations".
- **A layers-off arm** sets the baseline for false claims, and the real frames "may not exceed it".
- **Arms that separate media:** scene first against page first, "since a reader who has read the page already knows what happened".
- **Free text coded blind:** a coder agent codes free text against the key without knowing the arm.
- **Panel size:** three readers a round while building; six at a gate (two per role, two models). "Where people and the model panel disagree, people win, and the panel's brief or roles change."

### 1.10 Paper playtests

As told in the note and `NOW.md`:
- A game-master agent runs each game concept in text from our world 9989.
- Persona players on two models play blind, with lives on against lives off, "calibrated first against well-loved games".
- An optimiser hunts for exploits.
- The output is a **must-improve register**, including engine requests, not a choice of game.

The method doc (`docs/playtests/paper-1/`) is not committed on either branch, so the details are unverified. Their own study is clear about the limits: "Agents go first, never last … They can't show fun, calm, real misreadings or the wish to return", and their findings "are hypotheses for people, never reported as player findings".

### 1.11 Usage logging

- `tools/usage_scan.py` reads the local transcripts. It weights each request by list price ("relative weights, not plan limits") and splits usage by job and by kind (build, measure, review, research, docs, orchestration). Subagents are classified by words in their description, and main-session requests by the tools they used.
- `docs/usage-log.md` holds plan readings, one row per job of 0.5% or more, shares by kind, unit costs (a craft study, a review round, an hour of building), "What the weights can't tell us", and "What the numbers say".
- **Rule:** "Check usage at the start of each day, and log a line per job".
- **Honest about its limits:** with only Opus running, a point of the weekly limit matched $17 of weight; over the week, $11.5. So list price is not the plan's weighting.

---

## 2. What has gone wrong in Overstory, in its own record

- **Documents outgrow the work.** At the pre-mortem (21 October): "about 310,000 words in 69 docs against about 27,000 lines of code". On the branch now: 81 docs, 392,000 words in `docs/` (297,000 of them research), against about 27,700 lines of code (Python, C#, HLSL, shell). `plan.md` says "build more, write less", yet the last hour of commits added six more research studies (camera, play craft, collision, the far town, playtesting, stories). By their own measurement, docs cost only 3 to 7% of usage; the cost is attention and truth, not tokens.
- **Docs disagree, and skills go stale.**
  - `game-lab-workflow` says "Send the contact sheet to Øystein … Do not judge beauty yourself and call it done"; `NOW.md` says "Look and craft questions are ours".
  - `engine-bridge` says "Øystein takes it to the engine project"; `CLAUDE.md` now has them comment on our issues directly.
  - `unity-conventions` points to `PlaceGrammar.cs` and `docs/place-grammar.md`; neither exists.
  - `blender-generators` names `blender/validate.py`, which is actually `blender/generators/validate.py`.
  - `plan.md` still runs "Two sessions in the same checkout", which the pre-mortem lists as failure 9.
  - `reality-check.md` calls a character artist "probably the most valuable single commission"; `NOW.md` says "No commissions".
  - `NOW.md` points to `docs/measuring.md` and `docs/playtests/paper-1/README.md`, neither committed.
  - Decisions dated "22 October" were written on the 21st; the pre-mortem counted 64 such places, and `NOW.md` still opens "Where we are (22 October)".
- **Review loops that would not converge.** The birch took 34 Fable rounds, the gully steps six to reach "close", the stairs eight before they were rebuilt. The rules against this came afterwards.
- **Judgement done on the wrong model, then queued for redo.** Fable's own limit was spent by Wednesday, so the architecture inputs, pre-mortem and playtest report were written on Opus "to be checked by Fable". That is rework built into the plan.
- **Taste in a closed loop.** "Claude paints the targets and builds the parts; Fable judges against those targets; model readers read them." Delegating decisions widened the loop. The pre-mortem rates it Medium odds, High harm.
- **The method's fixed cost per kind.** "Every kind runs the full method … Each step is right; together they are a fixed cost per kind." Their own estimate for the gully's port is 16 to 22 Opus-days against three planned.

The note presents these practices as settled. The record shows several adopted the same day they were written, and some already contradicted elsewhere in the repo. Take the ideas, not the volume.

---

## 3. Practice by practice: what Understory has, and whether it should take it

| Overstory practice | Understory today | Transfer? | Concrete form here | Cost |
| --- | --- | --- | --- | --- |
| Shuffled-facts control | None. The OFF arm is the only comparison | **Yes, first** | A shuffled-reasons pack inside M38 (below) | A script; 2 to 4 sittings, about $10 to 20 |
| Frozen calibration set on model change (pre-mortem 12) | None written. Packs and answers from rounds 29 to 41 are on file | **Yes** | A rule in `docs/method/reading.md` (below) | 2 to 4 sittings per model or brief change |
| One job per session; fresh near 200k; no in-chat model switch | The opposite: "He switches in the same chat; the work carries on from the conversation" | **Yes** | `CLAUDE.md` Models; a handover paragraph in the PR description | A paragraph per handover |
| Pre-mortem before big builds | Pre-registration names the `WHY.md` warning it risks and what would change our minds; no pre-mortem | **Yes, for big rounds only** | A fresh Fable agent before the pre-register commit of homes, the band year, the human test and the front door's part two | One agent, about $5 to 9 (our design agents cost $7 and $9) |
| Usage scan and log | None | **Partly** | The scan's per-round cost by role in `RELEASE.json` and BOARD's outcome; check usage before a reading | About a minute a round; the script moved into `scripts/` as a neutral change |
| Findings with "what it does not show" and "what would disprove it" | Findings live in BOARD rounds, `reading.md` and SUMMARY | **Yes, small** | A "Findings" list in `docs/method/reading.md` | About 300 words, a line per round |
| NOW.md held to about 1,500 tokens | SUMMARY "one page" is 4,359 words; "Latest merges" goes back to round 27 | **Yes** | Latest merges trimmed to the last five (the rest is in BOARD), plus a word-count check | Trivial |
| Write "done" first | Pre-registration, which we invented and they adopted | Already have | n/a | n/a |
| Ladder of fidelity | Sizing on throwaway worlds before pre-registration (M37); rounds 35, 36 and 38 withdrawn before their test because of it | Already have | Optional rung: one throwaway smoke reading (below, with its risk) | 1 to 2 sittings |
| Stop when a loop won't converge | Done in practice: the accounts arc paused after rounds 29 to 31, close ties after 32 and 33 | Already have | Could be one line in `CLAUDE.md`; not needed | n/a |
| Strict review by a fresh agent | Re-derivation agent, outside reviews checked against the code, the seven skills | Mostly have | Folded into the pre-mortem agent for big rounds | n/a |
| Decisions delegated; only scope, play and permissions go to the owner | "What comes next is Øystein's call"; we merge our own PRs; "Waiting for you" is already a batch | **No** | Keep Øystein's control of the order. Overstory's own pre-mortem (6) shows the closed-loop risk | n/a |
| Decision register (123 rows) and digests | No large research corpus; BOARD (85,000 words) plus SUMMARY | **No** | The register's row format (question, evidence and lean, cost, settled by, urgency) is a good shape for "Waiting for you" | n/a |
| Two research tracks per system | Personality scientist skill; `docs/method/prior-art.md` | **No** | A short prior-art check inside the design of a new system (homes, the band) is enough | n/a |
| Paper playtests with persona agents | None | **No (their lane)** | Read their must-improve register through #60 and weigh it as an offer; don't run our own | n/a |
| Briefs: decision, files and sections, output length, under 500 words, longer to a file | Readers write answers to files and return 20 to 250 words; re-derivers return 360 to 940; design agents about 650 | Already close | Design-agent briefs name BOARD sections, not "read BOARD" | n/a |

### The top items in detail

**1. A shuffled-reasons control (instrument validity before round 42).**
- *Why:* SUMMARY says "what readers fault … is the reasons decisions give", and round 42 is "reasons that bear on the act". If the readers cannot tell a fitting reason from an unfitting one, round 42's reading cannot show its effect, whatever the engine does.
- *What:* M38 already re-reads round 41's packs with an every-fault brief. Add one pack made from those same lives, in which each line keeps its act but takes the reasons of another line of the same person. The pages stay fluent and true to the person; only the fit between act and reason is broken.
- *Bar, set before reading:* readers prefer the true version in at least 18 of 24 pairs, and the every-fault count flags "reason does not fit" at least twice as often in the shuffled version. If they don't, round 42 needs another instrument (for example M38's "whether the cited source supports the reason", scored by script) before it is read.
- *Where:* M38's check in BOARD, and a "Controls" paragraph in `docs/method/reading.md`. It reads packs already built, so it uses no fresh seeds. It is a method change, so it is pre-registered as M-rounds are.
- *Cost:* a text-permuting script, plus one role reading two parts (2 sittings, about $10), or two roles (about $20).

**2. A calibration set.**
- *Rule for `reading.md`:* "Before the first reading on a new reader model or a changed brief, one role re-reads round 40's busiest pack (+0.51 on file). If the effect falls outside its 95% interval, stop and say so in BOARD before reading the round."
- *Why:* Overstory's pre-mortem: "By April, Fable and Opus may be replaced, so reviewers' and readers' scores from November and March do not compare." Every "kept" since round 29 rests on one model. The same set also gives the human test its AI baseline.

**3. Session hygiene.**
- *Change in `CLAUDE.md` (Models):* a change of model starts a fresh chat on the new model from SUMMARY and the PR description, or runs as a fresh agent with a brief. A chat is restarted at a job boundary (a round's phase: design, build, read, record) or near 200k context.
- *Handover:* the draft PR description gets a short handover block (state, next step, open questions). The PR is already the claim and the checklist.
- *What the switch costs:* switching a 440k chat to Fable writes the whole context to Fable's cache. That is about $5.5 at the five-minute rate or $8.8 at the hour rate, about one or two reader sittings, and every later request re-reads at Fable's rate.
- *What it saves:* with the main transcript cut short we can't size the saving across the whole period (section 4). Overstory measured 25 to 30% for theirs. The quality argument holds anyway: performance degrades as context fills.

**4. Pre-mortem, big rounds only.**
- *Brief to a fresh Fable agent, under 500 words back, after the design and before `NN: pre-register`:* "It is three months on; [round] was merged and failed. Tell the most plausible ways, ranked by odds times harm: how, the warning sign, the cheapest prevention. Then what a game designer from Paradox or Bay 12 and a psychometrician would say we are missing."
- *Where the output goes:* preventions that are adopted go into the pre-registration; the rest are listed there as accepted risks.
- *Skip it for ordinary rounds:* the pre-registration already names its `WHY.md` warning and what would change our minds.

**5. A cost line per round.**
- *What:* run the adapted scan at the round's end and put the weighted cost by role (readers, re-derivation, design, main) into `RELEASE.json` and BOARD's outcome line.
- *Before a reading:* check usage before starting 12 Fable sittings. The three sittings cut off on 20 October at 10:47 cost about $13, 3.7% of everything measured.
- *What it gives Øystein:* a price on the reading choices. M38 found two roles resolve as well as three, which would cut a reading by a third (about $15 to 18 a round, roughly 28% of all measured usage). Which role goes is left to the human test, so the date of the human test now has a price.

**6. Findings with disproof conditions.**
- *What:* a short list in `reading.md`. Each finding gets one line: evidence, what it does not show, and what would disprove it.
- *Findings to list first:* the second-read lean of about +0.5; readers reward kinds of happening more than length; 24 pairs resolve about ±0.3; two roles resolve as well as three; the cap of three faults hides fewer faults.
- *Why:* this tells the human test which findings might be the AI readers' taste rather than people's.

**7. Session-start budget.**
- *What:* hold SUMMARY to one page (say 1,500 words) by keeping "Latest merges" to the last five, with older merges in BOARD where history belongs. Add a CI warning on its word count.
- *Also:* `CLAUDE.md` step 1 still says "Branch from current `main` (`round/28`)", a stale example at round 42.

**Optional, with a risk: a smoke reading on throwaway worlds.**
- *Why consider it:* rounds 29, 33, 34 and 39 failed partly on unfit reasons that a single reader on a throwaway pack would likely have quoted.
- *The risk:* it tunes the mechanism to the same instrument that judges it, against "Character lift is a diagnostic, never a target".
- *If tried:* one sitting, a different role from the test panel, never as a gate, and not before the human test has shown whether AI readers track people.

---

## 4. Our usage

### What was run

- **The script:** a copy of `tools/usage_scan.py` with four marked changes (`# ADAPTED`):
  - transcripts and repo paths from the environment, defaulting to `/root/.claude/projects/-home-claude` and `/home/claude/the-lab`;
  - "reader" counted as review and "re-derive" as measure;
  - our run scripts (`round.mjs`, `pairscore.py`, `npm test`, `run.sh`, the scoreboard, `identity2`) counted as measure;
  - `.ts`, `.mjs` and `.js` counted as code.
- **An extra summary,** `usage_split.py`, loads that copy and adds main against subagents, context per request, the re-reading share, and cost by role and round.
- Both were run with `python3 -I`. Outputs: `scan-totals.txt`, `scan-jobs.txt`, `scan-split.txt`, `scan-rounds.txt` beside this report.
- **Weights:** list price per token, from Overstory's table (Fable $10 in / $12.50 5-minute write / $20 1-hour write / $0.25 cache read / $50 out; Opus $4 / $5 / $8 / $0.20 / $20; Sonnet half of Opus). These are relative weights, not plan weights.

### The transcripts

- **Main session:** one file, `59c97036`. It starts with a compaction at 14:20 Oslo on 21 October ("This session is being continued from a previous conversation that ran out of context"). The request that made the compaction read 783k tokens. It runs to 19:17 and holds 185 requests and 16 messages from Øystein.
- **Subagents:** 78, from 19 October 23:15 to now, all children of this session. Three were still running at the scan: this agent, a sibling Opus agent and a Haiku guide.

### The numbers

| | Weighted | Share |
| --- | --- | --- |
| Everything on file (19 Oct 23:15 to 21 Oct 19:20) | $350 | 100% |
| Subagents | $333 | 95.1% |
| Main session (only its last 5 hours) | $17 | 4.9% |
| *The 5 hours both cover:* main / subagents | $17 / $4.5 | 79% / 21% |

**By role:**

| Role | n | Total | Median per job | Notes |
| --- | --- | --- | --- | --- |
| Cold readers (Fable 5.1) | 63 | $298 (85%) | $4.6 | First request about 73k, peak about 224k. Cost is 63% cache writes, 30% output, 7% re-reading |
| Re-derivers (Sonnet) | 10 | $15.7 (4.5%) | $2.1 | 21 to 100 requests, up to 22M tokens read, still cheap |
| Design agents (Fable) | 2 | $15.4 (4.4%) | $8.6 | Rounds 36 and 38, about 50 requests, peaks of 250k to 290k |
| Main session (Opus) | 1 | $17 (4.9%) | n/a | 62% re-reading, 23% cache writes, 15% output |
| In flight (Opus, Haiku) | 3 | $4.5 | n/a | The scan's "build" for these is a misclassification; they are analysis |

**Readings by round:**
- 3 sittings (rounds 29 to 33): $13 to 15.
- 6 sittings (rounds 34 and 37): $37 to 39.
- 12 sittings (rounds 39 to 41): $51, $54 and $45.
- One cluster of 3 sittings (20 Oct 10:47) was cut off.

**Main session context per request:**
- mean 289k, median 295k, max 783k (the compaction);
- by quarter of the transcript: 190k, 253k, 327k, 383k, 440k, so it grew about 50k an hour of work;
- 11.6 requests per message from Øystein;
- one cache rebuild above 50k (149k at 17:29).

**Re-reading (cache reads) as a share of all weighted usage:** 13.3% overall; 62% of the main session's own cost; 58% in the 5-hour window.

**By kind (the scan's classifier):** review 85.1%, orchestration 4.9%, measure 4.5%, docs 4.4%, build 1.3%, research 0%. Split by what each request did, the main session was orchestration 75%, docs 15%, measure 6%, build 4%.

**By model:** Fable 89%, Opus 6%, Sonnet 4.5%, Haiku about 0.

### What the numbers can show

- Where subagent usage goes. It is almost all the blind reading: Fable sittings that each write a pack of about 150k tokens into the cache and produce 20k to 70k tokens of output and thinking. That cost is the method itself, not waste. The only measured lever that keeps the same precision is M38's two roles in place of three.
- That our main session behaves like Overstory's. It reached the compaction point once. After compacting it grew from 143k to 440k in five hours, and re-reading was most of its cost.
- That a round's reading costs about $45 to 55 at list weights, against about $2 for re-derivation.

### What they cannot show

- **The main session's share over the whole period.** Its transcript before 14:20 today is gone (compacted in this container), while its subagents go back to 19 October. So 95% for subagents is an upper bound, and 5% for the main session a floor. Overstory's 54/46 split is not comparable.
- **Anything outside this container:** Øystein's claude.ai chats, other machines, earlier sessions.
- **Plan weights.** List price is a proxy. Overstory found $11.5 to $17 per point of the weekly limit, depending on the window. Fable may count differently against its own limit.
- **Whether the cut-off sittings of round 31 were re-run,** and at what cost. That would be in the missing main transcript.
- **Kinds of work inside the main session beyond tool names.** The classifier is a set of regexes. The in-flight analysis agents came out as "build".
- **The cost of quality.** No number here says that fewer readers, smaller packs or lower effort would keep the same decisions. Only M38's re-scoring speaks to readers, and only to precision.

### To Overstory's question

They asked: "Does Understory see the same split?" Not as far as we can measure. Our spend is dominated by the judging instrument (Fable readers), not by re-reading a long main session, though the main session shows the same growth pattern. A shared format would be the scan's job row with project-specific classifier rules (four changes here), not a hand-kept log.

## 5. Not checked

- Overstory's other branches' history.
- The paper-playtest method, which is uncommitted.
- Every research study in full.
- Whether their pre-mortem's preventions have since landed in `plan.md`. One clearly has not (sessions sharing a checkout).
- Fable's plan weighting.
- Whether the shuffled-reasons pack can be built from `pairarm.ts`'s output without changing what the reader sees in other ways (line count, kinds per life). That must be checked when it is built.
