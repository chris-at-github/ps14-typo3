# Heading

## Beschreibung
Die `<co:heading>`-Komponente rendert eine Überschrift als semantisch korrektes HTML-Element (`<h1>`–`<h6>`) oder als `<div>`, gesteuert über den `layout`-Parameter. Optional kann der Inhalt als Link ausgegeben werden. Die Komponente unterstützt Varianten und zusätzliche CSS-Klassen nach dem BEM-Prinzip.

## Aufruf
```html
<co:heading layout="2">Meine Überschrift</co:heading>
```

## Parameter
| Parameter | Typ    | Pflicht | Standard | Beschreibung |
|-----------|--------|---------|----------|--------------|
| `layout`  | int    | nein    | `0`      | Bestimmt das HTML-Tag: `0` = `<div>`, `1`–`6` = `<h1>`–`<h6>` |
| `variant` | string | nein    | –        | Erweitert die CSS-Klasse um einen Modifier, z.B. `"primary"` → `heading--primary` |
| `class`   | string | nein    | –        | Zusätzliche CSS-Klassen für das Heading-Element |
| `id`      | string | nein    | –        | HTML-ID für das Heading-Element |
| `url`     | string | nein    | –        | Wenn gesetzt, wird der Inhalt als `<a>`-Link ausgegeben |

## Beispiele

### Einfache Überschrift als Div (Standard)
```html
<co:heading>Überschrift als Div</co:heading>
```

### Überschrift als H2
```html
<co:heading layout="2">Überschrift als H2</co:heading>
```

### Verlinkte H1-Überschrift
```html
<co:heading layout="1" url="/seite">Verlinkte H1-Überschrift</co:heading>
```

### H3 mit Variante und zusätzlicher Klasse
```html
<co:heading layout="3" variant="primary" class="my-header">H3 mit Klasse</co:heading>
```

### Verlinkte H3 mit TYPO3-Seiten-URL
```html
<co:heading layout="3" url="{f:uri.page(pageUid: 1)}">Verlinkte H3-Überschrift</co:heading>
```

## Verwendung mit TYPO3-Daten

### Layout aus Content-Block-Feld
```html
<co:heading layout="{data.header_layout}">{data.header}</co:heading>
```

### Vollständiges Beispiel mit TYPO3-Content-Block-Daten
```html
<co:heading layout="{data.header_layout}" url="{f:uri.page(pageUid: data.pid)}">
    {data.header}
</co:heading>
```
