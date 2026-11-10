# Feature-Inventar: kist-escherich-com (v12) → ps14-typo3 (v14)

Bestandsaufnahme der Funktionen, die im Projekt `~/www/kist-escherich-com` (TYPO3 12.4,
Classic-Mode, Extensions unter `public/typo3conf/ext/`) vorhanden sind und in der
v14-Vorlage fehlen. Grundlage für die Auswahl einzelner Features zur modernisierten
Übernahme.

- Stand: 2026-11-10 (angelegt 2026-11-05)
- Aufwand: **S** = klein, **M** = mittel, **L** = groß
- Pfade alt relativ zu `~/www/kist-escherich-com/public/typo3conf/ext/`
- Pfade neu relativ zu `~/www/ps14-typo3/packages/`

## Stand und Fortsetzung

Die Arbeit wurde am 2026-11-07 pausiert. Alle Feature-Branches sind gemergt, offen ist
kein Branch. Die Änderungen für eine spätere Migration von kist-escherich-com stehen in
[migration-kist-v14.md](migration-kist-v14.md).

### Übersicht

| Block | Erledigt | Zurückgestellt | Entfällt | Offen |
|---|---|---|---|---|
| A · Fehler in der Vorlage | A1–A5 | – | – | – |
| B · Unterbau foundation | B8, B10 | B4, B6, B9 | B1, B2, B3, B5, B7 | B11 |
| C · Inhaltselemente | C7 | – | – | C1–C6, C8–C11 |
| D · Layout und Frontend | D2, D4, D7, D8, D11, D13, D15 (D2, D4, D11 abgespeckt) | D1, D3, D6, D9, D12 | D5, D10, D14 | – |
| E · Fremd-Extensions | – | – | – | E1–E8 |
| F · KIST-spezifisch | – | – | alles (bleibt im KIST-Projekt) | – |
| G · Infrastruktur | – | – | G1–G4 (KIST-spezifisch) | – |
| H · Sammelliste | H1, H2, H4–H8 | – | – | H3 ist nur ein Hinweis |

### Nächste Schritte

1. **Block C** (Inhaltselemente) mit Content Blocks. Content Blocks ist in ps14_foundation
   nur als `suggest` eingetragen und noch nicht installiert. Laut Grundsatzentscheidung
   ersetzen Collections das alte Elements-IRRE (Akkordeon, Tabs, Timeline, Slider).
2. **Block E** (Fremd-Extensions). Vorher die v14-Kompatibilität der Extensions in
   Packagist/TER prüfen, bisher ist sie nur aus `ext_emconf` geschätzt.
3. **Zurückgestellte Punkte**:
   - D1, D3, D6 und D12 warten auf die CSS/JS-Umsetzung. Die Markup-Ausgabe der
     Navigationen ist vorhanden.
   - D9: Eigene Komponenten liegen bereits vor.
   - B4, B6, B9: werden bei Bedarf mit den passenden C/E-Punkten umgesetzt.

### Arbeitsweise

- Pro Punkt ein Feature-Branch `feature/<name>` in jedem betroffenen Repo (Hauptrepo,
  ps14_foundation, ps14_site).
- Merge per Squash nach `main` (Hauptrepo) bzw. `v14-dev` (Extensions), erst nach Freigabe
  der Commit-Message.
- Vor jedem Commit `ddev exec npm run lint`.
- Vor der Umsetzung wird der Plan vorgeschlagen und abgestimmt.
- **Testdaten** wurden bisher über einmalige DataHandler-Skripte in `var/transient/`
  angelegt (`ddev exec php …`, danach gelöscht). Gewünscht ist künftig eine TYPO3-MCP-Extension.

### Testdaten in der lokalen Datenbank

