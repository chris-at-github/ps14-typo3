# Requirements

### Überblick & Ziel

Das KIST-Projekt (`~/www/kist-escherich-com`, TYPO3 12.4, Classic-Mode)
wird auf v14 gehoben. **Schritt 1** (dieser Plan) stellt die Funktionalität
des Projekts im v14-Projekt (`kist-escherich-com-v14`, Branch
`kist-escherich`) bereit:

- Alle projektspezifischen Anpassungen liegen in `ps14_site`.
- Fehlende, aber benötigte Funktionen der alten `ps14_foundation` wandern
  ebenfalls nach `ps14_site` (foundation wird nie projektspezifisch
  angepasst).
- CSS/JS werden von Webpack (Laravel Mix) auf Vite umgestellt, die
  Struktur der Quellen bleibt erhalten.

**Schritt 2** (eigener Plan): Datenmigration, Anpassung der übrigen
Extensions (news, powermail, ke_search, tt_address, entity*, contact,
chart, eigene Mini-Extensions) und Optimierungsrunde Frontend.

Bestehende Grundlagen: [migration-kist-v14.md](migration-kist-v14.md)
(Änderungen der Vorlage mit KIST-Bezug), [feature-inventory-kist.md](feature-inventory-kist.md)
(Feature-IDs A–H). Pfade alt relativ zu
`~/www/kist-escherich-com/public/typo3conf/ext/`.

### Scope

**In Scope**
- Frontend-Markup von KIST: Seiten-Layouts, Header, Mega-Menü,
  Meta-/Sprach-/Footer-Navigation, Breadcrumb, Footer, Sticky-Leiste,
  Such-Widget, Content-Layout und Content-Templates aus dem alten
  `ps14_site` sowie die dafür nötigen alten foundation-Templates.
- SCSS/JS/SVG/Fonts/Icons aus `ps14_site/Resources/Public/` nach
  `Resources/Private/Assets/` (bzw. `Resources/Public/` für statische
  Dateien), Build mit Vite, ein Entrypoint pro bisheriger Webpack-Datei.
- Einbindung der Assets in TYPO3 (global, kritisches Inline-CSS/JS, pro
  Modul).
- Fehlende foundation-Funktionen (ViewHelper, DataProcessor, Felder) in
  `ps14_site` unter `Ps14\Site\…`.
- TCA, Page-/User-TSconfig, RTE, Sprachdateien, Backend-Layouts, Site
  Settings.
- Neue Felder mit Präfix `tx_site_`, Datenmigrationen als Upgrade-Wizards
  (umgesetzt in Schritt 1, ausgeführt in Schritt 2).
- Dateien, die zu anderen Extensions gehören (Templates, TypoScript,
  SCSS/JS), werden in die v14-Struktur übernommen, aber erst in Schritt 2
  aktiviert.

**Out of Scope**
- Datenimport aus der KIST-Datenbank, Ausführen der Wizards, Redirects.
- Installation und v14-Anpassung der Fremd- und Mini-Extensions.
- PHP-Klassen, die von nicht installierten Extensions abhängen
  (KeSearch-Indexer, CleverReach-Finisher, Filter-Framework,
  PDF-Middleware): kommen mit ihrer Extension in Schritt 2.
- Optimierung von CSS/JS (Bootstrap 4 ablösen, BEM-Angleichung an die
  Vorlage, CSS-Splitting D12 neu denken).
- Änderungen an `ps14_foundation`, `ps14_component`, `ps14_container`,
  `ps14_menu` (Ausnahme nur nach Rückfrage, siehe Offene Punkte).

### User Story

- Als Entwickler möchte ich das KIST-Frontend unter v14 mit dem bisherigen
  Markup und den bisherigen Styles ausliefern, damit die Datenmigration in
  Schritt 2 auf einer funktionierenden Seite aufsetzt.

### Akzeptanzkriterien

- `ddev vite` (Build) erzeugt alle Entrypoints ohne Fehler.
- `ddev exec npm run lint` ist grün (Ausnahmen nur nach Freigabe).
- Die Seiten der lokalen DB antworten mit HTTP 200, ohne Fluid-Fehler.
- Header, Mega-Menü, Footer und Content-Elemente erzeugen das Markup des
  alten Projekts (Stichprobenvergleich der Klassen mit kist-escherich-com).
- CSS/JS werden geladen: global, kritisch inline, pro Modul nur bei Bedarf.
- Alle neuen Felder heißen `tx_site_*`; für jede Feldänderung gegenüber v12
  gibt es einen Upgrade-Wizard.

### Aktueller Zustand

- `ps14_site` auf `kist-escherich` = Stand der Vorlage (`main`): neues
  Markup, neue SCSS-Struktur, Vite mit 4 Entrypoints
  (`Configuration/ViteEntrypoints.json`).
- foundation v14 (`vendor/ps14/ps14_foundation`) enthält weiterhin
  Elements, Readmore und die meisten `tx_foundation_*`-Felder (TCA,
  Spalten automatisch aus TCA).
- Lokale DB = Vorlagen-DB (keine KIST-Inhalte), Beispielseiten unter
  „Modules“ [29].
