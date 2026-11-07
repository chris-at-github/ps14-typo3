# Migration kist-escherich-com auf TYPO3 v14

Diese Anleitung sammelt alle Änderungen, die bei der Arbeit an der v14-Vorlage
(`ps14-typo3`) an ps14_foundation und ps14_site entstanden sind und die eine spätere
Migration von `~/www/kist-escherich-com` (TYPO3 12.4, Classic-Mode) betreffen.
Zu jeder Änderung stehen die nötigen Schritte im KIST-Projekt.

- Stand: 2026-11-07
- Grundlage: ps14_foundation Branch `v14-dev`, ps14_site Branch `v14-dev`, Hauptrepo `main`
- Feature-Inventar mit Entscheidungen und IDs: [feature-inventory-kist.md](feature-inventory-kist.md)
- Pfade alt relativ zu `~/www/kist-escherich-com/public/typo3conf/ext/`

## 1. Grundlagen

1. **Composer-Mode:** KIST läuft im Classic-Mode mit Extensions unter
   `public/typo3conf/ext/`. Für v14 auf Composer-Mode umstellen, analog zu `ps14-typo3`:
   - lokale Extensions unter `packages/`
   - Konfiguration unter `config/`
2. **ps14_foundation:** auf den Branch `v14-dev` (Branch-Alias `14.0.x-dev`) wechseln.
   Die Extension wird nie projektspezifisch angepasst. KIST-Eigenheiten gehören in das
   KIST-Sitepackage.
3. **Werkzeuge:** Rector, Fractor und PHPStan sind in `ps14-typo3` eingerichtet
   (`ddev exec vendor/bin/rector process`, `ddev exec vendor/bin/fractor process`). Für die
   KIST-eigenen Extensions (Block F im Inventar) ebenso verwenden.
4. **Upgrade-Wizards:** nach dem Core-Update alle ausführen (`ddev typo3 upgrade:run`).
   Besonders wichtig ist „Migrate links of pages of type link“ (siehe 4.3).
5. **Datenbank:** Spaltenänderungen übernimmt `extension:setup` **nicht**. Sie laufen
   über Admin Tools → Maintenance → *Analyze Database Structure*. Die Daten-Migrationen
   in Abschnitt 5 **vor** dem Entfernen alter Spalten und Tabellen ausführen.

## 2. Site-Konfiguration und Settings

### 2.1 Site Set `foundation/settings`

ps14_foundation stellt ein einziges Site Set bereit: `foundation/settings`.
- Das frühere Set `foundation/layout` wurde umbenannt.
- Das Set `foundation/meta` wurde entfernt, weil es `meta.themeColor` doppelt definierte.

```yaml
# config/sites/kist-escherich/config.yaml
dependencies:
  - foundation/settings
```

### 2.2 TypoScript-Konstanten → Site Settings

Die Seiten-IDs sind keine TypoScript-Konstanten in `Foundation.constants.typoscript` mehr,
sondern Site Settings.
- Die Keys sind gleich geblieben. TypoScript greift weiter über `{$navigation.main}` usw.
  darauf zu.
- Die Werte aus `ps14_site/Configuration/TypoScript/Site.constants.typoscript` in
  `config/sites/kist-escherich/settings.yaml` übertragen und dort aus den Konstanten löschen.

| Konstante alt (KIST-Wert) | Site Setting neu | Hinweis |
|---|---|---|
| `navigation.main` (4) | `navigation.main` | Typ `page` |
| `navigation.footer` (5) | `navigation.footer` | |
| `navigation.meta` (112) | `navigation.meta` | |
| `navigation.language` (`auto`) | `navigation.language` | |
| – | `navigation.social` | neu, siehe 3.4. `0` = keine Ausgabe |
| `pages.search` (38) | `pages.search` | Das Such-Widget erscheint nur, wenn der Wert gesetzt ist |
| `pages.home` (1) | entfällt | Startseite über `site.rootPageId` |
| `pages.contact` (111) | entfällt in foundation | Wurde nur von der Sticky-Leiste genutzt (entfällt in der Vorlage). Bei Bedarf im KIST-Sitepackage. |
| `pages.footerContent` (187) | entfällt | Footer-Inhalte über colPos 20, siehe 3.2 |
| `pages.navigationContent` (186) | entfällt | Inhalte über das Seitenfeld, siehe 3.3 |
| `pages.individualProduct` (183) | KIST-Sitepackage | projektspezifisch (Block F) |

