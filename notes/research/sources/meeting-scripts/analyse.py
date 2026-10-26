# P4 research (26 Oct 2026): reads out-meeting/meet-*.json and demog-*.jsonl and prints the note's numbers.
#   python3 -I notes/research/sources/meeting-scripts/analyse.py [outdir]
# Each figure: the mean per world with its 95% interval between worlds (1.96 sd / sqrt n), or a pooled share where said.
import json, glob, math, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else 'out-meeting'
KINDS = ['resentment', 'guilt', 'gratitude']


def ci(xs):
    xs = [x for x in xs if x is not None]
    n = len(xs)
    if not n:
        return 'n/a'
    m = sum(xs) / n
    sd = math.sqrt(sum((x - m) ** 2 for x in xs) / (n - 1)) if n > 1 else 0
    return f'{m:.1f} ±{1.96 * sd / math.sqrt(n):.1f}'


worlds = [json.load(open(f)) for f in sorted(glob.glob(f'{OUT}/meet-*.json'))]
print(f'{len(worlds)} worlds, {worlds[0]["years"]} present years each')

print('\n## Episodes with a whole year observed (onset at 0.12+), per world-decade and shares (%)')
for strong in (False, True):
    print(f'-- onset {"0.3 or more" if strong else "0.12 or more"}')
    for k in KINDS + ['all']:
        per, met, flip, contact, sh = [], [], [], [], []
        for w in worlds:
            es = [e for e in w['episodes'] if e['full'] and (k == 'all' or e['k'] == k) and (not strong or e['v0'] >= 0.3)]
            per.append(len(es) * 10 / w['years'])
            if es:
                met.append(100 * sum(e['met'] for e in es) / len(es))
                flip.append(100 * sum(e['flipped'] for e in es) / len(es))
                contact.append(100 * sum(e['contact'] for e in es) / len(es))
                sh.append(100 * sum(e['sh'][0] for e in es) / len(es))
        pooled = [e for w in worlds for e in w['episodes'] if e['full'] and (k == 'all' or e['k'] == k) and (not strong or e['v0'] >= 0.3)]
        pm = 100 * sum(e['met'] for e in pooled) / max(1, len(pooled))
        pf = 100 * sum(e['flipped'] for e in pooled) / max(1, len(pooled))
        print(f'{k:11s} per decade {ci(per):12s} met {ci(met):12s} (pooled {pm:.1f}) flipped there {ci(flip):11s} (pooled {pf:.1f}) any contact {ci(contact):12s} share a place at onset {ci(sh)}')

print('\n## Where met, by kind of decision (pooled, onset 0.12+)')
for k in KINDS:
    trig = {}
    for w in worlds:
        for e in w['episodes']:
            if e['full'] and e['k'] == k and e['met']:
                for t in set(e['metTrig']):
                    trig[t] = trig.get(t, 0) + 1
    print(k, sorted(trig.items(), key=lambda x: -x[1])[:8])

print('\n## Eligible holder-months (0.3+, cause standing, object in town, a shared place), per world-decade; what won the month')
bands = [('none', lambda x: x == 0), ('0.8-0.9', lambda x: 0 < x <= 0.9), ('1.0', lambda x: 0.9 < x <= 1.0), ('1.2-1.5', lambda x: 1.0 < x <= 1.5), ('1.8-2', lambda x: x > 1.5)]
for k in KINDS + ['all']:
    per = []
    share = {b: [] for b, _ in bands}
    red = []
    for w in worlds:
        ms = [m for m in w['months'] if k == 'all' or m['k'] == k]
        per.append(len(ms) * 10 / w['years'])
        if ms:
            for b, f in bands:
                share[b].append(100 * sum(f(m['win']) for m in ms) / len(ms))
            red.append(100 * sum(m['redirect'] for m in ms) / len(ms))
    print(f'{k:11s} {ci(per):14s} ' + ' '.join(f'{b} {ci(share[b])}' for b, _ in bands) + f' | redirectable {ci(red)}')

