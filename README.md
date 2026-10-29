# Raplamaa arengumudel

Raplamaa nelja valla (Kehtna, Kohila, Märjamaa, Rapla) arengukangas: rahvastik ja selle prognoos, teenused (lasteaiad, koolid), eelarve, eluase, töökohad ja stsenaariumid.

**Leht:** https://virpooy.github.io/raplamaa-arengumudel/

## Andmed
Avalikud andmed: Statistikaamet (CC BY 4.0), Maksu- ja Tolliamet, EHIS / Haridussilm, Maa- ja Ruumiamet, ÜRP asustuse arengustsenaariumide koonduuring. Iga näitaja juures on andmepass: allikas, vaatlusperiood, pärimise aeg ja piirangud.

Mõõdetud, tuletatud ja prognoositud väärtused on lehel eristatud. Puuduv väärtus ei ole kunagi null.

## Staatus
Analüüsivahend, mitte omavalitsuse ametlik seisukoht. Andmete automaatne uuendamine on ettevalmistamisel.

## Salasõna
Avaldatav leht (`index.html`) on salasõnaga krüpteeritud, kui repos on fail `lukk.json`.
- **Salasõna seadmine või vahetamine:** ava `seadista-salasona.html` (GitHub Pagesis `/seadista-salasona.html`), loo lukk ja pane see faili `lukk.json`. Salasõna ise ei jõua kunagi reposse ega GitHub Actionsisse.
- **Kuidas see töötab:** igal ehitusel krüpteeritakse leht uue juhusliku võtmega (AES-256-GCM). See võti krüpteeritakse luku avaliku võtmega (RSA-OAEP 3072). Brauseris avab salasõna (PBKDF2, 600 000 kordust) salajase võtme ja selle kaudu lehe.
- **„Jäta selles seadmes meelde”** salvestab avamisvõtme brauserisse. Tühistamiseks lisa aadressi lõppu `#unusta`.
- **Piirang:** repo on avalik, seega lähtekood ja andmed (avalik statistika) on GitHubis nähtavad. Krüpteeritud on avaldatud leht. Nõrka salasõna saab lukufailist ära arvata, seega kasuta vähemalt 12 märki, parem veel mitmesõnalist lauset.

## Ülesehitus
- `index.html`: avaldatav leht. Ehitatud fail, ära muuda käsitsi.
- `data/`: kõik andmed JSON-failidena. Allikad ja uuendusviis on failis `data/ALLIKAD.md`.
- `src/base.html`: arvutusmudel (kohortmudel v6) ja vana vaade, andmete asemel kohatäitjad.
- `src/k9/`: kasutajaliides: peatükid, joonised, andmepassid (`k9*.js`, `k9.css`).
- `build.py`: paneb lehe kokku (`python3 build.py`).
- `tests/`: Playwrighti testid (`python3 tests/t_v46.py` jt; regressioon `python3 tests/t_reg.py vordle`).
- `econ/`: Seosed-peatüki andmete ettevalmistus (79 omavalitsuse ristlõige), väljund `data/econ.json`.
- `tools/datafmt.py`: andmefailide ühtne vorming, et git-i erinevused oleksid loetavad.

## Andmete automaatne uuendamine
GitHub Actions (`.github/workflows/andmed.yml`) käivitub iga kuu 5. kuupäeval ja pärib Statistikaametist värsked andmed: rahvastik (`pipeline/stat_pop.mjs` → `data/pop.json`) ja lisaandmed (`pipeline/stat_ext.mjs` → `data/ext.json`: prognoos, Eesti rahvastik, oodatav eluiga, ränne, eluruumid, kulud tegevusalade kaupa, SKP, tööhõive). Juhtskript on `tools/update.py`. Seejärel:
- **muutusi ei ole:** midagi ei juhtu;
- **andmetes on vigu** (puuduv väärtus, summad ei klapi): andmeid ei rakendata ja avaneb teade (Issues);
- **andmed muutusid ja on hoiatusi** (uus rahvastikuaasta, Statistikaamet täpsustas vanu väärtusi, muutus andmetes, mis mõjutavad mudeli kalibreerimist: eluiga, ränne, tööhõive, kulud): muudatus läheb eraldi harusse ja avaneb teade ülevaatamiseks;
- **andmed muutusid ilma hoiatusteta ja leht töötab** (`tests/t_gate.py`): leht avaldatakse kohe.

Käsitsi käivitamine: **Actions → Andmete uuendamine → Run workflow**.

**Seosed-peatükk** (79 omavalitsuse võrdlus) uueneb eraldi töövooga **Actions → Seosed: aastane uuendus → Run workflow**, näiteks kord aastas, kui uue aasta andmed on avaldatud. Perioodid on failis `econ/periood.json`. Tulemus läheb alati ülevaatusharusse ja avaneb teade, sest perioodi muutus muudab kõiki seoseid ja tõlgendusi. Pärimise ajad on failis `data/fetched.json`.

## Andmete käsitsi uuendamine
1. Muuda või genereeri fail kaustas `data/`.
2. `python3 build.py`
3. Käivita testid. Regressioonitest näitab, kuidas mudeli tulemused muutusid.
4. Commit ja push: GitHub Pages avaldab lehe mõne minutiga.
