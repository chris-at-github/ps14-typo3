# Form/Group/Choice

## Beschreibung
Die `<co:form.group.choice>`-Komponente rendert einen `<fieldset>`-Wrapper mit gemeinsamem Label (Legend), optionaler Beschreibung und Fehlerausgabe für eine Gruppe von Choice-Feldern (Checkbox, Radio). Die einzelnen Felder werden über den Slot übergeben – typischerweise als `<co:form.item.choice>`-Kinder.

Besonderheiten:
- `variant` setzt die BEM-Modifier `form-item-group--{variant}` und `form-item-group__choices--{variant}`.
- `disabled` setzt den Modifier `form-item-group--disabled` auf dem `<fieldset>`.
- Das `required`-Attribut wird als Pflichtfeld-Hinweis im Label angezeigt.

> Die Komponente wird direkt in Powermail-Partials (z.B. `Check.html`, `Radio.html`) verwendet.

## Aufruf
```html
<co:form.group.choice label="Interessen" required="true">
    <co:form.item.choice label="Sport" type="checkbox">
        <input type="checkbox" id="{id}" name="interests[]" class="{fieldClass}" value="sport" />
    </co:form.item.choice>
</co:form.group.choice>
```

## Parameter
| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `label` | string | ja | – | Gruppen-Label (wird als `<legend>` gerendert). |
| `description` | string | nein | – | Beschreibungstext unterhalb des Labels. |
| `errors` | string[] | nein | – | Fehlermeldungen für die Gruppe. |
| `disabled` | boolean | nein | – | Deaktiviert die gesamte Gruppe (Modifier `form-item-group--disabled`). |
| `required` | boolean | nein | – | Markiert die Gruppe als Pflichtfeld (Hinweis im Label). |
| `variant` | string | nein | – | Optische Variante, z.B. `horizontal` (Modifier `form-item-group--{variant}`). |

## Beispiele

### Einfache Radio-Gruppe
```html
<co:form.group.choice label="Anrede" required="true">
    <f:for each="{options}" as="option" iteration="index">
        <co:form.item.choice label="{option.label}" type="radio">
            <input type="radio" id="{id}" name="salutation" class="{fieldClass}" value="{option.value}" />
        </co:form.item.choice>
    </f:for>
</co:form.group.choice>
```

### Horizontale Checkbox-Gruppe mit Beschreibung
```html
<co:form.group.choice label="Interessen" description="Mehrfachauswahl möglich." variant="horizontal">
    <co:form.item.choice label="Sport" type="checkbox">
        <input type="checkbox" id="{id}" name="interests[]" class="{fieldClass}" value="sport" />
    </co:form.item.choice>
    <co:form.item.choice label="Musik" type="checkbox">
        <input type="checkbox" id="{id}" name="interests[]" class="{fieldClass}" value="musik" />
    </co:form.item.choice>
</co:form.group.choice>
```

### Mit Fehlermeldung
```html
<co:form.group.choice label="Interessen" required="true" errors="{0: 'Bitte wähle mindestens eine Option.'}">
    <co:form.item.choice label="Sport" type="checkbox">
        <input type="checkbox" id="{id}" name="interests[]" class="{fieldClass}" value="sport" />
    </co:form.item.choice>
</co:form.group.choice>
```

### Verwendung in Powermail-Partials
```html
<co:form.group.choice
    label="{field.title -> vh:string.escapeLabels()}"
    required="{field.mandatory}"
    description="{field.description -> f:format.nl2br()}"
>
    <f:for each="{field.modifiedSettings}" as="setting" iteration="index">
        <co:form.item.choice
            label="{setting.label -> vh:string.escapeLabels()}"
            type="radio"
        >
            <f:form.radio
                property="{field.marker}"
                value="{setting.value}"
                id="{id}"
                class="{fieldClass}"
            />
        </co:form.item.choice>
    </f:for>
</co:form.group.choice>
```

## Verwendung mit TYPO3-Daten
```html
<co:form.group.choice
    label="{data.label}"
    description="{data.description}"
    required="{data.required}"
    errors="{data.errors}"
>
    <f:for each="{data.options}" as="option">
        <co:form.item.choice label="{option.label}" type="checkbox">
            <input type="checkbox" id="{id}" name="{data.fieldName}[]" class="{fieldClass}" value="{option.value}" />
        </co:form.item.choice>
    </f:for>
</co:form.group.choice>
```
