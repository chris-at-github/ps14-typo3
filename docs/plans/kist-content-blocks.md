# Requirements

### Überblick & Ziel

Schritt 2, Punkt 1 der KIST-Migration ([kist-v14-functionality.md](kist-v14-functionality.md),
Entwurf Schritt 2): Die Module, die auf dem Elements-IRRE von ps14_foundation 2.x
(`tx_foundation_domain_model_elements`) aufbauen, werden als **Content Blocks mit
Collections** neu umgesetzt (Entscheidung 8). Die Daten werden per Upgrade-Wizard
übernommen (`ps14-migrate`). Danach werden Elements-Tabelle und -Felder nicht mehr
gebraucht; damit entfällt auch der Schutz von
`tx_foundation_domain_model_elements.record_type` (`MIGRATION_SKIP_COLUMNS`).

- Stand: 2026-11-24
- Quelle der Zahlen: Produktionsdump (`ddev pull prod-v12`), nach `ps14-migrate`,
  nur nicht gelöschte Datensätze.

### Bestandsaufnahme: Module mit Elements

| Modul (alt) | CType | Elemente gesamt (de) | Items | Felder Element | Felder Item | Besonderheiten |
|---|---|---|---|---|---|---|
| Akkordeon (`ps14_accordion`) | `ps14_accordion` | 29 (15) | 144 | Header, `bodytext`, Items | Typ `default`: Titel, Link, „initial offen“ (`tx_accordion_active`), Text (RTE). Typ `records`: Titel, Link, „initial offen“, verschachtelte Inhaltselemente | 75 Items mit Text, 69 mit verschachtelten Elementen (colPos 5628, u. a. 48 Marker, 24 Downloads, 4 Text & Bild, 8 Powermail) |
| Tabs (`ps14_tabs`) | `ps14_tabs` | 2 (1) | 8 | Header, Items | Typ `records`: Titel, Link, „aktiv“ (`tx_tabs_active`), Vorschaubild (`thumbnail`), verschachtelte Inhaltselemente (Typ `default` mit Text nicht genutzt) | Variante `radio` (TSconfig) |
| Timeline (`ps14_timeline`) | `ps14_timeline` | 4 (2) | 53 | Header, `bodytext`, Items | Datum (`tx_timeline_date`), Titel, Link, Text, Medien | Variante `no-date` |
| Marker (`ps14_marker`) | `ps14_marker` | 56 (28) | 224 | Header, `bodytext`, Bild (`image`), Items | Titel, Link, Text | Layouts `Default`, `ImageAbove`, `ImageAsideSlider`; 48 Marker stecken in Akkordeons |
| Firmenwerte (`ps14_kist_values`) | `ps14_kist_values` | 4 (2) | 38 | Header, `bodytext`, Items | Titel, Link, Text, Medien, Farbschema (`tx_kist_values_color_scheme`) | Modal (micromodal) |

Nicht Teil dieses Plans:
- `system_installation_legend`, `technical_features`: Elements an Produktdatensätzen
  (`foreign_field`), kommen mit dem Produktkatalog (Schritt 2, Punkt 3).
- Module **ohne** Elements, aber ebenfalls eigene Mini-Extensions: Hero (176 / 89),
  Downloads (30 / 15), Textmedia (25 / 13), Teaser-Plugin (`list_type`
  `ps14teaser_frontend`). Kandidaten für einen Folgeplan (siehe Offene Punkte).
- Hero-Slider (`ps14_hero_slider`): in der Produktion nicht mehr genutzt, entfällt.

### Scope

**In Scope**
- Content Blocks (`friendsoftypo3/content-blocks`) installieren.
- Fünf Content Blocks: Akkordeon, Tabs, Timeline, Marker, Firmenwerte; Items als
  Collections, Felder wie in der Tabelle.
- Templates mit dem bisherigen KIST-Markup (geparkte Partials aus Task 6 von
  Schritt 1), Modul-CSS/JS per `vite:asset` (Entrypoints existieren).
- CTypes bleiben gleich (`ps14_accordion` …), damit Inhalte, TSconfig-Vorgaben und
  Rechte erhalten bleiben (zu prüfen, siehe Offene Punkte).
- Upgrade-Wizard Elements → Collections (inkl. Übersetzungen, Dateireferenzen,
  verschachtelte Inhaltselemente) in `ps14_site` bzw. `ps14_migration`.
- Beispielseiten pro Modul unter „Modules“ (KIST: Seite 11) per MCP.

**Out of Scope**
- Neues Markup/BEM nach Vorlage (Optimierung).
- Module ohne Elements (Hero, Downloads, Textmedia, Teaser), Produktkatalog.
- Entfernen der Elements-Tabelle (erst nach Go-Live-Migration, P9).

