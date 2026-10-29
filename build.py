"""Ehitab index.html failidest src/base.html, src/k9/* ja data/*.json. Käivita: python3 build.py"""
import re,sys,os
ROOT=os.path.dirname(os.path.abspath(__file__));D=os.path.join(ROOT,'src','k9')
s=open(os.path.join(ROOT,'src','base.html'),encoding='utf-8').read()
s=s.replace('80% simulatsioonivahemik','juhusliku kõikumise vahemik (80%)')  # v46: terminoloogia
def r(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:80]); s=s.replace(a,b)
FONTS='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">'
i=s.find('</head>');s=s[:i]+('<meta name="viewport" content="width=device-width, initial-scale=1">\n' if 'name="viewport"' not in s else '')+FONTS+'\n'+s[i:]
i=s.rfind('</style>');s=s[:i]+'\n'+open(D+'/k9.css',encoding='utf-8').read()+'\n'+s[i:]
r('<div class="wrap">','<div class="wrap" aria-hidden="true" inert>')
# v35: tööhõive hoob ankurdatud Raplamaa tasemele (TT4661, 15–74, 2023–2025 keskmine 64,1%); valemi suhteline loogika ei muutu
# EMPR (Raplamaa, TT4661) ja EMPE (Eesti, TT0151) on failis data/ext.json
r('const VX={};const S={','const EMPB=64.1;const VX={};const S={')
r('fertTr:"const",mort:"const",emp:68.5};','fertTr:"const",mort:"const",emp:EMPB};')
r('(S.emp!==68.5?` · tööhõive','(S.emp!==EMPB?` · tööhõive')
r('const em=1+(S.emp/68.5-1)*','const em=1+(S.emp/EMPB-1)*')
r('<input type="range" id="lvEmp" min="62" max="75" step="0.5" value="68.5">','<input type="range" id="lvEmp" min="58" max="70" step="0.1" value="64.1">')
r('<output id="oEmp">68,5%</output>','<output id="oEmp">64,1%</output>')
r('Baas on Eesti 15–74-aastaste tööhõive määr 2025 (68,5%, TT0151).','Baas on Raplamaa 15–74-aastaste tööhõive määr, 2023–2025 keskmine (64,1%, TT4661).')
r('Baas 68,5% (Eesti 2025, TT0151), valla määra andmeid ei ole.','Baas 64,1% (Raplamaa 2023–25 keskmine, TT4661); valla määra ei avaldata.')
r('emp:{id:"lvEmp",min:62,max:75,step:.5,ref:68.5,','emp:{id:"lvEmp",min:58,max:70,step:.1,ref:64.1,')
r('["Tööhõive määr 15–74","Eesti, 2025",nf1.format(EXT.EMP[2025])+"%","TT0151","ametlik","Maakonna määr mudelis puudub. Kasutatakse tööhõive hoovas võrdlusbaasina."]]','["Tööhõive määr 15–74","Rapla maakond, 2025",nf1.format(EXT.EMPR[2025])+"%","TT4661","ametlik","Valimihinnang; aastate kõikumine ±2–3 pp. Hoova baas 64,1% = 2023–25 keskmine. Eesti 2025: "+nf1.format(EXT.EMPE[2025])+"%. Valla määra ei avaldata."]]')
s=re.sub(r'<title>[^<]*</title>','<title>Raplamaa arengukangas</title>',s,count=1)
JS=['k9core.js','k9chart.js','k9prov.js','k9db.js','k9data.js','k9tree.js','k9over.js','k9pop.js','k9svc.js','k9setl.js','k9atlas.js','k9fin.js','k9re27.js','k9cmp.js','k9rest.js','k9mkm_data.js','k9mkm.js','k9too_data.js','k9too.js','k9map.js','k9econ_data.js','k9econ.js','k9unc.js','k9plan.js']
js='\n'.join(open(D+'/'+f,encoding='utf-8').read() for f in JS if os.path.exists(D+'/'+f))
i=s.rfind('</script>');s=s[:i]+'\n'+js+'\ntry{K9.init();}catch(err){console.error(err);document.body.insertAdjacentHTML("afterbegin","<p style=\\"padding:20px;color:#fff;background:#600\\">Uue kasutajaliidese käivitamine ebaõnnestus: "+err.message+"</p>");document.querySelector("body>.wrap").removeAttribute("inert");}\n'+s[i:]
# andmed: iga kohatäitja /*@data NIMI*/null asendatakse failiga data/NIMI.json (kompaktne JSON)
import json
def _data(m):
    n=m.group(1);p=os.path.join(ROOT,'data',n+'.json')
    v=json.load(open(p,encoding='utf-8'))
    return json.dumps(v,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
_n=len(re.findall(r'/\*@data ([a-z0-9_]+)\*/null',s))
s=re.sub(r'/\*@data ([a-z0-9_]+)\*/null',_data,s)
assert '/*@data' not in s
open(os.path.join(ROOT,'index.html'),'w',encoding='utf-8').write(s);print('andmefaile:',_n);print('ok',len(s))