- Altes Frontend: Laravel Mix, ~22 CSS- und ~12 JS-Dateien, kritisches
  CSS/JS inline über `PageResourceProcessor`, Modul-CSS über
  `ModuleProcessor` und TypoScript `inlineCss` (beides in v14 entfallen),
  JS als CommonJS (`require`), vendored Bootstrap 4.

### Key Decisions

1. **Altes Markup bleibt** (entschieden): alte `ps14_site`-Templates und die
   benötigten alten foundation-Templates überschreiben foundation v14. Was
   aus der Vorlage ohne Weiteres passt, wird genutzt (z. B. Site Settings,
   Backend-Layouts, Navigation-Content über `RECORDS`), sonst gilt das alte
   Markup. Die SCSS/JS der Vorlage werden auf dem Kunden-Branch durch die
   KIST-Quellen ersetzt. Folge: `git merge main` erzeugt in `ps14_site`
   häufiger Konflikte (bewusst in Kauf genommen bis zur Optimierungsrunde).
2. **Ein Vite-Entrypoint pro alter Webpack-Datei** (entschieden):
   `site`, `print`, `pdf`, `editor`, `site-inline`, `vendors/tobii`,
   `modules/*` (CSS) sowie `site`, `site-inline`, `site-pdf`,
   `components/*`, `vendors/*`, `modules/*` (JS). Einbindung pro Modul mit
   `vac:asset.vite` im Template bzw. per TypoScript.
3. **Fremd-Extension-Dateien übernehmen, später aktivieren** (entschieden):
   Templates unter `Resources/Private/Extensions/<Ext>/`, TypoScript-Dateien
   ohne `@import`, SCSS/JS als Entrypoints. PHP-Klassen mit Abhängigkeiten
   zu fehlenden Extensions kommen erst in Schritt 2 (sonst brechen
   Autoload und PHPStan).
4. **Struktur der Quellen**: `Resources/Public/Sass/` →
   `Resources/Private/Assets/Scss/`, `Resources/Public/Js/` →
   `Resources/Private/Assets/Js/` (Unterordner unverändert),
   `Svg/Font/` → `Assets/Svg/Font/` (Iconfont-Build der Vorlage),
   `Svg/Embed/`, `Fonts/`, `Icons/` → `Resources/Public/…`. Template-Pfade
   `assets/svg/…` → `EXT:ps14_site/Resources/Public/Svg/Embed/…`.
5. **JS auf ES-Module**: `require('./x')` → `import './x.js'`, globale
   Helfer bleiben vorerst global (keine Umstrukturierung). Polyfills
   entfallen nur, wenn sie reine No-ops in aktuellen Browsern sind.
6. **Namensraum**: neue Klassen unter `Ps14\Site\…`, ViewHelper-Namespace
   `site` (`xmlns:site="http://typo3.org/ns/Ps14/Site/ViewHelpers"`).
   Templates, die `fo:` für entfallene ViewHelper nutzen, werden auf `site:`
   umgestellt; vorhandene foundation-v14-ViewHelper werden weiter genutzt.
7. **Felder**: neue Felder `tx_site_<name>`. Alte `tx_foundation_*`-Felder,
   die es in foundation v14 noch gibt, bleiben unverändert.
8. **Elements → Content Blocks** (entschieden): Das Elements-IRRE
   (`tx_foundation_domain_model_elements`) wird nicht weitergeführt. Die
   darauf aufbauenden Elemente (Akkordeon, Tabs, Timeline, Hero/Slider,
   Marker, Werte, Downloads) werden Content Blocks mit Collections. Umsetzung
   zusammen mit den Mini-Extensions in Schritt 2, inkl. Wizard Elements →
   Collections. In Schritt 1 werden keine Elements-abhängigen Templates
   aktiviert; die alten Partials werden nur geparkt (Task 6).
9. **Optimierungen** werden nicht in Schritt 1 umgesetzt, sondern in
   [kist-v14-optimizations.md](kist-v14-optimizations.md) gesammelt.
10. **Offene Punkte 1–4** freigegeben (2026-11-22): `vendors/` von
    Stylelint/ESLint ausgeschlossen, `ddev npm install` erlaubt für die
    genannten Pakete, Iconfont-Klassen auf `.icon-font-*`, Container-Wizard
    vorerst in `ps14_site`.

### Lückenanalyse foundation v12 → v14

