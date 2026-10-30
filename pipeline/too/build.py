# -*- coding: utf-8 -*-
"""Raplamaa tööturg ametliku statistika põhjal: toorandmed (päritud andmed.stat.ee PxWeb API kaudu 17.10.2026) -> pikk tabel, CSV, XLSX, JSON kanga jaoks.
Märgid: '.' = Statistikaamet ei avalda (valimiuuringus ebakindel), '..' = andmeid ei ole. Neid ei asendata nulliga."""
import sys, json, csv, os, re
from collections import defaultdict
D = os.path.dirname(os.path.abspath(__file__))
FETCH = "2026-10-17"
BASE = "https://andmed.stat.ee/et/stat/"
META = {  # tabel: (tee andmebaasis, viimane uuendus andmebaasi kataloogi järgi, kirjeldus)
 "TT4645": ("sotsiaalelu__tooturg__tooturu-uldandmed__aastastatistika", "2026-02-11", "15–74-aastaste hõiveseisund piirkonna, maakonna ja vanuserühma järgi (Eesti tööjõu-uuring, aastakeskmine)"),
 "TT4661": ("sotsiaalelu__tooturg__tooturu-uldandmed__aastastatistika", "2026-02-11", "Tööjõud, hõivatud, osalemise ja tööhõive määr maakonna ja isikute rühma järgi (ETU)"),
 "TT443":  ("sotsiaalelu__tooturg__tootud__aastastatistika", "2026-02-11", "Töötuse määr maakonna järgi, 3 aasta libisev keskmine (ETU)"),
 "TT241":  ("sotsiaalelu__tooturg__heivatud__aastastatistika", "2026-02-11", "Hõivatud elukoha maakonna ja majandussektori järgi (ETU)"),
 "TT065":  ("sotsiaalelu__tooturg__tootud__luhiajastatistika", "2026-10-14", "Registreeritud töötud piirkonna/haldusüksuse, soo ja vanuserühma järgi, kuud (Töötukassa register)"),
 "PA107":  ("majandus__palk-ja-toojeukulu__palk__aastastatistika", "2026-03-05", "Keskmine brutokuupalk, mediaan ja töötajate arv haldusüksuse järgi (TÖR + TSD)"),
 "PA117":  ("majandus__palk-ja-toojeukulu__palk__luhiajastatistika", "2026-09-02", "Sama kvartalite kaupa"),
 "TT4660": ("sotsiaalelu__tooturg__tooturu-uldandmed__luhiajastatistika", "2026-08-11", "Tööjõud ja hõive piirkonna järgi, kvartalid (ETU; ainult regioonid)"),
 "RV06U":  ("rahvastik__rahvastikunaitajad-ja-koosseis__demograafilised-pehinaitajad", "2026-05-19", "Demograafiline tööturusurveindeks haldusüksuse järgi, 1. jaanuar"),
 "UA08":   ("eri-valdkondade-statistika__eksperimentaalstatistika__EUROMOD", "2026-02-12", "Tööga seotud tulu elukoha (omavalitsus) järgi (eksperimentaalstatistika)"),
 "RL21163":("rahvaloendus__rel2021__rahvastiku-majanduslik-aktiivsus__hoivatud-ja-tooranne", "2022-12-05", "Hõivatud töökoha asukoha ja elukoha (haldusüksus) järgi, REL 2021"),
 "RL21166":("rahvaloendus__rel2021__rahvastiku-majanduslik-aktiivsus__hoivatud-ja-tooranne", "2022-12-05", "Hõivatud töökoha asukoha, tegevusala ja elukoha (maakond) järgi, REL 2021"),
 "RL21147":("rahvaloendus__rel2021__rahvastiku-majanduslik-aktiivsus__hoivatud-ja-tooranne", "2022-12-05", "Hõivatud tegevusala ja elukoha (haldusüksus) järgi, REL 2021"),
 "ER0320": ("majandus__majandusuksused__ettevetjad", "2026-01-20", "Statistilisse profiili kuuluvad ettevõtted töötajate arvu ja haldusüksuse järgi"),
}
def url(t): return BASE + META[t][0] + "/" + t
def num(x):
    x = x.strip()
    if x in (".", ".."): return None, ("ei avaldata (ebakindel)" if x == "." else "andmed puuduvad")
    if x == "": return None, "andmed puuduvad (periood pole veel möödas)"
    return float(x), ""
