---
name: run-reading
description: Runs a blind paired reading of one pack - builds or takes the pack, commits it with its key and briefs, runs one blind-reader sitting per role and part, collects and checks the answers, and scores them. Use for a round's reading, a method round's re-reading, or a calibration re-read.
argument-hint: <round> <pack name> [switch, worlds, PICK]
---

# A blind paired reading

The method is `docs/method/reading.md`; the brief is `docs/method/brief.md` (until M38 lands it, the last reading's brief, `reports/41-reading-brief-1.md`, with its file and pairs replaced). This skill runs it. Arguments: `$ARGUMENTS` (the round, the pack's name such as `busiest` or `random`, and for a new pack its switch and worlds).

The reading is read and scored **before any other number of the round is read**. Do not open the battery's summary until the score is committed.

## 1. The pack

- If `scripts/round.mjs` already wrote the pack, use it. Otherwise build it from the round's frozen tree, locked:
  `.claude/hooks/battery.sh ./run.sh src/tools/diag/pairarm.ts <switch> <first world> <last world>` (add `PICK=random` in front for random adults). The worlds are the ones the pre-registration claimed.
- Copy into `reports/`: the pack as `<round>-reading-<pack>-pack.txt` and its key as `<round>-reading-<pack>-key.json`. Never open the key yourself; scripts read it.
- Write one brief per part from `docs/method/brief.md`: replace `{FILE}`, `{FIRST}` and `{LAST}`, save as `reports/<round>-reading-brief-<pack>-<part>.md`.
- Commit (`<round>: the <pack> pack, its key and briefs`) and push before any sitting.

## 2. Before the sittings

- Check usage: in the desktop app read it with the session's usage tool; in a terminal ask Øystein for `/usage`. A sitting costs about $4 to $5 at list prices. Say how many sittings this reading needs and stop if there is not room for all of them.
- The roles are the ones `docs/method/reading.md` fixes, worded as it words them. Never change a role or the brief inside a round.

## 3. The sittings

One `blind-reader` agent per role and part, each a fresh agent, all started at once in the background. For each:

1. Make a fresh directory (`mktemp -d`) and copy into it only the part (`pairs-<part>.txt`) and its brief (as `brief.md`). Nothing else: no key, no meta, no path that names the round or the switch.
2. Start the agent with this prompt, and nothing that says what changed or which version is which:
   > You are <the role, as reading.md words it>. Your brief is `<dir>/brief.md`. The part you read is `<dir>/pairs-<part>.txt`. Write your answers to `<dir>/answers.json`.
3. When it finishes, check its answers with a script: valid JSON, every pair of the part, both versions, integer scores 1 to 5, a `prefer` for each pair. A sitting that fails the check is run again by a fresh agent; say so in the reading's report.

## 4. Collect and score

- Join the answers into `reports/<round>-reading-<pack>-answers.json`, keyed `<role>-<part>` (`novelist-1`), each with its `reader` set to the role.
- Score: `python3 scripts/pairscore.py reports/<round>-reading-<pack>-key.json reports/<round>-reading-<pack>-answers.json --pack reports/<round>-reading-<pack>-pack.txt --json reports/<round>-reading-<pack>-score.json [--quote '<the round's wording>'] > reports/<round>-reading-<pack>.txt`
- Read the scorer's warnings first. If a cap, a ceiling or ties pass half the versions, the reading cannot show what it was meant to: say so before anything else.
- Commit (`<round>: the <pack> reading, scored`) and push. Then report: the effect with the order as a term, its interval and one-sided 90% lower bound, the bar the pre-registration set, and the warnings. Nothing else of the round is read yet.
