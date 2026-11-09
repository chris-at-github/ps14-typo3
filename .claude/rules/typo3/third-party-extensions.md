---
paths:
  - "packages/*/Configuration/TypoScript/Extensions/**"
  - "packages/*/Resources/Private/Extensions/**"
  - "config/sites/*/config.yaml"
  - "config/sites/*/settings.yaml"
  - "composer.json"
---

# Fremd-Extensions

## Installation

- Prüfe vor der Installation die TYPO3-v14-Kompatibilität auf Packagist
  (Abhängigkeit `typo3/cms-core` der passenden Version).
- Installiere Extensions im Hauptrepo mit `ddev composer require <paket>`.
  Der Befehl ist nicht freigegeben — frage vorher nach.
- Führe danach `ddev typo3 extension:setup -e <extension_key>` und
  `ddev typo3 cache:flush` aus.
- Die Konfiguration ist projektspezifisch und liegt in `ps14_site`. Nur
  Extensions, die in allen Projekten eingesetzt werden (z. B. `seo`), werden
  in `ps14_foundation` konfiguriert — frage vorher nach.

## Einbindung des TypoScripts

Prüfe zuerst, ob die Extension ein Site Set mitbringt
(`vendor/<vendor>/<paket>/Configuration/Sets/*/config.yaml`, Schlüssel
`name`).

### Extension mit Site Set (Standard)

- Trage das Set unter `dependencies` in `config/sites/<site>/config.yaml`
  ein (nach `foundation/settings`).
- Setup und Settings des Sets werden automatisch geladen. Importiere die
  Setup- oder Konstanten-Dateien der Extension **nicht** zusätzlich per
  `@import` — sonst werden sie doppelt geladen.
- Es gibt keine Konstanten-Datei. Die Settings des Sets ersetzen die
  Konstanten und werden in `config/sites/<site>/settings.yaml` überschrieben
  (z. B. PIDs von Detail- oder Listenseiten). Im TypoScript stehen sie als
  Konstanten `{$…}` zur Verfügung.
- Anpassungen am Setup, für die es kein Setting gibt (z. B. Template-Pfade),
  kommen in die Importdatei `<ExtensionName>.setup.typoscript` (siehe unten).
  Das `sys_template` wird nach den Site Sets geladen und überschreibt deren
  Setup.

### Extension ohne Site Set

- Importiere die Dateien der Extension in die Importdateien und
  überschreibe die Werte darunter:
  - `<ExtensionName>.constants.typoscript`: `@import` der Konstanten-Datei,
    danach eigene Konstanten.
  - `<ExtensionName>.setup.typoscript`: `@import` der Setup-Datei, danach
    eigene Anpassungen.
- Binde keine statischen Templates über das Feld `include_static_file` im
  `sys_template` ein.

## Importdateien

- Ablage: `packages/ps14_site/Configuration/TypoScript/Extensions/`.
- Eine Datei je Extension und Typ, benannt nach dem Extension-Key in
  PascalCase: `news` → `News.setup.typoscript`, `tt_address` →
  `TtAddress.setup.typoscript` bzw. `TtAddress.constants.typoscript`.
- Die Dateien werden über `Site.setup.typoscript` bzw.
  `Site.constants.typoscript` per Glob (`Extensions/*.setup.typoscript`)
  geladen. Eine weitere Registrierung ist nicht nötig.
- Aufbau (Extension ohne Site Set; mit Site Set entfällt der `@import`):

  ```typoscript
  @import 'EXT:news/Configuration/TypoScript/setup.typoscript'

  plugin.tx_news {
    view {
      templateRootPaths {
        110 = EXT:ps14_site/Resources/Private/Extensions/News/Templates/
      }

      partialRootPaths {
        110 = EXT:ps14_site/Resources/Private/Extensions/News/Partials/
      }

      layoutRootPaths {
        110 = EXT:ps14_site/Resources/Private/Extensions/News/Layouts/
      }
    }

    settings {
      # eigene Anpassungen
    }
  }
  ```

## Templates, Partials und Layouts

- Ablage:
  `packages/ps14_site/Resources/Private/Extensions/<ExtensionName>/Templates/`,
  `…/Partials/` und `…/Layouts/`. `<ExtensionName>` entspricht dem Namen der
  Importdatei (z. B. `News`, `TtAddress`).
- Übernimm die relative Ordnerstruktur der Extension, damit die Dateien
  gefunden werden (z. B. `Templates/News/List.html`).
- Kopiere nur Dateien, die angepasst werden. Alle anderen werden weiter aus
  der Extension geladen.
- Pfade werden nur ergänzt, wenn Dateien überschrieben werden:
  - Extbase-Plugins: `plugin.tx_<extension>.view.templateRootPaths`,
    `partialRootPaths` und `layoutRootPaths`.
  - Andere Ausgaben (z. B. `FLUIDTEMPLATE`, `PAGEVIEW`): die entsprechenden
    `*RootPaths` des jeweiligen Objekts.
- Verwende den Key `110` für `ps14_site` (`100` ist für `ps14_foundation`
  reserviert, analog zu `lib.contentElement`). Überschreibe keine Keys der
  Extension; prüfe, ob sie selbst Keys ≥ `110` belegt.
- Die überschriebenen Templates folgen den Projektregeln: Komponenten aus
  `co:` verwenden (`fluid-components.md`), Markup und BEM nach
  `.claude/rules/frontend/`, Texte über die Domain `ps14_site.messages`
  (`translations.md`).

## Zugangsdaten

- Zugangsdaten (API-Keys, Passwörter) stehen nie im TypoScript, in
  `settings.yaml` oder in Templates.
- Lege sie in `.env` ab und lies sie über `%env(NAME)%` in der
  Site-Konfiguration bzw. über `getenv()` in
  `config/system/additional.php` aus.
