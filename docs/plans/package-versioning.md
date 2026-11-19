# Requirements

### Überblick & Ziel

Die gemeinsam genutzten Pakete `ps14_foundation`, `ps14_component`,
`ps14_container` und `ps14_menu` werden mit Tags nach der TYPO3-Version
(`14.x.x`) versioniert und von Projekten als normale Composer-Abhängigkeit
(`^14.0`) aus ihren Git-Repositories bezogen. Ein Projekt ist damit über
`composer.lock` reproduzierbar; Updates laufen per `composer update ps14/*`.
Für die Entwicklung kann jedes Paket lokal unter `packages/` eingehängt werden
(Path-Override).

### Scope

**In Scope**
- Branch-Modell der vier Paket-Repos: `main` (aktuelle Major, 14) und
  Wartungsbranch je alter Major (`13.x`).
- Metadaten der Pakete (`composer.json`, `ext_emconf.php`) für getaggte
  Releases.
- Erstes Release `14.0.0` aller vier Pakete.
- Hauptrepo: Bezug über VCS-Repositories, lokaler Path-Override,
  Linter-Konfiguration für nicht ausgecheckte Pakete, Schutz gegen
  committete Path-Einträge in `composer.lock`.
- Dokumentation des Release- und Override-Ablaufs (README, `own-extensions.md`).

**Out of Scope**
- `ps14_site` bleibt Path-Paket (eigenes Repo, projektspezifisch). Ob Site
  künftig direkt im Projektrepo liegt, wird separat entschieden.
- Kundenrepos statt Kunden-Branches im Hauptrepo.
- Auflösen der Kunden-Branches in `ps14_foundation`/`ps14_site`
  (`kist-escherich`, `haus-schnetzer-at`, `kist-escherich-hyjoin`) — sie
  bleiben, bis das jeweilige Projekt migriert ist; es entstehen keine neuen.
- Private Packagist / Satis, CI-Pipelines.

### User Story

- Als Entwickler möchte ich in jedem Projekt festlegen, welchen Stand der
  gemeinsamen Pakete es nutzt, und diesen gezielt per `composer update`
  anheben, damit Änderungen an der Foundation kein Projekt ungewollt
  verändern.

### Akzeptanzkriterien

- In jedem der vier Paket-Repos existieren `main` und das Tag `14.0.0`
  (ohne `v`-Präfix) auf dem v14-Stand.
- Keine Paket-`composer.json` enthält mehr `@dev`; eigene Abhängigkeiten
  sind `^14.0`, Branch-Alias `dev-main` → `14.x-dev`.
- Mit leerem `packages/` (außer `ps14_site`) installiert
  `ddev composer install` die vier Pakete in der Version `14.0.0` aus GitHub
  (`ddev composer show ps14/ps14_foundation` → `versions : * 14.0.0`).
- Mit ausgechecktem `packages/ps14_foundation` liefert
  `ddev composer update ps14/ps14_foundation` den lokalen Stand als Symlink
  (`14.x-dev`).
- `ddev exec npm run lint` läuft in beiden Zuständen ohne Fehler.
- `ddev exec npm run lint` schlägt fehl, wenn eine gestagte `composer.lock`
  eines der vier Pakete als Path-Paket enthält.
- `ddev typo3 extension:setup` und `ddev typo3 cache:flush` laufen fehlerfrei,
  Frontend und Backend antworten mit HTTP 200.

# Technical Design

### Aktueller Zustand

- Hauptrepo: `repositories` enthält nur `path ./packages/*` (Symlink),
  `require` bindet alle `ps14/*` mit `@dev` ein. `packages/` ist gitignored;
  `composer.lock` enthält die Pakete als `dist.type: path` mit
  `version: dev-v14-dev` → ohne manuell geklonte Pakete nicht installierbar.
- `minimum-stability: stable`, `prefer-stable: false`.
- Paket-Repos (Stand in `../ps14-typo3/packages`):

| Paket | Remote | Branches | Branch-Alias | eigene Abhängigkeiten | Tags |
|---|---|---|---|---|---|
| ps14_foundation | `ps14-foundation.git` | `v14-dev`, `master`, `13.0.0-dev`, Kunden-Branches | `dev-v14-dev` | — | `v2.0.1` |
| ps14_component | `ps14-component.git` | `main` | `dev-main` | foundation `@dev` | `v14.0.0` |
| ps14_container | `ps14-container.git` | `v14-dev`, `master` | `dev-v14-dev` | foundation `@dev` | — |
| ps14_menu | **kein Remote** | `v14-dev` | `dev-v14-dev` | foundation, component `@dev` | — |

