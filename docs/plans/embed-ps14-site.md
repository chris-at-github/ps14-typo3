# Requirements

### Überblick & Ziel

`ps14_site` wird Teil des Hauptrepos (`ps14-typo3.git`) und liegt dort
versioniert unter `packages/ps14_site`. Die History aus `ps14-site.git`
bleibt erhalten. Projektanpassungen an der Site laufen danach über die
Kunden-Branches des Hauptrepos (z. B. `kist-escherich`), nicht mehr über ein
separates Repo. Ein neues Projekt besteht damit aus einem einzigen Clone.

### Scope

**In Scope**
- Import von `ps14_site` (Branch `v14-dev`) mit History nach
  `packages/ps14_site` im Hauptrepo.
- `.gitignore`: `ps14_site` versionieren, übrige Pakete weiter ignorieren.
- `composer.json`: `ps14_site` bleibt Path-Paket, Version fixiert.
- Dokumentation: `CLAUDE.md`, `README.md`,
  `.claude/rules/typo3/own-extensions.md`.
- Übernahme in `kist-escherich-com-v14` (`git merge main` in
  `kist-escherich`).

**Out of Scope**
- Jede Änderung an `ps14-site.git` und seinen Branches.
- Migration der v13-Kunden-Branches (`kist-escherich`,
  `kist-escherich-hyjoin`, `haus-schnetzer-at`) auf v14.
- Deployment (Schritt 3, eigener Plan).
- Änderungen an den gemeinsamen Paketen (foundation, component, container,
  menu).

### User Story

- Als Entwickler möchte ich ein Projekt mit einem einzigen `git clone`
  aufsetzen und Site-Änderungen im selben Commit wie Konfigurationsänderungen
  des Projekts festhalten, damit Projektstände vollständig und reproduzierbar
  in einem Repo liegen.

### Akzeptanzkriterien

- `packages/ps14_site` ist im Hauptrepo versioniert und enthält kein eigenes
  `.git`.
- `git log` im Hauptrepo enthält die bisherigen Commits von `ps14_site`
  (`v14-dev`, 203 Commits).
- Inhalt von `packages/ps14_site` ist identisch mit `ps14-site.git`
  `v14-dev` (`bc66c57`) — `diff -r --exclude=.git` ohne Ausgabe.
- Neue Dateien unter `packages/ps14_site/` erscheinen in `git status`,
  ein geklontes Paket wie `packages/ps14_foundation/` nicht.
- `composer.lock` führt `ps14/ps14_site` als Path-Paket mit Version
  `14.x-dev` — unabhängig vom ausgecheckten Branch.
- `ddev composer install`, `ddev typo3 extension:setup`,
  `ddev typo3 cache:flush` laufen fehlerfrei; Frontend und Backend antworten
  mit HTTP 200.
- `ddev exec npm run lint` läuft ohne Befund (Template und
  `kist-escherich-com-v14`).
- In `kist-escherich-com-v14` ist `main` in `kist-escherich` gemergt.

# Technical Design

### Aktueller Zustand

- Hauptrepo `.gitignore`: `/packages/` komplett ignoriert.
- `composer.json`: Path-Repo `./packages/*` mit `versions` für die vier
  gemeinsamen Pakete; `ps14/ps14_site` per `@dev`. `composer.lock` führt die
  Site als `dev-v14-dev` (Version aus dem Git-Branch des Site-Repos).
- `ps14-site.git` (lokal `~/www/ps14-typo3/packages/ps14_site`, sauber,
  synchron mit `origin/v14-dev`):

| Branch | Stand | ahead/behind ggü. `v14-dev` |
|---|---|---|
| `v14-dev` | `bc66c57` (v14) | — |
| `master` (GitHub-Default) | 2024-11-26 | 0 / 141 |
| `13.0.0-dev` | 2026-01-13 | 0 / 36 |
| `kist-escherich` | 2026-05-09 (v13) | 216 / 160 |
| `kist-escherich-hyjoin` | 2026-02-24 (v13) | 207 / 160 |
| `haus-schnetzer-at` | 2025-01-11 | 53 / 141 |

- `master` und `13.0.0-dev` sind vollständig in `v14-dev` enthalten. Die drei
  Kunden-Branches haben eigene Commits, die nicht in `v14-dev` liegen.
- `kist-escherich-com-v14/packages/ps14_site` ist ein Clone desselben Stands
  (`bc66c57`, sauber).
- Linter/Build nutzen bereits feste Pfade unter `packages/ps14_site`
  (`package.json` `lint:css`, Globs in PHP-CS-Fixer/PHPStan/editorconfig) —
  daran ändert sich nichts.
- Remote-Branch `origin/v14-dev-ps14-site` im Hauptrepo (Lint-Chores, nicht
  in `main`) — Herkunft unklar, wird nicht angefasst.

