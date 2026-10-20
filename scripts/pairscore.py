#!/usr/bin/env python3
"""Scores a blind paired reading (src/tools/diag/pairarm.ts) against its key.

Usage:
  python3 scripts/pairscore.py KEY ANSWERS... [--quote REGEX] [--json OUT]

KEY      key.json from pairarm.ts: {"P01": {"onIs": "A" | "B", ...}, ...}
ANSWERS  one or more reader files in the brief's shape, {"reader": name, "pairs": {"P01": {"A": {...}, "B": {...}, "prefer": "A"}}},
         or one combined file {name: {...reader file...}}. A reader's parts (pairs-1.txt, pairs-2.txt read at different sittings) are
         separate files with the same "reader": their pairs are joined.
--quote  a regular expression for the round's own wording: its quotes in faults and good reasons are listed, by arm.

What it reports, and why:
- Majority preference: in how many pairs most readers preferred the on arm. Easy to read, coarse.
- The paired score difference, on minus off, per pair averaged over readers, with a 95% interval (t over pairs). Readers score the
  version they read second higher (about half a point in rounds 29, 31 and 32), so the difference is also estimated with the order as
  a second term (difference = effect + lean × (+1 if on was B, −1 if A)). With the order dealt half and half the two agree on the
  point; the adjusted interval is narrower, because the lean is taken out of the noise. The adjusted effect and its interval are
  what a round's keep rule should be judged on.
- Krippendorff's alpha (scripts/alpha.py): how far the readers agree on the scores. It describes the panel, not the effect: a
  change can read better to every reader while they disagree on the scale. Reported, not a gate.
- Faults by kind in each arm, and the quotes matching --quote.
"""
import argparse, json, math, re, statistics as st, subprocess, sys, os
from collections import Counter

# Student's t, two-sided 95% and one-sided 90%, by degrees of freedom (exact to three places up to 60; normal beyond).
T975 = {1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228, 11: 2.201, 12: 2.179,
        13: 2.160, 14: 2.145, 15: 2.131, 16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086, 21: 2.080, 22: 2.074, 23: 2.069,
        24: 2.064, 25: 2.060, 26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042, 34: 2.032, 40: 2.021, 46: 2.013, 60: 2.000}
T90 = {1: 3.078, 2: 1.886, 3: 1.638, 4: 1.533, 5: 1.476, 6: 1.440, 7: 1.415, 8: 1.397, 9: 1.383, 10: 1.372, 11: 1.363, 12: 1.356,
       13: 1.350, 14: 1.345, 15: 1.341, 16: 1.337, 17: 1.333, 18: 1.330, 19: 1.328, 20: 1.325, 21: 1.323, 22: 1.321, 23: 1.319,
       24: 1.318, 25: 1.316, 26: 1.315, 27: 1.314, 28: 1.313, 29: 1.311, 30: 1.310, 34: 1.307, 40: 1.303, 46: 1.300, 60: 1.296}


def t(table, df):
    if df in table:
        return table[df]
    ks = sorted(table)
    for k in ks:
        if k >= df:
            return table[k]
    return 1.960 if table is T975 else 1.282