| Was | uid |
|---|---|
| Hauptnavigation: Leistungen (Layout `card`) mit Beratung, Entwicklung (Frontend, Backend), Support; Unternehmen (Navigation Content: tt_content 3) mit Über uns, Team, Karriere; Referenzen | 88–98 |
| Ordner „Social Media“ mit LinkedIn und Instagram (Seitentyp Link, Icon in `fileadmin/navigation/`) | 99–101 |
| Text-Element im Footer (colPos 20 auf der Startseite, Backend-Layout „Standard mit Footer“) | tt_content 160 |
| Englische Übersetzung der Startseite und der 404-Seite | 103, 104 |
| Seite „Container“ unter Modules mit 2- und 3-spaltigem Container (C7) | Seite 105, tt_content 162–167 |

## Grundsatzentscheidung Elements

Akkordeon, Tabs, Timeline, Slider und Werte bauen alt auf der foundation-Tabelle
`tx_foundation_domain_model_elements` (IRRE „Elements“) auf. **Entschieden:** Sie werden
vollständig auf Content Blocks mit Collections umgestellt, zusammen mit der Umsetzung der
Inhaltselemente (C). Das Elements-Modell wird nicht weitergeführt.

## A · Fehler und Altlasten in der neuen Vorlage

Alle Punkte erledigt am 2026-11-05 (Branch `feature/template-cleanup`).

| ID | Problem | Pfad neu | Aufwand |
|---|---|---|---|
| A1 | RTE nutzt `stylesSet` aus CKEditor 4 (wirkt in CKEditor 5 nicht). Die Labels zeigen auf die nicht vorhandene `EXT:xna`. Alt war es korrekt über `editor.config.style.definitions` umgesetzt. | `ps14_site/Configuration/RTE/Global.yaml` | S |
| A2 | Verwaiste TypoScript-Imports auf nicht installierte `EXT:ps14_container`, `EXT:ps14_downloads`, `EXT:ps14_textmedia`. `ContentBlocks.setup` setzt Content Blocks voraus, das nicht installiert ist. | `ps14_site/Configuration/TypoScript/Extensions/` | S |
| A3 | Eingebunden werden noch `/assets/css/site.css`, `print.css` und `/assets/js/site.js`, obwohl die Assets über Vite kommen. `print.css` hat keine Quelle. | `ps14_site/Configuration/TypoScript/Page/Page.setup.typoscript` | S |
| A4 | Tote Referenzen: Palette `foundation_text` eingehängt, aber nicht definiert. Address-Icons registriert, SVGs fehlen. 9 LLL-Labels der Elements-Tabelle fehlen. Die `importCss`-Konstanten sind wirkungslos. `InlineResourceService` ist komplett auskommentiert und wird trotzdem aufgerufen. | `ps14_foundation/` | S |
| A5 | Readmore: TCA und Partial sind vorhanden, aber kein DataProcessor. `{readmore}` ist deshalb immer leer. | `ps14_foundation/Configuration/TypoScript/System/Content.setup.typoscript` | S |

## B · Unterbau ps14_foundation (generisch)

