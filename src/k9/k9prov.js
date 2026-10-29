/* ---------- ANDMETE PÄRITOLU JA OLEK (v46) ----------
   Üks register: allikas → kirjeldus, link, pärimise aeg (millal kangasse laaditi) ja allika uuendusaeg (millal allikas avaldas).
   Vaatlusperiood (mille kohta andmed käivad) on kihi/näitaja juures eraldi. Puuduva väärtuse liigid on ühtsed kogu kangas. */
(function(){
  const B="05.–08.10.2026";
  const SRC={
    RV0240:{n:"Rahvastik soo, vanuse ja elukoha järgi, 1. jaanuar",o:"Statistikaamet",u:"https://andmed.stat.ee/et/stat/rahvastik__rahvastikunaitajad-ja-koosseis__rahvaarv-ja-rahvastiku-koosseis/RV0240",f:B},
    RV0282U:{n:"Rahvastik vanuserühma ja haldusüksuse järgi, 1. jaanuar",o:"Statistikaamet",u:"https://andmed.stat.ee/et/stat/RV0282U",f:B},
    RVR02:{n:"Ränne haldusüksuse järgi",o:"Statistikaamet",u:"https://andmed.stat.ee/et/stat/rahvastik__rahvastikusundmused__ranne/RVR02",f:B},
    RV112U:{n:"Elussündinud haldusüksuse järgi",o:"Statistikaamet",u:"https://andmed.stat.ee/et/stat/RV112U",f:B},
    RV49U:{n:"Surnud haldusüksuse järgi",o:"Statistikaamet",u:"https://andmed.stat.ee/et/stat/RV49U",f:B},
    RL21003:{n:"Rahvaloendus 2021: püsielanikud asustusüksuse järgi",o:"Statistikaamet",u:"https://andmed.stat.ee/et/stat/RL21003",f:"11.10.2026",upd:"2022"},
    RL21163:{n:"Rahvaloendus 2021: hõivatud töökoha asukoha ja elukoha järgi",o:"Statistikaamet",u:"https://andmed.stat.ee/et/stat/RL21163",f:"17.10.2026",upd:"05.12.2022"},
    RL21217:{n:"Rahvaloendus 2021: eluruumid ja mugavused",o:"Statistikaamet",u:"https://andmed.stat.ee/et/stat/RL21217",f:B,upd:"2022"},
    EH46U:{n:"Kasutusse lubatud uued eluruumid",o:"Statistikaamet (ehitisregister)",u:"https://andmed.stat.ee/et/stat/EH46U",f:B},
    RR300:{n:"Kohalike eelarvete põhitegevuse tulud, kulud ja tulem",o:"Statistikaamet",u:"https://andmed.stat.ee/et/stat/majandus__rahandus__valitsemissektori-rahandus__kohalike-omavalitsuste-eelarve/RR300",f:"11.10.2026",upd:"16.06.2026"},
    MTA:{n:"Omavalitsustele üle kantud tulumaks kuude kaupa",o:"Maksu- ja Tolliamet",u:"https://www.emta.ee/",f:B},
    EHIS:{n:"Haridusasutused, õppijad ja asukohad",o:"Haridus- ja Noorteamet (EHIS)",u:"https://www.haridussilm.ee/",f:B,upd:"10.11.2025"},
    TT065:{n:"Registreeritud töötud haldusüksuse järgi",o:"Statistikaamet / Töötukassa",u:"https://andmed.stat.ee/et/stat/TT065",f:"17.10.2026",upd:"14.10.2026"},
    PA107:{n:"Keskmine brutokuupalk ja töötajate arv haldusüksuse järgi",o:"Statistikaamet",u:"https://andmed.stat.ee/et/stat/PA107",f:"17.10.2026",upd:"05.03.2026"},
    UA08:{n:"Tööga seotud tulu elukoha järgi (eksperimentaalstatistika)",o:"Statistikaamet",u:"https://andmed.stat.ee/et/stat/UA08",f:"17.10.2026",upd:"12.02.2026"},
    RV06U:{n:"Demograafiline tööturusurveindeks",o:"Statistikaamet",u:"https://andmed.stat.ee/et/stat/RV06U",f:"17.10.2026",upd:"19.05.2026"},
    IA002:{n:"Tarbijahinnaindeks",o:"Statistikaamet",u:"https://andmed.stat.ee/et/stat/IA002",f:"20.10.2026"},
    EHAK:{n:"Haldus- ja asustusjaotus (EHAK), valdade piirid",o:"Maa- ja Ruumiamet",u:"https://geoportaal.maaamet.ee/",f:B,upd:"haldusjaotus 01.01.2018"},
    MODEL:{n:"Kohortmudel v6 (prognoos)",o:"arengukangas",u:"#andmed/k9-eeld",f:"mudel 08.10.2026"}};
  /* puuduva väärtuse liigid: null ei ole kunagi 0 */
  const MISS={zero:{t:"0",d:"mõõdetud null"},na:{t:"puudub",d:"andmeid ei ole kogutud või kangasse laaditud"},unp:{t:"avaldamata",d:"allikas ei avalda (nt konfidentsiaalsus, ebakindel valim)"},nap:{t:"ei kohaldu",d:"näitaja ei ole selle objekti puhul mõtestatud"},user:{t:"kasutaja sisend",d:"väärtus on kasutaja määratud eeldus, mitte mõõtmine"},demo:{t:"näidis",d:"selgelt märgistatud näidisväärtus, mitte tegelik andmeväärtus"}};
  const e=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  const srcLinks=codes=>(codes||[]).map(c=>{const s=SRC[c];return s?`<a href="${e(s.u)}" target="_blank" rel="noopener" title="${e(s.n)}">${e(s.o==="Statistikaamet"?c:s.o+(c!==s.o?" "+c:""))}</a>`:e(c);}).join(", ");
  const fetched=codes=>[...new Set((codes||[]).map(c=>SRC[c]?`${c}: päritud ${SRC[c].f}${SRC[c].upd?`, allikas uuendatud ${SRC[c].upd}`:""}`:null).filter(Boolean))].join("; ");
  /* standardne andmepass: obs = vaatlusperiood, src = allikakoodid, level = ruumiline detailsus, st = andmeolek, lim = kasutuspiirang */
  function pass(p){const rows=[["Vaatlusperiood",p.obs],["Allikas",srcLinks(p.src)+(p.srcTxt?" "+e(p.srcTxt):"")],["Pärimine ja allika uuendus",e(fetched(p.src)||p.fetched||"–")],["Ruumiline detailsus",e(p.level||"vald")],["Andmeolek",e(p.st||"mõõdetud")],["Olulised piirangud",e(p.lim||"–")]];
    return `<dl class="k9pass">${rows.map(r=>`<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join("")}</dl>`;}
  /* määramatuse mõistete ühtne selgitus */
  const UNC={
    mc:"Juhusliku kõikumise vahemik (80%) on 300 simulatsiooni 10. ja 90. protsentiil valitud eeldustel: sünnid kõiguvad juhuslikult (Poissoni jaotus) ja aastane rändesaldo kõigub nagu 2016–2025 (robustne hälve). See EI OLE tõenäosus, et tegelik rahvaarv jääb vahemikku: see ei arvesta rändemustri, sündimuse ega suremuse eelduse viga, aastate vahelist sõltuvust ega valdade ühist kõikumist (maakonna vahemik on seetõttu liiga kitsas). Tagasitestis (2016–2021 teadmine → 2026) oli tegelik viga kolmes vallas neljast sellisest vahemikust suurem.",
    rng:"Rändemustrite ulatus (min–max) on viie võrdselt võimaliku rändemustri tulemuste vähim ja suurim väärtus. See on stsenaariumide ulatus, mitte statistiline prognoosivahemik ega tõenäosus.",
    bt:"Sõltumatu tagasitest: mudelile antakse ainult 2016–2021 teadmine, prognoositakse 1.01.2022–1.01.2026 ja võrreldakse tegelikuga. Kalibreerimise kooskõlakontroll (sama perioodi andmetega) ei ole prognoositäpsuse mõõt."};
  /* mudeli ja metoodika muudatuste logi (arvutusmudel v6 on muutumatu; kasutajaliidese versioon kasvab) */
  const CHLOG=[
    ["v46","20.10.2026","Metoodika: „80% simulatsioonivahemik” nimetati „juhusliku kõikumise vahemikuks (80%)” ja selgitati, et see ei ole prognoosi tõenäosusvahemik; stsenaariumide min–max on eraldi nimetatud. Lisati tagasitest horisondi ja vanuserühma kaupa, ühe teguri kaupa tundlikkusanalüüs, prognooside kuvamine 10 inimese täpsusega, eelarve püsivhinnad (THI 2016–2025 + muudetav inflatsioonieeldus), andmepassid ja staatiliste kihtide teated, teenuste register, ligipääsetavuse ja arendusalade andmeliides, tegevusvariantide võrdlus ja otsusekaart. Arvutusmudeli valemid ei muutunud."],
    ["v45","19.10.2026","Kaartide suum ja asulate nimed suumides. Arvutused ei muutunud."],
    ["v43","17.10.2026","Uus peatükk Seosed (79 omavalitsuse ristlõige, korrelatsioon ja regressioon). Arvutusmudel ei muutunud."],
    ["v41","17.10.2026","Parandused: jagamislingi hoobade piirid, maakonna rändevood arengupuus, tekstide arvud. Hõive baas 64,1% (2023–25 keskmine), varem 68,5%."],
    ["v6","08.10.2026","Arvutusmudel: kohortmudel, rändemustrid 2016–2026, kalibreerimine ja tagasitest."]];
  K9.part("chlog",{html:()=>`<div data-k9="chl"></div>`,update(h){h.querySelector('[data-k9="chl"]').innerHTML=K9.fig({kick:"Versioonid",title:"Mudeli ja metoodika muudatuste logi",body:K9.table(["Versioon","Kuupäev","Muudatus"],CHLOG.map(r=>r.map(e)),{textCols:[0,1,2]})});}});
  K9.PROV={SRC,MISS,pass,srcLinks,fetched,UNC,CHLOG};
})();
