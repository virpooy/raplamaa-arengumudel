# -*- coding: utf-8 -*-
"""Ökonomeetria · korrelatsioonid: 79 omavalitsuse ristlõike andmestik kanga jaoks.
Sisend: raw/kov79.txt ja ../data/peers.json (mõlemad: pipeline/stat_econ.mjs, Statistikaamet; perioodid econ/periood.json).
Väljund: ../data/econ.json (window.ECON), out/econ79.csv. Puuduvaid väärtusi ei asendata (None -> null)."""
import sys,json, math, os, csv
D = os.path.dirname(os.path.abspath(__file__))
FETCH = os.environ.get("ECON_FETCH", "2026-10-17")  # pärimise kuupäev (aastane uuendus annab selle ette)
_PE = json.load(open(os.path.join(D, "..", "data", "peers.json"), encoding="utf-8"))  # võrdlusnäitajad RR300-st (pipeline/stat_econ.mjs)
P = {"K": _PE["K"], "rows": [[r[0], r[1:]] for r in _PE["R"]]}
KOV = [r[0] for r in P["rows"]]
PK = P["K"]
F = ['p19','p25','c19','c25','w19','w25','o19','o25','MIG','B','DD','uan19','uan24','uae19','uae24','wg21','wg25','em21','em25','ent25','dli19','dli25','reg19','reg25']
R = {}
for line in open(os.path.join(D, "raw", "kov79.txt"), encoding="utf-8"):
    i, rest = line.strip().split(":", 1)
    vals = rest.split(",")
    assert len(vals) == len(F), (i, len(vals))
    R[int(i)] = {f: (float(v) if v != "" else None) for f, v in zip(F, vals)}
assert sorted(R) == list(range(79))
CPI = {2016:195.338,2017:202.008,2018:208.943,2019:213.723,2020:212.765,2021:222.659,2022:265.859,2023:290.193,2024:300.413,2025:314.922}
CTY = [("Harju",16),("Hiiu",1),("Ida-Viru",8),("Jõgeva",3),("Järva",3),("Lääne",3),("Lääne-Viru",8),("Põlva",3),("Pärnu",7),("Rapla",4),("Saare",3),("Tartu",8),("Valga",3),("Viljandi",4),("Võru",5)]
cty = []
for n, k in CTY: cty += [n]*k
assert len(cty) == 79
assert KOV[52:56] == ["Kehtna vald","Kohila vald","Märjamaa vald","Rapla vald"]
def pk(i, k):
    v = P["rows"][i][1][PK.index(k)]
    return None if v is None else float(v)
def dv(a, b, f=lambda a,b:a/b):
    return None if a is None or b is None or b == 0 else f(a, b)
def r2(x, n=4):
    return None if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))) else round(x, n)

ST = "Statistikaamet"
U = "https://andmed.stat.ee/et/stat/"
SRC = {
 "RV0240": (U+"rahvastik__rahvastikunaitajad-ja-koosseis__rahvaarv-ja-rahvastiku-koosseis/RV0240", "Rahvastik soo, vanuse ja elukoha järgi, 1. jaanuar"),
 "RVR02": (U+"rahvastik__rahvastikusundmused__ranne/RVR02", "Ränne haldusüksuse, soo ja rände liigi järgi"),
 "RV112U": (U+"rahvastik__rahvastikusundmused__sunnid/RV112U", "Elussündinud soo ja haldusüksuse järgi"),
 "RV49U": (U+"rahvastik__rahvastikusundmused__surmad/RV49U", "Surnud soo ja haldusüksuse järgi"),
 "UA08": (U+"eri-valdkondade-statistika__eksperimentaalstatistika__EUROMOD/UA08", "Tööga seotud tulu elukoha (omavalitsus) järgi (eksperimentaalstatistika)"),
 "PA107": (U+"majandus__palk-ja-toojeukulu__palk__aastastatistika/PA107", "Keskmine brutokuupalk ja töötajate arv haldusüksuse järgi"),
 "ER0320": (U+"majandus__majandusuksused__ettevetjad/ER0320", "Statistilisse profiili kuuluvad ettevõtted haldusüksuse järgi"),
 "RV06U": (U+"rahvastik__rahvastikunaitajad-ja-koosseis__demograafilised-pehinaitajad/RV06U", "Demograafiline tööturusurveindeks"),
 "TT065": (U+"sotsiaalelu__tooturg__tootud__luhiajastatistika/TT065", "Registreeritud töötud haldusüksuse järgi (Töötukassa register), kuude keskmine"),
 "IA002": (U+"majandus__hinnad__tarbijahinnaindeks/IA002", "Tarbijahinnaindeks, aastakeskmine"),
 "RR300": (U+"majandus__rahandus__valitsemissektori-rahandus__kohalike-omavalitsuste-eelarve/RR300", "Kohalike eelarvete põhitegevuse tulud, kulud ja tulem (kanga Eesti võrdlus)"),
}
# muutujad: k, nimi, rühm, ühik, liik, nominaalne?, allikad, periood, definitsioon, väärtused (algus, lõpp) või (None, väärtus)
V = []
def add(k, n, g, u, kind, nom, src, per, de, v0=None, v1=None, y0=None, y1=None, dir=0, why=""):
    V.append(dict(k=k, n=n, g=g, u=u, kind=kind, nom=nom, src=src, per=per, de=de, y0=y0, y1=y1,
                  v0=[r2(x) for x in v0] if v0 else None, v1=[r2(x) for x in v1], dir=dir, why=why))