def load(paths):
    readers = {}
    for p in paths:
        d = json.load(open(p))
        files = [d] if 'pairs' in d else list(d.values())
        for f in files:
            r = f['reader']
            readers.setdefault(r, {}).update(f['pairs'])
    return readers


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('key')
    ap.add_argument('answers', nargs='+')
    ap.add_argument('--quote')
    ap.add_argument('--json')
    a = ap.parse_args()
    key = json.load(open(a.key))
    readers = load(a.answers)
    names = sorted(readers)
    pairs = sorted(key)
    missing = [(r, p) for r in names for p in pairs if p not in readers[r]]
    if missing:
        sys.exit(f'pairscore: answers missing for {missing[:5]}')

    print('pair  on   ' + '  '.join(f'{r:>14}' for r in names) + '   majority-on')
    maj, d_pair, side, scores, bchoice = 0, [], [], {r: {} for r in names}, 0
    per_reader = {r: [] for r in names}
    faults = {'on': Counter(), 'off': Counter()}
    quotes = {'good': [], 'fault': [], 'good_off': [], 'fault_off': []}
    rq = re.compile(a.quote) if a.quote else None
    for i, p in enumerate(pairs):
        on = key[p]['onIs']
        off = 'B' if on == 'A' else 'A'
        cells, votes, ds = [], 0, []
        for r in names:
            x = readers[r][p]
            cells.append(f"{x['A']['score']},{x['B']['score']},{x.get('prefer', '-')}")
            votes += x.get('prefer') == on
            bchoice += x.get('prefer') == 'B'
            dd = x[on]['score'] - x[off]['score']
            ds.append(dd)
            per_reader[r].append(dd)
            scores[r][str(2 * i + 1)] = x['A']['score']
            scores[r][str(2 * i + 2)] = x['B']['score']
            for arm, lab in ((on, 'on'), (off, 'off')):
                for f in x[arm].get('faults', []):
                    faults[lab][f['kind']] += 1
                    if rq and rq.search(f['quote']):
                        quotes['fault' if lab == 'on' else 'fault_off'].append(f"{p} {r} ({f['kind']}): {f['quote']}")
                for g in x[arm].get('good', []):
                    if rq and rq.search(g):
                        quotes['good' if lab == 'on' else 'good_off'].append(f'{p} {r}: {g}')
        m = votes * 2 > len(names)
        maj += m
        d_pair.append(st.mean(ds))
        side.append(1 if on == 'B' else -1)
        print(f'{p}   {on}   ' + '  '.join(f'{c:>14}' for c in cells) + f"   {'yes' if m else 'no'}")

    n = len(pairs)
    mean = st.mean(d_pair)
    sd = st.stdev(d_pair) if n > 1 else 0
    hw = t(T975, n - 1) * sd / math.sqrt(n)
    # The order as a second term: d = e + b*s, by least squares; the interval for e from the residuals.
    ms, md = st.mean(side), mean
    sxx = sum((s - ms) ** 2 for s in side)
    if sxx > 0 and n > 2:
        b = sum((s - ms) * (d - md) for s, d in zip(side, d_pair)) / sxx
        e = md - b * ms
        res = [d - e - b * s for s, d in zip(side, d_pair)]
        rsd = math.sqrt(sum(x * x for x in res) / (n - 2))
        se_e = rsd * math.sqrt(1 / n + ms * ms / sxx)
        adj = {'effect': e, 'lean': b, 'hw95': t(T975, n - 2) * se_e, 'lo90': e - t(T90, n - 2) * se_e, 'se': se_e}
    else:
        adj = None
    on_b = sum(1 for s in side if s > 0)
    print(f'\nThe on arm was version B in {on_b} of {n} pairs; readers chose B in {bchoice} of {n * len(names)} single choices.')
    print(f'Majority preferred the on arm in {maj} of {n}.')
    print(f'Paired score difference, on minus off: {mean:+.2f} ±{hw:.2f} (95%, {n} pairs, mean over {len(names)} readers)')
    for r in names:
        print(f'  {r:14} {st.mean(per_reader[r]):+.2f}')
    if adj:
        print(f"With the order as a term: effect {adj['effect']:+.2f} ±{adj['hw95']:.2f} (95%); one-sided 90% lower bound {adj['lo90']:+.2f};"
              f" lean toward the second version {adj['lean']:+.2f}")
    sp = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'alpha.py')
    tmp = (a.json or '/tmp/pairscore') + '.scores.json'
    json.dump({'readers': scores}, open(tmp, 'w'))
    alpha = subprocess.run([sys.executable, sp, tmp], capture_output=True, text=True).stdout.strip()
    print(alpha)
    for lab in ('on', 'off'):
        print(f'faults {lab}: total {sum(faults[lab].values())} · ' + ', '.join(f'{k} {v}' for k, v in faults[lab].most_common()))
    if rq:
        print(f"\nQuotes matching the round's wording (on arm): good {len(quotes['good'])}, faults {len(quotes['fault'])}"
              f" (unfit reasons {sum('(unfit reason)' in q for q in quotes['fault'])}); off arm: good {len(quotes['good_off'])},"
              f" faults {len(quotes['fault_off'])}")
        for k in ('good', 'fault'):
            for q in quotes[k]:
                print(f'  {k}: {q}')
    if a.json:
        json.dump({'pairs': n, 'readers': names, 'majorityOn': maj, 'diff': mean, 'hw95': hw, 'adjusted': adj, 'onB': on_b, 'chooseB': bchoice,
                   'perReader': {r: st.mean(v) for r, v in per_reader.items()}, 'faults': {k: dict(v) for k, v in faults.items()},
                   'quotes': quotes, 'scores': scores}, open(a.json, 'w'), indent=1)


if __name__ == '__main__':
    main()