- `ext_emconf.php` aller Pakete: `version` `14.0.0`.
- Linter-Konfigurationen setzen voraus, dass alle Pakete unter `packages/`
  liegen: `phpstan.neon` (`paths`), `.php-cs-fixer.dist.php` (`in([...])`),
  `rector.php`/`fractor.php` (foundation), `package.json`
  (`lint:editorconfig`). Fehlt ein Pfad, brechen die Tools ab.
- `.claude/rules/typo3/own-extensions.md` beschreibt noch `v14-dev`,
  `@dev`-Abhängigkeiten und den Branch-Alias `dev-v14-dev`.

### Key Decisions

- **Tags `14.MINOR.PATCH` ohne `v`**, Major = TYPO3-Major. Patch für Bugfixes,
  Minor für neue Funktionen, Breaking Changes nur mit neuer TYPO3-Major.
  Alte Tags (`v2.0.1`) bleiben; `v14.0.0` in `ps14_component` wird durch
  `14.0.0` ersetzt (sonst zwei Tags mit derselben normalisierten Version).
- **Branches:** `main` = 14, `13.x` = Wartung v13 (Quelle wird je Repo in
  Task 1 bestimmt). Feature-Branches zweigen von `main` ab.
- **Bezug per VCS-Repository über HTTPS** (`https://github.com/chris-at-github/<repo>.git`).
  SSH ist laut `own-extensions.md` in DDEV/WSL nicht zuverlässig. Für private
  Repos braucht Composer einen GitHub-Token, der **nicht** ins Repo kommt:
  lokal `ddev composer config --global github-oauth.github.com <token>`,
  auf Servern per `COMPOSER_AUTH`.
- **Path-Override:** Das Path-Repo bleibt als erstes Repository bestehen.
  Composer behandelt das erste Repo, das ein Paket liefert, als kanonisch:
  - `packages/ps14_foundation` vorhanden → lokaler Symlink,
  - Verzeichnis fehlt → Version aus dem VCS-Repo.
  Die Option `versions` fixiert die lokale Version auf `14.x-dev`, damit
  Feature-Branches in der Checkout-Kopie `^14.0` weiterhin erfüllen.
- **Stabilität:** Root-`require` mit `^14.0@dev` plus `prefer-stable: true`.
  Ohne Override zieht Composer den höchsten Tag, mit Override wird
  `14.x-dev` akzeptiert. `minimum-stability` bleibt `stable`.
  Paketinterne Abhängigkeiten lauten `^14.0` (ohne `@dev`).
- **Schutz der Lock-Datei:** Neues Skript `build/check-composer-lock.js`
  prüft die **gestagte** `composer.lock` (`git show :composer.lock`) und
  bricht ab, wenn eines der vier Pakete als Path-Paket eingetragen ist.
  Es wird Teil von `npm run lint` (damit greift es vor jedem Commit).
- **Linter nur auf vorhandene Pakete:** Pfade werden per Glob bzw. `is_dir`
  ermittelt; Pakete aus `vendor/` werden im Projekt nicht gelintet (sie werden
  im Repo geprüft, in dem sie entwickelt werden).

### Proposed Changes

**Hauptrepo `composer.json`:**

```json
"require": {
    "ps14/ps14_component": "^14.0@dev",
    "ps14/ps14_container": "^14.0@dev",
    "ps14/ps14_foundation": "^14.0@dev",
    "ps14/ps14_menu": "^14.0@dev",
    "ps14/ps14_site": "@dev"
},
"prefer-stable": true,
"repositories": [
    {
        "type": "path",
        "url": "./packages/*",
        "options": {
            "symlink": true,
            "versions": {
                "ps14/ps14_component": "14.x-dev",
                "ps14/ps14_container": "14.x-dev",
                "ps14/ps14_foundation": "14.x-dev",
                "ps14/ps14_menu": "14.x-dev"
            }
        }
    },
    { "type": "vcs", "url": "https://github.com/chris-at-github/ps14-component.git" },
    { "type": "vcs", "url": "https://github.com/chris-at-github/ps14-container.git" },
    { "type": "vcs", "url": "https://github.com/chris-at-github/ps14-foundation.git" },
    { "type": "vcs", "url": "https://github.com/chris-at-github/ps14-menu.git" }
]
```

(Übrige `require`-Einträge unverändert.)

**Paket-`composer.json` (Beispiel `ps14_menu`):**

