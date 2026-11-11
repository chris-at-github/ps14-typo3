# Navigation

Navigationen aller Art, z. B. Linklisten, Sitemap, Auflistung interner Links,
„Mehr zum Thema“, Icon-Menüs (Social Media), Footer- und Meta-Navigation.

Die Komponente besteht aus zwei BEM-Blöcken:

- `navigation`: das `<nav>`-Element mit Liste (`navigation__list`) und
  Listenpunkten (`navigation__item`), SCSS: `components/_navigation.scss`.
- `navigation-item`: ein einzelner Eintrag (Link oder Button) mit Icon, Titel
  und Beschreibung, SCSS: `components/_navigation-item.scss`. Der Block ist
  unabhängig von der Liste und kann auch in anderen Navigationen (z. B.
  Mainmenu) eingesetzt werden.

Fluid-Komponenten: `co:navigation` (`<nav>`), `co:navigation.list` (`<ul>`)
und `co:navigation.list.item` (`<li>` mit Link).

## Navigation Item

### HTML-Aufbau

- Wird als `<a>`-Element (oder `<button>`) mit der Klasse `navigation-item`
  dargestellt.
- Das Element enthält in dieser Reihenfolge:
  - optional ein Icon als SVG-Element mit der Klasse `navigation-item__icon`,
  - den Titel als `<span>` mit der Klasse `navigation-item__title`; in der
    Ansicht `listing` als Überschrift (`<h1>`–`<h6>`, Argument
    `headerLayout`, berechnet mit `fo:heading.auto`),
  - optional eine Beschreibung als `<span>` mit der Klasse
    `navigation-item__description`.
- Icon, Titel und Beschreibung gehören zum Eintrag, nicht zur Navigation —
  verwende dafür nie Elemente des Blocks `navigation` (z. B.
  `navigation__title`).
- Ansichten werden als Modifier am Eintrag gesetzt (Argument `variant` von
  `co:navigation.list.item`):
  - ohne Modifier: einfacher Link (z. B. Footer),
  - `navigation-item--listing`: Icon-Kachel, Titel und Beschreibung,
  - `navigation-item--icon`: Icon-Kachel; der Titel bleibt für Screenreader
    im Markup und wird per CSS visuell versteckt.
- Folgende Links können enthalten sein:
  - interne Links
  - externe Links
  - Download-Links
  - Anker-Links

### CSS-Aufbau

- Der Eintrag spannt sich über die gesamte Breite auf.
- Erstelle Hover- und Fokus-Styles nach
  [interaction-states.md](../interaction-states.md): Ist im Design kein
  Hover-Style vorhanden, erstelle eine sinnvolle und kontrastreiche Änderung.
  Der Fokus-Style übernimmt den Hover-Style und wird zusätzlich mit einer
  Outline mit ausreichendem Kontrast gekennzeichnet.
- Die Styles sitzen auf dem `<a>`-Tag, nicht auf dem `<li>`.
- Bei Hover und Fokus wird der Hintergrund des Eintrags eingefärbt. Der
  Eintrag ragt dafür um sein horizontales Padding aus der Liste heraus
  (negatives `margin-inline`), damit der Text bündig zum umgebenden Inhalt
  bleibt.
- Die Einträge werden auf verschiedenen Hintergrundfarben dargestellt.
  Verwende für alle Farben die globalen Navigations-Variablen aus
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
- Maße des Eintrags werden über die Variablen `--navigation-item-*` gesteuert
  (z. B. `--navigation-item-gap`, `--navigation-item-padding-x`).
- Setze keine browserspezifischen Sonderregeln (z. B. `@supports` für
  Eigenschaften, die nur einzelne Browser unterstützen) — der Eintrag sieht
  in allen Browsern gleich aus.
- Ist ein Icon vorhanden:
  - wird die Ausrichtung über `display: flex` und `gap` gesteuert (Ansicht
    `listing`: `display: grid`, da Titel und Beschreibung neben dem Icon
    untereinander stehen),
  - wird der Puffer zwischen Text und Icon per `gap` gesetzt.

## Navigation

### HTML-Aufbau

- Die Navigation ist ein `<nav>`-Tag mit der Klasse `navigation`.
  - Das `<nav>`-Tag erhält ein `aria-label`, um die Navigation für
    Screenreader zugänglich zu machen.
- Die Liste ist ein `<ul>`-Element mit der Klasse `navigation__list`.
- Jeder Listeneintrag ist ein `<li>`-Element mit der Klasse
  `navigation__item` und enthält ein `navigation-item`.
- Ansichten werden als Modifier an der Navigation gesetzt (Argument `variant`
  von `co:navigation`) und zusätzlich an jedem Eintrag (siehe oben):
  - ohne Modifier: einfache Liste (z. B. Footer),
  - `navigation--listing`: erweiterte Liste mit Icon und Beschreibung,
  - `navigation--icon`: Icon-Menü, die Einträge stehen nebeneinander.

```html
<nav class="navigation navigation--listing" aria-label="Mehr zum Thema">
    <ul class="navigation__list">
        <li class="navigation__item">
            <a class="navigation-item navigation-item--listing" href="#">
                <!-- page.svg -->
                <svg class="navigation-item__icon" aria-hidden="true">...</svg>
                <span class="navigation-item__title">Titel</span>
                <span class="navigation-item__description">Beschreibung</span>
            </a>
        </li>
    </ul>
</nav>
```

### CSS-Aufbau

- Der Abstand zwischen den Einträgen wird über `--navigation-gap` gesteuert.
- Der Block `navigation` stylt nie das Innere eines Eintrags — das gehört in
  den Block `navigation-item` bzw. dessen Modifier.
- Ist eine Trennlinie vorhanden:
  - wird sie als `border-bottom` am `<li>`-Element definiert,
  - wird dafür die Variable `var(--color-ruler)` verwendet.
- Wird die Navigation auf einem farbigen Hintergrund dargestellt, setze die
  Hintergrundfarbe über `--navigation-background-color` (greift am
  `<nav class="navigation">`).
- Die Listenpunkte haben kein vertikales Padding — der gesamte Platz gehört
  dem Eintrag.
