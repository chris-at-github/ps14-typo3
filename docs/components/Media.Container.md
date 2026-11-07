# Media/Container

## Beschreibung
Die `<co:media.container>`-Komponente rendert ein Bild oder Video mit responsivem Verhalten, optionaler Bildbeschreibung und Copyright-Angabe. Das Seitenverhältnis kann über `ratio` gesteuert werden. Der Ausgabe-Typ (Bild oder Video) wird über `rendering` gesteuert. Wird `url` übergeben, verlinkt das Bild per TypoLink; Videos werden nie verlinkt.

## Aufruf
```html
<co:media.container media="{image}" />
```

## Parameter
| Parameter     | Typ     | Pflicht | Standard | Beschreibung                                                             |
|---------------|---------|---------|----------|--------------------------------------------------------------------------|
| `media`       | object  | ja      | –        | Bild- oder Video-Objekt (FileReference, File)                            |
| `rendering`   | string  | nein    | `picture` | Ausgabe-Typ: `"picture"` für Bilder, `"video"` für Videos              |
| `variant`     | string  | nein    | –        | Variante als Modifier, z.B. `"primary"` → `media-container--primary`     |
| `class`       | string  | nein    | –        | Zusätzliche CSS-Klassen für das Container-`<div>`-Element                |
| `mediaClass`  | string  | nein    | –        | Zusätzliche CSS-Klassen direkt am `<img>`-Tag (ergänzt `media-container__source`) |
| `ratio`       | string  | nein    | –        | Seitenverhältnis, z.B. `"16-9"`, `"1-1"` → `media-container--ratio-16-9` |
| `priority`    | string  | nein    | `low`    | Ladepriorität des Bildes. `"high"` priorisiert das Bild als LCP-Element  |
| `width`       | int     | nein    | `810`    | Maximale Breite des Bildes in Pixeln                                     |
| `sizes`       | array   | nein    | –        | Responsive Breakpoints für das Bild, z.B. `{0: 360, 1: 480, 2: 640}`     |
| `url`         | string  | nein    | –        | TypoLink (Seiten-UID, URL, `t3://…`). Wenn gesetzt, wird das Bild (nur bei `rendering="picture"`) mit `<f:link.typolink>` und der Klasse `media-container__link` umschlossen |
| `description` | boolean | nein    | `true`   | Bildbeschreibung anzeigen                                                |
| `copyright`   | boolean | nein    | `true`   | Copyright/Quelle anzeigen                                                |

## Beispiele

### Einfache Bildausgabe
```html
<co:media.container media="{image}" />
```

### Mit festem Seitenverhältnis
```html
<co:media.container media="{image}" ratio="16-9" />
```

### Mit Variante und zusätzlicher Klasse
```html
<co:media.container media="{image}" variant="primary" class="my-media" />
```

### Mit zusätzlicher CSS-Klasse am Bild
```html
<co:media.container media="{image}" mediaClass="my-image-class" />
```

### Ohne Beschreibung und Copyright
```html
<co:media.container media="{image}" description="false" copyright="false" />
```

### Mit LCP-Priorisierung und responsiven Breakpoints
```html
<co:media.container media="{image}" priority="high" width="1200" sizes="{0: 360, 1: 480, 2: 640}" />
```

### Als verlinktes Bild (TypoLink)
```html
<co:media.container media="{image}" url="42" />
<co:media.container media="{image}" url="https://www.example.com" />
```

## Verwendung mit TYPO3-Daten
```html
<co:media.container
    media="{data.image.0}"
    ratio="16-9"
    priority="high"
    width="1200"
    sizes="{0: 360, 1: 480, 2: 640}"
/>
```

### Video-Ausgabe
```html
<co:media.container media="{video}" rendering="video" />
```

Mit mehreren Bildern aus einem Content-Block:
```html
<f:for each="{data.images}" as="image">
    <co:media.container media="{image}" ratio="4-3" />
</f:for>
```
