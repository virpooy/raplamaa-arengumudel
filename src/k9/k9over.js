/* ---------- ÜLEVAADE: lühivaade, kangasteljed (eeldused), seisundivöö, stsenaariumiportreed ---------- */
(function(){
  const {C,VC,e,n0,mln,pp,sgn,lg,fig,sec,tipAttr,tipHTML,stGlyph,pill,rel,tri,moveInto,table}=K9;
  const DEF={mig:"mean",extra:0,fert:0,wage:4.5,emp:EMPB,fertTr:"const",mort:"const",re27:false};
  const SW=[
    {g:"Ränne",id:"r3",t:"Ränne nagu 2024–2026",d:"viimase kahe aasta muster",set:{mig:"r3"}},
    {g:"Ränne",id:"r2",t:"Ränne nagu 2021–2026",d:"sh 2022–23 erakordne välisränne",set:{mig:"r2"}},
    {g:"Ränne",id:"r1",t:"Ränne nagu 2016–2021",d:"enne sõjapõgenike lainet",set:{mig:"r1"}},
    {g:"Ränne",id:"ex",t:"Lisaränne +100 in/a",d:"pererände koosseis, väljastpoolt maakonda",set:{extra:100}},
    {g:"Sündimus ja suremus",id:"fd",t:"Sündimus langeb edasi",d:"2021–25 langustrend jätkub 2030-ni",set:{fertTr:"down"}},
    {g:"Sündimus ja suremus",id:"fm",t:"Sündimus −10%",d:"sünde 10% vähem kui 2023–25",set:{fert:-10}},
    {g:"Sündimus ja suremus",id:"mt",t:"Eluiga kasvab",d:"suremus langeb eluea trendi järgi",set:{mort:"tr"}},
    {g:"Majandus",id:"wg",t:"Palgakasv 3%",d:"4,5% asemel · mõjutab tulumaksu",set:{wage:3}},
    {g:"Majandus",id:"em",t:"Tööhõive −2,5 pp (61,6%)",d:"Raplamaa 64,1% asemel · mõjutab tulumaksu",set:{emp:61.6}},
    {g:"Majandus",id:"re27",t:"RE 2027 eelnõu / RM prognoos",d:"KOV määr 10,23% · palk 4,7/4,4/4,3/4,2%",set:{re27:true}}];
  const swOn=w=>Object.entries(w.set).every(([k,v])=>S[k]===v);
  const SYS={pop:["Rahvastik","rahvastik"],edu:["Lasteaiad ja koolid","teenused"],bud:["Rahandus","eelarve"],house:["Eluase","eluase"],water:["Vesi","eluase"]};
  /* nimetus vastab arvutusele: eduChg = 2026 lähtelaste arv × vanuserühma muutus → hinnatud nõudlus, mitte vanuserühma elanike arv */
  try{GAUGES.edu[0].lab="Hinnatud lasteaianõudlus 2036 vs 2026";GAUGES.edu[1].lab="Hinnatud koolinõudlus valla koolides 2036 vs 2025/26";}catch(_){}
  const ILAB2={pchg:"Rahvaarvu muutus 2026→2036",old:"65+ osakaal 2036",la:"Hinnatud lasteaianõudlus 2036 vs 2026",sc:"Hinnatud koolinõudlus valla koolides 2036 vs 2025/26",net:"Netovõlakoormus 2026",res:"Põhitegevuse tulem 2025",tax:"Tulumaksu laekumise kasv 2026",vac:"Asustamata eluruumid (REL 2021)",hcov:"Uusehitus vs lisavajadus",wat:"Veevarustusega eluruumid",wco:"Ilma tualettruumita eluruumid"};
  /* ---- seisundivöö ---- */
  function gauge(g,u){let v=null;try{v=g.get(u);}catch(_){}const has=v!=null&&(isFinite(v)||v===Infinity);const [stc,txt]=has?g.st(v,u):["na","andmed puuduvad"];const st=stc==="na"?"na":stc;
    const sp=(g.max-g.min)||1,X=x=>Math.max(0,Math.min(1,(x-g.min)/sp))*100;
    const bands=(g.bands||[]).map(([a,b,k])=>`<i class="bd ${k}" style="left:${X(a)}%;width:${X(b)-X(a)}%"></i>`).join("");
    const pos=has&&isFinite(v)?X(v):null,out=has&&isFinite(v)&&(v<g.min||v>g.max);
    const ref=g.k==="old"?`<i class="rf" style="left:${X(shares(u,2026).old)}%"><em>2026</em></i>`:"";
    const say=typeof ISAY!=="undefined"&&ISAY[g.k]?ISAY[g.k](v,u):"";
    return `<article class="k9gz" data-st="${st}">
      <div class="gh"><span class="gl">${e(ILAB2[g.k]||g.lab)}</span>${rel(g.rel)}</div>
      <div class="gv">${has?e(g.fmt(v)):"puudub"}</div>
      <div class="gtrk" role="img" aria-label="${e((ILAB2[g.k]||g.lab)+": "+(has?g.fmt(v):"andmed puuduvad")+", "+txt)}">${bands}${ref}${pos!=null?`<i class="mk" style="left:${pos}%"></i>`:""}</div>
      <div class="gends"><span>${e((g.ends||[])[0]||"")}</span><span>${e((g.ends||[])[1]||"")}</span></div>
      <div class="gs">${pill(st,txt+(out?" · skaalast väljas":""))}</div>
      ${say?`<p class="gsay">${e(say)}</p>`:""}</article>`;}
  function belt(u){return Object.entries(GAUGES).map(([k,arr])=>`<div class="k9gzg"><a class="k9gzh" href="#${SYS[k][1]}" data-go="${SYS[k][1]}">${SYS[k][0]} <span aria-hidden="true">→</span></a><div class="k9gzr">${arr.map(g=>gauge(g,u)).join("")}</div></div>`).join("");}
  /* ---- stsenaariumiportreed ----
     Väärtused: K9.pat (aktiivne režiim). Märk: pindala ∝ |muutus| võrdlusaasta suhtes kuni ±15% (kolmnurga pindala = 1,62·s²);
     suund on eraldi (▲/▼); võrdlusaasta ise ja täpne null = lühike kriips; muutus alla ±0,5% = vähim nähtav märk; üle ±15% = suurim märk + ring. */
  let PCMP=START;
  const PCAP=0.15,PSMAX=7.75,PSMIN=1.7;
  const pCell=(x,y,d)=>{if(d==null||!isFinite(d))return K9.miss(x,y,4);if(d===0)return `<line x1="${x-5}" x2="${x+5}" y1="${y}" y2="${y}" stroke="${C.mut}" stroke-width="1.6"/>`;
    const a=Math.min(1,Math.abs(d)/PCAP);let sz=PSMAX*Math.sqrt(a);if(sz<PSMIN)sz=PSMIN;let g=tri(x,y,sz,d>0?C.gain:C.loss,d>0,true);if(Math.abs(d)>PCAP)g+=`<circle cx="${x}" cy="${y}" r="${PSMAX+3.2}" fill="none" stroke="${d>0?C.gain:C.loss}" stroke-width="1.1"/>`;return g;};
  const pBase=(m,u)=>K9.pat(m,u,PCMP);
  function portrait(m,sel){const cs=27,L=74,T=58,W=L+10*cs+8,rows=K9.UNITS,cols=[];for(let y=2027;y<=YN;y++)cols.push(y);const H=T+rows.length*cs+28;
    const u=S.unit,v36=K9.pat(m,u,YN),b0=pBase(m,u);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rändemuster ${e(MIGL[m])}: ${NAME[u]} ${YN} ${n0(v36)}, ${pct(v36/b0-1)} võrreldes aastaga ${PCMP}.">`;
    s+=`<text x="0" y="16" class="t-cap"${sel?` style="fill:${C.kid}"`:""}>${sel?"✓ VALITUD":"RÄNDEMUSTER"}</text><text x="0" y="36" class="t-lab" style="font-size:14px">${e(MIGL[m])}</text>`;
    s+=`<text x="${W}" y="36" text-anchor="end" class="t-num" style="font-size:15px">${n0(v36)}</text><text x="${W}" y="16" text-anchor="end" class="t-ax">${SHORTN[u]} ${YN} · ${pct(v36/b0-1)} vs ${PCMP}</text>`;
    rows.forEach((r,i)=>{const y=T+i*cs+cs/2;s+=`<text x="${L-8}" y="${y+4}" text-anchor="end" class="t-labm"${r===u?` style="fill:${C.ink};font-weight:700"`:""}>${r==="MAAK"?"Maakond":SHORTN[r]}</text>`;
      s+=`<line x1="${L}" x2="${L+cols.length*cs}" y1="${y}" y2="${y}" stroke="${C.line}"/>`;
      const b=pBase(m,r);cols.forEach((yy,j)=>{const n=K9.pat(m,r,yy),d=b?(yy===PCMP?0:n/b-1):null,x=L+j*cs+cs/2;
        s+=`<g${tipAttr(tipHTML(`${r==="MAAK"?"Maakond":NAME[r]} ${yy}`,[["rändemuster",MIGL[m]],["rahvaarv",n0(n)],[`võrdlusaasta ${PCMP}`,n0(b)],["muutus",d==null?"ei saa arvutada":pct(d)]],`prognoos · režiim: ${K9.modeLabel()}`))}>${pCell(x,y,d)}</g>`;});});
    cols.forEach((yy,j)=>{if(j%3===0||yy===YN)s+=`<text x="${L+j*cs+cs/2}" y="${H-8}" text-anchor="middle" class="t-ax">${yy}</text>`;});
    return s+"</svg>";}
  function portraitKey(){const W=342,H=226;let s=`<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><text x="0" y="16" class="t-cap">KUIDAS LUGEDA</text>`;
    [[0.004,"<0,5%"],[0.05,"5%"],[0.10,"10%"],[0.15,"15%"],[0.2,">15%"]].forEach(([d,t],i)=>{const x=30+i*66;s+=pCell(x,54,d)+pCell(x,92,-d)+`<text x="${x}" y="${124}" text-anchor="middle" class="t-ax">${t[0]==="<"||t[0]===">"?t[0]+"±"+t.slice(1):"±"+t}</text>`;});
    s+=`<text x="0" y="152" class="t-labm">Pindala ∝ |muutus| võrdlusaastast ${PCMP}, kuni ±15%.</text><text x="0" y="170" class="t-labm">▲ rohkem, ▼ vähem elanikke. Ring = üle ±15%.</text><text x="0" y="188" class="t-labm">Kriips = võrdlusaasta ise (muutus 0).</text><text x="0" y="206" class="t-labm">Alla ±0,5% = vähim märk (mitte null).</text>`;return s+"</svg>";}
  function portraits(){return `<div class="k9port">${MIGS_ALL.map(m=>`<button type="button" class="k9pt" data-mig="${m}" aria-pressed="${S.mig===m}" aria-label="Vali rändemuster ${e(MIGL[m])}">${portrait(m,S.mig===m)}</button>`).join("")}<div class="k9pt key">${portraitKey()}</div></div>`;}
  function portraitTable(){return K9.table(["Rändemuster",...K9.UNITS.flatMap(u=>[(u==="MAAK"?"Maakond":SHORTN[u])+" "+PCMP,(u==="MAAK"?"Maakond":SHORTN[u])+" "+YN,"muutus"])],MIGS_ALL.map(m=>({sel:S.mig===m,c:[MIGL[m],...K9.UNITS.flatMap(u=>{const b=pBase(m,u),n=K9.pat(m,u,YN);return [n0(b),n0(n),b?pct(n/b-1):"ei saa arvutada"];})]})),{textCols:[0]});}
  function cmpCtl(){return `<label class="k9rng"><span class="k9lbl">Võrdlusaasta</span><input type="range" id="k9pcmp" min="2015" max="${YN-1}" step="1" value="${PCMP}" aria-label="Võrdlusaasta"><output data-pcmp>${PCMP}</output></label><span class="k9note">Muutus = (N(aasta) / N(${PCMP}) − 1) × 100%. Võrdlusaasta ei muuda prognoosi lähteaastat (${START}) ega rändemustri kalibreerimisperioodi.</span>`;}
  /* ---- eeldused ---- */
  const LOCK=()=>(S.smode||"all")==="mig";
  function slider(id,lab,k,min,max,step,fmt,note){return `<div class="k9lev"><label for="${id}"><span>${lab}</span><output for="${id}" id="${id}o">${fmt(S[k])}</output></label><input type="range" id="${id}" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${S[k]}"${LOCK()?" disabled":""}>${note?`<small>${note}</small>`:""}</div>`;}
  function seg(k,opts,lab){return `<div class="k9lev"><span class="ll">${lab}</span><div class="k9seg" role="group" aria-label="${e(lab)}">${opts.map(([v,t])=>`<button type="button" data-k="${k}" data-v="${v}" aria-pressed="${S[k]===v}"${LOCK()?" disabled":""}>${t}</button>`).join("")}</div></div>`;}
  const FMT={extra:v=>sg(v)+" in/a",fert:v=>sg(v)+"%",wage:v=>nf1.format(v)+"%",emp:v=>nf1.format(v)+"%"};
  function modeSeg(){const m=S.smode||"all";return `<div class="k9seg k9mode" role="group" aria-label="Arvutusrežiim"><button type="button" data-smode="mig" aria-pressed="${m==="mig"}">Ainult rändemuster</button><button type="button" data-smode="all" aria-pressed="${m==="all"}">Rändemuster koos aktiivsete eeldustega</button></div>`;}
  K9.modeSeg=modeSeg;
  function controls(){const u=S.unit,lk=(S.smode||"all")==="mig";
    return `<div class="k9loom${lk?" k9locked":""}">
      <div class="k9lev wide"><span class="ll">Rändemuster <small>(suurim määramatus)</small></span><div class="k9migs" role="group" aria-label="Rändemuster">${MIGS_ALL.map(m=>`<button type="button" data-k="mig" data-v="${m}" aria-pressed="${S.mig===m}"><b>${e(MIGL[m])}</b><small>${SHORTN[u]} ${YN}: ${n0(K9.pat(m,u,YN))}</small></button>`).join("")}</div></div>
      ${(S.smode||"all")==="mig"?`<p class="k9note k9lock wide">Režiim „ainult rändemuster”: hoovad on ajutiselt baasväärtusel ega ole muudetavad. Varasemad hoovad taastuvad, kui valid režiimi „koos aktiivsete eeldustega”.</p>`:""}
      ${slider("k9ex","Lisaränne maakonda","extra",-150,300,10,FMT.extra,"pererände koosseis, jaotus valdade rahvaarvu järgi")}
      ${slider("k9fe","Sündimus 2023–25 tasemest","fert",-30,30,5,FMT.fert)}
      ${seg("fertTr",[["const","Püsib"],["down","Langus jätkub 2030-ni"],["sa","Statistikaameti TFR"]],"Sündimuse trend")}
      ${seg("mort",[["const","Püsib 2021–25 tasemel"],["tr","Eluiga kasvab trendi järgi"]],"Suremus")}
      ${slider("k9wa","Palgakasv aastas","wage",2,7,0.5,FMT.wage,"mõjutab ainult tulumaksu")}
      ${slider("k9em","Tööhõive 15–74 (Raplamaa)","emp",58,70,0.1,FMT.emp,"baas 64,1% = Raplamaa 2023–25 keskmine (TT4661); Eesti 2025: 68,5% · mõjutab ainult tulumaksu")}
    </div>
    <div class="k9sw"><span class="ll">Stsenaariumi lülitid</span>${SW.map(w=>`<button type="button" class="k9chip" data-sw="${w.id}" aria-pressed="${swOn(w)}"${lk&&w.g!=="Ränne"?" disabled":""}><b>${w.t}</b><small>${w.d}</small></button>`).join("")}</div>
    <div class="k9acts"><button type="button" class="k9btn ghost" data-reset>Taasta baaseeldused</button></div>`;}
  function logHTML(){if(!K9.LOG.length)return `<p class="k9note">Muuda eeldust: siia ilmub, kuidas valitud ühiku 2036. aasta näitajad muutusid.</p>`;
    return `<ol class="k9log">${K9.LOG.map(l=>`<li><span class="lt">${l.t}</span><b>${e(l.label)}</b> <span class="lu">${e(l.u)}</span>${l.r.length?`<span class="lr">${l.r.map(([a,b,d])=>`<span><i class="${d>0.5?"up":d<-0.5?"dn":"eq"}" aria-hidden="true"></i>${e(a)}: <b>${e(b)}</b></span>`).join("")}</span>`:""}</li>`).join("")}</ol>`;}
  function bind(el){el.addEventListener("click",ev=>{
      const b=ev.target.closest("button[data-k][data-v]");if(b){const k=b.dataset.k,v=b.dataset.v;K9.setS({[k]:v},`${k==="mig"?"Rändemuster: "+MIGL[v]:(k==="fertTr"?"Sündimuse trend: ":"Suremus: ")+b.textContent.trim()}`);return;}
      const p=ev.target.closest(".k9pt");if(p){K9.setS({mig:p.dataset.mig},"Rändemuster: "+MIGL[p.dataset.mig]);return;}
      const w=ev.target.closest("[data-sw]");if(w){const sw=SW.find(x=>x.id===w.dataset.sw),on=swOn(sw);const patch={};Object.keys(sw.set).forEach(k=>patch[k]=on?DEF[k]:sw.set[k]);K9.setS(patch,(on?"Välja: ":"Sisse: ")+sw.t);return;}
      if(ev.target.closest("[data-reset]")){K9.resetAll();return;}});
    let tm=0;el.addEventListener("input",ev=>{if(ev.target.id==="k9pcmp"){PCMP=+ev.target.value;const o=el.querySelector("[data-pcmp]");if(o)o.textContent=PCMP;clearTimeout(tm);tm=setTimeout(()=>{K9.render(K9.st.view);requestAnimationFrame(()=>{const n=document.getElementById("k9pcmp");n&&n.focus();});},180);return;}
      const r=ev.target.closest("input[type=range][data-k]");if(!r)return;if((S.smode||"all")==="mig"){r.value=S[r.dataset.k];return;}const k=r.dataset.k;document.getElementById(r.id+"o").textContent=FMT[k](+r.value);
      clearTimeout(tm);tm=setTimeout(()=>{K9.setS({[k]:+r.value},`${r.closest(".k9lev").querySelector("label span").textContent}: ${FMT[k](+r.value)}`);requestAnimationFrame(()=>{const n=document.getElementById(r.id);n&&n.focus();});},260);});}
  function patRange(u,y){const rng=MIGS_ALL.map(m=>K9.pat(m,u,y));return [Math.min(...rng),Math.max(...rng)];}
  K9.patRange=patRange;
  function lead(){const u=S.unit,p26=POP[u].tot["2026"],p36=popT(u,YN),[lo,hi]=patRange(u,YN);
    return `${NAME[u]} ${p36>=p26?"kasvab":"kahaneb"} valitud eeldustel ${n0(p26)} elanikult <b>${K9.rp(p36)}</b> elanikuni aastaks ${YN} (${pct(p36/p26-1)}). Rändemustrite ulatus (min–max; stsenaariumid, mitte tõenäosus) on ${K9.rp(lo)}–${K9.rp(hi).replace("≈ ","")}; juhusliku kõikumise vahemik (80%) valitud mustris ${K9.rp(MC[u][YN][0])}–${K9.rp(MC[u][YN][1]).replace("≈ ","")}. Need on eri asjad: esimene näitab rändeeelduse valikut, teine ainult juhuslikkust sama eelduse juures — kumbki ei ole tõenäosusvahemik.`;}
  /* ======== ARENGUKANGAS: ajaliselt joondatud kirivöö-read 2026–2036 ========
     Lugemisreeglid (dokumenteeritud ka metoodikas):
     · püsiv ornament: rea keskjoon, ridade eraldusjoon, valdkonna piltmärk, aastaveergude raster — ei kodeeri väärtust;
     · andmeid kodeeriv märk: 2026 lähtetaseme romb (andmeolek kujuga), piste = kindel hulk muutust 2026-st rea enda ühikus (▲ kasv, ▼ vähenemine),
       netovõlakoormuse tulp = tase, × = puudub (mitte null);
     · valiku ja fookuse tähis: kahekordne raam (kollane + hele katkendjoon) valitud märgi või rea ümber — ei muuda märgi kuju ega värvi. */
  let SELY=YN,PREV=null,KSEL={r:null,y:null};
  const STEPS=[0.1,0.2,0.25,0.5,1,2,2.5,5,10,20,25,50,100,200,250,500,1000];
  const pickStep=(mx,cap)=>STEPS.find(s=>mx/s<=cap)||STEPS[STEPS.length-1];
  const STN={m:"mõõdetud",d:"tuletatud",f:"prognoos",b:"eelarve või strateegia"};
  function rows(u){const Y=[];for(let y=START;y<=YN;y++)Y.push(y);const sch=K9.schools().filter(s=>u==="MAAK"||s.v===u);
    const scen=()=>`${MIGL[S.mig]} · ${K9.modeLabel()}${K9.changed().filter(x=>!x.startsWith("rändemuster")).length?" · "+K9.changed().filter(x=>!x.startsWith("rändemuster")).join("; "):""}`;
    const R=[
      {k:"pop",kind:"pop",n:"Rahvaarv",unit:"inimest",f:y=>popT(u,y),fmt:v=>f0(v),dfmt:v=>sgn(Math.round(v)),sens:"ränne, sündimus, suremus",
        def:"Rahvastikuregistri järgi valla elanike arv 1. jaanuaril.",per:y=>y===START?"1.01.2026 (mõõdetud)":`1.01.${y} (prognoos)`,st0:"m",
        src:y=>y===START?"Statistikaamet RV0282U, 1.01.2026; päritud 05.10.2026":"kohortmudel v6 (projectFrom), lähteaasta 1.01.2026",
        chk:y=>y===START?"kontrollitud: väärtus võrreldud Statistikaameti tabeliga (11.10.2026)":"arvutus kontrollitud regressioonitestiga; prognoosi paikapidavus tõendamata",
        lim:"Ränne on suurim määramatus; juhusliku kõikumise vahemik (80%) ei sisalda rändemustri valikut.",
        att:(v,b)=>{const c=v/b-1;return c<-0.05?["crit","kahaneb üle 5% võrreldes 2026"]:c<0?["warn","väiksem kui 2026"]:null;},rule:"▲ alla 2026 taseme, ■ üle 5% alla (mudeli kokkulepe, mitte ametlik lävend)",calc:"kohortmudel: üheaastased vanused, rändemuster, sündimus, suremus"},
      {k:"old",kind:"pop",n:"65+ osakaal",unit:"p.p.",f:y=>shares(u,y).old*100,fmt:v=>nf1.format(v)+"%",dfmt:v=>(v>=0?"+":"−")+nf1.format(Math.abs(v))+" p.p.",sens:"rahvastikureast",
        def:"65-aastaste ja vanemate osakaal rahvaarvust 1. jaanuaril.",per:y=>y===START?"1.01.2026 (mõõdetud)":`1.01.${y} (prognoos)`,st0:"m",
        src:y=>y===START?"Statistikaamet RV0282U, 1.01.2026":"kohortmudel v6",chk:y=>y===START?"kontrollitud (11.10.2026)":"arvutus kontrollitud; paikapidavus tõendamata",lim:"Sõltub suremuse ja rände eeldusest.",
        att:(v,b)=>v-b>1?["warn","üle 1 p.p. suurem kui 2026"]:null,rule:"▲ üle +1 p.p. võrreldes 2026 (mudeli kokkulepe)",calc:"65+ arv / kogu rahvaarv samast kohortmudelist"},
      {k:"la",kind:"edu",n:"Hinnatud lasteaianõudlus",unit:"last",f:y=>eduDemand(u,y).la,fmt:v=>f0(v),dfmt:v=>sgn(Math.round(v)),sens:"rahvastikureast",
        def:"Mudeli hinnatud lasteaiateenuse nõudlus: lähtetaseme lasteaialaste arv, mida muudetakse 1–6-aastaste arvu muutuse järgi. Ei ole lasteaiaealiste elanike arv ega lasteaiakohtade arv.",per:y=>y===START?"alus: toetusfondi arvestus, EHIS 10.11.2025 (2025/26)":`${y} (prognoos)`,st0:"m",
        src:y=>y===START?"toetusfondi arvestus ja EHIS 10.11.2025; päritud 06.10.2026. Täpne lähtekirje kontrollimata.":"kohortmudel v6 + eduDemand",chk:y=>y===START?"kontrollimata (täpne lähtekirje kontrollimata)":"arvutus kontrollitud; paikapidavus tõendamata",
        lim:"Ei arvesta lasteaias käimise määra muutust, teise valla lasteaedu ega kohtade arvu (andmed puuduvad).",
        att:(v,b)=>Math.abs(v/b-1)>0.1?["warn",(v<b?"väheneb":"kasvab")+" üle 10%"]:null,rule:"▲ muutus üle ±10% (mudeli kokkulepe)",calc:"2026 lasteaialapsed × (1–6-aastaste arv aastal t / 1–6-aastaste arv 2026)",link:"pop"},
      {k:"sc",kind:"edu",n:"Hinnatud õpilaste arv valla koolides",unit:"õpilast",f:y=>eduDemand(u,y).sc,fmt:v=>f0(v),dfmt:v=>sgn(Math.round(v)),sens:"rahvastikureast",
        def:"Mudeli hinnatud koolinõudlus valla munitsipaalkoolides: 2025/26 õpilaste arv, mida muudetakse kooliealiste arvu muutuse järgi (põhikool 7–15, gümnaasiumiosa eraldi). Riigigümnaasium ei ole hõlmatud.",per:y=>y===START?"alus: 2025/26 õppeaasta (EHIS 10.11.2025)":`${y} (prognoos)`,st0:"m",
        src:y=>y===START?"toetusfondi arvestus ja EHIS 10.11.2025; päritud 06.10.2026. Täpne lähtekirje kontrollimata.":"kohortmudel v6 + eduDemand",chk:y=>y===START?"kontrollimata (täpne lähtekirje kontrollimata)":"arvutus kontrollitud; paikapidavus tõendamata",
        lim:"Ei arvesta õpilaste liikumise muutust valdade ja erakoolide vahel ega koolikohtade arvu.",
        att:(v,b)=>Math.abs(v/b-1)>0.1?["warn",(v<b?"väheneb":"kasvab")+" üle 10%"]:null,rule:"▲ muutus üle ±10% (mudeli kokkulepe)",calc:"2025/26 õpilased × kooliealiste rühma muutus (rahvastikureast)",link:"pop"},
      {k:"sch",kind:"edu",n:"Koole ÜRP lävendist allpool",unit:"kooli",f:y=>sch.filter(s=>s.n_(y)<s.lim).length,fmt:v=>f0(v),dfmt:v=>sgn(Math.round(v)),sens:"rahvastikureast",int:true,
        def:"Valla koolide arv, mille hinnatud õpilaste arv on alla ÜRP koonduuringu lävendi (põhikool 90, algkool 20, gümnaasiumiosa 100 õpilast).",per:y=>y===START?"alus: 2025/26 õppeaasta":`${y} (prognoos)`,st0:"m",
        src:()=>"kooli 2025/26 õpilased (EHIS), ÜRP koonduuring 2025 lävendid",chk:()=>"lävendid kontrollitud ÜRP aruandest; kooliandmete täpne lähtekirje kontrollimata",lim:"Lävend on uuringu stsenaariumipiir, mitte õigusnorm.",
        att:(v,b)=>v>b?["warn",`${v-b} kooli lisandub lävendist allapoole (kokku ${v})`]:null,rule:"▲ lävendist allpool on rohkem koole kui 2026",calc:"kooli 2025/26 arv × valla vanuserühma muutus, võrdlus ÜRP lävendiga",link:"pop"},
      {k:"tax",kind:"raha",n:"Tulumaks (jooksevhindades)",unit:"mln €",f:y=>taxSeries(u)[y]/1e6,fmt:v=>nf1.format(v)+" mln €",dfmt:v=>(v>=0?"+":"−")+nf1.format(Math.abs(v))+" mln €",sens:"rahvastik + palgakasv, hõive",
        def:"Valla eelarvesse laekuv füüsilise isiku tulumaks aastas.",per:y=>y===START?"2026: jaanuar–september MTA + oktoober–detsember hinnang":`${y} (prognoos)`,st0:"d",
        src:y=>y===START?"Maksu- ja Tolliamet, laekumised jaan–sept 2026; päritud 05.10.2026":"taxSeries: 2026 hinnang × palgaindeks × hõive × 20–64-aastaste arv (+ pensionide osa)",chk:y=>y===START?"osaliselt kontrollitud: 9 kuud mõõdetud, 3 kuud hinnang":"arvutus kontrollitud regressioonitestiga",
        lim:"Ei arvesta tulumaksuseaduse määrade muutust, kui RE 2027 stsenaarium ei ole sisse lülitatud.",
        att:(v,b,p)=>p!=null&&v<p?["crit","väiksem kui eelmisel aastal"]:null,rule:"■ väiksem kui eelmisel aastal",calc:"2026 hinnang × palgaindeks × hõive × 20–64-aastaste arv (+ pensionide osa 65+ järgi)",link:"pop",d26:true},
      {k:"net",kind:"raha",n:"Netovõlakoormus",unit:"p.p.",f:y=>{const v=netPct(u,y);return isFinite(v)?v*100:null;},fmt:v=>nf0.format(v)+"%",dfmt:v=>(v>=0?"+":"−")+nf0.format(Math.abs(v))+" p.p.",sens:null,
        def:"Netovõlakoormus = kohustused miinus likviidsed varad, protsendina põhitegevuse tuludest (KOFS § 34).",per:y=>`${y}: valla eelarvestrateegia`,st0:"b",
        src:()=>"valdade eelarvestrateegiad (vt Eelarve → Võlakoormus)",chk:()=>"osaliselt kontrollitud: strateegia tabelid loetud",lim:"Ei arvutata mudelis ega sõltu stsenaariumist; strateegia periood on piiratud.",
        miss:"prognoosi ei ole koostatud: valla eelarvestrateegia ei ulatu sellesse aastasse",
        att:v=>v>60?["crit","üle seaduse üldpiiri 60%"]:v>=50?["warn","üle mudeli hoiatuse 50%"]:null,rule:"▲ ≥ 50% (mudeli hoiatus), ■ > 60% (KOFS üldpiir)",calc:"valdade eelarvestrateegiad (ei arvutata mudelis)",abs:true}];
    R.forEach(r=>{r.v=Y.map(y=>{const x=r.f(y);return x==null||!isFinite(x)?null:x;});r.b=r.v[0];r.Y=Y;r.st=r.v.map((x,i)=>x==null||r.b==null?null:r.att(x,r.b,i?r.v[i-1]:null));r.scen=scen;
      r.state=y=>r.abs?"b":y===START?r.st0:"f";
      const ds=r.v.map(x=>x==null||r.b==null?0:Math.abs(x-r.b));r.mx=Math.max(...ds,1e-9);});
    return R;}
  function cloth(W,R,o){o=o||{};const narrow=W<760,LW=narrow?118:300,RW=narrow?0:170,TOP=70,rh=narrow?90:118,Y=R[0].Y,cw=(W-LW-RW)/Y.length,H=TOP+R.length*rh+30,X=y=>LW+(y-START)*cw+cw/2,si=Y.indexOf(SELY);
    const ncol=cw>78?4:cw>56?3:2,st=Math.min(6.2,(cw*0.86)/(ncol*2.1)),pitch=st*1.5,capR=Math.floor((rh/2-12)/pitch),cap=ncol*capR;
    R.forEach(r=>{r.step=r.int?1:pickStep(r.mx,cap);});
    const focusK=KSEL.r&&KSEL.y?KSEL.r+"|"+KSEL.y:(R[0].k+"|"+START);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Arengukangas ${NAME[S.unit]}: ${R.length} kirivöö-rida ${START}–${YN}. Valitud aasta ${SELY}. Nooleklahvid liiguvad märkide vahel, Enter avab detaili.">`;
    s+=`<rect x="${LW+si*cw+1}" y="${TOP-46}" width="${cw-2}" height="${H-TOP+40}" fill="${C.kid}" fill-opacity=".07" stroke="${C.kid}" stroke-opacity=".35" pointer-events="none"/>`;
    Y.forEach((y,i)=>{s+=`<text x="${X(y)}" y="${TOP-30}" text-anchor="middle" class="t-ax" style="${y===SELY?"fill:"+C.kid+";font-weight:700":""}">${narrow&&i%2&&y!==SELY&&y!==YN?"":narrow?String(y).slice(2):y}</text>`;});
    if(!o.single){s+=`<text x="${LW-10}" y="${TOP-8}" text-anchor="end" class="t-cap">TÄHELEPANU</text>`;
      Y.forEach((y,i)=>{const hits=R.filter(r=>r.st[i]),kinds=[...new Set(hits.map(r=>r.kind))];let yy=TOP-8;
        hits.forEach((r,j)=>{s+=K9.stGlyph(r.st[i][0],X(y)-(hits.length-1)*4.5+j*9,yy-4,3.4);});
        if(kinds.length>=2)s+=`<line x1="${X(y)-cw*0.4}" x2="${X(y)+cw*0.4}" y1="${TOP+2}" y2="${TOP+2}" stroke="${C.warn}" stroke-width="2"/>`;
        s+=`<rect x="${X(y)-cw/2}" y="${TOP-48}" width="${cw}" height="40" fill="transparent" class="k9ycol" data-y="${y}"${K9.tipAttr(K9.tipHTML(`${y} · tähelepanu`,hits.length?hits.map(r=>[r.n,r.st[i][1]]):[["–","ükski rida ei ületa oma reeglit"]],kinds.length>=2?"mitu valdkonda samal aastal":""))}/>`;});}
    R.forEach((r,ri)=>{const y0=TOP+ri*rh,cy=y0+rh/2+4,col=K9.KIND[r.kind].c,rsel=KSEL.r===r.k&&!KSEL.y;
      s+=`<line x1="0" x2="${W}" y1="${y0+6}" y2="${y0+6}" stroke="${C.line}"/>`;
      s+=`<g class="k9rowlab" data-row="${r.k}" tabindex="0" role="button" aria-pressed="${rsel}" aria-label="Kirivöö ${e(r.n)}: ava rea detail (muster, ajatelg, legend, võrdlusbaas)"><rect x="2" y="${y0+9}" width="${LW-10}" height="${rh-10}" fill="transparent"/>`;
      s+=K9.icon(r.kind,12,y0+24,16);
      s+=`<text x="26" y="${y0+28}" class="t-lab" style="font-size:${narrow?11.5:13.5}px">${e(narrow?r.n.replace(" (jooksevhindades)","").replace("ÜRP lävendist allpool","lävendi all").replace("Hinnatud õpilaste arv valla koolides","Hinnatud õpilased").replace("Hinnatud lasteaianõudlus","Hinn. lasteaianõudlus"):r.n)}</text>`;
      s+=`<text x="${narrow?4:26}" y="${y0+(narrow?44:45)}" class="t-ax" style="font-size:${narrow?10:11}px">${r.abs?(narrow?"tulp = tase":"tulp = tase 0–100%, vahe 10 p.p."):`1 piste = ${r.int?1:(r.step<1?nf1.format(r.step):f0(r.step))} ${r.unit}${narrow?"":" muutust 2026-st"}`}</text>`;
      if(!narrow){s+=`<text x="26" y="${y0+60}" class="t-ax" style="font-size:11px;fill:${r.sens?C.mut:C.dim}">${r.sens?"sõltub: "+r.sens:"stsenaariumist sõltumatu"}${r.chg!=null?` · <tspan style="fill:${r.chg?C.kid:C.dim}">${r.chg?"uuenes":"ei muutunud"}</tspan>`:""}</text>`;
        s+=`<text x="26" y="${y0+75}" class="t-ax" style="font-size:10.5px;fill:${C.dim}">${r.abs?"":"ümardus: round(|Δ|/piste); <½ = väike märk"}</text>`;}
      if(rsel)s+=`<rect x="1" y="${y0+8}" width="${W-2}" height="${rh-4}" fill="none" stroke="${C.kid}" stroke-width="2.2"/><rect x="4" y="${y0+11}" width="${W-8}" height="${rh-10}" fill="none" stroke="${C.ink}" stroke-opacity=".6" stroke-dasharray="3 3"/>`;
      s+=`</g>`;
      s+=`<line x1="${LW}" x2="${W-RW}" y1="${cy}" y2="${cy}" stroke="${col}" stroke-opacity=".55"/>`;
      const hb=rh-26,yb=y0+rh-8,YA=v=>yb-v/100*hb;if(r.abs){[[50,C.warn],[60,C.crit]].forEach(([t,c])=>s+=`<line x1="${LW}" x2="${W-RW}" y1="${YA(t)}" y2="${YA(t)}" stroke="${c}" stroke-dasharray="2 3" stroke-opacity=".7"/>`);s+=`<text x="${narrow?W-4:LW-6}" y="${YA(60)-3}" text-anchor="end" class="t-ax" style="font-size:10px;fill:${C.crit}">60%${narrow?"":" seadus"}</text><text x="${narrow?W-4:LW-6}" y="${YA(50)+(narrow?-3:8)}" text-anchor="end" class="t-ax" style="font-size:10px;fill:${C.warn}">50%${narrow?"":" hoiatus"}</text>`;}
      Y.forEach((y,i)=>{const v=r.v[i],x=X(y),sel=KSEL.r===r.k&&KSEL.y===y,key=r.k+"|"+y;let g="";
        if(v==null){const my=r.abs?yb-8:cy;g+=K9.miss(x,my,4);if(i===0||r.v[i-1]!=null)g+=`<text x="${x}" y="${my-9}" text-anchor="middle" class="t-ax" style="font-size:10.5px">puudub</text>`;}
        else{const state=i===0?(r.d26?"d":"m"):"f";
          if(r.abs){const bw=Math.min(14,cw*0.45);g+=`<rect x="${x-bw/2}" y="${YA(v)}" width="${bw}" height="${yb-YA(v)}" ${i===0&&state!=="f"?`fill="${col}"`:K9.fcArea(col)}/>`;for(let t=10;t<v;t+=10)g+=`<line x1="${x-bw/2}" x2="${x+bw/2}" y1="${YA(t)}" y2="${YA(t)}" stroke="${C.bg}" stroke-width="1"/>`;}
          else if(i===0){g+=K9.stitch(x,cy,5,col,state);}
          else{const d=v-r.b,N=Math.round(Math.abs(d)/r.step),n=Math.min(cap,N),up=d>=0;for(let j=0;j<n;j++){const cc=j%ncol,rr=Math.floor(j/ncol),yy=up?cy-st-2-rr*pitch:cy+st+2+rr*pitch;g+=K9.tri(x+(cc-(ncol-1)/2)*st*2.1,yy,st,up?C.gain:C.loss,up,true);}
            if(N>cap)g+=`<text x="${x}" y="${up?y0+16:y0+rh-12}" text-anchor="middle" class="t-ax" style="font-size:10px">+${N-cap}</text>`;
            if(n===0){if(d===0)g+=`<circle cx="${x}" cy="${cy}" r="1.8" fill="${C.dim}"/>`;else g+=`<path d="${up?`M${x},${cy-7}l3.4,5h-6.8Z`:`M${x},${cy+7}l3.4,-5h-6.8Z`}" fill="none" stroke="${up?C.gain:C.loss}" stroke-width="1.1"/>`;}}}
        if(r.st[i])g+=K9.stGlyph(r.st[i][0],x+cw/2-7,y0+18,3.4);
        const vt=v==null?`puudub (${r.miss||"väärtus puudub"})`:r.fmt(v),ch=v==null||i===0?"":`, muutus 2026-st ${r.dfmt(v-r.b)}`;
        g+=`<rect x="${x-cw/2+1}" y="${y0+9}" width="${cw-2}" height="${rh-8}" fill="transparent" class="k9cell" data-cell="${key}" tabindex="${key===focusK?0:-1}" role="button" aria-pressed="${sel}" aria-label="${e(r.n)} ${y}: ${e(vt)}${e(ch)}; ${STN[r.state(y)]}"/>`;
        if(sel)g+=`<rect x="${x-cw/2+2}" y="${y0+10}" width="${cw-4}" height="${rh-10}" fill="none" stroke="${C.kid}" stroke-width="2.4" pointer-events="none"/><rect x="${x-cw/2+5.5}" y="${y0+13.5}" width="${cw-11}" height="${rh-17}" fill="none" stroke="${C.ink}" stroke-opacity=".65" stroke-dasharray="3 3" pointer-events="none"/>`;
        s+=g;});
      if(!narrow){const v=r.v[si];s+=`<text x="${W-RW+14}" y="${cy-4}" class="t-num" style="font-size:15px">${v==null?"puudub":e(r.fmt(v))}</text><text x="${W-RW+14}" y="${cy+13}" class="t-ax" style="fill:${v==null?C.dim:v-r.b>=0?C.gain:C.loss}">${v==null||si===0?(si===0?"2026 lähtetase":""):(v-r.b>=0?"▲ ":"▼ ")+r.dfmt(v-r.b)}</text>`;
        if(r.st[si])s+=K9.stGlyph(r.st[si][0],W-RW+6,cy-8,3.4);}});
    if(!narrow)s+=`<text x="${W-RW+14}" y="${TOP-30}" class="t-cap" style="fill:${C.kid}">${SELY}</text>`;
    return s+"</svg>";}
  /* detail: valitud märk (rida × aasta) või valitud kirivöö (terve rida) */
  function kDetail(W,R){if(!KSEL.r)return `<p class="k9note">Vali kirivöö rida (vasakul nimi) või näitaja-aasta märk: hiir, puude või klaviatuur (Tab kangale, nooled liiguvad, Enter avab). Detail näitab väärtust, perioodi, andmeolekut, kontrolli, allikat, valemit ja piiranguid.</p>`;
    const r=R.find(x=>x.k===KSEL.r);if(!r)return "";const u=S.unit;
    const skala=r.abs?"tase skaalal 0–100%, vahe 10 p.p.; joon 50% = mudeli hoiatus, 60% = KOFS üldpiir":`1 piste = ${r.int?1:(r.step<1?nf1.format(r.step):f0(r.step))} ${r.unit} muutust võrreldes 2026. aastaga; pistete arv = round(|muutus| / piste); kui muutus on alla ½ piste, joonistatakse väike avatud märk (muutus ei ole null); täpne null = punkt`;
    const dl=rows_=>`<dl class="k9kdl">${rows_.filter(x=>x[1]!=null&&x[1]!=="").map(([a,b])=>`<dt>${e(a)}</dt><dd>${b}</dd>`).join("")}</dl>`;
    if(!KSEL.y){const tbl=table(["Aasta","Väärtus","Muutus 2026-st","Andmeolek","Reegel"],r.Y.map((y,i)=>{const v=r.v[i];return [String(y),v==null?"puudub":e(r.fmt(v)),v==null||i===0?(i===0?"lähtetase":"–"):e(r.dfmt(v-r.b)),STN[r.state(y)],r.st[i]?e(r.st[i][1]):"ei ületa"];}),{textCols:[3,4]});
      return `<div class="k9kdh"><h3 tabindex="-1">${K9.iconHTML(r.kind,16)} Kirivöö: ${e(r.n)} · ${e(NAME[u])}</h3><button type="button" class="k9btn ghost sm" data-kclose>Sulge detail</button></div>
        <div class="k9krow">${cloth(Math.max(W,320),[r],{single:true})}</div>
        ${dl([["Definitsioon",e(r.def)],["Ühik",e(r.unit)],["Ajatelg",`${START}–${YN}: ${START} = lähtetase (${e(r.per(START))}), edasi prognoos`],["Võrdlusbaas ja skaala",e(skala)],["Reegel",e(r.rule)],["Valem",e(r.calc)],["Stsenaarium",r.sens?e(r.scen()):"ei sõltu stsenaariumist"],["Piirangud",e(r.lim)]])}
        <details open><summary>Täpsed väärtused</summary>${tbl}</details>`;}
    const i=r.Y.indexOf(KSEL.y),v=r.v[i],y=KSEL.y;
    return `<div class="k9kdh"><h3 tabindex="-1">${K9.iconHTML(r.kind,16)} ${e(r.n)} · ${y} · ${e(NAME[u])}</h3><span><button type="button" class="k9btn ghost sm" data-row="${r.k}">Ava kogu kirivöö</button> <button type="button" class="k9btn ghost sm" data-kclose>Sulge detail</button></span></div>
      ${dl([["Väärtus",v==null?`<b>puudub</b> — ${e(r.miss||"väärtus puudub")} (ei ole null)`:`<b>${e(r.fmt(v))}</b>`],["Muutus võrdlusbaasist",v==null||i===0?(i===0?"see on lähtetase":"–"):`${e(r.dfmt(v-r.b))} võrreldes 2026 (${e(r.fmt(r.b))})`],["Definitsioon",e(r.def)],["Ühik",e(r.unit)],["Vaatlusperiood",e(r.per(y))],["Piirkond",e(NAME[u])],["Andmeolek",STN[r.state(y)]],["Kontrolli staatus",e(r.chk(y))],["Võrdlusbaas ja skaala",e(skala)],["Reegel",r.st[i]?`${e(r.st[i][1])} — ${e(r.rule)}`:`ei ületa: ${e(r.rule)}`],["Allikas",e(r.src(y))],["Valem",e(r.calc)],["Sisendid ja eeldused",r.sens&&y>START?e(r.scen()):"ajalooline või dokumendi väärtus, stsenaariumist sõltumatu"],["Piirangud",e(r.lim)]])}`;}
  function kangasFig(W){const u=S.unit,R=rows(u),sig=R.map(r=>r.v.map(x=>x==null?"":x.toFixed(4)).join(",")),Y=R[0].Y;
    if(PREV&&PREV.u===u&&PREV.log!==K9.LOG.length)R.forEach((r,i)=>r.chg=PREV.sig[i]!==sig[i]);else if(PREV&&PREV.u===u&&PREV.keep)R.forEach((r,i)=>r.chg=PREV.chg[i]);
    PREV={u,sig,log:K9.LOG.length,keep:R[0].chg!=null,chg:R.map(r=>r.chg)};
    let first=null;Y.forEach((y,i)=>{if(first)return;const k=new Set(R.filter(r=>r.st[i]).map(r=>r.kind));if(k.size>=2)first={y,rows:R.filter(r=>r.st[i])};});
    const q=first?`Valitud stsenaariumis tekib mitme valdkonna tähelepanuvajadus esimest korda <b>${first.y}</b>: ${first.rows.map(r=>e(r.n.toLowerCase())+" ("+e(r.st[Y.indexOf(first.y)][1])+")").join("; ")}. Tähelepanu tähendab, et rida ületab oma nähtava reegli (vt metoodika).`:"Valitud stsenaariumis ei teki ühelgi aastal korraga mitme valdkonna tähelepanuvajadust.";
    K9.kFirst=first;
    const narrowList=W<760?`<ul class="k9kvals">${R.map(r=>{const v=r.v[Y.indexOf(SELY)];return `<li>${K9.iconHTML(r.kind,14)} ${e(r.n)}: <b>${v==null?"puudub":e(r.fmt(v))}</b> ${v!=null&&SELY>START?`<span>${r.dfmt(v-r.b)}</span>`:""}</li>`;}).join("")}</ul>`:"";
    return fig({title:`Mis aastal tekib mitme valdkonna tähelepanuvajadus? · ${NAME[u]}`,read:q,
      ctl:`<div class="k9seg k9segw" role="group" aria-label="Vali aasta">${Y.map(y=>`<button type="button" data-ky="${y}" aria-pressed="${y===SELY}">${y}</button>`).join("")}</div>`,
      legend:[lg.act(C.ink,"2026 mõõdetud (lähtetase)"),lg.der(C.ink,"2026 tuletatud"),lg.up("kasv 2026-st (prognoos, piste)"),lg.dn("vähenemine (prognoos, piste)"),`<span><svg width="20" height="14" aria-hidden="true"><path d="M10,3l3.4,5h-6.8Z" fill="none" stroke="${C.gain}"/></svg>muutus alla ½ piste (mitte null)</span>`,`<span><svg width="20" height="14" aria-hidden="true"><circle cx="10" cy="7" r="1.8" fill="${C.dim}"/></svg>muutus täpselt 0</span>`,lg.fcsq(C.ink,"tase (prognoos)"),lg.na("puudub (ei ole null)"),lg.st(),lg.txt("kollane joon = samal aastal ≥ 2 valdkonda"),`<span><svg width="20" height="14" aria-hidden="true"><rect x="3" y="2" width="14" height="10" fill="none" stroke="${C.kid}" stroke-width="2"/></svg>valik / fookus (ei kodeeri väärtust)</span>`],
      body:`<div class="k9kbody">${cloth(W,R)}</div>${narrowList}<aside class="k9kdet" aria-live="polite" aria-label="Valitud kirivöö või märgi detail">${kDetail(W,R)}</aside>`,src:"kohortmudel v6, eduDemand, taxSeries, valdade eelarvestrateegiad, ÜRP koonduuring 2025",
      method:`<b>Lugemisreegel.</b> Read on joondatud sama aasta järgi. Pistete arv näitab muutust võrreldes 2026. aastaga rea enda ühikus (1 piste = rea vasakul kirjas olev hulk, ümardatult); netovõlakoormuse rida näitab taset, mitte muutust. Eri ühikutega ridu ei võrrelda omavahel koguste kaudu. Märk rea all tähendab, et aasta ületab rea reegli.<br><b>Ornament, andmemärk ja valik.</b> Rea keskjoon, eraldusjooned ja piltmärk on püsiv ornament; romb, piste, tulp ja × kodeerivad andmeid; kahekordne kollane raam on ainult valik või fookus.<br><b>Reeglid:</b> ${R.map(r=>`${e(r.n)}: ${e(r.rule)}`).join("; ")}.<br><b>Arvutusseosed mudelis</b> (ühendusjooni ei joonistata, sest samaaegsus ei tõenda põhjust): ${R.map(r=>`${e(r.n)} = ${e(r.calc)}`).join("; ")}.<br><b>Ridu ei ole:</b> lasteaia- ja koolikohtade arv ning ÜVK võimekus, sest andmed puuduvad mudelis.`,
      table:table(["Rida",...Y.map(String)],R.map(r=>[e(r.n),...r.v.map((x,i)=>x==null?"puudub":e(r.fmt(x))+(r.st[i]?(r.st[i][0]==="crit"?" ■":" ▲"):""))]),{textCols:[0]})});}
  K9.kangasRows=rows;K9.kSel=()=>({...KSEL,SELY});
  /* ======== ÜLEVAADE: peamised järeldused ja arengukangas ======== */
  const ST={m:"mõõdetud",d:"tuletatud",f:"prognoos",b:"eelarve või strateegia"};
  function findings(u){const p26=POP[u].tot["2026"],p36=popT(u,YN),[lo,hi]=patRange(u,YN),o26=shares(u,START).old,o36=shares(u,YN).old,e26=eduDemand(u,START),e36=eduDemand(u,YN);
    const sch=K9.schools().filter(s=>u==="MAAK"||s.v===u),b26=sch.filter(s=>s.n_(START)<s.lim).length,b36=sch.filter(s=>s.n_(YN)<s.lim).length;
    const t=taxSeries(u),np=netPct(u,2026),re=K9.reSeries&&!S.re27?K9.reSeries(u)[2027]:null;
    return [
      {h:`Rahvaarv ${p36>=p26?"kasvab":"kahaneb"} ${pct(p36/p26-1)}`,txt:`${n0(p26)} → ${n0(p36)} elanikku. Rändemustrite ulatus (min–max) ${n0(lo)}–${n0(hi)}.`,ind:"Rahvaarv 1. jaanuaril",per:`1.01.2026 → 1.01.${YN}`,st:"2026 mõõdetud; 2036 prognoos",dep:true,go:"rahvastik/k9-prog"},
      {h:`65+ osakaal ${o36>o26?"suureneb":"väheneb"} ${nf1.format(Math.abs(o36-o26)*100)} p.p.`,txt:`${pp(o26)} → ${pp(o36)} elanikest.`,ind:"65-aastaste ja vanemate osakaal",per:`1.01.2026 → 1.01.${YN}`,st:"2026 mõõdetud; 2036 prognoos",dep:true,go:"rahvastik/k9-polv"},
      {h:`Hinnatud õpilaste arv valla koolides ${pct(e36.sc/e26.sc-1)}`,txt:`${n0(e26.sc)} → ${n0(e36.sc)} õpilast. ÜRP lävendist allpool koole: ${b26} → ${b36} (lävend: põhikool 90, algkool 20, gümnaasiumiosa 100).`,ind:"Hinnatud koolinõudlus valla koolides",per:`2025/26 õppeaasta → ${YN}`,st:"alus mõõdetud (EHIS 10.11.2025); 2036 prognoos",dep:true,go:"teenused/k9-kv"},
      {h:`Hinnatud lasteaianõudlus ${pct(e36.la/e26.la-1)}`,txt:`${n0(e26.la)} → ${n0(e36.la)} last. Lasteaiakohtade arv ei ole mudelis, seega täituvust ei hinnata.`,ind:"Hinnatud lasteaianõudlus",per:`2026 alus (EHIS 10.11.2025) → ${YN}`,st:"alus mõõdetud; 2036 prognoos",dep:true,go:"teenused/k9-tasa"},
      {h:`Tulumaks ${mln(t[2026])} → ${mln(t[YN])}`,txt:`Jooksevhindades, valitud palga- ja hõiveeeldusel.${re!=null?` Riigieelarve 2027 eelnõu stsenaariumis oleks 2027. aasta laekumine ${mln(re)} (senises arvutuses ${mln(t[2027])}); stsenaarium on valikuline.`:S.re27?" Riigieelarve 2027 eelnõu stsenaarium on sees.":""}`,ind:"Füüsilise isiku tulumaks valla eelarvesse",per:`2026 → ${YN}`,st:"2026 tuletatud (MTA jaan–sept + hinnang); edasi prognoos",dep:true,go:"eelarve/k9-tm"},
      {h:isFinite(np)?`Netovõlakoormus ${nf0.format(np*100)}% põhitegevuse tuludest`:"Netovõlakoormus: andmed puuduvad",txt:isFinite(np)?`Seaduse üldine ülemmäär on 60% (KOFS). ${np>0.6?"Tase on üle üldpiiri.":np>=0.5?"Tase on mudeli 50% hoiatuspiiri kohal.":"Tase on alla 50%."}`:"Kõigi valdade 2026. aasta strateegiaväärtused ei ole olemas.",ind:"Netovõlakoormus",per:"2026",st:"eelarve või eelarvestrateegia (mitte täitmine)",dep:false,go:"eelarve/k9-volg"}];}
  function findHTML(u){return `<div class="k9finds">${findings(u).map(f=>`<article class="k9find"><h3>${e(f.h)}</h3><p>${e(f.txt)}</p><p class="k9fmeta"><span><b>Näitaja:</b> ${e(f.ind)}</span> <span><b>Periood:</b> ${e(f.per)}</span> <span><b>Andmeolek:</b> ${e(f.st)}</span> <span><b>Stsenaarium:</b> ${f.dep?`sõltub (${e(MIGL[S.mig])})`:"ei sõltu"}</span></p><a class="k9btn ghost sm" href="#${f.go}">Ava analüüs →</a></article>`).join("")}</div>`;}
  const TABS=[["puu","Arengupuu"],["kangas","Arengukangas"],["voo","Valdkondade koondnäitajad"],["kysimused","Tähelepanu vajavad küsimused"]];
  K9.VIEWS.ylevaade={
    build(el){el.innerHTML=`<div class="k9ovh"><div><p class="kick">Ülevaade · mis on Raplamaal praegu oluline?</p><h1>Raplamaa arengukangas</h1>
        <p class="lead">Raplamaa arengukangas koondab Rapla, Kohila, Märjamaa ja Kehtna valla rahvastiku, teenuste, eluaseme ja eelarve andmed ning kohortmudeli prognoosi aastani ${YN}. Ajalugu on mõõdetud (rahvaarv kuni 1.01.2026, eelarve täitmine kuni 2025); 2026. aasta tulumaks on tuletatud; 2027–${YN} on prognoos valitud stsenaariumis. Valitud piirkond, stsenaarium ja andmete seis on lehe päises.</p></div>
        <section class="k9howto" aria-labelledby="k9howto-h"><h2 id="k9howto-h">Kuidas seda lehte kasutada?</h2><ol>
          <li>Vali päisest piirkond: maakond või üks vald.</li><li>Arengupuu näitab tervikut: juured (rahvastiku vood), tüvi (rahvaarv) ja harud (valdkonnad). Vali juur, rõngas, haru või leht — paremale avaneb väärtus, andmeolek ja allikas.</li>
          <li>Arengukangas (kõrval sakk) näitab seitset kirivöö-rida ühel ajateljel; vali rea nimi või näitaja-aasta märk (hiir, puude või Tab + nooled + Enter).</li>
          <li>Puu all on peamised järeldused; iga kaardi juures on näitaja, periood, andmeolek ja link analüüsile.</li>
          <li>Eeldusi muudad peatükis Stsenaariumid; „Taasta baaseeldused” viib kõik tagasi.</li></ol></section></div>
      <div data-part="paths"></div>
      <div class="k9ws">
      <div class="k9wshead"><div><p class="kick">Tööpind</p><h2 class="k9wsh" data-k9="wsh">Arengupuu</h2></div>
        <div class="k9wstabs" role="tablist" aria-label="Ülevaate vaated">${TABS.map(([k,t],i)=>`<button type="button" role="tab" id="tab-${k}" aria-controls="tp-${k}" data-tab="${k}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${t}</button>`).join("")}</div></div>
      <div class="k9wsp" role="tabpanel" id="tp-kangas" aria-labelledby="tab-kangas" hidden><section class="k9sec" id="k9-kangas" aria-label="Arengukangas"><div data-k9="kangas"></div></section></div>
      <div class="k9wsp" role="tabpanel" id="tp-puu" aria-labelledby="tab-puu"><section class="k9treews" id="k9-puu" aria-label="Arengupuu: tervik → valdkond → vald → objekt → alusandmed"><div data-k9="tree">${K9.tree.html()}</div></section></div>
      <div class="k9wsp" role="tabpanel" id="tp-voo" aria-labelledby="tab-voo" hidden>${sec("k9-voo","Valdkondade koondnäitajad","11 näitajat viies valdkonnas. Iga näitaja juures on hinnatase ja reegel; piirid on osaliselt selle mudeli kokkulepped, mitte ametlikud lävendid.",`<div class="k9belt2" data-k9="belt"></div>`)}</div>
      <div class="k9wsp" role="tabpanel" id="tp-kysimused" aria-labelledby="tab-kysimused" hidden>${sec("k9-kysimused","Tähelepanu vajavad küsimused","Tekstina: mida tulemus tähendab ja mida küsida. Iga hinnangu alus on nähtav.",`<p class="lead" data-k9="lead"></p><p data-k9="kq"></p><div class="k9moved k9brief" data-k9="brief"></div><p class="k9note">Riskide jälgimisnimekiri ja tegevussoovitused: <a href="#eesmargid/k9-riskid">Eesmärgid ja seire</a>. Eesti võrdluse erandid: <a href="#vordlus/k9-leiud">Eelarve võrdlus Eestis</a>.</p>`)}</div></div>
      ${sec("k9-jareldused","Peamised järeldused","Iga järeldus on arvutatud aktiivsest stsenaariumist või näitab, et ei sõltu sellest.",`<div data-k9="find"></div>`)}`;
      const self=this,tabs=[...el.querySelectorAll("[data-tab]")];
      K9.wsTab=(k,focus)=>{if(!el.querySelector("#tp-"+k))return;tabs.forEach(b=>{const on=b.dataset.tab===k;b.setAttribute("aria-selected",on);b.tabIndex=on?0:-1;if(on&&focus)b.focus();});el.querySelectorAll(".k9wsp").forEach(p=>p.hidden=p.id!=="tp-"+k);
        const t=TABS.find(x=>x[0]===k);el.querySelector('[data-k9="wsh"]').textContent=t?t[1]:"";self.update(el);};
      el.querySelector(".k9wstabs").addEventListener("click",ev=>{const b=ev.target.closest("[data-tab]");if(b)K9.wsTab(b.dataset.tab);});
      el.querySelector(".k9wstabs").addEventListener("keydown",ev=>{const i=tabs.findIndex(b=>b.getAttribute("aria-selected")==="true");let n=null;if(ev.key==="ArrowRight")n=(i+1)%tabs.length;if(ev.key==="ArrowLeft")n=(i-1+tabs.length)%tabs.length;if(ev.key==="Home")n=0;if(ev.key==="End")n=tabs.length-1;if(n!=null){ev.preventDefault();K9.wsTab(tabs[n].dataset.tab,true);}});
      const br=el.querySelector('[data-k9="brief"]');moveInto(br,[["#briefLead"],["#briefCards"]]);const notes=document.querySelector("#brief .pmeta:last-of-type");if(notes)br.appendChild(notes);
      const kfocus=key=>requestAnimationFrame(()=>{const n=el.querySelector(`[data-cell="${key}"]`);n&&n.focus();}),kh=()=>el.querySelector('[data-k9="kangas"]');
      el.addEventListener("click",ev=>{const cell=ev.target.closest(".k9cell");if(cell){const [r,y]=cell.dataset.cell.split("|");KSEL={r,y:+y};SELY=+y;self.kangas(el);kfocus(cell.dataset.cell);return;}
        const rl=ev.target.closest("[data-row]");if(rl&&kh().contains(rl)){KSEL={r:rl.dataset.row,y:null};self.kangas(el);requestAnimationFrame(()=>el.querySelector(".k9kdet h3")?.focus());return;}
        if(ev.target.closest("[data-kclose]")){const k=KSEL.r&&KSEL.y?KSEL.r+"|"+KSEL.y:null;KSEL={r:null,y:null};self.kangas(el);if(k)kfocus(k);return;}
        const b=ev.target.closest("[data-ky]");const c=ev.target.closest(".k9ycol");if(b||c){SELY=b?+b.dataset.ky:+c.dataset.y;if(KSEL.y)KSEL.y=SELY;this.kangas(el);if(b)requestAnimationFrame(()=>{const n=el.querySelector(`[data-ky="${SELY}"]`);n&&n.focus();});}});
      el.addEventListener("keydown",ev=>{const cell=ev.target.closest&&ev.target.closest(".k9cell");
        if(cell){const R=K9.kangasRows(S.unit).map(r=>r.k),[r,y]=cell.dataset.cell.split("|");let ri=R.indexOf(r),yy=+y;
          if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();cell.dispatchEvent(new MouseEvent("click",{bubbles:true}));return;}
          const mv={ArrowRight:[0,1],ArrowLeft:[0,-1],ArrowDown:[1,0],ArrowUp:[-1,0]}[ev.key];if(mv){ev.preventDefault();ri=Math.max(0,Math.min(R.length-1,ri+mv[0]));yy=Math.max(START,Math.min(YN,yy+mv[1]));
            const k=R[ri]+"|"+yy,n=el.querySelector(`[data-cell="${k}"]`);if(n){el.querySelectorAll(".k9cell").forEach(c=>c.setAttribute("tabindex","-1"));n.setAttribute("tabindex","0");n.focus();}}
          if(ev.key==="Escape"&&KSEL.r){ev.preventDefault();el.querySelector("[data-kclose]")?.click();}return;}
        const rl=ev.target.closest&&ev.target.closest(".k9rowlab");if(rl&&(ev.key==="Enter"||ev.key===" ")){ev.preventDefault();rl.dispatchEvent(new MouseEvent("click",{bubbles:true}));return;}
        if(ev.target.closest&&ev.target.closest("[data-ky]")&&(ev.key==="ArrowLeft"||ev.key==="ArrowRight")){ev.preventDefault();SELY=Math.max(START,Math.min(YN,SELY+(ev.key==="ArrowRight"?1:-1)));this.kangas(el);requestAnimationFrame(()=>{const n=el.querySelector(`[data-ky="${SELY}"]`);n&&n.focus();});}});
      K9.tree.bind(el.querySelector('[data-k9="tree"]'));},
    kangas(el){const h=el.querySelector('[data-k9="kangas"]');h.innerHTML=kangasFig(K9.wOf(h));},
    update(el){const u=S.unit;el.querySelector('[data-k9="lead"]').innerHTML=lead();el.querySelector('[data-k9="find"]').innerHTML=findHTML(u);
      const tr=el.querySelector('[data-k9="tree"]');if(!el.querySelector("#tp-puu").hidden){K9.tree.fit&&K9.tree.fit(tr);K9.tree.update(tr);}this.kangas(el);
      const f=K9.kFirst;el.querySelector('[data-k9="kq"]').innerHTML=f?`Arengukangas: mitme valdkonna tähelepanuvajadus tekib esimest korda <b>${f.y}</b> (${f.rows.map(r=>e(r.n.toLowerCase())).join(", ")}). Iga rea reegel on kangas „Metoodika ja allikas” all.`:"Arengukangas: ühelgi aastal ei teki korraga mitme valdkonna tähelepanuvajadust.";
      el.querySelector('[data-k9="belt"]').innerHTML=belt(u);}};
  /* ======== STSENAARIUMID ======== */
  const DEPS=[["Sõltub stsenaariumist","rahvaarv ja vanuskoostis 2027–"+YN+"; sünnid, surmad ja rändesaldo prognoos; hinnatud lasteaia- ja koolinõudlus; koolid ÜRP lävendist allpool; teenusemahu maksumus; tulumaksu prognoos (lisaks palgakasv, hõive ja RE 2027 lüliti); eluaseme lisavajadus rahvaarvu muutusest; eesmärkide täitmise hinnang; arengupuu ja -kanga prognoosiaastad; kaardivaate prognoosiaastate vallakihid"],
    ["Ei sõltu stsenaariumist","rahvaarv ja vood 2015–1.01.2026; eelarve täitmine 2016–2025; 2026. aasta tulumaksu hinnang; netovõlakoormus (valdade strateegiad); REL 2021 eluruumid, vesi, kanalisatsioon ja töökoha asukoht; uusehitus 2017–2026; Eesti võrdlus (RR300); asustusüksuste rahvaarv (REL 2021)"]];
  const CALP={r1:"2016–2021",mean:"2016–2026 aastate keskmine",r2:"2021–2026",r2x:"2021–2026 ilma 2022–23 erakordse välisrändeta",r3:"2024–2026"};
  function baasHTML(){const lk=(S.smode||"all")==="mig";
    return `<div class="k9grid2"><div><h3 class="k9h3">Arvutusrežiim</h3>${modeSeg()}<p class="k9note">${lk?"Aktiivne: <b>ainult rändemuster</b>. Kõik vaated (puu, kangas, portreed, vahemikud, kokkuvõtted) arvutatakse ilma hoobadeta.":"Aktiivne: <b>rändemuster koos aktiivsete eeldustega</b>. Kõik vaated, sh viie rändemustri võrdlus, kasutavad samu hoobasid."} Režiimi vahetus ei kustuta muudetud hoobasid.</p>
        <h3 class="k9h3">Aastate tähendus</h3><dl class="k9kdl"><dt>Prognoosi lähteaasta</dt><dd>${START} (rahvaarv 1.01.${START}, Statistikaamet RV0282U)</dd><dt>Rändemustri kalibreerimisperiood</dt><dd>${e(MIGL[S.mig])}: ${e(CALP[S.mig]||"")}. Määrab rändeeelduse, mitte prognoosi algusaastat.</dd><dt>Vaates valitud aasta</dt><dd>arengukangas ${SELY}; arengupuu ja kaardivaade oma liuguriga</dd><dt>Muutuse võrdlusaasta</dt><dd>${PCMP} (Rändemustrid); kangas ja koondnäitajad võrdlevad aastaga ${START}</dd></dl></div>
      <div><h3 class="k9h3">Baaseeldused</h3>${table(["Eeldus","Baasväärtus","Praegu"],[["Rändemuster","ajalooline keskmine",e(MIGL[S.mig])],["Lisaränne maakonda","0 in/a",sg(S.extra)+" in/a"],["Sündimus","2023–25 tase, püsib",(S.fert?sg(S.fert)+"%, ":"")+(S.fertTr==="const"?"püsib":S.fertTr==="down"?"langus jätkub":"Statistikaameti TFR")],["Suremus","2021–25 tase",S.mort==="const"?"püsib":"eluiga kasvab"],["Palgakasv","4,5%/a (2027 5,5%, 2028 5,0%)",nf1.format(S.wage)+"%"+(S.re27?" · RE 2027: 4,7/4,4/4,3/4,2%":"")],["Tööhõive 15–74 (Raplamaa)","64,1% (2023–25, TT4661)",nf1.format(S.emp)+"%"],["RE 2027 eelnõu stsenaarium","väljas",S.re27?"sees":"väljas"]],{textCols:[1,2]})}
        <button type="button" class="k9btn ghost" data-reset>Taasta baaseeldused</button></div></div>
      ${table(["","Näitajad"],DEPS,{textCols:[1]})}
      <p class="k9note">Lubadus „kõik vaated arvutatakse ümber” kehtib ainult ülal loetletud stsenaariumist sõltuvatele näitajatele; ajaloolised andmed ja dokumendiväärtused jäävad samaks.</p>`;}
  function vrdHTML(){const u=S.unit;
    return fig({title:`Viis rändemustrit aastal ${YN} · režiim: ${K9.modeLabel()}`,read:"Sama arvutusfunktsioon mis portreedel, lühivaates ja kangas. Valitud muster on esile tõstetud.",
      body:table(["Rändemuster","Kalibreerimisperiood",...K9.UNITS.map(w=>w==="MAAK"?"Maakond":SHORTN[w])],MIGS_ALL.map(m=>({sel:S.mig===m,c:[e(MIGL[m]),e(CALP[m]||""),...K9.UNITS.map(w=>n0(K9.pat(m,w,YN)))]})),{textCols:[0,1]})
        +table(["Aktiivne stsenaarium · "+NAME[u],String(START),String(YN),"Muutus"],[["Rahvaarv",n0(popT(u,START)),n0(popT(u,YN)),pct(popT(u,YN)/popT(u,START)-1)],["65+ osakaal",pp(shares(u,START).old),pp(shares(u,YN).old),(shares(u,YN).old>=shares(u,START).old?"+":"−")+nf1.format(Math.abs(shares(u,YN).old-shares(u,START).old)*100)+" p.p."],["Hinnatud lasteaianõudlus",n0(eduDemand(u,START).la),n0(eduDemand(u,YN).la),pct(eduDemand(u,YN).la/eduDemand(u,START).la-1)],["Hinnatud õpilased valla koolides",n0(eduDemand(u,START).sc),n0(eduDemand(u,YN).sc),pct(eduDemand(u,YN).sc/eduDemand(u,START).sc-1)],["Tulumaks (jooksevhindades)",mln(taxSeries(u)[START]),mln(taxSeries(u)[YN]),pct(taxSeries(u)[YN]/taxSeries(u)[START]-1)]],{textCols:[]}),
      src:"kohortmudel v6 (popAt, eduDemand, taxSeries)"})+`<div class="k9acts"><span class="k9copy"></span></div>`;}
  function maarHTML(){return fig({title:`Kaks eri vahemikku aastal ${YN}`,read:K9.PROV.UNC.mc+" "+K9.PROV.UNC.rng,
      body:table(["Ühik","Valitud stsenaarium","juhusliku kõikumise vahemik (80%)","Rändemustrite ulatus (min–max)"],K9.UNITS.map(w=>{const [lo,hi]=patRange(w,YN);return {sel:w===S.unit,c:[w==="MAAK"?"Maakond":NAME[w],K9.rp(popT(w,YN)),K9.rp(MC[w][YN][0])+" – "+K9.rp(MC[w][YN][1]).replace("≈ ",""),K9.rp(lo)+" – "+K9.rp(hi).replace("≈ ","")]};}),{textCols:[0]})
        +`<ul class="k9lim"><li>Rände eeldus on suurim määramatus; ükski muster ei ole ennustus, vaid „kui ränne jätkub nagu …”.</li><li>Juhusliku kõikumise vahemik (${typeof MC_N!=="undefined"?MC_N:"mitu"} simulatsiooni) ei sisalda rändemustri valikut.</li><li>Valdadevaheline ränne on mudelis bilansiline: sisse- ja väljarännet eraldi ei prognoosita.</li><li>Tulumaksu prognoos ei arvesta seadusemuudatusi, kui RE 2027 lüliti ei ole sees, ning on jooksevhindades.</li><li>Teenuste kohtade arv, ÜVK võimekus ja teeninduspiirkonnad ei ole mudelis.</li></ul>`,src:"kohortmudel v6 (MC, popAt)"});}
  K9.VIEWS.stsenaariumid={
    build(el){el.innerHTML=`<div class="k9intro"><div><p class="kick">Stsenaariumid</p><h1>Kuidas erinevad võimalikud tulevikud?</h1></div><p class="lead">Üks arvutusfunktsioon ja üks stsenaariumi olek kõigi vaadete jaoks. Siin valid rändemustri, arvutusrežiimi ja hoovad ning näed, mis sellest sõltub.</p></div>
      ${sec("k9-baas","Baaseeldused","Arvutusrežiim, aastate tähendus ja see, millised näitajad stsenaariumist sõltuvad.",`<div data-k9="baas"></div>`)}
      ${sec("k9-port","Rändemustrid","Viis mustrit samas ehituses ja skaalal. Klõpsa portreel, et muster valida. Võrdlusaasta on muudetav.",`<div data-k9="port"></div>`)}
      ${sec("k9-teljed","Muudetavad hoovad","Muuda eeldust: kõik stsenaariumist sõltuvad näitajad arvutatakse ümber. Logi näitab, mis muutus.",`<div class="k9grid2 k9ctlgrid"><div data-k9="ctl"></div><div class="k9logw"><h3 class="k9h3">Muutuste logi</h3><div data-k9="log"></div></div></div>`)}
      ${sec("k9-vrd","Stsenaariumide võrdlus","Sama arvutus, eri rändemustrid; aktiivse stsenaariumi põhinäitajad.",`<div data-k9="vrd"></div>`)}
      ${sec("k9-maar","Määramatus ja piirangud","Juhusliku kõikumise vahemik, stsenaariumide ulatus, tagasitesti viga ja tundlikkus on eri asjad.",`<div data-k9="maar"></div><div data-part="sens"></div><div data-part="btf"></div>`)}`;
      el.querySelector('[data-k9="ctl"]').innerHTML=controls();bind(el);this.copy=null;},
    update(el){const u=S.unit;el.querySelector('[data-k9="baas"]').innerHTML=baasHTML();
      const ctl=el.querySelector('[data-k9="ctl"]'),act=document.activeElement&&ctl.contains(document.activeElement)?document.activeElement.id:null;ctl.innerHTML=controls();if(act){const n=document.getElementById(act);n&&n.focus();}
      el.querySelector('[data-k9="log"]').innerHTML=logHTML();
      const keep=el.querySelector(".k9copy")?[...el.querySelector(".k9copy").childNodes]:[];
      el.querySelector('[data-k9="vrd"]').innerHTML=vrdHTML();const cp=el.querySelector(".k9copy");if(keep.length)keep.forEach(n=>cp.appendChild(n));else moveInto(cp,[["#copyBtn"],["#copyMsg"],["#copyArea"]]);
      el.querySelector('[data-k9="port"]').innerHTML=fig({title:`Viis tulevikku · ${NAME[u]} esile tõstetud · võrdlusaasta ${PCMP}`,ctl:cmpCtl(),legend:[lg.up(`suurem kui ${PCMP}`),lg.dn(`väiksem kui ${PCMP}`),lg.txt("pindala ∝ |muutus| kuni ±15%; ring = üle ±15%"),lg.txt("kriips = võrdlusaasta / muutus 0"),lg.txt("avatud märk = prognoos")],body:portraits(),
        method:`Väärtus = rahvaarv aktiivses režiimis (${e(K9.modeLabel())}). Muutus = (N(aasta) / N(${PCMP}) − 1) × 100%; ${PCMP<=START?`võrdlusväärtus on ${PCMP<START?"mõõdetud ajalugu":"lähteaasta"}`:"võrdlusväärtus on sama mustri prognoos"}. Märgi pindala on võrdeline muutuse absoluutväärtusega kuni ±15%; suund on märgi kuju (▲/▼) ja värv. Alla ±0,5% muutus joonistatakse vähima märgina, et see ei näiks nullina. Rändemuster on kalibreeritud valla tegeliku arengu järgi vastaval perioodil. Ükski muster ei ole ennustus.`,table:portraitTable(),src:"kohortmudel v6, popAt"});
      el.querySelector('[data-k9="maar"]').innerHTML=maarHTML();}};
})();
