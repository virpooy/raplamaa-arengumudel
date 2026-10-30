# Raplamaa juhtimiskeskuse andmebaas 2016–2026 — kirjete skeem (kõik agendid kasutavad sama)

Väljund: JSON-fail kujul {"records":[...], "docs":[...], "notes":"..."} (UTF-8). Ära kirjuta teiste agentide faile üle.

## records[] — üks kirje = üks väärtus
{
 "vald": "Rapla|Kohila|Marjamaa|Kehtna",          // praegune omavalitsus, kelle aegritta kirje kuulub
 "ehak": "0668|0317|0502|0293",                     // praeguse valla EHAK
 "territory": "praegune" | "eelkäija:<nimi> (<EHAK>)", // 2016 jm enne haldusreformi: millise üksuse andmed
 "scope": "KOV üksus" | "konsolideerimisgrupp" | "statistika",  // aruande ulatus; eelarve täitmine = KOV üksus
 "indicator": "n1",                                 // võti tabelist allpool (või pop_tot, edu_school:<nimi> jne)
 "indicator_name": "Põhitegevuse tulud kokku",
 "definition": "…kuidas allikas defineerib…",
 "period": "2019" | "2026-01..2026-08",             // aasta või täpne periood / seisukuupäev
 "kind": "taitmine" | "esialgne_eelarve" | "muudetud_eelarve" | "strateegia_prognoos" | "osaline_taitmine" | "statistika",
 "value": 12345678,                                 // mudelis kasutatav väärtus: EUROD, tulud +, kulud −  (või ühik nagu "inimest")
 "unit": "EUR",
 "value_raw": "12 345,7",                           // täpselt nagu allikas
 "unit_raw": "tuh EUR",
 "source_name": "Rapla valla 2019. a majandusaasta aruanne",
 "url": "https://…",
 "page_table": "lk 48, eelarve täitmise aruanne" | "RR300",
 "published": "2020-06-25" | null,
 "retrieved": "2026-10-12",
 "check": "kontrollitud" | "kontrollimata" | "osaliselt",   // kontrollitud = kogusummad ja komponendid üle vaadatud
 "notes": "teisendused (tuh→EUR, märk), tabeli jätkumine järgmisel lehel, ümardamine jne"
}

## docs[] — iga leitud/otsitud dokument
{"vald","year","doc_type":"majandusaasta aruanne|eelarve|lisaeelarve|eelarvestrateegia|täitmine 2026|statistikatabel",
 "title","url","status":"loetud täielikult|osaliselt loetud|leitud, kättesaamatu|ei leitud|ei avaldata",
 "read_scope":"nt tegevusaruanne lk 1–30 + eelarve täitmise aruanne lk 45–47; põhiaruanded lugemata",
 "notes":"…"}

## Finantsnäitajate võtmed (KOV üksuse eelarve täitmise aruanne / RR300 read)
n1 Põhitegevuse tulud kokku · n2 Maksutulud · n3 Tulumaks (füüsilise isiku tulumaks) · n4 Maamaks · n9 Kaupade ja teenuste müük
n10 Saadud toetused tegevuskuludeks · n11 Tasandusfond · n12 Toetusfond · n19 Põhitegevuse kulud kokku (−)
n22 Antud toetused tegevuskuludeks (−) · n26 Personalikulud (−) · n27 Majandamiskulud (−) · n29 Põhitegevuse tulem (n1+n19)
n30 Investeerimistegevus kokku · n32 Põhivara soetus (−) · n33 Põhivara soetuseks saadav sihtfinantseerimine (+)
n42 Finantskulud (−) · n43 Eelarve tulem · n45 Kohustuste võtmine (+) · n46 Kohustuste tasumine (−)
liq Likviidsed varad aasta lõpus · debt Võlakohustused aasta lõpus · net Netovõlakoormus (EUR) · net_pct Netovõlakoormus (% põhitegevuse tuludest) · cap Netovõlakoormuse ülemmäär (EUR)
NB: eelarve täitmise aruanne (KOV üksus) ≠ konsolideerimisgrupi bilanss/tulemiaruanne. Ära võrdsusta neid; märgi scope.

## Haldusreform 2017 (kontrolli ja dokumenteeri)
Rapla vald (praegune) = endised Rapla, Juuru, Kaiu, Raikküla vallad (ühinemine 2017). Märjamaa = Märjamaa + Vigala. Kehtna = Kehtna + Järvakandi. Kohila – muutusteta.
2016 aasta andmed on eelkäijate kaupa; summa praegusele territooriumile = absoluutväärtuste summa (märgi "ümberarvutatud", ära summeeri protsente). Kirjelda võimalik topeltloendus (eelkäijate omavahelised ülekanded).
