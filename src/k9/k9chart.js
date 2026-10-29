/* ---------- k9: üldine niidijoonis (ajas joondatud) ---------- */
(function(){
  const {C,e,P,lin,stitch,thread,warp,yGrid,brk,spread,tipAttr,tipHTML}=K9;
  /* o: {W,H,x0,x1,series:[{name,col,pts:[[x,v]],fc,w,op,end,endLab,noStitch,noTip}],bands:[{k,col,pts:[[x,lo,hi]],name}],thr:[{v,lab,col}],needles:[{x,v,lab}],fmt,tfmt,zero,yMin,yMax,warp,R,label,unitLab}
     prognoosi osa: seeria fc:true või fc: aasta (alates sellest aastast avatud) */
  function lines(o){const W=o.W,narrow=W<600,L=o.L||(narrow?44:56),R=o.R!=null?o.R:(narrow?104:150),T=o.T||22,B=30,H=o.H||(narrow?240:280);
    const all=[];o.series.forEach(s=>s.pts.forEach(p=>p&&p[1]!=null&&isFinite(p[1])&&all.push(p[1])));(o.bands||[]).forEach(b=>b.pts.forEach(p=>all.push(p[1],p[2])));(o.thr||[]).forEach(t=>all.push(t.v));(o.needles||[]).forEach(t=>all.push(t.v));
    let mn=o.yMin!=null?o.yMin:Math.min(...all),mx=o.yMax!=null?o.yMax:Math.max(...all);if(o.zero)mn=Math.min(0,mn);const pad=(mx-mn)*0.06||1;
    const nk=nice(o.zero&&mn>=0?0:mn-pad,mx+pad,narrow?4:5),X=lin(o.x0,o.x1,L,W-R),Y=lin(nk.lo,nk.hi,H-B,T),fmt=o.fmt||(v=>f0(v)),tf=o.tfmt||fmt;
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(o.label||"")}">`;
    s+=yGrid(Y,nk.t,L,W-R,fmt);if(o.warp!==false)s+=warp(X,T,H-B,{a:o.x0,b:o.x1,step:o.xStep});else{for(let y=o.x0;y<=o.x1;y+=(o.xStep||1))s+=`<text x="${X(y)}" y="${H-B+17}" text-anchor="middle" class="t-ax">${y}</text>`;}
    if(!o.zero&&nk.lo>0)s+=brk(L+4,H-B-8);
    if(o.unitLab)s+=`<text x="${L}" y="${T-8}" class="t-cap">${e(o.unitLab)}</text>`;
    (o.bands||[]).forEach(b=>{const up=b.pts.map(p=>P(X(p[0]),Y(p[2]))).join("L"),dn=b.pts.slice().reverse().map(p=>P(X(p[0]),Y(p[1]))).join("L");s+=b.unc?`<path d="M${up}L${dn}Z" fill="url(#h-${b.k})" stroke="${b.col}" stroke-opacity=".55" stroke-width="1"/>`:`<path d="M${up}L${dn}Z" fill="${b.col}" fill-opacity=".14" stroke="none"/>`;
      if(b.lab){const lp=b.pts[b.pts.length-1];s+=`<text x="${X(lp[0])-4}" y="${(Y(lp[1])+Y(lp[2]))/2+4}" text-anchor="end" class="t-ax" style="fill:${b.col}">${e(b.lab)}</text>`;}});
    const labs=[];
    (o.thr||[]).forEach(t=>{s+=`<line x1="${L}" x2="${W-R}" y1="${Y(t.v)}" y2="${Y(t.v)}" stroke="${t.col||C.crit}" stroke-width="1.5" stroke-dasharray="2 4"/>`;if(R>40&&!t.inside)labs.push({y:Y(t.v),y0:Y(t.v),x:W-R-5,t:t.lab,col:t.col||C.crit});else s+=`<text x="${L+6}" y="${Y(t.v)-5}" class="t-labm" style="fill:${t.col||C.crit};paint-order:stroke;stroke:${C.bg};stroke-width:3px">${e(t.lab)}</text>`;});
    o.series.forEach(sr=>{const split=sr.fc===true?-1e9:typeof sr.fc==="number"?sr.fc:1e9;const a=[],b=[];sr.pts.forEach(p=>{if(!p)return;const pt=p[1]==null||!isFinite(p[1])?null:[X(p[0]),Y(p[1])];if(p[0]<=split)a.push(pt);if(p[0]>=split)b.push(pt);});
      if(a.length)s+=thread(a,sr.col,{w:sr.w,op:sr.op});if(b.length)s+=thread(b,sr.col,{w:sr.w,op:sr.op,fc:true,dash:sr.dash});
      if(!sr.noStitch)sr.pts.forEach(p=>{if(!p||p[1]==null||!isFinite(p[1]))return;const fc=(sr.der||[]).includes(p[0])?"d":(p[0]>split||(split===-1e9));s+=stitch(X(p[0]),Y(p[1]),sr.r||(W<600?3:3.6),sr.col,fc);});
      sr.pts.forEach((p,i)=>{if(p&&(p[1]==null||!isFinite(p[1]))&&i>0&&sr.pts[i-1]&&sr.pts[i-1][1]!=null){s+=`<text x="${X(p[0])}" y="${Y(sr.pts[i-1][1])-8}" text-anchor="middle" class="t-cap" style="fill:${C.mut}">puudub</text>`;}});
      if(sr.end!==false){const lp=sr.pts.filter(p=>p&&p[1]!=null&&isFinite(p[1])).slice(-1)[0];if(lp)labs.push({y:Y(lp[1]),y0:Y(lp[1]),x:X(lp[0]),t:sr.endLab||(sr.name+" "+tf(lp[1])),col:sr.col});}});
    (o.needles||[]).forEach(n=>{const x=X(n.x),y=Y(n.v);s+=`<line x1="${x}" x2="${x}" y1="${y}" y2="${H-B}" stroke="${C.ink}" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="4.5" fill="${C.bg}" stroke="${C.ink}" stroke-width="1.8"/><text x="${x-8}" y="${y-8}" text-anchor="end" class="t-lab">${e(n.lab)}</text>`;});
    if(R>40){spread(labs,14,T,H-B);labs.forEach(l=>{s+=`<path d="M${l.x+5},${l.y0}L${W-R+8},${l.y}" stroke="${l.col}" stroke-opacity=".5" fill="none"/><text x="${W-R+11}" y="${l.y+4}" class="t-labm" style="fill:${l.col}${narrow?";font-size:10px":""}">${e(l.t)}</text>`;});}
    // vihjeveerud
    const xs=[];for(let x=o.x0;x<=o.x1;x++)xs.push(x);const cw=(X(o.x1)-X(o.x0))/Math.max(1,xs.length-1);
    xs.forEach(x=>{const rows=[];o.series.forEach(sr=>{if(sr.noTip)return;const p=sr.pts.find(q=>q&&q[0]===x);if(p)rows.push([sr.name,p[1]==null||!isFinite(p[1])?"puudub":tf(p[1])]);});(o.bands||[]).forEach(b=>{const p=b.pts.find(q=>q[0]===x);if(p)rows.push([b.name||"vahemik",tf(p[1])+" … "+tf(p[2])]);});
      if(rows.length)s+=`<rect x="${X(x)-cw/2}" y="${T}" width="${cw}" height="${H-B-T}" fill="transparent"${tipAttr(tipHTML(x+(x>START?" · prognoos":x===START?" · täna":" · tegelik"),rows))}/>`;});
    return s+"</svg>";}
  /* tabel ajareast: years, cols:[{h,f:y=>value string}] */
  function ytable(years,cols){return K9.table(["Aasta",...cols.map(c=>c.h)],years.map(y=>[String(y)+(y>START?" *":""),...cols.map(c=>c.f(y))]));}
  K9.lines=lines;K9.ytable=ytable;
  K9.wOf=(el,sel)=>{const n=sel?el.querySelector(sel):el;return Math.max(300,Math.round((n&&n.clientWidth)||el.clientWidth||900));};
})();
