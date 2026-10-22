# Intrigue audit (research, 22 Oct 2026): count each story-making situation kind in the dumped worlds (dump.ts) and say whether
# it leads anywhere and whether the witness knows it. Reads the dump only.  python3 -I analyse.py <dumpdir>
# Leads anywhere: a weighty descendant (w >= 0.8, not texture) within 36 months, through cited causes (the consequence map's line);
# turn: a descendant of a turn kind (consequence-defs.ts TURNS). Followed only for sources in the first 5 of 8 present years.
import json, glob, sys, collections, math

D = sys.argv[1] if len(sys.argv) > 1 else 'out-intrigue'
TEXTURE = {'everyday', 'noticed', 'table', 'habit:new', 'habit:broke', 'habit:back', 'tell', 'ill'}
TURNS = set('hired dismiss walkout quitpride promoted retired stepdown left home dating married divorce split friends madeup cooled mended group:formed group:joined group:left group:split numb sober bought setback takenup gaveup want:achieved want:failed want:abandoned regret rivalry grudge peace opened plan:failed council:no council:yes scheme:found born'.split())
HOSTILE = set('shout cold sarcasm quietword walkout snap needle criticise contempt needleplan holdagainst rake dismiss dressdown confront digin whisper whisperplan blame coolto brushoff shutout tell confrontsecret'.split())
weighty = lambda e: e['w'] >= 0.8 and e['ty'] not in TEXTURE

worlds = []
for f in sorted(glob.glob(f'{D}/*.jsonl')):
    L = open(f).read().splitlines()
    meta = json.loads(L[0]); ev = [json.loads(x) for x in L[1:]]
    worlds.append((meta, ev))
NW = len(worlds); YRS = worlds[0][0]['months'] / 12
popyrs = sum(m['pop'] for m, _ in worlds) * YRS  # person-years, approx (end population)

def index(ev):
    byid = {e['id']: e for e in ev}; kids = collections.defaultdict(list)
    for e in ev:
        for r in set(e['c']):
            kids[r].append(e['id'])
    return byid, kids

def follow(e, byid, kids):
    seen, q, wd, tu = {e['id']}, [e['id']], 0, 0
    while q:
        i = q.pop()
        for k in kids.get(i, []):
            f = byid[k]
            if k in seen or f['t'] > e['t'] + 36: continue
            seen.add(k); q.append(k)
            if weighty(f): wd = 1
            if f['ty'] in TURNS: tu = 1
    return wd, tu

R = {}
def kind(name, pick):
    n = 0; src = 0; wd = 0; tu = 0; kw = 0; per = []
    for meta, ev in worlds:
        byid, kids = index(ev); c = 0
        for e in ev:
            if not pick(e, byid): continue
            n += 1; c += 1; kw += e['kw']
            if e['t'] < 60:
                a, b = follow(e, byid, kids); src += 1; wd += a; tu += b
        per.append(c)
    m = n / NW / YRS * 10; sd = (sum((x / YRS * 10 - m) ** 2 for x in per) / max(1, NW - 1)) ** 0.5
    R[name] = dict(n=n, perdec=m, ci=1.96 * sd / NW ** 0.5, lead=wd / src if src else float('nan'), turn=tu / src if src else float('nan'), known=kw / n if n else float('nan'))

T = lambda *tys: (lambda e, b: e['ty'] in tys)
close = lambda e: e.get('fr') or e.get('pt') or e.get('kin')