Plugin-PIDs bleiben bei ihren Extensions:
- News `detailPid` 248
- Ansprechpartner `storagePid` 115 und `searchRequestPageUid` 118
- Produktkatalog `storagePid` 51

### 2.3 Weitere Settings im Set `foundation/settings`

| Setting | Ersetzt | KIST-Aktion |
|---|---|---|
| `layout.logoFilepath` | `layout.logoPath` | Key in `settings.yaml` umbenennen |
| `css.mainFilepath`, `css.printFilepath`, `js.mainFilepath` | fest eingetragene Pfade `/assets/css/site.css`, `print.css`, `/assets/js/site.js` | Vite-Entrypoints eintragen |
| `favicon.*Filepath`, `meta.themeColor` | Konstanten bzw. TypoScript | Werte übertragen |
| `pageType.ajaxContent` (Standard `1548191072`) | festes `typeNum` | Der Standard entspricht dem KIST-Wert `settings.searchRequestPageType` der Kontakt-Extension. Ändern sich die Werte, beide anpassen. |

### 2.4 Assets und Build

- Webpack/Laravel Mix wird durch Vite ersetzt (`vite-plugin-typo3`, `vite_asset_collector`).
  Entfallen sind:
  - `PageResourceProcessor`
  - `InlineResourceService`
  - die Konstanten `moduleProcessor.cssModuleEnabled/cssModuleInlineLimit`
  - das CSS/JS pro Modul im `ModuleProcessor`
- Kritisches Inline-CSS (`site-inline.scss`) und Modul-CSS pro Element gibt es in der
  Vorlage noch nicht (D12, zurückgestellt). In KIST bis dahin alles über `site.scss`.
- **Iconfont:** `ddev exec node build/build-iconfont.js` erzeugt aus
  `ps14_site/Resources/Private/Assets/Svg/Font/*.svg` die Dateien
  `Resources/Public/Fonts/iconfont.woff2` und `Assets/Scss/bootstrap/_iconfont.scss`.
  Klassen `.icon-font-<name>`, Variablen `--icon-font-<name>`. Die alten Glyphen aus
  `ps14_site/Resources/Public/Svg/Font/` dorthin verschieben.
- **Inline-SVGs:** Nur noch mit `EXT:`-Pfaden einbinden
  (`<fo:svg.inline source="EXT:…/Resources/Public/Svg/Embed/x.svg" />`). Alle
  `assets/svg/…`-Pfade in den KIST-Templates umstellen. Das Such-Widget der foundation
  bringt eigene `search.svg`/`close.svg` mit (`currentColor`).

### 2.5 Fehlerbehandlung und Sprachen

- `errorHandling` 404 muss auf eine echte Seite zeigen (`t3://page?uid=<404-Seite>`), nicht
  auf einen Ordner. Sonst endet jede 404 in einer 500.
- Für jede Sprache müssen Startseite und 404-Seite übersetzt sein. Sonst liefert z. B.
  `/en/` eine 404 bzw. 500.

## 3. Templates und Frontend-Ausgabe

### 3.1 Header und Breadcrumb

- `Partials/Page/Layout/Header.html` (foundation) rendert jetzt Logo, Meta-, Sprach- und
  Hauptnavigation. Die Breadcrumb wird im Seiten-Layout zwischen Header und `<main>`
  ausgegeben.
- Die Navigationen kommen weiterhin als FLUIDTEMPLATE-Strings
  (`navigationMain`, `navigationMeta`, `navigationLanguage`, `navigationFooter`,
  `navigationSocial`, `breadcrumb`). Die Variablen werden in
  `ps14_site/Configuration/TypoScript/Page/Page.setup.typoscript` übergeben.
- Klasse der Meta-Navigation: `navigation-meta` → `navigation--meta`.
- Off-Canvas, Drilldown und Sticky-Header (D1, D3, D6) sind in der Vorlage noch nicht
  umgesetzt (CSS/JS zurückgestellt). Das KIST-JS (`layout-0.js`, `layout-4.js`,
  `sticky-header.js`) bis dahin im KIST-Sitepackage weiterführen und auf ES-Module umstellen.

### 3.2 Backend-Layouts und Footer

| Alt (KIST) | Neu |
|---|---|
| `default` mit Main (0) und Footer (20) | `default`: nur Main (0). `defaultFooter` („Standard mit Footer“): Main (0) und Footer (20) |
| `footer` auf der Footer-Seite 187 (colPos 0 Mitte, 2 rechts) | entfällt |
| `product` (0, 15, 20) | im KIST-Sitepackage weiterführen (Block F) |

