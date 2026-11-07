# Button

## Beschreibung
Die `<co:button>`-Komponente rendert einen HTML-`<button>`-Tag mit optionalen Icons vor und/oder nach dem Button-Text. Die Variante bestimmt die CSS-Modifier-Klasse.

## Aufruf
```html
<co:button>Buttontext</co:button>
```

## Parameter
| Parameter | Typ | Pflicht | Beschreibung |
|-----------|-----|---------|--------------|
| `variant` | string | nein | Button-Variante, z.B. `default`, `primary` – wird als CSS-Modifier `button--{variant}` gesetzt |
| `type` | string | nein | HTML-Attribut `type` des Buttons, z.B. `button`, `submit`, `reset` – Standard: `button` |
| `prefixIcon` | string | nein | Voller EXT-Pfad zur SVG-Datei (z. B. `EXT:ps14_site/Resources/Private/Assets/Svg/Embed/check.svg`) – wird vor dem Button-Text angezeigt |
| `suffixIcon` | string | nein | Voller EXT-Pfad zur SVG-Datei (z. B. `EXT:ps14_site/Resources/Private/Assets/Svg/Embed/arrow-right.svg`) – wird nach dem Button-Text angezeigt |
| `disabled` | boolean | nein | Deaktiviert den Button (`disabled="disabled"`) |
| `id` | string | nein | Optionale HTML-ID des Buttons |
| `class` | string | nein | Optionale zusätzliche CSS-Klassen |
| `url` | string | nein | Optionale URL – wird als `<f:link.typolink>`-Link gerendert statt als `<button>` |
| `ariaLabel` | string | nein | Setzt `aria-label` auf das Button-/Link-Element – ergänzt bzw. überschreibt den zugänglichen Namen (z.B. bei generischem Text wie "Weiterlesen"). Wird nur gerendert, wenn ein Wert übergeben wird |

## Beispiele

### Standard-Button
```html
<co:button>Button</co:button>
```

### Primär-Button
```html
<co:button variant="primary">Primär</co:button>
```

### Deaktivierter Button
```html
<co:button variant="default" disabled="true">Deaktiviert</co:button>
```

### Button mit Prefix-Icon
```html
<co:button variant="default" prefixIcon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/star-fill.svg">Favorit</co:button>
```

### Button mit Suffix-Icon
```html
<co:button variant="default" suffixIcon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/arrow-right.svg">Weiter</co:button>
```

### Button als Link
```html
<co:button variant="primary" url="t3://page?uid=1">Zur Startseite</co:button>
```

### Button mit aria-label
```html
<co:button variant="primary" url="https://example.com" ariaLabel="Weitere Informationen zur Veranstaltung, öffnet in neuem Tab">
    Weitere Informationen
</co:button>
```

---

# Button Icon

## Beschreibung
Die `<co:button.icon>`-Komponente rendert einen HTML-`<button>`-Tag, der ausschließlich ein Icon enthält (kein Text). Geeignet für Icon-only-Buttons mit Aria-Label für Barrierefreiheit.

## Aufruf
```html
<co:button.icon icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/check.svg" label="Bestätigen" />
```

## Parameter
| Parameter | Typ | Pflicht | Beschreibung |
|-----------|-----|---------|--------------|
| `icon` | string | nein | Voller EXT-Pfad zur SVG-Datei (z. B. `EXT:ps14_site/Resources/Private/Assets/Svg/Embed/check.svg`) – wird im Button angezeigt |
| `variant` | string | nein | Button-Variante, z.B. `default`, `primary` – wird als CSS-Modifier `button--{variant}` gesetzt |
| `type` | string | nein | HTML-Attribut `type` des Buttons, z.B. `button`, `submit`, `reset` – Standard: `button` |
| `disabled` | boolean | nein | Deaktiviert den Button (`disabled="disabled"`) |
| `label` | string | nein | Aria-Label für den Button (für Barrierefreiheit) |
| `id` | string | nein | Optionale HTML-ID des Buttons |
| `class` | string | nein | Optionale zusätzliche CSS-Klassen |

## Beispiele

### Standard Icon-Button
```html
<co:button.icon icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/star-fill.svg" label="Favorit" />
```

### Primärer Icon-Button
```html
<co:button.icon variant="primary" icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/star-fill.svg" label="Button Star" />
```

### Deaktivierter Icon-Button
```html
<co:button.icon variant="default" icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/check.svg" label="Bestätigen" disabled="true" />
```

### Submit Icon-Button
```html
<co:button.icon icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/check.svg" label="Absenden" type="submit" />
```

## Verwendung mit TYPO3-Daten
```html
<co:button variant="{data.buttonVariant}" prefixIcon="{data.icon}">
    {data.buttonLabel}
</co:button>
```

Mit URL aus Content-Block:
```html
<co:button variant="primary" url="{data.link}">
    {data.buttonLabel}
</co:button>
```