| Alt (foundation v12) | v14 | Aktion |
|---|---|---|
| ViewHelper `media.isImage`, `media.isVideo`, `format.uri` | fehlt | nach `ps14_site` (`site:`) |
| ViewHelper `address.entity`, `jsonLd.*`, `AddressController`, Address-Templates | fehlt | Schritt 2 (tt_address) |
| `PageResourceProcessor`, `InlineResourceService` (kritisches CSS/JS inline) | fehlt | ersetzt durch Vite (`?inline` bzw. `vac:asset.vite` inline), kein Port |
| `ModuleProcessor`-CSS/JS pro Modul | entfallen | ersetzt durch `vac:asset.vite` im Modul-Template |
| `NavigationContentProcessor`, `ContentProcessor`, MM-Tabelle | ersetzt (`RECORDS`, UID-Liste) | v14 nutzen, Wizard MM → Liste |
| Seitentyp 120 „Typolink“, XCLASS `TextMenuContentObject` | entfallen | Core-Seitentyp „Link“, Wizard 120 → 3 |
| `ContentFieldProvider` (`field()` in TSconfig) | entfallen | TSconfig auf `types.<CType>` |
| `PluginProcessor` | entfallen | prüfen, ob KIST-Templates ihn brauchen, sonst entfällt |
| `CropImageService` | entfallen | entfällt (Inventar B6) |
| Templates `Content/Image.html`, `Partials/Components/Address.html`, `Navigation/Default/Content.html` | fehlt | Image/Navigation-Content nach `ps14_site` falls genutzt; Address Schritt 2 |
| Felder `pages.tx_foundation_disable_sticky` | entfallen | `pages.tx_site_disable_sticky` + Wizard |
| Feld `tt_content.tx_foundation_text_layout` | entfallen | Nutzung in KIST prüfen; falls genutzt `tx_site_text_layout` + Wizard |
| tt_address-Felder, Tabelle `…_openinghours` | entfallen | Schritt 2 (tt_address) |

### Upgrade-Wizards (in `ps14_site`, Ausführung in Schritt 2)

| Wizard | Quelle → Ziel |
|---|---|
| `siteDisableSticky` | `pages.tx_foundation_disable_sticky` → `tx_site_disable_sticky` |
| `siteNavigationContent` | `tx_foundation_pages_content_mm` → `pages.tx_foundation_navigation_content` (UID-Liste, Sortierung) |
| `siteNavigationLayout` | `pages.tx_foundation_navigation_layout = '0'` → `''` |
| `sitePageTypeLink` | `doktype 120` + `url` → `doktype 3` + `link` (inkl. `t3://`, Anker, Dateien) |
| `siteContainerRatio` | Container-FlexForm `columnOneWidth…` → `ratio` (Tabelle in migration-kist-v14.md 5.7) |

Wizards lesen alte Spalten/Tabellen über den QueryBuilder und prüfen in
`updateNecessary()`, ob die Quelle existiert (die Spalten fehlen im
v14-TCA). Weitere Wizards für Elements/Fremd-Extensions entstehen in
Schritt 2.

### Offene Punkte (vor Task 2 klären)

1. **Lint-Ausnahmen**: Das vendored Bootstrap 4 (`Scss/vendors/bootstrap`,
   `Js/vendors/bootstrap`) und das alte SCSS/JS werden viele
   Stylelint-/ESLint-Funde erzeugen. Vorschlag: `vendors/` per
   `.stylelintignore`/ESLint-`ignores` ausschließen, die übrigen
   KIST-Quellen fixen (zuerst `lint:fix`). Freigabe nötig.
2. **npm-Pakete**: zusätzlich nötig sind voraussichtlich
   `postcss-inline-svg` (SVG in CSS) sowie die Laufzeit-Abhängigkeiten
   `@midzer/tobii`, `chart.js`, `micromodal`, `tiny-slider`. `ddev npm
   install` steht nicht in der Liste erlaubter Befehle — Freigabe nötig.
   `postcss-cachebuster` und `whatwg-fetch` entfallen (Vite-Hashes, alle
   Zielbrowser haben `fetch`).
3. **Iconfont-Klassen**: Das alte `_icons.scss` (iconfont-plugin-webpack)
   nutzt andere Klassennamen als der Vorlagen-Build (`.icon-font-<name>`).
   Vorschlag: Namen im KIST-SCSS/Markup auf `.icon-font-*` umstellen statt
   das Build-Skript zu ändern.
4. **Container-Wizard**: Der FlexForm-Wizard ist generisch für
   `ps14_container` v2 → v14. Vorschlag: vorerst in `ps14_site`, später
   ggf. nach `ps14_container` verschieben.

### Risks

- **Sass-Kompatibilität**: altes SCSS nutzt `@import`, `/`-Division und
  globale Funktionen; `sass-embedded` 1.89 gibt Deprecation-Warnungen aus,
  Bootstrap 4 ggf. Fehler. Gegenmaßnahme: `silenceDeprecations` in der
  Vite-Konfiguration, keine Umstellung auf `@use` in Schritt 1.
- **Absolute Pfade in SCSS** (`/assets/fonts`, `/assets/svg`): müssen auf
  relative Pfade umgestellt werden, damit Vite sie auflöst.
- **JS mit Globals**: einzelne Dateien verlassen sich auf
  Ausführungsreihenfolge oder `window`-Variablen; nach der Umstellung auf
  ES-Module (strict mode) können Fehler auftreten → im Browser prüfen.
- **Template-Mischung**: alte Partials erwarten Variablen alter
  DataProcessor (`ModuleProcessor`, `ContentElementProcessor`). Jedes
  Template wird gegen die v14-Prozessoren geprüft.
- **Keine KIST-Inhalte lokal**: das Markup lässt sich in Schritt 1 nur an
  Vorlagen-/Beispielinhalten prüfen; der vollständige Vergleich folgt mit
  der Datenmigration.

### Validierungsansatz

