# Navigation

## Beschreibung
Die `<co:navigation>`-Komponente rendert ein `<nav>`-Element mit der Klasse `navigation` als Container für Navigationsinhalte, z. B. eine Überschrift und eine Linkliste. Der zugängliche Name der Navigation wird je nach Konfiguration über `aria-label` (unsichtbarer Titel) oder über `aria-labelledby` (Verweis auf eine sichtbare Überschrift) gesetzt.

- `aria-label="{title}"` wird ausgegeben, wenn `titleType` = `100` ist (Standard), `title` leer ist oder keine `id` gesetzt ist.
- `aria-labelledby="{id}"` wird ausgegeben, wenn `title`, `id` und ein `titleType` ungleich `100` gesetzt sind. Die Überschrift mit dieser ID wird in der Regel über `<co:navigation.title>` erzeugt.

## Aufruf
```html
<co:navigation title="Hauptnavigation">
    ...
</co:navigation>
```

## Parameter
| Parameter   | Typ    | Pflicht | Standard | Beschreibung |
|-------------|--------|---------|----------|--------------|
| `variant`   | string | nein    | –        | Modifier, z. B. `"footer"` → `navigation--footer` |
| `class`     | string | nein    | –        | Zusätzliche CSS-Klassen für das `<nav>`-Element |
| `title`     | string | nein    | –        | Titel der Navigation; wird als `aria-label` ausgegeben, falls kein `aria-labelledby` verwendet wird |
| `titleType` | int    | nein    | `100`    | `100` = Titel nur als `aria-label`; jeder andere Wert = sichtbare Überschrift, Verweis per `aria-labelledby` |
| `id`        | string | nein    | –        | ID der sichtbaren Überschrift für `aria-labelledby` |

## Slot
| Slot          | Beschreibung |
|---------------|--------------|
| Standard-Slot | Inhalt der Navigation, z. B. `<co:navigation.title>` und eine Liste mit `<co:navigation.list.item>` |

## Beispiele

### Navigation mit unsichtbarem Titel
```html
<co:navigation title="Hauptnavigation">
    <ul class="navigation-list">
        <li class="navigation-list__item">
            <co:navigation.list.item link="t3://page?uid=1">Startseite</co:navigation.list.item>
        </li>
    </ul>
</co:navigation>
```

### Navigation mit sichtbarer Überschrift
```html
<co:navigation title="Mehr zum Thema" titleType="2" id="nav-related">
    <co:navigation.title id="nav-related" type="2">Mehr zum Thema</co:navigation.title>
    <ul class="navigation-list">
        <li class="navigation-list__item">
            <co:navigation.list.item link="t3://page?uid=12">Unterseite</co:navigation.list.item>
        </li>
    </ul>
</co:navigation>
```

### Variante und zusätzliche Klasse
```html
<co:navigation variant="footer" class="page__footer-navigation" title="Footer-Navigation">
    ...
</co:navigation>
```

## Verwendung mit TYPO3-Daten

### Menü-Inhaltselement mit `menuProcessor`
Die Überschrift des Inhaltselements dient als Titel. Ist sie verborgen
(`header_layout` = `100`), wird sie nur als `aria-label` ausgegeben.

```html
<f:variable name="id">navigation-{data.uid}</f:variable>

<co:navigation title="{data.header}" titleType="{data.header_layout}" id="{id}">
    <co:navigation.title id="{id}" type="{data.header_layout}">{data.header}</co:navigation.title>
    <ul class="navigation-list">
        <f:for each="{menu}" as="page">
            <li class="navigation-list__item">
                <co:navigation.list.item link="{page.link}" current="{page.current}">{page.title}</co:navigation.list.item>
            </li>
        </f:for>
    </ul>
</co:navigation>
```
