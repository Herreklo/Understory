"""High against low, within pairs, and "rather read on": which story features go with readers' scores beyond lines and kinds.

  python3 notes/research/sources/intrigue-scripts/analysis.py > notes/research/sources/intrigue-scripts/analysis-out.txt

Scale: each reader's scores z-scored within its reading, averaged over readers, the order lean (version B read second) taken out
within each reading (data.py). Lines and kinds centred within each reading. Kinds: the key's (rounds 37-41, M38 null; 192 pairs);
for rounds 29-34 a text proxy (distinct three-word templates, r = 0.96 with the key's kinds where both exist).
Intervals: 95%, by a bootstrap over pairs (both versions of a person move together), 1000 draws, seed 1.
"""
import sys, os, random, statistics as st, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import data, features  # noqa: E402

random.seed(1)
NB = 1000


def ols(X, y):
    k = len(X[0])
    A = [[sum(r[i] * r[j] for r in X) for j in range(k)] for i in range(k)]
    b = [sum(r[i] * v for r, v in zip(X, y)) for i in range(k)]
    # solve A x = b (Gauss-Jordan)
    M = [A[i][:] + [b[i]] for i in range(k)]
    for c in range(k):
        piv = max(range(c, k), key=lambda r: abs(M[r][c]))
        M[c], M[piv] = M[piv], M[c]
        d = M[c][c]
        if abs(d) < 1e-12:
            return None
        M[c] = [v / d for v in M[c]]
        for r in range(k):
            if r != c and M[r][c]:
                f = M[r][c]
                M[r] = [a - f * bb for a, bb in zip(M[r], M[c])]
    return [M[i][k] for i in range(k)]


def solve(A, b):
    k = len(b)
    M = [A[i][:] + [b[i]] for i in range(k)]
    for c in range(k):
        piv = max(range(c, k), key=lambda r: abs(M[r][c]))
        M[c], M[piv] = M[piv], M[c]
        d = M[c][c]
        if abs(d) < 1e-12:
            return None
        M[c] = [v / d for v in M[c]]
        for r in range(k):
            if r != c and M[r][c]:
                f = M[r][c]
                M[r] = [a - f * bb for a, bb in zip(M[r], M[c])]
    return [M[i][k] for i in range(k)]


def boot_ols(units, xf, yf, coef):
    """OLS coefficient `coef` with a bootstrap over clusters, by summing each cluster's X'X and X'y. -> (point, lo, hi)."""
    stats = []
    for u in units:
        X = [xf(r) for r in u]
        y = [yf(r) for r in u]
        k = len(X[0])
        stats.append(([[sum(x[i] * x[j] for x in X) for j in range(k)] for i in range(k)], [sum(x[i] * v for x, v in zip(X, y)) for i in range(k)]))
    k = len(stats[0][1])

    def fit(sel):
        A = [[0.0] * k for _ in range(k)]
        b = [0.0] * k
        for i in sel:
            a_, b_ = stats[i]
            for p in range(k):
                b[p] += b_[p]
                rowA, rowa = A[p], a_[p]
                for q in range(k):
                    rowA[q] += rowa[q]
        r = solve(A, b)
        return r and r[coef]
    n = len(stats)
    pt = fit(range(n))
    bs = sorted(v for v in (fit([random.randrange(n) for _ in range(n)]) for _ in range(NB)) if v is not None)
    return pt, bs[int(0.025 * len(bs))], bs[int(0.975 * len(bs)) - 1]


def prep(labels, true_kinds):
    vs = data.load(labels)
    for x in vs:
        x['f'] = features.features(x)
        x['K'] = x['kinds'] if true_kinds else x['f']['kinds_proxy']
    for lab in {x['reading'] for x in vs}:
        xs = [x for x in vs if x['reading'] == lab]
        ml, mk = st.mean(x['nlines'] for x in xs), st.mean(x['K'] for x in xs)
        for x in xs:
            x['cl'] = (x['nlines'] - ml) / 10
            x['ck'] = (x['K'] - mk) / 10
    return vs


def sd(vals):
    s = st.pstdev(vals)
    return s or 1.0


FEATS = [c for c, _ in features.CANDIDATES] + ['conflict_n', 'secret_n', 'letdown_n', 'cast3', 'breadth', 'subject_share', 'repeat_share', 'absent_share']
COUNTS = {'callback_n', 'conflict_n', 'secret_n', 'letdown_n', 'cast3', 'breadth', 'subject_share', 'repeat_share', 'absent_share'}


