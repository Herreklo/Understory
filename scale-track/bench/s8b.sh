#!/bin/sh
# S8b runs on the frozen tree, two at a time.
cd "$(dirname "$0")/.."
B=trees/branch-r19-s8b; O=out/s8b; mkdir -p $O
for s in 56 57; do (cd $B && npx tsx scale/city2.ts 920 $s 2 2 > ../../$O/city-$s.json 2> ../../$O/city-$s.err) & done; wait
cat $O/city-5?.json > $O/city.jsonl; echo " cities"
( cd $B && for s in 56 57 58; do npx tsx scale/invariance.ts 300 $s 3; done ) > $O/invariance.jsonl 2> $O/invariance.err &
( cd trees/branch-r19-s7 && npx tsx scale/invariance-s8b.ts 300 56 3 ) > $O/invariance-control-s7.jsonl 2> $O/invariance-control.err; wait; echo " invariance"
( cd $B && for s in 1 2 3 4 5 6 7 8 9 10; do npx tsx scale/identity2.ts $s 10; done ) > $O/identity-branch.txt 2>&1; echo " identity"
echo "all done"