REG = {"Eesti":"Eesti","Kogu Eesti":"Eesti","Harju maakond":"Harju maakond","HARJU MAAKOND":"Harju maakond","Järva maakond":"Järva maakond","JÄRVA MAAKOND":"Järva maakond",
       "Rapla maakond":"Rapla maakond","RAPLA MAAKOND":"Rapla maakond","..Kehtna vald":"Kehtna vald","..Kohila vald":"Kohila vald","..Märjamaa vald":"Märjamaa vald","..Rapla vald":"Rapla vald",
       "Kehtna vald":"Kehtna vald","Kohila vald":"Kohila vald","Märjamaa vald":"Märjamaa vald","Rapla vald":"Rapla vald","Kesk-Eesti":"Kesk-Eesti (Järva, Lääne-Viru, Rapla)"}
FILTERS = {
 "TT4645":"Näitaja: kõik; Piirkond: Eesti, Harju, Järva, Rapla maakond; Vanuserühm: 15–74, 16–pensioniiga, 20–64; 2015–2025",
 "TT4661":"Isikute rühm: mehed, naised, 15–24, 25–49, 50–74, 15–64; 2015–2025",
 "TT443":"Maakond: Eesti, Harju, Järva, Rapla; 2019–2024 (iga aasta = see ja kaks eelnevat aastat)",
 "TT241":"Elukoht: kokku; Majandussektor: kõik; 2015–2025",
 "TT065":"Sugu: mehed ja naised; Vanuserühm: kokku, 16–24, 25–54, 55+; Kuu: kuude keskmine 2015–2026 ja kuud 2025–2026",
 "PA107":"Haldusüksus: Eesti, Harju, Järva, Rapla mk ja 4 valda; 2021–2025",
 "PA117":"Sama; 2025 I–II kv ja 2026 I–II kv",
 "TT4660":"Piirkond: Eesti, Kesk-Eesti; Isikute rühm: kokku, 20–64; 2025 I–II kv, 2026 I–II kv",
 "RV06U":"Haldusüksus: Eesti, Harju, Järva, Rapla mk, 4 valda; 2017–2026",
 "UA08":"Elukoht: Eesti, Harju, Järva, Rapla mk, 4 valda; Näitaja: isikute arv, eurot isiku kohta; Tulu liik: tööga seotud tulu; 2018–2024",
 "RL21163":"Sugu: kokku; Elukoht: Eesti, Harju, Järva, Rapla mk, 4 valda; 31.12.2021",
 "RL21166":"Elukoht: Rapla maakond; Sugu: kokku; Tegevusala: tähetasand; 31.12.2021",
 "RL21147":"Sugu: kokku; Elukoht: Eesti, Harju, Järva, Rapla mk, 4 valda; Tegevusala: tähetasand; 31.12.2021",
 "ER0320":"Haldusüksus: Eesti, Harju, Järva, Rapla mk, 4 valda; 2025",
}
rows = []  # dict(tabel, naitaja, piirkond, ruhm, periood, vaartus, olek)
def add(t, ind, reg, grp, per, val, st):
    rows.append(dict(tabel=t, naitaja=ind, piirkond=REG.get(reg, reg), ruhm=grp, periood=per, vaartus=val, olek=st))
def parse(fn):
    cur = None
    for line in open(os.path.join(D, "raw", fn), encoding="utf-8"):
        line = line.rstrip("\n")
        if not line.strip(): continue
        if line.startswith("##"):
            m = re.match(r"##(\S+) \| (.*) \|\| (.*)", line); cur = (m.group(1), m.group(2).split("|"), [c.strip() for c in m.group(3).split(",")]); continue
        t, dims, cols = cur
        key, vals = line.split(" || "); key = key.split("|"); vals = vals.split(",")
        yield t, dims, cols, key, vals
