#!/usr/bin/env python3
"""Round 43w's sizing from the outputs of src/tools/diag/wording.ts (reports/43w-size.md says how they were run). Nothing the engine does is run.

  python3 reports/43w-size.py out-r43w/size.jsonl out-r43w/pack-null.json out-r43w/pack-r40.json out-r43w/pack-r41.json > reports/43w-size.txt

- the arms: with OFF=wording each throwaway world (9001 on) differs only in the words of the reasons the round words and of `backsong`;
- the counter: reasons the round words a world, and the changed lines on the pages a pack would read;
- check 1: the true pages M38's readers read, rebuilt with the round's words (null from this tree, r40 from round 40's tree 9a03b53, round
  41's busiest on arm, the true half of shuffled and planted, from round 41's eba5885); of the 434 line-readings faulted for an unfit
  reason on a line with a trait reason, how many change words;
- check 2: the same on round 41's pages, held out when the cells were chosen, against the in-sample pages (null and r40);
- check 3: where each reworded reason comes from (own, prefers, weighed) and how many trace to nothing;
- check 4: every cell with main's words and the round's, for the reviewer;
- check 5: the power of a paired reading of 24 or 48 pairs to see half the drop in unfit reasons on the changed lines.
"""
import json, math, random, re, sys
from collections import defaultdict
from statistics import mean

R = 'reports'
size_f, null_f, r40_f, r41_f = sys.argv[1:5]
worlds = sorted((json.loads(l) for l in open(size_f) if l.strip()), key=lambda o: o['seed'])
T975 = {19: 2.093, 20: 2.086, 21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060, 26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042}
FACETS = set(json.load(open('src/motives.json'))['facets'])


def ci(xs):
    n = len(xs)
    m = sum(xs) / n
    sd = math.sqrt(sum((x - m) ** 2 for x in xs) / (n - 1))
    return m, sd, T975.get(n - 1, 1.96) * sd / math.sqrt(n)


def row(name, xs, fmt='{:.1f}'):
    m, sd, h = ci(xs)
    print(f'  {name:<58} {fmt.format(m):>8}  ±{fmt.format(h)}  (sd {fmt.format(sd)}; {fmt.format(min(xs))} to {fmt.format(max(xs))})')


print(f'Round 43w sizing: throwaway worlds {worlds[0]["seed"]}–{worlds[-1]["seed"]} ({len(worlds)} worlds), ten present years.')
print("Off is main's words, on is the round's; behaviour is the same.\n")

print('Arms (ARMS=1): with OFF=wording each world differs from the on arm only in words:')
bad = [o['seed'] for o in worlds if not o['arms']['same']]
print(f'  worlds where anything else differs: {len(bad)} {bad if bad else ""}')
for o in worlds:
    for d in o['arms']['diff'][:2]:
        print(f'    {o["seed"]}: {d[:200]}')
print(f'  reasons reworded a world (whole record): {mean(o["arms"]["reasons"] for o in worlds):.0f}; '
      f'texts and reasons quoting backsong: {mean(o["arms"]["texts"] for o in worlds):.0f}\n')

print('The counter, a world over the present (mean, 95% interval between worlds):')
row('trait reasons', [o['reasons'] for o in worlds])
row('  said as a motive', [o['said'] for o in worlds])
row('  in words the round changed', [o['worded'] for o in worlds])
row('  share of motives the round rewords (%)', [100 * o['worded'] / o['said'] for o in worlds])
row('backsong events', [o['song'] for o in worlds])
cells = defaultdict(int)
for o in worlds:
    for k, n in o['cells'].items():
        cells[k] += n
print(f'  cells seen in {len(worlds)} worlds: {len(cells)}')
pages = [p for o in worlds for p in o['pages']]
L = [p['changed'] for p in pages]
row('lines on a page a pack would read', [p['lines'] for p in pages])
row('  changed lines on it', L)
row('  share changed (%)', [100 * p['changed'] / p['lines'] for p in pages])
busiest = [max(o['pages'], key=lambda p: p['lines']) for o in worlds]
row("  changed lines on each world's busiest page", [p['changed'] for p in busiest])
print()

