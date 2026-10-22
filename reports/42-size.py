#!/usr/bin/env python3
"""Round 42's sizing from the outputs of src/tools/diag/bear.ts (docs/BOARD.md will say how they were run). Nothing the engine does is run.

  python3 reports/42-size.py out-r42/size.jsonl out-r42/pack-null.json out-r42/pack-r40.json out-r42/pack-r41.json > reports/42-size.txt

- the round's counter and the lines it changes, a world at a time, with 95% intervals between worlds (9001 on);
- check 1: the reasons it leaves out, against the rate M38's readers faulted the same phrases;
- check 2: the true pages M38's readers read, rebuilt with it: null from this tree, r40 from round 40's tree (9a03b53) and round 41's
  busiest on arm (the true half of shuffled and planted) from round 41's (eba5885), each with the change ported; of the line-readings
  faulted for an unfit reason on a line with a trait reason, how many it changes;
- check 3: decision lines left with no reason beyond their event;
- check 4: the power of 24 pairs and two roles to see half the drop, simulated from M38's rates; and of the score to see the effect;
- check 5: told accounts on the busiest pages, on against off.
"""
import json, math, random, re, sys
from collections import defaultdict

R = 'reports'
size_f, null_f, r40_f, r41_f = sys.argv[1:5]
worlds = [json.loads(l) for l in open(size_f) if l.strip()]
worlds.sort(key=lambda o: o['seed'])
T975 = {19: 2.093, 20: 2.086, 21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060, 26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042}


def ci(xs):
    n = len(xs)
    m = sum(xs) / n
    sd = math.sqrt(sum((x - m) ** 2 for x in xs) / (n - 1))
    return m, sd, T975.get(n - 1, 1.96) * sd / math.sqrt(n)


def row(name, xs, fmt='{:.1f}'):
    m, sd, h = ci(xs)
    print(f'  {name:<58} {fmt.format(m):>8}  ±{fmt.format(h)}  (sd {fmt.format(sd)}; {fmt.format(min(xs))} to {fmt.format(max(xs))})')


print(f'Round 42 sizing: throwaway worlds {worlds[0]["seed"]}–{worlds[-1]["seed"]} ({len(worlds)} worlds), ten present years, every')
print('decision line on someone\'s page. Off is main\'s page (every reason shown), on is the page with bear; behaviour is the same.\n')
print('Arms (ARMS=1): with OFF=bear each world differs from the on arm only in the decision records\' idle:')
bad = [o['seed'] for o in worlds if o['arms']['eventsDiffer'] or o['arms']['bondsDiffer'] or not o['arms']['rng']]
print(f'  worlds where events, bonds or the random stream differ: {len(bad)} {bad if bad else ""}')
print(f'  decisions marked idle a world: {sum(o["arms"]["decisionsMarked"] for o in worlds) / len(worlds):.0f}\n')

print('The counter, a world (mean, 95% interval between worlds):')
row('decision lines on pages', [o['lines'] for o in worlds])
row('trait reasons shown, off', [o['traitShown'] for o in worlds])
row('trait reasons shown that do not bear, off', [o['traitIdle'] for o in worlds])
row('  the same, on (0 by construction)', [o['traitIdleOn'] for o in worlds])
row('  share of trait reasons shown, off (%)', [100 * o['traitIdle'] / o['traitShown'] for o in worlds])
row('accounts shown as reasons, off', [o['accShown'] for o in worlds])
row('accounts shown that decided nothing, off', [o['accIdle'] for o in worlds])
row('  the same, on (0 by construction)', [o['accIdleOn'] for o in worlds])
row('accounts shown as reasons, on', [o['accShownOn'] for o in worlds])
row('decision lines whose reasons change (%)', [100 * o['changed'] / o['lines'] for o in worlds])
row('events shown under a line, every adult\'s page, off', [o['cited'] for o in worlds])
row('  the same, on', [o['citedOn'] for o in worlds])
print()

# ---------- M38's readers: unfit-reason faults by line, on the true pages they read ----------
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
                out[cur][int(m[1])] = (m[2], m[3] or '')
    return out


