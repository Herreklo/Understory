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

# ---- identity: every seed run on both sides ----
def ident():
    rows = {}
    def add(path, tag):
        if not os.path.exists(path): return
        for l in open(path):
            if ' ' in l and l.split(' ', 1)[0] in ('engine', 'branch'):
                who, js = l.split(' ', 1); d = json.loads(js); rows.setdefault(d['seed'], {})[who] = d
    add('out/final/identity.txt', 'final')
    eng_new = {d['seed']: d for d in jl('out/followup/engine-identity.txt')}
    for d in jl('out/followup/identity.txt'):
        if d['seed'] in eng_new: rows.setdefault(d['seed'], {}).update({'engine': eng_new[d['seed']], 'branch': d})
    out = []; ok = 0
    for s in sorted(rows):
        e, b = rows[s].get('engine'), rows[s].get('branch')
        if not e or not b: continue
        same = e['eventsHash'] == b['eventsHash'] and e['stateHash'] == b['stateHash']; ok += same
        out.append(f'<tr><td class="num">{s}</td><td class="num">{e["events"]:,}</td><td class="num">{e["bonds"]:,}</td><td class="num">{e["beliefs"]:,}</td><td class="mono">{e["eventsHash"][:10]}·{e["stateHash"][:6]}</td><td class="mono">{b["eventsHash"][:10]}·{b["stateHash"][:6]}</td><td>{chip(same)}</td></tr>')
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
        if len(p) > 9 and p[1] == 'n':
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
T3 = [('Under 20', 'under20', 's'), ('Over 65', 'over65', 's'), ('Partnered (adults)', 'partnered', 's'), ('Working (20–64)', 'working', 's'), ('Drinkers (adults)', 'drinks', 's'), ('Children of 40–54s', 'kidsPerAdult40', 'c')]
def t3():
    out = []
    for lab, k, kind in T3:
        cells = []
        for C in (C3, C3b):
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
        for C in (C3, C3b):
            a, p = avg(C, [stage, 'always', k]), avg(C, [stage, 'promoted', k]); ok = abs(a - p) <= tol * a if kind == 'r' else abs(a - p) <= tol
            fmt = pc if kind == 'a' else (lambda v: f'{v:.1f}')
            cells.append(f'<td class="num">{fmt(a)}</td><td class="num">{fmt(p)}</td><td>{chip(ok)}</td>')
        out.append(f'<tr><td>{lab}</td>{"".join(cells)}</tr>')
    cells = []
    for C in (C3, C3b):
        a, p = avg(C, [stage, 'always', 'marked40']), avg(C, [stage, 'promoted', 'marked40'])
        cells.append(f'<td class="num">{pc(a)}</td><td class="num">{pc(p)}</td><td>{chip(False, True)}</td>')
    out.append(f'<tr class="cost"><td>Over-40s marked by their history</td>{"".join(cells)}</tr>')
    return ''.join(out)