kind('1 rivalry declared (rivals)', T('rivals'))
kind('1 contest for a post/place (contest, passed)', lambda e, b: e['ty'] == 'passed' or (e['tr'] == 'contest'))
kind('2 betrayal: confidence told and it got back', T('betrayed'))
kind('2 betrayal: scheme against rival found out', T('scheme:found'))
kind('2 hostile act by a friend/partner/kin (not a row)', lambda e, b: e['ty'] in HOSTILE and close(e) and e['tr'] not in ('row', 'row-answer'))
kind('3 secret made (skim, liecover, blame, allfine, whisper)', T('skim', 'liecover', 'blame', 'allfine', 'whisper', 'whisperplan'))
kind('3 secret out: caught at work', T('caught'))
kind('3 secret confided', lambda e, b: e['ty'] == 'confide' and e['tr'] == 'confide')
kind('3 confidant tells/confronts', lambda e, b: e['tr'] == 'discovery' and e['ty'] in ('tell', 'confrontsecret'))
kind('4 promise due: kept', lambda e, b: e['ty'] == 'keep' and e['tr'] == 'obligation')
kind('4 promise due: broken (slip)', lambda e, b: e['ty'] == 'slip')
kind('4 ill parent: came / stayed away', lambda e, b: e['tr'] == 'obligation' and e['ty'] in ('show', 'absent'))
kind('5 asked for help and refused (request-answer)', lambda e, b: e['tr'] == 'request-answer' and e['ty'] in ('refuse', 'excuse', 'notthemoney', 'notthetime'))
kind('5 ... refused by friend/kin/partner', lambda e, b: e['tr'] == 'request-answer' and e['ty'] in ('refuse', 'excuse', 'notthemoney', 'notthetime') and close(e))
kind('5 pursuit rebuffed / want failed / setback', T('rebuffed', 'want:failed', 'setback'))
kind('5 plan turned down by council / plan failed', T('council:no', 'plan:failed'))
kind('6 rivalry or split with 2+ friends of both', lambda e, b: e['ty'] in ('rivals', 'split', 'divorce', 'cooled', 'betrayed', 'scheme:found') and (e.get('cf') or 0) >= 2)
def revenge(e, b):
    if e['ty'] not in HOSTILE or len(e['who']) < 2 or e['tr'] in ('row', 'row-answer'): return False
    a, t = e['who'][0], e['who'][1]
    return any((b.get(r) and b[r]['ty'] in HOSTILE | {'betrayed', 'scheme:found', 'passed', 'humour'} and b[r]['who'][:1] == [t]) for r in e['c'])
kind('7 retaliation: hostile act citing target\'s earlier act', revenge)
kind('7 grudge acts (grudge situation)', lambda e, b: e['tr'] == 'grudge')
kind('9 newcomer arrived', T('arrived'))
kind('9 newcomer welcomed / cooled to', T('welcome', 'coolto'))
kind('10 succession: promoted', T('promoted'))
kind('10 succession: stepped down', T('stepdown'))
kind('11 temptation: took / lied / blamed another', lambda e, b: e['tr'] == 'temptation' and e['ty'] in ('skim', 'liecover', 'blame', 'allfine'))
kind('11 temptation: owned up', lambda e, b: e['tr'] == 'temptation' and e['ty'] == 'ownup')
kind('12 friendship ended (cooled)', T('cooled'))
kind('12 made up / mended', T('mended', 'madeup', 'makepeace', 'peace'))
kind('12 came home after leaving', T('home'))
kind('13 rescue in danger', T('rescue'))
kind('13 stayed for the group / stepped up', T('stayfor', 'stepup'))
kind('15 death', T('death'))
kind('15 loss situation answered', lambda e, b: e['tr'] == 'loss')

# 8 fall and recovery: a blow to who[0], then within 36 months a rise for the same person, and whether the rise cites the blow.
BLOW = {'dismiss', 'split', 'divorce', 'plan:failed', 'want:failed', 'caught', 'passed', 'accident', 'scheme:found', 'notpicked', 'setback', 'betrayed'}
RISE = {'hired', 'promoted', 'married', 'dating', 'want:achieved', 'bought', 'opened', 'group:joined', 'seize', 'take'}
nb = rec = cite = 0; base_n = base_r = 0
for meta, ev in worlds:
    byid, kids = index(ev)
    rises = collections.defaultdict(list)
    for e in ev:
        if e['ty'] in RISE: rises[e['who'][0]].append(e)
    for e in ev:
        if e['ty'] in BLOW and e['t'] < 60:
            p = e['who'][0]; nb += 1
            later = [r for r in rises[p] if e['t'] < r['t'] <= e['t'] + 36]
            if later: rec += 1
            # does any later rise descend from the blow?
            desc = set(); q = [e['id']]
            while q:
                i = q.pop()
                for k in kids.get(i, []):
                    if k not in desc: desc.add(k); q.append(k)
            if any(r['id'] in desc for r in later): cite += 1
    # base rate: any person who had any event at month 24, a rise in months 25-60
    ppl = {e['who'][0] for e in ev if 12 <= e['t'] < 24}
    for p in ppl:
        base_n += 1
        if any(24 < r['t'] <= 60 for r in rises[p]): base_r += 1
