# Requirements

### Überblick & Ziel

Schritt 2, Punkt 2, Teil 2 der KIST-Migration
([kist-v14-functionality.md](kist-v14-functionality.md), Entwurf Schritt 2;
Teil 1: [kist-content-blocks.md](kist-content-blocks.md)): Die übrigen
Mini-Extensions aus v12 — Hero, Downloads, Text & Media, Teaser — werden in
v14 abgelöst. Heute rendert keines davon (`no rendering definition`, u. a.
Teaser im Footer: uid 124, 2631).

- Stand: 2026-11-25
- Quelle der Zahlen: Produktionsdump (`ddev pull prod-v12`) nach
  `ps14-migrate`, nur nicht gelöschte Datensätze, (de) = Standardsprache.

### Bestandsaufnahme

| Modul (v12) | CType | Elemente (de) | Felder | Daten | Besonderheiten |
|---|---|---|---|---|---|
| Hero (`ps14_hero`) | `ps14_hero` | 176 (89) | Header (versteckt), `bodytext` (RTE minimal), `image` (Bild/Video, 1) | 192 Bilder (png/jpg), kein Video | Variante `16-9` (168) / `default` (8), Layout 4, Abstände `none`; Crop 16:9, Bildgrößen desktop/mobile per TypoScript |
| Hero-Slider | `ps14_hero_slider` | 0 | Elements, FlexForm | – | entfällt |
| Downloads (`ps14_downloads`) | `ps14_downloads` | 30 (15) | Header, `bodytext`, `tx_foundation_file` | nur 6 PDF-Referenzen, `bodytext` nie gefüllt | 26 Elemente mit `tx_site_wkhtmltopdf_enabled` (Link „Seite als PDF“, `ps14_kist_pdf`); Ausgabe Titel, Beschreibung, Typ, Größe |
| Text & Media (`ps14_textmedia`) | `textmedia` (Core) | 25 (13) | `assets` (Video), `image` (Vorschaubild, 1), Text | 25 mp4, 25 Vorschaubilder | `sys_file_reference.tx_textmedia_controls` (22), `tx_textmedia_loop` (24), `autoplay` (24); `imageorient` immer 0 |
| Teaser (`ps14_teaser`) | `list` / `ps14teaser_frontend` | 423 (211) | FlexForm (13 Optionen) | Seitenfelder `tx_teaser_title` (30), `tx_teaser_abstract_long` (54), `tx_teaser_readmore` (34), `tx_teaser_media_large` (22), dazu `abstract`, `media` | siehe unten |

Teaser-Optionen (Anzahl Elemente, de + en):

| Option | Werte |
|---|---|
| `source` | `pages` 249, `categories` 174 |
| `pagesProcessing` (bei `pages`) | `pages` (feste Auswahl) 164, `subpages` 56 |
| `layout` | `default` 233, `technology` 140, `aside` 50 |
| `titleType` (Überschrift) | `0` 235, `2` 78, `3` 47 |
| `readmoreEnabled` | 230 |
| `hiddenEnabled` (Seiten „nicht im Menü“) | 212 |
| `subpagesEnabled` (Unterseiten je Teaser) / `subpagesLayout` | 30 / `columns` 4, `default` 20 |
| `asideAlignment`, `asideMediaSize`, `textAlignment`, `abstractType` | nur bei `aside`, 7–30 |
| `categories` + Startpunkt (`pages`, `recursive`) | Kategorien 136–182, eingeschränkt auf einen Seitenbaum |

Das Teaser-Plugin ist Extbase (`PageController`, eigenes `PageRepository`
mit Kategorie-, Ausschluss- und Sortierlogik). In v14 gibt es keine
`list_type`-Plugins mehr — jede Lösung braucht eine CType-Migration.

Vorhanden in v14: geparkte Partials (`Partials/Hero`, `Partials/Downloads`,
`Partials/Teaser`), SCSS (`modules/hero.scss`, `downloads.scss`,
`teaser.scss`, `textmedia.scss`), TypoScript in
`Configuration/TypoScript/Extensions/Step2/` (Hero, Downloads, Textmedia,
Teaser); in `ps14_component` die Komponente `Card`; in `ps14_menu` die
Menü-Ansichten `default`, `listing`, `icon`.

### Scope

**In Scope**
- Hero, Downloads, Text & Media, Teaser in v14 lauffähig mit KIST-Markup.
- Datenübernahme per Upgrade-Wizard (CType, Felder, Dateireferenzen,
  FlexForm), Test auf frischem Dump mit `ps14-migrate`.
- Beispielseiten unter „Modules“ [11] per MCP, Erweiterung von
  `docs/examples/content-blocks.yaml`.

**Out of Scope**
- Hero-Slider (nicht genutzt), neues Markup nach Vorlage (Optimierung O19).
- „Seite als PDF“ selbst (Middleware, Seitentyp): Schritt 2, Punkt 9 — hier
  nur die Frage, wo der Link künftig hängt.

### Key Decisions (Vorschläge 2026-11-25, offen)

1. **Hero als Content Block** (Vorschlag Nutzer). Empfehlung: in
   `ps14_modules` (generisch, wie Akkordeon/Tabs), CType `ps14_hero` per
   `typeName`, Felder `bodytext` und `image` als `useExistingField` →
   **keine Datenmigration** nötig. KIST-Markup per Override in `ps14_site`
   (Key 120). Variante `16-9` per TSconfig in `ps14_site`.
