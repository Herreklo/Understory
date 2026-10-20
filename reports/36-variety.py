#!/usr/bin/env python3
"""Variety, not length (round 36's outcome): what in a life goes with a blind reader's score, over the readings of rounds 29-34.

  npx tsx reports/36-variety.ts 29,30,31,32,33,34 off > out-variety-off.json   (rebuilt: reports/36-variety-off.json, -on.json)
  npx tsx reports/36-variety.ts 29,30,31,32,33,34 on  > out-variety-on.json
  python3 reports/36-variety.py out-variety-off.json out-variety-on.json

1. Across lives (today's engine, the off arm of each reading): the mean score of the three readers against the page's lines and its
   distinct kinds of line (event types), with the round as a term (readers differ by round).
2. Within pairs (the same person, the round's switch on and off): the score difference against the differences in lines and in
   kinds, with the order of the two versions as a term.
"""
import json, os, statistics as st, sys
import numpy as np

R = 'reports'


def answers(r):
    p = f'{R}/{r}-reading-answers.json'
    if os.path.exists(p):
        return list(json.load(open(p)).values())
    return [json.load(open(f'{R}/{r}-reading-{n}.json')) for n in ('novelist', 'socialworker', 'player')]


def score(r, pair, version):
    return st.mean(f['pairs'][pair][version]['score'] for f in answers(r) if pair in f['pairs'])


def fit(X, Y):
    X, Y = np.array(X, float), np.array(Y, float)
    b = np.linalg.lstsq(X, Y, rcond=None)[0]
    res = Y - X @ b
    s2 = res @ res / (len(Y) - X.shape[1])
    se = np.sqrt(np.diag(s2 * np.linalg.inv(X.T @ X)))
    return b, se, 1 - res @ res / ((Y - Y.mean()) @ (Y - Y.mean()))


off = [x for x in json.load(open(sys.argv[1])) if x['lines'] == x['packLines']]
rounds = sorted({x['round'] for x in off})
print(f'Across lives: {len(off)} lives of the off arm rebuilt, every page the one the readers read.')
for feats in (['lines'], ['distinctTypes'], ['lines', 'distinctTypes']):
    X = [[1.0 if x['round'] == r else 0.0 for r in rounds] + [x[f] for f in feats] for x in off]
    b, se, r2 = fit(X, [score(x['round'], x['pair'], x['version']) for x in off])
    k = len(rounds)
    print('  ' + ' + '.join(f'{f} {b[k + i]:+.3f} ±{1.96 * se[k + i]:.3f}' for i, f in enumerate(feats)) + f'   (R² {r2:.2f}, with the round)')
print(f"  a life has {st.mean(x['lines'] for x in off):.0f} lines and {st.mean(x['distinctTypes'] for x in off):.0f} kinds of line on average")

if len(sys.argv) > 2:
    on = {(x['round'], x['pair']): x for x in json.load(open(sys.argv[2])) if x['lines'] == x['packLines']}
    rows = []
    for x in off:
        y = on.get((x['round'], x['pair']))
        if not y:
            continue
        key = json.load(open(f"{R}/{x['round']}-reading-key.json"))[x['pair']]
        d = score(x['round'], x['pair'], y['version']) - score(x['round'], x['pair'], x['version'])
        rows.append((x['round'], d, y['lines'] - x['lines'], y['distinctTypes'] - x['distinctTypes'], 1 if key['onIs'] == 'B' else -1))
    print(f'\nWithin pairs: {len(rows)} pairs whose on arm was rebuilt exactly.')
    for name, cols in (('lines', [2]), ('kinds', [3]), ('lines and kinds', [2, 3])):
        X = [[1.0, r[4]] + [r[c] for c in cols] for r in rows]
        b, se, r2 = fit(X, [r[1] for r in rows])
        lab = ['lines', 'kinds']
        print('  ' + ' + '.join(f'{lab[c - 2]} {b[2 + i]:+.3f} ±{1.96 * se[2 + i]:.3f}' for i, c in enumerate(cols)) + f'   (with the order; effect at no difference {b[0]:+.2f})')
    for r in sorted({x[0] for x in rows}):
        rs = [x for x in rows if x[0] == r]
        print(f"  round {r}: {len(rs)} pairs, on minus off: lines {st.mean(x[2] for x in rs):+.1f}, kinds {st.mean(x[3] for x in rs):+.1f}, score {st.mean(x[1] for x in rs):+.2f}")
