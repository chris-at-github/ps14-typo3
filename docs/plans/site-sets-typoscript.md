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

### Offene Fragen

- Reihenfolge Konstanten/Settings: welche `{$…}`-Konstanten von
  `ps14_foundation` werden zu Settings?
- `fluid_styled_content` als Set-Abhängigkeit statt statischem Template —
  Reihenfolge gegenüber `lib.contentElement`-Anpassungen prüfen.
- Doppelladung vermeiden, solange Projekte noch ein `sys_template` haben.

### Validierungsansatz

- Vorlage: alle Seiten/Module HTTP 200, Markup unverändert gegenüber dem
  Stand mit `sys_template` (Vergleich vorher/nachher).
- `sitemap.xml` de/en ohne Selbstaufruf, News-Sitemap in KIST.

# Tasks

Werden nach Klärung der offenen Fragen festgelegt.

# Status

| Task | Stand | Commit |
|---|---|---|
| Plan | angelegt 2026-11-27 (Verbesserung) | — |
