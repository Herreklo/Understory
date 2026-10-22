import collections, sys
import packlib as L, analysis_kinds as K
for name in ['40-reading-busiest', '40-reading-random', '41-reading-busiest', '41-reading-random']:
    vs = L.parse_pack(f'{L.ROOT}/reports/{name}-pack.txt')
    N = sum(len(v['lines']) for v in vs)
    ex = collections.Counter(); kinds = collections.Counter()
    for v in vs:
        c = K.classify_version(v)
        cnt = collections.Counter(L.norm(l['text']) for l in v['lines'])
        for k, vd in c.items(): ex[vd] += cnt[k] - 1
        for l in v['lines']: kinds[K.kind(L.norm(l['text']))[1]] += 1
    t = sum(ex.values())
    print(f"{name}: {len(vs)} versions, {N/len(vs):.1f} lines each; excess copies {t} ({t/N:.0%}); " + ', '.join(f'{k} {ex[k]/t:.0%}' for k in ('selection','acts','words')) + f"; routine lines {kinds['routine']/N:.0%}")