rng = range(79)
x = lambda f: [f(R[i], i) for i in rng]
# Rahvastik ja ränne
add("pop","Rahvaarv","rahv","inimest","kogus",False,["RV0240"],"1.1.2019 / 1.1.2025","Rahvaarv 1. jaanuaril. Seostes kasutatakse logaritmi (suurusefekt).",
    x(lambda r,i:r['p19']), x(lambda r,i:r['p25']), 2019, 2025)
add("popChg","Rahvaarvu muutus 2019–2025","rahv","%","muutus",False,["RV0240"],"1.1.2019→1.1.2025","(rahvaarv 2025 / rahvaarv 2019 − 1) × 100",
    None, x(lambda r,i:dv(r['p25'],r['p19'],lambda a,b:(a/b-1)*100)), None, 2025, dir=1)
add("netMig","Rändesaldo","rahv","‰ aastas","määr",False,["RVR02","RV0240"],"2019–2024","Sise- ja välisrände saldo kokku 2019–2024 jagatud 6 aasta ja 2019. a rahvaarvuga, × 1000.",
    None, x(lambda r,i:dv(r['MIG'],r['p19'],lambda a,b:a/6/b*1000)), None, 2024, dir=1)
add("natInc","Loomulik iive","rahv","‰ aastas","määr",False,["RV112U","RV49U","RV0240"],"2019–2024","(sünnid − surmad) 2019–2024 / 6 / rahvaarv 2019 × 1000",
    None, x(lambda r,i:dv(None if r['B'] is None or r['DD'] is None else r['B']-r['DD'],r['p19'],lambda a,b:a/6/b*1000)), None, 2024, dir=1)
add("birth","Sündimus","rahv","‰ aastas","määr",False,["RV112U","RV0240"],"2019–2024","elussündinud 2019–2024 / 6 / rahvaarv 2019 × 1000",
    None, x(lambda r,i:dv(r['B'],r['p19'],lambda a,b:a/6/b*1000)), None, 2024)
# Vanuseline koosseis
add("sh017","0–17-aastaste osakaal","vanus","%","osakaal",False,["RV0240"],"1.1.2019 / 1.1.2025","0–17-aastased / rahvaarv × 100",
    x(lambda r,i:dv(r['c19'],r['p19'],lambda a,b:a/b*100)), x(lambda r,i:dv(r['c25'],r['p25'],lambda a,b:a/b*100)), 2019, 2025)
add("sh65","65+ osakaal","vanus","%","osakaal",False,["RV0240"],"1.1.2019 / 1.1.2025","65-aastased ja vanemad / rahvaarv × 100",
    x(lambda r,i:dv(r['o19'],r['p19'],lambda a,b:a/b*100)), x(lambda r,i:dv(r['o25'],r['p25'],lambda a,b:a/b*100)), 2019, 2025)
