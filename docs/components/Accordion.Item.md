# Accordion/Item

## Beschreibung
Die `<co:accordion.item>`-Komponente rendert ein einzelnes aufklappbares Element innerhalb eines `<co:accordion>`. Sie besteht aus einem Toggle-Button mit Überschrift und Icon sowie einem ausklappbaren Inhaltsbereich. Die ARIA-Attribute für Barrierefreiheit werden automatisch gesetzt.

---

## Aufruf

```html
<co:accordion.item header="Titel">Inhalt</co:accordion.item>
```

---

## Parameter

| Parameter      | Typ     | Pflicht | Standard           | Beschreibung                                                                          |
|----------------|---------|---------|--------------------|---------------------------------------------------------------------------------------|
| `header`       | string  | nein    | –                  | Text der Accordion-Überschrift im Toggle-Button                                       |
| `headerLayout` | integer | nein    | `2`                | Überschriften-Ebene als Integer (1–6), entspricht `<h1>`–`<h6>`                      |
| `id`           | string  | nein    | *(auto-generiert)* | ID für die ARIA-Verknüpfung zwischen Button und Body. Wird automatisch generiert, wenn nicht angegeben. |
| `class`        | string  | nein    | –                  | Optionale zusätzliche CSS-Klassen für das `<li>`-Element                             |
| `icon`         | string  | nein    | `EXT:ps14_component/Resources/Private/Assets/Svg/Embed/arrow-down.svg` | Voller EXT-Pfad zur SVG-Datei für das Icon im Toggle-Button |

---

## Beispiele

### Einfaches Accordion-Item

```html
<co:accordion>
    <co:accordion.item header="Was ist TYPO3?">
        TYPO3 ist ein Open-Source Content-Management-System.
    </co:accordion.item>
</co:accordion>
```

### Item mit angepasster Überschriften-Ebene

```html
<co:accordion>
    <co:accordion.item header="Häufige Fragen" headerLayout="3">
        Hier finden Sie Antworten auf häufige Fragen.
    </co:accordion.item>
</co:accordion>
```

### Item mit benutzerdefiniertem Icon

```html
<co:accordion>
    <co:accordion.item header="Mehr erfahren" icon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/arrow-right.svg">
        <p>Weiterführende Informationen zum Thema.</p>
    </co:accordion.item>
</co:accordion>
```

### Item mit fester ID und zusätzlicher CSS-Klasse

```html
<co:accordion>
    <co:accordion.item header="Datenschutz" id="datenschutz" class="accordion__item--highlight">
        <p>Informationen zum Datenschutz.</p>
    </co:accordion.item>
</co:accordion>
```

### Item mit Rich-Text-Inhalt

```html
<co:accordion>
    <co:accordion.item header="Beschreibung">
        <div class="richtext">
            <p>Ein Absatz mit <strong>formatiertem</strong> Text.</p>
            <ul>
                <li>Punkt 1</li>
                <li>Punkt 2</li>
            </ul>
        </div>
    </co:accordion.item>
</co:accordion>
```

---

## Verwendung mit TYPO3-Daten

### Mit Content-Block-Daten (z.B. FAQ)

```html
<co:accordion>
    <f:for each="{data.faqItems}" as="item">
        <co:accordion.item header="{item.question}" headerLayout="3">
            <f:format.html>{item.answer}</f:format.html>
        </co:accordion.item>
    </f:for>
</co:accordion>
```

### Mit Fluid-Variablen und dynamischem Icon

```html
<co:accordion>
    <f:for each="{accordionItems}" as="item">
        <co:accordion.item
            header="{item.title}"
            headerLayout="{settings.headerLayout}"
            icon="{item.icon}"
        >
            {item.bodytext -> f:format.html()}
        </co:accordion.item>
    </f:for>
</co:accordion>
```
