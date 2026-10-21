import re,sys
lines=open(sys.argv[1]).read().split('\n')
secs=[];cur=None
for i,l in enumerate(lines,1):
    if l.startswith('## '):
        cur={'title':l[3:],'start':i,'lines':[]};secs.append(cur)
    elif cur: cur['lines'].append((i,l))
for s in secs:
    pre=[];out=[];amend=[];mode='pre'
    for i,l in s['lines']:
        if re.match(r'\s*(Outcome of round|Outcome \(|Round \S+ withdrawn|Outcome of round)',l): mode='out'
        elif re.match(r'\s*(Amendment|Second amendment)',l) and mode=='pre': mode='amend'
        (pre if mode=='pre' else out if mode=='out' else amend).append(l)
    w=lambda x: sum(len(t.split()) for t in x)
    m=re.match(r'Round (\S+?)[ —:]',s['title'])
    rid=m.group(1) if m else s['title'][:25]
    print(f"{s['start']:5d}  {rid:8s} pre={w(pre):5d} amend={w(amend):4d} out={w(out):5d} total={w(pre)+w(amend)+w(out):5d}")