### Key Decisions

- **Import per `git subtree add`** ohne `--squash`: alle Commits von
  `v14-dev` kommen als zweiter Parent eines Merge-Commits ins Hauptrepo.
  Kein Zusatztool nötig (`git-filter-repo` ist nicht installiert).
  Einschränkung: Die alten Commits liegen mit Pfaden ohne Präfix vor —
  `git log -- packages/ps14_site/<datei>` endet am Import-Commit; ältere
  History per `git log <import>^2 -- <datei>`.
- **Quelle lokal**: `git fetch` über SSH funktioniert in Claudes Umgebung
  nicht. Der bestehende Clone wird nach `temp/ps14_site-repo/` verschoben
  (gitignored) und dient als Quelle des Imports. Er bleibt als Sicherung, bis
  du ihn freigibst.
- **Kein Squash für den Import**: Ein `git merge --squash` des Feature-Branchs
  würde die importierte History wieder entfernen. Ablauf daher zweigeteilt:
  1. `.gitignore`, `composer.json` und Doku auf `feature/embed-ps14-site`,
     Squash-Merge nach `main` wie gewohnt.
  2. Danach `git subtree add` **direkt auf `main`** als einzelner
     Merge-Commit. Ausnahme von der Squash-Regel → braucht deine Freigabe.
- **Version fixieren**: `"ps14/ps14_site": "14.x-dev"` in der
  `versions`-Option des Path-Repos. Ohne Fixierung leitet Composer die
  Version aus dem Branch des Hauptrepos ab (`dev-main`,
  `dev-kist-escherich`) und `composer.lock` ändert sich bei jedem
  Branchwechsel.
- **Altes Repo `ps14-site.git` bleibt unangetastet**: Es wird nicht mehr
  für v14 genutzt, aber weder archiviert noch verändert. Die Kunden-Branches
  dort enthalten die Anpassungen aller Sites und dürfen auf keinen Fall
  angefasst werden (kein Löschen, kein Rebase, kein Push, kein Archivieren).
- **Kunden-Branches im Hauptrepo** übernehmen ab jetzt die Rolle der
  Site-Kunden-Branches. `kist-escherich` bekommt die Site per
  `git merge main` (normaler Merge, langlebiger Branch).

### Proposed Changes

**`.gitignore`:**

```gitignore
# Dependencies
/vendor/
/packages/*
!/packages/ps14_site/
/node_modules/
```

**`composer.json`**: `require` `"ps14/ps14_site": "^14.0@dev"` (statt `@dev`, behebt die Warnung von `composer validate`) und im Path-Repo:

```json
"versions": {
    "ps14/ps14_component": "14.x-dev",
    "ps14/ps14_container": "14.x-dev",
    "ps14/ps14_foundation": "14.x-dev",
    "ps14/ps14_menu": "14.x-dev",
    "ps14/ps14_site": "14.x-dev"
}
```

**Import (auf `main`, nach Freigabe):**

```bash
mv packages/ps14_site temp/ps14_site-repo
git subtree add --prefix=packages/ps14_site temp/ps14_site-repo v14-dev \
    -m "chore: embed ps14_site with its history into the main repository"
diff -r --exclude=.git temp/ps14_site-repo packages/ps14_site
```

**Doku:**
- `CLAUDE.md` (Project Structure): `ps14_site` liegt im Hauptrepo, nur
  `ps14_foundation` & Co. sind eigene Repos.
- `README.md`: Abschnitt zu `ps14_site` (kein separater Clone mehr).
- `own-extensions.md`: `ps14_site` aus „jede Extension ist ein eigenes
  Repository“ ausnehmen; Kunden-Branches des Hauptrepos erwähnen.

### File Structure

| Repo | Datei | Änderung |
|---|---|---|
| Hauptrepo | `.gitignore` | `/packages/*` + Ausnahme `ps14_site` |
| Hauptrepo | `composer.json`, `composer.lock` | Version `14.x-dev` für die Site |
| Hauptrepo | `packages/ps14_site/**` | Import per `git subtree add` |
| Hauptrepo | `CLAUDE.md`, `README.md`, `.claude/rules/typo3/own-extensions.md` | Repo-Struktur |
| `kist-escherich-com-v14` | Branch `kist-escherich` | `git merge main` |

### Risks

- **Doppelte Pflege**: Wird bis zum Import noch in `ps14-site.git` committet,
  fehlen diese Commits. Vor dem Import prüfen, dass `v14-dev` lokal = remote.
- **Untracked-Konflikt im Kundenprojekt**: `git merge main` bricht ab,
  solange `packages/ps14_site` dort als eigener Clone liegt. Der Clone wird
  vorher nach `temp/` verschoben (Stand ist identisch, `bc66c57`).
