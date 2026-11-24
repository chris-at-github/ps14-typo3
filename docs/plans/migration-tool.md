# Requirements

### Überblick & Ziel

Kundenprojekte älterer TYPO3-Versionen (v10 bis v13) werden auf die Vorlage
(v14) migriert. Die Datenübernahme soll ohne manuelle Schritte und beliebig
oft wiederholbar laufen (Test, Probe-Migration, Go-Live). Dafür gibt es ein
eigenes Paket `ps14/ps14_migration`, eine TYPO3-Extension mit Shell-Einstieg.
Es wird nur für die Migration als Dev-Abhängigkeit installiert und danach
wieder entfernt. Erstes Projekt ist KIST + ESCHERICH (v12 → v14).

Auslöser (2026-11-23, KIST): Nach dem Import der v12-Datenbank scheitern alle
TYPO3-CLI-Befehle (`extension:setup`, `upgrade:*`). Sie melden vor dem
Schema-Update den Backend-User `_cli_` an, und `writeUC()` schreibt seit
TYPO3 14.2 (Feature #108832) in die noch fehlende Spalte
`be_users.user_settings`.

### Scope

**In Scope**
- Eigenes Repository `ps14-migration` (GitHub `chris-at-github`), Paket
  `ps14/ps14_migration`, Extension-Key `ps14_migration`, Tags wie bei den
  übrigen Paketen (siehe `package-versioning.md`).
- Shell-Einstieg `vendor/bin/ps14-migrate` (Composer `bin`), läuft auch, wenn
  TYPO3 noch nicht startet.
- SQL-Skripte vor dem ersten TYPO3-Befehl (`pre`) und nach den Wizards
  (`post`), generisch im Paket und projektspezifisch im Projekt.
- CLI-Befehl für das Schema-Update ohne `_cli_`-Anmeldung (nur `add`,
  `change`, `create_table`, `change_table`, wie `extension:setup`).
- Generische Upgrade-Wizards für ps14-Pakete (ps14_foundation 2.x,
  ps14_container 2.x), übernommen aus `ps14_site` von KIST.
- Ablauf: Dump/Dateien holen, Pre-SQL, Schema, Wizards (Core, Paket, Projekt),
  Post-SQL, Bereinigung nur der migrierten Altquellen, Cache, Prüfungen,
  Protokoll.
- Anbindung an DDEV-Provider (`ddev pull <provider>`) als Datenquelle.
- Doku: `README.md` des Pakets, Hinweis in `CLAUDE.md` (erlaubte Befehle),
  Skill `updating-typo3-projects`.

**Out of Scope (vorerst)**
- Zwischenversionen v11 bis v13 für Sprünge ab v10: Struktur wird
  vorgesehen (`Resources/Private/Steps/`), umgesetzt erst mit dem ersten
  konkreten v10/v11-Projekt.
- Migration von Inhalten der Fremd-Extensions (news, powermail usw.) und
  Elements → Content Blocks: eigene Wizards je Extension, kommen mit den
  jeweiligen Schritten.
- Ausführung auf Servern: Migration läuft lokal in DDEV, die fertige Datenbank
  wird anschließend übertragen.

### User Story

- Als Entwickler möchte ich ein Altprojekt mit einem Befehl aus der
  Produktionsdatenbank in den v14-Stand überführen und den Lauf jederzeit
  wiederholen können, ohne Handarbeit in Install Tool oder Datenbank.

### Akzeptanzkriterien

- `ddev composer require --dev ps14/ps14_migration` und
  `ddev exec vendor/bin/ps14-migrate` führen auf einem frisch importierten
  v12-Dump (KIST) alle Schritte ohne Eingriff aus; Abbruch beim ersten
  Fehler mit verständlicher Meldung.
- Danach laufen `extension:setup`, `upgrade:list` und das Frontend ohne
  Fehler; `upgrade:list` meldet keine offenen Wizards der Migration.
- Entfernt werden nur die Altquellen, die in diesem Lauf migriert wurden;
  alle übrigen Spalten und Tabellen bleiben erhalten.
- Nach `ddev composer remove ps14/ps14_migration` sind `composer.json` und
  `composer.lock` wie vorher; das Paket gelangt nie ins Deploy-Artefakt
  (`--no-dev`).
- Jeder Lauf schreibt ein Protokoll (Schritte, Wizard-Ausgaben, Hinweise zur
  redaktionellen Prüfung) nach `var/log/`.

### Aktueller Zustand

- KIST: `ddev pull prod-v12` (Provider `.ddev/providers/prod-v12.yaml`) holt
  Datenbank und `fileadmin` der v12-Produktion. Die lokale Datenbank ist
  aktuell im v12-Stand; v14 startet darauf nicht.
- KIST: fünf Wizards `ps14Site_*` in `ps14_site/Classes/Upgrades/` (Plan
  `kist-v14-functionality.md`, Task 7), vier davon generisch.
- `bin/update-system.sh` (Vorlage) ruft `extension:setup`, `upgrade:run`,
  `cache:flush`, `cache:warmup` und scheitert auf einer Alt-Datenbank am
  selben Punkt.
- In der Agentur gibt es ein Shell-Skript, das alle Schritte ausführt und
  manuelle SQL-Skripte importiert; es wird ins Projekt gemergt und nach dem
  Lauf gelöscht. Vorlage für Aufbau und Konventionen (siehe Offene Punkte).

### Key Decisions

1. **Ein Paket als TYPO3-Extension** (entschieden 2026-11-23): Skripte, SQL,
   Wizards und Commands in einer Extension statt eines Ordners, der ins
   Projekt gemergt wird. Installation per Composer als Dev-Abhängigkeit,
   danach `composer remove`.
2. **Shell-Einstieg vor TYPO3**: `bin/ps14-migrate` ist ein Bash-Skript, weil
   Pre-SQL laufen muss, bevor ein TYPO3-Befehl startet. TYPO3-Befehle werden
   erst danach aufgerufen.
3. **Schema-Update ohne `_cli_`**: eigener Befehl
   `ps14:migration:update-schema` (Core-`SchemaMigrator`, nur add/change,
   kein Backend-Login). Das Pre-SQL für `be_users.user_settings` dient nur
   als Rückfallebene, falls der Befehl nicht startet.
4. **Generisch im Paket, Projektspezifisches im Projekt**: Projekt-Wizards in
   `ps14_site/Classes/Upgrades/`, Projekt-SQL in `config/migration/sql/`,
   Projekt-Einstellungen in `config/migration/migration.env` (siehe
   Proposed Changes). Beides wird nach der letzten Datenübernahme (Go-Live)
   im Projekt gelöscht.
5. **Bereinigung nur migrierter Quellen** (Festlegung KIST 2026-11-23): Jeder
   Wizard bzw. jedes SQL-Skript nennt die Altquellen, die nach erfolgreicher
   Migration entfernt werden dürfen. Das Skript entfernt nur diese; alles
   andere bleibt für spätere Schritte lesbar.
6. **Wiederholbarkeit**: Ein Lauf startet immer von einem frischen Dump. Das
   Skript prüft vorher, dass die Datenbank noch im Altstand ist, und bricht
   sonst ab (kein doppeltes Migrieren). SQL-Skripte sind idempotent.
7. **Keine isolierte Core-Migration** (entschieden 2026-11-23): Der Ansatz
   des Agentur-Tools (Arbeitskopie je Version mit `typo3_console`) ist zu
   umfangreich. Es bleibt beim eigenen Befehl
   `ps14:migration:update-schema` und den SQL-Skripten nach dem Schema
   `config/migration/sql/pre|post` (idempotent, Dateinamen-Reihenfolge,
   Präfix `DEV` = nicht beim Go-Live, Begründung als Kopfkommentar in
   `post/`).

### Proposed Changes

Paketstruktur:

```
ps14_migration/
  composer.json                      # type typo3-cms-extension, bin: bin/ps14-migrate
  bin/ps14-migrate                   # Bash, Ablaufsteuerung
  Classes/
    Command/UpdateSchemaCommand.php  # ps14:migration:update-schema
    Upgrades/                        # generische Wizards (#[UpgradeWizard])
  Configuration/Services.yaml
  Resources/Private/Sql/pre/         # z. B. 14.2-be-users-user-settings.sql
  Resources/Private/Sql/post/
  Resources/Private/Steps/           # Zwischenversionen (später)
  README.md
```

Im Projekt (nur während der Migration):

```
config/migration/
  migration.env      # Quelle (DDEV-Provider), Quellversion, Optionen
  sql/pre/*.sql      # vor der Core-Migration (Standard), idempotent, Präfix DEV = nicht beim Go-Live
  sql/post/*.sql     # nach den Wizards, nur mit Begründung im Kopfkommentar
```

Ablauf von `ps14-migrate`:

1. Voraussetzungen prüfen (DDEV, Konfiguration, Datenbank im Altstand).
2. Optional `ddev pull <provider>` (nur mit Option, sonst vorhandene DB).
3. Pre-SQL: generisch, dann Projekt.
4. `ps14:migration:update-schema` (add/change).
5. `extension:setup`.
6. `upgrade:run` (Core, Paket, Projekt) mit Protokoll.
7. Post-SQL: generisch, dann Projekt.
8. Bereinigung der migrierten Altquellen.
9. `cache:flush`, Prüfungen (Frontend-URLs aus `migration.env`, `upgrade:list`).
10. Zusammenfassung und Protokoll.

### Review Agentur-Tool (2026-11-23)

Gelesen (nicht übernommen): `other_typo3_upgrade-master`
(lokal unter `kist-escherich-com-v14/temp/`). Kernpunkte:

- **Stufenweise Core-Migration in einer isolierten Arbeitskopie**
  (`golive_migrate_db.sh <nächste Version>`): minimale Classic-Mode-Instanz
  nur mit Core-Sysexts (`PackageStates`-Preset je Version), Core-Tarball je
  Version von `get.typo3.org` (Cache `typo3sources/`), passende
  `typo3_console` und PHP-Version je Version; pro Stufe
  `database:updateschema safe`, `cache:flush`, `upgrade:run`, erneut
  `database:updateschema safe`. Versionen `7.6 … 14.3`.
- Damit entfällt das `_cli_`-Problem: `typo3_console database:updateschema`
  aktualisiert das Schema, bevor ein Befehl den Backend-User anmeldet, und
  die Core-Wizards laufen ohne Projekt-Extensions.
- **SQL-Konventionen** im Projekt (`upgrade_process/`): `new_dump/` (vor der
  Core-Migration, Standard) und `new_dump_post_wizards/` (nach
  `upgrade:run`, nur wenn nötig, mit Begründung als Kopfkommentar);
  Ausführung in Dateinamen-Reihenfolge, **idempotent**, Präfix `DEV` =
  beim Go-Live überspringen; daneben `onetime/` (einmalig) und `migration/`
  (auch beim Go-Live).
- Ablauf: `new_dump/*.sql` → Core-Migration → `extension:setup` →
  `upgrade:run -n` → `new_dump_post_wizards/*.sql`.
- Prüf-Werkzeuge: BackstopJS (visuelle Regression), SEO-Spider-Vergleich
  alt/neu (URLs, Meta-Daten, Header).
- Hinweis: `copy_to_upgrade_process/migration_examples/fastmigrate.sh`
  enthält Datenbank-Zugangsdaten im Klartext; nicht übernehmen, im
  Agentur-Repository entfernen und das Passwort ändern lassen.

Übernahme in dieses Paket (entschieden 2026-11-23):

- Isolierte Core-Migration: **nicht** übernommen (Entscheidung 7).
- SQL-Regeln (idempotent, Reihenfolge, `DEV`-Präfix, Begründung in `post/`)
  übernommen, Ordner nach unserem Schema (siehe Proposed Changes).
- Visuelle Regression alt/neu mit **Playwright** (Screenshots) vorgemerkt
  als späterer Prüfschritt (statt BackstopJS aus dem Agentur-Tool);
  SEO-Spider-Vergleich nicht vorgesehen.

### Entscheidungen zu den offenen Punkten (2026-11-23)

1. Agentur-Tool: geprüft (siehe Review), Aufbau als Extension bleibt.
2. Repository `ps14-migration`: legst du an.
3. Ausführung von `ps14-migrate` inkl. SQL ist erlaubt (Eintrag in
   `CLAUDE.md`, Task 7).
4. Bereinigung der migrierten Altquellen: vorerst als SQL (`post/`).
5. Protokoll: `var/log/migration-<datum>.log`.

### Offene Punkte (vor Task 2 klären)

- Repository `ps14-migration` (legst du an).

### Risks

- **Core-Verhalten ändert sich**: weitere CLI-Schreibzugriffe auf neue Spalten
  in künftigen 14.x-Versionen. Gegenmaßnahme: Schema-Update ohne Login als
  erster TYPO3-Schritt, Tests gegen jede neue 14.x-Version.
- **SchemaMigrator ist interne API**: Änderungen in 14.x möglich; Befehl
  schlank halten und bei Core-Updates prüfen.
- **Projektspezifisches wird übersehen**: Wizards bleiben im Projekt; Liste
  im Projektplan pflegen.
- **Zwischenversionen** (v10/v11): Wegwerf-Installationen sind aufwendig;
  bewusst erst mit dem ersten Projekt umsetzen.

### Validierungsansatz

- KIST als Referenz: frischer `ddev pull prod-v12`, dann Lauf des Pakets;
  Ergebnis wie in `kist-v14-functionality.md` (Task 7/8) beschrieben.
- Zweiter Lauf auf neuem Dump liefert dasselbe Ergebnis.
- Lauf auf bereits migrierter Datenbank bricht mit Hinweis ab.
- Lint/PHPStan im Paket-Repository.

# Tasks

### Task 1: Plan

Dieser Plan; Klärung der offenen Punkte.

### Task 2: Paket-Grundgerüst

Repository, `composer.json`, `Services.yaml`, `README.md`, Einbindung in die
Vorlage (Pfad-Repository für die Entwicklung unter `packages/`, wie bei den
anderen Paketen).

### Task 3: Schema-Update ohne `_cli_`

`ps14:migration:update-schema` und Pre-SQL `be_users.user_settings` als
Rückfallebene; Test auf dem KIST-v12-Dump.

### Task 4: Ablaufskript `ps14-migrate`

Schritte 1–10, Konfiguration `config/migration/migration.env`, Protokoll,
Abbruch bei Fehlern, Schutz vor doppeltem Lauf.

### Task 5: Generische Wizards übernehmen

Navigation Content, Navigation Layout, Seitentyp 120, Container-Aufteilung aus
`ps14_site` (KIST) ins Paket; Sticky-Wizard bleibt in KIST. Bereinigung der
migrierten Quellen (Entscheidung 5).

### Task 6: KIST migrieren

Paket in KIST installieren, Projekt-Konfiguration anlegen, Datenübernahme
durchführen (Branch `feature/kist-data-takeover`), Prüfung gegen das
Altprojekt.

### Task 7: Doku

`CLAUDE.md` (erlaubte Befehle), Skill `updating-typo3-projects`, ggf.
`bin/update-system.sh` (Hinweis bzw. Aufruf des Schema-Befehls).

### Notizen Task 2

- Repository `chris-at-github/ps14-migration`, Entwicklungs-Clone unter
  `kist-escherich-com-v14/packages/ps14_migration` (KIST ist das erste
  Projekt und hat die v12-Testdatenbank; im Hauptrepo per `/packages/*`
  ignoriert).
- Inhalt: `composer.json` (`bin/ps14-migrate`, Branch-Alias
  `dev-main` → `14.x-dev`, Autoload kommt mit den ersten Klassen in
  Task 3), `ext_emconf.php` (14.0.0, alpha), `Readme.md` (Verwendung,
  Aufbau, Projektdateien, SQL-Regeln), `bin/ps14-migrate` (Platzhalter),
  `Resources/Private/Sql/{pre,post}/`, Extension-Icon.
- Vorlage: PHPStan analysiert `packages/ps14_migration/Classes`, sobald
  vorhanden. Kein Eintrag in den `versions` des Pfad-Repositorys (würde ein
  Lock-Update erfordern; der Branch-Alias des Pakets genügt).
- Installation im Projekt: `ddev composer require --dev
  'ps14/ps14_migration:^14.0@dev'` (Pfad-Repository `./packages/*`).

### Notizen Task 3

- `ps14:migration:update-schema` (`Classes/Command/UpdateSchemaCommand.php`):
  Core-`SqlReader`/`SchemaMigrator` wie `PackageSetup`, Aktionen
  `create_table`, `add`, `change`, `change_table`, keine Anmeldung von
  `_cli_`. Optionen `--dry-run`, `--skip=<tabelle>.<spalte>` (mehrfach).
- Auf dem KIST-v12-Dump: 3 Tabellen, 71 Spalten, 160 Änderungen. Zwei
  Änderungen hätten Daten zerstört (VARCHAR → INT):
  - `tt_content.header_layout`: Wert `container` (12 Elemente) → `0`.
  - `tx_foundation_domain_model_elements.record_type`: alle Element-Typen
    (1.359 Elements, benötigt für die Content-Blocks-Migration).
  Beide werden per `--skip` geschützt (KIST: `MIGRATION_SKIP_COLUMNS`).
- Generisches Pre-SQL `0010_sys_reaction_primary_key.sql`: `sys_reaction`
  existiert in v12 ohne `uid` (nur Spalte von EXT:external_import); der
  SchemaMigrator trennt AUTO_INCREMENT und PRIMARY KEY.
- Index `sys_refindex.lookup_rec` scheitert im ersten Durchgang
  (Spalten werden im selben Durchgang angelegt) und läuft im zweiten durch;
  `ps14-migrate` macht bei Fehlern automatisch einen zweiten Durchgang.
- `DatabaseUpdatedPrerequisite` (Voraussetzung von `upgrade:run`) fügt nur
  hinzu und ändert nichts. `extension:setup` dagegen wendet auch Änderungen
  an und würde die geschützten Spalten zerstören → wird von `ps14-migrate`
  nicht aufgerufen.

### Notizen Task 4

- `bin/ps14-migrate`: Voraussetzungen, Pre-SQL (Paket, Projekt),
  Schema-Update (mit `--skip` aus `migration.env`, ggf. zweiter Durchgang),
  `cache:flush`, `upgrade:run --no-interaction`, Post-SQL (Paket, Projekt),
  `cache:flush`, Marker `sys_registry` `ps14_migration`/`completed`,
  Prüfungen (`upgrade:list`, URLs aus `MIGRATION_CHECK_URLS`). Optionen
  `--go-live` (Dateien mit Präfix `DEV` überspringen), `--force`.
  Protokoll `var/log/migration-<datum>.log`.
- Lauf auf frischem KIST-Dump: Exit 0, 13 Wizards, keine offenen Wizards,
  Prüf-URLs HTTP 200; zweiter Lauf bricht wie vorgesehen ab.

### Notizen Task 5

- Ins Paket verschoben (Identifier `ps14Migration_*`): Navigation Content,
  Navigation Layout, Seitentyp 120 → Link, Container-Aufteilung.
  `ps14Site_disableStickyMigration` bleibt in KIST.
- Post-SQL (Bereinigung nur migrierter Quellen): Paket
  `0010_drop_tx_foundation_pages_content_mm.sql`, `0020_drop_pages_url.sql`;
  KIST `config/migration/sql/post/0010_drop_pages_tx_foundation_disable_sticky.sql`.
- Ergebnis auf KIST: 2 Sticky-Seiten, Navigation Content auf 8 Seiten
  (inkl. Übersetzungen), 42 Seiten Typ 120 (davon 20 aktiv) mit
  `t3://record`-Links, Container-Aufteilungen; Hinweis nur für den
  gelöschten Container 2714 (0/0). Elements-Tabelle und
  `container`-Überschriften bleiben erhalten.

### Notizen Task 6

- KIST lokal migriert (`ddev pull prod-v12 --skip-files`,
  `ps14-migrate`). Paket als `require-dev` `@dev` installiert,
  `composer.json`/`composer.lock` in KIST **nicht** committet.
- Seiten der Haupt-, Meta- und Footer-Navigation: 22 von 24 HTTP 200 wie
  im Altprojekt; `/unternehmen/ueber-kist-escherich` und
  `/produkte/individuelles-produkt` HTTP 500.
- **Fehler in ps14_foundation 14.0.0**: `TextImageProcessor` erbt den
  Konstruktor von `ModuleProcessor` (Abhängigkeit
  `RenderingPriorityService`), ist in `Services.yaml` aber nicht `public`
  und wird deshalb ohne Argumente instanziiert → jede Seite mit `textpic`
  liefert HTTP 500. Korrektur: `Ps14\Foundation\DataProcessing\TextImageProcessor:
  public: true` in ps14_foundation (eigenes Repository, Release nötig).
- **Risiko Go-Live / Deploy**: `bin/update-system.sh` ruft bei jedem
  Deploy `extension:setup` auf und würde `tt_content.header_layout` und
  `tx_foundation_domain_model_elements.record_type` auf INT umstellen.
  Dauerhafte Lösung in ps14_foundation nötig (Spaltendefinitionen als
  VARCHAR, z. B. `ext_tables.sql`), bevor ein migrierter Stand deployt wird.
  Gleicher Fehler in der Vorlage: `header_layout` ist dort bereits INT, der
  Wert `container` kann nicht gespeichert werden.
- Offen: visueller Vergleich (Playwright), Inhalte der noch nicht
  migrierten Extensions (Schritt 2), Entscheidung zu den foundation-Fehlern.

### Später: Playwright

Visuelle Regression zwischen Altprojekt und migriertem Stand mit Playwright
(Screenshots der Kernseiten), als eigener Prüfschritt nach Task 6.

# Status

| Task | Stand | Commit |
|---|---|---|
| 1 Plan | erledigt 2026-11-23 (alle Entscheidungen getroffen) | `8bde8cd`, `7accdf2` |
| 2 Grundgerüst | erledigt 2026-11-23 (siehe Notizen Task 2) | Paket `b29ac60` (Branch `feature/skeleton`), Vorlage `9125caf` |
| 3 Schema-Update | erledigt 2026-11-23 (Notizen Task 3) | Paket `63e98dc`, `8220277` |
| 4 Ablaufskript | erledigt 2026-11-23 (Notizen Task 4) | Paket `89bf9f6`, KIST `a645762` |
| 5 Generische Wizards | erledigt 2026-11-23 (Notizen Task 5) | Paket `e50da1d`, KIST `f8095a4` |
| 6 KIST migrieren | Lauf erfolgreich, 2 Seiten mit HTTP 500 (foundation-Fehler, Notizen Task 6) | – |
| 7 Doku | erledigt 2026-11-23 (`CLAUDE.md`, Skill, Paket-Readme) | siehe `git log` |
