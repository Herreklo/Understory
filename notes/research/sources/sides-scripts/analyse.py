# P2 research: summarise out-sides/sides-*.json. Per world, then mean ±95% between worlds (1.96 × sd / √n).
import glob, json, math, sys, collections
files = sorted(glob.glob((sys.argv[1] if len(sys.argv) > 1 else 'out-sides') + '/sides-*.json'))
W = [json.load(open(f)) for f in files]
def ci(xs):
    n = len(xs); m = sum(xs) / n
    sd = math.sqrt(sum((x - m) ** 2 for x in xs) / (n - 1)) if n > 1 else 0
    return f'{m:.2f} ±{1.96 * sd / math.sqrt(n):.2f}'
def pct(xs):
    n = len(xs); m = sum(xs) / n
    sd = math.sqrt(sum((x - m) ** 2 for x in xs) / (n - 1)) if n > 1 else 0
    return f'{100*m:.1f}% ±{196 * sd / math.sqrt(n):.1f}'
def share(num, den): return num / den if den else 0
print(f'{len(W)} worlds, {W[0]["years"]} present years; population at the end {ci([w["pop"] for w in W])}; adult-years {ci([w["adultYears"] for w in W])}')
dec = lambda w: w['years'] / 10
types = collections.Counter(r['ty'] for w in W for r in w['rifts'])
print('rifts by kind (all worlds):', dict(types))
for label, f in [('all rifts', lambda r: True), ('without falling-outs', lambda r: r['ty'] != 'fellout')]:
    print(f'\n== {label}')
    print(' rifts per world-decade', ci([sum(1 for r in w['rifts'] if f(r)) / dec(w) for w in W]))
    print(' … with 1+ friend of both', ci([sum(1 for r in w['rifts'] if f(r) and r['d']) / dec(w) for w in W]))
    print(' … with 2+', ci([sum(1 for r in w['rifts'] if f(r) and len(r['d']) >= 2) / dec(w) for w in W]))
    print(' side-takings (deciders) per world-decade', ci([sum(len(r['d']) for r in w['rifts'] if f(r)) / dec(w) for w in W]))
    ds = [len(r['d']) for w in W for r in w['rifts'] if f(r) and r['d']]
    print(' deciders per rift with any:', f'{sum(ds)/len(ds):.2f}', 'max', max(ds))
    if label == 'all rifts': print(' by kind, side-takings per world-decade:', {k: round(sum(len(r['d']) for w in W for r in w['rifts'] if r['ty'] == k) / sum(dec(w) for w in W), 1) for k in types})
# Per decider: what followed in 36 months (only rifts followed for a full three years).
D = [(w['seed'], r, d) for w in W for r in w['rifts'] for d in r['d'] if r['full']]
print(f'\n== deciders followed 36 months: {len(D)}')
def rate(pred, sub=D): return f'{100*share(sum(1 for x in sub if pred(x)), len(sub)):.1f}% (n={len(sub)})'
print(' friendship with a side ended', rate(lambda x: x[2]['after']['endA'] or x[2]['after']['endB']))
print(' … by falling out', rate(lambda x: 'fellout' in (x[2]['after']['endA'], x[2]['after']['endB'])))
print(' a rift between decider and a side', rate(lambda x: x[2]['after']['riftA'] or x[2]['after']['riftB']))
print(' a weighty event shared with a side', rate(lambda x: x[2]['after']['weightyA'] + x[2]['after']['weightyB'] > 0))
print(' baseline "counter" (a tie ended or a rift, or a weighty event with a side)', rate(lambda x: x[2]['after']['endA'] or x[2]['after']['endB'] or x[2]['after']['riftA'] or x[2]['after']['riftB'] or x[2]['after']['weightyA'] + x[2]['after']['weightyB'] > 0))
print(' baseline tie only (ended or rift)', rate(lambda x: x[2]['after']['endA'] or x[2]['after']['endB'] or x[2]['after']['riftA'] or x[2]['after']['riftB']))
lt = collections.Counter(t for x in D for t in set(x[2]['after']['life']))
print(' decider life events in 36 months (share of deciders):', {k: f'{100*v/len(D):.1f}%' for k, v in lt.most_common(12)})
# The liking a decider holds toward each side, and the gap between them (how often the choice is close).
import statistics as st
gap = [abs(d['toA']['lk'] - d['toB']['lk']) for _, r, d in D]
lo = [min(d['toA']['lk'], d['toB']['lk']) for _, r, d in D]
fm = [min(d['toA']['fm'], d['toB']['fm']) for _, r, d in D]
print(f' liking toward the less liked side: median {st.median(lo):.2f}, quartiles {st.quantiles(lo, n=4)}')
print(f' familiarity toward the less familiar side: median {st.median(fm):.2f}; under 0.35: {100*sum(1 for x in fm if x < 0.35)/len(fm):.0f}%')
print(f' gap in liking between the sides: median {st.median(gap):.2f}; under 0.1: {100*sum(1 for g in gap if g < 0.1)/len(gap):.0f}%')
for drop in (0.1, 0.2, 0.3, 0.4):
    # A friendship ends when one liking < 0.02, or the lower < 0.12 with the lower familiarity < 0.35 (social.ts checkBond).
    ends = sum(1 for (_, r, d), l, f in zip(D, lo, fm) if l - drop < 0.02 or (l - drop < 0.12 and f < 0.35))
    print(f'  a loss of {drop} in liking toward the side not taken (the less liked) ends the tie at once: {100*ends/len(D):.0f}%')
