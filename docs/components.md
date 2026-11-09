# Fluid-Komponenten

Die Extension `ps14_component` stellt wiederverwendbare Komponenten auf Basis
von Fluid Components bereit. Sie werden in Fluid-Templates verwendet, um
konsistente UI-Elemente zu erzeugen. Regeln zur Erstellung neuer Komponenten:
`.claude/rules/typo3/fluid-components.md`.

## Verfügbare Komponenten

| Komponente | Beschreibung | Dokumentation |
|---|---|---|
| **Badge** | Vielseitiges Label-Element (Badge, Pill, Tag) als Text, Link oder Button – mit optionalen Icons | [Badge.md](components/Badge.md) |
| **Card** | Rendert eine Card als verlinktes oder nicht verlinktes Element – mit Slots für Bild, Inhalt und Aktionen | [Card.md](components/Card.md) |
| **Card.Image** | Rendert den Bildbereich einer Card – unterstützt Bild-Objekte (responsive) und Icons | [Card.Image.md](components/Card.Image.md) |
| **Media.Container** | Rendert ein Bild mit responsivem Verhalten, optionalem Seitenverhältnis, Bildbeschreibung und Copyright | [Media.Container.md](components/Media.Container.md) |
| **Button** | Standard-Button mit optionalen Prefix- und Suffix-Icons sowie Varianten | [Button.md](components/Button.md) |
| **Button.Icon** | Reiner Icon-Button mit Aria-Label für Barrierefreiheit | [Button.Icon.md](components/Button.Icon.md) |
| **Heading** | Rendert eine Überschrift als `<h1>`–`<h6>` oder `<div>` mit optionalem Link und Varianten | [Heading.md](components/Heading.md) |
| **Form.Textfield** | Standard-Text-Eingabefeld mit Label, optionaler Beschreibung und Fehlermeldungen | [Form.Textfield.md](components/Form.Textfield.md) |
| **Form.Textarea** | Mehrzeiliges Texteingabefeld (`<textarea>`) mit Label, optionaler Beschreibung und Fehlermeldungen | [Form.Textarea.md](components/Form.Textarea.md) |
| **Form.Select** | Auswahlfeld (`<select>`) mit Label, optionaler Beschreibung, Fehlermeldungen und dynamischen Optionen | [Form.Select.md](components/Form.Select.md) |
| **Form.Checkbox** | Einzelne Checkbox mit Label (auch HTML), optionalem Hidden-Feld, Pflicht- und Fehlerausgabe | [Form.Checkbox.md](components/Form.Checkbox.md) |
| **Form.Checkbox.Group** | Gruppe von Checkboxen mit gemeinsamem Label, Mehrfachauswahl, Beschreibung und Fehlermeldungen | [Form.Checkbox.Group.md](components/Form.Checkbox.Group.md) |
| **Form.Radio** | Einzelner Radio-Button mit Label (auch HTML), Pflicht- und Fehlerausgabe | – |
| **Form.Radio.Group** | Gruppe von Radio-Buttons mit gemeinsamem Label, Einzelauswahl, Beschreibung, Varianten und Fehlermeldungen | [Form.Radio.Group.md](components/Form.Radio.Group.md) |
| **Form.Group.Choice** | Slot-basierter `<fieldset>`-Wrapper für Choice-Gruppen (Checkbox, Radio) mit Label, Beschreibung und Fehlermeldungen | [Form.Group.Choice.md](components/Form.Group.Choice.md) |
| **Form.Upload** | Datei-Upload-Feld mit Label, Beschreibung, Mehrfach-Upload, Dateifilter und Fehlermeldungen | [Form.Upload.md](components/Form.Upload.md) |
| **Form.Item.Default** | Container für Standard-Formularfelder mit Label, Beschreibung, Slot und Fehlerausgabe | [Form.Item.Default.md](components/Form.Item.Default.md) |
| **Form.Item.Choice** | Container für Choice-Felder (Checkbox, Radio) – Slot vor dem Label, BEM-Modifier per `type` | [Form.Item.Choice.md](components/Form.Item.Choice.md) |
| **Form.Item.Select** | Container für Select-Felder – wrappt Slot in `form-item-container--select` für Custom-Dropdown-Styling | [Form.Item.Select.md](components/Form.Item.Select.md) |
| **Form.Item.Datepicker** | Container für Datumsfelder – wrappt Slot in `form-item-container--datepicker` und ergänzt einen barrierefreien Button, der den nativen Datepicker öffnet | [Form.Item.Datepicker.md](components/Form.Item.Datepicker.md) |
| **Form.Label** | Rendert ein Label für Formularfelder mit optionalem Pflichtfeld-Hinweis | [Form.Label.md](components/Form.Label.md) |
| **Form.Description** | Rendert einen Beschreibungstext für Formularfelder | [Form.Description.md](components/Form.Description.md) |
| **Form.Error** | Rendert Fehlermeldungen für Formularfelder als Liste oder Einzelnachricht | [Form.Error.md](components/Form.Error.md) |
| **Accordion** | Rendert eine aufklappbare Liste als Container für Accordion-Items mit optionalen Varianten | [Accordion.md](components/Accordion.md) |
| **Accordion.Item** | Rendert ein einzelnes aufklappbares Element mit Toggle-Button, Überschrift, Icon und ARIA-Unterstützung | [Accordion.Item.md](components/Accordion.Item.md) |
| **Richtext** | Rendert HTML-Inhalte aus TYPO3-Feldern in einem Container mit BEM-Klassen | [Richtext.md](components/Richtext.md) |
| **Icon.Container** | Gibt ein Icon (SVG-Pfad oder FileReference) in einem Container mit optionalem Seitenverhältnis und ARIA-Label aus | – |
| **Navigation** | `<nav>`-Container für Navigationen mit zugänglichem Namen per `aria-label` oder `aria-labelledby` | [Navigation.md](components/Navigation.md) |
| **Navigation.Title** | Sichtbare Überschrift einer Navigation, Bezug für `aria-labelledby` | [Navigation.Title.md](components/Navigation.Title.md) |
| **Navigation.List.Item** | Link einer Navigation List (Linkliste, Sitemap) mit optionalem Icon | [Navigation.List.Item.md](components/Navigation.List.Item.md) |

