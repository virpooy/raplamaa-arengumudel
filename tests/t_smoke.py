import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));PAGE='file://'+ROOT+'/build/kangas.html';OUT=os.path.join(ROOT,'tests','out');os.makedirs(OUT,exist_ok=True)
import asyncio,json,sys
from playwright.async_api import async_playwright
VIEWS=["ylevaade","rahvastik","teenused","eluase","eelarve","stsenaariumid","seosed","eesmargid","andmed","atlas","vordlus"]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1440,'height':950});errs=[]
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)));pg.on('console',lambda m:m.type=='error' and 'ERR_FAILED' not in m.text and errs.append(m.text))
    await pg.route('**/fonts.g*/**',lambda r:r.abort())
    await pg.goto(PAGE+'');await pg.wait_for_timeout(3000)
    for v in VIEWS:
      await pg.evaluate(f'K9.go("{v}")');await pg.wait_for_timeout(700)
      r=await pg.evaluate(f'''(()=>{{const el=document.querySelector('#k9 .k9view[data-view="{v}"]');return {{err:[...el.querySelectorAll('.k9err')].map(x=>x.textContent).slice(0,3),h1:el.querySelector('h1')?.textContent,secs:[...el.querySelectorAll('section.k9sec')].map(s=>s.id).join(','),sub:[...el.querySelectorAll('.k9sub a')].length,title:document.title,cur:document.querySelector('.k9nav a[aria-current=page]')?.textContent}}}})()''')
      print(v,json.dumps(r,ensure_ascii=False))
    await pg.screenshot(path=os.path.join(OUT,'s_top.png'))
    print('ERRS',errs[:10]);await b.close()
asyncio.run(main())
