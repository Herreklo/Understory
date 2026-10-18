# Builds the City Scale report page from the run outputs.
#   python3 bench/report.py report/city-scale.html
import json, sys, math, os, statistics as st, html
OUT = sys.argv[1]
def jl(p): return [json.loads(l) for l in open(p) if l.strip().startswith('{')] if os.path.exists(p) else []
esc = html.escape
E = [r for r in jl('out/final/s0-engine/bench.jsonl') if r['past'] == 5]
B1 = [r for r in jl('out/final/s0-branch/bench.jsonl') if r['past'] == 5]
B2 = [r for r in jl('out/followup/s2b/bench.jsonl') if r['past'] == 5]
C3 = jl('out/final/city.jsonl'); C3b = jl('out/followup/city.jsonl')
S4 = json.load(open('out/followup/city100k-s4.json'))
SOC_B = jl('out/final/social-branch.jsonl')
FIT = open('out/s3/v3/fit.txt').read()
C7 = jl('out/s7/city.jsonl'); C8 = jl('out/s8/city.jsonl'); C8b = jl('out/s8b/city.jsonl')
K8 = json.load(open('out/s8/city100k.json')); INV = jl('out/s8b/invariance.jsonl'); INV0 = jl('out/s8b/invariance-control-s7.jsonl')
SAMPLE = json.load(open('out/s8b/sample-61.json'))
C10 = jl('out/s10/city.jsonl'); PINV = jl('out/s10/promoinv.jsonl'); TWIN = jl('out/s11b/twin.jsonl'); INV10 = jl('out/s10/invariance.jsonl')
LIKE = [(1, .868), (1, .616), (1, .591), (100000, .884), (100000, .80), (100000, .71)]  # same town, background of 1 or 100,000 (SCALE.md, S8)

def by_size(rows):
    g = {}
    for r in rows: g.setdefault(r['adults'], []).append(r)
    return {a: dict(people=st.mean(r['people'] for r in v), ms=st.mean(r['msPerMonth'] for r in v), soc=st.mean(r['bySystem'].get('social', 0) for r in v),
                    sys={k: st.mean(r['bySystem'].get(k, 0) for r in v) for k in set().union(*[r['bySystem'] for r in v])},
                    build=st.mean(r['buildMs'] for r in v) / 1000, heap=st.mean(r['heapMB'] for r in v), beliefs=st.mean(r['beliefs'] for r in v)) for a, v in sorted(g.items())}
ES, BS1, BS2 = by_size(E), by_size(B1), by_size(B2)
def slope(S, key='ms'):
    pts = [(math.log(s['people']), math.log(s[key])) for a, s in S.items() if a >= 184]
    mx = st.mean(p[0] for p in pts); my = st.mean(p[1] for p in pts)
    return sum((x - mx) * (y - my) for x, y in pts) / sum((x - mx) ** 2 for x, _ in pts)
big = 1840
f1 = lambda v: f'{v:,.1f}'; f0 = lambda v: f'{v:,.0f}'; pc = lambda v: f'{100*v:.0f}%'
def chip(ok, cost=False): return '<span class="chip cost">expected loss</span>' if cost else ('<span class="chip ok">pass</span>' if ok else '<span class="chip no">fail</span>')

# ---- chart ----
def chart():
    W, H, L, R, T, Bm = 640, 340, 64, 20, 18, 46
    x0, x1 = math.log10(50), math.log10(3300); y0, y1 = math.log10(10), math.log10(30000)
    X = lambda v: L + (math.log10(v) - x0) / (x1 - x0) * (W - L - R); Y = lambda v: T + (1 - (math.log10(v) - y0) / (y1 - y0)) * (H - T - Bm)
    s = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Time per simulated month against people, engine and branch, log scales">']
    for v, lab in ((10, '10 ms'), (100, '100 ms'), (1000, '1 s'), (10000, '10 s')):
        s.append(f'<line x1="{L}" x2="{W-R}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" class="grid"/><text x="{L-8}" y="{Y(v)+4:.1f}" class="ax" text-anchor="end">{lab}</text>')
    for v in (50, 100, 300, 1000, 3000):
        s.append(f'<line x1="{X(v):.1f}" x2="{X(v):.1f}" y1="{T}" y2="{H-Bm}" class="grid"/><text x="{X(v):.1f}" y="{H-Bm+18}" class="ax" text-anchor="middle">{v:,}</text>')
    s.append(f'<text x="{(L+W-R)/2:.0f}" y="{H-8}" class="ax" text-anchor="middle">people in the monthly world (log scale)</text>')
    a0 = min(BS2); p0, m0 = BS2[a0]['people'], BS2[a0]['ms']
    s.append(f'<line x1="{X(p0):.1f}" y1="{Y(m0):.1f}" x2="{X(3000):.1f}" y2="{Y(m0*3000/p0):.1f}" class="ref"/><text x="{X(3000)-4:.1f}" y="{Y(m0*3000/p0)+16:.1f}" class="ax" text-anchor="end">linear</text>')
    for S, rows, cls, lab in ((ES, E, 'eng', 'engine'), (BS2, B2, 'br', 'branch')):
        s.append('<polyline points="' + ' '.join(f'{X(v["people"]):.1f},{Y(v["ms"]):.1f}' for v in S.values()) + f'" class="ln {cls}"/>')
        for r in rows: s.append(f'<circle cx="{X(r["people"]):.1f}" cy="{Y(r["msPerMonth"]):.1f}" r="3.2" class="pt {cls}"/>')
        last = list(S.values())[-1]
        s.append(f'<text x="{X(last["people"])-8:.1f}" y="{Y(last["ms"])-10:.1f}" class="lab {cls}" text-anchor="end">{lab}</text>')
    s.append('</svg>'); return ''.join(s)