- Die Layouts liegen in `ps14_foundation/Configuration/TsConfig/Page/BackendLayouts/`.
  `DefaultFooter.tsconfig` ist standardmäßig nicht aktiv, in KIST per `@import` in der
  `page.tsconfig` des Sitepackages einbinden.
- `block.contentFooter` rendert colPos 20 mit `slide = -1`. Inhalte auf der Startseite
  gelten damit für alle Unterseiten. `stdWrap.required` und `wrap` erzeugen
  `<div class="page-footer__content">` nur, wenn Inhalt vorhanden ist.
- **Neues Footer-Markup** (`Partials/Page/Layout/Footer.html`):
  - `page-footer__content` mit colPos 20
  - `page-footer__meta` mit Copyright, Footer-Navigation und Social-Navigation
  - id `page-footer` (alt `page__footer`)
- In foundation entfallen Logo, Adressblock (tt_address, E4), Logo-Leiste (TISAX) und
  die zentrale Footer-Seite. In KIST das Footer-Partial im Sitepackage überschreiben, wenn
  Adresse, Logo-Leiste oder Sticky-Leiste bleiben sollen.

### 3.3 Hauptnavigation: Layout und Navigation Content (D2)

- `navigation.main` nutzt das Template `Templates/Navigation/Main.html`. Nur auf der
  **ersten Ebene** gibt es pro Menüpunkt mit Unterseiten oder Navigation Content einen
  Container:

  ```html
  <li class="navigation__group-item navigation__group-item--layout-card">
    <a class="navigation-item">…</a>
    <div class="navigation__container navigation__container--layout-card">
      … Layout-Section oder Standard-Listing …
      <div class="navigation__content">… Inhaltselemente …</div>
    </div>
  </li>
  ```

- **Layouts**:
  - Pro Wert von `pages.tx_foundation_navigation_layout` gibt es eine Section im Partial
    `Partials/Navigation/Main/Layout.html`. Der erste Buchstabe ist großgeschrieben, z. B.
    `card` → Section `Card`.
  - foundation liefert das Partial leer aus. ps14_site überschreibt es (Beispiel `card`).
  - Fehlt eine Section, wird das Standard-Listing ausgegeben.
  - KIST-Sections `Card`/`LargeCard` aus dem alten `Templates/Navigation/Main.html` in
    dieses Partial verschieben, `product` ebenso.
  - Die Auswahlwerte kommen per `TCEFORM.pages.tx_foundation_navigation_layout.addItems`
    aus dem Sitepackage.
- **Layout-Klassen** gibt es nur noch auf der ersten Ebene. `Item.html`/`Listing.html`
  setzen keine `--layout-*`-Klassen mehr.
- **Navigation Content**:
  - Das Seitenfeld `tx_foundation_navigation_content` speichert die tt_content-UIDs jetzt
    als kommagetrennte Liste, ohne MM-Tabelle.
  - Ausgegeben wird es über `block.navigationContent` (Core-`RECORDS`). Die Reihenfolge
    folgt dem Backend, die Sprache wird überlagert.
  - `NavigationContentProcessor` und `ContentProcessor` sind entfernt. Datenmigration
    siehe 5.2.
- Leere `navigation__content`-Container werden nicht mehr ausgegeben.

### 3.4 Social-Media-Navigation (statt Social-Links aus tt_address)

- Die Social-Links kamen in KIST aus dem tt_address-Datensatz „provider“
  (facebook, instagram, youtube, linkedin), mit Icons aus `assets/svg/`.
- **Neu:**
  - Ein Ordner mit Seiten vom Typ „Link“ (externe URL), Ordner-ID im Site Setting
    `navigation.social`.
  - Das Icon als SVG im neuen Seitenfeld `tx_foundation_icon` (Typ `file`, nur `svg`, eine
    Datei, Palette „Navigation“).
  - `tx_foundation_identifier` wird zur Klasse, z. B. `navigation__group-item--linkedin`.
- **Ausgabe:** `Templates/Navigation/Icon.html` mit Inline-SVG, Titel als
  `visually-hidden`, `target="_blank" rel="noopener noreferrer"`.
