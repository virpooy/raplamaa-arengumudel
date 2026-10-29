/* ---------- EESTI VÕRDLUS: kirivöö, profiililled, mullipilv, tähelepanu vajavad erandid ---------- */
(function(){
  const {C,VC,e,n0,pp,lin,stitch,tri,lg,fig,sec,tipAttr,tipHTML,table,moveInto,pill,iconHTML}=K9;
  const OFF={Rapla:-10.5,Kohila:-3.5,Marjamaa:3.5,Kehtna:10.5};
  /* Hinnangu suund on antud ainult siis, kui põhjendus on selge. neg: "low" = väike väärtus vajab tähelepanu, "high" = suur; null = ainult kirjeldav võrdlus. */
  const META={
    tulem25:{neg:"low",why:"väike põhitegevuse tulem jätab vähe raha investeeringuteks ja laenude tasumiseks"},
    tulem5a:{neg:"low",why:"püsivalt väike tulem vähendab investeerimisvõimet"},
    gap:{neg:"high",why:"kui kulud kasvavad tuludest kiiremini, väheneb tulem"},
    persCAGR:{neg:null,why:"palgakasv võib olla teadlik valik; ainult kirjeldav"},
    sotsPerCap:{neg:null,why:"suurem toetus elaniku kohta ei ole iseenesest halb tulemus; kirjeldav"},
    finKulu:{neg:"high",why:"suurem intressikoormus vähendab vaba raha"},
    finKordaja:{neg:"high",why:"kiiresti kasvav intressikulu viitab intressiriskile"},
    refi:{neg:"high",why:"korduv refinantseerimine suurendab sõltuvust laenuturust"},
    fondid:{neg:null,why:"riigi fondide osakaal kirjeldab tulubaasi; hinnangut ei anta"},
    tmPerCap:{neg:null,why:"kirjeldab tulubaasi; hinnangut ei anta"},
    invPerCap:{neg:null,why:"väike investeering võib olla nii säästlikkus kui alainvesteerimine; kirjeldav"},
    popMuutus:{neg:"low",why:"kahanev rahvaarv vähendab tulumaksu baasi"}};
  const rng=ind=>{const a=i2all(ind).filter(isFinite).sort((x,y)=>x-y);return {a,lo:a[Math.floor(a.length*0.03)],hi:a[Math.ceil(a.length*0.97)-1],md:a[Math.floor(a.length/2)],q15:a[Math.floor(a.length*0.15)],q85:a[Math.floor(a.length*0.85)]};};
  /* erand = Eesti äärmine 15% kummaltki poolt; tähelepanu = erand selles suunas, mille kohta on põhjendus */
  function cls(ind,x){const p=i2pct(ind,x),m=META[ind.k]||{},ext=p<0.15?"low":p>=0.85?"high":null;return {p,ext,att:!!ext&&m.neg===ext,m};}
  const clsTxt=c=>c.att?"tähelepanu: äärmine 15% põhjendatud suunas":c.ext?"erand (äärmine 15%), hinnanguta":"tavapärane vahemik";
  /* ======== KIRIVÖÖ ======== */
  function belt(W){const narrow=W<700,L=narrow?124:270,R=narrow?14:76,rh=narrow?44:48,T=28,H=T+IND2.length*rh+16;
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Raplamaa valdade paiknemine ${PEERS.R.length} Eesti omavalitsuse seas ${IND2.length} näitaja järgi.">`;
    s+=`<text x="${L}" y="14" class="t-cap">◂ VÄIKSEM</text><text x="${W-R}" y="14" text-anchor="end" class="t-cap">SUUREM ▸</text>`;
    IND2.forEach((ind,i)=>{const {a,lo,hi,md,q15,q85}=rng(ind),X=x=>L+Math.max(0,Math.min(1,(x-lo)/((hi-lo)||1)))*(W-L-R),cy=T+i*rh+rh/2,m=META[ind.k]||{};
      s+=`<rect x="0" y="${T+i*rh}" width="${W}" height="${rh}" fill="${i%2?"transparent":"rgba(241,235,221,.02)"}"/>`;
      [["low",L,X(q15)],["high",X(q85),W-R]].forEach(([side,x0,x1])=>{const att=m.neg===side;s+=`<rect x="${x0}" y="${cy-15}" width="${Math.max(0,x1-x0)}" height="30" fill="${att?C.warn:C.ink}" fill-opacity="${att?.13:.05}"/><line x1="${side==="low"?x1:x0}" x2="${side==="low"?x1:x0}" y1="${cy-15}" y2="${cy+15}" stroke="${att?C.warn:C.dim}" stroke-dasharray="2 2"/>`;});
      s+=`<text x="${L-12}" y="${cy-2}" text-anchor="end" class="t-lab" style="font-size:${narrow?11:13}px">${e(narrow?ind.n.replace(", % tuludest","").replace(" €/elanik"," €/el."):ind.n)}</text><text x="${L-12}" y="${cy+13}" text-anchor="end" class="t-ax" style="fill:${m.neg?C.warn:C.dim}">${m.neg?(m.neg==="high"?"tähelepanu: suur väärtus":"tähelepanu: väike väärtus"):"kirjeldav, hinnanguta"}</text>`;
      s+=`<line x1="${L}" x2="${W-R}" y1="${cy}" y2="${cy}" stroke="${C.line2}"/>`;
      a.forEach(x=>{if(x>=lo&&x<=hi)s+=`<line x1="${X(x).toFixed(1)}" x2="${X(x).toFixed(1)}" y1="${cy-5}" y2="${cy+5}" stroke="${C.dim}" stroke-opacity=".6"/>`;});
      const nlo=a.filter(x=>x<lo).length,nhi=a.filter(x=>x>hi).length;
      if(nlo)s+=`<path d="M${L-1},${cy}l7,-5v10Z" fill="${C.mut}"/><text x="${L+9}" y="${cy-8}" class="t-ax" style="font-size:10.5px">${nlo} väljas</text>`;
      if(nhi)s+=`<path d="M${W-R+1},${cy}l-7,-5v10Z" fill="${C.mut}"/><text x="${W-R-9}" y="${cy-8}" text-anchor="end" class="t-ax" style="font-size:10.5px">${nhi} väljas</text>`;
      s+=`<line x1="${X(md)}" x2="${X(md)}" y1="${cy-15}" y2="${cy+15}" stroke="${C.ink}" stroke-width="1.6"/><path d="M${X(md)},${cy-21}l3.5,3.5l-3.5,3.5l-3.5,-3.5Z" fill="${C.bg}" stroke="${C.ink}" stroke-width="1.2"/>`;
      V.forEach(v=>{const x=i2v(v,ind),sel=S.unit==="MAAK"||S.unit===v,c=cls(ind,x),out=x<lo||x>hi,r_=sel?5.6:3.8,xx=X(x),yy=cy+OFF[v];
        s+=`<g opacity="${sel?1:.35}"${tipAttr(tipHTML(`${PNAME[v]} · ${ind.n}`,[["väärtus",ind.f(x)],["protsentiil Eesti KOV seas",nf0.format(c.p*100)],["Eesti mediaan",ind.f(md)],["seis",clsTxt(c)],["alus",m.why||""]],out?"väärtus on skaalast väljas; märk on serval, tegelik väärtus ülal":"RR300, protsentiil"))}>`;
        if(c.ext)s+=`<circle cx="${xx}" cy="${yy}" r="${r_+3.4}" fill="none" stroke="${c.att?C.warn:C.ink}" stroke-width="${c.att?2:1.2}"/>`;
        s+=`<path d="M${xx},${yy-r_}L${xx+r_},${yy}L${xx},${yy+r_}L${xx-r_},${yy}Z" fill="${VC[v]}" stroke="${C.bg}"/></g>`;
        if(out&&sel)s+=`<text x="${xx+(x<lo?10:-10)}" y="${yy+4}" text-anchor="${x<lo?"start":"end"}" class="t-ax" style="fill:${VC[v]};font-size:10.5px">${e(ind.f(x))}</text>`;});
      if(!narrow)s+=`<text x="${W-R+10}" y="${cy+4}" class="t-ax">${e(ind.f(md))}</text>`;});
    if(!narrow)s+=`<text x="${W-R+10}" y="14" class="t-cap">MEDIAAN</text>`;
    return s+"</svg>";}
  function beltTable(){return table(["Näitaja","Hinnangu alus","Eesti mediaan",...V.map(v=>SHORTN[v])],IND2.map(ind=>{const md=rng(ind).md,m=META[ind.k]||{};return [ind.n,e(m.why||""),ind.f(md),...V.map(v=>{const x=i2v(v,ind),c=cls(ind,x);return `${ind.f(x)} <small>(p${nf0.format(c.p*100)})</small>${c.att?" ▲":c.ext?" ○":""}`;})];}),{textCols:[0,1]});}
  /* ======== PROFIILILILLED ======== */
  let PET=0;
  function flower(v,size,key){const cx=size/2,cy=size/2,R=size/2-(key?26:14),n=IND2.length;let s="";
    [0.15,0.5,0.85,1].forEach(q=>s+=`<circle cx="${cx}" cy="${cy}" r="${R*q}" fill="none" stroke="${q===0.5?C.mut:C.line2}" stroke-dasharray="${q===1?"":"2 3"}"/>`);
    IND2.forEach((ind,i)=>{const ang=-Math.PI/2+i/n*2*Math.PI,x=key?null:i2v(v,ind),c=key?null:cls(ind,x),r=key?R*0.9:R*Math.max(0.04,c.p),w=Math.PI/n*0.78,p=(a,rr)=>[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr];
      const [x0,y0]=p(ang-w,r*0.55),[x1,y1]=p(ang+w,r*0.55),[xt,yt]=p(ang,r),on=PET===i;
      s+=`<path class="k9pet" data-pet="${i}" d="M${cx},${cy}Q${x0.toFixed(1)},${y0.toFixed(1)} ${xt.toFixed(1)},${yt.toFixed(1)}Q${x1.toFixed(1)},${y1.toFixed(1)} ${cx},${cy}Z" fill="${key?C.surf2:VC[v]}" fill-opacity="${key?1:on?.95:.42}" stroke="${on?C.ink:c&&c.att?C.warn:key?C.line2:C.bg}" stroke-width="${on?2.2:c&&c.att?1.6:1}"${key?"":tipAttr(tipHTML(`${PNAME[v]} · ${ind.n}`,[["väärtus",ind.f(x)],["protsentiil",nf0.format(c.p*100)],["seis",clsTxt(c)]]))}/>`;
      if(key){const [lx,ly]=p(ang,R+14);s+=`<text x="${lx}" y="${ly+4}" text-anchor="middle" class="t-num" style="font-size:11px${on?";fill:"+C.kid:""}">${i+1}</text>`;}});
    s+=`<circle cx="${cx}" cy="${cy}" r="3" fill="${C.ink}"/>`;return s;}
  function flowers(W){const narrow=W<700,cols=narrow?2:5,size=Math.min(220,(W-(cols-1)*12)/cols),ind=IND2[PET],md=rng(ind).md;
    const key=`<figure class="k9fl key"><svg viewBox="0 0 ${size} ${size}" aria-hidden="true">${flower("Rapla",size,true)}</svg><figcaption><b>Võti</b><span>Rõngad: 15., 50. (mediaan) ja 85. protsentiil</span></figcaption></figure>`;
    return `<div class="k9fls" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${key}${V.map(v=>{const x=i2v(v,ind),c=cls(ind,x);return `<figure class="k9fl${S.unit===v?" sel":""}"><svg viewBox="0 0 ${size} ${size}" role="img" aria-label="${e(PNAME[v])}: ${e(ind.n)} ${e(ind.f(x))}, protsentiil ${nf0.format(c.p*100)}.">${flower(v,size)}</svg><figcaption><b style="color:${VC[v]}">◆ ${SHORTN[v]}</b><span class="pv">${PET+1}. ${e(ind.n)}: <b>${e(ind.f(x))}</b></span><span>protsentiil ${nf0.format(c.p*100)} · mediaan ${e(ind.f(md))}</span><span class="${c.att?"att":""}">${clsTxt(c)}</span></figcaption></figure>`;}).join("")}
      <div class="k9petsel" role="group" aria-label="Vali kroonleht (näitaja)">${IND2.map((i,k)=>`<button type="button" data-pet="${k}" aria-pressed="${PET===k}">${k+1}. ${e(i.n)}</button>`).join("")}</div></div>`;}
  /* ======== MULLIPILV ======== */
  let IK=null;
  function swarm(ind,W){const narrow=W<700,H=narrow?250:280,l=26,r=26,mid=H/2+10,rows=PEERS.R.map(rw=>({n:rw[0],x:i2val(rw,ind),p:rw[1+PI("pop25")]})).filter(o=>isFinite(o.x)),{lo,hi,md}=rng(ind),X=x=>l+Math.max(0,Math.min(1,(x-lo)/((hi-lo)||1)))*(W-l-r);
    const pmax=Math.max(...rows.map(o=>o.p));rows.forEach(o=>{o.r=2.6+Math.sqrt(o.p/pmax)*(narrow?10:15);o.cx=X(o.x);});rows.sort((a,b)=>b.r-a.r);const placed=[];
    rows.forEach(o=>{let best=0;for(let k=0;k<500;k++){const dy=(k%2?1:-1)*Math.ceil(k/2)*2;if(placed.every(q=>Math.hypot(q.cx-o.cx,q.cy-(mid+dy))>=q.r+o.r+1)){best=dy;break;}}o.cy=mid+best;placed.push(o);});
    const mine=Object.values(PNAME),nout=rows.filter(o=>o.x<lo||o.x>hi).length;let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(ind.n)}: ${rows.length} Eesti omavalitsust, mulli pindala on rahvaarv.">`;
    s+=`<line x1="${X(md)}" x2="${X(md)}" y1="22" y2="${H-26}" stroke="${C.ink}" stroke-width="1.4"/><text x="${X(md)}" y="14" text-anchor="middle" class="t-cap" style="fill:${C.ink}">◇ EESTI MEDIAAN ${e(ind.f(md))}</text>`;
    placed.filter(o=>!mine.includes(o.n)).forEach(o=>{const c=cls(ind,o.x),out=o.x<lo||o.x>hi;s+=`<circle cx="${o.cx.toFixed(1)}" cy="${o.cy.toFixed(1)}" r="${o.r.toFixed(1)}" fill="${C.dim}" fill-opacity=".2" stroke="${c.att?C.warn:C.dim}" stroke-width="${c.att?1.6:1}" stroke-opacity=".8"${out?` stroke-dasharray="2 2"`:""}${tipAttr(tipHTML(o.n,[[ind.n,ind.f(o.x)],["rahvaarv 2025",n0(o.p)],["seis",clsTxt(c)]],out?"skaalast väljas, kuvatud serval":""))}/>`;});
    placed.filter(o=>mine.includes(o.n)).forEach(o=>{const v=Object.keys(PNAME).find(k=>PNAME[k]===o.n),sel=S.unit===v||S.unit==="MAAK";s+=`<circle cx="${o.cx}" cy="${o.cy}" r="${o.r+2}" fill="${VC[v]}" fill-opacity="${sel?.9:.35}" stroke="${C.bg}" stroke-width="2"${tipAttr(tipHTML(o.n,[[ind.n,ind.f(o.x)],["protsentiil",nf0.format(i2pct(ind,o.x)*100)],["Eesti mediaan",ind.f(md)]]))}/><text x="${o.cx}" y="${o.cy-o.r-7}" text-anchor="middle" class="t-lab" style="fill:${VC[v]};paint-order:stroke;stroke:${C.bg};stroke-width:3px">${SHORTN[v]} ${e(ind.f(o.x))}</text>`;});
    s+=`<text x="${l}" y="${H-8}" class="t-ax">${e(ind.f(lo))}</text><text x="${W-r}" y="${H-8}" text-anchor="end" class="t-ax">${e(ind.f(hi))}</text><text x="${W/2}" y="${H-8}" text-anchor="middle" class="t-ax">${nout} omavalitsust skaalast väljas (katkendlik serv)</text>`;
    return s+"</svg>";}
  const basis=f=>{const s=String(f.src||"");if(/üle 60%/.test(f.t))return "seaduse üldpiir 60% (KOFS) ja strateegia";if(/MTA/.test(s))return "MTA laekumine vs dokumendi plaan";if(/strateegia|eelnõu|Riigi Teataja|Toetusfondi/.test(s)&&!/^RR300$/.test(s))return "dokument (strateegia, eelarve)";return "protsentiil Eesti KOV seas (RR300)";};
  /* ======== VAADE ======== */
  K9.VIEWS.vordlus={
    build(el){el.innerHTML=`<div class="k9intro"><div><p class="kick">${iconHTML("raha",14)} Eelarve · Eesti võrdlus</p><h1>Kus me 79 omavalitsuse seas oleme?</h1><a class="k9treelink" href="#ylevaade/k9-puu" data-tree="bud">⟡ Ava arengupuus</a></div><p class="lead" data-k9="lead"></p></div><div class="k9branches"><div class="k9branch" data-k9branch="bud"></div></div>
      ${sec("k9-kiri","Eesti kirivöö","Rida = näitaja, kriips = omavalitsus. Ring ümber valla märgi = äärmine 15%; kollane ring ainult siis, kui suunal on põhjendus.",`<div data-k9="belt"></div>`)}
      ${sec("k9-lill","Valdade näitajaprofiil (profiililled)","Kroonlehe pikkus = protsentiil (asukoht Eesti KOV seas), mitte risk. Lille pindala ei ole koondhinnang.",`<div data-k9="fl"></div>`)}
      ${sec("k9-mull","Näitajate seosed (mullipilv)","Üks näitaja korraga, kõik omavalitsused. Mulli pindala = rahvaarv. Asend näitab statistilist seost, mitte põhjuslikkust.",`<div data-k9="sw"></div>`)}
      ${sec("k9-leiud","Tähelepanu vajavad erandid ja küsimused","Leid on kontrollimiseks, mitte järeldus. Iga leiu juures on tema alus.",`<div class="k9moved" data-k9="anmv"></div><div data-k9="watch"></div>`)}`;
      const am=el.querySelector('[data-k9="anmv"]');moveInto(am,[["#anomMeta"],["#anomSeg"],["#anomCards"]]);
      el.addEventListener("click",ev=>{const b=ev.target.closest("[data-ind2]");if(b){IK=b.dataset.ind2;this.update(el);return;}
        const p=ev.target.closest("[data-pet]");if(p){PET=+p.dataset.pet;this.update(el);requestAnimationFrame(()=>{const n=el.querySelector(`.k9petsel [data-pet="${PET}"]`);n&&p.tagName==="BUTTON"&&n.focus();});}});},
    update(el){const q=k=>el.querySelector(`[data-k9="${k}"]`),w=k=>K9.wOf(q(k));let F=[];try{F=anomFindings();}catch(_){}
      const nh=V.map(v=>[v,IND2.filter(ind=>cls(ind,i2v(v,ind)).att).length]);
      el.querySelector('[data-k9="lead"]').innerHTML=`Võrdlus ${PEERS.R.length} omavalitsusega (RR300, 2021–2025). Tähelepanu vajavaid erandeid: ${nh.map(([v,n])=>`${SHORTN[v]} <b>${n}</b>`).join(", ")}.`;
      q("belt").innerHTML=fig({title:"Millistes näitajates Raplamaa vallad Eestis äärmuses on?",legend:[...V.map(v=>lg.sq(VC[v],SHORTN[v])),lg.med("Eesti mediaan"),`<span><svg width="22" height="14" aria-hidden="true"><circle cx="11" cy="7" r="6" fill="none" stroke="${C.ink}" stroke-width="1.2"/></svg>äärmine 15% (hinnanguta)</span>`,`<span><svg width="22" height="14" aria-hidden="true"><circle cx="11" cy="7" r="6" fill="none" stroke="${C.warn}" stroke-width="2"/></svg>tähelepanu: äärmine 15% põhjendatud suunas</span>`,lg.txt("◂ n väljas = väärtusi skaalast väljas")],
        body:belt(w("belt")),src:"Statistikaamet RR300, rahvastikuregister; arvutused mudelis",method:"Skaala on 3.–97. protsentiili vahel. Skaalast välja jäävad väärtused on loetud rea servas („n väljas”); valla märk on siis serval ja tegelik väärtus kirjas. Hinnangu suund on antud ainult näitajatele, mille puhul see on põhjendatud (vt tabeli veergu „Hinnangu alus”). Protsentiil ei ole seaduse ega mudeli piir.",table:beltTable()});
      q("fl").innerHTML=fig({title:`Valitud kroonleht: ${PET+1}. ${e(IND2[PET].n)}`,read:"Vali näitaja nupuga või klõpsa kroonlehel: sama kroonleht tõstetakse esile kõigil valdadel.",legend:[lg.txt("kroonlehe pikkus = protsentiil 0–100"),`<span><svg width="20" height="14" aria-hidden="true"><path d="M3,7Q10,0 17,7Q10,14 3,7Z" fill="none" stroke="${C.warn}" stroke-width="1.6"/></svg>tähelepanu (põhjendatud suund)</span>`],body:flowers(w("fl")),src:"RR300"});
      if(!IK)IK=IND2[0].k;const ind=IND2.find(i=>i.k===IK);
      q("sw").innerHTML=fig({title:e(ind.n),ctl:`<div class="k9seg k9segw" role="group" aria-label="Näitaja">${IND2.map(i=>`<button type="button" data-ind2="${i.k}" aria-pressed="${i.k===IK}">${e(i.n)}</button>`).join("")}</div>`,read:e((META[ind.k]||{}).why||""),body:swarm(ind,w("sw")),src:"RR300, Statistikaamet"});
      const lab={crit:"kontrollida esmalt",warn:"kontrollida",ok:"positiivne erisus"};
      q("watch").innerHTML=fig({title:"Jälgimisnimekiri",read:"Arvestuslik vahe on suurusjärk (erinevus mediaanist × tulud või elanikud), mitte kokkuhoiu lubadus.",
        body:table(["Vald","Seis","Valdkond","Leid","Alus","Arvestuslik vahe","Küsimus"],F.map(f=>({sel:S.unit===f.v,c:[`<span style="color:${VC[f.v]}">◆</span> ${SHORTN[f.v]}`,pill(f.sev,lab[f.sev]),e(f.cat),`<b>${e(f.t)}</b>${f.cat==="Sotsiaal"?"<br><small>Suurem toetus ei ole iseenesest halb tulemus; kontrollida põhjust.</small>":""}`,e(basis(f)),f.imp?"~"+K9.mln(Math.abs(f.imp))+"/a":"–",e(f.q||"")]})),{textCols:[0,1,2,3,4,6]}),src:"anomFindings (põhimudel): RR300, eelarvestrateegiad, MTA"});},
  };
})();
