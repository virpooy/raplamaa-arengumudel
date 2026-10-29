"""Teeb pipeline aruandest Markdowni kokkuvõtte (GitHubi teate ja töövoo kokkuvõtte jaoks)
ja kirjutab töövoo väljundid: changed, nerr, nwarn. Kasutus: python3 tools/summary.py pop"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
name = sys.argv[1]
p = os.path.join(ROOT, 'pipeline', 'out', name + '.report.json')
if not os.path.exists(p):
    md = f"## {name}: pärimine ebaõnnestus\n\nAruannet ei tekkinud. Vaata töövoo logi."
    rep = {'changed': False, 'err': ['pärimine ebaõnnestus'], 'warn': []}
else:
    rep = json.load(open(p, encoding='utf-8'))
    L = [f"## {name}: {'andmed muutusid' if rep['changed'] else 'muutusi ei ole'}",
         f"Päritud {rep['fetched']}. Allikad: " + ", ".join(f"{k} ({v['years'][0]}–{v['years'][1]})" for k, v in rep['src'].items())]
    if rep['err']:
        L += ["", "### Vead (andmeid ei rakendata)"] + [f"- {x}" for x in rep['err']]
    if rep['warn']:
        L += ["", "### Vaata üle"] + [f"- {x}" for x in rep['warn']]
    md = "\n".join(L)
open(os.path.join(ROOT, 'pipeline', 'out', name + '.summary.md'), 'w', encoding='utf-8').write(md + "\n")
print(md)
gh = os.environ.get('GITHUB_OUTPUT')
if gh:
    with open(gh, 'a') as f:
        f.write(f"changed={'true' if rep['changed'] else 'false'}\nnerr={len(rep['err'])}\nnwarn={len(rep['warn'])}\n")
