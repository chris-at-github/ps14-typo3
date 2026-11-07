# Card

## Beschreibung
Die `<co:card>`-Komponente rendert eine Card als `<div>` oder verlinktes `<a>`-Element. Sie unterstützt Varianten, Layouts und drei optionale Slots für Bild, Inhalt und Aktionen.

## Aufruf
```html
<co:card variant="primary" class="teaser-item" url="#">
    Inhalt
</co:card>
```

## Parameter
| Parameter | Typ    | Pflicht | Beschreibung |
|-----------|--------|---------|--------------|
| `variant` | string | nein    | Card-Variante als Modifier, z.B. `"primary"` → `card--primary`, `"feature"` → `card--feature` |
| `layout`  | string | nein    | Layout-Variante als Modifier, z.B. `"horizontal-im-bo-ac"` → `card--layout-horizontal-im-bo-ac` |
| `url`     | string | nein    | Wenn gesetzt, wird die Card als verlinktes `<a>`-Element ausgegeben (`card--interactive`). Eine verlinkte Card darf keine weiteren Links oder Buttons enthalten. |
| `id`      | string | nein    | Optionale ID für die Card |
| `class`   | string | nein    | Zusätzliche CSS-Klassen für die Card |

## Slots
| Slot      | Beschreibung |
|-----------|--------------|
| `image`   | Bild- oder Icon-Komponente, z.B. `<co:card.image />`. Kann direkt als Kind-Element oder über `<f:fragment name="image">` übergeben werden. |
| `body`    | Inhalt der Card, z.B. `<co:header />`, `<co:richtext />` |
| `actions` | Aktions-Buttons, z.B. `<co:button />` |

## Beispiele

### Einfache Card mit Icon
```html
<co:card variant="primary" class="teaser-item" url="#">
    <co:card.image icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/calendar.svg" />
</co:card>
```

### Card mit Bild
```html
<co:card variant="primary" class="teaser-item" url="#">
    <co:card.image image="{data.image.0}" imageOptions="{width: 480, priority: 'high'}" />
</co:card>
```

### Vollständige Card mit allen Slots
```html
<co:card variant="primary" class="teaser-item">
    <f:fragment name="image">
        <co:card.image icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/calendar.svg" />
    </f:fragment>
    <f:fragment name="body">
        <co:header layout="3" class="card__title">Card Titel</co:header>
        <co:richtext class="card__description">
            <p>Beschreibungstext der Card.</p>
        </co:richtext>
    </f:fragment>
    <f:fragment name="actions">
        <co:button class="card__action">Details</co:button>
        <co:button class="card__action">Löschen</co:button>
    </f:fragment>
</co:card>
```

### Weitere Varianten
```html
<co:card variant="feature">...</co:card>
<co:card layout="horizontal-im-bo-ac">...</co:card>
```

## Verwendung mit TYPO3-Daten
```html
<f:for each="{data.items}" as="item">
    <co:card variant="primary" class="teaser-item">
        <f:fragment name="image">
            <co:card.image image="{item.image.0}" imageOptions="{width: 480}" />
        </f:fragment>
        <f:fragment name="body">
            <co:header layout="3" class="card__title">{item.header}</co:header>
            <co:richtext class="card__description">
                {item.description -> f:format.html()}
            </co:richtext>
        </f:fragment>
        <f:fragment name="actions">
            <co:button class="card__action">Mehr erfahren</co:button>
        </f:fragment>
    </co:card>
</f:for>
```
