/* ---------- SEOSED · ÖKONOMEETRIA JA KORRELATSIOONID (v43) ----------
   Andmed: window.ECON (econ/build.py; 79 omavalitsuse ristlõige, Statistikaamet + kanga Eesti võrdlus RR300).
   Nelja valla ajaread: POP, finY (RR300), TOO_DATA, EDU. Kõik statistikud arvutatakse brauseris samade valemitega,
   mida kontrolliti Pythonis (scipy, statsmodels). Puuduvaid väärtusi ei asendata; näidisandmeid ei kasutata. */
(function(){
  const E=window.ECON;if(!E)return;
  const {C,VC,e,lg,fig,table,sec,tipAttr,tipHTML}=K9;
  const NFC={};const nf=(x,d=1)=>{if(x==null||!isFinite(x))return "–";const f=NFC[d]||(NFC[d]=new Intl.NumberFormat("et-EE",{minimumFractionDigits:d,maximumFractionDigits:d}));return f.format(x).replace("-","−");};
  const sg=(x,d=2)=>x==null||!isFinite(x)?"–":(x>0?"+":x<0?"−":"±")+nf(Math.abs(x),d);
  const pf=p=>p==null||!isFinite(p)?"–":p<0.001?"<0,001":nf(p,3),peq=p=>p==null||!isFinite(p)?"= –":p<0.001?"< 0,001":"= "+nf(p,3);
  const N=E.kov.length,KOV=E.kov,CTY=E.cty,VARS=E.vars,VK={};VARS.forEach(v=>VK[v.k]=v);
  const RI=[52,53,54,55],RVK={52:"Kehtna",53:"Kohila",54:"Marjamaa",55:"Rapla"},SHN=i=>KOV[i].replace(/ vald$/,"").replace(/ linn$/," l.");
  const HARJU=CTY.map(c=>c==="Harju"?1:0),LINN=KOV.map(k=>/linn$/.test(k)||k==="Tallinn"?1:0),POP25=VK.pop.v1;
  const GRPS={all:{n:"Kõik 79 omavalitsust",f:()=>true},noTln:{n:"Ilma Tallinnata",f:i=>KOV[i]!=="Tallinn"},
    noIsl:{n:"Ilma väikesaarteta (alla 1000 elaniku)",f:i=>POP25[i]>=1000},
    sim:{n:"Sarnased maavallad (4–16 tuh elanikku, väljaspool Harjumaad)",f:i=>/vald$/.test(KOV[i])&&CTY[i]!=="Harju"&&POP25[i]>=4000&&POP25[i]<=16000}};
  const GN=Object.fromEntries(Object.keys(GRPS).map(g=>[g,KOV.filter((_,i)=>GRPS[g].f(i)).length]));
  const GROUPN=Object.fromEntries(E.groups);
  /* ---------- olek ---------- */
  const DEFSEL=["popChg","netMig","natInc","sh017","sh65","dli","earn","inc","reg","jobs","ent","tm","kulud","inv","sots","tulem"];
  let G="all",SNAP="end",METH="auto",PART=false,MSEL=new Set(DEFSEL),SX="sh65",SY="popChg",LX=false,LY=false,TOT=false,HM=true,
      MODEL="M1",OWNY="netMig",OWNX=["inc","sh017"],OWNG="all",SCV=55,SCX={},P0=2017,P1=2025,REAL=false,PIDX=true,ALLP=false;
  /* ---------- andmete ligipääs ---------- */
  const isPer=v=>!v.v0&&/[–→]/.test(v.per);
  function vals(k,snap){const v=VK[k];if(snap==="start"){if(v.v0)return v.v0;if(isPer(v))return v.v1;return null;}return v.v1;}
  const yr=(k,snap)=>{const v=VK[k];if(isPer(v))return v.per;return String(snap==="start"&&v.v0?v.y0:v.y1);};
  const LNK=k=>k==="pop";
  const SN={pop:"Rahvaarv (log)",popChg:"Rahvaarvu muutus",netMig:"Rändesaldo",natInc:"Loomulik iive",birth:"Sündimus",sh017:"0–17 osakaal",sh65:"65+ osakaal",sh65Chg:"65+ osakaalu muutus",dli:"Tööturusurveindeks",earn:"Tööga seotud tuluga isikud",inc:"Tööga seotud tulu isiku kohta",incChgR:"Tulu reaalkasv",wage:"Brutokuupalk",jobs:"Töötajaid töökohtadel",reg:"Registreeritud töötud",regChg:"Reg. töötute muutus",ent:"Ettevõtteid / 1000 el",tm:"Tulumaks / elanik",tulCAGR:"Tulude kasv",fond:"Fondide osakaal",myyk:"Müügitulu / elanik",kulud:"Kulud / elanik",kulCAGR:"Kulude kasv",persCAGR:"Personalikulude kasv",sots:"Sotsiaaltoetused / elanik",inv:"Investeeringud / elanik",tulem:"Põhitegevuse tulem",fin:"Finantskulud",laen:"Laenud / elanik"};
  const vname=k=>LNK(k)?"Rahvaarv (log)":VK[k].n;
  const unitTxt=k=>VK[k].u;
  const fmtV=(k,x)=>{const u=VK[k].u;if(x==null)return "–";if(k==="pop")return nf(x,0);if(/€/.test(u))return nf(x,0);if(u==="indeks")return nf(x,2);return nf(x,1);};
  const KINDN={"osakaal":"osakaal","määr":"määr (1000 elaniku kohta aastas)","määr %":"määr (%)","tulu saaja kohta":"tulu saaja kohta","elaniku kohta":"elaniku kohta","töötaja kohta":"töötaja kohta","kogus":"kogusumma","muutus":"muutus","indeks":"suhtarv"};
  /* ---------- statistika ---------- */
  const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
  function rank(a){const ix=a.map((x,i)=>[x,i]).sort((p,q)=>p[0]-q[0]),r=new Array(a.length);for(let i=0;i<ix.length;){let j=i;while(j+1<ix.length&&ix[j+1][0]===ix[i][0])j++;const av=(i+j)/2+1;for(let k=i;k<=j;k++)r[ix[k][1]]=av;i=j+1;}return r;}
  function pear(x,y){const n=x.length,mx=mean(x),my=mean(y);let a=0,b=0,c=0;for(let i=0;i<n;i++){const p=x[i]-mx,q=y[i]-my;a+=p*q;b+=p*p;c+=q*q;}return b>0&&c>0?a/Math.sqrt(b*c):NaN;}
  function lgam(x){const c=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];let y=x,t=x+5.5;t-=(x+0.5)*Math.log(t);let s=1.000000000190015;for(const ci of c)s+=ci/++y;return -t+Math.log(2.5066282746310005*s/x);}
  function betacf(a,b,x){const FP=1e-300;let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap;if(Math.abs(d)<FP)d=FP;d=1/d;let h=d;
    for(let m=1;m<=300;m++){const m2=2*m;let aa=m*(b-m)*x/((qam+m2)*(a+m2));d=1+aa*d;if(Math.abs(d)<FP)d=FP;c=1+aa/c;if(Math.abs(c)<FP)c=FP;d=1/d;h*=d*c;
      aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));d=1+aa*d;if(Math.abs(d)<FP)d=FP;c=1+aa/c;if(Math.abs(c)<FP)c=FP;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<3e-14)break;}return h;}
  function ibeta(x,a,b){if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(lgam(a+b)-lgam(a)-lgam(b)+a*Math.log(x)+b*Math.log(1-x));return x<(a+1)/(a+b+2)?bt*betacf(a,b,x)/a:1-bt*betacf(b,a,1-x)/b;}
  const pT=(t,df)=>ibeta(df/(df+t*t),df/2,0.5);
  function tcrit(df){let lo=0,hi=60;for(let i=0;i<70;i++){const m=(lo+hi)/2;if(pT(m,df)>0.05)lo=m;else hi=m;}return (lo+hi)/2;}
  function skew(a){const n=a.length,m=mean(a);let m2=0,m3=0;a.forEach(x=>{const d=x-m;m2+=d*d;m3+=d*d*d;});m2/=n;m3/=n;return m2>0?m3/Math.pow(m2,1.5):0;}
  function med(a){const s=[...a].sort((p,q)=>p-q),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2;}
  function outl(a){const m=med(a),mad=med(a.map(x=>Math.abs(x-m)))*1.4826;return a.map(x=>mad>0&&Math.abs(x-m)/mad>3.5);}
  function inv(A){const n=A.length,M=A.map((r,i)=>[...r,...A.map((_,j)=>i===j?1:0)]);
    for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;[M[c],M[p]]=[M[p],M[c]];const d=M[c][c];if(Math.abs(d)<1e-10)return null;
      for(let k=0;k<2*n;k++)M[c][k]/=d;for(let r=0;r<n;r++)if(r!==c){const f=M[r][c];if(f)for(let k=0;k<2*n;k++)M[r][k]-=f*M[c][k];}}return M.map(r=>r.slice(n));}
  function ols(y,X,o){o=o||{};const n=y.length,k=X[0].length,XtX=Array.from({length:k},()=>new Array(k).fill(0)),Xty=new Array(k).fill(0);
    for(let i=0;i<n;i++)for(let a=0;a<k;a++){Xty[a]+=X[i][a]*y[i];for(let b=0;b<k;b++)XtX[a][b]+=X[i][a]*X[i][b];}
    const XI=inv(XtX);if(!XI)return null;const b=XI.map(r=>r.reduce((s,v,j)=>s+v*Xty[j],0));
    const yh=X.map(r=>r.reduce((s,v,j)=>s+v*b[j],0)),res=y.map((v,i)=>v-yh[i]),ym=mean(y);
    const sst=y.reduce((s,v)=>s+(v-ym)**2,0),sse=res.reduce((s,v)=>s+v*v,0),df=n-k,s2=sse/df;
    if(o.light)return {b,res,yh,n,k,XI,s2,df};
    const h=X.map(r=>{let s=0;for(let a=0;a<k;a++)for(let c=0;c<k;c++)s+=r[a]*XI[a][c]*r[c];return s;});
    const meat=Array.from({length:k},()=>new Array(k).fill(0));for(let i=0;i<n;i++){const w=(res[i]/(1-Math.min(h[i],0.999)))**2;for(let a=0;a<k;a++)for(let c=0;c<k;c++)meat[a][c]+=w*X[i][a]*X[i][c];}
    const V=XI.map((r,a)=>XI.map((_,c)=>{let s=0;for(let p=0;p<k;p++)for(let q=0;q<k;q++)s+=XI[a][p]*meat[p][q]*XI[q][c];return s;}));
    const se=V.map((r,i)=>Math.sqrt(Math.max(0,r[i]))),t=b.map((v,i)=>v/se[i]),p=t.map(x=>pT(Math.abs(x),df));
    const r2=1-sse/sst;return {b,se,t,p,r2,ar2:1-(1-r2)*(n-1)/df,res,yh,h,XI,s2,df,n,k};}
  function resid(y,Z){const f=ols(y,Z,{light:true});return f?f.res:y;}
  const strength=r=>{const a=Math.abs(r);return a<0.1?"seost praktiliselt ei ole":a<0.3?"nõrk":a<0.5?"mõõdukas":a<0.7?"tugev":"väga tugev";};
  function bh(ps){const m=ps.length,o=ps.map((p,i)=>[p,i]).sort((a,b)=>a[0]-b[0]),q=new Array(m);let prev=1;for(let j=m-1;j>=0;j--){const v=Math.min(prev,o[j][0]*m/(j+1));q[o[j][1]]=v;prev=v;}return q;}
  /* osaliselt sama komponendiga (definitsiooniliselt seotud) paarid */
  const STRUCT=[["popChg","netMig"],["popChg","natInc"],["popChg","birth"],["natInc","birth"],["natInc","sh65"],["birth","sh017"],["sh017","dli"],["sh65","sh65Chg"],["sh017","sh65"],["earn","reg"],["reg","regChg"],["inc","incChgR"],["tulCAGR","kulCAGR"],["kulCAGR","persCAGR"],["tulem","fin"],["laen","fin"],["tm","fond"],["pop","popChg"],["jobs","earn"],["earn","tm"],["sh65","popChg"],["inc","tm"]];
  const isStruct=(a,b)=>STRUCT.some(([p,q])=>(p===a&&q===b)||(p===b&&q===a));
  /* korrelatsioon: valik, meetod, osakorrelatsioon (kontroll: ln rahvaarv + Harjumaa) */
  function corr(kx,ky,o){o=o||{};const snap=o.snap||SNAP,g=o.g||G,meth=o.meth||METH;const x=vals(kx,snap),y=vals(ky,snap);if(!x||!y)return null;
    const pv=vals("pop",snap==="start"?"start":"end"),idx=[];
    for(let i=0;i<N;i++)if(GRPS[g].f(i)&&x[i]!=null&&y[i]!=null&&(!LNK(kx)||x[i]>0)&&(!LNK(ky)||y[i]>0))idx.push(i);
    const tf=k=>LNK(k)?Math.log:(v=>v),X=idx.map(i=>tf(kx)(x[i])),Y=idx.map(i=>tf(ky)(y[i])),n=idx.length;if(n<10)return {ok:false,n,idx};
    const sk=[skew(X),skew(Y)],ol=[outl(X),outl(Y)],no=[ol[0].filter(Boolean).length,ol[1].filter(Boolean).length];let m=meth,why="";
    if(m==="auto"){if(Math.abs(sk[0])<1&&Math.abs(sk[1])<1&&!no[0]&&!no[1]){m="pearson";why="mõlema näitaja jaotus on lähedane sümmeetrilisele ja erindeid ei ole";}
      else{m="spearman";const w=[];if(Math.abs(sk[0])>=1||Math.abs(sk[1])>=1)w.push("jaotus on viltune");if(no[0]||no[1])w.push(`${no[0]+no[1]} erindit`);why=w.join(", ")+" — järjestuspõhine meetod on vähem tundlik";}}
    else why="kasutaja valik";
    let A=X,B=Y;if(m==="spearman"){A=rank(X);B=rank(Y);}
    let r=pear(A,B),kc=0,r0=r;
    const cn=[],ctrl=()=>{const lp=idx.map(i=>Math.log(pv[i])),hj=idx.map(i=>HARJU[i]),cols=[];if(kx!=="pop"&&ky!=="pop"){cols.push(m==="spearman"?rank(lp):lp);cn.push("suurus (log rahvaarv)");}if(hj.some(v=>v)&&hj.some(v=>!v)){cols.push(hj);cn.push("Harjumaa");}return cols;};
    const cols=ctrl();let rp=null;if(cols.length){const Z=idx.map((_,j)=>[1,...cols.map(c=>c[j])]);rp=pear(resid(A,Z),resid(B,Z));}
    if(o.partial&&rp!=null){r=rp;kc=cols.length;}
    const df=n-2-kc,t=r*Math.sqrt(df/Math.max(1e-12,1-r*r)),p=pT(Math.abs(t),df),se=m==="spearman"?Math.sqrt((1+r*r/2)/(n-3-kc)):1/Math.sqrt(n-3-kc),z=Math.atanh(Math.max(-0.9999999,Math.min(0.9999999,r)));
    return {ok:true,cn,n,idx,r,r0,rp,kc,p,lo:Math.tanh(z-1.96*se),hi:Math.tanh(z+1.96*se),m,why,sk,ol,X,Y,ncols:cols.length};}
  const MN={pearson:"Pearson",spearman:"Spearman"},RS=m=>m==="spearman"?"ρ":"r";
  /* ---------- üldised juhtnupud ---------- */
  const sel=(attr,opts,cur,lab)=>`<label class="k9ek-f"><span>${lab}</span><select ${attr}>${opts.map(([v,t,dis])=>`<option value="${e(v)}"${String(v)===String(cur)?" selected":""}${dis?" disabled":""}>${e(t)}</option>`).join("")}</select></label>`;
  const seg=(attr,opts,cur,lab)=>`<div class="k9ek-f"><span>${lab}</span><div class="k9seg" role="group" aria-label="${e(lab)}">${opts.map(([v,t])=>`<button type="button" ${attr}="${v}" aria-pressed="${String(v)===String(cur)}">${t}</button>`).join("")}</div></div>`;
  function bar(){return `<div class="k9ek-bar" role="group" aria-label="Analüüsi üldvalikud">
      ${sel("data-ekg",Object.keys(GRPS).map(g=>[g,`${GRPS[g].n} (n = ${GN[g]})`]),G,"Võrdlusrühm")}
      ${seg("data-eks",[["end","Lõppseis (~2025)"],["start","Algseis (~2019)"]],SNAP,"Taseme näitajate aasta")}
      ${seg("data-ekm",[["auto","Automaatne"],["spearman","Spearman"],["pearson","Pearson"]],METH,"Korrelatsioon")}
      <p class="k9ek-barnote">Raplamaa vallad on alati esile tõstetud. Valik kehtib maatriksile, hajuvusdiagrammile ja tõlgendustele.</p></div>`;}
  const kindB=k=>({d:`<span class="k9ek-kind d">kirjeldav seos</span>`,m:`<span class="k9ek-kind m">mudelipõhine hinnang</span>`,c:`<span class="k9ek-kind c">põhjuslik järeldus — siin ei tehta</span>`})[k];
  /* ---------- 1. ANDMETE KONTROLL ---------- */
  const srcL=ks=>ks.map(s=>`<a href="${e(E.src[s][0])}" target="_blank" rel="noopener" title="${e(E.src[s][1])}">${s}</a>`).join(", ");
  function pctl(a,i){const v=a[i];if(v==null)return null;const ok=a.filter(x=>x!=null);return ok.filter(x=>x<v).length/(ok.length-1||1)*100;}
  function dataTab(){const rows=VARS.map(v=>{const a=v.v1,ok=a.map((x,i)=>x!=null?i:-1).filter(i=>i>=0),miss=a.map((x,i)=>x==null?KOV[i]:null).filter(Boolean),X=ok.map(i=>LNK(v.k)?Math.log(a[i]):a[i]),ol=outl(X),oN=ok.filter((_,j)=>ol[j]).map(i=>SHN(i)),sk=skew(X);
      return [`<b>${e(v.n)}</b><br><small>${e(GROUPN[v.g])}</small>`,e(v.u),e(KINDN[v.kind]||v.kind)+(v.nom?"<br><small>nominaalne</small>":/reaal|THI/.test(v.de)?"<br><small>reaalne</small>":""),e(v.y0?`${v.y0} / ${v.y1}`:v.per),srcL(v.src)+"<br><small>"+v.src.map(s=>E.meta.upd[s]?`${s}: ${e(E.meta.upd[s])}`:"").filter(Boolean).join("; ")+"</small>",
        String(ok.length),miss.length?`<span class="k9ek-miss">${miss.length}: ${e(miss.join(", "))}</span>`:"0",oN.length?`${oN.length}: ${e(oN.slice(0,4).join(", "))}${oN.length>4?" …":""}`:"0",nf(sk,1),
        RI.map(i=>`<span style="color:${VC[RVK[i]]}">${e(SHN(i))}</span> ${fmtV(v.k,a[i])} <small>(${a[i]==null?"–":nf(pctl(a,i),0)+". prots."})</small>`).join("<br>")];});
    return table(["Näitaja","Ühik","Liik","Aasta(d)","Allikas ja uuendus","n","Puudu","Erindid (|robust z| > 3,5)","Kaldus","Raplamaa vallad 2025 (protsentiil 79 seas)"],rows,{textCols:[1,2,3,4,6,7,9]});}
  function secData(){return `<div class="k9ek-grid2">
      <div class="k9ek-card"><h4>Kontrollitud enne analüüsi</h4><ul class="k9ek-list">
        <li><b>Territoorium:</b> ${e(E.meta.border)}. Haldusreformi eelseid piire ei segata.</li>
        <li><b>Rahvaarvu kooskõla:</b> ${e(E.meta.popCheck)}.</li>
        <li><b>Ajavahemik:</b> kaks seisu — algseis (2019; palk 2021) ja lõppseis (2025; tulu 2024). Muutused on arvutatud nende vahel. Iga-aastast aegrida kõigi 79 kohta ei pärinud, seega paneelmudelit ei hinnata.</li>
        <li><b>Puuduvad väärtused</b> jäävad tühjaks ja vaatlus jääb selle näitajaga arvutusest välja (paaripõhine välistamine). Nulliga ei asendata.</li>
        <li><b>Erindid</b> märgitakse robustse z-skoori järgi (mediaan ja MAD); neid ei kustutata. Väikesaared (Ruhnu, Vormsi, Kihnu) on mitmes näitajas erindid — võrdlusrühm „Ilma väikesaarteta” jätab need välja.</li></ul></div>
      <div class="k9ek-card"><h4>Nominaalne ja reaalne, kogusumma ja elaniku kohta</h4><ul class="k9ek-list">
        <li>Rahalised tasemed (tulu, palk, tulumaks, kulud) on <b>nominaalsed</b>. Ühe aasta ristlõikes ei muuda inflatsiooniga korrigeerimine korrelatsiooni ega regressiooni tulemust, sest kõiki omavalitsusi korrigeeritakse sama teguriga.</li>
        <li>Muutused ajas on märgitud: tööga seotud tulu kasv on <b>reaalne</b> (THI 2019→2024 = ×${nf(E.cpi["2024"]/E.cpi["2019"],3)}); omavalitsuse tulude ja kulude kasv on nominaalne nagu kanga Eesti võrdluses (THI 2021→2025 = ×${nf(E.cpi["2025"]/E.cpi["2021"],3)}).</li>
        <li>Seosed arvutatakse <b>elaniku, töötaja või elanike rühma kohta</b>. Kogusummad korreleeruvad omavalitsuse suurusega peaaegu alati, seega neid maatriksis ei kasutata; hajuvusdiagrammil saab rahalised näitajad kuvada ka kogusummana.</li>
        <li>Rahvaarv on seostes logaritmitud (suurusefekt).</li></ul></div></div>
      ${fig({kick:"Andmepass",title:`${VARS.length} näitajat × ${N} omavalitsust`,read:"Iga näitaja allikas, ühik, aasta, vaatluste arv, puuduvad väärtused, erindid ja jaotuse kaldus. Kaldus üle ±1 tähendab, et väärtused on ebaühtlaselt jaotunud — siis kasutatakse Spearmani korrelatsiooni.",body:`<div class="k9ek-wide">${dataTab()}</div>`,
        src:`Statistikaamet (andmed.stat.ee PxWeb API, päritud ${e(E.meta.fetched)}); omavalitsuste eelarve näitajad kanga Eesti võrdlusest (RR300, 2021–2025). Toorandmed: econ/raw/kov79.txt, töötlus: econ/build.py.`})}`;}
  /* ---------- 2. KORRELATSIOONIMAATRIKS ---------- */
  function avail(k){return !!vals(k,SNAP);}
  let CHOPEN=null;function chips(){if(CHOPEN==null)CHOPEN=innerWidth>=700;return `<details class="k9ek-chd"${CHOPEN?" open":""}><summary>Maatriksi näitajad: ${[...MSEL].filter(avail).length} valitud</summary><div class="k9ek-chips" role="group" aria-label="Maatriksi näitajad">${E.groups.map(([g,gn])=>`<div class="k9ek-chg"><span class="k9lbl">${e(gn)}</span>${VARS.filter(v=>v.g===g&&v.k!=="pop").map(v=>{const a=avail(v.k);return `<button type="button" data-ekv="${v.k}" aria-pressed="${MSEL.has(v.k)&&a}"${a?"":` disabled title="Algseisu väärtust ei ole (ainult ${e(yr(v.k,"end"))})"`}>${e(v.n)}</button>`;}).join("")}</div>`).join("")}
      <div class="k9ek-chg"><button type="button" class="k9btn ghost sm" data-ekall="def">Vaikimisi valik</button><button type="button" class="k9btn ghost sm" data-ekall="all">Kõik näitajad</button><button type="button" class="k9btn ghost sm" data-ekall="none">Tühjenda</button></div></div></details>`;}
  function matrix(W){const ks=VARS.map(v=>v.k).filter(k=>k!=="pop"&&MSEL.has(k)&&avail(k)),m=ks.length;if(m<2)return {svg:`<p class="k9note">Vali vähemalt kaks näitajat.</p>`,pairs:[]};
    const pairs=[];for(let i=0;i<m;i++)for(let j=i+1;j<m;j++){const c=corr(ks[i],ks[j],{partial:PART});if(c&&c.ok)pairs.push({a:ks[i],b:ks[j],i,j,c});}
    const q=bh(pairs.map(p=>p.c.p));pairs.forEach((p,i)=>p.q=q[i]);
    const narrow=W<640,Lw=narrow?150:186,cs=Math.max(narrow?26:28,Math.min(44,Math.floor((W-Lw-110)/m))),T=narrow?128:142,Wd=Lw+cs*m+110,H=T+cs*m+10;
    const cell={};pairs.forEach(p=>{cell[p.i+"|"+p.j]=p;cell[p.j+"|"+p.i]=p;});
    let s=`<svg viewBox="0 0 ${Wd} ${H}" style="min-width:${Wd}px;max-width:${Math.max(Wd,600)}px" role="img" aria-label="Korrelatsioonimaatriks, ${m} näitajat, ${GN[G]} omavalitsust">`;
    s+=`<defs><pattern id="ek-h" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="${C.line2}" stroke-width="1.4"/></pattern></defs>`;
    let lastG=null;ks.forEach((k,i)=>{const y=T+i*cs+cs/2,x=Lw+i*cs+cs/2,nm=vname(k),sh=SN[k]||nm;
      if(VK[k].g!==lastG&&i){s+=`<line x1="${Lw-Lw+6}" x2="${Lw+m*cs}" y1="${T+i*cs}" y2="${T+i*cs}" stroke="${C.line2}" stroke-width="1.2"/><line x1="${Lw+i*cs}" x2="${Lw+i*cs}" y1="${T-6}" y2="${T+m*cs}" stroke="${C.line2}" stroke-width="1.2"/>`;}lastG=VK[k].g;
      s+=`<text x="${Lw-8}" y="${y+4}" text-anchor="end" class="t-ax" style="fill:${C.mut};font-family:var(--f-body)"><title>${e(nm)} (${e(yr(k,SNAP))})</title>${e(sh)}</text>`;
      s+=`<text transform="translate(${x+4},${T-8}) rotate(-50)" class="t-ax" style="fill:${C.mut};font-family:var(--f-body)">${e(sh)}</text>`;});
    for(let i=0;i<m;i++)for(let j=0;j<m;j++){const x=Lw+j*cs,y=T+i*cs;if(i===j){s+=`<rect x="${x+1}" y="${y+1}" width="${cs-2}" height="${cs-2}" fill="${C.surf}"/>`;continue;}
      const p=cell[i+"|"+j];if(!p){s+=`<rect x="${x+1}" y="${y+1}" width="${cs-2}" height="${cs-2}" fill="url(#ek-h)"/>`;continue;}
      const r=p.c.r,sig=p.q<0.05,col=r>=0?C.sc:C.op,st=isStruct(p.a,p.b),lab=Math.abs(r)<0.005?"0":(r<0?"−":"")+(cs<34?nf(Math.abs(r),2).replace(/^0/,""):nf(Math.abs(r),2));
      const tip=tipHTML(`${vname(p.a)} × ${vname(p.b)}`,[[`${MN[p.c.m]} ${RS(p.c.m)}${PART?" (osakorrelatsioon)":""}`,sg(r,2)],["95% usaldusvahemik",`${sg(p.c.lo,2)} … ${sg(p.c.hi,2)}`],["n",String(p.c.n)],["p / BH q",`${pf(p.c.p)} / ${pf(p.q)}`],["tugevus",strength(r)]],(sig?"Säilib mitme võrdluse korrektsiooni järel. ":"Ebakindel: ei säili mitme võrdluse korrektsiooni järel. ")+(st?"Osaliselt sama komponent — seos on osaliselt definitsiooniline. ":"")+"Klõpsa: hajuvusdiagramm.");
      s+=`<g class="k9ek-cell" data-ekpair="${p.a}|${p.b}" tabindex="0" role="button" aria-label="${e(vname(p.a))} ja ${e(vname(p.b))}: ${sg(r,2)}, ${sig?"kindel":"ebakindel"}"${tipAttr(tip)}>`;
      s+=sig?`<rect x="${x+1}" y="${y+1}" width="${cs-2}" height="${cs-2}" rx="2" fill="${col}" fill-opacity="${(0.12+0.78*Math.abs(r)).toFixed(2)}"/>`:`<rect x="${x+1.5}" y="${y+1.5}" width="${cs-3}" height="${cs-3}" rx="2" fill="none" stroke="${col}" stroke-opacity=".55" stroke-dasharray="2 2"/>`;
      s+=`<text x="${x+cs/2}" y="${y+cs/2+4}" text-anchor="middle" style="font:${sig?700:500} ${cs<30?9.5:11}px var(--f-num);fill:${sig?(Math.abs(r)>0.55?C.bg:C.ink):C.dim}">${lab}</text>`;
      if(st)s+=`<circle cx="${x+cs-5}" cy="${y+5}" r="2.2" fill="${C.warn}"/>`;s+=`</g>`;}
    return {svg:s+`</svg>`,pairs};}
  function pairsTable(pairs){const L=[...pairs].sort((a,b)=>Math.abs(b.c.r)-Math.abs(a.c.r));const show=ALLP?L:L.slice(0,25);
    return table(["Paar","Meetod",`${PART?"Osakorr.":"Korr."}`,"95% vahemik","n","p","BH q","Tugevus ja kindlus"],show.map(p=>[`${e(vname(p.a))} × ${e(vname(p.b))}${isStruct(p.a,p.b)?' <span class="k9ek-st" title="osaliselt sama komponent">◆ definitsiooniline</span>':""}`,MN[p.c.m],sg(p.c.r,2),`${sg(p.c.lo,2)} … ${sg(p.c.hi,2)}`,String(p.c.n),pf(p.c.p),pf(p.q),`${strength(p.c.r)}${p.q<0.05?"":" · ebakindel"}`]),{textCols:[1,7]})+
      (L.length>25?`<p><button type="button" class="k9btn ghost sm" data-ekallp>${ALLP?"Näita 25 tugevamat":`Näita kõiki ${L.length} paari (ka nõrgad)`}</button></p>`:"");}
  function secMatrix(W){const M=matrix(W),np=M.pairs.length,ns=M.pairs.filter(p=>p.q<0.05).length,nst=M.pairs.filter(p=>isStruct(p.a,p.b)).length;
    return `${chips()}<div class="k9ek-row">${seg("data-ekp",[["0","Tavaline korrelatsioon"],["1","Osakorrelatsioon (suurus ja Harjumaa arvestatud)"]],PART?"1":"0","Segavad tegurid")}</div>`+
      fig({kick:`Korrelatsioonimaatriks · ${GN[G]} omavalitsust · ${SNAP==="end"?"lõppseis":"algseis"}`,title:`${np} näitajapaari, neist ${ns} säilib mitme võrdluse korrektsiooni järel`,
        read:`Täidetud ruut = seos säilib Benjamini–Hochbergi korrektsiooni järel (valepositiivsete eeldatav osakaal leidude seas ≤ 5%). Katkendliku servaga tühi ruut = ebakindel seos. Sinine = koos kasvavad, lilla = üks kasvab, teine kahaneb. Kollane täpp = paaril on ühine komponent (${nst} paari), nende seos on osaliselt definitsiooniline. ${PART?"Osakorrelatsioon eemaldab mõlemast näitajast rahvaarvu (log) ja Harjumaa mõju (kui üks telg on rahvaarv, siis ainult Harjumaa; rühmas, kus Harjumaa omavalitsusi ei ole, ainult rahvaarvu).":"Paljud seosed peegeldavad sama taustategurit — Tallinna lähedust ja omavalitsuse suurust. Vaata osakorrelatsiooni."}`,
        legend:[lg.sq(C.sc,"positiivne seos"),lg.sq(C.op,"negatiivne seos"),lg.sq(C.dim,"ebakindel (tühi, katkendlik serv)",true),`<span><svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="3" fill="${C.warn}"/></svg>ühine komponent</span>`,lg.txt("arv = korrelatsioonikordaja (−1 … +1)")],
        body:M.svg,table:pairsTable(M.pairs),
        method:`Meetod valitakse paari kaupa: Pearson, kui mõlema näitaja kaldus on alla ±1 ja erindeid ei ole; muidu Spearman (järjestuskorrelatsioon). 95% usaldusvahemik Fisheri z-teisendusega (Spearmanil Bonetti–Wrighti standardviga). p-väärtus t-jaotusest (df = n − 2 − kontrollitegurite arv). Mitme võrdluse korrektsioon: Benjamini–Hochberg kõigi kuvatud paaride peale. Osakorrelatsioon: mõlemad näitajad (Spearmanil nende järjestused) regresseeritakse ln rahvaarvu ja Harjumaa tunnuse peale ning korreleeritakse jäägid. Vaatlused on omavalitsused ühel ajahetkel; naaberomavalitsused ei ole täiesti sõltumatud (ruumiline autokorrelatsioon), seega on vahemikud pigem liiga kitsad kui laiad.`,
        src:`Statistikaamet; kanga Eesti võrdlus (RR300). Vt „Andmete kontroll”.`})+`<p class="k9ek-legal">${kindB("d")} Korrelatsioon näitab, et kaks näitajat liiguvad omavalitsuste lõikes koos. See ei näita, kumb mõjutab kumba, ega välista kolmandat põhjust.</p>`;}
  /* ---------- 3. HAJUVUSDIAGRAMM ---------- */
  function niceT(lo,hi,n){const sp=(hi-lo)||1,st0=sp/n,mag=Math.pow(10,Math.floor(Math.log10(st0))),f=st0/mag,st=(f<1.5?1:f<3?2:f<7?5:10)*mag;const a=[];for(let v=Math.ceil(lo/st)*st;v<=hi+st*1e-9;v+=st)a.push(+v.toFixed(10));return a;}
  const MONEY=k=>/€/.test(VK[k].u)&&VK[k].kind==="elaniku kohta";
  function scatterData(){const snap=SNAP,x=vals(SX,snap),y=vals(SY,snap),pv=vals("pop",snap)||VK.pop.v1;if(!x||!y)return null;
    const tx=(k,v,i)=>v==null?null:TOT&&MONEY(k)?v*pv[i]:v;const P=[];for(let i=0;i<N;i++){if(!GRPS[G].f(i))continue;const a=tx(SX,x[i],i),b=tx(SY,y[i],i);if(a==null||b==null)continue;if((LX||LNK(SX))&&a<=0)continue;if(LY&&b<=0)continue;P.push({i,x:a,y:b});}return P;}
  function scatter(W){const P=scatterData();if(!P)return `<p class="k9note">Valitud seisus ei ole ühel näitajal väärtust.</p>`;
    const c=corr(SX,SY,{}),cp=corr(SX,SY,{partial:true}),narrow=W<640,H=narrow?330:440,L=narrow?50:64,R=16,T=16,B=48;
    const fx=v=>(LX||LNK(SX))?Math.log10(v):v,fy=v=>LY?Math.log10(v):v,xs=P.map(p=>fx(p.x)),ys=P.map(p=>fy(p.y));
    let x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);const px=(x1-x0)*0.05||1,py=(y1-y0)*0.07||1;x0-=px;x1+=px;y0-=py;y1+=py;
    const X=v=>L+(v-x0)/(x1-x0)*(W-L-R),Y=v=>T+(1-(v-y0)/(y1-y0))*(H-T-B);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Hajuvusdiagramm: ${e(vname(SX))} ja ${e(vname(SY))}, ${P.length} omavalitsust">`;
    const lt=(LX||LNK(SX)),tkx=lt?niceT(x0,x1,5).filter(v=>Math.abs(v-Math.round(v))<1e-9||x1-x0<1.5):niceT(x0,x1,narrow?4:6),tky=LY?niceT(y0,y1,5):niceT(y0,y1,5);
    const fmtT=(k,v,isL)=>isL?nf(Math.pow(10,v),Math.pow(10,v)<10?1:0):fmtV(k,v);
    tky.forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.line}" stroke-width="1"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end" class="t-ax">${fmtT(SY,v,LY)}</text>`;});
    tkx.forEach(v=>{s+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${H-B}" stroke="${C.line}" stroke-width="1" stroke-opacity=".6"/><text x="${X(v)}" y="${H-B+16}" text-anchor="middle" class="t-ax">${fmtT(SX,v,lt)}</text>`;});
    s+=`<text x="${(L+W-R)/2}" y="${H-8}" text-anchor="middle" class="t-ax" style="fill:${C.mut}">${e(VK[SX].n)}${TOT&&MONEY(SX)?" (kogusumma)":""}, ${e(TOT&&MONEY(SX)?"€":VK[SX].u)}${lt?" · log-skaala":""}</text>`;
    s+=`<text transform="translate(12,${(T+H-B)/2}) rotate(-90)" text-anchor="middle" class="t-ax" style="fill:${C.mut}">${e(VK[SY].n)}${TOT&&MONEY(SY)?" (kogusumma)":""}, ${e(TOT&&MONEY(SY)?"€":VK[SY].u)}${LY?" · log":""}</text>`;
    /* OLS joon kuvataval skaalal + keskmise 95% vahemik */
    const n=xs.length,mx=mean(xs),my=mean(ys);let sxx=0,sxy=0;xs.forEach((v,j)=>{sxx+=(v-mx)**2;sxy+=(v-mx)*(ys[j]-my);});const b=sxy/sxx,a=my-b*mx,s2=xs.reduce((t,v,j)=>t+(ys[j]-a-b*v)**2,0)/(n-2),tc=tcrit(n-2);
    const g=[];for(let k=0;k<=40;k++){const v=x0+px+(x1-x0-2*px)*k/40,yh=a+b*v,w=tc*Math.sqrt(s2*(1/n+(v-mx)**2/sxx));g.push([v,yh,w]);}
    s+=`<path d="M${g.map(q=>`${X(q[0]).toFixed(1)},${Y(q[1]+q[2]).toFixed(1)}`).join("L")}L${g.slice().reverse().map(q=>`${X(q[0]).toFixed(1)},${Y(q[1]-q[2]).toFixed(1)}`).join("L")}Z" fill="${C.ink}" fill-opacity=".07" stroke="${C.ink}" stroke-opacity=".25" stroke-dasharray="3 3"/>`;
    s+=`<line x1="${X(g[0][0])}" y1="${Y(g[0][1])}" x2="${X(g[40][0])}" y2="${Y(g[40][1])}" stroke="${C.ink}" stroke-opacity=".7" stroke-width="1.6"/>`;
    const OX=outl(xs),OY=outl(ys),ord=P.map((p,j)=>j).sort((p,q)=>(RI.includes(P[p].i)?1:0)-(RI.includes(P[q].i)?1:0));
    const lab=[];ord.forEach(j=>{const p=P[j],cx=X(xs[j]),cy=Y(ys[j]),rap=RI.includes(p.i),hj=HARJU[p.i],ol=OX[j]||OY[j];
      const tip=tipHTML(KOV[p.i],[[VK[SX].n,fmtV(SX,p.x)+" "+(TOT&&MONEY(SX)?"€":VK[SX].u)],[VK[SY].n,fmtV(SY,p.y)+" "+(TOT&&MONEY(SY)?"€":VK[SY].u)],["maakond",CTY[p.i]],["joone ootus",fmtT(SY,a+b*xs[j],LY)]],ol?"erind vähemalt ühel teljel":"");
      if(rap){s+=`<circle cx="${cx}" cy="${cy}" r="7" fill="${VC[RVK[p.i]]}" stroke="${C.bg}" stroke-width="2"${tipAttr(tip)}/>`;lab.push({x:cx,y:cy,t:SHN(p.i),c:VC[RVK[p.i]],strong:1});}
      else if(hj&&HM)s+=`<rect x="${cx-3.6}" y="${cy-3.6}" width="7.2" height="7.2" fill="${C.mut}" fill-opacity=".55" stroke="${C.bg}" stroke-width="1"${tipAttr(tip)}/>`;
      else s+=`<circle cx="${cx}" cy="${cy}" r="3.8" fill="${C.dim}" fill-opacity=".6" stroke="${C.bg}" stroke-width="1"${tipAttr(tip)}/>`;
      if(ol&&!rap){s+=`<circle cx="${cx}" cy="${cy}" r="7.5" fill="none" stroke="${C.warn}" stroke-width="1" stroke-dasharray="2 2" pointer-events="none"/>`;lab.push({x:cx,y:cy,t:SHN(p.i),c:C.mut});}
      else if(KOV[p.i]==="Tallinn")lab.push({x:cx,y:cy,t:"Tallinn",c:C.mut});});
    lab.forEach(l=>{const left=l.x>W-90;s+=`<text x="${l.x+(left?-10:10)}" y="${l.y+4}" text-anchor="${left?"end":"start"}" style="font:${l.strong?700:500} ${l.strong?12.5:10.5}px var(--f-body);fill:${l.strong?C.ink:C.mut};paint-order:stroke;stroke:${C.bg};stroke-width:3px">${e(l.t)}</text>`;});
    return s+`</svg>`;}
  function scatterStats(){const c=corr(SX,SY,{}),cp=corr(SX,SY,{partial:true});if(!c||!c.ok)return `<p class="k9note">Liiga vähe vaatlusi (n &lt; 10).</p>`;
    const Pd=scatterData()||[],fxd=v=>(LX||LNK(SX))?Math.log10(v):v,fyd=v=>LY?Math.log10(v):v,scaled=TOT&&(MONEY(SX)||MONEY(SY))||LX||LY,forcedP=METH==="pearson"&&(c.ol[0].some(Boolean)||c.ol[1].some(Boolean));
    const inc0=c.lo<=0&&c.hi>=0,drop=cp&&cp.ok&&cp.ncols?Math.abs(cp.r)<Math.abs(c.r)*0.5||Math.sign(cp.r)!==Math.sign(c.r):false,st=isStruct(SX,SY);
    const dir=c.r>0?"Mida suurem on „"+VK[SX].n.toLowerCase()+"”, seda suurem on üldjuhul ka „"+VK[SY].n.toLowerCase()+"”.":"Mida suurem on „"+VK[SX].n.toLowerCase()+"”, seda väiksem on üldjuhul „"+VK[SY].n.toLowerCase()+"”.";
    /* valla asend joonisel kuvatud joone suhtes (kuvatav skaala) */
    const DX=Pd.map(p=>fxd(p.x)),DY=Pd.map(p=>fyd(p.y)),rap=RI.map(i=>{const j=Pd.findIndex(p=>p.i===i);return j<0?null:{i,rx:DX[j],ry:DY[j]};}).filter(Boolean);
    const n=DX.length,mx=mean(DX),my=mean(DY);let sxx=0,sxy=0;DX.forEach((v,j)=>{sxx+=(v-mx)**2;sxy+=(v-mx)*(DY[j]-my);});const b=sxy/sxx,a=my-b*mx,sd=Math.sqrt(DY.reduce((t,v,j)=>t+(v-a-b*DX[j])**2,0)/(n-2));
    const pos=rap.map(o=>{const rr=(o.ry-(a+b*o.rx))/sd;return `<span style="color:${VC[RVK[o.i]]}">${e(SHN(o.i))}</span> ${Math.abs(rr)<0.5?"on joone lähedal":rr>0?`on joonest kõrgemal (${nf(rr,1)} jääkhälvet)`:`on joonest madalamal (${nf(rr,1)} jääkhälvet)`}`;}).join("; ");
    const yrs=`${VK[SX].n}: ${yr(SX,SNAP)}; ${VK[SY].n}: ${yr(SY,SNAP)}`;
    return `<div class="k9ek-stat">
      <div><span class="k9lbl">${MN[c.m]} ${RS(c.m)}</span><b>${sg(c.r,2)}</b><small>${e(c.why)}</small></div>
      <div><span class="k9lbl">95% usaldusvahemik</span><b>${sg(c.lo,2)} … ${sg(c.hi,2)}</b><small>${inc0?"hõlmab nulli → seos on ebakindel":"ei hõlma nulli"}</small></div>
      <div><span class="k9lbl">Vaatlusi</span><b>${c.n}</b><small>p ${peq(c.p)} · ${e(GRPS[G].n.toLowerCase())}</small></div>
      <div><span class="k9lbl">Osakorrelatsioon</span><b>${cp&&cp.ok&&cp.ncols?sg(cp.r,2):"–"}</b><small>${cp&&cp.ncols?e(cp.cn.join(" ja "))+" arvestatud":"ei arvutata"}</small></div></div>
      <div class="k9ek-interp"><p>${kindB("d")} <b>Mida näitab:</b> ${Math.abs(c.r)<0.1?"seost praktiliselt ei ole.":e(strength(c.r))+(c.r>=0?" positiivne":" negatiivne")+" seos."} ${Math.abs(c.r)>=0.1?e(dir):"Ühe näitaja järgi ei saa teist ennustada."}</p>
      <p><b>Kui kindel:</b> ${inc0?"usaldusvahemik hõlmab nulli, seega võib seos olla juhuslik.":c.n<30?"vaatlusi on vähe, vahemik on lai.":"juhus on ebatõenäoline seletus."} ${drop&&Math.abs(c.r)>=0.1&&!inc0?`<b>Suur osa seosest kaob, kui ${e(cp.cn.join(" ja "))} arvestada</b> — need on tõenäolised ühised taustategurid.`:cp&&cp.ncols&&!inc0&&Math.abs(c.r)>=0.1?`Seos püsib ka siis, kui ${e(cp.cn.join(" ja "))} arvestada.`:""} ${st?"Näitajatel on ühine komponent, seega on osa seosest definitsiooniline.":""} Uurides mitut paari järjest, kasvab juhuslike leidude tõenäosus — usalda pigem maatriksis korrektsiooni läbinud seoseid.</p>
      <p><b>Raplamaa vallad:</b> ${pos||"–"}.</p>${scaled?`<p class="k9ek-yrs">Kordajad on arvutatud algsel skaalal (elaniku kohta, ilma logaritmita); Spearmani kordaja logaritmist ei sõltu. Valdade asend on kirjeldatud joonisel kuvatud joone suhtes.</p>`:""}${forcedP?`<p class="k9ek-warn">Valisid Pearsoni, kuigi andmetes on erindeid — üksikud omavalitsused võivad kordajat tugevalt mõjutada. Võrdle Spearmaniga.</p>`:""}<p class="k9ek-yrs">Aastad: ${e(yrs)}.</p></div>`;}
  function secScatter(W){const opt=VARS.filter(v=>avail(v.k)).map(v=>[v.k,v.n]),opts=v=>opt;
    const mon=MONEY(SX)||MONEY(SY),canLX=!LNK(SX)&&(vals(SX,SNAP)||[]).every(x=>x==null||x>0),canLY=(vals(SY,SNAP)||[]).every(x=>x==null||x>0);
    return `<div class="k9ek-row">${sel("data-ekx",opt,SX,"X-telg")}${sel("data-eky",opt,SY,"Y-telg")}<button type="button" class="k9btn ghost sm" data-ekswap>⇄ Vaheta teljed</button>
      <label class="k9ek-ck"><input type="checkbox" data-eklx${LX?" checked":""}${canLX?"":" disabled"}> X log-skaalal</label><label class="k9ek-ck"><input type="checkbox" data-ekly${LY?" checked":""}${canLY?"":" disabled"}> Y log-skaalal</label>
      <label class="k9ek-ck"><input type="checkbox" data-ektot${TOT?" checked":""}${mon?"":" disabled"}> rahaline näitaja kogusummana</label><label class="k9ek-ck"><input type="checkbox" data-ekhm${HM?" checked":""}> Harjumaa omavalitsused ruuduga</label></div>`+
      fig({kick:`Hajuvusdiagramm · ${GN[G]} omavalitsust`,title:`${e(VK[SY].n)} ja ${e(VK[SX].n).toLowerCase()}`,body:scatter(W),
        legend:RI.map(i=>lg.sq(VC[RVK[i]],SHN(i))).concat([`<span><svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="3.8" fill="${C.dim}"/></svg>muu omavalitsus</span>`,HM?`<span><svg width="14" height="14" aria-hidden="true"><rect x="3.4" y="3.4" width="7.2" height="7.2" fill="${C.mut}" fill-opacity=".6"/></svg>Harjumaa</span>`:"",`<span><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="${C.warn}" stroke-dasharray="2 2"/></svg>erind</span>`,lg.txt("joon = lineaarne trend, hele ala = keskmise 95% vahemik")]).filter(Boolean),
        method:`Trendijoon on vähimruutude sirge kuvataval skaalal (log-skaala valikul logaritmitud väärtustel); hele ala on joone (keskmise) 95% usaldusvahemik, mitte üksiku omavalitsuse vahemik. Korrelatsioonikordaja meetod valitakse automaatselt (vt maatriks). ${TOT&&mon?"Kogusumma = väärtus elaniku kohta × rahvaarv; kogusummad sõltuvad peamiselt omavalitsuse suurusest.":""}`,
        src:`${srcL([...new Set([...VK[SX].src,...VK[SY].src])])}`})+scatterStats();}
  /* ---------- 4. REGRESSIOON JA STSENAARIUM ---------- */
  const MODELS={
    M1:{n:"Rahvaarvu muutus 2019–2025",y:{k:"popChg"},x:[{k:"sh65",s:"start"},{k:"inc",s:"start",ln:1},{k:"reg",s:"start"},{d:"harju"},{k:"pop",s:"start",ln:1}],g:"all",lag:1,
      why:"Selgitavad tegurid on mõõdetud perioodi alguses või esimesel aastal (65+ osakaal ja rahvaarv 1.1.2019; tulu ja registreeritud töötus 2019. aasta jooksul), seega eelnevad suuremale osale tulemusest. 65+ osakaal kirjeldab vanusstruktuuri inertsi, tööga seotud tulu ja registreeritud töötus majanduslikku olukorda. Harjumaa tunnus ja rahvaarv on segavad tegurid: Tallinna lähedus ja suurus mõjutavad nii majandust kui ka rännet."},
    M4:{n:"Rändesaldo 2019–2024",y:{k:"netMig"},x:[{k:"inc",s:"start",ln:1},{k:"reg",s:"start"},{k:"sh017",s:"start"},{d:"harju"},{k:"pop",s:"start",ln:1}],g:"all",lag:1,
      why:"Rände kohta on hinnatud, kas algseisu sissetulek, töötus ja laste osakaal (pered) on seotud järgnevate aastate rändega, kui Harjumaa ja suurus on arvestatud. Tegurid on mõõdetud perioodi alguses või esimesel aastal (laste osakaal ja rahvaarv 1.1.2019; tulu ja töötus 2019. aasta jooksul), seega kattuvad tulemusega ainult esimese aasta ulatuses."},
    M2:{n:"Tulumaks elaniku kohta 2025",y:{k:"tm",ln:1},x:[{k:"inc",s:"end",ln:1},{k:"earn",s:"end"},{k:"sh65",s:"end"}],g:"noIsl",lag:0,
      why:"Kirjeldav lahutus: tulumaksu laekumine elaniku kohta sõltub definitsiooni järgi sellest, kui paljud teenivad ja kui palju. Tegurid on samaaegsed, seega see ei ole ennustusmudel. Väikesaared on välja jäetud, sest neil on väga väike elanike arv ja ebatavaline maksulaekumine elaniku kohta."},
    M3:{n:"Põhitegevuse kulud elaniku kohta 2025",y:{k:"kulud",ln:1},x:[{k:"pop",s:"end",ln:1},{k:"sh65",s:"end"},{k:"sh017",s:"end"},{d:"linn"},{d:"harju"}],g:"noIsl",lag:0,
      why:"Kas suurematel omavalitsustel on elaniku kohta väiksemad kulud (mastaabisääst), kui vanusstruktuur, linnalisus ja Harjumaa on arvestatud. Samaaegne kirjeldav mudel. Väikesaared on välja jäetud, sest nende kulud elaniku kohta on mitu korda suuremad ja moonutaksid sirget."},
    own:{n:"Oma mudel",own:1,lag:0,why:"Sinu valitud tegurid. Kontrolli, et selgitavaid tegureid ei oleks liiga palju (n/k), et need ei oleks omavahel tugevalt seotud (VIF) ja et need ei oleks tulemuse osa (definitsiooniline seos)."}};
  const dname=d=>d==="harju"?"Harjumaa omavalitsus (0/1)":"Linn (0/1)";
  const xlab=x=>x.d?dname(x.d):`${x.ln?"log ":""}${VK[x.k].n} (${yr(x.k,x.s)})`;
  function modelSpec(){const M=MODELS[MODEL];if(!M.own)return M;const y={k:OWNY},xs=OWNX.filter(k=>k!==OWNY).slice(0,5).map(k=>k==="harju"||k==="linn"?{d:k}:{k,s:"end",ln:LNK(k)?1:0});
    return {...M,y,x:xs,g:OWNG};}
  function fitModel(M){const yv=vals(M.y.k,"end"),cols=M.x.map(x=>x.d?(x.d==="harju"?HARJU:LINN):vals(x.k,x.s||"end"));if(!yv||cols.some(c=>!c))return null;
    const idx=[];for(let i=0;i<N;i++){if(!GRPS[M.g||"all"].f(i))continue;if(yv[i]==null||(M.y.ln&&yv[i]<=0))continue;if(M.x.some((x,j)=>cols[j][i]==null||(x.ln&&cols[j][i]<=0)))continue;idx.push(i);}
    const tr=(x,v)=>x.ln?Math.log(v):v,Y=idx.map(i=>M.y.ln?Math.log(yv[i]):yv[i]),X=idx.map(i=>[1,...M.x.map((x,j)=>tr(x,cols[j][i]))]);
    if(idx.length<M.x.length+5)return {err:"Liiga vähe vaatlusi selle mudeli jaoks."};
    const cst=M.x.filter((x,j)=>{const c=X.map(r=>r[j+1]);return Math.max(...c)-Math.min(...c)<1e-12;});if(cst.length)return {err:`${cst.map(xlab).join(", ")} on selles võrdlusrühmas kõigil omavalitsustel sama väärtusega, seega selle mõju ei saa hinnata. Vali teine rühm või jäta tegur välja.`};
    const f=ols(Y,X);if(!f)return {err:"Mudelit ei saa hinnata: tegurid on omavahel täielikult seotud (kollineaarsus)."};
    const k=M.x.length,vif=M.x.map((_,j)=>{if(k<2)return 1;const yj=X.map(r=>r[j+1]),Xo=X.map(r=>[1,...r.slice(1).filter((_,q)=>q!==j)]),g=ols(yj,Xo,{light:true});if(!g)return Infinity;const m=mean(yj),sst=yj.reduce((s,v)=>s+(v-m)**2,0),sse=g.res.reduce((s,v)=>s+v*v,0);return sst>0?1/Math.max(1e-9,sse/sst):Infinity;});
    const loo=f.b.map(()=>[Infinity,-Infinity]);for(let o=0;o<idx.length;o++){const g=ols(Y.filter((_,i)=>i!==o),X.filter((_,i)=>i!==o),{light:true});if(g)g.b.forEach((v,j)=>{loo[j][0]=Math.min(loo[j][0],v);loo[j][1]=Math.max(loo[j][1],v);});}
    const sdY=Math.sqrt(Y.reduce((s,v)=>s+(v-mean(Y))**2,0)/(Y.length-1)),beta=M.x.map((_,j)=>{const c=X.map(r=>r[j+1]),m=mean(c),sd=Math.sqrt(c.reduce((s,v)=>s+(v-m)**2,0)/(c.length-1));return f.b[j+1]*sd/sdY;});
    const rng=M.x.map((_,j)=>{const c=X.map(r=>r[j+1]);return [Math.min(...c),Math.max(...c)];});
    return {...f,idx,Y,X,vif,loo,beta,rng,cols,yv,tc:tcrit(f.df)};}
  function predict(F,x0){const k=x0.length;let yh=0;for(let a=0;a<k;a++)yh+=F.b[a]*x0[a];let q=0;for(let a=0;a<k;a++)for(let c=0;c<k;c++)q+=x0[a]*F.XI[a][c]*x0[c];const w=F.tc*Math.sqrt(F.s2*(1+q));return [yh,yh-w,yh+w];}
  function regTab(M,F){const names=["Vabaliige",...M.x.map(xlab)];
    return table(["Tegur","Kordaja","Standardviga (HC3)","95% vahemik","p","Standardiseeritud β","VIF","Vahemik, kui 1 omavalitsus välja jätta"],names.map((nm,j)=>{const b=F.b[j],se=F.se[j],lo=b-F.tc*se,hi=b+F.tc*se,lf=F.loo[j],flip=lf[0]<0&&lf[1]>0;
      return [`${j?"":"<i>"}${e(nm)}${j?"":"</i>"}`,nf(b,Math.abs(b)<1?3:2),nf(se,3),`${nf(lo,3)} … ${nf(hi,3)}`,pf(F.p[j]),j?nf(F.beta[j-1],2):"–",j?`${nf(F.vif[j-1],1)}${F.vif[j-1]>5?" ⚠":""}`:"–",`${nf(lf[0],3)} … ${nf(lf[1],3)}${j&&flip?" · märk muutub":""}`];}),{textCols:[7]});}
  function regResid(M,F,W){const yk=M.y.k,rows=RI.filter(i=>F.idx.includes(i)).map(i=>{const j=F.idx.indexOf(i),x0=F.X[j],[yh,lo,hi]=predict(F,x0),bt=v=>M.y.ln?Math.exp(v):v;return {i,y:bt(F.Y[j]),yh:bt(yh),lo:bt(lo),hi:bt(hi)};});
    if(!rows.length)return `<p class="k9note">Raplamaa vallad ei ole selle mudeli valimis.</p>`;
    const all=rows.flatMap(r=>[r.y,r.lo,r.hi]),lo=Math.min(...all),hi=Math.max(...all),pad=(hi-lo)*0.08||1,L=W<640?84:120,R=20,rh=40,H=rows.length*rh+34,X=v=>L+(v-(lo-pad))/((hi+pad)-(lo-pad))*(W-L-R);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Raplamaa vallad: tegelik väärtus ja mudeli ootus">`;
    niceT(lo-pad,hi+pad,5).forEach(v=>{s+=`<line x1="${X(v)}" x2="${X(v)}" y1="6" y2="${H-24}" stroke="${C.line}"/><text x="${X(v)}" y="${H-8}" text-anchor="middle" class="t-ax">${fmtV(yk,v)}</text>`;});
    rows.forEach((r,j)=>{const y=12+j*rh+rh/2,c=VC[RVK[r.i]];
      s+=`<text x="${L-10}" y="${y+4}" text-anchor="end" style="font:700 12.5px var(--f-body);fill:${c}">${e(SHN(r.i))}</text>`;
      s+=`<rect x="${X(r.lo)}" y="${y-6}" width="${Math.max(1,X(r.hi)-X(r.lo))}" height="12" fill="url(#h-ink)" stroke="${C.ink}" stroke-opacity=".35"${tipAttr(tipHTML(KOV[r.i],[["mudeli ootus",fmtV(yk,r.yh)],["95% ennustusvahemik",`${fmtV(yk,r.lo)} … ${fmtV(yk,r.hi)}`],["tegelik",fmtV(yk,r.y)]]))}/>`;
      s+=`<line x1="${X(r.yh)}" x2="${X(r.yh)}" y1="${y-9}" y2="${y+9}" stroke="${C.ink}" stroke-width="2"/><circle cx="${X(r.y)}" cy="${y}" r="6.5" fill="${c}" stroke="${C.bg}" stroke-width="2"/>`;});
    return s+`</svg>`;}
  function scen(M,F){const i=F.idx.includes(SCV)?SCV:RI.find(r=>F.idx.includes(r));if(i==null)return `<p class="k9note">Raplamaa vallad ei ole valimis, stsenaariumit ei arvutata.</p>`;const j=F.idx.indexOf(i);
    const xs=M.x.map((x,q)=>{const key=MODEL+"|"+(x.d||x.k)+"|"+(x.s||"end"),act=F.cols[q][i],v=SCX[key]!=null?SCX[key]:act;return {x,q,act,v,key};});
    const x0=[1,...xs.map(o=>o.x.ln?Math.log(o.v):o.v)],[yh,lo,hi]=predict(F,x0),bt=v=>M.y.ln?Math.exp(v):v,out=xs.filter(o=>{const t=o.x.ln?Math.log(o.v):o.v;return t<F.rng[o.q][0]-1e-9||t>F.rng[o.q][1]+1e-9;});
    const base=predict(F,F.X[j]),yk=M.y.k,u=VK[yk].u;
    const inp=xs.map(o=>{if(o.x.d)return `<tr><td>${e(xlab(o.x))}</td><td class="n">${o.act}</td><td class="n" colspan="2"><small>tunnus, ei muudeta</small></td></tr>`;
      const rl=o.x.ln?F.rng[o.q].map(Math.exp):F.rng[o.q],rr=F.rng[o.q],st=(rr[1]-rr[0])/200,mn=rr[0]-(rr[1]-rr[0])*0.25,mx=rr[1]+(rr[1]-rr[0])*0.25,cur=o.x.ln?Math.log(o.v):o.v;
      return `<tr><td>${e(xlab(o.x))}</td><td class="n">${fmtV(o.x.k,o.act)}</td><td><input type="range" data-ekscx="${o.key}" data-ln="${o.x.ln?1:0}" min="${mn}" max="${mx}" step="${st}" value="${cur}" aria-label="${e(xlab(o.x))}${o.x.ln?" (logaritmiline liugur)":""}"></td><td class="n"><b>${fmtV(o.x.k,o.v)}</b>${(o.x.ln?Math.log(o.v):o.v)<F.rng[o.q][0]||(o.x.ln?Math.log(o.v):o.v)>F.rng[o.q][1]?' <span class="k9ek-warnt">väljaspool andmeid</span>':""}<br><small>andmetes ${fmtV(o.x.k,rl[0])} … ${fmtV(o.x.k,rl[1])}</small></td></tr>`;}).join("");
    return `<div class="k9ek-scen"><div class="k9ek-row">${sel("data-ekscv",RI.filter(r=>F.idx.includes(r)).map(r=>[r,KOV[r]]),i,"Vald")}<button type="button" class="k9btn ghost sm" data-ekscr>Taasta valla tegelikud väärtused</button></div>
      <div class="k9ek-grid3"><div class="k9ek-card"><h4>1 · Kasutaja eeldused</h4><div class="k9tbl"><table><thead><tr><th>Tegur</th><th class="n">Tegelik</th><th>Eeldus</th><th class="n">Väärtus</th></tr></thead><tbody>${inp}</tbody></table></div></div>
      <div class="k9ek-card"><h4>2 · Mudeli hinnang</h4><p class="k9ek-big">${fmtV(yk,bt(yh))} <small>${e(u)}</small></p><p>Mudeli ootus valla tegelike väärtustega: ${fmtV(yk,bt(base[0]))} ${e(u)}. Tegelik: ${fmtV(yk,M.y.ln?Math.exp(F.Y[j]):F.Y[j])} ${e(u)}.</p></div>
      <div class="k9ek-card"><h4>3 · Määramatus</h4><p class="k9ek-big">${fmtV(yk,bt(lo))} … ${fmtV(yk,bt(hi))}</p><p>95% ennustusvahemik ühe omavalitsuse jaoks (sisaldab mudelist seletamata hajuvust).${M.y.ln?" Logaritmitud tulemus on teisendatud tagasi; see on mediaani hinnang.":""}</p></div></div>
      ${out.length?`<p class="k9ek-warn" role="alert"><b>Hoiatus:</b> ${out.map(o=>e(xlab(o.x))).join(", ")} on väljaspool andmetes esinenud vahemikku. Mudel ei ole selles piirkonnas kontrollitud ja hinnang on ekstrapolatsioon.</p>`:""}
      <p class="k9ek-legal">${kindB("m")} See on mudeli aritmeetika: „kui valla näitajad oleksid sellised, siis sarnastes omavalitsustes oli tulemus keskmiselt selline”. See ei ole prognoos ega tõenda, et teguri muutmine muudaks tulemust. ${M.lag?"":"Mudel on samaaegne, seega põhjuse ja tagajärje järjekorda ei saa eristada."}</p></div>`;}
  function secReg(W){const M=modelSpec(),F=fitModel(M);
    const own=MODEL==="own"?`<div class="k9ek-row">${sel("data-ekoy",VARS.filter(v=>v.k!=="pop").map(v=>[v.k,v.n]),OWNY,"Tulemus (Y)")}${sel("data-ekog",Object.keys(GRPS).map(g=>[g,GRPS[g].n]),OWNG,"Valim")}</div>
      <div class="k9ek-chips" role="group" aria-label="Selgitavad tegurid (kuni 5)"><div class="k9ek-chg"><span class="k9lbl">Selgitavad tegurid (kuni 5, lõppseis)</span>${[...VARS.map(v=>[v.k,v.k==="pop"?"Rahvaarv (log)":v.n]),["harju","Harjumaa (0/1)"],["linn","Linn (0/1)"]].filter(([k])=>k!==OWNY).map(([k,t])=>`<button type="button" data-ekox="${k}" aria-pressed="${OWNX.includes(k)}"${!OWNX.includes(k)&&OWNX.length>=5?" disabled":""}>${e(t)}</button>`).join("")}</div></div>`:"";
    const head=`<div class="k9ek-row">${seg("data-ekmod",Object.keys(MODELS).map(k=>[k,MODELS[k].n]),MODEL,"Mudel")}</div>${own}`;
    if(!F||F.err)return head+`<p class="k9ek-warn">${e(F?F.err:"Mudelit ei saa valitud seisuga hinnata.")}</p>`;
    const k=M.x.length,ratio=F.n/k,mv=Math.max(...F.vif),warn=[];if(ratio<10)warn.push(`vaatlusi tegurite kohta ainult ${nf(ratio,0)} (soovitus ≥ 10)`);if(mv>5)warn.push(`tegurid on omavahel tugevalt seotud (suurim VIF ${nf(mv,1)}): üksikud kordajad on ebastabiilsed`);
    M.x.forEach(x=>{if(x.k&&isStruct(x.k,M.y.k))warn.push(`„${VK[x.k].n}” ja tulemus on osaliselt sama komponendiga`);});
    const yl=`${M.y.ln?"log ":""}${VK[M.y.k].n} (${yr(M.y.k,"end")})`;
    return head+`<div class="k9ek-card"><p><b>Miks need tegurid:</b> ${e(M.why)}</p></div>`+
      fig({kick:`Lineaarne regressioon · ${F.n} omavalitsust (${e(GRPS[M.g||"all"].n.toLowerCase())})`,title:`${e(yl)}`,
        read:`R² = ${nf(F.r2,2)} (korrigeeritud ${nf(F.ar2,2)}): mudel kirjeldab ${nf(F.r2*100,0)}% tulemuse erinevustest omavalitsuste vahel. ${M.lag?"Tegurid on mõõdetud perioodi alguses või esimesel aastal (ajaline viide; esimene aasta kattub).":"Tegurid ja tulemus on samast ajast — kirjeldav seos."}`,
        body:`<div class="k9ek-wide">${regTab(M,F)}</div>${warn.length?`<p class="k9ek-warn"><b>Ettevaatust:</b> ${e(warn.join("; "))}.</p>`:""}`,
        method:`Vähimruutude meetod (OLS), standardvead heteroskedastilisusele vastupidavad (HC3), 95% vahemikud ja p-väärtused t-jaotusest (df = ${F.df}). VIF = kui palju teguri kordaja dispersioon kasvab teiste teguritega seotuse tõttu (üle 5 = probleem). Viimane veerg: kordaja väikseim ja suurim väärtus, kui mudel hinnata ${F.n} korda, iga kord ühe omavalitsuse võrra väiksemana — „märk muutub” tähendab, et tulemus sõltub üksikust omavalitsusest. Tõlgendus: logaritmitud tegur ja logaritmimata tulemus — 1% suurem tegur ≈ kordaja/100 ühikut tulemust; mõlemad logaritmitud — 1% suurem tegur ≈ kordaja % muutust tulemuses; logaritmitud tulemus ja logaritmimata tegur — ühe ühiku võrra suurem tegur ≈ 100 × kordaja % (täpsemalt (e^kordaja − 1) × 100%); 0/1-tunnus logaritmitud tulemusel ≈ (e^kordaja − 1) × 100% erinevus. Ennustusvahemik (stsenaarium ja valdade joonis) kasutab klassikalist jääkdispersiooni, mis eeldab ühtlast hajuvust; tabeli standardvead (HC3) seda ei eelda. Ruumilist autokorrelatsiooni ei ole modelleeritud.`,
        src:`Andmed: vt „Andmete kontroll”. Kontrollitud Pythonis (statsmodels 0.15, HC3) — kordajad kattuvad.`})+
      fig({kick:"Raplamaa vallad mudelis",title:"Tegelik väärtus võrreldes sarnaste omavalitsuste põhjal oodatuga",read:"Täpp = tegelik väärtus, kriips = mudeli ootus, viirutatud ala = 95% ennustusvahemik. Täpp vahemikus = vald ei erine oluliselt sellest, mida tema näitajate põhjal võiks oodata.",
        legend:[lg.unc("ink","95% ennustusvahemik"),lg.txt("kriips = mudeli ootus"),...RI.map(i=>lg.sq(VC[RVK[i]],SHN(i)))],body:regResid(M,F,W)})+
      fig({kick:"Stsenaarium",title:"Mis-kui: muuda valla eeldusi",read:"Eeldused, mudeli hinnang ja määramatus on eraldi. Liuguri vahemik ulatub veerandi võrra üle andmetes esinenud vahemiku; sellest väljas annab joonis hoiatuse.",body:scen(M,F)});}
  /* ---------- 5. NELJA VALLA AJAREAD ---------- */
  const TK={Rapla:"Rapla vald",Kohila:"Kohila vald",Marjamaa:"Märjamaa vald",Kehtna:"Kehtna vald",MAAK:"Rapla maakond"};
  const CPIy=y=>E.cpi[String(y)];
  function pser(kind,u,y){const P=POP[u],T=window.TOO_DATA;try{
    if(kind==="pop")return P.tot[String(y)]??null;
    if(kind==="mig"){const mi=P.mi[YI(y)],mo=P.mo[YI(y)],t=P.tot[String(y)];return mi==null||mo==null||!t||y>2025?null:(mi-mo)/t*1000;}
    if(kind==="tm"||kind==="kul"){const v=window.finY?finY(u,kind==="tm"?"n3":"n19",y):null,t=P.tot[String(y)];if(v==null||!t||y>2025)return null;const x=Math.abs(v)/t;return REAL?x*CPIy(2025)/CPIy(y):x;}
    if(kind==="reg"){const r=T.reg[TK[u]]&&T.reg[TK[u]]["Vanuserühmad kokku"],v=r&&r[String(y)],a=ageVec(u,y);if(v==null||!a||y>2025)return null;let w=0;for(let g=3;g<=12;g++)w+=a[g];return v/w*100;}
    if(kind==="inc"){const v=T.inc[TK[u]]&&T.inc[TK[u]][String(y)];return v==null?null:REAL?v*CPIy(2025)/CPIy(y):v;}
  }catch(_){return null;}return null;}
  const PK=[["pop","Rahvaarv 1. jaanuaril","inimest","Statistikaamet (rahvastikuregister)"],["mig","Rändesaldo","‰","Statistikaamet (ränne)"],["tm","Tulumaks elaniku kohta","€","RR300 (rida 3) / rahvaarv"],["kul","Põhitegevuse kulud elaniku kohta","€","RR300 (rida 19) / rahvaarv"],["reg","Registreeritud töötud 15–64-aastaste kohta","%","Töötukassa (TT065) / rahvastik"],["inc","Tööga seotud tulu isiku kohta","€","UA08 (2018–2024)"]];
  function mini(kind,lab,unit,W){const us=["MAAK",...V],ys=[];for(let y=P0;y<=P1;y++)ys.push(y);const ser=us.map(u=>{const a=ys.map(y=>pser(kind,u,y));if(kind==="pop"&&PIDX){const b=a.find(v=>v!=null);return a.map(v=>v==null||!b?null:v/b*100);}return a;});
    const all=ser.flat().filter(v=>v!=null);if(!all.length)return `<div class="k9ek-mini"><h4>${e(lab)}</h4><p class="k9note">Valitud perioodil andmed puuduvad.</p></div>`;
    const w=W,h=170,R=24,T=10,B=22,lo=Math.min(...all),hi=Math.max(...all),pd=(hi-lo)*0.08||1,X=y=>L+(ys.length>1?(y-P0)/(P1-P0):0.5)*(w-L-R),Y=v=>T+(1-(v-(lo-pd))/((hi+pd)-(lo-pd)))*(h-T-B);
    const tks=niceT(lo-pd,hi+pd,3),dg=Math.abs(hi-lo)<10?1:0,L=12+7*Math.max(...tks.map(v=>nf(v,dg).length));let s=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${e(lab)}, ${P0}–${P1}">`;tks.forEach(v=>{s+=`<line x1="${L}" x2="${w-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.line}"/><text x="${L-5}" y="${Y(v)+4}" text-anchor="end" class="t-ax">${nf(v,Math.abs(hi-lo)<10?1:0)}</text>`;});
    [P0,P1].forEach(y=>s+=`<text x="${X(y)}" y="${h-6}" text-anchor="middle" class="t-ax">${y}</text>`);
    ser.forEach((a,j)=>{const u=us[j];let d="",pen=false;a.forEach((v,q)=>{if(v==null){pen=false;return;}d+=(pen?"L":"M")+X(ys[q]).toFixed(1)+","+Y(v).toFixed(1);pen=true;});
      s+=`<path d="${d}" fill="none" stroke="${VC[u]}" stroke-width="${u==="MAAK"?1.4:2}" ${u==="MAAK"?'stroke-dasharray="4 3"':""} stroke-linejoin="round"/>`;
      a.forEach((v,q)=>{if(v!=null)s+=`<circle cx="${X(ys[q])}" cy="${Y(v)}" r="6" fill="transparent"${tipAttr(tipHTML(`${u==="MAAK"?"Rapla maakond":NAME[u]} ${ys[q]}`,[[lab,nf(v,unit==="inimest"&&!PIDX?0:1)+" "+(kind==="pop"&&PIDX?"(algus = 100)":unit)]]))}/>`;});});
    return `<div class="k9ek-mini"><h4>${e(lab)} <small>${kind==="pop"&&PIDX?`indeks, ${P0} = 100`:e(unit)}${(kind==="tm"||kind==="kul"||kind==="inc")?(REAL?" · 2025. a hindades":" · nominaalne"):""}</small></h4>${s}</svg></div>`;}
  function eduTab(){const rows=V.map(u=>{const a=ageVec(u,2026),g=a?0.8*a[0]+0.4*a[1]:null,la=EDU&&EDU.la?EDU.la[u]:null;return [`<span style="color:${VC[u]}">${e(NAME[u])}</span>`,la==null?"puudub":nf(la,0),g==null?"–":nf(g,0),la&&g?nf(la/g*100,0)+"%":"–","puudub","puudub","puudub","puudub"];});
    return table(["Vald","Lapsi lasteaias 2026","1–6-aastaste rühm 2026 (arvestuslik)","Osalus (ligikaudne)","Kohtade arv","Täituvus","Kulu lapse kohta","Juhtimiskulude osakaal"],rows,{textCols:[4,5,6,7]});}
  function secPanel(W){const cw=W<640?W:Math.floor((W-24)/2),ys=[];for(let y=2016;y<=2025;y++)ys.push(y);
    return `<div class="k9ek-row">${sel("data-ekp0",ys.slice(0,-1).map(y=>[y,String(y)]),P0,"Algus")}${sel("data-ekp1",ys.filter(y=>y>P0).map(y=>[y,String(y)]),P1,"Lõpp")}
      ${seg("data-ekreal",[["0","Nominaalne"],["1","Reaalne (2025. a hinnad)"]],REAL?"1":"0","Rahalised näitajad")}${seg("data-ekpidx",[["1","Indeks"],["0","Tase"]],PIDX?"1":"0","Rahvaarv")}</div>
      ${fig({kick:"Nelja valla ajaread · kirjeldav",title:`Raplamaa vallad ${P0}–${P1}`,read:"Igal joonisel on oma telg (sama mõõtühik), maakond katkendjoonega. Joonised on kõrvuti, et näha, kas muutused toimuvad samal ajal — mitte selleks, et arvutada nende vahel korrelatsioone.",
        legend:[...V.map(u=>lg.sq(VC[u],SHORTN[u])),lg.fc(C.ink,"Rapla maakond")],body:`<div class="k9ek-minis">${PK.map(([k,l,u])=>mini(k,l,u,cw)).join("")}</div>`,
        method:`Reaalne väärtus = nominaalne × THI 2025 / THI aasta (Statistikaamet IA002, aastakeskmine). Tulumaks ja kulud: RR300 read 3 ja 19 (2016–2017 eelkäijate summa, vt Andmed ja metoodika), jagatud 1. jaanuari rahvaarvuga. Registreeritud töötud on siin jagatud 15–64-aastastega (viieaastaste vanuserühmade summa); 79 omavalitsuse ristlõikes on nimetaja 18–64-aastased, seega tasemed ei ole otse võrreldavad.`,
        src:PK.map(p=>p[3]).join("; ")})}
      <div class="k9ek-card k9ek-why"><h4>Miks siin p-väärtusi ega regressiooni ei ole</h4><ul class="k9ek-list">
        <li>Vaatlusi on 4 valda × kuni ${P1-P0+1} aastat, aga need ei ole sõltumatud: sama valla järjestikused aastad on tugevalt seotud (autokorrelatsioon) ja kõiki valdu mõjutavad samad üleriigilised muutused (palgatõus, inflatsioon, 2022. aasta sisseränne).</li>
        <li>Kahe ajas kasvava näitaja korrelatsioon on peaaegu alati suur, isegi kui nende vahel seost ei ole (ühine ajatrend). Seetõttu ei arvutata siin korrelatsioonikordajaid ega olulisust.</li>
        <li>Usaldusväärsemaks hindamiseks on vaja kõigi 79 omavalitsuse iga-aastast aegrida (paneelmudel aasta- ja omavalitsuse efektidega) — vt andmevajadus.</li></ul></div>
      ${fig({kick:"Alusharidus · neli valda",title:"Mis on olemas ja mis puudub",read:"Lasteaias käivate laste arv on kanga teenuste plokist. Kohtade arvu, täituvust, kulu lapse kohta ja juhtimiskulude osakaalu ei ole kanga andmetes ühegi valla kohta — neid ei hinnata ega asendata näidisandmetega.",body:eduTab(),
        method:"Osalus = lapsi lasteaias / arvestuslik 1–6-aastaste rühm (0,8 × 0–4-aastased + 0,4 × 5–9-aastased, sama valem mis teenuste plokis). See on ligikaudne, sest lasteaias võib käia ka teise valla lapsi ja vanuserühm on hinnatud viieaastastest rühmadest.",src:"Kanga teenuste plokk (toetusfondi arvestuse lapsed 2026); Statistikaamet (rahvastik)."})}`;}
  /* ---------- 6. TÕLGENDUSED JA ANDMEVAJADUS ---------- */
  /* sg = eeldatav suund; dec = [suund klapib ja seos on kindel, nõrk/ebakindel, vastupidine suund]; otsusteksti valik: kindel + õige suund + ei kao taustategurite arvestamisel + püsib ilma väikesaarteta */
  const QS=[
    {x:"sh65",y:"popChg",s:"start",sg:-1,q:"Kas suurem eakate osakaal 2019. aastal käis kaasas rahvaarvu kahanemisega 2019–2025?",note:"Osaliselt mehaaniline: suurem eakate osakaal tähendab rohkem surmi, mis vähendab rahvaarvu otse.",
      dec:["Vananenud rahvastikuga omavalitsustes on rahvaarv kahanenud; rahvastikuprognoosis ja teenuste planeerimisel tasub vanusstruktuuri arvestada.","Eakate osakaal ja rahvaarvu muutus ei käi selgelt koos; vanusstruktuur üksi ei kirjelda muutust.","Tulemus on ootusega vastupidine; seda tuleb enne kasutamist kontrollida."]},
    {x:"inc",y:"netMig",s:"start",sg:1,q:"Kas suurem tööga seotud tulu 2019. aastal käib kaasas suurema rändesaldoga 2019–2024?",
      dec:["Suurema sissetulekuga omavalitsustesse on rännanud rohkem inimesi; rände eesmärkide juures tasub jälgida ka sissetulekuid. Seos ei näita, et sissetuleku tõus tooks elanikke.","Sissetuleku tase ei kirjelda rännet hästi; rände eesmärkide seadmisel tuleb vaadata muid tegureid (elukeskkond, eluase, ühendused).","Tulemus on ootusega vastupidine; seda tuleb enne kasutamist kontrollida."]},
    {x:"dli",y:"netMig",s:"start",sg:1,q:"Kas noorem vanusstruktuur (suurem tööturusurveindeks) käib kaasas suurema rändesaldoga?",
      dec:["Noorem vanusstruktuur ja positiivne rändesaldo käivad koos; mõlemad võivad tuleneda samast taustast (nt peredele sobiv elukeskkond Tallinna lähedal).","Vanusstruktuuri ja rände vahel selget seost ei ole.","Tulemus on ootusega vastupidine; seda tuleb enne kasutamist kontrollida."]},
    {x:"earn",y:"tm",s:"end",sg:1,q:"Kas suurem tööga seotud tuluga elanike osakaal käib kaasas suurema tulumaksuga elaniku kohta?",note:"Osaliselt definitsiooniline: tulumaks ≈ tulu saajate arv × tulu.",
      dec:["Omavalitsustes, kus suurem osa elanikest teenib tööga seotud tulu, laekub elaniku kohta rohkem tulumaksu. See on kooskõlas kanga tulumaksuprognoosis kasutatava hõive eeldusega, kuid ristlõige ei näita, kui palju muutub ühe omavalitsuse laekumine hõive muutudes.","Hõive osakaal üksi ei kirjelda tulumaksu; olulisem võib olla sissetuleku tase.","Tulemus on ootusega vastupidine; seda tuleb enne kasutamist kontrollida."]},
    {x:"pop",y:"kulud",s:"end",sg:-1,q:"Kas suurematel omavalitsustel on elaniku kohta väiksemad põhitegevuse kulud?",
      dec:["Suurematel omavalitsustel on elaniku kohta väiksemad kulud. See on kooskõlas mastaabisäästuga, kuid ei näita, et ühinemine või koostöö kulusid vähendaks; selleks tuleb võrrelda ka teenuste kvaliteeti ja kättesaadavust.","Suurus üksi ei kirjelda kulusid elaniku kohta, kui väikesaared kõrvale jätta; kulutaseme erinevused tulenevad muust (teenuste valik, vanusstruktuur, hajaasustus).","Tulemus on ootusega vastupidine; seda tuleb enne kasutamist kontrollida."]},
    {x:"inv",y:"popChg",s:"end",sg:1,q:"Kas suuremad investeeringud elaniku kohta käivad kaasas rahvaarvu kasvuga?",note:"Investeeringud on 2025. aasta, rahvaarvu muutus 2019–2025; suund võib olla vastupidine (kasvavad omavalitsused peavad investeerima).",
      dec:["Investeeringud ja rahvaarvu kasv käivad koos, kuid põhjuse suund on ebaselge. Seos ei näita, et investeering tooks elanikke.","Investeeringute ja rahvaarvu muutuse vahel selget seost ei ole — investeeringut ei saa põhjendada eeldatava elanike juurdevooluga.","Tulemus on ootusega vastupidine; seda tuleb enne kasutamist kontrollida."]},
    {x:"ent",y:"reg",s:"end",sg:-1,q:"Kas ettevõtlikumates omavalitsustes on vähem registreeritud töötuid?",
      dec:["Suurema ettevõtete arvuga omavalitsustes on vähem registreeritud töötuid; põhjuse suunda andmed ei näita. Ettevõtluse ja tööhõive eesmärke tasub jälgida koos.","Ettevõtete arv ja töötus ei ole selgelt seotud — ettevõtete arv ei näita töökohtade arvu.","Tulemus on ootusega vastupidine; seda tuleb enne kasutamist kontrollida."]},
    {x:"reg",y:"sots",s:"end",sg:1,q:"Kas suurem töötus käib kaasas suuremate sotsiaaltoetustega elaniku kohta?",
      dec:["Suurema töötusega omavalitsustes on sotsiaaltoetused elaniku kohta suuremad; eelarve riskide hindamisel tasub neid näitajaid jälgida koos.","Sotsiaaltoetuste tase ei sõltu selgelt töötusest; see võib peegeldada omavalitsuse valikuid ja vanusstruktuuri.","Tulemus on ootusega vastupidine; seda tuleb enne kasutamist kontrollida."]},
    {x:"laen",y:"inv",s:"end",sg:1,q:"Kas rohkem laenu võtnud omavalitsused investeerivad elaniku kohta rohkem?",note:"Laenud on 2021–2025 keskmine, investeeringud 2025 — perioodid erinevad.",
      dec:["Laen ja investeeringud käivad koos — ootuspärane, sest laenu võetakse investeeringuteks. Võlakoormuse otsuseid tuleb hinnata koos investeeringute vajadusega.","Laenu ja 2025. aasta investeeringute seos on nõrk; investeeringuid rahastatakse ka toetuste ja põhitegevuse tulemiga ning perioodid ei kattu.","Tulemus on ootusega vastupidine; seda tuleb enne kasutamist kontrollida."]},
    {x:"jobs",y:"wage",s:"end",sg:1,q:"Kas töökohtade rohkus elanike kohta käib kaasas kõrgema keskmise palgaga?",
      dec:["Omavalitsustes, kus on elanike kohta rohkem töökohti, on keskmine palk kõrgem. Andmed ei näita, kas töökohtade lisandumine tõstaks palgataset.","Töökohtade arv ja palgatase ei ole selgelt seotud.","Tulemus on ootusega vastupidine; seda tuleb enne kasutamist kontrollida."]}];
  const ctrlTxt=c=>c&&c.cn&&c.cn.length?c.cn.join(" ja ")+" arvestatud":"";
  function verdict(c,cp,q,g){const sure=q<0.05&&!(c.lo<=0&&c.hi>=0),big=Math.abs(c.r)>=0.1,drop=big&&sure&&cp&&cp.ok&&cp.ncols&&(Math.abs(cp.r)<Math.abs(c.r)*0.5||Math.sign(cp.r)!==Math.sign(c.r));return {sure,big,drop};}
  function secInterp(){const R=QS.map(q=>({q,c:corr(q.x,q.y,{snap:q.s}),cp:corr(q.x,q.y,{snap:q.s,partial:true}),c2:G==="noIsl"?null:corr(q.x,q.y,{snap:q.s,g:"noIsl"})})).filter(o=>o.c&&o.c.ok),qq=bh(R.map(o=>o.c.p)),q2=bh(R.map(o=>o.c2&&o.c2.ok?o.c2.p:1));
    const cards=R.map((o,j)=>{const c=o.c,cp=o.cp,v=verdict(c,cp,qq[j]),sgnOK=Math.sign(c.r)===o.q.sg,robust=!o.c2||(o.c2.ok&&q2[j]<0.05&&Math.sign(o.c2.r)===Math.sign(c.r)&&!(o.c2.lo<=0&&o.c2.hi>=0)),strong=Math.abs(c.r)>=0.3&&v.sure;
      const pick=!strong?1:!sgnOK?2:(v.drop||!robust)?1:0,cls=pick===0?"ok":strong?"warn":"weak";
      const dirW=Math.abs(c.r)<0.1?"":(c.r>=0?" positiivne":" negatiivne");
      return `<article class="k9ek-q ${cls}"><h4>${e(o.q.q)}</h4>
        <p class="k9ek-res"><b>${MN[c.m]} ${RS(c.m)} = ${sg(c.r,2)}</b> (95%: ${sg(c.lo,2)} … ${sg(c.hi,2)}; n = ${c.n}; BH q ${peq(qq[j])}) · osakorrelatsioon ${cp&&cp.ok&&cp.ncols?sg(cp.r,2):"–"}${o.c2&&o.c2.ok?` · ilma väikesaarteta ${sg(o.c2.r,2)}`:""}</p>
        <p><b>Mida näitab:</b> ${Math.abs(c.r)<0.1?"seost praktiliselt ei ole":e(strength(c.r))+dirW+" seos"} omavalitsuste vahel (${e(GRPS[G].n.toLowerCase())}; ${e(VK[o.q.x].n)} ${e(yr(o.q.x,o.q.s))}, ${e(VK[o.q.y].n)} ${e(yr(o.q.y,o.q.s))}).</p>
        <p><b>Kui kindel:</b> ${v.sure?"säilib mitme võrdluse korrektsiooni järel":"ebakindel — võib olla juhuslik"}${v.drop?`; suur osa seosest kaob, kui ${e(ctrlTxt(cp).replace(/ arvestatud$/,""))} arvestada`:cp&&cp.ok&&cp.ncols&&v.sure&&v.big?`; püsib ka siis, kui ${e(ctrlTxt(cp))}`:""}${o.c2&&v.sure&&!robust?"; ei püsi, kui väikesaared (Ruhnu, Vormsi, Kihnu) välja jätta":""}${isStruct(o.q.x,o.q.y)?"; näitajatel on ühine komponent":""}.${o.q.note?` <i>${e(o.q.note)}</i>`:""}</p>
        <p><b>Millist otsust võiks toetada:</b> ${e(o.q.dec[pick])}</p></article>`;}).join("");
    const need=E.need.map(n=>`<li><b>${e(n.n)}</b> — ${e(n.src)}. <small>Milleks: ${e(n.why)}.</small></li>`).join("");
    return `<div class="k9ek-legal"><p>${kindB("d")} ${kindB("m")} ${kindB("c")}</p><p>Küsimused on valitud enne tulemuste vaatamist ja kõik on näidatud, ka nõrgad ja ebakindlad. Kõik arvud arvutatakse samade valemitega kui maatriksis ja muutuvad, kui muudad võrdlusrühma või korrelatsioonimeetodit. Mitme võrdluse korrektsioon (BH) on tehtud nende ${R.length} küsimuse peale.</p></div>
      <div class="k9ek-qs">${cards}</div>
      <div class="k9ek-grid2"><div class="k9ek-card"><h4>Mida need tulemused ei näita</h4><ul class="k9ek-list"><li>Põhjuslikkust: ükski siinne tulemus ei näita, et ühe näitaja muutmine muudaks teist.</li><li>Valla sisemist mehhanismi: ristlõige võrdleb omavalitsusi omavahel, mitte sama omavalitsust ajas.</li><li>Raplamaa valdade tulevikku: mudeli hinnang kirjeldab sarnaste omavalitsuste keskmist minevikus.</li></ul></div>
      <div class="k9ek-card"><h4>Täiendav andmevajadus</h4><ul class="k9ek-list">${need}</ul></div></div>`;}
  /* ---------- vaade ---------- */
  const SECS=[["k9-ek-andmed","Andmete kontroll","Enne seoste arvutamist: kas andmed on olemas, võrreldavad ja ühel territooriumil.",()=>secData()],
    ["k9-ek-maatriks","Korrelatsioonimaatriks","Kõik valitud näitajapaarid korraga, koos seose tugevuse ja kindlusega.",W=>secMatrix(W)],
    ["k9-ek-hajuvus","Hajuvusdiagramm","Kaks näitajat, 79 omavalitsust, Raplamaa vallad esile tõstetud.",W=>secScatter(W)],
    ["k9-ek-regr","Regressioon ja stsenaarium","Mitu tegurit korraga, segavad tegurid arvestatud. Mudelipõhine hinnang, mitte prognoos.",W=>secReg(W)],
    ["k9-ek-vallad","Nelja valla ajaread","Raplamaa vallad ajas — ainult kirjeldav vaade.",W=>secPanel(W)],
    ["k9-ek-tolg","Tõlgendused ja andmevajadus","Kümme eelnevalt valitud küsimust lihtsas keeles.",()=>secInterp()]];
  function draw(el){const host=el.querySelector("[data-ekroot]");if(!host)return;const bw=host.querySelector("[data-ekbar]");if(bw)bw.innerHTML=bar();
    SECS.forEach(([id,,,f])=>{const b=host.querySelector(`[data-eksec="${id}"]`);if(!b)return;const s=b.closest("section");if(s&&s.classList.contains("k9off")&&!b.dataset.dirty0){b.dataset.stale="1";return;}
      const W=K9.wOf(b);try{b.innerHTML=f(W);b.dataset.stale="";}catch(err){console.error(err);b.innerHTML=`<p class="k9err" role="alert">Jaotise joonistamine ebaõnnestus: ${e(err.message)}</p>`;}});}
  let EL=null;const redraw=()=>{if(EL)draw(EL);};
  K9.VIEWS.seosed={
    build(el){EL=el;el.innerHTML=`<div class="k9intro"><div><p class="kick">Seosed · ökonomeetria ja korrelatsioonid</p><h1>Kuidas näitajad omavahel seotud on?</h1></div>
      <p class="lead">Raplamaa vallad 79 Eesti omavalitsuse seas: rahvastik, ränne, vanus, töö, sissetulek, ettevõtlus ning omavalitsuse tulud ja kulud. ${kindB("d")} näitab, mis käib koos; ${kindB("m")} arvestab mitut tegurit korraga; põhjuslikke järeldusi andmed ei võimalda.</p></div>
      <nav class="k9sub"></nav><div data-ekroot><div data-ekbar></div>
      ${SECS.map(([id,t,l])=>sec(id,t,l,`<div data-eksec="${id}"></div>`)).join("")}</div>`;
      el.addEventListener("click",ev=>{const t=ev.target;let b;
        if((b=t.closest("[data-ekg]"))&&b.tagName!=="SELECT")return;
        if(b=t.closest("[data-eks]")){SNAP=b.dataset.eks;return redraw();}
        if(b=t.closest("[data-ekm]")){METH=b.dataset.ekm;return redraw();}
        if(b=t.closest("[data-ekp]")){PART=b.dataset.ekp==="1";return redraw();}
        if(b=t.closest("[data-ekv]")){const k=b.dataset.ekv;if(MSEL.has(k))MSEL.delete(k);else MSEL.add(k);return redraw();}
        if(b=t.closest("[data-ekall]")){const m=b.dataset.ekall;MSEL=new Set(m==="def"?DEFSEL:m==="all"?VARS.map(v=>v.k).filter(k=>k!=="pop"):[]);return redraw();}
        if(b=t.closest("[data-ekallp]")){ALLP=!ALLP;return redraw();}
        if(b=t.closest("[data-ekpair]")){[SX,SY]=b.dataset.ekpair.split("|");LX=LY=TOT=false;K9.go("seosed/k9-ek-hajuvus");return redraw();}
        if(b=t.closest("[data-ekswap]")){[SX,SY]=[SY,SX];[LX,LY]=[LY,LX];return redraw();}
        if(b=t.closest("[data-ekmod]")){MODEL=b.dataset.ekmod;return redraw();}
        if(b=t.closest("[data-ekox]")){const k=b.dataset.ekox;OWNX=OWNX.includes(k)?OWNX.filter(x=>x!==k):[...OWNX,k].slice(0,5);return redraw();}
        if(b=t.closest("[data-ekscr]")){Object.keys(SCX).forEach(k=>{if(k.startsWith(MODEL+"|"))delete SCX[k];});return redraw();}
        if(b=t.closest("[data-ekreal]")){REAL=b.dataset.ekreal==="1";return redraw();}
        if(b=t.closest("[data-ekpidx]")){PIDX=b.dataset.ekpidx==="1";return redraw();}
        if(b=t.closest(".k9sub a")){setTimeout(redraw,0);}});
      el.addEventListener("toggle",ev=>{if(ev.target.matches&&ev.target.matches(".k9ek-chd"))CHOPEN=ev.target.open;},true);
      el.addEventListener("keydown",ev=>{const b=ev.target.closest&&ev.target.closest("[data-ekpair]");if(b&&(ev.key==="Enter"||ev.key===" ")){ev.preventDefault();b.dispatchEvent(new MouseEvent("click",{bubbles:true}));}});
      el.addEventListener("change",ev=>{const t=ev.target;
        if(t.matches("[data-ekg]")){G=t.value;return redraw();}
        if(t.matches("[data-ekx]")){SX=t.value;LX=false;TOT=false;return redraw();}
        if(t.matches("[data-eky]")){SY=t.value;LY=false;TOT=false;return redraw();}
        if(t.matches("[data-eklx]")){LX=t.checked;return redraw();}
        if(t.matches("[data-ekly]")){LY=t.checked;return redraw();}
        if(t.matches("[data-ektot]")){TOT=t.checked;return redraw();}
        if(t.matches("[data-ekhm]")){HM=t.checked;return redraw();}
        if(t.matches("[data-ekoy]")){OWNY=t.value;OWNX=OWNX.filter(k=>k!==OWNY);return redraw();}
        if(t.matches("[data-ekog]")){OWNG=t.value;return redraw();}
        if(t.matches("[data-ekscv]")){SCV=+t.value;Object.keys(SCX).forEach(k=>{if(k.startsWith(MODEL+"|"))delete SCX[k];});return redraw();}
        if(t.matches("[data-ekscx]")){SCX[t.dataset.ekscx]=t.dataset.ln==="1"?Math.exp(+t.value):+t.value;return redraw();}
        if(t.matches("[data-ekp0]")){P0=+t.value;if(P1<=P0)P1=Math.min(2025,P0+1);return redraw();}
        if(t.matches("[data-ekp1]")){P1=+t.value;return redraw();}});
      el.addEventListener("input",ev=>{const t=ev.target;if(t.matches("[data-ekscx]")){SCX[t.dataset.ekscx]=t.dataset.ln==="1"?Math.exp(+t.value):+t.value;const y=scrollY;redraw();scrollTo(0,y);const n=EL.querySelector(`[data-ekscx="${t.dataset.ekscx}"]`);if(n)n.focus();}});},
    update(el){EL=el;draw(el);}};
  /* sakkide vahetamisel joonista ka varem peidetud jaotised (laius on alles siis teada) */
  const _show=K9.show;K9.ECON_CHECK={corr,ols,fitModel,MODELS,bh,vals,rank,pT};
  document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest('#k9 .k9view[data-view="seosed"] .k9sub a, #k9 .k9view[data-view="seosed"] .k9secnext, #k9 .k9view[data-view="seosed"] [data-secall]'))setTimeout(redraw,30);});
  window.addEventListener("hashchange",()=>{if(/^#seosed/.test(location.hash))setTimeout(redraw,30);});
})();