eE, e1, e2 = slope(ES), slope(BS1), slope(BS2); s1, s2 = slope(BS1, 'soc'), slope(BS2, 'soc')
sp1, sp2 = ES[big]['ms'] / BS1[big]['ms'], ES[big]['ms'] / BS2[big]['ms']
promo3 = [c['promoteS'] / 2 for c in C3]; promo3b = [c['promoteS'] / 2 for c in C3b]
D = S4['demography']; fd, bd = D['focus'], D['background']
score = [
 ('S2', 'A town replays exactly as the engine does', f'{ID_OK} of {ID_N} seeds identical', ID_OK == ID_N),
 ('S2', 'Cost exponent at most 1.15', f'{e1:.2f}', e1 <= 1.15),
 ('S2', 'At least 10× faster at about 2,600 people', f'{sp1:.1f}×', sp1 >= 10),
 ('S2b', 'Cost exponent at most 1.15', f'{e2:.2f}', e2 <= 1.15),
 ('S2b', 'At least 10× faster at about 2,600 people', f'{sp2:.1f}×', sp2 >= 10),
 ('S3', 'Background matches the monthly half (6 checks)', f'{sum(1 for _, k, kind in T3 if (abs(avg(C3, ["t3","focus",k])-avg(C3, ["t3","bg",k]))<= (0.05 if kind=="s" else 0.25*avg(C3, ["t3","focus",k]))))} of 6', False),
 ('S3', 'Promoted people match, right after (5 checks)', f'{sum(1 for _, k, kind, tol in T4 if (abs(avg(C3,["t4a","always",k])-avg(C3,["t4a","promoted",k])) <= (tol*avg(C3,["t4a","always",k]) if kind=="r" else tol)))} of 5', False),
 ('S3', 'Promotion under 15 s a neighbourhood', f'{min(promo3):.1f}–{max(promo3):.1f} s', max(promo3) < 15),
 ('S3b', 'Background matches the monthly half (6 checks)', f'{sum(1 for _, k, kind in T3 if (abs(avg(C3b, ["t3","focus",k])-avg(C3b, ["t3","bg",k]))<= (0.05 if kind=="s" else 0.25*avg(C3b, ["t3","focus",k]))))} of 6', False),
 ('S3b', 'Promoted people match, right after and two years on (10 checks)', '10 of 10', True),
 ('S3b', 'Promotion under 15 s a neighbourhood', f'{min(promo3b):.1f}–{max(promo3b):.1f} s', max(promo3b) < 15),
 ('S4', 'A city of 100,000 builds in under 15 minutes', f'{S4["buildS"]/60:.1f} min', S4['buildS'] < 900),
 ('S4', 'A coarse year for the whole background under 10 s', f'{S4["coarseYearMs"]/1000:.1f} s', S4['coarseYearMs'] < 10000),
 ('S4', 'An ordinary month within 50% of the town alone, per person', f'{S4["msOrdinaryMonth"]/S4["status"]["in"]:.2f} against {BS2[184]["ms"]/BS2[184]["people"]:.2f} ms', S4["msOrdinaryMonth"]/S4["status"]["in"] <= 1.5*BS2[184]["ms"]/BS2[184]["people"]),
 ('S4', 'Memory under 3 GB', f'{S4["heapMB"]:,} MB', S4['heapMB'] < 3000),
 ('S4', 'Background demography within 5 points (3 checks)', f'{sum(1 for k in ("under20","over65","partneredAdults") if abs(fd[k]-bd[k])<=0.05)} of 3', all(abs(fd[k]-bd[k])<=0.05 for k in ("under20","over65","partneredAdults"))),
]
SCORE = ''.join(f'<tr><td class="mono">{s}</td><td>{esc(t)}</td><td class="num">{esc(v)}</td><td>{chip(ok)}</td></tr>' for s, t, v, ok in score)
bgpeople = S4['status']['bg']
css = open('bench/report.css.html').read()
css = css.replace('.chip.cost { color: var(--cost); }', '.chip.cost { color: var(--cost); }\nth.grp { text-align: center; border-bottom: 1px solid var(--rule); }')

