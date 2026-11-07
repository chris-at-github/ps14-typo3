# Form/Textarea

Die Komponente `Form/Textarea` rendert ein mehrzeiliges Texteingabefeld (`<textarea>`) mit einem Label, einer optionalen Beschreibung und Fehlermeldungen.

## Aufruf
```html
<co:form.textarea name="bio" label="Biografie" />
```

## Parameter

| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `id` | string | Nein | (auto) | Eindeutige ID des Feldes. Wenn nicht gesetzt, wird automatisch eine zufällige ID generiert. |
| `name` | string | Ja | - | Der Name des Feldes (`name`-Attribut). |
| `label` | string | Ja | - | Der Text für das `<label>`-Element. |
| `value` | string | Nein | - | Der Standardwert des Feldes (Inhalt der Textarea). |
| `required` | boolean | Nein | false | Gibt an, ob das Feld ein Pflichtfeld ist. |
| `description` | string | Nein | - | Ein optionaler Beschreibungstext, der unter dem Label angezeigt wird. |
| `class` | string | Nein | - | Zusätzliche CSS-Klassen für das Feld. |
| `errors` | array | Nein | - | Ein Array mit Fehlermeldungen, die unter dem Feld angezeigt werden. |
| `autocomplete` | string | Nein | `off` | Wert für das `autocomplete`-Attribut. |
| `disabled` | boolean | Nein | false | Deaktiviert das Feld, wenn auf `true` gesetzt. |
| `attributes` | array | Nein | `{}` | Zusätzliche HTML-Attribute als Key/Value-Map (z. B. `minlength`, `maxlength`, `rows`, `cols`, `placeholder`, `inputmode` oder `data-*`-Attribute). Werden 1:1 auf das `<textarea>`-Element ausgegeben. |

## Beispiele

### Einfache Textarea
```html
<co:form.textarea
    name="bio"
    label="Biografie"
/>
```

### Pflichtfeld mit Beschreibung
```html
<co:form.textarea
    name="bio"
    label="Biografie"
    required="true"
    description="Bitte geben Sie eine kurze Biografie ein."
/>
```

### Deaktivierte Textarea mit Vorbefüllung
```html
<co:form.textarea
    id="form-field--desc"
    name="desc"
    label="Beschreibung"
    value="Vorbefüllter Text"
    disabled="true"
/>
```

### Feld mit zusätzlichen HTML-Attributen (Validierung)
```html
<co:form.textarea
    name="bio"
    label="Biografie"
    required="true"
    attributes="{
        minlength: '10',
        maxlength: '500',
        placeholder: 'Erzählen Sie etwas über sich...'
    }"
/>
```

### Mit Fehlermeldungen
```html
<co:form.textarea
    name="bio"
    label="Biografie"
    errors="{0: 'Der Text ist zu kurz.'}"
/>
```

## Verwendung mit TYPO3-Daten
```html
<co:form.textarea
    name="description"
    label="{data.label}"
    value="{data.description}"
    required="{data.required}"
/>
```