for t, dims, cols, key, vals in parse("TT4645.txt"):
    if t == "TT4645": ind, reg, grp = key
    elif t == "TT443": ind, reg = key; grp = "15–74 (3 a libisev keskmine)"
    elif t == "TT241": ind, _, reg, grp = key
    for c, v in zip(cols, vals): val, st = num(v); add(t, ind, reg, grp, c, val, st)
for t, dims, cols, key, vals in parse("TT4661_sugu_vanus.txt"):
    ind, reg, grp = key
    for c, v in zip(cols, vals): val, st = num(v); add(t, ind, reg, grp, c, val, st)
for t, dims, cols, key, vals in parse("TT065_PA.txt"):
    if t == "TT065":
        _, reg, _, grp = key
        for c, v in zip(cols, vals):
            val, st = num(v); add("TT065", "Registreeritud töötud, kuude keskmine", reg, grp, c + (" (jaan–sept)" if c == "2026" else ""), val, st)
    elif t == "TT065M":
        yr, reg, _, grp = key
        for c, v in zip(cols, vals):
            if c == "Kuude keskmine": continue
            val, st = num(v); add("TT065", "Registreeritud töötud, kuu", reg, grp, yr + "-" + c, val, st)
    else:
        ind, reg = key[0], key[1]; grp = "16–pensioniiga" if t == "TT4660" and False else (key[2] if len(key) > 2 else "")
        for c, v in zip(cols, vals): val, st = num(v); add(t, ind, reg, grp, c, val, st)
for t, dims, cols, key, vals in parse("RV_UA_RL_ER.txt"):
    if t == "RV06U": reg, ind = key; grp = ""
    elif t == "UA08": reg, ind, grp = key
    elif t == "RL21163": _, _, reg = key; ind = "Hõivatud töökoha asukoha järgi"; grp = ""
    elif t == "RL21166": reg = "Rapla maakond"; ind = "Hõivatud töökoha asukoha järgi"; grp = key[0]
    elif t == "RL21147": grp = key[0]; ind = "Hõivatud elukoha järgi"
    elif t == "ER0320": reg = key[0]; ind = "Ettevõtete arv"; grp = ""
    for c, v in zip(cols, vals):
        val, st = num(v)
        if t == "RL21147": add(t, ind, c, grp, "31.12.2021", val, st)
        elif t in ("RL21163", "RL21166"): add(t, ind + ": " + c, reg, grp, "31.12.2021", val, st)
        elif t == "ER0320": add(t, ind + ", töötajaid " + c, reg, grp, "2025", val, st)
        else: add(t, ind, reg, grp, c, val, st)
