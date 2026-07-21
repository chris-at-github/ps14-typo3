# Design: Composer-basierte TYPO3 v14 Installation (DDEV)

**Datum:** 2026-06-27
**Status:** Genehmigt
**Umgebung:** DDEV (WSL2), PHP 8.4, MariaDB 11.8, Node 24

## 1. Ziel & Umfang

Ein lauffähiges, schlankes **TYPO3 v14 LTS** Backend in der bestehenden
DDEV-Umgebung `ps14-typo3`, installiert über Composer.

**Definition of Done:**

- DDEV-Container laufen
- Backend-Login unter `https://ps14-typo3.ddev.site/typo3` funktioniert
- Leeres System: kein Seitenbaum, keine Site-Konfiguration, keine Inhalte
- Alles in einem neuen Git-Repository versioniert (erster Commit der Grundinstallation)

**Bewusst nicht enthalten (YAGNI):**

- Kein Seitenbaum / keine Root-Seite (`typo3 setup` läuft ohne `--create-site`)
- Keine Site-Konfiguration
- Kein Sitepackage, keine Templates, kein TypoScript
- Keine zusätzlichen Extensions über das Standard-Set der Base-Distribution hinaus

## 2. DDEV-Anpassung

Änderungen an `.ddev/config.yaml`:

- Projekttyp `php` → **`typo3`**
  (aktiviert den `ddev typo3`-Befehl und TYPO3-spezifische Defaults)
- Webserver `nginx-fpm` → **`apache-fpm`**
  (Rewrite-/Schutzregeln über die mitgelieferte `public/.htaccess`)

Unverändert: Docroot `public`, PHP 8.4, MariaDB 11.8, Node 24.

Anschließend `ddev start` (Container laufen aktuell nicht).

### Begründung Projekttyp `typo3`

1. **`ddev typo3`-Befehl** — Wrapper für die TYPO3-CLI (`vendor/bin/typo3`) im
   Web-Container.
2. **TYPO3-taugliche Webserver-Config** — korrekte Rewrites (Frontend-Routing,
   Backend unter `/typo3`) und Schutz sensibler Pfade (`/config`, `/var`,
   `/vendor`, `/typo3temp`).
3. **DB-Zugangsdaten als Umgebungsvariablen** — DDEV stellt die DB-Verbindung
   (Host `db`, DB/User/Pass = `db`) bereit, sodass `ddev typo3 setup` sie
   automatisch erkennt.

DDEV überschreibt bei TYPO3 **keine** TYPO3-Konfigurationsdatei bei jedem Start
— kein Konflikt mit dem `additional.php`-Ansatz (Abschnitt 5). Der Typ-Wechsel
ist reversibel und risikoarm.

### Begründung Webserver `apache-fpm`

Mit Apache übernehmen die Rewrite-/Schutzregeln primär die von der
Base-Distribution mitgelieferte `public/.htaccess`. Das ist näher an einem
Apache-basierten Produktivsystem. DDEV rendert dazu eine passende Apache-VHost-Config.

## 3. Composer-Installation

```bash
ddev composer create "typo3/cms-base-distribution:^14"
```

Legt an: `composer.json`, `composer.lock`, `vendor/`, `public/index.php`,
`public/.htaccess` und das Standard-Set an System-Extensions (u. a. backend,
frontend, install, fluid_styled_content, rte_ckeditor). Das Extension-Set wird
**unverändert** belassen.

## 4. TYPO3-Setup (nicht-interaktiv)

```bash
ddev typo3 setup --no-interaction \
  --admin-username="pschorr.christian@gmail.com" \
  --admin-user-password="Password1!" \
  --admin-email="pschorr.christian@gmail.com" \
  --project-name="PS14 TYPO3" \
  --server-type="apache" \
  --no-create-site
```

(Exakte Flag-Namen werden bei der Umsetzung gegen `ddev typo3 setup --help`
verifiziert; DB-Verbindung liefert DDEV automatisch.)

- **Admin-User** (vorerst unsicher, später anzupassen):
  - Benutzer: `pschorr.christian@gmail.com`
  - E-Mail: `pschorr.christian@gmail.com`
  - Passwort: `Password1!` (erfüllt TYPO3-Mindestlänge)
- **Projektname:** `PS14 TYPO3`
- **Kein** `--create-site` → System bleibt leer

Der Setup-Schritt legt den Admin-User in der DB (`be_users`) an und schreibt
`config/system/settings.php`.

## 5. Konfigurations-Aufteilung (Secrets ↔ versioniert)

Nach dem Setup werden die **sensiblen Werte** aus `config/system/settings.php`
nach `config/system/additional.php` ausgelagert:

- DB-Verbindung (`DB/Connections/Default/*`)
- `SYS/installToolPassword`
- `SYS/encryptionKey`

| Datei | Inhalt | Git |
| --- | --- | --- |
| `config/system/settings.php` | reproduzierbare Nicht-Geheimnisse (aktive Extensions, BE/FE-Defaults) | **versioniert** |
| `config/system/additional.php` | Secrets (DB-Verbindung, Install-Tool-Passwort, Encryption Key) | **gitignored** |

`additional.php` überschreibt die ausgelagerten Werte zur Laufzeit. Ergebnis:
`settings.php` enthält **keine** DB-Credentials und kann gefahrlos versioniert werden.

## 6. Git

```bash
git init
```

`.gitignore` (TYPO3-tauglich):

```gitignore
/vendor/
/public/index.php
/public/typo3/
/public/fileadmin/
/public/typo3temp/
/var/
/config/system/additional.php
```

**Committed** (erster Commit der Grundinstallation):

- `composer.json`, `composer.lock`
- `config/system/settings.php`
- `.ddev/` (inkl. geänderter Server-/Typ-Vorgaben)
- versionierbare `public/`-Asset-Verzeichnisse (ggf. via `.gitkeep`)
- `docs/superpowers/specs/`

**Nicht committed:** siehe `.gitignore` (insbesondere `vendor/`,
`config/system/additional.php`, generierte `public/`-Symlinks/Verzeichnisse).

## 7. Verifikation (Erfolgskriterien)

1. `ddev typo3 --version` meldet **14.x**
2. Backend-Login unter `https://ps14-typo3.ddev.site/typo3` mit
   `pschorr.christian@gmail.com` / `Password1!` erfolgreich
3. `config/system/additional.php` existiert und ist **nicht** in `git status`
   sichtbar (gitignored); `config/system/settings.php` enthält **keine**
   DB-Credentials
4. Rewrite-/Schutzregeln aktiv: `public/.htaccess` vorhanden, gerenderte
   Apache-Config geprüft
5. Sauberer erster Commit, Arbeitsbaum leer (`git status` clean bis auf
   bewusst ignorierte Dateien)

## 8. Offene Verifikationspunkte für die Umsetzung

- Exakte Flag-Namen von `ddev typo3 setup` gegen `--help` abgleichen
- Gerenderte Apache-Config in `.ddev/` nach erstem `ddev start` sichten
- Genaue Schlüsselpfade der Secrets in der generierten `settings.php` prüfen,
  bevor sie nach `additional.php` verschoben werden