| ID | Funktion | Pfad alt | Aufwand | Status |
|---|---|---|---|---|
| B1 | Elements-IRRE | `ps14_foundation/Configuration/TCA/Overrides/tt_content.php`, `page.tsconfig`, `TypoScript/System/Content.setup.typoscript` | M | entfällt: Umstellung auf Content Blocks zusammen mit C |
| B2 | Feld für das Text-Layout `tx_foundation_text_layout` | `ps14_foundation/Configuration/TCA/Overrides/tt_content.php` | S | entfällt: Rest in `ext_tables.sql` entfernt |
| B3 | Farbton über `frame_class` (`hue-container--*`) | `ps14_foundation/Resources/Private/Layouts/Content/Default.html` | S | entfällt: wird projektspezifisch über `frame_class` gelöst |
| B4 | Content-Element „Image“ | `ps14_foundation/Resources/Private/Templates/Content/Image.html` | S | zurückgestellt: später als eigenes Content-Element |
| B5 | TextImage: vertikale Ausrichtung. Textmedia: Video-Optionen `controls`/`loop` | `ps14_foundation/Configuration/FlexForms/Modules/TextImage.xml`, `ps14_textmedia/` | S | entfällt |
| B6 | ViewHelper `format.uri` (URL als kurzer Linktext, z. B. `example.com`) | `ps14_foundation/Classes/ViewHelpers/Format/UriViewHelper.php` | S | zurückgestellt, bei Bedarf neu (z. B. mit E4). `media.isImage`/`isVideo` und `CropImageService` entfallen. |
| B7 | Favicon: `<link rel="manifest">` | `ps14_foundation/Configuration/TypoScript/Page/Favicon.setup.typoscript` | S | entfällt |
| B8 | `config.spamProtectEmailAddresses` und `pageType.ajaxContent` | `ps14_foundation/Configuration/TypoScript/System/Config.setup.typoscript` | S | erledigt: Spam-Schutz auf v14-Standard (aus), typeNum als Site Setting `pageType.ajaxContent` |
| B9 | Seitenmedien: eine Datei, Crop-Varianten desktop/mobile mit 16:9 und 4:3 | `ps14_site/Configuration/TCA/Overrides/pages.php` | S | zurückgestellt, zusammen mit C8 (Teaser) |
| B10 | cHash-Ausschlussliste für Tracking-Parameter | `typo3conf/system/settings.php` (`FE.cacheHash.excludedParameters`) | S | erledigt: der v14-Standard enthält die alte Liste bereits. `pdf` kommt mit E5 dazu. |
| B11 | FlexForm-Auswahllisten über TypoScript-Settings (`TcaService->getItemsBySettingsIdentifier`, `module.tx_….settings < plugin.tx_….settings`), bisher in `TextImage.xml` (Spalten, Anordnung, Ausrichtung, Überschrift-Position) | `ps14_foundation/Configuration/FlexForms/Modules/TextImage.xml`, `Classes/Service/TcaService.php`, `TypoScript/Modules/TextImage.setup.typoscript` | S–M | offen: feste `items` im FlexForm, projektspezifische Anpassung per Page-TSconfig `TCEFORM.tt_content.pi_flexform.<CType>.<sheet>.<feld>` (`addItems`, `removeItems`, `altLabels`); `getItemsBySettingsIdentifier` danach entfernen. Frontend-Werte je Auswahl (z. B. `pictureMediaQueries`) bleiben im TypoScript. KIST: eigene Overrides der `options` in TSconfig überführen (Migrationsanleitung) |

## C · Inhaltselemente

Alt jeweils als eigene Mini-Extension umgesetzt, neu als Content Block oder in foundation.

| ID | Element | Pfad alt | Hinweise v14 | Aufwand |
|---|---|---|---|---|
| C1 | **Akkordeon**: RTE- oder verschachtelte Inhalte, „initial offen“ | `ps14_accordion/` | `<details name>` statt Bootstrap-Collapse | M |
| C2 | **Tabs**: Icon pro Tab, Variante „Radio“ | `ps14_tabs/` | fast baugleich mit C1, zusammen umsetzen | M |
| C3 | **Hero**: Bild oder Video mit Text | `ps14_hero/` | einfacher Content Block | S |
| C4 | **Hero-Slider** | `ps14_hero/` | tiny-slider wird nicht mehr gepflegt: Swiper, Embla oder CSS-Scroll-Snap | M |
| C5 | **Timeline**: Datum, Text, Bilder, Scroll-Fortschritt | `ps14_timeline/` | IntersectionObserver oder scroll-driven animations | S–M |
| C6 | **Downloads**: Dateiliste mit Größe und Endung | `ps14_downloads/` | prüfen, ob Core-`uploads` mit eigenem Template reicht | S |
| C7 | **Container 2/3-spaltig** mit FlexForm-Spaltenbreiten | `ps14_container/` | erledigt: eigenes Repo `ps14_container` (v14-dev) mit b13/container 4, feste Aufteilungen (`ratio`), CSS-Grid `columns` | S–M |
| C8 | **Teaser**: Seiten-Teaser aus Seiten, Unterseiten oder Kategorien, Teaser-Felder in `pages` | `ps14_teaser/` | `list_type` und `TSFE` sind entfernt: CType-Plugin oder Content Block mit DataProcessor | L |
| C9 | **Menü Unterseiten** mit Sortierung aus dem FlexForm | `ps14_site/Classes/DataProcessing/MenuProcessor.php` | zuerst Core-`alternativeSortingField` prüfen | S |
| C10 | Marker: Bild, Legende, Slider (eher projektspezifisch) | `ps14_marker/` | wie C4 | M |
| C11 | Shortcut-Template mit Wrapper `id="c{uid}"` | `ps14_site/Resources/Private/Templates/Content/Shortcut.html` | | S |