- **KIST-Aktion:** Ordner anlegen, die vier Seiten mit den URLs aus tt_address anlegen,
  SVGs aus `ps14_site/Resources/Public/Svg/Embed/{facebook,instagram,youtube,linkedin}.svg`
  hochladen (Farbe auf `currentColor`), `navigation.social` setzen.
- Die CSS-Klasse `.visually-hidden` muss es im KIST-CSS geben (bisher nur als Mixin).

### 3.5 Aktiv-Zustände der Navigation

| Alt | Neu |
|---|---|
| `is--active` nur an der aktuellen Seite (`item.current`) | `is--active` an allen Seiten im aktiven Pfad (`item.active`) |
| – | `is--current` an der aktuellen Seite |
| `aria-current="true"` | `aria-current="page"` (nur aktuelle Seite) |

KIST-CSS und -JS, die `.is--active` als „aktuelle Seite“ auswerten, auf `.is--current`
umstellen.

### 3.6 Weitere Template-Änderungen

- **Readmore:** wird über die Record-API gerendert (`{readmore}` ist jetzt befüllt).
- **Seiten-Template:** Die auskommentierten Sections `Header`/`Footer` in
  `Templates/Page/Default.html` sind entfernt. colPos 10 (Header) ist nicht vorgesehen,
  er kommt mit dem Hero (C3).
- **Komponenten:**
  - `data-uri-target` (JS-klickbare Karten) entfällt, ersetzt durch das
    „Stretched Link“-Muster per CSS.
  - Die Komponenten-Partials Card/Slider/Person (D9) sind nicht in der Vorlage. Es gibt
    eigene Komponenten, v14 unterstützt Component Collections über
    `Configuration/Fluid/ComponentCollections.php`.

## 4. TCA, TSconfig und PHP

### 4.1 TSconfig-Bedingungen `field()` / `irre()` / `page()`

- Die Bedingungsfunktionen kamen aus `ContentFieldProvider` bzw.
  `ContentElementFunctionsProvider`. Beide sind entfernt, ebenso
  `Configuration/ExpressionLanguage.php`.
- In Page-TSconfig haben sie in v14 ohnehin nicht funktioniert (Log: „The function "field"
  does not exist“).
