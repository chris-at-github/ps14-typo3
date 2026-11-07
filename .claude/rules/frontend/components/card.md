---
paths:
  - "packages/*/Resources/Private/Assets/Scss/**/_card*.scss"
  - "packages/*/Resources/Private/Components/Card.html"
  - "packages/*/Resources/Private/Components/Card/**"
---

# Cards

## Allgemeine Regeln

- Cards kann es in verschiedenen Varianten geben.
- Cards sind nach der BEM-Logik aufgebaut.
- Für Abweichungen dürfen Modifier verwendet werden: `.card .card--feature`.
- Diese Komponente gibt die übliche Struktur von Cards wieder. Wenn ein Aufbau
  zu sehr davon abweicht, erstelle einen eigenen Block.
- Die Elemente der Card müssen nicht alle verwendet werden.
- Falls nötig, dürfen eigene Elemente hinzugefügt werden.

## HTML-Regeln

- Ist eine Card nicht verlinkt, lautet der Aufbau `<div class="card">`.
- Ist eine Card verlinkt, lautet der Aufbau
  `<a href="#" class="card card--interactive">`.
  - Die Card darf dann keine weiteren Links oder Buttons enthalten.
- Verwende, wenn möglich, Überschriften für die Cards.
  - Setze den Style für Überschriften immer per Klasse und nicht direkt auf
    das H-Tag.
  - Achte auf die semantische Reihenfolge `<h1>`, `<h2>`, `<h3>`, `<h4>`,
    `<h5>`.
- CSS-Klassen:
  - Farb- und Darstellungsregeln werden per `.card .card--feature` oder
    `.card .card--brand` geregelt.
  - CSS-Klassen aus anderen Blöcken dürfen ebenfalls verwendet werden.

## SCSS-Regeln

- **Falls eine Card verlinkt ist**, Hover- und Fokus-Zustände nach
  [interaction-states.md](../interaction-states.md):
  - Hover-Selektor `.card--interactive:hover`.
  - Fokus-Selektor `.card--interactive:focus-visible`.

## Bilder und Icons

- Bilder und Icons werden immer in den Image-Container
  `<div class="card__image">` eingebunden.
- Falls nötig, darf der Image-Container auch unter dem Card-Body liegen.
- Bei einem Icon: `<div class="card__image card__image--icon">`.
- Bei einem Bild: `<div class="card__image card__image--picture">`.

## HTML-Beispiele

### Einfache Card

```html
<div class="card">
    <div class="card__body">
        <h2 class="card__title">Quisque faucibus ex sapien vitae</h2>
        <div class="card__description richtext">
            <p>Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.</p>
        </div>
    </div>
</div>
```

### Verlinkte Card

```html
<a href="#" class="card card--interactive">
    <div class="card__body">
        <h2 class="card__title">Quisque faucibus ex sapien vitae</h2>
        <div class="card__description richtext">
            <p>Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.</p>
        </div>
    </div>
</a>
```

### Komplexe Card

```html
<div class="card">
    <div class="card__image card__image--picture"><img src="bild.jpg" alt="Bild"></div>
    <div class="card__body">
        <h2 class="card__title">Quisque faucibus ex sapien vitae</h2>
        <div class="card__description richtext">
            <p>Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.</p>
        </div>
    </div>
    <div class="card__actions">
        <button class="button card__action">Lorem fringilla</button>
        <button class="button card__action">Aenean sed diam</button>
    </div>
</div>
```

## Gruppen

- Gibt es eine Auflistung von Cards, erstelle eine Card-Gruppe.
- Je nach Einsatzzweck darf ein eigener Modifier verwendet werden.
- Setze die Card NIE direkt auf das `<li>`-Tag.
- Die Card-Gruppe ist immer nach diesem HTML-Gerüst aufgebaut:

```html
<ul class="card-group card-group--modifier">
    <li class="card-group__item">
        <!-- Card-HTML -->
    </li>
    <li class="card-group__item">
        <!-- Card-HTML -->
    </li>
</ul>
```
