---
paths:
  - "packages/*/Resources/Private/**/*.html"
  - "packages/*/Resources/Private/Assets/Scss/**/*.scss"
---

# HTML-Markup und BEM

## Komponenten-Spezifikationen

Lies vor dem Erstellen oder Verwenden einer dieser Komponenten zusätzlich zu
den allgemeinen Regeln ihre Spezifikation:

| Komponente | Andere Bezeichnungen | Spezifikation |
|---|---|---|
| Link | Textlink, Weiterlesen-Link | [components/link.md](components/link.md) |
| Button | Icon-Button, Button-Gruppe | [components/button.md](components/button.md) |
| Card | Kachel, Teaser | [components/card.md](components/card.md) |
| Badge | Pill, Tag | [components/badge.md](components/badge.md) |
| Adresse | Standort, Kontakt | [components/address.md](components/address.md) |
| Navigation List | Linkliste, Sitemap, Auflistung interner Links, „Mehr zum Thema“ | [components/navigation-list.md](components/navigation-list.md) |
| Richtext | Fließtext, RTE-Inhalt | [components/richtext.md](components/richtext.md) |

Weitere Regeln: [hierarchy.md](hierarchy.md) (Page, Section, Modul,
Komponente), [scss.md](scss.md), [svg.md](svg.md),
[interaction-states.md](interaction-states.md).

## BEM

- Erstelle CSS-Klassen im HTML immer im BEM-Style.
- Verwende für bestehende Komponenten die vorgefertigten Klassen.
- Neue Modifier hinzuzufügen ist erlaubt.
- Eigene zusätzliche Klassen für den Block oder das Element sind erlaubt.
- Erstelle Erweiterungen für Farben oder Varianten immer als Modifier
  `block--modifier`, z. B. `button button--primary` für einen Primärbutton.
- Verwende **keine** Utility-Klassen. Schreibe die Angaben direkt in die
  Zielklassen oder als Modifier, z. B. `button button--primary`.
  **Nicht:** `button button--primary text-xl font-semi-bold`.

## Gruppierungen

- Lege Gruppierungen (Auflistungen von Komponenten oder Einträgen innerhalb
  eines Moduls) in Listenstrukturen mit `<ul>`- und `<li>`-Elementen ab.
- Komponenten-Gruppen folgen immer diesem Muster; ein eigener Modifier je nach
  Einsatzzweck ist erlaubt. Setze die Komponenten-Klasse NIE direkt auf das
  `<li>`-Tag:

  ```html
  <ul class="button-group button-group--modifier">
      <li class="button-group__item">
          <!-- Komponenten-HTML -->
      </li>
      <li class="button-group__item">
          <!-- Komponenten-HTML -->
      </li>
  </ul>
  ```

## Überschriften

- Verwende so sinnvoll wie möglich `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>` für
  Titel und Überschriften, z. B. `<h2 class="feature__title">Titel</h2>`.
- Halte sie in der richtigen Reihenfolge und lasse keine Stufe aus.
- Setze NIE Styles direkt auf ein H-Tag. Verwende hierfür immer Klassen.

## Fließtext

- Wrappe Fließtext in einen `.richtext`-Container — einmal um den ganzen Text,
  nicht einzeln um jedes Tag. Details:
  [components/richtext.md](components/richtext.md).

## Bilder

- Verwende für Beispielbilder sprechende Dateinamen, z. B.
  `contact-person.jpg`.
