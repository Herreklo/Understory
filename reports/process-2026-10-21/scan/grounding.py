import re,sys
lines=open(sys.argv[1]).read().split('\n')
secs=[];cur=None
for i,l in enumerate(lines,1):
    if l.startswith('## '):
        cur={'title':l[3:],'start':i,'lines':[]};secs.append(cur)
    elif cur: cur['lines'].append((i,l))
cite=re.compile(r"[A-Z][a-zA-Z'\-]+(?: (?:and|et al\.?|&) [A-Z][a-zA-Z'\-]+)*(?:,? (?:and others|et al\.?))?,? (?:19|20)\d\d")
games=re.compile(r"Crusader Kings|CK3|Dwarf Fortress|The Sims|Sims|Talk of the Town|Football Manager|RimWorld|Bad News|Versu|Prom Week",re.I)
diag=re.compile(r"Measured (?:first|before)|Diagnostic before|diagnosis|throwaway worlds|smoke world|Sized on|Counted on throwaway|on used worlds|In throwaway|Traced|traced|checked against the (?:code|source)|from reading the code|Reading the code",re.I)
for s in secs:
    m=re.match(r'Round (\S+?)[ —:]',s['title'])
    if not m: continue
    rid=m.group(1)
    pre=[]
    for i,l in s['lines']:
        if re.match(r'\s*(Outcome of round|Outcome \(|Round \S+ withdrawn)',l): break
        pre.append(l)
    txt=' '.join(pre)
    c=sorted(set(cite.findall(txt)))
    g=sorted(set(x.lower() for x in games.findall(txt)))
    d=len(diag.findall(txt))
    print(f"{s['start']:5d} {rid:6s} cites={len(c):2d} games={','.join(g) or '-':30s} diag={d}  {'; '.join(c)[:150]}")
