# P4 research (26 Oct 2026): the demography check's births/deaths ratio over blocks of six worlds, as `npm test` runs it (six worlds,
# twenty years), on the throwaway worlds of demog.ts, feelings off and on.   python3 -I .../blocks.py [outdir]
import json, sys
OUT = sys.argv[1] if len(sys.argv) > 1 else 'out-meeting'
for arm in ('off', 'on'):
    rs = {r['seed']: r for r in map(json.loads, open(f'{OUT}/demog-{arm}.jsonl'))}
    seeds = sorted(rs)
    ratios = []
    for i in range(0, len(seeds) - 5, 6):
        b = seeds[i:i + 6]
        ratios.append(sum(rs[s]['births'] for s in b) / sum(rs[s]['deaths'] for s in b))
    allr = sum(r['births'] for r in rs.values()) / sum(r['deaths'] for r in rs.values())
    print(arm, len(seeds), 'worlds; ratio over all', f'{allr:.2f}', '; six-world blocks', ' '.join(f'{x:.2f}' for x in ratios), '; below 0.6:', sum(x < 0.6 for x in ratios))