- Build (`ddev vite`), Lint (`ddev exec npm run lint`), PHPStan.
- `ddev typo3 cache:flush`, dann `curl` auf Startseite, Unterseiten und
  „Modules“-Beispielseiten: HTTP 200, keine Fluid-Exceptions im Log.
- Markup-Stichproben (Header, Mega-Menü, Footer, Text/Bild, Menü) gegen
  das laufende Altprojekt (`kist-escherich-com`, gleiche Klassen).
- Browser-Sichtprüfung durch dich (Layout, JS-Funktionen: Off-Canvas,
  Drilldown, Sticky, Suche).

# Tasks

### Task 1: Plan

Dieser Plan; Freigabe der Entscheidungen und offenen Punkte.

### Task 2: Assets nach Vite (ohne TYPO3-Einbindung)

- SCSS/JS/SVG/Fonts/Icons verschieben (Decision 4), Vorlagen-SCSS/JS auf
  dem Kunden-Branch entfernen.
- `ViteEntrypoints.json` mit allen Entrypoints, `vite.config.js` (Sass-
  Optionen, PostCSS inline-svg), npm-Abhängigkeiten.
- JS auf ES-Module, SCSS-Pfade relativ, Iconfont-Glyphen nach
  `Assets/Svg/Font/`, `ddev exec node build/build-iconfont.js`.
- Build und Lint grün.

### Task 3: Seiten-Rahmen

- Site Settings (`config/sites/kist-escherich/settings.yaml`):
  Navigations-IDs, `css.*`/`js.*`-Filepaths, eigene Settings
  (`pages.contact`, `pages.individualProduct`) als Set in `ps14_site`.
- Einbindung: globale Assets, `site-inline` (CSS/JS) inline im `<head>`,
  `print`, `pdf` (vorbereitet).
- `Layouts/Page/Default.html`, `Product.html`, `Templates/Page/Default.html`,
  Partials Header, Footer, Sticky, Search, Navigationen (Main mit
  Mega-Menü-Layouts card/largeCard/product, Meta, Language, Breadcrumb,
  Footer), Backend-Layouts `default`/Footer (Vorlage) und `product`.
- Feld `tx_site_disable_sticky` (+ vorhandenes `tx_site_disable_sticky_pdf`).

### Task 4: Content

- `Layouts/Content/Default.html`, Header-Partials, Templates `Shortcut`,
  `TextImage`, Menüs, ggf. `Image`; `MenuProcessor` + FlexForm
  `MenuSubpages.xml`; Container-Templates auf `ps14_container` v14
  (`ratio`) mit altem Markup.
- Fehlende ViewHelper (`site:media.isImage`, `site:media.isVideo`,
  `site:format.uri`) und Modul-Asset-Einbindung per `vac:asset.vite`.
- Nutzung `tx_foundation_text_layout` klären.

### Task 5: Backend-Konfiguration

- `page.tsconfig` (Bedingungen → `types.<CType>`, KIST-Labels,
  TCAdefaults, TCEMAIN-Rechte), `user.tsconfig`, RTE-YAML (Default,
  Minimal, Global), Sprachdateien (`locallang_*`), TCA-Overrides `pages`,
  `tt_content` (PDF-Felder `tx_site_wkhtmltopdf_*` vorbereiten).

### Task 6: Dateien für Schritt 2 parken

- Templates `Resources/Private/Extensions/{News,Powermail,KeSearch,
  Foundation/Address}`, TypoScript `Extensions/*.typoscript` ohne Import,
  Partials der Mini-Extensions (Accordion, Hero, Marker, Teaser, Timeline,
  Downloads, Filter, Components), zugehörige SCSS/JS-Entrypoints.
- PHP-Klassen mit Fremdabhängigkeit als Liste im Plan für Schritt 2
  (Quelle bleibt im Altprojekt).

### Task 7: Upgrade-Wizards

- Wizards aus der Tabelle oben in `ps14_site/Classes/Upgrades/`,
  registriert per `#[UpgradeWizard]`; Test gegen einen KIST-DB-Dump folgt
  in Schritt 2.

### Task 8: Prüfung und Doku

- Validierung (siehe oben), Status hier, Ergänzungen in
  `migration-kist-v14.md`, Entwurf der Aufgabenliste für Schritt 2.

# Status

### Notizen Task 2

- Abweichung von Decision 4: `Svg/Embed/` liegt nach Konvention der Vorlage
  unter `Resources/Private/Assets/Svg/Embed/` (nicht `Public/`).
  Template-Dateien `menu.svg`, `x.svg` bleiben bis Task 3.
- `postcss-inline-svg`, `postcss-cachebuster`, `whatwg-fetch` entfallen
  (`svg-load()` wird nirgends genutzt, Hashes durch Vite).
- npm: `@midzer/tobii@2.4.0`, `chart.js@3.9.1`, `micromodal@0.4.10`,
  `tiny-slider@2.9.4` (Versionen wie v12).
- Vite: `silenceDeprecations` für Sass, `renderBuiltUrl` erzeugt absolute
  URLs in CSS (`/_assets/vite/…`), damit `site-inline` inline funktioniert.
