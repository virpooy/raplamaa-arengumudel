/* ---------- EELARVE: eelarvemosaiik, sild, täitmise kude, tulumaks, kalkulaator, võlakoormus, strateegia ---------- */
(function(){
  const {C,VC,e,n0,mln,pp,sgn,lin,P,stitch,tri,lg,fig,sec,tipAttr,tipHTML,table,moveInto,yGrid,thread}=K9;
  const yrs=(a,b)=>{const r=[];for(let y=a;y<=b;y++)r.push(y);return r;};
  const fy=(u,k,y)=>{const v=finY(u,k,y);return v==null?null:v;};
  const TILE=100000,Y25=2025,neg=v=>v==null?null:-v;
  /* ======== EELARVEMOSAIIK ======== */
  function parts(u,y){const inc=fy(u,"n1",y),cost=-fy(u,"n19",y),res=fy(u,"n29",y);
    const R=[["Tulumaks",fy(u,"n3",y),C.tax,"tax"],["Maamaks",fy(u,"n4",y),C.land,"land"],["Kaubad ja teenused",fy(u,"n9",y),C.sale,"sale"],["Toetusfond",fy(u,"n12",y),C.fund,"fund"],["Tasandusfond",fy(u,"n11",y),C.eq,"eq"]];R.push(["Muud tulud ja toetused",inc-R.reduce((s,x)=>s+(x[1]||0),0),C.moth,"moth"]);
    const K=[["Personalikulud",-fy(u,"n26",y),C.staff,"staff"],["Majandamiskulud",-fy(u,"n27",y),C.op,"op"],["Antavad toetused",-fy(u,"n20",y),C.grant,"grant"]];K.push(["Muud kulud",cost-K.reduce((s,x)=>s+(x[1]||0),0),C.coth,"coth"]);
    return {inc,cost,res,R,K};}
  /* Mosaiik: mõlemal paneelil sama tervik T = max(tulud, kulud). Tulem = tulud − kulud (ümardamata RR300 summadest).
     Positiivne tulem: vasak = tululiigid, parem = kululiigid + tulem. Negatiivne: vasak = tululiigid + puudujääk, parem = kululiigid.
     Ruute kokku N = round(T/100 000); liikidele jaotatakse suurima jäägi meetodil, seega liikide ruudud annavad kokku N. */
  function mosaic(u,W){const narrow=W<760,d=parts(u,Y25),ts=narrow?6:8,gp=1.6,colW=narrow?W:(W-40)/2,per=Math.max(10,Math.floor((colW-10)/(ts+gp)));
    const res=d.inc-d.cost,T=Math.max(d.inc,d.cost),N=Math.round(T/TILE);
    const L=d.R.map(x=>({n:x[0],v:x[1],col:x[2],k:x[3],den:d.inc,dl:"tuludest"})),Rr=d.K.map(x=>({n:x[0],v:x[1],col:x[2],k:x[3],den:d.cost,dl:"kuludest"}));
    if(res>=0)Rr.push({n:"Põhitegevuse tulem",v:res,col:C.gain,k:"gain",den:d.inc,dl:"tuludest",kind:"res"});else L.push({n:"Puudujääk: kulud üle tulude",v:-res,col:C.crit,k:"crit",den:d.cost,dl:"kuludest",kind:"def"});
    const side=(arr,title,x0)=>{const cnt=K9.apportion(arr.map(g=>g.v),TILE);let idx=0,s="";const top=30,rowsN=Math.ceil(N/per),mh=rowsN*(ts+gp);
      s+=`<text x="${x0}" y="16" class="t-cap" style="fill:${C.ink}">${title}</text>`;
      arr.forEach((g,gi)=>{g.cnt=cnt[gi];g.first=idx;for(let i=0;i<cnt[gi];i++,idx++){const r=Math.floor(idx/per),c=idx%per,x=x0+c*(ts+gp),y=top+r*(ts+gp);
          s+=g.kind==="def"?`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${ts}" height="${ts}" fill="url(#x-crit)" stroke="${C.crit}" stroke-width=".8"/>`:g.kind==="res"?`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${ts}" height="${ts}" fill="${C.gain}"/>`:`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${ts}" height="${ts}" fill="url(#t-${g.k})"/>`;}
        g.last=idx-1;});
      arr.forEach(g=>{if(g.last<g.first)return;const r0=Math.floor(g.first/per),r1=Math.floor(g.last/per);s+=`<rect x="${x0}" y="${top+r0*(ts+gp)}" width="${per*(ts+gp)}" height="${(r1-r0+1)*(ts+gp)}" fill="transparent"${tipAttr(tipHTML(`${g.n} ${Y25}`,[["summa",mln(g.v)],["osa "+g.dl,pp(g.v/g.den)],["ruute",String(g.cnt)]],"RR300, täitmine"))}/>`;});
      return {s,h:top+mh,groups:arr};};
    const tR=`TULUD ${mln(d.inc)}`+(res<0?` + PUUDUJÄÄK ${mln(-res)} = ${mln(T)}`:""),tK=res>=0?`KULUD ${mln(d.cost)} + TULEM ${mln(res)} = ${mln(T)}`:`KULUD ${mln(d.cost)}`;
    const A=side(L,tR,0),B=side(Rr,tK,narrow?0:colW+40);
    const listY=narrow?null:Math.max(A.h,B.h)+18;let H,s="";
    const sw=g=>g.kind==="def"?`fill="url(#x-crit)" stroke="${C.crit}"`:g.kind==="res"?`fill="${C.gain}"`:`fill="url(#t-${g.k})" stroke="${g.col}"`;
    const list=(gs,x0,y0)=>gs.map((g,i)=>`<g transform="translate(${x0},${y0+i*18})"><rect y="-10" width="12" height="12" ${sw(g)}/><text x="16" y="0" class="t-labm" style="fill:${C.ink}">${e(g.n)}</text><text x="${colW-4}" y="0" text-anchor="end" class="t-num">${mln(g.v)} · ${nf0.format(g.v/g.den*100)}% ${g.dl}</text></g>`).join("");
    if(narrow){const oB=A.h+18+A.groups.length*18+24;s=A.s+list(A.groups,0,A.h+16)+`<g transform="translate(0,${oB})">${B.s}${list(B.groups,0,B.h+16)}</g>`;H=oB+B.h+16+B.groups.length*18+6;}
    else{s=A.s+B.s+list(A.groups,0,listY)+list(B.groups,colW+40,listY);H=listY+Math.max(A.groups.length,B.groups.length)*18+4;}
    return {svg:`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(NAME[u])} eelarve ${Y25}: tulud ${mln(d.inc)}, kulud ${mln(d.cost)}, ${res>=0?"põhitegevuse tulem "+mln(res):"puudujääk "+mln(-res)}. 1 ruut = 100 000 €, ruute kokku ${N}.">${s}</svg>`,d,res,N,T};}
  /* ======== SILD ======== */
  function bridge(u,W){const y=Y25,st=[["Tulud",fy(u,"n1",y),"t"],["Kulud",fy(u,"n19",y),"d"],["Põhi-|tegevuse|tulem",fy(u,"n29",y),"t"],["Investeeri-|mine",fy(u,"n30",y),"d"],["Eelarve|tulem",fy(u,"n43",y),"t"],["Laenud",fy(u,"n45",y),"d"],["Tagasi-|maksed",fy(u,"n46",y),"d"]];
    const end=fy(u,"n43",y)+fy(u,"n45",y)+fy(u,"n46",y);st.push(["Pärast|laene",end,"t"]);
    let run=0;const bars=st.map(([n,v,t])=>{let a,b;if(t==="t"){a=0;b=v;run=v;}else{a=run;b=run+v;run=b;}return {n,v,t,a,b};});
    const narrow=W<640,L=narrow?40:56,R=10,T=20,H=narrow?330:330,B=narrow?96:64,lo=Math.min(0,...bars.map(x=>Math.min(x.a,x.b))),hi=Math.max(...bars.map(x=>Math.max(x.a,x.b))),nk=nice(lo,hi,5),Y=lin(nk.lo,nk.hi,H-B,T),bw=(W-L-R)/bars.length;
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(NAME[u])} eelarve sild ${y}: tuludest kassa muutuseni.">`+yGrid(Y,nk.t,L,W-R,v=>nf1.format(v/1e6));
    s+=`<text x="${L}" y="${T-8}" class="t-cap">MLN € · RR300 ${y} TÄITMINE</text>`;
    bars.forEach((x,i)=>{const X0=L+i*bw+bw*.16,w=bw*.68,top=Y(Math.max(x.a,x.b)),h=Math.max(1.5,Math.abs(Y(x.a)-Y(x.b))),pos=x.v>=0,col=x.t==="t"?(pos?C.ink:C.loss):(pos?C.gain:C.loss);
      s+=`<rect x="${X0}" y="${top}" width="${w}" height="${h}" fill="${x.t==="t"?col:col}" fill-opacity="${x.t==="t"?.92:.85}"${tipAttr(tipHTML(`${x.n.replace("-|","").replace("|"," ")} ${y}`,[["summa",(pos?"":"−")+mln(Math.abs(x.v))]],"ametlik"))}/>`;
      if(x.t!=="t")s+=`<text x="${X0+w/2}" y="${pos?top-18:top+h+14}" text-anchor="middle" class="t-ax" style="fill:${col}">${pos?"▲":"▼"}</text>`;
      if(i<bars.length-1)s+=`<line x1="${X0+w}" x2="${X0+bw}" y1="${Y(x.b)}" y2="${Y(x.b)}" stroke="${C.mut}" stroke-dasharray="2 2"/>`;
      s+=`<text x="${X0+w/2}" y="${pos?top-5:top+h+26}" text-anchor="middle" class="t-num" style="font-size:11px">${pos?"":"−"}${nf1.format(Math.abs(x.v)/1e6)}</text>`;
      const words=x.n.split("|");if(narrow)s+=`<text transform="translate(${X0+w/2},${H-B+12}) rotate(-50)" text-anchor="end" class="t-ax">${x.n.replace("-|","").replace("|"," ")}</text>`;else s+=`<text x="${X0+w/2}" y="${H-B+18}" text-anchor="middle" class="t-ax">${words.map((wd,j)=>`<tspan x="${X0+w/2}" dy="${j?12:0}">${wd}</tspan>`).join("")}</text>`;});
    return s+"</svg>";}
  /* ======== KUUKANGAS ======== */
  const MON=["jaan","veebr","märts","apr","mai","juuni","juuli","aug","sept","okt","nov","dets"];
  function months(u,W){const a25=u==="MAAK"?new Array(12).fill(0).map((_,i)=>sumA(V.map(v=>MTA.tm25[v][i]))):MTA.tm25[u],a26=TAX[u].mon26,narrow=W<640,L=narrow?36:50,R=8,T=22,H=narrow?230:260,B=28;
    const nk=nice(0,Math.max(...a25,...a26),4),Y=lin(0,nk.hi,H-B,T),cw=(W-L-R)/12,bw=cw*.36;let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(NAME[u])} tulumaks kuude kaupa 2025 ja 2026.">`+yGrid(Y,nk.t,L,W-R,v=>nf1.format(v/1e6));
    s+=`<text x="${L}" y="${T-8}" class="t-cap">MLN € KUUS</text>`;
    MON.forEach((m,i)=>{const x=L+i*cw+cw*.12,est=i>=9;s+=`<rect x="${x}" y="${Y(a25[i])}" width="${bw}" height="${Y(0)-Y(a25[i])}" fill="${C.ref}" fill-opacity=".55"${tipAttr(tipHTML(`${m} 2025`,[["laekus",n0(a25[i])+" €"]],"MTA, ametlik"))}/>`;
      s+=`<rect x="${x+bw+2}" y="${Y(a26[i])}" width="${bw}" height="${Y(0)-Y(a26[i])}" ${est?K9.fcArea(VC[u]):`fill="${VC[u]}"`}${tipAttr(tipHTML(`${m} 2026${est?" · hinnang":""}`,[[est?"hinnang":"laekus",n0(a26[i])+" €"],["vs 2025",pct(a26[i]/a25[i]-1)]],est?"IV kv = 2025 kuu × jaan–sept kasvutempo":"MTA, ametlik"))}/>`;
      if(!narrow||i%2===0)s+=`<text x="${L+i*cw+cw/2}" y="${H-8}" text-anchor="middle" class="t-ax">${m}</text>`;});
    return s+"</svg>";}
  /* ======== STRATEEGIA KUDE ======== */
  function strat(v,W){const b=BUD[v],narrow=W<640,L=narrow?40:56,R=narrow?10:120,T=26,H=narrow?280:300,B=46,vals=[...b.res,...b.capex.map(x=>-x),...b.liq],nk=nice(Math.min(0,...vals),Math.max(...vals),5),Y=lin(nk.lo,nk.hi,H-B,T),cw=(W-L-R)/b.y.length,bw=cw*.28;
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(NAME[v])} eelarvestrateegia: põhitegevuse tulem, investeeringud ja likviidsed varad.">`+yGrid(Y,nk.t,L,W-R,x=>nf1.format(x/1e6));
    s+=`<text x="${L}" y="${T-10}" class="t-cap">MLN € · ${e(b.doc.toUpperCase())}${b.st==="eelnõu"?" (EELNÕU)":""}</text>`;
    const lp=[];b.y.forEach((y,i)=>{const cx=L+i*cw+cw/2,act=b.lab[i]==="täitmine",r=b.res[i],c=-b.capex[i];
      if(!act)s+=`<rect x="${L+i*cw}" y="${T}" width="${cw}" height="${H-B-T}" fill="url(#k9fc)"/>`;
      s+=`<rect x="${cx-bw-1}" y="${Math.min(Y(0),Y(r))}" width="${bw}" height="${Math.abs(Y(r)-Y(0))}" ${act?`fill="${r>=0?C.gain:C.loss}"`:K9.fcArea(r>=0?C.gain:C.loss)}${tipAttr(tipHTML(`${y} · ${b.lab[i]}`,[["põhitegevuse tulem",mln(r)]],b.doc))}/>`;
      s+=`<rect x="${cx+1}" y="${Y(0)}" width="${bw}" height="${Math.abs(Y(c)-Y(0))}" ${act?`fill="${C.sc}"`:K9.fcArea(C.sc)}${tipAttr(tipHTML(`${y} · ${b.lab[i]}`,[["põhivara soetus",mln(b.capex[i])],["sh toetustest",b.grant&&b.grant[i]!=null?mln(b.grant[i]):"puudub"]],b.doc))}/>`;
      lp.push([cx,Y(b.liq[i]),act,b.liq[i],y,b.lab[i]]);
      s+=`<text x="${cx}" y="${H-B+16}" text-anchor="middle" class="t-ax"${act?` style="fill:${C.ink}"`:""}>${y}</text><text x="${cx}" y="${H-B+29}" text-anchor="middle" class="t-ax" style="font-size:9.5px">${b.lab[i]}</text>`;});
    const ai=lp.filter(p=>p[2]),fi=lp.filter(p=>!p[2]);if(ai.length&&fi.length)fi.unshift(ai[ai.length-1]);
    s+=thread(ai.map(p=>[p[0],p[1]]),C.kid,{w:2.2})+thread(fi.map(p=>[p[0],p[1]]),C.kid,{w:2.2,fc:true});
    lp.forEach(p=>s+=stitch(p[0],p[1],4,C.kid,!p[2],tipAttr(tipHTML(`${p[4]} · ${p[5]}`,[["likviidsed varad aasta lõpus",mln(p[3])]],b.doc))));
    if(!narrow){const l=lp[lp.length-1];s+=`<text x="${l[0]+10}" y="${l[1]+4}" class="t-labm" style="fill:${C.kid}">raha ${mln(l[3])}</text>`;}
    return s+"</svg>";}
  /* ======== VAADE ======== */
  /* v46: hinnaalus. Jooksevhinnad = nominaalsed eurod. Püsivhinnad = 2025. aasta hindades: ajalugu THI järgi (Statistikaamet IA002, aastakeskmine), tulevik kasutaja inflatsioonieeldusega. */
  let PB="cur",INFL=2.0;const CPIo={};const CPI=new Proxy(CPIo,{get:(t,k)=>((window.ECON&&ECON.cpi)||{})[k]});
  const PF=y=>{if(PB==="cur")return 1;if(y<=2025)return CPI[String(y)]?CPI["2025"]/CPI[String(y)]:null;return 1/Math.pow(1+INFL/100,y-2025);};
  const pv=(y,v)=>{const f=PF(y);return v==null||f==null?null:v*f;};
  const pbLab=()=>PB==="cur"?"jooksevhindades":`2025. a hindades (inflatsioon 2026+ ${nf1.format(INFL)}%/a)`;
  const pbCtl=()=>`<div class="k9seg" role="group" aria-label="Hinnaalus"><button type="button" data-pb="cur" aria-pressed="${PB==="cur"}">Jooksevhinnad</button><button type="button" data-pb="const" aria-pressed="${PB==="const"}">Püsivhinnad (2025)</button></div>${PB==="const"?`<label class="k9pbinf">Inflatsioonieeldus 2026+ <input type="number" min="-2" max="15" step="0.1" value="${INFL}" data-infl aria-label="Inflatsioonieeldus protsentides aastas"> % aastas</label>`:""}`;
  const pbNote=()=>PB==="cur"?"Jooksevhinnad: nominaalsed eurod, inflatsiooni ei ole maha arvatud.":`Püsivhinnad, baasaasta 2025: ajalugu 2016–2025 on korrigeeritud tarbijahinnaindeksiga (Statistikaamet IA002, aastakeskmine; 2016→2025 ×${nf1.format(CPI["2025"]/CPI["2016"])}), tulevik kasutaja inflatsioonieeldusega ${nf1.format(INFL)}% aastas (vaikimisi 2,0% = Euroopa Keskpanga keskpika perioodi hinnastabiilsuse eesmärk; muudetav). Mudeli palgakasvu eeldus (${nf1.format(S.wage)}% aastas) on nominaalne, seega reaalne palgakasv ≈ ${nf1.format(S.wage-INFL)}%.`;
  K9.VIEWS.eelarve={
    build(el){el.innerHTML=`<div class="k9intro"><div><p class="kick">Eelarve</p><h1>Kuidas muutus mõjutab eelarvet?</h1><a class="k9treelink" href="#ylevaade/k9-puu" data-tree="bud">⟡ Ava arengupuus</a></div><p class="lead" data-k9="lead"></p></div><div class="k9branches"><div class="k9branch" data-k9branch="bud"></div></div>
      <nav class="k9sub" aria-label="Eelarve alajaotused"><a href="#eelarve/k9-mos">Eelarvemosaiik</a><a href="#eelarve/k9-tm">Tulumaks</a><a href="#eelarve/k9-reg">Sissekirjutus</a><a href="#eelarve/k9-volg">Võlakoormus ja strateegiad</a></nav>
      ${sec("k9-mos","Tulud, kulud ja tulem "+Y25,"Iga ruut on 100 000 €. Vasakul tulud, paremal kulud ja nende vahe (põhitegevuse tulem). Mõlemal poolel on sama palju ruute: tulud = kulud + tulem.",`<div data-k9="mos"></div><div class="k9grid2"><div data-k9="bridge"></div><div data-k9="exec"></div></div><div class="k9moved" data-k9="budmv"></div>`)}
      ${sec("k9-tm","Tulumaks","Kuude kaupa 2025 ja 2026 (MTA) ning pikk niit 2017–2036. 2026. aasta oktoober–detsember on hinnang.",`<div class="k9grid2"><div data-k9="mon"></div><div data-k9="taxl"></div></div><div data-k9="taxv"></div><div class="k9moved" data-k9="taxmv"></div>`)}
      ${sec("k9-reg","Registreeritud elukoha mõju (sissekirjutus ja registriparandused)","Kalkulaator kehtib valitud omavalitsusele ega muuda rahvastikuprognoosi.",`<div class="k9moved k9calc" data-k9="regmv"></div>`)}
      ${sec("k9-volg","Võlakoormus ja eelarvestrateegiad","Netovõlakoormus = laenud miinus likviidsed varad, protsendina põhitegevuse tuludest. Täis pisted on täitmine, avatud pisted strateegia või eelarve.",`<div class="k9grid2"><div data-k9="debt"></div><div data-k9="strat"></div></div><div class="k9moved" data-k9="stratmv"></div>`)}`;
      const nx=id=>{const t=document.getElementById(id);return t?t.closest(".tablewrap"):null;},pm=n=>{const r=[];let x=n&&n.nextElementSibling;while(x&&x.classList.contains("pmeta")){r.push(x);x=x.nextElementSibling;}return r;};
      const bm=el.querySelector('[data-k9="budmv"]'),bw=nx("budBody");if(bw){const ps=pm(bw);const d=document.createElement("details");d.className="k9det";d.innerHTML="<summary>Valdade eelarve täitmise tabel 2025</summary>";d.appendChild(bw);ps.forEach(p=>d.appendChild(p));bm.appendChild(d);}
      moveInto(el.querySelector('[data-k9="taxmv"]'),[["#taxCards"]]);
      const rp=document.getElementById("regPanel"),rm=el.querySelector('[data-k9="regmv"]');if(rp)[...rp.children].forEach(c=>{if(!c.classList.contains("panel-head"))rm.appendChild(c);});
      const sm=el.querySelector('[data-k9="stratmv"]'),sw=nx("stratBody");if(sw){const ps=pm(sw);sm.appendChild(sw);ps.forEach(p=>sm.appendChild(p));}moveInto(sm,[["#stratCards"]]);
      el.addEventListener("click",ev=>{const b=ev.target.closest("[data-pb]");if(b){PB=b.dataset.pb;K9.VIEWS.eelarve.update(el);}});
      el.addEventListener("change",ev=>{if(ev.target.matches("[data-infl]")){const v=parseFloat(String(ev.target.value).replace(",","."));if(isFinite(v)&&v>=-2&&v<=15){INFL=v;ev.target.removeAttribute("aria-invalid");K9.VIEWS.eelarve.update(el);}else{ev.target.setAttribute("aria-invalid","true");ev.target.title="Sisesta arv vahemikus −2 … 15";}}});},
    update(el){const u=S.unit,q=k=>el.querySelector(`[data-k9="${k}"]`),w=k=>K9.wOf(q(k)),inc=fy(u,"n1",Y25),res=fy(u,"n29",Y25),vs=u==="MAAK"?V:[u];
      const np=netPct(u,2026);el.querySelector('[data-k9="lead"]').innerHTML=`${NAME[u]} ${Y25}: põhitegevuse tulud <b>${mln(inc)}</b>, tulem ${mln(res)} (${pct(res/inc)} tuludest). Netovõlakoormus 2026: <b>${isFinite(np)?nf0.format(np*100)+"%":"puudub"}</b> (seaduse üldine ülemmäär 60%).`;
      const m=mosaic(u,w("mos"));
      q("mos").innerHTML=fig({title:m.res>=0?`Igast tulueurost jäi ${Y25}. aastal pärast igapäevakulusid ${nf0.format(m.res/m.d.inc*100)} senti · ${NAME[u]}`:`${Y25}. aastal ületasid kulud tulusid ${mln(-m.res)} · ${NAME[u]}`,
        read:`Mõlemas paneelis on sama tervik: ${m.N} ruutu × 100 000 € ≈ ${mln(m.T)}.`,
        legend:[lg.tex("tax","tulumaks"),lg.tex("land","maamaks"),lg.tex("sale","kaubad ja teenused"),lg.tex("fund","toetusfond"),lg.tex("eq","tasandusfond"),lg.tex("moth","muud tulud"),lg.tex("staff","personal"),lg.tex("op","majandamine"),lg.tex("grant","antud toetused"),lg.tex("coth","muud kulud"),lg.sq(C.gain,"põhitegevuse tulem"),lg.def("puudujääk (kui kulud ületavad tulusid)")],body:m.svg,
        src:"Statistikaamet RR300 (KOV eelarvete täitmine 2025). Kululiikide jaotus RR300 ridade järgi (personali-, majandamis- ja antud toetuste kulud).",
        method:`Summad on arvutatud ümardamata RR300 andmetest (tuh €), vormindatud alles kuvamisel. Tulem = põhitegevuse tulud − põhitegevuse kulud = ${mln(m.res)}; RR300 eraldi tulemi rida on ${mln(m.d.res)} (vahe tuleneb allika tuhandeni ümardamisest). Iga ruut = 100 000 €; ruute kokku = ümardatud tervik, liikide vahel jaotatud suurima jäägi meetodil. Tululiikide osakaal on arvutatud tuludest, kululiikide osakaal kuludest, tulemi osakaal tuludest.`,
        table:table(["Liik","Summa","Osakaal","Ruute"],[...m.d.R.map(x=>["Tulud: "+x[0],mln(x[1]),pp(x[1]/m.d.inc)+" tuludest",""]),["Põhitegevuse tulud kokku",mln(m.d.inc),"100% tuludest",""],...m.d.K.map(x=>["Kulud: "+x[0],mln(x[1]),pp(x[1]/m.d.cost)+" kuludest",""]),["Põhitegevuse kulud kokku",mln(m.d.cost),"100% kuludest",""],["Tulem (tulud − kulud)",mln(m.res),pp(m.res/m.d.inc)+" tuludest",""],["Mosaiigi tervik",mln(m.T),"",String(m.N)]],{textCols:[0,2]})});
      q("bridge").innerHTML=fig({title:`Eelarve sild ${Y25}`,read:"Tuludest kassa muutuseni: täis tulbad on vahesummad, ▲ lisab, ▼ võtab ära.",legend:[lg.sq(C.ink,"vahesumma"),lg.sq(C.gain,"lisandub"),lg.sq(C.loss,"väheneb")],body:bridge(u,w("bridge")),src:"RR300"});
      const Y=yrs(2016,Y25),der=[2016,2017].filter(y=>K9.finSrc(u,"n19",y).includes("RR30")||K9.finSrc(u,"n19",y)==="valdade summa");
      q("exec").innerHTML=fig({title:`Eelarve täitmine 2016–${Y25} · ${pbLab()}`,ctl:pbCtl(),read:"Tulude ja kulude vahe (toon) on põhitegevuse tulem. Kõik aastad on täitmine. 2016–2017 kulud on enne haldusreformi eelkäijate summa (tuletatud, pool-täidetud märk). "+pbNote(),legend:[lg.act(C.tax,"põhitegevuse tulud"),lg.act(C.staff,"põhitegevuse kulud"),lg.sq(C.gain,"vahe = põhitegevuse tulem"),lg.act(C.sc,"põhivara soetus")],
        body:K9.lines({W:w("exec"),x0:2016,x1:Y25,zero:true,fmt:v=>nf1.format(v/1e6),tfmt:v=>mln(v),unitLab:"MLN €",label:"Eelarve täitmine",bands:[{k:"gain",col:C.gain,name:"põhitegevuse tulem",pts:Y.filter(y=>fy(u,"n19",y)!=null&&fy(u,"n1",y)!=null).map(y=>[y,pv(y,-fy(u,"n19",y)),pv(y,fy(u,"n1",y))])}],
          series:[{name:"tulud",col:C.tax,pts:Y.map(y=>[y,pv(y,fy(u,"n1",y))]),endLab:"tulud "+mln(inc)},{name:"kulud",col:C.staff,der,pts:Y.map(y=>[y,pv(y,neg(fy(u,"n19",y)))]),endLab:"kulud "+mln(-fy(u,"n19",Y25))},{name:"põhivara soetus",col:C.sc,pts:Y.map(y=>[y,pv(y,neg(fy(u,"n32",y)))]),w:1.6,endLab:"invest. "+mln(-fy(u,"n32",Y25))}]}),src:"RR300 (2016–2017 puuduvad read RR30, eelkäijate summa); vt Andmed → katvus",note:Y.some(y=>fy(u,"n19",y)==null)?"Katkenud niit: selle aasta kulude rida RR300 andmestikus puudub (mitte null).":"",
        table:K9.ytable(Y,[{h:"Tulud",f:y=>mln(pv(y,fy(u,"n1",y)))},{h:"Kulud",f:y=>mln(pv(y,neg(fy(u,"n19",y))))},{h:"Tulem",f:y=>mln(pv(y,fy(u,"n29",y)))},{h:"Põhivara soetus",f:y=>mln(pv(y,neg(fy(u,"n32",y))))}].map(c=>({...c,h:c.h+(PB==="cur"?" (jooksevhinnad)":" (2025. a hindades)")})))});
      q("mon").innerHTML=fig({title:`Tulumaks kuude kaupa · ${NAME[u]}`,read:`Jaanuar–september 2026 laekus ${pct(TAX[u].g-1)} rohkem kui aasta varem. Viirutatud kuud on hinnang samas kasvutempos.`,legend:[lg.sq(C.ref,"2025"),lg.sq(VC[u],"2026 laekunud"),lg.fcsq(VC[u],"2026 hinnang (prognoos)")],body:months(u,w("mon")),src:"Maksu- ja Tolliamet",
        table:table(["Kuu","2025","2026"],MON.map((mm,i)=>{const a25=u==="MAAK"?sumA(V.map(v=>MTA.tm25[v][i])):MTA.tm25[u][i];return [mm,n0(a25)+" €",n0(TAX[u].mon26[i])+" €"+(i>=9?" (hinnang)":"")];}),{textCols:[0]})});
      const ts=taxSeries(u),TY=yrs(2017,YN);
      q("taxl").innerHTML=fig({title:`Tulumaks 2017–2036 · ${NAME[u]} · ${pbLab()}`,ctl:pbCtl(),read:"Prognoos arvestab palgakasvu, tööhõivet ja 20–64-aastaste arvu. 2026 on tuletatud (jaan–sept + hinnang). "+pbNote(),legend:[lg.act(VC[u],"laekumine (RR300)"),lg.der(VC[u],"2026: jaan–sept + hinnang"),lg.fc(VC[u],"prognoos")],
        body:K9.lines({W:w("taxl"),x0:2017,x1:YN,zero:true,fmt:v=>nf1.format(v/1e6),tfmt:mln,unitLab:"MLN €",label:"Tulumaksu laekumine",series:[{name:"tulumaks",col:VC[u],pts:TY.map(y=>[y,pv(y,ts[y])]),fc:START,der:[START],endLab:mln(pv(YN,ts[YN]))}]}),src:"RR300, MTA, kohortmudel v6"+(PB==="const"?"; Statistikaamet IA002":""),
        table:K9.ytable(TY,[{h:"Tulumaks, jooksevhinnad",f:y=>mln(ts[y])},{h:"2025. a hindades",f:y=>mln(pv(y,ts[y])*(PB==="cur"?NaN:1))}].filter((c,i)=>i===0||PB==="const"))});
      const TT=Object.fromEntries(V.map(v=>[v,taxSeries(v)]));
      q("taxv").innerHTML=fig({title:`Valdade tulumaks elaniku kohta 2017–2036 · ${pbLab()}`,read:"Sama skaala kõigile valdadele. Elaniku kohta, et erineva suurusega valdu saaks võrrelda. "+pbNote(),legend:V.map(v=>lg.act(VC[v],SHORTN[v])),
        body:K9.lines({W:w("taxv"),H:250,x0:2017,x1:YN,fmt:v=>f0(v),tfmt:v=>f0(v)+" €",unitLab:"€ ELANIKU KOHTA",label:"Tulumaks elaniku kohta",series:V.map(v=>({name:SHORTN[v],col:VC[v],pts:TY.map(y=>[y,pv(y,TT[v][y]/popT(v,y))]),fc:START,w:S.unit===v?3:1.8,op:S.unit==="MAAK"||S.unit===v?1:.4,r:2.2,endLab:SHORTN[v]+" "+f0(pv(YN,TT[v][YN]/popT(v,YN)))+" €"}))}),src:"RR300, MTA, kohortmudel v6",
        table:K9.ytable(TY,V.map(v=>({h:SHORTN[v],f:y=>f0(pv(y,TT[v][y]/popT(v,y)))+" €"})))});
      // võlakoormus
      const ser=V.map(v=>{const B_=BUD[v],last=B_.y[B_.lab.lastIndexOf("täitmine")];return {name:SHORTN[v],col:VC[v],pts:B_.y.map((y,i)=>[y,B_.net[i]/B_.inc[i]]),fc:last,w:S.unit===v?3:1.9,op:S.unit==="MAAK"||S.unit===v?1:.35,endLab:SHORTN[v]+" "+nf0.format(B_.net[B_.y.length-1]/B_.inc[B_.y.length-1]*100)+"%"};});
      const sv=u==="MAAK"?"Rapla":u,cap=BUD[sv].cap,capS=cap&&cap.some(x=>x!=null)?[{name:"individuaalne ülemmäär ("+SHORTN[sv]+")",col:C.crit,pts:BUD[sv].y.map((y,i)=>[y,cap[i]!=null?cap[i]/BUD[sv].inc[i]:null]),w:1.2,noStitch:true,fc:true,dash:"1 3",endLab:"ülemmäär "+SHORTN[sv]}]:[];
      q("debt").innerHTML=fig({title:"Netovõlakoormus eelarvestrateegiates",read:"60% on kohaliku omavalitsuse finantsjuhtimise seaduse üldine ülemmäär; kõrgem individuaalne ülemmäär kehtib, kui põhitegevuse tulem on piisav. 50% on selle mudeli hoiatusjoon, mitte seadus.",
        legend:[lg.act(C.ink,"täitmine"),lg.fc(C.ink,"eeldatav / eelarve / prognoos"),lg.thr(C.crit,"seaduse üldine ülemmäär 60%"),lg.thr(C.warn,"mudeli hoiatus 50%")],
        body:K9.lines({W:w("debt"),x0:2024,x1:2030,zero:true,warp:false,fmt:v=>nf0.format(v*100)+"%",label:"Netovõlakoormus",thr:[{v:.6,lab:"60% · KOFS üldine ülemmäär (seadus)",col:C.crit},{v:.5,lab:"50% · mudeli hoiatus",col:C.warn}],series:[...ser,...capS]}),src:"valdade eelarvestrateegiad (Rapla, Kohila kehtivad; Märjamaa, Kehtna eelnõud), KOFS § 34",
        table:table(["Vald","Dokument",...yrs(2024,2030).map(String)],V.map(v=>{const B_=BUD[v];return [NAME[v],`${e(B_.doc)} (${B_.st})`,...yrs(2024,2030).map(y=>{const i=B_.y.indexOf(y);return i<0?"–":nf0.format(B_.net[i]/B_.inc[i]*100)+"% "+(B_.lab[i]==="täitmine"?"":"*");})];}),{textCols:[1]})});
      q("strat").innerHTML=fig({title:`Eelarvestrateegia · ${NAME[sv]}`,kick:u==="MAAK"?"maakonna vaates näidatakse Rapla valda":"",read:"Roheline tulp üles = põhitegevuse tulem, sinine tulp alla = põhivara soetus, kollane joon = raha aasta lõpus. Hele tulp katkendliku servaga ja avatud märk = plaan.",
        legend:[lg.sq(C.gain,"põhitegevuse tulem"),lg.sq(C.sc,"põhivara soetus"),lg.act(C.kid,"likviidsed varad"),lg.fcsq(C.ink,"plaan / prognoos")],body:strat(sv,w("strat")),src:`<a href="${BUD[sv].url}" target="_blank" rel="noopener">${e(BUD[sv].doc)}</a> · ${e(BUD[sv].act)}`,
        table:table(["Aasta","Staatus","Tulem","Investeeringud","Likviidsed varad","Netovõlg"],BUD[sv].y.map((y,i)=>[String(y),BUD[sv].lab[i],mln(BUD[sv].res[i]),mln(BUD[sv].capex[i]),mln(BUD[sv].liq[i]),mln(BUD[sv].net[i])]),{textCols:[1]})});},
  };
})();
