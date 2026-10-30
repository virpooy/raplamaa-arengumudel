"""Koondab pipeline/db/*.json kirjed üheks andmebaasiks, võrdleb allikaid ja koostab katvusmaatriksi.
Sisend: fin_<vald>.json (valdade aruanded), stat_fin.json, stat_other.json (Statistikaamet), ../../data/fins.json (mudeli väärtused).
Väljund: ../../data/db.json (kangale), out/db_full.json (täielik), katvus.md (inimloetav kokkuvõte).
Käivita: python3 pipeline/db/build_db.py   (ehitusaeg: keskkonnamuutuja DB_BUILT, vaikimisi tänane)"""
import json, re, collections, datetime, os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join("..", "..", "tools")); import datafmt
V = ['Rapla', 'Kohila', 'Marjamaa', 'Kehtna']
YEARS = list(range(2016, 2027))
FILES = ['fin_Rapla.json', 'fin_Kohila.json', 'fin_Marjamaa.json', 'fin_Kehtna.json', 'stat_fin.json', 'stat_other.json']
recs, docs = [], []
for f in FILES:
    d = json.load(open(f))
    for r in d['records']:
        r['_f'] = f; recs.append(r)
    for x in d.get('docs', []):
        x['_f'] = f; docs.append(x)

def yr(p):
    m = re.match(r'^(\d{4})(-12-31|-01-01)?$', str(p))
    if m: return int(m.group(1))
    m = re.match(r'^(\d{4})/(\d{2})$', str(p))
    if m: return int(m.group(1)) + 1   # õppeaasta 2025/26 -> 2026 (mudeli START)
    return None

FIN = json.load(open('../../data/fins.json'))   # mudeli praegused väärtused (tuh €), 2017..2025
KEYS = ['n1','n2','n3','n4','n9','n10','n11','n12','n19','n20','n22','n26','n27','n29','n30','n32','n33','n42','n43','n45','n46']
NAMES = {'n1':'Põhitegevuse tulud kokku','n2':'Maksutulud','n3':'Tulumaks','n4':'Maamaks','n9':'Kaupade ja teenuste müük','n10':'Saadud toetused tegevuskuludeks','n11':'Tasandusfond','n12':'Toetusfond','n19':'Põhitegevuse kulud kokku','n20':'Antavad toetused tegevuskuludeks','n22':'Sotsiaalabitoetused ja muud toetused füüsilistele isikutele','n26':'Personalikulud','n27':'Majandamiskulud','n29':'Põhitegevuse tulem','n30':'Investeerimistegevus kokku','n32':'Põhivara soetus','n33':'Põhivara soetuseks saadav sihtfinantseerimine','n42':'Finantskulud','n43':'Eelarve tulem','n45':'Kohustuste võtmine','n46':'Kohustuste tasumine'}

def model_val(v, k, y):
    a = FIN.get(v, {}).get(k)
    if not a or y < 2017 or y - 2017 >= len(a): return None
    x = a[y - 2017]
    return None if x is None else x * 1000

# --- statistika (RR300 eelistatult, siis RR30 ümberarvutatud summa) praeguse territooriumi kohta
stat = {}
for r in recs:
    if r['_f'] != 'stat_fin.json' or r.get('kind') != 'statistika' or r.get('territory') != 'praegune': continue
    y = yr(r['period'])
    if y is None or r.get('value') is None: continue
    key = (r['vald'], r['indicator'], y)
    pri = 2 if 'RR300' in r.get('source_name', '') else 1
    if key not in stat or pri > stat[key][0]: stat[key] = (pri, r)
# --- aruanded (täitmine, praegune territoorium; sh eelkäijate ümberarvutatud summa)
rep = {}
for r in recs:
    if not r['_f'].startswith('fin_') or r.get('kind') != 'taitmine' or r.get('territory') != 'praegune': continue
    y = yr(r['period'])
    if y is None or r.get('value') is None: continue
    k = r['indicator']
    if k == 'n22': k = 'n20'   # aruannete „antavad toetused tegevuskuludeks“ = RR300 rida 20 (vt SCHEMA parandus)
    rep[(r['vald'], k, y)] = r