def readings(name, true_only):
    """[(pair, version, {line: (text, reasons)}, {line: unfit faults}, readers)] for the versions M38 read as true pages."""
    pack = versions(f'{R}/M38-reading-{name}-pack.txt')
    key = json.load(open(f'{R}/M38-reading-{name}-key.json'))
    ans = json.load(open(f'{R}/M38-reading-{name}-answers.json'))
    out = []
    for (pair, v), lines in sorted(pack.items()):
        if true_only and key[pair]['onIs'] != v:
            continue
        faults = defaultdict(int)
        n = 0
        for sitting in ans.values():
            if pair not in sitting['pairs']:
                continue
            n += 1
            for f in sitting['pairs'][pair][v]['faults']:
                if f['kind'] == 'unfit reason':
                    faults[f['line']] += 1
        out.append((pair, v, lines, faults, n))
    return out


true_pages = {n: readings(n, n in ('shuffled', 'planted')) for n in ('null', 'r40', 'shuffled', 'planted')}
allr = [x for n in true_pages for x in true_pages[n]]
line_readings = sum(len(lines) * n for _, _, lines, _, n in allr)
unfit = sum(sum(f.values()) for _, _, _, f, _ in allr)
base = 100 * unfit / line_readings
print(f'M38\'s true pages: {sum(n for *_, n in allr)} page-readings, {unfit} unfit reasons, {base:.2f} per hundred line-readings.\n')

# ---------- check 1 ----------
drop, keep = defaultdict(int), defaultdict(int)
for o in worlds:
    for k, v in o['dropped'].items():
        drop[k] += v
    for k, v in o['kept'].items():
        keep[k] += v
ndrop = sum(drop.values())
expr_only = sum(o['traitExprOnly'] for o in worlds)
rescued = sum(o['rescued'] for o in worlds)
print('Check 1, it drops reasons readers accept:')
print(f'  trait reasons the expression alone does not read: {expr_only}; kept by the motive clause (worded for the family): {rescued}')
print(f'  ({100 * rescued / expr_only:.0f}% of them). Of the trait reasons left out with the clause in, worded for the family: 0, by construction.')


def rx(phrase):
    s = re.escape(phrase)
    s = s.replace('X', r'[A-Z][\w\'’.-]*(?: [A-Z][\w\'’.-]*)*').replace('Y', r'\d{4}')
    s = re.sub(r'\b(she|he)\b', '(?:she|he)', s)
    s = re.sub(r'\b(her|him|his)\b', '(?:her|him|his)', s)
    s = re.sub(r'\b(herself|himself)\b', '(?:herself|himself)', s)
    return re.compile('^(?:despite )?' + s + '$')


def m38_rate(phrase):
    r = rx(phrase)
    lr = f = 0
    for _, _, lines, faults, n in allr:
        for ln, (_, reasons) in lines.items():
            if any(r.match(x.strip()) for x in reasons.split('; ')):
                lr += n
                f += faults.get(ln, 0)
    return lr, f


def by_rate(table, label):
    seen = accepted = faulted = unseen = 0
    lr_all = f_all = 0
    worst = []
    for ph, c in sorted(table.items(), key=lambda x: -x[1]):
        lr, f = m38_rate(ph)
        if lr < 4:
            unseen += c
            continue
        seen += c
        lr_all += lr * c
        f_all += f * c
        rate = 100 * f / lr
        if rate <= base:
            accepted += c
        else:
            faulted += c
        worst.append((c, ph, lr, f, rate))
    print(f'  {label}: {sum(table.values())} instances; read at least four times in M38: {seen}; of those, faulted at or below the base rate')
    print(f'    ({base:.1f} per hundred): {accepted} ({100 * accepted / max(1, seen):.0f}%); above it: {faulted}. Weighted rate: '
          f'{100 * f_all / max(1, lr_all):.1f} per hundred line-readings.')
    return worst


w_drop = by_rate(drop, 'left out by bear (traits and accounts)')
by_rate(keep, 'trait reasons bear keeps, for comparison')
print('  The phrases left out most, with M38\'s line-readings, faults and rate per hundred:')
for c, ph, lr, f, rate in w_drop[:15]:
    print(f'    {c:>4}  {ph[:70]:<70} {lr:>4} {f:>3} {rate:>5.1f}')
print()

# ---------- check 2 ----------
print('Check 2, the true pages M38\'s readers read, rebuilt with bear:')


