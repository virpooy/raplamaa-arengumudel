# Raplamaa arengumudel

Raplamaa nelja valla (Kehtna, Kohila, Märjamaa, Rapla) arengukangas: rahvastik ja selle prognoos, teenused (lasteaiad, koolid), eelarve, eluase, töökohad ja stsenaariumid.

**Leht:** https://virpooy.github.io/raplamaa-arengumudel/

## Andmed
Avalikud andmed: Statistikaamet (CC BY 4.0), Maksu- ja Tolliamet, EHIS / Haridussilm, Maa- ja Ruumiamet, ÜRP asustuse arengustsenaariumide koonduuring. Iga näitaja juures on andmepass: allikas, vaatlusperiood, pärimise aeg ja piirangud.

Mõõdetud, tuletatud ja prognoositud väärtused on lehel eristatud. Puuduv väärtus ei ole kunagi null.

## Staatus
Analüüsivahend, mitte omavalitsuse ametlik seisukoht. Andmete automaatne uuendamine on ettevalmistamisel.

## Ülesehitus
- `index.html` — avaldatav leht (ehitatud fail, ära muuda käsitsi).
- `src/base.html` — andmed ja arvutusmudel (kohortmudel v6).
- `src/k9/` — kasutajaliides: peatükid, joonised, andmepassid (`k9*.js`, `k9.css`).
- `build.py` — paneb lehe kokku: `python3 build.py`.
- `tests/` — Playwrighti testid (`python3 tests/t_v46.py` jt; regressioon `python3 tests/t_reg.py vordle`).
- `econ/` — Seosed-peatüki andmete ettevalmistus (79 omavalitsuse ristlõige).
