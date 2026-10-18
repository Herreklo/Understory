# Self time per function during the present months of a V8 profile, in ms per person per month.
#   python3 bench/present_self.py <dir> <people> <months>
import json, glob, os, sys, collections
d, people, months = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
f = max(glob.glob(d + '/*.cpuprofile'), key=os.path.getsize); p = json.load(open(f))
nodes = {n['id']: n for n in p['nodes']}; parent = {}
for n in p['nodes']:
    for c in n.get('children', []): parent[c] = n['id']
dt = collections.Counter()
for s, t in zip(p['samples'], p['timeDeltas']): dt[s] += t
selft = collections.Counter(); tot = 0
for nid, t in dt.items():
    ch = []; x = nid
    while x is not None: ch.append(nodes[x]['callFrame']['functionName'] or '(anon)'); x = parent.get(x)
    if ('runYears' not in ch or 'buildWorld' in ch) and ch[0] != '(garbage collector)': continue
    cf = nodes[nid]['callFrame']; selft[f"{cf['functionName'] or '(anon)'}@{os.path.basename(cf['url'])}"] += t; tot += t
print(json.dumps({k: round(v / 1000 / months / people, 4) for k, v in selft.most_common(60)}))
