#!/usr/bin/env python3
"""The human study's analysis (round Q3; docs/study.md). Reads the files testers send back and the items they answered, and prints:
the primary estimate (accuracy with the page minus without: the mean over items of each item's difference, with a 95% interval from a
bootstrap over testers and items together), the exclusions the protocol fixed, calibration, and the machine readers' accuracy on the
same items. Committed before the first tester, as the protocol requires.

  python3 scripts/study.py study/items.json <answer files or a folder>...     the analysis
  python3 scripts/study.py study/items.json --synthetic 30 0.06 [seed]         plants a 6-point effect in 30 made-up testers and recovers it

Numbers are plain: no mixed model is fitted; the two-way bootstrap stands in for one (testers and items both resampled)."""
import json, os, random, statistics, sys
from collections import defaultdict

DRAWS = 2000
MIN_MS = 5000  # a median under five seconds an item is not a reading
SAME_POS = 0.8  # the same answer position on more than this share of items is not an answer


def load_items(path):
    return {it['id']: it for it in json.load(open(path))}


def load_files(paths):
    out = []
    for p in paths:
        if os.path.isdir(p):
            out += load_files(sorted(os.path.join(p, f) for f in os.listdir(p) if f.endswith('.json')))
            continue
        try:
            d = json.load(open(p))
        except Exception as e:
            print(f'skip {p}: {e}')
            continue
        if isinstance(d, dict) and 'items' in d and 'tester' in d:
            out.append(d)
    return out


def exclusions(testers):
    kept, dropped = [], []
    for t in testers:
        items = t['items']
        if not items:
            dropped.append((t['tester'], 'no answers'))
            continue
        med = statistics.median(x.get('ms', 0) for x in items)
        pos = defaultdict(int)
        for x in items:
            pos[x.get('position', -1)] += 1
        same = max(pos.values()) / len(items)
        if med < MIN_MS:
            dropped.append((t['tester'], f'median {med / 1000:.1f} s an item'))
        elif same > SAME_POS:
            dropped.append((t['tester'], f'one answer position {100 * same:.0f}% of the time'))
        else:
            kept.append(t)
    return kept, dropped


def estimate(testers):
    # item -> condition -> list of (tester, correct)
    by = defaultdict(lambda: {'page': [], 'bare': []})
    for t in testers:
        for x in t['items']:
            by[x['id']][x['cond']].append((t['tester'], 1 if x['correct'] else 0))
    def point(items, testerset=None):
        diffs = []
        for it in items:
            d = by[it]
            a = [c for (tt, c) in d['page'] if testerset is None or tt in testerset]
            b = [c for (tt, c) in d['bare'] if testerset is None or tt in testerset]
            if a and b:
                diffs.append(statistics.mean(a) - statistics.mean(b))
        return 100 * statistics.mean(diffs) if diffs else float('nan'), len(diffs)
    items = sorted(by)
    est, n_items = point(items)
    # the bootstrap: resample testers (with their answers) and items, both with replacement
    names = [t['tester'] for t in testers]
    rnd = random.Random(1)
    boots = []
    for _ in range(DRAWS):
        ts = rnd.choices(names, k=len(names))
        its = rnd.choices(items, k=len(items))
        # a tester drawn twice counts twice: build a multiset by expanding names
        diffs = []
        for it in its:
            d = by[it]
            a = [c for (tt, c) in d['page'] for _k in range(ts.count(tt))]
            b = [c for (tt, c) in d['bare'] for _k in range(ts.count(tt))]
            if a and b:
                diffs.append(statistics.mean(a) - statistics.mean(b))
        if diffs:
            boots.append(100 * statistics.mean(diffs))
    boots.sort()
    lo, hi = (boots[int(0.025 * len(boots))], boots[int(0.975 * len(boots)) - 1]) if boots else (float('nan'), float('nan'))
    return est, lo, hi, n_items


