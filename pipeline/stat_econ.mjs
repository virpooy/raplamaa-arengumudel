// Seosed-peatüki andmed: 79 omavalitsuse ristlõige -> econ/raw/kov79.txt ja data/peers.json (võrdlusnäitajad).
// Perioodid tulevad failist econ/periood.json. Käivitatakse käsitsi (aastane uuendus), tulemus läheb alati ülevaatusele.
//
// kov79 väljad (järjekord nagu econ/build.py F):
//   p,c,w,o  RV0240 rahvaarv kokku, 0-17, 18-64, 65+ (1. jaanuar) perioodi algus- ja lõppaastal
//   MIG      RVR02 rändesaldo (sise + välis) summa voo perioodil;  B RV112U sünnid;  DD RV49U surmad (summa)
//   uan,uae  UA08 tööga seotud tulu: isikute arv, eurot isiku kohta
//   wg,em    PA107 keskmine brutokuupalk, töötajate arv
//   ent      ER0320 ettevõtted (töötajate arv kokku)
//   dli      RV06U demograafiline tööturusurveindeks
//   reg      TT065 registreeritud töötud, kuude keskmine
// Võrdlusnäitajad (peers) RR300-st; arvutuskäik kontrollitud 79 omavalitsuse olemasolevate väärtuste vastu (29.10.2026).
// refi ja finKordaja arvutuskäiku ei õnnestunud taastada: need jäävad eelmisest versioonist ja aruanne hoiatab.
import { API } from "./stat_pop.mjs";

