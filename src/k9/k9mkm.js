/* ---------- MKM TÖÖVALDKONNA UURINGUD: Raplamaa leiud (Rahvastik → Tööhõive) ja allikaregister (Andmed) ---------- */
(function(){
  const D=window.MKM_DATA;if(!D)return;
  const {e}=K9;
  const REL={A:"Raplamaa andmed (kasutatud)",B:"taust (kasutatud)",T:"loetud, Raplamaa andmeid ei ole",X:"välja jäetud (teema väljaspool kangast)",N:"ei töödeldud (mitte-PDF)",G:"avati, tekst loetamatu"};
  const CLS={A:"A · Raplamaa otsene andmepunkt",B:"B · Eesti või teiste piirkondade taust"};
  const ref=i=>{const r=D.reg[i];return `<a href="${e(r.url)}" target="_blank" rel="noopener">[${i}] ${e(r.t)}</a>${r.y?` (${e(r.y)})`:""}`;};
  let FC="all",FT="all",MORE=false;
  const themes=[...new Set(D.findings.map(f=>f.th))];
  function card(f){
    return `<article class="k9mkm-c k9mkm-c${f.cls}" id="mkm-${f.id}"><header><span class="k9mkm-b">${f.id}</span><span class="k9mkm-k">${e(CLS[f.cls])}</span><span class="k9mkm-t">${e(f.th)}</span></header>
      <p class="k9mkm-f">${e(f.f)}</p>
      <dl>
        <dt>Piirkond · sihtrühm · periood</dt><dd>${e(f.ala)}</dd>
        <dt>Tähendus Raplamaale <span class="k9mkm-cc">C · tõlgendus</span></dt><dd>${e(f.mean)}</dd>
        <dt>Seos kanga eesmärgi või probleemiga</dt><dd>${e(f.link)}</dd>
        ${f.act&&f.act!=="—"?`<dt>Võimalik tegevus / mõõdik <span class="k9mkm-cc">C · ettepanek</span></dt><dd>${e(f.act)}</dd>`:""}
        <dt>Allikas</dt><dd>${ref(f.src)}, ${e(f.pg)}</dd>
        <dt>Piirang</dt><dd>${e(f.lim)}</dd>
      </dl></article>`;}
  K9.part("mkmtoo",{
    html:()=>{const nA=D.findings.filter(f=>f.cls==="A").length,nB=D.findings.length-nA,np=D.reg.filter(r=>/\.pdf$/i.test(r.url)&&r.rel!=="G").length,ng=D.reg.filter(r=>r.rel==="G").length;
      return `<div class="k9mkm">
      <h3 class="k9mkm-h">Töövaldkonna uuringute leiud (MKM)</h3>
      <p class="k9mkm-lead">Ministeeriumi lehel on 112 dokumenti. ${np} PDF-i avati ja loeti täistekstina (lisad ja tabelid kaasa arvatud)${ng?`, ${ng} PDF-i tekstikiht oli loetamatu`:""}, ${D.reg.filter(r=>r.rel==="N").length} mitte-PDF faili jäi töötlemata. Raplamaa otseseid andmeid leidus ${D.reg.filter(r=>r.rel==="A").length} uuringus. Siin on ${nA} Raplamaa andmepunkti (A) ja ${nB} taustaleidu (B). <b>A</b> = mõõdetud Raplamaa või selle valla kohta. <b>B</b> = Eesti või muu piirkond, mitte Raplamaa väärtus. <b>C</b> = koostaja tõlgendus ja ettepanek, märgitud eraldi. Eesti keskmist ei esitata Raplamaa näitajana. Avaldamise aasta ja vaatlusperiood on eraldi välja toodud. Loetelu päriti ${e(D.fetched)}; täielik register on peatükis Andmed → Allikad.</p>
      <div class="k9mkm-ctl"><div class="k9seg" role="group" aria-label="Leiu liik"><button type="button" data-mkmc="all" aria-pressed="true">Kõik</button><button type="button" data-mkmc="A" aria-pressed="false">A · Raplamaa</button><button type="button" data-mkmc="B" aria-pressed="false">B · taust</button></div>
        <label class="k9mkm-sel">Teema <select data-mkmt><option value="all">kõik teemad</option>${themes.map(t=>`<option>${e(t)}</option>`).join("")}</select></label></div>
      <div class="k9mkm-list" data-mkmlist aria-live="polite"></div>
      <div class="k9grid2 k9mkm-gaps"><div><h4>Andmelüngad</h4><ul>${D.gaps.map(g=>`<li>${e(g)}</li>`).join("")}</ul></div>
        <div><h4>Vastuolud ja lahendamata küsimused</h4><ul>${D.contra.map(g=>`<li>${e(g)}</li>`).join("")}</ul></div></div>
      <p class="k9mkm-note">Kanga mudelit ega arvutusi need leiud ei muuda. Need on kontekst tööhõive, pendelrände ja teenuste ridadele. Lehekülje number on PDF-faili lehekülg.</p></div>`;},
    bind(h){h.addEventListener("click",ev=>{if(ev.target.closest("[data-mkmmore]")){MORE=!MORE;this.update(h);return;}const b=ev.target.closest("[data-mkmc]");if(!b)return;FC=b.dataset.mkmc;h.querySelectorAll("[data-mkmc]").forEach(x=>x.setAttribute("aria-pressed",x===b));this.update(h);});
      h.querySelector("[data-mkmt]").addEventListener("change",ev=>{FT=ev.target.value;this.update(h);});},
    update(h){const L=D.findings.filter(f=>(FC==="all"||f.cls===FC)&&(FT==="all"||f.th===FT));
      const L2=MORE?L:L.slice(0,6);h.querySelector("[data-mkmlist]").innerHTML=L.length?L2.map(card).join("")+(L.length>6?`<p class="k9mkm-more"><button type="button" class="k9btn ghost sm" data-mkmmore>${MORE?"Näita vähem":"Näita kõiki "+L.length+" leidu"}</button></p>`:""):`<p>Valikule vastavaid leide ei ole.</p>`;}
  });
  let FR="AB";
  K9.part("mkmreg",{
    html:()=>{const c={};D.reg.forEach(r=>c[r.rel]=(c[r.rel]||0)+1);
      return `<details class="k9det k9mkm-reg" id="k9-mkmreg"><summary>Töövaldkonna uuringud (MKM): register, ${D.n} dokumenti</summary>
      <p>Lähteleht: <a href="${e(D.source)}" target="_blank" rel="noopener">mkm.ee · Valminud uuringud</a> (loetelu päritud ${e(D.fetched)}). Staatus: ${Object.keys(REL).filter(k=>c[k]).map(k=>`${e(REL[k])} ${c[k]}`).join(" · ")}. Lehekülgede arv = PDF-i lehekülgi, mis loeti. Kasutatud leiud on peatükis <a href="#rahvastik/k9-too">Rahvastik → Tööhõive</a>.</p>
      <div class="k9seg" role="group" aria-label="Registri filter"><button type="button" data-mkmr="AB" aria-pressed="true">Kasutatud (A, B)</button><button type="button" data-mkmr="all" aria-pressed="false">Kõik ${D.n}</button><button type="button" data-mkmr="NG" aria-pressed="false">Avamata / töötlemata</button></div>
      <div data-mkmrt></div></details>`;},
    bind(h){h.addEventListener("click",ev=>{const b=ev.target.closest("[data-mkmr]");if(!b)return;FR=b.dataset.mkmr;h.querySelectorAll("[data-mkmr]").forEach(x=>x.setAttribute("aria-pressed",x===b));this.update(h);});},
    update(h){const R=D.reg.filter(r=>FR==="all"||FR.includes(r.rel));
      h.querySelector("[data-mkmrt]").innerHTML=`<div class="k9tbl"><table><thead><tr><th>#</th><th>Uuring</th><th>Autor / koostaja</th><th>Avaldatud</th><th>Vaatlusperiood</th><th class="n">Lk</th><th>Staatus</th><th>Põhjendus</th></tr></thead><tbody>${R.map(r=>`<tr><td class="n">${r.i}</td><td><a href="${e(r.url)}" target="_blank" rel="noopener">${e(r.t)}</a></td><td>${e(r.a||"–")}</td><td>${e(r.y||"–")}</td><td>${e(r.per||"ei määratud")}</td><td class="n">${r.pp||"–"}</td><td>${e(REL[r.rel])}</td><td>${e(r.why)}</td></tr>`).join("")}</tbody></table></div>`;}
  });
})();
