# Environment audit (research, 22 Oct 2026): what the engine does today with storms, weather and shared conditions, on the worlds
# dumped by dump.ts. Reads the dump only.  python3 -I analyse.py <dumpdir>
# Leads anywhere: a weighty descendant (w >= 0.8, not texture) within 36 months through cited causes (the consequence map's line);
# turn: a descendant of a turn kind (consequence-defs.ts TURNS). Followed only for sources in the first 7 of 10 present years.
import json, glob, sys, collections, re

D = sys.argv[1] if len(sys.argv) > 1 else 'out-environment'
TEXTURE = {'everyday', 'noticed', 'table', 'habit:new', 'habit:broke', 'habit:back', 'tell', 'ill'}
TURNS = set('hired dismiss walkout quitpride promoted retired stepdown left home dating married divorce split friends madeup cooled mended group:formed group:joined group:left group:split numb sober bought setback takenup gaveup want:achieved want:failed want:abandoned regret rivalry grudge peace opened plan:failed council:no council:yes scheme:found born'.split())
weighty = lambda e: e['w'] >= 0.8 and e['ty'] not in TEXTURE

worlds = []
for f in sorted(glob.glob(f'{D}/*.jsonl')):
    L = open(f).read().splitlines()
    worlds.append((json.loads(L[0]), [json.loads(x) for x in L[1:]]))
NW = len(worlds); YRS = worlds[0][0]['months'] / 12; FOLLOW = (YRS - 3) * 12
dec = lambda per: (sum(per) / NW / YRS * 10, 1.96 * (sum((x / YRS * 10 - sum(per) / NW / YRS * 10) ** 2 for x in per) / max(1, NW - 1)) ** 0.5 / NW ** 0.5)

def index(ev):
    byid = {e['id']: e for e in ev}; kids = collections.defaultdict(list)
    for e in ev:
        for r in set(e['c']): kids[r].append(e['id'])
    return byid, kids

def follow(e, byid, kids):
    seen, q, wd, tu, types = {e['id']}, [e['id']], 0, 0, []
    while q:
        i = q.pop()
        for k in kids.get(i, []):
            f = byid.get(k)
            if not f or k in seen or f['t'] > e['t'] + 36: continue
            seen.add(k); q.append(k); types.append(f['ty'])
            if weighty(f): wd = 1
            if f['ty'] in TURNS: tu = 1
    return wd, tu, types

def kind(name, pick):
    per, n, src, wd, tu, kw, kn, ch = [], 0, 0, 0, 0, 0, 0, collections.Counter()
    for meta, ev in worlds:
        byid, kids = index(ev); c = 0
        for e in ev:
            if not pick(e): continue
            n += 1; c += 1; kw += e['kw']; kn += e['kn'] / meta['pop']
            if e['t'] < FOLLOW:
                a, b, t = follow(e, byid, kids); src += 1; wd += a; tu += b; ch.update(set(t))
        per.append(c)
    m, ci = dec(per)
    print(f'{name:58s} {m:6.1f} ±{ci:4.1f}  leads {wd/src if src else 0:4.0%}  turn {tu/src if src else 0:4.0%}  witness {kw/n if n else 0:4.0%}  town knows {kn/n if n else 0:4.0%}')
    if ch: print(' ' * 60, 'descendants within 36 months (share of sources):', ', '.join(f'{k} {v/src:.0%}' for k, v in ch.most_common(6)))

print(f'{NW} worlds, {YRS:.0f} present years each; mean town {sum(m["pop"] for m,_ in worlds)/NW:.0f} people, {sum(m["adults"] for m,_ in worlds)/NW:.0f} adults')
print('Rates per world-decade, 95% interval over worlds.\n')

