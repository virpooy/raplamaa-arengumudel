// Statistikaameti lisaandmed -> data/ext.json osad. Staatilised osad (URP, MJ, DW, COM) jäävad puutumata.
// Sama kood töötab Node'is ja brauseris. Iga osa kuju on kontrollitud praeguste andmete vastu (29.10.2026).
//
//   SA     RV085 (põhistsenaarium: rahvaarv, sünnid, surmad, rändesaldo, sündimuskordaja), RV084 (0-14 ja 65+)
//   EE     RV0282U Kogu Eesti: rahvaarv ja 65+
//   E0     RV0452 oodatav eluiga sünnimomendil, Rapla maakond (T kõik aastad, M ja N alates 2021)
//   MIGV   välisrände saldo valdade kaupa  (arvutatakse data/pop.json-ist: miE - moE), alates 2019
//   MIGS   siserände saldo valdade kaupa   ((mi - miE) - (mo - moE)), alates 2021
//   HOUSE  EH46U kasutusse lubatud eluruumid (arv, pind, korterelamud), EH045 ehitus- ja kasutusload kvartalitest
//   FUNC   RR302 kulud tegevusala järgi, tuh €, viimased 3 aastat: la=71, kool=72, eak=87, vesi=34+41
//   GDP    RAA0050: Harju osatähtsus Eesti SKP-s; Rapla SKP elaniku kohta % Eesti keskmisest
//   EMP    TT0151 Eesti tööhõive määr 15-74, viimased 3 aastat
//   EMPR, EMPE  TT4661 tööhõive määr (Rapla maakond, Eesti), alates 2015
import { API } from "./stat_pop.mjs";

const V = ["Rapla", "Kohila", "Marjamaa", "Kehtna"];
const yr = (a, b) => { const o = []; for (let y = a; y <= b; y++) o.push(String(y)); return o; };
const r1 = (x) => (x == null ? null : Math.round(x * 10) / 10);

