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

### Key Decisions (2026-11-25)

1. **Hero als Content Block in `ps14_modules`**, CType `ps14_hero` per
   `typeName`, Felder `bodytext` und `image` als `useExistingField` → keine
   Datenmigration. KIST-Markup per Override in `ps14_site` (Key 120),
   Variante `16-9` per TSconfig in `ps14_site`.
2. **Downloads als Core-`uploads`**, erweitert durch `ps14_downloads`
   (Repository `ps14-downloads`, bisher v12 auf `master`: wird `12.x`,
   v14 auf `main` wie bei den anderen Extensions).
   Wizard: CType `ps14_downloads` → `uploads`, Referenzen
   `tx_foundation_file` → `media`. Der Link „Seite als PDF“
   (`tx_site_wkhtmltopdf_*`, 26 Elemente) ist ein KIST-Sonderfall und
   bleibt in `ps14_site`.
3. **Text & Bild / Text & Media** wie bei Unterschleißheim: `textpic` für
   Bilder, vorbereitet für mehrere Bilder (Galerie); `textmedia` nur für
   ein Einzelvideo. In KIST enthält `textpic` keine Videos (174 Bilder,
   4 Elemente mit 4 Bildern), `textmedia` nur Videos (25 mp4 mit
   Vorschaubild) → beide CTypes bleiben, keine CType-Migration.
   Umsetzung in `ps14_textmedia` (Repository `ps14-textmedia`, bisher v13
   auf `main` für den Core-Typ `image`: wird `13.x`, v14 auf `main`) für
   `image`, `textpic` und `textmedia`. ps14_foundation behält sein
   `textpic`-Rendering (kein Breaking Change innerhalb 14.x); KIST nutzt
   die Extension, Entfernen aus foundation erst mit der nächsten Major.
4. **Teaser über `ps14_menu`**: `pages` → `menu_pages`, `subpages` →
   `menu_subpages`, `categories` → `menu_categorized_pages`. Über jede
   Option wird einzeln entschieden, ob sie in `ps14_menu` (generisch) oder
   `ps14_site` (KIST) landet (Tabelle unten).
5. **Repositories** `ps14-downloads` und `ps14-textmedia` bestehen; Klon
   nach `packages/`, Push und Default-Branch auf GitHub macht der Nutzer.
6. **Nachtlauf** (2026-11-25): keine Merges nach `main`, keine Tags; alles
   auf Feature-Branches, Pakete per Path, `composer.lock` uncommittet.
   Lint-Befunde, die nur per Ausnahme lösbar wären, werden notiert. Test auf
   frischem Dump (`ddev pull prod-v12`) zuletzt, Beispielseiten danach in
   der nächsten Sitzung aus `docs/examples/content-blocks.yaml`.
   Reihenfolge: Hero, Text & Bild/Media, Downloads, Teaser, Beispiele.

### Teaser-Optionen: Ziel je Option (entschieden 2026-11-25)

| Option (v12) | Ziel | Umsetzung |
|---|---|---|
| `source` `pages`/`pagesProcessing` `pages` | Core | `menu_pages` (Reihenfolge der Auswahl) |
| `pagesProcessing` `subpages` | Core | `menu_subpages` |
| `source` `categories` + Startpunkt | `ps14_menu` | `menu_categorized_pages` neu in `ps14_menu`, Einschränkung auf Startpunkt (`pages`, `recursive`) |
| `hiddenEnabled` | `ps14_menu` | vorhanden: `includeNotInMenu` |
| eigene Seite ausschließen | `ps14_menu` | neue Option bzw. immer |
| `titleType` | `ps14_menu` | vorhandenes Feld `tx_foundation_elements_header` |
| `readmoreEnabled` | `ps14_site` | Feld `tx_site_teaser_readmore` |
| `layout` `default` | `ps14_site` | Ansicht `teaser` (KIST-Markup) |
| `layout` `technology`, `aside` | `ps14_site` | KIST-Ansichten (Partials) |
| `asideAlignment`, `asideMediaSize`, `textAlignment` | `ps14_site` | Felder `tx_site_teaser_*` nur für `aside` |
| `abstractType` `long` + `pages.tx_teaser_abstract_long` | `ps14_site` | Feld `tx_site_teaser_abstract_long` |
| `subpagesEnabled`, `subpagesLayout` | `ps14_site` | KIST-Felder, Unterseiten je Teaser |
| `pages.tx_teaser_title`, `_readmore`, `_media_large` | `ps14_site` | `tx_site_teaser_*` per Wizard |

### Beispielseiten (abgestimmt 2026-11-25)

| Modul | Varianten |
|---|---|
| Hero | `16-9`, `default` |
| Text & Bild | 1 Bild, 4 Bilder (Galerie), Bild links/rechts |
| Text & Media | Video mit Steuerelementen; Autoplay + Schleife ohne Steuerelemente |
| Downloads | Dateiliste mit Beschreibung; KIST-Link „Seite als PDF“ |
| Teaser | `teaser` (feste Auswahl), `technology`, `aside` links/rechts, Kategorien mit Startpunkt, Unterseiten mit Unterseiten-Liste |

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
| 1 Plan | erledigt 2026-11-25: Entscheidungen 1–6, Teaser-Optionen, Beispielvarianten | siehe Commits |
