/* ---------- ANDMEKIHT 2016–2026: täiendatud aegread, päritolu, kontroll ja katvus (DB = data2/build_db.py) ----------
   finY täiendus: kui mudelis väärtus puudub (2016; 2017 osa ridu; rida 20), kasutatakse Statistikaameti väärtust praeguse territooriumi kohta
   (RR300; 2016–2017 puuduvad read RR30 eelkäijate summana, märgitud „ümberarvutatud”). Olemasolevaid mudeli väärtusi ei kirjutata üle.
   Majandusaasta aruannete väärtused on võrdluseks (DB.cmp); mudel kasutab RR300, sest see on kõigil aastatel sama definitsiooni ja ulatusega (KOV üksus, tekkepõhine). */
(function(){
  const {e,n0,mln}=K9;
  const V4=["Rapla","Kohila","Marjamaa","Kehtna"],base=finY;
  const fillV=(u,k,y)=>{if(u==="MAAK"){const a=V4.map(v=>fillV(v,k,y)??base(v,k,y));return a.every(x=>x!=null)?a.reduce((s,x)=>s+x,0):null;}const o=DB.fill[u]&&DB.fill[u][k]&&DB.fill[u][k][y];return o?o.v:null;};
  window.finY=function(u,k,y){let b=null;try{b=FINS[u]&&FINS[u][k]?base(u,k,y):null;}catch(_){b=null;}return b!=null?b:fillV(u,k,y);};
  K9.finSrc=(u,k,y)=>{try{if(FINS[u]&&FINS[u][k]&&base(u,k,y)!=null)return "mudel (RR300)";}catch(_){}if(u==="MAAK")return fillV(u,k,y)!=null?"valdade summa":"";const o=DB.fill[u]&&DB.fill[u][k]&&DB.fill[u][k][y];return o?o.src:"";};
  /* kontrolli staatus täpsustatakse kirje tekstist: „olemas ja kontrollitud” ainult siis, kui kõik kirjed on kontrollitud ja dokument tervikuna loetud */
  const ST={...DB.st,pok:"olemas, osaliselt kontrollitud"},STC={ok:"ok",pok:"pok",unc:"unc",part:"part",blk:"blk",nf:"nf",np:"np",cur:"cur",nc:"nc"};
  const covCell=(v,d,y)=>{const [s0,t]=DB.cov[v][d][y];const m=/(\d+)\/(\d+) kirjet kontrollitud/.exec(t||""),part=m&&+m[1]<+m[2],osal=/osaliselt loetud/.test(t||"");
    if(s0==="ok"&&(part||osal)){const fin=/finantstabelid loetud/.test(t)?"Finantstabelid loetud":"Andmed loetud";return ["pok",`${fin}; ${m?m[1]+"/"+m[2]+" kirjet kontrollitud":"kirjed osaliselt kontrollitud"}; dokument ${osal?"osaliselt":"tervikuna"} loetud.`+(t.includes("puudu:")?" "+t.slice(t.indexOf("puudu:")):""),t];}
    return [s0,t,t];};
  K9.covCell=covCell;
  const fmtV=(v,u)=>v==null?"–":u==="EUR"?mln(v):n0(v)+(u?" "+u:"");
  /* päritolu ja kontroll ühe näitaja ja aasta kohta (detailpaneelid) */
  K9.provHTML=(v,keys,y,title)=>{if(v==="MAAK"||!v)return "";const ks=[].concat(keys);let rows=[];
    ks.forEach(k=>{(DB.src[`${v}|${k}|${y}`]||[]).forEach(r=>rows.push({...r,key:k}));});
    const c=ks.map(k=>DB.cmp.find(x=>x.v===v&&x.k===k&&x.y===y)).filter(Boolean)[0];
    if(!rows.length&&!c)return `<details class="k9prov"><summary>Allikad ja kontroll · ${y}</summary><p class="k9note">Selle näitaja ja aasta kohta andmebaasis kirjet ei ole.</p></details>`;
    const cmpTxt=c?`<p class="k9provc">RR300: <b>${c.stat==null?"–":mln(c.stat)}</b> · aruanne: <b>${c.rep==null?"–":mln(c.rep)}</b> · mudel: <b>${c.model==null?"–":mln(c.model)}</b> — ${c.sr?({sama:"aruanne ja statistika klapivad",väike:"väike erinevus (≤1%)",erinev:"erinevus: tõenäoliselt arvestuspõhimõte või liigitus, vt kirjeid"})[c.sr]:"võrdluspaar puudub"}. Mudel kasutab RR300 väärtust (sama definitsioon kõigil aastatel).</p>`:"";
    return `<details class="k9prov"><summary>${title||"Allikad ja kontroll"} · ${y} <span>${rows.length} kirjet</span></summary>${cmpTxt}<ul>${rows.slice(0,12).map(r=>`<li><b>${e(fmtV(r.v,r.u))}</b> <span class="k9st k9st-${r.k==="osaline täitmine"||r.k==="strateegia prognoos"?"f":r.c==="kontrollitud"?"m":"d"}">${e(r.k)}</span> ${e(r.per)}<br><small>${e(r.n)}${r.p?" · "+e(r.p):""}${r.t&&r.t!=="praegune"?" · "+e(r.t):""}${r.sc?" · "+e(r.sc):""} · kontroll: ${e(r.c||"–")}${r.ret?" · hangitud "+e(r.ret):""}</small>${r.no?`<br><small class="k9provn">${e(r.no)}</small>`:""}${r.url&&/^https?:/.test(r.url)?` <a href="${e(r.url)}" target="_blank" rel="noopener">allikas ↗</a>`:""}</li>`).join("")}</ul></details>`;};
  /* jooksva aasta osaline täitmine (ei esitata aasta tulemusena) */
  K9.partHTML=(v,k)=>{if(v==="MAAK")return "";const P=(DB.part[v]||{})[k]||[];if(!P.length)return "";const cur=P.filter(x=>x.per.startsWith("2026")),prev=P.filter(x=>x.per.startsWith("2025"));
    return `<div class="k9plast k9part"><span>Jooksev aasta: osaline täitmine (ei ole aasta tulemus)</span>${cur.map(x=>{const pv=prev.find(z=>z.per.slice(4)===x.per.slice(4)&&z.f===x.f);return `<b>${e(mln(x.v))}</b><small>${e(x.per)} · ${e(x.n)}${pv?` · 2025 sama periood ${e(mln(pv.v))} (${(x.v/pv.v-1>=0?"+":"−")+nf1.format(Math.abs(x.v/pv.v-1)*100)}%)`:""}</small>`;}).join("")}</div>`;};
  /* katvusmaatriks */
  K9.covHTML=()=>{const YRS=[];for(let y=2016;y<=2026;y++)YRS.push(y);const NM={Rapla:"Rapla vald",Kohila:"Kohila vald",Marjamaa:"Märjamaa vald",Kehtna:"Kehtna vald"};
    const cnt={};V4.forEach(v=>DB.doms.forEach(([d])=>YRS.forEach(y=>{const s=covCell(v,d,y)[0];cnt[s]=(cnt[s]||0)+1;})));
    const leg=Object.entries(ST).map(([k,t])=>`<span class="k9cv k9cv-${STC[k]}">${e(t)}${cnt[k]?` · ${cnt[k]}`:""}</span>`).join("");
    const tbl=v=>`<div class="k9tbl k9covt"><table><caption>${NM[v]}</caption><thead><tr><th>Valdkond</th>${YRS.map(y=>`<th class="n">${y}</th>`).join("")}</tr></thead><tbody>${DB.doms.map(([d,n])=>`<tr><th scope="row">${e(n)}</th>${YRS.map(y=>{const [s,t,raw]=covCell(v,d,y);return `<td class="k9cv k9cv-${STC[s]}" tabindex="0" title="${e(ST[s]+": "+t)}"><span class="sr">${e(ST[s])}: </span>${({ok:"✓",pok:"◒",unc:"◐",part:"◑",blk:"⊘",nf:"×",np:"—",cur:"…",nc:"·"})[s]}<span class="k9covtip"><b>${e(ST[s])}</b><br>${e(t)}${raw!==t?`<br><small>${e(raw)}</small>`:""}</span></td>`;}).join("")}</tr>`).join("")}</tbody></table></div>`;
    const diff=DB.cmp.filter(c=>c.sr==="erinev");
    const dt=K9.table(["Vald","Aasta","Näitaja","RR300","Aruanne","Aruande allikas","Mudel kasutab"],diff.map(c=>[NM[c.v],String(c.y),e(DB.names[c.k]||c.k),mln(c.stat),mln(c.rep),`${e(c.rep_src.slice(0,60))}${c.rep_page?" · "+e(c.rep_page):""}`,"RR300"]),{textCols:[0,2,5,6]});
    const docs=K9.table(["Vald","Aasta","Dokument","Olek","Loetud ulatus"],DB.docs.filter(x=>x.vald&&x.doc_type).sort((a,b)=>(a.vald+a.year).localeCompare(b.vald+b.year)).map(x=>[e(x.vald),String(x.year||""),x.url&&/^https?:/.test(x.url)?`<a href="${e(x.url)}" target="_blank" rel="noopener">${e((x.title||"").slice(0,80))}</a>`:e((x.title||"").slice(0,80)),e(x.status||""),e((x.read_scope||"").slice(0,140))]),{textCols:[0,2,3,4]});
    const m=DB.meta;
    const series=K9.table(["Vald","Valdkond","Täielik aegrida (kõik aastad olemas ja kontrollitud)","Osaline (olemas, osaliselt kontrollitud või kontrollimata)","Puudub või ei kogutud"],V4.flatMap(v=>DB.doms.map(([d,n])=>{const a=YRS.map(y=>covCell(v,d,y)[0]),ok=a.filter(x=>x==="ok").length,pa=a.filter(x=>["pok","unc","part","cur"].includes(x)).length,mi=a.length-ok-pa;return [NM[v],e(n),ok===a.length?"jah":`ei (${ok}/${a.length} aastat)`,pa?String(pa)+" aastat":"–",mi?String(mi)+" aastat":"–"];})),{textCols:[0,1,2]});
    return `<p class="k9pdesc">Andmebaas: ${n0(m.records)} väärtuskirjet ja ${m.docs} dokumenti (koostatud ${e(m.built)}). Iga kirje juures on allikas, lehekülg või tabelikood, andmeolek, hankimise kuupäev ja kontrolli tulemus.
      Mudeli 2017–2025 rahandusandmed klapivad Statistikaameti RR300-ga: <b>${m.cmp_model_stat.sama||0}</b> võrdlust, erinevusi ${m.cmp_model_stat.erinev||0}. Majandusaasta aruanded vs RR300: ${m.cmp_rep_stat.sama} sama, ${m.cmp_rep_stat.väike} väike (≤1%), ${m.cmp_rep_stat.erinev} erinevat (allpool).</p>
      <div class="k9covleg">${leg}</div><div class="k9covg">${V4.map(tbl).join("")}</div>
      <details class="k9prov"><summary>Täielikud ja osalised aegread valdkonniti</summary>${series}</details>
      <details class="k9prov"><summary>Aruande ja RR300 sisulised erinevused (${diff.length})</summary><p class="k9note">Erinevused tulenevad peamiselt arvestuspõhimõttest (vanemad aruanded kassapõhised, RR300 tekkepõhine), liigitusest (nt põhivara soetus koos ettemaksete või antud laenudega, majandamiskulude piir) ning sellest, et 2016–2017 RR30 summa on eelkäijate lihtsumma ilma omavaheliste ülekannete elimineerimiseta. Mõlemad väärtused on säilitatud; mudel kasutab RR300, sest see on kõigil aastatel sama definitsiooniga.</p>${dt}</details>
      <details class="k9prov"><summary>Dokumendid ja lugemise ulatus (${DB.docs.length})</summary>${docs}</details>`;};
})();