async function meta(t, f) { const r = await f(API + t); if (!r.ok) throw new Error(`${t}: metaandmed HTTP ${r.status}`); return r.json(); }
async function q(t, sel, f) {
  const body = { query: Object.entries(sel).map(([code, values]) => ({ code, selection: { filter: "item", values } })), response: { format: "json-stat2" } };
  const r = await f(API + t, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${t}: päring HTTP ${r.status}`);
  const j = await r.json(); const ids = j.id, size = j.size, idx = ids.map(d => j.dimension[d].category.index);
  return (k) => { let p = 0; ids.forEach((d, i) => { const ix = idx[i][k[d]]; if (ix === undefined) throw new Error(`${t}: tundmatu ${d}=${k[d]}`); p = p * size[i] + ix; }); const v = j.value[p]; return v === undefined ? null : v; };
}
const vals = (m, code) => m.variables.find(v => v.code === code).values;
const codeOf = (m, code, re) => { const v = m.variables.find(x => x.code === code); const i = v.valueTexts.findIndex(t => re.test(t)); if (i < 0) throw new Error(`${code}: ei leia ${re}`); return v.values[i]; };
const lastYear = (m, code, min) => Math.max(...vals(m, code).map(Number).filter(n => n >= (min || 0)));

export async function buildExt(f, pop) {
  const out = {}, src = {};

  // --- SA: Statistikaameti prognoos (põhistsenaarium) ---
  {
    const m = await meta("RV085", f);
    const RAP = codeOf(m, "Maakond", /^Rapla/), EE = codeOf(m, "Maakond", /Eesti kokku/), ST = codeOf(m, "Stsenaarium", /põhistsenaarium/);
    const N = { pop: codeOf(m, "Näitaja", /^Rahvaarv, 1/), b: codeOf(m, "Näitaja", /^Elussünnid/), d: codeOf(m, "Näitaja", /^Surmad/), mig: codeOf(m, "Näitaja", /^Rändesaldo$/), tfr: codeOf(m, "Näitaja", /^Summaarne sündimus/) };
    const Ys = [...yr(2024, 2036), "2040", "2045", "2050"];
    const g = await q("RV085", { Aasta: Ys, Sugu: ["1"], Maakond: [RAP, EE], Stsenaarium: [ST], "Näitaja": Object.values(N) }, f);
    const get = (mk, n, ys) => Object.fromEntries(ys.map(y => [y, g({ Aasta: y, Sugu: "1", Maakond: mk, Stsenaarium: ST, "Näitaja": N[n] })]));
    const R = { pop: get(RAP, "pop", Ys), b: get(RAP, "b", yr(2024, 2036)), d: get(RAP, "d", yr(2024, 2036)), mig: get(RAP, "mig", yr(2024, 2036)) };
    const E = { pop: get(EE, "pop", ["2024", "2026", "2030", "2036", "2050"]), tfr: get(EE, "tfr", Ys), mig: get(EE, "mig", yr(2024, 2036)) };
    const m4 = await meta("RV084", f);
    const R4 = codeOf(m4, "Maakond", /^Rapla/), vg = m4.variables.find(v => v.code === "Vanuserühm");
    const gc = re => vg.values[vg.valueTexts.findIndex(t => re.test(t))];
    const KID = [/^0-4$/, /^5-9$/, /^10-14$/].map(gc), OLD = [/^65-69$/, /^70-74$/, /^75-79$/, /^80-84$/, /^85 ja vanemad$/].map(gc);
    const KY = ["2026", "2031", "2036"];
    const g4 = await q("RV084", { Sugu: ["1"], Maakond: [R4], Vanuserühm: [...KID, ...OLD], Aasta: KY }, f);
    const sum = (cs, y) => cs.reduce((t, c) => { const v = g4({ Sugu: "1", Maakond: R4, Vanuserühm: c, Aasta: y }); return t == null || v == null ? null : t + v; }, 0);
    out.SA = { R, E, kids: Object.fromEntries(KY.map(y => [y, sum(KID, y)])), old: Object.fromEntries(KY.map(y => [y, sum(OLD, y)])) };
    src.RV085 = src.RV084 = "prognoos";
  }

  // --- EE: Eesti rahvaarv ja 65+ ---
  {
    const m = await meta("RV0282U", f);
    const vg = m.variables.find(v => /Vanus/.test(v.code));
    const c = re => vg.values[vg.valueTexts.findIndex(t => re.test(t))];
    const TOT = c(/^Kokku$/), OLD = [/^65-69$/, /^70-74$/, /^75-79$/, /^80-84$/, /^85 ja vanemad$/].map(c);
    const Ys = vals(m, "Aasta").filter(y => +y >= 2015);
    const g = await q("RV0282U", { Sugu: ["1"], Elukoht: ["00"], Aasta: Ys, [vg.code]: [TOT, ...OLD] }, f);
    const k = (y, cc) => g({ Sugu: "1", Elukoht: "00", Aasta: y, [vg.code]: cc });
    out.EE = { pop: Object.fromEntries(Ys.map(y => [y, k(y, TOT)])), old: Object.fromEntries(Ys.map(y => [y, OLD.reduce((t, cc) => t + k(y, cc), 0)])) };
  }

  // --- E0: oodatav eluiga ---
  {
    const m = await meta("RV0452", f);
    const MK = codeOf(m, "Maakond", /^Rapla/), last = lastYear(m, "Aasta");
    const Ys = yr(2015, last);
    const g = await q("RV0452", { Aasta: Ys, Maakond: [MK], Sugu: ["1", "2", "3"], Vanuserühm: ["1"] }, f);
    const s = (sx, ys) => Object.fromEntries(ys.map(y => [y, g({ Aasta: y, Maakond: MK, Sugu: sx, Vanuserühm: "1" })]));
    out.E0 = { T: s("1", Ys), M: s("2", yr(2021, last)), N: s("3", yr(2021, last)) };
  }

  // --- MIGV, MIGS: rahvastikuandmetest ---
  {
    const n = pop.Kohila.b.length, last = 2015 + n - 1;
    out.MIGV = Object.fromEntries(V.map(v => [v, Object.fromEntries(yr(2019, last).map(y => { const i = +y - 2015; return [y, pop[v].miE[i] - pop[v].moE[i]]; }))]));
    out.MIGS = Object.fromEntries(V.map(v => [v, Object.fromEntries(yr(2021, last).map(y => { const i = +y - 2015; const p = pop[v]; return [y, (p.mi[i] - p.miE[i]) - (p.mo[i] - p.moE[i])]; }))]));
  }

  // --- HOUSE: eluruumid ---
  {
    const m = await meta("EH46U", f);
    const PU = "Piirkond/haldusüksus", ET = "Elamu tüüp";
    const U = { Rapla: codeOf(m, PU, /^Rapla vald$/), Kohila: codeOf(m, PU, /^Kohila vald$/), Marjamaa: codeOf(m, PU, /^Märjamaa vald$/), Kehtna: codeOf(m, PU, /^Kehtna vald$/), MAAK: codeOf(m, PU, /^Rapla maakond$/) };
    const types = m.variables.find(v => v.code === ET);
    const APT = types.values.filter((c, i) => /korterelamu|korruseliste? korte|korruselised korte/i.test(types.valueTexts[i]) || /^CC11222/.test(c));
    const Ys = vals(m, "Vaatlusperiood").filter(y => +y >= 2017);
    const g = await q("EH46U", { Vaatlusperiood: Ys, [PU]: Object.values(U), [ET]: ["CC11000", ...APT], "Näitaja": ["PNUM", "DAREA"] }, f);
    const k = (y, u, t, n) => g({ Vaatlusperiood: y, [PU]: u, [ET]: t, "Näitaja": n });
    const UO = ["Rapla", "Kohila", "Marjamaa", "Kehtna", "MAAK"];
    const H = { y: Ys.map(Number), n: {}, m2: {} };
    UO.forEach(u => { H.n[u] = Ys.map(y => k(y, U[u], "CC11000", "PNUM")); H.m2[u] = Ys.map(y => k(y, U[u], "CC11000", "DAREA")); });
    // korterelamute eluruumid maakonnas; puuduv (avaldamata/null) liidetakse nullina nagu algandmetes
    H.apt = Object.fromEntries(Ys.filter(y => +y >= 2022).map(y => [y, APT.reduce((t, c) => t + (k(y, U.MAAK, c, "PNUM") || 0), 0)]));
    // ehitus- ja kasutusload kvartalitest; jooksev aasta osalisena "AAAA I–II kv"
    const m2 = await meta("EH045", f);
    const per = vals(m2, "Vaatlusperiood").filter(p => +p.slice(0, 4) >= 2017);
    const MK = codeOf(m2, "Maakond", /^Rapla maakond$/);
    const g2 = await q("EH045", { "Näitaja": ["PNUM"], "Ehituse liik": ["NEWCONSTR"], "Loa/teatise liik": ["BPERMIT", "CCOMPL"], Maakond: [MK], "Elamu tüüp": ["CC11000"], Vaatlusperiood: per }, f);
    const ROM = ["I", "II", "III", "IV"];
    const agg = (lt) => {
      const by = {};
      per.forEach(p => { const y = p.slice(0, 4), qn = +p.slice(5); const v = g2({ "Näitaja": "PNUM", "Ehituse liik": "NEWCONSTR", "Loa/teatise liik": lt, Maakond: MK, "Elamu tüüp": "CC11000", Vaatlusperiood: p }); (by[y] = by[y] || { s: 0, q: 0, nul: false }); if (v == null) by[y].nul = true; else by[y].s += v; by[y].q = Math.max(by[y].q, qn); });
      const o = {};
      Object.keys(by).sort().forEach(y => { const b = by[y]; o[b.q === 4 ? y : `${y} ${ROM[0]}–${ROM[b.q - 1]} kv`] = b.nul ? null : b.s; });
      return o;
    };
    H.permit = agg("BPERMIT"); H.compl = agg("CCOMPL");
    out.HOUSE = H;
  }

  // --- FUNC: kulud tegevusala järgi, viimased 3 aastat ---
  {
    const m = await meta("RR302", f);
    const PU = "Piirkond/Haldusüksus";
    const U = Object.fromEntries(V.map(v => [v, codeOf(m, PU, new RegExp("^\\.\\." + { Rapla: "Rapla", Kohila: "Kohila", Marjamaa: "Märjamaa", Kehtna: "Kehtna" }[v] + " vald$"))]));
    const last = lastYear(m, "Aasta"), Ys = yr(last - 2, last);
    const g = await q("RR302", { Aasta: Ys, [PU]: Object.values(U), "Näitaja": ["71", "72", "87", "34", "41"] }, f);
    const k = (y, v, n) => g({ Aasta: y, [PU]: U[v], "Näitaja": n });
    const F = { la: {}, kool: {}, eak: {}, vesi: {} };
    V.forEach(v => {
      F.la[v] = Ys.map(y => k(y, v, "71")); F.kool[v] = Ys.map(y => k(y, v, "72")); F.eak[v] = Ys.map(y => k(y, v, "87"));
      F.vesi[v] = Ys.map(y => { const a = k(y, v, "34"), b = k(y, v, "41"); return a == null || b == null ? null : r1(a + b); });
    });
    out.FUNC = F; src.FUNC_years = Ys;
  }

  // --- GDP ---
  {
    const m = await meta("RAA0050", f);
    const last = lastYear(m, "Aasta"), Ys = yr(2019, last);
    const H = codeOf(m, "Maakond", /^Harju/), R = codeOf(m, "Maakond", /^Rapla/);
    const g = await q("RAA0050", { Aasta: Ys, Maakond: [H, R], "Näitaja": ["2", "5"] }, f);
    out.GDP = { y: Ys.map(Number), harju: Ys.map(y => g({ Aasta: y, Maakond: H, "Näitaja": "2" })), rapla: Ys.map(y => g({ Aasta: y, Maakond: R, "Näitaja": "5" })) };
  }

  // --- tööhõive ---
  {
    const m = await meta("TT0151", f);
    const last = lastYear(m, "Vaatlusperiood"), Ys = yr(last - 2, last);
    const g = await q("TT0151", { "Näitaja": ["EMPRATE"], Sugu: ["T"], Vanuserühm: ["Y15-74"], Vaatlusperiood: Ys }, f);
    out.EMP = Object.fromEntries(Ys.map(y => [y, g({ "Näitaja": "EMPRATE", Sugu: "T", Vanuserühm: "Y15-74", Vaatlusperiood: y })]));
    const m2 = await meta("TT4661", f);
    const PR = "Piirkond/maakond", l2 = lastYear(m2, "Vaatlusperiood"), Y2 = yr(2015, l2);
    const RAP = codeOf(m2, PR, /^Rapla maakond$/);
    const g2 = await q("TT4661", { "Näitaja": ["EMPRATE"], [PR]: ["EE", RAP], "Isikute rühm": ["IND_TOTAL"], Vaatlusperiood: Y2 }, f);
    const k = (r, y) => g2({ "Näitaja": "EMPRATE", [PR]: r, "Isikute rühm": "IND_TOTAL", Vaatlusperiood: y });
    out.EMPR = Object.fromEntries(Y2.map(y => [y, k(RAP, y)]));
    out.EMPE = Object.fromEntries(Y2.map(y => [y, k("EE", y)]));
  }
  return { ext: out, src };
}

// Osad, mille muutus mõjutab mudeli kalibreerimist või kulupõhju: need lähevad alati ülevaatusele.
export const MODEL_KEYS = ["E0", "MIGV", "MIGS", "EMP", "EMPR", "EMPE", "FUNC"];

export function checkExt(next, prev) {
  const err = [], warn = [];
  const walk = (a, b, p) => {
    if (a && typeof a === "object") { for (const k of Object.keys(a)) { if (!(k in b) && !/kv$/.test(k)) err.push(`${p}.${k} kadus`); else if (k in b) walk(a[k], b[k], `${p}.${k}`); } return; }
    if (a != null && b == null) err.push(`${p}: väärtus ${a} muutus puuduvaks`);
  };
  for (const k of Object.keys(next)) {
    if (!prev[k]) continue;
    walk(prev[k], next[k], k);
    if (JSON.stringify(prev[k]) !== JSON.stringify(next[k]) && MODEL_KEYS.includes(k)) warn.push(`${k} muutus: mõjutab mudeli kalibreerimist või kulupõhju, vaata tulemused üle`);
  }
  // tööhõive baas mudelis (EMPB = 64,1) on EMPR 2023-2025 keskmine
  const ys = Object.keys(next.EMPR).slice(-3), avg = Math.round(ys.reduce((t, y) => t + next.EMPR[y], 0) / 3 * 10) / 10;
  if (avg !== 64.1) warn.push(`Raplamaa tööhõive viimase 3 aasta keskmine on nüüd ${avg}% (mudeli baas EMPB on 64,1%): kaalu baasi uuendamist`);
  return { err, warn };
}
