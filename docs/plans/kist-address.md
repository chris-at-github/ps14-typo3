# Requirements

### Überblick & Ziel

Schritt 2, Punkt 3 der KIST-Migration
([kist-v14-functionality.md](kist-v14-functionality.md), Entwurf Schritt 2):
Adressen aus `tt_address` wieder ausgeben — Adress-Element (Kontakt,
Impressum), Adresse und Social Links im Footer, Öffnungszeiten, JSON-LD
(LocalBusiness). In v14 fehlt heute alles davon: `tt_address` ist nicht
installiert, das Plugin `ps14foundation_addressrecord` hat keine
Rendering-Definition, die Footer-Spalte „Adresse“ bleibt leer
(`Page/Layout/Address` geparkt, `optional="true"`).

- Stand: 2026-11-26
- Quelle der Zahlen: lokale Datenbank nach `ddev pull prod-v12` und
  `ps14-migrate`, nur nicht gelöschte Datensätze.

### Bestandsaufnahme

**Extension:** v12 nutzt `friendsoftypo3/tt-address` 9.1.1. Für v14 gibt es
10.0.1 (`typo3/cms-core ^13.4.20 || ^14.0`).

**Datensätze `tt_address`** (Typ über `record_type`, Extbase-Klassenname):

| `record_type` | Ordner | Anzahl (davon en) | Nutzung |
|---|---|---|---|
| `Ps14\Foundation\Domain\Model\Address` | 3 | 10 (5) | Standorte München (14, `provider`), Freital (64), Dresden (112), Suzhou (148), Testadresse (13) |
| `Ps14\Foundation\Domain\Model\Address` | 231 | 1 | Key Account hyJOIN (63), nur im versteckten Element 273 |
| `Ps\Contact\Domain\Model\Contact` | 115 | 78 (34) | Ansprechpartner-Suche `contact` → **Schritt 2, Punkt 5**, hier nur nicht kaputt machen |

Genutzte Zusatzfelder (aus `ps14_foundation` v12, Präfix `tx_foundation_`):
`identifier` (nur `provider` an 14/103), `directors`, `vat_number`,
`commercial_register`, `registered_office` (Impressum, 14/103),
`additional_description` (RTE, 112/113/148/150), `maps_link` (148/150),
`youtube` (14/103/150), `opening_hours` (Inline), `opening_hours_description`
(RTE). Social aus tt_address: `linkedin` (14/103), `facebook`, `instagram`
leer. `description` an fast allen Standorten gefüllt.

**Öffnungszeiten** `tx_foundation_domain_model_openinghours`: 20 Einträge
(10 de) an 14, 64, 112 (+ en 103, 104, 113). Felder `days` (Liste
Wochentage), `days_title`, `open_at`, `close_at`, `category`
(sys_category: 196 „Geschäftszeiten“, 197 „Wareneingang“, Eltern 195
„Öffnungszeiten“; en 317/318).

**Elemente** `list` / `ps14foundation_addressrecord` (FlexForm):

| uid (en) | Seite | Variante | Adresse | Anzeige | JSON-LD |
|---|---|---|---|---|---|
| 22 (2312) | Address [29] (unter „Modules“) | `default` | 14 | alles | LocalBusiness, Kat. 195 |
| 68 (2675) | Impressum [30] | `imprint` | 14 | Name, Beschr., Ort, Kontakt, Öffnungszeiten, ohne URL | – |
| 2206 (2656), 2207 (2657), 2696 (2697), 3008 (3010) | Kontakt [111] | `default` | 14, 112, 64, 148 | alles ohne URL | LocalBusiness, Kat. 196 |
| 273 (2413), versteckt | Thermisches Direktfügen [139], colPos 20 | `default` | 63 | ohne Öffnungszeiten | – |

Varianten `map`, `contact` sind registriert, aber nicht genutzt.

**Footer (v12):** `fo:address.entity identifier="provider"` → Name,
Anschrift, Telefon, Mail, Social-Icons (facebook, instagram, youtube,
linkedin) aus dem Datensatz 14.

**Code v12** (Quelle `~/www/kist-escherich-com/public/typo3conf/ext/`):
`ps14_foundation`: `AddressController` (Extbase, `recordAction`),
`Domain/Model/Address`, `OpeningHours`, `AddressRepository`,
ViewHelper `address.entity`, `jsonLd.{localBusiness,address,person}`,
FlexForm `AddressRecord.xml`, TCA-Override `tt_address`, Tabelle
Öffnungszeiten, Templates `Address/Record.html`, Partials
`Address/Layout/{Default,Imprint,Map,Contact}.html`,
`Components/Address.html` (25 Sections). KIST überschreibt
`Address/Layout/Default.html`, `Components/Address.html`, Footer.

