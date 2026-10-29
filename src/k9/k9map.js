/* ---------- RAHVASTIK KAARDIL (Rahvastik → k9-kaart) · v40 ----------
   Kolm vaadet: Olukord (värv = suhtarv, ring = absoluutarv, pindala ∝ väärtus), Muutus (kaks aastat, nool, Δ õiges ühikus),
   Seosed (töökoha asukoht REL 2021: ainult tegelikud sihtkohad – Tallinn, Tartu; ülejäänu sihtkohata osakaaluna).
   Kõrval: järjestatud tulpdiagramm (sünkroonne valikuga) ja valla detailpaneel. Puuduvaid väärtusi, vooge ega trende ei genereerita. */
(function(){
  const {C,VC,e,n0,lg,fig,table,tipAttr,tipHTML}=K9;
  /* ---- geomeetria ---- */
  const rings=d=>(d.match(/M[^MZ]+/g)||[]).map(r=>(r.match(/-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?/g)||[]).map(p=>p.split(",").map(Number)));
  const areaU=d=>rings(d).reduce((s,R)=>{let a=0;for(let i=0;i<R.length;i++){const p=R[i],q=R[(i+1)%R.length];a+=p[0]*q[1]-q[0]*p[1];}return s+Math.abs(a)/2;},0);
  const AREA={};V.forEach(v=>AREA[v]=areaU(GEO.v[v].d)*0.01);AREA.MAAK=V.reduce((s,v)=>s+AREA[v],0); /* km², lihtsustatud piirid ±2% */
  const bbox=ds=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;ds.forEach(d=>rings(d).forEach(R=>R.forEach(([x,y])=>{x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);})));return [x0,y0,x1,y1];};
  const TLNP=(()=>{const t=(GEO.n||[]).find(n=>n.n==="Tallinn");if(!t)return [514,-128];const b=bbox([t.d]);return [(b[0]+b[2])/2,(b[1]+b[3])/2];})();
  const TRTP=[1680,1020]; /* Tartu kesklinn L-EST97 järgi (kaardiühik 100 m), kaardist väljas: näidatakse suunanoolena */
  const VB0=(()=>{const b=bbox(V.map(v=>GEO.v[v].d)),m=26;return [b[0]-m,b[1]-m,b[2]-b[0]+2*m,b[3]-b[1]+2*m];})();
  const VBF=(()=>{const b=bbox(V.map(v=>GEO.v[v].d)),m=30,y0=Math.min(b[1],TLNP[1]-40);return [b[0]-m,y0-m,b[2]-b[0]+2*m,b[3]-y0+2*m];})();
  const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),mix=(a,b,t)=>{const A=hex(a),B=hex(b);return "#"+A.map((x,i)=>Math.round(x+(B[i]-x)*Math.max(0,Math.min(1,t))).toString(16).padStart(2,"0")).join("");};
  /* ---- vormingud ---- */
  const nf=(x,d)=>new Intl.NumberFormat("et-EE",{minimumFractionDigits:d,maximumFractionDigits:d}).format(x);
  const sg=(x,f)=>(Math.abs(x)<1e-9?"±":x>0?"+":"−")+f(Math.abs(x));
  const pc=x=>nf(100*x,1)+"%",pm=x=>nf(x,1)+"‰",d2=x=>nf(x,2),eur=x=>n0(x)+" €";
  /* ---- andmed ---- */
  const TD=()=>window.TOO_DATA||null,TK={MAAK:"Rapla maakond",Rapla:"Rapla vald",Kohila:"Kohila vald",Marjamaa:"Märjamaa vald",Kehtna:"Kehtna vald"};
  const tv=(k,u,y)=>{const T=TD();if(!T||!T[k])return null;const o=T[k][TK[u]];if(!o)return null;const x=o[String(y)];return x==null?null:x;};
  const ev=(u,k,y)=>{const P=POP[u];if(!P||!P[k]||y<2015||y>2025)return null;const x=P[k][YI(y)];return x==null?null:x;};
  const agec=(u,y,a,b)=>{const g=ageVec(u,y);return g?sumG(g,a,b):null;};
  const com=u=>{const T=TD();return T&&T.com?T.com[TK[u]]:null;};
  const reg=(u,y)=>{const T=TD();if(!T)return null;if(y===2026){const m=T.regm[TK[u]];if(!m)return null;const a=m["2026"].slice(0,9);return a.every(x=>x!=null)?a.reduce((s,x)=>s+x,0)/9:null;}const r=T.reg[TK[u]];return r?r["Vanuserühmad kokku"][String(y)]:null;};
  const MS=()=>typeof MIGS_ALL!=="undefined"?MIGS_ALL:["r1","mean","r2","r2x","r3"];
  const ALL=[2015,YN];
  /* yrs = andmete aastad; fc(y) = prognoos; ct = muutuse tüüp: pp (protsendipunkt), pm (promillipunkt), cnt (arv ja %), eur (€ ja %), idx (punkt);
     good: 1 = kasv on paranemine, −1 = kasv on halvenemine, 0 = hinnangut ei anta; sc: seq | div0 | div1 (keskpunkt 1,0) */
  const POPSRC="Statistikaamet RV0240 (rahvastik 1. jaanuaril); 2027–2036 kohortmudeli prognoos valitud stsenaariumis";
  const IND=[
    {g:"pop",k:"tot",n:"Rahvaarv",nm:"Rahvaarv ja asustustihedus",u:"in/km²",yrs:ALL,fc:y=>y>START,rel:(v,y)=>popT(v,y)/AREA[v],fmt:x=>nf(x,1)+" in/km²",sc:"seq",col:C.work,
      abs:{get:(v,y)=>popT(v,y),u:"elanikku",fmt:n0},ct:"cnt",chgAbs:true,good:0,setl:true,src:POPSRC+"; pindala lihtsustatud EHAK piiridest (±2%)",
      expl:(v,y,x)=>`${NAME[v]}: ${n0(popT(v,y))} elanikku, ${nf(x,1)} inimest ruutkilomeetri kohta.`},
    {g:"pop",k:"kids",n:"0–14 osakaal",nm:"0–14-aastaste osakaal",u:"% elanikest",yrs:ALL,fc:y=>y>START,rel:(v,y)=>shares(v,y).kids,fmt:pc,sc:"seq",col:C.kid,abs:{get:(v,y)=>agec(v,y,0,2),u:"0–14-aastast",fmt:n0},ct:"pp",good:0,setl:true,st:4,stn:"0–17",src:POPSRC,
      expl:(v,y,x)=>`Iga ${Math.round(1/x)}. elanik on 0–14-aastane.`},
    {g:"pop",k:"wa",n:"15–64 osakaal",nm:"Tööealiste (15–64) osakaal",u:"% elanikest",yrs:ALL,fc:y=>y>START,rel:(v,y)=>shares(v,y).wa,fmt:pc,sc:"seq",col:C.work,abs:{get:(v,y)=>agec(v,y,3,12),u:"15–64-aastast",fmt:n0},ct:"pp",good:0,setl:true,st:5,stn:"18–64",src:POPSRC,
      expl:(v,y,x)=>`${nf(100*x,0)} elanikku sajast on tööealised (15–64).`},
    {g:"pop",k:"old",n:"65+ osakaal",nm:"65-aastaste ja vanemate osakaal",u:"% elanikest",yrs:ALL,fc:y=>y>START,rel:(v,y)=>shares(v,y).old,fmt:pc,sc:"seq",col:C.old,abs:{get:(v,y)=>agec(v,y,13,17),u:"65+ elanikku",fmt:n0},ct:"pp",good:0,setl:true,st:6,stn:"65+",src:POPSRC,
      expl:(v,y,x)=>`Iga ${Math.round(1/x)}. elanik on 65-aastane või vanem.`},
    {g:"pop",k:"dep",n:"Ülalpeetavate määr",nm:"Ülalpeetavate määr",u:"(0–14 + 65+) 100 tööealise kohta",yrs:ALL,fc:y=>y>START,rel:(v,y)=>100*shares(v,y).dep,fmt:x=>nf(x,1),sc:"seq",col:C.old,ct:"idx",good:0,src:POPSRC,
      expl:(v,y,x)=>`100 tööealise (15–64) kohta on ${nf(x,0)} last ja eakat.`},
    {g:"flow",k:"brt",n:"Sünnid",nm:"Sünnid 1000 elaniku kohta",u:"‰",yrs:[2015,2025],fc:()=>false,rel:(v,y)=>{const b=ev(v,"b",y);return b==null?null:1000*b/popT(v,y);},fmt:pm,sc:"seq",col:C.kid,abs:{get:(v,y)=>ev(v,"b",y),u:"sündi aastas",fmt:n0},ct:"pm",good:0,src:"Statistikaamet RV112U (sünnid), RV0240 (rahvaarv 1. jaanuaril)",
      expl:(v,y,x)=>`Aastas sündis ${n0(ev(v,"b",y))} last ehk ${nf(x,1)} 1000 elaniku kohta.`},
    {g:"flow",k:"drt",n:"Surmad",nm:"Surmad 1000 elaniku kohta",u:"‰",yrs:[2015,2025],fc:()=>false,rel:(v,y)=>{const d=ev(v,"d",y);return d==null?null:1000*d/popT(v,y);},fmt:pm,sc:"seq",col:C.old,abs:{get:(v,y)=>ev(v,"d",y),u:"surma aastas",fmt:n0},ct:"pm",good:0,src:"Statistikaamet RV49U (surmad)",
      expl:(v,y,x)=>`Aastas suri ${n0(ev(v,"d",y))} inimest ehk ${nf(x,1)} 1000 elaniku kohta.`},
    {g:"flow",k:"nat",n:"Loomulik iive",nm:"Loomulik iive 1000 elaniku kohta",u:"‰",yrs:[2015,2025],fc:()=>false,rel:(v,y)=>{const b=ev(v,"b",y),d=ev(v,"d",y);return b==null||d==null?null:1000*(b-d)/popT(v,y);},fmt:x=>sg(x,a=>nf(a,1))+"‰",sc:"div0",abs:{get:(v,y)=>{const b=ev(v,"b",y),d=ev(v,"d",y);return b==null||d==null?null:b-d;},u:"inimest aastas",fmt:x=>sg(x,n0),signed:true},ct:"pm",good:0,src:"sünnid − surmad (tuletatud registriandmetest)",
      expl:(v,y,x)=>x<0?`Surmasid oli sündidest ${n0(Math.abs(ev(v,"b",y)-ev(v,"d",y)))} võrra rohkem.`:`Sünde oli surmadest ${n0(ev(v,"b",y)-ev(v,"d",y))} võrra rohkem.`},
    {g:"flow",k:"mig",n:"Rändesaldo",nm:"Rändesaldo 1000 elaniku kohta",u:"‰",yrs:[2015,2025],fc:()=>false,rel:(v,y)=>{const a=ev(v,"mi",y),b=ev(v,"mo",y);return a==null||b==null?null:1000*(a-b)/popT(v,y);},fmt:x=>sg(x,a=>nf(a,1))+"‰",sc:"div0",abs:{get:(v,y)=>{const a=ev(v,"mi",y),b=ev(v,"mo",y);return a==null||b==null?null:a-b;},u:"inimest aastas",fmt:x=>sg(x,n0),signed:true},ct:"pm",good:0,noFlow:"Rändeandmetes on ainult valla sisse- ja väljarände kogused, mitte lähte- ja sihtkohad, seetõttu vooge ei joonistata.",src:"Statistikaamet RVR02 (registreeritud sise- ja välisränne)",
      expl:(v,y,x)=>{const a=ev(v,"mi",y),b=ev(v,"mo",y);return `Sisse rändas ${n0(a)}, välja ${n0(b)}; saldo ${sg(a-b,n0)} inimest.`;}},
    {g:"prog",k:"chg36",n:"Muutus 2026→2036",nm:"Rahvaarvu muutus 2026→2036 (prognoos)",u:"%",yrs:[YN,YN],fc:()=>true,rel:v=>popT(v,YN)/popT(v,START)-1,fmt:x=>sg(100*x,a=>nf(a,1))+"%",sc:"div0",abs:{get:v=>popT(v,YN)-popT(v,START),u:"elanikku",fmt:x=>sg(x,n0),signed:true},noChg:"Näitaja on ise muutus (2026→2036); vaata rahvaarvu muutust vaates Muutus näitajaga Rahvaarv.",good:0,src:"kohortmudel, valitud stsenaarium",
      expl:(v,y,x)=>`Valitud stsenaariumis muutub rahvaarv ${n0(popT(v,START))} → ${n0(popT(v,YN))}.`},
    {g:"prog",k:"rng",n:"Rändemustrite ulatus (min–max)",nm:"Rändemustrite ulatus (min–max) 2036",u:"% 2026. aasta rahvaarvust",yrs:[YN,YN],fc:()=>true,rel:v=>{const a=MS().map(m=>popAt(v,YN,m,S.extra,S.fert));return (Math.max(...a)-Math.min(...a))/popT(v,START);},fmt:pc,sc:"seq",col:C.warn,abs:{get:v=>{const a=MS().map(m=>popAt(v,YN,m,S.extra,S.fert));return Math.max(...a)-Math.min(...a);},u:"elanikku (max − min)",fmt:n0},noChg:"Ühe aasta (2036) prognoosi määramatus; muutust ei arvutata.",good:0,src:"viie rändemustri 2036. aasta prognooside max − min (kohortmudel)",
      expl:(v,y,x)=>`Sõltuvalt rändemustrist võib rahvaarv 2036 erineda kuni ${nf(100*x,1)}% 2026. aasta rahvaarvust.`},
    {g:"prog",k:"vx",n:"Valla siht: lisaränne",nm:"Kasutaja seatud valla siht (lisaränne)",u:"inimest aastas",yrs:[START,START],fc:()=>false,rel:v=>v==="MAAK"?null:(VX[v]||0),fmt:x=>sg(x,n0),sc:"div0",noChg:"Siht on kasutaja seatud arv, mitte ajas mõõdetud näitaja.",noRef:true,good:0,yearless:true,src:"kasutaja seatud siht jaotises „Valdade võrdlus“ (ei ole ametlik eesmärk)",
      expl:(v,y,x)=>x?`Seatud lisaränne ${sg(x,n0)} inimest aastas.`:"Sihti ei ole seatud (0). Sea see jaotises „Valdade võrdlus“ sihi režiimis."},
    {g:"job",k:"regsh",n:"Registreeritud töötud",nm:"Registreeritud töötute osakaal 15–64-aastastest",u:"% 15–64-aastastest (tuletatud)",yrs:[2015,2026],fc:()=>false,lab:y=>y===2026?"2026 jaan–sept":String(y),rel:(v,y)=>{const r=reg(v,y),p=agec(v,y,3,12);return r==null||!p?null:r/p;},fmt:pc,sc:"seq",col:C.loss,abs:{get:(v,y)=>reg(v,y),u:"registreeritud töötut (kuude keskmine)",fmt:n0},ct:"pp",good:-1,
      src:"Statistikaamet TT065 (Töötukassa register); nimetaja 15–64-aastased 1. jaanuaril. Tuletatud osakaal, mitte Töötukassa ametlik registreeritud töötuse määr (nimetaja seal 16–pensioniealine tööjõud). 2026 = jaanuar–september.",
      expl:(v,y,x)=>`Keskmiselt ${n0(reg(v,y))} registreeritud töötut ehk ${nf(100*x,1)} 15–64-aastast sajast.`},
    {g:"job",k:"wage",n:"Brutokuupalk (töökoha järgi)",nm:"Keskmine brutokuupalk valla töökohtadel",u:"€ kuus",yrs:[2021,2025],fc:()=>false,rel:(v,y)=>tv("wage",v,y),fmt:eur,sc:"seq",col:C.tax,abs:{get:(v,y)=>tv("jobs",v,y),u:"töötajat valla töökohtadel",fmt:n0},ct:"eur",good:1,goodNote:"nominaalne (inflatsiooniga korrigeerimata)",src:"Statistikaamet PA107 (töökohapõhine: valla territooriumil asuvad töökohad, mitte elanike palk)",
      expl:(v,y,x)=>`Vallas asuvate töökohtade keskmine brutokuupalk; ei näita valla elanike palka (paljud töötavad mujal).`},
    {g:"job",k:"jobs",n:"Töökohad",nm:"Palgatöötajad valla töökohtadel 1000 elaniku kohta",u:"1000 elaniku kohta",yrs:[2021,2025],fc:()=>false,rel:(v,y)=>{const j=tv("jobs",v,y);return j==null?null:1000*j/popT(v,y);},fmt:x=>nf(x,0),sc:"seq",col:C.work,abs:{get:(v,y)=>tv("jobs",v,y),u:"töötajat",fmt:n0},ct:"cnt",chgAbs:true,good:0,src:"Statistikaamet PA107 (töötajate arv töökoha järgi), RV0240",
      expl:(v,y,x)=>`Valla territooriumil töötas ${n0(tv("jobs",v,y))} palgatöötajat (${nf(x,0)} 1000 elaniku kohta).`},
    {g:"job",k:"inc",n:"Elanike töötulu",nm:"Elanike tööga seotud tulu inimese kohta",u:"€ aastas",yrs:[2018,2024],fc:()=>false,rel:(v,y)=>tv("inc",v,y),fmt:eur,sc:"seq",col:C.tax,abs:{get:(v,y)=>tv("incn",v,y),u:"tööga seotud tuluga elanikku",fmt:n0},ct:"eur",good:1,goodNote:"nominaalne (inflatsiooniga korrigeerimata)",src:"Statistikaamet UA08 (elukohapõhine eksperimentaalstatistika)",
      expl:(v,y,x)=>`Valla elanik, kellel oli tööga seotud tulu, teenis aastas keskmiselt ${eur(x)} (sõltumata töökoha asukohast).`},
    {g:"job",k:"out",n:"Töötab väljaspool maakonda",nm:"Väljaspool elukoha maakonda töötavad",u:"% hõivatud elanikest",yrs:[2021,2021],fc:()=>false,lab:()=>"31.12.2021",rel:v=>{const c=com(v);return c?c["Erinevas maakonnas"]/c["Kokku"]:null;},fmt:pc,sc:"seq",col:C.loss,abs:{get:v=>{const c=com(v);return c?c["Erinevas maakonnas"]:null;},u:"hõivatut",fmt:n0},flow:true,noChg:"Valla tasemel töökoha asukohta on mõõdetud ainult rahvaloendusel 31.12.2021.",good:0,src:"Statistikaamet RL21163 (rahvaloendus 2021)",
      expl:(v,y,x)=>`${nf(100*x,0)} hõivatud elanikku sajast töötas väljaspool Rapla maakonda.`},
    {g:"job",k:"tln",n:"Töötab Tallinnas",nm:"Tallinnas töötavad",u:"% hõivatud elanikest",yrs:[2021,2021],fc:()=>false,lab:()=>"31.12.2021",rel:v=>{const c=com(v);return c?c["Tallinnas"]/c["Kokku"]:null;},fmt:pc,sc:"seq",col:C.loss,abs:{get:v=>{const c=com(v);return c?c["Tallinnas"]:null;},u:"hõivatut",fmt:n0},flow:true,noChg:"Valla tasemel töökoha asukohta on mõõdetud ainult rahvaloendusel 31.12.2021.",good:0,src:"Statistikaamet RL21163 (rahvaloendus 2021)",
      expl:(v,y,x)=>`${nf(100*x,0)} hõivatud elanikku sajast töötas Tallinnas.`},
    {g:"job",k:"jr",n:"Töökohtade ja hõivatute suhe",nm:"Töökohtade ja hõivatud elanike suhe",u:"palgatöökohti hõivatud elaniku kohta",yrs:[2021,2021],fc:()=>false,lab:()=>"2021",rel:v=>{const c=com(v),j=tv("jobs",v,2021);return c&&j?j/c["Kokku"]:null;},fmt:d2,sc:"div1",abs:{get:v=>tv("jobs",v,2021),u:"palgatöötajat valla töökohtadel (2021)",fmt:n0},noChg:"Nimetaja (hõivatud elanikud) on teada ainult rahvaloendusest 31.12.2021; töötajate arv 2022–2025 üksi muutust ei näita.",good:0,
      src:"Lugeja: Statistikaamet PA107, palgatöötajad valla territooriumil asuvatel töökohtadel 2021 (aasta keskmine). Nimetaja: RL21163, hõivatud valla elanikud 31.12.2021 (sh ettevõtjad ja FIE-d).",
      def:"Lugejas on ainult palgatöötajad, nimetajas kõik hõivatud (ka ettevõtjad ja FIE-d), seega on suhe süstemaatiliselt veidi madalam kui „kõik töökohad / kõik hõivatud“. Suhe ei näita töörände mahtu: sama suhte juures võib sisse- ja väljasõit olla väga erinev.",
      expl:(v,y,x)=>`${Math.round(100*x)} palgatöökohta 100 hõivatud elaniku kohta. ${x<1?"Vallas on vähem palgatöökohti kui seal elab hõivatuid.":"Vallas on vähemalt sama palju palgatöökohti kui hõivatud elanikke."}`},
    {g:"job",k:"ind",n:"Töötleva tööstuse osa",nm:"Töötleva tööstuse osa elanike hõives",u:"% hõivatud elanikest",yrs:[2021,2021],fc:()=>false,lab:()=>"31.12.2021",rel:v=>{const T=TD(),s=T&&T.secv;if(!s)return null;const a=s["Töötlev tööstus"][TK[v]],t=s["Tegevusalad kokku"][TK[v]];return a!=null&&t?a/t:null;},fmt:pc,sc:"seq",col:C.work,abs:{get:v=>{const T=TD();return T&&T.secv?T.secv["Töötlev tööstus"][TK[v]]:null;},u:"hõivatut töötlevas tööstuses",fmt:n0},noChg:"Tegevusala valla tasemel on mõõdetud ainult rahvaloendusel 31.12.2021.",good:0,src:"Statistikaamet RL21147 (rahvaloendus 2021, elukoha järgi)",
      expl:(v,y,x)=>`${nf(100*x,0)} hõivatud elanikku sajast töötas töötlevas tööstuses (töökoht võib olla ka teises vallas).`},
    {g:"job",k:"dli",n:"Tööturusurveindeks",nm:"Demograafiline tööturusurveindeks",u:"5–14-aastased 55–64-aastase kohta",yrs:[2017,2026],fc:()=>false,rel:(v,y)=>tv("dli",v,y),fmt:d2,sc:"div1",ct:"idx",good:0,src:"Statistikaamet RV06U (1. jaanuar)",
      expl:(v,y,x)=>x<1?`Iga 100 inimese kohta, kes järgmise kümnendi jooksul pensioniikka jõuab, jõuab tööikka ${Math.round(100*x)} noort (ilma rändeta).`:`Tööikka jõuab rohkem noori (${Math.round(100*x)} 100 kohta), kui pensioniikka siirdub.`}];
  const GR=[["pop","Rahvaarv ja vanus"],["flow","Sünnid, surmad ja ränne"],["prog","Prognoos ja sihid"],["job","Tööhõive ja töökohad"]];
  const VIEWS=[["sit","Olukord"],["chg","Muutus"],["flow","Seosed"]];
  /* ---- olek ---- */
  let IK="tot",VIEW="sit",YR=START,Y0=null,Y1=null,SEL=null,SETLON=false,PLAY=null,FSEL="Kohila";
  const ind=()=>IND.find(i=>i.k===IK);
  const yrsOf=I=>{const o=[];for(let y=I.yrs[0];y<=I.yrs[1];y++)o.push(y);return o;};
  const clampY=I=>{YR=Math.max(I.yrs[0],Math.min(I.yrs[1],YR));};
  const ylab=(I,y)=>I.lab?I.lab(y):String(y);
  const R=(I,u,y)=>{if(u==="MAAK"&&I.noRef)return null;let x=null;try{x=I.rel(u,y);}catch(_){x=null;}return x==null||!isFinite(x)?null:x;};
  const A=(I,u,y)=>{if(!I.abs)return null;let x=null;try{x=I.abs.get(u,y);}catch(_){x=null;}return x==null||!isFinite(x)?null:x;};
  const viewOk=(I,w)=>w==="sit"?null:w==="chg"?(I.noChg||(I.yrs[0]===I.yrs[1]?"Näitaja on olemas ainult ühe aasta kohta.":null)):(I.flow?null:(I.noFlow||"Selle näitaja kohta ei ole lähte- ja sihtkoha andmeid. Seosed on olemas ainult töökoha asukoha näitajatel (rahvaloendus 2021)."));
  function defYears(I){const ys=yrsOf(I),meas=ys.filter(y=>!I.fc(y));Y0=ys[0];Y1=meas.length>1?meas[meas.length-1]:ys[ys.length-1];if(Y1===Y0)Y1=ys[ys.length-1];}
  /* ---- värviskaalad ---- */
  const NEU={pos:C.sc,neg:C.op},VAL={pos:C.gain,neg:C.loss};
  function relRange(I){const v=[];yrsOf(I).forEach(y=>V.forEach(u=>{const x=R(I,u,y);if(x!=null)v.push(x);}));if(!v.length)return [0,1];
    if(I.sc==="div0"){const m=Math.max(...v.map(Math.abs))||1;return [-m,m];}if(I.sc==="div1"){const m=Math.max(...v.map(x=>Math.abs(x-1)))||0.1;return [1-m,1+m];}let lo=Math.min(...v),hi=Math.max(...v);if(hi-lo<1e-9){lo-=1;hi+=1;}return [lo,hi];}
  function relFill(I,x,lo,hi){if(x==null)return C.bg2;if(I.sc==="div0"||I.sc==="div1"){const mid=I.sc==="div1"?1:0,t=(x-mid)/((hi-mid)||1);return t>=0?mix("#262B55",NEU.pos,.15+.75*t):mix("#262B55",NEU.neg,.15+.75*-t);}return mix("#20244A",I.col,.14+.8*(x-lo)/((hi-lo)||1));}
  /* muutus: Δ ühikus; valents määrab värvi tähenduse */
  function delta(I,u,a,b){if(I.chgAbs||I.ct==="cnt"){const x0=I.chgAbs?A(I,u,a):R(I,u,a),x1=I.chgAbs?A(I,u,b):R(I,u,b);if(x0==null||x1==null)return null;return {d:x1-x0,p:x0?x1/x0-1:null,x0,x1,abs:true};}
    const x0=R(I,u,a),x1=R(I,u,b);if(x0==null||x1==null)return null;const k=I.ct==="pp"?100:1;return {d:(x1-x0)*k,p:I.ct==="eur"&&x0?x1/x0-1:null,x0,x1};}
  const dUnit=I=>({pp:"protsendipunkti",pm:"promillipunkti",idx:"punkti",eur:"€",cnt:I.abs?I.abs.u:""})[I.ct]||"";
  function dFmt(I,dd){if(!dd)return "–";const f=I.ct==="pp"?a=>nf(a,1)+" pp":I.ct==="pm"?a=>nf(a,1)+" ‰-p":I.ct==="idx"?a=>nf(a,I.k==="dli"?2:1)+" p":I.ct==="eur"?a=>n0(a)+" €":a=>n0(a);
    return sg(dd.d,f)+(dd.p!=null?` (${sg(100*dd.p,a=>nf(a,1))}%)`:"");}
  const arrow=d=>Math.abs(d)<1e-9?"■":d>0?"▲":"▼";
  function chgFill(I,d,m){if(d==null)return C.bg2;const P=I.good?VAL:NEU,t=Math.min(1,Math.abs(d)/(m||1)),pos=I.good?(d*I.good>0):d>0;return Math.abs(d)<1e-9?"#2C315C":mix("#262B55",pos?P.pos:P.neg,.18+.72*t);}
  /* ---- kaart ---- */
  /* v45: suum ja nihutamine. ZV[vaade] = nähtav ala kaardiühikutes; sildid ja jooned arvutatakse ekraanipikslites (px), seega jäävad suumides sama suureks. */
  const ZV={sit:null,chg:null,flow:null};
  function svgOpen(vb,W0,maxH,lab,key){const W=Math.min(W0,maxH*vb[2]/vb[3]),zv=(key&&ZV[key])||vb,s=zv[2]/W;return {W,s,zv,zk:vb[2]/zv[2],px:p=>(p*s).toFixed(2),o:`<svg viewBox="${zv.map(x=>x.toFixed(1)).join(" ")}" width="${Math.round(W)}" height="${Math.round(W*vb[3]/vb[2])}" role="img" aria-label="${e(lab)}" class="k9pm-svg" data-zkey="${key||""}" data-base="${vb.map(x=>x.toFixed(1)).join(" ")}">`};}
  /* suumitud kaardil asulate nimed (REL 2021 asustusüksused) orientiiriks: punkt + nimi, suurimad enne; kokkupõrkel jäetakse väiksem välja */
  function setlNames(S0,dots){const {zv,zk,px,s}=S0;if(zk<1.6||typeof SETL==="undefined")return "";const inV=z=>z[7]>=zv[0]&&z[7]<=zv[0]+zv[2]&&z[8]>=zv[1]&&z[8]<=zv[1]+zv[3];
    const L=SETL.filter(z=>z[7]!=null&&inV(z)).sort((a,b)=>(b[3]||0)-(a[3]||0)),taken=[],maxN=Math.round(10*zk);let o="",n=0;
    L.forEach(z=>{const w=(z[2].length*6.4+8)*s,h=14*s,bx=[z[7]+4*s,z[8]-h/2,w,h];const hit=taken.some(t=>bx[0]<t[0]+t[2]&&t[0]<bx[0]+bx[2]&&bx[1]<t[1]+t[3]&&t[1]<bx[1]+bx[3]);
      if(dots)o+=`<circle cx="${z[7]}" cy="${z[8]}" r="${px(z[3]>=1000?3.2:z[3]>=200?2.4:1.6)}" fill="${C.ink}" fill-opacity=".75" stroke="${C.bg}" stroke-width="${px(.8)}"${tipAttr(tipHTML(z[2],[["vald",NAME[z[1]]||z[1]],["elanikke 31.12.2021",n0(z[3]||0)],["0–17 / 18–64 / 65+",`${n0(z[4]||0)} / ${n0(z[5]||0)} / ${n0(z[6]||0)}`]],"Rahvaloendus 2021 (RL21003)"))}/>`;
      if(!hit&&n<maxN&&(z[3]>=30||zk>=3)){taken.push(bx);n++;o+=`<text x="${z[7]+4*s}" y="${z[8]+4*s}" class="k9pm-st" style="${halo(px,10.5,3)}" pointer-events="none">${e(z[2].replace(/ (küla|alevik)$/,""))}</text>`;}});
    return o;}
  const halo=(px,sz,w)=>`paint-order:stroke;stroke:${C.bg};stroke-width:${px(w||4)}px;stroke-linejoin:round;font-size:${px(sz)}px`;
  function basemap(px,dim){let o="";(GEO.n||[]).forEach(n=>{o+=`<path d="${n.d}" fill="${C.bg2}" stroke="${C.line}" stroke-width="${px(1)}" opacity="${dim?.7:1}"/>`;});return o;}
  function absScale(I){if(!I.abs)return null;let m=0;yrsOf(I).forEach(y=>V.forEach(u=>{const x=A(I,u,y);if(x!=null)m=Math.max(m,Math.abs(x));}));return m||null;}
  function mapSit(W0){const I=ind(),y=YR,fc=I.fc(y),[lo,hi]=relRange(I),am=absScale(I),setl=SETLON&&I.setl;
    const S0=svgOpen(VB0,W0,600,`${I.nm} valdade kaupa ${ylab(I,y)}`,"sit"),{px,s}=S0;let o=S0.o;
    o+=`<defs><pattern id="mfc" width="${px(8)}" height="${px(8)}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="${px(8)}" stroke="${C.bg}" stroke-opacity=".38" stroke-width="${px(2.5)}"/></pattern></defs>`+basemap(px);
    V.forEach(v=>{const x=R(I,v,y),sel=SEL===v;o+=`<path data-id="p-${v}" data-mu="${v}" tabindex="0" role="button" aria-label="${e(NAME[v])}: ${e(x==null?"puudub":I.fmt(x))}" d="${GEO.v[v].d}" fill="${relFill(I,x,lo,hi)}" stroke="${sel?C.kid:C.ink}" stroke-width="${px(sel?3:1.1)}" class="k9pm-v${SEL&&!sel?" dim":""}"${tipAttr(tipHTML(NAME[v],[[ylab(I,y)+(fc?" · prognoos":""),x==null?"puudub":I.fmt(x)]]))}/>`;if(fc)o+=`<path d="${GEO.v[v].d}" fill="url(#mfc)" pointer-events="none"/>`;});
    if(setl){const st=I.st,max=Math.max(...SETL.map(z=>z[3]||0));SETL.slice().sort((a,b)=>(b[3]||0)-(a[3]||0)).forEach(z=>{if(z[7]==null||!z[3])return;const sh=st&&z[st]!=null?z[st]/z[3]:null,rr=s*Math.max(2.2,18*Math.sqrt(z[3]/max));
      o+=`<circle cx="${z[7]}" cy="${z[8]}" r="${rr.toFixed(2)}" fill="${sh!=null?mix("#20244A",I.col,Math.min(1,.15+1.6*sh)):"none"}" fill-opacity=".9" stroke="${C.ink}" stroke-opacity=".8" stroke-width="${px(.8)}" pointer-events="none"/>`;});}
    else if(am){V.forEach(v=>{const a=A(I,v,y),g=GEO.v[v];if(a==null)return;const r=s*36*Math.sqrt(Math.abs(a)/am);
      o+=`<circle data-id="c-${v}" cx="${g.cx}" cy="${(+g.cy)+ +px(8)}" r="${r.toFixed(2)}" fill="${I.abs.signed?(a>=0?NEU.pos:NEU.neg):C.ink}" fill-opacity=".13" stroke="${I.abs.signed?(a>=0?NEU.pos:NEU.neg):C.ink}" stroke-width="${px(1.4)}" pointer-events="none"/>`;});}
    o+=setlNames(S0,!setl);
    V.forEach(v=>{const g=GEO.v[v],x=R(I,v,y),a=A(I,v,y);o+=`<text x="${g.cx}" y="${(+g.cy)-+px(4)}" text-anchor="middle" class="k9pm-ln" style="${halo(px,14.5)}">${e(SHORTN[v])}</text><text data-id="t-${v}" x="${g.cx}" y="${(+g.cy)+ +px(14)}" text-anchor="middle" class="k9pm-lv" style="${halo(px,14)}">${e(x==null?"puudub":I.k==="jr"?d2(x):I.fmt(x))}</text>`+
      (I.k==="jr"&&x!=null?`<text x="${g.cx}" y="${(+g.cy)+ +px(29)}" text-anchor="middle" class="k9pm-ls" style="${halo(px,11,3)}">${Math.round(100*x)} töökohta 100 hõivatu kohta</text>`:"")+
      (am&&!setl&&a!=null&&I.k!=="jr"?`<text data-id="a-${v}" x="${g.cx}" y="${(+g.cy)+ +px(29)}" text-anchor="middle" class="k9pm-ls" style="${halo(px,11,3)}">${e(I.abs.fmt(a))}</text>`:"");});
    return o+"</svg>";}
  function mapChg(W0){const I=ind(),fc=I.fc(Y0)||I.fc(Y1),D={};let m=0;V.forEach(v=>{D[v]=delta(I,v,Y0,Y1);if(D[v])m=Math.max(m,Math.abs(D[v].d));});
    const S0=svgOpen(VB0,W0,600,`${I.nm}: muutus ${Y0}–${Y1}`,"chg"),{px}=S0;let o=S0.o+basemap(px);
    V.forEach(v=>{const d=D[v],sel=SEL===v;o+=`<path data-mu="${v}" tabindex="0" role="button" aria-label="${e(NAME[v])}: ${e(dFmt(I,d))}" d="${GEO.v[v].d}" fill="${chgFill(I,d&&d.d,m)}" stroke="${sel?C.kid:C.ink}" stroke-width="${px(sel?3:1.1)}" class="k9pm-v${SEL&&!sel?" dim":""}"${tipAttr(tipHTML(NAME[v],[[`${ylab(I,Y0)} → ${ylab(I,Y1)}`,dFmt(I,d)]]))}/>`;});
    o+=setlNames(S0,true);
    V.forEach(v=>{const g=GEO.v[v],d=D[v],f=I.chgAbs?I.abs.fmt:I.fmt;o+=`<text x="${g.cx}" y="${(+g.cy)-+px(8)}" text-anchor="middle" class="k9pm-ln" style="${halo(px,14)}">${e(SHORTN[v])}</text>`+
      (d?`<text x="${g.cx}" y="${(+g.cy)+ +px(8)}" text-anchor="middle" class="k9pm-ls" style="${halo(px,11,3)}">${e(f(d.x0))} → ${e(f(d.x1))}</text><text x="${g.cx}" y="${(+g.cy)+ +px(25)}" text-anchor="middle" class="k9pm-lv" style="${halo(px,13.5)}">${arrow(d.d)} ${e(dFmt(I,d))}</text>`:`<text x="${g.cx}" y="${(+g.cy)+ +px(10)}" text-anchor="middle" class="k9pm-ls" style="${halo(px,11,3)}">võrreldavad andmed puuduvad</text>`);});
    return o+"</svg>";}
  function mapFlow(W0){const S0=svgOpen(VBF,W0,640,`Töökoha asukoht: ${NAME[FSEL]} 31.12.2021`,"flow"),{px,s}=S0;let o=S0.o+basemap(px,true);
    const T=TD(),mx=Math.max(...V.map(v=>{const c=com(v);return c?Math.max(c["Tallinnas"],c["Samas KOV"]):0;}));const wOf=n=>Math.max(1.2,22*n/mx);
    V.forEach(v=>{const sel=v===FSEL;o+=`<path data-mu="${v}" tabindex="0" role="button" aria-label="${e(NAME[v])}" d="${GEO.v[v].d}" fill="${sel?"#2E3466":"#1B1F3E"}" stroke="${sel?C.kid:C.line2}" stroke-width="${px(sel?2.6:1)}" class="k9pm-v" style="cursor:pointer"${tipAttr(tipHTML(NAME[v],[["vali vald","näita tema töökoha asukohti"]]))}/>`;});
    o+=`<circle cx="${TLNP[0]}" cy="${TLNP[1]}" r="${px(5)}" fill="${C.ink}"/><text x="${TLNP[0]+ +px(9)}" y="${TLNP[1]+ +px(4)}" class="k9pm-ln" style="${halo(px,13)}">Tallinn</text>`;
    const curve=(a,b,bend)=>{const mxp=(a[0]+b[0])/2,myp=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return `M${a[0]},${a[1]}Q${mxp-dy/l*bend},${myp+dx/l*bend} ${b[0]},${b[1]}`;};
    V.filter(v=>v!==FSEL).forEach(v=>{const c=com(v),g=GEO.v[v];if(!c)return;o+=`<path d="${curve([+g.cx,+g.cy],TLNP,40)}" fill="none" stroke="${C.mut}" stroke-opacity=".18" stroke-width="${px(wOf(c["Tallinnas"]))}" stroke-linecap="round"/>`;});
    const c=com(FSEL),g=GEO.v[FSEL],P=[+g.cx,+g.cy];if(c){
      o+=`<path d="${curve(P,TLNP,40)}" fill="none" stroke="${C.loss}" stroke-opacity=".9" stroke-width="${px(wOf(c["Tallinnas"]))}" stroke-linecap="round" marker-end="url(#mar)"/>`;
      const dx=TRTP[0]-P[0],dy=TRTP[1]-P[1],tt=Math.min((VBF[0]+VBF[2]-P[0]-6)/dx,(VBF[1]+VBF[3]-P[1]-6)/dy),E=[P[0]+dx*tt,P[1]+dy*tt];
      o+=`<defs><marker id="mar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="3" markerHeight="3" orient="auto"><path d="M0,0L10,5L0,10Z" fill="${C.loss}"/></marker><marker id="mar2" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0L10,5L0,10Z" fill="${C.warn}"/></marker></defs>`;
      o+=`<path d="M${P[0]},${P[1]}L${E[0].toFixed(1)},${E[1].toFixed(1)}" stroke="${C.warn}" stroke-width="${px(wOf(c["Tartus"]))}" stroke-dasharray="${px(6)} ${px(4)}" marker-end="url(#mar2)"/><text x="${(E[0]-+px(6)).toFixed(1)}" y="${(E[1]-+px(10)).toFixed(1)}" text-anchor="end" class="k9pm-ls" style="${halo(px,11.5,3)}">Tartu suunas · ${n0(c["Tartus"])}</text>`;
      const rs=s*30*Math.sqrt(c["Samas KOV"]/mx);o+=`<circle cx="${P[0]}" cy="${P[1]}" r="${rs.toFixed(1)}" fill="${C.gain}" fill-opacity=".28" stroke="${C.gain}" stroke-width="${px(1.6)}"/>`;
      const rc=rs+ +px(8)+s*30*Math.sqrt(c["Erinevas KOV samas mk"]/mx)*0.25;o+=`<circle cx="${P[0]}" cy="${P[1]}" r="${rc.toFixed(1)}" fill="none" stroke="${C.sc}" stroke-width="${px(Math.max(1.2,wOf(c["Erinevas KOV samas mk"])))}" stroke-dasharray="${px(3)} ${px(3)}" stroke-opacity=".85"/>`;
      const mid=[(P[0]+TLNP[0])/2,(P[1]+TLNP[1])/2];o+=`<text x="${mid[0]+ +px(14)}" y="${mid[1]}" class="k9pm-lv" style="${halo(px,13)}">${n0(c["Tallinnas"])}</text>`;
      o+=`<text x="${P[0]}" y="${P[1]+rc+ +px(16)}" text-anchor="middle" class="k9pm-ln" style="${halo(px,13.5)}">${e(SHORTN[FSEL])}</text><text x="${P[0]}" y="${P[1]+rc+ +px(31)}" text-anchor="middle" class="k9pm-ls" style="${halo(px,11,3)}">samas vallas ${n0(c["Samas KOV"])} · teises vallas maakonnas ${n0(c["Erinevas KOV samas mk"])}</text>`;}
    return o+"</svg>";}
  /* ---- tulpdiagramm ---- */
  function bars(W){const I=ind(),w=Math.max(260,Math.min(W,520)),L=78,rh=34,T=26;
    if(VIEW==="flow"){const K=[["Samas KOV","samas vallas",C.gain],["Erinevas KOV samas mk","teises vallas maakonnas",C.sc],["Tallinnas","Tallinnas",C.loss],["Tartus","Tartus",C.warn],["_muu","mujal Eestis (sihtkoht täpsustamata)",C.mut],["Välismaal","välismaal",C.op]];
      const rows=[...V,"MAAK"].map(v=>{const c=com(v);if(!c)return null;const muu=c["Erinevas maakonnas"]-c["Tallinnas"]-c["Tartus"];return {v,c,vals:K.map(([k])=>k==="_muu"?muu:c[k])};}).filter(Boolean),H=T+rows.length*rh+8,X=x=>L+(w-L-12)*x;
      let o=`<svg viewBox="0 0 ${w} ${H}" width="100%" role="img" aria-label="Hõivatud töökoha asukoha järgi 2021"><text x="${L}" y="14" class="t-cap">% hõivatud elanikest · 31.12.2021</text>`;
      rows.forEach((r,i)=>{const y=T+i*rh,tot=r.c["Kokku"];let acc=0;o+=`<g data-bar="${r.v}" class="k9pm-bar${r.v===FSEL?" on":""}" style="cursor:${r.v==="MAAK"?"default":"pointer"}"><text x="${L-8}" y="${y+15}" text-anchor="end" class="t-lab"${r.v!=="MAAK"?` style="fill:${VC[r.v]}"`:""}>${e(r.v==="MAAK"?"Maakond":SHORTN[r.v])}</text>`;
        r.vals.forEach((x,j)=>{const f=x/tot;o+=`<rect x="${X(acc).toFixed(1)}" y="${y+3}" width="${Math.max(0,X(acc+f)-X(acc)).toFixed(1)}" height="16" fill="${K[j][2]}" fill-opacity="${j===4?.45:.85}"${tipAttr(tipHTML(r.v==="MAAK"?"Rapla maakond":NAME[r.v],[[K[j][1],`${n0(x)} (${nf(100*f,1)}%)`]]))}/>`;if(f>=0.09)o+=`<text x="${((X(acc)+X(acc+f))/2).toFixed(1)}" y="${y+15}" text-anchor="middle" class="t-num" style="font-size:10.5px;fill:${C.bg}">${Math.round(100*f)}</text>`;acc+=f;});o+=`</g>`;});
      return o+`</svg><div class="k9leg">${K.map(([,n,c])=>lg.sq(c,n)).join("")}</div>`;}
    const chg=VIEW==="chg";const Rr=chg?150:96;const vals=V.map(v=>({v,x:chg?(delta(I,v,Y0,Y1)||{}).d:R(I,v,YR)})).map(o=>({...o,x:o.x==null?null:o.x}));const sorted=vals.slice().sort((a,b)=>(b.x==null?-1e18:b.x)-(a.x==null?-1e18:a.x));
    const ref=chg?(()=>{if(I.chgAbs||I.noRef)return null;const d=delta(I,"MAAK",Y0,Y1);return d?d.d:null;})():R(I,"MAAK",YR);
    const xs=vals.map(o=>o.x).filter(x=>x!=null).concat(ref!=null?[ref]:[]);const mid=chg?0:I.sc==="div1"?1:I.sc==="div0"?0:0;
    let lo=Math.min(mid,...xs),hi=Math.max(mid,...xs);if(hi-lo<1e-9)hi=lo+1;const X=x=>L+(w-L-Rr)*(x-lo)/(hi-lo),H=T+V.length*rh+(ref!=null?18:4);
    const f=chg?(x=>dFmt(I,{d:x,p:null})):(x=>I.k==="jr"?d2(x):I.fmt(x));
    let o=`<svg viewBox="0 0 ${w} ${H}" width="100%" role="img" aria-label="${e(I.nm)} – valdade järjestus"><text x="${L}" y="14" class="t-cap">${e(chg?`muutus ${ylab(I,Y0)} → ${ylab(I,Y1)}, ${dUnit(I)}`:`${I.u} · ${ylab(I,YR)}`)}</text>`;
    o+=`<line x1="${X(mid)}" x2="${X(mid)}" y1="${T-4}" y2="${T+V.length*rh}" stroke="${C.line2}"/>`;
    sorted.forEach((r,i)=>{const y=T+i*rh,on=SEL===r.v;const x0=X(mid),x1=r.x==null?x0:X(r.x);const col=chg?chgFill(I,r.x,Math.max(...xs.map(Math.abs))):VC[r.v];
      o+=`<g data-bar="${r.v}" class="k9pm-bar${on?" on":""}${SEL&&!on?" dim":""}" tabindex="0" role="button" aria-label="${e(NAME[r.v])}: ${e(r.x==null?"puudub":f(r.x))}" style="cursor:pointer"><rect x="0" y="${y}" width="${w}" height="${rh-4}" fill="transparent"/><text x="${L-8}" y="${y+16}" text-anchor="end" class="t-lab" style="fill:${VC[r.v]};${on?"font-weight:700":""}">${e(SHORTN[r.v])}</text>`+
        (r.x==null?`<text x="${x0+6}" y="${y+16}" class="t-cap">puudub</text>`:`<rect x="${Math.min(x0,x1).toFixed(1)}" y="${y+4}" width="${Math.max(1.5,Math.abs(x1-x0)).toFixed(1)}" height="16" fill="${col}" fill-opacity="${chg?1:.85}" stroke="${on?C.kid:"none"}" stroke-width="2"/><text x="${(Math.max(x0,x1)+6).toFixed(1)}" y="${y+16}" class="t-num">${chg?arrow(r.x)+" ":""}${e(f(r.x))}</text>`)+
        (chg?spark(I,r.v,w-62,y+2,56,18):"")+`</g>`;});
    if(ref!=null)o+=`<line x1="${X(ref)}" x2="${X(ref)}" y1="${T-4}" y2="${T+V.length*rh}" stroke="${C.ink}" stroke-dasharray="3 3"/><text x="${X(ref)}" y="${T+V.length*rh+13}" text-anchor="middle" class="t-cap">maakond ${e(f(ref))}</text>`;
    return o+"</svg>";}
  function spark(I,v,x0,y0,wd,ht){wd=wd||60;ht=ht||18;const ys=yrsOf(I),pts=ys.map(y=>[y,R(I,v,y)]).filter(p=>p[1]!=null);if(pts.length<2)return "";const lo=Math.min(...pts.map(p=>p[1])),hi=Math.max(...pts.map(p=>p[1]))||1,X=y=>x0+wd*(y-ys[0])/((ys[ys.length-1]-ys[0])||1),Yf=x=>y0+ht-ht*(x-lo)/((hi-lo)||1);
    let a="",b="";pts.forEach(([y,x],i)=>{const s=`${X(y).toFixed(1)},${Yf(x).toFixed(1)}`;if(!I.fc(y))a+=(a?"L":"M")+s;else{if(!b&&i>0&&!I.fc(pts[i-1][0]))b="M"+`${X(pts[i-1][0]).toFixed(1)},${Yf(pts[i-1][1]).toFixed(1)}`;b+=(b?"L":"M")+s;}});
    const mk=y=>{const p=pts.find(q=>q[0]===y);return p?`<circle cx="${X(y).toFixed(1)}" cy="${Yf(p[1]).toFixed(1)}" r="2.2" fill="${C.ink}"/>`:"";};
    return `<path d="${a}" fill="none" stroke="${VC[v]||C.ink}" stroke-width="1.4"/>${b?`<path d="${b}" fill="none" stroke="${VC[v]||C.ink}" stroke-width="1.4" stroke-dasharray="3 2"/>`:""}${VIEW==="chg"?mk(Y0)+mk(Y1):""}`;}
  /* ---- detailpaneel ---- */
  const FRAC=["kids","wa","old","chg36","rng","regsh","out","tln","ind"];
  function cmpTxt(I,x,m){const d=x-m;if(FRAC.includes(I.k))return sg(100*d,a=>nf(a,1))+" protsendipunkti";if(I.u==="‰")return sg(d,a=>nf(a,1))+" promillipunkti";
    if(/€/.test(I.u))return sg(d,a=>n0(a))+" € ("+sg(100*(x/m-1),a=>nf(a,1))+"%)";if(I.k==="jr"||I.k==="dli")return sg(d,d2);return sg(d,a=>nf(a,1))+" "+I.u;}
  function panel(){const I=ind();
    if(VIEW==="flow"){const v=FSEL,c=com(v),cm=com("MAAK");if(!c)return "";const row=(n,k)=>[n,n0(c[k]),nf(100*c[k]/c["Kokku"],1)+"%",nf(100*cm[k]/cm["Kokku"],1)+"%"];const muu=c["Erinevas maakonnas"]-c["Tallinnas"]-c["Tartus"],muuM=cm["Erinevas maakonnas"]-cm["Tallinnas"]-cm["Tartus"];
      return `<h4>${e(NAME[v])}</h4><p class="k9pm-meta">Hõivatud elanikud töökoha asukoha järgi · 31.12.2021 · inimest</p><p class="k9pm-big">${n0(c["Kokku"])} <small>hõivatud elanikku</small></p>
      ${table(["Töökoht","Inimest","% valla hõivatutest","Maakonnas %"],[row("Samas vallas","Samas KOV"),row("Teises vallas maakonnas","Erinevas KOV samas mk"),row("Tallinnas","Tallinnas"),row("Tartus","Tartus"),["Mujal Eestis (sihtkoht täpsustamata)",n0(muu),nf(100*muu/c["Kokku"],1)+"%",nf(100*muuM/cm["Kokku"],1)+"%"],row("Välismaal","Välismaal")],{textCols:[0]})}
      <p class="k9pm-note"><b>Piirang:</b> rahvaloenduse avaldatud tabelis on sihtkohana eraldi ainult Tallinn ja Tartu. Maakonnasisese töörände sihtvald ja muude maakondade sihtkohad ei ole teada, seetõttu neid voogudena ei joonistata. Tartu on kaardist väljas, nool näitab ainult suunda.</p><p class="k9pm-src">Allikas: Statistikaamet RL21163 (rahvaloendus 2021).</p>`;}
    if(!SEL)return `<p class="k9pm-hint">Klõpsa vallal kaardil või tulbal diagrammis, et näha valla väärtust, selgitust, võrdlust maakonnaga ja trendi.</p>`;
    const v=SEL,ys=yrsOf(I),y=VIEW==="chg"?Y1:YR,x=R(I,v,y),m=R(I,"MAAK",y),a=A(I,v,y),am=A(I,"MAAK",y);
    const trend=ys.length>1?table(["Aasta","Väärtus",...(I.abs?[I.abs.u]:[]),"Olek"],ys.map(t=>{const r=R(I,v,t);return [ylab(I,t),r==null?"puudub":e(I.fmt(r)),...(I.abs?[A(I,v,t)==null?"puudub":e(I.abs.fmt(A(I,v,t)))]:[]),I.fc(t)?"prognoos":"mõõdetud"];}),{textCols:[3]}):"";
    const dd=VIEW==="chg"?delta(I,v,Y0,Y1):null;
    return `<h4>${e(NAME[v])}</h4><p class="k9pm-meta">${e(I.nm)} · ${e(VIEW==="chg"?ylab(I,Y0)+" → "+ylab(I,Y1):ylab(I,y))}${I.fc(y)?" · prognoos":""} · ${e(I.u)}</p>
      <p class="k9pm-big">${x==null?"puudub":e(I.k==="jr"?d2(x):I.fmt(x))}${dd?` <small>${arrow(dd.d)} ${e(dFmt(I,dd))}</small>`:""}</p>
      ${x!=null&&I.expl?`<p>${e(I.expl(v,y,x))}</p>`:""}
      ${I.def?`<p class="k9pm-note">${e(I.def)}</p>`:""}
      ${m!=null&&x!=null?`<p>Rapla maakond: <b>${e(I.k==="jr"?d2(m):I.fmt(m))}</b> · vald ${e(cmpTxt(I,x,m))} võrreldes maakonnaga</p>`:I.noRef?`<p class="k9pm-note">Maakonna võrdlust ei arvutata.</p>`:""}
      ${a!=null?`<p>Seotud absoluutarv: <b>${e(I.abs.fmt(a))}</b> ${e(I.abs.u)}${am!=null?` (maakond ${e(I.abs.fmt(am))})`:""}</p>`:""}
      ${I.good&&VIEW==="chg"?`<p class="k9pm-note">Värvi tähendus: ${I.good>0?"kasv = soodne":"kasv = ebasoodne"}${I.goodNote?" ("+e(I.goodNote)+")":""}.</p>`:""}
      ${trend?`<details open><summary>Trend ${ys[0]}–${ys[ys.length-1]}</summary>${trend}</details>`:`<p class="k9pm-note">Ainult üks andmeaasta; trendi ei saa näidata.</p>`}
      <p class="k9pm-src">Allikas: ${e(I.src)}</p>
      ${S.unit!==v?`<button type="button" class="k9btn ghost sm" data-pmunit="${v}">Vali ${e(NAME[v])} kogu kangas</button>`:""}`;}
  /* ---- legendid ---- */
  function legends(){const I=ind(),out=[];
    if(VIEW==="flow"){out.push(lg.txt(`<svg width="40" height="14" aria-hidden="true"><path d="M2,7L34,7" stroke="${C.loss}" stroke-width="5"/></svg>voog Tallinna, joone jämedus ∝ inimeste arv`),lg.txt(`<svg width="40" height="14" aria-hidden="true"><path d="M2,7L34,7" stroke="${C.warn}" stroke-width="2" stroke-dasharray="5 3"/></svg>Tartu suund (sihtkoht kaardist väljas)`),lg.txt(`<svg width="22" height="16" aria-hidden="true"><circle cx="11" cy="8" r="6" fill="${C.gain}" fill-opacity=".3" stroke="${C.gain}"/></svg>töötab samas vallas (pindala ∝ arv)`),lg.txt(`<svg width="22" height="16" aria-hidden="true"><circle cx="11" cy="8" r="6.5" fill="none" stroke="${C.sc}" stroke-dasharray="2 2"/></svg>töötab teises vallas maakonnas (sihtvald teadmata)`));return out;}
    if(VIEW==="chg"){const P=I.good?VAL:NEU;out.push(lg.txt(`<span class="k9pm-sw" style="background:${mix("#262B55",P.neg,.8)}"></span><span class="k9pm-sw" style="background:#2C315C"></span><span class="k9pm-sw" style="background:${mix("#262B55",P.pos,.8)}"></span>&nbsp;${I.good?`roheline = soodne muutus, oranž = ebasoodne (${I.good>0?"kasv on soodne":"kasv on ebasoodne"}${I.goodNote?", "+e(I.goodNote):""})`:"sinine = kasv, lilla = vähenemine · hinnangut heaks või halvaks ei anta"} · keskpunkt 0`),lg.txt(`▲ kasv · ▼ vähenemine · Δ ühik: ${e(dUnit(I))}`));return out;}
    const [lo,hi]=relRange(I),ys=yrsOf(I);const sw=[0,1,2,3,4].map(i=>`<span class="k9pm-sw" style="background:${relFill(I,lo+(hi-lo)*(i+.5)/5,lo,hi)}"></span>`).join("");
    out.push(lg.txt(`${sw}&nbsp;<b>värv:</b> ${e(I.u)} · ${e(I.fmt(lo))} … ${e(I.fmt(hi))}${I.sc==="div1"?" · keskpunkt 1,0":I.sc==="div0"?" · keskpunkt 0":""} (skaala ${ys[0]}${ys.length>1?"–"+ys[ys.length-1]:""})`));
    if(I.k==="jr")out.push(lg.txt(`<b>alla 1,0</b> = vallas vähem palgatöökohti kui hõivatud elanikke · <b>üle 1,0</b> = rohkem (ligikaudne, vt määratlus)`));
    const am=absScale(I);if(am&&!(SETLON&&I.setl)){const vs=[am,am/4].map(x=>{const r=x>=1000?Math.round(x/100)*100:x>=100?Math.round(x/10)*10:Math.round(x);return r;});out.push(lg.txt(`<svg width="96" height="40" aria-hidden="true">${vs.map((x,i)=>{const r=17*Math.sqrt(x/am);return `<circle cx="20" cy="${38-r}" r="${r}" fill="none" stroke="${C.ink}"/><text x="44" y="${i?34:12}" class="t-cap">${n0(x)}</text>`;}).join("")}</svg><b>ring:</b> ${e(I.abs.u)} · pindala ∝ väärtus${I.abs.signed?" · sinine +, lilla −":""}`));}
    if(I.fc(YR))out.push(lg.txt(`<svg width="22" height="14" aria-hidden="true"><rect x="2" y="2" width="18" height="10" fill="${C.surf}" stroke="${C.ink}"/><path d="M2,12L12,2M8,12L18,2" stroke="${C.bg}" stroke-width="2"/></svg>viirutus = prognoos`));
    if(SETLON&&I.setl)out.push(lg.txt(`asulate ringid: elanikud 31.12.2021 (pindala ∝ elanikud), värv = ${e(I.stn||"")} osakaal; ei muutu aastaga`));
    return out;}
  /* ---- juhtpaneel ---- */
  function ctl(){const I=ind();
    const vb=VIEWS.map(([k,t])=>{const why=viewOk(I,k);return `<button type="button" role="tab" data-pmv="${k}" aria-selected="${k===VIEW}"${why?` aria-disabled="true" title="${e(why)}"`:""}>${t}</button>`;}).join("");
    const sel=`<label class="k9pm-f">Teema <select data-pmg>${GR.map(([g,t])=>`<option value="${g}"${g===I.g?" selected":""}>${e(t)}</option>`).join("")}</select></label><label class="k9pm-f">Näitaja <select data-pmi>${IND.filter(i=>i.g===I.g).map(i=>`<option value="${i.k}"${i.k===IK?" selected":""}>${e(i.n)}</option>`).join("")}</select></label>`;
    const ys=yrsOf(I);let yc="";
    if(VIEW==="sit"){yc=ys.length>1?`<label class="k9pm-yr">Aasta <b>${e(ylab(I,YR))}${I.fc(YR)?" · prognoos":" · mõõdetud"}</b><span class="k9pm-rng"><input type="range" min="${ys[0]}" max="${ys[ys.length-1]}" step="1" value="${YR}" data-pmy aria-label="Aasta"${ys[ys.length-1]>START&&ys[0]<=START?` style="--fc:${(100*(START-ys[0]+.5)/(ys.length-1)).toFixed(1)}%"`:""}><span class="k9pm-ends"><span>${ys[0]}</span>${ys[ys.length-1]>START&&ys[0]<=START?`<span>mõõdetud ≤${START} · prognoos ≥${START+1}</span>`:""}<span>${e(ylab(I,ys[ys.length-1]))}</span></span></span></label><button type="button" class="k9btn ghost sm" data-pmplay>${PLAY?"■ Peata":"▶ Esita"}</button>`
      :`<span class="k9pm-badge">Andmeaasta <b>${e(I.yearless?"kasutaja valik":ylab(I,ys[0]))}</b>${I.yearless?"":" · ainult üks mõõtmine, ajas esitamine pole võimalik"}</span>`;
      if(I.setl)yc+=`<label class="k9pm-chk"><input type="checkbox" data-pms ${SETLON?"checked":""}> Asulad (rahvaloendus 2021)</label>`;}
    else if(VIEW==="chg"){const opt=c=>ys.map(y=>`<option value="${y}"${y===c?" selected":""}>${e(ylab(I,y))}${I.fc(y)?" (prognoos)":""}</option>`).join("");yc=`<label class="k9pm-f">Algus <select data-pm0>${opt(Y0)}</select></label><label class="k9pm-f">Lõpp <select data-pm1>${opt(Y1)}</select></label>`;}
    else yc=`<span class="k9pm-badge">Andmeaasta <b>31.12.2021</b> · rahvaloendus</span><label class="k9pm-f">Vald <select data-pmfs>${V.map(v=>`<option value="${v}"${v===FSEL?" selected":""}>${e(NAME[v])}</option>`).join("")}</select></label>`;
    return `<div class="k9pm-top"><div class="k9seg k9tabs k9pm-views" role="tablist" aria-label="Kaardivaade">${vb}</div>${sel}</div><div class="k9pm-top k9pm-yrs">${yc}</div>`;}
  function title(){const I=ind();if(VIEW==="flow")return `Töökoha asukoht: ${NAME[FSEL]} · 31.12.2021`;if(VIEW==="chg")return `${I.nm}: muutus ${ylab(I,Y0)} → ${ylab(I,Y1)}`;return `${I.nm} · ${ylab(I,YR)}${I.fc(YR)?" (prognoos)":""}`;}
  function render(root){const I=ind();const why=viewOk(I,VIEW);if(why)VIEW="sit";if(VIEW==="sit")clampY(I);if(VIEW==="chg"&&(Y0==null||Y1==null||Y0<I.yrs[0]||Y1>I.yrs[1]||Y0>I.yrs[1]||Y1<I.yrs[0]))defYears(I);
    const W=K9.wOf(root),wide=W>=900,mw=wide?Math.round(W*0.6):W;
    const map=VIEW==="sit"?mapSit(mw):VIEW==="chg"?mapChg(mw):mapFlow(mw);
    const notes=[...[["chg","Muutus"],["flow","Seosed"]].map(([k,t])=>{const w=viewOk(I,k);return w?`<li><b>${t} pole selle näitaja puhul saadaval:</b> ${e(w)}</li>`:"";})].join("");
    root.innerHTML=fig({kick:"Rahvastik kaardil · "+VIEWS.find(x=>x[0]===VIEW)[1],title:`<span data-swap="title">${e(title())}</span>`,ctl:ctl(),legend:legends(),
      body:`<div class="k9pm-grid"><div class="k9pm-mapw"><div class="k9pm-map" data-swap="map" tabindex="0" aria-label="Kaart: hiireratas suumib, lohistamine nihutab, nooleklahvid ja +/− klaviatuuril">${map}</div><div class="k9zoomc" role="group" aria-label="Kaardi suurendus"><button type="button" data-pmz="in" aria-label="Suurenda">+</button><button type="button" data-pmz="out" aria-label="Vähenda">−</button><button type="button" data-pmz="reset" aria-label="Kogu maakond">⟲</button><span data-pmzl>${ZV[VIEW]?Math.round(100*(VIEW==="flow"?VBF:VB0)[2]/ZV[VIEW][2])+"%":"100%"}</span></div><p class="k9zoomh">Hiireratas suumib, lohista nihutamiseks. Suumides ilmuvad asulate nimed.</p></div><aside class="k9pm-side"><div class="k9pm-bars" data-swap="bars">${bars(wide?Math.round(W*0.38):W)}</div><div class="k9pm-panel" data-swap="panel" aria-live="polite">${panel()}</div></aside></div>${notes?`<ul class="k9pm-why">${notes}</ul>`:""}${passBlock(I)}`,
      table:tbl(),method:meth(),src:"Statistikaamet RV0240, RV112U, RV49U, RVR02, TT065, PA107, UA08, RL21163, RL21147, RV06U, RL21003; kohortmudel v6; Maa- ja Ruumiamet EHAK"});}
  /* ---- suum: ratas, lohistamine, kahe sõrmega, klaviatuur, nupud ---- */
  const baseVB=()=>VIEW==="flow"?VBF:VB0;
  function redrawMap(root){const W=K9.wOf(root),wide=W>=900,mw=wide?Math.round(W*0.6):W,host=root.querySelector('[data-swap="map"]');if(!host)return;
    host.innerHTML=VIEW==="sit"?mapSit(mw):VIEW==="chg"?mapChg(mw):mapFlow(mw);const l=root.querySelector("[data-pmzl]");if(l)l.textContent=Math.round(100*baseVB()[2]/(ZV[VIEW]||baseVB())[2])+"%";}
  function clampZ(z){const b=baseVB();if(!z||z[2]>=b[2]*0.999)return null;const mx=b[2]*0.1,my=b[3]*0.1;z[0]=Math.max(b[0]-mx,Math.min(b[0]+b[2]+mx-z[2],z[0]));z[1]=Math.max(b[1]-my,Math.min(b[1]+b[3]+my-z[3],z[1]));return z;}
  function zoomAt(root,f,px,py){const b=baseVB(),c=ZV[VIEW]||b.slice(),w=Math.max(b[2]/10,Math.min(b[2],c[2]/f)),h=w*b[3]/b[2];if(px==null){px=c[0]+c[2]/2;py=c[1]+c[3]/2;}
    ZV[VIEW]=clampZ([px-(px-c[0])*w/c[2],py-(py-c[1])*h/c[3],w,h]);redrawMap(root);}
  function svgPt(svg,cx,cy){const r=svg.getBoundingClientRect(),v=svg.viewBox.baseVal;return [v.x+(cx-r.left)/r.width*v.width,v.y+(cy-r.top)/r.height*v.height];}
  function zoomBind(root){let D=null,moved=false,raf=0,acc=1,last=null;const P=new Map();
    root.addEventListener("wheel",ev=>{const m=ev.target.closest(".k9pm-map");if(!m)return;const svg=m.querySelector("svg");if(!svg)return;ev.preventDefault();
      acc*=ev.deltaY<0?1.2:1/1.2;last=svgPt(svg,ev.clientX,ev.clientY);if(!raf)raf=requestAnimationFrame(()=>{raf=0;const f=acc;acc=1;zoomAt(root,f,last[0],last[1]);});},{passive:false});
    root.addEventListener("pointerdown",ev=>{const m=ev.target.closest(".k9pm-map");if(!m||(ev.pointerType==="mouse"&&ev.button!==0))return;const svg=m.querySelector("svg");if(!svg)return;P.set(ev.pointerId,[ev.clientX,ev.clientY]);
      if(P.size===2){const [a,b]=[...P.values()];D={pinch:Math.hypot(a[0]-b[0],a[1]-b[1]),mid:svgPt(svg,(a[0]+b[0])/2,(a[1]+b[1])/2)};return;}
      if(!ZV[VIEW])return;const v=svg.viewBox.baseVal;D={x:ev.clientX,y:ev.clientY,vb:[v.x,v.y,v.width,v.height],r:svg.getBoundingClientRect()};moved=false;});
    root.addEventListener("pointermove",ev=>{if(!D||!P.has(ev.pointerId))return;P.set(ev.pointerId,[ev.clientX,ev.clientY]);const svg=root.querySelector(".k9pm-map svg");if(!svg)return;
      if(D.pinch){if(P.size<2)return;const [a,b]=[...P.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(Math.abs(d/D.pinch-1)>0.08){zoomAt(root,d/D.pinch,D.mid[0],D.mid[1]);D.pinch=d;moved=true;}ev.preventDefault();return;}
      const dx=ev.clientX-D.x,dy=ev.clientY-D.y;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;if(!moved)return;ev.preventDefault();
      const z=clampZ([D.vb[0]-dx/D.r.width*D.vb[2],D.vb[1]-dy/D.r.height*D.vb[3],D.vb[2],D.vb[3]]);if(z){ZV[VIEW]=z;svg.setAttribute("viewBox",z.map(q=>q.toFixed(1)).join(" "));}});
    const up=ev=>{P.delete(ev.pointerId);if(D&&P.size===0){const was=moved;D=null;if(was){redrawMap(root);setTimeout(()=>moved=false,0);}}};root.addEventListener("pointerup",up);root.addEventListener("pointercancel",up);
    root.addEventListener("click",ev=>{if(moved&&ev.target.closest(".k9pm-map")){ev.stopPropagation();ev.preventDefault();return;}const z=ev.target.closest("[data-pmz]");if(!z)return;const k=z.dataset.pmz;if(k==="reset"){ZV[VIEW]=null;redrawMap(root);}else zoomAt(root,k==="in"?1.5:1/1.5);},true);
    root.addEventListener("dblclick",ev=>{const m=ev.target.closest(".k9pm-map");if(!m)return;const svg=m.querySelector("svg");const q=svgPt(svg,ev.clientX,ev.clientY);zoomAt(root,ev.shiftKey?1/1.6:1.6,q[0],q[1]);});
    root.addEventListener("keydown",ev=>{if(!ev.target.classList||!ev.target.classList.contains("k9pm-map"))return;const c=ZV[VIEW],b=baseVB();let hit=true;
      if(ev.key==="+"||ev.key==="=")zoomAt(root,1.5);else if(ev.key==="-")zoomAt(root,1/1.5);else if(ev.key==="0"){ZV[VIEW]=null;redrawMap(root);}
      else if(c&&/^Arrow/.test(ev.key)){const st=c[2]*0.12;ZV[VIEW]=clampZ([c[0]+(ev.key==="ArrowRight"?st:ev.key==="ArrowLeft"?-st:0),c[1]+(ev.key==="ArrowDown"?st:ev.key==="ArrowUp"?-st:0),c[2],c[3]]);redrawMap(root);}else hit=false;if(hit)ev.preventDefault();});}
  /* v46: andmepass ja staatiliste kihtide teade */
  function passBlock(I){const codes=[...new Set(((I.src||"")+" "+(I.def||"")).match(/\b(RV\d+U?|RVR\d+|RL\d+|PA\d+|UA\d+|TT\d+|RR\d+|EH\d+U?)\b/g)||["RV0240","RV0282U"])];
    const fc=VIEW==="sit"?I.fc(YR):VIEW==="chg"?(I.fc(Y0)||I.fc(Y1)):false;if(fc||/kohortmudel|prognoos/.test(I.src||""))codes.push("MODEL");codes.push("EHAK");
    const obs=VIEW==="flow"?"31.12.2021 (rahvaloendus)":VIEW==="chg"?`${ylab(I,Y0)} → ${ylab(I,Y1)}`:ylab(I,YR);
    const st=fc?"prognoos (kohortmudel, valitud stsenaarium)":/tuletatud|−/.test(I.src||"")?"tuletatud mõõdetud andmetest":/kasutaja/.test(I.src||"")?"kasutaja sisend":"mõõdetud (register, rahvaloendus või uuring)";
    const lim=[I.def,I.yrs[0]===I.yrs[1]?"ainult üks andmeaasta — muutust ajas ei saa näidata":null,"valla sees jaotust ei näidata"].filter(Boolean).join(" ");
    const stat=SETLON&&I.setl&&VIEW==="sit"&&YR!==2021?`<p class="k9pmstatic" role="status"><b>Asulate ringid:</b> andmed jäävad aastasse 2021 (rahvaloendus, 31.12.2021). Aastaliugur muudab ainult valla värvi ja numbreid, asulate väärtusi ümber ei arvutata.</p>`:"";
    return stat+`<details class="k9det"><summary>Andmepass: ${e(I.nm)}</summary>${K9.PROV.pass({obs,src:codes,level:"vald"+(SETLON&&I.setl?"; asulad: asustusüksus (REL 2021, keskpunkt)":""),st,lim})}</details>`;}
  function meth(){const I=ind();return `<b>${e(I.nm)}</b> (${e(I.u)}): ${e(I.src)}.${I.def?" "+e(I.def):""}<br><b>Olukord:</b> värv = suhtarv; ring = seotud absoluutarv, ringi <i>pindala</i> on võrdeline väärtusega; skaala on fikseeritud kogu andmeperioodile. <b>Muutus:</b> protsendid → protsendipunktid (pp), promillid → promillipunktid, arvud → inimesed ja %, rahasummad → € ja %; värviskaala keskpunkt on 0. Kasvu ei loeta automaatselt paranemiseks: värvi tähendus (soodne/ebasoodne) on antud ainult registreeritud töötusele, palgale ja töötulule (nominaalne). <b>Seosed:</b> ainult rahvaloenduse 2021 töökoha asukoht; sihtkohana on teada Tallinn ja Tartu, muud sihtkohad on esitatud osakaaluna. Puuduvaid väärtusi ei asendata nulliga ega interpoleerita; maakonna võrdlustase arvutatakse maakonna koguarvudest, mitte valdade keskmisest.`;}
  function tbl(){const I=ind(),ys=yrsOf(I),pick=ys.length<=6?ys:[...new Set([ys[0],ys[Math.round((ys.length-1)/3)],ys[Math.round(2*(ys.length-1)/3)],Math.min(START,ys[ys.length-1]),ys[ys.length-1]])];
    const cell=(u,y)=>{const x=R(I,u,y);return x==null?"–":e(I.k==="jr"?d2(x):I.fmt(x));};
    return table(["Üksus",...pick.map(y=>ylab(I,y)+(I.fc(y)?" *":""))],[...V.map(v=>[e(NAME[v]),...pick.map(y=>cell(v,y))]),...(I.noRef?[]:[["Rapla maakond",...pick.map(y=>cell("MAAK",y))]])],{textCols:[0]})+(pick.some(y=>I.fc(y))?`<p class="k9pm-note">* prognoos valitud stsenaariumis</p>`:"");}
  /* aasta vahetusel: sujuv uuendus (sama struktuur) */
  function morph(root){const I=ind(),W=K9.wOf(root),wide=W>=900,mw=wide?Math.round(W*0.6):W;const tmp=document.createElement("div");tmp.innerHTML=mapSit(mw);
    const old=root.querySelector('[data-swap="map"] svg');if(!old){render(root);return;}
    tmp.querySelectorAll("[data-id]").forEach(n=>{const o=old.querySelector(`[data-id="${n.dataset.id}"]`);if(!o)return;["fill","r","cx","cy","aria-label","data-tip","data-tipb"].forEach(a=>{if(n.hasAttribute(a))o.setAttribute(a,n.getAttribute(a));});if(n.tagName==="text")o.textContent=n.textContent;});
    const oldFc=old.querySelectorAll('path[fill="url(#mfc)"]').length,newFc=tmp.querySelectorAll('path[fill="url(#mfc)"]').length;if(oldFc!==newFc||tmp.querySelectorAll("[data-id]").length!==old.querySelectorAll("[data-id]").length){root.querySelector('[data-swap="map"]').innerHTML=tmp.innerHTML;}
    root.querySelector('[data-swap="title"]').textContent=title();root.querySelector('[data-swap="bars"]').innerHTML=bars(wide?Math.round(W*0.38):W);root.querySelector('[data-swap="panel"]').innerHTML=panel();
    const yb=root.querySelector(".k9pm-yr b");if(yb)yb.textContent=ylab(I,YR)+(I.fc(YR)?" · prognoos":" · mõõdetud");const lgd=root.querySelector(".k9leg");if(lgd)lgd.innerHTML=legends().join("");}
  function stop(){if(PLAY){clearInterval(PLAY);PLAY=null;}}
  function pick(root,v){if(VIEW==="flow"){FSEL=v;}else SEL=SEL===v?null:v;render(root);const p=root.querySelector(".k9pm-panel");if(p&&innerWidth<900)p.scrollIntoView({block:"nearest",behavior:K9.RMQ&&K9.RMQ.matches?"auto":"smooth"});}
  K9.part("popmap",{html:()=>`<div class="k9pm" data-pmroot></div>`,
    bind(h){const root=h.querySelector("[data-pmroot]");zoomBind(root);if(!SEL&&V.includes(S.unit)){SEL=S.unit;FSEL=S.unit;}
      root.addEventListener("click",ev=>{const vb=ev.target.closest("[data-pmv]");if(vb){if(vb.getAttribute("aria-disabled")==="true"){const n=root.querySelector(".k9pm-why");if(n){n.classList.add("flash");setTimeout(()=>n.classList.remove("flash"),900);}return;}stop();VIEW=vb.dataset.pmv;if(VIEW==="flow"&&SEL)FSEL=SEL;if(VIEW==="chg"&&Y0==null)defYears(ind());render(root);return;}
        const u=ev.target.closest("[data-pmunit]");if(u){const ub=document.querySelector(`.k9units button[data-u="${u.dataset.pmunit}"]`);if(ub)ub.click();return;}
        const m=ev.target.closest("[data-mu],[data-bar]");if(m){const v=m.dataset.mu||m.dataset.bar;if(v&&v!=="MAAK")pick(root,v);return;}
        if(ev.target.closest("[data-pmplay]")){const I=ind();if(PLAY){stop();render(root);return;}if(K9.RMQ&&K9.RMQ.matches){YR=I.yrs[1];render(root);return;}if(YR>=I.yrs[1])YR=I.yrs[0];render(root);const b=root.querySelector("[data-pmplay]");if(b)b.textContent="■ Peata";PLAY=setInterval(()=>{if(!root.isConnected){stop();return;}YR++;if(YR>=I.yrs[1]){YR=I.yrs[1];stop();render(root);return;}morph(root);const r=root.querySelector("[data-pmy]");if(r)r.value=YR;},900);}});
      root.addEventListener("keydown",ev=>{const m=ev.target.closest&&ev.target.closest("[data-mu],[data-bar]");if(m&&(ev.key==="Enter"||ev.key===" ")){ev.preventDefault();pick(root,m.dataset.mu||m.dataset.bar);}});
      root.addEventListener("input",ev=>{if(ev.target.matches("[data-pmy]")){stop();YR=+ev.target.value;morph(root);}});
      root.addEventListener("change",ev=>{const t=ev.target;if(t.matches("[data-pmg],[data-pmi],[data-pm0],[data-pm1]"))stop();if(t.matches("[data-pmg]")){const f=IND.find(i=>i.g===t.value);if(f){IK=f.k;Y0=null;const I=ind();clampY(I);if(viewOk(I,VIEW))VIEW="sit";if(VIEW==="chg")defYears(I);}render(root);}
        else if(t.matches("[data-pmi]")){IK=t.value;Y0=null;const I=ind();clampY(I);if(viewOk(I,VIEW))VIEW="sit";if(VIEW==="chg")defYears(I);render(root);}
        else if(t.matches("[data-pm0]")){Y0=+t.value;if(Y0>=Y1){const ys=yrsOf(ind());Y1=ys.find(y=>y>Y0)||Y0;}render(root);}
        else if(t.matches("[data-pm1]")){Y1=+t.value;if(Y1<=Y0){const ys=yrsOf(ind());Y0=[...ys].reverse().find(y=>y<Y1)||Y1;}render(root);}
        else if(t.matches("[data-pmfs]")){FSEL=t.value;render(root);}
        else if(t.matches("[data-pms]")){SETLON=t.checked;render(root);}});},
    update(h){render(h.querySelector("[data-pmroot]"));}});
})();
