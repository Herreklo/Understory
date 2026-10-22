"""Loads every blind reading on file into one table of versions. Read-only.

A version: one page (pair, A|B) of one reading, with its lines (packlib), its key (on/off, lines, kinds when the key has them),
each reader's score, faults and good lines, and each reader's preference for the pair.

Scores are put on one scale by z-scoring within each reader of each reading (a reader's sittings joined), so rounds before M38
(29-41, old brief) and from M38 on (every-fault brief) are compared by position within their own reading, never by raw score.
"""
import json, os, sys, re, statistics as st
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'language-scripts'))
import packlib  # noqa: E402

ROOT = packlib.ROOT
R = os.path.join(ROOT, 'reports')

# (label, key, answers files, pack, era). M38 planted and shuffled are left out: their two versions differ only by a planted fault.
READINGS = [
    ('29', '29-reading-key.json', ['29-reading-novelist.json', '29-reading-player.json', '29-reading-socialworker.json'], '29-reading-pack.txt', 'old'),
    ('30', '30-reading-key.json', ['30-reading-novelist.json', '30-reading-player.json', '30-reading-socialworker.json'], '30-reading-pack.txt', 'old'),
    ('31', '31-reading-key.json', ['31-reading-answers.json'], '31-reading-pack.txt', 'old'),
    ('32', '32-reading-key.json', ['32-reading-answers.json'], '32-reading-pack.txt', 'old'),
    ('33', '33-reading-key.json', ['33-reading-answers.json'], '33-reading-pack.txt', 'old'),
    ('34', '34-reading-key.json', ['34-reading-answers.json'], '34-reading-pack.txt', 'old'),
    ('37', '37-reading-key.json', ['37-reading-answers.json'], '37-reading-pack.txt', 'old'),
    ('39b', '39-reading-busiest-key.json', ['39-reading-busiest-answers.json'], '39-reading-busiest-pack.txt', 'old'),
    ('39r', '39-reading-random-key.json', ['39-reading-random-answers.json'], '39-reading-random-pack.txt', 'old'),
    ('40b', '40-reading-busiest-key.json', ['40-reading-busiest-answers.json'], '40-reading-busiest-pack.txt', 'old'),
    ('40r', '40-reading-random-key.json', ['40-reading-random-answers.json'], '40-reading-random-pack.txt', 'old'),
    ('41b', '41-reading-busiest-key.json', ['41-reading-busiest-answers.json'], '41-reading-busiest-pack.txt', 'old'),
    ('41r', '41-reading-random-key.json', ['41-reading-random-answers.json'], '41-reading-random-pack.txt', 'old'),
    ('M38null', 'M38-reading-null-key.json', ['M38-reading-null-answers.json'], 'M38-reading-null-pack.txt', 'new'),
    # re-reads of round 40's busiest pack under the M38 brief (same pages as 40b): a replication, not pooled with 40b
    ('M38r40', 'M38-reading-r40-key.json', ['M38-reading-r40-answers.json'], 'M38-reading-r40-pack.txt', 'new'),
    ('M38r40opus', 'M38-reading-r40-key.json', ['M38-reading-r40opus-answers.json'], 'M38-reading-r40-pack.txt', 'new'),
]
POOL = [r[0] for r in READINGS if not r[0].startswith('M38r40')]


def load_answers(paths):
    readers = {}
    for p in paths:
        d = json.load(open(os.path.join(R, p)))
        files = [d] if 'pairs' in d else list(d.values())
        for f in files:
            readers.setdefault(f['reader'], {}).update(f['pairs'])
    return readers


def zs(xs):
    m = st.mean(xs)
    s = st.pstdev(xs) or 1.0
    return [(x - m) / s for x in xs]


def load(labels=None):
    """-> list of version dicts."""
    out = []
    for lab, keyf, ans, packf, era in READINGS:
        if labels and lab not in labels:
            continue
        key = json.load(open(os.path.join(R, keyf)))
        readers = load_answers(ans)
        pack = {(v['pair'], v['ver']): v for v in packlib.parse_pack(os.path.join(R, packf))}
        pairs = sorted(key)
        # z within reader
        zmap = {}
        for r, ap in readers.items():
            cells = [(p, v) for p in pairs for v in 'AB']
            raw = [ap[p][v]['score'] for p, v in cells]
            for (p, v), z in zip(cells, zs(raw)):
                zmap[(r, p, v)] = z
        for p in pairs:
            k = key[p]
            for v in 'AB':
                arm = 'on' if k.get('onIs') == v else 'off'
                pv = pack[(p, v)]
                out.append({
                    'reading': lab, 'era': era, 'pair': p, 'ver': v, 'other': 'B' if v == 'A' else 'A',
                    'arm': arm, 'name': pv['name'], 'age': pv['age'], 'seed': k.get('seed'), 'person': k.get('person'),
                    'lines': pv['lines'], 'nlines': len(pv['lines']),
                    'key_lines': k.get(arm, {}).get('lines') if isinstance(k.get(arm), dict) else None,
                    'kinds': k.get(arm, {}).get('kinds') if isinstance(k.get(arm), dict) else None,
                    'raw': {r: readers[r][p][v]['score'] for r in readers},
                    'z': {r: zmap[(r, p, v)] for r in readers},
                    'faults': {r: readers[r][p][v].get('faults', []) for r in readers},
                    'good': {r: readers[r][p][v].get('good', []) for r in readers},
                    'prefer': {r: readers[r][p].get('prefer') for r in readers},
                })
    for x in out:
        x['zmean'] = st.mean(x['z'].values())
        x['rawmean'] = st.mean(x['raw'].values())
        x['isB'] = 1 if x['ver'] == 'B' else 0
        x['preferred'] = st.mean(1.0 if pr == x['ver'] else 0.0 for pr in x['prefer'].values())
    # order lean taken out within each reading: zadj = zmean - lean * (+1 if B, -1 if A), lean = (mean zB - mean zA)/2
    for lab in {x['reading'] for x in out}:
        xs = [x for x in out if x['reading'] == lab]
        lean = (st.mean(x['zmean'] for x in xs if x['isB']) - st.mean(x['zmean'] for x in xs if not x['isB'])) / 2
        for x in xs:
            x['zadj'] = x['zmean'] - lean * (1 if x['isB'] else -1)
            x['lean'] = lean
    return out


def pairs_of(vs):
    """-> list of (A, B) version dicts by reading and pair."""
    d = {}
    for x in vs:
        d.setdefault((x['reading'], x['pair']), {})[x['ver']] = x
    return [(d[k]['A'], d[k]['B']) for k in sorted(d)]


if __name__ == '__main__':
    vs = load()
    from collections import Counter
    print(len(vs), Counter(x['reading'] for x in vs))
    print('readers', {lab: sorted({r for x in vs if x['reading'] == lab for r in x['raw']}) for lab in POOL})
    print('lines vs key', sum(1 for x in vs if x['key_lines'] is not None and x['key_lines'] != x['nlines']), 'mismatches of',
          sum(1 for x in vs if x['key_lines'] is not None))