- Iconfont: Mixin `iconfont($icon)` bleibt, nutzt jetzt
  `var(--icon-font-<name>)`; Schrift und Variablen nur in `site-inline` und
  `pdf` (`bootstrap/_iconfont.scss`, generiert). Klassen `.icon.icon-*`
  wurden nirgends genutzt.
- JS: `site.js` mit ES-Imports; Bootstrap Collapse/Tab über
  Wrapper-Entrypoints (`components/collapse.js`, `tab.js`), npm-Vendors über
  Wrapper, die `window.*` setzen; `filter` ebenfalls global.
  `validation/phone.js` (UMD, ungenutzt) nach `Js/vendors/`.
- `site-inline.js` ist kein Entrypoint, sondern wird per `f:asset.script
  inline` eingebunden (`Partials/Page/Resources/InlineScript.html`).
- Lint (Freigabe 2026-11-22): `vendors/bootstrap` von Stylelint, ESLint und
  editorconfig-checker ausgeschlossen; Stylelint-Override für die
  KIST-SCSS (7 Namens-/Struktur-Regeln), ESLint-Globals `xna`, `tns`,
  `MicroModal`, `Chart`, `Tobii`, `filter`. Übrige Funde behoben
  (Variablen `$a--b` → `$a-b`, leere Kommentare/Blöcke, `grid-template`,
  ungenutzte Parameter).
- SCSS-Änderungen ohne Auswirkung auf die Kaskade: Druckregeln aus
  `print.scss` nach `layout/_print.scss`; doppelte Imports in `pdf.scss`
  entfernt; CKEditor-4-Stile in `editor.scss` entfernt,
  `.cke_editable` → `.ck-content`.

| Task | Stand | Commit |
|---|---|---|
| 1 Plan | erledigt, freigegeben 2026-11-22 | siehe `git log` |
| 2 Assets/Vite | erledigt 2026-11-22 (siehe Notizen Task 2) | siehe `git log` |
| 3 Seiten-Rahmen | erledigt 2026-11-22 (siehe Notizen Task 3) | siehe `git log` |
| 4 Content | erledigt 2026-11-22 (siehe Notizen Task 4) | siehe `git log` |
| 5 Backend-Konfiguration | erledigt 2026-11-22 (siehe Notizen Task 5) | siehe `git log` |
| 6 Dateien für Schritt 2 | erledigt 2026-11-22 (siehe Notizen Task 6) | siehe `git log` |
| 7 Upgrade-Wizards | erledigt 2026-11-23 (siehe Notizen Task 7) | siehe `git log` |
| 8 Prüfung und Doku | erledigt 2026-11-23 (siehe Notizen Task 8) | siehe `git log` |

### Notizen Task 3

- Site Set `site/settings` (`ps14_site/Configuration/Sets/Site/`) mit
  `pages.contact`, `pages.footerContent`, `pages.individualProduct`,
  `tracking.etrackerSecureCode`, `tracking.etrackerProxyDomain`; abhängig
  von `foundation/settings`, in `config/sites/ps14/config.yaml` aktiv.
- Templates aus dem Altprojekt mit altem Markup: Layouts `Default`,
  `Product`, `Empty`, Seiten-Template, Header, Suche, Sticky-Leiste, Footer,
  Navigationen (Main mit Mega-Menü card/largeCard, Meta, Sprache, Footer,
  Breadcrumb), Navigations-Partials `Item`/`Link`/`Listing`,
  `Components/Card`.
- Abweichungen vom alten Stand:
  - Navigationen per `f:cObject` statt `f:format.raw` der
    FLUIDTEMPLATE-Variablen; `levels = 4` direkt an `navigation.main`.
  - Navigation Content über `block.navigationContent` (UID-Liste, nur erste
    Ebene, wie in KIST genutzt: Seiten 52, 76, 77, 134); das leere
    `navigation__content` unterhalb tieferer Ebenen entfällt.
  - `fo:settings.get` → `site.settings.*`; Sticky-Kontakt und Suche nur,
    wenn die Seiten-ID gesetzt ist.
  - Logo-Leiste im Footer per `database-query` (Kennung
    `tisax-certification`), da das Content-Model in foundation v14 kein
    Bild/Link mehr hat. Ausgabe wie alt (Bild, Text, Link `header_link`).
  - Footer-Adresse (tt_address) geparkt unter
    `Resources/Private/Extensions/Foundation/Partials/Page/Layout/Address.html`
    (Schritt 2), im Footer als optionales Partial eingebunden.
  - Kritisches CSS (`site-inline.scss`) per `vite:asset inlineCss`,
    `site-inline.js` per `f:asset.script` im `<head>` (Partials
    `Page/Resources/InlineStyle.html`, `InlineScript.html`).
  - Favicons/Manifest über das foundation-Partial `Page/Resources/Meta`
    (Override mit `site.webmanifest`, Icon-Pfade relativ).
  - etracker über Site Settings, nicht im Development-Kontext.
  - `block.linkToPdf` ohne `TSFE` (`page:uid`), Ziel-Seitentyp 8080 kommt
    mit der PDF-Extension in Schritt 2.
- Felder: `pages.tx_site_disable_sticky` (ersetzt
  `tx_foundation_disable_sticky`), `pages.tx_site_disable_sticky_pdf`
  (unverändert), Palette `site_sticky`. Seitenmedien mit Crop-Varianten
  desktop/mobile.
