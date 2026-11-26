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
| 2 Hero | erledigt 2026-11-25: Content Block `ps14/hero` in `ps14_modules` (Branch `feature/hero` `15dee9d`, generisches Template ungeprüft, da KIST überschreibt), KIST-Markup in `ps14_site` (Key 120, Bildgrößen wie v12, Variante `16-9` per TSconfig, RTE `ps14Minimal`), keine Datenmigration; 77 Seiten de/en mit Hero HTTP 200 (pid 215 hat keine en-Seite). Hero ohne Bild (3 Elemente) rendert ohne leeres `<img>` | `7b7883c`, `46468e7` |
| 3 Text & Bild / Media | erledigt 2026-11-26: `ps14_textmedia` v14 (Branch `13.x` aus altem `main`, Arbeit auf `feature/v14` `f464c15`): `image`/`textpic` mit Galerie `media-group` (generisch, getestet), `textmedia` als Einzelvideo mit Vorschaubild und Optionen `tx_textmedia_controls`/`_loop` (Namen wie v12, keine Migration). KIST: `textpic` behält `TextImage.html`, `image` das Core-Template, `textmedia` per Override mit `textmedia.scss`; Video-Partial mit KIST-Icons (P12). 12 Seiten mit Video de/en HTTP 200 (621 ohne en). `composer.json`/`check-composer-lock.js` uncommittet bis zum Release | siehe Commits |
| 4 Downloads | erledigt 2026-11-26: `ps14_downloads` v14 (Branches `12.x` und `main` aus `master`, Arbeit auf `feature/v14` `c596e62`) erweitert Core-`uploads` (Liste `{downloads}`, Titel, Beschreibung, Typ, Größe); Wizard `ps14Migration_downloadsMigration` (`ps14_migration` `feature/downloads-wizard` `65b0866`): lokal 30 Elemente → `uploads`, 6 Dateien → `media`. KIST: Partials `Downloads/*` inkl. „Seite als PDF“ (26 Elemente), Felder `tx_site_wkhtmltopdf_*` im Medien-Tab; 12 Seiten de/en HTTP 200 | siehe Commits |
| 5 Teaser | erledigt 2026-11-26: `ps14_menu` (`feature/teaser-support` `672c1e3`): `menu_categorized_pages` mit Startpunkt, Option `excludeCurrentPage`, `MenuFilterProcessor`. KIST: Ansichten `teaser`, `teaser-grey`, `teaser-technology`, `teaser-aside` (Partials `Teaser/Layout/*`, Templates `Menu*.html` Key 110, sonst v12-Menü-Markup), FlexForm `Menu.xml` (ps14_menu-Optionen, Sortierung, Teaser-Optionen), Seitenfelder `tx_site_teaser_*`, Badges per `CategoryBadgesProcessor`; Wizard `ps14Site_teaserMigration`: 423 Plugins → `menu_pages` 199 / `menu_subpages` 50 / `menu_categorized_pages` 174, Seitenfelder 30/54/34/22, 22 Bilder. 107 Seiten de/en HTTP 200 (pid 215 ohne en), Footer ohne Teaser-Fehler. Offen: Markup-Vergleich mit v12 (Anzahl/Reihenfolge der Einträge), Kategorie-Titel der Badges nicht übersetzt, `titleType` (v12-Option ohne Wirkung) entfällt | siehe Commits |
| 6 Beispielseiten | Beschreibung erledigt 2026-11-26: `docs/examples/content-blocks.yaml` um Hero [522], Text & Bild (neu), Text Media [621], Downloads [521], Teaser (neu) mit den abgestimmten Varianten erweitert; angelegt per MCP 2026-11-26, alle 10 Seiten unter [11] HTTP 200 mit erwartetem Markup: Hero [522] 3081 `16-9`, 3089 Standard; Text & Bild [718] 3080 rechts, 3088 links, 3093 Galerie (FlexForm nachgetragen, sonst weder Überschrift noch Text); Text Media [621] 3082 Steuerelemente, 3090 Autoplay/Loop; Downloads [521] 3083 Dateiliste, 3091 „Seite als PDF“; Teaser [719] 3094–3099 (Kategorien 3098: `recursive` 3 und `includeNotInMenu` nötig, 11 Einträge) | siehe Commits |
| 7 Bereinigung / Test | 2026-11-26: Step2-TypoScript von Hero, Downloads, Textmedia, Teaser entfernt, Readmes der Pakete, Optimierungsliste (P12, P13). Frischer Dump (`ddev pull prod-v12`) + `ps14-migrate`: Exit 0, alle Wizards OK (bekannter Schemafehler `ref_t3ver_state` wie in früheren Läufen); Zahlen wie Bestandsaufnahme: Hero 176, Text & Media 25, Text & Bild 162, `uploads` 30 (6 Dateien, 26 PDF-Links), Teaser 423 → `menu_pages` 199 / `menu_subpages` 50 / `menu_categorized_pages` 174 (Ansichten 222/50/6/145), Seitenfelder 30/54/34/22, 22 Bilder; 117 Seiten de/en: 234 × HTTP 200, 2 × 404 (215, 621 ohne en). Beispielseiten und MCP-Key nach dem Pull weg → nächste Sitzung | siehe Commits |

| Nachtrag | 2026-11-26 nach Hinweis des Nutzers: (1) Autoplay-Video (Text & Media als Hero, z. B. `/technologien/elektrostatik/true-ion`) blieb beim ersten Laden auf dem Vorschaubild, weil das Video vor `video.js` (Vite-Modul) startete → Zustand nachträglich setzen; (2) Teaser verlinkten Seiten mit `tx_foundation_navigation_not_linked` (v12: `isLinkable()`). Danach Vergleich mit live: alle 107 Seiten mit Teasern und 88 mit Hero/Text & Media/Downloads elementweise gleich (Einträge, Linkziele, Medien, Video-Attribute); offen nur die News-Karte im Mega-Menü (`news_newsselectedlist`, Punkt 6) | `501e427` |

### Nach dem Nachtlauf (für den Nutzer)

- Push der Paket-Branches: `ps14-modules` `feature/hero`; `ps14-textmedia` `13.x`, `feature/v14`; `ps14-downloads` `12.x`, `main`, `feature/v14` (Default-Branch auf GitHub → `main`, `master` löschen); `ps14-menu` `feature/teaser-support`; `ps14-migration` `feature/downloads-wizard`. Danach Review, Squash nach `main`, Releases (`ps14_modules` 14.1.0, `ps14_menu` 14.1.0, `ps14_textmedia` 14.0.0, `ps14_downloads` 14.0.0), dann `composer.json`/`composer.lock`/`build/check-composer-lock.js` in KIST committen.
- Vorlage (`main`): `phpstan.paths.php` und `SHARED_PACKAGES` um `ps14_downloads`, `ps14_textmedia` ergänzen (in KIST bereits).
- ~~MCP-Key neu erzeugen, Beispielseiten aus `docs/examples/content-blocks.yaml` anlegen~~ (erledigt 2026-11-26).
