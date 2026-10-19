#!/bin/bash
# Reproduces every number in README.md. Usage, from the root of a checkout of c256fd0:
#   bash reports/review-2026-10-18/run.sh /path/to/work
# It copies the code to <work>/m, adds the measurement hooks (patch.mjs), and runs the scoreboard in nine versions on
# throwaway worlds: base rates from 1501-1520, evaluation on 9001-9020, ten years. Four processes at a time; about an hour.
# A quick check that it runs: ARMS="base p3" TRAIN_R=9101 EVAL_R=9102 N=0 bash reports/review-2026-10-18/run.sh /tmp/rv
set -e
HERE=$(cd "$(dirname "$0")" && pwd); W=${1:?work directory}; mkdir -p "$W/tmp" "$W/m"
git archive HEAD | tar -x -C "$W/m"; ln -sfn "$(pwd)/node_modules" "$W/m/node_modules"
node "$HERE/patch.mjs" "$W/m"
export W TMPDIR="$W/tmp" Z_C=0.933 CIRC_C=0.1875
job() {
  arm=$1; mode=$2; a=$3; b=$4; nl=; pt=
  case $arm in z|circ|ifthen) nl=$arm ;; all) nl=z,circ,ifthen ;; p3) pt=0.3 ;; p6) pt=0.6 ;; p10) pt=1.0 ;; p15) pt=1.5 ;; esac
  (cd "$W/m" && NOLEAK=$nl PERTURB=$pt DIAG_OUT="$W/diag-$arm-$mode" BOARD_OUT="$W/out-$arm" ./run.sh src/tools/board.ts $mode $a $b 10 > /dev/null)
  echo "$arm $mode $a done"
}
ARMS=${ARMS:-"base z circ ifthen all p3 p6 p10 p15"}
for arm in $ARMS; do mkdir -p "$W/out-$arm"; done
for mode in train eval; do
  [ $mode = train ] && R=${TRAIN_R:-"1501 1506 1511 1516"} || R=${EVAL_R:-"9001 9006 9011 9016"}; N=${N:-4}
  ( for arm in $ARMS; do for a in $R; do echo "$arm $mode $a $((a + N))"; done; done ) | xargs -P4 -L1 sh -c "$(declare -f job); job \$0 \$1 \$2 \$3"
done
node "$HERE/analyse.mjs" "$W" > "$W/results.txt"; node "$HERE/diagsum.mjs" "$W" >> "$W/results.txt"; cat "$W/results.txt"
