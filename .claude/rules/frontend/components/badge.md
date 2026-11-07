---
paths:
  - "packages/*/Resources/Private/Assets/Scss/**/_badge*.scss"
  - "packages/*/Resources/Private/Components/Badge.html"
  - "packages/*/Resources/Private/Components/Badge/**"
---

# Badges

## Allgemeine Regeln

- Badges kann es in verschiedenen Varianten geben.
- Andere Bezeichnungen sind Pills, Tags usw. Erstelle daraus, falls nötig,
  eine Variante (Modifier).
- Badges sind nach der BEM-Logik aufgebaut.
- Für Abweichungen dürfen Modifier verwendet werden: `.badge .badge--feature`.
- Diese Komponente gibt die übliche Struktur von Badges wieder. Wenn ein
  Aufbau zu sehr davon abweicht, erstelle einen eigenen Block.

## HTML-Regeln

- Badges dürfen aus folgenden HTML-Tags bestehen: `<button>`, `<a>`, `<span>`.
- Tag-Wahl:
  - Ist der Badge ein Link, verwende `<a>`.
  - Ist der Badge nur für die Anzeige relevant, verwende `<span>`.
  - Führt der Badge eine Aktion auf der Seite aus (z. B. Entfernen eines
    Filtereintrags), verwende `<button>`.
- CSS-Klassen:
  - Farb- und Darstellungsregeln werden per `.badge .badge--pill` oder
    `.badge .badge--brand` geregelt.
  - CSS-Klassen aus anderen Blöcken dürfen ebenfalls verwendet werden.
  - Ist der Badge interaktiv (`<button>`, `<a>`), füge den Modifier
    `.badge--interactive` hinzu. Nur auf diesem Modifier darf ein Hover- und
    Fokus-Style definiert werden.
  - **WICHTIG:** `.badge--interactive` darf **ausschließlich** auf den Tags
    `<a>` und `<button>` verwendet werden. Auf `<span>` ist dieser Modifier
    **verboten**.
- Enthält ein Badge ein Icon:
  - füge je nach Position den Modifier `.badge--icon-prefix` (Icon vor dem
    Text) oder `.badge--icon-suffix` (Icon nach dem Text) hinzu,
  - binde das Icon als Inline-SVG ein und erweitere es um die Klasse
    `.badge__icon`,
  - wird der Abstand zwischen Icon und Text per `gap` definiert (nicht per
    `margin`).

## SCSS-Regeln

- Im `.badge`-Block werden `border: 0` und `background: transparent` als Basis
  gesetzt — außer im Design ist ein `background` oder `border` definiert. In
  diesem Fall überschreiben die Farb-Modifier (z. B. `--primary`,
  `--secondary`, `--neutral`) diese Werte explizit.
- Hover-, Fokus- und Disabled-Zustände nach
  [interaction-states.md](../interaction-states.md):
  - Hover-Selektor für jede Badge-Variante, nur in Verbindung mit
    `.badge--interactive`, z. B. `.badge--interactive.badge--primary:hover`.
  - Fokus-Selektor für jede Badge-Variante, nur in Verbindung mit
    `.badge--interactive`, z. B.
    `.badge--interactive.badge--primary:focus-visible`.
  - Sinnvoller Disabled-Style; wenn sinnvoll, für alle Badges gemeinsam.

## HTML-Beispiele

### Einfacher Badge (Default)

```html
<span class="badge badge--default">Lorem ipsum</span>
```

### Primary Badge (Button)

```html
<button class="badge badge--interactive badge--primary">Primary Lorem ipsum</button>
```

### Link-Badge

```html
<a href="#" class="badge badge--interactive badge--primary">Primary Lorem ipsum</a>
```

### Einfacher Badge mit Prefix-Icon

```html
<span class="badge badge--default badge--icon-prefix">
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="badge__icon" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334q.002-.211-.006-.422A6.7 6.7 0 0 0 16 3.542a6.7 6.7 0 0 1-1.889.518 3.3 3.3 0 0 0 1.447-1.817 6.5 6.5 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.32 9.32 0 0 1-6.767-3.429 3.29 3.29 0 0 0 1.018 4.382A3.3 3.3 0 0 1 .64 6.575v.045a3.29 3.29 0 0 0 2.632 3.218 3.2 3.2 0 0 1-.865.115 3 3 0 0 1-.614-.057 3.28 3.28 0 0 0 3.067 2.277A6.6 6.6 0 0 1 .78 13.58a6 6 0 0 1-.78-.045A9.34 9.34 0 0 0 5.026 15"/>
    </svg>
    Primary Lorem ipsum
</span>
```

### Badge zum Schließen (Button)

```html
<button class="badge badge--interactive badge--icon-suffix">
    Close
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="badge__icon" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>
</button>
```

## Gruppen

- Gibt es eine Auflistung von Badges, erstelle eine Badge-Gruppe.
- Je nach Einsatzzweck darf ein eigener Modifier verwendet werden.
- Setze den Badge **NIE** direkt auf das `<li>`-Tag.
- Die Badge-Gruppe ist immer nach diesem HTML-Gerüst aufgebaut:

```html
<ul class="badge-group badge-group--modifier">
    <li class="badge-group__item">
        <!-- Badge-HTML -->
    </li>
    <li class="badge-group__item">
        <!-- Badge-HTML -->
    </li>
</ul>
```