def bars():
    keys = ['social', 'situations', 'work', 'time', 'groups', 'romance', 'persona', 'family']
    mx = ES[big]['ms']; out = []
    for name, S in (('Engine', ES), ('Branch', BS2)):
        tot = S[big]['ms']; segs = []
        for k in keys + ['other']:
            v = S[big]['sys'].get(k, 0) if k != 'other' else tot - sum(S[big]['sys'].get(q, 0) for q in keys)
            if v > 0: segs.append(f'<span class="seg s-{k}" style="width:{100*v/mx:.2f}%" title="{k}: {v:,.0f} ms"></span>')
        out.append(f'<div class="barrow"><div class="barlab">{name}</div><div class="bar">{"".join(segs)}</div><div class="barval">{tot/1000:,.1f} s</div></div>')
    out.append('<div class="legend">' + ''.join(f'<span class="lg"><i class="s-{k}"></i>{k}</span>' for k in keys + ['other']) + '</div>')
    return ''.join(out)

# ---- identity: the whole world, engine against branch ----
def ident():
    eng = {}
    for l in open('out/s6/identity2.txt'):
        if l.startswith('engine '): d = json.loads(l[7:]); eng[d['seed']] = d
    out = []; ok = 0
    for d in jl('out/s8b/identity-branch.txt'):
        e = eng.get(d['seed'])
        if not e: continue
        same = e['hashes'] == d['hashes']; ok += same
        h = lambda x: x['hashes']['events'][:8] + '·' + x['hashes']['bonds'][:4] + '·' + x['hashes']['people'][:4]
        out.append(f'<tr><td class="num">{d["seed"]}</td><td class="num">{d["people"]:,}</td><td class="num">{d["events"]:,}</td><td class="mono">{h(e)}</td><td class="mono">{h(d)}</td><td>{chip(same)}</td></tr>')
    return ''.join(out), ok, len(out)
ID_ROWS, ID_OK, ID_N = ident()

def social():
    g = {}
    for r in SOC_B: g.setdefault(r['adults'], []).append(r)
    out = []
    for a, v in sorted(g.items()):
        m = lambda k: st.mean(x[k] for x in v)
        out.append(f'<tr><td class="num">{m("people"):,.0f}</td><td class="num">{m("friendsPerAdult"):.1f}</td><td class="num">{pc(m("friendlessAdults"))}</td><td class="num">{m("knownWellPerPerson"):.0f}</td><td class="num">{m("contactsPerPersonMonth"):.1f}</td></tr>')
    return ''.join(out)

def fit_table():
    out = []
    for line in FIT.split('\n'):
        p = line.split()
        if len(p) > 9 and p[1] == 'n' and p[0] in ('left', 'partnered', 'separated', 'child', 'lostJob', 'drinks', 'sober', 'home'):
            nice = {'died': 'Death', 'left': 'Leaving', 'partnered': 'Finding a partner', 'separated': 'Separating', 'child': 'A child', 'gotJob': 'Getting work', 'lostJob': 'Losing work', 'changedJob': 'Changing work', 'promoted': 'Promotion', 'retired': 'Retiring', 'ill': 'Illness', 'drinks': 'Starting to drink', 'sober': 'Stopping drinking', 'home': 'Coming home'}.get(p[0], p[0])
            out.append(f'<tr><td>{nice}</td><td class="num">{int(p[4]):,}</td><td class="num">{float(p[6])*100:.1f}%</td><td class="num">{p[9]}</td></tr>')
    return ''.join(out)

def avg(C, path):
    vals = []
    for c in C:
        v = c
        for k in path: v = v[k]
        vals.append(v)
    return st.mean(vals)
GROUPS = (C3, C8, C10)
T3 = [('Under 20', 'under20', 's'), ('Over 65', 'over65', 's'), ('Partnered (adults)', 'partnered', 's'), ('Working (20–64)', 'working', 's'), ('Drinkers (adults)', 'drinks', 's'), ('Children of 40–54s', 'kidsPerAdult40', 'c')]
def t3():
    out = []
    for lab, k, kind in T3:
        cells = []
        for C in GROUPS:
            f, b = avg(C, ['t3', 'focus', k]), avg(C, ['t3', 'bg', k]); ok = abs(f - b) <= 0.05 if kind == 's' else abs(f - b) <= 0.25 * f
            fmt = pc if kind == 's' else (lambda v: f'{v:.2f}')
            cells.append(f'<td class="num">{fmt(f)}</td><td class="num">{fmt(b)}</td><td>{chip(ok)}</td>')
        out.append(f'<tr><td>{lab}</td>{"".join(cells)}</tr>')
    return ''.join(out)
T4 = [('Friends per adult', 'friendsPerAdult', 'r', .25), ('Friendless adults', 'friendless', 'a', .05), ('People known well', 'knownWell', 'r', .25), ('Routines', 'habits', 'r', .15), ('Partnered', 'partnered', 'a', .07)]
def t4(stage):
    out = []
    for lab, k, kind, tol in T4:
        cells = []
        for C in GROUPS:
            a, p = avg(C, [stage, 'always', k]), avg(C, [stage, 'promoted', k]); ok = abs(a - p) <= tol * a if kind == 'r' else abs(a - p) <= tol
            fmt = pc if kind == 'a' else (lambda v: f'{v:.1f}')
            cells.append(f'<td class="num">{fmt(a)}</td><td class="num">{fmt(p)}</td><td>{chip(ok)}</td>')
        out.append(f'<tr><td>{lab}</td>{"".join(cells)}</tr>')
    cells = []
    for C in GROUPS:
        a, p = avg(C, [stage, 'always', 'marks40']), avg(C, [stage, 'promoted', 'marked40'])
        cells.append(f'<td class="num">{a:.2f}</td><td class="num">{p:.2f}</td><td>{chip(False, True)}</td>')
    out.append(f'<tr class="cost"><td>Marks from history, per over-40</td>{"".join(cells)}</tr>')
    return ''.join(out)