def rebuilt(path, name, true_only=False):
    made = json.load(open(path))
    key = json.load(open(f'{R}/M38-reading-{name}-key.json'))
    pack = versions(f'{R}/M38-reading-{name}-pack.txt')
    ans = json.load(open(f'{R}/M38-reading-{name}-answers.json'))
    match = miss = 0
    c = defaultdict(int)
    for m in made:
        pair = m['id']
        for arm in ('on',) if true_only else ('on', 'off'):
            v = key[pair]['onIs'] if arm == 'on' else ('B' if key[pair]['onIs'] == 'A' else 'A')
            lines = pack[(pair, v)]
            for i, l in enumerate(m[arm], 1):
                if lines.get(i) and (lines[i][0] + (f'  [{lines[i][1]}]' if lines[i][1] else '')).strip() == re.sub(r'  \(.*\)$', '', l['text']).strip():
                    match += 1
                else:
                    miss += 1
            for sitting in ans.values():
                if pair not in sitting['pairs']:
                    continue
                for f in sitting['pairs'][pair][v]['faults']:
                    if f['kind'] != 'unfit reason' or not (1 <= f['line'] <= len(m[arm])):
                        continue
                    l = m[arm][f['line'] - 1]
                    ch = l['bear'] != l['text']
                    for k, on in (('all', True), ('trait', l['trait']), ('motive', l['motive']), ('account', l['account'])):
                        if on:
                            c[k] += 1
                            c[k + '+'] += ch
    print(f'  {name}{" (true halves)" if true_only else ""}: lines rebuilt that match the pages read: {match} of {match + miss}; unfit-reason faults on a')
    print(f'    line with a trait reason {c["trait"]}, changed {c["trait+"]} ({100 * c["trait+"] / max(1, c["trait"]):.0f}%); with a motive {c["motive"]},'
          f' changed {c["motive+"]}; every one {c["all"]}, changed {c["all+"]}; citing an account {c["account"]}, changed {c["account+"]}')
    return c, made


tot = defaultdict(int)
made_null = made_r40 = None
for path, name, t in ((null_f, 'null', False), (r40_f, 'r40', False), (r41_f, 'shuffled', True), (r41_f, 'planted', True)):
    c, made = rebuilt(path, name, t)
    if name == 'null':
        made_null = made
    if name == 'r40':
        made_r40 = made
    for k, v in c.items():
        tot[k] += v
pct = lambda k: 100 * tot[k + '+'] / max(1, tot[k])
print(f'  all 288 page-readings: faulted line-readings with a trait reason {tot["trait"]}, of which bear changes {tot["trait+"]} ({pct("trait"):.0f}%);'
      f' with a motive')
print(f'  {tot["motive"]}, changed {tot["motive+"]} ({pct("motive"):.0f}%); every unfit reason {tot["all"]}, changed {tot["all+"]} ({pct("all"):.0f}%); citing an')
print(f'  account {tot["account"]}, changed {tot["account+"]} ({pct("account"):.0f}%). The stop line is 40% of the faulted motive line-readings.\n')

# ---------- check 3 ----------
print('Check 3, decision lines left with no reason beyond their event (sized at 2.5%, stop above 5%):')
row('left bare, of decision lines with a reason off (%)', [100 * o['bare'] / o['withReason'] for o in worlds], '{:.2f}')
print()

# ---------- check 5 ----------
print('Check 5, told accounts on the busiest pages (three a world), on against off (stop if fewer than one page in three keeps one):')
pages = sum(o['busiest']['pages'] for o in worlds)
off = sum(o['busiest']['pagesAccOff'] for o in worlds)
on = sum(o['busiest']['pagesAccOn'] for o in worlds)
both = sum(o['busiest']['pagesAccBoth'] for o in worlds)
print(f'  pages: {pages}; with an account shown off: {off} ({100 * off / pages:.0f}%); on: {on} ({100 * on / pages:.0f}%); of the {off} that had one,')
print(f'  {both} keep one ({100 * both / max(1, off):.0f}%).')
for name, made in (('null', made_null), ('r40', made_r40)):
    vs = [m[a] for m in made for a in ('on', 'off')]
    offp = sum(any(l['account'] for l in v) for v in vs)
    onp = sum(any(l['account'] and l['bear'] == l['text'] for l in v) for v in vs)
    print(f'  M38 {name} pages: {len(vs)}; with an account off: {offp}; whose account lines all keep their reasons: {onp}')
