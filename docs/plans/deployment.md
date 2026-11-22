# Requirements

### Überblick & Ziel

Kundenprojekte werden mit Deployer auf Staging und Produktion ausgeliefert.
Auf dem Server gibt es weder Composer noch Zugriff auf das Repository: Ein
fertiges Artefakt (inkl. `vendor/` ohne Dev-Pakete und Vite-Build) wird
lokal in DDEV gebaut, hochgeladen und dort als neues Release aktiviert.
Umgebungsspezifische Werte (`TYPO3_CONTEXT`, später weitere) kommen aus
einer `.env` pro Umgebung. Erstes Projekt ist KIST + ESCHERICH
(`kist-escherich`).

### Scope

**In Scope**
- Deployer (`deployer/deployer`) als Dev-Abhängigkeit, Aufruf nur manuell in
  DDEV (`ddev auth ssh`, `ddev exec vendor/bin/dep deploy <stage>`).
- `deploy.php` mit Hosts und Projekt-Besonderheiten (pro Kunden-Branch
  angepasst), allgemeine Tasks in `deploy/typo3.php` (aus `main`).
- Artefakt-Build: sauberer Export des Branch-Stands, `composer install
  --no-dev`, Iconfont, Vite-Build, Archiv.
- Release-Struktur (`releases/`, `shared/`, `current`), `keep_releases = 3`.
- `.env` mit `helhum/dotenv-connector` in der Vorlage: `.env.dist`
  (Server), `.env.ddev` (lokal), `.env` gitignored und auf dem Server
  shared.
- `bin/update-system.sh`: TYPO3-Befehle nach einem Update, lokal und auf
  dem Server nutzbar.
- `.htaccess` pro Stage (Staging mit Basic Auth).
- KIST: Hosts `staging` und `production` (Verzeichnisse `staging-v14`,
  `production-v14`), erster Deploy auf Staging.
- Doku: `README.md`, `CLAUDE.md`, Skills `creating-typo3-projects` und
  `updating-typo3-projects` (Hinweise).

**Out of Scope**
- Inhalts- und Datenmigration von KIST v12 (eigener Plan
  `migration-kist-v14.md`), Go-Live und Umstellung der Domains.
- Automatisches Deployment (CI), Deploy aus Claude ohne deine Anweisung.
- DB-Zugangsdaten in `.env` (bleiben in `additional.php`).
- Sync Produktion → Staging, Backups (Skripte des Altprojekts, später).

### User Story

- Als Entwickler möchte ich einen Kunden-Branch mit einem Befehl auf
  Staging oder Produktion bringen, ohne Composer und Repo-Zugang auf dem
  Server, und bei Problemen auf das vorherige Release zurückschalten können.

### Akzeptanzkriterien

- `ddev exec vendor/bin/dep deploy staging` baut das Artefakt, lädt es hoch
  und schaltet `current` auf das neue Release um.
- Der Deploy bricht ab, wenn der Arbeitsbaum nicht sauber ist oder der
  falsche Branch ausgecheckt ist (nur committeter Stand wird ausgeliefert).
- Auf dem Server liegen weder `.git` noch `node_modules` oder Dev-Pakete.
- `fileadmin`, Logs, Sessions, `typo3temp/assets`, `.env` und
  `config/system/additional.php` überleben Deploys.
- Staging verlangt Basic Auth und läuft in `Production/Staging` — im Web und
  auf der Kommandozeile, gesetzt nur über `shared/.env`.
- Lokal läuft das Projekt unverändert in `Development` (aus `.env`).
- `/de/`, `/en/`, `/typo3/` antworten nach dem Deploy mit HTTP 200; eine
  geänderte Datei ist ohne weiteres Zutun sichtbar (OPcache).
- `ddev exec vendor/bin/dep rollback staging` aktiviert das vorherige
  Release.
- Es bleiben 3 Releases erhalten.

# Technical Design

### Aktueller Zustand

- Kein Deployer, kein `deploy.php`, keine `.env` in der Vorlage;
  `TYPO3_CONTEXT=Development` steht in `.ddev/config.yaml`
  (`web_environment`).
- Altprojekt KIST (TYPO3 12, ohne Composer): Hetzner Webhosting
  (konsoleH), Staging und Produktion auf demselben Host unter
  `/usr/home/kistae/public_html/staging` bzw. `/production`. Die
  Datenbank liegt auf einem externen Host, die Zugangsdaten stehen in
  `additional.php`. Updates wurden per Upload eingespielt; danach musste das
  OPcache geleert werden (sonst HTTP 500).
