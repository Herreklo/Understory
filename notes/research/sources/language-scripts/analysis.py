#!/usr/bin/env python3
"""Repetition, selection, particulars and callbacks in round 40's busiest pack. Read-only; writes JSON to scratch."""
import re, json, collections, random, os
import packlib as L

PACK = L.ROOT + '/reports/40-reading-busiest-pack.txt'
OUT = L.ROOT + '/out-feelings/scratch/'
vs = L.parse_pack(PACK)

from analysis_kinds import KINDS, KRE, kind
import analysis_kinds as K2

NAME_RE = re.compile(r"\b(?:%s)(?:\s(?:%s))?\b" % ('|'.join(L.NAMES), '|'.join(L.NAMES)))
people = lambda t: frozenset(NAME_RE.findall(t))

# ---------- family expression of a line (merges a family act's variant wordings) ----------
exprs = json.load(open(OUT + 'exprs.json'))
EXRE = []
for e in exprs:
    for wd in e['words']:
        pat = re.escape(wd)
        pat = re.sub(r'\\\$\\\{[^}]*\\\}', '.+?', pat)
        pat = re.sub(r'\$\\\{[^}]*\\\}', '.+?', pat)
        pat = re.sub(r'\$\{[^}]*\}', '.+?', pat)
        pat = pat.replace('§', '.*?')
        lit = len(re.sub(r'\$\{[^}]*\}', '', wd).replace('§', '').strip())
        if lit < 10:
            continue
        try:
            EXRE.append((e['id'], len(e['words']), re.compile('^' + pat + r'(?:\.|,|;|:|$| )'), lit))
        except re.error:
            pass
EXRE.sort(key=lambda x: -x[3])


def expr_of(text):
    t = L.strip_note(text)
    for i, n, r, _ in EXRE:
        if r.search(t):
            return i, n
    return None, None


# ---------- 2. repetition within a version ----------
rows = []  # every line
for v in vs:
    for l in v['lines']:
        nt = L.norm(l['text'])
        k, c = kind(nt)
        ex, nw = expr_of(l['text'])
        rows.append({'v': v['pair'] + v['ver'], 'year': l['year'], 'text': l['text'], 'nt': nt, 'kind': k, 'cls': c, 'expr': ex, 'nwords': nw,
                     'people': people(l['text']) - {v['name']} - set(v['name'].split()), 'reasons': l['reasons'] or '', 'cited': l['cited'], 'n': l['n']})
N = len(rows)
byv = collections.defaultdict(list)
for r in rows:
    byv[r['v']].append(r)

groups = []
for vid, rs in byv.items():
    g = collections.defaultdict(list)
    for r in rs:
        g[r['nt']].append(r)
    for nt, members in g.items():
        if len(members) < 2:
            continue
        k, c = members[0]['kind'], members[0]['cls']
        same_people = len({m['people'] for m in members}) == 1
        if c == 'routine':
            verdict = 'selection'
        elif len(members) >= 3 or same_people:
            verdict = 'acts'
        else:
            verdict = 'words'
        # alternative order: the act rule first, routine only if the act rule does not fire
        alt = 'acts' if (len(members) >= 3 or same_people) else ('words' if c != 'routine' else 'words')
        groups.append({'v': vid, 'nt': nt, 'k': len(members), 'kind': k, 'cls': c, 'same': same_people, 'verdict': verdict, 'alt': alt,
                       'years': [m['year'] for m in members], 'texts': [m['text'] for m in members]})

in_rep = sum(g['k'] for g in groups)
excess = sum(g['k'] - 1 for g in groups)
tab = collections.Counter()
tabx = collections.Counter()
alt = collections.Counter()
altx = collections.Counter()
bykind = collections.Counter()
for g in groups:
    tab[g['verdict']] += g['k']
    tabx[g['verdict']] += g['k'] - 1
    alt[g['alt']] += g['k']
    altx[g['alt']] += g['k'] - 1
    bykind[(g['kind'], g['verdict'])] += g['k'] - 1
