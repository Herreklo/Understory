#!/bin/sh
# Runs a battery, a reading's pack or a queue of runs with the engine locked: while it runs, the battery hook
# (.claude/hooks/guard.py) refuses edits to src/ and scale/ in this checkout, and git commands that change the tree.
#   .claude/hooks/battery.sh node scripts/round.mjs --id 42 ...
cd "$(dirname "$0")/../.." || exit 1
lock=.claude/battery.lock
echo "$$ $*" >"$lock"
trap 'rm -f "$lock"' EXIT
trap 'exit 130' INT TERM
"$@"
