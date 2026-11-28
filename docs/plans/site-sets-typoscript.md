# Requirements

### Überblick & Ziel

Die Vorlage lädt ihr TypoScript über ein einziges `sys_template` auf der
Startseite (`root = 1`, `clear = 3`, statisches Template
`fluid_styled_content`, `@import` von `ps14_site/Site.*.typoscript`). Durch
`clear = 3` verwirft TYPO3 das TypoScript aller Site Sets; von den Sets
greifen nur die Settings. Ziel: TypoScript auf den von TYPO3 vorgesehenen
Weg umstellen — Site Sets liefern Setup, Konstanten und Settings, ein
`sys_template` ist nicht mehr nötig.

- Stand: 2026-11-27 (Verbesserung, noch nicht begonnen)
- Anlass: KIST Schritt 2.6 (News). Das Set `georgringer/news` hat kein
  TypoScript geliefert (Sortierung der Listen falsch); KIST bindet das
  Set-Setup deshalb per `@import` ein und bleibt vorerst so
  (`kist-escherich`, Plan `kist-news.md`).

### Bestandsaufnahme

| Teil | Heute |
|---|---|
| `sys_template` uid 1 (Dump `sql/template-*.sql.gz`) | `clear = 3`, `include_static_file` = `fluid_styled_content`, Konstanten/Setup = `@import` von `ps14_site` |
| Sets `foundation/settings`, `site/settings` | nur `settings.definitions.yaml`, kein TypoScript |
| Fremd-Extensions mit Set | Regel `third-party-extensions.md` geht davon aus, dass das Set-Setup geladen wird — stimmt mit `clear = 3` nicht |
| Statische Routen `/de/sitemap.xml`, `/en/sitemap.xml` (Typ `uri`) | kollidieren mit dem `PageTypeSuffix` `sitemap.xml` von `typo3/seo-sitemap` (Endlosschleife von Selbstaufrufen, alle PHP-Worker belegt) |

### Scope

- Sets mit TypoScript: `foundation/*` (Setup/Konstanten aus
  `ps14_foundation`), `site/*` (aus `ps14_site`), Abhängigkeiten auf Core-
  bzw. Fremd-Sets (`typo3/fluid-styled-content`, `typo3/seo-sitemap`, …).
- `sys_template` entfernen (Vorlage, `create-system.sh`/Dump) bzw. für
  migrierte Projekte per Post-SQL deaktivieren.
- Statische Sitemap-Routen durch das Set `typo3/seo-sitemap` ersetzen.
- Regeln `.claude/rules/typo3/third-party-extensions.md` (und ggf.
  `own-extensions.md`) anpassen.

Nicht im Scope: Umstellung bestehender Kundenprojekte (folgt über
`git merge main` je Projekt, z. B. KIST: `@import` des news-Setups entfernen).

### Key Decisions (2026-11-28)

1. **Ladereihenfolge immer Extension > Foundation > Sitepackage:** die
   Extension liefert die Grundkonfiguration, `ps14_foundation` kann sie
   überschreiben, `ps14_site` kann beides erneut überschreiben (später
   geladen = überschreibt). Das Set
   `site/settings` (`ps14_site`) hängt von den Sets der Fremd-Extensions
   und danach von `foundation/settings` ab (Reihenfolge der
   `dependencies`); `foundation/settings` hängt von den Core-Sets
   `typo3/fluid-styled-content` und `typo3/seo-sitemap` ab. Die Site
   (`config/sites/*/config.yaml`) nennt nur `site/settings`.
2. **Konstanten werden umgeschrieben** (keine Rücksicht auf bestehende
   Konstanten-Namen):
   - `styles.content.textmedia.maxW`/`maxWInText` → Settings des Core-Sets
     `typo3/fluid-styled-content` (Werte in `settings.yaml` bzw. als
     Default von `foundation/settings`).
   - `plugin.tx_seo…pages.excludedDoktypes` → Setting
     `seo.sitemap.pages.excludedDoktypes` von `typo3/seo-sitemap`.
   - `meta.viewport` → neues Setting in `foundation/settings`.
   - `config.debug`, `config.adminPanel`, `config.absRefPrefix` → feste
     Werte im Setup.
   - Konstanten-Dateien von `ps14_foundation`/`ps14_site` entfallen.