print(f'lines {N}, versions {len(vs)}; lines in a within-version repeat group: {in_rep} ({in_rep / N:.1%}); excess copies {excess} ({excess / N:.1%}); groups {len(groups)}')
for k in ('selection', 'acts', 'words'):
    print(f'  {k:10s} lines {tab[k]:4d} ({tab[k] / in_rep:.0%})  excess {tabx[k]:4d} ({tabx[k] / excess:.0%})   | act-rule-first: lines {alt[k]} ({alt[k] / in_rep:.0%}) excess {altx[k]} ({altx[k] / excess:.0%})')
print('excess copies by kind and verdict:')
for (k, vd), n in sorted(bykind.items(), key=lambda x: -x[1]):
    print(f'  {n:4d} {k} / {vd}')

# looser key: the same line with another prefix or number form
lg = collections.Counter()
lgx = collections.Counter()
for v in vs:
    c = K2.classify_version(v, L.loose)
    cnt = collections.Counter(L.loose(l['text']) for l in v['lines'])
    for k, vd in c.items():
        lg[vd] += cnt[k]
        lgx[vd] += cnt[k] - 1
print('loose key: lines in repeat groups', sum(lg.values()), dict(lg), 'excess', sum(lgx.values()), dict(lgx))

# acts that recur within a version under another wording (variants already at work)
act_rec = collections.Counter()
for vid, rs in byv.items():
    g = collections.defaultdict(list)
    for r in rs:
        if r['expr']:
            g[r['expr']].append(r)
    for ex, ms in g.items():
        if len(ms) < 2:
            continue
        distinct = len({m['nt'] for m in ms})
        act_rec['recurring family acts (expr, version)'] += 1
        act_rec['their lines'] += len(ms)
        act_rec['lines with several wordings available'] += len(ms) if ms[0]['nwords'] > 1 else 0
        act_rec['lines differing in words from an earlier one of the same act'] += distinct - 1
print('family acts recurring within a version:', dict(act_rec))
split = collections.Counter()
for vid, rs in byv.items():
    g = collections.defaultdict(list)
    for r in rs:
        if r['expr']:
            g[r['expr']].append(r)
    for ex, ms in g.items():
        if len(ms) < 2: continue
        tag = 'several' if ms[0]['nwords'] > 1 else 'one'
        split[tag + ' recurrences'] += len(ms) - 1
        split[tag + ' new wording'] += len({m['nt'] for m in ms}) - 1
print('  recurrences of a family act, by wordings in code:', dict(split))
fam_lines = sum(1 for r in rows if r['expr'])
print(f'lines matched to a family expression: {fam_lines} ({fam_lines / N:.0%}); of those with several wordings in code: {sum(1 for r in rows if r["expr"] and r["nwords"] > 1)}')

# words: per act kind across the pack, distinct wordings observed
print('pack-wide: distinct normalised lines', len({r['nt'] for r in rows}))
top = collections.Counter(r['nt'] for r in rows)
t25 = sum(n for _, n in top.most_common(25))
print(f'top 25 normalised lines carry {t25} lines ({t25 / N:.1%}); top 50 {sum(n for _, n in top.most_common(50)) / N:.1%}')
once = sum(1 for k, n in top.items() if n == 1)
print(f'normalised lines seen once in the pack: {once} of {len(top)}')

# ---------- 4. selection ----------
yrs = collections.defaultdict(set)
for r in rows:
    yrs[r['v']].add(r['year'])
span = [max(y) - min(y) + 1 for y in yrs.values()]
per_year = [len(byv[v]) / 10 for v in byv]
print(f'lines per version: mean {N / len(vs):.1f}, min {min(len(x) for x in byv.values())}, max {max(len(x) for x in byv.values())}; per year (10-year page): {sum(per_year) / len(per_year):.1f}; observed span mean {sum(span) / len(span):.1f}')
kc = collections.Counter(r['kind'] for r in rows)
print('lines by kind:')
for k, n in kc.most_common():
    print(f'  {n:5d} {n / N:5.1%} {k}')