async function meta(t, f) { const r = await f(API + t); if (!r.ok) throw new Error(`${t}: metaandmed HTTP ${r.status}`); return r.json(); }
async function q(t, sel, f) {
  const body = { query: Object.entries(sel).map(([code, values]) => ({ code, selection: { filter: "item", values } })), response: { format: "json-stat2" } };
  const r = await f(API + t, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${t}: päring HTTP ${r.status}`);
  const j = await r.json(); const ids = j.id, size = j.size, idx = ids.map(d => j.dimension[d].category.index);
  return (k) => { if (Object.values(k).some(x => x == null)) return null; let p = 0; ids.forEach((d, i) => { const ix = idx[i][k[d]]; if (ix === undefined) throw new Error(`${t}: tundmatu ${d}=${k[d]}`); p = p * size[i] + ix; }); const v = j.value[p]; return v === undefined ? null : v; };
}
const yr = (a, b) => { const o = []; for (let y = a; y <= b; y++) o.push(String(y)); return o; };
const S = (a) => a.some(x => x == null) ? null : a.reduce((t, x) => t + x, 0);
const A = Math.abs;

// omavalitsuse kood nime järgi: eelistatakse KOV-taset ("..Nimi" või "Nimi"), mitte asustusüksust ("....Nimi")
function unitCodes(m, varRe, names) {
  const v = m.variables.find(x => varRe.test(x.code));
  const lvl = t => (t.match(/^\.*/)[0].length);
  return { code: v.code, map: names.map(n => {
    const c = v.valueTexts.map((t, i) => ({ t, i, l: lvl(t) })).filter(o => o.t.replace(/^\.+/, "") === n);
    if (!c.length) return null; // tabel ei avalda selle omavalitsuse kohta (nt Toila ER0320-s): väärtus puudub, mitte 0
    c.sort((a, b) => A(a.l - 2) - A(b.l - 2));
    return v.values[c[0].i];
  }).map(x => x), get sel() { return this.map.filter(x => x != null); } };
}

export async function buildEcon(f, peersPrev, P) {
  const names = peersPrev.R.map(r => r[0]);
  const N = names.length, rows = names.map(() => ({}));
  const put = (field, arr) => arr.forEach((v, i) => (rows[i][field] = v));
  const [p0, p1] = P.pop.map(String), [v0, v1] = P.voog, [t0, t1] = P.tulu.map(String), [w0, w1] = P.palk.map(String);

  // RV0240
  { const m = await meta("RV0240", f); const U = unitCodes(m, /Elukoht/, names);
    const ys = [...new Set([p0, p1, ...P.rahvaMuutus.map(String)])];
    const g = await q("RV0240", { Sugu: ["1"], Elukoht: U.sel, Aasta: ys, Vanus: ["000", "0-17", "18-64", "65+"] }, f);
    const k = (i, y, a) => g({ Sugu: "1", Elukoht: U.map[i], Aasta: y, Vanus: a });
    const I = [...Array(N).keys()];
    put("p0", I.map(i => k(i, p0, "000"))); put("p1", I.map(i => k(i, p1, "000")));
    put("c0", I.map(i => k(i, p0, "0-17"))); put("c1", I.map(i => k(i, p1, "0-17")));
    put("w0", I.map(i => k(i, p0, "18-64"))); put("w1", I.map(i => k(i, p1, "18-64")));
    put("o0", I.map(i => k(i, p0, "65+"))); put("o1", I.map(i => k(i, p1, "65+")));
    const [r0, r1] = P.rahvaMuutus.map(String);
    put("_pm", I.map(i => { const a = k(i, r0, "000"), b = k(i, r1, "000"); return a && b != null ? b / a - 1 : null; }));
  }
  // RVR02, RV112U, RV49U (summad voo perioodil)
  { const ys = yr(v0, v1);
    const m = await meta("RVR02", f); const U = unitCodes(m, /Haldus/, names);
    const g = await q("RVR02", { Aasta: ys, [U.code]: U.sel, Sugu: ["1"], "Näitaja": ["3"], "Rände liik": ["1", "2"] }, f);
    put("MIG", U.map.map(c => S(ys.flatMap(y => ["1", "2"].map(l => g({ Aasta: y, [U.code]: c, Sugu: "1", "Näitaja": "3", "Rände liik": l }))))));
    for (const [t, fld] of [["RV112U", "B"], ["RV49U", "DD"]]) {
      const mm = await meta(t, f); const UU = unitCodes(mm, /Haldus/, names);
      const gg = await q(t, { [UU.code]: UU.sel, Aasta: ys, Sugu: ["1"] }, f);
      put(fld, UU.map.map(c => S(ys.map(y => gg({ [UU.code]: c, Aasta: y, Sugu: "1" })))));
    }
  }
  // UA08 tööga seotud tulu
  { const m = await meta("UA08", f); const U = unitCodes(m, /Elukoht/, names);
    const g = await q("UA08", { Aasta: [t0, t1], Elukoht: U.sel, "Näitaja": ["1", "4"], "Sissetuleku liik": ["1"] }, f);
    const k = (c, y, n) => g({ Aasta: y, Elukoht: c, "Näitaja": n, "Sissetuleku liik": "1" });
    put("uan0", U.map.map(c => k(c, t0, "1"))); put("uan1", U.map.map(c => k(c, t1, "1")));
    put("uae0", U.map.map(c => k(c, t0, "4"))); put("uae1", U.map.map(c => k(c, t1, "4")));
  }
  // PA107 palk ja töötajad
  { const m = await meta("PA107", f); const U = unitCodes(m, /Haldus/, names);
    const g = await q("PA107", { "Näitaja": ["GR_W_AVG", "NR_EMPL"], [U.code]: U.sel, Vaatlusperiood: [w0, w1] }, f);
    const k = (c, y, n) => g({ "Näitaja": n, [U.code]: c, Vaatlusperiood: y });
    put("wg0", U.map.map(c => k(c, w0, "GR_W_AVG"))); put("wg1", U.map.map(c => k(c, w1, "GR_W_AVG")));
    put("em0", U.map.map(c => k(c, w0, "NR_EMPL"))); put("em1", U.map.map(c => k(c, w1, "NR_EMPL")));
  }
  // ER0320 ettevõtted
  { const m = await meta("ER0320", f); const U = unitCodes(m, /Haldus/, names);
    const g = await q("ER0320", { Aasta: [String(P.ettev)], [U.code]: U.sel, "Töötajate arv": ["1"] }, f);
    put("ent", U.map.map(c => g({ Aasta: String(P.ettev), [U.code]: c, "Töötajate arv": "1" })));
  }
  // RV06U tööturusurveindeks
  { const m = await meta("RV06U", f); const U = unitCodes(m, /Haldus/, names); const [a, b] = P.survei.map(String);
    const NI = m.variables.find(v => v.code === "Näitaja"); const DLI = NI.values[NI.valueTexts.findIndex(t => /tööturusurve/i.test(t))];
    const g = await q("RV06U", { Aasta: [a, b], [U.code]: U.sel, "Näitaja": [DLI] }, f);
    put("dli0", U.map.map(c => g({ Aasta: a, [U.code]: c, "Näitaja": DLI }))); put("dli1", U.map.map(c => g({ Aasta: b, [U.code]: c, "Näitaja": DLI })));
  }
  // TT065 registreeritud töötud (kuude keskmine)
  { const m = await meta("TT065", f); const U = unitCodes(m, /Haldus/, names); const [a, b] = P.tootud.map(String);
    const g = await q("TT065", { Aasta: [a, b], Kuu: ["00"], [U.code]: U.sel, Sugu: ["1"], Vanuserühm: ["1"] }, f);
    const k = (c, y) => g({ Aasta: y, Kuu: "00", [U.code]: c, Sugu: "1", Vanuserühm: "1" });
    put("reg0", U.map.map(c => k(c, a))); put("reg1", U.map.map(c => k(c, b)));
  }

  // võrdlusnäitajad RR300
  const [e0, e1] = P.eelarve, ey = yr(e0, e1), L = ey.length - 1, nYr = e1 - e0;
  const m = await meta("RR300", f); const U = unitCodes(m, /Haldus/, names);
  const NC = ["1", "3", "9", "11", "12", "19", "22", "26", "27", "29", "32", "33", "42", "45", "46"];
  const g = await q("RR300", { Aasta: ey, [U.code]: U.sel, "Näitaja": NC }, f);
  const cagr = (a, b) => (a == null || b == null || a === 0 ? null : Math.pow(A(b) / A(a), 1 / nYr) - 1);
  const r3 = x => (x == null || !isFinite(x) ? null : Math.round(x * 1000) / 1000), r0 = x => (x == null || !isFinite(x) ? null : Math.round(x));
  const K = peersPrev.K;
  const R = names.map((n, i) => {
    const d = Object.fromEntries(NC.map(c => [c, ey.map(y => g({ Aasta: y, [U.code]: U.map[i], "Näitaja": c }))]));
    const pop = rows[i].p1, prev = peersPrev.R[i];
    const sum = c => S(d[c]);
    const val = {
      tulem25: r3(d["29"][L] / d["1"][L]), tulem5a: r3(sum("29") / sum("1")),
      tuludCAGR: r3(cagr(d["1"][0], d["1"][L])), kuludCAGR: r3(cagr(d["19"][0], d["19"][L])),
      persCAGR: r3(cagr(d["26"][0], d["26"][L])), majCAGR: r3(cagr(d["27"][0], d["27"][L])),
      sotsPerCap: r0(A(d["22"][L]) * 1000 / pop), sotsCAGR: r3(cagr(d["22"][0], d["22"][L])),
      finKulu: r3(A(d["42"][L]) / d["1"][L]), fondid: r3((d["11"][L] + d["12"][L]) / d["1"][L]),
      tmPerCap: r0(d["3"][L] * 1000 / pop), kuludPerCap: r0(A(d["19"][L]) * 1000 / pop),
      invPerCap: r0(A(sum("32")) / ey.length * 1000 / pop), sihtfinInv: r3(sum("33") / A(sum("32"))),
      laenV: r0(sum("45")), laenT: r0(A(sum("46"))),
      refi: prev[1 + K.indexOf("refi")],              // arvutuskäik teadmata: eelmine väärtus
      myykPerCap: r0(d["9"][L] * 1000 / pop), popMuutus: r3(rows[i]._pm),
      finKordaja: prev[1 + K.indexOf("finKordaja")],  // arvutuskäik teadmata: eelmine väärtus
      pop25: pop,
    };
    return [n, ...K.map(k => (k in val ? val[k] : prev[1 + K.indexOf(k)]))];
  });
  return { rows, peers: { K, R } };
}

export const KOV79_FIELDS = ["p0", "p1", "c0", "c1", "w0", "w1", "o0", "o1", "MIG", "B", "DD", "uan0", "uan1", "uae0", "uae1", "wg0", "wg1", "em0", "em1", "ent", "dli0", "dli1", "reg0", "reg1"];
export const kov79Text = rows => rows.map((r, i) => i + ":" + KOV79_FIELDS.map(k => (r[k] == null ? "" : String(r[k]))).join(",")).join("\n") + "\n";
