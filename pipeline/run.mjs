// Käivitaja: node pipeline/run.mjs pop
// Pärib andmed, kontrollib neid praeguse data/<nimi>.json vastu ja kirjutab
//   pipeline/out/<nimi>.json         uued andmed (kompaktne)
//   pipeline/out/<nimi>.report.json  aruanne: vead, hoiatused, muutused, allikad
// Väljumiskood: 0 = korras (muutusi võib olla või mitte), 2 = vead (andmeid ei tohi kasutada), 1 = pärimine ebaõnnestus.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATASETS = {
  pop: async () => {
    const m = await import("./stat_pop.mjs");
    const prev = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "pop.json"), "utf8"));
    const { pop, src } = await m.buildPop(fetch);
    const { err, warn } = m.checkPop(pop, prev);
    return { data: pop, prev, src, err, warn };
  },
  ext: async () => {
    const m = await import("./stat_ext.mjs");
    const prev = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "ext.json"), "utf8"));
    const pop = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "pop.json"), "utf8"));
    const { ext, src } = await m.buildExt(fetch, pop);
    const { err, warn } = m.checkExt(ext, prev);
    // asenda ainult päritud osad; staatilised (URP, MJ, DW, COM) ja võtmete järjekord jäävad
    const next = {};
    for (const k of Object.keys(prev)) next[k] = k in ext ? ext[k] : prev[k];
    const changed = Object.keys(ext).some(k => JSON.stringify(ext[k]) !== JSON.stringify(prev[k]));
    if (changed) { const d = new Date(); next.STAMP = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`; }
    return { data: next, prev, src, err, warn };
  },
  econ: async () => {
    const m = await import("./stat_econ.mjs");
    const peersPrev = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "peers.json"), "utf8"));
    const kovPrev = fs.readFileSync(path.join(ROOT, "econ", "raw", "kov79.txt"), "utf8");
    const per = JSON.parse(fs.readFileSync(path.join(ROOT, "econ", "periood.json"), "utf8"));
    const { rows, peers } = await m.buildEcon(fetch, peersPrev, per);
    const err = [], warn = [];
    // kov79: väärtus ei tohi kaduda (varem olemas, nüüd puudub)
    const old = kovPrev.trim().split("\n").map(l => l.split(":")[1].split(","));
    rows.forEach((r, i) => m.KOV79_FIELDS.forEach((f, j) => { if (old[i] && old[i][j] !== "" && r[f] == null) err.push(`${peersPrev.R[i][0]}: ${f} puudub (varem ${old[i][j]})`); }));
    // võrdlusnäitajad: puuduv uus väärtus -> jääb eelmine, hoiatus
    peers.R.forEach((r, i) => peersPrev.K.forEach((k, j) => { if (r[j + 1] == null && peersPrev.R[i][j + 1] != null) { r[j + 1] = peersPrev.R[i][j + 1]; warn.push(`${r[0]}: ${k} ei õnnestunud uuendada, jääb eelmine väärtus ${peersPrev.R[i][j + 1]}`); } }));
    warn.push("refi ja finKordaja arvutuskäik on teadmata: need jäävad eelmisest versioonist (vt data/ALLIKAD.md)");
    const kovNew = m.kov79Text(rows);
    let nk = 0; kovNew.trim().split("\n").forEach((l, i) => { const a = l.split(":")[1].split(","); a.forEach((x, j) => { if (!old[i] || old[i][j] !== x) nk++; }); });
    let np = 0; peers.R.forEach((r, i) => r.forEach((x, j) => { if (j && x !== peersPrev.R[i][j]) np++; }));
    warn.push(`Seosed-andmestik: muutunud väärtusi ${nk} (79 omavalitsuse andmestik) ja ${np} (võrdlusnäitajad); perioodid ${JSON.stringify(per, (k, v) => (k === "_selgitus" ? undefined : v))}. Vaata Seosed-peatüki tulemused ja tõlgendused üle.`);
    const data = { kov79: kovNew, peers }, prev = { kov79: kovPrev, peers: peersPrev };
    return { data, prev, src: { periood: per }, err, warn };
  },
};

const name = process.argv[2];
if (!DATASETS[name]) { console.error("Tundmatu andmestik: " + name + ". Valikud: " + Object.keys(DATASETS).join(", ")); process.exit(1); }

let r;
try { r = await DATASETS[name](); }
catch (e) { console.error("Pärimine ebaõnnestus: " + e.message); process.exit(1); }

const changed = JSON.stringify(r.data) !== JSON.stringify(r.prev);
const out = path.join(ROOT, "pipeline", "out");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, name + ".json"), JSON.stringify(r.data));
const report = { dataset: name, fetched: new Date().toISOString().slice(0, 10), changed, src: r.src, err: r.err, warn: r.warn };
fs.writeFileSync(path.join(out, name + ".report.json"), JSON.stringify(report, null, 1));
console.log(`${name}: ${changed ? "ANDMED MUUTUSID" : "muutusi ei ole"} · vigu ${r.err.length} · hoiatusi ${r.warn.length}`);
r.err.forEach(x => console.log("  VIGA " + x));
r.warn.forEach(x => console.log("  hoiatus " + x));
process.exit(r.err.length ? 2 : 0);
