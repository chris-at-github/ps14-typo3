---
paths:
  - "packages/*/Resources/Private/**/*.html"
  - "packages/*/Resources/Private/Assets/Scss/**/*.scss"
---

# Frontend-Hierarchie: Page > Section > Modul > Komponente

## Definitionen

- **Page**: der äußere Seitenrahmen (Header, Main, Footer).
- **Section**: ein seitenbreiter Bereich, der Abstände, Laufweite und
  Farb-Theme steuert. Sections stylen niemals ihren eigenen Inhalt.
- **Modul**: ein ganzes Inhaltselement oder ein Abschnitt mit eigener
  Darstellung / eigenem Layout (z. B. Intro, Feature, Text-Media).
- **Komponente**: ein wiederverwendbarer Baustein innerhalb von Modulen (z. B.
  Button, Card, Badge, Link, Adresse).

Module liegen immer unter Sections. Beachte die Hierarchie:
Section > Modul > Komponenten.

## Page

Grundaufbau (dient nur der Orientierung und muss nicht 1:1 eingehalten
werden):

```html
<body class="page">
    <div class="page__header">
        <!-- Logo, Navigation, .. -->
    </div>
    <main class="page__main">
        <!-- Sections -->
    </main>
    <div class="page__footer">
        <!-- Footer Navigation, Copyright, Social Media Links -->
    </div>
</body>
```

- `.page__main` enthält keine horizontalen Abstände oder Laufweiten für
  Sections. Diese werden auf der Section selbst definiert.
- Füge den weiteren benötigten Aufbau selbstständig hinzu.

## Section

### HTML

- Neue CSS-Klassen für Themes oder Varianten sind erlaubt.
- Erstelle KEINE (BEM-)Blöcke direkt auf `.section` oder `.section__inner`.
- Erstelle Module direkt unterhalb von `.section__inner` (bzw. `.section`).
  Erweitere diese Klassen nicht.
- Sections auf oberster Ebene (direkt im `main`-Tag) erhalten die Klasse
  `.section--outer`.

```html
<section class="section section--outer">
    <div class="section__inner">
        <!-- html -->
    </div>
</section>
```

### Abstände und Laufweiten

Definiert in `layout/_section.scss`:

```scss
.section--outer {
    padding-left: var(--container-spacing-x);
    padding-right: var(--container-spacing-x);
}

.section__inner {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
    container-type: inline-size;
}
```

- **ACHTUNG:** Diese Regeln sind vordefiniert und müssen nicht bearbeitet
  werden.
- Setze keine Breiten auf die Sections.
- Setze keine Abstände auf die Sections.

### Farben und Theme

Theme-Modifier:

```scss
.section--theme-primary {
    --color-theme-background: var(--color-...);
    --color-theme-font: var(--color-...);

    background-color: var(--color-theme-background);
}
```

Ein gemeinsamer Selektor außerhalb des `.section`-Blocks setzt `color` für
alle Theme-Modifier automatisch:

```scss
[class*="section--theme-"] {
    color: var(--color-theme-font);
}
```

Regeln:

- Farbregeln werden per Modifier `.section--theme-<name>` definiert.
- **Verwende, falls definiert, die CSS Custom Properties** aus
  `bootstrap/_root.scss` für die Farbanpassung.
- **Überschreibe innerhalb des Theme-Modifiers die CSS Custom Properties**,
  statt Unterelemente direkt zu selektieren.
- Definiere pro Theme immer diese beiden semantischen Tokens:
  - `--color-theme-background` → Hintergrundfarbe der Section
  - `--color-theme-font` → Textfarbe (Überschriften, Fließtext, Icons)
- Setze `background-color: var(--color-theme-background)` direkt im
  Theme-Modifier.
- `color: var(--color-theme-font)` wird **nicht** im Modifier gesetzt, sondern
  greift automatisch über den gemeinsamen `[class*="section--theme-"]`-Selektor.
- Überschreibe **keine** globalen Basis-Variablen (z. B. die neutrale
  Farbpalette) innerhalb eines Theme-Modifiers — verwende stattdessen die
  semantischen Theme-Tokens.
- Optional: `--color-primary` → Linkfarbe, Akzentfarbe.

## Modul

- Wenn es ein Modul bereits gibt, erweitere die Zieldatei um die neue Variante
  oder den neuen Modifier. Erstelle in diesem Fall keine neue Datei.
- Frage mich, bevor du ein neues Modul erstellst.
- Gib jedem Modul einen eindeutigen Namen, z. B. `feature-cards` (SCSS:
  `modules/_feature-cards.scss`).
- Das Padding der Module auf dem Root-Level ist bereits über `section__inner`
  definiert.
- Die Grundfarben für Hintergrund (`--color-theme-background`) und Schrift
  (`--color-theme-font`) sind bereits über die Section definiert. Definiere sie
  im Modul nur, falls sie abweichen.

### Komponenten in Modulen

- **Verwende bestehende Komponenten in Modulen.**
- Komponenten in Modulen dürfen eine eigene BEM-Elementklasse des Moduls
  haben, z. B. `button feature__link`.
- Füge Abweichungen von der Standard-Komponente entweder als Modifier oder als
  BEM-Elementklasse hinzu, z. B. `button feature__link`.
- Wenn der Aufbau zu sehr von der Standard-Komponente abweicht, erstelle nur
  ein BEM-Element ohne die Standard-Komponenten-Klasse, z. B. `feature__link`.
- Style-Erweiterungen für Komponenten innerhalb eines Moduls erfolgen **nie**
  über Descendant-Selektoren wie `.modul-name .button`. Verwende stattdessen
  eine BEM-Elementklasse am HTML-Element (z. B. `contact-bar__button`) und
  selektiere diese im Modul-SCSS (z. B. `&__button { ... }`).
- Wenn Buttons innerhalb eines Moduls den verfügbaren Platz gleichmäßig
  aufteilen sollen (z. B. je 50 %), setze `flex: 1` auf `.button-group__item`
  (und `width: 100%` auf `.button`) innerhalb des Modul-Selektors — nie in
  `_button.scss`:

  ```scss
  .modul-name {
      &__actions {
          .button-group__item {
              flex: 1;
          }
      }
  }
  ```

## Komponente

- Wenn es eine Komponente bereits gibt, erweitere die Zieldatei um die neue
  Variante oder den neuen Modifier. Erstelle in diesem Fall keine neue Datei.
- Frage mich, bevor du eine neue Komponente erstellst.
- Gib jeder Komponente einen eindeutigen Namen, z. B. `button` (SCSS:
  `components/_button.scss`).
- Falls für die Komponente eine Gruppierung vorgesehen ist, erstelle den
  zugehörigen Gruppen-Code (siehe `*-group`-Muster in
  [html-bem.md](html-bem.md)) und füge die Komponente hinzu. Gibt es bereits
  eine Gruppierung, füge die neue Variante dieser Gruppe hinzu.
