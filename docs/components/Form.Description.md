# Form/Description

Die Komponente `Form/Description` rendert einen Beschreibungstext für Formularfelder. Dieser Text wird üblicherweise unter dem Label angezeigt, um dem Benutzer zusätzliche Informationen oder Hilfestellungen zum Ausfüllen des Feldes zu geben.

## Aufruf
```html
<co:form.description description="Bitte geben Sie Ihr Geburtsdatum im Format TT.MM.JJJJ an." />
```

## Parameter

| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `description` | string | Ja | - | Der anzuzeigende Beschreibungstext. |
| `class` | string | Nein | - | Zusätzliche CSS-Klassen für den Container. |

## Beispiele

### Einfache Beschreibung
```html
<co:form.description description="Der Benutzername muss mindestens 5 Zeichen lang sein." />
```

### Beschreibung mit zusätzlicher Klasse
```html
<co:form.description
    description="Ihre Daten werden verschlüsselt übertragen."
    class="text-info"
/>
```

## Verwendung mit TYPO3-Daten
In TYPO3-Templates kann die Beschreibung dynamisch aus Übersetzungen oder Datenbankfeldern geladen werden.

```html
<co:form.description
    description="{f:translate(key: 'form.help-text', domain: 'ps14_site.messages')}"
/>
```