print()

# ---------- check 4 ----------
print('Check 4, can 24 pairs and two roles see it?')
# Unfit-reason faults on the lines bear changes, per line-reading, on M38's null and r40 pages (the engine's own pages, as read).
lr = f = 0
L = []
per_reading = []
for name, made in (('null', made_null), ('r40', made_r40)):
    key = json.load(open(f'{R}/M38-reading-{name}-key.json'))
    ans = json.load(open(f'{R}/M38-reading-{name}-answers.json'))
    for m in made:
        pair = m['id']
        for arm in ('on', 'off'):
            v = key[pair]['onIs'] if arm == 'on' else ('B' if key[pair]['onIs'] == 'A' else 'A')
            ch = {i for i, l in enumerate(m[arm], 1) if l['bear'] != l['text']}
            if name == 'null':
                L.append(len(ch))
            for sitting in ans.values():
                if pair not in sitting['pairs']:
                    continue
                k = sum(1 for x in sitting['pairs'][pair][v]['faults'] if x['kind'] == 'unfit reason' and x['line'] in ch)
                lr += len(ch)
                f += k
                per_reading.append((len(ch), k))
p0 = f / lr
mean_k = sum(k for _, k in per_reading) / len(per_reading)
exp_k = [n * p0 for n, _ in per_reading]
var_k = sum((k - e) ** 2 for (_, k), e in zip(per_reading, exp_k)) / len(per_reading)
disp = var_k / max(1e-9, sum(exp_k) / len(exp_k))
print(f'  rate on the lines bear changes, as main shows them: {100 * p0:.2f} per hundred line-readings ({f} of {lr}); lines changed a busiest')
print(f'  page (null pack, this tree): mean {sum(L) / len(L):.1f}, {min(L)} to {max(L)}; overdispersion of faults a page-reading: {disp:.2f}')
p_base = 0.03
rng = random.Random(42)


def gamma_mult(k):
    # a page-reading's own propensity, mean 1, variance (disp - 1)/mu: a negative binomial in place of the binomial
    return rng.gammavariate(k, 1 / k) if k < 1e6 else 1.0


def power(p_off, p_on, sims=4000, pairs=24, roles=2, alpha_t=1.714):
    mu = p0 * sum(L) / len(L)
    k = mu / max(1e-6, disp - 1) if disp > 1 else 1e9
    hits = 0
    for _ in range(sims):
        ds = []
        for _ in range(pairs):
            n = rng.choice(L)
            d = 0
            for _ in range(roles):
                a = sum(1 for _ in range(n) if rng.random() < min(1, p_off * gamma_mult(k)))
                b = sum(1 for _ in range(n) if rng.random() < min(1, p_on * gamma_mult(k)))
                d += a - b
            ds.append(d / roles)
        m = sum(ds) / pairs
        sd = math.sqrt(sum((x - m) ** 2 for x in ds) / (pairs - 1)) or 1e-9
        hits += m / (sd / math.sqrt(pairs)) > alpha_t
    return hits / sims


full = p0 - p_base
print(f'  the drop the note expects on those lines: {100 * p0:.1f} to {100 * p_base:.1f} per hundred; half of it: to {100 * (p0 - full / 2):.1f}')
for label, p_on in (('the whole drop', p_base), ('half the drop', p0 - full / 2)):
    print(f'  power, one-sided paired t at .05 over the 24 pairs (roles averaged), {label}: {100 * power(p0, p_on):.0f}%')
# The score: M38's null read −0.04 ±0.21 (95%), so its standard error is about 0.107.
se = 0.21 / 1.96
z = lambda eff: 0.5 * (1 + math.erf((eff / se - 1.645) / math.sqrt(2)))
print(f'  the score (effect with order as a term; M38 null −0.04 ±0.21): power to see +0.01 is {100 * z(0.01):.0f}%, +0.05 {100 * z(0.05):.0f}%;')
print(f'  80% power needs about +{(1.645 + 0.842) * se:.2f}.')