### Key Decisions (2026-11-24)

1. **Ablage**: neue Extension `ps14_modules` (eigenes Repository
   `ps14-modules`, gemeinsames Paket wie ps14_container) für die generischen
   Module Akkordeon, Tabs und Timeline. Marker und Firmenwerte als Content
   Blocks in `ps14_site`. KIST behält das alte Markup über Template-Overrides
   in `ps14_site` (höherer `templateRootPaths`-Key).
2. **Verschachtelte Inhaltselemente** (Akkordeon/Tabs, Typ `records`):
   Collection mit Kind-Inhaltselementen (`tt_content` mit Elternverweis wie
   bisher), kein Umbau auf b13/container.
3. **Installation** von `friendsoftypo3/content-blocks` per Composer freigegeben.
4. **Beispielseiten** unter „Modules“ [11], per MCP, sobald die Content Blocks
   existieren. Varianten: Akkordeon Text + verschachtelt (ein Item initial
   offen); Tabs default + radio; Timeline mit Datum + `no-date`; Marker in den
   Layouts Default, ImageAbove, ImageAsideSlider; Firmenwerte mit allen
   Farbschemata.
5. CTypes bleiben (`ps14_accordion`, `ps14_tabs`, `ps14_timeline`,
   `ps14_marker`, `ps14_kist_values`), per `typeName` im Content Block.
6. **Items** (Task 3, 2026-11-24): eigene Tabelle je Modul (Akkordeon:
   `tx_modules_accordion_item`, Record Types `text` und `content`); der Wizard
   übernimmt die UID des Elements, damit `tt_content.tx_foundation_parent` der
   verschachtelten Elemente gültig bleibt (zusätzlich
   `tx_foundation_parent_table`).
7. **Wizards** Elements → Collection für die generischen Module in
   `ps14_migration`; Marker und Firmenwerte in `ps14_site`.
8. **Druckfelder** (`print_break`, `print_visibility`) nur in KIST:
   `tx_site_print_*` per TCA-Override in `ps14_site`, Werte per Wizard
   `ps14Site_accordionItemPrintMigration` (kein SQL: jede Feldänderung
   gegenüber v12 bekommt einen Upgrade-Wizard). Damit die Wizards aus
   `ps14_migration` vor denen aus `ps14_site` laufen, schlägt `ps14_site`
   das Paket per `suggest` vor (Ladereihenfolge).
9. **Rendering**: `lib.contentElement` (Layout `Default`) mit
   `record-transformation` (`{record}`), kein `frontend.html` des Content
   Blocks; Felder aus foundation-TCA-Overrides (z. B.
   `tx_foundation_elements_header`) werden per TCA-Override in die Palette
   gehängt, da Content Blocks vor den Overrides kompiliert.
10. **Basics** in `ps14_modules` für alle Content Blocks (auch `ps14_site`):
    `Ps14/Header` (Palette wie Core `headers`) und `Ps14/Appearance`
    (Erscheinungsbild, Links, Kategorien). foundation-Felder kommen per
    `addFieldsToPalette` in `<CType>_headers` / `<CType>_links_palette`.
11. **Generische Wizards** erben von `AbstractElementsMigration` (Items mit
    gleicher UID, Dateireferenzen umhängen, Zähler, verschachtelte Elemente).
    `ps14_site` hat eine Kopie der Basisklasse, weil `ps14_migration` nur
    require-dev ist (Elternklasse fehlt sonst beim Deployment).
12. **Content Blocks in `ps14_site`** mit `vendorPrefix: tx_site` (Felder und
    Paletten `tx_site_<name>_*`, Bindestriche im Namen entfallen:
    `tx_site_kistvalues_items`); Item-Tabellen `tx_site_marker_item`,
    `tx_site_kist_values_item`. Templates direkt in `ps14_site`
    (`lib.contentElement`, Key 110).
13. **Overrides für `ps14_modules`** in `ps14_site` auf Key **120**: Key 110
    belegt `ps14_site` schon über `lib.contentElement` (sonst fehlen die
    KIST-Partials wie `Header/All`, `Content/Bodytext`).

### Offene Punkte

1. Folgeplan für Hero, Downloads, Textmedia, Teaser.
2. HTTP 500 (`ModuleProcessor::__construct()` ohne Argument) auf
   `/unternehmen/tech-center/…`, `/unternehmen/ueber-kist-escherich`,
   `/produkte/individuelles-produkt` — bestand schon vor Task 3 (Log
   2026-11-23), Ursache offen. Stand 2026-11-24: nicht der Hero (Platzhalter
   ändert nichts); ein Element der Hauptspalte (`block.contentMain`) erzeugt
   `ModuleProcessor` per `makeInstance` ohne Container. Betrifft die
   Timeline-Seiten, daher Timeline im Frontend ungeprüft.