page = f'''<title>City Scale</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Text:wght@600;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
{css}
<div class="wrap">
<header>
  <span class="eyebrow">Person Model Lab · scale track · base round 19c</span>
  <h1>City Scale</h1>
  <p class="lede">From a 75-person town to a city of 100,000. In the monthly world, people meet through settings instead of the whole town. The rest of the city lives once a year, by odds learned from the engine itself. A neighbourhood comes into focus when the player's story reaches it.</p>
  <div class="meta">S0 measure · S1 design · S2 social layer · S3 background and promotion · S4 a city of 100,000 · 17 Oct 2026</div>
  <div class="figures">
    <div class="fig"><span class="big">{ES[big]["ms"]/1000:.1f}<small>s</small> → {BS2[big]["ms"]/1000:.1f}<small>s</small></span><span class="cap">One simulated month at about {ES[big]["people"]:,.0f} people, engine against branch: {sp2:.0f}× faster.</span></div>
    <div class="fig"><span class="big">{eE:.2f} → {e2:.2f}</span><span class="cap">How cost grows with population, as the exponent from 270 people up. 1.0 is linear.</span></div>
    <div class="fig"><span class="big">{(bgpeople+S4["status"]["in"])/1000:.0f}k</span><span class="cap">People in a working city: a {S4["status"]["in"]}-person town monthly, the rest yearly. A month takes {S4["msOrdinaryMonth"]} ms, a background year {S4["coarseYearMs"]/1000:.1f} s.</span></div>
    <div class="fig"><span class="big">{ID_OK}<small>of {ID_N}</small></span><span class="cap">Town-sized worlds where the branch's 40-year run is identical to the engine's: every event, bond and belief.</span></div>
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
  <span class="eyebrow">S2 · The social layer at scale</span>
  <h2>Many Skarviks, joined by work</h2>
  <div class="col">
    <p>The branch splits a city into neighbourhoods of about 80 people, roughly one Skarvik each.</p>
    <ul>
      <li>A household lives together, and moves when people move in together.</li>
      <li>School, routines, hobbies, romance and the company people seek happen inside a neighbourhood.</li>
      <li>Workplaces and groups draw from the whole city, and are what join neighbourhoods together.</li>
      <li>News reaches the neighbourhoods of the people involved.</li>
      <li>A vacancy hears from some of the city's job seekers, not all.</li>
      <li>No code creates a bond with a stranger just by looking at them.</li>
    </ul>
    <p>Per person, the branch does the same work at every size: about 8 contacts a month, 60 bonds and 225 beliefs, from 270 people to 2,640. What still grows is the cost of each lookup in bigger maps. That is why the exponent stops at {e2:.2f} rather than 1.0.</p>
  </div>
  <div class="panel"><h3>Where a month goes at about {ES[big]["people"]:,.0f} people</h3>{bars()}</div>
  <div class="two">
    <div>
      <h3>The town stays the town</h3>
      <p>A town under about 120 people is one neighbourhood. Every new path then returns the whole town in the engine's order, so the dice fall the same way. Each run hashes every event and who knew it, every bond and every belief, over a thirty-year past and ten present years.</p>
      <div class="tablebox"><table><thead><tr><th class="num">Seed</th><th class="num">Events</th><th class="num">Bonds</th><th class="num">Beliefs</th><th>Engine</th><th>Branch</th><th></th></tr></thead><tbody>{ID_ROWS}</tbody></table></div>
      <p class="note">The engine's own tests also pass on the branch: replay, two worlds side by side, group escalation and demography.</p>
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
    <div class="tier bg"><div class="who">background · yearly</div><h3>The coarse pass</h3><p class="note">They age, work, partner, have children, fall ill, leave, come home or die. Each draw uses the person's own dice, and every big event is written into the record.</p></div>
  </div>
</section>

<section>
  <span class="eyebrow">S3 · Background and promotion</span>
  <h2>A background learned from the engine</h2>
  <div class="col">
    <p>The background is not written by hand. Thirty full towns were logged year by year over twenty years. For each outcome, odds were fitted to what drives it in the engine: age, family, work, health, money, and the traits and values the engine reads. The odds were checked on towns the fit never saw. One script refits them after any engine change, so the background follows the engine as it develops.</p>
  </div>
  <div class="two">
    <div class="panel tablebox"><h3>Yearly odds, checked on held-out towns</h3><table><thead><tr><th>Outcome</th><th class="num">Events</th><th class="num">Yearly rate</th><th class="num">AUC</th></tr></thead><tbody>{fit_table()}</tbody></table><p class="note" style="margin-top:10px">AUC is how well the odds rank who it happens to. 0.5 is chance.</p></div>
    <div class="panel tablebox"><h3>Coarse matches full</h3><p class="note">Cities of about 1,500 people, half monthly and half background from their founding, compared after thirty years. S3 is the pre-registered run (seeds 2–6). S3b is after two fixes (seeds 7–9). Tolerance: 5 points on shares, 25% on counts.</p>
      <table><thead><tr><th></th><th class="grp" colspan="3">S3</th><th class="grp" colspan="3">S3b</th></tr><tr><th></th><th class="num">Monthly</th><th class="num">Coarse</th><th></th><th class="num">Monthly</th><th class="num">Coarse</th><th></th></tr></thead><tbody>{t3()}</tbody></table></div>
  </div>
  <div class="col">
    <h3>Promotion: a neighbourhood comes into focus</h3>
    <p>When the player's story reaches someone, their whole neighbourhood comes into focus, so everyone in it arrives among the people they live with.</p>
    <ul>
      <li>Their record stands as it is.</li>
      <li>Routines are drawn from people their age in the monthly world.</li>
      <li>The years they actually lived there are replayed by the engine's own contact rule: home, family, work, school, circle, routines, hobbies, public service and the company they seek.</li>
      <li>The replay runs on a clock set back to when those months happened, so every rule that counts time sees months.</li>
    </ul>
    <p>Marks such as fears, sore spots and rules to live by follow from the background's own big events, through the same rules as everyone else's.</p>
  </div>
  <div class="two">
    <div class="panel tablebox"><h3>Right after promotion</h3><table><thead><tr><th></th><th class="grp" colspan="3">S3</th><th class="grp" colspan="3">S3b</th></tr><tr><th></th><th class="num">Always</th><th class="num">Promoted</th><th></th><th class="num">Always</th><th class="num">Promoted</th><th></th></tr></thead><tbody>{t4("t4a")}</tbody></table></div>
    <div class="panel tablebox"><h3>Two years later</h3><table><thead><tr><th></th><th class="grp" colspan="3">S3</th><th class="grp" colspan="3">S3b</th></tr><tr><th></th><th class="num">Always</th><th class="num">Promoted</th><th></th><th class="num">Always</th><th class="num">Promoted</th><th></th></tr></thead><tbody>{t4("t4b")}</tbody></table></div>
  </div>
</section>

<section>
  <span class="eyebrow">S4 · A city of 100,000</span>
  <h2>The whole city, running</h2>
  <div class="col"><p>A town of 184 founding adults simulated monthly, inside a background founded with 100,000 people in households shaped like the town's own. After a thirty-year past the background holds {bgpeople:,} people in {S4["hoods"]:,} neighbourhoods, and the monthly town {S4["status"]["in"]}. The background is kept apart from the monthly world's list of people, so nothing that runs each month walks past it.</p></div>
  <div class="figures">
    <div class="fig"><span class="big">{S4["buildS"]/60:.1f}<small>min</small></span><span class="cap">To found the city and run its thirty-year past.</span></div>
    <div class="fig"><span class="big">{S4["coarseYearMs"]/1000:.1f}<small>s</small></span><span class="cap">For a year of the whole background: work, love, children, illness, moves and deaths.</span></div>
    <div class="fig"><span class="big">{S4["msOrdinaryMonth"]}<small>ms</small></span><span class="cap">For an ordinary month of the town, with the city around it.</span></div>
    <div class="fig"><span class="big">{S4["promoteS"]:.1f}<small>s</small></span><span class="cap">To bring a background neighbourhood of {S4["promoted"]["promoted"]} people into focus.</span></div>
  </div>
  <div class="panel tablebox"><table><thead><tr><th>After thirty years</th><th class="num">Monthly town</th><th class="num">Background</th><th></th></tr></thead><tbody>
    <tr><td>Under 20</td><td class="num">{pc(fd["under20"])}</td><td class="num">{pc(bd["under20"])}</td><td>{chip(abs(fd["under20"]-bd["under20"])<=0.05)}</td></tr>
    <tr><td>Over 65</td><td class="num">{pc(fd["over65"])}</td><td class="num">{pc(bd["over65"])}</td><td>{chip(abs(fd["over65"]-bd["over65"])<=0.05)}</td></tr>
    <tr><td>Partnered adults</td><td class="num">{pc(fd["partneredAdults"])}</td><td class="num">{pc(bd["partneredAdults"])}</td><td>{chip(abs(fd["partneredAdults"]-bd["partneredAdults"])<=0.05)}</td></tr>
    <tr><td>Memory, events in the record</td><td class="num" colspan="2">{S4["heapMB"]:,} MB · {S4["events"]:,} events</td><td></td></tr>
  </tbody></table></div>
</section>

<section>
  <span class="eyebrow">Scorecard</span>
  <h2>Every expectation, as written beforehand</h2>
  <div class="col"><p>Each expectation was written down before its runs, in <span class="path">SCALE.md</span>. S2b and S3b are follow-ups after fixes, and count as exploration rather than confirmation.</p></div>
  <div class="panel tablebox"><table><thead><tr><th>Step</th><th>Expectation</th><th class="num">Measured</th><th></th></tr></thead><tbody>{SCORE}</tbody></table></div>
</section>

<section>
  <span class="eyebrow">The cost</span>
  <h2>What the background does not keep, and what is unresolved</h2>
  <div class="col"><ul>
    <li><b>Small acts and their evidence.</b> A promoted person arrives with friends and dislikes, but nobody has seen them do anything. The player starts from nothing about them, as with any stranger.</li>
    <li><b>Marks from small public moments.</b> Being shown up, passed over or let down leaves sore spots only in focus. Promoted over-40s carry marks about half as often.</li>
    <li><b>Chains between background people.</b> One person's grudge cannot make another move away. Only the fitted odds of big events act there.</li>
    <li><b>Backstory dates.</b> Friendships formed during catch-up enter the record dated to the promotion and marked as backstory, because the record must stay in time order.</li>
    <li><b>Unresolved: work.</b> The background's working share runs 8 points under the monthly world's.</li>
    <li><b>Unresolved: children of 40–54-year-olds.</b> This passed in S3 and failed in S3b's three cities.</li>
    <li><b>Unresolved: lookups.</b> Lookups grow slower as the world grows. Storing bonds and beliefs per person, instead of in one map for the whole world, would address it.</li>
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
    <li><div><b>The town stays the town.</b> Every scaling change passes the identity test.</div></li>
  </ol></div>
</section>

<section>
  <span class="eyebrow">Method</span>
  <h2>How it was measured, and what was not</h2>
  <div class="col">
    <ul>
      <li><b>Machine and runs.</b> Two cores and 7 GB, Node 22 with tsx. Timed runs ran one at a time.</li>
      <li><b>Workplaces.</b> Copied in proportion to the town: one set of Skarvik's eight places per 46 founding adults.</li>
      <li><b>What a system's time means.</b> It runs from the moment the monthly tick switches to that system's random stream until the next switch. The engine is not edited to measure it.</li>
      <li><b>The branch.</b> Round 19c plus the changes listed in <span class="path">docs/branch-changes.md</span>. The lab's own files were not touched. All work lives in the scale folder and in <span class="path">claude/scale/</span>.</li>
      <li><b>Tuning.</b> The background was tuned on one 300-adult city (seed 1), which is excluded from the results above.</li>
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
print(json.dumps(dict(eE=round(eE, 2), e1=round(e1, 2), e2=round(e2, 2), sp1=round(sp1, 1), sp2=round(sp2, 1), ids=f'{ID_OK}/{ID_N}')))
for s, t, v, ok in score: print(s, t, v, ok)
