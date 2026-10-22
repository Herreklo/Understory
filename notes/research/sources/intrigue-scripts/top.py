"""Reliability of a version's score, and the lives readers scored highest.

  python3 notes/research/sources/intrigue-scripts/top.py > notes/research/sources/intrigue-scripts/top-out.txt
"""
import sys, os, statistics as st, itertools
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import data, features  # noqa: E402


def corr(a, b):
    ma, mb = st.mean(a), st.mean(b)
    return sum((p - ma) * (q - mb) for p, q in zip(a, b)) / (sum((p - ma) ** 2 for p in a) * sum((q - mb) ** 2 for q in b)) ** .5


vs = data.load()
by = {(x['reading'], x['pair'], x['ver']): x for x in vs}
print('# Reliability of a version\'s score')
for a, b in (('40b', 'M38r40'), ('40b', 'M38r40opus'), ('M38r40', 'M38r40opus')):
    ks = [(p, v) for (r, p, v) in by if r == a]
    print(f'{a} vs {b}, same 48 pages: r(zadj) = {corr([by[(a, p, v)]["zadj"] for p, v in ks], [by[(b, p, v)]["zadj"] for p, v in ks]):.2f}; '
          f'r(within-pair difference) = {corr([by[(a, p, "A")]["zmean"] - by[(a, p, "B")]["zmean"] for p, _ in ks[::2]], [by[(b, p, "A")]["zmean"] - by[(b, p, "B")]["zmean"] for p, _ in ks[::2]]):.2f}')
rs = []
for lab in data.POOL:
    xs = [x for x in vs if x['reading'] == lab]
    readers = sorted(xs[0]['z'])
    for r1, r2 in itertools.combinations(readers, 2):
        rs.append(corr([x['z'][r1] for x in xs], [x['z'][r2] for x in xs]))
print(f'between two readers of the same reading, r(z) mean {st.mean(rs):.2f} (range {min(rs):.2f} to {max(rs):.2f}, {len(rs)} reader pairs over {len(data.POOL)} readings)')

pool = [x for x in vs if x['reading'] in data.POOL]
pool.sort(key=lambda x: -x['zadj'])
print('\n# Highest-scored versions (order lean taken out; z within reader and reading)')
print('| reading | pair | ver | arm | name | raw scores | zadj | lines | kinds |')
print('| --- | --- | --- | --- | --- | --- | --- | --- | --- |')
for x in pool[:15]:
    print(f"| {x['reading']} | {x['pair']} | {x['ver']} | {x['arm']} | {x['name']} | {','.join(str(x['raw'][r]) for r in sorted(x['raw']))} | {x['zadj']:+.2f} | {x['nlines']} | {x['kinds'] or features.features(x)['kinds_proxy']} |")
print('\nVersions every reader scored 4 or more (rounds 29-41):')
for x in pool:
    if x['era'] == 'old' and min(x['raw'].values()) >= 4:
        print(f"  {x['reading']} {x['pair']}{x['ver']} {x['name']} {sorted(x['raw'].values())} zadj {x['zadj']:+.2f} lines {x['nlines']}")
print('\nAny 5s:')
for x in vs:
    for r, s in x['raw'].items():
        if s == 5:
            print(f"  {x['reading']} {x['pair']}{x['ver']} {x['name']} by {r}; all: {x['raw']}")
print('\n# Lowest-scored versions')
for x in pool[-8:]:
    print(f"  {x['reading']} {x['pair']}{x['ver']} {x['name']} raw {x['raw']} zadj {x['zadj']:+.2f} lines {x['nlines']}")
