#!/usr/bin/env python3
"""Scores a blind paired reading (src/tools/diag/pairarm.ts) against its key.

Usage:
  python3 scripts/pairscore.py KEY ANSWERS... [--pack PACK...] [--quote REGEX] [--json OUT] [--pool KEY2 ANSWERS2...]...

KEY      key.json from pairarm.ts: {"P01": {"onIs": "A" | "B", ...}, ...}
ANSWERS  one or more reader files in the brief's shape, {"reader": name, "pairs": {"P01": {"A": {...}, "B": {...}, "prefer": "A"}}},
         or one combined file {name: {...reader file...}}. A reader's parts (pairs-1.txt, pairs-2.txt read at different sittings) are
         separate files with the same "reader": their pairs are joined.
--pack   the pages the readers read (pairs.txt, or its parts), for how much happened in each version. Without it, pairs.txt beside
         the key is used when it is there. A key from pairarm.ts after round M36 carries each version's lines and kinds of line itself.
--quote  a regular expression for the round's own wording: its quotes in faults and good reasons are listed, by arm.
--pool   another pack of the same round, its key and its answers (repeat for a third). The first pack is reported in full as above;
         then every pack's effect, and the effect over all of them with the order and the pack as terms.

What it reports, and why:
- Majority preference: in how many pairs most readers preferred the on arm. Easy to read, coarse.
- The paired score difference, on minus off, per pair averaged over readers, with a 95% interval (t over pairs). Readers score the
  version they read second higher (about half a point in rounds 29, 31 and 32), so the difference is also estimated with the order as
  a second term (difference = effect + lean × (+1 if on was B, −1 if A)). With the order dealt half and half the two agree on the
  point; the adjusted interval is narrower, because the lean is taken out of the noise. The adjusted effect and its interval are
  what a round's keep rule should be judged on: "reads no worse" holds when its one-sided 95% lower bound (t at 0.95, n − 2 degrees
  of freedom) is above −0.3. The one-sided 90% bound is reported beside it, as before.
- Pooled packs (--pool): a people round reads two packs, one of random lives and one of the busiest, 48 pairs. Each pack's effect is
  reported with the order as a term, and the effect over all of them is estimated with the order and the pack as terms (difference =
  effect + lean × order + the pack's deviation, the deviations summing to zero, so every pack weighs alike whatever its size), with its
  interval and both one-sided bounds on n − 1 − (number of packs) degrees of freedom. The warnings are given for each pack.
- Krippendorff's alpha (scripts/alpha.py): how far the readers agree on the scores. It describes the panel, not the effect: a
  change can read better to every reader while they disagree on the scale. Reported, not a gate.
- Faults by kind in each arm, and the quotes matching --quote. Readers list every fault they find (M38), so faults are also reported
  per ten lines in each arm, and paired: the on version's faults minus the off version's, with the order and the difference in lines as
  terms (a rate on a page of two lines would swamp the pairs). Also: how many versions got exactly three faults, which is where an older
  brief that asked for "up to three" capped the count; and, when answers carry them, each fault's severity (false or awkward) and, for
  unfit reasons, whether the event shown under the reason supports it.
- How much happened: the lines of each version (not counting the cited events shown under a line). Readers choose the version where
  more happens (70% of their choices over rounds 29-34, +0.16 a pair for every ten lines more; round 35), and the two arms of an engine
  change are different worlds, so the people read differ by 16-28 lines (sd) between arms. Reported: the lines in each arm, how often
  the longer version was chosen, and the effect with the difference in lines as a third term. A round is judged on the effect with the
  order as a term, since a change that makes more happen is meant to read better for it; the third term says how much of it is that.
- Warnings, printed first: a cap (more than half the versions given the most faults any version got), a ceiling or a floor (more than
  half the scores at 5, or at 1) and ties (more than half the pairs scored the same in both versions by a reader). Each means the reading
  cannot show what it was meant to (M38: the old brief's cap of three faults was full in 94-100% of versions for twelve rounds).
- Faults cited by line (M38): the pack numbers each line, and a fault gives its `line` instead of a quote; the scorer finds its text in
  the pack, and counts citations of a line the version does not have. A key may mark a planted fault ({"planted": {"arm": "off",
  "line": 12}}): the scorer reports how many readers cited that line.
- Kinds of line (the event types on a page), when the key carries them: readers score how many kinds of thing happen in a life, not
  its length (+0.05 a kind across lives and within pairs over rounds 29-34; round 36). Reported: kinds in each arm, and the effect with
  the order and the difference in kinds as terms.
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
# One-sided 95%, the bound "reads no worse" is judged on (N1a), exact to three places up to 50, where pooled packs fall.
T95 = {1: 6.314, 2: 2.920, 3: 2.353, 4: 2.132, 5: 2.015, 6: 1.943, 7: 1.895, 8: 1.860, 9: 1.833, 10: 1.812, 11: 1.796, 12: 1.782,
       13: 1.771, 14: 1.761, 15: 1.753, 16: 1.746, 17: 1.740, 18: 1.734, 19: 1.729, 20: 1.725, 21: 1.721, 22: 1.717, 23: 1.714,
       24: 1.711, 25: 1.708, 26: 1.706, 27: 1.703, 28: 1.701, 29: 1.699, 30: 1.697, 31: 1.696, 32: 1.694, 33: 1.692, 34: 1.691,
       35: 1.690, 36: 1.688, 37: 1.687, 38: 1.686, 39: 1.685, 40: 1.684, 41: 1.683, 42: 1.682, 43: 1.681, 44: 1.680, 45: 1.679,
       46: 1.679, 47: 1.678, 48: 1.677, 50: 1.676, 60: 1.671, 70: 1.667, 94: 1.661, 120: 1.658}
NO_WORSE = -0.3  # the bar for "reads no worse" (notes/build-plan.md, section 3)


def t(table, df):
    if df in table:
        return table[df]
    ks = sorted(table)
    for k in ks:
        if k >= df:
            return table[k]
    return 1.960 if table is T975 else 1.645 if table is T95 else 1.282


def order_term(d_pair, side):
    """The effect with the order as a second term: d = e + b*s, by least squares; the interval for e from the residuals."""
    n = len(d_pair)
    ms, md = st.mean(side), st.mean(d_pair)
    sxx = sum((s - ms) ** 2 for s in side)
    if not (sxx > 0 and n > 2):
        return None
    b = sum((s - ms) * (d - md) for s, d in zip(side, d_pair)) / sxx
    e = md - b * ms
    res = [d - e - b * s for s, d in zip(side, d_pair)]
    rsd = math.sqrt(sum(x * x for x in res) / (n - 2))
    se_e = rsd * math.sqrt(1 / n + ms * ms / sxx)
    return {'effect': e, 'lean': b, 'hw95': t(T975, n - 2) * se_e, 'lo90': e - t(T90, n - 2) * se_e, 'se': se_e,
            'lo95': e - t(T95, n - 2) * se_e}


def pair_diffs(key, readers, names):
    """Each pair's on minus off, averaged over the readers, and the order (+1 if the on arm was B, −1 if A), in the key's order."""
    d_pair, side = [], []
    for p in sorted(key):
        on = key[p]['onIs']
        off = 'B' if on == 'A' else 'A'
        d_pair.append(st.mean(readers[r][p][on]['score'] - readers[r][p][off]['score'] for r in names))
        side.append(1 if on == 'B' else -1)
    return d_pair, side


def pooled(packs):
    """Packs pooled with the pack as a term: [(label, d_pair, side)] → each pack's effect, and the effect over all of them."""
    k = len(packs)
    X, y, each = [], [], []
    for j, (label, d, s) in enumerate(packs):
        each.append({'pack': label, 'pairs': len(d), **(order_term(d, s) or {})})
        for dd, ss in zip(d, s):
            # Deviation coding: pack j > 0 has its own column, and the first pack is −1 in all of them, so the effect is the
            # average over packs.
            X.append([1.0, ss] + [1.0 if j == c else -1.0 if j == 0 else 0.0 for c in range(1, k)])
            y.append(dd)
    fit = ols(X, y)
    if not fit:
        return {'packs': each}
    b, se, _ = fit
    df = len(y) - len(X[0])
    return {'packs': each, 'pairs': len(y), 'df': df, 'effect': b[0], 'lean': b[1], 'se': se[0], 'hw95': t(T975, df) * se[0],
            'lo90': b[0] - t(T90, df) * se[0], 'lo95': b[0] - t(T95, df) * se[0],
            'packTerms': [{'pack': packs[c][0], 'deviation': b[1 + c], 'hw95': t(T975, df) * se[1 + c]} for c in range(1, k)]}


