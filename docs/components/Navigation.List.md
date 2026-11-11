# Navigation.List

## Beschreibung
Die `<co:navigation.list>`-Komponente rendert die Liste einer Navigation (Linkliste, Sitemap, Icon-Menü) als `<ul class="navigation__list">` innerhalb von `<co:navigation>`. Die Einträge werden als `<co:navigation.list.item>` im Slot übergeben. Die Ansicht wird über `variant` an `<co:navigation>` (Liste) und an `<co:navigation.list.item>` (Eintrag) gesteuert.

## Aufruf
```html
<co:navigation.list>
    <co:navigation.list.item link="t3://page?uid=1">Seitenname</co:navigation.list.item>
</co:navigation.list>
```

## Parameter
| Parameter | Typ    | Pflicht | Standard | Beschreibung |
|-----------|--------|---------|----------|--------------|
| `class`   | string | nein    | –        | Zusätzliche CSS-Klassen für die Liste |

## Slot
| Slot          | Beschreibung |
|---------------|--------------|
| Standard-Slot | Einträge der Liste als `<co:navigation.list.item>` |

## Beispiele

### Einfache Liste
```html
<co:navigation.list>
    <co:navigation.list.item link="t3://page?uid=12">Unterseite 1</co:navigation.list.item>
    <co:navigation.list.item link="t3://page?uid=13">Unterseite 2</co:navigation.list.item>
</co:navigation.list>
```

### Icon-Menü
```html
<co:navigation variant="icon" title="Kontakt">
    <co:navigation.list>
        <co:navigation.list.item variant="icon" link="https://example.com" target="_blank" icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/mail.svg">Kontakt</co:navigation.list.item>
    </co:navigation.list>
</co:navigation>
```

## Verwendung mit TYPO3-Daten

### Menü-Inhaltselement (`ps14_menu`)
```html
<co:navigation variant="listing" title="{data.header}" titleType="{data.header_layout}" id="{id}">
    <co:navigation.title id="{id}" type="{data.header_layout}" class="heading">{data.header}</co:navigation.title>
    <co:navigation.list>
        <f:for each="{menu}" as="page">
            <co:navigation.list.item variant="listing" link="{page.link}" target="{page.target}" current="{page.current}" icon="{page.icon.0}" description="{page.data.abstract}">{page.title}</co:navigation.list.item>
        </f:for>
    </co:navigation.list>
</co:navigation>
```