# ---------- checks 1 and 2: M38's true pages, rebuilt
LINE = re.compile(r'^\s*(\d+)  (\d{4}: .*?)(?:  \[(.*)\])?((?:  \([^\[\]]*\))?)$')


def versions(path):
    out, cur = {}, None
    for raw in open(path, encoding='utf8'):
        raw = raw.rstrip('\n')
        m = re.match(r'##### (P\d+), version ([AB]) — (.*)', raw)
        if m:
            cur = (m[1], m[2])
            out[cur] = {}
        elif cur and raw.strip() and not raw.lstrip().startswith('↳'):
            m = LINE.match(raw)
            if m:
                out[cur][int(m[1])] = raw.strip()
    return out


def joined(made_path, name, true_only):
    """[(pair, arm, lines, faults{line: n}, readers, match, miss)]: a pack's pages as rebuilt, with the unfit reasons its readers found."""
    made = json.load(open(made_path))
    key = json.load(open(f'{R}/M38-reading-{name}-key.json'))
    pack = versions(f'{R}/M38-reading-{name}-pack.txt')
    ans = json.load(open(f'{R}/M38-reading-{name}-answers.json'))
    out = []
    for m in made:
        pair = m['id']
        for arm in ('on',) if true_only else ('on', 'off'):
            v = key[pair]['onIs'] if arm == 'on' else ('B' if key[pair]['onIs'] == 'A' else 'A')
            lines = pack[(pair, v)]
            match = sum(1 for l in m[arm] if re.sub(r'^\d+\s+', '', lines.get(l['n'], '')) == l['text'])
            faults, n = defaultdict(int), 0
            for s in ans.values():
                if pair not in s['pairs']:
                    continue
                n += 1
                for f in s['pairs'][pair][v]['faults']:
                    if f['kind'] == 'unfit reason':
                        faults[f['line']] += 1
            out.append((pair, arm, m[arm], faults, n, match, len(m[arm]) - match))
    return out


packs = {'null': joined(null_f, 'null', False), 'r40': joined(r40_f, 'r40', False),
         'shuffled': joined(r41_f, 'shuffled', True), 'planted': joined(r41_f, 'planted', True)}
INS = ('null', 'r40')
print("M38's true pages, rebuilt with the round's words:")
for name, v in packs.items():
    print(f'  {name:<9} page-readings {sum(x[4] for x in v):>3}; lines matching what was read {sum(x[5] for x in v)} of '
          f'{sum(x[5] + x[6] for x in v)}; unfit reasons recovered {sum(sum(x[3].values()) for x in v)}')


def trait_line(l):
    return any(c['kind'] == 'trait' and (c.get('key') or '').replace('against:', '') in FACETS for c in l['causes'])


reach = {}
for s in ('in', 'out'):
    den = hit = 0
    for name, v in packs.items():
        if (name in INS) != (s == 'in'):
            continue
        for pair, arm, lines, faults, n, *_ in v:
            for l in lines:
                f = faults.get(l['n'], 0)
                if f and trait_line(l):
                    den += f
                    hit += f if l['changed'] else 0
    reach[s] = (hit, den)
hi, hd = reach['in']
oi, od = reach['out']
print(f'\nCheck 1: faulted trait-reason line-readings whose words change: {hi + oi} of {hd + od} ({100 * (hi + oi) / (hd + od):.0f}%; stop under 50%)')
print(f'Check 2: in-sample (null, r40) {hi}/{hd} = {100 * hi / hd:.0f}%; held out (round 41) {oi}/{od} = {100 * oi / od:.0f}%;'
      f' ratio {oi / od / (hi / hd):.2f} (stop under 0.5)')

# rates: unfit reasons per hundred line-readings, on changed lines and overall
rate = {}
for s in ('in', 'out', 'all'):
    lr = f = clr = cf = 0
    for name, v in packs.items():
        if s != 'all' and (name in INS) != (s == 'in'):
            continue
        for pair, arm, lines, faults, n, *_ in v:
            for l in lines:
                lr += n
                f += faults.get(l['n'], 0)
                if l['changed']:
                    clr += n
                    cf += faults.get(l['n'], 0)
    rate[s] = (f, lr, cf, clr)
    print(f'  {s:<4} unfit reasons {f}/{lr} = {100 * f / lr:.2f} per hundred line-readings; on lines the round changes {cf}/{clr} = '
          f'{100 * cf / clr:.2f}')
