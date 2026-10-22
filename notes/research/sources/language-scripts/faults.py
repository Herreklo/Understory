#!/usr/bin/env python3
"""Readers' 'repeat' faults by the line they quote, per hundred line-readings of each template. Read-only."""
import json, re, glob, os, collections
import packlib as L
import analysis_kinds as K

R = L.ROOT + '/reports/'
pairs = []
for f in sorted(glob.glob(R + '*answers.json')) + sorted(glob.glob(R + '*-reading-novelist.json')) + sorted(glob.glob(R + '*-reading-player.json')) + sorted(glob.glob(R + '*-reading-socialworker.json')):
    b = os.path.basename(f)
    if 'answers' in b:
        stem = b.replace('-answers.json', '')
        if stem.endswith('r40opus'):
            stem = stem.replace('r40opus', 'r40')
    else:
        stem = re.sub(r'-(novelist|player|socialworker)\.json$', '', b)
    pack = R + stem + '-pack.txt'
    if os.path.exists(pack):
        pairs.append((f, pack))

fault_by_t = collections.Counter()
read_by_t = collections.Counter()
kind_of_t = {}
per_file = []
unmatched = []
verdict = collections.Counter()
notrep = collections.Counter()
otherv = collections.Counter()
notrep_ex = []
all_kinds = collections.Counter()
quoted_reason = 0
for f, pack in pairs:
    vs = {(v['pair'], v['ver']): v for v in L.parse_pack(pack)}
    cls = {k: K.classify_version(v) for k, v in vs.items()}
    clsl = {k: K.classify_version(v, L.loose) for k, v in vs.items()}
    d = json.load(open(f))
    if 'pairs' in d:
        d = {'x': d}
    nrep = 0
    nf = 0
    readings = 0
    for rid, rd in d.items():
        for P, pv in rd['pairs'].items():
            for ver in ('A', 'B'):
                a = pv.get(ver)
                v = vs.get((P, ver))
                if not a or not v:
                    continue
                for l in v['lines']:
                    t = L.norm(l['text'])
                    read_by_t[t] += 1
                    kind_of_t[t] = K.kind(t)[0]
                readings += len(v['lines'])
                for fl in a.get('faults', []):
                    nf += 1
                    all_kinds[fl.get('kind')] += 1
                    if fl.get('kind') != 'repeat':
                        continue
                    nrep += 1
                    line = None
                    if 'line' in fl:
                        line = next((l for l in v['lines'] if l['n'] == fl['line']), None)
                    else:
                        q = re.sub(r'^\d{4}: ', '', fl.get('quote', '')).strip()
                        q0 = L.split_reasons(q)[0]
                        for l in v['lines']:
                            if q0 and (q0[:50] in l['text'] or l['text'][:50] in q0):
                                line = l
                                break
                        if line is None:  # a quote from a reason or a cited line: take the line whose reasons hold it
                            for l in v['lines']:
                                if q0[:40] and q0[:40] in (l['reasons'] or ''):
                                    line = l
                                    quoted_reason += 1
                                    break
                    if line is None:
                        unmatched.append((os.path.basename(f), P, ver, fl.get('quote', fl.get('line'))))
                        continue
                    fault_by_t[L.norm(line['text'])] += 1
                    vd = cls[(P, ver)].get(L.norm(line['text'])) or ('loose ' + clsl[(P, ver)][L.loose(line['text'])] if L.loose(line['text']) in clsl[(P, ver)] else 'not repeated in its version')
                    verdict[vd] += 1
                    if vd.startswith('not'):
                        other = vs.get((P, 'B' if ver == 'A' else 'A'))
                        inother = other and any(L.loose(x['text']) == L.loose(line['text']) for x in other['lines'])
                        otherv[bool(inother)] += 1
                        notrep[L.norm(line['text'])] += 1
                        notrep_ex.append(line['text'])
    per_file.append((os.path.basename(f), nrep, nf, readings))

print('files:', len(pairs))
tot_rep = sum(x[1] for x in per_file)
tot_f = sum(x[2] for x in per_file)
tot_read = sum(x[3] for x in per_file)
print(f'repeat faults {tot_rep} of {tot_f} faults ({tot_rep / tot_f:.0%}); line-readings {tot_read}; matched {sum(fault_by_t.values())}, unmatched {len(unmatched)}, via a reason {quoted_reason}')
print('all fault kinds:', all_kinds.most_common())
for x in per_file:
    print(f'  {x[0]:45s} repeat {x[1]:3d} of {x[2]:4d}; line-readings {x[3]}')
print('\nTop 15 templates by repeat faults: faults, line-readings, per 100, kind')
top = fault_by_t.most_common(15)
for t, n in top:
    print(f'{n:4d} {read_by_t[t]:6d} {100 * n / read_by_t[t]:6.1f}  {kind_of_t.get(t, "?"):15s} {t[:110]}')
print(f'\nshare of matched repeat faults in the top 15 templates: {sum(n for _, n in top) / sum(fault_by_t.values()):.0%}; top 5: {sum(n for _, n in fault_by_t.most_common(5)) / sum(fault_by_t.values()):.0%}')
bk = collections.Counter()
rk = collections.Counter()
for t, n in fault_by_t.items():
    bk[kind_of_t.get(t, '?')] += n
for t, n in read_by_t.items():
    rk[kind_of_t.get(t, '?')] += n
print('repeat faults by line kind (faults, line-readings, per 100):')
for k, n in bk.most_common():
    print(f'  {k:15s} {n:4d} {rk[k]:7d} {100 * n / rk[k]:.2f}')
# rate per 100 for templates read at least 200 times, the highest
print('\nHighest rates among templates read 150+ times:')
rates = sorted(((100 * fault_by_t[t] / read_by_t[t], t) for t in read_by_t if read_by_t[t] >= 150), reverse=True)[:10]
for r, t in rates:
    print(f'  {r:5.1f} {fault_by_t[t]:3d}/{read_by_t[t]:5d} {t[:100]}')
print('repeat faults by the within-version verdict of the line quoted:', verdict.most_common())
print('\nunmatched sample:', unmatched[:8])
json.dump({'top': [(t, n, read_by_t[t], kind_of_t.get(t)) for t, n in fault_by_t.most_common(40)], 'bykind': {k: (bk[k], rk[k]) for k in rk},
           'per_file': per_file}, open(L.ROOT + '/out-feelings/scratch/faults.json', 'w'), indent=1)

print('not repeated in version, top:')
for t,n in notrep.most_common(25): print(' ',n,t[:120])

print('not repeated in version: also in the other version of the pair?', dict(otherv))
