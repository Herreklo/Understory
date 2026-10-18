#!/bin/sh
# S7 test runs on the frozen tree, two at a time (the machine has two cores), then the city of 100,000 alone, then identity.
cd "$(dirname "$0")/.."
B=trees/branch-r19-s7; O=out/s7; mkdir -p $O
: > $O/city.jsonl
for pair in "41 42" "43 44" "45"; do
  for s in $pair; do (cd $B && npx tsx scale/city2.ts 920 $s 2 2 > ../../$O/city-$s.json 2> ../../$O/city-$s.err) & done; wait
done
cat $O/city-4?.json >> $O/city.jsonl; echo " cities"
(cd $B && npx tsx scale/city100k2.ts 100000 41 30 184) > $O/city100k.json 2> $O/city100k.err; echo " city100k"
( cd $B && for s in 1 2 3 4 5 6 7 8 9 10; do npx tsx scale/identity2.ts $s 10; done ) > $O/identity-branch.txt 2>&1; echo " identity"
echo "all done"
