# Round 46 review: taking sides

_Fable 5.1 (`reviewer`), 28 Oct 2026, `round/46` at `a652223` plus the uncommitted draft and seed claim. Read the note, the diff against `origin/main`, the sizing and its raw report, SUMMARY item 1. Ran two tracers on throwaway seeds 9041–9080 only (both arms, 10 years; scripts in the session scratchpad). No fresh world._

**Verdict.** The mechanism is sound behind its switch and reads people, not counts. The draft is not ready: its rows paragraph names a mechanism the trace refutes, and its keep rule has about a one-in-three chance of calling a passing round "not kept" on noise. Three BLOCKS in the draft; one SHOULD in the engine.

## BLOCKS

**1. Rows: the named path is wrong, and the stop trips on the draft's own expectation** (`reports/46-size.md:54–56`; draft table row 3 and "Expected").

The trace reproduces the sizing exactly (425.4 against 400.7 per 1000 adult-years, paired +24.7 ±21.4) and shows:

- Deciders who are a side's partner: **57 of 711** side-takings; 38 decided against their own partner. Their couples' rows in the following year: **8.7 per 100 couple-months, against 11.45** for every other couple. Zero rows cite a side-taking or descend from one by causes within three years. The partner path explains none of the rise.
- Couples with any party (decider or side) in the last year: 8,670 couple-months, rows **6.92 per 100 against 7.03** untouched. The rise is diffuse: mean couple tension **+0.020 ±0.013** (+8%) across every couple; mean stress +0.002 ±0.006 and drinking −0.005 ±0.008, neither off zero.
- The sizing's "rows" counts row *situations* (`trig === 'row'`, `sides.ts:236`), of which **39% are the solo `letslide` answer**, not a row. Raised rows between partners rose +0.26 ±0.41 per 100 couple-months (not off zero); the let-slide answers rose more (+10%).

