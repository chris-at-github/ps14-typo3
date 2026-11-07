---
paths:
  - "packages/*/Resources/Private/Assets/Scss/**/_navigation*.scss"
  - "packages/*/Resources/Private/Components/NavigationList.html"
  - "packages/*/Resources/Private/Components/NavigationList/**"
---

# Navigation List

Linklisten, z. B. Sitemap, Auflistung interner Links, „Mehr zum Thema“.

## Navigation Link

### HTML-Aufbau

- Wird als `<a>`-Element mit der Klasse `navigation-list__link` dargestellt.
- Das `<a>`-Element enthält den Linktext und optional ein Icon.
- Ist ein Icon vorhanden, wird es als SVG-Element mit der Klasse
  `navigation-list__link-icon` innerhalb des `<a>`-Elements hinzugefügt.
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
- Die Links werden auf verschiedenen Hintergrundfarben dargestellt. Definiere
  die Farben über CSS-Variablen, damit sie leicht austauschbar sind.
- Ist ein Icon vorhanden:
  - wird die Ausrichtung über `display: flex` und `gap` gesteuert,
  - wird der Puffer zwischen Text und Icon per `gap` gesetzt.

## Navigation List

### HTML-Aufbau

- Die Navigation List liegt in einem `<nav>`-Tag mit der Klasse `navigation`.
  - Das `<nav>`-Tag erhält ein `aria-label`, um die Navigation für
    Screenreader zugänglich zu machen.
- Die Liste ist ein `<ul>`-Element mit der Klasse `navigation-list`.
- Jeder Listeneintrag ist ein `<li>`-Element mit der Klasse
  `navigation-list__item`.

### CSS-Aufbau

- Ist eine Trennlinie vorhanden:
  - wird sie als `border-bottom` am `<li>`-Element definiert,
  - wird dafür die Farb-Variable für Trennlinien verwendet (siehe
    [scss.md](../scss.md#design-tokens)).
- Wird die Liste auf einem farbigen Hintergrund dargestellt, definiere die
  Hintergrundfarbe über eine CSS-Variable, damit sie leicht austauschbar ist.
- Die Listenpunkte haben kein vertikales Padding — der gesamte Platz gehört
  dem Link.
