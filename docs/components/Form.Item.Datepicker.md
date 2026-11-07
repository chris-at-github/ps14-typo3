# Form/Item/Datepicker

## Beschreibung
Die `<co:form.item.datepicker>`-Komponente ist ein internes Layout-Wrapper-Template für Datumsfelder (`<input type="date">`). Sie rendert das standardisierte Form-Markup mit Label, Beschreibung, einem umschließenden Container-Div (`form-item-container--datepicker`) für das Datumsfeld und Fehlerausgabe – analog zu `<co:form.item.select>`.

Besonderheiten:
- Neben dem Datumsfeld liegt im Container ein echter, fokussierbarer `<button>`, der den nativen Datepicker öffnet.
- Hintergrund: Der native Webkit-Auslöser (`::-webkit-calendar-picker-indicator`) zeigt bei Tastaturbedienung keinen sichtbaren Fokus und lässt sich per CSS nicht anpassen. Der eigene Button ist per Tastatur erreichbar, zeigt einen sichtbaren Fokus und öffnet den Kalender per JavaScript (`input.showPicker()`).
- Fehlt die `id`, wird automatisch eine eindeutige ID (`form-field--{random}`) generiert. Sie verknüpft Label (`for`) und Button (`aria-controls`) mit dem Feld.
- Werden `errors` übergeben, erhält `fieldClass` den Modifier `form-field--error`.
- Der native Auslöser wird innerhalb des Containers per CSS ausgeblendet, sodass kein doppeltes Icon entsteht.

> Das JavaScript wird über `[data-datepicker]` verdrahtet (`Scripts/components/datepicker.js`, eingebunden via `Scripts/bootstrap/forms.js`). Der Button trägt das Attribut `data-datepicker-button`.

## Aufruf
```html
<co:form.item.datepicker label="{label}" required="{required}" errors="{errors}">
    <f:form.textfield type="date" id="{id}" name="{name}" class="{fieldClass}" />
</co:form.item.datepicker>
```

## Parameter
| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `id` | string | nein | (auto) | ID des Feldes. Wird automatisch generiert (`form-field--{random}`), falls leer. |
| `label` | string | ja | – | Label-Text. |
| `required` | boolean | nein | – | Markiert das Feld als Pflichtfeld. |
| `description` | string | nein | – | Beschreibungstext unterhalb des Labels. |
| `type` | string | nein | `date` | Feldtyp – setzt Modifier `form-field--{type}`. |
| `class` | string | nein | – | Zusätzliche CSS-Klassen am Datumsfeld (via `fieldClass`). |
| `errors` | string[] | nein | – | Fehlermeldungen. Aktiviert den Modifier `form-field--error`. |
| `disabled` | boolean | nein | – | Deaktiviert Feld und Button. Setzt den Modifier `form-item--disabled`. |
| `buttonLabel` | string | nein | (übersetzt) | Barrierefreies Label (`aria-label`) des Öffnen-Buttons. Standard: übersetztes Label `datepicker.button-label` (`locallang_frontend.xlf`). |

## Slot-Variablen
| Variable | Beschreibung |
|----------|--------------|
| `id` | Generierte oder übergebene ID des Feldes. |
| `fieldClass` | Zusammengesetzte CSS-Klassen für das Datumsfeld (inkl. `form-item-container__field`). |

Im Slot kann anstelle eines nativen `<input>`-Tags auch ein TYPO3-ViewHelper verwendet werden, z.B. `<f:form.textfield type="date">`. Die Slot-Variablen `{id}` und `{fieldClass}` stehen dabei unverändert zur Verfügung.

## Beispiele

### Einfaches Datumsfeld
```html
<co:form.item.datepicker label="Startdatum" required="true">
    <f:form.textfield type="date" id="{id}" name="startDate" class="{fieldClass}" />
</co:form.item.datepicker>
```

### Mit Beschreibung
```html
<co:form.item.datepicker label="Geburtsdatum" description="Bitte im Format TT.MM.JJJJ angeben.">
    <f:form.textfield type="date" id="{id}" name="birthday" class="{fieldClass}" />
</co:form.item.datepicker>
```

### Mit Fehlermeldung
```html
<co:form.item.datepicker label="Startdatum" required="true" errors="{0: 'Bitte wähle ein Datum aus.'}">
    <f:form.textfield type="date" id="{id}" name="startDate" class="{fieldClass}" />
</co:form.item.datepicker>
```

### Eigenes Button-Label
```html
<co:form.item.datepicker label="Enddatum" buttonLabel="Enddatum wählen">
    <f:form.textfield type="date" id="{id}" name="endDate" class="{fieldClass}" />
</co:form.item.datepicker>
```

### Deaktiviert
```html
<co:form.item.datepicker label="Buchungsdatum" disabled="true">
    <f:form.textfield type="date" id="{id}" name="date" class="{fieldClass}" disabled="disabled" />
</co:form.item.datepicker>
```

## Verwendung mit TYPO3-Daten
```html
<co:form.item.datepicker
    label="{data.label}"
    required="{data.required}"
    description="{data.description}"
    errors="{data.errors}"
>
    <f:form.textfield
        type="date"
        id="{id}"
        property="{data.fieldName}"
        class="{fieldClass}"
        value="{data.value -> f:format.date(format: 'Y-m-d')}"
    />
</co:form.item.datepicker>
```