- Vergleichsprojekt `typo3_stadt_unterschleissheim_2026` (gleiches
  Hosting, Deployer 7 über GitLab-CI): SSH-Port `222`, Pfade unter
  `~/public_html/`, PHP-Version der CLI über `PHPVERSION`, `.env` mit
  `helhum/dotenv-connector`, Archiv-Upload in `deploy:update_code`,
  `.htaccess` per Kopie, `bin/update-system.sh`.
- Lokal: `public/.htaccess` ist ein Symlink auf `htaccess/.htaccess-ddev`.
- SSH-Schlüssel haben eine Passphrase; `ddev auth ssh` lädt sie in den
  Agent von DDEV.

### Key Decisions

- **Deployer läuft in DDEV**, nie auf dem Host: PHP, Composer, Node und der
  Composer-Token sind dort vorhanden. `runLocally` läuft damit im
  Web-Container.
- **Artefakt statt Git auf dem Server:** Der Build exportiert den
  committeten Stand (`git archive HEAD`) nach `temp/deploy/build/`, damit
  das lokale `vendor/` und `node_modules/` unberührt bleiben (anders als im
  Vergleichsprojekt, das im CI-Arbeitsverzeichnis packt).
- **`recipe/common.php`** mit den Standard-Tasks `deploy:prepare` und
  `deploy:publish`; ersetzt wird nur `deploy:update_code` (Archiv
  hochladen, entpacken, löschen). `after('deploy:failed', 'deploy:unlock')`.
- **Hosts in `deploy.php`** (deine Entscheidung): `main` enthält Beispiel-
  Hosts, der Kunden-Branch trägt seine Hosts und Besonderheiten ein. Die
  allgemeinen Tasks liegen in `deploy/typo3.php`, damit spätere Änderungen
  aus `main` möglichst ohne Konflikte in `deploy.php` ankommen.
- **Hetzner:** SSH-Port `222`, Pfade `~/public_html/<verzeichnis>`,
  `PHPVERSION=8.4` als Deployer-Umgebung (`set('env', …)`), damit `php` auf
  dem Server die richtige Version nutzt. `PHPVERSION` gehört nicht in
  `.env`, da es vor dem Start von PHP gebraucht wird.
- **`.env` (deine Entscheidung):** `helhum/dotenv-connector` lädt `.env`
  beim Einbinden von `vendor/autoload.php`, vor dem Boot von TYPO3; echte
  Umgebungsvariablen haben Vorrang.
  - `.env.dist`: Vorlage für Server (versioniert, ohne Secrets).
  - `.env.ddev`: lokale Werte (versioniert), wird per `post-start`-Hook nach
    `.env` kopiert, falls sie fehlt (`cp -n`).
  - `.env`: gitignored; auf dem Server in `shared/`.
  - `TYPO3_CONTEXT` kommt nur noch aus `.env`; der Eintrag in
    `web_environment` entfällt (er hätte Vorrang).
  - Nutzbar in der Site-Konfiguration (`%env(NAME)%`) und in TypoScript
    (`getEnv()`).
- **Pfade KIST:** `~/public_html/staging-v14` und `~/public_html/production-v14`;
  Docroot der (Sub-)Domain = `<pfad>/current/public`. Das Altprojekt bleibt
  unberührt.
- **Shared:** Verzeichnisse `public/fileadmin`, `public/typo3temp/assets`,
  `var/log`, `var/session`, `var/lock`; Dateien `.env`,
  `config/system/additional.php` (DB-Zugang), `public/.htpasswd` (nur
  Staging). `var/cache` bleibt pro Release.
- **`.htaccess` pro Stage:** versioniert `public/htaccess/.htaccess-staging`
  und `-production`; der Deploy kopiert die Datei der Stage nach
  `public/.htaccess` (kein Symlink, unabhängig von Apaches Symlink-Regeln).
- **`bin/update-system.sh`** (im Release vor dem Umschalten):
  `extension:setup`, `upgrade:run` (alle offenen Wizards, deine
  Entscheidung), `cache:flush`, `cache:warmup`. Der Cache ist damit warm,
  bevor `current` umschaltet. Lokal per `ddev exec bin/update-system.sh`.
