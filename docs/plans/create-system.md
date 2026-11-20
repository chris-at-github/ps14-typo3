# Requirements

### Überblick & Ziel

Ein neues Kundenprojekt entsteht auf Basis der Vorlage (`main` von
`ps14-typo3`) mit einem Aufruf: Ein Skill fragt die Projektdaten ab und
steuert das Skript `bin/create-system.sh`. Das Skript erledigt alle
mechanischen Schritte (Clone, Umbenennen, Installation, Build, Datenbank).
Der Skill übernimmt Abfrage, Bestätigung, Commit und Bericht. Ergebnis ist ein
lauffähiges DDEV-Projekt auf einem eigenen Kunden-Branch.

### Scope

**In Scope**
- `bin/create-system.sh` (Bash, läuft auf dem Host, nicht interaktiv).
- Skill `creating-typo3-projects` (`.claude/skills/creating-typo3-projects/`).
- Abfrage: Projektverzeichnis/DDEV-Name, Kunden-Branch, Kundenname
  (`websiteTitle`), Live-URL, Staging-URL, Datenquelle.
- Clone, Kunden-Branch, DDEV-Name, Hostnamen, Site-Konfiguration, neuer
  `encryptionKey`.
- Installation (`composer install`, `npm ci`), Iconfont, erster Vite-Build.
- Import der Datenbank und von `fileadmin` aus der Vorlage,
  `.htaccess`-Symlink, TYPO3-Setup.
- Prüfung (HTTP, Lint) und erster Commit auf dem Kunden-Branch.
- Vorbereitetes, leeres SQL-Skript `sql/post-import.sql`, das nach dem
  DB-Import ausgeführt wird, sobald es Anweisungen enthält.
- MCP: eigener API-Key pro Projekt, Registrierung von `in2mcp` (lokal).
- Doku: `README.md`, `CLAUDE.md` (erlaubte Befehle).

**Out of Scope**
- Deployment (Schritt 3, eigener Plan).
- Echte Kundendaten (Inhalte kommen später per MCP oder Import).
- Update bestehender Projekte (Skill `updating-typo3-projects`). Ein
  Gegenstück `bin/update-system.sh` entsteht erst, falls es bei der echten
  Migration gebraucht wird.
- GitHub-Aktionen (Push des Kunden-Branchs übernimmst du).

### User Story

- Als Entwickler möchte ich ein neues Kundenprojekt mit wenigen Angaben
  anlegen und ein lauffähiges, gebautes Projekt mit Testdaten erhalten,
  damit jedes Projekt gleich aufgesetzt ist und ich keine Schritte vergesse.

### Akzeptanzkriterien

- Der Skill fragt alle Daten ab, zeigt eine Zusammenfassung und startet das
  Skript erst nach Bestätigung.
- Das Skript bricht ab, wenn das Zielverzeichnis oder der DDEV-Name bereits
  existiert; es verändert die Vorlage nicht.
- Nach dem Lauf:
  - Kunden-Branch ausgecheckt, `origin` zeigt auf GitHub (`ps14-typo3.git`).
  - Keine Treffer für `ps14-typo3.ddev.site`, `vite.ps14-typo3` und
    `dev.ps14.de` in DDEV-, Site- und README-Dateien.
  - `encryptionKey` unterscheidet sich von der Vorlage.
  - `/de/`, `/en/`, `/typo3/` antworten mit HTTP 200; Assets aus dem
    Vite-Build (`public/_assets/vite/`) sind vorhanden.
  - `ddev exec npm run lint` ohne Befund.
  - Ein Commit `chore: configure project <name>` auf dem Kunden-Branch.
- Einzelne Schritte lassen sich nach einem Fehler erneut ausführen
  (`--from <schritt>`).
- Die Ausgabe des Skripts ist knapp (eine Zeile pro Schritt, Details im Log).

# Technical Design

### Aktueller Zustand

Manuell für `kist-escherich-com-v14` durchgeführt (2026-11-19/20):

| Schritt | Dateien / Befehle |
|---|---|
| Clone, Kunden-Branch | `git clone`, `git switch -c kist-escherich` |
| DDEV-Name | `.ddev/config.yaml` `name:` |
| Hostnamen | `.ddev/config.vite.yaml`, `.ddev/apache/vite.conf`, `.ddev/nginx_full/vite.conf`, `README.md`, `config/sites/ps14/config.yaml` |
| Site-Konfiguration | `websiteTitle`, `baseVariants` (Development, `Production/Staging`, `Production`), `robots.txt`-Sitemaps |
| Installation | `ddev start`, `ddev composer install`, `ddev npm install`, `ddev exec node build/build-iconfont.js` |
| Daten | `ddev export-db` (Vorlage) → `ddev import-db`, `fileadmin` kopiert, `public/.htaccess` → `htaccess/.htaccess-ddev` |
| TYPO3 | `ddev typo3 extension:setup`, `cache:flush` |

