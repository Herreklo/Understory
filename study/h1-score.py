#!/usr/bin/env python3
"""Scores H1's answers (study/h1.md) against its key. Prints totals per reader and over readers, never a pair's arm.

  python3 study/h1-score.py ANSWERS... [--key study/h1-key.json]

ANSWERS  files holding the blocks people pasted back, one or more blocks a file, in any surrounding text (an email, a chat). A block is
         the page's one line of JSON starting {"study":"H1"; line breaks a mail program put inside it are taken out. When one reader
         sent more than once, their latest block is used (each block carries everything answered so far).

What it reports:
- Agreement with the model readers' majority, per reader: on round 40's pairs where the majority was clear (the rule in h1.md), with a
  Wilson 95% interval; beside it, on every pair where the model readers had a majority. No pass mark: at a dozen pairs a reader at
  chance reaches 8 of 12 one time in five. Øystein knows what round 40 added and can often tell its arm by content, so for him the
  round 40 number is not blind; the length and null pairs are.
- Length once kinds are counted: over all answered pairs and readers, the choice of A against the difference in lines (per ten) and in
  kinds, A minus B, by least squares on the 0/1 choice (a linear probability model; its intercept is the lean toward A). Beside it,
  how often the longer version was chosen where the two are at least five lines apart, and the same on the length pairs alone, where
  the kinds are within the rule's bound.
- The lean on the null pairs, where both versions are the same engine: the share choosing B (the version read second) and the share
  choosing the longer version, each with its interval.
- Marks: lines marked as false or repeating, and lines marked as showing a feeling, per version, by arm on round 40's pairs.
"""
import argparse, json, math, re, statistics as st

ap = argparse.ArgumentParser()
ap.add_argument('answers', nargs='+')
ap.add_argument('--key', default='study/h1-key.json')
a = ap.parse_args()
KEY = json.load(open(a.key))
K = KEY['pairs']


def blocks(text):
    dec = json.JSONDecoder()
    flat = re.sub(r'\r?\n', '', text)
    i = 0
    while True:
        i = flat.find('{"study":"H1"', i)
        if i < 0:
            return
        try:
            obj, end = dec.raw_decode(flat, i)
        except json.JSONDecodeError as e:
            print(f'a block could not be read ({e.msg} at {e.pos - i}); skipped')
            i += 1
            continue
        yield obj
        i = end


readers = {}
for f in a.answers:
    for b in blocks(open(f, encoding='utf8').read()):
        if b.get('page') != KEY['page']:
            print(f'{b.get("reader")}: a block from page {b.get("page")}, the key is for page {KEY["page"]}; skipped')
            continue
        name = (b.get('reader') or '?').strip()
        if name not in readers or b.get('sent', '') > readers[name].get('sent', ''):
            readers[name] = b
if not readers:
    raise SystemExit('no H1 answer blocks found')


