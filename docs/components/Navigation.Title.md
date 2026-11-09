# Navigation.Title

## Beschreibung
Die `<co:navigation.title>`-Komponente rendert die sichtbare Überschrift einer Navigation über `<co:heading>`. Über die `id` kann `<co:navigation>` per `aria-labelledby` auf die Überschrift verweisen.

- Ist der Slot leer oder `type` = `100` (Standard), wird nichts ausgegeben.
- Ohne `layout` wird die Überschrift direkt als `<co:heading>` mit `id` und `class` ausgegeben.
- Mit `layout` wird die Überschrift in einen Wrapper `<div class="heading heading--layout-{layout}">` gesetzt; das Heading erhält die Klasse `heading__main`. `id`, `class` und der Modifier aus `variant` liegen dann am Wrapper.

## Aufruf
```html
<co:navigation.title type="2">Überschrift</co:navigation.title>
```

## Parameter
| Parameter | Typ    | Pflicht | Standard | Beschreibung |
|-----------|--------|---------|----------|--------------|
| `type`    | int    | nein    | `100`    | Überschriften-Typ: `0` = `<div>`, `1`–`6` = `<h1>`–`<h6>`; `100` = keine Ausgabe |
| `layout`  | string | nein    | –        | Layout-Variante, z. B. `"2"` → `heading--layout-2`; aktiviert den Wrapper `div.heading` |
| `variant` | string | nein    | –        | Modifier, z. B. `"primary"` → `heading--primary` (nur zusammen mit `layout`) |
| `class`   | string | nein    | –        | Zusätzliche CSS-Klassen |
| `id`      | string | nein    | –        | ID der Überschrift, z. B. für `aria-labelledby` von `<co:navigation>` |

## Slot
| Slot          | Beschreibung |
|---------------|--------------|
| Standard-Slot | Text der Überschrift |

## Beispiele

### Einfache Überschrift
```html
<co:navigation.title type="2">Mehr zum Thema</co:navigation.title>
```

### Überschrift mit Layout und Variante
```html
<co:navigation.title type="2" layout="3" variant="primary">Mehr zum Thema</co:navigation.title>
```

### Überschrift als Bezug für `aria-labelledby`
```html
<co:navigation title="Mehr zum Thema" titleType="2" id="nav-related">
    <co:navigation.title id="nav-related" type="2">Mehr zum Thema</co:navigation.title>
    ...
</co:navigation>
```

## Verwendung mit TYPO3-Daten

### Überschrift eines Menü-Inhaltselements
`header_layout` = `100` (verborgen) unterdrückt die Ausgabe automatisch.

```html
<co:navigation.title id="navigation-{data.uid}" type="{data.header_layout}">{data.header}</co:navigation.title>
```
