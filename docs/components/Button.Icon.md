# Button/Icon

## Beschreibung
Die `<co:button.icon>`-Komponente rendert einen reinen Icon-Button ohne sichtbaren Text. Ein `aria-label` sorgt für Barrierefreiheit. Die Variante bestimmt die CSS-Modifier-Klasse.

## Aufruf
```html
<co:button.icon icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/star-fill.svg" label="Favorit" />
```

## Parameter
| Parameter | Typ | Pflicht | Beschreibung |
|-----------|-----|---------|--------------|
| `icon` | string | nein | Voller EXT-Pfad zur SVG-Datei (z. B. `EXT:ps14_site/Resources/Private/Assets/Svg/Embed/check.svg`) – wird im Button angezeigt, eingebettet über `fo:svg.inline` |
| `variant` | string | nein | Button-Variante, z.B. `default`, `primary` – wird als CSS-Modifier `button--{variant}` gesetzt |
| `disabled` | boolean | nein | Deaktiviert den Button (`disabled="disabled"`) |
| `label` | string | nein | Aria-Label für den Button (für Barrierefreiheit) |
| `type` | string | nein | HTML-Attribut `type` des Buttons, z.B. `button`, `submit`, `reset` – Standard: `button` |
| `id` | string | nein | Optionale HTML-ID des Buttons |
| `class` | string | nein | Optionale zusätzliche CSS-Klassen |

## Beispiele

### Standard Icon-Button
```html
<co:button.icon icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/star-fill.svg" label="Favorit" />
```

### Primär Icon-Button
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
<co:button.icon variant="{data.buttonVariant}" icon="{data.icon}" label="{data.label}" />
```