def across(vs, title):
    print(f'\n## Across lives: {title} ({len(vs)} versions, {len(vs)//2} pairs)')
    units = {}
    for x in vs:
        units.setdefault((x['reading'], x['pair']), []).append(x)
    U = list(units.values())
    base = lambda rows: ols([[1, r['cl'], r['ck']] for r in rows], [r['zadj'] for r in rows])
    b = base(vs)
    pred = [b[0] + b[1] * x['cl'] + b[2] * x['ck'] for x in vs]
    ybar = st.mean(x['zadj'] for x in vs)
    r2 = 1 - sum((x['zadj'] - p) ** 2 for x, p in zip(vs, pred)) / sum((x['zadj'] - ybar) ** 2 for x in vs)
    r2l = None
    bl = ols([[1, x['cl']] for x in vs], [x['zadj'] for x in vs])
    pl = [bl[0] + bl[1] * x['cl'] for x in vs]
    r2l = 1 - sum((x['zadj'] - p) ** 2 for x, p in zip(vs, pl)) / sum((x['zadj'] - ybar) ** 2 for x in vs)
    print(f'lines alone R2 {r2l:.2f}; lines+kinds R2 {r2:.2f}; per 10 lines {b[1]:+.3f}, per 10 kinds {b[2]:+.3f} (z units)')
    # quintiles within reading
    top, bot = [], []
    for lab in {x['reading'] for x in vs}:
        xs = sorted([x for x in vs if x['reading'] == lab], key=lambda x: x['zadj'])
        q = max(1, round(len(xs) / 5))
        bot += xs[:q]
        top += xs[-q:]
    print(f'top fifth {len(top)} versions: mean lines {st.mean(x["nlines"] for x in top):.0f}, kinds {st.mean(x["K"] for x in top):.0f}; '
          f'bottom fifth {len(bot)}: lines {st.mean(x["nlines"] for x in bot):.0f}, kinds {st.mean(x["K"] for x in bot):.0f}')
    print('| feature | top fifth | bottom fifth | raw (z per unit) | +lines+kinds (z per unit) [95%] |')
    print('| --- | --- | --- | --- | --- |')
    for f in FEATS:
        s = sd([x['f'][f] for x in vs]) if f in COUNTS else 1.0
        unit = 'per sd' if f in COUNTS else 'has'
        raw = boot_ols(U, lambda r: [1, r['f'][f] / s], lambda r: r['zadj'], 1)
        adj = boot_ols(U, lambda r: [1, r['f'][f] / s, r['cl'], r['ck']], lambda r: r['zadj'], 1)
        tp = st.mean(x['f'][f] for x in top)
        bp = st.mean(x['f'][f] for x in bot)
        fmt = (lambda v: f'{v:.2f}') if f in COUNTS else (lambda v: f'{100*v:.0f}%')
        print(f'| {f} ({unit}{", sd " + format(s, ".2f") if f in COUNTS else ""}) | {fmt(tp)} | {fmt(bp)} | {raw[0]:+.2f} | {adj[0]:+.2f} [{adj[1]:+.2f}, {adj[2]:+.2f}] |')
    return top, bot


def within(vs, title):
    P = data.pairs_of(vs)
    print(f'\n## Within pairs: {title} ({len(P)} pairs)')
    print('Model: dz(A-B) = lean + b_lines*dlines + b_kinds*dkinds + b*dfeature; and the same for the share of readers preferring A.')
    rows = [{'dz': a['zmean'] - b['zmean'], 'dl': (a['nlines'] - b['nlines']) / 10, 'dk': (a['K'] - b['K']) / 10,
             'pA': a['preferred'], 'a': a, 'b': b} for a, b in P]
    U = [[r] for r in rows]
    bb = ols([[1, r['dl'], r['dk']] for r in rows], [r['dz'] for r in rows])
    bp = ols([[1, r['dl'], r['dk']] for r in rows], [r['pA'] for r in rows])
    print(f'base: dz lean {bb[0]:+.2f}, per 10 lines {bb[1]:+.3f}, per 10 kinds {bb[2]:+.3f}; prefer-A intercept {bp[0]:.2f}, per 10 lines {bp[1]:+.3f}, per 10 kinds {bp[2]:+.3f}')
    print('| feature | pairs differing | score: dz per unit, +lines+kinds [95%] | prefer: share per unit, +lines+kinds [95%] |')
    print('| --- | --- | --- | --- |')
    for f in FEATS:
        s = sd([x['f'][f] for x in vs]) if f in COUNTS else 1.0
        for r in rows:
            r['df'] = (r['a']['f'][f] - r['b']['f'][f]) / s
        nd = sum(1 for r in rows if r['df'] != 0)
        e = boot_ols(U, lambda r: [1, r['dl'], r['dk'], r['df']], lambda r: r['dz'], 3)
        p = boot_ols(U, lambda r: [1, r['dl'], r['dk'], r['df']], lambda r: r['pA'], 3)
        print(f'| {f}{" (per sd)" if f in COUNTS else ""} | {nd} | {e[0]:+.2f} [{e[1]:+.2f}, {e[2]:+.2f}] | {p[0]:+.2f} [{p[1]:+.2f}, {p[2]:+.2f}] |')


