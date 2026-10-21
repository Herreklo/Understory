# Understory: how the work has worked, rounds 19 to 41

An audit of the way of working, written 21 Oct 2026 from the repository at `69cbc1d` (main). Sources: `docs/BOARD.md` (lines 759 to 2405), `SUMMARY.md`, `WHY.md`, `docs/STATUS.md`, `CLAUDE.md`, `docs/method/*`, `reports/` (readings, re-derivations, external reviews, `M38-sittings.md`), the git log (280 commits) and the 69 pull requests. Line numbers refer to `docs/BOARD.md` unless another file is named. Counting scripts are in the same folder as this report (`board_sizes.py`, `grounding.py`).

## The short version

The project is very good at not fooling itself, and it has been poor at choosing what to test and at checking its measuring tools before trusting them.

- **Outcomes.** Of 25 experiments that changed behaviour between rounds 19 and 41, 10 were kept, 12 were not and 3 were withdrawn. From 25d to 39, **13 experiments in a row were not kept or were withdrawn** (about 20 hours of rounds, and about 1.9 million words read by AI readers on rounds that were not kept). Then 40 and 41 were kept.
- **They were catchable.** All 15 failures had a cheaper warning before the fresh-world test. In 13 of them, the number that failed the keep rule could be measured on throwaway worlds. About 42 of the 45 or so failed size predictions I tallied in 24a to 39 **overestimated** the effect, often by 2 to 10 times.
- **Research.** No pre-registration from 19 to 41 names a game precedent. None from 28 to 41 cites any literature. The outside review of 18 Oct named the right prior art and warned about four failure modes that later happened, but none of it reached a pre-registration or `docs/method/prior-art.md`.
- **The instrument.** The blind AI reading decided or co-decided every "not kept" since 25d. About 12 problems with it came to light, each after readings had already been used to judge rounds. The three-fault cap was full in 94 to 100% of versions **from the very first paired reading (round 29)**, but nobody noticed until round 41, 11 readings later. No null (A/A) reading has ever been run. No human has calibrated it.
- **Volume.** There are about 190,000 words of Markdown against 20,418 lines of engine code. BOARD alone is 85,485 words. BOARD entries for rounds 29 to 41 are 2.3 times longer than those for 19 to 25c, while the keep rate fell from 8 of 10 to 2 of 15. "One page" `SUMMARY.md` is 4,359 words.
- **The exit criterion.** After about 95 BOARD entries, 1 of its 9 points holds (6), 1 is at the line (4) and the rest are not met. Reach (point 2) was about 6% in round 22 and is about 6% now.

---

## 1. Outcomes by round, and why the failures failed

### 1a. Every round from 19 to 41

K = kept, NK = not kept, W = withdrawn before its test. "Class" applies only to NK and W rounds.

