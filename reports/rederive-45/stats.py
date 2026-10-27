import math
def _pdf(t,df): return math.exp(math.lgamma((df+1)/2)-math.lgamma(df/2))/math.sqrt(df*math.pi)*(1+t*t/df)**(-(df+1)/2)
def _cdf(t,df):
    # integrate 0..|t| by Simpson
    n=4000; a=0; b=abs(t); h=(b-a)/n
    s=_pdf(a,df)+_pdf(b,df)
    for i in range(1,n): s+=(4 if i%2 else 2)*_pdf(a+i*h,df)
    v=0.5+s*h/3
    return v if t>=0 else 1-v
def tq(p,df):
    lo,hi=0,50
    for _ in range(60):
        m=(lo+hi)/2
        if _cdf(m,df)<p: lo=m
        else: hi=m
    return (lo+hi)/2
def ci(xs,conf=0.95):
    n=len(xs); m=sum(xs)/n; sd=math.sqrt(sum((x-m)**2 for x in xs)/(n-1)); se=sd/math.sqrt(n)
    return dict(n=n,m=m,sd=sd,se=se,h=tq(0.5+conf/2,n-1)*se,lo1=m-tq(conf,n-1)*se,hi1=m+tq(conf,n-1)*se)
def f(c,d=1): return f"{c['m']:.{d}f} ±{c['h']:.{d}f}"