- **Ersatz** mit der v14-Syntax pro Datensatztyp (Feature #107281):

```
# alt
[field('CType') === 'header']
  TCAdefaults.tt_content.header_layout = 1
  TCEFORM.tt_content.subheader.disabled = 0
[END]

# neu
TCAdefaults.tt_content.header_layout.types.header = 1
TCEFORM.tt_content.subheader.types.header.disabled = 0
```

**KIST-Aktion** in `ps14_site/Configuration/page.tsconfig`:
- Alle `[field('CType') === …]`-Blöcke umstellen: header, text, menu_pages/menu_subpages,
  ps14_hero, textmedia, entityproduct_keyfacts, powermail_pi1, ps14_timeline, ps14_tabs.
- `[field('list_type') === …]`: Plugins sind in v14 eigene CTypes, deshalb über
  `types.<CType>` umstellen. Betrifft ps14teaser_frontend und entityproduct_teaser.
- `[irre(…)]` (Elements-Inhalte) entfällt mit der Umstellung auf Content Blocks.
- Bedingungen mit festen Seiten-IDs (`[187 in tree.rootLineIds]` usw.) entfallen bzw. gehen
  in die jeweiligen Datensätze über (Footer-Seite und Navigations-Content gibt es nicht mehr,
  News-Vorgaben kommen mit E1).

### 4.2 Entfernte Seitenfelder und Paletten

| Feld/Palette | Grund | KIST-Aktion |
|---|---|---|
| `tx_foundation_disable_sticky`, Palette „Sticky“ | Sticky-Leiste entfällt in der Vorlage (D5) | Bleibt die Sticky-Leiste in KIST, Feld und Palette im KIST-Sitepackage definieren. Sonst Spalte per *Analyze Database Structure* entfernen. |
| Labels `tx_xo_sticky.contact`/`toTop` | wie oben | Labels ggf. im Sitepackage |
| `tt_content.tx_foundation_text_layout`, Palette `foundation_text` | nicht mehr verwendet (B2) | Spalte entfernen |
| Readmore/Elements: `t3ver_label`, `range.upper` (2038) | v14-Bereinigung | – |

### 4.3 Seitentyp „Typolink“ (doktype 120) entfernt

- **Grund:** Der Core-Seitentyp „Link“ (doktype 3, ehemals „External URL“) unterstützt in
  v14 alle Typolink-Ziele über das Feld `link`. Das Feld `url` gibt es nicht mehr
  (Breaking #17406).
- **Entfernt:**
  - die TCA-Erweiterung
  - die XCLASS `Ps14\Foundation\ContentObject\Menu\TextMenuContentObject` samt
    Registrierung in `ext_localconf.php`
  - `Configuration/Icons.php` mit dem Icon `foundation-page-typolink`
  - das Label `pages.pagetype.typolink`
  - `120` in `seo.sitemap.excludedDoktypes` und `options.pageTree.doktypesToShowInNewPageDragArea`
- **KIST-Aktion:** siehe 5.3.

### 4.4 Geänderte Seitenfelder

| Feld | Alt | Neu |
|---|---|---|
| `tx_foundation_navigation_layout` | select, DB `int` (TCA-Item `0`) bzw. `varchar(50)` mit Default `'0'` | select mit leerem Item `''`, DB `varchar(255)` |
| `tx_foundation_navigation_content` | group mit MM `tx_foundation_pages_content_mm`, DB `int` (Zähler) | group ohne MM, DB `longtext` (UID-Liste) |
| `tx_foundation_icon` | – | neu: file, nur `svg`, maxitems 1 |

### 4.5 Sonstiges

- `config.spamProtectEmailAddresses` ist entfernt. Es gilt der v14-Standard (aus).
- RTE-Stile laufen über CKEditor 5 `editor.config.style.definitions` (`ps14_site/Configuration/RTE/Global.yaml`).
  CKEditor-4-`stylesSet` gibt es nicht mehr.
- `FE.cacheHash.excludedParameters`: Der v14-Standard enthält die alte KIST-Liste.
  `pdf` kommt mit E5 dazu.
- Links auf den Einzelelement-Abruf (`pageType.ajaxContent` mit `tx_foundation[content]`)
  nur über TYPO3 erzeugen (`f:uri.page`/typolink), weil `FE.cacheHash.enforceValidation`
  aktiv ist.

## 5. Datenmigrationen (Reihenfolge beachten)

Vorher ein Datenbank-Backup anlegen. Die SQL-Beispiele sind Vorlagen und vor der
Ausführung gegen die KIST-Datenbank zu prüfen.

### 5.1 Navigation Layout

Werte wie `card`, `largeCard`, `product` bleiben erhalten, wenn die Spalte auf `varchar`
geht. Altwerte `'0'` dürfen bleiben, Fluid wertet sie als „nicht gesetzt“. Optional
bereinigen:

```sql
UPDATE pages SET tx_foundation_navigation_layout = '' WHERE tx_foundation_navigation_layout = '0';
```

### 5.2 Navigation Content: MM → UID-Liste

1. Mit *Analyze Database Structure* **nur** die Spalte
   `pages.tx_foundation_navigation_content` auf `longtext` ändern. Die MM-Tabelle noch
   **nicht** löschen.
2. Die Relationen übernehmen:

   ```sql
   UPDATE pages p
   SET p.tx_foundation_navigation_content = (
       SELECT GROUP_CONCAT(mm.uid_foreign ORDER BY mm.sorting SEPARATOR ',')
       FROM tx_foundation_pages_content_mm mm
       WHERE mm.uid_local = p.uid
   )
   WHERE p.uid IN (SELECT uid_local FROM tx_foundation_pages_content_mm);

   UPDATE pages SET tx_foundation_navigation_content = '' WHERE tx_foundation_navigation_content = '0';
   ```

3. Übersetzte Seiten prüfen. Das Feld steht auf `l10n_mode = exclude`, die Werte kommen
   aus der Standardsprache.
4. Danach die Tabelle `tx_foundation_pages_content_mm` per *Analyze Database Structure*
   entfernen.
5. Die Inhalte lagen in KIST auf der Seite 186 (Navigations-Content). Sie können dort
   bleiben, weil sie per UID referenziert werden. Die alte TSconfig-Bedingung
   `[186 in tree.rootLineIds]` für TCAdefaults entfällt.

### 5.3 Seitentyp 120 → Link (doktype 3)

1. Bestand prüfen: `SELECT uid, title, url FROM pages WHERE doktype = 120 AND deleted = 0;`
2. **Vor** dem Core-Update bzw. vor dem Entfernen der Spalte `url`:

   ```sql
   UPDATE pages SET doktype = 3 WHERE doktype = 120;
   ```

3. Danach den Upgrade-Wizard „Migrate links of pages of type link“ ausführen. Er überträgt
   `url` → `link` für externe URLs.
4. Typolink-Werte, die keine externen URLs sind (`t3://page?uid=…`, `#anker`, Dateien),
   migriert der Wizard nicht. Sie von Hand in das Feld `link` übernehmen, solange `url`
   noch vorhanden ist:

   ```sql
   UPDATE pages SET link = url WHERE doktype = 3 AND link = '' AND url <> '';
   ```

### 5.4 Footer-Inhalte

1. Im KIST-Sitepackage `DefaultFooter.tsconfig` importieren und auf der Startseite
   `backend_layout = pagets__defaultFooter` setzen.
2. Die Inhalte der Footer-Seite 187 (colPos 0 „Mitte“, colPos 2 „rechts“) auf die
   Startseite in colPos 20 verschieben (Backend: Ausschneiden/Einfügen, inkl. Übersetzungen).
   Die Spalten verteilt künftig CSS-Grid in `page-footer__content`.
3. Seite 187, das Backend-Layout `footer` sowie `block.contentFooterMiddle/Right`
   entfernen.

### 5.5 Social-Media-Ordner

Siehe 3.4. Danach die Social-Felder in tt_address nicht mehr im Footer verwenden.

### 5.6 Schemabereinigung

Mit *Analyze Database Structure* entfernen:
- `pages.tx_foundation_disable_sticky`, wenn die Sticky-Leiste entfällt
- `tt_content.tx_foundation_text_layout`
- `tx_foundation_pages_content_mm`, nach 5.2

## 6. Was im KIST-Projekt bleibt

Nicht Teil der Vorlage, im KIST-Sitepackage bzw. in KIST-Extensions auf v14 heben:

- **Block F**: Produktkatalog (`entity`, `entity_product`, `chart`, Import),
  Filter-Framework, Ansprechpartner-Suche, Firmenwerte, Produkt-Layout, Logos/TISAX.
- **Block G**: Backup- und Sync-Skripte, umgebungsspezifische `.htaccess`, ~470 Redirects
  nach `sys_redirect`, Staging-`baseVariant`, Mail-Absender und `systemLocale`.
- Sticky-Leiste (D5) und Tracking mit etracker (D14), falls KIST sie weiter braucht.
  - Tracking künftig mit Secure-Code und Proxy-Domain nicht mehr fest im TypoScript
    eintragen, sondern über Site Settings.
- **Fremd-Extensions (Block E):** news, powermail/CleverReach, ke_search, tt_address,
  PDF-Export, warming, masi. Die v14-Kompatibilität ist jeweils zu prüfen.
- **Zugangsdaten:** Die Klartext-Zugangsdaten (CleverReach, CloudConvert, Basic-Auth) nach
  `config/system/additional.php` bzw. `.env` verschieben.

## 7. Commit-Referenzen

| Thema | ps14_foundation (`v14-dev`) | ps14_site (`v14-dev`) | Hauptrepo (`main`) |
|---|---|---|---|
| v14-Fixes (Rector/Fractor/PHPStan) | `f6f9831` | `e4869e7` | `d8cb1b8` |
| A-Fixes, Readmore, Print-CSS | `2185cd4` | `a9f878a` | `72b2e8f` |
| Ajax-Typ als Setting, Spam-Schutz | `7806b35` | – | – |
| Seiten-IDs als Settings, Logo-Key (D8, D15) | `098ed74` | – | `b7d5846` |
| Navigationen und Breadcrumb im Layout | `c8d8ae6` | – | – |
| Backend-Layouts, TSconfig `types` (D7, D13, H2) | `eb7998e` | `c20540f` | `9c55c34` |
| Navigation Layout/Content (D2) | `a98b0cf` | `c0c818b` | `8258344` |
| Footer und Social-Navigation (D4) | `01b30f4` | `a666fbb` | `db0b386` |
| Icons Such-Widget, Iconfont (D11) | `c001c0b` | `3047870` | `ea63c38` |
| Sticky-Feld entfernt | `6c6c486` | – | – |
| Set `foundation/settings` (H4) | `e661a3e` | – | `356a62e` |
| Seitentyp 120 entfernt (H8) | `447e4e6` | – | `dd0edec` |
| Aktiv-Zustände Navigation (H5) | `3e35e6f` | `917a3a4` | `57db2f9` |
| 404-Fehlerseite (H1) | – | – | `9bacead` |
