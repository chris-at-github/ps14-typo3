---
paths:
  - "packages/*/Resources/Private/Assets/Scss/**/_button*.scss"
  - "packages/*/Resources/Private/Components/Button.html"
  - "packages/*/Resources/Private/Components/Button/**"
---

# Buttons

## Allgemeine Regeln

- Buttons kann es in verschiedenen Varianten geben.
- Buttons sind nach der BEM-Logik aufgebaut.
- Für Abweichungen dürfen Modifier verwendet werden: `.button .button--feature`.
- Diese Komponente gibt die übliche Struktur von Buttons wieder. Wenn ein
  Aufbau zu sehr davon abweicht, erstelle einen eigenen Block.

## HTML-Regeln

- Buttons dürfen aus folgenden HTML-Tags bestehen: `<button>`, `<a>`.
- CSS-Klassen:
  - Farb- und Darstellungsregeln werden per `.button .button--feature` oder
    `.button .button--brand` geregelt.
  - CSS-Klassen aus anderen Blöcken dürfen ebenfalls verwendet werden.
- Icon-Buttons = reiner Icon-Button ohne Text:
  - Die Klassenstruktur ist `.button .button--icon`.
  - Icon-Buttons nutzen die Eigenschaften und Farbvarianten der Buttons, z. B.
    `.button .button--primary .button--icon`.
  - Das Icon wird wie beim Button als SVG-Element eingebunden.
  - Das SVG erhält die Klasse `.button__icon`.
  - Der Button benötigt zusätzlich das Attribut `aria-label` mit einer
    sinnvollen Beschreibung, damit er für Screenreader zugänglich ist.
- Buttons mit Icon und Text erhalten je nach Position des Icons den Modifier
  `.button--icon-prefix` (Icon vor dem Text) oder `.button--icon-suffix`
  (Icon nach dem Text).

## SCSS-Regeln

- Hover-, Fokus- und Disabled-Zustände nach
  [interaction-states.md](../interaction-states.md):
  - Hover-Selektor für jede Button-Variante, z. B. `.button--primary:hover`.
  - Fokus-Selektor für jede Button-Variante, z. B.
    `.button--primary:focus-visible`.
  - Sinnvoller Disabled-Style; wenn sinnvoll, für alle Buttons gemeinsam.
- Wenn ein Button ein Icon enthält:
  - wird der Abstand zwischen Icon und Text per `gap` definiert (nicht per
    `margin`),
  - wird die Größe des Icons in REM-Einheiten definiert.
- Wenn im Design kein Border-Style definiert ist, setze `border: 0`.

## HTML-Beispiele

### Einfacher Button (Default)

```html
<button class="button button--default">Lorem ipsum</button>
```

### Primary Button

```html
<button class="button button--primary">Primary Lorem ipsum</button>
```

### Link-Button

```html
<a href="#" class="button button--primary">Primary Lorem ipsum</a>
```

### Button mit Icon

```html
<button class="button button--primary button--icon-suffix">
    Primary Lorem ipsum
    <!-- arrow-right.svg -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" class="button__icon" aria-hidden="true">
        <path d="M6 16H26M26 16L18 8M26 16L18 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</button>
```

### Button nur mit Icon

```html
<button class="button button--primary button--icon" aria-label="Lorem ipsum">
    <!-- arrow-right.svg -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" class="button__icon" aria-hidden="true">
        <path d="M6 16H26M26 16L18 8M26 16L18 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</button>
```

## Gruppen

- Gibt es eine Auflistung von Buttons, erstelle eine Button-Gruppe.
- Je nach Einsatzzweck darf ein eigener Modifier verwendet werden.
- Setze den Button NIE direkt auf das `<li>`-Tag.
- Wenn Buttons den verfügbaren Platz gleichmäßig aufteilen sollen (z. B. je
  50 %), setze `flex: 1` auf `.button-group__item` und `width: 100%` auf
  `.button` — dies geschieht im Modul-SCSS, nicht in `_button.scss`.
- Die Button-Gruppe ist immer nach diesem HTML-Gerüst aufgebaut:

```html
<ul class="button-group button-group--modifier">
    <li class="button-group__item">
        <!-- Button-HTML -->
    </li>
    <li class="button-group__item">
        <!-- Button-HTML -->
    </li>
</ul>
```
