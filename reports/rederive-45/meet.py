import json,glob,sys
sys.path.insert(0,'.')
from stats import *
D='/Users/oystein/Documents/GitHub/Understory/out-round-45/diag/out-meet/'
seeds=range(3693,3717)
L=lambda a:{s:json.load(open(f'{D}{a}-{s}.json')) for s in seeds}
on,mt,mn=L('on'),L('meeting'),L('feelings')
pct=lambda a,b:100*a/max(1,b)
def counter(x,k=None):
    es=[e for e in x['episodes'] if e['v0']>=0.3 and (k is None or e['k']==k)]
    return pct(sum(e['flipped'] for e in es),len(es)),sum(e['flipped'] for e in es),len(es)
print('1/2 counter')
for k in [None,'resentment','guilt','gratitude']:
    a=ci([counter(on[s],k)[0] for s in seeds]);b=ci([counter(mt[s],k)[0] for s in seeds])
    d=ci([counter(on[s],k)[0]-counter(mt[s],k)[0] for s in seeds],0.95)
    pa=[sum(counter(on[s],k)[i] for s in seeds) for i in (1,2)];pb=[sum(counter(mt[s],k)[i] for s in seeds) for i in (1,2)]
    print(k,'on',f(a),pa,'off',f(b),pb,'paired',f(d),'lower1sided95 %.2f'%d['lo1'])
print('r44')
for nm,m in [('on',on),('off',mt)]:
    print(nm,f(ci([pct(m[s]['r44']['flips'],m[s]['r44']['weighed']) for s in seeds])))
print('3 recur')
M=[m for s in seeds for m in on[s]['meets']]
again=[m for m in M if m.get('same') is not None]
print('again',len(again),'same true',sum(m['same'] for m in again),'still',sum(1 for m in M if m.get('still')))
fl=ci([pct(sum(1 for m in on[s]['meets'] if m['t']+12<=on[s]['years']*12 and m.get('followed')),sum(1 for m in on[s]['meets'] if m['t']+12<=on[s]['years']*12)) for s in seeds])
print('followed',f(fl))
print('4 displaced',f(ci([pct(on[s]['displaced'],on[s]['decisions10']) for s in seeds]),2))
c99=lambda xs:ci(xs,0.99)
for k in ['births','deaths','marriages','splits','hires']:
    d=[(on[s]['demog'][k]-mn[s]['demog'][k])*10/20 for s in seeds]
    a=ci(d);b=c99(d)
    print(k,'paired on-main',f(a),'99%%: %.2f to %.2f'%(b['m']-b['h'],b['m']+b['h']))
print('meeting-off paired:')
for k in ['births','deaths','marriages','splits','hires']:
    d=[(on[s]['demog'][k]-mt[s]['demog'][k])*10/20 for s in seeds]
    b=c99(d);print(k,f(ci(d)),'99%%: %.2f to %.2f'%(b['m']-b['h'],b['m']+b['h']))
print('6 raised')
ER=lambda x,k:[e for e in x['episodes'] if e['k']==k and e['v0']>=0.3]
for k in ['resentment','guilt','gratitude']:
    print(k,f(ci([pct(sum(e['raised'] for e in ER(on[s],k)),len(ER(on[s],k))) for s in seeds])))
def thirds(xs):
    s=sorted(xs);return s[len(s)//3],s[(2*len(s))//3]
E_=[e for s in seeds for e in ER(on[s],'resentment')]
f1,f2=thirds([e['forg'] for e in E_])
rate=lambda es:pct(sum(e['raised'] for e in es),len(es))
lo=rate([e for e in E_ if e['forg']<=f1]);hi=rate([e for e in E_ if e['forg']>=f2])
print('forg',lo,hi,lo/hi)
MR=[m for m in M if m['k']=='resentment']
b1,b2=thirds([m['bold'] for m in MR])
aw=lambda ms:pct(sum(m['fam']=='withdrawal' for m in ms),len(ms))
l=aw([m for m in MR if m['bold']<=b1]);h=aw([m for m in MR if m['bold']>=b2]);print('bold',l,h,l/h)
d=[(on[s]['demog']['births']-mn[s]['demog']['births'])*10/20 for s in seeds];print('births exact',sum(d)/24, sum(on[s]['demog']['births'] for s in seeds),sum(mn[s]['demog']['births'] for s in seeds))