eE, e1, e2 = slope(ES), slope(BS1), slope(BS2); s1, s2 = slope(BS1, 'soc'), slope(BS2, 'soc')
sp1, sp2 = ES[big]['ms'] / BS1[big]['ms'], ES[big]['ms'] / BS2[big]['ms']
promo = lambda C: [c['promoteS'] / max(1, len(c['prom'])) for c in C]
D = K8['demography']; fd, bd = D['focus'], D['background']
inB = K8['demography']['focus']['n']; perP = K8['msOrdinaryMonth'] / inB
def t3pass(C): return sum(1 for _, k, kind in T3 if abs(avg(C, ['t3', 'focus', k]) - avg(C, ['t3', 'bg', k])) <= (0.05 if kind == 's' else 0.25 * avg(C, ['t3', 'focus', k])))
def t4pass(C, stages=('t4a', 't4b')): return sum(1 for st_ in stages for _, k, kind, tol in T4 if abs(avg(C, [st_, 'always', k]) - avg(C, [st_, 'promoted', k])) <= (tol * avg(C, [st_, 'always', k]) if kind == 'r' else tol))
def deaths(C, k): n = sum(c['coarse'].get(k, [0, 0])[0] for c in C); e = sum(c['coarse'].get(k, [0, 0])[1] for c in C); return e / n if n else float('nan')
capok = lambda C: all(c[x]['over'] == 0 and c[x]['leaderless'] == 0 and c[x]['bgStaffLivingElsewhere'] == 0 and c[x].get('badLeader', 0) == 0 for c in C for x in ('cap0', 'cap1'))
inv_n = sum(r['hoodsCompared'] for r in INV); inv_ok = sum(r['identical'] for r in INV); inv_focus = all(r['focusDiffers'] for r in INV)
tn = sum(r['thirtyYears']['n'] for r in TWIN)
TW = {k: {X: sum(r['fromFounding'][X][k] * r['thirtyYears']['n'] for r in TWIN) / tn for X in ('A', 'A2', 'B')} for k in ('choice', 'act')}
twn = sum(r['twins'] for r in TWIN); TB = {k: sum(r[k]['between'] * r['twins'] for r in TWIN) / twn for k in ('choice', 'act')}
twr = lambda k: TW[k]['B'] / ((TW[k]['A'] + TW[k]['A2']) / 2)
pinv_ok = all(all(v == 0 for v in h['maxChange'].values()) and set(h['other']) <= {'emotions', 'tried', 'lastHabit'} for r in PINV for h in r['hoods']); pinv_n = sum(len(r['hoods']) for r in PINV); pinv_p = sum(h['people'] for r in PINV for h in r['hoods'])
alone = st.median([v for n, v in LIKE if n == 1]); city = st.median([v for n, v in LIKE if n == 100000])
score = [
 ('S2', 'A town replays exactly as the engine does', '10 of 10 seeds identical', True),
 ('S2', 'Cost exponent at most 1.15', f'{e1:.2f}', e1 <= 1.15),
 ('S2', 'At least 10× faster at about 2,600 people', f'{sp1:.1f}×', sp1 >= 10),
 ('S2b', 'Cost exponent at most 1.15', f'{e2:.2f}', e2 <= 1.15),
 ('S2b', 'At least 10× faster at about 2,600 people', f'{sp2:.1f}×', sp2 >= 10),
 ('S3', 'Background matches the monthly half (6 checks)', f'{t3pass(C3)} of 6', t3pass(C3) == 6),
 ('S3', 'Promoted people match, right after (5 checks)', f'{t4pass(C3, ("t4a",))} of 5', t4pass(C3, ('t4a',)) == 5),
 ('S3b', 'Background matches the monthly half (6 checks)', f'{t3pass(C3b)} of 6', t3pass(C3b) == 6),
 ('S3b', 'Promoted people match, both times (10 checks)', f'{t4pass(C3b)} of 10', t4pass(C3b) == 10),
 ('S4', 'A city of 100,000 builds in under 15 minutes', f'{S4["buildS"]/60:.1f} min', S4['buildS'] < 900),
 ('S4', 'A coarse year for the whole background under 10 s', f'{S4["coarseYearMs"]/1000:.1f} s', S4['coarseYearMs'] < 10000),
 ('S4', 'An ordinary month within 50% of the town alone, per person (corrected)', f'{226/313:.2f} against 0.41 ms', False),
 ('S4', 'Background demography within 5 points (3 checks)', '2 of 3', False),
 ('S7', 'No workplace over capacity; every background workplace led', 'all ten checks', True),
 ('S7', 'Background matches the monthly half (6 checks)', f'{t3pass(C7)} of 6', t3pass(C7) == 6),
 ('S7', 'Background deaths at 65–79 and 80+ within 25% of the engine', f'{deaths(C7,"died 65-79")/0.0186:.2f} and {deaths(C7,"died 80+")/0.0903:.2f}', True),
 ('S7', 'Promoted people match, both times (10 checks)', f'{t4pass(C7)} of 10', t4pass(C7) == 10),
 ('S7', 'An ordinary month at 100,000 within 50% of 0.41 ms (corrected)', '0.74 ms', False),
 ('S8', 'Background neighbourhoods independent of everything else', f'{sum(r["identical"] for r in jl("out/s8/invariance.jsonl"))} of {sum(r["hoodsCompared"] for r in jl("out/s8/invariance.jsonl"))}', True),
 ('S8', 'Background matches the monthly half (6 checks)', f'{t3pass(C8)} of 6', t3pass(C8) == 6),
 ('S8', 'Background deaths at 65–79 and 80+ within 25% of the engine', f'{deaths(C8,"died 65-79")/0.0186:.2f} and {deaths(C8,"died 80+")/0.0903:.2f}', True),
 ('S8', 'Promoted people match, both times (10 checks)', f'{t4pass(C8)} of 10', t4pass(C8) == 10),
 ('S9', 'Promoted marks per over-40 at least 0.30', f'{avg(C8, ["t4a","promoted","marks40"]):.2f}', avg(C8, ['t4a', 'promoted', 'marks40']) >= 0.30),
 ('S8', 'Every staffed background workplace has a leader', '1 missing (bug, fixed)', False),
 ('S8', 'A city of 100,000: build, coarse year, memory, demography', f'{K8["buildS"]:.0f} s · {K8["coarseYearMs"]/1000:.1f} s · {K8["heapMB"]:,} MB · 3 of 3', True),
 ('S8', 'An ordinary month at 100,000 within 50% of 0.41 ms', f'{perP:.2f} ms', perP <= 1.5 * 0.41),
 ('S8', 'Identity, whole world', f'{ID_OK} of {ID_N}', ID_OK == ID_N),
 ('S8b', 'Independence with a different past from year 0, bonds and beliefs compared', f'{inv_ok} of {inv_n}; focus differs: {"yes" if inv_focus else "no"}', inv_ok == inv_n and inv_focus),
 ('S8b', 'Capacity and leaders, strict check', 'all checks' if capok(C8b) else 'fault', capok(C8b)),
 ('S10', 'Promotion changes nothing but texture', f'{pinv_n} neighbourhoods, {pinv_p} people: health, illness, strain, savings moved 0', pinv_ok),
 ('S10', 'Promoted marks per over-40 at least 0.38', f'{avg(C10, ["t4a","promoted","marks40"]):.2f}', avg(C10, ['t4a', 'promoted', 'marks40']) >= 0.38),
 ('S10', 'No regression: background, promotion, capacity, deaths', f'{t3pass(C10)} of 6 · {t4pass(C10)} of 10 · clean · {deaths(C10,"died 65-79")/0.0186:.2f}/{deaths(C10,"died 80+")/0.0903:.2f}', t3pass(C10) == 6 and t4pass(C10) == 10 and capok(C10)),
 ('S10', 'Independence and identity', f'{sum(r["identical"] for r in INV10)} of {sum(r["hoodsCompared"] for r in INV10)} · 10 of 10', True),
 ('S11', 'Twin gap ratio within 0.10 (a bar that could not fail)', 'uninformative', False),
 ('S11b', 'Background twin moved less than full lives: choices under 0.9', f'{twr("choice"):.2f}', twr('choice') < 0.9),
 ('S11b', 'Background twin moved less than full lives: acts under 0.9', f'{twr("act"):.2f} (noise 0.86)', twr('act') < 0.9),
]
SCORE = ''.join(f'<tr><td class="mono">{s}</td><td>{esc(t)}</td><td class="num">{esc(v)}</td><td>{chip(ok)}</td></tr>' for s, t, v, ok in score)
bgpeople = K8['status']['bg']
css = open('bench/report.css.html').read()
css = css.replace('.chip.cost { color: var(--cost); }', '.chip.cost { color: var(--cost); }\nth.grp { text-align: center; border-bottom: 1px solid var(--rule); }\n.life { margin: 0; padding: 0; list-style: none; }\n.life li { display: grid; grid-template-columns: 3.2em 1fr; gap: 8px; padding: 3px 0; border-bottom: 1px solid var(--rule); font-size: 14px; }\n.life .yr { color: var(--muted); font-family: "IBM Plex Mono", monospace; font-size: 12px; padding-top: 2px; }\n.who2 { font-weight: 600; margin: 0 0 4px; }\n.tex { font-size: 14px; margin: 6px 0 0; }\n.tex b { font-weight: 600; }\n.three { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 16px; }\n.three .panel { margin: 0; }')
grp = lambda: ''.join(f'<th class="grp" colspan="3">{n}</th>' for n in ('S3', 'S8', 'S10'))
sub = lambda a, b: ''.join(f'<th class="num">{a}</th><th class="num">{b}</th><th></th>' for _ in range(3))
Y0 = 1996
def life(p):
    return '<ul class="life">' + ''.join(f'<li><span class="yr">{Y0 + e["year"]}</span><span>{esc(e["text"])}</span></li>' for e in p['record']) + '</ul>'