- Backend-Layouts: `default` (foundation) + colPos 20, `product`
  (0/15/20), `footer` (0/2, nur unterhalb `pages.footerContent`).
- Entfernt (Vorlage, auf dem Kunden-Branch ungenutzt):
  `HeadingLevelProcessor`, `Block/Footer.setup.typoscript`,
  `Partials/Navigation/Main/Layout.html`, `menu.svg`, `x.svg`, Setting
  `consent.settingsButton`.
- Gefunden in foundation v14 (nicht geändert): `fo:format.sanitize`
  ignoriert das Argument `value` (nur Inline-/Kind-Syntax funktioniert).

### Notizen Task 4

- `Ps14\Site\DataProcessing\ContentElementProcessor` (erweitert den
  foundation-Prozessor, `ce-frame--outer`) als `lib.contentElement`
  dataProcessing 100; Layout `Content/Default.html` mit `ce-frame`-Markup.
- Partials mit altem Markup: `Header/All`, `Header/SubHeader`,
  `Content/Bodytext` (`ce-bodytext`), `Media/Main` (Caption
  `image--caption`). `Content/Readmore` aus foundation v14 (gleiches Markup,
  Daten über die Record-API).
- Templates: `TextImage` (KIST-Variante, bindet
  `modules/text-image.scss` per `vite:asset` ein), `Shortcut`, Container
  2/3-spaltig mit altem Grid (`row`, `col-12 col-md-<n>`), Breite aus
  `flexform.ratio` (25/33/50/66/75 → 3/4/6/8/9). Leere Spalten werden wie
  alt nicht ausgegeben.
- Text & Bild: Crop-Variante `default` wie in v12 (foundation v14 nutzt
  `desktop`/`mobile`).
- Menü Unterseiten: Sortierung per FlexForm ohne eigenen PHP-Prozessor,
  Core-`MenuProcessor` mit `alternativeSortingField` (stdWrap/CASE auf
  `flexform: pi_flexform:settings.sorting`). FlexForm mit festen Items
  statt `itemsProcFunc` (B11, C9). Menü ausgewählter Seiten mit
  `includeNotInMenu`.
- ViewHelper `site:media.isImage`, `site:media.isVideo`,
  `site:format.uri` (Namespace `Ps14\Site\ViewHelpers`); genutzt erst von
  Templates aus Schritt 2 (Hero, Adresse, Kontakt, Produkte), daher nur per
  PHPStan geprüft.
- Entfallen: `Image`-Template (B4, in KIST nicht genutzt), Vorlagen-`Div`
  (KIST nutzt den Core-Stand `ce-div`), alter `MenuProcessor`,
  Modul-CSS/JS über `ModuleProcessor` (`importCss`/`importJs`) → in
  Schritt 2 je Template per `vite:asset`.
- Geprüft: `/de/`, `text`, `header`, `menue`, `container`, `komponenten`,
  `images`, `impressum` HTTP 200; Klassen von Rahmen, Header und Bodytext
  stimmen mit `kist-escherich-com` überein.

### Notizen Task 5

- `page.tsconfig`: alte `[field('CType') === …]`-Bedingungen auf
  `TCEFORM … .types.<CType>` und `TCAdefaults … .types.<CType>` umgestellt
  (Layout 4 für Hero/Textmedia, Varianten für Menüs, Powermail, Timeline,
  Tabs; Vorgaben für Text, Hero, Produkt-Keyfacts). Layouts 1/2 und
  Farbschemata 0–4 wie in v12 (überschreibt `removeItems` der foundation),
  `TCEMAIN.permissions.groupid = 2`.
- Feste Seiten-IDs (187, 186) über Site Settings `pages.footerContent` und
  neu `pages.navigationContent` (KIST: 186); `tx_xo_no_frame` →
  `tx_foundation_no_frame`.
- Geprüft per `in2mcp get_schema` (Seite 1, `text`, `menu_subpages`):
  Layout-, Farbschema- und Varianten-Auswahl entsprechen v12.
- RTE: Konfiguration der Vorlage deckt KIST bereits ab (CTA, klein, groß
  plus foundation-Linkklassen), keine Änderung. `user.tsconfig` unverändert.
- TCA `tt_content`: `pi_flexform`-Label ausgeblendet, Felder
  `tx_site_wkhtmltopdf_enabled`/`_title` angelegt (Einblendung mit dem
  Downloads-Element in Schritt 2).
- Sprachdateien: Platzhalter `locallang_frontend.xlf` entfernt; Labels aus
  `locallang_plugin.xlf` (Menü-Sortierung) in `locallang_tca.xlf`.
- `tt_content.tx_foundation_text_layout` wird in KIST nicht ausgegeben (alte
  Layout-Datei nutzt es nicht) → kein Feld, kein Wizard
  (`siteTextLayout` entfällt).
