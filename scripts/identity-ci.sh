#!/usr/bin/env bash
# The identity check CI runs on every pull request: the world as main makes it, against the world as main plus this PR makes it.
# Nothing is stored, so nothing can go stale. Run from the root of a checkout of the PR's merge commit (HEAD^1 is main).
#
# What must hold, from the PR's labels and description:
#   label `refactor`          everything identical (every event, person, bond, belief, stream), on every switch arm the two trees share
#   label `words`             behaviour identical (the words check, sig.ts); text may differ
#   a line `Switch: OFF=x`    identical with the switch off: the experiment's mechanism is the only difference
#   anything else             if the engine changed at all, the PR must say which of the above it is
#
# Env: LABELS (comma-separated), BODY (the PR description), SUMMARY (a file the report is appended to; optional).
set -uo pipefail

say() { echo "$*"; [ -n "${SUMMARY:-}" ] && echo "$*" >>"$SUMMARY"; }
fail() { say ""; say "**✗ $***"; exit 1; }

base=$(git rev-parse HEAD^1)
changed=$(git diff --name-only "$base" HEAD | grep -E '^(src/|scale/|package(-lock)?\.json$|tsconfig\.json$)' || true)
say "## Identity against main"
if [ -z "$changed" ]; then
  say "This PR changes no engine files: nothing to check."
  exit 0
fi

has_label() { [[ ",${LABELS:-}," == *",$1,"* ]]; }
switch=$(printf '%s\n' "${BODY:-}" | sed -nE 's/^Switch:[[:space:]]*OFF=([A-Za-z0-9:_,+-]+).*/\1/p' | head -1)
default_off=$(printf '%s\n' "${BODY:-}" | grep -cE '^Switch:[[:space:]]*ON=' || true)

work=$(mktemp -d)
git worktree add -q "$work/main" "$base" || fail "could not check out main at $base"
(cd "$work/main" && npm ci --silent >/dev/null 2>&1) || fail "npm ci failed on main"

switches() { grep -rhoE "OFF\.has\('[^']+'\)" "$1/src" | sed -E "s/OFF\.has\('([^']+)'\)/\1/" | sort -u; }
arms=""
if has_label refactor; then
  arms=$(comm -12 <(switches "$work/main") <(switches .) | paste -sd, -)
fi

# The switch arms are split over parallel processes (the default world goes with the first).
jobs=${IDENT_JOBS:-$(nproc 2>/dev/null || echo 2)}
chunk=()
if [ -n "$arms" ]; then
  i=0
  for a in ${arms//,/ }; do chunk[i % jobs]+="${chunk[i % jobs]:+,}$a"; i=$((i + 1)); done
fi
nchunks=${#chunk[@]}
[ "$nchunks" -eq 0 ] && nchunks=1

# ident <dir> <save|check> <off>: runs every chunk in parallel; saves to ident-<n>.json, or checks against ident.json
ident() {
  local dir=$1 mode=$2 off=$3 pids=() n status=0
  for ((n = 0; n < nchunks; n++)); do
    local skip=""; [ "$n" -gt 0 ] && skip=1
    local file="$work/ident.json"; [ "$mode" = save ] && file="$work/ident-$n.json"
    (cd "$dir" && IDENT_ARMS="${chunk[n]:-}" IDENT_SKIP_DEFAULT="$skip" IDENT_BASE_OFF="$off" npx tsx src/tools/diag/ident.ts "$mode" "$file" >"$work/$mode-$n.txt" 2>&1) &
    pids+=($!)
  done
  for n in "${!pids[@]}"; do wait "${pids[n]}" || status=1; done
  return $status
}

# main
ident "$work/main" save "" || fail "the identity check could not run on main"
node -e 'const fs=require("fs");const out={};for(const f of process.argv.slice(2))Object.assign(out,JSON.parse(fs.readFileSync(f,"utf8")));fs.writeFileSync(process.argv[1],JSON.stringify(out))' "$work/ident.json" "$work"/ident-*.json
(cd "$work/main" && npx tsx src/tools/diag/sig.ts >"$work/sig-main.txt") || fail "the words check could not run on main"

# this PR, with its switch off when it declares one
ident . check "$switch"
ident_ok=$?
grep -hE '^[^ ]+/[0-9]+: ' "$work"/check-*.txt | sort -u >"$work/ident.txt"
grep -q 'no baseline\|DIFFERENT' "$work/ident.txt" && ident_ok=1
[ -s "$work/ident.txt" ] || { cat "$work"/check-*.txt; fail "the identity check could not run on this PR"; }
OFF="$switch" npx tsx src/tools/diag/sig.ts >"$work/sig-pr.txt"
cmp -s "$work/sig-main.txt" "$work/sig-pr.txt"
sig_ok=$?

say ""
say "Engine files changed: $(echo "$changed" | wc -l | tr -d ' ')."
[ -n "$switch" ] && say "Checked with \`OFF=$switch\`, the switch this PR declares."
[ -n "$arms" ] && say "Switch arms checked as well: $(echo "$arms" | tr ',' '\n' | wc -l | tr -d ' ')."
say ""
say '```'
tee -a "${SUMMARY:-/dev/null}" <"$work/ident.txt"
say '```'
say ""
[ $ident_ok -eq 0 ] && say "- Everything identical to main." || say "- Not identical to main in full (events, people, bonds, beliefs or streams)."
[ $sig_ok -eq 0 ] && say "- Behaviour identical to main (words check)." || say "- Behaviour differs from main (words check)."

if has_label refactor; then
  [ $ident_ok -eq 0 ] || fail "Labelled refactor, but the world is not identical to main."
elif has_label words; then
  [ $sig_ok -eq 0 ] || fail "Labelled words, but behaviour differs from main."
elif [ -n "$switch" ]; then
  [ $ident_ok -eq 0 ] || fail "With OFF=$switch the world should be identical to main, and it is not: something outside the switch changed."
elif [ "$default_off" -gt 0 ]; then
  [ $ident_ok -eq 0 ] || fail "The mechanism is off by default (Switch: ON=…), so the default world should be identical to main, and it is not."
else
  [ $ident_ok -eq 0 ] || fail "The engine changed, and the PR does not say how: label it refactor or words, or add a line 'Switch: OFF=<name>' to its description."
fi
say ""
say "**✓ Identity holds for what this PR says it is.**"