def cls(a, b):
    if a is None or b is None: return None
    d = abs(a - b)
    if d <= 1000: return 'sama'
    if d <= max(0.01 * max(abs(a), abs(b)), 5000): return 'väike'
    return 'erinev'

cmp = []
for v in V:
    for y in range(2016, 2026):
        for k in KEYS:
            s = stat.get((v, k, y)); s = s[1] if s else None
            r = rep.get((v, k, y)); m = model_val(v, k, y)
            if not s and not r and m is None: continue
            sv = s['value'] if s else None; rv = r['value'] if r else None
            row = {'v': v, 'y': y, 'k': k, 'stat': sv, 'rep': rv, 'model': m, 'stat_src': (s or {}).get('source_name', ''), 'rep_src': (r or {}).get('source_name', ''),
                   'rep_page': (r or {}).get('page_table', ''), 'rep_url': (r or {}).get('url', ''), 'rep_check': (r or {}).get('check', ''),
                   'sr': cls(sv, rv), 'sm': cls(sv, m)}
            # mudeli valik: RR300 (KOV üksus, tekkepõhine, ühtne definitsioon kõigil aastatel); aruanne jääb kõrvale võrdluseks
            row['use'] = 'stat' if sv is not None else ('rep' if rv is not None else 'model')
            cmp.append(row)

# --- katvusmaatriks
ST = {'ok': 'olemas ja kontrollitud', 'unc': 'olemas, kontrollimata', 'part': 'osaliselt loetud', 'blk': 'dokument leitud, kuid kättesaamatu',
      'nf': 'andmeid ei leitud', 'np': 'selle aasta kohta ei avaldata', 'cur': 'jooksev aasta või prognoos', 'nc': 'ei kogutud (väljaspool ulatust)'}
cov = {}
def setc(v, dom, y, st, txt):
    cov.setdefault(v, {}).setdefault(dom, {})[str(y)] = [st, txt]

