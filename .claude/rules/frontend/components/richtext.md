---
paths:
  - "packages/*/Resources/Private/Assets/Scss/**/*richtext*.scss"
  - "packages/*/Resources/Private/Components/Richtext.html"
---

# Richtext

## Regeln

- Fließtext wird in einem HTML-Container mit der Klasse `.richtext`
  gewrappt.
- Fasse den ganzen Text in diesem Wrapper zusammen — NICHT einzeln um jedes
  Tag.
- Der Wrapper ist für Standard-Tags ohne Layout-Styles gedacht, z. B. `<p>`,
  `<ul>`, `<ol>`, `<table>`, `<h2>`, `<h3>`, `<h4>`.
- Auf den Block `.richtext` dürfen weitere Klassen aus fremden Blöcken
  angewendet werden, z. B. `richtext feature__content`.
- Setze keine Styles direkt auf die Klasse `.richtext`.

## Wrapper

```html
<div class="richtext">
    <!-- Hier kommt der Fließtext rein -->
</div>
```

## Sinnvolle Beispiele

```html
<p>
    Integer posuere erat a ante venenatis dapibus posuere velit aliquet.
</p>
<p>
    Aenean lacinia bibendum nulla sed consectetur adipiscing elit etiam porta sem.
</p>
```

```html
<h3>Dapibus posuere velit aliquet.</h3>
<p>
    Aenean lacinia bibendum nulla sed consectetur adipiscing elit etiam porta sem.
</p>
```

```html
<p>
    Aenean lacinia bibendum nulla sed <a href="#">consectetur</a> adipiscing elit etiam porta sem.
</p>
<ul>
    <li>Ad litora torquent per conubia nostra inceptos himenaeos.</li>
    <li>Ut hendrerit semper vel class aptent taciti sociosqu.</li>
</ul>
```

```html
<p>
    <strong>Fett</strong> und <em>kursiv</em> im selben Absatz mit <strong><em>Kombinationen</em></strong>.
</p>
```

```html
<ol>
    <li>Erstes Element</li>
    <li>Zweites Element mit <a href="#">Link</a></li>
    <li>Drittes Element</li>
</ol>
```

```html
<ul>
    <li>Hauptpunkt
        <ul>
            <li>Unterpunkt 1</li>
            <li>Unterpunkt 2</li>
        </ul>
    </li>
    <li>Zweiter Hauptpunkt</li>
</ul>
```

```html
<blockquote>
    <p>Dies ist ein Zitat oder eine wichtige Information zum Hervorheben.</p>
</blockquote>
```
