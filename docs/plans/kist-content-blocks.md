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

### Key Decisions (offen, siehe unten)

### Offene Punkte (vor Task 2 klären)

1. **Ablage der Content Blocks**: alle in `ps14_site` (KIST-spezifisch, schnell)
   oder generische Module (Akkordeon, Tabs, Timeline) in einem gemeinsamen Paket
   (z. B. `ps14_component` oder eigenes), KIST-Module (Marker, Firmenwerte) in
   `ps14_site`?
2. **Verschachtelte Inhaltselemente** (Akkordeon/Tabs, Typ `records`): Collection
   mit Kind-Inhaltselementen (`tt_content` mit Elternverweis, wie bisher
   colPos 5628) oder Umbau auf b13/container (Spalte pro Item)?
3. **Installation** `ddev composer require friendsoftypo3/content-blocks` (nicht in
   den erlaubten Befehlen).
4. **Beispielseiten**: unter „Modules“ [11]; anlegen erst, wenn die Content Blocks
   existieren (die alten CTypes sind in v14 nicht registriert, MCP kann sie nicht
   anlegen). Varianten je Modul abstimmen (CLAUDE.md, Example Content).
5. **Folgeplan** für Hero, Downloads, Textmedia, Teaser?

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
| 1 Plan | Entwurf, offene Punkte 1–5 | – |
