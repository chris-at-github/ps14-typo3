# Form/Select

Die Komponente `Form/Select` rendert ein `<select>`-Feld mit Label, optionaler Beschreibung, Fehlermeldungen und dynamisch übergebenen Optionen.

## Aufruf

```html
<co:form.select
    name="country"
    label="Land"
    options="{0: {value: 'de', label: 'Deutschland'}, 1: {value: 'at', label: 'Österreich'}}"
/>
```

## Parameter

| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `id` | string | Nein | (auto) | Eindeutige ID des Feldes. Wenn nicht gesetzt, wird automatisch eine zufällige ID generiert. |
| `name` | string | Ja | - | Der Name des Feldes (`name`-Attribut). |
| `label` | string | Ja | - | Der Text für das `<label>`-Element. |
| `value` | string | Nein | - | Vorbelegter Wert. Die Option, deren `value` mit diesem Wert übereinstimmt, wird als `selected` markiert. |
| `required` | boolean | Nein | false | Gibt an, ob das Feld ein Pflichtfeld ist. |
| `description` | string | Nein | - | Optionaler Beschreibungstext, der unter dem Label angezeigt wird. |
| `class` | string | Nein | - | Zusätzliche CSS-Klassen für das Feld. |
| `errors` | array | Nein | - | Array mit Fehlermeldungen, die unter dem Feld angezeigt werden. |
| `options` | array | Ja | - | Array mit Select-Optionen, jeweils als Map mit den Schlüsseln `value` und `label`, z.B. `{0: {value: '1', label: 'Option 1'}}`. |
| `disabled` | boolean | Nein | false | Deaktiviert das Feld, wenn auf `true` gesetzt. |
| `attributes` | array | Nein | `{}` | Zusätzliche HTML-Attribute als Key/Value-Map (z. B. `multiple`, `size`, `autocomplete` oder `data-*`-Attribute). Werden 1:1 auf das `<select>`-Element ausgegeben. |

## Beispiele

### Einfaches Select-Feld
```html
<co:form.select
    name="country"
    label="Land"
    options="{0: {value: 'de', label: 'Deutschland'}, 1: {value: 'at', label: 'Österreich'}, 2: {value: 'ch', label: 'Schweiz'}}"
/>
```

### Pflichtfeld mit vorbelegter Option
```html
<co:form.select
    name="country"
    label="Land"
    required="true"
    value="de"
    options="{0: {value: 'de', label: 'Deutschland'}, 1: {value: 'at', label: 'Österreich'}}"
/>
```

### Select mit Beschreibung und Fehlermeldung
```html
<co:form.select
    name="gender"
    label="Geschlecht"
    description="Bitte wählen Sie eine Option"
    required="true"
    options="{0: {value: 'm', label: 'Männlich'}, 1: {value: 'w', label: 'Weiblich'}, 2: {value: 'd', label: 'Divers'}}"
    errors="{0: 'Bitte wählen Sie eine Option aus'}"
/>
```

### Deaktiviertes Select
```html
<co:form.select
    name="country"
    label="Land"
    disabled="true"
    value="de"
    options="{0: {value: 'de', label: 'Deutschland'}}"
/>
```

### Select mit zusätzlichen HTML-Attributen
```html
<co:form.select
    name="tags"
    label="Tags"
    options="{0: {value: '1', label: 'Tag 1'}, 1: {value: '2', label: 'Tag 2'}}"
    attributes="{
        multiple: 'multiple',
        size: '5',
        'data-pristine-required-message': 'Bitte mindestens einen Tag wählen'
    }"
/>
```

## Verwendung mit TYPO3-Daten

Mit Fluid-Variablen aus einem Content-Block oder Controller:

```html
<co:form.select
    name="category"
    label="Kategorie"
    value="{data.selectedCategory}"
    options="{data.categoryOptions}"
/>
```

Wobei `data.categoryOptions` ein Array der Form `[{value: '...', label: '...'}, ...]` sein muss. Bei Bedarf kann es z. B. via `f:variable` aus TYPO3-Records aufgebaut werden:

```html
<f:variable name="categoryOptions">{f:for(each: categories, as: 'category', iteration: 'i', then: '{value: \'{category.uid}\', label: \'{category.title}\'}')}</f:variable>
```
