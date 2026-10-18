#!/bin/sh
# S0: time per simulated month by system, at four town sizes. One process at a time, so runs never compete for the processor.
#   bench/run-s0.sh <tree> <outdir>
# <tree> is a copy of the lab (engine or branch); the harness is copied into <tree>/scale/ and nothing else in the tree is touched.
set -e
TREE=$(cd "$1" && pwd); OUT=$(mkdir -p "$2" && cd "$2" && pwd); HERE=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$TREE/scale" && cp "$HERE/bench.ts" "$TREE/scale/bench.ts"
cd "$TREE"
: > "$OUT/bench.jsonl"
# Same five-year past at every size (what the scaling curve is read from), twelve present months.
for spec in "46 1" "46 2" "46 3" "184 1" "184 2" "184 3" "613 1" "613 2" "1840 1" "1840 2"; do
  set -- $spec; npx tsx scale/bench.ts $1 $2 5 12 >> "$OUT/bench.jsonl" 2>> "$OUT/bench.err"
  echo "done $1 seed $2"
done
# Does a longer past change the curve? Full thirty-year past at the two smaller sizes.
for spec in "46 1" "184 1"; do set -- $spec; npx tsx scale/bench.ts $1 $2 30 12 >> "$OUT/bench.jsonl" 2>> "$OUT/bench.err"; echo "done $1 past 30"; done
# Where the time goes, by function, at about a thousand people.
mkdir -p "$OUT/prof" && node --cpu-prof --cpu-prof-dir="$OUT/prof" --import tsx scale/bench.ts 613 1 5 6 > "$OUT/prof/run.json" 2>> "$OUT/bench.err"
echo "all done"
