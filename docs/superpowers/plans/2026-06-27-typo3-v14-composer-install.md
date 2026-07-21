# TYPO3 v14 Composer-Installation – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine schlanke, lauffähige TYPO3 v14 LTS Backend-Installation in der DDEV-Umgebung `ps14-typo3`, Composer-basiert, mit ausgelagerten Secrets und sauberem Git-Commit.

**Architecture:** DDEV wird auf Projekttyp `typo3` und Webserver `apache-fpm` umgestellt. Die offizielle Base-Distribution wird per `ddev composer create` installiert, danach via `ddev typo3 setup` nicht-interaktiv eingerichtet (DB + Admin-User). Sensible Konfigurationswerte werden aus `config/system/settings.php` in das gitignorierte `config/system/additional.php` ausgelagert. Abschluss: ein Commit der Grundinstallation.

**Tech Stack:** TYPO3 v14 LTS, `typo3/cms-base-distribution`, Composer 2, DDEV v1.25, Apache-fpm, PHP 8.4, MariaDB 11.8, Node 24.

## Global Constraints

- Zielversion: **TYPO3 v14 LTS** (`typo3/cms-base-distribution:^14`).
- Webserver: **apache-fpm** (kein nginx). Rewrites über `public/.htaccess`.
- DDEV-Projekttyp: **typo3**. Docroot bleibt `public`. PHP 8.4, MariaDB 11.8 unverändert.
- DDEV-DB-Zugangsdaten (fix): Treiber `mysqli`, Host `db`, Port `3306`, DB `db`, User `db`, Passwort `db`.
- Admin-User (vorerst unsicher, später anzupassen): Benutzer `pschorr.christian@gmail.com`, E-Mail `pschorr.christian@gmail.com`, Passwort `Password1!`.
- Projektname: `PS14 TYPO3`.
- **Kein** Seitenbaum / **keine** Site-Konfiguration (`typo3 setup` ohne `--create-site`).
- Base-Distribution-Extensions bleiben **unverändert** (nichts hinzufügen/entfernen).
- Secrets gehören in `config/system/additional.php` (gitignored): DB-Verbindung, `installToolPassword`, `encryptionKey`. `config/system/settings.php` wird versioniert und enthält **keine** dieser Werte.
- `.ddev/` wird **mit** committet. `.idea/` und `.claude/` werden ignoriert.

---

### Task 1: DDEV auf TYPO3 + Apache umstellen

**Files:**
- Modify: `.ddev/config.yaml` (Zeilen `type:` und `webserver_type:`)

**Interfaces:**
- Consumes: nichts (Startpunkt).
- Produces: laufende DDEV-Container mit Typ `typo3` und Webserver `apache-fpm`; aktivierter `ddev typo3`-Befehl für Folge-Tasks.

- [ ] **Step 1: Projekttyp in `.ddev/config.yaml` ändern**

In `.ddev/config.yaml`:

```yaml
type: typo3
```

(ersetzt `type: php`)

- [ ] **Step 2: Webserver in `.ddev/config.yaml` ändern**

In `.ddev/config.yaml`:

```yaml
webserver_type: apache-fpm
```

(ersetzt `webserver_type: nginx-fpm`)

- [ ] **Step 3: DDEV neu starten**

Run: `ddev restart`
Expected: Endet mit „Successfully started ps14-typo3" / Projekt-URL wird angezeigt, keine Fehler.

- [ ] **Step 4: Umstellung verifizieren**

Run: `ddev describe | grep -Ei 'type|apache|web '`
Expected: Web-Service zeigt `apache-fpm` und Status `running` (nicht mehr `stopped`/`nginx-fpm`).

