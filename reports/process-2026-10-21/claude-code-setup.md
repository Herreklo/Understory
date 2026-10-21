# Setting up Claude Code for Understory (21 Oct 2026)

What the Claude Code documentation says, checked on 21 Oct by a research agent. "Unverified" marks what the docs did not say; test it once before relying on it.

## Where to run

- **On Øystein's Mac, in the Understory folder** (Terminal: `cd` into the folder, then `claude`; or the desktop app's Code tab set to Local with that folder). Terminal sessions have no time limit on background commands, which a battery of 30–120 minutes needs. Keep the Mac awake during a run. Unverified: whether a run survives sleep or quitting the desktop app.
- **Claude Code on the web** (claude.ai/code, repo picker → `Herreklo/Understory`): fine for short jobs (docs, reviews, PRs). Cloud machines have 4 cores and 16 GB, but unattended background commands get 30 minutes by default and 2 hours at most, and an idle environment expires without restoring background work. An "environment" there is a general configuration ("Default"), not one per repo. A private repo appears only when the Claude GitHub app has access to it (github.com/apps/claude/installations/new).

## Context and sessions

- `CLAUDE.md` is read at the start of every session in the folder. Keep it under about 200 lines; `@path` imports load at launch too, so they organise but do not save context. Subfolder `CLAUDE.md` files and `.claude/rules/*.md` with `paths:` load only when matching files are touched. `CLAUDE.md` is advice; hard rules belong in hooks.
- One job per session: `/clear` between jobs, `/compact <focus>` when needed. Name a session with `claude -n <name>` and return with `claude --resume <name>`; transcripts are kept 30 days. The handover lives in the repo (`SUMMARY.md`, the PR description), not in a chat.
- `/usage` (alias `/cost`) shows a session's use; it resets on `/clear`, which makes one session per job also one count per job.

## Subagents (`.claude/agents/<name>.md`)

- Frontmatter: `name`, `description` (required), `tools` (omitted: all), `model` (`sonnet`, `opus`, `haiku`, `fable`, `inherit` or a full id such as `claude-fable-5-1`; unverified for the full id, test once), `omitClaudeMd`, `background`, `maxTurns`, `isolation: worktree`.
- A subagent starts fresh: its body as system prompt, the delegation message, the `CLAUDE.md` files (unless `omitClaudeMd: true`) and a git status snapshot. It returns only its final report. Don't set `CLAUDE_CODE_SUBAGENT_MODEL_FORCE`, which overrides the frontmatter.
- **Blind readers:** `model: fable`, `tools: Read`, `omitClaudeMd: true`. The git status snapshot shows the branch name (for example `round/42`), which says a change exists but not which version is which; the pack and key keep the arms blind. Unverified: whether the snapshot can be turned off.

## Skills (`.claude/skills/<name>/SKILL.md`)

- Commands in `.claude/commands/` still work but are folded into skills; use skills, which can hold scripts.
- Workflows with side effects (pre-register, record an outcome, release): `disable-model-invocation: true`, run as `/pre-register 42`.
- `context: fork` with `agent: blind-reader` runs a skill inside that subagent and returns its summary. The body must be a complete task.
- A skill's `model` applies to that turn only.

## Hooks and permissions (`.claude/settings.json`)

- **No engine edits during a battery:** a `PreToolUse` hook on `Edit|Write` (and `Bash`) runs a script that blocks a path under `src/` or `scale/` while `.claude/battery.lock` exists (exit 2, with the reason).
- **No stopping with work unpushed:** a `Stop` hook that blocks while commits are unpushed.
- Permissions: deny, then ask, then allow; the first match wins. Allow narrow patterns (`Bash(npm test *)`, `Bash(npm run *)`, `Bash(gh pr view *)`, `Bash(gh pr checks *)`, `Bash(git status *)`), not `Bash(git *)`.

## Sources

[memory](https://code.claude.com/docs/en/memory) · [sub-agents](https://code.claude.com/docs/en/sub-agents) · [model config](https://code.claude.com/docs/en/model-config) · [skills](https://code.claude.com/docs/en/skills) · [best practices](https://code.claude.com/docs/en/best-practices) · [sessions](https://code.claude.com/docs/en/sessions) · [tools](https://code.claude.com/docs/en/tools-reference) · [on the web](https://code.claude.com/docs/en/claude-code-on-the-web) · [web quickstart](https://code.claude.com/docs/en/web-quickstart) · [desktop](https://code.claude.com/docs/en/desktop) · [quickstart](https://code.claude.com/docs/en/quickstart) · [hooks](https://code.claude.com/docs/en/hooks-guide) · [permissions](https://code.claude.com/docs/en/permissions) · [costs](https://code.claude.com/docs/en/costs)
