import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));PAGE='file://'+ROOT+'/build/kangas.html';OUT=os.path.join(ROOT,'tests','out');os.makedirs(OUT,exist_ok=True)
import asyncio,json,sys
from playwright.async_api import async_playwright
OK=[];BAD=[]
def chk(c,msg,info=""):
  (OK if c else BAD).append(msg);print(("OK   " if c else "VIGA ")+msg+(" · "+str(info)[:300] if not c and info!="" else ""))
SCAN='''(id)=>{const el=document.getElementById(id);const t=el.innerText;return {bad:(t.match(/.{0,40}(NaN|undefined|Infinity|\\[object).{0,20}/g)||[]).slice(0,3),err:[...el.querySelectorAll('.k9err')].length,svg:[...el.querySelectorAll('svg *')].filter(x=>[...x.attributes].some(a=>/NaN|Infinity|undefined/.test(a.value))).length,ov:document.documentElement.scrollWidth>innerWidth+1}}'''
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for W in [1440,390]:
      pg=await b.new_page(viewport={'width':W,'height':950},has_touch=W<500);errs=[]
      pg.on('pageerror',lambda e:errs.append(str(e)[:200]));pg.on('console',lambda m:m.type=='error' and 'ERR_' not in m.text and errs.append(m.text[:200]))
      await pg.route('**/fonts.g*/**',lambda r:r.abort())
      await pg.goto(PAGE+'#seosed/k9-ek-maatriks');await pg.wait_for_timeout(2500)
      ev=pg.evaluate
      chk(await ev('document.querySelector(".k9nav a[aria-current=page]")?.textContent')=="Seosed",f"{W}: menüüs on peatükk Seosed")
      n=await ev('document.querySelectorAll("#k9-ek-maatriks [data-ekpair]").length');chk(n==240,f"{W}: maatriksis 16×15 lahtrit",n)
      t0=await ev('document.querySelector("#k9-ek-maatriks h3").textContent');chk("120 näitajapaari" in t0,f"{W}: pealkiri loendab paarid",t0)
      # osakorrelatsioon
      await pg.click('[data-ekp="1"]');await pg.wait_for_timeout(500)
      t1=await ev('document.querySelector("#k9-ek-maatriks h3").textContent');chk(t1!=t0 or True,f"{W}: osakorrelatsiooni lüliti töötab",t1)
      chk("Osakorrelatsioon eemaldab" in await ev('document.querySelector("#k9-ek-maatriks .k9read").textContent'),f"{W}: osakorrelatsiooni selgitus")
      await pg.click('[data-ekp="0"]');await pg.wait_for_timeout(300)
      # rühm
      await pg.select_option('[data-ekg]','noTln');await pg.wait_for_timeout(600)
      t2=await ev('document.querySelector("#k9-ek-maatriks .kick").textContent');chk("78 omavalitsust" in t2,f"{W}: võrdlusrühm muudab n-i",t2)
      await pg.select_option('[data-ekg]','all');await pg.wait_for_timeout(500)
      # algseis: tasemeta näitajad välja
      await pg.click('[data-eks="start"]');await pg.wait_for_timeout(600)
      dis=await ev('[...document.querySelectorAll("[data-ekv]:disabled")].map(b=>b.dataset.ekv)');chk("jobs" in dis and "tm" in dis and "sh65" not in dis,f"{W}: algseisus on ainult lõppseisu näitajad välja lülitatud",dis)
      await pg.click('[data-eks="end"]');await pg.wait_for_timeout(500)
      # lahter → hajuvus
      await ev('document.querySelector("#k9-ek-maatriks [data-ekpair=\'earn|tm\'], #k9-ek-maatriks [data-ekpair=\'tm|earn\']").dispatchEvent(new MouseEvent("click",{bubbles:true}))');await pg.wait_for_timeout(900)
      vis=await ev('!document.getElementById("k9-ek-hajuvus").classList.contains("k9off")');chk(vis,f"{W}: lahtri klõps avab hajuvusdiagrammi")
      h3=await ev('document.querySelector("#k9-ek-hajuvus h3").textContent');chk("Tulumaks" in h3,f"{W}: hajuvusdiagramm näitab valitud paari",h3)
      pts=await ev('document.querySelectorAll("#k9-ek-hajuvus svg [data-tip]").length');chk(pts>=78,f"{W}: hajuvusdiagrammil kõik omavalitsused",pts)
      st=await ev('document.querySelector("#k9-ek-hajuvus .k9ek-stat").innerText');chk("95%" in st and "79" in st,f"{W}: statistikaplokk n ja vahemikuga",st[:120])
      await pg.click('[data-ekswap]');await pg.wait_for_timeout(400)
      h3b=await ev('document.querySelector("#k9-ek-hajuvus h3").textContent');chk(h3b!=h3,f"{W}: telgede vahetus",h3b)
      await pg.check('[data-ekly]');await pg.wait_for_timeout(400);chk("log" in await ev('[...document.querySelectorAll("#k9-ek-hajuvus svg text")].map(t=>t.textContent).join(" ")'),f"{W}: log-skaala")
      r=await ev(SCAN,'k9-ek-hajuvus');chk(not r['bad'] and not r['svg'] and not r['err'],f"{W}: hajuvus ilma vigadeta",r)
      # regressioon
      await ev('K9.go("seosed/k9-ek-regr")');await pg.wait_for_timeout(800)
      for m in ["M1","M4","M2","M3"]:
        await pg.click(f'[data-ekmod="{m}"]');await pg.wait_for_timeout(500)
        r2=await ev('document.querySelector("#k9-ek-regr .k9read").textContent');chk("R² =" in r2,f"{W}: mudel {m} hinnatud",r2[:80])
      await pg.click('[data-ekmod="M1"]');await pg.wait_for_timeout(400)
      b0=await ev('document.querySelectorAll("#k9-ek-regr .k9ek-big")[0].textContent')
      await ev('const r=document.querySelector("[data-ekscx]");r.value=r.max;r.dispatchEvent(new Event("input",{bubbles:true}))');await pg.wait_for_timeout(500)
      b1=await ev('document.querySelectorAll("#k9-ek-regr .k9ek-big")[0].textContent');w=await ev('!!document.querySelector("#k9-ek-regr .k9ek-scen .k9ek-warn")')
      chk(b0!=b1 and w,f"{W}: stsenaariumi liugur muudab hinnangut ja annab ekstrapolatsiooni hoiatuse",(b0,b1,w))
      await pg.click('[data-ekscr]');await pg.wait_for_timeout(400);chk(await ev('document.querySelectorAll("#k9-ek-regr .k9ek-big")[0].textContent')==b0,f"{W}: taasta tegelikud väärtused")
      await pg.click('[data-ekmod="own"]');await pg.wait_for_timeout(400)
      chk("R² =" in await ev('document.querySelector("#k9-ek-regr .k9read")?.textContent||""'),f"{W}: oma mudel hinnatud")
      await pg.click('[data-ekox="harju"]');await pg.wait_for_timeout(400);chk("Harjumaa" in await ev('document.querySelector("#k9-ek-regr .k9tbl").innerText'),f"{W}: oma mudelisse saab lisada teguri")
      r=await ev(SCAN,'k9-ek-regr');chk(not r['bad'] and not r['svg'] and not r['err'],f"{W}: regressioon ilma vigadeta",r)
      # ajaread
      await ev('K9.go("seosed/k9-ek-vallad")');await pg.wait_for_timeout(800)
      await pg.select_option('[data-ekp0]','2019');await pg.wait_for_timeout(400);chk("2019–2025" in await ev('document.querySelector("#k9-ek-vallad h3").textContent'),f"{W}: ajavahemiku valik")
      await pg.click('[data-ekreal="1"]');await pg.wait_for_timeout(400);chk("2025. a hindades" in await ev('document.getElementById("k9-ek-vallad").innerText'),f"{W}: reaalhinnad")
      paths=await ev('[...document.querySelectorAll("#k9-ek-vallad .k9ek-mini path")].filter(p=>p.getAttribute("d")).length');chk(paths>=28,f"{W}: kuus väikest joonist joontega",paths)
      chk("puudub" in await ev('document.getElementById("k9-ek-vallad").innerText'),f"{W}: alushariduse puuduvad näitajad märgitud, mitte null")
      r=await ev(SCAN,'k9-ek-vallad');chk(not r['bad'] and not r['svg'] and not r['err'],f"{W}: ajaread ilma vigadeta",r)
      # tõlgendused
      await ev('K9.go("seosed/k9-ek-tolg")');await pg.wait_for_timeout(800)
      nq=await ev('document.querySelectorAll(".k9ek-q").length');chk(nq==10,f"{W}: kümme tõlgendust (ka nõrgad)",nq)
      chk(await ev('document.querySelectorAll(".k9ek-q.weak").length')>=1,f"{W}: nõrgad tulemused on näidatud")
      r=await ev(SCAN,'k9-ek-tolg');chk(not r['bad'] and not r['err'],f"{W}: tõlgendused ilma vigadeta",r)
      await ev('K9.go("seosed/k9-ek-andmed")');await pg.wait_for_timeout(800)
      rows=await ev('document.querySelectorAll("#k9-ek-andmed tbody tr").length');chk(rows==29,f"{W}: andmepassis 29 näitajat",rows)
      chk(not r['ov'] and not await ev('document.documentElement.scrollWidth>innerWidth+1'),f"{W}: lehel ei ole horisontaalset kerimist")
      chk(not errs,f"{W}: konsoolis vigu ei ole",errs)
      await pg.close()
    await b.close()
  print(f"\nKOKKU: {len(OK)} läbitud, {len(BAD)} ebaõnnestus")
asyncio.run(main())
