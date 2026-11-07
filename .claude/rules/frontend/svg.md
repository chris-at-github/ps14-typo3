---
paths:
  - "packages/*/Resources/Private/**/*.html"
  - "packages/*/Resources/Private/Assets/Scss/**/*.scss"
  - "packages/*/Resources/Private/Assets/Svg/**/*.svg"
---

# SVG-Icons

- Verwende für Icons SVG-Dateien.
- SVG-Quelldateien liegen unter `Resources/Private/Assets/Svg/` der jeweiligen
  Extension, getrennt nach Verwendung:

  | Ordner | Verwendung |
  |---|---|
  | `Svg/Embed/` | SVGs, die per `fo:svg.inline` inline in das HTML eingebettet werden, z. B. `<fo:svg.inline source="EXT:ps14_site/Resources/Private/Assets/Svg/Embed/logo.svg" />` |
  | `Svg/Font/` | Icons für den Icon-Font (nur `ps14_site`); nach dem Ablegen den Font mit `ddev exec node build/build-iconfont.js` neu generieren |

- Lege projektspezifische SVGs in `ps14_site` ab, allgemeine SVGs für alle
  Projekte in `ps14_foundation`.
- SVGs werden nicht unter `Resources/Public/` abgelegt. Ausnahme: Ein SVG
  muss öffentlich per URL erreichbar sein (z. B. Favicon unter
  `Resources/Public/Icons/`).
- Verzichte auf `width`- und `height`-Attribute. Verwende stattdessen das
  Attribut `viewBox`.
- Der SVG-Code darf zusätzliche CSS-Klassen je nach Block oder Element
  enthalten (z. B. `button__icon`).
- SVGs müssen ihre originale Struktur behalten. Es dürfen keine Gruppen oder
  Pfade entfernt oder zusammengeführt werden, auch wenn sie redundant
  erscheinen. Alle Gruppen und Pfade müssen im SVG-Code erhalten bleiben.
- Verwende in SVGs `stroke="currentColor"` bzw. `fill="currentColor"` statt
  fester Farben oder Variablen wie `stroke="var(--color-extra)"`, damit die
  Farbe automatisch vom Theme vererbt wird. Dann reicht es, `color` auf dem
  Container zu setzen — das SVG folgt automatisch.
- Dekorative Icons erhalten `aria-hidden="true"`. Icons, die allein (ohne
  sichtbaren Text) eine Bedeutung tragen, brauchen eine zugängliche
  Beschreibung am umgebenden interaktiven Element (`aria-label`).
- Hinterlege in statischem HTML-Markup immer den Dateinamen als HTML-Kommentar
  vor einem Inline-SVG, z. B. `<!-- check.svg -->`.
