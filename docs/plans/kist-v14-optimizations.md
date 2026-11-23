# KIST v14: Verbesserungen und Optimierungen

Sammelliste für die Zeit nach Schritt 1 ([kist-v14-functionality.md](kist-v14-functionality.md)).
Die Punkte werden **erst später** umgesetzt, jeweils mit eigenem Plan bzw.
Feature-Branch. Neue Funde während der Migration hier ergänzen.

- Stand: 2026-11-22
- Aufwand: **S** = klein, **M** = mittel, **L** = groß

## O · Frontend-Struktur

| ID | Vorschlag | Nutzen | Aufwand |
|---|---|---|---|
| O1 | Markup und SCSS an die Vorlage angleichen (BEM-Blöcke `navigation`, `navigation-item`, `page-header`, `page-footer`, Komponenten aus `ps14_component`), KIST-Overrides in `ps14_site` schrittweise abbauen | weniger Merge-Konflikte mit `main`, Regeln aus `.claude/rules/frontend/` gelten | L |
| O2 | Vendored Bootstrap 4 (SCSS und JS `collapse`/`tab`) entfernen; Grid/Utilities durch eigenes CSS-Grid/Custom Properties ersetzen, Collapse/Tab durch `<details>` bzw. ARIA-Tabs | weniger CSS/JS, keine Altlasten | L |
| O3 | SCSS von `@import` auf `@use`/`@forward` umstellen, Sass-Deprecations beheben (`/`-Division, globale Funktionen) statt sie stummzuschalten | zukunftssicher mit Dart Sass 3 | M |
| O4 | Farben, Abstände, Typografie als CSS Custom Properties (`bootstrap/_root.scss` der Vorlage) statt Sass-Variablen | Kontext-Theming (z. B. Navigation auf farbigem Grund) | M |
| O5 | CSS-Splitting neu bewerten (D12): kritisches CSS automatisiert erzeugen oder entfallen lassen; Modul-CSS per Vite-Entrypoint vs. ein Bundle mit HTTP/2 messen | einfacherer Build, ggf. bessere Ladezeit | M |
| O6 | JS modernisieren: Helfer als echte ES-Module mit `export` statt Globals, Polyfills entfernen, Data-Attribut-Initialisierung (`bootstrap/`-Muster der Vorlage) | testbar, Tree-Shaking | M |
| O7 | tiny-slider (nicht mehr gepflegt) durch CSS-Scroll-Snap oder Embla/Swiper ersetzen (Hero-Slider, Marker, Komponenten-Slider) | Wartbarkeit, Barrierefreiheit | M |
| O8 | Iconfont durch Inline-SVG bzw. SVG-Sprite ersetzen | Barrierefreiheit, keine FOIT, Farben per `currentColor` | M |
| O9 | Off-Canvas/Drilldown/Sticky-Header (D1, D3, D6) mit `<dialog>`/Popover-API, `position: sticky` und `scroll-padding-top` | weniger JS, robusteres Fokus-Management | M |
| O10 | `data-uri-target` (klickbare Karten per JS) durch Stretched-Link-Muster ersetzen | Semantik, kein JS | S |
| O12 | Lint-Ausnahmen aus Task 2 abbauen: Stylelint-Override (u. a. `& { … }`-Muster, `custom-property-pattern`, Klassen-/ID-Muster), ESLint-Globals, Ausschluss `vendors/bootstrap` | Linter ohne Sonderregeln | M |
| O13 | npm-Vendors aktualisieren: chart.js 3 → 4, tobii, micromodal; polyfills und `on-ready.js` (Duplikat von `site-inline.js`) entfernen | Sicherheit, weniger Code | S–M |
| O14 | Iconfont-Mixin und `$iconfont-create-*`-Schalter entfernen, direkt `.icon-font-*`/`var(--icon-font-*)` nutzen (oder O8) | einfacher | S |
| O15 | Aktiv-Zustände der Navigation wie in der Vorlage (H5): `is--active` für den Pfad, `is--current` und `aria-current="page"` für die aktuelle Seite; KIST-CSS/JS anpassen | Barrierefreiheit, Vorlage | S |
| O16 | Footer-Seite (`pages.footerContent`, Backend-Layout `footer`) durch Footer-Spalten auf der Startseite (colPos 20 ff., `slide = -1`) ersetzen, wie in der Vorlage | eine Pflegestelle | S–M |
| O17 | Logo-Leiste im Footer: statt Inhaltselement mit Kennung `tisax-certification` eigenes Feld/Content Block | robuster als Kennung | S |
| O11 | Bilder: `fo:media.picture` mit `loading="lazy"`, `fetchpriority` für Hero, AVIF/WebP prüfen | Core Web Vitals | S–M |