print()

# ---------- check 3
fr = defaultdict(int)
for o in worlds:
    for k, n in o['from'].items():
        fr[k] += n
tot = sum(fr.values())
print(f'Check 3: reworded reasons by where they come from, {len(worlds)} worlds: ' + ', '.join(f'{k} {n} ({100 * n / tot:.1f}%)' for k, n in fr.items()))
print(f'  untraced {fr["untraced"]} of {tot} ({100 * fr["untraced"] / tot:.2f}%; stop above 0.5%)')
for o in worlds:
    for u in o['untraced'][:2]:
        print(f'    {o["seed"]}: {u}')
print()

# ---------- check 4: every cell, main's words and the round's
words = {}
for o in worlds:
    for k, w in o['words'].items():
        words.setdefault(k, w)
m38 = defaultdict(lambda: [0, 0, 0, 0])  # cell -> in line-readings, in faults, out line-readings, out faults
for name, v in packs.items():
    i = 0 if name in INS else 2
    for pair, arm, lines, faults, n, *_ in v:
        for l in lines:
            for c in l['causes']:
                r = c.get('read')
                if not r or r['on'] == r['off']:
                    continue
                a = l['act']
                k = f"{a.get('expr') or 'type:' + a['type']}|{r['facet']}|{'hi' if r['hi'] else 'lo'}|{'against' if r['against'] else 'for'}"
                words.setdefault(k, [re.sub(r'\b[A-Z][a-z]+(?: [A-Z][a-z]+)?\b', '{t}', r['off']), r['on']])
                m38[k][i] += n
                m38[k][i + 1] += faults.get(l['n'], 0)
print('Check 4: every cell the round words. M38: line-readings and unfit reasons in-sample, then held out; worlds: reasons a world.')
for k in sorted(words, key=lambda k: (-m38[k][1], -cells.get(k, 0))):
    a, b, c, d = m38[k]
    print(f'  {k:<42} M38 {a:>3} {b:>2} | {c:>3} {d:>2}   worlds {cells.get(k, 0) / len(worlds):>5.1f}   "{words[k][0]}" → "{words[k][1]}"')
print()

# ---------- check 5: power, paired. Per changed line-reading a fault in the off version only (rate a), in the on version only (rate b);
# faults in both cancel (M38 planted: readers judged an unchanged line alike in both versions, 109 of 109). The drop is a − b.
def power(L, drop, b, pairs, roles=2, sims=4000, seed=42):
    rng = random.Random(seed)
    a = drop + b
    t = {24: 1.714, 48: 1.678}[pairs]
    hits = 0
    for _ in range(sims):
        ds = []
        for _ in range(pairs):
            n = rng.choice(L)
            d = 0
            for _ in range(roles):
                for _ in range(n):
                    r = rng.random()
                    d += 1 if r < a else -1 if r < a + b else 0
            ds.append(d / roles)
        m = mean(ds)
        sd = math.sqrt(sum((x - m) ** 2 for x in ds) / (pairs - 1)) or 1e-9
        hits += m / (sd / math.sqrt(pairs)) > t
    return hits / sims


base = rate['all'][0] / rate['all'][1]
held = rate['out'][2] / rate['out'][3]
whole = max(0.0, held - base)
print(f'Check 5: held-out rate on changed lines {100 * held:.2f} per hundred; base {100 * base:.2f}; whole drop {100 * whole:.2f}, '
      f'half {100 * whole / 2:.2f}. Changed lines a page: mean {mean(L):.1f} ({len(L)} pages).')
for b in (0.005, 0.01, 0.015):
    print(f'  new words faulted on their own at {100 * b:.1f}/100: ' + '; '.join(
        f'{p} pairs whole {100 * power(L, whole, b, p):.0f}%, half {100 * power(L, whole / 2, b, p):.0f}%' for p in (24, 48)))
