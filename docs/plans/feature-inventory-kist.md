# Feature-Inventar: kist-escherich-com (v12) → ps14-typo3 (v14)

Bestandsaufnahme der Funktionen, die im Projekt `~/www/kist-escherich-com` (TYPO3 12.4,
Classic-Mode, Extensions unter `public/typo3conf/ext/`) vorhanden sind und in der
v14-Vorlage fehlen. Grundlage für die Auswahl einzelner Features zur modernisierten
Übernahme.

- Stand: 2026-11-05
- Aufwand: **S** = klein, **M** = mittel, **L** = groß
- Pfade alt relativ zu `~/www/kist-escherich-com/public/typo3conf/ext/`
- Pfade neu relativ zu `~/www/ps14-typo3/packages/`

## Offene Grundsatzentscheidung

Akkordeon, Tabs, Timeline, Slider und Werte bauen auf der foundation-Tabelle
`tx_foundation_domain_model_elements` (IRRE „Elements“) auf:

1. **Elements-Modell weiterführen**: Datenkompatibilität mit alten Projekten, ein Mechanismus für alle Elemente.
2. **Content Blocks mit Collections**: moderner, weniger Code, keine Mini-Extension pro Element, aber Datenmigration für alte Projekte nötig.

Bei Variante 2 entfällt B1 weitgehend.

## A · Fehler und Altlasten in der neuen Vorlage

| ID | Problem | Pfad neu | Aufwand |
|---|---|---|---|
| A1 | RTE nutzt `stylesSet` aus CKEditor 4 (wirkt in CKEditor 5 nicht). Die Labels zeigen auf die nicht vorhandene `EXT:xna`. Alt war es korrekt über `editor.config.style.definitions` umgesetzt. | `ps14_site/Configuration/RTE/Global.yaml` | S |
| A2 | Verwaiste TypoScript-Imports auf nicht installierte `EXT:ps14_container`, `EXT:ps14_downloads`, `EXT:ps14_textmedia`. `ContentBlocks.setup` setzt Content Blocks voraus, das nicht installiert ist. | `ps14_site/Configuration/TypoScript/Extensions/` | S |
| A3 | Eingebunden werden noch `/assets/css/site.css`, `print.css` und `/assets/js/site.js`, obwohl die Assets über Vite kommen. `print.css` hat keine Quelle. | `ps14_site/Configuration/TypoScript/Page/Page.setup.typoscript` | S |
| A4 | Tote Referenzen: Palette `foundation_text` eingehängt, aber nicht definiert. Address-Icons registriert, SVGs fehlen. 9 LLL-Labels der Elements-Tabelle fehlen. Die `importCss`-Konstanten sind wirkungslos. `InlineResourceService` ist komplett auskommentiert und wird trotzdem aufgerufen. | `ps14_foundation/` | S |
| A5 | Readmore: TCA und Partial sind vorhanden, aber kein DataProcessor. `{readmore}` ist deshalb immer leer. | `ps14_foundation/Configuration/TypoScript/System/Content.setup.typoscript` | S |

## B · Unterbau ps14_foundation (generisch)

