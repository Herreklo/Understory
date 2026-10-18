#!/bin/sh
# Follow-up runs (S2b, S3b, S4), one at a time.
cd "$(dirname "$0")/.."
B=trees/branch-r19-s2b; O=out/followup; mkdir -p $O
( cd $B && for s in 1 2 3 4 5; do npx tsx scale/identity.ts $s 10; done ) > $O/identity.txt 2>&1; echo " identity"
./bench/run-s0.sh $B $O/s2b > /dev/null 2>&1; echo " s2b timing"
: > $O/city.jsonl; for s in 7 8 9; do (cd $B && npx tsx scale/city.ts 920 $s 2 2) >> $O/city.jsonl 2>> $O/city.err; echo " city $s"; done
(cd $B && npx tsx scale/city100k.ts 100000 1 30 184) > $O/city100k.json 2> $O/city100k.err; echo " city100k"
echo "all done"
