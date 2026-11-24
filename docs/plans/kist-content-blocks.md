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

### Offene Punkte

1. Repository `ps14-modules` auf GitHub (legst du an; lokal bereits per
   `git init` unter `packages/ps14_modules`).
2. Folgeplan für Hero, Downloads, Textmedia, Teaser.

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
| 2 Content Blocks installieren | erledigt 2026-11-24: `friendsoftypo3/content-blocks` 2.4.10 in KIST; Grundgerüst `ps14_modules` (Branch `feature/skeleton`, lokal unter `packages/ps14_modules`, noch nicht installiert) | KIST `cf7cac5`, Paket `3019619` |