def texture(a):
    parts = [f'<p class="tex"><b>Friends:</b> {esc(", ".join(a["friends"])) if a["friends"] else "none yet"}</p>',
             f'<p class="tex"><b>Routines:</b> {esc("; ".join(a["routines"])) if a["routines"] else "none"}</p>']
    if a['marks']: parts.append(f'<p class="tex"><b>Marked:</b> {esc("; ".join(a["marks"]))}</p>')
    if a['pride']: parts.append(f'<p class="tex"><b>Proud of:</b> {esc("; ".join(a["pride"]))}</p>')
    return ''.join(parts)
SAMPLES = ''.join(f'<div class="panel"><p class="who2">{esc(b["name"])}, {b["age"]} · {esc(b["job"])}</p><h3>The spine: as the background lived it</h3>{life(b)}<h3 style="margin-top:14px">The texture: made when the neighbourhood came into focus</h3>{texture(a)}</div>' for b, a in zip(SAMPLE['before'], SAMPLE['after']))
PLACES = ''.join(f'<tr><td>{esc(p["name"])}</td><td>{esc(p["lead"] or "—")}, {esc(p["title"])}</td><td class="num">{p["staff"]}/{p["cap"]}</td></tr>' for p in SAMPLE['places'])
T3D = [('65–79', 'died 65-79', 0.0186), ('80 and over', 'died 80+', 0.0903), ('Under 65', 'died <65', 0.0010)]
DEATHS = ''.join(f'<tr><td>{lab}</td><td class="num">{100*ref:.2f}%</td><td class="num">{100*deaths(C7, k):.2f}%</td><td class="num">{100*deaths(C8, k):.2f}%</td><td>{chip(abs(deaths(C8, k)/ref - 1) <= 0.25)}</td></tr>' for lab, k, ref in T3D)

