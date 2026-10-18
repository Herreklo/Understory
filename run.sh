#!/bin/sh
# Runs a lab script from a pre-built bundle: about a quarter faster than tsx, and the same code (no behaviour can differ; the identity
# check runs this way too). Usage: ./run.sh src/tools/board.ts eval 1591 1595 10
set -e
f=$1; shift
out=${TMPDIR:-/tmp}/lab-run/$(echo "$f" | tr '/' '_' | sed 's/\.ts$//').$$.mjs
mkdir -p "$(dirname "$out")"
npx esbuild "$f" --bundle --platform=node --format=esm --target=node20 --outfile="$out" --log-level=warning
s=0; node "$out" "$@" || s=$?; rm -f "$out"; exit $s