def wilson(k, n, z=1.96):
    if n == 0:
        return float('nan'), float('nan')
    p = k / n
    c = (p + z * z / (2 * n)) / (1 + z * z / n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return c - h, c + h


def share(k, n):
    lo, hi = wilson(k, n)
    return f'{k} of {n}' + (f' ({k / n:.0%}, 95% {lo:.0%}–{hi:.0%})' if n else '')


def ols(X, y):
    """Least squares with standard errors, by the normal equations (a handful of columns)."""
    n, p = len(X), len(X[0])
    A = [[sum(X[r][i] * X[r][j] for r in range(n)) for j in range(p)] for i in range(p)]
    inv = [row[:] + [1.0 if i == j else 0.0 for j in range(p)] for i, row in enumerate(A)]
    for c in range(p):
        piv = max(range(c, p), key=lambda r: abs(inv[r][c]))
        if abs(inv[piv][c]) < 1e-12:
            return None
        inv[c], inv[piv] = inv[piv], inv[c]
        d = inv[c][c]
        inv[c] = [v / d for v in inv[c]]
        for r in range(p):
            if r != c:
                m = inv[r][c]
                inv[r] = [v - m * w for v, w in zip(inv[r], inv[c])]
    inv = [row[p:] for row in inv]
    Xy = [sum(X[r][i] * y[r] for r in range(n)) for i in range(p)]
    b = [sum(inv[i][j] * Xy[j] for j in range(p)) for i in range(p)]
    res = [y[r] - sum(b[i] * X[r][i] for i in range(p)) for r in range(n)]
    s2 = sum(e * e for e in res) / max(n - p, 1)
    return b, [math.sqrt(max(s2 * inv[i][i], 0)) for i in range(p)]


def longer(k, choice):
    d = k['linesAminusB']
    if abs(d) < 5:
        return None
    return (d > 0) == (choice == 'A')


rows, null_b, null_long, long_all, long_len = [], [0, 0], [0, 0], [0, 0], [0, 0]
marks = {'on': [0, 0, 0], 'off': [0, 0, 0]}  # versions, false or repeating, felt
print(f'H1, page {KEY["page"]}: {len(readers)} reader(s)\n')
print('Agreement with the model readers\' majority')
for name, b in sorted(readers.items()):
    P = {p: v for p, v in b['pairs'].items() if p in K and v.get('prefer') in ('A', 'B')}
    clear = [(p, v) for p, v in P.items() if K[p]['source'] == 'r40' and K[p]['model']['clear']]
    anym = [(p, v) for p, v in P.items() if K[p]['model']['majority']]
    agree = lambda xs: sum(v['prefer'] == K[p]['model']['majority'] for p, v in xs)
    secs = [v.get('s', 0) for v in P.values() if v.get('s')]
    time = f', {st.median(secs) / 60:.1f} min a pair (median)' if secs else ''
    print(f'  {name}: round 40, clear: {share(agree(clear), len(clear))}; every pair with a majority: {share(agree(anym), len(anym))}'
          f'; {len(P)} of {len(K)} pairs answered{time}')
    for p, v in P.items():
        k = K[p]
        rows.append(([1.0, k['linesAminusB'] / 10, float(k['kindsAminusB'])], 1.0 if v['prefer'] == 'A' else 0.0))
        lg = longer(k, v['prefer'])
        if lg is not None:
            long_all[0] += lg; long_all[1] += 1
            if k['source'] == 'length':
                long_len[0] += lg; long_len[1] += 1
        if k['source'] == 'null':
            null_b[0] += v['prefer'] == 'B'; null_b[1] += 1
            if lg is not None:
                null_long[0] += lg; null_long[1] += 1
        if k['source'] == 'r40':
            for side in ('A', 'B'):
                m = marks[k['arm'][side]]
                m[0] += 1
                m[1] += len(v.get('marks', {}).get(side, []))
                m[2] += len(v.get('felt', {}).get(side, []))

print('\nLength once kinds are counted (all readers, all answered pairs; the choice of A, 0 or 1)')
fit = ols([r[0] for r in rows], [r[1] for r in rows]) if len(rows) > 3 else None
if fit:
    (b0, bl, bk), (s0, sl, sk) = fit
    print(f'  ten lines more: {bl:+.3f} ±{1.96 * sl:.3f}; a kind more: {bk:+.3f} ±{1.96 * sk:.3f}; lean toward A: {b0 - 0.5:+.3f} ±{1.96 * s0:.3f}'
          f' (95%, {len(rows)} choices; choices by one reader are not independent, so the intervals are too narrow by an unknown amount)')
else:
    print('  too few choices, or no spread in lines and kinds, to fit')
print(f'  the longer chosen, versions at least five lines apart: {share(*long_all)}; on the length pairs (kinds within the bound): {share(*long_len)}')

print('\nThe lean on the null pairs (both versions the same engine)')
print(f'  chose B, the version read second: {share(*null_b)}; chose the longer: {share(*null_long)}')

print('\nMarks on round 40\'s pairs, per version (false or repeating; showing a feeling)')
for arm in ('on', 'off'):
    n, m, f = marks[arm]
    print(f'  {arm}: {n} versions, {m / n if n else 0:.2f} and {f / n if n else 0:.2f} a version')
print('\nNo pass mark (study/h1.md). It decides only selection\'s (G2\'s) pre-registration.')
