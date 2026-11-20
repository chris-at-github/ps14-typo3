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
build/     Build-Skripte (Iconfont, Lock-Prüfung)
config/    TYPO3-Systemkonfiguration (settings.php, additional.php)
docs/      Projektdokumentation (Pläne & Specs)
packages/  ps14_site (versioniert) und lokal geklonte gemeinsame Pakete – sonst gitignored
public/    Docroot (index.php, .htaccess, fileadmin, typo3)
sql/       SQL-Dateien
temp/      Ablage für Sicherungen, Vorlagen und Zwischenstände – gitignored, von ESLint ignoriert
var/       Laufzeit-Artefakte (Caches, Logs) – gitignored
vendor/    Composer-Abhängigkeiten – gitignored
```
