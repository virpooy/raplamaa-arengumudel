"""Väravatest andmete automaatsel uuendamisel: kukub (väljumiskood 1), kui leht ei tööta.
Ei sõltu konkreetsetest numbritest: uued andmed võivad anda uued väärtused, aga mitte vigu.
Kontrollib kõiki vaateid maakonna ja iga valla kohta: lehe JS-vead, .k9err plokid, NaN/undefined/Infinity tekstis ja joonistes."""
import os, sys, asyncio
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = 'file://' + ROOT + '/index.html'
from playwright.async_api import async_playwright
VIEWS = ["ylevaade", "rahvastik", "teenused", "eluase", "eelarve", "stsenaariumid", "seosed", "otsused", "eesmargid", "andmed", "atlas", "vordlus"]
UNITS = ["MAAK", "Rapla", "Kohila", "Marjamaa", "Kehtna"]
SCAN = '''(v)=>{const el=document.querySelector('#k9 .k9view[data-view="'+v+'"]');if(!el)return {missing:true};
const vis=x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0};
const bad=[];const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;
while(n=tw.nextNode()){const t=n.textContent;if(/\\bNaN\\b|\\bundefined\\b|Infinity|\\[object/.test(t)&&n.parentElement&&vis(n.parentElement))bad.push(t.trim().slice(0,90))}
const svg=[...el.querySelectorAll('svg *')].filter(x=>[...x.attributes].some(a=>/NaN|undefined|Infinity/.test(a.value))).length;
const errs=[...el.querySelectorAll('.k9err')].map(x=>x.textContent.slice(0,120));
return {bad:[...new Set(bad)].slice(0,5),svg,errs}}'''

async def main():
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1440, 'height': 900})
        jserr = []
        pg.on('pageerror', lambda e: jserr.append(str(e)[:200]))
        pg.on('console', lambda m: m.type == 'error' and 'ERR_' not in m.text and 'fonts' not in m.text and jserr.append(m.text[:200]))
        await pg.route('**/fonts.g*/**', lambda r: r.abort())
        await pg.goto(PAGE)
        await pg.wait_for_timeout(3000)
        views = await pg.evaluate('Object.keys(K9.VIEWS)')
        for u in UNITS:
            for v in VIEWS:
                if v not in views:
                    continue
                await pg.evaluate(f'K9.go("{v}?u={u}")')
                await pg.wait_for_timeout(500)
                r = await pg.evaluate(SCAN, v)
                if r.get('missing'):
                    continue
                if r['bad'] or r['svg'] or r['errs']:
                    fails.append(f"{u}/{v}: {r}")
        await b.close()
    fails += ['JS: ' + e for e in jserr]
    for f in fails:
        print('VIGA', f)
    print(f"VÄRAV: {'KORRAS' if not fails else 'EI LÄBINUD'} ({len(fails)} viga)")
    sys.exit(1 if fails else 0)

asyncio.run(main())
