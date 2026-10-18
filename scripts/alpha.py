#!/usr/bin/env python3
"""Krippendorff's alpha for a panel of blind readers (ordinal and interval metrics), with a bootstrap interval over units.

Usage: python3 scripts/alpha.py scores.json
scores.json: {"readers": {"name": {"1": 3, "2": 2, ...}, ...}}   (unit id -> score; a reader may skip a unit)
Follows Krippendorff (2011), 'Computing Krippendorff's alpha-reliability'; the bootstrap resamples units (Hayes and Krippendorff 2007).
"""
import json, random, sys
from collections import defaultdict


def alpha(units, metric='ordinal'):
    # units: list of lists of values (each list = the scores one unit received; units with fewer than two are dropped)
    units = [u for u in units if len(u) >= 2]
    vals = sorted({v for u in units for v in u})
    o = defaultdict(float)  # coincidence matrix
    for u in units:
        m = len(u)
        for i, a in enumerate(u):
            for j, b in enumerate(u):
                if i != j:
                    o[(a, b)] += 1 / (m - 1)
    n_c = {c: sum(o[(c, k)] for k in vals) for c in vals}
    n = sum(n_c.values())
    if n <= 1:
        return float('nan')

    def d2(c, k):
        if metric == 'interval':
            return (c - k) ** 2
        lo, hi = min(c, k), max(c, k)  # ordinal
        s = sum(n_c[g] for g in vals if lo <= g <= hi) - (n_c[c] + n_c[k]) / 2
        return s ** 2

    Do = sum(o[(c, k)] * d2(c, k) for c in vals for k in vals)
    De = sum(n_c[c] * n_c[k] * d2(c, k) for c in vals for k in vals) / (n - 1)
    return 1 - Do / De if De else float('nan')


def main():
    data = json.load(open(sys.argv[1]))
    readers = data['readers']
    ids = sorted({u for r in readers.values() for u in r}, key=lambda x: int(x))
    units = [[readers[r][u] for r in readers if u in readers[r]] for u in ids]
    rng = random.Random(1)
    for metric in ['ordinal', 'interval']:
        a = alpha(units, metric)
        boot = sorted(alpha([units[rng.randrange(len(units))] for _ in units], metric) for _ in range(2000))
        print(f'{metric:8s} alpha {a:.3f}  95% [{boot[50]:.3f}, {boot[1949]:.3f}]  ({len(readers)} readers, {len(units)} lives)')
    for r, s in readers.items():
        v = list(s.values())
        print(f'  {r:12s} mean {sum(v) / len(v):.2f}')


if __name__ == '__main__':
    main()
