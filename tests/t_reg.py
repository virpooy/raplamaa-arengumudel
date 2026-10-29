import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));PAGE='file://'+ROOT+'/build/kangas.html';OUT=os.path.join(ROOT,'tests','out');os.makedirs(OUT,exist_ok=True)
# Regressioonivõrdlus: mudeli arvutustulemused enne/pärast. Kasutus: python3 t_reg.py [salvesta|vordle]
import asyncio,json,sys
from playwright.async_api import async_playwright
JS='''(async()=>{const o={};const set=async p=>{K9.setS(p);};
  const D={mig:"mean",extra:0,fert:0,wage:4.5,emp:64.1,fertTr:"const",mort:"const",re27:false};
  const cases=[["lahteseis",{}],["lisarane100",{extra:100}],["synd-10",{fert:-10}],["synd_langus",{fertTr:"down"}],["eluiga",{mort:"tr"}],["palk3",{wage:3}],["hoive66",{emp:64.1*66/68.5}]];
  for(const [k,p] of cases){V.forEach(v=>VX[v]=0);K9.setS({...D,...p});const r={};K9.UNITS.forEach(u=>{r[u]={pop36:popT(u,YN),pop30:popT(u,2030),tax36:taxSeries(u)[YN],tax27:taxSeries(u)[2027],la36:eduDemand(u,YN).la,sc36:eduDemand(u,YN).sc,old36:shares(u,YN).old,mc:MC[u][YN]};});
    r.SC=Object.fromEntries(MIGS_ALL.map(m=>[m,SC[m].MAAK[YN]]));r.rng=MIGS_ALL.map(m=>popAt("MAAK",YN,m,S.extra,S.fert));o[k]=r;}
  K9.setS({...D});return o;})()'''
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1400,'height':900});await pg.route('**/fonts.g*/**',lambda r:r.abort())
    await pg.goto(PAGE+'');await pg.wait_for_timeout(3000)
    r=await pg.evaluate(JS);await b.close();return r
r=asyncio.run(main())
mode=sys.argv[1] if len(sys.argv)>1 else 'vordle'
if mode=='salvesta':json.dump(r,open(os.path.join(ROOT,'tests','reg_baseline.json'),'w'),indent=1);print('salvestatud')
else:
  b=json.load(open(os.path.join(ROOT,'tests','reg_baseline.json')));bad=0
  def cmp(a,c,path):
    global bad
    if isinstance(a,dict):
      for k in a:cmp(a[k],c.get(k) if isinstance(c,dict) else None,path+'/'+k)
    elif isinstance(a,list):
      for i,x in enumerate(a):cmp(x,c[i] if c and i<len(c) else None,path+f'[{i}]')
    else:
      if c is None or abs((a or 0)-(c or 0))>1e-6*max(1,abs(a or 0)):bad+=1;print('ERINEB',path,a,c)
  cmp(b,r,'');print('erinevusi',bad)
print('kontroll: lähteseis maakond 2036',round(r['lahteseis']['MAAK']['pop36']),'| +100',round(r['lisarane100']['MAAK']['pop36']),'| synd-10',round(r['synd-10']['MAAK']['pop36']),'| langus',round(r['synd_langus']['MAAK']['pop36']),'| eluiga',round(r['eluiga']['MAAK']['pop36']))
print('tulumaks 2036 mln',round(r['lahteseis']['MAAK']['tax36']/1e6,1),round(r['palk3']['MAAK']['tax36']/1e6,1),round(r['hoive66']['MAAK']['tax36']/1e6,1))
print('+100 viie mustri vahemik',[round(x) for x in r['lisarane100']['rng']],'SC portreed',[round(x) for x in r['lisarane100']['SC'].values()])