## D · Layout, Navigation und Frontend (ps14_site, generisch)

| ID | Funktion | Pfad alt | Hinweise v14 | Aufwand |
|---|---|---|---|---|
| D1 | **Header mit Off-Canvas**: Suche, Sprachwahl, Haupt- und Meta-Navigation, Hamburger, Scroll-Lock | `ps14_site/Resources/Private/Partials/Page/Layout/Header.html`, `Js/components/navigation/layout-0.js` | zurückgestellt: CSS/JS wird vorerst nicht umgesetzt (Markup-Ausgabe der Navigationen ist vorhanden). Hinweis: `<dialog>`/Popover-API, kein `f:format.raw` | M |
| D2 | **Mega-Menü**: Layouts pro Seite (card/largeCard), Navigations-Content, 4 Ebenen | `ps14_site/Resources/Private/Templates/Navigation/Main.html` | erledigt (abgespeckt): Navigation Layout und Navigation Content nur auf der ersten Ebene der Hauptnavigation. Layout-Varianten als Sections im Partial `Navigation/Main/Layout` (Beispiel `card` in ps14_site), Content über Core-`RECORDS` statt MM-Tabelle und `NavigationContentProcessor`. Mehrere Ebenen und Navigations-Content-Seite entfallen. | M |
| D3 | **Mobile Drilldown-Navigation** | `ps14_site/Resources/Private/Js/components/navigation/layout-4.js` | zurückgestellt: CSS/JS wird vorerst nicht umgesetzt (Markup-Ausgabe der Navigationen ist vorhanden). Hinweis: ES-Modul, ARIA | M |
| D4 | **Footer**: Adressblock, Social-Links, Content-Spalten von zentraler Footer-Seite, Logo-Leiste | `ps14_site/Resources/Private/Partials/Page/Layout/Footer.html` | erledigt (abgespeckt): Footer-Inhalte aus colPos 20 (Backend-Layout `defaultFooter` in ps14_site aktiv, `slide = -1`), Copyright, Footer-Navigation und Social-Media-Icon-Navigation (Ordner per Site Setting `navigation.social`, externe Links, SVG im Seitenfeld `tx_foundation_icon`). Adresse, Logo und Logo-Leiste entfallen. | M |
| D5 | **Sticky-Leiste**: PDF, Kontakt, nach oben | `ps14_site/Resources/Private/Partials/Page/Layout/Sticky.html`, `Js/components/layout/sticky.js` | entfällt: wird nicht mehr benötigt | S–M |
| D6 | Sticky-Header: Scroll-Klasse, Anker-Offset | `ps14_site/Resources/Private/Js/components/layout/sticky-header.js` | zurückgestellt: CSS/JS wird vorerst nicht umgesetzt. Umsetzung dann mit `position: sticky`, `scroll-padding-top` und ggf. IntersectionObserver für den Scroll-Zustand. | S |
| D7 | Backend-Layouts (default mit Footer-Spalte colPos 20, footer) und Footer-Content mit `slide=-1` | `ps14_site/Configuration/page.tsconfig`, `TypoScript/Block/` | erledigt: Layouts `default` (Main) und `defaultFooter` (Main + Footer colPos 20, per `@import` in ps14_site aktivierbar) unter `ps14_foundation/Configuration/TsConfig/Page/BackendLayouts/`. Footer-Content mit `slide = -1`, eine zentrale Footer-Seite entfällt. | S–M |
| D8 | Seiten-IDs (Navigationen, Kontakt, Footer) als Site Settings | `ps14_site/Configuration/TypoScript/Site.constants.typoscript` | erledigt: `navigation.main`/`footer`/`meta`/`language` und `pages.search` als Site Settings im Set `foundation/layout` (heute `foundation/settings`). `pages.home` entfällt (`site.rootPageId`). Kontakt-, Footer- und Navigations-Content-Seiten werden nicht benötigt. | S |
| D9 | Komponenten-Partials Card, Slider, Person | `ps14_site/Resources/Private/Partials/Components/` | zurückgestellt: eigene Komponenten sind bereits vorbereitet. Hinweis: v14 erlaubt Component Collections per `Configuration/Fluid/ComponentCollections.php`. | M |
| D10 | Kleine Komponenten: Readmore-Container, responsive Tabelle, Video-Play-Button, Collapse/Tab, Modal, Loader, Flash-Messages, Accessibility (Skip-Link, Fokus) | `ps14_site/Resources/Private/Js/components/`, `Sass/components/` | entfällt: wird nicht benötigt | S je Komponente |
| D11 | 35 SVG-Icons (Pfeile, Social, Download, Suche …), Iconfont-Glyphen | `ps14_site/Resources/Public/Svg/` | erledigt (abgespeckt): nur die im Layout genutzten SVGs (`search`, `close`) unter `ps14_foundation/Resources/Public/Svg/Embed/` mit `EXT:`-Pfaden, Iconfont-Build ohne Altlasten. Weitere Icons kommen mit ihren Punkten. | S |
| D12 | CSS-Splitting: kritisches Inline-CSS, Modul-CSS pro Element, Print-CSS | `webpack.mix.js`, `ps14_site/Resources/Private/Sass/` | zurückgestellt, soll eventuell später weiterverfolgt werden. Print-CSS ist erledigt (`css.printFilepath`). Offen: kritisches CSS als eigener Vite-Entrypoint mit `?inline`, Modul-CSS als Entrypoint pro Content-Element, eingebunden im Element-Template (`vac:asset.vite`/`f:asset.css`). | M |
| D13 | TSconfig: TCEMAIN-Rechte, Frame- und Layout-Labels, TCAdefaults pro CType | `ps14_site/Configuration/page.tsconfig` | erledigt: CType-Bedingungen auf v14-Syntax `TCAdefaults`/`TCEFORM … .types.<CType>` umgestellt, `field()`-Provider entfernt. KIST-Labels und CType-Vorgaben kommen mit den jeweiligen C/D2/E-Punkten, feste PIDs entfallen. | S |
| D14 | Tracking-Snippet (alt etracker) per Site Setting, nicht im Development-Kontext | `ps14_site/Configuration/TypoScript/Page/Tracking.setup.typoscript` | entfällt: wird nicht benötigt | S |
| D15 | Logo-Setting vereinheitlichen: Set-Definition heißt `layout.logoFilepath`, `Logo.html` und `config/sites/ps14/settings.yaml` nutzen `layout.logoPath`. Default und Backend-Settings-Editor greifen dadurch ins Leere. | neu: `ps14_foundation/Configuration/Sets/Layout/settings.definitions.yaml`, `ps14_foundation/Resources/Private/Partials/Page/Layout/Logo.html` | erledigt: einheitlich `layout.logoFilepath` (analog zu `css.mainFilepath`) | S |