**In v14 geparkt (Schritt 1, Task 6):** `ps14_site`
`Resources/Private/Extensions/Foundation/Partials/Address/Layout/Default.html`,
`…/Partials/Page/Layout/Address.html` (Footer),
`Resources/Private/Partials/Components/Address.html`,
`Configuration/TypoScript/Extensions/Step2/Address.setup.typoscript`,
SCSS `components/_address.scss`, `modules/address.scss`.

### Scope

- `tt_address` 10 installieren, Erweiterung von `tt_address` (Typ, Felder,
  Öffnungszeiten), Adress-Element, Footer-Adresse mit Social Links,
  JSON-LD LocalBusiness, Datenmigration, KIST-Markup wie v12.
- Beispielseite: nur das Adress-Element auf „Address“ [29] (Regel: nur neue
  Module, gesamte Liste erst am Ende).

Nicht im Scope:

- Ansprechpartner-Suche `contact` (Punkt 5): Datensätze vom Typ `Contact`
  bleiben unverändert und im Backend bearbeitbar; deren Felder, Import und
  Plugin folgen in Punkt 5.
- JSON-LD `Person` (nur von `contact` genutzt → Punkt 5).
- Varianten `map` und `contact` (ungenutzt).

### Key Decisions (entschieden 2026-11-26)

1. **Extension `ps14_address`** (Repo `ps14-address`, bisher v12 auf
   `master`: Extbase-Plugin `ps14address_record`, Paket `ps14/address`).
   v12-Stand → Branch `12.x`, v14 auf `main` (über `feature/v14`), Paket
   `ps14/ps14_address`. Klon des Nutzers unter `temp/ps14-address` bleibt
   unberührt, Entwicklung in `packages/ps14_address`.
2. **Klassisches Inhaltselement statt Content Block** (CType
   `ps14_address`, FlexForm wie v12: Adresse, Anzeige-Optionen,
   JSON-LD-Typ, Kategorie der Öffnungszeiten; Varianten `default`,
   `imprint` über `tx_foundation_variant`). Gründe: Extension ist für
   tt_address-Erweiterung, Tabelle, Processor und ViewHelper ohnehin nötig;
   Element und Footer teilen einen DataProcessor; Migration bleibt einfach.
3. **Contact losgelöst:** `ps14_address` kennt keine Ansprechpartner und
   führt kein Typfeld ein, sondern ergänzt das Standard-Formular von
   tt_address. Die Spalte `record_type` (Kennung der 78 `Contact`) behält
   `ps14_site` übergangsweise (SQL, `passthrough`), bis Punkt 5 sie
   übernimmt.
4. **Footer:** Site Setting `address.provider` (KIST: 14) im Site Set von
   `ps14_address`, DataProcessor im `PAGEVIEW`; Feld `identifier` entfällt.
5. **Social Links** im Footer wie v12 aus dem Adress-Datensatz.
6. **JSON-LD LocalBusiness** als ViewHelper in `ps14_address`.
7. **Installation** `ddev composer require friendsoftypo3/tt-address:^10.0`
   freigegeben.
8. **Datenmigration** als generischer Wizard in `ps14_migration`
   (Felder `tx_foundation_*` → `tx_address_*`, Öffnungszeiten mit gleichen
   UIDs, `list`/`ps14foundation_addressrecord` → `ps14_address`,
   FlexForm-Schlüssel).

Aufteilung:

| `ps14_address` (alle Projekte) | `ps14_site` (KIST) |
|---|---|
| Abhängigkeit `tt-address ^10` | Site Set als Abhängigkeit, `address.provider: 14` in `settings.yaml` |
| tt_address-Felder: Geschäftsführung, USt-ID, Register, Sitz, Maps-Link, Zusatzbeschreibung, Öffnungszeiten + Beschreibung, ggf. YouTube | Spalte `record_type` übergangsweise (bis Punkt 5) |
| Tabelle `tx_address_openinghours` | – |
| CType `ps14_address`, FlexForm, Varianten, Wizard-Eintrag, Icon, Labels de/en | TSconfig: nur genutzte Varianten |
| `AddressProcessor` (Overlay, Öffnungszeiten gruppiert/gefiltert) | – |
| Site Set mit `address.provider` und Seiten-Processor | Footer-Partial mit v12-Markup inkl. Social-Icons |
| ViewHelper JSON-LD LocalBusiness | – |
| Basis-Templates (BEM, `co:`), Readme | Overrides mit v12-Markup, SCSS über Vite, Step2-Dateien entfernen |

