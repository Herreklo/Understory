# Round 44 sizing: feelings, part one

_22 October 2026, `round/44`, engine at `1a58fbe` (the sizing tool's last counter added after it). Throwaway worlds only (9001–9024), ten present years, each world run with feelings on and with `OFF=feelings`, paired. No fresh world was run. Full output: `reports/44-size.txt`; one line a world and arm: `reports/44-size-worlds.jsonl`; the earlier versions as run: `reports/44-size-earlier.txt`. Tool: `src/tools/diag/feel.ts`._

**Verdict: on the four kinds' own reasons, the primary counter sits on its stop line, so sizing stops here.** Removing a feeling flips the answer in **5.0% ±1.2** of the decisions it is weighed in (4.95% pooled, 99 of 1,998). With the debt's reasons counted, which the research note gives to the same feelings, it is **7.1% ±1.2**. The counter passes only when the debt is counted. Whether it may be is the review's call, not the sizing's: see "For the review". The other four checks pass. No weight was raised between versions, and there is no v5.

## What was built

Behind `OFF=feelings` (on by default), in `src/feelings.ts`:

- **Four kinds, each toward a named person.** Grief comes from a death or a break-up. Resentment comes from a wrong done to one: an act that hurt, done hard enough, outside a couple's row. Guilt comes from one's own wrong to someone one values. Gratitude comes from costly help, not owed.
- **What each holds.** A feeling holds its kind, its cause (an event), its object, its intensity and whether its cause still stands.
  - Meeting the object renews a standing resentment, and amends end its standing.
  - Grief fades on a trajectory drawn at onset: resilient, recovering, or chronic.
  - Gratitude and guilt stand until repaid.
  - Each fades monthly at its kind's rate, slowly while its cause stands.
- **How it weighs.** In a situation with its object (grief: any choice it bears on), a feeling at 0.12 or more is one consideration on every answer. It is read as written on the families its kind pulls toward and the other way on the rest. When it decides, it is the reason, named with its kind and object: "still sore at Agnes over not being there (2033)".
- **Its own answers.** At 0.3 or more, a resentment adds a dressing-down where its object needs something of the holder, and a guilt adds an apology where the two meet over old business.
- **The debt** (`Person.owes`, beside the gratitude or guilt that carries it).
  - It is set by a wrong (the wrongdoer owes) or by costly help (the one helped owes).
  - It is paid by any kind act toward the one owed. Gratitude repaid leaves a bond gain.
  - It is called in when the creditor next needs the debtor. In need, they ask the debtor first (`situations/request.ts`). In any decision with the debtor, the debt weighs for asking ("Una owed her (since 2031)"). The debtor weighs it in answering ("owed Tilly Shaw since 2035").
- **Lasting changes.** A resentment that still stands after three years becomes an exception ("never forgave…"). A grief still deep after two years becomes a mark.

The other files touched are `grammar.ts` (three calls), `life.ts` (the monthly fade), `body.ts` (grief at a death), `romance.ts` (grief at a split) and `situations/request.ts` (the debtor asked first). No file held by #89 is touched. With `OFF=feelings` every hook returns before any draw: CI's identity check passes, and passed locally on seeds 11–13. `npm test` passes with feelings on.

## Versions

|     | What changed                                                                           | Kind of change                             | The state it reads                                                                                                                                                                                                    |
| --- | -------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1  | as built from the note                                                                 |                                            |                                                                                                                                                                                                                       |
| v2  | gratitude only for help of some weight (intensity ≥ 0.5, from 0.35) that is not a duty | design: the note's "costly help, not owed" | v1 counted a weekly visit, a coin in the hat and a child at a parent's bedside (owed). Those were about three quarters of gratitude's onsets, and gratitude was carried in 27% of adult-months, over fail-if 1's line |
| v2  | the debtor found through any standing gratitude or guilt, not only the one `owes` slot | fix                                        | the slot holds only the latest debt, so later acts overwrote earlier ones                                                                                                                                             |
| v3  | the debt called in weighs in `withFeelings`, not in the request's `familyExtra`        | fix                                        | `run` keeps five considerations per option, wiring first, so the request's third extra was always cut. In v1 and v2 the debt was called in 0 times                                                                    |
| v3  | the random promise kept, not retired                                                   | design, on the lead's advice               | its ten line kinds left with it. That raised the top-25 share by 0.8 ±0.8 in v2, with no feelings in it, and moved kinds per page. The feelings are judged alone; the promise's retirement is its own step            |
| v4  | a feeling does not weigh where its cause is the event the situation answers            | fix (fail-if 3: a repeat inside one line)  | the line already gives the wrong as the situation's cause. "Still sore at Ryan over not being there" beside "Ryan wasn't there for Sam when it mattered" restated it                                                  |
| v4  | the debt's reasons renamed `feel:owes` and `feel:owed`                                 | fix                                        | main's hat reciprocity (round 23) already uses `owed`, and the counter picked it up in both arms                                                                                                                      |

**No weight was raised toward the 5% line.** No version changed a feeling's weight, curve, onset intensity or threshold, apart from gratitude's onset rule in v2, which narrowed it. v4's fix lowered the flip share: in v3, resentment was weighed in 5.8% of decisions, mostly the immediate answer to the wrong, which the situation already weighs. In v4 it is weighed in 1.4%. The debt was in the counter from v1 (`owes`). v3 added calling it in (`owed`).

The four-kinds counter exists only in v4. In v1 to v3 the per-kind rows are the closest measure (`44-size-earlier.txt`).

## The five checks (v4)

Each figure is the mean per world with its 95% interval between worlds, feelings on against off.

|     | Check                                   | Number                                                                                                                                                                                                                                         | Stop line                      |                                                                          |
| --- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| 1   | Everyone is always sore at someone      | Adult-months carrying each kind at ≥ 0.12: grief 5.5% ±0.7, resentment 12.7% ±1.7, guilt 4.7% ±0.5, gratitude 9.0% ±1.4. Most in any one month: grief 23.6% ±2.7, resentment 21.6% ±2.2. Grief-months over the switch-off grief emotions: 1.04 | a kind over 25%; grief over 2× | passes. Grief's busiest month comes close (a well-liked person dies)     |
| 2   | Feelings add reasons but change no acts | The four kinds alone: **5.0% ±1.2** (grief 4.5, resentment 6.0, guilt 8.6, gratitude 4.0). With the debt: **7.1% ±1.2** (the debt alone 10.0% ±2.1). Weighed in 4.7% of decisions, 7.3% with the debt                                          | below 5%                       | **on the line** without the debt; passes with it                         |
| 3   | It adds a new repeat                    | Copy share, every adult: −0.02 ±0.57 points. Busiest: −0.50 ±2.82. At random: +0.69 ±3.47. Top-25 templates: +0.34 ±0.89                                                                                                                       | must not rise                  | passes: nothing rises beyond its interval                                |
| 4   | Resentment escalates into feuds         | Per thousand adult-years: wrongs −9.0 ±13.1; provocations answered in kind −1.5 ±7.7; rows −5.6 ±27.8; dislikes −0.6 ±6.4; friendships ended +1.0 ±6.3                                                                                         | inside the off arm, or said    | passes. In v2, answers in kind rose by 13.4 ±11.3; v4's fix removed that |
| 5   | Readers cannot say what was felt        | 224 lines a feeling decided: 224 name kind and object, and 224 show the reason on the page                                                                                                                                                     | every line                     | passes                                                                   |

## Power

**The primary counter, at 20 or 24 fresh worlds** (per-world sd 2.7 with the debt, 2.9 without):

| True share                                | Point estimate ≥ 5% | 95% lower bound > 5% |
| ----------------------------------------- | ------------------- | -------------------- |
| With the debt, as sized (7.1)             | 100%                | 92–96%               |
| With the debt, shrunk by a quarter (5.4)  | 72–74%              | 6–8%                 |
| The four kinds, as sized (5.0)            | 49%                 | 2%                   |
| The four kinds, shrunk by a quarter (3.7) | 1–2%                | 0%                   |

A pre-registration shrinks the sized number toward zero. On the four kinds alone, the expectation then lands below the line, and the round is set up to fail its own counter. With the debt, a point estimate at or above 5% is likely, but a bound above 5% is not.

**The reading** (48 pairs, one pack busiest and one at random):

- **Pages touched.** A feeling decides a line on 23.6% ±11.4 of the busiest pages and 13.9% ±7.1 of the random ones: 0.29 and 0.15 lines a page.
- **Kinds of line per page.** Busiest −0.86 ±3.15, random −2.0 ±3.1, both inside zero. At about +0.05 raw a kind, that predicts −0.04 and −0.10 raw, both well below the ±0.25 a reading resolves.
- **Verdict.** The reading cannot see the effect. The round is judged on its counter and on "reads no worse". A harmless round passes the latter 77% of the time at round 40's spread.
- **The felt question.** It sees at most the 0.29 lines a busiest page carries.
- **The promise, had it been retired here.** v1 measured −2.2 ±2.8 kinds a busiest page, about −0.1 raw: a third of the −0.3 margin. Across versions, keeping the promise is worth roughly +0.8 to +1.3 kinds a page (v2 against v3, not paired). Keeping it in this round removes that cost.

**Exit 8.** Adults with a lasting change from the present: 14.0% ±2.1 on, 11.1% ±2.5 off, +2.9 ±2.6. That is about 0.8 marks of grief and 0.75 more "never forgave" a world.

**Debts.**

- A decision of the one owed, with the one who owes them, weighs the debt 282 times over 24 worlds (12 a world-decade, as many as the note's costly helps). They ask in 54% of them.
- 74 requests were answered by someone who owed the asker, who gave in 54%.
- Resentment's dressing-down was offered 15 times and taken 6. Guilt's apology was offered 7 times and taken 4.

## For the review

1. **Does the debt count toward the primary counter?**
   - For: the build plan's P1 includes "debts called in", and the note gives `owes` to resentment, guilt and gratitude. The debt is the part that changes most: 10% of the decisions it is weighed in.
   - Against: the counter was written as "removing the feeling", and the four kinds alone are on the line.
   - My recommendation: pre-register the whole mechanism's share as the counter, with the four kinds' share beside it. Name in advance that if the four kinds fall below 5% while the whole passes, the outcome says the debt carried the round.
   - The alternative is to stop now and return P1 to research. Resentment meets its object after the wrong in only 1.4% of decisions: about 25 a world-decade, against the note's 30 wrongs.
2. **What the lead asked for.** Every version change above is a fix or a design change, and the state each reads is given. The flip share was not a target in any of them.
3. **Known edges.**
   - An added answer raises a situation's intensity ceiling to its own.
   - The witness does not see feelings, so a small scoreboard effect is possible.
   - `owes` is one slot: the latest debt.
   - Out of scope: grief at a lost job or home (no person as its object), and decisions made through `decide()` rather than a situation.
4. **The battery.** `--flip 'feel:*'` gives the whole share in `measures.ts`, and `--flip '/^feel:(grief|resentment|guilt|gratitude)$/'` gives the four kinds. `feel.ts` takes `run A B rule years`, not the faults hook's arguments, so the pre-registration either adapts it or runs it beside the battery.
