---
paths:
  - "packages/*/Resources/Private/Assets/Scss/**/*.scss"
---

# SCSS

## Ordnerstruktur

Basispfad: `packages/ps14_site/Resources/Private/Assets/Scss/`

| Ordner | Inhalt |
|---|---|
| `bootstrap/` | Grunddefinitionen: Design-Tokens (`_root.scss`), Typografie (`_typography.scss`), Fonts, Normalize. **Nur nach Rückfrage ändern.** |
| `mixins/` | Gemeinsame Mixins (z. B. Richtext, Utilities) |
| `layout/` | Seitenlayout und Sections |
| `components/` | Komponenten, z. B. Buttons oder Cards |
| `modules/` | Module, z. B. Intro oder Feature |
| `archive/` | Alter Code, nur als Referenz lesen — nicht in den Build einbinden |

## Dateien

- Erstelle CSS-Code in SCSS.
- Benenne alle Dateien nach dem Muster `_dateiname.scss` mit eindeutigem
  Namen, z. B. `components/_button.scss`, `modules/_feature-cards.scss`.
- **PFLICHT:** Binde jede neue SCSS-Datei sofort in `site.scss` ein — im
  Bereich ihrer Art (Components, Layout, Modules) per `@use`, z. B.
  `@use "components/button";` oder `@use "modules/feature-cards";`. Dieser
  Schritt darf nicht ausgelassen werden.

## Allgemeine Regeln

- Erstelle Klassennamen im BEM-Style.
- Schreibe möglichst nativen CSS-Code und verwende möglichst wenige
  SCSS-Eigenschaften.
- Erstelle keine SCSS-Variablen.
- Erstelle keine neuen SCSS-Mixins; verwende die bestehenden (siehe unten).
- Verwende keine CSS-Frameworks.
- Ein BEM-Block darf nie Außenabstand (`margin`) haben.
- Verwende für gruppierte Darstellungen `display: flex;` oder `display: grid;`
  und definiere Abstände mit `gap`, nicht mit `margin`.
- **PFLICHT:** Übernimm auch spezielle CSS-Eigenschaften aus dem Design
  vollständig. Lasse keine Eigenschaft aus, auch wenn sie unbekannt oder
  ungewöhnlich erscheint (z. B. `text-decoration-thickness`,
  `text-underline-offset`, `text-underline-position`,
  `text-decoration-skip-ink`, `letter-spacing`, `backdrop-filter`).

## Design-Tokens

- **PFLICHT:** Verwende für alle Farb- und Spacing-Werte die CSS-Variablen aus
  `bootstrap/_root.scss`.
  - Farben: `var(--color-*)`
  - `font-weight`: `var(--font-weight-*)`
- Abstandswerte: Verwende eine Spacing-Variable nur, wenn sie dem Wert aus dem
  Design exakt entspricht. Gibt es keinen exakten Treffer, verwende den
  Rohwert (z. B. `gap: 15px`) — erfinde keine Variable.
- Hardcodierte Werte wie `#0f4058` oder `20px` sind nur erlaubt, wenn es keine
  CSS-Variable dafür gibt.
- Verwende für Trennlinien die Variable `var(--color-ruler)`.

## Fokus-Outline

- Setze einen einheitlichen Fokus-Outline in den Komponenten ein.
- Setze ihn nicht global, sondern nur in den Komponenten, die einen Fokus
  erhalten können (z. B. Links, Buttons, Cards).
- Verwende für die Outline die Variable `var(--color-focus-outline)`.
- Details zu Hover-, Fokus- und Disabled-Zuständen:
  [interaction-states.md](interaction-states.md).
