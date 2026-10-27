import json,sys
sys.path.insert(0,'.')
from stats import *
R='/Users/oystein/Documents/GitHub/Understory/.claude/worktrees/kind-herschel-f425d0/reports/45-reading-'
def pairs(pack):
    ans=json.load(open(R+pack+'-answers.json'));key=json.load(open(R+pack+'-key.json'))
    rows=[];ties=0;tot=0
    readers=set(v['reader'] for v in ans.values())
    per={}
    for sit,v in ans.items():
        for p,r in v['pairs'].items():
            on=key[p]['onIs'];off='B' if on=='A' else 'A'
            per.setdefault(p,{}).setdefault(v['reader'],[]).append(r[on]['score']-r[off]['score'])
    for p,rd in per.items():
        assert all(len(x)==1 for x in rd.values()),p
        for x in rd.values():
            tot+=1;ties+=(x[0]==0)
        rows.append((sum(x[0] for x in rd.values())/len(rd),1 if key[p]['onIs']=='B' else -1,len(rd)))
    return rows,ties,tot
def solve(A,b):
    n=len(A);M=[r[:]+[b[i]] for i,r in enumerate(A)]
    for i in range(n):
        p=max(range(i,n),key=lambda r:abs(M[r][i]));M[i],M[p]=M[p],M[i]
        for r in range(n):
            if r!=i:
                k=M[r][i]/M[i][i];M[r]=[a-k*c for a,c in zip(M[r],M[i])]
    return [M[i][n]/M[i][i] for i in range(n)]
def ols(X,y):
    k=len(X[0]);XtX=[[sum(x[i]*x[j] for x in X) for j in range(k)] for i in range(k)]
    Xty=[sum(x[i]*yy for x,yy in zip(X,y)) for i in range(k)]
    beta=solve(XtX,Xty)
    # inverse diag
    inv=[solve(XtX,[1 if i==j else 0 for i in range(k)]) for j in range(k)]
    res=sum((yy-sum(b*xx for b,xx in zip(beta,x)))**2 for x,yy in zip(X,y));df=len(y)-k
    s2=res/df;se=math.sqrt(s2*inv[0][0])
    return beta[0],se,df,beta
out={}
for pk in ['random','busiest']:
    rows,ties,tot=pairs(pk)
    y=[r[0] for r in rows];X=[[1,r[1]] for r in rows]
    b,se,df,beta=ols(X,y)
    print(pk,'n',len(y),'plain mean %.3f'%(sum(y)/len(y)),'effect %.3f ±%.3f'%(b,tq(.975,df)*se),'lean %.3f'%beta[1],'lo95 %.3f'%(b-tq(.95,df)*se),'ties',ties,'of',tot)
    out[pk]=rows
X=[];y=[]
for i,pk in enumerate(['random','busiest']):
    for r in out[pk]: X.append([1,r[1],0.5 if i else -0.5]);y.append(r[0])
b,se,df,beta=ols(X,y)
print('pooled effect %.3f ±%.3f lo95 %.3f'%(b,tq(.975,df)*se,b-tq(.95,df)*se),'df',df,'order %.3f pack %.3f'%(beta[1],beta[2]))
