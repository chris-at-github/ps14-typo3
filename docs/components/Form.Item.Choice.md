# Form/Item/Choice

## Beschreibung
Die `<co:form.item.choice>`-Komponente rendert das standardisierte Form-Markup für Choice-Formularfelder (Checkbox, Radio) mit Slot (vor dem Label), Label und Fehlerausgabe.

Besonderheiten:
- Der Slot wird **vor** dem Label gerendert – typisch für Checkbox/Radio-Layouts.
- `type` setzt die BEM-Modifier `form-item--{type}` und `form-field--{type}`.
- Fehlt die `id`, wird automatisch eine eindeutige ID (`form-field--{random}`) generiert.
- Werden `errors` übergeben, erhält `fieldClass` den Modifier `form-field--error`.

> Diese Komponente wird von `<co:form.checkbox>` und `<co:form.radio.group>` verwendet. Sie kann auch direkt eingesetzt werden, z.B. in Powermail-Partials mit `<f:form.checkbox>` oder `<f:form.radio>` im Slot.

## Aufruf
```html
<co:form.item.choice label="{label}" type="checkbox" required="{required}" errors="{errors}">
    <input type="checkbox" id="{id}" name="{name}" class="{fieldClass}" value="{value}" />
</co:form.item.choice>
```

## Parameter
| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `id` | string | nein | (auto) | ID des Feldes. Wird automatisch generiert (`form-field--{random}`), falls leer. |
| `label` | string | ja | – | Label-Text. |
| `required` | boolean | nein | – | Markiert das Feld als Pflichtfeld. |
| `description` | string | nein | – | Beschreibungstext unterhalb des Labels. |
| `type` | string | nein | `text` | Feldtyp (z.B. `checkbox`, `radio`). Setzt Modifier `form-item--{type}` und `form-field--{type}`. |
| `class` | string | nein | – | Zusätzliche CSS-Klassen am Input (via `fieldClass`). |
| `errors` | string[] | nein | – | Fehlermeldungen. Aktiviert den Modifier `form-field--error`. |
| `disabled` | boolean | nein | – | Deaktiviert das Feld. Setzt den Modifier `form-item--disabled`. |

## Slot-Variablen
| Variable | Beschreibung |
|----------|--------------|
| `id` | Generierte oder übergebene ID des Feldes. |
| `fieldClass` | Zusammengesetzte CSS-Klassen für das Input-Element. |

Im Slot kann anstelle eines nativen `<input>`-Tags auch ein TYPO3-ViewHelper verwendet werden, z.B. `<f:form.checkbox>` oder `<f:form.radio>`. Die Slot-Variablen `{id}` und `{fieldClass}` stehen dabei unverändert zur Verfügung.

## Beispiele

### Einzelne Checkbox
```html
<co:form.item.choice label="AGB akzeptieren" type="checkbox" required="true">
    <input type="checkbox" id="{id}" name="agb" class="{fieldClass}" value="1" />
</co:form.item.choice>
```

### Mit TYPO3-ViewHelper
```html
<co:form.item.choice label="AGB akzeptieren" type="checkbox" required="true">
    <f:form.checkbox id="{id}" property="agb" class="{fieldClass}" value="1" />
</co:form.item.choice>
```

### Radio-Button
```html
<co:form.item.choice label="Ja" type="radio">
    <input type="radio" id="{id}" name="answer" class="{fieldClass}" value="yes" />
</co:form.item.choice>
```

### Mit Fehlermeldung
```html
<co:form.item.choice label="Newsletter" type="checkbox" errors="{0: 'Bitte bestätigen Sie die Auswahl.'}">
    <input type="checkbox" id="{id}" name="newsletter" class="{fieldClass}" value="1" />
</co:form.item.choice>
```

### Deaktiviert
```html
<co:form.item.choice label="Option" type="checkbox" disabled="true">
    <input type="checkbox" id="{id}" name="option" class="{fieldClass}" value="1" disabled />
</co:form.item.choice>
```

### Verwendung in Powermail-Partials
```html
<co:form.item.choice
    label="{field.modifiedSettings.0.label -> vh:string.escapeLabels()}"
    required="{field.mandatory}"
    description="{field.description -> f:format.nl2br()}"
    type="checkbox"
>
    <f:form.checkbox
        property="{field.marker}"
        multiple="true"
        value="{field.modifiedSettings.0.value}"
        id="{id}"
        class="{fieldClass}"
    />
</co:form.item.choice>
```

## Verwendung mit TYPO3-Daten
```html
<co:form.item.choice
    label="{data.label}"
    type="checkbox"
    required="{data.required}"
    description="{data.description}"
    errors="{data.errors}"
>
    <input type="checkbox" id="{id}" name="{data.fieldName}" class="{fieldClass}" value="{data.value}" />
</co:form.item.choice>
```
