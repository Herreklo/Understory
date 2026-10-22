import collections, re
import packlib as L
vs = L.parse_pack(L.ROOT + '/reports/40-reading-busiest-pack.txt')
tot = rep = 0
c = collections.Counter(); per = []
dist_lines = []
for v in vs:
    segs = []
    for l in v['lines']:
        r = re.sub(r'\]\s*\(and.*$', '', l['reasons'] or '')
        for s in r.split(';'):
            s = s.strip()
            if s: segs.append(L.norm(re.sub(r'\s*\(\d{4}\)$', '', s)))
    k = collections.Counter(segs)
    tot += len(segs); rep += sum(n for n in k.values() if n >= 2)
    for s, n in k.items():
        if n >= 2: c[s] += n
    dist_lines.append((len({L.norm(l['text']) for l in v['lines']}), len(v['lines'])))
print(f'reason segments {tot}; in a within-version repeat {rep} ({rep/tot:.0%})')
for s, n in c.most_common(15): print(' ', n, s)
d = sum(a for a, b in dist_lines) / sum(b for a, b in dist_lines)
print(f'distinct normalised lines per version / lines: {d:.0%}')