# The witness.
print('\n== the witness, per rift with 1+ decider (all rifts)')
R = [(w, r) for w in W for r in w['rifts'] if r['d']]
for k in ('side', 'decider', 'knowsSide', 'knowsDecider', 'knowsRift'):
    print(f' {k}: {100*share(sum(1 for _, r in R if r["wit"][k]), len(R)):.1f}%')
reach = lambda r: r['wit']['side'] or r['wit']['decider'] or r['wit']['knowsSide'] or r['wit']['knowsDecider']
close = lambda r: r['wit']['side'] or r['wit']['decider']
print(' reach (side, decider, or knows any of the three):', pct([share(sum(1 for r in w['rifts'] if r['d'] and reach(r)), sum(1 for r in w['rifts'] if r['d'])) for w in W if any(r['d'] for r in w['rifts'])]))
# Per side-taking (decider), the witness's reach: actor, side, or knows the decider or a side.
def per_d(w, r, d):
    return r['wit']['side'] or r['wit']['decider'] or r['wit']['knowsSide'] or r['wit']['knowsDecider']
print(' side-takings within reach of the witness per witness-year:', ci([sum(len(r['d']) for r in w['rifts'] if r['d'] and reach(r)) / w['years'] for w in W]))
print(' … as actor or side per witness-year:', ci([sum(len(r['d']) for r in w['rifts'] if r['d'] and close(r)) / w['years'] for w in W]))
print(' side-takings in the town per year:', ci([sum(len(r['d']) for r in w['rifts']) / w['years'] for w in W]))
print(' rifts with a decider within reach, per witness-year:', ci([sum(1 for r in w['rifts'] if r['d'] and reach(r)) / w['years'] for w in W]))
print(' worlds where the witness is actor or side in none over the decade:', sum(1 for w in W if not any(r['d'] and close(r) for r in w['rifts'])), 'of', len(W))
for label, f in [('no falling-outs', lambda r: r['ty'] != 'fellout')]:
    print(f' [{label}] side-takings within reach per witness-year:', ci([sum(len(r['d']) for r in w['rifts'] if r['d'] and f(r) and reach(r)) / w['years'] for w in W]), '; town per year', ci([sum(len(r['d']) for r in w['rifts'] if f(r)) / w['years'] for w in W]))
# Per side-taking, the witness's reach at three bars: (1) the brief's: actor, a side, or familiarity ≥ 0.1 with this decider or a side;
# (2) close: actor, a side, or the witness's friend, partner or kin among the three; (3) actor or a side.
print('\n== per side-taking, per witness-year (town per year beside it)')
def bars(r, i):
    # A side or a decider of the rift counts at every bar (a decider's own choice, or another friend of both choosing in a rift they are in).
    wf, wc = r['wfam'], r['wclose']
    party = r['wit']['side'] or r['wit']['decider']
    loose = party or wf['a'] >= 0.1 or wf['b'] >= 0.1 or wf['d'][i] >= 0.1
    well = party or wf['a'] >= 0.5 or wf['b'] >= 0.5 or wf['d'][i] >= 0.5
    close = party or wc[0] or wc[1] or wc[2 + i]
    return loose, well, close, party
for k, name in enumerate(['familiarity ≥ 0.1 (the brief)', 'familiarity ≥ 0.5', "friend, partner or kin", 'a side or a decider']):
    xs = [sum(1 for r in w['rifts'] for i in range(len(r['d'])) if bars(r, i)[k]) / w['years'] for w in W]
    print(f' {name}: {ci(xs)}; worlds with none in ten years: {sum(1 for x in xs if x == 0)} of {len(W)}')
print(' the witness decides (is a friend of both):', ci([sum(1 for r in w['rifts'] if r['wit']['decider']) / w['years'] for w in W]))
print(' town per year:', ci([sum(len(r['d']) for r in w['rifts']) / w['years'] for w in W]), '; in six years', ci([6 * sum(len(r['d']) for r in w['rifts']) / w['years'] for w in W]))
xs = sorted(6 * sum(1 for r in w['rifts'] for i in range(len(r['d'])) if bars(r, i)[2]) / w['years'] for w in W)
print(' witness as actor, side, or close to one, in six years: range', xs[0], '–', xs[-1], 'median', xs[len(xs)//2])