- Offen für Schritt 2 (an die jeweilige Extension gebunden):
  - Vorgaben für Plugins mit `list_type` (`ps14teaser_frontend`:
    Abstand, Layout 4, Varianten Teaser 1/2; `entityproduct_teaser`:
    Abstand) nach der Umstellung auf eigene CTypes.
  - News-Vorgaben unterhalb Seite 246/249 (`tx_kist_news_layout`, `type`).
  - Powermail: `tx_powermail.flexForm.addField` (CleverReach,
    Einzelverarbeitung).
  - `tt_address`: `label_alt` (last_name, first_name, company).
  - Teaser-Label `teaser.flexform.field.layout.technology`.

### Notizen Task 6

Geparkte Dateien (inaktiv, werden mit der jeweiligen Extension in Schritt 2
aktiviert bzw. durch Content Blocks ersetzt):

- **Templates** unter `Resources/Private/Extensions/`: `News`, `Powermail`,
  `KeSearch`, `Foundation/Partials/Address` (Adress-Layout) und
  `Foundation/Partials/Page/Layout/Address.html` (Footer, Task 3). Nicht in
  `*RootPaths` eingetragen.
- **Partials** der Mini-Extensions unter `Resources/Private/Partials/`
  (Struktur wie v12): `Accordion`, `Downloads`, `Filter`, `Hero`, `Marker`,
  `Teaser`, `Timeline`, `Components/{Address,Person,Slider}`. Werden nur
  gerendert, wenn ein Template sie anfordert.
- **TypoScript** unter `Configuration/TypoScript/Extensions/Step2/` (nicht
  vom Import `Extensions/*.setup.typoscript` erfasst): Konstanten/Setup
  aller Extensions, `Address.setup` (alt `Modules/`), `Pdf.setup` (alt
  `Page/`). CleverReach-Zugangsdaten **nicht** übernommen (leere Werte).
- **SCSS/JS** liegen seit Task 2 als Vite-Entrypoints vor.
- Automatisch angepasst: Einrückung, SVG-Pfade (`EXT:…/Svg/Embed/`),
  `fo:media.*`/`fo:format.uri` → `site:`, foundation/site-Labels in
  Domain-Syntax.
- Bewusst **nicht** angepasst (Arbeit in Schritt 2): `fo:settings.get`
  (Marker, Hero, Teaser, Timeline, Powermail), Labels aus `EXT:xo` und
  `EXT:ps14_kist_news`, `xo:`-Namespace in `Timeline/Elements.html`,
  `f:format.raw` in den ke_search-Templates, `/assets/…`-Pfade im
  geparkten TypoScript (Kommentar in der ersten Zeile).

PHP-Klassen aus dem alten `ps14_site`, die erst in Schritt 2 übernommen
werden (Quelle bleibt im Altprojekt):

| Klasse | Abhängigkeit | Hinweis v14 |
|---|---|---|
| `KeSearchIndexer\ContentElementRecords`, `RemoveContentFromHiddenParent`, `SysFileReferenceFields` | ke_search | Hooks → PSR-14-Events; Elements entfallen mit Content Blocks |
| `Powermail\Finisher\CleverReachFinisher` | powermail, cleverreach | Zugangsdaten über `.env` |
| `Service\FilterService`, `Filter\DataProvider\*` | entity_product | AJAX-Filter (`components/filter.js`) |
| `Middleware\LinkHeader` (+ `RequestMiddlewares.php`) | ps14_kist_pdf | PDF-Link-Header |
| `Service\TcaService` | – | entfällt (foundation `TcaService` direkt) |
| `DataProcessing\MenuProcessor` | – | entfällt (Task 4, Core) |
| `DataProcessing\ContentElementProcessor` | – | übernommen (Task 4) |

### Notizen Task 7

Wizards in `ps14_site/Classes/Upgrades/` (Basis `AbstractMigration`:
Voraussetzung `DatabaseUpdatedPrerequisite`, Quellen werden im Schema
geprüft, da sie im v14-TCA fehlen; Ausgabe per `ChattyInterface`):

| Identifier | Quelle → Ziel | KIST-Daten (v12) |
|---|---|---|
| `ps14Site_disableStickyMigration` | `pages.tx_foundation_disable_sticky = 1` → `tx_site_disable_sticky = 1` | 2 Seiten |
| `ps14Site_navigationContentMigration` | `tx_foundation_pages_content_mm` (Sortierung) → UID-Liste in `pages.tx_foundation_navigation_content`; Werte `0` → leer | 8 Seiten inkl. Übersetzungen (eigene MM-Zeilen) |
| `ps14Site_navigationLayoutMigration` | `tx_foundation_navigation_layout = '0'` → `''` | 655 Seiten |
| `ps14Site_pageTypeLinkMigration` | doktype 120 → 3, `url` → `link` (Typolink unverändert) | 20 Seiten, alle `t3://record?identifier=entityProduct` (LinkHandler kommt mit entity_product) |
| `ps14Site_containerRatioMigration` | FlexForm `settings.column*Width` → `ratio` (nächstliegende erlaubte Aufteilung); nicht exakte Fälle werden ausgegeben | 6 Container, davon `426` (3/6) und `2686` (ohne FlexForm) zur Prüfung |