# ---------- väljund: CSV ja XLSX ----------
OUT = os.path.join(D, "out"); os.makedirs(OUT, exist_ok=True)
hdr = ["tabel", "naitaja", "piirkond", "ruhm", "periood", "vaartus", "olek", "allikas_url", "andmebaasi_uuendus", "paritud", "filtrid"]
with open(os.path.join(OUT, "raplamaa_tooturg_alusandmed.csv"), "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f, delimiter=";"); w.writerow(hdr)
    for r in rows: w.writerow([r["tabel"], r["naitaja"], r["piirkond"], r["ruhm"], r["periood"], "" if r["vaartus"] is None else str(r["vaartus"]).replace(".", ","), r["olek"], url(r["tabel"]), META[r["tabel"]][1], FETCH, FILTERS[r["tabel"]]])
print("ridu", len(rows))
# ---------- abifunktsioonid analüüsiks ----------
def get(t, ind, reg, grp, per):
    for r in rows:
        if r["tabel"] == t and r["naitaja"] == ind and r["piirkond"] == reg and r["ruhm"] == grp and r["periood"] == per: return r["vaartus"]
    raise KeyError((t, ind, reg, grp, per))
Y = [str(y) for y in range(2015, 2026)]
REGS = ["Eesti", "Harju maakond", "Järva maakond", "Rapla maakond"]
VALLAD = ["Kehtna vald", "Kohila vald", "Märjamaa vald", "Rapla vald"]
def ser(t, ind, reg, grp, years=Y): return {y: get(t, ind, reg, grp, y) for y in years}
J = {"fetched": FETCH, "meta": {t: {"url": url(t), "upd": META[t][1], "desc": META[t][2], "filt": FILTERS[t]} for t in META}}
A = "15 kuni 74 aastat"
J["emp"] = {r: ser("TT4645", "Tööhõive määr, %", r, A) for r in REGS}
J["emp2064"] = {r: ser("TT4645", "Tööhõive määr, %", r, "20 kuni 64 aastat", Y[3:]) for r in REGS}
J["part"] = {r: ser("TT4645", "Tööjõus osalemise määr, %", r, A) for r in REGS}
J["unemp"] = {r: ser("TT4645", "Töötuse määr, %", r, A) for r in REGS}
J["unemp3"] = {r: ser("TT443", "Töötuse määr, %", r, "15–74 (3 a libisev keskmine)", [str(y) for y in range(2019, 2025)]) for r in REGS}
J["nemp"] = {r: ser("TT4645", "Hõivatute arv, tuhat", r, A) for r in REGS}
J["nlab"] = {r: ser("TT4645", "Tööjõud, tuhat", r, A) for r in REGS}
J["nun"] = {r: ser("TT4645", "Töötute arv, tuhat", r, A) for r in REGS}
J["npop"] = {r: ser("TT4645", "Tööjõud ja mitteaktiivsed kokku, tuhat", r, A) for r in REGS}
J["sex"] = {r: {g: ser("TT4661", "Tööhõive määr, %", r, g) for g in ["Mehed", "Naised"]} for r in REGS}
J["age"] = {r: {g: ser("TT4661", "Tööhõive määr, %", r, g) for g in ["15-24-aastased", "25-49-aastased", "50-74-aastased"]} for r in REGS}
J["sect"] = {r: {g: ser("TT241", "Hõivatute arv, tuhat", r, g) for g in ["Põllumajandus, metsamajandus ja kalapüük", "Tööstus ja ehitus", "Teenused", "Kokku – kõik tegevusalad"]} for r in REGS}
RY = [str(y) for y in range(2015, 2026)]
J["reg"] = {r: {g: ser("TT065", "Registreeritud töötud, kuude keskmine", r, g, RY) for g in ["Vanuserühmad kokku", "16-24", "25-54", "55 ja vanemad"]} for r in REGS + VALLAD}
MON = ["Jaanuar", "Veebruar", "Märts", "Aprill", "Mai", "Juuni", "Juuli", "August", "September", "Oktoober", "November", "Detsember"]
J["regm"] = {r: {yr: [get("TT065", "Registreeritud töötud, kuu", r, "Vanuserühmad kokku", yr + "-" + m) for m in MON] for yr in ["2025", "2026"]} for r in REGS + VALLAD}
PY = ["2021", "2022", "2023", "2024", "2025"]
J["wage"] = {r: ser("PA107", "Keskmine brutokuupalk, eurot", r, "", PY) for r in REGS + VALLAD}
J["wmed"] = {r: ser("PA107", "Brutokuupalga mediaan (V detsiil), eurot", r, "", PY) for r in REGS + VALLAD}
J["jobs"] = {r: ser("PA107", "Töötajate arv", r, "", PY) for r in REGS + VALLAD}
QY = ["2025 I kvartal", "2025 II kvartal", "2026 I kvartal", "2026 II kvartal"]
J["wq"] = {r: ser("PA117", "Keskmine brutokuupalk, eurot", r, "", QY) for r in REGS + VALLAD}
J["jq"] = {r: ser("PA117", "Töötajate arv", r, "", QY) for r in REGS + VALLAD}
J["etuq"] = {r: {k: ser("TT4660", k, r, "Kokku", QY) for k in ["Tööhõive määr, %", "Tööjõus osalemise määr, %", "Hõivatute arv, tuhat"]} for r in ["Eesti", "Kesk-Eesti (Järva, Lääne-Viru, Rapla)"]}
for r in ["Eesti", "Kesk-Eesti (Järva, Lääne-Viru, Rapla)"]: J["etuq"][r]["Tööhõive määr 20–64, %"] = ser("TT4660", "Tööhõive määr, %", r, "20-64-aastased", QY)
RVY = [str(y) for y in range(2017, 2027)]
J["dli"] = {r: ser("RV06U", "Demograafiline tööturusurveindeks", r, "", RVY) for r in REGS + VALLAD}
UY = [str(y) for y in range(2018, 2025)]
J["inc"] = {r: ser("UA08", "Eurot isiku kohta", r, "Tööga seotud tulu", UY) for r in REGS + VALLAD}
J["incn"] = {r: ser("UA08", "Isikute arv", r, "Tööga seotud tulu", UY) for r in REGS + VALLAD}
COMK = ["Kokku", "Tallinnas", "Tartus", "Elukoha maakonnas", "Samas KOV", "Erinevas KOV samas mk", "Erinevas maakonnas", "Välismaal"]
J["com"] = {r: {k: get("RL21163", "Hõivatud töökoha asukoha järgi: " + k, r, "", "31.12.2021") for k in COMK} for r in REGS + VALLAD}
SECTS = [r["ruhm"] for r in rows if r["tabel"] == "RL21166" and r["naitaja"].endswith(": Kokku")]
J["comsec"] = {s: {k: get("RL21166", "Hõivatud töökoha asukoha järgi: " + k, "Rapla maakond", s, "31.12.2021") for k in COMK if k!="Tartus"} for s in SECTS}
J["secv"] = {s: {r: get("RL21147", "Hõivatud elukoha järgi", r, s, "31.12.2021") for r in REGS + VALLAD} for s in SECTS}
J["ent"] = {r: {k: get("ER0320", "Ettevõtete arv, töötajaid " + k, r, "", "2025") for k in ["Kokku", "<10", "10-49", "50-249", "250-749", "750+"]} for r in REGS + VALLAD}
# rahvastik 15–64 (mudeli rahvastikufail, Statistikaamet RV0240 1. jaan) -> registreeritud töötute osakaal (tuletatud, mitte Töötukassa ametlik registreeritud töötuse määr)
POP = json.load(open(os.path.join(D, "..", "..", "data", "pop.json"), encoding="utf-8"))  # vanuserühmad ilma kogusummata
PK = {"Rapla maakond": "MAAK", "Kehtna vald": "Kehtna", "Kohila vald": "Kohila", "Märjamaa vald": "Marjamaa", "Rapla vald": "Rapla"}
def p1564(k, y): a = POP[k]["age"][y]; return sum(a[3:13])  # rühmad 15-19 ... 60-64
J["p1564"] = {r: {y: p1564(PK[r], y) for y in [str(x) for x in range(2015, 2027)]} for r in PK}
J["regsh"] = {}
for r in PK:
    J["regsh"][r] = {}
    for y in RY:
        v = J["reg"][r]["Vanuserühmad kokku"][y]; J["regsh"][r][y] = round(100 * v / J["p1564"][r][y], 2)
    # 2026 jaan–sept keskmine 1.01.2026 rahvastiku suhtes
    m26 = [x for x in J["regm"][r]["2026"] if x is not None]; J["regsh"][r]["2026 (jaan–sept)"] = round(100 * (sum(m26) / len(m26)) / J["p1564"][r]["2026"], 2)
json.dump(J, open(os.path.join(OUT, "toostat.json"), "w"), ensure_ascii=False, indent=0)
sys.path.insert(0, os.path.join(D, "..", "..", "tools")); import datafmt
datafmt.write(os.path.join(D, "..", "..", "data", "too.json"), J)
print("ok", len(SECTS))
