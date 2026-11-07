# Accordion

## Beschreibung
Die `<co:accordion>`-Komponente rendert eine aufklappbare Liste (Accordion) als `<ul>`-Element. Sie dient als Container für `<co:accordion.item>`-Elemente und unterstützt verschiedene Varianten.

---

## Aufruf

```html
<co:accordion>
    <co:accordion.item header="Titel">Inhalt</co:accordion.item>
</co:accordion>
```

---

## Parameter

| Parameter | Typ    | Pflicht | Standard  | Beschreibung                                                        |
|-----------|--------|---------|-----------|---------------------------------------------------------------------|
| `variant` | string | nein    | `default` | Variante des Accordions, z.B. `default` oder `light`               |
| `class`   | string | nein    | –         | Optionale zusätzliche CSS-Klassen für das Accordion-`<ul>`-Element |

---

## Beispiele

### Standard-Accordion

```html
<co:accordion>
    <co:accordion.item header="Was ist TYPO3?">
        TYPO3 ist ein Open-Source Content-Management-System.
    </co:accordion.item>
    <co:accordion.item header="Wie installiere ich TYPO3?">
        TYPO3 kann über Composer installiert werden.
    </co:accordion.item>
</co:accordion>
```

### Accordion mit Variante „light"

```html
<co:accordion variant="light">
    <co:accordion.item header="Titel 1">Inhalt 1</co:accordion.item>
    <co:accordion.item header="Titel 2">Inhalt 2</co:accordion.item>
</co:accordion>
```

### Accordion mit zusätzlicher CSS-Klasse

```html
<co:accordion class="my-custom-class">
    <co:accordion.item header="Titel">Inhalt</co:accordion.item>
</co:accordion>
```

---

## Verwendung mit TYPO3-Daten

### Mit Content-Block-Daten (z.B. FAQ-Liste)

```html
<co:accordion>
    <f:for each="{data.faqItems}" as="item">
        <co:accordion.item header="{item.question}">
            <f:format.html>{item.answer}</f:format.html>
        </co:accordion.item>
    </f:for>
</co:accordion>
```

### Mit Fluid-Variablen aus dem Controller

```html
<co:accordion variant="{settings.accordionVariant}">
    <f:for each="{accordionItems}" as="item">
        <co:accordion.item header="{item.title}">
            {item.bodytext -> f:format.html()}
        </co:accordion.item>
    </f:for>
</co:accordion>
```
