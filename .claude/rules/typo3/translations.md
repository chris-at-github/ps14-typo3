---
paths:
  - "packages/*/Resources/Private/Language/**/*.xlf"
  - "packages/*/Resources/Private/Layouts/**/*.html"
  - "packages/*/Resources/Private/Templates/**/*.html"
  - "packages/*/Resources/Private/Partials/**/*.html"
  - "packages/*/Resources/Private/Components/**/*.html"
---

# Sprachdateien und Übersetzungen

## Sprachdateien

- Frontend-Texte liegen in der Sprachdatei der Extension, zu der das
  Template gehört:
  - Englisch (Original): `EXTENSION_DIR/Resources/Private/Language/locallang.xlf`
  - Deutsch: `EXTENSION_DIR/Resources/Private/Language/de.locallang.xlf`
  - Falls nicht vorhanden, lege sie an.
- Die Datei `locallang.xlf` entspricht der Translation Domain
  `<extension_key>.messages`, z. B. `ps14_site.messages` oder
  `ps14_foundation.messages`.
- Neue Frontend-Labels kommen in `locallang.xlf`, nicht in die bestehenden
  `locallang_frontend.xlf`-Dateien.

## Fest verbaute Texte auslagern

- Suche in folgenden Dateien nach Texten, die fest in den Templates verwendet
  werden:
  - `EXTENSION_DIR/Resources/Private/Layouts/**/*.html`
  - `EXTENSION_DIR/Resources/Private/Templates/**/*.html`
  - `EXTENSION_DIR/Resources/Private/Partials/**/*.html`
  - `EXTENSION_DIR/Resources/Private/Components/**/*.html`
- Trage sie mit einem sinnvollen Key in die Sprachdatei ein.
  - Muster für Keys: `group-name.key-name`, z. B. `page-header.main-headline`.
  - Verzichte auf umständliche Keys wie
    `tx_datamintsaddress_domain_model_address.name`. Verwende stattdessen
    sinnvolle Schlüsselnamen wie `address.name`.
- Die Texte stehen auf Deutsch im Template. Übersetze sie ins Englische und
  trage sie in `locallang.xlf` ein; der deutsche Text kommt als `target` in
  `de.locallang.xlf`.
- Setze die Texte mit dem `f:translate`-ViewHelper wieder in die Templates
  ein.

## Syntax

- Verwende im `f:translate`-ViewHelper die moderne Domain-Syntax. Eine
  Pfadangabe (`LLL:EXT:…`) ist nicht notwendig:
  `<f:translate key="key-name" domain="ps14_site.messages" />`
- In Attributen bzw. Strings (`""`) verwende die Inline-Syntax:
  `{f:translate(key: 'key-name', domain: 'ps14_site.messages')}`
- Verwende statt `ps14_site.messages` immer die Domain der Extension, zu der
  das Template gehört.
