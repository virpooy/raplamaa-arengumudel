import json,re,numpy as np
from scipy import stats
import statsmodels.api as sm
s=open('../k9/k9econ_data.js').read();E=json.loads(s[s.index('=')+1:s.rindex(';')])
V={v['k']:v for v in E['vars']};K=E['kov'];n=79
cty=E['cty'];harju=np.array([c=='Harju' for c in cty],float);linn=np.array([('linn' in k) or k=='Tallinn' for k in K],float)
def a(k,end=True):
    v=V[k];arr=v['v1'] if end or not v['v0'] else v['v0'];return np.array([np.nan if x is None else x for x in arr],float)
def skew(x):x=x[~np.isnan(x)];return stats.skew(x)
lnpop=np.log(a('pop'))
keys=[k for k in V if k!='pop']
print('skew:',{k:round(skew(a(k)),2) for k in keys})
# matrix
res=[]
for i,k1 in enumerate(keys):
  for k2 in keys[i+1:]:
    x,y=a(k1),a(k2);m=~np.isnan(x)&~np.isnan(y)
    r,p=stats.spearmanr(x[m],y[m]);res.append((k1,k2,m.sum(),r,p))
ps=np.array([r[4] for r in res]);
from statsmodels.stats.multitest import multipletests
rej,q,_,_=multipletests(ps,method='fdr_bh')
print('pairs',len(res),'p<.05',(ps<.05).sum(),'q<.05',(q<.05).sum())
top=sorted(zip(res,q),key=lambda t:-abs(t[0][3]))[:40]
for (k1,k2,nn,r,p),qq in top:print(f'{k1:8s} {k2:8s} n={nn} rho={r:+.2f} p={p:.3g} q={qq:.3g}')
json.dump({'res':[(a_,b_,int(c_),float(d_),float(e_),float(f_)) for (a_,b_,c_,d_,e_),f_ in zip(res,q)]},open('out/spearman_end.json','w'))
