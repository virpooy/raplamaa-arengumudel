"""Andmete uuendamise juhtskript (GitHub Actions ja käsitsi): python3 tools/update.py pop ext
Iga andmestiku jaoks: node pipeline/run.mjs <nimi> -> kui vigu pole, tools/apply.py <nimi>.
Kirjutab pipeline/out/summary.md ja töövoo väljundid: changed, nerr, nwarn, failed.
Järjekord on oluline: ext arvutab rände saldod juba uuendatud pop.json-ist."""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'pipeline', 'out'); os.makedirs(OUT, exist_ok=True)
names = sys.argv[1:] or ['pop', 'ext']
md, changed, nerr, nwarn, failed = [], [], 0, 0, []
for n in names:
    code = subprocess.run(['node', os.path.join(ROOT, 'pipeline', 'run.mjs'), n]).returncode
    rp = os.path.join(OUT, n + '.report.json')
    if code == 1 or not os.path.exists(rp):
        failed.append(n); md.append(f"## {n}: pärimine ebaõnnestus\nAndmeid ei muudetud. Vaata töövoo logi."); continue
    rep = json.load(open(rp, encoding='utf-8'))
    L = [f"## {n}: {'andmed muutusid' if rep['changed'] else 'muutusi ei ole'}", f"Päritud {rep['fetched']}."]
    if rep['err']:
        L += ["", "### Vead (andmeid ei rakendata)"] + [f"- {x}" for x in rep['err']]
    if rep['warn']:
        L += ["", "### Vaata üle"] + [f"- {x}" for x in rep['warn']]
    md.append("\n".join(L))
    nerr += len(rep['err'])
    if not rep['err']:
        nwarn += len(rep['warn'])
        if rep['changed']:
            subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'apply.py'), n], check=True)
            changed.append(n)
text = "\n\n".join(md) + "\n"
open(os.path.join(OUT, 'summary.md'), 'w', encoding='utf-8').write(text)
print(text)
gh = os.environ.get('GITHUB_OUTPUT')
if gh:
    with open(gh, 'a') as f:
        f.write(f"changed={'true' if changed else 'false'}\nchanged_list={','.join(changed)}\nnerr={nerr}\nnwarn={nwarn}\nfailed={','.join(failed)}\n")
