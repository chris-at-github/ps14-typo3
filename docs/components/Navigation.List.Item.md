# Navigation.List.Item

## Beschreibung
Die `<co:navigation.list.item>`-Komponente rendert einen Link einer Navigation List (Linkliste, Sitemap, „Mehr zum Thema“) als `<a class="navigation-list__link">` mit optionalem Icon. Der Link wird über `f:link.typolink` erzeugt und unterstützt daher interne, externe, Download- und Anker-Links.

Die Komponente rendert nur den Link. Die Listenstruktur (`<ul class="navigation-list">` und `<li class="navigation-list__item">`) wird im aufrufenden Template angelegt.

## Aufruf
```html
<co:navigation.list.item link="t3://page?uid=1">Seitenname</co:navigation.list.item>
```

## Parameter
| Parameter | Typ    | Pflicht | Standard | Beschreibung |
|-----------|--------|---------|----------|--------------|
| `link`    | string | nein    | –        | Link-Angabe (URL, `t3://`-URI o. ä.), ausgewertet über `f:link.typolink` |
| `icon`    | string | nein    | –        | Voller EXT-Pfad zur SVG-Datei (z. B. `EXT:ps14_site/Resources/Private/Assets/Svg/Embed/arrow-right.svg`); eingebettet über `fo:svg.inline` mit der Klasse `navigation-list__link-icon` |
| `class`   | string | nein    | –        | Zusätzliche CSS-Klassen für den Link, z. B. eine Modul-Elementklasse |
| `current` | bool   | nein    | –        | Markiert den Link als aktuelle Seite (`aria-current="page"`) |

## Slot
| Slot          | Beschreibung |
|---------------|--------------|
| Standard-Slot | Linktext; wird in `<span class="navigation-list__link-text">` ausgegeben |

## Beispiele

### Interner Link mit Icon
```html
<co:navigation.list.item link="t3://page?uid=1" icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/arrow-right.svg">
    Seitenname
</co:navigation.list.item>
```

### Externer Link ohne Icon
```html
<co:navigation.list.item link="https://example.com">Externe Seite</co:navigation.list.item>
```

### Liste mit mehreren Links
```html
<ul class="navigation-list">
    <li class="navigation-list__item">
        <co:navigation.list.item link="t3://page?uid=12">Unterseite 1</co:navigation.list.item>
    </li>
    <li class="navigation-list__item">
        <co:navigation.list.item link="t3://page?uid=13">Unterseite 2</co:navigation.list.item>
    </li>
</ul>
```

### Aktuelle Seite markieren
```html
<co:navigation.list.item link="t3://page?uid=12" current="{true}">Aktuelle Seite</co:navigation.list.item>
```

### Mit Modul-Elementklasse
```html
<co:navigation.list.item link="t3://page?uid=12" class="related__link">Unterseite</co:navigation.list.item>
```

## Verwendung mit TYPO3-Daten

### Menü aus dem `menuProcessor`
```html
<co:navigation title="{data.header}">
    <ul class="navigation-list">
        <f:for each="{menu}" as="page">
            <li class="navigation-list__item">
                <co:navigation.list.item link="{page.link}" current="{page.current}" icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/arrow-right.svg">
                    {page.title}
                </co:navigation.list.item>
            </li>
        </f:for>
    </ul>
</co:navigation>
```

### Downloads aus einer Dateisammlung
```html
<ul class="navigation-list">
    <f:for each="{files}" as="file">
        <li class="navigation-list__item">
            <co:navigation.list.item link="{file.publicUrl}">{file.title -> f:or(alternative: file.name)}</co:navigation.list.item>
        </li>
    </f:for>
</ul>
```