| ID | Funktion | Pfad alt | Aufwand |
|---|---|---|---|
| B1 | **Elements-IRRE vervollständigen**: Feld `tt_content.tx_foundation_elements`, TCA `tx_foundation_parent`, TSconfig colPos 5628, Frontend-Processor `dataProcessing.110`, Labels | `ps14_foundation/Configuration/TCA/Overrides/tt_content.php`, `page.tsconfig`, `TypoScript/System/Content.setup.typoscript` | M |
| B2 | Feld für das Text-Layout `tx_foundation_text_layout` (z. B. „indent“) als Klasse `container--text-layout-*` | `ps14_foundation/Configuration/TCA/Overrides/tt_content.php` | S |
| B3 | Farbton über `frame_class` (`hue-container--*`) | `ps14_foundation/Resources/Private/Layouts/Content/Default.html` | S |
| B4 | Content-Element „Image“ (Template und TCA: maxitems 1) | `ps14_foundation/Resources/Private/Templates/Content/Image.html` | S |
| B5 | TextImage: vertikale Ausrichtung im FlexForm. Textmedia: Video-Optionen `controls`/`loop` (alt in `ps14_textmedia`) | `ps14_foundation/Configuration/FlexForms/Modules/TextImage.xml`, `ps14_textmedia/` | S |
| B6 | ViewHelper `format.uri`, `media.isImage`/`isVideo` sowie `CropImageService` | `ps14_foundation/Classes/ViewHelpers/`, `Classes/Service/CropImageService.php` | S |
| B7 | Favicon: `<link rel="manifest">` ergänzen | `ps14_foundation/Configuration/TypoScript/Page/Favicon.setup.typoscript` | S |
| B8 | `config.spamProtectEmailAddresses` und `pageType.ajaxContent` als Site Setting | `ps14_foundation/Configuration/TypoScript/System/Config.setup.typoscript` | S |
| B9 | Seitenmedien: eine Datei, Crop-Varianten desktop/mobile mit 16:9 und 4:3 | `ps14_site/Configuration/TCA/Overrides/pages.php` | S |
| B10 | cHash-Ausschlussliste (~55 Tracking-Parameter: utm, gclid, fbclid …) | `typo3conf/system/settings.php` (`FE.cacheHash.excludedParameters`) | S |

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
| C7 | **Container 2/3-spaltig** mit FlexForm-Spaltenbreiten | `ps14_container/` | b13/container (laut `ext_emconf` bis 14.99), CSS-Grid | S–M |
| C8 | **Teaser**: Seiten-Teaser aus Seiten, Unterseiten oder Kategorien, Teaser-Felder in `pages` | `ps14_teaser/` | `list_type` und `TSFE` sind entfernt: CType-Plugin oder Content Block mit DataProcessor | L |
| C9 | **Menü Unterseiten** mit Sortierung aus dem FlexForm | `ps14_site/Classes/DataProcessing/MenuProcessor.php` | zuerst Core-`alternativeSortingField` prüfen | S |
| C10 | Marker: Bild, Legende, Slider (eher projektspezifisch) | `ps14_marker/` | wie C4 | M |
| C11 | Shortcut-Template mit Wrapper `id="c{uid}"` | `ps14_site/Resources/Private/Templates/Content/Shortcut.html` | | S |

## D · Layout, Navigation und Frontend (ps14_site, generisch)