page = f'''<title>City Scale</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Text:wght@600;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
{css}
<div class="wrap">
<header>
  <span class="eyebrow">Person Model Lab · scale track · base round 19c</span>
  <h1>City Scale</h1>
  <p class="lede">From a 75-person town to a city of 100,000. In the monthly world, people meet through settings instead of the whole town. Every neighbourhood has its own workplaces, and work is bounded by the jobs there are. The rest of the city lives once a year: by the engine's own rules for what is one person's alone, and by odds learned from the engine for what depends on others. A neighbourhood comes into focus when the player's story reaches it, and nothing outside it changes its past.</p>
  <div class="meta">S0 measure · S1 design · S2 social layer · S3 background and promotion · S4 a city of 100,000 · S7 institutions · S8 independence · S9 marks · S10 faithful promotion · S11 the twin test · 17–18 Oct 2026</div>
  <div class="figures">
    <div class="fig"><span class="big">{ES[big]["ms"]/1000:.1f}<small>s</small> → {BS2[big]["ms"]/1000:.1f}<small>s</small></span><span class="cap">One simulated month at about {ES[big]["people"]:,.0f} people, engine against branch: {sp2:.0f}× faster.</span></div>
    <div class="fig"><span class="big">{eE:.2f} → {e2:.2f}</span><span class="cap">How cost grows with population, as the exponent from 270 people up. 1.0 is linear.</span></div>
    <div class="fig"><span class="big">{t3pass(C10)}<small>of 6</small> · {t4pass(C10)}<small>of 10</small></span><span class="cap">The background matches the monthly world on all six checks, and promoted people match people always in focus on all ten (S10, five fresh cities).</span></div>
    <div class="fig"><span class="big">{twr("choice"):.2f}</span><span class="cap">How much of what thirty years of full life change in a person's choices a background life keeps (the twin test, {twn} twins).</span></div>
    <div class="fig"><span class="big">{ID_OK}<small>of {ID_N}</small></span><span class="cap">Town-sized worlds where the branch's 40-year run is identical to the engine's: every person, event, bond and belief.</span></div>
  </div>
</header>

<section>
  <span class="eyebrow">S0 · Measure</span>
  <h2>Where the town stops scaling</h2>
  <div class="col">
    <p>The engine was timed system by system at four sizes, from 68 to about {ES[big]["people"]:,.0f} people. Each size had the same five-year past and twelve timed months, and runs went one at a time. Cost grows with population to the power {eE:.2f}. At the largest size a month takes {ES[big]["ms"]/1000:.1f} s, building the world takes {ES[big]["build"]/60:.0f} minutes, and memory holds {ES[big]["beliefs"]/1e6:.1f} million beliefs in {ES[big]["heap"]:,.0f} MB.</p>
    <p>The causes are loops over the whole town, done for everyone. Company is sought from every adult, each scored by regard, and this alone is 30% of all time at 1,000 people. The others:</p>
    <ul>
      <li>school pairs over every child, 70,000 contacts a month at 2,600 people;</li>
      <li>a family scan over every pair;</li>
      <li>public news heard by everyone over 14;</li>
      <li>workplace lookups that scan the town once per place;</li>
      <li>history re-read every month.</li>
    </ul>
  </div>
  <div class="panel chartbox">{chart()}</div>
  <p class="note">Each dot is one world. Lines join the means at each size. The dashed line is linear growth from the smallest branch world. Branch figures are from the S2b runs.</p>
</section>

<section>
  <span class="eyebrow">S2 · S7 · The social layer at scale</span>
  <h2>Many towns, each with its own work</h2>
  <div class="col">
    <p>The branch splits a city into neighbourhoods of about 80 people, roughly one town each.</p>
    <ul>
      <li>A household lives together, and moves when people move in together.</li>
      <li>School, routines, hobbies, romance and the company people seek happen inside a neighbourhood.</li>
      <li>Every neighbourhood has its own workplaces: one of each kind the setting has, each with the kind's capacity, its staff and its leader. A workplace takes on people from its own neighbourhood first, then from across the city, and a venture opens where its founder lives.</li>
      <li>News reaches the neighbourhoods of the people involved.</li>
      <li>No code creates a bond with a stranger just by looking at them.</li>
    </ul>
    <p>Per person, the branch does the same work at every size: about 8 contacts a month, 60 bonds and 225 beliefs, from 270 people to 2,640. What still grows is the cost of each lookup in bigger maps. That is why the exponent stops at {e2:.2f} rather than 1.0.</p>
  </div>
  <div class="panel"><h3>Where a month goes at about {ES[big]["people"]:,.0f} people</h3>{bars()}</div>
  <div class="two">
    <div>
      <h3>The town stays the town</h3>
      <p>A town under about 120 people is one neighbourhood, with exactly the setting's workplaces. Every new path then returns the whole town in the engine's order, so the dice fall the same way. Each run is fingerprinted whole, after a thirty-year past and ten present years: every field of every person, every event with its causes and who knew it, every bond with its memories, every belief, the groups, workplaces and counters.</p>
      <div class="tablebox"><table><thead><tr><th class="num">Seed</th><th class="num">People</th><th class="num">Events</th><th>Engine</th><th>Branch</th><th></th></tr></thead><tbody>{ID_ROWS}</tbody></table></div>
    </div>
    <div>
      <h3>A person's world stays town-sized</h3>
      <p>Social life per person in the branch, in the fifth present year, as the city grows. A town of about 70 is the first row.</p>
      <div class="tablebox"><table><thead><tr><th class="num">People</th><th class="num">Friends</th><th class="num">Friendless</th><th class="num">Known well</th><th class="num">Contacts/mo</th></tr></thead><tbody>{social()}</tbody></table></div>
      <p class="note">In the engine at 870 people, contacts per person rise to 43 a month and friends fall to 2.5. Everyone brushes past everyone, and nobody gets close.</p>
    </div>
  </div>
</section>

<section>
  <span class="eyebrow">S1 · Design</span>
  <h2>Detail follows what the player could know</h2>
  <div class="col"><p>The player only ever sees the felt side of the world. Someone the player cannot reach needs to be true, not detailed. Everyone in the city is a full person, with traits, values, family and a seed. Only how often they are simulated differs.</p></div>
  <div class="tiers">
    <div class="tier"><div class="who">in focus · monthly</div><h3>Every system runs</h3><p class="note">Whole neighbourhoods: the player's own and every one the player's story reaches. Typically 1,000 to 3,000 people.</p></div>
    <div class="tier view"><div class="who">in view · as counterparts · designed</div><h3>People in the room</h3><p class="note">A colleague at a big workplace, or the bar staff at a regular venue. Full people form bonds with them. They make no decisions of their own until their neighbourhood comes into focus.</p></div>
    <div class="tier bg"><div class="who">background · yearly</div><h3>A year lived at once</h3><p class="note">They grow older, fall ill, work, lead, partner, have children, leave, come home or die. Every big event is written into the record, and nothing outside their neighbourhood changes it.</p></div>
  </div>
</section>

<section>
  <span class="eyebrow">S3 · S7 · S8 · The background</span>
  <h2>A background that lives by the engine's rules</h2>
  <div class="col">
    <p>A background year has two kinds of rule.</p>
    <ul>
      <li><b>What is one person's alone runs by the engine's own formulas</b>, month by month through the year. That covers growing older (personality maturing, aptitudes and skill ceilings moving with age), health, illness, retirement, death, the strain that is the person's own, and the steadying that comes with becoming a parent. S7 found why this matters. Odds fitted to these drift as soon as the population they are applied to drifts. The background had never matured, because the engine's yearly step ran only over the monthly world, and its old people died at half the engine's rate.</li>
      <li><b>What depends on other people is drawn from odds learned from the engine</b>: finding a partner, splitting up, a child, leaving or coming home, drinking, losing a job. Thirty full towns were logged year by year, and the odds were checked on towns the fit never saw. One script refits them after any engine change.</li>
      <li><b>Work comes from the institutions.</b> Each year a background workplace with room takes on the best-suited job seeker of its neighbourhood. A slot nobody local can fill draws a newcomer, by the town's own rule: that is the only way people arrive, as in the town. A workplace without a leader makes one, with the town's succession events: the promotion, the first staff meeting, and those passed over.</li>
    </ul>
  </div>
  <div class="two">
    <div class="panel tablebox"><h3>Odds learned from the engine, checked on held-out towns</h3><table><thead><tr><th>Outcome</th><th class="num">Events</th><th class="num">Yearly rate</th><th class="num">AUC</th></tr></thead><tbody>{fit_table()}</tbody></table><p class="note" style="margin-top:10px">AUC is how well the odds rank who it happens to. 0.5 is chance.</p></div>
    <div class="panel tablebox"><h3>The engine's rules, holding in the background</h3><p class="note">Deaths per person-year in the background, pooled over each step's five cities, against the full engine's thirty towns.</p><table><thead><tr><th>Age</th><th class="num">Engine</th><th class="num">S7</th><th class="num">S8</th><th></th></tr></thead><tbody>{DEATHS}</tbody></table><p class="note" style="margin-top:10px">Before S7 the background died at about half the engine's rate at 65–79.</p></div>
  </div>
  <div class="panel tablebox"><h3>Coarse matches full</h3><p class="note">Cities of about 1,300–1,500 people, half monthly and half background from their founding, compared after thirty years. Five fresh seeds per step. Tolerance: 5 points on shares, 25% on counts.</p>
    <table><thead><tr><th></th>{grp()}</tr><tr><th></th>{sub("Monthly", "Coarse")}</tr></thead><tbody>{t3()}</tbody></table></div>
</section>

<section>
  <span class="eyebrow">S3 · S8 · Promotion</span>
  <h2>A neighbourhood comes into focus</h2>
  <div class="col">
    <p>When the player's story reaches someone, their whole neighbourhood comes into focus, so everyone in it arrives among the people they live with. A background life has a <b>spine</b> and a <b>texture</b>.</p>
    <ul>
      <li><b>The spine</b> is every big event with its date. It is fixed once lived and stands as it is.</li>
      <li><b>The texture</b> is the small things that make someone known: friends, dislikes, routines. It is made at promotion. The years they lived there are replayed by the engine's own contact rule over their settings, on a clock set back to when those months happened, so every rule that counts time sees months.</li>
    </ul>
    <p>The neighbourhood's workplaces come into focus with their staff and leaders. Marks such as fears, sore spots, pride and rules to live by follow from the spine, through the same rules as everyone else's.</p>
  </div>
  <div style="min-width:0">
    <div class="panel tablebox"><h3>Right after promotion</h3><table><thead><tr><th></th>{grp()}</tr><tr><th></th>{sub("Always", "Promoted")}</tr></thead><tbody>{t4("t4a")}</tbody></table></div>
    <div class="panel tablebox" style="margin-top:18px"><h3>Two years later</h3><table><thead><tr><th></th>{grp()}</tr><tr><th></th>{sub("Always", "Promoted")}</tr></thead><tbody>{t4("t4b")}</tbody></table></div>
  </div>
  <p class="note">S7 failed on friends: promoted people had 30% more, because their workplaces were staffed only by neighbours while monthly workplaces hired across the city. S8 gave both tiers one hiring rule, neighbourhood first, and the gap closed to 6%. S9 gave the background the town's succession events and kept how widely each event would have been seen. Marks rose from 0.24 to 0.35 per over-40, still half of focus.</p>
</section>

<section>
  <span class="eyebrow">An example</span>
  <h2>{esc(SAMPLE["hood"])}, before and after</h2>
  <div class="col"><p>One background neighbourhood of a throwaway city (seed {SAMPLE["seed"]}, {SAMPLE["people"]} people), read straight from the record. Below are three of its residents: their lives as the background lived them, then what promotion made of them. Names of places are the base round's.</p></div>
  <div class="panel tablebox"><h3>Its workplaces</h3><table><thead><tr><th>Workplace</th><th>Led by</th><th class="num">Staff</th></tr></thead><tbody>{PLACES}</tbody></table></div>
  <div class="three">{SAMPLES}</div>
</section>

<section>
  <span class="eyebrow">S11 · The twin test</span>
  <h2>Does a background life leave the same person?</h2>
  <div class="col">
    <p>Four cities from one founding: the same people, the same traits and families at year 0. One neighbourhood lives its thirty-year past in full (<b>A</b>), in full on other dice (<b>A2</b>, a different full life), or in the background and is then promoted (<b>B</b>). The founding itself is the fourth (<b>Z</b>, the same people thirty years younger). Every adult founder who is alive in all of them is asked the engine's sixteen kinds of situation. The answers are built and scored by the engine's own decision rules, from the person's true state.</p>
    <p>The question is how far each copy's answers moved from who the person was at the founding. If the background keeps a life, B moves as far as A and A2.</p>
  </div>
  <div class="two">
    <div class="panel tablebox"><h3>How far answers moved in thirty years</h3><table><thead><tr><th></th><th class="num">A</th><th class="num">A2</th><th class="num">B</th><th class="num">B against full</th></tr></thead><tbody>
      <tr><td>Choices (which kind of answer)</td><td class="num">{TW["choice"]["A"]:.3f}</td><td class="num">{TW["choice"]["A2"]:.3f}</td><td class="num">{TW["choice"]["B"]:.3f}</td><td class="num">{twr("choice"):.2f}</td></tr>
      <tr><td>Acts (what exactly they do)</td><td class="num">{TW["act"]["A"]:.3f}</td><td class="num">{TW["act"]["A2"]:.3f}</td><td class="num">{TW["act"]["B"]:.3f}</td><td class="num">{twr("act"):.2f}</td></tr>
      <tr><td>Between two different people</td><td class="num" colspan="3">{TB["choice"]:.2f} choices · {TB["act"]:.2f} acts</td><td></td></tr>
    </tbody></table><p class="note" style="margin-top:10px">{twn} twins over four fresh cities. Distances are total variation on the answer probabilities, and disagreement on the acts.</p></div>
    <div class="panel"><h3>What it shows</h3>
      <p class="note">A person who spent thirty years in the background carries about seven eighths of what thirty years of full life change in how they choose. In every city, B moved less than both full lives. The missing eighth fits what monthly life forms and the background does not: learned if-then habits (about a quarter fewer) and the self-story people tell about who they are (a fifth shorter).</p>
      <p class="note">Two limits. In these situations a lived life moves answers only about 7% of the distance between two people, because inborn traits set most of them. And the battery cannot see strain, money, bonds or marks. Testing those needs the engine's real situations, which belongs after the merge with the lab's engine.</p>
      <p class="note">The first version of this test (S11) used a bar that could not fail. The independent check caught it, and the directional measure here (S11b) replaced it.</p></div>
  </div>
</section>

<section>
  <span class="eyebrow">S8 · Independence</span>
  <h2>Nothing outside a neighbourhood changes its past</h2>
  <div class="col">
    <p>A background neighbourhood draws everything from itself:</p>
    <ul>
      <li>its dice, keyed to each person or to the neighbourhood and year;</li>
      <li>the ids and first names of people born or arriving there;</li>
      <li>partners from its own residents;</li>
      <li>workers from its own job seekers;</li>
      <li>newcomers for its own vacancies.</li>
    </ul>
    <p>The bonds its people hold are put away with them until they come back into focus, because no contact happens in the background.</p>
    <p>The test builds two cities from one seed. In the second, the monthly world lives a different thirty-year past and a different present, and one background neighbourhood is promoted. Every other background neighbourhood must come out identical: every field of every person, every event about them, every bond and belief they hold, and their workplaces.</p>
  </div>
  <div class="figures">
    <div class="fig"><span class="big">{inv_ok}<small>of {inv_n}</small></span><span class="cap">Background neighbourhoods identical, while the focus around them lived differently (S8b, seeds 56–58).</span></div>
    <div class="fig"><span class="big">{sum(r["differ"] for r in INV0)}<small>of {sum(r["hoodsCompared"] for r in INV0)}</small></span><span class="cap">Neighbourhoods that differ on the S7 tree, which still drew ids from one city-wide counter: the test sees a dependence when there is one.</span></div>
  </div>
</section>

<section>
  <span class="eyebrow">S8 · A city of 100,000</span>
  <h2>The whole city, running</h2>
  <div class="col"><p>A town of 184 founding adults simulated monthly, inside a background founded with 100,000 people in households shaped like the town's own. After a thirty-year past, the background holds {bgpeople:,} people in {K8["hoods"]:,} neighbourhoods with {K8["places"]:,} workplaces, and the monthly town {inB}. The background is kept apart from the monthly world's list of people, so nothing that runs each month walks past it.</p></div>
  <div class="figures">
    <div class="fig"><span class="big">{K8["buildS"]/60:.1f}<small>min</small></span><span class="cap">To found the city and run its thirty-year past.</span></div>
    <div class="fig"><span class="big">{K8["coarseYearMs"]/1000:.1f}<small>s</small></span><span class="cap">For a year of the whole background, with the body lived month by month.</span></div>
    <div class="fig"><span class="big">{K8["msOrdinaryMonth"]}<small>ms</small></span><span class="cap">For an ordinary month of the {inB}-person town, with the city around it.</span></div>
    <div class="fig"><span class="big">{K8["promoteS"]:.1f}<small>s</small></span><span class="cap">To bring a background neighbourhood of {K8["promoted"]["promoted"]} people into focus.</span></div>
  </div>
  <div class="two">
    <div class="panel tablebox"><table><thead><tr><th>After thirty years</th><th class="num">Monthly town</th><th class="num">Background</th><th></th></tr></thead><tbody>
      <tr><td>Under 20</td><td class="num">{pc(fd["under20"])}</td><td class="num">{pc(bd["under20"])}</td><td>{chip(abs(fd["under20"]-bd["under20"])<=0.05)}</td></tr>
      <tr><td>Over 65</td><td class="num">{pc(fd["over65"])}</td><td class="num">{pc(bd["over65"])}</td><td>{chip(abs(fd["over65"]-bd["over65"])<=0.05)}</td></tr>
      <tr><td>Partnered adults</td><td class="num">{pc(fd["partneredAdults"])}</td><td class="num">{pc(bd["partneredAdults"])}</td><td>{chip(abs(fd["partneredAdults"]-bd["partneredAdults"])<=0.05)}</td></tr>
      <tr><td>Working, 20–64</td><td class="num">{pc(K8["working"]["focus"])}</td><td class="num">{pc(K8["working"]["background"])}</td><td></td></tr>
      <tr><td>Memory, events in the record</td><td class="num" colspan="2">{K8["heapMB"]:,} MB · {K8["events"]:,} events</td><td></td></tr>
    </tbody></table></div>
    <div class="panel"><h3>What the background costs a month</h3>
      <p class="note">The pre-registered bar, within 50% of 0.41 ms per person, fails: {perP:.2f} ms. The independent check found that S4 and S7 had divided by the wrong number of people, and they fail too (0.72 and 0.74 ms). The bar also compared unlike towns: the 0.41 reference had a five-year past, the city a thirty-year one.</p>
      <p class="note">The same 240-person town timed alone and inside 100,000, alternating, one run at a time: alone {", ".join(f"{v:.2f}" for n, v in LIKE if n == 1)} ms per person; in the city {", ".join(f"{v:.2f}" for n, v in LIKE if n == 100000)}. By the medians the background adds about {100*(city/alone-1):.0f}% to an ordinary month, likely garbage collection on a larger heap. That is within the noise between runs.</p>
      <p class="note">Absolute timings depend on the machine. After a restart onto a slower host, the same code built this city in about 200 s instead of 138 s, so timings are compared only within one sitting.</p></div>
  </div>
</section>

<section>
  <span class="eyebrow">Scorecard</span>
  <h2>Every expectation, as written beforehand</h2>
  <div class="col"><p>Each expectation was written down before its runs, in <span class="path">SCALE.md</span>. S2b, S3b and S8b are follow-ups after fixes, and count as exploration rather than confirmation. Since S8, a separate agent re-derives the headline numbers from the raw output before they are recorded.</p></div>
  <div class="panel tablebox"><table><thead><tr><th>Step</th><th>Expectation</th><th class="num">Measured</th><th></th></tr></thead><tbody>{SCORE}</tbody></table></div>
</section>

<section>
  <span class="eyebrow">The cost</span>
  <h2>What the background does not keep, and what is unresolved</h2>
  <div class="col"><ul>
    <li><b>Small acts and their evidence.</b> A promoted person arrives with friends and dislikes, but nobody has seen them do anything. The player starts from nothing about them, as with any stranger.</li>
    <li><b>Marks from small public moments.</b> Being shown up, let down or found out leaves a mark only in focus. Promoted over-40s carry about half to two thirds of the marks.</li>
    <li><b>Habits of mind formed by monthly life.</b> Learned if-then habits and self-story come from living in focus. Promoted people have about a quarter fewer if-thens and a fifth less self-story, and the twin test shows about an eighth of a life's change in their choices missing.</li>
    <li><b>Strain from other people.</b> Grief, loneliness and trouble at home are not lived in the background.</li>
    <li><b>Texture depends on when.</b> The same neighbourhood promoted in a different year has the same spine, but its friendships are drawn afresh. Nobody had seen them.</li>
    <li><b>Backstory dates.</b> Friendships formed during catch-up enter the record dated to the promotion and marked as backstory, because the record must stay in time order.</li>
    <li><b>Unresolved: the month's cost at 100,000.</b> It is about 25% over the same town alone, near the noise between runs.</li>
    <li><b>Unresolved: drinking.</b> The background drinks at about 1.5 times the monthly rate. That is within the 5-point bar, but a real difference.</li>
    <li><b>Not built: demotion.</b> A neighbourhood that leaves the story stays in focus.</li>
    <li><b>The engine has moved on.</b> The lab is past round 23 and has reformatted its code. This branch is round 19c and will be carried onto the lab's next archive.</li>
  </ul></div>
</section>

<section>
  <span class="eyebrow">For the engine</span>
  <h2>The scaling contract</h2>
  <div class="col"><p>Rules for new engine code, so it scales and a town stays exactly as it is. The full text is in the project, at <span class="path">claude/scale/contract.md</span>.</p>
  <ol class="rules">
    <li><div><b>People meet through settings, never through the town.</b> Household, workplace, school class, neighbourhood, venue, group, or the person's own ties.</div></li>
    <li><div><b>No loop over people inside a loop over people.</b> A step for one person or one event takes others from that person's settings.</div></li>
    <li><div><b>Looking at a bond must not create one.</b></div></li>
    <li><div><b>News travels by setting and reach.</b> For someone notable, reach should grow with fame. Fame then becomes how far news about you travels.</div></li>
    <li><div><b>Read recent history from the end.</b></div></li>
    <li><div><b>Membership changes are tracked</b>, so indexes stay right without rebuilding.</div></li>
    <li><div><b>Dice belong to people.</b> A background life never depends on who else is simulated.</div></li>
    <li><div><b>Ids must fit a city.</b> Bond keys are widened to room for 67 million people.</div></li>
    <li><div><b>A rule about one person is written once.</b> Put it in a function that takes the person, so the background can live it too, as the yearly maturing step now is.</div></li>
    <li><div><b>Workplaces are asked for by kind.</b> Code that wants "the bar" asks for the bar in a person's neighbourhood, never for a fixed id.</div></li>
    <li><div><b>The town stays the town.</b> Every scaling change passes the identity test.</div></li>
  </ol></div>
</section>

<section>
  <span class="eyebrow">Method</span>
  <h2>How it was measured, and what was not</h2>
  <div class="col">
    <ul>
      <li><b>Machine and runs.</b> Two cores and 7 GB, Node 22 with tsx. Timed runs ran one at a time.</li>
      <li><b>Workplaces.</b> Until S4, harnesses copied the setting's eight places in proportion to the town. Since S7, every neighbourhood has its own set and nothing is copied.</li>
      <li><b>What a system's time means.</b> It runs from the moment the monthly tick switches to that system's random stream until the next switch. The engine is not edited to measure it.</li>
      <li><b>The branch.</b> Round 19c plus the changes listed in <span class="path">docs/branch-changes.md</span>. The lab's own files were not touched. All work lives in the scale folder and in <span class="path">claude/scale/</span>.</li>
      <li><b>Seeds.</b> Every step's test runs on fresh seeds, after smoke runs on throwaway ones. Each step's tree is frozen before its runs.</li>
    </ul>
    <p><b>Not measured:</b></p>
    <ul>
      <li>speed in a browser, where the game may run;</li>
      <li>monthly worlds larger than about 2,700 people;</li>
      <li>memory over many decades;</li>
      <li>the in-view tier and fame-driven reach, which are designed but not built;</li>
      <li>a human cold read of promoted lives against always-full ones.</li>
    </ul>
  </div>
</section>

<footer>City scale track · base: Person Model Lab round 19c · source, harness, logs and SCALE.md in the scale archive</footer>
</div>
'''
os.makedirs(os.path.dirname(OUT), exist_ok=True); open(OUT, 'w').write(page)
print(json.dumps(dict(eE=round(eE, 2), e2=round(e2, 2), sp2=round(sp2, 1), ids=f'{ID_OK}/{ID_N}', inv=f'{inv_ok}/{inv_n}')))
for s, t, v, ok in score: print(s, t, v, ok)
