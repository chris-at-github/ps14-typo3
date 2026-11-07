# Form/Radio/Group

## Beschreibung
Die `<co:form.radio.group>`-Komponente rendert eine Gruppe von Radio-Buttons innerhalb eines `<fieldset>` mit gemeinsamem Label (`<legend>`), optionaler Beschreibung und Fehlerausgabe im standardisierten Form-Markup (BEM-Klassen `form-item-group`, `form-item-group__choices`, `form-field`, `form-field--radio`, `form-item`, `form-item--choice`, `form-item--radio`).

Innerhalb der Gruppe ist immer nur eine Option auswählbar. Über `value` lässt sich eine Option vorauswählen, über `variant` (z.B. `horizontal`) die Anordnung steuern.

Besonderheiten:
- Fehlt die `id`, wird automatisch eine eindeutige Basis-ID (`form-field--{random}`) generiert. Pro Option wird `{id}-{index}` als Input-ID verwendet und über `<co:form.label>` per `for`-Attribut verknüpft.
- Solange `disabled` nicht gesetzt ist, wird zusätzlich ein verstecktes Feld (`<input type="hidden" name="{name}" value="">`) ausgegeben, damit der Feldname auch ohne Auswahl im Request enthalten ist.
- `required` wird nur auf der ersten Option gesetzt – das reicht aus, damit der Browser die Gruppe als Pflichtfeld validiert. Im `<legend>` erscheint zusätzlich ein lokalisierter Pflichtfeld-Hinweis.
- Werden `errors` übergeben, erhalten die Inputs den Modifier `form-field--error` und die Meldungen werden über `<co:form.error>` ausgegeben.

## Aufruf
```html
<co:form.radio.group
    name="membership"
    label="Mitgliedschaft wählen"
    options="{0: {value: '1', label: '1 Monat'}, 1: {value: '12', label: '12 Monate'}}"
/>
```

## Parameter
| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `id` | string | nein | (auto) | Basis-ID für die Radio-Inputs. Wird automatisch generiert, falls leer. Pro Option wird `{id}-{index}` verwendet. |
| `name` | string | ja | – | Name des Feldes (Request-Key, für alle Optionen identisch). |
| `label` | string | ja | – | Gruppen-Label (wird als `<legend>` gerendert). |
| `description` | string | nein | – | Beschreibungstext unterhalb des Labels. |
| `options` | array | ja | – | Array mit Optionen je `{value, label}`. |
| `value` | mixed | nein | `""` | Aktuell ausgewählter Wert. Option mit passendem `value` wird als `checked` markiert. |
| `errors` | string[] | nein | – | Fehlermeldungen für die Gruppe. Aktiviert den Modifier `form-field--error`. |
| `disabled` | boolean | nein | false | Deaktiviert alle Radio-Inputs der Gruppe und unterdrückt das Hidden-Feld. |
| `required` | boolean | nein | false | Markiert die Gruppe als Pflichtfeld. Das `required`-Attribut wird auf dem ersten Radio gesetzt. |
| `variant` | string | nein | – | Optische Variante, z.B. `horizontal` für nebeneinander angeordnete Optionen (CSS-Modifier `form-item-group--{variant}` und `form-item-group__choices--{variant}`). |

## Beispiele

### Einfache Radio-Gruppe
```html
<co:form.radio.group
    name="membership"
    label="Mitgliedschaft"
    options="{
        0: {value: '1', label: '1 Monat'},
        1: {value: '3', label: '3 Monate'},
        2: {value: '12', label: '12 Monate'}
    }"
/>
```

### Mit Beschreibung, Vorauswahl und horizontaler Variante
```html
<co:form.radio.group
    name="membership"
    label="Mitgliedschaft wählen"
    description="Wähle 12 Monate für das beste Preis-Leistungsverhältnis."
    options="{
        0: {value: '1', label: '1 Monat'},
        1: {value: '3', label: '3 Monate'},
        2: {value: '12', label: '12 Monate'}
    }"
    value="12"
    variant="horizontal"
/>
```

### Pflichtfeld mit Fehlermeldung
```html
<co:form.radio.group
    name="membership"
    label="Mitgliedschaft wählen"
    required="true"
    options="{
        0: {value: '1', label: '1 Monat'},
        1: {value: '12', label: '12 Monate'}
    }"
    errors="{0: 'Bitte wähle eine Mitgliedschaft aus.'}"
/>
```

### Deaktivierte Gruppe
```html
<co:form.radio.group
    name="membership"
    label="Mitgliedschaft"
    disabled="true"
    options="{
        0: {value: '1', label: '1 Monat'},
        1: {value: '12', label: '12 Monate'}
    }"
    value="1"
/>
```

## Verwendung mit TYPO3-Daten
```html
<co:form.radio.group
    name="{data.fieldName}"
    label="{data.label}"
    description="{data.description}"
    options="{data.options}"
    value="{data.value}"
    required="{data.required}"
    errors="{data.errors}"
/>
```
