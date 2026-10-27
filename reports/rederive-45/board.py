import json,glob,sys
sys.path.insert(0,'.')
from stats import *
O='/Users/oystein/Documents/GitHub/Understory/out-round-45/'
def load(a):
    m={}
    for f in glob.glob(O+f'board-{a}/eval-*.json'):
        for w in json.load(open(f)): m[w['seed']]=w['g']
    return m
on,off=load('on'),load('off'); seeds=sorted(set(on)&set(off)); print(len(seeds),seeds[0],seeds[-1])
C={'row','row-answer','stay'};MT={'meeting','meeting-answer'}
sl={'all':lambda x:True,'notcouple':lambda x:x['trigger'] not in C,'key':lambda x:x['novel'] and x['contested'] and x['known'],
 'notcouple-nomeeting':lambda x:x['trigger'] not in C|MT}
acc=lambda g:sum(x['cal']==x['chosen'] for x in g)/max(1,len(g))
for n,fn in sl.items():
    d=[100*(acc([x for x in on[s] if fn(x)])-acc([x for x in off[s] if fn(x)])) for s in seeds]
    a=ci(d);b=ci(d,0.90)
    print(n,f(a),'90%%: %.2f to %.2f'%(b['m']-b['h'],b['m']+b['h']),sum(len([x for x in on[s] if fn(x)]) for s in seeds),sum(len([x for x in off[s] if fn(x)]) for s in seeds))
