/* ---------- RAHVASTIK: prognoosikangas, põlvkonnad, muutuse allikad, sihid, seire, eesmärgid, tagasitest ---------- */
(function(){
  const {C,VC,e,n0,pp,sgn,lin,P,stitch,tri,thread,warp,yGrid,brk,spread,lg,fig,sec,tipAttr,tipHTML,table,moveInto,stGlyph,pill}=K9;
  const MS={r1:"2016–21",mean:"keskmine",r2:"2021–26",r2x:"21–26 erandita",r3:"2024–26"};
  const yrs=(a,b)=>{const r=[];for(let y=a;y<=b;y++)r.push(y);return r;};
  const vk=u=>"v"+u;
  /* ======== 1. PROGNOOSIKANGAS ======== */
  function extSeries(u){const out=[];if(!showExt)return out;
    if(u==="MAAK")out.push({k:"SA",name:"Statistikaamet 2024",pts:yrs(2024,YN).map(y=>[y,EXT.SA.R.pop[y]]),col:C.ref});
    [["base","ÜRP baas (rändeta, teoreetiline)"],["A","ÜRP A (seniste trendide jätk)"],["B","ÜRP B (sihtstsenaarium, mitte prognoos)"],["C","ÜRP C (sihtstsenaarium, mitte prognoos)"],["D","ÜRP D"]].forEach(([k,n])=>out.push({k,name:n,pts:yrs(2024,YN).map(y=>[y,urpAt(u,k,y)]),col:C.ref,thin:true}));
    if(u==="Marjamaa")[["base","Märjamaa baas"],["opt","Märjamaa optimistlik"],["jatk","Märjamaa jätku"]].forEach(([k,n])=>out.push({k:"MJ"+k,name:n,pts:yrs(2020,YN).map(y=>[y,interpY(EXT.MJ[k],y)]),col:C.kid}));
    return out;}
  function cloth(u,W){const narrow=W<700,L=narrow?44:62,R=narrow?138:236,T=36,H=narrow?340:450,B=34,col=VC[u];
    const hist=yrs(2015,START).map(y=>[y,POP[u].tot[String(y)]]),pr=yrs(START,YN).map(y=>[y,popT(u,y)]),mc=yrs(START,YN).map(y=>[y,MC[u][y][0],MC[u][y][1]]);
    const pats=MIGS_ALL.map(m=>({m,pts:yrs(START,YN).map(y=>[y,SC[m][u][y]])})),ext=extSeries(u),tg=K9.TGT[u];
    const all=[...hist.map(p=>p[1]),...pr.map(p=>p[1]),...mc.flatMap(p=>[p[1],p[2]]),...pats.flatMap(p=>p.pts.map(q=>q[1])),...ext.flatMap(x=>x.pts.map(q=>q[1]).filter(v=>v!=null))];if(tg)all.push(tg[0]);
    const mn=Math.min(...all),mx=Math.max(...all),nk=nice(mn-(mx-mn)*.04,mx+(mx-mn)*.04,narrow?4:6),X=lin(2015,YN,L,W-R),Y=lin(nk.lo,nk.hi,H-B,T);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(NAME[u])} rahvaarv 2015–2036: tegelik, valitud stsenaarium ${n0(popT(u,YN))} aastal 2036, juhusliku kõikumise vahemik (80%) ${n0(MC[u][YN][0])}–${n0(MC[u][YN][1])}, viis rändemustrit.">`;
    s+=yGrid(Y,nk.t,L,W-R,v=>f0(v));s+=warp(X,T,H-B,{a:2015,b:YN});s+=brk(L+4,H-B-9);
    // määramatus: juhusliku kõikumise vahemik (80%)
    const up=mc.map(p=>P(X(p[0]),Y(p[2]))).join("L"),dn=mc.slice().reverse().map(p=>P(X(p[0]),Y(p[1]))).join("L");
    s+=`<path d="M${up}L${dn}Z" fill="url(#h-${vk(u)})" stroke="${col}" stroke-opacity=".5"/>`;
    // välised võrdlusprognoosid
    ext.forEach(x=>{const pts=x.pts.filter(p=>p[1]!=null).map(p=>[X(p[0]),Y(p[1])]);s+=`<path d="M${pts.map(p=>P(p[0],p[1])).join("L")}" fill="none" stroke="${x.col}" stroke-width="${x.thin?1:1.4}" stroke-dasharray="1 3" stroke-opacity="${x.thin?.7:.9}"/>`;const lp=pts[pts.length-1];s+=`<rect x="${lp[0]-3}" y="${lp[1]-3}" width="6" height="6" transform="rotate(45 ${lp[0]} ${lp[1]})" fill="${x.col}"/>`;});
    // rändemustrid (ilma hoobadeta)
    pats.forEach(p=>{s+=thread(p.pts.map(q=>[X(q[0]),Y(q[1])]),col,{w:1.1,fc:true,dash:"2 3",op:.55});});
    // tegelik ja valitud stsenaarium
    s+=thread(hist.map(p=>[X(p[0]),Y(p[1])]),col,{w:3});s+=thread(pr.map(p=>[X(p[0]),Y(p[1])]),col,{w:3,fc:true});
    const dmx=Math.max(...yrs(2016,YN).map(y=>Math.abs(popT(u,y)-popT(u,y-1))))||1;s+=stitch(X(2015),Y(hist[0][1]),3.2,col);
    yrs(2016,YN).forEach(y=>{const d=popT(u,y)-popT(u,y-1),sz=(narrow?2.4:3)+Math.sqrt(Math.abs(d)/dmx)*(narrow?3.4:4.6);s+=tri(X(y),Y(popT(u,y)),sz,d>=0?C.gain:C.loss,d>=0,y>START);});
    // siht
    if(tg){const x=X(tg[1]),y=Y(tg[0]);s+=`<line x1="${x}" x2="${x}" y1="${y}" y2="${H-B}" stroke="${C.ink}" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="5" fill="${C.bg}" stroke="${C.ink}" stroke-width="2"/><text x="${x-9}" y="${y-9}" text-anchor="end" class="t-lab">siht ${n0(tg[0])} · ${tg[1]}</text>`;}
    // paremad sildid
    const labs=[],xe=X(YN);labs.push({y:Y(pr[pr.length-1][1]),y0:Y(pr[pr.length-1][1]),t:`valitud ${n0(pr[pr.length-1][1])}`,c:col,b:true});
    labs.push({y:(Y(MC[u][YN][0])+Y(MC[u][YN][1]))/2,y0:(Y(MC[u][YN][0])+Y(MC[u][YN][1]))/2,t:narrow?`juhuslik 80%: ${n0(MC[u][YN][0])}–${n0(MC[u][YN][1])}`:`juhuslik kõikumine 80%: ${n0(MC[u][YN][0])}–${n0(MC[u][YN][1])}`,c:col});
    if(narrow){const v=pats.map(p=>p.pts[p.pts.length-1][1]);labs.push({y:Y(Math.max(...v)),y0:Y(Math.max(...v)),t:`mustrid ${n0(Math.min(...v))}–`,c:C.mut});labs.push({y:Y(Math.min(...v)),y0:Y(Math.min(...v)),t:`… ${n0(Math.max(...v))}`,c:C.mut});}
    else{pats.forEach(p=>{const v=p.pts[p.pts.length-1][1];labs.push({y:Y(v),y0:Y(v),t:`${MS[p.m]} ${n0(v)}`,c:C.mut,m:p.m===S.mig});});
      ext.forEach(x=>{const lp=x.pts.filter(q=>q[1]!=null).slice(-1)[0];labs.push({y:Y(lp[1]),y0:Y(lp[1]),t:`${x.name} ${n0(lp[1])}`,c:x.col});});}
    spread(labs,narrow?13:13.5,T-6,H-B+4);
    labs.forEach(l=>{s+=`<path d="M${xe+5},${l.y0}C${xe+16},${l.y0} ${xe+10},${l.y} ${xe+22},${l.y}" fill="none" stroke="${l.c}" stroke-opacity=".45"/><text x="${xe+25}" y="${l.y+4}" class="${l.b?"t-num":"t-labm"}" style="fill:${l.c}${l.m?";font-weight:700":""}">${e(l.t)}${l.m?" ◂":""}</text>`;});
    // vihjeveerud
    const cw=X(2016)-X(2015);yrs(2015,YN).forEach(y=>{const r=[];if(y<=START)r.push(["tegelik (1. jaan)",n0(POP[u].tot[String(y)])]);if(y>=START){r.push(["valitud stsenaarium",n0(popT(u,y))]);r.push(["juhusliku kõikumise vahemik (80%)",n0(MC[u][y][0])+" … "+n0(MC[u][y][1])]);MIGS_ALL.forEach(m=>r.push(["muster "+MS[m],n0(SC[m][u][y])]));}
      ext.forEach(x=>{const p=x.pts.find(q=>q[0]===y);if(p&&p[1]!=null)r.push([x.name,n0(p[1])]);});s+=`<rect x="${X(y)-cw/2}" y="${T}" width="${cw}" height="${H-B-T}" fill="transparent"${tipAttr(tipHTML(y+(y>START?" · prognoos":y===START?" · täna":" · ametlik"),r))}/>`;});
    return s+"</svg>";}
  function clothTable(u){const ext=extSeries(u);return K9.table(["Aasta","Tegelik","Valitud","juhuslik kõikumine 80%, alumine","juhuslik kõikumine 80%, ülemine",...MIGS_ALL.map(m=>"Muster "+MS[m]),...ext.map(x=>x.name)],
    yrs(2015,YN).map(y=>[String(y)+(y>START?" *":""),y<=START?n0(POP[u].tot[String(y)]):"",y>=START?n0(popT(u,y)):"",y>=START?n0(MC[u][y][0]):"",y>=START?n0(MC[u][y][1]):"",...MIGS_ALL.map(m=>y>=START?n0(SC[m][u][y]):""),...ext.map(x=>{const p=x.pts.find(q=>q[0]===y);return p&&p[1]!=null?n0(p[1]):"";})]));}
  /* ======== 2. MUUTUSE KUDE: sünnid, surmad, ränne 2015–2025 ======== */
  function comps(u,W){const narrow=W<640,Y=yrs(2015,2025),L=narrow?30:44,R=narrow?8:16,cw=(W-L-R)/Y.length,q=narrow?3:4,P_=POP[u];
    const d=Y.map(y=>({y,b:P_.b[YI(y)],dd:P_.d[YI(y)],mi:P_.mi[YI(y)],mo:P_.mo[YI(y)],ch:P_.tot[String(y+1)]-P_.tot[String(y)]}));
    const upM=Math.max(...d.map(x=>x.b+x.mi)),dnM=Math.max(...d.map(x=>x.dd+x.mo));let unit=[5,10,20,25,50,100,200].find(k=>Math.ceil(upM/k/q)+Math.ceil(dnM/k/q)<=(narrow?34:44))||200;
    const sz=Math.max(3,Math.min(9,(cw*0.78)/q-1)),st=sz+1.4,ru=Math.ceil(upM/unit/q),rd=Math.ceil(dnM/unit/q),T=24,y0=T+ru*st+4,H=y0+rd*st+40;
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(NAME[u])}: sünnid, surmad ja ränne 2015–2025, 1 ruut = ${unit} inimest.">`;
    s+=`<line x1="${L}" x2="${W-R}" y1="${y0}" y2="${y0}" stroke="${C.line2}"/><text x="${L-6}" y="${y0-6}" text-anchor="end" class="t-cap">+</text><text x="${L-6}" y="${y0+14}" text-anchor="end" class="t-cap">−</text>`;
    const net=[];
    d.forEach((x,i)=>{const cx=L+i*cw+cw/2,x0=cx-(q*st)/2;let k=0;
      const put=(n,dir,col,fc)=>{for(let j=0;j<n;j++,k++){const r=Math.floor(k/q),c=k%q,xx=x0+c*st,yy=dir>0?y0-(r+1)*st:y0+r*st+1.4;s+=`<rect x="${xx.toFixed(1)}" y="${yy.toFixed(1)}" width="${sz.toFixed(1)}" height="${sz.toFixed(1)}" fill="${fc?"none":col}" stroke="${col}" stroke-width="${fc?1:0}"/>`;}};
      k=0;put(Math.round(x.b/unit),1,C.gain,false);put(Math.round(x.mi/unit),1,C.gain,true);k=0;put(Math.round(x.dd/unit),-1,C.loss,false);put(Math.round(x.mo/unit),-1,C.loss,true);
      const yy=y0-(x.ch/unit/q)*st;net.push([cx,yy]);
      s+=`<text x="${cx}" y="${H-14}" text-anchor="middle" class="t-ax">${narrow&&i%2?"":x.y}</text>`;
      s+=`<rect x="${cx-cw/2}" y="${T-10}" width="${cw}" height="${H-T-10}" fill="transparent"${tipAttr(tipHTML(`${NAME[u]} ${x.y} (ametlik)`,[["sünnid","+"+n0(x.b)],["sisseränne","+"+n0(x.mi)],["surmad","−"+n0(x.dd)],["väljaränne","−"+n0(x.mo)],["rahvaarvu muutus",sgn(x.ch)],["registri parandused",sgn(x.ch-(x.b-x.dd+x.mi-x.mo))]]))}/>`;});
    s+=thread(net,C.ink,{w:1.6});net.forEach((p,i)=>s+=`<circle cx="${p[0]}" cy="${p[1]}" r="3.4" fill="${C.ink}" stroke="${C.bg}" stroke-width="1.5"/>`);
    s+=`<text x="${W-R}" y="14" text-anchor="end" class="t-cap">1 RUUT = ${unit} INIMEST · ${q} RUUTU REAS</text>`;
    return {svg:s+"</svg>",unit,d};}
  /* ======== 3. PÕLVKONDADE VOOSTIK ======== */
  const GRP=[["0–14",0,2,"kid"],["15–64",3,12,"work"],["65+",13,17,"old"]];
  function stream(u,W){const narrow=W<640,Y=yrs(2015,YN),L=narrow?40:64,R=narrow?54:96,T=26,Hs=narrow?230:300,H=T+Hs+40,X=lin(2015,YN,L,W-R);
    const g=Y.map(y=>{const a=ageVec(u,y);return GRP.map(([n,i,j])=>sumG(a,i,j));}),tot=g.map(x=>x[0]+x[1]+x[2]),mx=Math.max(...tot),k=Hs/mx,yc=T+Hs/2;
    const edges=g.map((x,i)=>{const t=tot[i]*k,top=yc-t/2;return [top,top+x[0]*k,top+(x[0]+x[1])*k,top+t];});
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(NAME[u])}: vanuserühmad 2015–2036. Riba paksus on inimeste arv.">`;
    s+=warp(X,T-6,T+Hs+6,{a:2015,b:YN});
    const area=(gi,from,to,fill,stroke)=>{const idx=Y.map((y,i)=>i).filter(i=>Y[i]>=from&&Y[i]<=to);const a=idx.map(i=>P(X(Y[i]),edges[i][gi])).join("L"),b=idx.slice().reverse().map(i=>P(X(Y[i]),edges[i][gi+1])).join("L");return `<path d="M${a}L${b}Z" fill="${fill}" stroke="${stroke}" stroke-width=".8"/>`;};
    GRP.forEach((gr,gi)=>{s+=area(gi,2015,START,C[gr[3]],C.bg);s+=area(gi,START,YN,C[gr[3]],C.bg).replace('fill="'+C[gr[3]]+'"','fill="'+C[gr[3]]+'" fill-opacity=".38"');});
    // väärtused 2015, 2026, 2036
    [2015,START,YN].forEach(y=>{const i=y-2015;GRP.forEach((gr,gi)=>{const h=(edges[i][gi+1]-edges[i][gi]),cy=(edges[i][gi+1]+edges[i][gi])/2,anchor=y===2015?"start":"end",x=X(y)+(y===2015?4:-5);
      if(h>15)s+=`<text x="${x}" y="${cy+4}" text-anchor="${anchor}" class="t-num" style="fill:${y>START?C.ink:C.bg};paint-order:stroke;${y>START?`stroke:${C.bg};stroke-width:3px`:""}">${n0(g[i][gi])}</text>`;});});
    GRP.forEach((gr,gi)=>{const i=Y.length-1,cy=(edges[i][gi+1]+edges[i][gi])/2;s+=`<text x="${W-R+8}" y="${cy+4}" class="t-lab" style="fill:${C[gr[3]]}">${gr[0]}</text>`;});
    // mõõtkava
    const sb=[1000,2000,5000,10000,20000].find(v=>v*k>=40)||20000;s+=`<line x1="${L-22}" x2="${L-22}" y1="${T+Hs}" y2="${T+Hs-sb*k}" stroke="${C.ink}" stroke-width="2"/><text x="${L-28}" y="${T+Hs-sb*k/2}" transform="rotate(-90 ${L-28} ${T+Hs-sb*k/2})" text-anchor="middle" class="t-ax">${n0(sb)} in</text>`;
    const cw=X(2016)-X(2015);Y.forEach((y,i)=>s+=`<rect x="${X(y)-cw/2}" y="${T}" width="${cw}" height="${Hs}" fill="transparent"${tipAttr(tipHTML(`${NAME[u]} ${y}${y>START?" · prognoos":" · ametlik"}`,[...GRP.map((gr,gi)=>[gr[0],n0(g[i][gi])]),["kokku",n0(tot[i])],["65+ osakaal",pp(g[i][2]/tot[i])]]))}/>`);
    return {svg:s+"</svg>",g,tot};}
  /* ======== 4. PÕLVKONNASAMMAS (vanuseprofiil) ======== */
  let PLAY=null;
  function pyr(u,W,yr){const narrow=W<640,cl=narrow?44:56,side=(W-cl-(narrow?70:120))/2,rh=narrow?15:19,T=30,H=T+G*rh+24,a=ageVec(u,START),b=ageVec(u,yr);
    let mx=0;for(let y=2015;y<=YN;y++)mx=Math.max(mx,...ageVec(u,y));const k=side/mx,cx0=(narrow?16:60)+side,cx1=cx0+cl;
    const unit=[10,25,50,100,250,500].find(n=>n*k>=4)||500;
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(NAME[u])} vanuseprofiil: vasakul 2026, paremal ${yr}.">`;
    s+=`<text x="${cx0-4}" y="16" text-anchor="end" class="t-cap">◂ 2026 · TÄNA (AMETLIK)</text><text x="${cx1+4}" y="16" class="t-cap" style="fill:${C.ink}">${yr}${yr>START?" · PROGNOOS":yr<START?" · AMETLIK":" · TÄNA"} ▸</text>`;
    for(let i=0;i<G;i++){const g=G-1-i,y=T+i*rh,gr=g<=2?"kid":g>=13?"old":"work",col=C[gr],wa=a[g]*k,wb=b[g]*k,fcb=yr>START;
      s+=`<rect x="${cx0-wa}" y="${y+1}" width="${wa}" height="${rh-3}" fill="${col}" fill-opacity=".9"${tipAttr(tipHTML(`${AGEL[g]} · 2026`,[["inimesi",n0(a[g])]]))}/>`;
      s+=`<rect x="${cx1}" y="${y+1}" width="${wb}" height="${rh-3}" ${fcb?K9.fcArea(col):`fill="${col}" fill-opacity=".9"`}${tipAttr(tipHTML(`${AGEL[g]} · ${yr}`,[["inimesi",n0(b[g])],["muutus 2026-st",sgn(Math.round(b[g]-a[g]))]]))}/>`;
      for(let n=unit;n<a[g];n+=unit)s+=`<line x1="${cx0-n*k}" x2="${cx0-n*k}" y1="${y+1}" y2="${y+rh-2}" stroke="${C.bg}" stroke-width=".8" pointer-events="none"/>`;
      if(!fcb)for(let n=unit;n<b[g];n+=unit)s+=`<line x1="${cx1+n*k}" x2="${cx1+n*k}" y1="${y+1}" y2="${y+rh-2}" stroke="${C.bg}" stroke-width=".8" pointer-events="none"/>`;
      s+=`<text x="${cx0+cl/2}" y="${y+rh*0.68}" text-anchor="middle" class="t-ax">${AGEL[g]}</text>`;
      const d=Math.round(b[g]-a[g]);if(yr!==START)s+=`<text x="${cx1+wb+6}" y="${y+rh*0.68}" class="t-ax" style="fill:${d>=0?C.gain:C.loss}">${d>=0?"▲":"▼"}${f0(Math.abs(d))}</text>`;}
    s+=`<text x="${cx0}" y="${H-6}" text-anchor="end" class="t-cap">PISTE = ${unit} INIMEST</text>`;
    return s+"</svg>";}
  /* ======== 5. VANANEMISE TEEKOND (valdade trajektoorid) ======== */
  function aging(W){const narrow=W<640,L=narrow?40:50,R=narrow?72:100,T=18,H=narrow?280:330,B=40;let xs=[],ys=[];
    V.forEach(v=>yrs(2015,YN).forEach(y=>{const q=shares(v,y);xs.push(q.old);ys.push(q.kids);}));
    const X=lin(Math.floor(Math.min(...xs)*50)/50,Math.ceil(Math.max(...xs)*50)/50,L,W-R),Yy=lin(Math.floor(Math.min(...ys)*100)/100,Math.ceil(Math.max(...ys)*100)/100,H-B,T);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Valdade laste (0–14) ja eakate (65+) osakaal 2015–2036.">`;
    const xt=nice(X.inv(L),X.inv(W-R),narrow?3:5).t.filter(t=>X(t)>=L-1&&X(t)<=W-R+1),yt=nice(Yy.inv(H-B),Yy.inv(T),4).t.filter(t=>Yy(t)<=H-B+1&&Yy(t)>=T-1);
    xt.forEach(t=>s+=`<line x1="${X(t)}" x2="${X(t)}" y1="${T}" y2="${H-B}" stroke="${C.line}"/><text x="${X(t)}" y="${H-B+15}" text-anchor="middle" class="t-ax">${nf0.format(t*100)}%</text>`);
    yt.forEach(t=>s+=`<line x1="${L}" x2="${W-R}" y1="${Yy(t)}" y2="${Yy(t)}" stroke="${C.line}"/><text x="${L-5}" y="${Yy(t)+4}" text-anchor="end" class="t-ax">${nf0.format(t*100)}%</text>`);
    s+=`<text x="${(L+W-R)/2}" y="${H-6}" text-anchor="middle" class="t-cap">65+ OSAKAAL →</text><text x="12" y="${(T+H-B)/2}" transform="rotate(-90 12 ${(T+H-B)/2})" text-anchor="middle" class="t-cap">0–14 OSAKAAL →</text>`;
    const labs=[];V.forEach(v=>{const sel=S.unit===v||S.unit==="MAAK",pts=yrs(2015,YN).map(y=>{const q=shares(v,y);return [y,X(q.old),Yy(q.kids),q];});
      s+=`<g opacity="${sel?1:.35}">`+thread(pts.filter(p=>p[0]<=START).map(p=>[p[1],p[2]]),VC[v],{w:S.unit===v?2.6:1.8})+thread(pts.filter(p=>p[0]>=START).map(p=>[p[1],p[2]]),VC[v],{w:S.unit===v?2.6:1.8,fc:true});
      pts.forEach(p=>s+=stitch(p[1],p[2],p[0]===2015||p[0]===START||p[0]===YN?3.6:2,VC[v],p[0]>START,tipAttr(tipHTML(`${NAME[v]} ${p[0]}${p[0]>START?" · prognoos":""}`,[["0–14",pp(p[3].kids)],["65+",pp(p[3].old)]]))));s+=`</g>`;
      const lp=pts[pts.length-1];labs.push({y:lp[2],x:lp[1],t:narrow?SHORTN[v]:`${SHORTN[v]} ${YN}`,c:VC[v],o:sel?1:.5});const fp=pts[0];s+=`<text x="${fp[1]}" y="${fp[2]-7}" text-anchor="middle" class="t-ax" opacity="${sel?.9:.4}">2015</text>`;});
    spread(labs,13,T,H-B);labs.forEach(l=>s+=`<text x="${Math.min(W-R+6,l.x+8)}" y="${l.y+4}" class="t-lab" style="fill:${l.c}" opacity="${l.o}">${e(l.t)}</text>`);
    return s+"</svg>";}
  /* ======== 6. MINARDI VOOG (muutuse sild) ======== */
  const STG=[2015,2018,2021,2024,2026,2031,2036];
  function netMigU(u){const vs=u==="MAAK"?V:[u],tot=V.reduce((s,w)=>s+POP[w].tot["2026"],0);return vs.reduce((s,v)=>s+CAL[v][S.mig].reduce((a,b)=>a+b,0)+S.extra*POP[v].tot["2026"]/tot+(VX[v]||0),0);}
  function flowsU(u,a,b){const P_=POP[u],d=popT(u,b)-popT(u,a);
    if(b<=START){let Bb=0,D=0,I=0,O=0;for(let y=a;y<b;y++){Bb+=P_.b[YI(y)]||0;D+=P_.d[YI(y)]||0;I+=P_.mi[YI(y)]||0;O+=P_.mo[YI(y)]||0;}const res=d-(Bb-D+I-O);
      const Lo=[["surmad",D],["väljaränne",O]],Ri=[["sünnid",Bb],["sisseränne",I]];if(Math.abs(res)>=1)(res<0?Lo:Ri).push(["registri parandused",Math.abs(res)]);return {d,out:Lo,inn:Ri,fut:false};}
    const m=netMigU(u)*(b-a),n=d-m,Lo=[],Ri=[];(n<0?Lo:Ri).push([n<0?"loomulik kadu":"loomulik juurdekasv",Math.abs(n)]);(m<0?Lo:Ri).push(["rände saldo",Math.abs(m)]);return {d,out:Lo,inn:Ri,fut:true};}
  function minard(u,W0){const W=Math.max(W0,780),L=40,R=40,TA=120,Hmax=150,BA=120,y0=TA+Hmax/2+10,H=TA+Hmax+BA+30,X=lin(2015,YN,L,W-R);
    let mx=0;yrs(2015,YN).forEach(y=>mx=Math.max(mx,popT(u,y)));const k=Hmax/mx,hh=p=>p*k/2;
    const top=y=>y0-hh(popT(u,y)),bot=y=>y0+hh(popT(u,y)),ei=x=>{const y=X.inv(x),a=Math.floor(y),b=Math.min(YN,a+1),t=y-a;return [top(a)+(top(b)-top(a))*t,bot(a)+(bot(b)-bot(a))*t];};
    let s=`<svg viewBox="0 0 ${W} ${H}" style="min-width:${W}px" role="img" aria-label="${e(NAME[u])}: rahvaarv (tüve kõrgus) ning lisandumine ja lahkumine (vood) perioodide kaupa.">`;
    s+=`<text x="${L}" y="16" class="t-cap" style="fill:${C.gain}">▼ LISANDUS (PERIOODI SUMMA)</text><text x="${L}" y="${H-8}" class="t-cap" style="fill:${C.loss}">▼ LAHKUS (PERIOODI SUMMA)</text>`;
    const poly=(a,b,fill,stroke)=>{const Y=yrs(a,b);return `<path d="M${Y.map(y=>P(X(y),top(y))).join("L")}L${Y.slice().reverse().map(y=>P(X(y),bot(y))).join("L")}Z" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`;};
    s+=poly(2015,START,VC[u],VC[u]).replace('fill="'+VC[u]+'"',`fill="${VC[u]}" fill-opacity=".28"`);s+=poly(START,YN,VC[u],VC[u]).replace('fill="'+VC[u]+'" stroke="'+VC[u]+'" stroke-width="1.2"',`fill="${VC[u]}" fill-opacity=".12" stroke="${VC[u]}" stroke-width="1.2" stroke-dasharray="4 3"`);
    let gin=0,gout=0;STG.slice(1).forEach((b,i)=>{const a=STG[i],f=flowsU(u,a,b),xm=(X(a)+X(b))/2,iw=X(b)-X(a);
      const lay=(arr,dir)=>{const n=arr.length,gap=Math.min(76,iw/(n+.2));arr.forEach(([lab,v],j)=>{const t=Math.max(1,v*k),xi=xm+(j-(n-1)/2)*gap,[et,eb]=ei(xi),edge=dir>0?et:eb,ys=dir>0?TA-30:H-BA+22,col=dir>0?C.gain:C.loss;
        const d=dir>0?`M${xi-26},${ys}C${xi-26},${(ys+edge)/2} ${xi},${(ys+edge)/2-8} ${xi},${edge}`:`M${xi},${edge}C${xi},${(ys+edge)/2+8} ${xi+26},${(ys+edge)/2} ${xi+26},${ys}`;
        s+=`<path d="${d}" fill="none" stroke="${col}" stroke-width="${t.toFixed(2)}" stroke-opacity="${f.fut?.3:.8}"${tipAttr(tipHTML(`${a}–${b}: ${lab}`,[[f.fut?"prognoos":"ametlik",(dir>0?"+":"−")+n0(v)],["perioodi pikkus",(b-a)+" a"],["keskmiselt aastas",(dir>0?"+":"−")+n0(v/(b-a))]]))}/>`;
        if(f.fut)s+=`<path d="${d}" fill="none" stroke="${col}" stroke-width="1" stroke-dasharray="3 3" pointer-events="none"/>`;
        const st=(dir>0?(gin++)%2:(f.fut?0:(gout++)%3))*24,tx=dir>0?xi-26:xi+26,ty=dir>0?ys-14-st:ys+12+st;if(st)s+=`<line x1="${tx}" x2="${tx}" y1="${dir>0?ty+4:ty-12}" y2="${ys}" stroke="${col}" stroke-opacity=".4"/>`;
        s+=`<text x="${tx}" y="${ty}" text-anchor="middle" class="t-num" style="fill:${col}">${dir>0?"+":"−"}${f0(v)}</text><text x="${tx}" y="${ty+(dir>0?-13:13)}" text-anchor="middle" class="t-ax">${lab.replace("registri parandused","parandused")}</text>`;});};
      lay(f.inn,1);lay(f.out,-1);});
    STG.forEach(y=>{const x=X(y);s+=`<line x1="${x}" x2="${x}" y1="${top(y)}" y2="${bot(y)}" stroke="${y===START?C.ink:C.bg}" stroke-width="${y===START?2:1}"${y>START?' stroke-dasharray="3 2"':""}/>`;
      s+=`<text x="${x+(y===2015?4:y===YN?-4:0)}" y="${y0-3}" text-anchor="${y===2015?"start":y===YN?"end":"middle"}" class="t-lab" style="paint-order:stroke;stroke:${C.bg};stroke-width:3px">${y}${y===START?" täna":y>START?" *":""}</text><text x="${x+(y===2015?4:y===YN?-4:0)}" y="${y0+13}" text-anchor="${y===2015?"start":y===YN?"end":"middle"}" class="t-num" style="paint-order:stroke;stroke:${C.bg};stroke-width:3px">${n0(popT(u,y))}</text>`;});
    s+=`<text x="${W-R}" y="16" text-anchor="end" class="t-cap">TÜVE KÕRGUS JA VOO PAKSUS SAMAS MÕÕTKAVAS · ${n0(popT(u,2015))} IN = ${(popT(u,2015)*k).toFixed(0)} PX</text>`;
    return s+"</svg>";}
  /* ======== 7. SIHI NIIDID (vallad kõrvuti, lohistatav siht) ======== */
  let MODE="read";const CVD=[-0.3,0.3];
  function track(u,W,drag,need){const H=74,L=14,R=14,cy=42,X=x=>L+(Math.max(CVD[0],Math.min(CVD[1],x))-CVD[0])/(CVD[1]-CVD[0])*(W-L-R),p26=POP[u].tot["2026"],tgt=MODE==="target",col=VC[u];
    const pats=MIGS_ALL.map(m=>SC[m][u][YN]/p26-1),b0=Math.min(...pats),b1=Math.max(...pats),cur=drag!=null?drag:popT(u,YN)/p26-1,urp=urpAt(u,"A",YN)/p26-1;
    let s="";for(let x=-0.3;x<=0.3001;x+=0.1)s+=`<line x1="${X(x)}" x2="${X(x)}" y1="${cy-15}" y2="${cy+15}" stroke="${Math.abs(x)<1e-6?C.line2:C.line}" stroke-width="${Math.abs(x)<1e-6?1.6:1}"/>`;
    s+=`<line x1="${L}" x2="${W-R}" y1="${cy}" y2="${cy}" stroke="${C.line2}"/>`;
    s+=`<rect x="${X(b0)}" y="${cy-9}" width="${Math.max(2,X(b1)-X(b0))}" height="18" fill="url(#h-${vk(u)})" stroke="${col}" stroke-opacity=".5"${tipAttr(tipHTML(`${NAME[u]}: viis rändemustrit 2036`,MIGS_ALL.map(m=>[MS[m],n0(SC[m][u][YN])+" ("+pct(SC[m][u][YN]/p26-1)+")"]),"ilma hoobadeta"))}/>`;
    for(let y=2015;y<=2025;y++){const v=POP[u].tot[String(y)]/p26-1;s+=stitch(X(v),cy,2.8,col,false,` opacity="${(0.3+0.6*(y-2015)/10).toFixed(2)}"`+tipAttr(tipHTML(`${NAME[u]} ${y} (ametlik)`,[["rahvaarv",n0(POP[u].tot[String(y)])],["võrreldes 2026",pct(v)]])));}
    s+=`<text x="${X(POP[u].tot["2015"]/p26-1)}" y="${cy+28}" text-anchor="middle" class="t-ax">2015</text>`;
    s+=`<path d="M${X(urp)},${cy-20}l4,4l-4,4l-4,-4Z" fill="${C.ref}"${tipAttr(tipHTML("ÜRP A (seniste trendide jätk) 2036",[["vahepunkt",n0(urpAt(u,"A",YN))],["võrreldes 2026",pct(urp)],["allikas","ÜRP teadusaruanne, tabel 2.1.2"]],"ÜRP baas (tabel 2.1.1) on rändeta teoreetiline stsenaarium, B ja C on sihtstsenaariumid, mitte prognoosid."))}/>`;
    if(u==="MAAK"){const sa=EXT.SA.R.pop[YN]/p26-1;s+=`<rect x="${X(sa)-3.5}" y="${cy-23}" width="7" height="7" fill="none" stroke="${C.ref}" stroke-width="1.5"${tipAttr(tipHTML("Statistikaameti prognoos 2036",[["rahvaarv",n0(EXT.SA.R.pop[YN])],["võrreldes 2026",pct(sa)]]))}/>`;}
    s+=`<line x1="${X(0)}" x2="${X(cur)}" y1="${cy}" y2="${cy}" stroke="${col}" stroke-width="3"/>`;
    const hx=X(cur),txt=drag!=null?`siht ${n0(p26*(1+cur))} (${pct(cur)})${need!=null?` → lisaränne ${sgn(need)}/a`:""}`:`2036: ${n0(p26*(1+cur))} · ${pct(cur)}`;
    if(tgt)s+=`<circle cx="${hx}" cy="${cy}" r="15" fill="${col}" fill-opacity=".14"/>`;
    s+=stitch(hx,cy,tgt?10:8,col,true);if(tgt)s+=`<path d="M${hx-3},${cy-3}v6M${hx},${cy-3}v6M${hx+3},${cy-3}v6" stroke="${col}" stroke-width="1.2"/>`;
    s+=`<text x="${Math.max(W*0.3,Math.min(W*0.7,hx))}" y="13" text-anchor="middle" class="t-num" style="fill:${drag!=null?C.kid:C.ink}">${e(txt)}</text>`;
    return tgt?`<svg viewBox="0 0 ${W} ${H}" class="k9trk tgt" data-u="${u}" role="slider" tabindex="0" aria-label="${e(NAME[u])}: sea 2036. aasta siht. Lohista või kasuta nooleklahve." aria-valuemin="-30" aria-valuemax="30" aria-valuenow="${(cur*100).toFixed(1)}" aria-valuetext="${pct(cur)}">${s}</svg>`
      :`<svg viewBox="0 0 ${W} ${H}" class="k9trk" data-u="${u}" role="img" aria-label="${e(NAME[u])}: rahvaarvu muutus 2026–2036 ${pct(cur)}">${s}</svg>`;}
  function lanes(W){const tw=W<760?W-4:W-460,ax=[];for(let x=-0.3;x<=0.3001;x+=0.1)ax.push(x);
    const axis=`<svg viewBox="0 0 ${tw} 18" aria-hidden="true">${ax.map(x=>`<text x="${14+(x+0.3)/0.6*(tw-28)}" y="13" text-anchor="middle" class="t-ax">${x>0?"+":x<0?"−":""}${nf0.format(Math.abs(x*100))}%</text>`).join("")}</svg>`;
    return `<div class="k9lanes${MODE==="target"?" tgt":""}"><div class="k9lane hd"><span></span><div class="trk">${axis}</div><span class="t-capx">Näitajad valitud stsenaariumis</span></div>`+K9.UNITS.map(u=>{const ex=u==="MAAK"?S.extra:(VX[u]||0),m=cvMetrics(u);
      return `<div class="k9lane${S.unit===u?" sel":""}${u==="MAAK"?" tot":""}"><div class="nm"><button type="button" data-unit="${u}"><i style="background:${VC[u]}"></i>${NAME[u]}</button><small>2026: ${n0(POP[u].tot["2026"])} · 2015–26 ${pct(POP[u].tot["2026"]/POP[u].tot["2015"]-1)}</small><span class="ex${ex?" on":""}" id="k9x-${u}">${u==="MAAK"?"lisaränne maakonda":"valla lisaränne"} ${sgn(ex)} in/a</span></div>
        <div class="trk" id="k9t-${u}">${track(u,tw)}</div><div class="mt">${m.map(x=>`<span class="k9mi ${x[2]}"><small>${x[0]}</small><b>${x[1]}</b></span>`).join("")}</div></div>`;}).join("")+`</div>`;}
  function bindLanes(host,tw){host.querySelectorAll("[data-unit]").forEach(b=>b.onclick=()=>setUnit(b.dataset.unit));
    if(MODE!=="target")return;host.querySelectorAll("svg.k9trk.tgt").forEach(svg=>{const u=svg.dataset.u;let drag=false,pend=null,raf=0;
      const toPct=ev=>{const r=svg.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*tw;return Math.max(CVD[0],Math.min(CVD[1],CVD[0]+(x-14)/(tw-28)*(CVD[1]-CVD[0])));};
      const preview=t=>{const ex=cvSolve(u,t),bx=document.getElementById("k9x-"+u);bx.textContent=(u==="MAAK"?"lisaränne maakonda ":"valla lisaränne ")+sgn(ex)+" in/a";bx.classList.add("on");svg.innerHTML=track(u,tw,t,ex).replace(/^<svg[^>]*>/,"").replace(/<\/svg>$/,"");svg.setAttribute("aria-valuenow",(t*100).toFixed(1));return ex;};
      const commit=ex=>{if(u==="MAAK")K9.setS({extra:ex},"Maakonna siht → lisaränne "+sgn(ex)+"/a");else{VX[u]=ex;K9.setS({},SHORTN[u]+" siht → valla lisaränne "+sgn(ex)+"/a");}};
      svg.addEventListener("pointerdown",ev=>{drag=true;svg.setPointerCapture&&svg.setPointerCapture(ev.pointerId);pend=toPct(ev);preview(pend);ev.preventDefault();});
      svg.addEventListener("pointermove",ev=>{if(!drag)return;pend=toPct(ev);cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>preview(pend));});
      const end=()=>{if(!drag)return;drag=false;cancelAnimationFrame(raf);commit(cvSolve(u,pend));};svg.addEventListener("pointerup",end);svg.addEventListener("pointercancel",end);
      svg.addEventListener("keydown",ev=>{if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(ev.key))return;ev.preventDefault();const cur=popT(u,YN)/POP[u].tot["2026"]-1,t=cur+((ev.key==="ArrowRight"||ev.key==="ArrowUp")?0.005:-0.005);commit(cvSolve(u,t));
        requestAnimationFrame(()=>{const n=document.querySelector(`svg.k9trk[data-u="${u}"]`);n&&n.focus();});});});}
  /* ======== 8. TÖÖ ASUKOHT (isotüüp) ======== */
  const CK=[["same","samas vallas",C.work],["cty","teises vallas maakonnas","#C9E8A0"],["tln","Tallinnas",C.sc],["oe","mujal Eestis",C.kid],["abr","välismaal",C.old]];
  const comRow=v=>{const c=v==="MAAK"?["t","tln","trt","same","cty","oth","abr"].reduce((o,k)=>(o[k]=V.reduce((s,w)=>s+EXT.COM[w][k],0),o),{}):EXT.COM[v];return {...c,oe:c.oth-c.tln};};
  function commute(W){const narrow=W<640,unit=100,L=narrow?70:120,sq=narrow?5:11,gp=narrow?1.2:2,per=narrow?5:4,colW=sq+gp,rowH=per*(sq+gp)+30;let y=10,s="";
    K9.UNITS.forEach(v=>{const c=comRow(v);let col=0;s+=`<text x="${L-10}" y="${y+per*(sq+gp)/2+4}" text-anchor="end" class="t-lab"${S.unit===v?` style="fill:${C.kid}"`:""}>${v==="MAAK"?"Maakond":SHORTN[v]}</text>`;
      CK.forEach(([k,lab,cc])=>{const n=Math.round(c[k]/unit),x0=L+col*colW;
        let idx=col*per;for(let i=0;i<n;i++,idx++){const cx=L+Math.floor(idx/per)*colW,cy=y+(idx%per)*(sq+gp);s+=`<rect x="${cx}" y="${cy}" width="${sq}" height="${sq}" fill="${cc}"/>`;}
        const cols=Math.ceil(n/per);if(n)s+=`<rect x="${x0}" y="${y}" width="${Math.max(1,cols*colW)}" height="${per*(sq+gp)}" fill="transparent"${tipAttr(tipHTML(`${v==="MAAK"?"Maakond":NAME[v]}: ${lab}`,[["hõivatuid",n0(c[k])],["osakaal",pp(c[k]/c.t)]],"REL 2021"))}/>`;
        if(!n&&c[k]>0)s+=`<text x="${x0+2}" y="${y+per*(sq+gp)+12}" class="t-ax" style="fill:${cc}">${lab} ${n0(c[k])}, alla 1 ruudu</text>`;
        if(c[k]/c.t>=0.12&&cols*colW>34)s+=`<text x="${x0}" y="${y+per*(sq+gp)+12}" class="t-ax" style="fill:${cc}">${nf0.format(c[k]/c.t*100)}%</text>`;
        col+=cols;});
      s+=`<text x="${L+col*colW+8}" y="${y+per*(sq+gp)/2+4}" class="t-num">${n0(c.t)}</text>`;y+=rowH;});
    const Wn=Math.max(W,L+Math.ceil(comRow("MAAK").t/unit/per+CK.length)*colW+70);
    return `<svg viewBox="0 0 ${Wn} ${y}" role="img" aria-label="Hõivatute töökoha asukoht, 1 ruut = 100 hõivatut (REL 2021).">${s}</svg>`;}
  /* ======== 9. EESMÄRGI NÕELAD ======== */
  const num=t=>{const m=String(t).replace(/ /g," ").match(/[−+-]?\d[\d ]*(?:,\d+)?/);if(!m)return null;let x=parseFloat(m[0].replace(/ /g,"").replace(",",".").replace("−","-"));if(/%/.test(String(t).slice(m.index,m.index+m[0].length+2)))x/=100;return x;};
  function needles(W,offOnly){const rows=goalRows().filter(r=>(S.unit==="MAAK"||r.u==="MAAK"||r.u===S.unit)&&(!offOnly||GCLS(r)[0]==="ametlik")),narrow=W<700,LW=narrow?0:330,rh=narrow?96:62,H=rows.length*rh+20,x0=narrow?14:LW+10,x1=W-(narrow?14:110);let s="";
    rows.forEach((r,i)=>{const y=10+i*rh+(narrow?52:34);const t=num(r.tgt),now=num(r.now),vals=[...r.vals,r.sel,t,now].filter(v=>v!=null&&isFinite(v));let lo=Math.min(...vals),hi=Math.max(...vals);const pd=(hi-lo)*0.12||Math.abs(hi)*0.05||1;lo-=pd;hi+=pd;const X=lin(lo,hi,x0,x1);
      const okUp=t!=null?r.ok(t+Math.abs(t)*1e-3+1e-6):true,col=C[r.st==="ok"?"ok":r.st==="mid"?"warn":"crit"];
      s+=`<text x="${narrow?x0:10}" y="${narrow?y-34:y-14}" class="t-lab"><tspan fill="${VC[r.u]}">◆</tspan> ${e(r.label)}</text>`;if(!narrow)s+=`<text x="10" y="${y+4}" class="t-ax">${e(DOCS[r.u][0])}</text>`;
      if(t!=null){s+=`<rect x="${okUp?X(t):x0}" y="${y-7}" width="${okUp?x1-X(t):X(t)-x0}" height="14" fill="${C.ok}" fill-opacity=".13"/>`;}
      s+=`<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="${C.line2}"/>`;
      r.vals.forEach((v,j)=>{s+=`<line x1="${X(v)}" x2="${X(v)}" y1="${y-6}" y2="${y+6}" stroke="${C.mut}" stroke-width="1.4"${tipAttr(tipHTML(r.label,[["rändemuster "+["2016–21","keskmine","2021–26"][j],r.fmt(v)]],"2035, ilma muudatuseta valitud hoobades"))}/><text x="${X(v)}" y="${y+17}" text-anchor="middle" class="t-ax" style="font-size:9.5px">${["16–21","kesk.","21–26"][j]}</text>`;});
      if(now!=null)s+=stitch(X(now),y,4,C.ink,false,tipAttr(tipHTML(r.label,[["2026 tegelik",r.now]])));
      if(t!=null)s+=`<line x1="${X(t)}" x2="${X(t)}" y1="${y-18}" y2="${y+8}" stroke="${C.ink}" stroke-width="1.6"/><circle cx="${X(t)}" cy="${y-18}" r="3.6" fill="${C.bg}" stroke="${C.ink}" stroke-width="1.6"/><text x="${X(t)+6}" y="${y-15}" class="t-ax" style="fill:${C.ink}">siht ${e(r.tgt)}</text>`;
      s+=stitch(X(r.sel),y,7,col,true,tipAttr(tipHTML(r.label,[["valitud stsenaarium",r.fmt(r.sel)],["siht",r.tgt],["hinnang",{ok:"saavutatav",mid:"piiri peal",bad:"ei täitu"}[r.st]]])))+stGlyph(r.st==="ok"?"ok":r.st==="mid"?"warn":"crit",X(r.sel),y,3);
      if(!narrow)s+=`<text x="${x1+10}" y="${y+4}" class="t-num" style="fill:${col}">${e(r.fmt(r.sel))}</text>`;});
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Arengukavade mõõdetavad eesmärgid ja valitud stsenaarium.">${s}</svg>`;}
  /* ======== 10. TAGASITEST ======== */
  function btData(){return V.map(v=>{const act=POP[v].tot["2026"],ins=projectFrom(v,2021,2026,CAL[v].r2full,CAL[v].fMid,()=>CAL[v].k2125)[2026].reduce((a,b)=>a+b,0),oos=projectFrom(v,2021,2026,CAL[v].r1full,CAL[v].fOld,()=>CAL[v].k1620)[2026].reduce((a,b)=>a+b,0);return {v,act,ins,oos,ei:ins/act-1,eo:oos/act-1};});}
  let BT=null;
  function dumb(W){if(!BT)BT=btData();const L=W<640?80:130,R=30,rh=44,H=BT.length*rh+46,lim=Math.max(0.08,...BT.map(b=>Math.abs(b.eo)+0.01)),X=lin(-lim,lim,L,W-R);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tagasitest: 2026. aasta rahvaarvu prognoosiviga.">`;
    [-lim,-lim/2,0,lim/2,lim].forEach(t=>s+=`<line x1="${X(t)}" x2="${X(t)}" y1="14" y2="${H-26}" stroke="${t===0?C.ink:C.line}" stroke-opacity="${t===0?.6:1}"/><text x="${X(t)}" y="${H-10}" text-anchor="middle" class="t-ax">${pct(t,0)}</text>`);
    s+=`<text x="${X(0)}" y="10" text-anchor="middle" class="t-cap">TEGELIK 1.01.2026</text>`;
    BT.forEach((b,i)=>{const y=26+i*rh+10;s+=`<text x="${L-10}" y="${y+4}" text-anchor="end" class="t-lab">${SHORTN[b.v]}</text><line x1="${X(b.ei)}" x2="${X(b.eo)}" y1="${y}" y2="${y}" stroke="${VC[b.v]}" stroke-width="2"/>`;
      s+=`<circle cx="${X(b.ei)}" cy="${y}" r="5" fill="${C.bg}" stroke="${VC[b.v]}" stroke-width="2"${tipAttr(tipHTML(NAME[b.v],[["rände kalibreerimine 2021–26",n0(b.ins)],["viga",pct(b.ei)]]))}/>`;
      s+=`<rect x="${X(b.eo)-5}" y="${y-5}" width="10" height="10" fill="${VC[b.v]}"${tipAttr(tipHTML(NAME[b.v],[["ainult 2016–21 teadmine",n0(b.oos)],["viga",pct(b.eo)]]))}/><text x="${X(b.eo)+(b.eo<0?-10:10)}" y="${y+4}" text-anchor="${b.eo<0?"end":"start"}" class="t-num" style="fill:${Math.abs(b.eo)>0.03?C.warn:C.ink}">${pct(b.eo)}</text>`;});
    return s+"</svg>";}
  /* ======== VAADE ======== */
  const NAVS=[["k9-prog","Praegune seis ja ajalugu"],["k9-kaart","Rahvastik kaardil"],["k9-alli","Sünnid, surmad ja ränne"],["k9-polv","Vanuskoostis"],["k9-progn","Rahvastikuprognoos"],["k9-sihid","Valdade võrdlus"],["k9-too","Tööhõive"]];
  K9.VIEWS.rahvastik={
    build(el){el.innerHTML=`<div class="k9intro"><div><p class="kick">Rahvastik</p><h1>Kuidas rahvastik muutub?</h1><a class="k9treelink" href="#ylevaade/k9-puu" data-tree="pop">⟡ Ava arengupuus</a></div><p class="lead" data-k9="lead"></p></div><div class="k9branches"><div class="k9branch" data-k9branch="pop"></div></div>
      <nav class="k9sub" aria-label="Rahvastiku alajaotused">${NAVS.map(([i,t])=>`<a href="#rahvastik/${i}">${t}</a>`).join("")}</nav>
      ${sec("k9-prog","Rahvaarv 2015–2036","Täis märgid on mõõdetud, avatud märgid prognoos. Märgi kuju ja suurus on aastamuutus.",`<div data-k9="cloth"></div>`)}
      ${sec("k9-kaart","Rahvastik kaardil","Valdade rahvaarv ja vanuskoostis aastate kaupa (2015–2026 mõõdetud, 2027–2036 prognoos) ning asustusüksuste elanikud rahvaloenduse 2021 järgi.",`<div data-part="popmap"></div>`)}
      ${sec("k9-polv","Kuidas vanuskoostis muutub?","Tööealiste kiht õheneb, eakate kiht pakseneb.",`<div data-k9="stream"></div><div class="k9grid2"><div data-k9="pyr"></div><div data-k9="aging"></div></div>`)}
      ${sec("k9-alli","Kust inimesed tulevad ja kuhu lähevad?","Varu (rahvaarv 1. jaanuaril) ja perioodi vood on samas mõõtkavas.",`<div data-k9="minard"></div><div data-k9="comps"></div>`)}
      ${sec("k9-progn","Rahvastikuprognoos","Valitud stsenaariumi tulemus kõigis ühikutes ja rändemustrite ulatus (min–max) samas režiimis. Eeldusi muudad peatükis Stsenaariumid.",`<div data-k9="progn"></div><div data-part="btf"></div><div data-part="sens"></div>`)}
      ${sec("k9-sihid","Valdade võrdlus","Vallad kõrvuti: 2036 võrreldes 2026. Sihi režiimis lohista märki või kasuta nooleklahve: mudel arvutab vajaliku lisarände (kasutaja seatud siht, mitte ametlik eesmärk).",`<div data-k9="lanes"></div><details class="k9moved k9det" data-k9="cmpmv"><summary>Täpsed väärtused: vallad kõrvuti</summary></details>`)}
      ${sec("k9-too","Tööhõive ja töökohtade asukoht","Hõivatute töökoha asukoht (REL 2021, viimane valla tasemel mõõtmine). Allpool: tööturg ametliku statistika põhjal (hõive, töötus, registreeritud töötus, palk, töökohad, pendelränne 2015–2026) ja ministeeriumi töövaldkonna uuringute leiud.",`<div class="k9seg k9tabs" role="tablist" aria-label="Tööhõive jaotis"><button type="button" role="tab" data-ttab="tt" aria-selected="true">Tööturg (statistika 2015–2026)</button><button type="button" role="tab" data-ttab="com" aria-selected="false">Kus elanikud töötavad (REL 2021)</button><button type="button" role="tab" data-ttab="mkm" aria-selected="false">Uuringute leiud (MKM)</button></div><div data-tpan="tt"><div data-part="tooturg"></div></div><div data-tpan="com" hidden><div data-k9="com"></div></div><div data-tpan="mkm" hidden><div data-part="mkmtoo"></div></div>`)}`;
      const nx=id=>{const t=document.getElementById(id);return t?t.closest(".tablewrap"):null;},after=n=>n&&n.nextElementSibling&&n.nextElementSibling.classList.contains("pmeta")?n.nextElementSibling:null;
      const cm=el.querySelector('[data-k9="cmpmv"]'),cw_=nx("cmpBody");if(cw_)cm.appendChild(cw_);
      el.addEventListener("click",ev=>{const b=ev.target.closest("[data-mode]");if(b){MODE=b.dataset.mode;this.update(el);return;}
        if(ev.target.closest("[data-ext]")){showExt=!showExt;this.update(el);return;}
        if(ev.target.closest("[data-cvreset]")){V.forEach(v=>VX[v]=0);K9.setS({extra:0},"Sihid lähtestatud");return;}
        const py=ev.target.closest("[data-pyr]");if(py){stopPlay();S.pyr=+py.dataset.pyr;drawPyr(el);return;}
        if(ev.target.closest("[data-pyrplay]")){if(PLAY){stopPlay();drawPyr(el);return;}let y=S.pyr>=YN?2015:S.pyr;const step=()=>{S.pyr=y;drawPyr(el);y++;if(y>YN){stopPlay();drawPyr(el);}};
          if(K9.RMQ.matches){S.pyr=YN;drawPyr(el);return;}PLAY=setInterval(step,700);step();return;}});
      el.addEventListener("input",ev=>{if(ev.target.id==="k9pyrY"){stopPlay();S.pyr=+ev.target.value;drawPyr(el,true);}});},
    update(el){const u=S.unit,p26=POP[u].tot["2026"],p36=popT(u,YN);
      el.querySelector('[data-k9="lead"]').innerHTML=`${NAME[u]}: 1. jaanuaril 2026 elas ${n0(p26)} inimest (2015: ${n0(POP[u].tot["2015"])}). Valitud eeldustel on 2036. aastal <b>${n0(p36)}</b> (${pct(p36/p26-1)}). Rändemuster: ${e(MIGL[S.mig])}.`;
      const q=k=>el.querySelector(`[data-k9="${k}"]`),w=k=>K9.wOf(q(k));
      const tg=K9.TGT[u];
      q("cloth").innerHTML=fig({title:`Rahvaarv 2015–2036 · ${NAME[u]}`,read:"Paks joon: mõõdetud → valitud stsenaarium. Viirutatud vahemik: juhusliku kõikumise vahemik (80%) (juhuslikkus sünnis ja rändes). Peened jooned: rändemustri valik. Paremal on iga tuleviku 2036. aasta väärtus.",
        ctl:`<button type="button" class="k9btn ghost sm" data-ext aria-pressed="${showExt}">${showExt?"Peida":"Näita"} välised võrdlusprognoosid</button>`,
        legend:[lg.act(VC[u],"tegelik (1. jaanuar)"),lg.fc(VC[u],"valitud stsenaarium"),lg.tri("aastamuutus: ▲ kasv, ▼ kahanemine, suurus ∝ muutus"),lg.unc(vk(u),`määramatus: juhusliku kõikumise vahemik (80%) (${MC_N} simulatsiooni)`),lg.thr(VC[u],"viis rändemustrit (ilma hoobadeta)"),showExt?lg.ref(C.ref,u==="MAAK"?"Statistikaamet 2024 ja ÜRP A–D":"ÜRP A–D ja baas (rändeta, teoreetiline); B ja C on sihtstsenaariumid, mitte prognoos (geomeetriline vahepunkt)"):"",tg?lg.needle(`siht: ${tg[2]}`):""].filter(Boolean),
        body:cloth(u,w("cloth")),note:K9.PROV.UNC.mc+" "+K9.PROV.UNC.rng+" Telg ei alga nullist, et väikesed erinevused oleksid näha.",src:"Statistikaamet RV0282U (ajalugu), kohortmudel v6, ÜRP koonduuringu teadusaruanne 2025, tabelid 2.1.1–2.1.6 (baas: tabel 2.1.1, A: tabel 2.1.2), Statistikaamet RV085 (2024. aasta prognoos)",table:clothTable(u)});
      const sd=stream(u,w("stream"));
      q("stream").innerHTML=fig({title:`Vanuserühmad 2015–2036 · ${NAME[u]}`,read:"Riba paksus on inimeste arv (mõõtkava vasakul). Vanuserühmad on ühes vormis, et oleks näha, kuidas tööealiste kiht õheneb ja eakate kiht pakseneb. Viirutatud osa on prognoos.",
        legend:[lg.sq(C.kid,"0–14"),lg.sq(C.work,"15–64"),lg.sq(C.old,"65+"),lg.fcsq(C.ink,"prognoos (heledam, katkendlik serv)")],body:sd.svg,src:"Statistikaamet RV0282U, kohortmudel v6",
        table:K9.table(["Aasta","0–14","15–64","65+","Kokku","65+ osakaal"],yrs(2015,YN).map((y,i)=>[String(y)+(y>START?" *":""),...sd.g[i].map(n0),n0(sd.tot[i]),pp(sd.g[i][2]/sd.tot[i])]))});
      drawPyr(el);
      q("aging").innerHTML=fig({title:"Vananemise teekond",read:"Iga niit on üks vald: paremale = rohkem eakaid, alla = vähem lapsi. Täis pisted on ametlik ajalugu, avatud pisted prognoos.",legend:[lg.act(C.ink,"2015–2026"),lg.fc(C.ink,"2027–2036")],body:aging(w("aging")),src:"Statistikaamet RV0282U, kohortmudel v6",
        table:K9.table(["Vald","0–14 2015","0–14 2026","0–14 2036","65+ 2015","65+ 2026","65+ 2036"],V.map(v=>[NAME[v],...[2015,START,YN].map(y=>pp(shares(v,y).kids)),...[2015,START,YN].map(y=>pp(shares(v,y).old))]))});
      const mf=[];STG.slice(1).forEach((b,i)=>{const a=STG[i],f=flowsU(u,a,b);f.inn.forEach(x=>mf.push([`${a}–${b}`+(f.fut?" *":""),x[0],"+"+n0(x[1])]));f.out.forEach(x=>mf.push([`${a}–${b}`+(f.fut?" *":""),x[0],"−"+n0(x[1])]));});
      q("minard").innerHTML=fig({title:`Lisandumise ja lahkumise voog · ${NAME[u]}`,read:"Tüve kõrgus on rahvaarv 1. jaanuaril (varu). Ülevalt sisenevad lisandujad, alla väljuvad lahkujad (perioodi vood). Tüvi ja vood on samas mõõtkavas, seega vood on tüvega võrreldes õhukesed. Alates 2026 on vood prognoos: rände saldo valitud mustri järgi ja loomulik muutus jäägina.",
        legend:[lg.sq(C.gain,"lisandus"),lg.sq(C.loss,"lahkus"),lg.txt("hele voog katkendliku keskjoonega = prognoos")],body:minard(u,w("minard")),src:"Statistikaamet (sünnid, surmad, ränne 2015–2025), kohortmudel v6",note:"Registri parandused on rahvaarvu muutuse osa, mida sündmused ei kata (elukohaandmete korrigeerimine).",
        table:K9.table(["Periood","Voog","Inimesi"],mf,{textCols:[1]})});
      const cd=comps(u,w("comps"));
      q("comps").innerHTML=fig({title:`Sünnid, surmad ja ränne 2015–2025 · ${NAME[u]}`,read:`Iga veerg on üks aasta, iga ruut ${cd.unit} inimest. Ülespoole lisandujad, allapoole lahkujad. Valge niit on rahvaarvu tegelik muutus samas mõõtkavas: kui see ei lange kokku ruutude vahega, on erinevus registri parandused.`,
        legend:[lg.sq(C.gain,"sünnid"),lg.sq(C.gain,"sisseränne",true),lg.sq(C.loss,"surmad"),lg.sq(C.loss,"väljaränne",true),`<span>${`<svg width="20" height="14" aria-hidden="true"><circle cx="10" cy="7" r="3.4" fill="${C.ink}"/></svg>`}rahvaarvu muutus</span>`],body:cd.svg,src:"Statistikaamet RV112U, RV49U, RVR02",
        table:K9.table(["Aasta","Sünnid","Surmad","Sisseränne","Väljaränne","Muutus","Registri parandus"],cd.d.map(x=>[String(x.y),n0(x.b),n0(x.dd),n0(x.mi),n0(x.mo),sgn(x.ch),sgn(x.ch-(x.b-x.dd+x.mi-x.mo))]))});
      const lw=K9.wOf(q("lanes")),tw=lw<760?lw-4:lw-460,any=V.some(v=>VX[v])||S.extra;
      q("lanes").innerHTML=fig({title:"Vallad kõrvuti: 2036 võrreldes 2026",ctl:`<div class="k9seg" role="group" aria-label="Režiim"><button type="button" data-mode="read" aria-pressed="${MODE==="read"}">Loe prognoosi</button><button type="button" data-mode="target" aria-pressed="${MODE==="target"}">Sea siht</button></div>${any?`<button type="button" class="k9btn ghost sm" data-cvreset>Lähtesta lisaränne</button>`:""}`,
        read:MODE==="target"?"<b>Sihi režiim.</b> Lohista märki soovitud 2036. aasta tulemuseni. Maakonna rada muudab maakonna lisarännet, valla rada ainult selle valla rännet (eeldab tulijaid väljastpoolt maakonda).":"Täis pisted vasakul on ajalugu 2015–2025, viirutus rändemustrite ulatus (min–max) 2036, romb ÜRP A (seniste trendide jätk), ruut Statistikaamet (maakond) ja suur avatud märk valitud stsenaarium.",
        legend:[lg.act(C.ink,"ajalugu 2015–2025"),lg.unc("vMAAK","vahemik: viie rändemustri min–max 2036"),lg.ref(C.ref,"ÜRP A / Statistikaamet"),lg.fc(C.ink,"valitud stsenaarium 2036")],body:lanes(lw),src:"kohortmudel v6, cvSolve",table:""});
      const lh=q("lanes").querySelector(".k9body");
      bindLanes(lh,tw);
      q("com").innerHTML=fig({title:"Kus elanikud töötavad",read:"Iga ruut on 100 hõivatut (ümardatud). Kohila hõivatutest töötab ligi pool Tallinnas; töökoha asukoht üksi põhjuslikku seost ei tõenda.",legend:CK.map(([k,l,c])=>lg.sq(c,l)),body:commute(w("com")),src:"REL 2021, RL21163",
        table:K9.table(["Ühik","Hõivatuid",...CK.map(c=>c[1])],K9.UNITS.map(v=>{const c=comRow(v);return [v==="MAAK"?"Maakond":NAME[v],n0(c.t),...CK.map(([k])=>n0(c[k])+" ("+pp(c[k]/c.t)+")")];}))});
      q("progn").innerHTML=fig({title:`Rahvastikuprognoos ${YN} · režiim: ${K9.modeLabel()}`,read:`Valitud stsenaarium: ${e(MIGL[S.mig])}. Vahemik on viie rändemustri tulemuste min–max samas režiimis; juhusliku kõikumise vahemik (80%) on juhuslikkus valitud mustris.`,
        body:K9.table(["Ühik","1.01.2026 mõõdetud","2030 prognoos",`${YN} prognoos`,"Muutus","Stsenaariumide ulatus¹","Juhuslik kõikumine²"],K9.UNITS.map(w=>{const [lo,hi]=K9.patRange(w,YN);return {sel:w===u,c:[w==="MAAK"?"Maakond":NAME[w],n0(POP[w].tot["2026"]),K9.rp(popT(w,2030)),K9.rp(popT(w,YN)),pct(popT(w,YN)/POP[w].tot["2026"]-1),K9.rp(lo)+" – "+K9.rp(hi).replace("≈ ",""),K9.rp(MC[w][YN][0])+" – "+K9.rp(MC[w][YN][1]).replace("≈ ","")]};}),{textCols:[0]})+`<p class="k9note">¹ ${e(K9.PROV.UNC.rng)} ² ${e(K9.PROV.UNC.mc)} Prognoosid on ümardatud 10 inimeseni (≈): kohortmudel arvutab üksiku inimese täpsusega, kuid sisendandmed ja eeldused seda täpsust ei toeta.</p>`,
        src:"Statistikaamet RV0282U (1.01.2026), kohortmudel v6",method:"Prognoosi lähteaasta on 2026 (viimane rahvastiku lähteandmestik 1.01.2026). Rändemustri kalibreerimisperiood määrab rände eelduse, mitte prognoosi algusaastat."});}
  };
  /* ======== EESMÄRGID JA SEIRE (osad) ======== */
  /* eesmärgi liik: ametlik = dokumendis arvuline eesmärk; prognoos = arengukava prognoos või võrdlusstsenaarium; mudel = mudeli võrdlusrida */
  const GCLS=r=>/laste \(0–14\) arv püsib/.test(r.label)?["mudel","mudeli võrdlusrida, arengukavas ei ole eesmärk"]:/baasstsenaarium/.test(r.label)?["prognoos","arengukava stsenaarium, arvulist sihti ei ole"]:/kasv 80–120/.test(r.label)?["prognoos","arengukava rändestsenaarium 1 (tõenäolisem), mitte eesmärk"]:["ametlik","dokumendis seatud arvuline eesmärk"];
  const GYEAR=r=>/Märjamaa/.test(r.label)?2036:2035;
  const GRULE="saavutatav = valitud stsenaarium vastab sihile; piiri peal = kuni 5% puudu; ei täitu = rohkem kui 5% puudu (loomuliku iibe puhul piiri peal kuni −50 in/a)";
  const GL={ok:"saavutatav",mid:"piiri peal",bad:"ei täitu"};
  function goalTable(){const rows=goalRows().filter(r=>S.unit==="MAAK"||r.u==="MAAK"||r.u===S.unit);
    return K9.table(["Eesmärk","Liik","Dokument","Sihtaasta","Lähtetase","2026 (praegune)","Siht","Valitud stsenaarium","Hinnang"],rows.map(r=>{const [c,ct]=GCLS(r);return {sel:r.u===S.unit,c:[e(r.label)+(r.note?`<br><small>${e(r.note)}</small>`:""),`<b>${c}</b><br><small>${e(ct)}</small>`,`<a href="${e(DOCS[r.u][1])}" target="_blank" rel="noopener">${e(DOCS[r.u][0])}</a>`,String(GYEAR(r)),e(r.base),e(r.now),e(r.tgt),e(r.fmt(r.sel)),c==="ametlik"?e(GL[r.st]):`ei hinnata (${c})`]};}),{textCols:[0,1,2,4,5,6,7,8]});}
  K9.part("eesm",{html:()=>`<div data-k9="needles"></div>`,update(h){const w=K9.wOf(h);h.querySelector('[data-k9="needles"]').innerHTML=fig({title:"Ametlikud eesmärgid: nõel = siht, avatud märk = valitud stsenaarium",read:"Ainult dokumendis seatud arvulised eesmärgid. Arengukava prognoosid ja mudeli võrdlusread on hinnangu tabelis eraldi märgitud ega lähe koondhinnangusse.",legend:[lg.needle("siht (dokumendist)"),lg.sq(C.ok,"sihi täitmise pool (toon)"),lg.act(C.ink,"2026 tegelik"),lg.fc(C.ink,"valitud stsenaarium (kuju = hinnang)"),lg.st()],body:needles(w,true),src:"valdade arengukavad ja Raplamaa arengustrateegia 2035+, kohortmudel v6",note:"Iga rida on oma skaalal; ridade pikkusi omavahel ei võrrelda. Kasutaja seatud sihid (Valdade võrdlus → Sea siht) ei ole ametlikud eesmärgid."});}});
  K9.part("hinnang",{html:()=>`<div data-k9="gsum"></div><div data-k9="gtbl"></div>`,update(h){const all=goalRows(),off=all.filter(r=>GCLS(r)[0]==="ametlik"),n={ok:0,mid:0,bad:0};off.forEach(r=>n[r.st]++);const oth=all.filter(r=>GCLS(r)[0]!=="ametlik");
    h.querySelector('[data-k9="gsum"]').innerHTML=`<p class="lead">Koondhinnang hõlmab <b>${off.length}</b> ametlikku eesmärki, mida andmete ja mudeliga saab hinnata: saavutatav <b>${n.ok}</b>, piiri peal <b>${n.mid}</b>, ei täitu <b>${n.bad}</b> (stsenaarium: ${e(MIGL[S.mig])}, ${e(K9.modeLabel())}). Hindamisreegel: ${e(GRULE)}.</p><p class="k9note">Koondhinnangust välja jäetud (${oth.length}): ${oth.map(r=>`${e(r.label)} — ${e(GCLS(r)[1])}`).join("; ")}. Hindamata eesmärgid, mille jaoks mudelil puudub näitaja (nt teenuste kvaliteet, ettevõtlus), ei ole siin loetletud; need on valdade arengukavades.</p><p class="k9note">Praegune täitmine (2026 veerg) ja tuleviku prognoos (valitud stsenaarium sihtaastal) on eraldi veergudes.</p>`;
    h.querySelector('[data-k9="gtbl"]').innerHTML=fig({title:"Eesmärkide täitmise hinnang",body:goalTable(),src:"valdade arengukavad, Raplamaa arengustrateegia 2035+, kohortmudel v6 (goalRows)"});}});
  K9.part("seire",{html:()=>`<div class="k9grid2"><div data-k9="old"></div><div data-k9="cf"></div></div><div data-k9="seiretbl" class="k9moved"></div>`,
    bind(h){const t=document.getElementById("seireBody"),w=t?t.closest(".tablewrap"):null;if(w){const nt=w.nextElementSibling&&w.nextElementSibling.classList.contains("pmeta")?w.nextElementSibling:null;h.querySelector('[data-k9="seiretbl"]').appendChild(w);if(nt)h.querySelector('[data-k9="seiretbl"]').appendChild(nt);}},
    update(h){const u=S.unit,q=k=>h.querySelector(`[data-k9="${k}"]`),w=k=>K9.wOf(q(k));
      const o=y=>sh(POP.MAAK.age[String(y)],13,17),eo=y=>EXT.EE.old[y]/EXT.EE.pop[y];
      q("old").innerHTML=fig({title:"65+ osakaal: maakond ja Eesti",read:"Seire mõõdik 2. Maakonna osakaal on juba üle Eesti keskmise.",legend:[lg.act(C.ink,"Rapla maakond"),lg.act(C.ref,"Eesti"),lg.fc(C.ref,"Eesti trend 2022–26")],
        body:K9.lines({W:w("old"),x0:2015,x1:YN,fmt:v=>nf1.format(v*100)+"%",label:"65+ osakaal",series:[{name:"Maakond",col:C.ink,pts:yrs(2015,YN).map(y=>[y,y<=START?o(y):shares("MAAK",y).old]),fc:START,endLab:"maakond "+pp(shares("MAAK",YN).old)},{name:"Eesti",col:C.ref,pts:yrs(2015,START).map(y=>[y,eo(y)]),end:false,r:2.4},{name:"Eesti trend",col:C.ref,pts:[[START,eo(START)],[2035,EST.o35]],fc:true,noStitch:true,endLab:"Eesti trend "+pp(EST.o35)}]}),src:"Statistikaamet RV0282U; Eesti 2035 = 2022–26 trend (tuletatud)"});
      const cf=(f,y)=>f(y)/f(y-1),pu=y=>popT(u,y);
      q("cf").innerHTML=fig({title:`Rahvaarvu muutuse kordaja · ${NAME[u]}`,read:"Kordaja = rahvaarv 1. jaanuaril / rahvaarv aasta varem × 100. Alla 100 tähendab kahanemist.",legend:[lg.act(VC[u],NAME[u]),lg.act(C.ref,"Eesti")],
        body:K9.lines({W:w("cf"),x0:2016,x1:YN,fmt:v=>nf1.format(v),label:"Muutuse kordaja",thr:[{v:100,lab:"100 = ei muutu",col:C.mut}],series:[{name:NAME[u],col:VC[u],pts:yrs(2016,YN).map(y=>[y,cf(pu,y)*100]),fc:START,endLab:nf1.format(cf(pu,YN)*100)},{name:"Eesti",col:C.ref,pts:yrs(2016,YN).map(y=>[y,eeAt(y)/eeAt(y-1)*100]),fc:START,r:2.2,endLab:"Eesti"}]}),src:"Statistikaamet RV0282U, RV085 (Eesti prognoos)",note:document.getElementById("cfNote")?document.getElementById("cfNote").innerHTML:""});
    }});
  K9.part("bt",{html:()=>`<div data-k9="bt"></div><div class="k9moved" data-k9="btmv"></div>`,bind(h){const t=document.getElementById("btBody"),w=t?t.closest(".tablewrap"):null;const bm=h.querySelector('[data-k9="btmv"]');if(w)bm.appendChild(w);moveInto(bm,[["#btCards"]]);},
    update(h){const w=K9.wOf(h.querySelector('[data-k9="bt"]'));h.querySelector('[data-k9="bt"]').innerHTML=fig({title:"Prognoosiviga 1.01.2026: kaks eri kontrolli",read:"Ring = kalibreerimise kooskõlakontroll (ränne on tuletatud sama perioodi rahvaarvust, seega ootuspäraselt täpne; see ei ole sõltumatu test). Ruut = sõltumatu tagasitest: mudelile antakse ainult 2016–2021 teadmine ja võrreldakse 2026. aasta tegeliku rahvaarvuga.",legend:[`<span><svg width="20" height="14" aria-hidden="true"><circle cx="10" cy="7" r="4.5" fill="none" stroke="${C.ink}" stroke-width="2"/></svg>kalibreerimise kooskõlakontroll 2021–26</span>`,lg.sq(C.ink,"sõltumatu tagasitest: ainult 2016–21 teadmine")],body:dumb(w),src:"kohortmudel v6 (projectFrom), Statistikaamet",note:"Kalibreerimise kontrolli ei nimetata tagasitestiks. Tegelik prognoosivõime on ruut."});}});
  K9.part("riskid",{html:()=>`<div data-k9="rk"></div>`,update(h){const u=S.unit,R=K9.kangasRows(u),it=[];R.forEach(r=>{const i=r.st.findIndex((x,j)=>j>0&&x);if(i>0)it.push([r,i]);});
    const basis=r=>r.k==="net"?"seaduse üldpiir 60% (KOFS § 34) ja mudeli hoiatus 50%":r.k==="sch"?"ÜRP koonduuringu lävend (uuringu stsenaariumipiir, mitte õigusnorm)":"mudeli kokkulepe (mitte ametlik lävend)";
    h.querySelector('[data-k9="rk"]').innerHTML=fig({title:`Jälgitavad näitajad · ${NAME[u]}`,read:"Iga rida ilmub ainult siis, kui aktiivses stsenaariumis ületab näitaja oma nähtava reegli. Sõnad „risk” ja „tähelepanu” tähendavad ainult reegli ületamist.",
      body:it.length?K9.table(["Näitaja","Esimene aasta","Mis juhtub","Reegel","Reegli alus","Andmeolek"],it.map(([r,i])=>[e(r.n),String(r.Y[i]),e(r.st[i][1]),e(r.rule),e(basis(r)),r.abs?"eelarve või strateegia":"prognoos"]),{textCols:[0,2,3,4,5]}):`<p class="k9note">Aktiivses stsenaariumis ei ületa ükski kangarida oma reeglit.</p>`,src:"arengukanga read (vt Ülevaade → Arengukangas)"})
      +fig({title:"Andmelüngad, mis piiravad hinnangut",body:K9.table(["Puuduv sisend","Mõju analüüsile","Kus näha"],[["Lasteaia- ja koolikohtade arv","täituvust ja võimekust ei hinnata; ainult nõudluse muutus","Teenused"],["ÜVK võrgud, võimekus ja teeninduspiirkonnad","vee ja kanalisatsiooni koormust ei hinnata","Eluase ja taristu"],["Eakate teenuste kasutus ja kohad","ainult 80+ elanike arv ja kuluhinnang","Teenused → Eakate teenused"],["Tasandus- ja toetusfondi 2027 valdade jaotus","2027 ülekandeid ei arvutata (riigieelarve eelnõu)","Eelarve → Riigieelarve mõju"],["Tööhõive valla tasemel pärast 2021","tulumaksu hõiveeeldus on maakonnaülene hoob","Rahvastik → Tööhõive"]],{textCols:[0,1,2]})});}});
  K9.part("soov",{html:()=>`<div data-k9="sv"></div>`,update(h){const u=S.unit,R=K9.kangasRows(u),g=k=>R.find(r=>r.k===k),last=r=>r.v[r.v.length-1],out=[];
    const sch=g("sch"),la=g("la"),old=g("old"),net=g("net");
    if(last(sch)>sch.b)out.push(["Hinnatud õpilaste arvu järgi lisandub ÜRP lävendist allapoole "+(last(sch)-sch.b)+" kooli ("+sch.b+" → "+last(sch)+")","Koolivõrgu ülevaatus koos kooliealiste prognoosi ja õpilaste liikumise andmetega","vallavalitsus (haridus), volikogu","hinnatud koolinõudlus vs ÜRP lävend (arvutuslik seos)","lävend on uuringu stsenaariumipiir; õpilaste liikumine valdade vahel ei ole mudelis"]);
    if(Math.abs(last(la)/la.b-1)>0.1)out.push(["Hinnatud lasteaianõudlus muutub "+pct(last(la)/la.b-1)+" aastaks "+YN,"Lasteaiarühmade ja kohtade planeerimine; lisada mudelisse kohtade arv","vallavalitsus (haridus)","1–6-aastaste prognoos (arvutuslik seos)","kohtade arv ja käimise määr puuduvad"]);
    if(last(old)-old.b>1)out.push(["65+ osakaal kasvab "+nf1.format(last(old)-old.b)+" p.p.","Hoolduse ja koduteenuste mahu ning kulude kavandamine","vallavalitsus (sotsiaal)","80+ arvu prognoos ja kuluhinnang (arvutuslik seos); teaduskirjandus vananemise kohta (tõlgendus)","teenuse kasutust ja kohti mudel ei sisalda"]);
    const np=last(net)!=null?last(net):net.v.filter(x=>x!=null).slice(-1)[0];if(np!=null&&np>=50)out.push(["Netovõlakoormus strateegias "+nf0.format(np)+"%","Investeeringute ajastuse ja laenuvajaduse ülevaatus eelarvestrateegias","vallavalitsus (rahandus), volikogu","valla eelarvestrateegia (dokument)","mudel ei arvuta võlakoormust"]);
    out.push(["2027 tulumaksu prognoos sõltub seadusega muutuvast KOV määrast (10,64% → 10,23% palgalt)","Kontrollida eelarvestrateegia tulumaksu eeldust; kasutada RE 2027 stsenaariumi võrdlusena","vallavalitsus (rahandus)","tulumaksuseadus RT I, 14.08.2024, 1; RE 2027 eelnõu (dokument)","riigieelarve on eelnõu; tasandusfondi jaotus avaldamata"]);
    h.querySelector('[data-k9="sv"]').innerHTML=fig({title:`Tegevussoovitused · ${NAME[u]}`,read:"Soovitused tulenevad nähtavatest reeglitest ja andmetest. Need ei ole ametlikult kokku lepitud otsused ning nende arvulist mõju mudel ei arvuta.",body:K9.table(["Probleem","Soovitatav tegevus","Võimalik vastutaja","Tõenduse alus","Piirangud"],out,{textCols:[0,1,2,3,4]}),src:"arengukanga read, valdade dokumendid, RE 2027 analüüs (12.10.2026)"});}});
  K9.VIEWS.eesmargid={build(el){el.innerHTML=`<div class="k9intro"><div><p class="kick">Eesmärgid ja seire</p><h1>Kas arengukavade eesmärgid on saavutatavad?</h1></div><p class="lead">Ametlikud eesmärgid on eristatud arengukavade prognoosidest, mudeli võrdlusridadest ja kasutaja seatud sihtidest. Hinnang arvestab aktiivset stsenaariumi.</p></div>
      ${sec("k9-eesm","Ametlikud arengueesmärgid","Dokumendis seatud arvulised eesmärgid ja valitud stsenaariumi tulemus sihtaastal.",`<div data-part="eesm"></div>`)}
      ${sec("k9-hinnang","Eesmärkide täitmise hinnang","Sihtaasta, lähtetase, ühik, dokument ja hindamisreegel iga rea juures.",`<div data-part="hinnang"></div>`)}
      ${sec("k9-seire","Seiremõõdikud","ÜRP seire mõõdikud: 65+ osakaal, rahvaarvu muutuse kordaja ja seiretabel.",`<div data-part="seire"></div>`)}
      ${sec("k9-riskid","Riskid ja jälgimisnimekiri","Reeglipõhine nimekiri ja hinnangut piiravad andmelüngad.",`<div data-part="riskid"></div>`)}
      ${sec("k9-soov","Tegevussoovitused","Probleem, tegevus, võimalik vastutaja, tõenduse alus ja piirangud.",`<div data-part="soov"></div>`)}`;},update(){}};
  function stopPlay(){if(PLAY){clearInterval(PLAY);PLAY=null;}}
  function drawPyr(el,keepFocus){const q=el.querySelector('[data-k9="pyr"]');if(!q)return;const u=S.unit,yr=S.pyr||YN,a=ageVec(u,START),b=ageVec(u,yr);
    q.innerHTML=fig({title:`Vanuseprofiil · ${NAME[u]}`,read:`Vasakul 2026 (ametlik), paremal ${yr}${yr>START?" (prognoos: hele tulp katkendliku servaga)":""}. Peen vahe ribal = kindel arv inimesi (vt allserv). Number on muutus võrreldes 2026. aastaga.`,
      ctl:`<div class="k9seg" role="group" aria-label="Võrdlusaasta">${[2015,2021,2031,YN].map(y=>`<button type="button" data-pyr="${y}" aria-pressed="${yr===y}">${y}</button>`).join("")}</div><label class="k9rng"><span class="sr">Aasta</span><input type="range" id="k9pyrY" min="2015" max="${YN}" step="1" value="${yr}" aria-label="Võrdlusaasta"><output>${yr}</output></label><button type="button" class="k9btn ghost sm" data-pyrplay aria-pressed="${!!PLAY}">${PLAY?"■ Peata":"▶ Aastakihid"}</button>`,
      legend:[lg.sq(C.kid,"0–14"),lg.sq(C.work,"15–64"),lg.sq(C.old,"65+")],body:pyr(u,K9.wOf(q),yr),src:"Statistikaamet RV0282U, kohortmudel v6",
      table:K9.table(["Vanus","2026",String(yr),"Muutus"],AGEL.map((g,i)=>[g,n0(a[i]),n0(b[i]),sgn(Math.round(b[i]-a[i]))]).reverse())});
    if(keepFocus){const r=document.getElementById("k9pyrY");r&&r.focus();}}
})();