- **OPcache:** `cache:flush` (deine Entscheidung) leert das OPcache nur im
  CLI-Prozess, nicht in PHP-FPM; da jedes Release einen eigenen Pfad hat,
  sollte FPM die neuen Dateien trotzdem laden. Wird im Test geprüft.
- **Rollback:** `dep rollback` plus `cache:flush` im zurückgeschalteten
  Release.
- **`keep_releases = 3`**, `log_files` für `dep logs`.
- **Kein Deploy ohne deine Anweisung;** `dep` bleibt außerhalb der
  erlaubten Befehle in `CLAUDE.md`.

### Proposed Changes

**Ablauf `dep deploy <stage>`:**

| Task | Ort | Aktion |
|---|---|---|
| `build:check` | lokal | Arbeitsbaum sauber, Branch = `branch` des Hosts |
| `build:artifact` | lokal (einmal) | `git archive HEAD` → `temp/deploy/build/`; `composer install --no-dev --optimize-autoloader`; `npm ci`; Iconfont; `vite build`; `node_modules` entfernen; Archiv `temp/deploy/package.tgz` |
| `deploy:prepare` | Server | Standard: info, setup, lock, release, `update_code`, shared |
| `deploy:update_code` | Server | Archiv hochladen, entpacken, löschen; `.htaccess` der Stage kopieren |
| `typo3:check` | Server | `shared/.env` und `shared/config/system/additional.php` vorhanden |
| `typo3:update` | Server | `bin/update-system.sh` im Release |
| `deploy:publish` | Server | Standard: symlink, unlock, cleanup |

**Host-Konfiguration (Beispiel KIST):**

```php
host('staging')
    ->setHostname('<ssh-host>')
    ->setRemoteUser('kistae')
    ->setPort(222)
    ->set('deploy_path', '~/public_html/staging-v14')
    ->set('branch', 'kist-escherich');
```

### File Structure

| Datei | Änderung |
|---|---|
| `composer.json`, `composer.lock` | `deployer/deployer` (require-dev), `helhum/dotenv-connector` (require, `allow-plugins`, `extra`) |
| `.env.dist`, `.env.ddev` (neu) | Vorlagen für Server und DDEV |
| `.gitignore` | `/.env`, `/.env.local`, `/.env.*.local` |
| `.ddev/config.yaml` | `TYPO3_CONTEXT` aus `web_environment` entfernen, `post-start`-Hook `cp -n .env.ddev .env` |
| `bin/update-system.sh` (neu) | TYPO3-Befehle nach Update/Deploy |
| `deploy.php` (neu) | Hosts (Beispiel in `main`), Projekt-Besonderheiten |
| `deploy/typo3.php` (neu) | Allgemeine Tasks (Build, Upload, Check, Update) |
| `public/htaccess/.htaccess-staging`, `-production` (neu) | Basis aus `.htaccess-ddev`, Staging mit Basic Auth |
| `bin/create-system.sh` | `.env` nach dem Clone anlegen (falls der Hook nicht greift) |
| `README.md`, `CLAUDE.md` | Abschnitte Deployment und `.env`; Commit-Regel zu `.env*` präzisieren |
| Skills `creating-…`, `updating-typo3-projects` | Hinweise `.env`, Staging-Deploy |
| Kunden-Branch `kist-escherich`: `deploy.php` | KIST-Hosts |

### Offene Punkte (vor Task 3 klären)

1. SSH-Host und Benutzer (vermutlich `kistae`, Port `222`).
2. PHP-Version auf dem Server: `PHPVERSION=8.4` verfügbar?
3. Datenbanken für `staging-v14` und `production-v14`: neue, leere
   Datenbanken im Hosting anlegen? (Inhalte kommen über den Migrationsplan.)
4. Domain für Staging v14 (z. B. `staging-v14.kist-escherich.com`); die
   Site-Konfiguration nutzt derzeit `staging.kist-escherich.com`, das noch
   auf das Altprojekt zeigt.
5. Benutzer/Passwort für Basic Auth auf Staging.

### Risks

- **OPcache/Realpath-Cache in PHP-FPM** hält das alte Release
  (`realpath_cache_ttl`, Symlink `current`) → Test in Task 5; falls ja,
  zusätzlicher Reset per Einmal-Skript über HTTP (erst nach Rückfrage).