## P · Backend und Datenmodell

| ID | Vorschlag | Nutzen | Aufwand |
|---|---|---|---|
| P1 | Content Blocks für alle Mini-Extensions (Akkordeon, Tabs, Timeline, Hero/Slider, Marker, Werte, Downloads, Teaser) statt eigener Extensions — in Schritt 2 entschieden, hier nur die Folgearbeiten: alte Extensions, Elements-Tabelle und -Felder danach entfernen | weniger Extensions, ein Pflegeort | L |
| P2 | Seitenmedien und Teaser-Felder (B9, C8) mit Crop-Varianten vereinheitlichen | konsistente Teaser | M |
| P3 | FlexForm-Auswahllisten über Page-TSconfig `TCEFORM … addItems/removeItems` statt TypoScript-Settings (B11) | Standard-Core-Mechanismus | S–M |
| P4 | Menü „Unterseiten“ mit Sortierung: eigenen `MenuProcessor` durch Core-`alternativeSortingField` ersetzen (C9) | weniger eigener Code | S |
| P5 | ke_search-Hooks auf PSR-14-Events umstellen; prüfen, ob Core-Suche/Solr Alternativen sind | v14-konform | M |
| P6 | powermail + CleverReach-Finisher gegen Core EXT:form mit eigenem Finisher abwägen | eine Formular-Lösung | M–L |
| P7 | PDF-Export (CloudConvert-Middleware) prüfen: Print-CSS + Browser-Druck könnte reichen; sonst Zugangsdaten nur über `.env` | weniger Fremddienste | M |
| P8 | Sitzende Fremd-Extensions prüfen und ggf. ablösen: `scriptmerger` (Vite), `ps14_theme` (leer), `masi`, `warming`, `typed_extconf` | weniger Abhängigkeiten | S je Extension |
| P9 | Elements-, Readmore- und alte `tx_foundation_*`-Spalten nach den Wizards per Schemabereinigung entfernen | saubere DB | S |

## R · Altlasten in den geparkten Dateien (Task 6)

Bewusst nicht angepasst; spätestens beim Aktivieren der jeweiligen Extension
in Schritt 2 umsetzen.

| ID | Vorschlag | Betrifft | Aufwand |
|---|---|---|---|
| R1 | `fo:settings.get` durch Settings aus dem Template-Kontext bzw. Site Settings ersetzen | Partials Marker, Hero, Teaser, Timeline; Powermail `Form.html` (`pageType.ajaxContent` → `site.settings`) | S–M |
| R2 | Labels aus `EXT:xo` und `EXT:ps14_kist_news` in die Sprachdateien von `ps14_site` (Domain-Syntax) überführen | News `Detail.html`/`List/Item.html`, `Components/Person.html` | S |
| R3 | `xo:`-Namespace (Altlast der XO-Extension) entfernen und die ViewHelper ersetzen | `Partials/Timeline/Elements.html` | S |
| R4 | `f:format.raw` in den ke_search-Templates prüfen und, wo möglich, durch sichere Ausgabe ersetzen | `Extensions/KeSearch/Templates/*`, `Partials/*` | S |
| R5 | `/assets/...`-Pfade im geparkten TypoScript auf Vite umstellen (`vite:asset` im Template statt `importCss`/`importJs`) | `Configuration/TypoScript/Extensions/Step2/{KeSearch,News,Powermail,Pdf}` | S–M |

## Q · Betrieb und Qualität

| ID | Vorschlag | Nutzen | Aufwand |
|---|---|---|---|
| Q1 | Backup- und Sync-Skripte (Prod → Staging) für das Composer-/Deployer-Layout neu (G1) | Betrieb | S–M |
| Q2 | ~470 `.htaccess`-Redirects nach `sys_redirect` übernehmen (G2) | Pflege im Backend | M |
| Q3 | Tracking (etracker) nur noch über Site Settings, nicht im Development-Kontext (D14) | keine festen IDs im Code | S |
| Q4 | Visuelle Regressionstests (z. B. Playwright-Screenshots) für Kernseiten vor und nach Optimierungen | sichere Refactorings | M |
| Q5 | Barrierefreiheit prüfen (Kontraste, Fokus, ARIA der Navigationen) nach `interaction-states.md` | BFSG | M |
