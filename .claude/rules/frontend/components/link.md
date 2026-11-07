---
paths:
  - "packages/*/Resources/Private/Assets/Scss/**/_link*.scss"
  - "packages/*/Resources/Private/Components/Link.html"
  - "packages/*/Resources/Private/Components/Link/**"
---

# Links

## Allgemeine Regeln

- Links sind nach der BEM-Logik aufgebaut.
- Für Abweichungen dürfen Modifier verwendet werden: `.link .link--readmore`.
- Diese Komponente gibt die übliche Struktur von Links wieder. Wenn ein Aufbau
  zu sehr davon abweicht, erstelle einen eigenen Block.

## HTML-Regeln

- Links bestehen aus dem HTML-Tag `<a>`.
- CSS-Klassen:
  - Farb- und Darstellungsregeln werden per `.link .link--important`
    geregelt.
  - CSS-Klassen aus anderen Blöcken dürfen ebenfalls verwendet werden.
- Enthält ein Link ein Icon:
  - füge je nach Position den Modifier `.link--icon-prefix` oder
    `.link--icon-suffix` hinzu; das Icon wird an der entsprechenden Stelle im
    Markup platziert und muss nicht per CSS positioniert werden,
  - binde das Icon als Inline-SVG ein und erweitere es um die Klasse
    `.link__icon`.

## SCSS-Regeln

- Setze die Regeln nie direkt auf das `a`-Tag. **Verwende immer die
  CSS-Klasse `.link`.** Alle Regeln werden über `.link` oder einen Modifier
  definiert.
- Standard-Links erben die Schrifteigenschaften vom Body. Verzichte auf
  `font-size`, `font-family` und `line-height`.
- Links sind standardmäßig unterstrichen. Setze `text-decoration` bereits im
  `.link`-Block.
- Implementiere für den Standard-Link immer eine Variante `.link--default`.
- Hover- und Fokus-Zustände nach
  [interaction-states.md](../interaction-states.md):
  - Hover-Selektor für jede Link-Variante, z. B. `.link--default:hover`.
  - Fokus-Selektor für jede Link-Variante, z. B.
    `.link--default:focus-visible`.
- Links werden je nach Kontext eingefärbt. Binde alle Farbwerte über
  CSS-Variablen ein, damit sie je nach Kontext leicht überschrieben werden
  können:
  - Linkfarbe `--link-color` und Hover-Farbe `--link-color-hover`
  - Farbe der Textdekoration `--link-decoration-color` und deren Hover-Farbe
    `--link-decoration-color-hover`
  - Icon-Farbe `--link-icon-color`

## HTML-Beispiele

### Einfacher Link (Default)

```html
<a href="#" class="link link--default">Lorem ipsum</a>
```

### Link mit Prefix-Icon

```html
<a href="#" class="link link--external link--icon-prefix">
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="link__icon" viewBox="0 0 16 16" aria-hidden="true">
        <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
        <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
    </svg>
    Zur Website
</a>
```