def prefer_basics(vs, title):
    P = data.pairs_of(vs)
    n = agree = tie = tieB = tieLong = tieLongN = 0
    longer = longerN = 0
    for a, b in P:
        for r in a['prefer']:
            pr = a['prefer'][r]
            sa, sb = a['raw'][r], b['raw'][r]
            n += 1
            if sa != sb:
                agree += (pr == 'A') == (sa > sb)
            else:
                tie += 1
                tieB += pr == 'B'
                if a['nlines'] != b['nlines']:
                    tieLongN += 1
                    tieLong += (pr == 'A') == (a['nlines'] > b['nlines'])
            if abs(a['nlines'] - b['nlines']) >= 5:
                longerN += 1
                longer += (pr == 'A') == (a['nlines'] > b['nlines'])
    print(f'\n## Rather read on: basics, {title} ({len(P)} pairs, {n} reader-choices)')
    print(f'choice agrees with the higher score in {agree}/{n - tie} untied ({100*agree/(n-tie):.0f}%); scores tied in {tie} ({100*tie/n:.0f}%): '
          f'B chosen {tieB}/{tie} ({100*tieB/tie:.0f}%), the longer chosen {tieLong}/{tieLongN}; '
          f'longer chosen when 5+ lines apart {longer}/{longerN} ({100*longer/longerN:.0f}%)')


def joint(vs, title):
    """All candidate features at once, with lines and kinds: R2 gained over lines+kinds."""
    cand = [c for c, _ in features.CANDIDATES]
    sds = {f: sd([x['f'][f] for x in vs]) for f in cand}
    X = [[1, x['cl'], x['ck']] + [x['f'][f] / sds[f] for f in cand] for x in vs]
    y = [x['zadj'] for x in vs]
    b = ols(X, y)
    ybar = st.mean(y)
    tot = sum((v - ybar) ** 2 for v in y)
    r2 = 1 - sum((v - sum(bi * xi for bi, xi in zip(b, r))) ** 2 for r, v in zip(X, y)) / tot
    b0 = ols([r[:3] for r in X], y)
    r20 = 1 - sum((v - sum(bi * xi for bi, xi in zip(b0, r[:3]))) ** 2 for r, v in zip(X, y)) / tot
    print(f'\n## Joint model, {title}: lines+kinds R2 {r20:.3f}; with all {len(cand)} candidates R2 {r2:.3f} '
          f'(adjusted for {len(cand)} extra terms on n={len(y)}: {1-(1-r2)*(len(y)-1)/(len(y)-len(X[0])):.3f} vs {1-(1-r20)*(len(y)-1)/(len(y)-3):.3f})')
    print('joint coefficients (z per sd of feature): ' + ', '.join(f'{f} {bi*sds[f]/sds[f]:+.2f}' for f, bi in zip(cand, b[3:])))


if __name__ == '__main__':
    K = ['37', '39b', '39r', '40b', '40r', '41b', '41r', 'M38null']
    A = data.POOL
    vk = prep(K, True)
    va = prep(A, False)
    print('# Intrigue: story features against readers\' scores')
    print('Readings with the key\'s kinds:', ', '.join(K), '| all readings (kinds by proxy):', ', '.join(A))
    across(vk, 'rounds 37-41 and M38 null, key kinds')
    across(va, 'all 14 readings, proxy kinds')
    within(vk, 'rounds 37-41 and M38 null, key kinds')
    within(va, 'all 14 readings, proxy kinds')
    prefer_basics(va, 'all 14 readings')
    joint(vk, 'key kinds')
    joint(va, 'proxy kinds')
    # replication: round 40's busiest pack re-read under the M38 brief, and by Opus; the same pages
    vr = prep(['M38r40', 'M38r40opus', '40b'], True)
    across([x for x in vr if x['reading'] == 'M38r40'], 'replication: 40 busiest re-read in M38 (Fable, every-fault brief)')


