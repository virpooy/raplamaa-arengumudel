import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));PAGE='file://'+ROOT+'/build/kangas.html';OUT=os.path.join(ROOT,'tests','out');os.makedirs(OUT,exist_ok=True)
import asyncio,json,sys,re
from playwright.async_api import async_playwright
VIEWS=sys.argv[2].split(",") if len(sys.argv)>2 else ["ylevaade","rahvastik","teenused","eluase","eelarve","stsenaariumid","seosed","eesmargid","andmed","atlas","vordlus"]
W=int(sys.argv[1]) if len(sys.argv)>1 else 1440
SCAN='''(v)=>{const el=document.querySelector('#k9 .k9view[data-view="'+v+'"]');if(!el)return {missing:1};
const vis=x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0};
const bad=[];const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;
while(n=tw.nextNode()){const t=n.textContent;if(/\\bNaN\\b|undefined|Infinity|\\[object|\\bnull\\b|−?∞/.test(t)&&n.parentElement&&vis(n.parentElement))bad.push(t.trim().slice(0,90))}
const attrs=[...el.querySelectorAll('[data-tip],[aria-label],[title]')].map(x=>(x.getAttribute('data-tip')||'')+(x.getAttribute('aria-label')||'')+(x.getAttribute('title')||'')).filter(t=>/NaN|undefined|Infinity|\\[object/.test(t)).slice(0,5);
const svgAttr=[...el.querySelectorAll('svg *')].filter(x=>[...x.attributes].some(a=>/NaN|undefined|Infinity/.test(a.value))).map(x=>x.tagName+':'+[...x.attributes].filter(a=>/NaN|undefined|Infinity/.test(a.value)).map(a=>a.name).join(',')).slice(0,5);
const emptyFig=[...el.querySelectorAll('figure,.k9fig')].filter(f=>vis(f)&&!f.querySelector('svg,table,canvas,img')&&f.textContent.trim().length<20).length;
const errs=[...el.querySelectorAll('.k9err')].map(x=>x.textContent.slice(0,120));
const W=document.documentElement.clientWidth;const ov=[...el.querySelectorAll('*')].filter(x=>{if(!vis(x))return false;const r=x.getBoundingClientRect();if(r.right<=W+1)return false;let p=x.parentElement;while(p&&p!==el){const s=getComputedStyle(p);if(/auto|scroll|hidden/.test(s.overflowX))return false;p=p.parentElement}return true}).map(x=>x.tagName+'.'+(x.className&&x.className.baseVal!==undefined?x.className.baseVal:x.className)).slice(0,5);
const pageOv=document.documentElement.scrollWidth>W+1;
return {bad:[...new Set(bad)].slice(0,8),attrs,svgAttr,emptyFig,errs,ov,pageOv,secs:[...el.querySelectorAll('section.k9sec')].length}}'''
async def main():
  out={}
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':W,'height':900});errs=[]
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)[:200]));pg.on('console',lambda m:m.type=='error' and 'ERR_FAILED' not in m.text and 'fonts' not in m.text and errs.append(m.text[:200]))
    await pg.route('**/fonts.g*/**',lambda r:r.abort())
    await pg.goto(PAGE+'');await pg.wait_for_timeout(3000)
    for unit in ['MAAK','Rapla']:
     if unit!='MAAK':
       try:
         await pg.click('.k9units button:has-text("Kohila"), [data-unit="Kohila"]',timeout=3000)
       except Exception as e: out['unitclick']=str(e)[:100]
       await pg.wait_for_timeout(800)
     for v in VIEWS:
      await pg.evaluate(f'K9.go("{v}")');await pg.wait_for_timeout(600)
      # all section tabs in this view
      tabs=await pg.evaluate(f'''[...document.querySelectorAll('#k9 .k9view[data-view="{v}"] .k9sub a')].map(a=>a.getAttribute('href'))''')
      res=[]
      for i in range(max(1,len(tabs))):
        if tabs:
          await pg.evaluate(f'''(()=>{{const a=document.querySelectorAll('#k9 .k9view[data-view="{v}"] .k9sub a')[{i}];a&&a.click()}})()''');await pg.wait_for_timeout(450)
        e0=len(errs)
        r=await pg.evaluate(SCAN,v)
        # click every visible button / change every select within visible part
        n=await pg.evaluate(f'''[...document.querySelectorAll('#k9 .k9view[data-view="{v}"] button, #k9 .k9view[data-view="{v}"] select, #k9 .k9view[data-view="{v}"] input[type=range], #k9 .k9view[data-view="{v}"] input[type=checkbox]')].length''')
        acted=0
        for j in range(min(n,160)):
          try:
            info=await pg.evaluate(f'''(()=>{{const xs=[...document.querySelectorAll('#k9 .k9view[data-view="{v}"] button, #k9 .k9view[data-view="{v}"] select, #k9 .k9view[data-view="{v}"] input[type=range], #k9 .k9view[data-view="{v}"] input[type=checkbox]')];const x=xs[{j}];if(!x)return null;const r=x.getBoundingClientRect();if(!(r.width>0&&r.height>0)||x.disabled||x.getAttribute('aria-disabled')=='true')return null;
              const t=(x.textContent||x.getAttribute('aria-label')||x.name||'').trim().slice(0,40);
              if(/Kopeeri|Prindi|Lae alla|CSV|Excel|Esita|Kõik ühel|Lähtesta|Muuda eeldusi/i.test(t)||x.hasAttribute('data-unit')||x.closest('.k9units'))return null;
              if(x.tagName=='SELECT'){{const o=x.options;x.selectedIndex=(x.selectedIndex+1)%o.length;x.dispatchEvent(new Event('change',{{bubbles:true}}));x.dispatchEvent(new Event('input',{{bubbles:true}}))}}
              else if(x.type=='range'){{x.value=x.min?String((+x.min+ +x.max)/2|0):x.value;x.dispatchEvent(new Event('input',{{bubbles:true}}));x.dispatchEvent(new Event('change',{{bubbles:true}}))}}
              else x.click();
              return t}})()''')
            if info is not None:
              acted+=1
              await pg.wait_for_timeout(60)
              # navigation might change view
              cur=await pg.evaluate('document.querySelector(".k9nav a[aria-current=page]")?.getAttribute("href")||""')
              if v not in cur and cur:
                await pg.evaluate(f'K9.go("{v}")');await pg.wait_for_timeout(300)
                if tabs: await pg.evaluate(f'''(()=>{{const a=document.querySelectorAll('#k9 .k9view[data-view="{v}"] .k9sub a')[{i}];a&&a.click()}})()''');await pg.wait_for_timeout(200)
              if len(errs)>e0: r.setdefault('errAfter',[]).append(info+' -> '+errs[-1]);e0=len(errs)
          except Exception as ex:
            r.setdefault('ex',[]).append(str(ex)[:120])
        r2=await pg.evaluate(SCAN,v)
        r['acted']=acted;r['badAfter']=r2['bad'];r['svgAfter']=r2['svgAttr'];r['ovAfter']=r2['ov'];r['pageOvAfter']=r2['pageOv']
        r['tab']=tabs[i] if tabs else ''
        res.append(r)
        await pg.evaluate('location.hash=""')
      out[unit+':'+v]=res
    out['ERRS']=errs[:30]
    await b.close()
  json.dump(out,open(os.path.join(OUT,f'audit_{W}.json'),'w'),ensure_ascii=False,indent=0)
  # summary
  for k,res in out.items():
    if k=='ERRS':continue
    if not isinstance(res,list):print(k,res);continue
    for r in res:
      probs={x:r[x] for x in ['bad','attrs','svgAttr','emptyFig','errs','ov','pageOv','errAfter','ex','badAfter','svgAfter','ovAfter','pageOvAfter'] if r.get(x)}
      if probs:print('PROB',k,r.get('tab'),json.dumps(probs,ensure_ascii=False)[:600])
    print(k,'tabs',len(res),'acted',sum(r.get('acted',0) for r in res))
  print('ERRS',json.dumps(errs[:30],ensure_ascii=False))
asyncio.run(main())
