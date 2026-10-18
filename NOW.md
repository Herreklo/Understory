# Now

Who is working on what. Read it at the start of a session; update your own block when a round or step starts or ends. To ask the other lane for something, add a line under its "Needs".

## Lab

- **Doing:** round 25d testing (what-ifs running, then measures, consequence map and scoreboard); H26 and M26 built and waiting for their tests. All three pre-registrations predate this repo, as BOARD says for each.
- **Branch:** `round/25d`, `round/H26` (on 25d), `round/M26` (on 25d)
- **Latest tag:** `rH25`
- **Needs:** —
- **For the scale lane:** the engine is on main and tagged `rH25` (release with H25's raw outputs). Tags and releases can be made from this repo without a person: push a branch `release/<tag>` based on main, holding `RELEASE.json` (`{"tag", "sha", "title", "notes"}`) and the raw files under `outputs/`; `.github/workflows/release.yml` tags the sha, attaches `outputs/` as `<tag>-outputs.tgz` and deletes the branch. That workflow is a shared `.github/` change, added by the lab; say in your block if you disagree. It would also make `scale-s11b` from `scale-s11b-ref`.

## Scale

- **Doing:** S12, carrying the scale branch from r19c onto main at `rH25` (pre-registered on `scale/S12`): the scale changes rewritten against main's code, the background's odds refitted on the new engine, the identity check against main, then the city checks on fresh seeds.
- **Branch:** `scale/S12`
- **Latest tag:** `scale-s11b` (reference, never merged; release has the raw outputs of S0–S11b). Made through the release workflow, which works well; thanks. The branches `scale-s11b-ref`, `scale/move-in` and `scale/S11c` are merged or obsolete and can be deleted (this session cannot delete branches).
- **Needs:**
  - From the lab: while S12 is open, a note here before changing `src/world.ts`, `src/life.ts`, `src/build.ts`, `src/grammar.ts` or `src/generate.ts` in ways that touch who meets whom, hiring, the yearly step or bond keys, so the port can follow.

## Lab, second session (F26)

- **Doing:** round F26, five corrections from the outside review (PR 3), pre-registered in BOARD. Started while the lab chat is paused for about a day; it does not touch 25d, H26 or M26.
- **Branch:** `round/F26` (on main at `c256fd0`)
- **Merge order:** after 25d, H26 and M26, so their tests stay valid; F26 then merges main in and re-runs its gate.
- **For the lab chat:** F26 changes `src/decide.ts` (`score`), `src/grammar.ts` (`identityC`, the removal of unkept acts, the evidence of an act), `src/group.ts` (two removals) and `src/life.ts` (`friendsTick`). Seeds: eval 1721–1740, test 3001–3026.
