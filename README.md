# PS14 TYPO3
https://ps14-typo3.ddev.site/typo3

## Schnellstart

```bash
# Projekt starten (Container hochfahren)
ddev start

# PHP-Abhängigkeiten installieren (GitHub-Token, siehe „Gemeinsame Pakete“)
ddev composer install

# TYPO3-Extensions einrichten und Cache leeren
ddev typo3-extension-setup

# Projekt im Browser öffnen
ddev launch
```

Anschließend ist das Backend unter https://ps14-typo3.ddev.site/typo3 erreichbar.
`ddev start` legt `.env` aus `.env.ddev` an, falls sie fehlt (siehe
„Umgebung“).

## Neues Projekt anlegen

Ein Kundenprojekt entsteht als eigener Clone der Vorlage auf einem
Kunden-Branch. Am einfachsten über den Claude-Skill
`creating-typo3-projects`: Er fragt die Daten ab und führt das Skript aus.
Direkt in der Vorlage (`main` ausgecheckt, ohne Änderungen, DDEV läuft):

```bash
bin/create-system.sh \
    --dir ~/www/kist-escherich-com-v14 \
    --name kist-escherich-com-v14 \
    --branch kist-escherich \
    --title 'KIST + ESCHERICH' \
    --live-url https://www.kist-escherich.com/ \
    --staging-url https://staging.kist-escherich.com/
```

Das Skript klont `main`, legt den Kunden-Branch an und setzt DDEV-Namen,
Hostnamen, Site-Konfiguration und einen neuen `encryptionKey`. Danach
installiert und baut es das Projekt, übernimmt Datenbank und `fileadmin`
der Vorlage, registriert den MCP-Server lokal und prüft das Ergebnis.

- Optionen: `--staging-url` (ohne → keine Staging-Variante), `--mcp-user`
  (Backend-Benutzer für den MCP-Key, Standard `1`), `--from <schritt>`
  (nach einem Fehler fortsetzen).
- Schritte: `clone`, `configure`, `start`, `install`, `build`, `data`,
  `setup`, `mcp`, `verify`.
- Log: `<projekt>/temp/create-system.log`.
- SQL nach dem Import: `sql/post-import.sql` (übersprungen, solange nur
  Kommentare enthalten sind).
- Lokale Einstellungen inkl. MCP-Server: Vorlage
  `config/system/additional.ddev.php`, wird nach `additional.php` kopiert.

Anschließend `ddev exec npm run lint` ausführen und die Änderungen als
`chore: configure project <name>` committen.

## Umgebung (`.env`)

Umgebungsspezifische Werte stehen in `.env` im Projektverzeichnis.
`helhum/dotenv-connector` lädt sie vor dem Start von TYPO3; echte
Umgebungsvariablen haben Vorrang. Nutzbar in der Site-Konfiguration
(`%env(NAME)%`) und in TypoScript (`getEnv()`).

| Datei | Zweck |
|---|---|
| `.env` | Aktive Werte, gitignored – nie committen |
| `.env.ddev` | Lokale Vorlage (versioniert), wird beim `ddev start` nach `.env` kopiert, falls diese fehlt |
| `.env.dist` | Vorlage für Staging/Produktion (versioniert), auf dem Server als `shared/.env` |

Derzeit enthält `.env` nur `TYPO3_CONTEXT` (lokal `Development`, Staging
`Production/Staging`, Produktion `Production`). Neue Variablen in beiden
Vorlagen ergänzen; keine Secrets in die Vorlagen.

## Deployment

Deployer läuft ausschließlich in DDEV. Auf dem Server sind weder Composer
noch Repo-Zugang nötig: Lokal wird aus dem committeten Stand ein Artefakt
gebaut (`vendor/` ohne Dev-Pakete, Iconfont, Vite-Build), hochgeladen und
als neues Release aktiviert.

```bash
ddev auth ssh                               # SSH-Schlüssel in DDEV laden
ddev exec vendor/bin/dep deploy staging     # Deploy auf Staging
ddev exec vendor/bin/dep rollback staging   # Vorheriges Release aktivieren
ddev exec vendor/bin/dep build:artifact staging  # Nur das Artefakt bauen (temp/deploy/package.tgz)
```

- Hosts und Projekt-Besonderheiten: `deploy.php` (pro Kunden-Branch;
  in `main` nur Beispiele). Allgemeine Tasks: `deploy/typo3.php`.
- Der Deploy bricht ab, wenn nicht der Branch des Hosts ausgecheckt ist
  oder der Arbeitsbaum Änderungen enthält.
- Ablauf auf dem Server: Release anlegen, Artefakt entpacken,
  `public/htaccess/.htaccess-<stage>` nach `public/.htaccess` kopieren,
  Shared-Dateien verlinken, `bin/update-system.sh` (`extension:setup`,
  `upgrade:run`, `cache:flush`, `cache:warmup`), `current` umschalten.
  Es bleiben 3 Releases.
- Struktur: `<deploy_path>/releases/`, `shared/`, `current` → Docroot der
  Domain ist `<deploy_path>/current/public`.
