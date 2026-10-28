# P3 refresh (28 Oct 2026): the strict link rate (decision 20) of the acts nearest to help in a hardship, on the dump of dump.ts. python3 -I link47.py <dumpdir>
import json, glob, sys, collections
D = sys.argv[1]
TURNS = set('hired dismiss walkout quitpride promoted retired stepdown left home dating married divorce split friends madeup cooled mended group:formed group:joined group:left group:split numb sober bought setback takenup gaveup want:achieved want:failed want:abandoned regret rivalry grudge peace opened plan:failed council:no council:yes scheme:found born'.split())
TIES = set('friends madeup cooled mended dating married divorce split rivalry grudge peace'.split())
acc = collections.defaultdict(lambda: [0,0,0,[]])
for f in sorted(glob.glob(f'{D}/*.jsonl')):
    L = open(f).read().splitlines(); meta = json.loads(L[0]); ev = [json.loads(x) for x in L[1:]]
    byid = {e['id']: e for e in ev}; kids = collections.defaultdict(list)
    for e in ev:
        for r in set(e['c']): kids[r].append(e['id'])
    FOLLOW = meta['months'] - 36
    per = collections.Counter(); hit = collections.Counter()
    for e in ev:
        k = (e['tr'] or '-') + ':' + e['ty']
        if e['tr'] not in ('support','collection','danger','risk','loss','request','meeting'): continue
        if e['t'] >= FOLLOW: continue
        seen, q, link, tie = {e['id']}, [e['id']], 0, 0
        while q:
            i = q.pop()
            for c in kids.get(i, []):
                g = byid.get(c)
                if not g or c in seen or g['t'] > e['t'] + 36: continue
                seen.add(c); q.append(c)
                if g['ty'] in TURNS: link = 1
                if g['ty'] in TIES: tie = 1
        a = acc[k]; a[0] += 1; a[1] += link; a[2] += tie; per[k] += 1; hit[k] += link
    for k in per: acc[k][3].append((per[k], hit[k]))
for k, (n, l, t, pw) in sorted(acc.items(), key=lambda x: -x[1][0]):
    if n < 15: continue
    print(f'{k:28s} n={n:5d}  link {l/n:5.1%}  tie {t/n:5.1%}')
