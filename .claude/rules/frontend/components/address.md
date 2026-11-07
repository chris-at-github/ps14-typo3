---
paths:
  - "packages/*/Resources/Private/Assets/Scss/**/_address*.scss"
  - "packages/*/Resources/Private/Components/Address.html"
  - "packages/*/Resources/Private/Components/Address/**"
---

# Adresse

## HTML-Aufbau

- Die Adresse wird in einem `<address>`-Tag dargestellt.
- Setze keine Styles direkt auf das `<address>`-Tag. Verwende die CSS-Klasse
  `address`.
- Fasse die Adress-Einträge immer in einem `<div>` mit der Klasse
  `address__group` zusammen.
- Lege für jeden Eintrag einen Adress-Eintrag an: ein `<div>` mit der Klasse
  `address__item`.
- Enthält ein Eintrag ein Icon, füge es als SVG-Element mit der Klasse
  `address__icon` hinzu.
  - Hat der Eintrag kein Label, füge dem Icon ein `aria-label` zur
    Beschreibung hinzu.
  - Ist der Eintrag ein Link, platziere das Icon innerhalb des Links.
- Besteht ein Adress-Eintrag aus mehreren Werten, die zusammen einen Eintrag
  bilden, lege dafür jeweils ein `<div>` mit der Klasse `address__item-value`
  an.
- Gibt es eine Adress-Überschrift:
  - Füge sie als H-Tag mit der Klasse `address__title` hinzu.
  - Der Style liegt auf der Klasse und nicht auf dem H-Tag.
  - Besteht die Überschrift aus mehreren Elementen, fasse sie in einem `<div>`
    mit der Klasse `address__header` zusammen.

## CSS-Aufbau

- Der Abstand zwischen den Einträgen wird nicht auf `address`, sondern auf
  `address__group` definiert.
- Enthält ein Eintrag ein Icon, wird der Abstand zwischen Icon und Label per
  `gap` gesteuert, nicht per `margin`.
- Ist ein Eintrag ein Link, füge Hover- und Fokus-Styles (`hover` und
  `focus-visible`) nach [interaction-states.md](../interaction-states.md)
  hinzu: Fokus hat die gleichen Eigenschaften wie Hover, zusätzlich eine
  Outline mit ausreichendem Kontrast.