add("sh65Chg","65+ osakaalu muutus","vanus","pp","muutus",False,["RV0240"],"2019→2025","65+ osakaal 2025 − 65+ osakaal 2019 (protsendipunkti)",
    None, x(lambda r,i:None if None in (r['o19'],r['p19'],r['o25'],r['p25']) else (r['o25']/r['p25']-r['o19']/r['p19'])*100), None, 2025)
add("dli","Tööturusurveindeks","vanus","indeks","indeks",False,["RV06U"],"1.1.2019 / 1.1.2025","5–14-aastaste arv / 55–64-aastaste arv. Üle 1 = tööturule tulijaid rohkem kui lahkujaid.",
    x(lambda r,i:r['dli19']), x(lambda r,i:r['dli25']), 2019, 2025, dir=1)
# Töö ja sissetulek
add("earn","Tööga seotud tuluga isikud 18–64-aastaste kohta","too","%","määr %",False,["UA08","RV0240"],"2019 / 2024",
    "Tööga seotud tuluga isikute arv aasta jooksul / 18–64-aastased (2019: 1.1.2019; 2024: 1.1.2025 ehk aasta lõpp) × 100. Lugejas on ka alla 18- ja üle 64-aastased, seega on see hõive ligikaudne näitaja, mitte hõivemäär.",
    x(lambda r,i:dv(r['uan19'],r['w19'],lambda a,b:a/b*100)), x(lambda r,i:dv(r['uan24'],r['w25'],lambda a,b:a/b*100)), 2019, 2024, dir=1)
add("inc","Tööga seotud tulu isiku kohta","too","€ aastas","tulu saaja kohta",True,["UA08"],"2019 / 2024","Tööga seotud tulu (palk, ettevõtlustulu jm) eurot isiku kohta aastas, nominaalne.",
    x(lambda r,i:r['uae19']), x(lambda r,i:r['uae24']), 2019, 2024, dir=1)
add("incChgR","Tööga seotud tulu reaalkasv","too","%","muutus",False,["UA08","IA002"],"2019→2024","(tulu 2024 / tulu 2019) / (THI 2024 / THI 2019) − 1, × 100. Inflatsiooniga korrigeeritud.",
    None, x(lambda r,i:dv(r['uae24'],r['uae19'],lambda a,b:(a/b/(CPI[2024]/CPI[2019])-1)*100)), None, 2024, dir=1)
add("wage","Keskmine brutokuupalk (töökoha järgi)","too","€ kuus","töötaja kohta",True,["PA107"],"2021 / 2025","Keskmine brutokuupalk haldusüksuses asuvatel töökohtadel, nominaalne.",
    x(lambda r,i:r['wg21']), x(lambda r,i:r['wg25']), 2021, 2025, dir=1)
add("jobs","Töötajaid töökoha järgi 18–64-aastaste kohta","too","%","määr %",False,["PA107","RV0240"],"2025","Töötajate arv haldusüksuse töökohtadel (PA107) / 18–64-aastased elanikud 1.1.2025 × 100. Suur väärtus = palju töökohti elanike kohta.",
    None, x(lambda r,i:dv(r['em25'],r['w25'],lambda a,b:a/b*100)), None, 2025, dir=1)
add("reg","Registreeritud töötud 18–64-aastaste kohta","too","%","määr %",False,["TT065","RV0240"],"2019 / 2025","Registreeritud töötute kuude keskmine / 18–64-aastased 1. jaanuaril × 100. Ei ole ETU töötuse määr.",
    x(lambda r,i:dv(r['reg19'],r['w19'],lambda a,b:a/b*100)), x(lambda r,i:dv(r['reg25'],r['w25'],lambda a,b:a/b*100)), 2019, 2025, dir=-1, why="töötuse kasv on ebasoodne")
add("regChg","Registreeritud töötute osakaalu muutus","too","pp","muutus",False,["TT065","RV0240"],"2019→2025","reg 2025 − reg 2019 (protsendipunkti)",
    None, x(lambda r,i:None if None in (r['reg19'],r['w19'],r['reg25'],r['w25']) else (r['reg25']/r['w25']-r['reg19']/r['w19'])*100), None, 2025, dir=-1, why="töötuse kasv on ebasoodne")
