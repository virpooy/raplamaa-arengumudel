/* ---------- RE 2027 eelnõu / RM suveprognoos: eraldi valitav stsenaarium (vaikimisi väljas) ---------- */
(function(){
  const {e,n0,mln,fig,sec,table}=K9;
  if(S.re27==null)S.re27=false;
  /* Allikad: TuMS § 5 lg 1 (RT I, 14.08.2024, 1; 01.01.2027 redaktsioon) — KOV määr 10,23% nii palgalt kui pensionilt (2026: 10,64% / 8,5%).
     RM 2026 suvine majandusprognoos (27.08.2026) lk 48–49: keskmise palga kasv 2027 4,7; 2028 4,4; 2029 4,3; 2030 4,2.
     RE 2027 eelnõu seletuskiri lk 24–25, 73–74: KOV tulumaks 2026 RE 2068,001 → 2027 2174,544 mln €; pensioni osa 2027 16%; palgafond +4,7%; pensioniindeks 1,051. */
  const R={rW:10.23/10.64,rP:10.23/8.5,w:{2027:4.7,2028:4.4,2029:4.3,2030:4.2},
    gp:(()=>{const T26=2068.001,T27=2174.544,ps=0.16,gW=1.047,w26=(1-ps)*T27/(10.23/10.64)/gW;return ps*T27/(10.23/8.5)/(T26-w26);})()};
  K9.RE27=R;
  const orig=window.taxSeries;
  function reSeries(u,o){o=o||{};const out=orig(u);if(u==="MAAK"){for(let y=2027;y<=YN;y++)out[y]=V.reduce((s,v)=>s+reSeries(v,o)[y],0);return out;}
    const e26=TAX[u].est26,ps=PSHARE[u],w26=sumG(ageVec(u,2026),4,12),o26=sumG(ageVec(u,2026),13,17);let idx=1,pidx=1;
    for(let y=2027;y<=YN;y++){const wg=y===2027&&o.w27!=null?o.w27:(R.w[y]!=null?R.w[y]:S.wage),g=1+wg/100;idx*=g;pidx*=(y===2027?(o.gp!=null?o.gp:R.gp)*R.rP:g);
      const em=1+(S.emp/EMPB-1)*Math.min(1,(y-2026)/4);
      out[y]=e26*((1-ps)*idx*em*R.rW*sumG(ageVec(u,y),4,12)/w26+ps*pidx*sumG(ageVec(u,y),13,17)/o26);}
    return out;}
  K9.reSeries=reSeries;K9.taxOrig=orig;
  window.taxSeries=function(u){return S.re27?reSeries(u):orig(u);};

  /* ---- 2026 jaotus valdadele (Regionaal- ja Põllumajandusministeerium, Tasandus- ja toetusfond 2026 Excel, KOOND) ---- */
  const F26={Rapla:{tf:1313909,tt:9038750,edu:6377243,road:385476,hrf:815904},Kohila:{tf:637188,tt:4390748,edu:3122655,road:399551,hrf:372787},
    Marjamaa:{tf:909112,tt:4824246,edu:2981909,road:467044,hrf:544267},Kehtna:{tf:1198645,tt:4755749,edu:2598601,road:250369,hrf:269000}};
  const pc=x=>(x>=0?"+":"−")+nf1.format(Math.abs(x*100))+"%",eu=x=>(x<0?"−":"")+n0(Math.abs(Math.round(x)))+" €";
  const T=(k,t)=>`<span class="k9st ${k}">${t}</span>`;
  const FACT=T("f","kontrollitud"),CALC=T("c","arvutatud"),ASM=T("a","oletus · vajab kinnitust"),DRAFT=T("d","eelnõu");
  function vrow(v){const e26=TAX[v].est26,m27=orig(v)[2027],b=reSeries(v)[2027],lo=reSeries(v,{w27:3.7,gp:1.051})[2027],hi=reSeries(v,{w27:5.7})[2027];
    const st=BUD[v].y.indexOf(2027),s27=st>=0?BUD[v].tax[st]:null;return {e26,m27,b,lo,hi,s27};}
  function taxTable(){return table(["Vald","2026 hinnang (MTA)","Mudel 2027 (senine)","Valla strateegia 2027","RE 2027 nõrk","RE 2027 baas","RE 2027 tugev","Baas − senine mudel"],
    V.map(v=>{const r=vrow(v);return [NAME[v],mln(r.e26),mln(r.m27)+" ("+pc(r.m27/r.e26-1)+")",r.s27?mln(r.s27):"—",mln(r.lo)+" ("+pc(r.lo/r.e26-1)+")",`<b>${mln(r.b)}</b> (${pc(r.b/r.e26-1)})`,mln(r.hi)+" ("+pc(r.hi/r.e26-1)+")",eu(r.b-r.m27)];}),{textCols:[0]});}
  function kovTable(){return table(["Vald","Tasandus- ja toetusfond 2026","Ostujõu kadu, kui summa püsib (3,1%)","Õpetajate palga surve, kui toetus ei kasva (3,9%)","Teetoetus 2026 · ostujõu kadu (2,7%)","Tulubaasi eelnõu: tulumaksu osa (+0,35 pp)","Eelnõu kaitse: suurim lubatud vähenemine (0,1%)"],
    V.map(v=>{const f=F26[v],b=reSeries(v)[2027];return [NAME[v],eu(f.tt),eu(-(f.tt-f.tt/1.031)),eu(-f.edu*0.039)+" kuni 0",eu(f.road)+" · "+eu(-(f.road-f.road/1.027)),"+"+eu(b*0.35/10.23),eu(-0.001*(b+f.tf))];}),{textCols:[0]});}
  const CHG=[
    ["KOV tulumaksu määr palgatulult","10,64%","10,23% (tegur 0,9615)","01.01.2027","kõik vallad · tulumaks","2027 tulumaks −3,9% palgaosas","TuMS § 5 lg 1 (RT I, 14.08.2024, 1)",FACT+" · senine mudel ei arvesta"],
    ["KOV tulumaksu määr pensionilt","8,5%","10,23% (tegur 1,2035)","01.01.2027","kõik vallad · tulumaks","pensioniosa +20,4% enne indeksit","sama",FACT+" · mudelis kaudselt (PJUMP27 = 1,28 valla strateegiatest)"],
    ["Palgakasv 2027–2030","5,5 / 5,0 / 4,5 / 4,5%","4,7 / 4,4 / 4,3 / 4,2% (RM); 2031+ senine 4,5%","stsenaarium","kõik vallad · tulumaks","−0,8 pp 2027","RM suveprognoos 27.08.2026 lk 48",FACT+" (prognoos)"],
    ["Pensionide tulumaksubaas 2027","palgakasv × määra hüpe (PJUMP27)","indeks 1,051 + maksuvaba pensioni külmutuse võimendus → baas +14,1% pensionäri kohta; nõrgas 5,1%","2027","kõik vallad · tulumaks","pensioniosa suurim määramatus","RE seletuskiri lk 24–25, 73–74 (tuletatud)",CALC+" "+ASM],
    ["Tööhõive","64,1% (Raplamaa 2023–25, TT4661)","muutmata; RM hõive +0,3% 2027, siis 0","—","tulumaks","0","RM suveprognoos lk 49",FACT],
    ["Tasandusfond 2027","mudelis puudub eraldi","koguvaru +3%; valla jaotus avaldamata","eelnõu","kõik vallad · eelarve","ei arvutata (sisendid puuduvad)","RE eelnõu § 3 lg 1",DRAFT],
    ["Toetusfond 2027","mudelis puudub eraldi","nominaalselt 2026 tasemel (−1% toimetulekutoetuse tõttu)","eelnõu","haridus, teed","reaalne vähenemine 2,7–3,1%","RE eelnõu § 3 lg 2",DRAFT],
    ["Tulubaasi reform +0,34/0,35 pp","—","ainult eraldi stsenaariumina; eelarve-neutraalne, kaitse −0,1%","kavandatud 2027","kõik vallad","ei lisata baasi","PGS jt muutmise eelnõu (EIS 15.07.2026)",DRAFT+" · Riigikokku esitamata"],
    ["Ühekordsed toetused (KOV hoonete energiatõhusus 20,5 mln €)","—","ei kanta edasi 2028–2036","2027","investeeringud","0 prognoosis","RE seletuskiri lk 509–511",FACT]];
  function chgTable(){return table(["Näitaja","Senine alus","Uus alus","Jõustumine","Vald / moodul","Mõju arvutusele","Allikas","Staatus"],CHG,{textCols:[0,1,2,3,4,5,6,7]});}
  function body(){const on=S.re27;return `<div class="k9re27">
    <p class="k9note"><b>Seis 12.10.2026.</b> 2027. aasta riigieelarve on eelnõu (1037 SE, I lugemine 20.10.2026). Kehtiv seadus: KOV tulumaksu määr 2027 on 10,23% nii palgalt kui pensionilt. Tasandus- ja toetusfondi 2027 valdade jaotust ei ole avaldatud, seega neid summasid siin ei arvutata. Riiklikke summasid elanike arvu järgi ei jaotata.</p>
    <div class="k9acts"><button type="button" class="k9btn${on?"":" ghost"}" data-re27 aria-pressed="${on}">${on?"RE 2027 stsenaarium on sees · lülita välja":"Lülita sisse RE 2027 / RM suveprognoosi stsenaarium"}</button><span class="k9note">Mõjutab ainult tulumaksu prognoosi (2027+). Ajalugu ja vaikestsenaarium jäävad samaks.</span></div>
    ${fig({title:"Tulumaks 2027: senine mudel ja RE 2027 stsenaarium",read:"Baas: RM palgakasv 4,7%, määr 10,23%, pensionibaas tuletatud riigieelarvest. Nõrk: palk 3,7%, pension +5,1%. Tugev: palk 5,7%. Vahemik ei ole usaldusvahemik.",body:taxTable(),src:"MTA 2026 jaan–sept, mudel v6, RE 2027 eelnõu seletuskiri, RM suveprognoos 27.08.2026",method:"Palgaosa = 2026 hinnang × (1 − pensioniosa) × (1 + palgakasv) × 20–64-aastaste muutus × 10,23/10,64. Pensioniosa = 2026 hinnang × pensioniosa × pensionibaasi kasv × 65+ muutus × 10,23/8,5. Märjamaa ja Kehtna pensioniosa on hinnang 65+ elanike arvu järgi."})}
    ${fig({title:"Riigieelarve ülekanded: mida saab ja mida ei saa veel arvutada",read:"Kõik summad on 2026. aasta kinnitatud jaotus ja sellest arvutatud ostujõu või palgasurve stsenaarium, mitte 2027. aasta eraldis.",body:kovTable(),src:"Regionaal- ja Põllumajandusministeerium, tasandus- ja toetusfond 2026; RE 2027 eelnõu § 3; RM deflaatorid",method:"Ostujõu kadu = summa − summa / (1 + deflaator); valitsussektori tarbimise deflaator 3,1%, investeeringute deflaator 2,7% (RM suveprognoos lk 48). Palgasurve = üldhariduse toetus × 3,9% (õpetajate arvestusliku keskmise palga kasv) ülempiirina; kui HTM-i 20,7 mln € jõuab toetusfondi, surve väheneb."})}
    ${fig({title:"Mudeli muudatuste tabel",read:"Eelnõul põhinevad muudatused on ainult valitavas stsenaariumis. Ajaloolised andmed ei muutu.",body:chgTable(),src:"RE 2027 eelnõu, TuMS, RM suveprognoos"})}
  </div>`;}
  const E=K9.VIEWS.eelarve,b0=E.build,u0=E.update;
  E.build=function(el){b0.call(this,el);const nav=el.querySelector(".k9sub");if(nav)nav.insertAdjacentHTML("beforeend",`<a href="#eelarve/k9-re27">Riigieelarve 2027</a>`);
    el.insertAdjacentHTML("beforeend",sec("k9-re27","Riigieelarve 2027 mõju","Mis muutub valdade tuludes 2027. aastal ja mis on veel eelnõu.",`<div data-k9="re27"></div>`));
    el.addEventListener("click",ev=>{if(ev.target.closest("[data-re27]"))K9.setS({re27:!S.re27},S.re27?"RE 2027 stsenaarium välja":"RE 2027 stsenaarium sisse");});};
  E.update=function(el){u0.call(this,el);const q=el.querySelector('[data-k9="re27"]');if(q)q.innerHTML=body();};
})();