R8 = dict(blows=nb, recovered=rec / nb, cited=cite / nb, base=base_r / base_n)

# 4/state: share of adult-months holding a secret / a promise
am = sum(m['adultMonths'] for m, _ in worlds); sm = sum(m['secretMonths'] for m, _ in worlds); pm = sum(m['promiseMonths'] for m, _ in worlds)
# rivalries by stake/outcome
rv = collections.Counter((r['stake'], r['src'] or 'season') for m, _ in worlds for r in m['rivalries'] if r['since'] >= 0)
ro = collections.Counter(r['outcome'] for m, _ in worlds for r in m['rivalries'] if r['since'] >= 0)

print(f'{NW} worlds x {YRS:.0f} present years; mean town {sum(m["pop"] for m,_ in worlds)/NW:.0f} people. Rates per world-decade (±95%).')
print(f'{"kind":62s} {"n":>5s} {"/decade":>14s} {"leads":>6s} {"turn":>6s} {"known":>6s}')
for k, v in R.items():
    print(f'{k:62s} {v["n"]:5d} {v["perdec"]:8.1f} ±{v["ci"]:4.1f} {v["lead"]:6.0%} {v["turn"]:6.0%} {v["known"]:6.0%}')
print(f'\n8 fall and recovery: {R8["blows"]} blows (first 5 years); a rise for the same person within 36 months {R8["recovered"]:.0%} '
      f'(base rate for anyone active, 36 months: {R8["base"]:.0%}); the rise descends from the blow {R8["cited"]:.0%}')
print(f'state: adult-months holding a secret {sm/am:.1%}; holding a promise {pm/am:.1%}')
print('rivalries begun in the present, by stake and source:', dict(rv))
print('their outcomes:', dict(ro))

# 6 loyalty split, closer: rivalries, splits, betrayals with 2+ friends of both (friendships ending left out), and whether anyone
# outside the pair makes a decision that cites them (directly) within 36 months.
n6 = third = 0
for meta, ev in worlds:
    byid, kids = index(ev)
    for e in ev:
        if e['ty'] in ('rivals', 'split', 'divorce', 'betrayed', 'scheme:found') and (e.get('cf') or 0) >= 2 and e['t'] < 60:
            n6 += 1
            if any(byid[k]['tr'] and byid[k]['who'][0] not in e['who'][:2] and byid[k]['t'] <= e['t'] + 36 for k in kids.get(e['id'], [])): third += 1
print(f'6 split/rivalry/betrayal with 2+ friends of both: {n6} (first 5 years); a decision by someone outside the pair cites it: {third/n6:.0%}')
# 3 secrets: share of secret acts that later come out (a caught / betrayed / scheme:found / confide-told event descends from them)
ns = out = 0
for meta, ev in worlds:
    byid, kids = index(ev)
    for e in ev:
        if e['ty'] in ('skim', 'liecover', 'blame', 'allfine', 'whisper', 'whisperplan') and e['t'] < 60:
            ns += 1; desc = set(); q = [e['id']]
            while q:
                i = q.pop()
                for k in kids.get(i, []):
                    if k not in desc: desc.add(k); q.append(k)
            if any(byid[k]['ty'] in ('caught', 'betrayed', 'scheme:found') or (byid[k]['tr'] == 'discovery' and byid[k]['ty'] in ('tell', 'confrontsecret')) for k in desc): out += 1
print(f'3 secret acts in the first 5 years: {ns}; come out by the end of year 8 (caught, told, found): {out/ns:.0%}')
