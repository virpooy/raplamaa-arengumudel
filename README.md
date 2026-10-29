# Raplamaa arengumudel

Raplamaa nelja valla (Kehtna, Kohila, Märjamaa, Rapla) arengukangas: rahvastik ja selle prognoos, teenused (lasteaiad, koolid), eelarve, eluase, töökohad ja stsenaariumid.

**Leht:** https://virpooy.github.io/raplamaa-arengumudel/

## Andmed
Avalikud andmed: Statistikaamet (CC BY 4.0), Maksu- ja Tolliamet, EHIS / Haridussilm, Maa- ja Ruumiamet, ÜRP asustuse arengustsenaariumide koonduuring. Iga näitaja juures on andmepass: allikas, vaatlusperiood, pärimise aeg ja piirangud.

Mõõdetud, tuletatud ja prognoositud väärtused on lehel eristatud. Puuduv väärtus ei ole kunagi null.

## Staatus
Analüüsivahend, mitte omavalitsuse ametlik seisukoht. Andmete automaatne uuendamine on ettevalmistamisel.

## Ülesehitus
- `index.html`: avaldatav leht. Ehitatud fail, ära muuda käsitsi.
- `data/`: kõik andmed JSON-failidena. Allikad ja uuendusviis on failis `data/ALLIKAD.md`.
- `src/base.html`: arvutusmudel (kohortmudel v6) ja vana vaade, andmete asemel kohatäitjad.
- `src/k9/`: kasutajaliides: peatükid, joonised, andmepassid (`k9*.js`, `k9.css`).
- `build.py`: paneb lehe kokku (`python3 build.py`).
- `tests/`: Playwrighti testid (`python3 tests/t_v46.py` jt; regressioon `python3 tests/t_reg.py vordle`).
- `econ/`: Seosed-peatüki andmete ettevalmistus (79 omavalitsuse ristlõige), väljund `data/econ.json`.
- `tools/datafmt.py`: andmefailide ühtne vorming, et git-i erinevused oleksid loetavad.

## Andmete uuendamine
1. Muuda või genereeri fail kaustas `data/`.
2. `python3 build.py`
3. Käivita testid. Regressioonitest näitab, kuidas mudeli tulemused muutusid.
4. Commit ja push: GitHub Pages avaldab lehe mõne minutiga.
