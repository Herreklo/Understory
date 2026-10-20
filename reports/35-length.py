#!/usr/bin/env python3
"""How much the length of a page moves a blind reader, over the six paired readings of rounds 29-34 (round 35's withdrawal).

Run from the repo root: python3 reports/35-length.py
Reads reports/<round>-reading-key.json, -pack.txt and the answers (one file per reader, or -answers.json), all committed.
A page's length is its lines, not counting the cited events shown under a line. Reports, for every reader's single choice, whether
the longer version was chosen; the score difference regressed on the difference in lines, with the round and the order as terms;
and each round's effect with and without the difference in lines as a term.
"""
import json, os, re, statistics as st
import numpy as np

R = 'reports'
ROUNDS = ['29', '30', '31', '32', '33', '34']


def answers(r):
    p = f'{R}/{r}-reading-answers.json'
    if os.path.exists(p):
        d = json.load(open(p))
        return list(d.values())
    return [json.load(open(f'{R}/{r}-reading-{n}.json')) for n in ('novelist', 'socialworker', 'player')]


def lines(r):
    n, cur = {}, None
    for line in open(f'{R}/{r}-reading-pack.txt'):
        m = re.match(r'##### (P\d+), version ([AB])', line)
        if m:
            cur = (m[1], m[2])
            n[cur] = 0
        elif cur and line.strip() and not line.startswith('    ↳'):
            n[cur] += 1
    return n


rows, choices = [], {'longer': 0, 'shorter': 0, 'near': 0}
per_round = {}
for r in ROUNDS:
    key = json.load(open(f'{R}/{r}-reading-key.json'))
    n = lines(r)
    per = {}
    for f in answers(r):
        for p, v in f['pairs'].items():
            on = key[p]['onIs']
            off = 'B' if on == 'A' else 'A'
            per.setdefault(p, []).append(v[on]['score'] - v[off]['score'])
            dl = n[(p, 'A')] - n[(p, 'B')]
            if v.get('prefer') in ('A', 'B'):
                if abs(dl) < 5:
                    choices['near'] += 1
                else:
                    choices['longer' if (dl > 0) == (v['prefer'] == 'A') else 'shorter'] += 1
    for p, ds in per.items():
        on = key[p]['onIs']
        off = 'B' if on == 'A' else 'A'
        rows.append((r, st.mean(ds), n[(p, on)] - n[(p, off)], 1 if on == 'B' else -1))
    per_round[r] = [x for x in rows if x[0] == r]

print('Choices with the two versions at least five lines apart: the longer chosen %d, the shorter %d (%.0f%%); %d choices nearer than that.'
      % (choices['longer'], choices['shorter'], 100 * choices['longer'] / (choices['longer'] + choices['shorter']), choices['near']))


def fit(rs, with_lines):
    X = [[1.0 if x[0] == k else 0.0 for k in ROUNDS if any(y[0] == k for y in rs)] + ([x[2]] if with_lines else []) + [x[3]] for x in rs]
    X, Y = np.array(X), np.array([x[1] for x in rs])
    b = np.linalg.lstsq(X, Y, rcond=None)[0]
    res = Y - X @ b
    s2 = res @ res / (len(Y) - X.shape[1])
    se = np.sqrt(np.diag(s2 * np.linalg.inv(X.T @ X)))
    return b, se, float(np.sqrt(s2))


b, se, sd = fit(rows, True)
print('Score difference (on minus off, mean of three readers) per ten lines more in the on version: %+.2f ±%.2f (95%%), %d pairs, residual sd %.2f'
      % (10 * b[-2], 1.96 * 10 * se[-2], len(rows), sd))
print('\nround  pairs  on-minus-off lines (sd)   effect with the order as a term   ... and the lines as a term')
for r in ROUNDS:
    rs = per_round[r]
    b0, se0, _ = fit(rs, False)
    b1, se1, _ = fit(rs, True)
    dl = [x[2] for x in rs]
    print('%5s  %5d  %+8.1f (%4.1f)              %+.2f ±%.2f                       %+.2f ±%.2f'
          % (r, len(rs), st.mean(dl), st.stdev(dl), b0[0], 1.96 * se0[0], b1[0], 1.96 * se1[0]))
