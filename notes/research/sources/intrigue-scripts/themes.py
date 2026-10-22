"""What readers cite as good and as faults, by the kind of line cited; and which faults go with low scores.

  python3 notes/research/sources/intrigue-scripts/themes.py > notes/research/sources/intrigue-scripts/themes-out.txt

The answers carry no free text: a reader's own words are its fault kinds and the lines it picks. Before M38 a fault or good reason
is an exact quote (4472 fault quotes; 2 not found verbatim in the page), matched here to its line; from M38 it is a line number.
"""
import sys, os, re, statistics as st
from collections import Counter, defaultdict
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import data, features  # noqa: E402
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'language-scripts'))
import analysis_kinds  # noqa: E402
import packlib  # noqa: E402

CATS = [
    ('death', re.compile(r'\bdied\b')),
    ('illness', features.ILL),
    ('birth', re.compile(r'was born to')),
    ('partner turn', re.compile(r'started seeing each other|got married|split up|divorc')),
    ('job turn', re.compile(r'became [\w ]+ at|started work at|took a job|retired|resigned|will step down|found work')),
    ('home turn', re.compile(r'bought a house|got there: a house|\bmoved (in|out|away|house|to|into)\b')),
    ('lost out', re.compile(r'passed over|turned down|said no|missed the deadline|went to pieces|froze (while|at)|shied away|asked \w[\w ]* to go')),
    ('want: start or end', re.compile(r'started trying to|quietly started|means to|has started telling people|got there|gave up on|wanted for|talks about wanting')),
    ('secret / confiding', re.compile(r'nobody knew|kept it to (him|her)self|kept back|found out|let people think|\blied\b|took a little from|it came out that|'
                                      r'it got back to|has not been (him|her)self|came through it|told \w[\w ]* everything|finally told')),
    ('conflict', features.CONFLICT),
    ('let down', features.LETDOWN),
]


def cat(text):
    for n, r in CATS:
        if r.search(text):
            return n
    k, c = analysis_kinds.kind(packlib.norm(text))
    return {'story act': 'other act'}.get(k, k)


def match(quote, lines, on_reason=False):
    """-> index of the line a pre-M38 quote is from, or None. A good reason or an unfit reason is a quote of a reason: it is matched
    on the reasons (and the events shown under them) only, so a reason that cites an earlier event is not taken for that event."""
    q = re.sub(r'\s+', ' ', quote).strip()
    q = re.sub(r'^\d{4}: ', '', q)
    parts = [p.strip(' .[]') for p in re.split(r';|\s\[|\]|\(\d{4}\)', q) if len(p.strip(' .[]')) > 6]
    best, bi = 0, None
    for i, l in enumerate(lines):
        rs = re.sub(r'\s+', ' ', (l['reasons'] or '') + ' ' + ' '.join(t for _, t in l['cited']))
        full = rs if on_reason else re.sub(r'\s+', ' ', l['text']) + ' ' + rs
        s = sum(len(p) for p in parts if p in full)
        if not on_reason and l['text'] and l['text'] in q:
            s += len(l['text']) * 2
        if on_reason and l['text'] and l['text'] in q:
            s += len(l['text'])  # the quote also gives the act
        if s > best:
            best, bi = s, i
    if bi is None and on_reason:
        return match(quote, lines, False)
    return bi


def collect(vs):
    """-> per version: list of (reader, line index, 'good' | fault kind)."""
    unmatched = 0
    for x in vs:
        L = x['lines']
        byn = {l['n']: i for i, l in enumerate(L)}
        cites = []
        for r in x['raw']:
            for g in x['good'][r]:
                i = byn.get(g) if isinstance(g, int) else match(g, L, True)
                if i is None:
                    unmatched += 1
                else:
                    cites.append((r, i, 'good'))
            for f in x['faults'][r]:
                i = byn.get(f['line']) if 'line' in f else match(f.get('quote', ''), L, f['kind'] == 'unfit reason')
                if i is None:
                    unmatched += 1
                else:
                    cites.append((r, i, f['kind']))
        x['cites'] = cites
    return unmatched


KINDS = ['good', 'unfit reason', 'repeat', 'out of nowhere', 'false line', 'wording']