```json
"require": {
    "php": "^8.4",
    "ps14/ps14_component": "^14.0",
    "ps14/ps14_foundation": "^14.0",
    "typo3/cms-core": "^14.3",
    "typo3/cms-fluid-styled-content": "^14.3"
},
"extra": {
    "typo3/cms": { "extension-key": "ps14_menu" },
    "branch-alias": { "dev-main": "14.x-dev" }
}
```

**`build/check-composer-lock.js`:**

```js
import { execSync } from 'node:child_process';

const SHARED_PACKAGES = ['ps14_component', 'ps14_container', 'ps14_foundation', 'ps14_menu'];

let lock;
try {
  lock = JSON.parse(execSync('git show :composer.lock', { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }));
} catch {
  process.exit(0);
}

const offending = [...lock.packages, ...(lock['packages-dev'] ?? [])]
  .filter((pkg) => pkg.dist?.type === 'path')
  .map((pkg) => pkg.name.replace('ps14/', ''))
  .filter((name) => SHARED_PACKAGES.includes(name));

if (offending.length > 0) {
  console.error(`composer.lock enthält lokale Path-Pakete: ${offending.join(', ')}`);
  console.error('Checkout aus packages/ entfernen und "ddev composer update ps14/*" ausführen.');
  process.exit(1);
}
```

**`package.json`:**

```json
"lint": "npm run lint:composer-lock && npm run lint:css && npm run lint:js && npm run lint:editorconfig && npm run lint:php && npm run lint:phpstan",
"lint:composer-lock": "node build/check-composer-lock.js",
"lint:editorconfig": "editorconfig-checker && editorconfig-checker packages/*/"
```

**`.php-cs-fixer.dist.php`:** `->in(glob(__DIR__ . '/packages/*', GLOB_ONLYDIR))`

**`phpstan.neon`:** `paths` entfernen, stattdessen
`includes: - phpstan.paths.php`. Die neue Datei liefert nur vorhandene Pfade:

```php
<?php

declare(strict_types=1);

$candidates = [
    'packages/ps14_foundation/Classes',
    'packages/ps14_foundation/Configuration',
    'packages/ps14_foundation/ext_localconf.php',
    'packages/ps14_foundation/ext_tables.php',
    'packages/ps14_component/Classes',
    'packages/ps14_container/Configuration',
    'packages/ps14_menu/Configuration',
    'packages/ps14_site/Classes',
    'packages/ps14_site/Configuration',
    'packages/ps14_site/ext_localconf.php',
];

return [
    'parameters' => [
        'paths' => array_values(array_filter(
            array_map(static fn(string $path): string => __DIR__ . '/' . $path, $candidates),
            'file_exists',
        )),
    ],
];
```

**`rector.php` / `fractor.php`:** Pfade mit `array_filter(..., 'is_dir')`
bzw. `file_exists` absichern (Skip-Eintrag `SectionViewHelper.php` ebenso).

### File Structure

| Repo | Datei | Änderung |
|---|---|---|
| alle vier Pakete | `composer.json` | Branch-Alias, `^14.0` statt `@dev` |
| ps14_menu | — | GitHub-Repo `ps14-menu` anlegen (durch dich) |
| Hauptrepo | `composer.json`, `composer.lock` | VCS-Repos, Override, Stabilität |
| Hauptrepo | `build/check-composer-lock.js` (neu) | Lock-Prüfung |
| Hauptrepo | `package.json` | `lint:composer-lock`, Glob für editorconfig |
| Hauptrepo | `.php-cs-fixer.dist.php`, `phpstan.neon`, `phpstan.paths.php` (neu), `rector.php`, `fractor.php` | nur vorhandene Pakete |
| Hauptrepo | `README.md` | Abschnitt „Gemeinsame Pakete“ |
| Hauptrepo | `.claude/rules/typo3/own-extensions.md` | Branches, Metadaten, Einbindung, Release |

### Risks

- **Private Repos:** Ohne Token schlägt `composer install` fehl (lokal und
  beim Deployment). Token-Einrichtung ist Voraussetzung für Task 4.
- **`versions`-Option:** Falls Composer `14.x-dev` nicht akzeptiert,
  Fallback `14.99.0-dev` (wird in Task 4 geprüft).
- **Kunden-Branches** in Foundation/Site referenzieren weiter alte Stände;
  Projekte darauf bleiben bis zur Migration beim Path-Repo.
- **Remote-Aktionen** (Push, Default-Branch auf GitHub umstellen, alte Tags
  und Branches remote löschen) führst du aus — ich bereite nur lokal vor.