The rise is real, small, untraced and not in the couples the mechanism touches: the draft cannot call it "named" (fail-if 3's clause). Worse, the stop "a 99% interval above zero" is tripped by the draft's own expectation: the paired sd is 66.8, so the 99% half-width on 40 worlds is 28.6; at the sized +24.7 the stop fires **36%** of the time, at the expected +18.5 **17%**. Fix: state rows as untraced (diffuse tension, not the partner path), count raised rows between partners (who.length 2), and either make rows a reported watch item or set the stop at a 99% bound above the sized +24.7 (a regression beyond what was seen).

**2. The accepted misses' regression bars fail on noise.** Fail-if 2's bar ("either ratio under 1.0", draft line 2661): with ~711 takings split in thirds (~237 each) and "neither" near 27%, the ratio's log-SE is about 0.15, so 1.28× sits 1.6 SE above 1.0 and 1.23× 1.4 SE: about **5% and 8%** false-fail each, 13% together. Fail-if 5's "more than 2 of 40 worlds" at an observed rate of 1 in 40 fails **8%** on Poisson noise. With rows, keep rule 3 fails a true-to-size round about a third of the time. Fix: for 2, bar the ratios at a one-sided 95% bound above 1.0 pooled over the lives worlds, or require both to point the wrong way; for 5, count side-taking templates (not worlds) and bar at more than 3, or judge only the copy-share bound.

**3. Length.** 564 words outside the table against the 400 cap (`CLAUDE.md`, Docs). Cuts: "The change" to four lines (−60); "Accepted misses" to one line each with its bar (−50); "Reported" to one line (−25); "What would change our minds" in round 45's form (−30); one of the `WHY.md` and game-lens lines (−30).

## SHOULD

**4. The other side's bond moves the wrong way** (`src/grammar.ts:551–557`, with `told` at `grammar.ts:475` and `witnessesOf` at `src/world.ts:658–669`). `told` makes the event `local`, so `witnessesOf` marks every `who` as `seen`, the other side `o` included, and the watcher block moves `o`'s liking of the decider by `expr.like × 0.25` before `afterSides` writes the real effect. For `sideagainst` the side taken first loses 0.05 and then gains 0.15 × 0.75 × 0.5 = +0.056 (`remember`'s k = 0.5): net **+0.006**, so "the side taken remembers" (design, `sides.ts:12`) is in effect cancelled. For `standby` the side not taken gains +0.0375 before losing 0.12. Co-workers and partners of all three are `seen` witnesses (reliability 0.8, `keepAccounts`) of a decision made in private. Fix: skip `inst.others` in the watcher loop for `SIDED` expressions, and let `told` mark non-parties `heard`. Re-run the sizing on 9041–9080; the counter does not rest on this path.

**5. A side who died or left in the month between.** `sidesTick` filters status at queue time (`sides.ts:111`), `situationsTick` checks only the actor (`src/situations/index.ts:99`), and body and mortality run before situations. `run` then names a dead person and `afterSides` calls `remember` on them (`sides.ts:269–271`; `sideNotTaken` alone guards). Rare; coherence fault 4. Fix: skip the instance when `t` or `o` is not `in`.

**6. The cut never offers making up** (`sides.ts:281–298`). `social.ts:503` ends a falling-out with `wantRestore(w, y, x, e.id)`; `cut` does not, so the decider who still cares never tries. `madeup` is a tie the counter counts. Add `wantRestore(w, p, n, e.id)`.

**7. Two things the draft should say.** The front door's shape changes (below): the draft should carry the sizing's line that #60 is told before merge. And fail-if 2's flips: the act's own consideration flips 4.2% (under the 5% bar); 13.1% is both fairness considerations together, the second being fix 1. Say so.

## Checked and sound

**Coherence fault 8** (`src/tools/coherence.ts:141`). Verified: `offerFeelings` (`src/feelings.ts:403–423`, round 45, on main) adds `dressdown` to a `collection` when the actor resents its target, and the collection's place is the bar (`src/situations/collection.ts:43`), never the actor's old workplace. The exemption hides no real fault. It is narrow: `backing`, `authorship` and `request-answer` sit in the same `SEVERE` set; better, require a work trigger for expression-typed events.

**The cut's mark** (`sides.ts:286–287`). Both ways, as `social.ts:461–466`; `checkBond` (`social.ts:392–407`) then applies the three-year gate, the 0.62 bar and `madeup`. The cut's own `cooled` is kept out of `riftOf` by its cause (`sides.ts:77`). Complete, but for item 6.

**`told` and `words`.** The repeat suffix runs (`grammar.ts:444–470`, key `rep:<expr>:<t>`): a second rift with the same named side appends "It had happened before, in 2031" to the kind-specific line; acceptable as a pattern. Evidence reliability 0.8 instead of 0.9; weights unchanged. `said()` (`sides.ts:249–253`) scans this month's events; a rift's deciders all run in the same pending loop and `afterRun` sets `sided` before the next, so "like @X" is right.

**`principled`** (`sides.ts:273`) is label equality with `rift.said`. `reasons()` (`src/decide.ts:231–253`) lists only considerations that favoured the chosen option, and prefixes "despite: " to the one against, so only `sideagainst` can be principled. Correct, but fragile: read `c.key === 'sides:fair'` instead.

**The seven questions.**

1. Readers: `riftOf`/`castOf`/`sidesTick` read events, bonds, friends, kin and feelings (`sides.ts:56–135`); `choice` reads bonds, regard (`telling.ts:357`), `knownBy` and four facets (`sides.ts:141–208`); `afterSides` reads the expression and causes (`sides.ts:259–279`); `feel` reads `f.stands` (`feelings.ts:85`); the sizing tool reads `decision.sided`.
2. No idle reason: every cause is a bond, the rift's act or a trait the expression prefers; the rift is each act's first cause.
3. Events change (three new types, `cooled`, resentments, trust); not words only.
4. CI sees it: `reports/46-ident.txt`, identical and words-identical with `OFF=sides` on 11–13. Off, every path is main's: the fallback pool filters only `SIDED` (`grammar.ts:291`); `named` keeps them out of ordinary candidates; `logged`, `shortText`, `told`, `words` are reachable only from a `sides` instance; the renewal fix is gated (`feelings.ts:85`). `FEELLOG` (`feelings.ts:82`) is a hook like `SCHED`, harmless.
5. One switch through `world.ts:411` and `src/tools/env.ts`: battery (`--switches sides`), scoreboard, packs, counters, `npm test`.
6. Twice: the same pair in one month is one choice (`sides.ts:129–131`); two pairs give two queued choices, both run (the one-per-actor rule covers matched situations only); the same pair across months (a rivalry, then each scheme found) asks again, the resentment renews by +0.3v, the cut happens once.
7. No count, rate or measure: `resented` reads a feeling, `INLAW` and `FELL_OUT` read liking, the dedupe is per month per pair; the `logged` exemption touches words and record only.

**Sizing and draft.** Every number in the draft's table matches `out-sides-p2/report.txt`; expectations are the sized numbers × 0.75 (24.8, +10.6, 14.1, +18.5). Counter sd 16.7 gives ±5.3 on the 40 lives worlds: 24.8 against the stop at 15 resolves; the paired rise's one-sided bound at the expected +10.6 is about +5.4. The reading guards only (73% of busiest pages touched; ±0.25 at 48 pairs). Keep rule 2's second test is fair but weak: the cut alone makes it positive; it tests that cuts are not offset by fewer natural endings, and should say so. Seeds 3749–3840 are fresh against main's "Next free 3749"; the claim is uncommitted and must go in the `46: pre-register` commit.

**Front door.** `events()` returns `plain(e)`, so `decision.sided` (with `@id`s in `rift.said`), three new event types, the cut's `cooled` text and `vis: 'local'` on private-feature acts reach Overstory; `person()` gains `tried` keys `rep:*`, `seen:sideagainst` and `cooled:<id>`. The fixture (`src/tools/fixture.ts:157`) exports only `decision.chosen`, so exported fixtures keep their shape.
