---
paths:
  - "packages/*/Resources/Private/Assets/Scss/**/*.scss"
---

# Interaktionszustände: Hover, Fokus, Disabled

Diese Regeln gelten für jedes interaktive Element (Links, Buttons, interaktive
Badges, verlinkte Cards, verlinkte Adress-Einträge, Navigationslinks). Welche
Selektoren betroffen sind, legen die Komponenten-Spezifikationen fest.

## Hover

- Füge jeder Variante einer interaktiven Komponente einen Hover-Selektor
  hinzu, z. B. `.button--primary:hover`.
- Falls es im Design keine Definition gibt, definiere einen eigenen,
  sinnvollen Hover-Style mit deutlich sichtbarer Änderung.
- Achte auf ausreichend Kontrast zwischen Hintergrund und Text.
- Setze bei Hover und Fokus nur Eigenschaften, die sich gegenüber dem
  initialen Zustand ändern.

## Fokus

- Füge jeder Variante einen Fokus-Selektor hinzu, z. B.
  `.button--primary:focus-visible`.
- Falls es im Design keine Definition gibt, definiere einen eigenen
  Fokus-Style.
- Übernimm für den Fokus-Style die vollständige Definition aus dem
  Hover-Style.
- Füge zusätzlich einen sinnvollen Outline-Style mit ausreichend Kontrast
  hinzu (`var(--color-focus-outline)`).
- Setze die Outline nur in Komponenten, die einen Fokus erhalten können, nicht
  global.

## Disabled

- Füge Komponenten, die deaktiviert sein können (Buttons, Badges), einen
  sinnvollen Disabled-Style hinzu.
- Falls es im Design keine Definition gibt, definiere einen eigenen
  Disabled-Style.
- Wenn sinnvoll, kann der Disabled-Style für alle Varianten der Komponente
  verwendet werden.