def verdict(est, lo, hi):
    if lo > 0 and est >= 5:
        return 'helps (the interval lies above 0 and the estimate is at least 5 points)'
    if lo > 0:
        return 'helps, but too little to matter (above 0, under 5 points)'
    if hi < 0:
        return 'misleads (the interval lies below 0)'
    return 'not shown either way'


def calibration(testers):
    by = defaultdict(list)
    for t in testers:
        for x in t['items']:
            by[x.get('conf', '?')].append(1 if x['correct'] else 0)
    return {k: (100 * statistics.mean(v), len(v)) for k, v in by.items()}


def readers(items, testers):
    ids = sorted({x['id'] for t in testers for x in t['items'] if x['id'] in items})
    out = {}
    for r in ('notebook', 'base', 'page', 'witness'):
        hits = [1 if items[i]['readers'].get(r) == items[i]['answer'] else 0 for i in ids]
        out[r] = 100 * statistics.mean(hits) if hits else float('nan')
    human = defaultdict(list)
    for t in testers:
        for x in t['items']:
            human[x['cond']].append(1 if x['correct'] else 0)
    out['human with the page'] = 100 * statistics.mean(human['page']) if human['page'] else float('nan')
    out['human without'] = 100 * statistics.mean(human['bare']) if human['bare'] else float('nan')
    return out, len(ids)


def synthetic(items, n, effect, seed=7):
    # made-up testers: a base chance of being right that varies by item and tester, plus the planted effect with the page
    rnd = random.Random(seed)
    ids = list(items)
    item_skill = {i: rnd.gauss(0, 0.08) for i in ids}
    testers = []
    for k in range(n):
        skill = rnd.gauss(0, 0.06)
        picked = rnd.sample(ids, min(24, len(ids)))
        flip = rnd.random() < 0.5
        rows = []
        for j, i in enumerate(picked):
            cond = 'page' if (j % 2 == 0) == flip else 'bare'
            p = 0.55 + skill + item_skill[i] + (effect if cond == 'page' else 0)
            right = rnd.random() < p
            rows.append({'id': i, 'cond': cond, 'correct': right, 'conf': rnd.choice(['guessing', 'fairly sure', 'sure']), 'ms': rnd.randint(8000, 40000), 'position': rnd.randint(0, 2)})
        testers.append({'tester': f's{k:03d}', 'items': rows})
    return testers


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return
    items = load_items(sys.argv[1])
    if sys.argv[2] == '--synthetic':
        n, effect = int(sys.argv[3]), float(sys.argv[4])
        seed = int(sys.argv[5]) if len(sys.argv) > 5 else 7
        testers = synthetic(items, n, effect, seed)
        print(f'synthetic: {n} testers, planted effect {100 * effect:.1f} points')
    else:
        testers = load_files(sys.argv[2:])
        print(f'{len(testers)} tester files')
    kept, dropped = exclusions(testers)
    for name, why in dropped:
        print(f'  excluded {name}: {why}')
    if not kept:
        print('nothing to analyse')
        return
    est, lo, hi, n_items = estimate(kept)
    print(f'primary: with the page minus without = {est:+.1f} points, 95% [{lo:+.1f}, {hi:+.1f}] over {n_items} items seen both ways, {len(kept)} testers')
    print(f'verdict by the protocol: {verdict(est, lo, hi)}')
    cal = calibration(kept)
    print('calibration: ' + ' · '.join(f'{k} {v[0]:.0f}% right (n {v[1]})' for k, v in sorted(cal.items())))
    rd, n_ids = readers(items, kept)
    print(f'on the {n_ids} items answered, right: ' + ' · '.join(f'{k} {v:.1f}%' for k, v in rd.items()))
    felt = [t.get('felt') for t in kept if t.get('felt')]
    again = [t.get('again') for t in kept if t.get('again')]
    if felt or again:
        print(f"felt like people: {statistics.mean(felt):.2f} of 5 (n {len(felt)}) · would do another set: {again.count('yes')} of {len(again)}")


if __name__ == '__main__':
    main()
