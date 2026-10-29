import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));PAGE='file://'+ROOT+'/build/kangas.html';OUT=os.path.join(ROOT,'tests','out');os.makedirs(OUT,exist_ok=True)
# v35 tööturu osa ja hõivehoova kontroll
import asyncio
from playwright.async_api import async_playwright
OK=[];BAD=[]
def chk(n,c,i=""):(OK if c else BAD).append(n);print(("OK  " if c else "VIGA")+" "+n+(" · "+str(i) if i else ""))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for W,H in [(1440,950),(390,844)]:
      pg=await b.new_page(viewport={'width':W,'height':H});errs=[]
      pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=="error" and "Failed to load resource" not in m.text and errs.append(m.text))
      await pg.route('**/fonts.g*/**',lambda r:r.abort())
      await pg.goto(PAGE+'#rahvastik/k9-too');await pg.wait_for_timeout(3500)
      tot={'f':0,'l':0}
      for g in ['emp','pay','grp','ind']:
        await pg.click(f'[data-tgrp="{g}"]');await pg.wait_for_timeout(500)
        q=await pg.evaluate('(()=>{const f=[...document.querySelectorAll("#k9-too [data-gpan]:not([hidden]) [data-tfig]")];return {f:f.filter(x=>x.querySelector("figure")).length,l:document.querySelectorAll("#k9-too [data-gpan]:not([hidden]) a[href^=\'https://andmed.stat.ee/et/stat/\']").length}})()')
        tot['f']+=q['f'];tot['l']+=q['l']
      chk(f"{W}: sakkides kokku 11 joonist/tabelit",tot['f']==11 and tot['l']>=20,tot)
      await pg.click('[data-tgrp="emp"]');await pg.wait_for_timeout(400)
      r=await pg.evaluate('''(()=>{const s=document.querySelector("#k9-too .k9too");const f=[...s.querySelectorAll("[data-tfig]")];
        return {n:f.length,filled:f.every(x=>x.querySelector("figure")),svg:s.querySelectorAll("svg").length,err:s.querySelectorAll(".k9err").length,find:s.querySelectorAll(".k9too-c").length,
        links:[...s.querySelectorAll("a[href^='https://andmed.stat.ee/et/stat/']")].length,nan:/NaN|undefined/.test(s.textContent),ov:document.documentElement.scrollWidth-innerWidth,
        order:[...document.querySelectorAll("#k9-too [data-part]")].map(x=>x.dataset.part).join(","),emp:EMPB,s:S.emp,tax:Math.round(taxSeries("MAAK")[2036]/1e5)}})()''')
      chk(f"{W}: vigu pole",r['n']==11 and r['err']==0 and not r['nan'],r)
      chk(f"{W}: leiud 8",r['find']==8,r['find'])
      chk(f"{W}: järjekord REL → tööturg → MKM",r['order']=="tooturg,mkmtoo",r['order'])
      chk(f"{W}: horisontaalset kerimist pole",r['ov']<=1,r['ov'])
      chk(f"{W}: hõivehoova baas 64,1 ja vaikimisi väärtus",r['emp']==64.1 and r['s']==64.1)
      await pg.click('[data-tmode="e2064"]');await pg.wait_for_timeout(300);await pg.click('[data-rmode="s"]');await pg.wait_for_timeout(300)
      t=await pg.evaluate('document.querySelector("[data-tfig=reg] h3").textContent+"|"+document.querySelector("[data-tfig=emp] h3").textContent')
      chk(f"{W}: lülitid töötavad",'20–64' in t,t)
      await pg.screenshot(path=f'{OUT}/too_{W}.png')
      el=await pg.query_selector('[data-tfig="un"]');await el.scroll_into_view_if_needed();await pg.wait_for_timeout(300);await pg.screenshot(path=f'{OUT}/too_un_{W}.png')
      el=await pg.query_selector('[data-tfig="now"]');await el.scroll_into_view_if_needed();await pg.wait_for_timeout(300);await pg.screenshot(path=f'{OUT}/too_now_{W}.png')
      # hoob: −2,5 pp eelseadistus muudab tulumaksu, baas mitte
      x=await pg.evaluate('(()=>{const b=taxSeries("MAAK")[2036];K9.setS({emp:61.6});const a=taxSeries("MAAK")[2036];K9.setS({emp:EMPB});return [b,a,taxSeries("MAAK")[2036]]})()')
      chk(f"{W}: hõive −2,5 pp vähendab tulumaksu, tagasi baasi taastab",x[1]<x[0] and abs(x[2]-x[0])<1,[round(v/1e6,2) for v in x])
      chk(f"{W}: konsoolis vigu ei ole",not errs,errs[:3]);await pg.close()
    await b.close()
  print(f"\nKOKKU: {len(OK)} läbitud, {len(BAD)} ebaõnnestus")
asyncio.run(main())
