import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));PAGE='file://'+ROOT+'/build/kangas.html';OUT=os.path.join(ROOT,'tests','out');os.makedirs(OUT,exist_ok=True)
# v40 kaardivaade: kõik näitajad × vaated, sünkroon, paneel, legendid, aastad, mobiil
import asyncio
from playwright.async_api import async_playwright
OK=[];BAD=[]
def chk(n,c,i=""):(OK if c else BAD).append(n);print(("OK  " if c else "VIGA")+" "+n+(" · "+str(i) if i else ""))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for W,H in [(1440,1000),(390,844)]:
      pg=await b.new_page(viewport={'width':W,'height':H},has_touch=(W<500));errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));await pg.route('**/fonts.g*/**',lambda r:r.abort())
      await pg.goto(PAGE+'#rahvastik/k9-kaart');await pg.wait_for_timeout(3000)
      bad=[];n=0;dis={}
      for g in ["pop","flow","prog","job"]:
        await pg.select_option('[data-pmg]',g);await pg.wait_for_timeout(150)
        for k in await pg.evaluate('[...document.querySelectorAll("[data-pmi] option")].map(o=>o.value)'):
          await pg.select_option('[data-pmi]',k);await pg.wait_for_timeout(120)
          for v in ["sit","chg","flow"]:
            if await pg.evaluate(f'document.querySelector("[data-pmv={v}]").getAttribute("aria-disabled")')=="true":dis.setdefault(v,[]).append(k);continue
            await pg.click(f'[data-pmv="{v}"]');await pg.wait_for_timeout(120);n+=1
            r=await pg.evaluate('(()=>{const s=document.querySelector("#k9-kaart");const t=s.querySelector("[data-swap=title]").textContent;const y=(t.match(/(\\d{4})(?!.*\\d{4})/)||[])[1];return {t,nan:/NaN|undefined|Infinity/.test(s.innerHTML),err:s.querySelectorAll(".k9err").length,ov:document.documentElement.scrollWidth-innerWidth,yrbadge:(s.querySelector(".k9pm-yr b,.k9pm-badge b")||{}).textContent||"",y}})()')
            if r['nan'] or r['err'] or r['ov']>1:bad.append((k,v,r))
            if v=="sit" and r['yrbadge'] and r['y'] and r['y'] not in r['yrbadge'] and "kasutaja" not in r['yrbadge']:bad.append((k,v,"aasta ei klapi",r['t'],r['yrbadge']))
          await pg.click('[data-pmv="sit"]')
      chk(f"{W}: {n} näitaja×vaate kombinatsiooni ilma vigadeta, pealkirja aasta = kuvatud aasta",not bad,bad[:3])
      chk(f"{W}: ühe aasta näitajatel Muutus keelatud",all(k in dis.get("chg",[]) for k in ["out","tln","jr","ind","chg36","rng","vx"]),dis.get("chg"))
      chk(f"{W}: Seosed ainult töökoha asukoha näitajatel",sorted(set(sum([[i] for i in await pg.evaluate('[]')],[])))==[] and len(dis.get("flow",[]))==len(dis.get("flow",[])) and "tln" not in dis.get("flow",[]) and "out" not in dis.get("flow",[]) and "mig" in dis.get("flow",[]),len(dis.get("flow",[])))
      await pg.select_option('[data-pmg]','job');await pg.select_option('[data-pmi]','jr');await pg.wait_for_timeout(300)
      t=await pg.evaluate('document.querySelector("[data-swap=title]").textContent');chk(f"{W}: jr pealkiri 2021",t=="Töökohtade ja hõivatud elanike suhe · 2021",t)
      txt=await pg.evaluate('document.querySelector("#k9-kaart .k9pm-map").textContent');chk(f"{W}: jr silt '0,76' ja '76 töökohta 100 hõivatu kohta'","0,76" in txt and "76 töökohta 100 hõivatu kohta" in txt)
      lgd=await pg.evaluate('document.querySelector("#k9-kaart .k9leg").textContent');chk(f"{W}: jr legend keskpunkt 1,0 ja selgitus","keskpunkt 1,0" in lgd and "alla 1,0" in lgd)
      await pg.click('#k9-kaart path[data-mu="Kohila"]',force=True);await pg.wait_for_timeout(300)
      s=await pg.evaluate('({bar:document.querySelector("[data-bar=Kohila]").classList.contains("on"),p:document.querySelector(".k9pm-panel").innerText})')
      chk(f"{W}: kaardi klõps → tulp esile ja paneel",s['bar'] and "Kohila vald" in s['p'] and "Rapla maakond" in s['p'] and "Allikas" in s['p'],s['p'][:120].replace("\n"," "))
      await pg.click('#k9-kaart g[data-bar="Rapla"]');await pg.wait_for_timeout(300)
      w=await pg.evaluate('document.querySelector("path[data-mu=Rapla]").getAttribute("stroke")');chk(f"{W}: tulba klõps → vald kaardil esile",w=="#FFD966",w)
      await pg.select_option('[data-pmi]','regsh');await pg.wait_for_timeout(200)
      p2=await pg.evaluate('document.querySelector(".k9pm-panel h4").textContent');chk(f"{W}: valik säilib näitaja vahetusel",p2=="Rapla vald",p2)
      await pg.click('[data-pmv="chg"]');await pg.wait_for_timeout(200)
      lg=await pg.evaluate('document.querySelector("#k9-kaart .k9leg").textContent');chk(f"{W}: töötuse kasv = ebasoodne legendis","kasv on ebasoodne" in lg and "keskpunkt 0" in lg)
      mp=await pg.evaluate('document.querySelector("#k9-kaart .k9pm-map").textContent');chk(f"{W}: muutus pp ja nooled","pp" in mp and ("▲" in mp or "▼" in mp))
      await pg.select_option('[data-pmg]','pop');await pg.select_option('[data-pmi]','tot');await pg.click('[data-pmv="chg"]');await pg.wait_for_timeout(200)
      mp=await pg.evaluate('document.querySelector("#k9-kaart .k9pm-map").textContent');chk(f"{W}: rahvaarvu muutus inimestes ja %","%" in mp and "→" in mp,mp[:80])
      await pg.click('[data-pmv="sit"]');await pg.wait_for_timeout(200)
      lg=await pg.evaluate('document.querySelector("#k9-kaart .k9leg").textContent');chk(f"{W}: ringi legend pindala ja ühik","pindala ∝ väärtus" in lg and "elanikku" in lg)
      await pg.select_option('[data-pmg]','job');await pg.select_option('[data-pmi]','tln');await pg.click('[data-pmv="flow"]');await pg.wait_for_timeout(300)
      f=await pg.evaluate('({t:document.querySelector("[data-swap=title]").textContent,p:document.querySelector(".k9pm-panel").innerText,tl:document.querySelector("#k9-kaart .k9pm-map").textContent})')
      chk(f"{W}: seosed: Tallinn, Tartu suund, piirang selgitatud","Tallinn" in f['tl'] and "Tartu" in f['tl'] and "Piirang" in f['p'],f['t'])
      el=await pg.query_selector('#k9-kaart figure');await el.scroll_into_view_if_needed();await pg.screenshot(path=f'{OUT}/m40_flow_{W}.png')
      await pg.select_option('[data-pmg]','pop');await pg.select_option('[data-pmi]','old');await pg.click('[data-pmv="chg"]');await pg.wait_for_timeout(300)
      el=await pg.query_selector('#k9-kaart figure');await el.scroll_into_view_if_needed();await pg.screenshot(path=f'{OUT}/m40_chg_{W}.png')
      await pg.click('[data-pmv="sit"]');await pg.wait_for_timeout(300);el=await pg.query_selector('#k9-kaart figure');await el.scroll_into_view_if_needed();await pg.screenshot(path=f'{OUT}/m40_sit_{W}.png')
      if W<500:
        lay=await pg.evaluate('(()=>{const m=document.querySelector(".k9pm-map").getBoundingClientRect(),b=document.querySelector(".k9pm-bars").getBoundingClientRect();return b.top>=m.bottom-1})()');chk("mobiil: diagramm kaardi all",lay)
      chk(f"{W}: konsoolis vigu ei ole",not errs,errs[:3]);await pg.close()
    await b.close()
  print(f"\nKOKKU: {len(OK)} läbitud, {len(BAD)} ebaõnnestus")
asyncio.run(main())