# 1. The storm: the risk situation (3% of months, the whole harbour at once).
storms, allback, perdec_storms, deciders = [], 0, [], []
for meta, ev in worlds:
    by_t = collections.defaultdict(list)
    for e in ev:
        if e['tr'] == 'risk': by_t[e['t']].append(e)
    perdec_storms.append(len(by_t))
    for t, es in by_t.items():
        deciders.append(len(es))
        if all(e['ty'] == 'hangback' for e in es): allback += 1
m, ci = dec(perdec_storms)
hb = [h for meta, _ in worlds for h in meta['harbour']]
print(f'Storm months that reached someone: {m:.1f} ±{ci:.1f} a world-decade; harbour workers in a month: mean {sum(hb)/len(hb):.1f} (0 in {sum(1 for h in hb if h==0)/len(hb):.0%} of months)')
print(f'  deciders per storm: mean {sum(deciders)/len(deciders):.1f}; storms where everyone hung back (so "the others went out" is false): {allback} of {len(deciders)} ({allback/len(deciders):.0%})')
kind('storm: went out (risk, go)', lambda e: e['tr'] == 'risk' and e['ty'] == 'go')
kind('storm: hung back (risk, hangback)', lambda e: e['tr'] == 'risk' and e['ty'] == 'hangback')
kind('storm: hurt by the wave (ill citing a go)', lambda e: e['ty'] == 'ill' and 'caught by a wave' in (e.get('tx') or ''))

# 2. Accidents at work (danger), whose rescue the portrait calls "the day in the storm".
kind('accident at work (danger source)', lambda e: e['ty'] == 'accident')
kind('accident: went in (rescue)', lambda e: e['tr'] == 'danger' and e['ty'] == 'rescue')
kind('accident: froze', lambda e: e['tr'] == 'danger' and e['ty'] == 'froze')

# 3. For scale: shared blows the engine already spreads (death), and all public weighty events.
kind('death (for comparison: the one blow that reaches)', lambda e: e['ty'] == 'death')
kind('any weighty public event', lambda e: e['vis'] == 'public' and weighty(e))

# 4. Events that involve three or more people at once.
multi = collections.Counter(); per = []
for meta, ev in worlds:
    c = 0
    for e in ev:
        if len(set(e['who'])) >= 3: multi[e['ty']] += 1; c += 1
    per.append(c)
m, ci = dec(per)
print(f'\nEvents naming 3+ people: {m:.1f} ±{ci:.1f} a world-decade; commonest kinds: ' + ', '.join(f'{k} {v/NW/YRS*10:.1f}' for k, v in multi.most_common(8)))

# 5. Portraits: weather lines in living adults' portraits at the end.
kinds = collections.Counter(); withany = 0; adults = 0
for meta, _ in worlds:
    adults += meta['adults']
    for p in meta['portraits']:
        withany += 1
        for l in p['lines']:
            k = re.sub(r'\b(the|a|an)\b', '', l)
            k = ('proud of "the day in the storm" (a rescue at work)' if 'day in the storm' in l else 'loves "storms, from inside" / "the first snow"' if l.startswith('loves') else 'a quirk or habit naming weather' )
            kinds[k] += 1
print(f'\nAdults whose portrait names weather: {withany} of {adults} ({withany/adults:.0%}); lines by kind: ' + '; '.join(f'{k} {v}' for k, v in kinds.most_common()))

# 6. Who a shared hardship would find most exposed (end of run, living adults).
ex = collections.Counter()
for meta, _ in worlds: ex.update(meta['exposed'])
A = sum(m['adults'] for m, _ in worlds)
print('\nExposed adults at the end (share of adults, mean per world): ' + '; '.join(f'{k} {v/A:.0%} ({v/NW:.1f})' for k, v in ex.items()))
per = [m['exposed']['oldOrIll'] for m, _ in worlds]
mu = sum(per) / NW; sd = (sum((x - mu) ** 2 for x in per) / (NW - 1)) ** 0.5
print(f'Old (75+) or ill, the union: {mu:.1f} ±{1.96 * sd / NW ** 0.5:.1f} a world (range {min(per)}–{max(per)})')