- Vor dem ersten Deploy in `<deploy_path>/shared/` anlegen:
  - `.env` (aus `.env.dist`),
  - `config/system/additional.php` (DB-Zugang),
  - `.htpasswd` (nur Staging, Basic Auth).
- Gemeinsam über Releases: `public/fileadmin`, `public/typo3temp/assets`,
  `var/log`, `var/session`, `var/lock`.
- Hetzner-Webhosting: SSH-Port `222`, PHP-Version der CLI über
  `PHPVERSION` (in `deploy.php`).

## Wichtige Befehle

### DDEV-Umgebung

```bash
ddev start            # Container starten
ddev stop             # Container stoppen
ddev restart          # Container neu starten
ddev describe         # Status, URLs und Zugangsdaten anzeigen
ddev launch           # Projekt-URL im Browser öffnen
ddev ssh              # Shell im Web-Container öffnen
ddev logs -f          # Logs live verfolgen
ddev poweroff         # Alle DDEV-Projekte herunterfahren
```

### Composer

```bash
ddev composer install                 # Abhängigkeiten installieren
ddev composer update                  # Abhängigkeiten aktualisieren
ddev composer require <paket>         # Paket hinzufügen
ddev composer remove <paket>          # Paket entfernen
```

### Gemeinsame Pakete

`ps14_foundation`, `ps14_component`, `ps14_container` und `ps14_menu` werden
als getaggte Releases (`14.x.x`, Major = TYPO3-Version) aus GitHub installiert
(`vendor/ps14/`). `ps14_site` ist Teil dieses Repos und wird als Path-Paket
aus `packages/ps14_site` eingebunden (Version `14.x-dev`).

`main` enthält die Vorlage. Jedes Kundenprojekt liegt auf einem langlebigen
Kunden-Branch (z. B. `kist-escherich`), der Änderungen per `git merge main`
übernimmt.

Voraussetzung ist ein GitHub-Token (Fine-grained, nur die Paket-Repos,
Contents read-only) in `~/.ddev/homeadditions/.composer/auth.json`, danach
`ddev restart`:

```json
{
    "github-oauth": {
        "github.com": "github_pat_…"
    }
}
```

```bash
ddev composer update 'ps14/*'         # Neueste 14.x-Releases übernehmen
```

**Paket lokal entwickeln:** Liegt ein Paket unter `packages/`, bindet Composer
es als Symlink (`14.x-dev`) statt des Releases ein.

```bash
git clone git@github.com:chris-at-github/ps14-foundation.git packages/ps14_foundation
ddev composer update ps14/ps14_foundation   # lokales Paket einbinden
# … entwickeln, im Paket-Repo committen, mergen, taggen, pushen …
rm -rf packages/ps14_foundation
ddev composer update 'ps14/*'               # zurück auf das Release
```

Eine `composer.lock`, die ein gemeinsames Paket aus `packages/` einbindet,
darf nicht committet werden — `npm run lint` (`lint:composer-lock`) bricht
dann ab.

### TYPO3 (CLI)

```bash
ddev typo3 --version                  # Installierte TYPO3-Version anzeigen
ddev typo3 cache:flush                # Cache leeren
ddev typo3 extension:setup            # Extensions einrichten
ddev typo3 setup --help               # Optionen des Setup-Befehls anzeigen
ddev typo3-extension-setup            # Custom-Command: extension:setup + cache:flush
ddev exec bin/update-system.sh        # extension:setup, upgrade:run, cache:flush, cache:warmup
```

### Frontend (Vite)

```bash
ddev npm install                      # Node-Abhängigkeiten installieren
ddev vite                             # Vite-Dev-Server starten (https://vite.ps14-typo3.ddev.site)
ddev vite build                       # Frontend-Assets für Produktion bauen
ddev exec npm run lint                # Alle Linter ausführen
ddev exec npm run lint:fix            # Linter-Findings automatisch fixen
```

Der Dev-Server läuft im Web-Container und wird über DDEV unter `https://vite.ps14-typo3.ddev.site` bereitgestellt. Mit `Strg+C` beenden.

### Datenbank

```bash
ddev mysql                            # MySQL-Client im Container öffnen
ddev export-db --file=dump.sql.gz     # Datenbank exportieren
ddev import-db --file=dump.sql.gz     # Datenbank importieren
```

## Verzeichnisstruktur
```
bin/       Skripte (create-system.sh auf dem Host, update-system.sh in DDEV/auf dem Server)
build/     Build-Skripte (Iconfont, Lock-Prüfung)
config/    TYPO3-Systemkonfiguration (settings.php, additional.php, additional.ddev.php)
deploy/    Deployer-Recipe (typo3.php); Hosts in deploy.php
docs/      Projektdokumentation (Pläne & Specs)
packages/  ps14_site (versioniert) und lokal geklonte gemeinsame Pakete – sonst gitignored
public/    Docroot (index.php, .htaccess, fileadmin, typo3)
sql/       SQL-Dumps (gitignored) und post-import.sql
temp/      Ablage für Sicherungen, Vorlagen und Zwischenstände – gitignored, von ESLint ignoriert
var/       Laufzeit-Artefakte (Caches, Logs) – gitignored
vendor/    Composer-Abhängigkeiten – gitignored
```
