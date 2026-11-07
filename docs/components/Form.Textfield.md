# Form/Textfield

Die Komponente `Form/Textfield` rendert ein Standard-Text-Eingabefeld mit einem Label, einer optionalen Beschreibung und Fehlermeldungen.

## Parameter

| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `id` | string | Nein | (auto) | Eindeutige ID des Feldes. Wenn nicht gesetzt, wird automatisch eine zufällige ID generiert. |
| `name` | string | Ja | - | Der Name des Eingabefeldes (`name`-Attribut). |
| `label` | string | Ja | - | Der Text für das `<label>`-Element. |
| `value` | string | Nein | - | Der Standardwert des Eingabefeldes. |
| `required` | boolean | Nein | false | Gibt an, ob das Feld ein Pflichtfeld ist. |
| `description` | string | Nein | - | Ein optionaler Beschreibungstext, der unter dem Label angezeigt wird. |
| `type` | string | Nein | "text" | Der Typ des Eingabefeldes (z. B. `text`, `password`, `email`). |
| `class` | string | Nein | - | Zusätzliche CSS-Klassen für das Eingabefeld. |
| `errors` | array | Nein | - | Ein Array mit Fehlermeldungen, die unter dem Feld angezeigt werden. |
| `autocomplete` | string | Nein | - | Wert für das `autocomplete`-Attribut (z. B. `off`, `email`, `username`). |
| `disabled` | boolean | Nein | false | Deaktiviert das Eingabefeld, wenn auf `true` gesetzt. |
| `attributes` | array | Nein | `{}` | Zusätzliche HTML-Attribute als Key/Value-Map (z. B. `pattern`, `minlength`, `maxlength`, `min`, `max`, `step`, `inputmode` oder `data-*`-Attribute). Werden 1:1 auf das `<input>`-Element ausgegeben. |

## Beispielhafter Aufruf

### Einfaches Textfeld
```html
<co:form.textfield
    name="firstname"
    label="Vorname"
    value="{user.firstname}"
/>
```

### Passwortfeld mit Beschreibung und Validierung
```html
<co:form.textfield
    name="password"
    label="Passwort"
    type="password"
    required="true"
    description="Das Passwort muss mindestens 8 Zeichen lang sein."
    errors="{0: 'Das Passwort ist zu kurz'}"
/>
```

### Feld mit zusätzlichen HTML-Attributen (Validierung)
```html
<co:form.textfield
    name="username"
    label="Benutzername"
    required="true"
    attributes="{
        pattern: '[a-z0-9-]+',
        minlength: '3',
        maxlength: '32',
        inputmode: 'text'
    }"
/>
```

### Deaktiviertes E-Mail Feld
```html
<co:form.textfield
    name="email"
    label="E-Mail Adresse"
    type="email"
    value="user@example.com"
    disabled="true"
    autocomplete="email"
/>
```
