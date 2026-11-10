---
paths:
  - "packages/*/composer.json"
  - "packages/*/ext_emconf.php"
  - "packages/*/Readme.md"
  - "packages/*/README.md"
  - "packages/*/Configuration/**"
  - "packages/*/Resources/Private/Language/**"
  - "packages/*/Resources/Public/Icons/**"
---

# Eigene Extensions

Gilt für eigene, wiederverwendbare Extensions unter `packages/` (z. B.
`ps14_component`, `ps14_container`). `ps14_foundation` und `ps14_site` folgen
denselben Regeln, haben aber eigene Zuständigkeiten (siehe `CLAUDE.md`).

## Repository und Branches

- Jede Extension ist ein eigenes Git-Repository unter `packages/<extension_key>`
  (im Hauptrepo per `/packages/` ignoriert). Klone per HTTPS und setze danach
  `origin` auf die SSH-URL (`git@github.com:…`), da SSH in DDEV/WSL nicht immer
  verfügbar ist.
- Die Entwicklung für TYPO3 v14 läuft auf `v14-dev`. Ältere Stände (z. B. v12
  für bestehende Projekte) bleiben auf `master` bzw. ihrem Branch und werden
  nicht überschrieben.
- Feature-Branches `feature/<name>` zweigen von `v14-dev` ab und werden per
  Squash nach `v14-dev` gemergt.

## Metadaten

- `composer.json`:
  - Paketname `ps14/<extension_key>` (z. B. `ps14/ps14_container`).
  - `require`: `php: ^8.4`, `typo3/cms-core: ^14.3`, eigene Pakete als `@dev`
    (z. B. `ps14/ps14_foundation`), Fremdpakete mit Versions-Constraint.
  - `license: proprietary`, `homepage: https://ps14.de/`, Autor wie in den
    bestehenden Extensions.
  - `extra.typo3/cms.extension-key` und
    `extra.branch-alias: {"dev-v14-dev": "14.0.x-dev"}`.
  - `autoload` nur, wenn es `Classes/` gibt.
- `ext_emconf.php`: `version` `14.0.0`, `depends` passend zu `composer.json`
  (`typo3` `14.0.0-14.99.99`, abhängige Extensions mit Versionsbereich).
- Lösche leere oder überflüssige Dateien (`ext_localconf.php` ohne Inhalt,
  `Services.yaml` ohne `Classes/`, leere Konstanten-Dateien, ungenutzte
  Layouts).

## Einbindung ins Hauptprojekt

- Installation mit `ddev composer require ps14/<extension_key>:@dev` (Path-Repo
  `packages/*` ist eingerichtet). Der Befehl ist nicht freigegeben — frage
  vorher nach. Danach `ddev typo3 extension:setup -e <extension_key>` und
  `ddev typo3 cache:flush`.
- Trage die Extension in die Linter des Hauptrepos ein:
  - `.php-cs-fixer.dist.php` (Finder `in([...])`)
  - `phpstan.neon` (`paths`: `Classes`, `Configuration`, ggf.
    `ext_localconf.php`)
  - `package.json` → `lint:editorconfig`
- Hat die Extension kein Site Set, liefert sie
  `Configuration/TypoScript/setup.typoscript`. Eingebunden wird es per
  `@import` in
  `ps14_site/Configuration/TypoScript/Extensions/<ExtensionKeyPascalCase>.setup.typoscript`
  (z. B. `Ps14Container.setup.typoscript`).

## Inhaltselemente und Templates

- Inhaltselemente nutzen `lib.contentElement` per Referenz (`=<`) und damit
  das Layout `Default` aus `ps14_foundation`.
- Template- und Partial-Pfade der Extension bekommen den Key `50`, damit
  `ps14_foundation` (`100`) und `ps14_site` (`110`) sie überschreiben können.
  Lege die Dateien unter derselben relativen Struktur ab wie in
  `ps14_site` (z. B. `Resources/Private/Templates/Content/<Name>.html`).
- Gib kein HTML mit `f:format.raw` aus. Verschachtelte Inhaltselemente werden
  mit `<f:cObject typoscriptObjectPath="tt_content" data="{record}" table="tt_content" />`
  gerendert (bei b13/container mit `skipRenderingChildContent = 1`).
- Markup und SCSS folgen `.claude/rules/frontend/`. Das SCSS liegt in
  `ps14_site` (neues Modul nur nach Rückfrage).

## FlexForms

- Moderne Syntax ohne `<TCEforms>`; Felder mit `type="array"`.
- Zuweisung je CType über
  `$GLOBALS['TCA']['tt_content']['types'][<CType>]['columnsOverrides']['pi_flexform']['config']['ds']`,
  nicht über `addPiFlexFormValue`.
- Auswahllisten bekommen feste `items` im FlexForm. Verwende keine
  `itemsProcFunc`, die Optionen aus TypoScript-Settings liest
  (`getItemsBySettingsIdentifier`, siehe B11 im KIST-Inventar).