- **Symlinks im Artefakt** (`vendor/ps14/ps14_site` → `packages/ps14_site`,
  `public/_assets/*`) müssen relativ sein, sonst zeigen sie auf
  `/var/www/html` → im Build prüfen.
- **`.env` fehlt lokal** (z. B. Clone ohne `ddev start`) → TYPO3 startet in
  `Production`; Hook und `create-system.sh` legen sie an, `README.md` nennt
  den Schritt.
- **`cache:flush` vor dem Umschalten** leert auch den Seiten-Cache, den das
  alte Release noch nutzt → kurz ungecachte Auslieferung, akzeptabel.
- **`extension:setup` und `upgrade:run` vor dem Umschalten** ändern Schema
  und Daten, während das alte Release noch läuft → kurz inkonsistent;
  akzeptabel für Staging, für Produktion beobachten. Wizards laufen ohne
  Rückfrage → bei TYPO3-Updates vorher auf Staging deployen und die
  Ausgabe prüfen.
- **Shared Hosting:** Limits für Prozesse/Zeit beim Entpacken und bei
  `cache:warmup`.
- **Merge-Konflikte in `deploy.php`** bei Änderungen in `main` → allgemeine
  Logik konsequent in `deploy/typo3.php`.

# Testing

### Validierungsansatz

`.env` und `update-system.sh` lokal in der Vorlage prüfen, Artefakt lokal
bauen und prüfen, dann auf `staging-v14` deployen und dort prüfen.
Produktion erst nach deiner Freigabe.

### Kernszenarien

1. Lokal: Kontext `Development` aus `.env` (Web und `ddev typo3`), ohne
   Eintrag in `web_environment`; `bin/update-system.sh` läuft durch.
2. `dep build:artifact` lokal: Archiv ohne `.git`, `node_modules`,
   Dev-Pakete; Symlinks relativ; `public/_assets/vite/` enthalten.
3. Erster Deploy auf Staging: HTTP 200 für `/de/`, `/en/`, `/typo3/`,
   Basic Auth aktiv, Kontext `Production/Staging` (Web und CLI).
4. Zweiter Deploy mit sichtbarer Änderung (z. B. Template-Text) → sofort
   sichtbar (OPcache).
5. `dep rollback staging` → vorheriger Stand sichtbar.
6. Deploy mit unsauberem Arbeitsbaum oder falschem Branch → Abbruch vor
   dem Upload.

### Edge Cases

- `shared/.env` oder `shared/config/system/additional.php` fehlt → Abbruch
  mit Hinweis.
- Abbruch mitten im Deploy → Lock wird gelöst, erneuter Deploy.
- Großes `fileadmin` gehört nicht zum Deploy (einmalig per `rsync`,
  Migrationsplan).

# Delivery Steps

Vorlage `~/www/ps14-typo3`, Branch `feature/deployment`. Push und Merge
nach `main` nur auf deine Anweisung.

### Task 1: `.env` und `update-system.sh`

- `ddev composer require helhum/dotenv-connector` (nach Rückfrage).
- `.env.dist`, `.env.ddev`, `.gitignore`, DDEV-Hook, `web_environment`,
  `bin/update-system.sh`, `create-system.sh`.
- Szenario 1.
- Commit: `feat: load environment configuration from .env`.

### Task 2: Deployer und Recipe

- `ddev composer require --dev deployer/deployer` (nach Rückfrage).
- `deploy/typo3.php`, `deploy.php` mit Beispiel-Hosts,
  `.htaccess-staging`, `.htaccess-production`.
- Szenario 2, Fixes als eigene Commits.
- Commit: `feat: add deployer recipe for artifact deployments`.

### Task 3: Doku

- `README.md`, `CLAUDE.md`, Skill-Hinweise.
- Commit: `docs: describe deployment and environment files`.

### Task 4: KIST übernehmen

- `main` nach `kist-escherich` mergen (nach Squash-Merge von
  `feature/deployment`), `.env` lokal prüfen, KIST-Hosts in `deploy.php`.
- Commit: `chore: configure deployment hosts for kist-escherich`.

### Task 5: KIST Staging

- Server vorbereiten (mit dir): Docroot, DB, `shared/.env`,
  `shared/config/system/additional.php`, `shared/.htpasswd`.
- Szenarien 3–6 auf `staging-v14`, Ergebnis im Status.

# Entscheidungen

Geklärt am 2026-11-20:

1. Gleicher Host wie das Altprojekt, neue Verzeichnisse `staging-v14` und
   `production-v14`.
