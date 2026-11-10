---
paths:
  - "packages/*/Resources/Private/Templates/Content/**"
  - "packages/*/Resources/Private/Partials/**/Layout/**"
---

# Content-Templates

## Ablage

- Projektspezifische Templates für Inhaltselemente liegen in
  `packages/ps14_site/Resources/Private/Templates/Content/` und überschreiben
  die gleichnamigen Templates aus `ps14_foundation` (Key `110` in
  `lib.contentElement.templateRootPaths`).
- Partials für Varianten liegen in
  `packages/ps14_site/Resources/Private/Partials/Content/<Gruppe>/Layout/<Variante>.html`,
  z. B. `Partials/Content/Menu/Layout/Default.html`.

## Varianten-Weiche

- Die Variante steht im Feld `tx_foundation_variant`. Es ist nie leer; ohne
  Auswahl ist der Wert immer `default`. Prüfe nicht auf einen leeren Wert.
- Die Weiche liegt im Template. Es lädt das Partial, dessen Name die
  Variante in PascalCase ist. Fehlt das Partial, wird zwischen den Tags von
  `f:render` das Default-Partial gerendert:

  ```html
  <f:render partial="Content/Menu/Layout/{data.tx_foundation_variant -> fo:format.pascalCase()}" section="Main" optional="{true}" arguments="{_all}">
      <f:render partial="Content/Menu/Layout/Default" section="Main" arguments="{_all}" />
  </f:render>
  ```

  - `optional="{true}"` ist Pflicht, damit eine Variante ohne Partial auf
    `Default` zurückfällt.
  - Die Ausgabe der Default-Variante liegt immer in
    `Partials/Content/<Gruppe>/Layout/Default.html` mit
    `<f:section name="Main">`, nie direkt im Template.
- Eine neue Variante besteht aus:
  - dem Eintrag im Feld `tx_foundation_variant` per TSconfig
    (`TCEFORM.tt_content.tx_foundation_variant.types.<CType>.addItems`),
  - dem Partial `Partials/Content/<Gruppe>/Layout/<Variante>.html` mit
    `<f:section name="Main">`.

## Navigationen (Menü-Inhaltselemente)

- Menüs werden immer mit der Komponente `co:navigation` ausgegeben. Die
  Logik für den zugänglichen Namen (`aria-label` oder `aria-labelledby`)
  liegt in der Komponente — baue sie nicht im Template nach.
- Die Überschrift des Inhaltselements wird als `co:navigation.title`
  innerhalb der Navigation ausgegeben und über die gemeinsame `id` mit der
  `<nav>` verknüpft. Unterdrücke dafür die Überschrift des Layouts mit
  `<f:section name="Header" />`, sonst erscheint sie doppelt.
- Die `id` wird im Template erzeugt und über `{_all}` an die Partials
  übergeben: `<f:variable name="id">navigation--{fo:randomId()}</f:variable>`.
- Template (`Templates/Content/MenuPages.html` in `ps14_menu`):

  ```html
  <f:layout name="Default" />
  <f:section name="Header" />

  <f:section name="Main">
      <f:variable name="id">navigation--{fo:randomId()}</f:variable>

      <f:render partial="Content/Menu/Layout/{data.tx_foundation_variant -> fo:format.pascalCase()}" section="Main" optional="{true}" arguments="{_all}">
          <f:render partial="Content/Menu/Layout/Default" section="Main" arguments="{_all}" />
      </f:render>
  </f:section>
  ```

- Default-Partial (`Partials/Content/Menu/Layout/Default.html`, Linkliste):

  ```html
  <f:section name="Main">
      <f:if condition="{menu}">
          <co:navigation title="{data.header}" titleType="{data.header_layout}" id="{id}">
              <co:navigation.title id="{id}" type="{data.header_layout}" class="heading">{data.header}</co:navigation.title>
              <co:navigation.list>
                  <f:for each="{menu}" as="page">
                      <co:navigation.list.item link="{page.link}" target="{page.target}" current="{page.current}">{page.title}</co:navigation.list.item>
                  </f:for>
              </co:navigation.list>
          </co:navigation>
      </f:if>
  </f:section>
  ```

- Die Basis-Templates und -Partials der Menüs (`MenuPages.html`,
  `MenuSubpages.html`, `Content/Menu/Layout/Default|Listing|Icon.html`)
  liefert `ps14_menu` (Key `108`). In `ps14_site` liegen nur
  Überschreibungen und projektspezifische Varianten.
- `ps14_menu` stellt die FlexForm-Optionen als `{options}` bereit
  (`includeNotInMenu`, `showIcon`, `showDescription`) und das Seiten-Icon
  als `{page.icon.0}`.
- Markup und SCSS der Linkliste folgen
  `.claude/rules/frontend/components/navigation-list.md`.