3. **`config.no_cache` entfällt** (Caching wird über den Application
   Context gesteuert).
4. **Kein Übergang mit beiden Wegen:** ein Projekt hat entweder das
   `sys_template` oder Sets mit TypoScript. Vorlage: `sys_template` aus
   dem Dump entfernen; migrierte Projekte: Post-SQL; bestehende Projekte:
   beim `git merge main` im selben Schritt entfernen (MCP, sonst SQL).
5. **Sitemap über das Set `typo3/seo-sitemap`:** die statischen Routen
   `/de/sitemap.xml`, `/en/sitemap.xml` (Typ `uri`) entfallen, der
   `PageTypeSuffix` des Sets liefert `sitemap.xml` (sonst Endlosschleife).

### Risiken

- Kopien/Referenzen (`<`, `=<`) und `dataProcessing`-Keys hängen von der
  Reihenfolge ab — Ergebnis-HTML vorher/nachher vergleichen.
- Extensions ohne Set (z. B. die Projekt-Extensions `kist_contact`,
  `kist_news`) kämen nur über `ps14_site/…/Extensions/*.typoscript` und
  damit nach Foundation — Foundation könnte sie nicht überschreiben.
  Deshalb bekommt jede eigene Extension mit TypoScript ein Set (Setup im
  Set, Abhängigkeit in `site/settings` vor `foundation/settings`).

### Validierungsansatz

- Vorlage: alle Seiten/Module HTTP 200, Markup unverändert gegenüber dem
  Stand mit `sys_template` (Vergleich vorher/nachher).
- `sitemap.xml` de/en ohne Selbstaufruf, News-Sitemap in KIST.

# Tasks

### Task 1: Bestandsaufnahme vorher
HTML aller Seiten der Vorlage (de/en, inkl. Beispielseiten unter
„Modules“) und `sitemap.xml` als Referenz sichern (`temp/`).

### Task 2: Set `foundation/settings` mit TypoScript
`setup.typoscript` (Imports der Foundation-Dateien), Abhängigkeiten
`typo3/fluid-styled-content`, `typo3/seo-sitemap`, Setting `meta.viewport`,
Konstanten → Settings bzw. feste Werte, `config.no_cache` entfernen,
Konstanten-Dateien löschen. Release `ps14_foundation`.

### Task 3: Set `site/settings` mit TypoScript
`setup.typoscript` (Imports von `ps14_site`), Abhängigkeiten: Sets der
Fremd-Extensions, dann `foundation/settings`; `config.yaml` der Vorlage nur
`site/settings`; Werte in `settings.yaml`.

### Task 4: `sys_template` und Sitemap-Routen entfernen
`sys_template` aus der Vorlagen-DB (MCP, sonst SQL) und dem Dump
`sql/template-*.sql.gz`; statische Sitemap-Routen aus `config.yaml`;
`create-system.sh` prüfen.

### Task 5: Migration und Projekt-Update
Post-SQL-Vorlage für `ps14-migrate` (`sys_template` des Altprojekts
entfernen), Checkliste im Skill `updating-typo3-projects`.

### Task 6: Regeln und Doku
`third-party-extensions.md`, `own-extensions.md` (Set-Abhängigkeiten,
Reihenfolge, kein `@import` von Set-Setup), Plan.

### Task 7: Vergleich
HTML vorher/nachher (Task 1), `sitemap.xml` ohne Selbstaufruf, Lint.

# Status

| Task | Stand | Commit |
|---|---|---|
| Plan | angelegt 2026-11-27; Entscheidungen 1–5 am 2026-11-28 | — |