folded = 0
for v in vs:
    for l in v['lines']:
        m = re.search(r'\(and (once more|\d+ more times) between\)', l['reasons'] or '')
        if m:
            folded += 1 if m.group(1) == 'once more' else int(m.group(1).split()[0])
print('events already folded away by the page (and N more times between):', folded)

# callbacks: is a line referred to later by a reason or a cited (↳) line in the same version?
def toks(s):
    return set(re.findall(r"[a-z']+", s.lower())) - {'the', 'a', 'and', 'to', 'of', 'in', 'was', 'her', 'his', 'it', 'at', 'for', 'had', 'with', 'that', 'on'}


def segs(r):
    return [s.strip() for s in r.split(';') if s.strip()]


ref = 0
ref_by_kind = collections.Counter()
for vid, rs in byv.items():
    for i, r in enumerate(rs):
        base = L.strip_note(r['text']).rstrip('.')
        bt = toks(base)
        hit = False
        for later in rs[i + 1:]:
            for s in segs(later['reasons']):
                m = re.match(r'^(.*?)\s*\((\d{4})\)$', s)
                body, y = (m.group(1), int(m.group(2))) if m else (s, None)
                body = L.strip_note(body).rstrip('.')
                if body and (base.startswith(body) or body.startswith(base)) and (y is None or y == r['year']):
                    hit = True
                elif y == r['year'] and bt and len(toks(body) & bt) / max(1, len(toks(body))) >= 0.6:
                    hit = True
                if hit: break
            if hit: break
        if hit:
            ref += 1
            ref_by_kind[r['kind']] += 1
print(f'lines referred to by a later reason in the same version: {ref} ({ref / N:.1%})')
for k, n in kc.most_common():
    print(f'  {k}: {ref_by_kind[k]} of {n} ({ref_by_kind[k] / n:.0%})')
cited_lines = sum(len(r['cited']) for r in rows)
print('↳ lines (earlier events shown under a line because a reason cites them):', cited_lines)

# ---------- 5. particulars ----------
S = open(L.ROOT + '/src/setting.ts').read()
mat = re.findall(r"'([a-z][^']+)'", S[S.find('material: {'):S.find('  // Small loves')])
PLACES = r"the Anchor|the quay|the harbour|the sawmill|the clinic|the council office|the school|the garage|the Courier|the church|the co-op|the breakwater|the shore road|the point|the city|the county fair|the next town|the Old Bank Café|the community hall|the car park|the boathouse|the harbour road|the coast road|the valley|the house|the kitchen|the shed|the garden|the attic|the cellar|the porch|the hallway|the living room|the churchyard|the fish plant|the school gym|the end of the breakwater|the church hill|head office|the hospital|the beach"
TIMES = r"\b(spring|summer|autumn|winter|Christmas|Easter|Midsummer|January|February|March|April|May|June|July|August|September|October|November|December|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mondays|Tuesdays|Thursdays|Fridays|Saturdays|Sundays|morning|evening|night|midnight|closing time|dinner|the weekend|weekend|August)\b"
OBJ = r"\b(wallet|note|coin|hat|roof|garden|pickup|letterbox|fence|boat|car|kettle|radio|television|pints?|beer|cards|guitar|piano|ledger|till|nets|door|tables|keys|photograph|letter|ticket|coat|puffin|bell|whalebone|sea glass|timetables|biscuit tin|freezer|tobacco tin|sheep|priest|ferry|shed|bicycle|record)\b"
MAT = '|'.join(re.escape(m) for m in sorted(set(mat), key=len, reverse=True) if len(m) > 3)
PRE = re.compile(PLACES)
TRE = re.compile(TIMES)
ORE = re.compile(OBJ + '|' + MAT)
TITLE = re.compile(r'"[^"]+"')
part = collections.Counter()
slot = collections.Counter()
for r in rows:
    t = L.strip_note(r['text'])
    p, ti, o = bool(PRE.search(t)), bool(TRE.search(t)), bool(ORE.search(t))
    q = bool(TITLE.search(t)) and 'BAND' in r['nt']
    part['place'] += p
    part['time of year/day'] += ti
    part['object'] += o
    part['song title'] += q
    part['any'] += p or ti or o or q
    part['none'] += not (p or ti or o or q)
    if p or ti or o:
        part['any (place/time/object)'] += 1