### Risks

- `Contact`-Datensätze (78) teilen sich die Tabelle: Typfeld und TCA dürfen
  sie nicht unbearbeitbar machen; Punkt 5 baut darauf auf.
- `tt_address` 10 kann Spalten umbenannt/entfernt haben → Schema-Update
  prüfen, bevor Daten verloren gehen (`extension:setup` nur mit Skip-Liste
  wie bei `record_type` in Schritt 2.1, Altspalten erst nach der
  Migration entfernen).
- Footer auf jeder Seite: Fehler im Processor betreffen alle Seiten.
- Übersetzungen: Adressen und Öffnungszeiten haben en-Overlays mit
  eigenen Werten (z. B. `Hoeglwoerther Strasse`), die erhalten bleiben
  müssen.

### Validierungsansatz

- `ps14-migrate` auf frischem Dump, Anzahl Adressen/Öffnungszeiten/Elemente
  vor und nach der Migration.
- Vergleich mit live (v12): Kontakt, Impressum, Footer (de/en) — Inhalte,
  Reihenfolge, Links, Social-Icons, JSON-LD-Ausgabe.
- Alle Seiten mit Adress-Element und Stichprobe Footer HTTP 200 (de/en).
- Backend: Adresse und Ansprechpartner (Typ `Contact`) öffnen und speichern.

# Tasks

### Task 1: Plan
Bestandsaufnahme, Entscheidungen, Beispielvarianten.

### Task 2: tt_address und Erweiterung
Repo/Branches, Installation `tt-address` 10, Extension `ps14_address`
(Path-Install), TCA-Erweiterung `tt_address`, Öffnungszeiten-Tabelle,
`record_type` übergangsweise in `ps14_site`.

### Task 3: Adress-Element
CType mit FlexForm, `AddressProcessor`, Basis-Templates (Varianten
`default`, `imprint`), JSON-LD, Site Set mit `address.provider`.

### Task 4: KIST-Ausgabe
Template-Overrides mit v12-Markup, Footer (Adresse + Social), Site Setting
`address.provider`, SCSS/Vite, Step2-Dateien aktivieren bzw. ersetzen.

### Task 5: Datenmigration
Wizard(s), Test auf lokaler DB, dann frischer Dump + `ps14-migrate`.

### Task 6: Beispielseite
Adress-Element auf „Address“ [29] per MCP, `docs/examples/content-blocks.yaml`
ergänzen.

### Task 7: Bereinigung, Vergleich, Release
Vergleich mit live, Readme, Release `ps14_address`, Composer, Doku.

# Status

