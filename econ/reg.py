import json,numpy as np
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor as vif
s=open('../k9/k9econ_data.js').read();E=json.loads(s[s.index('=')+1:s.rindex(';')])
V={v['k']:v for v in E['vars']};K=E['kov']
cty=E['cty'];harju=np.array([c=='Harju' for c in cty],float);linn=np.array([('linn' in k) or k=='Tallinn' for k in K],float)
def a(k,end=True):
    v=V[k];arr=v['v1'] if end or not v['v0'] else v['v0'];return np.array([np.nan if x is None else x for x in arr],float)
M={
 'M1':('popChg',[('sh65_0',a('sh65',False)),('lninc_0',np.log(a('inc',False))),('reg_0',a('reg',False)),('harju',harju),('lnpop_0',np.log(a('pop',False)))]),
 'M2':('tm',[('earn',a('earn')),('lninc',np.log(a('inc'))),('sh65',a('sh65')),('harju',harju)]),
 'M3':('lnkulud',[('lnpop',np.log(a('pop'))),('sh65',a('sh65')),('sh017',a('sh017')),('linn',linn),('harju',harju)]),
 'M4':('netMig',[('lninc_0',np.log(a('inc',False))),('reg_0',a('reg',False)),('sh017_0',a('sh017',False)),('harju',harju),('lnpop_0',np.log(a('pop',False)))]),
}
Y={'popChg':a('popChg'),'tm':a('tm'),'lnkulud':np.log(a('kulud')),'netMig':a('netMig')}
for name,(y,xs) in M.items():
    X=np.column_stack([x for _,x in xs]);yy=Y[y];m=~np.isnan(yy)&~np.isnan(X).any(1)
    Xc=sm.add_constant(X[m]);r=sm.OLS(yy[m],Xc).fit(cov_type='HC3')
    print('==',name,y,'n',m.sum(),'R2',round(r.rsquared,3),'adjR2',round(r.rsquared_adj,3))
    for j,(nm,_) in enumerate(xs):print(f'  {nm:9s} b={r.params[j+1]:+.4f} se={r.bse[j+1]:.4f} p={r.pvalues[j+1]:.3g} vif={vif(Xc,j+1):.2f}')
    res=yy-np.column_stack([np.ones(79),X])@r.params
    for i in range(52,56):print('   ',K[i],'y',round(yy[i],2),'fit',round(yy[i]-res[i],2),'res',round(res[i],2))
