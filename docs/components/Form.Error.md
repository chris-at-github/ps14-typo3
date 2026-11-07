# Form/Error

Die Komponente `Form/Error` rendert Fehlermeldungen für ein Formularfeld. Sie passt die Darstellung automatisch an die Anzahl der Fehler an (einzelne Nachricht als `<div>`, mehrere Nachrichten als `<ul>`).

## Aufruf
```html
<co:form.error errors="{errors}" />
```

## Parameter

| Parameter | Typ | Pflicht | Standard | Beschreibung |
|-----------|-----|---------|----------|--------------|
| `errors` | array | Nein | - | Ein Array mit Fehlermeldungen (Strings). |
| `id` | string | Nein | - | ID des zugehörigen Feldes (optional). |
| `class` | string | Nein | "form-error" | Zusätzliche CSS-Klassen für den Container. Standardmäßig wird `form-error` verwendet. |

## Beispiele

### Einzelner Fehler
```html
<co:form.error errors="{0: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'}" />
```

### Mehrere Fehler mit ID
```html
<co:form.error
    errors="{0: 'Das Passwort ist zu kurz.', 1: 'Das Passwort muss ein Sonderzeichen enthalten.'}"
    id="field-password"
/>
```

## Verwendung mit TYPO3-Daten
In TYPO3-Formularen (z. B. mit `ext:form` oder eigenen Controller-Aktionen) können die Fehler direkt aus dem `validationResults`-Objekt an die Komponente übergeben werden.

```html
<f:form.validationResults for="userInput.email">
    <f:if condition="{validationResults.flattenedErrors}">
        <co:form.error errors="{validationResults.errors}" />
    </f:if>
</f:form.validationResults>
```