- Projektspezifische Anpassungen erfolgen per Page-TSconfig in
  `ps14_site/Configuration/page.tsconfig`. Der Schlüssel ist der CType:
  `TCEFORM.tt_content.pi_flexform.<CType>.<sheet>.<feld>` mit `addItems`,
  `removeItems`, `keepItems`, `altLabels`, `disabled`.
- Eine `itemsProcFunc` ist nur für Listen erlaubt, die von Daten abhängen
  (z. B. Kategorien).
- Frontend-Werte, die an einer Auswahl hängen (z. B. Bildgrößen), bleiben im
  TypoScript oder in Site Settings.

## Backend-Labels und Redaktionsfreundlichkeit

- Backend-Labels (Titel, Beschreibung, Spalten, Feld- und Sheet-Labels,
  Select-Items) liegen in `Resources/Private/Language/locallang_tca.xlf`
  (Englisch, `<source>`) und `de.locallang_tca.xlf` (nur `<target>`).
  Frontend-Texte folgen `translations.md`.
- Verwende in TCA, FlexForm und `ContainerConfiguration` nur `LLL:`-Referenzen,
  keine Klartext-Strings. Ausnahme: rein numerische Item-Labels
  (z. B. `33 % / 66 %`).
- Jedes Inhaltselement hat einen sprechenden Titel und eine **sehr kurze**
  Beschreibung für Redakteure (Deutsch und Englisch). Technische Namen wie
  `ps14_container_2_column` oder Platzhalter sind keine gültigen Titel.
- Jedes Feld hat ein eigenes, sprechendes Label. Mehrere Felder dürfen nicht
  auf denselben Label-Key zeigen.
- Item-Werte bleiben technisch (`33-66`), nur die Labels werden sprechend.
- Eigene Tabellen: `ctrl.title` lokalisiert und im Singular, `ctrl.label` auf
  das aussagekräftigste Feld (Fallback über `label_alt`).
- Das `showitem` eigener Typen baut auf `TcaService::getShowitem()` aus
  `ps14_foundation` auf, damit die foundation-Paletten erhalten bleiben.

## Icons

- **Extension-Icon:** in v14 ausschließlich
  `Resources/Public/Icons/Extension.svg` (Reihenfolge svg → png → gif). Ein
  `ext_icon.*` im Root ist wirkungslos und wird entfernt.
- **Icons für Inhaltselemente:** Verwende ein passendes Core-Icon über seinen
  Identifier (z. B. `content-container-columns-2`), wenn es eines gibt.
  Eigene Icons nur, wenn kein Core-Icon passt.
- Eigene Icons im Stil der TYPO3-Core-Icons (Vorlage:
  `vendor/typo3/cms-core/Resources/Public/Icons/T3Icons/svgs/content/*.svg`,
  nicht die Sprite-URLs unter `/_assets/`):
  - `viewBox="0 0 16 16"`, keine `width`/`height`.
  - Weißer Hintergrund: `<path fill="#FFF" d="M1 1h14v14H1V1z"/>`.
  - Grauer 1px-Rahmen: `<path fill="#999" d="M1 1v14h14V1H1zm1 1h12v12H2V2z"/>`.
  - Motiv erst ab `x=3` / `y=3`, in Grautönen (`#666`, `#B9B9B9`); Akzentfarben
    nur passend zu den Core-Icons (z. B. wie bei `textpic`).
- Registrierung:
  - b13/container: `->setIcon()` mit Core-Identifier oder Dateipfad
    `EXT:<ext>/Resources/Public/Icons/<datei>.svg` — keine `Icons.php` nötig.
  - Sonst `Configuration/Icons.php` mit `SvgIconProvider` und eindeutigem
    Identifier (`<extension-key>-<name>`).
  - Prüfe, dass jede referenzierte Datei existiert.
- Neuer Ordner `Resources/Public/`: Die Assets werden erst nach einem neuen
  Composer-Artefakt unter `public/_assets/` veröffentlicht
  (`ddev composer dumpautoload`, nach Rückfrage), `cache:flush` allein reicht
  nicht. Prüfe die Icon-URL auf HTTP 200.
- Geänderte Icons werden 30 Tage im Browser gecacht (stabile URL). Prüfe die
  Auslieferung per `curl` statt per Browser-Reload.

## Readme

Jede Extension hat eine kurze `Readme.md` (Deutsch, max. 80 Zeichen pro Zeile):

1. Zweck in einem Satz
2. Inhaltselemente/Funktionen (Tabelle mit CType, Spalten, Optionen)
3. Installation (Composer, TypoScript-Import, nötige Styles)
4. Anpassungen (Template-Overrides, TSconfig-Beispiele)

## Prüfung

- `ddev exec npm run lint` ohne Befund.
- Testdaten per MCP (`in2mcp`) anlegen und Backend (TCA-Schema, Labels) sowie
  Frontend (HTTP 200, erwartetes Markup) prüfen.
- Änderungen, die bestehende Projekte (z. B. KIST) betreffen, in der
  jeweiligen Migrationsanleitung dokumentieren.