2. Docroot frei setzbar → `<pfad>/current/public`.
3. Hosts und Projekt-Besonderheiten in `deploy.php`.
4. OPcache über TYPO3-Befehle (`cache:flush`); Wirkung auf PHP-FPM wird im
   Test geprüft.
5. Übernahmen aus `typo3_stadt_unterschleissheim_2026`: Hetzner-Details,
   `recipe/common.php` mit eigenem `deploy:update_code`, `.htaccess` per
   Kopie, `deploy:failed` → `unlock`, Shared-Verzeichnisse, `log_files`,
   `bin/update-system.sh`.
6. `keep_releases = 3`.
7. `.env` mit `helhum/dotenv-connector`, auch in der Vorlage.
8. `bin/update-system.sh` führt beim Deploy auch `upgrade:run` aus.

Noch zu bestätigen:

9. (bestätigt) `CLAUDE.md` verbietet bisher Commits von `.env*`. Neu: `.env` und
   `.env.*.local` nie committen, die Vorlagen `.env.dist` und `.env.ddev`
   (ohne Secrets) dagegen schon.

# Status

- [x] Offene Punkte geklärt (SSH `kistae`/Port 222, CLI `PHPVERSION=8.4`, DB `staging_v14`, Domain `staging-v14.kist-escherich.com`, Basic Auth Benutzer `kist`)
- [x] Task 1 – `.env` und `update-system.sh` (Szenario 1 lokal OK: Kontext `Development` aus `.env` in Web und CLI, `update-system.sh` läuft durch)
- [x] Task 2 – Deployer und Recipe (`22a9be8`, Fix `var/` im Artefakt)
  - Szenario 2 lokal OK: Archiv 28 MB, ohne `.git`, `node_modules`,
    `.ddev`, `docs`, `sql`, `var`, Dev-Pakete; Symlinks relativ und intakt;
    `public/_assets/vite/` enthalten.
  - Szenario 6 lokal OK: falscher Branch und Änderungen im Arbeitsbaum
    brechen in `build:check` ab.
  - Abweichung vom Entwurf: `.htpasswd` liegt in `shared/` außerhalb des
    Docroots (nur geprüft über `check_files`, nicht verlinkt);
    `.htaccess-production` erzwingt HTTPS. `deploy.php` und `deploy/` sind
    im PHP-CS-Fixer-Finder.
- [x] Task 3 – Doku
- [x] Task 4 – KIST übernehmen (Merge `e883a5f`, Hosts `5c1a153`,
  SSH-Host `b318376`, Staging-Domain `3ca5a17`)
- [x] Task 5 – KIST Staging (Stand Release 11, 2026-11-22)
  - Szenario 3 OK: `/de/`, `/en/`, `/typo3/` HTTP 200, Basic Auth aktiv,
    Kontext `Production/Staging` in Web und CLI.
  - Szenario 4 OK: geänderte Testmarkierung im Footer sofort sichtbar
    (Release 10).
  - Szenario 5 OK: `dep rollback staging` → vorheriger Stand sofort
    sichtbar (Release 9).
  - Fix PHP-Version: Webserver-Default älter als 8.4 → `FcgidWrapper` in
    `.htaccess-staging`/`-production` des Kunden-Branches; in der Vorlage
    nur als Kommentar.
  - Fix Basic Auth: nur über HTTPS abgefragt, `http://` leitet direkt mit
    301 weiter (Vorlage `3a46064`).
  - OPcache: Release 8 zeigte noch alten Code (PHP-Prozess im alten
    Release); danach `opcache.revalidate_path` per `.htaccess` ergänzt
    (KIST `3f59c0c`). Ab Release 9 OK; ob der Block unter mod_fcgid
    greift oder der Prozess neu gestartet wurde, ist nicht eindeutig.
  - `fileadmin` per `rsync` nach `shared/public/fileadmin` (2.121 Dateien).
  - Vorlage: OPcache-Block in `.htaccess-staging`/`-production` nur als
    Kommentar (`ef0f57a`); KIST hat ihn aktiv, auch in
    `.htaccess-production` (`1d1864c`), ebenso `FcgidWrapper` (`0e066da`).
- Plan abgeschlossen am 2026-11-22. Offen außerhalb des Plans: erster
  Deploy auf production (eigene Freigabe; `FcgidWrapper` und
  OPcache-Block dort noch ungetestet).