# Ettevõtlus
add("ent","Ettevõtteid 1000 elaniku kohta","ettev","ettevõtet","elaniku kohta",False,["ER0320","RV0240"],"2025","Statistilisse profiili kuuluvad ettevõtted / rahvaarv 1.1.2025 × 1000",
    None, x(lambda r,i:dv(r['ent25'],r['p25'],lambda a,b:a/b*1000)), None, 2025, dir=1)
# KOV tulud ja kulud (kanga Eesti võrdlus, RR300)
pe = lambda k, f=lambda v,i:v: [None if pk(i,k) is None else f(pk(i,k),i) for i in rng]
add("tm","Tulumaks elaniku kohta","kovt","€","elaniku kohta",True,["RR300"],"2025","Omavalitsusele laekunud füüsilise isiku tulumaks / rahvaarv, nominaalne.",None,pe("tmPerCap"),None,2025,dir=1)
add("tulCAGR","Põhitegevuse tulude kasv aastas","kovt","% aastas","muutus",True,["RR300"],"2021–2025","Põhitegevuse tulude keskmine aastakasv, nominaalne. Reaalkasv = (1+kasv)/(THI 2025/THI 2021)^(1/4) − 1.",None,pe("tuludCAGR",lambda v,i:v*100),None,2025)
add("fond","Toetusfondi ja tasandusfondi osakaal tuludest","kovt","%","osakaal",False,["RR300"],"2025","Riigi toetuste osakaal põhitegevuse tuludest (kanga Eesti võrdluse „fondide osakaal”).",None,pe("fondid",lambda v,i:v*100),None,2025)
add("myyk","Kaupade ja teenuste müük elaniku kohta","kovt","€","elaniku kohta",True,["RR300"],"2025","Omavalitsuse kaupade ja teenuste müügitulu (nt kohatasud, üür) / rahvaarv.",None,pe("myykPerCap"),None,2025)
add("kulud","Põhitegevuse kulud elaniku kohta","kovk","€","elaniku kohta",True,["RR300"],"2025","Põhitegevuse kulud / rahvaarv, nominaalne.",None,pe("kuludPerCap"),None,2025)
add("kulCAGR","Põhitegevuse kulude kasv aastas","kovk","% aastas","muutus",True,["RR300"],"2021–2025","Põhitegevuse kulude keskmine aastakasv, nominaalne.",None,pe("kuludCAGR",lambda v,i:v*100),None,2025)
add("persCAGR","Personalikulude kasv aastas","kovk","% aastas","muutus",True,["RR300"],"2021–2025","Personalikulude keskmine aastakasv, nominaalne.",None,pe("persCAGR",lambda v,i:v*100),None,2025)
add("sots","Sotsiaaltoetused elaniku kohta","kovk","€","elaniku kohta",True,["RR300"],"2025","Sotsiaalabitoetused ja muud toetused füüsilistele isikutele / rahvaarv.",None,pe("sotsPerCap"),None,2025)
add("inv","Investeeringud elaniku kohta","kovk","€","elaniku kohta",True,["RR300"],"2025","Põhivara soetus / rahvaarv (kanga Eesti võrdlus).",None,pe("invPerCap"),None,2025,dir=1)
add("tulem","Põhitegevuse tulem, % tuludest","kovk","%","osakaal",False,["RR300"],"2021–2025 keskmine","Põhitegevuse tulem / põhitegevuse tulud, 2021–2025 keskmine.",None,pe("tulem5a",lambda v,i:v*100),None,2025,dir=1)
add("fin","Finantskulud, % tuludest","kovk","%","osakaal",False,["RR300"],"2025","Intressid jm finantskulud / põhitegevuse tulud.",None,pe("finKulu",lambda v,i:v*100),None,2025,dir=-1,why="suurem intressikoormus vähendab vaba raha")
add("laen","Võetud laenud elaniku kohta aastas","kovk","€ aastas","elaniku kohta",True,["RR300"],"2021–2025","Kohustuste võtmine 2021–2025 kokku / 5 / rahvaarv 2025.",None,
    [None if pk(i,"laenV") is None or pk(i,"pop25") in (None,0) else pk(i,"laenV")*1000/5/pk(i,"pop25") for i in rng],None,2025)
