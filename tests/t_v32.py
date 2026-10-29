import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));PAGE='file://'+ROOT+'/index.html';OUT=os.path.join(ROOT,'tests','out');os.makedirs(OUT,exist_ok=True)
# Sisulised regressioonitestid v32 (juured, võrdlusaasta, stsenaariumi kooskõla, kangas, teekonnad, kitsas ekraan)
import asyncio,json,re
from playwright.async_api import async_playwright
OK=[];BAD=[]
def chk(name,cond,info=""):
  (OK if cond else BAD).append(name);print(("OK  " if cond else "VIGA")+" "+name+(" · "+str(info) if info else ""))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1440,'height':950});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));await pg.route('**/fonts.g*/**',lambda r:r.abort())
    await pg.goto(PAGE+'');await pg.wait_for_timeout(3000)
    # 1 algvaade
    r=await pg.evaluate('({tab:document.querySelector("[data-tab][aria-selected=true]").dataset.tab,wsh:document.querySelector("[data-k9=wsh]").textContent,h1:document.querySelector("#k9 .k9view:not([hidden]) h1").textContent,finds:document.querySelectorAll(".k9find").length,howto:!!document.querySelector(".k9howto")})')
    chk("algvaates avaneb arengupuu, pealkiri Raplamaa arengukangas",r['tab']=='puu' and r['wsh']=='Arengupuu' and r['h1']=='Raplamaa arengukangas',r)
    chk("avalehel 4–6 järeldust ja kasutusjuhis",4<=r['finds']<=6 and r['howto'],r['finds'])
    # 2 juurte klõpsud (hiir), ajaloolised juured
    await pg.evaluate('K9.wsTab("puu")');await pg.wait_for_timeout(1200)
    async def rootclick(key,part):
      sel=f'.k9treemap g.k9node[data-p="root/{key}"] {part}'
      await pg.locator(sel).first.scroll_into_view_if_needed();await pg.wait_for_timeout(200)
      bb=await pg.locator(sel).first.bounding_box()
      await pg.mouse.click(bb['x']+bb['width']/2,bb['y']+bb['height']/2);await pg.wait_for_timeout(700)
      return await pg.evaluate('document.querySelector(".k9tpanel h3").textContent+" | "+(document.querySelector(".k9tpanel .k9phead, .k9tpanel .k9pv")?.textContent||document.querySelector(".k9tpanel").innerText.slice(0,200))')
    for key,name,val in [("mo","Väljaränne","10 786"),("d","Surmad","4 253"),("mi","Sisseränne",None),("b","Sünnid",None)]:
      for part,lab in [("circle:not([fill=transparent])","ring"),("text","nimi")]:
        t=await rootclick(key,part)
        chk(f"juur {name}: {lab} avab õige paneeli",t.startswith(name) and (val is None or val in t),t[:90])
        await pg.evaluate('K9.tree.pending="";K9.render("ylevaade")');await pg.wait_for_timeout(500)
    # 3 kõigi sõlmede tabamisala (elementFromPoint) eri tasemetel ja suurendustel
    HIT='''(()=>{const bad=[];const M=document.querySelector(".k9treemap").getBoundingClientRect(),PN=document.querySelector(".k9treew .k9tpanel").getBoundingClientRect();document.querySelector(".k9treemap").scrollIntoView({block:"center"});document.querySelectorAll(".k9treemap .k9node[data-p]").forEach(n=>{const c=n.querySelector("circle:not([fill=transparent]),line,path");if(!c)return;const r=c.getBoundingClientRect();if(!r.width&&!r.height)return;const x=r.x+r.width/2,y=r.y+r.height/2;const M2=document.querySelector(".k9treemap").getBoundingClientRect();if(x<M2.left+2||y<M2.top+2||x>M2.right-2||y>M2.bottom-2||x<0||y<0||x>innerWidth||y>innerHeight)return;const ef=document.elementFromPoint(x,y);if(ef?.closest(".k9tzoom,.k9mini,.k9top"))return;const h=document.elementFromPoint(x,y),hn=h&&h.closest("[data-p]");if(!hn||hn.dataset.p!==n.dataset.p)bad.push(n.dataset.p+"→"+(hn?hn.dataset.p:h&&h.tagName));});return bad;})()'''
    for path in ["","edu","edu/Kohila","pop/Rapla","bud/Marjamaa"]:
      await pg.evaluate(f'K9.tree.pending="{path}";K9.render("ylevaade")');await pg.wait_for_timeout(1400)
      bad=await pg.evaluate(HIT);chk(f"tabamisalad õiged: puu '{path or 'tervik'}'",not bad,bad[:4])
      for z in ["in","in"]:
        await pg.click('.k9treew [data-zoom="in"]');await pg.wait_for_timeout(700)
      bad=await pg.evaluate(HIT);chk(f"tabamisalad õiged suurendatult: '{path or 'tervik'}'",not bad,bad[:4])
      await pg.click('.k9treew [data-zoom="reset"]');await pg.wait_for_timeout(500)
    # klaviatuur juurtel
    await pg.evaluate('K9.tree.pending="";K9.render("ylevaade")');await pg.wait_for_timeout(800)
    await pg.focus('.k9treemap g.k9node[data-p="root/mo"]');await pg.keyboard.press('Enter');await pg.wait_for_timeout(700)
    t=await pg.evaluate('document.querySelector(".k9tpanel h3").textContent');chk("klaviatuur: Enter väljarände juurel",t.startswith("Väljaränne"),t)
    # 4 juurte ajarežiim
    await pg.evaluate('S.year=2036;');await pg.click('.k9tbar [data-rmode="year"]');await pg.wait_for_timeout(900)
    await pg.evaluate('K9.tree.pending="root/mi";K9.render("ylevaade")');await pg.wait_for_timeout(800)
    t=await pg.evaluate('document.querySelector(".k9tpanel").innerText')
    chk("valitud aasta vood: sisseränne prognoosiaastal = puudub (mudel annab ainult saldo)","mudel annab ainult rändesaldo" in t,t[:160].replace("\n"," "))
    await pg.evaluate('S.year=2020;K9.tree.pending="root/b";K9.render("ylevaade")');await pg.wait_for_timeout(800)
    t=await pg.evaluate('document.querySelector(".k9tpanel").innerText');v=await pg.evaluate('POP.MAAK.b[YI(2020)]')
    chk("valitud aasta vood: sünnid 2020 = registreeritud väärtus",f"{int(v):,}".replace(","," ") in t,v)
    await pg.click('.k9tbar [data-rmode="hist"]');await pg.wait_for_timeout(500);await pg.evaluate('S.year=2036;K9.tree.pending="";K9.render("ylevaade")')
    # 5 stsenaariumi kooskõla: lisaränne +100, režiim "kõik" ja "ainult rändemuster"
    await pg.evaluate('K9.setS({extra:100},"test")');await pg.wait_for_timeout(500)
    CONS='''(()=>{const u="MAAK",r=K9.patRange(u,YN);const lead=document.querySelector('[data-k9="lead"]').textContent;
      K9.go("stsenaariumid");const t=[...document.querySelectorAll('#k9-vrd table')][0];const vrd=[...t.querySelectorAll("tbody tr")].map(tr=>tr.children[2].textContent);
      const port=[...document.querySelectorAll('#k9-port .k9pt svg text.t-num')].map(x=>x.textContent);
      const maar=[...document.querySelectorAll('#k9-maar tbody tr')][0].children[3].textContent;
      K9.go("rahvastik");const pg_=[...document.querySelectorAll('#k9-progn tbody tr')][0].children[5].textContent;K9.go("ylevaade");
      return {r:r.map(Math.round),lead,vrd,port,maar,pg:pg_};})()'''
    c=await pg.evaluate(CONS);fmt=lambda x:f"{x:,}".replace(","," ")
    lo,hi=fmt(round(c['r'][0]/10)*10),fmt(round(c['r'][1]/10)*10)  # v46: prognoosid kuvatakse 10 inimese täpsusega
    chk("+100: lühivaade, portreed, võrdlustabel, määramatus ja prognoos annavad sama vahemiku",lo in c['lead'] and hi in c['lead'] and lo in c['maar'] and hi in c['maar'] and lo in c['pg'] and min(int(x.replace(" ","").replace("\u00a0","")) for x in c['port'])==c['r'][0] and max(int(x.replace(" ","").replace("\u00a0","")) for x in c['vrd'])==c['r'][1],c)
    chk("+100 režiimis 'koos eeldustega' vahemik 31 646–34 292",c['r']==[31646,34292],c['r'])
    await pg.evaluate('K9.setMode("mig")');await pg.wait_for_timeout(600)
    c2=await pg.evaluate(CONS)
    chk("režiim 'ainult rändemuster': vahemik 30 621–33 266 kõigis vaadetes",c2['r']==[30621,33266] and "30 620" in c2['lead'] and "30 620" in c2['maar'],c2['r'])
    lk=await pg.evaluate('(K9.go("stsenaariumid"),{ex:S.extra,dis:document.querySelector("#k9ex").disabled})')
    chk("režiim 'ainult rändemuster': hoovad baasil ja lukus",lk['ex']==0 and lk['dis'],lk)
    await pg.evaluate('K9.setMode("all")');await pg.wait_for_timeout(500)
    chk("tagasi režiimi 'koos eeldustega': lisaränne taastub",await pg.evaluate('S.extra')==100)
    await pg.evaluate('K9.resetAll()');await pg.wait_for_timeout(500)
    chk("Taasta baaseeldused",await pg.evaluate('S.extra===0&&S.mig==="mean"&&S.smode==="all"'))
    # 6 võrdlusaasta
    await pg.evaluate('K9.go("stsenaariumid/k9-port")');await pg.wait_for_timeout(700)
    await pg.evaluate('const r=document.getElementById("k9pcmp");r.value=2020;r.dispatchEvent(new Event("input",{bubbles:true}))');await pg.wait_for_timeout(900)
    v=await pg.evaluate('''(()=>{const tr=[...document.querySelectorAll('#k9-port table tbody tr')][1];const c=[...tr.children].map(x=>x.textContent);const exp=(popAt("MAAK",YN,"mean",S.extra,S.fert)/popT("MAAK",2020)-1)*100;return {c:c.slice(0,4),exp,leg:document.querySelector('#k9-port .k9leg').textContent,title:document.querySelector('#k9-port h3').textContent};})()''')
    chk("võrdlusaasta 2020: tabeli muutus = N(2036)/N(2020)−1",v['c'][1]==fmt(round(await pg.evaluate('popT("MAAK",2020)'))) and abs(float(v['c'][3].replace("−","-").replace("%","").replace(",",".").replace("+",""))-v['exp'])<0.06,v)
    chk("võrdlusaasta 2020: legend ja pealkiri sama baasiga","2020" in v['leg'] and "2020" in v['title'])
    chk("võrdlusaasta ei muuda prognoosi",await pg.evaluate('Math.round(popT("MAAK",YN))')==32151)
    # 7 kangas: klaviatuur ja detail = tabel
    await pg.evaluate('K9.go("ylevaade/k9-kangas")');await pg.wait_for_timeout(800)
    await pg.focus('[data-cell="pop|2026"]');await pg.keyboard.press('ArrowDown');await pg.keyboard.press('ArrowRight');await pg.keyboard.press('ArrowRight');await pg.keyboard.press('Enter');await pg.wait_for_timeout(600)
    d=await pg.evaluate('''(()=>{const h=document.querySelector(".k9kdet h3").textContent,v=document.querySelector(".k9kdet dd b")?.textContent,tbl=[...document.querySelectorAll('#k9-kangas figcaption table tbody tr')].find(tr=>tr.children[0].textContent==="65+ osakaal");const col=[...document.querySelectorAll('#k9-kangas figcaption table thead th')].findIndex(th=>th.textContent==="2028");return {h,v,t:tbl?tbl.children[col].textContent:null,sel:document.querySelector('[data-cell="old|2028"]').getAttribute("aria-pressed")};})()''')
    chk("kangas: klaviatuur avab õige märgi (65+ osakaal 2028)",d['h'].strip().startswith("65+ osakaal · 2028") and d['sel']=="true",d)
    chk("kangas: detaili väärtus = seotud tabeli väärtus",d['v'] and d['t'] and d['t'].startswith(d['v']),d)
    fields=await pg.evaluate('[...document.querySelectorAll(".k9kdet dt")].map(x=>x.textContent)')
    need=["Väärtus","Definitsioon","Ühik","Vaatlusperiood","Piirkond","Andmeolek","Kontrolli staatus","Võrdlusbaas ja skaala","Allikas","Valem","Sisendid ja eeldused","Piirangud"]
    chk("kangas: detailis kõik nõutud väljad",all(x in fields for x in need),[x for x in need if x not in fields])
    await pg.click('[data-row="la"]');await pg.wait_for_timeout(500)
    rr=await pg.evaluate('({h:document.querySelector(".k9kdet h3").textContent,strip:!!document.querySelector(".k9kdet .k9krow svg"),dt:[...document.querySelectorAll(".k9kdet dt")].map(x=>x.textContent)})')
    chk("kangas: rea valik avab kogu kirivöö (muster, ajatelg, võrdlusbaas)",rr['h'].strip().startswith("Kirivöö: Hinnatud lasteaianõudlus") and rr['strip'] and "Võrdlusbaas ja skaala" in rr['dt'] and "Ajatelg" in rr['dt'],rr['h'])
    # 8 teekond: Haridus → Kohila → Kohila Gümnaasiumi põhikooliosa → 2036 → Kaardivaade → tagasi
    await pg.evaluate('S.year=2036;K9.go("ylevaade/k9-puu");K9.tree.pending="edu/Kohila";K9.render("ylevaade")');await pg.wait_for_timeout(1400)
    leaf=await pg.evaluate('[...document.querySelectorAll(".k9treemap .k9node[data-p^=\\"edu/Kohila/\\"]")].map(n=>[n.dataset.p,n.getAttribute("aria-label")]).find(x=>/põhikooliosa/.test(x[1]))')
    await pg.evaluate(f'K9.tree.pending={json.dumps(leaf[0])};K9.render("ylevaade")');await pg.wait_for_timeout(1000)
    src=await pg.evaluate('document.querySelector(".k9tpanel").innerText')
    chk("kooliosa paneelis täpse lähtekirje olek",("Täpne lähtekirje" in src and "kontrollimata" in src),"")
    await pg.click('.k9tpanel [data-atl]');await pg.wait_for_timeout(1500)
    a=await pg.evaluate('({v:K9.st.view,txt:document.querySelector(".k9apanel .k9actx")?.innerText||"",y:S.year})')
    chk("kaardivaade selgitab kooli terviku ja osa",a['v']=="atlas" and "kool tervikuna" in a['txt'] and "põhikooliosa" in a['txt'] and a['y']==2036,a['txt'][:150].replace("\n"," "))
    await pg.click('.k9apanel [data-backtree]');await pg.wait_for_timeout(1500)
    back=await pg.evaluate('({v:K9.st.view,h:document.querySelector(".k9tpanel h3")?.textContent,y:S.year,tab:document.querySelector("[data-tab][aria-selected=true]").dataset.tab})')
    chk("tagasi arengupuusse säilitab alamobjekti ja aasta",back['v']=="ylevaade" and back['tab']=="puu" and "põhikooliosa" in (back['h'] or "") and back['y']==2036,back)
    # 9 vanad lingid ja katvus ja eesmärgid
    await pg.evaluate('K9.show("#ylevaade/k9-teljed")');await pg.wait_for_timeout(500);chk("vana link #ylevaade/k9-teljed → Stsenaariumid",await pg.evaluate('K9.st.view')=="stsenaariumid")
    await pg.evaluate('K9.show("#rahvastik/k9-eesm")');await pg.wait_for_timeout(800);chk("vana link #rahvastik/k9-eesm → Eesmärgid ja seire",await pg.evaluate('K9.st.view')=="eesmargid")
    g=await pg.evaluate('document.querySelector("[data-part=hinnang]").innerText')
    m=re.search(r'hõlmab (\d+) ametlikku',g);chk("koondhinnang ei sisalda Kohila laste arvu ega Märjamaa baasstsenaariumi",m and "Kohila laste (0–14) arv püsib — mudeli võrdlusrida" in g and "Märjamaa: arengukava baasstsenaarium — arengukava stsenaarium" in g,m.group(0) if m else g[:200])
    await pg.evaluate('K9.go("andmed/k9-katvus")');await pg.wait_for_timeout(800)
    cv=await pg.evaluate('''(()=>{const t=[...document.querySelectorAll(".k9covt")].find(x=>x.querySelector("caption").textContent==="Rapla vald");const tr=[...t.querySelectorAll("tbody tr")].find(r=>/aruanne/i.test(r.children[0].textContent));const col=[...t.querySelectorAll("thead th")].findIndex(th=>th.textContent==="2017");return tr.children[col].textContent;})()''')
    chk("katvus: Rapla 2017 aruanne = osaliselt kontrollitud, 63/93",("osaliselt kontrollitud" in cv and "63/93 kirjet kontrollitud" in cv and "osaliselt loetud" in cv),cv[:140])
    # 10 kitsas ekraan
    await pg.set_viewport_size({'width':390,'height':844})
    for v in ["ylevaade","stsenaariumid","eesmargid","andmed","teenused","atlas"]:
      await pg.evaluate(f'K9.go("{v}")');await pg.wait_for_timeout(900)
      w=await pg.evaluate('document.documentElement.scrollWidth');chk(f"kitsas ekraan ({v}): ei kerita horisontaalselt",w<=392,w)
    await pg.evaluate('K9.go("ylevaade/k9-kangas")');await pg.wait_for_timeout(900)
    await pg.locator('[data-cell="tax|2030"]').tap() if False else await pg.click('[data-cell="tax|2030"]');await pg.wait_for_timeout(500)
    dd=await pg.evaluate('({h:document.querySelector(".k9kdet h3")?.textContent,w:document.querySelector(".k9kdet").getBoundingClientRect().width})')
    chk("kitsas ekraan: kangas-märgi detail avaneb ja mahub",dd['h'] and dd['h'].strip().startswith("Tulumaks") and dd['w']<=390,dd)
    chk("konsoolis vigu ei ole",not errs,errs[:3])
    await b.close()
asyncio.run(main())
print(f"\nKOKKU: {len(OK)} läbitud, {len(BAD)} ebaõnnestus");[print(" -",x) for x in BAD]