def pack_lines(paths):
    """Lines of each version in the pack: {(pair, 'A'|'B'): n}, not counting the cited events shown under a line."""
    return {k: len(v) for k, v in pack_text(paths).items()}


def pack_text(paths):
    """The text of each version's lines, by number: {(pair, 'A'|'B'): {1: '2026: ...', ...}}, with the events shown under a line (↳)
    joined to it. A pack from before M38 has no numbers: its lines are numbered here in order."""
    out, cur = {}, None
    for p in paths:
        for line in open(p, encoding='utf8'):
            line = line.rstrip('\n')
            m = re.match(r'##### (P\d+), version ([AB])', line)
            if m:
                cur = (m[1], m[2])
                out[cur] = {}
            elif cur and line.strip():
                if line.lstrip().startswith('↳'):
                    if out[cur]:
                        last = max(out[cur])
                        out[cur][last] += '\n' + line.strip()
                    continue
                num = re.match(r'\s*(\d+)  (\d{4}: .*)', line)
                n = len(out[cur]) + 1
                out[cur][int(num[1]) if num else n] = num[2] if num else line
    return out


def warnings(readers, names, pairs):
    """What would stop the reading showing what it was meant to: a cap, a ceiling or floor, ties. Each above half."""
    counts = [len(readers[r][p][v].get('faults', [])) for r in names for p in pairs for v in 'AB']
    scores = [readers[r][p][v]['score'] for r in names for p in pairs for v in 'AB']
    ties = sum(readers[r][p]['A']['score'] == readers[r][p]['B']['score'] for r in names for p in pairs)
    out, top = [], max(counts) if counts else 0
    at_top = sum(c == top for c in counts)
    if top and at_top * 2 > len(counts):
        out.append(f'cap: {at_top} of {len(counts)} versions got {top} faults, the most any version got; the fault count is capped')
    for lim in (5, 1):
        k = sum(x == lim for x in scores)
        if k * 2 > len(scores):
            out.append(f"{'ceiling' if lim == 5 else 'floor'}: {k} of {len(scores)} scores are {lim}")
    if ties * 2 > len(names) * len(pairs):
        out.append(f'ties: {ties} of {len(names) * len(pairs)} pairs scored the same in both versions by a reader')
    return out