| ID | Funktion | Pfad alt | Hinweise v14 | Aufwand |
|---|---|---|---|---|
| D1 | **Header mit Off-Canvas**: Suche, Sprachwahl, Haupt- und Meta-Navigation, Hamburger, Scroll-Lock | `ps14_site/Resources/Private/Partials/Page/Layout/Header.html`, `Js/components/navigation/layout-0.js` | `<dialog>`/Popover-API, kein `f:format.raw` | M |
| D2 | **Mega-Menü**: Layouts pro Seite (card/largeCard), Navigations-Content, 4 Ebenen | `ps14_site/Resources/Private/Templates/Navigation/Main.html` | Inline-Script durch `data-*` ersetzen | M |
| D3 | **Mobile Drilldown-Navigation** | `ps14_site/Resources/Private/Js/components/navigation/layout-4.js` | ES-Modul, ARIA | M |
| D4 | **Footer**: Adressblock, Social-Links, Content-Spalten von zentraler Footer-Seite, Logo-Leiste | `ps14_site/Resources/Private/Partials/Page/Layout/Footer.html` | Footer-PID als Site Setting | M |
| D5 | **Sticky-Leiste**: PDF, Kontakt, nach oben | `ps14_site/Resources/Private/Partials/Page/Layout/Sticky.html`, `Js/components/layout/sticky.js` | IntersectionObserver, Buttons über Site Settings | S–M |
| D6 | Sticky-Header: Scroll-Klasse, Anker-Offset | `ps14_site/Resources/Private/Js/components/layout/sticky-header.js` | `scroll-padding-top` | S |
| D7 | Backend-Layouts (default mit Footer-Spalte colPos 20, footer) und Footer-Content mit `slide=-1` | `ps14_site/Configuration/page.tsconfig`, `TypoScript/Block/` | `Configuration/BackendLayouts/*.tsconfig` | S–M |
| D8 | Seiten-IDs (Navigationen, Kontakt, Footer) als Site Settings | `ps14_site/Configuration/TypoScript/Site.constants.typoscript` | `settings.definitions.yaml` | S |
| D9 | Komponenten-Partials Card, Slider, Person | `ps14_site/Resources/Private/Partials/Components/` | Fluid-Components | M |
| D10 | Kleine Komponenten: Readmore-Container, responsive Tabelle, Video-Play-Button, Collapse/Tab, Modal, Loader, Flash-Messages, Accessibility (Skip-Link, Fokus) | `ps14_site/Resources/Private/Js/components/`, `Sass/components/` | native Mittel (`<details>`, `<dialog>`, `overflow-x`) | S je Komponente |
| D11 | 35 SVG-Icons (Pfeile, Social, Download, Suche …), Iconfont-Glyphen | `ps14_site/Resources/Public/Svg/` | `EXT:`-Pfade statt `assets/svg/` | S |
| D12 | CSS-Splitting: kritisches Inline-CSS, Modul-CSS pro Element, Print-CSS | `webpack.mix.js`, `ps14_site/Resources/Private/Sass/` | zusätzliche Vite-Entrypoints, `?inline` | M |
| D13 | TSconfig: TCEMAIN-Rechte, Frame- und Layout-Labels, TCAdefaults pro CType | `ps14_site/Configuration/page.tsconfig` | hartcodierte PIDs durch Site Settings ersetzen | S |
| D14 | Tracking-Snippet (alt etracker) per Site Setting, nicht im Development-Kontext | `ps14_site/Configuration/TypoScript/Page/Tracking.setup.typoscript` | Consent-Lösung fehlt in beiden Projekten | S |
| D15 | Logo-Setting vereinheitlichen: Set-Definition heißt `layout.logoFilepath`, `Logo.html` und `config/sites/ps14/settings.yaml` nutzen `layout.logoPath`. Default und Backend-Settings-Editor greifen dadurch ins Leere. | neu: `ps14_foundation/Configuration/Sets/Layout/settings.definitions.yaml`, `ps14_foundation/Resources/Private/Partials/Page/Layout/Logo.html` | einheitlich `layout.logoFilepath` (analog zu `css.mainFilepath`) | S |

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

- Produktkatalog: `entity`, `entity_product`, `chart`, `entity_product_import` (external_import und svconnector) **L**
- Filter-Framework (AJAX) in `ps14_site/Classes/Service/FilterService.php` und `Classes/Filter/` **L**
- Ansprechpartner-Suche `contact` (tt_address, CSV-Import) **M**
- Firmenwerte `ps14_kist_values` (Kacheln mit Modal) **S–M**
- Produkt-Layout und Backend-Layout, Logos/TISAX

## G · Infrastruktur

| ID | Funktion | Pfad alt | Aufwand |
|---|---|---|---|
| G1 | Skripte für Backup und den Sync von Produktion nach Staging (an das Composer-Layout anpassen) | `~/www/kist-escherich-com/bin/` | S–M |
| G2 | Umgebungsspezifische `.htaccess` (Staging mit Basic-Auth, Production mit www, HTTPS und Headern) sowie ~470 Redirects nach `sys_redirect` | `~/www/kist-escherich-com/public/htaccess/` | M |
| G3 | `baseVariant` für Staging in der Site-Config | `typo3conf/sites/kist-escherich/config.yaml` | S |
| G4 | System-Settings: Mail-Absender, `systemLocale`, Debug-Block für Development | `typo3conf/system/settings.php` | S |

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
