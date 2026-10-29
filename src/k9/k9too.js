/* ---------- TÖÖTURG AMETLIKU STATISTIKA PÕHJAL (Rahvastik → Tööhõive) · v35 ---------- */
(function(){
  const T=window.TOO_DATA;if(!T)return;
  const {C,VC,e,n0,lg,fig,table}=K9;
  const f1=x=>x==null?"–":nf1.format(x),f0=x=>x==null?"–":n0(x),pct=(a,b)=>a==null||b==null?"–":(a/b-1>=0?"+":"−")+nf1.format(Math.abs(100*(a/b-1)))+"%";
  const dpp=(a,b)=>a==null||b==null?"–":(a-b>=0?"+":"−")+nf1.format(Math.abs(a-b))+" pp";
  const dn=(a,b)=>a==null||b==null?"–":(a-b>=0?"+":"−")+n0(Math.abs(a-b));
  const R4=["Rapla maakond","Eesti","Harju maakond","Järva maakond"],VL=["Kehtna vald","Kohila vald","Märjamaa vald","Rapla vald"];
  const RC={"Rapla maakond":C.ink,"Eesti":C.mut,"Harju maakond":C.sc,"Järva maakond":C.op,"Kehtna vald":VC.Kehtna,"Kohila vald":VC.Kohila,"Märjamaa vald":VC.Marjamaa,"Rapla vald":VC.Rapla};
  const SH={"Rapla maakond":"Rapla mk","Eesti":"Eesti","Harju maakond":"Harju mk","Järva maakond":"Järva mk","Kehtna vald":"Kehtna","Kohila vald":"Kohila","Märjamaa vald":"Märjamaa","Rapla vald":"Rapla v"};
  const M=T.meta,src=(...ts)=>ts.map(t=>`<a href="${e(M[t].url)}" target="_blank" rel="noopener">${t}</a> (uuendatud ${e(M[t].upd)})`).join("; ");
  const filt=(...ts)=>ts.map(t=>`<b>${t}:</b> ${e(M[t].filt)}`).join("<br>");
  const Y=Object.keys(T.emp["Eesti"]),YR=Object.keys(T.reg["Eesti"]["Vanuserühmad kokku"]);
  const pts=(o,ys)=>(ys||Object.keys(o)).map(y=>[+y,o[y]]);
  const avg=a=>{const b=a.filter(x=>x!=null);return b.length?b.reduce((s,x)=>s+x,0)/b.length:null;};
  const m9=(r,yr)=>avg(T.regm[r][yr].slice(0,9));
  let EMODE="emp",RMODE="n";
  const EM={emp:["Tööhõive määr 15–74","emp","%"],e2064:["Tööhõive määr 20–64","emp2064","%"],part:["Tööjõus osalemise määr 15–74","part","%"]};
  function empFig(W){const [lab,key]=EM[EMODE];const ys=Object.keys(T[key]["Eesti"]);
    const body=K9.lines({W,x0:+ys[0],x1:2025,series:R4.map(r=>({name:SH[r],col:RC[r],w:r==="Rapla maakond"?3:1.8,pts:pts(T[key][r],ys)})),fmt:f1,unitLab:"%",label:lab+" "+ys[0]+"–2025",warp:false,xStep:W<600?2:1});
    const d=T[key];return fig({kick:"Eesti tööjõu-uuring · elukoha järgi",title:`${lab}, ${ys[0]}–2025`,
      read:`Rapla maakonna ${lab.toLowerCase()} oli 2025. aastal ${f1(d["Rapla maakond"]["2025"])}% (Eesti ${f1(d["Eesti"]["2025"])}%, Harju ${f1(d["Harju maakond"]["2025"])}%, Järva ${f1(d["Järva maakond"]["2025"])}%). Maakonna hinnang kõigub valimi tõttu aastast aastasse 2–3 pp, seega vaata pigem kolme aasta keskmist kui ühe aasta muutust.`,
      ctl:`<div class="k9seg" role="group" aria-label="Näitaja">${Object.entries(EM).map(([k,v])=>`<button type="button" data-tmode="${k}" aria-pressed="${k===EMODE}">${v[0].replace(" määr","")}</button>`).join("")}</div>`,
      legend:R4.map(r=>lg.act(RC[r],r)),body,
      table:table(["Aasta",...R4],ys.map(y=>[y,...R4.map(r=>f1(d[r][y]))])),
      method:`Määr = hõivatud (või tööjõud) / sama vanuserühma rahvastik × 100. Elukohapõhine: näitab, kui suur osa <i>Raplamaal elavatest</i> inimestest töötab, olenemata töökoha asukohast. 20–64 rida algab 2018. aastast (varem ei avaldata). Statistikaamet ei avalda maakonna väärtust, kui valim on liiga väike („.“); selliseid väärtusi ei asendata nulliga.`,
      src:src("TT4645","TT4661"),note:filt("TT4645")});}
  function unFig(W){const ys=Object.keys(T.unemp3["Eesti"]);
    const ser=R4.map(r=>({name:SH[r],col:RC[r],w:r==="Rapla maakond"?3:1.8,pts:pts(T.unemp3[r],ys)}));
    const body=K9.lines({W,x0:2015,x1:2025,series:[...ser,{name:"Rapla mk (aasta, kui avaldatud)",col:C.warn,w:1,op:.0001,noStitch:false,end:false,pts:Y.filter(y=>T.unemp["Rapla maakond"][y]!=null).map(y=>[+y,T.unemp["Rapla maakond"][y]])}],fmt:f1,unitLab:"%",label:"Töötuse määr",warp:false,xStep:W<600?2:1,zero:true});
    return fig({kick:"Eesti tööjõu-uuring · ILO töötus",title:"Töötuse määr 15–74, 2015–2025",
      read:`Raplamaa töötuse määr (3 aasta libisev keskmine) tõusis 4,7%-lt (2017–2019) 7,9%-ni (2022–2024) ja on alates 2022. aastast Eesti keskmisest kõrgem (2022–2024: Eesti 7,2%, Harju 7,0%, Järva 6,0%). Üksikaasta väärtust avaldatakse Raplamaa kohta harva (2018–2022 ja 2025 ei avaldata).`,
      legend:[...R4.map(r=>lg.act(RC[r],r+" – 3 aasta keskmine")),lg.act(C.warn,"Rapla mk üksikaasta (kollane märk)"),lg.miss("üksikaasta puudub = ei avaldata (ebakindel)")],body,
      table:table(["Aasta","Rapla mk aasta","Rapla mk 3 a","Eesti aasta","Eesti 3 a","Harju 3 a","Järva 3 a"],Y.map(y=>[y,T.unemp["Rapla maakond"][y]==null?"ei avaldata":f1(T.unemp["Rapla maakond"][y]),f1((T.unemp3["Rapla maakond"]||{})[y]),f1(T.unemp["Eesti"][y]),f1((T.unemp3["Eesti"]||{})[y]),f1((T.unemp3["Harju maakond"]||{})[y]),f1((T.unemp3["Järva maakond"]||{})[y])])),
      method:`Töötuse määr = töötud / tööjõud × 100 (ILO määratlus: ilma tööta, otsib aktiivselt tööd, valmis 2 nädala jooksul alustama). Ei sõltu Töötukassas registreerumisest ja ei ole võrreldav registreeritud töötusega. 3 aasta libisev keskmine (TT443) on Statistikaameti ametlik maakonnanäitaja väikese valimi kompenseerimiseks: 2024 = 2022–2024 keskmine. Töötuse määra ei ole tuletatud tööhõive määrast.`,
      src:src("TT443","TT4645"),note:filt("TT443","TT4645")});}
  function regFig(W){const sh=RMODE==="s",regs=["Rapla maakond",...VL];
    const val=(r,y)=>sh?T.regsh[r][y]:T.reg[r]["Vanuserühmad kokku"][y];
    const body=K9.lines({W,x0:2015,x1:2025,series:regs.map(r=>({name:SH[r],col:RC[r],w:r==="Rapla maakond"?3:1.8,pts:YR.map(y=>[+y,val(r,y)])})),fmt:sh?f1:f0,unitLab:sh?"% 15–64-aastastest":"inimest (kuude keskmine)",label:"Registreeritud töötud",warp:false,xStep:W<600?2:1,zero:!sh});
    return fig({kick:"Töötukassa register · elukoha järgi",title:"Registreeritud töötud valdade kaupa, 2015–2025",
      read:`Registreeritud töötute arv tõusis 2020. aastal hüppeliselt (747 → 1 079) ja oli kõrgeim 2021 (1 160). 2025. aastal oli maakonnas keskmiselt 1 004 registreeritud töötut. 2026. aasta jaanuar–september: ${f0(m9("Rapla maakond","2026"))} (2025 samal perioodil ${f0(m9("Rapla maakond","2025"))}, ${pct(m9("Rapla maakond","2026"),m9("Rapla maakond","2025"))}).`,
      ctl:`<div class="k9seg" role="group" aria-label="Ühik"><button type="button" data-rmode="n" aria-pressed="${!sh}">Arv</button><button type="button" data-rmode="s" aria-pressed="${sh}">Osakaal 15–64-aastastest (tuletatud)</button></div>`,
      legend:regs.map(r=>lg.act(RC[r],r)),body,
      table:table(["Aasta",...regs.map(r=>SH[r]),...(sh?[]:["Eesti","Harju mk","Järva mk"])],[...YR,"2026 (jaan–sept)"].map(y=>[y,...regs.map(r=>sh?f1(T.regsh[r][y]):f0(y.startsWith("2026")?m9(r,"2026"):T.reg[r]["Vanuserühmad kokku"][y])),...(sh?[]:["Eesti","Harju maakond","Järva maakond"].map(r=>f0(y.startsWith("2026")?m9(r,"2026"):T.reg[r]["Vanuserühmad kokku"][y])))])),
      method:`Registreeritud töötu = Töötukassas töötuna arvel olev inimene (aasta väärtus = 12 kuu lõpuseisu keskmine). Valla väärtus on elukoha järgi. Osakaal on <b>tuletatud</b>: registreeritud töötud / 15–64-aastaste arv 1. jaanuaril (Statistikaamet, mudeli rahvastikufail). See <b>ei ole</b> Töötukassa ametlik registreeritud töötuse määr, mille nimetaja on 16–pensioniealine tööjõud; valla tasemel tööjõu arvu ei avaldata. Töötukassa korrigeeris 2025. aasta jaanuaris registreeritud töötute aegrida tagasiulatuvalt; Statistikaameti tabel kajastab parandatud rida.`,
      src:src("TT065")+"; rahvastik: Statistikaamet RV0240 (mudeli andmestik)",note:filt("TT065")});}
  function wageTab(){const rs=["Eesti","Harju maakond","Järva maakond","Rapla maakond",...VL],ee=T.wage["Eesti"]["2025"],ei=T.inc["Eesti"]["2024"];
    return fig({kick:"Töötamise register + TSD · töökoha järgi",title:"Palk, töökohad ja elanike töötulu",
      read:`Raplamaa töökohtade keskmine brutokuupalk oli 2025. aastal 1 697 € ehk 81% Eesti keskmisest (mediaan 1 473 €, 85%). Maakonnas asuvate töökohtade töötajate arv vähenes 2021–2025 3,2% (10 523 → 10 188). Elanike tööga seotud tulu inimese kohta oli 2024. aastal 92% Eesti keskmisest; Kohila elanikel 101%, kuigi Kohilas asuvate töökohtade palk on 85% Eesti keskmisest.`,
      body:table(["Piirkond","Keskmine brutokuupalk 2025, €","% Eestist","Mediaan 2025, €","Palga muutus 2021–25","Töötajate arv 2025 (töökohad)","Muutus 2021–25","Elanike töötulu 2024, €/isik/aastas","% Eestist"],
        rs.map(r=>({sel:r==="Rapla maakond",c:[e(r),f0(T.wage[r]["2025"]),Math.round(100*T.wage[r]["2025"]/ee)+"%",f0(T.wmed[r]["2025"]),pct(T.wage[r]["2025"],T.wage[r]["2021"]),f0(T.jobs[r]["2025"]),`${dn(T.jobs[r]["2025"],T.jobs[r]["2021"])} (${pct(T.jobs[r]["2025"],T.jobs[r]["2021"])})`,f0(T.inc[r]["2024"]),Math.round(100*T.inc[r]["2024"]/ei)+"%"]})),{textCols:[0]}),
      table:table(["Piirkond",...["2021","2022","2023","2024","2025"].map(y=>"Palk "+y),...["2021","2022","2023","2024","2025"].map(y=>"Töötajad "+y)],rs.map(r=>[e(r),...["2021","2022","2023","2024","2025"].map(y=>f0(T.wage[r][y])),...["2021","2022","2023","2024","2025"].map(y=>f0(T.jobs[r][y]))]),{textCols:[0]}),
      method:`<b>Palk ja töötajate arv (PA107)</b>: statistiline üksus on majandusüksus, töötaja = töölepingu või avaliku teenistuse alusel töötav isik; keskmine brutokuupalk = väljamaksed / tööpanus (täistööajale taandatud). Piirkonna jaotus on <b>töökohapõhine</b> (järeldus: Rapla maakonna töötajate arv 10 188 on palju väiksem kui maakonna elanikest hõivatute arv ~15 700, mis vastab maakonnas asuvatele töökohtadele, mitte elanikele). Aegrida on võrreldav alates 2021. aastast.<br><b>Elanike töötulu (UA08)</b>: eksperimentaalstatistika, elukohapõhine, aastane tööga seotud tulu (palk Eestist ja välismaalt, ettevõtlustulu) inimese kohta, kellel see tulu oli. Ei ole täistööajale taandatud ega võrreldav kuupalgaga.<br>Palgatöötajate arv (PA107) ≠ hõivatute arv (ETU, sisaldab ettevõtjaid ja FIE-sid) ≠ töökohtade arv.`,
      src:src("PA107","UA08"),note:filt("PA107","UA08")});}
  function comTab(){const rs=["Rapla maakond",...VL];
    return fig({kick:"Rahvaloendus 2021 + töötamise register",title:"Kus valla elanikud töötavad ja kui palju on vallas töökohti",
      read:`2021. aasta lõpus töötas 44,6% Raplamaa hõivatud elanikest väljaspool maakonda ja 27,8% Tallinnas. Kohilas olid need osakaalud 63,0% ja 42,8%. Vallas asuvaid palgatöökohti oli Kohilas 0,54 iga hõivatud elaniku kohta, Rapla vallas 0,76 (tuletatud suhe).`,
      body:table(["Elukoht","Hõivatud elanikud 31.12.2021","Töötab samas vallas","Teises vallas maakonnas","Väljaspool maakonda","sh Tallinnas","Palgatöökohti vallas 2021 (PA107)","Töökohti hõivatud elaniku kohta (tuletatud)"],
        rs.map(r=>{const c=T.com[r];return {sel:r==="Kohila vald",c:[e(r),f0(c["Kokku"]),f1(100*c["Samas KOV"]/c["Kokku"])+"%",f1(100*c["Erinevas KOV samas mk"]/c["Kokku"])+"%",f1(100*c["Erinevas maakonnas"]/c["Kokku"])+"%",f1(100*c["Tallinnas"]/c["Kokku"])+"%",f0(T.jobs[r]["2021"]),(T.jobs[r]["2021"]/c["Kokku"]).toFixed(2).replace(".",",")]};}),{textCols:[0]}),
      method:`Hõivatud töökoha asukoha järgi: registripõhine rahvaloendus seisuga 31.12.2021 (uuemat valla tasemel pendelrände statistikat ei avaldata). „Töökohti hõivatud elaniku kohta“ = PA107 töötajate arv 2021 / hõivatud elanike arv 2021; kaks eri allikat ja definitsiooni (palgatöötajad töökohas vs. kõik hõivatud elukohas), seetõttu ainult suunda näitav suhe. Suhe alla 1 tähendab, et vallas on vähem palgatöökohti kui seal elab hõivatuid.`,
      src:src("RL21163","PA107"),note:filt("RL21163")});}
  function secFig(W){const S=Object.entries(T.comsec).filter(([k,c])=>k!=="Tegevusalad kokku"&&k!=="Tegevusala teadmata"&&c["Kokku"]>=100).sort((a,b)=>b[1]["Kokku"]-a[1]["Kokku"]);
    const narrow=W<640,L=narrow?150:250,R=60,rh=22,H=S.length*rh+34,X=v=>L+(W-L-R)*v/S[0][1]["Kokku"];
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Raplamaa hõivatud tegevusala ja töökoha asukoha järgi 2021">`;
    S.forEach(([k,c],i)=>{const y=20+i*rh,a=c["Elukoha maakonnas"],b=c["Erinevas maakonnas"]+c["Välismaal"],t=c["Kokku"];
      s+=`<text x="${L-8}" y="${y+12}" text-anchor="end" class="t-lab">${e(narrow&&k.length>24?k.slice(0,23)+"…":k)}</text><rect x="${L}" y="${y+2}" width="${X(a)-L}" height="14" fill="${C.gain}" fill-opacity=".85"${K9.tipAttr(K9.tipHTML(k,[["kokku",f0(t)],["töötab maakonnas",f0(a)],["väljaspool maakonda",f0(b)],["sh Tallinnas",f0(c["Tallinnas"])]]))}/><rect x="${X(a)}" y="${y+2}" width="${X(a+b)-X(a)}" height="14" fill="none" stroke="${C.loss}" stroke-width="1.4"/><text x="${X(t)+6}" y="${y+13}" class="t-num">${Math.round(100*b/t)}%</text>`;});
    s+=`<text x="${L}" y="12" class="t-cap">hõivatud elanikud (täis = töötab maakonnas, kontuur = väljaspool); % = väljaspool maakonda</text></svg>`;
    return fig({kick:"Rahvaloendus 2021 · Rapla maakonna elanikud",title:"Pendelränne tegevusala järgi",
      read:"Väljaspool maakonda töötab 90% info- ja side, 65% avaliku halduse ning 54% kaubanduse valdkonna hõivatutest; hariduses (21%) ja põllumajanduses (14%) töötatakse peamiselt kohapeal. Töötlev tööstus on suurim tegevusala (3 181 hõivatut) ja 69% neist töötab maakonnas.",
      legend:[lg.sq(C.gain,"töötab elukoha maakonnas"),lg.sq(C.loss,"töötab väljaspool maakonda (sh välismaal)",true)],body:s,
      table:table(["Tegevusala","Hõivatud","Elukoha maakonnas","Väljaspool maakonda","sh Tallinnas"],Object.entries(T.comsec).map(([k,c])=>[e(k),f0(c["Kokku"]),f0(c["Elukoha maakonnas"]),f0(c["Erinevas maakonnas"]),f0(c["Tallinnas"])]),{textCols:[0]}),
      src:src("RL21166"),note:filt("RL21166")});}
  function structTab(){const se=T.sect,sh=(r,g,y)=>se[r][g][y]==null?"ei avaldata":f1(100*se[r][g][y]/se[r]["Kokku – kõik tegevusalad"][y])+"%";
    const G=["Põllumajandus, metsamajandus ja kalapüük","Tööstus ja ehitus","Teenused"];
    const top=Object.keys(T.secv).filter(k=>k!=="Tegevusalad kokku"&&k!=="Tegevusala teadmata").sort((a,b)=>T.secv[b]["Rapla maakond"]-T.secv[a]["Rapla maakond"]).slice(0,8);
    return fig({kick:"Tööjõu-uuring ja rahvaloendus · elukoha järgi",title:"Hõive majandussektorite ja tegevusalade kaupa",
      read:"Tööstuse ja ehituse osa Raplamaa elanike hõives vähenes 2015–2025 34,9%-lt 31,1%-ni ja teenuste osa kasvas 57,8%-lt 64,0%-ni; tööstuse osa on endiselt suurem kui Eestis (25,6%). Valdade võrdluses on töötleva tööstuse osa suurim Kehtnas (23%) ja põllumajanduse osa Märjamaal (9%).",
      body:table(["Sektor",...R4.flatMap(r=>[SH[r]+" 2015",SH[r]+" 2025"])],G.map(g=>[e(g),...R4.flatMap(r=>[sh(r,g,"2015"),sh(r,g,"2025")])]),{textCols:[0]})+
        table(["Tegevusala (REL 2021)","Rapla mk","% hõivatutest",...VL.map(v=>SH[v]+" %"),"Eesti %"],top.map(k=>[e(k),f0(T.secv[k]["Rapla maakond"]),f1(100*T.secv[k]["Rapla maakond"]/T.secv["Tegevusalad kokku"]["Rapla maakond"])+"%",...VL.map(v=>f1(100*T.secv[k][v]/T.secv["Tegevusalad kokku"][v])+"%"),f1(100*T.secv[k]["Eesti"]/T.secv["Tegevusalad kokku"]["Eesti"])+"%"]),{textCols:[0]}),
      method:"Sektorid (TT241) = 15-aastased ja vanemad hõivatud elukoha maakonna järgi (tööjõu-uuring; seetõttu summa erineb veidi TT4645 15–74 arvust). Põllumajanduse väärtust 2024–2025 ei avaldata. Tegevusalad (RL21147) = rahvaloendus 31.12.2021, elukohapõhine, valla tasemel. Mõlemad näitavad elanike tööd, mitte maakonnas asuvaid töökohti.",
      src:src("TT241","RL21147"),note:filt("TT241","RL21147")});}
  function grpTab(){const r="Rapla maakond",ys=["2015","2018","2021","2023","2024","2025"],G=[["Mehed","sex","Mehed"],["Naised","sex","Naised"],["15–24","age","15-24-aastased"],["25–49","age","25-49-aastased"],["50–74","age","50-74-aastased"]];
    return fig({kick:"Tööjõu-uuring",title:"Tööhõive määr soo ja vanuserühma järgi",
      read:"Raplamaa meeste tööhõive määr (2023–2025 keskmine 65,5%) on naiste omast (62,7%) kõrgem; vahe on väiksem kui Harjus. Noorte (15–24) määra ei avaldata 2021, 2024 ja 2025, sest valim on liiga väike; vanuserühmade aastamuutusi ei saa usaldusväärselt tõlgendada.",
      body:table(["Rühm",...ys.map(y=>"Rapla "+y),"Eesti 2025","Harju 2025","Järva 2025"],G.map(([n,k,g])=>[n,...ys.map(y=>T[k][r][g][y]==null?"ei avaldata":f1(T[k][r][g][y])),f1(T[k]["Eesti"][g]["2025"]),f1(T[k]["Harju maakond"][g]["2025"]),T[k]["Järva maakond"][g]["2025"]==null?"ei avaldata":f1(T[k]["Järva maakond"][g]["2025"])]),{textCols:[0]}),
      method:"Määr = hõivatud / sama soo või vanuserühma rahvastik × 100. Väike valim: maakonna alarühma hinnangu veapiir võib ulatuda ±5 pp-ni. „Ei avaldata“ = Statistikaamet on väärtuse avaldamiseks ebakindlaks märkinud; seda ei asendata nulliga.",src:src("TT4661"),note:filt("TT4661")});}
  function dliTab(){const rs=["Eesti","Harju maakond","Järva maakond","Rapla maakond",...VL],ys=["2017","2020","2023","2024","2025","2026"];
    return fig({kick:"Rahvastikustatistika · 1. jaanuar",title:"Demograafiline tööturusurveindeks",
      read:"Indeks näitab, mitu 5–14-aastast on iga 55–64-aastase kohta ehk kas järgmise kümne aasta jooksul tööealisse ikka jõudjaid on rohkem kui sealt lahkujaid. 2026: Rapla maakond 0,84 (Eesti 0,88), Kohila 1,14 (ainus vald üle 1), Märjamaa 0,65.",
      body:table(["Piirkond",...ys],rs.map(r=>({sel:r==="Kohila vald",c:[e(r),...ys.map(y=>T.dli[r][y].toFixed(2).replace(".",","))]})),{textCols:[0]}),
      method:"Indeks = 5–14-aastaste arv / 55–64-aastaste arv. Alla 1 tähendab, et tööturule lähiaastatel sisenejaid on vähem kui pensioniikka jõudjaid (ilma rändeta). Mudeli rahvastikuprognoos arvestab sama struktuuri juba vanuserühmade kaupa.",src:src("RV06U"),note:filt("RV06U")});}
  function nowTab(){const q=T.etuq,K="Kesk-Eesti (Järva, Lääne-Viru, Rapla)",rs=["Rapla maakond",...VL,"Eesti","Harju maakond","Järva maakond"];
    const rows=[];
    rs.forEach(r=>rows.push([e(r)+" – registreeritud töötud, jaan–sept keskmine","inimest",f0(m9(r,"2025")),f0(m9(r,"2026")),pct(m9(r,"2026"),m9(r,"2025")),"TT065"]));
    rs.forEach(r=>rows.push([e(r)+" – registreeritud töötud, september","inimest",f0(T.regm[r]["2025"][8]),f0(T.regm[r]["2026"][8]),pct(T.regm[r]["2026"][8],T.regm[r]["2025"][8]),"TT065"]));
    ["Rapla maakond","Eesti"].forEach(r=>["2025 I kvartal|2026 I kvartal","2025 II kvartal|2026 II kvartal"].forEach(p=>{const [a,b]=p.split("|");rows.push([e(r)+` – keskmine brutokuupalk, ${b.slice(5)}`,"€",f0(T.wq[r][a]),f0(T.wq[r][b]),pct(T.wq[r][b],T.wq[r][a]),"PA117"]);rows.push([e(r)+` – töötajate arv, ${b.slice(5)}`,"töötajat",f0(T.jq[r][a]),f0(T.jq[r][b]),pct(T.jq[r][b],T.jq[r][a]),"PA117"]);}));
    [K,"Eesti"].forEach(r=>["2025 I kvartal|2026 I kvartal","2025 II kvartal|2026 II kvartal"].forEach(p=>{const [a,b]=p.split("|");rows.push([e(r)+` – tööhõive määr 15–74, ${b.slice(5)}`,"%",f1(q[r]["Tööhõive määr, %"][a]),f1(q[r]["Tööhõive määr, %"][b]),dpp(q[r]["Tööhõive määr, %"][b],q[r]["Tööhõive määr, %"][a]),"TT4660"]);}));
    return fig({kick:"Jooksev aasta",title:"2026: värskeimad andmed võrreldes 2025. aasta sama perioodiga",
      read:`Registreeritud töötuid oli Raplamaal 2026. aasta jaanuarist septembrini keskmiselt ${f0(m9("Rapla maakond","2026"))}, 2025. aasta samal ajal ${f0(m9("Rapla maakond","2025"))} (${pct(m9("Rapla maakond","2026"),m9("Rapla maakond","2025"))}; Eesti ${pct(m9("Eesti","2026"),m9("Eesti","2025"))}). Kohilas vähenes arv kõige vähem (${pct(m9("Kohila vald","2026"),m9("Kohila vald","2025"))}). Maakonna töökohtade palk kasvas I kvartalis 7,7% ja II kvartalis 5,0%, töötajate arv vähenes 2,7% ja 1,4%. Tööjõu-uuringu kvartaliandmeid avaldatakse ainult regiooni (Kesk-Eesti) kohta.`,
      body:table(["Näitaja","Ühik","2025 sama periood","2026","Muutus","Tabel"],rows,{textCols:[0,1,5]}),
      method:"Registreeritud töötud: viimane kuu september 2026 (TT065, uuendatud 14.10.2026). Palk: viimane kvartal 2026 II (PA117, uuendatud 02.09.2026). Tööjõu-uuring: viimane kvartal 2026 II, ainult regioonid (TT4660, uuendatud 11.08.2026); Kesk-Eesti hõlmab Järva, Lääne-Viru ja Rapla maakonda, seega ei ole see Raplamaa väärtus. Kvartaliväärtustel on hooajaline kõikumine, seetõttu võrreldakse sama kvartaliga.",
      src:src("TT065","PA117","TT4660"),note:filt("TT065","PA117","TT4660")});}
  function indTab(){const r="Rapla maakond",E="Eesti",H="Harju maakond",J="Järva maakond",row=(n,u,per,f,t,flt)=>[n,u,per,...[r,E,H,J].map(f),t,flt];
    const rows=[
      row("Hõivatute arv 15–74","tuhat","2025 (muutus vs 2015)",x=>`${f1(T.nemp[x]["2025"])} (${pct(T.nemp[x]["2025"],T.nemp[x]["2015"])})`,"TT4645","15–74, aasta"),
      row("Tööhõive määr 15–74","%","2025 (muutus vs 2015)",x=>`${f1(T.emp[x]["2025"])} (${dpp(T.emp[x]["2025"],T.emp[x]["2015"])})`,"TT4645","15–74"),
      row("Tööhõive määr 15–74, 3 a keskmine","%","2023–25 (vs 2015–17)",x=>{const a=avg(["2023","2024","2025"].map(y=>T.emp[x][y])),b=avg(["2015","2016","2017"].map(y=>T.emp[x][y]));return `${f1(a)} (${dpp(a,b)})`;},"TT4645","15–74; lihtkeskmine"),
      row("Tööhõive määr 20–64","%","2025 (muutus vs 2018)",x=>`${f1(T.emp2064[x]["2025"])} (${dpp(T.emp2064[x]["2025"],T.emp2064[x]["2018"])})`,"TT4645","20–64"),
      row("Tööjõus osalemise määr 15–74","%","2025 (muutus vs 2015)",x=>`${f1(T.part[x]["2025"])} (${dpp(T.part[x]["2025"],T.part[x]["2015"])})`,"TT4645","15–74"),
      row("Töötuse määr, 3 a libisev keskmine","%","2022–24 (vs 2017–19)",x=>`${f1(T.unemp3[x]["2024"])} (${dpp(T.unemp3[x]["2024"],T.unemp3[x]["2019"])})`,"TT443","15–74"),
      row("Registreeritud töötud","inimest, kuude keskmine","2025 (muutus vs 2015)",x=>`${f0(T.reg[x]["Vanuserühmad kokku"]["2025"])} (${pct(T.reg[x]["Vanuserühmad kokku"]["2025"],T.reg[x]["Vanuserühmad kokku"]["2015"])})`,"TT065","kõik vanused, mõlemad sood"),
      row("Keskmine brutokuupalk (töökoha järgi)","€","2025 (muutus vs 2021)",x=>`${f0(T.wage[x]["2025"])} (${pct(T.wage[x]["2025"],T.wage[x]["2021"])})`,"PA107","aasta"),
      row("Töötajate arv (töökoha järgi)","töötajat","2025 (muutus vs 2021)",x=>`${f0(T.jobs[x]["2025"])} (${pct(T.jobs[x]["2025"],T.jobs[x]["2021"])})`,"PA107","aasta"),
      row("Tööstuse ja ehituse osa hõives","%","2025 (vs 2015)",x=>{const s=T.sect[x],a=100*s["Tööstus ja ehitus"]["2025"]/s["Kokku – kõik tegevusalad"]["2025"],b=100*s["Tööstus ja ehitus"]["2015"]/s["Kokku – kõik tegevusalad"]["2015"];return `${f1(a)} (${dpp(a,b)})`;},"TT241","15+, elukoha järgi"),
      row("Väljaspool elukoha maakonda töötavad","% hõivatutest","31.12.2021",x=>f1(100*T.com[x]["Erinevas maakonnas"]/T.com[x]["Kokku"]),"RL21163","kõik hõivatud"),
      row("Demograafiline tööturusurveindeks","5–14 / 55–64","1.01.2026 (vs 2017)",x=>`${T.dli[x]["2026"].toFixed(2).replace(".",",")} (${T.dli[x]["2017"].toFixed(2).replace(".",",")})`,"RV06U","")];
    return fig({kick:"Koondtabel",title:"Näitajad: Raplamaa, Eesti, Harju ja Järva maakond",read:"Iga rea juures on periood, ühik ja allikatabel. Muutus on sulgudes: määrad protsendipunktides (pp), arvud protsentides.",
      body:table(["Näitaja","Ühik","Periood",r,E,H,J,"Tabel","Filtrid"],rows.map(x=>x.map((c,i)=>i===7?`<a href="${e(M[c].url)}" target="_blank" rel="noopener">${c}</a>`:c)),{textCols:[0,1,2,7,8]}),
      src:"Statistikaamet, andmed päritud API kaudu "+e(T.fetched)+". Kõik tabelid: "+Object.keys(M).map(t=>`<a href="${e(M[t].url)}" target="_blank" rel="noopener">${t}</a>`).join(", ")});}
  const FIND=[
    ["t","Raplamaa elanike tööhõive ei ole kümne aastaga kasvanud, Eestis on.","15–74-aastaste tööhõive määr: Rapla 2015–17 keskmine 63,8% → 2023–25 64,1%; Eesti 66,1% → 68,9%. Vahe Eesti keskmisega kasvas umbes 2,3 pp-lt 4,8 pp-ni. Hõivatuid elanikke oli 2025. aastal 15 700, 2015. aastal 16 600 (−5%), 15–74-aastaste rahvastik vähenes samal ajal 25 700-lt 24 800-ni (−4%).","TT4645"],
    ["t","Töötus on alates 2022. aastast Eesti keskmisest kõrgem.","Töötuse määra 3 aasta keskmine: Rapla 4,7% (2017–19) → 7,9% (2022–24); Eesti 5,5% → 7,2%, Harju 4,6% → 7,0%, Järva 5,1% → 6,0%. Üksikaasta määr on avaldatud vaid 2023 (10,6%) ja 2024 (7,0%).","TT443"],
    ["t","Registreeritud töötus on 2026. aastal selgelt vähenenud.","Jaanuar–september 2026: keskmiselt 811 registreeritud töötut, 2025 samal ajal 1 022 (−21%; Eesti −12%). Märjamaa −28%, Rapla vald −25%, Kehtna −18,5%, Kohila −8%. Tase on siiski kõrgem kui 2019 (747).","TT065"],
    ["t","Maakonnas asuvad töökohad maksavad vähem ja neid jääb vähemaks.","Keskmine brutokuupalk 2025: Rapla maakonnas 1 697 € (81% Eesti keskmisest; Järva 1 747 €). Töötajate arv maakonna töökohtadel vähenes 2021–2025 10 523-lt 10 188-ni (−3,2%); Eestis kasvas see 0,5%. 250+ töötajaga ettevõtteid maakonnas ei ole.","PA107 · ER0320"],
    ["t","Elanike sissetulek tugineb pealinna tööturule.","45% hõivatutest töötab väljaspool maakonda (Kohilas 63%). Elanike töötulu inimese kohta 2024 = 92% Eesti keskmisest; Kohilas 101%, Märjamaal 83%. Kohila elanike tulu on kõrgem kui Kohilas asuvate töökohtade palk.","RL21163 · UA08 · PA107"],
    ["t","Tööealiste juurdekasv on väike, v.a Kohila.","Demograafiline tööturusurveindeks 2026: maakond 0,84, Märjamaa 0,65, Kehtna 0,78, Rapla vald 0,83, Kohila 1,14 (2023: 1,30).","RV06U"],
    ["s","Võimalik seletus: töötuse tõus ja palgatöökohtade vähenemine langevad ajaliselt kokku tööstuse ja ehituse osa vähenemisega.","Tööstuse ja ehituse osa elanike hõives langes 38,0%-lt (2019) 31,1%-ni (2025). Andmed ei näita põhjuslikku seost; kontrollimiseks on vaja tegevusalade kaupa töökohtade ja koondamiste andmeid.","TT241"],
    ["u","Uurimist vajab: miks Kohila registreeritud töötus väheneb aeglasemalt?","Kohila osakaal (tuletatud, 15–64-aastastest) oli 2026 jaan–sept 4,0%, maakonnas 3,9%. Kas põhjus on Harju tööturu jahtumises (Kohila elanikud töötavad Tallinnas) või sisserände struktuuris, ei selgu nendest andmetest.","TT065 · RL21163"]];
  const KIND={t:["Andmetega tõendatud","ok"],s:["Võimalik seletus","warn"],u:["Uurida edasi","na"]};
  function findings(){return `<div class="k9too-find">${FIND.map(([k,h,t,s])=>`<article class="k9too-c k9too-${k}"><span class="k9too-k">${KIND[k][0]}</span><h4>${e(h)}</h4><p>${e(t)}</p><small>${e(s)}</small></article>`).join("")}</div>`;}
  const PRACT=[
    ["Ettevõtlusalad ja kohalikud töökohad","Maakonnas on 0,65 palgatöökohta hõivatud elaniku kohta (2021) ja töökohtade arv väheneb. Uute ettevõtlusalade kavandamisel on alus hinnata tööstuse ja logistika töökohti eraldi, sest just need on maakonnas (69% töötleva tööstuse hõivatutest töötab maakonnas).","t"],
    ["Elamuarendus ja töökohtade tasakaal","Kohila kasv põhineb Tallinna töökohtadel (43% hõivatutest töötab Tallinnas, töökohti 0,54 elaniku kohta). Uus elamuarendus suurendab pendelrännet, kui sellega ei kaasne kohalikke töökohti. Kohila puhul on otstarbekas siduda detailplaneeringute mõjuhinnang pendelrände ja ühistranspordi koormusega.","s"],
    ["Pendelränne ja transport","7 184 maakonna elanikku töötas 2021. aastal väljaspool maakonda. Rapla–Tallinn ja Kohila–Tallinn ühenduse sagedus ja kestus on otseselt seotud elanike sissetulekuga (elanike töötulu > kohalike töökohtade palk).","t"],
    ["Tööealine elanikkond ja teenused","Tööturusurveindeks alla 1 kõigis valdades peale Kohila: ilma sisserändeta väheneb tööealiste arv. Kanga rahvastikuprognoos arvestab seda; hõive tase (64%) jääb Eesti keskmisest madalamaks, mistõttu mõjub tulumaksule iga protsendipunkt hõivet.","t"],
    ["Mudeli muudatus","Tulumaksu hõivehoob on nüüd ankurdatud Raplamaa enda tasemele (64,1%, 2023–25 keskmine) senise Eesti 68,5% asemel. Baastulemus ei muutu, sest valem kasutab suhtelist muutust; hoova väärtus ja eelseadistus „−2,5 pp“ vastavad nüüd Raplamaa tegelikule tasemele.","t"]];
  const GAPS=[
    "Valla tasemel tööhõive, töötuse ja tööjõus osalemise määra ei avaldata (tööjõu-uuringu valim on liiga väike). Valla kohta on ainult registriandmed: registreeritud töötud, palk ja töötajad töökoha järgi, töötulu elukoha järgi ja REL 2021.",
    "Raplamaa üksikaasta töötuse määr puudub 2018–2022 ja 2025 („ei avaldata“). Kasutatud on ametlikku 3 aasta libisevat keskmist (TT443, viimane 2022–2024).",
    "Registreeritud töötuse ametlik määr (Töötukassa, nimetaja 16–pensioniealine tööjõud) ei olnud API kaudu valla tasemel kättesaadav. Töötukassa töölaud ja avaandmed on olemas, kuid neid ei kasutatud; siin on tuletatud osakaal 15–64-aastastest.",
    "Pendelrände uusim valla tasemel mõõtmine on REL 2021. Tööjõu-uuringu pendelrändetabel (TT234) on ainult üleriigiline.",
    "Töökohtade arv tegevusalade kaupa valla tasemel puudub; PA107 annab ainult töötajate koguarvu töökoha järgi.",
    "Haldusreform 2017: valdade aegread (TT065, RV06U, PA107) on esitatud praeguste piiride järgi. 2015–2016 valla väärtused on Statistikaameti ümberarvutus.",
    "Tööjõu-uuringu kvartaliandmed avaldatakse ainult regiooni (Kesk-Eesti) kohta; jooksva aasta Raplamaa hõivemäära ei ole.",
    "Tööjõu-uuringu valimi veapiire maakonna kohta Statistikaamet tabelites ei avalda; maakonna aastamuutused alla ~3 pp ei ole usaldusväärsed."];
  const GRP=[["sum","Kokkuvõte ja järeldused"],["emp","Hõive ja töötus",["emp","un","reg","now"]],["pay","Palk, töökohad, pendelränne",["wage","com","sec","struct"]],["grp","Rühmad ja demograafia",["grp","dli"]],["ind","Koondtabel",["ind"]]];let GSEL="sum";
  document.addEventListener("click",ev=>{const b=ev.target.closest("[data-ttab]");if(!b)return;const sec=b.closest("section");sec.querySelectorAll("[data-ttab]").forEach(x=>x.setAttribute("aria-selected",x===b));sec.querySelectorAll("[data-tpan]").forEach(p=>p.hidden=p.dataset.tpan!==b.dataset.ttab);K9.render(K9.st.view);});
  K9.part("tooturg",{
    html:()=>`<div class="k9too"><h3 class="k9mkm-h">Tööturg ametliku statistika põhjal</h3>
      <p class="k9mkm-lead">Statistikaameti andmebaasist (tööjõu-uuring, Töötukassa register, palgastatistika, rahvaloendus 2021) päritud ${e(T.fetched)}. Analüüsitud on täisaastad 2015–2025 ja jooksva aasta värskeimad andmed (registreeritud töötus kuni september 2026, palk kuni 2026 II kvartal). Võrdlus: Eesti, Harju ja Järva maakond; valla tasandil, kus andmed on olemas. <b>Elukohapõhine</b> (kus elanikud töötavad) ja <b>töökohapõhine</b> statistika (mis töökohad maakonnas asuvad) on eristatud iga joonise juures.</p>
      <div class="k9seg k9tabs" role="tablist" aria-label="Tööturu teemad">${GRP.map(([k,t],i)=>`<button type="button" role="tab" data-tgrp="${k}" aria-selected="${i===0}">${t}</button>`).join("")}</div>
      <div data-gpan="sum"><h4 class="k9too-h">Peamised leiud</h4>${findings()}
      <div class="k9grid2 k9mkm-gaps"><div><h4>Praktilised järeldused Raplamaa ja Kohila arengukavandamiseks</h4><ul>${PRACT.map(([h,t,k])=>`<li><b>${e(h)}</b> <span class="k9too-tag">${KIND[k][0]}</span><br>${e(t)}</li>`).join("")}</ul></div>
      <div><h4>Andmelüngad ja metoodilised piirangud</h4><ul>${GAPS.map(g=>`<li>${e(g)}</li>`).join("")}</ul></div></div></div>
      ${GRP.slice(1).map(([k,,f])=>`<div data-gpan="${k}" hidden>${f.map(x=>`<div data-tfig="${x}"></div>`).join("")}</div>`).join("")}</div>`,
    bind(h){h.addEventListener("click",ev=>{const g=ev.target.closest("[data-tgrp]");if(g){GSEL=g.dataset.tgrp;h.querySelectorAll("[data-tgrp]").forEach(x=>x.setAttribute("aria-selected",x===g));h.querySelectorAll("[data-gpan]").forEach(p=>p.hidden=p.dataset.gpan!==GSEL);this.update(h);return;}const a=ev.target.closest("[data-tmode]"),b=ev.target.closest("[data-rmode]");if(a){EMODE=a.dataset.tmode;this.update(h);}if(b){RMODE=b.dataset.rmode;this.update(h);}});},
    update(h){const w=K9.wOf(h);const F={emp:()=>empFig(w),un:()=>unFig(w),reg:()=>regFig(w),now:nowTab,wage:wageTab,com:comTab,sec:()=>secFig(w),struct:structTab,grp:grpTab,dli:dliTab,ind:indTab};
      h.querySelectorAll(`[data-gpan="${GSEL}"] [data-tfig]`).forEach(n=>{n.innerHTML=F[n.dataset.tfig]();});}
  });
})();
