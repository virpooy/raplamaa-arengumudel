import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));PAGE='file://'+ROOT+'/index.html';OUT=os.path.join(ROOT,'tests','out');os.makedirs(OUT,exist_ok=True)
import asyncio,json,re
from playwright.async_api import async_playwright
OK=[];BAD=[]
def chk(c,m,i=""):
  (OK if c else BAD).append(m);print(("OK   " if c else "VIGA ")+m+("" if c else " · "+str(i)[:300]))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1440,'height':950});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]));pg.on('console',lambda m:m.type=='error' and 'ERR_' not in m.text and errs.append(m.text[:300]))
    await pg.route('**/fonts.g*/**',lambda r:r.abort())
    await pg.goto(PAGE+'#ylevaade?u=Kehtna&mig=r3&extra=40');await pg.wait_for_timeout(3000)
    ev=pg.evaluate
    st=await ev('JSON.stringify({u:S.unit,mig:S.mig,extra:S.extra})');chk('"Kehtna"' in st and 'r3' in st and '40' in st,"jagamislink taastab piirkonna ja stsenaariumi",st)
    p36=await ev('Math.round(popT("Kehtna",2036)/10)*10');print('pop36',p36)
    want=f"{p36:,}".replace(","," ")
    # rahvastikuprognoos tabel
    await ev('K9.go("rahvastik/k9-progn")');await pg.wait_for_timeout(900)
    t=await ev('document.getElementById("k9-progn").innerText');chk(re.search(r"Kehtna vald\s+5 328\s+≈ [\d ]+\s+≈ "+want.replace(" ","[  ]"),t) is not None,"prognoositabel = mudeli väärtus samas stsenaariumis",want)
    # otsusekaart
    await ev('K9.go("otsused/k9-ot-kaart")');await pg.wait_for_timeout(900)
    t=await ev('document.querySelector(".k9card").innerText');chk(("≈ "+want) in t.replace(" "," ").replace("\xa0"," "),"otsusekaart kasutab sama stsenaariumi tulemust",want)
    # ülevaate juhtlause
    await ev('K9.go("stsenaariumid/k9-maar")');await pg.wait_for_timeout(900)
    t=await ev('document.getElementById("k9-maar").innerText');chk(want in t.replace(" "," ").replace("\xa0"," "),"määramatuse tabel kasutab sama tulemust",want)
    tt=await ev('document.querySelector("[data-part=sens] .k9read")?.innerText||""');chk("Rahvaarv 2036" in tt,"tundlikkusanalüüs on määramatuse jaotises",tt[:80])
    # sõnastus: tõenäosusvahemik
    all_txt=""
    for v in ["ylevaade","rahvastik","stsenaariumid","otsused","andmed"]:
      await ev(f'K9.go("{v}")');await pg.wait_for_timeout(500)
      await ev('''document.querySelectorAll('#k9 section.k9sec').forEach(s=>s.classList.remove('k9off'))''');await pg.wait_for_timeout(200)
      all_txt+=await ev(f'document.querySelector(\'#k9 .k9view[data-view="{v}"]\').innerText')
    all_txt=all_txt.replace("„80% simulatsioonivahemik”","");chk("80% simulatsioonivahemik" not in all_txt and "80% vahemik" not in all_txt,"„80% vahemikku” ei nimetata enam simulatsiooni-/usaldusvahemikuks")
    # staatiline kiht
    await ev('K9.go("atlas")');await pg.wait_for_timeout(1200)
    await ev('const r=document.getElementById("k9atlY");r.value=2033;r.dispatchEvent(new Event("input",{bubbles:true}))');await pg.wait_for_timeout(800)
    s=await ev('document.querySelector(".k9astatic")?.innerText||""');chk("2033" in s and "2021" in s,"staatilise kihi andmeaasta on aastaliuguri muutmisel nähtav",s[:200])
    await ev('K9.go("rahvastik/k9-kaart")');await pg.wait_for_timeout(900)
    await ev('const c=document.querySelector("[data-pms]");if(c&&!c.checked){c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}))}');await pg.wait_for_timeout(600)
    s=await ev('document.querySelector(".k9pmstatic")?.innerText||""');chk("2021" in s,"rahvastiku kaardil asulate ringide andmeaasta teade",s[:150])
    pas=await ev('document.querySelector("#k9-kaart .k9pass")?.textContent||""');chk("Pärimine" in pas and "Vaatlusperiood" in pas,"kaardi näitaja andmepass: vaatlusperiood ja pärimisaeg eraldi",pas[:200])
    # register: puuduv ei ole null
    await ev('K9.go("teenused/k9-svreg")');await pg.wait_for_timeout(900)
    occ=await ev('[...document.querySelectorAll("#k9-svreg tbody tr")].map(r=>r.lastElementChild.innerText)');chk(all("puudub" in x for x in occ) and len(occ)>20,"täituvust ei arvutata ilma kohtade arvuta",occ[:3])
    z=await ev('[...document.querySelectorAll("#k9-svreg tbody td")].filter(td=>/^0( |$)/.test(td.innerText.trim())).length');chk(z==0,"registris ei ole näilisi nulle",z)
    await ev('''const ta=document.querySelector("[data-svjson]");ta.value=JSON.stringify([{id:"ehis-nimi:rapla-vesiroosi-kool",cap:{v:600,y:"2025/26",src:"test"}},{id:"ehis-nimi:rapla-kesklinna-kool",cap:{v:500,y:"2024/25",src:"test"}}]);document.querySelector("[data-svimp]").click()''');await pg.wait_for_timeout(500)
    rows=await ev('[...document.querySelectorAll("#k9-svreg tbody tr")].filter(r=>/Vesiroosi|Kesklinna Kool/.test(r.innerText)).map(r=>r.lastElementChild.innerText)');chk(len(rows)==2 and "91%" in rows[0] and "eri vaatlusaeg" in rows[1],"täituvus ainult võrreldava vaatlusajaga",rows)
    # hinnaalus
    await ev('K9.go("eelarve/k9-tm")');await pg.wait_for_timeout(800)
    h=await ev('document.querySelector("[data-k9=taxl] h3").innerText');chk("jooksevhindades" in h,"eelarve hinnaalus on pealkirjas",h)
    # klaviatuur: arengupuu ja kaart
    await ev('K9.go("ylevaade")');await pg.wait_for_timeout(900)
    await pg.focus('svg.k9tree [data-p="edu"]');await pg.keyboard.press('Enter');await pg.wait_for_timeout(400)
    chk("Haridus" in (await ev('document.querySelector(".k9tpanel h3")?.innerText||""')),"arengupuu töötab klaviatuuriga")
    await ev('K9.go("rahvastik/k9-kaart")');await pg.wait_for_timeout(800)
    await pg.focus('.k9pm-map');await pg.keyboard.press('+');await pg.wait_for_timeout(400)
    chk((await ev('document.querySelector("[data-pmzl]").textContent'))!="100%","kaardi suum klaviatuuriga")
    chk(not errs,"konsoolis vigu ei ole",errs)
    print(f"\nKOKKU: {len(OK)} läbitud, {len(BAD)} ebaõnnestus");await b.close()
asyncio.run(main())
