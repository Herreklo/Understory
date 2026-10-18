#!/bin/sh
# S10 test runs on the frozen tree.
cd "$(dirname "$0")/.."
B=trees/branch-r19-s10; O=out/s10; mkdir -p $O
( cd $B && for s in 82 83 84; do npx tsx scale/promoinv.ts 300 $s; done ) > $O/promoinv.jsonl 2> $O/promoinv.err; echo " promotion invariance"
for pair in "61 62" "63 64" "65"; do
  for s in $pair; do (cd $B && npx tsx scale/city2.ts 920 $s 2 2 > ../../$O/city-$s.json 2> ../../$O/city-$s.err) & done; wait
done
cat $O/city-6?.json > $O/city.jsonl; echo " cities"
( cd $B && for s in 61 62 63; do npx tsx scale/invariance.ts 300 $s 3; done ) > $O/invariance.jsonl 2> $O/invariance.err; echo " independence"
(cd $B && npx tsx scale/city100k2.ts 100000 61 30 184) > $O/city100k.json 2> $O/city100k.err; echo " city100k"
( cd $B && for s in 1 2 3 4 5 6 7 8 9 10; do npx tsx scale/identity2.ts $s 10; done ) > $O/identity-branch.txt 2>&1; echo " identity"
echo "all done"