for v in V:
    D = [x for x in docs if x['_f'] == f'fin_{v}.json']
    R = [r for r in recs if r['_f'] == f'fin_{v}.json']
    for y in YEARS:
        # 1. majandusaasta aruanne (finantstabelid)
        if y == 2026:
            setc(v, 'aruanne', y, 'cur', '2026. aasta aruanne ilmub 2027. aastal');
        else:
            dy = [x for x in D if x.get('year') == y and 'majandusaasta' in x.get('doc_type', '')]
            ry = [r for r in R if yr(r['period']) == y and r.get('kind') == 'taitmine']
            ver = [r for r in ry if r.get('check') == 'kontrollitud']
            found = [x for x in dy if x.get('status') in ('loetud täielikult', 'osaliselt loetud')]
            miss = [x for x in dy if x.get('status') in ('ei leitud', 'leitud, kättesaamatu')]
            if found and ver:
                st = 'ok'; txt = f"{len(found)} aruannet leitud; finantstabelid loetud, {len(ver)}/{len(ry)} kirjet kontrollitud (dokument osaliselt loetud: muud peatükid lugemata)"
                if miss: st = 'part'; txt += f"; puudu: {'; '.join(x.get('title','')[:50] for x in miss)}"
            elif found:
                st = 'part'; txt = f"{len(found)} aruannet osaliselt loetud, {len(ry)} kirjet, summad kontrollimata"
            elif ry:
                st = 'nf'; txt = 'aruannet ei leitud; ' + ('täitmine võetud asendusallikast: ' + ry[0].get('source_name','')[:70])
            elif miss:
                st = 'blk' if any(x.get('status') == 'leitud, kättesaamatu' for x in miss) else 'nf'; txt = '; '.join((x.get('title') or '')[:60] + ' — ' + x.get('status','') for x in miss)
            else:
                st = 'nf'; txt = 'aruannet ei leitud'
            setc(v, 'aruanne', y, st, txt)
        # 2. statistika RR300 / RR30
        if y <= 2025:
            n = sum(1 for k in KEYS if (v, k, y) in stat)
            src = 'RR300' if y >= 2018 else 'RR300 (osa ridu) + RR30 eelkäijate summa'
            setc(v, 'rr300', y, 'ok' if n >= 18 else 'part', f"{src}: {n}/{len(KEYS)} rida")
        else:
            p = [r for r in recs if r['_f'] == 'stat_fin.json' and r['vald'] == v and r.get('kind') == 'osaline_taitmine' and str(r['period']).startswith('2026-01..')]
            per = sorted(set(r['period'] for r in p))
            setc(v, 'rr300', y, 'cur', 'riigiraha.fin.ee ' + ', '.join(per) + ' (osaline aasta); MTA tulumaks kuude kaupa')
        # 3. aruanne vs statistika
        if y <= 2025:
            rows = [c for c in cmp if c['v'] == v and c['y'] == y and c['sr']]
            nd = [c for c in rows if c['sr'] == 'erinev']; ns = [c for c in rows if c['sr'] == 'väike']
            if not rows: setc(v, 'vordlus', y, 'nf', 'võrreldavaid paare ei ole')
            else: setc(v, 'vordlus', y, 'ok' if not nd else 'unc', f"{len(rows)-len(nd)-len(ns)} sama, {len(ns)} väike, {len(nd)} erinev" + (": " + ", ".join(c['k'] for c in nd) if nd else ''))
        else: setc(v, 'vordlus', y, 'cur', 'aasta pooleli')
        # 4. eelarve + muudatused
        if y == 2026:
            e = [r for r in R if r.get('kind') == 'esialgne_eelarve']; m = [r for r in R if r.get('kind') == 'muudetud_eelarve']
            lis = [x for x in D if x.get('year') == 2026 and 'lisaeelarve' in x.get('doc_type', '')]
            txt = f"esialgne eelarve {len(e)} rida" + (f"; muudetud eelarve {len(m)} rida" if m else '; lisaeelarvet ' + ('ei leitud' if any(x.get('status') == 'ei leitud' for x in lis) else 'pole'))
            setc(v, 'eelarve', y, 'ok' if e else 'nf', txt)
        else: setc(v, 'eelarve', y, 'nc', 'varasemate aastate eelarveid ei kogutud (täitmine on aruandes ja RR300-s)')
        # 5. 2026 osaline täitmine valla allikast
        if y == 2026:
            p = [r for r in R if r.get('kind') == 'osaline_taitmine']
            per = sorted(set(str(r['period']) for r in p))
            setc(v, 'taitmine26', y, 'cur' if p else 'nf', ('valla allikas: ' + ', '.join(per)) if p else 'vald ei avalda jooksvat täitmist; vt riigiraha')
        else: setc(v, 'taitmine26', y, 'nc', '—')
        # 6. eelarvestrateegia 2026 prognoos
        if y == 2026:
            p = [r for r in R if r.get('kind') == 'strateegia_prognoos']
            setc(v, 'strateegia', y, 'cur' if p else 'nf', f"{len(p)} prognoosirida (ES 2026–2029 ja/või 2027–2030 eelnõu)")
        else: setc(v, 'strateegia', y, 'nc', 'mineviku strateegiaid ei kasutata (tegelik täitmine on olemas)')
        # 7. rahvastik
        O = [r for r in recs if r['_f'] == 'stat_other.json' and r['vald'] == v and yr(r['period']) == y]
        pt = [r for r in O if r['indicator'] == 'pop_tot']
        setc(v, 'rahvastik', y, 'ok' if pt else 'nf', 'RV0282U 1. jaanuar; kattub mudeliga' + ('; sünnid/surmad/ränne RV112U, RV49U, RVR02' if y <= 2025 else '; sündmused 2026 veel puuduvad'))
        # 8. haridus
        ed = [r for r in O if r['indicator'].startswith('edu_res')]
        if ed: setc(v, 'haridus', y, 'unc', f"NH04 õppijad elukoha järgi õppeaastal {y-1}/{str(y)[2:]}" + ('; kooli kaupa 2025/26 (EHIS, mudelis)' if y == 2026 else '; kooli kaupa andmed puuduvad (Haridussilm kättesaamatu)'))
        else: setc(v, 'haridus', y, 'nf', 'NH04 algab 2017/18; kooli kaupa andmed puuduvad')
        # 9. eluruumid
        dn = [r for r in O if r['indicator'] == 'dw_new']
        if y == 2026: setc(v, 'eluruumid', y, 'cur', 'aasta pooleli; EH46U avaldatakse aasta kaupa')
        elif dn: setc(v, 'eluruumid', y, 'ok', 'EH46U uued eluruumid' + (' (EH46 eelkäijate summa)' if y == 2016 else '') + ('; eluruumide fond REL 2021' if y == 2021 else ''))
        else: setc(v, 'eluruumid', y, 'nf', 'uute eluruumide andmeid ei leitud')
        # 10. vesi ja kanalisatsioon
        setc(v, 'vesi', y, 'ok' if y == 2021 else 'np', 'REL 2021 RL21217 (valla tasand)' if y == 2021 else 'valla tasandi aegrida ei avaldata (KK47 ainult maakond)')