Weitere Fakten:
- `config/system/settings.php` ist versioniert und enthält den
  `encryptionKey` der Vorlage (auch `kist-escherich-com-v14` nutzt ihn noch).
- `ddev vite build` schreibt nach `public/_assets/vite/` (gitignored).
- Der GitHub-Token für Composer liegt global in
  `~/.ddev/homeadditions/.composer/auth.json` und gilt für alle Projekte.
- `in2mcp` ist in deiner lokalen Claude-Konfiguration nur für
  `~/www/ps14-typo3` eingetragen (HTTP, Header `Api-Key`).

### Key Decisions

- **Arbeitsteilung:** Das Skript ist nicht interaktiv und bekommt alle Werte
  als Optionen — so bleibt es testbar und spart Tokens. Abfrage,
  Bestätigung, Lint-Fixes, Commit und Bericht macht der Skill.
- **Clone aus der lokalen Vorlage** (`git clone ~/www/ps14-typo3`), danach
  `origin` auf `git@github.com:chris-at-github/ps14-typo3.git`. Schnell,
  ohne SSH/Token; Voraussetzung: `main` der Vorlage ist sauber und aktuell.
- **Identifier `ps14` bleibt** (wie bei KIST), damit spätere
  `git merge main` keine Rename-Konflikte erzeugen.
- **Neuer `encryptionKey`** pro Projekt (`openssl rand -hex 48`), da er
  versioniert ist und sonst in allen Projekten gleich wäre.
- **Datenquelle:** immer ein frischer `ddev export-db` der laufenden
  Vorlage nach `<projekt>/sql/template-<yymmdd>.sql.gz`. `fileadmin` wird
  per `rsync` kopiert.
- **Nachlaufendes SQL:** `sql/post-import.sql` (versioniert per Ausnahme in
  `sql/.gitignore`) wird nach dem Import mit `ddev mysql` ausgeführt, wenn es
  mehr als Kommentare enthält. Zunächst leer. Gilt als Teil des
  Projekt-Setups (Ausnahme der MCP-Regel in `CLAUDE.md`).
- **`encryptionKey`:** Passwort-Hashes (Backend, Frontend, MCP-Keys) sind
  davon unabhängig — Logins bleiben gültig. Betroffen sind nur signierte
  Werte: bestehende Sessions, Formular-Tokens, offene Links zum
  Zurücksetzen von Passwörtern; einmal neu anmelden, Cache leeren.
- **Schritte** (einzeln wiederholbar mit `--from`):
  `clone` → `configure` → `start` → `install` → `build` → `data` → `setup`
  → `mcp` → `verify`.
- **Ausgabe:** `==> <schritt>` und `OK`/`FEHLER` je Schritt; komplette
  Ausgabe in `<projekt>/temp/create-system.log`. Bei Fehlern gibt das
  Skript die letzten Log-Zeilen aus und endet mit Exit-Code ≠ 0.
- **Kein Commit im Skript** — der Skill führt `ddev exec npm run lint` aus und
  committet nach den Regeln in `CLAUDE.md`.
- **MCP nur für die lokale DDEV-Umgebung, eigener Key pro Projekt:** Das
  Skript erzeugt im Schritt `mcp` mit `ddev typo3 in2mcp:apikey <uid>`
  (`--mcp-user`, Standard `1` = Admin der Vorlage) einen neuen Key und
  übergibt ihn direkt an `claude mcp add --transport http in2mcp
  https://<name>.ddev.site/typo3/mcp --header "Api-Key: …" --scope local`
  (im Projektverzeichnis). Der Key wird weder ausgegeben noch geloggt und
  gelangt so auch nicht in Claudes Kontext. Der Key der Vorlage bleibt
  unberührt; in2mcp speichert nur einen Hash.
  `~/.claude.json` wird nur über `claude mcp add|remove` verändert, nie direkt
  bearbeitet, nie versioniert oder deployt. Staging/Produktion werden nicht
  registriert (Regel in `CLAUDE.md`, Abschnitt „Content & Pages“).
