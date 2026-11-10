# Navigation.List.Item

## Beschreibung
Die `<co:navigation.list.item>`-Komponente rendert einen Eintrag einer Navigation List: das `<li class="navigation-list__item">` mit dem Link `<a class="navigation-list__link">`, optionalem Icon, Titel und optionaler Beschreibung. Der Link wird über `f:link.typolink` erzeugt und unterstützt daher interne, externe, Download- und Anker-Links.

Die Komponente wird immer innerhalb von `<co:navigation.list>` verwendet, die das `<ul class="navigation-list">` rendert.

## Aufruf
```html
<co:navigation.list.item link="t3://page?uid=1">Seitenname</co:navigation.list.item>
```

## Parameter
| Parameter     | Typ    | Pflicht | Standard | Beschreibung |
|---------------|--------|---------|----------|--------------|
| `link`        | string | nein    | –        | Link-Angabe (URL, `t3://`-URI o. ä.), ausgewertet über `f:link.typolink` |
| `target`      | string | nein    | –        | Zielfenster des Links, z. B. `_blank` |
| `current`     | bool   | nein    | –        | Markiert den Link als aktuelle Seite (`aria-current="page"`) |
| `icon`        | mixed  | nein    | –        | Voller EXT-Pfad zur SVG-Datei oder Datei-Referenz (z. B. das Icon einer Seite); eingebettet über `fo:svg.inline` mit der Klasse `navigation-list__icon` |
| `description` | string | nein    | –        | Beschreibung unter dem Titel; wird in `<span class="navigation-list__description">` ausgegeben |
| `class`       | string | nein    | –        | Zusätzliche CSS-Klassen für den Eintrag (`<li>`) |

## Slot
| Slot          | Beschreibung |
|---------------|--------------|
| Standard-Slot | Titel des Links; wird in `<span class="navigation-list__title">` ausgegeben |

## Beispiele

### Interner Link mit Icon
```html
<co:navigation.list.item link="t3://page?uid=1" icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/arrow-right.svg">
    Seitenname
</co:navigation.list.item>
```

### Externer Link in neuem Fenster
```html
<co:navigation.list.item link="https://example.com" target="_blank">Externe Seite</co:navigation.list.item>
```

### Eintrag mit Beschreibung
```html
<co:navigation.list.item link="t3://page?uid=12" description="Kurzer Text zur Seite">Unterseite</co:navigation.list.item>
```

### Aktuelle Seite markieren
```html
<co:navigation.list.item link="t3://page?uid=12" current="{true}">Aktuelle Seite</co:navigation.list.item>
```

## Verwendung mit TYPO3-Daten

### Menü aus dem `menuProcessor`
```html
<co:navigation title="{data.header}">
    <co:navigation.list>
        <f:for each="{menu}" as="page">
            <co:navigation.list.item link="{page.link}" target="{page.target}" current="{page.current}">{page.title}</co:navigation.list.item>
        </f:for>
    </co:navigation.list>
</co:navigation>
```

### Seiten-Icon und Zusammenfassung (`ps14_menu`)
```html
<co:navigation.list variant="listing">
    <f:for each="{menu}" as="page">
        <co:navigation.list.item link="{page.link}" current="{page.current}" icon="{page.icon.0}" description="{page.data.abstract}">{page.title}</co:navigation.list.item>
    </f:for>
</co:navigation.list>
```

### Downloads aus einer Dateisammlung
```html
<co:navigation.list>
    <f:for each="{files}" as="file">
        <co:navigation.list.item link="{file.publicUrl}">{file.title -> f:or(alternative: file.name)}</co:navigation.list.item>
    </f:for>
</co:navigation.list>
```
