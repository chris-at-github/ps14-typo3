# Card/Image

## Beschreibung
Die Komponente `<co:card.image>` rendert den Bildbereich einer Card-Komponente. Sie unterstützt sowohl Bild-Objekte (responsive mit srcset) als auch Icons (voller EXT-Pfad zur SVG-Datei). Wird weder `image` noch `icon` übergeben, wird kein HTML ausgegeben.

## Aufruf
```html
<co:card.image image="{image}" />
<co:card.image icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/check.svg" />
```

## Parameter
| Parameter      | Typ    | Pflicht | Standard | Beschreibung |
|----------------|--------|---------|----------|--------------|
| `image`        | object | nein    | –        | Bild-Objekt, das ausgegeben werden soll |
| `icon`         | string | nein    | –        | Voller EXT-Pfad zur SVG-Datei (z. B. `EXT:ps14_site/Resources/Private/Assets/Svg/Embed/check.svg`); eingebettet über `fo:svg.inline` |
| `variant`      | string | nein    | –        | Variante, z.B. `"primary"` – wird als CSS-Modifier gesetzt |
| `class`        | string | nein    | –        | Zusätzliche CSS-Klassen für den äußeren Wrapper-Container |
| `ratio`        | string | nein    | –        | Seitenverhältnis für den Bild- oder Icon-Container, z.B. `"16-9"` oder `"1-1"` |
| `imageOptions` | array  | nein    | –        | Optionen für das responsive Bild (siehe unten) |

### imageOptions
| Key        | Typ     | Standard                          | Beschreibung |
|------------|---------|-----------------------------------|--------------|
| `width`    | integer | `540`                             | Maximale Bildbreite in Pixeln |
| `priority` | string  | `"low"`                           | Ladepriorität: `"high"` oder `"low"` |
| `sizes`    | array   | `{0: 360, 1: 480, 2: 640, 3: 1024}` | Srcset-Größen als numerisches Array |

## Beispiele

### Bild ausgeben
```html
<co:card.image image="{image}" />
```

### Icon ausgeben
```html
<co:card.image icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/calendar.svg" />
```

### Mit Variante und eigener Klasse
```html
<co:card.image image="{image}" variant="primary" class="my-custom-class" />
```

### Mit Seitenverhältnis
```html
<co:card.image image="{image}" ratio="16-9" />
<co:card.image icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/check.svg" ratio="1-1" />
```

### Mit imageOptions
```html
<co:card.image image="{image}" imageOptions="{width: 800, priority: 'low', sizes: {0: 480, 1: 640, 2: 1024, 3: 1440}}" />
```

## Verwendung mit TYPO3-Daten

### Bild aus Content-Block
```html
<f:if condition="{data.image.0}">
    <co:card.image image="{data.image.0}" imageOptions="{width: 480, priority: 'high'}" />
</f:if>
```

### Eingebettet in eine Card
```html
<co:card variant="primary" url="{page.link}">
    <co:card.image image="{data.image.0}" ratio="16-9" />
</co:card>
```

### Icon-Variante in einer Card
```html
<co:card variant="primary" url="#">
    <co:card.image icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/calendar.svg" />
</co:card>
```
