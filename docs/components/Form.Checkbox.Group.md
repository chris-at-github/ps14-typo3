# Form/Checkbox/Group

## Beschreibung
Die `<co:form.checkbox.group>`-Komponente rendert eine Gruppe von Checkboxen innerhalb eines `<fieldset>` mit gemeinsamem Label (Legend), optionaler Beschreibung und Fehlerausgabe. Mehrfachauswahl ist möglich. Über `values` lassen sich vorausgewählte Optionen setzen, über `variant` (z.B. `horizontal`) wird die Anordnung gesteuert.

Zusätzlich wird ein verstecktes Feld (`<input type="hidden" name="{name}" value="">`) ausgegeben, damit auch beim Absenden ohne Auswahl der Feldname im Request enthalten ist (außer bei `disabled="true"`).

## Aufruf
```html
<co:form.checkbox.group
    name="interests"
    label="Interessen wählen"
    options="{0: {value: 'sport', label: 'Sport'}, 1: {value: 'musik', label: 'Musik'}}"
/>
```

## Parameter
| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `id` | string | nein | (auto) | Basis-ID für die Checkbox-Inputs. Wird automatisch generiert, falls leer. Pro Option wird `{id}-{index}` verwendet. |
| `name` | string | ja | – | Name des Feldes. Wird am Input als `{name}[]` ausgegeben (Mehrfachauswahl). |
| `label` | string | ja | – | Gruppen-Label (wird als `<legend>` gerendert). |
| `description` | string | nein | – | Beschreibungstext, der unter dem Label angezeigt wird. |
| `options` | array | ja | – | Array mit Optionen je `{value, label}`. |
| `values` | array | nein | – | Aktuell ausgewählte Werte (mehrere möglich). Optionen mit passendem `value` werden als `checked` markiert. |
| `errors` | string[] | nein | – | Fehlermeldungen für die Gruppe. |
| `disabled` | boolean | nein | false | Deaktiviert alle Checkboxen der Gruppe. |
| `required` | boolean | nein | false | Markiert die Gruppe als Pflichtfeld. Das `required`-Attribut wird auf der ersten Checkbox gesetzt. |
| `variant` | string | nein | – | Optische Variante, z.B. `horizontal` für nebeneinander angeordnete Optionen (CSS-Modifier `form-item-group--{variant}` und `form-item-group__choices--{variant}`). |

## Beispiele

### Einfache Checkbox-Gruppe
```html
<co:form.checkbox.group
    name="interests"
    label="Interessen"
    options="{
        0: {value: 'sport', label: 'Sport'},
        1: {value: 'musik', label: 'Musik'},
        2: {value: 'kunst', label: 'Kunst'}
    }"
/>
```

### Mit Beschreibung, Vorbelegung und horizontaler Variante
```html
<co:form.checkbox.group
    name="interests"
    label="Interessen wählen"
    description="Mehrfachauswahl möglich."
    options="{
        0: {value: 'sport', label: 'Sport'},
        1: {value: 'musik', label: 'Musik'},
        2: {value: 'kunst', label: 'Kunst'}
    }"
    values="{0: 'musik', 1: 'kunst'}"
    variant="horizontal"
/>
```

### Pflichtfeld mit Fehlermeldung
```html
<co:form.checkbox.group
    name="interests"
    label="Interessen wählen"
    required="true"
    options="{
        0: {value: 'sport', label: 'Sport'},
        1: {value: 'musik', label: 'Musik'}
    }"
    errors="{0: 'Bitte wähle mindestens ein Interesse aus.'}"
/>
```

### Deaktivierte Gruppe
```html
<co:form.checkbox.group
    name="interests"
    label="Interessen"
    disabled="true"
    options="{
        0: {value: 'sport', label: 'Sport'},
        1: {value: 'musik', label: 'Musik'}
    }"
    values="{0: 'sport'}"
/>
```

## Verwendung mit TYPO3-Daten
```html
<co:form.checkbox.group
    name="{data.fieldName}"
    label="{data.label}"
    description="{data.description}"
    options="{data.options}"
    values="{data.selectedValues}"
    required="{data.required}"
/>
```
