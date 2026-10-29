# Andmefailid ja nende allikad

Kõik kangas kasutatavad andmed on selles kaustas. `build.py` paneb need lehele kohatäitjate `/*@data NIMI*/null` asemele: lähtekoodis on `src/base.html` ja `src/k9/*.js`. Koodis andmeid ei ole.

**Põhireeglid:**
- Puuduv väärtus on `null`, mitte kunagi `0`.
- Mõõdetud, tuletatud ja prognoositud väärtusi ei segata.
- Iga muudatuse järel käivita `python3 build.py` ja testid (`tests/`).

**Uuendusviis:**
- **auto:** avalik masinloetav allikas (Statistikaameti API), saab ajastada.
- **pool:** allikas avaldab faili (Excel/CSV), pärimist saab automatiseerida, aga vorming võib muutuda.
- **käsitsi:** dokumendid (eelarvestrateegiad, uuringud), mida tuleb lugeda.

| Fail | Sisu | Allikas | Uuendus |
|---|---|---|---|
| `pop.json` | Rahvastik valla ja maakonna kaupa: viieaastased vanuserühmad 2015–2026 (`age`), kokku (`tot`), sünnid (`b`), surmad (`d`), sisse- ja väljaränne (`mi`, `mo`) | Statistikaamet RV0282U (vanuserühmad ja kokku), RV112U, RV49U, RVR02 (sise- ja välisränne) | **auto**: `pipeline/stat_pop.mjs`, igakuine |
| `fins.json` | Eelarve põhinäitajad 2017–2025 (`n1` põhitegevuse tulud jne, tuh €) valdade ja maakonna kaupa | KOV eelarve täitmine; sama näitajakoodid nagu `db.json` kirjetes (RR300 ja aruanded) | auto (RR300) / pool |
| `mta.json` | Üksikisiku tulumaks valdadele kuude kaupa | Maksu- ja Tolliamet | pool |
| `geo.json` | Valdade piirid ja asulad joonistamiseks (SVG teed, keskpunktid) | Maa- ja Ruumiamet, EHAK (haldusjaotus 01.01.2018) | käsitsi, muutub harva |
| `bud.json` | Valdade eelarvestrateegiad ja 2026. aasta eelarved; igal real `doc`, `act`, `url` | Valdade eelarvestrateegiad, eelarved, seletuskirjad | käsitsi |
| `edu.json` | Õpilased, koolid, lasteaiad, toetusfond | EHIS / Haridussilm, toetusfondi arvestus | käsitsi / pool |
| `peers.json` | Võrdlusomavalitsuste finants- ja rahvastikunäitajad (`K` = näitajad, `R` = read) | Koostatud failist `peers.txt` (väljaspool repot); päritolu tuleb dokumenteerida | käsitsi |
| `ext.json` | Lisaandmed, vt allpool | mitu | segamini |
| `db.json` | Raplamaa andmebaas 2016–2026: kirjed allika, perioodi ja kontrolliga (skeem: `data2/SCHEMA.md` algses töökaustas) | Genereeritud `data2/build_db.py`, 11.10.2026 | generaator väljaspool repot |
| `econ.json` | Seosed: 79 omavalitsuse ristlõige | Genereeritud `econ/build.py` (Statistikaamet, mitu tabelit) | auto |
| `too.json` | Tööturu peatükk (TT4645 jt) | Genereeritud `toostat/build.py` (väljaspool repot) | auto |
| `mkm.json` | MKM töövaldkonna uuringute register ja Raplamaa leiud | Genereeritud `mkm/gen_mkm.py` (väljaspool repot) | käsitsi |

## `ext.json` sisu

- `SA`: Statistikaameti 2024. aasta prognoos, põhistsenaarium (RV085, RV084). **auto**
- `kids`: vanuserühmad 0–14 ja 65+ maakonnas (RV084). **auto**
- `URP`: ÜRP prognoos 2024 ja 2050 valdade kaupa (teadusaruanne lk 43–52, tabelid 2.1.1–2.1.6). `base` on rändeta teoreetiline stsenaarium (tabel 2.1.1). B ja C on sihtstsenaariumid, mitte prognoosid. **käsitsi, staatiline**
- `MJ`: Märjamaa valla oma prognoos (Geomedia 2020, baasaasta 2020: 7505). **käsitsi, staatiline**
- `EE`: Eesti rahvaarv ja 65+ (RV0282U). **auto**
- `E0`: oodatav eluiga Rapla maakonnas (RV0452). **auto**
- `MIGV`: välisrände saldo valdade kaupa (RVR02), siseränne. **auto**
- `HOUSE`: kasutusse lubatud uued eluruumid (EH46U), arv ja pind m². **auto**
- `permit`: maakonna ehitus- ja kasutusload kvartalite kaupa (EH045, uued eluruumid) aastasummadena. **auto**
- `DW`: rahvaloendus 2021, tavaeluruumid (RL21217): kokku, asustatud, asustamata, veevarustus, tualettruum. **staatiline (järgmine loendus)**
- `COM`: rahvaloendus 2021, hõivatud töökoha asukoha järgi (RL21163). **staatiline**
- `FUNC`: kulud tegevusala järgi (RR302), tuh €, 2023–2025. **auto**
- `GDP`: SKP (RAA0050): Harju osakaal Eesti SKP-s; Rapla maakonna SKP elaniku kohta, % Eesti keskmisest. **auto**
- `EMP`, `EMPE`: tööhõive määr 15–74, Eesti (TT0151). **auto**
- `EMPR`: tööhõive määr 15–74, Rapla maakond (TT4661). Mudeli tööhõive baas `EMPB = 64,1` on selle 2023–2025 keskmine ja asub koodis (`build.py`). **auto**
- `STAMP`: lisaandmete pärimise kuupäev.

## Teadaolevad lüngad

- `peers.json` päritolu ei ole failis dokumenteeritud.
- `db.json`, `too.json` ja `mkm.json` generaatorid on veel algses töökaustas, mitte repos. Need tuuakse repo `pipeline/` kausta järgmises etapis koos Statistikaameti pärimisskriptidega.
- Mudeli tööhõive baas `EMPB` on koodis kirjas arvuna. Andmete uuenemisel peaks see arvutuma `EMPR`-ist.
