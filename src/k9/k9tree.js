/* ---------- ARENGUPUU v3: tööpind, fookusharu, aastapõhised väärtused, koosseis vs seotud ----------
   Kodeering (määratud enne joonistamist):
   - Juured = rahvastiku muutuse komponendid 2016–2025 (10 aasta summa). Jämedus ∝ inimeste arv, ühine mõõtkava.
   - Tüvi = rahvaarv ajas (laius ∝ rahvaarv, oma mõõtkava). Rõngas = aasta; prognoos hele + katkendlik serv; viirutus = juhusliku kõikumise vahemik (80%).
   - Harud = valdkondlik kuuluvus; paksus ja kumerus EI kanna väärtust. Mudeli arvutusseosed = katkendlikud nooled (lüliti).
   - Valla sõlm: pindala ∝ valdkonna põhinäitaja VALITUD AASTAL (sama mõõtkava valdade vahel). Kui valitud aasta väärtus puudub: katkendlik ring + ×.
   - Lehed on rühmades: „Koondnäitaja koosseis” (pidev ühendus, summa kontrollitakse) ja „Seotud” (katkendlik ühendus, ei kuulu summasse).
     Sama ühikuga lehtede pindala ∝ väärtus; eri ühikud eraldi skaalal. Täis = mõõdetud, pool = tuletatud, avatud = prognoos.
   - Valik = hele topeltrõngas (mitte hoiatusvärv). Hoiatused (lävend) = eraldi glüüf.
*/
(function(){
  const {C,VC,e,n0,mln,pp,sgn,stitch,lg,tipAttr,tipHTML,iconHTML,icon,miss}=K9;
  const O=[600,560],TB=790,TT=560,RD=250,RV=380,BOT=960,DEG=Math.PI/180;
  const SEL="#F1EBDD";
  const DOM=[
    {k:"pop",n:"Rahvastik",c:"#7FD8D0",ico:"pop",go:"rahvastik"},
    {k:"edu",n:"Haridus",c:"#8FD0FF",ico:"edu",go:"teenused"},
    {k:"job",n:"Tööhõive",c:"#C9E8A0",ico:"pop",go:"rahvastik/k9-too"},
    {k:"bud",n:"Eelarve",c:"#F2C14E",ico:"raha",go:"eelarve"},
    {k:"house",n:"Elamuarendus",c:"#E9A27C",ico:"house",go:"eluase"},
    {k:"water",n:"Vesi ja kanalisatsioon",c:"#6CB8F0",ico:"water",go:"eluase/k9-vesi"}];
  const UPD={pop:"Statistikaamet RV0282U, RV112U, RV49U, RVR02 · päritud 05.10.2026",edu:"toetusfondi arvestus ja EHIS (10.11.2025) · päritud 06.10.2026",job:"Statistikaamet UA08, PA107, TT065, TT4661, REL 2021 (RL21163) · päritud 17.10.2026",bud:"Statistikaamet RR300, MTA, eelarvestrateegiad · päritud 05.–11.10.2026",house:"Statistikaamet EH46U, EH045, REL 2021 RL21217 · päritud 08.10.2026",water:"REL 2021 RL21217, RR302 · päritud 08.10.2026"};
  const SENS={pop:"sõltub stsenaariumist (ränne, sündimus, suremus)",edu:"prognoos sõltub stsenaariumist rahvastiku kaudu",job:"stsenaariumist sõltumatu (mõõdetud registri- ja uuringuandmed)",bud:"tulumaksu prognoos sõltub stsenaariumist; täitmine (≤2025) mitte",house:"stsenaariumist sõltumatu (mõõdetud 2017–2025)",water:"stsenaariumist sõltumatu (REL 2021)"};
  /* juurte režiim: "hist" = ajaloolised juured (2016–2025 summa), "year" = valitud aasta vood */
  let RMODE="hist";
  const RN={b:"Sünnid",d:"Surmad",mi:"Sisseränne",mo:"Väljaränne",sal:"Rändesaldo (bilansiline)"};
  /* valitud aasta vood: kuni 2025 registreeritud sündmused; alates 2026 mudeli sünnid ja surmad (sama valem mis natInc) ning bilansiline rändesaldo; sisse- ja väljarännet mudel ei anna */
  function flowsY(u,y){if(u==="MAAK"&&y>2025){const a=V.map(v=>flowsY(v,y)),sm=k=>a.every(x=>x[k]!=null)?a.reduce((t,x)=>t+x[k],0):null;return {b:sm("b"),d:sm("d"),mi:sm("mi"),mo:sm("mo"),sal:sm("sal"),st:a[0].st};}
    const P=POP[u];if(y<=2025){const g=k=>P[k]&&P[k][YI(y)]!=null?P[k][YI(y)]:null;return {b:g("b"),d:g("d"),mi:g("mi"),mo:g("mo"),sal:g("mi")!=null&&g("mo")!=null?g("mi")-g("mo"):null,st:"m"};}
    const a=ageAt(u,y,S.mig,S.extra,S.fert),b=fFn(u,S.fert)(y)*(a[4]+a[5]+a[6]+a[7]),d=a.reduce((t,x,g)=>t+x*MORT[g]*kFn(u)(y),0),sal=y<YN?popT(u,y+1)-popT(u,y)-(b-d):null;return {b,d,mi:null,mo:null,sal,st:"f"};}
  K9.flowsY=flowsY;
  let PATH=[],INF=false,LASTP=null,CUR=null,ANIM=0,USER={k:1,dx:0,dy:0},OPENG={},TGT=null,PW=null;
  const yr=()=>Math.max(2015,Math.min(YN,S.year||START));
  const stY=y=>y>START?"f":"m",stTxt=s=>({m:"mõõdetud",d:"tuletatud",f:"prognoos",h:"hinnang (tuletatud)",na:"andmed puuduvad"})[s]||s;
  const ang=i=>(-165+i*30)*DEG,pt=(o,a,r)=>[o[0]+Math.cos(a)*r,o[1]+Math.sin(a)*r],dp=i=>pt(O,ang(i),RD),vAng=(ad,j)=>ang(ad)+(-27+j*18)*DEG;
  const H=EXT.HOUSE,DW=(u,k)=>u==="MAAK"?V.reduce((s,v)=>s+EXT.DW[v][k],0):EXT.DW[u][k];
  const COM=u=>{const c=u==="MAAK"?["t","tln","trt","same","cty","oth","abr"].reduce((o,k)=>(o[k]=V.reduce((s,w)=>s+EXT.COM[w][k],0),o),{}):EXT.COM[u];return {...c,oe:c.oth-c.tln};};
  const hIdx=y=>H.y.indexOf(y),RM=()=>window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  const chgS=c=>(c>0?"+":c<0?"−":"±")+nf1.format(Math.abs(c)*100)+"%";
  const TKEY={MAAK:"Rapla maakond",Rapla:"Rapla vald",Kohila:"Kohila vald",Marjamaa:"Märjamaa vald",Kehtna:"Kehtna vald"};
  const JS=(u,k)=>{const T=window.TOO_DATA;return T&&T[k]?T[k][TKEY[u]]||{}:{};};
  const nearest=(ys,Y)=>{const prev=ys.filter(y=>y<=Y);return prev.length?{y:prev[prev.length-1],near:false}:{y:ys[0],near:true};};
  const curV=x=>x&&x.cur?x.cur.v:null;
  /* ---- valdkonna põhinäitaja: cur = valitud aasta (null kui puudub), last = viimane/lähim teadaolev, base = lähtetase ---- */
  function domVal(d,u,Y){switch(d){
    case "pop":return {cur:{v:popT(u,Y),year:String(Y),st:stY(Y)},base:{v:popT(u,START),label:String(START)},unit:"elanikku",fmt:n0,lab:"rahvaarv 1. jaanuaril",series:[...new Set([2015,2020,START,2030,YN,Y])].sort((a,b)=>a-b).map(y=>[String(y),popT(u,y),stY(y),y])};
    case "edu":{const f=y=>eduDemand(u,y).sc,st=y=>y<START?"d":stY(y),lab=y=>y===START?"2025/26":String(y);return {cur:{v:f(Y),year:lab(Y),st:st(Y)},base:{v:f(START),label:"2025/26"},unit:"õpilast",fmt:n0,lab:"õpilased valla koolides",
      series:[...new Set([2020,START,2028,2030,2032,2034,YN,Y])].sort((a,b)=>a-b).map(y=>[lab(y),f(y),st(y),y]),note:Y<START?"Enne 2025/26 on valla koondnäitaja tuletatud vanuserühma muutusest; koolide kaupa andmeid neil aastatel ei ole.":""};}
    case "job":{const s=JS(u,"incn"),ys=Object.keys(s).map(Number).filter(y=>s[y]!=null),ok=s[Y]!=null,n=nearest(ys,Y);
      return {cur:ok?{v:s[Y],year:String(Y),st:"m"}:null,last:ok?null:{v:s[n.y],year:String(n.y),near:n.near},unit:"inimest",fmt:n0,lab:"töötavad elanikud: tööga seotud tuluga isikud aasta jooksul (UA08)",series:ys.map(y=>[String(y),s[y],"m",y]),
        note:ok?"":`Valla töötavate elanike arv on registrist teada kuni ${ys[ys.length-1]}. aastani; ${Y}. aasta väärtus avaldatakse hiljem (tavaliselt 1–2 aastat viitega). Värskemad näitajad: registreeritud töötud (kuni sept 2026) ja töötajad valla töökohtadel (kuni 2025) on harude lehtedes.`};}
    case "bud":{const T=taxSeries(u),ys=Object.keys(T).map(Number).filter(y=>y>=2017&&T[y]!=null).sort((a,b)=>a-b),st=y=>y>START?"f":y===START?"d":"m",ok=T[Y]!=null&&Y>=2017,n=nearest(ys,Y);
      return {cur:ok?{v:T[Y],year:String(Y),st:st(Y)}:null,last:ok?null:{v:T[n.y],year:String(n.y),near:n.near},base:{v:T[2025],label:"2025 (täitmine)"},unit:"€",fmt:mln,lab:"tulumaksu laekumine",
        series:[2017,2019,2021,2023,2025,START,2028,2030,2032,YN,Y].filter((y,i,a)=>a.indexOf(y)===i&&T[y]!=null).sort((a,b)=>a-b).map(y=>[String(y),T[y],st(y),y])};}
    case "house":{const k=u==="MAAK"?"MAAK":u,i=hIdx(Y),n=nearest(H.y,Y);return {cur:i<0?null:{v:H.n[k][i],year:String(Y),st:"m"},last:i<0?{v:H.n[k][H.y.indexOf(n.y)],year:String(n.y),near:n.near}:null,base:{v:H.n[k][H.y.length-1],label:String(H.y[H.y.length-1])},unit:"eluruumi",fmt:n0,lab:"kasutusse lubatud uued eluruumid",
      series:H.y.map((y,j)=>[String(y),H.n[k][j],"m",y])};}
    case "water":{const w=DW(u,"water");return {cur:Y===2021?{v:w,year:"2021",st:"m"}:null,last:Y===2021?null:{v:w,year:"2021",near:Y<2021},unit:"eluruumi",fmt:n0,lab:"veevarustusega asustatud eluruumid (REL 2021)",series:[["2021",w,"m",2021]]};}}}
  /* ---- lehed rühmadena: sum = koondnäitaja koosseis, ctx = seotud ---- */
  function groups(d,v,Y){const G=[],g=(k,title,kind,unit,note)=>{const o={k,title,kind,unit,note,items:[]};G.push(o);return o;},leaf=(gr,o)=>gr.items.push({fmt:n0,...o});
    if(d==="pop"){const a=ageVec(v,Y),a0=ageVec(v,START),P=POP[v];
      const gA=g("age","Vanuserühmad","sum","inimest","Summa = valla rahvaarv samal aastal.");gA.total=popT(v,Y);gA.totalLab="rahvaarv";{const sa=a.reduce((x,z)=>x+z,0),df=Math.round(gA.total-sa);if(df)gA.diffNote=`Vanuserühmade summa (${n0(sa)}) ja rahvaarv (${n0(gA.total)}) tulevad Statistikaameti eri tabelitest ega ühti ${n0(Math.abs(df))} inimese võrra. Arve ei kohandata.`;}
      [["k014","0–14-aastased",0,2,"pop_0_14"],["k1564","15–64-aastased",3,12,"pop_15_64"],["k65","65-aastased ja vanemad",13,17,"pop_65p"]].forEach(([k,n,i0,i1,pk])=>leaf(gA,{k,n,prov:[pk],unit:"inimest",cur:{v:sumG(a,i0,i1),year:String(Y),st:stY(Y)},base:{v:sumG(a0,i0,i1),label:String(START)},rule:"vanuserühmade summa (register ≤2026, kohortmudel hiljem)",
        series:[...new Set([2015,2020,START,2030,YN,Y])].sort((x,z)=>x-z).map(y=>[String(y),sumG(ageVec(v,y),i0,i1),stY(y),y])}));
      const gF=g("flow","Rahvastiku muutuse komponendid","ctx","inimest","Aasta jooksul toimunud sündmused; need ei ole rahvaarvu osad ega summeeru sellega."),yrs=[];for(let y=2015;y<=2025;y++)yrs.push(y);
      [["b","Sünnid","sündi"],["d","Surmad","surma"]].forEach(([k,n,un])=>{const ok=Y>=2015&&Y<=2025;leaf(gF,{k,n,prov:[k==="b"?"births":"deaths"],unit:un,cur:ok?{v:P[k][YI(Y)],year:String(Y),st:"m"}:null,last:ok?null:{v:P[k][YI(2025)],year:"2025"},rule:"Statistikaamet, sündmused aasta jooksul",series:yrs.map(y=>[String(y),P[k][YI(y)],"m",y]),
        note:ok?"":"Sündmuste andmed on 2015–2025 kohta; prognoosiaasta sünde ja surmi eraldi ei kuvata."});});
      const tot=V.reduce((s,w)=>s+POP[w].tot["2026"],0),m=CAL[v][S.mig].reduce((x,z)=>x+z,0)+S.extra*POP[v].tot["2026"]/tot+(VX[v]||0),okM=Y<=2025,mg=y=>P.mi[YI(y)]-P.mo[YI(y)];
      leaf(gF,{k:"mig",prov:["mig_in","mig_out"],n:okM?"Registreeritud rände saldo":Y>START?"Rände saldo (stsenaarium)":"Rände saldo",unit:"in/a",fmt:x=>sgn(Math.round(x)),cur:okM?{v:mg(Y),year:String(Y),st:"m"}:Y>START?{v:m,year:String(Y),st:"f"}:null,last:Y===START?{v:mg(2025),year:"2025"}:null,
        rule:okM?"sisseränne − väljaränne (register)":`valitud rändemuster „${MIGL[S.mig]}” + lisaränne + valla siht; aasta keskmine`,lim:"Registreeritud ränne ei kata registriparandusi; rändemustri valik on suurim määramatus.",
        series:[...yrs.map(y=>[String(y),mg(y),"m",y]),["2027–2036",m,"f",Y>START?Y:9999]]});}
    if(d==="edu"){const sch=K9.schools().filter(x=>x.v===v),mun=sch.filter(x=>x.k!=="RaplaG"),oth=sch.filter(x=>x.k==="RaplaG");
      const src=i=>i?(i.s==="hinnang"?"Kohila mudeli hinnang":i.s==="toetusfond"?"toetusfondi arvestus":i.s==="ehis"?"EHIS":i.s==="eelarve"?"valla eelarve":"EHIS / toetusfondi arvestus"):"EHIS / toetusfondi arvestus";
      const instOf=x=>EDU.inst.find(z=>z.n===x.k)||EDU.inst.find(z=>x.k==="RaplaG"&&z.t==="G")||EDU.inst.find(z=>x.n.startsWith(z.n));
      const sLeaf=(gr,x,ctx)=>{const ys=[START,2028,2030,2032,2034,YN],lab=y=>y===START?"2025/26":String(y),stt=y=>y===START?"m":"f",okY=Y>=START;
        leaf(gr,{k:"s:"+x.k,n:x.n,unit:"õpilast",kind:x.kind+(ctx?" · riigikool":""),school:x,cur:okY?{v:x.n_(Y),year:lab(Y),st:stt(Y)}:null,last:okY?null:{v:x.p,year:"2025/26",near:true},base:{v:x.p,label:"2025/26"},src:src(instOf(x)),
          rule:`2025/26 tegelik arv; prognoos = kooli arv × valla vanuserühma muutus. ÜRP lävend ${x.lim} õpilast.`,lim:"Kooli prognoos on valla vanuserühma trendi ülekanne, mitte kooli enda prognoos. Lävend on uuringu stsenaariumi piir, mitte seadus ega koolikohtade arv.",
          series:[...new Set([...ys,...(okY?[Y]:[])])].sort((a,b)=>a-b).map(y=>[lab(y),x.n_(y),stt(y),y,({ok:"üle lävendi",warn:"lävendi lähedal",crit:"lävendist allpool"})[x.st(y)]])});};
      const gS=g("sch","Valla koolide õpilased","sum","õpilast","Need koolid moodustavad valla haridussõlme väärtuse. Gümnaasiumi põhikooli- ja gümnaasiumiosa on eraldi lehed.");
      mun.forEach(x=>sLeaf(gS,x,false));gS.total=curV(domVal("edu",v,Y));gS.totalLab="valla koondnäitaja";
      const pv=EDU.inst.filter(i=>i.v===v&&(i.t==="P"||i.t==="V"));
      if(oth.length||pv.length){const gO=g("osch","Muud koolid vallas","ctx","õpilast","Riigi- ja erakoolid ning kutsekool. Ei kuulu valla koondnäitajasse.");oth.forEach(x=>sLeaf(gO,x,true));
        pv.forEach(i=>leaf(gO,{k:"i:"+i.n,n:i.n,unit:"õpilast",kind:{P:"erakool",V:"riiklik kutsekool"}[i.t],cur:Y===START&&i.p!=null?{v:i.p,year:"2025/26",st:i.s==="hinnang"?"h":"m"}:null,last:Y!==START&&i.p!=null?{v:i.p,year:"2025/26",near:Y<START}:null,src:src(i),
          rule:"asutuse õpilaste arv 2025/26; prognoosi asutuse kaupa mudelis ei ole",miss:i.p==null?"asutuse õpilaste arv ei ole mudelis":"",series:i.p!=null?[["2025/26",i.p,"m",START]]:[]}));}
      const kg=EDU.inst.filter(i=>i.v===v&&(i.t==="L"||(i.t==="LK"&&i.l!=null)));
      const gK=g("kg","Lasteaialapsed","ctx","last","Eraldi ühik (lapsed, mitte õpilased); ei summeeru õpilastega. Andmed ainult 2025/26.");
      kg.forEach(i=>leaf(gK,{k:"l:"+i.n,n:i.t==="LK"?i.n+" (lasteaiarühmad)":i.n,unit:"last",kind:i.t==="LK"?"lasteaed-kool":"lasteaed",cur:Y===START&&i.l!=null?{v:i.l,year:"2025/26",st:i.s==="hinnang"?"h":"m"}:null,last:Y!==START&&i.l!=null?{v:i.l,year:"2025/26",near:Y<START}:null,src:src(i),
        rule:"laste arv asutuses; asutuse prognoosi mudelis ei ole",miss:i.l==null?"asutuse laste arv ei ole avalik":"",series:i.l!=null?[["2025/26",i.l,i.s==="hinnang"?"h":"m",START]]:[]}));
      if(!kg.length)leaf(gK,{k:"lamiss",n:"Lasteaiad asutuste kaupa",unit:"last",cur:null,miss:"lasteaedade laste arv asutuste kaupa ei ole avalik",series:[]});}
    if(d==="job"){const c=COM(v),ok=Y===2021,gL=g("loc","Hõivatud töökoha asukoha järgi","sum","hõivatut","Summa = hõivatud valla elanikud (REL 2021).");gL.total=ok?c.t:null;gL.totalLab="hõivatud";
      [["same","Samas vallas"],["cty","Teises vallas maakonnas"],["tln","Tallinnas"],["oe","Mujal Eestis"],["abr","Välismaal"]].forEach(([k,n])=>leaf(gL,{k,n,unit:"hõivatut",cur:ok?{v:c[k],year:"2021",st:k==="oe"?"d":"m"}:null,last:ok?null:{v:c[k],year:"2021",near:Y<2021},rule:k==="oe"?"mujal Eestis kokku − Tallinn (tuletatud)":"REL 2021: hõivatud töökoha asukoha järgi",series:[["2021",c[k],k==="oe"?"d":"m",2021]]}));
      const ser=(gr,k,n,unit,fmt,obj,rule,lim,extra)=>{const ys=Object.keys(obj).filter(y=>/^\d{4}$/.test(y)&&obj[y]!=null).map(Number),ok=obj[Y]!=null,nn=nearest(ys,Y);
        leaf(gr,{k,n,unit,fmt,cur:ok?{v:obj[Y],year:String(Y),st:"m"}:(extra&&extra.y===Y?{v:extra.v,year:extra.lab,st:"d"}:null),last:ok||(extra&&extra.y===Y)?null:{v:obj[nn.y],year:String(nn.y),near:nn.near},rule,lim,series:[...ys.map(y=>[String(y),obj[y],"m",y]),...(extra?[[extra.lab,extra.v,"d",extra.y]]:[])]});};
      const gW=g("res","Elanike töö ja tulu (elukoha järgi)","ctx","","Registriandmed valla elanike kohta (Statistikaamet UA08, eksperimentaalstatistika).");
      ser(gW,"incn","Tööga seotud tuluga elanikud","inimest",n0,JS(v,"incn"),"UA08: isikud, kellel oli aasta jooksul palga- või ettevõtlustulu","Aasta jooksul ükskõik millal töötanud; suurem kui hõivatute arv ühel kuupäeval.");
      ser(gW,"inc","Tööga seotud tulu inimese kohta","€/aastas",n0,JS(v,"inc"),"UA08: tööga seotud tulu / tuluga isikute arv","Ei ole täistööajale taandatud.");
      const gJ=g("jobs","Töökohad vallas (töökoha järgi)","ctx","","Palgatöötajad valla territooriumil asuvatel töökohtadel (Statistikaamet PA107).");
      ser(gJ,"jobs","Töötajate arv valla töökohtadel","töötajat",n0,JS(v,"jobs"),"PA107: töötamise register, aasta keskmine","Ainult palgatöötajad; ettevõtjad ja FIE-d puuduvad.");
      ser(gJ,"wage","Keskmine brutokuupalk","€",n0,JS(v,"wage"),"PA107: väljamaksed / tööpanus","Töökohapõhine: ei näita valla elanike palka.");
      const gU=g("unemp","Töötus (elukoha järgi)","ctx","","Töötukassa registreeritud töötud (Statistikaamet TT065), kuude keskmine.");
      const rg=(JS(v,"reg")["Vanuserühmad kokku"])||{},rm=window.TOO_DATA&&window.TOO_DATA.regm[TKEY[v]],m26=rm?rm["2026"].slice(0,9):[];
      ser(gU,"reg","Registreeritud töötud","inimest",n0,rg,"TT065: 12 kuu lõpuseisu keskmine; 2026 = jaanuar–september","Registreeritud töötus ≠ tööjõu-uuringu töötus.",m26.length&&m26.every(x=>x!=null)?{y:2026,v:Math.round(m26.reduce((a,b)=>a+b,0)/9),lab:"2026 jaan–sept"}:null);
      const gE=g("rate","Tööhõive määr 15–74","ctx","%","Maakonna näitaja (Eesti tööjõu-uuring, valimihinnang). Valla tasemel tööhõive määra ei avaldata – valla puhul on see maakonna väärtus, mitte valla oma."),ys=Object.keys(EXT.EMPR).map(Number),n=nearest(ys,Y);
      leaf(gE,{k:"empr",n:"Rapla maakond"+(v!=="MAAK"?" (maakonna väärtus)":""),unit:"%",fmt:x=>nf1.format(x),cur:EXT.EMPR[Y]!=null?{v:EXT.EMPR[Y],year:String(Y),st:"m"}:null,last:EXT.EMPR[Y]!=null?null:{v:EXT.EMPR[n.y],year:String(n.y),near:n.near},rule:"Statistikaamet TT4661, 15–74-aastased",series:ys.map(y=>[String(y),EXT.EMPR[y],"m",y])});
      leaf(gE,{k:"emp",n:"Eesti (võrdlus)",unit:"%",fmt:x=>nf1.format(x),cur:EXT.EMPE[Y]!=null?{v:EXT.EMPE[Y],year:String(Y),st:"m"}:null,last:EXT.EMPE[Y]!=null?null:{v:EXT.EMPE[n.y],year:String(n.y),near:n.near},rule:"Statistikaamet TT4661, 15–74-aastased",series:ys.map(y=>[String(y),EXT.EMPE[y],"m",y])});}
    if(d==="bud"){const ys=[];for(let y=2016;y<=2025;y++)ys.push(y);const n=nearest(ys,Y),ok=Y>=2016&&Y<=2025;
      const line=(gr,k,nm,sign)=>{const f=y=>{const x=finY(v,k,y);return x==null?null:sign*x;};leaf(gr,{k,n:nm,unit:"€",fmt:mln,cur:ok&&f(Y)!=null?{v:f(Y),year:String(Y),st:/summa/.test(K9.finSrc(v,k,Y))?"d":"m"}:null,last:ok&&f(Y)!=null?null:(f(n.y)!=null?{v:f(n.y),year:String(n.y),near:n.near}:null),base:f(2025)!=null?{v:f(2025),label:"2025"}:null,rule:"RR300 rida; 2016–2017 puuduvad read RR30 eelkäijate summast",prov:[k],part:k,series:ys.filter(y=>f(y)!=null).map(y=>[String(y),f(y),/RR30|summa/.test(K9.finSrc(v,k,y))?"d":"m",y])});};
      const gI=g("inc","Põhitegevuse tulude read","ctx","€","Valik tuluridu; summa ei kata kõiki tulusid. Tulumaks on täitmise aastatel sama, mis valla sõlme väärtus.");
      [["n3","Tulumaks"],["n4","Maamaks"],["n9","Kaupade ja teenuste müük"],["n12","Toetusfond"],["n11","Tasandusfond"]].forEach(([k,nm])=>line(gI,k,nm,1));
      const gC=g("cost","Põhitegevuse kulude read","ctx","€","Valik kuluridu (RR300 liigitus).");[["n26","Personalikulud"],["n27","Majandamiskulud"],["n20","Antavad toetused tegevuskuludeks"],["n22","sh sotsiaaltoetused füüsilistele isikutele"]].forEach(([k,nm])=>line(gC,k,nm,-1));
      const gR=g("res","Tulem ja võlg","ctx","","Tuletatud näitaja ja eelarvestrateegia näitaja."),res=y=>{const a=finY(v,"n1",y),b=finY(v,"n19",y);return a==null||b==null?null:a+b;};
      leaf(gR,{k:"res",prov:["n29"],part:"n29",n:"Põhitegevuse tulem",unit:"€",fmt:mln,cur:ok&&res(Y)!=null?{v:res(Y),year:String(Y),st:"d"}:null,last:ok?null:{v:res(n.y),year:String(n.y),near:n.near},base:{v:res(2025),label:"2025"},rule:"tulud − kulud (RR300)",series:ys.filter(y=>res(y)!=null).map(y=>[String(y),res(y),"d",y])});
      const by=BUD[v].y,np=y=>{const x=netPct(v,y);return isFinite(x)?x*100:null;},nn=nearest(by,Y);
      leaf(gR,{k:"net",prov:["net","net_pct"],n:"Netovõlakoormus",unit:"% tuludest",fmt:x=>nf0.format(x),cur:by.includes(Y)&&np(Y)!=null?{v:np(Y),year:String(Y),st:Y<=2025?"m":"f"}:null,last:by.includes(Y)?null:{v:np(nn.y),year:String(nn.y),near:nn.near},rule:`${BUD[v].doc} (${BUD[v].st}); KOFS üldpiir 60%`,series:by.map(y=>[String(y),np(y),y<=2025?"m":"f",y])});}
    if(d==="house"){const D=EXT.DW[v],ok=Y===2021,gS=g("stock","Eluruumid 2021","sum","eluruumi","Asustatud + asustamata = eluruumid kokku (REL 2021). Summa ei ole valla sõlme väärtus (sõlm = uued eluruumid aastas).");gS.total=ok?D.all:null;gS.totalLab="eluruumid kokku";
      [["occ","Asustatud eluruumid",D.occ],["emp","Asustamata eluruumid (sh suvekodud)",D.emp]].forEach(([k,n,x])=>leaf(gS,{k,n,unit:"eluruumi",cur:ok?{v:x,year:"2021",st:"m"}:null,last:ok?null:{v:x,year:"2021",near:Y<2021},cmp:["osakaal",pp(x/D.all)],rule:"REL 2021 RL21217",series:[["2021",x,"m",2021]]}));
      const gP=g("perm","Ehitusload","ctx","luba","");leaf(gP,{k:"permit",n:"Ehitusload valla kaupa",unit:"luba",cur:null,miss:"Ehituslubade arv on mudelis ainult maakonna kohta (EH045).",series:[]});}
    if(d==="water"){const D=EXT.DW[v],ok=Y===2021;
      [["wat","Asustatud eluruumid: veevarustus",[["water","Veevarustusega",D.water,"m"],["nowater","Ilma veevarustuseta",D.occ-D.water,"d"]]],["wc","Asustatud eluruumid: tualettruum",[["wc","Tualettruumiga",D.wc,"m"],["nowc","Ilma tualettruumita",D.occ-D.wc,"d"]]]].forEach(([gk,gt,rows])=>{
        const gW=g(gk,gt,"sum","eluruumi","Summa = asustatud eluruumid (REL 2021). „Ilma” on tuletatud: asustatud − „-ga”.");gW.total=ok?D.occ:null;gW.totalLab="asustatud eluruumid";
        rows.forEach(([k,n,x,st])=>leaf(gW,{k,n,unit:"eluruumi",cur:ok?{v:x,year:"2021",st}:null,last:ok?null:{v:x,year:"2021",near:Y<2021},cmp:["osakaal",pp(x/D.occ)],rule:st==="d"?"asustatud eluruumid − „-ga” (tuletatud)":"REL 2021 RL21217",series:[["2021",x,st,2021]]}));});
      const gX=g("ctx","Kulu ja võimekus","ctx","","Valla eelarvet läbiv kulu; ÜVK võimekuse andmeid ei ole."),cy=[2023,2024,2025],cn=nearest(cy,Y),cf=y=>EXT.FUNC.vesi[v][cy.indexOf(y)]*1000;
      leaf(gX,{k:"cost",n:"Valla kulu: vesi ja heitvesi",unit:"€",fmt:mln,cur:cy.includes(Y)?{v:cf(Y),year:String(Y),st:"m"}:null,last:cy.includes(Y)?null:{v:cf(cn.y),year:String(cn.y),near:cn.near},rule:"RR302; ainult valla eelarvet läbiv osa",lim:"Vee-ettevõtete investeeringud ja tariifid mudelis puuduvad.",series:cy.map(y=>[String(y),cf(y),"m",y])});
      leaf(gX,{k:"asula",n:"Asulate ja ÜVK võimekuse andmed",unit:"",cur:null,miss:"Asulate tasandil ning ühisveevärgi ja -kanalisatsiooni võimekuse andmeid mudelis ei ole.",series:[]});}
    G.forEach(gr=>{gr.items.forEach(l=>{l.g=gr.k;l.gkind=gr.kind;l.gtitle=gr.title;});if(gr.kind==="sum"){const vals=gr.items.map(curV);gr.sum=vals.every(x=>x!=null)?vals.reduce((a,b)=>a+b,0):null;}});
    return G;}
  const allLeaves=(d,v,Y)=>groups(d,v,Y).flatMap(g=>g.items);
  /* ---- joonistusabi ---- */
  const curve=(a,b,bend)=>{const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return `M${a[0].toFixed(1)},${a[1].toFixed(1)}Q${(mx-dy/l*bend).toFixed(1)},${(my+dx/l*bend).toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`;};
  const hcurve=(a,b)=>{const k=(b[0]-a[0])*0.5;return `M${a[0].toFixed(1)},${a[1].toFixed(1)}C${(a[0]+k).toFixed(1)},${a[1].toFixed(1)} ${(b[0]-k).toFixed(1)},${b[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`;};
  function wrap(t,n){const w=String(t).split(" "),L=[];let s="";w.forEach(x=>{if((s+" "+x).trim().length>n&&s){L.push(s);s=x;}else s=(s+" "+x).trim();});if(s)L.push(s);return L.slice(0,3);}
  const ring=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${(r+6).toFixed(1)}" fill="none" stroke="${SEL}" stroke-width="2.2"/><circle cx="${x}" cy="${y}" r="${(r+10).toFixed(1)}" fill="none" stroke="${SEL}" stroke-opacity=".35" stroke-width="1"/>`;
  const mark=(x,y,r,col,st,sel,sw)=>{let m;if(st==="f")m=`<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="#13152B" stroke="${col}" stroke-width="1.8" stroke-dasharray="3 2"/>`;
    else if(st==="d"||st==="h")m=`<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="#13152B" stroke="${col}" stroke-width="1.6"/><path d="M${x},${(y-r).toFixed(1)}A${r.toFixed(1)},${r.toFixed(1)} 0 0 0 ${x},${(y+r).toFixed(1)}Z" fill="${col}"/>`;
    else m=`<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="${col}" stroke="${col}" stroke-width="${sw||1.4}"/>`;return (sel?ring(x,y,r):"")+m;};
  const missMark=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.dim}" stroke-dasharray="3 3"/>${miss(x,y,r*0.38)}`;
  const zeroMark=(x,y,col)=>`<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="${col}" stroke-width="1.6"/>`;
  const valTxt=(o,Y)=>o.cur&&o.cur.v!=null?`${o.fmt(o.cur.v)}${o.unit&&o.unit!=="€"?" "+o.unit:""} · ${o.cur.year} · ${stTxt(o.cur.st)}`:`puudub ${Y}${o.last&&o.last.v!=null?` · ${o.last.near?"lähim":"viimane"} ${o.last.year}: ${o.fmt(o.last.v)}`:""}`;
  /* ---- puu SVG ---- */
  function svg(){const u=S.unit,Y=yr(),act=PATH[0],ad=DOM.findIndex(d=>d.k===act),foc=ad>=0,deep=foc&&!!PATH[1];
    const node=(attr,label,inner,cls)=>`<g class="k9node${attr.on?" on":""}${cls?" "+cls:""}" tabindex="0" role="button" data-p="${e(attr.p)}" aria-label="${e(label)}"${attr.pressed!=null?` aria-pressed="${attr.pressed}"`:""}>${inner}</g>`;
    let s=`<svg class="k9tree" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Raplamaa arengupuu: ${NAME[u]}, aasta ${Y}. Vali juur, tüve rõngas, haru, vald või leht.">`;
    s+=`<defs><marker id="k9tarw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10Z" fill="${C.kid}"/></marker></defs>`;
    s+=`<g class="k9bg"${foc?` opacity="${deep?.22:.38}"`:""}>`;
    const Yf=Y,FY=RMODE==="year"?flowsY(u,Yf):null,perTxt=RMODE==="year"?`vood aastal ${Yf} · ${Yf<=2025?"registreeritud sündmused":"mudeli väljund (prognoos)"}`:"2016–2025 summa (ajaloolised juured)";
    s+=`<path d="M120,${TB+6}C380,${TB-6} 820,${TB-6} 1080,${TB+6}" fill="none" stroke="${C.line2}" stroke-width="1.2"/><text x="120" y="${TB+22}" style="font:600 11px var(--f-body);fill:${C.dim};letter-spacing:.1em">JUURED</text><text x="120" y="${TB+38}" style="font:400 10.5px var(--f-body);fill:${C.mut}">${e(perTxt)}</text>`;
    const P_=POP[u],sum=a=>{let t=0;for(let y=2016;y<=2025;y++)t+=a[YI(y)]||0;return t;};
    const RT=[["b","Sünnid",RMODE==="year"?FY.b:sum(P_.b),C.gain,-1,330],["mi","Sisseränne",RMODE==="year"?FY.mi:sum(P_.mi),C.gain,-1,470],["mo","Väljaränne",RMODE==="year"?FY.mo:sum(P_.mo),C.loss,1,730],["d","Surmad",RMODE==="year"?FY.d:sum(P_.d),C.loss,1,870]];
    const rmx=Math.max(1,...RT.map(r=>r[2]||0),RMODE==="year"&&FY.sal!=null?Math.abs(FY.sal):0),kR=26/rmx,rst=RMODE==="year"?FY.st:"m";
    /* kõverad eraldi kihina (tabamisjoon järgib kõverat); ringid ja sildid kõige peal, igaüks oma juure nupp */
    RT.forEach(([key,n,v,col,side,tx],i)=>{const a=[O[0]+side*(10+i%2*6),TB],b=[tx,TB+80],on=PATH[0]==="root"&&PATH[1]===key;
      s+=`<g class="k9rootc" data-p="root/${key}" aria-hidden="true"><path d="${curve(a,b,side*-40)}" fill="none" stroke="transparent" stroke-width="18" pointer-events="stroke"/>${v==null?`<path d="${curve(a,b,side*-40)}" fill="none" stroke="${C.dim}" stroke-width="1.2" stroke-dasharray="3 4" pointer-events="none"/>`:`<path d="${curve(a,b,side*-40)}" fill="none" stroke="${col}" stroke-opacity="${on?.95:.6}" stroke-width="${Math.max(1,v*kR).toFixed(1)}" stroke-linecap="round" pointer-events="none"${rst==="f"?' stroke-dasharray="7 4"':""}/>`}</g>`;});
    RT.forEach(([key,n,v,col,side,tx])=>{const b=[tx,TB+80],on=PATH[0]==="root"&&PATH[1]===key,lab=`${n} ${RMODE==="year"?Yf:"2016–2025"}: ${v==null?"puudub (mudel annab ainult rändesaldo)":n0(v)+" inimest"}`;
      s+=node({p:"root/"+key,on},lab,`<circle cx="${b[0]}" cy="${b[1]}" r="20" fill="transparent"/><rect x="${b[0]-58}" y="${b[1]+10}" width="116" height="42" fill="transparent"/>${on?ring(b[0],b[1],7):""}${v==null?missMark(b[0],b[1],8):`<circle cx="${b[0]}" cy="${b[1]}" r="7" fill="${rst==="f"?C.bg:C.bg}" stroke="${col}" stroke-width="2"${rst==="f"?' stroke-dasharray="3 2"':""}/>`}<text x="${b[0]}" y="${b[1]+26}" text-anchor="middle" style="font:600 13px var(--f-body);fill:${C.ink}">${n}</text><text x="${b[0]}" y="${b[1]+44}" text-anchor="middle" style="font:600 12.5px var(--f-num);fill:${v==null?C.dim:col}">${v==null?"puudub":(side<0?"+":"−")+n0(v)}</text>`,"k9root");});
    if(RMODE==="year"){const v=FY.sal,on=PATH[0]==="root"&&PATH[1]==="sal",x=600,y=TB+128;
      s+=node({p:"root/sal",on},`Rändesaldo (bilansiline) ${Yf}: ${v==null?"puudub":sgn(Math.round(v))}`,`<rect x="${x-90}" y="${y-16}" width="180" height="44" fill="transparent"/>${on?`<rect x="${x-92}" y="${y-18}" width="184" height="48" fill="none" stroke="${SEL}" stroke-width="2"/>`:""}<text x="${x}" y="${y}" text-anchor="middle" style="font:600 12px var(--f-body);fill:${C.ink}">Rändesaldo ${Yf<=2025?"(sisse − välja)":"(bilansiline, mudel)"}</text><text x="${x}" y="${y+18}" text-anchor="middle" style="font:600 12.5px var(--f-num);fill:${v==null?C.dim:v>=0?C.gain:C.loss}">${v==null?"puudub":sgn(Math.round(v))}</text>`,"k9root");}
    const yy=y=>TB-(y-2015)/(YN-2015)*(TB-TT),hasMC=!!(MC[u]&&MC[u][YN]),pmx=Math.max(...Array.from({length:YN-2014},(_,i)=>popT(u,2015+i)),hasMC?MC[u][YN][1]:0,hasMC?MC[u][START][1]:0),kT=70/pmx,hw=y=>popT(u,y)*kT/2;
    if(!foc)s+=`<text x="40" y="${BOT-14}" style="font:500 11px var(--f-num);fill:${C.dim}">juure jämedus ∝ inimesed (${RMODE==="year"?"aasta "+Yf:"10 a summa"}): ${n0(rmx)} in = 26 ühikut · tüve laius ∝ rahvaarv: ${n0(pmx)} in = 70 ühikut</text>`;
    const half=(a,b)=>{const ys=[];for(let y=a;y<=b;y++)ys.push(y);return `M${ys.map(y=>`${(O[0]-hw(y)).toFixed(1)},${yy(y).toFixed(1)}`).join("L")}L${ys.slice().reverse().map(y=>`${(O[0]+hw(y)).toFixed(1)},${yy(y).toFixed(1)}`).join("L")}Z`;};
    if(hasMC){const band=sx=>{const ys=[];for(let y=START;y<=YN;y++)ys.push(y);const w=(y,i)=>Math.max(MC[u][y][i],0)*kT/2;return `M${ys.map(y=>`${(O[0]+sx*w(y,1)).toFixed(1)},${yy(y).toFixed(1)}`).join("L")}L${ys.slice().reverse().map(y=>`${(O[0]+sx*w(y,0)).toFixed(1)},${yy(y).toFixed(1)}`).join("L")}Z`;};
      s+=`<g${tipAttr(tipHTML("Prognoosi määramatus",[["juhusliku kõikumise vahemik (80%) "+YN,n0(MC[u][YN][0])+" – "+n0(MC[u][YN][1])]],"simulatsiooni vahemik; rändemustri valik lisab omaette määramatuse"))}><path d="${band(-1)}" fill="url(#h-ink)"/><path d="${band(1)}" fill="url(#h-ink)"/></g>`;
      if(!foc){const xr=O[0]+MC[u][2031][1]*kT/2;s+=`<path d="M${xr+3},${yy(2031)}h12" stroke="${C.dim}" fill="none"/><text x="${xr+18}" y="${yy(2031)+4}" style="font:500 11px var(--f-body);fill:${C.dim}">juhuslik kõikumine (80%)</text>`;}}
    s+=`<path d="${half(2015,START)}" fill="#3A3F72" stroke="${C.ink}" stroke-opacity=".5"/><path d="${half(START,YN)}" fill="${C.ink}" fill-opacity=".07" stroke="${C.ink}" stroke-opacity=".6" stroke-dasharray="4 3"/>`;
    const ton=PATH[0]==="trunk";
    for(let y=2015;y<=YN;y++){const sel=y===Y,w=hw(y);s+=node({p:"trunk/"+y,on:ton&&+PATH[1]===y},`Rahvaarv ${y}: ${n0(popT(u,y))}${y>START?" (prognoos)":""}`,`<line x1="${O[0]-w-4}" x2="${O[0]+w+4}" y1="${yy(y)}" y2="${yy(y)}" stroke="${sel?SEL:C.bg}" stroke-width="${sel?2.6:1}" stroke-opacity="${sel?1:.7}"/><rect x="${O[0]-w-6}" y="${yy(y)-5}" width="${2*w+12}" height="10" fill="transparent"/>`);
      if(!foc&&(y===2015||y===START||y===YN||sel)){const left=sel&&y!==START&&y!==2015&&y!==YN;s+=`<text x="${O[0]+(left?-hw(y)-12:hw(y)+12)}" y="${yy(y)+4}" text-anchor="${left?"end":"start"}" style="font:${sel?700:500} 12px var(--f-num);fill:${sel?SEL:C.mut}">${y}${sel?" · "+n0(popT(u,y)):""}</text>`;}}
    if(!foc)s+=`<text x="${O[0]-52}" y="${(yy(2015)+yy(START))/2}" text-anchor="end" style="font:500 11px var(--f-body);fill:${C.dim}">mõõdetud</text><text x="${O[0]-52}" y="${(yy(START)+yy(YN))/2}" text-anchor="end" style="font:500 11px var(--f-body);fill:${C.dim}">prognoos</text>`;
    s+=`</g>`;
    if(INF&&!foc)[[0,1,"vanuserühmad → lasteaia- ja koolinõudlus"],[0,3,"20–64 ja 65+ arv → tulumaks"],[2,3,"hõive määr (hoob) → tulumaks"],[0,4,"rahvaarvu muutus → eluruumide lisavajadus"],[0,5,"lisavajadus → liitumiskulu"]].forEach(([a,b,t],i)=>{const A=dp(a),B=dp(b);s+=`<path d="${curve(A,B,-60-i*14)}" fill="none" stroke="${C.kid}" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#k9tarw)" pointer-events="none"/><text x="${((A[0]+B[0])/2).toFixed(0)}" y="${((A[1]+B[1])/2-30-i*6).toFixed(0)}" text-anchor="middle" pointer-events="none" style="font:500 10.5px var(--f-body);fill:${C.kid}">${e(t)}</text>`;});
    // valdkonnad
    DOM.forEach((d,i)=>{const a=ang(i),N=dp(i),st=[O[0]+(i-2.5)*5,O[1]+4],on=ad===i,dim=foc&&!on,dv=domVal(d.k,u,Y),cv=curV(dv);
      s+=`<g${dim?` opacity="${deep?.25:.4}"`:""}${on?' class="k9f"':""}><path d="M${st[0]},${st[1]}C${st[0]},${st[1]-70} ${(N[0]-Math.cos(a)*70).toFixed(1)},${(N[1]-Math.sin(a)*70).toFixed(1)} ${N[0].toFixed(1)},${N[1].toFixed(1)}" fill="none" stroke="${d.c}" stroke-width="${on?7:5}" stroke-opacity=".8" stroke-linecap="round"/>`;
      const lft=i<3,ca=Math.cos(a),lx=on?N[0]-ca*36:N[0]+(lft?-32:32)+ca*6,ly=on?N[1]-Math.sin(a)*40+4:N[1]+Math.sin(a)*14+(Math.abs(ca)<0.5?-20:0),anc=on?(ca<-0.3?"start":ca>0.3?"end":"middle"):lft?"end":"start";
      s+=node({p:d.k,on,pressed:on},`${d.n}: ${dv.lab} ${valTxt(dv,Y)}. Ava valdkond.`,`${on?ring(N[0],N[1],24):""}<circle cx="${N[0]}" cy="${N[1]}" r="24" fill="${C.bg}" stroke="${d.c}" stroke-width="${on?3:2}"/>${icon(d.ico,N[0],N[1],22,d.c)}
        ${dim&&deep?"":`<text x="${lx}" y="${ly-4}" text-anchor="${anc}" style="font:700 15px var(--f-disp);fill:${dim?C.dim:C.ink}">${d.n}</text>`}${dim?"":`<text x="${lx}" y="${ly+14}" text-anchor="${anc}" style="font:600 12px var(--f-num);fill:${cv==null?C.dim:d.c}">${cv==null?(dv.last?e(dv.fmt(dv.last.v))+(dv.unit==="€"?"":" "+dv.unit)+" · "+dv.last.year+(dv.last.near?" (lähim)":" (viimane)"):`puudub ${Y}`):e(dv.fmt(cv))+(dv.unit==="€"?"":" "+dv.unit)+" · "+dv.cur.year}</text>`}`)+`</g>`;});
    // vallad aktiivses valdkonnas
    if(foc){const d=DOM[ad],N=dp(ad),vals=V.map(v=>domVal(d.k,v,Y)),mx=Math.max(...vals.map(x=>Math.abs(curV(x)||0)))||1,kA=v=>Math.max(4,26*Math.sqrt(Math.abs(v)/mx));
      V.forEach((v,j)=>{const a=vAng(ad,j),Pv=pt(O,a,RV),dv=vals[j],cv=curV(dv),r=cv==null?12:cv===0?5:kA(cv),on=PATH[1]===v,dim=deep&&!on,sel=S.unit===v;
        s+=`<g class="k9f"${dim?' opacity=".3"':""}><path d="${curve(N,Pv,(j-1.5)*10)}" fill="none" stroke="${d.c}" stroke-width="3" stroke-opacity=".7" stroke-linecap="round"/>`;
        const below=deep&&on,lx=below?Pv[0]:Pv[0]+Math.cos(a)*(r+14),ly=below?Pv[1]+r+22:Pv[1]+Math.sin(a)*(r+14),anc=below?"middle":Math.cos(a)<-0.3?"end":Math.cos(a)>0.3?"start":"middle";
        const m=cv==null?missMark(Pv[0],Pv[1],12)+(on?ring(Pv[0],Pv[1],12):""):cv===0?zeroMark(Pv[0],Pv[1],VC[v]):mark(Pv[0],Pv[1],r,VC[v],dv.cur.st,on);
        s+=node({p:d.k+"/"+v,on,pressed:on},`${NAME[v]}: ${dv.lab} ${valTxt(dv,Y)}`,`${m}${sel&&!on?`<circle cx="${Pv[0]}" cy="${Pv[1]}" r="${r+4}" fill="none" stroke="${VC[v]}" stroke-width="1.4" stroke-dasharray="2 2"/>`:""}
          <text x="${lx}" y="${ly-3}" text-anchor="${anc}" style="font:700 13.5px var(--f-body);fill:${VC[v]}">${SHORTN[v]}</text><text x="${lx}" y="${ly+13}" text-anchor="${anc}" style="font:600 12px var(--f-num);fill:${cv==null?C.dim:C.ink}">${cv==null?(dv.last?e(dv.fmt(dv.last.v)):`puudub ${Y}`):e(dv.fmt(cv))}</text>${cv==null&&dv.last&&!dim?`<text x="${lx}" y="${ly+27}" text-anchor="${anc}" style="font:500 11px var(--f-num);fill:${C.dim}">${dv.last.year} (${dv.last.near?"lähim":"viimane"})</text>`:""}`)+`</g>`;});
      // fookusvald: rühmad veergudes, horisontaalsed sildid
      if(deep){const v=PATH[1],j=V.indexOf(v),a=vAng(ad,j),Pv=pt(O,a,RV),side=Math.cos(a)<-0.05?-1:1,G=groups(d.k,v,Y),xs=V.map((_,q)=>pt(O,vAng(ad,q),RV)[0]);
        const edge=side<0?Math.min(...xs)-160:Math.max(...xs)+160,COLW=390,anc=side<0?"end":"start";
        const scale={};G.forEach(g=>g.items.forEach(l=>{const x=curV(l);if(x!=null&&l.unit&&g.unit)scale[l.unit]=Math.max(scale[l.unit]||0,Math.abs(x));}));
        const nAll=G.reduce((s,x)=>s+x.items.length,0),isOpen=g=>{const key=d.k+"/"+v+"/"+g.k;return key in OPENG?OPENG[key]:(g.kind==="sum"||nAll<=12||g.items.length<=3);};
        const rowH=l=>wrap(l.n,28).length*15+20;
        const blocks=G.map(g=>{const op=isOpen(g);return {g,op,h:40+(op?g.items.reduce((s,l)=>s+rowH(l)+8,0):24)};});
        const tot=blocks.reduce((s,b)=>s+b.h+18,0),two=tot>560,cols=[[],[]],ch=[0,0];
        blocks.forEach(b=>{const c=!two?0:(b.g.kind==="sum"&&ch[0]<tot/2)?0:(ch[0]<=ch[1]?0:1);cols[c].push(b);ch[c]+=b.h+18;});
        cols.forEach((col,ci)=>{if(!col.length)return;let y=Pv[1]-ch[ci]/2+10;const x0=edge+side*ci*COLW;
          col.forEach(({g,op,h})=>{const sumC=g.kind==="sum",hub=[x0,y+8],lc=d.c,dash=sumC?"":` stroke-dasharray="5 4"`,gkey=d.k+"/"+v+"/"+g.k;
            const sumTxt=sumC?(g.sum!=null?`Σ ${n0(g.sum)} ${g.unit}${g.total!=null?(Math.round(g.sum)===Math.round(g.total)?` = ${g.totalLab}`:` ≠ ${g.totalLab} ${n0(g.total)}`):""}`:`Σ aastal ${Y}: andmed puuduvad`):`ei kuulu summasse · ${g.items.length} ${g.items.length===1?"objekt":"objekti"}`;
            s+=`<g class="k9f k9grp"><path d="${hcurve([Pv[0]+side*14,Pv[1]],[hub[0]-side*7,hub[1]])}" fill="none" stroke="${lc}" stroke-width="${sumC?2.4:1.4}" stroke-opacity="${sumC?.85:.6}"${dash}/>`;
            s+=`<g class="k9node k9gh" tabindex="0" role="button" data-grp="${e(gkey)}" aria-expanded="${op}" aria-label="${e(g.title)} (${sumC?"koondnäitaja koosseis":"seotud, ei kuulu summasse"}). ${e(sumTxt)}. ${op?"Sulge rühm":"Ava rühm"}">
              <rect x="${side<0?hub[0]-250:hub[0]-8}" y="${hub[1]-14}" width="258" height="38" fill="transparent"/><path d="M${hub[0]},${hub[1]-7}l7,7l-7,7l-7,-7Z" fill="${sumC?lc:C.bg}" stroke="${lc}" stroke-width="1.5"/>
              <text x="${hub[0]+side*14}" y="${hub[1]+1}" text-anchor="${anc}" style="font:700 13px var(--f-body);fill:${lc}">${op?"▾":"▸"} ${e(g.title)}</text>
              <text x="${hub[0]+side*14}" y="${hub[1]+17}" text-anchor="${anc}" style="font:500 11.5px var(--f-num);fill:${C.mut}">${sumC?"koosseis · ":"seotud · "}${e(sumTxt)}</text></g>`;
            let ry=y+44;
            if(op){const stemX=x0;g.items.forEach(l=>{const rh=rowH(l),cy=ry+10,mx2=x0+side*30,cv=curV(l),on=PATH[2]===l.k,dimL=PATH[2]&&!on;
              const rr=cv==null?8:cv===0?5:(scale[l.unit]?Math.max(3,14*Math.sqrt(Math.abs(cv)/scale[l.unit])):7);
              let mk=cv==null?missMark(mx2,cy,8)+(on?ring(mx2,cy,8):""):cv===0?zeroMark(mx2,cy,lc):(scale[l.unit]?mark(mx2,cy,rr,lc,l.cur.st,on):stitch(mx2,cy,8,lc,l.cur.st==="f"?"f":l.cur.st==="d"||l.cur.st==="h"?"d":"m")+(on?ring(mx2,cy,8):""));
              if(l.school&&cv!=null)mk+=K9.stGlyph(l.school.st(Math.max(START,Y)),mx2-side*(rr+8),cy-rr-3,3.6);
              s+=`<path d="M${stemX},${hub[1]+8}V${cy}" stroke="${lc}" stroke-opacity=".35" fill="none"${dash}/><path d="${hcurve([stemX,cy],[mx2-side*(rr+1),cy])}" stroke="${lc}" stroke-opacity="${dimL?.25:.6}" stroke-width="${sumC?1.6:1.1}" fill="none"${dash}/>`;
              const tx=mx2+side*(Math.max(rr,8)+10),nl=wrap(l.n,28);
              s+=node({p:d.k+"/"+v+"/"+l.k,on,pressed:on},`${l.n}: ${valTxt(l,Y)}. ${sumC?"Kuulub koondnäitaja koosseisu.":"Seotud, ei kuulu summasse."}`,`<rect x="${side<0?tx-240:mx2-16}" y="${cy-14}" width="${side<0?mx2+16-(tx-240):256}" height="${rh}" fill="transparent"/>${mk}
                ${nl.map((t,q)=>`<text x="${tx}" y="${cy-3+q*15}" text-anchor="${anc}" style="font:${on?700:600} 13px var(--f-body);fill:${dimL?C.dim:C.ink}">${e(t)}</text>`).join("")}
                <text x="${tx}" y="${cy-2+nl.length*15}" text-anchor="${anc}" style="font:500 11.5px var(--f-num);fill:${cv==null||dimL?C.dim:lc}">${e(valTxt(l,Y))}</text>`,"k9leaf");
              ry+=rh+8;});}
            else s+=`<text x="${hub[0]+side*14}" y="${ry+4}" text-anchor="${anc}" style="font:500 11.5px var(--f-body);fill:${C.dim}">${g.items.length} objekti peidetud — ava rühm</text>`;
            s+=`</g>`;y+=h+18;});});}}
    return s+"</svg>";}
  /* ---- kõrvalpaneel ---- */
  function crumbs(){const parts=[["","Raplamaa"]];if(!PATH.length)return parts;const d=DOM.find(x=>x.k===PATH[0]);
    if(PATH[0]==="root")parts.push(["root/"+PATH[1],"Juur · "+({b:"Sünnid",d:"Surmad",mi:"Sisseränne",mo:"Väljaränne"})[PATH[1]]]);
    else if(PATH[0]==="trunk")parts.push(["trunk/"+PATH[1],"Tüvi · "+PATH[1]]);
    else{parts.push([d.k,d.n]);if(PATH[1])parts.push([d.k+"/"+PATH[1],SHORTN[PATH[1]]]);if(PATH[2]){const l=allLeaves(d.k,PATH[1],yr()).find(x=>x.k===PATH[2]);parts.push([PATH.join("/"),l?l.n:PATH[2]]);}}
    return parts;}
  const dl=rows=>`<dl class="k9pdl">${rows.filter(r=>r&&r[1]!=null&&r[1]!=="").map(r=>`<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join("")}</dl>`;
  function dTxt(o,dv){return o.fmt===mln?(dv<0?"−":"+")+mln(Math.abs(dv)):o.fmt===n0?sgn(Math.round(dv)):(dv<0?"−":"+")+o.fmt(Math.abs(dv));}
  function head(o,Y){const u=o.unit&&o.unit!=="€"?o.unit:"";let h;
    if(o.cur&&o.cur.v!=null)h=`<div class="k9phead" role="group" aria-label="${e(o.cur.year)} · ${e(o.fmt(o.cur.v))} ${e(u)} · ${stTxt(o.cur.st)}"><p class="k9pmeta"><b>${e(o.cur.year)}</b> · <span class="k9st k9st-${o.cur.st}">${stTxt(o.cur.st)}</span></p><p class="k9pval"><b>${e(o.fmt(o.cur.v))}</b><span>${e(u)}</span></p></div>`;
    else if(o.last&&o.last.v!=null)h=`<div class="k9phead" role="group" aria-label="${o.last.near?"lähim":"viimane"} teadaolev ${e(o.last.year)} · ${e(o.fmt(o.last.v))} ${e(u)}; aasta ${Y} andmed puuduvad"><p class="k9pmeta"><b>${e(o.last.year)}</b> · <span class="k9st k9st-na">${o.last.near?"lähim":"viimane"} teadaolev väärtus</span></p><p class="k9pval"><b>${e(o.fmt(o.last.v))}</b><span>${e(u)}</span></p><p class="k9pmeta">Aasta ${Y} kohta andmed puuduvad${o.miss?`: ${e(o.miss)}`:"."} Väärtust ei ole edasi arvutatud.</p></div>`;
    else h=`<div class="k9phead"><p class="k9pmeta"><b>${Y}</b> · <span class="k9st k9st-na">andmed puuduvad</span></p><p class="k9pval na"><b>Andmed puuduvad</b></p>${o.miss?`<p class="k9pmeta">${e(o.miss)}</p>`:""}</div>`;
    if(o.cur&&o.cur.v!=null&&o.base&&o.base.v!=null){const same=o.base.label===o.cur.year||o.base.label.startsWith(o.cur.year+" ");
      h+=`<p class="k9pcmp">${same?`Lähtetase (${e(o.base.label)})`:`${e(o.base.label)}: ${e(o.fmt(o.base.v))} ${e(u)}; muutus ${e(dTxt(o,o.cur.v-o.base.v))}${o.base.v?` ehk ${chgS(o.cur.v/o.base.v-1)}`:""}`}</p>`;}
    return h;}
  function stable(o,Y,extra){if(!o.series||!o.series.length)return `<p class="k9note">Alusandmete rida puudub.</p>`;const rows=o.series;
    return `<div class="k9tbl"><table><thead><tr><th>Aasta</th><th class="n">Väärtus</th><th>Andmeolek</th>${extra?`<th>${extra}</th>`:""}</tr></thead><tbody>${rows.map(r=>{const hl=r[3]===Y;return `<tr${hl?' class="sel" aria-current="true"':""}><td>${hl?"▸ ":""}${e(r[0])}</td><td class="n">${r[1]==null?"puudub":e(o.fmt(r[1]))}</td><td>${stTxt(r[2])}</td>${extra?`<td>${e(r[4]||"")}</td>`:""}</tr>`;}).join("")}</tbody></table></div>${rows.some(r=>r[3]===Y)?"":`<p class="k9note">Valitud aasta ${Y} rida puudub: selle aasta väärtust andmetes ei ole.</p>`}`;}
  function panel(){const u=S.unit,Y=yr(),cr=crumbs();
    let h=`<div class="k9ptop"><nav class="k9crumb" aria-label="Liikumistee">${cr.map((c,i)=>i<cr.length-1?`<button type="button" data-p="${e(c[0])}">${e(c[1])}</button><span aria-hidden="true">›</span>`:`<b aria-current="location">${e(c[1])}</b>`).join("")}</nav>
      <div class="k9pact">${PATH.length?`<button type="button" class="k9btn ghost sm" data-back>← Üks samm tagasi</button><button type="button" class="k9btn ghost sm" data-p="">Tervikvaade</button>`:""}<button type="button" class="k9btn ghost sm k9psheet" data-sheet>Laienda</button></div></div>`;
    const body=o=>`<h3 tabindex="-1">${e(o.n)}</h3>${o.desc?`<p class="k9pdesc">${o.desc}</p>`:""}${o.head||""}${dl(o.rows)}${o.extra||""}${o.tbl?`<details open><summary>${o.tblT||"Alusandmed"}</summary>${o.tbl}</details>`:""}${o.lim?`<p class="k9plim"><b>Määramatus ja piirangud:</b> ${o.lim}</p>`:""}${o.go||o.atl?`<div class="k9pact">${o.go?`<a class="k9btn sm" href="#${o.go}" data-go="${o.go}">Ava täpne vaade →</a>`:""}${o.atl?`<button type="button" class="k9btn ghost sm" data-atl="${e(o.atl)}" data-ctx="${e(JSON.stringify(o.ctx||{path:PATH.join("/")}))}">◎ Ava kaardivaates</button>`:""}</div>`:""}`;
    if(!PATH.length){const list=DOM.map(d=>{const dv=domVal(d.k,u,Y),cv=curV(dv);return `<li><button type="button" data-p="${d.k}">${iconHTML(d.ico,14)} ${d.n}: <b>${cv==null?(dv.last?e(dv.fmt(dv.last.v)):"andmed puuduvad"):e(dv.fmt(cv))}</b> ${(cv==null&&!dv.last)||dv.unit==="€"?"":dv.unit} <small>(${cv==null?(dv.last?`${dv.last.near?"lähim":"viimane"} ${dv.last.year}; ${Y} puudub`:Y):dv.cur.year+", "+stTxt(dv.cur.st)})</small></button></li>`;}).join("");
      return h+`<h3 tabindex="-1">${NAME[u]} · ${Y}</h3><p class="k9pdesc">Vali puult juur, tüve rõngas või haru. Iga valik avab järgmise kihi; siia ilmuvad valitud aasta väärtus, andmeolek, allikas ja alusandmed.</p><p class="k9lbl">Puu tekstina</p><ul class="k9plist">${list}<li><button type="button" data-p="trunk/${Y}">Tüvi: rahvaarv ${Y} <b>${n0(popT(u,Y))}</b></button></li>${["b","d","mi","mo"].map(k=>`<li><button type="button" data-p="root/${k}">Juur: ${({b:"sünnid",d:"surmad",mi:"sisseränne",mo:"väljaränne"})[k]} 2016–2025</button></li>`).join("")}</ul>`;}
    if(PATH[0]==="root"){const k=PATH[1]||"b",n=RN[k],tog=`<div class="k9seg" role="group" aria-label="Juurte režiim"><button type="button" data-rmode="hist" aria-pressed="${RMODE==="hist"}">Ajaloolised juured 2016–2025</button><button type="button" data-rmode="year" aria-pressed="${RMODE==="year"}">Valitud aasta vood (${Y})</button></div>`;
      const ser=[];for(let y=2015;y<=YN;y++){const f=flowsY(u,y);ser.push([String(y)+(y>2025?" *":""),f[k],f.st,y,RMODE==="hist"?(y>=2016&&y<=2025?"kuulub summasse":"ei kuulu summasse"):(y<=2025?"registreeritud":k==="mi"||k==="mo"?"mudel ei anna":"mudeli väljund")]);}
      if(RMODE==="hist"){if(k==="sal")return h+tog+`<p class="k9note">Rändesaldo eraldi juurena on ainult režiimis „Valitud aasta vood”.</p>`;let t=0;for(let y=2016;y<=2025;y++)t+=POP[u][k][YI(y)]||0;
        const rowsH=ser.filter(r=>r[3]<=2025).map(r=>r);
        return h+tog+body({n:`${n} · ${NAME[u]} · 2016–2025`,desc:"Ajaloolised juured: rahvastiku muutuse komponendi kümne aasta (2016–2025) summa. Ei muutu aasta valikuga; tabelis on summasse kuuluvad aastad tähistatud.",head:head({cur:{v:t,year:"2016–2025",st:"m"},unit:"inimest",fmt:n0},Y),
          rows:[["Piirkond",NAME[u]],["Periood","2016–2025 (10 aastat)"],["Allikas",UPD.pop],["Arvutusreegel","aastate 2016–2025 summa"],["Stsenaarium","ei sõltu (ajalugu)"]],tblT:"Alusandmed (summasse kuuluvad aastad: 2016–2025)",tbl:stable({series:rowsH,fmt:n0},2099,"Summas"),lim:k==="mi"||k==="mo"?"Registreeritud ränne ei kata registriparandusi; mudel kalibreerib rände rahvaarvu tegeliku muutuse järgi (bilansiline rändesaldo), seega registreeritud ränne ja mudeli rändesaldo ei ole sama näitaja.":"",go:"rahvastik/k9-alli"});}
      const f=flowsY(u,Y),v=f[k],st=f.st;
      return h+tog+body({n:`${n} · ${NAME[u]} · ${Y}`,desc:Y<=2025?"Valitud aasta registreeritud vood (Statistikaamet).":"Valitud aasta mudeli väljund: sünnid ja surmad kohortmudelist, ränne ainult bilansilise saldona. Sisse- ja väljarännet mudel eraldi ei prognoosi.",head:head({cur:v==null?null:{v,year:String(Y),st},last:null,unit:"inimest",fmt:k==="sal"?(x=>sgn(Math.round(x))):n0},Y),
        rows:[["Piirkond",NAME[u]],["Periood",String(Y)+(Y>2025?" (prognoos)":" (mõõdetud)")],["Andmeolek",v==null?(k==="mi"||k==="mo"?"puudub: mudel annab ainult rändesaldo":Y===YN?"puudub: prognoos lõpeb "+YN:"puudub"):st==="m"?"mõõdetud":"prognoos"],["Allikas",Y<=2025?UPD.pop:"kohortmudel v6 (sünnid = sündimuskordaja × 20–39-aastased naised mudeli rühmades; surmad = vanuseti suremus; saldo = rahvaarvu muutus − loomulik iive)"],["Stsenaarium",Y>2025?`${MIGL[S.mig]} · ${K9.modeLabel?K9.modeLabel():""}`:"ei sõltu (ajalugu)"]],
        tblT:"Aegrida (prognoosiaastad tähistatud *)",tbl:stable({series:ser,fmt:k==="sal"?(x=>sgn(Math.round(x))):n0},Y,"Märkus"),lim:"Registreeritud ränne (kuni 2025) ja mudeli bilansiline rändesaldo (alates 2026) ei ole sama näitaja: saldo sisaldab registriparandusi.",go:"rahvastik/k9-alli"});}
    if(PATH[0]==="trunk"){const y=+PATH[1]||Y,dv=domVal("pop",u,y);
      return h+body({n:`Rahvaarv · ${NAME[u]}`,desc:"Tüve rõngas = rahvaarv 1. jaanuaril. Rõngaste vahel on sirged lõigud, mitte mõõdetud vaheväärtused. Rõnga valik määrab ka aasta.",head:head(dv,y),
        rows:[["Stsenaarium",y>START?`${MIGL[S.mig]}${S.extra?", lisaränne "+sgn(S.extra)+"/a":""}`:"ei sõltu"],["juhusliku kõikumise vahemik (80%)",y>START?n0(MC[u][y][0])+" – "+n0(MC[u][y][1]):""],["Allikas",y>START?"kohortmudel v6":UPD.pop]],tbl:stable(dv,y),go:"rahvastik/k9-prog"});}
    const d=DOM.find(x=>x.k===PATH[0]);if(!d)return h;
    if(!PATH[1]){const dv=domVal(d.k,u,Y),ser=K9.UNITS.map(w=>{const x=domVal(d.k,w,Y),cv=curV(x);return {c:[w==="MAAK"?"Maakond":NAME[w],cv==null?"andmed puuduvad":x.fmt(cv),cv==null?"–":stTxt(x.cur.st)],sel:w===u};});
      return h+body({n:`${d.n} · ${NAME[u]}`,desc:`Haru avab neli valda. Valla ringi pindala ∝ ${dv.lab} valitud aastal (sama mõõtkava; väga väike väärtus joonistatakse vähima nähtava ringina, null = tühi ring); harude paksus ja kumerus ei kanna väärtust.`,head:head(dv,Y),
        rows:[["Näitaja",dv.lab],["Stsenaarium",SENS[d.k]],["Allikas ja uuendamine",UPD[d.k]],["Märkus",dv.note||""]],tblT:`Vallad aastal ${Y}`,tbl:K9.table(["Ühik","Väärtus","Andmeolek"],ser,{textCols:[0,2]})+`<p class="k9lbl">Aegrida · ${NAME[u]}</p>`+stable(dv,Y),go:d.go});}
    const v=PATH[1],G=groups(d.k,v,Y);
    if(!PATH[2]){const dv=domVal(d.k,v,Y);
      const gx=G.map(g=>`<div class="k9pgrp k9pgrp-${g.kind}"><p><b>${e(g.title)}</b> <span>${g.kind==="sum"?"koondnäitaja koosseis":"seotud · ei kuulu summasse"}</span></p>${g.note?`<small>${e(g.note)}</small>`:""}
        ${g.kind==="sum"?`<p class="k9psum">${g.sum!=null?`Σ ${n0(g.sum)} ${g.unit}`:`Σ aastal ${Y}: andmed puuduvad`}${g.total!=null&&g.sum!=null?(Math.round(g.sum)===Math.round(g.total)?` = ${g.totalLab} ${n0(g.total)} ✓`:` · ${g.totalLab} ${n0(g.total)} · vahe ${sgn(Math.round(g.total-g.sum))}`):""}</p>${g.diffNote?`<p class="k9plim">${e(g.diffNote)}</p>`:""}`:""}
        <ul class="k9plist">${g.items.map(l=>`<li><button type="button" data-p="${e(d.k+"/"+v+"/"+l.k)}">${e(l.n)}: <b>${curV(l)==null?(l.last?e(l.fmt(l.last.v)):"andmed puuduvad"):e(l.fmt(curV(l)))}</b> ${curV(l)==null&&!l.last?"":e(l.unit||"")} <small>${curV(l)==null?(l.last?`(${l.last.near?"lähim":"viimane"} ${e(l.last.year)}; ${Y} puudub)`:""):`(${e(l.cur.year)}, ${stTxt(l.cur.st)})`}</small></button></li>`).join("")}</ul></div>`).join("");
      return h+body({n:`${d.n} · ${NAME[v]}`,desc:`Pidev ühendus = koondnäitaja koosseis (summa kontrollitud); katkendlik = seotud objektid, mis ei kuulu summasse. Eri ühikutega rühmi ei summeerita.`,head:head(dv,Y),
        rows:[["Näitaja",dv.lab],["Stsenaarium",SENS[d.k]],["Allikas",UPD[d.k]],["Märkus",dv.note||""]],extra:({pop:()=>K9.provHTML(v,["pop_tot"],Math.min(Y,2026)),bud:()=>(Y>=2026?K9.partHTML(v,"n3_mta")+K9.partHTML(v,"n3"):"")+K9.provHTML(v,["n3"],Math.min(Y,2025)),house:()=>K9.provHTML(v,["dw_new"],Math.min(Y,2025))}[d.k]||(()=>""))()+gx,tblT:"Valla aegrida",tbl:stable(dv,Y),go:d.go,atl:"v:"+v});}
    const l=G.flatMap(g=>g.items).find(x=>x.k===PATH[2]);if(!l)return h+`<p class="k9note">Seda lehte selles vallas ei ole.</p>`;
    const sch=l.school,scen=sch||l.k==="mig"||(d.k==="pop"&&l.g==="age");
    return h+body({n:l.n,desc:`${NAME[v]} · ${d.n}${l.kind?" · "+l.kind:""}`,head:head(l,Y),
      rows:[["Rühm",`${e(l.gtitle)} — ${l.gkind==="sum"?"<b>kuulub koondnäitaja koosseisu</b>":"seotud, <b>ei kuulu summasse</b>"}`],["Piirkond",NAME[v]],l.cmp?["Osakaal",l.cmp[1]]:null,sch?["ÜRP lävend",`${sch.lim} õpilast`]:null,["Allikas",(l.src&&!UPD[d.k].startsWith(l.src)?l.src+" · ":"")+UPD[d.k]],d.k==="edu"?["Täpne lähtekirje",(()=>{const nm=sch?(sch.k==="KohilaG"?"Kohila Gümnaasium":sch.k==="MarjG"?"Märjamaa Gümnaasium":sch.k==="RaplaG"?"Rapla Gümnaasium":sch.k):l.k.replace(/^[il]:/,""),it=EDU.inst.find(z=>z.n===nm),SRC={toetusfond:"valla toetusfondi arvestus (EHIS 10.11.2025 seis)",ehis:"EHIS / HaridusSilm 10.11.2025",eelarve:"valla eelarve lisa (asutuse õpilaste või laste arv)",hinnang:"hinnang (asutuse andmed puuduvad)"};return it?`${SRC[it.s]||"allikas märkimata"}. Täpne lähtekirje (dokument, lehekülg või tabelirida) kontrollimata.`:"Täpne lähtekirje kontrollimata.";})()]:null,["Arvutusreegel ja eeldused",l.rule||""],["Stsenaarium",scen?SENS[d.k]:"stsenaariumist sõltumatu"],["Märkus",l.note||""],curV(l)==null&&l.miss?["Miks puudub",l.miss]:null],
      extra:(Y>=2026&&l.part?K9.partHTML(v,l.part):"")+(l.prov?K9.provHTML(v,l.prov,Math.min(Y,2026)):""),tbl:stable(l,Y,sch?"Seis lävendi suhtes":""),lim:l.lim||"",go:d.go,ctx:{path:PATH.join("/"),n:l.n,v:valTxt(l,Y),school:sch?sch.k:null},atl:(()=>{if(d.k!=="edu")return "v:"+v;const nm=sch?(sch.k==="RaplaG"?"Rapla Gümnaasium":sch.k==="KohilaG"?"Kohila Gümnaasium":sch.k==="MarjG"?"Märjamaa Gümnaasium":sch.k):l.k.replace(/^[il]:/,"");const ix=EDU.inst.findIndex(z=>z.n===nm);return ix>=0?"i:"+ix:"v:"+v;})()});}
  /* ---- viewBox: fookus, sujuv üleminek, suurendus ---- */
  function bboxOf(sv,sel){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;sv.querySelectorAll(sel).forEach(g=>{try{const q=g.getBBox();if(!q.width&&!q.height)return;x0=Math.min(x0,q.x);y0=Math.min(y0,q.y);x1=Math.max(x1,q.x+q.width);y1=Math.max(y1,q.y+q.height);}catch(_){}});return x1>x0?[x0,y0,x1-x0,y1-y0]:null;}
  function target(sv,box){const foc=DOM.some(d=>d.k===PATH[0]),W=box.clientWidth||900,Hh=box.clientHeight||600,nar=W<600;let b=null;
    if(foc&&PATH[1]&&nar)b=bboxOf(sv,`.k9grp, .k9node[data-p="${PATH[0]}/${PATH[1]}"]`);if(!b&&foc)b=bboxOf(sv,".k9f");if(!b)b=bboxOf(sv,":scope>g, :scope>path")||[0,100,1200,900];
    const px=nar?10:22,top=nar?50:56,bot=foc&&!nar?16:12,sc=Math.max(b[2]/(W-2*px),b[3]/(Hh-top-bot)),w=W*sc,h=Hh*sc,cx=b[0]+b[2]/2,cy=b[1]+b[3]/2+(top-bot)/2*sc;return [cx-w/2,cy-h/2,w,h];}
  function applyVB(sv,vb){const k=USER.k,w=vb[2]/k,h=vb[3]/k,x=vb[0]+(vb[2]-w)/2+USER.dx,y=vb[1]+(vb[3]-h)/2+USER.dy;sv.setAttribute("viewBox",[x,y,w,h].map(z=>z.toFixed(1)).join(" "));}
  function setVB(host,sv,vb,animate){TGT=vb;const tok=++ANIM;if(!animate||!CUR||RM()){CUR=vb;applyVB(sv,vb);mini(host);return;}
    const from=CUR.slice(),t0=performance.now(),D=300;const step=t=>{if(tok!==ANIM)return;const p=Math.min(1,(t-t0)/D),q=1-Math.pow(1-p,3);CUR=from.map((f,i)=>f+(vb[i]-f)*q);applyVB(sv,CUR);if(p<1)requestAnimationFrame(step);else mini(host);};requestAnimationFrame(step);}
  function mini(host){const m=host.querySelector(".k9mini");if(!m)return;const ad=DOM.findIndex(d=>d.k===PATH[0]);m.hidden=ad<0&&USER.k===1;if(m.hidden)return;
    m.classList.toggle("right",ad>=0&&!!PATH[1]&&Math.cos(vAng(ad,V.indexOf(PATH[1])))<-0.05||(ad>=0&&!PATH[1]&&Math.cos(ang(ad))<0));
    const sv=host.querySelector(".k9treemap svg"),vb=(sv.getAttribute("viewBox")||"0 0 1 1").split(" ").map(Number);
    let s=`<svg viewBox="-260 60 1720 1000" aria-hidden="true"><path d="M${O[0]},${TB}V${TT}" stroke="${C.mut}" stroke-width="22"/>`;
    DOM.forEach((d,i)=>{const N=dp(i);s+=`<path d="M${O[0]},${O[1]}L${N[0]},${N[1]}" stroke="${d.c}" stroke-width="8" opacity="${ad===i?1:.4}"/><circle cx="${N[0]}" cy="${N[1]}" r="28" fill="${d.c}" opacity="${ad===i?1:.4}"/>`;});
    if(ad>=0)V.forEach((v,j)=>{const P=pt(O,vAng(ad,j),RV);s+=`<circle cx="${P[0]}" cy="${P[1]}" r="18" fill="${VC[v]}" opacity="${PATH[1]&&PATH[1]!==v?.4:1}"/>`;});
    s+=`<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${SEL}" fill-opacity=".08" stroke="${SEL}" stroke-width="12"/></svg>`;m.querySelector(".k9minis").innerHTML=s;}
  function reframe(host){const t=host.querySelector(".k9treemap"),sv=t&&t.querySelector("svg");if(!sv||!t.clientWidth)return;const vb=target(sv,t);CUR=vb;TGT=vb;applyVB(sv,vb);mini(host);}
  function sync(host,opt){opt=opt||{};const t=host.querySelector(".k9treemap"),key=PATH.join("/"),moved=LASTP!==null&&LASTP!==key;
    if(moved)USER={k:1,dx:0,dy:0};
    t.innerHTML=svg();const sv=t.querySelector("svg");
    if(moved&&PATH.length){const pre=key+"/",dep=PATH.length+1;t.querySelectorAll(".k9node").forEach(n=>{const p=n.dataset.p||"";if(p.startsWith(pre)&&p.split("/").length===dep)n.classList.add("k9new");});}
    const vb=target(sv,t);if(moved||opt.reframe||!CUR)setVB(host,sv,vb,moved||opt.reframe);else{TGT=vb;CUR=vb;applyVB(sv,vb);mini(host);}
    LASTP=key;const p=host.querySelector(".k9tpanel");p.innerHTML=panel();host.classList.toggle("has-sel",PATH.length>0);
    if(moved){host.classList.remove("k9min");p.scrollTop=0;}
    const sb=p.querySelector("[data-sheet]");if(sb)sb.textContent=host.classList.contains("k9full")?"Vähenda":host.classList.contains("k9min")?"Näita":"Laienda";
    host.querySelector("[data-tyear]").innerHTML=yr();const r=host.querySelector("#k9treeY");if(r&&+r.value!==yr())r.value=yr();host.querySelector("[data-inf]").setAttribute("aria-pressed",INF);host.querySelectorAll(".k9tbar [data-rmode]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.rmode===RMODE));
    host.querySelector("[data-zoomlvl]").textContent=Math.round(USER.k*100)+"%";}
  function go(host,p,focus){PATH=p?p.split("/"):[];if(PATH[0]&&DOM.some(d=>d.k===PATH[0])&&PATH[1]&&!V.includes(PATH[1]))PATH=[PATH[0]];
    if(PATH[0]==="trunk"&&PATH[1])S.year=+PATH[1];
    sync(host);
    if(focus)requestAnimationFrame(()=>{const n=host.querySelector(`.k9treemap [data-p="${CSS.escape(p)}"]`);(n||host.querySelector(".k9tpanel h3"))?.focus?.({preventScroll:true});});}
  /* v45: suum kursori ümber (hiireratas); punkt kursori all jääb paigale */
  function zoomAt(host,f,cx,cy){const sv=host.querySelector(".k9treemap svg");if(!TGT||!sv)return;const r=sv.getBoundingClientRect(),v=sv.viewBox.baseVal,fx=(cx-r.left)/r.width,fy=(cy-r.top)/r.height,Px=v.x+fx*v.width,Py=v.y+fy*v.height;
    const k=Math.max(1,Math.min(8,USER.k*f));if(k===USER.k)return;const w=TGT[2]/k,h=TGT[3]/k;USER.k=k;if(k===1){USER.dx=0;USER.dy=0;}else{USER.dx=Px-fx*w-TGT[0]-(TGT[2]-w)/2;USER.dy=Py-fy*h-TGT[1]-(TGT[3]-h)/2;}zoom(host,1);}
  function zoom(host,f){USER.k=Math.max(1,Math.min(8,USER.k*f));if(USER.k===1){USER.dx=0;USER.dy=0;}const sv=host.querySelector(".k9treemap svg");if(!TGT)return;CUR=TGT;applyVB(sv,TGT);mini(host);host.querySelector("[data-zoomlvl]").textContent=Math.round(USER.k*100)+"%";host.classList.toggle("k9zoomed",USER.k>1);}
  function fit(host){const g=host.querySelector(".k9tgrid");if(!g)return;if(innerWidth<=760){host.style.removeProperty("--th");return;}const top=g.getBoundingClientRect().top+scrollY;host.style.setProperty("--th",Math.max(460,Math.round(innerHeight-top-14))+"px");}
  function setPW(host,w){PW=Math.max(300,Math.min(640,w));host.style.setProperty("--pw",PW+"px");host.querySelector(".k9tsplit").setAttribute("aria-valuenow",Math.round(PW));}
  K9.tree={
    html(){return `<div class="k9treew"><div class="k9tbar">
        <div class="k9tyear"><p class="k9lbl">Aasta</p><label class="k9rng"><span class="sr">Aasta</span><input type="range" id="k9treeY" min="2015" max="${YN}" step="1" value="${yr()}" aria-label="Arengupuu aasta"><output data-tyear>${yr()}</output></label></div>
        <div class="k9seg k9rmode" role="group" aria-label="Juurte režiim"><button type="button" data-rmode="hist" aria-pressed="true">Ajaloolised juured</button><button type="button" data-rmode="year" aria-pressed="false">Valitud aasta vood</button></div>
        <button type="button" class="k9chip" data-inf aria-pressed="false"><b>Mudeli arvutusseosed</b><small>katkendlikud nooled; mitte põhjuslikkus</small></button>
        <details class="k9tleg"><summary>Märkide tähendus</summary><div class="k9leg">${lg.act(C.ink,"mõõdetud")}${lg.der(C.ink,"tuletatud / hinnang")}${lg.fc(C.ink,"prognoos")}${lg.unc("ink","määramatus (80%)")}${lg.na("andmed puuduvad")}
          <span><svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="4" fill="none" stroke="${C.ink}" stroke-width="1.6"/></svg>väärtus 0</span>
          <span><svg width="30" height="12" aria-hidden="true"><path d="M2,6H28" stroke="${C.ink}" stroke-width="2.4"/></svg>koondnäitaja koosseis (summa)</span>
          <span><svg width="30" height="12" aria-hidden="true"><path d="M2,6H28" stroke="${C.ink}" stroke-width="1.4" stroke-dasharray="5 4"/></svg>seotud, ei kuulu summasse</span>
          <span><svg width="30" height="12" aria-hidden="true"><path d="M2,6H22" stroke="${C.kid}" stroke-width="1.6" stroke-dasharray="5 4"/><path d="M22,2L28,6L22,10Z" fill="${C.kid}"/></svg>mudeli arvutusseos</span>
          <span><svg width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="${C.ink}"/><circle cx="12" cy="12" r="10" fill="none" stroke="${SEL}" stroke-width="2"/></svg>valitud</span>
          <span><svg width="16" height="16" aria-hidden="true">${K9.stGlyph("warn",8,8,4)}</svg>hoiatus (lävend)</span>
          <span>harude paksus ja kumerus ei kanna väärtust</span></div></details></div>
      <div class="k9tgrid"><div class="k9tmapw"><div class="k9treemap"></div>
          <div class="k9tzoom" role="group" aria-label="Suurendus"><button type="button" class="k9btn ghost sm" data-zoom="in" aria-label="Suurenda">+</button><span data-zoomlvl aria-live="polite">100%</span><button type="button" class="k9btn ghost sm" data-zoom="out" aria-label="Vähenda">−</button><button type="button" class="k9btn ghost sm" data-zoom="reset" aria-label="Sobita vaatesse">⤢</button></div>
          <button type="button" class="k9mini" data-p="" hidden aria-label="Tervikvaade: kogu puu"><span class="k9minis"></span><small>Tervikvaade</small></button></div>
        <div class="k9tsplit" role="separator" aria-orientation="vertical" aria-label="Paneeli laius (nooleklahvid)" tabindex="0" aria-valuemin="300" aria-valuemax="640" aria-valuenow="400"></div>
        <aside class="k9tpanel" aria-live="polite" aria-label="Valitud elemendi andmed" tabindex="-1"></aside></div></div>`;},
    bind(host){const map=host.querySelector(".k9treemap"),DRAG={on:false,moved:false};let WACC=1,WRAF=0,WPT=null;
      map.addEventListener("wheel",ev=>{ev.preventDefault();WACC*=ev.deltaY<0?1.15:1/1.15;WPT=[ev.clientX,ev.clientY];if(!WRAF)WRAF=requestAnimationFrame(()=>{WRAF=0;const f=WACC;WACC=1;zoomAt(host,f,WPT[0],WPT[1]);});},{passive:false});
      map.addEventListener("dblclick",ev=>{if(ev.target.closest(".k9node,[data-p],button"))return;zoomAt(host,ev.shiftKey?1/1.6:1.6,ev.clientX,ev.clientY);});
      host.addEventListener("click",ev=>{const gz=ev.target.closest("[data-zoom]");if(gz){const z=gz.dataset.zoom;if(z==="reset"){USER={k:1,dx:0,dy:0};zoom(host,1);}else zoom(host,z==="in"?1.4:1/1.4);return;}
        if(DRAG.moved)return;
        const gg=ev.target.closest("[data-grp]");if(gg){const k=gg.dataset.grp;OPENG[k]=gg.getAttribute("aria-expanded")!=="true";sync(host,{reframe:true});requestAnimationFrame(()=>host.querySelector(`[data-grp="${CSS.escape(k)}"]`)?.focus({preventScroll:true}));return;}
        const b=ev.target.closest("[data-p]");if(b&&host.contains(b)){ev.preventDefault();go(host,b.dataset.p,!!b.closest(".k9tpanel")||ev.detail===0);return;}
        if(ev.target.closest("[data-back]")){const p=PATH.slice(0,-1);if(PATH[0]==="root"||PATH[0]==="trunk")p.length=0;go(host,p.join("/"),true);return;}
        const at=ev.target.closest("[data-atl]");if(at){let c={};try{c=JSON.parse(at.dataset.ctx||"{}");}catch(_){}K9.atlasCtx={...c,o:at.dataset.atl,year:yr(),unit:S.unit};K9.atlasGo&&K9.atlasGo(at.dataset.atl);return;}
        if(ev.target.closest("[data-inf]")){INF=!INF;sync(host);return;}
        const rm=ev.target.closest("[data-rmode]");if(rm){RMODE=rm.dataset.rmode;if(PATH[0]==="root"&&PATH[1]==="sal"&&RMODE==="hist")PATH=["root","mi"];sync(host);requestAnimationFrame(()=>host.querySelector(`[data-rmode="${RMODE}"]`)?.focus());return;}
        if(ev.target.closest("[data-sheet]")){const full=host.classList.contains("k9full"),min=host.classList.contains("k9min");host.classList.toggle("k9full",!full&&!min);host.classList.toggle("k9min",full);const sb=host.querySelector("[data-sheet]");if(sb)sb.textContent=host.classList.contains("k9full")?"Vähenda":host.classList.contains("k9min")?"Näita":"Laienda";}});
      host.addEventListener("keydown",ev=>{const g=ev.target.closest&&ev.target.closest(".k9node");if(g&&(ev.key==="Enter"||ev.key===" ")){ev.preventDefault();if(g.dataset.grp){g.dispatchEvent(new MouseEvent("click",{bubbles:true}));return;}go(host,g.dataset.p,true);return;}
        if(ev.key==="Escape"&&PATH.length){const p=PATH.slice(0,-1);go(host,(PATH[0]==="root"||PATH[0]==="trunk")?"":p.join("/"),true);return;}
        const sp=ev.target.closest&&ev.target.closest(".k9tsplit");if(sp&&(ev.key==="ArrowLeft"||ev.key==="ArrowRight")){ev.preventDefault();setPW(host,(PW||host.querySelector(".k9tpanel").offsetWidth)+(ev.key==="ArrowLeft"?24:-24));reframe(host);}});
      host.addEventListener("input",ev=>{if(ev.target.id==="k9treeY"){S.year=+ev.target.value;sync(host);}});
      map.addEventListener("pointerdown",ev=>{if(USER.k<=1||ev.button!==0)return;DRAG.on=true;DRAG.moved=false;DRAG.x=ev.clientX;DRAG.y=ev.clientY;DRAG.dx=USER.dx;DRAG.dy=USER.dy;});
      addEventListener("pointermove",ev=>{if(!DRAG.on)return;const sv=map.querySelector("svg"),s=sv.viewBox.baseVal.width/map.clientWidth,mx=ev.clientX-DRAG.x,my=ev.clientY-DRAG.y;if(Math.abs(mx)+Math.abs(my)>4)DRAG.moved=true;USER.dx=DRAG.dx-mx*s;USER.dy=DRAG.dy-my*s;applyVB(sv,TGT);mini(host);});
      addEventListener("pointerup",()=>{if(DRAG.on){DRAG.on=false;setTimeout(()=>DRAG.moved=false,0);}});
      const sp=host.querySelector(".k9tsplit");let PW0=null;sp.addEventListener("pointerdown",ev=>{PW0={x:ev.clientX,w:PW||host.querySelector(".k9tpanel").offsetWidth};sp.setPointerCapture(ev.pointerId);});
      sp.addEventListener("pointermove",ev=>{if(PW0)setPW(host,PW0.w-(ev.clientX-PW0.x));});sp.addEventListener("pointerup",()=>{PW0=null;reframe(host);});
      addEventListener("resize",()=>{fit(host);reframe(host);});},
    pending:null,
    update(host){if(K9.tree.pending!=null){PATH=K9.tree.pending?K9.tree.pending.split("/"):[];K9.tree.pending=null;}sync(host);},
    reframe,fit,branches};
  /* ---- valdkonna oks moodulites (valitud aasta väärtused) ---- */
  function branch(dk,W){const d=DOM.find(x=>x.k===dk),Y=yr(),nar=W<600,vals=V.map(v=>domVal(dk,v,Y)),mx=Math.max(...vals.map(x=>Math.abs(curV(x)||0)))||1,R=nar?22:28,kA=x=>Math.max(4,R*Math.sqrt(Math.abs(x)/mx));
    const vy=nar?82:88,Hh=nar?168:170,sy=Hh-26,D0=[nar?24:44,sy],xs=V.map((_,j)=>nar?W*(0.24+j*0.22):210+j*(W-290)/3),per=nar?7:10;
    let s=`<svg viewBox="0 0 ${W} ${Hh}" width="${W}" height="${Hh}" role="group" aria-label="${e(d.n)}: valdkonna oks, ${e(vals[0].lab)}, ${Y}">`;
    const xe=xs[3]+10;s+=`<path d="M${D0[0]},${sy}C${D0[0]+80},${sy+2} ${xe-120},${sy-4} ${xe},${sy-10}" fill="none" stroke="${d.c}" stroke-width="3.5" stroke-opacity=".6" stroke-linecap="round"/>`;
    V.forEach((v,j)=>{const x=xs[j],cv=curV(vals[j]),r=cv==null?11:cv===0?5:kA(cv),t=(x-D0[0])/(xe-D0[0]),by=sy-10*t*t,bx=x-(nar?22:34);
      s+=`<path d="M${bx.toFixed(1)},${by.toFixed(1)}C${(bx+4).toFixed(1)},${(by-18).toFixed(1)} ${(x-r*0.9).toFixed(1)},${(vy+r+14).toFixed(1)} ${(x-r*0.62).toFixed(1)},${(vy+r*0.78).toFixed(1)}" fill="none" stroke="${d.c}" stroke-width="2" stroke-opacity=".6" stroke-linecap="round"/>`;});
    s+=`<a href="#ylevaade/k9-puu" data-tree="${dk}" aria-label="${e(d.n)}: ava arengupuus"><circle class="k9fr" cx="${D0[0]}" cy="${D0[1]}" r="${nar?21:25}"/><circle cx="${D0[0]}" cy="${D0[1]}" r="${nar?17:20}" fill="${C.bg}" stroke="${d.c}" stroke-width="2"/>${icon(d.ico,D0[0],D0[1],nar?15:18,d.c)}</a>`;
    V.forEach((v,j)=>{const x=xs[j],dv=vals[j],cv=curV(dv),r=cv==null?0:cv===0?5:kA(cv),L=allLeaves(dk,v,Y),ok=L.filter(l=>curV(l)!=null).length,na=L.length-ok,sel=S.unit===v,n=ok+na;
      const m=cv==null?missMark(x,vy,11):cv===0?zeroMark(x,vy,VC[v]):mark(x,vy,r,VC[v],dv.cur.st,false,sel?3:1.4);
      const dots=[];for(let q=0;q<n;q++){const cx=x+R*0.35+(q%per)*6,cy=vy+R+9+Math.floor(q/per)*6;dots.push(q<ok?`<circle cx="${cx}" cy="${cy}" r="1.9" fill="${d.c}"/>`:miss(cx,cy,2.2));}
      const top=vy-R-8,last=cv==null&&dv.last?`${dv.last.near?"lähim":"viimane"} ${dv.last.year}: ${dv.fmt(dv.last.v)}`:"";
      s+=`<a href="#ylevaade/k9-puu" data-tree="${dk}/${v}" aria-label="${e(NAME[v])}, ${e(dv.lab)}: ${e(valTxt(dv,Y))}. ${ok} lehte selle aasta väärtusega${na?", "+na+" puudub":""}. Ava arengupuus."><circle class="k9fr" cx="${x}" cy="${vy}" r="${Math.max(r,11)+5}"/>${m}${dots.join("")}
        <text x="${x}" y="${top-(last?30:15)}" text-anchor="middle" style="font:700 ${nar?12:13}px var(--f-body);fill:${VC[v]}">${SHORTN[v]}</text>
        <text x="${x}" y="${top-(last?15:0)}" text-anchor="middle" style="font:600 ${nar?11.5:12.5}px var(--f-num);fill:${cv==null?C.dim:C.ink}">${cv==null?`puudub ${Y}`:e(dv.fmt(cv))}</text>${last?`<text x="${x}" y="${top}" text-anchor="middle" style="font:500 10.5px var(--f-num);fill:${C.dim}">${e(last)}</text>`:""}</a>`;});
    return s+"</svg>";}
  function branches(root){(root||document).querySelectorAll("[data-k9branch]").forEach(el=>{const dk=el.dataset.k9branch,d=DOM.find(x=>x.k===dk);if(!d)return;const dv=domVal(dk,"MAAK",yr());
    el.innerHTML=`<div class="k9bhead"><b>${iconHTML(d.ico,13)} ${d.n} arengupuus</b><span>ringi pindala ∝ ${e(dv.lab)} aastal ${yr()} · ühine mõõtkava · täpid = lehed, millel on selle aasta väärtus (× puudub) · ${SENS[dk]}</span></div>${branch(dk,Math.max(320,K9.wOf(el)))}`;});}
})();
