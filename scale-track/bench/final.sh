#!/bin/sh
# Final runs, in an order that keeps every timed run alone on the machine.
cd "$(dirname "$0")/.."
B=trees/branch-r19-final; E=trees/engine-r19; O=out/final; mkdir -p $O
echo "A: S3 cities"; : > $O/city.jsonl
for s in 2 3 4 5 6; do (cd $B && npx tsx scale/city.ts 920 $s 2 2) >> $O/city.jsonl 2>> $O/city.err; echo " city $s"; done
echo "B: S0 engine, then branch, one run at a time"
./bench/run-s0.sh $E $O/s0-engine > /dev/null 2>&1; echo " engine done"
./bench/run-s0.sh $B $O/s0-branch > /dev/null 2>&1; echo " branch done"
echo "C: identity on seeds 4-10, engine tests on the branch, social outcomes"
( for s in 4 5 6 7 8 9 10; do (cd $E && npx tsx scale/identity.ts $s 10 | sed "s/^/engine /"); (cd $B && npx tsx scale/identity.ts $s 10 | sed "s/^/branch /"); done > $O/identity.txt 2>&1 ) &
( cd $B && (npx tsx src/replay.ts; npx tsx src/twoworlds.ts; npx tsx src/grouptest.ts; npx tsx src/demography.ts 6 20) > ../../$O/branch-tests.txt 2>&1;
  for spec in "46 1" "46 2" "46 3" "184 1" "184 2" "613 1" "613 2" "1840 1"; do set -- $spec; npx tsx scale/social.ts $1 $2 5 5; done > ../../$O/social-branch.jsonl 2>> ../../$O/social.err;
  cd ../engine-r19 && for spec in "46 1" "46 2" "46 3" "184 1" "613 1"; do set -- $spec; npx tsx scale/social.ts $1 $2 5 5; done > ../../$O/social-engine.jsonl 2>> ../../$O/social.err ) &
wait; echo "all done"