2. **Downloads als Core-`uploads`** (Vorschlag Nutzer), erweitert durch
   eine neue Extension `ps14_downloads` (eigenes Repository, gemeinsames
   Paket): Template/Markup, Ausgabe von Titel, Beschreibung, Typ und Größe,
   `tx_foundation_elements_header`. KIST-Sonderfelder (`tx_site_wkhtmltopdf_*`)
   bleiben in `ps14_site`. Wizard: CType `ps14_downloads` → `uploads`,
   Referenzen `tx_foundation_file` → `media`.
3. **Text & Media** (Vorschlag Nutzer: ggf. über `textpic`, gleicher Weg wie
   Downloads). Empfehlung: **Core-`textmedia` behalten** (für Video gedacht,
   CType bleibt → keine CType-Migration) und um eine Extension
   `ps14_textmedia` erweitern: Felder `tx_textmedia_controls`/`_loop` an
   `sys_file_reference` (Namen bleiben → keine Datenmigration),
   Vorschaubild, Template. Alternative `textpic`: Bild-Galerie aus
   foundation (`TextImageProcessor`) müsste um Video erweitert werden, dazu
   Wizard für 25 Elemente.
4. **Teaser** (Vorschlag Nutzer: Extension lassen oder über `ps14_menu`).
   Empfehlung: **`ps14_menu`** mit Core-Menüs — `pages` → `menu_pages`,
   `subpages` → `menu_subpages`, `categories` → `menu_categorized_pages`
   (neu in `ps14_menu`, inkl. Einschränkung auf Startpunkt), KIST-Layouts
   `default`/`technology`/`aside` als Ansichten in `ps14_site` (Basis
   `co:card`), Optionen als FlexForm/Felder in `ps14_menu`, Seitenfelder
   `tx_teaser_*` → `tx_site_teaser_*` per Wizard. Größter Teil des Plans;
   Alternative: `ps14_teaser` als v14-Extension (CType-Plugin) mit dem
   bisherigen Extbase-Code.

### Offene Punkte

1. „ps14_media“ im Vorschlag zum Teaser — gemeint ist vermutlich
   `ps14_menu`? Eine Extension `ps14_media` gibt es nicht.
2. Hero: `ps14_modules` (generisch) oder `ps14_site` (nur KIST)?
3. Text & Media: Core-`textmedia` + `ps14_textmedia` oder `textpic`?
4. Teaser: `ps14_menu` oder eigene Extension? Bei `ps14_menu`: Optionen,
   die nur KIST braucht (`aside*`, `abstractType`, `subpagesEnabled`), in
   `ps14_menu` oder per `ps14_site`?
5. Downloads: 26 von 30 Elementen sind nur der Link „Seite als PDF“ ohne
   Dateien. Bleibt das ein Download-Element (Feld in `ps14_site`) oder wird
   es ein eigenes Element der PDF-Funktion (Punkt 9)?
6. Neue Repositories (`ps14-downloads`, ggf. `ps14-textmedia`) legt der
   Nutzer an und nimmt sie in den Composer-Token auf.

### Risks

- Teaser: 423 Elemente mit vielen Kombinationen; Kategorie-Quelle mit
  Startpunkt hat im Core kein Gegenstück; Sortierung der festen Auswahl,
  Ausschluss der eigenen Seite und Übersetzungs-Overlay müssen erhalten
  bleiben.
- Ein Teaser-Element liegt im Footer auf jeder Seite (uid 124, 2631) —
  Fehler dort betreffen alle Seiten.
- Beispielseiten lokal: verschwinden mit jedem Pull, Wiederherstellung über
  `docs/examples/content-blocks.yaml`.

### Validierungsansatz

- `ps14-migrate` auf frischem Dump, Anzahl je CType/Option vor und nach der
  Migration, alle Seiten mit diesen Elementen HTTP 200 (de/en).
- Markup-Vergleich mit `kist-escherich-com` (v12) an je einer Seite pro
  Modul/Ansicht; keine `no rendering definition` mehr im Footer.
- Beispielseiten im Frontend (HTTP 200, erwartetes Markup).

# Tasks

### Task 1: Plan
Bestandsaufnahme, Entscheidungen zu den offenen Punkten.

### Task 2: Hero
Content Block, KIST-Template, Variante, Bildgrößen, Assets.

### Task 3: Text & Media
Extension bzw. Erweiterung, Template, Video-Optionen.

### Task 4: Downloads
`ps14_downloads`, Wizard, KIST-Sonderfelder.

### Task 5: Teaser
Je nach Entscheidung `ps14_menu`-Erweiterung oder eigene Extension,
KIST-Ansichten, Wizard (CType, FlexForm, Seitenfelder).

### Task 6: Beispielseiten
Je eine Seite unter „Modules“ [11] per MCP, abgestimmte Varianten;
`docs/examples/content-blocks.yaml` erweitern.

### Task 7: Bereinigung und Doku
Step2-Dateien entfernen, Readmes, Optimierungsliste, Test auf frischem
Dump.

# Status

| Task | Stand | Commit |
|---|---|---|
| 1 Plan | in Arbeit 2026-11-25: Bestandsaufnahme, Entscheidungen offen | – |