## E · Integrationen mit Fremd-Extensions

Die v14-Kompatibilität ist jeweils nur aus `ext_emconf` abgeschätzt, nicht in TER oder Packagist geprüft.

| ID | Funktion | Pfad alt | v14 | Aufwand |
|---|---|---|---|---|
| E1 | **news**: Event-Felder, Detail-SEO, Breadcrumb, LinkHandler, Templates, RouteEnhancer | `ps14_kist_news/`, `ps14_site/Resources/Private/Extensions/News/` | unklar (alt 13.0.2) | M |
| E2 | **Formulare**: powermail-Overrides und CleverReach-Finisher, alternativ Core EXT:form | `ps14_site/Classes/Powermail/`, `Resources/Private/Extensions/Powermail/` | unklar | M–L |
| E3 | **Suche** mit ke_search: Templates, eigene Indexer (Hooks → PSR-14) | `ps14_site/Classes/KeSearchIndexer/`, `Resources/Private/Extensions/KeSearch/` | unklar | M |
| E4 | **Adressen/tt_address**: Address-Plugin, JSON-LD LocalBusiness, Öffnungszeiten, Impressumsdaten | `ps14_foundation/Classes/Controller/AddressController.php`, `Classes/ViewHelpers/JsonLd/` | unklar | M |
| E5 | **Seite als PDF**: CloudConvert-Middleware, `?pdf=1`, Feld zum Abschalten, Link-Header | `ps14_kist_pdf/`, `ps14_site/Classes/Middleware/LinkHeader.php` | eigen | M–L |
| E6 | **warming**: Cache-Warmup über die Sitemap | `warming/` | unklar | S |
| E7 | **masi**: Seiten aus dem URL-Pfad ausschließen | `masi/` | unklar | S |
| E8 | Core-Sysexts scheduler, redirects, reports, adminpanel | `typo3conf/PackageStates.php` | Core | S |