def ols(X, y):
    """Least squares with its standard errors, by the normal equations (no libraries): returns (b, se, residual sd)."""
    k = len(X[0])
    A = [[sum(r[i] * r[j] for r in X) for j in range(k)] for i in range(k)]
    inv = [[float(i == j) for j in range(k)] for i in range(k)]
    for c in range(k):
        piv = max(range(c, k), key=lambda r: abs(A[r][c]))
        A[c], A[piv], inv[c], inv[piv] = A[piv], A[c], inv[piv], inv[c]
        d = A[c][c]
        if abs(d) < 1e-12:
            return None
        A[c] = [v / d for v in A[c]]
        inv[c] = [v / d for v in inv[c]]
        for r in range(k):
            if r != c and A[r][c]:
                f = A[r][c]
                A[r] = [a - f * b for a, b in zip(A[r], A[c])]
                inv[r] = [a - f * b for a, b in zip(inv[r], inv[c])]
    xty = [sum(r[i] * v for r, v in zip(X, y)) for i in range(k)]
    b = [sum(inv[i][j] * xty[j] for j in range(k)) for i in range(k)]
    res = [v - sum(bi * xi for bi, xi in zip(b, r)) for r, v in zip(X, y)]
    dof = len(y) - k
    if dof <= 0:
        return None
    s = math.sqrt(sum(e * e for e in res) / dof)
    return b, [s * math.sqrt(inv[i][i]) for i in range(k)], s


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
    ap.add_argument('--pack', nargs='+')
    ap.add_argument('--quote')
    ap.add_argument('--json')
    ap.add_argument('--pool', nargs='+', action='append', default=[])
    a = ap.parse_args()
    key = json.load(open(a.key))
    readers = load(a.answers)
    names = sorted(readers)
    pairs = sorted(key)
    missing = [(r, p) for r in names for p in pairs if p not in readers[r]]
    if missing:
        sys.exit(f'pairscore: answers missing for {missing[:5]}')

    warn = warnings(readers, names, pairs)
    print('WARNINGS: ' + ('; '.join(warn) + '. The reading cannot show what it was meant to.' if warn else 'none (no cap, ceiling, floor or ties above half).'))
    packs = a.pack
    if not packs:
        beside = os.path.join(os.path.dirname(os.path.abspath(a.key)), 'pairs.txt')
        packs = [beside] if os.path.exists(beside) else []
    text = pack_text(packs) if packs else {}
    if not text and any('line' in f for r in names for p in pairs for v in 'AB' for f in readers[r][p][v].get('faults', [])):
        sys.exit('pairscore: the faults cite lines, and no pack was given to find them in (--pack)')

    def quote(p, v, f):
        if 'line' not in f:
            return f.get('quote', '')
        return text.get((p, v), {}).get(f['line'], '')

    bad_lines, cited_lines = 0, 0
    planted = {'pairs': 0, 'found': 0, 'asUnfit': 0, 'of': 0, 'inTrue': 0, 'near': 0, 'nearInTrue': 0}
    print('pair  on   ' + '  '.join(f'{r:>14}' for r in names) + '   majority-on')
    maj, d_pair, side, scores, bchoice = 0, [], [], {r: {} for r in names}, 0
    per_reader = {r: [] for r in names}
    faults = {'on': Counter(), 'off': Counter()}
    severity = {'on': Counter(), 'off': Counter()}
    fcount, capped, versions = {}, 0, 0
    quotes = {'good': [], 'fault': [], 'good_off': [], 'fault_off': []}
    rq = re.compile(a.quote) if a.quote else None
    arms, prefs = [], []
    for i, p in enumerate(pairs):
        on = key[p]['onIs']
        off = 'B' if on == 'A' else 'A'
        arms.append((p, on, off))
        cells, votes, ds = [], 0, []
        for r in names:
            x = readers[r][p]
            prefs.append((p, x.get('prefer')))
            cells.append(f"{x['A']['score']},{x['B']['score']},{x.get('prefer', '-')}")
            votes += x.get('prefer') == on
            bchoice += x.get('prefer') == 'B'
            dd = x[on]['score'] - x[off]['score']
            ds.append(dd)
            per_reader[r].append(dd)
            scores[r][str(2 * i + 1)] = x['A']['score']
            scores[r][str(2 * i + 2)] = x['B']['score']
            for arm, lab in ((on, 'on'), (off, 'off')):
                fs = x[arm].get('faults', [])
                fcount[(p, r, lab)] = len(fs)
                capped += len(fs) == 3
                versions += 1
                for f in fs:
                    if 'line' in f:
                        cited_lines += 1
                        bad_lines += (p, arm) in text and f['line'] not in text[(p, arm)]
                    faults[lab][f['kind']] += 1
                    if 'severity' in f:
                        severity[lab][f['severity']] += 1
                    if f.get('source'):
                        severity[lab]['source ' + f['source']] += 1
                    if rq and rq.search(quote(p, arm, f)):
                        quotes['fault' if lab == 'on' else 'fault_off'].append(f"{p} {r} ({f['kind']}): {quote(p, arm, f)}")
                for g in x[arm].get('good', []):
                    g = text.get((p, arm), {}).get(g, '') if isinstance(g, int) else g
                    if rq and rq.search(g):
                        quotes['good' if lab == 'on' else 'good_off'].append(f'{p} {r}: {g}')
        pl = key[p].get('planted')
        if pl:
            # The control is the same line number in the other version, where nothing was planted: readers who list every fault on a
            # page of a hundred lines cite any one line now and then.
            arm, other = (on, off) if pl['arm'] == 'on' else (off, on)
            planted['pairs'] += 1
            for r in names:
                cites = lambda v, d: [f for f in readers[r][p][v].get('faults', []) if abs(f.get('line', -9) - pl['line']) <= d]
                hit = cites(arm, 0)
                planted['of'] += 1
                planted['found'] += bool(hit)
                planted['asUnfit'] += any(f['kind'] == 'unfit reason' for f in hit)
                planted['inTrue'] += bool(cites(other, 0))
                planted['near'] += bool(cites(arm, 1))
                planted['nearInTrue'] += bool(cites(other, 1))
        m = votes * 2 > len(names)
        maj += m
        d_pair.append(st.mean(ds))
        side.append(1 if on == 'B' else -1)
        print(f'{p}   {on}   ' + '  '.join(f'{c:>14}' for c in cells) + f"   {'yes' if m else 'no'}")

    n = len(pairs)
    mean = st.mean(d_pair)
    sd = st.stdev(d_pair) if n > 1 else 0
    hw = t(T975, n - 1) * sd / math.sqrt(n)
    adj = order_term(d_pair, side)
    on_b = sum(1 for s in side if s > 0)
    print(f'\nThe on arm was version B in {on_b} of {n} pairs; readers chose B in {bchoice} of {n * len(names)} single choices.')
    print(f'Majority preferred the on arm in {maj} of {n}.')
    print(f'Paired score difference, on minus off: {mean:+.2f} ±{hw:.2f} (95%, {n} pairs, mean over {len(names)} readers)')
    for r in names:
        print(f'  {r:14} {st.mean(per_reader[r]):+.2f}')
    if adj:
        print(f"With the order as a term: effect {adj['effect']:+.2f} ±{adj['hw95']:.2f} (95%); one-sided 90% lower bound {adj['lo90']:+.2f};"
              f" lean toward the second version {adj['lean']:+.2f}")
        print(f"One-sided 95% lower bound {adj['lo95']:+.2f}: reads no worse (above {NO_WORSE:+.1f}) "
              + ('holds.' if adj['lo95'] > NO_WORSE else 'misses.'))
    sp =os.path.join(os.path.dirname(os.path.abspath(__file__)), 'alpha.py')
    tmp = (a.json or '/tmp/pairscore') + '.scores.json'
    json.dump({'readers': scores}, open(tmp, 'w'))
    alpha = subprocess.run([sys.executable, sp, tmp], capture_output=True, text=True).stdout.strip()
    print(alpha)
    # How much happened in each version, and how much of the effect it carries.
    lines = None
    if packs:
        nl = pack_lines(packs)
        if all((p, v) in nl for p in pairs for v in 'AB'):
            dl = [nl[(p, on)] - nl[(p, off)] for p, on, off in arms]
            near = longer = shorter = 0
            for p, pref in prefs:
                if pref not in ('A', 'B'):
                    continue
                d_ab = nl[(p, 'A')] - nl[(p, 'B')]
                if abs(d_ab) < 5:
                    near += 1
                elif (d_ab > 0) == (pref == 'A'):
                    longer += 1
                else:
                    shorter += 1
            on_mean = st.mean(nl[(p, on)] for p, on, _ in arms)
            off_mean = st.mean(nl[(p, off)] for p, _, off in arms)
            fit = ols([[1.0, s, x] for s, x in zip(side, dl)], d_pair) if n > 3 else None
            lines = {'on': on_mean, 'off': off_mean, 'diff': st.mean(dl), 'diffSd': st.stdev(dl) if n > 1 else 0,
                     'longerChosen': longer, 'shorterChosen': shorter, 'near': near}
            print(f'\nHow much happened: {on_mean:.1f} lines a page on, {off_mean:.1f} off; on minus off {st.mean(dl):+.1f} a pair'
                  f" (sd {lines['diffSd']:.1f}). Where the versions are five or more lines apart, the longer was chosen {longer} times and"
                  f' the shorter {shorter} ({near} choices nearer).')
            if fit:
                b, se, _ = fit
                tt = t(T975, n - 3)
                lines.update({'effect': b[0], 'hw95': tt * se[0], 'perTen': 10 * b[2], 'perTenHw95': tt * 10 * se[2]})
                print(f'With the order and the difference in lines as terms: effect {b[0]:+.2f} ±{tt * se[0]:.2f} (95%); ten lines more'
                      f' {10 * b[2]:+.2f} ±{tt * 10 * se[2]:.2f}. Reported beside the effect above, which the round is judged on.')
        else:
            print('\nHow much happened: the pack does not match the key; not reported.')
    if all('kinds' in key[p].get('on', {}) for p in pairs):
        dk = [key[p]['on']['kinds'] - key[p]['off']['kinds'] for p in pairs]
        kon = st.mean(key[p]['on']['kinds'] for p in pairs)
        koff = st.mean(key[p]['off']['kinds'] for p in pairs)
        lines = lines or {}
        lines.update({'kindsOn': kon, 'kindsOff': koff, 'kindsDiff': st.mean(dk), 'kindsDiffSd': st.stdev(dk) if n > 1 else 0})
        print(f"Kinds of line: {kon:.1f} a page on, {koff:.1f} off; on minus off {st.mean(dk):+.1f} a pair (sd {lines['kindsDiffSd']:.1f}).")
        fitk = ols([[1.0, s_, x] for s_, x in zip(side, dk)], d_pair) if n > 3 else None
        if fitk:
            b, se, _ = fitk
            tt = t(T975, n - 3)
            lines.update({'effectKinds': b[0], 'hw95Kinds': tt * se[0], 'perKind': b[2], 'perKindHw95': tt * se[2]})
            print(f'With the order and the difference in kinds as terms: effect {b[0]:+.2f} ±{tt * se[0]:.2f} (95%); a kind more'
                  f' {b[2]:+.3f} ±{tt * se[2]:.3f}.')
    for lab in ('on', 'off'):
        print(f'faults {lab}: total {sum(faults[lab].values())} · ' + ', '.join(f'{k} {v}' for k, v in faults[lab].most_common()))
    # Faults (M38): readers list every fault, so a page with fewer faults can show it. Pooled per ten lines in each arm; paired, the
    # on version's faults minus the off version's, averaged over the readers, with the order and the difference in lines as terms
    # (a rate on a page of two lines would swamp the pairs).
    rate = None
    if all('lines' in key[p].get('on', {}) and 'lines' in key[p].get('off', {}) for p in pairs):
        ln = {(p, lab): key[p][lab]['lines'] for p in pairs for lab in ('on', 'off')}
        dc = [st.mean(fcount[(p, r, 'on')] - fcount[(p, r, 'off')] for r in names) for p in pairs]
        dln = [ln[(p, 'on')] - ln[(p, 'off')] for p in pairs]
        fitf = ols([[1.0, s_, x] for s_, x in zip(side, dln)], dc) if n > 3 else None
        paired = None
        if fitf:
            bf, sef, _ = fitf
            tt = t(T975, n - 3)
            paired = {'effect': bf[0], 'hw95': tt * sef[0], 'lean': bf[1], 'perTenLines': 10 * bf[2], 'perTenLinesHw95': tt * 10 * sef[2]}
        per = {lab: 10 * sum(faults[lab].values()) / (len(names) * sum(ln[(p, lab)] for p in pairs)) for lab in ('on', 'off')}
        kinds = sorted(set(faults['on']) | set(faults['off']))
        perKind = {lab: {k: 10 * faults[lab][k] / (len(names) * sum(ln[(p, lab)] for p in pairs)) for k in kinds} for lab in ('on', 'off')}
        rate = {'on': per['on'], 'off': per['off'], 'paired': paired, 'perKind': perKind, 'capped': capped,
                'versions': versions, 'severity': {k: dict(v) for k, v in severity.items()}}
        print(f"Faults per ten lines: {per['on']:.2f} on, {per['off']:.2f} off. "
              + ', '.join(f"{k} {perKind['on'][k]:.2f}/{perKind['off'][k]:.2f}" for k in kinds))
        if rate['paired']:
            fp = rate['paired']
            print(f"Faults a page, on minus off, with the order and the difference in lines as terms: {fp['effect']:+.2f} ±{fp['hw95']:.2f}"
                  f" (95%); ten lines more {fp['perTenLines']:+.2f} ±{fp['perTenLinesHw95']:.2f}.")
        print(f'Versions given exactly three faults: {capped} of {versions}' + (' (the count may be capped)' if capped > versions / 2 else '') + '.')
        if any(severity[lab] for lab in ('on', 'off')):
            print('Severity, and for unfit reasons whether the event shown under them supports them: ' + '; '.join(f"{lab} " + ', '.join(f'{k} {v}' for k, v in severity[lab].most_common()) for lab in ('on', 'off')))
    if cited_lines:
        print(f'Faults cited by line: {cited_lines}; citing a line the version does not have: {bad_lines}.')
    if planted['pairs']:
        print(f"Planted faults: {planted['pairs']} pairs; the planted line cited by {planted['found']} of {planted['of']} readings"
              f" ({planted['asUnfit']} as an unfit reason), the same line in the true version by {planted['inTrue']}: altered minus true"
              f" {planted['found'] - planted['inTrue']:+d}. Within a line: {planted['near']} against {planted['nearInTrue']}.")
    if rq:
        print(f"\nQuotes matching the round's wording (on arm): good {len(quotes['good'])}, faults {len(quotes['fault'])}"
              f" (unfit reasons {sum('(unfit reason)' in q for q in quotes['fault'])}); off arm: good {len(quotes['good_off'])},"
              f" faults {len(quotes['fault_off'])}")
        for k in ('good', 'fault'):
            for q in quotes[k]:
                print(f'  {k}: {q}')
    pool = None
    if a.pool:
        packs = [(a.key, d_pair, side)]
        print(f'\nPooled: {1 + len(a.pool)} packs, with the order and the pack as terms.')
        for grp in a.pool:
            if len(grp) < 2:
                sys.exit('pairscore: --pool takes a key and its answers')
            k2, r2 = json.load(open(grp[0])), load(grp[1:])
            n2 = sorted(r2)
            miss = [(r, p) for r in n2 for p in sorted(k2) if p not in r2[r]]
            if miss:
                sys.exit(f'pairscore: answers missing for {miss[:5]} in {grp[0]}')
            w2 = warnings(r2, n2, sorted(k2))
            print(f'  WARNINGS for {grp[0]}: ' + ('; '.join(w2) + '.' if w2 else 'none.'))
            packs.append((grp[0], *pair_diffs(k2, r2, n2)))
        pool = pooled(packs)
        for x in pool['packs']:
            print(f"  {x['pack']}: {x['pairs']} pairs, effect {x['effect']:+.2f} ±{x['hw95']:.2f} (95%); one-sided 95% lower bound"
                  f" {x['lo95']:+.2f}" if 'effect' in x else f"  {x['pack']}: {x['pairs']} pairs, too few for an effect")
        if 'effect' in pool:
            print(f"All {pool['pairs']} pairs: effect {pool['effect']:+.2f} ±{pool['hw95']:.2f} (95%); one-sided 90% lower bound"
                  f" {pool['lo90']:+.2f}; one-sided 95% lower bound {pool['lo95']:+.2f}: reads no worse (above {NO_WORSE:+.1f}) "
                  + ('holds' if pool['lo95'] > NO_WORSE else 'misses') + f". Lean toward the second version {pool['lean']:+.2f}.")
            for x in pool['packTerms']:
                print(f"  {x['pack']} against the average of the packs: {x['deviation']:+.2f} ±{x['hw95']:.2f}")
    if a.json:
        json.dump({'pairs': n, 'readers': names, 'majorityOn': maj, 'diff': mean, 'hw95': hw, 'adjusted': adj, 'onB': on_b, 'chooseB': bchoice,
                   'perReader': {r: st.mean(v) for r, v in per_reader.items()}, 'faults': {k: dict(v) for k, v in faults.items()},
                   'quotes': quotes, 'scores': scores, 'lines': lines, 'faultRate': rate,
                   'warnings': warn, 'citedLines': cited_lines, 'badLines': bad_lines, 'planted': planted if planted['pairs'] else None,
                   **({'pooled': pool} if pool else {})}, open(a.json, 'w'), indent=1)


if __name__ == '__main__':
    main()