# Testing

### Validierungsansatz

Manuelle Prüfung in DDEV in beiden Zuständen (ohne und mit Path-Override),
plus Lint-Läufe. Dieses Repo (`packages/` leer) entspricht dem Zustand eines
Kundenprojekts und eignet sich direkt als Testumgebung.

### Kernszenarien

1. `packages/` enthält nur `ps14_site` → `ddev composer install` lädt die vier
   Pakete als `14.0.0` nach `vendor/ps14/`.
2. `packages/ps14_foundation` wird geklont → `ddev composer update ps14/ps14_foundation`
   → `vendor/ps14/ps14_foundation` ist Symlink, Version `14.x-dev`.
3. Checkout entfernt → `ddev composer update ps14/*` → zurück auf `14.0.0`.
4. `composer.lock` aus Szenario 2 stagen → `ddev exec npm run lint` schlägt
   mit Hinweis fehl.
5. Neues Patch-Tag `14.0.1` (nur lokal als Test) → `ddev composer update ps14/ps14_foundation`
   zieht es (nach Push).

### Edge Cases

- Checkout auf Feature-Branch → `versions`-Option hält `14.x-dev`.
- Kein Paket ausgecheckt außer Site → alle Linter laufen ohne „path not
  found“.
- `composer.lock` nicht gestagt / nicht vorhanden → Lock-Prüfung ist neutral.

# Delivery Steps

Jeder Task in einem Repo läuft auf `feature/package-versioning`
(Hauptrepo und jedes Paket-Repo). Push und Merge nach `main` nur auf deine
Anweisung.

### Task 1: Branches in den Paket-Repos vorbereiten

- Je Repo die v13-Quelle bestimmen (`git show <branch>:composer.json`,
  `typo3/cms-core`-Constraint) und lokal `13.x` daraus anlegen
  (foundation: vermutlich `13.0.0-dev`, container: `master`).
- `main` aus `v14-dev` anlegen (foundation, container, menu); component hat
  `main` bereits.
- Für dich: GitHub-Repo `ps14-menu` anlegen, Branches pushen, Default-Branch
  auf `main` umstellen, `v14-dev`/`master` danach löschen.

### Task 2: Paket-Metadaten anpassen

- In allen vier `composer.json`: Branch-Alias `"dev-main": "14.x-dev"`,
  eigene Abhängigkeiten `^14.0`.
- `ext_emconf.php`: `version` `14.0.0` prüfen, `depends` der eigenen
  Extensions auf `14.0.0-14.99.99`.
- Commit je Repo: `chore: prepare package for tagged 14.x releases`.

### Task 3: Erstes Release taggen

- Nach dem Merge nach `main` (auf deine Anweisung): annotiertes Tag
  `git tag -a 14.0.0 -m "14.0.0"` je Repo; in component lokal `v14.0.0`
  löschen.
- Nur v14 wird getaggt. `12.x`/`13.x` bleiben vorerst ohne Tags (die
  v12-Projekte hängen an Kunden-Branches); getaggt wird erst, wenn ein
  Projekt sie per Composer-Version bezieht.
- Für dich: Tags pushen, `v14.0.0` remote löschen.

### Task 4: Hauptrepo auf VCS-Bezug umstellen

- GitHub-Token in DDEV einrichten (durch dich, Befehl siehe Key Decisions).
- `composer.json` gemäß Proposed Changes; `ddev composer update ps14/*`
  (nicht freigegeben → vorher Rückfrage).
- Szenarien 1–3 durchspielen, Ergebnis im Status festhalten.
- Commit: `feat: install shared ps14 packages from tagged GitHub releases`.

### Task 5: Linter und Lock-Prüfung

- `build/check-composer-lock.js`, `package.json`, `.php-cs-fixer.dist.php`,
  `phpstan.neon` + `phpstan.paths.php`, `rector.php`, `fractor.php` gemäß
  Proposed Changes.
- `ddev exec npm run lint` mit und ohne Override, Szenario 4 prüfen.
- Commit: `chore: lint only checked-out packages and reject path packages in composer.lock`.

### Task 6: Dokumentation

- `README.md`: Abschnitt „Gemeinsame Pakete“ (Update per
  `ddev composer update ps14/*`, Override aktivieren/beenden, Token).
- `own-extensions.md`: Branches (`main`, `13.x`), Metadaten (`^14.0`,
  Branch-Alias `dev-main`), Einbindung (VCS + Override statt
  `require …:@dev`), Release-Ablauf (Merge → `ext_emconf`-Version → Tag).
