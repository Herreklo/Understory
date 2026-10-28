# P6 research: summarise bands.ts output. python3 analyse.py out-bands
import json, sys, glob, statistics as st, math, collections
D = [json.load(open(f)) for f in sorted(glob.glob(sys.argv[1] + '/bands-*.json'))]
def ci(xs):
    m = st.mean(xs); s = st.stdev(xs) if len(xs) > 1 else 0
    return f"{m:.2f} ±{1.96*s/math.sqrt(len(xs)):.2f}"
print(len(D), 'worlds')
# bands over the whole record (30-year past + 10 present years)
allb = [(d, b) for d in D for b in d['bands']]
print('bands per world, whole record (40 years):', ci([len(d['bands']) for d in D]))
pres = lambda d, b: (b['ended'] is None or b['ended'] >= d['t0'])
print('bands alive at some point in the present decade, per world:', ci([sum(pres(d, b) for b in d['bands']) for d in D]))
print('bands formed in the present decade, per world:', ci([sum(b['since'] >= d['t0'] for b in d['bands']) for d in D]))
print('bands alive at the end, per world:', ci([sum(b['ended'] is None for b in d['bands']) for d in D]))
life = [((b['ended'] if b['ended'] is not None else d['tEnd']) - b['since']) / 12 for d, b in allb]
ended = [(b['ended'] - b['since']) / 12 for d, b in allb if b['ended'] is not None]
print('bands', len(allb), 'ended', len(ended), 'lifespan of ended, years: median', st.median(ended), 'mean', round(st.mean(ended), 2), 'p90', sorted(ended)[int(.9 * len(ended))])
print('how ended:', collections.Counter((b['how'] or 'alive') if not (b['how'] or '').startswith(('they','bad','@','each','nobody p','too')) or b['how'] in ('nobody left to play with',) else 'chemistry: ' + b['how'] for d, b in allb).most_common(12))
print('founding size:', collections.Counter(len(b['founding']) for d, b in allb))
print('ever-members:', collections.Counter(len(set(b['founding']) | {j['who'] for j in b['joins']}) for d, b in allb))
# outliving founders
founderGone = [b for d, b in allb if b['founder'] in b['former'] and (b['ended'] is None or True)]
def outlived_founder(d, b):
    # founder left and the band went on (a later work, show or join), or is alive with founder out
    return b['founder'] in b['former'] and (b['ended'] is None or b['founder'] not in b['members'])
f1 = [(d, b) for d, b in allb if b['founder'] in b['former']]
print('bands whose founder left before the end:', len(f1), 'of', len(allb))
allfound = [(d, b) for d, b in allb if b['foundersIn'] == 0 and len(b['members']) > 0]
print('alive at end with no founding member left:', len(allfound), [(d['seed'], b['id'], len(b['members']), len(b['joins'])) for d, b in allfound])
# went on after every founder had gone: some join after the last founder left, with the band still going
went_on = []
for d, b in allb:
    if b['foundersLeft'] < len(b['founding']): continue
    # last founder leave time unknown precisely when no listed line; use ended time vs joins
    if b['ended'] is None and b['members']:
        went_on.append((d['seed'], b['id']))
print('every founder gone, band still going at end:', went_on)
print('joins per band:', collections.Counter(len(b['joins']) for d, b in allb))
print('bands with any join:', sum(1 for d, b in allb if b['joins']), 'of', len(allb))
# rows and escalation
strain = [s for d, b in allb for s in b['strain']]
print('groupstrain decisions', len(strain), collections.Counter(s['ch'] for s in strain))
print('words', sum(len(b['words']) for d, b in allb), 'asked', sum(len(b['asked']) for d, b in allb))
by = collections.Counter(len(b['strain']) for d, b in allb)
print('rows per band:', sorted(by.items()))
yrs = sum(life)
print('band-years', round(yrs, 1), 'rows per band-year', round(len(strain) / yrs, 3), 'words', round(sum(len(b['words']) for d, b in allb) / yrs, 3))
pstrain = [s for d, b in allb for s in b['strain'] if s['t'] >= d['t0']]
print('present decade: rows per world', ci([sum(1 for b in d['bands'] for s in b['strain'] if s['t'] >= d['t0']) for d in D]),
      'words', ci([sum(1 for b in d['bands'] for t in b['words'] if t >= d['t0']) for d in D]),
      'asked', ci([sum(1 for b in d['bands'] for t in b['asked'] if t >= d['t0']) for d in D]))
print('chemWhy at end, alive bands:', collections.Counter(c for d, b in allb if b['ended'] is None for c in b['chemWhy']).most_common(10))
print('standing at end alive:', [b['standing'] for d, b in allb if b['ended'] is None])
# people
print('share of adult-months in a band:', ci([d['inBandShare'] * 100 for d in D]), '%')
print('witness in a band, years of 10:', ci([d['witInBandYears'] for d in D]), 'witnesses ever in one:', sum(d['witInBandYears'] > 0 for d in D))
print('witness or friend/partner/kin in a band, years of 10:', ci([d['witNearBandYears'] for d in D]), 'never:', sum(d['witNearBandYears'] == 0 for d in D))
# social routines (clubs without identity)
for h in sorted({k for d in D for k in d['social']}):
    print('social routine', h, 'holders at year 10:', ci([d['social'].get(h, [0] * 10)[-1] for d in D]))
# workplaces
pl = [(d, p) for d in D for p in d['places'] if not p.get('new') and p['staff0'] > 0]
print('workplaces', len(pl), 'staff at start', round(st.mean(p['staff0'] for d, p in pl), 2), 'share of start staff still there at year 10:',
      round(sum(p['stayed'] for d, p in pl) / sum(p['staff0'] for d, p in pl), 3),
      'places with none of the start staff:', sum(p['stayed'] == 0 for d, p in pl), 'lead changed:', sum(p['lead0'] != p['leadEnd'] for d, p in pl))
# lines
print('band lines on pages, present decade, per world:', ci([d['present']['listed'] for d in D]), 'share of all listed:',
      ci([100 * d['present']['listed'] / d['present']['allListed'] for d in D]), '%')
tx = collections.Counter()
for d in D:
    for k, v in d['present']['texts'].items(): tx[k] += v
print('commonest band lines (40 worlds):')
for k, v in tx.most_common(12): print(' ', v, k)