4. Nicht übernommen (in v12 nicht im Formular, Daten veraltet): Timeline
   `files` (4 Referenzen) und `content` (2 Text & Bild); bleiben an der
   Elements-Tabelle.
5. Generische Templates in `ps14_modules` (Tabs, Timeline, Akkordeon) sind im
   Frontend ungeprüft, da KIST sie überschreibt (Beispielseiten Task 8).
3. Release `ps14_modules` (Push, Tag, VCS-Eintrag, `SHARED_PACKAGES`);
   erst dann `composer.json`/`composer.lock` committen.

### Risks

- Verschachtelte Elemente (colPos 5628, `tx_foundation_parent`) sind der aufwendigste
  Teil; Marker und Downloads in Akkordeons hängen davon ab.
- Lokale Beispielseiten gehen bei jedem `ddev pull prod-v12` verloren (Datenbank wird
  ersetzt). Für dauerhafte Beispiele: Inhalte nach Go-Live anlegen oder per Skript
  wiederherstellbar machen.
- CType-Wechsel auf das Content-Blocks-Schema (`vendor_name`) würde Inhalte,
  TSconfig und Rechte betreffen.

### Validierungsansatz

- Lauf `ps14-migrate` auf frischem Dump, danach alle Seiten mit diesen CTypes
  HTTP 200 und Markup-Vergleich mit dem Altprojekt.
- Anzahl Items je Element vor/nach der Migration identisch (de/en).
- Beispielseiten im Frontend (HTTP 200, erwartetes Markup).

# Tasks

### Task 1: Plan
Dieser Plan, Bestandsaufnahme, Entscheidungen zu den offenen Punkten.

### Task 2: Content Blocks installieren
Paket, Grundkonfiguration, Ablageort.

### Task 3–7: je ein Modul
Akkordeon, Tabs, Timeline, Marker, Firmenwerte: Content Block, Template mit
KIST-Markup, Assets, Wizard Elements → Collection, Test auf frischem Dump.

### Task 8: Beispielseiten
Je eine Seite unter „Modules“ [11] per MCP, abgestimmte Varianten.

### Task 9: Bereinigung und Doku
`MIGRATION_SKIP_COLUMNS` ohne `record_type`, Notizen, Optimierungsliste.

# Status

| Task | Stand | Commit |
|---|---|---|
| 1 Plan | erledigt 2026-11-24 (Entscheidungen 1–5) | `6235e67` |
| 2 Content Blocks installieren | erledigt 2026-11-24: `friendsoftypo3/content-blocks` 2.4.10 in KIST; Grundgerüst `ps14_modules` auf `main` (lokal unter `packages/ps14_modules`, Repository `ps14-modules` angelegt, in KIST noch nicht installiert) | KIST `cf7cac5`, Paket `831081d` |
| 3 Akkordeon | erledigt 2026-11-24: Content Block in `ps14_modules` (`feature/accordion`), Wizard in `ps14_migration` (`feature/accordion-wizard`), KIST-Markup in `ps14_site`. Frischer Dump + `ps14-migrate`: 144 Items (de 74 / en 70) wie vorher, 69 verschachtelte Elemente verknüpft, 11 Seiten je Sprache HTTP 200 mit gleicher Item-Anzahl (Marker darin erst mit Task 6). `ps14_modules` lokal per Path installiert, `composer.json`/`.lock` noch nicht committet | siehe Commits |
| 4 Tabs | erledigt 2026-11-24: 8 Items (de/en je 4, Typ `content`), 8 SVG-Icons, 8 verschachtelte Powermail-Elemente; Variante `radio` mit KIST-Markup, Seite `/service-support` de/en HTTP 200 | siehe Commits |
| 5 Timeline | umgesetzt 2026-11-24: 53 Items (de 23 / en 30), 81 Dateireferenzen umgehängt; Frontend nicht prüfbar (HTTP 500 der Seiten, Offene Punkte 2) | siehe Commits |
| 6 Marker | erledigt 2026-11-24: Content Block in `ps14_site`, 224 Items (je 112), 3 Varianten; Marker eigenständig und in Akkordeons gerendert | siehe Commits |
| 7 Firmenwerte | erledigt 2026-11-24: Content Block in `ps14_site`, 38 Items, 63 Dateireferenzen, Farbschemata, Varianten `default`/`icons`, Modal; `/unternehmen/ueber-kist-escherich/unsere-werte` und Stellenangebote de/en HTTP 200 | siehe Commits |
| Test | Auf der lokalen DB per `update-schema` + einzelnen Wizards; ein Lauf `ps14-migrate` auf frischem Dump steht aus | – |