GROUPS = [("rahv","Rahvastik ja ränne"),("vanus","Vanuseline koosseis"),("too","Töö ja sissetulek"),("ettev","Ettevõtlus"),("kovt","Omavalitsuse tulud"),("kovk","Omavalitsuse kulud ja laenud")]
# kontrollid
p25p = [pk(i,"pop25") for i in rng]
diff = [i for i in rng if p25p[i] is not None and R[i]['p25'] is not None and abs(p25p[i]-R[i]['p25'])>1]
NEED = [
 {"n":"Lasteaiakohtade arv ja täituvus omavalitsuse kaupa","src":"EHIS / Haridussilm (alushariduse näitajad)","why":"teenuse kättesaadavuse ja lasteaiavõrgu planeerimise jaoks"},
 {"n":"Alushariduse kulu lapse kohta","src":"Rahandusministeeriumi KOV eelarvete andmebaas (tegevusala 09110), lasteaialaste arv EHIS-est","why":"kulutõhususe võrdlus"},
 {"n":"Lasteaia juhtimiskulude osakaal","src":"KOV majandusaasta aruanded / asutuste eelarved (ühtset avalikku tabelit ei ole)","why":"juhtimisstruktuuri võrdlus"},
 {"n":"Teenuste kättesaadavus (vahemaa kooli, perearstini, ühistranspordi sagedus)","src":"Maa- ja Ruumiamet, Tervisekassa, Transpordiamet","why":"teenuste ja rände seos"},
 {"n":"Omavalitsuse kulud tegevusalade kaupa kõigi 79 kohta","src":"RM KOV eelarvete andmebaas (riigiraha.fin.ee)","why":"hariduse, sotsiaal- ja üldvalitsemise kulude eristamiseks"},
 {"n":"Pikem aegrida kõigi 79 kohta (iga aasta 2017–2025)","src":"Statistikaamet (samad tabelid)","why":"paneelmudeli ja ajaliste viidete jaoks; praegu on kasutusel kaks seisu"},
]
META = {"fetched":FETCH,"n":79,"border":"2017. aasta haldusreformi järgne jaotus (79 omavalitsust); Statistikaamet arvutab varasemad aastad praeguste piiride järgi",
        "upd":{"RV0240":"2026-06","RVR02":"2026-05","RV112U":"2026-05","RV49U":"2026-05","UA08":"2026-02-12","PA107":"2026-03-05","ER0320":"2026-01-20","RV06U":"2026-05-19","TT065":"2026-10-14","IA002":"2026-10","RR300":"2026-06-16"},
        "popCheck":"Rahvaarv 2025: Statistikaameti RV0240 ja kanga Eesti võrdluse (RR300 tabelis kasutatud) väärtused kattuvad "+("kõigil 79-l" if not diff else f"{79-len(diff)}/79 omavalitsusel")}
out = {"meta":META,"kov":KOV,"cty":cty,"cpi":CPI,"src":SRC,"groups":GROUPS,"vars":V,"need":NEED}
# väljund: data/econ.json (build.py paneb selle lehele kohatäitja /*@data econ*/ asemele)
sys.path.insert(0,os.path.join(D,"..","tools"));import datafmt
datafmt.write(os.path.join(D,"..","data","econ.json"),out)
os.makedirs(os.path.join(D,"out"),exist_ok=True)
with open(os.path.join(D,"out","econ79.csv"),"w",newline="",encoding="utf-8") as f:
    w=csv.writer(f);cols=[];
    for v in V:
        if v["v0"]: cols.append((v["k"]+"_"+str(v["y0"]),v["v0"]))
        cols.append((v["k"]+"_"+str(v["y1"]),v["v1"]))
    w.writerow(["omavalitsus","maakond"]+[c[0] for c in cols])
    for i in rng: w.writerow([KOV[i],cty[i]]+["" if c[1][i] is None else c[1][i] for c in cols])
print("vars",len(V),"pop diff",[(KOV[i],p25p[i],R[i]['p25']) for i in diff], "bytes",os.path.getsize(os.path.join(D,"..","data","econ.json")))
for v in V:
    miss=sum(1 for z in v["v1"] if z is None); print(f"{v['k']:9s} n={79-miss:2d} min={min(z for z in v['v1'] if z is not None):.2f} max={max(z for z in v['v1'] if z is not None):.2f}")
