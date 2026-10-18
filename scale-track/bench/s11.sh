#!/bin/sh
cd "$(dirname "$0")/.."
B=trees/branch-r19-s11; O=out/s11; mkdir -p $O
for pair in "92 93" "94 95"; do for s in $pair; do (cd $B && npx tsx scale/twin.ts 300 $s > ../../$O/twin-$s.json 2> ../../$O/twin-$s.err) & done; wait; done
cat $O/twin-9?.json > $O/twin.jsonl; echo " twins"
(cd trees/branch-r19-s10 && npx tsx scale/city100k2.ts 100000 61 30 184) > out/s10/city100k-rerun.json 2> out/s10/city100k-rerun.err; echo " city100k rerun"
echo "all done"