- **Projekt entfernen** (z. B. Test-Projekt): zuerst im Projektverzeichnis
  `claude mcp remove in2mcp --scope local`, dann `ddev delete -O` und das
  Verzeichnis löschen.

### Proposed Changes

**Aufruf:**

```bash
bin/create-system.sh \
    --dir ~/www/kist-escherich-com-v14 \
    --name kist-escherich-com-v14 \
    --branch kist-escherich \
    --title 'KIST + ESCHERICH' \
    --live-url https://www.kist-escherich.com/ \
    --staging-url https://staging.kist-escherich.com/ \
    [--mcp-user 1] \
    [--from install]
```

- Validierung: `--name`/`--branch` nur `[a-z0-9-]`, URLs mit `https://` und
  abschließendem `/`; `--staging-url` optional (ohne → keine Staging-Variante).
- Vorlage = Verzeichnis des Skripts (`$(dirname "$0")/..`).

**Schritte im Skript:**

| Schritt | Aktionen |
|---|---|
| `clone` | Abbruch, wenn `--dir` existiert oder `ddev list` den Namen kennt; `git clone`, `origin` umsetzen, `git switch -c <branch>`, `mkdir temp` |
| `configure` | `name:` in `.ddev/config.yaml`; `ps14-typo3` → `<name>` in DDEV-Dateien und `README.md`; Site-Konfiguration (`websiteTitle`, `baseVariants`, Sitemaps); neuer `encryptionKey`, `sitename` = Titel |
| `start` | `ddev start` |
| `install` | `ddev composer install`, `ddev npm ci` |
| `build` | `ddev exec node build/build-iconfont.js`, `ddev vite build` |
| `data` | `ddev export-db` der Vorlage, `ddev import-db`, `sql/post-import.sql` (falls nicht leer), `rsync` von `fileadmin`, `.htaccess`-Symlink |
| `setup` | `ddev typo3 extension:setup`, `ddev typo3 upgrade:list`, `ddev typo3 cache:flush` |
| `mcp` | `ddev typo3 in2mcp:apikey <uid>` → `claude mcp add … --scope local` (Key ohne Ausgabe) |
| `verify` | HTTP-Status für `/de/`, `/en/`, `/typo3/`; Rest-Treffer der alten Hostnamen; Ausgabe der URLs |

**Skill `creating-typo3-projects`:**
1. Daten abfragen (Vorschläge ableiten: Name aus Live-Domain,
   z. B. `www.kist-escherich.com` → `kist-escherich-com-v14`, Branch
   `kist-escherich`).
2. Zusammenfassung zeigen, Bestätigung einholen.
3. Vorlage prüfen (`main` ausgecheckt, sauber, DDEV läuft).
4. Skript ausführen; bei Fehlern Log lesen, Ursache beheben, mit `--from`
   fortsetzen.
5. `ddev exec npm run lint`, Commit `chore: configure project <name>`.
6. Ergebnis und offene Punkte berichten (URLs, MCP aktiv nach Neustart von
   Claude im Projektverzeichnis, Push durch dich).

### File Structure

| Datei | Änderung |
|---|---|
| `bin/create-system.sh` (neu) | Installationsskript |
| `.claude/skills/creating-typo3-projects/SKILL.md` (neu) | Skill |
| `sql/post-import.sql` (neu), `sql/.gitignore` | leeres SQL-Skript, Ausnahme im Ignore |
| `CLAUDE.md` | `bin/create-system.sh` (und später `bin/update-system.sh`) als erlaubte Befehle |
| `README.md` | Abschnitt „Neues Projekt anlegen“ |
| `.editorconfig` | prüfen, ob `*.sh` abgedeckt ist |

### Risks

- **Vorlage nicht aktuell/sauber** → falscher Stand im Projekt. Skill prüft
  vorher `git status` und Branch der Vorlage.
- **`npm ci` und Install-Skripte** (esbuild, @parcel/watcher werden bei
  `npm install` übersprungen) → im Test prüfen, ob der Vite-Build trotzdem
  läuft.
- **Zwei DDEV-Projekte gleichzeitig** brauchen Ressourcen; die Vorlage muss
  für den DB-Export laufen.
- **Hostname-Ersetzung** per `sed` kann zu viel treffen → nur in der festen
  Dateiliste ersetzen und in `verify` prüfen.

# Testing

### Validierungsansatz

Ein Wegwerf-Projekt mit dem Skript anlegen und vollständig prüfen, danach
nach deiner Freigabe entfernen (`ddev delete -O`, Verzeichnis löschen).