- Geprüft: `ddev typo3 upgrade:list` zeigt alle fünf; ohne Altspalten bzw.
  -tabellen melden Sticky, Navigation Content und Seitentyp keinen Bedarf.
  Auf der Vorlagen-DB melden Navigation Layout (Seiten mit `'0'`) und
  Container (gelöschter Datensatz 53 mit alten Breiten) zu Recht Bedarf;
  **nicht ausgeführt** (Datenänderung, Schritt 2).
- Ausführung erst in Schritt 2 nach dem Import des KIST-Dumps:
  `extension:setup` (legt `tx_site_*` an, ändert
  `tx_foundation_navigation_content` auf Text), dann `upgrade:run`, danach
  per *Analyze Database Structure* **nur** die Quellen entfernen, die diese
  Wizards migriert haben: `pages.tx_foundation_disable_sticky`, Tabelle
  `tx_foundation_pages_content_mm`, `pages.url` (nach dem Core-Wizard
  „Migrate links of pages of type link“). `tx_foundation_navigation_layout`
  und die Container-FlexForm bleiben Felder in v14. Alle übrigen
  Altspalten/-tabellen bleiben bis zu ihrem eigenen Migrationsschritt
  (Festlegung 2026-11-23).
- `siteTextLayout` entfällt (siehe Task 5).

### Notizen Task 8

- Prüfung 2026-11-23: `ddev vite build` ok, `ddev exec npm run lint` ok
  (Stylelint, ESLint, editorconfig, PHP-CS-Fixer, PHPStan);
  `/de/`, `/en/`, `leistungen` (+ 3. Ebene), `unternehmen`, `text`,
  `header`, `menue`, `container`, `komponenten`, `images`, `impressum`,
  `datenschutz`, `kontakt`, `404` HTTP 200; unbekannte URLs DE/EN 404;
  keine Fehler im TYPO3-Log.
- Noch nicht geprüft (braucht Browser bzw. KIST-Daten): Optik und JS
  (Off-Canvas, Drilldown, Sticky-Header, Suche), Produkt-Layout,
  Footer-Spalten/-Logo mit echten Inhalten, Tracking im Production-Kontext,
  Ausführung der Wizards.
- `migration-kist-v14.md`: Abschnitt 0 mit den Abweichungen von Schritt 1.

## Entwurf: Aufgaben Schritt 2

Reihenfolge als Vorschlag, je Punkt eigener Plan bzw. Feature-Branch.

1. **Datenübernahme**: KIST-Dump (v12) importieren, `extension:setup`,
   Core-Wizards und `ps14Site_*`-Wizards (`upgrade:run`), Schema nur für
   die migrierten Quellen bereinigen (Task 7), `fileadmin` übernehmen,
   Site Settings auf KIST-IDs (Tabelle unten), Sichtprüfung gegen
   `kist-escherich-com`.
2. **Content Blocks statt Elements** (Entscheidung 8): Akkordeon, Tabs,
   Timeline, Hero/Hero-Slider, Marker, Firmenwerte, Downloads, Teaser als
   Content Blocks mit Collections; Wizards Elements → Collections und
   CTypes/`list_type` → neue CTypes; geparkte Partials und SCSS/JS
   anbinden; danach Mini-Extensions entfernen.
3. **tt_address / Adresse**: Footer-Adresse, Adress-Plugin, JSON-LD
   (LocalBusiness), Öffnungszeiten, Social Links, Felder `tx_site_*` statt
   `tx_foundation_*` mit Wizard.
4. **Produktkatalog**: `entity`, `entity_product`, `chart`,
   `entity_product_import` (external_import, svconnector) auf v14;
   LinkHandler `entityProduct`, Filter-Framework (`FilterService`,
   `Filter\DataProvider`), Produkt-Layout, `pages.individualProduct`.
5. **Ansprechpartner-Suche** `contact` (tt_address, CSV-Import).
6. **News** mit `ps14_kist_news`: Event-Felder, Templates, RouteEnhancer,
   TSconfig-Vorgaben (Seiten 246/249).
7. **Formulare**: powermail + CleverReach-Finisher (Zugangsdaten über
   `.env`), alternativ EXT:form (Optimierung P6).
8. **Suche** ke_search: Templates, Indexer als PSR-14-Listener.
9. **Seite als PDF** `ps14_kist_pdf`: Seitentyp 8080, Middleware
   `LinkHeader`, Felder `tx_site_wkhtmltopdf_*` im Downloads-Element.
10. **Weitere Extensions**: warming, masi, sitemap_locator,
    typed_extconf prüfen/ersetzen; `scriptmerger`, `ps14_theme` entfallen.
11. **Infrastruktur**: Redirects nach `sys_redirect`, Backup-/Sync-Skripte,
    Produktion (Deploy nur auf Anweisung).
12. **Optimierungsrunde**: [kist-v14-optimizations.md](kist-v14-optimizations.md).

### Werte für Schritt 2 (KIST-Datenbank)

`config/sites/ps14/settings.yaml` nach dem Datenimport setzen:

| Setting | KIST-Wert |
|---|---|
| `navigation.main` | 4 |
| `navigation.footer` | 5 |
| `navigation.meta` | 112 |
| `pages.search` | 38 |
| `pages.contact` | 111 |
| `pages.footerContent` | 187 |
| `pages.navigationContent` | 186 |
| `pages.individualProduct` | 183 |