## Quick Start

### 1. Namespace hinzufügen

```html
<html
    xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers"
    xmlns:co="http://typo3.org/ns/Ps14/Component/Components/ComponentCollection"
    data-namespace-typo3-fluid="true">
```

### 2. Komponente verwenden

```html
<co:badge prefixIcon="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/check.svg">DSGVO-konform</co:badge>
```

### 3. Mit TYPO3-Daten

```html
<f:for each="{categories}" as="category">
    <co:badge>{category.title}</co:badge>
</f:for>
```

## Projektspezifische Komponenten und Überschreibungen

Die `ComponentCollection` von `ps14_component` lädt Komponenten aus zwei
Template-Root-Pfaden:

1. `packages/ps14_component/Resources/Private/Components/` (Basis)
2. `packages/ps14_site/Resources/Private/Components/` (Projekt, falls
   `ps14_site` installiert ist)

Eine Datei in `ps14_site` mit demselben relativen Pfad (z. B. `Button.html`)
überschreibt die Basis-Komponente; neue Dateien stehen als zusätzliche
Komponenten zur Verfügung. Eine eigene `ComponentCollection` oder ein anderer
Namespace ist dafür nicht nötig.

## ViewHelper

| ViewHelper | Herkunft | Zweck |
|---|---|---|
| `fo:cssClass` | `ps14_foundation` | CSS-Klassen bedingt in einer Template-Variable sammeln |
| `fo:svg.inline` | `ps14_foundation` | SVG-Datei inline einbetten (`source` = voller EXT-Pfad oder FileReference) |
| `fo:randomId` | `ps14_foundation` | Zufällige ID, z. B. für `id`/`for` von Formularfeldern |
| `fo:heading.auto` | `ps14_foundation` | Überschriftenebene für Kind-Elemente aus `header_layout` und `tx_foundation_elements_header` |
| `fo:iterable.contains` | `ps14_foundation` | Prüft, ob ein Wert in einem Array enthalten ist |
| `fo:media.responsive` | `ps14_foundation` | Responsives Bild mit `srcset` |
| `cv:slot` | `ps14_component` | Erweiterter `f:slot` mit `variables` („Scoped Slots“), Namespace `http://typo3.org/ns/Ps14/Component/ViewHelpers` |

## Commands nach Installation oder Konfigurationsänderungen

1. `ddev typo3 cache:flush`
2. `ddev typo3 extension:setup -e ps14_component`

## Weiterführende Informationen

- Fluid Components: https://docs.typo3.org/other/typo3fluid/fluid/main/en-us/Usage/Components.html
- TYPO3 Fluid: https://docs.typo3.org/m/typo3/reference-coreapi/main/en-us/ApiOverview/Fluid/Index.html