| Task | Stand | Commit |
|---|---|---|
| 1 Plan | erledigt 2026-11-26: Bestandsaufnahme, Entscheidungen 1–8, Beispielvarianten | siehe Commits |
| 2 tt_address und Erweiterung | erledigt 2026-11-26: `tt-address` 10.0.1 installiert (Schema nur additiv: `bluesky`, `whatsapp`, `youtubechannel`, `linkedincompany`; Daten unverändert). `packages/ps14_address` (Branches `12.x`, `main` aus `master`, Arbeit auf `feature/v14` `677643c`, Path-Install): Felder `tx_address_*` (Zusatzbeschreibung, Link zur Karte, rechtliche Angaben, Öffnungszeiten + Hinweis), Tabelle `tx_address_openinghours` (`category` als int, Index `address`), Labels de/en; YouTube über tt_address `youtubechannel`. KIST: `record_type` als `passthrough` + SQL in `ps14_site`, Linter-Listen. `composer.json`/`.lock` uncommitted bis Release. Offen: Formular im Backend sichten (Position Palette „Rechtliche Angaben“, Tab „Öffnungszeiten“) | `2b0ec79` |
| 3 Adress-Element | erledigt 2026-11-26 (`ps14_address` `1e57f27`, KIST `5c5d121`): CType `ps14_address` (`addRecordType`, Gruppe `default`, Icon, `TcaService::getShowitem`), FlexForm `Address.xml` (Sheets Adresse/Anzeige/Strukturierte Daten; Schlüssel `address`, `show*`, `structuredData`, `openingHoursCategory`), Varianten `default`/`imprint`; `AddressProcessor` (Overlay, Bilder, Öffnungszeiten + gruppiert nach Art, Gruppenwert `112` oder `tt_address_112`); ViewHelper `ad:jsonLd.localBusiness` (Beschreibung als Klartext statt Name wie in v12); Templates `Content/Address.html`, Partials `Content/Address/Layout/{Default,Imprint}.html`, `Content/Address/Item.html` (BEM `address`, `co:heading`, `co:richtext`), Labels de/en; Site Set `ps14/address` mit `address.provider`, Seiten-Processor 1700 (`{provider}`). KIST: Set-Abhängigkeit, `address.provider: 14`, Import. Test: Testelemente 3104 (default, Dresden, JSON-LD) und 3105 (imprint, München) auf [29], HTTP 200, Markup ok — werden in Task 5 gelöscht. `config/system/settings.php` (tt_address-Standardkonfiguration, in2mcp) bewusst nicht committet | `5c5d121` |
| 4 KIST-Ausgabe | erledigt 2026-11-26 (KIST `b16c143`, `ps14_address` `2472c62`): Overrides mit v12-Markup per Key 120 (`Extensions/Ps14Address/Templates/Content/Address.html` mit `vite:asset` `modules/address.scss`, `Partials/Content/Address/Layout/{Default,Imprint}.html`), Bausteine `Partials/Components/Address.html` auf tt_address-/`tx_address_*`-Felder umgestellt (Öffnungszeiten aus `openingHoursGrouped`, YouTube aus `youtubechannel`), Footer `Partials/Page/Layout/Address.html` mit `{provider}`, Labels `ps14_site.messages` (Wortlaut v12, en „E-mail“ wie live); geparkte Step2-Dateien entfernt. Koordinaten im Processor als Zahl (wie v12: Karten-Link `50.97784`, JSON-LD numerisch). Vergleich mit live: Footer de/en identisch bis auf YouTube (Daten erst nach Task 5), Element Dresden und Impressum identisch bis auf Daten aus Task 5 (Öffnungszeiten, rechtliche Angaben). Bekannte Abweichung JSON-LD: `description` = Beschreibung statt Name, leere `openingHoursSpecification` entfällt | `b16c143` |
| 5 Datenmigration | erledigt 2026-11-26: Wizard `ps14Migration_addressMigration` (`ps14_migration` `feature/address-wizard`): Felder `tx_foundation_*` → `tx_address_*` (nur leere Ziele, Zähler numerisch wegen Strict Mode), `tx_foundation_youtube` → `youtubechannel`, Öffnungszeiten mit gleichen UIDs (feste Spaltenliste; erster Versuch mit `getColumns()` schrieb unter DBAL 4 leere Zeilen → frischer Dump), Plugins → CType `ps14_address` mit FlexForm-Umbenennung (nicht gespeicherte Anzeige-Optionen = aus wie in v12). Frischer Dump (`ddev pull prod-v12`, freigegeben) + `ps14-migrate`: alle Wizards OK, bekannter Schemafehler `ref_t3ver_state`; 29 Feldwerte, 20 Öffnungszeiten (6 Adressen de/en, Kategorien 196/197), 16 Elemente (2 gelöscht). `ps14_address`-Fix: Auswahl einer übersetzten Adresse (en-Elemente → 103) wird über das Original aufgelöst. Vergleich mit live: Kontakt (4 Elemente) und Impressum de/en identisch (bis auf Attributreihenfolge `target`/`rel` am Suzhou-Kartenlink), Footer bis auf die gewünschte Überschrift „Folgen Sie uns auf“/„Follow us“, JSON-LD gleiche Öffnungszeiten; Abweichungen: `description` (Beschreibung statt Name), `@context` https, leere `openingHoursSpecification` entfällt, `streetAddress` ohne Zeilenumbruch. Testelemente 3104/3105 gelöscht (mit dem Pull ohnehin weg). MCP-Key nach dem Pull weg | siehe Commits |
| 6 Beispielseite | erledigt 2026-11-26: „Address“ [29]: Element 22 (migriert, `default`, München mit Geschäftszeiten und JSON-LD) und neu per MCP 3068 (`imprint`, München mit rechtlichen Angaben); HTTP 200, Markup ok; `docs/examples/content-blocks.yaml` ergänzt. MCP-Key nach dem Pull neu erzeugt (Header `X-Api-Key`) | siehe Commits |
| 7 Release | 2026-11-26: `ps14_address` `main` 661d1ba + Tag `14.0.0`, `ps14_migration` `main` 05dd7e1 (beide vom Nutzer gepusht); KIST: VCS-Eintrag `ps14-address`, Klon entfernt, `ddev composer update 'ps14/*'` → `ps14_address` 14.0.0 (zip), Composer-Dateien `16c3696`; Seiten mit Adressen HTTP 200. Vorlage: `phpstan.paths.php`/`SHARED_PACKAGES` auf `feature/shared-package-address` 232149e (Squash nach `main` ausstehend). Offen: `master` im Repo `ps14-address` auf GitHub löschen | siehe Commits |
