---
paths:
  - "packages/*/Resources/Private/Assets/Scss/**/_navigation*.scss"
  - "packages/*/Resources/Private/Components/Navigation/List.html"
  - "packages/*/Resources/Private/Components/Navigation/List/**"
  - "packages/*/Resources/Private/Partials/Content/Menu/**"
---

# Navigation List

Linklisten, z. B. Sitemap, Auflistung interner Links, „Mehr zum Thema“,
Icon-Menüs (Social Media).

Fluid-Komponenten: `co:navigation.list` (`<ul>`) und
`co:navigation.list.item` (`<li>` mit Link).

## Navigation Link

### HTML-Aufbau

- Wird als `<a>`-Element mit der Klasse `navigation-list__link` dargestellt.
- Das `<a>`-Element enthält in dieser Reihenfolge:
  - optional ein Icon als SVG-Element mit der Klasse `navigation-list__icon`,
  - den Titel als `<span>` mit der Klasse `navigation-list__title`; in der
    Ansicht `listing` als Überschrift (`<h1>`–`<h6>`, Argument
    `headerLayout`, berechnet mit `fo:heading.auto`),
  - optional eine Beschreibung als `<span>` mit der Klasse
    `navigation-list__description`.
- Folgende Links können enthalten sein:
  - interne Links
  - externe Links
  - Download-Links
  - Anker-Links

### CSS-Aufbau

- Der Link spannt sich über die gesamte Breite auf.
- Erstelle Hover- und Fokus-Styles nach
  [interaction-states.md](../interaction-states.md): Ist im Design kein
  Hover-Style vorhanden, erstelle eine sinnvolle und kontrastreiche Änderung.
  Der Fokus-Style übernimmt den Hover-Style und wird zusätzlich mit einer
  Outline mit ausreichendem Kontrast gekennzeichnet.
- Die Styles sitzen größtenteils auf dem `<a>`-Tag, nicht auf dem `<li>`.
- Bei Hover und Fokus wird der Hintergrund des Links eingefärbt. Der Link
  ragt dafür um sein horizontales Padding aus der Liste heraus (negatives
  `margin-inline` am Link), damit der Text bündig zum umgebenden Inhalt
  bleibt.
- Die Links werden auf verschiedenen Hintergrundfarben dargestellt. Verwende
  für alle Farben die globalen Navigations-Variablen aus
  `bootstrap/_root.scss` — sie gelten für jede Navigation (auch das
  Mainmenu) und werden je nach Kontext überschrieben. „active“ bezeichnet
  Hover und Focus-Visible:
  - Hintergrund: `--navigation-background-color`,
    `--navigation-active-background-color`
  - Schrift: `--navigation-font-color`, `--navigation-active-font-color`,
    `--navigation-description-color`,
    `--navigation-active-description-color`
  - Icon: `--navigation-icon-color`, `--navigation-icon-background-color`,
    `--navigation-active-icon-color`,
    `--navigation-active-icon-background-color`
- Ist ein Icon vorhanden:
  - wird die Ausrichtung über `display: flex` und `gap` gesteuert (Ansicht
    `listing`: `display: grid`, da Titel und Beschreibung neben dem Icon
    untereinander stehen),
  - wird der Puffer zwischen Text und Icon per `gap` gesetzt.

## Navigation List

### HTML-Aufbau

- Die Navigation List liegt in einem `<nav>`-Tag mit der Klasse `navigation`.
  - Das `<nav>`-Tag erhält ein `aria-label`, um die Navigation für
    Screenreader zugänglich zu machen.
- Die Liste ist ein `<ul>`-Element mit der Klasse `navigation-list`.
- Jeder Listeneintrag ist ein `<li>`-Element mit der Klasse
  `navigation-list__item`.
- Ansichten werden als Modifier an der Liste gesetzt:
  - ohne Modifier: einfache Liste (z. B. Footer),
  - `navigation-list--listing`: erweiterte Liste mit Icon und Beschreibung,
  - `navigation-list--icon`: Icon-Menü; der Titel bleibt für Screenreader im
    Markup und wird per CSS visuell versteckt.

### CSS-Aufbau

- Ist eine Trennlinie vorhanden:
  - wird sie als `border-bottom` am `<li>`-Element definiert,
  - wird dafür die Variable `var(--color-ruler)` verwendet.
- Wird die Navigation auf einem farbigen Hintergrund dargestellt, setze die
  Hintergrundfarbe über `--navigation-background-color` (greift am
  `<nav class="navigation">`).
- Die Listenpunkte haben kein vertikales Padding — der gesamte Platz gehört
  dem Link.
