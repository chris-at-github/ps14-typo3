# Form/Label

Die Komponente `Form/Label` erzeugt ein `<label>`-Element für Formularfelder. Sie bietet Unterstützung für die Kennzeichnung von Pflichtfeldern durch einen Hinweistext.

## Aufruf
```html
<co:form.label id="form-field--unique-id" label="Beschriftung" />
```

## Parameter

| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `id` | string | Ja | - | ID des Feldes, auf das das Label mit dem `for`-Attribut verweist. |
| `label` | string | Ja | - | Der anzuzeigende Text des Labels. |
| `required` | boolean | Nein | false | Zeigt einen "erforderlich"-Hinweis an, wenn auf `true` gesetzt. |

## Beispiele

### Einfaches Label
```html
<co:form.label id="field-firstname" label="Vorname" />
```

### Label für ein Pflichtfeld
```html
<co:form.label
    id="field-email"
    label="E-Mail Adresse"
    required="true"
/>
```

## Verwendung mit TYPO3-Daten
In TYPO3-Formularen kann das Label flexibel mit Übersetzungen oder dynamischen IDs verwendet werden.

```html
<co:form.label
    id="field-{fo:randomId()}"
    label="{f:translate(key: 'form.label-name', domain: 'ps14_site.messages')}"
    required="{field.required}"
/>
```
