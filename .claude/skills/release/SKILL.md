---
name: release
description: Tags and releases a merged round - pushes a release branch with RELEASE.json and the raw outputs, which the release workflow turns into a tag and a GitHub release. Use after a round's merge.
argument-hint: <round>
---

# Release round $ARGUMENTS

Sessions here can push branches but not tags; `.github/workflows/release.yml` tags. A round's tag is `r` and its id (`r41`, `rM38`, `rH28`); a city step's is `s<n>` (`s12`).

1. `git switch main && git pull --ff-only`. The commit to tag is the round's merge commit: `git log --merges --oneline -5`.
2. Make the release branch from that commit in a worktree, so this checkout stays on main:
   `git worktree add ../release-<tag> -b release/<tag> <merge sha>`
3. In it:
   - `RELEASE.json`: `{"tag": "<tag>", "sha": "<merge sha>", "title": "Round <n>: <what it does> — <kept | not kept | withdrawn>", "notes": "<the outcome in plain words, as SUMMARY says it, under 150 words; the headline numbers with their intervals; what the outputs hold>"}`;
   - `outputs/`: the round's raw outputs (the battery's `out-round-<n>`, the sizing runs, the reading packs, keys and answers, the re-derivation's scripts), copied, not moved.
   - The usage of the round by role, if `python3 scripts/usage_scan.py jobs --from <date the round began> --md` can show it, added at the end of the notes.
4. Commit (`release: <tag>`) and push the branch. The workflow tags, releases, attaches the outputs and deletes the branch.
5. `gh release view <tag>` once the workflow has run; then `git worktree remove ../release-<tag>`.
6. If this version is worth an outside review, offer it to Øystein as a download (`gh release download <tag>` or the zip of the tag).