# which particulars are fixed in the template (same in every instance) and which vary: replace the particular with P and see if
# the P-template has more than one filler across the pack
fill = collections.defaultdict(set)
cnt = collections.Counter()
for r in rows:
    t = L.norm(r['text'])
    found = [m.group(0) for rx in (PRE, TRE, ORE) for m in rx.finditer(t)]
    if not found:
        continue
    key = t
    for f in found:
        key = key.replace(f, 'P')
    fill[key].add(tuple(found))
    cnt[key] += 1
varying = sum(cnt[k] for k in cnt if len(fill[k]) > 1)
fixed = sum(cnt[k] for k in cnt if len(fill[k]) == 1)
print('particulars:', dict(part), 'of', N)
print(f'  lines whose particular varies between instances of the template: {varying}; fixed in the template: {fixed}')
fixed_top = collections.Counter({k: cnt[k] for k in cnt if len(fill[k]) == 1}).most_common(12)
print('  commonest fixed:', fixed_top)
var_top = collections.Counter({k: cnt[k] for k in cnt if len(fill[k]) > 1}).most_common(12)
print('  commonest varying:', [(k, n, len(fill[k])) for k, n in var_top])
# person-specific quirk lines (persona.ts QUIRKS patterns, filled from the person's own life)
P = open(L.ROOT + '/src/persona.ts').read()
qp = re.findall(r"text: ['\"](.+?)['\"] \}", P[P.find('export const QUIRKS'):P.find('function quirksOf')])
qres = []
for q in qp:
    pat = re.escape(q)
    pat = re.sub(r'\\\{[a-z]+\\\}', '.+?', pat)
    pat = re.sub(r'\{[a-z]+\}', '.+?', pat)
    qres.append(re.compile(pat))
print('QUIRKS patterns in persona.ts:', len(qp))
quirk = [r for r in rows if any(x.search(r['text']) for x in qres)]
print('lines using a setting material item (quirk fillers):', len(quirk))
for r in quirk[:12]:
    print('   ', r['text'][:140])

# text callbacks: a line's own words recall an earlier event (not a ↳)
CB = [
    ('repeat note (how often, since when)', r"It had happened before|It was the \w+ time|It was not the first time|Nobody was surprised any more|had been happening since|\(and (once more|\d+ more times) between\)|^Once again"),
    ('names an earlier event in words', r"what X did (last year|a few months back)|as if what X did|the old business|after the \w+'s job|years? after|since the week it happened|after everything|not after the|What X had wanted for|after N (months|years) of|Nothing had changed since|kept bringing up|tells the story of|like her (father|mother)|the way it was before|had wanted (out|it) since|went quiet when X's name came up|dragged up"),
]
cbc = collections.Counter()
for r in rows:
    t = r['text'] + ' ' + (r['reasons'] if '(and' in r['reasons'] else '')
    nt = L.norm(r['text'], keep_notes=True)
    for name, rx in CB:
        if re.search(rx, nt) or re.search(rx, t):
            cbc[name] += 1
print('text callbacks:', dict(cbc), 'of', N)

# ---------- sample for the appendix ----------
random.seed(40)
samp = random.sample(groups, 30)
json.dump({'groups': groups, 'sample': samp, 'N': N}, open(OUT + 'groups.json', 'w'), indent=1, default=list)
json.dump([{k: (list(v) if isinstance(v, frozenset) else v) for k, v in r.items()} for r in rows], open(OUT + 'rows.json', 'w'), indent=0)
