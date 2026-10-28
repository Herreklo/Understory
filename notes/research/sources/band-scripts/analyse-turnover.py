# P6 research: summarise turnover.ts output. python3 analyse-turnover.py out-bands (present decade) | out-bands40 (the whole record, past 0)
import json, sys, glob, statistics as st, math, collections
def ci(xs):
    m = st.mean(xs); s = st.stdev(xs) if len(xs) > 1 else 0
    return f"{m:.2f} ±{1.96*s/math.sqrt(len(xs)):.2f}"

# ---- turnover.ts: the old guard's departure and decisions inside groups ----
T = [json.load(open(f)) for f in sorted(glob.glob(sys.argv[1] + '/turnover-9*.json') + glob.glob(sys.argv[1] + '/turnover-past0-*.json'))]
if T:
    print('\n--- turnover ---')
    for kind, lab in (('b', 'bands'), ('w', 'workplaces')):
        G = [g for d in T for g in d['groups'] if g['k'][0] == kind]
        gone = [g for g in G if g['gone'] is not None]
        print(lab, len(G), 'lost their whole old guard within the run:', len(gone), f"({100*len(gone)/len(G):.0f}%)",
              'per world', ci([sum(1 for g in d['groups'] if g['k'][0] == kind and g['gone'] is not None) for d in T]))
        if gone: print('  months from start to the last of the old guard gone: median', st.median(g['gone'] - g['start'] for g in gone))
        gy = sum(g['months'] for g in G) / 12
        dec = collections.Counter()
        for g in G:
            for k, v in g['dec'].items(): dec[k] += v
        tot = sum(dec.values())
        print(f'  group-years {gy:.0f}; mean size {sum(g["sizeSum"] for g in G)/sum(g["months"] for g in G):.2f}; decisions among members {tot}, {tot/gy:.2f} per group-year')
        print('  by trigger:', dec.most_common(10))
        print('  newcomers per group per ten years: mean', round(st.mean(10 * g['newcomers'] / max(1, g['months'] / 12) for g in G), 2))
        # does the make-up survive? correlation across groups of the old guard's mean facet with the members' at the guard's going
        if len(gone) >= 5:
            for f in ['forgiveness', 'patience', 'modesty', 'sincerity', 'organisation', 'aesthetic', 'creativity']:
                xs = [g['p0'][f] for g in gone if g['p1'] and g['p1'][f] is not None]; ys = [g['p1'][f] for g in gone if g['p1'] and g['p1'][f] is not None]
                if len(xs) > 3:
                    mx, my = st.mean(xs), st.mean(ys); r = sum((a-mx)*(b-my) for a, b in zip(xs, ys)) / math.sqrt(sum((a-mx)**2 for a in xs) * sum((b-my)**2 for b in ys))
                    print(f'  {f}: r = {r:+.2f} (n {len(xs)})', end=';')
            print()
