# Summarise a V8 .cpuprofile: self time and inclusive time by function (name, file:line).
#   python3 scale/hot.py out/prof/*.cpuprofile [top]
import json, sys, collections, os
path = sys.argv[1]; top = int(sys.argv[2]) if len(sys.argv) > 2 else 25
p = json.load(open(path))
nodes = {n['id']: n for n in p['nodes']}
parent = {}
for n in p['nodes']:
    for c in n.get('children', []): parent[c] = n['id']
dt = collections.Counter()
samples, deltas = p['samples'], p['timeDeltas']
for s, d in zip(samples, deltas): dt[s] += d
def key(n):
    cf = n['callFrame']; f = os.path.basename(cf['url']) or '(native)'
    return f"{cf['functionName'] or '(anon)'} {f}:{cf['lineNumber']+1}"
self_t = collections.Counter(); incl = collections.Counter()
for nid, t in dt.items():
    self_t[key(nodes[nid])] += t
    seen = set(); x = nid
    while x is not None:
        k = key(nodes[x])
        if k not in seen: incl[k] += t; seen.add(k)
        x = parent.get(x)
total = sum(dt.values())
print(f"total {total/1e6:.1f}s")
print("SELF"); [print(f"  {100*t/total:5.1f}%  {k}") for k, t in self_t.most_common(top)]
print("INCLUSIVE (src only)"); [print(f"  {100*t/total:5.1f}%  {k}") for k, t in incl.most_common(200) if '.ts:' in k][:top] if False else None
n = 0
for k, t in incl.most_common(400):
    if '.ts:' in k:
        print(f"  {100*t/total:5.1f}%  {k}"); n += 1
        if n >= top: break