def by_category(vs, title):
    n_lines = Counter()
    hits = defaultdict(Counter)
    for x in vs:
        nr = len(x['raw'])
        cats = [cat(l['text']) for l in x['lines']]
        for c in cats:
            n_lines[c] += nr  # line-readings
        for r, i, k in x['cites']:
            hits[cats[i]][k] += 1
    tot = sum(n_lines.values())
    print(f'\n## Citations per 100 line-readings, by kind of line: {title}')
    print('| kind of line | lines | share | ' + ' | '.join(KINDS) + ' |')
    print('| --- | --- | --- | ' + ' | '.join('---' for _ in KINDS) + ' |')
    allk = Counter()
    for c in hits:
        allk.update(hits[c])
    nr = st.mean(len(x['raw']) for x in vs)
    print(f'| all lines | {tot / nr:.0f} | 100% | ' + ' | '.join(f'{100 * allk[k] / tot:.1f}' for k in KINDS) + ' |')
    for c, n in n_lines.most_common():
        print(f'| {c} | {n / nr:.0f} | {100 * n / tot:.1f}% | ' + ' | '.join(f'{100 * hits[c][k] / n:.1f}' for k in KINDS) + ' |')


def faults_vs_score(vs, title):
    """Per reader and version: z score on that reader's count of each fault kind, with lines and kinds (key) as terms."""
    import importlib.util
    spec = importlib.util.spec_from_file_location('ianalysis', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'analysis.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    solve = m.solve
    rows = []
    for x in vs:
        for r in x['raw']:
            c = Counter(f['kind'] for f in x['faults'][r])
            rows.append([1, x['nlines'] / 10, (x['kinds'] or x['f']['kinds_proxy']) / 10, x['isB']] + [c[k] for k in KINDS[1:]] + [len(x['good'][r])] + [x['z'][r]])
    k = len(rows[0]) - 1
    A = [[sum(r[i] * r[j] for r in rows) for j in range(k)] for i in range(k)]
    b = [sum(r[i] * r[k] for r in rows) for i in range(k)]
    co = solve(A, b)
    print(f'\n## A reader\'s score (z) on its own fault counts in that version, with lines/10, kinds/10 and order as terms: {title} ({len(rows)} reader-versions)')
    print('| term | z per fault (or per good line) | mean count a version |')
    print('| --- | --- | --- |')
    for j, name in enumerate(KINDS[1:] + ['good lines given']):
        print(f'| {name} | {co[4 + j]:+.3f} | {st.mean(r[4 + j] for r in rows):.2f} |')


def quotes_for(vs, kind, catname, n=6):
    """Most often cited lines of a kind of line under a citation kind (normalised), for illustration."""
    c = Counter()
    for x in vs:
        for r, i, k in x['cites']:
            l = x['lines'][i]
            if k == kind and cat(l['text']) == catname:
                c[packlib.loose(l['text'])] += 1
    return c.most_common(n)


if __name__ == '__main__':
    old = data.load([l for l in data.POOL if l != 'M38null'])
    new = data.load(['M38null', 'M38r40'])
    for x in old + new:
        x['f'] = features.features(x)
    u1 = collect(old)
    u2 = collect(new)
    print(f'# Citations by kind of line\nunmatched citations: old brief {u1}, M38 {u2}')
    by_category(old, 'rounds 29-41, old brief (up to 3 faults, up to 2 good, quoted; 504 versions, 3 readers)')
    by_category(new, 'M38 null and the re-read of round 40\'s busiest (every fault, by line; 96 versions, 2 readers)')
    faults_vs_score([x for x in new], 'M38 null + r40 re-read (every-fault brief, counts not capped)')
    faults_vs_score([x for x in old if x['kinds']], 'rounds 37-41 (old brief, faults capped at 3)')
    print('\n## Most cited lines, by citation and kind of line (rounds 29-41, normalised text, count)')
    for kind, cn in [('good', 'death'), ('good', 'secret / confiding'), ('good', 'conflict'), ('good', 'other act'), ('good', 'small kindness'),
                     ('out of nowhere', 'other act'), ('out of nowhere', 'conflict'), ('out of nowhere', 'friend ended'),
                     ('repeat', 'band routine'), ('repeat', 'town calendar'), ('repeat', 'conflict'), ('unfit reason', 'small kindness'), ('unfit reason', 'conflict'),
                     ('false line', 'habit/persona'), ('false line', 'secret / confiding')]:
        print(f'- {kind} / {cn}: ' + ' || '.join(f'{t} ({n})' for t, n in quotes_for(old, kind, cn, 4)))
