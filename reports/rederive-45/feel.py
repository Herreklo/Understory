import json,sys
sys.path.insert(0,'.')
from stats import *
D='/Users/oystein/Documents/GitHub/Understory/out-round-45/diag/out-feel/'
seeds=range(3693,3717)
L=lambda a:{s:json.load(open(f'{D}{a}-{s}.json')) for s in seeds}
on,mn=L('on'),L('feelings')
for k in ['inKind','rows','dislikes','ended','wrongs']:
    g=lambda x:1000*x['feuds'][k]/max(1,x['feuds']['adultYears'])
    d=[g(on[s])-g(mn[s]) for s in seeds];a=ci(d);b=ci(d,0.99)
    print(k,f(a),'99%%: %.2f to %.2f'%(b['m']-b['h'],b['m']+b['h']))
for grp in ['all','busiest']:
    g=lambda x:100*x[grp]['copies']/max(1,x[grp]['lines'])
    d=[g(on[s])-g(mn[s]) for s in seeds];a=ci(d)
    print('copy',grp,f(a,2),'one-sided 95%% upper %.3f'%a['hi1'])