Run: `ddev typo3 --version` (nur zur Prüfung, dass der Wrapper existiert)
Expected: Fehlermeldung, dass `vendor/bin/typo3` noch nicht existiert — das ist okay (TYPO3 ist noch nicht installiert). Wichtig: Der Befehl `ddev typo3` wird erkannt (kein „unknown command").

- [ ] **Step 5: DDEV-Konfigurationsänderung committen**

```bash
git add .ddev/config.yaml
git commit -m "chore(ddev): Projekt auf typo3/apache-fpm umstellen

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: TYPO3 v14 Base-Distribution via Composer installieren

**Files:**
- Create: `composer.json`, `composer.lock` (durch Composer erzeugt)
- Create: `vendor/`, `public/index.php`, `public/.htaccess`, `public/typo3` (durch Composer erzeugt)

**Interfaces:**
- Consumes: laufende DDEV-Container (Task 1).
- Produces: lauffähiges TYPO3-Code-Skelett v14 inkl. `vendor/bin/typo3`; noch **keine** DB-Konfiguration und **kein** Admin-User.

- [ ] **Step 1: Base-Distribution installieren**

Run:

```bash
ddev composer create "typo3/cms-base-distribution:^14"
```

Expected: Composer lädt TYPO3 v14 inkl. System-Extensions, endet ohne Fehler. Bei Rückfrage zum Überschreiben/Leeren des Verzeichnisses mit „yes" bestätigen (bzw. `ddev composer create` erledigt das automatisch).

- [ ] **Step 2: Installierte TYPO3-Version verifizieren**

Run: `ddev typo3 --version`
Expected: Ausgabe enthält `TYPO3 CMS 14.` (Patch-Level beliebig).

- [ ] **Step 3: Erwartete Dateien prüfen**

Run: `ls -la public/index.php public/.htaccess vendor/bin/typo3`
Expected: Alle drei Pfade existieren (`public/index.php` ist ein Symlink in den `vendor`-Ordner, `public/.htaccess` eine reguläre Datei).

Hinweis: In diesem Task wird **nicht** committet — der Commit der Grundinstallation erfolgt gesammelt in Task 5.

---

### Task 3: TYPO3 nicht-interaktiv einrichten (DB + Admin-User)

**Files:**
- Create: `config/system/settings.php` (durch `typo3 setup` erzeugt)
- Modify: Datenbank `db` (Tabellen + Admin-User in `be_users`)

**Interfaces:**
- Consumes: TYPO3-Code-Skelett (Task 2).
- Produces: vollständig konfiguriertes System mit DB-Verbindung in `config/system/settings.php` und einem Admin-User; Backend unter `/typo3` erreichbar.

- [ ] **Step 1: Verfügbare Setup-Optionen prüfen**

Run: `ddev typo3 setup --help`
Expected: Liste der Optionen. Bestätige, dass diese (oder gleichbedeutende) Optionen existieren: `--driver`, `--host`, `--port`, `--dbname`, `--username`, `--password`, `--admin-username`, `--admin-user-password`, `--admin-email`, `--project-name`, `--no-interaction`. Falls ein Name abweicht, im nächsten Step entsprechend anpassen.

- [ ] **Step 2: Setup nicht-interaktiv ausführen**

Run:

```bash
ddev typo3 setup --no-interaction \
  --driver=mysqli \
  --host=db \
  --port=3306 \
  --dbname=db \
  --username=db \
  --password=db \
  --admin-username="pschorr.christian@gmail.com" \
  --admin-user-password="Password1!" \
  --admin-email="pschorr.christian@gmail.com" \
  --project-name="PS14 TYPO3"
```

Expected: Setup läuft durch, legt DB-Tabellen und Admin-User an, schreibt `config/system/settings.php`. Keine Fehlermeldung am Ende. (Es wird **kein** `--create-site` übergeben → es entsteht keine Site/Root-Seite.)

- [ ] **Step 3: Settings-Datei und DB-Verbindung verifizieren**

Run: `test -f config/system/settings.php && echo OK`
Expected: `OK`

Run: `grep -c "Connections" config/system/settings.php`
Expected: Wert ≥ `1` (DB-Verbindung wurde geschrieben — wird in Task 4 ausgelagert).

- [ ] **Step 4: Backend-Erreichbarkeit verifizieren**

Run: `curl -k -s -o /dev/null -w "%{http_code}\n" https://ps14-typo3.ddev.site/typo3`
Expected: HTTP-Code `200` oder `302` (Login-Seite des Backends antwortet).

- [ ] **Step 5: Backend-Login manuell prüfen**

Im Browser `https://ps14-typo3.ddev.site/typo3` öffnen und mit `pschorr.christian@gmail.com` / `Password1!` einloggen.
Expected: Login erfolgreich, leeres Backend (kein Seitenbaum).

Hinweis: Kein Commit in diesem Task.

---

### Task 4: Secrets nach `additional.php` auslagern

**Files:**
- Create: `config/system/additional.php`
- Modify: `config/system/settings.php` (Secret-Schlüssel entfernen)

**Interfaces:**
- Consumes: `config/system/settings.php` mit DB-Verbindung und SYS-Secrets (Task 3).
- Produces: `settings.php` ohne Secrets (versionierbar) + `additional.php` mit DB-Verbindung, `installToolPassword`, `encryptionKey` (gitignored). System bleibt voll funktionsfähig.

- [ ] **Step 1: Aktuelle Secret-Werte sichten**

Run: `cat config/system/settings.php`
Expected: Ein PHP-Array (`return [ ... ];`). Notiere die drei zu verschiebenden Blöcke:
- `'DB' => ['Connections' => ['Default' => [ ... ]]]`
- `'SYS' => [ ... 'encryptionKey' => '...' ... ]`
- `'SYS' => [ ... 'installToolPassword' => '...' ... ]`

- [ ] **Step 2: `additional.php` mit den Secrets anlegen**

Create `config/system/additional.php`. Die mit `<...>` markierten Werte **verbatim** aus `settings.php` übernehmen (das komplette `Default`-Array bzw. die exakten Hash-Strings):

```php
<?php

// Umgebungsspezifische Secrets – NICHT versioniert (siehe .gitignore).
// Überschreibt die in settings.php entfernten Werte zur Laufzeit.

$GLOBALS['TYPO3_CONF_VARS']['DB']['Connections']['Default'] = [
    // gesamtes 'Default'-Array aus settings.php hierher kopieren, z. B.:
    'charset' => 'utf8mb4',
    'driver' => 'mysqli',
    'host' => 'db',
    'port' => 3306,
    'dbname' => 'db',
    'user' => 'db',
    'password' => 'db',
    // ... weitere Schlüssel exakt wie in settings.php
];

$GLOBALS['TYPO3_CONF_VARS']['SYS']['encryptionKey'] = '<encryptionKey-aus-settings.php>';
$GLOBALS['TYPO3_CONF_VARS']['SYS']['installToolPassword'] = '<installToolPassword-Hash-aus-settings.php>';
```

- [ ] **Step 3: Secrets aus `settings.php` entfernen**

In `config/system/settings.php`:
- Den kompletten `'DB' => [ ... ]`-Block entfernen.
- Die Schlüssel `'encryptionKey'` und `'installToolPassword'` aus dem `'SYS' => [ ... ]`-Block entfernen (übrige SYS-Schlüssel und das `'SYS'`-Array selbst bleiben erhalten, sofern weitere Schlüssel vorhanden sind).

- [ ] **Step 4: `settings.php` ist secret-frei – verifizieren**

Run: `grep -E "encryptionKey|installToolPassword|'password'|Connections" config/system/settings.php; echo "exit=$?"`
Expected: Keine Treffer, Ausgabe endet mit `exit=1` (grep findet nichts → die Secrets sind raus).

- [ ] **Step 5: System lädt Konfiguration weiterhin – verifizieren**

Run: `ddev typo3 cache:flush`
Expected: Läuft fehlerfrei durch (beweist, dass `additional.php` korrekt geladen wird und die DB-Verbindung steht).

Run: `curl -k -s -o /dev/null -w "%{http_code}\n" https://ps14-typo3.ddev.site/typo3`
Expected: `200` oder `302` (Backend weiterhin erreichbar).

Hinweis: Kein Commit in diesem Task.

---

### Task 5: `.gitignore` finalisieren und Grundinstallation committen

**Files:**
- Create/Overwrite: `.gitignore`
- Commit: gesamte Grundinstallation

**Interfaces:**
- Consumes: fertige Installation (Tasks 1–4).
- Produces: sauberer Commit der Grundinstallation; gitignorierte Secrets/Artefakte.

- [ ] **Step 1: `.gitignore` mit Ziel-Inhalt schreiben**

Overwrite `.gitignore` (ersetzt eine evtl. von der Base-Distribution mitgelieferte Variante; `.ddev/` wird bewusst **nicht** ignoriert):

```gitignore
# Dependencies
/vendor/

# TYPO3 generierte Artefakte (Symlinks / Caches)
/public/index.php
/public/typo3/
/public/_assets/
/public/fileadmin/
/public/typo3temp/
/var/

# Umgebungsspezifische Secrets
/config/system/additional.php

# IDE / Tooling
/.idea/
/.claude/
```

- [ ] **Step 2: Staging prüfen**

Run: `git add -A && git status`
Expected:
- `.ddev/` ist **gestaged** (viele Dateien).
- `composer.json`, `composer.lock`, `config/system/settings.php`, `.gitignore`, `public/.htaccess` sind **gestaged**.
- `vendor/`, `config/system/additional.php`, `public/index.php`, `public/typo3`, `var/`, `.idea/`, `.claude/` sind **nicht** gestaged.

Falls `config/system/additional.php` oder `vendor/` doch in der Staging-Liste auftauchen: `.gitignore` aus Step 1 prüfen/korrigieren und `git rm --cached <pfad>` ausführen.

- [ ] **Step 3: Grundinstallation committen**

```bash
git commit -m "feat: TYPO3 v14 Composer-Grundinstallation (DDEV/Apache)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 4: Sauberen Zustand verifizieren**

Run: `git status`
Expected: `nothing to commit, working tree clean` (nur ignorierte Dateien sind untracked, werden aber nicht angezeigt).

Run: `git log --oneline`
Expected: Drei Commits — Spec (Task 0), `chore(ddev): ...` (Task 1), `feat: TYPO3 v14 ...` (Task 5).

- [ ] **Step 5: Abschluss-Verifikation der Erfolgskriterien**

Run: `ddev typo3 --version`
Expected: `TYPO3 CMS 14.x`.

Run: `test -f config/system/additional.php && git check-ignore config/system/additional.php`
Expected: Pfad existiert und wird von `git check-ignore` zurückgegeben (= ignoriert).

Run: `curl -k -s -o /dev/null -w "%{http_code}\n" https://ps14-typo3.ddev.site/typo3`
Expected: `200` oder `302`; Backend-Login mit `pschorr.christian@gmail.com` / `Password1!` weiterhin möglich.
