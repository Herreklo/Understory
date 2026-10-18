#!/bin/sh
# Full scoreboard. Default: learn base rates on worlds 101-120, score readers on worlds 1-20, report.
# Untouched confirmation: TRAIN=301-320 EVAL=201-220 ./board.sh
set -e
OUT=${BOARD_OUT:-out}; YEARS=${1:-10}
TRAIN=${TRAIN:-101-120}; EVAL=${EVAL:-1-20}
TA=${TRAIN%-*}; TB=${TRAIN#*-}; EA=${EVAL%-*}; EB=${EVAL#*-}
TM=$(( (TA + TB) / 2 )); EM=$(( (EA + EB) / 2 ))
rm -rf "$OUT"; mkdir -p "$OUT"
npx tsx src/board.ts train $TA $TM $YEARS & npx tsx src/board.ts train $((TM + 1)) $TB $YEARS & wait
npx tsx src/board.ts eval $EA $EM $YEARS & npx tsx src/board.ts eval $((EM + 1)) $EB $YEARS & wait
npx tsx src/board.ts report
