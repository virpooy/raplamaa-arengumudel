/* ==========================================================================
   RAPLAMAA ARENGUKANGAS · tuum (k9)
   Arvutusmudel jääb puutumata: kõik väärtused tulevad põhimudeli funktsioonidest
   (popT, SC, MC, shares, eduDemand, taxSeries, finY, BUD, GAUGES, anomFindings …).
   ========================================================================== */
const K9=(function(){
  const C={ink:"#F1EBDD",mut:"#B3B1C9",dim:"#8A89A8",line:"#2E3360",line2:"#3D4479",bg:"#13152B",bg2:"#171A33",surf:"#1D2140",surf2:"#232850",
    gain:"#6FE3C1",loss:"#FF8A5B",ok:"#9BE28A",warn:"#FFC24A",crit:"#FF5D5D",na:"#8A89A8",kid:"#FFD966",work:"#7FD8D0",old:"#FF8FA3",ref:"#A3A4CC",
    la:"#FFD966",sc:"#8FD0FF",eak:"#FF8FA3",
    tax:"#F2C14E",land:"#E08A3C",sale:"#F3E2A6",fund:"#B9C45A",eq:"#C99A2E",moth:"#8F8460",staff:"#D277A3",op:"#A866C9",grant:"#7C79D6",coth:"#6F4D78"};
  /* raha tekstuurid: värv + muster, et liik ei sõltuks ainult värvist */
  const TEX={tax:"solid",land:"dot",sale:"hline",fund:"diag",eq:"cross",moth:"ring",staff:"solid",op:"dot",grant:"hline",coth:"diag"};
  const VC={MAAK:"#F1EBDD",Rapla:"#6FA0F5",Kohila:"#4CC79B",Marjamaa:"#BE8CF5",Kehtna:"#F5A55F"};
  const UNITS=["MAAK",...V];
  const RMQ=matchMedia("(prefers-reduced-motion: reduce)");
  const e=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const n0=v=>v==null||!isFinite(v)?"puudub":f0(v), mln=v=>v==null||!isFinite(v)?"puudub":(v<0?"−":"")+nf1.format(Math.abs(v)/1e6)+" mln €";
  const pp=v=>v==null||!isFinite(v)?"puudub":nf1.format(v*100)+"%";
  const sgn=v=>(v>0?"+":v<0?"−":"±")+f0(Math.abs(v));
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const P=(x,y)=>x.toFixed(1)+","+y.toFixed(1);
  /* ---------- mõõtkavad ---------- */
  function lin(d0,d1,r0,r1){const k=(r1-r0)/((d1-d0)||1);const f=x=>r0+(x-d0)*k;f.inv=y=>d0+(y-r0)/k;return f;}
  function ticks(lo,hi,n){const r=nice(lo,hi,n||5);return r;}
  /* ---------- vihje ---------- */
  let tipEl=null;
  function tipAttr(h){return ` data-tip="${e(h)}"`;}
  function tipHTML(title,rows,foot){return `<div class="h">${e(title)}</div>`+rows.map(r=>`<div class="r"><span>${e(r[0])}</span><b>${e(r[1])}</b></div>`).join("")+(foot?`<div class="r" style="color:var(--dim)">${e(foot)}</div>`:"");}
  function showTip(x,y,h){tipEl.innerHTML=h;tipEl.hidden=false;const w=tipEl.offsetWidth,ht=tipEl.offsetHeight;let L=x+16,T=y+16;if(L+w>innerWidth-8)L=x-w-16;if(T+ht>innerHeight-8)T=y-ht-16;tipEl.style.left=Math.max(8,L)+"px";tipEl.style.top=Math.max(8,T)+"px";}
  /* ---------- mustrid (ühine, peidetud) ---------- */
  function patterns(){const d=document.createElementNS("http://www.w3.org/2000/svg","svg");d.setAttribute("width","0");d.setAttribute("height","0");d.setAttribute("aria-hidden","true");d.style.position="absolute";
    let h="<defs>";const all={...C,...Object.fromEntries(Object.entries(VC).map(([k,v])=>["v"+k,v]))};
    Object.entries(all).forEach(([k,c])=>{h+=`<pattern id="h-${k}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${c}" fill-opacity=".10"/><line x1="0" y1="0" x2="0" y2="6" stroke="${c}" stroke-width="1.6" stroke-opacity=".75"/></pattern>`;
      h+=`<pattern id="x-${k}" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="${c}" fill-opacity=".14"/><path d="M0,0L7,7M7,0L0,7" stroke="${c}" stroke-width="1.1" stroke-opacity=".85"/></pattern>`;
      h+=`<pattern id="r-${k}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="${c}" fill-opacity=".06"/><circle cx="3" cy="3" r="1.15" fill="${c}" fill-opacity=".8"/></pattern>`;});
    Object.entries(TEX).forEach(([k,t])=>{const c=C[k],b=`<rect width="8" height="8" fill="${c}"/>`,m=t==="dot"?`<circle cx="4" cy="4" r="1.5" fill="#13152B" fill-opacity=".55"/>`:t==="hline"?`<rect y="3.2" width="8" height="1.6" fill="#13152B" fill-opacity=".5"/>`:t==="diag"?`<path d="M0,8L8,0" stroke="#13152B" stroke-opacity=".55" stroke-width="1.4"/>`:t==="cross"?`<path d="M0,8L8,0M0,0L8,8" stroke="#13152B" stroke-opacity=".5" stroke-width="1.1"/>`:t==="ring"?`<rect x="1.5" y="1.5" width="5" height="5" fill="#13152B" fill-opacity=".45"/>`:"";
      h+=`<pattern id="t-${k}" width="8" height="8" patternUnits="userSpaceOnUse">${b}${m}</pattern>`;});
    h+=`<pattern id="k9fc" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#F1EBDD" fill-opacity=".028"/></pattern>`;
    d.innerHTML=h+"</defs>";document.body.appendChild(d);}
  const hatch=k=>`url(#h-${k})`;
  /* ---------- märgid ---------- */
  /* ANDMEOLEK märgil: mõõdetud = täis; tuletatud = pooleldi täis (vasak pool); prognoos = avatud (tume sisu); puudub = ×.
     fc: false|"m" mõõdetud, true|"f" prognoos, "d" tuletatud */
  const stOf=fc=>fc===true||fc==="f"?"f":fc==="d"?"d":"m";
  function stitch(x,y,r,col,fc,extra){const s=stOf(fc),d=`M${P(x,y-r)}L${P(x+r,y)}L${P(x,y+r)}L${P(x-r,y)}Z`;
    if(s==="d")return `<g${extra||""}><path d="${d}" fill="${C.bg}" stroke="${col}" stroke-width="1.4"/><path d="M${P(x,y-r)}L${P(x,y+r)}L${P(x-r,y)}Z" fill="${col}"/></g>`;
    return `<path d="${d}" fill="${s==="f"?C.bg:col}" stroke="${col}" stroke-width="${s==="f"?1.5:1}"${extra||""}/>`;}
  function tri(x,y,s,col,up,fc,extra){const h=s*0.9,st=stOf(fc),d=up?`M${P(x,y-h)}L${P(x+s,y+h*.8)}L${P(x-s,y+h*.8)}Z`:`M${P(x,y+h)}L${P(x+s,y-h*.8)}L${P(x-s,y-h*.8)}Z`;
    if(st==="d")return `<g${extra||""}><path d="${d}" fill="${C.bg}" stroke="${col}" stroke-width="1.3"/><path d="${up?`M${P(x,y-h)}L${P(x,y+h*.8)}L${P(x-s,y+h*.8)}Z`:`M${P(x,y+h)}L${P(x,y-h*.8)}L${P(x-s,y-h*.8)}Z`}" fill="${col}"/></g>`;
    return `<path d="${d}" fill="${st==="f"?C.bg:col}" stroke="${col}" stroke-width="${st==="f"?1.4:.8}"${extra||""}/>`;}
  const miss=(x,y,r)=>`<path d="M${x-r},${y-r}L${x+r},${y+r}M${x+r},${y-r}L${x-r},${y+r}" stroke="${C.dim}" stroke-width="1.4"/>`;
  /* prognoosipindade täide: hele toon + katkendlik serv (mitte viirutus; viirutus on ainult määramatus) */
  const fcArea=col=>` fill="${col}" fill-opacity=".16" stroke="${col}" stroke-width="1.1" stroke-dasharray="3 2"`;
  /* NÄHTUSE LIIK: oma piltmärk ja toon */
  const KIND={pop:{n:"Rahvastik",c:"#7FD8D0"},edu:{n:"Lasteaiad ja koolid",c:"#8FD0FF"},raha:{n:"Raha",c:"#F2C14E"},house:{n:"Eluase",c:"#E9A27C"},water:{n:"Vesi",c:"#6CB8F0"}};
  function icon(k,x,y,s,col){col=col||KIND[k].c;const S=s/16,g=(d,f)=>`<path d="${d}" transform="translate(${x-s/2},${y-s/2}) scale(${S})" fill="${f?col:"none"}" stroke="${col}" stroke-width="${1.6/S}" stroke-linejoin="round"/>`;
    if(k==="pop")return g("M8,2.2a2.6,2.6 0 1 1 0,5.2a2.6,2.6 0 1 1 0,-5.2ZM3,14.5c0,-3.6 2.2,-5.3 5,-5.3s5,1.7 5,5.3Z",1);
    if(k==="edu")return g("M1.5,4.5L8,2L14.5,4.5L8,7ZM4,6v4.4c1.4,1.6 6.6,1.6 8,0V6M14.5,4.5v5",0);
    if(k==="raha")return g("M8,1.8a6.2,6.2 0 1 1 0,12.4a6.2,6.2 0 1 1 0,-12.4ZM8,4.5v7M6,6.3h3.2a1.2,1.2 0 0 1 0,2.4H6.8a1.2,1.2 0 0 0 0,2.4H10",0);
    if(k==="house")return g("M2,8L8,2.5L14,8M3.8,6.5V14H12.2V6.5M6.6,14V10H9.4V14",0);
    return g("M8,1.8C8,1.8 3.2,7.6 3.2,10.4a4.8,4.8 0 0 0 9.6,0C12.8,7.6 8,1.8 8,1.8Z",1);}
  const iconHTML=(k,s)=>`<svg class="k9ico" width="${s||16}" height="${s||16}" viewBox="0 0 ${s||16} ${s||16}" aria-hidden="true">${icon(k,(s||16)/2,(s||16)/2,(s||16)-2)}</svg>`;
  // seisu märk: ● korras, ▲ tähelepanu, ■ kriitiline, ○ andmed puuduvad
  function stGlyph(st,x,y,r){const c=C[st]||C.na;if(st==="ok")return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;if(st==="warn")return `<path d="M${P(x,y-r*1.1)}L${P(x+r*1.1,y+r*.85)}L${P(x-r*1.1,y+r*.85)}Z" fill="${c}"/>`;if(st==="crit")return `<rect x="${x-r*.9}" y="${y-r*.9}" width="${r*1.8}" height="${r*1.8}" fill="${c}"/>`;return `<circle cx="${x}" cy="${y}" r="${r*.85}" fill="none" stroke="${c}" stroke-width="1.5"/>`;}
  const STL={ok:"korras",warn:"tähelepanu",crit:"kriitiline",na:"andmed puuduvad"};
  const pill=(st,txt)=>`<span class="k9pill ${st||"na"}">${e(txt||STL[st]||"")}</span>`;
  const rel=r=>r?`<span class="k9rel ${r}">${r}</span>`:"";
  /* niit: punktid [[x,y]|null]; null katkestab niidi */
  function thread(pts,col,o){o=o||{};const segs=[];let cur=[];pts.forEach(p=>{if(p==null){if(cur.length)segs.push(cur);cur=[];}else cur.push(p);});if(cur.length)segs.push(cur);
    return segs.map(s=>`<path d="M${s.map(p=>P(p[0],p[1])).join("L")}" fill="none" stroke="${col}" stroke-width="${o.w||2.4}" stroke-linejoin="round" stroke-linecap="round"${o.fc?` stroke-dasharray="${o.dash||"6 4"}"`:""}${o.op!=null?` stroke-opacity="${o.op}"`:""}/>`).join("");}
  /* aja lõim: prognoosi väli, „täna” õmblus, aastate märgid */
  function warp(X,y0,y1,o){o=o||{};const a=o.a||2015,b=o.b||YN;let s="";
    if(b>START)s+=`<rect x="${X(START)}" y="${y0}" width="${X(b)-X(START)+(o.pad||0)}" height="${y1-y0}" fill="url(#k9fc)"/>`;
    const step=o.step||(X(a+1)-X(a)<26?(X(a+1)-X(a)<14?5:2):1);
    for(let y=a;y<=b;y++){const show=y===START&&START>=a&&START<=b||y===b&&Math.abs(b-START)>=step||((y-a)%step===0&&(step===1||(Math.abs(y-START)>=step&&b-y>=step)));s+=`<line x1="${X(y)}" x2="${X(y)}" y1="${y1}" y2="${y1+4}" stroke="${C.line2}"/>`;if(show&&!(o.noLab))s+=`<text x="${X(y)}" y="${y1+17}" text-anchor="middle" class="t-ax"${y===START?` style="fill:${C.ink}"`:""}>${y}</text>`;}
    if(START>=a&&START<=b){s+=`<line x1="${X(START)}" x2="${X(START)}" y1="${y0-6}" y2="${y1}" stroke="${C.ink}" stroke-opacity=".55" stroke-dasharray="1 3"/>`;
      if(!o.noSeam)s+=`<text x="${X(START)+5}" y="${y0+4}" class="t-cap">TÄNA ·  PROGNOOS →</text>`;}
    return s;}
  function yGrid(Y,tk,x0,x1,fmt,o){o=o||{};return tk.map(t=>`<line x1="${x0}" x2="${x1}" y1="${Y(t)}" y2="${Y(t)}" stroke="${C.line}"${t===0?` stroke-width="1.4" style="stroke:${C.line2}"`:""}/>`+(o.noLab?"":`<text x="${o.right?x1+6:x0-6}" y="${Y(t)+4}" text-anchor="${o.right?"start":"end"}" class="t-ax">${fmt(t)}</text>`)).join("");}
  const brk=(x,y)=>`<path d="M${x-7},${y+3}l4,-6l4,6l4,-6" fill="none" stroke="${C.dim}" stroke-width="1.2"/><text x="${x+10}" y="${y+3}" class="t-cap">TELG EI ALGA NULLIST</text>`;
  /* sildi kokkupõrke vältimine: [{y,…}] → nihutatud y */
  function spread(items,gap,lo,hi){items.sort((a,b)=>a.y-b.y);const fw=()=>{for(let i=1;i<items.length;i++)if(items[i].y-items[i-1].y<gap)items[i].y=items[i-1].y+gap;};fw();
    if(!items.length)return items;if(hi!=null&&items[items.length-1].y>hi){const d=items[items.length-1].y-hi;items.forEach(it=>it.y-=d);}
    if(lo!=null&&items[0].y<lo){items[0].y=lo;fw();}return items;}
  /* ---------- legend ---------- */
  const LS=(svg,w)=>`<svg width="${w||26}" height="14" viewBox="0 0 ${w||26} 14" aria-hidden="true">${svg}</svg>`;
  const lg={
    act:(c,t)=>`<span>${LS(`<line x1="1" x2="25" y1="7" y2="7" stroke="${c}" stroke-width="2.4"/>`+stitch(13,7,4,c))}${t}</span>`,
    fc:(c,t)=>`<span>${LS(`<line x1="1" x2="25" y1="7" y2="7" stroke="${c}" stroke-width="2.4" stroke-dasharray="5 3"/>`+stitch(13,7,4,c,true))}${t}</span>`,
    band:(k,t)=>`<span>${LS(`<rect x="1" y="2" width="24" height="10" fill="${hatch(k)}" stroke="${C[k]||VC[k.slice(1)]||C.ink}" stroke-opacity=".5"/>`)}${t}</span>`,
    needle:t=>`<span>${LS(`<line x1="13" x2="13" y1="3" y2="14" stroke="${C.ink}" stroke-width="1.6"/><circle cx="13" cy="4" r="3" fill="none" stroke="${C.ink}" stroke-width="1.5"/>`)}${t}</span>`,
    thr:(c,t)=>`<span>${LS(`<line x1="1" x2="25" y1="7" y2="7" stroke="${c||C.crit}" stroke-width="1.6" stroke-dasharray="2 3"/>`)}${t}</span>`,
    miss:t=>`<span>${LS(`<line x1="1" x2="9" y1="7" y2="7" stroke="${C.mut}" stroke-width="2"/><line x1="17" x2="25" y1="7" y2="7" stroke="${C.mut}" stroke-width="2"/><text x="13" y="10" text-anchor="middle" style="font:9px var(--f-body);fill:${C.mut}">/</text>`)}${t||"katkenud niit = andmed puuduvad (mitte null)"}</span>`,
    der:(c,t)=>`<span>${LS(`<line x1="1" x2="25" y1="7" y2="7" stroke="${c}" stroke-width="1.4"/>`+stitch(13,7,4.5,c,"d"))}${t}</span>`,
    unc:(k,t)=>`<span>${LS(`<rect x="1" y="2" width="24" height="10" fill="url(#h-${k})" stroke="${C[k]||VC[k.slice(1)]||C.ink}" stroke-opacity=".6"/>`)}${t}</span>`,
    fcsq:(c,t)=>`<span>${LS(`<rect x="5" y="2" width="11" height="10"${fcArea(c)}/>`,20)}${t}</span>`,
    up:(t,c)=>`<span>${LS(tri(10,8,5.5,c||C.gain,true,true),20)}${t}</span>`,
    dn:(t,c)=>`<span>${LS(tri(10,6,5.5,c||C.loss,false,true),20)}${t}</span>`,
    def:t=>`<span>${LS(`<rect x="5" y="1" width="12" height="12" fill="url(#x-crit)" stroke="${C.crit}"/>`,20)}${t}</span>`,
    res:t=>`<span>${LS(`<rect x="5" y="1" width="12" height="12" fill="url(#r-gain)" stroke="${C.gain}" stroke-dasharray="2 1.5"/>`,20)}${t}</span>`,
    med:t=>`<span>${LS(`<line x1="13" x2="13" y1="1" y2="13" stroke="${C.ink}" stroke-width="1.6"/><path d="M13,1l3,3l-3,3l-3,-3Z" fill="${C.bg}" stroke="${C.ink}"/>`)}${t}</span>`,
    na:t=>`<span>${LS(miss(13,7,4))}${t||"puudub (ei ole null)"}</span>`,
    kind:(k,t)=>`<span>${iconHTML(k,16)}${t||KIND[k].n}</span>`,
    tex:(k,t)=>`<span>${LS(`<rect x="5" y="1" width="12" height="12" fill="url(#t-${k})" stroke="${C[k]}"/>`,20)}${t}</span>`,
    sq:(c,t,fc)=>`<span>${LS(`<rect x="7" y="2" width="10" height="10" fill="${fc?"none":c}" stroke="${c}" stroke-width="1.4"/>`,20)}${t}</span>`,
    hsq:(k,t)=>`<span>${LS(`<rect x="6" y="1" width="12" height="12" fill="${hatch(k)}" stroke="${C[k]}" stroke-width="1"/>`,20)}${t}</span>`,
    ref:(c,t)=>`<span>${LS(`<line x1="1" x2="25" y1="7" y2="7" stroke="${c||C.ref}" stroke-width="1.3" stroke-dasharray="1 3"/><rect x="10" y="4" width="6" height="6" fill="${c||C.ref}" transform="rotate(45 13 7)"/>`)}${t}</span>`,
    st:()=>`<span>${LS(stGlyph("ok",5,7,4)+stGlyph("warn",13,7,4)+stGlyph("crit",21,7,4))}● korras · ▲ tähelepanu · ■ kriitiline</span>`,
    tri:(t)=>`<span>${LS(tri(7,7,5,C.gain,true)+tri(19,7,5,C.loss,false))}${t}</span>`,
    txt:t=>`<span>${t}</span>`};
  /* ühikmärkide jaotus suurima jäägi meetodil: ruute kokku = round(summa/ühik), liikide summa võrdub koguarvuga */
  function apportion(vals,unit){const tot=vals.reduce((a,b)=>a+Math.max(0,b),0),N=Math.round(tot/unit),q=vals.map(v=>Math.max(0,v)/unit),fl=q.map(Math.floor);let rest=N-fl.reduce((a,b)=>a+b,0);
    const ord=q.map((x,i)=>[x-Math.floor(x),i]).sort((a,b)=>b[0]-a[0]);for(let k=0;k<ord.length&&rest>0;k++,rest--)fl[ord[k][1]]++;for(let k=ord.length-1;k>=0&&rest<0;k--){if(fl[ord[k][1]]>0){fl[ord[k][1]]--;rest++;}}return fl;}
  /* ---------- keskne märgikeel (kuvatakse avalehel ja andmete vaates) ---------- */
  function key(){const G=(h,items)=>`<div class="kg"><p class="k9lbl">${h}</p><div class="k9leg">${items.join("")}</div></div>`;
    return `<div class="k9key" role="group" aria-label="Märgikeel">
      ${G("Nähtus",Object.keys(KIND).map(k=>lg.kind(k)))}
      ${G("Andmeolek",[lg.act(C.ink,"mõõdetud: täis märk, pidev joon"),lg.der(C.ink,"tuletatud: pooleldi täis märk"),lg.fc(C.ink,"prognoos: avatud märk, katkendjoon"),lg.fcsq(C.ink,"prognoosi pind: hele, katkendlik serv"),lg.na()])}
      ${G("Muutus ja tasakaal",[lg.up("suurenemine (suund üles)"),lg.dn("vähenemine (suund alla)"),lg.def("puudujääk: ristviirutus"),lg.res("reserv: täpiline")])}
      ${G("Võrdlusalus",[lg.needle("siht (dokumendist)"),lg.thr(C.crit,"lävend (allikaga)"),lg.med("mediaan")])}
      ${G("Määramatus",[lg.unc("ink","viirutus = arvuliselt määratud vahemik; piirid on kirjas")])}
      ${G("Seis",[lg.st()])}</div>`;}
  /* ---------- joonis ---------- */
  function table(head,rows,o){o=o||{};return `<div class="k9tbl"><table><thead><tr>${head.map((h,i)=>`<th${i&&!(o.textCols||[]).includes(i)?' class="n"':""}>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr${r.sel?' class="sel"':""}>${(r.c||r).map((c,i)=>`<td${i&&!(o.textCols||[]).includes(i)?' class="n"':""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;}
  function fig(o){return `<figure class="k9f${o.cls?" "+o.cls:""}" id="${o.id||""}"><header>${o.kick?`<span class="kick">${o.kick}</span>`:""}<h3>${o.title}</h3>${o.read?`<p class="k9read">${o.read}</p>`:""}</header>
    ${o.ctl?`<div class="k9ctl">${o.ctl}</div>`:""}${o.legend?`<div class="k9leg">${o.legend.join("")}</div>`:""}
    <div class="k9body">${o.body||""}</div>
    <figcaption class="k9foot">${o.table?`<details><summary>Täpsed väärtused</summary>${o.table}</details>`:""}${o.src||o.note||o.method?`<details><summary>Metoodika ja allikas</summary><div class="k9meth">${o.method?`<p>${o.method}</p>`:""}${o.note?`<p>${o.note}</p>`:""}${o.src?`<p><b>Allikas:</b> ${o.src}</p>`:""}</div></details>`:""}</figcaption></figure>`;}
  function sec(id,title,lead,body,o){o=o||{};return `<section class="k9sec${o.cls?" "+o.cls:""}" id="${id}" aria-labelledby="${id}-h"><div class="k9sech"><span class="k9orn" aria-hidden="true"></span><h2 id="${id}-h">${title}</h2>${lead?`<p>${lead}</p>`:""}${o.more?`<details class="k9more"><summary>Loe lähemalt</summary><p>${o.more}</p></details>`:""}</div>${body}</section>`;}
  /* ---------- vana DOM ümberpaigutus ---------- */
  function move(sel,up){let el=typeof sel==="string"?document.querySelector(sel):sel;if(!el)return null;if(up)el=el.closest(up)||el;return el;}
  function moveInto(host,list){list.forEach(([sel,up,cls])=>{const el=move(sel,up);if(el){if(cls)el.classList.add(cls);host.appendChild(el);}});}
  /* ---------- olek ---------- */
  const st={view:"ylevaade",built:{},busy:false};
  const VIEWS={};
  /* PEATÜKID: menüü = kasutaja küsimused. Iga analüüsi põhiasukoht on üks; teistes peatükkides on link samale analüüsile. */
  const CH=[
    {v:"ylevaade",t:"Ülevaade",q:"Mis on Raplamaal praegu oluline?",sub:[["ylevaade/k9-puu","Arengupuu"],["ylevaade/k9-kangas","Arengukangas"],["ylevaade/k9-voo","Valdkondade koondnäitajad"],["ylevaade/k9-kysimused","Tähelepanu vajavad küsimused"],["ylevaade/k9-jareldused","Peamised järeldused"]]},
    {v:"rahvastik",t:"Rahvastik",q:"Kuidas rahvastik muutub?",sub:[["rahvastik/k9-prog","Praegune seis ja ajalugu"],["rahvastik/k9-kaart","Rahvastik kaardil"],["rahvastik/k9-alli","Sünnid, surmad ja ränne"],["rahvastik/k9-polv","Vanuskoostis"],["rahvastik/k9-progn","Rahvastikuprognoos"],["rahvastik/k9-sihid","Valdade võrdlus"],["rahvastik/k9-too","Tööhõive ja töökohtade asukoht"]]},
    {v:"teenused",t:"Teenused",q:"Kuidas muutus mõjutab teenuseid?",sub:[["teenused/k9-redel","Vajadus, kasutus, nõudlus ja võimekus"],["teenused/k9-lapsed","Laste arv"],["teenused/k9-tasa","Lasteaiad ja koolinõudlus"],["teenused/k9-kv","Koolid ja koolivõrk"],["teenused/k9-eakad","Eakate teenused"],["teenused/k9-kulu","Teenusemahu maksumus"],["teenused/k9-svreg","Asutuste võimekuse register"],["teenused/k9-acc","Ligipääsetavus"]]},
    {v:"eluase",t:"Eluase ja taristu",q:"Kuidas muutus mõjutab eluaset ja taristut?",sub:[["eluase/k9-tyhi","Elamufond ja asustamata eluruumid"],["eluase/k9-ehit","Uusehitus"],["eluase/k9-vajadus","Rahvastikumuutusest tulenev eluasemevajadus"],["eluase/k9-vesi","Vesi ja kanalisatsioon"],["eluase/k9-dev","Arendusalad ja planeeringud"]]},
    {v:"eelarve",t:"Eelarve",q:"Kuidas muutus mõjutab eelarvet?",also:["vordlus"],sub:[["eelarve/k9-mos","Tulud, kulud ja tulem"],["eelarve/k9-tm","Tulumaks ja prognoos"],["eelarve/k9-reg","Registreeritud elukoha mõju"],["eelarve/k9-volg","Võlakoormus ja eelarvestrateegiad"],["vordlus","Eelarve võrdlus Eestis"],["eelarve/k9-re27","Riigieelarve mõju"]]},
    {v:"stsenaariumid",t:"Stsenaariumid",q:"Kuidas erinevad võimalikud tulevikud?",sub:[["stsenaariumid/k9-baas","Baaseeldused"],["stsenaariumid/k9-port","Rändemustrid"],["stsenaariumid/k9-teljed","Muudetavad hoovad"],["stsenaariumid/k9-vrd","Stsenaariumide võrdlus"],["stsenaariumid/k9-maar","Määramatus ja piirangud"]]},
    {v:"seosed",t:"Seosed",q:"Kuidas näitajad omavahel seotud on?",sub:[["seosed/k9-ek-andmed","Andmete kontroll"],["seosed/k9-ek-maatriks","Korrelatsioonimaatriks"],["seosed/k9-ek-hajuvus","Hajuvusdiagramm"],["seosed/k9-ek-regr","Regressioon ja stsenaarium"],["seosed/k9-ek-vallad","Nelja valla ajaread"],["seosed/k9-ek-tolg","Tõlgendused ja andmevajadus"]]},
    {v:"otsused",t:"Otsused",q:"Milline tegevusvariant toimib eri tulevikustsenaariumides?",sub:[["otsused/k9-ot-var","Tegevusvariantide võrdlus"],["otsused/k9-ot-kesk","Keskused ja tagamaad"],["otsused/k9-ot-kaart","Otsusekaart"]]},
    {v:"eesmargid",t:"Eesmärgid ja seire",q:"Kas arengukavade eesmärgid on saavutatavad?",sub:[["eesmargid/k9-eesm","Ametlikud arengueesmärgid"],["eesmargid/k9-hinnang","Eesmärkide täitmise hinnang"],["eesmargid/k9-seire","Seiremõõdikud"],["eesmargid/k9-riskid","Riskid ja jälgimisnimekiri"],["eesmargid/k9-soov","Tegevussoovitused"]]},
    {v:"andmed",t:"Andmed ja metoodika",q:"Millistele andmetele ja eeldustele järeldused toetuvad?",sub:[["andmed/k9-juh","Kuidas mudelit lugeda"],["andmed/k9-mkd","Kirivöö märgikeel ja mustri päritolu"],["andmed/k9-eeld","Arvutusloogika ja piirangud"],["andmed/k9-bt","Tagasitest ja kalibreerimise kontroll"],["andmed/k9-katvus","Andmete katvus"],["andmed/k9-kat","Näitajate passid"],["andmed/k9-uuend","Andmete uuendamine"],["andmed/k9-all","Allikad ja teaduskirjandus"]]},
    {v:"atlas",t:"Kaardivaade",q:"Kus muutused toimuvad?",cross:true,sub:[]}];
  const NAV=CH.map(c=>[c.v,c.t]).concat([["vordlus","Eelarve võrdlus Eestis"]]);
  const chapOf=v=>CH.find(c=>c.v===v||(c.also||[]).includes(v))||CH[0];
  /* vanad ja ümbertõstetud lingid → uus põhiasukoht */
  const ALIAS={"sys-pop":"rahvastik","sys-edu":"teenused","costPanel":"teenused#k9-kulu","sys-bud":"eelarve","goalPanel":"eesmargid#k9-eesm","sys-house":"eluase","sys-water":"eluase","sys-doc":"andmed","sys-res":"andmed","kaart":"atlas","kaardivaade":"atlas","okonomeetria":"seosed","korrelatsioonid":"seosed","variandid":"otsused","otsusekaart":"otsused"};
  const RELOC={"k9-teljed":"stsenaariumid","k9-port":"stsenaariumid","k9-mk":"andmed#k9-mkd","k9-luhi":"ylevaade#k9-kysimused","k9-eesm":"eesmargid","k9-seire":"eesmargid","k9-bt":"andmed","k9-com":"rahvastik#k9-too"};
  /* ANDMETE JA MUDELI KUUPÄEVAD (kontrollitavad failidest ja allikaviidetest) */
  const DATES={data:"põhiandmed päritud 05.–08.10.2026",add:"lisandused: asustusüksused ja rahandusandmebaas 2016–2026 11.10.2026, riigieelarve 2027 eelnõu 12.10.2026, tööturu statistika, MKM töövaldkonna uuringud ja 79 omavalitsuse võrdlusandmed (Seosed) 17.10.2026, tarbijahinnaindeks 20.10.2026",model:"arvutusmudel v6 (08.10.2026; hõive baas 64,1% 17.10.2026)",ui:"kasutajaliides v46 (20.10.2026)"};
  /* OSAD: analüüsiplokk, mille saab paigutada mis tahes vaatesse (<div data-part="…">). Ehitatakse esimesel kuvamisel ja uuendatakse koos vaatega. */
  const PARTS={};
  function part(id,o){PARTS[id]=o;}
  function mountParts(el){el.querySelectorAll("[data-part]").forEach(h=>{const p=PARTS[h.dataset.part];if(!p)return;try{if(!h.dataset.mounted){h.innerHTML=p.html();h.dataset.mounted="1";p.bind&&p.bind(h);}p.update&&p.update(h);}catch(err){console.error(err);h.insertAdjacentHTML("afterbegin",`<p class="k9err" role="alert">Osa „${e(h.dataset.part)}” joonistamine ebaõnnestus: ${e(err.message)}.</p>`);}});}
  function subnav(v){const c=chapOf(v);if(!c.sub.length)return "";return `<nav class="k9sub" aria-label="${e(c.t)}: alapeatükid">${c.sub.map(([h,t])=>`<a href="#${h}">${e(t)}</a>`).join("")}</nav>`;}
  function viewEl(v){return document.querySelector(`#k9 .k9view[data-view="${v}"]`);}
  function render(v){const el=viewEl(v);if(!el||!VIEWS[v])return;
    try{if(!st.built[v]){el.innerHTML="";VIEWS[v].build(el);st.built[v]=true;const sn=el.querySelector(".k9sub"),nn=subnav(v);if(sn){if(nn)sn.outerHTML=nn;else sn.remove();}else if(nn){const ib=el.querySelector(".k9intro,.k9ovh");if(ib)ib.insertAdjacentHTML("afterend",nn);}}VIEWS[v].update(el);mountParts(el);K9.tree&&K9.tree.branches&&K9.tree.branches(el);}
    catch(err){console.error(err);el.insertAdjacentHTML("afterbegin",`<p class="k9err" role="alert">Vaate joonistamine ebaõnnestus: ${e(err.message)}. Arvutusmudel töötab edasi, proovi teist vaadet või laadi leht uuesti.</p>`);}}
  function show(hash){let [v,anchor]=String(hash||"").replace(/^#/,"").split("?")[0].split("/");if(ALIAS[v]){[v,anchor]=ALIAS[v].split("#");}
    if(anchor&&RELOC[anchor]){const [rv,ra]=RELOC[anchor].split("#");v=rv;anchor=ra||anchor;}else if(!anchor&&RELOC[v]){const [rv,ra]=RELOC[v].split("#");v=rv;anchor=ra||v;}
    if(!VIEWS[v]){anchor=v&&document.getElementById(v)?v:null;v=anchor?(document.getElementById(v).closest(".k9view")||{}).dataset?.view||"ylevaade":"ylevaade";}
    st.view=v;document.querySelectorAll("#k9 .k9view").forEach(s=>s.hidden=s.dataset.view!==v);
    const cv=chapOf(v).v;document.querySelectorAll("#k9 .k9nav a").forEach(a=>{if(a.dataset.v===cv)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
    render(v);if(secTabs(v,anchor))render(v);if(tipEl)tipEl.hidden=true;
    const secA=anchor&&!SECALL&&SECSEL[v]===anchor;if(secA){const nav=viewEl(v).querySelector(".k9sub");if(nav)requestAnimationFrame(()=>{const y=nav.getBoundingClientRect().top+scrollY-(document.querySelector(".k9top")?.offsetHeight||170)-12;if(scrollY>y||!K9._secJump)scrollTo({top:Math.max(0,y),behavior:"auto"});K9._secJump=1;});anchor=null;}
    if(anchor){const t=document.getElementById(anchor),tp=t&&t.closest('[role="tabpanel"]');if(tp&&K9.wsTab&&tp.hidden)K9.wsTab(tp.id.replace("tp-",""));if(t)requestAnimationFrame(()=>{const ws=t.closest(".k9ws");(tp&&ws&&tp.id==="tp-puu"?ws:t).scrollIntoView({block:"start",behavior:RMQ.matches?"auto":"smooth"});});}else scrollTo(0,0);
    document.title=(v==="vordlus"?"Eelarve võrdlus Eestis":chapOf(v).t)+" · Raplamaa arengukangas";}
  function go(v){try{history.pushState(null,"","#"+v);}catch(_){}show(v);}
  /* v37: peatükis üks jaotis korraga (alapeatükkide riba = sakid); „Kõik ühel lehel“ taastab pika lehe */
  const SECSEL={};let SECALL=false;
  function secTabs(v,anchor){const el=viewEl(v),c=chapOf(v);if(!el||!c.sub.length||v==="ylevaade")return false;
    const ids=c.sub.map(([h])=>h.split("/")[0]===v?h.split("/")[1]:null).filter(id=>id&&document.getElementById(id)&&el.contains(document.getElementById(id)));if(ids.length<2)return false;
    let cur=SECSEL[v]||ids[0];if(anchor){const t=document.getElementById(anchor),s=t&&t.closest("section.k9sec");if(s&&ids.includes(s.id))cur=s.id;}
    const prev=el.dataset.sec;SECSEL[v]=cur;el.dataset.sec=cur;el.classList.toggle("k9secall",SECALL);
    ids.forEach((id,i)=>{const s=document.getElementById(id);s.classList.toggle("k9off",!SECALL&&id!==cur);let nx=s.querySelector(":scope>.k9secnext");
      if(!nx){s.insertAdjacentHTML("beforeend",`<nav class="k9secnext" aria-label="Järgmine jaotis"></nav>`);nx=s.querySelector(":scope>.k9secnext");}
      const P=ids[i-1],N=ids[i+1],tt=id=>(c.sub.find(([h])=>h===v+"/"+id)||[,""])[1];
      nx.innerHTML=SECALL?"":`${P?`<a href="#${v}/${P}">← ${e(tt(P))}</a>`:"<span></span>"}${N?`<a href="#${v}/${N}">${e(tt(N))} →</a>`:""}`;});
    const nav=el.querySelector(".k9sub");if(nav){nav.querySelectorAll("a[href]").forEach(a=>{const id=a.getAttribute("href").split("/")[1];if(!SECALL&&id===cur)a.setAttribute("aria-current","true");else a.removeAttribute("aria-current");});
      let b=nav.querySelector("[data-secall]");if(!b){nav.insertAdjacentHTML("beforeend",`<button type="button" class="k9secallb" data-secall></button>`);b=nav.querySelector("[data-secall]");}
      b.textContent=SECALL?"Üks jaotis korraga":"Kõik ühel lehel";b.setAttribute("aria-pressed",SECALL);}
    return prev!==cur;}
  document.addEventListener("click",ev=>{const b=ev.target.closest("[data-secall]");if(!b)return;SECALL=!SECALL;const v=st.view;secTabs(v,null);render(v);});
  /* ---------- päis ---------- */
  function belt(){const u=S.unit,W=Math.max(240,(document.querySelector(".k9belt")||{}).clientWidth||600),H=34,a=2016,b=YN,X=lin(a-.5,b+.5,4,W-4);
    const d=[];for(let y=a;y<=b;y++)d.push([y,popT(u,y)-popT(u,y-1)]);const mx=Math.max(...d.map(x=>Math.abs(x[1])))||1;
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(NAME[u])}: rahvaarvu aastamuutus ${a}–${b}. ${d.map(x=>x[0]+" "+sgn(Math.round(x[1]))).join(", ")}">`;
    s+=`<line x1="4" x2="${W-4}" y1="${H/2}" y2="${H/2}" stroke="${C.line2}"/>`;
    s+=`<rect x="${X(START+.5)}" y="2" width="${X(b+.5)-X(START+.5)}" height="${H-4}" fill="url(#k9fc)"/>`;
    d.forEach(([y,v])=>{const s2=3+Math.sqrt(Math.abs(v)/mx)*8,fc=y>START;s+=tri(X(y),H/2,s2*0.75,v>=0?C.gain:C.loss,v>=0,fc,tipAttr(tipHTML(`${y}${fc?" · prognoos":" · ametlik"}`,[["rahvaarvu muutus",sgn(Math.round(v))],["1. jaanuaril",n0(popT(u,y))]])));});
    s+=`<text x="${X(START+.5)+3}" y="9" class="t-cap" style="font-size:8.5px">PROGNOOS</text>`;
    return s+"</svg>";}
  /* stsenaariumi režiim: "all" = rändemuster koos aktiivsete eeldustega, "mig" = ainult rändemuster (hoovad ajutiselt baasväärtusel) */
  const LEVDEF={extra:0,fert:0,wage:4.5,emp:EMPB,fertTr:"const",mort:"const",re27:false};
  let HELD=null;
  function changed(){const c=[];if(S.extra)c.push(`lisaränne ${sgn(S.extra)} in/a`);if(V.some(v=>VX[v]))c.push(`valla sihid ${V.filter(v=>VX[v]).map(v=>SHORTN[v]+" "+sgn(VX[v])).join(", ")}`);if(S.fert)c.push(`sündimus ${S.fert>0?"+":"−"}${Math.abs(S.fert)}%`);if(S.fertTr!=="const")c.push(S.fertTr==="down"?"sündimuse langus jätkub":"sündimus Statistikaameti TFR järgi");if(S.mort!=="const")c.push("eluiga kasvab");if(S.wage!==4.5)c.push(`palgakasv ${nf1.format(S.wage)}%`);if(S.emp!==EMPB)c.push(`hõive ${nf1.format(S.emp)}%`);if(S.re27)c.push("RE 2027 eelnõu / RM prognoos");if(S.mig!=="mean")c.push(`rändemuster ${MIGL[S.mig]}`);return c;}
  function setMode(m){if(m===(S.smode||"all"))return;if(m==="mig"){HELD={...Object.fromEntries(Object.keys(LEVDEF).map(k=>[k,S[k]])),VX:{...VX}};V.forEach(v=>VX[v]=0);setS({...LEVDEF,smode:"mig"},"Režiim: ainult rändemuster");}
    else{const h=HELD||{};HELD=null;if(h.VX)V.forEach(v=>VX[v]=h.VX[v]||0);const p={smode:"all"};Object.keys(LEVDEF).forEach(k=>{if(h[k]!=null)p[k]=h[k];});setS(p,"Režiim: rändemuster koos aktiivsete eeldustega");}}
  function resetAll(){HELD=null;V.forEach(v=>VX[v]=0);setS({...LEVDEF,mig:"mean",smode:"all"},"Taastatud baaseeldused");}
  function modeLabel(){return (S.smode||"all")==="mig"?"ainult rändemuster":"rändemuster koos aktiivsete eeldustega";}
  function shareURL(){const q=new URLSearchParams();q.set("u",S.unit);q.set("mig",S.mig);if((S.smode||"all")!=="all")q.set("rezhiim",S.smode);Object.keys(LEVDEF).forEach(k=>{if(S[k]!==LEVDEF[k])q.set(k,String(S[k]));});V.forEach(v=>{if(VX[v])q.set("vx_"+v,String(VX[v]));});q.set("aasta",String(S.year));(K9.shareHooks||[]).forEach(f=>{try{f(q);}catch(err){console.error(err);}});
    return location.href.split("#")[0]+"#"+(location.hash.replace(/^#/,"").split("?")[0]||"ylevaade")+"?"+q.toString();}
  const QB={extra:[-400,800],fert:[-30,30],wage:[2,7],emp:[58,70]},QS={fertTr:["const","down","sa"],mort:["const","tr"]};
  function applyQuery(){const h=location.hash,i=h.indexOf("?");if(i<0)return;const q=new URLSearchParams(h.slice(i+1)),p={};
    if(q.get("u")&&UNITS.includes(q.get("u")))S.unit=q.get("u");if(q.get("mig")&&MIGS_ALL.includes(q.get("mig")))p.mig=q.get("mig");
    Object.keys(LEVDEF).forEach(k=>{if(!q.has(k))return;const x=q.get(k),d=LEVDEF[k];p[k]=typeof d==="number"?(x.trim()!==""&&isFinite(+x)?Math.max(QB[k][0],Math.min(QB[k][1],+x)):d):typeof d==="boolean"?x==="true":((QS[k]||[]).includes(x)?x:d);});
    V.forEach(v=>{const x=q.get("vx_"+v);if(x!=null&&x.trim()!==""&&isFinite(+x))VX[v]=Math.max(-250,Math.min(500,Math.round(+x)));});
    const ay=q.get("aasta");if(ay!=null&&/^\d{4}$/.test(ay)&&+ay>=2015&&+ay<=YN)S.year=+ay;(K9.queryHooks||[]).forEach(f=>{try{f(q);}catch(err){console.error(err);}});
    if(q.get("rezhiim")==="mig"){Object.assign(S,p);setMode("mig");}else if(Object.keys(p).length)setS(p);else setUnit(S.unit);}
  function scenText(){const p=[`ränne <b>${e(MIGL[S.mig])}</b>`];if(S.extra)p.push(`lisaränne <b>${sgn(S.extra)}/a</b>`);if(V.some(v=>VX[v]))p.push(`valla sihid <b>${V.filter(v=>VX[v]).map(v=>SHORTN[v]+" "+sgn(VX[v])).join(", ")}</b>`);
    if(S.fert)p.push(`sündimus <b>${S.fert>0?"+":"−"}${Math.abs(S.fert)}%</b>`);if(S.fertTr!=="const")p.push(`<b>${S.fertTr==="down"?"sündimuse langus jätkub":"sündimus SA järgi"}</b>`);if(S.mort!=="const")p.push("<b>eluiga kasvab</b>");
    if(S.wage!==4.5)p.push(`palgakasv <b>${nf1.format(S.wage)}%</b>`);if(S.emp!==EMPB)p.push(`hõive <b>${nf1.format(S.emp)}%</b>`);if(S.re27)p.push("<b>RE 2027 eelnõu / RM suveprognoos</b>");return p.join(" · ");}
  function header(){const h=document.querySelector("#k9 .k9top");if(!h)return;
    h.querySelector(".k9units").innerHTML=UNITS.map(u=>`<button type="button" data-u="${u}" aria-pressed="${S.unit===u}" style="--c:${VC[u]}"><i aria-hidden="true"></i>${u==="MAAK"?"Maakond":SHORTN[u]}</button>`).join("");
    h.querySelector(".k9belt").innerHTML=belt();
    const ch=changed();
    h.querySelector(".k9scen span").innerHTML=`<span class="k9ctxi"><span class="k9lbl">Piirkond</span> <b>${e(NAME[S.unit])}</b></span><span class="k9ctxi"><span class="k9lbl">Periood</span> 2015–2025 mõõdetud · 2026 lähteaasta · 2027–${YN} prognoos</span><span class="k9ctxi"><span class="k9lbl">Stsenaarium</span> <b>${e(MIGL[S.mig])}</b> · režiim: ${e(modeLabel())}</span><span class="k9ctxi"><span class="k9lbl">Muudetud eeldused</span> ${ch.filter(x=>!x.startsWith("rändemuster")).length?e(ch.filter(x=>!x.startsWith("rändemuster")).join("; ")):"ei ole (baaseeldused)"}${(S.smode||"all")==="mig"&&HELD?" · hoovad ootel":""}</span>`;
    const dd=h.querySelector(".k9dates");if(dd)dd.textContent=`Andmete seis: ${DATES.data}; ${DATES.add}. Mudel: ${DATES.model}, ${DATES.ui}.`;
    const rb=h.querySelector("[data-resetall]");if(rb)rb.hidden=!ch.length&&(S.smode||"all")==="all";}
  function shell(){const k=document.createElement("div");k.id="k9";
    k.innerHTML=`<a class="k9skip" href="#k9main">Liigu sisu juurde</a>
    <header class="k9top"><div class="k9wrap">
      <div class="k9brand"><svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true"><path d="M19 2L36 19L19 36L2 19Z" fill="none" stroke="${C.kid}" stroke-width="1.6"/><path d="M19 9L29 19L19 29L9 19Z" fill="${C.kid}" fill-opacity=".18" stroke="${C.kid}"/><path d="M2 19H36M19 2V36" stroke="${C.kid}" stroke-opacity=".5" stroke-dasharray="2 3"/><path d="M19 14L24 19L19 24L14 19Z" fill="${C.kid}"/></svg>
        <div><b>Raplamaa arengukangas</b><small>rahvastik, teenused, eluase ja eelarve 2015–2036 · Rapla, Kohila, Märjamaa, Kehtna</small></div></div>
      <div class="k9belt" title="Rahvaarvu aastamuutus: ▲ kasv, ▼ kahanemine; täidetud = ametlik, avatud = prognoos"></div>
      <nav class="k9units" aria-label="Vali omavalitsus"></nav>
      <nav class="k9nav" aria-label="Peatükid">${CH.map(c=>`<a href="#${c.v}" data-v="${c.v}"${c.cross?' class="k9navx"':""} title="${e(c.q)}">${c.t}</a>`).join("")}</nav>
      <div class="k9scen" role="region" aria-label="Aktiivne kontekst"><span></span><span class="k9ctxa"><a class="k9btn ghost sm" href="#stsenaariumid/k9-teljed" data-go="stsenaariumid/k9-teljed">Muuda eeldusi</a><button type="button" class="k9btn ghost sm" data-resetall>Taasta baaseeldused</button><button type="button" class="k9btn ghost sm" data-share>Kopeeri vaate link</button><span class="k9sharemsg" role="status"></span></span></div>
      <p class="k9dates"></p>
    </div></header>
    <main id="k9main" class="k9wrap" tabindex="-1">${NAV.map(([v])=>`<div class="k9view" data-view="${v}" hidden><p class="k9load" role="status">Joonistan vaadet…</p></div>`).join("")}</main>
    <footer class="k9wrap k9fend"><p>Raplamaa arengukangas · ${e(DATES.model)} (kohortmudel, kalibreeritud 2016–2026), ${e(DATES.ui)}. Andmete seis: ${e(DATES.data)}; ${e(DATES.add)}. Märgikeel: mõõdetud = täis märk ja pidev joon, tuletatud = pooleldi täis märk, prognoos = avatud märk ja katkendjoon, määramatus (ainult arvuline vahemik) = viirutus, puudujääk = ristviirutus, reserv = täpid, siht = nõel, lävend = punktiir koos allikaga, puuduv = × ja sõna „puudub”. Valik ja fookus = kahekordne kollane raam. Kirivöö mustrid on kirivööst inspireeritud kaasaegne andmemuster (vt Andmed ja metoodika).</p></footer>`;
    const w=document.querySelector("body>.wrap");document.body.insertBefore(k,w||document.body.firstChild);
    tipEl=document.createElement("div");tipEl.className="k9tip";tipEl.hidden=true;tipEl.setAttribute("role","tooltip");document.body.appendChild(tipEl);
    k.addEventListener("pointermove",ev=>{const t=ev.target.closest&&ev.target.closest("[data-tip]");if(t)showTip(ev.clientX,ev.clientY,t.getAttribute("data-tip"));else tipEl.hidden=true;});
    k.addEventListener("pointerleave",()=>tipEl.hidden=true);
    k.addEventListener("focusin",ev=>{const t=ev.target.closest&&ev.target.closest("[data-tip]");if(t){const r=t.getBoundingClientRect();showTip(r.right,r.top,t.getAttribute("data-tip"));}});
    k.addEventListener("focusout",()=>tipEl.hidden=true);
    k.addEventListener("click",ev=>{const ub=ev.target.closest(".k9units button");if(ub){setUnit(ub.dataset.u);return;}
      if(ev.target.closest("[data-resetall]")){resetAll();return;}
      if(ev.target.closest("[data-share]")){const u=shareURL(),m=k.querySelector(".k9sharemsg");const ok=()=>{if(m)m.textContent="Link kopeeritud.";},no=()=>{if(m)m.textContent=u;};try{navigator.clipboard.writeText(u).then(ok,no);}catch(_){no();}return;}
      const md=ev.target.closest("[data-smode]");if(md){setMode(md.dataset.smode);return;}
      const a=ev.target.closest("a[href^='#']");if(a&&a.closest("#k9")){const h=a.getAttribute("href").slice(1);if(a.classList.contains("k9skip"))return;ev.preventDefault();if(a.dataset.tree!=null&&K9.tree){K9.tree.pending=a.dataset.tree;if(st.view==="ylevaade"){render("ylevaade");}}go(a.dataset.go||h);}});
    addEventListener("popstate",()=>show(location.hash));
    addEventListener("hashchange",()=>{if(location.hash.includes("?")){try{applyQuery();}catch(err){console.error(err);}show(location.hash);}});
    /* Kompaktne päis kerimisel. Päis on lehe voos: ahenemine nihutab sisu ja brauseri kerimisankurdus muudab scrollY-d sama palju.
       Ühe piiriga (varem 160 px) tekkis tagasisideahel ehk värin. Hüsterees: ahenda, kui scrollY > kõrgusmuutus + 80 px,
       laienda alles siis, kui scrollY < 40 px; pärast nihet jääb asend alati samasse olekusse. */
    let sc0=false,dh=null,scRaf=0;
    const measure=()=>{const t=k.querySelector(".k9top");if(!t){dh=0;return;}const was=k.classList.contains("k9scrolled");k.classList.remove("k9scrolled");const h0=t.offsetHeight;k.classList.add("k9scrolled");const h1=t.offsetHeight;k.classList.toggle("k9scrolled",was);dh=Math.max(0,h0-h1);};
    const scUpd=()=>{scRaf=0;if(dh==null)measure();const y=scrollY,on=sc0?y>40:y>Math.max(160,dh+80);if(on!==sc0){sc0=on;k.classList.toggle("k9scrolled",on);}};
    addEventListener("scroll",()=>{if(!scRaf)scRaf=requestAnimationFrame(scUpd);},{passive:true});
    addEventListener("resize",()=>{dh=null;});
    addEventListener("keydown",ev=>{if(ev.key==="Escape"&&tipEl)tipEl.hidden=true;});
    let rz=0,lw=innerWidth;addEventListener("resize",()=>{if(Math.abs(innerWidth-lw)<24)return;lw=innerWidth;clearTimeout(rz);rz=setTimeout(()=>{header();render(st.view);},200);});}
  function refresh(){if(st.busy)return;header();render(st.view);}
  /* uuenda mudelit: muudab S, sünkroonib vana juhtpuldi ja arvutab kõik ümber */
  function setS(patch,label){const before=snap();Object.assign(S,patch);syncOld();PVC.clear();st.busy=true;try{renderAll();}finally{st.busy=false;}const after=snap();if(label)logChange(label,before,after);refresh();}
  function syncOld(){try{document.querySelectorAll("#migSeg button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===S.mig));
    [["lvExtra","oExtra",v=>sg(v)+" in/a","extra"],["lvFert","oFert",v=>sg(v)+"%","fert"],["lvWage","oWage",v=>nf1.format(v)+"%","wage"],["lvEmp","oEmp",v=>nf1.format(v)+"%","emp"]].forEach(([i,o,f,k])=>{const el=document.getElementById(i);if(el){el.value=S[k];document.getElementById(o).textContent=f(S[k]);}});
    [["fertTrSeg","fertTr"],["mortSeg","mort"]].forEach(([id,k])=>document.querySelectorAll("#"+id+" button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===S[k])));}catch(_){}}
  /* muutuste logi */
  const LOG=[];
  function snap(){const u=S.unit;let sch=0;try{sch=K9.schools().filter(s=>(u==="MAAK"||s.v===u)&&s.p*s.f(YN)<s.lim).length;}catch(_){}return {u,pop:popT(u,YN),tax:taxSeries(u)[YN],old:shares(u,YN).old,sch};}
  function logChange(label,b,a){const r=[];if(b.u===a.u){r.push(["Rahvaarv "+YN,`${n0(b.pop)} → ${n0(a.pop)}`,a.pop-b.pop]);r.push(["Tulumaks "+YN,`${mln(b.tax)} → ${mln(a.tax)}`,a.tax-b.tax]);r.push(["65+ osakaal "+YN,`${pp(b.old)} → ${pp(a.old)}`,(a.old-b.old)*1000]);r.push(["Koole lävendist allpool "+YN,`${b.sch} → ${a.sch}`,a.sch-b.sch]);}
    LOG.unshift({t:new Date().toLocaleTimeString("et-EE",{hour:"2-digit",minute:"2-digit"}),label,u:NAME[a.u],r});LOG.splice(12);}
  /* koolid (sama loogika mis põhimudeli schoolRender ja simulaatoris) */
  function schools(){const r=[];EDU.inst.filter(i=>["K","LK"].includes(i.t)&&i.o==="vald"&&i.p!=null).forEach(i=>{let p=i.p;if(i.n==="Kohila Gümnaasium")p=i.p-EDU.pupils.Kohila.g;if(i.n==="Märjamaa Gümnaasium")p=i.p-EDU.pupils.Marjamaa.g;const alg=/Algkool/.test(i.n);
      r.push({k:i.n,n:i.n+(i.n.includes("Gümnaasium")?" põhikooliosa":""),v:i.v,x:i.x,y:i.y,kind:alg?"algkool":"põhikool",lim:alg?20:90,p,f:y=>pkF(i.v,y)});});
    const G=n=>EDU.inst.find(i=>i.n===n)||{};
    r.push({k:"KohilaG",n:"Kohila Gümnaasium gümnaasiumiosa",v:"Kohila",x:G("Kohila Gümnaasium").x+9,y:G("Kohila Gümnaasium").y-7,kind:"gümnaasium",lim:100,p:EDU.pupils.Kohila.g,f:y=>gF("Kohila",y)});
    r.push({k:"MarjG",n:"Märjamaa Gümnaasium gümnaasiumiosa",v:"Marjamaa",x:G("Märjamaa Gümnaasium").x+9,y:G("Märjamaa Gümnaasium").y-7,kind:"gümnaasium",lim:100,p:EDU.pupils.Marjamaa.g,f:y=>gF("Marjamaa",y)});
    r.push({k:"RaplaG",n:"Rapla Gümnaasium (riigikool)",v:"Rapla",x:G("Rapla Gümnaasium").x,y:G("Rapla Gümnaasium").y,kind:"gümnaasium",lim:100,p:262,f:y=>gF("MAAK",y)});
    return r.map(s=>({...s,n_:y=>s.p*s.f(y),st:y=>{const n=s.p*s.f(y);return n<s.lim?"crit":n<s.lim*1.15?"warn":"ok";}}));}
  /* stsenaariumi siht (arengukavadest, goalRows) */
  const TGT={MAAK:[35000,2035,"Raplamaa arengustrateegia 2035+"],Rapla:[15000,2035,"Rapla valla arengukava 2035"],Kohila:[10000,2035,"Kohila valla arengukava 2023–2035"],Kehtna:[6000,2035,"Kehtna valla arengukava 2035"]};
  function init(){patterns();shell();header();
    if(typeof briefRender==="function"){const _b=briefRender;briefRender=function(){const r=_b.apply(this,arguments);try{refresh();}catch(err){console.error(err);}return r;};}
    if(S.smode==null)S.smode="all";try{applyQuery();}catch(err){console.error(err);}
    show(location.hash||window.K9_START||"#ylevaade");}
  return {apportion,key,KIND,icon,iconHTML,fcArea,miss,C,VC,UNITS,e,n0,mln,pp,sgn,clamp,P,lin,ticks,tipAttr,tipHTML,stitch,tri,stGlyph,STL,pill,rel,thread,warp,yGrid,brk,spread,lg,table,fig,sec,moveInto,move,
    VIEWS,show,go,setS,refresh,render,st,LOG,schools,TGT,header,init,hatch,RMQ,CH,chapOf,part,PARTS,mountParts,DATES,setMode,resetAll,modeLabel,changed,LEVDEF,shareURL,
    /* rändemustri tulemus aktiivses režiimis: "all" → muster + aktiivsed hoovad; "mig" → hoovad on baasväärtusel, seega sama kui muster üksi */
    pat:(m,u,y)=>y<=START?popT(u,y):popAt(u,y,m,S.extra,S.fert)};
})();
