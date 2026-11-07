# Form/Item/Default

## Beschreibung
`<co:form.item.default>` ist ein Container-Template für Formularfelder. Es rendert das standardisierte Form-Markup (BEM: `form-item`, `form-item--disabled`) mit Label, Beschreibung, Fehlerausgabe und einem Slot für das eigentliche Input-Element.

Besonderheiten:
- Fehlt die `id`, wird automatisch eine eindeutige ID (`form-field--{random}`) generiert, damit Label und Input über das `for`-Attribut korrekt verknüpft sind.
- `disabled` setzt den Modifier `form-item--disabled` am Container.
- Werden `errors` übergeben, wird der Modifier `form-field--error` an die `fieldClass`-Variable angehängt, die über den Slot an das Input-Element weitergegeben wird.
- Über `<cv:slot>` werden die Variablen `id` und `fieldClass` an das eingebettete Input-Element übergeben.

## Aufruf
```html
<co:form.item.default
    label="Feldbezeichnung"
    type="text"
>
    <input type="text" id="{id}" name="feldname" class="{fieldClass}" />
</co:form.item.default>
```

## Parameter
| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `id` | string | nein | (auto) | ID des Feldes. Wird automatisch generiert (`form-field--{random}`), falls leer. |
| `label` | string | ja | – | Label-Text. |
| `required` | boolean | nein | false | Markiert das Feld als Pflichtfeld (Label-Hinweis). |
| `description` | string | nein | – | Beschreibungstext unterhalb des Labels. |
| `type` | string | nein | `text` | Feldtyp – wird als Modifier `form-field--{type}` an `fieldClass` angehängt. |
| `class` | string | nein | – | Zusätzliche CSS-Klassen, die in `fieldClass` eingebunden werden. |
| `errors` | string[] | nein | – | Fehlermeldungen. Aktiviert den Modifier `form-field--error` in `fieldClass`. |
| `disabled` | boolean | nein | false | Deaktiviert das Feld. Setzt den Modifier `form-item--disabled` am Container. |

## Slot-Variablen
Folgende Variablen werden über `<cv:slot>` an das eingebettete Input-Element übergeben:

| Variable | Beschreibung |
|----------|--------------|
| `id` | Generierte oder übergebene ID des Feldes. |
| `fieldClass` | Zusammengesetzte CSS-Klassen für das Input-Element (inkl. Fehler- und Typ-Modifier). |

Im Slot kann anstelle eines nativen `<input>`-Tags auch ein TYPO3-ViewHelper verwendet werden, z.B. `<f:form.textfield>`. Die Slot-Variablen `{id}` und `{fieldClass}` stehen dabei unverändert zur Verfügung.

## Beispiele

### Einfaches Textfeld (intern)
```html
<co:form.item.default label="Name" type="text">
    <input type="text" id="{id}" name="name" class="{fieldClass}" />
</co:form.item.default>
```

### Mit TYPO3-ViewHelper
```html
<co:form.item.default label="Name" type="text" required="true">
    <f:form.textfield id="{id}" property="name" class="{fieldClass}" />
</co:form.item.default>
```

### Mit Beschreibung und Pflichtfeld
```html
<co:form.item.default label="E-Mail" type="email" required="true" description="Ihre geschäftliche E-Mail-Adresse.">
    <input type="email" id="{id}" name="email" class="{fieldClass}" required="required" />
</co:form.item.default>
```

### Mit Fehlermeldung
```html
<co:form.item.default label="Benutzername" type="text" errors="{0: 'Der Benutzername ist bereits vergeben.'}">
    <input type="text" id="{id}" name="username" class="{fieldClass}" />
</co:form.item.default>
```

### Deaktiviert
```html
<co:form.item.default label="Gesperrtes Feld" type="text" disabled="true">
    <input type="text" id="{id}" name="locked" class="{fieldClass}" disabled="disabled" />
</co:form.item.default>
```

## Verwendung mit TYPO3-Daten
```html
<co:form.item.default
    label="{data.label}"
    description="{data.description}"
    required="{data.required}"
    type="{data.type}"
    errors="{data.errors}"
>
    <input type="{data.type}" id="{id}" name="{data.fieldName}" class="{fieldClass}" value="{data.value}" />
</co:form.item.default>
```
