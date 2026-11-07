# Badge

## Beschreibung
Die `<co:badge>`-Komponente stellt ein vielseitiges Label-Element bereit, das als statisches `<span>`, als anklickbarer Link (`<a>`) oder als interaktiver Button (`<button>`) gerendert werden kann. Badges eignen sich für Statusanzeigen, Tags, Filter-Chips oder Highlights. Optional können Prefix- und Suffix-Icons eingebunden werden.

## Aufruf

```html
<co:badge variant="default">Badge-Text</co:badge>
```

## Parameter

| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `variant` | string | nein | `default` | Bestimmt die Badge-Variante und setzt die CSS-Modifier-Klasse, z. B. `badge--primary` |
| `class` | string | nein | – | Optionale zusätzliche CSS-Klassen für das Badge-Element |
| `url` | string | nein | – | Link-URL – macht die Badge zu einem `<a>`-Element |
| `rendering` | string | nein | `span` | Steuert das Ausgabe-Tag: `"button"` für `<button>`, sonst `<span>` |
| `disabled` | boolean | nein | `false` | Deaktiviert den Button (nur wirksam bei `rendering="button"`) |
| `prefixIcon` | string | nein | – | Voller EXT-Pfad zur SVG-Datei (z. B. `EXT:ps14_site/Resources/Private/Assets/Svg/Embed/check.svg`), wird vor dem Badge-Text angezeigt |
| `suffixIcon` | string | nein | – | Voller EXT-Pfad zur SVG-Datei (z. B. `EXT:ps14_site/Resources/Private/Assets/Svg/Embed/close.svg`), wird nach dem Badge-Text angezeigt |

## Beispiele

### Standard-Badge (span)
```html
<co:badge variant="default">Standard</co:badge>
```

### Badge als Link
```html
<co:badge variant="primary" url="/kategorie/news">News</co:badge>
```

### Badge als Button
```html
<co:badge variant="default" rendering="button">Klickbar</co:badge>
```

### Deaktivierter Button
```html
<co:badge variant="default" rendering="button" disabled="true">Deaktiviert</co:badge>
```

### Badge mit Prefix-Icon
```html
<co:badge variant="success" rendering="button" prefixIcon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/check.svg">Bestätigt</co:badge>
```

### Badge mit Suffix-Icon (z. B. Schließen-Button)
```html
<co:badge variant="default" rendering="button" suffixIcon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/close.svg">Filter</co:badge>
```

### Badge mit Prefix- und Suffix-Icon
```html
<co:badge variant="primary" prefixIcon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/star.svg" suffixIcon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/close.svg">Favorit</co:badge>
```

## Verwendung mit TYPO3-Daten

### Kategorien als Badges ausgeben
```html
<f:for each="{categories}" as="category">
    <co:badge variant="default" url="{category.link}">{category.title}</co:badge>
</f:for>
```

### Badge-Variante aus Content-Block-Feld
```html
<co:badge variant="{data.badge_variant}">{data.badge_label}</co:badge>
```

### Dynamisches Icon aus Fluid-Variable
```html
<co:badge variant="primary" prefixIcon="{data.icon_path}">{data.label}</co:badge>
```
