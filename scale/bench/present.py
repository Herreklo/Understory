# Inclusive time per function during the present months of a V8 profile (excludes building the world).
#   python3 bench/present.py <dir-with-cpuprofile> <people> [top]
import json, glob, os, sys, collections
d, people = sys.argv[1], float(sys.argv[2]); top = int(sys.argv[3]) if len(sys.argv) > 3 else 40
f = max(glob.glob(d + '/*.cpuprofile'), key=os.path.getsize); p = json.load(open(f))
nodes = {n['id']: n for n in p['nodes']}; parent = {}
for n in p['nodes']:
    for c in n.get('children', []): parent[c] = n['id']
dt = collections.Counter()
for s, t in zip(p['samples'], p['timeDeltas']): dt[s] += t
incl = collections.Counter(); tot = 0
for nid, t in dt.items():
    ch = []; x = nid
    while x is not None: ch.append(nodes[x]['callFrame']['functionName'] or '(anon)'); x = parent.get(x)
    if 'runYears' not in ch or 'buildWorld' in ch: continue
    tot += t
    for fn in set(ch): incl[fn] += t
months = 12
print(json.dumps({k: round(v / 1000 / months / people, 4) for k, v in incl.most_common(top)}))  # ms per person per month
