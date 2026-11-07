# Richtext

## Beschreibung
Die `<co:richtext>`-Komponente rendert HTML-Inhalte (z.B. aus TYPO3-Datenbankfeldern) in einem `<div>`-Container mit der BEM-Basisklasse `richtext`. Sie unterstützt Varianten, zusätzliche CSS-Klassen sowie zwei Arten der Inhaltsübergabe: als Slot Content oder als `content`-Parameter.

## Aufruf

```html
<co:richtext>Inhalt</co:richtext>
```

## Parameter

| Parameter | Typ    | Pflicht | Standard | Beschreibung |
|-----------|--------|---------|----------|--------------|
| `variant` | string | nein    | –        | Variante der Komponente, z.B. `"primary"` – fügt die Klasse `richtext--primary` hinzu |
| `class`   | string | nein    | –        | Zusätzliche CSS-Klassen für das Richtext-Element |
| `content` | string | nein    | –        | HTML-Inhalt als Parameter – die Komponente übernimmt die Konvertierung intern via `f:format.html` |

## Beispiele

### Einfacher Slot Content
```html
<co:richtext>
    <p>Das ist ein einfacher Richtext-Inhalt.</p>
</co:richtext>
```

### Mit zusätzlicher CSS-Klasse
```html
<co:richtext class="feature__body">
    <p>Inhalt mit zusätzlicher Klasse.</p>
</co:richtext>
```

### Mit Variante
```html
<co:richtext variant="primary">
    <p>Inhalt mit Variante.</p>
</co:richtext>
```

### Mit content-Parameter
```html
<co:richtext content="{data.bodytext}" />
```

## Verwendung mit TYPO3-Daten

### Slot Content mit f:format.html (empfohlen für Fluid-Inline-Syntax)
Wird HTML-Inhalt aus TYPO3-Datenbankfeldern (z.B. `bodytext`) als Slot Content übergeben, muss dieser **vorher** mit `f:format.html()` in HTML umgewandelt werden. Andernfalls wird der Inhalt als reiner Text behandelt und HTML-Tags werden nicht gerendert.

```html
<co:richtext class="feature__body">{data.bodytext -> f:format.html()}</co:richtext>
```

### content-Parameter (Konvertierung intern)
Alternativ kann der Rohinhalt direkt über den `content`-Parameter übergeben werden. Die Komponente übernimmt die Konvertierung via `f:format.html` intern – eine manuelle Vorverarbeitung ist hier **nicht** notwendig.

```html
<co:richtext class="feature__body" content="{data.bodytext}" />
```

### In einer Schleife mit Content-Blocks
```html
<f:for each="{items}" as="item">
    <co:richtext class="list__body" content="{item.bodytext}" />
</f:for>
```