### Kernszenarien

1. Vollständiger Lauf mit Test-Werten (z. B. `--name ps14-test-v14`,
   `--branch test`) → alle Akzeptanzkriterien erfüllt.
2. Erneuter Aufruf mit demselben `--dir` → Abbruch ohne Änderungen.
3. Fehler simulieren (z. B. DDEV gestoppt) → `--from <schritt>` setzt fort.
4. Ohne `--staging-url` → nur Development- und Production-Variante.

### Edge Cases

- Titel mit Sonderzeichen (`+`, `&`, `'`) → korrekt in YAML und HTML.
- Vorlage nicht gestartet → Abbruch im Schritt `data` mit Hinweis.
- `sql/post-import.sql` nur mit Kommentaren → wird übersprungen.
- Test-Projekt entfernen: `claude mcp remove in2mcp --scope local`,
  `ddev delete -O`, Verzeichnis löschen.

# Delivery Steps

Vorlage `~/www/ps14-typo3`, Branch `feature/create-system`. Push und Merge
nach `main` nur auf deine Anweisung.

### Task 1: Skript

- `bin/create-system.sh` gemäß Proposed Changes, `chmod +x`.
- Commit: `feat: add script to create a project from the template`.

### Task 2: Test

- Szenarien 1–4 mit einem Wegwerf-Projekt, Ergebnis im Status.
- Fixes als eigene Commits.

### Task 3: Skill

- `.claude/skills/creating-typo3-projects/SKILL.md`.
- Commit: `docs: add skill for creating projects from the template`.

### Task 4: Doku

- `README.md`, `CLAUDE.md`.
- Commit: `docs: describe project creation`.

### Task 5: KIST nachziehen

- Auf `kist-escherich` (`~/www/kist-escherich-com-v14`): neuer
  `encryptionKey`, Commit `chore: use a project-specific encryption key`.
- `config/system/additional.ddev.php` nach `additional.php` kopieren
  (MCP-Server lokal aktiv, kommt per `git merge main`).

# Entscheidungen

Geklärt am 2026-11-20:

1. `bin/create-system.sh` wird erlaubter Befehl; `bin/update-system.sh`
   folgt nur bei Bedarf.
2. Daten immer frisch aus der laufenden Vorlage, dazu ein vorbereitetes,
   leeres `sql/post-import.sql`.
3. MCP nur lokal, eigener Key pro Projekt; Staging/Produktion nur auf
   ausdrückliche Anweisung (Regel in `CLAUDE.md`).
4. Neuer `encryptionKey` pro Projekt, auch für KIST (Task 5).
5. Test-Projekt `~/www/ps14-test-v14`, nach dem Test entfernen.
6. MCP-Server lokal über die versionierte Vorlage
   `config/system/additional.ddev.php` (DDEV-Datei ohne Markierung plus
   in2mcp-Block); `configure` kopiert sie vor `ddev start` nach
   `additional.php`. Die Datei darf den String der DDEV-Markierung nicht
   enthalten, sonst überschreibt DDEV sie.

# Status

- [x] Task 1 – Skript (inkl. `sql/post-import.sql`; `configure` trocken getestet)
- [x] Task 2 – Test (Projekt `ps14-test-v14`, Branch `test`)
  - Szenario 1: alle Akzeptanzkriterien erfüllt (HTTP 200 für `/de/`,
    `/en/`, `/typo3/`; Vite-Assets; keine alten Hostnamen; neuer
    `encryptionKey`; Lint ohne Befund; in2mcp verbunden; Key nicht im Log).
    Titel `Test + Co & O'Brien` korrekt in YAML und PHP.
  - Szenario 2: vorhandenes Verzeichnis bzw. DDEV-Name → Abbruch ohne
    Änderung.
  - Szenario 3: Fortsetzen mit `--from start`, `--from configure` und
    `--from setup` funktioniert.
  - Szenario 4: ohne `--staging-url` nur Development und Production
    (Trockenlauf von `configure`).
  - Fixes: `d229c7b` (DDEV-Name über `ddev list`, fehlendes
    `post-import.sql`, wiederholbares `sitename`), `7c1c03e` (MCP lokal).
  - Offen: Ein Lauf ab `clone` nutzt `additional.ddev.php` und
    `post-import.sql` erst nach dem Merge in `main`; im Test wurde die
    Datei manuell kopiert.
- [x] Task 3 – Skill
- [x] Task 4 – Doku
- [ ] Task 5 – KIST nachziehen