## F · Projektspezifisch KIST (vermutlich nicht in die Vorlage)

Bleibt im KIST-Projekt und wird bei dessen v14-Migration dort umgesetzt (siehe
[migration-kist-v14.md](migration-kist-v14.md)).

- Produktkatalog: `entity`, `entity_product`, `chart`, `entity_product_import` (external_import und svconnector) **L**
- Filter-Framework (AJAX) in `ps14_site/Classes/Service/FilterService.php` und `Classes/Filter/` **L**
- Ansprechpartner-Suche `contact` (tt_address, CSV-Import) **M**
- Firmenwerte `ps14_kist_values` (Kacheln mit Modal) **S–M**
- Produkt-Layout und Backend-Layout, Logos/TISAX

## G · Infrastruktur

| ID | Funktion | Pfad alt | Aufwand |
|---|---|---|---|
| G1 | entfällt (KIST-spezifisch): Skripte für Backup und den Sync von Produktion nach Staging (an das Composer-Layout anpassen) | `~/www/kist-escherich-com/bin/` | S–M |
| G2 | entfällt (KIST-spezifisch): Umgebungsspezifische `.htaccess` (Staging mit Basic-Auth, Production mit www, HTTPS und Headern) sowie ~470 Redirects nach `sys_redirect` | `~/www/kist-escherich-com/public/htaccess/` | M |
| G3 | entfällt (KIST-spezifisch): `baseVariant` für Staging in der Site-Config | `typo3conf/sites/kist-escherich/config.yaml` | S |
| G4 | entfällt (KIST-spezifisch): System-Settings: Mail-Absender, `systemLocale`, Debug-Block für Development | `typo3conf/system/settings.php` | S |

## Vermutlich obsolet

`scriptmerger` (durch Vite), `ps14_theme` (leer), JS-Polyfills, `public/health/index.php`,
`public/migrations/`, `PluginProcessor`, `ContentElementProcessor`-Override in ps14_site,
`data-uri-target.js`, vendored Bootstrap 4, der CSS/JS-Import pro Modul im
`ModuleProcessor` (durch Vite).

## Sicherheitshinweis

Im alten Projekt liegen Zugangsdaten im Klartext. Sie werden **nicht** übernommen:

- CleverReach-Login: `ps14_site/Configuration/TypoScript/Extensions/Cleverreach.constants.typoscript`
- CloudConvert-API-Key und Basic-Auth: `typo3conf/system/settings.php`

Secrets gehören neu ausschließlich in `config/system/additional.php` bzw. `.env`.

## Sammelliste: Fehler und Verbesserungen

Bei der Arbeit an der Vorlage gefundene Punkte, unabhängig vom Port aus kist-escherich-com.

