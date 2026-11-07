# Form/Upload

## Beschreibung
Die `<co:form.upload>`-Komponente rendert ein Datei-Upload-Feld (`<input type="file">`) mit zugehörigem Label, optionaler Beschreibung und Fehlerausgabe im standardisierten Form-Markup (BEM-Klassen `form-field`, `form-field--upload`, `form-item`).

Unterstützt werden Einzel- und Mehrfach-Uploads sowie die Einschränkung auf bestimmte Dateitypen über das `accept`-Attribut.

Besonderheiten:
- Fehlt die `id`, wird automatisch eine eindeutige ID (`form-field--{random}`) generiert, damit Label und Input über das `for`-Attribut korrekt verknüpft sind.
- Ist `multiple=true`, wird das `multiple`-Attribut am Input gesetzt und der Name automatisch als `{name}[]` ausgegeben, damit mehrere Dateien übertragen werden können.
- `required` wird sowohl am Input als auch am Label gesetzt (Pflichtfeld-Hinweis).
- Werden `errors` übergeben, erhält der Block den Modifier `form-field--error` und die Fehlermeldungen werden über `<co:form.error>` ausgegeben.
- `disabled` deaktiviert das Feld und setzt den Modifier `form-item--disabled`.

## Aufruf
```html
<co:form.upload
    name="avatar"
    label="Profilbild hochladen"
    accept="image/*"
/>
```

## Parameter
| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `id` | string | nein | (auto) | ID des Inputs. Wird automatisch generiert (`form-field--{random}`), falls leer. |
| `name` | string | ja | – | Name des Feldes (Request-Key). Bei `multiple=true` wird `{name}[]` verwendet. |
| `label` | string | ja | – | Label-Text. |
| `required` | boolean | nein | false | Markiert das Feld als Pflichtfeld (Input + Label). |
| `description` | string | nein | – | Beschreibungstext unterhalb des Labels. |
| `accept` | string | nein | – | Erlaubte Dateitypen, z.B. `image/*`, `.pdf,.docx` oder MIME-Types wie `application/pdf`. |
| `multiple` | boolean | nein | false | Erlaubt die Auswahl mehrerer Dateien. Setzt `multiple`-Attribut und `{name}[]`. |
| `class` | string | nein | – | Zusätzliche CSS-Klassen am Input. |
| `errors` | string[] | nein | – | Fehlermeldungen. Aktiviert den Modifier `form-field--error`. |
| `disabled` | boolean | nein | false | Deaktiviert das Feld. Setzt den Modifier `form-item--disabled`. |
| `attributes` | array | nein | `{}` | Zusätzliche HTML-Attribute als Key/Value-Map, z.B. `data-*`-Attribute. |

## Beispiele

### Einfaches Bild-Upload-Feld
```html
<co:form.upload
    name="avatar"
    label="Profilbild hochladen"
    accept="image/*"
/>
```

### Mehrfach-Upload mit Dateieinschränkung
```html
<co:form.upload
    name="documents"
    label="Dokumente hochladen"
    description="Erlaubte Formate: PDF, DOCX. Maximale Dateigröße: 10 MB."
    accept=".pdf,.docx"
    multiple="true"
    required="true"
/>
```

### Pflichtfeld mit Fehlermeldung
```html
<co:form.upload
    name="file"
    label="Datei hochladen"
    required="true"
    errors="{0: 'Bitte lade eine Datei hoch.'}"
/>
```

### Deaktiviertes Upload-Feld
```html
<co:form.upload
    name="attachment"
    label="Anhang"
    disabled="true"
    description="Datei-Upload ist derzeit nicht verfügbar."
/>
```

### Mit zusätzlichen Attributen
```html
<co:form.upload
    name="media"
    label="Mediendatei"
    accept="video/*,audio/*"
    attributes="{data-max-size: '52428800'}"
/>
```

## Verwendung mit TYPO3-Daten
```html
<co:form.upload
    name="{data.fieldName}"
    label="{data.label}"
    description="{data.description}"
    accept="{data.accept}"
    multiple="{data.multiple}"
    required="{data.required}"
    errors="{data.errors}"
/>
```
