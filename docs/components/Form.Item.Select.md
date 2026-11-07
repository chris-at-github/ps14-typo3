# Form/Item/Select

## Beschreibung
Die `<co:form.item.select>`-Komponente ist ein internes Layout-Wrapper-Template für Select-Formularfelder (`<select>`). Sie rendert das standardisierte Form-Markup mit Label, Beschreibung, einem umschließenden Container-Div (`form-item-container--select`) für das Select-Element und Fehlerausgabe.

Besonderheiten:
- Das Slot-Element wird in einem `<div class="form-item-container form-item-container--select">` gerendert – ermöglicht CSS-Styling für Custom-Select-Dropdowns (z.B. Pfeil-Icon).
- Fehlt die `id`, wird automatisch eine eindeutige ID (`form-field--{random}`) generiert.
- Werden `errors` übergeben, erhält `fieldClass` den Modifier `form-field--error`.

> Diese Komponente wird von `<co:form.select>` verwendet. Sie kann auch direkt eingesetzt werden, z.B. in Powermail-Partials mit `<f:form.select>` im Slot.

## Aufruf
```html
<co:form.item.select label="{label}" required="{required}" errors="{errors}">
    <select id="{id}" name="{name}" class="{fieldClass}">...</select>
</co:form.item.select>
```

## Parameter
| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `id` | string | nein | (auto) | ID des Feldes. Wird automatisch generiert (`form-field--{random}`), falls leer. |
| `label` | string | ja | – | Label-Text. |
| `required` | boolean | nein | – | Markiert das Feld als Pflichtfeld. |
| `description` | string | nein | – | Beschreibungstext unterhalb des Labels. |
| `type` | string | nein | `text` | Feldtyp – setzt Modifier `form-field--{type}`. |
| `class` | string | nein | – | Zusätzliche CSS-Klassen am Select (via `fieldClass`). |
| `errors` | string[] | nein | – | Fehlermeldungen. Aktiviert den Modifier `form-field--error`. |
| `disabled` | boolean | nein | – | Deaktiviert das Feld. Setzt den Modifier `form-item--disabled`. |

## Slot-Variablen
| Variable | Beschreibung |
|----------|--------------|
| `id` | Generierte oder übergebene ID des Feldes. |
| `fieldClass` | Zusammengesetzte CSS-Klassen für das Select-Element. |

Im Slot kann anstelle eines nativen `<select>`-Tags auch ein TYPO3-ViewHelper verwendet werden, z.B. `<f:form.select>`. Die Slot-Variablen `{id}` und `{fieldClass}` stehen dabei unverändert zur Verfügung.

## Beispiele

### Einfaches Select-Feld
```html
<co:form.item.select label="Land auswählen" required="true">
    <select id="{id}" name="country" class="{fieldClass}">
        <option value="">Bitte wählen</option>
        <option value="de">Deutschland</option>
        <option value="at">Österreich</option>
    </select>
</co:form.item.select>
```

### Mit TYPO3-ViewHelper
```html
<co:form.item.select label="Land auswählen" required="true">
    <f:form.select id="{id}" property="country" class="{fieldClass}" options="{countries}" />
</co:form.item.select>
```

### Mit Beschreibung
```html
<co:form.item.select label="Kategorie" description="Wähle die passende Kategorie aus.">
    <select id="{id}" name="category" class="{fieldClass}">
        <option value="a">Kategorie A</option>
        <option value="b">Kategorie B</option>
    </select>
</co:form.item.select>
```

### Mit Fehlermeldung
```html
<co:form.item.select label="Anrede" required="true" errors="{0: 'Bitte wähle eine Anrede aus.'}">
    <select id="{id}" name="salutation" class="{fieldClass}">
        <option value="">Bitte wählen</option>
        <option value="m">Herr</option>
        <option value="f">Frau</option>
    </select>
</co:form.item.select>
```

### Deaktiviert
```html
<co:form.item.select label="Status" disabled="true">
    <select id="{id}" name="status" class="{fieldClass}" disabled>
        <option value="active">Aktiv</option>
    </select>
</co:form.item.select>
```

## Verwendung mit TYPO3-Daten
```html
<co:form.item.select
    label="{data.label}"
    required="{data.required}"
    description="{data.description}"
    errors="{data.errors}"
>
    <select id="{id}" name="{data.fieldName}" class="{fieldClass}">
        <f:for each="{data.options}" as="option">
            <option value="{option.value}">{option.label}</option>
        </f:for>
    </select>
</co:form.item.select>
```
