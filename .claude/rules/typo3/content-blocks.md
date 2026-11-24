---
paths:
  - "packages/*/ContentBlocks/**"
  - "packages/*/Configuration/TCA/Overrides/tt_content.php"
  - "packages/*/Configuration/TypoScript/**"
---

# Content Blocks

Inhaltselemente mit eigenen Feldern oder Items werden als Content Blocks
(`friendsoftypo3/content-blocks`) umgesetzt. Referenz: `ps14_modules`
(Akkordeon), Readme des Pakets.

## Ablage

- Generische Module (in mehreren Projekten nutzbar) liegen in `ps14_modules`,
  projektspezifische in `ps14_site` (`ContentBlocks/ContentElements/<name>/`).
- Ersetzt ein Content Block ein bestehendes Modul, bleibt der CType erhalten
  (`typeName`), damit Inhalte, TSconfig und Rechte gültig bleiben.
- Texte stehen in `language/labels.xlf` und `de.labels.xlf` (Konvention von
  Content Blocks, z. B. `title`, `<feld>.label`), nicht als `label` in der
  `config.yaml`.
- `Resources/Public/ContentBlocks/` erzeugt Content Blocks selbst (mit eigener
  `.gitignore`); nie committen oder bearbeiten.

## Felder

- Binde die gemeinsamen Basics aus `ps14_modules` ein statt die Felder zu
  wiederholen:
  - `Ps14/Header` unter `fields` (`- identifier: Ps14/Header` /
    `type: Basic`): Palette wie die Core-Palette `headers`.
  - `Ps14/Appearance` unter `basics`: Tabs Erscheinungsbild (Rahmen,
    Abstände, Links) und Kategorien. Ohne ihn fehlt der Tab, und die
    Paletten von ps14_foundation landen am Ende des Formulars.
- `useExistingField` funktioniert nur für Felder aus dem Basis-TCA (Core,
  `Configuration/TCA/<tabelle>.php`). Content Blocks kompiliert vor den
  TCA-Overrides; Felder, die erst dort entstehen (z. B.
  `tx_foundation_elements_header`, `tx_foundation_section_menu_title`), führen
  zu `field "…" is missing the required "type"`. Füge sie in
  `Configuration/TCA/Overrides/tt_content.php` per
  `ExtensionManagementUtility::addFieldsToPalette()` ein. Die Paletten heißen
  `<CType>_<Paletten-Identifier>` (z. B. `ps14_accordion_headers`,
  `ps14_accordion_links_palette`); `addToAllTCAtypes` setzt das Feld hinter
  die Palette statt hinein.
- Felder einer Collection bekommen das Präfix des Content Blocks
  (`ps14_accordion_items`); Record Types mit eigener Tabelle setzen
  `prefixFields: false`.
- Projektspezifische Zusatzfelder an Tabellen eines Pakets (z. B. Druckfelder)
  kommen per TCA-Override in `ps14_site` mit Präfix `tx_site_`.

## Items und verschachtelte Inhalte

- Items mit mehreren Typen sind Record Types (`ContentBlocks/RecordTypes/`)
  mit gemeinsamer `table` und `typeField`; die Collection im Inhaltselement
  verweist per `foreign_table` darauf.
- Verschachtelte Inhaltselemente: Collection mit `foreign_table: tt_content`,
  `foreign_field: tx_foundation_parent`,
  `foreign_table_field: tx_foundation_parent_table` und
  `shareAcrossTables: true` (mehrere Item-Tabellen nutzen dieselben Spalten).

## Rendering

- Kein `templates/frontend.html` im Content Block. Das Inhaltselement wird in
  `Configuration/TypoScript/setup.typoscript` der Extension definiert:

  ```typoscript
  tt_content.ps14_accordion =< lib.contentElement
  tt_content.ps14_accordion {
    templateName = Accordion
    templateRootPaths.50 = EXT:ps14_modules/Resources/Private/Templates/Content/
    partialRootPaths.50 = EXT:ps14_modules/Resources/Private/Partials/
    dataProcessing.10 = record-transformation
    dataProcessing.10.as = record
  }
  ```

  So bleiben das Layout `Default` und die Processors von ps14_foundation
  (`{data}` als Array) erhalten; Relationen stehen in `{record}`
  (z. B. `{record.ps14_accordion_items}`, `{item.recordType}`).
- Der Processor `content-blocks` wird nicht verwendet: er ersetzt `{data}`
  durch ein Objekt, das die foundation-Layouts nicht verarbeiten.
- Verschachtelte Inhaltselemente mit
  `<f:cObject typoscriptObjectPath="tt_content" data="{child}" table="tt_content" />`
  rendern, nie mit `f:format.raw`.
- Projekte überschreiben Templates und Partials mit Key `110`
  (`ps14_site/Configuration/TypoScript/Extensions/<Extension>.setup.typoscript`).
