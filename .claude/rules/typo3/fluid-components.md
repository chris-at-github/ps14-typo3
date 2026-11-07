---
paths:
  - "packages/*/Resources/Private/Components/**/*.html"
  - "docs/components.md"
  - "docs/components/**/*.md"
---

# Fluid-Komponenten

## Ablage und Überschreibung

- Basis-Komponenten liegen in `packages/ps14_component/Resources/Private/Components/`.
  Diese Extension wird wie `ps14_foundation` **nie projektspezifisch
  angepasst**.
- Projektspezifische Komponenten und Überschreibungen liegen in
  `packages/ps14_site/Resources/Private/Components/`. Eine Datei mit
  demselben relativen Pfad überschreibt die Basis-Komponente.
- Dateinamen werden in PascalCase geschrieben. Punkte im Komponentennamen
  werden zu Unterordnern:
  - `button` → `Button.html`, Aufruf `<co:button>`
  - `button.icon` → `Button/Icon.html`, Aufruf `<co:button.icon>`

## Namespaces

| Prefix | Namespace | Inhalt |
|---|---|---|
| `f` | `http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers` | TYPO3-Core-ViewHelper |
| `fo` | `http://typo3.org/ns/Ps14/Foundation/ViewHelpers` | ViewHelper aus `ps14_foundation` (z. B. `fo:cssClass`, `fo:svg.inline`) |
| `co` | `http://typo3.org/ns/Ps14/Component/Components/ComponentCollection` | Komponenten aus `ps14_component` / `ps14_site` |
| `cv` | `http://typo3.org/ns/Ps14/Component/ViewHelpers` | ViewHelper aus `ps14_component` (`cv:slot` mit `variables` für Scoped Slots) |

## Aufbau einer Komponenten-Datei

```html
<html
    xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers"
    xmlns:fo="http://typo3.org/ns/Ps14/Foundation/ViewHelpers"
    xmlns:co="http://typo3.org/ns/Ps14/Component/Components/ComponentCollection"
    data-namespace-typo3-fluid="true">

    <f:comment>
    <!--
        Dokumentation: Fluid-Komponente <co:button.icon>
    -->
    </f:comment>

    <f:argument name="icon" type="string" optional="{true}" />
    <f:argument name="variant" type="string" optional="{true}" />
    <f:argument name="class" type="string" optional="{true}" />
    <f:argument name="id" type="string" optional="{true}" />
    <f:argument name="label" type="string" optional="{true}" />
    <f:argument name="disabled" type="boolean" optional="{true}" />

    <fo:cssClass value="button--{variant}" condition="{variant}" />

    <button id="{id}" class="button button--icon {class}" {f:if(condition: disabled, then: 'disabled="disabled"')} aria-label="{label}">
        <fo:svg.inline source="{icon}" class="button__icon" />
    </button>
</html>
```

## Erstellungslogik

- **Erstelle NUR die Fluid-Komponente.** Das SCSS ist ein eigener
  Arbeitsschritt nach den Frontend-Regeln (`.claude/rules/frontend/`).
- Halte die Logik der Fluid-Komponente so einfach wie möglich. Alle
  komplexeren Logiken werden in einen ViewHelper ausgelagert.
- Orientiere dich beim Aufbau an bestehenden Komponenten in
  `packages/ps14_component/Resources/Private/Components/`:
  - einfach: `Button.html`
  - komplexer: `Badge.html`
  - mit Slots: `Card.html`
  - mit Scoped Slots (`cv:slot`): `Form/Item/Default.html`
- Lagere sinnvolle Werte und Attribute in Argumente aus, z. B.
  `<f:argument name="class" type="string" optional="{true}" />`.
- HTML / Fluid:
  - Verwende bereitgestelltes HTML als Basis.
  - Behalte die Reihenfolge der Elemente und Attribute bei.
  - Umstellungen, um Logik abzubilden, sind erlaubt.
  - Füge kein zusätzliches HTML hinzu.
  - Zur Verarbeitung der Argumente und Slots darf Fluid verwendet werden.
- Sections innerhalb einer Komponente:
  - Schreibe sie in PascalCase, z. B. `<f:section name="Content">`.
  - Übergib immer alle Argumente an die Section:
    `<f:render section="Content" arguments="{_all}" />`.
- Argumente werden als einfache Werte übergeben, z. B. `string`, `boolean`,
  `integer`. Komplexe Logik liegt außerhalb der Komponente in ViewHelpern,
  z. B. wird eine URL vorher generiert.
- Auf leere HTML-Attribute (z. B. `id=""`) muss nicht geachtet werden. Leere
  Attribute werden beim Rendern automatisch entfernt.

## Überschriften

- Der Inhalt der Überschrift wird als Argument übergeben, z. B.
  `<f:argument name="header" type="string" optional="{true}" />`.
- Der Überschriften-Typ wird immer als Argument übergeben, z. B.
  `<f:argument name="headerLayout" type="integer" optional="{true}" />`.
  - Der Typ ist immer ein Integer (1–6).
  - Der Typ aus dem HTML-Code darf als Default verwendet werden, z. B.
    `default="2"` für eine `<h2>`-Überschrift.
