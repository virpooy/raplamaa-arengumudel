"""Tõstab pipeline/out/<nimi>.json kausta data/ ühtses vormingus ja märgib pärimise aja faili data/fetched.json.
Käivita ainult siis, kui pipeline/run.mjs lõppes koodiga 0. Kasutus: python3 tools/apply.py pop"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import datafmt

name = sys.argv[1]
rep = json.load(open(os.path.join(ROOT, 'pipeline', 'out', name + '.report.json'), encoding='utf-8'))
if rep['err']:
    sys.exit('Aruandes on vigu, andmeid ei rakendata.')
data = json.load(open(os.path.join(ROOT, 'pipeline', 'out', name + '.json'), encoding='utf-8'))
datafmt.write(os.path.join(ROOT, 'data', name + '.json'), data)
fp = os.path.join(ROOT, 'data', 'fetched.json')
f = json.load(open(fp, encoding='utf-8')) if os.path.exists(fp) else {}
f[name] = {'fetched': rep['fetched'], 'src': rep['src']}
datafmt.write(fp, dict(sorted(f.items())))
print(name, 'rakendatud;', 'muutus' if rep['changed'] else 'muutust ei olnud')
