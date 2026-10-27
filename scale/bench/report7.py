# S7 report: the pre-registered checks, from out/s7/city.jsonl (one line per seed), against S3's bars.
#   python3 scale/bench/report7.py <cities.jsonl> [<transitions.jsonl> ...]
# Deaths are checked against the engine's own rates when transitions files are given (S13: the full towns the odds were fitted on,
# deaths per person-year banded by age at the start of the year), else against r19c's, stored below.
import json, sys
rows = [json.loads(l) for l in open(sys.argv[1] if len(sys.argv) > 1 else 'out/s7/city.jsonl')]
REF = {'died 65-79': 0.0186, 'died 80+': 0.0903, 'died <65': 0.0010}
if len(sys.argv) > 2:
    tally = {k: [0, 0] for k in REF}
    for f in sys.argv[2:]:
        for l in open(f):
            d = json.loads(l)
            if d['kind'] != 'py': continue
            a = d['x']['age']
            k = 'died 80+' if a >= 80 else 'died 65-79' if a >= 65 else 'died <65'
            tally[k][0] += 1; tally[k][1] += d['y']['died']
    REF = {k: e / n for k, (n, e) in tally.items()}
    print('death reference from the full towns:', {k: f'{tally[k][1]}/{tally[k][0]} = {REF[k]:.4f}' for k in REF})
mean = lambda xs: sum(xs) / len(xs)
print('seeds', [r['seed'] for r in rows])
cap = all(r[c]['over'] == 0 and r[c]['leaderless'] == 0 and r[c]['bgStaffLivingElsewhere'] == 0 for r in rows for c in ('cap0', 'cap1'))
print(f"1 capacity: {'PASS' if cap else 'FAIL'}  over-capacity {[r[c]['over'] for r in rows for c in ('cap0','cap1')]}, leaderless {[r[c]['leaderless'] for r in rows for c in ('cap0','cap1')]}, living elsewhere {[r[c]['bgStaffLivingElsewhere'] for r in rows for c in ('cap0','cap1')]}")
print('2 coarse matches full (monthly half / background half, mean over seeds)')
for k, kind in [('under20', 'pt'), ('over65', 'pt'), ('partnered', 'pt'), ('working', 'pt'), ('drinks', 'pt'), ('kidsPerAdult40', 'rel')]:
    f, b = mean([r['t3']['focus'][k] for r in rows]), mean([r['t3']['bg'][k] for r in rows])
    ok = abs(f - b) <= 0.05 if kind == 'pt' else abs(b / f - 1) <= 0.25
    print(f"   {k:15s} {f:.3f} / {b:.3f}  {'gap %+.1f pt' % (100*(b-f)) if kind == 'pt' else 'ratio %.2f' % (b/f)}  {'PASS' if ok else 'FAIL'}   per seed: {[(round(r['t3']['focus'][k],3), round(r['t3']['bg'][k],3)) for r in rows]}")
for k in ('n', 'birthsPerK', 'deathsPerK', 'savings', 'retired65'):
    print(f"   (reported) {k:12s} {mean([r['t3']['focus'][k] for r in rows]):.3f} / {mean([r['t3']['bg'][k] for r in rows]):.3f}")
print('3 engine rules in the background: deaths per person-year, pooled')
for k, ref in REF.items():
    n = sum(r['coarse'].get(k, [0, 0])[0] for r in rows); e = sum(r['coarse'].get(k, [0, 0])[1] for r in rows)
    print(f"   {k:11s} {e}/{n} = {e/n:.4f} against {ref:.4f}  ratio {e/n/ref:.2f}  {'PASS' if abs(e/n/ref-1) <= 0.25 else 'FAIL' if k != 'died <65' else '(reported)'}")
print('4 promoted against always in focus (mean over seeds)')
for t in ('t4a', 't4b'):
    for k, kind, bar in [('friendsPerAdult', 'rel', .25), ('friendless', 'pt', .05), ('knownWell', 'rel', .25), ('habits', 'rel', .15), ('partnered', 'pt', .07)]:
        a, p = mean([r[t]['always'][k] for r in rows]), mean([r[t]['promoted'][k] for r in rows])
        ok = abs(p - a) <= bar if kind == 'pt' else abs(p / a - 1) <= bar
        print(f"   {t} {k:15s} {a:.3f} / {p:.3f}  {'PASS' if ok else 'FAIL'}")
for t in ('t4a', 't4b'):
    for k in ('marked40', 'marks40'):
        print(f"5 {t} {k}: {mean([r[t]['always'][k] for r in rows]):.3f} / {mean([r[t]['promoted'][k] for r in rows]):.3f}")
print('6 promotion seconds per neighbourhood', [round(r['promoteS'] / max(1, len(r['prom'])), 1) for r in rows], 'build s', [r['buildS'] for r in rows])
