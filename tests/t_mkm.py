import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));PAGE='file://'+ROOT+'/build/kangas.html';OUT=os.path.join(ROOT,'tests','out');os.makedirs(OUT,exist_ok=True)
# MKM töövaldkonna uuringute osa kontroll (v34)
import asyncio,json
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
      await pg.goto(PAGE+'#rahvastik/k9-too');await pg.wait_for_timeout(3500);await pg.click('[data-ttab="mkm"]');await pg.wait_for_timeout(500);await pg.click('[data-mkmmore]');await pg.wait_for_timeout(300)
      r=await pg.evaluate('''(()=>{const s=document.querySelector("#k9-too"),c=[...s.querySelectorAll(".k9mkm-c")];
        const ids=c.map(x=>x.id);return {sec:!!s,cards:c.length,uniq:new Set(ids).size,nmk:document.querySelectorAll("[data-part=mkmtoo]").length,
        cited:c.every(x=>x.querySelector("dd a[href^='https://mkm.ee/sites/default/files/documents/']")),lim:c.every(x=>[...x.querySelectorAll("dt")].some(d=>d.textContent=="Piirang")),
        A:s.querySelectorAll(".k9mkm-cA").length,B:s.querySelectorAll(".k9mkm-cB").length,gaps:s.querySelectorAll(".k9mkm-gaps li").length,com:!!s.querySelector("[data-k9=com]"),
        ov:document.documentElement.scrollWidth-innerWidth}})()''')
      chk(f"{W}: Tööhõive jaotis olemas, REL 2021 joonis alles",r['sec'] and r['com'],r)
      chk(f"{W}: leiud kuvatud ja unikaalsed (ei dubleeru)",r['cards']==28 and r['uniq']==28 and r['nmk']==1,r)
      chk(f"{W}: iga leid viitab MKM PDF-ile ja piirangule",r['cited'] and r['lim'])
      chk(f"{W}: A/B eristus ja andmelüngad",r['A']==19 and r['B']==9 and r['gaps']>=6,r)
      chk(f"{W}: horisontaalset kerimist ei ole",r['ov']<=1,r['ov'])
      await pg.click('[data-mkmc="A"]');await pg.wait_for_timeout(300)
      n=await pg.evaluate('document.querySelectorAll("#k9-too .k9mkm-c").length');chk(f"{W}: filter A",n==19,n)
      await pg.select_option('[data-mkmt]','Pendelränne');await pg.wait_for_timeout(300)
      n=await pg.evaluate('document.querySelectorAll("#k9-too .k9mkm-c").length');chk(f"{W}: teemafilter",n==3,n)
      await pg.screenshot(path=f'{OUT}/mkm_{W}.png',full_page=False)
      await pg.goto(PAGE+'#andmed/k9-all');await pg.wait_for_timeout(2500)
      await pg.evaluate('document.querySelector("#k9-mkmreg").open=true');
      n=await pg.evaluate('document.querySelectorAll("#k9-mkmreg tbody tr").length');chk(f"{W}: register (kasutatud) kuvatud",n==20,n)
      await pg.click('[data-mkmr="all"]');await pg.wait_for_timeout(300)
      n=await pg.evaluate('document.querySelectorAll("#k9-mkmreg tbody tr").length');chk(f"{W}: register kõik 112",n==112,n)
      await pg.click('[data-mkmr="NG"]');await pg.wait_for_timeout(300)
      n=await pg.evaluate('document.querySelectorAll("#k9-mkmreg tbody tr").length');chk(f"{W}: avamata/töötlemata 7",n==7,n)
      chk(f"{W}: konsoolis vigu ei ole",not errs,errs[:3]);await pg.close()
    await b.close()
  print(f"\nKOKKU: {len(OK)} läbitud, {len(BAD)} ebaõnnestus")
asyncio.run(main())