def raw_high_low():
    """Rounds 29-41 (old brief, one scale): versions whose mean raw score over readers is 4+ against 2 or less."""
    vs = prep([l for l in data.POOL if l != 'M38null'], False)
    hi = [x for x in vs if x['rawmean'] >= 4]
    lo = [x for x in vs if x['rawmean'] <= 2]
    print(f'\n## Raw high (mean 4+, {len(hi)} versions) against raw low (mean 2 or less, {len(lo)}), rounds 29-41')
    print(f'lines {st.mean(x["nlines"] for x in hi):.0f} vs {st.mean(x["nlines"] for x in lo):.0f}; kinds (proxy) '
          f'{st.mean(x["K"] for x in hi):.0f} vs {st.mean(x["K"] for x in lo):.0f}; on B {sum(x["isB"] for x in hi)}/{len(hi)} vs {sum(x["isB"] for x in lo)}/{len(lo)}')
    print('| feature | high | low |')
    print('| --- | --- | --- |')
    for f in FEATS:
        fmt = (lambda v: f'{v:.2f}') if f in COUNTS else (lambda v: f'{100*v:.0f}%')
        print(f'| {f} | {fmt(st.mean(x["f"][f] for x in hi))} | {fmt(st.mean(x["f"][f] for x in lo))} |')


def turn_breakdown():
    """Which turn carries turn_any: each kind of turn separately, across lives and within pairs, + lines + kinds."""
    import re
    vk = prep(['37', '39b', '39r', '40b', '40r', '41b', '41r', 'M38null'], True)
    va = prep(data.POOL, False)
    for vs, title in ((vk, 'key kinds, 192 pairs'), (va, 'proxy kinds, 276 pairs')):
        print(f'\n## Turns by kind ({title})')
        print('| turn | share of versions | across lives +lines+kinds [95%] | pairs differing | within pairs [95%] | prefer [95%] |')
        print('| --- | --- | --- | --- | --- | --- |')
        for k, rx in features.TURNS.items():
            for x in vs:
                al = features.aliases(x)
                x['f']['t_' + k] = int(any(rx.search(l['text']) and not features.NOT_TURN.search(l['text']) and features.has_prot(l['text'], al) for l in x['lines']))
            U = list({(x['reading'], x['pair']): None for x in vs})
            units = {}
            for x in vs:
                units.setdefault((x['reading'], x['pair']), []).append(x)
            a = boot_ols(list(units.values()), lambda r: [1, r['f']['t_' + k], r['cl'], r['ck']], lambda r: r['zadj'], 1)
            rows = [{'dz': p['zmean'] - q['zmean'], 'dl': (p['nlines'] - q['nlines']) / 10, 'dk': (p['K'] - q['K']) / 10, 'pA': p['preferred'],
                     'df': p['f']['t_' + k] - q['f']['t_' + k]} for p, q in data.pairs_of(vs)]
            e = boot_ols([[r] for r in rows], lambda r: [1, r['dl'], r['dk'], r['df']], lambda r: r['dz'], 3)
            pp = boot_ols([[r] for r in rows], lambda r: [1, r['dl'], r['dk'], r['df']], lambda r: r['pA'], 3)
            print(f'| {k} | {100*st.mean(x["f"]["t_"+k] for x in vs):.0f}% | {a[0]:+.2f} [{a[1]:+.2f}, {a[2]:+.2f}] | '
                  f'{sum(r["df"] != 0 for r in rows)} | {e[0]:+.2f} [{e[1]:+.2f}, {e[2]:+.2f}] | {pp[0]:+.2f} [{pp[1]:+.2f}, {pp[2]:+.2f}] |')


if __name__ == '__main__' and 'extra' in sys.argv:
    raw_high_low()
    turn_breakdown()