- Setze die Überschrift nie direkt ein, sondern verwende die Komponente
  `co:heading`:
  - `layout`: Überschriften-Typ als Integer (1–6; 0 = `<div>`)
  - `class`: CSS-Klassen aus dem HTML-Code (falls vorhanden)
  - Beispiel: `<h2 class="address__title">Stadt Unterschleißheim</h2>` wird
    `<co:heading layout="{headerLayout}" class="address__title">{header}</co:heading>`.

## CSS-Klassen

- Die Komponentenklasse (z. B. `button`) bleibt fest im Markup und wird nicht
  als Argument übergeben.
- Modifier werden als einzelner String übergeben und in der Komponente mit dem
  Prefix versehen, z. B. Argument `variant="primary"` → `button--{variant}`.
- Zum Sammeln von CSS-Klassen dient der ViewHelper `fo:cssClass`
  (`packages/ps14_foundation/Classes/ViewHelpers/CssClassViewHelper.php`):
  - Ist die Bedingung erfüllt, wird die Klasse an die Template-Variable
    angehängt; sonst passiert nichts. Doppelte Klassen werden entfernt.
  - Argumente:
    - `value`: der CSS-Klassen-String, z. B. `button--{variant}` (Pflicht)
    - `condition`: Bedingung, wann die Klasse hinzugefügt wird, z. B.
      `{variant}` (optional, ohne Angabe wird immer hinzugefügt)
    - `name`: Name der Template-Variable (optional, Default `class`)
  - Die gesammelte Variable wird im Markup ausgegeben:
    `class="button {class}"`.
- Verwende kein `f:format.raw`. Slots werden direkt per `<f:slot />`
  ausgegeben; HTML in String-Argumenten (z. B. Labels mit Link) wird mit
  `<f:sanitize.html>` ausgegeben.

## SVG-Icons

- Icons werden über den ViewHelper `fo:svg.inline` eingebunden, z. B.
  `<fo:svg.inline source="{icon}" class="button__icon" />`.
- Das Argument für das Icon ist immer ein String mit dem vollen EXT-Pfad zur
  SVG-Datei, z. B.
  `EXT:ps14_site/Resources/Private/Assets/Svg/Embed/check.svg`.
- Übernimm die Klassen des Icons (z. B. `button__icon`) und übergib sie per
  `class` an den ViewHelper, damit sie im generierten SVG-Code enthalten sind.
- Wird statisches HTML mit Inline-SVGs als Basis verwendet (mit Dateinamen im
  Kommentar, z. B. `<!-- phone.svg -->`):
  - Lege jedes SVG unter `Resources/Private/Assets/Svg/Embed/` ab. Der
    Dateiname entspricht dem Namen aus dem HTML-Kommentar. Existiert die Datei
    bereits, lege sie nicht erneut an.
  - Entferne dabei das `class`-Attribut aus der SVG-Datei.
  - Ersetze das Inline-SVG in der Komponente durch `fo:svg.inline`. Es kann
    mehrere SVGs in einer Datei geben — führe die Schritte für jedes SVG
    durch.

## Dokumentation

- **Erstelle keine Dokumentation während der Erstellung der Komponente.** Die
  Dokumentation wird nach der finalen Erstellung der Komponente geschrieben.
- Die Dokumentation ist immer auf Deutsch.

### Inline-Dokumentation in der Komponenten-Datei

```html
<f:comment>
<!--
    Dokumentation: Fluid-Komponente <co:badge>

    Parameter für <co:badge>:
    - variant: (string, optional) Modifier, z. B. "primary" → "badge--primary"
    - class: (string, optional) zusätzliche CSS-Klassen für den Badge

    Slot:
    - Standard-Slot: Inhalt des Badges

    Beispielhafte Aufrufe:
    <co:badge>Badge</co:badge>
    <co:badge variant="primary" class="my-class">Badge</co:badge>
-->
</f:comment>
```

### Anwenderdokumentation

- Übersicht: `docs/components.md` im Hauptrepo. Neue Komponenten werden in
  die bestehende Tabelle eingetragen.
- Komponentenname in der Tabelle: `Button.html` → `Button`,
  `Address/Header.html` → `Address.Header`.
- Spalten der Tabelle:
  1. Komponente: Name der Komponente
  2. Beschreibung: sehr kurze Beschreibung
  3. Dokumentation: Link auf die Einzeldokumentation

### Einzeldokumentation

- Ablage: `docs/components/<Komponente>.md`, z. B. `Button.md` oder
  `Address.Header.md`.
- Jede Einzeldokumentation enthält:
  1. **Beschreibung** — Was macht die Komponente?
  2. **Aufruf** — Basis-Syntax
  3. **Parameter** — Tabelle mit allen verfügbaren Parametern
  4. **Beispiele** — praxisnahe Code-Beispiele
  5. **Verwendung mit TYPO3-Daten** — Integration mit Content Blocks,
     Fluid-Variablen usw.
- Wird eine Komponente in `ps14_site` überschrieben, wird das in der
  Einzeldokumentation vermerkt.
