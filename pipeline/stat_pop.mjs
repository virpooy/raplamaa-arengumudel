// Rahvastikuandmed Statistikaameti API-st -> data/pop.json kuju.
// Sama kood töötab Node'is (GitHub Actions) ja brauseris (käsitsi kontroll), seepärast ainult fetch ja puhas JS.
//
// Tabelid:
//   RV0240  rahvastik soo, vanuse ja elukoha järgi, 1. jaanuar  -> age (18 viieaastast rühma), tot
//   RV112U  elussündinud haldusüksuse järgi                      -> b
//   RV49U   surnud haldusüksuse järgi                            -> d
//   RVR02   ränne haldusüksuse ja rände liigi järgi               -> mi, mo (sise+välis), miE, moE (välis)
//
// Põhimõte: puuduvat väärtust ei asendata nulliga. Kui API ei anna väärtust, jääb see nulliks (null) ja kontroll annab vea.

export const API = "https://andmed.stat.ee/api/v1/et/stat/";

// haldusüksuste koodid tabeliti (2017. aasta haldusreformi järgsed piirid)
export const UNITS = {
  RV0240: { MAAK: "70", Rapla: "669", Kohila: "317", Marjamaa: "504", Kehtna: "292" },
  RVR02:  { MAAK: "70", Rapla: "669", Kohila: "317", Marjamaa: "504", Kehtna: "292" },
  RV112U: { MAAK: "123", Rapla: "127", Kohila: "125", Marjamaa: "126", Kehtna: "124" },
  RV49U:  { MAAK: "123", Rapla: "127", Kohila: "125", Marjamaa: "126", Kehtna: "124" },
};
export const ORDER = ["MAAK", "Rapla", "Kohila", "Marjamaa", "Kehtna"];
export const Y0 = 2015;

async function meta(table, fetchFn) {
  const r = await fetchFn(API + table);
  if (!r.ok) throw new Error(`${table}: metaandmed HTTP ${r.status}`);
  return r.json();
}