- **Andere Projekte** mit eigenem `packages/ps14_site`-Clone (z. B. später
  geklonte Kundenprojekte) brauchen denselben Schritt.
- **Remote-Aktionen** (Push) führst du aus.

# Testing

### Validierungsansatz

Inhaltsvergleich nach dem Import, Composer- und TYPO3-Läufe in DDEV, Lint.
Erst im Template, dann in `kist-escherich-com-v14`.

### Kernszenarien

1. `diff -r --exclude=.git temp/ps14_site-repo packages/ps14_site` → leer.
2. `git log --oneline | wc -l` steigt um 203 + Import-Commit.
3. `touch packages/ps14_site/x` → in `git status`;
   `mkdir packages/ps14_foundation && touch packages/ps14_foundation/x` →
   nicht in `git status` (danach beide entfernen).
4. `ddev composer update ps14/ps14_site` (Rückfrage, nicht freigegeben) →
   `composer.lock` Version `14.x-dev`; Branchwechsel ändert die Lock nicht.
5. `ddev typo3 extension:setup`, `ddev typo3 cache:flush`, Frontend `/de/`
   und Backend HTTP 200.
6. `ddev exec npm run lint` ohne Befund.

### Edge Cases

- Kundenprojekt mit lokalem Site-Clone → Merge nur nach Verschieben.
- `git log -- packages/ps14_site/...` zeigt nur den Import-Commit
  (erwartet, siehe Key Decisions).

# Delivery Steps

Hauptrepo `~/www/ps14-typo3`, Branch `feature/embed-ps14-site`. Push und
Merge nach `main` nur auf deine Anweisung.

### Task 1: Ignore und Composer vorbereiten

- `.gitignore` und `composer.json` gemäß Proposed Changes.
- `ddev composer update ps14/ps14_site` (Rückfrage), Szenario 4.
- Commit: `chore: track ps14_site in the main repository and pin its version`.

### Task 2: Dokumentation

- `CLAUDE.md`, `README.md`, `own-extensions.md` gemäß Proposed Changes.
- Commit: `docs: describe ps14_site as part of the main repository`.

### Task 3: Squash-Merge nach `main`

- Auf deine Anweisung, Commit-Message zur Freigabe, Branch danach löschen.

### Task 4: Import auf `main`

- Prüfen: `ps14_site` sauber, `v14-dev` = `origin/v14-dev`.
- Clone nach `temp/ps14_site-repo` verschieben, `git subtree add` (siehe
  Proposed Changes), Szenarien 1–3, 5, 6.

### Task 5: Übernahme in `kist-escherich-com-v14`

- `main` aus `~/www/ps14-typo3` holen (lokaler Fetch), Site-Clone nach
  `temp/ps14_site-repo` verschieben, `git merge main` in `kist-escherich`.
- `ddev composer install`, Szenarien 5 und 6.

### Task 6: Aufräumen

- Sicherungen in `temp/ps14_site-repo` (beide Clones) nach deiner Freigabe
  löschen. `ps14-site.git` auf GitHub bleibt unverändert.

# Entscheidungen

Geklärt am 2026-11-20:

1. Der Import (Task 4) landet als Merge-Commit direkt auf `main`
   (Ausnahme von der Squash-Regel, damit die History erhalten bleibt).
2. Import per `git subtree` ohne Umschreiben der History.
3. `ps14-site.git` wird nicht archiviert und nicht verändert.

# Status

- [x] Task 1 – Ignore und Composer: Commit f535387.
  - Lock per `ddev composer update ps14/ps14_site --no-install` (vendor im
    Template bleibt bei den Symlinks): `dev-v14-dev` → `14.x-dev`.
  - `composer validate` ok, `npm run lint` ohne Befund.
- [x] Task 2 – Dokumentation: Commit aedebf7 (`CLAUDE.md`, `README.md`, `own-extensions.md`;
  zusätzlich Kunden-Branches des Hauptrepos beschrieben).
- [x] Task 3 – Squash-Merge nach `main`: 4bfad51, Feature-Branch gelöscht.
- [x] Task 4 – Import auf `main`: 2ec6b00 (`git subtree add`, 203 Commits).
  - Inhalt identisch mit `temp/ps14_site-repo`; die ignorierten
    Iconfont-Artefakte per `ddev exec node build/build-iconfont.js` neu erzeugt.
  - `.gitignore`: neue Datei in `ps14_site` sichtbar, in `ps14_foundation` nicht.
  - `extension:setup`, `cache:flush` ok; `/de/` und `/typo3/` HTTP 200.
  - ESLint lintete die Sicherung in `temp/` → `temp/` in `eslint.config.js`
    ignoriert (`temp/` bleibt dauerhaft als Ablage für Zwischenstände).
- [ ] Task 5 – Übernahme in `kist-escherich-com-v14`
- [ ] Task 6 – Aufräumen