def robust_long_pages():
    """Across lives again, leaving out pages under 20 lines (13 of 552; the random packs' near-empty lives)."""
    for labels, tk, title in ((['37', '39b', '39r', '40b', '40r', '41b', '41r', 'M38null'], True, 'key kinds'), (data.POOL, False, 'proxy kinds')):
        vs = [x for x in prep(labels, tk) if x['nlines'] >= 20]
        units = {}
        for x in vs:
            units.setdefault((x['reading'], x['pair']), []).append(x)
        print(f'\n## Robustness: across lives, pages of 20+ lines only ({title}, {len(vs)} versions)')
        for f in ['cast_any', 'cast2', 'conflict_any', 'turn_any', 'want_setback', 'death_any', 'secret_any', 'open_end']:
            a = boot_ols(list(units.values()), lambda r: [1, r['f'][f], r['cl'], r['ck']], lambda r: r['zadj'], 1)
            print(f'{f}: {100*st.mean(x["f"][f] for x in vs):.0f}% of versions; +lines+kinds {a[0]:+.2f} [{a[1]:+.2f}, {a[2]:+.2f}]')


if __name__ == '__main__' and 'robust' in sys.argv:
    robust_long_pages()


def within_with_arm():
    """Within pairs again, with the arm as a term (+1 when A is the on arm, -1 when B is), so a round's own effect is not taken for a feature's."""
    for labels, tk, title in ((['37', '39b', '39r', '40b', '40r', '41b', '41r', 'M38null'], True, 'key kinds'), (data.POOL, False, 'proxy kinds')):
        vs = prep(labels, tk)
        P = data.pairs_of(vs)
        print(f'\n## Within pairs with the arm as a term ({title}, {len(P)} pairs)')
        for f in ['turn_any', 'want_setback', 'death_any', 'cast2', 'cast3', 'conflict_n', 'secret_any', 'repeat_share']:
            s = sd([x['f'][f] for x in vs]) if f in COUNTS else 1.0
            rows = [{'dz': a['zmean'] - b['zmean'], 'dl': (a['nlines'] - b['nlines']) / 10, 'dk': (a['K'] - b['K']) / 10, 'pA': a['preferred'],
                     'arm': 1 if a['arm'] == 'on' else -1, 'df': (a['f'][f] - b['f'][f]) / s} for a, b in P]
            e = boot_ols([[r] for r in rows], lambda r: [1, r['dl'], r['dk'], r['arm'], r['df']], lambda r: r['dz'], 4)
            p = boot_ols([[r] for r in rows], lambda r: [1, r['dl'], r['dk'], r['arm'], r['df']], lambda r: r['pA'], 4)
            print(f'{f}{" (per sd)" if f in COUNTS else ""}: score {e[0]:+.2f} [{e[1]:+.2f}, {e[2]:+.2f}]; prefer {p[0]:+.2f} [{p[1]:+.2f}, {p[2]:+.2f}]')


if __name__ == '__main__' and 'arm' in sys.argv:
    within_with_arm()


def matched_pairs():
    """Pairs whose two versions are close in size (lines within 8, kinds within 5) but one clearly read better (lean-adjusted
    difference of 0.5 z or more): what the winner has that the loser lacks."""
    vs = prep(data.POOL, False)
    for x in vs:
        if x['kinds']:
            x['K'] = x['kinds']
    out = []
    for a, b in data.pairs_of(vs):
        if abs(a['nlines'] - b['nlines']) <= 8 and abs(a['K'] - b['K']) <= 5:
            d = a['zadj'] - b['zadj']
            if abs(d) >= 0.5:
                out.append((a, b) if d > 0 else (b, a))
    print(f'\n## Matched pairs: close in lines (8) and kinds (5), one read clearly better (0.5 z or more): {len(out)} pairs')
    print('| feature | winner has, loser not | loser has, winner not | net |')
    print('| --- | --- | --- | --- |')
    for f in ['turn_any', 'want_setback', 'want_long', 'want_lost', 'feud', 'feud3', 'cast_core', 'cast2', 'reversal_any', 'open_end', 'secret_any',
              'secret_arc', 'death_any', 'death_aftermath', 'cost_any']:
        w = sum(1 for a, b in out if a['f'][f] and not b['f'][f])
        l = sum(1 for a, b in out if b['f'][f] and not a['f'][f])
        print(f'| {f} | {w} | {l} | {w - l:+d} |')
    for f in ['conflict_n', 'cast3', 'callback_n', 'secret_n', 'letdown_n', 'repeat_share', 'turn_kinds']:
        dd = [a['f'][f] - b['f'][f] for a, b in out]
        print(f'| {f} (mean winner minus loser) | | | {st.mean(dd):+.2f} (winner higher in {sum(d > 0 for d in dd)}, lower in {sum(d < 0 for d in dd)}) |')


if __name__ == '__main__' and 'matched' in sys.argv:
    matched_pairs()
