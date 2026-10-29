/* ---------- TEENUSED: mõõtmise redel, nõudluse muutus, koolid lävendi suhtes, laste arv, teenusemahu maksumus ---------- */
(function(){
  const {C,VC,e,n0,mln,pp,sgn,lin,P,stitch,tri,stGlyph,pill,lg,fig,sec,tipAttr,tipHTML,table,moveInto,fcArea,miss,iconHTML}=K9;
  const yrs=(a,b)=>{const r=[];for(let y=a;y<=b;y++)r.push(y);return r;};
  const SV=[["la","Lasteaed","last",C.la],["sc","Kool (oma koolid)","õpilast",C.sc]];
  /* vanuserühma suurus, mida mudel kasutab (sama kaal mis eduDemand) */
  const grp=(u,y,k)=>{const a=ageVec(u,y);return k==="la"?0.8*a[0]+0.4*a[1]:0.6*a[1]+a[2]+0.2*a[3];};
  const use26=(u,k)=>u==="MAAK"?V.reduce((s,v)=>s+use26(v,k),0):k==="la"?EDU.la[u]:EDU.pupils[u].tot;
  /* ======== 1. MÕÕTMISE REDEL ======== */
  function ladder(u){const cell=(t,v,st,sub)=>`<div class="c ${st}"><span class="t">${t}</span><b>${v}</b><small>${sub}</small></div>`;
    return `<div class="k9lad">${SV.map(([k,lab,unit,col])=>{const g26=grp(u,START,k),g36=grp(u,YN,k),d36=eduDemand(u,YN)[k],u26=use26(u,k);
      return `<div class="row"><p class="h"><i style="background:${col}"></i>${lab}</p>
        ${cell("Vajadus · vanuserühma suurus",n0(g26)+" → "+n0(g36),"m",k==="la"?"arvestuslik 1–6-aastaste rühm, 2026 → "+YN+" (RV0282U, prognoos)":"arvestuslik 7–15-aastaste rühm (+0,2 × 15–19), 2026 → "+YN)}
        <span class="arw" aria-hidden="true">→</span>
        ${cell("Tegelik kasutus 2026",n0(u26)+" "+unit,"m",k==="la"?"valla lapsi lasteaias (toetusfondi arvestus)":"õppijaid valla koolides, sh mujalt tulijad (EHIS 10.11.2025)")}
        <span class="arw" aria-hidden="true">→</span>
        ${cell("Hinnatud nõudlus "+YN,n0(d36)+" "+unit,"f","kasutus 2026 × vanuserühma muutus (mudel, osalusmäär püsib)")}
        <span class="arw" aria-hidden="true">≠</span>
        ${cell("Olemasolev võimekus","puudub","na","kohtade arvu andmed puuduvad, seega tasakaalu (puudujääk/reserv) ei arvutata")}</div>`;}).join("")}</div>`;}
  /* ======== 2. NÕUDLUSE MUUTUS VÕRRELDES 2026 ======== */
  function change(W){const narrow=W<760,cols=narrow?2:4,cw=Math.floor((W-(cols-1)*14)/cols),Y=yrs(2027,YN);
    let up=0,dn=0;V.forEach(v=>SV.forEach(([k])=>{const b=eduDemand(v,START)[k];Y.forEach(y=>{const d=eduDemand(v,y)[k]-b;if(d>0)up=Math.max(up,d);else dn=Math.max(dn,-d);});}));
    const k=92/Math.max(up,dn,1),hu=Math.max(16,up*k),hd=Math.max(16,dn*k),ch=hu+hd+34;let out=`<div class="k9bal" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">`;
    V.forEach(v=>{let s=`<svg viewBox="0 0 ${cw} ${ch*2+50}" role="img" aria-label="${e(NAME[v])}: lasteaia- ja koolinõudluse muutus 2027–2036 võrreldes 2026. aastaga.">`;
      s+=`<text x="0" y="16" class="t-lab" style="fill:${VC[v]};font-size:14px">◆ ${SHORTN[v]}</text>`;
      SV.forEach(([key,lab,unit,col],si)=>{const top=26+si*(ch+12),cy=top+20+hu,b=eduDemand(v,START)[key],L=6,R=6,X=lin(2026.5,YN+.5,L,cw-R),bw=Math.max(5,(X(2028)-X(2027))*0.6);
        s+=`<text x="${L}" y="${top+12}" class="t-cap">${lab.toUpperCase()}</text><text x="${cw-R}" y="${top+12}" text-anchor="end" class="t-ax">2026: ${n0(b)}</text>`;
        s+=`<line x1="${L}" x2="${cw-R}" y1="${cy}" y2="${cy}" stroke="${col}" stroke-width="1.6"/>`;
        Y.forEach(y=>{const d=eduDemand(v,y)[key]-b,h=Math.abs(d)*k,x=X(y)-bw/2,upd=d>=0;
          s+=`<rect x="${x.toFixed(1)}" y="${(upd?cy-h:cy).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(.8,h).toFixed(1)}"${fcArea(col)}${tipAttr(tipHTML(`${NAME[v]} ${y} · prognoos`,[["hinnatud nõudlus",n0(eduDemand(v,y)[key])+" "+unit],["2026 tegelik kasutus",n0(b)],[upd?"nõudluse kasv":"nõudluse vähenemine",(upd?"+":"−")+n0(Math.abs(d))],["muutus",pct(d/b,0)]]))}/>`;});
        const d36=eduDemand(v,YN)[key]-b,ex=X(YN);s+=tri(ex,d36<0?cy+Math.abs(d36)*k+9:cy-Math.abs(d36)*k-9,4.5,d36<0?C.loss:C.gain,d36>=0,true);
        s+=`<text x="${ex-10}" y="${d36<0?cy+hd+14:cy-hu-6}" text-anchor="end" class="t-num" style="fill:${C.ink}">${YN}: ${d36>=0?"+":"−"}${n0(Math.abs(d36))} (${pct(d36/b,0)})</text>`;
        [2027,2031,YN].forEach(y=>s+=`<text x="${X(y)}" y="${cy+(d36<0?-6:15)}" text-anchor="middle" class="t-ax" style="font-size:10.5px">${y}</text>`);});
      out+=`<div class="cell${S.unit===v?" sel":""}">${s}</svg></div>`;});
    return out+`</div>`;}
  function changeTable(){return table(["Ühik","Lasteaed 2026 (kasutus)","2031","2036","Muutus","Kool 2026 (kasutus)","2031","2036","Muutus"],K9.UNITS.map(u=>{const a=eduDemand(u,START),b=eduDemand(u,2031),c=eduDemand(u,YN);return {sel:S.unit===u,c:[NAME[u],n0(a.la),n0(b.la)+" *",n0(c.la)+" *",pct(c.la/a.la-1,0),n0(a.sc),n0(b.sc)+" *",n0(c.sc)+" *",pct(c.sc/a.sc-1,0)]};}));}
  /* ======== 3. KOOLID LÄVENDI SUHTES ======== */
  let SEL=null;
  function grid(W,list){const narrow=W<760,NW=narrow?150:300,Y=yrs(START,YN),cw=narrow?16:24,EX=narrow?64:150,rh=narrow?26:28,T=34,H=T+list.length*rh+10,Wn=Math.max(W,NW+Y.length*cw+EX);
    let s=`<svg viewBox="0 0 ${Wn} ${H}" style="min-width:${Wn}px" role="img" aria-label="Koolid ja kooliastmed ÜRP lävendi suhtes aastatel 2026–2036.">`;
    Y.forEach((y,i)=>{if(i%(narrow?5:1)===0||y===YN)s+=`<text x="${NW+i*cw+cw/2}" y="${T-12}" text-anchor="middle" class="t-ax"${y===START?` style="fill:${C.ink}"`:""}>${narrow?y:String(y).slice(2)}</text>`;});
    s+=`<text x="${NW+Y.length*cw+10}" y="${T-12}" class="t-cap">${YN} / LÄVEND</text>`;
    list.forEach((sc,i)=>{const y=T+i*rh,cy=y+rh/2,sel=SEL===sc.k;
      if(sel)s+=`<rect x="0" y="${y}" width="${Wn}" height="${rh}" fill="${C.kid}" fill-opacity=".07"/>`;
      s+=`<g class="k9row" data-school="${e(sc.k)}" tabindex="0" role="button" aria-pressed="${sel}" aria-label="${e(sc.n)}: ${n0(sc.n_(YN))} õpilast ${YN}, lävend ${sc.lim}">`;
      s+=`<rect x="0" y="${y}" width="${Wn}" height="${rh}" fill="transparent"/><text x="4" y="${cy+4}" class="t-labm" style="fill:${sel?C.ink:C.mut}"><tspan fill="${VC[sc.v]}">◆</tspan> ${e(narrow?sc.n.replace(/ (Põhikool|Kool|Gümnaasium)/," …").slice(0,20):sc.n.length>40?sc.n.slice(0,39)+"…":sc.n)}</text>`;
      Y.forEach((yy,j)=>{const st=sc.st(yy),x=NW+j*cw+cw/2;s+=`<g${tipAttr(tipHTML(`${sc.n} · ${yy}${yy>START?" (prognoos)":" (2025/26 mõõdetud)"}`,[["õpilasi",n0(sc.n_(yy))],["ÜRP lävend",String(sc.lim)],["seis",{ok:"üle lävendi",warn:"lävendi lähedal (kuni 15%)",crit:"lävendist allpool"}[st]]]))}>${yy>START?`<g opacity=".95">${stGlyph(st,x,cy,narrow?4.2:5.4)}</g><circle cx="${x}" cy="${cy}" r="${narrow?2:2.4}" fill="${C.bg}"/>`:stGlyph(st,x,cy,narrow?4.8:6.2)}</g>`;});
      const n36=sc.n_(YN);s+=`<text x="${NW+Y.length*cw+10}" y="${cy+4}" class="t-num" style="fill:${C[sc.st(YN)]}">${n0(n36)}<tspan class="t-ax" dx="4">/ ${sc.lim}</tspan></text></g>`;});
    return s+"</svg>";}
  function schoolList(){return K9.schools().filter(s=>S.unit==="MAAK"||s.v===S.unit).sort((a,b)=>a.n_(YN)/a.lim-b.n_(YN)/b.lim);}
  function schoolFig(W,sc){const pts=yrs(START,YN).map(y=>[y,sc.n_(y)]);let cross=null;for(let y=START;y<=YN;y++)if(sc.n_(y)<sc.lim){cross=y;break;}
    return K9.lines({W,x0:START,x1:YN,zero:true,label:`${sc.n} õpilaste prognoos`,unitLab:"ÕPILASI",
      thr:[{v:sc.lim,lab:`ÜRP lävend ${sc.lim}`,col:C.crit}],
      series:[{name:"õpilasi",col:VC[sc.v],pts,fc:START,endLab:`${YN}: ${n0(sc.n_(YN))}`}],needles:cross&&cross>START?[{x:cross,v:sc.n_(cross),lab:`lävendi alla ${cross}`}]:[]});}
  /* ======== 5. TEENUSEMAHU MAKSUMUS ======== */
  const TILE=100000;
  function costData(){const need=needExtra("MAAK",35000,2035),ex=S.extra+(isFinite(need)?need:0);
    return {need,rows:V.map(v=>{const ds=[eduDemandA(v,age(v,2026)),eduDemandA(v,ageVec(v,2031)),eduDemandA(v,ageVec(v,YN)),eduDemandA(v,ageAt(v,YN,S.mig,ex,S.fert))];
      return {v,c:ds.map(d=>({la:d.la*UC[v].la,sc:d.sc*UC[v].sc,eak:d.o80*UC[v].o80}))};})};}
  const KS=[["sc",C.sc,"kool"],["la",C.la,"lasteaed"],["eak",C.eak,"80+ eakad"]];
  function mosaic(W,cd){const narrow=W<760,per=narrow?8:10,ts=narrow?6:8,gp=1.5,cols=narrow?1:2,blockW=(W-(cols-1)*24)/cols,lab=["2026","2031","2036",narrow?"siht":"2036 · 35 000 siht"];
    const cnt=c=>K9.apportion(KS.map(([k])=>c[k]),TILE);let mxRows=0;cd.rows.forEach(r=>{const n0_=cnt(r.c[0]).reduce((a,b)=>a+b,0);r.c.forEach(c=>mxRows=Math.max(mxRows,Math.ceil(Math.max(n0_,cnt(c).reduce((a,b)=>a+b,0)+ (0))/per)+1));});
    const mH=mxRows*(ts+gp),bh=mH+70;let out=`<div class="k9mos" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">`;
    cd.rows.forEach(r=>{const mw=per*(ts+gp),gap=Math.max(10,(blockW-4*mw)/4);let s=`<svg viewBox="0 0 ${blockW} ${bh}" role="img" aria-label="${e(NAME[r.v])}: teenusemahu maksumus, 1 ruut = 100 000 €.">`;
      s+=`<text x="0" y="14" class="t-lab" style="fill:${VC[r.v]};font-size:14px">◆ ${SHORTN[r.v]}</text>`;
      const nb=cnt(r.c[0]);
      r.c.forEach((c,ci)=>{const x0=ci*(mw+gap),yb=24+mH;let idx=0;const n=cnt(c);
        KS.forEach(([k,col],ki)=>{const fc=ci>0;for(let i=0;i<n[ki];i++,idx++){const rr=Math.floor(idx/per),cc=idx%per,x=x0+cc*(ts+gp),y=yb-(rr+1)*(ts+gp);s+=fc?`<rect x="${(x+.5).toFixed(1)}" y="${(y+.5).toFixed(1)}" width="${ts-1}" height="${ts-1}"${fcArea(col)}/>`:`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${ts}" height="${ts}" fill="${col}"/>`;}
          if(ci>0&&nb[ki]>n[ki])for(let i=0;i<nb[ki]-n[ki];i++,idx++){const rr=Math.floor(idx/per),cc=idx%per;s+=`<rect x="${(x0+cc*(ts+gp)+1.5).toFixed(1)}" y="${(yb-(rr+1)*(ts+gp)+1.5).toFixed(1)}" width="${ts-3}" height="${ts-3}" fill="none" stroke="${C.dim}" stroke-width=".8"/>`;}});
        const tot=c.la+c.sc+c.eak,t0=r.c[0].la+r.c[0].sc+r.c[0].eak;
        s+=`<rect x="${x0}" y="24" width="${mw}" height="${mH}" fill="transparent"${tipAttr(tipHTML(`${NAME[r.v]} · ${lab[ci]}`,[["kool",mln(c.sc)],["lasteaed",mln(c.la)],["80+ eakad",mln(c.eak)],["kokku",mln(tot)],["ruute",String(n.reduce((a,b)=>a+b,0))],["võrreldes 2026",ci?pct(tot/t0-1,0):"–"]],ci?"prognoos, 2024. a hinnatase":"2026 maht × ühikukulu (tuletatud)"))}/>`;
        s+=`<text x="${x0}" y="${yb+16}" class="t-ax" style="fill:${C.ink}">${lab[ci]}</text><text x="${x0}" y="${yb+31}" class="t-num">${nf1.format(tot/1e6)}</text>${ci?`<text x="${x0+mw}" y="${yb+31}" text-anchor="end" class="t-ax">${pct(tot/t0-1,0)}</text>`:`<text x="${x0+mw}" y="${yb+31}" text-anchor="end" class="t-ax">mln €</text>`}`;});
      out+=`<div class="cell${S.unit===r.v?" sel":""}">${s}</svg></div>`;});
    return out+`</div>`;}
  /* ======== VAADE ======== */
  K9.VIEWS.teenused={
    build(el){el.innerHTML=`<div class="k9intro"><div><p class="kick">${iconHTML("edu",14)} Teenused</p><h1>Kuidas rahvastiku muutus mõjutab teenuseid?</h1><a class="k9treelink" href="#ylevaade/k9-puu" data-tree="edu">⟡ Ava arengupuus</a></div><p class="lead" data-k9="lead"></p></div><div class="k9branches"><div class="k9branch" data-k9branch="edu"></div></div>
      <nav class="k9sub" aria-label="Teenuste alajaotused"><a href="#teenused/k9-redel">Mida mõõdetakse</a><a href="#teenused/k9-tasa">Nõudluse muutus</a><a href="#teenused/k9-kv">Koolid ja lävend</a><a href="#teenused/k9-lapsed">Laste arv ajas</a><a href="#teenused/k9-kulu">Teenusemahu maksumus</a></nav>
      ${sec("k9-redel","Vajadus, kasutus, nõudlus ja võimekus","Neli eri asja: lasteaiavanuses elanike arv (vajadus), teenuse tegelik kasutus, mudeli hinnatud nõudlus ja kohtade arv (võimekus). Mudel teab esimest kolme; kohtade arvu ei tea.",`<div data-k9="lad"></div>`)}
      ${sec("k9-lapsed","Laste arv ja hinnatud nõudlus ajas","Kuni 2026 tagasiarvestus vanuserühmade järgi (tuletatud), 2025/26 mõõdetud alus, edasi prognoos.",`<div data-k9="kids"></div><div class="k9moved" data-k9="edumv"></div>`)}
      ${sec("k9-tasa","Hinnatud lasteaia- ja koolinõudluse muutus võrreldes 2026. aastaga","Tulp üles = hinnatud nõudluse kasv, tulp alla = vähenemine. Kõik lahtrid on samas mõõtkavas.",`<div data-k9="bal"></div>`,{more:"Nõudlus on mudeli hinnang: 2026. aasta tegelik kasutus muutub samas proportsioonis kui vastav vanuserühm, osalusmäär ja valdadevahelised vood jäävad samaks. Vähenemine ei ole vaba kohtade arv ega eelarve kokkuhoid. Ühe valla vähenemine ei kata teise valla kasvu, sest lapsed ei liigu automaatselt teise valla teenusesse."})}
      ${sec("k9-kv","Koolid ja koolivõrk: millised koolid jäävad ÜRP lävendi alla?","Rida = kool või kooliaste, veerg = aasta. Lävend on uuringu stsenaariumi piir, mitte seadus ega koolikohtade arv.",`<div class="k9grid2 k9kv"><div data-k9="kv"></div><div data-k9="kvsel"></div></div><div class="k9moved" data-k9="kvmv"></div>`)}
      ${sec("k9-eakad","Eakate teenused: ainult 80+ elanike arv ja kuluhinnang","Mudelis on 80-aastaste ja vanemate arvu prognoos ning sellest tuletatud kuluhinnang. Teenuse kasutust, ootejärjekordi ja hoolduskohtade arvu mudelis ei ole.",`<div data-k9="eak"></div>`)}
      ${sec("k9-kulu","Teenusemahu maksumus","1 ruut = 100 000 € aastas. Muutus rahas ei ole eelarve kokkuhoid.",`<div data-k9="mos"></div><div class="k9moved" data-k9="costmv"></div>`)}
      ${sec("k9-svreg","Asutuste võimekuse register","Iga asutuse kohta eraldi: potentsiaalne nõudlus, tegelik kasutus, päritolu, kohad, teenindusvõime, hoone seisund, kulud. Puuduv väärtus jääb puuduvaks; täituvust arvutatakse ainult võrreldavate andmete korral.",`<div data-part="svreg"></div>`)}
      ${sec("k9-acc","Ligipääsetavus","Teekonnapõhine ligipääs jalgsi, rattaga, autoga ja ühistranspordiga. Linnulennulist kaugust teekonnaajana ei esitata.",`<div data-part="acc"></div>`)}`;
      const nx=id=>{const t=document.getElementById(id);return t?t.closest(".tablewrap"):null;},pm=n=>{const r=[];let x=n&&n.nextElementSibling;while(x&&x.classList.contains("pmeta")){r.push(x);x=x.nextElementSibling;}return r;};
      const kv=el.querySelector('[data-k9="kvmv"]'),sw=nx("schoolBody");if(sw){const ps=pm(sw);const d=document.createElement("details");d.className="k9det";d.innerHTML="<summary>Koolide tabel ja metoodika</summary>";d.appendChild(sw);ps.forEach(p=>d.appendChild(p));kv.appendChild(d);}
      const ed=el.querySelector('[data-k9="edumv"]'),ew=nx("eduBody");if(ew){const ps=pm(ew);const d=document.createElement("details");d.className="k9det";d.innerHTML="<summary>Valdade haridustabel ja märkused</summary>";d.appendChild(ew);ps.forEach(p=>d.appendChild(p));ed.appendChild(d);}moveInto(ed,[["#eduCards"]]);
      const cm=el.querySelector('[data-k9="costmv"]'),cw=nx("costBody");if(cw){const ps=pm(cw);const d=document.createElement("details");d.className="k9det";d.innerHTML="<summary>Ühikukulud ja tabel</summary>";d.appendChild(cw);ps.forEach(p=>d.appendChild(p));const cn=document.getElementById("costNote");if(cn)d.appendChild(cn);cm.appendChild(d);}
      const pick=g=>{SEL=g.dataset.school;this.update(el);requestAnimationFrame(()=>{const n=el.querySelector(`[data-school="${CSS.escape(SEL)}"]`);n&&n.focus();});};
      el.addEventListener("click",ev=>{const g=ev.target.closest("[data-school]");if(g)pick(g);});
      el.addEventListener("keydown",ev=>{const g=ev.target.closest&&ev.target.closest("[data-school]");if(g&&(ev.key==="Enter"||ev.key===" ")){ev.preventDefault();pick(g);}});},
    update(el){const u=S.unit,q=k=>el.querySelector(`[data-k9="${k}"]`),w=k=>K9.wOf(q(k)),a=eduDemand(u,START),b=eduDemand(u,YN);
      el.querySelector('[data-k9="lead"]').innerHTML=`<b>Lühijäreldus.</b> ${NAME[u]}: hinnatud lasteaianõudlus ${n0(a.la)} → <b>${n0(b.la)}</b> (${pct(b.la/a.la-1,0)}), hinnatud õpilaste arv valla koolides ${n0(a.sc)} (2025/26) → <b>${n0(b.sc)}</b> (${pct(b.sc/a.sc-1,0)}) aastaks ${YN}. Kohtade arvu mudel ei sisalda, seega täituvust ei hinnata.`;
      const o80=y=>{const g=w_=>{const v=ageVec(w_,y);return v[16]+v[17];};return u==="MAAK"?V.reduce((t,w_)=>t+g(w_),0):g(u);},ek=y=>(u==="MAAK"?V:[u]).reduce((t,w_)=>{const v=ageVec(w_,y);return t+(v[16]+v[17])*UC[w_].o80;},0),EY=yrs(2015,YN);
      q("eak").innerHTML=fig({title:`80+ elanikud ja eakate teenuste kuluhinnang · ${NAME[u]}`,read:`80-aastasi ja vanemaid on 2026. aastal ${n0(o80(START))}, aastal ${YN} ${n0(o80(YN))} (${pct(o80(YN)/o80(START)-1)}). Kuluhinnang = 80+ arv × valla eakate kulu 80+ elaniku kohta (RR302 kolme aasta mediaan); see on mahu mõõt, mitte eelarve.`,
        legend:[lg.act(C.eak,"mõõdetud (kuni 2026)"),lg.fc(C.eak,"prognoos")],body:K9.lines({W:w("eak"),x0:2015,x1:YN,zero:true,label:"80+ elanikud",series:[{name:"80+",col:C.eak,pts:EY.map(y=>[y,o80(y)]),fc:START,endLab:"80+ "+n0(o80(YN))}]}),
        src:"Statistikaamet RV0282U, RR302 (eakate sotsiaalhoolekande kulud), kohortmudel v6",method:"Teenuse kasutust ja kohti ei ole mudelis; kuluhinnang eeldab, et kulu 80+ elaniku kohta püsib 2026 tasemel (püsivhindades).",
        table:K9.ytable([START,2030,YN],[{h:"80+ elanikke",f:y=>n0(o80(y))},{h:"Kuluhinnang",f:y=>mln(ek(y))}])});
      q("lad").innerHTML=fig({title:`Mida mõõdetakse · ${NAME[u]}`,body:ladder(u),legend:[lg.act(C.ink,"mõõdetud"),lg.fc(C.ink,"prognoos"),lg.na("võimekus puudub: tasakaalu ei arvutata")],src:"Statistikaamet RV0282U, toetusfondi arvestus, EHIS 10.11.2025, kohortmudel v6 (eduDemand)"});
      q("bal").innerHTML=fig({title:"Nõudluse kasv ja vähenemine valdades",legend:[lg.fcsq(C.la,"lasteaed, prognoos"),lg.fcsq(C.sc,"kool, prognoos"),lg.up("nõudluse kasv"),lg.dn("nõudluse vähenemine")],body:change(w("bal")),src:"toetusfondi arvestus ja EHIS (10.11.2025), kohortmudel v6",table:changeTable()});
      const list=schoolList();if(!SEL||!list.find(s=>s.k===SEL)){const att=list.filter(s=>s.st(YN)!=="ok");SEL=(att[0]||list[0]||{}).k;}const sel=list.find(s=>s.k===SEL);
      const cnt=k=>list.filter(s=>s.st(YN)===k).length;
      q("kv").innerHTML=fig({title:`${YN}: ${cnt("crit")} lävendist allpool, ${cnt("warn")} lähedal, ${cnt("ok")} üle`,
        legend:[lg.st(),lg.txt("suur täis märk = 2025/26 mõõdetud; märk auguga = prognoos")],body:grid(w("kv"),list),src:"HaridusSilm/EHIS 10.11.2025; ÜRP asustuse koonduuringu aruanne lk 222",
        method:"Lävend: põhikool 90, algkool (1.–6. kl) 20, gümnaasium 100 õpilast (ÜRP koonduuringu ümberkorraldamise stsenaarium). Kooli prognoos = valla vanuserühma muutuse ülekanne kooli 2025/26 arvule, mitte kooli enda prognoos."});
      q("kvsel").innerHTML=sel?fig({title:e(sel.n),kick:`${SHORTN[sel.v]} · ${sel.kind}`,read:`2025/26: ${n0(sel.p)} õpilast → ${YN}: ${n0(sel.n_(YN))}. ${pill(sel.st(YN),{ok:"üle lävendi",warn:"lävendi lähedal",crit:"lävendist allpool"}[sel.st(YN)])}`,
        legend:[lg.act(VC[sel.v],"2025/26"),lg.fc(VC[sel.v],"prognoos"),lg.thr(C.crit,"ÜRP lävend")],body:schoolFig(w("kvsel"),sel),src:"EHIS, kohortmudel v6",table:K9.ytable(yrs(START,YN),[{h:"Õpilasi",f:y=>n0(sel.n_(y))},{h:"Lävend",f:()=>String(sel.lim)}])}):"";
      const kids=yrs(2015,YN),der=kids.filter(y=>y<START);
      q("kids").innerHTML=fig({title:`Hinnatud lasteaianõudlus ja õpilaste arv valla koolides 2015–${YN} · ${NAME[u]}`,legend:[lg.der(C.la,"tagasiarvestus (tuletatud)"),lg.act(C.la,"2025/26 mõõdetud"),lg.fc(C.la,"prognoos")],
        body:K9.lines({W:w("kids"),x0:2015,x1:YN,zero:true,label:"Laste ja õpilaste arv",series:[
          {name:"hinnatud lasteaianõudlus",col:C.la,pts:kids.map(y=>[y,eduDemand(u,y).la]),fc:START,der,endLab:"lasteaed "+n0(b.la)},
          {name:"hinnatud õpilased valla koolides",col:C.sc,pts:kids.map(y=>[y,eduDemand(u,y).sc]),fc:START,der,endLab:"kool "+n0(b.sc)}]}),src:"Toetusfondi arvestus, EHIS, Statistikaamet RV0282U, kohortmudel v6",
        method:"Enne 2026 ei ole see tegelik õpilaste arv, vaid 2026. aasta arv vanuserühma suuruse järgi tagasi arvestatud.",table:K9.ytable(kids,[{h:"Lasteaed",f:y=>n0(eduDemand(u,y).la)},{h:"Kool",f:y=>n0(eduDemand(u,y).sc)}])});
      const cd=costData();
      q("mos").innerHTML=fig({title:"Kool, lasteaed ja 80+ eakad: kui palju teenusemaht maksab",
        legend:[lg.sq(C.sc,"kool 2026"),lg.sq(C.la,"lasteaed 2026"),lg.sq(C.eak,"80+ eakad 2026"),lg.fcsq(C.ink,"prognoos"),`<span><svg width="20" height="14" aria-hidden="true"><rect x="6.5" y="2.5" width="8" height="8" fill="none" stroke="${C.dim}"/></svg>vähenemine võrreldes 2026</span>`],body:mosaic(w("mos"),cd),src:"Statistikaamet RR302, EHIS, kohortmudel v6",
        method:`1 ruut = 100 000 €. Ruutude arv on summa ümardatud väärtus; liikide vahel on ruudud jaotatud suurima jäägi meetodil, seega liikide ruudud annavad kokku sama arvu. Ühikukulu = RR302 kulude 2023–2025 mediaan / 2026. aasta laste, õpilaste ja 80+ elanike arv (ligikaudu 2024. a hinnatase). „35 000 siht” = maakonda rändab lisaks ${isFinite(cd.need)?n0(cd.need):"> 1000"} inimest aastas.`});},
  };
})();