- Neues Paket: Repo zum Fine-grained Token (Contents read-only) hinzufügen
  und VCS-Eintrag in der Projekt-`composer.json` ergänzen. Token liegt in
  `~/.ddev/homeadditions/.composer/auth.json`.
- Commit: `docs: describe versioning and release workflow of shared packages`.

# Status

- [x] Task 1 – Branches (lokal): `master` ist in foundation/container der
  v12-Stand, daher zusätzlich `12.x`.
  - foundation: `main` ← `v14-dev`, `13.x` ← `origin/13.0.0-dev`,
    `12.x` ← `master`
  - container: `main` ← `v14-dev`, `12.x` ← `master` (kein v13-Stand)
  - component: `main` unverändert
  - menu: `v14-dev` → `main` umbenannt, Remote `ps14-menu.git` eingetragen
  - Offen (du): Branches pushen, Default-Branch
    `main`, danach `v14-dev`/`master`/`13.0.0-dev` remote löschen.
    Fetch per SSH schlug fehl — Remote-Stände vor dem Push abgleichen.
- [x] Task 2 – Metadaten: je Paket-Repo auf `feature/package-versioning`
  committet (Branch-Alias `dev-main` → `14.x-dev`, `^14.0` statt `@dev`).
  `ext_emconf.php` war bereits korrekt (`14.0.0`, Abhängigkeiten
  `14.0.0-14.99.99`). `composer validate` und `npm run lint` ohne Befund.
- [x] Task 3 – Release 14.0.0: Squash-Merge nach `main`, annotiertes Tag
  `14.0.0` (foundation 4d25172, component 479c442, container 45a0b4a,
  menu e3da65a), `v14.0.0` in component lokal gelöscht.
  - Offen (du): `main` und Tags pushen (`git push origin main --follow-tags`),
    `v14.0.0` remote löschen (`git push origin :refs/tags/v14.0.0`).
- [x] Task 4 – VCS-Bezug: Commit 689deba in `~/www/ps14-typo3`
  (`feature/package-versioning`), `composer.json` + `composer.lock` mit
  VCS-Bezug (14.0.0). Szenarien 1–3 in `kist-escherich-com-v14` geprüft
  (DDEV-Projekt dort umbenannt, `ps14_site` nach `packages/` geklont):
  VCS → `14.0.0`, Override an → `14.x-dev` Symlink, Override aus → `14.0.0`.
  - Voraussetzungen auf GitHub: Default-Branch `main` (sonst liest Composer
    den alten Paketnamen `ps14/foundation` von `master`), Token mit
    „Only select repositories“ + Contents read-only.
  - In `ps14-typo3` zeigt `vendor/` noch auf `packages/` (Override), die
    committete Lock-Datei auf GitHub. Szenario 2 (Override) geprüft:
    `ddev composer update 'ps14/*'` → alle vier Pakete `14.x-dev` als Symlink
    auf `packages/`, Frontend 200 (`/de/`), Backend 200. Die `versions`-Option
    mit `14.x-dev` funktioniert.
  - `composer.lock` enthält dort jetzt Path-Einträge → nicht committen.
  - Offen: Szenarien 1 und 3 (VCS-Bezug) in `kist-escherich-com-v14`.
- [x] Task 5 – Linter und Lock-Prüfung: Commit 0e661a2 in `~/www/ps14-typo3`.
  - Template (alle Pakete ausgecheckt): `npm run lint` ohne Befund.
  - `kist-escherich-com-v14` (nur `ps14_site`): php-cs-fixer, PHPStan,
    Rector ohne Befund. Stylelint/ESLint/editorconfig-checker nicht geprüft
    — dort fehlt `node_modules` (`ddev npm install` nicht freigegeben).
  - Lock-Prüfung: gestagte Lock mit Path-Paket → Fehler mit Hinweis;
    gestagte Lock mit GitHub-Bezug → ok. Die committete Lock in
    `kist-escherich-com-v14` ist noch die alte (Path) und wird erst mit der
    Übernahme der Template-Änderungen ersetzt.
- [x] Task 6 – Dokumentation: `README.md` (Abschnitt „Gemeinsame Pakete“)
  und `.claude/rules/typo3/own-extensions.md` (Branches, Versionierung und
  Release, Metadaten, Einbindung neuer Pakete, Linter) in `~/www/ps14-typo3`;
  dieser Plan liegt dort unter `docs/plans/package-versioning.md`.