DOMS = [('aruanne', 'Majandusaasta aruanne (finantstabelid)'), ('rr300', 'Statistika RR300 / RR30; 2026 riigiraha'), ('vordlus', 'Aruanne ↔ statistika'), ('eelarve', 'Eelarve ja muudatused'),
        ('taitmine26', 'Jooksev täitmine (valla allikas)'), ('strateegia', 'Eelarvestrateegia'), ('rahvastik', 'Rahvastik'), ('haridus', 'Haridus'), ('eluruumid', 'Eluruumid'), ('vesi', 'Vesi ja kanalisatsioon')]

# --- kompaktne päritolu rakendusele: võti vald|näitaja|aasta
src = collections.defaultdict(list)
KIND = {'taitmine': 'täitmine', 'statistika': 'statistika', 'esialgne_eelarve': 'esialgne eelarve', 'muudetud_eelarve': 'muudetud eelarve', 'strateegia_prognoos': 'strateegia prognoos', 'osaline_taitmine': 'osaline täitmine'}
for r in recs:
    if r.get('value') is None: continue
    y = yr(r['period']); per = str(r['period'])
    yy = y if y else (int(per[:4]) if per[:4].isdigit() else None)
    if yy is None or yy < 2016: continue
    k = r['indicator']
    if r['_f'].startswith('fin_') and k == 'n22': k = 'n20'
    src[f"{r['vald']}|{k}|{yy}"].append({'k': KIND.get(r.get('kind'), r.get('kind')), 'per': per, 'v': r['value'], 'u': r.get('unit', ''), 'n': (r.get('source_name') or '')[:120], 'url': r.get('url', ''), 'p': (r.get('page_table') or '')[:80],
                                          'c': r.get('check', ''), 't': r.get('territory', ''), 'sc': r.get('scope', ''), 'no': (r.get('notes') or '')[:240], 'ret': r.get('retrieved', '')})

# --- mudeli täiendus: 2016 ja 2017 puuduvad read (praegune territoorium, statistika), väärtus eurodes
fill = {}
for (v, k, y), (pri, r) in stat.items():
    if y in (2016, 2017) and k in KEYS:
        if y == 2017 and model_val(v, k, y) is not None: continue
        fill.setdefault(v, {}).setdefault(k, {})[y] = {'v': r['value'], 'src': 'RR300' if pri == 2 else ('RR30 eelkäijate summa (ümberarvutatud)' if ('ümberarvut' in (r.get('source_name','')+r.get('notes','')) and v!='Kohila') else 'RR30')}
