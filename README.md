# PS14 TYPO3

TYPO3 v14 LTS Base-Distribution, Composer-basiert, lauffähig in einer [DDEV](https://ddev.com/)-Umgebung.

## Tech-Stack

| Komponente     | Version / Wert        |
|----------------|-----------------------|
| TYPO3          | v14 LTS (`^14.3`)     |
| PHP            | 8.4                   |
| Webserver      | Apache-fpm            |
| Datenbank      | MariaDB 11.8          |
| Composer       | 2                     |
| DDEV-Projekt   | `ps14-typo3`          |
| Docroot        | `public`              |
| Backend-URL    | https://ps14-typo3.ddev.site/typo3 |

## Voraussetzungen

- [DDEV](https://ddev.com/get-started/) (inkl. Docker) ist installiert.

## Schnellstart

```bash
# Projekt starten (Container hochfahren)
ddev start

# PHP-Abhängigkeiten installieren
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

### TYPO3 (CLI)

```bash
ddev typo3 --version                  # Installierte TYPO3-Version anzeigen
ddev typo3 cache:flush                # Cache leeren
ddev typo3 extension:setup            # Extensions einrichten
ddev typo3 setup --help               # Optionen des Setup-Befehls anzeigen
ddev typo3-extension-setup            # Custom-Command: extension:setup + cache:flush
```

### Datenbank

```bash
ddev mysql                            # MySQL-Client im Container öffnen
ddev export-db --file=dump.sql.gz     # Datenbank exportieren
ddev import-db --file=dump.sql.gz     # Datenbank importieren
```

## Erstinstallation (von Grund auf)

Nur nötig, wenn das Projekt neu aufgesetzt wird:

```bash
# TYPO3 v14 Base-Distribution installieren
ddev composer create "typo3/cms-base-distribution:^14"

# TYPO3 nicht-interaktiv einrichten (DB + Admin-User)
ddev typo3 setup --no-interaction \
  --driver=mysqli \
  --host=db \
  --port=3306 \
  --dbname=db \
  --username=db \
  --password=db \
  --admin-username="admin" \
  --admin-user-password="<passwort>" \
  --admin-email="admin@example.com" \
  --project-name="PS14 TYPO3"
```

## Konfiguration & Secrets

- `config/system/settings.php` wird versioniert und enthält **keine** sensiblen Daten.
- Umgebungsspezifische Secrets (DB-Verbindung, `encryptionKey`, `installToolPassword`)
  liegen in `config/system/additional.php` und sind **gitignored**.

## Verzeichnisstruktur

```
config/    TYPO3-Systemkonfiguration (settings.php, additional.php)
docs/      Projektdokumentation (Pläne & Specs)
public/    Docroot (index.php, .htaccess, fileadmin, typo3)
sql/       SQL-Dateien
var/       Laufzeit-Artefakte (Caches, Logs) – gitignored
vendor/    Composer-Abhängigkeiten – gitignored
```

## Lizenz

Siehe [LICENSE](LICENSE) (GPL-2.0-or-later).
