# Running the city scale track

The branch is round 19c plus the scale changes (`docs/branch-changes.md`, full diff of `src/` in `docs/branch.diff`). It is the S11b tree.

    cd branch && npm install
    npx tsx scale/identity2.ts 1 10          # a town's whole-world fingerprint after 40 years; compare with the engine's (results/s6/identity2.txt)
    npx tsx scale/bench.ts 1840 1 5 12       # time per month by system at about 2,600 people
    npx tsx scale/city2.ts 920 61 2 2        # half-background city: capacity, coarse vs full, promotion
    npx tsx scale/invariance.ts 300 61 3     # a background neighbourhood is independent of everything outside it
    npx tsx scale/promoinv.ts 300 82         # promotion changes nothing but texture
    npx tsx scale/twin.ts 300 92             # the twin test: a background life against a full one
    npx tsx scale/city100k2.ts 100000 61 30 184   # a city of 100,000 around a town
    npx tsx scale/sample.ts 300 61           # one neighbourhood before and after promotion
    python3 ../bench/report7.py ../results/s10/city.jsonl   # the pre-registered checks for a set of cities

Refit the background's odds after an engine change:

    npx tsx scale/transitions.ts 1001 1030 20 > transitions.jsonl
    python3 ../bench/fit.py transitions.jsonl --out src/coarse-odds.ts

SCALE.md is the log: every step's question, pre-registered expectation, method and result, with corrections where a result was later found wrong. Timings depend on the machine; compare them only within one sitting.