# n20 kõigile aastatele (mudelis puudus)
for (v, k, y), (pri, r) in stat.items():
    if k == 'n20': fill.setdefault(v, {}).setdefault('n20', {})[y] = {'v': r['value'], 'src': 'RR300' if pri == 2 else ('RR30 eelkäijate summa (ümberarvutatud)' if ('ümberarvut' in (r.get('source_name','')+r.get('notes','')) and v!='Kohila') else 'RR30')}
# --- 2026 osaline täitmine (riigiraha / MTA) ja 2025 sama periood
part = {}
for r in recs:
    if r.get('kind') != 'osaline_taitmine' or r.get('value') is None: continue
    per = str(r['period']); k = r['indicator']
    if r['_f'].startswith('fin_') and k == 'n22': k = 'n20'
    part.setdefault(r['vald'], {}).setdefault(k, []).append({'per': per, 'v': r['value'], 'n': (r.get('source_name') or '')[:90], 'f': r['_f'].replace('.json', '')})

cnt = collections.Counter(c['sr'] for c in cmp if c['sr'])
cntm = collections.Counter(c['sm'] for c in cmp if c['sm'])
meta = {'built': os.environ.get('DB_BUILT') or datetime.date.today().isoformat(), 'records': len(recs), 'docs': len(docs), 'cmp_rep_stat': dict(cnt), 'cmp_model_stat': dict(cntm)}
os.makedirs('out', exist_ok=True)
json.dump({'meta': meta, 'cov': cov, 'doms': DOMS, 'st': ST, 'cmp': cmp, 'docs': [{k: x.get(k) for k in ('vald', 'year', 'doc_type', 'title', 'url', 'status', 'read_scope', 'notes')} for x in docs]}, open(os.path.join('out', 'db_full.json'), 'w'), ensure_ascii=False, indent=0)
app = {'meta': meta, 'cov': cov, 'doms': DOMS, 'st': ST, 'src': src, 'fill': fill, 'part': part,
       'cmp': [{k: c[k] for k in ('v', 'y', 'k', 'stat', 'rep', 'model', 'sr', 'sm', 'rep_src', 'rep_page', 'rep_url', 'rep_check')} for c in cmp],
       'docs': [{k: (x.get(k) or '')[:300] if isinstance(x.get(k), str) else x.get(k) for k in ('vald', 'year', 'doc_type', 'title', 'url', 'status', 'read_scope')} for x in docs], 'names': NAMES}
datafmt.write(os.path.join('..', '..', 'data', 'db.json'), app, compact=True)
js = json.dumps(app, ensure_ascii=False)
# inimloetav kokkuvõte
L = ['# Katvusmaatriks 2016–2026', '', f"Kirjeid {len(recs)}, dokumente {len(docs)}. Aruanne vs RR300: {dict(cnt)}. Mudel vs RR300: {dict(cntm)}.", '']
for v in V:
    L.append(f"## {v}"); L.append('| valdkond | ' + ' | '.join(map(str, YEARS)) + ' |'); L.append('|---' * (len(YEARS) + 1) + '|')
    for d, dn in DOMS: L.append(f"| {dn} | " + ' | '.join(cov[v][d][str(y)][0] for y in YEARS) + ' |')
    L.append('')
open('katvus.md', 'w').write('\n'.join(L))
print(meta, 'js bytes', len(js))
diff = [c for c in cmp if c['sr'] == 'erinev']
print('erinev rep/stat:', len(diff)); [print(' ', c['v'], c['y'], c['k'], c['stat'], c['rep'], c['rep_src'][:40]) for c in diff[:60]]
print('model vs stat erinev:', [(c['v'], c['y'], c['k'], c['stat'], c['model']) for c in cmp if c['sm'] in ('erinev', 'väike')][:30])