| Round | Date | What it tried | Outcome | Root cause class | Cheaper step that would have caught it |
|---|---|---|---|---|---|
| 19 | 17 Oct | school; losing touch | K, with 3 of its predictions failed (l.779–787) | – | – |
| 19b | 17 Oct | relative friendship bar | **NK**: it changed nothing (l.800) | Wrong bottleneck: liking, not familiarity, held people back (diagnosed only after the test, l.801) | The 10-minute diagnostic on used worlds that was run afterwards |
| 19c | 17 Oct | familiarity raises liking | K (1 failed prediction) | – | – |
| 19d, 19e, 21, 21b | 17 Oct | hygiene, words, audit | K | – | – |
| 20 | 17 Oct | love and rows | K "as a judgement" with 3 predictions failed and the gate failed (l.887); an outside review then found that half of all rows relieved nothing (bug, l.922) | Design flaw found at test; expectations guessed | Sizing: tension settles at 0.25, under the 0.35 bar (l.885), which the constants alone imply |
| 22 | 17 Oct | consequence map (measure) | K; 2 of 4 guesses wrong | – | – |
| 20b | 17 Oct | friction, learning, leaving | **NK** as it stood (fixes kept): divorce 7.6% against 0.5–2% (l.976, 986) | Design flaw: the stay decision ignores its inputs (a third leave whatever the reason, l.985) | Sizing, or a unit check of how the decision responds to its inputs |
| 20c | 17 Oct | leaving as a process | K with 3 predictions failed (l.1017) | – | – |
| 23a | 17 Oct | the record cites its sources | K; its main expectation failed (l.1029) | – | – |
| 23b | 18 Oct | reciprocity, answering jokes, failed plans | K; 2 of 5 failed. Reading the code first changed part 3, which would never have fired (l.1063) | – | (a good cheap catch) |
| H24 | 18 Oct | housekeeping | K; speed target missed | – | – |
| 24a | 18 Oct | words | K; pre-registered **after** its code (l.1109); the blind read missed its bar | – | – |
| 24b | 18 Oct | self-story always weighed | K; the smoke run found the self-story counting against its own answer, fixed before testing (l.1152) | – | (a good cheap catch) |
| 24c | 18 Oct | reasons as motives | K; reading bars missed | – | – |
| 25a, 25b | 18 Oct | what-if measure; chance per month and per person | K; 25b missed 4 expectations but fixed a real flaw in how random numbers were drawn | – | – |
| 25c | 18 Oct | people who steer | K with 5 expectations failed (l.1270–1278) | – | – |
| H25, F26 | 18 Oct | the record tells the truth; fixes from a review | K | – | – |
| 25d | 18 Oct | everyone wants something | **NK** (l.1377): 55% pursuing against 60%; reading +0.14 against +0.3 | Mechanism too narrow; expectations guessed; reading underpowered (a 4-reader panel later put the effect at +0.28 [−0.30, +0.85], l.1412) | Sizing (55%); a power check on the reading |
| H26 | 18 Oct | words second pass | Kept in part; `jobact` vetoed by the 6-world demography check (0.57 against 0.6, l.1406) | – | – |
| M26, T1, T2, T3, F27 | 18 Oct | paired reading; one-command runner; human patterns; property tests; the coherence floor | K | – | – |
| Q3 | 19 Oct | human study page and pilot | Part one K; the pilot was **never written up in BOARD** (l.1569, "Waits for the pilot") | – | – |
| 27 | 19 Oct | within-person states | **NK** (l.1609): single-act r .36 against a band of .10 to .30; readers preferred it in 4 of 12 | The hypothesis could not work at a plausible size. The outcome itself gives the arithmetic: a spread of 0.6 SD shrinks r by a factor of 1/√1.36 ≈ 0.86 (l.1604). The outside review of 18 Oct (§8) warned against this exact round | A back-of-envelope calculation; heeding the review |
| H28, H29, 28 | 19 Oct | portability; CI; the engine's own maths | K (H29 in part). 28's smoke run turned a full battery into an identity check (l.1665) | – | (a good cheap catch) |
| 29 | 20 Oct | bystanders keep accounts | **NK** (l.1728): reach 7% against 12%; decides 0.29% against 3%; 3 of 12 | Mechanism too faint and too widespread; reasons unfit (bond reasons that argued against the act); expectations guessed | Sizing. Prior art: the review's own advice was "actual decisions, not merely reputation-score changes", and round 29 built a reputation-score change |
| 30 | 20 Oct | accounts are told | **NK** (l.1772): decides 0.41% against 3%; reach 7.2% against 12%; gate regression −1.3 | Design flaw: an account was weighed beside every bond, so it was cited where it did not bear (l.1770, 1773); expectations guessed (the 3% bar missed by an order of magnitude twice, l.1793) | A design review of where `accountC` is read; sizing |
| 31 | 20 Oct | accounts only where they bear | **NK** (l.1822): decides 0.22% against 0.5%; reading 7 of 12 explained by order alone (l.1818) | Instrument (order lean); mechanism rare; design flaw (only 78 of 153 flips cited, l.1815) | The order lean was already in rounds 29 and 30's answers (+0.44, −0.58; M34 table l.1952) |
| 32 | 20 Oct | who carries the friendship | **NK** (l.1877): 4.4% of endings cite it against 15%; no reader quoted it | Mechanism too weak and invisible; first threshold inert (l.1860) | Sizing |
| 33 | 20 Oct | the reckoning | **NK** (l.1931): 34% against 60%; 48% against 60%; 3 of 12; it repeated every 3 years "in a friendship it changed nothing in" (l.1928) | Design flaw (repeats); expectations guessed | Sizing; reading 5 smoke lives (the "character reader" rule in `docs/method/skills.md` §3) |
| M34 | 20 Oct | 24 pairs; order as a term | K | – | – |
| 34 | 20 Oct | aftermath of a blow | **NK** on the reading alone (−0.12 ±0.41, l.2010); the mechanism worked (+17 points) | Reasons unfit (trait cues: 150 of 230 reasons on throwaway worlds, counted later in 37's pre-registration, l.2139); its pre-registered branch said "a question for the criterion, not another mechanism" (l.1991), and was not followed | Reading 5 smoke lives before the test; counting reasons on throwaway worlds |
| 35 | 20 Oct | fold routine on the page | **W** (l.2042): the fold took off 2–13% against an expected 20–50%; readers already preferred the longer life 70% of the time | Expectations guessed; premise contradicted by data on file | Sizing; re-analysis of readings 29–34, which is how it was caught, but only after pre-registering |
| M35, M36 | 20 Oct | lines and kinds terms; the pack shows what the app shows | K | – | – |
| 36 | 20 Oct | wants from occasions | **W** (l.2098–2124): 56% against 62–72%; occasions 27% against 60% | Expectations guessed; the reading targeted the wrong people (the busiest, l.2120) | Sizing |
| 37 | 21 Oct | aftermath with fitting reasons | **NK** (l.2171): reading +0.04; reasons fixed (17 good, 1 unfit) | Mechanism adds texture, not turns: kinds +0.4 against +1.5–4 (l.2166) | A power check: +0.4 kinds × 0.05 ≈ +0.02, invisible to a reading that resolves ±0.4 |
| 38 | 21 Oct | wants that collide | **W** (l.2215): baseline was 4.5 contests per world-decade, not the "about two" registered (l.2191); +10%, not double | Baseline wrong; displacement | Running the existing diagnostic once on the off arm |
| M37 | 21 Oct | size first, then register | K | – | – |
| 39 | 21 Oct | the four together | **NK** (l.2265): kinds +0.99 against a floor of +1.0; both readings better | Floor set from 8 sizing worlds with sd 2.0 (fresh came in at less than half the sized +2.35, l.2258) | Size on 20 worlds with an interval, as round 40 then did |
| 40 | 21 Oct | the four, faults fixed | K (sized +2.38 ±0.67 on 20 worlds; fresh +2.22) | – | – |
| 41 | 21 Oct | lines and reasons | K; "words only" turned out false (l.2404) | – | – |
| M38 | 21 Oct | uncapped faults; reader subsets | Part one done (`reports/M38-sittings.md`); part two is PR #66, open | – | – |

### 1b. What the table says

**Two eras.** In 19 to 25c, rounds were judged mostly on numbers and could be "kept as a judgement", so 8 of 10 experiments were kept even with failed predictions (20: 4 marked failures plus the gate; 25c: 5 failures). From 25d, the blind reading entered the keep rule, explicit keep rules followed (first written as "Keep rule:" at l.1799, round 31), and 0 of 13 were kept until sizing came in. The stricter standard was right. Pairing it with guessed expectations and an unvalidated instrument is what made the run of failures.

**Root causes of the 15 NK and W rounds.** Several have more than one cause:

| Class | Rounds | Count |
|---|---|---|
| Expectations guessed, or baseline wrong | 25d, 29, 30, 32, 33, 35, 36, 38, 39 | 9 |
| Mechanism too weak, rare or faint | 25d, 29, 31, 32, 37 | 5 |
| Design flaw found only at test | 20b, 30, 31, 33 | 4 |
| Instrument problem decided or blurred the verdict | 25d, 31, 34, 39 | 4 |
| Reasons that do not fit the act | 29, 33, 34 | 3 |
| Hypothesis wrong or infeasible, knowable beforehand | 19b, 27, 35 | 3 |

**Systematic optimism.** I tallied every failed size prediction in 24a to 39, about 45 of them. All but about three overestimated the effect:

- reach 12% predicted, 7% measured;
- "decides" 3% predicted, 0.3–0.4% measured;
- 60% predicted, 34% measured;
- 15% predicted, 4.4% measured;
- a fold of 20–50% predicted, 2–13% measured;
- kinds +1.5 to 4 predicted, +0.4 measured;
- "double" predicted, +10% measured.

The underestimates were 25b's strong kinds and 31's flips (5% against 1.5%). Across all outcomes from 19 to 41 there are 236 passes and 84 failures. Those marks include identity checks and test-suite runs that nearly always pass, so the failure share among substantive predictions is well above a quarter.

**What was cheaper.** Every one of the 15 failures had a cheaper signal before the fresh-world test:

- **13** failed a number measurable on throwaway worlds (19b, 20b, 25d, 27, 29, 30, 31, 32, 33, 35, 36, 38, 39).
- The other two (34 and 37) failed only on the reading. For 37, a power check from the kinds model predicted an effect of about +0.02. For 34, the trait-cue reasons were countable on throwaway worlds, and 37's pre-registration did count them (150 of 230).
- Three rounds (35, 36, 38) were withdrawn **after** a pre-registration was written and pushed. M37 (l.2223) says this cost "a pre-registration, a build and a night's order" each time.

**Sizing works when it is done properly.** Round 39 was sized on 8 worlds: +2.35 sized, +0.99 fresh. Round 40 was sized on 20 worlds with an interval: +2.38 ±0.67 sized, +2.22 fresh.

---

## 2. Research before building

I counted citations in each pre-registration (before its outcome; `grounding.py`) and checked them by hand.

| | Rounds 19–27 (experiments) | Rounds 28–41 (experiments) |
|---|---|---|
| Cites personality or social science | 12 of 13 (19, 19b, 19c, 20, 20b, 20c, 23b, 24b, 24c, 25c, 25d, 27; T2 has 8 citations) | **0 of 14** |
| Names a game or system precedent (Crusader Kings, Dwarf Fortress, The Sims, Talk of the Town, Football Manager, RimWorld, Versu…) | **0** | **0** |
| Studies the code or data before designing | Some (19 "measured before"; 23b's amendment from reading the code; 24c counted on throwaway worlds) | More, and increasing (29 "what the code has today"; 32 "diagnostic before the design"; 37 counted; 39–41 sized) |

**Named games appear nowhere in BOARD.** They appear only in `CLAUDE.md`, `WHY.md`, `notes/`, `docs/method/skills.md`, `docs/method/prior-art.md` and one outside review. Every pre-registration from 29 on has a "game lens" paragraph, but it describes an imagined player moment and never cites what an existing game learned.

**The best research input was ignored.** The outside review of 18 Oct (`reports/external/2026-10-18-consequential-lives.md`, §2 and §12) named Talk of the Town, PsychSim, FAtiMA, Versu/Comme il Faut and story sifting. It also warned about these risks:

- §8: adding trait variability might hide thin situations. Round 27 failed exactly this way.
- §2: information should produce "actual decisions, not merely reputation-score changes". Round 29 built faint bond shifts that decided 0.29% of choices.
- §12: aftermath "can introduce artificial, overly dramatic reactions", and intentions "can produce repetitive goal loops". Round 33's reckoning recurred every three years when nothing had changed, and round 34's routines read as "a trait looking for an act".

None of PsychSim, FAtiMA or Versu appears in `prior-art.md`, `STATUS.md`, `SUMMARY.md` or `notes/`. Story sifting is listed in `prior-art.md` as "used in surfacing what matters", but there is no code for it (`grep -ri sift src` finds nothing).

**Did grounding help?** The data cannot say cleanly. Grounded rounds were kept 8 of 12 times and ungrounded rounds from 28 on 3 of 14 (28, 40, 41), but grounding disappeared at the same moment the keep rule became strict, so the eras are confounded. What the data does show is that grounding in the literature did not make predictions accurate: grounded rounds 20, 20c, 25c and 27 each failed 3 to 5 of their predictions. Literature tells what exists in people, not how large an effect will be in this engine. Only sizing tells that.

**The cheapest research was data already on file, and it was used only after failing.** Round 35 found the length preference by re-reading packs 29–34. Round 36 found the kinds effect by rebuilding 84 lives already read. M34 re-scored 29–33 and showed that round 31's verdict was the order effect. M38 found that two readers resolve a round as well as three, without a new reading. Each of these cost minutes and changed the plan. Each came after a failed round, not before a design.

---

## 3. The instrument: the blind AI reading

### 3a. Every problem found, in order

| # | Problem | Found | Readings already used to judge rounds |
|---|---|---|---|
| 1 | Single, unpaired readers comparing 12 different lives per arm are swamped by differences between lives; the gate was read from a point estimate | M26, 18 Oct (l.1412) | about 7 (23b, 24a, 24b, 24c, 25c, 25d, F26) |
| 2 | The paired reading was validated only on an easy contrast: a true page against the same page shuffled, worth 2.0 points out of 5 (l.1431), while rounds seek about 0.3 | Never named by the lab | all that followed |
| 3 | People picked from one arm regress toward the mean in the other (on-arm pages 15% shorter) | Round 29, 20 Oct 00:55 (l.1727) | 3–4 (M26, F27, 27, 29) |
| 4 | Readers score the version they read second about 0.5 higher. The lean varies by round from −0.58 to +0.60, as big as the effects being sought | Round 31, 20 Oct 12:45 (l.1818); M34 table (l.1952) | 5 (F27, 27, 29, 30, 31) |
| 5 | 12 pairs are too few; majority and α were used as gates | M34, 20 Oct 18:40 (l.1936) | 6 (27, 29–33) |
| 6 | Readers prefer the longer life (70%); the two arms differ by 16–28 lines (sd) | Round 35, 20 Oct 21:15 (l.2045–2047) | 6 (29–34) |
| 7 | The pack showed "despite" notes that the app hides, on 1 in 11 lines with reasons | M35, 20 Oct 21:40 (l.2056) | every reading before |
| 8 | The kinds of thing in a life confound the score; reading the busiest cannot see a change aimed at the quiet majority | Round 36, 20 Oct 22:10 (l.2120–2122) | every reading before |
| 9 | The fault cap of three is saturated, so fault counts are zero-sum ("readers quote the next-worst thing") | Round 41, 21 Oct 11:45 (l.2402) | **11**. Fault bars were in the keep rules or decisions of 30, 32, 33, 34 and 37, and in round 40's motivation ("unfit reasons 67 against 50") |
| 10 | One model (Fable 5.1) in three roles: the third reader barely narrows the interval, and "reads better" flips with the choice of roles in 3 of 6 readings | Outside review and M38 part one, 21 Oct (`reports/M38-sittings.md`) | 13 (every reading 29–41) |
| 11 | Never calibrated against people. The designer's own Quiz II showed the page making a skilled reader worse (17 → 13 of 20, l.600–613). The R19c review (18 Oct) made a blinded human study its "Priority 0". The Q3 pilot was never written up | Known since 17 Oct; the human test is still planned for after round 42 | all |
| 12 | Same model, two jobs: Fable 5.1 wrote the pre-registrations of 29–33 (commit co-authors) and was also the blind reader. The readers were blind to the arm, so this is a risk of shared taste, not a leak | This audit | 29–33 |

**My check of problem 9.** Counted from the answer files in `reports/`, the share of versions given exactly three faults was:

| Round | Share with exactly 3 faults |
|---|---|
| 29 | 94% |
| 30 | 100% |
| 31 | 100% |
| 32 | 97% |
| 33 | 97% |
| 34 | 99% |
| 37 | 99% |
| 39 (busiest / random) | 97% / 92% |
| 40 (busiest / random) | 100% / 94% |
| 41 (busiest / random) | 99% / 92% |

A one-line histogram of the first reading's output would have shown it.

### 3b. Problems in the other checks, found the same way

- **The identity signature missed state.** It did not hash records kept on the world (the friendship record, told accounts, plans, rivalries) until #43 (20 Oct 16:40). So the "off arm identical to main" claims of rounds 29–32 used a checker blind to their own state. It still omits each person's event list (outside review of 21 Oct, finding 2; open).
- **Switches did not reach every check.** `ON=<switch> npm test` set the switch in only 3 of the 9 runners until #38 (20 Oct 10:32), so "npm test with it on" in rounds 29–30 was partly untrue.
- **The demography check is fragile.** It runs on 6 worlds over 20 years against a line of 0.6. Main stood at 0.78, and with the four on it was 0.61–0.69. It vetoed `jobact` (H26) and round 41's first build, and nearly failed round 39. F27 (l.1542) said it "should be judged on twenty worlds before it decides a round". It still runs on 6 (`package.json`: `demography.ts 6 20`).

### 3c. What this says

The lab validated its scoreboard well. The null-control "donor" reader came in 4.9 points below the notebook (l.1430), and an outside review independently checked the witness against hidden truth. It never validated the reading at the job it was given: detecting effects of about 0.3 out of 5. Each problem was found by a round that failed, then fixed in a method round, and the fix was applied going forward with no verdict re-judged. That is honest, but it means about 13 rounds were judged by a tool still being debugged.

Three cheap checks would have caught most of these on day one:

1. A null reading: the same arm against itself, or two off-arm worlds. It shows the lean, the noise and false positives.
2. A sensitivity test at the effect size the rounds seek, for example a page with one known small degradation.
3. Distribution checks on the answers: ceilings, caps, ties, and position effects.

None was ever run.

---

## 4. Volume and cost

| What | Size |
|---|---|
| All Markdown (excluding `node_modules`, `dist`, `out-*`) | about **190,000 words** |
| `docs/` | 115,628 words, of which BOARD is **85,485** (2,404 lines, about a novel) and `docs/scale` 15,995 |
| `reports/*.md` | 59,063 words. All of `reports/` is 9.5 MB and about 1.2 million words, of which reading packs are about 988,000 |
| Root files | `SUMMARY.md` 4,359 words; `STATUS.md` 6,603; `ARCHITECTURE.md` 2,919; `CLAUDE.md` about 1,950; `WHY.md` 1,992 |
| Engine code (`src/` without tools) | **20,418 lines** (after prettier spread 7,374 dense lines to 19,695, l.1074); tools 8,963 lines |
| Markdown against engine | about **9 words of prose per line of engine code**; BOARD alone is 4 words per line |

**Length of BOARD entries (pre-registration, amendments and outcome; `board_sizes.py`):**

| Rounds | Mean words per entry | Pre-registration words |
|---|---|---|
| 19–25c | about **840** | 170–600 for most (20 and 20b about 1,000) |
| 29–41 | about **1,940** | 750–1,310, typically 1,000–1,300 |

Outcomes in 29–41 run 500 to 1,080 words.

**Does it serve decisions?** Some of it does:

- **Raw data serves decisions.** The committed packs, keys and answers made possible the four cheapest and most useful findings of the period (M34's rescoring, round 35's length effect, round 36's kinds effect, M38's reader subsets).
- **Short process rules serve decisions.** The keep rule, the switch rules and the seed ledger are short and doing their job.

The prose has become a cost:

- **`SUMMARY.md` is not one page.** It says it is "one page, plain words" but holds 4,359 words, including 34 "Latest merges" entries of history. That breaks its own rule that history lives in BOARD and git.
- **`STATUS.md` is stale and carries history.** Its header still says "status (round F26, 18 Oct 2026)", its readability table is from round 23b, and its "known weaknesses" retell rounds 25d, 27 and 29–34. `CLAUDE.md` says `docs/` holds the current design only.
- **Every outcome is written three times**: in BOARD, in SUMMARY's latest merges and in STATUS's weaknesses or exit-criterion text.
- **Starting a session means reading about 14,000 words**: SUMMARY, `CLAUDE.md`, `WHY.md` and BOARD 39–41, per SUMMARY's "Start here on Monday". With one job per session, that cost is paid every time.
- **The prose is dense.** A single numbered item often runs to 200–300 words of inline statistics (for example l.1342), which is hard for the owner to decide from.
- **Readings are expensive.** Since round 39 a round's readings are about 173,000 words per reader, or about 520,000 words read for three readers. The rounds not kept, 29 to 39, consumed about 1.9 million reader-words. SUMMARY itself says "Credits are what limits the work now".

**Verdict.** The documentation now costs more than it returns. Records of what was decided and why are valuable. Long narrative restatements of numbers are not: no decision in the period turned on a sentence in a 1,300-word pre-registration that a 300-word one plus a table would have missed.

---

## 5. Decisions and handoffs

**The plan churned.** The top item of "Next, in order" changed 9 times between 20 Oct 15:13 and 21 Oct 11:46. Seven of those changes followed a failure or withdrawal and switched to a different arc:

> accounts → close ties → consequences that last → the page → who wants things → aftermath → contests → the bundle → lines and reasons → M38

Five arcs held the top spot within 21 hours (from the `git log -- SUMMARY.md` history).

**Reversals.**

- **The human test moved twice in one afternoon.** It moved up to "beside the rounds" ("it is the calibration of the readers every round is judged by", PR #58, 14:28). It then moved to "after round 42" (PR #65, 17:56). Both were agreed by Øystein.
- **Round 34's branch was set aside.** Its pre-registered branch "a question for the criterion, not another mechanism" (l.1991) fired. The outcome softened it to "a design question worth one more look" (l.2014). The next round was another version of the mechanism (37), and the criterion question was never taken up.
- **A stopped arc went live anyway.** Round 31 said "the accounts arc stops here to be rethought … start from the moment a player could notice" (l.1823). Telling then went into the default engine through the bundle of rounds 39 and 40, under a weaker "reads no worse" bar than the "reads better" bar each part had failed alone. STATUS weakness 6 still says the arc "is still to be rethought". With the four on, the share of decisions whose top reason passes the honesty check fell from 75% to 70% (l.2317).
- **Built, deleted, rebuilt.** Round 25d's code was deleted in H31 (19 Oct 21:31) and wants were rebuilt as occasions in round 36 (20 Oct 21:35).

**The same idea, retried.**

| Idea | Rounds |
|---|---|
| Couples | 20 → 20b → 20c |
| Wants | 25c → 25d → 36 → 39 → 40, with 43 planned |
| Accounts | 29 → 30 → 31 → 39 → 40 |
| Aftermath | 34 → 37 → 39 → 40 |
| Close ties | 32 → 33, then paused |
| Page and words faults | 19e, 21b, 24a, 24c, H25, H26, F27, 35, M35, 41, with 42 planned |

Iterating is normal research. The cost here is that each iteration was a full round (pre-registration, build, battery, three-reader reading) rather than cheap work on throwaway worlds followed by one confirming test.

**Owner decisions.** They came quickly and at odd hours. Øystein chose direction four times in about 10 hours over 20–21 Oct: "stakes first" (l.2175), "bundle, judged on kinds" (l.2234), "four again, fixed" (l.2278), "start with 41" (l.2329). Blocking was modest:

- PRs #51–#54 waited about 8 hours overnight before merging.
- Round 38 ends "nothing in the plan's order until Øystein has seen this" (l.2219).
- SUMMARY lists four items "Waiting for you".

The bigger issue is that the owner is asked to re-plan after each result, from long documents, rather than having agreed in advance what each result would lead to.

**Things lost at handoffs.**

- Round 25d's reading files were never committed. The reading "was done in the local session and reported in its status" (l.1374).
- The Q3 human pilot's results never reached BOARD (l.1569).
- Several rounds were finished by "the cloud session after the local chat stopped" (25d, H26, M26).
- Pre-registration times were written from an estimated clock and ran up to 30 minutes ahead (l.1049, 1643, 1672). Round 35's header says 21:35, but it was pushed at 20:52 (l.2042). The push-timestamp rule fixed this.
- CI was unavailable twice for billing reasons (H29 on 19 Oct; rounds 37 and 39), so identity checks ran locally.

---

## 6. What has worked, and must be kept

1. **Switches plus the CI identity check against main.** Every round's off arm was proved identical to main, and the identity check also caught gaps in itself (#43). This is what made it safe to fail cleanly (code kept behind `ON=`), to bundle four mechanisms later, and to settle round 28 in minutes: no event changed over 40 worlds and about 400 simulated years (l.1676).
2. **Pre-registration timestamped by the push, never tuned after a result, and every breach recorded.** The breaches are on the record: 24a, H26 and M34–M36 were registered after their code; clock-ahead times are noted. The lab let round 39 fail at +0.99 against a floor of +1.0. The outside review of 21 Oct calls this culture "a strength", and it is the reason this audit can be done at all.
3. **Committing raw reading data (packs, keys, answers).** It paid for M34, rounds 35 and 36, M38 and this audit's fault-cap check, each for minutes of work.
4. **Sizing on throwaway worlds (M37), and every smoke run before it.** Smoke runs caught: 24b's self-story penalty, 25d's demography failure, 23b's part that would never fire, 28's no-op battery, 29's accounts formed from states, and 32's inert threshold. Round 40's 20-world sizing predicted its fresh result to within 0.2.
5. **Independent re-derivation.** A separate agent, cheap on Sonnet, re-derived the headline numbers of every round from 23b to 41. It found the `pair.ts` t-value bug (l.1093), the `tanh` bound (l.1674), the narrowness of α (l.1728) and that the +17 counted the aftermath's own acts (l.2013). It never had to overturn a verdict, which is what it is for.
6. **Outside reviews read against the code.** About a dozen from 17 to 21 Oct (R13, two of R19, R20, 23b, 24b, H25, R19c, the 18 Oct design review, 9a82092, e22c94a, bffdb33). At least nine found confirmed defects: the row bug (l.922), `countfair` changing 5.9% of decisions (F26), the identity hash gap, the switch-environment gap, `citeFlip`, and round 41's "words only". The lab's rule of checking before acting is right.
7. **The seed ledger with its CI check.** It caught overlapping ranges in F27 (l.1543) and M26 (l.1425).
8. **The tools.** The one-command battery (T1: 47 minutes; it reproduced F26 to the figure and found bugs in the hand-run battery), property tests over many seeds (T3: two real faults), the coherence counter in `npm test`, and the what-if measure with its placebo (25a/25b, which found a real flaw in the engine's random numbers).

---

## 7. Recommendations, ranked by expected value

Each recommendation changes what a session does. Several replace existing text rather than adding to it.

### 1. Validate the reading before it judges another round, and calibrate it against people

- **Fixes.** About 12 instrument problems found only after readings had decided rounds. A three-fault cap full from the first reading. A lean (±0.5) as big as the effects sought. A reading validated only on a 2-point contrast. No null reading. No human calibration (§3).
- **Practice.** One method session, M39, before round 42's reading. It runs on packs already on file where it can:
  - **(a) A null reading:** two off-arm versions, or one version against itself with only the order varied. The expected effect is 0, and the reading reports its false-positive rate and lean.
  - **(b) A sensitivity test:** pages with one planted small fault per life. Can it see an effect of 0.3?
  - **(c) Answer-distribution checks built into `scripts/pairscore.py`**, warning on any cap, ceiling or tie rate above 50%.
  - **(d) Fix in advance which two reader roles are used** (M38 part one).
  - **(e) The human test before any further "reads better" keep rule.** Round 42 can be judged on its counter and "no worse"; nothing judged on "reads better" until humans have read.

  Write each instrument's validated range as five lines in `docs/method/reading.md` ("validated for: null, an effect of 0.3, no cap saturation; not validated for: human preference").
- **Cost.** One or two reader sittings, about one round's reading. One prep session. Øystein's 3 to 4 hours with 3 or 4 readers.

### 2. Size before registering: at least 20 throwaway worlds, a power check, predictions taken from the sizing

- **Fixes.** 13 of the 15 failures failed a number measurable on throwaway worlds. About 42 of the roughly 45 failed predictions were overestimates, often 2 to 10 times too big. Three rounds were withdrawn after pre-registering. Round 39's sizing on 8 worlds was off by more than half.
- **Practice.** The build session ends with `reports/<round>-size.md`, which has one table:
  - the floor metric and the round's own counts, with a 95% interval over at least 20 throwaway worlds;
  - kinds and lines per life on the reading's people;
  - the predicted reading effect (from the kinds model, about +0.05 per kind);
  - whether 24 pairs can resolve that effect.

  The rule: no pre-registration unless the predicted effect clears what the reading can resolve, or the claim is "no worse". Expectations in the pre-registration are the sized numbers shrunk toward zero, never fresh guesses. Keep a running `docs/seeds.md`-style log of predicted against actual, to check the shrinkage.
- **Cost.** 20 to 40 minutes of compute per design. It saves whole rounds (1.5 to 2.5 hours each, plus a reading of up to about 520,000 words).

### 3. A research session before any new mechanism: prior art, literature sizes, data on file, a pre-mortem

- **Fixes.** No game precedent in any pre-registration; no literature from 28 on. The 18 Oct review's prior art and its warnings about four failure modes never reached a design. The most productive analyses (35, 36, M34, M38) were done on data already on file, but only after failing.
- **Practice.** A one-session job with one output, `notes/research/<topic>.md`, at most one page:
  - what Talk of the Town, CK3, Dwarf Fortress, The Sims, Versu or PsychSim did for this, and what went wrong for them;
  - effect sizes from the literature;
  - what the data already on file says (re-score or re-count existing packs and worlds);
  - a back-of-envelope estimate (as in round 27's 1/√1.36);
  - a five-line pre-mortem: "this fails if …", each line tied to a check in recommendation 2.

  The pre-registration cites it in one line. Fold the 18 Oct review's list into `docs/method/prior-art.md` once.
- **Cost.** One session of about 1 to 2 hours, and no compute.

### 4. Make the pre-registered branches binding, and plan with branches agreed in advance

- **Fixes.**
  - The top priority changed 9 times in 21 hours (five arcs).
  - Round 34's own branch was set aside.
  - The accounts arc was "stopped to be rethought" and then went into the default engine through a bundle judged on a weaker bar.
  - The human test was moved twice in 3.5 hours.
  - The owner re-plans after each result.
- **Practice.**
  - **Branches decide the next job.** SUMMARY's "Next" holds the plan for the week with an outcome branch per item ("if 42 is kept → 43; if not → …"), agreed with Øystein once a week. When a pre-registered "what would change our minds" fires, the next session's job is what it says, unless Øystein overrides it in one dated sentence in SUMMARY.
  - **Bundles cannot bypass failure.** A bundle may include a part only if that part met "no worse" on its own.
  - **Retries have a limit.** At most two full rounds per arc before a research session (recommendation 3) has to restart it.
- **Cost.** About 15 minutes of Øystein's time a week. No compute, and fewer rounds.

### 5. An adversarial review of the design and the diff before any fresh world

- **Fixes.** At least nine outside reviews in five days found defects the round process missed: the row bug that spoiled round 20's numbers, `countfair`, the identity hash gap, switches not reaching six runners, `citeFlip`, and round 41's "words only". Design flaws were found only at test in 20b, 30, 31 and 33.
- **Practice.** After sizing, a separate agent (a different model from the builder) gets the diff, the sizing report and a fixed checklist of six questions:
  1. Where is the new state read?
  2. Could it be cited where it does not bear?
  3. Does it change events or only words? (check with `sig.ts`)
  4. Does the identity check see the new state?
  5. Does the switch reach every runner?
  6. What happens when it fires twice?

  Its findings, and how each was fixed, go in the PR description. Nothing is added to BOARD.
- **Cost.** About 20 to 30 minutes of agent time per round.

### 6. Shrink the documents to what decisions need

- **Fixes.** About 190,000 words of Markdown against 20,418 lines of engine code. BOARD entries grew 2.3 times longer while keep rates fell. A 4,359-word "one page" SUMMARY. A stale STATUS that carries history. Outcomes written three times. About 14,000 words to read before a session starts.
- **Practice.**
  - **SUMMARY becomes at most 600 words:** where we are, the next three jobs with their branches, and a "Decision needed" box (at most 150 words, 2 to 3 options with a recommendation). Latest merges move to git and BOARD.
  - **Pre-registrations at most 400 words plus the sizing table:** hypothesis, sized numbers, keep rule, branches, research link.
  - **BOARD outcomes at most 300 words plus a table.**
  - **STATUS holds the current state only** (the exit criterion table, the switches), with its header date set by the outcome commit.
  - **The start-of-session read** becomes SUMMARY and the open PR's description.
- **Cost.** One housekeeping session, a neutral change. It saves about 10,000 words of reading per session afterwards.

### 7. Give each job type a contract, so one job per session does not lose things

- **Fixes.** 25d's reading files were never committed. The Q3 pilot never reached BOARD. Rounds were finished by a different session than the one that started them. The owner switches models by hand mid-chat.
- **Practice.** Write a list of six job types in `CLAUDE.md` (replacing the Models section):
  1. research
  2. design, build and size
  3. review
  4. pre-register and run the battery
  5. read
  6. outcome

  Each type names its model, its inputs, its one output file, and "done when". Every session ends with the PR description as the handoff: what was done, what is open, the next job. A session may not end with uncommitted data.
- **Cost.** One short session, then a little less overhead every session.

### 8. Harden the integrity checks that work, and stop fragile checks from vetoing

- **Fixes.**
  - The identity signature still omits each person's event list (review of 21 Oct, finding 2).
  - The 6-world demography check vetoed H26 and round 41's first build, sits at 0.61–0.69 against a 0.6 line, and F27 asked for 20 worlds.
  - Round 41's "words only" claim was never checked with `sig.ts`.
- **Practice.** Three neutral PRs:
  1. Hash each person's event list, or check it against `world.events` in the invariants.
  2. Judge demography on 20 worlds in the battery, and keep the 6-world run in `npm test` as a warning, not a gate.
  3. Make `sig.ts` mandatory for any change described as words only.

  Keep re-derivation, scoped to the keep-rule numbers only.
- **Cost.** About one session in total.

**If only three things change:** validate the reading (1), size before registering (2), and run a research session before designing (3). Together they address every one of the 15 failures in §1.
