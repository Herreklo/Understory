#!/usr/bin/env python3
"""Static template inventory of the text sources. Read-only."""
import re, json, glob, os, collections

ROOT = '/Users/oystein/Documents/GitHub/Understory'
src = lambda f: open(os.path.join(ROOT, f)).read()

# --- families.ts: expressions and their wordings
fam = src('src/families.ts')
blocks = re.split(r'\n  E\(\{', fam)[1:]
exprs = []
for b in blocks:
    m = re.search(r"id: '([^']+)'", b)
    fm = re.search(r"family: '([^']+)'", b)
    tm = re.search(r'text:(.*?)\n    evidence:', b, re.S)
    body = tm.group(1) if tm else ''
    # wordings: backtick literals at top level of the text function (nested ones inside ${} are fillers)
    lits = re.findall(r'`((?:[^`\\]|\\.)*)`', body)
    # drop literal fragments that are only fillers inside ternaries (no ${a})
    words = [l for l in lits if '${a}' in l]
    exprs.append({'id': m.group(1), 'family': fm.group(1), 'n': max(1, len(words)), 'named': 'named: true' in b,
                  'quiet': 'quiet: true' in b, 'words': words})
n_expr = len(exprs)
one = sum(1 for e in exprs if e['n'] == 1)
several = n_expr - one
n_words = sum(e['n'] for e in exprs)
quiet = sum(1 for e in exprs if e['quiet'])
print(f'families.ts: {n_expr} expressions ({quiet} quiet, never logged), {n_words} wordings; one wording {one}, several {several}')
print('  several:', [(e['id'], e['n']) for e in exprs if e['n'] > 1])
json.dump(exprs, open(os.path.join(ROOT, 'out-feelings/scratch/exprs.json'), 'w'), indent=1)

# --- event-text templates across the engine (not tools): literals containing a person token @${
files = [f for f in glob.glob(os.path.join(ROOT, 'src/**/*.ts'), recursive=True) if '/tools/' not in f]
per = collections.Counter()
alltpl = []
for f in files:
    t = open(f).read()
    lits = re.findall(r'`((?:[^`\\]|\\.)*)`', t)
    k = [l for l in lits if '@${' in l]
    if f.endswith('families.ts'):
        k = [l for l in lits if '${a}' in l]
    per[os.path.relpath(f, ROOT)] = len(k)
    alltpl += k
print('literals with a person token, by file (engine, not tools):', sum(per.values()))
for f, n in per.most_common(30):
    if n: print(f'  {n:4d} {f}')

# --- the seven named text sources: template literals and phrase entries
for f in ['src/grammar.ts', 'src/telling.ts', 'src/families.ts', 'src/page.ts', 'src/witness.ts', 'src/setting.ts']:
    t = src(f)
    bt = re.findall(r'`((?:[^`\\]|\\.)*)`', t)
    sq = re.findall(r"'((?:[^'\\]|\\.){12,})'", t)  # single-quoted strings of 12+ chars: phrases
    sq = [s for s in sq if ' ' in s]
    print(f'{f}: {len(bt)} template literals, {len(sq)} quoted phrases (12+ chars with a space)')

mot = json.loads(src('src/motives.json'))
def leaves(x):
    if isinstance(x, dict):
        return sum(leaves(v) for k, v in x.items() if k != 'about')
    if isinstance(x, list): return sum(leaves(v) for v in x)
    return 1
fac = mot.get('facets', {})
print('motives.json: facets', len(fac), 'phrase leaves (for/against, all poles and kinds):', leaves(fac),
      'top-level keys', list(mot.keys()))
# per facet pole how many wordings
by = collections.Counter()
for k, v in fac.items():
    for pole in ('hi', 'lo'):
        n = 1 if pole in v else 0
        n += len(v.get(pole + 'By', {}))
        by[n] += 1
print('  wordings per facet pole (generic + by kind):', dict(sorted(by.items())))

# setting content that can fill a line
s = src('src/setting.ts')
mat = re.search(r'material: \{(.*?)\n  \},\n  // Small loves', s, re.S).group(1)
mat_items = re.findall(r"'([^']+)'", mat)
print('setting.ts material (quirk fillers):', len(mat_items), 'items')
print('setting.ts habits:', len(re.findall(r"label: '", s[s.find('habits: ['):s.find('resources:')])))
print('setting.ts loves:', len(re.findall(r"\{ text: '", s)))