// päring -> { get(koodid objektina) -> väärtus või null, years }
async function query(table, sel, fetchFn) {
  const body = {
    query: Object.entries(sel).map(([code, values]) => ({ code, selection: { filter: "item", values } })),
    response: { format: "json-stat2" },
  };
  const r = await fetchFn(API + table, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${table}: päring HTTP ${r.status}`);
  const j = await r.json();
  const ids = j.id, size = j.size;
  const idx = ids.map(d => j.dimension[d].category.index);
  const isArr = Array.isArray(j.value);
  return (keys) => {
    let pos = 0;
    for (let k = 0; k < ids.length; k++) {
      const c = keys[ids[k]];
      const i = Array.isArray(idx[k]) ? idx[k].indexOf(c) : idx[k][c];
      if (i === undefined || i < 0) throw new Error(`${table}: tundmatu kood ${ids[k]}=${c}`);
      pos = pos * size[k] + i;
    }
    const v = isArr ? j.value[pos] : j.value[String(pos)];
    return v === undefined || v === null ? null : v;
  };
}

// kõik aastad, mis tabelis olemas on (alates Y0)
function yearsOf(m, code = "Aasta") {
  const v = m.variables.find(x => x.code === code);
  return v.values.filter(y => +y >= Y0).sort();
}

export async function buildPop(fetchFn = fetch) {
  const out = {};
  ORDER.forEach(u => (out[u] = { age: {}, tot: {}, b: [], d: [], mi: [], mo: [], miE: [], moE: [] }));
  const src = {};

  // 1. rahvastik 1. jaanuar
  const m0 = await meta("RV0240", fetchFn);
  const yA = yearsOf(m0);
  const ages = [];
  for (let a = 0; a <= 84; a++) ages.push(String(a));
  const AGE85 = "DBL103"; // 85 ja vanemad
  const g0 = await query("RV0240", { Sugu: ["1"], Elukoht: Object.values(UNITS.RV0240), Aasta: yA, Vanus: ["000", ...ages, AGE85] }, fetchFn);
  for (const u of ORDER) {
    for (const y of yA) {
      const key = { Sugu: "1", Elukoht: UNITS.RV0240[u], Aasta: y };
      const grp = [];
      for (let gi = 0; gi < 17; gi++) {
        let s = 0;
        for (let a = gi * 5; a < gi * 5 + 5; a++) {
          const v = g0({ ...key, Vanus: String(a) });
          if (v === null) { s = null; break; }
          s += v;
        }
        grp.push(s);
      }
      grp.push(g0({ ...key, Vanus: AGE85 }));
      out[u].age[y] = grp;
      out[u].tot[y] = g0({ ...key, Vanus: "000" });
    }
  }
  src.RV0240 = { years: [yA[0], yA[yA.length - 1]], updated: m0.updated || null };

  // 2. sünnid ja surmad
  for (const [t, f] of [["RV112U", "b"], ["RV49U", "d"]]) {
    const m = await meta(t, fetchFn);
    const yy = yearsOf(m);
    const hu = m.variables[0].code; // "Haldusüksus/ asustuspiirkonna liik"
    const g = await query(t, { [hu]: Object.values(UNITS[t]), Aasta: yy, Sugu: ["1"] }, fetchFn);
    for (const u of ORDER) out[u][f] = yy.map(y => g({ [hu]: UNITS[t][u], Aasta: y, Sugu: "1" }));
    src[t] = { years: [yy[0], yy[yy.length - 1]], updated: m.updated || null };
  }

  // 3. ränne: näitaja 1 = sisseränne, 2 = väljaränne; rände liik 1 = siseränne, 2 = välisränne
  const mr = await meta("RVR02", fetchFn);
  const yr = yearsOf(mr);
  const hr = mr.variables.find(v => /Haldus/.test(v.code)).code;
  const gr = await query("RVR02", { Aasta: yr, [hr]: Object.values(UNITS.RVR02), Sugu: ["1"], "Näitaja": ["1", "2"], "Rände liik": ["1", "2"] }, fetchFn);
  for (const u of ORDER) {
    const k = (y, n, l) => gr({ Aasta: y, [hr]: UNITS.RVR02[u], Sugu: "1", "Näitaja": n, "Rände liik": l });
    const sum = (a, b) => (a === null || b === null ? null : a + b);
    out[u].mi = yr.map(y => sum(k(y, "1", "1"), k(y, "1", "2")));
    out[u].mo = yr.map(y => sum(k(y, "2", "1"), k(y, "2", "2")));
    out[u].miE = yr.map(y => k(y, "1", "2"));
    out[u].moE = yr.map(y => k(y, "2", "2"));
  }
  src.RVR02 = { years: [yr[0], yr[yr.length - 1]], updated: mr.updated || null };

  return { pop: out, src };
}

// Kontrollid: tagastab vigade ja hoiatuste nimekirja. Viga = ei tohi avaldada; hoiatus = inimene vaatab üle.
export function checkPop(pop, prev) {
  const err = [], warn = [];
  const V = ORDER.slice(1);
  const years = Object.keys(pop.MAAK.tot);
  for (const u of ORDER) {
    for (const y of years) {
      if (pop[u].tot[y] == null) err.push(`${u} ${y}: rahvaarv puudub`);
      if (pop[u].age[y].some(x => x == null)) err.push(`${u} ${y}: vanuserühm puudub`);
      const s = pop[u].age[y].reduce((a, b) => a + b, 0);
      if (s !== pop[u].tot[y]) err.push(`${u} ${y}: vanuserühmade summa ${s} ≠ kokku ${pop[u].tot[y]}`);
    }
    for (const f of ["b", "d", "mi", "mo", "miE", "moE"]) if (pop[u][f].some(x => x == null)) err.push(`${u}: ${f} sisaldab puuduvat väärtust`);
  }
  // vallad kokku = maakond
  for (const y of years) {
    const s = V.reduce((a, v) => a + pop[v].tot[y], 0);
    if (s !== pop.MAAK.tot[y]) err.push(`${y}: valdade summa ${s} ≠ maakond ${pop.MAAK.tot[y]}`);
  }
  for (const f of ["b", "d", "mi", "mo", "miE", "moE"]) pop.MAAK[f].forEach((m, i) => {
    const s = V.reduce((a, v) => a + pop[v][f][i], 0);
    // ränne: valdade summa sisaldab maakonnasisest rännet, seega võib olla maakonnast suurem
    if (/^(b|d)$/.test(f) && s !== m) err.push(`${f} ${Y0 + i}: valdade summa ${s} ≠ maakond ${m}`);
  });
  // demograafiline tasakaal: tot(y+1) ≈ tot(y) + b - d + mi - mo
  for (const u of ORDER.slice(1)) for (let i = 0; i < years.length - 1; i++) {
    const y = +years[i], j = y - Y0;
    if (j >= pop[u].b.length) continue;
    const exp = pop[u].tot[y] + pop[u].b[j] - pop[u].d[j] + pop[u].mi[j] - pop[u].mo[j];
    const got = pop[u].tot[y + 1];
    if (Math.abs(exp - got) > Math.max(30, 0.005 * got)) warn.push(`${u} ${y}→${y + 1}: tasakaaluvõrrand ${exp} vs tegelik ${got}`);
  }
  // võrdlus eelmise versiooniga: juba avaldatud aastad ei tohiks palju muutuda; uus aasta ei tohiks hüpata
  if (prev) for (const u of ORDER) for (const y of Object.keys(prev[u].tot)) {
    const a = prev[u].tot[y], b = pop[u].tot[y];
    if (b === undefined) err.push(`${u} ${y}: aasta kadus andmetest`);
    else if (a !== b) warn.push(`${u} ${y}: rahvaarv muutus ${a} → ${b} (Statistikaamet täpsustas)`);
  }
  for (const u of ORDER) for (let i = 1; i < years.length; i++) {
    const a = pop[u].tot[years[i - 1]], b = pop[u].tot[years[i]];
    if (Math.abs(b / a - 1) > 0.05) warn.push(`${u} ${years[i]}: aastane muutus ${(100 * (b / a - 1)).toFixed(1)}%`);
  }
  return { err, warn };
}
