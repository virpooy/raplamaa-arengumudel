/* ---------- MÄÄRAMATUS: tagasitest horisondi ja vanuserühma kaupa, tundlikkusanalüüs, ümardamine (v46) ----------
   Tagasitest: mudel saab ainult 2016–2021 teadmise (r1full, fOld, k1620), prognoosib 1.01.2022–1.01.2026 ja võrreldakse tegelikuga.
   Tundlikkus: üks eeldus korraga, ülejäänud jäävad valitud stsenaariumi tasemele; muutuste sammud on avatud tabelis. */
(function(){
  const {C,VC,e,n0,lg,fig,table,tipAttr,tipHTML}=K9;
  const nf=(x,d)=>new Intl.NumberFormat("et-EE",{minimumFractionDigits:d,maximumFractionDigits:d}).format(x).replace("-","−");
  const pc=(x,d=1)=>x==null||!isFinite(x)?"–":(x>0?"+":x<0?"−":"±")+nf(Math.abs(x*100),d)+"%";
  /* prognoosi kuvamistäpsus: kohortmudeli arvutus annab üksiku inimese täpsuse, mida sisendandmed ei toeta */
  const rp=x=>x==null||!isFinite(x)?"–":Math.abs(x)>=1000?"≈ "+n0(Math.round(x/10)*10):n0(Math.round(x));
  K9.rp=rp;
  /* ---- tagasitest ---- */
  let BTH=null;const GRP=[["0–14",0,2],["15–64",3,12],["65+",13,17]];
  function btH(){if(BTH)return BTH;const res={};const add=(k,arr)=>{res[k]=arr;};const totP={},totA={},agP=[0,0,0],agA=[0,0,0];
    V.forEach(v=>{const p=projectFrom(v,2021,2026,CAL[v].r1full,CAL[v].fOld,()=>CAL[v].k1620),h=[];
      for(let y=2022;y<=2026;y++){const P=p[y].reduce((a,b)=>a+b,0),A=POP[v].tot[String(y)];h.push({y,P,A,e:P/A-1});totP[y]=(totP[y]||0)+P;totA[y]=(totA[y]||0)+A;}
      const a26=POP[v].age["2026"],ag=GRP.map(([n,i,j],gi)=>{let P=0,A=0;for(let g=i;g<=j;g++){P+=p[2026][g];A+=a26[g];}agP[gi]+=P;agA[gi]+=A;return {n,P,A,e:P/A-1};});add(v,{h,ag});});
    res.MAAK={h:[2022,2023,2024,2025,2026].map(y=>({y,P:totP[y],A:totA[y],e:totP[y]/totA[y]-1})),ag:GRP.map(([n],gi)=>({n,P:agP[gi],A:agA[gi],e:agP[gi]/agA[gi]-1}))};
    BTH=res;return res;}
  function heat(W){const R=btH(),U=["MAAK",...V],cols=[1,2,3,4,5],narrow=W<640,L=narrow?84:130,cw=Math.min(96,(W-L-20)/(cols.length+GRP.length+0.6)),rh=34,T=40,H=T+U.length*rh+14;
    const mx=Math.max(0.05,...U.flatMap(u=>[...R[u].h.map(x=>Math.abs(x.e)),...R[u].ag.map(x=>Math.abs(x.e))]));
    const col=x=>{const t=Math.min(1,Math.abs(x)/mx);return x>=0?`color-mix(in srgb,${C.sc} ${Math.round(15+70*t)}%,${C.bg2})`:`color-mix(in srgb,${C.op} ${Math.round(15+70*t)}%,${C.bg2})`;};
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tagasitesti prognoosiviga omavalitsuse, horisondi ja vanuserühma kaupa">`;
    cols.forEach((h,i)=>s+=`<text x="${L+i*cw+cw/2}" y="${T-22}" text-anchor="middle" class="t-ax">${h} a</text><text x="${L+i*cw+cw/2}" y="${T-8}" text-anchor="middle" class="t-ax" style="fill:${C.dim}">${2021+h}</text>`);
    const ax=L+cols.length*cw+cw*0.6;GRP.forEach((g,i)=>s+=`<text x="${ax+i*cw+cw/2}" y="${T-22}" text-anchor="middle" class="t-ax">${g[0]}</text><text x="${ax+i*cw+cw/2}" y="${T-8}" text-anchor="middle" class="t-ax" style="fill:${C.dim}">2026</text>`);
    U.forEach((u,j)=>{const y=T+j*rh;s+=`<text x="${L-8}" y="${y+rh/2+4}" text-anchor="end" style="font:700 12.5px var(--f-body);fill:${VC[u]}">${u==="MAAK"?"Maakond":SHORTN[u]}</text>`;
      const cell=(x,cx,o,lab)=>`<g${tipAttr(tipHTML(`${u==="MAAK"?"Rapla maakond":NAME[u]} · ${lab}`,[["prognoos (2016–21 teadmine)",n0(o.P)],["tegelik",n0(o.A)],["viga",pc(o.e)]]))}><rect x="${cx+1}" y="${y+2}" width="${cw-2}" height="${rh-4}" rx="3" style="fill:${col(o.e)}"/><text x="${cx+cw/2}" y="${y+rh/2+4}" text-anchor="middle" style="font:600 11.5px var(--f-num);fill:${C.ink}">${pc(o.e)}</text></g>`;
      R[u].h.forEach((o,i)=>s+=cell(o.e,L+i*cw,o,`horisont ${i+1} a (1.01.${o.y})`));R[u].ag.forEach((o,i)=>s+=cell(o.e,ax+i*cw,o,`vanuserühm ${o.n}, 1.01.2026`));});
    return s+`</svg>`;}
  function btTable(){const R=btH();return table(["Ühik",...[1,2,3,4,5].map(h=>`${h} a (${2021+h})`),...GRP.map(g=>g[0]+" 2026")],["MAAK",...V].map(u=>[u==="MAAK"?"Maakond":NAME[u],...R[u].h.map(o=>pc(o.e)),...R[u].ag.map(o=>pc(o.e))]));}
  const BTREAD="Sõltumatu tagasitest: mudelile antakse ainult 2016–2021 teadmine, prognoositakse 1–5 aastat ette ja võrreldakse tegeliku rahvaarvuga. Sinine = prognoos oli liiga suur, lilla = liiga väike. Maakonnas ja Rapla vallas on 15–64-aastaste viga suurim; tõenäoline põhjus on 2022–2023 erakordne sisseränne, mida 2016–2021 muster ei sisaldanud. Teistes valdades on suurim viga laste (Kohila, Märjamaa, Kehtna) või eakate rühmas.";
  K9.part("btf",{html:()=>`<div data-k9="btf"></div>`,update(h){const w=K9.wOf(h);h.querySelector('[data-k9="btf"]').innerHTML=fig({kick:"Prognoositäpsus",title:"Kui palju eksis sama mudel minevikus? Viga horisondi ja vanuserühma kaupa",read:BTREAD,
    legend:[lg.sq(C.sc,"prognoos liiga suur"),lg.sq(C.op,"prognoos liiga väike"),lg.txt("toon = vea suurus")],body:heat(w),table:btTable(),
    method:K9.PROV.UNC.bt+" Viga = prognoos / tegelik − 1. Vanuserühmad on viieaastaste rühmade summad (0–14, 15–64, 65+). Maakond on valdade summa. See on ühe lähteaasta test (2021); viga ei kandu automaatselt 2026–2036 prognoosi, kuid näitab, millise suurusega eksimusi rände muutused põhjustavad.",src:"kohortmudel v6 (projectFrom), Statistikaamet RV0282U"});}});
  /* ---- tundlikkusanalüüs ---- */
  const VAR=[
    {k:"mig",n:"Rändemuster (5 mustrit)",lab:"vähim ja suurim muster",run:f=>MIGS_ALL.map(m=>f({mig:m})),how:"kõik viis rändemustrit; näidatakse vähimat ja suurimat"},
    {k:"extra",n:"Lisaränne maakonda ±50 in/a",run:f=>[f({extra:S.extra-50}),f({extra:S.extra+50})],how:"valitud tase ±50 inimest aastas"},
    {k:"fert",n:"Sündimus ±10%",run:f=>[f({fert:S.fert-10}),f({fert:S.fert+10})],how:"sündimuskordajad ±10% valitud tasemest"},
    {k:"fertTr",n:"Sündimuse trend",run:f=>["const","down","sa"].map(t=>f({fertTr:t})),how:"püsiv / langus jätkub / Statistikaameti TFR"},
    {k:"mort",n:"Eluea kasv",run:f=>["const","tr"].map(t=>f({mort:t})),how:"suremus püsiv / eluiga kasvab trendi järgi"},
    {k:"wage",n:"Palgakasv ±1 pp",tax:1,run:f=>[f({wage:S.wage-1}),f({wage:S.wage+1})],how:"aastane nominaalne palgakasv ±1 protsendipunkti"},
    {k:"emp",n:"Tööhõive ±2 pp",tax:1,run:f=>[f({emp:S.emp-2}),f({emp:S.emp+2})],how:"hõivemäär ±2 protsendipunkti (rakendub 4 aasta jooksul)"}];
  const OUT=[{k:"pop",n:`Rahvaarv ${YN}`,f:u=>popT(u,YN),fmt:x=>rp(x)},{k:"old",n:`65+ osakaal ${YN}`,f:u=>shares(u,YN).old,fmt:x=>nf(x*100,1)+"%"},{k:"tax",n:`Tulumaks ${YN} (jooksevhinnad)`,f:u=>taxSeries(u)[YN],fmt:x=>nf(x/1e6,2)+" mln €"}];
  let SC=null,SCK="";
  function sens(u){const key=JSON.stringify([u,S.mig,S.extra,S.fert,S.fertTr,S.mort,S.wage,S.emp,S.re27,S.smode,VX]);if(SC&&SCK===key)return SC;
    const keep={mig:S.mig,extra:S.extra,fert:S.fert,fertTr:S.fertTr,mort:S.mort,wage:S.wage,emp:S.emp};const base=OUT.map(o=>o.f(u));
    const f=p=>{Object.assign(S,p);try{runModel();return OUT.map(o=>o.f(u));}finally{Object.assign(S,keep);}};
    let rows;try{rows=VAR.filter(v=>(S.smode||"all")!=="mig"||v.k==="mig").map(v=>{const r=v.run(f);return {v,vals:OUT.map((o,i)=>{const a=r.map(x=>x[i]);return [Math.min(...a),Math.max(...a)];})};});}finally{Object.assign(S,keep);runModel();}
    SC={base,rows};SCK=key;return SC;}
  function tornado(u,oi,W){const T=sens(u),b=T.base[oi],o=OUT[oi],rows=T.rows.filter(r=>!(r.v.tax&&o.k!=="tax")).map(r=>({...r,lo:r.vals[oi][0],hi:r.vals[oi][1]})).sort((a,c)=>(c.hi-c.lo)-(a.hi-a.lo));
    const narrow=W<640,L=narrow?120:190,R=narrow?60:110,rh=30,T0=28,H=T0+rows.length*rh+30,mn=Math.min(b,...rows.map(r=>r.lo)),mx=Math.max(b,...rows.map(r=>r.hi)),pad=(mx-mn)*0.06||Math.abs(b)*0.01||1,lp=(mx-mn)*(narrow?0.05:0.16)+pad,X=v=>L+(v-(mn-lp))/((mx+pad)-(mn-lp))*(W-L-R);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tundlikkusanalüüs: ${e(o.n)}">`;
    s+=`<line x1="${X(b)}" x2="${X(b)}" y1="${T0-8}" y2="${H-22}" stroke="${C.ink}" stroke-width="1.4"/><text x="${X(b)}" y="${T0-12}" text-anchor="middle" class="t-cap">VALITUD ${e(o.fmt(b))}</text>`;
    rows.forEach((r,i)=>{const y=T0+i*rh,lo=X(r.lo),hi=X(r.hi);s+=`<text x="${L-8}" y="${y+rh/2+4}" text-anchor="end" class="t-lab" style="font-size:12px">${e(r.v.n)}</text>`;
      s+=`<g${tipAttr(tipHTML(r.v.n,[["muutus",r.v.how],["vähim",o.fmt(r.lo)],["suurim",o.fmt(r.hi)],["ulatus",o.k==="old"?nf((r.hi-r.lo)*100,1)+" pp":o.fmt(r.hi-r.lo).replace("≈ ","")]]))}>`;
      if(lo<X(b))s+=`<rect x="${lo}" y="${y+5}" width="${Math.max(1,X(b)-lo)}" height="${rh-10}" fill="${C.op}" fill-opacity=".85" rx="2"/>`;
      if(hi>X(b))s+=`<rect x="${X(b)}" y="${y+5}" width="${Math.max(1,hi-X(b))}" height="${rh-10}" fill="${C.sc}" fill-opacity=".85" rx="2"/>`;
      if(Math.abs(hi-lo)<0.5)s+=`<text x="${X(b)+6}" y="${y+rh/2+4}" class="t-ax">ei mõjuta</text>`;
      s+=`<text x="${Math.max(hi,X(b))+5}" y="${y+rh/2+4}" class="t-ax">${e(o.fmt(r.hi))}</text><text x="${Math.min(lo,X(b))-5}" y="${y+rh/2+4}" text-anchor="end" class="t-ax" style="${narrow?"display:none":""}">${e(o.fmt(r.lo))}</text></g>`;});
    return s+`</svg>`;}
  let SOUT=0;
  K9.part("sens",{html:()=>`<div data-k9="sens"></div>`,bind(h){h.addEventListener("click",ev=>{const b=ev.target.closest("[data-sout]");if(b){SOUT=+b.dataset.sout;this.update(h);}});},
    update(h){const u=S.unit,w=K9.wOf(h),T=sens(u),o=OUT[SOUT],rows=T.rows.filter(r=>!(r.v.tax&&o.k!=="tax")).sort((a,c)=>(c.vals[SOUT][1]-c.vals[SOUT][0])-(a.vals[SOUT][1]-a.vals[SOUT][0])),top=rows[0];
      h.querySelector('[data-k9="sens"]').innerHTML=fig({kick:"Tundlikkusanalüüs",title:`Milline eeldus mõjutab tulemust kõige rohkem? · ${NAME[u]}`,
        ctl:`<div class="k9seg" role="group" aria-label="Tulemus">${OUT.map((x,i)=>`<button type="button" data-sout="${i}" aria-pressed="${i===SOUT}">${e(x.n)}</button>`).join("")}</div>`,
        read:`Iga rida muudab ühte eeldust, teised jäävad valitud stsenaariumi tasemele. Suurim mõju tulemusele „${e(o.n)}”: <b>${e(top.v.n)}</b> (${e(o.fmt(top.vals[SOUT][0]))} … ${e(o.fmt(top.vals[SOUT][1]))}). Lilla = väiksem kui valitud, sinine = suurem.`,
        legend:[lg.sq(C.op,"tulemus väheneb"),lg.sq(C.sc,"tulemus suureneb"),lg.txt("püstjoon = valitud stsenaarium")],body:tornado(u,SOUT,w),
        table:table(["Eeldus","Muutus","Vähim","Suurim","Ulatus"],rows.map(r=>[e(r.v.n),e(r.v.how),e(o.fmt(r.vals[SOUT][0])),e(o.fmt(r.vals[SOUT][1])),o.k==="old"?nf((r.vals[SOUT][1]-r.vals[SOUT][0])*100,1)+" pp":e(o.fmt(r.vals[SOUT][1]-r.vals[SOUT][0]).replace("≈ ",""))]),{textCols:[0,1]}),
        method:((S.smode||"all")==="mig"?"Režiimis „ainult rändemuster” on teised hoovad lukus, seega näidatakse ainult rändemustri rida. ":"")+"Ühe teguri kaupa tundlikkusanalüüs (one-at-a-time): iga eeldust muudetakse tabelis toodud sammuga, teised jäävad valitud väärtusele, mudel arvutatakse uuesti. Sammud on kokkuleppelised ja võrreldava suurusega, mitte tõenäosused; koosmõjusid (kaks eeldust korraga) ei näidata. Rändemustri rida on sama mis „rändemustrite ulatus (min–max)”. Palgakasv ja hõive mõjutavad ainult tulumaksu.",src:"kohortmudel v6 (runModel, taxSeries)"});}});
})();
