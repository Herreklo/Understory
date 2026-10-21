#!/usr/bin/env python3
"""M38: do the reader roles still differ late in a sitting? (Overstory's note on #60: personas drift back to the model's own voice.)

  python3 reports/M38-roles.py ANSWERS...

ANSWERS are combined answer files keyed <role>-<part> ("novelist-1"), each part twelve pairs read in order at one sitting. Each part is
cut into its first six pairs and its last six. For each half, between every two roles who read the same part:
- kinds: how far apart their faults' kinds are (total variation distance between the two roles' shares of each kind, 0 to 1);
- prefer: how often they chose the same version;
- score: the mean absolute difference of their scores for the same version.
Pooled over all files given, first half against second. Roles that fade grow alike late: kinds and score fall, prefer rises.
"""
import json, sys
from collections import Counter
from itertools import combinations


def halves(pairs):
    ps = sorted(pairs)
    return ps[:len(ps) // 2], ps[len(ps) // 2:]


def tv(a, b):
    na, nb = sum(a.values()), sum(b.values())
    if not na or not nb:
        return None
    return sum(abs(a[k] / na - b[k] / nb) for k in set(a) | set(b)) / 2


def main(paths):
    acc = {h: {'kinds': [], 'prefer': [0, 0], 'score': []} for h in (0, 1)}
    for path in paths:
        d = json.load(open(path))
        parts = {}
        for k, v in d.items():
            role, part = k.rsplit('-', 1)
            parts.setdefault(part, {})[role] = v['pairs']
        for part, roles in parts.items():
            for r1, r2 in combinations(sorted(roles), 2):
                for h, ps in enumerate(halves(roles[r1])):
                    ps = [p for p in ps if p in roles[r2]]
                    kinds = [Counter(f['kind'] for p in ps for v in 'AB' for f in roles[r][p][v].get('faults', [])) for r in (r1, r2)]
                    t = tv(*kinds)
                    if t is not None:
                        acc[h]['kinds'].append(t)
                    for p in ps:
                        a, b = roles[r1][p], roles[r2][p]
                        acc[h]['prefer'][0] += a.get('prefer') == b.get('prefer')
                        acc[h]['prefer'][1] += 1
                        acc[h]['score'] += [abs(a[v]['score'] - b[v]['score']) for v in 'AB']
    print('half    kinds apart  same choice  score apart')
    out = {}
    for h, name in ((0, 'first'), (1, 'second')):
        x = acc[h]
        k = sum(x['kinds']) / len(x['kinds']) if x['kinds'] else float('nan')
        pr = x['prefer'][0] / x['prefer'][1]
        sc = sum(x['score']) / len(x['score'])
        out[name] = {'kinds': k, 'prefer': pr, 'score': sc, 'n': x['prefer'][1]}
        print(f'{name:7} {k:11.3f}  {pr:11.2f}  {sc:11.2f}   ({x["prefer"][1]} pair choices compared)')
    print(json.dumps(out))


if __name__ == '__main__':
    main(sys.argv[1:])