| ID | Art | Problem | Pfad | Aufwand |
|---|---|---|---|---|
| H1 | Fehler | **Erledigt.** Die 404-Fehlerseite zeigt auf `t3://page?uid=47` (`/kategorien`, ein Ordner). Jede 404 endet deshalb in einer 500 („Error handler could not fetch error page“). Die eigentliche 404-Seite ist uid 6 (`/404`). | `config/sites/ps14/config.yaml` (`errorHandling`) | S |
| H2 | Fehler | **Erledigt mit D13.** TSconfig-Bedingungen `[field('CType') === …]` sind ungültig: `field()` gibt es in Page-TSconfig-Bedingungen nicht (Log: „The function "field" does not exist“). Die Blöcke wirken nie und erzeugen Fehler im Log. Ersatz z. B. über `TCEFORM.tt_content.<feld>.types.<CType>`. | `ps14_site/Configuration/page.tsconfig` (Zeilen 1, 11, 18), `ps14_foundation/Configuration/page.tsconfig` (Zeile 131) | S |
| H3 | Hinweis | Keine Aktion nötig. Der Einzelelement-Abruf über `pageType.ajaxContent` mit `tx_foundation[content]` braucht wegen `FE.cacheHash.enforceValidation` einen gültigen cHash. Links dafür immer über TYPO3 erzeugen (`f:uri.page`/typolink), nie von Hand zusammensetzen. | `ps14_foundation/Configuration/TypoScript/Page/AjaxContent.setup.typoscript` | – |
| H4 | Fehler | **Erledigt:** Set `foundation/meta` entfernt, `foundation/layout` in `foundation/settings` umbenannt. `meta.themeColor` ist doppelt definiert, in den Sets `foundation/layout` und `foundation/meta`. | `ps14_foundation/Configuration/Sets/Layout/settings.definitions.yaml`, `ps14_foundation/Configuration/Sets/Meta/settings.definitions.yaml` | S |
| H5 | Fehler | **Erledigt:** `is--active` für den aktiven Pfad (`item.active`), `is--current` und `aria-current="page"` für die aktuelle Seite. Die Navigation markiert nur die aktuelle Seite (`item.current`), nicht ihre Elternseiten. Steht man auf „Frontend“, sind „Entwicklung“ und „Leistungen“ nicht als aktiv gekennzeichnet. Ersatz über `item.active` (`is--active` am Pfad, `aria-current="page"` nur an der aktuellen Seite). | `ps14_foundation/Resources/Private/Partials/Navigation/Default/Item.html`, `Link.html` | S |
| H6 | Verbesserung | **Erledigt mit D2.** Jeder Navigationseintrag mit Unterseiten gibt ein leeres `<div class="navigation__content">` aus, auch ohne Mega-Menü-Inhalte. Nur rendern, wenn `item.content` gefüllt ist (gehört zu D2). | `ps14_foundation/Resources/Private/Partials/Navigation/Default/Item.html` | S |
| H7 | Fehler | **Erledigt:** Startseite (uid 1 → 103) und 404-Seite (uid 6 → 104) ins Englische übersetzt. `/en/` liefert eine 500: Die Startseite ist nicht ins Englische übersetzt, die 404 greift und scheitert an H1. Mit H1 behoben, die Übersetzung der Startseite fehlt trotzdem. | `config/sites/ps14/config.yaml`, Seitenbaum (uid 1) | S |
| H8 | Fehler | **Erledigt:** Der eigene Seitentyp 120 ist entfernt (TCA, XCLASS `TextMenuContentObject`, Icon, Labels). Der v14-Seitentyp „Link“ unterstützt alle Typolink-Ziele über das Feld `link`. Der Seitentyp „Typolink“ (doktype 120) überschreibt per `columnsOverrides` das Feld `url`. In v14 heißt das Feld für externe URLs `link`, die Überschreibung greift deshalb nicht. | `ps14_foundation/Configuration/TCA/Overrides/pages.php` | S |