print('\n## The old wound: decisions where the actor resents the target, and of those, the resentment weighed (pooled)')
ow = [sum(w['oldwound'][x] for w in worlds) for x in ('resenting', 'weighed')]
print(ow, f'{100 * ow[1] / max(1, ow[0]):.0f}% weighed')

print('\n## Flip share of each kind by kind of decision (pooled; weighed n, flips, %), top by n')
agg = {}
for w in worlds:
    for key, (n, f) in w['byTrigger'].items():
        a = agg.setdefault(key, [0, 0])
        a[0] += n
        a[1] += f
for k in ['grief'] + KINDS + ['owes', 'owed']:
    rows = sorted([(key.split('|')[1], n, f) for key, (n, f) in agg.items() if key.split('|')[0] == k], key=lambda x: -x[1])
    tot = sum(r[1] for r in rows), sum(r[2] for r in rows)
    print(f'{k}: all {tot[0]} {tot[1]} {100 * tot[1] / max(1, tot[0]):.1f}% | ' + ', '.join(f'{t} {n}/{f} ({100 * f / n:.0f}%)' for t, n, f in rows[:7]))

print('\n## Raising a meeting: P(met within a year) if each eligible month raises one with chance c x intensity (pooled episodes, onset 0.3+)')
for c in (0.1, 0.25, 0.5):
    for k in KINDS + ['all']:
        es = [e for w in worlds for e in w['episodes'] if e['full'] and (k == 'all' or e['k'] == k) and e['v0'] >= 0.3]
        ps = []
        for e in es:
            q = 1.0
            for v, s in list(zip(e['v'], e['sh']))[:12]:
                if v >= 0.3 and s:
                    q *= 1 - c * v
            ps.append(1 - q)
        both = [max(1 - (1 - p) * (0 if e['met'] else 1), 0) for p, e in zip(ps, es)]
        print(f'c={c} {k:11s} raised {100 * sum(ps) / max(1, len(ps)):.1f}%  raised or met already {100 * sum(both) / max(1, len(both)):.1f}%  n={len(es)}')

print('\n## Demography, 20 years from the present, per world-decade (paired worlds)')
arms = {}
for f in sorted(glob.glob(f'{OUT}/demog-*.jsonl')):
    rows = [json.loads(l) for l in open(f)]
    arms[rows[0]['arm']] = {r['seed']: r for r in rows}
common = set.intersection(*[set(a) for a in arms.values()]) if arms else set()
print(f'{len(common)} worlds in every arm')
for arm, rs in sorted(arms.items()):
    rs = [rs[s] for s in sorted(common)]
    d = rs[0]['years'] / 10
    b = sum(r['births'] for r in rs)
    de = sum(r['deaths'] for r in rs)
    cm = sum(r['coupleMonths'] for r in rs)
    tp = {}
    for r in rs:
        for k, v in r['towardPartner'].items():
            tp[k] = tp.get(k, 0) + v
    am = sum(r['adultMonths'] for r in rs)
    print(
        f'{arm:14s} births {ci([r["births"] / d for r in rs]):10s} deaths {ci([r["deaths"] / d for r in rs]):10s} ratio {b / de:.2f} '
        f'marriages {ci([r["marriages"] / d for r in rs]):9s} splits {ci([r["splits"] / d for r in rs]):9s} '
        f'couple-months {cm / len(rs) / d:.0f} low-like {100 * sum(r["lowLike"] for r in rs) / max(1, cm):.1f}% mean like {sum(r["likeSum"] for r in rs) / max(1, cm):.3f} '
        f'pop end/start {sum(r["end"] for r in rs) / sum(r["start"] for r in rs):.2f} toward partner (per 100 adult-months) '
        + ', '.join(f'{k} {100 * v / am:.2f}' for k, v in sorted(tp.items()))
    )
if 'on' in arms and 'off' in arms:
    print('paired on - off per world-decade:')
    for key in ('births', 'deaths', 'marriages', 'splits'):
        diffs = [(arms['on'][s][key] - arms['off'][s][key]) / (arms['on'][s]['years'] / 10) for s in sorted(common)]
        print(f'  {key}: {ci(diffs)}')
