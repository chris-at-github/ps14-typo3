# Form/Checkbox

## Beschreibung
Die `<co:form.checkbox>`-Komponente rendert eine einzelne Checkbox inkl. zugehörigem Label und optionaler Fehlerausgabe im standardisierten Form-Markup (BEM-Klassen `form-field`, `form-field--checkbox`, `form-item`, `form-item--choice`, `form-item--checkbox`).

Der Label-Inhalt darf HTML enthalten, sodass z.B. Inline-Links für Zustimmungstexte (Datenschutz, AGB, Nutzungsbedingungen) verwendet werden können.

Besonderheiten:
- Fehlt die `id`, wird automatisch eine eindeutige ID (`form-field--{random}`) generiert, damit Label und Input über das `for`-Attribut korrekt verknüpft sind.
- Ist `hiddenValueField=true` (Standard), wird zusätzlich ein verstecktes Feld (`<input type="hidden" name="{name}" value="">`) gerendert. Dadurch enthält der Request den Feldnamen auch dann, wenn die Checkbox nicht aktiviert wurde – wichtig für Single-Checkboxen (Zustimmung, Opt-in).
- `required` wird sowohl am Input als auch am Label gesetzt (Pflichtfeld-Hinweis).
- Werden `errors` übergeben, erhält der Block den Modifier `form-field--error` und die Fehlermeldungen werden über `<co:form.error>` ausgegeben.

## Aufruf
```html
<co:form.checkbox
    name="agb"
    label="AGB akzeptieren"
    required="true"
/>
```

## Parameter
| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `id` | string | nein | (auto) | ID des Inputs. Wird automatisch generiert (`form-field--{random}`), falls leer. |
| `name` | string | ja | – | Name des Feldes (Request-Key). |
| `label` | string | ja | – | Label-Text. HTML ist erlaubt (z.B. Inline-Links). |
| `value` | string | nein | `"1"` | Wert, der bei aktiver Checkbox gesendet wird. |
| `checked` | boolean | nein | false | Vorbelegung als aktiviert. |
| `required` | boolean | nein | false | Markiert das Feld als Pflichtfeld (Input + Label). |
| `class` | string | nein | – | Zusätzliche CSS-Klassen am Input. |
| `errors` | string[] | nein | – | Fehlermeldungen. Aktiviert den Modifier `form-field--error`. |
| `hiddenValueField` | boolean | nein | true | Rendert ein verstecktes Feld mit leerem Wert, damit der Feldname auch ohne Aktivierung im Request enthalten ist. |
| `disabled` | boolean | nein | false | Deaktiviert die Checkbox. |

## Beispiele

### Einfache Checkbox
```html
<co:form.checkbox
    name="newsletter"
    label="Newsletter abonnieren"
/>
```

### Pflichtfeld mit HTML-Label (Zustimmung)
```html
<co:form.checkbox
    name="terms"
    label="Hiermit akzeptiere ich die <a href='/agb' class='link link--default'>Nutzungsbedingungen</a>"
    required="true"
/>
```

### Vorbelegt und mit Fehlermeldung
```html
<co:form.checkbox
    name="agb"
    label="AGB akzeptieren"
    checked="true"
    errors="{0: 'Bitte bestätige die AGB.'}"
/>
```

### Deaktivierte Checkbox ohne Hidden-Feld
```html
<co:form.checkbox
    name="optin"
    label="Benachrichtigungen aktivieren"
    disabled="true"
    hiddenValueField="false"
/>
```

## Verwendung mit TYPO3-Daten
```html
<co:form.checkbox
    name="{data.fieldName}"
    label="{data.label}"
    value="{data.value}"
    checked="{data.checked}"
    required="{data.required}"
    errors="{data.errors}"
/>
```
